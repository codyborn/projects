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
        this.testMode = false;
        this.roomCreationAttempted = false;
        
        this.setupEventListeners();
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
                break;
                
            case 'roomJoined':
                console.log('Joined room successfully');
                this.connectedPlayers.add(this.playerId);
                this.updatePlayerCount();
                this.updateConnectionStatus('connected');
                break;
                
            case 'playerJoined':
                console.log('Player joined the room:', message.playerId);
                this.connectedPlayers.add(message.playerId);
                this.updatePlayerCount();
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
        
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            const messageData = {
                ...message,
                playerId: this.playerId,
                timestamp: Date.now(),
                roomCode: this.roomCode
            };
            
            this.socket.send(JSON.stringify({
                type: 'gameMessage',
                data: messageData
            }));
        } else {
            console.error('WebSocket not connected, cannot send message');
        }
    }
    
    handleIncomingMessage(message) {
        // Don't process our own messages
        if (message.playerId === this.playerId) {
            return;
        }
        
        console.log('Received message:', message);
        
        switch (message.type) {
            case 'cardMove':
                this.handleCardMove(message.data);
                break;
            case 'cardFlip':
                this.handleCardFlip(message.data);
                break;
            case 'cardShuffle':
                this.handleCardShuffle(message.data);
                break;
            case 'deckShuffle':
                this.handleDeckShuffle();
                break;
            case 'cardDeal':
                this.handleCardDeal(message.data);
                break;
            case 'resetGame':
                this.handleResetGame();
                break;
            case 'playerJoin':
                this.handlePlayerJoin(message.data);
                break;
            case 'privateHandUpdate':
                this.handlePrivateHandUpdate(message.data);
                break;
            case 'cardVisibility':
                this.handleCardVisibility(message.data);
                break;
        }
    }
    
    // Game state synchronization handlers (same as WebRTC version)
    handleCardMove(data) {
        const { cardId, x, y } = data;
        console.log('Handling card move:', { cardId, x, y });
        const cardElement = document.querySelector(`[data-card-id="${cardId}"]`);
        if (cardElement) {
            console.log('Moving card element:', cardElement);
            cardElement.style.left = x + 'px';
            cardElement.style.top = y + 'px';
            cardElement.style.zIndex = ++this.game.zIndexCounter;
        } else {
            console.log('Card element not found for ID:', cardId);
        }
    }
    
    handleCardFlip(data) {
        const { cardId } = data;
        const cardElement = document.querySelector(`[data-card-id="${cardId}"]`);
        if (cardElement) {
            cardElement.classList.toggle('flipped');
            cardElement.style.zIndex = ++this.game.zIndexCounter;
        }
    }
    
    handleCardShuffle(data) {
        const { cardId, card, deckState } = data;
        const cardElement = document.querySelector(`[data-card-id="${cardId}"]`);
        if (cardElement) {
            cardElement.remove();
            
            if (deckState) {
                this.game.deck.cards = [...deckState.cards];
            } else if (card) {
                this.game.deck.addCard(card);
                this.game.deck.shuffle();
            }
            
            this.game.renderDeck();
        }
    }
    
    handleDeckShuffle() {
        this.game.deck.shuffle();
        this.game.renderDeck();
    }
    
    handleCardDeal(data) {
        const { cardId, card, x, y, deckState } = data;
        
        console.log('handleCardDeal received data:', { cardId, card, x, y, deckState });
        
        if (deckState) {
            this.game.deck.cards = [...deckState];
            this.game.renderDeck();
        }
        
        this.game.dealtCards.push(card);
        
        const cardElement = this.game.createCardElement(this.game.deck, card);
        if (!cardElement) {
            console.error('Failed to create card element for card:', card);
            return;
        }
        cardElement.dataset.cardId = cardId;
        
        cardElement.style.left = x + 'px';
        cardElement.style.top = y + 'px';
        
        document.getElementById('card-table').appendChild(cardElement);
        this.game.addCardInteractions(cardElement, card);
    }
    
    handleResetGame() {
        this.game.resetGame(false);
    }
    
    handlePlayerJoin(data) {
        this.connectedPlayers.add(data.playerId);
        this.updatePlayerCount();
    }
    
    handlePrivateHandUpdate(data) {
        const { playerId, count } = data;
        console.log('Handling private hand update:', { playerId, count, currentPlayerId: this.playerId });
        this.game.updateOtherPlayerPrivateHand(playerId, count);
    }
    
    handleCardVisibility(data) {
        const { cardId, isVisible } = data;
        console.log('Handling card visibility:', { cardId, isVisible });
        const cardElement = document.querySelector(`[data-card-id="${cardId}"]`);
        if (cardElement) {
            if (isVisible) {
                cardElement.style.display = 'block';
                cardElement.style.visibility = 'visible';
            } else {
                cardElement.style.display = 'none';
                cardElement.style.visibility = 'hidden';
            }
        }
    }
    
    // Public methods for game integration (same as WebRTC version)
    broadcastCardMove(cardId, x, y) {
        this.sendMessage({
            type: 'cardMove',
            data: { cardId, x, y }
        });
    }
    
    broadcastCardFlip(cardId) {
        this.sendMessage({
            type: 'cardFlip',
            data: { cardId }
        });
    }
    
    broadcastCardShuffle(cardId, card = null, deckState = null) {
        this.sendMessage({
            type: 'cardShuffle',
            data: { cardId, card, deckState }
        });
    }
    
    broadcastDeckShuffle() {
        this.sendMessage({
            type: 'deckShuffle',
            data: {}
        });
    }
    
    broadcastCardDeal(cardId, card, x, y, deckState) {
        this.sendMessage({
            type: 'cardDeal',
            data: { cardId, card, x, y, deckState }
        });
    }
    
    broadcastResetGame() {
        this.sendMessage({
            type: 'resetGame',
            data: {}
        });
    }
    
    broadcastPrivateHandUpdate(playerId, count) {
        this.sendMessage({
            type: 'privateHandUpdate',
            data: { playerId, count }
        });
    }
    
    broadcastCardVisibility(cardId, isVisible) {
        this.sendMessage({
            type: 'cardVisibility',
            data: { cardId, isVisible }
        });
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
    
    // Cleanup method
    disconnect() {
        if (this.socket) {
            this.socket.close();
        }
        this.updateConnectionStatus('offline');
        this.connectedPlayers.clear();
        this.updatePlayerCount();
    }
}

