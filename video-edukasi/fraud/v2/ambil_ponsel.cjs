/**
 * Tangkapan layar halaman Lapor versi PONSEL untuk video edukasi kecurangan v2.
 *
 * Masuk persis seperti pelapor sungguhan: lewat alamat kode QR
 * (/login/lapor-kejadian, akun bersama LAPOR) — tidak ada akun pribadi yang
 * dipinjam. Isian memakai contoh rekaan (pungutan di loket pelayanan) dan
 * SENGAJA tidak memilih Perangkat Daerah mana pun, supaya video tidak
 * menuding instansi nyata.
 *
 * Laporan contoh benar-benar dikirim (untuk memotret layar tiket dan Cek
 * Status), LALU DIHAPUS tuntas oleh tiket_contoh.php di akhir skrip ini.
 *
 *   node ambil_ponsel.cjs        -> shots/p-*.png (+ shots/p-*.json posisi elemen)
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const puppeteer = require(path.join(__dirname, '..', '..', '..', 'node_modules', 'puppeteer'));

const ALAMAT = 'https://mrkabar.test';
const PHP = 'C:/Users/Nurhikmat Muhammad/.config/herd/bin/php85/php.exe';
const KELUAR = path.join(__dirname, 'shots');
const LEBAR = 393, TINGGI = 852, DPR = 3;
const tidur = (ms) => new Promise((r) => setTimeout(r, ms));

const ISI = {
  uraian_kejadian: 'Petugas loket meminta uang Rp50.000 untuk penerbitan surat keterangan yang menurut papan pengumuman di loket tidak dipungut biaya. Tidak ada kuitansi yang diberikan.',
  tempat_fraud: 'Loket pelayanan surat keterangan',
  pihak_terlibat: 'Petugas loket pelayanan (giliran pagi)',
  kronologi: 'Senin pagi saya mengurus surat keterangan. Setelah berkas diperiksa, petugas mengatakan surat baru bisa selesai hari itu bila membayar Rp50.000. Saya membayar dan tidak diberi kuitansi.',
  perkiraan_kerugian: 'Rp50.000 per surat',
  bukti_keterangan: 'Foto papan pengumuman layanan gratis di loket.',
};

function php(...arg) {
  return execFileSync(PHP, [path.join(__dirname, 'tiket_contoh.php'), ...arg], { encoding: 'utf8' })
    .split('\n').filter((b) => !b.startsWith('Deprecated') && b.trim()).join('\n');
}

/** Posisi (px CSS, relatif dokumen) elemen-elemen penting, untuk sorotan di video. */
async function catatPosisi(p, nama) {
  const pos = await p.evaluate(() => {
    const kotak = (el) => {
      if (!el || el.offsetParent === null) return null;
      const r = el.getBoundingClientRect();
      return { x: Math.round(r.left), y: Math.round(r.top + window.scrollY), w: Math.round(r.width), h: Math.round(r.height) };
    };
    const rata = (e) => e.textContent.trim().replace(/\s+/g, ' ');
    // elemen TAMPAK pertama yang teksnya diawali / sama dengan t
    const awal = (sel, t) => [...document.querySelectorAll(sel)].find((e) => e.offsetParent !== null && rata(e).startsWith(t));
    const sama = (sel, t) => [...document.querySelectorAll(sel)].find((e) => e.offsetParent !== null && rata(e) === t);
    // label + isiannya (pembungkus langsung label)
    const blok = (t) => { const l = sama('label, p', t); return l ? l.parentElement : null; };
    const kartu = (t) => { const l = sama('[data-slot="card-title"], .text-base', t); return l ? l.closest('[data-slot="card"]') : null; };
    const hasil = {
      tinggi: document.documentElement.scrollHeight,
      tab_kejadian: kotak(awal('[role="tab"]', 'Kejadian Risiko')),
      tab_kecurangan: kotak(awal('[role="tab"]', 'Dugaan Kecurangan')),
      tab_status: kotak(awal('[role="tab"]', 'Cek Status Laporan')),
      nama_lengkap: kotak(blok('Nama Lengkap')),
      identitas: kotak(kartu('Identitas Pelapor')),
      mode_terbuka: kotak(awal('label', 'Terbuka')),
      mode_kontak: kotak(awal('label', 'Anonim, tetapi bisa dihubungi')),
      mode_penuh: kotak(awal('label', 'Anonim penuh')),
      catatan_penuh: kotak(awal('p', 'Tidak ada seorang pun')),
      kejadian: kotak(kartu('Kejadian yang Dilaporkan')),
      q_apa: kotak(blok('Apa yang terjadi? *')),
      q_dimana: kotak(blok('Di mana?')),
      q_kapan: kotak(blok('Kapan?')),
      q_siapa: kotak(blok('Siapa yang diduga terlibat?')),
      q_bagaimana: kotak(blok('Bagaimana kejadiannya?')),
      tambahan: kotak(kartu('Keterangan Tambahan')),
      opd: kotak(blok('Perangkat Daerah terkait')),
      tahapan: kotak(blok('Tahapan proses')),
      dugaan: kotak(blok('Dugaan bentuk kecurangan')),
      kerugian: kotak(blok('Perkiraan kerugian')),
      bukti: kotak(blok('Bukti yang Anda miliki')),
      lampiran: kotak(blok('Lampirkan berkas bukti')),
      catatan_anonim: kotak(awal('p', 'Anda melapor tanpa nama')),
      tombol_kirim: kotak(sama('button', 'Lapor Dugaan Kecurangan')),
      tiket: kotak((awal('p', 'Laporan terkirim.') || {}).parentElement),
      cek_form: kotak((sama('button', 'Lihat Status') || {}).closest ? sama('button', 'Lihat Status').closest('form') : null),
      tombol_lihat: kotak(sama('button', 'Lihat Status')),
      hasil: kotak((awal('p', 'Yang Anda laporkan') || {}).closest ? awal('p', 'Yang Anda laporkan').closest('[data-slot="card"]') : null),
      tanya_jawab: kotak(blok('Tanya-jawab')),
      balasan: kotak(blok('Jawaban Anda')),
      kirim_jawaban: kotak(sama('button', 'Kirim Jawaban')),
    };
    for (const k of Object.keys(hasil)) if (hasil[k] === null) delete hasil[k];
    return hasil;
  });
  fs.writeFileSync(path.join(KELUAR, `${nama}.json`), JSON.stringify(pos, null, 1));
  return pos;
}

