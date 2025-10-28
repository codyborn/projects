const userService = require('./userService')
const photoService = require('./photoService')
const logger = require('../utils/logger')

class LeaderboardService {
  async getCurrentLeaderboard(limit = 10) {
    try {
      const topUsers = await userService.getTopUsers(limit)
      
      return topUsers.map((user, index) => ({
        rank: index + 1,
        username: user.display_name || user.slack_username,
        points: user.total_points,
        photos: user.total_photos,
        slack_user_id: user.slack_user_id
      }))
    } catch (error) {
      logger.error('Error getting current leaderboard:', error)
      throw error
    }
  }

  async getUserRank(slackUserId) {
    try {
      const user = await userService.getUserBySlackId(slackUserId)
      if (!user) {
        return null
      }

      const { query } = require('../database/connection')
      const result = await query(`
        SELECT COUNT(*) + 1 as rank
        FROM users 
        WHERE total_points > $1 
        OR (total_points = $1 AND total_photos > $2)
        OR (total_points = $1 AND total_photos = $2 AND created_at < $3)
      `, [user.total_points, user.total_photos, user.created_at])
      
      return parseInt(result.rows[0].rank)
    } catch (error) {
      logger.error('Error getting user rank:', error)
      throw error
    }
  }

  async getUserStats(slackUserId) {
    try {
      const user = await userService.getUserBySlackId(slackUserId)
      if (!user) {
        return null
      }

      const rank = await this.getUserRank(slackUserId)
      const recentPhotos = await photoService.getPhotosByUser(user.id, 5)

      return {
        user: {
          username: user.display_name || user.slack_username,
          slack_user_id: user.slack_user_id
        },
        stats: {
          rank,
          points: user.total_points,
          photos: user.total_photos,
          recent_photos: recentPhotos
        }
      }
    } catch (error) {
      logger.error('Error getting user stats:', error)
      throw error
    }
  }

  async getLeaderboardStats() {
    try {
      const { query } = require('../database/connection')
      
      const [totalUsersResult, totalPhotosResult, topUserResult] = await Promise.all([
        query('SELECT COUNT(*) as count FROM users'),
        query('SELECT COUNT(*) as count FROM photos'),
        query('SELECT slack_username, total_points FROM users ORDER BY total_points DESC LIMIT 1')
      ])

      return {
        total_users: parseInt(totalUsersResult.rows[0].count),
        total_photos: parseInt(totalPhotosResult.rows[0].count),
        top_user: topUserResult.rows[0] || null
      }
    } catch (error) {
      logger.error('Error getting leaderboard stats:', error)
      throw error
    }
  }

  formatLeaderboardForSlack(leaderboard) {
    if (leaderboard.length === 0) {
      return '🌱 *Touching Grass Leaderboard*\n\nNo photos submitted yet! Be the first to post a photo with `/grass`!'
    }

    const emojis = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟']
    
    let message = '🌱 *Touching Grass Leaderboard*\n\n'
    
    leaderboard.forEach((user, index) => {
      const emoji = emojis[index] || `${index + 1}.`
      const pointsText = user.points === 1 ? 'point' : 'points'
      const photosText = user.photos === 1 ? 'photo' : 'photos'
      
      message += `${emoji} *${user.username}* - ${user.points} ${pointsText} (${user.photos} ${photosText})\n`
    })
    
    message += '\nPost a photo with `/grass` to join the leaderboard! 🌿'
    
    return message
  }
}

module.exports = new LeaderboardService()
