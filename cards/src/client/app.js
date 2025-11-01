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
        this.zIndexCounter = 10000; // Start at DRAG_Z_BASE to ensure consistent ordering
        
        // Theme system
        this.themes = [
            {
                name: 'Forest',
                background: 'radial-gradient(circle at center, #2d5a4a, #1a3d2e)',
                border: '#4a7c59',
                containerBackground: 'linear-gradient(135deg, #0f4c3a, #1a5f4a)',
                cardBackBackground: 'linear-gradient(145deg, #1a3d2e, #2d5a4a)',
                cardBackBorder: '#4a7c59',
                cardBackPattern: '♠',
                cardBackColor: '#e8f5e8'
            },
            {
                name: 'Ocean',
                background: 'radial-gradient(circle at center, #1e3a8a, #1e40af)',
                border: '#3b82f6',
                containerBackground: 'linear-gradient(135deg, #0e1b3a, #1e3a8a)',
                cardBackBackground: 'linear-gradient(145deg, #1e40af, #3b82f6)',
                cardBackBorder: '#60a5fa',
                cardBackPattern: '🌊',
                cardBackColor: '#dbeafe'
            },
            {
                name: 'Sunset',
                background: 'radial-gradient(circle at center, #dc2626, #991b1b)',
                border: '#ef4444',
                containerBackground: 'linear-gradient(135deg, #991b1b, #dc2626)',
                cardBackBackground: 'linear-gradient(145deg, #dc2626, #f97316)',
                cardBackBorder: '#fca5a5',
                cardBackPattern: '☀',
                cardBackColor: '#fef3c7'
            },
            {
                name: 'Space',
                background: 'radial-gradient(circle at center, #0f172a, #1e293b)',
                border: '#475569',
                containerBackground: 'linear-gradient(135deg, #020617, #0f172a)',
                cardBackBackground: 'linear-gradient(145deg, #0f172a, #1e293b)',
                cardBackBorder: '#64748b',
                cardBackPattern: '⭐',
                cardBackColor: '#e0e7ff',
                cardBackPatternGlow: '0 0 10px rgba(224, 231, 255, 0.8)'
            },
            {
                name: 'Neon',
                background: 'radial-gradient(circle at center, #0a0a0a, #1a1a2e)',
                border: '#00ffff',
                containerBackground: 'linear-gradient(135deg, #000000, #0a0a0a)',
                cardBackBackground: 'linear-gradient(145deg, #0a0a0a, #1a1a2e)',
                cardBackBorder: '#00ffff',
                cardBackPattern: '⚡',
                cardBackColor: '#00ffff',
                cardBackPatternGlow: '0 0 20px #00ffff, 0 0 40px #00ffff'
            },
            {
                name: 'Desert',
                background: 'radial-gradient(circle at center, #d97706, #b45309)',
                border: '#f59e0b',
                containerBackground: 'linear-gradient(135deg, #b45309, #d97706)',
                cardBackBackground: 'linear-gradient(145deg, #b45309, #d97706)',
                cardBackBorder: '#fbbf24',
                cardBackPattern: '🌵',
                cardBackColor: '#fef3c7'
            },
            {
                name: 'Neon Pink',
                background: 'radial-gradient(circle at center, #831843, #9f1239)',
                border: '#ff10f0',
                containerBackground: 'linear-gradient(135deg, #701a35, #831843)',
                cardBackBackground: 'linear-gradient(145deg, #831843, #ec4899)',
                cardBackBorder: '#ff10f0',
                cardBackPattern: '🦄',
                cardBackColor: '#fce7f3',
                cardBackPatternGlow: '0 0 20px #ff10f0, 0 0 40px #ff10f0'
            },
            {
                name: 'Underwater',
                background: 'radial-gradient(circle at center, #0c4a6e, #075985)',
                border: '#06b6d4',
                containerBackground: 'linear-gradient(135deg, #075985, #0c4a6e)',
                cardBackBackground: 'linear-gradient(145deg, #075985, #0891b2)',
                cardBackBorder: '#22d3ee',
                cardBackPattern: '🐙',
                cardBackColor: '#cffafe'
            },
            {
                name: 'Fire',
                background: 'radial-gradient(circle at center, #7c2d12, #9a3412)',
                border: '#f97316',
                containerBackground: 'linear-gradient(135deg, #7c2d12, #9a3412)',
                cardBackBackground: 'linear-gradient(145deg, #9a3412, #dc2626)',
                cardBackBorder: '#fb923c',
                cardBackPattern: '🔥',
                cardBackColor: '#fed7aa',
                cardBackPatternGlow: '0 0 15px rgba(249, 115, 22, 0.8)'
            }
        ];
        this.currentThemeIndex = 0;
        
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
        
        // Apply initial theme
        if (this.themes.length > 0) {
            this.applyTheme(this.themes[this.currentThemeIndex]);
        }
    }
    
    // Check if connected to multiplayer (helper method to reduce duplication)
    isConnected() {
        return !this.multiplayer || this.multiplayer.connectionStatus === 'connected';
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

    // Check if card is in discard area (centralized helper)
    isCardInDiscardArea(cardElement) {
        // Lazy initialization
        if (!this.discardPileArea) {
            this.discardPileArea = document.getElementById('discard-pile-area');
        }
        if (!this.discardPileContent) {
            this.discardPileContent = document.getElementById('discard-pile-content');
        }
        
        if (!this.discardPileArea) return false;
        
        // Check container first (fastest)
        if (this.discardPileContent && cardElement.parentNode === this.discardPileContent) {
            return true;
        }
        
        // Fallback to area bounds check
        const cardRect = cardElement.getBoundingClientRect();
        const cardCenterX = cardRect.left + cardRect.width / 2;
        const cardCenterY = cardRect.top + cardRect.height / 2;
        const discardRect = this.discardPileArea.getBoundingClientRect();
        
        return cardCenterX >= discardRect.left && cardCenterX <= discardRect.right &&
               cardCenterY >= discardRect.top && cardCenterY <= discardRect.bottom;
    }
    
    // Create card state object from element (helper to reduce duplication)
    createCardStateFromElement(cardElement, overrides = {}) {
        const card = this.getCardFromElement(cardElement);
        const cardRect = cardElement.getBoundingClientRect();
        const table = document.getElementById('card-table');
        const tableRect = table ? table.getBoundingClientRect() : { left: 0, top: 0 };
        
        // Determine location based on discard area check
        const location = this.isCardInDiscardArea(cardElement) ? 'discardPile' : 'table';
        
        return {
            uniqueId: cardElement.dataset.uniqueId,
            card: card,
            position: {
                x: cardRect.left - tableRect.left,
                y: cardRect.top - tableRect.top
            },
            location: location,
            isFlipped: cardElement.classList.contains('flipped'),
            privateTo: cardElement.dataset.privateTo || null,
            zIndex: parseInt(cardElement.style.zIndex) || 0,
            timestamp: Date.now(),
            ...overrides
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
            
            // Set highest z-index for discard pile cards so they always appear on top
            // Increment zIndexCounter and set it with !important to ensure it's highest
            const DRAG_Z_BASE = 10000;
            this.zIndexCounter = Math.max((this.zIndexCounter || DRAG_Z_BASE) + 1, DRAG_Z_BASE);
            cardElement.style.setProperty('z-index', this.zIndexCounter.toString(), 'important');
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
                    // FEATURE DISABLED: Commented out table-click-to-deal feature (might want it back in future)
                    // if (this.isConnected() && e.target.id === 'card-table' && !this.isDragging && !this.preventTableClick && !e.defaultPrevented) {
                    //     this.dealCardToPosition(e.clientX, e.clientY);
                    // }
                }
                
                tableMouseDown = false;
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Don't trigger if user is typing in an input field
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }
            
            if (e.key === 'Escape') {
                if (this.isSelecting) {
                    this.endSelection(e);
                }
                this.clearSelection();
            } else if (e.key === 't' || e.key === 'T') {
                this.cycleTheme();
            } else if (e.key === 'c' || e.key === 'C') {
                this.triggerConfetti();
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
        
        // Get current theme for deck styling
        const currentTheme = this.themes[this.currentThemeIndex] || this.themes[0];
        const pattern = currentTheme.cardBackPattern || '♠';
        
        deckElement.innerHTML = `
            <div class="card-back">
                <div class="card-back-pattern">
                    <div class="card-back-center">${pattern}</div>
                    <div class="card-back-corners">
                        <div class="corner top-left">${pattern}</div>
                        <div class="corner top-right">${pattern}</div>
                        <div class="corner bottom-left">${pattern}</div>
                        <div class="corner bottom-right">${pattern}</div>
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
        deckElement.addEventListener('click', (e) => {
            console.log('[DEAL] Deck clicked', { 
                multiplayer: !!this.multiplayer, 
                connectionStatus: this.multiplayer?.connectionStatus,
                deckExists: !!this.deck,
                deckLength: this.deck?.cards?.length || 0
            });
            this.dealCard();
        });
        
        table.appendChild(deckElement);
        
        // Apply current theme to deck
        const deckCardBack = deckElement.querySelector('.card-back');
        if (deckCardBack) {
            deckCardBack.style.background = currentTheme.cardBackBackground;
            deckCardBack.style.borderColor = currentTheme.cardBackBorder;
            
            const deckCenter = deckCardBack.querySelector('.card-back-center');
            const deckCorners = deckCardBack.querySelectorAll('.card-back-corners .corner');
            
            if (deckCenter) {
                deckCenter.style.color = currentTheme.cardBackColor;
                if (currentTheme.cardBackPatternGlow) {
                    deckCenter.style.textShadow = currentTheme.cardBackPatternGlow;
                } else {
                    deckCenter.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.7)';
                }
            }
            
            deckCorners.forEach(corner => {
                corner.style.color = currentTheme.cardBackColor;
                if (currentTheme.cardBackPatternGlow) {
                    corner.style.textShadow = currentTheme.cardBackPatternGlow;
                } else {
                    corner.style.textShadow = '1px 1px 2px rgba(0, 0, 0, 0.7)';
                }
            });
        }
        
        // Add glow effect if no cards have been dealt yet
        this.updateDeckGlow();
    }
    
    updateDeckGlow() {
        const deckElement = document.querySelector('.deck');
        if (!deckElement) return;
        
        // Check if any cards have been dealt by looking for card elements on the table
        // (excluding the deck itself and any card-back elements that are part of the deck)
        const table = document.getElementById('card-table');
        const cardsOnTable = table ? table.querySelectorAll('.card:not(.deck)').length : 0;
        const hasCardsDealt = cardsOnTable > 0;
        
        // Add or remove glow class based on whether cards have been dealt
        if (hasCardsDealt) {
            deckElement.classList.remove('deck-glow');
        } else {
            deckElement.classList.add('deck-glow');
        }
    }

    dealCard() {
        // Require connection to deal cards (server is authoritative)
        if (!this.isConnected()) {
            return;
        }
        
        console.log('[DEAL] dealCard() called', {
            hasMultiplayer: !!this.multiplayer,
            connectionStatus: this.multiplayer?.connectionStatus,
            hasDeck: !!this.deck,
            deckLength: this.deck?.cards?.length || 0
        });
        
        // Request card from server (server is authoritative)
        console.log('[DEAL] Requesting card from server');
        this.multiplayer.requestDealCard();
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
        
        // Update deck glow after dealing a card
        this.updateDeckGlow();
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
        
        // Get current z-index and reapply it with !important immediately after adding the highlight class
        // This ensures our z-index overrides the highlight class's z-index: 1002 !important
        // Must be synchronous (not in requestAnimationFrame) to prevent delay
        const currentZIndex = cardElement.style.zIndex || window.getComputedStyle(cardElement).zIndex;
        if (currentZIndex && currentZIndex !== 'auto' && currentZIndex !== '0') {
            // Reapply z-index with !important synchronously to override the highlight class's z-index
            cardElement.style.setProperty('z-index', currentZIndex, 'important');
        }
        
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
            const currentPlayerId = this.multiplayer?.playerId;
            if (!currentPlayerId) return false; // Require multiplayer
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
        const playerAlias = this.multiplayer?.playerAlias;
        if (!playerAlias) return; // Require multiplayer
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

    // FEATURE DISABLED: Commented out table-click-to-deal feature (might want it back in future)
    // dealCardToPosition(x, y) {
    //     // Prevent dealing when not connected
    //     if (!this.isConnected()) {
    //         return;
    //     }
    //     
    //     // Use server-authoritative dealing - don't touch local deck
    //     // Server will handle card selection and deck removal
    //     const table = document.getElementById('card-table');
    //     const tableRect = table.getBoundingClientRect();
    //     
    //     // Calculate position relative to table
    //     const relativeX = x - tableRect.left;
    //     const relativeY = y - tableRect.top;
    //     
    //     // Request server to deal card to table at specified position
    //     // Server is authoritative - it will pick the card and remove it from deck
    //     this.multiplayer.requestDealCardToTable(relativeX, relativeY);
    // }

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
        
        // Set z-index to bring new card to front (ensure it's at least 10000)
        const DRAG_Z_BASE = 10000;
        this.zIndexCounter = Math.max((this.zIndexCounter || 0) + 1, DRAG_Z_BASE);
        cardElement.style.zIndex = this.zIndexCounter;
        
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
        
        // Determine what to display in the middle: image, emoji, or ?
        let symbolContent = '';
        if (safeCard.image) {
            // Use image if provided
            symbolContent = `<img src="${safeCard.image}" alt="${displayTitle}" style="width: ${imageSize}px; height: ${imageSize}px; object-fit: contain;">`;
        } else if (safeCard.emoji) {
            // Use emoji if no image
            symbolContent = safeCard.emoji;
        } else {
            // Fallback to ?
            symbolContent = '?';
        }
        
        cardFace.innerHTML = `
            <div style="font-size: 14px; color: ${textColor};">${displayTitle}</div>
            <div style="font-size: ${imageSize}px; display: flex; align-items: center; justify-content: center;">${symbolContent}</div>
            ${deck.invertTitle ? `<div style="font-size: 14px; transform: rotate(180deg); color: ${textColor};">${displayTitle}</div>` : ''}
        `;
        
        // Create card back
        const cardBack = document.createElement('div');
        cardBack.className = 'card-back';
        
        // Get current theme for card back styling
        const currentTheme = this.themes[this.currentThemeIndex] || this.themes[0];
        const pattern = currentTheme.cardBackPattern || '♠';
        
        cardBack.innerHTML = `
            <div class="card-back-pattern">
                <div class="card-back-center">${pattern}</div>
                <div class="card-back-corners">
                    <div class="corner top-left">${pattern}</div>
                    <div class="corner top-right">${pattern}</div>
                    <div class="corner bottom-left">${pattern}</div>
                    <div class="corner bottom-right">${pattern}</div>
                </div>
            </div>
        `;
        
        // Apply current theme styles to the new card back
        cardBack.style.background = currentTheme.cardBackBackground;
        cardBack.style.borderColor = currentTheme.cardBackBorder;
        
        const center = cardBack.querySelector('.card-back-center');
        const corners = cardBack.querySelectorAll('.card-back-corners .corner');
        
        if (center) {
            center.style.color = currentTheme.cardBackColor;
            if (currentTheme.cardBackPatternGlow) {
                center.style.textShadow = currentTheme.cardBackPatternGlow;
            } else {
                center.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.7)';
            }
        }
        
        corners.forEach(corner => {
            corner.style.color = currentTheme.cardBackColor;
            if (currentTheme.cardBackPatternGlow) {
                corner.style.textShadow = currentTheme.cardBackPatternGlow;
            } else {
                corner.style.textShadow = '1px 1px 2px rgba(0, 0, 0, 0.7)';
            }
        });
        
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
        return colorMap[color] || color;
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
            if (!this.isConnected()) {
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
                
                // Handle card touch (click without drag) - increment z-index
                const deltaX = Math.abs(e.clientX - startX);
                const deltaY = Math.abs(e.clientY - startY);
                const wasClick = !isDragging && deltaX < this.dragThreshold && deltaY < this.dragThreshold;
                
                if (wasClick && clickDuration < 300) {
                    // Card was touched (clicked) without dragging - increment z-index
                    const DRAG_Z_BASE = 10000;
                    this.zIndexCounter = Math.max(this.zIndexCounter + 1, DRAG_Z_BASE);
                    
                    // Set z-index with !important to ensure it overrides any CSS classes (like card-highlight)
                    // Must set it synchronously, not in requestAnimationFrame, to ensure it takes effect immediately
                    cardElement.style.setProperty('z-index', this.zIndexCounter.toString(), 'important');
                    
                    // Send updated z-index to server
                    if (this.isConnected()) {
                        const cardState = this.createCardStateFromElement(cardElement);
                        cardState.zIndex = this.zIndexCounter; // Use the new z-index
                        this.multiplayer.requestCardStateUpdate([cardState]);
                    }
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
                    // Use mouse drop position (e.clientX/Y) as primary check - more accurate than card center
                    let handledByDiscardDrop = false;
                    if (this.discardPileArea && this.discardPileContent) {
                        const discardRect = this.discardPileArea.getBoundingClientRect();
                        // Check mouse drop position first (most accurate), then card center as fallback
                        const mouseInDiscard = e && (e.clientX >= discardRect.left && e.clientX <= discardRect.right &&
                                                     e.clientY >= discardRect.top && e.clientY <= discardRect.bottom);
                        const cardInDiscard = cardCenterX >= discardRect.left && cardCenterX <= discardRect.right &&
                                             cardCenterY >= discardRect.top && cardCenterY <= discardRect.bottom;
                        const isInDiscardArea = mouseInDiscard || cardInDiscard;
                        
                        if (isInDiscardArea && cardElement.parentNode !== this.discardPileContent) {
                            // Check if card is part of a selection (reuse same logic as right-click discard)
                            if (this.selectedCards.length > 0 && this.selectedCards.includes(cardElement)) {
                                // Discard all selected cards
                                const selectedCards = [...this.selectedCards];
                                const selectedCardData = selectedCards.map(cardEl => this.getCardFromElement(cardEl));
                                this.addCardsToDiscardPile(selectedCards, selectedCardData);
                                // Clear selection after discarding
                                this.clearSelection();
                            } else {
                                // Discard single card
                                this.addCardToDiscardPile(cardElement, card);
                            }
                            handledByDiscardDrop = true;
                        }
                    }

                    // Determine discard area membership and handle transitions by area (not container)
                    // Only handle this if we haven't already handled a discard drop with selected cards
                    if (!handledByDiscardDrop && this.isCardInDiscardArea(cardElement)) {
                        // Check if card is part of a selection (reuse same logic as right-click discard)
                        if (this.selectedCards.length > 0 && this.selectedCards.includes(cardElement)) {
                            // Discard all selected cards
                            const selectedCards = [...this.selectedCards];
                            const selectedCardData = selectedCards.map(cardEl => this.getCardFromElement(cardEl));
                            this.addCardsToDiscardPile(selectedCards, selectedCardData);
                            // Clear selection after discarding
                            this.clearSelection();
                            handledByDiscardDrop = true; // Mark as handled
                        } else {
                            // Snap into discard visuals and broadcast discard state
                            this.addCardToDiscardPile(cardElement, card);
                        }
                    } else if (!handledByDiscardDrop) {
                        // Ensure it's considered on table and broadcast position/location
                        if (this.isConnected()) {
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
                    
                    // Request card state update to server (only if not a remote update)
                    if (!handledByDiscardDrop && this.isConnected() && cardElement.dataset.remoteUpdate !== 'true' && !cardElement.dataset.beingRemoved) {
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
                    // Use the current z-index from the element (which was set during drag start)
                    // The z-index should already be set correctly from drag start, so just ensure it's valid
                    const currentZIndex = parseInt(cardElement.style.zIndex || '0', 10);
                    if (currentZIndex > 0) {
                        this.zIndexCounter = Math.max(this.zIndexCounter || 10000, currentZIndex);
                    }
                    
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
            if (!this.isConnected()) {
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
            if (!this.isConnected()) {
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
            
            // Set highest z-index to ensure tooltip appears above all cards
            // Use very high z-index (below menus/overlays but above all cards)
            const TOOLTIP_Z_INDEX = 9999990;
            tooltip.style.zIndex = TOOLTIP_Z_INDEX.toString();
            
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
        if (this.isConnected()) {
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
            if (this.isConnected()) {
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
            
            // Update deck glow in case this was the last card
            this.updateDeckGlow();
            
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
        if (this.isConnected()) {
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
        
        // Update deck glow (will be shown since all cards are cleared)
        this.updateDeckGlow();
        
        // Request reset game to server (only if this is a user-initiated reset)
        if (shouldBroadcast && this.isConnected()) {
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
            const position = positionsArray[index] || positionsArray[0];
            const cardState = this.createCardStateFromElement(cardElement, { position });
            // Ensure z-index is included (use current z-index from element)
            const currentZIndex = parseInt(cardElement.style.zIndex || '0', 10);
            if (currentZIndex > 0) {
                cardState.zIndex = currentZIndex;
            }
            return cardState;
        });
        
        // Send all card movements in single array update
        if (this.isConnected()) {
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
            // This also sets the highest z-index on the element
            this.positionCardInDiscardPileElement(cardElement, cardCount);
            
            // After helper positioned, read absolute left/top off the element (already table-relative)
            const absoluteX = parseInt(cardElement.style.left, 10) || 0;
            const absoluteY = parseInt(cardElement.style.top, 10) || 0;
            
            // Get the z-index that was set on the element (from positionCardInDiscardPileElement)
            // This ensures the discard pile card has the highest z-index
            const zIndexValue = parseInt(cardElement.style.zIndex || '0', 10) || (this.zIndexCounter || 10000);
            
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
                zIndex: zIndexValue, // Use the z-index set on the element (highest)
                timestamp: Date.now()
            };
        });
        
        // Only send if we have valid card states
        if (cardStates.length > 0) {
            // Send all discarded cards in single array update
            if (this.isConnected()) {
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
            return this.isCardInDiscardArea(card);
        });
        
        // Combine both sets
        const allDiscardCards = [...discardPileContainerCards, ...discardCardElementsByPosition];
        const discardCardUniqueIds = allDiscardCards.map(card => card.dataset.uniqueId).filter(Boolean);
        
        console.log('DISCARD PILE CARDS TO SHUFFLE:', discardCardUniqueIds.length, discardCardUniqueIds);
        
        if (discardCardUniqueIds.length === 0) {
            console.log('No cards in discard pile to shuffle');
            return;
        }
        
        // Require connection to shuffle (server is authoritative)
        if (!this.isConnected()) {
            return;
        }
        
        // Request shuffle through multiplayer manager (server is authoritative)
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
        let count = 0;
        
        document.querySelectorAll('.card').forEach(card => {
            // Skip cards in private hand zones
            if (card.dataset.privateTo) {
                return;
            }
            if (this.isCardInDiscardArea(card)) {
                count++;
            }
        });
        
        return count;
    }
    
    // ===== MULTI-CARD SELECTION METHODS =====
    
    // Check if a card can be selected
    isCardSelectable(cardElement) {
        // Exclude discard pile cards
        if (this.isCardInDiscardArea(cardElement)) {
            return false;
        }
        
        // Exclude other players' private cards (if multiplayer is active)
        const privateTo = cardElement.dataset.privateTo;
        const currentPlayerId = this.multiplayer?.playerId;
        if (currentPlayerId && privateTo && privateTo !== currentPlayerId) {
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
        // Get player alias if available (for color), but don't require it
        const playerAlias = this.multiplayer?.playerAlias;
        const selectionColor = playerAlias ? this.generatePlayerColor(playerAlias) : '#FFD700'; // Default golden color
        
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
        if (!this.isConnected()) {
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
        if (!this.isConnected()) {
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
        
        // Get mouse drop position (where the user released the mouse)
        const mouseDropX = e ? e.clientX : 0;
        const mouseDropY = e ? e.clientY : 0;
        
        // Also get center of selection group and check if any selected card is in drop zones
        // This handles the case where dragging a single card to a drop zone
        const firstCard = selectedCards[0];
        const firstRect = firstCard.getBoundingClientRect();
        const groupCenterX = firstRect.left + firstRect.width / 2;
        const groupCenterY = firstRect.top + firstRect.height / 2;
        
        // Check drop zones - check mouse position, group center, and any selected card position
        const privateHandZone = document.getElementById('private-hand-zone');
        if (privateHandZone) {
            const zoneRect = privateHandZone.getBoundingClientRect();
            // Check if mouse drop, group center, or any selected card is in private zone
            const isInPrivateZone = (mouseDropX >= zoneRect.left && mouseDropX <= zoneRect.right &&
                                     mouseDropY >= zoneRect.top && mouseDropY <= zoneRect.bottom) ||
                                    (groupCenterX >= zoneRect.left && groupCenterX <= zoneRect.right &&
                                     groupCenterY >= zoneRect.top && groupCenterY <= zoneRect.bottom) ||
                                    selectedCards.some(card => {
                                        const rect = card.getBoundingClientRect();
                                        const centerX = rect.left + rect.width / 2;
                                        const centerY = rect.top + rect.height / 2;
                                        return centerX >= zoneRect.left && centerX <= zoneRect.right &&
                                               centerY >= zoneRect.top && centerY <= zoneRect.bottom;
                                    });
            
            if (isInPrivateZone) {
                // Drop in private zone - organize cards
                const currentPlayerId = this.multiplayer?.playerId;
                if (!currentPlayerId) return; // Require multiplayer
                
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
                if (this.isConnected()) {
                    const cardStates = selectedCards.map(cardElement => 
                        this.createCardStateFromElement(cardElement, { privateTo: currentPlayerId })
                    );
                    this.multiplayer.requestCardStateUpdate(cardStates);
                }
                
                // Update display
                this.updatePrivateHandDisplay();
                return;
            }
        }
        
        // Check discard pile area - prioritize mouse drop position (most reliable indicator)
        // This handles dragging a single card from selection to discard pile
        // Reuse same logic pattern as right-click discard for consistency
        if (this.discardPileArea && selectedCards.length > 0) {
            const discardRect = this.discardPileArea.getBoundingClientRect();
            let isInDiscardArea = false;
            
            // Primary check: mouse drop position (where user released mouse) - most accurate
            if (e && typeof e.clientX === 'number' && typeof e.clientY === 'number') {
                const mouseInDiscard = e.clientX >= discardRect.left && e.clientX <= discardRect.right &&
                                      e.clientY >= discardRect.top && e.clientY <= discardRect.bottom;
                if (mouseInDiscard) {
                    isInDiscardArea = true;
                }
            }
            
            // Secondary check: use helper method to check if any card is in discard area
            // This works even if cards were constrained and didn't end up in discard area
            if (!isInDiscardArea) {
                const anyCardInDiscardArea = selectedCards.some(card => this.isCardInDiscardArea(card));
                if (anyCardInDiscardArea) {
                    isInDiscardArea = true;
                }
            }
            
            // Tertiary check: any selected card center is in discard area
            if (!isInDiscardArea) {
                const anyCardCenterInDiscard = selectedCards.some(card => {
                    const rect = card.getBoundingClientRect();
                    const centerX = rect.left + rect.width / 2;
                    const centerY = rect.top + rect.height / 2;
                    return centerX >= discardRect.left && centerX <= discardRect.right &&
                           centerY >= discardRect.top && centerY <= discardRect.bottom;
                });
                if (anyCardCenterInDiscard) {
                    isInDiscardArea = true;
                }
            }
            
            // Fourth check: group center as fallback
            if (!isInDiscardArea) {
                const groupCenterInDiscard = groupCenterX >= discardRect.left && groupCenterX <= discardRect.right &&
                                            groupCenterY >= discardRect.top && groupCenterY <= discardRect.bottom;
                if (groupCenterInDiscard) {
                    isInDiscardArea = true;
                }
            }
            
            if (isInDiscardArea) {
                // Drop in discard pile - discard all selected cards (reuse same logic as right-click discard)
                const cards = selectedCards.map(card => this.getCardFromElement(card));
                this.addCardsToDiscardPile(selectedCards, cards);
                
                // Clear selection
                this.clearSelection();
                return;
            }
        }
        
        // Drop on table - maintain positions and make cards visible to all players
        // Clear privateTo for all cards when dropping on table
        selectedCards.forEach(cardElement => {
            cardElement.dataset.privateTo = null;
        });
        
        const cardStates = selectedCards.map(cardElement => 
            this.createCardStateFromElement(cardElement, { privateTo: null })
        );
        
        // Clear selection
        this.clearSelection();
        
        // Send update to server
        if (this.isConnected()) {
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
        // Menu toggle (external - always visible when menu closed)
        document.getElementById('menu-toggle').addEventListener('click', () => this.toggleSideMenu());
        // Menu toggle (internal - scrolls with menu when open)
        document.getElementById('menu-toggle-internal').addEventListener('click', () => this.toggleSideMenu());
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
               deckId === 'nomad' ||
               this.customDecks.has(deckId);
    }
    
    clearBoard() {
        // Remove all cards from the table (except the deck)
        const cardTable = document.getElementById('card-table');
        const cards = cardTable.querySelectorAll('.card:not(.deck)');
        cards.forEach(card => card.remove());
        
        // Clear the dealt cards array
        this.dealtCards = [];
        
        // Update deck glow since all cards are cleared
        this.updateDeckGlow();
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
            gameTitle = `${gameTitle}`;
            gameDescription = `${gameDescription}`;
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
        
        // Add nomad deck
        const nomadDeck = new NomadDeck();
        const nomadItem = this.createDeckItem('nomad', nomadDeck.name, nomadDeck.cards.length, true);
        deckList.appendChild(nomadItem);
        
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
        } else if (deckId === 'nomad') {
            this.deck = new NomadDeck();
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
        if (shouldBroadcast && this.isConnected()) {
            const deckData = this.deck.exportToJSON();
            // originalDeckSize is already set above - don't overwrite with current size
            this.multiplayer.requestDeckUpdate(deckId, deckData);
        }
        
        console.log(`Loaded deck: ${this.deck.name}, original size: ${this.originalDeckSize}`);
    }
    
    loadRemoteDeck(deckData, skipClearBoard = false) {
        console.log('Loading remote deck from server:', deckData.name);
        
        // Clear any existing cards from the board (unless we're skipping for shuffle)
        if (!skipClearBoard) {
            this.clearBoard();
        }
        
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
            document.getElementById('deck-name').value = deckData.name || '';
            document.getElementById('deck-description').value = deckData.description || '';
            // Only include cards and invertTitle in JSON (not name/description)
            const jsonData = {
                cards: deckData.cards || [],
                invertTitle: deckData.invertTitle || false
            };
            document.getElementById('deck-json').value = JSON.stringify(jsonData, null, 2);
        } else {
            // Creating new deck
            title.textContent = 'Create New Deck';
            // Get default deck data to extract name and description for form fields
            const defaultDeckData = JSON.parse(this.getDefaultDeckJSON());
            document.getElementById('deck-name').value = defaultDeckData.name || '';
            document.getElementById('deck-description').value = defaultDeckData.description || '';
            // Only include cards and invertTitle in JSON (not name/description)
            const jsonData = {
                cards: defaultDeckData.cards || [],
                invertTitle: defaultDeckData.invertTitle || false
            };
            document.getElementById('deck-json').value = JSON.stringify(jsonData, null, 2);
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
            "name": "Example Deck",
            "description":
`<p>You can use html in your deck descriptions.</p>
<br>
<ul>
    <li>Tell your <strong>story</strong></li>
    <li>List your game <strong>rules</strong></li>
    <li>Even add <strong>images</strong> here</li>
</ul>`,
            "cards": [
                {
                    "title": "Ruby Gem",
                    "description": "A valuable red gemstone. This is shown when you hover over the card!",
                    "emoji": "💎",
                    "color": "#ff0000",
                    "imageSize": 32
                },
                {
                    "title": "Wild Card",
                    "description": "This card uses the 'wild' color type instead of a hex code.",
                    "emoji": "🌟",
                    "color": "wild",
                    "imageSize": 28
                },
                {
                    "title": "Orange Fire",
                    "description": "This card uses a GIF image instead of an emoji!",
                    "image": "./src/shared/images/fire.gif",
                    "color": "neutral",
                    "imageSize": 30
                },
                {
                    "title": "Ocean Wave",
                    "description": "The deep blue ocean. Hex colors like #0066cc give you precise control.",
                    "emoji": "🌊",
                    "color": "#0066cc",
                    "imageSize": 36
                },
                {
                    "title": "Purple Potion",
                    "description": "A magical purple potion with custom hex color #9932CC",
                    "emoji": "🧪",
                    "color": "#9932CC",
                    "imageSize": 24
                },
                {
                    "title": "Golden Sun",
                    "description": "A bright golden sun. Try hovering to see this description!",
                    "emoji": "☀️",
                    "color": "#ffd700",
                    "imageSize": 40
                },
                {
                    "title": "Green Forest",
                    "description": "A lush green forest card demonstrating hex color #228B22",
                    "emoji": "🌲",
                    "color": "#228B22"
                },
                {
                    "title": "Silver Moon",
                    "description": "A silver moon card. You can use any hex color or named color!",
                    "emoji": "🌙",
                    "color": "#c0c0c0",
                    "imageSize": 34
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
        const currentPlayerId = this.multiplayer?.playerId;
        if (!currentPlayerId) return; // Require multiplayer
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
    
    cycleTheme() {
        // Cycle to next theme
        this.currentThemeIndex = (this.currentThemeIndex + 1) % this.themes.length;
        this.applyTheme(this.themes[this.currentThemeIndex]);
    }
    
    applyTheme(theme) {
        const cardTable = document.getElementById('card-table');
        const gameContainer = document.getElementById('game-container');
        
        if (!cardTable) return;
        
        // Apply theme styles to board
        cardTable.style.background = theme.background;
        cardTable.style.borderColor = theme.border;
        
        // Apply theme to game container background
        if (gameContainer && theme.containerBackground) {
            gameContainer.style.background = theme.containerBackground;
        }
        
        // Also update body background to match theme
        if (theme.containerBackground) {
            document.body.style.background = theme.containerBackground;
        }
        
        // Apply theme to all card backs
        const cardBacks = document.querySelectorAll('.card-back');
        cardBacks.forEach(cardBack => {
            cardBack.style.background = theme.cardBackBackground;
            cardBack.style.borderColor = theme.cardBackBorder;
        });
        
        // Apply theme to card back patterns (center and corners)
        const cardBackCenters = document.querySelectorAll('.card-back-center');
        const cardBackCorners = document.querySelectorAll('.card-back-corners .corner');
        
        cardBackCenters.forEach(center => {
            center.textContent = theme.cardBackPattern;
            center.style.color = theme.cardBackColor;
            if (theme.cardBackPatternGlow) {
                center.style.textShadow = theme.cardBackPatternGlow;
            } else {
                center.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.7)';
            }
        });
        
        cardBackCorners.forEach(corner => {
            corner.textContent = theme.cardBackPattern;
            corner.style.color = theme.cardBackColor;
            if (theme.cardBackPatternGlow) {
                corner.style.textShadow = theme.cardBackPatternGlow;
            } else {
                corner.style.textShadow = '1px 1px 2px rgba(0, 0, 0, 0.7)';
            }
        });
        
        // Update deck element (it uses .card-back class)
        const deckElement = document.querySelector('.deck');
        if (deckElement) {
            const deckCardBack = deckElement.querySelector('.card-back');
            if (deckCardBack) {
                deckCardBack.style.background = theme.cardBackBackground;
                deckCardBack.style.borderColor = theme.cardBackBorder;
                
                const deckCenter = deckCardBack.querySelector('.card-back-center');
                const deckCorners = deckCardBack.querySelectorAll('.card-back-corners .corner');
                
                if (deckCenter) {
                    deckCenter.textContent = theme.cardBackPattern;
                    deckCenter.style.color = theme.cardBackColor;
                    if (theme.cardBackPatternGlow) {
                        deckCenter.style.textShadow = theme.cardBackPatternGlow;
                    } else {
                        deckCenter.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.7)';
                    }
                }
                
                deckCorners.forEach(corner => {
                    corner.textContent = theme.cardBackPattern;
                    corner.style.color = theme.cardBackColor;
                    if (theme.cardBackPatternGlow) {
                        corner.style.textShadow = theme.cardBackPatternGlow;
                    } else {
                        corner.style.textShadow = '1px 1px 2px rgba(0, 0, 0, 0.7)';
                    }
                });
            }
        }
        
        console.log(`Theme changed to: ${theme.name}`);
    }
    
    triggerConfetti() {
        // Show confetti locally
        this.showConfetti();
        
        // Broadcast confetti event to all players (if connected)
        if (this.multiplayer && this.multiplayer.isSocketReady()) {
            this.multiplayer.sendMessage({
                type: 'confetti'
            });
        }
    }
    
    showConfetti() {
        // Create confetti canvas
        const canvas = document.createElement('canvas');
        canvas.id = 'confetti-canvas';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '9999999';
        document.body.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        
        // Resize handler for canvas
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        
        // Confetti particles
        const particles = [];
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ff8800', '#8800ff'];
        const particleCount = 150;
        
        // Create particles
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: -10,
                vx: (Math.random() - 0.5) * 4,
                vy: Math.random() * 3 + 2,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * 8 + 4,
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 10
            });
        }
        
        // Animation loop
        let animationId;
        let isCleanedUp = false;
        
        const cleanup = () => {
            if (isCleanedUp) return;
            isCleanedUp = true;
            
            window.removeEventListener('resize', resizeCanvas);
            if (canvas.parentNode) {
                canvas.remove();
            }
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
        };
        
        window.addEventListener('resize', resizeCanvas);
        
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            let activeParticles = 0;
            
            particles.forEach(particle => {
                // Update position
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.vy += 0.15; // Gravity
                particle.rotation += particle.rotationSpeed;
                
                // Draw particle
                ctx.save();
                ctx.translate(particle.x, particle.y);
                ctx.rotate(particle.rotation * Math.PI / 180);
                ctx.fillStyle = particle.color;
                ctx.beginPath();
                ctx.rect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
                ctx.fill();
                ctx.restore();
                
                // Check if particle is still on screen
                if (particle.y < canvas.height + 20) {
                    activeParticles++;
                }
            });
            
            if (activeParticles > 0) {
                animationId = requestAnimationFrame(animate);
            } else {
                // Clean up when done
                cleanup();
            }
        };
        
        // Start animation
        animate();
        
        // Safety cleanup after 5 seconds
        setTimeout(cleanup, 5000);
    }
    
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.cardGame = new CardGame();
    console.log('The Nomad Card Game initialized!');
});
