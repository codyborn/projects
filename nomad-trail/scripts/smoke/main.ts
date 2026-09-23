import Phaser from 'phaser';
import { generateAllArt, buildSkyline, drawGlobe, stampTexture, itemTile, ptext } from '../../src/art';
import { PAL } from '../../src/core/palette';
const params = new URLSearchParams(location.search); const mode = params.get('mode') || 'sheet'; const city = params.get('city') || 'tokyo'; const tod = (params.get('tod') || 'dusk') as any;
const CITIES: any[] = [
  { id: 'miami', name: 'Miami', lat: 25.8, lon: -80.2, hero: true, stampIcon: 'palm', country: 'US' }, { id: 'lisbon', name: 'Lisbon', lat: 38.7, lon: -9.1, hero: true, stampIcon: 'tram', country: 'PT' },
  { id: 'innsbruck', name: 'Innsbruck', lat: 47.3, lon: 11.4, hero: true, stampIcon: 'mountain', country: 'AT' }, { id: 'tokyo', name: 'Tokyo', lat: 35.7, lon: 139.7, hero: true, stampIcon: 'torii', country: 'JP' },
  { id: 'kathmandu', name: 'Kathmandu', lat: 27.7, lon: 85.3, hero: true, stampIcon: 'stupa', country: 'NP' }, { id: 'dakhla', name: 'Dakhla', lat: 23.7, lon: -15.9, hero: true, stampIcon: 'kite', country: 'MA' },
  { id: 'buenosaires', name: 'Buenos Aires', lat: -34.6, lon: -58.4, hero: true, stampIcon: 'dome', country: 'AR' }, { id: 'bangkok', name: 'Bangkok', lat: 13.7, lon: 100.5, hero: false, stampIcon: 'temple', country: 'TH' },
];
class S extends Phaser.Scene {
  sky: any; g: any; t = 0;
  create() {
    generateAllArt(this);
    if (mode === 'sky') { this.sky = buildSkyline(this, city, tod, city === 'tokyo' ? 'rainy' : 'temperate'); ptext(this, 8, 8, `${city.toUpperCase()} ${tod}`, PAL.white, 2); return; }
    if (mode === 'globe') { this.add.rectangle(0, 0, 360, 640, PAL.night0).setOrigin(0); this.g = drawGlobe(this, 180, 240, 120, CITIES, ['miami', 'lisbon', 'innsbruck'], 'innsbruck', ['miami', 'lisbon', 'innsbruck', 'tokyo'], -11); ptext(this, 8, 8, 'GLOBE', PAL.white, 2); CITIES.forEach((c, i) => this.add.image(30 + (i % 6) * 54, 420 + Math.floor(i / 6) * 60, stampTexture(this, c, i % 3 === 0)).setScale(1.2)); return; }
    this.add.rectangle(0, 0, 360, 640, PAL.night1).setOrigin(0);
    ptext(this, 8, 6, 'THE NOMAD TRAIL', PAL.sun3, 2); ptext(this, 8, 26, 'pix font: Hello, world! 0123456789 ?!.,;:-+ ~', PAL.white, 1);
    const vs = ['base', 'suitcase', 'brokenwheel', 'limp', 'shell', 'shell_suitcase'];
    vs.forEach((v, i) => { const s = this.add.sprite(30 + i * 56, 80, 'nomad_' + v).setScale(2); s.play('nomad_' + v + '_walk'); ptext(this, 30 + i * 56, 116, v.slice(0, 9), PAL.gray2, 1).setOrigin(0.5, 0); });
    ['suitcase', 'suitcase_broken', 'backpack'].forEach((k, i) => this.add.image(40 + i * 70, 190, k).setScale(1.5));
    ['tr_plane', 'tr_train', 'tr_bus', 'tr_ferry', 'tr_campervan', 'tr_trek', 'tr_car'].forEach((k, i) => this.add.image(40 + i * 46, 260, k).setScale(1.5));
    ['ic_heart', 'ic_bolt', 'ic_smile', 'ic_shirt', 'ic_weight', 'ic_day', 'ic_coffee', 'ic_bag', 'ic_pack', 'ic_gold', 'ic_mute', 'ic_sound'].forEach((k, i) => this.add.image(24 + i * 28, 300, k).setScale(2));
    const items: any[] = [{ id: 'mac', name: 'MacBook', label: 'MacBook', w: 3, h: 2, tags: ['work'], color: PAL.gray2 }, { id: 'coffee', name: 'Coffee kit', label: 'Coffee', w: 2, h: 2, tags: ['coffee'], color: PAL.earth2 }, { id: 'kettle', name: 'Kettle', label: 'Kettle', w: 1, h: 1, tags: ['kettle', 'trap'], color: PAL.red }, { id: 'sw', name: 'Switch', label: 'Switch', w: 2, h: 1, tags: ['switch'], color: PAL.pink }, { id: 'fa', name: 'First aid', label: 'First aid', w: 1, h: 1, tags: ['firstaid'], color: PAL.white }, { id: 'kite', name: 'Kite', label: 'Kite', w: 3, h: 2, tags: ['kite'], color: PAL.neon }];
    let x = 8; items.forEach(it => { this.add.image(x, 330, itemTile(this, it, 22)).setOrigin(0); x += it.w * 22 + 6; });
    this.add.image(40, 400, 'cf_grinder').setScale(2); this.add.image(100, 400, 'cf_kettle').setScale(2); this.add.image(160, 400, 'cf_dripper').setScale(2); this.add.image(220, 400, 'cf_cup', 4).setScale(2);
    CITIES.forEach((c, i) => this.add.image(30 + (i % 7) * 48, 470 + Math.floor(i / 7) * 52, stampTexture(this, c, i % 2 === 0)));
    ptext(this, 8, 560, 'pix2 heading test ABC xyz', PAL.neon, 2);
  }
  update(_: number, dt: number) { this.t += dt; this.sky?.update(dt); this.sky?.scroll(dt * 0.03); this.g?.pulse(dt); }
}
new Phaser.Game({ type: Phaser.CANVAS, parent: 'game', width: 360, height: 640, pixelArt: true, backgroundColor: PAL.night0, scene: [S] });
