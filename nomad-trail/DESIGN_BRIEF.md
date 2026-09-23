# THE NOMAD TRAIL — build brief for gpt-6-astra

You are building a complete, polished, mobile-first HTML5 game called **The Nomad Trail** in one long autonomous session. You have file and shell tools scoped to this repository. Work until the Definition of Done below is met, committing as you go. You have creative freedom on art, feel, animation, mini-game design and code architecture. The design document below is the contract for mechanics, content and tone: honor it.

## Hard requirements

- Stack: **Vite + TypeScript + Phaser 3**. Portrait, internal resolution 360x640, integer scaled, touch-first (one thumb), also playable with mouse/keyboard on desktop. PWA (manifest + service worker) so it installs from a QR code and works offline after first load.
- Source lives in this directory (`nomad-trail/`). `vite.config.ts` must set `base: '/trail/'` and `build.outDir: '../trail'` (emptyOutDir true) so the built game is served by GitHub Pages at **https://cit.earth/trail/**. The parent repo (`..`) is the live site; do not touch anything in `..` except `../trail/` (build output). Never modify `../map`, `../index.html`, `../CNAME`, `../shorts`, `../cards`.
- No external asset packs, no CDN dependencies at runtime, no network calls at runtime. All art is authored in code or as small PNG/JSON files you generate with scripts you write (Python 3 with Pillow and numpy are available; Node 24 is available). Fonts: embed a pixel font (generate bitmap font atlas yourself or use a permissively licensed one you can vendor as a file).
- Sound: small procedurally generated chiptune loops and SFX (generate with a Node or Python script into OGG/WAV, or synthesize at runtime with WebAudio). Must have a mute toggle. Must not autoplay before first tap (mobile policy).
- **Save and resume**: autosave to localStorage after every player action; title screen offers Continue when a save exists. Saves must survive a page reload and a PWA relaunch. Version the save format.
- Data-driven content: `src/data/items.json`, `cities.json`, `events.json`, `dishes.json`, `arcade_levels.json` so copy and numbers can be edited without touching code. Item weights: use the real weights where you know them (estimate sensibly otherwise, in lb, one decimal).
- Include an **automated simulation playtest**: a headless script (`npm run sim`) that runs the core simulation (no rendering) for 200 runs with a reasonable random-but-not-stupid policy and prints win/fail rates and causes. Tune the numbers until first-run failure lands at **35 to 45%**, with most failures between day 200 and 300.
- Git: commit in small logical steps with clear messages. When the game is playable start-to-finish and `npm run build` succeeds, commit the build output in `../trail/` and `git push origin main` from the parent repo (`cd .. && git push`). Push again after later milestones. Deploy is automatic (GitHub Pages).
- Do not ask questions. Make decisions, note them in `DECISIONS.md`, and keep going. If something is impossible, do the closest possible thing and document it.
- Finish by writing `STATUS.md`: what works, what is stubbed, known bugs, how to run, and a phone test checklist. Then call the `done` tool with a summary.

## Definition of Done

1. A run is playable start to finish on a phone browser: title → pack → route → legs and city stays → win or lose → share card.
2. Save/resume works across reloads.
3. All nine of Cody's incidents fire as events with their mitigations (see catalog). The otter fires only in Tokyo.
4. At least four skill mini-games work: packing (Tetris bags) is mandatory, plus cooking, one workout, and Carry-On (the per-city platformer, at least 6 city levels). Kiteboarding and airport dash if time allows.
5. The morning coffee animation exists and plays when the coffee kit is packed.
6. Passport with stamps per city; share card renders a PNG (route on globe + passport + stats + cause of death) that the player can save/share.
7. `npm run sim` reports 35 to 45% failure.
8. Built output committed to `../trail/` and pushed.

## Design document (the contract)


# The Nomad Trail

A playable fake ad for [[Nomad Magazine]]. A full-page ad in the magazine ("Now available on the device you are already holding") with a QR code to a web game at **cit.earth/trail**. Oregon Trail, but the wagon is a 50 lb suitcase and the trail circles the globe in 365 days through the cities Cody actually lived in. Every disaster in the game happened to him.

Related: [[Nomad Gear List]] (the item catalog), [[The Nomad]] (the itinerary the map is built from), [[Nomad Magazine Log]].

## Pitch in one screen

> You have one year, two bags, and a job that lets you work from anywhere. Circle the planet and come home. Pack too much and your back gives out. Pack too little and you spend Tuesdays in laundromats. Pet the otter and see what happens.

## Platform decision (proposed)

- **Web first**: a portrait-orientation HTML5 game, installable as a PWA (home-screen icon, works offline after first load). Hosted on the existing GitHub Pages site at cit.earth/trail. Zero install friction from a QR code, which matters more than anything for a magazine audience of ~24 people.
- **Native later, only if wanted**: wrap the same build with Capacitor for iOS/Android. App Store review would not finish before print, and the QR to a web URL works either way. Recommendation: skip native for Issue No. 1.
- **Stack**: TypeScript + Phaser 3 (scene management, tweens, sprite animation, input, audio all built in) + Vite. Internal resolution 360x640 (9:16), integer-scaled. Pixel art at 16 px tile / 32 px character scale with a fixed 32-color palette so everything reads as one world. Chiptune audio via small OGG loops.
- **Saves**: localStorage autosave per run + a run history; share card (PNG) at the end for texting friends. No accounts, no backend.

