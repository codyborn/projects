const { App } = require('@slack/bolt')
const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
require('dotenv').config()

const logger = require('./utils/logger')
const config = require('./config/config')
const { setupDatabase } = require('./database/connection')
const { runMigrations } = require('./database/migrate')
const { handleGrassCommand, handleLeaderboardCommand } = require('./handlers/slackHandlers')
const leaderboardService = require('./services/leaderboardService')

// Initialize Slack app
const slackApp = new App({
  token: config.slack.botToken,
  signingSecret: config.slack.signingSecret,
  socketMode: true,
  appToken: config.slack.appToken,
  port: config.server.port
})

// Initialize Express app
const expressApp = express()

// Heroku/Proxies: trust X-Forwarded-For for rate limit keying
expressApp.set('trust proxy', 1)

// Middleware
expressApp.use(helmet())
expressApp.use(cors())
expressApp.use(express.json())
expressApp.use(express.urlencoded({ extended: true }))

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: 'Too many requests from this IP, please try again later.'
})
expressApp.use('/slack/', limiter)

// Health check endpoint
expressApp.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() })
})

// Slack event handlers
function containsGrassKeyword (text) {
  const value = (text || '').toLowerCase()
  if (!value) return false
  return (
    /(^|[\s\(\[\{'"`])#?grass([\s\)\]\}'"`]|$)/i.test(value) ||
    value.includes(':grass:')
  )
}

slackApp.message(async ({ message, client }) => {
  try {
    // Award when a user posts a photo and the message includes a grass keyword
    const baseText = (message.text || '')
    const fileTexts = (message.files || []).flatMap(f => {
      const initial = (f.initial_comment && f.initial_comment.comment) ? f.initial_comment.comment : ''
      const title = f.title || ''
      const name = f.name || ''
      return [initial, title, name]
    })
    const combined = [baseText, ...fileTexts].join(' ')
    const hasKeyword = containsGrassKeyword(combined)

    // Slack sends subtype 'file_share' for uploads; ensure we handle that too
    const hasFiles = Array.isArray(message.files) && message.files.length > 0

    if (hasKeyword && hasFiles) {
      await handleGrassCommand(message, client)
    }
  } catch (error) {
    logger.error('Error processing message:', error)
  }
})

// Handle file_shared events (some uploads arrive as file_shared, not message with files)
slackApp.event('file_shared', async ({ event, client }) => {
  try {
    const fileId = event.file_id
    if (!fileId) return

    const info = await client.files.info({ file: fileId })
    const file = info.file
    if (!file) return

    // Build combined text from initial comment/title/name
    const initial = (file.initial_comment && file.initial_comment.comment) ? file.initial_comment.comment : ''
    const title = file.title || ''
    const name = file.name || ''
    const combined = [initial, title, name].join(' ')
    if (!containsGrassKeyword(combined)) return

    // Find a channel where it was shared (public or private)
    let channelId
    if (file.shares) {
      if (file.shares.public) {
        const publicChannels = Object.keys(file.shares.public)
        if (publicChannels.length > 0) channelId = publicChannels[0]
      }
      if (!channelId && file.shares.private) {
        const privateChannels = Object.keys(file.shares.private)
        if (privateChannels.length > 0) channelId = privateChannels[0]
      }
    }
    if (!channelId && Array.isArray(file.channels) && file.channels.length > 0) {
      channelId = file.channels[0]
    }
    if (!channelId) return

    // Build combined text for user comment (excluding grass keywords)
    const userCommentText = [initial, title].filter(t => {
      if (!t) return false
      const value = t.toLowerCase()
      return !/(^|\s)#?grass(\s|$)/i.test(value) && !value.includes(':grass:')
    }).join(' ').trim()

    const messageLike = {
      user: file.user,
      channel: channelId,
      ts: String(file.timestamp || file.created || Date.now() / 1000),
      text: userCommentText,
      files: [
        {
          url_private: file.url_private,
          permalink: file.permalink,
          title: file.title,
          initial_comment: file.initial_comment
        }
      ]
    }

    await handleGrassCommand(messageLike, client)
  } catch (error) {
    logger.error('Error handling file_shared event:', error)
  }
})

// Handle bot mentions
slackApp.event('app_mention', async ({ event, client }) => {
  try {
    await client.chat.postMessage({
      channel: event.channel,
      text: ':grass: Hi! I\'m the Touching Grass Bot. I help track who\'s getting outside and touching grass!\n\nTo use me:\n• Post photos with `#grass` in the caption to earn points\n• Use `/leaderboard` to see current rankings\n\nLet\'s get outside and touch some grass! 🌿',
      thread_ts: event.ts
    })
  } catch (error) {
    logger.error('Error handling app mention:', error)
  }
})

// Handle reaction_added events
slackApp.event('reaction_added', async ({ event, client }) => {
  try {
    // Only track reactions to messages
    if (event.item.type !== 'message') {
      logger.debug(`Reaction not to message, type: ${event.item.type}`)
      return
    }

    const { reaction, item } = event

    // Log all reactions for debugging
    logger.info(`Reaction added: ${reaction} to message ${item.ts} in channel ${item.channel}`)

    // Check if it's a +2 reaction (:+2-thumbs: emoji)
    // Reaction name could be '+2', 'thumbsup_all', or variants
    // The :+2-thumbs: emoji is actually called 'thumbsup_all' in Slack API
    const normalizedReaction = reaction.toLowerCase()
    const isPlus2 = normalizedReaction === '+2' ||
                    normalizedReaction.includes('+2') ||
                    normalizedReaction === 'thumbsup_all' ||
                    normalizedReaction.includes('thumbsup_all') ||
                    normalizedReaction === '+1::skin-tone-6' ||
                    normalizedReaction.includes('thumbsup')

    if (!isPlus2) {
      logger.debug(`Reaction ${reaction} is not a +2 reaction, skipping`)
      return
    }

    logger.info(`Detected +2 reaction: ${reaction} (normalized: ${normalizedReaction})`)

    const photoService = require('./services/photoService')
    const userService = require('./services/userService')

    // Check if photo record already exists
    let photo = await photoService.getPhotoByMessageTsAndChannel(item.ts, item.channel)

    if (!photo) {
      // Get the message to find the author
      let messageAuthor = null
      try {
        const result = await client.conversations.history({
          channel: item.channel,
          latest: item.ts,
          inclusive: true,
          limit: 1
        })

        if (result.messages && result.messages.length > 0) {
          messageAuthor = result.messages[0].user
        } else {
          // Try thread replies if it's a threaded message
          if (item.ts && item.ts.includes('.')) {
            const [parentTs] = item.ts.split('.')
            const threadResult = await client.conversations.replies({
              channel: item.channel,
              ts: parentTs,
              latest: item.ts,
              inclusive: true,
              limit: 1
            })
            if (threadResult.messages && threadResult.messages.length > 0) {
              messageAuthor = threadResult.messages[0].user
            }
          }
        }
      } catch (error) {
        logger.error(`Error fetching message author: ${error.message}`)
      }

      if (!messageAuthor) {
        logger.warn(`Could not find message author for message ${item.ts} in channel ${item.channel}`)
        return
      }

      // Get or create user for the message author
      const userInfo = await client.users.info({ user: messageAuthor })
      const slackUserData = {
        slack_user_id: messageAuthor,
        slack_username: userInfo.user.name,
        display_name: userInfo.user.profile.display_name || userInfo.user.real_name || userInfo.user.name
      }

      const user = await userService.createOrUpdateUser(slackUserData)

      // Get message permalink for discoverability
      let messagePermalink = null
      try {
        const permalinkResult = await client.chat.getPermalink({
          channel: item.channel,
          message_ts: item.ts
        })
        if (permalinkResult && permalinkResult.permalink) {
          messagePermalink = permalinkResult.permalink
          logger.debug(`Generated permalink for message ${item.ts}: ${messagePermalink}`)
        }
      } catch (error) {
        logger.warn(`Could not get permalink for message ${item.ts}: ${error.message}`)
        // Continue without permalink - not critical
      }

      // Create a photo record for this message (even without an image)
      // This allows us to track reactions on any message
      try {
        photo = await photoService.recordPhotoSubmission({
          user_id: user.id,
          slack_message_ts: item.ts,
          slack_channel_id: item.channel,
          image_url: null, // No image required for reaction tracking
          points_awarded: 0, // Don't award points, just track reactions
          message_permalink: messagePermalink
        })
        logger.info(`Created photo record for message ${item.ts} by author ${messageAuthor}`)
      } catch (error) {
        // If record already exists (race condition), fetch it
        if (error.message && error.message.includes('duplicate') || error.message && error.message.includes('unique')) {
          photo = await photoService.getPhotoByMessageTsAndChannel(item.ts, item.channel)
          // Update permalink if we got one and it's not set
          if (messagePermalink && photo && !photo.message_permalink) {
            photo = await photoService.recordPhotoSubmission({
              user_id: photo.user_id,
              slack_message_ts: photo.slack_message_ts,
              slack_channel_id: photo.slack_channel_id,
              image_url: photo.image_url,
              points_awarded: photo.points_awarded,
              message_permalink: messagePermalink
            })
          }
        } else {
          throw error
        }
      }
    }

    if (photo) {
      logger.info(`Found/created photo record for message ${item.ts}, incrementing reaction count`)
      await photoService.incrementReactionCount(item.ts, reaction)
      logger.info(`Tracked +2 reaction added to message ${item.ts} by user ${event.user}`)
    }
  } catch (error) {
    logger.error('Error handling reaction_added event:', error)
  }
})

// Handle reaction_removed events
slackApp.event('reaction_removed', async ({ event, client }) => {
  try {
    // Only track reactions to messages
    if (event.item.type !== 'message') {
      return
    }

    const { reaction, item } = event

    // Check if it's a +2 reaction (:+2-thumbs: emoji)
    const normalizedReaction = reaction.toLowerCase()
    const isPlus2 = normalizedReaction === '+2' ||
                    normalizedReaction.includes('+2') ||
                    normalizedReaction === 'thumbsup_all' ||
                    normalizedReaction.includes('thumbsup_all') ||
                    normalizedReaction === '+1::skin-tone-6' ||
                    normalizedReaction.includes('thumbsup')

    if (!isPlus2) {
      return
    }

    // Find the photo record for this message
    const photoService = require('./services/photoService')
    const photo = await photoService.getPhotoByMessageTsAndChannel(item.ts, item.channel)

    if (photo) {
      await photoService.decrementReactionCount(item.ts, reaction)
      logger.info(`Tracked +2 reaction removed from message ${item.ts} by user ${event.user}`)
    }
  } catch (error) {
    logger.error('Error handling reaction_removed event:', error)
  }
})

// Slash command handlers
slackApp.command('/grass', async ({ ack, respond }) => {
  await ack()

  try {
    await respond({
      text: 'To earn points: post a photo and include "#grass" (or :grass:) in the same message. I’ll count it automatically!\n\nTip: You can also type "grass" anywhere in the caption.',
      response_type: 'ephemeral'
    })
  } catch (error) {
    logger.error('Error handling /grass command:', error)
    await respond({
      text: 'Sorry, there was an error processing your request. Please try again.',
      response_type: 'ephemeral'
    })
  }
})

slackApp.command('/leaderboard', async ({ command, ack, respond }) => {
  await ack()

  try {
    await handleLeaderboardCommand(command, respond)
  } catch (error) {
    logger.error('Error handling /leaderboard command:', error)
    try {
      await respond({
        text: 'Sorry, there was an error retrieving the leaderboard. Please try again.',
        response_type: 'ephemeral'
      })
    } catch (respondError) {
      logger.error('Error sending error response:', respondError)
    }
  }
})

// Handle leaderboard period button interactions
slackApp.action(/^leaderboard_(weekly|last_week|monthly|all)$/, async ({ action, ack, respond }) => {
  await ack()

  try {
    const period = action.action_id.replace('leaderboard_', '')

    // Get both leaderboards - handle errors gracefully
    let leaderboardData
    let popularPosts = []

    try {
      leaderboardData = await leaderboardService.getLeaderboardByPeriod(period, 10)
    } catch (error) {
      logger.error('Error getting main leaderboard:', error)
      await respond({
        text: 'Sorry, there was an error updating the leaderboard. Please try again.',
        replace_original: false
      })
      return
    }

    try {
      popularPosts = await leaderboardService.getPopularPostsLeaderboard(period, 10)
    } catch (error) {
      // Popular posts is optional, log but continue
      logger.warn('Error getting popular posts leaderboard:', error)
      popularPosts = { period, posts: [] }
    }

    // Build blocks for both leaderboards
    const blocks = [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: leaderboardService.formatLeaderboardForSlack(leaderboardData.leaderboard, leaderboardData.periodKey || period)
        }
      },
      {
        type: 'divider'
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: leaderboardService.formatPopularPostsLeaderboard(popularPosts, period)
        }
      }
    ]

    // Add action buttons
    blocks.push({
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '📅 This Week'
          },
          value: 'weekly',
          action_id: 'leaderboard_weekly'
        },
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '↩️ Last Week'
          },
          value: 'last_week',
          action_id: 'leaderboard_last_week'
        },
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '🎖️ This Month'
          },
          value: 'monthly',
          action_id: 'leaderboard_monthly'
        },
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '🏆 All Time'
          },
          value: 'all',
          action_id: 'leaderboard_all'
        }
      ]
    })

    await respond({
      blocks,
      replace_original: true
    })

    logger.info(`Leaderboard updated to: ${period}`)
  } catch (error) {
    logger.error('Error handling leaderboard button action:', error)
    try {
      await respond({
        text: 'Sorry, there was an error updating the leaderboard. Please try again.',
        replace_original: false
      })
    } catch (respondError) {
      logger.error('Error sending error response:', respondError)
    }
  }
})

// Error handling middleware
expressApp.use((error, req, res, _next) => {
  logger.error('Express error:', error)
  res.status(500).json({ error: 'Internal server error' })
})

// Start the application
async function startApp () {
  try {
    // Initialize database
    await setupDatabase()
    logger.info('Database connection established')

    // Run migrations after database connection is established
    await runMigrations()
    logger.info('Database migrations completed')

    // Start Slack app
    await slackApp.start()
    logger.info(`Slack app started on port ${config.server.port}`)

    // Start Express server
    expressApp.listen(config.server.port, () => {
      logger.info(`Express server started on port ${config.server.port}`)
    })
  } catch (error) {
    logger.error('Failed to start application:', error)
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Shutting down gracefully...')
  await slackApp.stop()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  logger.info('Shutting down gracefully...')
  await slackApp.stop()
  process.exit(0)
})

// Start the app
startApp()
