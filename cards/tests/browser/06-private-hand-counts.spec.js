/**
 * Test: Private Hand Count Synchronization
 * Verifies that both players see correct card counts for all players' private hands
 */

const { test, expect } = require('@playwright/test');
const {
  waitForGameInit,
  dealCard,
  createRoom,
  joinRoom,
  waitForWebSocketConnection,
  getConnectionStatus,
  getPrivateHandCount,
} = require('./helpers');

test.describe('Private Hand Count Synchronization', () => {
  test('Test: Both Players See Correct Private Hand Counts', async ({ browser }) => {
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
      
      // Set player names
      await hostPage.locator('#player-name-input').fill('HostPlayer');
      await playerPage.locator('#player-name-input').fill('OtherPlayer');
      
      // Host: Create room
      const roomCode = await createRoom(hostPage);
      expect(roomCode).toBeTruthy();
      
      // Player: Join room
      await joinRoom(playerPage, roomCode);
      
      // Wait for connections (status should be "Connecting" until roomJoined)
      await waitForWebSocketConnection(hostPage);
      await waitForWebSocketConnection(playerPage);
      
      // Verify status shows "Connected" (not just "Connecting")
      const hostStatus = await getConnectionStatus(hostPage);
      const playerStatus = await getConnectionStatus(playerPage);
      
      expect(hostStatus.toLowerCase()).toContain('connected');
      expect(playerStatus.toLowerCase()).toContain('connected');
      
      // Wait for player list to sync
      await hostPage.waitForTimeout(2000);
      await playerPage.waitForTimeout(2000);
      
      // Host: Deal 3 cards (they go to private hand by default)
      await dealCard(hostPage);
      await dealCard(hostPage);
      await dealCard(hostPage);
      
      // Wait for cards to sync
      await hostPage.waitForTimeout(2000);
      await playerPage.waitForTimeout(2000);
      
      // Check host's view: should see "You: 3"
      const hostYourHandCount = await getPrivateHandCount(hostPage, 'You');
      expect(hostYourHandCount).toBe(3);
      
      // Check host's view: should see "OtherPlayer: 0" in other players list
      const hostOtherPlayerCount = await getPrivateHandCount(hostPage, 'OtherPlayer');
      expect(hostOtherPlayerCount).toBe(0);
      
      // Check player's view: should see "You: 0" (they haven't dealt any cards)
      const playerYourHandCount = await getPrivateHandCount(playerPage, 'You');
      expect(playerYourHandCount).toBe(0);
      
      // Check player's view: should see "HostPlayer: 3" in other players list
      const playerHostPlayerCount = await getPrivateHandCount(playerPage, 'HostPlayer');
      expect(playerHostPlayerCount).toBe(3);
      
      // Player: Deal 2 cards
      await dealCard(playerPage);
      await dealCard(playerPage);
      
      // Wait for sync
      await hostPage.waitForTimeout(2000);
      await playerPage.waitForTimeout(2000);
      
      // Host should now see: "You: 3, OtherPlayer: 2"
      const hostOtherPlayerCountAfter = await getPrivateHandCount(hostPage, 'OtherPlayer');
      expect(hostOtherPlayerCountAfter).toBe(2);
      
      const hostYourHandCountAfter = await getPrivateHandCount(hostPage, 'You');
      expect(hostYourHandCountAfter).toBe(3);
      
      // Player should see: "You: 2, HostPlayer: 3"
      const playerYourHandCountAfter = await getPrivateHandCount(playerPage, 'You');
      expect(playerYourHandCountAfter).toBe(2);
      
      const playerHostPlayerCountAfter = await getPrivateHandCount(playerPage, 'HostPlayer');
      expect(playerHostPlayerCountAfter).toBe(3);
      
    } finally {
      await hostContext.close();
      await playerContext.close();
    }
  });
});

