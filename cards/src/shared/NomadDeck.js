// The Nomad — Core Edition Deck
class NomadDeck extends Deck {
    constructor() {
      super();
      this.name = 'THE NOMAD';
      this.description = `
        <h3>Visit every continent. Out-plan your rivals. Don't go broke.</h3>
        <br>
        <p>As a digital nomad, you’re always chasing adventure. But when it's a race to visit every continent, every move counts. Along the way, you'll pick up handy gear and remote gigs to fuel your travels, but linger too long in one place and your rivals will leave you in the dust.</p>
        <p><strong>Players:</strong> 2–4 |
           <strong>Goal:</strong> Score the most points by visiting cities. First player to visit all 7 continents ends the game and gains +3 bonus points.</p>
        <br>
        <h4>How to Play</h4>
        <ul>
          <li><strong>Each turn:</strong> Play 1 card (City, Income, Item, or Event) <em>or</em> discard any number of cards, then draw until you have 3 cards.</li>
          <li><strong>Travel:</strong> Your first City is free (starting point). Traveling to a new continent costs = <strong>$3,000 + $1,000 x continent hops</strong> on the mini-map. Cities on the same continent are <strong>free</strong>. Place a City card toward the middle of the board to indicate your current location.</li>
          <li><strong>Scoring:</strong> +1 point per City you visit. First to all 7 continents gains <strong>+3 points</strong> and ends the game.</li>
          <li><strong>Placing vs. Using:</strong> <em>Placing</em> an Income card or Item card from your hand consumes your turn. <em>Using</em> Income cards (spending money) or Items (activating effects) does not.</li>
        </ul>
        <br>
        <h4>Mini-Map</h4>
        <img src="./src/shared/images/nomad-mini-map.png" alt="Nomad Mini-Map" style="width: 100%; height: auto;">
        <br>
        <h4>Card Types</h4>
        <ul>
          <li><strong>🏙️ CITIES</strong> — Play to travel and score points (1 each). Track your current continent via your latest City. Place your current City toward the middle of the board.</li>
          <li><strong>💵 INCOME</strong> — <em>Place</em> an Income card (uses your turn) to add it to your bank account. Income cards stay on the table until you <em>spend</em> them (does not use a turn). You must spend Income cards in whole amounts.</li>
          <li><strong>🎒 ITEMS</strong> — <em>Place</em> an Item card in your backpack (uses your turn). Your backpack starts with 3 slots. <em>Using</em> an Item's ability (persistent or discard) does not use a turn. Persistent items stay in your backpack; single-use items are discarded after use.</li>
          <li><strong>🌐 EVENTS</strong> — Play from hand (uses your turn) for single-use effects that immediately resolve. Consumes your turn.</li>
        </ul>
        <br>
        <h4>Scoring</h4>
        <ul>
          <li><strong>+1 point</strong> for each City you visit</li>
          <li><strong>+3 points</strong> for being first to visit all 7 continents</li>
          <li><strong>+1 point</strong> for ending the game with the most Income cards</li>
        </ul>
      `;
      this.invertTitle = false;
      this.initializeDeck();
    }
  
