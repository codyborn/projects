// COIN COLLECTOR (game id 'carryon', scene key 'CarryOn' kept for the engine): a side-scrolling platformer course 6 to 8 screens wide.
// Reach the flag at the end; coins along the way are extra. D-pad moves, A jumps (variable height), B sprints, DOWN drops through thin ledges.
// Ticks and bed bugs patrol the platforms (stomp them from above), the city's own hazards (rocks, pigeons, mosquitoes, water, gusts) stay,
// pits respawn you at the last safe ground, water levels swell slowly.
// Score: reached the flag ? 60 + 40 × coins/total : 30 × progress. 90 s cap shown as a thin bar.
import Phaser from 'phaser';
import { PAL } from '../../../core/palette';
import type { ArcadeLevel, Hazard } from '../../../core/types';
import { TILE, PHYS, MOVE_RANGE, SPRINT, validateLevel } from '../../carryonLevel';
import { clamp, pixTexture } from '../../_shared';
import type { Pad } from '../input';
import type { ConsoleCtx, ConsoleGame, ConsoleResult } from './types';

type Critter = 'tick' | 'bug';
interface Mover { spr: Phaser.GameObjects.Rectangle | Phaser.GameObjects.Sprite; vx: number; vy: number; kind: Hazard | 'critter'; critter?: Critter; t: number; x0: number; y0: number; dir: number; alive: boolean; w: number; h: number; }
/** hazards that keep their own sprite / behaviour; every other city gets critters on its spawners */
const OWN_SPRITE: Hazard[] = ['rock', 'pigeon', 'mosquito', 'wave', 'gust'];
const CAP = 90, RAMP_AT = 60;

export class CarryOnGame implements ConsoleGame {
  readonly id = 'carryon' as const; readonly name = 'COIN COLLECTOR'; readonly controls = ['D-PAD  move · DOWN drop through thin ledges', 'A      jump (hold for higher)', 'B      hold to sprint · START  pause']; readonly capSec = CAP; readonly timerBar = true;
  get instructions() { const hz = this.level?.hazard; const own = hz && OWN_SPRITE.includes(hz) && hz !== 'wave' && hz !== 'gust'; return `Reach the flag. Coins are extra. Stomp the bugs${own ? `, dodge the ${hz}s` : ''}. D-pad moves, A jumps, hold B to sprint, DOWN drops through thin ledges.`; }
  private ctx!: ConsoleCtx; private done!: (r: ConsoleResult) => void; private level!: ArcadeLevel; private ox = 0; private oy = 0; private cols = 23; private rows = 20;
  private player!: Phaser.Physics.Arcade.Sprite; private solids!: Phaser.Physics.Arcade.StaticGroup; private oneways!: Phaser.Physics.Arcade.StaticGroup; private movingPlats!: Phaser.Physics.Arcade.Group;
  private coins: Phaser.GameObjects.Image[] = []; private spikes: Phaser.Geom.Rectangle[] = []; private movers: Mover[] = []; private spawners: { x: number; y: number }[] = [];
  private crumbles: { img: Phaser.Physics.Arcade.Image; t: number }[] = []; private flag!: { x: number; y: number; pole: Phaser.GameObjects.Rectangle; cloth: Phaser.GameObjects.Image };
  private hearts = 3; private collected = 0; private total = 0; private t = 0; private iframes = 0; private windForce = 0; private windT = 0; private waterY = 0; private rockT = 0; private gd = 1;
  private jumpBuffer = 0; private coyote = 0; private jumpHeld = false; private ended = false; private dropT = 0; private respawnT = 0; private runCycle = 0; private dust: { x: number; y: number; r: number; life: number }[] = []; private dustT = 0; private sprinting = false; private safe = { x: 0, y: 0 }; private maxX = 0; private camX = 0;
  private objs: Phaser.GameObjects.GameObject[] = []; private windStreaks!: Phaser.GameObjects.Graphics; private dustG!: Phaser.GameObjects.Graphics; private water!: Phaser.GameObjects.Rectangle; private bar!: Phaser.GameObjects.Graphics; private coinT!: Phaser.GameObjects.Text;
  /** the harness reads these */ stats = { stomps: 0, pits: 0, reachedFlag: false, sprintSec: 0 };

