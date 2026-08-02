/**
 * Lapisan yang DISUNTIKKAN ke dalam halaman aplikasi saat merekam.
 *
 * Alasannya satu: Puppeteer menggerakkan tetikus sungguhan di dalam peramban,
 * tetapi perekam layar peramban hanya memotret ISI halaman — penunjuk tetikus
 * milik sistem operasi tidak ikut terekam. Jadi kursornya digambar sendiri di
 * sini sebagai elemen HTML, lalu digerakkan ke koordinat yang sama dengan
 * tetikus sungguhan. Yang terlihat penonton adalah kursor ini.
 *
 * Isinya tiga hal: kursor berikut riak kliknya, cincin sorotan pada kolom yang
 * sedang diisi, dan papan judul bab. Semuanya di lapisan paling atas dan
 * `pointer-events: none` supaya tidak pernah menghalangi klik sungguhan.
 *
 * Dipasang lewat page.evaluateOnNewDocument() agar ikut hidup kembali setiap
 * kali halaman berpindah — aplikasi ini memakai Inertia, tetapi berpindah menu
 * lewat klik tetap bisa memicu muat ulang penuh pada beberapa jalur.
 */
(() => {
  if (window.__lapisanTutorial) return;
  window.__lapisanTutorial = true;

  const pasang = () => {
    if (document.getElementById('tutorial-lapisan')) return;
    if (!document.body) return;

    const gaya = document.createElement('style');
    gaya.textContent = `
      #tutorial-lapisan { position: fixed; inset: 0; z-index: 2147483647; pointer-events: none; }
      #tutorial-kursor {
        position: absolute; left: 0; top: 0; width: 28px; height: 28px;
        margin-left: -3px; margin-top: -2px;
        will-change: transform; transform: translate(-100px, -100px);
      }
      #tutorial-kursor svg { display: block; filter: drop-shadow(0 2px 3px rgba(0,0,0,.45)); }
      .tutorial-riak {
        position: absolute; border-radius: 9999px; border: 3px solid rgba(56,189,248,.95);
        background: rgba(56,189,248,.16); transform: translate(-50%, -50%);
      }
      #tutorial-sorot {
        position: absolute; border-radius: 10px; opacity: 0;
        box-shadow: 0 0 0 3px rgba(56,189,248,.95), 0 0 0 9px rgba(56,189,248,.22),
                    0 0 26px 6px rgba(56,189,248,.35);
      }
      #tutorial-judul {
        position: absolute; left: 50%; bottom: 7%; transform: translateX(-50%);
        opacity: 0; padding: 14px 34px; border-radius: 999px;
        background: rgba(2,10,22,.90); color: #f1f5f9;
        font: 600 30px/1.25 system-ui, "Segoe UI", sans-serif; letter-spacing: .01em;
        box-shadow: 0 12px 40px rgba(0,0,0,.5); white-space: nowrap;
      }
      #tutorial-judul span { color: #7dd3fc; margin-right: 14px; font-weight: 700; }
      /* Kursor asli disembunyikan supaya tidak muncul dua kursor kalau
         perekamnya kelak diganti dengan perekam layar sungguhan. */
      * { cursor: none !important; }
    `;
    document.head.appendChild(gaya);

    const lap = document.createElement('div');
    lap.id = 'tutorial-lapisan';
    lap.innerHTML = `
      <div id="tutorial-sorot"></div>
      <div id="tutorial-kursor">
        <svg width="28" height="28" viewBox="0 0 28 28">
          <path d="M4 2 L4 22 L9.2 17.2 L12.6 25 L16.4 23.3 L13 15.6 L20 15.2 Z"
                fill="#ffffff" stroke="#0f172a" stroke-width="1.6" stroke-linejoin="round"/>
        </svg>
      </div>
      <div id="tutorial-judul"></div>`;
    document.body.appendChild(lap);
  };

  // Berkas ini disuntikkan pada AWAL dokumen, saat <html> pun belum tentu ada.
  // Karena itu pemasangannya harus tahan dijalankan terlalu dini: kalau
  // sesuatu di sini melempar galat, seluruh sisa berkas — termasuk fungsi
  // __judul, __sorot, dan __kursorKe di bawah — tidak pernah terpasang, dan
  // gejalanya cuma "window.__judul is not a function" yang sama sekali tidak
  // menunjuk ke sebabnya.
  const amati = () => {
    if (!document.documentElement) { setTimeout(amati, 20); return; }
    pasang();
    // Aplikasi ini menukar isi <body> saat berpindah halaman; pengamat ini
    // memasang ulang lapisan kalau sampai ikut terbuang.
    new MutationObserver(pasang).observe(document.documentElement, { childList: true, subtree: true });
  };
  amati();
  document.addEventListener('DOMContentLoaded', pasang);

  /** Pindahkan kursor gambar ke koordinat viewport. */
  window.__kursorKe = (x, y) => {
    const k = document.getElementById('tutorial-kursor');
    if (k) k.style.transform = `translate(${x}px, ${y}px)`;
  };

  /** Riak klik: lingkaran mengembang lalu memudar di titik yang diklik. */
  window.__riak = (x, y) => {
    const lap = document.getElementById('tutorial-lapisan');
    if (!lap) return;
    const r = document.createElement('div');
    r.className = 'tutorial-riak';
    r.style.left = x + 'px';
    r.style.top = y + 'px';
    r.style.width = r.style.height = '10px';
    lap.appendChild(r);
    const mulai = performance.now();
    const DURASI = 480;
    const langkah = (t) => {
      const p = Math.min(1, (t - mulai) / DURASI);
      const e = 1 - Math.pow(1 - p, 3);
      const d = 10 + e * 62;
      r.style.width = r.style.height = d + 'px';
      r.style.opacity = String(1 - p);
      if (p < 1) requestAnimationFrame(langkah); else r.remove();
    };
    requestAnimationFrame(langkah);
  };

  /** Cincin sorotan mengelilingi sebuah elemen. Padam sendiri. */
  window.__sorot = (sel, ms) => {
    const s = document.getElementById('tutorial-sorot');
    const el = typeof sel === 'string' ? document.querySelector(sel) : sel;
    if (!s || !el) return false;
    const b = el.getBoundingClientRect();
    const p = 7;
    s.style.left = (b.left - p) + 'px';
    s.style.top = (b.top - p) + 'px';
    s.style.width = (b.width + p * 2) + 'px';
    s.style.height = (b.height + p * 2) + 'px';

    const NAIK = 220, TURUN = 320, tahan = Math.max(0, (ms || 1600) - NAIK - TURUN);
    const mulai = performance.now();
    const langkah = (t) => {
      const d = t - mulai;
      let o;
      if (d < NAIK) o = d / NAIK;
      else if (d < NAIK + tahan) o = 1;
      else o = Math.max(0, 1 - (d - NAIK - tahan) / TURUN);
      s.style.opacity = String(o);
      if (d < NAIK + tahan + TURUN) requestAnimationFrame(langkah); else s.style.opacity = '0';
    };
    requestAnimationFrame(langkah);
    return true;
  };

  window.__padamkanSorot = () => {
    const s = document.getElementById('tutorial-sorot');
    if (s) s.style.opacity = '0';
  };

  /** Papan judul bab yang muncul-sebentar di bawah layar. */
  window.__judul = (nomor, teks, ms) => {
    const j = document.getElementById('tutorial-judul');
    if (!j) return;
    j.innerHTML = (nomor ? `<span>${nomor}</span>` : '') + teks;
    const NAIK = 420, TURUN = 520, tahan = Math.max(0, (ms || 4200) - NAIK - TURUN);
    const mulai = performance.now();
    const langkah = (t) => {
      const d = t - mulai;
      let o;
      if (d < NAIK) o = d / NAIK;
      else if (d < NAIK + tahan) o = 1;
      else o = Math.max(0, 1 - (d - NAIK - tahan) / TURUN);
      j.style.opacity = String(o);
      j.style.transform = `translateX(-50%) translateY(${(1 - o) * 14}px)`;
      if (d < NAIK + tahan + TURUN) requestAnimationFrame(langkah); else j.style.opacity = '0';
    };
    requestAnimationFrame(langkah);
  };

  /**
   * Gulir halus ke posisi tertentu. Dipakai daripada scrollIntoView karena
   * yang terakhir melompat seketika — tidak ada manusia yang menggulir begitu.
   */
  window.__gulir = (keY, ms) => new Promise((selesai) => {
    const dariY = window.scrollY;
    const jarak = keY - dariY;
    if (Math.abs(jarak) < 2) return selesai();
    const durasi = ms || Math.min(1500, 320 + Math.abs(jarak) * 0.62);
    const mulai = performance.now();
    const langkah = (t) => {
      const p = Math.min(1, (t - mulai) / durasi);
      // Perlambatan di kedua ujung; tangan tidak pernah berhenti mendadak.
      const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      window.scrollTo(0, dariY + jarak * e);
      if (p < 1) requestAnimationFrame(langkah); else selesai();
    };
    requestAnimationFrame(langkah);
  });

  /**
   * Bawa sebuah elemen ke tengah layar dengan gulir halus.
   *
   * Bukan window yang selalu digulir. Formulir risiko dibuka di dalam dialog
   * yang punya penggulir SENDIRI, dan menggulung jendela tidak menggerakkannya
   * sedikit pun. Akibatnya kolom yang dituju tetap di luar layar, klik mendarat
   * di luar dialog, dan dialognya menutup — tanpa galat apa pun, formulir yang
   * sedang diisi hilang begitu saja. Karena itu di sini dicari dulu wadah
   * bergulir terdekat, baru wadah itu yang digerakkan.
   */
  window.__bawaKeTengah = (sel, ms) => new Promise((selesai) => {
    const el = typeof sel === 'string' ? document.querySelector(sel) : sel;
    if (!el) return selesai(false);

    let wadah = el.parentElement;
    while (wadah && wadah !== document.body) {
      const g = getComputedStyle(wadah);
      const bisa = /(auto|scroll)/.test(g.overflowY);
      if (bisa && wadah.scrollHeight > wadah.clientHeight + 4) break;
      wadah = wadah.parentElement;
    }

    const pakaiJendela = !wadah || wadah === document.body;
    const kotak = el.getBoundingClientRect();
    let dariY, keY, gerak;
    if (pakaiJendela) {
      dariY = window.scrollY;
      keY = Math.max(0, dariY + kotak.top - (window.innerHeight / 2 - kotak.height / 2));
      gerak = (y) => window.scrollTo(0, y);
    } else {
      const kw = wadah.getBoundingClientRect();
      dariY = wadah.scrollTop;
      keY = Math.max(0, Math.min(
        wadah.scrollHeight - wadah.clientHeight,
        dariY + (kotak.top - kw.top) - (wadah.clientHeight / 2 - kotak.height / 2),
      ));
      gerak = (y) => { wadah.scrollTop = y; };
    }

    const jarak = keY - dariY;
    if (Math.abs(jarak) < 3) return selesai(true);
    const durasi = ms || Math.min(1300, 300 + Math.abs(jarak) * 0.6);
    const mulai = performance.now();
    const langkah = (t) => {
      const p = Math.min(1, (t - mulai) / durasi);
      const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      gerak(dariY + jarak * e);
      if (p < 1) requestAnimationFrame(langkah); else selesai(true);
    };
    requestAnimationFrame(langkah);
  });

  /**
   * Zoom ke sebuah elemen — DIKERJAKAN SAAT MEREKAM, bukan saat menyunting.
   *
   * Bedanya menentukan ketajaman. Kalau gambarnya dipotong dan diperbesar
   * belakangan, yang diperbesar piksel yang sudah terlanjur direkam, dan
   * hurufnya menjadi kabur. Di sini yang diperbesar halamannya sendiri lewat
   * transform, sehingga peramban menggambar ulang teksnya pada ukuran yang
   * lebih besar dan hasilnya tetap tajam.
   *
   * Kursor tidak ikut diperbesar — ia hidup di lapisan sendiri — jadi
   * koordinatnya harus diterjemahkan. Itu diurus __petaZoom di bawah.
   */
  /**
   * Yang diperbesar adalah wadah tempat sasaran benar-benar berada.
   *
   * Dialog Radix digambar lewat portal DI LUAR #app — ia anak langsung <body>.
   * Memperbesar #app karena itu tidak menyentuh dialog sedikit pun: gambarnya
   * tidak berubah, dan yang bergerak justru halaman di belakangnya.
   */
  const akar = (el) => el.closest('[role="dialog"]')
    || document.querySelector('#app')
    || document.body.firstElementChild;
  window.__zoomAktif = null;

  window.__zoom = (sel, skala, ms) => new Promise((selesai) => {
    const el = typeof sel === 'string' ? document.querySelector(sel) : sel;
    if (!el) return selesai(false);
    const a = akar(el);
    if (!a) return selesai(false);
    const b = el.getBoundingClientRect();
    const px = b.left + b.width / 2;
    const py = b.top + b.height / 2;
    // Titik tumpu dipilih supaya sasaran tetap di tempatnya saat membesar,
    // lalu digeser agar ia berada di tengah layar.
    const geserX = (window.innerWidth / 2 - px) * skala;
    const geserY = (window.innerHeight / 2 - py) * skala;

    // transform-origin diukur dari KOTAK ELEMENNYA, bukan dari layar. Untuk
    // #app keduanya kebetulan sama karena ia mulai di pojok kiri atas; untuk
    // dialog yang melayang di tengah, memakai koordinat layar membuat titik
    // tumpunya meleset sejauh jarak dialog dari pojok.
    const ka = a.getBoundingClientRect();
    a.style.transformOrigin = `${px - ka.left}px ${py - ka.top}px`;
    a.style.willChange = 'transform';
    const dari = window.__zoomAktif ? window.__zoomAktif.skala : 1;
    const mulai = performance.now();
    const durasi = ms || 700;
    const langkah = (t) => {
      const p = Math.min(1, (t - mulai) / durasi);
      const e = 1 - Math.pow(1 - p, 3);
      const s = dari + (skala - dari) * e;
      a.style.transform = `translate(${geserX * e}px, ${geserY * e}px) scale(${s})`;
      if (p < 1) requestAnimationFrame(langkah);
      else { window.__zoomAktif = { skala, px, py, geserX, geserY, wadah: a }; selesai(true); }
    };
    requestAnimationFrame(langkah);
  });

  window.__zoomKeluar = (ms) => new Promise((selesai) => {
    const z = window.__zoomAktif;
    // Wadahnya diingat saat zoom dipasang; kalau dicari ulang di sini, dialog
    // yang sudah tertutup akan membuat transform-nya tertinggal terpasang.
    const a = z && z.wadah;
    if (!a || !z) return selesai(true);
    const mulai = performance.now();
    const durasi = ms || 620;
    const langkah = (t) => {
      const p = Math.min(1, (t - mulai) / durasi);
      const e = 1 - Math.pow(1 - p, 3);
      const s = z.skala + (1 - z.skala) * e;
      a.style.transform = `translate(${z.geserX * (1 - e)}px, ${z.geserY * (1 - e)}px) scale(${s})`;
      if (p < 1) requestAnimationFrame(langkah);
      else { a.style.transform = ''; a.style.willChange = ''; window.__zoomAktif = null; selesai(true); }
    };
    requestAnimationFrame(langkah);
  });

  /**
   * Terjemahkan koordinat halaman ke koordinat layar saat sedang di-zoom.
   * Tanpa ini, kursor gambar berhenti di tempat yang salah begitu halaman
   * diperbesar — karena kursornya tidak ikut diperbesar.
   */
  window.__petaZoom = (x, y) => {
    const z = window.__zoomAktif;
    if (!z) return { x, y };
    return {
      x: z.px + (x - z.px) * z.skala + z.geserX,
      y: z.py + (y - z.py) * z.skala + z.geserY,
    };
  };

  /** Posisi tengah sebuah elemen dalam koordinat viewport. */
  window.__titik = (sel) => {
    const el = typeof sel === 'string' ? document.querySelector(sel) : sel;
    if (!el) return null;
    const b = el.getBoundingClientRect();
    if (b.width === 0 && b.height === 0) return null;
    return { x: b.left + b.width / 2, y: b.top + b.height / 2, atas: b.top, bawah: b.bottom };
  };
})();
