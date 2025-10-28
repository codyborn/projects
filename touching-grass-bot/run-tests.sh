#!/bin/bash

# Test runner script for touching-grass-bot
# This script sets up the environment and runs tests

set -e

echo "🌱 Touching Grass Bot - Test Runner"
echo "=================================="

# Check if PostgreSQL is running
if ! pg_isready -q; then
    echo "❌ PostgreSQL is not running. Starting it..."
    brew services start postgresql@15
    sleep 2
fi

# Set up environment variables
export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"
export NODE_ENV=test
export DATABASE_URL="postgresql://cody.born@localhost:5432/touching_grass_test"
export SLACK_BOT_TOKEN="xoxb-test-token"
export SLACK_SIGNING_SECRET="test-secret"
export SLACK_APP_TOKEN="xapp-test-token"

echo "📊 Setting up test database..."

# Check if test database exists, create if not
if ! psql -lqt | cut -d \| -f 1 | grep -qw touching_grass_test; then
    echo "Creating test database..."
    createdb touching_grass_test
fi

# Run migrations
echo "🔄 Running database migrations..."
npm run test:db:migrate

echo "🧪 Running tests..."
npm test

echo "✅ All tests completed!"
