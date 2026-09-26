import Phaser from 'phaser';
import { PAL } from '../core/palette';
import { MINIGAME_KEYS, type MinigameLaunch, type Puzzle } from '../core/types';
import { MinigameFrame, W, H, normalizeLaunch, panel } from './_shared';
import { txt, type Label } from '../ui/theme';
import { drawPuzzleArt } from './work/puzzleArt';
import { SAMPLE_PUZZLE } from './work/sample';

/** A work day is a puzzle (Professor Layton style, themed to a software engineer at Uniswap): read, think, answer.
 *  Payload { puzzle: Puzzle; pay: number; day: number }. No timer. Score 100 = solved first try without the hint (PERFECT),
 *  60 = solved with the hint or on the second try, 0 = wrong twice (FAILED). The explain card holds until a tap, then the
 *  frame's result card holds until CONTINUE.
 *  Harness hooks: answer(indexOrValue), hint(), tapExplain(), frame.ready() / frame.proceed(). */
export class WorkScene extends Phaser.Scene {
  private frame!: MinigameFrame; private launch!: MinigameLaunch; private puzzle!: Puzzle;
  private hinted = false; private wrong = 0; private solved = false; private ended = false;
  private hintObjs: Phaser.GameObjects.GameObject[] = []; private explainTap?: () => void;
  private entry = ''; private display?: Label; private promptLabel?: Label; private scrollY = 0; private scrollMax = 0; private dragY?: number; private dragStart = 0;
  private choiceBtns: { rect: Phaser.GameObjects.Rectangle; label: Label; idx: number }[] = []; private hintBtn?: Phaser.GameObjects.Rectangle; private hintLbl?: Label;
  constructor() { super(MINIGAME_KEYS.work); }
  init(data: any) {
    this.launch = normalizeLaunch(data); const p = this.launch.payload || {};
    this.puzzle = p.puzzle && p.puzzle.prompt ? p.puzzle : SAMPLE_PUZZLE;
    this.hinted = false; this.wrong = 0; this.solved = false; this.ended = false; this.hintObjs = []; this.explainTap = undefined; this.entry = ''; this.scrollY = 0; this.scrollMax = 0; this.dragY = undefined; this.choiceBtns = [];
  }
  create() {
    this.frame = new MinigameFrame(this, this.launch, 'Work week'); this.cameras.main.setBackgroundColor(PAL.night1);
    this.frame.capSec = 100000;   // no clock: a puzzle is for thinking
    this.frame.scoreNow = () => (this.solved ? (this.hinted || this.wrong ? 60 : 100) : 0);
    this.buildPage(); this.frame.hud();
    const pay = Number(this.launch.payload?.pay) || 0;
    const days = Number(this.launch.payload?.days) || 0;
    this.frame.intro('A puzzle before Monday standup. It sets the rate for the whole week.' + (pay ? ` Base pay $${pay} a day${days ? ` for ${days} day${days > 1 ? 's' : ''}` : ''}. Solve it clean: +$100 a day. Use the hint: +$25. Wrong twice: -$75 a day.` : ''), () => { /* the page is already up under the card */ }, { height: 270 });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => { this.hintObjs = []; this.choiceBtns = []; });
  }
  update(_t: number, dt: number) { this.frame.update(dt); }

  // ---------- page ----------
  private buildPage() {
    const pz = this.puzzle;
    // illustration
    panel(this, 20, 30, W - 40, 100, PAL.night2).setDepth(1); drawPuzzleArt(this, 22, 32, W - 44, 96, pz.art).setDepth(2);
    // title
    txt(this, W / 2, 148, pz.title.toUpperCase(), 12, PAL.sun2, { align: 'center', wrap: W - 48 }).setOrigin(0.5).setDepth(3);
    // parchment prompt panel with a masked, draggable text
    const py = 166, ph = 176; panel(this, 20, py, W - 40, ph, PAL.earth3, PAL.sun3, PAL.earth1).setDepth(1);
    const lbl = txt(this, 32, py + 10, pz.prompt, 10, PAL.ink, { align: 'left', wrap: W - 64 }).setOrigin(0, 0).setDepth(3); this.promptLabel = lbl;
    const maskShape = this.make.graphics({}).fillStyle(0xffffff).fillRect(22, py + 4, W - 44, ph - 8); (lbl as any).setMask?.(maskShape.createGeometryMask());
    this.scrollMax = Math.max(0, lbl.height - (ph - 20));
    if (this.scrollMax > 0) txt(this, W - 34, py + ph - 12, 'drag ↓', 8, PAL.earth1, { align: 'right' }).setOrigin(1, 0.5).setDepth(3);
    const zone = this.add.zone(W / 2, py + ph / 2, W - 40, ph).setInteractive().setDepth(4);
    zone.on('pointerdown', (p: Phaser.Input.Pointer) => { this.dragY = p.y; this.dragStart = this.scrollY; });
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => { if (this.dragY === undefined || !p.isDown) return; this.scrollTo(this.dragStart + (this.dragY - p.y)); });
    this.input.on('pointerup', () => { this.dragY = undefined; });
    // answers
    if (pz.kind === 'number') this.buildKeypad(); else this.buildChoices();
    // hint (one per puzzle)
    const hy = 598; this.hintBtn = this.add.rectangle(pz.kind === 'number' ? 100 : W / 2, hy, pz.kind === 'number' ? 150 : 200, 40, PAL.dusk0).setDepth(3).setStrokeStyle(2, PAL.ink).setInteractive({ useHandCursor: true });
    this.hintLbl = txt(this, this.hintBtn.x, hy, 'HINT', 12, PAL.sun3, { align: 'center' }).setOrigin(0.5).setDepth(4);
    this.hintBtn.on('pointerdown', () => this.hint());
  }
  private scrollTo(v: number) { this.scrollY = Phaser.Math.Clamp(v, 0, this.scrollMax); if (this.promptLabel) this.promptLabel.y = 176 - this.scrollY; }
  private buildChoices() {
    const ch = this.puzzle.choices ?? []; const top = 350, gap = 56;   // 50 px buttons: a long choice wraps to three lines
    ch.slice(0, 4).forEach((c, i) => {
      const y = top + i * gap + 25;
      const r = this.add.rectangle(W / 2, y, W - 40, 50, PAL.night3).setDepth(3).setStrokeStyle(2, PAL.ink).setInteractive({ useHandCursor: true });
      const l = txt(this, W / 2, y, `${'ABCD'[i]}.  ${c}`, 10, PAL.white, { align: 'center', wrap: W - 64 }).setOrigin(0.5).setDepth(4);
      r.on('pointerdown', () => this.answer(i)); r.on('pointerover', () => r.setFillStyle(PAL.dusk0)); r.on('pointerout', () => r.setFillStyle(PAL.night3));
      this.choiceBtns.push({ rect: r, label: l, idx: i });
    });
  }
  private buildKeypad() {
    panel(this, 20, 352, W - 40, 36, PAL.night0, PAL.gray0, PAL.ink).setDepth(3);
    this.display = txt(this, W - 32, 370, '_', 14, PAL.neon, { align: 'right' }).setOrigin(1, 0.5).setDepth(4);
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'DEL']; const kw = 100, kh = 40, x0 = 70, y0 = 416;
    keys.forEach((k, i) => {
      const x = x0 + (i % 3) * (kw + 10), y = y0 + Math.floor(i / 3) * (kh + 4);
      const r = this.add.rectangle(x, y, kw, kh, PAL.night3).setDepth(3).setStrokeStyle(2, PAL.ink).setInteractive({ useHandCursor: true });
      txt(this, x, y, k, k === 'DEL' ? 10 : 14, k === 'DEL' ? PAL.sun1 : PAL.white, { align: 'center' }).setOrigin(0.5).setDepth(4);
      r.on('pointerdown', () => this.key(k));
    });
    const enter = this.add.rectangle(260, 598, 150, 40, PAL.sun0).setDepth(3).setStrokeStyle(2, PAL.ink).setInteractive({ useHandCursor: true });
    txt(this, 260, 598, 'ENTER', 12, PAL.white, { align: 'center' }).setOrigin(0.5).setDepth(4);
    enter.on('pointerdown', () => this.submitNumber());
    this.input.keyboard?.on('keydown', (e: KeyboardEvent) => { if (!this.frame.active || this.ended) return; if (/^[0-9.]$/.test(e.key)) this.key(e.key); else if (e.key === 'Backspace') this.key('DEL'); else if (e.key === 'Enter') this.submitNumber(); });
  }
  private key(k: string) {
    if (!this.frame.active || this.ended) return;
    if (k === 'DEL') this.entry = this.entry.slice(0, -1); else if (this.entry.length < 12 && !(k === '.' && this.entry.includes('.'))) this.entry += k;
    this.display?.setText(this.entry || '_');
  }
  private submitNumber() { if (!this.frame.active || this.ended || !this.entry) return; this.answer(Number(this.entry)); }

  // ---------- play ----------
  /** Show the one hint in a speech bubble; marks the attempt as hinted (max score 60). */
  hint() {
    if (!this.frame.active || this.ended || this.hinted) return; this.hinted = true;
    this.hintBtn?.setFillStyle(PAL.night2).setAlpha(0.6); this.hintLbl?.setAlpha(0.5);
    const y = 240; const objs: Phaser.GameObjects.GameObject[] = [];
    objs.push(this.add.rectangle(W / 2, H / 2, W, H, PAL.night0, 0.55).setDepth(20).setInteractive());
    objs.push(panel(this, 30, y - 60, W - 60, 130, PAL.white, PAL.white, PAL.gray1).setDepth(21));
    const tri = this.add.graphics().setDepth(21); tri.fillStyle(PAL.white).fillTriangle(60, y + 69, 84, y + 69, 62, y + 86); objs.push(tri);
    objs.push(txt(this, 44, y - 48, 'HINT', 9, PAL.dusk2, { align: 'left' }).setOrigin(0, 0).setDepth(22));
    objs.push(txt(this, 44, y - 30, this.puzzle.hint, 10, PAL.ink, { align: 'left', wrap: W - 88 }).setOrigin(0, 0).setDepth(22));
    objs.push(txt(this, W / 2, y + 56, 'tap to close', 8, PAL.gray1, { align: 'center' }).setOrigin(0.5).setDepth(22));
    this.hintObjs = objs; const close = () => { objs.forEach(o => o.destroy()); this.hintObjs = []; };
    (objs[0] as Phaser.GameObjects.Rectangle).once('pointerdown', close);
  }
  /** Submit an answer: the choice index (kind 'choice') or the number (kind 'number'). */
  answer(v: number) {
    if (!this.frame.active || this.ended || this.hintObjs.length) return;
    const pz = this.puzzle; const ok = pz.kind === 'number' ? Math.round(v * 100) === Math.round(pz.answer * 100) : v === pz.answer;
    if (ok) { this.solved = true; this.frame.flash(PAL.neon, 60); this.choiceBtns.forEach(b => { if (b.idx === v) b.rect.setFillStyle(PAL.sea1); }); this.time.delayedCall(350, () => this.explain(true)); return; }
    this.wrong += 1; this.frame.shake(160, 0.006);
    if (pz.kind === 'choice') { const b = this.choiceBtns.find(c => c.idx === v); if (b) { b.rect.setFillStyle(PAL.gray0).disableInteractive(); b.label.setAlpha(0.45); } }
    else { this.entry = ''; this.display?.setText('_'); }
    if (this.wrong >= 2) { this.time.delayedCall(400, () => this.explain(false)); return; }
    const t = txt(this, W / 2, 338, 'Not quite. One more try.', 10, PAL.pink, { align: 'center' }).setOrigin(0.5).setDepth(30);
    this.tweens.add({ targets: t, alpha: 0, delay: 1300, duration: 400, onComplete: () => t.destroy() });
  }
  /** The explanation card (SOLVED / NOT TODAY), held until a tap; then the frame's result card. */
  private explain(solved: boolean) {
    if (this.ended) return; this.ended = true; this.frame.pauseCap();
    const score = solved ? (this.hinted || this.wrong ? 60 : 100) : 0;
    const objs: Phaser.GameObjects.GameObject[] = [];
    const bg = this.add.rectangle(W / 2, H / 2, W, H, PAL.night0, 0.8).setDepth(40).setInteractive(); objs.push(bg);
    // size the card to its text: heading + score line (+ answer line when failed) + explanation + the tap hint
    const body = txt(this, 40, 0, this.puzzle.explain, 10, PAL.ink, { align: 'left', wrap: W - 80 }).setOrigin(0, 0).setDepth(42); objs.push(body);
    const bodyTop = solved ? 76 : 96; const ph = Math.min(H - 60, bodyTop + body.height + 48); const top = Math.round(H / 2 - ph / 2);
    body.setPosition(40, top + bodyTop);
    objs.push(panel(this, 24, top, W - 48, ph, PAL.earth3, PAL.sun3, PAL.earth1).setDepth(41));
    const head = txt(this, W / 2, top + 28, solved ? 'SOLVED' : 'NOT TODAY', 18, solved ? PAL.grass0 : PAL.red, { align: 'center' }).setOrigin(0.5).setDepth(42); objs.push(head);
    this.tweens.add({ targets: head, scale: { from: 1.5, to: 1 }, duration: 260, ease: 'Back.Out' });
    objs.push(txt(this, W / 2, top + 52, solved ? `${score} picarats${this.hinted ? ' · hint used' : this.wrong ? ' · second try' : ' · first try'}` : 'the answer was waiting for you', 9, PAL.earth1, { align: 'center' }).setOrigin(0.5).setDepth(42));
    if (!solved) { const pz = this.puzzle; objs.push(txt(this, W / 2, top + 72, `Answer: ${pz.kind === 'number' ? pz.answer : (pz.choices ?? [])[pz.answer] ?? ''}`, 10, PAL.dusk1, { align: 'center', wrap: W - 80 }).setOrigin(0.5).setDepth(42)); }
    const tap = txt(this, W / 2, top + ph - 22, 'tap to continue', 9, PAL.earth1, { align: 'center' }).setOrigin(0.5).setDepth(42); objs.push(tap);
    this.tweens.add({ targets: tap, alpha: 0.3, yoyo: true, repeat: -1, duration: 600 });
    let fired = false; const go = () => { if (fired) return; fired = true; this.explainTap = undefined; objs.forEach(o => o.destroy()); this.frame.finish(score, !solved); };
    this.explainTap = go; this.time.delayedCall(250, () => { if (!fired) { bg.once('pointerdown', go); this.input.keyboard?.once('keydown-SPACE', go); this.input.keyboard?.once('keydown-ENTER', go); } });
  }
  /** Harness: dismiss the explain card. */
  tapExplain() { this.explainTap?.(); }
}
