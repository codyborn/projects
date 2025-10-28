const { query } = require('../database/connection')
const logger = require('../utils/logger')

class UserService {
  async createOrUpdateUser(slackUserData) {
    const { slack_user_id, slack_username, display_name } = slackUserData
    
    try {
      // Try to insert new user, or update if exists
      const result = await query(`
        INSERT INTO users (slack_user_id, slack_username, display_name)
        VALUES ($1, $2, $3)
        ON CONFLICT (slack_user_id) 
        DO UPDATE SET 
          slack_username = EXCLUDED.slack_username,
          display_name = EXCLUDED.display_name,
          updated_at = NOW()
        RETURNING *
      `, [slack_user_id, slack_username, display_name])
      
      logger.info(`User created/updated: ${slack_user_id}`)
      return result.rows[0]
    } catch (error) {
      logger.error('Error creating/updating user:', error)
      throw error
    }
  }

  async getUserBySlackId(slackUserId) {
    try {
      const result = await query(
        'SELECT * FROM users WHERE slack_user_id = $1',
        [slackUserId]
      )
      
      return result.rows[0] || null
    } catch (error) {
      logger.error('Error getting user by Slack ID:', error)
      throw error
    }
  }

  async incrementUserPoints(userId, points = 1) {
    try {
      const result = await query(`
        UPDATE users 
        SET total_points = total_points + $1,
            total_photos = total_photos + 1,
            updated_at = NOW()
        WHERE id = $2
        RETURNING *
      `, [points, userId])
      
      if (result.rows.length === 0) {
        throw new Error(`User with ID ${userId} not found`)
      }
      
      logger.info(`User ${userId} points incremented by ${points}`)
      return result.rows[0]
    } catch (error) {
      logger.error('Error incrementing user points:', error)
      throw error
    }
  }

  async getAllUsers() {
    try {
      const result = await query('SELECT * FROM users ORDER BY total_points DESC')
      return result.rows
    } catch (error) {
      logger.error('Error getting all users:', error)
      throw error
    }
  }

  async getTopUsers(limit = 10) {
    try {
      const result = await query(`
        SELECT * FROM users 
        ORDER BY total_points DESC, total_photos DESC, created_at ASC
        LIMIT $1
      `, [limit])
      
      return result.rows
    } catch (error) {
      logger.error('Error getting top users:', error)
      throw error
    }
  }
}

module.exports = new UserService()
