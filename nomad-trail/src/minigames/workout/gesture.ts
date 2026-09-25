import Phaser from 'phaser';
// Gesture micro-games: swipes, chains, rhythm, pose matching.
import { PAL } from '../../core/palette';
import { W, clamp, pixTexture } from '../_shared';
import { Micro } from './micro';
import { META } from './pools';

/** CURLS: an arrow appears on the left or right; swipe UP on that side before it fades. Sequences get faster. */
export class Curls extends Micro {
  readonly id = 'curls'; readonly word = META.curls.word; readonly instr = META.curls.instr; readonly durationSec = META.curls.durationSec;
  private side: -1 | 1 | 0 = 0; private life = 0; private need = 6; private hits = 0; private misses = 0; private ttl = 1.2;
  protected begin() {
    const cx = W / 2; this.ctx.athlete.at(cx, 330).pose(0).show(true); this.ttl = (1.25 * this.ctx.window + 0.45) / this.ctx.speed;
    const spawn = () => { this.side = this.ctx.rng() < 0.5 ? -1 : 1; this.life = this.ttl; };
    const resolve = (ok: boolean) => { if (ok) { this.hits++; this.pop(cx + this.side * 90, 250, 'CURL'); this.ctx.athlete.pose(2); } else { this.misses++; this.pop(cx, 250, 'MISS', PAL.red); this.ctx.frame.shake(100, 0.004); }
      this.side = 0; this.ttl *= 0.9; this.ctx.frame.setProgress(`${this.hits}/${this.need}`); if (this.hits + this.misses >= this.need) this.after(300, () => this.finish(this.scoreNow())); else this.after(280, () => { this.ctx.athlete.pose(0); spawn(); }); };
    this.onSwipe((dir, p) => { if (this.side === 0 || dir !== 'up') return; const s = p.x < W / 2 ? -1 : 1; resolve(s === this.side); });
    this.key('keydown-LEFT', () => { if (this.side) resolve(this.side === -1); }); this.key('keydown-RIGHT', () => { if (this.side) resolve(this.side === 1); });
    this.after(300, spawn);
    this.loop(dt => { if (this.side) { this.life -= dt; if (this.life <= 0) resolve(false); }
      this.g.clear(); this.backdrop(380, 400); this.g.lineStyle(1, PAL.night3).lineBetween(cx, 40, cx, 620);
      if (this.side) { const a = clamp(this.life / this.ttl, 0, 1); const x = cx + this.side * 90; this.g.fillStyle(PAL.sun2, a).fillTriangle(x, 200, x - 26, 240, x + 26, 240); this.g.fillStyle(PAL.sun2, a).fillRect(x - 8, 240, 16, 30); this.g.fillStyle(PAL.ink).fillRect(x - 30, 285, 60, 4); this.g.fillStyle(PAL.neon).fillRect(x - 30, 285, 60 * a, 4); } });
  }
  protected scoreNow() { return clamp(this.hits / this.need, 0, 1); }
}