## Decisions from Cody (2026-09-24)

- **No money resource.** Money was never the constraint in real life; the game matches that. Mood and Energy carry the pressure: too many legs, no exercise, bad food all hit them. Lodging choices trade Mood/Energy/quiet, not dollars
- **Real names, real incidents**, verbatim. Only the otter is location-bound (Tokyo animal cafés); the other incidents can fire anywhere
- **Save and resume** is required: autosave after every action, resume from the title screen, multiple slots not needed
- **15 to 25 minutes per run, ~40% first-run failure** confirmed
- **Art**: modern 8-bit, references **Katana ZERO** and **Dave the Diver**. Ignore the map page's island style. 20 hero cities with full postcard scenes, regional generics for the rest, to start
- **Passport stamps**: every city arrival stamps a pixel passport; the passport is the where-have-I-been UI and part of the share card
- **The arcade is not Pong**: it needs a level per city (see Carry-On below)
- **Coffee animation**: yes, Katana ZERO register (rain-on-glass, neon-in-twilight, slow pan)
- **Share card**: yes
- **Timeline**: one-shot build overnight with gpt-6-astra, then iterate

## Core loop

```
PACK  →  PLAN ROUTE  →  [ TRAVEL LEG → ARRIVE → CITY STAY ] × N  →  HOME (win)  or  HOSPITAL / FLEW HOME / OUT OF DAYS (lose)
```

A run should take **15 to 25 minutes**. Multiple runs are the point: different packs and routes produce different games.

### Resources (top HUD, always visible)

| Resource | Range | What moves it |
|---|---|---|
| **Days** | 365 → 0 | Every leg and stay costs days. Delays, illness, and laundry burn extra. Running out = fail |
| **Health** | 0 to 100 | Illness, injury, altitude, bad food. 0 = hospitalized, game over |
| **Energy** | 0 to 100 | Jet lag, overnight buses, back pain. Low energy makes mini-games harder (slower inputs, smaller windows). Coffee restores it each morning |
| **Mood** | 0 to 100 | Loneliness, cancellations, losing things, too many legs in a row. Restored by activities, good food, the arcade, a great view. 0 = you fly home |
| **Travel fatigue** | hidden | Each leg costs Energy and Mood scaled by how many legs you took in the last 30 days. Staying a month somewhere resets it. This is the anti-speedrun mechanic and the most real one |
| **Clean clothes** | 0 to N days | Drops one per day. At 0 you must do laundry (1 day) or take a hygiene Mood hit |
| **Weight carried** | lb, per bag | Fixed at packing, changes as you lose, buy, or ship items |

### 1. Pack (the first mini-game)

Two bags, drawn as real containers you drag items into, Tetris-style:

- **Checked suitcase**: 50 lb, large grid. Can be **delayed** (contents unavailable for 1 to 4 days at destination), have a **wheel destroyed** (heavier to move: energy cost per leg until repaired), or be **lost** (rare).
- **Backpack**: 25 lb, small grid. Always with you.

Each item has weight, grid footprint, and tags. The catalog is the real one from [[Nomad Gear List]] (68 items) plus extras for other builds:

- First aid kit, antibiotics, probiotics, water filter (already there), mosquito net + repellent, hiking boots, down jacket, swimsuit, kite gear (heavy, unlocks kiteboarding scores), climbing shoes (already there), yoga mat, Nintendo Switch (game within a game), Kindle, second laptop charger, umbrella (vs the rain shell), a second pair of jeans (the trap item), the travel kettle (the trap item that explodes), camera lens, tripod, French press vs pour-over kit, spare phone, YubiKey, packing cubes (reduce laundry time), compression straps (shrink the pillow), gifts for hosts.

**Packing consequences (the design spine):**

| Choice | Consequence |
|---|---|
| Total weight ≥ 90% of max | Back injury risk each leg; at 100% it is near certain within three legs. Back injury: Energy cap halved for 10 days, no workouts, no heavy carries |
| Essentials only in the checked bag (laptop, meds, chargers) | Baggage delay locks you out of remote work / meds for those days |
| Fewer than ~7 days of clothes | Laundry every week, each costing a day |
| No supplements, no workout gear, no sleep mask/earplugs | Illness probability up each leg; jet lag lasts longer |
| No first aid kit | Small cuts can become infections (the otter event) |
| Coffee kit packed (grinder + dripper + kettle, ~2.5 lb) | +15 Energy every morning, and each day opens on the **twilight coffee animation** |
| Rain shell | Removes the "soaked, energy −20" outcome in rainy cities |
| Switch | Rest days restore +20 Mood and unlock the mini-arcade; 0.9 lb and a charger slot |
| Kite gear | Kiteboarding mini-game scores count for Mood and a hidden achievement; +12 lb |
| Travel kettle | Convenience (+ tea at night, small Mood) but a 1-in-N chance per use of the burn event |

