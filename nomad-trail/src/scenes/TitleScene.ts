import Phaser from 'phaser';
import { buildIcons } from '../art/icons';
import { Audio } from '../audio/synth';
import STRINGS from '../data/strings.json';
import { PAL, txt, rect, GAME_W, GAME_H } from '../ui/theme';
import { Button } from '../ui/Button';
import { Panel, dimmer } from '../ui/Panel';
import { Sim, getSettings, putSettings, putRun } from '../ui/simBridge';
import type { RunState } from '../core/types';
/** Title: twilight gradient, drifting pixel clouds, New Run / Continue / Passport / mute. */
export class TitleScene extends Phaser.Scene {
  static KEY = 'Title';
  private clouds: Phaser.GameObjects.Rectangle[] = [];
  constructor() { super(TitleScene.KEY); }
  create() {
    this.clouds = [];
    const bands = [PAL.night0, PAL.night1, PAL.dusk0, PAL.dusk1, PAL.dusk2, PAL.dusk3, PAL.sun0, PAL.sun1];
    bands.forEach((c, i) => rect(this, 0, i * 44, GAME_W, 46, c));
    rect(this, 0, 352, GAME_W, GAME_H - 352, PAL.night0);
    for (let i = 0; i < 14; i++) { const y = 40 + Math.random() * 280; const w = 30 + Math.random() * 70; const c = this.add.rectangle(Math.random() * GAME_W, y, w, 6 + Math.random() * 6, y < 180 ? PAL.dusk3 : PAL.sun2, 0.35 + Math.random() * 0.4).setOrigin(0, 0.5); (c as any).spd = 4 + (y / 300) * 18; this.clouds.push(c); }
    // skyline silhouette
    const g = this.add.graphics(); g.fillStyle(PAL.night0, 1); let x = 0; while (x < GAME_W) { const w = 12 + Math.floor(Math.random() * 30), h = 20 + Math.floor(Math.random() * 90); g.fillRect(x, 352 - h, w, h); if (Math.random() < 0.5) { g.fillStyle(PAL.sun2, 0.9); for (let wy = 352 - h + 6; wy < 346; wy += 8) for (let wx = x + 3; wx < x + w - 3; wx += 6) if (Math.random() < 0.35) g.fillRect(wx, wy, 2, 3); g.fillStyle(PAL.night0, 1); } x += w + 2; }
    const hook = (window as any).__nomadArt?.titleArt; if (hook) { try { hook(this); } catch {} }
    txt(this, 180, 96, 'THE', 14, PAL.sun3).setOrigin(0.5);
    const logo = txt(this, 180, 130, 'NOMAD TRAIL', 24, PAL.white).setOrigin(0.5);
    this.tweens.add({ targets: logo, y: 134, duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    txt(this, 180, 184, STRINGS.ui.tagline, 9, PAL.sun3, { align: 'center', wrap: 340 }).setOrigin(0.5);   /* clear of the logo, which bobs 4px */
    const saved = Sim.load(); const settings = getSettings(this);
    let y = 400;
    if (saved && saved.phase !== 'ended') { new Button(this, 180, y, `CONTINUE · DAY ${saved.day}`, () => this.resume(saved), { w: 240, size: 12, fill: PAL.dusk1 }); y += 56; }
    new Button(this, 180, y, 'NEW RUN', () => this.newRun(!!saved), { w: 240, fill: PAL.sea1 }); y += 56;
    if (this.scene.get('Passport')) { new Button(this, 180, y, 'PASSPORT', () => { if (saved) this.registry.set('run', saved); this.scene.start('Passport', { back: 'Title' }); }, { w: 240 }); y += 56; }
    if (this.scene.get('Recipes')) { new Button(this, 180, y, 'RECIPES', () => this.scene.start('Recipes', { back: 'Title' }), { w: 240 }); y += 56; }
    buildIcons(this); const spk = this.add.image(40, 600, Audio.muted ? 'ico_sound_off' : 'ico_sound_on').setScale(3).setDepth(5).setInteractive({ useHandCursor: true });
    /* browsers block audio until a gesture, so the title screen asks for one: the first tap anywhere starts the music
       rather than toggling, otherwise tapping the speaker to get sound would mute it instead */
    const hint = txt(this, GAME_W / 2, 26, Audio.muted ? 'sound is off' : 'tap for sound', 8, PAL.sun2).setOrigin(0.5, 0).setDepth(5);
    this.tweens.add({ targets: hint, alpha: 0.35, yoyo: true, repeat: -1, duration: 900 });
    const sync = () => { spk.setTexture(Audio.muted ? 'ico_sound_off' : 'ico_sound_on'); this.sound.mute = Audio.muted; hint.setVisible(!Audio.unlocked || Audio.muted); hint.setText(Audio.muted ? 'sound is off' : 'tap for sound'); };
    /* main.ts unlocks audio on the first canvas pointerdown, which is the same tap as this pointerup, so a tap that
       merely woke the sound must not also mute it */
    spk.on('pointerup', () => {
      Audio.init();
      if (performance.now() - Audio.unlockedAt < 700) { Audio.playLoop('title'); Audio.playSfx('tap'); sync(); return; }
      const m = Audio.toggleMuted(); settings.muted = m; putSettings(this, settings); sync(); if (!m) { Audio.playLoop('title'); Audio.playSfx('tap'); }
    });
    this.syncAudio = sync; this.audioWas = '';
    this.sound.mute = Audio.muted; Audio.playLoop('title'); this.time.delayedCall(60, sync);
    txt(this, 180, 604, STRINGS.ui.basedOn, 8, PAL.gray1, { align: 'center' }).setOrigin(0.5);
    txt(this, 180, 620, settings.runs ? `Runs ${settings.runs} · Best ${settings.bestScore}` : STRINGS.ui.production, 8, PAL.gray0).setOrigin(0.5);
  }
  private audioWas = ''; private syncAudio?: () => void;
  update(_t: number, dt: number) {
    for (const c of this.clouds) { c.x += (c as any).spd * dt / 1000; if (c.x > GAME_W) c.x = -c.width; }
    const now = `${Audio.unlocked}/${Audio.muted}`; if (now !== this.audioWas) { this.audioWas = now; this.syncAudio?.(); }   /* whoever unlocked the sound, the icon and hint follow */
  }
  private resume(saved: RunState) {
    putRun(this, saved);
    const next = saved.phase === 'pack' ? 'Pack' : saved.phase === 'city' ? 'City' : saved.phase === 'ended' ? 'End' : 'Route';
    this.scene.start(next, { resumed: true });
  }
  private newRun(hasSave: boolean) {
    const dim = dimmer(this, 0.7); const p = new Panel(this, 20, 180, 320, 290, { fill: PAL.night1 });
    const items: Phaser.GameObjects.GameObject[] = [dim, p];
    items.push(txt(this, 180, 200, hasSave ? 'This replaces your saved run.' : 'A new year begins.', 10, PAL.sun1).setOrigin(0.5) as any);
    items.push(txt(this, 180, 232, 'Start and finish: Orange County', 9, PAL.gray2).setOrigin(0.5) as any);
    const start = 'orangecounty';
    items.push(txt(this, 180, 290, 'East or west? The first city\nyou fly to decides.', 10, PAL.gray2, { align: 'center' }).setOrigin(0.5) as any);
    items.push(txt(this, 180, 340, 'Circle the planet, touch every continent,\nand make it back within the year.', 8, PAL.gray1, { align: 'center' }).setOrigin(0.5) as any);
    items.push(new Button(this, 180, 400, 'START PACKING', () => { const s = Sim.createRun(Date.now() % 1e9, start, 'east'); putRun(this, s); this.scene.start('Pack'); }, { w: 240, fill: PAL.sun0 }));
    items.push(new Button(this, 180, 446, 'back', () => items.forEach(i => i.destroy()), { w: 120, h: 44, size: 10, fill: PAL.night2 }));
  }
}
export default TitleScene;
