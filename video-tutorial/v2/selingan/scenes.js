// ═══════════════════════════════════════════════════════════════════════════
// Koreografi ADEGAN ANIMASI tutorial MR Kabar v2 (pembuka, kartu bab, catatan
// akhir bab, penutup). Mesinnya engine.js video edukasi v6, dipakai apa
// adanya: L(id) awal kalimat, LE(id) akhirnya, W(id, 'kata') saat kata
// diucapkan (ejaan mesin suara).
//
// Benang merahnya PETA RUTE: tiga belas titik di kaki layar, satu per bab.
// Di pembuka seluruh rute diperkenalkan; di tiap kartu bab kapal kecil maju
// satu titik. Langit ikut bergeser dari fajar ke siang, badai di bab kejadian
// risiko, senja, malam bermercusuar saat pimpinan membaca peta, lalu fajar
// lagi di penutup: satu tahun penilaian sebagai satu hari pelayaran.
// ═══════════════════════════════════════════════════════════════════════════
const X0 = 150;
const AD = (a) => SC[a];
const KAL = (a) => TL.lines.filter((l) => l.scene === a);

const TITIK = ['Masuk', 'Data Umum', 'CEE', 'RS Pemda', 'RS PD', 'Operasional', 'Monev', 'Lapor', 'Telaah', 'Cetak', 'Laporan', 'Dasbor', 'Penutup'];

/**
 * Peta rute: garis putus-putus berisi 13 titik. `aktif` = bab sekarang (1..13),
 * kapal bergerak dari titik sebelumnya ke titik ini selama [tKapal, tKapal+1.4].
 * `muncul`: daftar waktu munculnya tiap titik (pembuka); kosong = langsung semua.
 */
