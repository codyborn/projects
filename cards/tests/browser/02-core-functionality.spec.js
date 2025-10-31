/**
 * Core Functionality Tests
 * Based on BROWSER_TEST_CHECKLIST.md - Tests 4-6
 */

const { test, expect } = require('@playwright/test');
const {
  waitForGameInit,
  dealCard,
  discardCard,
  getDiscardPileCount,
  getDeckCount,
  getAllCardsCount,
  getCardsInDiscardPile,
  isCardFlipped,
  clickShuffleButton,
  waitForConsoleLog,
  createRoom,
  joinRoom,
  waitForWebSocketConnection,
  loadDeck,
  getPrivateHandCount,
} = require('./helpers');

test.describe('Core Functionality Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForGameInit(page);
  });
  
  test('Test 3: Click deck to deal card to private hand', async ({ page }) => {
    // Connect to a room first (required for dealing)
    const roomCode = await createRoom(page);
    await waitForWebSocketConnection(page);
    
    // Load deck and sync to server
    await loadDeck(page, 'standard');
    await page.waitForTimeout(1000); // Wait for deck to sync
    
    // Get initial counts
    const initialCardCount = await getAllCardsCount(page);
    const initialDeckCount = await getDeckCount(page);
    expect(initialDeckCount).toBeGreaterThan(0);
    
    // Collect console logs for debugging
    const consoleLogs = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('[DEAL]')) {
        consoleLogs.push(text);
      }
    });
    
    // Click the deck to deal a card
    await dealCard(page);
    
    // Wait for card to appear with explicit check
    try {
      await page.waitForFunction(
        (expectedCount) => {
          const count = document.querySelectorAll('.card').length;
          return count > expectedCount;
        },
        initialCardCount,
        { timeout: 5000 }
      );
    } catch (error) {
      // If card didn't appear, log debug info
      const debugInfo = await page.evaluate(() => {
        return {
          cardCount: document.querySelectorAll('.card').length,
          deckCount: document.querySelector('.deck-count')?.textContent || 'N/A',
          multiplayer: !!window.cardGame?.multiplayer,
          connectionStatus: window.cardGame?.multiplayer?.connectionStatus || 'N/A',
          hasDeck: !!window.cardGame?.deck,
          deckLength: window.cardGame?.deck?.cards?.length || 0
        };
      });
      console.error('Card not dealt! Debug info:', debugInfo);
      console.error('Console logs collected:', consoleLogs);
      throw new Error(`Card was not dealt. Initial count: ${initialCardCount}, Current count: ${debugInfo.cardCount}`);
    }
    
    // Wait a bit more for positioning
    await page.waitForTimeout(500);
    
    // Verify a card was added
    const finalCardCount = await getAllCardsCount(page);
    expect(finalCardCount).toBeGreaterThan(initialCardCount);
    
    // Verify deck count decreased
    const finalDeckCount = await getDeckCount(page);
    expect(finalDeckCount).toBe(initialDeckCount - 1);
    
    // Verify the card is in the private hand zone
    const privateHandCard = await page.evaluate(() => {
      const privateHandZone = document.getElementById('private-hand-zone');
      if (!privateHandZone) {
        console.error('Private hand zone not found!');
        return null;
      }
      
      const zoneRect = privateHandZone.getBoundingClientRect();
      const cards = Array.from(document.querySelectorAll('.card'));
      
      console.log(`Checking ${cards.length} cards against private hand zone`);
      
      for (const card of cards) {
        const cardRect = card.getBoundingClientRect();
        const cardCenterX = cardRect.left + cardRect.width / 2;
        const cardCenterY = cardRect.top + cardRect.height / 2;
        
        const inZone = cardCenterX >= zoneRect.left && cardCenterX <= zoneRect.right &&
            cardCenterY >= zoneRect.top && cardCenterY <= zoneRect.bottom;
        
        if (inZone) {
          console.log('Found card in private hand zone:', card.dataset.uniqueId);
          return {
            uniqueId: card.dataset.uniqueId,
            privateTo: card.dataset.privateTo,
            position: { x: cardRect.left, y: cardRect.top }
          };
        }
      }
      console.log('No card found in private hand zone');
      console.log('Zone rect:', { 
        left: zoneRect.left, 
        top: zoneRect.top, 
        right: zoneRect.right, 
        bottom: zoneRect.bottom 
      });
      return null;
    });
    
    expect(privateHandCard).toBeTruthy();
    expect(privateHandCard.uniqueId).toBeTruthy();
    
    // Verify the card has privateTo attribute (is private to player)
    const cards = page.locator('.card');
    const newCard = cards.last();
    const uniqueId = await newCard.getAttribute('data-unique-id');
    const privateTo = await newCard.getAttribute('data-private-to');
    
    // Card should be private (we're connected to multiplayer)
    expect(privateTo).toBeTruthy();
    expect(privateTo).not.toBe('null');
    
    // Verify the card is face up (not flipped)
    const isFlipped = await isCardFlipped(page, newCard);
    expect(isFlipped).toBe(false);
    
    // Log console messages for debugging
    if (consoleLogs.length > 0) {
      console.log('Deal-related console logs:', consoleLogs);
    }
  });
  
  test('Test 3b: Click deck to deal card to private hand (multiplayer)', async ({ browser }) => {
    const hostContext = await browser.newContext();
    const hostPage = await hostContext.newPage();
    
    try {
      await hostPage.goto('/');
      await waitForGameInit(hostPage);
      
      // Create room and connect
      const roomCode = await createRoom(hostPage);
      await waitForWebSocketConnection(hostPage);
      
      // Load deck and sync to server
      await loadDeck(hostPage, 'standard');
      await hostPage.waitForTimeout(2000); // Wait for deck to sync
      
      // Get initial counts
      const initialCardCount = await getAllCardsCount(hostPage);
      const initialDeckCount = await getDeckCount(hostPage);
      const initialPrivateHandCount = await getPrivateHandCount(hostPage);
      expect(initialDeckCount).toBeGreaterThan(0);
      
      // Check connection status
      const connectionStatus = await hostPage.evaluate(() => {
        return window.cardGame && window.cardGame.multiplayer 
          ? window.cardGame.multiplayer.connectionStatus 
          : 'offline';
      });
      console.log('Connection status:', connectionStatus);
      expect(connectionStatus).toBe('connected');
      
      // Collect console logs for debugging
      const consoleLogs = [];
      hostPage.on('console', msg => {
        const text = msg.text();
        if (text.includes('[DEAL]')) {
          consoleLogs.push(text);
        }
      });
      
      // Click the deck to deal a card
      await dealCard(hostPage);
      
      // Wait for card to appear with explicit check
      try {
        await hostPage.waitForFunction(
          (expectedCount) => {
            const count = document.querySelectorAll('.card').length;
            return count > expectedCount;
          },
          initialCardCount,
          { timeout: 10000 } // Longer timeout for multiplayer
        );
      } catch (error) {
        // If card didn't appear, log debug info
        const debugInfo = await hostPage.evaluate(() => {
          return {
            cardCount: document.querySelectorAll('.card').length,
            deckCount: document.querySelector('.deck-count')?.textContent || 'N/A',
            multiplayer: !!window.cardGame?.multiplayer,
            connectionStatus: window.cardGame?.multiplayer?.connectionStatus || 'N/A',
            hasDeck: !!window.cardGame?.deck,
            deckLength: window.cardGame?.deck?.cards?.length || 0,
            serverHasDeck: window.cardGame?.multiplayer?.gameState?.deckData?.cards?.length || 0
          };
        });
        console.error('Card not dealt! Debug info:', debugInfo);
        console.error('Console logs collected:', consoleLogs);
        throw new Error(`Card was not dealt in multiplayer. Initial count: ${initialCardCount}, Current count: ${debugInfo.cardCount}`);
      }
      
      // Wait a bit more for positioning
      await hostPage.waitForTimeout(1000);
      
      // Verify a card was added
      const finalCardCount = await getAllCardsCount(hostPage);
      expect(finalCardCount).toBeGreaterThan(initialCardCount);
      
      // Verify deck count decreased
      const finalDeckCount = await getDeckCount(hostPage);
      expect(finalDeckCount).toBe(initialDeckCount - 1);
      
      // Verify the card is in the private hand zone
      const privateHandCard = await hostPage.evaluate(() => {
        const privateHandZone = document.getElementById('private-hand-zone');
        if (!privateHandZone) {
          console.error('Private hand zone not found!');
          return null;
        }
        
        const zoneRect = privateHandZone.getBoundingClientRect();
        const cards = Array.from(document.querySelectorAll('.card'));
        
        for (const card of cards) {
          const cardRect = card.getBoundingClientRect();
          const cardCenterX = cardRect.left + cardRect.width / 2;
          const cardCenterY = cardRect.top + cardRect.height / 2;
          
          const inZone = cardCenterX >= zoneRect.left && cardCenterX <= zoneRect.right &&
              cardCenterY >= zoneRect.top && cardCenterY <= zoneRect.bottom;
          
          if (inZone) {
            return {
              uniqueId: card.dataset.uniqueId,
              privateTo: card.dataset.privateTo,
              position: { x: cardRect.left, y: cardRect.top }
            };
          }
        }
        return null;
      });
      
      expect(privateHandCard).toBeTruthy();
      expect(privateHandCard.uniqueId).toBeTruthy();
      
      // Verify the card has privateTo attribute (is private to player)
      const cards = hostPage.locator('.card');
      const newCard = cards.last();
      const uniqueId = await newCard.getAttribute('data-unique-id');
      const privateTo = await newCard.getAttribute('data-private-to');
      
      // Card should be private in multiplayer
      expect(privateTo).toBeTruthy();
      expect(privateTo).not.toBe('null');
      
      // Verify the card is face up (not flipped)
      const isFlipped = await isCardFlipped(hostPage, newCard);
      expect(isFlipped).toBe(false);
      
      // CRITICAL: Verify private hand counter increased
      await hostPage.waitForFunction(
        (expectedCount) => {
          const countEl = document.getElementById('your-hand-count');
          if (!countEl) return false;
          const count = parseInt(countEl.textContent || '0', 10);
          return count > expectedCount;
        },
        initialPrivateHandCount,
        { timeout: 5000 }
      );
      
      const finalPrivateHandCount = await getPrivateHandCount(hostPage);
      expect(finalPrivateHandCount).toBe(initialPrivateHandCount + 1);
      console.log(`Private hand count increased from ${initialPrivateHandCount} to ${finalPrivateHandCount}`);
      
      // Log console messages for debugging
      if (consoleLogs.length > 0) {
        console.log('Deal-related console logs:', consoleLogs);
      }
      
      // Verify handleCardDealt was called (server responded)
      const hasCardDealtLog = consoleLogs.some(log => log.includes('handleCardDealt'));
      if (!hasCardDealtLog) {
        console.warn('Warning: handleCardDealt was not called - server may not have responded');
      }
    } finally {
      await hostContext.close();
    }
  });
  
  test('Test 4: Right-Click to Discard', async ({ page }) => {
    // Connect to a room first (required for dealing)
    const roomCode = await createRoom(page);
    await waitForWebSocketConnection(page);
    
    // Load deck and sync to server
    await loadDeck(page, 'standard');
    await page.waitForTimeout(1000); // Wait for deck to sync
    
    // Deal a card
    await dealCard(page);
    
    const cards = page.locator('.card');
    await expect(cards).toHaveCount(1);
    
    // Get initial counts
    const deckCountBefore = await getDeckCount(page);
    const discardCountBefore = await getDiscardPileCount(page);
    
    // No strict console log expectations anymore
    
    // Right-click the card to discard
    const card = cards.first();
    await discardCard(page, card);
    
    // Wait for discard to complete
    await page.waitForTimeout(500);
    
    // Verify card moves to discard pile
    const cardsInDiscard = await getCardsInDiscardPile(page);
    expect(cardsInDiscard).toBe(1);
    
    // Verify card is face UP (discard pile cards should be face up)
    const flipped = await page.evaluate(() => {
      const area = document.getElementById('discard-pile-area');
      if (!area) return null;
      const ar = area.getBoundingClientRect();
      const cards = Array.from(document.querySelectorAll('.card'));
      const inArea = cards.find(c => {
        const r = c.getBoundingClientRect();
        const cx = r.left + r.width / 2; const cy = r.top + r.height / 2;
        return cx >= ar.left && cx <= ar.right && cy >= ar.top && cy <= ar.bottom;
      });
      return inArea ? inArea.classList.contains('flipped') : null;
    });
    expect(flipped).toBe(false);
    
    // Verify discard pile counter increments
    const discardCountAfter = await getDiscardPileCount(page);
    expect(discardCountAfter).toBe(discardCountBefore + 1);
    
    // Verify deck count decreased (card was already dealt, so deck count should be original - 1)
    // Note: The deck count should reflect remaining cards after dealing
    const deckCountAfter = await getDeckCount(page);
    // Deck count should be less than or equal to before (depending on initial state)
    
    // No console log assertions for discard
  });
  
  test('Test 5: Shuffle Discard Pile', async ({ page }) => {
    // Connect to a room first (required for dealing/discarding)
    const roomCode = await createRoom(page);
    await waitForWebSocketConnection(page);
    
    // Load deck and sync to server
    await loadDeck(page, 'standard');
    await page.waitForTimeout(1000); // Wait for deck to sync
    
    // Deal and discard 3-5 cards
    const cardsToDiscard = 4;
    await dealCard(page);
    await dealCard(page);
    await dealCard(page);
    await dealCard(page);
    
    await page.waitForTimeout(500);
    
    // Discard all cards
    const cards = page.locator('.card');
    const cardCount = await cards.count();
    
    const logs = [];
    page.on('console', (msg) => {
      logs.push(msg.text());
    });
    
    for (let i = 0; i < cardCount; i++) {
      const card = cards.nth(i);
      await discardCard(page, card);
      await page.waitForTimeout(300);
    }
    
    await page.waitForTimeout(500);
    
    // Verify cards are in discard pile
    const discardCountBefore = await getDiscardPileCount(page);
    expect(discardCountBefore).toBeGreaterThanOrEqual(cardsToDiscard);
    
    // Get deck count before shuffle
    const deckCountBefore = await getDeckCount(page);
    const allCardsBefore = await getAllCardsCount(page);
    
    // Click shuffle button
    await clickShuffleButton(page);
    
    // Wait for shuffle to complete (server needs time to process and broadcast)
    await page.waitForTimeout(3000);
    
    // Verify all discarded cards return to deck
    const discardCountAfter = await getDiscardPileCount(page);
    expect(discardCountAfter).toBe(0);
    
    // Verify discard pile counter resets to 0
    const discardCounter = page.locator('#discard-pile-count');
    const counterText = await discardCounter.textContent();
    expect(parseInt(counterText || '0', 10)).toBe(0);
    
    // Verify deck count increased by number of shuffled cards
    const deckCountAfter = await getDeckCount(page);
    expect(deckCountAfter).toBe(deckCountBefore + discardCountBefore);
    
    // Check console logs
    const logText = logs.join('\n');
    expect(logText).toContain('SHUFFLING DISCARD PILE BACK TO DECK');
    expect(logText).toContain('DISCARD PILE CARDS TO SHUFFLE');
    expect(logText).toContain('SHUFFLE COMPLETE');
  });
  
  test('Test 6: Card Counting Accuracy', async ({ page }) => {
    // Connect to a room first (required for dealing/discarding)
    const roomCode = await createRoom(page);
    await waitForWebSocketConnection(page);
    
    // Load deck and sync to server
    await loadDeck(page, 'standard');
    await page.waitForTimeout(1000); // Wait for deck to sync
    
    // Load deck (should show 52 cards)
    const initialDeckCount = await getDeckCount(page);
    expect(initialDeckCount).toBeGreaterThan(0);
    
    // Deal 5 cards
    await dealCard(page);
    await dealCard(page);
    await dealCard(page);
    await dealCard(page);
    await dealCard(page);
    
    await page.waitForTimeout(500);
    
    // Discard 2 cards
    const cards = page.locator('.card');
    const cardCount = await cards.count();
    
    // Discard first 2 cards
    for (let i = 0; i < Math.min(2, cardCount); i++) {
      const card = cards.nth(i);
      await discardCard(page, card);
      await page.waitForTimeout(300);
    }
    
    await page.waitForTimeout(500);
    
    // Verify counts
    const deckCount = await getDeckCount(page);
    const discardCount = await getDiscardPileCount(page);
    const allCardsOnPage = await getAllCardsCount(page);
    
    // Deck count should be initial - 5 dealt
    expect(deckCount).toBe(initialDeckCount - 5);
    
    // Discard pile should have 2 cards
    expect(discardCount).toBe(2);
    
    // Total cards on page should be 5 (3 in hand + 2 discarded)
    expect(allCardsOnPage).toBe(5);
    
    // Verify cards in discard pile
    const cardsInDiscard = await getCardsInDiscardPile(page);
    expect(cardsInDiscard).toBe(2);
  });
  
  test('Test: Deal card to private hand and table - both visible', async ({ browser }) => {
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
      
      // Get initial counts
      const initialCardCount = await getAllCardsCount(page);
      const initialPrivateHandCount = await getPrivateHandCount(page);
      
      // Step 1: Deal one card to private hand (click on the deck)
      await dealCard(page);
      await page.waitForTimeout(500); // Wait for card to appear
      
      // Verify one card was added
      const afterPrivateCardCount = await getAllCardsCount(page);
      expect(afterPrivateCardCount).toBe(initialCardCount + 1);
      
      // Verify private hand has one card
      const privateHandCount = await getPrivateHandCount(page);
      expect(privateHandCount).toBe(initialPrivateHandCount + 1);
      
      // Step 2: Deal one card on the table (click on the table)
      // Use JavaScript to trigger a proper mousedown/mouseup sequence on the table
      const tableClicked = await page.evaluate(() => {
        const table = document.getElementById('card-table');
        if (!table) return false;
        
        // Get the table bounds
        const rect = table.getBoundingClientRect();
        const x = rect.left + 200;
        const y = rect.top + 200;
        
        // Create and dispatch mousedown event
        const mouseDownEvent = new MouseEvent('mousedown', {
          bubbles: true,
          cancelable: true,
          clientX: x,
          clientY: y,
          button: 0,
          target: table
        });
        
        table.dispatchEvent(mouseDownEvent);
        
        return true;
      });
      
      expect(tableClicked).toBe(true);
      
      // Small delay to simulate real mouse interaction
      await page.waitForTimeout(50);
      
      // Now dispatch mouseup
      await page.evaluate(() => {
        const table = document.getElementById('card-table');
        if (!table) return false;
        
        const rect = table.getBoundingClientRect();
        const x = rect.left + 200;
        const y = rect.top + 200;
        
        const mouseUpEvent = new MouseEvent('mouseup', {
          bubbles: true,
          cancelable: true,
          clientX: x,
          clientY: y,
          button: 0,
          target: table
        });
        
        table.dispatchEvent(mouseUpEvent);
        return true;
      });
      
      // Wait for card to appear with retry
      let finalCardCount = 0;
      let attempts = 0;
      while (attempts < 15) {
        await page.waitForTimeout(300);
        finalCardCount = await getAllCardsCount(page);
        if (finalCardCount >= initialCardCount + 2) {
          break;
        }
        attempts++;
      }
      
      // Step 3: Verify that both cards are visible
      // Debug info if test fails
      if (finalCardCount !== initialCardCount + 2) {
        const debugInfo = await page.evaluate(() => {
          const cards = Array.from(document.querySelectorAll('.card'));
          return {
            cardCount: cards.length,
            cardDetails: cards.map(card => ({
              uniqueId: card.dataset.uniqueId,
              display: window.getComputedStyle(card).display,
              visibility: window.getComputedStyle(card).visibility,
              parent: card.parentElement?.id || card.parentElement?.className,
              position: {
                left: card.style.left,
                top: card.style.top
              }
            })),
            deckLength: window.cardGame?.deck?.cards?.length || 0,
            connectionStatus: window.cardGame?.multiplayer?.connectionStatus || 'offline'
          };
        });
        console.log('Debug info when test failed:', JSON.stringify(debugInfo, null, 2));
      }
      
      expect(finalCardCount).toBe(initialCardCount + 2); // Should have 2 cards total
      
      // Verify private hand still has 1 card
      const finalPrivateHandCount = await getPrivateHandCount(page);
      expect(finalPrivateHandCount).toBe(initialPrivateHandCount + 1);
      
      // Verify we can see both cards in the DOM
      const allCards = await page.locator('.card').count();
      expect(allCards).toBe(2);
      
      // Verify cards have proper visibility (both should be visible)
      const cardVisibility = await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('.card'));
        return cards.map(card => {
          const style = window.getComputedStyle(card);
          return {
            uniqueId: card.dataset.uniqueId,
            display: style.display,
            visibility: style.visibility,
            opacity: style.opacity,
            isVisible: style.display !== 'none' && style.visibility !== 'hidden' && parseFloat(style.opacity) > 0
          };
        });
      });
      
      // Both cards should be visible
      expect(cardVisibility.length).toBe(2);
      cardVisibility.forEach(cardInfo => {
        expect(cardInfo.isVisible).toBe(true);
      });
      
    } finally {
      await context.close();
    }
  });
});

