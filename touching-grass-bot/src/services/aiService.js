const OpenAI = require('openai')
const logger = require('../utils/logger')
const config = require('../config/config')

class AIService {
  constructor() {
    this.client = null
    if (process.env.OPENAI_API_KEY) {
      this.client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      })
    }
  }

  async analyzePhoto(imageUrl, botToken, userName = '', userComment = '') {
    try {
      if (!this.client) {
        logger.warn('OpenAI API key not configured, skipping AI analysis')
        return null
      }

      // Fetch the image from Slack with authentication
      const imageResponse = await fetch(imageUrl, {
        headers: {
          'Authorization': `Bearer ${botToken}`
        }
      })

      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch image from Slack: ${imageResponse.statusText}`)
      }

      const imageBuffer = await imageResponse.arrayBuffer()
      const base64Image = Buffer.from(imageBuffer).toString('base64')
      const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg'

      // Build prompt with user's name and comment if available
      let prompt = 'Look at this outdoor/workout photo someone posted. Write a fun, playful comment (2-3 sentences max) with light, good-natured teasing - like joking with a close friend. Be encouraging and positive, but add playful humor. Maybe gently poke fun at something minor (like being overly dramatic about a simple walk, or finally getting off the couch). Keep it supportive, uplifting, and specific about what you see. Use emojis sparingly. Keep it casual and friendly. The goal is to make them laugh while still celebrating their outdoor activity.'
      
      if (userName && userComment) {
        prompt = `Look at this outdoor/workout photo posted by ${userName}. They wrote: "${userComment}". Write a fun, playful comment (2-3 sentences max) with light, good-natured teasing - like joking with a close friend. Address ${userName} directly with gentle humor. Reference their comment playfully if relevant (maybe gently tease about being dramatic, or make a light joke about the activity). Be encouraging and positive, but add playful humor. Keep it supportive and uplifting. Be specific about what you see. Use emojis sparingly. Keep it casual and friendly. The goal is to make them laugh while still celebrating their outdoor activity.`
      } else if (userName) {
        prompt = `Look at this outdoor/workout photo posted by ${userName}. Write a fun, playful comment (2-3 sentences max) with light, good-natured teasing - like joking with a close friend. Address ${userName} directly with gentle humor (maybe gently poke fun at something minor, like being overly dramatic or finally getting off the couch). Be encouraging and positive, but add playful humor. Keep it supportive and uplifting. Be specific about what you see. Use emojis sparingly. Keep it casual and friendly. The goal is to make them laugh while still celebrating their outdoor activity.`
      } else if (userComment) {
        prompt = `Look at this outdoor/workout photo someone posted. They wrote: "${userComment}". Write a fun, playful comment (2-3 sentences max) with light, good-natured teasing - like joking with a close friend. Reference their comment playfully if relevant. Be encouraging and positive, but add playful humor. Keep it supportive and uplifting. Be specific about what you see. Use emojis sparingly. Keep it casual and friendly. The goal is to make them laugh while still celebrating their outdoor activity.`
      }

      // Analyze the image with OpenAI
      const response = await this.client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 150
      })

      const comment = response.choices[0]?.message?.content?.trim()
      
      if (!comment) {
        logger.warn('OpenAI returned empty comment')
        return null
      }

      logger.info('AI comment generated successfully')
      return comment

    } catch (error) {
      logger.error('Error analyzing photo with AI:', error)
      return null
    }
  }
}

module.exports = new AIService()

