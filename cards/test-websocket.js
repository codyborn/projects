#!/usr/bin/env node

/**
 * Simple WebSocket Test Script
 * Tests the WebSocket multiplayer server without UI
 */

const WebSocket = require('ws');

class WebSocketTester {
    constructor() {
        this.socket = null;
        this.roomCode = 'TEST1';
        this.serverUrl = 'wss://cards-websocket-server-02b8944e7896.herokuapp.com';
        this.messageCount = 0;
        this.connected = false;
    }

    async run() {
        console.log('🧪 WebSocket Multiplayer Test');
        console.log('==============================');
        console.log(`Server: ${this.serverUrl}`);
        console.log(`Room: ${this.roomCode}`);
        console.log('');

        try {
            await this.connect();
            await this.testRoomCreation();
            await this.testGameMessages();
            await this.testDisconnection();
            console.log('\n✅ All tests completed successfully!');
        } catch (error) {
            console.error('\n❌ Test failed:', error.message);
            process.exit(1);
        }
    }

    connect() {
        return new Promise((resolve, reject) => {
            const wsUrl = `${this.serverUrl}/chat/${this.roomCode}`;
            console.log(`🔌 Connecting to: ${wsUrl}`);

            this.socket = new WebSocket(wsUrl);

            this.socket.on('open', () => {
                console.log('✅ Connected to WebSocket server');
                this.connected = true;
                resolve();
            });

            this.socket.on('message', (data) => {
                try {
                    const message = JSON.parse(data.toString());
                    console.log(`📨 Received: ${message.type}`);
                    this.messageCount++;
                } catch (error) {
                    console.log(`📨 Received (raw): ${data.toString()}`);
                }
            });

            this.socket.on('close', (code, reason) => {
                console.log(`🔌 Connection closed: ${code} - ${reason}`);
                this.connected = false;
            });

            this.socket.on('error', (error) => {
                console.error('❌ WebSocket error:', error.message);
                reject(error);
            });

            // Timeout after 10 seconds
            setTimeout(() => {
                if (!this.connected) {
                    reject(new Error('Connection timeout'));
                }
            }, 10000);
        });
    }

    async testRoomCreation() {
        console.log('\n🏠 Testing room creation...');
        
        return new Promise((resolve) => {
            const createRoomMessage = {
                type: 'createRoom',
                roomCode: this.roomCode
            };

            this.socket.send(JSON.stringify(createRoomMessage));
            console.log('📤 Sent: createRoom');

            // Wait for response
            setTimeout(() => {
                console.log('✅ Room creation test completed');
                resolve();
            }, 2000);
        });
    }

    async testGameMessages() {
        console.log('\n🎮 Testing game messages...');

        const testMessages = [
            {
                type: 'gameMessage',
                data: {
                    type: 'cardMove',
                    data: { cardId: 'test_card_1', x: 100, y: 200 },
                    playerId: 'test_player',
                    timestamp: Date.now(),
                    roomCode: this.roomCode
                }
            },
            {
                type: 'gameMessage',
                data: {
                    type: 'cardFlip',
                    data: { cardId: 'test_card_2' },
                    playerId: 'test_player',
                    timestamp: Date.now(),
                    roomCode: this.roomCode
                }
            },
            {
                type: 'gameMessage',
                data: {
                    type: 'cardDeal',
                    data: { 
                        cardId: 'test_card_3', 
                        card: { title: 'Test Card', emoji: '🃏' },
                        x: 300, 
                        y: 400,
                        deckState: []
                    },
                    playerId: 'test_player',
                    timestamp: Date.now(),
                    roomCode: this.roomCode
                }
            },
            {
                type: 'gameMessage',
                data: {
                    type: 'deckShuffle',
                    data: {},
                    playerId: 'test_player',
                    timestamp: Date.now(),
                    roomCode: this.roomCode
                }
            },
            {
                type: 'gameMessage',
                data: {
                    type: 'resetGame',
                    data: {},
                    playerId: 'test_player',
                    timestamp: Date.now(),
                    roomCode: this.roomCode
                }
            }
        ];

        for (const message of testMessages) {
            this.socket.send(JSON.stringify(message));
            console.log(`📤 Sent: ${message.data.type}`);
            await this.sleep(500); // Wait 500ms between messages
        }

        console.log('✅ Game messages test completed');
    }

    async testDisconnection() {
        console.log('\n🔌 Testing disconnection...');
        
        return new Promise((resolve) => {
            setTimeout(() => {
                this.socket.close();
                console.log('✅ Disconnection test completed');
                resolve();
            }, 1000);
        });
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Run the test if this file is executed directly
if (require.main === module) {
    const tester = new WebSocketTester();
    tester.run().catch(error => {
        console.error('Test failed:', error);
        process.exit(1);
    });
}

module.exports = WebSocketTester;
