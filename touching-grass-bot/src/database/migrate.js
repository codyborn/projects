const fs = require('fs')
const path = require('path')
const { query } = require('./connection')
const logger = require('../utils/logger')

async function runMigrations() {
  try {
    const migrationsDir = path.join(__dirname, 'migrations')
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort()

    logger.info(`Found ${migrationFiles.length} migration files`)

    for (const file of migrationFiles) {
      const migrationPath = path.join(migrationsDir, file)
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
      
      logger.info(`Running migration: ${file}`)
      await query(migrationSQL)
      logger.info(`Completed migration: ${file}`)
    }

    logger.info('All migrations completed successfully')
  } catch (error) {
    logger.error('Migration failed:', error)
    throw error
  }
}

if (require.main === module) {
  const { setupDatabase } = require('./connection')
  
  async function migrate() {
    try {
      await setupDatabase()
      await runMigrations()
      process.exit(0)
    } catch (error) {
      logger.error('Migration process failed:', error)
      process.exit(1)
    }
  }
  
  migrate()
}

module.exports = { runMigrations }
