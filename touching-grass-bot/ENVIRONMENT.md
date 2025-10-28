# Environment Variables

## Required Variables
- `SLACK_BOT_TOKEN` - Bot User OAuth Token (starts with xoxb-)
- `SLACK_SIGNING_SECRET` - Signing Secret from Slack App settings
- `SLACK_APP_TOKEN` - App-Level Token (starts with xapp-)
- `DATABASE_URL` - PostgreSQL connection string
- `NODE_ENV` - Environment (development, test, production)

## Optional Variables
- `PORT` - Server port (defaults to 3000)
- `LOG_LEVEL` - Logging level (defaults to info)
- `RATE_LIMIT_WINDOW_MS` - Rate limit window in milliseconds
- `RATE_LIMIT_MAX_REQUESTS` - Max requests per window

## Example .env file
```
NODE_ENV=development
PORT=3000
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_SIGNING_SECRET=your-signing-secret
SLACK_APP_TOKEN=xapp-your-app-token
DATABASE_URL=postgresql://username:password@localhost:5432/touching_grass
LOG_LEVEL=debug
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```
