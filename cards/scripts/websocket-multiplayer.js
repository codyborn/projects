/**
 * WebSocket Multiplayer Module for Cards Game
 * Handles room creation, joining, and real-time synchronization via WebSocket
 */

class WebSocketMultiplayerManager {
    constructor(gameInstance) {
        this.game = gameInstance;
        this.socket = null;
        this.roomCode = null;
        this.isHost = false;
        this.connectedPlayers = new Set();
        this.playerId = this.generatePlayerId();
        this.connectionStatus = 'offline';
        this.testMode = true;
        this.roomCreationAttempted = false;
        
        // Message queuing system (retry logic removed)
        this.messageQueue = [];
        this.messageIdCounter = 0;
        
        // Message deduplication removed - state validation handles synchronization
        
        // Connection health monitoring
        this.healthCheckInterval = null;
        this.lastMessageTime = 0;
        this.connectionTimeout = 30000; // 30 seconds
        
        // Periodic synchronization
        this.syncInterval = null;
        
        // State validation system
        this.lastStateHash = null;
        this.lastStateTimestamp = 0;
        this.stateValidationInterval = null;
        
        this.setupEventListeners();
        
        // Expose manual cleanup for debugging
        window.cleanupCards = () => this.manualCleanup();
        window.validateState = () => this.validateAndCorrectState();
    }
    
    generatePlayerId() {
        return 'player_' + Math.random().toString(36).substr(2, 9);
    }
    
    enableTestMode() {
        this.testMode = true;
        console.log('Test mode enabled - will auto-connect to room "TEST1"');
    }
    
    autoConnectTestRoom() {
        console.log('Auto-connecting to test room "TEST1"');
        document.getElementById('room-code-input').value = 'TEST1';
        this.joinRoom();
    }
    
    generateRoomCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
    
