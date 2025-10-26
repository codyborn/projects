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
        this.playerAliases = new Map(); // playerId -> playerAlias mapping
        this.playerId = this.generatePlayerId();
        this.playerAlias = this.generatePlayerAlias();
        this.connectionStatus = 'offline';
        
        // Track deck broadcasting for new player synchronization
        this.iLastBroadcastDeck = false; // whether this player last broadcast a deck change
        this.testMode = false;
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
        // Generate a unique ID for each browser session
        // Don't use localStorage to avoid conflicts between multiple browser tabs
        const newId = 'player_' + Math.random().toString(36).substr(2, 9);
        return newId;
    }
    
    generatePlayerAlias() {
        // Try to load from localStorage first
        const storedAlias = localStorage.getItem('playerAlias');
        if (storedAlias) {
            return storedAlias;
        }
        
        // Generate a new random name if none exists
        return this.generateRandomPlayerName();
    }
    
    generateRandomPlayerName() {
        const adjectives = [
            'sneaky', 'clever', 'swift', 'brave', 'wise', 'bold', 'quick', 'sharp',
            'bright', 'calm', 'delicious', 'daring', 'eager', 'fierce', 'grumpy', 'happy',
            'jolly', 'kind', 'lively', 'merry', 'noble', 'proud', 'quiet', 'radiant',
            'silly', 'tough', 'vivid', 'witty', 'zesty', 'spicy', 'brilliant', 'charming'
        ];
        
        const nouns = [
            'panda', 'tiger', 'eagle', 'wolf', 'fox', 'bear', 'lion', 'dragon',
            'pnut', 'raven', 'falcon', 'shark', 'dolphin', 'whale', 'turtle', 'owl',
            'cat', 'dog', 'horse', 'deer', 'rabbit', 'squirrel', 'mouse', 'hamster',
            'penguin', 'seal', 'otter', 'moose', 'badger', 'lynx', 'cheetah', 'leopard'
        ];
        
        const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        
        return `${adjective}_${noun}`;
    }
    
    setPlayerAlias(newAlias) {
        this.playerAlias = newAlias;
        localStorage.setItem('playerAlias', newAlias);
        
        // Update our alias in the player list and broadcast it
        if (this.connectionStatus === 'connected') {
            this.broadcastPlayerList();
        }
        
        // Update the "You" field color immediately
        if (this.game && typeof this.game.updatePrivateHandDisplay === 'function') {
            this.game.updatePrivateHandDisplay();
        }
    }
    
    getPlayerDisplayName(playerId) {
        // Return the alias if we have it, otherwise return the ID
        if (playerId === this.playerId) {
            return this.playerAlias;
        }
        return this.playerAliases.get(playerId) || playerId;
    }
    
    broadcastPlayerList() {
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
        
        // Broadcast via gameMessage
        this.sendMessage({
            type: 'playerList',
            players: playerList
        });
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
        // Disconnect from existing room first
        this.disconnect();
        
        this.roomCode = this.generateRoomCode();
        this.isHost = true;
        this.iLastBroadcastDeck = true;
        this.updateConnectionStatus('connecting');
        
        // Show room info
        this.showRoomInfo();
        
        // Connect to WebSocket server
        this.connectToWebSocketServer();
    }
    
    joinRoom() {
        const roomCodeInput = document.getElementById('room-code-input');
        const code = roomCodeInput.value.trim().toUpperCase();
        
        // Disconnect from existing room first
        this.disconnect();
        
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
                roomCode: this.roomCode,
                playerId: this.playerId,
                playerAlias: this.playerAlias
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
                // Start state validation
                this.startStateValidation();
                // Request full state synchronization from host
                if (!this.isHost) {
                    this.sendMessage({
                        type: 'requestFullState'
                    });
                }
                // Add ourselves to the player list and broadcast it
                this.broadcastPlayerList();
                break;
                
            case 'playerJoined':
                console.log('Player joined the room:', message.playerId);
                this.connectedPlayers.add(message.playerId);
                this.updatePlayerCount();
                
                // If we're the host, send our deck data and board state to the new player
                if (this.isHost) {
                    this.syncNewPlayer(message.playerId);
                }
                
                // Broadcast updated player list to all players
                this.broadcastPlayerList();
                
                // Automatically broadcast current deck to all players when someone joins
                this.broadcastCurrentDeckToAll();
                break;
                
            case 'playerLeft':
                console.log('Player left the room:', message.playerId);
                this.connectedPlayers.delete(message.playerId);
                this.updatePlayerCount();
                break;
                
            case 'gameMessage':
                try {
                    this.handleIncomingMessage(message.data);
                } catch (error) {
                    console.error('❌ Error in handleIncomingMessage:', error);
                }
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
        
        switch (message.type) {
            case 'cardState':
                this.handleCardState(message.data, message.playerId);
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
            case 'playerList':
                this.handlePlayerList(message);
                break;
        }
    }
    
    // New cardState handler - handles complete card state synchronization
    handleCardState(data, playerId = null) {
        const { uniqueId, card, position, isFlipped, zIndex, privateTo, status } = data;
        
        // Handle card removal (discarded)
        if (status === 'discarded') {
            // Find the card element by uniqueId
            const cardElement = document.querySelector(`[data-unique-id="${uniqueId}"]`);
            if (cardElement) {
                // Clean up any active tooltip before removing the card
                if (cardElement._cleanupTooltip) {
                    cardElement._cleanupTooltip();
                }
                
                // Remove the card from the DOM
                cardElement.remove();
                
                // Update private hand display in case this affects card counts
                if (this.game && typeof this.game.updatePrivateHandDisplay === 'function') {
                    this.game.updatePrivateHandDisplay();
                }
                
                // Show shuffle feedback to indicate a card was shuffled back to deck
                if (this.game && typeof this.game.showShuffleFeedback === 'function') {
                    this.game.showShuffleFeedback();
                }
            }
            return; // Exit early for removal
        }
        
        // Find existing card by uniqueId (not instanceId)
        let cardElement = document.querySelector(`[data-unique-id="${uniqueId}"]`);
        
        if (!cardElement) {
            // Card doesn't exist, create it
            cardElement = this.game.createCardElement(this.game.deck, card);
            if (!cardElement) {
                console.error('Failed to create card element for card:', card);
                return;
            }
            // Set both uniqueId and instanceId for consistency
            cardElement.dataset.uniqueId = uniqueId;
            cardElement.dataset.instanceId = card.instanceId;
            document.getElementById('card-table').appendChild(cardElement);
            this.game.addCardInteractions(cardElement, card);
        }
        
        
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
        
        // Get player alias for highlighting
        const playerAlias = playerId ? this.playerAliases.get(playerId) : null;
        
        // Highlight the card to show it has moved or been placed
        if (this.game && typeof this.game.highlightCard === 'function') {
            this.game.highlightCard(cardElement, playerAlias);
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
        
        // Update deck count display
        if (this.game && this.game.renderDeck) {
            this.game.renderDeck();
        }
        
        // Log successful card state update
        console.log('Card state updated successfully:', {
            uniqueId,
            position: cardElement.style.left + ', ' + cardElement.style.top,
            isFlipped: cardElement.classList.contains('flipped')
        });
    }
    
    
    handleResetGame() {
        if (this.game && typeof this.game.resetGame === 'function') {
            this.game.resetGame(false);
        }
    }
    
    handlePlayerJoin(data) {
        this.connectedPlayers.add(data.playerId);
        this.updatePlayerCount();
    }
    
    handlePlayerList(data) {
        // Ensure data exists
        if (!data) {
            console.error('handlePlayerList called with undefined data');
            return;
        }
        
        // Update our connected players set with the full list
        this.connectedPlayers.clear();
        this.connectedPlayers.add(this.playerId); // Always include ourselves
        
        // Ensure data.players exists and is an array
        if (!data.players || !Array.isArray(data.players)) {
            console.error('Invalid player list data:', data);
            return;
        }
        
        data.players.forEach(playerData => {
            const playerId = playerData.playerId;
            const playerAlias = playerData.playerAlias;
            if (playerId && playerId !== this.playerId) {
                this.connectedPlayers.add(playerId);
                if (playerAlias && playerAlias !== playerId) {
                    this.playerAliases.set(playerId, playerAlias);
                }
            }
        });
        this.updatePlayerCount();
        // Update private hand display with all players
        if (this.game && typeof this.game.updatePrivateHandDisplay === 'function') {
            this.game.updatePrivateHandDisplay();
        }
    }
    
    
    handleDeckChange(data) {
        const { deckId, deckData } = data;
        console.log('Handling deck change:', { deckId, deckData });
        
        // Clear the local flag since we received a deck change from another player
        this.iLastBroadcastDeck = false;
        
        // Clear the board first
        if (this.game && typeof this.game.clearBoard === 'function') {
            this.game.clearBoard();
        }
        
        // Load the deck as a remote deck (prevents id duplicates) and use it as the active deck
        if (this.game && typeof this.game.loadRemoteDeck === 'function') {
            this.game.loadRemoteDeck(deckData);
        }
        
        // Show notification that we're using a remote deck
        this.showRemoteDeckNotification(deckData.name);
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
    
    
    // New cardState broadcast method - sends complete card state
    broadcastCardState(cardElement, card, privateTo = null, status = null) {
        // Update timestamp for state tracking
        this.lastStateTimestamp = Date.now();
        
        // Use the unique ID from the DOM element, not the card object
        const uniqueId = cardElement.dataset.uniqueId || card.uniqueId;
        
        const cardState = {
            uniqueId: uniqueId,
            card: {
                title: card.title,
                emoji: card.emoji,
                color: card.color,
                description: card.description,
                image: card.image,
                imageSize: card.imageSize,
                instanceId: card.instanceId,
                uniqueId: card.uniqueId
            },
            position: {
                x: parseInt(cardElement.style.left) || 0,
                y: parseInt(cardElement.style.top) || 0
            },
            isFlipped: cardElement.classList.contains('flipped'),
            privateTo: privateTo,
            zIndex: parseInt(cardElement.style.zIndex) || 0,
            status: status,
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
        // Track that this player last broadcast deck change
        this.iLastBroadcastDeck = true;
        
        this.sendMessage({
            type: 'deckChange',
            data: { deckId, deckData }
        });
    }
    
    // Broadcast current deck to all players when someone joins
    broadcastCurrentDeckToAll() {
        // Only broadcast if this player was the last to broadcast a deck change
        if (this.iLastBroadcastDeck && this.game && this.game.deck && this.game.currentDeckId) {
            console.log('Broadcasting current deck (I was the last broadcaster) to all players');
            const deckData = this.game.deck.exportToJSON();
            this.sendMessage({
                type: 'deckChange',
                data: {
                    deckId: this.game.currentDeckId,
                    deckData: deckData
                }
            });
        } else {
            console.log('Not broadcasting deck - someone else was the last broadcaster, they will handle it');
        }
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
        // Disabled to simplify card state handling
        // Periodic sync can cause issues with card deduplication
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
        // Disabled to simplify card state handling
        // State validation can cause feedback loops and card deletion issues
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
                console.log('State correction criteria met:', {
                    timestamp: timestamp,
                    myTimestamp: myState.timestamp,
                    cardCount: cardCount,
                    myCardCount: myState.cardCount,
                    shouldCorrect: timestamp >= myState.timestamp || (cardCount > 0 && myState.cardCount === 0)
                });
                this.sendMessage({
                    type: 'requestStateCorrection',
                    data: { fromPlayerId: playerId }
                });
            } else {
                console.log('State correction not requested - criteria not met:', {
                    timestamp: timestamp,
                    myTimestamp: myState.timestamp,
                    cardCount: cardCount,
                    myCardCount: myState.cardCount
                });
            }
        }
    }
    
    handleStateCorrectionRequest(data) {
        const { fromPlayerId } = data;
        
        console.log('Received state correction request from:', fromPlayerId);
        console.log('Sending full state correction to player:', fromPlayerId);
        this.broadcastAllCardStates();
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
        // Also update the private hand display to show all players
        if (this.game) {
            this.game.updatePrivateHandDisplay();
        }
    }
    
    // Sync new player with host's deck and board state
    syncNewPlayer(playerId) {
        console.log('Syncing new player with host state:', playerId);
        
        // Send deck data
        if (this.game && this.game.deck) {
            this.sendMessage({
                type: 'deckChange',
                data: {
                    deckId: this.game.currentDeckId,
                    deckData: this.game.deck.exportToJSON()
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

