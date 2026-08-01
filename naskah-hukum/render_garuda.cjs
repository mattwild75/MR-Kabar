// Render lambang negara menjadi berkas gambar hitam-putih beresolusi tinggi.
// Peraturan perundang-undangan memakai lambang negara tanpa warna, jadi
// berkas vektor berwarna dari sumbernya disaring menjadi abu-abu.
//
// Halaman perantaranya ditulis ke folder yang sama dengan berkas SVG lalu
// dibuka lewat goto(), bukan setContent(): halaman about:blank tidak boleh
// memuat berkas file:// sehingga gambarnya gagal termuat.
const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");
const { chromium } = require(path.join("c:/Users/Nurhikmat Muhammad/Herd/mrkabar",
  "node_modules", "playwright"));

const OUT = path.join(__dirname, "gambar");
const HTML = path.join(OUT, "garuda.html");

fs.writeFileSync(HTML, `<!doctype html><html><head><meta charset="utf-8"><style>
  html,body{margin:0;padding:0;background:#fff}
  #w{width:700px;height:760px;display:flex;align-items:center;justify-content:center}
  img{width:660px;height:auto;filter:grayscale(1) contrast(1.08) brightness(0.97)}
</style></head><body><div id="w"><img id="g" src="garuda.svg"></div></body></html>`, "utf-8");

(async () => {
  const b = await chromium.launch();
  const c = await b.newContext({ viewport: { width: 700, height: 760 }, deviceScaleFactor: 4 });
  const p = await c.newPage();
  await p.goto(pathToFileURL(HTML).href);
  await p.waitForFunction(() => {
    const g = document.getElementById("g");
    return g && g.complete && g.naturalWidth > 0;
  }, null, { timeout: 20000 });
  await p.waitForTimeout(600);
  const el = await p.$("#w");
  await el.screenshot({ path: path.join(OUT, "garuda.png") });
  const dim = await p.evaluate(() => {
    const g = document.getElementById("g");
    return `${g.naturalWidth}x${g.naturalHeight}`;
  });
  console.log(`  SVG termuat (${dim}) -> garuda.png 700x760 @4x`);
  await b.close();
})();
