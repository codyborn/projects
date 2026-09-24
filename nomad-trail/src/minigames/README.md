# Mini-games

Six self-contained Phaser scenes. Contract: start with `scene.start(KEY, launch)` where `launch: MinigameLaunch = { energy, difficulty, payload, onDone }`.
Each scene shows a 1s READY card, runs, shows a 1.5s PERFECT / NICE / FAILED card, calls `onDone({ score 0..100, perfect: score>=95, failed: score<50 || forced })` exactly once, then stops itself. Never starts another scene.

**Lives (round 3):** outdoor Workout variants (trailrun, hike, ferrata, boulder) start with 1 life + `launch.extraLives` (hiking boots give +1), drawn as pixel hearts under the HUD strip. trailrun: a rock costs a life instead of only score; hike: every third dizzy warning costs a life; boulder: empty grip costs a life and refills to 60%; ferrata: a fall below the last anchor. Losing the last life ends the game as FAILED with a partial score (≤ 45). bands and swim have no lives.

**Play cap (round 2):** `MinigameFrame.capSec` (default 36 s of play, so 1 s intro + play + 1.5 s result stays under 40 s) auto-finishes any game with `frame.scoreNow()`, which every game sets to its live score. Carry-On overrides the cap to 60 s. Games with their own timers are shorter: Laundry 20 s, Trail run 25 s, Hike 30 s, Ferrata 35 s, Kite 35 s, Airport ~29 s.

Energy < 50 makes every game harder through `MinigameFrame` (`_shared.ts`): tighter timing windows (`frame.window`), input lag up to 140 ms (`frame.lag`), a slow camera wobble, and per-game drains (grip, pace, wind). `difficulty` 0..1 speeds things up.

