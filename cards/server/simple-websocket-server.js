#!/usr/bin/env node

/**
 * Server-Authoritative WebSocket Server for Card Game
 * Stores and manages authoritative game state for all rooms
 */

const WebSocket = require('ws');
const http = require('http');
const url = require('url');

class SimpleWebSocketServer {
    constructor(port) {
        this.port = port || process.env.PORT || 8080;
        this.server = null;
        this.wss = null;
        // Room state: roomCode -> RoomState
        this.rooms = new Map();
        // Connection tracking: ws -> { roomCode, playerId }
        this.connections = new Map();
        
        // Performance metrics
        this.metrics = {
            messagesProcessed: 0,
            cardUpdatesProcessed: 0,
            roomsCreated: 0,
            roomsDeleted: 0,
            startTime: Date.now()
        };
    }

    start() {
        console.log(`🎮 Server-Authoritative WebSocket Server starting on port ${this.port}`);
        this.server = http.createServer();
        this.wss = new WebSocket.Server({ server: this.server });

        this.wss.on('connection', (ws, request) => {
            const urlParts = url.parse(request.url, true);
            const roomCode = urlParts.pathname.split('/').pop() || 'default';
            
            console.log(`New connection to room: ${roomCode}`);
            
            // Track connection (room and playerId will be set on joinRoom)
            this.connections.set(ws, { roomCode, playerId: null });

            // Enable native WebSocket ping/pong for keepalive
            // Server will send ping frames every 20 seconds
            const pingInterval = setInterval(() => {
                if (ws.readyState === WebSocket.OPEN) {
                    try {
                        ws.ping();
                    } catch (error) {
                        console.error('Failed to send ping:', error);
                        clearInterval(pingInterval);
                    }
                } else {
                    clearInterval(pingInterval);
                }
            }, 20000); // Send ping every 20 seconds

            // Handle pong responses (automatic in ws library, but we can track it)
            ws.on('pong', () => {
                // Pong received - connection is alive
                // This is handled automatically by the ws library
            });

            ws.on('message', (data) => {
                try {
                    const message = JSON.parse(data.toString());
                    this.handleMessage(ws, message, roomCode);
                } catch (error) {
                    console.error('Error parsing message:', error);
                    this.sendError(ws, 'Invalid message format');
                }
            });

            ws.on('close', () => {
                console.log(`Connection closed for room: ${roomCode}`);
                clearInterval(pingInterval);
                this.removeFromRoom(ws, roomCode);
            });

            ws.on('error', (error) => {
                console.error('WebSocket error:', error);
                clearInterval(pingInterval);
                this.removeFromRoom(ws, roomCode);
            });
        });

        this.server.listen(this.port, () => {
            console.log(`🎮 Server-Authoritative WebSocket Server running on port ${this.port}`);
            console.log(`🔗 WebSocket URL: ws://localhost:${this.port}/chat/{roomCode}`);
        });

        // Start room cleanup timer
        this.startCleanupTimer();
    }

