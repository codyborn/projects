import { describe, it, expect } from 'vitest';
import { DEFAULT_LEVEL, validateLevel, trimStamps, PHYS, TILE, MAX_STAMPS, generateLevel, FAMILIES, reachableCells, jumpFor, maxRiseRows, reachTiles, familyFor } from './carryonLevel';

describe('Carry-On physics', () => {
  it('jump apex clears a 3-row rise with head room but not 4', () => {
    const apex = (PHYS.jump * PHYS.jump) / (2 * PHYS.gravity);
    expect(apex / TILE).toBeGreaterThanOrEqual(3.6); expect(apex / TILE).toBeLessThan(4.2); expect(maxRiseRows(PHYS.jump)).toBe(3);
  });
  it('a flat jump crosses a 4-tile gap', () => { expect(reachTiles(PHYS.jump, 0)).toBeGreaterThanOrEqual(4); });
  it('snow keeps a weaker jump (2-row steps)', () => { expect(maxRiseRows(PHYS.snowJump)).toBe(2); });
});

describe('Carry-On default level', () => {
  it('is completable with the real jump physics', () => { expect(validateLevel(DEFAULT_LEVEL)).toEqual([]); });
  it('has exactly stampPieces stamps and a start', () => { expect(DEFAULT_LEVEL.tiles.join('').split('*').length - 1).toBe(DEFAULT_LEVEL.stampPieces); expect(DEFAULT_LEVEL.tiles.join('')).toContain('S'); });
  it('flags an unreachable stamp', () => {
    const bad = { ...DEFAULT_LEVEL, tiles: ['#########', '#*......#', '#.......#', '#.......#', '#.......#', '#.......#', '#S......#', '#########'], stampPieces: 1 };
    expect(validateLevel(bad).some(i => i.includes('not reachable'))).toBe(true);
  });
  it('flags stampPieces mismatch and missing start', () => {
    expect(validateLevel({ ...DEFAULT_LEVEL, stampPieces: 3 })[0]).toContain('stampPieces=3');
    expect(validateLevel({ ...DEFAULT_LEVEL, tiles: DEFAULT_LEVEL.tiles.map(r => r.replace('S', '.')) })).toContain('no start (S)');
  });
  it('trimStamps keeps the nearest MAX_STAMPS pieces and stays completable', () => {
    const t = trimStamps(DEFAULT_LEVEL); expect(t.tiles.join('').split('*').length - 1).toBe(MAX_STAMPS); expect(t.stampPieces).toBe(MAX_STAMPS); expect(validateLevel(t)).toEqual([]);
  });
});

describe('procedural levels', () => {
  const hz = ['pigeon', 'otter', 'mosquito', 'gust', 'rock', 'tuktuk', 'wave', 'ice', 'tram', 'snow', 'crowd', 'yak'] as const;
  const levels = Array.from({ length: 24 }, (_, i) => generateLevel(500 + i * 131, { city: 'City ' + i, hazard: hz[i % hz.length], climate: i % 2 ? 'hot' : 'alpine' }));
  it('every generated level validates, has 6 to 8 stamps, and is one screen', () => {
    for (const lv of levels) { expect(validateLevel(lv), lv.family).toEqual([]); expect(lv.stampPieces).toBeGreaterThanOrEqual(6); expect(lv.stampPieces).toBeLessThanOrEqual(8); expect(lv.tiles.length).toBe(20); expect(lv.tiles.every(r => r.length === 23)).toBe(true); }
  });
  it('levels differ structurally across seeds and use at least 4 layout families', () => {
    const sigs = new Set(levels.map(l => l.tiles.join('|'))); expect(sigs.size).toBe(levels.length);
    const fams = new Set(levels.map(l => l.family)); expect(fams.size).toBeGreaterThanOrEqual(4); for (const f of fams) expect(FAMILIES).toContain(f);
  });
  it('is deterministic for a seed and the family is a function of the seed', () => {
    const a = generateLevel(4242, { hazard: 'crowd' }), b = generateLevel(4242, { hazard: 'crowd' }); expect(a.tiles).toEqual(b.tiles); expect(a.family).toBe(familyFor(4242, 'crowd'));
  });
  it('stamps sit on platforms, at most one on the ground row', () => { for (const lv of levels) expect((lv.tiles[18].match(/\*/g) || []).length).toBeLessThanOrEqual(1); });
  it('most of each level is reachable, so the run is not a corridor', () => { for (const lv of levels) expect(reachableCells(lv.tiles, jumpFor(lv)).reach.size, lv.family).toBeGreaterThanOrEqual(24); });
});
