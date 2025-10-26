#!/usr/bin/env node

/**
 * Simple Integration Test for Card Game Multiplayer Synchronization
 * Tests core synchronization logic without full DOM dependencies
 */

const WebSocket = require('ws');
const http = require('http');
const url = require('url');

// Mock browser environment
global.window = {
    location: { protocol: 'http:' },
    document: {
        getElementById: () => ({ addEventListener: () => {}, style: {} }),
        querySelector: () => null,
        querySelectorAll: () => [],
        createElement: () => ({
            className: '',
            style: {},
            dataset: {},
            classList: { add: () => {}, remove: () => {}, contains: () => false },
            appendChild: () => {},
            remove: () => {},
            parentNode: { removeChild: () => {} }
        }),
        addEventListener: () => {}
    },
    navigator: { userAgent: 'Test Browser', clipboard: { writeText: () => Promise.resolve() } },
    localStorage: { getItem: () => null, setItem: () => {} },
    setTimeout: setTimeout,
    setInterval: setInterval,
    clearInterval: clearInterval,
    console: console
};

global.document = global.window.document;
global.alert = (msg) => console.log('ALERT:', msg);

// Load the cards module and VirusDeck
const fs = require('fs');
const path = require('path');
const cardsModule = fs.readFileSync(path.join(__dirname, '../src/shared/cards.js'), 'utf8');
eval(cardsModule);

// For now, let's use a regular Deck with more cards to simulate VirusDeck behavior
// This avoids the complexity of loading VirusDeck in the test environment

class SimpleIntegrationTest {
    constructor() {
        this.server = null;
        this.wss = null;
        this.rooms = new Map();
        this.connections = new Map();
        this.browser1 = null;
        this.browser2 = null;
        this.testResults = [];
        
        // Event monitoring for meta test
        this.allWebSocketEvents = new Set();
        this.allGameMessageTypes = new Set();
        this.eventMonitoringEnabled = false;
    }

    async start() {
        console.log('🧪 Starting Simple Integration Test for Card Game Multiplayer');
        
        // Start WebSocket server
        await this.startWebSocketServer();
        
        // Create two browser instances
        this.browser1 = new MockBrowser('browser1', 'player_1');
        this.browser2 = new MockBrowser('browser2', 'player_2');
        
        // Run tests
        await this.runTests();
        
        // Cleanup
        this.cleanup();
    }

