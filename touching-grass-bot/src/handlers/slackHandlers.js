const userService = require('../services/userService')
const photoService = require('../services/photoService')
const leaderboardService = require('../services/leaderboardService')
const logger = require('../utils/logger')
const config = require('../config/config')

async function handleGrassCommand(message, client) {
  try {
    const { user: slackUserId, channel, ts: messageTs, files } = message

    // Validate that we have an image attachment
    if (!files || files.length === 0) {
      await client.chat.postMessage({
        channel: channel,
        text: 'Please attach a photo with your `/grass` tag to earn points! 📸',
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
        text: 'This photo has already been counted! 🌱',
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

    // Send confirmation message
    const pointsText = updatedUser.total_points === 1 ? 'point' : 'points'
    const photosText = updatedUser.total_photos === 1 ? 'photo' : 'photos'
    
    await client.chat.postMessage({
      channel: channel,
      text: `🌱 Great job touching grass! You now have ${updatedUser.total_points} ${pointsText} from ${updatedUser.total_photos} ${photosText}. You're currently ranked #${userRank}!`,
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

async function handleLeaderboardCommand(command, respond) {
  try {
    const leaderboard = await leaderboardService.getCurrentLeaderboard(10)
    const formattedMessage = leaderboardService.formatLeaderboardForSlack(leaderboard)
    
    await respond({
      text: formattedMessage,
      response_type: 'in_channel'
    })

    logger.info('Leaderboard displayed')
  } catch (error) {
    logger.error('Error handling leaderboard command:', error)
    throw error
  }
}

module.exports = {
  handleGrassCommand,
  handleLeaderboardCommand
}
