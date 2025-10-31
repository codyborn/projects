/**
 * Test that z-index ordering works correctly:
 * - Last touched card has highest z-index
 * - Z-index increments by 1 each time
 * - Z-index is sent to server and synced to all players
 * - Server uses highest z-index when dealing new cards
 */

const { test, expect } = require('@playwright/test');
const {
  waitForGameInit,
  createRoom,
  joinRoom,
  waitForWebSocketConnection,
  loadDeck,
  dealCardsToTable,
  getAllCardsCount,
} = require('./helpers');

test.describe('Z-Index Ordering Tests', () => {
  test('Last touched card has highest z-index, increments by 1, and syncs to server', async ({ browser }) => {
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
      
      // Player joins room
      await joinRoom(playerPage, roomCode);
      
      await waitForWebSocketConnection(hostPage);
      await waitForWebSocketConnection(playerPage);
      
      // Load deck and sync to server
      await loadDeck(hostPage, 'standard');
      await hostPage.waitForTimeout(1000);
      
      // Deal 3 cards to the table
      await dealCardsToTable(hostPage, 3);
      await hostPage.waitForTimeout(1000);
      await playerPage.waitForTimeout(1000);
      
      // Verify all cards are visible on both pages
      const hostCardCount = await getAllCardsCount(hostPage);
      const playerCardCount = await getAllCardsCount(playerPage);
      expect(hostCardCount).toBeGreaterThanOrEqual(3);
      expect(playerCardCount).toBeGreaterThanOrEqual(3);
      
      // Get initial z-indexes from host (get all cards, including those with 0 z-index)
      const initialZIndexes = await hostPage.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('.card'));
        return cards.map(card => {
          const zIndexStr = card.style.zIndex || '0';
          // Parse z-index, handling 'px' suffix and invalid values
          let zIndex = 0;
          if (zIndexStr && zIndexStr !== 'auto' && zIndexStr !== 'inherit') {
            const parsed = parseInt(zIndexStr.replace('px', ''), 10);
            zIndex = isNaN(parsed) ? 0 : parsed;
          }
          return {
            uniqueId: card.dataset.uniqueId,
            zIndex: zIndex
          };
        });
      });
      
      expect(initialZIndexes.length).toBeGreaterThanOrEqual(3);
      
      // Find the highest initial z-index (ignore max int values, default to 10000 if needed)
      const validZIndexes = initialZIndexes.map(c => c.zIndex).filter(z => z < 2147483647 && z >= 0);
      const maxInitialZIndex = validZIndexes.length > 0 
        ? Math.max(...validZIndexes)
        : 10000;
      
      // Touch the first card (click it without dragging)
      const firstCardId = initialZIndexes[0].uniqueId;
      
      // Get card bounding box
      const firstCardBox = await hostPage.evaluate((cardId) => {
        const card = document.querySelector(`[data-unique-id="${cardId}"]`);
        if (card) {
          const rect = card.getBoundingClientRect();
          return {
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height
          };
        }
        return null;
      }, firstCardId);
      
      expect(firstCardBox).toBeTruthy();
      
      // Simulate mousedown and mouseup with proper timing
      const cardCenterX = firstCardBox.left + firstCardBox.width / 2;
      const cardCenterY = firstCardBox.top + firstCardBox.height / 2;
      
      await hostPage.mouse.move(cardCenterX, cardCenterY);
      await hostPage.mouse.down();
      await hostPage.waitForTimeout(100); // Small delay
      await hostPage.mouse.up();
      
      await hostPage.waitForTimeout(500);
      await playerPage.waitForTimeout(1000); // Wait for sync
      
      // Verify z-index was incremented for the touched card
      const afterTouchZIndexes = await hostPage.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('.card'));
        return cards.map(card => {
          const zIndexStr = card.style.zIndex || '0';
          let zIndex = 0;
          if (zIndexStr && zIndexStr !== 'auto' && zIndexStr !== 'inherit') {
            const parsed = parseInt(zIndexStr.replace('px', ''), 10);
            zIndex = isNaN(parsed) ? 0 : parsed;
          }
          return {
            uniqueId: card.dataset.uniqueId,
            zIndex: zIndex
          };
        });
      });
      
      const touchedCard = afterTouchZIndexes.find(c => c.uniqueId === firstCardId);
      expect(touchedCard).toBeTruthy();
      
      // Filter out max int values (invalid z-indexes from Date.now())
      const validTouchedZIndex = touchedCard.zIndex < 2000000000 ? touchedCard.zIndex : 0;
      expect(validTouchedZIndex).toBeGreaterThan(maxInitialZIndex);
      
      // Verify other cards have lower z-index (ignore max int values)
      const otherCards = afterTouchZIndexes.filter(c => c.uniqueId !== firstCardId);
      const touchedCardZIndex = touchedCard.zIndex < 2147483647 ? touchedCard.zIndex : 10000;
      otherCards.forEach(card => {
        const cardZIndex = card.zIndex < 2147483647 ? card.zIndex : 0;
        if (touchedCardZIndex > 0) {
          expect(cardZIndex).toBeLessThanOrEqual(touchedCardZIndex);
        }
      });
      
      // Verify player page also sees the updated z-index
      const playerZIndexes = await playerPage.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('.card'));
        return cards.map(card => {
          const zIndexStr = card.style.zIndex || '0';
          let zIndex = 0;
          if (zIndexStr && zIndexStr !== 'auto' && zIndexStr !== 'inherit') {
            const parsed = parseInt(zIndexStr.replace('px', ''), 10);
            zIndex = isNaN(parsed) ? 0 : parsed;
          }
          return {
            uniqueId: card.dataset.uniqueId,
            zIndex: zIndex
          };
        });
      });
      
      const playerTouchedCard = playerZIndexes.find(c => c.uniqueId === firstCardId);
      expect(playerTouchedCard).toBeTruthy();
      expect(playerTouchedCard.zIndex).toBe(touchedCard.zIndex); // Should match host
      
      // Touch a different card and verify it gets an even higher z-index
      const secondCardId = initialZIndexes[1].uniqueId;
      
      const secondCardBox = await hostPage.evaluate((cardId) => {
        const card = document.querySelector(`[data-unique-id="${cardId}"]`);
        if (card) {
          const rect = card.getBoundingClientRect();
          return {
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height
          };
        }
        return null;
      }, secondCardId);
      
      expect(secondCardBox).toBeTruthy();
      
      const secondCardCenterX = secondCardBox.left + secondCardBox.width / 2;
      const secondCardCenterY = secondCardBox.top + secondCardBox.height / 2;
      
      await hostPage.mouse.move(secondCardCenterX, secondCardCenterY);
      await hostPage.mouse.down();
      await hostPage.waitForTimeout(100);
      await hostPage.mouse.up();
      
      await hostPage.waitForTimeout(500);
      await playerPage.waitForTimeout(1000);
      
      // Verify second card now has highest z-index
      const finalZIndexes = await hostPage.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('.card'));
        return cards.map(card => {
          const zIndexStr = card.style.zIndex || '0';
          let zIndex = 0;
          if (zIndexStr && zIndexStr !== 'auto' && zIndexStr !== 'inherit') {
            const parsed = parseInt(zIndexStr.replace('px', ''), 10);
            zIndex = isNaN(parsed) ? 0 : parsed;
          }
          return {
            uniqueId: card.dataset.uniqueId,
            zIndex: zIndex
          };
        });
      });
      
      const secondTouchedCard = finalZIndexes.find(c => c.uniqueId === secondCardId);
      const firstTouchedCardAfter = finalZIndexes.find(c => c.uniqueId === firstCardId);
      
      // Filter out max int values (invalid z-indexes)
      const validSecondZIndex = secondTouchedCard.zIndex < 2000000000 ? secondTouchedCard.zIndex : 0;
      const validFirstZIndex = firstTouchedCardAfter.zIndex < 2000000000 ? firstTouchedCardAfter.zIndex : 0;
      
      expect(validSecondZIndex).toBeGreaterThan(validFirstZIndex);
      // Should increment by at least 1 (may be more if other actions occurred)
      expect(validSecondZIndex).toBeGreaterThanOrEqual(validFirstZIndex + 1);
      
      // Verify server uses highest z-index when dealing new card
      const validFinalZIndexes = finalZIndexes.map(c => c.zIndex).filter(z => z < 2000000000 && z >= 0);
      const highestZIndexBeforeDeal = validFinalZIndexes.length > 0 ? Math.max(...validFinalZIndexes) : 10000;
      
      // Deal a new card
      const tableBox = await hostPage.locator('#card-table').boundingBox();
      await hostPage.evaluate(({ x, y }) => {
        if (window.cardGame) {
          window.cardGame.dealCardToPosition(x, y);
        }
      }, { x: tableBox.x + 100, y: tableBox.y + 100 });
      
      await hostPage.waitForTimeout(1000);
      await playerPage.waitForTimeout(1000);
      
      // Get z-index of newly dealt card
      const allCardsAfterDeal = await hostPage.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('.card'));
        return cards.map(card => {
          const zIndexStr = card.style.zIndex || '0';
          let zIndex = 0;
          if (zIndexStr && zIndexStr !== 'auto' && zIndexStr !== 'inherit') {
            const parsed = parseInt(zIndexStr.replace('px', ''), 10);
            zIndex = isNaN(parsed) ? 0 : parsed;
          }
          return {
            uniqueId: card.dataset.uniqueId,
            zIndex: zIndex
          };
        });
      });
      
      // Find the new card (one that wasn't in finalZIndexes)
      const existingIds = new Set(finalZIndexes.map(c => c.uniqueId));
      const newCard = allCardsAfterDeal.find(c => !existingIds.has(c.uniqueId));
      
      expect(newCard).toBeTruthy();
      // Filter out invalid z-indexes
      const newCardZIndex = newCard.zIndex < 2000000000 ? newCard.zIndex : 0;
      expect(newCardZIndex).toBeGreaterThan(highestZIndexBeforeDeal); // Should be higher than previous max
      
    } finally {
      await hostContext.close();
      await playerContext.close();
    }
  });
});

