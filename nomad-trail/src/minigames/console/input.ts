// The handheld's controls: a D-pad, A/B, START/SELECT. Multi-touch on the drawn zones (two fingers: hold RIGHT and tap A),
// keyboard (arrows, Z = A, X = B, SPACE = A, ENTER = START, SHIFT = SELECT), and swipe-up anywhere on the screen = A pulse.
// Games read ONLY the per-frame `pad` snapshot; never raw pointers.
import Phaser from 'phaser';

export type PadKey = 'left' | 'right' | 'up' | 'down' | 'a' | 'b' | 'start' | 'select';
export type PadState = Record<PadKey, boolean>;
const KEYS: PadKey[] = ['left', 'right', 'up', 'down', 'a', 'b', 'start', 'select'];
const blank = (): PadState => ({ left: false, right: false, up: false, down: false, a: false, b: false, start: false, select: false });

export interface PadLayout { dpad: { x: number; y: number; r: number }; a: { x: number; y: number; r: number }; b: { x: number; y: number; r: number }; start: Phaser.Geom.Rectangle; select: Phaser.Geom.Rectangle; screen: Phaser.Geom.Rectangle; }

export class Pad {
  /** held this frame */ cur: PadState = blank();
  private prev: PadState = blank();
  private touch = new Map<number, Set<PadKey>>();
  private pulses = new Set<PadKey>();          // one-frame presses (swipe-up → A)
  private swipeStart = new Map<number, { x: number; y: number }>();
  private kb: Partial<Record<PadKey, Phaser.Input.Keyboard.Key[]>> = {};
  private handlers: Array<[string, (...a: any[]) => void]> = [];
  /** visual feedback: which zones are currently pressed (for the shell to highlight) */
  get pressed(): PadState { return this.cur; }

  constructor(private scene: Phaser.Scene, public layout: PadLayout, private onPress?: (k: PadKey) => void) {
    const on = (ev: string, fn: (...a: any[]) => void) => { scene.input.on(ev, fn); this.handlers.push([ev, fn]); };
    on('pointerdown', (p: Phaser.Input.Pointer) => { this.swipeStart.set(p.id, { x: p.x, y: p.y }); this.setTouch(p); });
    on('pointermove', (p: Phaser.Input.Pointer) => {
      if (!p.isDown) return;
      const s = this.swipeStart.get(p.id);
      if (s && Phaser.Geom.Rectangle.Contains(layout.screen, s.x, s.y) && s.y - p.y > 36) { this.swipeStart.delete(p.id); this.pulses.add('a'); this.onPress?.('a'); }
      if (this.touch.has(p.id)) this.setTouch(p);
    });
    const up = (p: Phaser.Input.Pointer) => { this.touch.delete(p.id); this.swipeStart.delete(p.id); };
    on('pointerup', up); on('pointerupoutside', up);
    const k = scene.input.keyboard;
    if (k) {
      const add = (key: PadKey, ...codes: string[]) => { this.kb[key] = codes.map(c => k.addKey(c)); };
      add('left', 'LEFT'); add('right', 'RIGHT'); add('up', 'UP'); add('down', 'DOWN'); add('a', 'Z', 'SPACE'); add('b', 'X'); add('start', 'ENTER'); add('select', 'SHIFT');
    }
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroy());
  }

  /** Map a pointer to the zone keys it is over. Called on down and move so a thumb can slide around the D-pad. */
  private setTouch(p: Phaser.Input.Pointer) {
    const L = this.layout; const keys = new Set<PadKey>();
    const dx = p.x - L.dpad.x, dy = p.y - L.dpad.y; const dd = Math.hypot(dx, dy);
    if (dd <= L.dpad.r) {
      const dead = 10;
      if (Math.abs(dx) > dead && Math.abs(dx) >= Math.abs(dy) * 0.5) keys.add(dx < 0 ? 'left' : 'right');
      if (Math.abs(dy) > dead && Math.abs(dy) >= Math.abs(dx) * 0.5) keys.add(dy < 0 ? 'up' : 'down');
    }
    if (Math.hypot(p.x - L.a.x, p.y - L.a.y) <= L.a.r) keys.add('a');
    if (Math.hypot(p.x - L.b.x, p.y - L.b.y) <= L.b.r) keys.add('b');
    if (Phaser.Geom.Rectangle.Contains(L.start, p.x, p.y)) keys.add('start');
    if (Phaser.Geom.Rectangle.Contains(L.select, p.x, p.y)) keys.add('select');
    const before = this.touch.get(p.id);
    for (const key of keys) if (!before?.has(key)) this.onPress?.(key);
    this.touch.set(p.id, keys);
  }

  /** Call once per frame BEFORE games read the pad. */
  update() {
    this.prev = { ...this.cur }; const n = blank();
    for (const keys of this.touch.values()) for (const k of keys) n[k] = true;
    for (const k of KEYS) if (this.kb[k]?.some(key => key.isDown)) n[k] = true;
    for (const k of this.pulses) n[k] = true; this.pulses.clear();
    this.cur = n;
  }
  held(k: PadKey) { return this.cur[k]; }
  justPressed(k: PadKey) { return this.cur[k] && !this.prev[k]; }
  justReleased(k: PadKey) { return !this.cur[k] && this.prev[k]; }
  /** -1 / 0 / 1 from left/right */
  get axisX() { return (this.cur.right ? 1 : 0) - (this.cur.left ? 1 : 0); }
  get axisY() { return (this.cur.down ? 1 : 0) - (this.cur.up ? 1 : 0); }
  destroy() { for (const [ev, fn] of this.handlers) this.scene.input.off(ev, fn); this.handlers = []; this.touch.clear(); }
}
