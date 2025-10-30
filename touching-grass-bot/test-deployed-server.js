#!/usr/bin/env node
/**
 * Standalone script to test the deployed Heroku server
 * 
 * Usage: node test-deployed-server.js
 * Or: DEPLOYED_SERVER_URL=https://your-server.com node test-deployed-server.js
 */

const https = require('https')
const { URL } = require('url')

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

async function testDeployedServer() {
  console.log('🧪 Testing deployed server...\n')
  console.log(`📍 Server URL: ${DEPLOYED_URL}\n`)

  try {
    // Test health endpoint
    console.log('1️⃣ Testing health endpoint...')
    const healthResponse = await makeRequest(`${DEPLOYED_URL}/health`)
    
    if (healthResponse.status === 200 && healthResponse.data.status === 'healthy') {
      console.log('✅ Health check passed!')
      console.log(`   Status: ${healthResponse.data.status}`)
      console.log(`   Timestamp: ${healthResponse.data.timestamp}`)
    } else {
      console.log('❌ Health check failed!')
      console.log(`   Status Code: ${healthResponse.status}`)
      console.log(`   Response:`, healthResponse.data)
      process.exit(1)
    }

    console.log('\n📊 Server Status:')
    console.log(`   ✅ Server is up and responding`)
    console.log(`   🌐 URL: ${DEPLOYED_URL}`)
    console.log(`   ⏰ Last check: ${healthResponse.data.timestamp}`)

    console.log('\n💡 Next Steps to Test AI Comments:')
    console.log('   1. Post a photo in Slack with "grass" in the caption')
    console.log('   2. Watch real-time logs: heroku logs --tail --app touching-grass-bot')
    console.log('   3. Check the bot\'s response in Slack')
    console.log('   4. The response should include:')
    console.log('      - Your name personalized in the greeting')
    console.log('      - Your points and ranking')
    console.log('      - An AI-generated comment about your photo!')
    console.log('')

    process.exit(0)
  } catch (error) {
    console.error('\n❌ Server test failed!')
    console.error(`   Error: ${error.message}`)
    console.error(`   Make sure the server is running at: ${DEPLOYED_URL}`)
    process.exit(1)
  }
}

testDeployedServer()

