# Cards - Multiplayer Card Game

A real-time multiplayer card game built with WebSocket and Heroku.

## Features

- 🎮 Real-time multiplayer card gameplay
- 🏠 Room-based multiplayer with 6-character codes
- 🔄 Synchronized card movements, flips, and deck actions
- 🎨 Custom deck management with JSON import/export
- 📱 Responsive design for desktop and mobile

## Setup Instructions

### 1. Start the Web Server

```bash
cd cards
python3 -m http.server 8001
```

The web server will run on port 8001.

### 2. Open the Game

Open your browser and go to: `http://localhost:8001`

**Note**: The multiplayer system uses WebSocket connections to a deployed Heroku server at `cards-websocket-server-02b8944e7896.herokuapp.com` for reliable real-time communication!

## How to Play Multiplayer

1. **Create a Room**: Click "Create Room" to generate a room code
2. **Share the Code**: Copy the 6-character room code and share it with friends
3. **Join a Room**: Enter the room code and click "Join Room"
4. **Play Together**: All card movements, flips, and actions are synchronized in real-time!

## Technical Details

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Real-time Communication**: WebSocket with Heroku
- **Data Storage**: Local browser storage for custom decks
- **Multiplayer**: Room-based system with 6-character codes
- **Local Development**: Uses local WebSocket server on port 8080
- **Production**: Automatically uses Heroku WebSocket server


## File Structure

```
cards/
├── index.html              # Main HTML file
├── styles/
│   ├── main.css           # Main styles
│   └── cards.css          # Card-specific styles
├── scripts/
│   ├── cards.js           # Card and deck classes
│   ├── websocket-multiplayer.js  # WebSocket multiplayer logic
│   └── app.js             # Main game application
└── README.md              # This file
```

## Troubleshooting

- **Connection Issues**: Make sure the web server is running on port 8001
- **WebSocket Issues**: Check that the WebSocket server is deployed and the URL is correct
- **Port Conflicts**: Change the port in the Python server command if needed
