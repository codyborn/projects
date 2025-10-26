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

# Function to deploy to Heroku
deploy_heroku() {
    print_status "Deploying to Heroku..."
    
    if ! command_exists heroku; then
        print_error "Heroku CLI not found. Please install it first."
        exit 1
    fi
    
    # Check if we're in a git repository
    if [ ! -d ".git" ]; then
        print_error "Not in a git repository. Please initialize git first."
        exit 1
    fi
    
    # Check if Heroku remote exists
    if ! git remote | grep -q heroku; then
        print_status "Adding Heroku remote..."
        read -p "Enter your Heroku app name: " app_name
        heroku git:remote -a "$app_name"
    fi
    
    # Deploy
    print_status "Pushing to Heroku..."
    git push heroku main
    
    print_success "Deployed to Heroku! Opening app..."
    heroku open
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