    handleMessage(ws, message, roomCode) {
        const connInfo = this.connections.get(ws);
        const playerId = message.playerId || connInfo?.playerId;
        
        // Handle ping messages separately (don't log or increment metrics)
        if (message.type === 'ping') {
            // Respond to ping with pong to keep connection alive
            this.sendToClient(ws, { type: 'pong' });
            return;
        }
        
        this.metrics.messagesProcessed++;
        console.log(`Room ${roomCode}: ${message.type}`);
        
        switch (message.type) {
            
            case 'joinRoom':
                this.joinRoom(ws, message.roomCode || roomCode, playerId, message.playerName || message.playerAlias || 'Player');
                break;
                
            case 'requestFullState':
                this.handleRequestFullState(ws, message.roomCode || roomCode, playerId);
                break;
                
            case 'updateCardState':
                this.metrics.cardUpdatesProcessed++;
                this.updateCardState(message.roomCode || roomCode, playerId, message.cardStates);
                break;
                
            case 'updateDeck':
                this.updateDeck(message.roomCode || roomCode, playerId, message.deckId, message.deckData);
                break;
                
            case 'dealCard':
                this.dealCard(ws, message.roomCode || roomCode, playerId, message.position, message.location);
                break;
                
            case 'shuffleDiscardPile':
                this.shuffleDiscardPile(message.roomCode || roomCode, playerId, message.discardCardUniqueIds || []);
                break;
                
            case 'resetGame':
                this.resetGame(message.roomCode || roomCode, playerId);
                break;
                
            case 'gameMessage':
                // Authoritatively handle wrapped game messages
                if (message.data && message.data.type === 'cardState') {
                    // Normalize to array
                    const cs = Array.isArray(message.data.data)
                        ? message.data.data
                        : [message.data.data];
                    this.metrics.cardUpdatesProcessed += cs.length;
                    this.updateCardState(message.roomCode || roomCode, playerId, cs);
                } else if (message.data && message.data.type === 'deckChange') {
                    // Apply deck changes to server state when sent as wrapped gameMessage
                    const rs = this.rooms.get(roomCode);
                    if (rs && rs.gameState) {
                        // Update only deckData snapshot if provided
                        const payload = message.data.data || {};
                        if (payload.deckData) {
                            rs.gameState.deckData = payload.deckData;
                            if (typeof payload.originalDeckSize === 'number') {
                                rs.gameState.originalDeckSize = payload.originalDeckSize;
                            }
                        }
                        // Broadcast as-is so clients stay in sync
                        this.broadcastToRoom(roomCode, {
                            type: 'gameMessage',
                            data: message.data
                        }, ws);
                    }
                } else {
                    // Forward other game messages
                    this.broadcastToRoom(roomCode, {
                        type: 'gameMessage',
                        data: message.data
                    }, ws);
                }
                break;
                
            default:
                console.warn(`Unknown message type: ${message.type}`);
                break;
        }
    }

    // ========== Room State Management ==========
    
    createRoom(roomCode) {
        const roomState = {
            roomCode,
            createdAt: Date.now(),
            lastActivity: Date.now(),
            players: new Map(),
            gameState: {
                deckId: null,
                deckData: null,
                originalDeckSize: 0,
                cards: new Map(), // uniqueId -> CardState
                discardPile: [], // Array of uniqueIds
                dealtCards: [], // Cards that have been dealt
                highestZIndex: 10000 // Track highest z-index for consistent ordering
            },
            connections: new Set()
        };
        
        this.rooms.set(roomCode, roomState);
        this.metrics.roomsCreated++;
        console.log(`Created room: ${roomCode}`);
        return roomState;
    }
    
    joinRoom(ws, roomCode, playerId, playerName) {
        let roomState = this.rooms.get(roomCode);
        
        if (!roomState) {
            roomState = this.createRoom(roomCode);
        }
        
        const isHost = roomState.players.size === 0;
        
        // Update connection tracking
        this.connections.set(ws, { roomCode, playerId });
        
        // Add player
        roomState.players.set(playerId, {
            playerId,
            playerName,
            joinedAt: Date.now(),
            isHost,
            lastActivity: Date.now()
        });
        
        roomState.connections.add(ws);
        roomState.lastActivity = Date.now();
        
        // Build players list for the joining player
        const players = Array.from(roomState.players.values()).map(p => ({
            playerId: p.playerId,
            playerAlias: p.playerName || p.playerId
        }));
        
        // Send full state to joining player (includes players list for faster sync)
        this.sendToClient(ws, {
            type: 'roomJoined',
            roomCode,
            isHost,
            gameState: this.serializeGameState(roomState),
            players: players
        });
        
        // Broadcast player joined to others
        this.broadcastToRoom(roomCode, {
            type: 'gameMessage',
            data: {
                type: 'playerJoined',
                data: { playerId, playerName }
            },
            timestamp: Date.now(),
            sentBy: playerId
        }, ws);
        
        console.log(`Player ${playerId} joined room ${roomCode} (host: ${isHost})`);
        return roomState;
    }
    
