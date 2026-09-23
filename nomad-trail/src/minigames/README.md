# Mini-games

Six self-contained Phaser scenes. Contract: start with `scene.start(KEY, launch)` where `launch: MinigameLaunch = { energy, difficulty, payload, onDone }`.
Each scene shows a 1s READY card, runs, shows a 1.5s PERFECT / NICE / FAILED card, calls `onDone({ score 0..100, perfect: score>=95, failed: score<50 || forced })` exactly once, then stops itself. Never starts another scene.

Energy < 50 makes every game harder through `MinigameFrame` (`_shared.ts`): tighter timing windows (`frame.window`), input lag up to 140 ms (`frame.lag`), a slow camera wobble, and per-game drains (grip, pace, wind). `difficulty` 0..1 speeds things up.

| Key (MINIGAME_KEYS) | Scene | Payload | Controls | Scoring |
|---|---|---|---|---|
| `Cooking` | CookingScene | `Dish` (steps of chop/stir/flip/season/pour/knead). No payload -> Dal Bhat. | chop: tap when the knife is in the green band. stir: drag circles (RIGHT key). flip: tap at the top of the toss. season: tap exactly N times then wait ~1s. pour: hold, release inside the band (SPACE). knead: tap fast. | mean step accuracy × 100. Plate gains a layer per step. |
| `Workout` | WorkoutScene | `{ activity: ActivityId, city }`. Unknown -> bands. | bands: tap left/middle/right third (or ←↓→ / 1 2 3) as notes hit the line. boulder: tap holds in order (SPACE = next). ferrata: tap when the swinging carabiner is over the anchor. trailrun: tap/↑ to jump rocks, 30 s. hike: hold to walk, keep the pace marker in the green; >1.5 s too fast = dizzy. swim: alternate LEFT/RIGHT taps, stay in lane. | bands hits/20 · boulder 70+30·grip (grip 0 = fail) · ferrata clipped/tries (6 misses = fail) · trailrun 100−18/trip · hike time-in-band+15−15/dizzy · swim 100−12/wrong−drift. |
| `CarryOn` | CarryOnScene | `ArcadeLevel` (tiles `#`, `.`, `S`, `*`, `H`, `^`, `-`; `hazard`; `palette [bg, mid, fg]`; `parTime`). No payload -> `DEFAULT_LEVEL`. | Bezel zones: left third = left, middle = right, right = jump; swipe up anywhere = jump. Keys: ←→/AD, ↑/W/SPACE. Coyote time 0.1 s, jump buffer 0.12 s, release early for a short hop. | Collect all `*`: 100 − 15/heart lost − 1/s over par (min 40). Hearts 0 or 120 s = fail with 40·collected/total. Hazards: otter tuktuk tram crowd yak (ground shuttlers, yak charges), mosquito (homing), pigeon (swooping), rock (falls from `H` columns), gust (wind streak warning then push), wave (rising water line), ice (slippery), snow (low jump). |
| `Kite` | KiteScene | none | Drag in the upper half to steer the kite along the wind window; keep it in the bright zone (pink = gust incoming). Tap the water (or ↑) when the wave under you peaks (TAP cue) to jump; needs speed > 35%. 45 s. | 60·zone-time/45 + min(40, 8/jump) − 4/wipeout. |
| `Airport` | AirportScene | none | Security: tap the bin (or 1/2/3) while the item is in the X-ray window. Gate change: after the board settles, tap your flight's gate tile within ~3 s. Boarding: tap when YOUR group is called. | mean of three stage accuracies × 100. |
| `Laundry` | LaundryScene | none | Swipe/tap left for whites, right for colours (←/→). 20 s. | right/total × 100; any wrong sort tints everything pink and caps the score at 60. |

## Level design for Carry-On
`carryonLevel.ts` holds `DEFAULT_LEVEL`, the physics constants (`PHYS`: jump 310, gravity 900, run 115 px/s) and `validateLevel(level)`, a BFS reachability check using the real jump kinematics (max rise 3 rows; horizontal reach 3 tiles for a 3-row rise, 4 for lower). Levels are 23×20 tiles of 16 px. Keep every rise ≤ 3 rows and gaps ≤ 3 tiles; run `npm test` (vitest, `carryonLevel.test.ts`) to prove a level is completable. The scene also logs `console.warn` for a bad level at runtime.

## Dev harness
`devHarness.ts` exports `MINIGAME_SCENES` and `launchHarness(game)` (adds a `MinigameHarness` picker with sample payloads and an energy toggle; integrator wires it under `?harness=1`). `harness-entry.ts` is a standalone entry used with a `harness.html` page: `?auto=1&fast=1` drives all six games with synthetic input under a virtual clock and writes results to `#results` (used for the smoke test: 19 runs, one `onDone` each, zero page errors).

## Known limitations
- Art is placeholder-procedural (rectangles, generated 16 px textures); the ART agent can swap textures by key (`co_player`, `co_tile`, `co_stamp`, `co_spike`, `co_heart`).
- No audio hooks yet; add SFX calls where `frame.flash`/`frame.shake` are called.
- Carry-On hazard AI is simple (no pathing); the validator ignores mid-air ceilings.
- Cooking `stir` on desktop needs a mouse drag or holding RIGHT.
