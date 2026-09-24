# SIM agent notes (for the integrator)

## Round 3 (2026-09-24): one suitcase, money, weekends, streaks, radon

**Save format is v2** (`SAVE_KEY nomadtrail.save.v2`, `RunState.version: 2`, `money`); `load()` discards anything else.

**One suitcase.** `Sim.GRID = { checked: {cols 8, rows 10, maxLb 50} }` (from `consts.ts`). `validatePack` rejects any item with `bag !== 'checked'` ("everything goes in the suitcase now"). `weights.backpack` is always 0. A sensible full kit (laptop, toiletries, watch, monitor, 2 weeks clothes, shell, protein, supplements, skincare, sleep kit, coffee, adventure, fitness, first aid, meds, cubes) is 32.6 lb / 69 cells. Delayed bag (`bagLockedDays > 0`): only `essential`-tagged bundles are reachable (`accessibleItems`), clean clothes are frozen, Cook / Train / Laundry return errors mentioning "suitcase", energy −8/day, Work still works and pays.

**Money.** `START_MONEY 4000`, `WORK_PAY 450` per weekday, `OVERDRAFT 1500`. Every day costs `city.costPerDay` (45 to 180 USD); every leg costs `Sim.fareFor(fromCity, leg)` (flight 120 + 0.08/km, train 40 + 0.05/km, bus/car/ferry 30 + 0.03/km, trek 900). At `money < 0` the engine fires the `broke` event once (card declines, mood −5); at `money < -OVERDRAFT` the run ends with kind `'broke'` ("The card declines in {city}. Orange County has a couch."). Cause line: "Broke in Lisbon on day 88, $1,512 in the hole". Score adds `money/20` on a win.

**Weekends.** Day 1 is Thursday Jan 1 2026. `Sim.weekdayOf(day)` (0 = Sunday), `Sim.isWeekend(day)`, `Sim.nextWorkdays(state, n)`. `cityAction('work')` on a weekend returns `error: 'It is the weekend. Nobody is paying.'` with the state unchanged. **UI: disable/label the Work button on weekends (show the weekday in the HUD) and make Work Week call work only on the days `nextWorkdays` returns.**

**Work streak.** `workStreak` counts consecutive work days; energy cost `WORK_ENERGY(n) = min(40, 8·1.3^(n−1))`, mood cost `WORK_MOOD(n) = min(15, 1·1.35^(n−1))`. Any other day action (explore, rest, cook, train, laundry) and any travel reset it to 0. Work Week batching should stop when energy gets low; five straight days cost 72 energy.

**Weight → travel.** Leg energy × (0.8 + 0.8 × weightRatio). A ≥ 85% suitcase adds "The suitcase fights you the whole way." to the travel log line.

**Outdoorsy cities** (`city.outdoorsy`, 16 of them: Boulder, Montana, Joshua Tree, La Ventana, Patagonia, Highlands, Iceland, Innsbruck, Salzkammergut, Dakhla, Minakami, Kathmandu, Manaslu, Granada, Carvoeiro, Iguazú). With the `adventure` bundle (tag `hike`): Explore +6 mood, −3 less energy, Train difficulty −0.1. Without it: 30% chance of "The trail was right there" (mood −3). `Sim.isOutdoorsy(state)`.

**Hiking boots → extra life.** `cityAction('train')` returns `minigame.extraLives = 1` (also `payload.extraLives`) when `hikingboots` is packed and the activity is outdoor (trailrun, hike, ferrata, boulder, ski, surf). **UI: forward `minigame.extraLives` into `MinigameLaunch.extraLives`.**

**Radon** (`city.radon` 0..3; 15 cities, Tyrol/Salzkammergut/Colorado/Montana at 3). Daily health −0.15 × radon unless `airmonitor` is packed. With the monitor: event `radonmonitor` on stay day 1 (mood +2). Without, radon ≥ 2: event `radonheadache` on stay day 5 (mood −4). Both live in events.json with baseChance 0 and are fired by the engine (`forceEvent`).

**Bundles.** 36 (phone removed, Air Quality Monitor added, real: true). Every bundle has `benefits: string[]` (2 to 4 lines, ≤ 44 chars) for the pack card. `Sim.randomPack(seed)` returns a legal random pack that always includes the laptop and a week of clothes (Surprise Me). `Sim.shelfPack(ids)`, `Sim.buildPack(style, rng)`, `Sim.idsWeight(ids)` are exported from `src/core/sim/pack.ts` (no policy dependency; `sim/policy.ts` re-exports them).

**Other UI notes.** `hasItem(state, id)`, `isOutdoorsy(state)`, `fareFor(city, leg)` are on `Sim`. Show `money` in the HUD and the fare on route cards (`Sim.fareFor(Sim.CITY[run.cityId], leg)`). The e-reader gives +2 mood per travel day; host gifts +3 mood on arrival at an Airbnb/co-living; the tablet +2 mood on rest days; the kettle +1 mood per day (and the event).

**Numbers** (`npm run sim 400`): random pack 43% fail (hospital 149, broke 13, out-of-days 7, flew home 1), mean end day 197, mean end money $4.8k; heavy 80% fail; smart 100% win, ~$9.4k left. Broke is 8% of first-timer failures. Headless players work ~60% (random) / ~70% (smart) of weekdays, never weekends.



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
