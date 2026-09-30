import Phaser from 'phaser';
import { Audio } from '../audio/synth';
import { PAL, txt } from '../ui/theme';
import { getRun, Data } from '../ui/simBridge';
import creditsJson from '../data/credits.json';
import { AUDIO_CREDITS } from '../audio/synth';

/** One line per event: the display title and where it really happened to Cody. */
type Credit = { title: string; where: string };
const CREDITS = creditsJson as Record<string, Credit>;
const W = 360, H = 640;

/** Credits: the events that fired in this run, each with the real place. Plays once at the end of a run (auto-scrolls, tap to skip),
 *  then hands over to `next` (the End screen). Quick play passes `onClose` instead. */
export class CreditsScene extends Phaser.Scene {
  static KEY = 'Credits'; private nextKey?: string; private onClose?: () => void; private content!: Phaser.GameObjects.Container; private endY = 0; private done = false;
  constructor() { super(CreditsScene.KEY); }
  init(d?: { next?: string; back?: string; onClose?: () => void }) { this.nextKey = d?.next ?? d?.back; this.onClose = d?.onClose; this.done = false; }
  create() {
    this.cameras.main.setBackgroundColor(PAL.night0); Audio.playLoop('credits');
    const run = getRun(this);
    const fired = run?.eventsFired ?? [];
    /* fall back to the log titles for saves made before eventsFired existed */
    const ids = Array.from(new Set(fired.length ? fired : (run?.log ?? []).map(l => Data.events.find(e => l.text.startsWith(e.title + ':'))?.id).filter((x): x is string => !!x)));
    const seen = new Set<string>();
    const rows = ids.map(id => CREDITS[id]).filter((c): c is Credit => !!c).filter(c => { const k = c.title + c.where; if (seen.has(k)) return false; seen.add(k); return true; });
    this.content = this.add.container(0, 0); (this.content as any).__scroll = true;   /* a film roll: its contents are meant to start and end off-screen */
    const add = (o: Phaser.GameObjects.GameObject) => this.content.add(o as any);
    let y = H - 60;   /* everything starts just below the screen and rolls up like film credits */
    add(txt(this, W / 2, y, 'WHAT REALLY HAPPENED', 16, PAL.sun2).setOrigin(0.5)); y += 34;
    add(txt(this, W / 2, y, rows.length ? 'Every event in your run happened to Cody on the trip.' : 'Nothing that happened to you this run has happened to Cody. Yet.', 8, PAL.gray2, { align: 'center', wrap: 300 }).setOrigin(0.5, 0)); y += rows.length ? 48 : 60;
    for (const r of rows) {
      add(txt(this, W / 2, y, r.title.toUpperCase(), 10, PAL.white, { align: 'center' }).setOrigin(0.5, 0)); y += 18;
      add(txt(this, W / 2, y, r.where, 10, PAL.neon, { align: 'center', wrap: 300 }).setOrigin(0.5, 0)); y += 44;
    }
    y += 20; add(txt(this, W / 2, y, 'The Nomad Trail is a true story, mostly.', 8, PAL.gray1).setOrigin(0.5, 0)); y += 34;
    /* CC-BY requires the credit where the work is used, so the recorded jet and wind say their names here */
    add(txt(this, W / 2, y, 'MUSIC AND SOUND', 9, PAL.white).setOrigin(0.5, 0)); y += 16;
    for (const line of AUDIO_CREDITS) { const o = txt(this, W / 2, y, line, 8, PAL.gray2, { align: 'center', wrap: 300 }).setOrigin(0.5, 0); add(o); y += Math.max(14, (o.height || 12) + 3); }   /* advance by what the line actually rendered: long credits wrap */
    y += 26;
    this.endY = y;   /* scroll until the last line has passed the middle of the screen */
    this.add.rectangle(W / 2, H - 14, W, 28, PAL.night0).setDepth(4);   /* a solid band so the rolling text passes behind the hint */
    const hint = txt(this, W / 2, H - 14, 'tap to skip', 8, PAL.gray0).setOrigin(0.5).setDepth(5); this.tweens.add({ targets: hint, alpha: 0.3, yoyo: true, repeat: -1, duration: 800 });
    this.input.once('pointerdown', () => this.finish());
    this.input.keyboard?.once('keydown-SPACE', () => this.finish()); this.input.keyboard?.once('keydown-ENTER', () => this.finish());
    this.cameras.main.fadeIn(250, 0, 0, 0);
  }
  update(_t: number, dt: number) {
    if (this.done) return;
    this.content.y -= 46 * (dt / 1000);   /* slow roll: about 46 px per second, roughly 2 s per credit */
    if (this.content.y < -(this.endY - H / 2)) this.finish();
  }
  private finish() {
    if (this.done) return; this.done = true;
    const next = this.nextKey, cb = this.onClose;
    this.cameras.main.fadeOut(250, 0, 0, 0);
    this.time.delayedCall(260, () => { this.scene.stop(); if (cb) cb(); else this.scene.start(next || 'End'); });
  }
}
export default CreditsScene;
