import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
const PICK = ['title','action','tetris','mexico','europe','coffee','indoor','drone','water','loseSting'];   /* whatever selection.json picks for each */
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--no-sandbox','--autoplay-policy=no-user-gesture-required'], protocolTimeout: 600000 });
const p = await b.newPage(); await p.setViewport({ width: 360, height: 640 });
const errs=[]; p.on('pageerror',e=>errs.push(String(e).slice(0,140)));
await p.goto('http://localhost:4173/trail/',{waitUntil:'networkidle0'}); await new Promise(r=>setTimeout(r,2500));
await p.mouse.click(180,300); await new Promise(r=>setTimeout(r,400));
const gain = Number(process.argv[2] || 1);
await p.evaluate((g) => { const A=window.__nomad.audio; A.init(); if(A.muted)A.setMuted(false);
  A.musicGain.gain.cancelScheduledValues(A.ctx.currentTime); A.musicGain.gain.value=g;
  window.__an=A.ctx.createAnalyser(); window.__an.fftSize=2048; A.musicGain.connect(window.__an); window.__g=g; }, gain);
const out=[];
for (const slot of PICK) {
  const r = await p.evaluate(async ({slot}) => {
    const A=window.__nomad.audio, an=window.__an, buf=new Float32Array(an.fftSize);
    const picked = A.selection.music[slot];
    const c = window.__nomad.music.candidates[slot].find(x=>x.id===picked) || window.__nomad.music.candidates[slot][0];
    const sting = slot.endsWith('Sting');
    A.playLoop('none'); await new Promise(r=>setTimeout(r, sting?450:800));
    A.selection.music[slot]=c.id; A.loop='none';
    A.musicGain.gain.cancelScheduledValues(A.ctx.currentTime); A.musicGain.gain.value=window.__g;
    A.playLoop(slot); await new Promise(r=>setTimeout(r, sting?800:1800));
    let peak=0,sum=0,n=0; const t0=performance.now(); const win = sting?1400:3000;
    while(performance.now()-t0<win){ an.getFloatTimeDomainData(buf); for(let i=0;i<buf.length;i++){const v=Math.abs(buf[i]); if(v>peak)peak=v; sum+=buf[i]*buf[i]; n++;} await new Promise(r=>setTimeout(r,16)); }
    A.musicGain.gain.value=window.__g;
    return { id:c.id, kind:c.kind, gain:c.gain ?? null, rms:20*Math.log10(Math.sqrt(sum/n)||1e-9), peak:20*Math.log10(peak||1e-9) };
  }, {slot});
  out.push({slot,...r}); console.log(`${slot.padEnd(10)} ${r.kind.padEnd(8)} ${String(r.id).padEnd(40)} rms ${r.rms.toFixed(1).padStart(7)}  peak ${r.peak.toFixed(1).padStart(7)}${r.gain?`  gain ${r.gain}x`:''}`);
}
const v=out.map(o=>o.rms); console.log('spread', (Math.max(...v)-Math.min(...v)).toFixed(1), 'dB   worst peak', Math.max(...out.map(o=>o.peak)).toFixed(1), 'dBFS   bus gain', gain);
console.log('errors', errs.length?errs.join(' | '):'none');
fs.writeFileSync('/tmp/check_music.json', JSON.stringify(out,null,1));
await b.close();
