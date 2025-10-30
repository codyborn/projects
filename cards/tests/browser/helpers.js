/**
 * Browser Test Helpers
 * Reusable functions for Playwright browser tests
 */

/**
 * Wait for game to initialize
 */
async function waitForGameInit(page) {
  // Wait for the deck element to appear (indicates game is initialized)
  await page.waitForSelector('.deck, #deck', { timeout: 10000 });
  // Wait a bit more for all initialization to complete
  await page.waitForTimeout(500);
}

/**
 * Deal a card from the deck
 */
async function dealCard(page) {
  // Use JS click to avoid stability issues
  await page.evaluate(() => {
    const deckElement = document.querySelector('.deck, #deck');
    if (deckElement) {
      deckElement.click();
    }
  });
  await page.waitForTimeout(300);
}

/**
 * Deal multiple cards
 */
async function dealCards(page, count) {
  for (let i = 0; i < count; i++) {
    await dealCard(page);
    await page.waitForTimeout(200);
  }
}

/**
 * Discard a card (right-click)
 */
async function discardCard(page, cardLocator) {
  // Use JS to dispatch a contextmenu event directly to avoid click interception
  const uniqueId = await cardLocator.getAttribute('data-unique-id');
  await page.evaluate((id) => {
    const el = document.querySelector(`[data-unique-id="${id}"]`);
    if (el) {
      const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true, button: 2 });
      el.dispatchEvent(event);
    }
  }, uniqueId);
  await page.waitForTimeout(300);
}

/**
 * Get discard pile count from the counter
 */
async function getDiscardPileCount(page) {
  const counter = page.locator('#discard-pile-count');
  if (await counter.count() === 0) {
    return 0;
  }
  const text = await counter.textContent();
  return parseInt(text || '0', 10);
}

/**
 * Get deck count
 */
async function getDeckCount(page) {
  const deckCount = page.locator('.deck-count');
  if (await deckCount.count() === 0) {
    // Try alternative selector
    const countText = await page.evaluate(() => {
      const deckEl = document.querySelector('.deck, #deck');
      if (deckEl) {
        const countEl = deckEl.querySelector('.deck-count');
        return countEl ? countEl.textContent : null;
      }
      return null;
    });
    return parseInt(countText || '0', 10);
  }
  const text = await deckCount.textContent();
  return parseInt(text || '0', 10);
}

/**
 * Get all cards count on the page
 */
async function getAllCardsCount(page) {
  const cards = page.locator('.card');
  return await cards.count();
}

/**
 * Get count of cards in discard pile (by DOM location)
 */
async function getCardsInDiscardPile(page) {
  const discardPileArea = page.locator('#discard-pile-area');
  if (await discardPileArea.count() === 0) {
    return 0;
  }
  
  const areaRect = await discardPileArea.boundingBox();
  if (!areaRect) {
    return 0;
  }
  
  // Count cards that are positioned within the discard pile area
  const allCards = page.locator('.card');
  const cardCount = await allCards.count();
  let count = 0;
  
  for (let i = 0; i < cardCount; i++) {
    const card = allCards.nth(i);
    const cardRect = await card.boundingBox();
    if (cardRect) {
      const cardCenterX = cardRect.x + cardRect.width / 2;
      const cardCenterY = cardRect.y + cardRect.height / 2;
      
      if (cardCenterX >= areaRect.x && 
          cardCenterX <= areaRect.x + areaRect.width &&
          cardCenterY >= areaRect.y && 
          cardCenterY <= areaRect.y + areaRect.height) {
        count++;
      }
    }
  }
  
  return count;
}

/**
 * Check if a card is face down (flipped)
 */
async function isCardFlipped(page, cardLocator) {
  const hasFlippedClass = await cardLocator.evaluate((el) => {
    return el.classList.contains('flipped');
  });
  return hasFlippedClass;
}

/**
 * Hover over discard pile counter (to show shuffle button)
 */
async function hoverDiscardPileCounter(page) {
  const counter = page.locator('#discard-pile-count');
  await counter.hover();
  await page.waitForTimeout(200);
}

/**
 * Click shuffle button
 */
async function clickShuffleButton(page) {
  // First hover over the discard pile counter to show the button
  await hoverDiscardPileCounter(page);
  
  // Try to find and click the shuffle button
  const shuffleBtn = page.locator('#shuffle-discard-btn, .shuffle-btn');
  if (await shuffleBtn.count() > 0) {
    await shuffleBtn.click();
  } else {
    // Try to find and click via JavaScript
    await page.evaluate(() => {
      const btn = document.querySelector('#shuffle-discard-btn, .shuffle-btn');
      if (btn) btn.click();
    });
  }
  await page.waitForTimeout(300);
}

/**
 * Create a multiplayer room
 */
async function createRoom(page) {
  // Use JavaScript to click the button directly (avoids viewport issues)
  await page.evaluate(() => {
    const btn = document.querySelector('#create-room-btn');
    if (btn) {
      btn.scrollIntoView({ behavior: 'instant', block: 'center' });
      btn.click();
    }
  });
  
  // Wait for room code to appear
  await page.waitForTimeout(2000);
  
  // Extract room code from URL or page
  const roomCode = await page.evaluate(() => {
    // Try to get from URL
    const url = window.location.href;
    const match = url.match(/room[\/=]([A-Z0-9]+)/i);
    if (match) return match[1];
    
    // Try to get from page element
    const roomCodeEl = document.querySelector('#room-code, .room-code, #room-code-display');
    if (roomCodeEl) {
      const text = roomCodeEl.textContent?.trim();
      if (text) return text;
    }
    
    // Try to get from input field
    const roomInput = document.querySelector('#room-code-input');
    if (roomInput && roomInput.value) return roomInput.value;
    
    // Try to get from data attribute or any element with room code
    const roomElements = document.querySelectorAll('[data-room-code], .room-code-value');
    for (const el of roomElements) {
      const code = el.textContent?.trim() || el.getAttribute('data-room-code');
      if (code) return code;
    }
    
    return null;
  });
  
  return roomCode;
}

