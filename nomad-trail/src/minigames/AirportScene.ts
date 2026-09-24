import Phaser from 'phaser';
import { PAL } from '../core/palette';
import { MINIGAME_KEYS, type MinigameLaunch } from '../core/types';
import { MinigameFrame, Meter, W, H, clamp, normalizeLaunch, panel, txt } from './_shared';

type Bin = 'liquids' | 'laptop' | 'other';
/** Tight connection: security sort -> gate change -> boarding call. ~30s. */
export class AirportScene extends Phaser.Scene {
  private frame!: MinigameFrame; private launch!: MinigameLaunch; private g!: Phaser.GameObjects.Graphics; private meter!: Meter; private scores: number[] = []; private objs: Phaser.GameObjects.GameObject[] = []; private ticks: Phaser.Time.TimerEvent[] = [];
  constructor() { super(MINIGAME_KEYS.airport); }
  init(data: any) { this.launch = normalizeLaunch(data); this.scores = []; this.objs = []; this.ticks = []; }
  create() {
    this.frame = new MinigameFrame(this, this.launch, 'Tight connection'); this.cameras.main.setBackgroundColor(PAL.night2);
    this.g = this.add.graphics().setDepth(3); this.meter = new Meter(this, 40, 600, W - 80, 8); this.frame.hud();
    this.frame.scoreNow = () => this.scores.length ? (this.scores.reduce((a, b) => a + b, 0) / 3) * 100 : 30;
    this.frame.intro('Security, gate change, boarding. Three quick stages. Read fast, tap faster.', () => this.security());
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.ticks.forEach(t => t.remove()));
  }
  update(_t: number, dt: number) { this.frame.update(dt); }
  private clear() { this.objs.forEach(o => o.destroy()); this.objs = []; this.ticks.forEach(t => t.remove()); this.ticks = []; this.g.clear(); this.frame.clearTaps(); }
  private stageDone(acc: number) { this.scores.push(clamp(acc, 0, 1)); this.clear(); const n = this.scores.length; const lbl = txt(this, W / 2, 300, acc > 0.8 ? 'MADE IT' : acc > 0.4 ? 'close' : 'ugh', 16, acc > 0.8 ? PAL.neon : PAL.sun2).setDepth(9); this.time.delayedCall(700, () => { lbl.destroy(); [this.security, this.gate, this.boarding][n]?.call(this); if (n >= 3) this.frame.finish((this.scores.reduce((a, b) => a + b, 0) / 3) * 100); }); }

  // Stage 1: belt items slide to the scanner; tap the right bin while the item is in the window.
  private security() {
    this.frame.setProgress('1/3 SECURITY'); const kinds: Bin[] = ['liquids', 'laptop', 'other']; const items: { kind: Bin; x: number; done: boolean }[] = []; let right = 0, total = 8, spawned = 0, judged = 0; const spd = 90 * this.frame.speed; const winX: [number, number] = [W / 2 - 40 * this.frame.window - 10, W / 2 + 40 * this.frame.window + 10];
    const bins = kinds.map((k, i) => { const x = 60 + i * 120; const p = panel(this, x - 50, 440, 100, 70, PAL.night3); const t = txt(this, x, 475, k.toUpperCase(), 10, PAL.gray2); p.setInteractive(new Phaser.Geom.Rectangle(x - 50, 440, 100, 70), Phaser.Geom.Rectangle.Contains); p.on('pointerdown', () => judge(k)); this.objs.push(p, t); return { k, x }; });
    const kb = this.input.keyboard; kb?.on('keydown-ONE', () => judge('liquids')); kb?.on('keydown-TWO', () => judge('laptop')); kb?.on('keydown-THREE', () => judge('other'));
    const judge = (k: Bin) => { if (!this.frame.active) return; const it = items.find(i => !i.done && i.x > winX[0] && i.x < winX[1]); if (it) { it.done = true; judged++; if (it.kind === k) { right++; this.frame.flash(PAL.neon, 30); } else this.frame.shake(80, 0.003); } else this.frame.shake(50, 0.002); };
    this.ticks.push(this.time.addEvent({ delay: 1400 / this.frame.speed, repeat: total - 1, callback: () => { items.push({ kind: Phaser.Utils.Array.GetRandom(kinds), x: W + 30, done: false }); spawned++; } }));
    this.ticks.push(this.time.addEvent({ delay: 16, loop: true, callback: () => { this.g.clear(); this.g.fillStyle(PAL.gray0).fillRect(0, 300, W, 40); this.g.fillStyle(PAL.neon, 0.25).fillRect(winX[0], 280, winX[1] - winX[0], 80); this.g.fillStyle(PAL.gray1).fillRect(W / 2 - 60, 250, 120, 30); txt(this, W / 2, 265, 'X-RAY', 9, PAL.ink).setName('xr');
      for (const it of items) { it.x -= spd * 0.016; if (!it.done && it.x < winX[0] - 10) { it.done = true; judged++; } const c = it.kind === 'liquids' ? PAL.sea2 : it.kind === 'laptop' ? PAL.gray2 : PAL.sun1; this.g.fillStyle(it.done ? PAL.night3 : c); if (it.kind === 'liquids') this.g.fillRect(it.x - 6, 290, 12, 26); else if (it.kind === 'laptop') this.g.fillRect(it.x - 18, 300, 36, 12); else this.g.fillCircle(it.x, 306, 11); }
      this.children.list.filter(o => o.name === 'xr').slice(0, -1).forEach(o => o.destroy()); this.meter.set(judged / total); if (spawned >= total && judged >= total) this.stageDone(right / total); } }));
    void bins;
  }

  // Stage 2: departures board flickers, then shows the new gate; tap it within 3s.
  private gate() {
    this.frame.setProgress('2/3 GATE CHANGE'); const flight = 'NT 365'; const gates = ['A4', 'B12', 'C7', 'D2', 'E9', 'F1']; const answer = Phaser.Utils.Array.GetRandom(gates); const others = ['LX 22', 'JL 401', 'UA 9', 'AZ 66', 'TK 17'];
    const rows = Phaser.Utils.Array.Shuffle([...others.map(f => ({ f, g: Phaser.Utils.Array.GetRandom(gates) })), { f: flight, g: answer }]);
    const board = panel(this, 20, 60, W - 40, 190, PAL.ink, PAL.gray0); this.objs.push(board); const lines = rows.map((r, i) => { const t = txt(this, 40, 84 + i * 26, `${r.f}   ${'BOARDING'.padEnd(10)} GATE ${r.g}`, 11, r.f === flight ? PAL.sun2 : PAL.sun1, 'left'); this.objs.push(t); return t; });
    const you = txt(this, W / 2, 275, `YOUR FLIGHT: ${flight}`, 12, PAL.white); this.objs.push(you);
    let flick = 0; const fl = this.time.addEvent({ delay: 60, repeat: Math.round(25 * (1 + this.frame.hard)), callback: () => { flick++; lines.forEach(l => l.setAlpha(Math.random() < 0.5 ? 0.2 : 1).setText(Math.random() < 0.6 ? l.text.replace(/GATE \w+/, 'GATE ' + Phaser.Utils.Array.GetRandom(gates)) : l.text)); },
      }); this.ticks.push(fl);
    this.time.delayedCall(70 * Math.round(25 * (1 + this.frame.hard)) + 100, () => { lines.forEach((l, i) => l.setAlpha(1).setText(`${rows[i].f}   ${'BOARDING'.padEnd(10)} GATE ${rows[i].g}`)); let t0 = this.time.now, done = false; const limit = 3000 * (0.7 + 0.3 * this.frame.window);
      gates.forEach((gname, i) => { const x = 60 + (i % 3) * 120, y = 380 + Math.floor(i / 3) * 90; const p = panel(this, x - 50, y - 35, 100, 70, PAL.night3); p.setInteractive(new Phaser.Geom.Rectangle(x - 50, y - 35, 100, 70), Phaser.Geom.Rectangle.Contains); const t = txt(this, x, y, gname, 18, PAL.white); this.objs.push(p, t);
        p.on('pointerdown', () => { if (done || !this.frame.active) return; done = true; const el = (this.time.now - t0) / limit; this.stageDone(gname === answer ? clamp(1 - el * 0.4, 0.5, 1) : 0.1); }); });
      this.ticks.push(this.time.addEvent({ delay: 50, loop: true, callback: () => { const left = Math.max(0, limit - (this.time.now - t0)); this.meter.set(left / limit, left < 1000 ? PAL.red : PAL.sun2); this.frame.setTimer(`${(left / 1000).toFixed(1)}s`); if (left <= 0 && !done) { done = true; this.stageDone(0); } } })); });
  }

  // Stage 3: boarding groups get called in a shuffle; tap when yours is called.
  private boarding() {
    this.frame.setProgress('3/3 BOARDING'); const mine = Phaser.Utils.Array.GetRandom(['A', 'B', 'C', 'D']); const you = txt(this, W / 2, 200, `YOU ARE GROUP ${mine}`, 14, PAL.white); this.objs.push(you);
    const calls: string[] = []; for (let i = 0; i < 7; i++) calls.push(Phaser.Utils.Array.GetRandom(['A', 'B', 'C', 'D', 'E'])); calls[Phaser.Math.Between(2, 5)] = mine; let idx = -1, hit = 0, falseTaps = 0, mineCalls = 0, current = '', calledAt = 0;
    const speaker = txt(this, W / 2, 330, '', 20, PAL.sun2); this.objs.push(speaker); const every = 1300 / this.frame.speed;
    this.ticks.push(this.time.addEvent({ delay: every, repeat: calls.length, callback: () => { idx++; if (idx >= calls.length) { this.stageDone(mineCalls ? clamp(hit / mineCalls - falseTaps * 0.25, 0, 1) : 0); return; } current = calls[idx]; calledAt = this.time.now; if (current === mine) mineCalls++; speaker.setText(`NOW BOARDING GROUP ${current}`).setAlpha(1); this.tweens.add({ targets: speaker, alpha: 0.4, duration: every * 0.9 }); this.meter.set((idx + 1) / calls.length); } }));
    this.frame.onTap(() => { if (!current) return; if (current === mine && this.time.now - calledAt < every * (0.6 + 0.4 * this.frame.window)) { hit++; current = ''; this.frame.flash(PAL.neon, 40); speaker.setText('BOARDED'); } else { falseTaps++; this.frame.shake(80, 0.003); } });
  }
}