    updateCardState(roomCode, playerId, cardStates) {
        // Validate: cardStates must always be an array
        if (!Array.isArray(cardStates)) {
            const errorMsg = 'Invalid cardStates: must be an array';
            console.error(errorMsg);
            const ws = this.findPlayerConnection(playerId, roomCode);
            if (ws) {
                this.sendError(ws, errorMsg, 'INVALID_STATE');
            }
            return;
        }
        
        const ws = this.findPlayerConnection(playerId, roomCode);
        if (!ws) {
            return;
        }
        
        const roomState = this.validateRoomAndPlayer(ws, roomCode, playerId);
        if (!roomState) {
            return;
        }
        
        // Apply updates to server state
        console.log(`[STATE][${roomCode}] Before updateCardState: discardPile=${JSON.stringify(roomState.gameState.discardPile)} size=${roomState.gameState.discardPile.length}`);
        console.log(`[STATE][${roomCode}] Incoming cardStates:`, Array.isArray(cardStates) ? cardStates.map(cs => ({ u: cs.uniqueId, loc: cs.location, status: cs.status })) : cardStates);
        cardStates.forEach(cardState => {
            if (cardState.status === 'discarded') {
                // Remove card from state
                roomState.gameState.cards.delete(cardState.uniqueId);
                // Remove from discard pile if present
                const discardIndex = roomState.gameState.discardPile.indexOf(cardState.uniqueId);
                if (discardIndex > -1) {
                    roomState.gameState.discardPile.splice(discardIndex, 1);
                }
            } else {
                // Update or add card state (preserve existing fields like location unless explicitly provided)
                const wasCardAlreadyInState = roomState.gameState.cards.has(cardState.uniqueId);
                const existing = roomState.gameState.cards.get(cardState.uniqueId) || {};
                const hasLocationField = Object.prototype.hasOwnProperty.call(cardState, 'location');
                // If explicitly moving to discard pile, enforce face-up at server
                if (hasLocationField && cardState.location === 'discardPile') {
                    cardState.isFlipped = false;
                }
                const merged = {
                    ...existing,
                    ...cardState,
                    timestamp: Date.now()
                };
                if (!hasLocationField && Object.prototype.hasOwnProperty.call(existing, 'location')) {
                    merged.location = existing.location;
                }
                
                // Track highest z-index if provided
                // Ensure we don't use invalid max int values (like from Date.now())
                if (cardState.zIndex !== undefined && cardState.zIndex !== null) {
                    const zIndexValue = typeof cardState.zIndex === 'number' ? cardState.zIndex : parseInt(cardState.zIndex, 10);
                    // Only track if it's a valid reasonable z-index (not max int or Date.now())
                    if (!isNaN(zIndexValue) && zIndexValue >= 0 && zIndexValue < 2000000000) {
                        roomState.gameState.highestZIndex = Math.max(roomState.gameState.highestZIndex || 10000, zIndexValue);
                    }
                }
                
                roomState.gameState.cards.set(cardState.uniqueId, merged);
                
                // If this is a newly dealt card (not in state before), remove it from deck
                if (!wasCardAlreadyInState && cardState.card && cardState.uniqueId) {
                    // This is a new card being dealt - remove it from the deck
                    if (roomState.gameState.deckData && roomState.gameState.deckData.cards) {
                        const deckCards = roomState.gameState.deckData.cards;
                        // Find and remove the card with matching uniqueId
                        const initialDeckSize = deckCards.length;
                        const cardIndex = deckCards.findIndex(card => card.uniqueId === cardState.uniqueId);
                        if (cardIndex !== -1) {
                            deckCards.splice(cardIndex, 1);
                            console.log(`[DECK][${roomCode}] Removed dealt card ${cardState.uniqueId} from deck. Deck size: ${initialDeckSize} -> ${deckCards.length}`);
                            
                            // Only broadcast deck update if we have valid deck data
                            if (roomState.gameState.deckData && roomState.gameState.deckId) {
                                // Broadcast deck update to all players
                                this.broadcastDeckUpdate(roomCode, playerId);
                            } else {
                                console.log(`[DECK][${roomCode}] Not broadcasting deck update - deck data not initialized yet`);
                            }
                        } else {
                            console.log(`[DECK][${roomCode}] Card ${cardState.uniqueId} not found in deck (deck size: ${deckCards.length}). Card data:`, cardState.card ? 'has card data' : 'no card data');
                        }
                    } else {
                        console.log(`[DECK][${roomCode}] No deck data available to remove card from - deck will be synced when player loads a deck`);
                    }
                }
                
                // Update discard pile tracking only if location is explicitly provided
                if (hasLocationField) {
                    this.updateDiscardPileTracking(roomState, cardState);
                }
            }
        });
        
        // Broadcast array of card states to all clients in room
        console.log(`[STATE][${roomCode}] After updateCardState: discardPile=${JSON.stringify(roomState.gameState.discardPile)} size=${roomState.gameState.discardPile.length}`);
        this.broadcastToRoom(roomCode, {
            type: 'gameMessage',
            data: {
                type: 'cardState',
                data: cardStates // Always array format
            },
            timestamp: Date.now(),
            sentBy: playerId
        });
    }
    
