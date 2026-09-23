import Phaser from 'phaser';
import type { CityAction, MinigameLaunch, MinigameResult } from '../core/types';
import { PAL, txt, rect, type Label } from '../ui/theme';
import { Button } from '../ui/Button';
import { Panel, dimmer } from '../ui/Panel';
import { Hud } from '../ui/hud';
import { toast } from '../ui/Toast';
import { Sim, Data, getRun, putRun } from '../ui/simBridge';
const ACTIONS: { a: CityAction; label: string; icon: string; tip: string }[] = [
  { a: 'work', label: 'WORK', icon: '💻', tip: 'a remote day' }, { a: 'explore', label: 'EXPLORE', icon: '🧭', tip: 'mood up, mild risk' },
  { a: 'train', label: 'TRAIN', icon: '🏋', tip: 'stay fit' }, { a: 'cook', label: 'COOK', icon: '🍳', tip: 'local dish' },
  { a: 'rest', label: 'REST', icon: '🛏', tip: 'energy up' }, { a: 'laundry', label: 'LAUNDRY', icon: '🧺', tip: 'a day, clean clothes' },
  { a: 'checkroom', label: 'CHECK ROOM', icon: '🔍', tip: 'forget nothing' }, { a: 'moveon', label: 'MOVE ON', icon: '✈', tip: 'pick the next city' } ];
