import Phaser from 'phaser';
import { PAL, txt } from '../ui/theme';
import { Button } from '../ui/Button';
import { Panel } from '../ui/Panel';
import { getRun, Data } from '../ui/simBridge';
import creditsJson from '../data/credits.json';

/** One line per event: where it really happened to Cody. `where` is free text (several places joined already), `note` an optional aside. */
type Credit = { where: string; note?: string };
const CREDITS = creditsJson as Record<string, Credit>;
const W = 360, H = 640;

/** Credits: the events that fired in this run, each with the real place it happened on the real trip. Reached from the End screen. */
export class CreditsScene extends Phaser.Scene {
  static KEY = 'Credits'; private backKey?: string; private scrollY = 0; private content!: Phaser.GameObjects.Container; private maxScroll = 0;
  constructor() { super(CreditsScene.KEY); }
  init(d?: { back?: string }) { this.backKey = d?.back; this.scrollY = 0; }
  create() {
    this.cameras.main.setBackgroundColor(PAL.night0);
    const run = getRun(this);
    const fired = run?.eventsFired ?? [];
    /* fall back to the log titles for saves made before eventsFired existed */
    const ids = Array.from(new Set(fired.length ? fired : (run?.log ?? []).map(l => Data.events.find(e => l.text.startsWith(e.title + ':'))?.id).filter((x): x is string => !!x)));
    const rows = ids.map(id => ({ id, ev: Data.events.find(e => e.id === id), cr: CREDITS[id] })).filter(r => r.ev && r.cr);
    txt(this, W / 2, 26, 'WHAT REALLY HAPPENED', 16, PAL.sun2).setOrigin(0.5).setDepth(5);
    txt(this, W / 2, 48, rows.length ? 'Every event in your run is something that happened to Cody on the trip. Here is where.' : 'Nothing that happened to you this run has happened to Cody. Yet.', 8, PAL.gray2, { align: 'center', wrap: 300 }).setOrigin(0.5, 0).setDepth(5);
    this.content = this.add.container(0, 0).setDepth(2);
    let y = 84;
    for (const r of rows) {
      const bodyLines = Math.ceil((r.cr!.where.length + (r.cr!.note ? r.cr!.note.length + 3 : 0)) / 36);
      const h = 34 + bodyLines * 12;
      this.content.add(new Panel(this, 16, y, W - 32, h, { fill: PAL.night1, border: PAL.night3 }) as any);
      this.content.add(txt(this, 26, y + 8, r.ev!.title.toUpperCase(), 10, PAL.white) as any);
      this.content.add(txt(this, 26, y + 24, r.cr!.where + (r.cr!.note ? ' · ' + r.cr!.note : ''), 8, PAL.neon, { wrap: W - 56 }) as any);
      y += h + 8;
    }
    if (!rows.length) y += 40;
    this.content.add(txt(this, W / 2, y + 6, 'The Nomad Trail is a true story, mostly.', 8, PAL.gray1).setOrigin(0.5, 0) as any); y += 30;
    this.maxScroll = Math.max(0, y - (H - 70));
    /* scroll: drag or wheel */
    let downY = 0, startScroll = 0;
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => { downY = p.y; startScroll = this.scrollY; });
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => { if (p.isDown) this.setScroll(startScroll + (downY - p.y)); });
    this.input.on('wheel', (_p: any, _o: any, _dx: number, dy: number) => this.setScroll(this.scrollY + dy * 0.5));
    const bar = this.add.rectangle(W / 2, H - 28, W, 56, PAL.night0).setDepth(9);
    void bar;
    new Button(this, W / 2, H - 28, 'BACK', () => { const back = this.backKey; this.scene.stop(); this.scene.start(back || 'End'); }, { w: 200, h: 40, fill: PAL.dusk0, size: 12 }).setDepth(10);
    this.cameras.main.fadeIn(200, 0, 0, 0);
  }
  private setScroll(v: number) { this.scrollY = Phaser.Math.Clamp(v, 0, this.maxScroll); this.content.setY(-this.scrollY); }
}
export default CreditsScene;
