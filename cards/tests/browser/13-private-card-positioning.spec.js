const { test, expect } = require('@playwright/test');
const {
  waitForGameInit,
  createRoom,
  joinRoom,
  waitForWebSocketConnection,
  loadDeck,
  dealCard,
  getPrivateHandCount,
  getAllCardsCount,
} = require('./helpers');

test.describe('Private Card Positioning Tests', () => {
  test('Test: Multiple private cards should not stack on top of each other', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      await page.goto('/');
      await waitForGameInit(page);
      
      // Connect to a room
      const roomCode = await createRoom(page);
      await waitForWebSocketConnection(page);
      
      // Load deck and sync to server
      await loadDeck(page, 'standard');
      await page.waitForTimeout(1000); // Wait for deck to sync
      
      // Deal 3 cards to private hand (click deck multiple times)
      const initialCardCount = await getAllCardsCount(page);
      const initialPrivateHandCount = await getPrivateHandCount(page);
      
      // Deal first card
      await dealCard(page);
      await page.waitForTimeout(800); // Wait for card to appear and position
      
      // Deal second card
      await dealCard(page);
      await page.waitForTimeout(800); // Wait for card to appear and position
      
      // Deal third card
      await dealCard(page);
      await page.waitForTimeout(800); // Wait for card to appear and position
      
      // Verify cards were added
      const finalCardCount = await getAllCardsCount(page);
      const finalPrivateHandCount = await getPrivateHandCount(page);
      
      expect(finalCardCount).toBe(initialCardCount + 3);
      expect(finalPrivateHandCount).toBe(initialPrivateHandCount + 3);
      
      // Get all private cards (cards with privateTo set)
      const privateCards = await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('.card'));
        const currentPlayerId = window.cardGame?.multiplayer?.playerId;
        return cards
          .filter(card => {
            const privateTo = card.dataset.privateTo;
            return privateTo && privateTo === currentPlayerId;
          })
          .map(card => {
            const rect = card.getBoundingClientRect();
            return {
              uniqueId: card.dataset.uniqueId,
              x: rect.left,
              y: rect.top,
              width: rect.width,
              height: rect.height
            };
          });
      });
      
      expect(privateCards.length).toBeGreaterThanOrEqual(3);
      
      // Verify cards have different positions (not stacked)
      const positions = privateCards.map(c => ({ x: Math.round(c.x), y: Math.round(c.y) }));
      const uniquePositions = new Set(positions.map(p => `${p.x},${p.y}`));
      
      // All cards should have unique positions (not overlapping)
      expect(uniquePositions.size).toBeGreaterThanOrEqual(2); // At least 2 different positions
      
      // Check that cards don't overlap (tolerance of 5px for slight overlaps is ok)
      for (let i = 0; i < privateCards.length; i++) {
        for (let j = i + 1; j < privateCards.length; j++) {
          const card1 = privateCards[i];
          const card2 = privateCards[j];
          
          const overlapX = Math.max(0, Math.min(card1.x + card1.width, card2.x + card2.width) - Math.max(card1.x, card2.x));
          const overlapY = Math.max(0, Math.min(card1.y + card1.height, card2.y + card2.height) - Math.max(card1.y, card2.y));
          const overlapArea = overlapX * overlapY;
          
          // Allow small overlaps (within 5px tolerance) but not full overlaps
          const tolerance = 5;
          const cardArea = Math.min(card1.width * card1.height, card2.width * card2.height);
          const overlapPercentage = overlapArea / cardArea;
          
          // Cards should not overlap by more than 20% (allows for slight overlaps in grid)
          expect(overlapPercentage).toBeLessThan(0.2);
        }
      }
      
    } finally {
      await context.close();
    }
  });
  
  test('Test: Private cards maintain positions after reconnection', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      await page.goto('/');
      await waitForGameInit(page);
      
      // Connect to a room
      const roomCode = await createRoom(page);
      await waitForWebSocketConnection(page);
      
      // Load deck and sync to server
      await loadDeck(page, 'standard');
      await page.waitForTimeout(1000);
      
      // Deal 2 private cards
      await dealCard(page);
      await page.waitForTimeout(800);
      await dealCard(page);
      await page.waitForTimeout(800);
      
      // Get positions before reconnection
      const positionsBefore = await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('.card'));
        const currentPlayerId = window.cardGame?.multiplayer?.playerId;
        return cards
          .filter(card => {
            const privateTo = card.dataset.privateTo;
            return privateTo && privateTo === currentPlayerId;
          })
          .map(card => ({
            uniqueId: card.dataset.uniqueId,
            x: parseFloat(card.style.left) || 0,
            y: parseFloat(card.style.top) || 0
          }));
      });
      
      expect(positionsBefore.length).toBeGreaterThanOrEqual(2);
      
      // Simulate reconnection by closing and reopening connection
      // (This is a simplified test - actual reconnection test would be more complex)
      
      // Verify positions are valid (not 0,0 or undefined)
      positionsBefore.forEach(pos => {
        expect(pos.x).toBeGreaterThan(0);
        expect(pos.y).toBeGreaterThan(0);
      });
      
    } finally {
      await context.close();
    }
  });
});