### 2. Plan the route

A stylized pixel globe. You start and must finish in **Miami** (or **New York**; player picks). Cities are nodes with real travel legs between them. The player must choose a direction (east or west) and then pick one of two or three next cities at each junction, so there are many distinct paths through ~45 real stops. Some legs are only available by season (Manaslu in October/November, Iceland campervan in summer, Oktoberfest in September), which is where the calendar pressure comes from.

**Regions and stops (all real):**

- **North America**: Miami, New York, Boulder/Denver, Tabernash, Montana (Bozeman), Las Vegas, Joshua Tree, Orange County, Santa Monica, Montreal
- **Mexico + Central America**: La Paz, Puerto San Carlos (whales), La Ventana (kiteboarding), Roatán (Vitalia)
- **South America**: Santiago, Patagonia (Edge City), Buenos Aires, Iguazú, Colonia
- **Europe West**: Lisbon, Carvoeiro, Sintra, Madrid, Granada, London, Brussels, Amsterdam
- **Europe South**: Marseille, Hyères (mosquitoes), Antibes, Cannes
- **Europe North/Alps**: Aviemore, Isle of Skye, Glencoe, Edinburgh, Iceland (campervan), Munich, Rotholz, Innsbruck (ferrata, bouldering), Salzkammergut
- **Africa**: Casablanca, Dakhla (kite, wind), Nairobi (the planned Kenya gap)
- **Asia**: Seoul, Chiang Mai, Bangkok, Hong Kong, Tokyo, Minakami, Nikko, Kathmandu, Manaslu Circuit

Each city has: lodging options (hostel / Airbnb / hotel with cancellation risk, quiet rating, Mood and Energy effects), a local dish for the cooking game, a local activity (mini-game or a scripted scene), a weather profile, and its own event table.

### 3. Travel legs

Flight, train, bus, campervan, ferry, or on foot (Manaslu). Each has a day cost, an energy cost, and an event roll. Flights roll the **baggage table**: on time (~85%), delayed 1 to 4 days (~10%), wheel destroyed (~4%), lost (~1%). The leg plays as a short side-scrolling travel animation (plane over pixel clouds, train through the Inn valley, bus over Andes switchbacks) with the event interrupting it, Oregon Trail style.

### 4. City stay

