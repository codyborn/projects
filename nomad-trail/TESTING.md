# Testing

- `npm test` — vitest unit tests for the pure simulation (grid/weights, events, save round-trip, graph reachability, arcade level solvability).
- `npm run sim` — headless balance run: 200 seeded random-policy runs, prints win/fail and cause histogram. Target 35 to 45% first-run failure, failures mostly day 200 to 300; smart policy > 70% wins.
- `npm run build && npm run preview` then `node e2e/smoke.mjs` — drives the real built game in headless Chrome at phone size through a full run using the debug API `window.__nomad` (exposed by src/debug.ts), reloads to verify save/resume, opens every mini-game and cinematic, screenshots to `e2e/shots/`, fails on any page error.
- Manual phone checklist (STATUS.md).
