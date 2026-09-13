// Cetak kotak-batas tiap item yang terlihat pada detik tertentu.
// Dipakai untuk menyetel ulang tata letak tanpa menebak: `cek_tumpang.cjs`
// hanya bilang ADA yang beririsan, berkas ini yang menunjukkan di mana.
const path = require("path");
const { chromium } = require(path.join(__dirname, "..", "..", "node_modules", "playwright"));

(async () => {
  const detik = process.argv.slice(2).map(Number);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto("file:///" + path.join(__dirname, "animation.html").replace(/\\/g, "/"));
  await p.waitForTimeout(400);

  for (const t of detik) {
    await p.evaluate((tt) => window.setVideoTime(tt), t);
    const items = await p.evaluate(() => {
      const sc = [...document.querySelectorAll(".scene")].find(
        (s) => s.style.display !== "none" && Number(s.style.opacity) > 0.5);
      if (!sc) return { id: "-", list: [] };
      return {
        id: sc.id,
        list: [...sc.children].filter((el) => Number(el.style.opacity) > 0.35).map((el) => {
          const r = el.getBoundingClientRect();
          return {
            teks: (el.innerText || "").replace(/\s+/g, " ").trim().slice(0, 44),
            l: Math.round(r.left), t: Math.round(r.top),
            r: Math.round(r.right), b: Math.round(r.bottom),
          };
        }).filter((o) => o.teks),
      };
    });
    console.log(`\n=== t=${t}s  scene ${items.id} ===`);
    for (const o of items.list) {
      console.log(`  x ${String(o.l).padStart(5)}..${String(o.r).padStart(5)}   y ${String(o.t).padStart(4)}..${String(o.b).padStart(4)}   ${o.teks}`);
    }
  }
  await b.close();
})();
