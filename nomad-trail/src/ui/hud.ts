import Phaser from 'phaser';
import type { RunState, Item } from '../core/types';
import { PAL, txt, type Label, MONTHS, SAFE_TOP } from './theme';
import { Bar } from './Bar';
import { Sim, Data } from './simBridge';
/** Top HUD strip used by CityScene and RouteScene. Call refresh(state) after each change. */
export class Hud extends Phaser.GameObjects.Container {
  private day: Label; private bars: Record<'health' | 'energy' | 'mood', Bar>; private clothes: Label; private weight: Label; private badges: Label;
  constructor(scene: Phaser.Scene) {
    super(scene, 0, SAFE_TOP);
    const g = scene.add.graphics(); g.fillStyle(PAL.night1, 1); g.fillRect(0, -SAFE_TOP, 360, 62 + SAFE_TOP); g.lineStyle(1, PAL.night3, 1); g.lineBetween(0, 62.5, 360, 62.5); this.add(g);
    this.day = txt(scene, 8, 5, '', 10, PAL.sun2); this.add(this.day as any);
    this.bars = { health: new Bar(scene, 8, 24, 'HEALTH', 104), energy: new Bar(scene, 128, 24, 'ENERGY', 104), mood: new Bar(scene, 248, 24, 'MOOD', 104) };
    Object.values(this.bars).forEach(b => this.add(b));
    this.clothes = txt(scene, 352, 48, '', 8, PAL.gray2).setOrigin(1, 0); this.add(this.clothes as any);
    this.weight = txt(scene, 8, 48, '', 8, PAL.gray2); this.add(this.weight as any);
    this.badges = txt(scene, 180, 48, '', 8, PAL.sun1).setOrigin(0.5, 0); this.add(this.badges as any);
    this.setDepth(50); scene.add.existing(this);
  }
  refresh(s: RunState) {
    const m = Sim.monthOf(s.day); const left = 365 - s.day;
    this.day.setText(`DAY ${s.day}  ·  ${MONTHS[m - 1]}  ·  ${left} left`);
    this.bars.health.set(Math.round(s.health)); this.bars.energy.set(Math.round(s.energy)); this.bars.mood.set(Math.round(s.mood));
    this.clothes.setText(`👕 ${s.cleanClothes}/${s.maxClothes} clean`);
    const w = weights(s); this.weight.setText(`🧳 ${w.checked.toFixed(1)} lb   🎒 ${w.backpack.toFixed(1)} lb`);
    const b: string[] = []; if (s.bagLockedDays > 0) b.push(`BAG DELAYED ${s.bagLockedDays}d`); if (s.wheelBroken) b.push('WHEEL BROKEN'); if (s.backInjuryDays > 0) b.push(`BACK ${s.backInjuryDays}d`); if (s.sickDays > 0) b.push(`SICK ${s.sickDays}d`);
    this.badges.setText(b.join(' · '));
  }
}
export function weights(s: RunState) {
  const w = { checked: 0, backpack: 0 };
  for (const p of s.items) { const it = Data.item(p.id); if (it) w[p.bag] += it.weightLb; }
  return w;
}
export function itemOf(id: string): Item | undefined { return Data.item(id); }
