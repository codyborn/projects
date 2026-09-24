import { playRun, type PackStyle } from './policy';
const N = Number(process.argv[2] ?? 200);
function batch(style: PackStyle, n = N) {
  const outs = Array.from({ length: n }, (_, i) => playRun(1000 + i * 7919, style));
  const wins = outs.filter(o => o.ending === 'win').length;
  const causes: Record<string, number> = {}; const hist = new Array(8).fill(0); const evs: Record<string, number> = {};
  for (const o of outs) { causes[o.ending] = (causes[o.ending] ?? 0) + 1; if (o.ending !== 'win') hist[Math.min(7, Math.floor(o.day / 50))]++; for (const [k, v] of Object.entries(o.events)) evs[k] = (evs[k] ?? 0) + v; }
  const mean = outs.reduce((a, o) => a + o.day, 0) / n; const conts = outs.reduce((a, o) => a + o.continents, 0) / n; const five = outs.filter(o => o.continents === 5).length;
  console.log(`\n== ${style} pack, ${n} runs ==`);
  console.log(`win ${wins} (${Math.round(100 * wins / n)}%)  fail ${n - wins} (${Math.round(100 * (n - wins) / n)}%)  mean end day ${mean.toFixed(0)}  mean cities ${(outs.reduce((a, o) => a + o.cities, 0) / n).toFixed(1)}  mean continents ${conts.toFixed(1)}  all five: ${five}`);
  console.log('causes', causes);
  console.log('failure day histogram (50-day bins):', hist.map((v, i) => `${i * 50}-${i * 50 + 49}:${v}`).join('  '));
  const top = Object.entries(evs).sort((a, b) => b[1] - a[1]).slice(0, 14).map(([k, v]) => `${k}:${(v / n).toFixed(2)}`).join('  ');
  console.log('events per run:', top);
  return { fail: (n - wins) / n, hist, mid: (hist[4] + hist[5]) / Math.max(1, n - wins) };
}
const r = batch('random'); batch('heavy', Math.round(N / 2)); const s = batch('smart', Math.round(N / 2));
console.log(`\nTARGET: random-pack failure 35-45% -> ${(r.fail * 100).toFixed(0)}% ${r.fail >= 0.35 && r.fail <= 0.45 ? 'OK' : 'OFF'}; smart win >70% -> ${((1 - s.fail) * 100).toFixed(0)}% ${1 - s.fail > 0.7 ? 'OK' : 'OFF'}; share of failures in days 200-299: ${(r.mid * 100).toFixed(0)}%`);
