import Phaser from 'phaser';
import { PAL } from '../core/palette';
import { MINIGAME_KEYS, type MinigameLaunch } from '../core/types';
import { MinigameFrame, Meter, W, H, clamp, normalizeLaunch, panel, txt, pixTexture } from './_shared';

/**
 * KITEBOARDING, one loop: HOLD anywhere and the kite steers toward your finger across the wind window; keep it in the glowing
 * power zone to fill the SPEED meter (~2 s in the zone; drains outside it) while the rider tears across the water.
 * RELEASE to jump: height and hang time scale with speed, with a bonus when the swell crest is under the board. Land clean
 * for points; a low-speed release is a hop; landing in a trough is a wipeout (splash, 1.5 s). 35 s. Score = air time + clean landings.
 * An instruction card (HOLD / RELEASE / SWELL) waits for READY; the cap is paused while it is up. Payload: { city? } (for the label).
 */
const DUR = 35;
export class KiteScene extends Phaser.Scene {
  private frame!: MinigameFrame; private launch!: MinigameLaunch; private g!: Phaser.GameObjects.Graphics; private meter!: Meter;
  private kiteA = 0; private zoneC = 0; private zoneTarget = 0; private zoneW = 0.4; speed = 0; private elapsed = 0;
  held = false; fingerX = W / 2; airborne = 0; private hang = 0; airTotal = 0; clean = 0; wipeouts = 0; private recover = 0; private hop = 0; private jumps = 0;
  private waveOff = 0; private tick?: Phaser.Time.TimerEvent; private msg!: Phaser.GameObjects.Text; private rider!: Phaser.GameObjects.Sprite; private spray: { x: number; y: number; vx: number; vy: number; t: number }[] = [];
  waiting = true; private card: Phaser.GameObjects.GameObject[] = []; private gust = 0; private cityName = '';
  constructor() { super(MINIGAME_KEYS.kite); }
  init(data: any) {
    this.launch = normalizeLaunch(data); const p = this.launch.payload || {}; this.cityName = String(p.cityName || p.city || '').toUpperCase();
    this.kiteA = 0; this.zoneC = 0.15; this.zoneTarget = 0.15; this.speed = 0; this.elapsed = 0; this.held = false; this.fingerX = W / 2; this.airborne = 0; this.hang = 0; this.airTotal = 0; this.clean = 0; this.wipeouts = 0; this.recover = 0; this.hop = 0; this.waveOff = 0; this.spray = []; this.waiting = true; this.card = []; this.gust = 0;
  }
  create() {
    this.frame = new MinigameFrame(this, this.launch, 'Kiteboarding'); this.frame.capSec = DUR + 1; this.cameras.main.setBackgroundColor(PAL.sky1);
    this.g = this.add.graphics().setDepth(3); this.meter = new Meter(this, 40, 604, W - 80, 10, PAL.neon); this.zoneW = 0.3 * this.frame.window + 0.14;
    this.buildRider(); this.rider = this.add.sprite(W / 2, 470, 'kb_rider', 0).setOrigin(0.5, 1).setDepth(6).setScale(3);
    this.msg = txt(this, W / 2, 130, '', 14, PAL.white).setDepth(8);
    this.frame.hud(); this.frame.setProgress(this.cityName || 'WIND DAY');
    this.frame.scoreNow = () => this.score();
    this.frame.intro('Wind at 2 pm, like a train timetable. Read the card, then ride.', () => { this.frame.pauseCap(); this.showCard(); }, { auto: true });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.tick?.remove());
  }
  private score() { return clamp((this.airTotal / 13) * 70 + Math.min(30, this.clean * 6) - this.wipeouts * 6, 0, 100); }

  // ---------- instruction card ----------
  private showCard() {
    const s = this; const add = (o: Phaser.GameObjects.GameObject) => { this.card.push(o); return o; };
    add(s.add.rectangle(W / 2, H / 2, W, H, PAL.night0, 0.9).setDepth(900)); add(panel(s, 16, 96, W - 32, 470, PAL.night2).setDepth(901));
    add(txt(s, W / 2, 124, 'KITEBOARDING', 10, PAL.gray2).setDepth(902)); add(txt(s, W / 2, 150, this.cityName || 'WIND DAY', 24, PAL.sun3).setDepth(902));
    const ic = s.add.graphics().setDepth(902); add(ic);
    const row = (y: number, draw: () => void, label: string) => { ic.fillStyle(PAL.night3).fillRect(34, y - 22, 48, 44); draw(); add(txt(s, 94, y, label, 10, PAL.white, 'left').setDepth(902)); };
    row(212, () => { ic.fillStyle(PAL.neon).fillCircle(58, 212, 9); ic.fillStyle(PAL.night3).fillCircle(58, 212, 5); ic.fillStyle(PAL.neon).fillRect(40, 226, 36, 3); }, 'HOLD anywhere\nthe kite follows your finger\nleft and right');
    row(272, () => { ic.fillStyle(PAL.sun2).fillRect(40, 282, 36, 3); ic.fillStyle(PAL.sun2).fillRect(40, 282, 22, 3); ic.fillStyle(PAL.neon).fillRect(40, 268, 8, 10).fillRect(50, 262, 8, 16).fillRect(60, 256, 8, 22); }, 'KEEP IT IN THE GLOW\nthe power zone fills\nyour SPEED');
    row(332, () => { ic.fillStyle(PAL.white).fillTriangle(58, 316, 48, 332, 68, 332); ic.fillStyle(PAL.white).fillRect(55, 332, 6, 12); }, 'RELEASE to jump, more speed = more air\npress again in the air to drop faster');
    row(392, () => { ic.lineStyle(3, PAL.sea3).beginPath(); for (let x = 0; x <= 40; x += 2) { const y = 396 + Math.sin(x / 6) * 6; if (x === 0) ic.moveTo(38 + x, y); else ic.lineTo(38 + x, y); } ic.strokePath(); ic.fillStyle(PAL.sun2).fillCircle(58, 386, 3); }, 'release on a CREST for a bonus\nland in a trough = wipeout');
    add(txt(s, W / 2, 440, `${DUR} seconds of wind. Air time and clean landings score.`, 9, PAL.sun1).setDepth(902));
    const btn = s.add.rectangle(W / 2, 510, 200, 52, PAL.sun0).setDepth(902).setStrokeStyle(2, PAL.ink).setInteractive({ useHandCursor: true }); add(btn); add(txt(s, W / 2, 510, 'READY', 18, PAL.white).setDepth(903));
    s.tweens.add({ targets: btn, scaleX: 1.04, scaleY: 1.06, yoyo: true, repeat: -1, duration: 600 });
    btn.on('pointerdown', () => this.startRun()); const kb = this.input.keyboard; kb?.once('keydown-SPACE', () => this.startRun()); kb?.once('keydown-ENTER', () => this.startRun());
  }
  /** Dismiss the card and start the 35 s of wind (also called by the harness). */
  startRun() {
    if (!this.waiting) return; this.waiting = false; this.card.forEach(o => o.destroy()); this.card = []; this.frame.resumeCap();
    this.time.delayedCall(60, () => {   // a beat so the READY tap itself is not read as the first hold
      this.input.on('pointerdown', (p: Phaser.Input.Pointer) => { this.held = true; this.fingerX = p.x; });
      this.input.on('pointermove', (p: Phaser.Input.Pointer) => { if (this.held) this.fingerX = p.x; });
      this.input.on('pointerup', () => { if (this.held) { this.held = false; this.release(); } });
      const kb = this.input.keyboard; kb?.on('keydown-SPACE', () => { if (!this.held) { this.held = true; this.fingerX = W / 2 + this.kiteA * 140; } }); kb?.on('keyup-SPACE', () => { if (this.held) { this.held = false; this.release(); } });
      this.tick = this.time.addEvent({ delay: 16, loop: true, callback: () => this.step(0.016) });
    });
  }
  /** Harness: press/release programmatically. */
  press(x: number) { this.held = true; this.fingerX = x; }
  letGo() { if (this.held) { this.held = false; this.release(); } }
  /** Harness hint: the finger x that puts the kite in the zone, and whether the swell is under the board right now. */
  hint() { return { x: W / 2 + this.zoneC * 140, crest: this.wavePhase() > 0.55, phase: this.wavePhase(), speed: this.speed, airborne: this.airborne > 0, recovering: this.recover > 0, clean: this.clean, wipeouts: this.wipeouts, held: this.held, dropLand: this.landPhase(true), floatLand: this.landPhase(false) }; }

  update(_t: number, dt: number) { this.frame.update(dt); const kb = this.input.keyboard; if (kb && this.frame.active && this.held) { if (kb.addKey('LEFT').isDown) this.fingerX -= 4; if (kb.addKey('RIGHT').isDown) this.fingerX += 4; } }
  private wavePhase() { return Math.sin(this.waveOff * 1.3); }
  /** swell phase under the board when the current jump touches down, if the rider drops fast (held) or floats */
  private landPhase(drop: boolean) { const secs = this.airborne / (drop ? 2.2 : 1); return Math.sin((this.waveOff + secs * (0.7 + this.speed * 1.4)) * 1.3); }
  private release() {
    if (!this.frame.active || this.airborne > 0 || this.recover > 0) return;
    if (this.speed < 0.25) { this.hop = 0.3; this.msg.setText('hop').setColor('#b4b9c4'); return; }
    const crest = this.wavePhase() > 0.55; this.hang = (0.5 + this.speed * 1.4) * (crest ? 1.3 : 1); this.airborne = this.hang; this.jumps++;
    this.msg.setText(crest ? 'BOOST!' : 'AIR').setColor(crest ? '#f7cf6b' : '#f4f1ea'); this.frame.flash(PAL.white, 40);
    for (let i = 0; i < 14; i++) this.spray.push({ x: W / 2 + (Math.random() - 0.5) * 30, y: 470, vx: (Math.random() - 0.5) * 120, vy: -60 - Math.random() * 90, t: 0.6 });
  }
  private step(dt: number) {
    if (!this.frame.active) return; this.elapsed += dt; this.frame.setTimer(`${Math.max(0, DUR - this.elapsed).toFixed(1)}s`);
    // wind: the power zone drifts, gusts shove it
    this.gust -= dt; if (this.gust <= 0) { this.zoneTarget = clamp((Math.random() - 0.5) * 1.2, -0.7, 0.7); this.gust = 3 + Math.random() * 4; }
    this.zoneC += (this.zoneTarget - this.zoneC) * Math.min(1, dt * 0.9);
    // kite follows the finger while held
    if (this.held && this.recover <= 0) { const target = clamp((this.fingerX - W / 2) / 140, -1, 1); this.kiteA += (target - this.kiteA) * Math.min(1, dt * 6); }
    const inZone = Math.abs(this.kiteA - this.zoneC) < this.zoneW / 2;
    if (this.recover > 0) { this.recover -= dt; this.speed = 0; }
    else if (this.airborne > 0) { /* speed holds in the air */ }
    else if (this.held && inZone) this.speed = clamp(this.speed + dt / 2, 0, 1);
    else this.speed = clamp(this.speed - dt / (this.held ? 1.5 : 1.2), 0, 1);
    this.waveOff += dt * (0.7 + this.speed * 1.4);
    // air
    if (this.airborne > 0) { this.airborne -= dt * (this.held ? 2.2 : 1); if (this.airborne <= 0) { this.airborne = 0; this.held = false; /* a drop press ends at touchdown: hold again to power up */ const trough = this.wavePhase() < -0.5; if (trough) { this.wipeouts++; this.recover = 1.5; this.speed = 0; this.msg.setText('WIPEOUT').setColor('#d63c3c'); this.frame.shake(200, 0.008); for (let i = 0; i < 26; i++) this.spray.push({ x: W / 2 + (Math.random() - 0.5) * 50, y: 470, vx: (Math.random() - 0.5) * 220, vy: -80 - Math.random() * 160, t: 0.9 }); } else { this.clean++; this.airTotal += this.hang; this.speed *= 0.55; this.msg.setText(`+${this.hang.toFixed(1)}s`).setColor('#3ef0c8'); this.frame.flash(PAL.neon, 30); } } }
    if (this.hop > 0) this.hop -= dt;
    // spray while riding fast
    if (this.airborne <= 0 && this.recover <= 0 && this.speed > 0.3 && Math.random() < this.speed) this.spray.push({ x: W / 2 - 14, y: 468, vx: -60 - Math.random() * 90 * this.speed, vy: -20 - Math.random() * 50, t: 0.35 });
    for (const sp of this.spray) { sp.t -= dt; sp.x += sp.vx * dt; sp.y += sp.vy * dt; sp.vy += 260 * dt; } this.spray = this.spray.filter(sp => sp.t > 0);
    this.meter.set(this.speed, this.speed > 0.7 ? PAL.sun2 : PAL.neon);
    this.draw(inZone);
    if (this.elapsed >= DUR) { this.tick?.remove(); this.frame.finish(this.score()); }
  }

  // ---------- drawing ----------
  private draw(inZone: boolean) {
    const g = this.g; g.clear();
    // sky bands, sun, far shore
    const skies = [PAL.sky0, PAL.sky1, PAL.sky1, PAL.sky2, PAL.sky3]; skies.forEach((c, i) => g.fillStyle(c).fillRect(0, 26 + i * 60, W, 60));
    g.fillStyle(PAL.sun3).fillCircle(290, 120, 22); g.fillStyle(PAL.sun2, 0.5).fillCircle(290, 120, 28);
    g.fillStyle(PAL.earth3).fillRect(0, 300, W, 12); for (let i = 0; i < 9; i++) { const x = i * 44 + 10; g.fillStyle(PAL.earth2).fillTriangle(x, 300, x + 30, 300, x + 16, 288 - (i % 3) * 5); }
    for (let i = 0; i < 5; i++) { const x = 30 + i * 78; g.fillStyle(PAL.grass0).fillRect(x, 282, 2, 20); g.fillStyle(PAL.grass1).fillTriangle(x - 8, 284, x + 10, 284, x + 1, 274).fillTriangle(x - 9, 280, x + 11, 280, x + 1, 288); }
    // water with rolling swell: three crest layers, foam on the tops
    g.fillStyle(PAL.sea1).fillRect(0, 312, W, H - 312);
    for (let layer = 0; layer < 3; layer++) {
      const base = 400 + layer * 46, amp = 6 + layer * 4, freq = 0.045 - layer * 0.008, ph = this.waveOff * (1.3 + layer * 0.4) + layer;
      g.fillStyle([PAL.sea0, PAL.sea1, PAL.sea2][layer]).beginPath(); g.moveTo(0, H);
      for (let x = 0; x <= W; x += 6) g.lineTo(x, base - Math.sin(x * freq + ph) * amp); g.lineTo(W, H); g.closePath(); g.fillPath();
      g.fillStyle(PAL.sea3, 0.7); for (let x = 0; x <= W; x += 6) { const v = Math.sin(x * freq + ph); if (v > 0.75) g.fillRect(x, base - v * amp - 2, 5, 2); }
    }
    // the swell under the rider (what you time the release to): a crest rising through the board line
    const wp = this.wavePhase(); g.fillStyle(PAL.sea3, 0.6 + 0.4 * Math.max(0, wp)); g.fillEllipse(W / 2, 474 - wp * 10, 90, 14 + wp * 6); if (wp > 0.55) g.fillStyle(PAL.white, 0.8).fillRect(W / 2 - 34, 464 - wp * 10, 68, 2);
    // wind window arc with the power zone
    const cx = W / 2, cy = 330, R = 150;
    g.lineStyle(2, PAL.white, 0.35); g.beginPath(); for (let a = -1; a <= 1.001; a += 0.05) { const x = cx + Math.sin(a * Math.PI / 2) * R, y = cy - Math.cos(a * Math.PI / 2) * R * 0.75; if (a === -1) g.moveTo(x, y); else g.lineTo(x, y); } g.strokePath();
    g.lineStyle(10, inZone ? PAL.neon : PAL.sun2, inZone ? 0.85 : 0.5); g.beginPath(); for (let a = this.zoneC - this.zoneW / 2; a <= this.zoneC + this.zoneW / 2; a += 0.02) { const aa = clamp(a, -1, 1); const x = cx + Math.sin(aa * Math.PI / 2) * R, y = cy - Math.cos(aa * Math.PI / 2) * R * 0.75; if (a === this.zoneC - this.zoneW / 2) g.moveTo(x, y); else g.lineTo(x, y); } g.strokePath();
    // kite: a C-kite seen from behind the rider: the leading edge arches UP, the wingtips hang down toward the lines
    const ka = this.kiteA; const kx = cx + Math.sin(ka * Math.PI / 2) * R, ky = cy - Math.cos(ka * Math.PI / 2) * R * 0.75; const tilt = ka * 0.5;
    const arc = (r: number, w: number, drop: number) => { const pts: { x: number; y: number }[] = []; for (let t = -1; t <= 1.001; t += 0.125) { const ang = t * 1.15; pts.push({ x: kx + Math.sin(ang + tilt) * w, y: ky + drop + (1 - Math.cos(ang)) * r }); } return pts; };   // centre highest, tips lower
    const lead = arc(18, 19, 0), trail = arc(16, 15, 7);
    g.fillStyle(PAL.red).beginPath(); g.moveTo(lead[0].x, lead[0].y); lead.forEach(p => g.lineTo(p.x, p.y)); trail.slice().reverse().forEach(p => g.lineTo(p.x, p.y)); g.closePath(); g.fillPath();
    for (let i = 1; i < lead.length - 1; i++) { const c = i % 4 === 0 ? PAL.sun2 : i % 2 === 0 ? PAL.white : null; if (c) { g.fillStyle(c, 0.9); g.fillRect((lead[i].x + trail[i].x) / 2 - 1, (lead[i].y + trail[i].y) / 2 - 2, 3, 5); } }
    g.lineStyle(2, PAL.ink, 1); g.beginPath(); g.moveTo(lead[0].x, lead[0].y); lead.forEach(p => g.lineTo(p.x, p.y)); g.strokePath();   // the leading edge
    const airP = this.airborne > 0 ? Math.sin(Math.PI * (1 - this.airborne / Math.max(0.01, this.hang))) : 0;
    const bar = { x: W / 2 + ka * 6, y: 446 - airP * (60 + this.speed * 60) };
    const tipL = trail[0], tipR = trail[trail.length - 1];
    g.lineStyle(1, PAL.gray1, 0.9); g.beginPath(); g.moveTo(tipL.x, tipL.y); g.lineTo(bar.x - 6, bar.y); g.moveTo(tipR.x, tipR.y); g.lineTo(bar.x + 6, bar.y); g.strokePath();   // lines from the wingtips down to the bar
    g.fillStyle(PAL.ink).fillRect(bar.x - 9, bar.y - 1, 18, 3);
    // rider: frame by state, lifted by the jump, tilted by the wind
    const air = this.airborne > 0 ? airP : this.hop > 0 ? Math.sin(Math.PI * (1 - this.hop / 0.3)) * 0.2 : 0;
    const lift = air * (60 + this.speed * 60); const landing = this.airborne > 0 && this.airborne < 0.25;
    this.rider.setFrame(this.recover > 0 ? 2 : this.airborne > 0 ? (landing ? 2 : 1) : 0).setPosition(W / 2, 470 - lift - wp * 4).setAngle(this.airborne > 0 ? -ka * 18 : -ka * 8).setAlpha(this.recover > 0 ? 0.6 : 1);
    if (this.recover > 0) g.fillStyle(PAL.white, 0.7).fillEllipse(W / 2, 470, 70, 16);
    if (this.airborne > 0 && this.jumps <= 2) { const hy = 470 - lift - 84 + Math.sin(this.elapsed * 10) * 3; g.fillStyle(this.held ? PAL.neon : PAL.white).fillTriangle(W / 2, hy + 12, W / 2 - 8, hy, W / 2 + 8, hy).fillRect(W / 2 - 2, hy - 10, 4, 10); txt(this, W / 2, hy - 20, 'press to drop', 8, PAL.white).setDepth(8).setName('kb_drop'); }
    this.children.list.filter(o => o.name === 'kb_drop').slice(0, this.airborne > 0 && this.jumps <= 2 ? -1 : undefined).forEach(o => o.destroy());
    // spray
    for (const sp of this.spray) g.fillStyle(PAL.white, Math.min(1, sp.t * 2)).fillRect(sp.x, sp.y, 3, 3);
    // labels
    txt(this, W - 12, 586, `AIR ${this.airTotal.toFixed(1)}s  ·  ${this.clean} clean${this.wipeouts ? `  ·  ${this.wipeouts} wipeout${this.wipeouts > 1 ? 's' : ''}` : ''}`, 9, PAL.gray2, 'right').setDepth(8).setName('kb_lbl');
    this.children.list.filter(o => o.name === 'kb_lbl').slice(0, -1).forEach(o => o.destroy());
    txt(this, 40, 586, this.held ? (inZone ? 'POWER' : 'find the glow') : 'HOLD to power up', 9, this.held && inZone ? PAL.neon : PAL.gray2, 'left').setDepth(8).setName('kb_hint');
    this.children.list.filter(o => o.name === 'kb_hint').slice(0, -1).forEach(o => o.destroy());
  }
  private buildRider() {
    if (this.textures.exists('kb_rider')) return;
    const map: Record<string, number> = { h: PAL.sun0, s: PAL.earth3, k: PAL.ink, w: PAL.white, b: PAL.night3, r: PAL.red, g: PAL.gray2, n: PAL.neon };
    // 20x28: helmet, arms up to the bar, harness, twin-tip board with an edge; frames: riding, tucked, landing
    const ride = ['.......hhhhhh.......', '......hhhhhhhh......', '......hssssssh......', '......ssskksss......', '..k....ssssss....k..', '..k.....kkkk.....k..', '..k....kkkkkk....k..', '...k..kkkkkkkk..k...', '....kkkkkkkkkkkk....', '.....kkrrrrrrkk.....', '......krrrrrrk......', '......krrrrrrk......', '......kbbbbbbk......', '......bbbbbbbb......', '......bbbbbbbb......', '......bbb..bbb......', '......bbb..bbb......', '......bbb..bbb......', '......www..www......', '......www..www......', '....nnnnnnnnnnnn....', '..nnnnnnnnnnnnnnnn..', '.nnnnnnnnnnnnnnnnnn.', '..kkkkkkkkkkkkkkkk..', '....................', '....................', '....................', '....................'];
    const tuck = ['.......hhhhhh.......', '......hhhhhhhh......', '......hssssssh......', '......ssskksss......', '..k....ssssss....k..', '..k.....kkkk.....k..', '..k....kkkkkk....k..', '...k..kkkkkkkk..k...', '....kkkkkkkkkkkk....', '.....kkrrrrrrkk.....', '......krrrrrrk......', '......krrrrrrk......', '......kbbbbbbk......', '.....bbbbbbbbbb.....', '....bbbbbbbbbbbb....', '...bbbb......bbbb...', '..www..........www..', '.nnnnnnnnnnnnnnnnnn.', 'nnnnnnnnnnnnnnnnnnnn', '.kkkkkkkkkkkkkkkkkk.', '....................', '....................', '....................', '....................', '....................', '....................', '....................', '....................'];
    const land = ['.......hhhhhh.......', '......hhhhhhhh......', '......hssssssh......', '......ssskksss......', '..k....ssssss....k..', '..k.....kkkk.....k..', '..k....kkkkkk....k..', '...k..kkkkkkkk..k...', '....kkkkkkkkkkkk....', '.....kkrrrrrrkk.....', '......krrrrrrk......', '......krrrrrrk......', '......kbbbbbbk......', '......bbbbbbbb......', '.....bbbbbbbbbb.....', '....bbbb....bbbb....', '...bbbb......bbbb...', '..www..........www..', '..www..........www..', '.nnnnnnnnnnnnnnnnnnn', 'nnnnnnnnnnnnnnnnnnnn', 'kkkkkkkkkkkkkkkkkkkk', '....................', '....................', '....................', '....................', '....................', '....................'];
    const frames = [ride, tuck, land]; const fw = 20, fh = 28; const g = this.add.graphics();
    frames.forEach((rows, fi) => rows.forEach((r, y) => [...r].forEach((ch, x) => { if (ch !== '.' && map[ch] !== undefined) g.fillStyle(map[ch]).fillRect(fi * fw + x, y, 1, 1); })));
    g.generateTexture('kb_rider', fw * frames.length, fh); g.destroy(); const tex = this.textures.get('kb_rider'); for (let i = 0; i < frames.length; i++) tex.add(i, 0, i * fw, 0, fw, fh);
    void pixTexture;
  }
}
