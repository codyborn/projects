import { describe, it, expect } from 'vitest';
import { ShakeDetector } from './motion';
describe('shake detector', () => {
  it('counts direction reversals above the threshold and ignores small or same-direction motion', () => {
    const d = new ShakeDetector(12, 80); const dirs: number[] = []; d.onShake = dir => dirs.push(dir); let t = 0;
    d.feed({ x: 15, y: 0, z: 0 }, undefined, t += 100); d.feed({ x: 16, y: 0, z: 0 }, undefined, t += 100);   // same direction: one shake
    d.feed({ x: -15, y: 0, z: 0 }, undefined, t += 100); d.feed({ x: 3, y: 2, z: 0 }, undefined, t += 100);    // reversal, then a small wobble
    d.feed({ x: 14, y: 0, z: 0 }, undefined, t += 20);                                                          // too soon after the last one
    d.feed({ x: 14, y: 0, z: 0 }, undefined, t += 200);
    expect(d.count).toBe(3); expect(dirs).toEqual([1, -1, 1]); expect(d.state).toBe('yes');
  });
  it('an all-null sample (no sensor) does not count as motion', () => { const d = new ShakeDetector(); d.feed({ x: null, y: null, z: null }, { x: null, y: null, z: null }, 0); expect(d.state).toBe('unknown'); });
  it('falls back to the gravity-including vector minus g when the gravity-free one is missing', () => {
    const d = new ShakeDetector(12, 80); d.feed(undefined, { x: 0, y: 0, z: 9.81 }, 0); expect(d.count).toBe(0);
    d.feed(undefined, { x: 0, y: 0, z: 9.81 + 14 }, 200); d.feed(undefined, { x: 0, y: 0, z: -(9.81 + 14) }, 400); expect(d.count).toBe(2);
  });
});
