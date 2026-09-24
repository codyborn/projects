// End-of-run share card: 1080x1920 PNG rendered at 1/4 scale then upscaled crisp.
import QRCode from 'qrcode';
import type { RunState, City, Settings } from '../core/types';
import { CONTINENT_OF } from '../core/types';
import { PAL, hex } from '../core/palette';
import { makeCanvas, ditherGradient, R, P, glyph, rng, Ctx } from '../art/pixel';
import { renderGlobe } from '../art/globe';
import { drawStampGlyph } from '../art/sprites';

// 5x7 glyphs reused from font.ts would create a Phaser dependency; keep a compact text drawer here.
import { FONT_CHARS } from '../art/font';
const GLYPHS: Record<string, string[]> = (() => { const m: Record<string, string[]> = {}; return m; })();
function text(ctx: Ctx, s: string, x: number, y: number, c: number, scale = 1, font?: Record<string, string[]>) {
  const f = font || GLYPHS; let cx = x;
  for (const ch of s.toUpperCase()) { const pat = f[ch] || f['?'] || ['11111', '10001', '10001', '10001', '11111', '00000', '00000']; glyph(ctx, pat, cx, y, c, scale); cx += 6 * scale; }
}
export function setShareFont(f: Record<string, string[]>) { Object.assign(GLYPHS, f); }
const ENDING_TEXT: Record<string, string> = { win: 'MADE IT HOME', hospital: 'CAUSE OF DEATH: HOSPITAL', flewhome: 'FLEW HOME EARLY', outofdays: 'RAN OUT OF DAYS', broke: 'CAUSE OF DEATH: THE CARD DECLINED', quit: 'QUIT. ORANGE COUNTY IS NICE.' };
/** Word-wrap to `cols` characters, at most `max` lines (last line gets an ellipsis). */
function wrapLines(s: string, cols: number, max: number): string[] {
  const out: string[] = []; let line = '';
  for (const w of s.split(/\s+/)) { if (!w) continue; if ((line + ' ' + w).trim().length > cols) { if (line) out.push(line); line = w; if (out.length === max) break; } else line = (line + ' ' + w).trim(); }
  if (out.length < max && line) out.push(line);
  if (out.length > max) out.length = max;
  const joined = out.join(' ').length; if (joined < s.trim().length && out.length) { const l = out[out.length - 1]; out[out.length - 1] = (l.length > cols - 1 ? l.slice(0, cols - 1) : l) + '…'; }
  return out;
}
function causeOf(state: RunState): string {
  if (state.ending?.cause) return state.ending.cause;
  if (state.ending?.kind === 'win') return `${state.visited.length} cities, ${state.day} days, home in one piece.`;
  if (state.ending?.kind === 'broke') return `The card declined in ${state.cityId.replace(/^./, c => c.toUpperCase())}, day ${state.day}. Emergency flight home.`;
  const last = [...state.log].reverse().find(l => /hospital|fever|burn|back|poison|otter|cancel|mosquito|delayed|wheel|mood|energy/i.test(l.text)) ?? state.log[state.log.length - 1];
  return last ? last.text : state.ending?.text ?? '';
}

