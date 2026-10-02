import Phaser from 'phaser';
import { Audio } from '../audio/synth';
import { PAL } from '../core/palette';
import { MINIGAME_KEYS, type MinigameLaunch } from '../core/types';
import { makeRng, hash32, type Rng } from '../core/sim/rng';
import { MinigameFrame, W, H, normalizeLaunch, panel, pixTexture } from './_shared';
import { txt, type Label } from '../ui/theme';
import { WHEEL, pocketColor, spinWheel, rouletteNet, CHIP_SIZES, type RouletteBet, type RouletteBetKind, REEL, PULL_COST, pullReels, slotReturn, PAYTABLE_LINES, MAX_ROUNDS, scoreFor, type Symbol } from './casino/tables';

/** A casino in any town that has one, stumbled on while exploring or walked into on purpose: a neon floor with two tables. ROULETTE (European wheel; red/black, odd/even, one number;
 *  chips $25/$50/$100) and SLOTS (three reels, $25 a pull). You gamble the run's actual bankroll (payload.money). The session ends on
 *  WALK AWAY, a bust, or 12 rounds; the frame gets score 50 + net/20 and `resultExtra.money = net` (signed dollars).
 *  Harness hooks: bet(kind, number?), setChip(i), spin(), pull(), tab('roulette'|'slots'), walkAway(). */
