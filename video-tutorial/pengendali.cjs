/**
 * Pengendali perekaman — menyetir aplikasi sungguhan sambil merekam layarnya.
 *
 * Cara kerjanya, ringkas:
 *   naskah.json  ->  daftar bagian, tiap bagian daftar langkah,
 *                    tiap langkah punya kalimat narasi + daftar aksi
 *   audio/waktu.json -> lama tiap kalimat narasi (sudah disuarakan lebih dulu)
 *
 * Narasi disuarakan DULU, baru gambarnya direkam. Itu dibalik dari cara yang
 * biasa, dan sengaja: kalau gambarnya duluan, narasi harus dipaksa muat ke
 * dalam durasi yang sudah terlanjur ada, dan hasilnya selalu terasa terburu.
 * Dengan urutan ini, pengendali justru MENUNGGU sampai narasi langkah itu
 * habis sebelum lanjut, sehingga gambar dan suara pasti sejajar tanpa perlu
 * digeser-geser saat menyunting.
 *
 *   node pengendali.cjs --uji            jalan tanpa merekam, untuk menguji
 *   node pengendali.cjs --bagian II      satu bagian saja
 *   node pengendali.cjs                  seluruhnya, direkam
 */
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const { Tangan, tidur } = require('./gerak.cjs');

const DIR = __dirname;
const ASAL = process.env.MRKABAR_URL || 'https://mrkabar.test';
const kredensial = require('./sandi.cjs');
// Kredensial yang sedang dipakai, disimpan di ruang lingkup modul karena
// aksi `ketik` menggantikan {AKUN} dan {SANDI} di dalam naskah dengannya.
let AKUN_AKTIF = { user: '', sandi: '' };
const LEBAR = 1920, TINGGI = 1080;

const arg = (n) => {
  const i = process.argv.indexOf(n);
  return i === -1 ? null : (process.argv[i + 1] || true);
};
const UJI = process.argv.includes('--uji');
const BAGIAN = arg('--bagian');
// Satu pengendali melayani beberapa video. Naskahnya bisa ditunjuk supaya
// video Lapor tidak perlu menyalin seluruh perkakas ini.
const NASKAH = arg('--naskah') || 'naskah.json';
// Berkas rekaman diberi awalan sesuai naskahnya, supaya rekaman dua video
// tidak saling menimpa di dalam folder yang sama.
const AWALAN = NASKAH === 'naskah.json' ? '' : NASKAH.replace(/^naskah-|\.json$/g, '') + '-';

/* ── pencari elemen di dalam halaman ─────────────────────────────────────── */

