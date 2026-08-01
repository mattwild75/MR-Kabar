const path = require("path");
const { pathToFileURL } = require("url");
const { chromium } = require(path.join("c:/Users/Nurhikmat Muhammad/Herd/mrkabar",
  "node_modules", "playwright"));

const OUT = path.join(__dirname, "gambar");
const ID = ["peta", "kode", "jenjang", "sebab", "respons", "unsur", "siklus", "lapor"];

(async () => {
  const b = await chromium.launch();
  const c = await b.newContext({ viewport: { width: 1560, height: 900 }, deviceScaleFactor: 2 });
  const p = await c.newPage();
  await p.goto(pathToFileURL(path.join(OUT, "ilustrasi2.html")).href);
  await p.waitForTimeout(800);
  for (const id of ID) {
    const el = await p.$("#" + id);
    if (!el) { console.log("  TIDAK ADA: " + id); continue; }
    await el.screenshot({ path: path.join(OUT, id + ".png") });
    const bb = await el.boundingBox();
    console.log(`  ${id}.png  ${Math.round(bb.width)}x${Math.round(bb.height)}`);
  }
  await b.close();
})();