async function potret(p, nama, penuh = true) {
  await tidur(500);
  await p.screenshot({ path: path.join(KELUAR, `${nama}.png`), fullPage: penuh });
  const pos = await catatPosisi(p, nama);
  console.log(`  ${nama}.png (tinggi ${pos.tinggi}px)`);
}

async function klikTeks(p, sel, t) {
  const ok = await p.evaluate((s, x) => {
    const el = [...document.querySelectorAll(s)].find((e) => e.textContent.trim().replace(/\s+/g, ' ').startsWith(x));
    if (!el) return false;
    el.scrollIntoView({ block: 'center' });
    el.click();
    return true;
  }, sel, t);
  if (!ok) throw new Error(`tidak ketemu: ${sel} "${t}"`);
  await tidur(600);
}

async function ketik(p, id, teks) {
  // tanpa garis merah pemeriksa ejaan peramban di bawah kata-kata bahasa Indonesia
  await p.evaluate((i) => { const el = document.getElementById(i); el.spellcheck = false; el.scrollIntoView({ block: 'center' }); }, id);
  await p.click('#' + id);
  await p.type('#' + id, teks, { delay: 0 });
}

(async () => {
  fs.mkdirSync(KELUAR, { recursive: true });
  const awal = php('cek');
  if (!awal.startsWith('jumlah laporan kecurangan (termasuk terhapus): 0')) {
    console.log(awal);
    console.log('Basis data lokal sudah berisi laporan kecurangan; skrip ini hanya untuk basis data kosong — batal.');
    process.exit(1);
  }
  const b = await puppeteer.launch({ headless: 'new', args: ['--ignore-certificate-errors'] });
  const p = await b.newPage();
  await p.setViewport({ width: LEBAR, height: TINGGI, deviceScaleFactor: DPR, isMobile: true, hasTouch: true });
  await p.evaluateOnNewDocument(() => { try { localStorage.setItem('appearance', 'light'); } catch (e) {} });
  const galat = [];
  p.on('pageerror', (e) => galat.push(String(e)));

  let nomor = null;
  try {
    await p.goto(`${ALAMAT}/login/lapor-kejadian`, { waitUntil: 'networkidle2', timeout: 90000 });
    await tidur(2500);
    // splash sesudah masuk (bila muncul) dilewati
    await p.keyboard.press('Escape');
    await p.waitForFunction(() => !document.querySelector('.splash'), { timeout: 10000 }).catch(() => {});
    await p.evaluate(() => document.documentElement.classList.remove('dark'));
    await tidur(1200);
    console.log('halaman:', p.url());

    await p.evaluate(() => window.scrollTo(0, 0));
    await potret(p, 'p-awal', false);
    await potret(p, 'p-kejadian');

    await klikTeks(p, '[role="tab"]', 'Dugaan Kecurangan');
    await p.evaluate(() => window.scrollTo(0, 0));
    await potret(p, 'p-kecurangan');

    await klikTeks(p, 'label', 'Anonim penuh');
    await potret(p, 'p-anonim');

    for (const [id, t] of Object.entries(ISI)) await ketik(p, id, t);
    // Tahapan proses. Pemilih Perangkat Daerah SENGAJA dibiarkan kosong. Pemilih
    // dicari lewat labelnya di tab yang tampak — tab lain (tersembunyi) juga
    // punya pemilih, jadi urutan di DOM tidak bisa dipegang.
    await p.evaluate(() => {
      const lab = [...document.querySelectorAll('label')].find((e) => e.offsetParent !== null && e.textContent.trim() === 'Tahapan proses');
      const btn = lab.parentElement.querySelector('button[role="combobox"], [data-slot="select-trigger"]');
      btn.setAttribute('data-pilih-tahapan', '1');
      btn.scrollIntoView({ block: 'center' });
    });
    await tidur(300);
    await p.click('[data-pilih-tahapan]');
    await tidur(500);
    await klikTeks(p, '[role="option"]', 'Pelaksanaan');
    await klikTeks(p, 'label', 'Pemerasan');
    // Input berkas milik formulir KECURANGAN (formulir kejadian risiko di tab
    // tersembunyi juga punya satu, dan letaknya lebih dulu di DOM).
    await p.evaluate(() => {
      const kirim = [...document.querySelectorAll('button[type="submit"]')].find((e) => e.textContent.trim() === 'Lapor Dugaan Kecurangan');
      kirim.closest('form').querySelector('input[type="file"]').setAttribute('data-berkas-kecurangan', '1');
    });
    const berkas = await p.$('[data-berkas-kecurangan]');
    await berkas.uploadFile(path.join(__dirname, 'img', 'foto-papan-loket.jpg'));
    await tidur(800);
    await p.evaluate(() => document.activeElement && document.activeElement.blur());
    await potret(p, 'p-isi');

    const kirim = [];
    p.on('response', (r) => { if (r.url().includes('/lapor-kecurangan')) kirim.push(`${r.request().method()} ${r.status()} ${r.url()}`); });
    await p.evaluate(() => {
      const btn = [...document.querySelectorAll('button[type="submit"]')].find((e) => e.offsetParent !== null && e.textContent.trim() === 'Lapor Dugaan Kecurangan');
      btn.setAttribute('data-kirim', '1');
      btn.scrollIntoView({ block: 'center' });
    });
    await tidur(400);
    await p.click('[data-kirim]');
    const terkirim = await p.waitForFunction(() => [...document.querySelectorAll('p')].some((e) => e.textContent.trim().startsWith('Laporan terkirim.')), { timeout: 30000 }).then(() => true, () => false);
    if (!terkirim) {
      await p.screenshot({ path: path.join(KELUAR, '_gagal.png') });
      const pesan = await p.evaluate(() => [...document.querySelectorAll('.text-destructive, [data-sonner-toast]')].map((e) => e.textContent.trim()).filter(Boolean));
      throw new Error(`laporan contoh tidak terkirim; respons: ${kirim.join(' ; ') || '-'}; pesan: ${pesan.join(' | ') || '-'}`);
    }
    await tidur(1500);
    nomor = await p.evaluate(() => {
      const dd = [...document.querySelectorAll('dd')].map((e) => e.textContent.trim());
      return { tiket: dd[0], kode: dd[1] };
    });
    console.log('tiket contoh:', nomor.tiket);
    // toast "terkirim" disembunyikan supaya tidak menutupi kartu tiket
    await p.evaluate(() => document.querySelectorAll('[data-sonner-toaster]').forEach((e) => (e.style.display = 'none')));
    await p.evaluate(() => window.scrollTo(0, 0));
    await potret(p, 'p-tiket');

    console.log(php('tanya', nomor.tiket));
    await klikTeks(p, '[role="tab"]', 'Cek Status Laporan');
    await ketik(p, 'nomor_tiket', nomor.tiket);
    await ketik(p, 'kode_akses', nomor.kode);
    await potret(p, 'p-cek');
    await klikTeks(p, 'button', 'Lihat Status');
    await p.waitForFunction(() => [...document.querySelectorAll('p')].some((e) => e.textContent.trim().startsWith('Yang Anda laporkan')), { timeout: 30000 });
    await tidur(1200);
    await ketik(p, 'balasan', 'Sekitar pukul sepuluh pagi. Papan pengumuman itu masih terpasang di samping loket.');
    await klikTeks(p, 'button', 'Kirim Jawaban');
    await tidur(4000);
    await p.evaluate(() => document.querySelectorAll('[data-sonner-toaster]').forEach((e) => (e.style.display = 'none')));
    await p.evaluate(() => document.activeElement && document.activeElement.blur());
    await p.evaluate(() => window.scrollTo(0, 0));
    await potret(p, 'p-status');
  } finally {
    await b.close();
    if (nomor && nomor.tiket) console.log(php('hapus', nomor.tiket));
    console.log(php('cek'));
    if (galat.length) console.log('GALAT halaman:', galat.join(' | '));
  }
})();
