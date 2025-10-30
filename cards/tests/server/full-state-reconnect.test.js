#!/usr/bin/env node

const WebSocket = require('ws');
const SimpleWebSocketServer = require('../../server/simple-websocket-server.js');

function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

async function openClient(url) {
  const ws = new WebSocket(url);
  await new Promise((resolve, reject) => {
    ws.on('open', resolve);
    ws.on('error', reject);
  });
  return ws;
}

async function send(ws, msg) {
  ws.send(JSON.stringify(msg));
}

async function nextMessage(ws, predicate, timeoutMs = 2000) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), timeoutMs);
    const handler = (data) => {
      try {
        const m = JSON.parse(data.toString());
        if (!predicate || predicate(m)) {
          clearTimeout(t);
          ws.off('message', handler);
          resolve(m);
        }
      } catch {}
    };
    ws.on('message', handler);
  });
}

async function run() {
  const port = 8092;
  const roomCode = 'RECON1';
  const server = new SimpleWebSocketServer(port);
  server.start();

  const url = `ws://localhost:${port}/chat/${roomCode}`;
  const p1 = await openClient(url);
  const p2 = await openClient(url);

  // join both
  await send(p1, { type: 'joinRoom', roomCode, playerId: 'p1', playerAlias: 'alpha' });
  await send(p2, { type: 'joinRoom', roomCode, playerId: 'p2', playerAlias: 'beta' });
  // roomJoined for each
  await nextMessage(p1, m => m.type === 'roomJoined');
  await nextMessage(p2, m => m.type === 'roomJoined');

  // Simulate many cards: some on board (table), some privateTo, and some discarded
  const mkCard = (id, owner = null, location = 'table') => ({
    uniqueId: id,
    card: { title: id, emoji: '🧪', description: 't', instanceId: id+'_i', uniqueId: id },
    position: { x: 200, y: 200 },
    location,
    privateTo: owner,
    isFlipped: false,
    zIndex: 1000,
    timestamp: Date.now()
  });

  const updates = [
    mkCard('c_table_1'),
    mkCard('c_table_2'),
    mkCard('c_priv_p1_1', 'p1', 'table'),
    mkCard('c_priv_p2_1', 'p2', 'table'),
    mkCard('c_disc_1', null, 'discardPile'),
    mkCard('c_disc_2', null, 'discardPile')
  ];

  // Send as wrapped gameMessage like the client does
  await send(p1, { type: 'gameMessage', roomCode, playerId: 'p1', data: { type: 'cardState', data: updates }});
  await wait(200);

  // Request full state from p2
  await send(p2, { type: 'requestFullState', roomCode, playerId: 'p2' });
  const full1 = await nextMessage(p2, m => m.type === 'fullState');

  if (!Array.isArray(full1.gameState.discardPile) || full1.gameState.discardPile.length < 2) {
    console.error('❌ Expected discardPile to contain 2 cards initially, got:', full1.gameState.discardPile);
    process.exit(2);
  }

  // Disconnect both and reconnect
  p1.close();
  p2.close();
  await wait(200);

  const p1b = await openClient(url);
  const p2b = await openClient(url);
  await send(p1b, { type: 'joinRoom', roomCode, playerId: 'p1', playerAlias: 'alpha' });
  await send(p2b, { type: 'joinRoom', roomCode, playerId: 'p2', playerAlias: 'beta' });
  const j1 = await nextMessage(p1b, m => m.type === 'roomJoined');
  const j2 = await nextMessage(p2b, m => m.type === 'roomJoined');

  // Verify roomJoined gameState has discard pile
  const dp1 = j1.gameState.discardPile || [];
  const dp2 = j2.gameState.discardPile || [];
  const okJoined = dp1.length >= 2 && dp2.length >= 2;
  if (!okJoined) {
    console.error('❌ roomJoined missing discard pile: ', dp1, dp2);
    process.exit(3);
  }

  // Request full state again
  await send(p1b, { type: 'requestFullState', roomCode, playerId: 'p1' });
  await send(p2b, { type: 'requestFullState', roomCode, playerId: 'p2' });
  const f1 = await nextMessage(p1b, m => m.type === 'fullState');
  const f2 = await nextMessage(p2b, m => m.type === 'fullState');

  const sameDP = JSON.stringify(f1.gameState.discardPile) === JSON.stringify(f2.gameState.discardPile);
  if (!sameDP || f1.gameState.discardPile.length < 2) {
    console.error('❌ fullState discard pile mismatch or empty', f1.gameState.discardPile, f2.gameState.discardPile);
    process.exit(4);
  }

  console.log('✅ Reconnect full-state retains discard pile and matches across clients');
  p1b.close();
  p2b.close();
  server.server.close();
  process.exit(0);
}

if (require.main === module) {
  run().catch((e) => { console.error(e); process.exit(1); });
}



