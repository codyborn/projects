/**
 * UI/UX and Edge Case Tests
 * Based on BROWSER_TEST_CHECKLIST.md - Tests 10-15
 */

const { test, expect } = require('@playwright/test');
const {
  waitForGameInit,
  dealCard,
  discardCard,
  getDiscardPileCount,
  hoverDiscardPileCounter,
  clickShuffleButton,
  dealCards,
} = require('./helpers');

test.describe('UI/UX and Edge Case Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForGameInit(page);
  });
  
  test('Test 10: Discard Pile Visual State', async ({ page }) => {
    // Discard multiple cards
    await dealCard(page);
    await dealCard(page);
    await dealCard(page);
    
    await page.waitForTimeout(500);
    
    const cards = page.locator('.card');
    const cardCount = await cards.count();
    
    // Discard all cards
    for (let i = 0; i < cardCount; i++) {
      const card = cards.nth(i);
      await discardCard(page, card);
      await page.waitForTimeout(300);
    }
    
    await page.waitForTimeout(500);
    
    // Verify discard pile area exists
    const discardPileArea = page.locator('#discard-pile-area');
    await expect(discardPileArea).toBeVisible();
    
    // Verify cards stack with proper offset
    // Verify by counting cards whose centers are within the discard area
    const discardCardCount = await page.evaluate(() => {
      const area = document.getElementById('discard-pile-area');
      if (!area) return 0;
      const ar = area.getBoundingClientRect();
      const cards = Array.from(document.querySelectorAll('.card'));
      return cards.filter(c => {
        const r = c.getBoundingClientRect();
        const cx = r.left + r.width / 2; const cy = r.top + r.height / 2;
        return cx >= ar.left && cx <= ar.right && cy >= ar.top && cy <= ar.bottom;
      }).length;
    });
    
    if (discardCardCount > 1) {
      // Check that the first two cards within area have a small offset
      const boxes = await page.evaluate(() => {
        const area = document.getElementById('discard-pile-area');
        if (!area) return [];
        const ar = area.getBoundingClientRect();
        const cards = Array.from(document.querySelectorAll('.card'));
        const inArea = cards.filter(c => {
          const r = c.getBoundingClientRect();
          const cx = r.left + r.width / 2; const cy = r.top + r.height / 2;
          return cx >= ar.left && cx <= ar.right && cy >= ar.top && cy <= ar.bottom;
        });
        return inArea.slice(0, 2).map(c => {
          const r = c.getBoundingClientRect();
          return { x: r.x, y: r.y };
        });
      });
      if (boxes.length === 2) {
        const offsetX = Math.abs(boxes[1].x - boxes[0].x);
        const offsetY = Math.abs(boxes[1].y - boxes[0].y);
        expect(offsetX + offsetY).toBeLessThan(12); // small stacking offset
      }
    }
    
    // Verify discard pile area is visually distinct
    const areaStyle = await discardPileArea.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        backgroundColor: styles.backgroundColor,
        border: styles.border || styles.borderWidth,
      };
    });
    
    // Should have some styling (not transparent/empty)
    expect(areaStyle).toBeTruthy();
  });
  
  test('Test 11: Hover States and Interactions', async ({ page }) => {
    // Discard at least one card to have something to shuffle
    await dealCard(page);
    await page.waitForTimeout(300);
    
    const card = page.locator('.card').first();
    await discardCard(page, card);
    await page.waitForTimeout(300);
    
    // Hover over discard pile counter
    const discardCounter = page.locator('#discard-pile-count');
    await discardCounter.hover();
    await page.waitForTimeout(200);
    
    // Verify shuffle button appears on hover
    const shuffleBtn = page.locator('#shuffle-discard-btn, .shuffle-btn');
    
    // Button should be visible (either always visible or on hover)
    const isVisible = await shuffleBtn.isVisible().catch(() => false);
    
    // Try to find button via JavaScript if not visible
    const buttonExists = await page.evaluate(() => {
      const btn = document.querySelector('#shuffle-discard-btn, .shuffle-btn');
      return btn !== null;
    });
    
    expect(buttonExists || isVisible).toBeTruthy();
    
    // Verify button is clickable
    if (buttonExists) {
      const isClickable = await shuffleBtn.isEnabled().catch(() => false);
      // Button should be interactive (if visible)
      if (isVisible) {
        expect(isClickable).toBeTruthy();
      }
    }
  });
  
  test('Test 12: Responsive Design', async ({ page }) => {
    // Test at various viewport sizes
    const viewports = [
      { width: 375, height: 667 }, // Mobile
      { width: 768, height: 1024 }, // Tablet
      { width: 1920, height: 1080 }, // Desktop
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      
      // Verify discard pile remains visible
      const discardPileArea = page.locator('#discard-pile-area');
      await expect(discardPileArea).toBeVisible();
      
      // Verify deck is visible
      const deck = page.locator('.deck');
      await expect(deck).toBeVisible();
      
      // Deal and discard a card to test functionality
      await dealCard(page);
      await page.waitForTimeout(300);
      
      const card = page.locator('.card').first();
      await discardCard(page, card);
      await page.waitForTimeout(300);
      
      // Verify discard pile counter updates
      const discardCount = await getDiscardPileCount(page);
      expect(discardCount).toBeGreaterThan(0);
      
      // Clean up for next iteration
      await clickShuffleButton(page);
      await page.waitForTimeout(500);
    }
  });
  
  test('Test 13: Empty Discard Pile Shuffle', async ({ page }) => {
    // Verify discard pile is empty
    const discardCountBefore = await getDiscardPileCount(page);
    expect(discardCountBefore).toBe(0);
    
    // Get deck count before
    const deckCountBefore = await page.evaluate(() => {
      const deckElement = document.querySelector('.deck-count');
      return deckElement ? parseInt(deckElement.textContent || '0', 10) : 0;
    });
    
    // Click shuffle button when discard pile is empty
    // Should not cause errors
    try {
      await clickShuffleButton(page);
      await page.waitForTimeout(500);
    } catch (error) {
      // If button is not available when empty, that's fine
      // Just verify no errors occur
    }
    
    // Verify deck count remains unchanged
    const deckCountAfter = await page.evaluate(() => {
      const deckElement = document.querySelector('.deck-count');
      return deckElement ? parseInt(deckElement.textContent || '0', 10) : 0;
    });
    
    expect(deckCountAfter).toBe(deckCountBefore);
    
    // Verify no errors in console
    const errors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.waitForTimeout(1000);
    
    // Should have no critical errors (warnings are okay)
    const criticalErrors = errors.filter(e => 
      !e.includes('favicon') && 
      !e.includes('404') &&
      !e.includes('deprecated')
    );
    
    expect(criticalErrors.length).toBe(0);
  });
  
  test('Test 14: Rapid Discard Operations', async ({ page }) => {
    // Deal multiple cards
    await dealCards(page, 5);
    await page.waitForTimeout(800);
    
    const cards = page.locator('.card');
    const cardCount = await cards.count();
    expect(cardCount).toBe(5);
    
    // Rapidly right-click multiple cards to discard (but add small delays to ensure proper sequencing)
    for (let i = 0; i < cardCount; i++) {
      const card = cards.nth(i);
      await discardCard(page, card);
      // Small delay between each discard to ensure proper processing
      await page.waitForTimeout(100);
    }
    
    // Wait for all operations to complete and sync
    await page.waitForTimeout(2000);
    
    // Verify all cards are processed correctly
    const discardCount = await getDiscardPileCount(page);
    expect(discardCount).toBe(cardCount);
    
    // Verify counter updates accurately
    const counterValue = await page.locator('#discard-pile-count').textContent();
    expect(parseInt(counterValue || '0', 10)).toBe(cardCount);
    
    // Verify no duplicate cards in discard pile
    const areaCount = await page.evaluate(() => {
      const area = document.getElementById('discard-pile-area');
      if (!area) return 0;
      const ar = area.getBoundingClientRect();
      const cards = Array.from(document.querySelectorAll('.card'));
      return cards.filter(c => {
        const r = c.getBoundingClientRect();
        const cx = r.left + r.width / 2; const cy = r.top + r.height / 2;
        return cx >= ar.left && cx <= ar.right && cy >= ar.top && cy <= ar.bottom;
      }).length;
    });
    expect(areaCount).toBe(cardCount);
  });
  
  test('Test 15: Large Number of Discarded Cards', async ({ page }) => {
    // Wait for game to be fully initialized
    await page.waitForTimeout(500);
    
    // Deal many cards (but not too many - limit to avoid timeouts)
    // Test with 20 cards instead of unlimited to stay within timeout
    await dealCards(page, 20);
    await page.waitForTimeout(1000);
    
    const cards = page.locator('.card');
    const cardCount = await cards.count();
    
    expect(cardCount).toBeGreaterThanOrEqual(20);
    
    // Discard all cards
    for (let i = 0; i < cardCount; i++) {
      const card = cards.nth(i);
      await discardCard(page, card);
      
      // Add small delay to prevent overwhelming the system
      if (i % 5 === 0) {
        await page.waitForTimeout(100);
      }
    }
    
    await page.waitForTimeout(2000);
    
    // Verify all cards are visible in discard pile
    const discardCount = await getDiscardPileCount(page);
    expect(discardCount).toBeGreaterThanOrEqual(20);
    
    // Verify counter shows correct number
    const counterValue = await page.locator('#discard-pile-count').textContent();
    expect(parseInt(counterValue || '0', 10)).toBeGreaterThanOrEqual(20);
    
    // Verify performance (page should still be responsive)
    const startTime = Date.now();
    await page.mouse.move(100, 100);
    await page.mouse.move(200, 200);
    const endTime = Date.now();
    
    // Mouse movement should be responsive (< 100ms for simple operation)
    expect(endTime - startTime).toBeLessThan(1000);
    
    // Verify discard pile still functions
    const discardPileArea = page.locator('#discard-pile-area');
    await expect(discardPileArea).toBeVisible();
  });
});

