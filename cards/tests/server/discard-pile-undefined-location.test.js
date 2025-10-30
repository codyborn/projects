#!/usr/bin/env node

const WebSocket = require('ws');
const SimpleWebSocketServer = require('../../server/simple-websocket-server.js');

async function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
  const port = 8092;
  const server = new SimpleWebSocketServer(port);
  server.start();
  await wait(150);

  const roomCode = 'UNDEF1';
  const playerId = 'p_fix';

  const ws = new WebSocket(`ws://localhost:${port}/chat/${roomCode}`);
  await new Promise((resolve, reject) => {
    ws.on('open', resolve);
    ws.on('error', reject);
  });

  // Join room
  ws.send(JSON.stringify({ type: 'joinRoom', roomCode, playerId, playerAlias: 'tester' }));
  await wait(50);

  const uniqueId = 'card_fix_1';

  // 1) Send discard placement
  ws.send(JSON.stringify({
    type: 'updateCardState',
    roomCode,
    playerId,
    cardStates: [{
      uniqueId,
      card: { title: 'Fix Card', emoji: '🛠️', description: 'Test', instanceId: 'inst_fix_1', uniqueId },
      position: { x: 700, y: 400 },
      location: 'discardPile',
      isFlipped: false,
      zIndex: 1001,
      timestamp: Date.now()
    }]
  }));
  await wait(50);

  // 2) Send a follow-up update WITHOUT a location (should NOT remove from discard pile)
  ws.send(JSON.stringify({
    type: 'updateCardState',
    roomCode,
    playerId,
    cardStates: [{
      uniqueId,
      card: { title: 'Fix Card', emoji: '🛠️', description: 'Test2', instanceId: 'inst_fix_1', uniqueId },
      // no location field
      isFlipped: true,
      timestamp: Date.now()
    }]
  }));
  await wait(50);

  // Request full state
  let fullState = null;
  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'fullState') fullState = msg.gameState;
    } catch {}
  });
  ws.send(JSON.stringify({ type: 'requestFullState', roomCode, playerId }));

  for (let i = 0; i < 40; i++) {
    if (fullState) break;
    await wait(25);
  }

  if (!fullState) {
    console.error('❌ Did not receive fullState');
    process.exit(1);
  }

  const inDiscard = Array.isArray(fullState.discardPile) && fullState.discardPile.includes(uniqueId);
  if (!inDiscard) {
    console.error('❌ Card dropped from discard pile after undefined-location update. discardPile =', fullState.discardPile);
    process.exit(2);
  }

  console.log('✅ Card remains in discard pile after undefined-location update');
  ws.close();
  server.server.close();
  process.exit(0);
}

if (require.main === module) {
  run().catch((e) => { console.error(e); process.exit(1); });
}


