// Mock OpenAI and fetch before requiring anything
const mockCreate = jest.fn()
const mockOpenAIConstructor = jest.fn().mockImplementation(() => ({
  chat: {
    completions: {
      create: mockCreate
    }
  }
}))

jest.mock('openai', () => {
  return mockOpenAIConstructor
})

// Mock fetch globally
global.fetch = jest.fn()

describe('AI Service Integration', () => {
  const mockBotToken = 'xoxb-test-token'
  const mockImageUrl = 'https://slack-files.com/test-image.jpg'
  const mockImageData = new Uint8Array([255, 216, 255, 224]) // JPEG header

  beforeEach(() => {
    jest.clearAllMocks()
    mockCreate.mockClear()
    mockOpenAIConstructor.mockClear()
    process.env.OPENAI_API_KEY = 'sk-test-key'
  })

  afterEach(() => {
    delete process.env.OPENAI_API_KEY
  })

  describe('Photo Analysis', () => {
    it('should successfully generate AI comment when OpenAI API key is set', async () => {
      // Mock successful image fetch
      global.fetch.mockResolvedValueOnce({
        ok: true,
        arrayBuffer: jest.fn().resolvedValue(mockImageData.buffer),
        headers: {
          get: jest.fn().returnValue('image/jpeg')
        }
      })

      // Mock successful OpenAI response
      mockCreate.mockResolvedValueOnce({
        choices: [{
          message: {
            content: 'Wow! Looks like you\'re really getting outside there! Great work touching grass! 🌿'
          }
        }]
      })

      // Re-require service to pick up env var and mock
      jest.resetModules()
      const aiService = require('../../src/services/aiService')
      
      const comment = await aiService.analyzePhoto(mockImageUrl, mockBotToken, 'TestUser')

      expect(comment).toBeTruthy()
      expect(comment).toContain('grass')
      expect(global.fetch).toHaveBeenCalledWith(mockImageUrl, {
        headers: { 'Authorization': `Bearer ${mockBotToken}` }
      })
      expect(mockCreate).toHaveBeenCalled()
    })

    it('should include user name in prompt when provided', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        arrayBuffer: jest.fn().resolvedValue(mockImageData.buffer),
        headers: {
          get: jest.fn().returnValue('image/jpeg')
        }
      })

      mockCreate.mockResolvedValueOnce({
        choices: [{
          message: {
            content: 'Hey John! Awesome outdoor scene! Keep touching that grass!'
          }
        }]
      })

      jest.resetModules()
      const aiService = require('../../src/services/aiService')
      
      const userName = 'John'
      await aiService.analyzePhoto(mockImageUrl, mockBotToken, userName)

      expect(mockCreate).toHaveBeenCalled()
      const callArgs = mockCreate.mock.calls[0][0]
      const promptText = callArgs.messages[0].content[0].text
      expect(promptText).toContain(userName)
      expect(promptText).toContain('posted by')
    })

    it('should return null when OpenAI API key is not set', async () => {
      delete process.env.OPENAI_API_KEY
      
      jest.resetModules()
      aiService = require('../../src/services/aiService')

      const comment = await aiService.analyzePhoto(mockImageUrl, mockBotToken, 'TestUser')

      expect(comment).toBeNull()
      expect(global.fetch).not.toHaveBeenCalled()
    })

    it('should return null when image fetch fails', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'))

      const comment = await aiService.analyzePhoto(mockImageUrl, mockBotToken, 'TestUser')

      expect(comment).toBeNull()
      expect(mockCreate).not.toHaveBeenCalled()
    })

    it('should return null when image fetch returns non-ok status', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found'
      })

      const comment = await aiService.analyzePhoto(mockImageUrl, mockBotToken, 'TestUser')

      expect(comment).toBeNull()
      expect(mockCreate).not.toHaveBeenCalled()
    })

    it('should return null when OpenAI API returns empty response', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        arrayBuffer: jest.fn().resolvedValue(mockImageData.buffer),
        headers: {
          get: jest.fn().returnValue('image/jpeg')
        }
      })

      mockCreate.mockResolvedValueOnce({
        choices: [{
          message: {
            content: ''
          }
        }]
      })

      const comment = await aiService.analyzePhoto(mockImageUrl, mockBotToken, 'TestUser')

      expect(comment).toBeNull()
    })

    it('should handle OpenAI API errors gracefully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        arrayBuffer: jest.fn().resolvedValue(mockImageData.buffer),
        headers: {
          get: jest.fn().returnValue('image/jpeg')
        }
      })

      mockCreate.mockRejectedValueOnce(new Error('OpenAI API error'))

      const comment = await aiService.analyzePhoto(mockImageUrl, mockBotToken, 'TestUser')

      expect(comment).toBeNull()
    })
  })
})

