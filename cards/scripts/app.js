// The Nomad Card Game - Main Application
class CardGame {
    constructor() {
        this.deck = null;
        this.dealtCards = [];
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        this.selectedCard = null;
        this.preventTableClick = false;
        
        // Deck management
        this.customDecks = new Map();
        this.currentDeckId = 'standard';
        this.editingDeckId = null;
        
        // Multiplayer
        this.multiplayer = null;
        this.cardIdCounter = 0;
        this.zIndexCounter = 0;
        
        // Private hand system
        this.privateHands = new Map(); // playerId -> { cards: [], count: number }
        this.privateHandZone = null;
        
        this.init();
    }

    init() {
        // Initialize our custom card system
        cards.init({ table: '#card-table' });
        
        // Load saved decks from localStorage
        this.loadDecksFromStorage();
        
        // Create and setup deck
        this.setupDeck();
        
        // Setup event listeners
        this.setupEventListeners();
        this.setupDeckManagementListeners();
        
        // Initialize multiplayer
        this.initializeMultiplayer();
        
        // Initialize private hand system
        this.initializePrivateHand();
        
        // Initial render
        this.renderDeck();
        this.updateDeckManager();
        
        console.log('Card game initialized successfully!');
    }

    setupDeck() {
        // Try to restore the last selected deck
        const lastDeckId = this.getLastSelectedDeck();
        if (lastDeckId && this.isValidDeckId(lastDeckId)) {
            this.loadDeck(lastDeckId);
        } else {
            // Default to standard deck
            this.deck = new cards.Deck();
            this.deck.shuffle();
            this.currentDeckId = 'standard';
        }
    }

    setupEventListeners() {
        // Control buttons
        document.getElementById('reset-btn').addEventListener('click', () => this.resetGame());

        // Card table for dealing
        document.getElementById('card-table').addEventListener('click', (e) => {
            // Only deal if clicking directly on the table (not on cards) and not dragging
            if (e.target.id === 'card-table' && !this.isDragging && !this.preventTableClick && !e.defaultPrevented) {
                this.dealCardToPosition(e.clientX, e.clientY);
            }
        });
    }

    renderDeck() {
        // Clear existing deck
        const table = document.getElementById('card-table');
        const existingDeck = table.querySelector('.deck');
        if (existingDeck) {
            existingDeck.remove();
        }

        // Create deck element
        const deckElement = document.createElement('div');
        deckElement.className = 'deck';
        deckElement.innerHTML = `
            <div class="card-back">
                <div class="card-back-pattern">
                    <div class="card-back-center">♠</div>
                    <div class="card-back-corners">
                        <div class="corner top-left">♠</div>
                        <div class="corner top-right">♠</div>
                        <div class="corner bottom-left">♠</div>
                        <div class="corner bottom-right">♠</div>
                    </div>
                </div>
                <div class="deck-count">${this.deck.cards.length}</div>
            </div>
        `;
        
        // Position deck in center
        deckElement.style.position = 'absolute';
        deckElement.style.top = '50%';
        deckElement.style.left = '50%';
        deckElement.style.transform = 'translate(-50%, -50%)';
        
        // Add click handler for dealing
        deckElement.addEventListener('click', () => this.dealCard());
        
        table.appendChild(deckElement);
    }

    dealCard() {
        if (this.deck.cards.length === 0) {
            alert('No more cards in deck!');
            return;
        }

        const card = this.deck.cards.pop();
        this.dealtCards.push(card);
        
        // Create card element
        const cardElement = this.createCardElement(this.deck, card);
        
        // Position card near deck
        const table = document.getElementById('card-table');
        const tableRect = table.getBoundingClientRect();
        const centerX = tableRect.width / 2;
        const centerY = tableRect.height / 2;
        
        // Random position around center
        const angle = Math.random() * Math.PI * 2;
        const distance = 100 + Math.random() * 50;
        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance;
        
        cardElement.style.left = x + 'px';
        cardElement.style.top = y + 'px';
        
        table.appendChild(cardElement);
        
        // Update deck display
        this.renderDeck();
        
        // Add interaction handlers
        this.addCardInteractions(cardElement, card);
        
        // Broadcast card deal to other players
        if (this.multiplayer && this.multiplayer.connectionStatus === 'connected') {
            const cardId = cardElement.dataset.cardId;
            this.multiplayer.broadcastCardDeal(cardId, card, x, y, this.deck.cards);
        }
    }
    
