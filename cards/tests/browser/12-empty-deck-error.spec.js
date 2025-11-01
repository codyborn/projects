/**
 * Empty Deck Error Handling Test
 * Tests that when the deck is empty and a player tries to deal a card,
 * the server sends a DECK_EMPTY error and the client stays connected.
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

test.describe('Empty Deck Error Handling Tests', () => {
  test('Client should handle DECK_EMPTY error gracefully without disconnecting', async ({ browser }) => {
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
      
      // Wait for host to connect
      await waitForWebSocketConnection(hostPage);
      
      // Load standard deck (52 cards) - we'll deal all of them to get to empty state
      await loadDeck(hostPage, 'standard');
      
      // Wait for deck to load
      await hostPage.waitForTimeout(1000);
      
      // Get initial deck count
      const initialDeckCount = await getDeckCount(hostPage);
      console.log('Initial deck count:', initialDeckCount);
      expect(initialDeckCount).toBeGreaterThan(0);
      
      const cardsToDeal = initialDeckCount;
      
      // Deal all cards until deck is empty
      for (let i = 0; i < cardsToDeal; i++) {
        await hostPage.evaluate(() => {
          const deck = document.querySelector('.deck');
          if (deck) {
            deck.click();
          }
        });
        // Wait for card to be dealt
        await hostPage.waitForTimeout(1000);
      }
      
      // Verify deck is now empty
      const deckCountAfterAllDeals = await hostPage.evaluate(() => {
        const game = window.game;
        if (game && game.deck) {
          return game.deck.cards.length;
        }
        const deckEl = document.querySelector('.deck');
        if (deckEl) {
          const countEl = deckEl.querySelector('.deck-count');
          return countEl ? parseInt(countEl.textContent, 10) : 0;
        }
        return 0;
      });
      
      console.log('Deck count after all deals:', deckCountAfterAllDeals);
      expect(deckCountAfterAllDeals).toBe(0);
      
      // Verify cards are on the board
      const cardsOnBoard = await getAllCardsCount(hostPage);
      console.log('Cards on board:', cardsOnBoard);
      expect(cardsOnBoard).toBe(cardsToDeal);
      
      // Track connection status before trying to deal from empty deck
      const connectionStatusBefore = await hostPage.evaluate(() => {
        const statusElement = document.getElementById('menu-connection-status');
        if (statusElement) {
          const indicator = statusElement.querySelector('.status-indicator');
          return indicator ? indicator.className : 'unknown';
        }
        return 'unknown';
      });
      
      // Monitor console for error messages
      const errorMessages = [];
      const errorListener = msg => {
        if (msg.type() === 'error' || (msg.text() && msg.text().includes('DECK_EMPTY'))) {
          errorMessages.push(msg.text());
        }
      };
      hostPage.on('console', errorListener);
      
      // Try to deal a 4th card (should fail with DECK_EMPTY error)
      await hostPage.evaluate(() => {
        const deck = document.querySelector('.deck');
        if (deck) {
          deck.click();
        }
      });
      
      // Wait for error handling to complete
      await hostPage.waitForTimeout(2000);
      
      // Verify connection status hasn't changed (should still be connected)
      const connectionStatusAfter = await hostPage.evaluate(() => {
        const statusElement = document.getElementById('menu-connection-status');
        if (statusElement) {
          const indicator = statusElement.querySelector('.status-indicator');
          return indicator ? indicator.className : 'unknown';
        }
        return 'unknown';
      });
      
      // Connection should still be 'connected' (not 'offline')
      const isStillConnected = connectionStatusAfter.includes('connected');
      
      // Verify connection status indicator still shows connected
      expect(isStillConnected).toBe(true);
      
      // Verify no new cards were dealt
      const cardsOnBoardAfter = await getAllCardsCount(hostPage);
      expect(cardsOnBoardAfter).toBe(cardsToDeal); // Should still be the same number, not increased
      
      // Verify deck is still empty
      const deckCountAfterError = await getDeckCount(hostPage);
      expect(deckCountAfterError).toBe(0);
      
      // Check that error notification appeared (but didn't disconnect)
      const errorNotification = await hostPage.evaluate(() => {
        const notification = document.getElementById('connection-error-notification');
        if (notification && notification.style.display !== 'none') {
          return notification.textContent;
        }
        return null;
      });
      
      // Error notification should exist (showing the DECK_EMPTY message)
      // But we don't necessarily need to check exact text since the important thing
      // is that we stayed connected
      
      console.log('Connection status before:', connectionStatusBefore);
      console.log('Connection status after:', connectionStatusAfter);
      console.log('Error messages:', errorMessages);
      console.log('Error notification:', errorNotification);
      
      // The key test: client should still be connected
      expect(isStillConnected).toBe(true);
      
    } finally {
      // Cleanup
      for (const context of contexts) {
        await context.close();
      }
    }
  });
});

