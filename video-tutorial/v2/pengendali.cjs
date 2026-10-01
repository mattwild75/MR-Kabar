/**
 * Pengendali perekaman v2 — menyetir aplikasi sungguhan sambil merekam layarnya.
 *
 * Dasarnya pengendali v1 (pencari elemen, pemilih Radix, kuesioner 1a,
 * simpulan 1c, matriks 5x5 — semua jebakannya terdokumentasi di sana). Yang
 * berubah di v2:
 *
 *   - Jendela 1920x1080 dengan <body> ber-CSS zoom 1,5 (lihat lapisan.js):
 *     aplikasi tertata seperti di layar 1280x720 tetapi tergambar 1,5 kali
 *     lebih besar dan tajam. Pada v1 teks aplikasi terlalu kecil untuk dibaca
 *     di pemutar. Seluruh koordinat di sini (kotak-batas, tetikus) dalam
 *     piksel jendela 1920x1080.
 *   - `pada: [k, 'kata', n]` pada aksi mana pun: aksi menunggu sampai kata itu
 *     diucapkan di kalimat ke-k langkah ini. Klik dan sorotan jatuh tepat
 *     saat disebut. Aksi hiasan (`latar: true`) dijadwalkan tanpa menahan
 *     aksi berikutnya.
 *   - Aksi baru: catat (catatan berpanah), kartu, judul (papan kiri bawah),
 *     lompat (bilah bagian formulir risiko), gulirKe, kombinasi (Ctrl+K),
 *     ketikBebas, klik { dekat } untuk tombol bernama kembar.
 *   - Setiap klik, ketukan, gulir, zoom, dan simpan dicatat ke
 *     rekam/peristiwa-N.json; efek suaranya dibangun dari catatan itu.
 *   - Satu berkas rekaman per BAB (bukan per bagian v1).
 *
 *   node pengendali.cjs --bab 3            rekam bab 3
 *   node pengendali.cjs --bab 3 --uji      jalankan tanpa merekam
 *   node pengendali.cjs --bab 3 --cepat    tanpa merekam DAN tanpa menunggu
 *                                          narasi: menguji aksinya saja
 *   node pengendali.cjs --bab 3 --dari 3-05   mulai dari langkah tertentu (uji)
 */
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const { Tangan, tidur } = require('./gerak.cjs');

const DIR = __dirname;
const ASAL = process.env.MRKABAR_URL || 'https://mrkabar.test';
const kredensial = require('../sandi.cjs');
let AKUN_AKTIF = { user: '', sandi: '' };
const LEBAR = 1920, TINGGI = 1080, ZOOM = 1.5;

const arg = (n) => {
  const i = process.argv.indexOf(n);
  return i === -1 ? null : (process.argv[i + 1] || true);
};
const CEPAT = process.argv.includes('--cepat');
const UJI = CEPAT || process.argv.includes('--uji');
const BAB = arg('--bab');
const DARI = arg('--dari');
// --potret: tangkapan layar di tengah dan akhir tiap langkah (rekam/potret/),
// untuk memeriksa lapisan dan tata letak tanpa menonton rekaman.
const POTRET = process.argv.includes('--potret');
const WAKTU = fs.existsSync(path.join(DIR, 'audio', 'waktu.json'))
  ? JSON.parse(fs.readFileSync(path.join(DIR, 'audio', 'waktu.json'), 'utf8'))
  : {};

/* ── pencari elemen di dalam halaman ─────────────────────────────────────── */

/**
 * Dijalankan DI DALAM halaman. Mengembalikan kotak-batas elemen yang dicari.
 * Lihat pengendali v1 untuk alasan tiap cabang.
 */
