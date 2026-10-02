// The thing waiting at the end of the course. One boss per region, picked from the city: the gull over North America,
// the kaiju in Japan and Korea, a dragon over Europe and the Himalaya, the feathered serpent over Latin America, the
// jackal-headed god over Africa. The course stops when it arrives: the drone holds its x and climbs or sinks as usual,
// fires forward as usual, and has to put the boss down while dodging what it throws.
//
// Each boss is the same machine with different numbers and art: it moves on a pattern, winds up a telegraphed attack,
// then throws projectiles the drone must be somewhere else for. Hits land when a camera shot touches the body box.
import Phaser from 'phaser';
import { PAL } from '../../core/palette';
import type { City } from '../../core/types';
import type { SetId } from './sets';

export type BossKind = 'gull' | 'kaiju' | 'dragon' | 'quetzal' | 'anubis';
/** flier: a long low swoop · beam: a charged horizontal blast · spit: an arc of projectiles · summon: homing minions */
export type AttackKind = 'swoop' | 'beam' | 'spit' | 'summon';

export interface BossDef {
  kind: BossKind; name: string; blurb: string;
  hp: number;                 // at level 1; the scene scales by level
  bodyW: number; bodyH: number;
  speed: number;              // vertical drift, px/s
  attacks: AttackKind[];
  cadence: number;            // seconds between attacks at level 1
  tint: number;               // the colour its projectiles and health bar take
  muzzle: number;             // where its mouth (or staff) sits relative to the body centre: a beam leaves from here
}

export const BOSSES: Record<BossKind, BossDef> = {
  gull:    { kind: 'gull',    name: 'THE GULL',            blurb: 'It has seen your sandwich.',                  hp: 14, bodyW: 86, bodyH: 46, speed: 54, attacks: ['swoop', 'spit'],            cadence: 2.5, tint: PAL.white, muzzle: -8 },
  kaiju:   { kind: 'kaiju',   name: 'THE THING IN THE BAY', blurb: 'Tokyo has an evacuation plan for this.',      hp: 18, bodyW: 92, bodyH: 120, speed: 26, attacks: ['beam', 'spit'],            cadence: 2.9, tint: PAL.neon, muzzle: -30 },
  dragon:  { kind: 'dragon',  name: 'THE WYRM',            blurb: 'Older than the cathedral it sleeps on.',      hp: 16, bodyW: 96, bodyH: 54, speed: 62, attacks: ['spit', 'swoop'],            cadence: 2.4, tint: PAL.sun0, muzzle: -4 },
  quetzal: { kind: 'quetzal', name: 'QUETZALCOATL',        blurb: 'The feathered serpent is awake, and curious.', hp: 16, bodyW: 104, bodyH: 48, speed: 70, attacks: ['spit', 'summon'],          cadence: 2.3, tint: PAL.grass2, muzzle: 2 },
  anubis:  { kind: 'anubis',  name: 'ANUBIS',              blurb: 'He weighs your heart against a feather.',     hp: 17, bodyW: 76, bodyH: 108, speed: 34, attacks: ['summon', 'beam'],          cadence: 2.6, tint: PAL.sun2, muzzle: -62 },
};

/** Which boss a city answers to. Region first (that is what Cody asked for); the landscape only breaks ties. */
export function pickBoss(city: Partial<City> | undefined | null, set: SetId): BossKind {
  switch (city?.region) {
    case 'northamerica': return 'gull';
    case 'mexico': case 'southamerica': return 'quetzal';
    case 'europe': case 'alps': return 'dragon';
    case 'africa': return 'anubis';
    case 'asia': return 'kaiju';
    case 'himalaya': return 'dragon';
    default: return set === 'jungle' ? 'quetzal' : set === 'desert' ? 'anubis' : 'gull';
  }
}

