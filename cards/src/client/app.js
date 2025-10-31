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
        this.originalDeckSize = 0; // Track original deck size for server state
        
        // Multiplayer
        this.multiplayer = null;
        this.cardIdCounter = 0;
        this.zIndexCounter = 0;
        
        // Discard pile elements (will be initialized if present in HTML)
        this.discardPileArea = null;
        this.discardPileContent = null;
        
        // Private hand system
        this.privateHandZone = null;
        
        // Multi-card selection state
        this.selectedCards = [];
        this.isSelecting = false;
        this.isDraggingGroup = false;
        this.selectionStart = { x: 0, y: 0 };
        this.selectionCurrent = { x: 0, y: 0 };
        this.selectionRect = null;
        this.dragThreshold = 5; // Minimum distance to start dragging
        
        this.init();
    }
    
    // Get card object from card element
    getCardFromElement(cardElement) {
        // Extract emoji from the card face innerHTML
        const cardFace = cardElement.querySelector('.card-face');
        let emoji = '?';
        if (cardFace) {
            const innerHTML = cardFace.innerHTML;
            // Look for the emoji in the second div (the symbol) - it's the middle div
            const divs = innerHTML.match(/<div[^>]*>([^<]*)<\/div>/g);
            if (divs && divs.length >= 2) {
                // The emoji is in the second div (index 1)
                const emojiMatch = divs[1].match(/<div[^>]*>([^<]*)<\/div>/);
                if (emojiMatch && emojiMatch[1]) {
                    emoji = emojiMatch[1].trim();
                }
            }
        }
        
        return {
            // Include all dataset attributes to preserve complete state
            ...cardElement.dataset,
            // Add computed properties not stored in dataset
            emoji: emoji,
            color: cardElement.classList.toString().match(/card-(\w+)/)?.[1] || '',
        };
    }

    // Centralized helper to position a card inside the discard pile container
    positionCardInDiscardPileElement(cardElement, indexForStacking = null) {
        // Position the card on the card-table centered over the discard pile area, with slight stacking offsets
        if (!this.discardPileArea) return;
        try {
            cardElement.style.position = 'absolute';

            // Count cards conceptually in the discard by area (not container)
            let cardCount = indexForStacking;
            if (cardCount === null) {
                const discardRect = this.discardPileArea.getBoundingClientRect();
                cardCount = Array.from(document.querySelectorAll('.card')).filter((c) => {
                    const r = c.getBoundingClientRect();
                    const cx = r.left + r.width / 2;
                    const cy = r.top + r.height / 2;
                    return cx >= discardRect.left && cx <= discardRect.right && cy >= discardRect.top && cy <= discardRect.bottom;
                }).length;
            }

            const cardWidth = 76;
            const cardHeight = 100;
            // No stacking offset; keep all discarded cards perfectly aligned
            const offsetX = 0;
            const offsetY = 0;

            const containerRect = this.discardPileArea.getBoundingClientRect();
            const containerWidth = containerRect.width || 80;
            const containerHeight = containerRect.height || 120;

            const centerX = Math.max(0, (containerWidth - cardWidth) / 2);
            const centerY = Math.max(0, (containerHeight - cardHeight) / 2);
            const relativeX = Math.max(0, centerX + offsetX);
            const relativeY = Math.max(0, centerY + offsetY);

            // Convert discard area coordinates to table-relative
            const table = document.getElementById('card-table');
            const tableRect = table.getBoundingClientRect();
            const absoluteX = (containerRect.left - tableRect.left) + relativeX;
            const absoluteY = (containerRect.top - tableRect.top) + relativeY;

            cardElement.style.left = absoluteX + 'px';
            cardElement.style.top = absoluteY + 'px';
        } catch (_) {
            // no-op; positioning is best-effort
        }
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
        
        // Ensure board connection status is initialized
        if (this.multiplayer) {
            const initialStatus = this.multiplayer.connectionStatus || 'offline';
            this.multiplayer.updateConnectionStatus(initialStatus);
        }
        
        // Initialize private hand system
        this.initializePrivateHand();
        
        // Initialize discard pile elements if present
        this.discardPileArea = document.getElementById('discard-pile-area');
        this.discardPileContent = document.getElementById('discard-pile-content');
        
        // Setup discard pile button listeners
        this.setupDiscardPileListeners();
        
        // Discard pile cards are enforced server-side; no client observer needed
        
        // Setup player name controls after multiplayer is initialized
        this.setupPlayerNameControls();
        
        // Initial render
        this.renderDeck();
        this.updateDeckManager();
        
        console.log('Card game initialized successfully!');
    }

    setupDeck() {
        // Try to restore the last selected deck
        const lastDeckId = this.getLastSelectedDeck();
        if (lastDeckId && this.isValidDeckId(lastDeckId)) {
            this.loadDeck(lastDeckId, false); // Don't broadcast on initial load
        } else {
            // Default to standard deck
            this.deck = new StandardDeck();
            // IMPORTANT: Set originalDeckSize BEFORE shuffling/dealing
            this.originalDeckSize = this.deck.cards.length;
            console.log(`[DECK] Setup deck with ${this.originalDeckSize} cards`);
            this.deck.shuffle();
            this.currentDeckId = 'standard';
        }
        
        // Ensure originalDeckSize is always set
        if (this.deck && this.originalDeckSize === 0) {
            this.originalDeckSize = this.deck.cards.length;
            console.log(`[DECK] originalDeckSize was 0, setting to ${this.originalDeckSize}`);
        }
    }

    setupEventListeners() {
        // Control buttons
        document.getElementById('reset-btn').addEventListener('click', () => this.resetGame());

        const cardTable = document.getElementById('card-table');
        
        // Selection rectangle handling
        let tableMouseDown = false;
        let tableMouseStart = { x: 0, y: 0 };
        
        cardTable.addEventListener('mousedown', (e) => {
            // Only handle left mouse button
            if (e.button !== 0) {
                return;
            }
            
            // Don't start selection if clicking on a card or deck
            if (e.target.classList.contains('card') || e.target.closest('.card') || 
                e.target.classList.contains('deck') || e.target.closest('.deck')) {
                return;
            }
            
            // Start selection if clicking on empty table area (not just when target is card-table)
            // Also check if clicking on table itself or empty space within table
            const table = document.getElementById('card-table');
            if (table.contains(e.target) && !e.target.closest('.card') && !e.target.closest('.deck')) {
                tableMouseDown = true;
                tableMouseStart = { x: e.clientX, y: e.clientY };
                
                // Start selection rectangle (will check for drag movement)
                this.startSelection(e);
            }
        });
        
        // Track mouse movement for selection rectangle
        document.addEventListener('mousemove', (e) => {
            // Update selection rectangle if selecting
            if (this.isSelecting) {
                this.updateSelection(e);
            }
            
            // Update group drag if dragging group
            if (this.isDraggingGroup) {
                this.updateGroupDrag(e);
            }
            
            // Check if this is a drag (movement > threshold) for single click detection
            if (tableMouseDown) {
                const deltaX = Math.abs(e.clientX - tableMouseStart.x);
                const deltaY = Math.abs(e.clientY - tableMouseStart.y);
                
                if (deltaX > this.dragThreshold || deltaY > this.dragThreshold) {
                    // This is a drag, not a click - selection rectangle will be visible
                    // Selection is already started in mousedown
                }
            }
        });
        
        document.addEventListener('mouseup', (e) => {
            // End selection rectangle if selecting
            if (this.isSelecting) {
                const deltaX = Math.abs(this.selectionCurrent.x - this.selectionStart.x);
                const deltaY = Math.abs(this.selectionCurrent.y - this.selectionStart.y);
                
                // Only end selection if there was actual movement
                if (deltaX > this.dragThreshold || deltaY > this.dragThreshold) {
                    this.endSelection(e);
                } else {
                    // Single click - clear selection and handle normally
                    this.clearSelection();
                    this.isSelecting = false;
                }
            }
            
            // End group drag if dragging group
            if (this.isDraggingGroup) {
                this.endGroupDrag(e);
            }
            
            // Reset table mouse tracking
            if (tableMouseDown) {
                const deltaX = Math.abs(e.clientX - tableMouseStart.x);
                const deltaY = Math.abs(e.clientY - tableMouseStart.y);
                
                // If single click (no drag), handle table click
                if (deltaX < this.dragThreshold && deltaY < this.dragThreshold) {
                    // Single click on empty table - deal card if connected
                    const isConnected = !this.multiplayer || this.multiplayer.connectionStatus === 'connected';
                    if (isConnected && e.target.id === 'card-table' && !this.isDragging && !this.preventTableClick && !e.defaultPrevented) {
                        this.dealCardToPosition(e.clientX, e.clientY);
                    }
                }
                
                tableMouseDown = false;
            }
        });
        
        // Escape key to clear selection
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.isSelecting) {
                    this.endSelection(e);
                }
                this.clearSelection();
            }
        });
        
        // Card table click handler (legacy - now handled in mouseup)
        cardTable.addEventListener('click', (e) => {
            // This is now mainly for backward compatibility
            // Single click handling is done in mouseup handler above
        });
    }

    getDeckCount() {
        // Calculate deck count as: total deck size - cards on table
        const totalDeckSize = this.getTotalDeckSize();
        const cardsOnTable = document.querySelectorAll('.card').length;
        return Math.max(0, totalDeckSize - cardsOnTable);
    }

    getTotalDeckSize() {
        // Use originalDeckSize if available (most accurate)
        if (this.originalDeckSize && this.originalDeckSize > 0) {
            return this.originalDeckSize;
        }
        // Fallback: Get the original deck size from the deck's total cards
        // This includes both remaining cards and dealt cards (but not discarded cards)
        // Cards in discard pile should not be counted as they're removed from the game flow
        const cardsOnBoard = document.querySelectorAll('.card').length;
        const remainingInDeck = this.deck ? this.deck.cards.length : 0;
        // Estimate: if we have cards on board and in deck, original was at least that much
        return Math.max(cardsOnBoard + remainingInDeck, 52); // Default to 52 for standard deck
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
                <div class="deck-count">${this.getDeckCount()}</div>
            </div>
        `;
        
        // Position deck in center
        deckElement.style.position = 'absolute';
        deckElement.style.top = '50%';
        deckElement.style.left = '50%';
        deckElement.style.transform = 'translate(-50%, -50%)';
        deckElement.style.pointerEvents = 'auto'; // Ensure it's clickable
        deckElement.draggable = false; // Prevent dragging
        deckElement.style.userSelect = 'none'; // Prevent text selection
        deckElement.style.cursor = 'pointer'; // Show it's clickable
        
        // Add click handler for dealing
        deckElement.addEventListener('click', () => this.dealCard());
        
        table.appendChild(deckElement);
    }

    dealCard() {
        // Prevent dealing when not connected
        const isConnected = !this.multiplayer || this.multiplayer.connectionStatus === 'connected';
        if (!isConnected) {
            return;
        }
        
        if (this.deck.cards.length === 0) {
            alert('No more cards in deck!');
            return;
        }

        const card = this.deck.cards.pop();
        this.dealtCards.push(card);
        
        // Create card element
        const cardElement = this.createCardElement(this.deck, card);
        
        // Position card in private hand zone with smart positioning
        const privateHandZone = document.getElementById('private-hand-zone');
        if (!privateHandZone) {
            console.error('Private hand zone not found!');
            return;
        }
        
        const zoneRect = privateHandZone.getBoundingClientRect();
        const table = document.getElementById('card-table');
        const tableRect = table.getBoundingClientRect();
        
        // Find a good position for the new card
        const position = this.findBestPositionInPrivateZone(zoneRect, tableRect);
        
        cardElement.style.left = position.x + 'px';
        cardElement.style.top = position.y + 'px';
        
        // Set as private to current player
        cardElement.dataset.privateTo = this.multiplayer ? this.multiplayer.playerId : 'local';
        
        // Make the card face up (remove flipped class to show the front)
        cardElement.classList.remove('flipped');
        
        table.appendChild(cardElement);
        
        // Update deck display
        this.renderDeck();
        
        // Add interaction handlers
        this.addCardInteractions(cardElement, card);
        
        // Highlight the deck with player's color
        this.highlightDeck();
        
        // Update private hand display to reflect the new card
        this.updatePrivateHandDisplay();
        
        // Request card state update to server
        if (this.multiplayer && this.multiplayer.connectionStatus === 'connected') {
            this.multiplayer.requestCardStateUpdate([{
                uniqueId: cardElement.dataset.uniqueId,
                card: card,
                position: {
                    x: parseInt(cardElement.style.left) || 0,
                    y: parseInt(cardElement.style.top) || 0
                },
                isFlipped: cardElement.classList.contains('flipped'),
                privateTo: this.multiplayer.playerId,
                zIndex: parseInt(cardElement.style.zIndex) || 0,
                timestamp: Date.now()
            }]);
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

    // Generate a deterministic color based on player alias
    generatePlayerColor(playerAlias) {
        if (!playerAlias) return '#FFD700'; // Default golden color
        
        // Simple hash function to convert string to number
        let hash = 0;
        for (let i = 0; i < playerAlias.length; i++) {
            const char = playerAlias.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        
        // Convert hash to positive number and use modulo for hue
        const hue = Math.abs(hash) % 360;
        
        // Use high saturation and lightness for vibrant colors
        return `hsl(${hue}, 80%, 60%)`;
    }

    // Highlight a card to show it has moved or been placed
    highlightCard(cardElement, playerAlias = null) {
        // Generate color based on player alias (use current player if not provided)
        if (!playerAlias && this.multiplayer) {
            playerAlias = this.multiplayer.playerAlias;
        }
        const highlightColor = this.generatePlayerColor(playerAlias);
        
        // Set CSS custom property for the highlight color BEFORE removing class
        // This ensures the variable is set before the animation starts
        cardElement.style.setProperty('--highlight-color', highlightColor);
        
        // Force a reflow to ensure the CSS variable is set
        cardElement.offsetHeight;
        
        // Remove any existing highlight class
        cardElement.classList.remove('card-highlight');
        
        // Force another reflow to ensure the class removal takes effect
        cardElement.offsetHeight;
        
        // Add the highlight class to trigger the animation
        // The CSS variable is already set, so it will use that color throughout
        cardElement.classList.add('card-highlight');
        
        // Remove the class after animation completes, but keep the CSS variable
        // until animation is done to prevent fallback to yellow
        setTimeout(() => {
            cardElement.classList.remove('card-highlight');
            // Keep the CSS variable for a bit longer to ensure animation completes
            setTimeout(() => {
                cardElement.style.removeProperty('--highlight-color');
            }, 100);
        }, 1500);
    }

    // Find the best position for a new card in the private hand zone
    findBestPositionInPrivateZone(zoneRect, tableRect) {
        // Get actual card dimensions dynamically
        const existingCard = document.querySelector('.card');
        let cardWidth = 76; // Default fallback
        let cardHeight = 100; // Default fallback
        
        if (existingCard) {
            const cardRect = existingCard.getBoundingClientRect();
            cardWidth = cardRect.width;
            cardHeight = cardRect.height;
        }
        
        const spacing = 10; // Spacing between cards
        
        // Convert zone coordinates to table coordinates
        const zoneLeft = zoneRect.left - tableRect.left;
        const zoneTop = zoneRect.top - tableRect.top;
        const zoneWidth = zoneRect.width;
        const zoneHeight = zoneRect.height;
        
        // Get all existing cards in private hand zone
        const existingCards = Array.from(document.querySelectorAll('.card')).filter(card => {
            const privateTo = card.dataset.privateTo;
            const currentPlayerId = this.multiplayer ? this.multiplayer.playerId : 'local';
            return privateTo === currentPlayerId;
        });
        
        // Try to find a position that doesn't overlap with existing cards
        const maxAttempts = 50;
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            // Try different positions: left to right, top to bottom
            const cardsPerRow = Math.floor(zoneWidth / (cardWidth + spacing));
            const row = Math.floor(attempt / cardsPerRow);
            const col = attempt % cardsPerRow;
            
            const x = zoneLeft + (col * (cardWidth + spacing)) + spacing;
            const y = zoneTop + (row * (cardHeight + spacing)) + spacing;
            
            // Check if this position is within the zone bounds
            if (x + cardWidth > zoneLeft + zoneWidth || y + cardHeight > zoneTop + zoneHeight) {
                continue; // Position is outside zone
            }
            
            // Check if this position overlaps with any existing card
            let hasOverlap = false;
            for (const existingCard of existingCards) {
                const existingRect = existingCard.getBoundingClientRect();
                const existingX = existingRect.left - tableRect.left;
                const existingY = existingRect.top - tableRect.top;
                
                // Check for overlap (with some padding)
                const padding = 5;
                if (!(x + cardWidth + padding < existingX || 
                      x - padding > existingX + existingRect.width ||
                      y + cardHeight + padding < existingY || 
                      y - padding > existingY + existingRect.height)) {
                    hasOverlap = true;
                    break;
                }
            }
            
            if (!hasOverlap) {
                return { x, y };
            }
        }
        
        // If we couldn't find a non-overlapping position, place it randomly in the zone
        const randomX = zoneLeft + Math.random() * (zoneWidth - cardWidth);
        const randomY = zoneTop + Math.random() * (zoneHeight - cardHeight);
        return { x: randomX, y: randomY };
    }

    // Highlight the deck to show a card was dealt
    highlightDeck() {
        const deckElement = document.querySelector('.deck');
        if (!deckElement) return;
        
        // Remove any existing highlight class
        deckElement.classList.remove('deck-highlight');
        
        // Force a reflow to ensure the class removal takes effect
        deckElement.offsetHeight;
        
        // Generate color based on current player's alias
        const playerAlias = this.multiplayer ? this.multiplayer.playerAlias : 'local';
        const highlightColor = this.generatePlayerColor(playerAlias);
        
        // Set CSS custom property for the highlight color
        deckElement.style.setProperty('--highlight-color', highlightColor);
        
        // Add the highlight class to trigger the animation
        deckElement.classList.add('deck-highlight');
        
        // Remove the class after animation completes
        setTimeout(() => {
            deckElement.classList.remove('deck-highlight');
        }, 1500);
    }

    dealCardToPosition(x, y) {
        // Prevent dealing when not connected
        const isConnected = !this.multiplayer || this.multiplayer.connectionStatus === 'connected';
        if (!isConnected) {
            return;
        }
        
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
        
        // Highlight the newly dealt card
        this.highlightCard(cardElement, this.multiplayer ? this.multiplayer.playerAlias : null);
        
        // Request card state update to server
        if (this.multiplayer && this.multiplayer.connectionStatus === 'connected') {
            this.multiplayer.requestCardStateUpdate([{
                uniqueId: cardElement.dataset.uniqueId,
                card: card,
                position: {
                    x: parseInt(cardElement.style.left) || 0,
                    y: parseInt(cardElement.style.top) || 0
                },
                isFlipped: cardElement.classList.contains('flipped'),
                privateTo: null,
                zIndex: parseInt(cardElement.style.zIndex) || 0,
                timestamp: Date.now()
            }]);
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
            imageSize: card.imageSize || 24,
            faceUp: card.faceUp || false,
            instanceId: card.instanceId,
            uniqueId: card.uniqueId
        };
        
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.dataset.title = safeCard.title;
        
        // Use the stored unique ID from the card object
        cardElement.dataset.uniqueId = safeCard.uniqueId;
        cardElement.dataset.instanceId = safeCard.instanceId;
        cardElement.dataset.cardId = `card_${++this.cardIdCounter}`; // Keep for backward compatibility
        
        if (safeCard.description) {
            cardElement.dataset.description = safeCard.description;
        }
        
        // Set z-index to bring new card to front
        cardElement.style.zIndex = ++this.zIndexCounter;
        
        // Add color class for styling
        if (safeCard.color) {
            cardElement.classList.add(`card-${safeCard.color}`);
        }
        
        // Create card face
        const cardFace = document.createElement('div');
        cardFace.className = 'card-face';
        
        // Add wild class for wild cards to enable gradient styling
        if (safeCard.color === 'wild') {
            cardFace.classList.add('wild');
        }
        
        // Use card properties
        const displaySymbol = safeCard.emoji || '?';
        const displayTitle = safeCard.title || 'Card';
        const cardColor = this.getCardColor(safeCard.color);
        
        // Don't set background color for wild cards - let CSS gradient handle it
        if (safeCard.color !== 'wild') {
            cardFace.style.backgroundColor = cardColor;
            cardFace.style.color = '#333';
        } else {
            // Wild cards use white text for better contrast with gradient
            cardFace.style.color = 'white';
        }
        
        const textColor = safeCard.color === 'wild' ? 'white' : '#333';
        const imageSize = safeCard.imageSize || 24; // Default to 24px if not specified
        cardFace.innerHTML = `
            <div style="font-size: 14px; color: ${textColor};">${displayTitle}</div>
            <div style="font-size: ${imageSize}px;">${displaySymbol}</div>
            ${deck.invertTitle ? `<div style="font-size: 14px; transform: rotate(180deg); color: ${textColor};">${displayTitle}</div>` : ''}
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
            'red': '#f87171',
            'blue': '#60a5fa',
            'green': '#4ade80',
            'yellow': '#facc15',
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
        let mouseButton = 0; // 0=left,1=middle,2=right

        // Mouse events
        cardElement.addEventListener('mousedown', (e) => {
            const isConnected = !this.multiplayer || this.multiplayer.connectionStatus === 'connected';
            if (!isConnected) {
                e.preventDefault();
                e.stopPropagation();
                return;
            }
            e.preventDefault();
            e.stopPropagation();
            
            // Check if this card is selected and we should start group drag
            // Store state to check after drag threshold
            isDragging = false;
            this.isDragging = false;
            startX = e.clientX;
            startY = e.clientY;
            mouseDownTime = Date.now();
            mouseButton = e.button || 0;
            
            // Store if card is selected
            const isCardSelected = this.selectedCards.includes(cardElement);
            
            // Get current card position relative to table
            const table = document.getElementById('card-table');
            const tableRect = table.getBoundingClientRect();
            const cardRect = cardElement.getBoundingClientRect();
            
            // Convert screen coordinates to table-relative coordinates
            initialX = cardRect.left - tableRect.left;
            initialY = cardRect.top - tableRect.top;
            
            // Calculate offset from mouse to card corner
            offsetX = e.clientX - cardRect.left;
            offsetY = e.clientY - cardRect.top;
            
            // Bring card to front when starting to drag (ensure above discard visuals)
            const DRAG_Z_BASE = 10000;
            this.zIndexCounter = Math.max(this.zIndexCounter + 1, DRAG_Z_BASE);
            cardElement.style.zIndex = this.zIndexCounter;
            
            // Store card element for potential group drag
            cardElement._pendingGroupDrag = isCardSelected && this.selectedCards.length > 0;
        });

        // Use document mousemove to track mouse even outside card
        document.addEventListener('mousemove', (e) => {
            if (startX !== undefined && startY !== undefined) {
                const deltaX = e.clientX - startX;
                const deltaY = e.clientY - startY;
                
                if (Math.abs(deltaX) > dragThreshold || Math.abs(deltaY) > dragThreshold) {
                    // Check if this should be a group drag
                    if (cardElement._pendingGroupDrag && !this.isDraggingGroup) {
                        // Start group drag
                        if (this.startGroupDrag(e, cardElement)) {
                            // Group drag started successfully
                            isDragging = true;
                            this.isDragging = true;
                            // Don't add dragging class - group drag handles that
                            return; // Group drag handles movement
                        }
                    }
                    
                    if (!isDragging) {
                        isDragging = true;
                        this.isDragging = true;
                        cardElement.classList.add('dragging');
                    }
                    
                    // Only update single card position if not doing group drag
                    if (!this.isDraggingGroup) {
                        // Calculate new position relative to the initial position
                        let newX = initialX + deltaX;
                        let newY = initialY + deltaY;
                        
                        // Get board boundaries
                        const table = document.getElementById('card-table');
                        const tableRect = table.getBoundingClientRect();
                        const cardRect = cardElement.getBoundingClientRect();
                        const cardWidth = cardRect.width;
                        const cardHeight = cardRect.height;
                        
                        // Constrain to board boundaries
                        const minX = 0;
                        const maxX = tableRect.width - cardWidth;
                        const minY = 0;
                        const maxY = tableRect.height - cardHeight;
                        
                        newX = Math.max(minX, Math.min(maxX, newX));
                        newY = Math.max(minY, Math.min(maxY, newY));
                        
                        // Update position directly using left/top
                        cardElement.style.left = newX + 'px';
                        cardElement.style.top = newY + 'px';
                    }
                }
            }
        });

        document.addEventListener('mouseup', (e) => {
            if (startX !== undefined && startY !== undefined) {
                const clickDuration = Date.now() - mouseDownTime;
                
                // Clear pending group drag flag
                cardElement._pendingGroupDrag = false;
                
                // If group drag was active, it's handled by the document-level mouseup handler
                // Just clean up local state
                if (this.isDraggingGroup) {
                    // Group drag is handled elsewhere, just reset local state
                    isDragging = false;
                    this.isDragging = false;
                    startX = undefined;
                    startY = undefined;
                    mouseButton = 0;
                    return;
                }
                
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
                    
                    // Set privateTo attribute on the card element
                    if (isInPrivateZone) {
                        cardElement.dataset.privateTo = this.multiplayer.playerId;
                    } else {
                        delete cardElement.dataset.privateTo;
                    }
                    
                    // Check for drop into discard pile area; if so, move into discard container and enforce face-up
                    let handledByDiscardDrop = false;
                    if (this.discardPileArea && this.discardPileContent) {
                        const discardRect = this.discardPileArea.getBoundingClientRect();
                        const isInDiscardArea = cardCenterX >= discardRect.left && cardCenterX <= discardRect.right &&
                                                cardCenterY >= discardRect.top && cardCenterY <= discardRect.bottom;
                        if (isInDiscardArea && cardElement.parentNode !== this.discardPileContent) {
                            this.addCardToDiscardPile(cardElement, card);
                            handledByDiscardDrop = true;
                        }
                    }

                    // Determine discard area membership and handle transitions by area (not container)
                    if (this.discardPileArea) {
                        const discardPileRect = this.discardPileArea.getBoundingClientRect();
                        const inDiscardArea = cardCenterX >= discardPileRect.left && cardCenterX <= discardPileRect.right &&
                                               cardCenterY >= discardPileRect.top && cardCenterY <= discardPileRect.bottom;

                        if (inDiscardArea) {
                            // Snap into discard visuals and broadcast discard state
                            this.addCardToDiscardPile(cardElement, card);
                        } else {
                            // Ensure it's considered on table and broadcast position/location
                            if (this.multiplayer && this.multiplayer.connectionStatus === 'connected') {
                                const table = document.getElementById('card-table');
                                const tableRect = table.getBoundingClientRect();
                                // Send top-left coordinates to avoid visual shift on reapply
                                const newX = cardRect.left - tableRect.left;
                                const newY = cardRect.top - tableRect.top;
                                this.multiplayer.requestCardStateUpdate([{
                                    uniqueId: cardElement.dataset.uniqueId,
                                    position: { x: newX, y: newY },
                                    location: 'table',
                                    isFlipped: cardElement.classList.contains('flipped'),
                                    privateTo: cardElement.dataset.privateTo || null,
                                    zIndex: parseInt(cardElement.style.zIndex || '0', 10),
                                    timestamp: Date.now()
                                }]);
                            }
                        }
                    }
                    
                    // Request card state update to server (only if not a remote update)
                    if (!handledByDiscardDrop && this.multiplayer && this.multiplayer.connectionStatus === 'connected' && cardElement.dataset.remoteUpdate !== 'true' && !cardElement.dataset.beingRemoved) {
                        // Determine location based on current parent
                        const location = (cardElement.parentNode === this.discardPileContent) ? 'discardPile' : 'table';
                        
                        // Calculate position relative to table
                        const table = document.getElementById('card-table');
                        const tableRect = table ? table.getBoundingClientRect() : { left: 0, top: 0 };
                        const cardRect = cardElement.getBoundingClientRect();
                        // Send top-left coordinates to avoid post-drop drift
                        const newX = cardRect.left - tableRect.left;
                        const newY = cardRect.top - tableRect.top;
                        
                        // Use multi-card API (single card as array) with explicit location
                        this.moveCards([cardElement], [{
                            x: newX,
                            y: newY
                        }]);
                        // Update display after state change
                        this.updatePrivateHandDisplay();
                    }
                    
                    // Update discard pile counter after card move
                    this.updateDiscardPileCounter();
                    
                    // Highlight the card to show it has moved
                    this.highlightCard(cardElement, this.multiplayer ? this.multiplayer.playerAlias : null);
                    
                    // Ensure z-index remains above board content immediately after drop
                    cardElement.style.zIndex = Math.max(parseInt(cardElement.style.zIndex || '0', 10), this.zIndexCounter);
                    
                    // Prevent table click event after dragging
                    e.preventDefault();
                    e.stopPropagation();
                    // Set a flag to prevent table click for a short time
                    this.preventTableClick = true;
                    setTimeout(() => {
                        this.preventTableClick = false;
                    }, 100);
                } else if (clickDuration < 200 && mouseButton === 0) { // Short left-click without drag
                    // Click without drag - check if card is selected
                    if (this.selectedCards.length > 0 && this.selectedCards.includes(cardElement)) {
                        // Flip all selected cards
                        this.flipCards(this.selectedCards);
                    } else {
                        // Flip single card
                        this.flipCard(cardElement);
                    }
                }
                
                // Reset tracking variables
                startX = undefined;
                startY = undefined;
                mouseButton = 0;
            }
        });

        // Right-click to discard card(s)
        cardElement.addEventListener('contextmenu', (e) => {
            const isConnected = !this.multiplayer || this.multiplayer.connectionStatus === 'connected';
            if (!isConnected) {
                e.preventDefault();
                e.stopPropagation();
                return;
            }
            e.preventDefault();
            e.stopPropagation();
            
            // Check if card is part of a selection
            if (this.selectedCards.length > 0 && this.selectedCards.includes(cardElement)) {
                // Discard all selected cards
                const selectedCards = [...this.selectedCards];
                const selectedCardData = selectedCards.map(cardEl => this.getCardFromElement(cardEl));
                
                // Discard all selected cards
                this.addCardsToDiscardPile(selectedCards, selectedCardData);
                
                // Clear selection after discarding
                this.clearSelection();
            } else {
                // Discard single card
                this.shuffleCardBackToDeck(cardElement, card);
            }
        });

        // Touch events for mobile
        cardElement.addEventListener('touchstart', (e) => {
            const isConnected = !this.multiplayer || this.multiplayer.connectionStatus === 'connected';
            if (!isConnected) {
                e.preventDefault();
                e.stopPropagation();
                return;
            }
            e.preventDefault();
            e.stopPropagation();
            
            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
            
            // Get current card position relative to table
            const table = document.getElementById('card-table');
            const tableRect = table.getBoundingClientRect();
            const cardRect = cardElement.getBoundingClientRect();
            
            // Convert screen coordinates to table-relative coordinates
            initialX = cardRect.left - tableRect.left;
            initialY = cardRect.top - tableRect.top;
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
                    let newX = touch.clientX - tableRect.left - 30;
                    let newY = touch.clientY - tableRect.top - 42;
                    
                    // Get card dimensions for boundary checking
                    const cardRect = cardElement.getBoundingClientRect();
                    const cardWidth = cardRect.width;
                    const cardHeight = cardRect.height;
                    
                    // Constrain to board boundaries
                    const minX = 0;
                    const maxX = tableRect.width - cardWidth;
                    const minY = 0;
                    const maxY = tableRect.height - cardHeight;
                    
                    newX = Math.max(minX, Math.min(maxX, newX));
                    newY = Math.max(minY, Math.min(maxY, newY));
                    
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
                    
                    console.log('Touch private zone detection:', {
                        cardCenterX, cardCenterY,
                        zoneRect: { left: zoneRect.left, right: zoneRect.right, top: zoneRect.top, bottom: zoneRect.bottom },
                        isInPrivateZone
                    });
                    
                } else {
                    // Touch tap - check if card is selected
                    if (this.selectedCards.length > 0 && this.selectedCards.includes(cardElement)) {
                        // Flip all selected cards
                        this.flipCards(this.selectedCards);
                    } else {
                        // Flip single card
                        this.flipCard(cardElement);
                    }
                }
                
                startX = undefined;
                startY = undefined;
            }
        });
        
        // Add tooltip functionality
        this.addCardTooltip(cardElement);
    }
    
    addCardTooltip(cardElement) {
        const description = cardElement.dataset.description;
        if (!description) return;
        
        let tooltip = null;
        
        cardElement.addEventListener('mouseenter', (e) => {
            if (tooltip) return; // Prevent multiple tooltips
            
            // Only show tooltip if card is face up (not flipped)
            if (cardElement.classList.contains('flipped')) return;
            
            tooltip = document.createElement('div');
            tooltip.className = 'card-tooltip';
            tooltip.textContent = description;
            
            // Position tooltip relative to the card's actual position in the document
            const cardRect = cardElement.getBoundingClientRect();
            
            // Calculate card position relative to the document (accounting for scroll)
            const cardLeft = cardRect.left + window.scrollX;
            const cardTop = cardRect.top + window.scrollY;
            const cardWidth = cardRect.width;
            
            // Position tooltip centered above the card
            tooltip.style.left = (cardLeft + cardWidth / 2) + 'px';
            tooltip.style.top = (cardTop - 10) + 'px';
            tooltip.style.transform = 'translateX(-50%) translateY(-100%)';
            
            document.body.appendChild(tooltip);
        });
        
        cardElement.addEventListener('mouseleave', () => {
            if (tooltip) {
                tooltip.remove();
                tooltip = null;
            }
        });
        
        cardElement.addEventListener('mousemove', (e) => {
            if (tooltip) {
                // Update tooltip position relative to the card's actual position in the document
                const cardRect = cardElement.getBoundingClientRect();
                
                // Calculate card position relative to the document (accounting for scroll)
                const cardLeft = cardRect.left + window.scrollX;
                const cardTop = cardRect.top + window.scrollY;
                
                tooltip.style.left = (cardLeft + cardRect.width / 2) + 'px';
                tooltip.style.top = (cardTop - 10) + 'px';
            }
        });
        
        // Store cleanup function on the card element
        cardElement._cleanupTooltip = () => {
            if (tooltip) {
                tooltip.remove();
                tooltip = null;
            }
        };
    }

    // Multi-card flip method (accepts array)
    flipCards(cardElements, isFlipped = null) {
        // Normalize to array
        const cardElementsArray = Array.isArray(cardElements) ? cardElements : [cardElements];
        
        // If isFlipped is null, toggle each card; otherwise set to specified state
        const cardStates = cardElementsArray.map(cardElement => {
            const currentFlipped = cardElement.classList.contains('flipped');
            const newFlipped = isFlipped !== null ? isFlipped : !currentFlipped;
            
            // Add flip animation
            cardElement.classList.add('card-flipping');
            
            // Wait until animation reaches 50% before changing content
            setTimeout(() => {
                if (newFlipped) {
                    cardElement.classList.add('flipped');
                } else {
                    cardElement.classList.remove('flipped');
                }
                cardElement.classList.remove('card-flipping');
            }, 200); // 50% of 400ms animation
            
            const card = this.getCardFromElement(cardElement);
            const privateTo = cardElement.dataset.privateTo || null;
            
            return {
                uniqueId: cardElement.dataset.uniqueId,
                card: card,
                position: {
                    x: parseInt(cardElement.style.left) || 0,
                    y: parseInt(cardElement.style.top) || 0
                },
                isFlipped: newFlipped,
                privateTo: privateTo,
                zIndex: parseInt(cardElement.style.zIndex) || 0,
                timestamp: Date.now()
            };
        });
        
        // Send all flip operations in single array update
        if (this.multiplayer && this.multiplayer.connectionStatus === 'connected') {
            // Wait for animations to start, then send update
            setTimeout(() => {
                this.multiplayer.requestCardStateUpdate(cardStates);
            }, 250); // After flip animations have started
        }
        
        // Highlight all flipped cards
        cardElementsArray.forEach(cardElement => {
            this.highlightCard(cardElement, this.multiplayer ? this.multiplayer.playerAlias : null);
        });
    }
    
    // Convenience wrapper for single card flip (uses multi-card method)
    flipCard(cardElement) {
        this.flipCards([cardElement]);
    }

    shuffleCardBackToDeck(cardElement, card) {
        // This method is for right-click to discard - redirect to discard pile
        // Re-check discard pile elements if needed
        if (!this.discardPileContent) {
            this.discardPileContent = document.getElementById('discard-pile-content');
            this.discardPileArea = document.getElementById('discard-pile-area');
        }
        
        if (this.discardPileContent) {
            this.addCardToDiscardPile(cardElement, card);
        } else {
            // Fallback: shuffle back to deck
            // Clean up any active tooltip before removing the card
            if (cardElement._cleanupTooltip) {
                cardElement._cleanupTooltip();
            }
            
            // Mark the card as being removed to prevent other broadcasts
            cardElement.dataset.beingRemoved = 'true';
            
            // Request card removal (discarded status) to server
            if (this.multiplayer && this.multiplayer.connectionStatus === 'connected') {
                const uniqueId = cardElement.dataset.uniqueId;
                if (uniqueId) {
                    this.multiplayer.requestCardStateUpdate([{
                        uniqueId: uniqueId,
                        card: card,
                        position: {
                            x: parseInt(cardElement.style.left) || 0,
                            y: parseInt(cardElement.style.top) || 0
                        },
                        isFlipped: cardElement.classList.contains('flipped'),
                        privateTo: null,
                        zIndex: parseInt(cardElement.style.zIndex) || 0,
                        status: 'discarded',
                        timestamp: Date.now()
                    }]);
                }
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
        
        // Update deck on server (deck is shuffled locally, server needs to know)
        if (this.multiplayer && this.multiplayer.connectionStatus === 'connected') {
            const deckData = this.deck.exportToJSON();
            this.multiplayer.requestDeckUpdate(this.currentDeckId, deckData);
        }
    }

    resetGame(shouldBroadcast = true) {
        // Clear dealt cards
        const table = document.getElementById('card-table');
        const cardElements = table.querySelectorAll('.card');
        cardElements.forEach(card => card.remove());
        
        this.deck.shuffle();
        this.dealtCards = [];
        
        // Reset private hands
        this.updatePrivateHandDisplay();
        
        // Re-render deck
        this.renderDeck();
        
        // Request reset game to server (only if this is a user-initiated reset)
        if (shouldBroadcast && this.multiplayer && this.multiplayer.connectionStatus === 'connected') {
            this.multiplayer.broadcastResetGame();
        }
        
        console.log('Game reset!');
    }

    // ===== MULTI-CARD APIs =====
    
    // Primary multi-card movement method (accepts arrays)
    moveCards(cardElements, positions) {
        // Normalize inputs to arrays
        const cardElementsArray = Array.isArray(cardElements) ? cardElements : [cardElements];
        const positionsArray = Array.isArray(positions) ? positions : [positions];
        
        const cardStates = cardElementsArray.map((cardElement, index) => {
            const card = this.getCardFromElement(cardElement);
            const position = positionsArray[index] || positionsArray[0];
            
            // Determine location based on current parent
            const location = (cardElement.parentNode === this.discardPileContent) ? 'discardPile' : 'table';
            
            return {
                uniqueId: cardElement.dataset.uniqueId,
                card: card,
                position: position,
                location: location, // Explicit location property
                isFlipped: cardElement.classList.contains('flipped'),
                privateTo: cardElement.dataset.privateTo || null,
                zIndex: parseInt(cardElement.style.zIndex) || 0,
                timestamp: Date.now()
            };
        });
        
        // Send all card movements in single array update
        if (this.multiplayer && this.multiplayer.connectionStatus === 'connected') {
            this.multiplayer.requestCardStateUpdate(cardStates);
        }
    }
    
    // Convenience wrapper for single card movement
    onCardMove(cardElement, newX, newY) {
        this.moveCards([cardElement], [{x: newX, y: newY}]);
    }
    
    // Multi-card discard method (accepts arrays)
    addCardsToDiscardPile(cardElements, cards) {
        // Ensure discard pile is initialized (re-check if needed)
        if (!this.discardPileContent || !this.discardPileArea) {
            this.discardPileArea = document.getElementById('discard-pile-area');
            this.discardPileContent = document.getElementById('discard-pile-content');
        }
        
        if (!this.discardPileContent || !this.discardPileArea) {
            console.error('Discard pile not initialized - elements not found in DOM');
            return;
        }
        
        
        // Normalize inputs to arrays
        const cardElementsArray = Array.isArray(cardElements) ? cardElements : [cardElements];
        const cardsArray = Array.isArray(cards) ? cards : [cards];
        
        const table = document.getElementById('card-table');
        const tableRect = table.getBoundingClientRect();
        
        // Get current discard pile count (count cards in the discard pile container)
        let cardCount = this.discardPileContent.querySelectorAll('.card').length;
        
        
        const cardStates = cardElementsArray.map((cardElement, index) => {
            const card = cardsArray[index];
            
            // Position and style card in discard pile (on table over the discard area)
            cardElement.style.position = 'absolute';
            cardElement.classList.remove('flipped');
            delete cardElement.dataset.privateTo;
            
            // Position the card using centralized helper (positions over area with stacking)
            this.positionCardInDiscardPileElement(cardElement, cardCount);
            
            // After helper positioned, read absolute left/top off the element (already table-relative)
            const absoluteX = parseInt(cardElement.style.left, 10) || 0;
            const absoluteY = parseInt(cardElement.style.top, 10) || 0;
            
            // Increment counter for next card
            const currentIndex = cardCount;
            cardCount++;
            
            return {
                uniqueId: cardElement.dataset.uniqueId,
                card: card,
                position: { x: absoluteX, y: absoluteY },
                location: 'discardPile', // Explicitly mark as discard pile card
                isFlipped: false, // Discard pile cards should be face UP
                privateTo: null,
                zIndex: 1000 + currentIndex + 1, // Use currentIndex to ensure proper stacking
                timestamp: Date.now()
            };
        });
        
        // Only send if we have valid card states
        if (cardStates.length > 0) {
            // Send all discarded cards in single array update
            if (this.multiplayer && this.multiplayer.connectionStatus === 'connected') {
                this.multiplayer.requestCardStateUpdate(cardStates);
            }
        } else {
            console.warn('No valid card states to send - all cards failed to add to discard pile');
        }
        
        // Update discard pile counter
        this.updateDiscardPileCounter();
        
    }
    
    // Convenience wrapper for single card discard
    addCardToDiscardPile(cardElement, card) {
        this.addCardsToDiscardPile([cardElement], [card]);
    }
    
    // Update discard pile counter display
    updateDiscardPileCounter() {
        const countElement = document.getElementById('discard-pile-count');
        if (!countElement) {
            return;
        }
        
        const count = this.getDiscardPileCount();
        countElement.textContent = count.toString();
    }
    
    // Shuffle discard pile back to deck
    shuffleDiscardPileBackToDeck() {
        if (!this.discardPileContent || !this.discardPileArea) {
            console.warn('Discard pile not initialized, cannot shuffle');
            return;
        }
        
        console.log('SHUFFLING DISCARD PILE BACK TO DECK');
        
        // Find all cards in discard pile area - check both discard pile content container and by position
        const discardPileRect = this.discardPileArea.getBoundingClientRect();
        
        // First, get cards from discard pile container
        const discardPileContainerCards = Array.from(this.discardPileContent.querySelectorAll('.card'));
        
        // Also check cards by position (in case some aren't in container yet)
        const discardCardElementsByPosition = Array.from(document.querySelectorAll('.card')).filter(card => {
            // Skip if already found in container
            if (discardPileContainerCards.includes(card)) {
                return false;
            }
            const cardRect = card.getBoundingClientRect();
            const cardCenterX = cardRect.left + cardRect.width / 2;
            const cardCenterY = cardRect.top + cardRect.height / 2;
            return cardCenterX >= discardPileRect.left && cardCenterX <= discardPileRect.right &&
                   cardCenterY >= discardPileRect.top && cardCenterY <= discardPileRect.bottom;
        });
        
        // Combine both sets
        const allDiscardCards = [...discardPileContainerCards, ...discardCardElementsByPosition];
        const discardCardUniqueIds = allDiscardCards.map(card => card.dataset.uniqueId).filter(Boolean);
        
        console.log('DISCARD PILE CARDS TO SHUFFLE:', discardCardUniqueIds.length, discardCardUniqueIds);
        
        if (discardCardUniqueIds.length === 0) {
            console.log('No cards in discard pile to shuffle');
            return;
        }
        
        // Always request shuffle through multiplayer manager
        // When connected, it sends to server. When offline, it handles locally via same handlers
        if (this.multiplayer) {
            this.multiplayer.requestShuffleDiscardPile(discardCardUniqueIds);
        } else {
            console.error('Multiplayer manager not available, cannot shuffle');
        }
    }
    
    // Update discard pile from server state
    updateDiscardPileFromState(discardPileUniqueIds) {
        // Server tracks discard pile by uniqueIds, but we position cards based on UI
        // This method ensures cards in discard pile are properly positioned
        if (!Array.isArray(discardPileUniqueIds) || !this.discardPileArea || !this.discardPileContent) {
            return;
        }

        // Move and position each card listed in the state over the discard area on the table
        // Always enforce face up and centralized positioning logic
        let stackIndex = 0;

        discardPileUniqueIds.forEach((uniqueId) => {
            const cardElement = document.querySelector(`[data-unique-id="${uniqueId}"]`);
            if (!cardElement) return;

            // Ensure face up
            cardElement.classList.remove('flipped');

            // Position using centralized helper (positions on table over discard area)
            this.positionCardInDiscardPileElement(cardElement, stackIndex);
            stackIndex += 1;
        });

        // Update counter
        this.updateDiscardPileCounter();
    }
    
    getDiscardPileCount() {
        if (!this.discardPileArea || !this.discardPileContent) {
            return 0;
        }
        
        // Primary method: Count cards directly in the discard pile container
        // This is the most reliable method as cards should always be in the container
        const cardsInContainer = this.discardPileContent.querySelectorAll('.card').length;
        
        if (cardsInContainer > 0) {
            return cardsInContainer;
        }
        
        // Fallback: Count by position if container is empty but cards might be positioned there
        const discardPileRect = this.discardPileArea.getBoundingClientRect();
        let count = 0;
        
        document.querySelectorAll('.card').forEach(card => {
            // Skip cards in private hand zones
            if (card.dataset.privateTo) {
                return;
            }
            const cardRect = card.getBoundingClientRect();
            const cardCenterX = cardRect.left + cardRect.width / 2;
            const cardCenterY = cardRect.top + cardRect.height / 2;
            if (cardCenterX >= discardPileRect.left && cardCenterX <= discardPileRect.right &&
                cardCenterY >= discardPileRect.top && cardCenterY <= discardPileRect.bottom) {
                count++;
            }
        });
        
        return count;
    }
    
    // ===== MULTI-CARD SELECTION METHODS =====
    
    // Check if a card can be selected
    isCardSelectable(cardElement) {
        // Exclude discard pile cards
        if (this.discardPileArea) {
            const cardRect = cardElement.getBoundingClientRect();
            const cardCenterX = cardRect.left + cardRect.width / 2;
            const cardCenterY = cardRect.top + cardRect.height / 2;
            const discardRect = this.discardPileArea.getBoundingClientRect();
            if (cardCenterX >= discardRect.left && cardCenterX <= discardRect.right &&
                cardCenterY >= discardRect.top && cardCenterY <= discardRect.bottom) {
                return false;
            }
        }
        
        // Exclude other players' private cards
        const privateTo = cardElement.dataset.privateTo;
        const currentPlayerId = this.multiplayer ? this.multiplayer.playerId : 'local';
        if (privateTo && privateTo !== currentPlayerId) {
            return false;
        }
        
        // Exclude deck element
        if (cardElement.classList.contains('deck')) {
            return false;
        }
        
        return true;
    }
    
    // Get cards that intersect with selection rectangle
    getCardsInRectangle(rect) {
        const cards = [];
        const allCards = document.querySelectorAll('.card');
        
        allCards.forEach(cardElement => {
            if (!this.isCardSelectable(cardElement)) {
                return;
            }
            
            const cardRect = cardElement.getBoundingClientRect();
            const table = document.getElementById('card-table');
            const tableRect = table.getBoundingClientRect();
            
            // Convert card rect to table-relative coordinates
            const cardLeft = cardRect.left - tableRect.left;
            const cardTop = cardRect.top - tableRect.top;
            const cardRight = cardLeft + cardRect.width;
            const cardBottom = cardTop + cardRect.height;
            
            // Check if card rectangle intersects with selection rectangle
            // Check if card center is inside rectangle
            const cardCenterX = cardLeft + cardRect.width / 2;
            const cardCenterY = cardTop + cardRect.height / 2;
            
            if (cardCenterX >= rect.left && cardCenterX <= rect.right &&
                cardCenterY >= rect.top && cardCenterY <= rect.bottom) {
                cards.push(cardElement);
                return; // continue in forEach
            }
            
            // Check if any corner is inside rectangle
            const corners = [
                { x: cardLeft, y: cardTop },
                { x: cardRight, y: cardTop },
                { x: cardLeft, y: cardBottom },
                { x: cardRight, y: cardBottom }
            ];
            
            for (const corner of corners) {
                if (corner.x >= rect.left && corner.x <= rect.right &&
                    corner.y >= rect.top && corner.y <= rect.bottom) {
                    cards.push(cardElement);
                    return; // continue in forEach
                }
            }
            
            // Check if rectangle overlaps with card (either rectangle completely contains card or vice versa)
            // Check if selection rect is inside card bounds or overlaps
            const rectOverlaps = !(rect.right < cardLeft || rect.left > cardRight || 
                                   rect.bottom < cardTop || rect.top > cardBottom);
            
            if (rectOverlaps) {
                cards.push(cardElement);
            }
        });
        
        return cards;
    }
    
    // Select cards
    selectCards(cardElements) {
        const playerAlias = this.multiplayer ? this.multiplayer.playerAlias : 'local';
        const selectionColor = this.generatePlayerColor(playerAlias);
        
        // Convert to RGB for rgba()
        const rgb = this.hexToRgb(selectionColor);
        const rgbString = rgb ? `${rgb.r}, ${rgb.g}, ${rgb.b}` : '255, 215, 0';
        
        // Set CSS variable for selection color
        const table = document.getElementById('card-table');
        if (table) {
            table.style.setProperty('--selection-color', selectionColor);
            table.style.setProperty('--selection-color-rgb', rgbString);
        }
        
        cardElements.forEach(cardElement => {
            if (!this.selectedCards.includes(cardElement)) {
                this.selectedCards.push(cardElement);
                cardElement.classList.add('card-selected');
            }
        });
    }
    
    // Deselect cards
    deselectCards(cardElements) {
        cardElements.forEach(cardElement => {
            const index = this.selectedCards.indexOf(cardElement);
            if (index > -1) {
                this.selectedCards.splice(index, 1);
                cardElement.classList.remove('card-selected');
            }
        });
    }
    
    // Clear all selections
    clearSelection() {
        this.selectedCards.forEach(cardElement => {
            cardElement.classList.remove('card-selected');
        });
        this.selectedCards = [];
        
        // Remove selection rectangle if it exists
        if (this.selectionRect && this.selectionRect.parentNode) {
            this.selectionRect.parentNode.removeChild(this.selectionRect);
            this.selectionRect = null;
        }
    }
    
    // Helper to convert color (hex or hsl) to RGB
    hexToRgb(color) {
        if (!color) return null;
        
        // Handle HSL colors (from generatePlayerColor)
        if (color.startsWith('hsl')) {
            const hslMatch = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
            if (hslMatch) {
                const h = parseInt(hslMatch[1]) / 360;
                const s = parseInt(hslMatch[2]) / 100;
                const l = parseInt(hslMatch[3]) / 100;
                
                let r, g, b;
                if (s === 0) {
                    r = g = b = l;
                } else {
                    const hue2rgb = (p, q, t) => {
                        if (t < 0) t += 1;
                        if (t > 1) t -= 1;
                        if (t < 1/6) return p + (q - p) * 6 * t;
                        if (t < 1/2) return q;
                        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                        return p;
                    };
                    
                    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                    const p = 2 * l - q;
                    r = hue2rgb(p, q, h + 1/3);
                    g = hue2rgb(p, q, h);
                    b = hue2rgb(p, q, h - 1/3);
                }
                
                return {
                    r: Math.round(r * 255),
                    g: Math.round(g * 255),
                    b: Math.round(b * 255)
                };
            }
        }
        
        // Handle hex colors
        if (color.startsWith('#')) {
            const hex = color.replace('#', '');
            const r = parseInt(hex.substr(0, 2), 16);
            const g = parseInt(hex.substr(2, 2), 16);
            const b = parseInt(hex.substr(4, 2), 16);
            return { r, g, b };
        }
        
        return null;
    }
    
    // Start selection rectangle
    startSelection(e) {
        const isConnected = !this.multiplayer || this.multiplayer.connectionStatus === 'connected';
        if (!isConnected) {
            return;
        }
        
        // Only start on left mouse button
        if (e.button !== 0 && e.button !== undefined) {
            return;
        }
        
        // Don't start if clicking on a card or deck
        if (e.target.classList.contains('card') || e.target.closest('.card') || 
            e.target.classList.contains('deck') || e.target.closest('.deck')) {
            return;
        }
        
        const table = document.getElementById('card-table');
        const tableRect = table.getBoundingClientRect();
        
        this.selectionStart = {
            x: e.clientX - tableRect.left,
            y: e.clientY - tableRect.top
        };
        this.selectionCurrent = { ...this.selectionStart };
        this.isSelecting = true;
        
        // Clear any existing selection FIRST (but don't remove rectangle we're about to create)
        // Only clear the selected cards, not the rectangle
        this.selectedCards.forEach(cardElement => {
            cardElement.classList.remove('card-selected');
        });
        this.selectedCards = [];
        
        // Create selection rectangle element
        this.selectionRect = document.createElement('div');
        this.selectionRect.className = 'selection-rectangle';
        table.appendChild(this.selectionRect);
        
        // Update rectangle immediately
        this.updateSelection(e);
    }
    
    // Update selection rectangle
    updateSelection(e) {
        if (!this.isSelecting || !this.selectionRect) {
            return;
        }
        
        const table = document.getElementById('card-table');
        const tableRect = table.getBoundingClientRect();
        
        this.selectionCurrent = {
            x: e.clientX - tableRect.left,
            y: e.clientY - tableRect.top
        };
        
        // Calculate rectangle bounds
        const left = Math.min(this.selectionStart.x, this.selectionCurrent.x);
        const top = Math.min(this.selectionStart.y, this.selectionCurrent.y);
        const width = Math.abs(this.selectionCurrent.x - this.selectionStart.x);
        const height = Math.abs(this.selectionCurrent.y - this.selectionStart.y);
        
        // Update rectangle position and size
        // Ensure minimum size to keep rectangle visible
        const minSize = 2;
        const actualWidth = Math.max(width, minSize);
        const actualHeight = Math.max(height, minSize);
        
        this.selectionRect.style.left = left + 'px';
        this.selectionRect.style.top = top + 'px';
        this.selectionRect.style.width = actualWidth + 'px';
        this.selectionRect.style.height = actualHeight + 'px';
        
        // Update selected cards
        const rect = { left, top, right: left + width, bottom: top + height };
        const cardsInRect = this.getCardsInRectangle(rect);
        
        // First, deselect cards that are no longer in the rectangle
        const cardsToDeselect = this.selectedCards.filter(card => !cardsInRect.includes(card));
        this.deselectCards(cardsToDeselect);
        
        // Then, select new cards in the rectangle
        this.selectCards(cardsInRect);
    }
    
    // End selection rectangle
    endSelection(e) {
        if (!this.isSelecting) {
            return;
        }
        
        this.isSelecting = false;
        
        // Remove selection rectangle
        if (this.selectionRect && this.selectionRect.parentNode) {
            this.selectionRect.parentNode.removeChild(this.selectionRect);
            this.selectionRect = null;
        }
        
        // If no cards selected after selection, clear selection state
        if (this.selectedCards.length === 0) {
            // Check if this was a single click (no drag movement)
            const deltaX = Math.abs(this.selectionCurrent.x - this.selectionStart.x);
            const deltaY = Math.abs(this.selectionCurrent.y - this.selectionStart.y);
            
            if (deltaX < this.dragThreshold && deltaY < this.dragThreshold) {
                // Single click on empty area - this should be handled by table click handler
                // But we've already cleared selection, so that's fine
            }
        }
    }
    
    // Start group drag
    startGroupDrag(e, cardElement) {
        const isConnected = !this.multiplayer || this.multiplayer.connectionStatus === 'connected';
        if (!isConnected) {
            return false;
        }
        
        // Only drag if we have selected cards
        if (this.selectedCards.length === 0) {
            return false;
        }
        
        // Check if the clicked card is selected
        if (!this.selectedCards.includes(cardElement)) {
            return false;
        }
        
        // Check if this is actually a drag (movement > threshold)
        const table = document.getElementById('card-table');
        const tableRect = table.getBoundingClientRect();
        const startX = e.clientX - tableRect.left;
        const startY = e.clientY - tableRect.top;
        
        // Store initial positions for all selected cards
        this.groupDragStart = {
            mouseX: startX,
            mouseY: startY,
            cardPositions: this.selectedCards.map(card => {
                const rect = card.getBoundingClientRect();
                return {
                    element: card,
                    initialX: rect.left - tableRect.left,
                    initialY: rect.top - tableRect.top
                };
            })
        };
        
        this.isDraggingGroup = true;
        
        // Add dragging class to all selected cards
        this.selectedCards.forEach(card => {
            card.classList.add('card-dragging-group');
            // Bring to front
            this.zIndexCounter = Math.max(this.zIndexCounter + 1, 10000);
            card.style.zIndex = this.zIndexCounter;
        });
        
        return true;
    }
    
    // Update group drag
    updateGroupDrag(e) {
        if (!this.isDraggingGroup || !this.groupDragStart) {
            return;
        }
        
        const table = document.getElementById('card-table');
        const tableRect = table.getBoundingClientRect();
        const currentX = e.clientX - tableRect.left;
        const currentY = e.clientY - tableRect.top;
        
        const deltaX = currentX - this.groupDragStart.mouseX;
        const deltaY = currentY - this.groupDragStart.mouseY;
        
        // Calculate card dimensions for boundary checking
        const firstCard = this.selectedCards[0];
        const cardRect = firstCard.getBoundingClientRect();
        const cardWidth = cardRect.width;
        const cardHeight = cardRect.height;
        
        // Constrain to board boundaries
        const minX = 0;
        const maxX = tableRect.width - cardWidth;
        const minY = 0;
        const maxY = tableRect.height - cardHeight;
        
        // Update positions of all selected cards maintaining relative positions
        this.groupDragStart.cardPositions.forEach(({ element, initialX, initialY }) => {
            let newX = initialX + deltaX;
            let newY = initialY + deltaY;
            
            // Constrain to boundaries
            newX = Math.max(minX, Math.min(maxX, newX));
            newY = Math.max(minY, Math.min(maxY, newY));
            
            element.style.left = newX + 'px';
            element.style.top = newY + 'px';
        });
    }
    
    // End group drag
    endGroupDrag(e) {
        if (!this.isDraggingGroup) {
            return;
        }
        
        this.isDraggingGroup = false;
        
        // Store selected cards before clearing
        const selectedCards = [...this.selectedCards];
        
        // Remove dragging class from all selected cards
        selectedCards.forEach(card => {
            card.classList.remove('card-dragging-group');
        });
        
        const table = document.getElementById('card-table');
        const tableRect = table.getBoundingClientRect();
        
        // Get center of selection group
        const firstCard = selectedCards[0];
        const firstRect = firstCard.getBoundingClientRect();
        const groupCenterX = firstRect.left + firstRect.width / 2;
        const groupCenterY = firstRect.top + firstRect.height / 2;
        
        // Check drop zones
        const privateHandZone = document.getElementById('private-hand-zone');
        if (privateHandZone) {
            const zoneRect = privateHandZone.getBoundingClientRect();
            const isInPrivateZone = groupCenterX >= zoneRect.left && groupCenterX <= zoneRect.right &&
                                   groupCenterY >= zoneRect.top && groupCenterY <= zoneRect.bottom;
            
            if (isInPrivateZone) {
                // Drop in private zone - organize cards
                const currentPlayerId = this.multiplayer ? this.multiplayer.playerId : 'local';
                
                // Organize cards one by one to ensure unique positions
                // Set privateTo first, then find position (so findBestPositionInPrivateZone can check for overlaps)
                selectedCards.forEach((card, index) => {
                    card.dataset.privateTo = currentPlayerId;
                });
                
                // Now find positions sequentially so each card knows about previous cards' positions
                selectedCards.forEach(card => {
                    const position = this.findBestPositionInPrivateZone(zoneRect, tableRect);
                    card.style.left = position.x + 'px';
                    card.style.top = position.y + 'px';
                });
                
                // Send update to server
                if (this.multiplayer && this.multiplayer.connectionStatus === 'connected') {
                    const cardStates = selectedCards.map(cardElement => {
                        return {
                            uniqueId: cardElement.dataset.uniqueId,
                            card: this.getCardFromElement(cardElement),
                            position: {
                                x: parseInt(cardElement.style.left) || 0,
                                y: parseInt(cardElement.style.top) || 0
                            },
                            isFlipped: cardElement.classList.contains('flipped'),
                            privateTo: currentPlayerId,
                            zIndex: parseInt(cardElement.style.zIndex) || 0,
                            timestamp: Date.now()
                        };
                    });
                    this.multiplayer.requestCardStateUpdate(cardStates);
                }
                
                // Update display
                this.updatePrivateHandDisplay();
                return;
            }
        }
        
        // Check discard pile area
        if (this.discardPileArea) {
            const discardRect = this.discardPileArea.getBoundingClientRect();
            const isInDiscardArea = groupCenterX >= discardRect.left && groupCenterX <= discardRect.right &&
                                   groupCenterY >= discardRect.top && groupCenterY <= discardRect.bottom;
            
            if (isInDiscardArea) {
                // Drop in discard pile
                const cards = selectedCards.map(card => this.getCardFromElement(card));
                this.addCardsToDiscardPile(selectedCards, cards);
                
                // Clear selection
                this.clearSelection();
                return;
            }
        }
        
        // Drop on table - maintain positions
        const cardStates = selectedCards.map(cardElement => {
            return {
                uniqueId: cardElement.dataset.uniqueId,
                card: this.getCardFromElement(cardElement),
                position: {
                    x: parseInt(cardElement.style.left) || 0,
                    y: parseInt(cardElement.style.top) || 0
                },
                isFlipped: cardElement.classList.contains('flipped'),
                privateTo: cardElement.dataset.privateTo || null,
                zIndex: parseInt(cardElement.style.zIndex) || 0,
                timestamp: Date.now()
            };
        });
        
        // Clear selection
        this.clearSelection();
        
        // Send update to server
        if (this.multiplayer && this.multiplayer.connectionStatus === 'connected') {
            this.multiplayer.requestCardStateUpdate(cardStates);
        }
        
        // Highlight all moved cards
        selectedCards.forEach(card => {
            this.highlightCard(card, this.multiplayer ? this.multiplayer.playerAlias : null);
        });
        
        // Update display
        this.updatePrivateHandDisplay();
    }
    
    // ===== MULTIPLAYER METHODS =====
    
    initializeMultiplayer() {
        this.multiplayer = new WebSocketMultiplayerManager(this);
        
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
        
        // Modal controls
        document.getElementById('modal-close').addEventListener('click', () => this.closeDeckEditor());
        document.getElementById('cancel-deck-btn').addEventListener('click', () => this.closeDeckEditor());
        document.getElementById('save-deck-btn').addEventListener('click', () => this.saveDeck());
        
        
        // Click outside to close
        document.getElementById('modal-overlay').addEventListener('click', () => this.closeDeckEditor());
    }
    
    setupDiscardPileListeners() {
        const shuffleBtn = document.getElementById('shuffle-discard-btn');
        if (shuffleBtn) {
            shuffleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.shuffleDiscardPileBackToDeck();
            });
        }
    }
    
    
    
    setupPlayerNameControls() {
        const playerNameInput = document.getElementById('player-name-input');
        
        // Load current player alias (display name)
        if (this.multiplayer) {
            playerNameInput.value = this.multiplayer.playerAlias;
        }
        
        // Handle name change
        playerNameInput.addEventListener('input', (e) => {
            const newAlias = e.target.value.trim();
            if (newAlias && this.multiplayer) {
                this.multiplayer.setPlayerAlias(newAlias);
            }
        });
    }
    
    toggleSideMenu() {
        const sideMenu = document.getElementById('side-menu');
        sideMenu.classList.toggle('open');
        document.body.classList.toggle('menu-open');
    }
    
    closeSideMenu() {
        const sideMenu = document.getElementById('side-menu');
        sideMenu.classList.remove('open');
        document.body.classList.remove('menu-open');
    }
    
    loadDecksFromStorage() {
        try {
            const savedDecks = localStorage.getItem('customDecks');
            if (savedDecks) {
                const decks = JSON.parse(savedDecks);
                this.customDecks = new Map(Object.entries(decks));
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
        this.updateGameInfo();
        this.updateDeckList();
    }
    
    updateGameInfo() {
        let gameTitle = this.deck.name || 'Cards - Custom Deck Manager';
        let gameDescription = this.deck.description || 'Click and drag cards to move them. Click (without dragging) to flip cards. Right-click to shuffle cards back into the deck.';
        
        // Show remote deck indicator
        if (this.currentDeckId === 'remote') {
            gameTitle = `📡 ${gameTitle} (Remote)`;
            gameDescription = `📡 Synced from host: ${gameDescription}`;
        }
        
        // Update sidebar game info
        document.getElementById('current-game-title').textContent = gameTitle;
        document.getElementById('current-game-description').innerHTML = gameDescription;
        
        // Main game info is now in the side menu
    }
    
    updateDeckList() {
        const deckList = document.getElementById('deck-list');
        deckList.innerHTML = '';
        
        // Add standard deck
        const standardItem = this.createDeckItem('standard', 'Standard Deck', 52, true);
        deckList.appendChild(standardItem);
        
        // Add virus deck as default with correct count
        const virusDeck = new VirusDeck();
        const virusItem = this.createDeckItem('virus', virusDeck.name, virusDeck.cards.length, true);
        deckList.appendChild(virusItem);
        
        // Add custom decks
        this.customDecks.forEach((deckData, deckId) => {
            const customDeck = new Deck(deckData);
            const deckItem = this.createDeckItem(deckId, deckData.name, customDeck.cards.length, false);
            deckList.appendChild(deckItem);
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
    
    loadDeck(deckId, shouldBroadcast = true) {
        // Clear any existing cards from the board
        this.clearBoard();
        
        if (deckId === 'standard') {
            this.deck = new StandardDeck();
        } else if (deckId === 'virus') {
            this.deck = new VirusDeck();
        } else if (this.customDecks.has(deckId)) {
            const deckData = this.customDecks.get(deckId);
            this.deck = new cards.Deck(deckData);
        } else {
            console.error('Deck not found:', deckId);
            return;
        }
        
        this.currentDeckId = deckId;
        // IMPORTANT: Set originalDeckSize BEFORE shuffling/dealing (this is the true original size)
        this.originalDeckSize = this.deck.cards.length;
        this.deck.shuffle();
        this.dealtCards = [];
        this.renderDeck();
        this.updateDeckManager();
        
        // Store the last selected deck in localStorage
        this.saveLastSelectedDeck(deckId);
        
        // Update deck on server
        if (shouldBroadcast && this.multiplayer && this.multiplayer.connectionStatus === 'connected') {
            const deckData = this.deck.exportToJSON();
            // originalDeckSize is already set above - don't overwrite with current size
            this.multiplayer.requestDeckUpdate(deckId, deckData);
        }
        
        console.log(`Loaded deck: ${this.deck.name}, original size: ${this.originalDeckSize}`);
    }
    
    loadRemoteDeck(deckData) {
        console.log('Loading remote deck from server:', deckData.name);
        
        // Clear any existing cards from the board
        this.clearBoard();
        
        // Create deck from remote data
        this.deck = new cards.Deck(deckData);
        this.currentDeckId = 'remote';
        // Don't shuffle - server maintains deck state
        // this.deck.shuffle();
        this.dealtCards = [];
        this.originalDeckSize = deckData.cards?.length || 0;
        this.renderDeck();
        this.updateDeckManager();
        
        console.log(`Loaded remote deck: ${this.deck.name}`);
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
    
    
    // Private Hand System Methods
    initializePrivateHand() {
        this.privateHandZone = document.getElementById('private-hand-zone');
        // Initialize with empty map, will be set when multiplayer connects
        this.updatePrivateHandDisplay();
    }
    

    updatePrivateHandDisplay() {
        // Count cards by their privateTo attribute
        const cardCounts = new Map();
        const allCards = document.querySelectorAll('.card');
        
        allCards.forEach(card => {
            const privateTo = card.dataset.privateTo;
            if (privateTo && privateTo !== 'null' && privateTo !== 'undefined') {
                cardCounts.set(privateTo, (cardCounts.get(privateTo) || 0) + 1);
            }
        });
        
        // Update your own hand count
        const yourHandCount = document.getElementById('your-hand-count');
        const currentPlayerId = this.multiplayer ? this.multiplayer.playerId : 'local';
        if (yourHandCount) {
            yourHandCount.textContent = cardCounts.get(currentPlayerId) || 0;
        }
        
        // Update the "You" label color with current player's color
        const youLabel = document.querySelector('.player-count-item .player-id');
        if (youLabel && youLabel.textContent === 'You') {
            const currentPlayerAlias = this.multiplayer ? this.multiplayer.playerAlias : 'You';
            const playerColor = this.generatePlayerColor(currentPlayerAlias);
            youLabel.style.color = playerColor;
        }
        
        // Update other players' counts - show ALL connected players, even with 0 cards
        const otherPlayersContainer = document.getElementById('other-players-counts');
        if (otherPlayersContainer) {
            otherPlayersContainer.innerHTML = '';
            
            // Get all connected players from multiplayer manager
            const connectedPlayers = this.multiplayer ? this.multiplayer.connectedPlayers : new Set();
            
            connectedPlayers.forEach(playerId => {
                if (playerId !== currentPlayerId) {
                    const playerItem = document.createElement('div');
                    playerItem.className = 'player-count-item';
                    
                    // Get the player's display name (alias or ID)
                    let displayName = playerId;
                    if (this.multiplayer) {
                        displayName = this.multiplayer.getPlayerDisplayName(playerId);
                    }
                    
                    // Get card count for this player (0 if they have no cards)
                    const cardCount = cardCounts.get(playerId) || 0;
                    
                    // Generate player-specific color for the name
                    const playerColor = this.generatePlayerColor(displayName);
                    
                    playerItem.innerHTML = `
                        <span class="player-id" style="color: ${playerColor}">${displayName}</span>
                        <span class="card-count">${cardCount}</span>
                    `;
                    otherPlayersContainer.appendChild(playerItem);
                }
            });
        }
    }
    
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.cardGame = new CardGame();
    console.log('The Nomad Card Game initialized!');
});
