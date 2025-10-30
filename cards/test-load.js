#!/usr/bin/env node

/**
 * Performance Load Test for Server-Authoritative State Management
 * Tests server performance under load with multiple rooms and concurrent connections
 */

const SimpleWebSocketServer = require('./server/simple-websocket-server');
const WebSocket = require('ws');

class LoadTest {
    constructor() {
        this.server = null;
        this.testResults = [];
        this.clients = [];
    }

    async run() {
        console.log('🚀 Starting Load Test for Server-Authoritative State Management\n');
        
        // Start server
        this.server = new SimpleWebSocketServer(8084);
        this.server.start();
        
        // Wait for server to start
        await this.sleep(500);
        
        // Run tests
        await this.testMultipleRooms();
        await this.testConcurrentConnections();
        await this.testHighVolumeUpdates();
        await this.testRoomCleanupUnderLoad();
        
        // Print metrics
        const metrics = this.server.getMetrics();
        console.log('\n📊 Server Performance Metrics:');
        console.log('==============================');
        console.log(`Uptime: ${metrics.uptimeMinutes} minutes`);
        console.log(`Messages Processed: ${metrics.messagesProcessed}`);
        console.log(`Card Updates Processed: ${metrics.cardUpdatesProcessed}`);
        console.log(`Rooms Created: ${metrics.roomsCreated}`);
        console.log(`Rooms Deleted: ${metrics.roomsDeleted}`);
        console.log(`Active Rooms: ${metrics.activeRooms}`);
        console.log(`Active Connections: ${metrics.activeConnections}`);
        console.log(`Avg Messages/Min: ${metrics.avgMessagesPerMinute.toFixed(2)}`);
        
        // Print results
        this.printResults();
        
        // Cleanup
        this.clients.forEach(ws => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        });
        this.server.stop();
        process.exit(0);
    }

    async testMultipleRooms() {
        console.log('📋 Test: Multiple Rooms');
        
        try {
            const roomCount = 10;
            const rooms = [];
            
            // Create multiple rooms with 2 players each
            for (let i = 0; i < roomCount; i++) {
                const roomCode = `LOADROOM${i}`;
                const ws1 = await this.createClient(roomCode);
                const ws2 = await this.createClient(roomCode);
                
                await this.sendMessage(ws1, {
                    type: 'joinRoom',
                    roomCode: roomCode,
                    playerId: `player1_${i}`,
                    playerName: `Player One ${i}`
                });
                await this.waitForMessage(ws1);
                
                await this.sendMessage(ws2, {
                    type: 'joinRoom',
                    roomCode: roomCode,
                    playerId: `player2_${i}`,
                    playerName: `Player Two ${i}`
                });
                await this.waitForMessage(ws2);
                
                rooms.push({ roomCode, ws1, ws2 });
            }
            
            const activeRooms = this.server.rooms.size;
            const success = activeRooms === roomCount;
            
            this.addResult('Multiple Rooms', success,
                `Created ${roomCount} rooms, Active rooms: ${activeRooms}`);
            
            // Cleanup
            rooms.forEach(({ ws1, ws2 }) => {
                ws1.close();
                ws2.close();
            });
            
            await this.sleep(100);
        } catch (error) {
            this.addResult('Multiple Rooms', false, `Error: ${error.message}`);
        }
    }

    async testConcurrentConnections() {
        console.log('📋 Test: Concurrent Connections');
        
        try {
            const connectionCount = 20;
            const roomCode = 'CONCURRENT';
            const connections = [];
            
            // Create multiple connections to same room
            for (let i = 0; i < connectionCount; i++) {
                const ws = await this.createClient(roomCode);
                await this.sendMessage(ws, {
                    type: 'joinRoom',
                    roomCode: roomCode,
                    playerId: `player_${i}`,
                    playerName: `Player ${i}`
                });
                await this.waitForMessage(ws);
                connections.push(ws);
            }
            
            const roomState = this.server.rooms.get(roomCode);
            const connectionCountInRoom = roomState?.connections.size || 0;
            const playerCount = roomState?.players.size || 0;
            
            const success = connectionCountInRoom === connectionCount && playerCount === connectionCount;
            
            this.addResult('Concurrent Connections', success,
                `Created ${connectionCount} connections, In room: ${connectionCountInRoom}, Players: ${playerCount}`);
            
            // Cleanup
            connections.forEach(ws => ws.close());
            
            await this.sleep(100);
        } catch (error) {
            this.addResult('Concurrent Connections', false, `Error: ${error.message}`);
        }
    }

    async testHighVolumeUpdates() {
        console.log('📋 Test: High Volume Updates');
        
        try {
            const ws = await this.createClient('VOLUME');
            await this.sendMessage(ws, {
                type: 'joinRoom',
                roomCode: 'VOLUME',
                playerId: 'player1',
                playerName: 'Player One'
            });
            await this.waitForMessage(ws);
            
            const updateCount = 50;
            const startTime = Date.now();
            
            // Send many card updates rapidly
            for (let i = 0; i < updateCount; i++) {
                await this.sendMessage(ws, {
                    type: 'updateCardState',
                    roomCode: 'VOLUME',
                    playerId: 'player1',
                    cardStates: [{
                        uniqueId: `volume_card_${i}`,
                        card: { title: `Card ${i}`, emoji: '🃏' },
                        position: { x: i * 10, y: i * 10 },
                        isFlipped: false,
                        zIndex: i
                    }]
                });
                
                // Small delay to avoid overwhelming
                if (i % 10 === 0) {
                    await this.sleep(10);
                }
            }
            
            await this.sleep(500); // Wait for all updates to process
            
            const endTime = Date.now();
            const duration = endTime - startTime;
            const roomState = this.server.rooms.get('VOLUME');
            const cardCount = roomState?.gameState?.cards?.size || 0;
            const updatesPerSecond = (updateCount / duration) * 1000;
            
            const success = cardCount === updateCount && duration < 5000; // Should complete in under 5 seconds
            
            this.addResult('High Volume Updates', success,
                `Sent ${updateCount} updates in ${duration}ms (${updatesPerSecond.toFixed(2)}/s), Cards stored: ${cardCount}`);
            
            ws.close();
            await this.sleep(100);
        } catch (error) {
            this.addResult('High Volume Updates', false, `Error: ${error.message}`);
        }
    }

    async testRoomCleanupUnderLoad() {
        console.log('📋 Test: Room Cleanup Under Load');
        
        try {
            // Create many rooms
            const roomCount = 15;
            const rooms = [];
            
            for (let i = 0; i < roomCount; i++) {
                const roomCode = `CLEANUP${i}`;
                const ws = await this.createClient(roomCode);
                await this.sendMessage(ws, {
                    type: 'joinRoom',
                    roomCode: roomCode,
                    playerId: `player_${i}`,
                    playerName: `Player ${i}`
                });
                await this.waitForMessage(ws);
                ws.close();
                rooms.push(roomCode);
            }
            
            await this.sleep(100);
            
            // Mark rooms as inactive
            rooms.forEach(roomCode => {
                const roomState = this.server.rooms.get(roomCode);
                if (roomState) {
                    roomState.lastActivity = Date.now() - (21 * 60 * 1000);
                    roomState.connections.clear();
                }
            });
            
            // Trigger cleanup
            this.server.checkInactiveRooms();
            
            const remainingRooms = this.server.rooms.size;
            const roomsDeleted = roomCount - remainingRooms;
            
            const success = roomsDeleted === roomCount;
            
            this.addResult('Room Cleanup Under Load', success,
                `Created ${roomCount} rooms, Deleted: ${roomsDeleted}, Remaining: ${remainingRooms}`);
            
            await this.sleep(100);
        } catch (error) {
            this.addResult('Room Cleanup Under Load', false, `Error: ${error.message}`);
        }
    }

    async createClient(roomCode) {
        return new Promise((resolve, reject) => {
            const ws = new WebSocket(`ws://localhost:8084/chat/${roomCode}`);
            ws.on('open', () => {
                this.clients.push(ws);
                resolve(ws);
            });
            ws.on('error', reject);
        });
    }

    async sendMessage(ws, message) {
        return new Promise((resolve, reject) => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify(message));
                resolve();
            } else {
                reject(new Error('WebSocket not open'));
            }
        });
    }

    async waitForMessage(ws, timeout = 2000) {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                ws.removeAllListeners('message');
                reject(new Error('Timeout waiting for message'));
            }, timeout);
            
            ws.once('message', (data) => {
                clearTimeout(timer);
                try {
                    const message = JSON.parse(data.toString());
                    resolve(message);
                } catch (error) {
                    reject(error);
                }
            });
        });
    }

    addResult(testName, passed, details) {
        this.testResults.push({ test: testName, passed, details });
        console.log(`  ${passed ? '✅' : '❌'} ${testName}: ${details}\n`);
    }

    printResults() {
        console.log('\n📊 Load Test Results Summary:');
        console.log('=============================');
        
        const passed = this.testResults.filter(r => r.passed).length;
        const total = this.testResults.length;
        
        this.testResults.forEach(result => {
            console.log(`${result.passed ? '✅' : '❌'} ${result.test}: ${result.details}`);
        });
        
        console.log(`\n🎯 Overall: ${passed}/${total} tests passed`);
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Run tests
if (require.main === module) {
    const test = new LoadTest();
    test.run().catch(console.error);
}

module.exports = LoadTest;