| Key (MINIGAME_KEYS) | Scene | Payload | Controls | Scoring |
|---|---|---|---|---|
| `Cooking` | CookingScene | `Dish` (4 to 5 steps from the 14 kinds below; trimmed to 5), or `{ dish, city?, cityName? }`. Shows "A <city> dish" under the HUD from `cityName` > `city` > `dish.city`. No payload -> Dal Bhat. | chop: tap when the knife is in the green band. stir: drag circles (→). flip: tap at the top of the toss. season: tap exactly N times then wait ~1 s. pour: hold, release inside the band (SPACE). knead: tap fast. **grill**: hold to sear, release inside the drifting golden band; past it = burnt (SPACE). **dice**: a 3x3 board lights N cubes in sequence, then tap them back in order; a wrong cube ends the step. **roll**: swipe left→right N times (→). **simmer**: the needle drifts down, tap to add heat, keep it in the green for the whole step, never in the red boil-over zone. **shake**: alternate swipes/half-taps left, right, left (←/→). **fold**: drag from the left dot through the top dot to the right dot, N times (↓). **plate**: drag each garnish onto its ringed spot (↑ auto-places). **skewer**: pieces slide across; tap as each crosses the skewer zone. | mean step accuracy × 100. **Dish art**: `dishArt.ts` holds a hand-authored pixel spec (vessel + 2 to 5 layers, 96x64 at 1x drawn in 2 px chunks) for every one of the 49 dishes; the vessel shows from step 1, layers appear in proportion to completed steps, and the finished dish is revealed with steam and sparkles before the result card. `drawDish(scene, id, upTo?)` caches textures as `dish_<id>_<n>`; unknown ids get a generic plate + mound. |
| `Workout` | WorkoutScene | `{ activity: ActivityId, city }`. Unknown -> bands. | bands: tap left/middle/right third (or ←↓→ / 1 2 3) as notes hit the line. boulder: tap holds in order (SPACE = next). ferrata (Zeke's Peak style): the marble bounces by itself; hold the LEFT/RIGHT half of the screen (arrows on desktop, device tilt if the browser already delivers it) to steer it up 22 staggered ledges. Thin ledges are 24 px, brown ledges crumble 0.25 s after a landing, green anchor ledges (every 6th) save progress. Falling 200 px below the last anchor costs a life and respawns there. Wind gusts every ~8 s push sideways (visible streaks). Reach the flag above the top ledge. 35 s cap. trailrun: tap/↑ to jump rocks, 25 s, speeds up 1.6x by the end. hike: hold to walk, keep the pace marker in the green; >1.5 s too fast = dizzy; 600 m target or 30 s. swim: alternate LEFT/RIGHT taps, stay in lane. | bands hits/20 · boulder 70+30·grip (grip 0 = fail) · ferrata 100 − 3 per life lost at the summit; otherwise height% × 92 − 3 per life lost (cap) or height% × 60 (out of lives, fail) · trailrun 100−18/trip · hike time-in-band+15−15/dizzy · swim 100−12/wrong−drift. |
| `CarryOn` | CarryOnScene | `ArcadeLevel` (tiles `#`, `.`, `S`, `*`, `H`, `^`, `-`; `hazard`; `palette [bg, mid, fg]`; `parTime`). No payload -> `DEFAULT_LEVEL`. | Bezel zones: left third = left, middle = right, right = jump; swipe up anywhere = jump. Keys: ←→/AD, ↑/W/SPACE. Coyote time 0.1 s, jump buffer 0.12 s, release early for a short hop. | Collect all `*` (levels are trimmed to the 8 stamps nearest S via `trimStamps`): 100 − 15/heart lost − 1/s over par 30 s (min 40). Hearts 0 = fail with 40·collected/total; 60 s cap = 70·collected/total. Hazards ramp from 1.0x to 1.8x speed/frequency over 40 s (`ramp()`); background silhouettes scroll and recycle only once fully off the left edge. Hazards: otter tuktuk tram crowd yak (ground shuttlers, yak charges), mosquito (homing), pigeon (swooping), rock (falls from `H` columns), gust (wind streak warning then push), wave (rising water line), ice (slippery), snow (low jump). |
| `Kite` | KiteScene | none | Drag in the upper half to steer the kite along the wind window; keep it in the bright zone (pink = gust incoming). Tap the water (or ↑) when the wave under you peaks (TAP cue) to jump; needs speed > 35%. 35 s. | 60·zone-time/35 + min(40, 8/jump) − 4/wipeout. |
| `Airport` | AirportScene | none | Security: tap the bin (or 1/2/3) while the item is in the X-ray window. Gate change: after the board settles, tap your flight's gate tile within ~3 s. Boarding: tap when YOUR group is called. | mean of three stage accuracies × 100. |
| `Laundry` | LaundryScene | none | Swipe/tap left for whites, right for colours (←/→). 20 s. Spawns come from a shuffled bag of 6 (exactly 3 whites, 3 colours); whites are pure white with a grey outline. **Speeds up with success**: fall speed and spawn rate × (1 + 0.9 × successRate × min(1, streak/8)), up to 1.9x, shown as `x1.6` on the HUD timer; a miss resets the streak. | right/total × 100; any wrong sort tints everything pink and caps the score at 60. |

## Level design for Carry-On
`carryonLevel.ts` holds `DEFAULT_LEVEL`, the physics constants (`PHYS`: jump 310, gravity 900, run 115 px/s) and `validateLevel(level)`, a BFS reachability check using the real jump kinematics (max rise 3 rows; horizontal reach 3 tiles for a 3-row rise, 4 for lower). Levels are 23×20 tiles of 16 px. Keep every rise ≤ 3 rows and gaps ≤ 3 tiles; run `npm test` (vitest, `carryonLevel.test.ts`) to prove a level is completable. The scene also logs `console.warn` for a bad level at runtime.

## Dish steps
Every dish in `src/data/dishes.json` uses 4 to 5 steps that make culinary sense (ramen: knead, simmer, pour, plate; tacos al pastor: grill, dice, fold, season; sushi: shake, roll, dice, plate), and no two dishes in the same city share a step sequence. `dishArt.test.ts` enforces: a spec per dish, 4 to 5 known steps, per-city uniqueness, and that all 14 kinds are used somewhere.

## Dev harness
`devHarness.ts` exports `MINIGAME_SCENES` and `launchHarness(game)` (adds a `MinigameHarness` picker with sample payloads and an energy toggle; integrator wires it under `?harness=1`). `harness-entry.ts` is a standalone entry used with a `harness.html` page: `?auto=1&fast=1` drives all six games with synthetic input under a virtual clock and writes results (incl. `vms` = virtual game ms per run) to `#results` (round 4: 35 runs incl. one per new cooking step kind and four full dishes, one `onDone` each, zero page errors; it also renders all 49 dish arts first and records the count in `window.__dishArtRendered`). `?sheet=1&ids=a,b,c` draws a contact sheet of finished dishes into `#sheet`.

## Known limitations
- Art is placeholder-procedural (rectangles, generated 16 px textures); the ART agent can swap textures by key (`co_player`, `co_tile`, `co_stamp`, `co_spike`, `co_heart`).
- No audio hooks yet; add SFX calls where `frame.flash`/`frame.shake` are called.
- Carry-On hazard AI is simple (no pathing); the validator ignores mid-air ceilings.
- Cooking `stir` on desktop needs a mouse drag or holding RIGHT.

## Workout (round 6): one WarioWare-style micro-game per workout, three escalating rounds

`Workout` (payload `{ activity, city, day?, seed?, plan? }`) plays ONE fitness micro-game that matches the activity, picked from the activity's pool and seeded by `city|day` (so different days give different games; `plan: [id]` forces one for tests). The game runs for 3 ROUNDS: a command-word card (0.7 s) opens round 1; `ROUND 2` / `FINAL` cards (0.5 s) open the others; game speed steps x1.0 → x1.3 → x1.6 and each round is shorter (`durationSec / speed`). A countdown bar under the HUD shows the round's time. Lives = 1 + `extraLives` (hiking boots), drawn as hearts: a round scored under 50% costs a life and the session continues to the next round; out of lives → FAILED with the partial score. Session score = mean of round scores. Frame cap 30 s; a full session is 22 to 28 s. Ferrata is the Zeke's Peak climb, unchanged.

| activity | pool (one is chosen) |
|---|---|
| bands (hotel room), unknown | pushup, plank, jumprope, curls, burpee, squat, kettlebell, sprint, stretch |
| boulder | boulderbeta, dyno |
| trailrun | runner, riverstones |
| hike | pace, riverstones |
| swim | swimbreath |
| yoga, surf, ski | balance, pose |
| ferrata | the marble climb (no micro-game) |

| id | word | skill test | controls |
|---|---|---|---|
| pushup | TAP! | tap when the shrinking ring meets the target ring; 4–6 reps, faster each rep | tap / SPACE |
| plank | HOLD! | hold, and micro-drag left/right to keep a wobbling marker in the band; leaving it drains the plank meter | hold + drag / SPACE + ←→ |
| jumprope | JUMP! | tap as the rope passes under the feet; speeds up; a mistimed tap trips (3 trips ends it) | tap |
| curls | SWIPE! | swipe UP on the side the arrow shows before it fades; faster each time | swipe / ←→ |
| burpee | CHAIN! | quick-time chain of 6 icons (tap, swipe up, swipe down, hold) with a shrinking timer | tap, swipes, hold |
| squat | HOLD! | hold to lower, release inside the green depth band; 4 reps, band narrows | hold / SPACE |
| kettlebell | SWIPE! | swipe UP exactly at the top of the pendulum's front arc; 5 swings, accelerating | swipe up / SPACE |
| sprint | GO! | mash-tap to run; when the whistle flashes STOP within ~250 ms; 3 rounds | tap |
| stretch | EASY! | drag the slider end to end without exceeding the speed limit (speedometer goes red); 2 passes | drag / ←→ |
| boulderbeta | MEMORISE! | holds light in sequence (3 then 4), reproduce from memory while grip drains; ends with a dyno catch at the apex | tap holds |
| dyno | CATCH! | tap at the apex of the swing to catch the next hold; 3 catches, 2 slips ends it | tap |
| riverstones | HOP! | tap when the next bobbing stone is at its highest; 5 stones, 3 splashes ends it | tap |
| swimbreath | STROKE! | alternate LEFT/RIGHT taps to the beat; when the bubble shows, do NOT tap (breathe) | tap sides / ←→ |
| balance | STEADY! | hold left/right against visible gusts to keep the ball centred; falling off ends it | hold sides / ←→ |
| pose | MATCH! | drag up/down to rotate the arm onto the shadow within tolerance, hold 0.5 s; 3 poses | drag / ↑↓ |
| runner | RUN! | trail run: tap to jump rocks, swipe DOWN to duck branches | tap / swipe down |
| pace | PACE! | hike pace meter: hold to walk, stay in the green, too fast = dizzy | hold |

Code: `src/minigames/workout/` — `pools.ts` (META, POOLS, ROUNDS, ROUND_SPEEDS, pickOne/pickSession, seeded rng), `micro.ts` (base class, Athlete), `timing.ts`, `hold.ts`, `gesture.ts`, `boulder.ts`, `legacy.ts`, `index.ts` (registry). Harness: `harness.html?auto=1&fast=1` drives every activity, every micro-game solo and extra-lives variants under a virtual clock; `?rt=1&activity=bands` runs one real-time session with no input.
