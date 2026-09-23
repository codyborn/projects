# The Nomad Trail — status (2026-09-24, overnight build)

Live: **https://cit.earth/trail/** (GitHub Pages, deploys on push to main). Source: `nomad-trail/`, build output: `trail/`.

## How to run
```
cd ~/repos/projects/nomad-trail
npm run dev            # http://localhost:5173/trail/
npm test               # vitest: 31 engine tests
npm run sim            # 200-run balance sim (random / heavy / smart packs)
npm run build          # tsc + vite -> ../trail (commit that folder to deploy)
npx vite preview --port 4173 & node e2e/smoke.mjs   # headless Chrome full-run e2e + screenshots in e2e/shots
node e2e/layout.mjs    # 1x layout screenshots in e2e/layout
```
Debug API in the browser console: `__nomad.newRun('miami','east')`, `__nomad.autoPack('balanced'|'light'|'heavy')`, `__nomad.depart()`, `__nomad.travelFirst()`, `__nomad.act('cook')`, `__nomad.finishMinigame(80)`, `__nomad.forceEnding('win')`, `__nomad.goto('Coffee', {cityId:'tokyo', day:41})`, `__nomad.minigame('CarryOn')`. Mini-game picker: `?harness=1`.

## What works
- Full loop: Title → start city + direction → Pack (Tetris bags, drag/rotate, weight bars, hints) → Route (pixel globe, season-gated legs, forward-only, home flight after 330° of progress) → Travel (parallax leg, baggage beat, events) → City (HUD, arrival stamp, 8 actions incl. Work Week, day log) → End (stats, score) → Share card (1080x1920 PNG, real QR to cit.earth/trail) / Passport.
- Save/resume: autosave after every action; Continue on the title; verified across reload in e2e.
- All nine real incidents as events (otter only in Tokyo, via Explore), plus altitude, jet lag, wind days, lost phone, overweight, urchin, and flavor events.
- Six mini-games: Cooking (6 micro-task kinds, 49 dishes), Workout (bands / boulder / ferrata / trail run / hike pace / swim), Carry-On (per-city platformer in a handheld bezel, 9 levels, gold stamp on clear), Kite, Airport, Laundry. Energy lowers timing windows.
- Coffee cinematic (first morning in each city when the coffee kit is packed), passport with plain/gold stamps, chiptune loops per region + SFX, mute toggle, PWA installable/offline.
- Balance (`npm run sim`): random first-timer pack fails 37% (mostly hospital, some out-of-days), mean end day ~250 of 365; heavy pack fails ~51%; smart pack wins 99%. Stays ×1.25, wear 0.10 + 0.0017·day, event damage ×0.85 vs the generated data.

## Known rough edges / next
- Pixel font is authored 5x7; long labels in tight spots can still clip. Emoji were removed from the pixel-font paths.
- Mini-game art is procedural placeholder (shapes), not yet in the skyline art style. Carry-On hazards are simple.
- Coffee cinematic plays only on stay day 1 of each city (design: every morning) to keep runs at ~20 minutes.
- Passport layout is a plain grid; share card QR is real, stamps are drawn small.
- Data JSON (`src/data`) has been hand-tuned after generation; `tools/gen_*.py` are stale relative to it.
- Not verified on a physical phone yet: touch drag in Pack, Web Share on iOS, PWA install banner, audio unlock on first tap.

## Phone test checklist
1. Open cit.earth/trail on iPhone Safari and Android Chrome; add to home screen; relaunch offline.
2. New run → drag 6 to 10 items into both bags, rotate one, drop one outside, Depart.
3. Take a flight leg; confirm baggage beat + at least one event card; tap Continue.
4. In a city: Cook, Train, Rest, Work Week; confirm the score toast and HUD change; Move On.
5. Kill the tab, reopen: Continue resumes in the same city on the same day.
6. Pack the Switch: Rest → Carry-On level for that city; collect stamps; die once (hazard).
7. Pack the coffee kit: first morning cinematic plays, tap to skip works.
8. Force a loss (stay heavy); End → Share card → Share sheet or Save PNG; Passport opens and flips.