function rute(o) {
  const n = TITIK.length, x0 = o.x ?? 190, x1 = o.x1 ?? 1730, y = o.y ?? 968;
  const sk = o.skala ?? 1;
  const xs = TITIK.map((_, i) => x0 + ((x1 - x0) * i) / (n - 1));
  const ns = 'http://www.w3.org/2000/svg';
  const el = buat('div', 'it', UI);
  posisi(el, { x: 0, y: 0, w: LW, h: LH });
  el.style.zIndex = 3;
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('width', LW); svg.setAttribute('height', LH);
  svg.style.overflow = 'visible';
  el.appendChild(svg);
  const g = document.createElementNS(ns, 'g');
  svg.appendChild(g);
  const garisDasar = document.createElementNS(ns, 'line');
  Object.entries({ x1: xs[0], y1: y, x2: xs[n - 1], y2: y, stroke: 'rgba(244,241,234,.28)', 'stroke-width': 2.5 * sk, 'stroke-dasharray': `${7 * sk} ${9 * sk}` })
    .forEach(([k, v]) => garisDasar.setAttribute(k, v));
  g.appendChild(garisDasar);
  const garisLalu = document.createElementNS(ns, 'line');
  Object.entries({ x1: xs[0], y1: y, x2: xs[0], y2: y, stroke: '#f2b45a', 'stroke-width': 4 * sk, 'stroke-linecap': 'round' })
    .forEach(([k, v]) => garisLalu.setAttribute(k, v));
  g.appendChild(garisLalu);
  const simpul = TITIK.map((nama, i) => {
    const c = document.createElementNS(ns, 'circle');
    c.setAttribute('cx', xs[i]); c.setAttribute('cy', y);
    g.appendChild(c);
    const t = document.createElementNS(ns, 'text');
    t.setAttribute('x', xs[i]); t.setAttribute('y', y + (i % 2 ? -26 : 40) * sk);
    t.setAttribute('text-anchor', 'middle');
    t.setAttribute('font-family', 'Jakarta'); t.setAttribute('font-weight', '800');
    t.setAttribute('font-size', String(15 * sk)); t.setAttribute('letter-spacing', String(2.4 * sk));
    t.textContent = nama.toUpperCase();
    g.appendChild(t);
    const no = document.createElementNS(ns, 'text');
    no.setAttribute('x', xs[i]); no.setAttribute('y', y + 5 * sk);
    no.setAttribute('text-anchor', 'middle'); no.setAttribute('font-family', 'Bebas');
    no.setAttribute('font-size', String(15 * sk));
    no.textContent = String(i + 1);
    g.appendChild(no);
    return { c, t, no };
  });
  const kapal = document.createElementNS(ns, 'g');
  kapal.innerHTML = `<path d="M-22 0 L22 0 L15 11 L-15 11 Z" fill="#f4f1ea"/><path d="M-2 -2 L-2 -30 L16 -6 Z" fill="#f2b45a"/><line x1="-2" y1="0" x2="-2" y2="-31" stroke="#f4f1ea" stroke-width="2"/>`;
  g.appendChild(kapal);
  const it = daftar({ ...o, el, fin: o.fin ?? 0.6, fout: o.fout ?? 0.5 });
  it.render = (t, pin, pout) => {
    el.style.opacity = E.out(pin) * (1 - E.out(pout));
    const akt = o.aktif ?? 0;
    const uk = o.tKapal !== undefined ? E.inout(P(t, o.tKapal, 1.4)) : 1;
    const posKapal = akt ? lerp(xs[Math.max(0, akt - 2)], xs[akt - 1], akt > 1 ? uk : 1) : xs[0];
    garisLalu.setAttribute('x2', akt ? posKapal : xs[0]);
    simpul.forEach(({ c, t: lbl, no }, i) => {
      const tm = o.muncul ? o.muncul[i] : null;
      const m = tm === null || tm === undefined ? 1 : E.back(P(t, tm, 0.45));
      const lalu = akt && i < akt - 1, kini = akt && i === akt - 1 && uk > 0.98;
      const r = (kini ? 15 : lalu ? 10 : 9) * sk * m;
      c.setAttribute('r', Math.max(0, r));
      c.setAttribute('fill', kini ? '#f4f1ea' : lalu ? '#f2b45a' : 'rgba(6,18,31,.85)');
      c.setAttribute('stroke', kini ? '#f2b45a' : lalu ? '#f2b45a' : 'rgba(244,241,234,.55)');
      c.setAttribute('stroke-width', String((kini ? 4 : 2) * sk));
      lbl.setAttribute('fill', kini ? '#ffd68a' : lalu ? 'rgba(244,241,234,.85)' : 'rgba(244,241,234,.5)');
      lbl.setAttribute('opacity', String(clamp(m)));
      no.setAttribute('fill', kini ? '#06121f' : lalu ? '#06121f' : 'rgba(244,241,234,.75)');
      no.setAttribute('opacity', String(clamp(m)));
    });
    const bob = Math.sin(t * 3.2) * 2.5;
    kapal.setAttribute('transform', `translate(${posKapal}, ${y - 26 * sk + bob}) scale(${0.95 * sk})`);
    kapal.setAttribute('opacity', akt ? '1' : '0');
  };
  return it;
}

/** Tanda centang yang digambar (lingkaran + guratan). */
function centang(t0, t1, x, y, s = 1) {
  bunyi(t0, 'tik', 0.6);
  return svgItem({
    t0, t1, x, y, w: 64 * s, h: 64 * s, fin: 0.5, fout: 0.4,
    isi: `<circle cx="${32 * s}" cy="${32 * s}" r="${28 * s}" fill="none" stroke="#f2b45a" stroke-width="${4 * s}"/>
          <path d="M${18 * s} ${33 * s} L${28 * s} ${43 * s} L${47 * s} ${22 * s}" fill="none" stroke="#f2b45a" stroke-width="${5.5 * s}" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="60" stroke-dashoffset="60"/>`,
    gambar: (el, t, pin) => { el.querySelector('path').setAttribute('stroke-dashoffset', String(60 * (1 - E.out(P(t, t0 + 0.12, 0.4))))); },
  });
}

