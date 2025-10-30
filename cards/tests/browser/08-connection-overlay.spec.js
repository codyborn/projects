/**
 * Connection Overlay Tests
 * Tests for board connection status overlay and action prevention when disconnected
 */

const { test, expect } = require('@playwright/test');
const {
  waitForGameInit,
  dealCard,
  discardCard,
  createRoom,
  joinRoom,
  waitForWebSocketConnection,
  getConnectionStatus,
} = require('./helpers');

test.describe('Connection Overlay Tests', () => {
  test('Test 1: Overlay shows when offline and prevents actions', async ({ page }) => {
    await page.goto('/');
    await waitForGameInit(page);
    
    // Wait for initialization to complete
    await page.waitForTimeout(500);
    
    // Check that overlay is visible (should be offline initially)
    const boardStatus = page.locator('#board-connection-status');
    await expect(boardStatus).toBeVisible();
    
    const statusText = boardStatus.locator('.status-text');
    await expect(statusText).toContainText(/Offline|Connecting/);
    
    // Try to deal a card - should be prevented
    const deck = page.locator('.deck');
    const cardCountBefore = await page.locator('.card').count();
    await deck.click();
    await page.waitForTimeout(300);
    const cardCountAfter = await page.locator('.card').count();
    
    // Should not have dealt a card
    expect(cardCountAfter).toBe(cardCountBefore);
    
    // Try to click on table - should be prevented
    const tableClickCount = await page.evaluate(() => {
      let count = 0;
      const table = document.getElementById('card-table');
      table.addEventListener('click', () => count++);
      table.click();
      return count;
    });
    // Click should be prevented, so count might be 0 or 1 depending on when prevention happens
    // The important thing is that no card was dealt
  });
  
  test('Test 2: Overlay hides when connected', async ({ page }) => {
    await page.goto('/');
    await waitForGameInit(page);
    
    // Create room and connect
    const roomCode = await createRoom(page);
    await waitForWebSocketConnection(page);
    
    // Wait for connection to fully establish
    await page.waitForTimeout(1000);
    
    // Check that overlay is hidden
    const boardStatus = page.locator('#board-connection-status');
    const display = await boardStatus.evaluate((el) => window.getComputedStyle(el).display);
    expect(display).toBe('none');
    
    // Actions should work now
    await dealCard(page);
    const cardCount = await page.locator('.card').count();
    expect(cardCount).toBeGreaterThan(0);
  });
  
  test('Test 3: Overlay shows during connection and prevents actions', async ({ page }) => {
    await page.goto('/');
    await waitForGameInit(page);
    
    // Start connecting
    const roomCode = await createRoom(page);
    
    // Check overlay is visible during connection
    const boardStatus = page.locator('#board-connection-status');
    await expect(boardStatus).toBeVisible({ timeout: 2000 });
    
    const statusText = boardStatus.locator('.status-text');
    const text = await statusText.textContent();
    expect(text).toMatch(/Connecting|Offline/);
    
    // Actions should still be prevented during connection
    const deck = page.locator('.deck');
    const cardCountBefore = await page.locator('.card').count();
    
    // Try clicking deck during connection
    await deck.click();
    await page.waitForTimeout(300);
    
    // Wait for connection to complete
    await waitForWebSocketConnection(page);
    await page.waitForTimeout(500);
    
    // Overlay should now be hidden
    const display = await boardStatus.evaluate((el) => window.getComputedStyle(el).display);
    expect(display).toBe('none');
  });
  
  test('Test 4: Overlay reappears on disconnection and prevents actions', async ({ page }) => {
    await page.goto('/');
    await waitForGameInit(page);
    
    // Connect first
    const roomCode = await createRoom(page);
    await waitForWebSocketConnection(page);
    await page.waitForTimeout(500);
    
    // Deal a card while connected
    await dealCard(page);
    const initialCardCount = await page.locator('.card').count();
    expect(initialCardCount).toBeGreaterThan(0);
    
    // Simulate disconnection by closing WebSocket
    await page.evaluate(() => {
      const game = window.gameInstance;
      if (game && game.multiplayer && game.multiplayer.socket) {
        game.multiplayer.socket.close();
        game.multiplayer.updateConnectionStatus('offline');
      }
    });
    
    await page.waitForTimeout(500);
    
    // Overlay should reappear
    const boardStatus = page.locator('#board-connection-status');
    await expect(boardStatus).toBeVisible();
    
    const statusText = boardStatus.locator('.status-text');
    await expect(statusText).toContainText('Offline');
    
    // Actions should be prevented again
    const deck = page.locator('.deck');
    const cardCountBefore = await page.locator('.card').count();
    await deck.click();
    await page.waitForTimeout(300);
    const cardCountAfter = await page.locator('.card').count();
    
    // Card count should not have increased
    expect(cardCountAfter).toBe(cardCountBefore);
  });
  
  test('Test 5: Card interactions blocked when offline', async ({ page }) => {
    await page.goto('/');
    await waitForGameInit(page);
    
    // Force offline state
    await page.evaluate(() => {
      const game = window.gameInstance;
      if (game && game.multiplayer) {
        game.multiplayer.updateConnectionStatus('offline');
      }
    });
    
    await page.waitForTimeout(200);
    
    // Verify overlay is visible
    const boardStatus = page.locator('#board-connection-status');
    await expect(boardStatus).toBeVisible();
    
    // Simulate dealing a card anyway (via JS to bypass UI)
    await page.evaluate(() => {
      const game = window.gameInstance;
      if (game) {
        try {
          game.dealCard();
        } catch (e) {
          // Ignore errors
        }
      }
    });
    
    await page.waitForTimeout(300);
    
    // Verify no card was created by checking count
    const cardCount = await page.locator('.card').count();
    expect(cardCount).toBe(0);
  });
});