const CARI = (spek) => {
  // JANGAN memakai offsetParent di sini. Untuk elemen ber-position:fixed —
  // dan seluruh dialog Radix begitu — offsetParent SELALU null, sehingga
  // dialognya dianggap tidak terlihat. Akibatnya pencarian tidak pernah
  // dipersempit ke dalam dialog, klik bisa mendarat di menu bernama sama di
  // belakangnya, dan formulir yang sedang diisi tertutup tanpa galat apa pun.
  const tampak = (e) => {
    if (!e) return false;
    const b = e.getBoundingClientRect();
    if (b.width <= 0 || b.height <= 0) return false;
    const g = getComputedStyle(e);
    return g.visibility !== 'hidden' && g.display !== 'none' && g.opacity !== '0';
  };
  const bersih = (e) => (e.textContent || '').trim().replace(/\s+/g, ' ');
  const ruang = () => {
    // Pencarian bisa dibatasi ke sidebar. Perlu, karena nama menu seperti
    // "CEE" atau "Risiko" juga muncul sebagai teks di isi halaman — dan klik
    // yang mendarat di sel tabel bernama sama tidak menimbulkan galat apa pun,
    // ia hanya tidak membuka menunya.
    if (spek.dalam === 'sidebar') {
      const sidebar = document.querySelector('[data-sidebar="sidebar"]')
        || document.querySelector('aside') || document;
      // Kalau ada grup yang sedang ditandai dan pencarian ini memang untuk
      // isinya, jangan keluar dari grup itu.
      if (spek.dalamGrup) {
        const grup = sidebar.querySelector?.('[data-tutorial-menu]');
        if (grup) return grup;
      }
      return sidebar;
    }
    const d = [...document.querySelectorAll('[role="dialog"]')].filter(tampak);
    return d.length ? d[d.length - 1] : document;
  };

  // `ke` memilih kecocokan ke-berapa (mulai 0). Perlu untuk halaman yang
  // memuat delapan kotak pilihan serupa berjajar — simpulan per unsur di Form
  // 1c — yang tidak punya pembeda apa pun selain urutannya.
  const ke = spek.ke ?? 0;
  const ambil = (arr) => (arr.length > ke ? arr[ke] : null);

  let el = null;
  if (spek.dekat) {
    // Tombol bernama kembar di banyak kartu ("Isi", "Detail"): cari kartu
    // yang memuat teks `dekat`, lalu naik sampai bertemu tombolnya.
    const daun = [...document.querySelectorAll('p,span,div,td,h3,h4,li')]
      .filter((e) => e.children.length === 0 && tampak(e) && bersih(e).includes(spek.dekat));
    for (const d of daun) {
      let n = d.parentElement;
      for (let i = 0; i < 9 && n && !el; i++, n = n.parentElement) {
        el = [...n.querySelectorAll('button,a,[role=button]')].filter(tampak)
          .find((b) => bersih(b) === spek.teks || bersih(b).endsWith(spek.teks)) || null;
      }
      if (el) break;
    }
  } else if (spek.sel) {
    el = ambil([...ruang().querySelectorAll(spek.sel)].filter(tampak))
      || ambil([...document.querySelectorAll(spek.sel)].filter(tampak));
  } else if (spek.teks) {
    // Judul kartu di aplikasi ini bukan <h3> melainkan <div> biasa, jadi
    // pencarian lewat teks harus ikut melihat elemen daun — elemen yang tidak
    // punya anak, sehingga teksnya memang miliknya sendiri dan bukan gabungan
    // teks seluruh isi halaman. Tanpa itu, menyorot atau memperbesar sebuah
    // judul widget mustahil dilakukan.
    const kandidat = [
      ...ruang().querySelectorAll('button,a,[role=button],[role=option],[role=tab],td,th,h1,h2,h3,h4'),
      ...[...ruang().querySelectorAll('div,span,p,legend,label')].filter((e) => e.children.length === 0),
    ].filter(tampak);
    // `persis` mematikan pencocokan sebagian. WAJIB untuk nama menu: mencari
    // "Risiko" dengan cocok-sebagian justru mengenai "Apa itu Manajemen Risiko
    // / MR Kabar", dan yang terjadi bukan menu terbuka melainkan pindah
    // halaman — tanpa galat apa pun, dan sisa langkahnya gagal berantai.
    el = ambil(kandidat.filter((e) => bersih(e) === spek.teks));
    if (!el && !spek.persis) {
      el = ambil(kandidat.filter((e) => bersih(e).startsWith(spek.teks)))
        || ambil(kandidat.filter((e) => bersih(e).includes(spek.teks)));
    }
  } else if (spek.ph) {
    el = ambil([...ruang().querySelectorAll('input,textarea')]
      .filter(tampak).filter((e) => (e.placeholder || '').includes(spek.ph)));
  } else if (spek.kolomLabel) {
    // Kolom isian yang TIDAK punya id maupun placeholder — banyak di form
    // lapor. Dikenali dari label di atasnya, lalu diambil kolom pertama di
    // dalam pembungkus yang sama.
    const semuaLab = [...ruang().querySelectorAll('label')].filter(tampak);
    const lab = semuaLab.find((e) => bersih(e) === spek.kolomLabel)
      || semuaLab.find((e) => bersih(e).startsWith(spek.kolomLabel));
    if (lab) {
      let bungkus = lab.parentElement;
      for (let i = 0; i < 4 && bungkus; i++) {
        // <select> bayangan milik Radix Select (aria-hidden, untuk kiriman
        // formulir) DILEWATI: ia ikut lolos uji terlihat, dan mengkliknya
        // mendarat di luar dialog sehingga dialognya tertutup.
        const isian = [...bungkus.querySelectorAll('input,textarea,select,button[role=combobox]')]
          .filter(tampak).filter((e) => !e.closest('[aria-hidden="true"]') && e.type !== 'hidden')[0];
        if (isian) { el = isian; break; }
        bungkus = bungkus.parentElement;
      }
    }
  } else if (spek.label) {
    // Kotak centang penyebab & RTP: labelnya bersebelahan, bukan membungkus.
    const semuaLab = [...ruang().querySelectorAll('label')].filter(tampak);
    const lab = semuaLab.find((e) => bersih(e) === spek.label)
      || semuaLab.find((e) => bersih(e).startsWith(spek.label));
    if (lab) {
      const bungkus = lab.closest('div') || lab.parentElement;
      // Tombol Radix DULU, baru input asli.
      //
      // Radix tetap merender <input type=checkbox> yang sesungguhnya, tetapi
      // menggesernya keluar layar dengan transform: translateX(-100%). Input
      // itu MASIH BERUKURAN, jadi uji "terlihat" apa pun akan meloloskannya —
      // dan klik ke koordinatnya mendarat entah di mana. Gejalanya: kotak
      // centangnya tidak pernah tercentang, tanpa galat apa pun.
      el = bungkus?.querySelector('[role=checkbox]')
        || bungkus?.parentElement?.querySelector('[role=checkbox]')
        || [...(bungkus?.querySelectorAll('input[type=checkbox]') || [])]
          .find((c) => getComputedStyle(c).position !== 'absolute')
        || null;
    }
  }
  if (!el) return null;
  if (spek.tandaiEl) {
    // Penanda untuk lapisan (sorot, catat, gulir): elemen yang SAMA dengan
    // yang ditemukan di sini, tanpa mengulang aturan pencariannya.
    document.querySelectorAll('[data-tl-sasaran]').forEach((e) => e.removeAttribute('data-tl-sasaran'));
    el.setAttribute('data-tl-sasaran', '1');
  }
  if (spek.tandai) {
    document.querySelectorAll('[data-tutorial-menu]')
      .forEach((e) => e.removeAttribute('data-tutorial-menu'));
    // Wadah grup adalah <li> menu itu sendiri. JANGAN naik mencari elemen
    // yang memuat <ul>: saat grupnya masih tertutup, submenu-nya belum ada di
    // DOM sama sekali, sehingga pencarian itu naik terus sampai ke daftar
    // menu teratas — dan menandai SELURUH sidebar sebagai "grup ini". Anak
    // milik grup lain lalu dikira sudah terbuka, dan grup yang dituju tidak
    // pernah diklik.
    (el.closest('li') || el.parentElement)?.setAttribute('data-tutorial-menu', '1');
  }
  const b = el.getBoundingClientRect();
  return { x: b.left + b.width / 2, y: b.top + b.height / 2, atas: b.top, bawah: b.bottom, tinggi: b.height };
};

/* ── pengendali ──────────────────────────────────────────────────────────── */

class Perekam {
  constructor(page, tangan) {
    this.page = page;
    this.t = tangan;
    this.mulaiRekam = 0;
    this.waktu = [];
    this.peristiwa = [];
    this.terlambat = [];
    tangan.lapor = (j) => this.catatP(j);
  }

  /** Catat peristiwa bersuara (klik, ketukan, zoom, sukses ...) beserta detiknya. */
  catatP(j, data) {
    if (!this.mulaiRekam) return;
    this.peristiwa.push({ t: +this.detik().toFixed(3), j, ...(data || {}) });
  }

  detik() { return (Date.now() - this.mulaiRekam) / 1000; }

  /**
   * Tunggu sampai video pembuka sesudah masuk benar-benar hilang.
   *
   * Sesudah login berhasil, aplikasi menutupi seluruh layar dengan lapisan
   * berisi video logo sampai 12 detik. Selama itu SEMUA klik tetikus mendarat
   * di lapisan tersebut, bukan di menu — dan tidak ada galat apa pun, kliknya
   * hanya tidak terjadi. Ini sempat terlihat seperti selektor yang salah.
   */
  async tungguSplash(batas = 20000) {
    await this.page.waitForFunction(
      () => !document.querySelector('div[class*="z-[100]"][class*="inset-0"]'),
      { timeout: batas, polling: 300 },
    ).catch(() => {});
    await tidur(500);
  }

  async _cari(spek, sabar = 6000) {
    const habis = Date.now() + sabar;
    for (;;) {
      const r = await this.page.evaluate(CARI, spek);
      if (r) return r;
      if (Date.now() > habis) {
        // Ikut mencetak apa yang SEDANG terlihat. Tanpa ini, "tidak menemukan"
        // tidak memberi petunjuk apa pun tentang apakah menunya belum terbuka,
        // namanya berbeda, atau ruang pencariannya yang salah.
        const sekitar = await this.page.evaluate((s) => {
          const tampak = (e) => {
            const b = e.getBoundingClientRect();
            if (b.width <= 0 || b.height <= 0) return false;
            const g = getComputedStyle(e);
            return g.visibility !== 'hidden' && g.display !== 'none';
          };
          if (s.dalam === 'sidebar') {
            const akar = document.querySelector('[data-sidebar="sidebar"]')
              || document.querySelector('aside');
            if (!akar) return ['(sidebar tidak ketemu)'];
            return [...akar.querySelectorAll('a,button')].filter(tampak)
              .map((e) => e.textContent.trim().replace(/\s+/g, ' '))
              .filter(Boolean).slice(0, 24);
          }
          // Untuk pencarian di dalam formulir, yang berguna dilihat adalah
          // kolom apa saja yang SEDANG ada — bukan daftar tombol.
          const hasil = [];
          if (s.label) {
            const lab = [...document.querySelectorAll('label')].filter(tampak)
              .map((e) => e.textContent.trim().replace(/\s+/g, ' '));
            const kunci = s.label.split(' ').slice(0, 3).join(' ');
            const mirip = lab.filter((x) => x.includes(kunci) || x.startsWith(s.label.slice(0, 25)));
            hasil.push(`jumlah label: ${lab.length}`);
            hasil.push('yang mirip: ' + JSON.stringify(mirip.slice(0, 4)));
            // Kalau labelnya ADA tetapi kotak centangnya tidak bisa ditemukan
            // dari sana, itu masalah yang sama sekali berbeda.
            const l2 = [...document.querySelectorAll('label')]
              .find((e) => e.textContent.trim().replace(/\s+/g, ' ').startsWith(s.label.slice(0, 25)));
            if (l2) {
              const bungkus = l2.closest('div');
              hasil.push('label ketemu; sekitarnya: '
                + (bungkus ? bungkus.outerHTML.slice(0, 220) : '(tanpa pembungkus)'));
            }
          }
          if (s.sel) {
            // Ada di DOM tapi tidak lolos uji terlihat? Itu keterangan yang
            // paling menentukan, dan tanpa disebut mudah salah duga.
            const semua = [...document.querySelectorAll(s.sel)];
            hasil.push(`di DOM: ${semua.length}`);
            semua.slice(0, 2).forEach((e) => {
              const b = e.getBoundingClientRect();
              const g = getComputedStyle(e);
              hasil.push(`  kotak ${Math.round(b.width)}x${Math.round(b.height)}`
                + ` display=${g.display} visibility=${g.visibility}`);
            });
          }
          return hasil.concat([...document.querySelectorAll('input,textarea')]
            .filter(tampak).map((e) => e.id).filter(Boolean).slice(0, 20));
        }, spek).catch(() => []);
        throw new Error('tidak menemukan elemen: ' + JSON.stringify(spek)
          + '\n     yang terlihat: ' + JSON.stringify(sekitar));
      }
      await tidur(180);
    }
  }