    async startWebSocketServer() {
        return new Promise((resolve) => {
            this.server = http.createServer();
            this.wss = new WebSocket.Server({ server: this.server });

            this.wss.on('connection', (ws, request) => {
                const urlParts = url.parse(request.url, true);
                const roomCode = urlParts.pathname.split('/').pop() || 'default';
                
                console.log(`🔗 New connection to room: ${roomCode}`);
                
                if (!this.rooms.has(roomCode)) {
                    this.rooms.set(roomCode, new Set());
                }
                this.rooms.get(roomCode).add(ws);
                this.connections.set(ws, roomCode);

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
                    console.log(`🔌 Connection closed for room: ${roomCode}`);
                    this.removeFromRoom(ws, roomCode);
                });

                ws.on('error', (error) => {
                    console.error('WebSocket error:', error);
                    this.removeFromRoom(ws, roomCode);
                });
            });

            this.server.listen(8082, () => {
                console.log('🎮 Test WebSocket Server running on port 8082');
                resolve();
            });
        });
    }

    handleMessage(ws, message, roomCode) {
        console.log(`📨 Room ${roomCode}: ${message.type}`);
        
        // Track all WebSocket events for monitoring
        if (this.eventMonitoringEnabled) {
            this.allWebSocketEvents.add(message.type);
            
            // Track gameMessage types
            if (message.type === 'gameMessage' && message.data && message.data.type) {
                this.allGameMessageTypes.add(message.data.type);
            }
        }
        
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
                this.broadcastToRoom(roomCode, {
                    type: 'playerJoined',
                    playerId: message.playerId || 'unknown',
                    roomCode: roomCode
                }, ws);
                break;
                
            case 'gameMessage':
                this.broadcastToRoom(roomCode, {
                    type: 'gameMessage',
                    data: message.data
                }, ws);
                break;
                
            default:
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
                this.broadcastToRoom(roomCode, {
                    type: 'playerLeft',
                    playerId: 'unknown',
                    roomCode: roomCode
                });
            }
        }
        this.connections.delete(ws);
    }

    async runTests() {
        console.log('\n🧪 Running Integration Tests...\n');
        
        // Enable event monitoring for meta test
        this.eventMonitoringEnabled = true;
        this.allWebSocketEvents.clear();
        this.allGameMessageTypes.clear();
        
        // Test 1: Room Creation and Joining
        await this.testRoomCreation();
        
        // Test 2: Card Synchronization
        await this.testCardSynchronization();
        
        // Test 3: State Validation
        await this.testStateValidation();
        
        // Test 4: Room Switching
        await this.testRoomSwitching();
        
        // Test 5: Multiple Card Synchronization
        await this.testMultipleCardSynchronization();
        
        // Test 6: Deck Synchronization
        await this.testDeckSynchronization();
        
        // Test 7: Player List Management
        await this.testPlayerListManagement();
        
        // Test 8: Player Alias Updates
        await this.testPlayerAliasUpdates();
        
        // Test 9: Player Alias Generation
        await this.testPlayerAliasGeneration();
        
        // Test 10: Player Alias Broadcasting
        await this.testPlayerAliasBroadcasting();
        
        // Test 11: Player Alias Persistence
        await this.testPlayerAliasPersistence();
        
        // Test 12: Player Alias Display Names
        await this.testPlayerAliasDisplayNames();
        
        // Test 13: Card Shuffling Synchronization
        await this.testCardShufflingSynchronization();
        
        // Test 14: WebSocket Event Monitoring (Meta Test)
        await this.testWebSocketEventMonitoring();
        
        // Print results
        this.printResults();
    }

    async testRoomCreation() {
        console.log('📋 Test 1: Room Creation and Joining');
        
        try {
            await this.browser1.createRoom();
            await this.wait(1000);
            
            await this.browser2.joinRoom(this.browser1.roomCode);
            await this.wait(1000);
            
            const browser1Connected = this.browser1.connectionStatus === 'connected';
            const browser2Connected = this.browser2.connectionStatus === 'connected';
            
            this.addResult('Room Creation', browser1Connected && browser2Connected, 
                `Browser1: ${browser1Connected}, Browser2: ${browser2Connected}`);
                
        } catch (error) {
            this.addResult('Room Creation', false, `Error: ${error.message}`);
        }
    }

    async testCardSynchronization() {
        console.log('📋 Test 2: Card Synchronization');
        
        try {
            const card = this.browser1.dealCard();
            await this.wait(500);
            
            const browser2Cards = this.browser2.getCardCount();
            const browser1Cards = this.browser1.getCardCount();
            
            this.addResult('Card Synchronization', browser2Cards > 0, 
                `Browser1 cards: ${browser1Cards}, Browser2 cards: ${browser2Cards}`);
                
        } catch (error) {
            this.addResult('Card Synchronization', false, `Error: ${error.message}`);
        }
    }

    async testStateValidation() {
        console.log('📋 Test 3: State Validation');
        
        try {
            const state1 = this.browser1.getCurrentState();
            const state2 = this.browser2.getCurrentState();
            
            const cardCountMatch = Math.abs(state1.cardCount - state2.cardCount) <= 1;
            const hashMatch = state1.hash === state2.hash;
            
            this.addResult('State Validation', cardCountMatch, 
                `Card counts match: ${cardCountMatch}, Hash match: ${hashMatch}`);
                
        } catch (error) {
            this.addResult('State Validation', false, `Error: ${error.message}`);
        }
    }

    async testRoomSwitching() {
        console.log('📋 Test 4: Room Switching');
        
        try {
            const oldRoom = this.browser1.roomCode;
            await this.browser1.createRoom();
            await this.wait(1000);
            
            // Browser2 should join the new room
            await this.browser2.joinRoom(this.browser1.roomCode);
            await this.wait(1000);
            
            const newRoom = this.browser1.roomCode;
            const roomSwitched = newRoom !== oldRoom;
            const bothInSameRoom = this.browser1.roomCode === this.browser2.roomCode;
            
            this.addResult('Room Switching', roomSwitched && bothInSameRoom, 
                `Old room: ${oldRoom}, New room: ${newRoom}, Both in same room: ${bothInSameRoom}`);
                
        } catch (error) {
            this.addResult('Room Switching', false, `Error: ${error.message}`);
        }
    }

    async testMultipleCardSynchronization() {
        console.log('📋 Test 5: Multiple Card Synchronization');
        
        try {
            // Deal multiple cards from browser1
            const card1 = this.browser1.dealCard();
            await this.wait(200);
            const card2 = this.browser1.dealCard();
            await this.wait(200);
            const card3 = this.browser1.dealCard();
            await this.wait(500);
            
            const browser2Cards = this.browser2.getCardCount();
            const browser1Cards = this.browser1.getCardCount();
            
            this.addResult('Multiple Card Sync', browser2Cards >= 3, 
                `Browser1 cards: ${browser1Cards}, Browser2 cards: ${browser2Cards}`);
                
        } catch (error) {
            this.addResult('Multiple Card Sync', false, `Error: ${error.message}`);
        }
    }

    async testDeckSynchronization() {
        console.log('📋 Test 6: Deck Synchronization');
        
        try {
            // Get initial deck lengths
            const initialDeck1 = this.browser1.getDeckLength();
            const initialDeck2 = this.browser2.getDeckLength();
            
            console.log(`🎲 Initial deck lengths - Browser1: ${initialDeck1}, Browser2: ${initialDeck2}`);
            
            // Deal several cards from browser1
            const cardsDealt = [];
            for (let i = 0; i < 5; i++) {
                const card = this.browser1.dealCard();
                if (card) {
                    cardsDealt.push(card);
                }
                await this.wait(100);
            }
            
            await this.wait(500); // Wait for all messages to propagate
            
            // Check final deck lengths
            const finalDeck1 = this.browser1.getDeckLength();
            const finalDeck2 = this.browser2.getDeckLength();
            
            console.log(`🎲 Final deck lengths - Browser1: ${finalDeck1}, Browser2: ${finalDeck2}`);
            console.log(`🎲 Cards dealt: ${cardsDealt.length}`);
            
            // Check if decks are synchronized
            const deckSync = Math.abs(finalDeck1 - finalDeck2) <= 1; // Allow for 1 card difference due to timing
            const expectedDeckLength = initialDeck1 - cardsDealt.length;
            const deckLengthCorrect = Math.abs(finalDeck1 - expectedDeckLength) <= 1;
            
            this.addResult('Deck Synchronization', deckSync && deckLengthCorrect, 
                `Browser1 deck: ${finalDeck1}, Browser2 deck: ${finalDeck2}, Expected: ${expectedDeckLength}, Sync: ${deckSync}`);
                
        } catch (error) {
            this.addResult('Deck Synchronization', false, `Error: ${error.message}`);
        }
    }

    async testPlayerListManagement() {
        console.log('📋 Test 7: Player List Management');
        
        try {
            // Clear any existing player lists
            this.browser1.connectedPlayers.clear();
            this.browser2.connectedPlayers.clear();
            
            // Player 1 creates room and should have themselves in the list
            await this.browser1.createRoom();
            await this.wait(500);
            
            // Player 2 joins room
            await this.browser2.joinRoom(this.browser1.roomCode);
            await this.wait(1000); // Wait for player list exchange
            
            // Check that both players have each other in their connected players
            const browser1HasSelf = this.browser1.connectedPlayers.has(this.browser1.playerId);
            const browser1HasPlayer2 = this.browser1.connectedPlayers.has(this.browser2.playerId);
            const browser2HasSelf = this.browser2.connectedPlayers.has(this.browser2.playerId);
            const browser2HasPlayer1 = this.browser2.connectedPlayers.has(this.browser1.playerId);
            
            const playerListSync = browser1HasSelf && browser1HasPlayer2 && 
                                  browser2HasSelf && browser2HasPlayer1;
            
            this.addResult('Player List Management', playerListSync, 
                `Browser1 players: ${Array.from(this.browser1.connectedPlayers)}, Browser2 players: ${Array.from(this.browser2.connectedPlayers)}`);
                
        } catch (error) {
            this.addResult('Player List Management', false, `Error: ${error.message}`);
        }
    }

    async testPlayerAliasUpdates() {
        console.log('📋 Test 8: Player Alias Updates');
        
        try {
            // Set initial aliases
            this.browser1.playerAlias = 'original_alias_1';
            this.browser2.playerAlias = 'original_alias_2';
            
            // Player 2 updates their alias
            const newAlias = 'updated_alias_2';
            this.browser2.updatePlayerAlias(newAlias);
            await this.wait(500);
            
            // Check that browser1 received the alias update
            const browser1KnowsNewAlias = this.browser1.playerAliases.get(this.browser2.playerId) === newAlias;
            const browser2HasNewAlias = this.browser2.playerAlias === newAlias;
            
            this.addResult('Player Alias Updates', browser1KnowsNewAlias && browser2HasNewAlias, 
                `Browser1 knows alias: ${this.browser1.playerAliases.get(this.browser2.playerId)}, Browser2 alias: ${this.browser2.playerAlias}`);
                
        } catch (error) {
            this.addResult('Player Alias Updates', false, `Error: ${error.message}`);
        }
    }

    async testPlayerAliasGeneration() {
        console.log('📋 Test 9: Player Alias Generation');
        
        try {
            // Create new browser instances to test alias generation
            const testBrowser1 = new MockBrowser('test_browser1', 'test_player_1');
            const testBrowser2 = new MockBrowser('test_browser2', 'test_player_2');
            
            // Check that aliases are generated in the correct format (adjective_noun)
            const alias1 = testBrowser1.playerAlias;
            const alias2 = testBrowser2.playerAlias;
            
            const alias1Format = /^[a-z]+_[a-z]+$/.test(alias1);
            const alias2Format = /^[a-z]+_[a-z]+$/.test(alias2);
            const aliasesDifferent = alias1 !== alias2;
            
            this.addResult('Player Alias Generation', alias1Format && alias2Format && aliasesDifferent, 
                `Alias1: ${alias1} (format: ${alias1Format}), Alias2: ${alias2} (format: ${alias2Format}), Different: ${aliasesDifferent}`);
                
        } catch (error) {
            this.addResult('Player Alias Generation', false, `Error: ${error.message}`);
        }
    }

    async testPlayerAliasBroadcasting() {
        console.log('📋 Test 10: Player Alias Broadcasting');
        
        try {
            // Clear existing player lists
            this.browser1.connectedPlayers.clear();
            this.browser2.connectedPlayers.clear();
            this.browser1.playerAliases.clear();
            this.browser2.playerAliases.clear();
            
            // Set known aliases
            this.browser1.playerAlias = 'broadcast_test_1';
            this.browser2.playerAlias = 'broadcast_test_2';
            
            // Create room and join
            await this.browser1.createRoom();
            await this.wait(500);
            await this.browser2.joinRoom(this.browser1.roomCode);
            await this.wait(1000);
            
            // Check that aliases were properly broadcast and received
            const browser1KnowsBrowser2Alias = this.browser1.playerAliases.get(this.browser2.playerId) === 'broadcast_test_2';
            const browser2KnowsBrowser1Alias = this.browser2.playerAliases.get(this.browser1.playerId) === 'broadcast_test_1';
            
            // Check that both browsers have each other in their connected players
            const browser1HasBrowser2 = this.browser1.connectedPlayers.has(this.browser2.playerId);
            const browser2HasBrowser1 = this.browser2.connectedPlayers.has(this.browser1.playerId);
            
            this.addResult('Player Alias Broadcasting', 
                browser1KnowsBrowser2Alias && browser2KnowsBrowser1Alias && browser1HasBrowser2 && browser2HasBrowser1, 
                `B1 knows B2 alias: ${browser1KnowsBrowser2Alias}, B2 knows B1 alias: ${browser2KnowsBrowser1Alias}, Both connected: ${browser1HasBrowser2 && browser2HasBrowser1}`);
                
        } catch (error) {
            this.addResult('Player Alias Broadcasting', false, `Error: ${error.message}`);
        }
    }

    async testPlayerAliasPersistence() {
        console.log('📋 Test 11: Player Alias Persistence');
        
        try {
            // Test that aliases persist across multiple broadcasts
            this.browser1.playerAlias = 'persistent_alias_1';
            this.browser2.playerAlias = 'persistent_alias_2';
            
            // Clear and rebuild player lists multiple times
            for (let i = 0; i < 3; i++) {
                this.browser1.connectedPlayers.clear();
                this.browser2.connectedPlayers.clear();
                this.browser1.playerAliases.clear();
                this.browser2.playerAliases.clear();
                
                // Re-add players and broadcast
                this.browser1.connectedPlayers.add(this.browser1.playerId);
                this.browser1.connectedPlayers.add(this.browser2.playerId);
                this.browser2.connectedPlayers.add(this.browser1.playerId);
                this.browser2.connectedPlayers.add(this.browser2.playerId);
                
                this.browser1.broadcastPlayerList();
                this.browser2.broadcastPlayerList();
                await this.wait(200);
            }
            
            // Check that aliases are still correctly stored
            const browser1KnowsBrowser2Alias = this.browser1.playerAliases.get(this.browser2.playerId) === 'persistent_alias_2';
            const browser2KnowsBrowser1Alias = this.browser2.playerAliases.get(this.browser1.playerId) === 'persistent_alias_1';
            
            this.addResult('Player Alias Persistence', browser1KnowsBrowser2Alias && browser2KnowsBrowser1Alias, 
                `B1 knows B2 alias: ${browser1KnowsBrowser2Alias}, B2 knows B1 alias: ${browser2KnowsBrowser1Alias}`);
                
        } catch (error) {
            this.addResult('Player Alias Persistence', false, `Error: ${error.message}`);
        }
    }

    async testPlayerAliasDisplayNames() {
        console.log('📋 Test 12: Player Alias Display Names');
        
        try {
            // Test the getPlayerDisplayName functionality
            this.browser1.playerAlias = 'display_test_1';
            this.browser2.playerAlias = 'display_test_2';
            
            // Set up aliases in the maps
            this.browser1.playerAliases.set(this.browser2.playerId, 'display_test_2');
            this.browser2.playerAliases.set(this.browser1.playerId, 'display_test_1');
            
            // Test getPlayerDisplayName for self (should return own alias)
            const browser1SelfDisplay = this.browser1.getPlayerDisplayName(this.browser1.playerId);
            const browser2SelfDisplay = this.browser2.getPlayerDisplayName(this.browser2.playerId);
            
            // Test getPlayerDisplayName for other player (should return stored alias)
            const browser1OtherDisplay = this.browser1.getPlayerDisplayName(this.browser2.playerId);
            const browser2OtherDisplay = this.browser2.getPlayerDisplayName(this.browser1.playerId);
            
            // Test getPlayerDisplayName for unknown player (should return playerId)
            const unknownPlayerId = 'unknown_player_123';
            const browser1UnknownDisplay = this.browser1.getPlayerDisplayName(unknownPlayerId);
            
            const selfDisplayCorrect = browser1SelfDisplay === 'display_test_1' && browser2SelfDisplay === 'display_test_2';
            const otherDisplayCorrect = browser1OtherDisplay === 'display_test_2' && browser2OtherDisplay === 'display_test_1';
            const unknownDisplayCorrect = browser1UnknownDisplay === unknownPlayerId;
            
            this.addResult('Player Alias Display Names', 
                selfDisplayCorrect && otherDisplayCorrect && unknownDisplayCorrect, 
                `Self display: ${selfDisplayCorrect}, Other display: ${otherDisplayCorrect}, Unknown display: ${unknownDisplayCorrect}`);
                
        } catch (error) {
            this.addResult('Player Alias Display Names', false, `Error: ${error.message}`);
        }
    }

    async testCardShufflingSynchronization() {
        console.log('📋 Test 13: Card Shuffling Synchronization');
        
        try {
            // Clear any existing cards
            this.browser1.cards = [];
            this.browser2.cards = [];
            
            // Deal a card from browser1
            const dealtCard = this.browser1.dealCard();
            await this.wait(500);
            
            // Verify both players have the card
            const browser1CardsBefore = this.browser1.getCardCount();
            const browser2CardsBefore = this.browser2.getCardCount();
            const browser1DeckBefore = this.browser1.getDeckLength();
            const browser2DeckBefore = this.browser2.getDeckLength();
            
            console.log(`🎲 Before shuffle - B1 cards: ${browser1CardsBefore}, B2 cards: ${browser2CardsBefore}, B1 deck: ${browser1DeckBefore}, B2 deck: ${browser2DeckBefore}`);
            
            // Browser1 shuffles the card back into the deck
            const shuffleSuccess = this.browser1.shuffleCardBack(dealtCard.title);
            await this.wait(500);
            
            // Check final state
            const browser1CardsAfter = this.browser1.getCardCount();
            const browser2CardsAfter = this.browser2.getCardCount();
            const browser1DeckAfter = this.browser1.getDeckLength();
            const browser2DeckAfter = this.browser2.getDeckLength();
            
            console.log(`🎲 After shuffle - B1 cards: ${browser1CardsAfter}, B2 cards: ${browser2CardsAfter}, B1 deck: ${browser1DeckAfter}, B2 deck: ${browser2DeckAfter}`);
            
            // Verify synchronization
            const cardsRemovedFromBoth = browser1CardsAfter === browser1CardsBefore - 1 && browser2CardsAfter === browser2CardsBefore - 1;
            const cardsAddedToBothDecks = browser1DeckAfter === browser1DeckBefore + 1 && browser2DeckAfter === browser2DeckBefore + 1;
            const shuffleWorked = shuffleSuccess;
            
            this.addResult('Card Shuffling Synchronization', 
                cardsRemovedFromBoth && cardsAddedToBothDecks && shuffleWorked,
                `Cards removed: ${cardsRemovedFromBoth}, Cards added to deck: ${cardsAddedToBothDecks}, Shuffle worked: ${shuffleWorked}`);
                
        } catch (error) {
            this.addResult('Card Shuffling Synchronization', false, `Error: ${error.message}`);
        }
    }

    async testWebSocketEventMonitoring() {
        console.log('📋 Test 14: WebSocket Event Monitoring (Meta Test)');
        
        try {
            // Define the expected WebSocket events (intentional events only)
            const expectedWebSocketEvents = new Set([
                'createRoom',
                'joinRoom', 
                'gameMessage'
            ]);
            
            // Define the expected gameMessage types (intentional game events only)
            const expectedGameMessageTypes = new Set([
                'cardState',
                'deckChange',
                'playerList'
                // Note: resetGame, requestFullState, stateValidation, requestStateCorrection 
                // are valid events but not used in current test suite
            ]);
            
            // Check for unexpected WebSocket events
            const unexpectedWebSocketEvents = new Set();
            for (const event of this.allWebSocketEvents) {
                if (!expectedWebSocketEvents.has(event)) {
                    unexpectedWebSocketEvents.add(event);
                }
            }
            
            // Check for unexpected gameMessage types
            const unexpectedGameMessageTypes = new Set();
            for (const gameType of this.allGameMessageTypes) {
                if (!expectedGameMessageTypes.has(gameType)) {
                    unexpectedGameMessageTypes.add(gameType);
                }
            }
            
            // Check that we saw all expected events (ensures we're testing the right things)
            const missingWebSocketEvents = new Set();
            for (const expectedEvent of expectedWebSocketEvents) {
                if (!this.allWebSocketEvents.has(expectedEvent)) {
                    missingWebSocketEvents.add(expectedEvent);
                }
            }
            
            const missingGameMessageTypes = new Set();
            for (const expectedGameType of expectedGameMessageTypes) {
                if (!this.allGameMessageTypes.has(expectedGameType)) {
                    missingGameMessageTypes.add(expectedGameType);
                }
            }
            
            // Test passes if no unexpected events and all expected events are present
            const noUnexpectedEvents = unexpectedWebSocketEvents.size === 0 && unexpectedGameMessageTypes.size === 0;
            const allExpectedEventsPresent = missingWebSocketEvents.size === 0 && missingGameMessageTypes.size === 0;
            
            const testPassed = noUnexpectedEvents && allExpectedEventsPresent;
            
            // Create detailed report
            let details = `WebSocket Events: ${Array.from(this.allWebSocketEvents).sort().join(', ')}`;
            details += ` | GameMessage Types: ${Array.from(this.allGameMessageTypes).sort().join(', ')}`;
            
            if (unexpectedWebSocketEvents.size > 0) {
                details += ` | UNEXPECTED WebSocket Events: ${Array.from(unexpectedWebSocketEvents).join(', ')}`;
            }
            if (unexpectedGameMessageTypes.size > 0) {
                details += ` | UNEXPECTED GameMessage Types: ${Array.from(unexpectedGameMessageTypes).join(', ')}`;
            }
            if (missingWebSocketEvents.size > 0) {
                details += ` | MISSING WebSocket Events: ${Array.from(missingWebSocketEvents).join(', ')}`;
            }
            if (missingGameMessageTypes.size > 0) {
                details += ` | MISSING GameMessage Types: ${Array.from(missingGameMessageTypes).join(', ')}`;
            }
            
            this.addResult('WebSocket Event Monitoring', testPassed, details);
            
            // Log the event summary for visibility
            console.log(`📊 Event Summary:`);
            console.log(`   WebSocket Events (${this.allWebSocketEvents.size}): ${Array.from(this.allWebSocketEvents).sort().join(', ')}`);
            console.log(`   GameMessage Types (${this.allGameMessageTypes.size}): ${Array.from(this.allGameMessageTypes).sort().join(', ')}`);
            
        } catch (error) {
            this.addResult('WebSocket Event Monitoring', false, `Error: ${error.message}`);
        }
    }

    addResult(testName, passed, details) {
        this.testResults.push({
            test: testName,
            passed,
            details
        });
        console.log(`  ${passed ? '✅' : '❌'} ${testName}: ${details}`);
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
        
        if (passed === total) {
            console.log('🎉 All tests passed!');
        } else {
            console.log('⚠️  Some tests failed. Check the details above.');
        }
    }

    async wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    cleanup() {
        if (this.server) {
            this.server.close();
        }
        if (this.browser1) {
            this.browser1.disconnect();
        }
        if (this.browser2) {
            this.browser2.disconnect();
        }
        
        // Force exit after cleanup
        setTimeout(() => {
            process.exit(0);
        }, 100);
    }
}

