// Potret beberapa detik contoh dari animation.html + laporkan error konsol.
// Dipakai untuk memeriksa tata letak SEBELUM render 31 ribu frame.
const path = require("path");
const { chromium } = require(path.join(__dirname, "..", "..", "node_modules", "playwright"));

(async () => {
  const htmlUrl = "file:///" + path.join(__dirname, "animation.html").replace(/\\/g, "/");
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  page.on("pageerror", (e) => errors.push(String(e)));

  await page.goto(htmlUrl);
  await page.waitForTimeout(500);

  for (const t of process.argv.slice(2).map(Number)) {
    await page.evaluate((tt) => window.setVideoTime(tt), t);
    await page.screenshot({ path: path.join(__dirname, `sm_${t}.png`) });
  }
  console.log("errors:", errors.length ? errors : "NONE");
  await browser.close();
})();