    dealCard(ws, roomCode, playerId, position = null, location = 'private') {
        const roomState = this.validateRoomAndPlayer(ws, roomCode, playerId);
        if (!roomState) {
            return;
        }
        
        // Check if deck exists and has cards
        if (!roomState.gameState.deckData || !roomState.gameState.deckData.cards || roomState.gameState.deckData.cards.length === 0) {
            this.sendError(ws, 'No cards available in deck', 'DECK_EMPTY');
            return;
        }
        
        // Pop a card from the deck (server is authoritative)
        const card = roomState.gameState.deckData.cards.pop();
        if (!card) {
            this.sendError(ws, 'Failed to deal card', 'DEAL_FAILED');
            return;
        }
        
        console.log(`[DEAL][${roomCode}] Player ${playerId} dealt card ${card.uniqueId}. Deck size: ${roomState.gameState.deckData.cards.length + 1} -> ${roomState.gameState.deckData.cards.length}`);
        
        // Determine position and privateTo based on location
        // If location is 'table' and position is provided, deal to table at that position
        // Otherwise, deal to private hand (default behavior)
        // Debug: log the exact values received
        console.log(`[DEAL][${roomCode}] Deal request details:`, { 
            location, 
            locationType: typeof location,
            locationValue: JSON.stringify(location),
            locationIsTable: location === 'table',
            position, 
            hasPosition: !!position 
        });
        const finalPosition = (location === 'table' && position) ? position : { x: 0, y: 0 };
        const privateTo = (location === 'table') ? null : playerId; // Table cards are public
        console.log(`[DEAL][${roomCode}] Final card state:`, { finalPosition, privateTo, location, locationIsTable: location === 'table' });
        
        // Use highest z-index + 1 for new card (ensures it's on top)
        // First, check all existing cards to find the true highest z-index
        let maxExistingZIndex = roomState.gameState.highestZIndex || 10000;
        for (const [uniqueId, cardState] of roomState.gameState.cards.entries()) {
            if (cardState && cardState.zIndex !== undefined && cardState.zIndex !== null) {
                const zIndexValue = typeof cardState.zIndex === 'number' ? cardState.zIndex : parseInt(cardState.zIndex, 10);
                // Only consider valid reasonable z-index values (not max int)
                if (!isNaN(zIndexValue) && zIndexValue >= 0 && zIndexValue < 2000000000) {
                    maxExistingZIndex = Math.max(maxExistingZIndex, zIndexValue);
                }
            }
        }
        roomState.gameState.highestZIndex = maxExistingZIndex + 1;
        
        // Create card state for the dealt card
        const cardState = {
            uniqueId: card.uniqueId,
            card: card,
            position: finalPosition, // Use provided position for table, or (0,0) for private hand
            isFlipped: false, // Cards dealt are face-up
            privateTo: privateTo, // null for table cards, playerId for private hand
            zIndex: roomState.gameState.highestZIndex, // Use highest z-index + 1
            timestamp: Date.now()
        };
        
        // Only include location field if it's 'table' (to avoid undefined in JSON)
        // IMPORTANT: Explicitly set location field to ensure it's in the response
        if (location === 'table') {
            cardState.location = 'table';
            console.log(`[DEAL][${roomCode}] Setting cardState.location = 'table'`, { cardStateLocation: cardState.location });
        } else {
            // Explicitly do not set location for private cards to ensure clean state
            console.log(`[DEAL][${roomCode}] Not setting location (private card)`, { location, locationType: typeof location });
        }
        
        console.log(`[DEAL][${roomCode}] CardState before sending:`, { 
            uniqueId: cardState.uniqueId, 
            location: cardState.location, 
            hasLocation: 'location' in cardState,
            privateTo: cardState.privateTo,
            position: cardState.position
        });
        
        // Store card in game state
        roomState.gameState.cards.set(cardState.uniqueId, cardState);
        
        // Send card to requesting player
        this.sendToClient(ws, {
            type: 'gameMessage',
            data: {
                type: 'cardDealt',
                data: cardState
            },
            timestamp: Date.now(),
            sentBy: playerId
        });
        
        console.log(`[DEAL][${roomCode}] CardDealt message sent to player ${playerId}`, { 
            cardStateLocation: cardState.location,
            cardStateHasLocation: 'location' in cardState
        });
        
        // Broadcast deck update to all players (reduced deck size)
        this.broadcastDeckUpdate(roomCode, playerId);
        
        // Broadcast card state to all players (so they see it, but it's private)
        this.broadcastToRoom(roomCode, {
            type: 'gameMessage',
            data: {
                type: 'cardState',
                data: [cardState] // Always array format
            },
            timestamp: Date.now(),
            sentBy: playerId
        }, ws); // Exclude the requesting player (already sent via cardDealt)
    }
    
