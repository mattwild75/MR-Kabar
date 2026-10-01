/**
 * Lapisan yang DISUNTIKKAN ke halaman aplikasi saat merekam (v2).
 *
 * Perekam layar peramban hanya memotret ISI halaman, jadi semua yang
 * "di atas" aplikasi digambar di sini sebagai elemen HTML pada lapisan
 * teratas dengan pointer-events: none, sehingga tidak pernah menghalangi klik
 * sungguhan:
 *
 *   kursor + riak klik            mengikuti tetikus sungguhan (gerak.cjs)
 *   sorot                         cincin emas, bisa dengan peredupan sekitar
 *   cip bab                       di tengah atas, tetap selama satu bab
 *   papan judul                   kiri bawah, saat pindah formulir
 *   catatan berpanah              menunjuk satu kolom: Sering keliru / Penting / Tips
 *   kartu tengah                  aturan tanpa sasaran (mis. sesi 4 jam)
 *   tanda tersimpan               sesudah tombol simpan berhasil
 *   tombol pintas                 tutup tombol keyboard (Ctrl + K)
 *
 * Huruf (Bebas Neue, Plus Jakarta Sans) sama dengan video edukasi v6; datanya
 * disisipkan pengendali sebagai window.__HURUF sebelum berkas ini.
 *
 * PEMBESARAN. Jendela perekam 1920x1080, lalu <body> diberi CSS zoom 1,5:
 * aplikasi tertata seperti di layar 1280x720 tetapi tergambar ulang 1,5 kali
 * lebih besar dan tajam, dan perekam layar (yang hanya memotret ukuran
 * jendela) menghasilkan 1920x1080. deviceScaleFactor TIDAK bisa dipakai untuk
 * ini: perekam layar Chromium mengabaikannya dan tetap memotret 1280x720.
 * Dua akibat zoom yang ditangani di sini:
 *   - satuan vh/vw di stylesheet ikut terzoom (sidebar dan dialog jadi 1,5
 *     kali tinggi layar), jadi nilainya dibagi 1,5 lewat CSSOM;
 *   - koordinat getBoundingClientRect dan tetikus memakai piksel jendela,
 *     sedangkan lapisan ini hidup di dalam <body> yang terzoom, jadi setiap
 *     koordinat dibagi Z sebelum dipakai.
 *
 * Ukuran elemen lapisan ditulis dalam piksel CSS untuk tata letak 1280x720.
 *
 * Satu kebiasaan aplikasi diubah HANYA di peramban perekam: window.open
 * diarahkan ke tab yang sama. Tombol "Catat ke Form 10" dan "Input ke
 * Register Risiko" membuka tab baru, dan tab baru tidak ikut terekam.
 */
