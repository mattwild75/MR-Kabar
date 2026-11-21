/**
 * Tangkapan layar aplikasi (lokal) untuk video edukasi v7.
 *
 *   php akun_shot.php buat                 -> akun sementara shot_v7 (sandi acak)
 *   node ambil_layar.cjs <user> <sandi> <kode-pemulihan>
 *   php akun_shot.php hapus                -> akun dihapus tuntas
 */
const fs = require('fs');
const path = require('path');
const puppeteer = require(path.join(__dirname, '..', '..', 'node_modules', 'puppeteer'));

const ALAMAT = 'https://mrkabar.test';
const KELUAR = path.join(__dirname, 'aset', 'layar');
const T = process.env.TAHUN || 2025;
const tidur = (ms) => new Promise((r) => setTimeout(r, ms));

async function gulungKe(p, judul) {
  return p.evaluate((j) => {
    const el = [...document.querySelectorAll('h1,h2,h3,h4,div,span,p,label')].find((e) => e.children.length < 3 && e.textContent.trim().startsWith(j));
    if (!el) return false;
    el.scrollIntoView({ block: 'start' });
    window.scrollBy(0, -90);
    return true;
  }, judul);
}

(async () => {
  const [user, sandi, kode] = process.argv.slice(2);
  fs.mkdirSync(KELUAR, { recursive: true });
  const b = await puppeteer.launch({ headless: 'new', args: ['--ignore-certificate-errors', '--window-size=1920,1080'], defaultViewport: { width: 1920, height: 1080, deviceScaleFactor: 1 } });
  const p = await b.newPage();
  await p.goto(`${ALAMAT}/login`, { waitUntil: 'networkidle2' });
  await p.type('#username', user);
  await p.type('#password', sandi);
  await p.click('button[type="submit"]');
  await tidur(5000);
  await p.evaluate(async (k) => {
    const x = decodeURIComponent((document.cookie.match(/XSRF-TOKEN=([^;]+)/) || [])[1] || '');
    await fetch('/dua-faktor', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json', 'X-XSRF-TOKEN': x, 'X-Requested-With': 'XMLHttpRequest' }, body: JSON.stringify({ kode: k, pakai_pemulihan: true }) });
  }, kode);
  await p.evaluate(() => { try { localStorage.setItem('appearance', 'light'); } catch (e) {} });
  // sembunyikan lencana pengembang lokal (Herd) di pojok kanan bawah: tidak ada di produksi
  const bersih = () => p.evaluate(() => {
    for (const e of [...document.body.children]) {
      if (e.id === 'app' || e.querySelector('[role="dialog"]') || e.getAttribute('role') === 'dialog') continue;
      const r = e.getBoundingClientRect();
      const tetap = getComputedStyle(e).position === 'fixed' || e.shadowRoot;
      if (tetap && r.width < 600 && r.bottom > 900) e.style.display = 'none';
      if (/herd/i.test(e.tagName) || /herd/i.test(e.id)) e.style.display = 'none';
    }
  });
  const foto = async (nama) => { await bersih(); await tidur(200); await p.screenshot({ path: path.join(KELUAR, `${nama}.png`) }); console.log('OK', nama, p.url()); };
  const buka = async (url, tunggu = 5000) => { await p.goto(ALAMAT + url, { waitUntil: 'networkidle2', timeout: 90000 }); await p.evaluate(() => document.documentElement.classList.remove('dark')); await tidur(tunggu); };
  const hanya = process.env.HANYA ? process.env.HANYA.split(',') : null;
  const mau = (n) => !hanya || hanya.includes(n);

  if (mau('dashboard')) {
    await buka(`/dashboard?tahun=${T}`, 7000); await foto('dashboard');
    for (const [nama, judul] of [['dashboard-jadwal', 'Jadwal'], ['dashboard-peta', 'Peta Risiko'], ['dashboard-prioritas', 'Daftar Risiko Prioritas'], ['dashboard-ranking', 'Ranking Eksposur'], ['dashboard-kepatuhan', 'Kepatuhan Pelaporan (Form']]) {
      if (!(await gulungKe(p, judul))) console.log('  judul tidak ditemukan:', judul);
      await tidur(1500); await foto(nama);
    }
  }
  if (mau('cee')) { await buka(`/cee/1a?tahun=${T}&opd_id=${process.env.OPD || 1}`); await foto('cee-1a'); }
  if (mau('data-umum')) { await buka('/data-umum'); await foto('data-umum'); }
  if (mau('form-cetak')) {
    await buka(`/dashboard?tahun=${T}`, 5000);
    await p.evaluate(() => { const el = [...document.querySelectorAll('button,a,span')].find((e) => e.textContent.trim() === 'Form Cetak'); if (el) (el.closest('button') || el).click(); });
    await tidur(1500); await foto('form-cetak');
  }
  if (mau('iro')) {
    await buka(`/iro_pd?tahun=${T}`, 6000);
    const ok = await p.evaluate(() => { const ik = document.querySelector('table button svg.lucide-square-pen, table button svg.lucide-pencil'); if (!ik) return false; ik.closest('button').click(); return true; });
    console.log('  tombol edit:', ok);
    await tidur(2500);
    await p.evaluate(() => {
      const el = [...document.querySelectorAll('[role="dialog"] *')].find((e) => e.children.length < 2 && e.textContent.trim().startsWith('Apakah risiko ini sudah memiliki'));
      if (el) el.scrollIntoView({ block: 'start' });
    });
    await tidur(1500); await foto('existing-control');
    await p.evaluate(() => { const el = [...document.querySelectorAll('[role="dialog"] *')].find((e) => e.children.length < 2 && /^Nilai Risiko (Residual\/Current|Inheren = Residual\/Current)/.test(e.textContent.trim())); if (el) el.scrollIntoView({ block: 'start' }); });
    await tidur(1500); await foto('tabel-kriteria');
    await p.evaluate(() => { const el = [...document.querySelectorAll('[role="dialog"] *')].find((e) => e.children.length < 3 && e.textContent.trim().startsWith('Rencana Tindak Pengendalian')); if (el) el.scrollIntoView({ block: 'start' }); });
    await tidur(1200); await foto('rtp');
    const isi = await p.evaluate(() => { const bt = [...document.querySelectorAll('[role="dialog"] button')].find((x) => x.textContent.trim() === 'Isi Nilai Risiko' && !x.disabled); if (!bt) return false; bt.scrollIntoView({ block: 'center' }); bt.click(); return true; });
    console.log('  isi nilai risiko:', isi);
    await tidur(2500); await foto('isi-nilai');
  }
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
