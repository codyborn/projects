# Browser Test Suite

This directory contains automated browser tests for the card game, implemented using Playwright. The tests are based on the `BROWSER_TEST_CHECKLIST.md` and cover critical multiplayer functionality, core features, connection management, and UI/UX scenarios.

## Setup

### Prerequisites

1. Node.js (>= 14.0.0)
2. Python 3 (for local HTTP server)

### Installation

```bash
# Install Playwright and browsers
npm install
npx playwright install
```

## Running Tests

### Run all tests
```bash
npm run test:browser
```

### Run tests in headed mode (see browser)
```bash
npm run test:browser:headed
```

### Run tests with UI mode (interactive)
```bash
npm run test:browser:ui
```

### Run specific test file
```bash
npx playwright test tests/browser/01-critical-multiplayer.spec.js
```

### Run tests in a specific browser
```bash
npx playwright test --project=chromium
```

## Test Structure

### Test Files

- **`01-critical-multiplayer.spec.js`** - Critical multiplayer tests (Tests 1-3)
  - Multiplayer discard visibility
  - Multiplayer shuffle synchronization
  - Private hand discard visibility

- **`02-core-functionality.spec.js`** - Core functionality tests (Tests 4-6)
  - Right-click to discard
  - Shuffle discard pile
  - Card counting accuracy

- **`03-multiplayer-connection.spec.js`** - Connection tests (Tests 7-9)
  - Room creation and joining
  - Real-time synchronization
  - Connection recovery

- **`04-ui-edge-cases.spec.js`** - UI/UX and edge cases (Tests 10-15)
  - Discard pile visual state
  - Hover states and interactions
  - Responsive design
  - Empty discard pile shuffle
  - Rapid discard operations
  - Large number of discarded cards

### Helper Utilities

`helpers.js` provides reusable functions for common test operations:
- `waitForGameInit()` - Wait for game to initialize
- `dealCard()` / `dealCards()` - Deal cards from deck
- `discardCard()` - Right-click a card to discard
- `getDiscardPileCount()` - Get discard pile counter value
- `getDeckCount()` - Get deck count
- `clickShuffleButton()` - Click shuffle button
- `createRoom()` / `joinRoom()` - Multiplayer room management
- And more...

## Test Environment

The tests automatically start:
- HTTP server on port 3000 (serving the game files)
- WebSocket server on port 8080 (multiplayer server)

These servers are started automatically by Playwright before tests run.

**Note:** The WebSocket client may be configured to connect to a remote server. For local testing, you may need to modify `src/client/websocket-multiplayer.js` to use `localhost:8080` when running tests, or set up environment variables to control the WebSocket URL.

## Configuration

Test configuration is in `playwright.config.js` at the project root. Key settings:
- Test timeout: 30 seconds
- Expect timeout: 5 seconds
- Parallel execution: Enabled (disabled on CI)
- Retries: 2 on CI, 0 locally
- Screenshots: On failure only
- Videos: On failure only

## Writing New Tests

1. Create a new test file or add to an existing one
2. Import test helpers from `helpers.js`
3. Use Playwright's page object model
4. Follow the pattern in existing tests

Example:
```javascript
const { test, expect } = require('@playwright/test');
const { waitForGameInit, dealCard } = require('./helpers');

test('My new test', async ({ page }) => {
  await page.goto('/');
  await waitForGameInit(page);
  
  await dealCard(page);
  // ... test assertions
});
```

## Debugging

### View HTML Report
After running tests, open `playwright-report/index.html` to see detailed test results, screenshots, and videos.

### Debug Mode
Run tests with debug mode:
```bash
npx playwright test --debug
```

### Console Logs
Tests automatically capture and can verify console logs. Use:
```javascript
page.on('console', (msg) => {
  console.log(msg.text());
});
```

## Known Issues

1. **Discard Pile HTML**: The discard pile HTML elements may need to be added to `index.html` if they don't exist. The code references `#discard-pile-area`, `#discard-pile-content`, and `#discard-pile-count` which should be present in the DOM.

2. **WebSocket Server**: Ensure the WebSocket server is properly configured and running. The tests expect it on port 3001.

3. **Timing**: Some tests may need timing adjustments based on network conditions. Adjust `waitForTimeout` values if tests are flaky.

## CI/CD Integration

The tests are configured to run in CI environments:
- Automatic retries on failure
- Single worker mode on CI (via `process.env.CI`)
- Trace collection for failed tests
- HTML report generation

## Coverage

These tests cover:
- ✅ Critical multiplayer discard functionality
- ✅ Shuffle synchronization across players
- ✅ Private hand visibility
- ✅ Right-click discard operations
- ✅ Discard pile management
- ✅ Card counting accuracy
- ✅ Room creation and joining
- ✅ Real-time synchronization
- ✅ Connection recovery
- ✅ UI/UX interactions
- ✅ Edge cases and stress tests

For manual testing procedures, see `BROWSER_TEST_CHECKLIST.md`.

