const OpenAI = require('openai')
const logger = require('../utils/logger')

// Lazy load sharp only when needed (it has native bindings that may fail to load)
let sharp = null
function getSharp () {
  if (!sharp) {
    try {
      sharp = require('sharp')
    } catch (error) {
      logger.warn('Sharp module not available, image conversion will be skipped')
      return null
    }
  }
  return sharp
}

// OpenAI supported image formats
const SUPPORTED_FORMATS = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']

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

      // Build prompt with user's name and comment if available
      // Make it spicy, witty, and genuinely funny - the kind of comment that makes people want to post more
      let prompt = 'Write a hilarious, clever comment (2-3 sentences) about this outdoor photo. Focus on the activity and environment - what they\'re doing outdoors, the scenery, nature, weather, or the adventure itself. Be witty, make clever observations, and throw in some gentle roasting if it fits. Think of yourself as that funny friend who always has the perfect quip - sharp but supportive. Make it memorable and make people laugh. Use emojis sparingly (1-2 max).'

      if (userName && userComment) {
        prompt = `Write a hilarious, clever comment (1-2 sentences) about this outdoor photo posted by ${userName}. They wrote: "${userComment}". Focus on the activity and environment - what they're doing outdoors, the scenery, nature, weather, or the adventure itself. Address ${userName} directly with witty banter and clever observations. Reference their comment with humor - maybe playfully roast it if there's something funny to call out. Be sharp, clever, and make them (and everyone reading) laugh. Think of yourself as that friend who always has the perfect zinger - supportive but with personality. Keep it workplace appropriate. Use emojis sparingly (1-2 max).`
      } else if (userName) {
        prompt = `Write a hilarious, clever comment (1-2 sentences) about this outdoor photo posted by ${userName}. Focus on the activity and environment - what they're doing outdoors, the scenery, nature, weather, or the adventure itself. Address ${userName} directly with witty banter, clever observations, and some gentle roasting if appropriate. Be sharp, funny, and make them (and everyone reading) laugh. Think of yourself as that friend who always has the perfect quip - supportive but with edge. Keep it workplace appropriate. Use emojis sparingly (1-2 max).`
      } else if (userComment) {
        prompt = `Write a hilarious, clever comment (1-2 sentences) about this outdoor photo. They wrote: "${userComment}". Focus on the activity and environment - what they're doing outdoors, the scenery, nature, weather, or the adventure itself. Reference their comment with humor - playfully roast it or find the funny angle. Make clever observations about what you see. Be sharp, witty, and make people laugh. Think of yourself as that funny friend who always has the perfect zinger. Keep it workplace appropriate. Use emojis sparingly (1-2 max).`
      }

      // Try to process image first
      let imageProcessed = false
      let base64Image = null
      let finalMimeType = null

      try {
        // Fetch the image from Slack with authentication
        const imageResponse = await fetch(imageUrl, {
          headers: {
            Authorization: `Bearer ${botToken}`
          }
        })

        if (!imageResponse.ok) {
          throw new Error(`Failed to fetch image from Slack: ${imageResponse.statusText}`)
        }

        const imageBuffer = Buffer.from(await imageResponse.arrayBuffer())
        let mimeType = imageResponse.headers.get('content-type') || 'image/jpeg'
        
        // Normalize mime type (handle variations like 'image/jpg')
        if (mimeType === 'image/jpg') {
          mimeType = 'image/jpeg'
        }

        // Check if format is supported by OpenAI, convert if needed
        let processedBuffer = imageBuffer
        finalMimeType = mimeType

        if (!SUPPORTED_FORMATS.includes(mimeType)) {
          logger.info(`Converting unsupported image format ${mimeType} to JPEG`)
          const sharpLib = getSharp()
          if (sharpLib) {
            try {
              // Use sharp to auto-detect format and convert to JPEG
              // Sharp can handle many formats including HEIC/HEIF
              processedBuffer = await sharpLib(imageBuffer)
                .jpeg({ quality: 90 })
                .toBuffer()
              finalMimeType = 'image/jpeg'
              logger.info(`Successfully converted image from ${mimeType} to JPEG`)
            } catch (conversionError) {
              logger.warn(`Sharp conversion failed: ${conversionError.message}, falling back to text-only`)
              throw new Error(`Image format conversion failed: ${conversionError.message}`)
            }
          } else {
            logger.warn(`Sharp not available, cannot convert ${mimeType} format`)
            throw new Error(`Unsupported image format ${mimeType} and sharp not available`)
          }
        }

        base64Image = processedBuffer.toString('base64')
        imageProcessed = true
      } catch (imageError) {
        logger.warn(`Image processing failed, falling back to text-only mode: ${imageError.message}`)
        // Continue to text-only fallback
      }

      // Try with image if available, fallback to text-only
      try {
        const content = []
        content.push({
          type: 'text',
          text: prompt
        })

        if (imageProcessed && base64Image && finalMimeType) {
          content.push({
            type: 'image_url',
            image_url: {
              url: `data:${finalMimeType};base64,${base64Image}`
            }
          })
        }

        const response = await this.client.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            {
              role: 'user',
              content
            }
          ],
          max_tokens: 200,
          temperature: 0.8
        })

        let comment = response.choices[0]?.message?.content?.trim()

        if (!comment) {
          logger.warn('OpenAI returned empty comment')
          return null
        }

        // Remove quotes from beginning and end (single, double, backticks, smart quotes, guillemets)
        // Handle common quote characters: " ' ` « » " "
        comment = comment.replace(/^["'`«"']+/, '').replace(/["'`»"']+$/, '').trim()

        logger.info(`AI comment generated successfully${imageProcessed ? '' : ' (text-only fallback)'}`)
        return comment
      } catch (openAIError) {
        // If image was included and it failed, try text-only as fallback
        if (imageProcessed && base64Image && finalMimeType) {
          logger.warn(`OpenAI request with image failed, falling back to text-only: ${openAIError.message}`)
          try {
            const response = await this.client.chat.completions.create({
              model: 'gpt-4o',
              messages: [
                {
                  role: 'user',
                  content: [
                    {
                      type: 'text',
                      text: prompt
                    }
                  ]
                }
              ],
              max_tokens: 200,
              temperature: 0.8
            })

            let comment = response.choices[0]?.message?.content?.trim()

            if (!comment) {
              logger.warn('OpenAI returned empty comment (text-only fallback)')
              return null
            }

            comment = comment.replace(/^["'`«"']+/, '').replace(/["'`»"']+$/, '').trim()

            logger.info('AI comment generated successfully (text-only fallback)')
            return comment
          } catch (fallbackError) {
            logger.error('Error in text-only fallback:', fallbackError)
            throw fallbackError
          }
        } else {
          // If we're already in text-only mode and it failed, throw the error
          throw openAIError
        }
      }
    } catch (error) {
      logger.error('Error analyzing photo with AI:', error)
      return null
    }
  }
}

module.exports = new AIService()
