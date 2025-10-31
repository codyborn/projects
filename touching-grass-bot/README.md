# Touching Grass Bot

A Slack bot that tracks users who post photos tagged with `grass` for a leaderboard.

## Quick Start

```bash
npm install
npm run db:migrate
npm start
```

## Pre-Deploy Checklist

Before deploying to Heroku, run:

```bash
# Full check (syntax + lint + tests)
npm run check

# Or just syntax check (fastest)
npm run syntax-check

# Or pre-deploy checks
npm run pre-deploy
```

This will catch:
- ✅ JavaScript syntax errors (like duplicate variable declarations)
- ✅ Basic linting issues
- ✅ Missing required files

## Deployment

1. Run pre-deploy checks: `npm run pre-deploy`
2. Commit your changes
3. Push to Heroku: `git push heroku main`

## Development

```bash
# Start with auto-reload
npm run dev

# Run tests
npm test

# Lint code
npm run lint
npm run lint:fix  # Auto-fix issues

# Watch logs
npm run logs
```

## Environment Variables

See `ENVIRONMENT.md` for required environment variables.