/** BURPEE CHAIN: quick-time chain of gestures (tap / swipe up / swipe down / hold) with a shrinking timer per prompt. */
export class Burpee extends Micro {
  readonly id = 'burpee'; readonly word = META.burpee.word; readonly instr = META.burpee.instr; readonly durationSec = META.burpee.durationSec;
  private chain: ('tap' | 'up' | 'down' | 'hold')[] = []; private i = 0; private life = 0; private ttl = 1.3; private hits = 0; private holdT = 0; private holding = false;
  protected begin() {
    const cx = W / 2; this.ctx.athlete.at(cx, 330).pose(0).show(true); const kinds = ['tap', 'up', 'down', 'hold'] as const; this.chain = Array.from({ length: 6 }, () => kinds[Math.floor(this.ctx.rng() * 4)]); this.ttl = (1.4 * this.ctx.window + 0.5) / this.ctx.speed;
    const poses: Record<string, 0 | 1 | 2 | 3> = { tap: 1, up: 2, down: 1, hold: 3 };
    const step = (ok: boolean) => { if (ok) { this.hits++; this.pop(cx, 230, 'YES'); this.ctx.athlete.pose(poses[this.chain[this.i]]); } else { this.pop(cx, 230, 'NOPE', PAL.red); this.ctx.frame.shake(100, 0.004); } this.i++; this.ttl *= 0.9; this.life = this.ttl; this.holdT = 0; this.ctx.frame.setProgress(`${this.i}/${this.chain.length}`); if (this.i >= this.chain.length) this.after(300, () => this.finish(this.scoreNow())); };
    const cur = () => this.chain[this.i];
    this.onSwipe(dir => { if (this.i >= this.chain.length) return; if (dir === 'up' || dir === 'down') step(cur() === dir); }, 22);
    let downAt = 0; this.on('pointerdown', () => { downAt = this.t; this.holding = true; }); this.on('pointerup', (p: any) => { this.holding = false; const dur = this.t - downAt; if (this.i >= this.chain.length) return; if (cur() === 'tap' && dur < 0.25) step(true); else if (cur() === 'tap' && dur >= 0.25 && this.holdT < 0.5) { /* handled by hold path below if it was a hold */ } void p; });
    this.key('keydown-SPACE', () => { if (cur() === 'tap') step(true); });
    this.life = this.ttl;
    this.loop(dt => { if (this.i >= this.chain.length) return; this.life -= dt; if (this.holding && cur() === 'hold') { this.holdT += dt; if (this.holdT > 0.6) step(true); } else if (this.holding && cur() !== 'hold' && this.holdT > 0.5) { step(false); } if (this.holding) this.holdT += 0; if (this.life <= 0) step(false);
      this.g.clear(); this.backdrop(380, 400); const a = clamp(this.life / this.ttl, 0, 1); this.g.fillStyle(PAL.ink).fillRect(60, 300, W - 120, 6); this.g.fillStyle(PAL.neon).fillRect(60, 300, (W - 120) * a, 6);
      for (let k = 0; k < this.chain.length; k++) { const x = 40 + k * 48, y = 180, done = k < this.i, now = k === this.i; this.g.fillStyle(done ? PAL.grass1 : now ? PAL.sun2 : PAL.night3).fillRect(x - 18, y - 18, 36, 36); this.g.fillStyle(PAL.ink);
        const kd = this.chain[k]; if (kd === 'tap') this.g.fillCircle(x, y, 7); else if (kd === 'up') this.g.fillTriangle(x, y - 10, x - 9, y + 8, x + 9, y + 8); else if (kd === 'down') this.g.fillTriangle(x, y + 10, x - 9, y - 8, x + 9, y - 8); else this.g.fillRect(x - 9, y - 4, 18, 8); } });
  }
  protected scoreNow() { return this.chain.length ? this.hits / this.chain.length : 0; }
}

/** SWIM BREATH: alternate LEFT/RIGHT taps in rhythm; when the breath bubble shows, do NOT tap for that beat. */
export class SwimBreath extends Micro {
  readonly id = 'swimbreath'; readonly word = META.swimbreath.word; readonly instr = META.swimbreath.instr; readonly durationSec = META.swimbreath.durationSec;
  private beat = 0; private period = 0.6; private expect: 'L' | 'R' | 'B' = 'L'; private got = false; private good = 0; private bad = 0; private beats = 12; private idx = 0; private drift = 0;
  protected begin() {
    const cx = W / 2; this.ctx.athlete.at(cx, 330).pose(3).show(true); this.period = 0.62 / this.ctx.speed; const seq: ('L' | 'R' | 'B')[] = []; let s: 'L' | 'R' = 'L'; for (let k = 0; k < this.beats; k++) { if (k > 1 && this.ctx.rng() < 0.25 && seq[k - 1] !== 'B') seq.push('B'); else { seq.push(s); s = s === 'L' ? 'R' : 'L'; } } this.expect = seq[0];
    const tap = (side: 'L' | 'R') => { if (this.idx >= this.beats) return; if (this.expect === 'B') { this.bad++; this.got = true; this.pop(cx, 220, 'GULP', PAL.red); this.ctx.frame.shake(120, 0.005); } else if (!this.got) { this.got = true; if (side === this.expect) { this.good++; this.drift += side === 'L' ? -3 : 3; this.ctx.athlete.sprite.angle = side === 'L' ? -12 : 12; } else { this.bad++; this.pop(cx, 220, 'WRONG ARM', PAL.red); } } };
    this.onTap(p => { if (!p) return; tap(p.x < W / 2 ? 'L' : 'R'); }); this.key('keydown-LEFT', () => tap('L')); this.key('keydown-RIGHT', () => tap('R'));
    this.loop(dt => { this.beat += dt; if (this.beat >= this.period) { this.beat -= this.period; if (this.expect !== 'B' && !this.got) this.bad++; else if (this.expect === 'B' && !this.got) this.good++; this.idx++; this.got = false; this.expect = seq[this.idx] ?? 'L'; this.ctx.frame.setProgress(`${this.idx}/${this.beats}`); if (this.idx >= this.beats) { this.after(200, () => this.finish(this.scoreNow())); return; } }
      this.drift *= 0.97; this.ctx.athlete.at(cx + this.drift, 330);
      this.g.clear(); this.g.fillStyle(PAL.sea1).fillRect(0, 26, W, 614); for (let i = 0; i < 12; i++) this.g.fillStyle(PAL.sea2, 0.35).fillRect((i * 37 + this.t * 80) % W, 60 + ((i * 53) % 520), 20, 2);
      const f = this.beat / this.period; this.g.fillStyle(PAL.ink).fillRect(40, 200, W - 80, 8); this.g.fillStyle(PAL.sea3).fillRect(40, 200, (W - 80) * (1 - f), 8);
      if (this.expect === 'B') { this.g.fillStyle(PAL.sky3, 0.9).fillCircle(cx, 150, 24); this.g.fillStyle(PAL.white).fillCircle(cx - 8, 142, 5); } else { const x = this.expect === 'L' ? cx - 90 : cx + 90; this.g.fillStyle(this.got ? PAL.grass1 : PAL.sun2).fillTriangle(x, 130, x - 22, 170, x + 22, 170); } });
  }
  protected scoreNow() { return clamp((this.good - this.bad * 0.5) / this.beats, 0, 1); }
  destroy() { this.ctx.athlete.sprite.angle = 0; super.destroy(); }
}

