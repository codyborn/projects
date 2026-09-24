# SIM agent notes (for the integrator)

Round 2 (2026-09-24, after Cody's first phone playtest). Data is generated: `python3 tools/gen_items.py && python3 tools/gen_cities.py && python3 tools/gen_events.py && python3 tools/gen_levels.py`, then `npm test && npm run sim`. The generators are the source of truth again (the earlier hand tuning is baked in).

## What changed for the UI

- **Bundles.** `items.json` is now 35 generic bundles (no brands): the pack tray needs fewer, bigger cards. Three bundles share the name "1 Week Of Clothes" (`clothes1..3`, 7 clothes-days each). `real: true` marks bundles from Cody's actual bag. `Sim.bundles()` returns the list.
- **Home is always Orange County.** `Sim.createRun(seed, _ignored, direction)`: the start-city argument is ignored (`Sim.HOME_CITY`). Drop the Miami / New York pick; keep east / west.
- **Two goals.** The flight home appears only when `progress >= 330°` AND at least 4 of 5 continents are stamped. `Sim.homeRequirements(state)` → `{ progress, needProgress, continents, needContinents, unlocked }` for the route screen. `Sim.continentsVisited(state)` (in visit order) and `Sim.CONTINENTS_ALL` for a passport / HUD strip. Score: +150 per continent, +500 for all five; achievement `fivecontinents` on the fifth arrival.
- **Legs are ranked.** `availableLegs` returns the home flight first (when unlocked), then legs by forward progress (most ahead at the top), at most one near-sideways option (< 8° ahead), nothing more than 20° backwards. Fallback flights at dead ends: 1 day, or 2 across more than six time zones.
- **Events show one text.** `ResolvedEvent.text` is already the right one (base or mitigated). Never append `mitigatedText` to `text`; every `mitigatedText` is a standalone paragraph.
- **The cancelled booking has no choices** (energy −20, mood −12). The otter is the only choice event left. On arrival the cancellation always comes first and suppresses `nowifi` / `hostgift` / `sleepless` that day (`LODGING_DEPENDENT` in events.ts).
- **Dish consistency.** `cityAction(state, 'cook')` stores `state.pendingDish`; `applyMinigameResult` scores exactly that dish and clears it. Every city's dishes are local (same city or same region).
- **Ending cause.** `ending.cause` is a one-liner for the share card: `Hospitalised in Lisbon after food poisoning, day 44` / `Flew home from Bangkok on day 120, mood zero` / `Ran out of days in Munich, 3 of 5 continents` / `Home to Orange County on day 231, 4 continents`. Also `Sim.endingCause(state, kind)`.
- `coffeePacked` = the Coffee Kit bundle is reachable (not in a delayed suitcase).

## Sim API surface (`import { Sim } from 'src/core/sim'`)
`GRID, TOTAL_DAYS, HOME_CITY, HOME_MIN_CONTINENTS, HOME_PROGRESS_DEG, CONTINENTS_ALL, CITIES, CITY, ITEM, DISH, LEVEL_BY_CITY, createRun, validatePack, setPack, bagWeight(items, bag), weightRatio(items), totalWeight(state), coffeePacked, bundles, hasTag, hasFlag, availableLegs, travelTo, cityAction, applyMinigameResult, resolveChoice, pendingChoices, checkEnding, score, progress, homeUnlocked, homeRequirements, continentsVisited, endingCause, monthOf, visibleAchievements, energyCap, accessibleItems, save, load, clear`.

## Still true from round 1
- Transient flags live in `achievements` with a leading underscore; render `Sim.visibleAchievements(state)` only.
- Actions are one day each; `cityAction` returns `minigame` without ticking the day, `applyMinigameResult` ticks it. Always call it, even on failure.
- `pendingEvent` blocks travel and actions until `resolveChoice`.
- Health/energy/mood are floats internally; round in the HUD.

## Balance (`npm run sim 400`, 2026-09-24)
- Random first-timer pack (6 to 11 bundles, laptop or phone sometimes in the suitcase): **38% fail** (hospital mostly), mean end day ~203, 13.9 cities, 3.8 continents, 12% touch all five.
- Heavy pack (kite + drone + books + boots + kettle, near 50 lb): 51% fail, back injury cascade.
- Smart pack (light, essentials on the back, medicine + cubes + coffee, laundry on time, detours for continents): 100% win at ~day 178, 4.5 continents.
- Levers: `tools/gen_events.py` base chances (food poisoning 0.135 is the main killer), `engine.ts` tickDay wear (`0.12 + 0.0021·day`), `HOME_MIN_CONTINENTS`, stay lengths in `tools/gen_cities.py` (×1.25 baked in).
