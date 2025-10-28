// Test setup file
const { setupDatabase, closeDatabase } = require('../src/database/connection')

// Set test environment variables
process.env.NODE_ENV = 'test'
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/touching_grass_test'
process.env.SLACK_BOT_TOKEN = 'xoxb-test-token'
process.env.SLACK_SIGNING_SECRET = 'test-signing-secret'
process.env.SLACK_APP_TOKEN = 'xapp-test-token'
process.env.LOG_LEVEL = 'error'
process.env.PORT = '3001'

// Global test setup
beforeAll(async () => {
  try {
    await setupDatabase()
  } catch (error) {
    console.error('Failed to setup test database:', error)
    console.log('Make sure PostgreSQL is running and you have a test database created')
    console.log('You can create it with: createdb touching_grass_test')
  }
})

// Global test teardown
afterAll(async () => {
  try {
    await closeDatabase()
  } catch (error) {
    console.error('Error closing test database:', error)
  }
})