  /**
   * Klik satu pilihan pada daftar yang sedang terbuka.
   *
   * Daftar pilihan Radix digambar di ujung <body> lewat portal, DI LUAR
   * formulirnya. Pencarian yang dibatasi ruang tertentu — dialog, sidebar —
   * karena itu tidak pernah menemukannya. Di sini sengaja dicari ke seluruh
   * dokumen, dan kalau daftarnya belum sempat terbuka, pemicunya diklik ulang.
   */
  async pilihOpsi(nilai, pemicu = null, sabar = 6000) {
    // Aplikasi ini memakai DUA macam daftar pilihan: Radix Select yang
    // menandai pilihannya role="option", dan kotak isian berpelengkap yang
    // pilihannya sekadar <button> di dalam kotak melayang. Keduanya harus
    // dicari, kalau tidak salah satunya selalu "tidak ketemu".
    const cari = () => this.page.evaluate((v) => {
      const kandidat = [
        ...document.querySelectorAll('[role="option"], [role="menuitem"]'),
        ...document.querySelectorAll('div[class*="z-50"] > button, div[class*="z-[50]"] > button'),
      ].filter((e) => e.offsetParent !== null);
      const el = kandidat.find((e) => e.textContent.trim().replace(/\s+/g, ' ') === v)
        || kandidat.find((e) => e.textContent.trim().replace(/\s+/g, ' ').startsWith(v));
      if (!el) return null;
      el.scrollIntoView({ block: 'nearest' });
      const b = el.getBoundingClientRect();
      return { x: b.left + b.width / 2, y: b.top + b.height / 2 };
    }, nilai);

    // Sesudah kursor sampai, posisi pilihannya DIPERIKSA ULANG sebelum diklik.
    // Daftar yang panjang — pemilih OPD punya 50 butir — bergulir sendiri saat
    // kursor melintasinya, sehingga butir yang tadi dihitung koordinatnya sudah
    // bergeser saat kursornya tiba. Akibatnya yang terpilih perangkat daerah
    // yang sama sekali lain, dan tidak ada galat apa pun.
    const klikTepat = async (r, _v) => {
      await this.t.ke(r.x, r.y);
      for (let i = 0; i < 4; i++) {
        const ulang = await cari();
        if (!ulang) break;
        if (Math.abs(ulang.y - this.t.y) < 12 && Math.abs(ulang.x - this.t.x) < 40) break;
        await this.t.ke(ulang.x, ulang.y);
      }
      await this.t.klikDiSini();
    };

    const habis = Date.now() + sabar;
    for (;;) {
      const r = await cari();
      if (r) { await klikTepat(r, nilai); return; }
      if (Date.now() > habis) {
        const ada = await this.page.evaluate(() => [
          ...document.querySelectorAll('[role="option"]'),
          ...document.querySelectorAll('div[class*="z-50"] > button, div[class*="z-[50]"] > button'),
        ].filter((e) => e.offsetParent !== null)
          .map((e) => e.textContent.trim().slice(0, 40)).slice(0, 8));
        throw new Error(`pilihan "${nilai}" tidak ketemu; yang terbuka: ${JSON.stringify(ada)}`);
      }
      if (pemicu) { await this.t.klikTitik(pemicu.x, pemicu.y); }
      await tidur(400);
    }
  }

  /**
   * Bawa elemen ke daerah nyaman di layar sebelum disentuh.
   *
   * Yang digulir bisa jendela, bisa juga wadah bergulir di dalam dialog —
   * ditentukan __bawaKeTengah di dalam halaman. Sesudahnya posisinya dicari
   * ulang, karena kotak-batas yang lama sudah tidak berlaku.
   */
  async _dekatkan(spek) {
    let r = await this._cari(spek);
    const ATAS = 138, BAWAH = TINGGI - 150;
    if (r.atas < ATAS || r.bawah > BAWAH) {
      await this.page.evaluate(CARI, { ...spek, tandaiEl: true });
      await this.page.evaluate(async () => {
        const el = document.querySelector('[data-tl-sasaran]');
        if (el) await window.__bawaKeTengah(el);
      });
      this.catatP('gulir');
      await tidur(260);
      r = await this._cari(spek);
    }
    return r;
  }

