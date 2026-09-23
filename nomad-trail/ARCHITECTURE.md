# Architecture & file ownership

Phaser 3 + TS + Vite. Internal 360x640 portrait, Scale.FIT, pixelArt. Everything codes against `src/core/types.ts` and `src/core/palette.ts` (READ ONLY for agents; ask the integrator to change them).

## Modules and owners
- `src/core/sim/` — **SIM agent**: pure TypeScript, no Phaser. `engine.ts` (createRun, pack, chooseNextCity, travel, cityAction, applyMinigameResult, tickDay, ending/score), `events.ts` (event selection/rolling), `save.ts` (load/save/clear, settings). Exports a single `Sim` object (see `src/core/sim/index.ts`). Also `src/data/*.json` and `sim/run.ts` (`npm run sim`).
- `src/scenes/` — **SCENES agent**: `BootScene` (asset gen + font), `TitleScene`, `PackScene` (Tetris bags), `RouteScene` (globe + next-city choice), `TravelScene` (leg animation + event cards), `CityScene` (day loop, actions, HUD), `EventScene` (modal cards with choices), `EndScene` (ending + share). `src/ui/` (HUD, buttons, text helpers).
- `src/minigames/` — **MINIGAMES agent**: `CookingScene`, `WorkoutScene`, `CarryOnScene` (per-city platformer), `KiteScene`, `AirportScene`, `LaundryScene`. Self-contained; contract = `MinigameLaunch`/`MinigameResult`.
- `src/art/` + `src/audio/` + `src/scenes/CoffeeScene.ts` + `src/scenes/PassportScene.ts` + `src/share/` — **ART agent**: procedural pixel art (`pixel.ts` texture helpers, `sprites.ts` nomad/suitcase/items, `skyline.ts` per-city parallax scenes, `globe.ts`), `synth.ts` WebAudio chiptune, coffee cinematic, passport, share-card PNG.
- `src/main.ts`, `src/game.ts` (scene registry, registry keys) — integrator.

## Cross-module rules
- Scenes reach the sim only via `import { Sim } from '../core/sim'` and read state from `this.registry.get('run') as RunState`; after mutating through Sim, call `this.registry.set('run', state)` and `Sim.save(state)`.
- Art helpers are pure functions `(scene: Phaser.Scene, ...) => textureKey | GameObject`. Agents may stub art with colored rects if `src/art` is not ready; the integrator swaps.
- Fonts: BootScene registers a bitmap pixel font under key `pix` (ART agent provides `src/art/font.ts` that builds it procedurally). Until then use `Phaser.GameObjects.Text` with fontFamily monospace.
- No network. No external assets. Data via `import x from '../data/x.json'`.
