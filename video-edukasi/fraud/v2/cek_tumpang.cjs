// Periksa teks yang saling menimpa: tiap DT detik, kumpulkan kotak elemen teks
// yang tampak (opasitas > AMBANG) lalu laporkan pasangan yang beririsan.
//   node cek_tumpang.cjs [dt=0.5] [ambang=0.6]
const path = require('path');
const { chromium } = require(path.join(__dirname, '..', '..', '..', 'node_modules', 'playwright'));
const fs = require('fs');

(async () => {
  const dt = Number(process.argv[2] || 0.5), ambang = Number(process.argv[3] || 0.6);
  const tl = JSON.parse(fs.readFileSync(path.join(__dirname, 'timeline.json'), 'utf-8'));
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('file:///' + path.join(__dirname, 'animation.html').replace(/\\/g, '/'));
  await p.waitForTimeout(1500);
  const temuan = new Map();
  for (let t = 0; t < tl.total_duration; t += dt) {
    const hasil = await p.evaluate(([tt, amb]) => {
      window.setVideoTime(tt);
      const kotak = [];
      for (const el of document.querySelectorAll('#ui > .it')) {
        if (el.style.display === 'none') continue;
        if (el.tagName.toLowerCase() === 'svg') continue;
        if (el.classList.contains('laptop') || el.classList.contains('ponsel') || el.classList.contains('kredit') || el.classList.contains('kertas')) continue;
        if (!el.textContent.trim()) continue;
        if ((+getComputedStyle(el).opacity) < amb) continue;
        // kotak isi sebenarnya (bukan kotak lebar penuh): gabungan kotak anak teks
        const r = document.createRange();
        r.selectNodeContents(el);
        const rs = [...r.getClientRects()].filter((x) => x.width > 2 && x.height > 2);
        if (!rs.length) continue;
        const k = { x0: Math.min(...rs.map((x) => x.left)), y0: Math.min(...rs.map((x) => x.top)), x1: Math.max(...rs.map((x) => x.right)), y1: Math.max(...rs.map((x) => x.bottom)) };
        kotak.push({ k, t: el.textContent.trim().replace(/\s+/g, ' ').slice(0, 40) });
      }
      const tabrak = [];
      for (let i = 0; i < kotak.length; i++) for (let j = i + 1; j < kotak.length; j++) {
        const a = kotak[i].k, c = kotak[j].k;
        const w = Math.min(a.x1, c.x1) - Math.max(a.x0, c.x0), h = Math.min(a.y1, c.y1) - Math.max(a.y0, c.y0);
        if (w > 12 && h > 8) tabrak.push(`${kotak[i].t}  <>  ${kotak[j].t}`);
      }
      return tabrak;
    }, [t, ambang]);
    for (const h of hasil) if (!temuan.has(h)) temuan.set(h, +t.toFixed(1));
  }
  await b.close();
  if (!temuan.size) console.log('tidak ada tumpang-tindih');
  for (const [h, t] of [...temuan.entries()].sort((a, c) => a[1] - c[1])) console.log(`${t.toFixed(1).padStart(6)}  ${h}`);
})();
