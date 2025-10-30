#!/usr/bin/env node

/**
 * Server State Management Test
 * Tests the server-authoritative state management implementation
 */

const SimpleWebSocketServer = require('./server/simple-websocket-server');
const WebSocket = require('ws');

class ServerStateTest {
    constructor() {
        this.server = null;
        this.testResults = [];
        this.clients = [];
    }

    async run() {
        console.log('🧪 Testing Server-Authoritative State Management\n');
        
        // Start server
        this.server = new SimpleWebSocketServer(8083);
        this.server.start();
        
        // Wait for server to start
        await this.sleep(500);
        
        // Run tests
        await this.testRoomCreation();
        await this.testStateStorage();
        await this.testCardStateUpdates();
        await this.testMultiCardUpdates();
        await this.testRoomCleanup();
        await this.testFullStateRequest();
        await this.testReconnection();
        await this.testStateRecovery();
        
        // Print results
        this.printResults();
        
        // Cleanup
        this.server.stop();
        process.exit(0);
    }

    async testRoomCreation() {
        console.log('📋 Test: Room Creation');
        
        try {
            const ws = await this.createClient('TESTROOM');
            await this.sendMessage(ws, {
                type: 'joinRoom',
                roomCode: 'TESTROOM',
                playerId: 'player1',
                playerName: 'Player One'
            });
            
            const response = await this.waitForMessage(ws);
            const hasRoom = this.server.rooms.has('TESTROOM');
            const hasGameState = response.gameState !== undefined;
            const roomJoined = response.type === 'roomJoined';
            
            this.addResult('Room Creation', hasRoom && hasGameState && roomJoined,
                `Room exists: ${hasRoom}, Has gameState: ${hasGameState}, Room joined: ${roomJoined}`);
            
            await this.sleep(100);
            ws.close();
        } catch (error) {
            this.addResult('Room Creation', false, `Error: ${error.message}`);
        }
    }

    async testStateStorage() {
        console.log('📋 Test: State Storage');
        
        try {
            const ws1 = await this.createClient('STATEROOM');
            await this.sendMessage(ws1, {
                type: 'joinRoom',
                roomCode: 'STATEROOM',
                playerId: 'player1',
                playerName: 'Player One'
            });
            await this.waitForMessage(ws1);
            
            const roomState = this.server.rooms.get('STATEROOM');
            const hasState = roomState !== undefined;
            const hasGameState = roomState?.gameState !== undefined;
            const hasCardsMap = roomState?.gameState?.cards instanceof Map;
            
            this.addResult('State Storage', hasState && hasGameState && hasCardsMap,
                `Room state: ${hasState}, GameState: ${hasGameState}, Cards Map: ${hasCardsMap}`);
            
            await this.sleep(100);
            ws1.close();
        } catch (error) {
            this.addResult('State Storage', false, `Error: ${error.message}`);
        }
    }

    async testCardStateUpdates() {
        console.log('📋 Test: Card State Updates');
        
        try {
            const ws1 = await this.createClient('CARDUPDATE');
            const ws2 = await this.createClient('CARDUPDATE');
            
            // Both join room
            await this.sendMessage(ws1, {
                type: 'joinRoom',
                roomCode: 'CARDUPDATE',
                playerId: 'player1',
                playerName: 'Player One'
            });
            await this.waitForMessage(ws1);
            
            await this.sendMessage(ws2, {
                type: 'joinRoom',
                roomCode: 'CARDUPDATE',
                playerId: 'player2',
                playerName: 'Player Two'
            });
            await this.waitForMessage(ws2);
            
            // Player 1 sends card update
            const cardState = {
                uniqueId: 'test_card_1',
                card: { title: 'Test Card', emoji: '🃏', color: 'red' },
                position: { x: 100, y: 200 },
                isFlipped: false,
                zIndex: 1,
                timestamp: Date.now()
            };
            
            await this.sendMessage(ws1, {
                type: 'updateCardState',
                roomCode: 'CARDUPDATE',
                playerId: 'player1',
                cardStates: [cardState]
            });
            
            // Player 2 should receive broadcast
            const broadcast = await this.waitForMessage(ws2);
            const receivedUpdate = broadcast?.type === 'gameMessage' &&
                                 broadcast?.data?.type === 'cardState' &&
                                 Array.isArray(broadcast.data.data);
            
            // Check server state
            const roomState = this.server.rooms.get('CARDUPDATE');
            const serverHasCard = roomState?.gameState?.cards?.has('test_card_1');
            
            this.addResult('Card State Updates', receivedUpdate && serverHasCard,
                `Received update: ${receivedUpdate}, Server has card: ${serverHasCard}`);
            
            await this.sleep(100);
            ws1.close();
            ws2.close();
        } catch (error) {
            this.addResult('Card State Updates', false, `Error: ${error.message}`);
        }
    }

