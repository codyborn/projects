# Touching Grass Bot

A Slack bot that tracks users who post photos tagged with `/grass` in a specific channel, maintaining a leaderboard of who's "touching grass" the most.

## Features

- **Photo Tracking**: Users can tag photos with `/grass` to earn points
- **Leaderboard**: View current rankings with `/leaderboard` command
- **Flexible Channels**: Works in any channel the bot is invited to
- **Real-time Updates**: Instant scoring and leaderboard updates
- **Heroku Ready**: Configured for easy deployment

## Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Slack App with Bot Token

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd touching-grass-bot
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp ENVIRONMENT.md .env
# Edit .env with your actual values (no GRASS_CHANNEL_ID needed)
```

4. Set up the database
```bash
npm run db:migrate
npm run db:seed
```

5. Start the development server
```bash
npm run dev
```

### Slack App Setup

1. Create a new Slack App at [api.slack.com](https://api.slack.com/apps)
2. Configure OAuth & Permissions:
   - Bot Token Scopes: `chat:write`, `channels:read`, `files:read`, `users:read`
3. Install the app to your workspace
4. Copy the Bot User OAuth Token to your `.env` file
5. Configure Event Subscriptions:
   - Subscribe to `message.channels`
   - Set Request URL to your Heroku app URL + `/slack/events`
6. Configure Slash Commands:
   - `/grass` - Submit a photo for points
   - `/leaderboard` - View current rankings

## Commands

### `/grass`
Tag a photo to submit it for points. Works in any channel the bot is invited to.

### `/leaderboard`
Display the current leaderboard showing top users by points.

## Development

### Running Tests
```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e

# Run with coverage
npm run test:coverage
```

### Code Quality
```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

## Deployment

### Heroku Deployment

1. Create a Heroku app
```bash
heroku create your-app-name
```

2. Add PostgreSQL database
```bash
heroku addons:create heroku-postgresql:hobby-dev
```

3. Set environment variables
```bash
heroku config:set SLACK_BOT_TOKEN=xoxb-your-token
heroku config:set SLACK_SIGNING_SECRET=your-secret
heroku config:set SLACK_APP_TOKEN=xapp-your-token
```

4. Deploy
```bash
git push heroku main
```

5. Run database migrations
```bash
heroku run npm run db:migrate
```

## Architecture

### Project Structure
```
src/
├── app.js                 # Main application entry point
├── config/                # Configuration files
├── database/              # Database models and migrations
├── handlers/              # Slack event handlers
├── services/              # Business logic services
├── utils/                 # Utility functions
└── middleware/            # Express middleware

tests/
├── unit/                  # Unit tests
├── integration/           # Integration tests
└── e2e/                   # End-to-end tests
```

### Key Components

- **Slack Bolt Framework**: Handles Slack API interactions
- **PostgreSQL**: Stores user data and photo submissions
- **Express.js**: Web server for Slack events and API endpoints
- **Winston**: Structured logging
- **Jest**: Testing framework

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

MIT License - see LICENSE file for details
