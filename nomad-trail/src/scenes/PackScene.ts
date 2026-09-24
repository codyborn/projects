import Phaser from 'phaser';
import { itemIcon } from '../art/sprites';
import type { Item, PackedItem, Bag } from '../core/types';
import { PAL, txt, rect, type Label, hex, clamp } from '../ui/theme';
import { Button } from '../ui/Button';
import { Panel } from '../ui/Panel';
import { toast } from '../ui/Toast';
import { Sim, Data, getRun, putRun } from '../ui/simBridge';

const CELL = 22;
const CARD_W = 160, CARD_H = 250, CARD_GAP = 8, TRAY_Y = 336, COMBINED_LB = 75;
/** Tray order: essentials, clothes, health, activity, comfort, traps. */
function groupOf(it: Item): number {
  const t = new Set<string>(it.tags);
  if (t.has('trap') || t.has('kettle')) return 5;
  if (t.has('essential') || t.has('work')) return 0;
  if (['clothing', 'rain', 'cold', 'swim'].some(x => t.has(x))) return 1;
  if (['health', 'firstaid', 'meds', 'repellent', 'sleep'].some(x => t.has(x))) return 2;
  if (['fitness', 'kite', 'climb', 'hike', 'water', 'light', 'knife', 'camera'].some(x => t.has(x))) return 3;
  return 4;
}
interface Placed { id: string; bag: Bag; x: number; y: number; rot: boolean; obj: Phaser.GameObjects.Container; }
interface GridSpec { bag: Bag; x: number; y: number; cols: number; rows: number; maxLb: number; }

