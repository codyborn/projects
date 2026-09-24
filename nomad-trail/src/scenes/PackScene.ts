import Phaser from 'phaser';
import { itemIcon } from '../art/sprites';
import type { Item, PackedItem } from '../core/types';
import { PAL, txt, rect, type Label, clamp } from '../ui/theme';
import { Button } from '../ui/Button';
import { toast } from '../ui/Toast';
import { Sim, Data, getRun, putRun } from '../ui/simBridge';

// ---- layout ----
const CELL = 24;                                   // 8x10 grid -> 192x240
const GRID_X = 84, GRID_Y = 56;
const TRAY_Y = 344, TRAY_H = 640 - TRAY_Y;         // category strip + cards
const CAT_ROW_H = 26, CARD_Y = TRAY_Y + CAT_ROW_H + 4;
const CARD_W = 160, CARD_H = 250, CARD_GAP = 8, CARD_X0 = 12;
const CATS = ['ESSENTIALS', 'CLOTHES', 'HEALTH', 'ACTIVITY', 'COMFORT'];

/** Category of a bundle: essentials, clothes, health, activity, comfort. */
function groupOf(it: Item): number {
  const t = new Set<string>(it.tags);
  if (t.has('essential') || t.has('work')) return 0;
  if (['clothing', 'rain', 'cold', 'swim'].some(x => t.has(x))) return 1;
  if (['health', 'firstaid', 'meds', 'repellent', 'sleep'].some(x => t.has(x))) return 2;
  if (['fitness', 'kite', 'climb', 'hike', 'water', 'light', 'knife', 'camera'].some(x => t.has(x))) return 3;
  return 4;
}
/** Benefits shown on the card. Data-driven when the bundle has them; derived from tags otherwise. */
function benefitsOf(it: Item): string[] {
  if (it.benefits && it.benefits.length) return it.benefits.slice(0, 4);
  const t = new Set<string>(it.tags); const b: string[] = [];
  if (it.clothesDays) b.push(`+${it.clothesDays} days of clean clothes`);
  if (t.has('work')) b.push('lets you work and earn');
  if (t.has('coffee')) b.push('+15 energy every morning');
  if (t.has('health')) b.push('lower sickness risk');
  if (t.has('firstaid')) b.push('small cuts stay small');
  if (t.has('meds')) b.push('shorter illnesses, altitude help');
  if (t.has('sleep')) b.push('shorter jet lag');
  if (t.has('rain')) b.push('no soaked-through days');
  if (t.has('cold')) b.push('cold cities stop hurting');
  if (t.has('repellent')) b.push('mosquito nights defused');
  if (t.has('fitness')) b.push('workouts anywhere');
  if (t.has('climb')) b.push('climbing gyms and ferrata');
  if (t.has('kite')) b.push('wind days become the best days');
  if (t.has('hike')) b.push('+1 life in outdoor games');
  if (t.has('water')) b.push('safe water, no filter days');
  if (t.has('switch')) b.push('Carry-On on rest days');
  if (t.has('organizer')) b.push('nothing left behind');
  if (t.has('camera')) b.push('mood from the views');
  if (t.has('luxury') && !b.length) b.push('a little mood, some weight');
  if (t.has('kettle')) b.push('tea in every room');
  if (!b.length) b.push('comfort, at a cost in pounds');
  return b.slice(0, 4);
}

interface Placed { id: string; x: number; y: number; rot: boolean; obj: Phaser.GameObjects.Container; }

/** Packing: one suitcase, tap a card to pack it (auto-placed), tap a tile to take it out. Tray: swipe up/down = category, left/right = scroll. */
export class PackScene extends Phaser.Scene {
  static KEY = 'Pack';
  private cols = 8; private rows = 10; private maxLb = 50;
  private placed: Placed[] = []; private occ: boolean[][] = [];
  private wBar!: Phaser.GameObjects.Graphics; private wLabel!: Label; private hints!: Label;
  private trayAll!: Phaser.GameObjects.Container; private pages: Phaser.GameObjects.Container[] = []; private pageW: number[] = []; private scroll: number[] = [];
  private cat = 0; private catLabel!: Label; private dots: Phaser.GameObjects.Rectangle[] = [];
  private warnedNoLaptop = false; private animating = false;
  constructor() { super(PackScene.KEY); }