/**
 * Dijalankan DI DALAM halaman. Mengembalikan kotak-batas elemen yang dicari.
 * Spesifikasinya sengaja beragam karena formulir aplikasi ini memakai banyak
 * pola: ada yang punya id, ada yang cuma punya teks, ada kotak centang yang
 * hanya dikenali lewat label di sebelahnya.
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
  if (spek.sel) {
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
      ...[...ruang().querySelectorAll('div,span,p,legend')].filter((e) => e.children.length === 0),
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
        const isian = [...bungkus.querySelectorAll('input,textarea,select')].filter(tampak)[0];
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
    const klikTepat = async (r, v) => {
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
    const ATAS = 150, BAWAH = TINGGI - 170;
    if (r.atas < ATAS || r.bawah > BAWAH) {
      await this.page.evaluate(async (s) => {
        // Elemen dicari dengan aturan yang sama seperti CARI, disederhanakan:
        // yang dibutuhkan cuma satu elemen untuk digulir ke tengah.
        const tampak = (e) => {
          const b = e.getBoundingClientRect();
          if (b.width <= 0 || b.height <= 0) return false;
          const g = getComputedStyle(e);
          return g.visibility !== 'hidden' && g.display !== 'none';
        };
        let el = null;
        if (s.sel) el = [...document.querySelectorAll(s.sel)].find(tampak);
        else if (s.ph) el = [...document.querySelectorAll('input,textarea')]
          .filter(tampak).find((e) => (e.placeholder || '').includes(s.ph));
        else if (s.teks) el = [...document.querySelectorAll('button,a,[role=button],td,th')]
          .filter(tampak).find((e) => e.textContent.trim().replace(/\s+/g, ' ') === s.teks);
        else if (s.label) {
          // Kotak centang penyebab/pemicu berada jauh di bawah garis layar.
          // Tanpa cabang ini, penggulirnya tidak pernah dipanggil dan klik
          // mendarat di luar viewport - tanpa galat, kotaknya sekadar tidak
          // pernah tercentang.
          const lab = [...document.querySelectorAll('label')].filter(tampak)
            .find((e) => e.textContent.trim().replace(/\s+/g, ' ') === s.label
              || e.textContent.trim().replace(/\s+/g, ' ').startsWith(s.label));
          const bungkus = lab?.closest('div') || lab?.parentElement;
          el = bungkus?.querySelector('[role=checkbox]') || lab || null;
        }
        else if (s.kolomLabel) {
          const lab = [...document.querySelectorAll('label')].filter(tampak)
            .find((e) => e.textContent.trim().replace(/\s+/g, ' ').startsWith(s.kolomLabel));
          let bungkus = lab?.parentElement;
          for (let i = 0; i < 4 && bungkus && !el; i++) {
            el = [...bungkus.querySelectorAll('input,textarea,select')].filter(tampak)[0];
            bungkus = bungkus.parentElement;
          }
        }
        if (el) await window.__bawaKeTengah(el);
      }, spek);
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
        await p.evaluate((n, s, ms) => window.__judul(n, s, ms), aksi.nomor || '', aksi.teks, aksi.ms || 4500);
        break;

      case 'buka':
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
        if (aksi.ke) {
          const r = await this._cari({ sel: aksi.ke });
          await p.evaluate(async (dy) => { await window.__gulir(Math.max(0, window.scrollY + dy)); },
            r.atas - 260);
        } else {
          await p.evaluate(async (px) => { await window.__gulir(Math.max(0, window.scrollY + px)); },
            aksi.px || 400);
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
        await tidur(aksi.tunggu ?? 400);
        break;
      }

      case 'zoomKeluar':
        await p.evaluate(async (ms) => { await window.__zoomKeluar(ms); }, aksi.ms || 620);
        await tidur(aksi.tunggu ?? 300);
        break;

      case 'sorot': {
        // Sorot itu HIASAN — kursor bergerak, cincin menyala. Kalau sasarannya
        // tidak ketemu, yang hilang cuma sedikit gerak; membatalkan rekaman
        // tiga belas menit karenanya jelas tidak sepadan. Bandingkan dengan
        // `klik` dan `simpan`, yang memang wajib menghentikan rekaman karena
        // kegagalannya mengubah ISI video, bukan sekadar hiasnya.
        const spek = aksi.sel ? { sel: aksi.sel } : { teks: aksi.teks };
        try {
          await this._dekatkan(spek);
        } catch (e) {
          console.log(`  (sorot dilewati, sasaran tidak ada: ${JSON.stringify(spek)})`);
          await tidur(aksi.ms || 2000);
          break;
        }
        const ok = await p.evaluate((s, ms) => {
          const el = document.querySelector(s);
          return el ? window.__sorot(el, ms) : false;
        }, aksi.sel || null, aksi.ms || 2000);
        if (!ok && aksi.teks) {
          const r = await this._cari(spek);
          await t.ke(r.x, r.y);
        }
        await tidur(aksi.tunggu ?? 300);
        break;
      }

      case 'klik': {
        const spek = aksi.sel ? { sel: aksi.sel } : aksi.teks ? { teks: aksi.teks } : { ph: aksi.ph };
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
        const spek = aksi.sel ? { sel: aksi.sel }
          : aksi.ph ? { ph: aksi.ph } : { kolomLabel: aksi.kolomLabel };
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
        if (aksi.cari) { await t.ketik(aksi.cari, { laju: 1.6, salahKetik: false }); await tidur(450); }
        if (aksi.lewatKetik) {
          // Daftar yang sangat panjang - pemilih perangkat daerah punya 50
          // butir - bergulir sendiri begitu kursor melintasinya, sehingga
          // butir yang sudah dihitung koordinatnya bergeser sebelum kursornya
          // tiba dan yang terklik selalu butir lain. Radix menerima pencarian
          // lewat papan ketik: huruf yang diketik beruntun dikumpulkan jadi
          // satu kata, butirnya disorot, lalu dipilih dengan Enter. Kursor
          // tidak perlu menyeberangi daftarnya sama sekali.
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
        await tidur(aksi.tunggu ?? 750);
        break;
      }

      default:
        throw new Error('aksi tidak dikenal: ' + aksi.t);
    }
  }

  async langkah(l, lamaNarasi) {
    const mulai = this.detik();
    // Formulir tambah data TIDAK selalu berupa [role=dialog]: sebagian halaman
    // memunculkannya sebagai panel di dalam halaman. Yang dipakai sebagai
    // penanda "formulir sedang terbuka" karena itu tombol Batal-nya, yang ada
    // di kedua bentuk.
    const adaDialog = () => this.page.evaluate(() =>
      [...document.querySelectorAll('button')].some((e) => {
        const b = e.getBoundingClientRect();
        return b.height > 0 && e.textContent.trim() === 'Batal';
      }));

    for (const a of l.aksi || []) {
      const dialogSebelum = await adaDialog();
      try {
        await this.jalankan(a);
      } catch (e) {
        throw new Error(`langkah ${l.id}, aksi ${JSON.stringify(a)}\n  -> ${e.message}`);
      }
      // Formulir yang tiba-tiba tertutup adalah kegagalan paling menipu di
      // sini: tidak ada galat, langkah berikutnya sekadar "tidak menemukan
      // kolom", dan penyebabnya sudah lewat beberapa aksi sebelumnya. Jadi
      // diperiksa tepat setelah aksi yang menutupnya.
      if (dialogSebelum && !a.tutupDialog && !a.simpan && !(await adaDialog())) {
        throw new Error(`langkah ${l.id}: formulir TERTUTUP sesudah aksi `
          + `${JSON.stringify(a)} — kemungkinan kliknya mendarat di luar dialog`);
      }
    }
    // Tunggu sampai narasi langkah ini habis; inilah yang menjaga gambar dan
    // suara tetap sejajar tanpa disunting.
    const kurang = lamaNarasi - (this.detik() - mulai);
    if (kurang > 0) await tidur(kurang * 1000);
    await tidur(250);
    const lamaGambar = this.detik() - mulai;
    this.waktu.push({ id: l.id, mulai, selesai: this.detik(), narasi: lamaNarasi, gambar: lamaGambar });
    // Sunyi = bagian gambar yang tidak ada narasinya. Sedikit sunyi itu perlu
    // supaya tidak sesak, tetapi lebih dari belasan detik terasa seperti video
    // yang menggantung. Ditandai di sini supaya bisa dibetulkan sebelum
    // direkam sungguhan — entah dengan mempercepat ketikan atau menambah
    // kalimat, bukan dengan memotongnya belakangan saat menyunting.
    const sunyi = lamaGambar - lamaNarasi;
    const tanda = sunyi > 14 ? '  <-- SUNYI ' + sunyi.toFixed(0) + 's' : '';
    process.stdout.write(
      `  ${l.id.padEnd(10)} ${mulai.toFixed(1)}s -> ${this.detik().toFixed(1)}s`
      + `  (narasi ${lamaNarasi.toFixed(0)}s)${tanda}\n`,
    );
  }
}

/* ── jalan ───────────────────────────────────────────────────────────────── */

