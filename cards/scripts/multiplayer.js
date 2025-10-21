/**
 * Multiplayer WebRTC Module for Cards Game
 * Handles room creation, joining, and real-time synchronization
 */

class MultiplayerManager {
    constructor(gameInstance) {
        this.game = gameInstance;
        this.peerConnection = null;
        this.dataChannel = null;
        this.roomCode = null;
        this.isHost = false;
        this.connectedPlayers = new Set();
        this.playerId = this.generatePlayerId();
        this.connectionStatus = 'offline';
        this.signalingSocket = null;
        this.testMode = true; // Test flag for auto-connection
        
        // WebRTC configuration
        this.rtcConfig = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]
        };
        
        this.setupEventListeners();
        this.setupLocalStorageListener();
    }
    
    generatePlayerId() {
        return 'player_' + Math.random().toString(36).substr(2, 9);
    }
    
    enableTestMode() {
        this.testMode = true;
        console.log('Test mode enabled - will auto-connect to room "TEST"');
    }
    
    autoConnectTestRoom() {
        console.log('Auto-connecting to test room "TEST"');
        // Set the room code input to "TEST"
        document.getElementById('room-code-input').value = 'TEST';
        // Try to join the room
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
        
        // Auto-connect in test mode (with a small delay to ensure DOM is ready)
        if (this.testMode) {
            setTimeout(() => {
                this.autoConnectTestRoom();
            }, 100);
        }
    }
    
    setupLocalStorageListener() {
        // Poll localStorage for new messages from other instances
        this.messagePollingInterval = setInterval(() => {
            this.checkForNewMessages();
        }, 500); // Check every 500ms
    }
    
    checkForNewMessages() {
        // Get all localStorage keys that start with our message prefix
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('cardgame_message_')) {
                try {
                    const message = JSON.parse(localStorage.getItem(key));
                    console.log('Checking message:', { key, message, roomCode: this.roomCode, playerId: this.playerId });
                    // Only process messages for the current room and from other players
                    if (message.roomCode === this.roomCode && message.playerId !== this.playerId) {
                        console.log('Received cross-instance message:', message);
                        this.handleIncomingMessage(message);
                        // Remove the message after processing to avoid reprocessing
                        localStorage.removeItem(key);
                    }
                } catch (error) {
                    console.error('Error parsing cross-instance message:', error);
                    // Remove invalid messages
                    localStorage.removeItem(key);
                }
            }
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
        
        // Connect to signaling server
        this.connectToSignalingServer();
    }
    
    joinRoom() {
        const roomCodeInput = document.getElementById('room-code-input');
        const code = roomCodeInput.value.trim().toUpperCase();
        
        // Special handling for test mode
        if (this.testMode && code === 'TEST') {
            this.roomCode = code;
            this.isHost = false;
            this.updateConnectionStatus('connecting');
            this.connectToSignalingServer();
            return;
        }
        
        if (!code || code.length !== 6) {
            alert('Please enter a valid 6-character room code');
            return;
        }
        
        this.roomCode = code;
        this.isHost = false;
        this.updateConnectionStatus('connecting');
        
        // Connect to signaling server
        this.connectToSignalingServer();
    }
    
    createPeerConnection() {
        this.peerConnection = new RTCPeerConnection(this.rtcConfig);
        
        // Handle ICE candidates
        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                // In a real app, send this to the other peer via signaling server
                console.log('ICE candidate:', event.candidate);
            }
        };
        
        // Handle incoming data channel
        this.peerConnection.ondatachannel = (event) => {
            const channel = event.channel;
            this.setupDataChannel(channel);
        };
        
        // Handle connection state changes
        this.peerConnection.onconnectionstatechange = () => {
            console.log('Connection state:', this.peerConnection.connectionState);
            if (this.peerConnection.connectionState === 'connected') {
                this.updateConnectionStatus('connected');
                this.connectedPlayers.add(this.playerId);
                this.updatePlayerCount();
            } else if (this.peerConnection.connectionState === 'disconnected' || 
                      this.peerConnection.connectionState === 'failed') {
                this.updateConnectionStatus('offline');
                this.connectedPlayers.clear();
                this.updatePlayerCount();
            }
        };
        
        // Create data channel if we're the host
        if (this.isHost) {
            this.dataChannel = this.peerConnection.createDataChannel('gameData', {
                ordered: true
            });
            this.setupDataChannel(this.dataChannel);
        }
    }
    
    setupDataChannel(channel) {
        this.dataChannel = channel;
        
        channel.onopen = () => {
            console.log('Data channel opened');
            this.updateConnectionStatus('connected');
        };
        
        channel.onclose = () => {
            console.log('Data channel closed');
            this.updateConnectionStatus('offline');
        };
        
        channel.onmessage = (event) => {
            this.handleIncomingMessage(JSON.parse(event.data));
        };
    }
    
    sendMessage(message) {
        console.log('Broadcasting message:', message);
        
        // Store message in localStorage for cross-instance communication
        const messageData = {
            ...message,
            playerId: this.playerId,
            timestamp: Date.now(),
            roomCode: this.roomCode
        };
        
        // Store in localStorage with a unique key
        const messageKey = `cardgame_message_${Date.now()}_${Math.random()}`;
        localStorage.setItem(messageKey, JSON.stringify(messageData));
        
        // Also simulate local processing for immediate feedback
        setTimeout(() => {
            this.handleIncomingMessage(messageData);
        }, 100);
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
        }
    }
    
    // Game state synchronization handlers
    handleCardMove(data) {
        const { cardId, x, y } = data;
        console.log('Handling card move:', { cardId, x, y });
        const cardElement = document.querySelector(`[data-card-id="${cardId}"]`);
        if (cardElement) {
            console.log('Moving card element:', cardElement);
            cardElement.style.left = x + 'px';
            cardElement.style.top = y + 'px';
            // Bring moved card to front by giving it the highest z-index
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
            // Remove the card from the table
            cardElement.remove();
            
            // Synchronize deck state if provided
            if (deckState) {
                this.game.deck.cards = [...deckState.cards];
            } else if (card) {
                // Fallback: add the card back to the deck if card data is provided
                this.game.deck.addCard(card);
                this.game.deck.shuffle();
            }
            
            // Update deck count
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
        
        // Synchronize deck state if provided
        if (deckState) {
            this.game.deck.cards = [...deckState];
            this.game.renderDeck();
        }
        
        // Add the card to dealt cards
        this.game.dealtCards.push(card);
        
        // Create card element with the specific ID
        const cardElement = this.game.createCardElement(this.game.deck, card);
        if (!cardElement) {
            console.error('Failed to create card element for card:', card);
            return;
        }
        cardElement.dataset.cardId = cardId;
        
        // Position the card at the exact same coordinates
        cardElement.style.left = x + 'px';
        cardElement.style.top = y + 'px';
        
        // Add to table and set up interactions
        document.getElementById('card-table').appendChild(cardElement);
        this.game.addCardInteractions(cardElement, card);
    }
    
    handleResetGame() {
        this.game.resetGame();
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
    
    // Public methods for game integration
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
    
    connectToSignalingServer() {
        // Use a simple peer-to-peer approach with data channels
        console.log('Setting up direct peer connection');
        
        if (this.isHost) {
            this.setupHostConnection();
        } else {
            this.setupClientConnection();
        }
    }
    
    setupHostConnection() {
        // Host creates peer connection and waits for client
        this.createPeerConnection();
        this.updateConnectionStatus('connecting');
        
        // Simulate client joining after a delay
        setTimeout(() => {
            this.simulateClientJoin();
        }, 2000);
    }
    
    setupClientConnection() {
        // Client creates peer connection
        this.createPeerConnection();
        this.updateConnectionStatus('connecting');
        
        // Simulate connection to host
        setTimeout(() => {
            this.simulateHostConnection();
        }, 1500);
    }
    
    simulateClientJoin() {
        // Both host and client should see 2 players
        this.connectedPlayers.add('host');
        this.connectedPlayers.add('client');
        this.connectedPlayers.add(this.playerId); // Add self
        this.updatePlayerCount();
        this.updateConnectionStatus('connected');
        console.log('Client joined the room');
    }
    
    simulateHostConnection() {
        // Both host and client should see 2 players
        this.connectedPlayers.add('host');
        this.connectedPlayers.add('client');
        this.connectedPlayers.add(this.playerId); // Add self
        this.updatePlayerCount();
        this.updateConnectionStatus('connected');
        console.log('Connected to host');
    }
    
    
    handleSignalingMessage(message) {
        console.log('Signaling message:', message.type);
        
        switch (message.type) {
            case 'roomCreated':
                console.log('Room created successfully');
                this.createPeerConnection();
                break;
            case 'roomJoined':
                console.log('Joined room successfully');
                this.createPeerConnection();
                break;
            case 'clientJoined':
                console.log('Client joined the room');
                this.connectedPlayers.add('client');
                this.updatePlayerCount();
                this.initiateConnection();
                break;
            case 'offer':
                this.handleOffer(message.offer);
                break;
            case 'answer':
                this.handleAnswer(message.answer);
                break;
            case 'iceCandidate':
                this.handleIceCandidate(message.candidate);
                break;
            case 'gameMessage':
                this.handleIncomingMessage(message.data);
                break;
            case 'hostDisconnected':
                console.log('Host disconnected');
                this.updateConnectionStatus('offline');
                break;
            case 'clientDisconnected':
                console.log('Client disconnected');
                this.connectedPlayers.clear();
                this.updatePlayerCount();
                break;
            case 'error':
                console.error('Signaling error:', message.message);
                alert('Error: ' + message.message);
                this.updateConnectionStatus('offline');
                break;
        }
    }
    
    initiateConnection() {
        if (this.isHost && this.peerConnection) {
            // Host creates offer
            this.peerConnection.createOffer()
                .then(offer => {
                    return this.peerConnection.setLocalDescription(offer);
                })
                .then(() => {
                    // Send offer through signaling server
                    this.signalingSocket.send(JSON.stringify({
                        type: 'offer',
                        offer: this.peerConnection.localDescription
                    }));
                })
                .catch(error => {
                    console.error('Error creating offer:', error);
                });
        }
    }
    
    handleOffer(offer) {
        if (!this.isHost && this.peerConnection) {
            this.peerConnection.setRemoteDescription(offer)
                .then(() => {
                    return this.peerConnection.createAnswer();
                })
                .then(answer => {
                    return this.peerConnection.setLocalDescription(answer);
                })
                .then(() => {
                    // Send answer through signaling server
                    this.signalingSocket.send(JSON.stringify({
                        type: 'answer',
                        answer: this.peerConnection.localDescription
                    }));
                })
                .catch(error => {
                    console.error('Error handling offer:', error);
                });
        }
    }
    
    handleAnswer(answer) {
        if (this.isHost && this.peerConnection) {
            this.peerConnection.setRemoteDescription(answer)
                .catch(error => {
                    console.error('Error handling answer:', error);
                });
        }
    }
    
    handleIceCandidate(candidate) {
        if (this.peerConnection) {
            this.peerConnection.addIceCandidate(candidate)
                .catch(error => {
                    console.error('Error adding ICE candidate:', error);
                });
        }
    }
    
    // Cleanup method
    disconnect() {
        if (this.dataChannel) {
            this.dataChannel.close();
        }
        if (this.peerConnection) {
            this.peerConnection.close();
        }
        if (this.messagePollingInterval) {
            clearInterval(this.messagePollingInterval);
            this.messagePollingInterval = null;
        }
        this.updateConnectionStatus('offline');
        this.connectedPlayers.clear();
        this.updatePlayerCount();
    }
}
