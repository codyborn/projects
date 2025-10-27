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
        this.privateHandZone = null;
        
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
            this.loadDeck(lastDeckId);
        } else {
            // Default to standard deck
            this.deck = new StandardDeck();
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

    getDeckCount() {
        // Calculate deck count as: total deck size - cards on table
        const totalDeckSize = this.getTotalDeckSize();
        const cardsOnTable = document.querySelectorAll('.card').length;
        return Math.max(0, totalDeckSize - cardsOnTable);
    }

    getTotalDeckSize() {
        // Get the original deck size from the deck's total cards
        // This includes both remaining cards and dealt cards
        return this.deck.cards.length + this.dealtCards.length;
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
        
        // Broadcast card deal to other players
        if (this.multiplayer && this.multiplayer.connectionStatus === 'connected') {
            this.multiplayer.broadcastCardState(cardElement, card, this.multiplayer.playerId);
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
        // Remove any existing highlight class
        cardElement.classList.remove('card-highlight');
        
        // Force a reflow to ensure the class removal takes effect
        cardElement.offsetHeight;
        
        // Generate color based on player alias
        const highlightColor = this.generatePlayerColor(playerAlias);
        
        // Set CSS custom property for the highlight color
        cardElement.style.setProperty('--highlight-color', highlightColor);
        
        // Add the highlight class to trigger the animation
        cardElement.classList.add('card-highlight');
        
        // Remove the class after animation completes
        setTimeout(() => {
            cardElement.classList.remove('card-highlight');
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
        
        // Broadcast card deal to other players
        if (this.multiplayer && this.multiplayer.connectionStatus === 'connected') {
            this.multiplayer.broadcastCardState(cardElement, card);
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

        // Mouse events
        cardElement.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            isDragging = false;
            this.isDragging = false;
            startX = e.clientX;
            startY = e.clientY;
            mouseDownTime = Date.now();
            
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
                    
                    // Set privateTo attribute on the card element
                    if (isInPrivateZone) {
                        cardElement.dataset.privateTo = this.multiplayer.playerId;
                    } else {
                        delete cardElement.dataset.privateTo;
                    }
                    
                    // Broadcast complete card state to other players (only if not a remote update)
                    if (this.multiplayer && this.multiplayer.connectionStatus === 'connected' && cardElement.dataset.remoteUpdate !== 'true' && !cardElement.dataset.beingRemoved) {
                        const card = this.getCardFromElement(cardElement);
                        const privateTo = isInPrivateZone ? this.multiplayer.playerId : undefined;
                        this.multiplayer.broadcastCardState(cardElement, card, privateTo);
                        // Update display after state change
                        this.updatePrivateHandDisplay();
                    }
                    
                    // Highlight the card to show it has moved
                    this.highlightCard(cardElement, this.multiplayer ? this.multiplayer.playerAlias : null);
                    
                    // Ensure z-index is maintained after drag ends
                    if (!isInPrivateZone) {
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
                    this.flipCard(cardElement);
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

    flipCard(cardElement) {
        // Add flip animation
        cardElement.classList.add('card-flipping');
        
        // Wait until animation reaches 50% (width = 0%) before changing content
        setTimeout(() => {
            cardElement.classList.toggle('flipped');
            
            // Broadcast complete card state to other players AFTER the flip (only if not a remote update)
            if (this.multiplayer && this.multiplayer.connectionStatus === 'connected' && cardElement.dataset.remoteUpdate !== 'true' && !cardElement.dataset.beingRemoved) {
                const card = this.getCardFromElement(cardElement);
                const privateTo = cardElement.dataset.privateTo;
                this.multiplayer.broadcastCardState(cardElement, card, privateTo);
            }
            
            this.highlightCard(cardElement, this.multiplayer ? this.multiplayer.playerAlias : null);
        }, 200); // 50% of 400ms animation
        
        // Remove animation class when complete
        setTimeout(() => {
            cardElement.classList.remove('card-flipping');
        }, 400);
    }

    shuffleCardBackToDeck(cardElement, card) {
        // Clean up any active tooltip before removing the card
        if (cardElement._cleanupTooltip) {
            cardElement._cleanupTooltip();
        }
        
        // Mark the card as being removed to prevent other broadcasts
        cardElement.dataset.beingRemoved = 'true';
        
        // Broadcast card state with "discarded" status to other players
        if (this.multiplayer && this.multiplayer.connectionStatus === 'connected') {
            const uniqueId = cardElement.dataset.uniqueId;
            if (uniqueId) {
                this.multiplayer.broadcastCardState(cardElement, card, null, 'discarded');
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
        
        // Broadcast reset game to other players (only if this is a user-initiated reset)
        if (shouldBroadcast && this.multiplayer && this.multiplayer.connectionStatus === 'connected') {
            this.multiplayer.broadcastResetGame();
        }
        
        console.log('Game reset!');
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
        this.deck.shuffle();
        this.dealtCards = [];
        this.renderDeck();
        this.updateDeckManager();
        
        // Store the last selected deck in localStorage
        this.saveLastSelectedDeck(deckId);
        
        // Broadcast deck change to other players
        if (shouldBroadcast && this.multiplayer && this.multiplayer.connectionStatus === 'connected') {
            const deckData = this.deck.exportToJSON();
            this.multiplayer.broadcastDeckChange(deckId, deckData);
        }
        
        console.log(`Loaded deck: ${this.deck.name}`);
    }
    
    loadRemoteDeck(deckData) {
        console.log('Loading remote deck from host:', deckData.name);
        
        // Clear any existing cards from the board
        this.clearBoard();
        
        // Create deck from remote data
        this.deck = new cards.Deck(deckData);
        this.currentDeckId = 'remote';
        this.deck.shuffle();
        this.dealtCards = [];
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
