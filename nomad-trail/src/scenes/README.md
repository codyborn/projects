# Scenes (SCENES agent)

All scenes read the run from `this.registry.get('run')` (RunState) and write it back through `putRun(scene, state)` in `src/ui/simBridge.ts`, which also calls `Sim.save`. Settings live in registry `'settings'` (`getSettings`/`putSettings`). Scenes never import `../core/sim` directly; they use `Sim` and `Data` from `src/ui/simBridge.ts`.

| Key | Class | Starts with | Goes to |
|---|---|---|---|
| `Boot` | BootScene | — | Title (after calling `window.__nomadArt?.generate?.(scene)`) |
| `Title` | TitleScene | — | Pack (new run) · resumes by `run.phase`: pack→Pack, city→City, ended→End, else Route |
| `Pack` | PackScene | run in registry (phase pack) | Route (after `Sim.setPack` ok) |
| `Route` | RouteScene | run | Travel `{ leg }`, City (stay), Passport `{ back:'Route' }` |
| `Travel` | TravelScene | `{ leg: Leg }` | launches `Event` per returned event id, then City `{ arrived: true }` or End |
| `City` | CityScene | `{ arrived?: boolean }` | overlays: `Event`, `Coffee` `{ city, day, onDone }`, mini-game scenes by key (`MinigameLaunch`); Route on move on; End on ending |
| `Event` | EventScene | `{ eventId, onDone }` (launched as overlay) | calls `onDone()`; caller stops it |
| `End` | EndScene | run with `ending` | Share `{ back:'End' }`, Passport `{ back:'End' }`, Title |

Overlay protocol: CityScene calls `scene.launch(key, data)`, `bringToTop(key)`, `scene.pause()`. The overlay must call `data.onDone(...)` once; CityScene then stops the overlay (if still alive) and resumes itself. Mini-games get a `MinigameLaunch` and must call `onDone(MinigameResult)`.

Optional hooks the ART agent can provide on `window.__nomadArt`: `generate(scene)` (Boot), `titleArt(scene)` (Title backdrop), `globe(scene, cx, cy, R, run)` (Route; replaces the built-in globe), `skyline(scene, cityId, x, y, w, h)` (City vista). If a bitmap font `pix` exists in the cache, `txt()` uses it.

Registry events emitted: none beyond `registry.set('run'|'settings')`.

Notes for the integrator:
- `PackedItem` gets an extra `rot?: boolean` from PackScene (rotated footprint). Sim should treat `rot` as swapping w/h when validating geometry, or ignore it.
- Item categories in the tray are derived from tags (`catOf` in PackScene); `real:false` items appear under EXTRAS.
- `src/core/sim/engine.ts` and `save.ts` were STUBS when written (marked `// STUB`) and `src/data/*.json` had placeholder rows; the SIM agent's files replace them.
- RouteScene's "wait a week" button calls `Sim.cityAction(run,'rest')` seven times when no legs are in season.