/** Tetris packing: two bags, horizontal item tray by category, drag to place, double-tap to rotate, drop outside to unpack. */
export class PackScene extends Phaser.Scene {
  static KEY = 'Pack';
  private grids!: Record<Bag, GridSpec>; private placed: Placed[] = []; private totalLbl!: Label;
  private trayC!: Phaser.GameObjects.Container; private trayMask!: Phaser.GameObjects.Graphics; private trayScroll = 0; private trayW = 0;
  private wLabel!: Record<Bag, Label>; private wBar!: Record<Bag, Phaser.GameObjects.Graphics>; private hints!: Label; private pendingRemove?: Phaser.Time.TimerEvent;
  private lastTap: { id: string; t: number } | null = null; private warnedNoLaptop = false; private ghost?: Phaser.GameObjects.Container; private occupancy!: Record<Bag, boolean[][]>;
  constructor() { super(PackScene.KEY); }
  create() {
    this.placed = []; this.trayScroll = 0; this.warnedNoLaptop = false; this.pendingRemove = undefined;
    const gs = Sim.gridSpecs;
    this.grids = { checked: { bag: 'checked', x: 12, y: 58, cols: gs.checked.cols, rows: gs.checked.rows, maxLb: gs.checked.maxLb },
                   backpack: { bag: 'backpack', x: 222, y: 58, cols: gs.backpack.cols, rows: gs.backpack.rows, maxLb: gs.backpack.maxLb } };
    rect(this, 0, 0, 360, 640, PAL.night0);
    txt(this, 12, 8, 'PACK YOUR LIFE', 16, PAL.white);
    this.totalLbl = txt(this, 12, 30, '', 9, PAL.sun2);
    new Button(this, 300, 26, 'DEPART', () => this.depart(), { w: 100, h: 44, fill: PAL.sun0, size: 12 });
    this.wLabel = {} as any; this.wBar = {} as any;
    for (const g of Object.values(this.grids)) {
      const w = g.cols * CELL, h = g.rows * CELL;
      const gg = this.add.graphics(); gg.fillStyle(PAL.ink, 1); gg.fillRect(g.x + 2, g.y + 3, w, h); gg.fillStyle(PAL.night1, 1); gg.fillRect(g.x, g.y, w, h);
      gg.lineStyle(1, PAL.night3, 1); for (let c = 0; c <= g.cols; c++) gg.lineBetween(g.x + c * CELL + 0.5, g.y, g.x + c * CELL + 0.5, g.y + h); for (let r = 0; r <= g.rows; r++) gg.lineBetween(g.x, g.y + r * CELL + 0.5, g.x + w, g.y + r * CELL + 0.5);
      gg.lineStyle(1, PAL.gray1, 1); gg.strokeRect(g.x + 0.5, g.y + 0.5, w - 1, h - 1);
      txt(this, g.x, g.y - 12, g.bag === 'checked' ? 'CHECKED · delayable' : 'BACKPACK · on you', 8, PAL.gray2);
      this.wBar[g.bag] = this.add.graphics(); this.wLabel[g.bag] = txt(this, g.x, g.y + h + 12, '', 8, PAL.gray2);
    }
    // backpack is shorter: put a "tips" box under it
    const bp = this.grids.backpack; new Panel(this, bp.x, bp.y + bp.rows * CELL + 30, bp.cols * CELL, 80, { fill: PAL.night1 });
    this.hints = txt(this, bp.x + 4, bp.y + bp.rows * CELL + 34, '', 8, PAL.sun1, { wrap: bp.cols * CELL - 8 });
    // tray: one horizontal strip of bundles, sorted essentials → traps
    rect(this, 0, TRAY_Y, 360, 640 - TRAY_Y, PAL.night1); txt(this, 12, TRAY_Y + 6, 'drag UP to pack · tap to remove', 8, PAL.gray1);
    this.trayC = this.add.container(0, 0); this.trayMask = this.make.graphics({}); this.trayMask.fillRect(0, TRAY_Y + 18, 360, 640 - TRAY_Y - 18); this.trayC.setMask(this.trayMask.createGeometryMask());
    const zone = this.add.zone(180, (TRAY_Y + 18 + 640) / 2, 360, 640 - TRAY_Y - 18).setInteractive({ draggable: true }); this.setupTrayInput(zone);
    this.occupancy = { checked: this.emptyOcc('checked'), backpack: this.emptyOcc('backpack') };
    const run = getRun(this); for (const p of run.items) { const it = Data.item(p.id); if (it) this.place(it, p.bag, p.x, p.y, !!(p as any).rot, false); }
    this.renderTray(); this.refreshWeights();
  }
  private emptyOcc(b: Bag) { const g = this.grids[b]; return Array.from({ length: g.rows }, () => Array(g.cols).fill(false)); }
  private dims(it: Item, rot: boolean) { return rot ? { w: it.h, h: it.w } : { w: it.w, h: it.h }; }
  private fits(b: Bag, x: number, y: number, w: number, h: number, ignore?: Placed) {
    const g = this.grids[b]; if (x < 0 || y < 0 || x + w > g.cols || y + h > g.rows) return false;
    for (let r = y; r < y + h; r++) for (let c = x; c < x + w; c++) if (this.occupancy[b][r][c]) return false; return true;
  }
  private mark(p: Placed, v: boolean) { const it = Data.item(p.id)!; const d = this.dims(it, p.rot); for (let r = p.y; r < p.y + d.h; r++) for (let c = p.x; c < p.x + d.w; c++) this.occupancy[p.bag][r][c] = v; }
  private itemBox(it: Item, w: number, h: number, cell: number, alpha = 1) {
    const c = this.add.container(0, 0); const g = this.add.graphics();
    g.fillStyle(PAL.ink, alpha); g.fillRect(2, 3, w * cell - 2, h * cell - 2); g.fillStyle(it.color, alpha); g.fillRect(1, 1, w * cell - 3, h * cell - 3);
    g.fillStyle(PAL.white, 0.22 * alpha); g.fillRect(2, 2, w * cell - 5, 2); g.lineStyle(1, PAL.ink, alpha); g.strokeRect(1.5, 1.5, w * cell - 4, h * cell - 4);
    c.add(g);
    const big = w * cell >= 66 && h * cell >= 62;   // label only when there is room under the icon
    try { const key = itemIcon(this, it); const ic = this.add.image((w * cell) / 2, big ? (h * cell) / 2 - 8 : (h * cell) / 2, key).setOrigin(0.5); if (!big && (w * cell < 20 || h * cell < 20)) ic.setScale(0.75); c.add(ic); } catch {}
    if (big) { const l = txt(this, (w * cell) / 2, (h * cell) / 2 + 8, it.label, 8, PAL.white, { align: 'center', wrap: w * cell - 4 }).setOrigin(0.5, 0); c.add(l as any); }
    return c;
  }
  private place(it: Item, b: Bag, x: number, y: number, rot: boolean, animate = true) {
    const g = this.grids[b]; const d = this.dims(it, rot); const obj = this.itemBox(it, d.w, d.h, CELL); obj.setPosition(g.x + x * CELL, g.y + y * CELL);
    const p: Placed = { id: it.id, bag: b, x, y, rot, obj }; this.placed.push(p); this.mark(p, true);
    obj.setSize(d.w * CELL, d.h * CELL); obj.setInteractive(new Phaser.Geom.Rectangle(0, 0, d.w * CELL, d.h * CELL), Phaser.Geom.Rectangle.Contains); this.input.setDraggable(obj);
    obj.on('dragstart', () => { this.mark(p, false); obj.setDepth(100); this.tweens.add({ targets: obj, scaleX: 1.06, scaleY: 1.06, duration: 80 }); });
    obj.on('drag', (_ptr: any, dx: number, dy: number) => obj.setPosition(dx, dy));
    obj.on('dragend', (ptr: Phaser.Input.Pointer) => { obj.setScale(1); this.dropPlaced(p, ptr); });
    obj.on('pointerup', (ptr: Phaser.Input.Pointer) => {
      if (Math.abs(ptr.downX - ptr.upX) > 8 || Math.abs(ptr.downY - ptr.upY) > 8) return;          // that was a drag
      const now = this.time.now;
      if (this.lastTap && this.lastTap.id === it.id && now - this.lastTap.t < 320) { this.pendingRemove?.remove(false); this.pendingRemove = undefined; this.lastTap = null; this.rotate(p); return; }
      this.lastTap = { id: it.id, t: now };
      // single tap removes, unless a second tap (rotate) arrives within the double-tap window
      this.pendingRemove?.remove(false);
      this.pendingRemove = this.time.delayedCall(330, () => { if (this.placed.includes(p)) { this.remove(p); this.refreshWeights(); toast(this, `${it.label} back on the floor`, PAL.gray2, 700); } });
    });
    if (animate) { obj.setScale(1.15); this.tweens.add({ targets: obj, scaleX: 1, scaleY: 1, duration: 140, ease: 'Back.Out' }); }
    return p;
  }
  private rotate(p: Placed) {
    const it = Data.item(p.id)!; this.mark(p, false); const d = this.dims(it, !p.rot);
    if (this.fits(p.bag, p.x, p.y, d.w, d.h)) { this.remove(p, false); this.place(it, p.bag, p.x, p.y, !p.rot); this.refreshWeights(); } else { this.mark(p, true); this.tweens.add({ targets: p.obj, x: p.obj.x + 3, duration: 40, yoyo: true, repeat: 2 }); }
  }
  private remove(p: Placed, toTray = true) { this.mark(p, false); this.placed = this.placed.filter(x => x !== p); p.obj.destroy(); if (toTray) { this.renderTray(); } }
  private cellAt(px: number, py: number, w: number, h: number): { bag: Bag; x: number; y: number } | null {
    for (const g of Object.values(this.grids)) {
      const cx = Math.round((px - g.x) / CELL), cy = Math.round((py - g.y) / CELL);
      if (px + w * CELL / 2 > g.x - CELL && px < g.x + g.cols * CELL + CELL && py + h * CELL / 2 > g.y - CELL && py < g.y + g.rows * CELL + CELL) return { bag: g.bag, x: clamp(cx, 0, g.cols - w), y: clamp(cy, 0, g.rows - h) };
    }
    return null;
  }
  private dropPlaced(p: Placed, ptr: Phaser.Input.Pointer) {
    const it = Data.item(p.id)!; const d = this.dims(it, p.rot); const tgt = this.cellAt(p.obj.x, p.obj.y, d.w, d.h); p.obj.setDepth(0);
    if (tgt && this.fits(tgt.bag, tgt.x, tgt.y, d.w, d.h)) { p.bag = tgt.bag; p.x = tgt.x; p.y = tgt.y; const g = this.grids[p.bag]; this.tweens.add({ targets: p.obj, x: g.x + p.x * CELL, y: g.y + p.y * CELL, duration: 90 }); this.mark(p, true); }
    else if (ptr.y > TRAY_Y || !tgt) { this.remove(p); toast(this, `${it.label} back on the floor`, PAL.gray2, 900); }
    else { const g = this.grids[p.bag]; this.tweens.add({ targets: p.obj, x: g.x + p.x * CELL, y: g.y + p.y * CELL, duration: 160, ease: 'Back.Out' }); this.mark(p, true); }
    this.refreshWeights();
  }
  // ---- tray ----
  private trayItems(): Item[] {
    const packed = new Set(this.placed.map(p => p.id));
    return Data.items.filter(it => !packed.has(it.id)).map((it, i) => ({ it, i })).sort((a, b) => (groupOf(a.it) - groupOf(b.it)) || (a.i - b.i)).map(x => x.it);
  }
  private renderTray() {
    this.trayC.removeAll(true); const items = this.trayItems(); let x = 12; const y = TRAY_Y + 24;
    if (!items.length) this.trayC.add(txt(this, 180, 470, 'everything is packed', 10, PAL.gray1).setOrigin(0.5) as any);
    let lastGroup = -1;
    for (const it of items) {
      const g = groupOf(it); const c = this.add.container(x, y);
      const bg = this.add.graphics(); bg.fillStyle(PAL.ink, 1); bg.fillRect(2, 3, CARD_W, CARD_H); bg.fillStyle(PAL.night2, 1); bg.fillRect(0, 0, CARD_W, CARD_H); bg.lineStyle(1, g === 5 ? PAL.pink : PAL.night3, 1); bg.strokeRect(0.5, 0.5, CARD_W - 1, CARD_H - 1); c.add(bg);
      if (g !== lastGroup) { c.add(txt(this, 6, 4, ['ESSENTIALS', 'CLOTHES', 'HEALTH', 'ACTIVITY', 'COMFORT', 'BOLD CHOICES'][g], 8, g === 5 ? PAL.pink : PAL.sun2) as any); lastGroup = g; }
      const cell = Math.max(8, Math.min(14, Math.floor(120 / Math.max(it.w, it.h))));
      const mini = this.itemBox(it, it.w, it.h, cell); mini.setPosition((CARD_W - it.w * cell) / 2, 18 + Math.max(0, (70 - it.h * cell) / 2)); c.add(mini);
      c.add(txt(this, CARD_W / 2, 96, it.label, 10, PAL.white, { align: 'center', wrap: CARD_W - 8 }).setOrigin(0.5, 0) as any);
      c.add(txt(this, CARD_W / 2, 126, `${it.weightLb.toFixed(1)} lb · ${it.w}×${it.h}`, 8, PAL.sun2, { align: 'center' }).setOrigin(0.5, 0) as any);
      const d = it.desc.length > 84 ? it.desc.slice(0, 82) + '…' : it.desc; c.add(txt(this, 6, 142, d, 8, PAL.gray2, { wrap: CARD_W - 12 }).setOrigin(0, 0) as any);
      (c as any).item = it; (c as any).boxW = CARD_W; this.trayC.add(c); x += CARD_W + CARD_GAP;
    }
    this.trayW = x; this.trayScroll = clamp(this.trayScroll, 0, Math.max(0, this.trayW - 348)); this.trayC.x = -this.trayScroll;
  }
  private setupTrayInput(zone: Phaser.GameObjects.Zone) {
    let start: { x: number; y: number; scroll: number; item?: Item; lifted: boolean } | null = null;
    zone.on('pointerdown', (p: Phaser.Input.Pointer) => {
      let hit: Item | undefined; for (const c of this.trayC.list as Phaser.GameObjects.Container[]) { const it = (c as any).item as Item | undefined; if (!it) continue; const lx = c.x - this.trayScroll; if (p.x >= lx && p.x <= lx + (c as any).boxW && p.y >= c.y && p.y <= c.y + CARD_H) hit = it; }
      start = { x: p.x, y: p.y, scroll: this.trayScroll, item: hit, lifted: false };
    });
    zone.on('drag', (p: Phaser.Input.Pointer) => {
      if (!start) return; const dx = p.x - start.x, dy = p.y - start.y;
      if (!start.lifted && start.item && dy < -14 && Math.abs(dy) > Math.abs(dx)) { start.lifted = true; this.liftGhost(start.item, p); }
      if (start.lifted) { this.ghost?.setPosition(p.x - this.ghost.width / 2, p.y - this.ghost.height / 2); return; }
      this.trayScroll = clamp(start.scroll - dx, 0, Math.max(0, this.trayW - 348)); this.trayC.x = -this.trayScroll;
    });
    zone.on('dragend', (p: Phaser.Input.Pointer) => { if (start?.lifted) this.dropGhost(p); start = null; });
    zone.on('pointerup', () => { start = null; });
  }
  private liftGhost(it: Item, p: Phaser.Input.Pointer) {
    this.ghost = this.itemBox(it, it.w, it.h, CELL); this.ghost.setSize(it.w * CELL, it.h * CELL); this.ghost.setDepth(200); (this.ghost as any).item = it; this.ghost.setPosition(p.x - this.ghost.width / 2, p.y - this.ghost.height / 2);
    this.ghost.setScale(0.6); this.tweens.add({ targets: this.ghost, scaleX: 1.05, scaleY: 1.05, duration: 120 });
  }
  private dropGhost(_p: Phaser.Input.Pointer) {
    const gh = this.ghost; if (!gh) return; const it = (gh as any).item as Item; this.ghost = undefined;
    const tgt = this.cellAt(gh.x, gh.y, it.w, it.h);
    if (tgt && this.fits(tgt.bag, tgt.x, tgt.y, it.w, it.h)) { gh.destroy(); this.place(it, tgt.bag, tgt.x, tgt.y, false); this.renderTray(); this.refreshWeights(); this.thud(); }
    else { const f = tgt ? 'no room there' : ''; if (f) toast(this, f, PAL.red, 700); this.tweens.add({ targets: gh, y: 420, alpha: 0, scaleX: 0.5, scaleY: 0.5, duration: 220, ease: 'Quad.In', onComplete: () => gh.destroy() }); }
  }
  private thud() { this.cameras.main.shake(40, 0.003); }
  // ---- weights & hints ----
  private weights() { const w = { checked: 0, backpack: 0 }; for (const p of this.placed) w[p.bag] += Data.item(p.id)?.weightLb ?? 0; return w; }
  private refreshWeights() {
    const w = this.weights();
    for (const g of Object.values(this.grids)) {
      const v = w[g.bag], pct = v / g.maxLb; const gw = g.cols * CELL; const bar = this.wBar[g.bag]; bar.clear();
      bar.fillStyle(PAL.ink, 1); bar.fillRect(g.x, g.y + g.rows * CELL + 4, gw, 6); bar.fillStyle(pct > 1 ? PAL.red : pct >= 0.9 ? PAL.sun1 : PAL.sea2, 1); bar.fillRect(g.x, g.y + g.rows * CELL + 4, Math.min(1, pct) * gw, 6);
      this.wLabel[g.bag].setText(`${v.toFixed(1)} / ${g.maxLb} lb${pct > 1 ? '  OVER' : pct >= 0.9 ? '  heavy' : ''}`); if (this.wLabel[g.bag].setTint) this.wLabel[g.bag].setTint!(pct > 1 ? PAL.red : PAL.gray2); else this.wLabel[g.bag].setColor?.(hex(pct > 1 ? PAL.red : PAL.gray2));
    }
    const tags = new Set<string>(); let clothes = 0; let laptopChecked = false;
    for (const p of this.placed) { const it = Data.item(p.id); if (!it) continue; it.tags.forEach(t => tags.add(t)); clothes += it.clothesDays ?? 0; if (it.tags.includes('work') && p.bag === 'checked') laptopChecked = true; }
    const total = w.checked + w.backpack, cap = this.grids.checked.maxLb + this.grids.backpack.maxLb; const h: string[] = [];
    const pctAll = Math.round((total / COMBINED_LB) * 100); this.totalLbl.setText(`TOTAL ${total.toFixed(1)} / ${COMBINED_LB} lb · ${pctAll}%`); if (this.totalLbl.setTint) this.totalLbl.setTint(pctAll > 100 ? PAL.red : pctAll >= 90 ? PAL.sun1 : PAL.sun2);
    if (total >= cap * 0.9) h.push('! heavy: back risk'); if (laptopChecked) h.push('! laptop in checked'); if (clothes < 7) h.push(`! ${clothes}d of clothes`);
    if (!tags.has('firstaid')) h.push('! no first aid'); if (!tags.has('health') && !tags.has('fitness')) h.push('! no health kit'); if (tags.has('coffee')) h.push('+ coffee mornings'); if (tags.has('kettle')) h.push('+ kettle. bold.'); if (tags.has('switch')) h.push('+ Carry-On');
    this.hints.setText(h.length ? h.slice(0, 2).join('\n') : 'Everything has a consequence.');
  }
  private depart() {
    const run = getRun(this); const packed: PackedItem[] = this.placed.map(p => ({ id: p.id, bag: p.bag, x: p.x, y: p.y, rot: p.rot } as any));
    if (!packed.length) { toast(this, 'You need at least a toothbrush.', PAL.red); return; }
    const hasWork = this.placed.some(p => (Data.item(p.id)?.tags ?? []).some(t => t === 'work' || t === 'essential'));
    if (!hasWork && !this.warnedNoLaptop) { this.warnedNoLaptop = true; toast(this, 'No laptop. The job may notice. Tap DEPART again to go anyway.', PAL.sun1, 2200); return; }
    const res = Sim.setPack(run, packed);
    if (!res.ok) { res.errors.forEach(e => toast(this, e, PAL.red)); this.cameras.main.shake(120, 0.006); return; }
    putRun(this, run); this.cameras.main.fadeOut(250, 0, 0, 0); this.time.delayedCall(260, () => this.scene.start('Route'));
  }
}
export default PackScene;