/**
 * Join a multiplayer room
 */
async function joinRoom(page, roomCode) {
  // Fill in room code input using JavaScript (more reliable)
  await page.evaluate((code) => {
    const input = document.querySelector('#room-code-input');
    if (input) {
      input.value = code;
      // Trigger input event to ensure handlers fire
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }, roomCode);
  
  // Wait a bit for input to be set
  await page.waitForTimeout(300);
  
  // Click join button using JavaScript (avoids viewport issues)
  await page.evaluate(() => {
    const btn = document.querySelector('#join-room-btn');
    if (btn) {
      btn.scrollIntoView({ behavior: 'instant', block: 'center' });
      btn.click();
    }
  });
  
  await page.waitForTimeout(1500);
}

/**
 * Get console messages (helper for capturing logs)
 */
async function getConsoleMessages(page) {
  const messages = [];
  page.on('console', (msg) => {
    messages.push(msg.text());
  });
  return messages;
}

/**
 * Wait for a specific console log message
 */
async function waitForConsoleLog(page, expectedMessage, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      page.removeAllListeners('console');
      reject(new Error(`Timeout waiting for console log: ${expectedMessage}`));
    }, timeout);
    
    const handler = (msg) => {
      if (msg.text().includes(expectedMessage)) {
        clearTimeout(timeoutId);
        page.removeListener('console', handler);
        resolve();
      }
    };
    
    page.on('console', handler);
  });
}

/**
 * Get connection status text
 */
async function getConnectionStatus(page) {
  const statusText = page.locator('.status-text');
  if (await statusText.count() === 0) {
    return 'unknown';
  }
  return await statusText.textContent();
}

/**
 * Get player count
 */
async function getPlayerCount(page) {
  // Method 1: Try the #player-count element
  const playerCountElement = page.locator('#player-count');
  if (await playerCountElement.count() > 0) {
    const text = await playerCountElement.textContent();
    const count = parseInt(text || '0', 10);
    if (!isNaN(count) && count > 0) {
      return count;
    }
  }
  
  // Method 2: Count players in the private hand area
  // This is more reliable as it counts actual UI elements
  const otherPlayers = page.locator('#other-players-counts .player-count-item');
  const otherPlayersCount = await otherPlayers.count();
  
  // The "You" player is always there (count it)
  const youPlayer = page.locator('.player-count-item:has-text("You")');
  const hasYou = await youPlayer.count() > 0;
  
  // Total = other players + "You" (if present)  
  let total = otherPlayersCount;
  if (hasYou) {
    total += 1;
  } else {
    // If "You" is not in other-players-counts, it's in the main section
    // So we still count it
    total += 1;
  }
  
  return total;
}

/**
 * Wait for WebSocket connection
 */
async function waitForWebSocketConnection(page, timeout = 15000) {
  // Wait for connection status to show "Connected" or "Connecting..." (at least trying to connect)
  try {
    await page.waitForFunction(
      () => {
        const statusText = document.querySelector('.status-text');
        if (!statusText) return false;
        const text = statusText.textContent?.toLowerCase() || '';
        // Accept "Connected" or "Connecting..." as we know it's trying
        return text.includes('connected') || text.includes('connecting');
      },
      { timeout }
    );
    
    // Wait a bit more to ensure it's fully connected (not just "Connecting...")
    await page.waitForFunction(
      () => {
        const statusText = document.querySelector('.status-text');
        if (!statusText) return false;
        const text = statusText.textContent?.toLowerCase() || '';
        return text.includes('connected') && !text.includes('connecting');
      },
      { timeout: 10000 }
    );
  } catch (error) {
    // If it times out, let's check what the actual status is
    const actualStatus = await page.evaluate(() => {
      const statusText = document.querySelector('.status-text');
      return statusText ? statusText.textContent : 'not found';
    });
    throw new Error(`Connection timeout. Actual status: "${actualStatus}". Expected: "Connected"`);
  }
}

/**
 * Get private hand count for a specific player
 */
async function getPrivateHandCount(page, playerName = null) {
  // If playerName is null or "You", get the current player's count
  if (!playerName || playerName === 'You') {
    const yourHandCount = page.locator('#your-hand-count');
    if (await yourHandCount.count() > 0) {
      const text = await yourHandCount.textContent();
      return parseInt(text || '0', 10);
    }
    return 0;
  }
  
  // Otherwise, find the count in the other players list
  const otherPlayers = page.locator('#other-players-counts .player-count-item');
  const count = await otherPlayers.count();
  
  for (let i = 0; i < count; i++) {
    const playerItem = otherPlayers.nth(i);
    const text = await playerItem.textContent();
    if (text && text.includes(playerName)) {
      // Extract the number from the text
      const match = text.match(/(\d+)/);
      if (match) {
        return parseInt(match[1], 10);
      }
    }
  }
  
  return 0;
}

module.exports = {
  waitForGameInit,
  dealCard,
  dealCards,
  discardCard,
  getDiscardPileCount,
  getDeckCount,
  getAllCardsCount,
  getCardsInDiscardPile,
  isCardFlipped,
  hoverDiscardPileCounter,
  clickShuffleButton,
  createRoom,
  joinRoom,
  getConsoleMessages,
  waitForConsoleLog,
  getConnectionStatus,
  getPlayerCount,
  waitForWebSocketConnection,
  getPrivateHandCount,
};
