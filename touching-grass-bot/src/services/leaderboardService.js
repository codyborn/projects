const userService = require('./userService')
const photoService = require('./photoService')
const logger = require('../utils/logger')

class LeaderboardService {
  async getLeaderboardByPeriod (period = 'all', limit = 10) {
    try {
      const { query } = require('../database/connection')
      let dateFilter = ''
      let periodLabel = 'All Time'

      let result

      if (period === 'weekly' || period === 'week') {
        dateFilter = 'AND p.created_at >= NOW() - INTERVAL \'7 days\''
        periodLabel = 'This Week'
        const sql = `
          SELECT 
            u.id,
            u.slack_user_id,
            u.slack_username,
            u.display_name,
            COALESCE(SUM(p.points_awarded), 0) as points,
            COUNT(p.id) as photos
          FROM users u
          LEFT JOIN photos p ON u.id = p.user_id ${dateFilter}
          GROUP BY u.id, u.slack_user_id, u.slack_username, u.display_name
          HAVING COUNT(p.id) > 0
          ORDER BY points DESC, photos DESC, u.created_at ASC
          LIMIT $1
        `
        result = await query(sql, [limit])
      } else if (period === 'last_week' || period === 'lastweek' || period === 'last-week') {
        dateFilter = 'AND p.created_at >= NOW() - INTERVAL \'14 days\' AND p.created_at < NOW() - INTERVAL \'7 days\''
        periodLabel = 'Last Week'
        const sql = `
          SELECT 
            u.id,
            u.slack_user_id,
            u.slack_username,
            u.display_name,
            COALESCE(SUM(p.points_awarded), 0) as points,
            COUNT(p.id) as photos
          FROM users u
          LEFT JOIN photos p ON u.id = p.user_id ${dateFilter}
          GROUP BY u.id, u.slack_user_id, u.slack_username, u.display_name
          HAVING COUNT(p.id) > 0
          ORDER BY points DESC, photos DESC, u.created_at ASC
          LIMIT $1
        `
        result = await query(sql, [limit])
      } else if (period === 'monthly' || period === 'month') {
        dateFilter = 'AND p.created_at >= NOW() - INTERVAL \'30 days\''
        periodLabel = 'This Month'
        const sql = `
          SELECT 
            u.id,
            u.slack_user_id,
            u.slack_username,
            u.display_name,
            COALESCE(SUM(p.points_awarded), 0) as points,
            COUNT(p.id) as photos
          FROM users u
          LEFT JOIN photos p ON u.id = p.user_id ${dateFilter}
          GROUP BY u.id, u.slack_user_id, u.slack_username, u.display_name
          HAVING COUNT(p.id) > 0
          ORDER BY points DESC, photos DESC, u.created_at ASC
          LIMIT $1
        `
        result = await query(sql, [limit])
      } else {
        // All time: use users table for better performance
        periodLabel = 'All Time'
        const sql = `
          SELECT 
            u.id,
            u.slack_user_id,
            u.slack_username,
            u.display_name,
            u.total_points as points,
            u.total_photos as photos
          FROM users u
          WHERE u.total_photos > 0
          ORDER BY u.total_points DESC, u.total_photos DESC, u.created_at ASC
          LIMIT $1
        `
        result = await query(sql, [limit])
      }

      return {
        period: periodLabel,
        periodKey: period,
        leaderboard: result.rows.map((user, index) => ({
          rank: index + 1,
          username: user.display_name || user.slack_username,
          points: parseInt(user.points) || 0,
          photos: parseInt(user.photos) || 0,
          slack_user_id: user.slack_user_id
        }))
      }
    } catch (error) {
      logger.error('Error getting leaderboard by period:', error)
      throw error
    }
  }

