#!/bin/bash

# Cards Game Deployment Script
# This script helps deploy the Cards Game to various platforms

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to deploy to Heroku (without interfering with git)
deploy_heroku() {
    print_status "Deploying to Heroku..."
    
    if ! command_exists heroku; then
        print_error "Heroku CLI not found. Please install it first."
        exit 1
    fi
    
    # Get Heroku app name from environment or prompt
    if [ -z "$HEROKU_APP_NAME" ]; then
        read -p "Enter your Heroku app name: " HEROKU_APP_NAME
    fi
    
    # Method 1: Direct push using temporary remote (cleanest - doesn't modify your git config)
    if [ -d ".git" ]; then
        CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "main")
        
        print_status "Deploying from git (using temporary remote)..."
        
        # Get Heroku git URL directly (no need to add remote permanently)
        HEROKU_GIT_URL="https://git.heroku.com/${HEROKU_APP_NAME}.git"
        
        # Push directly to Heroku without adding remote
        print_status "Pushing ${CURRENT_BRANCH} to Heroku..."
        git push "$HEROKU_GIT_URL" "${CURRENT_BRANCH}:main" || {
            # If direct push fails, try with force (use carefully)
            print_warning "Direct push failed, trying with force..."
            read -p "Force push to Heroku? (y/N): " FORCE_PUSH
            if [ "$FORCE_PUSH" = "y" ] || [ "$FORCE_PUSH" = "Y" ]; then
                git push "$HEROKU_GIT_URL" "${CURRENT_BRANCH}:main" --force
            else
                print_error "Deployment cancelled"
                exit 1
            fi
        }
    else
        # Method 2: Use Heroku API (no git required)
        print_status "Not in git repo. Using Heroku API..."
        print_warning "This requires HEROKU_API_KEY environment variable."
        
        if [ -z "$HEROKU_API_KEY" ]; then
            print_error "HEROKU_API_KEY not set."
            print_status "Get your API key from: https://dashboard.heroku.com/account"
            print_status "Then set it: export HEROKU_API_KEY=your-key-here"
            exit 1
        fi
        
        # Create tarball of just the server files
        TEMP_DIR=$(mktemp -d)
        trap "rm -rf $TEMP_DIR; exit" INT TERM EXIT
        
        print_status "Creating deployment package..."
        mkdir -p "$TEMP_DIR/server"
        cp server/simple-websocket-server.js "$TEMP_DIR/server/" 2>/dev/null || true
        cp package.json "$TEMP_DIR/" 2>/dev/null || true
        cp Procfile "$TEMP_DIR/" 2>/dev/null || true
        [ -f package-lock.json ] && cp package-lock.json "$TEMP_DIR/" 2>/dev/null || true
        
        cd "$TEMP_DIR"
        tar czf ../heroku-deploy.tar.gz .
        cd - > /dev/null
        
        # Get upload URL
        print_status "Getting upload URL from Heroku..."
        UPLOAD_RESPONSE=$(curl -s -X POST "https://api.heroku.com/apps/${HEROKU_APP_NAME}/sources" \
            -H "Accept: application/vnd.heroku+json; version=3" \
            -H "Authorization: Bearer $HEROKU_API_KEY")
        
        SOURCE_URL=$(echo "$UPLOAD_RESPONSE" | grep -o '"get_url":"[^"]*' | cut -d'"' -f4)
        PUT_URL=$(echo "$UPLOAD_RESPONSE" | grep -o '"put_url":"[^"]*' | cut -d'"' -f4)
        
        if [ -z "$PUT_URL" ]; then
            print_error "Failed to get upload URL"
            exit 1
        fi
        
        # Upload
        print_status "Uploading to Heroku..."
        curl "$PUT_URL" --request PUT --header "Content-Type:" --data-binary @heroku-deploy.tar.gz --progress-bar
        
        # Trigger build
        print_status "Triggering build..."
        BUILD_RESPONSE=$(curl -s -X POST "https://api.heroku.com/apps/${HEROKU_APP_NAME}/builds" \
            -H "Accept: application/vnd.heroku+json; version=3" \
            -H "Authorization: Bearer $HEROKU_API_KEY" \
            -H "Content-Type: application/json" \
            -d "{\"source_blob\":{\"url\":\"$SOURCE_URL\"}}")
        
        BUILD_ID=$(echo "$BUILD_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
        
        if [ -n "$BUILD_ID" ]; then
            print_status "Build started: $BUILD_ID"
            print_status "Monitor build: heroku builds:info $BUILD_ID -a $HEROKU_APP_NAME"
        fi
        
        rm -f heroku-deploy.tar.gz
    fi
    
    print_success "Deployed to Heroku!"
    
    # Check server status (non-blocking, limited output)
    print_status "Verifying server startup..."
    sleep 3
    (heroku logs --num 20 -a "$HEROKU_APP_NAME" 2>&1 | grep -E "(Server-Authoritative|Server starting|running on port|error|Error)" | head -5 &)
    LOG_PID=$!
    sleep 8
    kill $LOG_PID 2>/dev/null || true
    
    print_status "Server deployed. Check status with: heroku ps -a $HEROKU_APP_NAME"
    print_status "View logs with: heroku logs --num 50 -a $HEROKU_APP_NAME"
    
    print_status "Opening app..."
    heroku open -a "$HEROKU_APP_NAME" 2>/dev/null || true
}

# Function to deploy to Railway
deploy_railway() {
    print_status "Deploying to Railway..."
    
    if ! command_exists railway; then
        print_error "Railway CLI not found. Please install it first."
        exit 1
    fi
    
    print_status "Deploying to Railway..."
    railway up
    
    print_success "Deployed to Railway!"
}

# Function to run tests
run_tests() {
    print_status "Running tests..."
    
    if ! command_exists node; then
        print_error "Node.js not found. Please install Node.js first."
        exit 1
    fi
    
    if ! command_exists npm; then
        print_error "npm not found. Please install npm first."
        exit 1
    fi
    
    # Install dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        print_status "Installing dependencies..."
        npm install
    fi
    
    # Run tests
    npm test
    
    print_success "All tests passed!"
}

# Function to start local development
start_local() {
    print_status "Starting local development..."
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        print_status "Installing dependencies..."
        npm install
    fi
    
    print_status "Starting WebSocket server..."
    npm start &
    SERVER_PID=$!
    
    print_status "Starting HTTP server..."
    npm run dev &
    HTTP_PID=$!
    
    print_success "Local development started!"
    print_status "WebSocket server: http://localhost:8080"
    print_status "HTTP server: http://localhost:3000"
    print_status "Press Ctrl+C to stop both servers"
    
    # Wait for interrupt
    trap "kill $SERVER_PID $HTTP_PID; exit" INT
    wait
}

# Function to show help
show_help() {
    echo "Cards Game Deployment Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  heroku     Deploy to Heroku"
    echo "  railway    Deploy to Railway"
    echo "  test       Run integration tests"
    echo "  local      Start local development"
    echo "  help       Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 heroku    # Deploy to Heroku"
    echo "  $0 test      # Run tests"
    echo "  $0 local     # Start local development"
}

# Main script logic
case "${1:-help}" in
    heroku)
        deploy_heroku
        ;;
    railway)
        deploy_railway
        ;;
    test)
        run_tests
        ;;
    local)
        start_local
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac
