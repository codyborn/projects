#!/usr/bin/env node

const WebSocket = require('ws');

async function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
  const roomCode = 'REMOT1';
  const playerId = 'remote_tester_1';

  // Prefer explicit env, fallback to known hosts
  const explicitHost = process.env.WS_HOST; // e.g. cards-websocket-server.herokuapp.com
  const candidateHosts = [
    explicitHost,
    'cards-websocket-server.herokuapp.com',
    'cards-websocket-server-02b8944e7896.herokuapp.com'
  ].filter(Boolean);

  let ws = null;
  let connectedHost = null;
  let lastErr = null;

  for (const host of candidateHosts) {
    const url = `wss://${host}/chat/${roomCode}`;
    try {
      ws = new WebSocket(url);
      await new Promise((resolve, reject) => {
        const to = setTimeout(() => reject(new Error('timeout')), 8000);
        ws.on('open', () => { clearTimeout(to); resolve(); });
        ws.on('error', (e) => { clearTimeout(to); reject(e); });
      });
      connectedHost = host;
      break;
    } catch (e) {
      lastErr = e;
    }
  }

  if (!ws || !connectedHost) {
    console.error('❌ Could not connect to remote server via candidates:', candidateHosts, 'lastErr =', lastErr && lastErr.message);
    process.exit(1);
  }

  console.log('🌐 Connected to host:', connectedHost);

  // Join room
  ws.send(JSON.stringify({ type: 'joinRoom', roomCode, playerId, playerAlias: 'remote_tester' }));
  await wait(200);

  // Send a cardState with location='discardPile'
  const uniqueId = 'card_remote_test_1';
  const cardState = [{
    uniqueId,
    card: { title: 'Remote Test Card', emoji: '🧪', description: 'Remote Test', instanceId: 'rinst1', uniqueId },
    position: { x: 800, y: 400 },
    location: 'discardPile',
    isFlipped: false,
    zIndex: 1001,
    timestamp: Date.now()
  }];

  ws.send(JSON.stringify({ type: 'updateCardState', roomCode, playerId, cardStates: cardState }));
  await wait(200);

  // Request full state and capture response
  let fullState = null;
  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'fullState') {
        fullState = msg.gameState;
      }
    } catch {}
  });
  ws.send(JSON.stringify({ type: 'requestFullState', roomCode, playerId }));

  for (let i = 0; i < 40; i++) {
    if (fullState) break;
    await wait(100);
  }

  if (!fullState) {
    console.error('❌ Did not receive fullState from remote server');
    process.exit(2);
  }

  const hasDiscard = Array.isArray(fullState.discardPile) && fullState.discardPile.includes(uniqueId);
  if (!hasDiscard) {
    console.error('❌ Discard pile missing expected uniqueId from remote. discardPile =', fullState.discardPile);
    process.exit(3);
  }

  console.log('✅ Remote discard pile includes the card in fullState');
  ws.close();
  process.exit(0);
}

if (require.main === module) {
  run().catch((e) => { console.error(e); process.exit(1); });
}



