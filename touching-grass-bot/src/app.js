const { App } = require('@slack/bolt')
const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
require('dotenv').config()

const logger = require('./utils/logger')
const config = require('./config/config')
const { setupDatabase } = require('./database/connection')
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
function containsGrassKeyword(text) {
  const value = (text || '').toLowerCase()
  if (!value) return false
  return (
    /(^|\s)#?grass(\s|$)/i.test(value) ||
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
    let channelId = undefined
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
    const initial = (file.initial_comment && file.initial_comment.comment) ? file.initial_comment.comment : ''
    const title = file.title || ''
    const combined = [initial, title].filter(t => {
      if (!t) return false
      const value = t.toLowerCase()
      return !/(^|\s)#?grass(\s|$)/i.test(value) && !value.includes(':grass:')
    }).join(' ').trim()

    const messageLike = {
      user: file.user,
      channel: channelId,
      ts: String(file.timestamp || file.created || Date.now() / 1000),
      text: combined,
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
      text: `:grass: Hi! I'm the Touching Grass Bot. I help track who's getting outside and touching grass!\n\nTo use me:\n• Post photos with \`#grass\` in the caption to earn points\n• Use \`/leaderboard\` to see current rankings\n\nLet's get outside and touch some grass! 🌿`,
      thread_ts: event.ts
    })
  } catch (error) {
    logger.error('Error handling app mention:', error)
  }
})

// Slash command handlers
slackApp.command('/grass', async ({ command, ack, respond, client }) => {
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

slackApp.command('/leaderboard', async ({ command, ack, respond, client }) => {
  await ack()
  
  try {
    await handleLeaderboardCommand(command, respond, client)
  } catch (error) {
    logger.error('Error handling /leaderboard command:', error)
    await respond({
      text: 'Sorry, there was an error retrieving the leaderboard. Please try again.',
      response_type: 'ephemeral'
    })
  }
})

// Handle leaderboard period button interactions
slackApp.action(/^leaderboard_(weekly|monthly|all)$/, async ({ action, ack, respond, client }) => {
  await ack()
  
  try {
    const period = action.action_id.replace('leaderboard_', '')
    const leaderboardData = await leaderboardService.getLeaderboardByPeriod(period, 10)
    const blocks = leaderboardService.getLeaderboardBlocks(leaderboardData, period)
    
    await respond({
      blocks: blocks,
      replace_original: true
    })
    
    logger.info(`Leaderboard updated to: ${period}`)
  } catch (error) {
    logger.error('Error handling leaderboard button action:', error)
    await respond({
      text: 'Sorry, there was an error updating the leaderboard. Please try again.',
      replace_original: false
    })
  }
})

// Error handling middleware
expressApp.use((error, req, res, next) => {
  logger.error('Express error:', error)
  res.status(500).json({ error: 'Internal server error' })
})

// Start the application
async function startApp() {
  try {
    // Initialize database
    await setupDatabase()
    logger.info('Database connection established')

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
