/**
 * Discard Pile Shuffle Debug Test
 * Isolates the shuffle issue to understand what's happening
 */

const { test, expect } = require('@playwright/test');
const {
  waitForGameInit,
  dealCard,
  discardCard,
  getDiscardPileCount,
  clickShuffleButton,
  getConnectionStatus,
  waitForWebSocketConnection,
} = require('./helpers');

test.describe('Discard Pile Shuffle Debug', () => {
  test('Debug: Shuffle Discard Pile - Check Connection and Logs', async ({ page }) => {
    await page.goto('/');
    await waitForGameInit(page);
    
    // Setup console logging
    const logs = [];
    page.on('console', (msg) => {
      logs.push(msg.text());
      console.log('[BROWSER]', msg.text());
    });
    
    // Deal and discard cards
    await dealCard(page);
    await dealCard(page);
    await dealCard(page);
    await dealCard(page);
    await page.waitForTimeout(500);
    
    const cards = page.locator('.card');
    const cardCount = await cards.count();
    
    for (let i = 0; i < cardCount; i++) {
      const card = cards.nth(i);
      await discardCard(page, card);
      await page.waitForTimeout(300);
    }
    
    await page.waitForTimeout(500);
    
    // Check discard pile count
    const discardCountBefore = await getDiscardPileCount(page);
    console.log('[TEST] Discard pile count before shuffle:', discardCountBefore);
    
    // Check connection status
    const connectionStatus = await getConnectionStatus(page);
    console.log('[TEST] Connection status:', connectionStatus);
    
    // Wait for connection if needed
    if (connectionStatus.toLowerCase().includes('connecting')) {
      await waitForWebSocketConnection(page);
    }
    
    // Click shuffle button
    await clickShuffleButton(page);
    
    // Wait and check logs
    await page.waitForTimeout(4000);
    
    const discardCountAfter = await getDiscardPileCount(page);
    console.log('[TEST] Discard pile count after shuffle:', discardCountAfter);
    
    // Check for key log messages
    const logText = logs.join('\n');
    console.log('[TEST] Log summary:');
    console.log('  - SHUFFLING DISCARD:', logText.includes('SHUFFLING DISCARD'));
    console.log('  - REQUESTING SHUFFLE:', logText.includes('REQUESTING SHUFFLE'));
    console.log('  - SHUFFLE COMPLETE:', logText.includes('SHUFFLE COMPLETE'));
    console.log('  - REMOVING CARD:', logText.includes('REMOVING CARD'));
    console.log('  - [SHUFFLE]:', logText.includes('[SHUFFLE]'));
    
    // Get card count in DOM
    const cardsInDOM = await page.evaluate(() => {
      return document.querySelectorAll('.card').length;
    });
    console.log('[TEST] Cards in DOM after shuffle:', cardsInDOM);
    
    // Get discard pile cards by checking area bounds
    const cardsInDiscardArea = await page.evaluate(() => {
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
    console.log('[TEST] Cards in discard pile area:', cardsInDiscardArea);
    
    // This test is for debugging - don't fail, just report
    console.log('[TEST] Shuffle operation completed. Check logs above for details.');
  });
});


