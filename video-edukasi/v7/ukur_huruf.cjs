// Ukur lebar tiap huruf Bebas Neue (em) supaya judul berhuruf guntingan rapat.
const fs = require('fs');
const path = require('path');
const { chromium } = require(path.join(__dirname, '..', '..', 'node_modules', 'playwright'));
(async () => {
  const html = path.join(__dirname, 'uji', 'ukur.html');
  fs.writeFileSync(html, '<style>@font-face{font-family:Bebas;src:url("../aset/fonts/BebasNeue-Regular.ttf")}</style><canvas id=c></canvas>');
  const b = await chromium.launch(); const p = await b.newPage();
  await p.goto('file:///' + html.split(path.sep).join('/'));
  const hasil = await p.evaluate(async () => {
    await document.fonts.load('100px Bebas');
    const g = document.getElementById('c').getContext('2d'); g.font = '100px Bebas';
    const o = {};
    for (const c of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .,:-!?&') o[c] = +(g.measureText(c).width / 100).toFixed(3);
    return o;
  });
  console.log(JSON.stringify(hasil));
  await b.close();
})();
