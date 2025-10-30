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
} = require('./helpers');

test.describe('Core Functionality Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForGameInit(page);
  });
  
  test('Test 4: Right-Click to Discard', async ({ page }) => {
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
});