    updateDeck(roomCode, playerId, deckId, deckData) {
        const ws = this.findPlayerConnection(playerId, roomCode);
        if (!ws) {
            return;
        }
        
        const roomState = this.validateRoomAndPlayer(ws, roomCode, playerId);
        if (!roomState) {
            return;
        }
        
        // Update deck state
        roomState.gameState.deckId = deckId;
        roomState.gameState.deckData = deckData;
        roomState.gameState.originalDeckSize = deckData?.cards?.length || 0;
        
        // Clear all cards from board when deck changes
        roomState.gameState.cards.clear();
        roomState.gameState.discardPile = [];
        roomState.gameState.dealtCards = [];
        
        // Broadcast to all clients
        this.broadcastToRoom(roomCode, {
            type: 'gameMessage',
            data: {
                type: 'deckChange',
                data: { deckId, deckData }
            },
            timestamp: Date.now(),
            sentBy: playerId
        });
    }
    
    shuffleDiscardPile(roomCode, playerId, discardCardUniqueIds) {
        console.log(`[SHUFFLE] Player ${playerId} shuffling discard pile in room ${roomCode} with ${discardCardUniqueIds.length} cards:`, discardCardUniqueIds);
        
        const ws = this.findPlayerConnection(playerId, roomCode);
        if (!ws) {
            return;
        }
        
        const roomState = this.validateRoomAndPlayer(ws, roomCode, playerId);
        if (!roomState) {
            return;
        }
        
        // Collect card data from cards being shuffled BEFORE deletion
        const cardsToAdd = [];
        discardCardUniqueIds.forEach(uniqueId => {
            const cardState = roomState.gameState.cards.get(uniqueId);
            if (cardState && cardState.card) {
                // Store card data before deletion
                cardsToAdd.push(cardState.card);
                console.log(`[SHUFFLE] Found card data for ${uniqueId}:`, !!cardState.card);
            } else {
                console.log(`[SHUFFLE] Card not found in state for ${uniqueId}`);
            }
            // Remove from cards map and discard pile
            roomState.gameState.cards.delete(uniqueId);
            roomState.gameState.discardPile = roomState.gameState.discardPile.filter(
                id => id !== uniqueId
            );
        });
        
        console.log(`[SHUFFLE] Collected ${cardsToAdd.length} cards to add back to deck`);
        
        // Broadcast card removals
        const discardBroadcast = discardCardUniqueIds.map(uniqueId => ({
            uniqueId,
            status: 'discarded',
            timestamp: Date.now()
        }));
        
        console.log(`[SHUFFLE] Broadcasting discard messages for ${discardBroadcast.length} cards`);
        
        this.broadcastToRoom(roomCode, {
            type: 'gameMessage',
            data: {
                type: 'cardState',
                data: discardBroadcast
            },
            timestamp: Date.now(),
            sentBy: playerId
        });
        
        // Update deck (add cards back and shuffle)
        if (roomState.gameState.deckData && cardsToAdd.length > 0) {
            const originalSize = roomState.gameState.originalDeckSize || roomState.gameState.deckData.cards.length;
            const currentDeckSize = roomState.gameState.deckData.cards.length;
            const cardsToAddCount = cardsToAdd.length;
            
            // Ensure deck doesn't exceed original size
            // Calculate how many cards we can actually add
            const maxCardsToAdd = Math.max(0, originalSize - currentDeckSize);
            const actualCardsToAdd = Math.min(cardsToAddCount, maxCardsToAdd);
            
            if (actualCardsToAdd < cardsToAddCount) {
                console.warn(`Cannot add all ${cardsToAddCount} cards to deck. Original size: ${originalSize}, current: ${currentDeckSize}, can add: ${maxCardsToAdd}`);
            }
            
            // Add cards back to deck (only as many as we can without exceeding original size)
            const cardsToActuallyAdd = cardsToAdd.slice(0, actualCardsToAdd);
            roomState.gameState.deckData.cards.push(...cardsToActuallyAdd);
            
            // Shuffle the deck
            const shuffledDeck = this.shuffleArray([...roomState.gameState.deckData.cards]);
            roomState.gameState.deckData.cards = shuffledDeck;
            
            // Ensure originalDeckSize is set
            if (roomState.gameState.originalDeckSize === 0 && originalSize > 0) {
                roomState.gameState.originalDeckSize = originalSize;
            }
            
            // Ensure deck doesn't exceed original size (safety check)
            if (roomState.gameState.deckData.cards.length > roomState.gameState.originalDeckSize) {
                console.warn(`Deck size ${roomState.gameState.deckData.cards.length} exceeds original size ${roomState.gameState.originalDeckSize}, truncating`);
                roomState.gameState.deckData.cards = roomState.gameState.deckData.cards.slice(0, roomState.gameState.originalDeckSize);
            }
            
            // Broadcast deck update
            this.broadcastDeckUpdate(roomCode, playerId);
        }
    }
    
