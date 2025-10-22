# Testing Multiplayer Connection

## Steps to Test the Fix

1. **Start the signaling server:**
   ```bash
   npm start
   ```

2. **Open two browser tabs/windows to the game**

3. **Both should automatically connect to "TEST" room:**
   - First instance will create the room and become host
   - Second instance will join the room and become client
   - No more "Room not found" error

## Expected Behavior

- **First instance:** Creates "TEST" room, becomes host
- **Second instance:** Joins "TEST" room, becomes client  
- **Connection:** WebRTC peer-to-peer connection established
- **Game sync:** Card movements, resets, etc. sync between instances

## Debugging

Check browser console for:
- "Signaling server connected"
- "Room code: TEST Is host: true/false"
- "Attempting to create/join room: TEST"
- "Room created/joined successfully"

If you still see "Room not found", check that:
1. Signaling server is running on port 8080
2. No firewall blocking the connection
3. Both instances are trying to connect to the same room
