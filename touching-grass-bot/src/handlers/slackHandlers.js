const userService = require('../services/userService')
const photoService = require('../services/photoService')
const leaderboardService = require('../services/leaderboardService')
const aiService = require('../services/aiService')
const logger = require('../utils/logger')
const config = require('../config/config')

async function handleGrassCommand(message, client) {
  try {
    const { user: slackUserId, channel, ts: messageTs, files } = message

    // Validate that we have an image attachment
    if (!files || files.length === 0) {
      await client.chat.postMessage({
        channel: channel,
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
        channel: channel,
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
    function containsGrassKeyword(text) {
      const value = (text || '').toLowerCase()
      return (
        /(^|\s)#?grass(\s|$)/i.test(value) ||
        value.includes(':grass:')
      )
    }

    // Extract user's first name from display name or username
    function getFirstName(name) {
      if (!name) return ''
      // Split by space and take the first part
      const parts = name.trim().split(/\s+/)
      return parts[0] || name
    }

    const userFirstName = getFirstName(slackUserData.display_name || slackUserData.slack_username)

    // Extract user's comment/caption from message (excluding grass keywords)
    const baseText = (message.text || '').trim()
    const fileTexts = (message.files || []).flatMap(f => {
      const initial = (f.initial_comment && f.initial_comment.comment) ? f.initial_comment.comment : ''
      const title = f.title || ''
      return [initial, title].filter(t => t && !containsGrassKeyword(t)).join(' ')
    })
    const userComment = [baseText, ...fileTexts].filter(t => t && !containsGrassKeyword(t)).join(' ').trim()

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
    const photosText = updatedUser.total_photos === 1 ? 'photo' : 'photos'
    
    let responseText = `:grass: Great job touching grass, ${userName}! You now have ${updatedUser.total_points} ${pointsText} from ${updatedUser.total_photos} ${photosText}. You're currently ranked #${userRank}!`
    
    // Add AI comment if available
    if (aiComment) {
      responseText += `\n\n ${aiComment}`
    }
    
    await client.chat.postMessage({
      channel: channel,
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

async function handleLeaderboardCommand(command, respond, client) {
  try {
    // Parse period from command text (default to 'all')
    const commandText = (command.text || '').toLowerCase().trim()
    let period = 'all'
    
    if (commandText === 'weekly' || commandText === 'week') {
      period = 'weekly'
    } else if (commandText === 'monthly' || commandText === 'month') {
      period = 'monthly'
    } else if (commandText === 'all' || commandText === 'alltime' || commandText === 'all-time') {
      period = 'all'
    }
    
    const leaderboardData = await leaderboardService.getLeaderboardByPeriod(period, 10)
    const blocks = leaderboardService.getLeaderboardBlocks(leaderboardData, period)
    
    await respond({
      blocks: blocks,
      response_type: 'in_channel'
    })

    logger.info(`Leaderboard displayed: ${period}`)
  } catch (error) {
    logger.error('Error handling leaderboard command:', error)
    throw error
  }
}

module.exports = {
  handleGrassCommand,
  handleLeaderboardCommand
}
