// Deteksi otomatis elemen yang TUMPANG TINDIH di sepanjang video.
//
// Dibuat karena memeriksa 23 scene x 1417 detik dengan mata mustahil
// diandalkan: satu salah setel waktu keluar (`out`) langsung membuat dua kotak
// teks saling menimpa dan tidak terbaca. Skrip ini menyusuri seluruh durasi,
// mengambil kotak-batas tiap item yang sedang terlihat, lalu melaporkan
// pasangan yang beririsan cukup besar.
const fs = require("fs");
const path = require("path");
const { chromium } = require(path.join(__dirname, "..", "..", "node_modules", "playwright"));

const LANGKAH = Number(process.argv[2] || 0.5);   // detik antar-pemeriksaan
const AMBANG = Number(process.argv[3] || 0.14);   // rasio irisan yg dianggap masalah

(async () => {
  const timeline = JSON.parse(fs.readFileSync(path.join(__dirname, "timeline.json"), "utf-8"));
  const total = timeline.total_duration;

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto("file:///" + path.join(__dirname, "animation.html").replace(/\\/g, "/"));
  await page.waitForTimeout(500);

  const temuan = new Map();   // kunci unik -> {t, a, b, rasio}

  for (let t = 0; t <= total; t += LANGKAH) {
    await page.evaluate((tt) => window.setVideoTime(tt), t);
    const pasangan = await page.evaluate((ambang) => {
      const scene = [...document.querySelectorAll(".scene")].find(
        (s) => s.style.display !== "none" && Number(s.style.opacity) > 0.5);
      if (!scene) return [];

      const item = [...scene.children]
        .filter((el) => Number(el.style.opacity) > 0.35)
        .map((el) => {
          const r = el.getBoundingClientRect();
          return { el, r, teks: (el.innerText || "").replace(/\s+/g, " ").trim().slice(0, 42) };
        })
        // hanya yang punya isi terlihat & berukuran wajar
        .filter((o) => o.r.width > 12 && o.r.height > 12 && o.teks.length > 0);

      const hasil = [];
      for (let i = 0; i < item.length; i++) {
        for (let j = i + 1; j < item.length; j++) {
          const a = item[i].r, b = item[j].r;
          const w = Math.min(a.right, b.right) - Math.max(a.left, b.left);
          const h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
          if (w <= 0 || h <= 0) continue;
          const irisan = w * h;
          const rasio = irisan / Math.min(a.width * a.height, b.width * b.height);
          if (rasio >= ambang) {
            hasil.push({ a: item[i].teks, b: item[j].teks, rasio: +rasio.toFixed(2) });
          }
        }
      }
      return hasil;
    }, AMBANG);

    for (const p of pasangan) {
      const kunci = [p.a, p.b].sort().join(" >< ");
      if (!temuan.has(kunci)) temuan.set(kunci, { t: +t.toFixed(1), ...p });
    }
  }

  await browser.close();

  const daftar = [...temuan.values()].sort((x, y) => y.rasio - x.rasio);
  console.log(`diperiksa tiap ${LANGKAH} detik sepanjang ${total.toFixed(0)} detik`);
  console.log(`pasangan tumpang tindih (>=${AMBANG * 100}%): ${daftar.length}\n`);
  for (const d of daftar) {
    const m = Math.floor(d.t / 60), s = String(Math.floor(d.t % 60)).padStart(2, "0");
    console.log(`  ${m}:${s}  ${(d.rasio * 100).toFixed(0).padStart(3)}%  "${d.a}"  ><  "${d.b}"`);
  }
})();
