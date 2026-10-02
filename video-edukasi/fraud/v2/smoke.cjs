// Ambil frame contoh dari animation.html untuk diperiksa mata.
//   node smoke.cjs 12 15.5 60 ...     -> smoke/f_<detik>.jpg
//   node smoke.cjs kontak 5 ...       -> lembar kontak setiap N detik
const fs = require('fs');
const path = require('path');
const { chromium } = require(path.join(__dirname, '..', '..', '..', 'node_modules', 'playwright'));

(async () => {
  const arg = process.argv.slice(2);
  const out = path.join(__dirname, 'smoke');
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  const galat = [];
  p.on('pageerror', (e) => galat.push(String(e)));
  p.on('console', (m) => { if (m.type() === 'error') galat.push(m.text()); });
  await p.goto('file:///' + path.join(__dirname, 'animation.html').replace(/\\/g, '/'));
  await p.waitForTimeout(1500);
  const peringatan = await p.evaluate(() => window.__peringatan);
  if (peringatan && peringatan.length) console.log('PERINGATAN:\n  ' + peringatan.join('\n  '));
  let waktu = arg.map(Number);
  if (arg[0] === 'kontak') {
    const tl = JSON.parse(fs.readFileSync(path.join(__dirname, 'timeline.json'), 'utf-8'));
    const step = Number(arg[1] || 6);
    waktu = [];
    for (let t = Number(arg[2] || 0); t < Number(arg[3] || tl.total_duration); t += step) waktu.push(+t.toFixed(2));
  }
  for (const t of waktu) {
    await p.evaluate((tt) => window.setVideoTime(tt), t);
    await p.waitForTimeout(60);
    await p.screenshot({ path: path.join(out, `f_${String(t).padStart(7, '0')}.jpg`), type: 'jpeg', quality: 80 });
  }
  if (galat.length) console.log('GALAT:\n  ' + galat.join('\n  '));
  console.log('selesai', waktu.length, 'frame');
  await b.close();
})();
