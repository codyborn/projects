/**
 * Integration test for deployed Heroku server
 * 
 * This test actually calls the deployed server endpoints
 * Run with: DEPLOYED_SERVER_URL=https://your-server.com npm test -- tests/integration/deployedServer.test.js --setupFilesAfterEnv="[]"
 * 
 * Note: This test is standalone and doesn't require database/config setup
 * Use --setupFilesAfterEnv="[]" to skip the test setup file
 */

// Use Node's built-in fetch (Node 18+) or https module
const https = require('https')
const { URL } = require('url')

// Skip these tests if DEPLOYED_SERVER_URL is not set
const DEPLOYED_URL = process.env.DEPLOYED_SERVER_URL || 'https://touching-grass-bot-deacb84fbdb2.herokuapp.com'

// Helper function to make HTTPS requests
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url)
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      timeout: 10000
    }

    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => {
        data += chunk
      })
      res.on('end', () => {
        try {
          const json = JSON.parse(data)
          resolve({ status: res.statusCode, data: json })
        } catch (e) {
          resolve({ status: res.statusCode, data })
        }
      })
    })

    req.on('error', reject)
    req.on('timeout', () => {
      req.destroy()
      reject(new Error('Request timeout'))
    })
    req.end()
  })
}

describe('Deployed Server Integration', () => {
  describe('Health Check', () => {
    it('should respond to health check endpoint', async () => {
      const response = await makeRequest(`${DEPLOYED_URL}/health`)

      expect(response.status).toBe(200)
      expect(response.data).toHaveProperty('status')
      expect(response.data.status).toBe('healthy')
      expect(response.data).toHaveProperty('timestamp')
    })

    it('should be accessible and responding', async () => {
      try {
        const response = await makeRequest(`${DEPLOYED_URL}/health`)
        expect(response.status).toBe(200)
        console.log(`✅ Server is healthy: ${response.data.status}`)
        console.log(`📍 Server URL: ${DEPLOYED_URL}`)
        console.log(`⏰ Last check: ${response.data.timestamp}`)
      } catch (error) {
        console.error('❌ Server health check failed:', error.message)
        throw error
      }
    })
  })

  describe('Server Status', () => {
    it('should log server status information', async () => {
      const healthResponse = await makeRequest(`${DEPLOYED_URL}/health`)
      
      console.log('\n📊 Deployed Server Status:')
      console.log(`   Status: ${healthResponse.data.status}`)
      console.log(`   Timestamp: ${healthResponse.data.timestamp}`)
      console.log(`   URL: ${DEPLOYED_URL}`)
      console.log('\n💡 To test AI comments in Slack:')
      console.log('   1. Post a photo with "grass" in the caption')
      console.log('   2. Watch logs with: heroku logs --tail --app touching-grass-bot')
      console.log('   3. Check the bot\'s response in Slack')
      console.log('   4. The response should include your name and an AI comment!\n')
      
      expect(healthResponse.status).toBe(200)
    })
  })
})

