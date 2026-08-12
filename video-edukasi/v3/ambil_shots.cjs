/**
 * Ambil ulang tangkapan layar aplikasi untuk dipakai di dalam video.
 *
 * Hanya sepuluh halaman yang benar-benar dirujuk `src:` di scenes.js yang
 * diambil — bukan seluruh isi shots/. Berkas lain di sana sisa versi lama dan
 * mengambilnya ulang hanya menghabiskan waktu.
 *
 * Sandinya diterima lewat argumen dari akun_sementara.php dan tidak pernah
 * ditulis ke berkas mana pun di dalam repositori.
 *
 *   node ambil_shots.cjs <username> <sandi>
 */
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const ALAMAT = 'https://mrkabar.test';
const KELUAR = path.join(__dirname, 'shots');
const tidur = (ms) => new Promise((r) => setTimeout(r, ms));

// Lebar 1920 supaya tangkapannya sepadan dengan kanvas video 1920x1080 dan
// tidak perlu diperbesar sewaktu dirender — memperbesar gambar raster membuat
// tulisannya kabur, dan itu paling kelihatan justru pada tabel.
const LEBAR = 1920;
const TINGGI = 1400;

// Tahun aktif Pemda saat ini 2026 dan tahun itu MASIH KOSONG — seluruh 258
// baris risiko yang ada bertahun 2025. Tanpa ?tahun=2025 yang terpotret adalah
// dashboard bernilai nol semua, dan itu justru mengajarkan hal yang keliru
// kepada penonton. Tahunnya dipaksa lewat parameter URL, bukan dengan mengubah
// PengaturanPemda.tahun_penilaian — setelan itu berlaku Pemda-wide untuk semua
// OPD, dan mengubahnya demi memotret layar jelas tidak sepadan.
const TAHUN = 2025;

// Dua potongan Dashboard yang digulung ke bagian tertentu. Tanpa ini, kalimat
// tentang garis Selera Risiko dan tentang Ranking Eksposur yang bisa diklik
// ditemani gambar yang justru tidak memuat keduanya: panel jadwal 2025 tinggi
// sekali dan mendorong sisanya keluar dari layar. Digulung lewat judul kartu,
// bukan lewat angka piksel, supaya tetap benar kalau tata letaknya bergeser.
const GULUNG = [
  ['dashboard-peta', 'Peta Risiko', `/dashboard?tahun=${TAHUN}`],
  ['dashboard-ranking', 'Ranking Eksposur', `/dashboard?tahun=${TAHUN}`],
];

const HALAMAN = [
  ['dashboard', `/dashboard?tahun=${TAHUN}`, 6000],
  ['krs-pemda', `/krs_irs_pemda?tahun=${TAHUN}`, 4000],
  ['gabungan', `/data-risiko-gabungan?tahun=${TAHUN}`, 4000],
  ['keterangan', '/keterangan-pendukung', 4000],
  ['cee-1a', `/cee/1a?tahun=${TAHUN}`, 4000],
  ['monev-89', `/monitoring-evaluasi/8-9?tahun=${TAHUN}`, 4000],
  ['cetak-laporan', `/cetak/laporan/1?tahun=${TAHUN}`, 6000],
  ['trash', '/trash', 3000],
  ['auditlog', '/audit-logs', 3000],
  ['backup-excel', '/backup/excel', 3000],
];

