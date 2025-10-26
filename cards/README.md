# Cards Game - Multiplayer Card Game

A custom card game with real-time multiplayer support using WebSockets.

## 🏗️ Project Structure

```
cards/
├── src/                          # Source code
│   ├── client/                   # Client-side code
│   │   ├── app.js               # Main game logic
│   │   └── websocket-multiplayer.js  # WebSocket client
│   ├── server/                   # Server-side code
│   │   └── simple-websocket-server.js  # WebSocket server
│   └── shared/                   # Shared code
│       ├── cards.js             # Card system
│       ├── StandardDeck.js      # Standard playing cards
│       └── VirusDeck.js         # Virus card game deck
├── tests/                        # Test files
│   └── simple-integration-test.js  # Integration tests
├── styles/                       # CSS files
│   ├── main.css                 # Main styles
│   └── cards.css                # Card-specific styles
├── server/                       # Server files
│   └── simple-websocket-server.js
├── index.html                    # Main HTML file
├── package.json                  # Node.js dependencies
└── README.md                     # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- Python 3 (for serving static files)

### Installation
```bash
# Install dependencies
npm install

# Start the WebSocket server
npm start

# In another terminal, serve the client
npm run dev
```

### Development
```bash
# Run integration tests
npm test

# Start development server
npm run serve
```

## 🎮 How to Play

1. **Create a Room**: Click "Create Room" to start a new game
2. **Join a Room**: Enter a 6-character room code to join an existing game
3. **Play Cards**: Click and drag cards to move them around
4. **Flip Cards**: Click (without dragging) to flip cards
5. **Shuffle**: Right-click to shuffle cards back into the deck

## 🧪 Testing

The project includes comprehensive integration tests that simulate multiple browser instances to test synchronization:

```bash
npm test
```

Tests cover:
- Room creation and joining
- Card synchronization
- State validation
- Room switching
- Multiple card synchronization
- Deck synchronization

## 🔧 Architecture

### Client-Side
- **app.js**: Main game logic, card handling, UI management
- **websocket-multiplayer.js**: WebSocket communication, state synchronization

### Server-Side
- **simple-websocket-server.js**: WebSocket server with room isolation

### Shared
- **cards.js**: Core card system with Deck and Card classes
- **StandardDeck.js**: Standard playing card deck
- **VirusDeck.js**: Virus card game deck

## 🌐 Multiplayer Features

- **Real-time synchronization**: All players see the same game state
- **Room isolation**: Each game room is completely separate
- **State validation**: Automatic detection and correction of sync issues
- **Private hands**: Players can have private cards that others can't see

## 🚀 Deployment

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

### Quick Deploy to Heroku
```bash
# Create Heroku app
heroku create your-cards-game-app

# Deploy
git push heroku main

# Open app
heroku open
```

## 📝 License

MIT License - see LICENSE file for details