  create() {
    this.placed = []; this.pages = []; this.pageW = []; this.scroll = []; this.cat = 0; this.warnedNoLaptop = false; this.animating = false;
    const gs = Sim.gridSpecs.checked; this.cols = gs.cols; this.rows = gs.rows; this.maxLb = gs.maxLb;
    this.occ = Array.from({ length: this.rows }, () => Array(this.cols).fill(false));
    rect(this, 0, 0, 360, 640, PAL.night0);
    txt(this, 12, 10, 'PACK YOUR LIFE', 10, PAL.white);
    txt(this, 12, 26, 'one suitcase. choose well.', 8, PAL.gray1);
    new Button(this, 214, 26, 'SURPRISE', () => this.surprise(), { w: 76, h: 40, fill: PAL.dusk1, size: 8 });
    new Button(this, 306, 26, 'DEPART', () => this.depart(), { w: 96, h: 40, fill: PAL.sun0, size: 11 });
    // suitcase
    const w = this.cols * CELL, h = this.rows * CELL; const gg = this.add.graphics();
    gg.fillStyle(PAL.ink, 1); gg.fillRect(GRID_X + 3, GRID_Y + 4, w, h); gg.fillStyle(PAL.night1, 1); gg.fillRect(GRID_X, GRID_Y, w, h);
    gg.lineStyle(1, PAL.night3, 1); for (let c = 0; c <= this.cols; c++) gg.lineBetween(GRID_X + c * CELL + 0.5, GRID_Y, GRID_X + c * CELL + 0.5, GRID_Y + h); for (let r = 0; r <= this.rows; r++) gg.lineBetween(GRID_X, GRID_Y + r * CELL + 0.5, GRID_X + w, GRID_Y + r * CELL + 0.5);
    gg.lineStyle(2, PAL.gray1, 1); gg.strokeRect(GRID_X + 1, GRID_Y + 1, w - 2, h - 2);
    // handle
    gg.fillStyle(PAL.gray1, 1); gg.fillRect(GRID_X + w / 2 - 22, GRID_Y - 8, 44, 6); gg.fillRect(GRID_X + w / 2 - 22, GRID_Y - 8, 5, 10); gg.fillRect(GRID_X + w / 2 + 17, GRID_Y - 8, 5, 10);
    // side notes
    txt(this, GRID_X - 6, GRID_Y + 4, 'tap tile\nto take\nit out', 8, PAL.gray0, { align: 'right' }).setOrigin(1, 0);
    txt(this, GRID_X + w + 6, GRID_Y + 4, 'tap card\nbelow to\npack it', 8, PAL.gray0).setOrigin(0, 0);
    this.wBar = this.add.graphics(); this.wLabel = txt(this, 180, GRID_Y + h + 12, '', 8, PAL.gray2, { align: 'center' }).setOrigin(0.5, 0);
    this.hints = txt(this, 180, GRID_Y + h + 24, '', 8, PAL.sun1, { align: 'center' }).setOrigin(0.5, 0);
    // tray
    rect(this, 0, TRAY_Y, 360, TRAY_H, PAL.night1);
    this.buildCatRow();
    this.trayAll = this.add.container(0, 0);   // pages live inside; only the current one is visible (Containers cannot be masked here)
    this.renderTray();
    const zone = this.add.zone(180, TRAY_Y + TRAY_H / 2, 360, TRAY_H).setInteractive({ draggable: true }); this.setupTrayInput(zone);
    // restore a saved pack
    const run = getRun(this); for (const p of run.items) { const it = Data.item(p.id); if (it && this.fits(p.x, p.y, it.w, it.h)) this.place(it, p.x, p.y, false, false); }
    // a fresh run starts with the essentials already in the suitcase (laptop, toiletries, watch); the player decides the rest
    if (!run.items.length && !this.placed.length) for (const it of Data.items.filter(i => i.tags.includes('essential'))) { const f = this.firstFit(it); if (f) this.place(it, f.x, f.y, f.rot, false); }
    this.renderTray(); this.refreshWeights();
  }

