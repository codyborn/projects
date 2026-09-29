import { describe, it, expect } from 'vitest';
import { makeRng } from '../../core/sim/rng';
import { WHEEL, pocketColor, rouletteRTP, rouletteNet, spinWheel, REEL, slotRTP, slotReturn, pullReels, PULL_COST, scoreFor } from './tables';

describe('casino tables', () => {
  it('the wheel has 37 pockets, 18 red, 18 black, one green', () => {
    expect(WHEEL.length).toBe(37); expect(new Set(WHEEL).size).toBe(37);
    const cols = WHEEL.map(pocketColor); expect(cols.filter(c => c === 'red').length).toBe(18); expect(cols.filter(c => c === 'black').length).toBe(18); expect(cols.filter(c => c === 'green').length).toBe(1);
  });
  it('roulette: every bet returns 97.3% exactly (EV -2.7%)', () => {
    for (const k of ['red', 'black', 'odd', 'even', 'number'] as const) expect(rouletteRTP(k)).toBeCloseTo(36 / 37, 6);
  });
  it('roulette Monte Carlo: 10,000 spins of mixed bets land between -1% and -8%', () => {
    const rng = makeRng(2024); let staked = 0, net = 0;
    for (let i = 0; i < 10000; i++) { const bets = [{ kind: 'red' as const, amount: 50 }, { kind: 'odd' as const, amount: 25 }, { kind: 'number' as const, amount: 25, number: i % 37 }]; staked += 100; net += rouletteNet(bets, WHEEL[spinWheel(rng)]); }
    const ev = net / staked; expect(ev).toBeLessThan(-0.01); expect(ev).toBeGreaterThan(-0.08);
  });
  it('slots: exact return is about 92% (EV between -1% and -8%)', () => {
    expect(REEL.length).toBe(20); const rtp = slotRTP(); expect(rtp).toBeLessThan(0.99); expect(rtp).toBeGreaterThan(0.92);
    expect(slotReturn(['seven', 'seven', 'seven'])).toBe(60 * PULL_COST); expect(slotReturn(['cherry', 'bar', 'cherry'])).toBe(PULL_COST); expect(slotReturn(['cherry', 'bar', 'uni'])).toBe(0);
  });
  it('slots Monte Carlo: 100,000 pulls agree with the exact return within 3 points', () => {
    const rng = makeRng(7); let back = 0; const n = 100000;
    for (let i = 0; i < n; i++) { const s = pullReels(rng); back += slotReturn([REEL[s[0]], REEL[s[1]], REEL[s[2]]]); }
    expect(Math.abs(back / (n * PULL_COST) - slotRTP())).toBeLessThan(0.03);
  });
  it('score maps net money onto the frame: bust reads FAILED, a good night reads PERFECT', () => {
    expect(scoreFor(0)).toBe(50); expect(scoreFor(-1500)).toBe(0); expect(scoreFor(1200)).toBe(100); expect(scoreFor(300)).toBe(65);
  });
});
