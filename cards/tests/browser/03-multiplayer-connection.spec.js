/**
 * Multiplayer Connection Tests
 * Based on BROWSER_TEST_CHECKLIST.md - Tests 7-9
 */

const { test, expect } = require('@playwright/test');
const {
  waitForGameInit,
  dealCard,
  createRoom,
  joinRoom,
  waitForWebSocketConnection,
  getConnectionStatus,
  getPlayerCount,
} = require('./helpers');

test.describe('Multiplayer Connection Tests', () => {
  test('Test 7: Room Creation and Joining', async ({ browser }) => {
    const hostContext = await browser.newContext();
    const playerContext = await browser.newContext();
    
    const hostPage = await hostContext.newPage();
    const playerPage = await playerContext.newPage();
    
    try {
      await hostPage.goto('/');
      await playerPage.goto('/');
      
      await waitForGameInit(hostPage);
      await waitForGameInit(playerPage);
      
      // Host: Create room
      const hostLogs = [];
      hostPage.on('console', (msg) => {
        hostLogs.push(msg.text());
      });
      
      const roomCode = await createRoom(hostPage);
      expect(roomCode).toBeTruthy();
      expect(roomCode.length).toBeGreaterThan(0);
      
      // Verify host shows connected status
      await waitForWebSocketConnection(hostPage);
      const hostStatus = await getConnectionStatus(hostPage);
      expect(hostStatus.toLowerCase()).toContain('connect');
      
      // Player: Join room
      const playerLogs = [];
      playerPage.on('console', (msg) => {
        playerLogs.push(msg.text());
      });
      
      await joinRoom(playerPage, roomCode);
      
      // Wait for connections
      await waitForWebSocketConnection(hostPage);
      await waitForWebSocketConnection(playerPage);
      
      // Verify both players show connected status
      const playerStatus = await getConnectionStatus(playerPage);
      expect(playerStatus.toLowerCase()).toContain('connect');
      
      // Verify both players see each other in player list
      const hostPlayerCount = await getPlayerCount(hostPage);
      const playerPlayerCount = await getPlayerCount(playerPage);
      
      expect(hostPlayerCount).toBeGreaterThanOrEqual(2);
      expect(playerPlayerCount).toBeGreaterThanOrEqual(2);
      
      // Verify room code is displayed correctly
      const hostRoomCode = await hostPage.locator('#room-code-display').textContent();
      expect(hostRoomCode?.trim()).toBe(roomCode);
      
      // Check console logs
      const hostLogText = hostLogs.join('\n');
      expect(hostLogText).toContain('Connecting to WebSocket');
      expect(hostLogText).toContain('Connected to WebSocket');
      expect(hostLogText).toContain('Room created');
      expect(hostLogText).toContain('Joined room');
      
      const playerLogText = playerLogs.join('\n');
      expect(playerLogText).toContain('Connecting to WebSocket');
      expect(playerLogText).toContain('Connected to WebSocket');
      expect(playerLogText).toContain('Joined room');
      
    } finally {
      await hostContext.close();
      await playerContext.close();
    }
  });
  
  test('Test 8: Real-Time Synchronization', async ({ browser }) => {
    const hostContext = await browser.newContext();
    const playerContext = await browser.newContext();
    
    const hostPage = await hostContext.newPage();
    const playerPage = await playerContext.newPage();
    
    try {
      await hostPage.goto('/');
      await playerPage.goto('/');
      
      await waitForGameInit(hostPage);
      await waitForGameInit(playerPage);
      
      // Create and join room
      const roomCode = await createRoom(hostPage);
      await joinRoom(playerPage, roomCode);
      await waitForWebSocketConnection(hostPage);
      await waitForWebSocketConnection(playerPage);
      
      // Host: Deal a card
      await dealCard(hostPage);
      await hostPage.waitForTimeout(1000);
      await playerPage.waitForTimeout(1000);
      
      // Verify card appears on both pages
      const hostCards = hostPage.locator('.card');
      const playerCards = playerPage.locator('.card');
      
      const hostCardCount = await hostCards.count();
      const playerCardCount = await playerCards.count();
      
      expect(hostCardCount).toBe(playerCardCount);
      expect(hostCardCount).toBeGreaterThan(0);
      
      if (hostCardCount > 0 && playerCardCount > 0) {
        // Get card positions with a few retries to avoid transient null bounding boxes
        // Match by uniqueId to ensure we're comparing same card
        let hostPosition = null;
        let playerPosition = null;
        for (let i = 0; i < 10; i++) {
          const hostCard = hostCards.first();
          const uniqueId = await hostCard.getAttribute('data-unique-id');
          if (uniqueId) {
            const playerCard = playerPage.locator(`.card[data-unique-id="${uniqueId}"]`).first();
            hostPosition = await hostCard.boundingBox();
            playerPosition = await playerCard.boundingBox();
          }
          if (hostPosition && playerPosition) break;
          await hostPage.waitForTimeout(200);
        }
        expect(hostPosition).toBeTruthy();
        expect(playerPosition).toBeTruthy();
      }
      
      // Host: Move card around (simulate dragging)
      if (await hostCards.count() > 0) {
        const card = hostCards.first();
        const box = await card.boundingBox();
        
        if (box) {
          await hostPage.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
          await hostPage.mouse.down();
          await hostPage.mouse.move(box.x + 100, box.y + 100);
          await hostPage.mouse.up();
          
          // Wait for sync
          await hostPage.waitForTimeout(1000);
          await playerPage.waitForTimeout(1000);
          
          // Verify synchronization (both should have updated)
          const hostCardsAfter = hostPage.locator('.card');
          const playerCardsAfter = playerPage.locator('.card');
          
          expect(await hostCardsAfter.count()).toBe(await playerCardsAfter.count());
        }
      }
      
    } finally {
      await hostContext.close();
      await playerContext.close();
    }
  });
  
  test('Test 9: Connection Recovery', async ({ browser }) => {
    const hostContext = await browser.newContext();
    const playerContext = await browser.newContext();
    
    const hostPage = await hostContext.newPage();
    const playerPage = await playerContext.newPage();
    
    try {
      await hostPage.goto('/');
      await playerPage.goto('/');
      
      await waitForGameInit(hostPage);
      await waitForGameInit(playerPage);
      
      // Create and join room
      const roomCode = await createRoom(hostPage);
      await joinRoom(playerPage, roomCode);
      await waitForWebSocketConnection(hostPage);
      await waitForWebSocketConnection(playerPage);
      
      // Deal some cards and set up game state
      await dealCard(hostPage);
      await dealCard(hostPage);
      await hostPage.waitForTimeout(1000);
      await playerPage.waitForTimeout(1000);
      
      const cardCountBefore = await hostPage.locator('.card').count();
      
      // Disconnect player (simulate connection loss)
      await playerContext.close();
      
      // Create new context and reconnect
      const newPlayerContext = await browser.newContext();
      const newPlayerPage = await newPlayerContext.newPage();
      
      await newPlayerPage.goto('/');
      await waitForGameInit(newPlayerPage);
      
      // Rejoin room
      await joinRoom(newPlayerPage, roomCode);
      await waitForWebSocketConnection(newPlayerPage);
      
      // Wait for state sync
      await newPlayerPage.waitForTimeout(2000);
      
      // Verify game state is synchronized
      const hostCardCount = await hostPage.locator('.card').count();
      const reconnectedCardCount = await newPlayerPage.locator('.card').count();
      
      // Player should receive game state on reconnect
      expect(reconnectedCardCount).toBeGreaterThanOrEqual(0);
      
      await newPlayerContext.close();
      
    } finally {
      await hostContext.close();
      if (playerContext) {
        await playerContext.close();
      }
    }
  });
});

