import Phaser from 'phaser';
import type { Effects, GameEvent } from '../core/types';
import { PAL, txt, hex } from '../ui/theme';
import { Button } from '../ui/Button';
import { Panel, dimmer } from '../ui/Panel';
import { typewrite } from '../ui/typewriter';
import { Sim, Data, getRun, putRun } from '../ui/simBridge';
/** Modal event card. Launched (not started) over Travel/City with { eventId, onDone }. */
export class EventScene extends Phaser.Scene {
  static KEY = 'Event';
  constructor() { super(EventScene.KEY); }
  create(data: { eventId: string; onDone: () => void }) {
    const run = getRun(this); const ev: GameEvent = Data.event(data.eventId) ?? { id: data.eventId, title: 'Something happened', text: run.log[run.log.length - 1]?.text ?? '...', when: 'day', baseChance: 0, effects: {} } as GameEvent;
    dimmer(this, 0.7); const p = new Panel(this, 16, 120, 328, 400, { fill: PAL.night1, border: PAL.sun1 }); p.setScale(0.9); this.tweens.add({ targets: p, scaleX: 1, scaleY: 1, duration: 160, ease: 'Back.Out' });
    const city = Data.city(run.cityId); const fill = (s: string) => s.replace('{city}', city?.name ?? run.cityId).replace('{day}', String(run.day)).replace('{item}', Data.item(run.lostItems[run.lostItems.length - 1] ?? '')?.label ?? 'something');
    txt(this, 180, 138, `DAY ${run.day} · ${(city?.name ?? '').toUpperCase()}`, 8, PAL.gray2).setOrigin(0.5);
    txt(this, 180, 160, fill(ev.title).toUpperCase(), 14, PAL.sun2, { align: 'center', wrap: 300 }).setOrigin(0.5);
    const body = txt(this, 32, 190, '', 11, PAL.white, { wrap: 296 });
    const tags = new Set(run.items.map(i => Data.item(i.id)?.tags ?? []).flat());
    const mitigated = ev.mitigatedBy?.some(t => tags.has(t)) ?? false; const text = fill(ev.text) + (mitigated && ev.mitigatedText ? '\n\n' + fill(ev.mitigatedText) : '');
    const tw = typewrite(this, body, text, 60); this.input.once('pointerdown', () => tw.skip());
    const choices = (ev.choices ?? []).filter(c => !c.requiresTag || tags.has(c.requiresTag));
    tw.done.then(() => {
      let y = 320 + Math.min(120, Math.max(0, body.height - 100));
      if (choices.length) choices.slice(0, 3).forEach((c, i) => { const b = new Button(this, 180, y, c.label, () => { const s = Sim.resolveChoice(getRun(this), ev.id, i); putRun(this, s); data.onDone(); }, { w: 296, h: 46, fill: PAL.dusk0, size: 11 }); const eff = txt(this, 180, y + 30, this.fmt(c.effects), 8, PAL.gray2).setOrigin(0.5); b.setAlpha(0); eff.setAlpha(0); this.tweens.add({ targets: [b, eff], alpha: 1, duration: 200, delay: i * 80 }); y += 58; });
      else { txt(this, 180, y - 4, this.fmt(mitigated && ev.mitigatedEffects ? ev.mitigatedEffects : ev.effects), 9, PAL.gray2, { align: 'center' }).setOrigin(0.5); new Button(this, 180, y + 30, 'CONTINUE', () => data.onDone(), { w: 296, h: 46, fill: PAL.dusk0 }); }
    });
  }
  private fmt(e: Effects) {
    const parts: string[] = []; const s = (k: string, v?: number) => { if (v) parts.push(`${k} ${v > 0 ? '+' : ''}${v}`); };
    s('health', e.health); s('energy', e.energy); s('mood', e.mood); if (e.days) parts.push(`${e.days} day${e.days > 1 ? 's' : ''} lost`); if (e.bagLocked) parts.push(`bag locked ${e.bagLocked}d`); if (e.wheelBroken) parts.push('wheel destroyed'); if (e.backInjury) parts.push(`back injury ${e.backInjury}d`); if (e.sick) parts.push(`sick ${e.sick}d`); if (e.loseRandomItem || e.loseItemTag) parts.push('lose an item');
    return parts.join(' · ') || 'no lasting effect';
  }
}
export { hex }; export default EventScene;
