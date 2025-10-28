const leaderboardService = require('../../src/services/leaderboardService')
const userService = require('../../src/services/userService')
const { query } = require('../../src/database/connection')

describe('LeaderboardService', () => {
  beforeEach(async () => {
    // Clean up test data
    await query('DELETE FROM photos')
    await query('DELETE FROM users')
  })

  describe('getCurrentLeaderboard', () => {
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

      const leaderboard = await leaderboardService.getCurrentLeaderboard(3)

      expect(leaderboard).toHaveLength(3)
      expect(leaderboard[0].slack_user_id).toBe('U2222222222') // Highest points
      expect(leaderboard[0].rank).toBe(1)
      expect(leaderboard[0].points).toBe(3)
      expect(leaderboard[1].slack_user_id).toBe('U3333333333') // Second highest
      expect(leaderboard[1].rank).toBe(2)
      expect(leaderboard[1].points).toBe(2)
      expect(leaderboard[2].slack_user_id).toBe('U1111111111') // Lowest points
      expect(leaderboard[2].rank).toBe(3)
      expect(leaderboard[2].points).toBe(1)
    })

    it('should return empty array when no users exist', async () => {
      const leaderboard = await leaderboardService.getCurrentLeaderboard(10)
      expect(leaderboard).toHaveLength(0)
    })

    it('should limit results to specified number', async () => {
      // Create 5 users
      for (let i = 1; i <= 5; i++) {
        const user = await userService.createOrUpdateUser({
          slack_user_id: `U${i}000000000`,
          slack_username: `user${i}`,
          display_name: `User ${i}`
        })
        await userService.incrementUserPoints(user.id, i) // Give them 1, 2, 3, 4, 5 points
      }

      const leaderboard = await leaderboardService.getCurrentLeaderboard(3)
      expect(leaderboard).toHaveLength(3)
    })
  })

  describe('getUserRank', () => {
    it('should return correct rank for user', async () => {
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

      await userService.incrementUserPoints(user2.id, 2) // 2 points
      await userService.incrementUserPoints(user1.id, 1) // 1 point

      const rank1 = await leaderboardService.getUserRank('U1111111111')
      const rank2 = await leaderboardService.getUserRank('U2222222222')

      expect(rank1).toBe(2) // Second place
      expect(rank2).toBe(1) // First place
    })

    it('should return null for non-existent user', async () => {
      const rank = await leaderboardService.getUserRank('U9999999999')
      expect(rank).toBeNull()
    })
  })

  describe('formatLeaderboardForSlack', () => {
    it('should format empty leaderboard correctly', () => {
      const formatted = leaderboardService.formatLeaderboardForSlack([])
      expect(formatted).toContain('No photos submitted yet')
      expect(formatted).toContain('Be the first to post a photo')
    })

    it('should format leaderboard with users correctly', () => {
      const leaderboard = [
        { rank: 1, username: 'User One', points: 5, photos: 5 },
        { rank: 2, username: 'User Two', points: 3, photos: 3 },
        { rank: 3, username: 'User Three', points: 1, photos: 1 }
      ]

      const formatted = leaderboardService.formatLeaderboardForSlack(leaderboard)
      
      expect(formatted).toContain('🥇 *User One* - 5 points (5 photos)')
      expect(formatted).toContain('🥈 *User Two* - 3 points (3 photos)')
      expect(formatted).toContain('🥉 *User Three* - 1 point (1 photo)')
      expect(formatted).toContain('Post a photo with `/grass`')
    })

    it('should handle singular vs plural correctly', () => {
      const leaderboard = [
        { rank: 1, username: 'User One', points: 1, photos: 1 }
      ]

      const formatted = leaderboardService.formatLeaderboardForSlack(leaderboard)
      
      expect(formatted).toContain('1 point (1 photo)')
    })
  })
})