/** City: arrival card, HUD, day actions, log. Launches mini-games, Coffee, Event as overlays and pauses itself. */
export class CityScene extends Phaser.Scene {
  static KEY = 'City'; private hud!: Hud; private logLbl!: Label; private busy = false; private lastDay = -1; private btns: Button[] = [];
  constructor() { super(CityScene.KEY); }
  create(data: { arrived?: boolean } = {}) {
    this.busy = false; this.btns = []; this.cameras.main.fadeIn(200);
    const run = getRun(this); run.phase = 'city'; putRun(this, run); this.lastDay = run.day;
    const city = Data.city(run.cityId);
    rect(this, 0, 0, 360, 640, PAL.night0);
    // vista
    let drew = false; const hook = (window as any).__nomadArt?.skyline; if (hook) { try { hook(this, run.cityId, 0, 86, 360, 150); drew = true; } catch {} }
    if (!drew) this.fallbackVista(run.cityId, city?.climate ?? 'temperate');
    txt(this, 12, 96, (city?.name ?? run.cityId).toUpperCase(), 16, PAL.white); txt(this, 12, 116, `${city?.country ?? ''} · stay day ${run.stayDays + 1}`, 8, PAL.gray2);
    this.hud = new Hud(this); this.hud.refresh(run);
    new Panel(this, 12, 244, 336, 118, { fill: PAL.night1, border: PAL.night3 }); this.logLbl = txt(this, 20, 250, '', 8, PAL.gray2, { wrap: 320 }); this.refreshLog();
    ACTIONS.forEach((act, i) => { const b = new Button(this, 96 + (i % 2) * 168, 392 + Math.floor(i / 2) * 56, act.label, () => this.act(act.a), { w: 160, h: 48, size: 11, icon: act.icon, fill: act.a === 'moveon' ? PAL.sea0 : PAL.night2 }); this.btns.push(b); });
    txt(this, 180, 620, 'every action is one day', 8, PAL.gray0).setOrigin(0.5);
    if (data.arrived) this.arrivalCard();
  }
  private fallbackVista(cityId: string, climate: string) {
    const sky = climate === 'hot' ? [PAL.sun1, PAL.sun2] : climate === 'cold' || climate === 'alpine' ? [PAL.sky0, PAL.sky2] : climate === 'rainy' ? [PAL.gray0, PAL.gray1] : [PAL.sky1, PAL.sky2];
    rect(this, 0, 86, 360, 150, sky[0]); rect(this, 0, 86, 360, 80, sky[1]);
    const g = this.add.graphics(); const rnd = new Phaser.Math.RandomDataGenerator([cityId]); g.fillStyle(PAL.night2, 1); let x = 0; while (x < 360) { const w = 14 + rnd.between(0, 30), h = climate === 'alpine' ? 40 + rnd.between(0, 80) : 20 + rnd.between(0, 60); if (climate === 'alpine') { g.fillTriangle(x, 236, x + w / 2, 236 - h, x + w, 236); } else g.fillRect(x, 236 - h, w, h); x += w + 2; }
    rect(this, 0, 232, 360, 6, PAL.earth0);
  }
  private refreshLog() { const run = getRun(this); this.logLbl.setText(run.log.slice(-5).map(l => `d${l.day}  ${l.text}`).join('\n')); }
  private arrivalCard() {
    const run = getRun(this); const city = Data.city(run.cityId); const dim = dimmer(this, 0.6); const p = new Panel(this, 24, 180, 312, 260, { fill: PAL.night1, border: PAL.sun2 });
    const parts: Phaser.GameObjects.GameObject[] = [dim, p];
    parts.push(txt(this, 180, 200, 'WELCOME TO', 8, PAL.gray2).setOrigin(0.5) as any, txt(this, 180, 222, (city?.name ?? run.cityId).toUpperCase(), 20, PAL.white).setOrigin(0.5) as any, txt(this, 180, 244, city?.country ?? '', 10, PAL.gray2).setOrigin(0.5) as any);
    parts.push(txt(this, 180, 300, city?.blurb ?? '', 10, PAL.sun3, { align: 'center', wrap: 270 }).setOrigin(0.5) as any);
    // stamp animation
    const stamp = this.add.container(180, 360).setScale(3).setAlpha(0); const sg = this.add.graphics(); const gold = run.stamps[run.cityId] === 'gold'; sg.lineStyle(2, gold ? PAL.sun2 : PAL.red, 1); sg.strokeCircle(0, 0, 26); sg.strokeCircle(0, 0, 22); stamp.add(sg);
    stamp.add([txt(this, 0, -4, (city?.name ?? '').slice(0, 10).toUpperCase(), 8, gold ? PAL.sun2 : PAL.red).setOrigin(0.5) as any, txt(this, 0, 8, `DAY ${run.day}`, 8, gold ? PAL.sun2 : PAL.red).setOrigin(0.5) as any]); stamp.setAngle(-14); parts.push(stamp);
    this.tweens.add({ targets: stamp, scaleX: 1, scaleY: 1, alpha: 1, duration: 260, ease: 'Quad.In', onComplete: () => this.cameras.main.shake(60, 0.004) });
    parts.push(new Button(this, 180, 410, 'SETTLE IN', () => parts.forEach(x => x.destroy()), { w: 200, fill: PAL.sea1 }));
  }
  private act(a: CityAction) {
    if (this.busy) return; this.busy = true; this.btns.forEach(b => b.setDisabled(true));
    const run = getRun(this); const res = Sim.cityAction(run, a); putRun(this, res.state); this.hud.refresh(res.state); this.refreshLog();
    const queue: (() => Promise<void>)[] = [];
    for (const id of res.events) queue.push(() => this.overlay('Event', { eventId: id }));
    if (res.minigame) queue.push(() => this.minigame(res.minigame!));
    if (res.state.day !== this.lastDay && Sim.coffeePacked(res.state) && this.scene.get('Coffee') && a !== 'moveon') queue.push(() => this.overlay('Coffee', { city: res.state.cityId, day: res.state.day }));
    this.lastDay = res.state.day;
    (async () => { for (const q of queue) await q(); this.after(a); })();
  }
  private overlay(key: string, data: any) { return new Promise<void>(resolve => { this.scene.launch(key, { ...data, onDone: () => { if (this.scene.isActive(key) || this.scene.isPaused(key)) this.scene.stop(key); this.scene.resume(); resolve(); } }); this.scene.bringToTop(key); this.scene.pause(); }); }
  private minigame(m: { key: string; payload?: any; difficulty: number }) {
    return new Promise<void>(resolve => {
      const run = getRun(this); const finish = (r: MinigameResult) => { const s = Sim.applyMinigameResult(getRun(this), m.key, r); putRun(this, s); this.hud.refresh(s); toast(this, r.failed ? 'that did not go well' : r.perfect ? 'PERFECT' : `score ${Math.round(r.score)}`, r.failed ? PAL.red : PAL.neon); resolve(); };
      if (!this.scene.get(m.key)) { toast(this, `(${m.key} not installed yet)`, PAL.gray2, 900); finish({ score: 50, perfect: false, failed: false }); return; }
      const launch: MinigameLaunch = { energy: run.energy, difficulty: m.difficulty, payload: m.payload, onDone: (r) => { if (this.scene.isActive(m.key) || this.scene.isPaused(m.key)) this.scene.stop(m.key); this.scene.resume(); finish(r); } };
      this.scene.launch(m.key, launch); this.scene.bringToTop(m.key); this.scene.pause();
    });
  }
  private after(a: CityAction) {
    const run = getRun(this); this.hud.refresh(run); this.refreshLog();
    const end = Sim.checkEnding(run); if (end) { run.ending = end; run.phase = 'ended'; putRun(this, run); this.cameras.main.fadeOut(300, 0, 0, 0); this.time.delayedCall(320, () => this.scene.start('End')); return; }
    if (a === 'moveon' || run.phase === 'route') { this.cameras.main.fadeOut(200, 0, 0, 0); this.time.delayedCall(210, () => this.scene.start('Route')); return; }
    if (run.cleanClothes <= 0) toast(this, 'Out of clean clothes. Laundry, or consequences.', PAL.sun1, 1400);
    this.busy = false; this.btns.forEach(b => b.setDisabled(false)); const lbl = this.children.list.find(o => (o as any).text?.startsWith?.(Data.city(run.cityId)?.country ?? '')) as Label | undefined; lbl?.setText(`${Data.city(run.cityId)?.country ?? ''} · stay day ${run.stayDays + 1}`);
  }
}
export default CityScene;