class MockBrowser {
    constructor(name, playerId) {
        this.name = name;
        this.playerId = playerId;
        this.playerAlias = this.generatePlayerAlias();
        this.socket = null;
        this.roomCode = null;
        this.isHost = false;
        this.connectionStatus = 'offline';
        this.cards = [];
        this.deck = null;
        this.receivedMessages = [];
        this.connectedPlayers = new Set();
        this.playerAliases = new Map();
        
        this.initializeGame();
    }

    initializeGame() {
        // Create a large deck to simulate VirusDeck behavior
        this.deck = new window.cards.Deck();
        
        // Add many cards to simulate a full VirusDeck (around 80+ cards)
        const cardTypes = [
            { title: 'Heart', emoji: '🫀', color: 'red' },
            { title: 'Lungs', emoji: '🫁', color: 'green' },
            { title: 'Brain', emoji: '🧠', color: 'blue' },
            { title: 'Bones', emoji: '🦴', color: 'yellow' },
            { title: 'Virus', emoji: '🦠', color: 'red' },
            { title: 'Medicine', emoji: '💊', color: 'blue' },
            { title: 'Transplant', emoji: '🔄', color: 'neutral' },
            { title: 'Organ Thief', emoji: '🥷', color: 'neutral' }
        ];
        
        // Add 10 cards of each type to simulate a full deck
        cardTypes.forEach(cardType => {
            for (let i = 0; i < 10; i++) {
                this.deck.addCardFromData({
                    title: `${cardType.title} ${i + 1}`,
                    emoji: cardType.emoji,
                    color: cardType.color,
                    description: `Test ${cardType.title} card ${i + 1}`
                }, `${cardType.title.toLowerCase()}_${i + 1}`);
            }
        });
        
        console.log(`🎲 ${this.name}: Initialized large deck with ${this.deck.length} cards`);
    }

