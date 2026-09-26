// The handheld console shell (scene key stays 'CarryOn' for the engine). Draws the bezel, screen, D-pad, A/B, START/SELECT,
// boots a cartridge from src/minigames/console/games (carryon | tetris; Drone Run became the standalone Drone side game), and owns the frame, hearts, pause and result.
import Phaser from 'phaser';
import { PAL } from '../core/palette';
import { MINIGAME_KEYS, type ArcadeLevel, type Hazard, type MinigameLaunch } from '../core/types';
import { MinigameFrame, W, H, normalizeLaunch, panel, txt } from './_shared';
import { Audio } from '../audio/synth';
import { Pad, type PadLayout, type PadKey } from './console/input';
import { CONSOLE_GAMES, isConsoleGameId, type ConsoleGame, type ConsoleGameId, type ConsoleCtx } from './console/games';
import { DEFAULT_LEVEL, validateLevel, trimStamps, generateLevel, hashSeed, paletteFor, levelRng, type LevelFamily } from './carryonLevel';
export { DEFAULT_LEVEL, validateLevel, generateLevel } from './carryonLevel';

const SCREEN = new Phaser.Geom.Rectangle(-4, 150, 368, 320);   // 23 x 20 tiles of 16 px; the 4 px overhang is the wall tiles
const LAYOUT: PadLayout = {
  dpad: { x: 78, y: 556, r: 62 }, a: { x: 298, y: 536, r: 27 }, b: { x: 242, y: 584, r: 27 },
  select: new Phaser.Geom.Rectangle(116, 612, 40, 14), start: new Phaser.Geom.Rectangle(166, 612, 40, 14), screen: SCREEN,
};

export interface ConsolePayload { game?: ConsoleGameId; level?: ArcadeLevel; city?: string; cityName?: string; hazard?: Hazard; seed?: number; climate?: string; }

export class CarryOnScene extends Phaser.Scene {
  private frame!: MinigameFrame; private launch!: MinigameLaunch; private pad!: Pad; private cart?: ConsoleGame; private gameId: ConsoleGameId = 'carryon';
  private level!: ArcadeLevel; private cityName = ''; private hazard: Hazard = 'pigeon'; private palette: [number, number, number] = [PAL.night2, PAL.night3, PAL.gray1]; private rng: () => number = Math.random; private family?: LevelFamily;
  private padG!: Phaser.GameObjects.Graphics; private heartsG!: Phaser.GameObjects.Graphics; private statusT!: Phaser.GameObjects.Text; private pauseT?: Phaser.GameObjects.Text; private ledT = 0; private led!: Phaser.GameObjects.Arc;
  private paused = false; private started = false; private lastPad = ''; private titleCard?: Phaser.GameObjects.Container;

  constructor() { super(MINIGAME_KEYS.carryon); }

  init(data: any) {
    this.launch = normalizeLaunch(data); const raw = (this.launch.payload || {}) as ConsolePayload & Partial<ArcadeLevel>;
    // payload may be a raw ArcadeLevel (harness) or { game, level, city, cityName, hazard, seed, climate } (engine)
    const rawLevel: ArcadeLevel | undefined = Array.isArray((raw as any).tiles) ? (raw as unknown as ArcadeLevel) : (raw.level && Array.isArray(raw.level.tiles) ? raw.level : undefined);
    this.gameId = isConsoleGameId(raw.game) ? raw.game : 'carryon';
    const cityId = raw.city || rawLevel?.city || 'somewhere'; this.cityName = raw.cityName || (rawLevel && rawLevel.city !== 'generic' ? rawLevel.city : '') || cityId;
    this.hazard = raw.hazard || rawLevel?.hazard || 'pigeon';
    const seed = typeof raw.seed === 'number' ? raw.seed : hashSeed(`${cityId}|${this.gameId}`);
    this.rng = levelRng(seed);
    // level: a valid hand-built level is a template for its city; otherwise (or when a seed asks for variety) generate one
    const useTemplate = rawLevel && rawLevel.city !== 'generic' && typeof raw.seed !== 'number' && validateLevel(rawLevel).length === 0;
    if (useTemplate) { this.level = trimStamps(rawLevel!); this.family = undefined; }
    else { const g = generateLevel(seed, { city: this.cityName, hazard: this.hazard, climate: raw.climate, palette: rawLevel?.palette }); this.level = g; this.family = g.family; }
    this.palette = (this.level.palette as [number, number, number]) || paletteFor(raw.climate);
    this.paused = false; this.started = false; this.lastPad = ''; this.cart = undefined;
  }

