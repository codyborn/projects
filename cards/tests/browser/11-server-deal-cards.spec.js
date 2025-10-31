/**
 * Server-Side Card Dealing Test
 * Tests that when multiple players request cards simultaneously, the server
 * guarantees unique cards and prevents duplicates.
 */

const { test, expect } = require('@playwright/test');
const {
  waitForGameInit,
  createRoom,
  joinRoom,
  waitForWebSocketConnection,
  getDeckCount,
  getAllCardsCount,
  loadDeck,
} = require('./helpers');

test.describe('Server-Side Card Dealing Tests', () => {
  test('Simultaneous card requests should not create duplicates', async ({ browser }) => {
    const contexts = [];
    const pages = [];
    
    try {
      // Host creates room
      const hostContext = await browser.newContext();
      const hostPage = await hostContext.newPage();
      await hostPage.goto('/');
      await waitForGameInit(hostPage);
      const roomCode = await createRoom(hostPage);
      contexts.push(hostContext);
      pages.push(hostPage);
      
      // Create 3 more players
      for (let i = 0; i < 3; i++) {
        const context = await browser.newContext();
        const page = await context.newPage();
        contexts.push(context);
        pages.push(page);
        
        await page.goto('/');
        await waitForGameInit(page);
        await joinRoom(page, roomCode);
      }
      
      // Wait for all to connect
      for (const page of pages) {
        await waitForWebSocketConnection(page);
      }
      
      // Wait for all to sync
      await Promise.all(pages.map(p => p.waitForTimeout(2000)));
      
      // Load deck on host to initialize server deck
      await loadDeck(pages[0], 'standard');
      
      // Wait for deck to sync to all players
      await Promise.all(pages.map(p => p.waitForTimeout(2000)));
      
      // Get initial deck count
      const initialDeckCount = await getDeckCount(pages[0]);
      expect(initialDeckCount).toBeGreaterThan(0);
      
      // Get initial unique card IDs
      const initialCardIds = new Set();
      for (const page of pages) {
        const cardIds = await page.evaluate(() => {
          return Array.from(document.querySelectorAll('.card')).map(c => c.dataset.uniqueId);
        });
        cardIds.forEach(id => initialCardIds.add(id));
      }
      
      // ALL players request cards simultaneously (race condition test)
      const dealPromises = pages.map(page => {
        return page.evaluate(() => {
          // Click the deck to deal a card
          const deck = document.querySelector('.deck');
          if (deck) {
            return deck.click();
          }
        });
      });
      
      // Wait for all deals to complete
      await Promise.all(dealPromises);
      
      // Wait for all server responses and sync
      // Wait longer to ensure all cards are created and synced
      await Promise.all(pages.map(p => p.waitForTimeout(5000)));
      
      // Wait for cards to appear on each page
      for (let i = 0; i < pages.length; i++) {
        await pages[i].waitForFunction(
          (initialIds) => {
            const currentIds = Array.from(document.querySelectorAll('.card')).map(c => c.dataset.uniqueId);
            const newCards = currentIds.filter(id => !initialIds.includes(id));
            return newCards.length >= 1;
          },
          Array.from(initialCardIds),
          { timeout: 10000 }
        );
      }
      
      // Collect all unique card IDs from all pages
      // Note: Cards are private to each player, so we need to check each player's view
      const cardIdArrays = [];
      for (const page of pages) {
        const cardIds = await page.evaluate(() => {
          return Array.from(document.querySelectorAll('.card')).map(c => c.dataset.uniqueId);
        });
        cardIdArrays.push(cardIds);
      }
      
      // Each player should have received exactly 1 new card (private to them)
      for (let i = 0; i < pages.length; i++) {
        const cardIds = cardIdArrays[i];
        const newCardsOnPage = cardIds.filter(id => !initialCardIds.has(id));
        expect(newCardsOnPage.length).toBeGreaterThanOrEqual(1);
      }
      
      // Collect all unique card IDs across all pages (to check for duplicates)
      const allCardIds = new Set();
      for (const cardIds of cardIdArrays) {
        cardIds.forEach(id => allCardIds.add(id));
      }
      
      // Calculate how many NEW cards were added (excluding initial cards)
      const newCards = Array.from(allCardIds).filter(id => !initialCardIds.has(id));
      
      // CRITICAL: Should have exactly 4 new cards (one per player)
      // Even though cards are private, they should all have unique IDs
      expect(newCards.length).toBe(4);
      
      // CRITICAL: All new cards should have unique IDs (no duplicates)
      const uniqueNewCards = new Set(newCards);
      expect(uniqueNewCards.size).toBe(4);
      
      // Deck count should be reduced by 4
      const finalDeckCount = await getDeckCount(pages[0]);
      expect(finalDeckCount).toBe(initialDeckCount - 4);
      
    } finally {
      await Promise.all(contexts.map(c => c.close()));
    }
  });

  test('Sequential card requests should also work correctly', async ({ browser }) => {
    const contexts = [];
    const pages = [];
    
    try {
      // Host creates room
      const hostContext = await browser.newContext();
      const hostPage = await hostContext.newPage();
      await hostPage.goto('/');
      await waitForGameInit(hostPage);
      const roomCode = await createRoom(hostPage);
      contexts.push(hostContext);
      pages.push(hostPage);
      
      // Create 2 more players
      for (let i = 0; i < 2; i++) {
        const context = await browser.newContext();
        const page = await context.newPage();
        contexts.push(context);
        pages.push(page);
        
        await page.goto('/');
        await waitForGameInit(page);
        await joinRoom(page, roomCode);
      }
      
      // Wait for all to connect
      for (const page of pages) {
        await waitForWebSocketConnection(page);
      }
      
      // Wait for all to sync
      await Promise.all(pages.map(p => p.waitForTimeout(2000)));
      
      // Load deck on host to initialize server deck
      await loadDeck(pages[0], 'standard');
      
      // Wait for deck to sync to all players
      await Promise.all(pages.map(p => p.waitForTimeout(2000)));
      
      // Get initial deck count
      const initialDeckCount = await getDeckCount(pages[0]);
      
      // Deal cards sequentially
      const dealtCardIds = [];
      for (const page of pages) {
        await page.evaluate(() => {
          const deck = document.querySelector('.deck');
          if (deck) {
            deck.click();
          }
        });
        await page.waitForTimeout(1000); // Wait for server response
        
        // Get the newly dealt card ID
        const newCardId = await page.evaluate(() => {
          const cards = Array.from(document.querySelectorAll('.card'));
          const lastCard = cards[cards.length - 1];
          return lastCard ? lastCard.dataset.uniqueId : null;
        });
        
        expect(newCardId).toBeTruthy();
        expect(dealtCardIds).not.toContain(newCardId); // Should be unique
        dealtCardIds.push(newCardId);
      }
      
      // Wait for final sync
      await Promise.all(pages.map(p => p.waitForTimeout(2000)));
      
      // All pages should see all 3 cards
      for (const page of pages) {
        const cardIds = await page.evaluate(() => {
          return Array.from(document.querySelectorAll('.card')).map(c => c.dataset.uniqueId);
        });
        for (const dealtId of dealtCardIds) {
          expect(cardIds).toContain(dealtId);
        }
      }
      
      // Deck count should be reduced by 3
      const finalDeckCount = await getDeckCount(pages[0]);
      expect(finalDeckCount).toBe(initialDeckCount - 3);
      
    } finally {
      await Promise.all(contexts.map(c => c.close()));
    }
  });
});

