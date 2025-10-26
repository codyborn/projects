// Standard Deck - 52-card playing deck
class StandardDeck extends Deck {
    constructor() {
        super();
        this.name = 'Standard Deck';
        this.description = 'Standard 52-card deck';
        this.invertTitle = true;
        
        this.initializeDeck();
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
                const cardData = {
                    title: rank,
                    emoji: suit.emoji,
                    description: '',
                    color: ''
                };
                const instanceId = `${rank}_${suit.name}`;
                this.addCardFromData(cardData, instanceId);
            });
        });
    }
    
    reset() {
        this.initializeDeck();
    }
}
