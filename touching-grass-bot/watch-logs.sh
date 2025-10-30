#!/bin/bash
# Watch Heroku logs in real-time
# Usage: ./watch-logs.sh

echo "📺 Watching Heroku logs for touching-grass-bot..."
echo "   Post a photo with 'grass' in Slack to see it in action!"
echo "   Press Ctrl+C to stop\n"

heroku logs --tail --app touching-grass-bot

