const userService = require('../../src/services/userService')
const { query } = require('../../src/database/connection')

describe('UserService', () => {
  beforeEach(async () => {
    // Clean up test data
    await query('DELETE FROM photos')
    await query('DELETE FROM users')
  })

  describe('createOrUpdateUser', () => {
    it('should create new user with Slack data', async () => {
      const slackUserData = {
        slack_user_id: 'U1234567890',
        slack_username: 'testuser',
        display_name: 'Test User'
      }

      const user = await userService.createOrUpdateUser(slackUserData)

      expect(user).toBeDefined()
      expect(user.slack_user_id).toBe(slackUserData.slack_user_id)
      expect(user.slack_username).toBe(slackUserData.slack_username)
      expect(user.display_name).toBe(slackUserData.display_name)
      expect(user.total_points).toBe(0)
      expect(user.total_photos).toBe(0)
    })

    it('should update existing user with new display name', async () => {
      const initialData = {
        slack_user_id: 'U1234567890',
        slack_username: 'testuser',
        display_name: 'Test User'
      }

      await userService.createOrUpdateUser(initialData)

      const updatedData = {
        slack_user_id: 'U1234567890',
        slack_username: 'testuser',
        display_name: 'Updated Name'
      }

      const updatedUser = await userService.createOrUpdateUser(updatedData)

      expect(updatedUser.display_name).toBe('Updated Name')
      expect(updatedUser.slack_user_id).toBe(initialData.slack_user_id)
    })

    it('should handle duplicate Slack user IDs gracefully', async () => {
      const slackUserData = {
        slack_user_id: 'U1234567890',
        slack_username: 'testuser',
        display_name: 'Test User'
      }

      const user1 = await userService.createOrUpdateUser(slackUserData)
      const user2 = await userService.createOrUpdateUser(slackUserData)

      expect(user1.id).toBe(user2.id)
      expect(user1.slack_user_id).toBe(user2.slack_user_id)
    })
  })

  describe('getUserBySlackId', () => {
    it('should return user for valid Slack ID', async () => {
      const slackUserData = {
        slack_user_id: 'U1234567890',
        slack_username: 'testuser',
        display_name: 'Test User'
      }

      await userService.createOrUpdateUser(slackUserData)
      const user = await userService.getUserBySlackId('U1234567890')

      expect(user).toBeDefined()
      expect(user.slack_user_id).toBe('U1234567890')
    })

    it('should return null for non-existent user', async () => {
      const user = await userService.getUserBySlackId('U9999999999')
      expect(user).toBeNull()
    })
  })

  describe('incrementUserPoints', () => {
    it('should increment points and photo count', async () => {
      const slackUserData = {
        slack_user_id: 'U1234567890',
        slack_username: 'testuser',
        display_name: 'Test User'
      }

      const user = await userService.createOrUpdateUser(slackUserData)
      const updatedUser = await userService.incrementUserPoints(user.id, 1)

      expect(updatedUser.total_points).toBe(1)
      expect(updatedUser.total_photos).toBe(1)
    })

    it('should handle multiple increments', async () => {
      const slackUserData = {
        slack_user_id: 'U1234567890',
        slack_username: 'testuser',
        display_name: 'Test User'
      }

      const user = await userService.createOrUpdateUser(slackUserData)
      
      await userService.incrementUserPoints(user.id, 1)
      await userService.incrementUserPoints(user.id, 1)
      const finalUser = await userService.incrementUserPoints(user.id, 1)

      expect(finalUser.total_points).toBe(3)
      expect(finalUser.total_photos).toBe(3)
    })

    it('should throw error for non-existent user', async () => {
      await expect(userService.incrementUserPoints(99999, 1))
        .rejects.toThrow('User with ID 99999 not found')
    })
  })

  describe('getTopUsers', () => {
    it('should return top users ordered by points', async () => {
      // Create test users with different point values
      const user1 = await userService.createOrUpdateUser({
        slack_user_id: 'U1111111111',
        slack_username: 'user1',
        display_name: 'User One'
      })

      const user2 = await userService.createOrUpdateUser({
        slack_user_id: 'U2222222222',
        slack_username: 'user2',
        display_name: 'User Two'
      })

      const user3 = await userService.createOrUpdateUser({
        slack_user_id: 'U3333333333',
        slack_username: 'user3',
        display_name: 'User Three'
      })

      // Give them different points
      await userService.incrementUserPoints(user2.id, 3) // 3 points
      await userService.incrementUserPoints(user1.id, 1) // 1 point
      await userService.incrementUserPoints(user3.id, 2) // 2 points

      const topUsers = await userService.getTopUsers(3)

      expect(topUsers).toHaveLength(3)
      expect(topUsers[0].slack_user_id).toBe('U2222222222') // Highest points
      expect(topUsers[1].slack_user_id).toBe('U3333333333') // Second highest
      expect(topUsers[2].slack_user_id).toBe('U1111111111') // Lowest points
    })

    it('should return empty array when no users exist', async () => {
      const topUsers = await userService.getTopUsers(10)
      expect(topUsers).toHaveLength(0)
    })
  })
})
