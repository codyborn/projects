// Drone level sets: which landscape the drone flies over in a city, and what lives in it.
// Selection is by explicit city id first, then by the city's hazard / climate / altitude (see pickSet).
import { PAL } from '../../core/palette';
import type { City } from '../../core/types';

export type SetId = 'coast' | 'city' | 'mountain' | 'desert' | 'jungle' | 'ice';
export type HazardKind = 'gull' | 'kiteline' | 'spray' | 'crane' | 'pigeon' | 'laundry' | 'eagle' | 'cliff' | 'cable' | 'updraft' | 'dust' | 'toucan' | 'plume' | 'mist' | 'geyser' | 'gust' | 'steam';
export type PropKind = 'palm' | 'umbrella' | 'cactus' | 'camel' | 'pine' | 'hut' | 'canopy' | 'vent' | 'rock' | 'antenna' | 'tank' | 'boat';
export type TerrainKind = 'flat' | 'roofs' | 'jagged' | 'dunes' | 'hills' | 'lava';

export interface DroneSet {
  id: SetId; name: string; tagline: string;
  sky: [number, number];                 // top / horizon colours
  far: number; farDark: number;          // distant silhouette layer
  ground: number; groundDark: number;    // near terrain fill / edge
  terrain: TerrainKind;
  water?: number;                        // sea / river band colour (coast, jungle)
  hazards: HazardKind[];                 // spawned from the right at intervals (weighted by order: first is most common)
  props: PropKind[];                     // decoration on the terrain
}

export const SETS: Record<SetId, DroneSet> = {
  coast:    { id: 'coast', name: 'THE COAST', tagline: 'gulls, kite lines, spray off the reef', sky: [PAL.sky1, PAL.sky3], far: PAL.sea1, farDark: PAL.sea0, ground: PAL.earth3, groundDark: PAL.earth2, terrain: 'flat', water: PAL.sea2, hazards: ['gull', 'gull', 'kiteline', 'spray'], props: ['palm', 'umbrella', 'boat'] },
  city:     { id: 'city', name: 'THE CITY', tagline: 'rooftops, cranes, laundry lines, pigeons', sky: [PAL.night3, PAL.dusk3], far: PAL.night2, farDark: PAL.night1, ground: PAL.gray0, groundDark: PAL.ink, terrain: 'roofs', hazards: ['pigeon', 'crane', 'laundry', 'pigeon'], props: ['antenna', 'tank'] },
  mountain: { id: 'mountain', name: 'THE MOUNTAINS', tagline: 'updrafts, cliffs, eagles, a cable car', sky: [PAL.sky0, PAL.sky2], far: PAL.gray1, farDark: PAL.gray0, ground: PAL.grass0, groundDark: PAL.earth0, terrain: 'jagged', hazards: ['eagle', 'cliff', 'updraft', 'cable'], props: ['pine', 'rock', 'hut'] },
  desert:   { id: 'desert', name: 'THE DESERT', tagline: 'dust devils over the dunes, camels below', sky: [PAL.sun1, PAL.sun3], far: PAL.earth2, farDark: PAL.earth1, ground: PAL.sun2, groundDark: PAL.earth2, terrain: 'dunes', hazards: ['dust', 'dust', 'updraft', 'gull'], props: ['cactus', 'camel', 'rock'] },
  jungle:   { id: 'jungle', name: 'THE JUNGLE', tagline: 'toucans, mist, spray off the falls', sky: [PAL.grass1, PAL.grass3], far: PAL.grass0, farDark: PAL.night2, ground: PAL.grass1, groundDark: PAL.grass0, terrain: 'hills', water: PAL.sea3, hazards: ['toucan', 'plume', 'mist', 'toucan'], props: ['canopy', 'canopy', 'hut'] },
  ice:      { id: 'ice', name: 'FIRE AND ICE', tagline: 'geysers, steam, gusts off the glacier', sky: [PAL.night2, PAL.sky2], far: PAL.gray2, farDark: PAL.gray1, ground: PAL.gray0, groundDark: PAL.ink, terrain: 'lava', water: PAL.sky3, hazards: ['geyser', 'gust', 'steam', 'geyser'], props: ['vent', 'rock'] },
};