/** Dragons differ by where you meet them: scales, fire and a name of their own. */
export interface DragonSkin { name: string; body: number; belly: number; fire: number; }
export function dragonSkin(set: SetId, region?: string): DragonSkin {
  if (region === 'himalaya' || set === 'ice' || set === 'mountain') return { name: 'THE FROST WYRM', body: PAL.sky2, belly: PAL.white, fire: PAL.sky3 };
  if (set === 'city') return { name: 'THE CATHEDRAL WYRM', body: PAL.gray1, belly: PAL.sky3, fire: PAL.pink };   /* gargoyle stone: the night-blue version vanished into a dusk sky */
  if (set === 'jungle') return { name: 'THE GREEN WYRM', body: PAL.grass0, belly: PAL.grass2, fire: PAL.grass3 };
  return { name: 'THE RED WYRM', body: PAL.red, belly: PAL.sun2, fire: PAL.sun0 };
}

/** How hard a summoned minion can turn, in degrees a second. At 90 it simply caught you; this is a lazy arc that
 *  rewards changing height and punishes holding still. */
export const HOMING_DEG = 32;
/** How fast a boss may swing its body onto a shot, px a second. A proportional lerp covered a full-screen gap in one
 *  lurch; a speed cap makes it lean into the aim instead. */
export const AIM_PXS = 150;
const toward = (v: number, want: number, step: number) => v + Math.sign(want - v) * Math.min(Math.abs(want - v), step);
export interface Proj { x: number; y: number; vx: number; vy: number; r: number; kind: 'shard' | 'fire' | 'beam' | 'minion'; t: number; alive: boolean; homing?: number; }

export interface BossState {
  def: BossDef; hp: number; maxHp: number; x: number; y: number; t: number;
  /** -1 up, 1 down */ dir: number;
  /** seconds until the next attack */ next: number;
  /** >0 while winding up; the attack fires at 0 */ windup: number;
  pending?: AttackKind;
  /** set while a beam is actually firing, counts down */ beam: number;
  beamY: number;
  hurt: number;                 // flash timer
  /** the gull swings round to aim its tail at you before a volley, and stays that way while it is dropping */
  turn: number;
  entering: boolean;
}

export function makeBoss(kind: BossKind, level: number, difficulty: number): BossState {
  const def = BOSSES[kind];
  const hp = Math.round(def.hp * (0.8 + 0.25 * level) * (0.9 + 0.2 * difficulty));
  return { def, hp, maxHp: hp, x: 430, y: 240, t: 0, dir: 1, next: 1.6, windup: 0, beam: 0, beamY: 240, hurt: 0, turn: 0, entering: true };
}

/** The body box, in screen space. */
export function bossBox(b: BossState): Phaser.Geom.Rectangle {
  const d = b.def; return new Phaser.Geom.Rectangle(b.x - d.bodyW / 2, b.y - d.bodyH / 2, d.bodyW, d.bodyH);
}

