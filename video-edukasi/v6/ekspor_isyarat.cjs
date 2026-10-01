// Ekspor isyarat bunyi (window.SFX) dan sampel suasana dunia dari animation.html.
const fs = require('fs');
const path = require('path');
const { chromium } = require(path.join(__dirname, '..', '..', 'node_modules', 'playwright'));
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto('file:///' + path.join(__dirname, 'animation.html').split(path.sep).join('/'));
  await p.waitForTimeout(800);
  const data = await p.evaluate(() => ({ sfx: window.SFX, suasana: window.sampelSuasana(0.1) }));
  fs.writeFileSync(path.join(__dirname, 'isyarat.json'), JSON.stringify(data));
  const hit = {};
  data.sfx.forEach((x) => (hit[x.nama] = (hit[x.nama] || 0) + 1));
  console.log('isyarat:', data.sfx.length, JSON.stringify(hit));
  await b.close();
})();