/** Satu kartu "kertas" bergaya formulir (dipakai untuk surat penunjukan). */
function kertas(o) {
  return teks({
    ...o, cls: 'kertas-t', anim: 'jatuh', fin: 0.9,
    html: `<div style="background:#f3ead6;border-radius:6px;padding:34px 40px 40px;box-shadow:0 30px 70px rgba(0,0,0,.55);font-family:Jakarta;transform:rotate(-3deg)">
      <div style="font-size:18px;font-weight:800;letter-spacing:.28em;color:#7a5a2b;text-transform:uppercase">Surat Penunjukan</div>
      <div style="height:3px;background:#e5484d;width:120px;margin:12px 0 22px"></div>
      <div style="font-size:26px;line-height:1.45;color:#2a2118">Menunjuk yang namanya tersebut di bawah ini sebagai</div>
      <div style="font-family:Bebas;font-size:62px;line-height:1;color:#06121f;margin:14px 0 8px">PIC Manajemen Risiko</div>
      <div style="font-size:24px;color:#4a3c2c">pada Perangkat Daerah · Tahun Penilaian 2026</div>
      ${[0, 1, 2].map(() => '<div style="height:12px;background:#d9ceb6;border-radius:6px;margin-top:16px"></div>').join('')}
    </div>`,
  });
}

/** Kunci dunia untuk satu adegan: awal dan akhir. */
function dunia(a, awal, akhir) {
  const s = AD(a);
  D(s.start, { ease: 'lin', ...awal });
  D(s.end - 0.02, { ease: 'sine', ...awal, ...(akhir || {}) });
}

// Langit per bab: satu tahun = satu hari pelayaran.
const LANGIT_BAB = {
  1: { langit: 'fajar', shipX: 520, harbor: 1, lh: 0, beam: 0 },
  2: { langit: 'fajar', shipX: 640, harbor: 0.8, lh: 0, beam: 0 },
  3: { langit: 'fajar', shipX: 760, harbor: 0.5, lh: 0, beam: 0 },
  4: { langit: 'siang', shipX: 880, harbor: 0.2, lh: 0, beam: 0 },
  5: { langit: 'siang', shipX: 980, harbor: 0, lh: 0, beam: 0 },
  6: { langit: 'siang', shipX: 1080, harbor: 0, lh: 0, beam: 0, wind: 0.45 },
  7: { langit: 'senja', shipX: 1160, harbor: 0, lh: 0, beam: 0, wind: 0.5 },
  8: { langit: 'badai', shipX: 1220, harbor: 0, lh: 0, beam: 0, wind: 0.95, rain: 0.8, cloud: 1 },
  9: { langit: 'malam', shipX: 1280, harbor: 0, lh: 1, beam: 1, wind: 0.55, rain: 0.15 },
  10: { langit: 'senja', shipX: 1340, harbor: 0.2, lh: 0, beam: 0, wind: 0.3, rain: 0 },
  11: { langit: 'senja', shipX: 1400, harbor: 0.4, lh: 0, beam: 0, wind: 0.3 },
  12: { langit: 'malam', shipX: 1460, harbor: 0.6, lh: 1, beam: 1, wind: 0.3 },
  13: { langit: 'fajar', shipX: 1500, harbor: 1, lh: 1, beam: 0, wind: 0.25 },
};
const FOTO_BAB = { 1: 'pantai_meulaboh', 8: 'badai_laut', 12: 'mercusuar_breueh' };

