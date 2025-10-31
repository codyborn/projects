const { Pool } = require('pg')
const config = require('../config/config')
const logger = require('../utils/logger')

let pool = null

async function setupDatabase () {
  try {
    pool = new Pool({
      connectionString: config.database.url,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    })

    // Test the connection
    const client = await pool.connect()
    await client.query('SELECT NOW()')
    client.release()

    logger.info('Database connection established successfully')
  } catch (error) {
    logger.error('Failed to connect to database:', error)
    throw error
  }
}

function getPool () {
  if (!pool) {
    throw new Error('Database not initialized. Call setupDatabase() first.')
  }
  return pool
}

async function query (text, params) {
  const pool = getPool()
  const start = Date.now()
  try {
    const result = await pool.query(text, params)
    const duration = Date.now() - start
    logger.debug('Executed query', { text, duration, rows: result.rowCount })
    return result
  } catch (error) {
    logger.error('Database query error:', { text, error: error.message })
    throw error
  }
}

async function getClient () {
  const pool = getPool()
  return await pool.connect()
}

async function closeDatabase () {
  if (pool) {
    await pool.end()
    pool = null
    logger.info('Database connection closed')
  }
}

module.exports = {
  setupDatabase,
  getPool,
  query,
  getClient,
  closeDatabase
}