    resetGame(roomCode, playerId) {
        const ws = this.findPlayerConnection(playerId, roomCode);
        if (!ws) {
            return;
        }
        
        const roomState = this.validateRoomAndPlayer(ws, roomCode, playerId);
        if (!roomState) {
            return;
        }
        
        // Reset game state (keep deck, clear cards)
        roomState.gameState.cards.clear();
        roomState.gameState.discardPile = [];
        roomState.gameState.dealtCards = [];
        
        // If deck exists, reshuffle it
        if (roomState.gameState.deckData) {
            const shuffledDeck = this.shuffleArray([...roomState.gameState.deckData.cards]);
            roomState.gameState.deckData.cards = shuffledDeck;
        }
        
        // Broadcast reset
        this.broadcastToRoom(roomCode, {
            type: 'gameReset',
            gameState: this.serializeGameState(roomState),
            timestamp: Date.now(),
            sentBy: playerId
        });
    }
    
    handleRequestFullState(ws, roomCode, playerId) {
        const roomState = this.rooms.get(roomCode);
        if (!roomState) {
            this.sendError(ws, `Room ${roomCode} not found`);
            return;
        }
        
        // Serialize player list
        const players = Array.from(roomState.players.values());
        console.log(`[STATE][${roomCode}] handleRequestFullState: discardPile=${JSON.stringify(roomState.gameState.discardPile)} size=${roomState.gameState.discardPile.length}`);
        console.log(`[STATE][${roomCode}] handleRequestFullState cards keys =`, Array.from(roomState.gameState.cards.keys()));
        
        this.sendToClient(ws, {
            type: 'fullState',
            gameState: this.serializeGameState(roomState),
            players: players
        });
    }
    
    // ========== Helper Methods ==========
    
