import Phaser from 'phaser';
import type { Leg, Region, MinigameResult } from '../core/types';
import { PAL, txt } from '../ui/theme';
import { Sim, Data, getRun, putRun } from '../ui/simBridge';
import { launchOnTop } from '../ui/overlay';
import { buildTravelScape, type TravelScape } from '../art/skyline';
/** Travel: 2.5 s side-scrolling leg, then resolves the leg in the sim, shows baggage beat + events, then City. */
export class TravelScene extends Phaser.Scene {
  static KEY = 'Travel'; private scape?: TravelScape; private craft?: Phaser.GameObjects.Container; private moving = true; private t0 = 0;
  constructor() { super(TravelScene.KEY); }
  create(data: { leg: Leg }) {
    this.moving = true; this.cameras.main.fadeIn(200);
    const run = getRun(this); const from = Data.city(run.cityId); const to = Data.city(data.leg.to);
    /* a cozy pixel landscape: the departure skyline slides out on the far layer and the destination's slides in, mid hills and the ground wrap under the vehicle */
    const tod = (['day', 'dusk', 'night', 'dawn'] as const)[run.day % 4];
    this.scape?.destroy(); this.scape = buildTravelScape(this, run.cityId, data.leg.to, data.leg.transport, tod, 360, 640, from?.region as Region | undefined, to?.region as Region | undefined);
    this.craft = this.scape.vehicle; this.t0 = this.time.now;
    this.tweens.add({ targets: this.craft, x: 300, duration: 2500, ease: 'Sine.InOut' });
    if (data.leg.transport === 'flight') this.tweens.add({ targets: this.craft, y: this.scape.vehicleY - 40, duration: 1200, yoyo: true, ease: 'Sine.InOut' });
    /* a dark plate keeps the route line and the day count readable over a bright sky */
    this.add.rectangle(180, 71, 360, 52, PAL.night0, 0.45).setOrigin(0.5);
    txt(this, 180, 60, `${from?.name ?? run.cityId} → ${to?.name ?? data.leg.to}`, 11, PAL.white, { align: 'center', wrap: 340 }).setOrigin(0.5);
    txt(this, 180, 82, `${data.leg.days} day${data.leg.days > 1 ? 's' : ''} by ${data.leg.transport}`, 10, PAL.gray2).setOrigin(0.5);
    const tip = txt(this, 180, 560, this.tipFor(data.leg), 9, PAL.sun3, { align: 'center', wrap: 300 }).setOrigin(0.5); this.tweens.add({ targets: tip, alpha: 0.6, duration: 800, yoyo: true, repeat: -1 });
    this.time.delayedCall(2500, () => this.resolve(data.leg));
  }
  update(_t: number, dt: number) { if (!this.moving || !this.scape) return; this.scape.update(dt); const p = (this.time.now - this.t0) / 2500; this.scape.setProgress(0.5 - 0.5 * Math.cos(Math.PI * Math.min(1, p))); }
  private tipFor(leg: Leg) {
    const tips = ['Window seat. Always.', 'The bag is heavier than it was this morning. It is not.', 'Somewhere below, a laundromat you will never see.', 'You reread the Airbnb confirmation. Twice.', 'Jet lag is just time zones with feelings.'];
    if (leg.transport === 'trek') return 'One foot, then the other one.'; if (leg.transport === 'campervan') return 'The van is the hotel. The hotel is the van.'; return tips[Math.floor(Math.random() * tips.length)];
  }
  private resolve(leg: Leg) {
    this.moving = false; const run = getRun(this); const before = { locked: run.bagLockedDays, wheel: run.wheelBroken };
    const res = Sim.travelTo(run, leg.to); putRun(this, res.state);
    const after = res.state; const beats: string[] = [];
    if (leg.transport === 'flight') { if (after.wheelBroken && !before.wheel) beats.push('Your suitcase arrives on three wheels.'); else if (after.bagLockedDays > before.locked) beats.push(`Bag: delayed ${after.bagLockedDays} day${after.bagLockedDays > 1 ? 's' : ''}. Clothes, kitchen and gym are on hold.`); else beats.push('Bag: on the belt. Small miracle.'); }
    const showBeats = (i: number, then: () => void) => { if (i >= beats.length) return then(); const t = txt(this, 180, 470, beats[i], 11, PAL.sun2, { align: 'center', wrap: 300 }).setOrigin(0.5).setAlpha(0); this.tweens.add({ targets: t, alpha: 1, y: 462, duration: 250 }); this.time.delayedCall(1500, () => showBeats(i + 1, then)); };
    const events = [...res.events];
    const dash = res.minigame; let dashDone = !dash;
    const runEvents = () => { const id = events.shift(); if (!id && !dashDone) { dashDone = true; const launch = { energy: getRun(this).energy, difficulty: dash!.difficulty, payload: dash!.payload, preview: (r: MinigameResult) => Sim.previewMinigame(getRun(this), dash!.key, r), onDone: (r: MinigameResult) => { if (this.scene.isActive(dash!.key) || this.scene.isPaused(dash!.key)) this.scene.stop(dash!.key); this.scene.resume(); const s = Sim.applyMinigameResult(getRun(this), dash!.key, r); putRun(this, s); runEvents(); } }; launchOnTop(this, dash!.key, launch); this.scene.pause(); return; }
      if (!id) { const end = Sim.checkEnding(getRun(this)); if (end) { const r = getRun(this); r.ending = end; r.phase = 'ended'; putRun(this, r); return this.scene.start('Credits', { next: 'End' }); } return this.scene.start('City', { arrived: true }); }
      launchOnTop(this, 'Event', { eventId: id, onDone: () => { this.scene.stop('Event'); runEvents(); } }); };
    showBeats(0, runEvents);
  }
}
export default TravelScene;
