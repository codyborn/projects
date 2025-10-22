# Debugging Multiplayer Connection

## Expected Flow

1. **First instance (Host):**
   - Connects to signaling server
   - Creates "TEST" room
   - Receives "roomCreated" message
   - Creates peer connection
   - Waits for client to join

2. **Second instance (Client):**
   - Connects to signaling server
   - Tries to create "TEST" room
   - Gets converted to client (receives "roomJoined")
   - Creates peer connection
   - Waits for host to initiate

3. **Connection establishment:**
   - Host receives "clientJoined" message
   - Host initiates WebRTC connection (sends offer)
   - Client receives offer, sends answer
   - ICE candidates exchanged
   - Connection established

## Debug Messages to Look For

**Host console should show:**
```
Signaling server connected, creating room or joining...
Room code: TEST Is host: true
Attempting to create room: TEST
Room created successfully
Client joined the room
Host initiating connection with client
```

**Client console should show:**
```
Signaling server connected, creating room or joining...
Room code: TEST Is host: true
Attempting to create room: TEST
Joined room successfully
Converted to client role
```

## Troubleshooting

If you still see "Room already exists":
1. Check that both instances are using the same room code
2. Verify the signaling server is running
3. Check browser console for error messages
4. Try refreshing both browser instances