    async testMultiCardUpdates() {
        console.log('📋 Test: Multi-Card Updates');
        
        try {
            const ws1 = await this.createClient('MULTICARD');
            await this.sendMessage(ws1, {
                type: 'joinRoom',
                roomCode: 'MULTICARD',
                playerId: 'player1',
                playerName: 'Player One'
            });
            await this.waitForMessage(ws1);
            
            // Send multiple card states in one update
            const cardStates = [
                {
                    uniqueId: 'card_1',
                    card: { title: 'Card 1', emoji: '🃏' },
                    position: { x: 100, y: 100 },
                    isFlipped: false,
                    zIndex: 1
                },
                {
                    uniqueId: 'card_2',
                    card: { title: 'Card 2', emoji: '🃏' },
                    position: { x: 200, y: 200 },
                    isFlipped: false,
                    zIndex: 2
                },
                {
                    uniqueId: 'card_3',
                    card: { title: 'Card 3', emoji: '🃏' },
                    position: { x: 300, y: 300 },
                    isFlipped: false,
                    zIndex: 3
                }
            ];
            
            await this.sendMessage(ws1, {
                type: 'updateCardState',
                roomCode: 'MULTICARD',
                playerId: 'player1',
                cardStates: cardStates
            });
            
            // Wait for server to process the update
            await this.sleep(200);
            
            // Check server state has all cards
            const roomState = this.server.rooms.get('MULTICARD');
            const hasAllCards = roomState?.gameState?.cards?.has('card_1') &&
                              roomState?.gameState?.cards?.has('card_2') &&
                              roomState?.gameState?.cards?.has('card_3');
            
            this.addResult('Multi-Card Updates', hasAllCards,
                `All 3 cards stored: ${hasAllCards}, Total cards: ${roomState?.gameState?.cards?.size || 0}`);
            
            await this.sleep(100);
            ws1.close();
        } catch (error) {
            this.addResult('Multi-Card Updates', false, `Error: ${error.message}`);
        }
    }

    async testRoomCleanup() {
        console.log('📋 Test: Room Cleanup');
        
        try {
            const ws = await this.createClient('CLEANUP');
            await this.sendMessage(ws, {
                type: 'joinRoom',
                roomCode: 'CLEANUP',
                playerId: 'player1',
                playerName: 'Player One'
            });
            await this.waitForMessage(ws);
            
            const roomState = this.server.rooms.get('CLEANUP');
            const initialTime = roomState?.lastActivity;
            
            // Simulate inactivity by setting lastActivity to 20+ minutes ago
            roomState.lastActivity = Date.now() - (21 * 60 * 1000);
            roomState.connections.clear(); // No active connections
            
            // Trigger cleanup
            this.server.checkInactiveRooms();
            
            const roomDeleted = !this.server.rooms.has('CLEANUP');
            
            this.addResult('Room Cleanup', roomDeleted,
                `Room deleted: ${roomDeleted}`);
            
            await this.sleep(100);
            ws.close();
        } catch (error) {
            this.addResult('Room Cleanup', false, `Error: ${error.message}`);
        }
    }

    async testReconnection() {
        console.log('📋 Test: Reconnection');
        
        try {
            const ws = await this.createClient('RECONNECT');
            
            // Join room
            await this.sendMessage(ws, {
                type: 'joinRoom',
                roomCode: 'RECONNECT',
                playerId: 'player1',
                playerName: 'Player One'
            });
            await this.waitForMessage(ws);
            
            // Add some state
            await this.sendMessage(ws, {
                type: 'updateCardState',
                roomCode: 'RECONNECT',
                playerId: 'player1',
                cardStates: [{
                    uniqueId: 'reconnect_card',
                    card: { title: 'Reconnect Card', emoji: '🃏' },
                    position: { x: 100, y: 100 },
                    isFlipped: false,
                    zIndex: 1
                }]
            });
            await this.sleep(200);
            
            // Verify server has state
            const roomStateBefore = this.server.rooms.get('RECONNECT');
            const hasCardBefore = roomStateBefore?.gameState?.cards?.has('reconnect_card');
            
            // Simulate disconnection
            ws.close();
            await this.sleep(100);
            
            // Reconnect
            const ws2 = await this.createClient('RECONNECT');
            await this.sendMessage(ws2, {
                type: 'joinRoom',
                roomCode: 'RECONNECT',
                playerId: 'player1',
                playerName: 'Player One'
            });
            
            const reconnectResponse = await this.waitForMessage(ws2);
            const receivedGameState = reconnectResponse?.gameState !== undefined;
            const hasCardAfterReconnect = reconnectResponse?.gameState?.cards?.['reconnect_card'] !== undefined;
            
            // Verify state persisted
            const roomStateAfter = this.server.rooms.get('RECONNECT');
            const hasCardAfter = roomStateAfter?.gameState?.cards?.has('reconnect_card');
            
            this.addResult('Reconnection', hasCardBefore && receivedGameState && hasCardAfter && hasCardAfterReconnect,
                `Card before: ${hasCardBefore}, Received state: ${receivedGameState}, Card after: ${hasCardAfter}, Card in response: ${hasCardAfterReconnect}`);
            
            await this.sleep(100);
            ws2.close();
        } catch (error) {
            this.addResult('Reconnection', false, `Error: ${error.message}`);
        }
    }