/** One frame of boss behaviour. Returns the projectiles it threw this frame (the scene owns the list). */
export function stepBoss(b: BossState, dt: number, droneX: number, droneY: number, level: number, hard: number): Proj[] {
  const out: Proj[] = []; const d = b.def; b.t += dt; if (b.hurt > 0) b.hurt -= dt; if (b.turn > 0) b.turn -= dt;
  const homeX = 430 - 150;                                   // where it settles after flying in from off screen
  if (b.entering) { b.x += (homeX - b.x) * Math.min(1, 2.4 * dt); if (Math.abs(b.x - homeX) < 2) { b.x = homeX; b.entering = false; } }

  // movement, per boss
  const top = 70, bot = 430;
  switch (d.kind) {
    case 'gull': case 'dragon':
      b.y += d.speed * b.dir * dt; if (b.y < top) { b.y = top; b.dir = 1; } if (b.y > bot) { b.y = bot; b.dir = -1; }
      if (!b.entering) b.x = homeX + Math.sin(b.t * 0.9) * 26;
      break;
    case 'quetzal':
      b.y = 250 + Math.sin(b.t * 1.1) * 150; if (!b.entering) b.x = homeX + Math.cos(b.t * 0.7) * 34;
      break;
    case 'kaiju':
      b.y = 418 + Math.sin(b.t * 0.8) * 16;   /* feet on the rooftops: it wades, it does not fly */ if (!b.entering) b.x = homeX + Math.sin(b.t * 0.5) * 10;
      break;
    case 'anubis':
      b.y = 250 + Math.sin(b.t * 0.6) * 90; if (!b.entering) b.x = homeX + Math.sin(b.t * 0.45) * 18;
      break;
  }
  if (b.entering) return out;

  // the beam, once it is out, sweeps gently toward the drone so standing still is not safe
  if (b.beam > 0) {
    b.beam -= dt; b.beamY += Math.sign(droneY - b.beamY) * Math.min(26 * dt, Math.abs(droneY - b.beamY));
    b.y = toward(b.y, Math.max(top, Math.min(bot, b.beamY - d.muzzle)), AIM_PXS * dt);   /* follow the sweep at a walking pace, never snap to it */
    return out; }

  // attack clock: a telegraphed wind-up, then the attack itself
  if (b.windup > 0) {
    b.windup -= dt;
    /* aim during the wind-up, not at the moment of firing: the warning line used to sit at the drone's height while the
       beam came out of a mouth that had not moved there yet, so it fired from somewhere other than where it threatened */
    if (b.pending === 'beam') b.y = toward(b.y, Math.max(top, Math.min(bot, b.beamY - d.muzzle)), AIM_PXS * dt);
    if (b.windup <= 0) {
      const kind = b.pending ?? 'spit'; b.pending = undefined;
      const speed = 150 + 18 * level + 20 * hard;
      if (kind === 'beam') b.beam = 0.85 + 0.1 * level;   /* fire where the wind-up aimed: re-reading the drone's position here made the body jump to meet it */
      else if (kind === 'swoop') { b.dir = Math.sign(droneY - b.y) || 1; b.y += b.dir * 6; out.push(...spread(b, droneX, droneY, 1, speed * 1.2, 'shard')); }
      else if (kind === 'spit') { if (d.kind === 'gull') b.turn = 0.8; out.push(...spread(b, droneX, droneY, d.kind === 'dragon' ? 3 : 4, speed, d.kind === 'dragon' ? 'fire' : 'shard')); }
      else out.push(...spread(b, droneX, droneY, 2, speed * 0.75, 'minion', HOMING_DEG));
      b.next = Math.max(1.1, d.cadence - 0.25 * level - 0.2 * hard) * (0.85 + Math.random() * 0.3);
    }
    return out;
  }
  b.next -= dt;
  if (b.next <= 0) { b.pending = d.attacks[Math.floor(Math.random() * d.attacks.length)]; b.windup = b.pending === 'beam' ? 0.9 : 0.55; if (b.pending === 'beam') b.beamY = droneY; }
  return out;
}

/** A fan of projectiles aimed at the drone. */
function spread(b: BossState, dx: number, dy: number, n: number, speed: number, kind: Proj['kind'], homing = 0): Proj[] {
  const out: Proj[] = []; const base = Math.atan2(dy - b.y, dx - b.x);
  for (let i = 0; i < n; i++) {
    const a = base + (i - (n - 1) / 2) * 0.22;
    out.push({ x: b.x - b.def.bodyW / 2, y: b.y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, r: kind === 'minion' ? 7 : 6, kind, t: 0, alive: true, homing });
  }
  return out;
}

/** Move the things it threw. Minions steer, everything else flies straight. */
export function stepProj(p: Proj, dt: number, droneX: number, droneY: number) {
  p.t += dt;
  if (p.homing) { const a = Math.atan2(droneY - p.y, droneX - p.x); const sp = Math.hypot(p.vx, p.vy); const cur = Math.atan2(p.vy, p.vx);
    let diff = a - cur; while (diff > Math.PI) diff -= Math.PI * 2; while (diff < -Math.PI) diff += Math.PI * 2;
    const turn = Math.sign(diff) * Math.min(Math.abs(diff), (p.homing * Math.PI / 180) * dt);
    p.vx = Math.cos(cur + turn) * sp; p.vy = Math.sin(cur + turn) * sp; }
  p.x += p.vx * dt; p.y += p.vy * dt;
  if (p.x < -40 || p.x > 420 || p.y < -40 || p.y > 680) p.alive = false;
}

type G = Phaser.GameObjects.Graphics;