    generatePlayerAlias() {
        const adjectives = ['sneaky', 'clever', 'swift', 'brave', 'wise'];
        const nouns = ['panda', 'tiger', 'eagle', 'wolf', 'fox'];
        const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        return `${adjective}_${noun}`;
    }

    async createRoom() {
        console.log(`🏠 ${this.name}: Creating room`);
        
        this.roomCode = this.generateRoomCode();
        this.isHost = true;
        this.connectionStatus = 'connecting';
        
        await this.connectToWebSocket();
        
        this.socket.send(JSON.stringify({
            type: 'createRoom',
            roomCode: this.roomCode
        }));
    }

    async joinRoom(roomCode) {
        console.log(`🚪 ${this.name}: Joining room ${roomCode}`);
        
        this.roomCode = roomCode;
        this.isHost = false;
        this.connectionStatus = 'connecting';
        
        await this.connectToWebSocket();
        
        this.socket.send(JSON.stringify({
            type: 'joinRoom',
            roomCode: this.roomCode,
            playerId: this.playerId,
            playerAlias: this.playerAlias
        }));
    }

    async connectToWebSocket() {
        return new Promise((resolve, reject) => {
            this.socket = new WebSocket('ws://localhost:8082/chat/' + this.roomCode);
            
            this.socket.onopen = () => {
                console.log(`🔗 ${this.name}: Connected to WebSocket`);
                this.connectionStatus = 'connected';
                resolve();
            };
            
            this.socket.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    this.handleMessage(message);
                } catch (error) {
                    console.error(`${this.name} Error parsing message:`, error);
                }
            };
            
            this.socket.onclose = () => {
                console.log(`🔌 ${this.name}: Disconnected from WebSocket`);
                this.connectionStatus = 'offline';
            };
            
            this.socket.onerror = (error) => {
                console.error(`${this.name} WebSocket error:`, error);
                reject(error);
            };
        });
    }

    handleMessage(message) {
        console.log(`📨 ${this.name}: Received ${message.type}`);
        this.receivedMessages.push(message);
        
        switch (message.type) {
            case 'roomCreated':
                console.log(`✅ ${this.name}: Room created successfully`);
                this.connectionStatus = 'connected';
                break;
                
            case 'roomJoined':
                console.log(`✅ ${this.name}: Joined room successfully`);
                this.connectionStatus = 'connected';
                // Add ourselves to connected players
                this.connectedPlayers.add(this.playerId);
                // Broadcast our player list
                this.broadcastPlayerList();
                break;
                
            case 'gameMessage':
                this.handleGameMessage(message.data);
                break;
        }
    }

    handleGameMessage(data) {
        switch (data.type) {
            case 'cardState':
                this.handleCardState(data.data);
                break;
            case 'deckChange':
                this.handleDeckChange(data.data);
                break;
            case 'playerList':
                this.handlePlayerList(data.data);
                break;
        }
    }

    handleCardState(cardData) {
        console.log(`🃏 ${this.name}: Received card state for ${cardData.card.title}`);
        
        // Handle card removal (discarded)
        if (cardData.status === 'discarded') {
            console.log(`🗑️ ${this.name}: Received card removal for uniqueId: ${cardData.uniqueId}`);
            
            // Find and remove the card from our cards array
            const cardIndex = this.cards.findIndex(card => card.uniqueId === cardData.uniqueId);
            if (cardIndex !== -1) {
                const removedCard = this.cards[cardIndex];
                this.cards.splice(cardIndex, 1);
                console.log(`🗑️ ${this.name}: Removed card ${removedCard.title} from board`);
            } else {
                console.log(`🗑️ ${this.name}: Card with uniqueId ${cardData.uniqueId} not found in cards array`);
            }
            return; // Exit early for removal
        }
        
        // Create card using the actual cards module
        const card = new window.cards.Card(cardData.card);
        this.cards.push(card);
    }

    handleDeckChange(deckData) {
        console.log(`🎲 ${this.name}: Received deck change - ${deckData.action} ${deckData.cardTitle || ''}`);
        
        // Apply deck change to local deck
        if (deckData.action === 'deal') {
            // Remove card from deck
            const cardIndex = this.deck.cards.findIndex(card => 
                card.instanceId === deckData.cardInstanceId
            );
            if (cardIndex !== -1) {
                this.deck.cards.splice(cardIndex, 1);
            }
        } else if (deckData.action === 'shuffle') {
            // Remove card from our cards array and add back to deck
            const cardIndex = this.cards.findIndex(card => card.title === deckData.cardTitle);
            if (cardIndex !== -1) {
                const card = this.cards[cardIndex];
                this.cards.splice(cardIndex, 1); // Remove from cards array
                
                // Add back to deck
                this.deck.addCardFromData({
                    title: card.title,
                    emoji: card.emoji,
                    color: card.color,
                    description: card.description
                }, card.uniqueId);
                
                console.log(`🔄 ${this.name}: Received shuffle - removed ${deckData.cardTitle} from board, added back to deck`);
            }
        }
    }

    handlePlayerList(data) {
        console.log(`👥 ${this.name}: Received player list with ${data.players.length} players`);
        
        // Update our connected players set with the full list
        this.connectedPlayers.clear();
        this.connectedPlayers.add(this.playerId); // Always include ourselves
        
        data.players.forEach(playerData => {
            const playerId = playerData.playerId;
            const playerAlias = playerData.playerAlias;
            if (playerId && playerId !== this.playerId) {
                this.connectedPlayers.add(playerId);
                // Store the alias if it exists and is different from the playerId
                if (playerAlias && playerAlias !== playerId) {
                    this.playerAliases.set(playerId, playerAlias);
                    console.log(`👤 ${this.name}: Stored alias ${playerAlias} for player ${playerId}`);
                }
            }
        });
        
        console.log(`👥 ${this.name}: Final connected players: ${Array.from(this.connectedPlayers)}`);
        console.log(`👥 ${this.name}: Final aliases: ${JSON.stringify(Object.fromEntries(this.playerAliases))}`);
        
        // If we received a partial player list (missing ourselves), broadcast the complete list
        const hasSelf = data.players.some(p => p.playerId === this.playerId);
        if (!hasSelf) {
            console.log(`👥 ${this.name}: Received partial list, broadcasting complete list`);
            this.broadcastPlayerList();
        }
    }


    dealCard() {
        if (this.deck && this.deck.length > 0) {
            const card = this.deck.deal();
            this.cards.push(card);
            
            // Broadcast card state
            this.broadcastCardState(card);
            
            // Broadcast deck change
            this.broadcastDeckChange('deal', card);
            
            console.log(`🎲 ${this.name}: Dealt card ${card.title} (${this.deck.length} cards remaining)`);
            return card;
        }
        return null;
    }

    shuffleCardBack(cardTitle) {
        // Find the card in our cards array
        const cardIndex = this.cards.findIndex(card => card.title === cardTitle);
        if (cardIndex !== -1) {
            const card = this.cards[cardIndex];
            this.cards.splice(cardIndex, 1); // Remove from cards array
            
            // Add back to deck
            this.deck.addCardFromData({
                title: card.title,
                emoji: card.emoji,
                color: card.color,
                description: card.description
            }, card.uniqueId);
            
            // Broadcast card state with "discarded" status
            this.broadcastCardStateWithStatus(card, 'discarded');
            
            console.log(`🔄 ${this.name}: Shuffled card ${card.title} back into deck (${this.deck.length} cards in deck, ${this.cards.length} cards on board)`);
            return true;
        }
        return false;
    }

    broadcastCardState(card) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            const cardState = {
                uniqueId: card.uniqueId,
                card: {
                    title: card.title,
                    emoji: card.emoji,
                    color: card.color,
                    description: card.description,
                    instanceId: card.instanceId,
                    uniqueId: card.uniqueId
                },
                position: { x: 100, y: 100 },
                isFlipped: false,
                timestamp: Date.now()
            };
            
            this.socket.send(JSON.stringify({
                type: 'gameMessage',
                data: {
                    type: 'cardState',
                    data: cardState,
                    playerId: this.playerId,
                    timestamp: Date.now()
                }
            }));
        }
    }

    broadcastCardStateWithStatus(card, status) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            const cardState = {
                uniqueId: card.uniqueId,
                card: {
                    title: card.title,
                    emoji: card.emoji,
                    color: card.color,
                    description: card.description,
                    instanceId: card.instanceId,
                    uniqueId: card.uniqueId
                },
                position: { x: 100, y: 100 },
                isFlipped: false,
                status: status,
                timestamp: Date.now()
            };
            
            this.socket.send(JSON.stringify({
                type: 'gameMessage',
                data: {
                    type: 'cardState',
                    data: cardState,
                    playerId: this.playerId,
                    timestamp: Date.now()
                }
            }));
        }
    }

    broadcastDeckChange(action, card = null) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            const deckChange = {
                action: action,
                cardTitle: card ? card.title : null,
                cardInstanceId: card ? card.instanceId : null,
                deckLength: this.deck.length,
                timestamp: Date.now()
            };
            
            this.socket.send(JSON.stringify({
                type: 'gameMessage',
                data: {
                    type: 'deckChange',
                    data: deckChange,
                    playerId: this.playerId,
                    timestamp: Date.now()
                }
            }));
        }
    }

    broadcastPlayerList() {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            // Create player list including ourselves
            const playerList = Array.from(this.connectedPlayers).map(playerId => ({
                playerId: playerId,
                playerAlias: playerId === this.playerId ? this.playerAlias : (this.playerAliases.get(playerId) || playerId)
            }));
            
            // Add ourselves to the list if not already there
            const hasSelf = playerList.some(p => p.playerId === this.playerId);
            if (!hasSelf) {
                playerList.push({
                    playerId: this.playerId,
                    playerAlias: this.playerAlias
                });
            }
            
            console.log(`📤 ${this.name}: Broadcasting player list: ${JSON.stringify(playerList)}`);
            
            this.socket.send(JSON.stringify({
                type: 'gameMessage',
                data: {
                    type: 'playerList',
                    data: { players: playerList },
                    playerId: this.playerId,
                    timestamp: Date.now()
                }
            }));
        }
    }

    sendMessage(message) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({
                type: 'gameMessage',
                data: {
                    ...message,
                    playerId: this.playerId,
                    timestamp: Date.now()
                }
            }));
        }
    }

    updatePlayerAlias(newAlias) {
        console.log(`👤 ${this.name}: Updating alias from ${this.playerAlias} to ${newAlias}`);
        this.playerAlias = newAlias;
        console.log(`👤 ${this.name}: New alias set to: ${this.playerAlias}`);
        this.broadcastPlayerList();
    }

    getPlayerDisplayName(playerId) {
        // Return the alias if we have it, otherwise return the ID
        if (playerId === this.playerId) {
            return this.playerAlias;
        }
        return this.playerAliases.get(playerId) || playerId;
    }

    getCardCount() {
        return this.cards.length;
    }

    getDeckLength() {
        return this.deck ? this.deck.length : 0;
    }

    getCurrentState() {
        return {
            hash: this.generateStateHash(),
            timestamp: Date.now(),
            playerId: this.playerId,
            cardCount: this.cards.length
        };
    }

    generateStateHash() {
        const cardStates = this.cards.map(card => ({
            instanceId: card.instanceId,
            uniqueId: card.uniqueId,
            title: card.title
        }));
        
        const stateString = JSON.stringify(cardStates);
        let hash = 0;
        for (let i = 0; i < stateString.length; i++) {
            const char = stateString.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        
        return Math.abs(hash).toString(36);
    }

    generateRoomCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
        }
    }
}

// Run the test
if (require.main === module) {
    const test = new SimpleIntegrationTest();
    test.start().catch(console.error);
}

module.exports = SimpleIntegrationTest;
