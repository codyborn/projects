// Custom Card System - Focused on visual appearance
class Card {
    constructor(cardData = {}) {
        // Visual properties only
        this.title = cardData.title || 'Card';
        this.description = cardData.description || '';
        this.image = cardData.image || '';
        this.emoji = cardData.emoji || '';
        this.imageSize = cardData.imageSize || 24;
        this.color = cardData.color || '';
        this.faceUp = false;
        
        // Unique identification for multiplayer synchronization
        this.instanceId = cardData.instanceId;
        this.uniqueId = cardData.uniqueId;
    }

    toString() {
        return this.title;
    }
}

class Deck {
    constructor(deckData = null) {
        this.cards = [];
        this.name = 'Deck';
        this.description = 'Base deck';
        this.invertTitle = false;
        
        if (deckData) {
            this.name = deckData.name || 'Custom Deck';
            this.description = deckData.description || 'Custom deck';
            this.invertTitle = deckData.invertTitle;
            
            if (deckData.cards && Array.isArray(deckData.cards)) {
                deckData.cards.forEach(cardData => {
                    const cardCount = cardData.count ?? 1;
                    for (let i = 0; i < cardCount; i++) {
                        this.addCardFromData(cardData, i);
                    }
                });
            }
        }
    }
    
    // Helper method to create a card with proper unique ID
    addCardFromData(cardData, instanceId) {
        const uniqueId = this.generateCardUniqueId(cardData, instanceId);
        
        const card = new Card({
            title: cardData.title,
            description: cardData.description,
            image: cardData.image,
            emoji: cardData.emoji,
            imageSize: cardData.imageSize,
            color: cardData.color,
            instanceId: instanceId,
            uniqueId: uniqueId
        });
        this.cards.push(card);
        return card;
    }


    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    deal() {
        return this.cards.pop();
    }

    addCard(card) {
        this.cards.push(card);
    }

    addCards(cards) {
        this.cards.push(...cards);
    }

    get length() {
        return this.cards.length;
    }

    isEmpty() {
        return this.cards.length === 0;
    }

    reset() {
        // Abstract method - subclasses should override this
        throw new Error('reset() method must be implemented by subclass');
    }
    
    // Generate unique ID based on card content with deterministic instance tracking
    generateCardUniqueId(cardData, instanceId) {

        // Loop through all properties of the card data
        const contentParts = [`${instanceId}`];
        for (const [key, value] of Object.entries(cardData)) {
            // Skip the count property as it's not part of the card's identity
            if (key !== 'count') {
                contentParts.push(`${key}:${value}`);
            }
        }
        // Sort properties to ensure consistent ordering
        contentParts.sort();
        const contentString = contentParts.join('|');
        
        // Use encodeURIComponent to handle Unicode characters, then create a hash
        const encoded = encodeURIComponent(contentString);
        
        // Create a simple hash from the encoded string
        let hash = 0;
        for (let i = 0; i < encoded.length; i++) {
            const char = encoded.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        
        // Create base ID from content hash
        const baseId = `card_${Math.abs(hash).toString(36)}`;
        
        return `${baseId}_${instanceId}`;
    }
    
    setMetadata(name, description) {
        this.name = name;
        this.description = description;
    }
    
    exportToJSON() {
        return {
            name: this.name,
            description: this.description,
            invertTitle: this.invertTitle,
            cards: this.cards.map(card => ({
                title: card.title,
                description: card.description,
                image: card.image,
                emoji: card.emoji,
                imageSize: card.imageSize,
                color: card.color,
                instanceId: card.instanceId,
                uniqueId: card.uniqueId
            }))
        };
    }
}

// Create a global cards object to match cards.js API
window.cards = {

    // Initialize function (minimal implementation)
    init: function(options) {
        console.log('Cards system initialized with options:', options);
        return true;
    },

    // Deck class
    Deck: Deck,
    
    // Card class
    Card: Card
};

console.log('Custom card system loaded successfully!');