    positionCardElement(cardElement) {
        // Position card near deck
        const table = document.getElementById('card-table');
        const tableRect = table.getBoundingClientRect();
        const centerX = tableRect.width / 2;
        const centerY = tableRect.height / 2;
        
        // Random position around center
        const angle = Math.random() * Math.PI * 2;
        const distance = 100 + Math.random() * 50;
        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance;
        
        cardElement.style.left = x + 'px';
        cardElement.style.top = y + 'px';
    }
    
    dealSpecificCard(deck, card) {
        // Deal a specific card (for multiplayer synchronization)
        this.dealtCards.push(card);
        
        // Create card element
        const cardElement = this.createCardElement(deck, card);
        this.positionCardElement(cardElement);
        
        document.getElementById('card-table').appendChild(cardElement);
        
        // Add interaction handlers
        this.addCardInteractions(cardElement, card);
    }

    dealCardToPosition(x, y) {
        if (this.deck.cards.length === 0) {
            alert('No more cards in deck!');
            return;
        }

        const card = this.deck.cards.pop();
        this.dealtCards.push(card);
        
        const cardElement = this.createCardElement(this.deck, card);
        const table = document.getElementById('card-table');
        const tableRect = table.getBoundingClientRect();
        
        // Convert screen coordinates to table coordinates
        const relativeX = x - tableRect.left;
        const relativeY = y - tableRect.top;
        
        cardElement.style.left = relativeX + 'px';
        cardElement.style.top = relativeY + 'px';
        
        table.appendChild(cardElement);
        this.addCardInteractions(cardElement, card);
        this.renderDeck();
        
        // Broadcast card deal to other players
        if (this.multiplayer && this.multiplayer.connectionStatus === 'connected') {
            const cardId = cardElement.dataset.cardId;
            this.multiplayer.broadcastCardDeal(cardId, card, relativeX, relativeY, this.deck.cards);
        }
    }

    createCardElement(deck, card) {
        // Defensive programming - ensure card has required properties
        if (!card) {
            console.error('createCardElement called with null/undefined card');
            return null;
        }
        
        // Ensure card has required properties with defaults
        const safeCard = {
            title: card.title || 'Card',
            description: card.description || '',
            image: card.image || '',
            emoji: card.emoji || '?',
            color: card.color || '',
            faceUp: card.faceUp || false
        };
        
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.dataset.title = safeCard.title;
        cardElement.dataset.cardId = `card_${++this.cardIdCounter}`;
        
        // Set z-index to bring new card to front
        cardElement.style.zIndex = ++this.zIndexCounter;
        
        // Add color class for styling
        if (safeCard.color) {
            cardElement.classList.add(`card-${safeCard.color}`);
        }
        
        // Create card face
        const cardFace = document.createElement('div');
        cardFace.className = 'card-face';
        
        // Use card properties
        const displaySymbol = safeCard.emoji || '?';
        const displayTitle = safeCard.title || 'Card';
        const cardColor = this.getCardColor(safeCard.color);
        
        cardFace.style.backgroundColor = cardColor;
        cardFace.style.color = '#333';
        
        cardFace.innerHTML = `
            <div style="font-size: 14px; color: #333;">${displayTitle}</div>
            <div style="font-size: 24px;">${displaySymbol}</div>
            ${deck.invertTitle ? `<div style="font-size: 14px; transform: rotate(180deg); color: #333;">${displayTitle}</div>` : ''}
            ${safeCard.description ? `<div style="font-size: 8px; color: #333; margin-top: 2px; opacity: 0.8;">${safeCard.description}</div>` : ''}
        `;
        
        // Create card back
        const cardBack = document.createElement('div');
        cardBack.className = 'card-back';
        cardBack.innerHTML = `
            <div class="card-back-pattern">
                <div class="card-back-center">♠</div>
                <div class="card-back-corners">
                    <div class="corner top-left">♠</div>
                    <div class="corner top-right">♠</div>
                    <div class="corner bottom-left">♠</div>
                    <div class="corner bottom-right">♠</div>
                </div>
            </div>
        `;
        
        cardElement.appendChild(cardFace);
        cardElement.appendChild(cardBack);
        
        // Start with card face down
        cardElement.classList.add('flipped');
        
        return cardElement;
    }
    
    getCardColor(color) {
        const colorMap = {
            'red': '#dc2626',
            'blue': '#2563eb', 
            'green': '#16a34a',
            'yellow': '#ca8a04',
            'wild': '#9333ea',
            'neutral': '#FFF'
        };
        return colorMap[color] || '#FFF';
    }


