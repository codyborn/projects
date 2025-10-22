# Multiplayer Cards Game - Setup Instructions

## For Local Testing (Same Computer)
The game will automatically fall back to simulation mode if the signaling server isn't running. This works for testing on the same computer with multiple browser tabs.

## For Cross-Device/Browser Testing

### 1. Start the Signaling Server
```bash
cd /Users/cody.born/repos/projects/cards
npm start
```

The signaling server will run on port 8080.

### 2. Access the Game
- **Option A**: Serve the files through a web server (recommended)
  ```bash
  # Using Python 3
  python -m http.server 8000
  
  # Or using Node.js http-server
  npx http-server -p 8000
  ```
  Then access: `http://localhost:8000`

- **Option B**: Open `index.html` directly in browser (may have limitations)

### 3. Test Multiplayer
1. Open the game in two different browsers or devices
2. Both should connect to the same room (use "TEST" for easy testing)
3. The connection should work across different computers on the same network

### Troubleshooting

**If you see "Failed to connect to signaling server":**
- Make sure the signaling server is running (`npm start`)
- Check that port 8080 is not blocked
- The game will fall back to simulation mode for local testing

**For cross-network connections:**
- You'll need to configure your router/firewall to allow WebSocket connections
- Consider using a cloud signaling server for production use

### Development Notes
- The game uses WebRTC for peer-to-peer connections
- The signaling server handles the initial connection setup
- Game messages are sent through the WebRTC data channel
- Falls back to localStorage for local testing when signaling server is unavailable