(async () => {
  const [user, sandi] = process.argv.slice(2);
  if (!user || !sandi) {
    console.error('pakai: node ambil_shots.cjs <username> <sandi>');
    process.exit(1);
  }

  const b = await puppeteer.launch({
    headless: 'new',
    args: ['--ignore-certificate-errors', `--window-size=${LEBAR},${TINGGI}`],
    defaultViewport: { width: LEBAR, height: TINGGI, deviceScaleFactor: 1 },
  });
  const p = await b.newPage();

  await p.goto(`${ALAMAT}/login`, { waitUntil: 'networkidle2' });
  await p.waitForSelector('#username');
  await p.type('#username', user);
  await p.type('#password', sandi);
  await p.click('button[type="submit"]');
  await tidur(14000);
  if (!/dashboard/.test(p.url())) {
    console.error('GAGAL masuk:', p.url());
    await b.close();
    process.exit(1);
  }
  console.log('masuk sebagai akun sementara');

  // Tema terang: latar video sudah gelap, dan tangkapan layar gelap di atas
  // latar gelap kehilangan batas tepinya.
  await p.evaluate(() => {
    localStorage.setItem('appearance', 'light');
    document.documentElement.classList.remove('dark');
  });

  let gagal = 0;
  for (const [nama, jalur, tunggu] of HALAMAN) {
    try {
      await p.goto(ALAMAT + jalur, { waitUntil: 'networkidle2', timeout: 60000 });
      await tidur(tunggu);
      // Sembunyikan dialog peringatan sesi kalau kebetulan sedang tampil —
      // ia menutupi isi halaman dan tidak ada hubungannya dengan yang dipotret.
      await p.evaluate(() => {
        document.querySelectorAll('[role=alertdialog]').forEach((e) => e.remove());
        document.querySelectorAll('[data-slot=dialog-overlay]').forEach((e) => e.remove());
      });
      const berkas = path.join(KELUAR, `${nama}.png`);
      await p.screenshot({ path: berkas, fullPage: false });
      const kb = Math.round(fs.statSync(berkas).size / 1024);
      console.log(`  ${nama.padEnd(14)} ${String(kb).padStart(4)} KB  <- ${jalur}`);
    } catch (e) {
      gagal++;
      console.error(`  ${nama.padEnd(14)} GAGAL: ${String(e).slice(0, 90)}`);
    }
  }

  for (const [nama, judul, jalur] of GULUNG) {
    try {
      await p.goto(ALAMAT + jalur, { waitUntil: 'networkidle2', timeout: 60000 });
      await tidur(6000);
      await p.evaluate(() => {
        document.querySelectorAll('[role=alertdialog]').forEach((e) => e.remove());
      });
      // Bawa kartu yang dimaksud ke sepertiga atas layar, bukan ke tepi paling
      // atas: judul kartunya perlu ikut terlihat supaya penonton tahu ini
      // bagian apa.
      // CardTitle di aplikasi ini cuma <div> ber-class, bukan h2/h3, jadi
      // tidak ada selector yang bisa dipakai. Yang dicari: elemen TERDALAM
      // yang memuat teksnya — kalau tidak, yang ketemu adalah <body>.
      const ketemu = await p.evaluate((t) => {
        const semua = [...document.querySelectorAll('div, span, h1, h2, h3, p')]
          .filter((e) => e.textContent.trim().startsWith(t) && e.children.length === 0);
        const el = semua[0]
          ?? [...document.querySelectorAll('*')]
            .filter((e) => e.textContent.includes(t))
            .sort((a, b) => b.compareDocumentPosition(a) & 16 ? 1 : -1)[0];
        if (!el) return false;
        window.scrollBy({ top: el.getBoundingClientRect().top - 60, behavior: 'instant' });
        return true;
      }, judul);
      if (!ketemu) throw new Error(`judul "${judul}" tidak ketemu di halaman`);
      await tidur(1500);

      // Dipotong tepat pada kartunya, bukan seluruh layar. Dua sebabnya:
      // yang dinarasikan memang cuma kartu ini, dan panel "Aktivitas Terbaru"
      // di sebelahnya kebetulan merekam pembuatan & penghapusan akun sementara
      // yang dipakai skrip ini — tidak ada gunanya bagi penonton, dan hanya
      // menimbulkan pertanyaan yang tidak ada jawabannya di dalam video.
      const kotak = await p.evaluate((t) => {
        const judulEl = [...document.querySelectorAll('div, span, h1, h2, h3, p')]
          .find((e) => e.textContent.trim().startsWith(t) && e.children.length === 0);
        if (!judulEl) return null;
        // Naik sampai ketemu kotak yang benar-benar sebesar kartu. Judulnya
        // sendiri sudah selebar kartu (div blok) tapi tingginya cuma sebaris,
        // jadi lebar saja bukan penanda yang cukup.
        let el = judulEl;
        for (let i = 0; i < 8 && el.parentElement; i++) {
          const r = el.getBoundingClientRect();
          if (r.width >= 500 && r.height >= 250) break;
          el = el.parentElement;
        }
        const r = el.getBoundingClientRect();
        // clip pada Puppeteer diukur dari sudut DOKUMEN, sedangkan
        // getBoundingClientRect mengukur dari sudut layar. Halamannya sudah
        // digulung, jadi selisihnya harus ditambahkan — tanpa ini yang
        // terpotong adalah bagian halaman yang jauh di atasnya.
        return {
          x: Math.max(0, r.x + window.scrollX - 12),
          y: Math.max(0, r.y + window.scrollY - 12),
          width: r.width + 24,
          height: r.height + 24,
        };
      }, judul);
      if (!kotak) throw new Error('kotak kartu tidak terukur');
      if (kotak.height < 250) throw new Error(`kotak kartu cuma ${Math.round(kotak.height)}px — bukan kartunya`);

      const berkas = path.join(KELUAR, `${nama}.png`);
      await p.screenshot({ path: berkas, clip: kotak });
      const kb = Math.round(fs.statSync(berkas).size / 1024);
      console.log(`  ${nama.padEnd(18)} ${String(kb).padStart(4)} KB  <- digulung ke "${judul}"`);
    } catch (e) {
      gagal++;
      console.error(`  ${nama.padEnd(18)} GAGAL: ${String(e).slice(0, 90)}`);
    }
  }

  await b.close();
  const total = HALAMAN.length + GULUNG.length;
  console.log(gagal ? `\n${gagal} dari ${total} gagal` : `\n${total} tangkapan layar selesai`);
  process.exit(gagal ? 1 : 0);
})();