/** The boss itself. `skin` only matters to the dragon; the rest carry their own colours. */
export function drawBoss(g: G, b: BossState, skin: DragonSkin, t: number) {
  const x = Math.round(b.x), y = Math.round(b.y), flash = b.hurt > 0 && Math.floor(b.hurt * 24) % 2 === 0;
  const wing = Math.sin(t * 5) * 10, charging = b.windup > 0;
  switch (b.def.kind) {
    case 'gull': {
      /* it faces the drone, which is off to the left — until it is about to drop something, when it swings its tail round */
      const away = b.turn > 0 || (b.windup > 0 && b.pending === 'spit');
      const f = away ? 1 : -1;                                   // f = -1 points the head left, at the drone
      const X = (dx: number) => x + dx * f;
      g.fillStyle(PAL.gray2).fillTriangle(X(4), y - 4, X(-44), y - 12 - wing, X(-10), y + 6);       // far wing
      g.fillStyle(flash ? PAL.white : PAL.gray1).fillEllipse(x, y, 62, 30);                         // body
      g.fillStyle(PAL.white).fillEllipse(X(-4), y + 2, 52, 20);
      g.fillStyle(PAL.gray2).fillTriangle(X(2), y - 2, X(10), y + 26, X(-26), y + 10);              // tail
      g.fillStyle(flash ? PAL.red : PAL.white).fillEllipse(X(26), y - 10, 28, 24);                  // head
      g.fillStyle(PAL.sun1).fillTriangle(X(38), y - 12, X(38), y - 4, X(58), y - 7);                // beak
      g.fillStyle(PAL.ink).fillRect(X(28) - 2, y - 16, 4, 4);
      g.fillStyle(PAL.white).fillTriangle(X(4), y - 6, X(-40), y - 20 + wing, X(-6), y + 2);        // near wing
      g.fillStyle(PAL.gray1).fillTriangle(X(-10), y - 12 + wing * 0.6, X(-40), y - 20 + wing, X(-14), y - 4);
      break; }
    case 'kaiju': {
      /* built on one grid so the pieces meet: torso x±24 / y-26..+54, head on top of it and offset toward the
         drone, arms off the shoulders, legs under the hips, tail and plates off the back edge at x+24 */
      const c = flash ? PAL.white : PAL.grass0, dark = flash ? PAL.gray2 : PAL.grass2, O = PAL.ink;
      const TOP = y - 26, BOT = y + 54, LX = x - 24, RX = x + 24;
      // tail: three tapering blocks off the lower back
      for (let i = 0; i < 3; i++) { const tw = 16 - i * 4, tx = RX + i * 13, ty = y + 34 + i * 7;
        g.fillStyle(O).fillRect(tx - 1, ty - 1, 15, tw + 2); g.fillStyle(dark).fillRect(tx, ty, 14, tw); }
      // far leg and far arm first, a shade darker so the near ones read in front
      g.fillStyle(O).fillRect(x + 3, BOT - 1, 20, 30); g.fillStyle(dark).fillRect(x + 4, BOT, 18, 28);
      g.fillStyle(O).fillRect(RX - 7, TOP + 6, 14, 38); g.fillStyle(dark).fillRect(RX - 6, TOP + 7, 12, 36);
      // dorsal plates down the back edge
      g.fillStyle(dark); for (let i = 0; i < 5; i++) g.fillTriangle(RX - 2, TOP + 2 + i * 16, RX - 2, TOP + 15 + i * 16, RX + 13, TOP + 8 + i * 16);
      // torso
      g.fillStyle(O).fillRect(LX - 1, TOP - 1, 50, BOT - TOP + 2); g.fillStyle(c).fillRect(LX, TOP, 48, BOT - TOP);
      g.fillStyle(PAL.grass1).fillRect(LX + 7, TOP + 14, 34, 50);                                   // belly
      for (let i = 0; i < 4; i++) g.fillStyle(PAL.gray2, 0.8).fillRect(LX + 7, TOP + 20 + i * 12, 34, 3);
      // near leg and near arm
      g.fillStyle(O).fillRect(LX + 1, BOT - 1, 20, 30); g.fillStyle(c).fillRect(LX + 2, BOT, 18, 28);
      g.fillStyle(O).fillRect(LX - 13, TOP + 10, 14, 40); g.fillStyle(c).fillRect(LX - 12, TOP + 11, 12, 38);
      g.fillStyle(O).fillRect(LX - 14, TOP + 44, 14, 7);                                            // claw
      // head: sits on the torso, pushed toward the drone, with a snout and a mouth that lights while charging
      const hx = x - 8, hy = TOP - 18;
      g.fillStyle(O).fillRect(hx - 21, hy - 17, 44, 36); g.fillStyle(c).fillRect(hx - 20, hy - 16, 42, 34);
      g.fillStyle(O).fillRect(hx - 34, hy - 4, 16, 18); g.fillStyle(c).fillRect(hx - 33, hy - 3, 14, 16);   // snout
      g.fillStyle(charging ? PAL.neon : PAL.ink).fillRect(hx - 34, hy + 5, 30, 7);                   // mouth line
      g.fillStyle(PAL.sun2).fillRect(hx - 14, hy - 8, 7, 6); g.fillStyle(O).fillRect(hx - 12, hy - 6, 3, 3);   // eye
      g.fillStyle(dark).fillTriangle(hx + 4, hy - 17, hx + 10, hy - 28, hx + 16, hy - 16);           // brow spike
      if (charging) g.fillStyle(PAL.neon, 0.45 + 0.45 * Math.sin(t * 30)).fillCircle(hx - 36, hy + 8, 9 + 5 * Math.sin(t * 20));
      break; }
    case 'dragon': {
      const body = flash ? PAL.white : skin.body, belly = flash ? PAL.white : skin.belly;
      /* read it right to left: tail, haunch, body, long neck, head. Everything is outlined in ink so it holds against a dusk sky. */
      const O = PAL.ink;
      for (let i = 6; i >= 0; i--) { const sx = x + 26 + i * 12, sy = y + 10 + Math.sin(t * 3 + i * 0.6) * 9 + i * 2, r = 13 - i * 1.6;
        g.fillStyle(O).fillCircle(sx, sy, r + 1.5); g.fillStyle(i % 2 ? body : belly).fillCircle(sx, sy, r); }
      g.fillStyle(O).fillTriangle(x + 96, y + 22, x + 120, y + 6, x + 118, y + 34);                    // tail fin
      g.fillStyle(belly).fillTriangle(x + 98, y + 22, x + 116, y + 10, x + 114, y + 31);
      g.fillStyle(O).fillEllipse(x + 2, y + 2, 76, 50); g.fillStyle(body).fillEllipse(x + 2, y + 2, 70, 44);   // body
      g.fillStyle(belly).fillEllipse(x + 2, y + 13, 54, 18);
      // neck and head, reaching left toward the drone
      g.fillStyle(O); for (let i = 0; i < 5; i++) g.fillCircle(x - 14 - i * 9, y - 6 - i * 3, 13 - i);
      g.fillStyle(body); for (let i = 0; i < 5; i++) g.fillCircle(x - 14 - i * 9, y - 6 - i * 3, 11 - i);
      const hx = x - 58, hy = y - 18;
      g.fillStyle(O).fillEllipse(hx, hy, 40, 26); g.fillStyle(body).fillEllipse(hx, hy, 35, 21);
      g.fillStyle(O).fillTriangle(hx - 14, hy - 6, hx - 34, hy + 1, hx - 13, hy + 8);                   // snout
      g.fillStyle(belly).fillTriangle(hx - 14, hy - 4, hx - 30, hy + 1, hx - 13, hy + 6);
      g.fillStyle(O).fillTriangle(hx + 2, hy - 12, hx + 8, hy - 30, hy > 0 ? hx + 14 : hx + 14, hy - 10)      // horns
             .fillTriangle(hx - 8, hy - 11, hx - 6, hy - 26, hx + 2, hy - 10);
      g.fillStyle(PAL.sun2).fillRect(hx - 8, hy - 6, 6, 5); g.fillStyle(PAL.ink).fillRect(hx - 6, hy - 5, 3, 3);   // eye
      g.fillStyle(skin.fire, charging ? 0.9 : 0.35).fillCircle(hx - 30, hy + 2, charging ? 7 + 5 * Math.sin(t * 24) : 3);
      /* the wing goes on last and reaches up off the shoulder: drawn before the neck it was simply covered by it */
      const tipX = x + 30, tipY = y - 56 - wing * 1.4;
      g.fillStyle(O).fillTriangle(x - 4, y - 14, tipX + 3, tipY - 4, x + 34, y + 2);
      g.fillStyle(body).fillTriangle(x - 2, y - 15, tipX, tipY, x + 30, y - 1);
      g.fillStyle(belly, 0.85).fillTriangle(x - 1, y - 15, tipX - 6, tipY + 8, x + 24, y - 3);
      g.lineStyle(1, O, 0.9).lineBetween(x - 2, y - 15, tipX, tipY).lineBetween(x - 2, y - 15, tipX - 9, tipY + 20).lineBetween(x - 2, y - 15, x + 30, y - 1);
      g.fillStyle(O).fillCircle(tipX, tipY, 3);                                                        // the claw at the wing tip
      break; }
    case 'quetzal': {
      const body = flash ? PAL.white : PAL.grass1;
      for (let i = 9; i >= 0; i--) {                                                                   // the serpent, head last
        const sx = x + 22 + i * 10, sy = y + Math.sin(t * 2.4 + i * 0.55) * 16;
        g.fillStyle(i % 2 ? body : PAL.grass0).fillCircle(sx, sy, 12 - i * 0.7);
        g.fillStyle(PAL.sun1, 0.8).fillTriangle(sx - 2, sy - 10 + i * 0.6, sx + 6, sy - 20 + i, sx + 6, sy - 8 + i * 0.5);   // feathers along the spine
      }
      g.fillStyle(PAL.ink).fillEllipse(x, y, 50, 32); g.fillStyle(body).fillEllipse(x, y, 44, 26);
      g.fillStyle(PAL.sun1); for (let i = 0; i < 5; i++) g.fillTriangle(x - 4 + i * 4, y - 16, x - 18 + i * 6, y - 38 - (i % 2) * 6, x + 2 + i * 4, y - 14);   // head plume
      g.fillStyle(PAL.sky2); for (let i = 0; i < 3; i++) g.fillTriangle(x - 2 + i * 5, y - 14, x - 12 + i * 7, y - 32, x + 3 + i * 5, y - 12);
      g.fillStyle(body).fillEllipse(x - 24, y + 2, 30, 24);                                            // head
      g.fillStyle(PAL.sun3).fillRect(x - 32, y - 4, 5, 5); g.fillStyle(PAL.ink).fillRect(x - 31, y - 3, 3, 3);
      g.fillStyle(PAL.red).fillTriangle(x - 38, y + 8, x - 52, y + 10 + Math.sin(t * 9) * 3, x - 38, y + 12);   // tongue
      break; }
    case 'anubis': {
      const skinC = flash ? PAL.white : PAL.ink;
      g.fillStyle(PAL.sun2).fillRect(x + 26, y - 56, 5, 108);                                          // staff
      g.fillStyle(PAL.sun1).fillRect(x + 20, y - 68, 17, 8).fillRect(x + 20, y - 68, 5, 16).fillRect(x + 32, y - 68, 5, 16);
      if (charging) g.fillStyle(PAL.sun2, 0.5 + 0.5 * Math.sin(t * 26)).fillCircle(x + 28, y - 64, 10 + 5 * Math.sin(t * 18));
      g.fillStyle(PAL.ink).fillRect(x - 20, y - 16, 40, 62);                                           // torso
      g.fillStyle(PAL.sun2).fillRect(x - 22, y - 16, 44, 12);                                          // collar
      g.fillStyle(PAL.sky2).fillRect(x - 18, y - 14, 6, 8).fillRect(x - 3, y - 14, 6, 8).fillRect(x + 12, y - 14, 6, 8);
      g.fillStyle(PAL.sun1).fillRect(x - 18, y + 4, 36, 4).fillRect(x - 18, y + 26, 36, 4);            // linen bands
      g.fillStyle(PAL.night3).fillRect(x - 27, y - 7, 12, 42).fillRect(x + 15, y - 7, 12, 42); g.fillStyle(PAL.ink).fillRect(x - 26, y - 6, 10, 40).fillRect(x + 16, y - 6, 10, 40);   // arms, edged so they read against the torso
      g.fillStyle(PAL.ink).fillRect(x - 16, y + 46, 12, 28).fillRect(x + 4, y + 46, 12, 28);           // legs
      g.fillStyle(skinC).fillRect(x - 15, y - 48, 30, 32);                                             // jackal head
      g.fillStyle(skinC).fillTriangle(x - 15, y - 48, x - 19, y - 78, x - 3, y - 50).fillTriangle(x + 15, y - 48, x + 19, y - 78, x + 3, y - 50);   // ears
      g.fillStyle(PAL.sun2).fillTriangle(x - 13, y - 52, x - 16, y - 70, x - 6, y - 52).fillTriangle(x + 13, y - 52, x + 16, y - 70, x + 6, y - 52);
      g.fillStyle(skinC).fillRect(x - 30, y - 34, 18, 11);                                             // snout
      g.fillStyle(PAL.sun3).fillRect(x - 10, y - 42, 5, 5);
      g.fillStyle(PAL.ink).fillRect(x - 32, y - 31, 5, 4);
      break; }
  }
}

