# Browser Test Suite Setup

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Install Playwright browsers:**
   ```bash
   npx playwright install
   ```

3. **Run tests:**
   ```bash
   npm run test:browser
   ```

## First-Time Setup Checklist

- [ ] Node.js installed (>= 14.0.0)
- [ ] Python 3 installed (for HTTP server)
- [ ] Dependencies installed (`npm install`)
- [ ] Playwright browsers installed (`npx playwright install`)
- [ ] Ports 3000 and 8080 available

## Troubleshooting

### Tests fail to connect to WebSocket

The WebSocket client may be configured to connect to a remote server. For local testing:
1. Check `src/client/websocket-multiplayer.js` line 263
2. Temporarily change the host to `localhost:8080` for testing
3. Or set up an environment variable to control the WebSocket URL

### Tests can't find discard pile elements

The discard pile HTML may not be in `index.html`. Check that these elements exist:
- `#discard-pile-area`
- `#discard-pile-content`  
- `#discard-pile-count`
- `#shuffle-discard-btn` or `.shuffle-btn`

### Port already in use

If ports 3000 or 8080 are in use:
1. Stop any running servers
2. Modify `playwright.config.js` to use different ports
3. Update WebSocket client configuration accordingly

## Running Specific Tests

```bash
# Run only critical multiplayer tests
npx playwright test tests/browser/01-critical-multiplayer.spec.js

# Run with UI mode for debugging
npm run test:browser:ui

# Run in headed mode to see browser
npm run test:browser:headed
```

## Next Steps

See `README.md` for full documentation.

