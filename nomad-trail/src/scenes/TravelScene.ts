import Phaser from 'phaser';
import { Audio } from '../audio/synth';
import type { Leg, Region, MinigameResult } from '../core/types';
import { PAL, txt } from '../ui/theme';
import { Sim, Data, getRun, putRun } from '../ui/simBridge';
import { launchOnTop } from '../ui/overlay';
import { buildTravelScape, type TravelScape } from '../art/skyline';
/** Travel: 2.5 s side-scrolling leg, then resolves the leg in the sim, shows baggage beat + events, then City. */
export class TravelScene extends Phaser.Scene {
  static KEY = 'Travel'; private scape?: TravelScape; private craft?: Phaser.GameObjects.Container; private moving = true; private t0 = 0; private pending?: { res: ReturnType<typeof Sim.travelTo> };
  constructor() { super(TravelScene.KEY); }
  create(data: { leg: Leg }) {
    this.moving = false; this.cameras.main.fadeIn(200);
    const run = getRun(this); const from = Data.city(run.cityId); const to = Data.city(data.leg.to);
    /* a cozy pixel landscape: the departure skyline slides out on the far layer and the destination's slides in, mid hills and the ground wrap under the vehicle */
    const tod = (['day', 'dusk', 'night', 'dawn'] as const)[run.day % 4];
    this.scape?.destroy(); this.scape = buildTravelScape(this, run.cityId, data.leg.to, data.leg.transport, tod, 360, 640, from?.region as Region | undefined, to?.region as Region | undefined);
    this.craft = this.scape.vehicle;
    /* a dark plate keeps the route line and the day count readable over a bright sky */
    this.add.rectangle(180, 71, 360, 52, PAL.night0, 0.45).setOrigin(0.5);
    txt(this, 180, 60, `${from?.name ?? run.cityId} → ${to?.name ?? data.leg.to}`, 11, PAL.white, { align: 'center', wrap: 340 }).setOrigin(0.5);
    txt(this, 180, 82, `${data.leg.days} day${data.leg.days > 1 ? 's' : ''} by ${data.leg.transport}`, 10, PAL.gray2).setOrigin(0.5);
    /* the leg resolves up front so the gate dash can run before the vehicle leaves: the taxi died on the way to the airport,
       so the sprint through the terminal belongs before the flight, not after it */
    this.settle(data.leg);
    const dash = this.pending?.res.minigame;
    /* the taxi dying is why you are sprinting: its card plays first, and comes out of the arrival queue so it is not
       shown twice. Without this the terminal dash arrived with no explanation at all. */
    if (dash) { const why = this.takeEvent('taxibreakdown');
      const run = () => this.runDash(dash, () => this.depart(data.leg));
      if (why) launchOnTop(this, 'Event', { eventId: why, onDone: () => { this.scene.stop('Event'); run(); } }); else run();
    } else this.depart(data.leg);
  }
  /** The crossing itself: engine note, one pass out of the frame, then whatever the leg threw up. */
  private depart(leg: Leg) {
    Audio.playLoop('travel'); Audio.playSfx(leg.transport === 'flight' ? 'plane' : leg.transport === 'train' ? 'train' : 'whoosh');
    this.moving = true; this.t0 = this.time.now;
    /* one crossing, all the way out of the frame: parking it at the right edge read as a stall, and looping it read as a treadmill */
    this.tweens.add({ targets: this.craft, x: 440, duration: 2300, ease: 'Linear' });
    if (leg.transport === 'flight') this.tweens.add({ targets: this.craft, y: this.scape!.vehicleY - 40, duration: 1200, yoyo: true, ease: 'Sine.InOut' });
    this.time.delayedCall(2500, () => this.arrive(leg));
  }
  /** The gate dash, over the departure scene, before anything moves. */
  private runDash(dash: { key: string; payload?: any; difficulty: number }, then: () => void) {
    const launch = { energy: getRun(this).energy, difficulty: dash.difficulty, payload: dash.payload, cancellable: false,
      preview: (r: MinigameResult) => Sim.previewMinigame(getRun(this), dash.key, r),
      onDone: (r: MinigameResult) => { if (this.scene.isActive(dash.key) || this.scene.isPaused(dash.key)) this.scene.stop(dash.key); this.scene.resume(); putRun(this, Sim.applyMinigameResult(getRun(this), dash.key, r)); then(); } };
    launchOnTop(this, dash.key, launch); this.scene.pause();
  }
  update(_t: number, dt: number) { if (!this.moving || !this.scape) return; this.scape.update(dt); const p = (this.time.now - this.t0) / 2500; this.scape.setProgress(0.5 - 0.5 * Math.cos(Math.PI * Math.min(1, p))); }
  /** Pull one event id out of the arrival queue so it can be shown earlier instead. */
  private takeEvent(id: string): string | undefined {
    const evs = this.pending?.res.events; if (!evs) return undefined;
    const i = evs.indexOf(id); if (i < 0) return undefined;   /* the bridge hands scenes event ids, not the resolved objects */
    evs.splice(i, 1); return id;
  }
  /** Run the leg through the sim up front: the gate dash needs its answer before the vehicle moves. */
  private settle(leg: Leg) {
    const run = getRun(this); const before = { locked: run.bagLockedDays, wheel: run.wheelBroken };
    const res = Sim.travelTo(run, leg.to); putRun(this, res.state);
    /* no baggage bulletin and no travel aphorism: the HUD already says the bag is delayed, and the trip reads better
       as a picture of a plane crossing a landscape than as two lines of text over it */
    void before; this.pending = { res };
  }
  /** Landed: the leg's events, then the city. */
  private arrive(_leg: Leg) {
    this.moving = false; const events = [...(this.pending?.res.events ?? [])];
    const runEvents = () => { const id = events.shift();
      if (!id) { const end = Sim.checkEnding(getRun(this)); if (end) { const r = getRun(this); r.ending = end; r.phase = 'ended'; putRun(this, r); return this.scene.start('Credits', { next: 'End' }); } return this.scene.start('City', { arrived: true }); }
      launchOnTop(this, 'Event', { eventId: id, onDone: () => { this.scene.stop('Event'); runEvents(); } }); };
    runEvents();
  }
}
export default TravelScene;
