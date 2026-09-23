# Art / audio API (ART agent)

Call `generateAllArt(scene)` once in BootScene (from `src/art`). Idempotent. Then:

## Fonts
- BitmapFont keys `pix` (6x8 cell, 5x7 glyph) and `pix2` (2x). `ptext(scene,x,y,text,color,size 1|2)` returns a tinted BitmapText. `wrap(text, maxChars)`. Char `~` renders a coffee cup.

## Sprites (texture keys)
- Nomad sheets `nomad_<variant>` variants: base, suitcase, brokenwheel, limp, shell, shell_suitcase. 24x32. Anims `nomad_<variant>_idle`, `nomad_<variant>_walk`.
- Bags: `suitcase` (40x56), `suitcase_broken`, `backpack` (32x40).
- Transport (48x20): `tr_plane tr_train tr_bus tr_ferry tr_campervan tr_trek tr_car` (matches `Transport` type: `'tr_' + transport`).
- Stat icons 10x10: `ic_heart ic_bolt ic_smile ic_shirt ic_weight ic_day ic_coffee ic_bag ic_pack ic_gold ic_mute ic_sound`.
- `itemIcon(scene,item)` -> `item_<id>` 16x16. `itemTile(scene,item,cellPx)` -> `itemtile_<id>_<cell>` sized w*cell x h*cell for the packing grid.
- `stampTexture(scene, city, gold)` -> `stamp_<id>_plain|gold` 44x44. `drawStampGlyph(ctx, iconKey, cx, cy, color)` glyph keys: palm skyline tram mountain peak torii whale kite wave stupa dune aurora cactus dome castle temple tower lake barn flatiron dice leaf bridge sun (default: globe).
- Coffee kit: `cf_grinder` (2 frames), `cf_kettle`, `cf_dripper`, `cf_cup` (5 fill frames), `cf_steam`, `dot`, `px1`.

## Skylines
`buildSkyline(scene, cityIdOrRegion, tod:'dawn'|'day'|'dusk'|'night', climate, w=360, h=640, horizonY=0.62h, region?) -> Skyline { container, layers, sky, horizonY, scroll(dx), update(dt), setTimeOfDay(t), destroy() }`. Call `update(dt)` each frame for rain/neon; `scroll(dx)` for parallax (travel scenes). Unknown ids fall back via aliases then region. `SKYLINE_KEYS` lists the hero drawers (~40 cities).

## Globe
`drawGlobe(scene,cx,cy,r,cities,visitedIds,currentId,routeIds,rotation) -> { image, redraw(rot,...), project(lat,lon,rot), rotationFor(lon), pulse(dt), destroy() }`. `renderGlobe(ctx,...)` and `globeCanvas(size,...)` for offscreen use. Tilt fixed at 0.35 rad.

## Audio (`src/audio/synth.ts`)
`Audio.init()` inside the first pointerdown. `Audio.playSfx(name)`: blip confirm back stamp pop coin hurt jump whoosh chop sizzle plane chime pour grind win lose. `Audio.playLoop(name)`: alps asia mexico europe africa americas himalaya night title none (crossfades). `REGION_LOOP[region]` maps `Region` -> loop. `Audio.toggleMuted()` persists in `SETTINGS_KEY`.

## Scenes provided
- `CoffeeScene` key `Coffee`: `scene.launch('Coffee', { cityId, day, climate, region, onDone })`. ~4.5s, tap to skip.
- `PassportScene` key `Passport`: `scene.launch('Passport', { onClose })`; reads registry `run` (RunState) and `cities` (City[]).
- `ShareScene` key `Share`: `scene.start('Share', { onBack })`; `renderShareCard(state,cities,settings)` / `shareOrDownload(canvas)` in `src/share/shareCard.ts`.

Integrator: register these three scenes in `src/game.ts`; set `registry.set('cities', citiesJson)` at boot.
