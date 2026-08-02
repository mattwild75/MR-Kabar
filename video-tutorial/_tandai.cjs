// Menandai versi lewat halaman Backup — jalur resmi proyek ini, karena ia
// memasangkan tag git dengan snapshot database dalam satu kunci operasi.
const puppeteer = require('puppeteer');
const kredensial = require('./sandi.cjs');
const tidur = (ms) => new Promise((r) => setTimeout(r, ms));
const ALAMAT = 'https://mrkabar.test';

(async () => {
  const akun = kredensial('memet');
  const b = await puppeteer.launch({
    headless: 'new', args: ['--ignore-certificate-errors'],
    defaultViewport: { width: 1500, height: 1100 },
  });
  const p = await b.newPage();
  await p.goto(`${ALAMAT}/login`, { waitUntil: 'networkidle2' });
  await p.waitForSelector('#username');
  await p.type('#username', akun.user);
  await p.type('#password', akun.sandi);
  await p.click('button[type="submit"]');
  await tidur(14000);

  await p.goto(`${ALAMAT}/backup`, { waitUntil: 'networkidle2' });
  await tidur(3500);

  // Isi formulir Tandai Versi.
  const terisi = await p.evaluate(() => {
    const set = (el, v) => {
      const s = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      s.call(el, v);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    };
    const semua = [...document.querySelectorAll('input')];
    const tag = semua.find((e) => /v1\.0|versi/i.test(e.placeholder || '') || /tag/i.test(e.name || ''));
    const catatan = semua.find((e) => /catatan/i.test((e.placeholder || '') + (e.name || '')))
      || document.querySelector('textarea');
    if (!tag) {
      return { ok: false, placeholder: semua.map((e) => e.placeholder).filter(Boolean).slice(0, 8) };
    }
    set(tag, 'v1.0.10');
    if (catatan) {
      const s = Object.getOwnPropertyDescriptor(
        catatan.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype,
        'value',
      ).set;
      s.call(catatan, 'Penyaring periode/tahun/OPD, kelengkapan KRS Pemda dari tiga tabel RPJMD, batas Selera Risiko, dan bab pembacaan data untuk pimpinan');
      catatan.dispatchEvent(new Event('input', { bubbles: true }));
    }
    // Centang "push ke GitHub" bila ada.
    const push = [...document.querySelectorAll('[role=checkbox], input[type=checkbox]')]
      .find((e) => /push|github/i.test((e.closest('label')?.textContent || '') + (e.getAttribute('aria-label') || '')));
    if (push && push.getAttribute('data-state') !== 'checked' && !push.checked) {
      push.click();
    }
    return { ok: true, adaCatatan: !!catatan, adaPush: !!push };
  });
  console.log('formulir:', JSON.stringify(terisi));
  if (!terisi.ok) {
    await b.close();
    return;
  }

  await tidur(800);
  await p.evaluate(() => {
    const t = [...document.querySelectorAll('button')].find((e) => /Tandai Versi/i.test(e.textContent));
    t?.click();
  });
  await tidur(20000);

  const pesan = await p.evaluate(() => {
    const t = document.body.innerText;
    const m = t.match(/(Versi v[\d.]+ ditandai[^\n]*|Gagal[^\n]*|sudah ada[^\n]*)/);
    return m ? m[0] : '(tidak ada pesan)';
  });
  console.log('hasil:', pesan);
  await b.close();
})();
