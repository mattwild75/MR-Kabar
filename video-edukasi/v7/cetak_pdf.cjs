// Cetak HTML papan cerita ke PDF A4 lewat Chromium (Playwright dari node_modules repo).
//   node cetak_pdf.cjs papan_cerita.html "<keluaran.pdf>"
const path = require('path');
const { chromium } = require(path.join(__dirname, '..', '..', 'node_modules', 'playwright'));

(async () => {
  const [masuk, keluar] = process.argv.slice(2);
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('file:///' + path.resolve(__dirname, masuk).split(path.sep).join('/'));
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => Promise.all([...document.images].map((im) => (im.complete ? 0 : new Promise((r) => { im.onload = im.onerror = r; })))));
  const rusak = await page.evaluate(() => [...document.images].filter((im) => !im.naturalWidth).map((im) => im.src));
  if (rusak.length) console.log('Gambar gagal dimuat:', rusak);
  await page.pdf({
    path: keluar,
    format: 'A4',
    printBackground: true,
    margin: { top: '16mm', bottom: '17mm', left: '15mm', right: '15mm' },
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: '<div style="width:100%;font-size:7px;color:#8a8f99;padding:0 15mm;display:flex;justify-content:space-between;font-family:Arial,sans-serif">' +
      '<span>Berlayar dengan Peta Risiko v7 · Naskah dan Papan Cerita · untuk disetujui</span>' +
      '<span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>',
  });
  await browser.close();
  console.log('PDF:', keluar);
})().catch((e) => { console.error(e); process.exit(1); });
