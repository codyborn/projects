const userService = require('../services/userService')
const photoService = require('../services/photoService')
const leaderboardService = require('../services/leaderboardService')
const aiService = require('../services/aiService')
const logger = require('../utils/logger')
const config = require('../config/config')

async function handleGrassCommand (message, client) {
  try {
    const { user: slackUserId, channel, ts: messageTs, files } = message

    // Validate that we have an image attachment
    if (!files || files.length === 0) {
      await client.chat.postMessage({
        channel,
        text: 'Please attach a photo with your `grass` tag to earn points! 📸',
        thread_ts: messageTs
      })
      return
    }

    // Get user info from Slack
    const userInfo = await client.users.info({ user: slackUserId })
    const slackUserData = {
      slack_user_id: slackUserId,
      slack_username: userInfo.user.name,
      display_name: userInfo.user.profile.display_name || userInfo.user.real_name || userInfo.user.name
    }

    // Create or update user in database
    const user = await userService.createOrUpdateUser(slackUserData)

    // Check if this photo was already submitted
    const existingPhoto = await photoService.getPhotoByMessageTs(messageTs)
    if (existingPhoto) {
      await client.chat.postMessage({
        channel,
        text: 'This photo has already been counted! :grass:',
        thread_ts: messageTs
      })
      return
    }

    // Record the photo submission
    const imageUrl = files[0].url_private || files[0].permalink
    await photoService.recordPhotoSubmission({
      user_id: user.id,
      slack_message_ts: messageTs,
      slack_channel_id: channel,
      image_url: imageUrl,
      points_awarded: 1
    })

    // Increment user points
    const updatedUser = await userService.incrementUserPoints(user.id, 1)

    // Get user's current rank
    const userRank = await leaderboardService.getUserRank(slackUserId)

    // Helper function to check for grass keywords
    function containsGrassKeyword (text) {
      const value = (text || '').toLowerCase()
      return (
        /(^|[\s\(\[\{'"`])#?grass([\s\)\]\}'"`]|$)/i.test(value) ||
        value.includes(':grass:')
      )
    }

    // Helper function to check if text looks like a filename
    function isFilename (text) {
      if (!text) return false
      const trimmed = text.trim()
      // Match common filename patterns: IMG_1234.jpg, photo.png, DSC_001.JPG, etc.
      const filenamePattern = /^[A-Z0-9_\-]+\.(jpg|jpeg|png|gif|webp|heic|heif)$/i
      return filenamePattern.test(trimmed)
    }

    // Extract user's first name from display name or username
    function getFirstName (name) {
      if (!name) return ''
      // Split by space and take the first part
      const parts = name.trim().split(/\s+/)
      return parts[0] || name
    }

    const userFirstName = getFirstName(slackUserData.display_name || slackUserData.slack_username)

    // Extract user's comment/caption from message (excluding grass keywords and filenames)
    const baseText = (message.text || '').trim()
    const fileTexts = (message.files || []).flatMap(f => {
      const initial = (f.initial_comment && f.initial_comment.comment) ? f.initial_comment.comment : ''
      const title = f.title || ''
      // Filter out grass keywords and filenames
      const filtered = [initial, title]
        .filter(t => t && !containsGrassKeyword(t) && !isFilename(t))
        .join(' ')
      return filtered
    })
    const userComment = [baseText, ...fileTexts].filter(t => t && !containsGrassKeyword(t) && !isFilename(t)).join(' ').trim()

    // Try to get AI comment on the photo
    let aiComment = null
    try {
      aiComment = await aiService.analyzePhoto(
        imageUrl,
        config.slack.botToken,
        userFirstName,
        userComment
      )
    } catch (error) {
      logger.warn('AI comment generation failed, using fallback message:', error)
    }

    // Build response message with user's name
    const userName = slackUserData.display_name || slackUserData.slack_username
    const pointsText = updatedUser.total_points === 1 ? 'point' : 'points'

    let responseText = ''

    // Add AI comment if available
    if (aiComment) {
      responseText += `${aiComment}`
    }

    responseText += `\n\n:grass: Great job touching grass, ${userName}! You now have ${updatedUser.total_points} ${pointsText}. You're currently ranked #${userRank}!`

    await client.chat.postMessage({
      channel,
      text: responseText,
      thread_ts: messageTs
    })

    logger.info(`Photo submitted by ${slackUserData.slack_username}: ${updatedUser.total_points} points`)
  } catch (error) {
    logger.error('Error handling grass command:', error)

    try {
      await client.chat.postMessage({
        channel: message.channel,
        text: 'Sorry, there was an error processing your photo. Please try again! 😅',
        thread_ts: message.ts
      })
    } catch (postError) {
      logger.error('Error posting error message:', postError)
    }
  }
}

async function handleLeaderboardCommand (command, respond) {
  try {
    // Parse period from command text (default to 'all')
    const commandText = (command.text || '').toLowerCase().trim()
    let period = 'all'

    if (commandText === 'weekly' || commandText === 'week') {
      period = 'weekly'
    } else if (commandText === 'last_week' || commandText === 'lastweek' || commandText === 'last-week' || commandText === 'last week') {
      period = 'last_week'
    } else if (commandText === 'monthly' || commandText === 'month') {
      period = 'monthly'
    } else if (commandText === 'all' || commandText === 'alltime' || commandText === 'all-time') {
      period = 'all'
    }

    // Get both leaderboards - handle errors gracefully
    let leaderboardData
    let popularPosts = []

    try {
      leaderboardData = await leaderboardService.getLeaderboardByPeriod(period, 10)
    } catch (error) {
      logger.error('Error getting main leaderboard:', error)
      await respond({
        text: 'Sorry, there was an error retrieving the leaderboard. Please try again.',
        response_type: 'ephemeral'
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
      response_type: 'in_channel'
    })

    logger.info(`Leaderboard displayed: ${period}`)
  } catch (error) {
    logger.error('Error handling leaderboard command:', error)
    // Try to respond with error message
    try {
      await respond({
        text: 'Sorry, there was an error retrieving the leaderboard. Please try again.',
        response_type: 'ephemeral'
      })
    } catch (respondError) {
      logger.error('Error sending error response:', respondError)
    }
  }
}

module.exports = {
  handleGrassCommand,
  handleLeaderboardCommand
}
