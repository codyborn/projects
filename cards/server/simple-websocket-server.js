#!/usr/bin/env node

/**
 * Simple WebSocket Server for Card Game
 * Fallback server that can be deployed to any Node.js hosting service
 * 
 * NOTE: DO NOT MODIFY THIS FILE
 * This server is designed to be simple and generic. All game logic and 
 * player management should be handled client-side via gameMessage broadcasts.
 * The server only needs to forward messages between players in the same room.
 */

const WebSocket = require('ws');
const http = require('http');
const url = require('url');

class SimpleWebSocketServer {
    constructor(port) {
        this.port = port || process.env.PORT || 8080;
        this.server = null;
        this.wss = null;
        this.rooms = new Map(); // roomCode -> Set of connections
        this.connections = new Map(); // connection -> roomCode
    }

    start() {
        console.log(`🎮 Simple WebSocket Server starting on port ${this.port}`);
        this.server = http.createServer();
        this.wss = new WebSocket.Server({ server: this.server });

        this.wss.on('connection', (ws, request) => {
            const urlParts = url.parse(request.url, true);
            const roomCode = urlParts.pathname.split('/').pop() || 'default';
            
            console.log(`New connection to room: ${roomCode}`);
            
            // Add to room
            if (!this.rooms.has(roomCode)) {
                this.rooms.set(roomCode, new Set());
            }
            this.rooms.get(roomCode).add(ws);
            this.connections.set(ws, roomCode);

            // Send welcome message
            ws.send(JSON.stringify({
                type: 'roomJoined',
                roomCode: roomCode
            }));

            ws.on('message', (data) => {
                try {
                    const message = JSON.parse(data.toString());
                    this.handleMessage(ws, message, roomCode);
                } catch (error) {
                    console.error('Error parsing message:', error);
                }
            });

            ws.on('close', () => {
                console.log(`Connection closed for room: ${roomCode}`);
                this.removeFromRoom(ws, roomCode);
            });

            ws.on('error', (error) => {
                console.error('WebSocket error:', error);
                this.removeFromRoom(ws, roomCode);
            });
        });

        this.server.listen(this.port, () => {
            console.log(`🎮 Simple WebSocket Server running on port ${this.port}`);
            console.log(`🔗 WebSocket URL: ws://localhost:${this.port}/chat/{roomCode}`);
        });
    }

    handleMessage(ws, message, roomCode) {
        console.log(`Room ${roomCode}: ${message.type}`);
        
        switch (message.type) {
            case 'createRoom':
                ws.send(JSON.stringify({
                    type: 'roomCreated',
                    roomCode: roomCode
                }));
                break;
                
            case 'joinRoom':
                ws.send(JSON.stringify({
                    type: 'roomJoined',
                    roomCode: roomCode
                }));
                // Notify other players
                this.broadcastToRoom(roomCode, {
                    type: 'playerJoined',
                    playerId: message.playerId || 'unknown',
                    roomCode: roomCode
                }, ws);
                break;
                
            case 'gameMessage':
                // Broadcast game message to all players in the room except sender
                this.broadcastToRoom(roomCode, {
                    type: 'gameMessage',
                    data: message.data
                }, ws);
                break;
                
            case 'messageAck':
                // Forward acknowledgment to sender only
                ws.send(JSON.stringify({
                    type: 'messageAck',
                    messageId: message.messageId,
                    playerId: message.playerId
                }));
                break;
                
            default:
                // Broadcast any other message to the room
                this.broadcastToRoom(roomCode, message, ws);
                break;
        }
    }

    broadcastToRoom(roomCode, message, excludeWs = null) {
        const room = this.rooms.get(roomCode);
        if (room) {
            room.forEach(ws => {
                if (ws !== excludeWs && ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify(message));
                }
            });
        }
    }

    removeFromRoom(ws, roomCode) {
        const room = this.rooms.get(roomCode);
        if (room) {
            room.delete(ws);
            if (room.size === 0) {
                this.rooms.delete(roomCode);
            } else {
                // Notify other players that someone left
                this.broadcastToRoom(roomCode, {
                    type: 'playerLeft',
                    playerId: 'unknown',
                    roomCode: roomCode
                });
            }
        }
        this.connections.delete(ws);
    }

    stop() {
        if (this.wss) {
            this.wss.close();
        }
        if (this.server) {
            this.server.close();
        }
    }
}

// Run server if this file is executed directly
if (require.main === module) {
    const server = new SimpleWebSocketServer();
    server.start();
    
    // Graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n🛑 Shutting down server...');
        server.stop();
        process.exit(0);
    });
}

module.exports = SimpleWebSocketServer;
