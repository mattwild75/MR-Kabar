/**
 * Pengintip struktur halaman — dipakai sekali saat menyusun pengendali.
 *
 * Membuka aplikasi sungguhan dengan akun perekam, lalu mencetak SELURUH elemen
 * yang bisa disentuh di tiap halaman berikut label dan pengenalnya. Tanpa ini
 * pengendali harus menebak selektor, dan tebakan yang salah baru ketahuan
 * setelah rekaman berjalan setengah jam.
 *
 *   node intip.cjs                 -> daftar halaman bawaan
 *   node intip.cjs /irs_pd         -> satu halaman saja
 *   node intip.cjs /irs_pd tambah  -> sekalian buka formulir tambahnya
 */
const puppeteer = require('puppeteer');

const ASAL = process.env.MRKABAR_URL || 'https://mrkabar.test';
const kredensial = require('./sandi.cjs');
// Akun bisa diganti lewat AKUN_PEREKAM, mis. saat memetakan halaman yang
// hanya terlihat oleh akun pelapor atau akun hanya-baca.
const AKUN = kredensial(process.env.AKUN_PEREKAM || 'PIC_INSPEKTORAT');

const HALAMAN_BAWAAN = [
  '/dashboard', '/data-umum', '/cee/1a', '/cee/1b', '/cee/1c', '/cee/1d',
  '/krs_pemda', '/irs_pemda', '/krs_pd', '/irs_pd', '/kro_pd', '/iro_pd',
  '/monitoring-evaluasi/8-9', '/monitoring-evaluasi/10',
];

const PETIK = () => ({
  judul: document.title,
  h1: [...document.querySelectorAll('h1,h2')].map((e) => e.textContent.trim()).filter(Boolean).slice(0, 6),
  kolom: [...document.querySelectorAll('input,select,textarea')]
    .filter((e) => e.type !== 'hidden' && e.offsetParent !== null)
    .map((e) => {
      const lab = e.labels?.[0]?.textContent?.trim()
        || e.closest('label')?.textContent?.trim()
        || e.getAttribute('aria-label') || e.placeholder || '';
      return {
        tag: e.tagName.toLowerCase(),
        tipe: e.type || '',
        name: e.name || '',
        id: e.id || '',
        label: lab.slice(0, 70),
        opsi: e.tagName === 'SELECT' ? [...e.options].map((o) => o.value).slice(0, 8) : undefined,
      };
    }),
  tombol: [...document.querySelectorAll('button,a[href],[role=button],[role=combobox]')]
    .filter((e) => e.offsetParent !== null)
    .map((e) => ({
      tag: e.tagName.toLowerCase(),
      peran: e.getAttribute('role') || '',
      teks: (e.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 45),
      href: e.getAttribute('href') || '',
      id: e.id || '',
    }))
    .filter((e) => e.teks || e.href),
  tabel: [...document.querySelectorAll('table')].map((t) => ({
    kepala: [...t.querySelectorAll('thead th')].map((th) => th.textContent.trim().slice(0, 34)),
    baris: t.querySelectorAll('tbody tr').length,
  })),
});

(async () => {
  const arg = process.argv[2];
  const bukaTambah = process.argv[3] === 'tambah';
  const daftar = arg ? [arg] : HALAMAN_BAWAAN;

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--ignore-certificate-errors', '--window-size=1920,1080'],
    defaultViewport: { width: 1920, height: 1080 },
  });
  const page = await browser.newPage();

  await page.goto(`${ASAL}/login`, { waitUntil: 'networkidle2' });
  // Kolom login memakai id, bukan name (komponen Input dari shadcn).
  await page.waitForSelector('#username');
  await page.type('#username', AKUN.user, { delay: 12 });
  await page.type('#password', AKUN.sandi, { delay: 12 });
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {}),
    page.click('button[type="submit"]'),
  ]);
  await new Promise((r) => setTimeout(r, 2500));
  console.log('sesudah login:', page.url(), '\n');
  if (/\/login/.test(page.url())) {
    console.log('GAGAL MASUK. Teks yang tampak di halaman:');
    console.log((await page.evaluate(() => document.body.innerText)).slice(0, 900));
    await browser.close();
    process.exit(1);
  }

  for (const url of daftar) {
    await page.goto(ASAL + url, { waitUntil: 'networkidle2' }).catch(() => {});
    await new Promise((r) => setTimeout(r, 900));
    console.log('='.repeat(78));
    console.log('HALAMAN', url, '->', page.url());
    console.log(JSON.stringify(await page.evaluate(PETIK), null, 1));

    if (bukaTambah) {
      const dibuka = await page.evaluate(() => {
        const b = [...document.querySelectorAll('button,a')]
          .find((e) => /tambah|baru|\+ ?data/i.test(e.textContent || ''));
        if (b) { b.click(); return b.textContent.trim(); }
        return null;
      });
      if (dibuka) {
        await new Promise((r) => setTimeout(r, 1200));
        console.log(`\n--- sesudah klik "${dibuka}" ---`);
        console.log(JSON.stringify(await page.evaluate(PETIK), null, 1));
      } else {
        console.log('\n--- tidak menemukan tombol tambah ---');
      }
    }
  }

  await browser.close();
})();