/** Cities whose landscape is not what the hazard / climate would suggest. */
const BY_ID: Record<string, SetId> = {
  dakhla: 'desert', lasvegas: 'desert', joshuatree: 'desert',
  reykjavik: 'ice', patagonia: 'ice',
  iguazu: 'jungle', roatan: 'jungle', chiangmai: 'jungle',
  laventana: 'coast', lapaz: 'coast', hyeres: 'coast', miami: 'coast', orangecounty: 'coast',
  montreal: 'city', casablanca: 'city', santiago: 'city',
  granada: 'mountain', highlands: 'mountain',
};

/** Which set a city flies. Explicit table first; then alpine / high / rocky = mountain, waves = coast, hot mosquitoes = jungle,
 *  urban hazards (pigeon, tram, crowd, tuk-tuk, otter) = city, gusts = ice when cold else coast; anything else = coast. */
export function pickSet(city?: Partial<City> | null): SetId {
  if (!city) return 'coast';
  if (city.id && BY_ID[city.id]) return BY_ID[city.id];
  const hz = city.hazard;
  if (city.climate === 'alpine' || (city.altitude ?? 0) >= 1000 || hz === 'rock' || hz === 'snow' || hz === 'yak' || hz === 'ice') return 'mountain';
  if (hz === 'wave') return 'coast';
  if (hz === 'mosquito' && city.climate === 'hot') return 'jungle';
  if (hz === 'pigeon' || hz === 'tram' || hz === 'crowd' || hz === 'tuktuk' || hz === 'otter') return 'city';
  if (hz === 'gust') return city.climate === 'cold' ? 'ice' : 'coast';
  return 'coast';
}

// ---------- terrain ----------
const h32 = (a: number, b: number) => { let h = (a * 374761393 + b * 668265263) >>> 0; h = (h ^ (h >>> 13)) * 1274126177 >>> 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
/** smooth value noise in [0,1] over world x with cell size `cell` */
function vnoise(wx: number, cell: number, seed: number) { const i = Math.floor(wx / cell), f = wx / cell - i; const a = h32(i, seed), b = h32(i + 1, seed); const t = f * f * (3 - 2 * f); return a + (b - a) * t; }

/** Height of the near terrain above the baseline (px) at world x. Kept between 8 and 70 so the flight lane stays open. */
export function terrainH(kind: TerrainKind, wx: number, seed: number): number {
  switch (kind) {
    case 'flat': return 10 + 4 * Math.sin(wx / 50) + 6 * vnoise(wx, 120, seed);
    case 'dunes': return 16 + 22 * vnoise(wx, 140, seed) + 10 * vnoise(wx + 40, 55, seed + 1);
    case 'hills': return 18 + 26 * vnoise(wx, 110, seed) + 8 * vnoise(wx, 33, seed + 2);
    case 'lava': return 12 + 14 * vnoise(wx, 70, seed) + (vnoise(wx, 25, seed + 3) > 0.8 ? 10 : 0);
    case 'jagged': { const n = vnoise(wx, 90, seed); return 14 + 46 * Math.pow(n, 1.4) + 8 * vnoise(wx, 21, seed + 4); }
    case 'roofs': { const i = Math.floor(wx / 56); const gap = (wx / 56 - i) > 0.86; return gap ? 6 : 18 + 44 * h32(i, seed); }
  }
}
/** Distant silhouette height (parallax layer). */
export function farH(kind: TerrainKind, wx: number, seed: number): number {
  switch (kind) {
    case 'roofs': { const i = Math.floor(wx / 34); return 40 + 70 * h32(i, seed + 9); }
    case 'jagged': return 50 + 80 * Math.pow(vnoise(wx, 160, seed + 9), 1.3);
    case 'dunes': return 30 + 30 * vnoise(wx, 220, seed + 9);
    case 'hills': return 50 + 40 * vnoise(wx, 150, seed + 9);
    case 'lava': return 36 + 60 * Math.pow(vnoise(wx, 130, seed + 9), 2);
    default: return 24 + 16 * vnoise(wx, 260, seed + 9);
  }
}
/** Deterministic prop at a world slot (every 72 px), or null. */
export function propAt(set: DroneSet, slot: number, seed: number): PropKind | null {
  const r = h32(slot, seed + 21); if (r < 0.42) return null;
  return set.props[Math.floor(h32(slot, seed + 22) * set.props.length)];
}
export { h32 };
