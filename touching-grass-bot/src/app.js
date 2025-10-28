const { App } = require('@slack/bolt')
const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
require('dotenv').config()

const logger = require('./utils/logger')
const config = require('./config/config')
const { setupDatabase } = require('./database/connection')
const { handleGrassCommand, handleLeaderboardCommand } = require('./handlers/slackHandlers')

// Initialize Slack app
const slackApp = new App({
  token: config.slack.botToken,
  signingSecret: config.slack.signingSecret,
  socketMode: true,
  appToken: config.slack.appToken,
  port: config.server.port
})

// Initialize Express app
const expressApp = express()

// Middleware
expressApp.use(helmet())
expressApp.use(cors())
expressApp.use(express.json())
expressApp.use(express.urlencoded({ extended: true }))

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: 'Too many requests from this IP, please try again later.'
})
expressApp.use('/slack/', limiter)

// Health check endpoint
expressApp.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() })
})

// Slack event handlers
slackApp.message(async ({ message, client }) => {
  try {
    // Check if message contains /grass command and has attachments
    if (message.text && message.text.includes('/grass') && message.files && message.files.length > 0) {
      await handleGrassCommand(message, client)
    }
  } catch (error) {
    logger.error('Error processing message:', error)
  }
})

// Handle bot mentions
slackApp.event('app_mention', async ({ event, client }) => {
  try {
    await client.chat.postMessage({
      channel: event.channel,
      text: `🌱 Hi! I'm the Touching Grass Bot. I help track who's getting outside and touching grass!\n\nTo use me:\n• Post photos with \`/grass\` to earn points\n• Use \`/leaderboard\` to see current rankings\n\nLet's get outside and touch some grass! 🌿`,
      thread_ts: event.ts
    })
  } catch (error) {
    logger.error('Error handling app mention:', error)
  }
})

// Slash command handlers
slackApp.command('/grass', async ({ command, ack, respond, client }) => {
  await ack()
  
  try {
    await respond({
      text: 'Please attach a photo with your /grass tag to earn points!',
      response_type: 'ephemeral'
    })
  } catch (error) {
    logger.error('Error handling /grass command:', error)
    await respond({
      text: 'Sorry, there was an error processing your request. Please try again.',
      response_type: 'ephemeral'
    })
  }
})

slackApp.command('/leaderboard', async ({ command, ack, respond }) => {
  await ack()
  
  try {
    await handleLeaderboardCommand(command, respond)
  } catch (error) {
    logger.error('Error handling /leaderboard command:', error)
    await respond({
      text: 'Sorry, there was an error retrieving the leaderboard. Please try again.',
      response_type: 'ephemeral'
    })
  }
})

// Error handling middleware
expressApp.use((error, req, res, next) => {
  logger.error('Express error:', error)
  res.status(500).json({ error: 'Internal server error' })
})

// Start the application
async function startApp() {
  try {
    // Initialize database
    await setupDatabase()
    logger.info('Database connection established')

    // Start Slack app
    await slackApp.start()
    logger.info(`Slack app started on port ${config.server.port}`)

    // Start Express server
    expressApp.listen(config.server.port, () => {
      logger.info(`Express server started on port ${config.server.port}`)
    })
  } catch (error) {
    logger.error('Failed to start application:', error)
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Shutting down gracefully...')
  await slackApp.stop()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  logger.info('Shutting down gracefully...')
  await slackApp.stop()
  process.exit(0)
})

// Start the app
startApp()