export class CasinoScene extends Phaser.Scene {
  private frame!: MinigameFrame; private launch!: MinigameLaunch; private rng!: Rng;
  private start = 0; private bank = 0; private rounds = 0; private ended = false; private busy = false;
  private table: 'roulette' | 'slots' = 'roulette'; private layer!: Phaser.GameObjects.Container;
  private bankLbl?: Label; private roundLbl?: Label; private msg?: Label; private tabs: { r: Phaser.GameObjects.Rectangle; l: Label; id: 'roulette' | 'slots' }[] = [];
  // roulette
  private bets: RouletteBet[] = []; private chip = 1; private pick = 17; private wheelG?: Phaser.GameObjects.Graphics; private ballG?: Phaser.GameObjects.Graphics; private ballA = 0; private wheelA = 0;
  private betLbls: Partial<Record<RouletteBetKind, Label>> = {}; private chipRects: Phaser.GameObjects.Rectangle[] = []; private lastLbl?: Label; private history: number[] = [];
  // slots
  private reelImgs: Phaser.GameObjects.Image[][] = []; private reelPos = [0, 0, 0];
  constructor() { super(MINIGAME_KEYS.casino); }
  init(data: any) {
    this.launch = normalizeLaunch(data); const p = this.launch.payload || {};
    this.start = Math.max(0, Math.round(Number(p.money) || 500)); this.bank = this.start; this.rounds = 0; this.ended = false; this.busy = false;
    this.rng = makeRng(hash32(Number(p.seed) || 1, this.start)); this.table = 'roulette'; this.bets = []; this.chip = 1; this.pick = 17; this.history = []; this.tabs = []; this.betLbls = {}; this.chipRects = []; this.reelImgs = []; this.reelPos = [0, 0, 0];
  }
  create() {
    const city = String(this.launch.payload?.cityName ?? 'Las Vegas');
    this.frame = new MinigameFrame(this, this.launch, `${city} casino`); this.cameras.main.setBackgroundColor(PAL.night0);
    this.frame.capSec = 100000; this.frame.scoreNow = () => scoreFor(this.bank - this.start);
    this.buildSymbols(); this.buildFloor(); this.frame.hud();
    this.frame.intro(`A casino in ${city}. You are playing with your own $${this.start}. Walk away whenever you like.`, () => this.setMsg('Place a bet.'), { height: 300 });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => { this.tabs = []; this.reelImgs = []; });
  }
  update(_t: number, dt: number) { this.frame.update(dt); }

  // ---------- floor ----------
  private buildFloor() {
    // neon backdrop: dark carpet with a pattern, a neon strip
    const g = this.add.graphics().setDepth(0); g.fillStyle(PAL.night1); g.fillRect(0, 24, W, H);
    for (let y = 30; y < H; y += 24) for (let x = (y / 24) % 2 ? 12 : 0; x < W; x += 24) { g.fillStyle(PAL.dusk0, 0.35); g.fillRect(x, y, 6, 6); }
    g.fillStyle(PAL.pink).fillRect(0, 26, W, 2); g.fillStyle(PAL.neon).fillRect(0, 30, W, 1);
    this.bankLbl = txt(this, 16, 46, `$${this.bank}`, 16, PAL.sun2, { align: 'left' }).setOrigin(0, 0.5).setDepth(5);
    this.roundLbl = txt(this, W - 16, 46, `round 1 / ${MAX_ROUNDS}`, 9, PAL.gray2, { align: 'right' }).setOrigin(1, 0.5).setDepth(5);
    (['roulette', 'slots'] as const).forEach((id, i) => {
      const x = 90 + i * 180; const r = this.add.rectangle(x, 74, 170, 28, PAL.night3).setDepth(5).setStrokeStyle(2, PAL.ink).setInteractive({ useHandCursor: true });
      const l = txt(this, x, 74, id.toUpperCase(), 10, PAL.white, { align: 'center' }).setOrigin(0.5).setDepth(6); r.on('pointerdown', () => this.tab(id)); this.tabs.push({ r, l, id });
    });
    this.msg = txt(this, W / 2, 566, '', 9, PAL.gray2, { align: 'center', wrap: W - 40 }).setOrigin(0.5).setDepth(6);
    const walk = this.add.rectangle(W / 2, 606, 200, 40, PAL.dusk1).setDepth(5).setStrokeStyle(2, PAL.ink).setInteractive({ useHandCursor: true });
    txt(this, W / 2, 606, 'WALK AWAY', 12, PAL.white, { align: 'center' }).setOrigin(0.5).setDepth(6); walk.on('pointerdown', () => this.walkAway());
    this.layer = this.add.container(0, 0).setDepth(4); this.tab('roulette');
  }
  private setMsg(s: string, color: number = PAL.gray2) { this.msg?.setText(s); this.msg?.setTint?.(color); }
  private refreshBank() { this.bankLbl?.setText(`$${this.bank}`); this.roundLbl?.setText(`round ${Math.min(MAX_ROUNDS, this.rounds + 1)} / ${MAX_ROUNDS}`); }
  /** Switch tables (not while a spin or pull is running). */
  tab(id: 'roulette' | 'slots') {
    if (this.busy || this.ended) return; this.table = id; this.bets = []; this.layer.removeAll(true); this.betLbls = {}; this.chipRects = []; this.reelImgs = []; this.wheelG = undefined; this.ballG = undefined;
    this.tabs.forEach(t => { t.r.setFillStyle(t.id === id ? PAL.dusk2 : PAL.night3); t.l.setAlpha(t.id === id ? 1 : 0.6); });
    if (id === 'roulette') this.buildRoulette(); else this.buildSlots();
    this.setMsg(id === 'roulette' ? 'Tap the felt to place chips, then SPIN.' : `$${PULL_COST} a pull. Three of a kind pays.`);
  }

  // ---------- roulette ----------
  /** put an object on the table layer (cleared when switching tables) */
  private L<T extends Phaser.GameObjects.GameObject>(o: T): T { this.layer.add(o); return o; }
  private buildRoulette() {
    const cx = 100, cy = 176, R = 70;
    this.wheelG = this.L(this.make.graphics({})); this.ballG = this.L(this.make.graphics({})); this.drawWheel(cx, cy, R);
    // felt with bet spots to the right of the wheel
    this.L(panel(this, 184, 100, 160, 152, PAL.grass0, PAL.grass1, PAL.ink));
    const spot = (kind: RouletteBetKind, x: number, y: number, w: number, h: number, fill: number, label: string) => {
      const r = this.L(this.add_rect(x, y, w, h, fill)); r.setInteractive({ useHandCursor: true }); r.on('pointerdown', () => kind === 'number' ? this.openGrid() : this.bet(kind));
      this.L(txt(this, x, y - (kind === 'number' ? 8 : 0), label, 9, kind === 'black' ? PAL.gray2 : PAL.white, { align: 'center' }).setOrigin(0.5));
      this.betLbls[kind] = this.L(txt(this, x, y + (kind === 'number' ? 10 : 12), '', 8, PAL.sun2, { align: 'center' }).setOrigin(0.5));
    };
    spot('red', 226, 128, 72, 40, PAL.red, 'RED'); spot('black', 302, 128, 72, 40, PAL.ink, 'BLACK'); spot('odd', 226, 172, 72, 40, PAL.grass1, 'ODD'); spot('even', 302, 172, 72, 40, PAL.grass1, 'EVEN');
    spot('number', 264, 222, 148, 44, PAL.night3, `NUMBER ${this.pick}  ·  35:1`);
    // chips
    CHIP_SIZES.forEach((c, i) => { const x = 46 + i * 62; const r = this.L(this.add_rect(x, 276, 54, 26, PAL.night3)); r.setInteractive({ useHandCursor: true }); r.on('pointerdown', () => this.setChip(i)); this.L(txt(this, x, 276, `$${c}`, 9, PAL.white, { align: 'center' }).setOrigin(0.5)); this.chipRects.push(r); });
    const clear = this.L(this.add_rect(300, 276, 90, 26, PAL.dusk0)); clear.setInteractive({ useHandCursor: true }); clear.on('pointerdown', () => { if (!this.busy) { this.bets = []; this.refreshBets(); } }); this.L(txt(this, 300, 276, 'CLEAR', 9, PAL.white, { align: 'center' }).setOrigin(0.5));
    this.setChip(this.chip);
    // history + spin
    this.lastLbl = this.L(txt(this, W / 2, 306, this.history.length ? 'last: ' + this.history.slice(-8).join('  ') : 'no spins yet', 8, PAL.gray1, { align: 'center' }).setOrigin(0.5));
    const spin = this.L(this.add_rect(W / 2, 348, 200, 44, PAL.sun0)); spin.setInteractive({ useHandCursor: true }); spin.on('pointerdown', () => this.spin());
    this.L(txt(this, W / 2, 348, 'SPIN', 14, PAL.white, { align: 'center' }).setOrigin(0.5));
    this.refreshBets();
  }
  private add_rect(x: number, y: number, w: number, h: number, fill: number) { return new Phaser.GameObjects.Rectangle(this, x, y, w, h, fill).setStrokeStyle(2, PAL.ink); }
  private drawWheel(cx: number, cy: number, R: number) {
    const g = this.wheelG!; g.clear(); const n = WHEEL.length; const step = (Math.PI * 2) / n;
    g.fillStyle(PAL.earth1).fillCircle(cx, cy, R + 8); g.fillStyle(PAL.sun1).fillCircle(cx, cy, R + 4);
    for (let i = 0; i < n; i++) { const c = pocketColor(WHEEL[i]); g.fillStyle(c === 'green' ? PAL.grass1 : c === 'red' ? PAL.red : PAL.ink); const a0 = this.wheelA + i * step, a1 = a0 + step; g.slice(cx, cy, R, a0, a1, false); g.fillPath(); }
    g.fillStyle(PAL.earth0).fillCircle(cx, cy, R * 0.45); g.fillStyle(PAL.sun2).fillCircle(cx, cy, R * 0.12);
    // pocket numbers, small, only every other one fits legibly at this size: draw ticks instead and number the winning pocket in the message
    g.lineStyle(1, PAL.sun3, 0.7); for (let i = 0; i < n; i++) { const a = this.wheelA + (i + 0.5) * step; g.lineBetween(cx + Math.cos(a) * (R - 6), cy + Math.sin(a) * (R - 6), cx + Math.cos(a) * (R - 2), cy + Math.sin(a) * (R - 2)); }
    const b = this.ballG!; b.clear(); b.fillStyle(PAL.white).fillCircle(cx + Math.cos(this.ballA) * (R - 14), cy + Math.sin(this.ballA) * (R - 14), 4);
  }
  private refreshBets() {
    (Object.keys(this.betLbls) as RouletteBetKind[]).forEach(k => { const sum = this.bets.filter(b => b.kind === k).reduce((a, b) => a + b.amount, 0); this.betLbls[k]?.setText(sum ? `$${sum}` : ''); });
    const total = this.bets.reduce((a, b) => a + b.amount, 0); if (total) this.setMsg(`$${total} on the felt. SPIN when ready.`);
  }
  /** Chip size index into CHIP_SIZES. */
  setChip(i: number) { this.chip = Math.max(0, Math.min(CHIP_SIZES.length - 1, i)); this.chipRects.forEach((r, k) => r.setFillStyle(k === this.chip ? PAL.sun0 : PAL.night3)); }
  /** Place one chip of the current size on a spot (number bets use the picked number). Refused when it exceeds the bankroll. */
  bet(kind: RouletteBetKind, number?: number) {
    if (this.busy || this.ended || this.table !== 'roulette') return;
    const amt = CHIP_SIZES[this.chip]; const staked = this.bets.reduce((a, b) => a + b.amount, 0);
    if (staked + amt > this.bank) { this.setMsg('Not enough in the bankroll for that chip.', PAL.pink); this.frame.shake(80, 0.003); return; }
    if (number !== undefined) this.pick = number;
    this.bets.push({ kind, amount: amt, number: kind === 'number' ? this.pick : undefined }); this.refreshBets();
  }
  private openGrid() {
    if (this.busy || this.ended) return;
    const objs: Phaser.GameObjects.GameObject[] = []; const bg = this.add.rectangle(W / 2, H / 2, W, H, PAL.night0, 0.8).setDepth(30).setInteractive(); objs.push(bg);
    objs.push(panel(this, 14, 150, W - 28, 330, PAL.night2).setDepth(31)); objs.push(txt(this, W / 2, 168, 'PICK A NUMBER', 10, PAL.sun2, { align: 'center' }).setOrigin(0.5).setDepth(32));
    const close = () => objs.forEach(o => o.destroy());
    for (let n = 0; n <= 36; n++) { const col = n === 0 ? 3 : (n - 1) % 6, row = n === 0 ? 0 : 1 + Math.floor((n - 1) / 6); const x = 42 + col * 46, y = 200 + row * 40; const c = pocketColor(n);
      const r = this.add.rectangle(x, y, 42, 36, c === 'green' ? PAL.grass1 : c === 'red' ? PAL.red : PAL.ink).setDepth(32).setStrokeStyle(2, PAL.gray0).setInteractive({ useHandCursor: true }); objs.push(r);
      objs.push(txt(this, x, y, String(n), 10, PAL.white, { align: 'center' }).setOrigin(0.5).setDepth(33));
      r.on('pointerdown', () => { close(); this.bet('number', n); this.relabelNumber(); }); }
    bg.once('pointerdown', close);
  }
  private relabelNumber() { const l = this.layer.list.find(o => (o as any).text?.startsWith?.('NUMBER ')) as Label | undefined; l?.setText(`NUMBER ${this.pick}  ·  35:1`); }
  /** Spin the wheel with the current bets; settles the round. */
  spin() {
    if (this.busy || this.ended || this.table !== 'roulette') return;
    if (!this.bets.length) { this.setMsg('Put a chip down first.', PAL.pink); return; }
    this.busy = true; const staked = this.bets.reduce((a, b) => a + b.amount, 0); this.bank -= staked; this.refreshBank();
    const idx = spinWheel(this.rng); const n = WHEEL[idx]; const step = (Math.PI * 2) / WHEEL.length;
    const cx = 100, cy = 176, R = 70; const turns = 3; const target = -(idx + 0.5) * step;   // wheel rotates so pocket idx ends at angle 0 (3 o'clock); ball settles there
    const a0 = this.wheelA; const ballTurns = 5; const b0 = this.ballA;
    this.tweens.addCounter({ from: 0, to: 1, duration: 2200, ease: 'Cubic.Out', onUpdate: tw => { const t = tw.getValue() ?? 0; if (t < 0.9) Audio.playSfx('wheel', 140 + t * 400); this.wheelA = a0 + t * (turns * Math.PI * 2 + ((target - a0) % (Math.PI * 2))); this.ballA = b0 - t * ballTurns * Math.PI * 2 * 1.0 + t * ((0 - b0) % (Math.PI * 2)); if (t > 0.98) this.ballA = 0; this.drawWheel(cx, cy, R); },
      onComplete: () => { this.wheelA = target; this.ballA = 0; this.drawWheel(cx, cy, R); this.settleRoulette(n, staked); } });
    this.setMsg('No more bets.');
  }
  private settleRoulette(n: number, staked: number) {
    const net = rouletteNet(this.bets, n); const back = net + staked; this.bank += back; this.history.push(n); this.lastLbl?.setText('last: ' + this.history.slice(-8).join('  '));
    const c = pocketColor(n); const name = `${n} ${c.toUpperCase()}`;
    if (net > 0) { Audio.playSfx(net >= 500 ? 'jackpot' : 'cash'); this.setMsg(`${name}. You win $${net}.`, PAL.neon); this.frame.flash(PAL.sun2, 60); }
    else if (net === 0) this.setMsg(`${name}. Push.`); else { Audio.playSfx('cancel'); this.setMsg(`${name}. The house takes $${-net}.`, PAL.pink); this.frame.shake(120, 0.004); }
    this.bets = []; this.refreshBets(); this.endRound();
  }

  // ---------- slots ----------
  private buildSymbols() {
    const M = { r: PAL.red, g: PAL.grass1, p: PAL.pink, w: PAL.white, k: PAL.ink, y: PAL.sun2, b: PAL.earth1, c: PAL.gray2, o: PAL.sun0 };
    pixTexture(this, 'cs_cherry', ['......gg', '.....gg.', '....g...', '...g.g..', '..rr.rr.', '.rrrrrrr', '.rwrrrwr', '..rr.rr.'], M, 4);
    pixTexture(this, 'cs_uni', ['....y...', '...pp...', '..pppp..', '.pwpppp.', '.pppppp.', '..p..p..', '..p..p..', '........'], M, 4);
    pixTexture(this, 'cs_seven', ['rrrrrrr.', 'rrrrrrr.', '.....rr.', '....rr..', '...rr...', '..rr....', '..rr....', '........'], M, 4);
    pixTexture(this, 'cs_bar', ['........', 'kkkkkkkk', 'kyyyyyyk', 'kykyykyk', 'kykyykyk', 'kyyyyyyk', 'kkkkkkkk', '........'], M, 4);
    pixTexture(this, 'cs_coffee', ['..c..c..', '.c..c...', 'wwwwww..', 'wbbbbwww', 'wbbbbw.w', 'wbbbbwww', '.wwww...', '........'], M, 4);
  }
  private buildSlots() {
    this.L(panel(this, 30, 100, W - 60, 190, PAL.dusk1, PAL.dusk3, PAL.ink)); this.L(txt(this, W / 2, 116, 'NOMAD SLOTS', 12, PAL.sun2, { align: 'center' }).setOrigin(0.5));
    this.reelImgs = [0, 1, 2].map(r => {
      const x = 90 + r * 90; this.L(panel(this, x - 36, 134, 72, 120, PAL.night0, PAL.gray0, PAL.ink));
      const mask = this.make.graphics({}).fillStyle(0xffffff).fillRect(x - 34, 136, 68, 116); const gm = mask.createGeometryMask();
      return [-1, 0, 1].map(k => { const img = this.L(new Phaser.GameObjects.Image(this, x, 194 + k * 48, 'cs_' + REEL[(this.reelPos[r] + k + REEL.length) % REEL.length])); img.setMask(gm); return img; });
    });
    this.L(this.add_rect(W / 2, 194, W - 72, 2, PAL.sun2).setStrokeStyle(0));
    PAYTABLE_LINES.forEach((line, i) => this.L(txt(this, W / 2, 255 + i * 11, line, 8, PAL.sun3, { align: 'center' }).setOrigin(0.5)));
    const pull = this.L(this.add_rect(W / 2, 336, 200, 48, PAL.sun0)); pull.setInteractive({ useHandCursor: true }); pull.on('pointerdown', () => this.pull());
    this.L(txt(this, W / 2, 336, `PULL  $${PULL_COST}`, 14, PAL.white, { align: 'center' }).setOrigin(0.5));
  }
  private setReel(r: number, pos: number) { this.reelPos[r] = ((pos % REEL.length) + REEL.length) % REEL.length; this.reelImgs[r]?.forEach((img, i) => img.setTexture('cs_' + REEL[(this.reelPos[r] + (i - 1) + REEL.length) % REEL.length])); }
  /** One pull of the slots. */
  pull() {
    if (this.busy || this.ended || this.table !== 'slots') return;
    if (this.bank < PULL_COST) { this.setMsg('Not enough for a pull.', PAL.pink); return; }
    this.busy = true; this.bank -= PULL_COST; this.refreshBank(); this.setMsg('...');
    const stops = pullReels(this.rng); let done = 0;
    stops.forEach((stop, r) => {
      const from = this.reelPos[r]; const spins = REEL.length * (2 + r) + ((stop - from + REEL.length) % REEL.length);
      this.tweens.addCounter({ from: 0, to: spins, duration: 900 + r * 350, ease: 'Cubic.Out', onUpdate: tw => this.setReel(r, from + Math.floor(tw.getValue() ?? 0)), onComplete: () => { this.setReel(r, stop); if (++done === 3) this.settleSlots(stops.map(s => REEL[s]) as [Symbol, Symbol, Symbol]); } });
    });
  }
  private settleSlots(syms: [Symbol, Symbol, Symbol]) {
    const back = slotReturn(syms); this.bank += back; const net = back - PULL_COST;
    if (back > PULL_COST) { Audio.playSfx(back >= PULL_COST * 15 ? 'jackpot' : 'cash'); this.setMsg(`${syms.map(s => s.toUpperCase()).join(' · ')}  ·  +$${net}`, PAL.neon); this.frame.flash(PAL.sun2, 60); this.frame.shake(100, 0.003); }
    else if (back === PULL_COST) this.setMsg('Two cherries. Stake back.'); else this.setMsg(`${syms.map(s => s.toUpperCase()).join(' · ')}. Nothing.`, PAL.gray1);
    this.endRound();
  }

  // ---------- session ----------
  private endRound() {
    this.rounds += 1; this.busy = false; this.refreshBank();
    if (this.bank <= 0) { this.finishSession('bust'); return; }
    if (this.rounds >= MAX_ROUNDS) { this.finishSession('closing'); return; }
    if (this.table === 'roulette' && this.bank < CHIP_SIZES[0]) { this.finishSession('bust'); return; }
  }
  /** Leave the table with what you have. */
  walkAway() { if (this.busy || this.ended) return; this.finishSession('walk'); }
  private finishSession(why: 'bust' | 'closing' | 'walk') {
    if (this.ended) return; this.ended = true; const net = this.bank - this.start;
    this.frame.resultExtra = { money: net };
    const line = why === 'bust' ? 'Bust. The floor manager is very kind about it.' : why === 'closing' ? 'Twelve rounds. The dealer taps the table.' : net >= 0 ? 'You walk away up. Almost nobody does.' : 'You walk away. Wise.';
    this.setMsg(line, why === 'bust' ? PAL.pink : PAL.gray2);
    this.time.delayedCall(900, () => this.frame.finish(scoreFor(net), why === 'bust'));
  }
}
