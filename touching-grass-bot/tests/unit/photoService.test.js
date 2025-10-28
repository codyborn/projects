const photoService = require('../../src/services/photoService')
const userService = require('../../src/services/userService')
const { query } = require('../../src/database/connection')

describe('PhotoService', () => {
  beforeEach(async () => {
    // Clean up test data
    await query('DELETE FROM photos')
    await query('DELETE FROM users')
  })

  describe('recordPhotoSubmission', () => {
    it('should create photo record with valid data', async () => {
      const user = await userService.createOrUpdateUser({
        slack_user_id: 'U1234567890',
        slack_username: 'testuser',
        display_name: 'Test User'
      })

      const photoData = {
        user_id: user.id,
        slack_message_ts: '1234567890.123456',
        slack_channel_id: 'C1234567890',
        image_url: 'https://example.com/image.jpg',
        points_awarded: 1
      }

      const photo = await photoService.recordPhotoSubmission(photoData)

      expect(photo).toBeDefined()
      expect(photo.user_id).toBe(user.id)
      expect(photo.slack_message_ts).toBe('1234567890.123456')
      expect(photo.slack_channel_id).toBe('C1234567890')
      expect(photo.image_url).toBe('https://example.com/image.jpg')
      expect(photo.points_awarded).toBe(1)
    })

    it('should associate photo with correct user', async () => {
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

      const photo1 = await photoService.recordPhotoSubmission({
        user_id: user1.id,
        slack_message_ts: '1111111111.111111',
        slack_channel_id: 'C1234567890',
        image_url: 'https://example.com/image1.jpg'
      })

      const photo2 = await photoService.recordPhotoSubmission({
        user_id: user2.id,
        slack_message_ts: '2222222222.222222',
        slack_channel_id: 'C1234567890',
        image_url: 'https://example.com/image2.jpg'
      })

      expect(photo1.user_id).toBe(user1.id)
      expect(photo2.user_id).toBe(user2.id)
    })

    it('should handle missing image URL gracefully', async () => {
      const user = await userService.createOrUpdateUser({
        slack_user_id: 'U1234567890',
        slack_username: 'testuser',
        display_name: 'Test User'
      })

      const photoData = {
        user_id: user.id,
        slack_message_ts: '1234567890.123456',
        slack_channel_id: 'C1234567890',
        image_url: null,
        points_awarded: 1
      }

      const photo = await photoService.recordPhotoSubmission(photoData)
      expect(photo.image_url).toBeNull()
    })
  })

  describe('getPhotosByUser', () => {
    it('should return photos for valid user', async () => {
      const user = await userService.createOrUpdateUser({
        slack_user_id: 'U1234567890',
        slack_username: 'testuser',
        display_name: 'Test User'
      })

      // Add multiple photos
      await photoService.recordPhotoSubmission({
        user_id: user.id,
        slack_message_ts: '1111111111.111111',
        slack_channel_id: 'C1234567890',
        image_url: 'https://example.com/image1.jpg'
      })

      await photoService.recordPhotoSubmission({
        user_id: user.id,
        slack_message_ts: '2222222222.222222',
        slack_channel_id: 'C1234567890',
        image_url: 'https://example.com/image2.jpg'
      })

      const photos = await photoService.getPhotosByUser(user.id)

      expect(photos).toHaveLength(2)
      expect(photos[0].user_id).toBe(user.id)
      expect(photos[1].user_id).toBe(user.id)
    })

    it('should return empty array for user with no photos', async () => {
      const user = await userService.createOrUpdateUser({
        slack_user_id: 'U1234567890',
        slack_username: 'testuser',
        display_name: 'Test User'
      })

      const photos = await photoService.getPhotosByUser(user.id)
      expect(photos).toHaveLength(0)
    })

    it('should handle pagination correctly', async () => {
      const user = await userService.createOrUpdateUser({
        slack_user_id: 'U1234567890',
        slack_username: 'testuser',
        display_name: 'Test User'
      })

      // Add 5 photos
      for (let i = 1; i <= 5; i++) {
        await photoService.recordPhotoSubmission({
          user_id: user.id,
          slack_message_ts: `${i}000000000.000000`,
          slack_channel_id: 'C1234567890',
          image_url: `https://example.com/image${i}.jpg`
        })
      }

      const photos = await photoService.getPhotosByUser(user.id, 3)
      expect(photos).toHaveLength(3)
    })
  })

  describe('getPhotoByMessageTs', () => {
    it('should return photo for valid message timestamp', async () => {
      const user = await userService.createOrUpdateUser({
        slack_user_id: 'U1234567890',
        slack_username: 'testuser',
        display_name: 'Test User'
      })

      const photo = await photoService.recordPhotoSubmission({
        user_id: user.id,
        slack_message_ts: '1234567890.123456',
        slack_channel_id: 'C1234567890',
        image_url: 'https://example.com/image.jpg'
      })

      const foundPhoto = await photoService.getPhotoByMessageTs('1234567890.123456')

      expect(foundPhoto).toBeDefined()
      expect(foundPhoto.id).toBe(photo.id)
      expect(foundPhoto.slack_message_ts).toBe('1234567890.123456')
    })

    it('should return null for non-existent message timestamp', async () => {
      const photo = await photoService.getPhotoByMessageTs('9999999999.999999')
      expect(photo).toBeNull()
    })
  })

  describe('getTotalPhotosCount', () => {
    it('should return correct count of photos', async () => {
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

      // Add photos for both users
      await photoService.recordPhotoSubmission({
        user_id: user1.id,
        slack_message_ts: '1111111111.111111',
        slack_channel_id: 'C1234567890',
        image_url: 'https://example.com/image1.jpg'
      })

      await photoService.recordPhotoSubmission({
        user_id: user2.id,
        slack_message_ts: '2222222222.222222',
        slack_channel_id: 'C1234567890',
        image_url: 'https://example.com/image2.jpg'
      })

      const count = await photoService.getTotalPhotosCount()
      expect(count).toBe(2)
    })

    it('should return 0 when no photos exist', async () => {
      const count = await photoService.getTotalPhotosCount()
      expect(count).toBe(0)
    })
  })
})