// ════════════════ PEMBUKA ═════════════════════════════════════════════════
{
  const s = AD('buka');
  const [k1, k2, k3, k4, k5] = KAL('buka').map((l) => l.id);
  D(s.start, { langit: 'malam', camZ: 1.15, camY: -20, shipX: 560, shipS: 0.42, harbor: 1, lh: 1, beam: 1, wind: 0.2, dim: 0.15, buoys: 0 });
  D(L(k1) - 0.5, { langit: 'fajar', camZ: 1.05, camY: 0, beam: 0, dim: 0.35, ease: 'sine' });
  D(L(k3), { dim: 0.55, shipX: 620 });
  D(LE(k4), { dim: 0.45 });
  D(W(k5, 'mulai'), { dim: 0.1, shipX: 640, camZ: 1.0 });
  D(s.end - 0.02, { dim: 0.05, shipX: 900, shipS: 0.5, ease: 'inout' });

  teks({ t0: s.start + 0.5, t1: L(k1) - 0.4, x: 0, y: 470, w: LW, cls: 'serif-s ctr redup', html: 'Inspektorat Kabupaten Aceh Barat mempersembahkan', anim: 'fade', fin: 1.0, fout: 0.7 });

  // Kalimat 1: PIC baru dengan surat penunjukan, lalu satu pertanyaan.
  foto({ src: 'jembatan_meulaboh', t0: L(k1) - 0.6, t1: L(k2) - 0.1, kb: [-40, 0, 1.16, 30, -10, 1.05], gelap: 0.35 });
  tirai({ t0: L(k1) - 0.4, t1: L(k2) - 0.1, bg: 'linear-gradient(90deg, rgba(3,9,16,.92) 0%, rgba(3,9,16,.75) 48%, rgba(3,9,16,.15) 80%)' });
  kertas({ t0: W(k1, 'surat'), t1: W(k1, 'pertanyaan') - 0.2, x: 1090, y: 210, w: 640 });
  teks({ t0: W(k1, 'surat') + 0.2, t1: LE(k1) + 0.1, x: X0, y: 240, w: 860, cls: 'kicker', html: 'Hari pertama sebagai PIC', anim: 'kiri' });
  teks({ t0: W(k1, 'aplikasinya'), t1: LE(k1) + 0.1, x: X0, y: 300, w: 860, cls: 'serif', html: 'Aplikasinya <em>MR Kabar</em>.', anim: 'naik' });
  teks({ t0: W(k1, 'dari'), t1: L(k2) - 0.2, x: X0, y: 470, w: 1700, cls: 'hero', html: 'Dari mana<br>mulainya?', anim: 'huruf' });

  // Kalimat 2: judul besar.
  teks({ t0: L(k2) - 0.1, t1: LE(k2) + 0.2, x: 0, y: 200, w: LW, cls: 'serif ctr', html: '“Dari menu paling atas.”', anim: 'naik' });
  bunyi(W(k2, 'dalam') - 0.2, 'boom', 0.7);
  teks({ t0: W(k2, 'dalam') - 0.2, t1: LE(k2) + 0.4, x: 0, y: 340, w: LW, cls: 'label ctr', html: 'Video Tutorial', anim: 'fade' });
  teks({ t0: W(k2, 'dalam'), t1: LE(k2) + 0.4, x: 0, y: 390, w: LW, cls: 'hero ctr', html: 'MR KABAR', anim: 'huruf' });
  garis({ t0: W(k2, 'satu') , t1: LE(k2) + 0.4, x: 810, y: 610, w: 300, tebal: 6 });
  teks({ t0: W(k2, 'satu'), t1: LE(k2) + 0.4, x: 0, y: 640, w: LW, cls: 'serif-s ctr', html: 'Satu tahun penilaian penuh, di satu perangkat daerah: <em>Inspektorat</em>', anim: 'naik' });

  // Kalimat 3: rute dua belas bab, titiknya muncul saat disebut.
  teks({ t0: L(k3), t1: LE(k3) + 0.3, x: 0, y: 260, w: LW, cls: 'kicker ctr', html: 'Peta perjalanan', anim: 'fade' });
  teks({ t0: W(k3, 'dua'), t1: LE(k3) + 0.3, x: 0, y: 320, w: LW, cls: 'h1 ctr', html: 'Dua belas bab', anim: 'huruf' });
  const tk = [W(k3, 'dua'), W(k3, 'data'), W(k3, 'ce-e-e'), W(k3, 'tiga'), W(k3, 'tingkatan'), W(k3, 'risiko', 1),
    W(k3, 'pemantauan'), W(k3, 'kejadian'), W(k3, 'terjadi'), W(k3, 'formulir'), W(k3, 'laporan'), W(k3, 'pimpinan'), LE(k3) - 0.2];
  rute({ t0: L(k3), t1: LE(k3) + 0.3, y: 640, x: 170, x1: 1750, skala: 1.35, muncul: tk });
  tk.forEach((t, i) => { if (i) bunyi(t, 'tik', 0.35); });

  // Kalimat 4: data contoh.
  tirai({ t0: L(k4) - 0.3, t1: LE(k4) + 0.2, kuat: 0.85, bg: 'rgba(3,9,16,.8)' });
  teks({ t0: L(k4), t1: LE(k4) + 0.2, x: 0, y: 250, w: LW, cls: 'kicker ctr', html: 'Satu hal penting', anim: 'fade' });
  teks({ t0: W(k4, 'seluruh'), t1: LE(k4) + 0.2, x: 670, y: 330, w: 580, cls: 'stempel ctr', html: 'DATA CONTOH', anim: 'stempel', rot: -4 });
  teks({ t0: W(k4, 'dibuat'), t1: LE(k4) + 0.2, x: 0, y: 560, w: LW, cls: 'serif ctr', html: 'Untuk menunjukkan <em>caranya</em>, bukan untuk disalin.', anim: 'naik' });

  // Kalimat 5: daftar bab di bawah video.
  teks({ t0: L(k5), t1: LE(k5) + 0.5, x: X0, y: 250, w: 900, cls: 'kicker', html: 'Daftar bab', anim: 'kiri' });
  teks({ t0: L(k5) + 0.1, t1: LE(k5) + 0.5, x: X0, y: 300, w: 900, cls: 'h2', html: 'Lompat ke bab<br>yang Anda perlukan', anim: 'naik' });
  ['01 · Masuk dan mengenal layar', '02 · Data Umum', '03 · CEE', '04 · Risiko Strategis Pemda', '05 · Risiko Strategis PD'].forEach((b, i) => {
    teks({
      t0: L(k5) + 0.25 + i * 0.12, t1: LE(k5) + 0.5, x: 1100, y: 250 + i * 86, w: 660, anim: 'kanan', cls: 'body',
      html: `<div style="padding:16px 22px;border-radius:10px;background:${i === 1 ? 'rgba(242,180,90,.18)' : 'rgba(6,18,31,.72)'};border:1.5px solid ${i === 1 ? '#f2b45a' : 'rgba(244,241,234,.18)'};font-size:28px;font-weight:700">${b}</div>`,
    });
  });
  bunyi(W(k5, 'mulai') - 0.3, 'whoosh', 0.8);
}