  async getCurrentLeaderboard (limit = 10) {
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

  async getUserRank (slackUserId) {
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

  async getUserStats (slackUserId) {
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

  async getLeaderboardStats () {
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

  formatLeaderboardForSlack (leaderboard, period = 'all') {
    if (leaderboard.length === 0) {
      return 'Post a photo with "grass" to join the leaderboard! :grass:'
    }

    const emojis = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟']

    const periodLabel = this.getPeriodLabel(period)

    let message = `:grass: *Touching Grass Leaderboard - ${periodLabel}*\n\n`

    leaderboard.forEach((user, index) => {
      const emoji = emojis[index] || `${index + 1}.`
      const pointsText = user.points === 1 ? 'point' : 'points'
      const photosText = user.photos === 1 ? 'photo' : 'photos'

      message += `${emoji} *${user.username}* - ${user.points} ${pointsText} (${user.photos} ${photosText})\n`
    })

    message += '\nPost a photo with "grass" to join the leaderboard! :grass:'

    return message
  }

  async getPopularPostsLeaderboard (period = 'all', limit = 10) {
    try {
      const { query } = require('../database/connection')

      let dateFilter = ''
      if (period === 'weekly' || period === 'week') {
        dateFilter = 'AND p.created_at >= NOW() - INTERVAL \'7 days\''
      } else if (period === 'last_week' || period === 'lastweek' || period === 'last-week') {
        dateFilter = 'AND p.created_at >= NOW() - INTERVAL \'14 days\' AND p.created_at < NOW() - INTERVAL \'7 days\''
      } else if (period === 'monthly' || period === 'month') {
        dateFilter = 'AND p.created_at >= NOW() - INTERVAL \'30 days\''
      }
      // 'all' doesn't need a date filter

      const result = await query(`
        SELECT 
          p.id,
          p.slack_message_ts,
          p.slack_channel_id,
          p.plus2_reactions_count,
          p.created_at,
          u.slack_user_id,
          u.slack_username,
          u.display_name
        FROM photos p
        JOIN users u ON p.user_id = u.id
        WHERE p.plus2_reactions_count > 0
        ${dateFilter}
        ORDER BY p.plus2_reactions_count DESC, p.created_at DESC
        LIMIT $1
      `, [limit])

      return {
        period,
        posts: result.rows.map((post, index) => ({
          rank: index + 1,
          username: post.display_name || post.slack_username,
          reactions: parseInt(post.plus2_reactions_count) || 0,
          slack_user_id: post.slack_user_id,
          message_ts: post.slack_message_ts,
          channel_id: post.slack_channel_id,
          created_at: post.created_at
        }))
      }
    } catch (error) {
      // Handle case where column doesn't exist yet (migration not run)
      if (error.message && error.message.includes('plus2_reactions_count')) {
        logger.warn('plus2_reactions_count column not found - migration may not have run yet')
        return { period, posts: [] }
      }
      logger.error('Error getting popular posts leaderboard:', error)
      // Return empty array instead of throwing to prevent dispatch_failed
      return { period, posts: [] }
    }
  }

  getLeaderboardBlocks (leaderboardData, currentPeriod = 'all') {
    const blocks = [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: this.formatLeaderboardForSlack(leaderboardData.leaderboard, leaderboardData.periodKey || currentPeriod)
        }
      },
      {
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
              text: '📆 This Month'
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
      }
    ]
    return blocks
  }

  formatPopularPostsLeaderboard (postsData, period = 'all') {
    const posts = postsData.posts || postsData || []

    if (posts.length === 0) {
      const periodLabel = this.getPeriodLabel(period)
      return `:+2-thumbs: No popular posts yet ${periodLabel !== 'All Time' ? `for ${periodLabel.toLowerCase()}` : ''}. Be the first to get a :+2-thumbs: reaction!`
    }

    const emojis = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟']

    const periodLabel = this.getPeriodLabel(period)
    let message = `*:+2-thumbs: Popular Posts Leaderboard - ${periodLabel}*\n\n`

    posts.forEach((post, index) => {
      const emoji = emojis[index] || `${index + 1}.`
      const reactionsText = post.reactions === 1 ? 'reaction' : 'reactions'

      message += `${emoji} *${post.username}* - ${post.reactions} ${reactionsText} :+2-thumbs:\n`
    })

    return message
  }

  getPeriodLabel (period) {
    const periodLabels = {
      all: 'All Time',
      weekly: 'This Week',
      last_week: 'Last Week',
      lastweek: 'Last Week',
      'last-week': 'Last Week',
      monthly: 'This Month'
    }
    return periodLabels[period] || 'All Time'
  }
}

module.exports = new LeaderboardService()