  async jalankan(aksi) {
    const p = this.page, t = this.t;
    switch (aksi.t) {
      case 'jeda':
        await tidur(aksi.ms || 600);
        break;

      case 'splash':
        await this.tungguSplash(aksi.ms || 20000);
        break;

      case 'judul':
        await p.evaluate((k, s, ms) => window.__judul(k, s, ms), aksi.kicker || '', aksi.teks, aksi.ms || 4600);
        this.catatP('judul');
        break;

      case 'buka':
        this.catatP('halaman');
        await p.goto(ASAL + aksi.url, { waitUntil: 'networkidle2' });
        await tidur(900);
        break;

      case 'menu': {
        // Menyusuri sidebar seperti orang: buka grupnya dulu, baru kliknya.
        //
        // Grup di sidebar ini TOMBOL BERSAKELAR. Kalau grupnya kebetulan sudah
        // terbuka, mengkliknya justru menutupnya dan anaknya jadi tidak
        // ketemu. Jadi sebelum sebuah grup diklik, dilihat dulu: kalau anak
        // yang dituju sudah kelihatan, grupnya tidak usah disentuh.
        // Penelusuran dibatasi ke dalam grup yang sedang dibuka, bukan ke
        // seluruh sidebar. Nama menu berulang di grup yang berbeda — "Risiko"
        // ada di Form Input DAN di Form Cetak, "CEE" juga — sehingga
        // pemeriksaan "anaknya sudah terlihat" bisa tertipu oleh anak milik
        // grup lain, lalu klik berikutnya justru menutup grup yang salah.
        // Penandanya ditempel pada wadah grup dan dibersihkan di akhir.
        await p.evaluate(() => document.querySelectorAll('[data-tutorial-menu]')
          .forEach((e) => e.removeAttribute('data-tutorial-menu')));

        for (let i = 0; i < aksi.jalur.length; i++) {
          const nama = aksi.jalur[i];
          const berikut = aksi.jalur[i + 1];
          const spek = { teks: nama, dalam: 'sidebar', persis: true, dalamGrup: i > 0 };
          const spekAnak = berikut
            ? { teks: berikut, dalam: 'sidebar', persis: true, dalamGrup: true }
            : null;

          // Grup ditandai LEBIH DULU, baru anaknya diperiksa. Kalau urutannya
          // dibalik, pemeriksaan pertama berjalan tanpa penanda apa pun dan
          // kembali mencari ke seluruh sidebar — persis kekeliruan yang mau
          // dihindari: "Risiko" milik Form Cetak dikira anak Form Input,
          // sehingga Form Input tidak pernah dibuka sama sekali.
          const r = await this._dekatkan(spek);
          await p.evaluate(CARI, { ...spek, tandai: true });

          if (spekAnak && await p.evaluate(CARI, spekAnak)) {
            continue;   // anaknya memang sudah terbuka, di grup yang benar
          }

          await t.klikTitik(r.x, r.y);

          if (spekAnak) {
            const batas = Date.now() + 6000;
            for (;;) {
              if (await p.evaluate(CARI, spekAnak)) break;
              if (Date.now() > batas) break;
              await tidur(200);
            }
          }
          await tidur(400);
        }
        await p.evaluate(() => document.querySelectorAll('[data-tutorial-menu]')
          .forEach((e) => e.removeAttribute('data-tutorial-menu')));
        this.catatP('halaman');
        await p.waitForNetworkIdle({ idleTime: 500, timeout: 15000 }).catch(() => {});
        await tidur(500);
        break;
      }

      case 'tunggu':
        await p.waitForFunction(
          (s) => !!document.querySelector(s),
          { timeout: aksi.ms || 15000 }, aksi.sel,
        );
        await tidur(400);
        break;

      case 'gulir':
        this.catatP('gulir');
        if (aksi.ke) {
          const r = await this._cari({ sel: aksi.ke });
          await p.evaluate(async (dy) => { await window.__gulir(Math.max(0, window.scrollY + dy)); },
            r.atas - 260 * ZOOM);
        } else {
          // px di naskah ditulis untuk tata letak 1280x720; di jendela terzoom
          // jaraknya dikali ZOOM supaya isi yang bergeser tetap sama banyak.
          await p.evaluate(async (px) => { await window.__gulir(Math.max(0, window.scrollY + px)); },
            (aksi.px || 400) * ZOOM);
        }
        await tidur(260);
        break;

      case 'zoom': {
        // Perbesaran dikerjakan pada halamannya, sehingga teksnya digambar
        // ulang lebih besar dan tetap tajam. Sesudah zoom, kotak-batas elemen
        // ikut berubah — pencarian berikutnya otomatis memakai yang baru.
        const spek = aksi.sel ? { sel: aksi.sel } : { teks: aksi.teks };
        await this._dekatkan(spek);
        const ok = await p.evaluate(async (s, sk, ms) => {
          // Daftar kandidatnya disamakan dengan CARI, termasuk elemen daun,
          // supaya judul kartu yang berupa <div> biasa ikut terjangkau.
          const kandidat = [
            ...document.querySelectorAll('button,a,label,td,th,h1,h2,h3,h4'),
            ...[...document.querySelectorAll('div,span,p')].filter((e) => e.children.length === 0),
          ];
          let el = s.sel ? document.querySelector(s.sel)
            : kandidat.find((e) => e.textContent.trim().replace(/\s+/g, ' ') === s.teks);
          // Judul kartu diperbesar bersama kartunya, bukan sendirian —
          // memperbesar judulnya saja membuat isi yang mau dilihat justru
          // terdorong keluar layar.
          if (el && s.teks) el = el.closest('[class*="rounded-xl"], [class*="rounded-lg"]') || el;
          return el ? await window.__zoom(el, sk, ms) : false;
        }, spek, aksi.skala || 1.45, aksi.ms || 700);
        if (!ok) throw new Error('zoom gagal: ' + JSON.stringify(spek));
        this.catatP('zoom');
        await tidur(aksi.tunggu ?? 400);
        break;
      }

      case 'zoomKeluar':
        this.catatP('zoomKeluar');
        await p.evaluate(async (ms) => { await window.__zoomKeluar(ms); }, aksi.ms || 620);
        await tidur(aksi.tunggu ?? 300);
        break;

      case 'sorot': {
        // Sorot itu HIASAN. Kalau sasarannya tidak ketemu, yang hilang cuma
        // sedikit gerak; rekaman jalan terus. Bandingkan dengan `klik` dan
        // `simpan`, yang wajib menghentikan rekaman.
        const spek = aksi.sel ? { sel: aksi.sel } : { teks: aksi.teks, dalam: aksi.dalam, persis: aksi.persis };
        let r;
        try {
          r = await this._dekatkan(spek);
        } catch (e) {
          console.log(`  (sorot dilewati, sasaran tidak ada: ${JSON.stringify(spek)})`);
          break;
        }
        await p.evaluate(CARI, { ...spek, tandaiEl: true });
        if (!aksi.diam) await t.ke(r.x + Math.min(40, r.tinggi), r.y + 4);
        await p.evaluate((ms, redup) => window.__sorot('[data-tl-sasaran]', ms, redup), aksi.ms || 2000, !!aksi.redup);
        this.catatP('sorot');
        await tidur(aksi.tunggu ?? 300);
        break;
      }

      case 'catat': {
        const spek = aksi.sel ? { sel: aksi.sel } : aksi.ph ? { ph: aksi.ph } : aksi.label ? { label: aksi.label }
          : aksi.kolomLabel ? { kolomLabel: aksi.kolomLabel } : { teks: aksi.teks };
        const r = await this._cari(spek, 1800).catch(() => null);
        if (!r || r.bawah < 60 || r.atas > TINGGI - 45) {
          console.log(`  (catatan dilewati, sasaran tidak terlihat: ${JSON.stringify(spek)})`);
          break;
        }
        await p.evaluate(CARI, { ...spek, tandaiEl: true });
        await p.evaluate((j, i, w, ms) => window.__catat('[data-tl-sasaran]', j, i, w, ms), aksi.judul, aksi.isi, aksi.jenis || 'awas', aksi.ms || 5000);
        this.catatP('catat', { jenis: aksi.jenis || 'awas' });
        break;
      }

      case 'kartu':
        await p.evaluate((j, i, w, ms) => window.__kartu(j, i, w, ms), aksi.judul, aksi.isi, aksi.jenis || 'info', aksi.ms || 5200);
        this.catatP('kartu');
        break;

      case 'lompat': {
        // Bilah lompat di kepala dialog formulir risiko: tombol bernomor
        // "2 Penyebab dan Dampak". Judul bagian di dalam formulir bertulisan
        // sama, jadi tombolnya dicari khusus di antara <button> dialog.
        const r = await p.evaluate((teks) => {
          const dlg = [...document.querySelectorAll('[role="dialog"]')].pop();
          if (!dlg) return null;
          const b = [...dlg.querySelectorAll('button')].find((e) => e.textContent.trim().replace(/\s+/g, ' ').endsWith(teks));
          if (!b) return null;
          const k = b.getBoundingClientRect();
          return { x: k.left + k.width / 2, y: k.top + k.height / 2 };
        }, aksi.teks);
        if (!r) { console.log(`  (bilah lompat "${aksi.teks}" tidak ada)`); break; }
        await t.klikTitik(r.x, r.y);
        this.catatP('gulir');
        await tidur(aksi.tunggu ?? 900);
        break;
      }

      case 'gulirKe': {
        await this._cari({ teks: aksi.teks }, 6000);
        await p.evaluate(CARI, { teks: aksi.teks, tandaiEl: true });
        this.catatP('gulir');
        await p.evaluate(async (atas) => {
          const el = document.querySelector('[data-tl-sasaran]');
          if (!el) return;
          const k = el.getBoundingClientRect();
          await window.__gulir(Math.max(0, window.scrollY + k.top - atas));
        }, (aksi.atas ?? 90) * ZOOM);
        await tidur(aksi.tunggu ?? 500);
        break;
      }

      case 'kombinasi': {
        await p.evaluate((lab) => window.__tombol(lab, 2600), aksi.label || aksi.kunci);
        this.catatP('kartu');
        await tidur(500);
        const k = aksi.kunci;
        for (const x of k.slice(0, -1)) await p.keyboard.down(x);
        await p.keyboard.press(k[k.length - 1]);
        this.catatP('ketuk');
        for (const x of k.slice(0, -1).reverse()) await p.keyboard.up(x);
        await tidur(aksi.tunggu ?? 900);
        break;
      }

      case 'ketikBebas':
        await t.ketik(aksi.teks, { laju: aksi.laju || 2, salahKetik: false });
        await tidur(aksi.tunggu ?? 300);
        break;

      case 'klik': {
        const spek = aksi.sel ? { sel: aksi.sel }
          : aksi.teks ? { teks: aksi.teks, dekat: aksi.dekat, persis: aksi.persis } : { ph: aksi.ph };
        const r = await this._dekatkan(spek);
        await t.klikTitik(r.x, r.y);
        await tidur(aksi.tunggu ?? 420);

        // Tombol simpan ditandai `simpan: true`. Sesudah diklik, halaman
        // diperiksa: kalau ada pesan galat validasi yang muncul, perekaman
        // DIHENTIKAN. Tanpa pemeriksaan ini, formulir yang gagal tersimpan
        // tidak menimbulkan tanda apa pun — langkahnya tetap "berhasil",
        // rekamannya jalan terus, dan barisnya baru ketahuan tidak ada
        // berjam-jam kemudian. Sudah pernah terjadi pada Form 1d: kolom
        // Penanggung Jawab wajib tetapi tidak diisi.
        if (aksi.simpan) {
          await tidur(700);
          const galat = await p.evaluate(() => {
            const tampak = (e) => {
              const b = e.getBoundingClientRect();
              return b.width > 0 && b.height > 0 && e.offsetParent !== null;
            };
            return [...document.querySelectorAll('.text-destructive, [role="alert"]')]
              .filter(tampak)
              .map((e) => e.textContent.trim())
              .filter((s) => s.length > 2)
              .slice(0, 4);
          });
          if (galat.length) {
            throw new Error('formulir menolak disimpan: ' + galat.join(' | '));
          }
          // Tanda "Tersimpan" di dekat tombolnya: ganjaran kecil yang membuat
          // penonton tahu langkah itu selesai, dan pemicu bunyi "berhasil".
          await p.evaluate((x, y) => window.__sukses(x, y, 'Tersimpan'), r.x, r.y - 14);
          this.catatP('sukses');
        }

        // `bukaDialog: true` untuk klik yang SEHARUSNYA membuka dialog atau
        // popover — widget Dasbor yang bisa ditelusuri, misalnya. Kalau tidak
        // terbuka, narasinya akan menjelaskan sesuatu yang tidak ada di layar,
        // dan itu jauh lebih buruk daripada rekaman yang berhenti. Sama
        // alasannya dengan pemeriksaan `simpan` di atas.
        if (aksi.bukaDialog) {
          await tidur(600);
          const terbuka = await p.evaluate(() => !!document.querySelector(
            '[role="dialog"], [data-radix-popper-content-wrapper]',
          ));
          if (!terbuka) {
            throw new Error('klik tidak membuka dialog/popover apa pun: ' + JSON.stringify(spek));
          }
        }
        break;
      }

      // Menutup dialog atau popover. Dipakai daripada mencari tombol "Close":
      // tombolnya bertulisan tak terlihat, letaknya berbeda antar komponen,
      // dan pada popover memang tidak ada sama sekali. Escape menutup keduanya
      // dan tidak menimbulkan galat kalau kebetulan tidak ada yang terbuka.
      case 'tekan': {
        await t.tekan(aksi.kunci || 'Escape');
        await tidur(aksi.tunggu ?? 700);
        break;
      }

      case 'ketik': {
        // `ke`: kolom kembar berplaceholder sama (mis. "mis. 2026" di Form 8
        // dan Form 9) dipilih menurut urutannya.
        const spek = aksi.sel ? { sel: aksi.sel, ke: aksi.ke }
          : aksi.ph ? { ph: aksi.ph, ke: aksi.ke } : { kolomLabel: aksi.kolomLabel };
        const r = await this._dekatkan(spek);
        await t.klikTitik(r.x, r.y);
        if (aksi.bersihkan) {
          await p.keyboard.down('Control'); await p.keyboard.press('KeyA'); await p.keyboard.up('Control');
          await tidur(120);
        }
        // {AKUN} dan {SANDI} tidak ditulis di naskah supaya naskahnya tetap
        // aman dibaca siapa pun dan disimpan di dalam repositori.
        const isi = aksi.teks.replace('{AKUN}', AKUN_AKTIF.user).replace('{SANDI}', AKUN_AKTIF.sandi);
        await t.ketik(isi, { laju: aksi.laju || 1 });
        await tidur(aksi.tunggu ?? 260);
        break;
      }

      case 'pilih': {
        // Kotak pilihan: diklik dulu, daftarnya muncul, baru pilihannya diklik.
        // Pemicunya kadang <input> ber-placeholder, kadang <button> berteks —
        // keduanya dipakai di aplikasi ini, jadi keduanya didukung.
        const r = await this._dekatkan(
          aksi.sel ? { sel: aksi.sel }
            : aksi.ph ? { ph: aksi.ph }
              : aksi.kolomLabel ? { kolomLabel: aksi.kolomLabel }
                : { teks: aksi.pemicu },
        );
        await t.klikTitik(r.x, r.y);
        await tidur(520);
        if (process.env.POTRET_AKSI) {
          await p.screenshot({ path: path.join(DIR, 'rekam', 'potret', `pilih-${String(aksi.nilai).slice(0, 12)}.png`) }).catch(() => {});
          console.log('  pemicu', JSON.stringify(r));
        }
        if (aksi.cari) { await t.ketik(aksi.cari, { laju: 1.6, salahKetik: false }); await tidur(450); }
        if (aksi.lewatKetik) {
          // Daftar yang sangat panjang - pemilih perangkat daerah punya 50
          // butir - bergulir sendiri begitu kursor melintasinya, sehingga
          // butir yang sudah dihitung koordinatnya bergeser sebelum kursornya
          // tiba dan yang terklik selalu butir lain. Radix menerima pencarian
          // lewat papan ketik: huruf yang diketik beruntun dikumpulkan jadi
          // satu kata, butirnya disorot, lalu dipilih dengan Enter. Kursor
          // tidak perlu menyeberangi daftarnya sama sekali.
          // Kursor DIKELUARKAN dulu dari daftar. Radix menaruh daftar tepat di
          // atas pemicunya, jadi kursor yang diam di sana berada di atas salah
          // satu butir; begitu ketik-cari menggulir daftar, peramban mengirim
          // gerak tetikus semu dan butir di bawah kursor yang tersorot - Enter
          // lalu memilih OPD lain (atau "Tidak ada OPD") tanpa galat apa pun.
          await t.ke(Math.max(36, r.x - 645), Math.min(TINGGI - 60, r.y + 45));
          await tidur(200);
          await t.ketik(aksi.nilai, { laju: 2.2, salahKetik: false });
          await tidur(500);
          await t.tekan('Enter');
          await tidur(aksi.tunggu ?? 450);
          break;
        }
        await this.pilihOpsi(aksi.nilai, r);
        await tidur(aksi.tunggu ?? 450);
        break;
      }

      case 'centang': {
        // Pasangan kotak centang + kolom uraian pada penyebab dan RTP.
        const c = await this._dekatkan({ label: aksi.label });
        await t.klikTitik(c.x, c.y);
        await tidur(420);
        if (aksi.teks) {
          const isi = await this._cari({
            sel: `[data-kategori="${aksi.label}"] textarea, textarea[data-kategori="${aksi.label}"]`,
          }, 1200).catch(() => null);
          if (isi) {
            await t.klikTitik(isi.x, isi.y);
          } else {
            // Kolom uraiannya tepat di bawah labelnya; dicari lewat posisi.
            const r = await p.evaluate((lab) => {
              const semua = [...document.querySelectorAll('label')];
              const l = semua.find((e) => e.textContent.trim() === lab);
              if (!l) return null;
              let n = l.closest('div');
              for (let i = 0; i < 4 && n; i++, n = n.parentElement) {
                const ta = n.querySelector('textarea');
                if (ta) {
                  const b = ta.getBoundingClientRect();
                  return { x: b.left + b.width / 2, y: b.top + b.height / 2, atas: b.top, bawah: b.bottom };
                }
              }
              return null;
            }, aksi.label);
            if (!r) throw new Error('kolom uraian untuk "' + aksi.label + '" tidak ketemu');
            await t.klikTitik(r.x, r.y);
          }
          await t.ketik(aksi.teks, { laju: aksi.laju || 1 });
        }
        await tidur(aksi.tunggu ?? 320);
        break;
      }

      case 'simpulan1c': {
        // Form 1c disimpan PER SUB UNSUR, bukan sekali untuk seluruh halaman.
        // Tiap baris punya kotak simpulan, kolom penjelasan, dan tombol
        // simpannya sendiri, dan aplikasi menerapkan tiga aturan:
        //   - simpulan Memadai tanpa pertentangan -> penjelasan dimatikan
        //   - simpulan Kurang Memadai            -> penjelasan boleh diisi
        //   - dua sumber bertentangan            -> penjelasan WAJIB
        // Baris yang sudah disimpan mengatup dan kotak pilihannya hilang,
        // sehingga baris berikutnya selalu menjadi yang teratas. Itulah yang
        // dipakai untuk menyusuri seluruh baris tanpa perlu tahu jumlahnya.
        const BARIS = () => {
          // Disaring dari ISI, bukan dari urutan di halaman. Kotak pilihan
          // pertama di dokumen ternyata pemilih bahasa di kepala halaman —
          // mengkliknya membuka daftar Bahasa/English, dan pencarian pilihan
          // "Kurang Memadai" tentu saja tidak menemukan apa pun.
          const cb = [...document.querySelectorAll('button[role="combobox"]')]
            .filter((e) => e.offsetParent !== null)
            .filter((e) => /Pilih simpulan|Kurang Memadai|Memadai/.test(e.textContent || ''));
          if (!cb.length) return null;
          let baris = cb[0];
          for (let i = 0; i < 8 && baris.parentElement; i++) {
            baris = baris.parentElement;
            if (baris.querySelector('textarea')) break;
          }
          const ta = baris.querySelector('textarea');
          const simpan = [...baris.querySelectorAll('button')]
            .find((e) => e.textContent.trim() === 'Simpan');
          const kotak = (e) => {
            if (!e) return null;
            const b = e.getBoundingClientRect();
            return { x: b.left + b.width / 2, y: b.top + b.height / 2, atas: b.top, bawah: b.bottom };
          };
          cb[0].scrollIntoView({ block: 'center' });
          return {
            sisa: cb.length,
            bertentangan: /Kedua sumber bertentangan/.test(baris.textContent || ''),
            adaKelemahan: !!baris.querySelector('ul li'),
            taMati: ta ? ta.disabled : true,
            pilih: kotak(cb[0]),
            ta: kotak(ta),
            simpan: kotak(simpan),
          };
        };

        let dikerjakan = 0;
        const batas = aksi.maks || 60;
        for (;;) {
          const b = await p.evaluate(BARIS);
          if (!b || dikerjakan >= batas) break;
          await tidur(200);

          // Simpulan mengikuti keadaan baris, bukan ditulis satu per satu di
          // naskah: bertentangan atau ada kelemahan dokumen -> Kurang Memadai.
          const nilai = (b.bertentangan || b.adaKelemahan) ? 'Kurang Memadai' : 'Memadai';
          await t.klikTitik(b.pilih.x, b.pilih.y);
          await tidur(480);
          await this.pilihOpsi(nilai, b.pilih);
          await tidur(420);

          const b2 = await p.evaluate(BARIS);
          if (b2 && !b2.taMati && b2.ta) {
            await t.klikTitik(b2.ta.x, b2.ta.y);
            await t.ketik(
              b.bertentangan ? aksi.dasarBertentangan : aksi.dasarLemah,
              { laju: aksi.laju || 3.0, salahKetik: false },
            );
            await tidur(220);
          }

          const b3 = await p.evaluate(BARIS);
          if (!b3 || !b3.simpan) break;
          await t.klikTitik(b3.simpan.x, b3.simpan.y);

          dikerjakan++;
          // Berkurangnya jumlah kotak pilihan itulah tanda barisnya tersimpan.
          // DITUNGGU, bukan diperiksa sekali: penyimpanan lewat Inertia dan
          // penggambaran ulangnya bisa lewat satu detik pada halaman 1c yang
          // isinya delapan sub unsur. Versi sebelumnya memeriksa tepat 900 md
          // sesudah klik dan menyimpulkan gagal padahal barisnya tersimpan
          // beberapa ratus milidetik kemudian — perekaman berhenti di tengah
          // jalan tanpa ada yang benar-benar salah.
          let b4 = null;
          for (let i = 0; i < 24; i++) {
            await tidur(400);
            b4 = await p.evaluate(BARIS);
            if (!b4 || b4.sisa < b.sisa) break;
          }
          if (b4 && b4.sisa >= b.sisa) {
            // Tanda bintang penanda kolom wajib juga ber-class text-destructive
            // dan selalu ada di layar; kalau ikut terbaca, pesan galatnya jadi
            // "tidak tersimpan. *" yang tidak menerangkan apa pun.
            const galat = await p.evaluate(() => [...document.querySelectorAll('.text-destructive')]
              .filter((e) => e.offsetParent !== null)
              .map((e) => e.textContent.trim())
              .filter((s) => s.length > 2)[0] || '(tidak ada pesan galat di layar)');
            throw new Error(`baris simpulan ke-${dikerjakan} tidak tersimpan. ${galat}`);
          }
        }
        process.stdout.write(`      (${dikerjakan} sub unsur disimpulkan)\n`);
        await tidur(aksi.tunggu ?? 600);
        break;
      }

      case 'kuesioner': {
        // Kuesioner 1a: 37 pertanyaan, tiap pertanyaan punya empat tombol
        // berlabel 1 sampai 4. Tombolnya tidak punya pengenal sendiri, jadi
        // dicari lewat nomor urut pertanyaannya.
        const r = await p.evaluate((nomor, nilai) => {
          // Yang dicari WADAH LANGSUNG keempat tombol jawaban. Menyaring
          // dengan querySelectorAll akan ikut menangkap semua pembungkus di
          // atasnya — pernah terhitung 76 baris untuk 37 pertanyaan, dan
          // akibatnya nomor pertanyaan meleset tanpa ada galat apa pun.
          // Karena itu yang diperiksa hanya anak LANGSUNG.
          const punyaAnak = (par, n) => [...par.children]
            .some((c) => c.tagName === 'BUTTON' && c.textContent.trim() === n);
          const baris = [...new Set(
            [...document.querySelectorAll('button')]
              .filter((b) => b.textContent.trim() === '1')
              .map((b) => b.parentElement),
          )].filter((par) => par && ['1', '2', '3', '4'].every((n) => punyaAnak(par, n)));

          const el = baris[nomor - 1];
          if (!el) return null;
          const tb = [...el.children]
            .find((b) => b.tagName === 'BUTTON' && b.textContent.trim() === String(nilai));
          if (!tb) return null;
          tb.scrollIntoView({ block: 'center' });
          const b = tb.getBoundingClientRect();
          return { x: b.left + b.width / 2, y: b.top + b.height / 2, jumlah: baris.length };
        }, aksi.nomor, aksi.nilai);
        if (!r) throw new Error(`pertanyaan ke-${aksi.nomor} atau nilai ${aksi.nilai} tidak ketemu`);
        await tidur(240);
        await t.klikTitik(r.x, r.y);
        await tidur(aksi.tunggu ?? 240);
        break;
      }

      case 'select': {
        // <select> asli — tidak bisa "diklik" seperti kotak pilihan Radix.
        //
        // Yang dituju dikenali dari ISI pilihannya, bukan dari urutannya di
        // halaman. Sesudah satu baris ditambahkan, daftar baris yang sudah ada
        // ikut memunculkan <select> lain, sehingga "select pertama" berpindah
        // arti tanpa ada yang berubah di naskah.
        const nomor = await p.evaluate((cocok) => {
          const semua = [...document.querySelectorAll('select')];
          const i = semua.findIndex((s) => [...s.options]
            .some((o) => o.textContent.trim().startsWith(cocok)));
          if (i === -1) return null;
          semua[i].setAttribute('data-tutorial-select', '1');
          const b = semua[i].getBoundingClientRect();
          return { i, x: b.left + b.width / 2, y: b.top + b.height / 2 };
        }, aksi.cocokOpsi);
        if (!nomor) throw new Error('select berisi pilihan "' + aksi.cocokOpsi + '" tidak ketemu');
        await t.ke(nomor.x, nomor.y);
        this.catatP('klik');
        await p.select('select[data-tutorial-select="1"]', aksi.nilai);
        await p.evaluate(() => document.querySelector('select[data-tutorial-select="1"]')
          ?.removeAttribute('data-tutorial-select'));
        await tidur(aksi.tunggu ?? 500);
        break;
      }

      case 'unggah': {
        // Melampirkan berkas dari cakram ke kolom unggah. Dipakai menguji
        // bukti dukung; input berkas tidak bisa diisi lewat ketikan.
        const el = await p.$(aksi.sel || 'input[type=file]');
        if (!el) throw new Error('kolom unggah tidak ketemu');
        await el.uploadFile(path.resolve(DIR, aksi.berkas));
        await tidur(aksi.tunggu ?? 1500);
        break;
      }

      case 'ttd': {
        // Baris penanda tangan pada Data Umum: tiga kolom tanpa id, dibedakan
        // hanya oleh urutan barisnya. Dicari lewat placeholder + nomor baris.
        const PH = { jabatan: 'mis. Sekretaris', nama: 'Nama lengkap & gelar', nip: 'NIP' };
        for (const kolom of ['jabatan', 'nama', 'nip']) {
          if (!aksi[kolom]) continue;
          const r = await p.evaluate((ph, i) => {
            const semua = [...document.querySelectorAll('input')]
              .filter((e) => (e.placeholder || '') === ph);
            const el = semua[i];
            if (!el) return null;
            el.scrollIntoView({ block: 'center' });
            const b = el.getBoundingClientRect();
            return { x: b.left + b.width / 2, y: b.top + b.height / 2 };
          }, PH[kolom], aksi.baris);
          if (!r) throw new Error(`kolom ${kolom} baris penanda tangan ke-${aksi.baris} tidak ketemu`);
          await tidur(260);
          await t.klikTitik(r.x, r.y);
          await t.ketik(aksi[kolom], { laju: aksi.laju || 1.5, salahKetik: false });
          await tidur(180);
        }
        break;
      }

      case 'matriks': {
        // Dialog 5x5: pilih dulu titik yang sedang diisi (Inheren /
        // Residual/Current / Target), baru klik selnya.
        //
        // Sel matriks TIDAK punya atribut penanda — isinya cuma angka peringkat
        // 1-25 di dalam <td role="button">. Karena itu dicari lewat posisi, dan
        // aplikasinya tidak perlu diubah demi perekaman ini. Susunannya: baris
        // tbody urut Kemungkinan 5 di atas sampai 1 di bawah, dan tiap baris
        // berisi lima <td> urut Dampak 1 sampai 5.
        const tb = await this._cari({ teks: aksi.titik }, 8000);
        await t.klikTitik(tb.x, tb.y);
        await tidur(650);

        const sel = await p.evaluate((d, k) => {
          const dlg = [...document.querySelectorAll('[role="dialog"]')].pop() || document;
          const baris = [...dlg.querySelectorAll('tbody tr')];
          if (baris.length < 5) return null;
          const tr = baris[5 - k];               // k=5 -> baris pertama
          const td = tr?.querySelectorAll('td')[d - 1];
          if (!td) return null;
          const b = td.getBoundingClientRect();
          return {
            x: b.left + b.width / 2, y: b.top + b.height / 2,
            atas: b.top, bawah: b.bottom, angka: td.textContent.trim().slice(0, 4),
          };
        }, aksi.d, aksi.k);
        if (!sel) throw new Error(`sel matriks D${aksi.d} K${aksi.k} tidak ketemu`);
        await t.klikTitik(sel.x, sel.y);
        this.catatP('ping', { d: aksi.d, k: aksi.k });
        await tidur(aksi.tunggu ?? 750);
        break;
      }

      default:
        throw new Error('aksi tidak dikenal: ' + aksi.t);
    }
  }

