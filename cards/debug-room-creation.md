# Debugging Room Creation Issue

## Steps to Debug

1. **Start the signaling server:**
   ```bash
   npm start
   ```

2. **Open browser console and watch for these messages:**

   **First instance (should become host):**
   ```
   Signaling server connected, creating room or joining...
   Room code: TEST Is host: true
   Attempting to create room: TEST
   Room created successfully
   ```

   **Second instance (should become client):**
   ```
   Signaling server connected, creating room or joining...
   Room code: TEST Is host: true
   Attempting to create room: TEST
   Room TEST already exists, making connection a client
   Joined room successfully
   Converted to client role
   ```

3. **Check signaling server console for:**
   ```
   Attempting to create room: TEST
   Room TEST created successfully
   Available rooms after creation: [ 'TEST' ]
   Attempting to create room: TEST
   Room TEST already exists, making connection a client
   Existing room state: { hasHost: true, hostReady: 1, clientCount: 0 }
   Attempting to join room: TEST
   Available rooms: [ 'TEST' ]
   Client joined room TEST
   ```

## What to Look For

- **If you see "Room already exists" error:** This means the client is receiving an error message that it's not properly handling
- **If you see "Room not found" error:** This means the room was deleted or the host disconnected
- **If you see multiple room creation attempts:** This means there's a race condition

## Common Issues

1. **Race condition:** Both instances try to create room at the same time
2. **Host disconnection:** Host disconnects before client can join
3. **Multiple attempts:** Client tries to create room multiple times
4. **WebSocket connection issues:** Signaling server connection fails

## Next Steps

If you still see the error, please share:
1. The exact error message from the browser console
2. The signaling server console output
3. Whether it happens consistently or intermittently
