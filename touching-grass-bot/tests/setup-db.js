const { Client } = require('pg')

async function createTestDatabase() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'test',
    password: 'test',
    database: 'postgres' // Connect to default database to create test database
  })

  try {
    await client.connect()
    
    // Check if test database exists
    const result = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = 'touching_grass_test'"
    )
    
    if (result.rows.length === 0) {
      console.log('Creating test database...')
      await client.query('CREATE DATABASE touching_grass_test')
      console.log('Test database created successfully')
    } else {
      console.log('Test database already exists')
    }
  } catch (error) {
    console.error('Error creating test database:', error)
    throw error
  } finally {
    await client.end()
  }
}

if (require.main === module) {
  createTestDatabase()
    .then(() => {
      console.log('Test database setup complete')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Test database setup failed:', error)
      process.exit(1)
    })
}

module.exports = { createTestDatabase }
