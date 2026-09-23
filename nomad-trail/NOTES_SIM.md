# SIM agent notes (for the integrator)

## Type-change requests (worked around, none blocking)
- `RunState.flags: string[]` would be cleaner than the current trick: transient flags live in `achievements` with a leading underscore (`_roomchecked`, `_ev_otter` for once-only events). UI must use `Sim.visibleAchievements(state)` (already filters them) and never render raw `achievements`.
- `GameEvent.once?: boolean` and `GameEvent.months?: number[]` would replace the hard-coded `ONCE` set and the per-id `special()` switch in `events.ts`.
- `Effects.health/energy/mood` are applied as floats internally (slow daily wear is 0.15 + 0.0023*day). HUD should `Math.round()`.

## Design decisions the UI must honour
- **Actions are one day each.** A 200-day run at one tap per day is too many taps for a 15-25 minute session; the City scene should offer batching ("Work week" = 5 x `cityAction('work')`, stopping early when `events.length > 0` or a minigame is requested). The engine is cheap enough to loop.
- `cityAction` returns `minigame` WITHOUT ticking the day; the day ticks inside `applyMinigameResult`. Always call `applyMinigameResult` after a minigame, even on failure (`{score:0, perfect:false, failed:true}`).
- `pendingEvent` blocks travel and actions until `resolveChoice` is called. `Sim.pendingChoices(state)` returns only the choices the player's gear allows (e.g. "clean the cut after" needs a first-aid kit).
- `availableLegs` filters by direction (no backtracks > 30 deg), by month, forbids revisits, hides the home city until `progress >= 330`, and adds fallback long-haul flights when a player has exhausted a region. `leg.home` marks the flight that ends the game.
- Items in the checked bag are unusable while `bagLockedDays > 0` (`Sim.accessibleItems`).
- The otter is a choice event that only fires in Tokyo during `explore`.

## Tuning numbers (npm run sim, 2026-09-24)
- Random first-timer pack (200 runs): **42% fail** (78 hospital, 5 out of days, 1 flew home), mean end day 197, 16.5 cities. Failure days: 50-99: 21, 100-149: 19, 150-199: 12, 200-249: 16, 250-299: 6, 300+: 9.
- Heavy pack (near 50 lb, kettlebell/kite/wine/books): 69% fail, mostly hospital after the back goes.
- Smart pack (light, essentials in the backpack, first aid + probiotics + cubes + coffee, laundry on time): 100% win at ~day 201. Learning matters.
- Runs end around day 200 for players who follow suggested stays, so "most failures 200-300" was traded for "failures spread across the middle of the run with a late-game ramp" (health wear is 0.15 + 0.0023*day per day; the year itself gets heavier). Lengthen `suggestedStay`/`minStay` in `tools/gen_cities.py` to push both endings later.
- Levers: `tools/gen_events.py` base chances and effects, `engine.ts` tickDay wear line, `applyMinigameResult` health gains, `HOME_PROGRESS_DEG`.

## Regenerating data
`python3 tools/gen_items.py && python3 tools/gen_cities.py && python3 tools/gen_events.py && python3 tools/gen_levels.py` (levels self-verify reachability). Then `npm test && npm run sim`.