  init(ctx: ConsoleCtx, done: (r: ConsoleResult) => void) {
    this.ctx = ctx; this.done = done; this.level = ctx.level; const s = ctx.scene;
    this.rows = this.level.tiles.length; this.cols = Math.max(...this.level.tiles.map(r => r.length)); this.ox = ctx.screen.x; this.oy = ctx.screen.y;
    const issues = validateLevel(this.level); if (issues.length) console.warn('[CoinCollector] level issues:', this.level.city, issues);
    const [bg, mid, fg] = ctx.palette; const D = ctx.depth; const S = ctx.screen; const LW = this.cols * TILE;
    this.textures(fg);
    this.objs.push(s.add.rectangle(S.width / 2, S.height / 2, S.width, S.height, bg).setDepth(D).setScrollFactor(0));
    // parallax skyline: spread over the reduced scroll range so it covers the whole course at factor 0.35
    const span = S.width + 0.35 * (LW - S.width); for (let x = -10; x < span + 60; x += 24 + Math.floor(ctx.rng() * 16)) { const bw = 18 + Math.floor(ctx.rng() * 26), bh = 40 + Math.floor(ctx.rng() * 130); this.objs.push(s.add.rectangle(this.ox + x + bw / 2, S.bottom - bh / 2, bw, bh, mid, 0.6).setDepth(D + 1).setScrollFactor(0.35, 1)); }
    this.solids = s.physics.add.staticGroup(); this.oneways = s.physics.add.staticGroup(); this.movingPlats = s.physics.add.group({ allowGravity: false, immovable: true }); let sx = this.ox + TILE, sy = this.oy + TILE;
    // solids: merge horizontal runs into one tile-sprite + one static zone each (a course has ~600 solid tiles)
    this.level.tiles.forEach((row, y) => { let x = 0; while (x < row.length) { if (row[x] !== '#') { x++; continue; } let x1 = x; while (x1 < row.length && row[x1] === '#') x1++; const w = (x1 - x) * TILE; const px = this.ox + x * TILE + w / 2, py = this.oy + y * TILE + TILE / 2; this.objs.push(s.add.tileSprite(px, py, w, TILE, 'co_tile').setDepth(D + 3)); const z = s.add.zone(px, py, w, TILE); this.solids.add(z); (z.body as Phaser.Physics.Arcade.StaticBody).updateFromGameObject(); this.objs.push(z); x = x1; } });
    this.level.tiles.forEach((row, y) => [...row].forEach((c, x) => {
      const px = this.ox + x * TILE + TILE / 2, py = this.oy + y * TILE + TILE / 2;
      if (c === '-' || c === 'C') { const img = this.oneways.create(px, py - 5, c === 'C' ? 'co_crumble' : 'co_oneway') as Phaser.Physics.Arcade.Image; img.setDepth(D + 3); img.refreshBody(); const b = img.body as Phaser.Physics.Arcade.StaticBody; b.checkCollision.down = false; b.checkCollision.left = false; b.checkCollision.right = false; if (c === 'C') this.crumbles.push({ img, t: 0 }); this.objs.push(img); }
      else if (c === 'M') { const img = this.movingPlats.create(px + TILE / 2, py - 4, 'co_mover') as Phaser.Physics.Arcade.Image; img.setDepth(D + 3); const b = img.body as Phaser.Physics.Arcade.Body; b.setSize(32, 8); b.checkCollision.down = false; b.friction.x = 1; img.setData('x0', px + TILE / 2); img.setData('dir', ctx.rng() < 0.5 ? 1 : -1); b.setVelocityX(40 * img.getData('dir')); this.objs.push(img); }
      else if (c === '*') { const st = s.add.image(px, py, 'co_coin').setDepth(D + 4); s.tweens.add({ targets: st, y: py - 3, duration: 600 + (x * 37) % 300, yoyo: true, repeat: -1, ease: 'Sine.InOut' }); this.coins.push(st); this.total++; this.objs.push(st); }
      else if (c === '^') { this.objs.push(s.add.image(px, py + 2, 'co_spike').setDepth(D + 4)); this.spikes.push(new Phaser.Geom.Rectangle(px - 6, py - 2, 12, 10)); }
      else if (c === 'S') { sx = px; sy = py; }
      else if (c === 'H') this.spawners.push({ x: px, y: py });
      else if (c === 'F') { const pole = s.add.rectangle(px, py - TILE * 2, 3, TILE * 5, PAL.gray2).setDepth(D + 4); const cloth = s.add.image(px + 9, py - TILE * 4 - 2, 'co_flag').setDepth(D + 5); this.objs.push(pole, cloth); this.flag = { x: px, y: py, pole, cloth }; s.tweens.add({ targets: cloth, scaleX: 0.85, duration: 400, yoyo: true, repeat: -1, ease: 'Sine.InOut' }); }
    }));
    this.player = s.physics.add.sprite(sx, sy, 'co_player').setDepth(D + 6); this.player.setSize(10, 13).setOffset(1, 1); this.player.setMaxVelocity(320, 620);   // headroom for sprint + a gust this.objs.push(this.player); this.safe = { x: sx, y: sy }; this.maxX = sx;
    s.physics.add.collider(this.player, this.solids);
    s.physics.add.collider(this.player, this.oneways, undefined, () => this.dropT <= 0);
    s.physics.add.collider(this.player, this.movingPlats, undefined, () => this.dropT <= 0 && (this.player.body as Phaser.Physics.Arcade.Body).velocity.y >= 0);
    this.windStreaks = s.add.graphics().setDepth(D + 5).setScrollFactor(0); this.objs.push(this.windStreaks);
    this.dustG = s.add.graphics().setDepth(D + 5); this.objs.push(this.dustG);   // sprint dust + speed lines (world space, behind the player)
    this.water = s.add.rectangle(this.ox + LW / 2, S.bottom + 200, LW, 400, PAL.sea1, 0.75).setDepth(D + 7).setVisible(this.level.hazard === 'wave'); this.objs.push(this.water);
    this.bar = s.add.graphics().setDepth(D + 9).setScrollFactor(0); this.objs.push(this.bar);
    this.coinT = s.add.text(S.width - 14, 6, '', { fontFamily: 'monospace', fontSize: '10px', color: '#f7cf6b' }).setOrigin(1, 0).setDepth(D + 9).setScrollFactor(0); this.objs.push(this.coinT);
    this.spawnHazards(); this.ctx.setHearts(this.hearts, 3); this.status();
    this.camX = this.ox; this.ctx.camera.setScroll(this.camX, this.oy);
  }
  private status() { this.ctx.setStatus(`${this.collected}/${this.total}`); this.coinT.setText(`◎ ${this.collected}/${this.total}`); }

