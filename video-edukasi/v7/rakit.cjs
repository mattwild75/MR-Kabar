// Rakit animation.html (mesin + timeline), potret frame uji, lembar tokoh,
// atau ekspor isyarat bunyi.
//   node rakit.cjs uji 12.5 30 61.2     -> uji/t_<detik>.jpg (+ galat konsol)
//   node rakit.cjs lembar               -> uji/lembar_tokoh.png
//   node rakit.cjs isyarat              -> sfx.json
const fs = require('fs');
const path = require('path');
const { chromium } = require(path.join(__dirname, '..', '..', 'node_modules', 'playwright'));

const MESIN = path.join(__dirname, 'mesin');
const URUT = ['dasar.js', 'tokoh.js', 'set.js', 'set_tambahan.js'];

function rakitHtml(mode) {
  const adegan = fs.readdirSync(MESIN).filter((f) => /^adegan_.*\.js$/.test(f)).sort();
  const skrip = [...URUT, ...adegan, 'film.js'].map((f) => `// ── ${f}\n` + fs.readFileSync(path.join(MESIN, f), 'utf8')).join('\n');
  const tl = fs.readFileSync(path.join(__dirname, 'timeline.json'), 'utf8');
  const kredit = fs.readFileSync(path.join(__dirname, 'aset', 'foto', 'kredit.json'), 'utf8');
  const html = fs.readFileSync(path.join(MESIN, 'template.html'), 'utf8')
    .replace('__TL__', () => tl).replace('__KREDIT__', () => kredit).replace('__MODE__', mode).replace('__SKRIP__', () => skrip);
  const keluar = path.join(__dirname, mode === 'lembar' ? 'lembar.html' : 'animation.html');
  fs.writeFileSync(keluar, html);
  return keluar;
}
module.exports = { rakitHtml };

if (require.main === module) {
  (async () => {
    const mode = process.argv[2] || 'uji';
    const berkas = rakitHtml(mode === 'lembar' ? 'lembar' : 'film');
    const b = await chromium.launch();
    const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
    const galat = [];
    p.on('pageerror', (e) => galat.push(String(e)));
    p.on('console', (m) => { if (m.type() === 'error') galat.push(m.text()); });
    await p.goto('file:///' + berkas.split(path.sep).join('/'));
    await p.evaluate(() => document.fonts.ready);
    await p.evaluate(() => Promise.all([...document.images].map((im) => (im.complete ? 0 : new Promise((r) => { im.onload = im.onerror = r; })))));
    await p.waitForTimeout(600);
    if (!(await p.evaluate(() => typeof window.setVideoTime === 'function'))) { console.log('GAGAL MUAT: ' + galat.join(' | ')); await b.close(); process.exit(1); }
    fs.mkdirSync(path.join(__dirname, 'uji'), { recursive: true });
    if (mode === 'lembar') {
      await p.evaluate(() => window.setVideoTime(0));
      await p.screenshot({ path: path.join(__dirname, 'uji', 'lembar_tokoh.png') });
    } else if (mode === 'asap') {
      const total = JSON.parse(fs.readFileSync(path.join(__dirname, 'timeline.json'), 'utf8')).total_duration;
      const t0 = Date.now();
      for (let t = 0; t < total; t += 0.5) { await p.evaluate((tt) => window.setVideoTime(tt), t); if (galat.length) { console.log('galat pada t=' + t); break; } }
      console.log(`asap: ${Math.round(total / 0.5)} titik dalam ${((Date.now() - t0) / 1000).toFixed(0)} dtk`);
    } else if (mode === 'isyarat') {
      const isy = await p.evaluate(() => ({ sfx: window.SFX, suasana: window.SUASANA, musik: window.MUSIK }));
      fs.writeFileSync(path.join(__dirname, 'isyarat.json'), JSON.stringify(isy));
      console.log(`isyarat: ${isy.sfx.length} bunyi, ${isy.suasana.length} suasana, ${isy.musik.length} musik`);
    } else {
      for (const t of process.argv.slice(3).map(Number)) {
        const t0 = Date.now();
        await p.evaluate((tt) => window.setVideoTime(tt), t);
        await p.screenshot({ path: path.join(__dirname, 'uji', `t_${t.toFixed(2).padStart(7, '0')}.jpg`), type: 'jpeg', quality: 82 });
        console.log(`t=${t} ${Date.now() - t0} ms`);
      }
    }
    console.log('galat:', galat.length ? galat.join('\n') : 'tidak ada');
    await b.close();
  })().catch((e) => { console.error(e); process.exit(1); });
}