export async function renderShareCard(state: RunState, cities: City[], settings?: Settings): Promise<HTMLCanvasElement> {
  const W = 270, H = 480; // x4 = 1080x1920
  const small = makeCanvas(W, H, ctx => {
    ditherGradient(ctx, 0, 0, W, H, [PAL.night0, PAL.night1, PAL.dusk0, PAL.night1]);
    const r = rng(state.seed || 1); for (let i = 0; i < 120; i++) P(ctx, r.int(0, W - 1), r.int(0, H - 1), r.chance(0.3) ? PAL.white : PAL.gray1);
    text(ctx, 'THE NOMAD TRAIL', 24, 18, PAL.sun3, 2);
    text(ctx, state.ending?.kind === 'win' ? 'CIRCUMNAVIGATED' : 'DID NOT MAKE IT', 24, 36, state.ending?.kind === 'win' ? PAL.neon : PAL.pink, 1);
    // globe
    const cur = cities.find(c => c.id === state.cityId); const rot = cur ? -cur.lon : 0;
    renderGlobe(ctx, W / 2, 128, 74, cities, state.visited, state.cityId, state.route.length ? state.route : state.visited, { rotation: rot });
    // passport strip
    R(ctx, 16, 212, W - 32, 44, PAL.white); R(ctx, 16, 212, W - 32, 1, PAL.gray2); R(ctx, 16, 255, W - 32, 1, PAL.gray2);
    const vis = state.visited.map(id => cities.find(c => c.id === id)).filter((c): c is City => !!c).slice(-7);
    vis.forEach((c, i) => { const x = 24 + i * 33, y = 220; const gold = state.stamps[c.id] === 'gold'; const col = gold ? PAL.sun1 : [PAL.red, PAL.sky0, PAL.grass1, PAL.dusk2][i % 4];
      for (let a = 0; a < 24; a++) { const ang = a / 24 * Math.PI * 2; P(ctx, x + 14 + Math.cos(ang) * 13, y + 14 + Math.sin(ang) * 13, col); } drawStampGlyph(ctx, c.stampIcon, x + 14, y + 14, col); });
    // stats
    const lines = [`DAY ${state.day} / 365`, `HEALTH ${Math.max(0, Math.round(state.health))}   MOOD ${Math.max(0, Math.round(state.mood))}`, typeof (state as any).money === 'number' ? `${state.visited.length} CITIES   $${Math.max(0, Math.round((state as any).money)).toLocaleString('en-US')} LEFT` : `${state.visited.length} CITIES   ${Object.values(state.stamps).filter(s => s === 'gold').length} GOLD STAMPS`, `${state.lostItems.length} ITEMS LOST   ${state.coffeeMornings} COFFEES`];
    lines.forEach((l, i) => text(ctx, l, 24, 266 + i * 11, PAL.gray2, 1));
    text(ctx, ENDING_TEXT[state.ending?.kind || 'quit'] || '', 24, 314, state.ending?.kind === 'win' ? PAL.sun2 : PAL.red, 1);
    // the reason, two lines max, then score
    wrapLines(causeOf(state), 37, 2).forEach((l, i) => text(ctx, l, 24, 326 + i * 10, PAL.white, 1));
    text(ctx, `SCORE ${state.ending?.score ?? 0}`, 24, 350, PAL.white, 1);
    if (settings?.bestScore) text(ctx, `BEST ${settings.bestScore}`, 110, 350, PAL.gray1, 1);
    // continents: the second goal
    { const visited = new Set(state.visited.map(id => cities.find(c => c.id === id)).filter((c): c is City => !!c).map(c => CONTINENT_OF[c.region] as string));
      const all: [string, string][] = [['North America', 'N.AM'], ['South America', 'S.AM'], ['Europe', 'EUR'], ['Africa', 'AFR'], ['Asia', 'ASIA']];
      let x = 24; all.forEach(([name, short]) => { const lit = visited.has(name); R(ctx, x, 367, 4, 4, lit ? PAL.neon : PAL.gray0); text(ctx, short, x + 6, 366, lit ? PAL.neon : PAL.gray0, 1); x += 6 + short.length * 6 + 6; }); }
    // QR + url
    { const qr = QRCode.create('https://cit.earth/trail', { errorCorrectionLevel: 'L' }); const n = qr.modules.size, m = 2, pad = 3, box = n * m + pad * 2; const qx = W - 16 - box, qy = 392; R(ctx, qx, qy, box, box, PAL.white); for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (qr.modules.get(y, x)) R(ctx, qx + pad + x * m, qy + pad + y * m, m, m, PAL.ink); }
    text(ctx, 'PLAY AT', 24, 398, PAL.gray1, 1); text(ctx, 'CIT.EARTH/TRAIL', 24, 408, PAL.neon, 1); text(ctx, 'PACK LIGHT.', 24, 424, PAL.gray1, 1); text(ctx, 'TRUST NO KETTLE.', 24, 434, PAL.gray1, 1);
  });
  const big = document.createElement('canvas'); big.width = W * 4; big.height = H * 4; const bc = big.getContext('2d')!; bc.imageSmoothingEnabled = false; bc.drawImage(small, 0, 0, big.width, big.height);
  return big;
}
export async function shareOrDownload(canvas: HTMLCanvasElement, filename = 'nomad-trail.png'): Promise<'shared' | 'opened' | 'failed'> {
  const blob: Blob | null = await new Promise(res => canvas.toBlob(res, 'image/png'));
  if (!blob) return 'failed';
  const file = new File([blob], filename, { type: 'image/png' }); const nav = navigator as any;
  if (nav.share && nav.canShare && nav.canShare({ files: [file] })) { try { await nav.share({ files: [file], title: 'The Nomad Trail', text: 'My run on The Nomad Trail. cit.earth/trail' }); return 'shared'; } catch { /* cancelled */ } }
  const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = filename; a.target = '_blank'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 10000); return 'opened';
}
export { FONT_CHARS, hex };