// ════════════════ KARTU BAB ═══════════════════════════════════════════════
for (let n = 1; n <= 13; n++) {
  const a = `kartu-${n}`;
  const s = AD(a);
  if (!s) continue;
  const [judul, sub] = TL.kartu[String(n)];
  const kal = KAL(a)[0];
  const w = LANGIT_BAB[n];
  const lalu = LANGIT_BAB[Math.max(1, n - 1)];
  D(s.start, { ease: 'lin', ...w, shipX: lalu.shipX, shipS: 0.4, camZ: 1.04, camY: 0, dim: 0.28, buoys: 0, rain: w.rain ?? 0 });
  D(s.end - 0.02, { ease: 'sine', ...w, shipS: 0.42, camZ: 1.0, dim: 0.32, rain: w.rain ?? 0 });
  if (n === 8) kilat(s.start + 1.6, s.start + 3.1);
  bunyi(s.start + 0.05, 'whoosh', 0.85);
  bunyi(s.start + 0.45, 'boom', 0.45);

  const t0 = s.start + 0.15, t1 = s.end - 0.35;
  if (FOTO_BAB[n]) foto({ src: FOTO_BAB[n], t0: s.start, t1: s.end - 0.2, fin: 0.6, fout: 0.5, gelap: 0.5, kb: [40, 0, 1.14, -30, 0, 1.04] });
  tirai({ t0: s.start, t1: s.end - 0.2, fin: 0.4, fout: 0.5, bg: 'linear-gradient(90deg, rgba(3,9,16,.9) 0%, rgba(3,9,16,.55) 58%, rgba(3,9,16,.15) 100%)' });
  tirai({ t0: s.start, t1: s.end - 0.2, fin: 0.4, fout: 0.5, y: 800, h: 280, bg: 'linear-gradient(0deg, rgba(3,9,16,.9) 0%, rgba(3,9,16,0) 100%)' });
  teks({ t0, t1, x: X0, y: 228, w: 900, cls: 'kicker', html: n === 13 ? 'Penutup' : `Bab ${String(n).padStart(2, '0')}`, anim: 'kiri', fout: 0.4 });
  if (n < 13) teks({ t0: t0 + 0.05, t1, x: 1140, y: 130, w: 680, cls: 'h1 kanan', html: `<span style="color:transparent;-webkit-text-stroke:3px rgba(242,180,90,.7);font-size:400px">${n}</span>`, anim: 'zoom', fout: 0.4 });
  teks({ t0: t0 + 0.25, t1, x: X0 - 4, y: 470, w: 1650, cls: 'h1', html: judul, anim: 'huruf', fout: 0.4 });
  garis({ t0: t0 + 0.6, t1, x: X0 + 2, y: 640, w: 380, tebal: 6, fout: 0.4 });
  teks({ t0: t0 + 0.8, t1, x: X0 + 2, y: 668, w: 1300, cls: 'serif-s', html: sub, anim: 'naik', fout: 0.4 });
  rute({ t0: s.start + 0.2, t1, aktif: n, tKapal: s.start + 0.5, fout: 0.4 });
  void kal;
}

