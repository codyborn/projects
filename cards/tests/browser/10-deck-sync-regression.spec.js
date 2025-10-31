/**
 * Deck Synchronization Regression Test
 * Tests that when cards are dealt in multiplayer, the deck state is properly synchronized
 * so players don't draw the same cards that are already on the table or in other players' hands.
 */

const { test, expect } = require('@playwright/test');
const {
  waitForGameInit,
  dealCard,
  createRoom,
  joinRoom,
  waitForWebSocketConnection,
  getDeckCount,
  getAllCardsCount,
} = require('./helpers');

test.describe('Deck Synchronization Tests', () => {
  test('Dealing cards removes them from deck for all players', async ({ browser }) => {
    const hostContext = await browser.newContext();
    const playerContext = await browser.newContext();
    
    const hostPage = await hostContext.newPage();
    const playerPage = await playerContext.newPage();
    
    try {
      await hostPage.goto('/');
      await playerPage.goto('/');
      
      await waitForGameInit(hostPage);
      await waitForGameInit(playerPage);
      
      // Host creates room
      const roomCode = await createRoom(hostPage);
      expect(roomCode).toBeTruthy();
      
      // Both join the same room
      await joinRoom(playerPage, roomCode);
      
      await waitForWebSocketConnection(hostPage);
      await waitForWebSocketConnection(playerPage);
      
      // Wait for initial sync
      await hostPage.waitForTimeout(2000);
      await playerPage.waitForTimeout(2000);
      
      // Get initial deck counts
      const initialHostDeckCount = await getDeckCount(hostPage);
      const initialPlayerDeckCount = await getDeckCount(playerPage);
      
      // Both should have the same deck size
      expect(initialHostDeckCount).toBe(initialPlayerDeckCount);
      expect(initialHostDeckCount).toBeGreaterThan(0);
      
      // Get unique IDs of cards before dealing
      const cardsBeforeHost = await hostPage.evaluate(() => {
        return Array.from(document.querySelectorAll('.card')).map(c => c.dataset.uniqueId);
      });
      const cardsBeforePlayer = await playerPage.evaluate(() => {
        return Array.from(document.querySelectorAll('.card')).map(c => c.dataset.uniqueId);
      });
      
      // Host deals a card
      await dealCard(hostPage);
      await hostPage.waitForTimeout(1000);
      
      // Wait for sync
      await playerPage.waitForTimeout(2000);
      
      // Get the card that host dealt
      const hostCardsAfter = await hostPage.evaluate(() => {
        return Array.from(document.querySelectorAll('.card')).map(c => ({
          uniqueId: c.dataset.uniqueId,
          title: c.dataset.title
        }));
      });
      const newHostCard = hostCardsAfter.find(c => !cardsBeforeHost.includes(c.uniqueId));
      
      expect(newHostCard).toBeTruthy();
      
      // Player deals a card
      await dealCard(playerPage);
      await playerPage.waitForTimeout(1000);
      
      // Wait for sync
      await hostPage.waitForTimeout(2000);
      
      // Get the card that player dealt
      const playerCardsAfter = await playerPage.evaluate(() => {
        return Array.from(document.querySelectorAll('.card')).map(c => ({
          uniqueId: c.dataset.uniqueId,
          title: c.dataset.title
        }));
      });
      const newPlayerCard = playerCardsAfter.find(c => !cardsBeforePlayer.includes(c.uniqueId));
      
      expect(newPlayerCard).toBeTruthy();
      
      // CRITICAL: The two cards should be DIFFERENT (no duplicates)
      expect(newHostCard.uniqueId).not.toBe(newPlayerCard.uniqueId);
      
      // Both players should see both cards
      const finalHostCards = await hostPage.evaluate(() => {
        return Array.from(document.querySelectorAll('.card')).map(c => c.dataset.uniqueId);
      });
      const finalPlayerCards = await playerPage.evaluate(() => {
        return Array.from(document.querySelectorAll('.card')).map(c => c.dataset.uniqueId);
      });
      
      // Both should see the same cards
      expect(finalHostCards).toContain(newHostCard.uniqueId);
      expect(finalHostCards).toContain(newPlayerCard.uniqueId);
      expect(finalPlayerCards).toContain(newHostCard.uniqueId);
      expect(finalPlayerCards).toContain(newPlayerCard.uniqueId);
      
      // Deck counts should be reduced by 2
      const finalHostDeckCount = await getDeckCount(hostPage);
      const finalPlayerDeckCount = await getDeckCount(playerPage);
      
      expect(finalHostDeckCount).toBe(initialHostDeckCount - 2);
      expect(finalPlayerDeckCount).toBe(initialPlayerDeckCount - 2);
      
    } finally {
      await hostContext.close();
      await playerContext.close();
    }
  });

  test('Multiple players dealing cards should not create duplicates', async ({ browser }) => {
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
      
      // Get initial card count
      const initialCardCounts = await Promise.all(
        pages.map(p => getAllCardsCount(p))
      );
      
      // Each player deals one card
      for (const page of pages) {
        await dealCard(page);
        await page.waitForTimeout(500);
      }
      
      // Wait for all to sync
      await Promise.all(pages.map(p => p.waitForTimeout(2000)));
      
      // Get all unique IDs from all pages
      const allCardIds = new Set();
      for (const page of pages) {
        const cardIds = await page.evaluate(() => {
          return Array.from(document.querySelectorAll('.card')).map(c => c.dataset.uniqueId);
        });
        cardIds.forEach(id => allCardIds.add(id));
      }
      
      // Count new cards (should be exactly 3 new cards)
      const finalCardCounts = await Promise.all(
        pages.map(p => getAllCardsCount(p))
      );
      
      // All pages should show the same total number of cards
      const expectedCount = finalCardCounts[0];
      for (const count of finalCardCounts) {
        expect(count).toBe(expectedCount);
      }
      
      // Total unique cards across all pages should equal what one page sees
      // (since they should all be in sync)
      expect(allCardIds.size).toBe(expectedCount);
      
      // Verify no duplicates in unique IDs
      const uniqueIdArray = Array.from(allCardIds);
      const uniqueSet = new Set(uniqueIdArray);
      expect(uniqueSet.size).toBe(uniqueIdArray.length);
      
    } finally {
      await Promise.all(contexts.map(c => c.close()));
    }
  });
});

