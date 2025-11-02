// The Nomad — Core Edition Deck
class NomadDeck extends Deck {
    constructor() {
      super();
      this.name = 'The Nomad Card Game';
      this.description = `
        <h3>Visit every continent.<br>Out-plan your rivals.<br>Don't go broke.</h3>
        <br>
        <p>As a digital nomad, you’re always chasing adventure. But when it's a race to visit every continent, every move counts. Along the way, you'll pick up handy gear and remote gigs to fuel your travels, but linger too long in one place and your rivals will leave you in the dust.</p>
        <p><strong>Players:</strong> 2–4<br>
           <strong>Goal:</strong> Score the most points by visiting cities. First player to visit all 7 continents ends the game and gains +3 bonus points.</p>
        <br>
        <h4>How to Play</h4>
        <ul>
          <li><strong>Each turn:</strong> Play 1 card (City, Income, Item, or Event) <em>or</em> discard any number of cards, then draw until you have 4 cards.</li>
          <li><strong>Travel:</strong> Your first City is free (starting point). Traveling to a new continent costs = <strong>$3,000 + $1,000 x continent hops</strong> on the mini-map. Cities on the same continent are <strong>free</strong>. Place a City card toward the middle of the board to indicate your current location.</li>
          <li><strong>Scoring:</strong> +1 point per City you visit. First to all 7 continents gains <strong>+3 points</strong> and ends the game.</li>
          <li><strong>Placing vs. Using:</strong> <em>Placing</em> an Income card or Item card from your hand consumes your turn. <em>Using</em> Income cards (spending money) or Items (activating effects) does not.</li>
        </ul>
        <br>
        <h4>Mini-Map</h4>
        <img src="./src/shared/images/nomad-mini-map.png" alt="Nomad Mini-Map" style="width: 100%; height: auto;">
        <br><br>
        <h4>Card Types</h4>
        <ul>
          <li><strong>🏙️ CITIES</strong> — Play to travel and score points (1 each). Track your current continent via your latest City. Place your current City toward the middle of the board.</li>
          <li><strong>💵 INCOME</strong> — Place an Income card (uses your turn) to add it to your bank account. Income cards stay on the table until you spend them (does not use a turn). You must spend Income cards in whole amounts.</li>
          <li><strong>🎒 ITEMS</strong> — Place an Item card in your backpack (uses your turn). Your backpack starts with 3 slots. <em>Using</em> an Item's ability (persistent or discard) does not use a turn. Persistent items stay in your backpack; single-use items are discarded after use.<br>
          <strong>Item Size:</strong> The number of 📦 emojis on an Item card shows how many backpack slots it uses:
          <ul>
            <li>📦 = 1 slot</li>
            <li>📦📦 = 2 slots</li>
            <li>📦📦📦 = 3 slots</li>
          </ul>
          </li>
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
      this.city('New York City', C.NA, 'Population: 8.5M.\nThe Empire State Building has its own zip code (10118).');
      this.city('Vancouver', C.NA, 'Population: 700K.\nHome to Stanley Park, one of North America\'s largest urban parks.');
      this.city('Mexico City', C.NA, 'Population: 9.2M.\nBuilt on an ancient lakebed, parts of the city sink up to 20cm per year.');
      this.city('Austin', C.NA, 'Population: 980K.\nHome to the world\'s largest urban bat colony at Congress Avenue Bridge.');
      this.city('Montreal', C.NA, 'Population: 1.8M.\nOne of the most bilingual cities in North America, with French and English widely spoken.');
      this.city('Los Angeles', C.NA, 'Population: 3.9M.\nHome to major museums like the Getty Center and LACMA.');
  
      // South America
      this.city('Rio de Janeiro', C.SA, 'Population: 6.7M.\nHosts the world\'s largest street party during Carnival.');
      this.city('Buenos Aires', C.SA, 'Population: 3.1M.\nBirthplace of the tango dance, with hundreds of milongas (dance halls) throughout the city.');
      this.city('Cusco', C.SA, 'Population: 435K.\nBuilt on ancient Incan foundations, many walls are perfectly aligned without mortar.');
      this.city('Medellín', C.SA, 'Population: 2.5M.\nTransformed from crime capital to innovation hub with cable car transportation.');
      this.city('Santiago', C.SA, 'Population: 6.3M.\nSurrounded by mountains that create a natural bowl, trapping smog.');
      this.city('Lima', C.SA, 'Population: 9.8M.\nThe oldest continuously functioning university in the Americas is here (1551).');
  
      // Europe
      this.city('London', C.EU, 'Population: 9.0M.\nHome to over 170 museums, including the free-to-enter British Museum.');
      this.city('Paris', C.EU, 'Population: 2.1M.\nThe Eiffel Tower grows 6 inches taller in summer due to heat expansion.');
      this.city('Berlin', C.EU, 'Population: 3.7M.\nOften said to have more bridges than Venice (1,700+).');
      this.city('Lisbon', C.EU, 'Population: 548K.\nOne of the oldest cities in Europe, predating Rome by centuries.');
      this.city('Athens', C.EU, 'Population: 3.2M.\nThe Parthenon was originally painted in bright colors, not white marble.');
      this.city('Reykjavík', C.EU, 'Population: 135K.\nHeats most buildings using geothermal energy from volcanic activity.');
  
      // Asia
      this.city('Tokyo', C.AS, 'Population: 14.0M.\nHas the world\'s busiest train station—Shinjuku serves 3.6M passengers daily.');
      this.city('Bangkok', C.AS, 'Population: 10.7M.\nHas one of the longest official city names in the world at 168 characters.');
      this.city('Seoul', C.AS, 'Population: 9.7M.\nAmong the world\'s fastest internet speeds and most connected populations.');
      this.city('Bali', C.AS, 'Population: 4.3M.\nObserves Nyepi Day annually, when the entire island shuts down for 24 hours of silence.');
      this.city('Singapore', C.AS, 'Population: 5.9M.\nDespite its size, it\'s one of the world\'s leading financial centers.');
      this.city('Kathmandu', C.AS, 'Population: 1.5M.\nThe Kathmandu Valley contains seven UNESCO World Heritage sites within 20km.');
  
      // Africa
      this.city('Cape Town', C.AF, 'Population: 4.8M.\nHome to Table Mountain, one of the oldest mountains in the world (260M years old).');
      this.city('Marrakesh', C.AF, 'Population: 930K.\nThe ancient medina is a UNESCO World Heritage site with a maze of narrow alleys.');
      this.city('Nairobi', C.AF, 'Population: 4.4M.\nThe only capital city with a national park within its boundaries.');
      this.city('Cairo', C.AF, 'Population: 10.2M.\nHome to one of the Seven Wonders of the Ancient World—the Great Pyramid.');
      this.city('Zanzibar', C.AF, 'Population: 1.8M.\nWas the world\'s leading producer of cloves in the 19th century.');
      this.city('Accra', C.AF, 'Population: 2.3M.\nKnown as Africa\'s music capital with vibrant highlife and afrobeat scenes.');
  
      // Oceania
      this.city('Sydney', C.OC, 'Population: 5.3M.\nThe Opera House roof is covered with over 1 million tiles.');
      this.city('Melbourne', C.OC, 'Population: 5.0M.\nNamed the world\'s most livable city 7 times in a row (2011-2017).');
      this.city('Auckland', C.OC, 'Population: 1.7M.\nBuilt on about 53 volcanoes in a dormant volcanic field.');
      this.city('Fiji', C.OC, 'Population: 940K.\nThe International Date Line zigzags around Fiji to keep the islands together.');
      this.city('Perth', C.OC, 'Population: 2.1M.\nOne of the most isolated major cities—closest city is Adelaide, 2,104km away.');
      this.city('Tasmania', C.OC, 'Population: 558K.\nHome to the world\'s cleanest air, measured at Cape Grim Baseline Station.');
  
      // Antarctica
      this.city('McMurdo Station', C.AN, 'Population: ~1,000 (summer).\nLargest research station in Antarctica, operates year-round.');
      this.city('South Pole Camp', C.AN, 'Population: ~150 (summer).\nLocated at 90°S, where all lines of longitude converge.');
      this.city('Deception Island', C.AN, 'Population: ~20 (summer).\nActive volcano with a flooded caldera that serves as a natural harbor.');
      this.city('Palmer Station', C.AN, 'Population: ~40 (summer).\nUS research station on Anvers Island, studying marine biology.');
      this.city('King George Island', C.AN, 'Population: ~500 (summer).\nHosts research stations from 12 different countries.');
  
      // ---------- INCOME CARDS (25 total) ----------
      const INC = 'neutral';
      this.income('Yoga Teacher', 1000, 6, INC);
      this.income('Viral Video', 2000, 3, INC);
  
      this.income('Freelance Writing', 3000, 5, INC);
      this.income('Online Course Creation', 3000, 3, INC);
  
      this.income('Vibe-coded App', 4000, 3, INC);
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
      this.addCardType('Travel Agent Hallucination', EVT, '🌐', 2, 
          'Send a player to any of their previously visited cities.');
      this.addCardType('Tourist Trap', EVT, '🌐', 2, 
          'Take a city card from any player.');

      // this.addCardType('Stomach Virus', EVT, '🌐', 2,
      //   'Choose any player to discard their active Skill.');

      // ---------- ITEM CARDS — with color-coded brightness and hue ----------

    const items = [
      { title: 'Laptop', size: 2, count: 3, desc: 'Play up to 2 Income cards per turn.', persistent: true },
      { title: 'Travel Insurance', size: 2, count: 1, desc: 'Discard to ignore the effects of an Event on you.', persistent: false },
      { title: 'Credit Card', size: 1, count: 2, desc: 'Discard to reduce the cost of a City by $3,000 this turn.', persistent: false },
      { title: 'Nomad Card Game', size: 1, count: 1, desc: 'Claim an additional 3 points at the end of the game.', persistent: true },
      { title: 'Lock Pick', size: 1, count: 3, desc: 'Discard to steal 1 Item card from a player.', persistent: false },
      { title: 'Dice', size: 1, count: 3, desc: 'Discard to swap 1 Income card with another player.', persistent: false },
      { title: 'SatPhone', size: 1, count: 2, desc: 'Discard to travel to a previously visited City for free.', persistent: false },
      
      { title: 'Guidebooks', size: 2, count: 2, desc: 'Travel to new continents costs $1,000 less.', persistent: true },
      { title: 'World Map', size: 2, count: 2, desc: 'Play up to 2 Cities per turn.', persistent: true },
      { title: 'Day Bag', size: 2, count: 2, desc: 'Hold up to 5 cards in your hand.', persistent: true },

      { title: 'Extra Large Backpack', size: 0, count: 2, desc: '4 total item slots.', persistent: true },
    ];

    // Add all Item cards to the deck with box emojis representing size
    items.forEach(obj => {
      // Generate emoji based on size: 📦 for 1, 📦📦 for 2, etc.
      const boxEmoji = obj.size > 0 ? '📦'.repeat(obj.size) : '📦';
      this.item(obj.title, boxEmoji, obj.size, obj.count, obj.desc, obj.persistent);
    });
}

  colorBy(size, persistent) {
    const hue = persistent ? [153, 50, 204] : [138, 43, 226]; // RGB base (Purple / Violet)
    const brightness = size === 1 ? 1 : size === 2 ? 0.9 : 0.8;
    return `rgb(${hue.map(c => Math.round(c * brightness)).join(',')})`;
  }
  
    // Helper: add a single City card
    city(name, color, description = '') {
      this.addCardType(name, color, '🏙️', 1, description);
    }
  
    // Helper: add multiple Income cards with same template
    income(title, amount, count, color) {
      this.addCardType(`+$${amount.toLocaleString()}`, color, '💵', count, `${title}`);
    }

    item(title, emoji, size, count, desc, persistent) {
      const color = '#8a4af3';
      // Title is clean - size is represented by the emoji (box emojis)
      this.addCardType(title, color, emoji, count, desc);
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
  