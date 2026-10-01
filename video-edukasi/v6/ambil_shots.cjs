/**
 * Tangkapan layar aplikasi untuk video edukasi v6.
 *
 *   php akun_shot.php buat          -> USER/PASS/KODE
 *   node ambil_shots.cjs <user> <sandi> <kode-pemulihan>
 *   php akun_shot.php hapus
 *
 * Data risiko yang terisi bertahun 2025, sedangkan tahun aktif Pemda 2026
 * masih kosong — tahunnya dipaksa lewat ?tahun=2025, bukan dengan mengubah
 * pengaturan Pemda.
 */
const fs = require('fs');
const path = require('path');
const puppeteer = require(path.join(__dirname, '..', '..', 'node_modules', 'puppeteer'));

const ALAMAT = 'https://mrkabar.test';
const KELUAR = path.join(__dirname, 'shots');
const T = 2025;
const tidur = (ms) => new Promise((r) => setTimeout(r, ms));

// [nama, url, tunggu ms, judul kartu untuk digulung (opsional)]
const HALAMAN = [
  ['dashboard', `/dashboard?tahun=${T}`, 7000],
  ['dashboard-jadwal', `/dashboard?tahun=${T}`, 5000, 'Jadwal'],
  ['dashboard-peta', `/dashboard?tahun=${T}`, 5000, 'Peta Risiko'],
  ['dashboard-ranking', `/dashboard?tahun=${T}`, 5000, 'Ranking Eksposur'],
  ['dashboard-siklus', `/dashboard?tahun=${T}`, 5000, 'Siklus'],
  ['cee-1a', `/cee/1a?tahun=${T}&opd_id=${process.env.OPD || 1}`, 5000],
  ['hirarki', `/krs_irs_pemda_visualisasi?tahun=${T}`, 6000],
  ['irs-pemda', `/irs_pemda?tahun=${T}`, 5000],
  ['keterangan', '/keterangan-pendukung', 4500, '', 'Matriks Analisis Risiko'],
  ['monev-89', `/monitoring-evaluasi/8-9?tahun=${T}`, 4500],
  ['lapor', '/lapor-kejadian', 4000],
  ['struktur', `/cetak/struktur-pengelolaan-risiko?tahun=${T}`, 6000],
  ['cetak-laporan', `/cetak/laporan/2?tahun=${T}`, 6000],
  ['gabungan', `/data-risiko-gabungan?tahun=${T}`, 5000],
];

(async () => {
  const [user, sandi, kode] = process.argv.slice(2);
  fs.mkdirSync(KELUAR, { recursive: true });
  const b = await puppeteer.launch({
    headless: 'new',
    args: ['--ignore-certificate-errors', '--window-size=1920,1080'],
    defaultViewport: { width: 1920, height: 1080, deviceScaleFactor: 1 },
  });
  const p = await b.newPage();
  await p.goto(`${ALAMAT}/login`, { waitUntil: 'networkidle2' });
  await p.type('#username', user);
  await p.type('#password', sandi);
  await p.click('button[type="submit"]');
  await tidur(5000);
  await p.evaluate(async (k) => {
    const x = decodeURIComponent((document.cookie.match(/XSRF-TOKEN=([^;]+)/) || [])[1] || '');
    await fetch('/dua-faktor', {
      method: 'POST', credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', 'X-XSRF-TOKEN': x, 'X-Requested-With': 'XMLHttpRequest' },
      body: JSON.stringify({ kode: k, pakai_pemulihan: true }),
    });
  }, kode);
  // Tema terang untuk tangkapan layar: lebih terbaca di dalam bingkai laptop.
  await p.evaluate(() => { try { localStorage.setItem('appearance', 'light'); } catch (e) {} });

  const hanya = process.env.HANYA ? process.env.HANYA.split(',') : null;
  for (const [nama, url, tunggu, gulung, klik] of HALAMAN) {
    if (hanya && !hanya.includes(nama)) continue;
    await p.goto(ALAMAT + url, { waitUntil: 'networkidle2', timeout: 90000 });
    await p.evaluate(() => document.documentElement.classList.remove('dark'));
    await tidur(tunggu);
    if (klik) {
      await p.evaluate((t) => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === t); if (b) b.click(); }, klik);
      await tidur(2000);
    }
    if (gulung) {
      const ok = await p.evaluate((judul) => {
        const el = [...document.querySelectorAll('h1,h2,h3,h4,div,span')].find((e) => e.children.length < 3 && e.textContent.trim().startsWith(judul));
        if (!el) return false;
        el.scrollIntoView({ block: 'start' });
        window.scrollBy(0, -90);
        return true;
      }, gulung);
      if (!ok) console.log('  (judul tidak ditemukan:', gulung, ')');
      await tidur(1500);
    }
    await p.screenshot({ path: path.join(KELUAR, `${nama}.png`) });
    console.log('OK', nama, p.url());
  }
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
