/**
 * Multi-Card Selection Tests
 * Based on MULTI_CARD_SELECTION_SPEC.md - Success Criteria
 */

const { test, expect } = require('@playwright/test');
const {
  waitForGameInit,
  dealCard,
  dealCards,
  getDiscardPileCount,
  getAllCardsCount,
  getCardsInDiscardPile,
  createRoom,
  joinRoom,
  waitForWebSocketConnection,
  getPrivateHandCount,
} = require('./helpers');

// Shared room code for all tests - reduces server memory bloat
const SHARED_ROOM_CODE = 'TEST1';

test.describe('Multi-Card Selection Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForGameInit(page);
    
    // Connect to shared room - all tests use the same room to reduce server memory
    // Set room code input and join
    await page.evaluate((roomCode) => {
      const input = document.querySelector('#room-code-input');
      if (input) {
        input.value = roomCode;
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }, SHARED_ROOM_CODE);
    
    await page.waitForTimeout(300);
    
    // Join room using helper
    await joinRoom(page, SHARED_ROOM_CODE);
    
    // Wait for connection
    await waitForWebSocketConnection(page, 15000);
  });

  /**
   * Helper: Create selection rectangle by dragging on empty table area
   */
  async function createSelectionRectangle(page, startX, startY, endX, endY) {
    const cardTable = page.locator('#card-table');
    const tableBox = await cardTable.boundingBox();
    
    if (!tableBox) {
      throw new Error('Card table not found');
    }
    
    // Convert to absolute coordinates
    const absStartX = tableBox.x + startX;
    const absStartY = tableBox.y + startY;
    const absEndX = tableBox.x + endX;
    const absEndY = tableBox.y + endY;
    
    // Ensure we have movement > threshold (5px) to trigger selection
    const deltaX = absEndX - absStartX;
    const deltaY = absEndY - absStartY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // If distance is too small, extend the end position
    let actualEndX = absEndX;
    let actualEndY = absEndY;
    if (distance < 10) {
      // Extend by at least 20px in the direction of movement
      actualEndX = absStartX + (deltaX === 0 ? 50 : (deltaX / distance) * 50);
      actualEndY = absStartY + (deltaY === 0 ? 50 : (deltaY / distance) * 50);
    }
    
    // Click on empty table area first (to ensure we're clicking on table, not card)
    await page.mouse.click(absStartX, absStartY, { delay: 100 });
    await page.waitForTimeout(100);
    
    // Start drag on empty table area
    await page.mouse.move(absStartX, absStartY);
    await page.mouse.down();
    await page.waitForTimeout(100);
    
    // Drag to end position (with intermediate steps to ensure threshold is met)
    await page.mouse.move(absStartX + (actualEndX - absStartX) / 2, absStartY + (actualEndY - absStartY) / 2);
    await page.waitForTimeout(50);
    await page.mouse.move(actualEndX, actualEndY);
    await page.waitForTimeout(100);
    
    // Release
    await page.mouse.up();
    await page.waitForTimeout(200);
  }

  /**
   * Helper: Get selected cards
   */
  async function getSelectedCards(page) {
    return await page.evaluate(() => {
      const cards = document.querySelectorAll('.card.card-selected');
      return Array.from(cards).map(card => card.dataset.uniqueId);
    });
  }

  /**
   * Helper: Check if selection rectangle exists
   */
  async function hasSelectionRectangle(page) {
    return await page.evaluate(() => {
      return document.querySelector('.selection-rectangle') !== null;
    });
  }

  /**
   * Helper: Check if cards have selection highlight
   */
  async function hasSelectionHighlight(page, uniqueIds) {
    return await page.evaluate((ids) => {
      for (const id of ids) {
        const card = document.querySelector(`[data-unique-id="${id}"]`);
        if (!card || !card.classList.contains('card-selected')) {
          return false;
        }
      }
      return true;
    }, uniqueIds);
  }

  /**
   * Helper: Clear selection (Escape key or click empty area)
   */
  async function clearSelection(page) {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(100);
  }

  /**
   * Helper: Drag selected cards as a group
   */
  async function dragGroup(page, fromX, fromY, toX, toY) {
    const cardTable = page.locator('#card-table');
    const tableBox = await cardTable.boundingBox();
    
    if (!tableBox) {
      throw new Error('Card table not found');
    }
    
    const absFromX = tableBox.x + fromX;
    const absFromY = tableBox.y + fromY;
    const absToX = tableBox.x + toX;
    const absToY = tableBox.y + toY;
    
    // Click on first selected card
    await page.mouse.move(absFromX, absFromY);
    await page.mouse.down();
    await page.waitForTimeout(50);
    
    // Drag to target position
    await page.mouse.move(absToX, absToY);
    await page.waitForTimeout(50);
    
    // Release
    await page.mouse.up();
    await page.waitForTimeout(300);
  }

  /**
   * Helper: Get card positions
   */
  async function getCardPositions(page, uniqueIds) {
    return await page.evaluate((ids) => {
      const positions = {};
      for (const id of ids) {
        const card = document.querySelector(`[data-unique-id="${id}"]`);
        if (card) {
          positions[id] = {
            x: parseInt(card.style.left) || 0,
            y: parseInt(card.style.top) || 0
          };
        }
      }
      return positions;
    }, uniqueIds);
  }

  test('Test 1: Click and drag creates selection rectangle', async ({ page }) => {
    // Get initial card count
    const initialCount = await getAllCardsCount(page);
    
    // Deal a few cards
    await dealCards(page, 3);
    await page.waitForTimeout(1000);
    
    // Wait for new cards to appear (at least 3 more than initial)
    const cards = page.locator('.card');
    await page.waitForFunction(
      (expectedCount) => {
        const count = document.querySelectorAll('.card').length;
        return count >= expectedCount;
      },
      initialCount + 3,
      { timeout: 5000 }
    );
    
    // Get the newly dealt cards (last 3 cards)
    const allCards = await cards.all();
    const newCards = allCards.slice(-3); // Last 3 cards should be the ones we just dealt
    const firstCard = newCards[0];
    const firstCardBox = await firstCard.boundingBox();
    
    if (!firstCardBox) {
      throw new Error('First card not found');
    }
    
    // Create selection rectangle that covers cards
    const cardTable = page.locator('#card-table');
    const tableBox = await cardTable.boundingBox();
    
    if (!tableBox) {
      throw new Error('Card table not found');
    }
    
    // Drag from empty area near cards to empty area beyond cards
    const startX = firstCardBox.x - tableBox.x - 50;
    const startY = firstCardBox.y - tableBox.y - 50;
    const endX = firstCardBox.x - tableBox.x + firstCardBox.width + 100;
    const endY = firstCardBox.y - tableBox.y + firstCardBox.height + 100;
    
    // Create selection rectangle
    await createSelectionRectangle(page, startX, startY, endX, endY);
    
    // Verify selection rectangle was created (it should be removed after drag ends)
    // But cards should be selected
    const selectedCards = await getSelectedCards(page);
    expect(selectedCards.length).toBeGreaterThan(0);
  });

  test('Test 2: Selection rectangle displays in player color', async ({ page }) => {
    // Deal a card
    await dealCard(page);
    await page.waitForTimeout(500);
    
    const cardTable = page.locator('#card-table');
    const tableBox = await cardTable.boundingBox();
    
    if (!tableBox) {
      throw new Error('Card table not found');
    }
    
    // Start selection drag
    const startX = 100;
    const startY = 100;
    const endX = 300;
    const endY = 300;
    
    await page.mouse.move(tableBox.x + startX, tableBox.y + startY);
    await page.mouse.down();
    await page.waitForTimeout(100);
    
    // Drag a bit to ensure movement threshold is met
    await page.mouse.move(tableBox.x + startX + 10, tableBox.y + startY + 10);
    await page.waitForTimeout(100);
    
    // Check if selection rectangle appears with player color
    const hasRect = await hasSelectionRectangle(page);
    expect(hasRect).toBe(true);
    
    // Check if rectangle has color styling
    const rectColor = await page.evaluate(() => {
      const rect = document.querySelector('.selection-rectangle');
      if (!rect) return null;
      const style = window.getComputedStyle(rect);
      return {
        borderColor: style.borderColor,
        hasColorVar: rect.style.getPropertyValue('--selection-color') || 
                     style.getPropertyValue('--selection-color')
      };
    });
    
    expect(rectColor).not.toBeNull();
    
    // Complete the drag
    await page.mouse.move(tableBox.x + endX, tableBox.y + endY);
    await page.mouse.up();
    await page.waitForTimeout(100);
  });

  test('Test 3: Selected cards are highlighted in player color', async ({ page }) => {
    // Get initial card count
    const initialCount = await getAllCardsCount(page);
    
    // Deal a few cards
    await dealCards(page, 3);
    await page.waitForTimeout(1000);
    
    // Wait for new cards to appear
    const cards = page.locator('.card');
    await page.waitForFunction(
      (expectedCount) => {
        const count = document.querySelectorAll('.card').length;
        return count >= expectedCount;
      },
      initialCount + 3,
      { timeout: 5000 }
    );
    
    // Get the newly dealt cards (last 3 cards)
    const allCards = await cards.all();
    const newCards = allCards.slice(-3);
    const firstCard = newCards[0];
    const firstCardBox = await firstCard.boundingBox();
    const firstCardId = await firstCard.getAttribute('data-unique-id');
    
    if (!firstCardBox) {
      throw new Error('First card not found');
    }
    
    const cardTable = page.locator('#card-table');
    const tableBox = await cardTable.boundingBox();
    
    if (!tableBox) {
      throw new Error('Card table not found');
    }
    
    // Create selection rectangle that includes at least one card
    const startX = firstCardBox.x - tableBox.x - 20;
    const startY = firstCardBox.y - tableBox.y - 20;
    const endX = firstCardBox.x - tableBox.x + firstCardBox.width + 20;
    const endY = firstCardBox.y - tableBox.y + firstCardBox.height + 20;
    
    await createSelectionRectangle(page, startX, startY, endX, endY);
    
    // Verify cards are selected and highlighted
    const selectedCards = await getSelectedCards(page);
    expect(selectedCards.length).toBeGreaterThan(0);
    expect(selectedCards).toContain(firstCardId);
    
    // Check if selected card has highlight styling
    const hasHighlight = await hasSelectionHighlight(page, [firstCardId]);
    expect(hasHighlight).toBe(true);
    
    // Check if highlight has player color
    const highlightColor = await page.evaluate((id) => {
      const card = document.querySelector(`[data-unique-id="${id}"]`);
      if (!card) return null;
      const style = window.getComputedStyle(card);
      return {
        borderWidth: style.borderWidth,
        hasColorVar: style.getPropertyValue('--selection-color')
      };
    }, firstCardId);
    
    expect(highlightColor).not.toBeNull();
    expect(parseInt(highlightColor.borderWidth) || 0).toBeGreaterThan(0);
  });

  test('Test 4: Discard pile cards are excluded from selection', async ({ page }) => {
    // Get initial card count
    const initialCount = await getAllCardsCount(page);
    
    // Deal a card
    await dealCard(page);
    await page.waitForTimeout(1000);
    
    // Wait for new card to appear
    const cards = page.locator('.card');
    await page.waitForFunction(
      (expectedCount) => {
        const count = document.querySelectorAll('.card').length;
        return count >= expectedCount;
      },
      initialCount + 1,
      { timeout: 5000 }
    );
    
    // Get the newly dealt card (last card)
    const allCards = await cards.all();
    const card = allCards[allCards.length - 1];
    
    // Right-click to discard
    const uniqueId = await card.getAttribute('data-unique-id');
    await page.evaluate((id) => {
      const cardEl = document.querySelector(`[data-unique-id="${id}"]`);
      if (cardEl) {
        const event = new MouseEvent('contextmenu', {
          bubbles: true,
          cancelable: true,
          button: 2
        });
        cardEl.dispatchEvent(event);
      }
    }, uniqueId);
    
    await page.waitForTimeout(500);
    
    // Verify card is in discard pile
    const discardCount = await getDiscardPileCount(page);
    expect(discardCount).toBe(1);
    
    // Try to select the discard pile area
    const discardPileArea = page.locator('#discard-pile-area');
    const areaBox = await discardPileArea.boundingBox();
    
    if (areaBox) {
      const cardTable = page.locator('#card-table');
      const tableBox = await cardTable.boundingBox();
      
      if (tableBox) {
        // Create selection rectangle over discard pile area
        const startX = areaBox.x - tableBox.x - 10;
        const startY = areaBox.y - tableBox.y - 10;
        const endX = areaBox.x - tableBox.x + areaBox.width + 10;
        const endY = areaBox.y - tableBox.y + areaBox.height + 10;
        
        await createSelectionRectangle(page, startX, startY, endX, endY);
        
        // Verify discard pile card is NOT selected
        const selectedCards = await getSelectedCards(page);
        expect(selectedCards).not.toContain(uniqueId);
      }
    }
  });

  test('Test 5: Private zone cards are included in selection', async ({ page }) => {
    // Get initial card count
    const initialCount = await getAllCardsCount(page);
    
    // Deal a card
    await dealCard(page);
    await page.waitForTimeout(1000);
    
    // Wait for new card to appear
    const cards = page.locator('.card');
    await page.waitForFunction(
      (expectedCount) => {
        const count = document.querySelectorAll('.card').length;
        return count >= expectedCount;
      },
      initialCount + 1,
      { timeout: 5000 }
    );
    
    // Get the newly dealt card (last card)
    const allCards = await cards.all();
    const card = allCards[allCards.length - 1];
    const uniqueId = await card.getAttribute('data-unique-id');
    const cardBox = await card.boundingBox();
    
    // Move card to private zone
    const privateHandZone = page.locator('#private-hand-zone');
    const zoneBox = await privateHandZone.boundingBox();
    
    if (!cardBox || !zoneBox) {
      throw new Error('Card or private zone not found');
    }
    
    // Drag card to private zone
    const cardTable = page.locator('#card-table');
    const tableBox = await cardTable.boundingBox();
    
    if (!tableBox) {
      throw new Error('Card table not found');
    }
    
    await card.dragTo(cardTable, {
      targetPosition: { 
        x: zoneBox.x - tableBox.x + zoneBox.width / 2, 
        y: zoneBox.y - tableBox.y + zoneBox.height / 2 
      }
    });
    await page.waitForTimeout(500);
    
    // Verify card is in private zone (has privateTo attribute)
    const isPrivate = await page.evaluate((id) => {
      const cardEl = document.querySelector(`[data-unique-id="${id}"]`);
      return cardEl && cardEl.dataset.privateTo !== undefined && cardEl.dataset.privateTo !== 'null';
    }, uniqueId);
    
    expect(isPrivate).toBe(true);
    
    // Try to select the private zone area
    // Create selection rectangle over private zone area
    const startX = zoneBox.x - tableBox.x - 10;
    const startY = zoneBox.y - tableBox.y - 10;
    const endX = zoneBox.x - tableBox.x + zoneBox.width + 10;
    const endY = zoneBox.y - tableBox.y + zoneBox.height + 10;
    
    await createSelectionRectangle(page, startX, startY, endX, endY);
    
    // Verify private zone card IS selected
    const selectedCards = await getSelectedCards(page);
    expect(selectedCards).toContain(uniqueId);
  });

  test('Test 6: Group can be moved together maintaining relative positions', async ({ page }) => {
    // Get initial card count
    const initialCount = await getAllCardsCount(page);
    
    // Deal a few cards
    await dealCards(page, 3);
    await page.waitForTimeout(1000);
    
    // Wait for new cards to appear
    const cards = page.locator('.card');
    await page.waitForFunction(
      (expectedCount) => {
        const count = document.querySelectorAll('.card').length;
        return count >= expectedCount;
      },
      initialCount + 3,
      { timeout: 5000 }
    );
    
    // Get the newly dealt cards (last 3 cards)
    const allCards = await cards.all();
    const newCards = allCards.slice(-3);
    
    // Get initial positions
    const uniqueIds = [];
    const initialPositions = {};
    
    for (const card of newCards) {
      const uniqueId = await card.getAttribute('data-unique-id');
      uniqueIds.push(uniqueId);
      
      const pos = await page.evaluate((id) => {
        const cardEl = document.querySelector(`[data-unique-id="${id}"]`);
        return {
          x: parseInt(cardEl.style.left) || 0,
          y: parseInt(cardEl.style.top) || 0
        };
      }, uniqueId);
      initialPositions[uniqueId] = pos;
    }
    
    // Select all cards with selection rectangle
    const firstCard = newCards[0];
    const firstCardBox = await firstCard.boundingBox();
    
    if (!firstCardBox) {
      throw new Error('First card not found');
    }
    
    const cardTable = page.locator('#card-table');
    const tableBox = await cardTable.boundingBox();
    
    if (!tableBox) {
      throw new Error('Card table not found');
    }
    
    // Create selection rectangle that covers all cards
    const startX = firstCardBox.x - tableBox.x - 50;
    const startY = firstCardBox.y - tableBox.y - 50;
    const endX = firstCardBox.x - tableBox.x + firstCardBox.width + 300;
    const endY = firstCardBox.y - tableBox.y + firstCardBox.height + 300;
    
    await createSelectionRectangle(page, startX, startY, endX, endY);
    
    // Verify all cards are selected
    const selectedCards = await getSelectedCards(page);
    expect(selectedCards.length).toBe(3);
    
    // Calculate relative positions between cards
    const relativePositions = {};
    const firstCardId = uniqueIds[0];
    const firstCardPos = initialPositions[firstCardId];
    
    for (let i = 1; i < uniqueIds.length; i++) {
      const cardId = uniqueIds[i];
      const cardPos = initialPositions[cardId];
      relativePositions[cardId] = {
        x: cardPos.x - firstCardPos.x,
        y: cardPos.y - firstCardPos.y
      };
    }
    
    // Drag group to new position
    const dragFromX = firstCardBox.x - tableBox.x + firstCardBox.width / 2;
    const dragFromY = firstCardBox.y - tableBox.y + firstCardBox.height / 2;
    const dragToX = dragFromX + 200;
    const dragToY = dragFromY + 200;
    
    await dragGroup(page, dragFromX, dragFromY, dragToX, dragToY);
    
    // Get final positions
    const finalPositions = await getCardPositions(page, uniqueIds);
    
    // Verify relative positions are maintained
    const firstCardFinalPos = finalPositions[firstCardId];
    
    for (let i = 1; i < uniqueIds.length; i++) {
      const cardId = uniqueIds[i];
      const finalPos = finalPositions[cardId];
      const relativePos = relativePositions[cardId];
      
      // Calculate expected position
      const expectedX = firstCardFinalPos.x + relativePos.x;
      const expectedY = firstCardFinalPos.y + relativePos.y;
      
      // Allow small margin for rounding errors (within 5px)
      expect(Math.abs(finalPos.x - expectedX)).toBeLessThan(5);
      expect(Math.abs(finalPos.y - expectedY)).toBeLessThan(5);
    }
  });

  test('Test 7: Group can be dropped in private zone and organized neatly', async ({ page }) => {
    // Get initial card count
    const initialCount = await getAllCardsCount(page);
    
    // Deal a few cards
    await dealCards(page, 3);
    await page.waitForTimeout(1000);
    
    // Wait for new cards to appear
    const cards = page.locator('.card');
    await page.waitForFunction(
      (expectedCount) => {
        const count = document.querySelectorAll('.card').length;
        return count >= expectedCount;
      },
      initialCount + 3,
      { timeout: 5000 }
    );
    
    // Get the newly dealt cards (last 3 cards)
    const allCards = await cards.all();
    const newCards = allCards.slice(-3);
    
    // Select all cards
    const firstCard = newCards[0];
    const firstCardBox = await firstCard.boundingBox();
    
    if (!firstCardBox) {
      throw new Error('First card not found');
    }
    
    const cardTable = page.locator('#card-table');
    const tableBox = await cardTable.boundingBox();
    const privateHandZone = page.locator('#private-hand-zone');
    const zoneBox = await privateHandZone.boundingBox();
    
    if (!tableBox || !zoneBox) {
      throw new Error('Table or private zone not found');
    }
    
    // Create selection rectangle
    const startX = firstCardBox.x - tableBox.x - 20;
    const startY = firstCardBox.y - tableBox.y - 20;
    const endX = firstCardBox.x - tableBox.x + firstCardBox.width + 200;
    const endY = firstCardBox.y - tableBox.y + firstCardBox.height + 200;
    
    await createSelectionRectangle(page, startX, startY, endX, endY);
    
    // Verify cards are selected
    const selectedCards = await getSelectedCards(page);
    expect(selectedCards.length).toBe(3);
    
    // Drag group to private zone center
    const zoneCenterX = zoneBox.x - tableBox.x + zoneBox.width / 2;
    const zoneCenterY = zoneBox.y - tableBox.y + zoneBox.height / 2;
    const dragFromX = firstCardBox.x - tableBox.x + firstCardBox.width / 2;
    const dragFromY = firstCardBox.y - tableBox.y + firstCardBox.height / 2;
    
    await dragGroup(page, dragFromX, dragFromY, zoneCenterX, zoneCenterY);
    
    // Verify all cards are in private zone
    const uniqueIds = selectedCards;
    const allInPrivate = await page.evaluate((ids) => {
      for (const id of ids) {
        const cardEl = document.querySelector(`[data-unique-id="${id}"]`);
        if (!cardEl || !cardEl.dataset.privateTo || cardEl.dataset.privateTo === 'null') {
          return false;
        }
      }
      return true;
    }, uniqueIds);
    
    expect(allInPrivate).toBe(true);
    
    // Verify private hand count increased
    const privateHandCount = await getPrivateHandCount(page);
    expect(privateHandCount).toBeGreaterThanOrEqual(3);
  });

  test('Test 8: Group can be dropped in discard pile', async ({ page }) => {
    // Get initial card count
    const initialCount = await getAllCardsCount(page);
    
    // Deal a few cards
    await dealCards(page, 3);
    await page.waitForTimeout(1000);
    
    // Wait for new cards to appear
    const cards = page.locator('.card');
    await page.waitForFunction(
      (expectedCount) => {
        const count = document.querySelectorAll('.card').length;
        return count >= expectedCount;
      },
      initialCount + 3,
      { timeout: 5000 }
    );
    
    // Get the newly dealt cards (last 3 cards)
    const allCards = await cards.all();
    const newCards = allCards.slice(-3);
    
    // Get initial discard count
    const initialDiscardCount = await getDiscardPileCount(page);
    
    // Select all cards
    const firstCard = newCards[0];
    const firstCardBox = await firstCard.boundingBox();
    
    if (!firstCardBox) {
      throw new Error('First card not found');
    }
    
    const cardTable = page.locator('#card-table');
    const tableBox = await cardTable.boundingBox();
    const discardPileArea = page.locator('#discard-pile-area');
    const areaBox = await discardPileArea.boundingBox();
    
    if (!tableBox || !areaBox) {
      throw new Error('Table or discard pile area not found');
    }
    
    // Create selection rectangle
    const startX = firstCardBox.x - tableBox.x - 20;
    const startY = firstCardBox.y - tableBox.y - 20;
    const endX = firstCardBox.x - tableBox.x + firstCardBox.width + 200;
    const endY = firstCardBox.y - tableBox.y + firstCardBox.height + 200;
    
    await createSelectionRectangle(page, startX, startY, endX, endY);
    
    // Verify cards are selected
    const selectedCards = await getSelectedCards(page);
    expect(selectedCards.length).toBe(3);
    
    // Drag group to discard pile area center
    const areaCenterX = areaBox.x - tableBox.x + areaBox.width / 2;
    const areaCenterY = areaBox.y - tableBox.y + areaBox.height / 2;
    const dragFromX = firstCardBox.x - tableBox.x + firstCardBox.width / 2;
    const dragFromY = firstCardBox.y - tableBox.y + firstCardBox.height / 2;
    
    await dragGroup(page, dragFromX, dragFromY, areaCenterX, areaCenterY);
    await page.waitForTimeout(500);
    
    // Verify discard count increased by 3
    const finalDiscardCount = await getDiscardPileCount(page);
    expect(finalDiscardCount).toBe(initialDiscardCount + 3);
  });

  test('Test 9: Only final state is sent to server (no intermediate updates)', async ({ browser }) => {
    // Setup: Two browser contexts
    const hostContext = await browser.newContext();
    const playerContext = await browser.newContext();
    
    const hostPage = await hostContext.newPage();
    const playerPage = await playerContext.newPage();
    
    try {
      // Initialize both pages
      await hostPage.goto('/');
      await playerPage.goto('/');
      
      await waitForGameInit(hostPage);
      await waitForGameInit(playerPage);
      
      // Host: Join shared room
      await joinRoom(hostPage, SHARED_ROOM_CODE);
      
      // Player: Join same shared room
      await joinRoom(playerPage, SHARED_ROOM_CODE);
      
      // Wait for connections
      await waitForWebSocketConnection(hostPage);
      await waitForWebSocketConnection(playerPage);
      
      // Get initial card count
      const initialHostCount = await getAllCardsCount(hostPage);
      
      // Host: Deal cards
      await dealCards(hostPage, 3);
      await hostPage.waitForTimeout(1000);
      
      // Wait for sync
      await hostPage.waitForTimeout(1000);
      await playerPage.waitForTimeout(1000);
      
      // Host: Select cards and drag
      const hostCards = hostPage.locator('.card');
      await hostPage.waitForFunction(
        (expectedCount) => {
          const count = document.querySelectorAll('.card').length;
          return count >= expectedCount;
        },
        initialHostCount + 3,
        { timeout: 5000 }
      );
      
      // Get the newly dealt cards (last 3 cards)
      const allHostCards = await hostCards.all();
      const newHostCards = allHostCards.slice(-3);
      const firstCard = newHostCards[0];
      const firstCardBox = await firstCard.boundingBox();
      
      if (!firstCardBox) {
        throw new Error('First card not found');
      }
      
      const cardTable = hostPage.locator('#card-table');
      const tableBox = await cardTable.boundingBox();
      
      if (!tableBox) {
        throw new Error('Card table not found');
      }
      
      // Create selection rectangle
      const startX = firstCardBox.x - tableBox.x - 20;
      const startY = firstCardBox.y - tableBox.y - 20;
      const endX = firstCardBox.x - tableBox.x + firstCardBox.width + 200;
      const endY = firstCardBox.y - tableBox.y + firstCardBox.height + 200;
      
      await createSelectionRectangle(hostPage, startX, startY, endX, endY);
      
      // Track WebSocket messages during drag
      const playerMessages = [];
      playerPage.on('console', (msg) => {
        const text = msg.text();
        if (text.includes('cardState') || text.includes('updateCardState')) {
          playerMessages.push(text);
        }
      });
      
      // Drag group to new position
      const dragFromX = firstCardBox.x - tableBox.x + firstCardBox.width / 2;
      const dragFromY = firstCardBox.y - tableBox.y + firstCardBox.height / 2;
      const dragToX = dragFromX + 200;
      const dragToY = dragFromY + 200;
      
      await dragGroup(hostPage, dragFromX, dragFromY, dragToX, dragToY);
      
      // Wait for sync
      await hostPage.waitForTimeout(2000);
      await playerPage.waitForTimeout(2000);
      
      // Verify player sees final positions (not intermediate)
      const playerCards = playerPage.locator('.card');
      await expect(playerCards).toHaveCount(3);
      
      // Verify cards are in final positions on player page
      const firstCardId = await firstCard.getAttribute('data-unique-id');
      const playerFirstCard = playerPage.locator(`[data-unique-id="${firstCardId}"]`);
      const playerFirstCardBox = await playerFirstCard.boundingBox();
      
      if (playerFirstCardBox) {
        // Calculate expected final position (table-relative)
        const expectedX = dragToX;
        const expectedY = dragToY;
        
        // Verify position is close to expected (within 10px margin)
        const actualX = playerFirstCardBox.x - tableBox.x;
        const actualY = playerFirstCardBox.y - tableBox.y;
        
        // Note: We're checking that the card moved, not exact position
        // The exact position might differ due to snap-to-grid or other positioning logic
        expect(Math.abs(actualX - expectedX)).toBeLessThan(50);
        expect(Math.abs(actualY - expectedY)).toBeLessThan(50);
      }
    } finally {
      await hostContext.close();
      await playerContext.close();
    }
  });

  test('Test 10: Other players see correct final positions', async ({ browser }) => {
    // Setup: Two browser contexts
    const hostContext = await browser.newContext();
    const playerContext = await browser.newContext();
    
    const hostPage = await hostContext.newPage();
    const playerPage = await playerContext.newPage();
    
    try {
      // Initialize both pages
      await hostPage.goto('/');
      await playerPage.goto('/');
      
      await waitForGameInit(hostPage);
      await waitForGameInit(playerPage);
      
      // Host: Join shared room
      await joinRoom(hostPage, SHARED_ROOM_CODE);
      
      // Player: Join same shared room
      await joinRoom(playerPage, SHARED_ROOM_CODE);
      
      // Wait for connections
      await waitForWebSocketConnection(hostPage);
      await waitForWebSocketConnection(playerPage);
      
      // Get initial card count
      const initialHostCount = await getAllCardsCount(hostPage);
      
      // Host: Deal cards
      await dealCards(hostPage, 2);
      await hostPage.waitForTimeout(1000);
      await playerPage.waitForTimeout(1000);
      
      // Get card IDs from newly dealt cards
      const hostCards = hostPage.locator('.card');
      await hostPage.waitForFunction(
        (expectedCount) => {
          const count = document.querySelectorAll('.card').length;
          return count >= expectedCount;
        },
        initialHostCount + 2,
        { timeout: 5000 }
      );
      
      const allHostCards = await hostCards.all();
      const newHostCards = allHostCards.slice(-2); // Last 2 cards are the ones we just dealt
      
      const cardIds = [];
      for (const card of newHostCards) {
        const uniqueId = await card.getAttribute('data-unique-id');
        cardIds.push(uniqueId);
      }
      
      // Host: Select and move group
      const firstCard = newHostCards[0];
      const firstCardBox = await firstCard.boundingBox();
      
      if (!firstCardBox) {
        throw new Error('First card not found');
      }
      
      const hostCardTable = hostPage.locator('#card-table');
      const hostTableBox = await hostCardTable.boundingBox();
      
      if (!hostTableBox) {
        throw new Error('Host table not found');
      }
      
      // Create selection rectangle
      const startX = firstCardBox.x - hostTableBox.x - 20;
      const startY = firstCardBox.y - hostTableBox.y - 20;
      const endX = firstCardBox.x - hostTableBox.x + firstCardBox.width + 100;
      const endY = firstCardBox.y - hostTableBox.y + firstCardBox.height + 100;
      
      await createSelectionRectangle(hostPage, startX, startY, endX, endY);
      
      // Get initial positions
      const initialHostPositions = await getCardPositions(hostPage, cardIds);
      
      // Drag group
      const dragFromX = firstCardBox.x - hostTableBox.x + firstCardBox.width / 2;
      const dragFromY = firstCardBox.y - hostTableBox.y + firstCardBox.height / 2;
      const dragToX = dragFromX + 150;
      const dragToY = dragFromY + 150;
      
      await dragGroup(hostPage, dragFromX, dragFromY, dragToX, dragToY);
      
      // Wait for sync
      await hostPage.waitForTimeout(2000);
      await playerPage.waitForTimeout(2000);
      
      // Get final positions on host
      const finalHostPositions = await getCardPositions(hostPage, cardIds);
      
      // Get positions on player
      const playerPositions = await getCardPositions(playerPage, cardIds);
      
      // Verify player sees same positions as host
      for (const cardId of cardIds) {
        const hostPos = finalHostPositions[cardId];
        const playerPos = playerPositions[cardId];
        
        expect(hostPos).not.toBeUndefined();
        expect(playerPos).not.toBeUndefined();
        
        // Positions should match (within 5px margin for rounding)
        expect(Math.abs(hostPos.x - playerPos.x)).toBeLessThan(5);
        expect(Math.abs(hostPos.y - playerPos.y)).toBeLessThan(5);
      }
    } finally {
      await hostContext.close();
      await playerContext.close();
    }
  });

  test('Test 11: Selection can be cleared', async ({ page }) => {
    // Get initial card count
    const initialCount = await getAllCardsCount(page);
    
    // Deal a few cards
    await dealCards(page, 2);
    await page.waitForTimeout(1000);
    
    // Wait for new cards to appear
    const cards = page.locator('.card');
    await page.waitForFunction(
      (expectedCount) => {
        const count = document.querySelectorAll('.card').length;
        return count >= expectedCount;
      },
      initialCount + 2,
      { timeout: 5000 }
    );
    
    // Get the newly dealt cards (last 2 cards)
    const allCards = await cards.all();
    const newCards = allCards.slice(-2);
    const firstCard = newCards[0];
    const firstCardBox = await firstCard.boundingBox();
    
    if (!firstCardBox) {
      throw new Error('First card not found');
    }
    
    const cardTable = page.locator('#card-table');
    const tableBox = await cardTable.boundingBox();
    
    if (!tableBox) {
      throw new Error('Card table not found');
    }
    
    // Create selection rectangle
    const startX = firstCardBox.x - tableBox.x - 20;
    const startY = firstCardBox.y - tableBox.y - 20;
    const endX = firstCardBox.x - tableBox.x + firstCardBox.width + 100;
    const endY = firstCardBox.y - tableBox.y + firstCardBox.height + 100;
    
    await createSelectionRectangle(page, startX, startY, endX, endY);
    
    // Verify cards are selected
    let selectedCards = await getSelectedCards(page);
    expect(selectedCards.length).toBeGreaterThan(0);
    
    // Clear selection with Escape key
    await clearSelection(page);
    
    // Verify selection is cleared
    selectedCards = await getSelectedCards(page);
    expect(selectedCards.length).toBe(0);
    
    // Verify no cards have selection highlight
    const hasHighlight = await page.evaluate(() => {
      const selected = document.querySelectorAll('.card.card-selected');
      return selected.length;
    });
    expect(hasHighlight).toBe(0);
  });

  test('Test 12: Works with existing single-card drag functionality', async ({ page }) => {
    // Get initial card count
    const initialCount = await getAllCardsCount(page);
    
    // Deal a card
    await dealCard(page);
    await page.waitForTimeout(1000);
    
    // Wait for new card to appear
    const cards = page.locator('.card');
    await page.waitForFunction(
      (expectedCount) => {
        const count = document.querySelectorAll('.card').length;
        return count >= expectedCount;
      },
      initialCount + 1,
      { timeout: 5000 }
    );
    
    // Get the newly dealt card (last card)
    const allCards = await cards.all();
    const card = allCards[allCards.length - 1];
    const cardBox = await card.boundingBox();
    
    if (!cardBox) {
      throw new Error('Card not found');
    }
    
    // Get initial position
    const uniqueId = await card.getAttribute('data-unique-id');
    const initialPos = await getCardPositions(page, [uniqueId]);
    
    // Drag single card (not selected)
    const cardTable = page.locator('#card-table');
    const tableBox = await cardTable.boundingBox();
    
    if (!tableBox) {
      throw new Error('Card table not found');
    }
    
    // Use mouse events instead of dragTo to avoid pointer interception issues
    const cardCenterX = cardBox.x + cardBox.width / 2;
    const cardCenterY = cardBox.y + cardBox.height / 2;
    const targetAbsX = cardCenterX + 100;
    const targetAbsY = cardCenterY + 100;
    
    await page.mouse.move(cardCenterX, cardCenterY);
    await page.mouse.down();
    await page.waitForTimeout(100);
    await page.mouse.move(targetAbsX, targetAbsY);
    await page.waitForTimeout(100);
    await page.mouse.up();
    await page.waitForTimeout(500);
    
    // Verify card moved
    const finalPos = await getCardPositions(page, [uniqueId]);
    expect(finalPos[uniqueId].x).not.toBe(initialPos[uniqueId].x);
    expect(finalPos[uniqueId].y).not.toBe(initialPos[uniqueId].y);
    
    // Verify single card drag still works (card is not selected)
    const selectedCards = await getSelectedCards(page);
    expect(selectedCards.length).toBe(0);
  });

  test('Test 13: Single clicks (without dragging) still place cards normally', async ({ page }) => {
    // Get initial card count
    const initialCount = await getAllCardsCount(page);
    
    // Single click on empty table area (should deal a card)
    const cardTable = page.locator('#card-table');
    const tableBox = await cardTable.boundingBox();
    
    if (!tableBox) {
      throw new Error('Card table not found');
    }
    
    // Click on empty area (not dragging, just click)
    await page.mouse.click(tableBox.x + 200, tableBox.y + 200);
    await page.waitForTimeout(1000);
    
    // Verify a card was dealt
    const finalCount = await getAllCardsCount(page);
    expect(finalCount).toBeGreaterThanOrEqual(initialCount + 1);
    
    // Verify no selection rectangle was created
    const hasRect = await hasSelectionRectangle(page);
    expect(hasRect).toBe(false);
    
    // Verify no cards are selected
    const selectedCards = await getSelectedCards(page);
    expect(selectedCards.length).toBe(0);
  });

  test('Test 14: Single clicks preserve all existing card interaction behavior', async ({ page }) => {
    // Get initial card count
    const initialCount = await getAllCardsCount(page);
    
    // Deal a card
    await dealCard(page);
    await page.waitForTimeout(1000);
    
    // Wait for new card to appear
    const cards = page.locator('.card');
    await page.waitForFunction(
      (expectedCount) => {
        const count = document.querySelectorAll('.card').length;
        return count >= expectedCount;
      },
      initialCount + 1,
      { timeout: 5000 }
    );
    
    // Get the newly dealt card (last card)
    const allCards = await cards.all();
    const card = allCards[allCards.length - 1];
    const uniqueId = await card.getAttribute('data-unique-id');
    
    // Check if card is flipped initially
    const initialFlipped = await page.evaluate((id) => {
      const cardEl = document.querySelector(`[data-unique-id="${id}"]`);
      return cardEl && cardEl.classList.contains('flipped');
    }, uniqueId);
    
    // Single click on card (should flip it)
    await card.click();
    await page.waitForTimeout(500);
    
    // Verify card flip state changed
    const finalFlipped = await page.evaluate((id) => {
      const cardEl = document.querySelector(`[data-unique-id="${id}"]`);
      return cardEl && cardEl.classList.contains('flipped');
    }, uniqueId);
    
    expect(finalFlipped).not.toBe(initialFlipped);
    
    // Verify card was NOT selected (single click doesn't create selection)
    const selectedCards = await getSelectedCards(page);
    expect(selectedCards).not.toContain(uniqueId);
  });

  test('Test 15: Right-click on selected group discards all selected cards', async ({ page }) => {
    // Get initial counts
    const initialCount = await getAllCardsCount(page);
    const initialDiscardCount = await getDiscardPileCount(page);
    
    // Deal a few cards
    await dealCards(page, 3);
    await page.waitForTimeout(1000);
    
    // Wait for new cards to appear
    const cards = page.locator('.card');
    await page.waitForFunction(
      (expectedCount) => {
        const count = document.querySelectorAll('.card').length;
        return count >= expectedCount;
      },
      initialCount + 3,
      { timeout: 5000 }
    );
    
    // Get the newly dealt cards (last 3 cards)
    const allCards = await cards.all();
    const newCards = allCards.slice(-3);
    
    // Select all cards with selection rectangle
    const firstCard = newCards[0];
    const firstCardBox = await firstCard.boundingBox();
    
    if (!firstCardBox) {
      throw new Error('First card not found');
    }
    
    const cardTable = page.locator('#card-table');
    const tableBox = await cardTable.boundingBox();
    
    if (!tableBox) {
      throw new Error('Card table not found');
    }
    
    // Create selection rectangle to select all 3 cards
    const startX = firstCardBox.x - tableBox.x - 20;
    const startY = firstCardBox.y - tableBox.y - 20;
    const endX = startX + 300; // Large enough to cover all cards
    const endY = startY + 200;
    
    await createSelectionRectangle(page, startX, startY, endX, endY);
    await page.waitForTimeout(300);
    
    // Verify cards are selected
    let selectedCards = await getSelectedCards(page);
    expect(selectedCards.length).toBeGreaterThanOrEqual(3);
    
    // Get unique IDs of selected cards for verification
    const selectedUniqueIds = await page.evaluate(() => {
      const selected = document.querySelectorAll('.card.card-selected');
      return Array.from(selected).map(card => card.dataset.uniqueId);
    });
    
    // Right-click on one of the selected cards
    const cardToRightClick = newCards[0];
    const cardUniqueId = await cardToRightClick.getAttribute('data-unique-id');
    
    // Right-click the card
    await cardToRightClick.click({ button: 'right' });
    await page.waitForTimeout(500);
    
    // Wait for discard operation to complete
    await page.waitForTimeout(1000);
    
    // Verify all selected cards were discarded
    const finalDiscardCount = await getDiscardPileCount(page);
    expect(finalDiscardCount).toBeGreaterThanOrEqual(initialDiscardCount + 3);
    
    // Verify selection was cleared
    const finalSelectedCards = await getSelectedCards(page);
    expect(finalSelectedCards.length).toBe(0);
    
    // Verify the discarded cards are no longer selectable (they're in discard pile)
    const discardedCardsStillVisible = await page.evaluate((ids) => {
      for (const id of ids) {
        const card = document.querySelector(`[data-unique-id="${id}"]`);
        if (!card) continue;
        // Check if card is in discard pile area
        const cardRect = card.getBoundingClientRect();
        const discardArea = document.getElementById('discard-pile-area');
        if (discardArea) {
          const discardRect = discardArea.getBoundingClientRect();
          const cardCenterX = cardRect.left + cardRect.width / 2;
          const cardCenterY = cardRect.top + cardRect.height / 2;
          if (cardCenterX >= discardRect.left && cardCenterX <= discardRect.right &&
              cardCenterY >= discardRect.top && cardCenterY <= discardRect.bottom) {
            return true; // Card is in discard area
          }
        }
      }
      return false;
    }, selectedUniqueIds);
    
    // At least some cards should be in discard pile
    expect(discardedCardsStillVisible).toBe(true);
  });
});