    setupEventListeners() {
        // Room creation and joining
        document.getElementById('create-room-btn').addEventListener('click', () => {
            this.createRoom();
        });
        
        document.getElementById('join-room-btn').addEventListener('click', () => {
            this.joinRoom();
        });
        
        document.getElementById('copy-room-code').addEventListener('click', () => {
            this.copyRoomCode();
        });
        
        // Handle Enter key in room code input
        document.getElementById('room-code-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.joinRoom();
            }
        });
        
        // Handle input changes to enable/disable join button
        document.getElementById('room-code-input').addEventListener('input', (e) => {
            const joinBtn = document.getElementById('join-room-btn');
            const hasContent = e.target.value.trim().length > 0;
            joinBtn.disabled = !hasContent;
        });
        
        // Auto-connect in test mode
        if (this.testMode) {
            setTimeout(() => {
                this.autoConnectTestRoom();
            }, 100);
        }
    }
    
    updateConnectionStatus(status) {
        this.connectionStatus = status;
        const statusElement = document.getElementById('menu-connection-status');
        const indicator = statusElement.querySelector('.status-indicator');
        const text = statusElement.querySelector('.status-text');
        
        indicator.className = `status-indicator ${status}`;
        
        switch (status) {
            case 'offline':
                text.textContent = 'Offline';
                break;
            case 'connecting':
                text.textContent = 'Connecting...';
                break;
            case 'connected':
                text.textContent = 'Connected';
                break;
        }
    }
    
    createRoom() {
        this.roomCode = this.generateRoomCode();
        this.isHost = true;
        this.updateConnectionStatus('connecting');
        
        // Show room info
        this.showRoomInfo();
        
        // Connect to WebSocket server
        this.connectToWebSocketServer();
    }
    
    joinRoom() {
        const roomCodeInput = document.getElementById('room-code-input');
        const code = roomCodeInput.value.trim().toUpperCase();
        
        // Special handling for test mode
        if (this.testMode && code === 'TEST1') {
            this.roomCode = code;
            this.isHost = true; // Try to be host first
            this.updateConnectionStatus('connecting');
            this.connectToWebSocketServer();
            return;
        }
        
        if (!code || code.length !== 6) {
            alert('Please enter a valid 6-character room code');
            return;
        }
        
        this.roomCode = code;
        this.isHost = false;
        this.updateConnectionStatus('connecting');
        
        // Connect to WebSocket server
        this.connectToWebSocketServer();
    }
    
    connectToWebSocketServer() {
        console.log('Connecting to WebSocket server');
        
        // Determine WebSocket server URL
        // For development, you can use the local PartyKit dev server
        // For production, you'll need to deploy the durable-game-worker and use that URL
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        let host = 'cards-websocket-server-02b8944e7896.herokuapp.com';

        
        const wsUrl = `${protocol}//${host}/chat/${this.roomCode}`;
        
        console.log('Connecting to:', wsUrl);
        
        try {
            this.socket = new WebSocket(wsUrl);
            
            this.socket.onopen = () => {
                console.log('Connected to WebSocket server');
                this.updateConnectionStatus('connected');
                this.lastMessageTime = Date.now();
                this.startHealthCheck();
                this.handleWebSocketConnected();
            };
            
            this.socket.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    this.handleWebSocketMessage(message);
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };
            
            this.socket.onclose = () => {
                console.log('Disconnected from WebSocket server');
                this.updateConnectionStatus('offline');
            };
            
            this.socket.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.updateConnectionStatus('offline');
            };
            
            // Add timeout for connection
            setTimeout(() => {
                if (this.socket && this.socket.readyState === WebSocket.CONNECTING) {
                    console.log('WebSocket connection timeout after 5 seconds');
                    this.socket.close();
                    this.updateConnectionStatus('offline');
                }
            }, 5000);
            
        } catch (error) {
            console.error('Failed to connect to WebSocket server:', error);
            this.updateConnectionStatus('offline');
        }
    }
    
    handleWebSocketConnected() {
        console.log('WebSocket server connected, creating room or joining...');
        console.log('Room code:', this.roomCode, 'Is host:', this.isHost);
        
        if (this.roomCreationAttempted) {
            console.log('Room creation already attempted, skipping');
            return;
        }
        
        this.roomCreationAttempted = true;
        
        if (this.isHost) {
            // Host creates room
            console.log('Attempting to create room:', this.roomCode);
            this.socket.send(JSON.stringify({
                type: 'createRoom',
                roomCode: this.roomCode
            }));
        } else {
            // Client joins room
            console.log('Attempting to join room:', this.roomCode);
            this.socket.send(JSON.stringify({
                type: 'joinRoom',
                roomCode: this.roomCode
            }));
        }
    }
    
    handleWebSocketMessage(message) {
        console.log('WebSocket message:', message.type);
        
        switch (message.type) {
            case 'roomCreated':
                console.log('Room created successfully');
                this.connectedPlayers.add(this.playerId);
                this.updatePlayerCount();
                this.updateConnectionStatus('connected');
                // Start periodic sync for host
                this.startPeriodicSync();
                // Start state validation
                this.startStateValidation();
                break;
                
            case 'roomJoined':
                console.log('Joined room successfully');
                this.connectedPlayers.add(this.playerId);
                this.updatePlayerCount();
                this.updateConnectionStatus('connected');
                // Clean up any existing duplicate cards
                this.cleanupDuplicateCards();
                // Start state validation
                this.startStateValidation();
                // Request full state synchronization from host
                if (!this.isHost) {
                    this.sendMessage({
                        type: 'requestFullState'
                    });
                }
                break;
                
            case 'playerJoined':
                console.log('Player joined the room:', message.playerId);
                this.connectedPlayers.add(message.playerId);
                this.updatePlayerCount();
                
                // If we're the host, send our deck data and board state to the new player
                if (this.isHost) {
                    this.syncNewPlayer(message.playerId);
                }
                break;
                
            case 'playerLeft':
                console.log('Player left the room:', message.playerId);
                this.connectedPlayers.delete(message.playerId);
                this.updatePlayerCount();
                break;
                
            case 'gameMessage':
                this.handleIncomingMessage(message.data);
                break;
                
            case 'error':
                console.error('WebSocket error:', message.message);
                alert('Error: ' + message.message);
                this.updateConnectionStatus('offline');
                break;
        }
    }
    
    sendMessage(message) {
        console.log('Sending message:', message);
        
        // Add unique message ID and acknowledgment requirement
        const messageId = ++this.messageIdCounter;
        const messageData = {
            ...message,
            playerId: this.playerId,
            timestamp: Date.now(),
            roomCode: this.roomCode,
            messageId: messageId,
            requiresAck: true
        };
        
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            // If targetPlayerId is specified, this is a targeted message
            if (message.targetPlayerId) {
                this.socket.send(JSON.stringify({
                    type: 'targetedMessage',
                    data: messageData,
                    targetPlayerId: message.targetPlayerId
                }));
            } else {
                this.socket.send(JSON.stringify({
                    type: 'gameMessage',
                    data: messageData
                }));
            }
        } else {
            console.error('WebSocket not connected, queuing message');
            this.messageQueue.push(messageData);
        }
    }
    
    handleIncomingMessage(message) {
        // Update last message time for health check
        this.lastMessageTime = Date.now();
        
        // Message acknowledgment handling removed - no longer needed without retry system
        
        // Message deduplication removed - state validation handles synchronization
        
        // Message acknowledgment removed - no longer needed without retry system
        
        // Don't process our own messages
        if (message.playerId === this.playerId) {
            return;
        }
        
        // Message processing tracking removed - state validation handles synchronization
        
        console.log('Received message:', message);
        
        switch (message.type) {
            case 'cardState':
                this.handleCardState(message.data);
                break;
            case 'resetGame':
                this.handleResetGame();
                break;
            case 'playerJoin':
                this.handlePlayerJoin(message.data);
                break;
            case 'deckChange':
                this.handleDeckChange(message.data);
                break;
            case 'requestFullState':
                // Host responds with full state
                if (this.isHost) {
                    this.broadcastAllCardStates();
                }
                break;
            case 'stateValidation':
                this.handleStateValidation(message.data);
                break;
            case 'requestStateCorrection':
                this.handleStateCorrectionRequest(message.data);
                break;
                
            case 'syncDeckData':
                this.handleSyncDeckData(message.data);
                break;
        }
    }
    
    // New cardState handler - handles complete card state synchronization
    handleCardState(data) {
        const { uniqueId, card, position, isFlipped, zIndex, privateTo } = data;
        console.log('Handling card state:', { uniqueId, position, isFlipped, privateTo });
        
        // First, check if we already have a card with this instanceId
        const instanceId = card.instanceId;
        let cardElement = document.querySelector(`[data-instance-id="${instanceId}"]`);
        
        if (cardElement) {
            console.log('Found existing card by instanceId:', instanceId);
        } else {
            // Check for duplicate cards with the same uniqueId and remove stale ones
            const duplicateCards = document.querySelectorAll(`[data-unique-id="${uniqueId}"]`);
            if (duplicateCards.length > 1) {
                console.warn(`Found ${duplicateCards.length} cards with same uniqueId: ${uniqueId}, removing stale ones`);
                // Keep the first one, remove the rest
                for (let i = 1; i < duplicateCards.length; i++) {
                    console.log('Removing stale card:', duplicateCards[i]);
                    duplicateCards[i].remove();
                }
                cardElement = duplicateCards[0]; // Use the first (oldest) card
            } else if (duplicateCards.length === 1) {
                cardElement = duplicateCards[0];
            }
        }
        
        if (!cardElement) {
            // Check if there are any cards with the same instanceId that might be duplicates
            const existingCards = document.querySelectorAll('.card');
            let duplicateCard = null;
            
            for (let existingCard of existingCards) {
                if (existingCard.dataset.instanceId === instanceId) {
                    console.warn('Found card with same instanceId, removing old one:', existingCard.dataset.instanceId);
                    duplicateCard.remove();
                    break;
                }
            }
            
            // Card doesn't exist, create it
            console.log('Creating new card element for instanceId:', instanceId);
            cardElement = this.game.createCardElement(this.game.deck, card);
            if (!cardElement) {
                console.error('Failed to create card element for card:', card);
                return;
            }
            // Set both uniqueId and instanceId for consistency
            cardElement.dataset.uniqueId = uniqueId;
            cardElement.dataset.instanceId = instanceId;
            document.getElementById('card-table').appendChild(cardElement);
            this.game.addCardInteractions(cardElement, card);
        }
        
        // Mark this card as being updated from remote to prevent broadcast loops
        cardElement.dataset.remoteUpdate = 'true';
        
        // Set privateTo and location dataset attributes
        if (privateTo !== undefined && privateTo !== null) {
            cardElement.dataset.privateTo = privateTo;
        } else {
            delete cardElement.dataset.privateTo;
        }
        
        // Update card state
        if (position) {
            cardElement.style.left = position.x + 'px';
            cardElement.style.top = position.y + 'px';
        }
        
        if (zIndex !== undefined) {
            cardElement.style.zIndex = zIndex;
        }
        
        // Update flipped state
        if (isFlipped !== undefined) {
            if (isFlipped) {
                cardElement.classList.add('flipped');
            } else {
                cardElement.classList.remove('flipped');
            }
        }
        
        // Update visibility based on privateTo field
        if (privateTo !== undefined && privateTo !== null && privateTo !== 'null') {
            // If privateTo is set, only show to that player
            if (privateTo === this.playerId) {
                cardElement.style.display = 'block';
                cardElement.style.visibility = 'visible';
            } else {
                cardElement.style.display = 'none';
                cardElement.style.visibility = 'hidden';
            }
        } else {
            // Default: show to all players (non-private cards)
            cardElement.style.display = 'block';
            cardElement.style.visibility = 'visible';
        }
        
        
        // Clear the remote update flag after a short delay to allow for user interactions
        setTimeout(() => {
            if (cardElement && cardElement.parentNode) {
                cardElement.dataset.remoteUpdate = 'false';
            }
        }, 100);
        
        // Update private hand display after card state changes
        if (this.game && this.game.updatePrivateHandDisplay) {
            this.game.updatePrivateHandDisplay();
        }
        
        // Log successful card state update
        console.log('Card state updated successfully:', {
            uniqueId,
            position: cardElement.style.left + ', ' + cardElement.style.top,
            isFlipped: cardElement.classList.contains('flipped')
        });
    }
    
    
    handleResetGame() {
        this.game.resetGame(false);
    }
    
    handlePlayerJoin(data) {
        this.connectedPlayers.add(data.playerId);
        this.updatePlayerCount();
    }
    
    
    handleDeckChange(data) {
        const { deckId, deckData } = data;
        console.log('Handling deck change:', { deckId, deckData });
        
        // Load the new deck without broadcasting (to avoid infinite loops)
        this.game.loadDeck(deckId, false);
    }
    
    // Helper method to compare card content
    cardsHaveSameContent(card1, card2) {
        return card1.title === card2.title &&
               card1.emoji === card2.emoji &&
               card1.color === card2.color &&
               card1.description === card2.description;
    }
    
    // Generate hash of current card state for validation
    generateStateHash() {
        const allCards = document.querySelectorAll('.card');
        const cardStates = [];
        
        allCards.forEach(card => {
            const state = {
                instanceId: card.dataset.instanceId,
                uniqueId: card.dataset.uniqueId,
                position: {
                    x: parseInt(card.style.left) || 0,
                    y: parseInt(card.style.top) || 0
                },
                isFlipped: card.classList.contains('flipped'),
                privateTo: card.dataset.privateTo || undefined,
                zIndex: parseInt(card.style.zIndex) || 0,
            };
            cardStates.push(state);
        });
        
        // Sort by instanceId for consistent hashing (primary identifier)
        cardStates.sort((a, b) => (a.instanceId || '').localeCompare(b.instanceId || ''));
        
        // Create hash from sorted state
        const stateString = JSON.stringify(cardStates);
        let hash = 0;
        for (let i = 0; i < stateString.length; i++) {
            const char = stateString.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        
        return Math.abs(hash).toString(36);
    }
    
    // Get current state with timestamp
    getCurrentState() {
        return {
            hash: this.generateStateHash(),
            timestamp: Date.now(),
            playerId: this.playerId,
            cardCount: document.querySelectorAll('.card').length
        };
    }
    
    // Generate unique ID based on card content with deterministic instance tracking
    generateCardUniqueId(card, instanceId = null) {
        const cardData = {
            title: card.title || '',
            emoji: card.emoji || '',
            color: card.color || '',
            description: card.description || '',
            image: card.image || ''
        };
        
        // Use encodeURIComponent to handle Unicode characters, then create a hash
        const jsonString = JSON.stringify(cardData);
        const encoded = encodeURIComponent(jsonString);
        
        // Create a simple hash from the encoded string
        let hash = 0;
        for (let i = 0; i < encoded.length; i++) {
            const char = encoded.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        
        // Create base ID from content hash
        const baseId = `card_${Math.abs(hash).toString(36)}`;
        
        // Use the card's deterministic instance ID if available, otherwise use provided instanceId
        const finalInstanceId = card.instanceId || instanceId || 'unknown';
        
        return `${baseId}_${finalInstanceId}`;
    }
    
    // New cardState broadcast method - sends complete card state
    broadcastCardState(cardElement, card, privateTo = null) {
        // Update timestamp for state tracking
        this.lastStateTimestamp = Date.now();
        
        const uniqueId = this.generateCardUniqueId(card);
        
        const cardState = {
            uniqueId: uniqueId,
            card: {
                title: card.title,
                emoji: card.emoji,
                color: card.color,
                description: card.description,
                image: card.image,
                imageSize: card.imageSize,
                instanceId: card.instanceId
            },
            position: {
                x: parseInt(cardElement.style.left) || 0,
                y: parseInt(cardElement.style.top) || 0
            },
            isFlipped: cardElement.classList.contains('flipped'),
            privateTo: privateTo,
            zIndex: parseInt(cardElement.style.zIndex) || 0,
            timestamp: this.lastStateTimestamp
        };
        
        this.sendMessage({
            type: 'cardState',
            data: cardState
        });
    }
    
    // Public methods for game integration
    broadcastResetGame() {
        this.sendMessage({
            type: 'resetGame',
            data: {}
        });
    }
    
    
    broadcastDeckChange(deckId, deckData) {
        this.sendMessage({
            type: 'deckChange',
            data: { deckId, deckData }
        });
    }
    
    // Broadcast all current card states for initial synchronization
    broadcastAllCardStates() {
        const cardElements = document.querySelectorAll('.card');
        console.log(`Broadcasting ${cardElements.length} card states for synchronization`);
        
        cardElements.forEach(cardElement => {
            const card = this.game.getCardFromElement(cardElement);
            const privateTo = cardElement.dataset.privateTo || null;
            this.broadcastCardState(cardElement, card, privateTo);
        });
    }
    
    // Periodic full state synchronization for resilience
    startPeriodicSync() {
        // if (this.syncInterval) return;
        
        // this.syncInterval = setInterval(() => {
        //     if (this.isHost && this.connectionStatus === 'connected') {
        //         console.log('Performing periodic full state sync');
        //         this.broadcastAllCardStates();
        //     }
            
        //     // Also perform periodic cleanup of duplicate cards
        //     this.cleanupDuplicateCards();
        // }, 3000); // Every 3 seconds
    }
    
    // Cleanup function to remove duplicate cards
    cleanupDuplicateCards() {
        const allCards = document.querySelectorAll('.card');
        const instanceIdCounts = new Map();
        
        // Count cards by instanceId (primary identifier)
        allCards.forEach(card => {
            const instanceId = card.dataset.instanceId;
            if (instanceId) {
                if (!instanceIdCounts.has(instanceId)) {
                    instanceIdCounts.set(instanceId, []);
                }
                instanceIdCounts.get(instanceId).push(card);
            }
        });
        
        // Remove duplicates, keeping the first (oldest) card
        instanceIdCounts.forEach((cards, instanceId) => {
            if (cards.length > 1) {
                console.warn(`Cleaning up ${cards.length - 1} duplicate cards for instanceId: ${instanceId}`);
                for (let i = 1; i < cards.length; i++) {
                    console.log('Removing duplicate card:', cards[i]);
                    cards[i].remove();
                }
            }
        });
    }
    
    stopPeriodicSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
    }
    
    // Manual cleanup function for debugging (can be called from console)
    manualCleanup() {
        console.log('Manual cleanup of duplicate cards...');
        this.cleanupDuplicateCards();
        console.log('Cleanup complete');
    }
    
    // State validation and correction system
    startStateValidation() {
        if (this.stateValidationInterval) return;
        
        this.stateValidationInterval = setInterval(() => {
            if (this.connectionStatus === 'connected') {
                this.validateAndCorrectState();
            }
        }, 3000); // Check every 3 seconds - reasonable frequency for state validation
    }
    
    stopStateValidation() {
        if (this.stateValidationInterval) {
            clearInterval(this.stateValidationInterval);
            this.stateValidationInterval = null;
        }
    }
    
    validateAndCorrectState() {
        const currentState = this.getCurrentState();
        console.log('Validating state:', currentState);
        
        // Broadcast current state for comparison
        this.sendMessage({
            type: 'stateValidation',
            data: currentState
        });
    }
    
    handleStateValidation(data) {
        const { hash, timestamp, playerId, cardCount } = data;
        
        // Don't process our own state
        if (playerId === this.playerId) return;
        
        const myState = this.getCurrentState();
        
        // Check if states are different
        if (hash !== myState.hash) {
            console.warn('State mismatch detected!', {
                myHash: myState.hash,
                theirHash: hash,
                myTimestamp: myState.timestamp,
                theirTimestamp: timestamp,
                myCardCount: myState.cardCount,
                theirCardCount: cardCount
            });
            
            // If their state is newer or equal (to handle simultaneous validation), request full state from them
            // Also request correction if they have cards and we don't (clear state difference)
            if (timestamp >= myState.timestamp || (cardCount > 0 && myState.cardCount === 0)) {
                console.log('Requesting state correction from player:', playerId);
                this.sendMessage({
                    type: 'requestStateCorrection',
                    data: { fromPlayerId: playerId }
                });
            }
        }
    }
    
    handleStateCorrectionRequest(data) {
        const { fromPlayerId } = data;
        
        // Only host responds to state correction requests
        if (!this.isHost) return;
        
        console.log('Sending full state correction to player:', fromPlayerId);
        this.broadcastAllCardStates();
    }
    
    handleSyncDeckData(data) {
        const { deckData, isRemote } = data;
        
        if (isRemote && this.game) {
            console.log('Received remote deck data from host:', deckData.name);
            
            // Load the remote deck
            this.game.loadRemoteDeck(deckData);
            
            // Show notification that we're using a remote deck
            this.showRemoteDeckNotification(deckData.name);
        }
    }
    
    showRemoteDeckNotification(deckName) {
        // Create a notification to show that we're using a remote deck
        const notification = document.createElement('div');
        notification.className = 'remote-deck-notification';
        notification.innerHTML = `
            <div style="background: #4CAF50; color: white; padding: 10px; margin: 10px; border-radius: 5px; text-align: center;">
                📡 Using remote deck: <strong>${deckName}</strong> (synced from host)
            </div>
        `;
        
        // Insert at the top of the game area
        const gameArea = document.querySelector('.game-area');
        if (gameArea) {
            gameArea.insertBefore(notification, gameArea.firstChild);
            
            // Auto-remove after 5 seconds
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 5000);
        }
    }
    
    showRoomInfo() {
        document.getElementById('room-code-display').textContent = this.roomCode;
        document.getElementById('room-info').style.display = 'block';
        document.querySelector('.room-controls').style.display = 'none';
    }
    
    copyRoomCode() {
        navigator.clipboard.writeText(this.roomCode).then(() => {
            const button = document.getElementById('copy-room-code');
            const originalText = button.textContent;
            button.textContent = 'Copied!';
            setTimeout(() => {
                button.textContent = originalText;
            }, 2000);
        });
    }
    
    updatePlayerCount() {
        document.getElementById('player-count').textContent = this.connectedPlayers.size;
    }
    
    // Sync new player with host's deck and board state
    syncNewPlayer(playerId) {
        console.log('Syncing new player with host state:', playerId);
        
        // Send deck data
        if (this.game && this.game.deck) {
            this.sendMessage({
                type: 'syncDeckData',
                data: {
                    deckData: this.game.deck.exportToJSON(),
                    isRemote: true
                },
                targetPlayerId: playerId
            });
        }
        
        // Send current board state
        this.broadcastAllCardStates();
    }
    
    // Message acknowledgment methods removed - no longer needed without retry system
    
    // Message acknowledgment handling removed - no longer needed without retry system
    
    // Retry mechanism removed - state validation handles synchronization
    
    startHealthCheck() {
        if (this.healthCheckInterval) return;
        
        this.healthCheckInterval = setInterval(() => {
            const now = Date.now();
            const timeSinceLastMessage = now - this.lastMessageTime;
            
            if (timeSinceLastMessage > this.connectionTimeout) {
                console.warn('Connection health check failed - no messages received recently');
                this.handleConnectionLoss();
            }
        }, 5000); // Check every 5 seconds
    }
    
    handleConnectionLoss() {
        console.log('Handling connection loss...');
        this.updateConnectionStatus('offline');
        
        // Attempt to reconnect
        if (this.roomCode) {
            console.log('Attempting to reconnect...');
            setTimeout(() => {
                this.connectToWebSocketServer();
            }, 2000);
        }
    }
    
    // Cleanup method
    disconnect() {
        if (this.socket) {
            this.socket.close();
        }
        if (this.retryInterval) {
            clearInterval(this.retryInterval);
            this.retryInterval = null;
        }
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
            this.healthCheckInterval = null;
        }
        this.stopPeriodicSync();
        this.stopStateValidation();
        this.messageQueue = [];
        this.updateConnectionStatus('offline');
        this.connectedPlayers.clear();
        this.updatePlayerCount();
    }
}

