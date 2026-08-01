// Render tiap ilustrasi menjadi berkas gambar terpisah lewat Chromium.
const path = require("path");
const { pathToFileURL } = require("url");
const { chromium } = require(path.join("c:/Users/Nurhikmat Muhammad/Herd/mrkabar",
  "node_modules", "playwright"));

const OUT = path.join(__dirname, "gambar");

(async () => {
  const b = await chromium.launch();
  const c = await b.newContext({ viewport: { width: 1560, height: 900 }, deviceScaleFactor: 2 });
  const p = await c.newPage();
  await p.goto(pathToFileURL(path.join(OUT, "ilustrasi.html")).href);
  await p.waitForTimeout(800);
  for (const id of ["matriks", "tahapan", "penilaian", "rtp", "struktur", "spbe"]) {
    const el = await p.$("#" + id);
    if (!el) { console.log("  TIDAK ADA: " + id); continue; }
    await el.screenshot({ path: path.join(OUT, id + ".png") });
    const bb = await el.boundingBox();
    console.log(`  ${id}.png  ${Math.round(bb.width)}x${Math.round(bb.height)}`);
  }
  await b.close();
})();
