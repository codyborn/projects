/**
 * Simple WebRTC Signaling Server
 * Handles room creation, joining, and ICE candidate exchange
 */

const WebSocket = require('ws');
const http = require('http');
const url = require('url');

class SignalingServer {
    constructor(port = 8080) {
        this.port = port;
        this.rooms = new Map(); // roomCode -> { host: ws, clients: [ws] }
        this.connections = new Map(); // ws -> { roomCode, isHost }
        
        this.server = http.createServer();
        this.wss = new WebSocket.Server({ server: this.server });
        
        this.setupWebSocketServer();
    }
    
    setupWebSocketServer() {
        this.wss.on('connection', (ws, req) => {
            console.log('New WebSocket connection');
            
            ws.on('message', (data) => {
                try {
                    const message = JSON.parse(data);
                    this.handleMessage(ws, message);
                } catch (error) {
                    console.error('Error parsing message:', error);
                }
            });
            
            ws.on('close', () => {
                this.handleDisconnect(ws);
            });
            
            ws.on('error', (error) => {
                console.error('WebSocket error:', error);
                this.handleDisconnect(ws);
            });
        });
    }
    
    handleMessage(ws, message) {
        console.log('Received message:', message.type);
        
        switch (message.type) {
            case 'createRoom':
                this.handleCreateRoom(ws, message);
                break;
            case 'joinRoom':
                this.handleJoinRoom(ws, message);
                break;
            case 'offer':
                this.handleOffer(ws, message);
                break;
            case 'answer':
                this.handleAnswer(ws, message);
                break;
            case 'iceCandidate':
                this.handleIceCandidate(ws, message);
                break;
            case 'gameMessage':
                this.handleGameMessage(ws, message);
                break;
        }
    }
    
    handleCreateRoom(ws, message) {
        const { roomCode } = message;
        console.log(`Attempting to create room: ${roomCode}`);
        
        if (this.rooms.has(roomCode)) {
            // Room already exists, make this connection a client instead
            console.log(`Room ${roomCode} already exists, making connection a client`);
            const existingRoom = this.rooms.get(roomCode);
            console.log(`Existing room state:`, {
                hasHost: !!existingRoom.host,
                hostReady: existingRoom.host ? existingRoom.host.readyState : 'N/A',
                clientCount: existingRoom.clients.length
            });
            this.handleJoinRoom(ws, message);
            return;
        }
        
        this.rooms.set(roomCode, {
            host: ws,
            clients: []
        });
        
        this.connections.set(ws, {
            roomCode,
            isHost: true
        });
        
        ws.send(JSON.stringify({
            type: 'roomCreated',
            roomCode
        }));
        
        console.log(`Room ${roomCode} created successfully`);
        console.log(`Available rooms after creation:`, Array.from(this.rooms.keys()));
    }
    
    handleJoinRoom(ws, message) {
        const { roomCode } = message;
        console.log(`Attempting to join room: ${roomCode}`);
        console.log(`Available rooms:`, Array.from(this.rooms.keys()));
        
        if (!this.rooms.has(roomCode)) {
            console.log(`Room ${roomCode} not found, sending error`);
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Room not found'
            }));
            return;
        }
        
        const room = this.rooms.get(roomCode);
        room.clients.push(ws);
        
        this.connections.set(ws, {
            roomCode,
            isHost: false
        });
        
        // Notify host that a client joined
        if (room.host && room.host.readyState === WebSocket.OPEN) {
            room.host.send(JSON.stringify({
                type: 'clientJoined',
                clientId: ws.id || 'client'
            }));
        }
        
        // Notify client that they joined successfully
        ws.send(JSON.stringify({
            type: 'roomJoined',
            roomCode
        }));
        
        console.log(`Client joined room ${roomCode}`);
    }
    
    handleOffer(ws, message) {
        const connection = this.connections.get(ws);
        if (!connection) return;
        
        const room = this.rooms.get(connection.roomCode);
        if (!room) return;
        
        // Forward offer to the other peer
        const target = connection.isHost ? room.clients[0] : room.host;
        if (target && target.readyState === WebSocket.OPEN) {
            target.send(JSON.stringify({
                type: 'offer',
                offer: message.offer,
                from: connection.isHost ? 'host' : 'client'
            }));
        }
    }
    
    handleAnswer(ws, message) {
        const connection = this.connections.get(ws);
        if (!connection) return;
        
        const room = this.rooms.get(connection.roomCode);
        if (!room) return;
        
        // Forward answer to the other peer
        const target = connection.isHost ? room.clients[0] : room.host;
        if (target && target.readyState === WebSocket.OPEN) {
            target.send(JSON.stringify({
                type: 'answer',
                answer: message.answer,
                from: connection.isHost ? 'host' : 'client'
            }));
        }
    }
    
    handleIceCandidate(ws, message) {
        const connection = this.connections.get(ws);
        if (!connection) return;
        
        const room = this.rooms.get(connection.roomCode);
        if (!room) return;
        
        // Forward ICE candidate to the other peer
        const target = connection.isHost ? room.clients[0] : room.host;
        if (target && target.readyState === WebSocket.OPEN) {
            target.send(JSON.stringify({
                type: 'iceCandidate',
                candidate: message.candidate,
                from: connection.isHost ? 'host' : 'client'
            }));
        }
    }
    
    handleGameMessage(ws, message) {
        const connection = this.connections.get(ws);
        if (!connection) return;
        
        const room = this.rooms.get(connection.roomCode);
        if (!room) return;
        
        // Broadcast game message to all other players in the room
        const allPlayers = [room.host, ...room.clients].filter(player => 
            player && player !== ws && player.readyState === WebSocket.OPEN
        );
        
        allPlayers.forEach(player => {
            player.send(JSON.stringify({
                type: 'gameMessage',
                data: message.data,
                from: connection.isHost ? 'host' : 'client'
            }));
        });
    }
    
    handleDisconnect(ws) {
        const connection = this.connections.get(ws);
        if (!connection) return;
        
        const room = this.rooms.get(connection.roomCode);
        if (!room) return;
        
        if (connection.isHost) {
            // Host disconnected - notify all clients
            room.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({
                        type: 'hostDisconnected'
                    }));
                }
            });
            this.rooms.delete(connection.roomCode);
        } else {
            // Client disconnected - remove from room and notify host
            const clientIndex = room.clients.indexOf(ws);
            if (clientIndex > -1) {
                room.clients.splice(clientIndex, 1);
            }
            
            if (room.host && room.host.readyState === WebSocket.OPEN) {
                room.host.send(JSON.stringify({
                    type: 'clientDisconnected'
                }));
            }
        }
        
        this.connections.delete(ws);
        console.log(`Connection closed for room ${connection.roomCode}`);
    }
    
    start() {
        this.server.listen(this.port, () => {
            console.log(`Signaling server running on port ${this.port}`);
            console.log(`WebSocket server ready for connections`);
        });
    }
}

// Start the server
const server = new SignalingServer(8080);
server.start();