    addCardInteractions(cardElement, card) {
        let isDragging = false;
        let startX, startY, initialX, initialY;
        let dragThreshold = 5; // Minimum distance to start dragging
        let mouseDownTime = 0;
        let offsetX = 0, offsetY = 0; // Offset from mouse to card corner

        // Mouse events
        cardElement.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            isDragging = false;
            this.isDragging = false;
            startX = e.clientX;
            startY = e.clientY;
            mouseDownTime = Date.now();
            
            const rect = cardElement.getBoundingClientRect();
            initialX = rect.left;
            initialY = rect.top;
            
            // Calculate offset from mouse to card corner
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
            
            // Bring card to front when starting to drag
            cardElement.style.zIndex = ++this.zIndexCounter;
        });

        // Use document mousemove to track mouse even outside card
        document.addEventListener('mousemove', (e) => {
            if (startX !== undefined && startY !== undefined) {
                const deltaX = e.clientX - startX;
                const deltaY = e.clientY - startY;
                
                if (Math.abs(deltaX) > dragThreshold || Math.abs(deltaY) > dragThreshold) {
                    if (!isDragging) {
                        isDragging = true;
                        this.isDragging = true;
                        cardElement.classList.add('dragging');
                    }
                    
                    // Calculate new position relative to the initial position
                    const newX = initialX + deltaX;
                    const newY = initialY + deltaY;
                    
                    
                    // Update position directly using left/top
                    cardElement.style.left = newX + 'px';
                    cardElement.style.top = newY + 'px';
                }
            }
        });

        document.addEventListener('mouseup', (e) => {
            if (startX !== undefined && startY !== undefined) {
                const clickDuration = Date.now() - mouseDownTime;
                
                
                if (isDragging) {
                    cardElement.classList.remove('dragging');
                    isDragging = false;
                    this.isDragging = false;
                    
                    // Check if card was dropped in private hand zone
                    const privateHandZone = document.getElementById('private-hand-zone');
                    if (!privateHandZone) {
                        console.error('Private hand zone not found!');
                        return;
                    }
                    const cardRect = cardElement.getBoundingClientRect();
                    const zoneRect = privateHandZone.getBoundingClientRect();
                    
                    // Check if the center of the card is within the private hand zone
                    const cardCenterX = cardRect.left + cardRect.width / 2;
                    const cardCenterY = cardRect.top + cardRect.height / 2;
                    
                    const isInPrivateZone = cardCenterX >= zoneRect.left && 
                                          cardCenterX <= zoneRect.right && 
                                          cardCenterY >= zoneRect.top && 
                                          cardCenterY <= zoneRect.bottom;
                    
                    // Broadcast card movement to other players
                    if (this.multiplayer && this.multiplayer.connectionStatus === 'connected') {
                        const cardId = cardElement.dataset.cardId;
                        const x = parseInt(cardElement.style.left) || 0;
                        const y = parseInt(cardElement.style.top) || 0;
                        this.multiplayer.broadcastCardMove(cardId, x, y);
                    }
                    if (isInPrivateZone) {
                        // Add card to private hand if not already
                        if (!this.isCardInPrivateHand(card)) {
                            this.addCardToPrivateHand(cardElement, card);
                        }
                    } else {
                        // Remove from private hand if it was there
                        if (this.isCardInPrivateHand(card)) {
                            this.removeCardFromPrivateHand(card);
                        }
                        
                        // Ensure z-index is maintained after drag ends
                        cardElement.style.zIndex = this.zIndexCounter;
                    }
                    
                    // Prevent table click event after dragging
                    e.preventDefault();
                    e.stopPropagation();
                    // Set a flag to prevent table click for a short time
                    this.preventTableClick = true;
                    setTimeout(() => {
                        this.preventTableClick = false;
                    }, 100);
                } else if (clickDuration < 200) { // Short click without drag
                    // Click without drag - flip card
                    this.flipCard(cardElement);
                }
                
                // Reset tracking variables
                startX = undefined;
                startY = undefined;
            }
        });

        // Right-click to shuffle card back into deck
        cardElement.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Shuffle the card back into the deck
            this.shuffleCardBackToDeck(cardElement, card);
        });

        // Touch events for mobile
        cardElement.addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
            
            const rect = cardElement.getBoundingClientRect();
            initialX = rect.left;
            initialY = rect.top;
        });

        document.addEventListener('touchmove', (e) => {
            if (startX !== undefined && startY !== undefined) {
                e.preventDefault();
                const touch = e.touches[0];
                const deltaX = touch.clientX - startX;
                const deltaY = touch.clientY - startY;
                
                if (Math.abs(deltaX) > dragThreshold || Math.abs(deltaY) > dragThreshold) {
                    if (!isDragging) {
                        isDragging = true;
                        this.isDragging = true;
                        cardElement.classList.add('dragging');
                    }
                    
                    // Convert to table coordinates
                    const table = document.getElementById('card-table');
                    const tableRect = table.getBoundingClientRect();
                    const newX = touch.clientX - tableRect.left - 30;
                    const newY = touch.clientY - tableRect.top - 42;
                    
                    cardElement.style.left = newX + 'px';
                    cardElement.style.top = newY + 'px';
                }
            }
        });

        document.addEventListener('touchend', (e) => {
            if (startX !== undefined && startY !== undefined) {
                if (isDragging) {
                    cardElement.classList.remove('dragging');
                    isDragging = false;
                    this.isDragging = false;
                    
                    // Check if card was dropped in private hand zone (touch)
                    const privateHandZone = document.getElementById('private-hand-zone');
                    if (privateHandZone) {
                        const cardRect = cardElement.getBoundingClientRect();
                        const zoneRect = privateHandZone.getBoundingClientRect();
                        
                        // Check if the center of the card is within the private hand zone
                        const cardCenterX = cardRect.left + cardRect.width / 2;
                        const cardCenterY = cardRect.top + cardRect.height / 2;
                        
                        const isInPrivateZone = cardCenterX >= zoneRect.left && 
                                              cardCenterX <= zoneRect.right && 
                                              cardCenterY >= zoneRect.top && 
                                              cardCenterY <= zoneRect.bottom;
                        
                        console.log('Touch private zone detection:', {
                            cardCenterX, cardCenterY,
                            zoneRect: { left: zoneRect.left, right: zoneRect.right, top: zoneRect.top, bottom: zoneRect.bottom },
                            isInPrivateZone
                        });
                        
                        if (isInPrivateZone) {
                            // Add card to private hand if not already
                            if (!this.isCardInPrivateHand(card)) {
                                this.addCardToPrivateHand(cardElement, card);
                            }
                        } else {
                            // Remove from private hand if it was there
                            if (this.isCardInPrivateHand(card)) {
                                this.removeCardFromPrivateHand(card);
                            }
                        }
                    }
                } else {
                    this.flipCard(cardElement);
                }
                
                startX = undefined;
                startY = undefined;
            }
        });
    }

    flipCard(cardElement) {
        cardElement.classList.toggle('flipped');
        
        // Broadcast card flip to other players
        if (this.multiplayer && this.multiplayer.connectionStatus === 'connected') {
            const cardId = cardElement.dataset.cardId;
            this.multiplayer.broadcastCardFlip(cardId);
        }
        
        // Add flip animation
        cardElement.classList.add('card-flipping');
        setTimeout(() => {
            cardElement.classList.remove('card-flipping');
        }, 600);
    }

    shuffleCardBackToDeck(cardElement, card) {
        // Broadcast card shuffle to other players with card data and deck state
        if (this.multiplayer && this.multiplayer.connectionStatus === 'connected') {
            const cardId = cardElement.dataset.cardId;
            this.multiplayer.broadcastCardShuffle(cardId, card, this.deck.cards);
        }
        
        // Add the card back to the deck
        this.deck.addCard(card);
        
        // Shuffle the deck to randomize the card's position
        this.deck.shuffle();
        
        // Remove the card from the table
        cardElement.remove();
        
        // Update the deck display
        this.renderDeck();
        
        // Show a brief visual feedback
        this.showShuffleFeedback();
    }

    showShuffleFeedback() {
        // Create a temporary feedback element
        const feedback = document.createElement('div');
        feedback.textContent = 'Card shuffled back to deck!';
        feedback.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 10px 15px;
            border-radius: 5px;
            font-weight: bold;
            z-index: 10000;
            animation: fadeInOut 2s ease-in-out;
        `;
        
        // Add the animation CSS if not already present
        if (!document.getElementById('shuffle-feedback-styles')) {
            const style = document.createElement('style');
            style.id = 'shuffle-feedback-styles';
            style.textContent = `
                @keyframes fadeInOut {
                    0% { opacity: 0; transform: translateY(-10px); }
                    20% { opacity: 1; transform: translateY(0); }
                    80% { opacity: 1; transform: translateY(0); }
                    100% { opacity: 0; transform: translateY(-10px); }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(feedback);
        
        // Remove the feedback after animation
        setTimeout(() => {
            feedback.remove();
        }, 2000);
    }

    shuffleDeck() {
        this.deck.shuffle();
        this.renderDeck();
        console.log('Deck shuffled!');
        
        // Broadcast deck shuffle to other players
        if (this.multiplayer && this.multiplayer.connectionStatus === 'connected') {
            this.multiplayer.broadcastDeckShuffle();
        }
    }

    resetGame() {
        // Clear dealt cards
        const table = document.getElementById('card-table');
        const cardElements = table.querySelectorAll('.card');
        cardElements.forEach(card => card.remove());
        
        // Reset deck
        this.deck = new cards.Deck();
        this.deck.shuffle();
        this.dealtCards = [];
        
        // Reset private hands
        this.privateHands.clear();
        const playerId = this.multiplayer ? this.multiplayer.playerId : 'local';
        this.privateHands.set(playerId, { cards: [], count: 0 });
        this.updatePrivateHandDisplay();
        
        // Re-render deck
        this.renderDeck();
        
        // Broadcast reset game to other players
        if (this.multiplayer && this.multiplayer.connectionStatus === 'connected') {
            this.multiplayer.broadcastResetGame();
        }
        
        console.log('Game reset!');
    }

    // ===== MULTIPLAYER METHODS =====
    
    initializeMultiplayer() {
        this.multiplayer = new MultiplayerManager(this);
        
        // Enable test mode for easier testing
        this.multiplayer.enableTestMode();
    }
    
    // ===== DECK MANAGEMENT METHODS =====
    
    setupDeckManagementListeners() {
        // Menu toggle
        document.getElementById('menu-toggle').addEventListener('click', () => this.toggleSideMenu());
        document.getElementById('menu-close').addEventListener('click', () => this.closeSideMenu());
        
        // Deck management buttons
        document.getElementById('create-deck-btn').addEventListener('click', () => this.openDeckEditor());
        document.getElementById('import-btn').addEventListener('click', () => this.importDeck());
        document.getElementById('export-btn').addEventListener('click', () => this.exportCurrentDeck());
        
        // Modal controls
        document.getElementById('modal-close').addEventListener('click', () => this.closeDeckEditor());
        document.getElementById('cancel-deck-btn').addEventListener('click', () => this.closeDeckEditor());
        document.getElementById('save-deck-btn').addEventListener('click', () => this.saveDeck());
        
        // File input
        document.getElementById('import-deck').addEventListener('change', (e) => this.handleFileImport(e));
        
        // Click outside to close
        document.getElementById('modal-overlay').addEventListener('click', () => this.closeDeckEditor());
    }
    
    toggleSideMenu() {
        const sideMenu = document.getElementById('side-menu');
        sideMenu.classList.toggle('open');
    }
    
    closeSideMenu() {
        const sideMenu = document.getElementById('side-menu');
        sideMenu.classList.remove('open');
    }
    
    loadDecksFromStorage() {
        try {
            const savedDecks = localStorage.getItem('customDecks');
            if (savedDecks) {
                const decks = JSON.parse(savedDecks);
                this.customDecks = new Map(Object.entries(decks));
            }
            
            // Add Virus deck as a default deck if it doesn't exist
            if (!this.customDecks.has('virus')) {
                this.customDecks.set('virus', this.getVirusDeckData());
            }
        } catch (error) {
            console.error('Error loading decks from storage:', error);
        }
    }
    
    saveDecksToStorage() {
        try {
            const decksObject = Object.fromEntries(this.customDecks);
            localStorage.setItem('customDecks', JSON.stringify(decksObject));
        } catch (error) {
            console.error('Error saving decks to storage:', error);
        }
    }
    
    saveLastSelectedDeck(deckId) {
        try {
            localStorage.setItem('lastSelectedDeck', deckId);
        } catch (error) {
            console.error('Error saving last selected deck:', error);
        }
    }
    
    getLastSelectedDeck() {
        try {
            return localStorage.getItem('lastSelectedDeck');
        } catch (error) {
            console.error('Error getting last selected deck:', error);
            return null;
        }
    }
    
    isValidDeckId(deckId) {
        // Check if the deck ID is valid (standard, virus, or exists in customDecks)
        return deckId === 'standard' || 
               deckId === 'virus' || 
               this.customDecks.has(deckId);
    }
    
    clearBoard() {
        // Remove all cards from the table (except the deck)
        const cardTable = document.getElementById('card-table');
        const cards = cardTable.querySelectorAll('.card:not(.deck)');
        cards.forEach(card => card.remove());
        
        // Clear the dealt cards array
        this.dealtCards = [];
    }
    
    updateDeckManager() {
        this.updateCurrentDeckInfo();
        this.updateGameInfo();
        this.updateDeckList();
    }
    
    updateCurrentDeckInfo() {
        const deckName = this.deck.name || 'Standard Deck';
        const deckCount = this.deck.cards.length;
        
        document.getElementById('current-deck-name').textContent = deckName;
        document.getElementById('current-deck-count').textContent = `${deckCount} cards`;
    }
    
    updateGameInfo() {
        const gameTitle = this.deck.name || 'Cards - Custom Deck Manager';
        const gameDescription = this.deck.description || 'Click and drag cards to move them. Click (without dragging) to flip cards. Right-click to shuffle cards back into the deck.';
        
        // Update sidebar game info
        document.getElementById('current-game-title').textContent = gameTitle;
        document.getElementById('current-game-description').textContent = gameDescription;
        
        // Update main game info
        document.getElementById('main-game-title').textContent = gameTitle;
        document.getElementById('main-game-description').textContent = gameDescription;
    }
    
    updateDeckList() {
        const deckList = document.getElementById('deck-list');
        deckList.innerHTML = '';
        
        // Add standard deck
        const standardItem = this.createDeckItem('standard', 'Standard Deck', 52, true);
        deckList.appendChild(standardItem);
        
        // Add virus deck as default with correct count
        const virusDeckData = this.getVirusDeckData();
        const virusDeck = new Deck(virusDeckData);
        const virusItem = this.createDeckItem('virus', virusDeck.name, virusDeck.cards.length, true);
        deckList.appendChild(virusItem);
        
        // Add custom decks (excluding virus deck since it's already added as default)
        this.customDecks.forEach((deckData, deckId) => {
            if (deckId !== 'virus') {
                const customDeck = new Deck(deckData);
                const deckItem = this.createDeckItem(deckId, deckData.name, customDeck.cards.length, false);
                deckList.appendChild(deckItem);
            }
        });
    }
    
    createDeckItem(deckId, name, count, isStandard = false) {
        const item = document.createElement('div');
        item.className = `deck-item ${deckId === this.currentDeckId ? 'active' : ''}`;
        item.dataset.deckId = deckId;
        
        item.innerHTML = `
            <div class="deck-item-info">
                <div class="deck-item-name">${name}</div>
                <div class="deck-item-count">${count} cards</div>
            </div>
            <div class="deck-item-actions">
                ${!isStandard ? `
                    <button class="btn-small btn-edit" onclick="cardGame.editDeck('${deckId}')">Edit</button>
                    <button class="btn-small btn-delete" onclick="cardGame.deleteDeck('${deckId}')">Delete</button>
                ` : ''}
            </div>
        `;
        
        item.addEventListener('click', (e) => {
            if (!e.target.classList.contains('btn-small')) {
                this.loadDeck(deckId);
            }
        });
        
        return item;
    }
    
    loadDeck(deckId) {
        // Clear any existing cards from the board
        this.clearBoard();
        
        if (deckId === 'standard') {
            this.deck = new cards.Deck();
            this.deck.setMetadata('Standard Deck', 'Standard 52-card deck');
        } else if (deckId === 'virus') {
            const virusDeckData = this.getVirusDeckData();
            this.deck = new cards.Deck(virusDeckData);
        } else if (this.customDecks.has(deckId)) {
            const deckData = this.customDecks.get(deckId);
            this.deck = new cards.Deck(deckData);
        } else {
            console.error('Deck not found:', deckId);
            return;
        }
        
        this.currentDeckId = deckId;
        this.deck.shuffle();
        this.dealtCards = [];
        this.renderDeck();
        this.updateDeckManager();
        
        // Store the last selected deck in localStorage
        this.saveLastSelectedDeck(deckId);
        
        console.log(`Loaded deck: ${this.deck.name}`);
    }
    
    openDeckEditor(deckId = null) {
        this.editingDeckId = deckId;
        const modal = document.getElementById('deck-editor-modal');
        const overlay = document.getElementById('modal-overlay');
        const title = document.getElementById('modal-title');
        
        if (deckId && this.customDecks.has(deckId)) {
            // Editing existing deck
            const deckData = this.customDecks.get(deckId);
            title.textContent = 'Edit Deck';
            document.getElementById('deck-name').value = deckData.name;
            document.getElementById('deck-description').value = deckData.description;
            document.getElementById('deck-json').value = JSON.stringify(deckData, null, 2);
        } else {
            // Creating new deck
            title.textContent = 'Create New Deck';
            document.getElementById('deck-name').value = '';
            document.getElementById('deck-description').value = '';
            document.getElementById('deck-json').value = this.getDefaultDeckJSON();
        }
        
        modal.classList.add('show');
        overlay.classList.add('show');
    }
    
    closeDeckEditor() {
        const modal = document.getElementById('deck-editor-modal');
        const overlay = document.getElementById('modal-overlay');
        modal.classList.remove('show');
        overlay.classList.remove('show');
        this.editingDeckId = null;
    }
    
    editDeck(deckId) {
        this.openDeckEditor(deckId);
    }
    
    deleteDeck(deckId) {
        if (confirm('Are you sure you want to delete this deck?')) {
            this.customDecks.delete(deckId);
            this.saveDecksToStorage();
            this.updateDeckManager();
            
            // If we're currently using this deck, switch to standard
            if (this.currentDeckId === deckId) {
                this.loadDeck('standard');
            }
        }
    }
    
    saveDeck() {
        const name = document.getElementById('deck-name').value.trim();
        const description = document.getElementById('deck-description').value.trim();
        const jsonText = document.getElementById('deck-json').value.trim();
        
        if (!name) {
            alert('Please enter a deck name');
            return;
        }
        
        if (!jsonText) {
            alert('Please enter deck JSON data');
            return;
        }
        
        try {
            const deckData = JSON.parse(jsonText);
            
            // Validate deck data
            if (!deckData.cards || !Array.isArray(deckData.cards)) {
                alert('Invalid deck format. Must include a "cards" array.');
                return;
            }
            
            // Update metadata
            deckData.name = name;
            deckData.description = description;
            
            // Generate unique ID
            const deckId = this.editingDeckId || `deck_${Date.now()}`;
            
            // Save deck
            this.customDecks.set(deckId, deckData);
            this.saveDecksToStorage();
            
            // Load the new deck
            this.loadDeck(deckId);
            
            this.closeDeckEditor();
            this.updateDeckManager();
            
            console.log(`Saved deck: ${name}`);
        } catch (error) {
            alert('Invalid JSON format: ' + error.message);
        }
    }
    
    importDeck() {
        document.getElementById('import-deck').click();
    }
    
    handleFileImport(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const deckData = JSON.parse(e.target.result);
                
                // Validate deck data
                if (!deckData.cards || !Array.isArray(deckData.cards)) {
                    alert('Invalid deck file. Must include a "cards" array.');
                    return;
                }
                
                // Generate unique ID and name
                const deckId = `imported_${Date.now()}`;
                if (!deckData.name) {
                    deckData.name = `Imported Deck ${new Date().toLocaleDateString()}`;
                }
                
                // Save deck
                this.customDecks.set(deckId, deckData);
                this.saveDecksToStorage();
                
                // Load the imported deck
                this.loadDeck(deckId);
                this.updateDeckManager();
                
                console.log(`Imported deck: ${deckData.name}`);
            } catch (error) {
                alert('Error importing deck: ' + error.message);
            }
        };
        reader.readAsText(file);
        
        // Reset file input
        event.target.value = '';
    }
    
    exportCurrentDeck() {
        const deckData = this.deck.exportToJSON();
        const blob = new Blob([JSON.stringify(deckData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${deckData.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    getDefaultDeckJSON() {
        return JSON.stringify({
            "name": "My Custom Deck",
            "description": "A custom deck with unique cards",
            "cards": [
                {
                    "title": "Ace of Hearts",
                    "description": "The ace of hearts",
                    "emoji": "❤️"
                },
                {
                    "title": "King of Spades",
                    "description": "The king of spades",
                    "emoji": "♠️"
                },
                {
                    "title": "K",
                    "description": "",
                    "emoji": "♠️"
                }
            ]
        }, null, 2);
    }
    
    getVirusDeckData() {
        return {
            "name": "Virus Deck",
            "description": "Official Virus card game deck - 68 cards",
            "invertTitle": false,
            "cards": [
                // Organ Cards (5 total) - 1 of each color + 1 Wild
                {"title": "Heart", "color": "red", "emoji": "🫀", "count": 4},
                {"title": "Lungs", "color": "green", "emoji": "🫁", "count": 4},
                {"title": "Brain", "color": "blue", "emoji": "🧠", "count": 4},
                {"title": "Bones", "color": "yellow", "emoji": "🦴", "count": 4},
                {"title": "Any", "color": "wild", "emoji": "👤", "count": 4},
                
                // Virus Cards (20 total) - 4 of each color
                {"title": "Heart", "color": "red", "emoji": "🦠", "count": 4},
                {"title": "Brain", "color": "blue", "emoji": "🦠", "count": 4},
                {"title": "Stomach", "color": "green", "emoji": "🦠", "count": 4},
                {"title": "Bone", "color": "yellow", "emoji": "🦠", "count": 4},
                {"title": "Any", "color": "wild", "emoji": "🦠", "count": 1},
                
                // Medicine Cards (20 total) - 4 of each color
                {"title": "Heart", "color": "red", "emoji": "💊", "count": 4},
                {"title": "Brain", "color": "blue", "emoji": "💊", "count": 4},
                {"title": "Stomach", "color": "green", "emoji": "💊", "count": 4},
                {"title": "Bone", "color": "yellow", "emoji": "💊", "count": 4},
                {"title": "Any", "color": "wild", "emoji": "💊", "count": 1},
                
                // Treatment Cards (23 total) - Various types
                {"title": "Transplant", "description": "Exchange an organ with another player", "color": "neutral", "emoji": "🔄", "count": 4},
                {"title": "Organ Thief", "description": "Steal an organ from another player", "color": "neutral", "emoji": "🥷", "count": 4},
                {"title": "Contagion", "description": "Transfer viruses to other players", "color": "neutral", "emoji": "☣️", "count": 4},
                {"title": "Latex Glove", "description": "All players discard their hand", "color": "neutral", "emoji": "🧤", "count": 4},
                {"title": "Medical Error", "description": "Swap your entire body with another player", "color": "neutral", "emoji": "👥", "count": 4},
            ]
        };
    }
    
    // Private Hand System Methods
    initializePrivateHand() {
        this.privateHandZone = document.getElementById('private-hand-zone');
        // Initialize with empty map, will be set when multiplayer connects
        this.updatePrivateHandDisplay();
    }
    
    isCardInPrivateHand(card) {
        const localHand = this.getPrivateHand();
        for (let i = 0; i < localHand.cards.length; i++) {
            const privCard = localHand.cards[i];
            if (privCard == card) {
                return true;
            }
        }
        return false;
    }

    getPrivateHand() {
        const playerId = this.multiplayer ? this.multiplayer.playerId : 'local';
        if (!this.privateHands.has(playerId)) {
            this.privateHands.set(playerId, { cards: [], count: 0 });
        }
        return this.privateHands.get(playerId);
    }
    
    addCardToPrivateHand(cardElement, card) {
        // Add to local private hand
        const localHand = getPrivateHand();
        localHand.cards.push(card);
        localHand.count = localHand.cards.length;
        
        // Update display   
        this.updatePrivateHandDisplay();
        
        // Broadcast to other players
        if (this.multiplayer) {
            this.multiplayer.broadcastPrivateHandUpdate(this.multiplayer.playerId, localHand.count);
        }
    }
    
    removeCardFromPrivateHand(card) {
        const localHand = getPrivateHand();
        for (let i = 0; i < localHand.cards.length; i++) {
            const privCard = localHand.cards[i];
            if (privCard == card) {
                localHand.cards.delete(i);
            }
        }
        localHand.count = localHand.cards.length;
        // Broadcast to other players
        if (this.multiplayer) {
            this.multiplayer.broadcastPrivateHandUpdate(this.multiplayer.playerId, localHand.count);
        }
    }
    
    updatePrivateHandDisplay() {
        // Update your own hand count
        const yourHandCount = document.getElementById('your-hand-count');
        const playerId = this.multiplayer ? this.multiplayer.playerId : 'local';
        const localHand = this.privateHands.get(playerId);
        yourHandCount.textContent = localHand ? localHand.count : 0;
        
        // Update other players' counts
        this.updateOtherPlayersDisplay();
    }
    
    updateOtherPlayersDisplay() {
        const otherPlayersContainer = document.getElementById('other-players-counts');
        otherPlayersContainer.innerHTML = '';
        
        const currentPlayerId = this.multiplayer ? this.multiplayer.playerId : 'local';
        this.privateHands.forEach((hand, playerId) => {
            if (playerId !== currentPlayerId) {
                const playerItem = document.createElement('div');
                playerItem.className = 'player-count-item';
                playerItem.innerHTML = `
                    <span class="player-id">${playerId}</span>
                    <span class="card-count">${hand.count}</span>
                `;
                otherPlayersContainer.appendChild(playerItem);
            }
        });
    }
    
    updateOtherPlayerPrivateHand(playerId, count) {
        const currentPlayerId = this.multiplayer ? this.multiplayer.playerId : 'local';
        if (playerId === currentPlayerId) return;
        
        // Store the count for this player
        this.privateHands.set(playerId, { cards: [], count: count });
        this.updateOtherPlayersDisplay();
    }
    
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.cardGame = new CardGame();
    console.log('The Nomad Card Game initialized!');
});
