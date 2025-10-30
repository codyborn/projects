#!/usr/bin/env node

const WebSocket = require('ws');
const SimpleWebSocketServer = require('../../server/simple-websocket-server.js');

async function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
  const port = 8091;
  const server = new SimpleWebSocketServer(port);
  server.start();
  await wait(200);

  const roomCode = 'TESTDP';
  const playerId = 'p1';

  const ws = new WebSocket(`ws://localhost:${port}/chat/${roomCode}`);

  await new Promise((resolve, reject) => {
    ws.on('open', resolve);
    ws.on('error', reject);
  });

  // Join room
  ws.send(JSON.stringify({ type: 'joinRoom', roomCode, playerId, playerAlias: 'tester' }));
  await wait(100);

  // Send a cardState with location='discardPile'
  const uniqueId = 'card_test_1';
  const cardState = [{
    uniqueId,
    card: { title: 'Test Card', emoji: '🧪', description: 'Test', instanceId: 'inst1', uniqueId },
    position: { x: 800, y: 400 },
    location: 'discardPile',
    isFlipped: false,
    zIndex: 1001,
    timestamp: Date.now()
  }];

  ws.send(JSON.stringify({ type: 'updateCardState', roomCode, playerId, cardStates: cardState }));
  await wait(100);

  // Request full state
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

  // Wait for response
  for (let i = 0; i < 20; i++) {
    if (fullState) break;
    await wait(50);
  }

  if (!fullState) {
    console.error('❌ Did not receive fullState');
    process.exit(1);
  }

  const hasDiscard = Array.isArray(fullState.discardPile) && fullState.discardPile.includes(uniqueId);
  if (!hasDiscard) {
    console.error('❌ Discard pile missing expected uniqueId. discardPile =', fullState.discardPile);
    process.exit(2);
  }

  console.log('✅ Discard pile includes the card in fullState');
  ws.close();
  server.server.close();
  process.exit(0);
}

if (require.main === module) {
  run().catch((e) => { console.error(e); process.exit(1); });
}