    initializeDeck() {
      this.cards = [];
  
      // ---------- CITY CARDS (41 total: 6 per continent except Antarctica with 5) ----------
      // Color palette per continent
      const C = {
        NA: '#ffd20f', SA: '#66bb37', EU: '#39bfc4',
        AS: '#f2719d', AF: '#ff9426', OC: '#0c57d1', AN: '#e91e46'
      };
  
      // North America
      this.city('New York City', C.NA);
      this.city('Vancouver', C.NA);
      this.city('Mexico City', C.NA);
      this.city('Austin', C.NA);
      this.city('Montreal', C.NA);
      this.city('Los Angeles', C.NA);
  
      // South America
      this.city('Rio de Janeiro', C.SA);
      this.city('Buenos Aires', C.SA);
      this.city('Cusco', C.SA);
      this.city('Medellín', C.SA);
      this.city('Santiago', C.SA);
      this.city('Lima', C.SA);
  
      // Europe
      this.city('London', C.EU);
      this.city('Paris', C.EU);
      this.city('Berlin', C.EU);
      this.city('Lisbon', C.EU);
      this.city('Athens', C.EU);
      this.city('Reykjavík', C.EU);
  
      // Asia
      this.city('Tokyo', C.AS);
      this.city('Bangkok', C.AS);
      this.city('Seoul', C.AS);
      this.city('Bali', C.AS);
      this.city('Singapore', C.AS);
      this.city('Kathmandu', C.AS);
  
      // Africa
      this.city('Cape Town', C.AF);
      this.city('Marrakesh', C.AF);
      this.city('Nairobi', C.AF);
      this.city('Cairo', C.AF);
      this.city('Zanzibar', C.AF);
      this.city('Accra', C.AF);
  
      // Oceania
      this.city('Sydney', C.OC);
      this.city('Melbourne', C.OC);
      this.city('Auckland', C.OC);
      this.city('Fiji', C.OC);
      this.city('Perth', C.OC);
      this.city('Tasmania', C.OC);
  
      // Antarctica
      this.city('McMurdo Station', C.AN);
      this.city('South Pole Camp', C.AN);
      this.city('Deception Island', C.AN);
      this.city('Palmer Station', C.AN);
      this.city('King George Island', C.AN);
  
      // ---------- INCOME CARDS (25 total) ----------
      const INC = 'neutral';
      this.income('Yoga Teacher', 1000, 6, INC);
      this.income('Viral Video', 2000, 3, INC);
  
      this.income('Consulting Job', 3000, 5, INC);
      this.income('Online Course Launch', 3000, 3, INC);
  
      this.income('Crypto Pump', 4000, 3, INC);
      this.income('YouTuber Sponsorship', 4000, 2, INC);
  
      this.income('Executive Coaching', 5000, 1, INC);
      this.income('Startup Exit (tiny one)', 5000, 1, INC);
  
      this.income('Found hardware wallet from 2016', 6000, 1, INC);

      // ---------- EVENT CARDS (20 total, 1 global active) ----------
      const EVT = 'wild';
      this.addCardType('Free Upgrade', EVT, '🌐', 2,
        'Immediately travel to your next City for free.');
      this.addCardType('Flash Sale!', EVT, '🌐', 2,
        'Choose any City card from your hand and play it for half price (rounded down).');
      this.addCardType('Business Boom', EVT, '🌐', 2,
        'Place next to one played Income card to double its value.');
      this.addCardType('Local Connection', EVT, '🌐', 2, 
        'Draw 2 cards. You may immediately play one.');
      this.addCardType('Lost Luggage', EVT, '🌐', 2, 
        'Choose a player to discard all their item cards.');
      this.addCardType('Lost and Found', EVT, '🌐', 2, 
        'Steal up to $3,000 from any player of your choice.');
      this.addCardType('Luggage Mixup', EVT, '🌐', 2, 
        'Swap backpack contents with any other player.');
      // this.addCardType('Stomach Virus', EVT, '🌐', 2,
      //   'Choose any player to discard their active Skill.');

      // ---------- ITEM CARDS — with color-coded brightness and hue ----------

    const items = [
      { title: 'Laptop', emoji: '💻', size: 2, count: 3, desc: 'Play up to 2 Income cards per turn.', persistent: true },
      { title: 'Travel Insurance', emoji: '🛡️', size: 2, count: 1, desc: 'Discard to ignore an Event.', persistent: false },
      { title: 'Credit Card', emoji: '💳', size: 1, count: 2, desc: 'Discard to reduce the cost of a City by $3,000 this turn.', persistent: false },
      { title: 'Nomad Card Game', emoji: '🃏', size: 1, count: 1, desc: 'Claim an additional 3 points at the end of the game.', persistent: true },
      { title: 'Lock Pick', emoji: '🗝️', size: 1, count: 3, desc: 'Discard to swap 1 Item card with a player.', persistent: false },
      { title: 'Dice', emoji: '🎲', size: 1, count: 3, desc: 'Discard to swap 2 Income cards with a player.', persistent: false },
      
      { title: 'Guidebooks', emoji: '📚', size: 2, count: 2, desc: 'Travel to new continents costs $1,000 less.', persistent: true },
      { title: 'World Map', emoji: '🗺️', size: 2, count: 2, desc: 'Play up to 2 Cities per turn.', persistent: true },
      { title: 'SatPhone', emoji: '🛰️', size: 2, count: 2, desc: 'Discard to travel to a previously visited City for free.', persistent: false },

      { title: 'Day Bag', emoji: '🎒', size: 2, count: 2, desc: 'Hold up to 4 cards in your hand.', persistent: true },
      { title: 'Extra Large Backpack', emoji: '🎒', size: 2, count: 2, desc: '+3 additional item slots.', persistent: true },
    ];

    // Add all Item cards to the deck with color calculated
    items.forEach(obj => {
      this.item(obj.title, obj.emoji, obj.size, obj.count, obj.desc, obj.persistent);
    });
}

  colorBy(size, persistent) {
    const hue = persistent ? [153, 50, 204] : [138, 43, 226]; // RGB base (Purple / Violet)
    const brightness = size === 1 ? 1 : size === 2 ? 0.9 : 0.8;
    return `rgb(${hue.map(c => Math.round(c * brightness)).join(',')})`;
  }
  
    // Helper: add a single City card
    city(name, color) {
      this.addCardType(name, color, '🏙️', 1, '');
    }
  
    // Helper: add multiple Income cards with same template
    income(title, amount, count, color) {
      this.addCardType(`+$${amount.toLocaleString()}`, color, '💵', count, `${title}`);
    }

    item(title, emoji, size, count, desc, persistent) {
      const color = '#8a4af3';
      this.addCardType(`${size}\n ${title}`, color, emoji, count, desc);
    }
  
    addCardType(title, color, emoji, count = 1, description = '', imageSize = 24) {
      for (let i = 0; i < count; i++) {
        const cardData = {
          title,
          emoji,
          description,
          color,
          imageSize
        };
        this.addCardFromData(cardData, i);
      }
    }
  
    reset() {
      this.initializeDeck();
    }
  }
  