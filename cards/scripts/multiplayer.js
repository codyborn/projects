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
        this.testMode = false; // Test flag for auto-connection
        this.roomCreationAttempted = false; // Prevent multiple room creation attempts
        
        // WebRTC configuration
        this.rtcConfig = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' },
                { urls: 'stun:stun3.l.google.com:19302' },
                { urls: 'stun:stun4.l.google.com:19302' }
            ],
            iceCandidatePoolSize: 10
        };
        
        this.setupEventListeners();
        this.setupLocalStorageListener();
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
        // Set the room code input to "TEST1"
        document.getElementById('room-code-input').value = 'TEST1';
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
        if (this.testMode && code === 'TEST1') {
            this.roomCode = code;
            // In test mode, first instance becomes host, others become clients
            // Check if room already exists by trying to create it first
            this.isHost = true; // Try to be host first
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
                console.log('ICE candidate:', event.candidate);
                console.log('Candidate type:', event.candidate.type);
                console.log('Candidate protocol:', event.candidate.protocol);
                console.log('Candidate address:', event.candidate.address);
                // Send ICE candidate through signaling server
                if (this.signalingSocket && this.signalingSocket.readyState === WebSocket.OPEN) {
                    this.signalingSocket.send(JSON.stringify({
                        type: 'iceCandidate',
                        candidate: event.candidate
                    }));
                }
            } else {
                console.log('ICE gathering complete - no more candidates');
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
            console.log('ICE connection state:', this.peerConnection.iceConnectionState);
            console.log('ICE gathering state:', this.peerConnection.iceGatheringState);
            
            if (this.peerConnection.connectionState === 'connected') {
                console.log('WebRTC connection established!');
                this.updateConnectionStatus('connected');
                this.connectedPlayers.add(this.playerId);
                this.updatePlayerCount();
            } else if (this.peerConnection.connectionState === 'disconnected' || 
                      this.peerConnection.connectionState === 'failed') {
                console.log('WebRTC connection failed:', this.peerConnection.connectionState);
                console.log('ICE connection state:', this.peerConnection.iceConnectionState);
                this.updateConnectionStatus('offline');
                this.connectedPlayers.clear();
                this.updatePlayerCount();
            }
        };
        
        // Handle ICE connection state changes
        this.peerConnection.oniceconnectionstatechange = () => {
            console.log('ICE connection state changed:', this.peerConnection.iceConnectionState);
            if (this.peerConnection.iceConnectionState === 'failed') {
                console.log('ICE connection failed - checking candidate types');
                console.log('Local description:', this.peerConnection.localDescription);
                console.log('Remote description:', this.peerConnection.remoteDescription);
            } else if (this.peerConnection.iceConnectionState === 'connected') {
                console.log('ICE connection established successfully!');
            } else if (this.peerConnection.iceConnectionState === 'disconnected') {
                console.log('ICE connection lost - this might be a network issue');
            }
        };
        
        // Handle ICE gathering state changes
        this.peerConnection.onicegatheringstatechange = () => {
            console.log('ICE gathering state changed:', this.peerConnection.iceGatheringState);
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
        
        // Send through signaling server if connected
        if (this.signalingSocket && this.signalingSocket.readyState === WebSocket.OPEN) {
            this.signalingSocket.send(JSON.stringify({
                type: 'gameMessage',
                data: {
                    ...message,
                    playerId: this.playerId,
                    timestamp: Date.now(),
                    roomCode: this.roomCode
                }
            }));
        } else {
            // Fallback to localStorage for cross-instance communication
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
        this.game.resetGame(false); // Don't broadcast when handling incoming reset message
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
    
    connectToSignalingServer() {
        console.log('Connecting to signaling server');
        
        // Determine signaling server URL
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        let host = window.location.hostname;
        
        // Handle file:// URLs and localhost
        if (!host || host === '' || host === 'localhost' || host === '127.0.0.1') {
            host = 'localhost';
        }
        
        const port = '8080'; // Default signaling server port
        const signalingUrl = `${protocol}//${host}:${port}`;
        
        console.log('Connecting to:', signalingUrl);
        console.log('Current location:', window.location.href);
        console.log('Protocol:', window.location.protocol);
        console.log('Hostname:', window.location.hostname);
        
        try {
            this.signalingSocket = new WebSocket(signalingUrl);
            
            this.signalingSocket.onopen = () => {
                console.log('Connected to signaling server');
                this.handleSignalingConnected();
            };
            
            this.signalingSocket.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    this.handleSignalingMessage(message);
                } catch (error) {
                    console.error('Error parsing signaling message:', error);
                }
            };
            
            this.signalingSocket.onclose = () => {
                console.log('Disconnected from signaling server');
                this.updateConnectionStatus('offline');
            };
            
            this.signalingSocket.onerror = (error) => {
                console.error('Signaling server error:', error);
                console.error('WebSocket error details:', error);
                this.updateConnectionStatus('offline');
            };
            
            // Add timeout for connection
            setTimeout(() => {
                if (this.signalingSocket && this.signalingSocket.readyState === WebSocket.CONNECTING) {
                    console.log('Signaling server connection timeout after 5 seconds');
                    console.log('WebSocket state:', this.signalingSocket.readyState);
                    console.log('Signaling URL:', signalingUrl);
                    this.signalingSocket.close();
                    this.updateConnectionStatus('offline');
                }
            }, 5000); // 5 second timeout
            
        } catch (error) {
            console.error('Failed to connect to signaling server:', error);
            console.error('Connection error details:', error);
            this.updateConnectionStatus('offline');
        }
    }
    
    handleSignalingConnected() {
        console.log('Signaling server connected, creating room or joining...');
        console.log('Room code:', this.roomCode, 'Is host:', this.isHost);
        
        if (this.roomCreationAttempted) {
            console.log('Room creation already attempted, skipping');
            return;
        }
        
        this.roomCreationAttempted = true;
        
        if (this.isHost) {
            // Host creates room
            console.log('Attempting to create room:', this.roomCode);
            this.signalingSocket.send(JSON.stringify({
                type: 'createRoom',
                roomCode: this.roomCode
            }));
        } else {
            // Client joins room
            console.log('Attempting to join room:', this.roomCode);
            this.signalingSocket.send(JSON.stringify({
                type: 'joinRoom',
                roomCode: this.roomCode
            }));
        }
    }
    
    setupFallbackConnection() {
        console.log('Using fallback connection simulation');
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
                // If we were trying to be host but got made a client, update our role
                if (this.isHost) {
                    this.isHost = false;
                    console.log('Converted to client role');
                }
                this.createPeerConnection();
                // As a client, we wait for the host to initiate connection
                break;
            case 'clientJoined':
                console.log('Client joined the room');
                this.connectedPlayers.add('client');
                this.updatePlayerCount();
                // Only initiate connection if we're the host and have a peer connection
                if (this.isHost && this.peerConnection) {
                    console.log('Host initiating connection with client');
                    this.initiateConnection();
                } else if (this.isHost && !this.peerConnection) {
                    console.log('Host peer connection not ready, retrying in 1 second...');
                    setTimeout(() => {
                        if (this.peerConnection) {
                            this.initiateConnection();
                        }
                    }, 1000);
                } else {
                    console.log('Not host, waiting for host to initiate...');
                }
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
                console.error('Full error message:', message);
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
                    if (this.signalingSocket && this.signalingSocket.readyState === WebSocket.OPEN) {
                        this.signalingSocket.send(JSON.stringify({
                            type: 'offer',
                            offer: this.peerConnection.localDescription
                        }));
                    }
                })
                .catch(error => {
                    console.error('Error creating offer:', error);
                });
        }
    }
    
    handleOffer(offer) {
        if (!this.isHost && this.peerConnection) {
            console.log('Handling offer from host');
            this.peerConnection.setRemoteDescription(offer)
                .then(() => {
                    console.log('Remote description set, creating answer');
                    return this.peerConnection.createAnswer();
                })
                .then(answer => {
                    console.log('Answer created, setting local description');
                    return this.peerConnection.setLocalDescription(answer);
                })
                .then(() => {
                    console.log('Sending answer to host');
                    // Send answer through signaling server
                    if (this.signalingSocket && this.signalingSocket.readyState === WebSocket.OPEN) {
                        this.signalingSocket.send(JSON.stringify({
                            type: 'answer',
                            answer: this.peerConnection.localDescription
                        }));
                        console.log('Answer sent to host successfully');
                    } else {
                        console.error('Signaling socket not ready, cannot send answer');
                    }
                })
                .catch(error => {
                    console.error('Error handling offer:', error);
                });
        }
    }
    
    handleAnswer(answer) {
        if (this.isHost && this.peerConnection) {
            console.log('Handling answer from client');
            this.peerConnection.setRemoteDescription(answer)
                .then(() => {
                    console.log('Answer processed successfully');
                    console.log('WebRTC negotiation complete - waiting for connection...');
                })
                .catch(error => {
                    console.error('Error handling answer:', error);
                });
        }
    }
    
    handleIceCandidate(candidate) {
        if (this.peerConnection) {
            console.log('Adding ICE candidate:', candidate);
            console.log('Candidate type:', candidate.type);
            console.log('Candidate protocol:', candidate.protocol);
            console.log('Candidate address:', candidate.address);
            
            // Reconstruct the RTCIceCandidate object properly
            const iceCandidate = new RTCIceCandidate(candidate);
            console.log('Reconstructed ICE candidate:', iceCandidate);
            console.log('Reconstructed type:', iceCandidate.type);
            console.log('Reconstructed protocol:', iceCandidate.protocol);
            console.log('Reconstructed address:', iceCandidate.address);
            
            this.peerConnection.addIceCandidate(iceCandidate)
                .then(() => {
                    console.log('ICE candidate added successfully');
                })
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