// ════════════════ CATATAN AKHIR BAB ═══════════════════════════════════════
for (const a of TL.scenes.map((x) => x.id).filter((x) => x.startsWith('catatan-'))) {
  const n = +a.split('-')[1];
  const s = AD(a);
  const kal = KAL(a)[0];
  const w = LANGIT_BAB[n];
  D(s.start, { ease: 'lin', ...w, shipS: 0.5, camZ: 1.08, camY: -10, dim: 0.62, rain: (w.rain ?? 0) * 0.5 });
  D(s.end - 0.02, { ease: 'sine', ...w, shipS: 0.5, camZ: 1.12, camY: -14, dim: 0.66, rain: (w.rain ?? 0) * 0.5 });
  bunyi(s.start + 0.05, 'desir', 0.5);
  const t1 = s.end - 0.4;
  tirai({ t0: s.start, t1, fin: 0.4, fout: 0.45, bg: 'linear-gradient(90deg, rgba(3,9,16,.94) 0%, rgba(3,9,16,.8) 62%, rgba(3,9,16,.45) 100%)' });
  teks({ t0: s.start + 0.15, t1, x: X0, y: 200, w: 1200, cls: 'kicker', html: `Catatan bab ${String(n).padStart(2, '0')}`, anim: 'kiri', fout: 0.4 });
  teks({ t0: s.start + 0.3, t1, x: X0, y: 250, w: 1400, cls: 'serif-s redup', html: 'Yang perlu diingat sebelum lanjut', anim: 'naik', fout: 0.4 });
  const kk = kal.pemicu;
  const hitung = {};
  kal.poin.forEach((p, i) => {
    hitung[kk[i]] = (hitung[kk[i]] || 0) + 1;
    const tp = W(kal.id, kk[i], hitung[kk[i]]);
    const y = 380 + i * 150;
    centang(tp, t1, X0, y - 4, 1.05);
    teks({ t0: tp + 0.05, t1, x: X0 + 100, y, w: 1500, cls: 'h2', html: p.replace(/=/g, '<span class="emas">=</span>'), anim: 'kiri', fout: 0.4 });
  });
  teks({ t0: s.start + 0.4, t1, x: 0, y: 1000, w: LW - 80, cls: 'label kanan', html: `MR Kabar · Tutorial · ${String(n).padStart(2, '0')} / 13`, anim: 'fade', fout: 0.4 });
}

