// The Nomad — Core Edition Deck
class NomadDeck extends Deck {
    constructor() {
      super();
      this.name = 'THE NOMAD';
      this.description = `
        <h3>Visit every continent. Out-plan your rivals. Don't go broke.</h3>
        <p><strong>Players:</strong> 2–5 |
           <strong>Goal:</strong> Score the most points by visiting cities. First player to visit all 7 continents ends the game and gains +5 bonus points.</p>
        <br>
        <h4>How to Play</h4>
        <ul>
          <li><strong>Each turn:</strong> Play 1 card (City, Income, Skill, or Event) <em>or</em> discard any number of cards, then draw to your until you have3 cards.</li>
          <li><strong>Travel:</strong> Your first City is free (starting point). New City cost = <strong>$3,000 + $1,000 × continent hops</strong> on the mini-map. Cities on the same continent are <strong>free</strong>.</li>
          <li><strong>Scoring:</strong> +1 point per City you visit. First to all 7 continents gains <strong>+5 points</strong> and ends the game.</li>
        </ul>
        <br>
        <h4>Mini-Map</h4>
        <img src="./src/shared/images/nomad-mini-map.png" alt="Nomad Mini-Map" style="width: 100%; height: auto;">
        <br>
        <h4>Card Types</h4>
        <ul>
          <li><strong>🏙️ CITIES</strong> — Play to travel and score points (1 each). Track your current continent via your latest City.</li>
          <li><strong>💼 INCOME</strong> — Play an income card to add money to your bank account. Keep the income cards on the table until you spend them.</li>
          <li><strong>🧠 SKILLS</strong> — Play a skill card to add a persistent perk to your game. Max 1 active.</li>
          <li><strong>🌐 EVENTS</strong> — Single-use effects.</li>
        </ul>
      `;
      this.invertTitle = false;
      this.initializeDeck();
    }
  
    initializeDeck() {
      this.cards = [];
  
      // ---------- CITY CARDS (6 per continent = 42 total) ----------
      // Color palette per continent
      const C = {
        NA: '#1E90FF', SA: '#2E8B57', EU: '#8A2BE2',
        AS: '#DC143C', AF: '#DAA520', OC: '#20B2AA', AN: '#A9A9A9'
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
      this.city('Antarctic Cruise Stop', C.AN);
  
      // ---------- SKILL CARDS (15 total) ----------
      // You may adjust counts for balance after playtesting.
      const SKILL = 'neutral'; // neutral/skill color
      this.addCardType('Digital Nomad', SKILL, '🧠', 3,
        'Income cards earn +$1,000.');
      this.addCardType('Airline Status', SKILL, '🧠', 3,
        'All travel costs –$1,000.');
      this.addCardType('Obsessive Planner', SKILL, '🧠', 2,
        'Your hand limit is 4 cards.');
      this.addCardType('Points Maxi', SKILL, '🧠', 2,
        'Traveling to your next City is free. (Discard this Skill after use.)');
      this.addCardType('Survivalist', SKILL, '🧠', 2,
        'When an Event makes you lose a Skill, draw 1 card.');
      this.addCardType('Hustler', SKILL, '🧠', 2,
        'You may play up to 2 Income cards per turn.');
  
      // ---------- INCOME CARDS (25 total) ----------
      const INC = 'neutral';
      this.income('Yoga Teacher', 1000, 6, INC);
      this.income('Influencer Marketing', 2000, 3, INC);
  
      this.income('Consulting Job', 3000, 5, INC);
      this.income('Online Course Launch', 3000, 3, INC);
  
      this.income('Crypto Pump', 4000, 3, INC);
      this.income('YouTuber Sponsorship', 4000, 2, INC);
  
      this.income('Executive Coaching', 5000, 1, INC);
      this.income('Startup Exit (tiny one)', 5000, 1, INC);
  
      this.income('Sold NFT from 2021', 6000, 1, INC);
  
      // ---------- EVENT CARDS (10 total, 1 global active) ----------
      const EVT = 'wild';
      this.addCardType('Free Upgrade', EVT, '✈️', 1, 
        'Immediately travel to your next City for free.');
      this.addCardType('Flash Sale!', EVT, '💸', 1,
        'Choose any City card from your hand and play it for half price (rounded down).');
      this.addCardType('Business Boom', EVT, '📈', 1,
        'Immediately play one Income card and double its earnings.');
      this.addCardType('Local Connection', EVT, '🤝', 1, 
        'Draw 2 cards. You may immediately play one.');
      this.addCardType('Lost Luggage', EVT, '🧳', 1, 
        'All other players must discard their hands and lose a turn.');
      this.addCardType('Lucky Encounter', EVT, '🍀', 1, 
        'Steal up to $3,000 from any player of your choice.');
      this.addCardType('Skill Trade', EVT, '🔄', 1, 
        'Swap one of your active Skills with any other player.');
      this.addCardType('Stomach Virus', EVT, '🦠', 1,
        'Choose any player to discard their active Skill.');
    }

  
    // Helper: add a single City card
    city(name, color) {
      this.addCardType(name, color, '🏙️', 1, '');
    }
  
    // Helper: add multiple Income cards with same template
    income(title, amount, count, color) {
      this.addCardType(`+$${amount.toLocaleString()}`, color, '💵', count, `${title}`);
    }
  
    addCardType(title, color, emoji, count, description = '', imageSize = 24) {
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
  