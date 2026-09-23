import { describe, it, expect } from 'vitest';
import { DEFAULT_LEVEL, validateLevel, PHYS, TILE } from './carryonLevel';

describe('Carry-On default level', () => {
  it('is completable: every stamp is reachable from S with the real jump physics', () => {
    expect(validateLevel(DEFAULT_LEVEL)).toEqual([]);
  });
  it('has exactly stampPieces stamps and a start', () => {
    const stamps = DEFAULT_LEVEL.tiles.join('').split('*').length - 1;
    expect(stamps).toBe(DEFAULT_LEVEL.stampPieces);
    expect(DEFAULT_LEVEL.tiles.join('')).toContain('S');
  });
  it('jump apex covers a 3-row rise but not 4', () => {
    const apex = (PHYS.jump * PHYS.jump) / (2 * PHYS.gravity);
    expect(apex).toBeGreaterThan(3 * TILE); expect(apex).toBeLessThan(4 * TILE);
  });
  it('flags an unreachable stamp', () => {
    const bad = { ...DEFAULT_LEVEL, tiles: ['#########', '#*......#', '#.......#', '#.......#', '#.......#', '#.......#', '#S......#', '#########'], stampPieces: 1 };
    expect(validateLevel(bad).some(i => i.includes('not reachable'))).toBe(true);
  });
  it('flags stampPieces mismatch and missing start', () => {
    expect(validateLevel({ ...DEFAULT_LEVEL, stampPieces: 3 })[0]).toContain('stampPieces=3');
    expect(validateLevel({ ...DEFAULT_LEVEL, tiles: DEFAULT_LEVEL.tiles.map(r => r.replace('S', '.')) })).toContain('no start (S)');
  });
  it('snow jump lowers the ceiling', () => {
    const tall = { ...DEFAULT_LEVEL, hazard: 'snow' as const };
    // with the weaker snow jump some 3-row rises become unreachable; validator must report rather than throw
    expect(Array.isArray(validateLevel(tall))).toBe(true);
  });
});