  /** Lama narasi satu langkah = jumlah (potongan + jeda) seluruh kalimatnya. */
  lamaNarasi(l) {
    return (l.narasi || []).reduce((s, n) => s + (WAKTU[n.id] ? WAKTU[n.id].dur + WAKTU[n.id].jeda : 0), 0);
  }

  /** Detik (relatif awal langkah) saat kata ke-n diucapkan di kalimat ke-k. */
  waktuKata(l, k, kata, n = 1) {
    let off = 0;
    for (let i = 0; i < k; i++) {
      const w = WAKTU[l.narasi[i].id];
      if (w) off += w.dur + w.jeda;
    }
    const w = WAKTU[l.narasi[k]?.id];
    if (!w) return off;
    const kk = kata.toLowerCase();
    let c = 0;
    for (const x of w.kata) {
      const s = x.w.toLowerCase().replace(/[^a-z0-9-]/g, '');
      if (s.startsWith(kk) && ++c === n) return off + x.t;
    }
    console.log(`  PERINGATAN: kata "${kata}" #${n} tidak ada di ${l.narasi[k].id}`);
    return off;
  }

  async langkah(l) {
    const mulai = this.detik();
    const lama = CEPAT ? 0 : this.lamaNarasi(l);
    const adaDialog = () => this.page.evaluate(() =>
      [...document.querySelectorAll('button')].some((e) => {
        const b = e.getBoundingClientRect();
        return b.height > 0 && e.textContent.trim() === 'Batal';
      }));
    const terjadwal = [];

    for (const a of l.aksi || []) {
      // Aksi yang terikat kata: tunggu sampai katanya diucapkan.
      if (a.pada && !CEPAT) {
        const sasaran = mulai + this.waktuKata(l, a.pada[0], a.pada[1], a.pada[2] || 1) + (a.geser || 0);
        const kurang = sasaran - this.detik();
        if (a.latar) {
          // Hiasan: dijadwalkan, aksi berikutnya tidak ikut menunggu.
          terjadwal.push(new Promise((res) => setTimeout(() => this.jalankan(a).catch((e) => {
            console.log(`  (hiasan gagal: ${e.message.split('\n')[0]})`);
          }).finally(res), Math.max(0, kurang * 1000))));
          continue;
        }
        if (kurang > 0) await tidur(kurang * 1000);
        else if (kurang < -1.2) {
          this.terlambat.push({ langkah: l.id, aksi: a.t, detik: +(-kurang).toFixed(1) });
          console.log(`  (terlambat ${(-kurang).toFixed(1)} dtk: ${a.t} ${a.pada[1]})`);
        }
      }
      const dialogSebelum = await adaDialog();
      try {
        if (a.cadangan) {
          await this.jalankan(a).catch((e) => console.log(`  (dilewati: ${e.message.split('\n')[0].slice(0, 120)})`));
        } else {
          await this.jalankan(a);
        }
      } catch (e) {
        throw new Error(`langkah ${l.id}, aksi ${JSON.stringify(a).slice(0, 200)}\n  -> ${e.message}`);
      }
      if (process.env.POTRET_AKSI) {
        this._noAksi = (this._noAksi || 0) + 1;
        await this.page.screenshot({ path: path.join(DIR, 'rekam', 'potret', `${l.id}-aksi${String(this._noAksi).padStart(2, '0')}-${a.t}.png`) }).catch(() => {});
      }
      if (dialogSebelum && !a.tutupDialog && !a.simpan && !a.latar && a.t !== 'tekan' && !(await adaDialog())) {
        throw new Error(`langkah ${l.id}: formulir TERTUTUP sesudah aksi ${JSON.stringify(a).slice(0, 160)}`);
      }
    }
    if (POTRET) await this.page.screenshot({ path: path.join(DIR, 'rekam', 'potret', `${l.id}-a.png`) }).catch(() => {});
    await Promise.all(terjadwal);
    if (POTRET) await this.page.screenshot({ path: path.join(DIR, 'rekam', 'potret', `${l.id}-b.png`) }).catch(() => {});
    const kurang = lama - (this.detik() - mulai);
    if (kurang > 0) await tidur(kurang * 1000);
    await tidur(CEPAT ? 100 : 180);
    const gambar = this.detik() - mulai;
    this.waktu.push({ id: l.id, mulai: +mulai.toFixed(3), selesai: +this.detik().toFixed(3), narasi: +lama.toFixed(3) });
    const sunyi = gambar - lama;
    const tanda = !CEPAT && sunyi > 6 ? '  <-- SUNYI ' + sunyi.toFixed(0) + ' dtk' : '';
    process.stdout.write(`  ${l.id.padEnd(7)} ${mulai.toFixed(1).padStart(6)}s  narasi ${lama.toFixed(1).padStart(5)}  gambar ${gambar.toFixed(1).padStart(5)}${tanda}\n`);
  }
}

