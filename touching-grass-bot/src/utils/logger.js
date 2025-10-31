const winston = require('winston')

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'touching-grass-bot' },
  transports: [
    // Always log to console (needed for Heroku/cloud platforms)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.simple(),
        winston.format.printf(({ level, message, timestamp, ...meta }) => {
          const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : ''
          return `${timestamp} [${level}]: ${message} ${metaStr}`
        })
      )
    })
  ]
})

// Also log to files if not on Heroku (has writable filesystem)
if (process.env.NODE_ENV !== 'production' || !process.env.DYNO) {
  logger.add(new winston.transports.File({ filename: 'logs/error.log', level: 'error' }))
  logger.add(new winston.transports.File({ filename: 'logs/combined.log' }))
}

module.exports = logger