    serializeGameState(roomState) {
        // Convert Maps to objects for JSON serialization and enforce face-up for discard
        const rawEntries = Array.from(roomState.gameState.cards.entries());
        const adjustedEntries = rawEntries.map(([id, cs]) => {
            if (cs && cs.location === 'discardPile' && cs.isFlipped) {
                cs = { ...cs, isFlipped: false };
            }
            return [id, cs];
        });
        const cardsObj = Object.fromEntries(adjustedEntries);
        return {
            deckId: roomState.gameState.deckId,
            deckData: roomState.gameState.deckData,
            originalDeckSize: roomState.gameState.originalDeckSize,
            cards: cardsObj,
            discardPile: roomState.gameState.discardPile,
            dealtCards: roomState.gameState.dealtCards
        };
    }
    
    
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    sendToClient(ws, message) {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(message));
        }
    }
    
    sendError(ws, message, code = 'UNKNOWN') {
        this.sendToClient(ws, {
            type: 'error',
            message: message,
            code: code
        });
    }
    
    // Validate room and player (helper to reduce duplication)
    validateRoomAndPlayer(ws, roomCode, playerId) {
        const roomState = this.rooms.get(roomCode);
        if (!roomState) {
            this.sendError(ws, `Room ${roomCode} not found`, 'ROOM_NOT_FOUND');
            return null;
        }
        
        if (!roomState.players.has(playerId)) {
            this.sendError(ws, `Player not in room ${roomCode}`, 'PLAYER_NOT_IN_ROOM');
            return null;
        }
        
        roomState.lastActivity = Date.now();
        roomState.players.get(playerId).lastActivity = Date.now();
        
        return roomState;
    }
    
    // Update discard pile tracking (extracted from updateCardState for clarity)
    updateDiscardPileTracking(roomState, cardState) {
        const isInDiscardPile = cardState.location === 'discardPile';
        const stored = roomState.gameState.cards.get(cardState.uniqueId);
        
        if (isInDiscardPile) {
            // Add to discard pile array
            if (!roomState.gameState.discardPile.includes(cardState.uniqueId)) {
                roomState.gameState.discardPile.push(cardState.uniqueId);
            }
            if (stored) stored.location = 'discardPile';
        } else {
            // Remove from discard pile array
            const discardIndex = roomState.gameState.discardPile.indexOf(cardState.uniqueId);
            if (discardIndex > -1) {
                roomState.gameState.discardPile.splice(discardIndex, 1);
            }
            // Update stored location
            if (stored) {
                stored.location = cardState.location || stored.location || 'table';
            }
        }
    }
    
    // Broadcast deck update (helper to reduce duplication)
    broadcastDeckUpdate(roomCode, playerId) {
        const roomState = this.rooms.get(roomCode);
        if (!roomState || !roomState.gameState.deckData) return;
        
        this.broadcastToRoom(roomCode, {
            type: 'gameMessage',
            data: {
                type: 'deckChange',
                data: {
                    deckId: roomState.gameState.deckId,
                    deckData: roomState.gameState.deckData,
                    originalDeckSize: roomState.gameState.originalDeckSize
                }
            },
            timestamp: Date.now(),
            sentBy: playerId
        });
    }
    
    // Helper to find connection for a player
    findPlayerConnection(playerId, roomCode) {
        for (const [ws, connInfo] of this.connections.entries()) {
            if (connInfo.playerId === playerId && connInfo.roomCode === roomCode) {
                return ws;
            }
        }
        return null;
    }
    
    broadcastToRoom(roomCode, message, excludeWs = null) {
        const roomState = this.rooms.get(roomCode);
        if (roomState && roomState.connections) {
            roomState.connections.forEach(ws => {
                if (ws !== excludeWs && ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify(message));
                }
            });
        }
    }

    removeFromRoom(ws, roomCode) {
        const connInfo = this.connections.get(ws);
        if (!connInfo) return;
        
        const roomState = this.rooms.get(roomCode);
        if (roomState) {
            roomState.connections.delete(ws);
            
            // Remove player if we have their ID
            if (connInfo.playerId) {
                roomState.players.delete(connInfo.playerId);
                
                // Notify other players
                this.broadcastToRoom(roomCode, {
                    type: 'gameMessage',
                    data: {
                        type: 'playerLeft',
                        data: { playerId: connInfo.playerId }
                    },
                    timestamp: Date.now()
                });
            }
            
            // Clean up empty rooms after timeout (handled by cleanup timer)
        }
        this.connections.delete(ws);
    }
    
    // ========== Room Cleanup ==========
    
    checkInactiveRooms() {
        const INACTIVE_THRESHOLD = 20 * 60 * 1000; // 20 minutes
        const now = Date.now();
        
        for (const [roomCode, roomState] of this.rooms.entries()) {
            const inactiveTime = now - roomState.lastActivity;
            
            if (inactiveTime > INACTIVE_THRESHOLD && roomState.connections.size === 0) {
                console.log(`🧹 Cleaning up inactive room: ${roomCode}`);
                this.rooms.delete(roomCode);
                this.metrics.roomsDeleted++;
            }
        }
    }
    
    getMetrics() {
        const uptime = Date.now() - this.metrics.startTime;
        return {
            ...this.metrics,
            uptime: uptime,
            uptimeMinutes: Math.floor(uptime / 60000),
            activeRooms: this.rooms.size,
            activeConnections: this.connections.size,
            avgMessagesPerMinute: this.metrics.messagesProcessed / (uptime / 60000) || 0
        };
    }
    
    startCleanupTimer() {
        // Run cleanup check every 5 minutes
        setInterval(() => {
            this.checkInactiveRooms();
        }, 5 * 60 * 1000);
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