/** POSE MATCH: drag up/down to rotate; the figure SNAPS to the nearest of three yoga poses by angle band
 *  (Downward Dog = backslash, Cobra = slash, Warrior II = horizontal). Match the shadow's pose and hold it 0.5 s. */
const POSE_NAMES = ['DOWNWARD DOG', 'COBRA', 'WARRIOR II', 'PLANK'];
export class PoseMatch extends Micro {
  readonly id = 'pose'; readonly word = META.pose.word; readonly instr = META.pose.instr; readonly durationSec = META.pose.durationSec;
  /** the wheel position, 0..3 continuous; the nearest integer is the pose the figure shows */
  pos = 3; private snapped = -1; target = 0; private hold = 0; private matched = 0; private need = 3; private dragging = false;
  private figure!: Phaser.GameObjects.Image; private shadow!: Phaser.GameObjects.Image; private nameLbl!: Phaser.GameObjects.Text; private keys: string[] = []; private icons: Phaser.GameObjects.Image[] = [];
  private buildPoses() {
    const sc = this.ctx.scene; const map = { o: PAL.earth3, h: PAL.earth0, s: PAL.sun0, p: PAL.night3, k: PAL.ink };
    const P = (rows: string[], key: string) => pixTexture(sc, key, rows, map, 4);
    this.keys = [
      // Downward Dog: hips high on the right, arms down to the left, legs down right (torso reads as a backslash)
      P(['..................pp..', '.................ppp..', '................pppp..', '...............pppp...', '..............spp.pp..', '.............sss..pp..', '............sss...pp..', '...........sss....pp..', '..........sss.....pp..', '.........sss......pp..', '........sss.......pp..', '.......ooo........pp..', '......ooo.........pp..', 'hhhh.oo...........pp..', 'oooooo............pp..', 'oooo..............kkk.'], 'yoga_dog'),
      // Cobra: legs flat along the ground on the left, chest and head rising on the right (a forward slash)
      P(['..................hhhh', '..................oooo', '.................ssooo', '................sss...', '...............sss....', '..............sss.....', '.............ssso.....', '............ssss.o....', '...........ssss...o...', '..........ssss....o...', '.........ssss.....o...', 'pppppppppssss.....o...', 'pppppppppsss......o...', 'kkk.ppppppp.......oo..', '......................', '......................'], 'yoga_cobra'),
      // Warrior II: wide stance, both arms horizontal
      P(['..........hhhh........', '..........oooo........', '..........oooo........', '...........oo.........', 'oooosssssssssssssssoooo', '.....sssssssssssss....', '.......sssssss........', '.......sssssss........', '.......pppppppp.......', '......ppp....ppp......', '.....ppp......ppp.....', '....ppp........ppp....', '...ppp..........ppp...', '..ppp............ppp..', '.ppp..............ppp.', 'kkkk..............kkkk'], 'yoga_warrior'),
      // Plank: head left, a straight horizontal body on straight arms, feet on the mat at the right, low to the ground
      P(['......................', '......................', '......................', '......................', '......................', '......................', '......................', '..hhhh................', '..oooo................', '..oooossssssssssppppp.', '....sssssssssssssspppp', '.....oo..........pp...', '.....oo..........pp...', '.....oo..........pp...', '.....oo..........kkk..', '......................'], 'yoga_plank'),
    ];
  }
  protected begin() {
    this.buildPoses(); const sc = this.ctx.scene; const cx = 120, cy = 330; this.ctx.athlete.show(false);
    // left: the target silhouette and its name; the live figure stands on the mat beside it
    this.shadow = this.add(sc.add.image(cx, cy - 10, this.keys[0]).setDepth(3).setTintFill(PAL.night3).setAlpha(0.6).setScale(1.15));   // a dim single-colour silhouette behind the figure: the shape to fill
    this.figure = this.add(sc.add.image(cx, cy - 10, this.keys[3]).setDepth(5));
    this.nameLbl = this.label(cx, 150, '', 12, PAL.gray2); this.label(W - 58, 150, 'WHEEL', 9, PAL.gray1); this.label(W - 58, 470, 'drag up / down', 8, PAL.gray1);
    // right: the vertical wheel of the four poses, a window in the middle shows the current one
    this.icons = this.keys.map(k => this.add(sc.add.image(W - 58, cy, k).setDepth(6).setScale(0.45)));
    const nextT = () => { let t = Math.floor(this.ctx.rng() * 4); if (t === this.target && this.matched > 0) t = (t + 1) % 4; this.target = t; this.hold = 0; this.shadow.setTexture(this.keys[t]); this.nameLbl.setText(POSE_NAMES[t]); };
    let ly = 0; this.on('pointerdown', (p: any) => { ly = p.y; this.dragging = true; }); this.on('pointermove', (p: any) => { if (!p.isDown || !this.dragging) return; this.pos = clamp(this.pos + (p.y - ly) / 70, 0, 3); ly = p.y; });   // drag down = scroll the strip down = next pose
    this.on('pointerup', () => { this.dragging = false; });
    this.key('keydown-UP', () => { this.pos = clamp(Math.round(this.pos) - 1, 0, 3); }); this.key('keydown-DOWN', () => { this.pos = clamp(Math.round(this.pos) + 1, 0, 3); });
    (this as any).setPose = (i: number) => { this.pos = clamp(i, 0, 3); this.dragging = false; };
    nextT();
    this.loop(dt => {
      if (!this.dragging) { const sn = Math.round(this.pos); this.pos += (sn - this.pos) * Math.min(1, dt * 14); }   // snap with a settle
      const sn = Math.round(this.pos);
      if (sn !== this.snapped) { this.snapped = sn; this.figure.setTexture(this.keys[sn]); sc.tweens.add({ targets: this.figure, scaleX: { from: 0.85, to: 1 }, scaleY: { from: 1.15, to: 1 }, duration: 120, ease: 'Back.Out' }); this.ctx.frame.flash(PAL.night3, 20); }
      const ok = sn === this.target && Math.abs(this.pos - sn) < 0.25;
      if (ok) { this.hold += dt; if (this.hold > 0.5) { this.matched++; this.pop(cx, 200, 'MATCH'); this.ctx.frame.setProgress(`${this.matched}/${this.need}`); if (this.matched >= this.need) { this.after(250, () => this.finish(this.scoreNow())); return; } nextT(); } } else this.hold = 0;
      this.shadow.setTintFill(ok ? PAL.grass0 : PAL.night3).setAlpha(ok ? 0.75 : 0.6);
      this.g.clear(); this.backdrop(390, 410); this.g.fillStyle(PAL.earth0).fillRect(0, 392, W - 110, 4);   // the mat
      // the wheel: a strip with the four icons stacked, scrolled by pos; the middle window is the current pose
      const wx = W - 58, wy = cy, pitch = 58; this.g.fillStyle(PAL.gray0).fillRect(wx - 30, 170, 60, 300); this.g.fillStyle(PAL.ink).fillRect(wx - 30, 170, 60, 2).fillRect(wx - 30, 468, 60, 2);
      this.g.fillStyle(ok ? PAL.grass0 : PAL.night3).fillRect(wx - 30, wy - pitch / 2, 60, pitch); this.g.lineStyle(2, ok ? PAL.neon : PAL.sun2).strokeRect(wx - 29, wy - pitch / 2 + 1, 58, pitch - 2);
      this.icons.forEach((ic, i) => { const y = wy + (i - this.pos) * pitch; const vis = y > 176 && y < 464; ic.setVisible(vis).setPosition(wx, y).setAlpha(i === sn ? 1 : 0.55).setScale(i === sn ? 0.5 : 0.4); });
      this.g.fillStyle(PAL.gray2).fillTriangle(wx, 178, wx - 6, 186, wx + 6, 186).fillTriangle(wx, 462, wx - 6, 454, wx + 6, 454);
      this.g.fillStyle(PAL.ink).fillRect(cx - 40, 480, 80, 6); this.g.fillStyle(PAL.neon).fillRect(cx - 40, 480, 80 * clamp(this.hold / 0.5, 0, 1), 6); });
  }
  protected scoreNow() { return clamp(this.matched / this.need, 0, 1); }
  destroy() { this.ctx.athlete.show(true); super.destroy(); }
}
