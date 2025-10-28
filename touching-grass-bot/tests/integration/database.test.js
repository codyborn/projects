const { setupDatabase, query, closeDatabase } = require('../../src/database/connection')

describe('Database Integration', () => {
  beforeAll(async () => {
    await setupDatabase()
  })

  afterAll(async () => {
    await closeDatabase()
  })

  beforeEach(async () => {
    // Clean up test data
    await query('DELETE FROM photos')
    await query('DELETE FROM users')
  })

  describe('Database Connection', () => {
    it('should connect to database successfully', async () => {
      const result = await query('SELECT NOW() as current_time')
      expect(result.rows).toHaveLength(1)
      expect(result.rows[0].current_time).toBeDefined()
    })

    it('should create and query users table', async () => {
      // Insert a test user
      const insertResult = await query(`
        INSERT INTO users (slack_user_id, slack_username, display_name)
        VALUES ($1, $2, $3)
        RETURNING *
      `, ['U1234567890', 'testuser', 'Test User'])

      expect(insertResult.rows).toHaveLength(1)
      expect(insertResult.rows[0].slack_user_id).toBe('U1234567890')

      // Query the user back
      const selectResult = await query(
        'SELECT * FROM users WHERE slack_user_id = $1',
        ['U1234567890']
      )

      expect(selectResult.rows).toHaveLength(1)
      expect(selectResult.rows[0].slack_username).toBe('testuser')
    })

    it('should create and query photos table', async () => {
      // First create a user
      const userResult = await query(`
        INSERT INTO users (slack_user_id, slack_username, display_name)
        VALUES ($1, $2, $3)
        RETURNING *
      `, ['U1234567890', 'testuser', 'Test User'])

      const userId = userResult.rows[0].id

      // Insert a test photo
      const insertResult = await query(`
        INSERT INTO photos (user_id, slack_message_ts, slack_channel_id, image_url)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `, [userId, '1234567890.123456', 'C1234567890', 'https://example.com/image.jpg'])

      expect(insertResult.rows).toHaveLength(1)
      expect(insertResult.rows[0].user_id).toBe(userId)

      // Query the photo back
      const selectResult = await query(
        'SELECT * FROM photos WHERE user_id = $1',
        [userId]
      )

      expect(selectResult.rows).toHaveLength(1)
      expect(selectResult.rows[0].slack_message_ts).toBe('1234567890.123456')
    })
  })
})