/* ── jalan ───────────────────────────────────────────────────────────────── */

(async () => {
  const naskah = JSON.parse(fs.readFileSync(path.join(DIR, 'naskah.json'), 'utf8'));
  const bab = naskah.bab.find((b) => b.nomor === String(BAB));
  if (!bab) { console.log('bab tidak ketemu:', BAB); process.exit(1); }
  if (!Object.keys(WAKTU).length && !CEPAT) console.log('CATATAN: audio/waktu.json belum ada.');

  const huruf = (n) => 'data:font/ttf;base64,' + fs.readFileSync(path.join(DIR, '..', '..', 'video-edukasi', 'v6', 'fonts', n)).toString('base64');
  const HURUF = `window.__ZOOM = ${ZOOM}; window.__HURUF = ${JSON.stringify({ bebas: huruf('BebasNeue-Regular.ttf'), jakarta: huruf('PlusJakartaSans[wght].ttf') })};`;

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--ignore-certificate-errors', `--window-size=${LEBAR},${TINGGI + 120}`, '--hide-scrollbars'],
    defaultViewport: { width: LEBAR, height: TINGGI, deviceScaleFactor: 1 },
  });
  const page = await browser.newPage();
  await page.evaluateOnNewDocument(HURUF + '\n' + fs.readFileSync(path.join(DIR, 'lapisan.js'), 'utf8'));

  const AKUN = bab.akun === 'LAPOR' ? { user: 'LAPOR', sandi: '' } : kredensial(bab.akun || 'PIC_INSPEKTORAT');
  AKUN_AKTIF = AKUN;
  console.log(`bab ${bab.nomor} — ${bab.judul}  (akun ${AKUN.user})`);

  await page.goto(`${ASAL}/login`, { waitUntil: 'networkidle2' });
  await page.waitForSelector('#username');
  if (!bab.dariLogin) {
    await page.type('#username', AKUN.user, { delay: 10 });
    await page.type('#password', AKUN.sandi, { delay: 10 });
    await page.click('button[type="submit"]');
    await tidur(3000);
    if (/\/login/.test(page.url())) { console.log('GAGAL MASUK'); await browser.close(); process.exit(1); }
  }

  const tangan = new Tangan(page);
  const rec = new Perekam(page, tangan);
  if (!bab.dariLogin) {
    await rec.tungguSplash();
    // Halaman awal tiap bab: Dasbor dengan menu tertutup, supaya setiap bab
    // dibuka dari keadaan yang sama.
    await page.goto(`${ASAL}/dashboard`, { waitUntil: 'networkidle2' });
    await tidur(1200);
  }
  await page.evaluate((no, t) => window.__chip(no, t), bab.nomor, bab.chip || bab.judul);
  await page.evaluate((x, y) => window.__kursorKe(x, y), tangan.x, tangan.y);

  fs.mkdirSync(path.join(DIR, 'rekam', 'potret'), { recursive: true });
  let screencast = null;
  if (!UJI) {
    const berkas = path.join(DIR, 'rekam', `bab-${bab.nomor}.webm`);
    screencast = await page.screencast({ path: berkas, fps: 30, quality: 24 });
    console.log('merekam ke', berkas);
  }
  rec.mulaiRekam = Date.now();
  await tidur(700);

  let langkah = bab.langkah;
  if (DARI) langkah = langkah.slice(Math.max(0, langkah.findIndex((l) => l.id === DARI)));
  try {
    for (const l of langkah) await rec.langkah(l);
  } catch (e) {
    console.error('\nBERHENTI:', e.message);
    await page.screenshot({ path: path.join(DIR, 'rekam', `galat-bab-${bab.nomor}.png`) }).catch(() => {});
    process.exitCode = 1;
  }

  await tidur(900);
  if (screencast) await screencast.stop();
  if (!UJI) {
    fs.writeFileSync(path.join(DIR, 'rekam', `waktu-${bab.nomor}.json`), JSON.stringify(rec.waktu, null, 1));
    fs.writeFileSync(path.join(DIR, 'rekam', `peristiwa-${bab.nomor}.json`), JSON.stringify(rec.peristiwa));
  }
  if (rec.terlambat.length) console.log('aksi terlambat:', JSON.stringify(rec.terlambat));
  await browser.close();
  console.log(process.exitCode ? 'GAGAL.' : 'selesai.');
})();