(() => {
  if (window.__lapisanTutorial) return;
  window.__lapisanTutorial = true;

  window.open = (url) => { if (url) location.assign(url); return null; };

  const H = window.__HURUF || {};
  const Z = window.__ZOOM || 1;

  // Zoom dipasang SEDINI mungkin, sebelum <head> ada, supaya halaman tidak
  // sempat tergambar sekali pada ukuran asli.
  const pasangZoom = () => {
    if (Z === 1 || document.getElementById('tl-zoom')) return;
    const induk = document.head || document.documentElement;
    if (!induk) { setTimeout(pasangZoom, 5); return; }
    const st = document.createElement('style');
    st.id = 'tl-zoom';
    st.textContent = `body{zoom:${Z}}`;
    induk.appendChild(st);
  };
  pasangZoom();

  // vh/vw dibagi Z di semua aturan stylesheet (termasuk potongan CSS halaman
  // yang dimuat belakangan), supaya h-svh, max-h-[90vh], dan kawannya tetap
  // setinggi layar walau berada di dalam <body> yang terzoom.
  const POLA_VP = /(-?\d*\.?\d+)(svh|lvh|dvh|vh|svw|lvw|dvw|vw)/g;
  const sudahDisesuaikan = new WeakSet();
  const sesuaikan = (daftar) => {
    for (const r of daftar) {
      if (r.cssRules) sesuaikan(r.cssRules);
      if (!r.style || sudahDisesuaikan.has(r)) continue;
      sudahDisesuaikan.add(r);
      for (let i = 0; i < r.style.length; i++) {
        const prop = r.style[i];
        const v = r.style.getPropertyValue(prop);
        if (!/(vh|vw)/.test(v)) continue;
        r.style.setProperty(prop, v.replace(POLA_VP, (m) => `calc(${m} / ${Z})`), r.style.getPropertyPriority(prop));
      }
    }
  };
  const sesuaikanSemua = () => {
    if (Z === 1) return;
    for (const sh of document.styleSheets) {
      try { sesuaikan(sh.cssRules); } catch (e) { /* lembar lintas-asal: lewati */ }
    }
  };
  window.__sesuaikanViewport = sesuaikanSemua;

  // Menu melayang Radix (Select, Popover, DropdownMenu, Tooltip) ditempatkan
  // floating-ui lewat transform: translate(x, y) pada pembungkusnya, dengan x/y
  // dihitung dari kotak-batas dalam piksel JENDELA. Pembungkusnya hidup di
  // dalam <body> terzoom, jadi translate itu ikut dikali Z dan daftarnya jatuh
  // di luar layar - kliknya lalu mendarat di latar dan dialog tertutup.
  // Setiap kali floating-ui menulis ulang posisi, nilainya dibagi Z di sini.
  // MutationObserver berjalan sebagai microtask sebelum halaman digambar,
  // jadi posisi yang salah tidak pernah sempat tampil.
  const VAR_POPPER = ['--radix-popper-anchor-width', '--radix-popper-anchor-height',
    '--radix-popper-available-width', '--radix-popper-available-height'];
  const perbaikiPopper = (el) => {
    const t = el.style.transform;
    if (t && t !== el.__tlTransform) {
      const m = t.match(/translate\(\s*(-?[\d.]+)px,\s*(-?[\d.]+)px\s*\)/);
      if (m) {
        const baru = `translate(${(+m[1] / Z).toFixed(2)}px, ${(+m[2] / Z).toFixed(2)}px)`;
        el.__tlTransform = baru;
        el.style.transform = baru;
      }
    }
    for (const v of VAR_POPPER) {
      const nilai = el.style.getPropertyValue(v);
      if (nilai && nilai !== (el.__tlVar || {})[v]) {
        const px = parseFloat(nilai);
        if (!Number.isNaN(px)) {
          const baru = `${(px / Z).toFixed(2)}px`;
          el.__tlVar = { ...(el.__tlVar || {}), [v]: baru };
          el.style.setProperty(v, baru);
        }
      }
    }
  };
  const amatiPopper = () => {
    if (Z === 1 || !document.body) { if (Z !== 1) setTimeout(amatiPopper, 20); return; }
    new MutationObserver((daftar) => {
      for (const m of daftar) {
        const sasaran = m.type === 'attributes' ? [m.target] : [...m.addedNodes];
        for (const n of sasaran) {
          if (n.nodeType !== 1) continue;
          if (n.hasAttribute('data-radix-popper-content-wrapper')) perbaikiPopper(n);
          if (m.type === 'childList') n.querySelectorAll?.('[data-radix-popper-content-wrapper]').forEach(perbaikiPopper);
        }
      }
    }).observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['style'] });
  };
  amatiPopper();
  document.addEventListener('DOMContentLoaded', sesuaikanSemua);
  window.addEventListener('load', sesuaikanSemua);
  document.addEventListener('load', (e) => { if (e.target && e.target.tagName === 'LINK') sesuaikanSemua(); }, true);
  const WARNA = { awas: '#e5484d', penting: '#f2b45a', tips: '#38bdf8', info: '#a7f3d0' };

  const pasang = () => {
    if (document.getElementById('tl-lapisan') || !document.body || !document.head) return;
    const gaya = document.createElement('style');
    gaya.textContent = `
      ${H.bebas ? `@font-face{font-family:"TlBebas";src:url(${H.bebas});}` : ''}
      ${H.jakarta ? `@font-face{font-family:"TlJakarta";src:url(${H.jakarta});font-weight:200 800;}` : ''}
      #tl-lapisan{position:fixed;inset:0;z-index:2147483647;pointer-events:none;font-family:"TlJakarta","Segoe UI",sans-serif;}
      #tl-kursor{position:absolute;left:0;top:0;width:26px;height:26px;margin:-2px 0 0 -3px;will-change:transform;transform:translate(-100px,-100px);}
      #tl-kursor svg{display:block;filter:drop-shadow(0 2px 3px rgba(0,0,0,.5));}
      .tl-riak{position:absolute;border-radius:999px;border:2.5px solid rgba(242,180,90,.95);background:rgba(242,180,90,.18);transform:translate(-50%,-50%);}
      #tl-sorot{position:absolute;border-radius:9px;opacity:0;
        box-shadow:0 0 0 2.5px #f2b45a,0 0 0 7px rgba(242,180,90,.22),0 0 22px 4px rgba(242,180,90,.35);}
      #tl-sorot.redup{box-shadow:0 0 0 2.5px #f2b45a,0 0 22px 4px rgba(242,180,90,.4),0 0 0 4000px rgba(3,8,15,.48);}
      #tl-chip{position:absolute;left:50%;top:9px;transform:translateX(-50%);display:flex;align-items:center;gap:9px;
        padding:4px 14px 4px 6px;border-radius:999px;background:rgba(6,18,31,.82);border:1px solid rgba(242,180,90,.35);
        color:#f4f1ea;font-size:11.5px;font-weight:700;letter-spacing:.06em;white-space:nowrap;opacity:0;transition:opacity .4s;}
      #tl-chip b{font-family:"TlBebas";font-weight:400;font-size:17px;letter-spacing:.04em;color:#06121f;background:#f2b45a;
        border-radius:999px;padding:1px 9px 0;line-height:20px;}
      #tl-judul{position:absolute;left:22px;bottom:26px;max-width:620px;opacity:0;padding:10px 20px 10px 18px;border-radius:6px;
        background:linear-gradient(90deg,rgba(6,18,31,.95),rgba(6,18,31,.86));border-left:5px solid #e5484d;
        box-shadow:0 14px 40px rgba(0,0,0,.45);}
      #tl-judul .k{font-size:10.5px;font-weight:800;letter-spacing:.28em;text-transform:uppercase;color:#f2b45a;}
      #tl-judul .t{font-family:"TlBebas";font-size:34px;line-height:1.02;color:#f4f1ea;letter-spacing:.015em;margin-top:2px;}
      .tl-catat{position:absolute;width:286px;opacity:0;padding:11px 14px 12px;border-radius:9px;
        background:rgba(7,15,26,.95);border:1px solid rgba(255,255,255,.08);border-left:4px solid var(--w);
        box-shadow:0 16px 44px rgba(0,0,0,.5);color:#f4f1ea;}
      .tl-catat .k{font-size:10px;font-weight:800;letter-spacing:.24em;text-transform:uppercase;color:var(--w);display:flex;align-items:center;gap:7px;}
      .tl-catat .k i{display:inline-block;width:7px;height:7px;border-radius:9px;background:var(--w);box-shadow:0 0 10px var(--w);}
      .tl-catat .i{font-size:14.5px;line-height:1.38;font-weight:600;margin-top:5px;}
      .tl-garis{position:absolute;inset:0;width:100%;height:100%;overflow:visible;}
      .tl-kartu{position:absolute;left:50%;top:50%;width:520px;opacity:0;transform:translate(-50%,-50%);padding:22px 28px 24px;border-radius:12px;
        background:rgba(6,18,31,.96);border-top:5px solid var(--w);box-shadow:0 30px 80px rgba(0,0,0,.6);color:#f4f1ea;text-align:center;}
      .tl-kartu .k{font-size:11px;font-weight:800;letter-spacing:.3em;text-transform:uppercase;color:var(--w);}
      .tl-kartu .t{font-family:"TlBebas";font-size:46px;line-height:1;margin-top:8px;}
      .tl-kartu .i{font-size:16px;line-height:1.45;font-weight:600;color:rgba(244,241,234,.82);margin-top:8px;}
      .tl-sukses{position:absolute;display:flex;align-items:center;gap:8px;opacity:0;transform:translate(-50%,-100%);
        padding:6px 13px 6px 7px;border-radius:999px;background:rgba(6,30,22,.95);border:1px solid rgba(52,211,153,.5);
        color:#d1fae5;font-size:13px;font-weight:800;letter-spacing:.04em;box-shadow:0 10px 30px rgba(0,0,0,.4);white-space:nowrap;}
      .tl-sukses svg{display:block}
      .tl-tombol{position:absolute;left:50%;bottom:64px;transform:translateX(-50%);display:flex;gap:10px;align-items:center;opacity:0;}
      .tl-tombol span{min-width:54px;padding:10px 16px 9px;border-radius:10px;background:#f4f1ea;color:#06121f;text-align:center;
        font-family:"TlBebas";font-size:32px;line-height:1;box-shadow:0 5px 0 #b9b2a3,0 14px 30px rgba(0,0,0,.45);}
      .tl-tombol em{font-style:normal;color:#f4f1ea;font-family:"TlBebas";font-size:30px;text-shadow:0 2px 10px rgba(0,0,0,.6);}
      *{cursor:none !important;}
    `;
    document.head.appendChild(gaya);
    const lap = document.createElement('div');
    lap.id = 'tl-lapisan';
    lap.innerHTML = `
      <div id="tl-sorot"></div>
      <div id="tl-chip"></div>
      <div id="tl-judul"><div class="k"></div><div class="t"></div></div>
      <div id="tl-kursor"><svg width="26" height="26" viewBox="0 0 28 28">
        <path d="M4 2 L4 22 L9.2 17.2 L12.6 25 L16.4 23.3 L13 15.6 L20 15.2 Z" fill="#ffffff" stroke="#06121f" stroke-width="1.7" stroke-linejoin="round"/>
      </svg></div>`;
    document.body.appendChild(lap);
    // Cip bab bertahan lintas pindah halaman: isinya disimpan di sessionStorage.
    try {
      const c = sessionStorage.getItem('tl-chip');
      if (c) { const [no, t] = JSON.parse(c); tulisChip(no, t, false); }
    } catch (e) { /* abaikan */ }
    if (window.__posKursor) window.__kursorKe(window.__posKursor[0], window.__posKursor[1]);
    sesuaikanSemua();
  };

  const amati = () => {
    if (!document.documentElement) { setTimeout(amati, 20); return; }
    pasang();
    new MutationObserver((m) => {
      pasang();
      if (m.some((x) => [...x.addedNodes].some((n) => n.tagName === 'STYLE' || n.tagName === 'LINK'))) sesuaikanSemua();
    }).observe(document.documentElement, { childList: true, subtree: true });
  };
  amati();
  document.addEventListener('DOMContentLoaded', pasang);

  const lap = () => document.getElementById('tl-lapisan');
  /** Kotak elemen dalam piksel CSS lapisan (piksel jendela dibagi Z). */
  const kotakZ = (el) => {
    const b = el.getBoundingClientRect();
    return { left: b.left / Z, top: b.top / Z, right: b.right / Z, bottom: b.bottom / Z, width: b.width / Z, height: b.height / Z };
  };
  const kurva = (p) => 1 - Math.pow(1 - p, 3);
  const pegas = (p) => { const c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); };

  /** Jalankan animasi naik - tahan - turun pada fungsi gambar(o, fase). */
  const hidup = (ms, gambar, naik = 300, turun = 320, selesai) => {
    const tahan = Math.max(0, ms - naik - turun);
    const t0 = performance.now();
    const langkah = (t) => {
      const d = t - t0;
      let o, fase;
      if (d < naik) { o = d / naik; fase = 'naik'; } else if (d < naik + tahan) { o = 1; fase = 'tahan'; } else { o = Math.max(0, 1 - (d - naik - tahan) / turun); fase = 'turun'; }
      gambar(o, fase, d);
      if (d < naik + tahan + turun) requestAnimationFrame(langkah); else if (selesai) selesai();
    };
    requestAnimationFrame(langkah);
  };

  window.__kursorKe = (x, y) => {
    window.__posKursor = [x, y];
    const k = document.getElementById('tl-kursor');
    if (k) k.style.transform = `translate(${x / Z}px, ${y / Z}px)`;
  };

  window.__riak = (x, y) => {
    const l = lap();
    if (!l) return;
    const r = document.createElement('div');
    r.className = 'tl-riak';
    r.style.left = x / Z + 'px'; r.style.top = y / Z + 'px';
    l.appendChild(r);
    hidup(460, (o, f, d) => {
      const p = Math.min(1, d / 460);
      const s = 8 + kurva(p) * 44;
      r.style.width = r.style.height = s + 'px';
      r.style.opacity = String(1 - p);
    }, 0, 460, () => r.remove());
  };

  window.__sorot = (sel, ms, redup) => {
    const s = document.getElementById('tl-sorot');
    const el = typeof sel === 'string' ? document.querySelector(sel) : sel;
    if (!s || !el) return false;
    const p = 6;
    s.classList.toggle('redup', !!redup);
    // Cincin MENGIKUTI sasarannya tiap bingkai: kalau halaman atau dialog
    // bergulir selagi cincin menyala, ia tidak tertinggal menunjuk tempat
    // kosong. Sasaran yang hilang dari halaman memadamkan cincin seketika.
    hidup(ms || 1800, (o) => {
      if (!el.isConnected) { s.style.opacity = '0'; return; }
      const b = kotakZ(el);
      Object.assign(s.style, { left: (b.left - p) + 'px', top: (b.top - p) + 'px', width: (b.width + p * 2) + 'px', height: (b.height + p * 2) + 'px' });
      s.style.opacity = String(o);
    }, 220, 320);
    return true;
  };

  function tulisChip(no, teks, simpan = true) {
    const c = document.getElementById('tl-chip');
    if (!c) return;
    c.innerHTML = no ? `<b>BAB ${no}</b>${teks}` : '';
    c.style.opacity = no ? '1' : '0';
    if (simpan) { try { sessionStorage.setItem('tl-chip', JSON.stringify([no, teks])); } catch (e) { /* abaikan */ } }
  }
  window.__chip = (no, teks) => tulisChip(no, teks);

  window.__judul = (kicker, teks, ms) => {
    const j = document.getElementById('tl-judul');
    if (!j) return;
    j.querySelector('.k').textContent = kicker || '';
    j.querySelector('.t').textContent = teks || '';
    hidup(ms || 4200, (o, f) => {
      const e = f === 'naik' ? kurva(o) : o;
      j.style.opacity = String(e);
      j.style.transform = `translateX(${(1 - e) * -26}px)`;
    }, 420, 380);
  };

  /**
   * Catatan berpanah. Kotaknya ditaruh di sisi sasaran yang paling lapang,
   * lalu garis tipis ditarik dari tepi kotak ke titik di tepi sasaran.
   */
  window.__catat = (sel, judul, isi, jenis, ms) => {
    const l = lap();
    const el = typeof sel === 'string' ? document.querySelector(sel) : sel;
    if (!l || !el) return false;
    const b = kotakZ(el);
    const W = window.innerWidth / Z, Ht = window.innerHeight / Z, w = 286, gap = 46;
    const c = document.createElement('div');
    c.className = 'tl-catat';
    c.style.setProperty('--w', WARNA[jenis] || WARNA.awas);
    c.innerHTML = `<div class="k"><i></i>${judul}</div><div class="i">${isi}</div>`;
    l.appendChild(c);
    const h = c.offsetHeight;
    const ruangKanan = W - b.right, ruangKiri = b.left;
    let x, y, ax, ay, dari;
    if (ruangKanan >= w + gap + 14 || ruangKiri >= w + gap + 14) {
      const kanan = ruangKanan >= ruangKiri;
      x = kanan ? b.right + gap : b.left - gap - w;
      y = Math.min(Ht - h - 16, Math.max(64, b.top + b.height / 2 - h / 2));
      ax = kanan ? b.right + 3 : b.left - 3;
      ay = b.top + b.height / 2;
      dari = kanan ? 'kiri' : 'kanan';
    } else {
      const bawah = Ht - b.bottom > b.top;
      x = Math.min(W - w - 16, Math.max(16, b.left + Math.min(b.width, 260) / 2 - w / 2 + 40));
      y = bawah ? b.bottom + gap * 0.7 : b.top - gap * 0.7 - h;
      ax = Math.min(b.right - 10, Math.max(b.left + 10, x + w / 2));
      ay = bawah ? b.bottom + 3 : b.top - 3;
      dari = bawah ? 'atas' : 'bawah';
    }
    c.style.left = x + 'px'; c.style.top = y + 'px';
    const bx = dari === 'kiri' ? x : dari === 'kanan' ? x + w : Math.min(x + w - 20, Math.max(x + 20, ax));
    const by = dari === 'atas' ? y : dari === 'bawah' ? y + h : y + Math.min(h - 14, Math.max(14, ay - y));
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('class', 'tl-garis');
    const warna = WARNA[jenis] || WARNA.awas;
    svg.innerHTML = `<g><line x1="${bx}" y1="${by}" x2="${bx}" y2="${by}" stroke="${warna}" stroke-width="2" stroke-linecap="round"/>
      <circle cx="${ax}" cy="${ay}" r="0" fill="${warna}"/><circle cx="${ax}" cy="${ay}" r="0" fill="none" stroke="${warna}" stroke-width="1.5" opacity=".6"/></g>`;
    l.insertBefore(svg, c);
    const grup = svg.firstElementChild;
    const [garis, titik, cincin] = grup.children;
    // Catatan MENGIKUTI sasarannya: pergeseran kotak-batas sasaran sejak
    // catatan muncul (halaman/dialog bergulir, zoom) diterapkan ke kotak dan
    // garisnya. Kalau sasaran lenyap atau keluar layar, catatan memudar cepat.
    let pudar = 1;
    const geser = { kiri: [-16, 0], kanan: [16, 0], atas: [0, -12], bawah: [0, 12] }[dari];
    hidup(ms || 5000, (o, f, d) => {
      const e = f === 'naik' ? pegas(o) : o;
      let dx = 0, dy = 0;
      if (el.isConnected) {
        const k = kotakZ(el);
        dx = k.left - b.left; dy = k.top - b.top;
        if (k.bottom < 0 || k.top > Ht || k.width === 0) pudar = Math.max(0, pudar - 0.12);
      } else pudar = Math.max(0, pudar - 0.2);
      o *= pudar;
      grup.setAttribute('transform', `translate(${dx}, ${dy})`);
      c.style.opacity = String(Math.min(1, o * 1.4));
      c.style.transform = `translate(${geser[0] * (1 - e) + dx}px, ${geser[1] * (1 - e) + dy}px)`;
      const g = f === 'naik' ? kurva(o) : 1;
      garis.setAttribute('x2', String(bx + (ax - bx) * g));
      garis.setAttribute('y2', String(by + (ay - by) * g));
      garis.setAttribute('opacity', String(o));
      titik.setAttribute('r', String(4 * (f === 'naik' ? kurva(o) : o)));
      const pulsa = (d % 1400) / 1400;
      cincin.setAttribute('r', String(4 + pulsa * 12));
      cincin.setAttribute('opacity', String((1 - pulsa) * 0.7 * o));
    }, 380, 360, () => { c.remove(); svg.remove(); });
    return true;
  };

  window.__kartu = (judul, isi, jenis, ms) => {
    const l = lap();
    if (!l) return;
    const c = document.createElement('div');
    c.className = 'tl-kartu';
    c.style.setProperty('--w', WARNA[jenis] || WARNA.info);
    const kk = { awas: 'Perhatikan', penting: 'Penting', tips: 'Tips', info: 'Catatan' }[jenis] || 'Catatan';
    c.innerHTML = `<div class="k">${kk}</div><div class="t">${judul}</div><div class="i">${isi}</div>`;
    l.appendChild(c);
    hidup(ms || 5200, (o, f) => {
      const e = f === 'naik' ? pegas(o) : o;
      c.style.opacity = String(Math.min(1, o * 1.3));
      c.style.transform = `translate(-50%, -50%) scale(${0.92 + 0.08 * e})`;
    }, 420, 380, () => c.remove());
  };

  window.__sukses = (x, y, teks) => {
    const l = lap();
    if (!l) return;
    const c = document.createElement('div');
    c.className = 'tl-sukses';
    c.innerHTML = `<svg width="22" height="22" viewBox="0 0 22 22"><circle cx="11" cy="11" r="10" fill="#10b981"/>
      <path d="M6.2 11.4 L9.6 14.6 L15.8 7.8" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"
      stroke-dasharray="16" stroke-dashoffset="16"/></svg>${teks || 'Tersimpan'}`;
    const W = window.innerWidth / Z;
    c.style.left = Math.min(W - 80, Math.max(80, x / Z)) + 'px';
    c.style.top = Math.max(60, y / Z - 22) + 'px';
    l.appendChild(c);
    const jalur = c.querySelector('path');
    hidup(2200, (o, f, d) => {
      const e = f === 'naik' ? pegas(o) : o;
      c.style.opacity = String(Math.min(1, o * 1.5));
      c.style.transform = `translate(-50%, -100%) translateY(${(1 - e) * 8}px) scale(${0.85 + 0.15 * e})`;
      jalur.setAttribute('stroke-dashoffset', String(16 * (1 - Math.min(1, d / 420))));
    }, 260, 420, () => c.remove());
  };

  window.__tombol = (label, ms) => {
    const l = lap();
    if (!l) return;
    const c = document.createElement('div');
    c.className = 'tl-tombol';
    c.innerHTML = label.map((k) => `<span>${k}</span>`).join('<em>+</em>');
    l.appendChild(c);
    hidup(ms || 2400, (o, f) => {
      const e = f === 'naik' ? pegas(o) : o;
      c.style.opacity = String(Math.min(1, o * 1.4));
      c.style.transform = `translateX(-50%) translateY(${(1 - e) * 18}px)`;
    }, 300, 380, () => c.remove());
  };

  /** Gulir halus jendela. */
  window.__gulir = (keY, ms) => new Promise((selesai) => {
    const dariY = window.scrollY, jarak = keY - dariY;
    if (Math.abs(jarak) < 2) return selesai();
    const durasi = ms || Math.min(1300, 300 + Math.abs(jarak) * 0.8);
    const t0 = performance.now();
    const langkah = (t) => {
      const p = Math.min(1, (t - t0) / durasi);
      const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      window.scrollTo(0, dariY + jarak * e);
      if (p < 1) requestAnimationFrame(langkah); else selesai();
    };
    requestAnimationFrame(langkah);
  });

  /**
   * Bawa elemen ke tengah layar dengan gulir halus, pada wadah bergulir
   * terdekat (dialog punya penggulir sendiri) lalu jendelanya.
   */
  window.__bawaKeTengah = (sel, ms) => {
    const el = typeof sel === 'string' ? document.querySelector(sel) : sel;
    if (!el) return Promise.resolve(false);
    const gulung = (dariY, keY, gerak) => new Promise((selesai) => {
      const jarak = keY - dariY;
      if (Math.abs(jarak) < 3) return selesai(true);
      const durasi = ms || Math.min(1100, 280 + Math.abs(jarak) * 0.75);
      const t0 = performance.now();
      const langkah = (t) => {
        const p = Math.min(1, (t - t0) / durasi);
        const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
        gerak(dariY + jarak * e);
        if (p < 1) requestAnimationFrame(langkah); else selesai(true);
      };
      requestAnimationFrame(langkah);
    });
    let wadah = el.parentElement;
    while (wadah && wadah !== document.body) {
      const g = getComputedStyle(wadah);
      if (/(auto|scroll)/.test(g.overflowY) && wadah.scrollHeight > wadah.clientHeight + 4) break;
      wadah = wadah.parentElement;
    }
    const keJendela = () => {
      const k = el.getBoundingClientRect();
      if (k.top >= window.innerHeight * 0.16 && k.bottom <= window.innerHeight * 0.84) return Promise.resolve(true);
      return gulung(window.scrollY, Math.max(0, window.scrollY + k.top - (window.innerHeight / 2 - k.height / 2)), (y) => window.scrollTo(0, y));
    };
    if (!wadah || wadah === document.body) return keJendela();
    // scrollTop wadah di dalam <body> terzoom memakai piksel CSS terzoom,
    // sedangkan kotak-batas memakai piksel jendela: selisihnya dibagi Z.
    const kw = wadah.getBoundingClientRect(), kotak = el.getBoundingClientRect();
    return gulung(wadah.scrollTop, Math.max(0, Math.min(wadah.scrollHeight - wadah.clientHeight,
      wadah.scrollTop + (kotak.top - kw.top) / Z - (wadah.clientHeight / 2 - kotak.height / Z / 2))), (y) => { wadah.scrollTop = y; }).then(keJendela);
  };

  /**
   * Zoom ke sebuah elemen, dikerjakan pada halamannya sendiri (transform),
   * sehingga peramban menggambar ulang teksnya pada ukuran besar dan tetap
   * tajam. Dialog Radix hidup di luar #app, jadi yang diperbesar wadah tempat
   * sasaran benar-benar berada.
   */
  const akar = (el) => el.closest('[role="dialog"]') || document.querySelector('#app') || document.body.firstElementChild;
  window.__zoomAktif = null;
  window.__zoom = (sel, skala, ms) => new Promise((selesai) => {
    const el = typeof sel === 'string' ? document.querySelector(sel) : sel;
    if (!el) return selesai(false);
    const a = akar(el);
    if (!a) return selesai(false);
    const b = el.getBoundingClientRect();
    const px = b.left + b.width / 2, py = b.top + b.height / 2;
    const geserX = (window.innerWidth / 2 - px) * skala * 0.85 / Z;
    const geserY = (window.innerHeight / 2 - py) * skala * 0.85 / Z;
    const ka = a.getBoundingClientRect();
    a.style.transformOrigin = `${(px - ka.left) / Z}px ${(py - ka.top) / Z}px`;
    a.style.willChange = 'transform';
    const t0 = performance.now(), durasi = ms || 700;
    const langkah = (t) => {
      const p = Math.min(1, (t - t0) / durasi);
      const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      a.style.transform = `translate(${geserX * e}px, ${geserY * e}px) scale(${1 + (skala - 1) * e})`;
      if (p < 1) requestAnimationFrame(langkah);
      else {
        // will-change dilepas sesudah gerak selesai: peramban lalu menggambar
        // ulang teks pada skala akhir, bukan memperbesar bitmap lamanya.
        a.style.willChange = '';
        window.__zoomAktif = { skala, px, py, geserX, geserY, wadah: a };
        selesai(true);
      }
    };
    requestAnimationFrame(langkah);
  });
  window.__zoomKeluar = (ms) => new Promise((selesai) => {
    const z = window.__zoomAktif, a = z && z.wadah;
    if (!a) return selesai(true);
    const t0 = performance.now(), durasi = ms || 620;
    const langkah = (t) => {
      const p = Math.min(1, (t - t0) / durasi);
      const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      a.style.transform = `translate(${z.geserX * (1 - e)}px, ${z.geserY * (1 - e)}px) scale(${z.skala + (1 - z.skala) * e})`;
      if (p < 1) requestAnimationFrame(langkah);
      else { a.style.transform = ''; window.__zoomAktif = null; selesai(true); }
    };
    requestAnimationFrame(langkah);
  });
})();
