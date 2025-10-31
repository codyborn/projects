const OpenAI = require('openai')
const logger = require('../utils/logger')

class AIService {
  constructor () {
    this.client = null
    if (process.env.OPENAI_API_KEY) {
      this.client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      })
    }
  }

  async analyzePhoto (imageUrl, botToken, userName = '', userComment = '') {
    try {
      if (!this.client) {
        logger.warn('OpenAI API key not configured, skipping AI analysis')
        return null
      }

      // Fetch the image from Slack with authentication
      const imageResponse = await fetch(imageUrl, {
        headers: {
          Authorization: `Bearer ${botToken}`
        }
      })

      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch image from Slack: ${imageResponse.statusText}`)
      }

      const imageBuffer = await imageResponse.arrayBuffer()
      const base64Image = Buffer.from(imageBuffer).toString('base64')
      const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg'

      // Build prompt with user's name and comment if available
      // Make it spicy, witty, and genuinely funny - the kind of comment that makes people want to post more
      let prompt = 'Write a hilarious, clever comment (2-3 sentences) about this outdoor photo. Be witty, make clever observations, and throw in some gentle roasting if it fits. Think of yourself as that funny friend who always has the perfect quip - sharp but supportive. Make it memorable and make people laugh. Use emojis sparingly (1-2 max).'

      if (userName && userComment) {
        prompt = `Write a hilarious, clever comment (1-2 sentences) about this outdoor photo posted by ${userName}. They wrote: "${userComment}". Address ${userName} directly with witty banter and clever observations. Reference their comment with humor - maybe playfully roast it if there's something funny to call out. Be sharp, clever, and make them (and everyone reading) laugh. Think of yourself as that friend who always has the perfect zinger - supportive but with personality. Use emojis sparingly (1-2 max).`
      } else if (userName) {
        prompt = `Write a hilarious, clever comment (1-2 sentences) about this outdoor photo posted by ${userName}. Address ${userName} directly with witty banter, clever observations, and some gentle roasting if appropriate. Be sharp, funny, and make them (and everyone reading) laugh. Think of yourself as that friend who always has the perfect quip - supportive but with edge. Use emojis sparingly (1-2 max).`
      } else if (userComment) {
        prompt = `Write a hilarious, clever comment (1-2 sentences) about this outdoor photo. They wrote: "${userComment}". Reference their comment with humor - playfully roast it or find the funny angle. Make clever observations about what you see. Be sharp, witty, and make people laugh. Think of yourself as that funny friend who always has the perfect zinger. Use emojis sparingly (1-2 max).`
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
        max_tokens: 200,
        temperature: 0.8
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
