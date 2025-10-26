// Virus Deck - The Most Contagious Card Game
class VirusDeck extends Deck {
    constructor() {
        super();
        this.name = 'VIRUS!';
        this.description = `
            <h3>The Most Contagious Card Game</h3>
            <p><strong>Players:</strong> 2-6 | <strong>Goal:</strong> Be the first to collect 4 different healthy organs</p>
            
            <h4>How to Play:</h4>
            <ul>
                <li><strong>Each turn:</strong> Play 1 card OR discard cards, then draw to maintain 3 cards in hand</li>
                <li><strong>Healthy organs</strong> are virus-free, vaccinated, or immunized</li>
                <li><strong>Win:</strong> Have 4 different healthy organs in your body</li>
            </ul>
            
            <h4>Card Types:</h4>
            <ul>
                <li><strong>🫀 ORGANS</strong> - Build your body (Heart, Lungs, Brain, Bones)</li>
                <li><strong>🦠 VIRUSES</strong> - Infect/destroy organs of the same color</li>
                <li><strong>💊 MEDICINES</strong> - Cure viruses or vaccinate organs</li>
                <li><strong>🔄 TREATMENTS</strong> - Special effects (Transplant, Organ Thief, etc.)</li>
            </ul>
            
            <h4>Key Rules:</h4>
            <ul>
                <li>Viruses and medicines affect organs of the <strong>same color</strong></li>
                <li><strong>Two medicines</strong> on one organ = <strong>immunized forever</strong></li>
                <li><strong>Multicolor cards</strong> affect any color but are vulnerable to any attack</li>
                <li>You cannot have <strong>two organs of the same color</strong> in your body</li>
            </ul>
        `;
        this.invertTitle = false;
        
        this.initializeDeck();
    }
    
    initializeDeck() {
        this.cards = [];
        
        // Organ Cards (5 total) - 1 of each color + 1 Wild
        this.addCardType("Heart", "red", "🫀", 4);
        this.addCardType("Lungs", "green", "🫁", 4);
        this.addCardType("Brain", "blue", "🧠", 4);
        this.addCardType("Bones", "yellow", "🦴", 4);
        this.addCardType("Any", "wild", "👤", 4);
        
        // Virus Cards (20 total) - 4 of each color
        this.addCardType("Heart", "red", "🦠", 4);
        this.addCardType("Brain", "blue", "🦠", 4);
        this.addCardType("Lungs", "green", "🦠", 4);
        this.addCardType("Bone", "yellow", "🦠", 4);
        this.addCardType("Any", "wild", "🦠", 1);
        
        // Medicine Cards (20 total) - 4 of each color
        this.addCardType("Heart", "red", "💊", 4);
        this.addCardType("Brain", "blue", "💊", 4);
        this.addCardType("Lungs", "green", "💊", 4);
        this.addCardType("Bone", "yellow", "💊", 4);
        this.addCardType("Any", "wild", "💊", 1);
        
        // Treatment Cards (23 total) - Various types
        this.addCardType("Transplant", "neutral", "🫀🔄🧠", 4, "Exchange an organ with another player", 16);
        this.addCardType("Organ Thief", "neutral", "🥷", 4, "Steal an organ from another player");
        this.addCardType("Contagion", "neutral", "☣️", 4, "Transfer viruses to other players");
        this.addCardType("Latex Glove", "neutral", "🧤", 4, "All players discard their hand");
        this.addCardType("Medical Error", "neutral", "👤🔄👤", 4, "Swap your entire body with another player", 16);
    }
    
    addCardType(title, color, emoji, count, description = "", imageSize = 24) {
        for (let i = 0; i < count; i++) {
            const cardData = {
                title: title,
                emoji: emoji,
                description: description,
                color: color,
                imageSize: imageSize
            };
            this.addCardFromData(cardData, i);
        }
    }
    
    reset() {
        this.initializeDeck();
    }
}