(async () => {
  const naskah = JSON.parse(fs.readFileSync(path.join(DIR, NASKAH), 'utf8'));
  const berkasWaktu = path.join(DIR, 'audio', 'waktu.json');
  const lamaNarasi = fs.existsSync(berkasWaktu)
    ? JSON.parse(fs.readFileSync(berkasWaktu, 'utf8'))
    : {};
  if (!Object.keys(lamaNarasi).length) {
    console.log('CATATAN: audio/waktu.json belum ada — langkah dijalankan tanpa penantian narasi.');
  }

  const bagian = BAGIAN
    ? naskah.bagian.filter((b) => b.nomor === BAGIAN)
    : naskah.bagian;
  if (!bagian.length) { console.log('bagian tidak ketemu:', BAGIAN); process.exit(1); }

  const browser = await puppeteer.launch({
    // Selalu tanpa jendela. page.screencast() memotret ISI HALAMAN, bukan
    // layar sistem, jadi jendela sungguhan tidak diperlukan — dan merekam
    // selama sejam dengan jendela terbuka berarti mengambil alih layar orang
    // yang komputernya dipakai.
    headless: 'new',
    args: [
      '--ignore-certificate-errors',
      `--window-size=${LEBAR},${TINGGI + 120}`,
      '--hide-scrollbars',
      '--force-device-scale-factor=1',
    ],
    defaultViewport: { width: LEBAR, height: TINGGI, deviceScaleFactor: UJI ? 1 : 2 },
  });
  const page = await browser.newPage();
  const lapisan = fs.readFileSync(path.join(DIR, 'lapisan.js'), 'utf8');
  await page.evaluateOnNewDocument(lapisan);

  // Bagian pembuka MEREKAM proses masuknya sendiri — itu memang langkah
  // pertama yang dilihat pengguna. Jadi kalau bagian pertama yang dijalankan
  // ditandai `dariLogin`, jangan masuk lebih dulu di sini; biarkan naskahnya
  // yang mengerjakan. Kalau menjalankan satu bagian di tengah, barulah perlu
  // masuk lebih dulu supaya halamannya bisa dibuka.
  // Akun ditentukan PER BAGIAN. Video tutorial dikerjakan akun PIC, bagian
  // pembacaan data oleh akun VIP yang hanya-baca, dan video Lapor berganti
  // dua kali antara akun bersama pelapor dan akun PIC yang menelaah.
  const AKUN = kredensial(bagian[0].akun || naskah.akun || 'PIC_INSPEKTORAT');
  AKUN_AKTIF = AKUN;
  console.log('akun perekam:', AKUN.user);

  // Sebagian akun tidak masuk lewat formulir biasa. Akun bersama LAPOR
  // dipakai publik lewat kode QR, dan jalur masuknya memang alamat QR itu —
  // bukan halaman login. Ditulis sebagai `masukLewat` pada bagiannya.
  const masukLewat = bagian[0].masukLewat;
  if (masukLewat) {
    await page.goto(ASAL + masukLewat, { waitUntil: 'networkidle2' });
    await tidur(3000);
    if (/\/login$/.test(page.url())) { console.log('GAGAL MASUK lewat', masukLewat); await browser.close(); process.exit(1); }
  } else {
    await page.goto(`${ASAL}/login`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('#username');
    if (!bagian[0].dariLogin) {
      await page.type('#username', AKUN.user, { delay: 10 });
      await page.type('#password', AKUN.sandi, { delay: 10 });
      await page.click('button[type="submit"]');
      await tidur(3000);
      if (/\/login/.test(page.url())) { console.log('GAGAL MASUK'); await browser.close(); process.exit(1); }
    }
  }

  const tangan = new Tangan(page);
  const rec = new Perekam(page, tangan);
  if (!bagian[0].dariLogin) await rec.tungguSplash();

  fs.mkdirSync(path.join(DIR, 'rekam'), { recursive: true });
  let screencast = null;
  if (!UJI) {
    const berkas = path.join(DIR, 'rekam', `${AWALAN}bagian-${BAGIAN || 'semua'}.webm`);
    screencast = await page.screencast({ path: berkas, fps: 30 });
    console.log('merekam ke', berkas);
  }
  rec.mulaiRekam = Date.now();
  await tidur(800);

  try {
    for (const b of bagian) {
      console.log(`\n=== Bagian ${b.nomor} — ${b.judul}`);
      for (const l of b.langkah) {
        const lama = (l.narasi || []).reduce((s, n) => s + (lamaNarasi[n.id] || 0), 0);
        await rec.langkah(l, lama);
      }
    }
  } catch (e) {
    console.error('\nBERHENTI:', e.message);
    process.exitCode = 1;
  }

  await tidur(900);
  if (screencast) await screencast.stop();
  fs.writeFileSync(
    path.join(DIR, 'rekam', `${AWALAN}waktu-${BAGIAN || 'semua'}.json`),
    JSON.stringify(rec.waktu, null, 1),
  );
  await browser.close();
  console.log('\nselesai.');
})();