// ════════════════ PENUTUP ═════════════════════════════════════════════════
{
  const s = AD('tutup');
  const [k1, k2, k3, k4, k5] = KAL('tutup').map((l) => l.id);
  D(s.start, { langit: 'fajar', shipX: 1100, shipS: 0.62, harbor: 1, lh: 1, beam: 0, wind: 0.22, dim: 0.35, camZ: 1.02, rain: 0 });
  D(L(k3), { dim: 0.6 });
  D(L(k4) - 0.3, { langit: 'senja', dim: 0.2, shipX: 760, shipS: 0.8, ease: 'sine' });
  D(LE(k4) + 1.0, { langit: 'malam', dim: 0.5, beam: 1, shipX: 700 });
  D(LE(k5) + 1.2, { langit: 'malam', dim: 0.72, beam: 1, shipX: 1500, shipS: 0.4 });
  D(s.end - 0.02, { langit: 'malam', dim: 0.75, beam: 1, shipX: 1560, shipS: 0.4 });

  teks({ t0: L(k1) - 0.1, t1: LE(k1) + 0.3, x: 0, y: 290, w: LW, cls: 'h1 ctr', html: '“Jadi, dari mana saya mulai?”', anim: 'huruf' });

  teks({ t0: L(k2), t1: LE(k2) + 0.4, x: X0, y: 200, w: 900, cls: 'kicker', html: 'Urutan menu = urutan kerja', anim: 'kiri' });
  const MENU = [['Form Input', 'menu'], ['Form Monitoring dan Evaluasi', 'lalu'], ['Form Cetak', 'urutan']];
  MENU.forEach(([m, kata], i) => {
    const t = W(k2, kata) + (i === 2 ? -0.3 : 0);
    bunyi(t, 'tik', 0.45);
    teks({
      t0: t, t1: LE(k2) + 0.4, x: X0, y: 290 + i * 190, w: 1700, anim: 'kiri', cls: 'h2',
      html: `<span style="display:inline-block;min-width:92px;color:#06121f;background:#f2b45a;border-radius:10px;text-align:center;margin-right:28px;padding:0 12px">${i + 1}</span>${m}`,
    });
    if (i < 2) teks({ t0: t + 0.3, t1: LE(k2) + 0.4, x: X0 + 26, y: 400 + i * 190, w: 80, cls: 'h3 emas', html: '↓', anim: 'jatuh' });
  });

  tirai({ t0: L(k3) - 0.3, t1: LE(k3) + 0.2, kuat: 0.8, bg: 'rgba(3,9,16,.75)' });
  teks({ t0: W(k3, 'data'), t1: LE(k3) + 0.2, x: 670, y: 300, w: 580, cls: 'stempel ctr', html: 'DATA CONTOH', anim: 'stempel', rot: 3 });
  teks({ t0: W(k3, 'penilaian'), t1: LE(k3) + 0.2, x: 260, y: 540, w: LW - 520, cls: 'serif ctr', html: 'Penilaian yang sesungguhnya kembali kepada <em>penilai risiko</em> di perangkat daerah Anda.', anim: 'naik' });

  foto({ src: 'pelangi_meulaboh', t0: L(k4) - 0.6, t1: LE(k4) + 0.9, kb: [0, 20, 1.14, 0, -10, 1.03], fin: 1.2 });
  tirai({ t0: L(k4) - 0.4, t1: LE(k4) + 0.9, bg: 'linear-gradient(0deg, rgba(3,9,16,.88) 0%, rgba(3,9,16,.3) 55%, rgba(3,9,16,0) 80%)' });
  svgItem({
    t0: L(k4) - 0.2, t1: LE(k4) + 0.9, x: 830, y: 230, w: 260, h: 242, fin: 1.0,
    isi: `<rect x="0" y="0" width="260" height="242" rx="34" fill="#f4f1ea"/><image href="img/mrkabar.png" x="20" y="16" width="220" height="210"/>`,
  });
  teks({ t0: W(k4, 'selamat'), t1: LE(k4) + 0.9, x: 0, y: 540, w: LW, cls: 'h1 ctr', html: 'Selamat bekerja', anim: 'huruf' });
  teks({ t0: W(k4, 'selamat', 2), t1: LE(k4) + 0.9, x: 0, y: 700, w: LW, cls: 'serif ctr emas', html: 'dan selamat berlayar.', anim: 'naik' });
  bunyi(W(k4, 'selamat', 2) - 0.2, 'boom', 0.6);

  teks({ t0: L(k5) - 0.3, t1: LE(k5) + 1.0, x: 0, y: 330, w: LW, cls: 'h3 ctr emas', html: 'Copyright © 2026', anim: 'naik' });
  teks({ t0: W(k5, 'sistem'), t1: LE(k5) + 1.0, x: 0, y: 430, w: LW, cls: 'label ctr', html: 'System Architecture &amp; Development by', anim: 'fade' });
  teks({ t0: W(k5, 'nurhikmat') - 0.1, t1: LE(k5) + 1.0, x: 0, y: 480, w: LW, cls: 'h1 ctr', html: 'Nurhikmat Muhammad', anim: 'huruf' });
  teks({ t0: W(k5, 'inspektorat'), t1: LE(k5) + 1.0, x: 0, y: 640, w: LW, cls: 'serif ctr', html: 'Inspektorat Aceh Barat', anim: 'naik' });
  garis({ t0: W(k5, 'nurhikmat') + 0.4, t1: LE(k5) + 1.0, x: 760, y: 615, w: 400, tebal: 5 });

  const FOTO_DIPAKAI = ['jembatan_meulaboh', 'pantai_meulaboh', 'badai_laut', 'mercusuar_breueh', 'pelangi_meulaboh'];
  const kreditFoto = FOTO_DIPAKAI.map((k) => KREDIT[k]).filter(Boolean)
    .map((k) => `<p>${k.judul.replace(/\.(jpe?g|png)$/i, '')}<br><small>${k.pembuat} · ${k.lisensi} · Wikimedia Commons</small></p>`).join('');
  kreditGulir({
    t0: LE(k5) + 1.4, t1: s.end - 0.3,
    html: `<div class="h2" style="margin-bottom:10px">MR Kabar</div><div class="serif-s emas">Video Tutorial · dari awal sampai laporan</div>
    <h5>Disusun oleh</h5><p>Inspektorat Kabupaten Aceh Barat</p>
    <h5>System Architecture &amp; Development</h5><p>Nurhikmat Muhammad, Inspektorat Aceh Barat<br><small>Copyright © 2026</small></p>
    <h5>Rujukan</h5><p>PP No. 60 Tahun 2008 tentang SPIP</p><p>Perdep PPKD BPKP No. 4 Tahun 2019</p>
    <h5>Rekaman layar</h5><p>Aplikasi MR Kabar · isian tahun 2026 adalah data contoh</p>
    <h5>Narasi</h5><p>Suara sintetis Ardi &amp; Gadis</p>
    <h5>Musik</h5><p>Komposisi orisinal</p>
    <h5>Foto</h5>${kreditFoto}
    <h5>Huruf</h5><p>Bebas Neue · Plus Jakarta Sans · Playfair Display<br><small>SIL Open Font License</small></p>`,
  });
}

siapDunia();
window.setVideoTime(0);