  private textures(fg: number) {
    const s = this.ctx.scene;
    pixTexture(s, 'co_tile', ['AAAAAAAAAAAAAAAA', 'ABBBBBBBABBBBBBB', 'ABBBBBBBABBBBBBB', 'ABBBBBBBABBBBBBB', 'AAAAAAAAAAAAAAAA', 'ABBBABBBBBBBABBB', 'ABBBABBBBBBBABBB', 'ABBBABBBBBBBABBB', 'AAAAAAAAAAAAAAAA', 'ABBBBBBBABBBBBBB', 'ABBBBBBBABBBBBBB', 'ABBBBBBBABBBBBBB', 'AAAAAAAAAAAAAAAA', 'ABBBABBBBBBBABBB', 'ABBBABBBBBBBABBB', 'ABBBABBBBBBBABBB'], { A: PAL.ink, B: fg });
    pixTexture(s, 'co_oneway', ['AAAAAAAAAAAAAAAA', 'ACCCCCCCCCCCCCCA', 'AAAAAAAAAAAAAAAA', '.A..A..A..A..A..'], { A: PAL.ink, C: PAL.earth3 });
    pixTexture(s, 'co_crumble', ['AAAAAAAAAAAAAAAA', 'ADDADDDADDADDDDA', 'AAAAAAAAAAAAAAAA', '..A.....A....A..'], { A: PAL.ink, D: PAL.earth2 });
    pixTexture(s, 'co_mover', ['AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', 'ABBBBBBBBBBBBBBBBBBBBBBBBBBBBBBA', 'ABBBBBBBBBBBBBBBBBBBBBBBBBBBBBBA', 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', '....A....................A......', '....A....................A......', '...AAA..................AAA.....', '................................'], { A: PAL.ink, B: PAL.sky1 });
    pixTexture(s, 'co_coin', ['..AAAA..', '.ABBBBA.', 'ABBCCBBA', 'ABCDDCBA', 'ABCDDCBA', 'ABBCCBBA', '.ABBBBA.', '..AAAA..'], { A: PAL.ink, B: PAL.sun1, C: PAL.sun2, D: PAL.white });
    pixTexture(s, 'co_flag', ['AAAAAAAAAAAAAA', 'ABBBBBBBBBBBBA', 'ABBCCCBBBBBBA.', 'ABBCDCBBBBBA..', 'ABBCCCBBBBA...', 'ABBBBBBBBBBA..', 'ABBBBBBBBBBBA.', 'AAAAAAAAAAAAAA'], { A: PAL.ink, B: PAL.red, C: PAL.sun2, D: PAL.white });
    // critters: TICK (round dark body, red dot, eight tiny legs, waddles) and BED BUG (flat segmented brown oval, antennae, scuttles)
    const K = { A: PAL.ink, B: PAL.night0, R: PAL.red, L: PAL.gray1, E: PAL.earth2, F: PAL.earth1, W: PAL.white };
    pixTexture(s, 'co_tick0', ['....AAAA....', '..AABBBBAA..', '.ABBBBBBBBA.', '.ABBBRRBBBA.', '.ABBBRRBBBA.', '..AABBBBAA..', 'L..L.AA.L..L', '.L.L....L.L.'], K);
    pixTexture(s, 'co_tick1', ['....AAAA....', '..AABBBBAA..', '.ABBBBBBBBA.', '.ABBBRRBBBA.', '.ABBBRRBBBA.', '..AABBBBAA..', '.L.L.AA.L.L.', 'L..L....L..L'], K);
    pixTexture(s, 'co_tick_sq', ['AAAAAAAAAAAA', 'ABBBBRRBBBBA', 'LAAAAAAAAAAL'], K);
    pixTexture(s, 'co_bug0', ['...........L.L', '..AAAAAAAA.AA.', '.AEEEFEEEFAEA.', 'AEEEEFEEEEFEEA', 'AEEEEFEEEEFEEA', '.AEEEFEEEFAA..', '..L.L..L.L....', '.L...L....L...'], K);
    pixTexture(s, 'co_bug1', ['..........L..L', '..AAAAAAAA.AA.', '.AEEEFEEEFAEA.', 'AEEEEFEEEEFEEA', 'AEEEEFEEEEFEEA', '.AEEEFEEEFAA..', '.L.L..L.L.....', '..L...L....L..'], K);
    pixTexture(s, 'co_bug_sq', ['AAAAAAAAAAAAAA', 'AEEEFEEEFEEEFA', 'LAAAAAAAAAAAAL'], K);
    pixTexture(s, 'co_spike', ['.....A......A...', '....ABA....ABA..', '...ABBBA..ABBBA.', '..ABBBBBAABBBBBA', '.AAAAAAAAAAAAAAA'], { A: PAL.ink, B: PAL.gray2 });
    pixTexture(s, 'co_player', ['..AAAAAA..', '.ABBBBBBA.', '.ABCCBCCA.', '.ABBBBBBA.', '..ADDDDA..', '.AEEEEEEA.', 'AEEFFFFEEA', 'AEEFFFFEEA', '.AEEEEEEA.', '..AGGGGA..', '..AG..GA..', '..AG..GA..', '..AA..AA..', '.AHA..AHA.', '..........'], { A: PAL.ink, B: PAL.earth3, C: PAL.ink, D: PAL.earth1, E: PAL.sun0, F: PAL.sun1, G: PAL.night3, H: PAL.gray2 });
  }

  /** which critter a spawner gets: climate first, then the hazard's setting, else alternate */
  private critterFor(i: number): Critter {
    const cl = this.ctx.climate; if (cl) return ['hot', 'rainy', 'temperate'].includes(cl) ? 'bug' : 'tick';
    const hz = this.level.hazard; if (['tuktuk', 'tram', 'crowd', 'mosquito', 'pigeon'].includes(hz)) return 'bug'; if (['otter', 'yak', 'snow', 'ice', 'rock'].includes(hz)) return 'tick';
    return i % 2 ? 'bug' : 'tick';
  }
  private spawnHazards() {
    const hz = this.level.hazard; const s = this.ctx.scene; const D = this.ctx.depth;
    const box = (x: number, y: number, w: number, h: number, color: number, kind: Hazard, vx = 0): Mover => { const spr = s.add.rectangle(x, y, w, h, color).setStrokeStyle(1, PAL.ink).setDepth(D + 5); const m: Mover = { spr, vx, vy: 0, kind, t: this.ctx.rng() * 10, x0: x, y0: y, dir: 1, alive: true, w, h }; this.movers.push(m); this.objs.push(spr); return m; };
    const critter = (x: number, y: number, c: Critter, spd: number) => { const spr = s.add.sprite(x, this.groundBelow(x, y) - (c === 'tick' ? 5 : 4), c === 'tick' ? 'co_tick0' : 'co_bug0').setDepth(D + 5); const m: Mover = { spr, vx: spd * (c === 'tick' ? 0.7 : 1.1), vy: 0, kind: 'critter', critter: c, t: this.ctx.rng() * 10, x0: x, y0: y, dir: this.ctx.rng() < 0.5 ? -1 : 1, alive: true, w: c === 'tick' ? 10 : 12, h: c === 'tick' ? 8 : 6 }; this.movers.push(m); this.objs.push(spr); return m; };
    const pts = this.spawners.length ? this.spawners : [{ x: this.ox + TILE * 30, y: this.oy + TILE * 2 }]; const spd = 30 + 30 * this.ctx.difficulty;
    pts.forEach((p, i) => {
      if (hz === 'mosquito' && i % 2 === 0) { box(p.x, p.y - 20, 6, 4, PAL.gray1, hz, spd); return; }
      if (hz === 'pigeon' && i % 2 === 0) { box(p.x, p.y - 30, 10, 6, PAL.gray2, hz, spd * 1.3); return; }
      critter(p.x, p.y, this.critterFor(i), spd);   // every other city: the platforms belong to the bugs
    });
    if (hz === 'wave') this.waterY = this.oy + this.rows * TILE - TILE * 1.5;
  }
  private groundBelow(x: number, y: number) { const cx = Math.floor((x - this.ox) / TILE); let cy = Math.floor((y - this.oy) / TILE); while (cy < this.rows - 1 && (this.level.tiles[cy + 1][cx] || '.') !== '#') cy++; return this.oy + (cy + 1) * TILE; }
  private tileAt(x: number, y: number) { const cx = Math.floor((x - this.ox) / TILE), cy = Math.floor((y - this.oy) / TILE); if (cy < 0 || cy >= this.rows || cx < 0 || cx >= this.cols) return '#'; return this.level.tiles[cy][cx] || '.'; }
  private isSolidAt(x: number, y: number) { return this.tileAt(x, y) === '#'; }
  private onThinPlatform() { const c = this.tileAt(this.player.x, this.player.y + 8); return c === '-' || c === 'C' || c === 'M'; }
  private ramp() { return 1 + 0.6 * clamp(this.t / RAMP_AT, 0, 1); }
  get progress() { return clamp((this.maxX - this.ox) / (this.cols * TILE - 6 * TILE), 0, 1); }

  update(dtIn: number, pad: Pad) {
    if (this.ended) { this.player.setVelocityX(0); this.camera(dtIn); return; }
    const dt = Math.min(0.033, dtIn); this.t += dt; const body = this.player.body as Phaser.Physics.Arcade.Body; const hz = this.level.hazard; const rp = this.ramp(); const S = this.ctx.screen;
    this.respawnT -= dt; const frozen = this.respawnT > 0; const left = pad.held('left') && !frozen, right = pad.held('right') && !frozen; if (pad.justPressed('a') && !frozen) { this.jumpBuffer = 0.12; this.jumpHeld = true; }
    const sprint = pad.held('b') && !frozen; this.sprinting = sprint; if (sprint) this.stats.sprintSec += dt;
    const run = PHYS.run * (sprint ? SPRINT.run : 1) * (1 - 0.15 * this.ctx.hard); const slippery = hz === 'ice';
    if (slippery) { const ax = (left ? -1 : right ? 1 : 0) * 500; body.setAccelerationX(ax); body.setDragX(ax === 0 ? 120 : 0); if (Math.abs(body.velocity.x) > run) body.setVelocityX(Math.sign(body.velocity.x) * run); }
    else { body.setAccelerationX(0); body.setVelocityX((left ? -run : right ? run : 0) + this.windForce); }
    if (left) this.player.setFlipX(true); if (right) this.player.setFlipX(false);
    const grounded = body.blocked.down || body.touching.down; if (grounded) this.coyote = 0.1; else this.coyote -= dt; this.jumpBuffer -= dt;
    // riding a moving platform: arcade friction carries us, but keep it explicit when standing still
    if (grounded && !left && !right && !slippery) { for (const mp of this.movingPlats.getChildren() as Phaser.Physics.Arcade.Image[]) { if (Math.abs(this.player.x - mp.x) < 20 && Math.abs(this.player.y + 7 - (mp.y - 4)) < 6) body.setVelocityX((mp.body as Phaser.Physics.Arcade.Body).velocity.x); } }
    // last safe ground (real ground, not over a pit, not thin)
    if (grounded && this.tileAt(this.player.x, this.player.y + 8) === '#' && this.tileAt(this.player.x + 20, this.player.y + 8) === '#' && this.tileAt(this.player.x - 20, this.player.y + 8) === '#') this.safe = { x: this.player.x, y: this.player.y };
    this.dropT -= dt; if (pad.justPressed('down') && grounded && this.onThinPlatform()) { this.dropT = 0.15; this.coyote = 0; body.setVelocityY(60); this.ctx.sfx('whoosh'); }
    const jv = (hz === 'snow' ? PHYS.snowJump : PHYS.jump) * (sprint ? SPRINT.jump : 1) * (1 - 0.04 * this.ctx.hard);   // a taller arc carries the extra momentum, so gaps stay clearable
    if (this.jumpBuffer > 0 && this.coyote > 0) { body.setVelocityY(-jv); this.jumpBuffer = 0; this.coyote = 0; this.player.setScale(0.8, 1.25); this.ctx.scene.tweens.add({ targets: this.player, scaleX: 1, scaleY: 1, duration: 140 }); this.ctx.sfx('jump'); }
    if (!pad.held('a')) { if (this.jumpHeld && body.velocity.y < -80) body.setVelocityY(body.velocity.y * 0.55); this.jumpHeld = false; }
    for (const c of this.crumbles) { if (!c.img.active) continue; const b = c.img.body as Phaser.Physics.Arcade.StaticBody; const on = grounded && Math.abs(this.player.x - c.img.x) < 10 && Math.abs((this.player.y + 7) - b.y) < 8; if (on || c.t > 0) c.t += dt; if (c.t > 0.35) { c.img.disableBody(true, true); } }
    // moving platforms bounce at the ends of their travel
    for (const mp of this.movingPlats.getChildren() as Phaser.Physics.Arcade.Image[]) { const b = mp.body as Phaser.Physics.Arcade.Body; const x0 = mp.getData('x0') as number; if (Math.abs(mp.x - x0) > MOVE_RANGE * TILE) { const d = -Math.sign(mp.x - x0); mp.x = x0 + Math.sign(mp.x - x0) * MOVE_RANGE * TILE; b.setVelocityX(40 * d); } }
    // pits: fall out → back to the last safe ground, one heart
    const wh = this.rows * TILE; if (this.player.y > this.oy + wh + 30) { this.stats.pits++; this.player.setPosition(this.safe.x - 16, this.safe.y - 2); body.setVelocity(0, 0); this.respawnT = 0.35; this.hurt(0); }   // back from the lip, brief input freeze
    const pr = new Phaser.Geom.Rectangle(this.player.x - 5, this.player.y - 7, 10, 14);
    for (const st of this.coins) if (st.active && Math.abs(st.x - this.player.x) < 40 && Phaser.Geom.Intersects.RectangleToRectangle(pr, new Phaser.Geom.Rectangle(st.x - 4, st.y - 4, 8, 8))) { st.setActive(false); this.collected++; this.status(); this.ctx.scene.tweens.add({ targets: st, y: st.y - 20, alpha: 0, scale: 1.4, duration: 250, onComplete: () => st.setVisible(false) }); this.ctx.sfx('coin'); }
    if (this.iframes > 0) { this.iframes -= dt; this.player.setAlpha(Math.sin(this.iframes * 40) > 0 ? 1 : 0.3); } else { this.player.setAlpha(1); for (const sp of this.spikes) if (Math.abs(sp.x - this.player.x) < 30 && Phaser.Geom.Intersects.RectangleToRectangle(pr, sp)) { this.hurt(); break; } }
    this.hazards(dt, pr, rp);
    // the flag
    if (this.flag && Math.abs(this.player.x - this.flag.x) < 8 && this.player.y < this.flag.y + 8) { this.reachFlag(); return; }
    this.maxX = Math.max(this.maxX, this.player.x);
    this.feet(dt, sprint, grounded, left || right);
    this.camera(dt, sprint);
    // time bar (thin, top of the screen) + coin counter
    const rem = clamp(1 - this.t / CAP, 0, 1); this.bar.clear(); this.bar.fillStyle(PAL.ink, 0.7).fillRect(6, 6, S.width - 90, 5); this.bar.fillStyle(rem > 0.25 ? PAL.neon : PAL.red).fillRect(7, 7, (S.width - 92) * rem, 3);
  }
  /** camera follows with a lerp, 40% from the left edge, clamped to the course; it tightens while sprinting so the player cannot outrun it */
  private camera(dt: number, sprint = false) { const S = this.ctx.screen; const target = clamp(this.player.x - S.width * 0.4, this.ox, this.ox + this.cols * TILE - S.width); this.camX += (target - this.camX) * Math.min(1, dt * (sprint ? 10 : 6)); this.ctx.camera.setScroll(Math.round(this.camX), this.oy); }
  /** run cycle (bob, twice as fast sprinting), dust puffs off the back foot and speed lines behind the shoulders */
  private feet(dt: number, sprint: boolean, grounded: boolean, moving: boolean) {
    this.runCycle += dt * (moving ? (sprint ? 20 : 11) : 0);
    if (grounded && moving) { const b = Math.sin(this.runCycle); this.player.setScale(1 - b * 0.05, 1 + b * 0.06); } else if (grounded) this.player.setScale(1, 1);
    const dir = this.player.flipX ? 1 : -1;   // behind the player
    if (sprint && moving) { this.dustT -= dt; if (this.dustT <= 0) { this.dustT = grounded ? 0.05 : 0.1; this.dust.push({ x: this.player.x + dir * 6, y: this.player.y + (grounded ? 7 : 2), r: 1.5 + this.ctx.rng() * 2, life: 1 }); } }
    const g = this.dustG; g.clear();
    for (const d of this.dust) { d.life -= dt * 2.6; d.x += dir * 26 * dt; d.y -= 14 * dt; d.r += 9 * dt; if (d.life > 0) g.fillStyle(PAL.gray2, 0.5 * d.life).fillCircle(d.x, d.y, d.r); }
    this.dust = this.dust.filter(d => d.life > 0); if (this.dust.length > 40) this.dust.splice(0, this.dust.length - 40);
    if (sprint && moving) { const a = 0.35 + 0.25 * Math.abs(Math.sin(this.runCycle)); for (let i = 0; i < 3; i++) g.fillStyle(PAL.white, a * (1 - i * 0.25)).fillRect(this.player.x + dir * (10 + i * 7), this.player.y - 4 + i * 5, 6 + i * 2, 1); }
  }

  private hazards(dt: number, pr: Phaser.Geom.Rectangle, rp: number) {
    const hz = this.level.hazard; const s = this.ctx.scene; const body = this.player.body as Phaser.Physics.Arcade.Body; const S = this.ctx.screen; const D = this.ctx.depth; const LW = this.cols * TILE;
    if (hz === 'gust') { this.windT += dt * rp; const cyc = 5 - 1.5 * this.ctx.difficulty; const ph = this.windT % cyc; this.windStreaks.clear();
      if (ph > cyc - 1.2 && ph < cyc - 0.2) { this.gd = Math.sin(this.windT * 0.3) > 0 ? 1 : -1; for (let i = 0; i < 8; i++) this.windStreaks.fillStyle(PAL.white, 0.35).fillRect(((i * 53 + this.windT * 400 * this.gd) % S.width + S.width) % S.width, 20 + i * 36, 30, 1); this.windForce = 0; }
      else if (ph >= cyc - 0.2 || ph < 0.9) { this.windForce = 90 * rp * this.gd; for (let i = 0; i < 16; i++) this.windStreaks.fillStyle(PAL.sky3, 0.6).fillRect(((i * 41 + this.windT * 700 * this.gd) % S.width + S.width) % S.width, 10 + i * 19, 50, 2); } else this.windForce = 0; }
    if (hz === 'rock') { this.rockT += dt; const every = (1.6 - 0.6 * this.ctx.difficulty) / rp; if (this.rockT > every) { this.rockT = 0; const px = this.player.x + 40 + this.ctx.rng() * 140; if (px < this.ox + LW - TILE) { const spr = s.add.rectangle(px, this.oy + TILE, 12, 12, PAL.gray1).setStrokeStyle(1, PAL.ink).setDepth(D + 5); this.movers.push({ spr, vx: 0, vy: 0, kind: 'rock', t: 0, x0: px, y0: this.oy + TILE, dir: 1, alive: true, w: 12, h: 12 }); this.objs.push(spr); } } }
    // water: 2 s grace, then a slow swell (period ~25 s at 1x)
    if (hz === 'wave') { if (this.t > 2) this.windT += dt * rp; const amp = TILE * (2 + 1.5 * this.ctx.difficulty); /* floods the ground; first-step platforms stay dry */ const base = this.oy + this.rows * TILE - TILE; this.waterY = base - Math.max(0, Math.sin(this.windT * 0.25)) * amp; this.water.setPosition(this.ox + LW / 2, this.waterY + 200); if (this.player.y - 4 > this.waterY) { this.hurt(); this.player.setPosition(this.player.x, this.waterY - 30); body.setVelocityY(-200); } }
    for (const m of this.movers) {
      if (!m.alive) continue; const sp = m.spr; if (Math.abs(sp.x - this.player.x) > S.width * 1.2) continue;   // only the nearby stretch is simulated
      m.t += dt;
      switch (m.kind) {
        case 'critter': { sp.x += m.vx * rp * m.dir * dt; const ahead = sp.x + (m.w / 2 + 2) * m.dir; if (this.isSolidAt(ahead, sp.y) || !this.isSolidAt(ahead, sp.y + m.h / 2 + 4)) m.dir *= -1; const spr = sp as Phaser.GameObjects.Sprite; spr.setFlipX(m.dir < 0); spr.setTexture(`co_${m.critter}${Math.floor(m.t * (m.critter === 'tick' ? 6 : 10)) % 2}`); break; }   // patrol: turn at walls and ledge ends, waddle / scuttle
        case 'mosquito': { const hx = Math.sign(this.player.x - sp.x), hy = Math.sign(this.player.y - sp.y); sp.x += (hx * 18 * rp + Math.sin(m.t * 6) * 30) * dt; sp.y += (hy * 14 * rp + Math.cos(m.t * 5) * 30) * dt; sp.x = clamp(sp.x, m.x0 - 120, m.x0 + 120); sp.y = clamp(sp.y, this.oy + TILE, this.oy + this.rows * TILE - TILE); break; }
        case 'pigeon': { sp.x += m.vx * rp * m.dir * dt; sp.y = m.y0 + Math.sin(m.t * 1.6) * 40; if (Math.abs(sp.x - m.x0) > 100) m.dir *= -1; break; }
        case 'rock': { m.vy += 500 * rp * dt; sp.y += m.vy * dt; if (this.isSolidAt(sp.x, sp.y + 7)) { m.alive = false; s.tweens.add({ targets: sp, alpha: 0, scale: 1.6, duration: 150, onComplete: () => sp.destroy() }); } break; }
        default: break;
      }
      if (m.alive && Phaser.Geom.Intersects.RectangleToRectangle(pr, new Phaser.Geom.Rectangle(sp.x - m.w / 2, sp.y - m.h / 2, m.w, m.h))) {
        if (m.kind !== 'rock' && body.velocity.y > 60 && this.player.y + 4 < sp.y) { m.alive = false; this.stats.stomps++; body.setVelocityY(-220); this.ctx.sfx('pop');   // stomp: squash frame, then fade
          if (m.kind === 'critter') { const spr = sp as Phaser.GameObjects.Sprite; spr.setTexture(`co_${m.critter}_sq`); spr.y += 2; s.tweens.add({ targets: spr, alpha: 0, duration: 450, delay: 120, onComplete: () => spr.destroy() }); }
          else s.tweens.add({ targets: sp, scaleY: 0.2, alpha: 0, duration: 180, onComplete: () => sp.destroy() }); }
        else if (this.iframes <= 0) this.hurt(Math.sign(this.player.x - sp.x) || 1);
      }
    }
    this.movers = this.movers.filter(m => m.alive || m.spr.active);
  }

  private hurt(kx = 1) {
    if (this.iframes > 0 || this.ended) return; this.hearts--; this.iframes = 1.2; this.ctx.setHearts(this.hearts, 3); this.ctx.shake(160, 0.008); this.ctx.flash(PAL.red, 60); this.ctx.sfx('hurt');
    if (kx) (this.player.body as Phaser.Physics.Arcade.Body).setVelocity(140 * kx, -180);
    if (this.hearts <= 0) { this.ended = true; this.player.setTint(0x888888); this.ctx.scene.time.delayedCall(400, () => this.done({ score: 30 * this.progress, failed: true, detail: `${Math.round(this.progress * 100)}% of the course · ${this.collected}/${this.total} coins` })); }
  }
  private reachFlag() {
    if (this.ended) return; this.ended = true; this.stats.reachedFlag = true; const s = this.ctx.scene; const body = this.player.body as Phaser.Physics.Arcade.Body; body.setVelocity(0, 0); body.setAllowGravity(false); body.enable = false;
    const all = this.collected >= this.total; const score = clamp(60 + 40 * (this.collected / Math.max(1, this.total)), 60, 100);
    this.player.setPosition(this.flag.x - 6, Math.min(this.player.y, this.flag.y - TILE * 3)); this.ctx.sfx('win');
    s.tweens.add({ targets: this.player, y: this.flag.y - 2, duration: 700, ease: 'Sine.In' }); s.tweens.add({ targets: this.flag.cloth, y: this.flag.y - 6, duration: 700, ease: 'Sine.In' });   // pole slide, flag comes down
    s.time.delayedCall(750, () => { this.ctx.sfx('chime'); this.ctx.flash(PAL.sun2, 80); const S = this.ctx.screen; const t = s.add.text(S.width / 2, S.height / 2 - 20, all ? 'COURSE CLEAR · ALL COINS!' : 'COURSE CLEAR', { fontFamily: 'monospace', fontSize: '14px', color: '#f7cf6b', backgroundColor: '#0b0f1acc', padding: { x: 6, y: 3 } }).setOrigin(0.5).setDepth(this.ctx.depth + 12).setScrollFactor(0); this.objs.push(t); s.tweens.add({ targets: t, scale: { from: 0.4, to: 1 }, duration: 250, ease: 'Back.Out' });
      s.time.delayedCall(1300, () => this.done({ score, perfect: score >= 99, detail: `${this.collected}/${this.total} coins${all ? ' · all-coins bonus' : ''} · ${Math.ceil(this.t)}s` })); });
  }
  scoreNow() { return 30 * this.progress; }
  destroy() { const kill = (o?: { destroy: () => void }) => { try { if (o && (o as any).scene) o.destroy(); } catch { /* already gone */ } }; this.objs.forEach(kill); this.movers.forEach(m => kill(m.spr)); try { this.ctx.camera.setScroll(this.ctx.screen.x, this.ctx.screen.y); } catch { /* */ } }
}
