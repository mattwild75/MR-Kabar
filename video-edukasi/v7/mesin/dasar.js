// ═══════════════════════════════════════════════════════════════════════════
// DASAR mesin paper cut v7 "Berlayar dengan Peta Risiko".
//
// Seluruh gambar adalah FUNGSI MURNI dari waktu t (window.setVideoTime), jadi
// frame bisa dirender paralel. Gaya stop-motion: potongan kertas melangkah per
// 1/12 detik dan sedikit bergetar tiap langkah; kamera tetap halus.
// ═══════════════════════════════════════════════════════════════════════════
const NS = 'http://www.w3.org/2000/svg';
const SVG = document.getElementById('layar');
const FPS_STOP = 12;
const TL = window.TL;

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, u) => a + (b - a) * u;
const P = (t, a, d) => clamp((t - a) / Math.max(d, 1e-6));
const E = {
  out: (u) => 1 - Math.pow(1 - u, 3),
  in: (u) => u * u * u,
  inout: (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2),
  back: (u) => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2); },
  sin: (u) => 0.5 - 0.5 * Math.cos(Math.PI * u),
};
const h = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
function acak(seed) {
  let a = seed >>> 0;
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function el(tag, a = {}, induk = SVG) {
  const x = document.createElementNS(NS, tag);
  for (const k in a) x.setAttribute(k, a[k]);
  induk.appendChild(x);
  return x;
}
const tampil = (g, ya) => { const v = ya ? '' : 'none'; if (g.style.display !== v) g.style.display = v; };
const atur = (g, tr) => g.setAttribute('transform', tr);
const f1 = (x) => (+x).toFixed(1);
const f2 = (x) => (+x).toFixed(2);

// ── potongan kertas: tepi digunting tangan (sedikit bergelombang) ──────────
let benih = 1;
function gunting(pts, amp = 1.3, langkah = 9, seed = benih++) {
  const r = acak(seed * 7919);
  const out = [];
  for (let i = 0; i < pts.length; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[(i + 1) % pts.length];
    const len = Math.hypot(x1 - x0, y1 - y0) || 1;
    const k = Math.max(1, Math.round(len / langkah));
    const nx = -(y1 - y0) / len, ny = (x1 - x0) / len;
    for (let j = 0; j < k; j++) {
      const u = j / k, g = (r() - 0.5) * 2 * amp;
      out.push([x0 + (x1 - x0) * u + nx * g, y0 + (y1 - y0) * u + ny * g]);
    }
  }
  return 'M' + out.map((p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L') + 'Z';
}
const oval = (cx, cy, rx, ry = rx, n = 44) => Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
function kotak(x, y, w, t, r = 0) {
  if (!r) return [[x, y], [x + w, y], [x + w, y + t], [x, y + t]];
  const pts = [];
  for (const [cx, cy, a0] of [[x + w - r, y + r, -Math.PI / 2], [x + w - r, y + t - r, 0], [x + r, y + t - r, Math.PI / 2], [x + r, y + r, Math.PI]]) {
    for (let i = 0; i <= 5; i++) { const a = a0 + (i / 5) * (Math.PI / 2); pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
  }
  return pts;
}
function kertas(pts, fill, induk, o = {}) {
  return el('path', { d: gunting(pts, o.amp ?? 1.3, o.langkah ?? 9), fill, ...(o.attr || {}) }, induk);
}
/** Pita gelombang: tepi atas mengikuti f(x), bawah rata di yBawah. */
function pitaGelombang(x0, x1, f, yBawah, step = 24) {
  const pts = [];
  for (let x = x0; x <= x1; x += step) pts.push([x, f(x)]);
  pts.push([x1, yBawah], [x0, yBawah]);
  return pts;
}
const bintang = (cx, cy, r1, r2, n = 5, rot = -Math.PI / 2) => Array.from({ length: n * 2 }, (_, i) => { const a = rot + (i * Math.PI) / n, r = i % 2 ? r2 : r1; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; });

/** Teks biasa (Jakarta) atau judul (Bebas). */
function teks(induk, x, y, isi, o = {}) {
  const t = el('text', { x, y, 'font-size': o.ukuran ?? 28, 'font-weight': o.tebal ?? 700, fill: o.warna ?? '#1d3557',
    'text-anchor': o.jangkar ?? 'start', ...(o.bebas ? { class: 'bebas' } : o.mono ? { class: 'mono' } : {}),
    ...(o.spasi ? { 'letter-spacing': o.spasi } : {}), ...(o.attr || {}) }, induk);
  t.textContent = isi;
  return t;
}
/** Teks berbaris (dipotong per lebar kira-kira jumlah huruf). */
function teksBaris(induk, x, y, isi, o = {}) {
  const maks = o.maks ?? 40, jarak = o.jarak ?? (o.ukuran ?? 28) * 1.25;
  const baris = [];
  let kini = '';
  for (const k of isi.split(' ')) {
    if ((kini + ' ' + k).trim().length > maks && kini) { baris.push(kini); kini = k; } else kini = (kini + ' ' + k).trim();
  }
  if (kini) baris.push(kini);
  return baris.map((b, i) => teks(induk, x, y + i * jarak, b, o));
}
/** Lebar huruf Bebas Neue (em), diukur dengan ukur_huruf.cjs. */
const LEBAR_BEBAS = {"0":0.4,"1":0.4,"2":0.4,"3":0.4,"4":0.4,"5":0.4,"6":0.4,"7":0.4,"8":0.4,"9":0.4,"A":0.401,"B":0.404,"C":0.383,"D":0.406,"E":0.363,"F":0.344,"G":0.391,"H":0.42,"I":0.192,"J":0.265,"K":0.414,"L":0.344,"M":0.538,"N":0.427,"O":0.4,"P":0.386,"Q":0.4,"R":0.403,"S":0.372,"T":0.364,"U":0.402,"V":0.382,"W":0.557,"X":0.406,"Y":0.394,"Z":0.362," ":0.16,".":0.188,",":0.188,":":0.188,"-":0.27,"!":0.21,"?":0.363,"&":0.417};
const lebarBebas = (s, uk, spasi = 0) => [...s].reduce((a, c) => a + uk * (LEBAR_BEBAS[c.toUpperCase()] ?? 0.4) + spasi, 0) - spasi;
/** Huruf guntingan per huruf (untuk dijatuhkan satu-satu); tengah di xTengah. */
function hurufGuntingan(induk, isi, xTengah, y, uk, o = {}) {
  const spasi = o.spasi ?? uk * 0.03;
  let x = xTengah - lebarBebas(isi, uk, spasi) / 2;
  const out = [];
  for (const c of isi) {
    const w = uk * (LEBAR_BEBAS[c.toUpperCase()] ?? 0.4);
    if (c !== ' ') { const g = judulKertas(induk, x, y, c, { ukuran: uk, warna: o.warna, bayang: o.bayang, geser: o.geser ?? Math.max(3, uk * 0.04) }); g._x = x + w / 2; g._y = y - uk * 0.4; out.push(g); }
    x += w + spasi;
  }
  return out;
}
/** Huruf guntingan: teks Bebas dengan bayangan potongan kertas di belakangnya. */
function judulKertas(induk, x, y, isi, o = {}) {
  const g = el('g', { filter: 'url(#b3)' }, induk);
  teks(g, x + (o.geser ?? 5), y + (o.geser ?? 5), isi, { bebas: true, ukuran: o.ukuran ?? 120, warna: o.bayang ?? '#1d3557', jangkar: o.jangkar ?? 'start', spasi: o.spasi });
  teks(g, x, y, isi, { bebas: true, ukuran: o.ukuran ?? 120, warna: o.warna ?? '#fffdf5', jangkar: o.jangkar ?? 'start', spasi: o.spasi });
  return g;
}

// ── isyarat bunyi (diekspor untuk build_sfx.py) ───────────────────────────
const SFX = [];
window.SFX = SFX;
const bunyi = (t, nama, g = 1) => { if (t >= 0) SFX.push({ t: +t.toFixed(3), nama, g: +g.toFixed(2) }); };
/** Suasana latar (angin, hujan, ombak, camar 0..1) sebagai kunci waktu; diinterpolasi build_sfx.py. */
const SUASANA = [];
window.SUASANA = SUASANA;
const suasana = (t, o) => SUASANA.push({ t: +t.toFixed(3), angin: o.angin ?? 0, hujan: o.hujan ?? 0, ombak: o.ombak ?? 0.4, camar: o.camar ?? 0 });
/** Isyarat musik: mulai potongan musik "nama" pada t (musik.py). */
const MUSIK = [];
window.MUSIK = MUSIK;
const musik = (t, nama, o = {}) => MUSIK.push({ t: +t.toFixed(3), nama, ...o });

// ── waktu stop-motion ──────────────────────────────────────────────────────
const langkahDari = (t) => Math.floor(t * FPS_STOP + 1e-6);
const tStop = (t) => langkahDari(t) / FPS_STOP;
/** Getar stop-motion per potongan: geser & putar kecil, berganti tiap langkah. */
const getar = (id, l, cx, cy, s = 1) => {
  const a = h(l * 31.7 + id * 7.3) - 0.5, b = h(l * 17.1 + id * 3.9) - 0.5, c = h(l * 11.3 + id * 5.1) - 0.5;
  return `translate(${(a * 1.8 * s).toFixed(2)} ${(b * 1.8 * s).toFixed(2)}) rotate(${(c * 0.7 * s).toFixed(2)} ${cx} ${cy})`;
};
/** Masuk dengan pantulan kertas: 1 = jarak penuh, 0 = sudah di tempat. */
const muncul = (tq, t0, d = 0.42) => 1 - E.back(P(tq, t0, d));
/** Tampil dari t0 sampai t1 dengan skala melenting masuk & menyusut keluar. */
function hidup(tq, t0, t1, dMasuk = 0.32, dKeluar = 0.28) {
  if (tq < t0 || tq > t1 + dKeluar) return 0;
  return E.back(P(tq, t0, dMasuk)) * (1 - E.in(P(tq, t1, dKeluar)));
}

// ── kalimat & kata dari timeline ───────────────────────────────────────────
const BARIS = TL.lines;
const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[^a-z0-9]/g, '');
/** Kalimat yang diawali teks ini (display), opsional dalam babak tertentu. */
function B(awal, babak) {
  const k = BARIS.find((l) => l.display.startsWith(awal) && (!babak || l.scene === babak));
  if (!k) throw new Error('kalimat tidak ditemukan: ' + awal);
  return k;
}
/** Waktu mulai kata ke-n (ejaan TTS) yang cocok dengan awalan "kata" dalam kalimat l. */
function W(l, kata, n = 0) {
  const k = norm(kata);
  const cocok = l.words.filter((w) => norm(w.w).startsWith(k) || k.startsWith(norm(w.w)) && norm(w.w).length > 2);
  if (!cocok.length) throw new Error(`kata "${kata}" tidak ada di: ${l.display}`);
  return cocok[Math.min(n, cocok.length - 1)].t;
}
const WA = (l, kata, n = 0) => { const k = norm(kata); const c = l.words.filter((w) => norm(w.w).startsWith(k)); const w = c[Math.min(n, c.length - 1)]; return w.t + w.d; };
const ADEGAN_TL = Object.fromEntries(TL.scenes.map((s) => [s.id, s]));

// ── kamera berlapis (parallax) per adegan ──────────────────────────────────
/** Lapisan: grup dengan laju parallax (0 = melekat layar, 1 = bidang utama). */
function lapisan(induk, laju, o = {}) { const g = el('g', o, induk); g._laju = laju; return g; }
/** Terapkan kamera {x, y, z} ke daftar lapisan. Titik (x,y) bidang utama tampil di tengah layar. */
function kamera(lap, k) {
  for (const g of lap) {
    const z = 1 + (k.z - 1) * (g._laju ?? 1);
    const x = k.x * (g._laju ?? 1), y = k.y * (g._laju ?? 1);
    atur(g, `translate(960 540) scale(${z.toFixed(4)}) translate(${(-960 - x).toFixed(1)} ${(-540 - y).toFixed(1)})`);
  }
}
/** Interpolasi daftar kunci [[t, {x,y,z}], ...] dengan pelan masuk-keluar. */
function kunciKamera(t, kunci) {
  if (t <= kunci[0][0]) return { ...kunci[0][1] };
  for (let i = 1; i < kunci.length; i++) {
    const [t0, a] = kunci[i - 1], [t1, b] = kunci[i];
    if (t <= t1) { const u = E.inout(P(t, t0, t1 - t0)); return { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), z: lerp(a.z, b.z, u) }; }
  }
  return { ...kunci[kunci.length - 1][1] };
}
/** Interpolasi nilai tunggal dari kunci [[t, v], ...]. */
function kunci1(t, kunci, ease = E.inout) {
  if (t <= kunci[0][0]) return kunci[0][1];
  for (let i = 1; i < kunci.length; i++) {
    const [t0, a] = kunci[i - 1], [t1, b] = kunci[i];
    if (t <= t1) return lerp(a, b, ease(P(t, t0, t1 - t0)));
  }
  return kunci[kunci.length - 1][1];
}

// ── foto asli dicetak berbingkai putih ────────────────────────────────────
let fotoId = 0;
function fotoCetak(induk, src, x, y, w, hgt, o = {}) {
  const g = el('g', {}, induk);
  const id = 'kf' + fotoId++;
  const tepi = o.tepi ?? 12, bawah = o.ket ? 40 : tepi;
  const cp = el('clipPath', { id }, g);
  el('rect', { x: x + tepi, y: y + tepi, width: w - 2 * tepi, height: hgt - tepi - bawah }, cp);
  kertas(kotak(x, y, w, hgt, 3), '#fffdf7', g, { amp: 0.8, attr: { filter: 'url(#b2)' } });
  el('image', { href: 'aset/foto/' + src + '.jpg', x: x + tepi, y: y + tepi, width: w - 2 * tepi, height: hgt - tepi - bawah, 'clip-path': `url(#${id})`, preserveAspectRatio: o.posisi ?? 'xMidYMid slice' }, g);
  if (o.ket) teks(g, x + w / 2, y + hgt - 13, o.ket, { ukuran: o.ukuranKet ?? 19, tebal: 600, warna: '#5b4630', jangkar: 'middle', attr: { 'font-style': 'italic' } });
  if (o.selotip !== false) {
    for (const [sx, r] of [[0.08, -14], [0.82, 12]]) {
      const s = el('g', { transform: `rotate(${r} ${x + w * sx + 30} ${y + 4})`, opacity: 0.82 }, g);
      kertas(kotak(x + w * sx, y - 8, 62, 22), '#f3e3a8', s, { amp: 1.2, langkah: 6 });
    }
  }
  g._cx = x + w / 2; g._cy = y + hgt / 2;
  return g;
}
/** Tangkapan layar aplikasi di dalam bingkai tablet kertas. */
function tablet(induk, src, x, y, w, hgt, o = {}) {
  const g = el('g', { filter: 'url(#b3)' }, induk);
  const id = 'kt' + fotoId++;
  kertas(kotak(x, y, w, hgt, 26), o.warna ?? '#1e293b', g, { amp: 0.9 });
  kertas(kotak(x + 18, y + 18, w - 36, hgt - 36, 8), '#f8fafc', g, { amp: 0.5 });
  const cp = el('clipPath', { id }, g);
  el('rect', { x: x + 22, y: y + 22, width: w - 44, height: hgt - 44, rx: 6 }, cp);
  const img = el('image', { href: src, x: x + 22, y: y + 22, width: w - 44, height: hgt - 44, 'clip-path': `url(#${id})`, preserveAspectRatio: o.posisi ?? 'xMidYMin slice' }, g);
  kertas(oval(x + w - 10, y + hgt / 2, 4, 4, 10), '#475569', g, { amp: 0.2 });
  g._img = img; g._cx = x + w / 2; g._cy = y + hgt / 2;
  return g;
}

// ── paku payung, selotip, stempel ─────────────────────────────────────────
function paku(induk, x, y, warna = '#d62828') {
  const g = el('g', { filter: 'url(#bt)' }, induk);
  kertas(oval(x, y, 9, 9, 16), warna, g, { amp: 0.3 });
  kertas(oval(x - 2.5, y - 2.5, 3, 3, 10), '#ffb3b3', g, { amp: 0.1 });
  return g;
}
function stempel(induk, x, y, isi, o = {}) {
  const g = el('g', {}, induk);
  const w = o.lebar ?? isi.length * (o.ukuran ?? 44) * 0.52 + 40, hgt = (o.ukuran ?? 44) * 1.35;
  el('rect', { x: x - w / 2, y: y - hgt / 2, width: w, height: hgt, rx: 8, fill: 'none', stroke: o.warna ?? '#c1121f', 'stroke-width': 6, opacity: 0.88 }, g);
  teks(g, x, y + (o.ukuran ?? 44) * 0.36, isi, { bebas: true, ukuran: o.ukuran ?? 44, warna: o.warna ?? '#c1121f', jangkar: 'middle', spasi: 2, attr: { opacity: 0.9 } });
  g._x = x; g._y = y;
  return g;
}
/** Animasi stempel: jatuh dari besar ke ukuran asli lalu sedikit miring. */
function aturStempel(g, tq, t0, rot = -8) {
  tampil(g, tq >= t0);
  if (tq < t0) return;
  const u = E.out(P(tq, t0, 0.14));
  atur(g, `translate(${g._x} ${g._y}) rotate(${rot}) scale(${lerp(1.9, 1, u).toFixed(3)}) translate(${-g._x} ${-g._y})`);
}

// ── tali jemuran dengan label kertas tergantung ───────────────────────────
function taliLabel(induk, x0, x1, y, label, o = {}) {
  const g = el('g', {}, induk);
  el('path', { d: `M${x0} ${y} Q${(x0 + x1) / 2} ${y + 34} ${x1} ${y}`, stroke: '#7a5230', 'stroke-width': 4, fill: 'none' }, g);
  const n = label.length;
  const item = label.map((isi, i) => {
    const u = (i + 1) / (n + 1), x = lerp(x0, x1, u), yy = y + 34 * 4 * u * (1 - u) * 0.5 + 6;
    const k = el('g', {}, g);
    const w = o.lebar ?? Math.max(150, isi.length * (o.ukuran ?? 30) * 0.55 + 30), hgt = o.tinggi ?? 70;
    kertas(kotak(x - w / 2, yy + 10, w, hgt, 4), (o.warna && o.warna[i]) || '#fffdf5', k, { amp: 1, attr: { filter: 'url(#b2)' } });
    el('rect', { x: x - 6, y: yy - 2, width: 12, height: 22, rx: 3, fill: '#c9a46c' }, k);
    teks(k, x, yy + 10 + hgt / 2 + (o.ukuran ?? 30) * 0.35, isi, { bebas: o.bebas ?? true, ukuran: o.ukuran ?? 30, warna: (o.warnaTeks && o.warnaTeks[i]) || '#1d3557', jangkar: 'middle', spasi: 1 });
    k._x = x; k._y = yy;
    return k;
  });
  g._item = item;
  return g;
}
/** Label tergantung berayun saat muncul (t0 per label). */
function ayunLabel(k, tq, t0, l, id) {
  tampil(k, tq >= t0);
  if (tq < t0) return;
  const u = P(tq, t0, 1.2);
  const sudut = Math.sin(u * Math.PI * 3) * 14 * (1 - u) + Math.sin(tq * 1.3 + id) * 1.5;
  const turun = (1 - E.back(P(tq, t0, 0.3))) * -60;
  atur(k, `translate(0 ${turun.toFixed(1)}) rotate(${sudut.toFixed(2)} ${k._x} ${k._y})`);
}