  create() {
    const names: Record<ConsoleGameId, string> = { carryon: 'Carry-On', tetris: 'Pack-Tris' };
    this.frame = new MinigameFrame(this, this.launch, names[this.gameId]);
    this.cameras.main.setBackgroundColor(PAL.ink);
    this.drawBezel();
    this.pad = new Pad(this, LAYOUT, (k) => this.onPadPress(k));
    this.padG = this.add.graphics().setDepth(24); this.drawPad();
    // cartridge in
    this.cart = CONSOLE_GAMES[this.gameId]();
    const ctx: ConsoleCtx = {
      scene: this, screen: SCREEN, level: this.level, cityName: this.cityName, hazard: this.hazard, palette: this.palette, rng: this.rng,
      difficulty: this.launch.difficulty, hard: this.frame.hard, speed: this.frame.speed, depth: 2,
      setHearts: (n, max) => this.drawHearts(n, max), setStatus: (t) => this.statusT.setText(t), flash: (c, ms) => this.frame.flash(c, ms), shake: (ms, k) => this.frame.shake(ms, k), sfx: (n) => { try { Audio.playSfx(n as any); } catch { /* audio not unlocked yet */ } },
    };
    this.cart.init(ctx, (r) => { if (!this.frame.active) return; this.frame.finish(r.score, !!r.failed); });
    this.frame.capSec = this.cart.capSec > 0 ? this.cart.capSec : 24 * 3600; this.frame.scoreNow = () => this.cart?.scoreNow() ?? 0;
    // screen mask so games never draw over the bezel
    const maskShape = this.make.graphics({}); maskShape.fillStyle(0xffffff).fillRect(SCREEN.x, SCREEN.y, SCREEN.width, SCREEN.height);
    const mask = maskShape.createGeometryMask(); this.children.list.forEach(o => { const d = (o as any).depth; if (typeof d === 'number' && d >= 2 && d < 20 && (o as any).setMask) (o as any).setMask(mask); });
    (this as any)._screenMask = mask;
    // boot: chime, then the cartridge's title card (name, city, instructions, controls). It waits for START, A, or a tap on the
    // screen; nothing auto-starts and the play cap is not running until then.
    try { Audio.playSfx('chime'); } catch { /* not unlocked */ }
    const card = this.add.container(0, 0).setDepth(940); this.titleCard = card;
    card.add(this.add.rectangle(SCREEN.centerX, SCREEN.centerY, SCREEN.width, SCREEN.height, PAL.ink).setAlpha(0.94));
    card.add(txt(this, W / 2, SCREEN.y + 34, this.cart.name, 22, PAL.sun2)); card.add(txt(this, W / 2, SCREEN.y + 60, `— ${this.cityName.toUpperCase()} —`, 10, PAL.gray2));
    const instr = txt(this, W / 2, SCREEN.y + 118, this.cart.instructions, 10, PAL.white); instr.setWordWrapWidth(SCREEN.width - 60).setAlign('center'); card.add(instr);
    this.cart.controls.forEach((line, i) => card.add(txt(this, W / 2, SCREEN.y + 196 + i * 18, line, 9, PAL.gray2)));
    const go = txt(this, W / 2, SCREEN.bottom - 30, 'PRESS START · A · OR TAP THE SCREEN', 9, PAL.neon); card.add(go); this.tweens.add({ targets: go, alpha: 0.35, yoyo: true, repeat: -1, duration: 600 });
    const tap = (p: Phaser.Input.Pointer) => { if (Phaser.Geom.Rectangle.Contains(SCREEN, p.x, p.y)) this.beginPlay(); }; this.input.on('pointerdown', tap); (this as any)._tapToStart = tap;
    this.frame.hud(); this.frame.setProgress(''); this.frame.setTimer('');
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => { this.cart?.destroy(); this.cart = undefined; });
  }

  private drawBezel() {
    const g = this.add.graphics().setDepth(20);
    // body
    g.fillStyle(PAL.gray0).fillRect(0, 28, W, SCREEN.y - 28).fillRect(0, SCREEN.bottom, W, H - SCREEN.bottom);
    g.fillStyle(PAL.gray1, 0.35).fillRect(0, 28, W, 2); g.fillStyle(PAL.ink).fillRect(0, H - 3, W, 3);
    // screen frame
    // screen frame: bands above and below only (the screen itself is the cartridge's, depth 2..19)
    g.fillStyle(PAL.night0).fillRect(0, SCREEN.y - 10, W, 10).fillRect(0, SCREEN.bottom, W, 10); g.fillStyle(PAL.ink).fillRect(0, SCREEN.y - 2, W, 2).fillRect(0, SCREEN.bottom, W, 2);
    g.fillStyle(PAL.gray1, 0.5).fillRect(0, SCREEN.y - 10, W, 1).fillRect(0, SCREEN.bottom + 9, W, 1);
    // label strip
    txt(this, 12, 44, 'NOMAD BOY', 10, PAL.gray2, 'left').setDepth(21); txt(this, 12, 60, this.cityName.toUpperCase().slice(0, 18), 9, PAL.gray1, 'left').setDepth(21);
    this.led = this.add.arc(W - 20, 44, 5, 0, 360, false, PAL.red).setDepth(21); txt(this, W - 34, 44, 'PWR', 8, PAL.gray1, 'right').setDepth(21);
    this.heartsG = this.add.graphics().setDepth(21); this.statusT = txt(this, W - 12, 60, '', 10, PAL.sun2, 'right').setDepth(21);
    // speaker grille
    for (let i = 0; i < 5; i++) g.fillStyle(PAL.ink, 0.5).fillRect(W - 60 + i * 6, 86, 2, 12);
    txt(this, 12, 92, 'HANDHELD · TAKE IT ANYWHERE', 8, PAL.gray1, 'left').setDepth(21).setAlpha(0.7);
    // START / SELECT pills
    for (const [r, label] of [[LAYOUT.select, 'SELECT'], [LAYOUT.start, 'START']] as [Phaser.Geom.Rectangle, string][]) { panel(this, r.x, r.y, r.width, r.height, PAL.gray1, PAL.gray2, PAL.ink).setDepth(21); txt(this, r.centerX, r.bottom + 8, label, 7, PAL.gray2).setDepth(21); }
  }

  /** D-pad cross + A/B discs, pressed zones lit. Redrawn only when the pad state changes. */
  private drawPad() {
    const g = this.padG; g.clear(); const p = this.pad?.pressed; const L = LAYOUT; const arm = 22, len = 58;
    const lit = (k: PadKey) => (p && p[k]) ? PAL.gray2 : PAL.night1;
    g.fillStyle(PAL.ink).fillRoundedRect(L.dpad.x - len / 2 - 2, L.dpad.y - arm / 2 - 2, len + 4, arm + 4, 4).fillRoundedRect(L.dpad.x - arm / 2 - 2, L.dpad.y - len / 2 - 2, arm + 4, len + 4, 4);
    g.fillStyle(lit('left')).fillRect(L.dpad.x - len / 2, L.dpad.y - arm / 2, len / 2 - arm / 2, arm); g.fillStyle(lit('right')).fillRect(L.dpad.x + arm / 2, L.dpad.y - arm / 2, len / 2 - arm / 2, arm);
    g.fillStyle(lit('up')).fillRect(L.dpad.x - arm / 2, L.dpad.y - len / 2, arm, len / 2 - arm / 2); g.fillStyle(lit('down')).fillRect(L.dpad.x - arm / 2, L.dpad.y + arm / 2, arm, len / 2 - arm / 2);
    g.fillStyle(PAL.night1).fillRect(L.dpad.x - arm / 2, L.dpad.y - arm / 2, arm, arm); g.fillStyle(PAL.gray1, 0.6).fillCircle(L.dpad.x, L.dpad.y, 4);
    // arrows
    g.fillStyle(PAL.gray1, 0.8); g.fillTriangle(L.dpad.x - 22, L.dpad.y, L.dpad.x - 14, L.dpad.y - 5, L.dpad.x - 14, L.dpad.y + 5); g.fillTriangle(L.dpad.x + 22, L.dpad.y, L.dpad.x + 14, L.dpad.y - 5, L.dpad.x + 14, L.dpad.y + 5);
    g.fillTriangle(L.dpad.x, L.dpad.y - 22, L.dpad.x - 5, L.dpad.y - 14, L.dpad.x + 5, L.dpad.y - 14); g.fillTriangle(L.dpad.x, L.dpad.y + 22, L.dpad.x - 5, L.dpad.y + 14, L.dpad.x + 5, L.dpad.y + 14);
    for (const [k, c, col] of [['a', L.a, PAL.red], ['b', L.b, PAL.sun0]] as [PadKey, { x: number; y: number; r: number }, number][]) {
      g.fillStyle(PAL.ink).fillCircle(c.x, c.y + 3, c.r); g.fillStyle(p && p[k] ? PAL.pink : col).fillCircle(c.x, c.y + (p && p[k] ? 2 : 0), c.r - 2); g.fillStyle(PAL.white, 0.25).fillCircle(c.x - 6, c.y - 8, 5);
    }
    if (!this.children.getByName('lblA')) { txt(this, L.a.x, L.a.y + L.a.r + 10, 'A', 9, PAL.gray2).setDepth(25).setName('lblA'); txt(this, L.b.x, L.b.y + L.b.r + 10, 'B', 9, PAL.gray2).setDepth(25).setName('lblB'); }
  }
  private drawHearts(n: number, max: number) { const g = this.heartsG; g.clear(); for (let i = 0; i < max; i++) { const x = W / 2 - 20 + i * 14, y = 44; g.fillStyle(i < n ? PAL.red : PAL.night1).fillRect(x - 5, y - 3, 4, 3).fillRect(x + 1, y - 3, 4, 3).fillRect(x - 6, y, 12, 3).fillRect(x - 4, y + 3, 8, 2).fillRect(x - 2, y + 5, 4, 2); } }
  private onPadPress(k: PadKey) {
    if ((k === 'start' || k === 'a') && (this.frame as any).continueHandler) { (this.frame as any).continueHandler(); return; }   // result card: START / A = CONTINUE
    if ((k === 'start' || k === 'a') && !this.started && this.titleCard) { this.beginPlay(); return; }
    if (k === 'start' && this.started && this.frame.active) { this.paused = !this.paused; if (this.paused) { this.frame.pauseCap(); this.pauseT = txt(this, SCREEN.centerX, SCREEN.centerY, 'PAUSED', 24, PAL.white).setDepth(930); (this as any)._pauseBg = this.add.rectangle(SCREEN.centerX, SCREEN.centerY, SCREEN.width, SCREEN.height, PAL.ink, 0.6).setDepth(929); } else { this.frame.resumeCap(); this.pauseT?.destroy(); (this as any)._pauseBg?.destroy(); } }
    if (k === 'a' || k === 'b') { try { Audio.playSfx('blip'); } catch { /* */ } }
  }

  /** Title card dismissed by the player: start the play clock and hand the pad to the cartridge. */
  private beginPlay() {
    if (this.started || !this.titleCard) return; this.titleCard.destroy(); this.titleCard = undefined;
    const tap = (this as any)._tapToStart; if (tap) this.input.off('pointerdown', tap);
    try { Audio.playSfx('confirm'); } catch { /* */ }
    this.started = true; this.frame.beginPlay();
  }
  update(_t: number, dtMs: number) {
    this.frame.update(dtMs); this.pad.update();
    // anything a cartridge spawned since last frame gets clipped to the screen (bezel stays clean)
    const mask = (this as any)._screenMask; if (mask && (this.time.now | 0) % 6 === 0) this.children.list.forEach(o => { const a = o as any; if (typeof a.depth === 'number' && a.depth >= 2 && a.depth < 20 && !a.mask && a.setMask) a.setMask(mask); });
    const sig = JSON.stringify(this.pad.pressed); if (sig !== this.lastPad) { this.lastPad = sig; this.drawPad(); }
    this.ledT += dtMs; this.led.setFillStyle(this.paused ? PAL.sun2 : (Math.sin(this.ledT / 400) > -0.5 ? PAL.red : PAL.dusk1));
    if (!this.started || !this.frame.active || this.paused || !this.cart) return;
    this.cart.update(Math.min(0.05, dtMs / 1000), this.pad);
    this.frame.setTimer(this.cart.capSec > 0 ? `${Math.max(0, Math.ceil(this.frame.remaining))}s` : '');
  }
}