  // ---- category row ----
  private buildCatRow() {
    const y = TRAY_Y + 4;
    const left = txt(this, 14, y + 4, '▲', 10, PAL.gray1); const right = txt(this, 346, y + 4, '▼', 10, PAL.gray1).setOrigin(1, 0);
    (left as any).setText?.('^'); (right as any).setText?.('v');
    this.catLabel = txt(this, 180, y + 4, CATS[0], 10, PAL.sun2, { align: 'center' }).setOrigin(0.5, 0);
    this.dots = CATS.map((_, i) => this.add.rectangle(180 - (CATS.length - 1) * 5 + i * 10, y + 20, 5, 3, i === 0 ? PAL.sun2 : PAL.night3).setOrigin(0.5, 0));
    txt(this, 180, TRAY_Y + TRAY_H - 10, 'swipe up / down: category · left / right: browse', 8, PAL.gray0, { align: 'center' }).setOrigin(0.5, 1).setDepth(5);
  }
  /** Category change: the old page slides a little and fades inside the tray band, the new one slides in from the other side. No clipping needed. */
  private setCat(i: number, animate = true) {
    i = clamp(i, 0, CATS.length - 1); const from = this.cat; const out = this.pages[from];
    if (i === from) { if (out) this.tweens.add({ targets: out, y: 0, alpha: 1, duration: 110, ease: 'Cubic.Out' }); return; }
    const dir = i > from ? 1 : -1; this.cat = i; this.catLabel.setText(CATS[i]); this.dots.forEach((d, k) => d.setFillStyle(k === i ? PAL.sun2 : PAL.night3));
    const inn = this.pages[i]; if (!inn) return;
    if (!animate) { if (out) { out.setVisible(false); out.y = 0; out.alpha = 1; } inn.setVisible(true); inn.y = 0; inn.alpha = 1; return; }
    if (out) this.tweens.add({ targets: out, y: -dir * 40, alpha: 0, duration: 100, ease: 'Cubic.In', onComplete: () => { out.setVisible(false); out.y = 0; out.alpha = 1; } });
    inn.setVisible(true); inn.y = dir * 40; inn.alpha = 0; this.tweens.add({ targets: inn, y: 0, alpha: 1, duration: 150, ease: 'Cubic.Out' });
  }