/** Where a beam actually leaves the body. */
export const beamLineY = (b: BossState) => b.y + b.def.muzzle;
/** The beam and the line that warns about it. */
export function drawBossBeam(g: G, b: BossState, skin: DragonSkin, t: number, screenW: number) {
  const col = b.def.kind === 'dragon' ? skin.fire : b.def.tint; const my = beamLineY(b);
  if (b.windup > 0 && b.pending === 'beam') { const a = 0.25 + 0.45 * Math.abs(Math.sin(t * 18)); g.fillStyle(col, a).fillRect(0, my - 2, b.x, 4); return; }   /* the warning line is drawn from the mouth, which is already swinging onto the shot */
  if (b.beam <= 0) return;
  const h = 16 + Math.sin(t * 40) * 3;
  g.fillStyle(col, 0.35).fillRect(0, my - h, b.x, h * 2);
  g.fillStyle(col, 0.9).fillRect(0, my - h / 2, b.x, h);
  g.fillStyle(PAL.white, 0.9).fillRect(0, my - 3, b.x, 6);
  g.fillStyle(PAL.white, 0.7).fillCircle(b.x - b.def.bodyW / 2, my, 10 + Math.sin(t * 30) * 3);
}

/** Everything it has thrown. */
export function drawProj(g: G, p: Proj, tint: number, t: number) {
  if (p.kind === 'fire') { g.fillStyle(PAL.sun0, 0.9).fillCircle(p.x, p.y, p.r + 2 + Math.sin(t * 20) * 1.5); g.fillStyle(PAL.sun2).fillCircle(p.x, p.y, p.r - 1); g.fillStyle(PAL.white, 0.8).fillCircle(p.x + 1, p.y - 1, 2); }
  else if (p.kind === 'minion') { const f = Math.sin(t * 16) * 4; g.fillStyle(PAL.ink).fillEllipse(p.x, p.y, 14, 10); g.fillStyle(tint).fillEllipse(p.x - 3, p.y, 7, 7); g.fillStyle(PAL.gray2).fillTriangle(p.x, p.y - 2, p.x + 10, p.y - 6 - f, p.x + 2, p.y + 2).fillTriangle(p.x, p.y + 2, p.x + 10, p.y + 6 + f, p.x + 2, p.y - 2); }
  else { g.fillStyle(tint, 0.4).fillCircle(p.x, p.y, p.r + 3); g.fillStyle(tint).fillCircle(p.x, p.y, p.r); g.fillStyle(PAL.white, 0.85).fillCircle(p.x - 1, p.y - 1, p.r * 0.4); }
}
