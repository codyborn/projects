import Phaser from 'phaser';
import type { Effects, GameEvent } from '../core/types';
import { PAL, txt, hex } from '../ui/theme';
import { Button } from '../ui/Button';
import { Panel, dimmer } from '../ui/Panel';
import { typewrite } from '../ui/typewriter';
import { Sim, Data, getRun, putRun, pendingChoices } from '../ui/simBridge';
/** Modal event card. Launched (not started) over Travel/City with { eventId, onDone }.
 *  Layout: header (day · city) at the top of the panel, title below it, body below the title's rendered height, then choices. */
export class EventScene extends Phaser.Scene {
  static KEY = 'Event';
  constructor() { super(EventScene.KEY); }
  create(data: { eventId: string; onDone: () => void }) {
    this.scene.bringToTop();
    const run = getRun(this); const ev: GameEvent = Data.event(data.eventId) ?? { id: data.eventId, title: 'Something happened', text: run.log[run.log.length - 1]?.text ?? '...', when: 'day', baseChance: 0, effects: {} } as GameEvent;
    const city = Data.city(run.cityId); const fill = (s: string) => s.replace(/\{city\}/g, city?.name ?? run.cityId).replace(/\{day\}/g, String(run.day)).replace(/\{item\}/g, Data.item(run.lostItems[run.lostItems.length - 1] ?? '')?.label ?? 'something');
    const tags = new Set(run.items.map(i => Data.item(i.id)?.tags ?? []).flat());
    const mitigated = (ev.mitigatedBy?.some(t => tags.has(t)) ?? false) && !!ev.mitigatedText;
    const text = fill(mitigated ? ev.mitigatedText! : ev.text);           // one or the other, never both
    const pend = run.pendingEvent === ev.id ? pendingChoices(run) : null; const choices = (pend?.choices ?? []) as any[];
    this.choices = choices; this.onDone = data.onDone; this.evId = ev.id;
    // measure first, then lay out: title height and body height decide the panel size
    const PX = 16, PW = 328, TOP = 100;
    const header = txt(this, 180, TOP + 12, `DAY ${run.day} · ${(city?.name ?? '').toUpperCase()}`, 8, PAL.gray2).setOrigin(0.5, 0);
    const title = txt(this, 180, TOP + 28, fill(ev.title).toUpperCase(), 12, PAL.sun2, { align: 'center', wrap: 290 }).setOrigin(0.5, 0);
    const bodyY = TOP + 28 + Math.max(14, title.height) + 12;
    const body = txt(this, PX + 16, bodyY, text, 10, PAL.white, { wrap: PW - 32 }); const bodyH = Math.max(40, body.height); body.setText('');
    const ROW = 72; const choiceRows = choices.length ? Math.min(3, choices.length) : 1; const footerH = choices.length ? choiceRows * ROW + 8 : 78;
    const panelH = Math.min(520, bodyY - TOP + bodyH + 16 + footerH);
    dimmer(this, 0.7).setDepth(-2); const p = new Panel(this, PX, TOP, PW, panelH, { fill: PAL.night1, border: PAL.sun1 }); p.setDepth(-1); p.setScale(0.96); this.tweens.add({ targets: p, scaleX: 1, scaleY: 1, duration: 140, ease: 'Back.Out' });
    header.setDepth(1); title.setDepth(1); body.setDepth(1);
    const tw = typewrite(this, body, text, 60); this.input.once('pointerdown', () => tw.skip());
    tw.done.then(() => {
      let y = bodyY + bodyH + 16 + 22;
      if (choices.length) choices.slice(0, 3).forEach((c, i) => { const b = new Button(this, 180, y, c.label, () => { const s = Sim.resolveChoice(getRun(this), ev.id, i); putRun(this, s); data.onDone(); }, { w: 296, h: 44, fill: PAL.dusk0, size: 10 }); const eff = txt(this, 180, y + 28, this.fmt(c.effects), 8, PAL.gray2, { align: 'center', wrap: 296 }).setOrigin(0.5, 0); b.setAlpha(0); eff.setAlpha(0); this.tweens.add({ targets: [b, eff], alpha: 1, duration: 200, delay: i * 80 }); y += ROW; });
      else { txt(this, 180, y - 8, this.fmt(mitigated && ev.mitigatedEffects ? ev.mitigatedEffects : ev.effects), 8, PAL.gray2, { align: 'center', wrap: 296 }).setOrigin(0.5, 0); new Button(this, 180, y + 30, 'CONTINUE', () => data.onDone(), { w: 296, h: 44, fill: PAL.dusk0 }); }
    });
  }
  private choices: any[] = []; private onDone: () => void = () => {}; private evId = '';
  /** e2e/debug: resolve with the first choice (or just continue). */
  autoResolve() { if (this.choices.length) { const s = Sim.resolveChoice(getRun(this), this.evId, 0); putRun(this, s); } this.onDone(); }
  private fmt(e: Effects) {
    const parts: string[] = []; const s = (k: string, v?: number) => { if (v) parts.push(`${k} ${v > 0 ? '+' : ''}${v}`); };
    s('health', e.health); s('energy', e.energy); s('mood', e.mood); if (e.days) parts.push(`${e.days} day${e.days > 1 ? 's' : ''} lost`); if (e.bagLocked) parts.push(`bag locked ${e.bagLocked}d`); if (e.wheelBroken) parts.push('wheel destroyed'); if (e.backInjury) parts.push(`back injury ${e.backInjury}d`); if (e.sick) parts.push(`sick ${e.sick}d`); if (e.loseRandomItem || e.loseItemTag) parts.push('lose an item');
    return parts.join(' · ') || 'no lasting effect';
  }
}
export { hex }; export default EventScene;