  // ---- tray ----
  /** Unpacked bundles for a category, one card per stack (items sharing a name, e.g. the weeks of clothes). */
  private trayItems(cat: number): Item[] {
    const packed = new Set(this.placed.map(p => p.id)); const seen = new Set<string>();
    return Data.items.filter(it => groupOf(it) === cat && !packed.has(it.id)).filter(it => { if (seen.has(it.name)) return false; seen.add(it.name); return true; });
  }
  private stackLeft(it: Item) { const packed = new Set(this.placed.map(p => p.id)); return Data.items.filter(x => x.name === it.name && !packed.has(x.id)).length; }
  private renderTray() {
    this.trayAll.removeAll(true); this.pages = []; this.pageW = [];
    CATS.forEach((_, ci) => {
      const page = this.add.container(0, 0).setVisible(ci === this.cat); const items = this.trayItems(ci); let x = CARD_X0;
      if (!items.length) page.add(txt(this, 180, CARD_Y + 100, 'all packed', 10, PAL.gray1, { align: 'center' }).setOrigin(0.5) as any);
      for (const it of items) { page.add(this.card(it, x, CARD_Y)); x += CARD_W + CARD_GAP; }
      this.pages.push(page); this.pageW.push(x); this.scroll[ci] = clamp(this.scroll[ci] ?? 0, 0, Math.max(0, x - 348)); page.x = -this.scroll[ci];
      this.trayAll.add(page);
    });
  }
  private card(it: Item, x: number, y: number) {
    const c = this.add.container(x, y); const bg = this.add.graphics();
    bg.fillStyle(PAL.ink, 1); bg.fillRect(2, 3, CARD_W, CARD_H); bg.fillStyle(PAL.night2, 1); bg.fillRect(0, 0, CARD_W, CARD_H); bg.lineStyle(1, PAL.night3, 1); bg.strokeRect(0.5, 0.5, CARD_W - 1, CARD_H - 1); c.add(bg);
    const left = this.stackLeft(it); if (left > 1) c.add(txt(this, CARD_W - 6, 4, `x${left}`, 8, PAL.sun2).setOrigin(1, 0) as any);
    const cell = Math.max(8, Math.min(14, Math.floor(110 / Math.max(it.w, it.h))));
    const mini = this.itemBox(it, it.w, it.h, cell); mini.setPosition((CARD_W - it.w * cell) / 2, 14 + Math.max(0, (64 - it.h * cell) / 2)); c.add(mini);
    c.add(txt(this, CARD_W / 2, 86, it.name, 10, PAL.white, { align: 'center', wrap: CARD_W - 8 }).setOrigin(0.5, 0) as any);
    c.add(txt(this, CARD_W / 2, 114, `${it.weightLb.toFixed(1)} lb · ${it.w}x${it.h}`, 8, PAL.sun2, { align: 'center' }).setOrigin(0.5, 0) as any);
    const lines = benefitsOf(it); let by = 132;
    for (const l of lines) { if (by > CARD_H - 40) break; c.add(this.add.rectangle(8, by + 3, 3, 3, PAL.neon).setOrigin(0, 0)); const t = txt(this, 14, by, l, 8, PAL.gray2, { wrap: CARD_W - 22 }).setOrigin(0, 0); c.add(t as any); by += Math.max(11, Math.round(((t as any).height ?? 8) + 3)); }
    c.add(txt(this, CARD_W / 2, CARD_H - 14, 'TAP TO PACK', 8, PAL.sea2, { align: 'center' }).setOrigin(0.5, 0) as any);
    (c as any).item = it; return c;
  }
  private setupTrayInput(zone: Phaser.GameObjects.Zone) {
    let start: { x: number; y: number; scroll: number; mode: 'none' | 'h' | 'v'; t: number } | null = null;
    zone.on('pointerdown', (p: Phaser.Input.Pointer) => { start = { x: p.x, y: p.y, scroll: this.scroll[this.cat] ?? 0, mode: 'none', t: this.time.now }; });
    zone.on('drag', (p: Phaser.Input.Pointer) => {
      if (!start) return; const dx = p.x - start.x, dy = p.y - start.y;
      if (start.mode === 'none') { if (Math.abs(dx) > 6 || Math.abs(dy) > 6) start.mode = Math.abs(dy) > Math.abs(dx) ? 'v' : 'h'; else return; }
      if (start.mode === 'h') { const page = this.pages[this.cat]; const max = Math.max(0, (this.pageW[this.cat] ?? 0) - 348); this.scroll[this.cat] = clamp(start.scroll - dx, -40, max + 40); page.x = -this.scroll[this.cat]; }
      else { const pg = this.pages[this.cat]; if (pg) { pg.y = clamp(dy, -90, 90) * 0.9; pg.alpha = 1 - Math.min(0.5, Math.abs(dy) / 160); } }
    });
    const release = (p: Phaser.Input.Pointer) => {
      if (!start) return; const dx = p.x - start.x, dy = p.y - start.y; const st = start; start = null;
      if (st.mode === 'v') { const pg = this.pages[this.cat]; const fast = Math.abs(dy) / Math.max(1, this.time.now - st.t) > 0.35; if ((dy < -22 || (fast && dy < 0)) && this.cat < CATS.length - 1) this.setCat(this.cat + 1); else if ((dy > 22 || (fast && dy > 0)) && this.cat > 0) this.setCat(this.cat - 1); else if (pg) this.tweens.add({ targets: pg, y: 0, alpha: 1, duration: 160, ease: 'Cubic.Out' }); return; }
      if (st.mode === 'h') { const max = Math.max(0, (this.pageW[this.cat] ?? 0) - 348); this.scroll[this.cat] = clamp(this.scroll[this.cat], 0, max); this.tweens.add({ targets: this.pages[this.cat], x: -this.scroll[this.cat], duration: 180, ease: 'Cubic.Out' }); return; }
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8 && this.time.now - st.t < 600) this.tapTray(p);
    };
    zone.on('dragend', release); zone.on('pointerup', release);
  }
  private tapTray(p: Phaser.Input.Pointer) {
    if (this.animating) return; const page = this.pages[this.cat]; if (!page) return;
    for (const c of page.list as Phaser.GameObjects.Container[]) {
      const it = (c as any).item as Item | undefined; if (!it) continue;
      const sx = c.x + page.x, sy = c.y + page.y;
      if (p.x >= sx && p.x <= sx + CARD_W && p.y >= sy && p.y <= sy + CARD_H) { this.packFromCard(it, sx + CARD_W / 2, sy + 50); return; }
    }
  }
  /** Tap-to-pack: first-fit (unrotated, then rotated), tile flies from the card into its slot. */
  private packFromCard(it: Item, fromX: number, fromY: number) {
    const slot = this.firstFit(it);
    if (!slot) { this.cameras.main.shake(90, 0.005); toast(this, 'No room. Take something out.', PAL.red, 1100); return; }
    const p = this.place(it, slot.x, slot.y, slot.rot, false); const tx = p.obj.x, ty = p.obj.y;
    p.obj.setPosition(fromX - (p.obj.width || CELL) / 2, fromY); p.obj.setScale(0.5); p.obj.setDepth(150); this.animating = true;
    this.tweens.add({ targets: p.obj, x: tx, y: ty, scaleX: 1, scaleY: 1, duration: 260, ease: 'Cubic.Out', onComplete: () => { p.obj.setDepth(0); this.animating = false; this.cameras.main.shake(40, 0.003); } });
    this.renderTray(); this.refreshWeights();
  }
  private firstFit(it: Item): { x: number; y: number; rot: boolean } | null {
    // the engine validates footprints as authored (no rotation), so only unrotated placements are legal
    const [w, h] = this.dimsArr(it, false); for (let y = 0; y <= this.rows - h; y++) for (let x = 0; x <= this.cols - w; x++) if (this.fits(x, y, w, h)) return { x, y, rot: false };
    return null;
  }

  // ---- grid ----
  private dimsArr(it: Item, rot: boolean): [number, number] { return rot ? [it.h, it.w] : [it.w, it.h]; }
  private fits(x: number, y: number, w: number, h: number) {
    if (x < 0 || y < 0 || x + w > this.cols || y + h > this.rows) return false;
    for (let r = y; r < y + h; r++) for (let c = x; c < x + w; c++) if (this.occ[r][c]) return false; return true;
  }
  private mark(p: Placed, v: boolean) { const it = Data.item(p.id)!; const [w, h] = this.dimsArr(it, p.rot); for (let r = p.y; r < p.y + h; r++) for (let c = p.x; c < p.x + w; c++) this.occ[r][c] = v; }
  private itemBox(it: Item, w: number, h: number, cell: number) {
    const c = this.add.container(0, 0); const g = this.add.graphics();
    g.fillStyle(PAL.ink, 1); g.fillRect(2, 3, w * cell - 2, h * cell - 2); g.fillStyle(it.color, 1); g.fillRect(1, 1, w * cell - 3, h * cell - 3);
    g.fillStyle(PAL.white, 0.22); g.fillRect(2, 2, w * cell - 5, 2); g.lineStyle(1, PAL.ink, 1); g.strokeRect(1.5, 1.5, w * cell - 4, h * cell - 4);
    c.add(g);
    const big = w * cell >= 66 && h * cell >= 62;
    try { const key = itemIcon(this, it); const ic = this.add.image((w * cell) / 2, big ? (h * cell) / 2 - 8 : (h * cell) / 2, key).setOrigin(0.5); if (!big && (w * cell < 20 || h * cell < 20)) ic.setScale(0.75); c.add(ic); } catch { /* icon optional */ }
    if (big) c.add(txt(this, (w * cell) / 2, (h * cell) / 2 + 8, it.label, 8, PAL.white, { align: 'center', wrap: w * cell - 4 }).setOrigin(0.5, 0) as any);
    c.setSize(w * cell, h * cell); return c;
  }
  private place(it: Item, x: number, y: number, rot: boolean, animate = true): Placed {
    const [w, h] = this.dimsArr(it, rot); const obj = this.itemBox(it, w, h, CELL); obj.setPosition(GRID_X + x * CELL, GRID_Y + y * CELL);
    const p: Placed = { id: it.id, x, y, rot, obj }; this.placed.push(p); this.mark(p, true);
    // Container hit areas are offset by displayOrigin (w/2, h/2); this tile is drawn from its top-left, so the rect starts at (w/2, h/2).
    obj.setInteractive(new Phaser.Geom.Rectangle(w * CELL / 2, h * CELL / 2, w * CELL, h * CELL), Phaser.Geom.Rectangle.Contains);
    obj.on('pointerup', (ptr: Phaser.Input.Pointer) => {
      if (Math.abs(ptr.downX - ptr.upX) > 10 || Math.abs(ptr.downY - ptr.upY) > 10) return;
      const now = this.time.now;
      void now; if (!this.placed.includes(p)) return; this.unpack(p);   // single tap takes it out (no rotation: the engine validates footprints as authored)
    });
    if (animate) { obj.setScale(1.15); this.tweens.add({ targets: obj, scaleX: 1, scaleY: 1, duration: 140, ease: 'Back.Out' }); }
    return p;
  }
  private unpack(p: Placed) {
    const it = Data.item(p.id)!; this.mark(p, false); this.placed = this.placed.filter(x => x !== p);
    this.tweens.add({ targets: p.obj, y: TRAY_Y + 40, alpha: 0, scaleX: 0.6, scaleY: 0.6, duration: 220, ease: 'Quad.In', onComplete: () => p.obj.destroy() });
    this.setCat(groupOf(it)); this.renderTray(); this.refreshWeights(); toast(this, `${it.name} back on the floor`, PAL.gray2, 700);
  }
  private clearGrid() { for (const p of this.placed) p.obj.destroy(); this.placed = []; this.occ = Array.from({ length: this.rows }, () => Array(this.cols).fill(false)); }

  // ---- surprise me ----
  private surprise() {
    if (this.animating) return;
    const run = getRun(this); const pick = Sim.randomPack((run.seed ?? 1) + (Date.now() % 1000));
    this.clearGrid(); let i = 0; this.animating = true;
    for (const pi of pick) { const it = Data.item(pi.id); if (!it) continue; if (!this.fits(pi.x, pi.y, it.w, it.h)) continue;
      const p = this.place(it, pi.x, pi.y, false, false); const tx = p.obj.x, ty = p.obj.y; p.obj.setPosition(tx, -60).setAlpha(0);
      this.tweens.add({ targets: p.obj, y: ty, alpha: 1, duration: 260, delay: i * 45, ease: 'Bounce.Out' }); i++; }
    this.time.delayedCall(i * 45 + 300, () => { this.animating = false; this.cameras.main.shake(60, 0.004); });
    this.renderTray(); this.refreshWeights(); toast(this, 'Packed by someone who does not care.', PAL.sun2, 1200);
  }

  // ---- weights & hints ----
  private refreshWeights() {
    let lb = 0; const tags = new Set<string>(); let clothes = 0;
    for (const p of this.placed) { const it = Data.item(p.id); if (!it) continue; lb += it.weightLb; it.tags.forEach(t => tags.add(t)); clothes += it.clothesDays ?? 0; }
    const pct = lb / this.maxLb; const gw = this.cols * CELL, by = GRID_Y + this.rows * CELL + 6;
    this.wBar.clear(); this.wBar.fillStyle(PAL.ink, 1); this.wBar.fillRect(GRID_X, by, gw, 6); this.wBar.fillStyle(pct > 1 ? PAL.red : pct >= 0.9 ? PAL.sun1 : PAL.sea2, 1); this.wBar.fillRect(GRID_X, by, Math.min(1, pct) * gw, 6);
    this.wLabel.setText(`${lb.toFixed(1)} / ${this.maxLb} lb${pct > 1 ? ' · OVER THE LIMIT' : pct >= 0.9 ? ' · heavy' : ''}`); this.wLabel.setTint?.(pct > 1 ? PAL.red : pct >= 0.9 ? PAL.sun1 : PAL.gray2);
    const h: string[] = [];
    // one line each, max 40 chars (8 px per char at size 8 on a 340 px screen)
    if (pct >= 0.9) h.push('! heavy bag: back risk, slow travel'); if (!tags.has('work')) h.push('! no laptop: no work, no pay'); if (clothes < 7) h.push(`! ${clothes} days of clothes: laundry often`);
    if (!tags.has('firstaid') && !tags.has('meds')) h.push('! nothing for cuts or fevers'); if (!tags.has('health') && !tags.has('fitness')) h.push('! no health kit: sickness risk');
    if (tags.has('coffee')) h.push('+ coffee mornings'); if (tags.has('switch')) h.push('+ Carry-On on rest days');
    this.hints.setText(h.slice(0, 2).join('\n'));
  }
  private depart() {
    const run = getRun(this); const packed: PackedItem[] = this.placed.map(p => ({ id: p.id, bag: 'checked', x: p.x, y: p.y, rot: p.rot }));
    if (!packed.length) { toast(this, 'You need at least a toothbrush.', PAL.red); return; }
    const hasWork = this.placed.some(p => (Data.item(p.id)?.tags ?? []).some(t => t === 'work' || t === 'essential'));
    if (!hasWork && !this.warnedNoLaptop) { this.warnedNoLaptop = true; toast(this, 'No laptop. No income. Tap DEPART again to go anyway.', PAL.sun1, 2200); return; }
    const res = Sim.setPack(run, packed);
    if (!res.ok) { res.errors.forEach(e => toast(this, e, PAL.red)); this.cameras.main.shake(120, 0.006); return; }
    putRun(this, run); this.cameras.main.fadeOut(250, 0, 0, 0); this.time.delayedCall(260, () => this.scene.start('Route'));
  }
}
export default PackScene;
