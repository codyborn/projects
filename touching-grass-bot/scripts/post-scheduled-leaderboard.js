#!/usr/bin/env node
/**
 * Standalone script for Heroku Scheduler to post the weekly leaderboard.
 * Run via: node scripts/post-scheduled-leaderboard.js
 *
 * This script does NOT load the full app - it only sets up what's needed
 * (config, database, Slack client) to post the leaderboard.
 */

const config = require('../src/config/config')
const { WebClient } = require('@slack/web-api')
const { setupDatabase } = require('../src/database/connection')
const leaderboardService = require('../src/services/leaderboardService')
const logger = require('../src/utils/logger')

async function postScheduledLeaderboard () {
  try {
    const channelId = config.slack.leaderboardChannelId

    if (!channelId) {
      logger.warn('LEADERBOARD_CHANNEL_ID not configured, skipping scheduled leaderboard post')
      process.exit(0)
    }

    // Only post on Fridays in America/New_York timezone (Heroku runs in UTC)
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      weekday: 'short'
    })
    const dayName = formatter.format(new Date())
    const bypassFridayCheck = process.env.LEADERBOARD_POST_OVERRIDE === 'true' // Set for one-off testing only

    if (!bypassFridayCheck && dayName !== 'Fri') {
      logger.info(`Skipping scheduled leaderboard post - today is ${dayName} (not Friday in ET)`)
      process.exit(0)
    }

    logger.info('Posting scheduled weekly leaderboard...')

    await setupDatabase()

    let leaderboardData
    let popularPosts = { period: 'weekly', posts: [] }

    try {
      leaderboardData = await leaderboardService.getLeaderboardByPeriod('recap', 10)
    } catch (error) {
      logger.error('Error getting weekly leaderboard for scheduled post:', error)
      process.exit(1)
    }

    try {
      popularPosts = await leaderboardService.getPopularPostsLeaderboard('recap', 10)
    } catch (error) {
      logger.warn('Error getting popular posts for scheduled post:', error)
    }

    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🌿 Weekly Grass Touching Recap! 🌿',
          emoji: true
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: leaderboardService.formatLeaderboardForSlack(leaderboardData.leaderboard, 'weekly')
        }
      },
      {
        type: 'divider'
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: leaderboardService.formatPopularPostsLeaderboard(popularPosts, 'weekly')
        }
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: '_This leaderboard is posted every Friday at 3:00 PM ET. Keep touching grass!_ 🌱'
          }
        ]
      }
    ]

    const client = new WebClient(config.slack.botToken)
    await client.chat.postMessage({
      channel: channelId,
      blocks,
      text: '🌿 Weekly Grass Touching Recap! Check out who touched the most grass this week!'
    })

    logger.info('Successfully posted scheduled weekly leaderboard')
    process.exit(0)
  } catch (error) {
    logger.error('Error posting scheduled leaderboard:', error)
    process.exit(1)
  }
}

postScheduledLeaderboard()
