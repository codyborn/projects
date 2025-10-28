const { query } = require('../database/connection')
const logger = require('../utils/logger')

class PhotoService {
  async recordPhotoSubmission(photoData) {
    const { user_id, slack_message_ts, slack_channel_id, image_url, points_awarded = 1 } = photoData
    
    try {
      const result = await query(`
        INSERT INTO photos (user_id, slack_message_ts, slack_channel_id, image_url, points_awarded)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, [user_id, slack_message_ts, slack_channel_id, image_url, points_awarded])
      
      logger.info(`Photo recorded for user ${user_id}`)
      return result.rows[0]
    } catch (error) {
      logger.error('Error recording photo submission:', error)
      throw error
    }
  }

  async getPhotosByUser(userId, limit = 50) {
    try {
      const result = await query(`
        SELECT * FROM photos 
        WHERE user_id = $1 
        ORDER BY created_at DESC 
        LIMIT $2
      `, [userId, limit])
      
      return result.rows
    } catch (error) {
      logger.error('Error getting photos by user:', error)
      throw error
    }
  }

  async getPhotoByMessageTs(slackMessageTs) {
    try {
      const result = await query(
        'SELECT * FROM photos WHERE slack_message_ts = $1',
        [slackMessageTs]
      )
      
      return result.rows[0] || null
    } catch (error) {
      logger.error('Error getting photo by message timestamp:', error)
      throw error
    }
  }

  async getAllPhotos(limit = 100) {
    try {
      const result = await query(`
        SELECT p.*, u.slack_username, u.display_name 
        FROM photos p
        JOIN users u ON p.user_id = u.id
        ORDER BY p.created_at DESC
        LIMIT $1
      `, [limit])
      
      return result.rows
    } catch (error) {
      logger.error('Error getting all photos:', error)
      throw error
    }
  }

  async getTotalPhotosCount() {
    try {
      const result = await query('SELECT COUNT(*) as count FROM photos')
      return parseInt(result.rows[0].count)
    } catch (error) {
      logger.error('Error getting total photos count:', error)
      throw error
    }
  }
}

module.exports = new PhotoService()
