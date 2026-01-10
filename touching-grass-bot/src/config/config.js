const config = {
  server: {
    port: process.env.PORT || 3000
  },
  slack: {
    botToken: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    appToken: process.env.SLACK_APP_TOKEN,
    leaderboardChannelId: process.env.LEADERBOARD_CHANNEL_ID // Channel for scheduled leaderboard posts
  },
  database: {
    url: process.env.DATABASE_URL
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  }
}

// Validate required configuration
const requiredEnvVars = [
  'SLACK_BOT_TOKEN',
  'SLACK_SIGNING_SECRET',
  'SLACK_APP_TOKEN',
  'DATABASE_URL'
]

const missingVars = requiredEnvVars.filter(varName => !process.env[varName])

if (missingVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`)
}

module.exports = config
