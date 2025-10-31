const { query } = require('../database/connection')
const logger = require('../utils/logger')

class PhotoService {
  async recordPhotoSubmission (photoData) {
    // eslint-disable-next-line camelcase
    const { user_id, slack_message_ts, slack_channel_id, image_url, points_awarded = 1, message_permalink } = photoData

    try {
      // Check if photo already exists for this message
      const existing = await this.getPhotoByMessageTsAndChannel(slack_message_ts, slack_channel_id)
      if (existing) {
        logger.debug(`Photo record already exists for message ${slack_message_ts}`)
        // Update permalink if not set
        if (message_permalink && !existing.message_permalink) {
          await query(
            'UPDATE photos SET message_permalink = $1 WHERE id = $2',
            [message_permalink, existing.id]
          )
          existing.message_permalink = message_permalink
        }
        return existing
      }

      const result = await query(`
        INSERT INTO photos (user_id, slack_message_ts, slack_channel_id, image_url, points_awarded, message_permalink)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [user_id, slack_message_ts, slack_channel_id, image_url, points_awarded, message_permalink || null])

      // eslint-disable-next-line camelcase
      logger.info(`Photo recorded for user ${user_id}`)
      return result.rows[0]
    } catch (error) {
      // If duplicate key error, try to fetch existing record
      if (error.code === '23505' || error.message && error.message.includes('duplicate')) {
        logger.debug(`Duplicate photo record detected, fetching existing for message ${slack_message_ts}`)
        const existing = await this.getPhotoByMessageTsAndChannel(slack_message_ts, slack_channel_id)
        if (existing) {
          return existing
        }
      }
      logger.error('Error recording photo submission:', error)
      throw error
    }
  }

  async getPhotosByUser (userId, limit = 50) {
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

  async getPhotoByMessageTs (slackMessageTs) {
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

  async getAllPhotos (limit = 100) {
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

  async getTotalPhotosCount () {
    try {
      const result = await query('SELECT COUNT(*) as count FROM photos')
      return parseInt(result.rows[0].count)
    } catch (error) {
      logger.error('Error getting total photos count:', error)
      throw error
    }
  }

  async incrementReactionCount (slackMessageTs, reactionName) {
    // Only track +2 reactions (:+2-thumbs: emoji)
    // Reaction name could be '+2', 'thumbsup_all', or variants
    const normalizedReaction = reactionName.toLowerCase()
    const isPlus2 = normalizedReaction === '+2' ||
                    normalizedReaction.includes('+2') ||
                    normalizedReaction === 'thumbsup_all' ||
                    normalizedReaction.includes('thumbsup_all')

    if (!isPlus2) {
      return null
    }

    try {
      const result = await query(`
        UPDATE photos 
        SET plus2_reactions_count = plus2_reactions_count + 1
        WHERE slack_message_ts = $1
        RETURNING *
      `, [slackMessageTs])

      if (result.rows.length > 0) {
        logger.info(`Incremented +2 reaction count for message ${slackMessageTs}`)
        return result.rows[0]
      }
      return null
    } catch (error) {
      logger.error('Error incrementing reaction count:', error)
      throw error
    }
  }

  async decrementReactionCount (slackMessageTs, reactionName) {
    // Only track +2 reactions (:+2-thumbs: emoji)
    const normalizedReaction = reactionName.toLowerCase()
    const isPlus2 = normalizedReaction === '+2' ||
                    normalizedReaction.includes('+2') ||
                    normalizedReaction === 'thumbsup_all' ||
                    normalizedReaction.includes('thumbsup_all')

    if (!isPlus2) {
      return null
    }

    try {
      const result = await query(`
        UPDATE photos 
        SET plus2_reactions_count = GREATEST(plus2_reactions_count - 1, 0)
        WHERE slack_message_ts = $1
        RETURNING *
      `, [slackMessageTs])

      if (result.rows.length > 0) {
        logger.info(`Decremented +2 reaction count for message ${slackMessageTs}`)
        return result.rows[0]
      }
      return null
    } catch (error) {
      logger.error('Error decrementing reaction count:', error)
      throw error
    }
  }

  async getPhotoByMessageTsAndChannel (slackMessageTs, channelId) {
    try {
      // Try exact match first
      let result = await query(
        'SELECT * FROM photos WHERE slack_message_ts = $1 AND slack_channel_id = $2',
        [slackMessageTs, channelId]
      )

      if (result.rows.length > 0) {
        logger.debug(`Found photo with exact match: message_ts=${slackMessageTs}, channel=${channelId}`)
        return result.rows[0]
      }

      // Try matching without channel constraint (in case channel ID changed)
      result = await query(
        'SELECT * FROM photos WHERE slack_message_ts = $1',
        [slackMessageTs]
      )

      if (result.rows.length > 0) {
        logger.debug(`Found photo without channel constraint: message_ts=${slackMessageTs}`)
        return result.rows[0]
      }

      // Log all photos for debugging
      const allPhotos = await query(
        'SELECT slack_message_ts, slack_channel_id FROM photos ORDER BY created_at DESC LIMIT 10'
      )
      logger.info(`No photo found for message_ts=${slackMessageTs}, channel=${channelId}. Recent photos: ${JSON.stringify(allPhotos.rows.map(p => ({ ts: String(p.slack_message_ts), channel: p.slack_channel_id })))}`)

      return null
    } catch (error) {
      logger.error('Error getting photo by message timestamp and channel:', error)
      throw error
    }
  }
}

module.exports = new PhotoService()