A day-by-day loop with a small set of actions per day: **Work** (a remote-work day: costs Energy, restores Mood a little, keeps the streak that unlocks the ending's "still employed" line), **Explore** (Mood, small illness/lost-item risk, unlocks a scene), **Train** (workout mini-game, location-dependent), **Cook** (cooking mini-game with local ingredients), **Rest** (energy, and the Switch if packed), **Laundry**, **Move on**. Leaving a city rolls the **forgot-something** table: a random item stays behind unless you have packing cubes or spend a "double check the room" action.

## Event catalog (all from Cody's actual life)

| Event | Trigger | Where | Mitigation | Outcome |
|---|---|---|---|---|
| **The otter** | Explore at the aquarium/animal café; player is asked "Pet the otter?" | Tokyo | First aid kit (clean the cut), antibiotics | Untreated: paronychia → fever 3 days later → hospital: −40 Health, −4 days |
| **Thrown-out back** | Weight ≥ 90% cap, cumulative per leg | Anywhere (it was carrying too much) | Pack lighter, ship a box home (1 day) | Energy cap halved 10 days, no Train action |
| **Destroyed wheel** | Flight baggage roll | Anywhere | Backpack-only build immune | +Energy cost per leg until repaired (a day in a big city) |
| **Delayed baggage** | Flight baggage roll | Anywhere | Keep essentials in the backpack | Checked contents locked 1 to 4 days; meds/laptop/clothes effects cascade |
| **Exploding kettle** | Using the travel kettle | Anywhere (real one: March 2024) | Don't pack it; hotel kettle instead | 2nd-degree burn: −25 Health, no cooking game 7 days |
| **Food poisoning** | Street food / raw / "the mystery dish" choices | Bangkok, Mexico, Morocco, Nepal weighted | Probiotics, greens, cooking your own food | −20 to −35 Health, −2 days, Mood hit |
| **Airbnb cancelled same day** | Arrival roll on Airbnb lodging | Lisbon, Innsbruck weighted | Have a backup contact | Scramble scene: choose between a hotel across town (−1 day), a hostel dorm (−Mood, −Energy), or a night in the airport (−Energy hard) |
| **Forgot something** | Leaving a stay | Anywhere | Packing cubes, "double check the room" | Lose one random item; if it was a charger or meds, cascading effects |
| **Mosquito swarms** | Summer stay | Hyères, the Riviera | Repellent, net, long sleeves | Sleep quality → Energy −10/day, Mood hit |
| **Altitude** | Manaslu legs above 3,500 m | Nepal | Acclimatization day, Diamox, the electrolytes | Health drain, possible turn-back |
| **Wind day** | Dakhla, La Ventana, Patagonia | | Kite gear turns it into a mini-game | Without kite: stuck indoors (Mood −) |
| **Overweight at check-in** | Checked bag > 50 lb | Airports | Ship a box, wear the jacket | Leave an item or lose a day repacking |
| **Jet lag** | Legs crossing ≥ 6 time zones | | Sleep mask, earplugs, sun lamp | Energy −30 for 2 to 4 days |
| **Sea urchin / reef cut** | Roatán snorkel | Roatán | First aid | Small Health hit, infection chance without kit |
| **Lost phone / laptop** | Rare theft roll in big cities | | Spare phone, YubiKey backups | The vault's "what do you do if you lose your phone, laptop, yubikey" question, as a scene |

## Skill mini-games

Each is 30 to 90 seconds, thumb-friendly, with a clear score, and Energy modulates difficulty.

1. **Kiteboarding / sailing** (La Ventana, Dakhla, Patagonia wind days): hold the kite in the power zone against gusts, time jumps off swell. One-thumb: tilt/drag for kite angle, tap to jump. Score → Mood, achievement.
2. **Cooking** (every city, Cooking Mama style): a dish is a sequence of 3 to 5 micro-tasks (chop rhythm, stir circles, flip timing, season by tapping the right count). Dishes: tacos al pastor, dal bhat, Kaspressknödel, Kaiserschmarrn, ramen, tagine, pastel de nata, bibimbap, khao soi, asado, ceviche. Cooked meals restore Health and avoid the food poisoning roll. Ingredients must be bought that day; missing ingredients lock dishes.
3. **Workouts** (location-dependent): hotel-room resistance bands (rhythm taps), Innsbruck bouldering (route-reading: tap holds in order before the grip meter empties), via ferrata (clip-in timing game on a cliff), trail run in Boulder (endless-runner over rocks), swim in Antibes, Manaslu day hike (pace meter: too fast → altitude sickness). Keeps Health from decaying and raises Energy cap.
4. **Packing** (start, and re-pack after every loss): the Tetris bag fill described above.
5. **Airport dash** (on tight connections): tap-timing through security, gate change, the boarding group shuffle.
6. **The Switch arcade** (if packed): a tiny playable Pong/Snake as the game within the game. Restores Mood on rest days.
7. **Laundry** (optional, quick): sort by color under a timer; bad sort → pink shirts (Mood −2, cosmetic sprite change for the rest of the run).

## Passport

A pixel passport in the pause menu. Every arrival stamps it (city name, date in run-days, a tiny icon). Carry-On clears turn a stamp gold. The passport page is the centre of the share card, with the route drawn on the globe around it. Empty pages are the pull to run again.

## Art direction

- Modern 8-bit, references **Katana ZERO** (neon twilight, rain, slow cinematic pans, heavy parallax) and **Dave the Diver** (chunky readable sprites, warm daylight palettes, playful UI). Fixed 32-color palette so the whole game reads as one world. 1 px outlines, dithered skies, three-layer parallax on every scene. Not literal 1985 Oregon Trail, and not the map page's island style.
- Every city gets a **postcard scene**: a one-screen pixel vista (Innsbruck Nordkette, Dakhla lagoon, Tokyo alley in rain, Manaslu at dawn, Miami causeway) used for arrival, and reusable as the magazine's spot art. This is the biggest art cost: ~45 scenes. Cut to ~20 hero cities with generic regional scenes for the rest if needed.
- The **morning coffee animation** (Katana ZERO register): a window at blue hour, rain or city lights behind it depending on the city, the Timemore grinding, the kettle pour, steam curl, a slow pan to the skyline as the sun wipes in, the day counter ticking. Plays only if coffee is packed. The single most-shared moment, worth the polish.
- Character: a small nomad sprite with a visible backpack and rolling suitcase; the suitcase sprite loses a wheel, gains a limp when the back goes, wears the rain shell when packed.
- Typography: a pixel font for HUD, a clean serif for event cards so the writing reads well.
- Sound: chiptune loops per region (Alps: accordion-ish square waves; Japan: pentatonic; Mexico: brass-ish pulse), UI blips, the kettle *pop*.

## Tone

Deadpan, self-deprecating, factual. Event text is written as if from a travel log: "Day 41, Tokyo. You pet the otter. It was worth it. (Check Health.)" Nothing cruel, the world is not out to get you, it is just heavy and far away. The **magazine ad** is written as a straight app-store ad with side effects in small print, matching the Shearwater ad's register.

## Win, lose, score

- **Win**: return to the start city within 365 days with Health > 0 and Mood > 0. Score = days to spare × health × cities visited, with bonuses for achievements (Kite Master, Iron Stomach, Zero Items Lost, Coffee Every Morning, Petted The Otter And Lived).
- **Lose**: Hospitalized (Health 0), Flew Home (Mood 0), Out of Days, or Quit ("You flew home. Miami is nice in winter.").
- **Target difficulty**: about 40% of first runs fail, most by day 200 to 300. Second runs succeed if the player learned something about packing.
- End card: a pixel share image with the route drawn on the globe, the stats, and the cause of death if any. The QR back to the game.

## The magazine ad (page copy, draft)

Full page. A phone-shaped pixel screenshot of the twilight coffee scene. Headline: **THE NOMAD TRAIL**. Sub: *Circumnavigate the planet in 365 days. Pack light. Trust no kettle.* Body: "Available now on the device you are already holding. Scan to play. No account. No ads (other than this one). Side effects may include: laundry, second-degree burns, an inexplicable urge to visit Innsbruck." Footer: "A Citizen Earth production. Based on actual events." QR code.

## Build plan (one-shot overnight, 2026-09-24)

Built by **gpt-6-astra** via the OpenAI Responses API, driven by a small agent loop (`~/repos/projects/trail/agent/run_astra.py`) that gives it read/write/shell tools scoped to the repo. Creative freedom on art, feel, and mini-game design; the design in this note is the contract for mechanics, content, and tone.

- **Repo**: `~/repos/projects/trail` (Vite + TypeScript + Phaser 3, PWA), deploys with the rest of the site to **cit.earth/trail**
- **Inputs handed to astra**: this note, the gear list tables (items + weights), the itinerary (cities, order, durations), the incident list
- **Order of work**: scaffold + deploy → data (items, cities, events, dishes, arcade levels) → packing → route → simulation loop with save/resume → mini-games → art (procedural pixel art + hand-authored sprites in code, no external asset packs) → coffee animation → passport + share card → playtest via headless run of the simulation to tune failure rate
- **Definition of done**: a run is playable start to finish on a phone, saves survive a reload, all nine incidents fire, at least four mini-games work, the coffee scene exists, the share card renders, and the simulation's automated playtest lands 35 to 45% failure across 200 random-policy runs
- Morning after: I review the build, screenshot on phone, log it, and we iterate with astra on what fell short

## Ideas parked (not in scope for v1)

- Multiplayer "convoy" where friends' runs show as ghost nomads on the globe
- A "hard mode" that starts in New York in January with a checked bag only
- Real Garmin data seeding the workout targets
- Native app via Capacitor once the web build settles
- Localized dishes unlocking real recipe cards that link back to the magazine's recipe pages



## The real gear catalog (from Cody's list; columns: Item | Model | Link | Notes)

Every one of these must be a packable item. Add the extras named in the design (first aid kit, antibiotics, probiotics, repellent, hiking boots, down jacket, swimsuit, kite gear, yoga mat, Nintendo Switch, Kindle, umbrella, second pair of jeans, travel kettle, camera lens, spare phone, packing cubes, compression straps, host gifts, and anything else that creates an interesting build).

## Carry / tech

| Item                    | Model (exact)                                           | Link                                 | Notes / story                                                 |
| ----------------------- | ------------------------------------------------------- | ------------------------------------ | ------------------------------------------------------------- |
| MacBook Pro 14"         | Apple MacBook Pro 14 inch                               |                                      | Daily driver                                                  |
| Pixel 10                | Google Pixel 10, Obsidian (primary camera)              | https://www.amazon.com/dp/B0GYJ4DK31 | Primary camera                                                |
| Magic Keyboard          | Apple Magic Keyboard, US English, Silver                | https://www.amazon.com/dp/B016QO64FI |                                                               |
| Laptop stand            | UGREEN Adjustable Laptop/Tablet Stand                   | https://www.amazon.com/dp/B07CG71KQ1 |                                                               |
| Osprey Farpoint Trek 55 | Osprey Farpoint Trek 55L Travel Backpack                | https://www.amazon.com/dp/B0FGXYLC75 | Technically over carry-on size but I've never had any issues. |
| Garmin Fenix 7          | Garmin Fenix 7, 47mm                                    |                                      |                                                               |
| DJI RC-N3 controller    | DJI RC-N3 Controller                                    |                                      |                                                               |
| DJI Mini 5 Pro          | DJI Mini 5 Pro Drone, 1-Inch CMOS                       | https://www.amazon.com/dp/B0F6XJ7W9M |                                                               |
| Galaxy Tab S11          | Samsung Galaxy Tab S11 256GB WiFi                       | https://www.amazon.com/dp/B0FGKQK3J2 | second monditor, e-books, journaling, netflix                 |
| Sony WH-1000XM4         | Sony WH-1000XM4 Noise Canceling Headphones, Black       | https://www.amazon.com/dp/B0863TXGM3 |                                                               |
| AirPods Pro 2           | Apple AirPods Pro (2nd Generation)                      | https://www.amazon.com/dp/B0BDHWDR12 |                                                               |
| Thule Aion sling        | Thule Aion Sling Bag, Nutria                            | https://www.amazon.com/dp/B09NLB55Z5 |                                                               |
| Anker MagGo             | Anker 621 MagGo Magnetic Power Bank, 5,000mAh           | https://www.amazon.com/dp/B099284SRR |                                                               |
| Magnetic tripod         | Ultra-Compact Magnetic iPhone Tripod with Foldable Hook | https://www.amazon.com/dp/B0DZG8WH4N |                                                               |
| Garmin charger          | Garmin USB-C Charging Cables (4-Pack)                   | https://www.amazon.com/dp/B0DDY7YZHJ |                                                               |
| EU plug adapters        | VizGiz US to EU Plug Adapters (2-Pack)                  | https://www.amazon.com/dp/B07QLVDJ1P | Slots directly into the macbook adapter                       |
| Magic Trackpad          | Apple Magic Trackpad 2, Space Gray                      | https://www.amazon.com/dp/B07BRF3ZQD |                                                               |
| Carpio 2.0 wrist rest   | DELTAHUB Carpio 2.0, right-handed, large, black         | https://www.amazon.com/dp/B098P8C3BT |                                                               |

## Clothing system

| Item                     | Model (exact)                          | Link                                                          | Notes / story                    |
| ------------------------ | -------------------------------------- | ------------------------------------------------------------- | -------------------------------- |
| Ombraz Classic           | Ombraz Classic Polarized, Black        | https://ombraz.com/products/classic-ombraz-armless-sunglasses | Great for action sports          |
| Ray-Ban folding Wayfarer | Ray-Ban Wayfarer Folding, Black        |                                                               | Fits in your pocket              |
| REI rain shell           | REI rain shell, orange                 |                                                               | Gortex, lighter than an umbrella |
| Neck gaiter              | Decathlon neck gaiter                  |                                                               |                                  |
| Surf Monkey boonie       | Surf Monkey Boonie Hat                 |                                                               |                                  |
| Melin A-Game             | Melin A-Game Infinite Thermal          |                                                               |                                  |
| Altra Lone Peak 9+       | ALTRA Lone Peak 9+ Trail Running Shoes | https://www.amazon.com/dp/B0DTR5X3MN                          | Wide-toe box, zero drop          |
| Reef Smoothy             | Reef Leather Smoothy Flip Flops        | https://www.amazon.com/dp/B000KS500W                          | Lightweight sandals              |

## Mountain / activity

| Item                | Model (exact)                              | Link                                 | Notes / story                              |
| ------------------- | ------------------------------------------ | ------------------------------------ | ------------------------------------------ |
| Ferrata/kite gloves | Decathlon gloves                           |                                      | Grip + sun protection                      |
| Osprey 2.5L         | Osprey Hydraulics 2.5L Reservoir           |                                      |                                            |
| Sawyer Mini         | Sawyer Mini Water Filtration System        | https://www.amazon.com/dp/B00FA2RLX2 | Inlined into the bladder                   |
| Yaktrax             | Yaktrax Walk Traction Cleats               | https://www.amazon.com/dp/B0094GO9DA | For snow + ice                             |
| Resistance band     | Resistance Loop Exercise Bands (5-Pack)    | https://www.amazon.com/dp/B0D25Y125B | Hotel room workouts                        |
| Nebo Mycro 250      | Nebo Mycro 250 rechargeable keychain light | https://www.amazon.com/dp/B0DDYHGL24 | Attaches to backpack or hats               |
| Pocket knife        | Pocket knife, tan G10 / black blade        |                                      | Picked up in Patagonia                     |
| Foam roller         | Collapsible foam roller                    | https://www.amazon.com/dp/B07GXYFG88 | Great after long travel days               |
| Climbing shoes      | La Sportiva Tarantula Boulder              |                                      | Added Sep 7 for the Innsbruck gym sessions |
| Liquid chalk        | Mammut Liquid Chalk 200 ml                 | https://www.amazon.com/dp/B08P2TXY7V | No chalk dust in the bag, gym-friendly     |

## Supplements

| Item                 | Model (exact)                                    | Link                                 | Notes / story        |
| -------------------- | ------------------------------------------------ | ------------------------------------ | -------------------- |
| Two-Per-Day multi    | Life Extension Two-Per-Day Multivitamin          | https://www.amazon.com/dp/B01IROPPR8 |                      |
| Creatine             | Nutricost Creatine Monohydrate Micronized, 500g  | https://www.amazon.com/dp/B00GL2HMES |                      |
| Casein               | BulkSupplements Micellar Casein Protein Powder   | https://www.amazon.com/dp/B0128VQT7Q | Slow release protein |
| Super greens         | Amazing Grass Super Greens Powder                | https://www.amazon.com/dp/B0038B3AAK |                      |
| Collagen peptides    | Vital Proteins Collagen Peptides Powder          | https://www.amazon.com/dp/B09RQBHRCT |                      |
| Electrolytes         | Nutricost Electrolyte Complex Powder             | https://www.amazon.com/dp/B0D6JFYVHW |                      |
| NZE caffeine pouches | NZE Caffeine Nootropic Pouches 50mg, Wintergreen | https://www.amazon.com/dp/B0DHLSDS91 |                      |
| Calcium + magnesium  | Nutricost Calcium & Magnesium, 240 Tablets       | https://www.amazon.com/dp/B0989HPNQF |                      |
| Psyllium husk        | Nutricost Psyllium Husk Powder, 1lb              | https://www.amazon.com/dp/B07MKZD9LR |                      |
| D3 + K2              | NOW Liquid D-3 & MK-7                            | https://www.amazon.com/dp/B07H1V2KM3 |                      |
| Fish oil             | Nature Made Fish Oil 1000mg                      | https://www.amazon.com/dp/B0046XC528 |                      |

## Skincare

| Item               | Model (exact)                                   | Link                                 | Notes / story |
| ------------------ | ----------------------------------------------- | ------------------------------------ | ------------- |
| CeraVe AM SPF 30   | CeraVe AM Facial Moisturizing Lotion SPF 30     | https://www.amazon.com/dp/B00F97FHAW |               |
| CeraVe PM          | CeraVe PM Facial Moisturizing Lotion            | https://www.amazon.com/dp/B00365DABC |               |
| Vitamin C serum    | CeraVe Vitamin C Serum 10%                      | https://www.amazon.com/dp/B07PNCCLD2 |               |
| Retinol serum      | CeraVe Anti-Aging Retinol Serum                 | https://www.amazon.com/dp/B07XJ7XWLW |               |
| Copper peptides    | The Ordinary Multi-Peptide + Copper Peptides 1% | https://www.amazon.com/dp/B0C9DXGXZ3 |               |
| Hair density serum | The Ordinary Multi-Peptide Hair Density Serum   | https://www.amazon.com/dp/B09WMT8HYB |               |
| Derma roller       | Derma Roller 540 Titanium Microneedle           | https://www.amazon.com/dp/B0B1DJ8LTR |               |
| Cocokind SPF 32    | Cocokind Daily SPF 32 Mineral Face Sunscreen    | https://www.amazon.com/dp/B08P4SD7V5 |               |

## Everything else

| Item                | Model (exact)                                        | Link                                 | Notes / story                                                                  |
| ------------------- | ---------------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------ |
| Detail trimmer      | Rechargeable Detail Trimmer                          | https://www.amazon.com/dp/B0BK93C994 | Personal grooming                                                              |
| Travel pillow       | Memory Foam Travel Pillow                            | https://www.amazon.com/dp/B0BV5WNWS8 | I use [rachet straps](https://www.amazon.com/dp/B0CC56RLS3) to keep it compact |
| Sun lamp, 10k lux   | KLEAH Light Therapy Sun Lamp, 10,000 Lux             | https://www.amazon.com/dp/B0BFWSHV7G | Circadian rhythm locked in                                                     |
| Airthings Wave Plus | Airthings 2930 Wave Plus Radon + Air Quality Monitor | https://www.amazon.com/dp/B07JB8QWH6 | Monitors CO₂, VOCs and Radon                                                   |
| Gooseneck kettle    | PARACITY Gooseneck Kettle, 12 oz Pour Over           | https://www.amazon.com/dp/B0B1TJ4KSP |                                                                                |
| Pourigami dripper   | MiiR Pourigami Collapsible Coffee Dripper            | https://www.amazon.com/dp/B0BGYJBJ4G | Great coffee no matter what                                                    |
| Timemore C2 grinder | TIMEMORE Chestnut C2 Manual Coffee Grinder           | https://www.amazon.com/dp/B0833SDN8M |                                                                                |
| Loop Quiet 2        | Loop Quiet 2 Reusable Earplugs, 24dB                 | https://www.amazon.com/dp/B0D3V61JC8 |                                                                                |
| Sleep mask          | Albatross 3D Contoured Cup Sleep Mask                | https://www.amazon.com/dp/B095C7H62X |                                                                                |
| BlenderBottle       | BlenderBottle Classic V2 Shaker, 28oz                | https://www.amazon.com/dp/B07TK681SZ |                                                                                |
| Laundry sheets      | ARM & HAMMER Power Sheets Laundry Detergent          | https://www.amazon.com/dp/B0DYCJ2LXF |                                                                                |
| Sonicare 2100       | Philips Sonicare 2100 Rechargeable Toothbrush        | https://www.amazon.com/dp/B09LD8PTNJ |                                                                                |
| Travel shaver       | MANSCAPED Handyman Compact Travel Shaver             | https://www.amazon.com/dp/B0C9LKH31T |                                                                                |
Two items still need something: the pocket knife needs its exact model name (photo is in already), and both new items (Nebo, knife) need a look at their grid size after the next render.


## Cody's real itinerary (source for cities, legs, and seasons)

Vitalia is in Roatán, Honduras. "NY" is New York. "YL" and "OC" are Yorba Linda / Orange County, California. "Edge City Patagonia" was a month in Patagonia, Chile. Use these as the city graph; group tiny stops into their hero city where sensible (e.g. Marseille/Hyères/Antibes/Cannes = the Riviera cluster, but keep them as separate nodes if it makes routing more interesting).

- 2026: Dec 27th - Dec 29th: La Paz
- 2026: Dec 29 - Dec 31st: Puerto San Carlos
- 2026: Dec 31st - Jan 5: La Ventana
- 2026: Jan 5th - Jan 13th: NY
- 2026: Jan 13th - Feb 13th: Miami
- 2026: Feb 15 - Mar 30th: Denver, Boulder, Tabernash
- 2026: Mar 30th - May 16th: NY
- 2026: May 16th - Jun 21st: Montana
- 2026: Jun 21st - Jun 30th: NY
- 2026: Jun 30th - Aug 16th: Boulder
- 2026: Aug 17th - Aug 22nd: Munich
- 2026: Aug 22nd - Aug 24th: Rotholz / Buch in Tirol
- 2026: Aug 24th - Sept 26th: Innsbruck
- 2026: Sept 27th - Oct 4th: Salzkammergut (Bad Goisern/Gosau)
- 2026: Oct 4th - Oct 17th: NY
- 2026: Nov 7th - Nov 22nd: Nepal, Manaslu Circuit
- 2025: Jan 1 - Apr 6th: Miami
- 2025: Apr 6th - Apr 25th: NY
- 2025: Apr 26th  - May 2nd: Madrid
- 2025: May 2nd - May 11th: Granada
- 2025: May 11 - 12th: Marseille
- 2025: May 12th - Jun 7th: Hyeres
- 2025: Jun 7th - Jun 28th: Antibes
- 2025: Jun 28 - Jul 6th: Cannes
- 2025: Jul 6 - Jul 19th: Aviemore
- 2025: Jul 19 - Aug 9th: Isle of Skye
- 2025: Aug 8th - Aug 9th: Oban
- 2025: Aug 9th - 16th: Glencoe
- 2025: Aug 16th - Aug 17th: Edinburgh
- 2025: Aug 17th - Aug 24th: Casablanca
- 2025: Aug 24th - Sep 14th: Dakhla
- 2025: Sep 13th - Sep 21st: Lisbon
- 2025: Sept 21th - Sept 27th: NY Team Onsite
- 2025: Sept 27th - Oct 5th: YL
- 2025: Oct 4th - 11th: NY
- 2025: Oct 11th - Oct 18th: Santiago
- 2025: Oct 18th - Nov 15th: Edge City Patagonia
- 2025: Nov 15 - Nov 28nd: DevConnect Buenos Aires
- 2025: Nov 30th - Dec 3rd: Joshua Tree
- 2025: Dec 3rd - ?: OC
- 2024: Jan 3 - Feb 10th: Vitalia (Roatán, Honduras)
- 2024: May 12th - May 18th: Carvoeiro (Airbnb)
- 2024: Car rental: May 12th - May 19th: #761885523
- 2024: May 18 - May 19th: Sintra (Airbnb)
- 2024: April 28th - May 4th: NY Onsite
- 2024: May 26 - July 6th: London
- 2024: July 6th - July 13th: Brussels
- 2024: July 13th - July 20th: Amsterdam
- 2024: July 20th - Aug 6th: NY
- 2024: Aug 6th - Aug 11th: Las Vegas
- 2024: Aug 11th - Sept 2nd: Boulder
- 2024: Sept 2nd - Sept 8th: NY
- 2024: Sept 8th - Sept 22nd: Montreal
- 2024: Sept 22 - Sept 28th: Miami
- 2024: Sept 28th - Oct 6th: Iceland
- 2024: Campervan Rental
- 2024: Itinerary
- 2024: Oct 6th - Oct 19th: Lisbon
- 2024: Oct 19th - Oct 26th: NY
- 2024: Oct 26th - Nov 2nd: Seoul
- 2024: Nov 2nd - Nov 10th: Chiang Mai
- 2024: Nov 10 - Nov 17th: Bangkok
- 2024: Nov 17 - 24: Hong Kong
- 2024: Nov 24 - Dec 14th: Tokyo, Minakami, Nikko
- 2024: Dec 14 - Dec 24th: Yorba Linda
- 2024: Dec 24th - Dec 28th: Boulder
- 2024: Dec 28th : Miami

## The nine real incidents (all must be events)

1. Tokyo: petted a sea otter at an animal café, a small cut got infected (paronychia), fever three days later, hospital.
2. Threw out his back from carrying too much weight.
3. An airline destroyed a suitcase wheel.
4. Checked baggage delayed, with something important inside.
5. A travel/capsule water kettle exploded: second-degree burns.
6. Food poisoning, many times.
7. Airbnb cancelled on the day of arrival.
8. Forgetting random things in Airbnbs and hotels.
9. Mosquito swarms in the south of France (Hyères).

## Tone

Deadpan, self-deprecating, first person travel-log. Never cruel. Example: "Day 41, Tokyo. You pet the otter. It was worth it. (Check Health.)"
