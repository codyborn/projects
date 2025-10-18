// Custom Card System - Focused on visual appearance
class Card {
    constructor(cardData = {}) {
        // Visual properties only
        this.title = cardData.title || 'Card';
        this.description = cardData.description || '';
        this.image = cardData.image || '';
        this.emoji = cardData.emoji || '';
        this.color = cardData.color || '';
        this.faceUp = false;
    }

    toString() {
        return this.title;
    }
}

class Deck {
    constructor(customCards = null) {
        this.cards = [];
        this.name = 'Standard Deck';
        this.description = 'Standard 52-card deck';
        this.invertTitle = true;
        
        if (customCards) {
            this.loadCustomDeck(customCards);
        } else {
            this.initializeDeck();
        }
    }

    initializeDeck() {
        const suits = [
            { emoji: '♥️', name: 'hearts' },
            { emoji: '♦️', name: 'diamonds' },
            { emoji: '♣️', name: 'clubs' },
            { emoji: '♠️', name: 'spades' }
        ];
        const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        
        this.cards = [];
        
        suits.forEach(suit => {
            ranks.forEach(rank => {
                this.cards.push(new Card({
                    title: rank,
                    emoji: suit.emoji,
                    description: ''
                }));
            });
        });
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
        this.initializeDeck();
    }
    
    loadCustomDeck(deckData) {
        this.cards = [];
        this.name = deckData.name || 'Custom Deck';
        this.description = deckData.description || 'Custom deck';
        this.invertTitle = deckData.invertTitle;
        
        if (deckData.cards && Array.isArray(deckData.cards)) {
            deckData.cards.forEach(cardData => {
                const cardCount = cardData.count ?? 1;
                for (let i = 0; i < cardCount; i++) {
                    const card = new Card({
                        title: cardData.title,
                        description: cardData.description,
                        image: cardData.image,
                        emoji: cardData.emoji,
                        color: cardData.color
                    });
                    this.cards.push(card);
                }
            });
        }
    }
    
    setMetadata(name, description) {
        this.name = name;
        this.description = description;
    }
    
    exportToJSON() {
        return {
            name: this.name,
            description: this.description,
            cards: this.cards.map(card => ({
                title: card.title,
                description: card.description,
                image: card.image,
                emoji: card.emoji
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