    async testStateRecovery() {
        console.log('📋 Test: State Recovery');
        
        try {
            const ws1 = await this.createClient('RECOVERY');
            const ws2 = await this.createClient('RECOVERY');
            
            // Both join room
            await this.sendMessage(ws1, {
                type: 'joinRoom',
                roomCode: 'RECOVERY',
                playerId: 'player1',
                playerName: 'Player One'
            });
            await this.waitForMessage(ws1);
            
            await this.sendMessage(ws2, {
                type: 'joinRoom',
                roomCode: 'RECOVERY',
                playerId: 'player2',
                playerName: 'Player Two'
            });
            await this.waitForMessage(ws2);
            
            // Player 1 adds multiple cards
            const cardStates = [
                {
                    uniqueId: 'recovery_card_1',
                    card: { title: 'Recovery Card 1', emoji: '🃏' },
                    position: { x: 100, y: 100 },
                    isFlipped: false,
                    zIndex: 1
                },
                {
                    uniqueId: 'recovery_card_2',
                    card: { title: 'Recovery Card 2', emoji: '🃏' },
                    position: { x: 200, y: 200 },
                    isFlipped: true,
                    zIndex: 2
                },
                {
                    uniqueId: 'recovery_card_3',
                    card: { title: 'Recovery Card 3', emoji: '🃏' },
                    position: { x: 300, y: 300 },
                    isFlipped: false,
                    zIndex: 3
                }
            ];
            
            await this.sendMessage(ws1, {
                type: 'updateCardState',
                roomCode: 'RECOVERY',
                playerId: 'player1',
                cardStates: cardStates
            });
            await this.sleep(300);
            
            // Verify server has all cards
            const roomState = this.server.rooms.get('RECOVERY');
            const serverHasAllCards = roomState?.gameState?.cards?.has('recovery_card_1') &&
                                     roomState?.gameState?.cards?.has('recovery_card_2') &&
                                     roomState?.gameState?.cards?.has('recovery_card_3');
            
            // Player 2 requests full state
            await this.sendMessage(ws2, {
                type: 'requestFullState',
                roomCode: 'RECOVERY',
                playerId: 'player2'
            });
            
            const fullStateResponse = await this.waitForMessage(ws2);
            const hasFullState = fullStateResponse?.type === 'fullState';
            const recoveredCards = fullStateResponse?.gameState?.cards || {};
            const recoveredCardCount = Object.keys(recoveredCards).length;
            const hasAllRecoveredCards = recoveredCards['recovery_card_1'] &&
                                       recoveredCards['recovery_card_2'] &&
                                       recoveredCards['recovery_card_3'];
            
            this.addResult('State Recovery', serverHasAllCards && hasFullState && recoveredCardCount >= 3 && hasAllRecoveredCards,
                `Server has cards: ${serverHasAllCards}, Has fullState: ${hasFullState}, Recovered: ${recoveredCardCount}, All recovered: ${hasAllRecoveredCards}`);
            
            await this.sleep(100);
            ws1.close();
            ws2.close();
        } catch (error) {
            this.addResult('State Recovery', false, `Error: ${error.message}`);
        }
    }

    async testFullStateRequest() {
        console.log('📋 Test: Full State Request');
        
        try {
            const ws = await this.createClient('FULLSTATE');
            await this.sendMessage(ws, {
                type: 'joinRoom',
                roomCode: 'FULLSTATE',
                playerId: 'player1',
                playerName: 'Player One'
            });
            await this.waitForMessage(ws);
            
            // Add some state
            await this.sendMessage(ws, {
                type: 'updateCardState',
                roomCode: 'FULLSTATE',
                playerId: 'player1',
                cardStates: [{
                    uniqueId: 'state_card',
                    card: { title: 'State Card', emoji: '🃏' },
                    position: { x: 50, y: 50 },
                    isFlipped: false,
                    zIndex: 1
                }]
            });
            await this.sleep(100);
            
            // Request full state
            await this.sendMessage(ws, {
                type: 'requestFullState',
                roomCode: 'FULLSTATE',
                playerId: 'player1'
            });
            
            const response = await this.waitForMessage(ws);
            const hasFullState = response?.type === 'fullState' &&
                               response?.gameState !== undefined &&
                               typeof response.gameState.cards === 'object';
            
            const cardCount = Object.keys(response?.gameState?.cards || {}).length;
            
            this.addResult('Full State Request', hasFullState && cardCount > 0,
                `Has fullState: ${hasFullState}, Cards in state: ${cardCount}`);
            
            await this.sleep(100);
            ws.close();
        } catch (error) {
            this.addResult('Full State Request', false, `Error: ${error.message}`);
        }
    }

    async createClient(roomCode) {
        return new Promise((resolve, reject) => {
            const ws = new WebSocket(`ws://localhost:8083/chat/${roomCode}`);
            ws.on('open', () => resolve(ws));
            ws.on('error', reject);
            this.clients.push(ws);
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
        console.log('\n📊 Test Results Summary:');
        console.log('========================');
        
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
    const test = new ServerStateTest();
    test.run().catch(console.error);
}

module.exports = ServerStateTest;

