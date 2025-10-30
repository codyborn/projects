#!/usr/bin/env node
/**
 * Test AI comment generation with a local image file
 * 
 * Usage: node test-ai-comment.js [image-path] [user-name] [user-comment]
 * Example: node test-ai-comment.js grass.png "TestUser" "Just went for a hike!"
 */

const fs = require('fs')
const path = require('path')
const OpenAI = require('openai')

// Get command line arguments
const imagePath = process.argv[2] || 'grass.png'
const userName = process.argv[3] || 'TestUser'
const openaiKey = process.env.OPENAI_API_KEY

if (!openaiKey) {
  console.error('❌ Error: OPENAI_API_KEY environment variable is not set')
  console.log('\n💡 To test with the deployed server\'s key:')
  console.log('   heroku config:get OPENAI_API_KEY --app touching-grass-bot')
  console.log('   Then: OPENAI_API_KEY="your-key" node test-ai-comment.js grass.png\n')
  process.exit(1)
}

// Check if image file exists
const fullImagePath = path.resolve(imagePath)
if (!fs.existsSync(fullImagePath)) {
  console.error(`❌ Error: Image file not found: ${fullImagePath}`)
  process.exit(1)
}

async function testAIComment() {
  try {
    // Get user comment from command line (optional)
    const userComment = process.argv[4] || ''

    console.log('🧪 Testing AI Comment Generation\n')
    console.log(`📸 Image: ${fullImagePath}`)
    console.log(`👤 User: ${userName}`)
    if (userComment) {
      console.log(`💬 User Comment: "${userComment}"`)
    }
    console.log(`🤖 Model: gpt-4o\n`)

    // Read and encode the image
    console.log('1️⃣ Reading image file...')
    const imageBuffer = fs.readFileSync(fullImagePath)
    const base64Image = imageBuffer.toString('base64')
    
    // Determine MIME type from file extension
    const ext = path.extname(fullImagePath).toLowerCase()
    const mimeTypes = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.webp': 'image/webp'
    }
    const mimeType = mimeTypes[ext] || 'image/png'

    console.log(`   ✅ Image read: ${(imageBuffer.length / 1024).toFixed(2)} KB`)
    console.log(`   📋 MIME type: ${mimeType}\n`)

    // Initialize OpenAI client
    console.log('2️⃣ Connecting to OpenAI API...')
    const client = new OpenAI({
      apiKey: openaiKey
    })
    console.log('   ✅ Connected\n')

    // Build prompt with user's name and comment if available
    let prompt = ''
    if (userName && userComment) {
      prompt = `Look at this outdoor/workout photo posted by ${userName}. They wrote: "${userComment}". Write a fun, encouraging comment (2-3 sentences max) about ${userName} touching grass and getting outside. Address ${userName} directly, reference their comment when relevant, and be positive, specific about what you see. Use emojis sparingly. Keep it casual and friendly.`
    } else if (userName) {
      prompt = `Look at this outdoor/workout photo posted by ${userName}. Write a fun, encouraging comment (2-3 sentences max) about ${userName} touching grass and getting outside. Address ${userName} directly and be positive, specific about what you see, and use emojis sparingly. Keep it casual and friendly.`
    } else if (userComment) {
      prompt = `Look at this outdoor/workout photo someone posted. They wrote: "${userComment}". Write a fun, encouraging comment (2-3 sentences max) about touching grass and getting outside. Reference their comment when relevant, be positive, specific about what you see, and use emojis sparingly. Keep it casual and friendly.`
    } else {
      prompt = 'Look at this outdoor/workout photo someone posted. Write a fun, encouraging comment (2-3 sentences max) about touching grass and getting outside. Be positive, specific about what you see, and use emojis sparingly. Keep it casual and friendly.'
    }

    console.log('3️⃣ Sending image to OpenAI for analysis...')
    const response = await client.chat.completions.create({
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
      console.error('❌ OpenAI returned empty comment')
      console.error('Response:', JSON.stringify(response, null, 2))
      process.exit(1)
    }

    console.log('   ✅ Analysis complete!\n')

    console.log('🎉 AI Comment Generated:\n')
    console.log('━'.repeat(60))
    console.log(comment)
    console.log('━'.repeat(60))

    console.log('\n✅ Test completed successfully!')
    console.log('\n💡 This is what users will see in Slack when they post photos!')

  } catch (error) {
    console.error('\n❌ Error testing AI comment:')
    if (error.message) {
      console.error(`   ${error.message}`)
    } else {
      console.error(error)
    }
    process.exit(1)
  }
}

testAIComment()

