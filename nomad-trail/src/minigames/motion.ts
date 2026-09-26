// Phone shake detection for the cooking SHAKE step (DeviceMotion). No Phaser: unit-testable and harness-stubbable.
export type MotionState = 'unknown' | 'yes' | 'no';
/** Counts shakes from devicemotion: a shake is a reversal of the dominant acceleration direction while |a| − gravity is above the threshold. */
export class ShakeDetector {
  /** 'yes' once a motion event has arrived, 'no' when the API is missing or permission was denied */
  state: MotionState = 'unknown'; count = 0; onShake?: (dir: number) => void;
  private handler?: (e: DeviceMotionEvent) => void; private lastDir = 0; private lastAt = 0; private requested = false;
  constructor(public threshold = 12, public minGapMs = 80) {}
  /** Call from inside a user gesture (the READY tap): asks iOS for permission where the API exists, then subscribes. Never blocks the caller. */
  request() {
    if (this.requested) return; this.requested = true;
    try {
      const DME = (window as any).DeviceMotionEvent;
      if (!DME) { this.state = 'no'; return; }
      if (typeof DME.requestPermission === 'function') { DME.requestPermission().then((r: string) => { if (r === 'granted') this.subscribe(); else this.state = 'no'; }).catch(() => { this.state = 'no'; }); }
      else this.subscribe();
    } catch { this.state = 'no'; }
  }
  subscribe() {
    if (this.handler) return;
    this.handler = (e: DeviceMotionEvent) => this.feed(e.acceleration ?? undefined, e.accelerationIncludingGravity ?? undefined, performance.now());
    try { window.addEventListener('devicemotion', this.handler); } catch { this.state = 'no'; }
  }
  /** One motion sample (also used by tests). acc = gravity-free acceleration if the device gives it, else the gravity-including one. */
  feed(acc: { x?: number | null; y?: number | null; z?: number | null } | undefined, accG: { x?: number | null; y?: number | null; z?: number | null } | undefined, nowMs: number) {
    const a = acc && (acc.x != null || acc.y != null) ? acc : accG; if (!a || (a.x == null && a.y == null && a.z == null)) return;   // Chrome fires one all-null event when there is no sensor: not motion
    this.state = 'yes';
    const x = a.x ?? 0, y = a.y ?? 0, z = a.z ?? 0; let mag = Math.hypot(x, y, z); if (a === accG) mag = Math.abs(mag - 9.81);
    if (mag < this.threshold) return;
    const dom = Math.abs(x) >= Math.abs(y) && Math.abs(x) >= Math.abs(z) ? x : Math.abs(y) >= Math.abs(z) ? y : z; const dir = dom < 0 ? -1 : 1;
    if (dir === this.lastDir || nowMs - this.lastAt < this.minGapMs) return;   // a shake = a reversal, not a sustained push
    this.lastDir = dir; this.lastAt = nowMs; this.count++; this.onShake?.(dir);
  }
  stop() { if (this.handler) { try { window.removeEventListener('devicemotion', this.handler); } catch { /* noop */ } this.handler = undefined; } this.onShake = undefined; }
}
