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
        this.connectionTimeout = 60000; // 60 seconds (more lenient, but should be caught by ping/pong)
        
        // Ping/pong keepalive
        this.pingInterval = null;
        this.pingIntervalMs = 15000; // Send ping every 15 seconds (more frequent for Heroku's 55s timeout)
        this.pongTimeout = null;
        this.pongTimeoutMs = 10000; // Wait 10 seconds for pong (more lenient)
        this.lastPongTime = 0;
        this.missedPongs = 0; // Track consecutive missed pongs
        this.maxMissedPongs = 3; // Disconnect after 3 missed pongs
        
        // Reconnection management
        this.reconnecting = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 10;
        this.reconnectDelay = 1000; // Start with 1 second
        this.maxReconnectDelay = 30000; // Max 30 seconds
        this.reconnectTimer = null;
        
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

        // Update on-board overlay as well
        const boardStatus = document.getElementById('board-connection-status');
        if (boardStatus) {
            const boardIndicator = boardStatus.querySelector('.status-indicator');
            const boardText = boardStatus.querySelector('.status-text');
            if (boardIndicator) boardIndicator.className = `status-indicator ${status}`;
            if (boardText) {
                if (status === 'offline') boardText.textContent = 'Offline';
                else if (status === 'connecting') boardText.textContent = 'Connecting...';
                else boardText.textContent = 'Connected';
            }
            // Show the overlay when not connected; hide when connected
            boardStatus.style.display = (status === 'connected') ? 'none' : 'flex';
        }
    }
    
    createRoom() {
        // Disconnect from existing room first
        this.disconnect();
        
        this.roomCode = this.generateRoomCode();
        this.isHost = true;
        this.iLastBroadcastDeck = true;
        this.updateConnectionStatus('connecting');
        
        console.log('Room created:', this.roomCode);
        
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
        // For local testing/development, try localhost first with fallback to remote
        // For production, use the deployed server
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        
        // Check if we're running locally (localhost or 127.0.0.1)
        // This allows tests to connect to local test server
        const isLocalhost = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1' ||
                           window.location.hostname === '';
        
        // If accessing from localhost, try local server first, fallback to remote
        // Otherwise, use remote server directly
        const remoteHost = 'cards-websocket-server-02b8944e7896.herokuapp.com';
        const localHost = 'localhost:8080';
        
        let host = isLocalhost ? localHost : remoteHost;
        // Always use secure WebSocket for remote Heroku host, even if page is served over http
        const wsUrl = isLocalhost
            ? `${protocol}//${host}/chat/${this.roomCode}`
            : `wss://${host}/chat/${this.roomCode}`;
        
        console.log('Connecting to:', wsUrl);
        
        try {
            this.socket = new WebSocket(wsUrl);
            this.socket._connectionAttempt = { host, isLocalhost, triedRemote: false };
            
            this.socket.onopen = () => {
                console.log('Connected to WebSocket server');
                // Don't set status to 'connected' yet - wait for roomJoined
                // Keep as 'connecting' until room is actually joined
                this.updateConnectionStatus('connecting');
                this.lastMessageTime = Date.now();
                this.lastPongTime = Date.now();
                
                // Reset reconnection state on successful connection
                this.reconnecting = false;
                this.reconnectAttempts = 0;
                this.reconnectDelay = 1000;
                this.missedPongs = 0; // Reset missed pongs
                
                this.startHealthCheck();
                this.startPingInterval();
                
                // Handle reconnection if we already had a room
                if (this.roomCode && this.roomCreationAttempted) {
                    this.onReconnection();
                } else {
                    this.handleWebSocketConnected();
                }
            };
            
            this.socket.onmessage = (event) => {
                try {
                    // Handle WebSocket ping/pong (binary frame with single byte)
                    if (typeof event.data === 'string' && event.data === 'pong') {
                        this.handlePong();
                        return;
                    }
                    
                    const message = JSON.parse(event.data);
                    
                    // Handle ping/pong messages (JSON format fallback)
                    if (message.type === 'pong') {
                        this.handlePong();
                        return;
                    }
                    
                    this.handleWebSocketMessage(message);
                } catch (error) {
                    // If it's a pong binary frame, handle it
                    if (event.data instanceof ArrayBuffer || event.data instanceof Blob) {
                        // Could be binary pong, but WebSocket library typically handles this
                        // For now, just log and continue
                        console.log('Received binary data (possibly pong)');
                        return;
                    }
                    console.error('Error parsing WebSocket message:', error);
                }
            };
            
            this.socket.onclose = (event) => {
                console.log('Disconnected from WebSocket server', event.code, event.reason);
                
                // Stop ping/pong when connection closes
                this.stopPingInterval();
                this.stopHealthCheck();
                
                // If we tried localhost and it failed, try remote server as fallback
                const connAttempt = this.socket._connectionAttempt;
                if (connAttempt && connAttempt.isLocalhost && !connAttempt.triedRemote) {
                    // Connection failed or closed abnormally (1006 = abnormal closure, or any error)
                    // Try remote server as fallback
                    console.log('Local server connection failed or closed, falling back to remote server');
                    connAttempt.triedRemote = true;
                    
                    const remoteUrl = `wss://${remoteHost}/chat/${this.roomCode}`;
                    console.log('Connecting to remote server:', remoteUrl);
                    
                    // Wait a bit before retrying
                    setTimeout(() => {
                        if (this.roomCode) {
                            this.connectToRemoteServer(remoteUrl);
                        }
                    }, 1000);
                    return;
                }
                
                this.updateConnectionStatus('offline');
                // Attempt reconnection with exponential backoff (don't loop between local/remote)
                if (this.roomCode && (!connAttempt || !connAttempt.triedRemote)) {
                    this.scheduleReconnect();
                }
            };
            
            this.socket.onerror = (error) => {
                console.error('WebSocket error:', error);
                
                // If localhost failed, mark that we should try remote
                const connAttempt = this.socket._connectionAttempt;
                if (connAttempt && connAttempt.isLocalhost && !connAttempt.triedRemote) {
                    console.log('Local server error detected, will try remote as fallback');
                    // Set a flag to trigger fallback on close
                    connAttempt.shouldTryRemote = true;
                    // If socket closes immediately after error, onclose will handle it
                    // But also schedule a fallback attempt in case onclose doesn't fire
                    setTimeout(() => {
                        if (this.socket && (this.socket.readyState === WebSocket.CLOSED || 
                            this.socket.readyState === WebSocket.CLOSING) && 
                            connAttempt && !connAttempt.triedRemote) {
                            console.log('Connection appears closed after error, trying remote fallback');
                            const remoteUrl = `wss://${remoteHost}/chat/${this.roomCode}`;
                            connAttempt.triedRemote = true;
                            if (this.roomCode) {
                                this.connectToRemoteServer(remoteUrl);
                            }
                        }
                    }, 1000);
                } else {
                    this.updateConnectionStatus('offline');
                    // Schedule reconnect attempt if we're still in a room
                    if (this.roomCode && !this.reconnecting) {
                        this.scheduleReconnect();
                    }
                }
            };
            
            // Add timeout for connection
            setTimeout(() => {
                if (this.socket && this.socket.readyState === WebSocket.CONNECTING) {
                    console.log('WebSocket connection timeout after 5 seconds');
                    this.socket.close();
                    
                    // If we tried localhost, try remote
                    const connAttempt = this.socket._connectionAttempt;
                    if (connAttempt && connAttempt.isLocalhost && !connAttempt.triedRemote) {
                        const remoteUrl = `wss://${remoteHost}/chat/${this.roomCode}`;
                        console.log('Connection timeout, trying remote server:', remoteUrl);
                        connAttempt.triedRemote = true;
                        setTimeout(() => {
                            if (this.roomCode) {
                                this.connectToRemoteServer(remoteUrl);
                            }
                        }, 500);
                    } else {
                        this.updateConnectionStatus('offline');
                    }
                }
            }, 5000);
            
        } catch (error) {
            console.error('Failed to connect to WebSocket server:', error);
            
            // If localhost failed and we haven't tried remote, try it
            if (isLocalhost && this.roomCode) {
                const remoteUrl = `wss://${remoteHost}/chat/${this.roomCode}`;
                console.log('Connection exception, trying remote server:', remoteUrl);
                setTimeout(() => {
                    this.connectToRemoteServer(remoteUrl);
                }, 500);
            } else {
                this.updateConnectionStatus('offline');
            }
        }
    }
    
    connectToRemoteServer(wsUrl) {
        console.log('Connecting to remote WebSocket server:', wsUrl);
        
        try {
            this.socket = new WebSocket(wsUrl);
            this.socket._connectionAttempt = { host: wsUrl.split('//')[1].split('/')[0], isLocalhost: false, triedRemote: true };
            
            this.socket.onopen = () => {
                console.log('Connected to remote WebSocket server');
                this.updateConnectionStatus('connecting');
                this.lastMessageTime = Date.now();
                this.lastPongTime = Date.now();
                
                // Reset reconnection state on successful connection
                this.reconnecting = false;
                this.reconnectAttempts = 0;
                this.reconnectDelay = 1000;
                this.missedPongs = 0; // Reset missed pongs
                
                this.startHealthCheck();
                this.startPingInterval();
                
                if (this.roomCode && this.roomCreationAttempted) {
                    this.onReconnection();
                } else {
                    this.handleWebSocketConnected();
                }
            };
            
            this.socket.onmessage = (event) => {
                try {
                    // Handle WebSocket ping/pong (binary frame with single byte)
                    if (typeof event.data === 'string' && event.data === 'pong') {
                        this.handlePong();
                        return;
                    }
                    
                    const message = JSON.parse(event.data);
                    
                    // Handle ping/pong messages (JSON format fallback)
                    if (message.type === 'pong') {
                        this.handlePong();
                        return;
                    }
                    
                    this.handleWebSocketMessage(message);
                } catch (error) {
                    // If it's a pong binary frame, handle it
                    if (event.data instanceof ArrayBuffer || event.data instanceof Blob) {
                        console.log('Received binary data (possibly pong)');
                        return;
                    }
                    console.error('Error parsing WebSocket message:', error);
                }
            };
            
            this.socket.onclose = () => {
                console.log('Disconnected from remote WebSocket server');
                this.stopPingInterval();
                this.stopHealthCheck();
                this.updateConnectionStatus('offline');
                if (this.roomCode) {
                    this.scheduleReconnect();
                }
            };
            
            this.socket.onerror = (error) => {
                console.error('Remote WebSocket error:', error);
                this.updateConnectionStatus('offline');
            };
            
        } catch (error) {
            console.error('Failed to connect to remote WebSocket server:', error);
            this.updateConnectionStatus('offline');
        }
    }
    
    handleWebSocketConnected() {
        console.log('WebSocket server connected, joining room...');
        console.log('Room code:', this.roomCode, 'Is host:', this.isHost);
        
        if (this.roomCreationAttempted) {
            console.log('Room join already attempted, skipping');
            return;
        }
        
        this.roomCreationAttempted = true;
        
        // Always use joinRoom (server creates room if needed)
        console.log('Attempting to join room:', this.roomCode);
        this.sendMessage({
            type: 'joinRoom',
            roomCode: this.roomCode,
            playerId: this.playerId,
            playerName: this.playerAlias
        });
    }
    
    handleWebSocketMessage(message) {
        console.log('WebSocket message:', message.type);
        
        switch (message.type) {
            case 'roomJoined':
                console.log('Joined room successfully');
                this.isHost = message.isHost || false;
                this.connectedPlayers.add(this.playerId);
                this.updatePlayerCount();
                this.updateConnectionStatus('connected');
                
                // Apply full state from server if provided
                if (message.gameState) {
                    this.applyGameState(message.gameState);
                }
                
                // If server sends player list immediately, apply it (faster than waiting for broadcast)
                if (message.players && Array.isArray(message.players)) {
                    this.applyPlayerList(message.players);
                } else {
                    // Otherwise request full state and player list (fallback)
                    this.requestFullState();
                }
                
                // Update private hand display immediately with player list
                if (this.game && typeof this.game.updatePrivateHandDisplay === 'function') {
                    this.game.updatePrivateHandDisplay();
                }
                
                // Add ourselves to the player list and broadcast it
                this.broadcastPlayerList();
                break;
                
            case 'fullState':
                // Response to requestFullState
                console.log('Received full state from server');
                this.applyGameState(message.gameState);
                if (message.players) {
                    this.applyPlayerList(message.players);
                }
                break;
                
            case 'playerJoined':
                console.log('Player joined the room:', message.playerId);
                this.connectedPlayers.add(message.playerId);
                
                // Store player alias if provided
                if (message.playerAlias && message.playerAlias !== message.playerId) {
                    this.playerAliases.set(message.playerId, message.playerAlias);
                }
                
                this.updatePlayerCount();
                
                // Note: Server already sends full state to new players in roomJoined,
                // so we don't need to sync separately. Just ensure player list is updated.
                
                // Broadcast updated player list to all players immediately
                this.broadcastPlayerList();
                
                // Update private hand display to show new player
                if (this.game && typeof this.game.updatePrivateHandDisplay === 'function') {
                    this.game.updatePrivateHandDisplay();
                }
                
                // Automatically broadcast current deck to all players when someone joins
                this.broadcastCurrentDeckToAll();
                break;
                
            case 'playerLeft':
                console.log('Player left the room:', message.playerId);
                this.connectedPlayers.delete(message.playerId);
                this.updatePlayerCount();
                break;
                
            case 'gameMessage':
                // Server-validated state updates
                if (message.data && message.data.type === 'cardState') {
                    // cardState data is always an array (even for single cards)
                    this.handleCardState(message.data.data, message.timestamp, message.sentBy);
                } else if (message.data && message.data.type === 'deckChange') {
                    this.handleDeckChange(message.data.data); // data is { deckId, deckData }
                } else if (message.data && message.data.type === 'playerJoined') {
                    this.handlePlayerJoin(message.data.data);
                } else if (message.data && message.data.type === 'playerLeft') {
                    const playerId = message.data.data?.playerId;
                    if (playerId) {
                        this.connectedPlayers.delete(playerId);
                        this.updatePlayerCount();
                    }
                } else {
                    // Fallback: try legacy handler
                    try {
                        this.handleIncomingMessage(message.data);
                    } catch (error) {
                        console.error('❌ Error in handleIncomingMessage:', error);
                    }
                }
                break;
                
            case 'gameReset':
                // Server broadcast game reset
                if (message.gameState) {
                    this.applyGameState(message.gameState);
                }
                if (this.game && typeof this.game.resetGame === 'function') {
                    this.game.resetGame(false); // Don't broadcast (server already did)
                }
                break;
                
            case 'error':
                this.handleServerError(message);
                break;
        }
    }
    
    sendMessage(message) {
        // If WebSocket not connected, queue message for later
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            console.warn('WebSocket not connected, queuing message:', message.type);
            this.messageQueue.push(message);
            
            // Attempt reconnection if not already attempting
            if (this.connectionStatus !== 'connecting') {
                this.handleConnectionLoss();
            }
            return;
        }
        
        try {
            // Control messages (joinRoom, requestFullState, etc.) should be sent directly
            // Game messages (cardState, deckChange, etc.) should be wrapped in gameMessage
            const controlMessageTypes = ['joinRoom', 'requestFullState', 'resetGame'];
            const isControlMessage = controlMessageTypes.includes(message.type);
            
            if (isControlMessage) {
                // Send control messages directly to server
                const messageData = {
                    ...message,
                    playerId: this.playerId,
                    roomCode: this.roomCode
                };
                this.socket.send(JSON.stringify(messageData));
            } else {
                // Wrap game messages
                const messageId = ++this.messageIdCounter;
                const messageData = {
                    ...message,
                    playerId: this.playerId,
                    timestamp: Date.now(),
                    roomCode: this.roomCode,
                    messageId: messageId,
                    requiresAck: true
                };
                
                // If targetPlayerId is specified, this is a targeted message (legacy)
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
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            this.messageQueue.push(message);
            this.handleConnectionLoss();
        }
    }
    
    // Enhanced error handling
    handleServerError(error) {
        console.error('Server error:', error);
        
        const errorMessage = error.message || 'An unknown error occurred';
        const errorCode = error.code || 'UNKNOWN';
        
        // Show user-friendly error message
        this.showErrorNotification(errorMessage);
        
        switch (errorCode) {
            case 'ROOM_NOT_FOUND':
                this.updateConnectionStatus('offline');
                break;
                
            case 'PLAYER_NOT_IN_ROOM':
                this.updateConnectionStatus('offline');
                break;
                
            case 'INVALID_STATE':
                // Request full state to resync
                console.log('Invalid state detected, requesting full state...');
                this.requestFullState();
                break;
                
            default:
                this.updateConnectionStatus('offline');
                // Attempt reconnection for network errors
                if (this.roomCode) {
                    setTimeout(() => {
                        this.handleConnectionLoss();
                    }, 2000);
                }
        }
    }
    
    // Show error notification to user
    showErrorNotification(message) {
        // Create or update error notification element
        let errorDiv = document.getElementById('connection-error-notification');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.id = 'connection-error-notification';
            errorDiv.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #f87171;
                color: white;
                padding: 12px 16px;
                border-radius: 8px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                z-index: 10000;
                max-width: 300px;
                font-size: 14px;
            `;
            document.body.appendChild(errorDiv);
        }
        
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (errorDiv) {
                errorDiv.style.display = 'none';
            }
        }, 5000);
    }
    
    handleIncomingMessage(message) {
        // Update last message time for health check
        this.lastMessageTime = Date.now();
        
        // Update pong time if we receive any message (indicates connection is alive)
        this.lastPongTime = Date.now();
        
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
                // Legacy handler - cardState now comes through gameMessage
                this.handleCardState(message.data, message.timestamp, message.playerId);
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
                // Request handled by server now - no client-side response needed
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
    
    // ========== Server Request Methods ==========
    
    requestCardStateUpdate(cardStates) {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            console.error('WebSocket not connected');
            return;
        }
        
        // Ensure cardStates is always an array (supports single or multiple cards)
        const cardStatesArray = Array.isArray(cardStates) ? cardStates : [cardStates];
        
        this.socket.send(JSON.stringify({
            type: 'updateCardState',
            playerId: this.playerId,
            roomCode: this.roomCode,
            cardStates: cardStatesArray // Always array format
        }));
        
        // Don't apply changes locally yet - wait for server broadcast
    }
    
    requestDeckUpdate(deckId, deckData) {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            console.error('WebSocket not connected');
            return;
        }
        
        this.socket.send(JSON.stringify({
            type: 'updateDeck',
            playerId: this.playerId,
            roomCode: this.roomCode,
            deckId: deckId,
            deckData: deckData
        }));
    }
    
    requestShuffleDiscardPile(discardCardUniqueIds) {
        const uniqueIdsArray = Array.isArray(discardCardUniqueIds) ? discardCardUniqueIds : [discardCardUniqueIds];
        console.log('REQUESTING SHUFFLE DISCARD PILE:', uniqueIdsArray.length, 'cards', uniqueIdsArray);
        
        // If connected, send to server
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            // ShuffleDiscardPile is a control message, send directly (not wrapped in gameMessage)
            this.socket.send(JSON.stringify({
                type: 'shuffleDiscardPile',
                playerId: this.playerId,
                roomCode: this.roomCode,
                discardCardUniqueIds: uniqueIdsArray
            }));
        } else {
            // Not connected - handle shuffle locally using same logic as server
            this.handleShuffleLocally(uniqueIdsArray);
        }
    }
    
    // Handle shuffle when offline - uses same logic flow as server response
    handleShuffleLocally(discardCardUniqueIds) {
        if (!this.game || !this.game.deck) {
            console.error('Cannot shuffle: game or deck not available');
            return;
        }
        
        // Get card data before removal (same as server logic)
        const cardsToAdd = [];
        discardCardUniqueIds.forEach(uniqueId => {
            const cardElement = document.querySelector(`[data-unique-id="${uniqueId}"]`);
            if (cardElement) {
                const card = this.game.getCardFromElement(cardElement);
                if (card) {
                    cardsToAdd.push(card);
                }
            }
        });
        
        // Remove cards from DOM (simulate cardState with status='discarded')
        discardCardUniqueIds.forEach(uniqueId => {
            const cardElement = document.querySelector(`[data-unique-id="${uniqueId}"]`);
            if (cardElement) {
                if (cardElement._cleanupTooltip) {
                    cardElement._cleanupTooltip();
                }
                cardElement.remove();
            }
        });
        
        // Broadcast card removals (simulate server response)
        this.handleCardState(
            discardCardUniqueIds.map(uniqueId => ({
                uniqueId,
                status: 'discarded',
                timestamp: Date.now()
            })),
            Date.now(),
            this.playerId
        );
        
        // Add cards back to deck with size limit
        const originalSize = this.game.originalDeckSize || this.game.deck.cards.length;
        const currentSize = this.game.deck.cards.length;
        const maxToAdd = Math.max(0, originalSize - currentSize);
        const cardsToActuallyAdd = cardsToAdd.slice(0, maxToAdd);
        
        cardsToActuallyAdd.forEach(card => {
            if (this.game.deck.cards.length < originalSize) {
                this.game.deck.addCard(card);
            }
        });
        
        // Shuffle deck
        this.game.deck.shuffle();
        
        // Ensure deck doesn't exceed original size
        if (this.game.deck.cards.length > originalSize) {
            this.game.deck.cards = this.game.deck.cards.slice(0, originalSize);
        }
        
        // Broadcast deck change (simulate server response)
        this.handleDeckChange({
            deckId: this.game.deck.id || null,
            deckData: {
                id: this.game.deck.id || null,
                name: this.game.deck.name || 'Deck',
                cards: this.game.deck.cards
            },
            originalDeckSize: originalSize
        });
        
        // Update UI
        if (typeof this.game.renderDeck === 'function') {
            this.game.renderDeck();
        }
        if (typeof this.game.updateDiscardPileCounter === 'function') {
            this.game.updateDiscardPileCounter();
        }
    }
    
    requestFullState() {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            console.error('WebSocket not connected');
            return;
        }
        
        this.socket.send(JSON.stringify({
            type: 'requestFullState',
            playerId: this.playerId,
            roomCode: this.roomCode
        }));
    }
    
    // ========== State Application Methods ==========
    
    applyGameState(gameState) {
        if (!this.game) return;
        
        console.log('Applying game state from server', gameState);
        
        // Clear local state
        if (typeof this.game.clearBoard === 'function') {
            this.game.clearBoard();
        }
        
        // Apply deck state
        if (gameState.deckId && gameState.deckData) {
            if (gameState.deckId === 'remote' || !this.game.isValidDeckId(gameState.deckId)) {
                // Load as remote deck
                if (typeof this.game.loadRemoteDeck === 'function') {
                    this.game.loadRemoteDeck(gameState.deckData);
                }
            } else {
                // Load deck by ID
                if (typeof this.game.loadDeck === 'function') {
                    this.game.loadDeck(gameState.deckId, false); // Don't broadcast
                }
                // Manually set deck data
                if (this.game.deck && gameState.deckData) {
                    this.game.deck.cards = gameState.deckData.cards || [];
                    this.game.originalDeckSize = gameState.originalDeckSize || gameState.deckData.cards?.length || 0;
                }
            }
        }
        
        // Apply all card states (gameState.cards is an object from serialized Map)
        if (gameState.cards && typeof gameState.cards === 'object') {
            const cardStates = Object.values(gameState.cards);
            
            // Process card states (always array format)
            cardStates.forEach(cardState => {
                this.processSingleCardState(cardState, null, true); // isServerUpdate = true
            });
            
            // Update private hand display AFTER all cards are processed
            // This ensures counts are accurate for all players
            if (this.game && typeof this.game.updatePrivateHandDisplay === 'function') {
                this.game.updatePrivateHandDisplay();
            }
        }
        
        // Update discard pile from state
        if (Array.isArray(gameState.discardPile) && typeof this.game.updateDiscardPileFromState === 'function') {
            this.game.updateDiscardPileFromState(gameState.discardPile);
        }
        
        // Update deck display
        if (typeof this.game.renderDeck === 'function') {
            this.game.renderDeck();
        }
        
        // Ensure private hand display is updated one more time after everything is synced
        if (this.game && typeof this.game.updatePrivateHandDisplay === 'function') {
            // Small delay to ensure all DOM updates are complete
            setTimeout(() => {
                if (this.game && typeof this.game.updatePrivateHandDisplay === 'function') {
                    this.game.updatePrivateHandDisplay();
                }
            }, 100);
        }
        
        console.log('✅ Full state synchronized from server');
    }
    
    applyPlayerList(players) {
        if (!Array.isArray(players)) return;
        
        // Update connected players
        this.connectedPlayers.clear();
        this.connectedPlayers.add(this.playerId); // Always include ourselves
        
        players.forEach(playerData => {
            const playerId = playerData.playerId;
            const playerName = playerData.playerName || playerData.playerAlias;
            
            if (playerId && playerId !== this.playerId) {
                this.connectedPlayers.add(playerId);
                if (playerName) {
                    this.playerAliases.set(playerId, playerName);
                }
            }
        });
        
        this.updatePlayerCount();
        
        // Update private hand display
        if (this.game && typeof this.game.updatePrivateHandDisplay === 'function') {
            this.game.updatePrivateHandDisplay();
        }
    }
    
    processSingleCardState(cardState, playerId = null, isServerUpdate = false) {
        // This is the core method to process a single card state update
        // Called from handleCardState which processes arrays
        const { uniqueId, card, position, isFlipped, zIndex, privateTo, status } = cardState;
        
        // Handle card removal (discarded)
        if (status === 'discarded') {
            // Try multiple selector strategies - dataset.uniqueId becomes data-unique-id in HTML
            let cardElement = document.querySelector(`[data-unique-id="${uniqueId}"]`);
            if (!cardElement) {
                // Try querying by dataset property directly
                const allCards = document.querySelectorAll('.card');
                for (const card of allCards) {
                    if (card.dataset.uniqueId === uniqueId) {
                        cardElement = card;
                        break;
                    }
                }
            }
            
            if (cardElement) {
                console.log('REMOVING CARD FROM DISCARD PILE (shuffled):', uniqueId);
                
                // Clean up any active tooltip before removing the card
                if (cardElement._cleanupTooltip) {
                    cardElement._cleanupTooltip();
                }
                
                // Remove the card from the DOM
                cardElement.remove();
                
                // Update private hand display
                if (this.game && typeof this.game.updatePrivateHandDisplay === 'function') {
                    this.game.updatePrivateHandDisplay();
                }
                
                // Update discard pile counter after card removal - use setTimeout to ensure DOM is updated
                if (this.game && typeof this.game.updateDiscardPileCounter === 'function') {
                    setTimeout(() => {
                        if (this.game && typeof this.game.updateDiscardPileCounter === 'function') {
                            this.game.updateDiscardPileCounter();
                        }
                    }, 50);
                }
                
                // Show shuffle feedback
                if (this.game && typeof this.game.showShuffleFeedback === 'function') {
                    this.game.showShuffleFeedback();
                }
            } else {
                console.warn('Card not found for removal:', uniqueId, 'Total cards in DOM:', document.querySelectorAll('.card').length);
            }
            return; // Exit early for removal
        }
        
        // Find existing card by uniqueId
        let cardElement = document.querySelector(`[data-unique-id="${uniqueId}"]`);
        
        if (!cardElement) {
            // Card doesn't exist, create it
            if (this.game && typeof this.game.createCardElement === 'function') {
                cardElement = this.game.createCardElement(this.game.deck || new cards.Deck(), card);
                if (!cardElement) {
                    console.error('Failed to create card element for card:', card);
                    return;
                }
                // Set both uniqueId and instanceId
                cardElement.dataset.uniqueId = uniqueId;
                cardElement.dataset.instanceId = card.instanceId;
                
                // Determine initial container based on location
                const cardTable = document.getElementById('card-table');
                if (cardTable) {
                    cardTable.appendChild(cardElement);
                }
                
                if (this.game && typeof this.game.addCardInteractions === 'function') {
                    this.game.addCardInteractions(cardElement, card);
                }
            } else {
                return;
            }
        }
        
        // Mark as remote update to prevent feedback loops
        if (isServerUpdate) {
            cardElement.dataset.remoteUpdate = 'true';
        }
        
        // Set privateTo and location dataset attributes
        if (privateTo !== undefined && privateTo !== null) {
            cardElement.dataset.privateTo = privateTo;
        } else {
            delete cardElement.dataset.privateTo;
        }
        
        // Update card state
        const location = cardState.location;
        const isInDiscardPile = location === 'discardPile';
        
        // Ensure discard pile cards are face UP and positioned over discard area (not reparented)
        if (isInDiscardPile) {
            // Remove flipped class immediately
            cardElement.classList.remove('flipped');
            // Position card in discard pile via centralized helper (ignores server position)
            if (this.game && typeof this.game.positionCardInDiscardPileElement === 'function') {
                this.game.positionCardInDiscardPileElement(cardElement);
            }
        } else {
            // Not in discard pile - handle flipped state
            if (isFlipped !== undefined) {
                if (isFlipped) {
                    cardElement.classList.add('flipped');
                } else {
                    cardElement.classList.remove('flipped');
                }
            }
            
            // Handle positioning for non-discard-pile cards
            // CRITICAL: Never apply server position if card is in discard pile container
            // (even if location says 'table', if parent is discard pile, keep it there)
            const isActuallyInDiscardContainer = cardElement.parentNode === this.game.discardPileContent;
            
            if (position && !isActuallyInDiscardContainer) {
                // Move to card-table if needed
                if (cardElement.parentNode === this.game.discardPileContent) {
                    const cardTable = document.getElementById('card-table');
                    if (cardTable) {
                        if (cardElement.parentNode) {
                            cardElement.parentNode.removeChild(cardElement);
                        }
                        cardTable.appendChild(cardElement);
                    }
                }
                // Position relative to card-table
                cardElement.style.position = 'absolute';
                cardElement.style.left = position.x + 'px';
                cardElement.style.top = position.y + 'px';
            }
        }
        
        // Ensure discard pile cards are draggable (interactions should already be set, but verify)
        if (isInDiscardPile && this.game && typeof this.game.addCardInteractions === 'function') {
            // Re-add interactions if card was just created or moved
            if (!cardElement.hasAttribute('draggable')) {
                const card = cardState.card || this.game.getCardFromElement(cardElement);
                if (card) {
                    this.game.addCardInteractions(cardElement, card);
                }
            }
        }
        
        if (zIndex !== undefined) {
            cardElement.style.zIndex = zIndex;
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
        
        // Clear the remote update flag after a short delay
        setTimeout(() => {
            if (cardElement && cardElement.parentNode) {
                cardElement.dataset.remoteUpdate = 'false';
            }
        }, 100);
        
        // Update displays
        if (this.game && this.game.updatePrivateHandDisplay) {
            this.game.updatePrivateHandDisplay();
        }
        
        // Update discard pile counter when cards are synced
        if (this.game && typeof this.game.updateDiscardPileCounter === 'function') {
            // Small delay to ensure DOM is updated
            setTimeout(() => {
                if (this.game && typeof this.game.updateDiscardPileCounter === 'function') {
                    this.game.updateDiscardPileCounter();
                }
            }, 50);
        }
        
        if (this.game && this.game.renderDeck) {
            this.game.renderDeck();
        }
    }
    
    // Updated cardState handler - handles array of card states (always array format)
    handleCardState(data, timestamp = null, sentBy = null) {
        // data is always an array (even for single card updates)
        // Server has already validated and stored this state
        
        if (!Array.isArray(data)) {
            console.warn('handleCardState received non-array data, converting:', data);
            data = [data];
        }
        
        // Check if this is a shuffle operation (all cards have status='discarded')
        const isShuffleOperation = data.every(cs => cs.status === 'discarded') && data.length > 0;
        
        if (isShuffleOperation) {
            console.log('SHUFFLE COMPLETE - Removing', data.length, 'cards from discard pile');
        }
        
        // Process all card states in the array
        data.forEach(cardState => {
            this.processSingleCardState(cardState, sentBy, true); // isServerUpdate = true
        });
        
        // Update private hand display AFTER processing all cards
        // This ensures counts are accurate for all players
        if (this.game && typeof this.game.updatePrivateHandDisplay === 'function') {
            // Small delay to ensure all DOM updates are complete
            setTimeout(() => {
                if (this.game && typeof this.game.updatePrivateHandDisplay === 'function') {
                    this.game.updatePrivateHandDisplay();
                }
            }, 50);
        }
        
        // Update discard pile counter after processing all card states
        if (this.game && typeof this.game.updateDiscardPileCounter === 'function') {
            setTimeout(() => {
                if (this.game && typeof this.game.updateDiscardPileCounter === 'function') {
                    this.game.updateDiscardPileCounter();
                }
            }, 100);
        }
        
        // Update last known state timestamp
        if (timestamp) {
            this.lastServerStateTimestamp = timestamp;
        }
    }
    
    
    handleResetGame() {
        if (this.game && typeof this.game.resetGame === 'function') {
            this.game.resetGame(false);
        }
    }
    
    handlePlayerJoin(data) {
        if (!data) return;
        
        const playerId = data.playerId;
        const playerAlias = data.playerName || data.playerAlias;
        
        this.connectedPlayers.add(playerId);
        
        // Store player alias if provided
        if (playerAlias && playerAlias !== playerId) {
            this.playerAliases.set(playerId, playerAlias);
        }
        
        this.updatePlayerCount();
        
        // Update private hand display to show new player immediately
        if (this.game && typeof this.game.updatePrivateHandDisplay === 'function') {
            this.game.updatePrivateHandDisplay();
        }
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
        // data is { deckId, deckData, originalDeckSize? }
        const { deckId, deckData, originalDeckSize } = data;
        console.log('Handling deck change from server:', { deckId, deckData, originalDeckSize });
        
        // Clear the local flag since we received a deck change from server
        this.iLastBroadcastDeck = false;
        
        // If this is a shuffle operation (deck changed but no board clear), don't clear board
        // Only clear board if it's a new deck entirely
        const isShuffle = deckData && this.game && this.game.deck && 
                         this.game.deck.cards && deckData.cards &&
                         deckData.cards.length > this.game.deck.cards.length;
        
        if (!isShuffle) {
            // Clear the board first (new deck)
            if (this.game && typeof this.game.clearBoard === 'function') {
                this.game.clearBoard();
            }
        }
        
        // Load the deck as a remote deck (prevents id duplicates) and use it as the active deck
        if (this.game && typeof this.game.loadRemoteDeck === 'function') {
            this.game.loadRemoteDeck(deckData);
            // Set original deck size from server state (prioritize server value if provided)
            if (originalDeckSize !== undefined) {
                this.game.originalDeckSize = originalDeckSize;
                console.log(`Updated originalDeckSize to ${originalDeckSize}`);
            } else if (deckData && deckData.cards) {
                this.game.originalDeckSize = deckData.cards.length;
            }
            
            // Ensure deck doesn't exceed original size
            if (this.game.deck && this.game.originalDeckSize > 0 && 
                this.game.deck.cards.length > this.game.originalDeckSize) {
                console.warn(`Deck size ${this.game.deck.cards.length} exceeds original ${this.game.originalDeckSize}, truncating`);
                this.game.deck.cards = this.game.deck.cards.slice(0, this.game.originalDeckSize);
            }
            
            // Update deck manager to refresh the UI (this updates the deck count display)
            if (typeof this.game.updateDeckManager === 'function') {
                this.game.updateDeckManager();
            }
        }
        
        // Update discard pile counter after deck change (cards may have been shuffled back)
        if (this.game && typeof this.game.updateDiscardPileCounter === 'function') {
            setTimeout(() => {
                if (this.game && typeof this.game.updateDiscardPileCounter === 'function') {
                    this.game.updateDiscardPileCounter();
                }
            }, 100);
        }
        
        // Show notification that we're using a remote deck (only if it's a new deck, not a shuffle)
        if (!isShuffle && deckData && deckData.name) {
            this.showRemoteDeckNotification(deckData.name);
        }
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
    
    
    // Legacy method: broadcastCardState - now wraps requestCardStateUpdate for backward compatibility
    broadcastCardState(cardElement, card, privateTo = null, status = null) {
        // Use requestCardStateUpdate (converts to array format)
        // Include location derived from current container to keep server discard membership authoritative
        // Determine location by area (not container), since discard cards are positioned on table
        let isInDiscard = false;
        if (this.game && this.game.discardPileArea) {
            const discardRect = this.game.discardPileArea.getBoundingClientRect();
            const r = cardElement.getBoundingClientRect();
            const cx = r.left + r.width / 2;
            const cy = r.top + r.height / 2;
            isInDiscard = cx >= discardRect.left && cx <= discardRect.right && cy >= discardRect.top && cy <= discardRect.bottom;
        }
        const location = isInDiscard ? 'discardPile' : 'table';
        this.requestCardStateUpdate([{
            uniqueId: cardElement.dataset.uniqueId || card.uniqueId,
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
            isFlipped: isInDiscard ? false : cardElement.classList.contains('flipped'),
            location: location,
            privateTo: privateTo,
            zIndex: parseInt(cardElement.style.zIndex) || 0,
            status: status,
            timestamp: Date.now()
        }]);
    }
    
    // Public methods for game integration
    broadcastResetGame() {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            console.error('WebSocket not connected');
            return;
        }
        
        this.socket.send(JSON.stringify({
            type: 'resetGame',
            playerId: this.playerId,
            roomCode: this.roomCode
        }));
    }
    
    
    broadcastDeckChange(deckId, deckData) {
        // Use requestDeckUpdate instead
        this.requestDeckUpdate(deckId, deckData);
        // Track that this player last broadcast deck change
        this.iLastBroadcastDeck = true;
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
            const timeSinceLastPong = now - this.lastPongTime;
            
            // Check if we haven't received any messages or pongs recently
            if (timeSinceLastMessage > this.connectionTimeout || timeSinceLastPong > this.connectionTimeout) {
                console.warn('Connection health check failed - no messages/pongs received recently');
                this.handleConnectionLoss();
            }
        }, 5000); // Check every 5 seconds
    }
    
    stopHealthCheck() {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
            this.healthCheckInterval = null;
        }
    }
    
    startPingInterval() {
        if (this.pingInterval) return;
        
        this.pingInterval = setInterval(() => {
            if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                this.sendPing();
            }
        }, this.pingIntervalMs);
    }
    
    stopPingInterval() {
        if (this.pingInterval) {
            clearInterval(this.pingInterval);
            this.pingInterval = null;
        }
        if (this.pongTimeout) {
            clearTimeout(this.pongTimeout);
            this.pongTimeout = null;
        }
    }
    
    sendPing() {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            return;
        }
        
        try {
            // Check if we've received any pongs recently
            const now = Date.now();
            const timeSinceLastPong = now - this.lastPongTime;
            
            // If it's been too long since last pong, increment missed counter
            if (this.lastPongTime > 0 && timeSinceLastPong > this.pingIntervalMs * 2) {
                this.missedPongs++;
                console.warn(`Missed pong detected (${this.missedPongs}/${this.maxMissedPongs})`);
                
                if (this.missedPongs >= this.maxMissedPongs) {
                    console.error('Too many missed pongs, connection appears dead');
                    this.handleConnectionLoss();
                    return;
                }
            }
            
            // Send ping as JSON message (fallback if binary ping not supported)
            this.socket.send(JSON.stringify({ type: 'ping' }));
            
            // Set timeout to wait for pong
            this.pongTimeout = setTimeout(() => {
                const now = Date.now();
                const timeSinceLastPong = now - this.lastPongTime;
                
                // If we haven't received a pong within the timeout period, connection may be dead
                if (timeSinceLastPong > this.pongTimeoutMs) {
                    console.warn('Pong timeout - connection may be dead');
                    this.missedPongs++;
                    if (this.missedPongs >= this.maxMissedPongs) {
                        this.handleConnectionLoss();
                    }
                }
            }, this.pongTimeoutMs);
        } catch (error) {
            console.error('Failed to send ping:', error);
            this.handleConnectionLoss();
        }
    }
    
    handlePong() {
        // Update last pong time and message time (indicates connection is alive)
        const now = Date.now();
        this.lastPongTime = now;
        this.lastMessageTime = now; // Any message indicates connection is alive
        
        // Reset missed pongs counter on successful pong
        this.missedPongs = 0;
        
        // Clear pong timeout
        if (this.pongTimeout) {
            clearTimeout(this.pongTimeout);
            this.pongTimeout = null;
        }
    }
    
    handleConnectionLoss() {
        console.log('Handling connection loss...');
        this.updateConnectionStatus('offline');
        this.stopPingInterval();
        this.stopHealthCheck();
        
        // Close existing socket if still open
        if (this.socket) {
            try {
                this.socket.close();
            } catch (error) {
                // Ignore errors when closing
            }
        }
        
        // Schedule reconnection with exponential backoff
        if (this.roomCode && !this.reconnecting) {
            this.scheduleReconnect();
        }
    }
    
    scheduleReconnect() {
        if (this.reconnecting) {
            return; // Already reconnecting
        }
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('Max reconnection attempts reached, giving up');
            this.showErrorNotification('Connection lost. Please refresh the page to reconnect.');
            return;
        }
        
        this.reconnecting = true;
        this.reconnectAttempts++;
        
        // Calculate delay with exponential backoff
        const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), this.maxReconnectDelay);
        
        console.log(`Scheduling reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
        
        // Clear any existing reconnect timer
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
        }
        
        this.reconnectTimer = setTimeout(() => {
            this.reconnecting = false;
            if (this.roomCode) {
                console.log(`Reconnection attempt ${this.reconnectAttempts}`);
                this.connectToWebSocketServer();
            }
        }, delay);
    }
    
    onReconnection() {
        console.log('Reconnected, requesting full state...');
        
        // Send join room message again (will receive full state)
        this.roomCreationAttempted = false; // Reset to allow rejoin
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            // Send join room message
            this.socket.send(JSON.stringify({
                type: 'joinRoom',
                roomCode: this.roomCode,
                playerId: this.playerId,
                playerName: this.playerAlias
            }));
            
            // Send queued messages after a short delay
            setTimeout(() => {
                this.flushMessageQueue();
            }, 1000);
        }
    }
    
    // Send queued messages when connection is restored
    flushMessageQueue() {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            return;
        }
        
        if (this.messageQueue.length === 0) {
            return;
        }
        
        console.log(`Flushing ${this.messageQueue.length} queued messages...`);
        
        while (this.messageQueue.length > 0) {
            const message = this.messageQueue.shift();
            try {
                // Use direct socket send for queued messages
                this.socket.send(JSON.stringify({
                    ...message,
                    playerId: this.playerId,
                    roomCode: this.roomCode
                }));
            } catch (error) {
                console.error('Failed to send queued message:', error);
                // Put it back at the front of the queue
                this.messageQueue.unshift(message);
                break;
            }
        }
        
        // Request full state to ensure sync after sending queued messages
        this.requestFullState();
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
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        this.stopPingInterval();
        this.stopHealthCheck();
        this.stopPeriodicSync();
        this.stopStateValidation();
        this.messageQueue = [];
        this.reconnecting = false;
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
        this.missedPongs = 0; // Reset missed pongs
        this.updateConnectionStatus('offline');
        this.connectedPlayers.clear();
        this.updatePlayerCount();
    }
}

