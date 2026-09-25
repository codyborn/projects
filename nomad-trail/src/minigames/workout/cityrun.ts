// CITY RUN: a Frogger-style crossing for dense cities. Cyclists, cabs and buses instead of rocks and branches.
import { PAL } from '../../core/palette';
import { W, clamp } from '../_shared';
import { Micro } from './micro';
import { META } from './pools';

type LaneKind = 'bike' | 'car' | 'bus';
interface Lane { kind: LaneKind; y: number; dir: 1 | -1; speed: number; cars: { x: number; w: number; color: number }[]; gap: number; next: number; }
const TOP = 70, BOTTOM = 470, LANE_H = 56, LANES = 6;   // sidewalks at TOP-40..TOP and BOTTOM..BOTTOM+40
const COLS = 5, COL_W = 56, COL0 = W / 2 - 2 * COL_W;

const PH = 5, PV = 7;   // player hitbox half-size: the 19 x 26 px runner shrunk 25% a side
export class CityRun extends Micro {
  readonly id = 'cityrun'; readonly word = META.cityrun.word; readonly instr = META.cityrun.instr; readonly durationSec = META.cityrun.durationSec;
  private lane = LANES; private col = 2; private crossings = 0; private hits = 0; private need = 2; /* two crossings per 9 s round (was 3) */ private lanes: Lane[] = []; private traffic = 1; private inv = 0; private busy = false; private lock = 0.35; private pd?: { x: number; y: number }; private handlers: Array<[string, (...a: any[]) => void]> = [];
  private laneY(i: number) { return TOP + i * LANE_H + LANE_H / 2; }   // i = 0..LANES-1 are traffic lanes; i = LANES is the near sidewalk, -1 the far one
  private runnerY(i: number) { return i >= LANES ? BOTTOM + 22 : i < 0 ? TOP - 20 : this.laneY(i); }
  protected begin() {
    const rng = this.ctx.rng; const kinds: LaneKind[] = ['bike', 'car', 'bus', 'car', 'bike', 'car'];
    this.lanes = kinds.map((kind, i) => { const dir: 1 | -1 = i % 2 ? -1 : 1; const speed = (kind === 'bike' ? 110 : kind === 'car' ? 78 : 45) * this.ctx.speed * (0.9 + rng() * 0.3); /* 35% slower than the first cut; cyclists fastest, buses slowest */ return { kind, y: this.laneY(i), dir, speed, cars: [], gap: kind === 'bus' ? 260 : kind === 'bike' ? 110 : 150, next: 0 }; });
    // pre-fill so the road is busy from the first frame
    for (const L of this.lanes) { let x = -60 + rng() * 120; while (x < W + 60) { this.spawn(L, x); x += L.gap * (0.8 + rng() * 0.6); } }
    const ath = this.ctx.athlete; ath.at(this.colX(), this.runnerY(this.lane)).pose(0).show(true); ath.sprite.setDepth(6).setScale(0.4);   // the athlete texture is already 4x (48 x 64); 0.4 -> ~19 x 26 px, fits a 56 px lane with margin
    const step = (dl: number, dc: number) => { if (this.busy || this.lock > 0) return; this.lock = 0.18; this.lane = clamp(this.lane + dl, -1, LANES); this.col = clamp(this.col + dc, 0, COLS - 1); ath.pose(dl ? 2 : 3); this.after(120, () => ath.pose(0));
      if (this.lane < 0) { this.crossings++; this.pop(W / 2, TOP + 20, 'CROSSED', PAL.neon); this.traffic += 0.08; this.ctx.frame.setProgress(`${this.crossings}/${this.need} crossings`); if (this.crossings >= this.need) { this.after(200, () => this.finish(this.scoreNow())); return; } this.busy = true; this.after(350, () => { this.lane = LANES; this.col = 2; this.busy = false; }); } };
    // one gesture = one move: decide tap vs swipe on pointer UP so a swipe never also counts as a tap; keyboard SPACE advances
    this.onTap(p => { if (!p) step(-1, 0); });
    const inp = this.ctx.scene.input; const down = (p: Phaser.Input.Pointer) => { this.pd = { x: p.x, y: p.y }; };
    const up = (p: Phaser.Input.Pointer) => { const d = this.pd; this.pd = undefined; if (!d) return; const dx = p.x - d.x, dy = p.y - d.y; if (Math.abs(dx) > 20 || Math.abs(dy) > 20) { if (Math.abs(dy) >= Math.abs(dx)) { if (dy < 0) step(-1, 0); else if (this.lane < LANES) step(1, 0); } else step(0, dx < 0 ? -1 : 1); } else { if (p.x < W / 3) step(0, -1); else if (p.x > (2 * W) / 3) step(0, 1); else step(-1, 0); } };
    inp.on('pointerdown', down); inp.on('pointerup', up); this.handlers.push(['pointerdown', down], ['pointerup', up]);
    (this as any).autoSafe = () => { if (this.busy || this.lock > 0 || this.lane < 0) return; const rx = this.colX();
      const clear = (li: number, ahead: number) => { if (li < 0 || li >= LANES) return true; const L = this.lanes[li]; const v = L.speed * this.traffic * L.dir; return L.cars.every(c => { const x0 = Math.min(c.x + c.w * 0.25, c.x + c.w * 0.25 + v * ahead), x1 = Math.max(c.x + c.w * 0.75, c.x + c.w * 0.75 + v * ahead); return x1 < rx - 40 || x0 > rx + 40; }); };
      if (clear(this.lane - 1, 0.7)) { step(-1, 0); return; }
      if (this.lane < LANES && !clear(this.lane, 0.45) && clear(this.lane + 1, 0.7)) step(1, 0); };
    this.loop(dt => {
      for (const L of this.lanes) { const v = L.speed * this.traffic * L.dir; for (const c of L.cars) c.x += v * dt; L.cars = L.cars.filter(c => c.x > -220 && c.x < W + 220);
        const edge = L.dir > 0 ? Math.min(...L.cars.map(c => c.x), W + 100) : Math.max(...L.cars.map(c => c.x + c.w), -100);
        if (L.dir > 0 ? edge > L.gap * (0.8 + rng() * 0.5) : edge < W - L.gap * (0.8 + rng() * 0.5)) this.spawn(L, L.dir > 0 ? -160 : W + 20); }
      if (this.inv > 0) this.inv -= dt; if (this.lock > 0) this.lock -= dt;
      const rx = this.colX(), ry = this.runnerY(this.lane); ath.at(rx, ry); ath.sprite.setScale(0.4);
      if (this.lane >= 0 && this.lane < LANES && this.inv <= 0 && !this.busy) { const L = this.lanes[this.lane]; for (const c of L.cars) if (c.x + c.w * 0.25 < rx + PH && c.x + c.w * 0.75 > rx - PH) { /* tight boxes: 25% off every side, overlap only */ this.hits++; this.inv = 0.8; this.ctx.frame.shake(160, 0.007); this.pop(rx, ry - 40, L.kind === 'bike' ? 'CYCLIST!' : L.kind === 'bus' ? 'BUS!' : 'CAB!', PAL.red); this.busy = true; this.after(300, () => { this.lane = LANES; this.col = 2; this.busy = false; }); if (this.hits >= 3) { this.after(350, () => this.finish(this.scoreNow())); } break; } }
      this.draw(ath.sprite); if (this.t >= this.durationSec) this.finish(this.scoreNow()); });
    this.ctx.frame.setProgress(`0/${this.need} crossings`);
  }
  private colX() { return COL0 + this.col * COL_W; }
  private spawn(L: Lane, x: number) { const rng = this.ctx.rng; const w = L.kind === 'bus' ? 120 + rng() * 30 : L.kind === 'bike' ? 26 : 52 + rng() * 10; const color = L.kind === 'car' ? (rng() < 0.7 ? PAL.sun2 : PAL.gray2) : L.kind === 'bus' ? PAL.sky0 : PAL.dusk2; L.cars.push({ x, w, color }); }
  private draw(runner: Phaser.GameObjects.Image) {
    const g = this.g; g.clear(); g.fillStyle(PAL.night2).fillRect(0, 26, W, 640);
    // sidewalks
    g.fillStyle(PAL.gray1).fillRect(0, TOP - 44, W, 44); g.fillStyle(PAL.gray1).fillRect(0, BOTTOM, W, 46); g.fillStyle(PAL.gray0).fillRect(0, TOP - 4, W, 4); g.fillStyle(PAL.gray0).fillRect(0, BOTTOM, W, 4);
    for (let x = 0; x < W; x += 24) { g.fillStyle(PAL.gray2, 0.5).fillRect(x, TOP - 44, 1, 44); g.fillStyle(PAL.gray2, 0.5).fillRect(x, BOTTOM, 1, 46); }
    // road + lane markings
    g.fillStyle(PAL.gray0).fillRect(0, TOP, W, LANES * LANE_H);
    for (let i = 1; i < LANES; i++) { const y = TOP + i * LANE_H; const bikeEdge = this.lanes[i].kind === 'bike' || this.lanes[i - 1].kind === 'bike'; if (bikeEdge) g.fillStyle(PAL.grass1, 0.9).fillRect(0, y - 1, W, 2); else for (let x = 0; x < W; x += 28) g.fillStyle(PAL.gray2, 0.8).fillRect(x, y - 1, 14, 2); }
    for (const L of this.lanes) if (L.kind === 'bike') g.fillStyle(PAL.grass0, 0.35).fillRect(0, L.y - LANE_H / 2 + 2, W, LANE_H - 4);
    // crosswalk stripes on the runner's column
    const cx = this.colX(); for (let y = TOP + 6; y < BOTTOM; y += 14) g.fillStyle(PAL.white, 0.12).fillRect(cx - 20, y, 40, 7);
    // vehicles
    for (const L of this.lanes) for (const c of L.cars) { const y = L.y;
      if (L.kind === 'bike') { g.fillStyle(PAL.ink).fillCircle(c.x + 6, y + 8, 6); g.fillStyle(PAL.ink).fillCircle(c.x + 20, y + 8, 6); g.fillStyle(c.color).fillRect(c.x + 6, y - 2, 14, 4); g.fillStyle(PAL.earth3).fillRect(c.x + 10, y - 12, 6, 6); g.fillStyle(PAL.sun0).fillRect(c.x + 9, y - 7, 8, 6); }
      else { g.fillStyle(PAL.ink).fillRect(c.x - 1, y - 13, c.w + 2, 26); g.fillStyle(c.color).fillRect(c.x, y - 12, c.w, 24); g.fillStyle(PAL.sky3, 0.9).fillRect(c.x + (L.kind === 'bus' ? 8 : c.w * 0.3), y - 9, L.kind === 'bus' ? c.w - 16 : c.w * 0.4, 8); g.fillStyle(PAL.ink).fillRect(c.x + 6, y + 10, 8, 4); g.fillStyle(PAL.ink).fillRect(c.x + c.w - 14, y + 10, 8, 4); if (L.kind === 'car' && c.color === PAL.sun2) g.fillStyle(PAL.ink).fillRect(c.x + c.w / 2 - 5, y - 15, 10, 3); g.fillStyle(L.dir > 0 ? PAL.red : PAL.sun3).fillRect(L.dir > 0 ? c.x : c.x + c.w - 3, y - 6, 3, 12); } }
    runner.setAlpha(this.inv > 0 && Math.floor(this.t * 12) % 2 ? 0.4 : 1);
    if ((window as any).__hitboxes) { g.lineStyle(1, PAL.neon, 1); const rx = this.colX(), ry = this.runnerY(this.lane); g.strokeRect(rx - PH, ry - PV, PH * 2, PV * 2); g.lineStyle(1, PAL.red, 1); for (const L of this.lanes) for (const c of L.cars) g.strokeRect(c.x + c.w * 0.25, L.y - 9, c.w * 0.5, 18); }
  }
  protected scoreNow() { const progress = this.lane >= LANES ? 0 : this.lane < 0 ? 1 : (LANES - this.lane) / LANES; return clamp((this.crossings + progress * 0.9) / this.need - this.hits * 0.18, 0, 1); }
  destroy() { const inp = this.ctx.scene.input; for (const [ev, fn] of this.handlers) inp.off(ev, fn); this.handlers = []; this.ctx.athlete.sprite.setAlpha(1).setDepth(5).setScale(1); super.destroy(); }
}
