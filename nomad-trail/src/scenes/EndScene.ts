import Phaser from 'phaser';
import type { Ending } from '../core/types';
import { PAL, txt, rect } from '../ui/theme';
import { Button } from '../ui/Button';
import { Panel } from '../ui/Panel';
import { Sim, Data, getRun, getSettings, putSettings, putRun } from '../ui/simBridge';
const TITLES: Record<Ending['kind'], [string, number]> = { win: ['HOME.', PAL.neon], hospital: ['HOSPITALIZED', PAL.red], flewhome: ['YOU FLEW HOME', PAL.sun1], outofdays: ['THE YEAR RAN OUT', PAL.dusk3], quit: ['YOU QUIT', PAL.gray2] };
/** End: ending, stats, score, share / passport / new run. Records run history once. */
export class EndScene extends Phaser.Scene {
  static KEY = 'End';
  constructor() { super(EndScene.KEY); }
  create() {
    const run = getRun(this); const end = run.ending ?? Sim.checkEnding(run) ?? { kind: 'quit', text: 'You closed the tab. Fair.', score: Sim.score(run) };
    if (!run.ending) { run.ending = end; run.phase = 'ended'; putRun(this, run); }
    const settings = getSettings(this); const recorded = (run as any).__recorded;
    if (!recorded) { settings.runs += 1; settings.bestScore = Math.max(settings.bestScore, end.score); settings.history.push({ ending: end.kind, day: run.day, score: end.score }); putSettings(this, settings); (run as any).__recorded = true; putRun(this, run); }
    const [title, color] = TITLES[end.kind]; rect(this, 0, 0, 360, 640, end.kind === 'win' ? PAL.night2 : PAL.night0); this.cameras.main.fadeIn(400);
    const t = txt(this, 180, 90, title, 28, color).setOrigin(0.5).setScale(1.6).setAlpha(0); this.tweens.add({ targets: t, scaleX: 1, scaleY: 1, alpha: 1, duration: 500, ease: 'Back.Out' });
    txt(this, 180, 130, end.text, 11, PAL.white, { align: 'center', wrap: 300 }).setOrigin(0.5);
    const p = new Panel(this, 24, 180, 312, 230, { fill: PAL.night1 });
    const rows: [string, string][] = [['Days', `${run.day} / 365`], ['Cities', `${run.visited.length}`], ['Health', `${Math.round(run.health)}`], ['Mood', `${Math.round(run.mood)}`], ['Items lost', `${run.lostItems.length}`], ['Coffee mornings', `${run.coffeeMornings}`], ['Achievements', run.achievements.length ? run.achievements.join(', ') : 'none']];
    rows.forEach(([k, v], i) => { p.add(txt(this, 12, 12 + i * 22, k, 10, PAL.gray2) as any); p.add(txt(this, 300, 12 + i * 22, v, 10, PAL.white, { align: 'right', wrap: 200 }).setOrigin(1, 0) as any); });
    p.add(txt(this, 156, 190, `SCORE  ${end.score}`, 16, PAL.sun2).setOrigin(0.5) as any);
    if (end.kind !== 'win') txt(this, 180, 430, `Cause: ${this.cause(run, end)}`, 9, PAL.gray2, { align: 'center', wrap: 300 }).setOrigin(0.5);
    else txt(this, 180, 430, `Route: ${run.route.map(c => Data.city(c)?.name ?? c).join(' → ')}`, 8, PAL.gray2, { align: 'center', wrap: 300 }).setOrigin(0.5);
    let y = 480;
    if (this.scene.get('Share')) { new Button(this, 180, y, 'SHARE CARD', () => this.scene.start('Share', { back: 'End' }), { w: 240, fill: PAL.sea1 }); y += 52; }
    if (this.scene.get('Passport')) { new Button(this, 180, y, 'PASSPORT', () => this.scene.start('Passport', { back: 'End' }), { w: 240, fill: PAL.dusk0 }); y += 52; }
    new Button(this, 180, y, 'NEW RUN', () => { Sim.clearSave(); this.scene.start('Title'); }, { w: 240, fill: PAL.sun0 });
  }
  private cause(run: any, end: Ending) { const last = [...run.log].reverse().find((l: any) => /hospital|fever|burn|back|poison|otter|cancel|mosquito|delayed|wheel/i.test(l.text)); return last ? last.text : end.kind === 'flewhome' ? 'mood hit zero' : end.kind === 'outofdays' ? 'too many long stays' : end.text; }
}
export default EndScene;
