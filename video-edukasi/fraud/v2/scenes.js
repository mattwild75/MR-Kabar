// ═══════════════════════════════════════════════════════════════════════════
// Koreografi video edukasi Lapor Dugaan Kecurangan v2 — "Bunyikan Lonceng".
// Waktu SELALU dirujuk lewat kalimat:
//   L(id)  awal kalimat, LE(id) akhir kalimat, W(id, 'kata') saat kata
//   diucapkan (kata = ejaan TTS, mis. KPK -> 'ka-pe-ka', ACFE -> 'a-ce-ef-e').
// Kalau durasi narasi berubah, seluruh tampilan ikut bergeser sendiri.
//
// Alur latar (dunia laut, engine.js): kapal berlayar -> badai (risiko) ->
// lambung dibor dari dalam (kecurangan) -> air merembes makin deras selama
// awak diam -> lonceng berbunyi -> kebocoran ditambal -> pulang saat fajar.
// ═══════════════════════════════════════════════════════════════════════════
const X0 = 150; // margin kiri tipografi
let _uid = 0;
const uid = () => ++_uid;

// penanda babak di pojok kiri atas (seperti cap pada film dokumenter)
function tandaBab(scene, teksBab, akhir) {
  const s = SC[scene];
  teks({ t0: s.first_line - 0.3, t1: akhir ?? s.end - 0.6, x: 80, y: 52, cls: 'cap', html: teksBab, anim: 'kiri', fin: 0.6, fout: 0.5 });
}
function capKanan(t0, t1, html) {
  const it = teks({ t0, t1, x: 0, y: 52, cls: 'cap', html, anim: 'kanan', fin: 0.6, fout: 0.5 });
  it.el.style.left = 'auto';
  it.el.style.right = '80px';
  return it;
}
/** Daftar yang muncul satu-satu. */
function barisan(butir, o) {
  return butir.map(([t, html], i) => {
    if (o.bunyi !== false) bunyi(t, 'tik', 0.5);
    return teks({ t0: t, t1: o.t1, x: o.x, y: o.y + i * o.jarak, w: o.w || 900, cls: o.cls || 'h4', html, anim: o.anim || 'kiri', fout: 0.4 });
  });
}
/** Bungkus render sebuah item: f(t, el) dijalankan sesudah render bawaannya. */
function sesudah(it, f) {
  const r = it.render;
  it.render = (t, a, b, c) => { r(t, a, b, c); f(t, it.el); };
  return it;
}
/** Redupkan item mulai waktu tr (sampai faktor `ke`). */
function redupkan(it, tr, ke = 0.35) {
  return sesudah(it, (t, el) => { el.style.opacity = +el.style.opacity * (1 - (1 - ke) * E.out(P(t, tr, 0.5))); });
}
/** Tahan kapal & kamera di posisinya sampai akhir babak (dunia tidak hanyut ke keadaan babak berikutnya). */
function tahan(scene, o) {
  D(SC[scene].end + 0.5, { shipX: o.shipX, shipS: o.shipS, camZ: o.camZ ?? 1, camY: o.camY ?? 0 });
}
const PUTIH = '#f4f1ea', EMAS = '#f2b45a', MERAH = '#e5484d', REDUP = 'rgba(244,241,234,.66)', HIJAU = '#4ade80';

// ── lonceng kuningan ────────────────────────────────────────────────────────
// (x, y) = titik gantung; dering = [t ...] saat lonceng dipukul.
function lonceng(o) {
  const k = o.ukuran || 1;
  const n = uid();
  (o.dering || []).forEach((t, i) => bunyi(t, 'lonceng', (o.g ?? 0.7) * (i ? 0.8 : 1)));
  const W = 560 * k, H = 480 * k, ox = W / 2, oy = 80 * k;
  const gema = [0, 1, 2].map((j) => `<path class="g${j}" d="M -150 70 A 150 150 0 0 1 -150 270 M 150 70 A 150 150 0 0 0 150 270" stroke="rgba(255,214,138,.85)" stroke-width="3.5" fill="none" stroke-linecap="round" vector-effect="non-scaling-stroke" opacity="0"/>`).join('');
  return svgItem({
    t0: o.t0, t1: o.t1, x: o.x - ox, y: o.y - oy, w: W, h: H, fin: o.fin ?? 0.7, fout: o.fout ?? 0.6,
    isi: `<defs><linearGradient id="kn${n}" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#7a531c"/><stop offset=".28" stop-color="#e9bd62"/><stop offset=".5" stop-color="#ffe3a0"/><stop offset=".72" stop-color="#c8902f"/><stop offset="1" stop-color="#6b4716"/></linearGradient>`
      + `<radialGradient id="kp${n}" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="rgba(255,214,138,.55)"/><stop offset="1" stop-color="rgba(255,214,138,0)"/></radialGradient></defs>`
      + `<g transform="translate(${ox} ${oy}) scale(${k})">`
      + `<circle class="pendar" cx="0" cy="130" r="260" fill="url(#kp${n})" opacity="0"/>`
      + `<g class="gema">${gema}</g>`
      + `<line x1="0" y1="-80" x2="0" y2="-24" stroke="#8a6a3a" stroke-width="8"/>`
      + `<g class="ayun">`
      + `<circle cx="0" cy="-14" r="13" fill="none" stroke="url(#kn${n})" stroke-width="8"/>`
      + `<rect x="-24" y="0" width="48" height="24" rx="7" fill="url(#kn${n})"/>`
      + `<g class="anak"><line x1="0" y1="40" x2="0" y2="214" stroke="#5a3d14" stroke-width="9"/><circle cx="0" cy="222" r="17" fill="#5a3d14"/></g>`
      + `<path d="M -48 22 C -54 72 -66 142 -112 200 L 112 200 C 66 142 54 72 48 22 Z" fill="url(#kn${n})"/>`
      + `<path d="M -50 64 Q 0 76 50 64" stroke="rgba(90,60,20,.55)" stroke-width="5" fill="none"/>`
      + `<path d="M -80 168 Q 0 184 80 168" stroke="rgba(90,60,20,.55)" stroke-width="5" fill="none"/>`
      + `<rect x="-124" y="194" width="248" height="22" rx="11" fill="url(#kn${n})"/>`
      + `<path d="M -22 40 C -28 90 -40 140 -70 186" stroke="rgba(255,255,255,.5)" stroke-width="9" fill="none" stroke-linecap="round"/>`
      + `</g></g>`,
    gambar: (el, t) => {
      let a = 0, g = 0, uTerakhir = 99;
      for (const tr of o.dering || []) {
        const u = t - tr;
        if (u < 0) continue;
        a += 15 * Math.exp(-u * 1.3) * Math.sin(u * 7.2);
        uTerakhir = Math.min(uTerakhir, u);
      }
      if (o.ayun) a += Math.sin(t * 1.3) * o.ayun;
      g = uTerakhir < 2.4 ? 1 - uTerakhir / 2.4 : 0;
      el.querySelector('.ayun').setAttribute('transform', `rotate(${a.toFixed(2)})`);
      el.querySelector('.anak').setAttribute('transform', `rotate(${(-a * 0.7).toFixed(2)} 0 40)`);
      el.querySelector('.pendar').setAttribute('opacity', (0.25 + 0.75 * g) * (o.pendar ?? 1));
      for (let j = 0; j < 3; j++) {
        const u = clamp((uTerakhir - j * 0.22) / 1.3);
        const p = el.querySelector('.g' + j);
        p.setAttribute('opacity', uTerakhir < 99 && u > 0 && u < 1 ? (1 - u) * 0.75 : 0);
        p.setAttribute('transform', `translate(0 ${130 - 130 * (1 + u * 1.3)}) scale(${1 + u * 1.3})`);
      }
    },
  });
}

// ── mata yang memilih terpejam ──────────────────────────────────────────────
function mata(o) {
  const n = uid();
  const W = 640, H = 320, cx = W / 2, cy = H / 2;
  return svgItem({
    t0: o.t0, t1: o.t1, x: o.x - cx, y: o.y - cy, w: W, h: H, fin: 0.6,
    isi: `<defs><clipPath id="mt${n}"><path class="klip" d=""/></clipPath><radialGradient id="ir${n}"><stop offset="0" stop-color="#ffd68a"/><stop offset=".55" stop-color="#c8902f"/><stop offset="1" stop-color="#5a3d14"/></radialGradient></defs>`
      + `<g clip-path="url(#mt${n})"><rect width="${W}" height="${H}" fill="#e8e2d4"/><circle class="iris" cx="${cx}" cy="${cy}" r="88" fill="url(#ir${n})"/><circle class="pupil" cx="${cx}" cy="${cy}" r="38" fill="#0b0e12"/><circle cx="${cx - 26}" cy="${cy - 30}" r="13" fill="#fff" opacity=".85"/></g>`
      + `<path class="atas" d="" stroke="${PUTIH}" stroke-width="7" fill="none" stroke-linecap="round"/>`
      + `<path class="bawah" d="" stroke="${PUTIH}" stroke-width="5" fill="none" stroke-linecap="round" opacity=".8"/>`
      + `<g class="bulu">${[-3, -2, -1, 0, 1, 2, 3].map((i) => `<line x1="${cx + i * 62}" y1="${cy + 26 - Math.abs(i) * 6}" x2="${cx + i * 74}" y2="${cy + 62 - Math.abs(i) * 8}" stroke="${PUTIH}" stroke-width="6" stroke-linecap="round"/>`).join('')}</g>`,
    gambar: (el, t) => {
      const buka = E.out(P(t, o.buka, 0.6)) * (1 - E.inout(P(t, o.pejam, 0.45)));
      const kiri = 50, kanan = W - 50;
      const atas = cy - 210 * buka, bawah = cy + 170 * buka;
      const lengkungAtas = `M ${kiri} ${cy} Q ${cx} ${atas} ${kanan} ${cy}`;
      const lengkungBawah = `M ${kiri} ${cy} Q ${cx} ${bawah} ${kanan} ${cy}`;
      // kelopak terpejam melengkung ke bawah (senyum tertutup)
      const pejam = E.inout(P(t, o.pejam, 0.45));
      const tutup = `M ${kiri} ${cy} Q ${cx} ${cy + 60 * pejam} ${kanan} ${cy}`;
      el.querySelector('.atas').setAttribute('d', pejam > 0.02 ? tutup : lengkungAtas);
      el.querySelector('.bawah').setAttribute('d', lengkungBawah);
      el.querySelector('.bawah').setAttribute('opacity', 0.8 * (1 - pejam));
      el.querySelector('.klip').setAttribute('d', `M ${kiri} ${cy} Q ${cx} ${atas} ${kanan} ${cy} Q ${cx} ${bawah} ${kiri} ${cy} Z`);
      const lirik = Math.sin(t * 0.9) * 22 * buka;
      el.querySelector('.iris').setAttribute('cx', cx + lirik);
      el.querySelector('.pupil').setAttribute('cx', cx + lirik);
      el.querySelector('.bulu').setAttribute('opacity', pejam);
    },
  });
}

// ── papan kayu lambung kapal (dipakai close-up bor dan dinding rembesan) ──────
function papanKayu(W, H, n) {
  let s = `<defs><linearGradient id="kayu${n}a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6e4a2c"/><stop offset="1" stop-color="#4f331d"/></linearGradient>`
    + `<linearGradient id="kayu${n}b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5f3f25"/><stop offset="1" stop-color="#432a17"/></linearGradient>`
    + `<radialGradient id="lentera${n}" cx="28%" cy="18%" r="85%"><stop offset="0" stop-color="rgba(255,200,120,.30)"/><stop offset=".55" stop-color="rgba(255,200,120,.05)"/><stop offset="1" stop-color="rgba(0,0,0,.55)"/></radialGradient></defs>`;
  const tinggi = 128;
  for (let i = 0; i * tinggi < H; i++) {
    const y = i * tinggi;
    s += `<rect x="0" y="${y}" width="${W}" height="${tinggi}" fill="url(#kayu${n}${i % 2 ? 'a' : 'b'})"/>`;
    for (let j = 0; j < 5; j++) {
      const yy = y + 16 + j * 22 + hash(i * 13 + j) * 8;
      let d = `M 0 ${yy}`;
      for (let x = 0; x <= W; x += 120) d += ` Q ${x + 60} ${yy + (hash(i * 7 + j * 3 + x) - 0.5) * 10} ${x + 120} ${yy + (hash(i + j + x * 0.01) - 0.5) * 6}`;
      s += `<path d="${d}" stroke="rgba(30,18,8,.28)" stroke-width="${1.5 + hash(i + j * 9) * 2}" fill="none"/>`;
    }
    s += `<rect x="0" y="${y + tinggi - 6}" width="${W}" height="6" fill="rgba(15,8,3,.75)"/>`;
    s += `<rect x="0" y="${y}" width="${W}" height="2" fill="rgba(255,220,170,.10)"/>`;
    for (let x = 90 + (i % 2) * 230; x < W; x += 460) s += `<circle cx="${x}" cy="${y + tinggi / 2}" r="7" fill="#2a1a0d"/><circle cx="${x - 2}" cy="${y + tinggi / 2 - 2}" r="3" fill="rgba(255,230,190,.25)"/>`;
  }
  s += `<rect width="${W}" height="${H}" fill="url(#lentera${n})"/>`;
  return s;
}

// ── close-up: lambung dibor dari dalam ───────────────────────────────────────
function lambungDibor(o) {
  const n = uid();
  const hx = 1180, hy = 520, k = 15; // ikon bor 24 px -> 360 px; ujung mata bor di (22, 6)
  bunyi(o.bor, 'bor', 0.7);
  bunyi(o.tembus, 'semprot', 0.65);
  let butir = '';
  for (let i = 0; i < 70; i++) butir += `<circle class="b" data-i="${i}" r="${2 + hash(i + 3) * 5}" fill="rgba(200,230,250,.9)"/>`;
  let serpih = '';
  for (let i = 0; i < 14; i++) serpih += `<rect class="s" data-i="${i}" width="${6 + hash(i) * 10}" height="3" fill="#b88a5a"/>`;
  return svgItem({
    t0: o.t0, t1: o.t1, fin: 0.5, fout: 0.6,
    isi: papanKayu(LW, LH, n)
      + `<g class="retak" opacity="0"><path d="M ${hx} ${hy} l 60 -26 l 30 -40 M ${hx} ${hy} l -50 34 l -46 10 M ${hx} ${hy} l 22 58 l -8 44" stroke="#1a0e05" stroke-width="5" fill="none" stroke-linecap="round"/></g>`
      + `<circle class="lubang" cx="${hx}" cy="${hy}" r="0" fill="#050302"/>`
      + `<defs><linearGradient id="jet${n}" x1="0" x2="1"><stop offset="0" stop-color="rgba(225,242,255,.85)"/><stop offset="1" stop-color="rgba(190,225,250,0)"/></linearGradient></defs>`
      + `<path class="jet" d="" fill="url(#jet${n})"/><path class="jet2" d="" fill="rgba(240,250,255,.55)"/>`
      + `<g class="tetes"></g>${butir}${serpih}`
      + `<g class="bor">${ikonG('drill', hx - 22 * k, hy - 6 * k, 24 * k, PUTIH, 5)}</g>`,
    gambar: (el, t) => {
      const masuk = E.out5(P(t, o.bor - 0.9, 0.8));
      const mundur = E.inout(P(t, o.tembus + 0.5, 0.8));
      const getar = t > o.bor && t < o.tembus + 0.3 ? Math.sin(t * 160) * 2.5 : 0;
      const dorong = E.inout(P(t, o.bor, o.tembus - o.bor)) * 22;
      el.querySelector('.bor').setAttribute('transform', `translate(${-260 * (1 - masuk) - 420 * mundur + dorong + getar} ${getar * 0.6})`);
      el.querySelector('.bor').setAttribute('opacity', 1 - mundur);
      const r = 22 * E.out(P(t, o.tembus - 0.15, 0.3));
      el.querySelector('.lubang').setAttribute('r', r);
      el.querySelector('.retak').setAttribute('opacity', E.out(P(t, o.tembus, 0.3)));
      // serpih kayu saat mengebor
      el.querySelectorAll('.s').forEach((e) => {
        const i = +e.dataset.i;
        const u = ((t - o.bor) * 1.8 + hash(i * 3)) % 1;
        const aktif = t > o.bor && t < o.tembus + 0.2;
        e.setAttribute('opacity', aktif ? 1 - u : 0);
        e.setAttribute('x', hx - 30 - u * (90 + hash(i) * 120));
        e.setAttribute('y', hy - 30 + u * u * 220 + (hash(i + 5) - 0.5) * 60);
        e.setAttribute('transform', `rotate(${u * 400 * (hash(i + 2) - 0.5)} ${hx - 30} ${hy})`);
      });
      // semburan air masuk
      const deras = E.out(P(t, o.tembus, 0.35));
      const ujung = 340 * deras;
      el.querySelector('.jet').setAttribute('d', deras > 0 ? `M ${hx} ${hy - 12} Q ${hx + ujung * 0.6} ${hy - 30} ${hx + ujung} ${hy + 60 + ujung * 0.35} L ${hx + ujung * 0.9} ${hy + 90 + ujung * 0.4} Q ${hx + ujung * 0.5} ${hy + 10} ${hx} ${hy + 12} Z` : '');
      const u2 = ujung * 0.75;
      el.querySelector('.jet2').setAttribute('d', deras > 0 ? `M ${hx} ${hy - 5} Q ${hx + u2 * 0.6} ${hy - 16} ${hx + u2} ${hy + 50 + u2 * 0.3} L ${hx + u2 * 0.95} ${hy + 62 + u2 * 0.32} Q ${hx + u2 * 0.5} ${hy + 4} ${hx} ${hy + 5} Z` : '');
      el.querySelectorAll('.b').forEach((e) => {
        const i = +e.dataset.i;
        const u = ((t - o.tembus) * (0.9 + hash(i) * 0.7) + hash(i * 7)) % 1;
        const arah = -0.35 + hash(i + 11) * 0.9;
        const jarak = (200 + hash(i + 1) * 420) * u;
        e.setAttribute('cx', hx + Math.cos(arah) * jarak);
        e.setAttribute('cy', hy + Math.sin(arah) * jarak + 380 * u * u);
        e.setAttribute('opacity', deras * (1 - u) * 0.95);
      });
    },
  });
}

// ── ikon + teks berdampingan (HTML) ──────────────────────────────────────────
const sebaris = (nama, html, warna = EMAS, uk = 52) => `<span style="display:inline-flex;align-items:center;gap:22px">${ikon(nama, uk, warna, 2.2)}<span>${html}</span></span>`;

// ════════════════ s1 · PEMBUKA ═════════════════════════════════════════════
D(0, { langit: 'malam', camZ: 1.14, camY: -16, shipX: 1460, shipS: 0.42, wind: 0.2, dim: 0, coast: 1, lh: 1, beam: 0, cloud: 0.2, leak: 0 });
D(L(1) - 0.4, { shipX: 1200, shipS: 0.5, camZ: 1.0, camY: 0 });
D(W(1, 'badai') - 0.9, { langit: 'badai', wind: 0.9, rain: 0.95, cloud: 1, cloudDark: 1, lh: 0.35, ease: 'out' });
D(LE(1) + 0.3, { rain: 0.8 });
kilat(W(1, 'badai') + 0.05, W(1, 'risiko') + 0.35);
D(L(2) + 0.7, { langit: 'malam', rain: 0, wind: 0.14, cloud: 0.15, cloudDark: 0.5, lh: 1, shipX: 1020, shipS: 0.62, ease: 'inout' });
D(LE(2) + 0.5, { leak: 1, dim: 0.3, ease: 'out' });
D(L(3), { dim: 0.62, fog: 0.5 });
D(L(4), { dim: 0.55, fog: 0.3 });
D(L(5), { dim: 0.4, beam: 1, fog: 0 });
D(LE(5) + 0.3, { dim: 0.62 });
D(L(6), { dim: 0.6 });
tahan('s1', { shipX: 1020, shipS: 0.62 });

teks({ t0: 0.8, t1: 3.5, x: 0, y: 480, w: LW, cls: 'serif-s ctr redup', html: 'Inspektorat Kabupaten Aceh Barat mempersembahkan', anim: 'fade', fin: 1.0, fout: 0.8 });

tirai({ t0: L(1) - 0.3, t1: LE(1) + 0.5, bg: 'linear-gradient(90deg, rgba(3,9,16,.85) 0%, rgba(3,9,16,.5) 45%, rgba(3,9,16,0) 75%)' });
teks({ t0: L(1), t1: LE(1) + 0.5, x: X0, y: 250, w: 1100, cls: 'serif', html: 'Kapal bisa karam karena badai.', anim: 'naik' });
teks({ t0: W(1, 'risiko') - 0.1, t1: LE(1) + 0.5, x: X0, y: 380, cls: 'stempel emas', html: 'Itu risiko', anim: 'stempel', rot: -5 });
teks({ t0: W(1, 'pelaut'), t1: LE(1) + 0.5, x: X0, y: 560, w: 1000, cls: 'serif-s', html: '…dan pelaut belajar <em>membacanya</em>.', anim: 'naik' });

teks({ t0: L(2), t1: W(2, 'melubangi') - 0.5, x: 0, y: 300, w: LW, cls: 'serif ctr', html: 'Tapi kapal juga bisa karam<br>di laut yang <em>tenang</em>…', anim: 'naik', fout: 0.4 });
lambungDibor({ t0: W(2, 'melubangi') - 0.7, t1: LE(2) + 0.9, bor: W(2, 'melubangi') - 0.1, tembus: W(2, 'lambungnya') + 0.25 });
tirai({ t0: W(2, 'melubangi') - 0.6, t1: LE(2) + 0.9, bg: 'linear-gradient(0deg, rgba(3,9,16,.85) 0%, rgba(3,9,16,.2) 40%, rgba(3,9,16,0) 60%)' });
teks({ t0: W(2, 'diam-diam'), t1: LE(2) + 0.9, x: X0, y: 735, w: 900, cls: 'kicker', html: 'diam-diam', anim: 'kiri' });
teks({ t0: W(2, 'dalam') - 0.1, t1: LE(2) + 0.9, x: X0, y: 800, w: 1400, cls: 'h1 merah', html: '…dari dalam.', anim: 'huruf' });

teks({ t0: L(3), t1: LE(3) + 0.6, x: 0, y: 150, w: LW, cls: 'kicker ctr', html: 'Yang lebih berbahaya dari lubang itu', anim: 'fade' });
mata({ t0: L(3) + 0.2, t1: LE(3) + 0.6, x: 960, y: 420, buka: W(3, 'awak') - 0.2, pejam: W(3, 'diam') - 0.15 });
teks({ t0: W(3, 'awak'), t1: LE(3) + 0.6, x: 0, y: 640, w: LW, cls: 'h2 ctr', html: 'awak yang melihatnya…', anim: 'naik' });
teks({ t0: W(3, 'diam') - 0.15, t1: LE(3) + 0.6, x: 0, y: 760, w: LW, cls: 'h1 ctr merah', html: '…lalu memilih diam.', anim: 'huruf' });

teks({ t0: L(4), t1: LE(4) + 0.4, x: 0, y: 150, w: LW, cls: 'kicker ctr', html: 'Di pemerintahan', anim: 'fade' });
svgItem({
  t0: W(4, 'lubang') - 0.2, t1: LE(4) + 0.4, x: 330, y: 280, w: 300, h: 300, fin: 0.6,
  isi: `<circle cx="150" cy="150" r="118" fill="none" stroke="${MERAH}" stroke-width="6" stroke-dasharray="14 12"/><circle cx="150" cy="150" r="44" fill="#050302" stroke="#2a1a0d" stroke-width="10"/><path d="M 150 150 l 70 -30 l 34 -44 M 150 150 l -62 40 l -48 12 M 150 150 l 26 66 l -10 46" stroke="${MERAH}" stroke-width="6" fill="none" stroke-linecap="round"/>`,
});
teks({ t0: W(4, 'lubang') + 0.1, t1: LE(4) + 0.4, x: 180, y: 610, w: 600, cls: 'h3 ctr redup', html: 'Lubang', anim: 'naik' });
teks({ t0: W(4, 'kecurangan') - 0.1, t1: LE(4) + 0.4, x: 180, y: 690, w: 600, cls: 'h1 ctr merah', html: 'kecurangan', anim: 'zoom' });
lonceng({ t0: W(4, 'lonceng') - 0.3, t1: LE(4) + 0.4, x: 1440, y: 300, ukuran: 0.62, dering: [W(4, 'laporan')], pendar: 0.6 });
teks({ t0: W(4, 'lonceng'), t1: LE(4) + 0.4, x: 1140, y: 610, w: 600, cls: 'h3 ctr redup', html: 'Lonceng tanda bahaya', anim: 'naik' });
teks({ t0: W(4, 'laporan') - 0.1, t1: LE(4) + 0.4, x: 1140, y: 690, w: 600, cls: 'h1 ctr emas', html: 'laporan', anim: 'zoom' });

lonceng({ t0: L(5) - 0.2, t1: LE(5) + 4.1, x: 960, y: 150, ukuran: 1.0, dering: [W(5, 'membunyikan'), W(5, 'lonceng') + 0.3, LE(5) + 0.35], g: 0.85 });
teks({ t0: W(5, 'benar'), t1: LE(5) + 0.25, x: 560, y: 690, w: 380, cls: 'ctr', html: '<span class="cip">dengan benar</span>', anim: 'zoom', fout: 0.3 });
teks({ t0: W(5, 'aman'), t1: LE(5) + 0.25, x: 980, y: 690, w: 380, cls: 'ctr', html: '<span class="cip">dengan aman</span>', anim: 'zoom', fout: 0.3 });
// judul utama
bunyi(LE(5) + 0.35, 'boom', 0.85);
teks({ t0: LE(5) + 0.35, t1: L(6) - 0.4, x: 0, y: 560, w: LW, cls: 'hero ctr', html: 'BUNYIKAN <span class="emas">LONCENG</span>', anim: 'huruf', fout: 0.7 });
teks({ t0: LE(5) + 0.9, t1: L(6) - 0.4, x: 0, y: 800, w: LW, cls: 'kicker ctr', html: 'Video edukasi · Lapor Dugaan Kecurangan', anim: 'fade', fout: 0.7 });
teks({ t0: LE(5) + 1.3, t1: L(6) - 0.4, x: 0, y: 860, w: LW, cls: 'serif-s ctr redup', html: 'MR Kabar · Inspektorat Kabupaten Aceh Barat', anim: 'naik', fout: 0.7 });

teks({ t0: L(6) - 0.1, t1: LE(6) + 0.3, x: 0, y: 120, w: LW, cls: 'h1 ctr', html: 'Sembilan babak', anim: 'huruf' });
const DAFTAR_BAB = ['Apa itu kecurangan', 'Mengapa orang berbuat curang', 'Tujuh wajah korupsi', 'Membaca rembesan', 'Mengapa kita diam', 'Melapor dengan benar', 'Cara melapor di MR Kabar', 'Seberapa aman?', 'Setelah lonceng berbunyi'];
DAFTAR_BAB.forEach((j, i) => {
  const t0 = L(6) + 0.5 + i * 0.32;
  teks({ t0, t1: LE(6) + 0.3, x: 170 + (i % 3) * 540, y: 330 + Math.floor(i / 3) * 140, w: 520, cls: 'h4', html: `<span class="mono emas" style="font-size:30px">0${i + 1}</span>&nbsp; ${j}`, anim: 'naik', fin: 0.5 });
  bunyi(t0, 'tik', 0.35);
});
svgItem({
  t0: W(6, 'em-er') - 0.3, t1: LE(6) + 0.3, x: 880, y: 770, w: 160, h: 150, fin: 0.6,
  isi: `<rect x="0" y="0" width="160" height="150" rx="26" fill="#f4f1ea"/><image href="img/mrkabar.png" x="12" y="8" width="136" height="134"/>`,
});

// ════════════════ s2 · APA ITU KECURANGAN ══════════════════════════════════
kartuBab('s2', '01', 'Apa itu kecurangan', 'Sengaja · tipu daya · tidak sah', 'perahu_usaid', [40, 20, 1.14, -30, 0, 1.04]);
tandaBab('s2', 'Babak 01 · <b>Apa itu kecurangan</b>');
D(CD.s2.start + 1.2, { langit: 'senja', leak: 0.35, dim: 0.62, shipX: 1460, shipS: 0.45, wind: 0.28, cloud: 0.3, cloudDark: 0.2, fog: 0, lh: 0, beam: 0, camZ: 1.0, camY: 0 });
tahan('s2', { shipX: 1460, shipS: 0.45 });
D(L(10), { dim: 0.7 });

teks({ t0: L(7), t1: LE(7) + 0.3, x: 0, y: 330, w: LW, cls: 'kicker ctr', html: 'Mulai dari yang paling dasar', anim: 'fade' });
teks({ t0: W(7, 'apa') - 0.1, t1: LE(7) + 0.3, x: 0, y: 400, w: LW, cls: 'h1 ctr', html: 'Apa itu kecurangan?', anim: 'huruf' });

tirai({ t0: L(8) - 0.2, t1: LE(9) + 0.3, bg: 'linear-gradient(90deg, rgba(3,9,16,.9) 0%, rgba(3,9,16,.7) 55%, rgba(3,9,16,.35) 100%)' });
teks({ t0: L(8), t1: LE(8) + 0.3, x: X0, y: 200, w: 900, cls: 'kicker', html: 'Definisi', anim: 'kiri' });
teks({ t0: L(8) + 0.1, t1: LE(8) + 0.3, x: X0, y: 260, w: 1060, cls: 'serif', html: 'Kecurangan (<i>fraud</i>) adalah perbuatan yang <em>disengaja</em>, dengan <em>tipu daya</em> atau penyalahgunaan kepercayaan, untuk memperoleh keuntungan secara <em>tidak sah</em>.', anim: 'naik', fin: 1.1 });
[['disengaja', 'Sengaja'], ['tipu', 'Tipu daya'], ['tidak', 'Tidak sah']].forEach(([k, h], i) => {
  teks({ t0: W(8, k), t1: LE(8) + 0.3, x: 1340, y: 250 + i * 150, w: 480, cls: 'h2 emas', html: h, anim: 'kanan' });
  bunyi(W(8, k), 'tik', 0.5);
});
[['sengaja', 'scan-eye', 'Sengaja', 'pelakunya tahu'], ['tipu', 'venetian-mask', 'Tipu daya', 'ada yang disembunyikan'], ['tidak', 'hand-coins', 'Tidak sah', 'ada yang diambil tanpa hak']].forEach(([k, ik, h, sub], i) => {
  const t0 = W(9, k), x = 170 + i * 560;
  svgItem({ t0, t1: LE(9) + 0.3, x, y: 250, w: 140, h: 140, fin: 0.5, isi: ikonG(ik, 10, 10, 120, EMAS, 3.5), gambar: (el, t, pin) => { el.style.transform = `scale(${0.7 + 0.3 * E.back(pin)})`; } });
  teks({ t0: t0 + 0.1, t1: LE(9) + 0.3, x, y: 420, w: 500, cls: 'h2', html: h, anim: 'naik' });
  teks({ t0: t0 + 0.3, t1: LE(9) + 0.3, x, y: 530, w: 480, cls: 'serif-s', html: sub, anim: 'naik' });
  bunyi(t0, 'pop', 0.45);
});

// kejadian risiko vs kecurangan
tirai({ t0: L(10) - 0.2, t1: LE(11) + 0.4, bg: 'rgba(3,9,16,.55)' });
teks({ t0: L(10), t1: W(10, 'kejadian', 2) - 0.3, x: 0, y: 420, w: LW, cls: 'h2 ctr', html: 'Apa bedanya dengan kejadian risiko?', anim: 'naik', fout: 0.3 });
svgItem({ t0: W(10, 'kejadian', 2) - 0.2, t1: LE(11) + 0.4, x: X0, y: 150, w: 120, h: 120, isi: ikonG('cloud-lightning', 6, 6, 108, PUTIH, 3) });
teks({ t0: W(10, 'kejadian', 2) - 0.1, t1: LE(11) + 0.4, x: X0 + 150, y: 160, w: 600, cls: 'h2', html: 'Kejadian risiko', anim: 'kiri' });
teks({ t0: W(10, 'tanpa'), t1: LE(11) + 0.4, x: X0, y: 310, w: 600, cls: 'stempel emas', html: 'Tanpa niat', anim: 'stempel', rot: -4 });
barisan([
  [W(10, 'banjir'), sebaris('droplets', 'banjir merendam arsip', PUTIH, 44)],
  [W(10, 'server'), sebaris('server', 'server mati', PUTIH, 44)],
  [W(10, 'angka'), sebaris('file-x', 'angka keliru diketik', PUTIH, 44)],
], { t1: LE(11) + 0.4, x: X0, y: 500, jarak: 96, w: 720, cls: 'h4' });
garis({ t0: L(11) - 0.2, t1: LE(11) + 0.4, x: 958, y: 150, w: 4, tebal: 640, tegak: true, warna: 'rgba(244,241,234,.25)' });
svgItem({ t0: L(11), t1: LE(11) + 0.4, x: 1030, y: 150, w: 120, h: 120, isi: ikonG('drill', 6, 6, 108, MERAH, 3) });
teks({ t0: L(11) + 0.05, t1: LE(11) + 0.4, x: 1180, y: 160, w: 640, cls: 'h2 merah', html: 'Kecurangan', anim: 'kanan' });
teks({ t0: W(11, 'niat') - 0.1, t1: LE(11) + 0.4, x: 1030, y: 310, cls: 'stempel', html: 'Ada niat', anim: 'stempel', rot: -4 });
teks({ t0: W(11, 'badai'), t1: LE(11) + 0.4, x: 1030, y: 520, w: 760, cls: 'h3', html: 'Badai <span class="redup">→</span> <span class="emas">risiko</span>', anim: 'kanan' });
teks({ t0: W(11, 'lubang'), t1: LE(11) + 0.4, x: 1030, y: 610, w: 820, cls: 'h3', html: 'Lubang yang dibor <span class="redup">→</span> <span class="merah">kecurangan</span>', anim: 'kanan' });

// salah hitung vs menyembunyikan
const BUKU = [['Belanja alat tulis kantor', '2.450.000'], ['Konsumsi rapat', '1.200.000'], ['Perjalanan dinas', '7.800.000'], ['Jumlah', '12.450.000']];
svgItem({
  t0: L(12) - 0.3, t1: LE(12) + 0.4, x: 170, y: 190, w: 900, h: 560, fin: 0.7,
  isi: `<rect x="0" y="0" width="900" height="560" rx="14" fill="#f3ead6"/><rect x="0" y="0" width="900" height="70" rx="14" fill="#e6d8b8"/><text x="40" y="47" font-family="Bebas" font-size="40" fill="#2a2118">Buku kas · contoh</text>`
    + BUKU.map(([a, b], i) => `<text x="40" y="${150 + i * 96}" font-family="Jakarta" font-weight="${i === 3 ? 800 : 500}" font-size="34" fill="#2a2118">${a}</text><text x="860" y="${150 + i * 96}" text-anchor="end" font-family="Mono" font-weight="700" font-size="34" fill="#2a2118">Rp ${b}</text><line x1="40" x2="860" y1="${172 + i * 96}" y2="${172 + i * 96}" stroke="rgba(42,33,24,.18)" stroke-width="2"/>`).join('')
    + `<rect class="sorot" x="24" y="${150 + 3 * 96 - 52}" width="852" height="74" rx="10" fill="rgba(242,180,90,.45)" opacity="0"/>`
    + `<rect class="hitam" x="400" y="${150 + 3 * 96 - 46}" width="470" height="62" rx="6" fill="#111"/>`,
  gambar: (el, t) => {
    el.querySelector('.sorot').setAttribute('opacity', E.out(P(t, W(12, 'hitung', 1), 0.4)) * (1 - E.out(P(t, W(12, 'menyembunyikan'), 0.4))));
    const tutup = E.inout(P(t, W(12, 'menyembunyikan'), 0.6));
    const h = el.querySelector('.hitam');
    h.setAttribute('width', 470 * tutup);
    h.setAttribute('opacity', tutup > 0.01 ? 1 : 0);
  },
});
teks({ t0: W(12, 'hitung', 1) + 0.2, t1: LE(12) + 0.4, x: 1140, y: 230, w: 700, cls: 'h3', html: `${ikon('circle-check', 46, HIJAU, 2.4)}&nbsp; Salah hitung`, anim: 'kanan' });
teks({ t0: W(12, 'bukan'), t1: LE(12) + 0.4, x: 1140, y: 312, w: 700, cls: 'serif-s', html: 'bukan kecurangan — cukup dibetulkan', anim: 'naik' });
teks({ t0: W(12, 'menyembunyikan'), t1: LE(12) + 0.4, x: 1140, y: 430, w: 700, cls: 'h3', html: `${ikon('circle-x', 46, MERAH, 2.4)}&nbsp; Disembunyikan`, anim: 'kanan' });
teks({ t0: W(12, 'diuntungkan'), t1: LE(12) + 0.4, x: 1140, y: 512, w: 700, cls: 'serif-s', html: 'supaya ada yang <em>diuntungkan</em>', anim: 'naik' });
teks({ t0: W(12, 'lain') - 0.1, t1: LE(12) + 0.4, x: 1140, y: 620, cls: 'stempel', html: 'Lain cerita', anim: 'stempel', rot: -5 });

// dua pintu di halaman Lapor
const LP = POS['p-kecurangan'], LA = POS['p-awal'];
const tengah = (b) => [b.x + b.w / 2, b.y + b.h / 2];
ponsel({
  t0: L(13) - 0.3, t1: LE(14) + 0.5, x: 1270, y: 38, w: 480, miring: -12,
  layar: [
    { t: 0, src: 'p-kejadian', gulir: [[W(13, 'nama') - 1.0, 0], [W(13, 'nama') - 0.1, 520], [L(14) + 0.1, 520], [L(14) + 0.9, 0]] },
    { t: W(14, 'dugaan') + 0.15, src: 'p-kecurangan' },
  ],
  fokus: [
    { t: W(13, 'kejadian', 1) - 0.1, d: W(13, 'nama') - W(13, 'kejadian', 1) - 0.6, ...LA.tab_kejadian },
    { t: W(13, 'nama'), d: 3.2, x: 41, y: LA.nama_lengkap.y - 6, w: 311, h: 70 },
    { t: W(14, 'dugaan') + 0.35, d: 4.2, ...LP.tab_kecurangan },
  ],
  ketuk: [[W(14, 'dugaan'), ...tengah(LP.tab_kecurangan)]],
});
teks({ t0: L(13), t1: LE(14) + 0.5, x: X0, y: 150, w: 980, cls: 'kicker', html: 'Halaman Lapor · dua pintu', anim: 'kiri' });
svgItem({ t0: W(13, 'kejadian', 1), t1: LE(14) + 0.5, x: X0, y: 230, w: 90, h: 90, isi: ikonG('siren', 4, 4, 82, PUTIH, 2.6) });
teks({ t0: W(13, 'kejadian', 1), t1: LE(14) + 0.5, x: X0 + 120, y: 236, w: 860, cls: 'h2', html: 'Kejadian Risiko', anim: 'kiri' });
teks({ t0: W(13, 'nama'), t1: LE(14) + 0.5, x: X0 + 120, y: 350, w: 860, cls: 'h4', html: `${ikon('user', 36, EMAS, 2.4)}&nbsp; wajib menuliskan <span class="emas">nama pelapor</span>`, anim: 'naik' });
teks({ t0: W(13, 'diteruskan'), t1: LE(14) + 0.5, x: X0 + 120, y: 420, w: 900, cls: 'h4', html: `${ikon('building-2', 36, EMAS, 2.4)}&nbsp; diteruskan ke <span class="emas">perangkat daerah terkait</span>`, anim: 'naik' });
redupkan(ITEMS[ITEMS.length - 1], L(14), 0.45);
redupkan(ITEMS[ITEMS.length - 2], L(14), 0.45);
redupkan(ITEMS[ITEMS.length - 3], L(14), 0.45);
redupkan(ITEMS[ITEMS.length - 4], L(14), 0.45);
svgItem({ t0: W(14, 'dugaan') - 0.2, t1: LE(14) + 0.5, x: X0, y: 560, w: 90, h: 90, isi: ikonG('shield-alert', 4, 4, 82, EMAS, 2.6) });
teks({ t0: W(14, 'dugaan') - 0.1, t1: LE(14) + 0.5, x: X0 + 120, y: 566, w: 860, cls: 'h2 emas', html: 'Dugaan Kecurangan', anim: 'kiri' });
teks({ t0: W(14, 'kesengajaan'), t1: LE(14) + 0.5, x: X0 + 120, y: 680, w: 860, cls: 'h4', html: 'bila menduga ada <span class="emas">kesengajaan</span>', anim: 'naik' });
teks({ t0: W(14, 'penindaklanjut'), t1: LE(14) + 0.5, x: X0 + 120, y: 750, w: 900, cls: 'h4', html: `${ikon('lock', 36, EMAS, 2.4)}&nbsp; hanya dibuka <span class="emas">penindaklanjut</span>`, anim: 'naik' });

// ════════════════ s3 · MENGAPA ORANG BERBUAT CURANG ════════════════════════
kartuBab('s3', '02', 'Mengapa orang berbuat curang', 'Tekanan, kesempatan, dan pembenaran', 'badai_laut', [0, 30, 1.12, 0, -10, 1.02]);
tandaBab('s3', 'Babak 02 · <b>Mengapa orang berbuat curang</b>');
D(CD.s3.start + 1.2, { langit: 'badai', cloud: 0.8, cloudDark: 0.8, wind: 0.45, rain: 0, dim: 0.66, leak: 0.45, shipX: 1520, shipS: 0.42, lh: 0, beam: 0 });
tahan('s3', { shipX: 1520, shipS: 0.42 });
D(L(19) - 0.3, { fog: 1, dim: 0.72 });
D(LE(20) + 0.3, { fog: 0.2, dim: 0.66 });

teks({ t0: L(15), t1: LE(15) + 0.3, x: 0, y: 380, w: LW, cls: 'h1 ctr', html: 'Kenapa orang yang tadinya jujur<br>bisa berbuat curang?', anim: 'huruf' });

// segitiga kecurangan
const SG = { K: [1360, 250], T: [1060, 760], R: [1660, 760] };
const NAMA_SUDUT = { K: 'Kesempatan', T: 'Tekanan', R: 'Rasionalisasi' };
const POS_LABEL = { K: [1360, 190, 'middle'], T: [1060, 850, 'middle'], R: [1660, 850, 'middle'] };
function sudutAktif(t) {
  // mengembalikan {K, T, R} -> 0 (redup) .. 1 (menyala)
  const n = (a, b) => E.out(P(t, a, 0.35)) * (1 - E.out(P(t, b, 0.35)));
  return {
    T: Math.max(n(W(17, 'tekanan'), W(17, 'kesempatan')), n(L(21), W(22, 'kesempatan', 1)) * 0.6),
    K: Math.max(n(W(17, 'kesempatan'), L(18)), n(L(21), W(22, 'kesempatan', 1)) * 0.6, E.out(P(t, W(22, 'kesempatan', 1), 0.35))),
    R: Math.max(n(W(18, 'rasionalisasi'), W(20, 'sudah')), n(L(21), W(22, 'kesempatan', 1)) * 0.6),
  };
}
svgItem({
  t0: W(16, 'tiga') - 0.1, t1: LE(22) + 0.4, fin: 0.4,
  isi: `<g class="sisi">${[['K', 'T'], ['T', 'R'], ['R', 'K']].map(([a, b], i) => `<line class="e${i}" x1="${SG[a][0]}" y1="${SG[a][1]}" x2="${SG[b][0]}" y2="${SG[b][1]}" stroke="rgba(244,241,234,.55)" stroke-width="5" stroke-dasharray="700" stroke-dashoffset="700"/>`).join('')}</g>`
    + ['K', 'T', 'R'].map((k) => `<g class="v${k}"><circle class="halo" cx="${SG[k][0]}" cy="${SG[k][1]}" r="70" fill="rgba(242,180,90,.25)" opacity="0"/><circle class="inti" cx="${SG[k][0]}" cy="${SG[k][1]}" r="28" fill="rgba(244,241,234,.3)"/>`
      + `<text x="${POS_LABEL[k][0]}" y="${POS_LABEL[k][1]}" text-anchor="${POS_LABEL[k][2]}" font-family="Bebas" font-size="58" fill="${PUTIH}" class="lbl">${NAMA_SUDUT[k]}</text></g>`).join('')
    + `<g class="gembok" opacity="0">${ikonG('lock-keyhole', SG.K[0] - 26, SG.K[1] - 28, 52, '#0b0e12', 3.2)}</g>`,
  gambar: (el, t) => {
    const p = E.inout(P(t, W(16, 'tiga'), 1.4));
    for (let i = 0; i < 3; i++) el.querySelector('.e' + i).setAttribute('stroke-dashoffset', 700 * (1 - clamp(p * 3 - i)));
    const a = sudutAktif(t);
    const redup = 1 - 0.65 * E.out(P(t, L(19) - 0.2, 0.5)) * (1 - E.out(P(t, L(21) - 0.2, 0.5)));
    el.querySelector('.sisi').setAttribute('opacity', redup);
    for (const k of ['K', 'T', 'R']) {
      const g = el.querySelector('.v' + k);
      g.setAttribute('opacity', P(t, W(16, 'tiga') + 0.6, 0.4) * (k === 'R' ? 1 : redup));
      g.querySelector('.inti').setAttribute('fill', a[k] > 0.05 ? `rgba(242,180,90,${0.3 + 0.7 * a[k]})` : 'rgba(244,241,234,.3)');
      g.querySelector('.inti').setAttribute('r', 28 + 10 * a[k]);
      g.querySelector('.halo').setAttribute('opacity', a[k]);
      g.querySelector('.halo').setAttribute('r', 70 + 8 * Math.sin(t * 3));
      g.querySelector('.lbl').setAttribute('fill', a[k] > 0.5 ? EMAS : PUTIH);
    }
    el.querySelector('.gembok').setAttribute('opacity', E.out(P(t, W(22, 'kesempatan', 1) + 0.4, 0.4)));
  },
});
bunyi(W(22, 'kesempatan', 1) + 0.45, 'kunci', 0.8);
['tekanan', 'kesempatan'].forEach((k) => bunyi(W(17, k), 'pop', 0.5));
bunyi(W(18, 'rasionalisasi'), 'pop', 0.5);

teks({ t0: L(16), t1: LE(16) + 0.2, x: X0, y: 210, w: 760, cls: 'kicker', html: 'Kriminolog', anim: 'kiri' });
teks({ t0: W(16, 'kriminolog'), t1: LE(16) + 0.2, x: X0, y: 260, w: 820, cls: 'h2', html: 'Donald Cressey', anim: 'huruf' });
teks({ t0: W(16, 'mewawancarai'), t1: LE(16) + 0.2, x: X0, y: 390, w: 760, cls: 'serif-s', html: 'mewawancarai para narapidana kasus penggelapan', anim: 'naik' });
teks({ t0: W(16, 'mewawancarai') + 0.5, t1: LE(16) + 0.2, x: X0, y: 520, w: 600, cls: 'cap', html: '<i>Other People’s Money</i> · <b>1953</b>', anim: 'kiri' });
teks({ t0: W(16, 'tiga'), t1: LE(16) + 0.2, x: X0, y: 660, w: 760, cls: 'h3 emas', html: 'tiga hal yang hampir selalu hadir', anim: 'naik' });

teks({ t0: W(17, 'tekanan') - 0.05, t1: W(17, 'kesempatan') - 0.2, x: X0, y: 210, w: 760, cls: 'h1 emas', html: 'Tekanan', anim: 'kiri', fout: 0.3 });
barisan([
  [W(17, 'utang'), sebaris('banknote', 'utang', PUTIH, 44)],
  [W(17, 'gaya'), sebaris('gift', 'gaya hidup', PUTIH, 44)],
  [W(17, 'target'), sebaris('trending-up', 'target yang tidak masuk akal', PUTIH, 44)],
], { t1: W(17, 'kesempatan') - 0.2, x: X0, y: 400, jarak: 100, w: 820, cls: 'h3' });
teks({ t0: W(17, 'kesempatan') - 0.05, t1: LE(17) + 0.2, x: X0, y: 210, w: 760, cls: 'h1 emas', html: 'Kesempatan', anim: 'kiri', fout: 0.3 });
barisan([
  [W(17, 'pengawasan'), sebaris('scan-eye', 'pengawasan longgar', PUTIH, 44)],
  [W(17, 'satu'), sebaris('key-round', 'satu orang memegang semua kunci', PUTIH, 44)],
], { t1: LE(17) + 0.2, x: X0, y: 400, jarak: 100, w: 860, cls: 'h3' });
teks({ t0: W(18, 'rasionalisasi') - 0.05, t1: LE(18) + 0.3, x: X0, y: 210, w: 800, cls: 'h1 emas', html: 'Rasionalisasi', anim: 'kiri' });
teks({ t0: W(18, 'cara'), t1: LE(18) + 0.3, x: X0, y: 400, w: 760, cls: 'serif', html: 'cara pelaku <em>membenarkan</em> dirinya sendiri', anim: 'naik' });

// bisikan pembenaran
[[W(19, 'cuma', 1), 'Cuma pinjam, nanti dikembalikan.', 150, 260, [7, -2]], [W(19, 'semua'), 'Semua juga begitu.', 980, 450, [-6, -3]], [W(19, 'ini'), 'Ini kan cuma uang terima kasih.', 260, 640, [5, -4]]].forEach(([t0, q, x, y, g]) => {
  teks({ t0, t1: LE(19) + 0.5, x, y, cls: 'gelembung', html: `“${q}”`, anim: 'naik', gerak: g, fout: 0.6 });
  bunyi(t0 - 0.1, 'bisik', 0.6);
});
teks({ t0: L(20), t1: LE(20) + 0.4, x: 0, y: 270, w: LW, cls: 'kicker ctr', html: 'Kalimat paling berbahaya di sebuah kantor', anim: 'fade' });
teks({ t0: W(20, 'sudah') - 0.1, t1: LE(20) + 0.4, x: 0, y: 390, w: LW, cls: 'hero ctr merah', html: '“Sudah biasa.”', anim: 'stempel', rot: -3 });

teks({ t0: L(21), t1: LE(21) + 0.2, x: X0, y: 330, w: 760, cls: 'serif', html: 'Dari tiga sisi itu,<br>mana yang bisa <em>kita tutup</em>?', anim: 'naik' });
teks({ t0: W(22, 'kesempatan', 1) - 0.05, t1: LE(22) + 0.4, x: X0, y: 230, w: 800, cls: 'h1 emas', html: 'Kesempatan.', anim: 'huruf' });
teks({ t0: W(22, 'melihat', 1), t1: LE(22) + 0.4, x: X0, y: 440, w: 860, cls: 'h3', html: sebaris('eye', 'ada yang melihat,', EMAS, 52), anim: 'naik' });
teks({ t0: W(22, 'bicara') - 0.1, t1: LE(22) + 0.4, x: X0, y: 540, w: 900, cls: 'h3 emas', html: sebaris('bell-ring', 'dan yang melihat berani bicara.', EMAS, 52), anim: 'naik' });
bunyi(W(22, 'bicara'), 'lonceng', 0.45);

// ════════════════ s4 · TUJUH WAJAH KORUPSI ═════════════════════════════════
kartuBab('s4', '03', 'Tujuh wajah korupsi', 'UU No. 31/1999 jo. UU No. 20/2001', 'peta_aceh', [0, 40, 1.1, 0, -20, 1.0]);
tandaBab('s4', 'Babak 03 · <b>Tujuh wajah korupsi</b>');
D(CD.s4.start + 1.2, { langit: 'malam', dim: 0.74, leak: 0.6, cloud: 0.3, cloudDark: 0.5, fog: 0.2, wind: 0.3, shipX: 1760, shipS: 0.38 });
tahan('s4', { shipX: 1760, shipS: 0.38 });
capKanan(L(23), L(31) - 0.2, 'UU No. 31/1999 jo. <b>UU No. 20/2001</b>');

teks({ t0: W(23, 'korupsi') - 0.1, t1: W(23, 'puluhan') - 0.1, x: 0, y: 380, w: LW, cls: 'hero ctr', html: 'KORUPSI', anim: 'huruf', fout: 0.4 });
const UBIN = [
  ['Kerugian Keuangan Negara', 'banknote'], ['Suap-Menyuap', 'mail'], ['Penggelapan dalam Jabatan', 'briefcase'], ['Pemerasan', 'hand-coins'],
  ['Perbuatan Curang', 'brick-wall'], ['Benturan Kepentingan dalam Pengadaan', 'handshake'], ['Gratifikasi', 'gift'],
];
const posUbin = (i) => (i < 4 ? [115 + i * 430, 230] : [330 + (i - 4) * 430, 510]);
// pasal-pasal beterbangan lalu berkumpul menjadi tujuh
svgItem({
  t0: W(23, 'puluhan') - 0.2, t1: W(23, 'tujuh') + 0.6, fin: 0.2, fout: 0.3,
  isi: Array.from({ length: 30 }, (_, i) => `<text class="ps" data-i="${i}" font-family="Jakarta" font-weight="800" font-size="56" fill="${EMAS}" text-anchor="middle">§</text>`).join(''),
  gambar: (el, t) => {
    el.querySelectorAll('.ps').forEach((e) => {
      const i = +e.dataset.i;
      const muncul = E.out(P(t, W(23, 'puluhan') + i * 0.045, 0.3));
      const bx = 220 + hash(i * 3) * 1480, by = 260 + hash(i * 7 + 1) * 560;
      const [ux, uy] = posUbin(i % 7);
      const f = E.inout(P(t, W(23, 'dikelompokkan') + hash(i) * 0.3, 0.9));
      e.setAttribute('x', lerp(bx + Math.sin(t * 1.3 + i) * 12, ux + 200, f));
      e.setAttribute('y', lerp(by + Math.cos(t * 1.1 + i) * 10, uy + 140, f));
      e.setAttribute('opacity', muncul * (1 - E.out(P(t, W(23, 'tujuh') + 0.1, 0.4))));
    });
  },
});
bunyi(W(23, 'puluhan'), 'kertas', 0.6);
const TERAKHIR_UBIN = L(31) - 0.15;
UBIN.forEach(([nama, ik], i) => {
  const [x, y] = posUbin(i);
  const t0 = W(23, 'tujuh') + 0.15 + i * 0.12;
  bunyi(t0, 'tik', 0.45);
  const it = teks({
    t0, t1: TERAKHIR_UBIN, x, y, w: 400, h: 250, cls: 'ubin', anim: 'zoom', fin: 0.5,
    html: `<div style="display:flex;justify-content:space-between;align-items:flex-start"><span class="no">0${i + 1}</span>${ikon(ik, 64, EMAS, 2)}</div><div class="nm">${nama}</div>`,
  });
  sesudah(it, (t, el) => {
    const aktif = E.out(P(t, L(24 + i), 0.3)) * (1 - E.out(P(t, L(25 + i), 0.3)));
    const ada = t >= L(24) - 0.3 && t < LE(30) + 0.3;
    const redup = ada ? 1 - 0.62 * (1 - aktif) : 1;
    el.style.opacity = +el.style.opacity * redup;
    el.style.transform += ` scale(${1 + 0.07 * aktif})`;
    el.style.borderColor = aktif > 0.05 ? `rgba(242,180,90,${0.3 + 0.7 * aktif})` : '';
    el.style.boxShadow = aktif > 0.05 ? `0 0 ${50 * aktif}px rgba(242,180,90,${0.45 * aktif})` : '';
    el.style.zIndex = aktif > 0.5 ? 3 : 2;
  });
});
const CONTOH = [
  [24, [['volume', 'volume dikurangi, dibayar penuh'], ['harga', 'harga digelembungkan'], ['kegiatan', 'kegiatan fiktif']]],
  [25, [['memberi', 'memberi atau menerima sesuatu'], ['keputusan', 'supaya keputusan berpihak']]],
  [26, [['uang', 'barang/uang yang dipercayakan'], ['dipakai', 'dipakai sendiri'], ['catatannya', 'catatannya dipalsukan']]],
  [27, [['layanan', 'layanan yang seharusnya gratis'], ['dimintai', 'tapi dimintai bayaran']]],
  [28, [['pemborong', 'pemborong atau pengawas'], ['mengurangi', 'sengaja mengurangi mutu'], ['membahayakan', 'bangunan membahayakan']]],
  [29, [['pejabat', 'pejabat yang mengurus pengadaan'], ['ikut', 'ikut bermain di dalamnya']]],
  [30, [['hadiah', 'hadiah karena jabatan'], ['dibungkus', 'dibungkus ucapan terima kasih']]],
];
CONTOH.forEach(([id, butir]) => {
  // satu deret per ubin: cip mengalir & membungkus sendiri, masing-masing
  // muncul saat katanya diucapkan (tempatnya sudah dipesan sejak awal)
  const html = `<div class="deret">${butir.map(([, h], j) => `<span class="cip" data-j="${j}">${h}</span>`).join('')}</div>`;
  const it = teks({ t0: W(id, butir[0][0]), t1: LE(id) + 0.25, x: 100, y: 800, w: 1720, cls: 'ctr', html, anim: 'fade', fin: 0.15, fout: 0.25 });
  sesudah(it, (t, el) => {
    el.querySelectorAll('.cip').forEach((c) => {
      const p = E.out5(P(t, W(id, butir[+c.dataset.j][0]), 0.5));
      c.style.opacity = p;
      c.style.transform = `translateY(${(1 - p) * 30}px)`;
    });
  });
  butir.forEach(([k]) => bunyi(W(id, k), 'tik', 0.35));
});
// gratifikasi: 30 hari kerja
capKanan(L(31), LE(32) + 0.3, 'UU Tipikor · <b>Pasal 12B–12C</b>');
svgItem({ t0: L(31) - 0.1, t1: LE(31) + 0.3, x: 300, y: 300, w: 240, h: 240, isi: ikonG('calendar-days', 10, 10, 220, EMAS, 3) });
teks({ t0: W(31, 'tiga') - 0.1, t1: LE(31) + 0.3, x: 610, y: 210, w: 600, cls: 'hero emas', html: '<span style="font-size:330px">30</span>', anim: 'zoom' });
teks({ t0: W(31, 'hari'), t1: LE(31) + 0.3, x: 1000, y: 300, w: 760, cls: 'h1', html: 'hari kerja', anim: 'kiri' });
teks({ t0: W(31, 'ka-pe-ka') - 0.1, t1: LE(31) + 0.3, x: 1000, y: 462, w: 760, cls: 'h3', html: 'paling lambat, <span class="emas">lapor ke KPK</span>', anim: 'naik' });
teks({ t0: W(31, 'suap') - 0.15, t1: LE(31) + 0.3, x: 610, y: 640, cls: 'stempel', html: 'Kalau tidak: dapat dianggap suap', anim: 'stempel', rot: -4 });
// formulir: ketujuhnya tersedia
const D7 = POS['p-kecurangan'].dugaan, D7i = POS['p-isi'].dugaan;
ponsel({
  t0: L(32) - 0.3, t1: LE(32) + 0.5, x: 1240, y: 38, w: 480, miring: -12,
  layar: [
    { t: 0, src: 'p-kecurangan', gulir: [[L(32), D7.y - 260]] },
    { t: W(32, 'pilihan') - 0.1, src: 'p-isi', gulir: [[L(32), D7i.y - 260]] },
  ],
  fokus: [{ t: W(32, 'formulir'), d: 3.6, ...D7 }],
  ketuk: [[W(32, 'pilihan') - 0.25, 59, D7.y + 174]],
  zum: [[L(32), 1, 0.5, 0.3], [W(32, 'formulir'), 1.16, 0.5, 0.3], [LE(32) + 0.5, 1.16, 0.5, 0.3]],
});
teks({ t0: L(32), t1: LE(32) + 0.5, x: X0, y: 300, w: 980, cls: 'h2', html: 'Tak perlu dihafal', anim: 'huruf' });
teks({ t0: W(32, 'formulir'), t1: LE(32) + 0.5, x: X0, y: 430, w: 900, cls: 'h3', html: 'ketujuhnya tersedia sebagai <span class="emas">pilihan</span> di formulir', anim: 'naik' });

// ════════════════ s5 · MEMBACA REMBESAN ════════════════════════════════════
kartuBab('s5', '04', 'Membaca rembesan', 'Tanda-tanda yang patut diwaspadai', 'perahu_aceh', [30, 0, 1.12, -30, 0, 1.02]);
tandaBab('s5', 'Babak 04 · <b>Membaca rembesan</b>');
D(CD.s5.start + 1.2, { langit: 'malam', dim: 0.5, leak: 0.85, fog: 0, cloud: 0.2, shipX: 960, shipS: 0.8, camZ: 1.12, camY: -60, wind: 0.3 });
D(L(38) - 0.2, { camZ: 1.0, camY: 0, dim: 0.72, shipX: 1450, shipS: 0.5 });
tahan('s5', { shipX: 1450, shipS: 0.5 });

const NODA = [[400, 330, 34], [960, 300, 34], [1520, 330, 35], [400, 690, 36], [960, 670, 36], [1520, 700, 37]];
const kataNoda = [W(34, 'pekerjaan'), W(35, 'harga'), W(35, 'pemenang'), W(36, 'pungutan'), W(36, 'pegawai'), W(37, 'gaya')];
{
  const n = uid();
  svgItem({
    t0: L(33) - 0.4, t1: LE(37) + 0.6, fin: 0.7, fout: 0.8,
    isi: papanKayu(LW, LH, n) + `<defs><radialGradient id="basah${n}"><stop offset="0" stop-color="rgba(8,14,20,.92)"/><stop offset=".6" stop-color="rgba(14,24,32,.65)"/><stop offset="1" stop-color="rgba(14,24,32,0)"/></radialGradient></defs>`
      + NODA.map(([x, y], i) => `<g class="nd" data-i="${i}"><ellipse class="bs" cx="${x}" cy="${y}" rx="0" ry="0" fill="url(#basah${n})"/><path class="kilap" d="M ${x - 40} ${y - 30} q 20 -16 52 -10" stroke="rgba(200,230,250,.35)" stroke-width="5" fill="none" stroke-linecap="round" opacity="0"/>`
        + [0, 1, 2].map((j) => `<line class="al" data-j="${j}" x1="${x - 40 + j * 40}" y1="${y + 20}" x2="${x - 40 + j * 40}" y2="${y + 20}" stroke="rgba(170,210,235,.55)" stroke-width="5" stroke-linecap="round"/><circle class="tt" data-j="${j}" cx="${x - 40 + j * 40}" cy="${y + 20}" r="7" fill="rgba(200,230,250,.85)" opacity="0"/>`).join('') + '</g>').join(''),
    gambar: (el, t) => {
      el.querySelectorAll('.nd').forEach((g) => {
        const i = +g.dataset.i;
        const t0 = kataNoda[i];
        const p = E.out(P(t, t0, 1.2));
        const besar = i === 5 ? 1.35 : 1;
        g.querySelector('.bs').setAttribute('rx', 120 * p * besar);
        g.querySelector('.bs').setAttribute('ry', 95 * p * besar);
        g.querySelector('.kilap').setAttribute('opacity', 0.8 * p);
        g.querySelectorAll('.al').forEach((l) => {
          const j = +l.dataset.j;
          const u = E.out(P(t, t0 + 0.4 + j * 0.35, 2.2));
          l.setAttribute('y2', +l.getAttribute('y1') + u * (90 + hash(i * 3 + j) * 110) * besar);
        });
        g.querySelectorAll('.tt').forEach((c) => {
          const j = +c.dataset.j;
          const u = E.out(P(t, t0 + 0.4 + j * 0.35, 2.2));
          const panjang = (90 + hash(i * 3 + j) * 110) * besar;
          const jatuh = ((t - t0 - 2.6 - j * 0.5) * 0.8) % 1.6;
          c.setAttribute('cy', +c.getAttribute('cy') * 0 + (NODA[i][1] + 20 + u * panjang + (jatuh > 0 ? jatuh * jatuh * 260 : 0)));
          c.setAttribute('opacity', u > 0.05 ? (jatuh > 0 ? Math.max(0, 1 - jatuh) : 1) * 0.9 : 0);
        });
      });
    },
  });
}
kataNoda.forEach((t) => bunyi(t + 0.2, 'tetes', 0.7));
tirai({ t0: L(33) - 0.2, t1: LE(33) + 0.3, bg: 'linear-gradient(180deg, rgba(3,9,16,.9) 0%, rgba(3,9,16,.6) 45%, rgba(3,9,16,0) 75%)' });
teks({ t0: L(33), t1: LE(33) + 0.3, x: 0, y: 200, w: LW, cls: 'serif ctr', html: 'Kecurangan jarang terlihat langsung.', anim: 'naik' });
teks({ t0: W(33, 'yang'), t1: LE(33) + 0.3, x: 0, y: 300, w: LW, cls: 'h1 ctr emas', html: 'Yang terlihat: rembesannya.', anim: 'huruf' });
const LABEL_NODA = ['Selesai di atas kertas, tidak di lapangan', 'Harga jauh di atas pasaran', 'Pemenang yang itu-itu saja', 'Pungutan tanpa kuitansi', 'Tak pernah mau cuti, tak mau digantikan', 'Gaya hidup melampaui penghasilan'];
NODA.forEach(([x, y], i) => {
  teks({
    t0: kataNoda[i] + 0.25, t1: LE(37) + 0.6, x: x - 240, y: y + 60, w: 480, cls: 'kertas', anim: 'jatuh', fin: 0.6,
    html: `<div style="padding:16px 22px 18px;font-size:30px;font-weight:800;line-height:1.22;text-align:center;transform:rotate(${(hash(i) - 0.5) * 4}deg)">${LABEL_NODA[i]}</div>`,
  });
});
teks({ t0: W(37, 'paling') - 0.2, t1: LE(37) + 0.6, x: 1290, y: 905, w: 520, cls: 'ctr', html: `<span class="cip">${ikon('trending-up', 30, EMAS, 2.4)}&nbsp; tanda paling sering · ACFE 2026</span>`, anim: 'naik' });
capKanan(W(37, 'a-ce-ef-e') - 0.3, LE(38) + 0.3, 'ACFE · <b>Occupational Fraud 2026</b>');
teks({ t0: L(38) - 0.1, t1: LE(38) + 0.3, x: 0, y: 200, w: LW, cls: 'ctr persen', html: '<span style="font-size:330px">84%</span>', anim: 'zoom' });
teks({ t0: L(38) + 0.4, t1: LE(38) + 0.3, x: 260, y: 520, w: 1400, cls: 'h2 ctr', html: 'pelaku sudah menunjukkan setidaknya <span class="emas">satu tanda</span>', anim: 'naik' });
teks({ t0: W(38, 'sebelum'), t1: LE(38) + 0.3, x: 260, y: 750, w: 1400, cls: 'serif ctr', html: 'sebelum akhirnya ketahuan', anim: 'naik' });
teks({ t0: L(39), t1: LE(39) + 0.3, x: 0, y: 240, w: LW, cls: 'kicker ctr', html: 'Area rawan yang dipantau KPK', anim: 'fade' });
[['pengadaan', 'Pengadaan barang & jasa', 520, 360], ['perizinan', 'Perizinan', 960, 360], ['hibah', 'Hibah & bantuan sosial', 1400, 360], ['penganggaran', 'Penganggaran', 740, 470], ['manajemen', 'Manajemen ASN', 1180, 470]].forEach(([k, h, cx, y]) => {
  teks({ t0: W(39, k), t1: LE(39) + 0.3, x: cx - 300, y, w: 600, cls: 'ctr', html: `<span class="cip merah">${h}</span>`, anim: 'zoom' });
  bunyi(W(39, k), 'tik', 0.5);
});
teks({ t0: L(40), t1: LE(40) + 0.3, x: 0, y: 300, w: LW, cls: 'h2 ctr', html: 'Satu tanda <span class="redup">≠</span> kecurangan', anim: 'naik' });
teks({ t0: W(40, 'tapi'), t1: LE(40) + 0.3, x: 0, y: 425, w: LW, cls: 'h2 ctr emas', html: 'Tapi tanda yang Anda saksikan sendiri…', anim: 'naik' });
teks({ t0: W(40, 'layak'), t1: LE(40) + 0.3, x: 0, y: 545, w: LW, cls: 'h1 ctr', html: 'layak dilaporkan.', anim: 'huruf' });
lonceng({ t0: W(40, 'layak') - 0.3, t1: LE(40) + 0.3, x: 960, y: 715, ukuran: 0.45, dering: [W(40, 'dilaporkan')], g: 0.5 });

// ════════════════ s6 · MENGAPA KITA DIAM ═══════════════════════════════════
kartuBab('s6', '05', 'Mengapa kita diam', 'Lima alasan, lima jawaban', 'lampulo', [0, 20, 1.1, 0, -10, 1.02]);
tandaBab('s6', 'Babak 05 · <b>Mengapa kita diam</b>');
D(CD.s6.start + 1.2, { langit: 'biru', fog: 1, dim: 0.66, leak: 1, tilt: 0.05, shipX: 1500, shipS: 0.45, wind: 0.15, camZ: 1.0, camY: 0, shipY: 8 });
tahan('s6', { shipX: 1500, shipS: 0.45 });
D(LE(55), { shipY: 22, tilt: 0.08 });

teks({ t0: L(41), t1: W(41, 'lima') - 0.2, x: 0, y: 360, w: LW, cls: 'serif ctr', html: 'Kalau tandanya terlihat,<br>kenapa jarang dilaporkan?', anim: 'naik', fout: 0.3 });
teks({ t0: W(41, 'lima') - 0.1, t1: L(42) - 0.1, x: 0, y: 420, w: LW, cls: 'h1 ctr', html: 'Lima alasan', anim: 'huruf', fout: 0.3 });
teks({ t0: L(42) - 0.1, t1: LE(51) + 0.3, x: X0, y: 150, w: 700, cls: 'kicker', html: 'Alasan untuk diam', anim: 'kiri' });
teks({ t0: L(43) - 0.1, t1: LE(51) + 0.3, x: 1010, y: 150, w: 760, cls: 'kicker', html: 'Jawabannya', anim: 'kanan' });
const ALASAN = [
  [42, 'Takut dibalas.', 'venetian-mask', 'Boleh melapor <span class="emas">tanpa nama</span>.'],
  [44, 'Sungkan, dia atasan saya.', 'lock', 'Tak bisa dibuka akun <span class="emas">perangkat daerah</span> mana pun.'],
  [46, 'Belum punya bukti.', 'search', 'Anda <span class="emas">pelapor</span>, bukan penyidik.'],
  [48, 'Percuma, tidak akan ditindaklanjuti.', 'ticket', 'Ada <span class="emas">nomor tiket</span> &amp; status yang bisa dipantau.'],
  [50, 'Bukan urusan saya.', 'school', 'Uang jalan, sekolah, puskesmas <span class="emas">Anda sendiri</span>.'],
];
ALASAN.forEach(([id, alasan, ik, jawab], i) => {
  const y = 220 + i * 142;
  const g = teks({ t0: L(id) - 0.05, t1: LE(51) + 0.3, x: X0, y, cls: 'gelembung', html: `“${alasan}”`, anim: 'kiri', fin: 0.5 });
  redupkan(g, L(id + 1), 0.4);
  teks({ t0: L(id + 1), t1: LE(51) + 0.3, x: 1010, y: y + 10, w: 820, cls: 'jawab', html: `<div class="baris">${ikon(ik, 56, EMAS, 2.2)}<span>${jawab}</span></div>`, anim: 'kanan', fin: 0.5 });
  bunyi(L(id) - 0.05, 'pop', 0.4);
  bunyi(L(id + 1), 'tik', 0.55);
});
teks({ t0: L(52), t1: LE(52) + 0.4, x: 0, y: 300, w: LW, cls: 'kicker ctr', html: 'Padahal', anim: 'fade' });
teks({ t0: W(52, 'diam') - 0.1, t1: LE(52) + 0.4, x: 0, y: 380, w: LW, cls: 'hero ctr', html: 'Diam itu <span class="merah">mahal</span>.', anim: 'huruf' });
capKanan(L(53), LE(54) + 0.3, 'ACFE · <b>Occupational Fraud 2026</b>');
teks({ t0: L(53), t1: LE(54) + 0.3, x: X0, y: 160, w: 800, cls: 'kicker', html: 'Laporan ACFE 2026 mempelajari', anim: 'kiri' });
teks({ t0: W(53, 'dua'), t1: LE(54) + 0.3, x: X0, y: 220, w: 760, cls: 'h2', html: '2.402 <span class="redup" style="font-size:60px">kasus</span>', anim: 'kiri' });
teks({ t0: W(53, '143'), t1: LE(54) + 0.3, x: X0, y: 330, w: 760, cls: 'h2', html: '143 <span class="redup" style="font-size:60px">negara</span>', anim: 'kiri' });
teks({ t0: W(53, 'jauh'), t1: LE(54) + 0.3, x: X0, y: 470, w: 820, cls: 'h3 emas', html: 'jauh melampaui audit', anim: 'naik' });
svgItem({
  t0: W(53, '43') - 0.4, t1: LE(54) + 0.3, x: 1060, y: 170, w: 600, h: 600, fin: 0.5,
  isi: `<circle cx="300" cy="300" r="230" fill="none" stroke="rgba(244,241,234,.14)" stroke-width="48"/><circle class="busur" cx="300" cy="300" r="230" fill="none" stroke="${EMAS}" stroke-width="48" stroke-dasharray="${2 * Math.PI * 230}" stroke-dashoffset="${2 * Math.PI * 230}" transform="rotate(-90 300 300)" stroke-linecap="butt"/>`
    + `<text class="angka" x="300" y="345" text-anchor="middle" font-family="Bebas" font-size="170" fill="${PUTIH}">0%</text><text x="300" y="400" text-anchor="middle" font-family="Jakarta" font-weight="700" font-size="28" fill="${REDUP}">terungkap lewat laporan</text>`,
  gambar: (el, t) => {
    const p = E.out(P(t, W(53, '43'), 1.3));
    el.querySelector('.busur').setAttribute('stroke-dashoffset', 2 * Math.PI * 230 * (1 - 0.43 * p));
    el.querySelector('.angka').textContent = Math.round(43 * p) + '%';
  },
});
svgItem({
  t0: L(54) - 0.1, t1: LE(54) + 0.3, x: X0, y: 600, w: 820, h: 120, fin: 0.4,
  isi: `<defs><clipPath id="sep"><rect class="kp" x="0" y="0" width="0" height="120"/></clipPath></defs>`
    + Array.from({ length: 10 }, (_, i) => ikonG('user', i * 78, 10, 70, 'rgba(244,241,234,.35)', 2.4)).join('')
    + `<g clip-path="url(#sep)">${Array.from({ length: 10 }, (_, i) => ikonG('user', i * 78, 10, 70, EMAS, 3)).join('')}</g>`,
  gambar: (el, t) => el.querySelector('.kp').setAttribute('width', 5.5 * 78 * E.out(P(t, W(54, 'separuh'), 0.9))),
});
teks({ t0: W(54, 'separuh'), t1: LE(54) + 0.3, x: X0, y: 740, w: 900, cls: 'h4', html: 'lebih dari separuh laporan: <span class="emas">dari pegawai sendiri</span>', anim: 'naik' });
// dua belas bulan
svgItem({
  t0: L(55) - 0.2, t1: LE(55) + 0.4, fin: 0.4,
  isi: `<line x1="200" y1="520" x2="1720" y2="520" stroke="rgba(244,241,234,.2)" stroke-width="16" stroke-linecap="round"/><line class="isi" x1="200" y1="520" x2="200" y2="520" stroke="${EMAS}" stroke-width="16" stroke-linecap="round"/>`
    + Array.from({ length: 12 }, (_, i) => `<g class="bl" data-i="${i}" opacity="0"><circle cx="${200 + (i + 1) * (1520 / 12)}" cy="520" r="14" fill="${EMAS}"/><text x="${200 + (i + 1) * (1520 / 12)}" y="480" text-anchor="middle" font-family="Bebas" font-size="40" fill="${PUTIH}">${i + 1}</text></g>`).join('')
    + `<path class="kurva" d="M 200 860 C 800 850 1300 800 1720 600" stroke="${MERAH}" stroke-width="8" fill="none" stroke-dasharray="1700" stroke-dashoffset="1700"/>`,
  gambar: (el, t) => {
    const p = E.inout(P(t, W(55, 'dua'), W(55, 'terbongkar') - W(55, 'dua') + 0.3));
    el.querySelector('.isi').setAttribute('x2', 200 + 1520 * p);
    el.querySelectorAll('.bl').forEach((g) => g.setAttribute('opacity', p * 12 >= +g.dataset.i + 0.6 ? 1 : 0));
    el.querySelector('.kurva').setAttribute('stroke-dashoffset', 1700 * (1 - E.inout(P(t, W(55, 'makin', 1), 1.8))));
  },
});
teks({ t0: W(55, 'dua'), t1: LE(55) + 0.4, x: 0, y: 300, w: LW, cls: 'h2 ctr', html: '± <span class="emas">12 bulan</span> berjalan sebelum terbongkar', anim: 'naik' });
teks({ t0: W(55, 'makin', 1) + 0.6, t1: LE(55) + 0.4, x: 1180, y: 640, w: 600, cls: 'h3 merah', html: 'kerugian ikut membesar', anim: 'naik' });

// ════════════════ s7 · MELAPOR DENGAN BENAR ════════════════════════════════
kartuBab('s7', '06', 'Melapor dengan benar', 'Fakta, bukan prasangka', 'peta_sumatra_barat', [0, 40, 1.12, 0, -30, 1.0]);
tandaBab('s7', 'Babak 06 · <b>Melapor dengan benar</b>');
D(CD.s7.start + 1.2, { langit: 'fajar', fog: 0.3, dim: 0.7, leak: 0.9, tilt: 0.04, shipY: 14, cloud: 0.3, cloudDark: 0, shipX: 1500 });
tahan('s7', { shipX: 1500, shipS: 0.45 });

teks({ t0: L(56), t1: LE(56) + 0.3, x: 0, y: 400, w: LW, cls: 'h1 ctr', html: 'Seperti apa laporan yang baik?', anim: 'huruf' });
teks({ t0: L(57), t1: LE(58) + 0.2, x: X0, y: 150, w: 1200, cls: 'kicker', html: 'Mulailah dari fakta, bukan kesimpulan', anim: 'kiri' });
const kiri57 = teks({ t0: W(57, 'kantor') - 0.3, t1: LE(58) + 0.2, x: X0, y: 230, w: 600, cls: 'kertas', anim: 'naik', html: `<div style="padding:26px 32px 30px"><div class="label" style="color:#b3261e">Kesimpulan</div><div class="h2 kertas-t" style="margin-top:12px;font-size:84px">“Kantor itu korup.”</div></div>` });
redupkan(kiri57, W(57, 'tapi'), 0.45);
svgItem({ t0: W(57, 'tapi') - 0.1, t1: LE(58) + 0.2, x: 640, y: 200, w: 120, h: 120, fin: 0.35, isi: ikonG('circle-x', 6, 6, 108, MERAH, 3.2), gambar: (el, t, pin) => { el.style.transform = `scale(${0.6 + 0.4 * E.back(pin)})`; } });
bunyi(W(57, 'tapi'), 'stempel', 0.6);
teks({ t0: W(57, 'tapi'), t1: LE(58) + 0.2, x: 840, y: 230, w: 930, h: 330, cls: 'kertas', anim: 'naik', html: `<div style="padding:26px 32px"><div class="label" style="color:#1f7a45">Fakta</div></div>` });
const FAKTA = '<span data-k="kapan">Senin lalu</span>, <span data-k="siapa">petugas</span> <span data-k="dimana">loket</span> <span data-k="apa">meminta Rp50.000 untuk surat yang seharusnya gratis</span>, <span data-k="bagaimana">tanpa kuitansi</span>.';
const fakta = teks({ t0: W(57, 'senin'), t1: LE(58) + 0.2, x: 872, y: 300, w: 860, cls: 'serif kertas-t', html: FAKTA, anim: 'ketik', fin: LE(57) - W(57, 'senin') - 0.2 });
fakta.el.style.fontSize = '44px';
const W5 = [['apa', 'Apa', 'apa'], ['di', 'Di mana', 'dimana'], ['kapan', 'Kapan', 'kapan'], ['siapa', 'Siapa', 'siapa'], ['bagaimana', 'Bagaimana', 'bagaimana']];
sesudah(fakta, (t, el) => {
  W5.forEach(([k, , d]) => {
    const a = E.out(P(t, W(58, k), 0.3));
    el.querySelectorAll(`[data-k="${d}"]`).forEach((s) => { s.style.background = a > 0.02 ? `rgba(242,180,90,${0.42 * a})` : ''; s.style.borderRadius = '6px'; });
  });
});
W5.forEach(([k, h], i) => {
  teks({ t0: W(58, k), t1: LE(58) + 0.2, x: 150 + i * 330, y: 690, w: 320, cls: 'h2 emas ctr', html: h, anim: 'naik' });
  bunyi(W(58, k), 'tik', 0.5);
});
teks({ t0: L(58), t1: LE(58) + 0.2, x: 0, y: 620, w: LW, cls: 'kicker ctr', html: 'Lima pertanyaan di formulir', anim: 'fade' });
// siapa & bukti di formulir
const QK = POS['p-kecurangan'];
ponsel({
  t0: L(59) - 0.4, t1: LE(59) + 0.4, x: 1240, y: 38, w: 480, miring: -12,
  layar: [{ t: 0, src: 'p-kecurangan', gulir: [[L(59), QK.q_siapa.y - 250], [W(59, 'sebutkan') - 0.5, QK.q_siapa.y - 250], [W(59, 'sebutkan') + 0.4, QK.bukti.y - 250]] }],
  fokus: [{ t: W(59, 'jabatan') - 0.1, d: W(59, 'sebutkan') - W(59, 'jabatan') - 0.3, ...QK.q_siapa }, { t: W(59, 'bukti'), d: 2.2, ...QK.bukti }],
  zum: [[L(59), 1, 0.5, 0.3], [W(59, 'jabatan'), 1.16, 0.5, 0.3], [LE(59) + 0.4, 1.16, 0.5, 0.3]],
});
teks({ t0: L(59), t1: LE(59) + 0.4, x: X0, y: 260, w: 900, cls: 'h1', html: 'Siapa?', anim: 'kiri' });
teks({ t0: W(59, 'jabatan'), t1: LE(59) + 0.4, x: X0, y: 400, w: 900, cls: 'h3', html: '<span class="emas">jabatan atau peran</span> lebih menolong daripada nama', anim: 'naik' });
teks({ t0: W(59, 'bukti') - 0.1, t1: LE(59) + 0.4, x: X0, y: 560, w: 900, cls: 'h1', html: 'Bukti?', anim: 'kiri' });
teks({ t0: W(59, 'bukti') + 0.2, t1: LE(59) + 0.4, x: X0, y: 700, w: 900, cls: 'h3', html: 'sebutkan <span class="emas">jenisnya</span>, walau belum dilampirkan', anim: 'naik' });
// empat larangan
teks({ t0: L(60), t1: LE(60) + 0.15, x: 0, y: 400, w: LW, cls: 'h1 ctr merah', html: 'Empat larangan', anim: 'huruf', fout: 0.3 });
const LARANGAN = [
  [L(61), 'search-x', 'Jangan menyelidiki sendiri, apalagi menjebak', null],
  [W(61, 'jangan', 2), 'file-x', 'Jangan mengambil dokumen yang bukan hak Anda', null],
  [L(62), 'share-2', 'Jangan memviralkan dulu di media sosial', [W(62, 'bukti'), 'bukti bisa keburu dihilangkan · tuduhan bisa berbalik menjerat Anda']],
  [L(63), 'pencil-off', 'Jangan pernah mengarang', [W(63, 'laporan'), 'laporan palsu merugikan orang tak bersalah — dan bisa dipidana']],
];
LARANGAN.forEach(([t0, ik, judul, sub], i) => {
  const y = 170 + i * 180;
  svgItem({ t0, t1: LE(63) + 0.3, x: X0, y: y - 4, w: 96, h: 96, fin: 0.4, isi: `<circle cx="48" cy="48" r="46" fill="rgba(229,72,77,.16)" stroke="${MERAH}" stroke-width="3"/>${ikonG(ik, 22, 22, 52, MERAH, 2.6)}` });
  teks({ t0, t1: LE(63) + 0.3, x: X0 + 130, y, w: 1500, cls: 'h3', html: judul, anim: 'kiri' });
  if (sub) teks({ t0: sub[0], t1: LE(63) + 0.3, x: X0 + 130, y: y + 78, w: 1500, cls: 'serif-s', html: sub[1], anim: 'naik' });
  bunyi(t0, 'tik', 0.55);
});
teks({ t0: L(64), t1: LE(64) + 0.4, x: X0, y: 150, w: 1000, cls: 'kicker', html: 'Satu lagi · bila Anda melapor tanpa nama', anim: 'kiri' });
const detail = teks({ t0: L(64) + 0.3, t1: LE(64) + 0.4, x: 200, y: 230, w: 1100, cls: 'kertas', anim: 'naik', html: `<div style="padding:30px 38px;font-family:Playfair;font-style:italic;font-size:42px;line-height:1.4;color:#2a2118">“…saya mengantar berkas <span class="tanda">pukul 07.15, sebelum loket dibuka</span>, dan petugas itu langsung meminta uang…”</div>` });
sesudah(detail, (t, el) => {
  const a = E.out(P(t, W(64, 'detail'), 0.4));
  const s = el.querySelector('.tanda');
  s.style.background = a > 0.02 ? `rgba(229,72,77,${0.32 * a})` : '';
  s.style.boxShadow = a > 0.02 ? `0 0 0 3px rgba(229,72,77,${0.8 * a})` : '';
  s.style.borderRadius = '6px';
});
svgItem({
  t0: W(64, 'menunjuk') - 0.3, t1: LE(64) + 0.4, fin: 0.3,
  isi: `<path class="panah" d="M 780 470 C 900 620 1150 640 1370 600" stroke="${MERAH}" stroke-width="6" fill="none" stroke-dasharray="700" stroke-dashoffset="700" stroke-linecap="round"/>${ikonG('fingerprint', 1390, 500, 190, MERAH, 2.6, 'sidik')}`,
  gambar: (el, t) => {
    el.querySelector('.panah').setAttribute('stroke-dashoffset', 700 * (1 - E.inout(P(t, W(64, 'menunjuk') - 0.2, 0.8))));
    el.querySelector('.sidik').setAttribute('opacity', E.out(P(t, W(64, 'menunjuk') + 0.4, 0.4)));
  },
});
teks({ t0: W(64, 'menunjuk') + 0.5, t1: LE(64) + 0.4, x: 1300, y: 720, w: 560, cls: 'h4 ctr merah', html: 'bisa menunjuk balik ke Anda', anim: 'naik' });
teks({ t0: W(64, 'tulis') - 0.1, t1: LE(64) + 0.4, x: X0, y: 800, w: 1100, cls: 'h3 emas', html: sebaris('scale', 'Tulis yang perlu diperiksa · timbang sisanya', EMAS, 52), anim: 'naik' });

// ════════════════ s8 · CARA MELAPOR DI MR KABAR ════════════════════════════
kartuBab('s8', '07', 'Cara melapor di MR Kabar', 'Lewat kode QR Lapor, tanpa membuat akun', 'pantai_meulaboh', [30, 10, 1.12, -20, 0, 1.02]);
tandaBab('s8', 'Babak 07 · <b>Cara melapor di MR Kabar</b>');
D(CD.s8.start + 1.2, { langit: 'siang', dim: 0.7, leak: 0.9, fog: 0, cloud: 0.4, cloudDark: 0, tilt: 0.03, shipY: 14, shipX: 1500, shipS: 0.5 });
tahan('s8', { shipX: 1500, shipS: 0.5 });

const PA = POS['p-anonim'], PI = POS['p-isi'], PT = POS['p-tiket'];
const TAHAP = [
  [L(65), 'qr-code', 'Pindai kode QR Lapor'],
  [W(66, 'pilih'), 'shield-alert', 'Pilih tab Dugaan Kecurangan'],
  [W(66, 'identitas'), 'venetian-mask', 'Tentukan identitas'],
  [L(68), 'messages-square', 'Jawab lima pertanyaan'],
  [L(69), 'clipboard-list', 'Keterangan tambahan'],
  [L(70), 'image', 'Lampirkan bukti'],
  [L(71), 'send', 'Kirim · catat tiket &amp; kode akses'],
];
TAHAP.forEach(([ta, ik, h], i) => {
  const berikut = i + 1 < TAHAP.length ? TAHAP[i + 1][0] : 1e9;
  const it = teks({ t0: L(65) - 0.2 + i * 0.12, t1: LE(72) + 0.4, x: X0, y: 160 + i * 104, w: 980, cls: 'langkah', anim: 'kiri', fin: 0.5, html: `<div class="baris"><span class="bul">${i + 1}</span>${ikon(ik, 40, 'currentColor', 2.2)}<span>${h}</span></div>` });
  sesudah(it, (t, el) => {
    const aktif = t >= ta && t < berikut;
    const lewat = t >= berikut;
    el.style.color = aktif ? EMAS : lewat ? 'rgba(244,241,234,.8)' : 'rgba(244,241,234,.38)';
    const b = el.querySelector('.bul');
    b.style.background = aktif ? EMAS : lewat ? 'rgba(74,222,128,.22)' : 'transparent';
    b.style.borderColor = aktif ? EMAS : lewat ? HIJAU : 'rgba(244,241,234,.35)';
    b.style.color = aktif ? '#0b0e12' : PUTIH;
    b.textContent = lewat ? '✓' : String(i + 1);
    const redupMode = E.out(P(t, W(67, 'terbuka') - 0.3, 0.4)) * (1 - E.out(P(t, L(68) - 0.3, 0.4)));
    const redupAkhir = E.out(P(t, L(72) - 0.2, 0.4));
    el.style.opacity = +el.style.opacity * (1 - 0.96 * Math.max(redupMode, redupAkhir));
    el.style.transform += aktif ? ' translateX(12px)' : '';
  });
  if (i) bunyi(ta, 'tik', 0.45);
});
// tiga mode identitas (menggantikan daftar langkah sementara)
[['terbuka', 'user', 'Terbuka', 'nama &amp; kontak tersimpan'], ['anonim', 'user-round-x', 'Anonim, tetapi bisa dihubungi', 'nama tidak disimpan · kontak hanya terbaca penindaklanjut'], ['anonim', 'venetian-mask', 'Anonim penuh', 'nama &amp; kontak tidak disimpan sama sekali']].forEach(([k, ik, j, s], i) => {
  const t0 = W(67, k, i === 2 ? 2 : 1);
  teks({ t0, t1: L(68) - 0.2, x: X0, y: 200 + i * 210, w: 1000, cls: 'h3', html: sebaris(ik, j, EMAS, 56), anim: 'kiri', fout: 0.3 });
  teks({ t0: t0 + 0.2, t1: L(68) - 0.2, x: X0 + 78, y: 285 + i * 210, w: 960, cls: 'serif-s', html: s, anim: 'naik', fout: 0.3 });
});
const pil = W(65, 'kamera') + 0.4;
const tapTab = W(66, 'tab') + 0.15;
const tapPenuh = W(67, 'anonim', 2) + 0.7;
const isiMasuk = W(68, 'kejadiannya') + 0.2;
const tapKirim = W(71, 'tekan') + 0.35;
const gulKejadian = PA.q_apa.y - 150;
ponsel({
  t0: L(65) - 0.4, t1: LE(72) + 0.4, x: 1250, y: 38, w: 480, miring: -12,
  layar: [
    { t: 0, src: '#kamera', pil },
    { t: W(65, 'halaman') - 0.05, src: 'p-awal' },
    { t: tapTab + 0.15, src: 'p-kecurangan', gulir: [[W(66, 'identitas') - 0.5, 0], [W(66, 'identitas') + 0.5, 470]] },
    { t: tapPenuh + 0.15, src: 'p-anonim', gulir: [[L(68) - 0.4, 470], [L(68) + 0.6, gulKejadian]] },
    { t: isiMasuk, src: 'p-isi', gulir: [[L(69) - 0.3, gulKejadian], [L(69) + 0.6, PI.opd.y - 70], [L(70) - 0.3, PI.opd.y - 70], [L(70) + 0.5, PI.tinggi - VP_ISI], [W(71, 'tekan') - 0.4, PI.tinggi - VP_ISI]] },
    { t: tapKirim + 0.5, src: 'p-tiket', gulir: [[tapKirim + 0.5, 250]] },
  ],
  ketuk: [[W(65, 'halaman') - 0.35, VP_W / 2, VP_ISI * 0.8375], [tapTab, ...tengah(POS['p-awal'].tab_kecurangan)], [tapPenuh, ...tengah(POS['p-kecurangan'].mode_penuh)], [tapKirim, VP_W / 2, PI.tombol_kirim.y + 20]],
  fokus: [
    { t: W(67, 'terbuka'), d: W(67, 'anonim', 1) - W(67, 'terbuka') - 0.3, ...POS['p-kecurangan'].mode_terbuka },
    { t: W(67, 'anonim', 1), d: W(67, 'anonim', 2) - W(67, 'anonim', 1) - 0.3, ...POS['p-kecurangan'].mode_kontak },
    { t: W(67, 'anonim', 2), d: 2.6, ...POS['p-kecurangan'].mode_penuh },
    { t: W(68, 'pertama'), d: 2.6, ...PI.q_apa },
    { t: W(69, 'perangkat'), d: 1.2, ...PI.opd },
    { t: W(69, 'tahapan'), d: 1.2, ...PI.tahapan },
    { t: W(69, 'dugaan'), d: 1.5, ...PI.dugaan },
    { t: W(69, 'perkiraan'), d: 1.8, ...PI.kerugian },
    { t: W(70, 'foto'), d: 4.2, ...PI.lampiran },
    { t: W(71, 'nomor') - 0.2, d: 7.5, ...PT.tiket },
  ],
  zum: [[L(65), 1, 0.5, 0.5], [W(67, 'terbuka') - 0.4, 1.0, 0.5, 0.5], [W(67, 'terbuka') + 0.3, 1.16, 0.5, 0.36], [L(68), 1.16, 0.5, 0.36], [L(68) + 0.8, 1.0, 0.5, 0.5], [W(71, 'nomor') - 0.4, 1.0, 0.5, 0.5], [W(71, 'nomor') + 0.4, 1.2, 0.5, 0.32], [LE(72) + 0.4, 1.2, 0.5, 0.32]],
});
teks({ t0: W(72, 'catat') - 0.1, t1: LE(72) + 0.4, x: X0, y: 260, w: 980, cls: 'h1', html: 'Catat keduanya.', anim: 'huruf' });
teks({ t0: W(72, 'catat') + 0.3, t1: LE(72) + 0.4, x: X0, y: 420, w: 980, cls: 'h3', html: `${ikon('copy', 50, EMAS, 2.2)}&nbsp; Salin &nbsp;&nbsp;·&nbsp;&nbsp; ${ikon('file-pen-line', 50, EMAS, 2.2)}&nbsp; Tulis di kertas`, anim: 'naik' });
teks({ t0: W(72, 'sekali') - 0.15, t1: LE(72) + 0.4, x: X0, y: 580, cls: 'stempel', html: 'Hanya muncul sekali', anim: 'stempel', rot: -4 });

// ════════════════ s9 · SEBERAPA AMAN? ══════════════════════════════════════
kartuBab('s9', '08', 'Seberapa aman?', 'Yang dijaga aplikasi, dan yang dijaga undang-undang', 'mercusuar_breueh', [0, 20, 1.08, 0, -10, 1.0]);
tandaBab('s9', 'Babak 08 · <b>Seberapa aman?</b>');
D(CD.s9.start + 1.2, { langit: 'biru', lh: 1, beam: 1, dim: 0.62, leak: 0.7, tilt: 0.02, shipY: 10, shipX: 1250, shipS: 0.5, fog: 0.15, cloud: 0.15 });
tahan('s9', { shipX: 1250, shipS: 0.5 });

teks({ t0: L(73), t1: LE(73) + 0.3, x: 0, y: 400, w: LW, cls: 'h1 ctr', html: 'Seberapa aman saya?', anim: 'huruf' });
// nama dibuang server
teks({ t0: L(74), t1: LE(74) + 0.3, x: X0, y: 160, w: 900, cls: 'kicker', html: 'Mode anonim', anim: 'kiri' });
svgItem({
  t0: L(74) + 0.1, t1: LE(74) + 0.3, fin: 0.5,
  isi: `<rect x="150" y="260" width="640" height="230" rx="16" fill="#f3ead6"/><text x="190" y="320" font-family="Jakarta" font-weight="700" font-size="30" fill="#5b4a36">Nama Lengkap</text><rect x="190" y="345" width="560" height="96" rx="12" fill="#fff" stroke="#c9bea6" stroke-width="3"/>`
    + `<text class="nama" x="220" y="408" font-family="Jakarta" font-weight="700" font-size="42" fill="#2a2118">Nama Anda</text>`
    + `<path class="panah" d="M 820 375 L 1080 375" stroke="${EMAS}" stroke-width="6" stroke-dasharray="14 12" fill="none"/>`
    + `${ikonG('server', 1100, 290, 170, PUTIH, 2.4)}<text x="1185" y="510" text-anchor="middle" font-family="Jakarta" font-weight="700" font-size="28" fill="${REDUP}">server</text>`
    + `<g class="sampah" opacity="0">${ikonG('trash-2', 1450, 300, 150, MERAH, 2.6)}</g>`
    + Array.from({ length: 24 }, (_, i) => `<circle class="debu" data-i="${i}" r="${3 + hash(i) * 5}" fill="#2a2118" opacity="0"/>`).join(''),
  gambar: (el, t) => {
    const nama = el.querySelector('.nama');
    const ke = E.inout(P(t, W(74, 'server') - 0.3, 0.9));
    const buang = E.inout(P(t, W(74, 'membuangnya') - 0.1, 0.8));
    nama.setAttribute('x', 220 + 900 * ke + 340 * buang);
    nama.setAttribute('y', 408 - 30 * Math.sin(Math.PI * ke) + 20 * buang);
    nama.setAttribute('fill', ke > 0.05 ? PUTIH : '#2a2118');
    nama.setAttribute('opacity', 1 - E.out(P(t, W(74, 'membuangnya') + 0.6, 0.4)));
    el.querySelector('.sampah').setAttribute('opacity', E.out(P(t, W(74, 'membuangnya') - 0.3, 0.4)));
    el.querySelectorAll('.debu').forEach((c) => {
      const i = +c.dataset.i;
      const u = P(t, W(74, 'membuangnya') + 0.6, 1.0);
      c.setAttribute('cx', 1520 + (hash(i) - 0.5) * 220 * u);
      c.setAttribute('cy', 380 - 140 * u * hash(i + 4) + 120 * u * u);
      c.setAttribute('fill', PUTIH);
      c.setAttribute('opacity', u > 0 && u < 1 ? (1 - u) * 0.8 : 0);
    });
  },
});
bunyi(W(74, 'membuangnya') + 0.6, 'hapus', 0.7);
teks({ t0: W(74, 'disembunyikan'), t1: LE(74) + 0.3, x: X0, y: 620, w: 900, cls: 'h3 redup', html: `${ikon('circle-x', 46, MERAH, 2.4)}&nbsp; <s>disembunyikan</s>`, anim: 'kiri' });
teks({ t0: W(74, 'membuangnya'), t1: LE(74) + 0.3, x: X0, y: 710, w: 1200, cls: 'h3 emas', html: `${ikon('circle-check', 46, HIJAU, 2.4)}&nbsp; dibuang server, sekalipun ikut terkirim`, anim: 'kiri' });
// foto dibersihkan dari metadata
svgItem({
  t0: L(75) - 0.2, t1: LE(75) + 0.3, x: 200, y: 200, w: 600, h: 620, fin: 0.6,
  isi: `<g transform="rotate(-3 300 310)"><rect x="20" y="20" width="560" height="580" rx="6" fill="#f3ead6"/><rect x="44" y="44" width="512" height="470" fill="#8b7355"/>`
    + `<rect x="44" y="44" width="512" height="470" fill="url(#dinding)"/><defs><linearGradient id="dinding" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cdbf9f"/><stop offset="1" stop-color="#9c8b6b"/></linearGradient></defs>`
    + `<rect x="140" y="110" width="320" height="230" rx="8" fill="#fbf8f0" stroke="#5b4a36" stroke-width="8"/><text x="300" y="185" text-anchor="middle" font-family="Bebas" font-size="52" fill="#2a2118">PENGUMUMAN</text><text x="300" y="250" text-anchor="middle" font-family="Jakarta" font-weight="800" font-size="30" fill="#2a2118">Layanan ini</text><text x="300" y="300" text-anchor="middle" font-family="Bebas" font-size="62" fill="#1f7a45">GRATIS</text>`
    + `<rect x="44" y="400" width="512" height="114" fill="#6d5a42"/><text x="300" y="566" text-anchor="middle" font-family="Playfair" font-style="italic" font-size="30" fill="#3b2f22">foto bukti · contoh</text></g>`,
});
[['lokasi', 'map-pin', 'Lokasi pengambilan'], ['jenis', 'smartphone', 'Jenis & seri ponsel'], ['waktu', 'clock', 'Waktu pemotretan']].forEach(([k, ik, h], i) => {
  const it = teks({ t0: W(75, k), t1: LE(75) + 0.3, x: 900, y: 260 + i * 130, w: 900, cls: 'h3', html: sebaris(ik, h, EMAS, 56), anim: 'kanan' });
  sesudah(it, (t, el) => {
    const u = E.out(P(t, LE(75) - 0.7 + i * 0.12, 0.4));
    el.style.textDecoration = u > 0.5 ? 'line-through' : '';
    el.style.opacity = +el.style.opacity * (1 - 0.65 * u);
  });
});
svgItem({
  t0: LE(75) - 0.9, t1: LE(75) + 0.3, fin: 0.2,
  isi: `<rect class="sapu" x="880" y="230" width="18" height="420" fill="${EMAS}" opacity=".9"/>`,
  gambar: (el, t) => {
    const u = E.inout(P(t, LE(75) - 0.8, 0.8));
    el.querySelector('.sapu').setAttribute('x', 880 + 900 * u);
    el.querySelector('.sapu').setAttribute('opacity', u > 0 && u < 1 ? 0.9 : 0);
  },
});
bunyi(LE(75) - 0.8, 'hapus', 0.7);
teks({ t0: LE(75) - 0.1, t1: LE(75) + 0.3, x: 900, y: 690, w: 900, cls: 'h2 emas', html: sebaris('badge-check', 'dibersihkan', EMAS, 64), anim: 'zoom' });
// PDF
svgItem({ t0: L(76) - 0.1, t1: LE(76) + 0.3, x: 260, y: 240, w: 300, h: 340, isi: ikonG('file-text', 10, 10, 300, PUTIH, 2.2) + `<text x="160" y="250" text-anchor="middle" font-family="Bebas" font-size="66" fill="${MERAH}">PDF</text>` });
teks({ t0: W(76, 'nama'), t1: LE(76) + 0.3, x: 230, y: 610, w: 520, cls: 'kertas', anim: 'jatuh', html: `<div style="padding:16px 22px;font-size:30px;font-weight:800">${ikon('triangle-alert', 34, '#b45309', 2.6)}&nbsp; Penyusun: <span style="color:#b3261e">nama Anda</span></div>` });
teks({ t0: L(76) + 0.4, t1: LE(76) + 0.3, x: 900, y: 270, w: 900, cls: 'h3', html: 'PDF <span class="merah">tidak bisa</span> dibersihkan', anim: 'kanan' });
teks({ t0: W(76, 'khawatir'), t1: LE(76) + 0.3, x: 900, y: 430, w: 900, cls: 'h3 emas', html: sebaris('image', 'kirim tangkapan layarnya sebagai gambar', EMAS, 56), anim: 'kanan' });
// bukti tertutup, kode akses tak terbaca
teks({ t0: L(77), t1: LE(77) + 0.3, x: X0, y: 180, w: 900, cls: 'h3', html: sebaris('folder-lock', 'Bukti di <span class="emas">penyimpanan tertutup</span>', EMAS, 56), anim: 'kiri' });
svgItem({
  t0: W(77, 'kode') - 0.2, t1: LE(77) + 0.3, x: 200, y: 330, w: 1520, h: 360, fin: 0.4,
  isi: `<text class="kode" x="760" y="140" text-anchor="middle" font-family="Mono" font-weight="700" font-size="120" fill="${PUTIH}" letter-spacing="10">K7Q2M9XA</text>`
    + `<text class="hash" x="760" y="290" text-anchor="middle" font-family="Mono" font-weight="500" font-size="40" fill="${REDUP}" opacity="0">$2y$12$Qm4cX9vH1k0Lr8aZ3Tq.eW7uYb2Ns6Pf</text>`
    + `<path class="turun" d="M 760 170 L 760 230 M 740 210 L 760 232 L 780 210" stroke="${EMAS}" stroke-width="5" fill="none" opacity="0"/>`,
  gambar: (el, t) => {
    const u = E.out(P(t, W(77, 'apa'), 0.8));
    const acak = '$2y$12$Qm4cX9vH1k0Lr8aZ3Tq.eW7uYb2Ns6Pf';
    const h = el.querySelector('.hash');
    const n = Math.floor(acak.length * u);
    h.textContent = acak.slice(0, n) + acak.slice(n).replace(/./g, (c, i) => '0123456789abcdefXYZ$.'[Math.floor(hash(i + Math.floor(t * 20)) * 21)]);
    h.setAttribute('opacity', u);
    el.querySelector('.turun').setAttribute('opacity', u);
    el.querySelector('.kode').setAttribute('opacity', 1 - 0.6 * u);
  },
});
teks({ t0: W(77, 'tak') - 0.1, t1: LE(77) + 0.3, x: 0, y: 690, w: LW, cls: 'h3 ctr', html: sebaris('eye-off', 'tak seorang pun bisa membacanya — <span class="emas">termasuk Inspektorat</span>', EMAS, 52), anim: 'naik' });
teks({ t0: W(77, 'hilang') - 0.1, t1: LE(77) + 0.3, x: 560, y: 800, cls: 'stempel', html: 'Hilang = tak bisa dipulihkan', anim: 'stempel', rot: -3 });
// undang-undang
teks({ t0: L(78), t1: LE(78) + 0.3, x: 0, y: 420, w: LW, cls: 'h2 ctr', html: 'Kalau perkaranya sampai ke penegak hukum?', anim: 'naik' });
capKanan(L(79), LE(80) + 0.3, 'UU No. 31 Tahun 2014 · <b>Pasal 10 ayat (1)</b>');
teks({ t0: L(79), t1: LE(79) + 0.3, x: 200, y: 200, w: 1520, cls: 'kertas', anim: 'naik', html: `<div style="padding:34px 44px"><div class="label" style="color:#5b4a36">Perlindungan Saksi dan Korban</div><div style="font-family:Playfair;font-style:italic;font-size:44px;line-height:1.38;margin-top:14px;color:#2a2118">“… Pelapor tidak dapat dituntut secara hukum, baik <b>pidana maupun perdata</b> atas … laporan yang akan, sedang, atau telah diberikannya, kecuali … diberikan tidak dengan <b>iktikad baik</b>.”</div></div>` });
teks({ t0: W(79, 'el-pe-es-ka') - 0.1, t1: LE(79) + 0.3, x: 200, y: 720, w: 1520, cls: 'h3 emas', html: sebaris('shield-check', 'LPSK dapat memberi perlindungan', EMAS, 60), anim: 'naik' });
teks({ t0: L(80), t1: LE(80) + 0.3, x: 0, y: 200, w: LW, cls: 'kicker ctr', html: 'Syaratnya satu', anim: 'fade' });
teks({ t0: W(80, 'iktikad') - 0.1, t1: LE(80) + 0.3, x: 0, y: 260, w: LW, cls: 'hero ctr emas', html: 'Iktikad baik', anim: 'huruf' });
teks({ t0: W(80, 'jujur'), t1: LE(80) + 0.3, x: 0, y: 560, w: LW, cls: 'h3 ctr', html: `${ikon('circle-check', 50, HIJAU, 2.4)}&nbsp; untuk yang jujur`, anim: 'naik' });
teks({ t0: W(80, 'memfitnah'), t1: LE(80) + 0.3, x: 0, y: 650, w: LW, cls: 'h3 ctr', html: `${ikon('circle-x', 50, MERAH, 2.4)}&nbsp; <span class="merah">bukan untuk yang memfitnah</span>`, anim: 'naik' });

// ════════════════ s10 · SETELAH LONCENG BERBUNYI ═══════════════════════════
kartuBab('s10', '09', 'Setelah lonceng berbunyi', 'Telaah, status, dan tanya-jawab lewat tiket', 'senja_meulaboh', [0, 20, 1.12, 0, -10, 1.02]);
tandaBab('s10', 'Babak 09 · <b>Setelah lonceng berbunyi</b>');
D(CD.s10.start + 1.2, { langit: 'fajar', dim: 0.66, leak: 0.5, tilt: 0.01, shipY: 4, fog: 0, lh: 0, beam: 0, shipX: 1450, shipS: 0.5, cloud: 0.3 });
tahan('s10', { shipX: 1450, shipS: 0.5 });
D(W(86, 'ditutup') - 0.2, { leak: 0, tilt: 0, shipY: 0, ease: 'out' });

teks({ t0: L(81), t1: LE(81) + 0.3, x: 0, y: 400, w: LW, cls: 'h1 ctr', html: 'Setelah tombol ditekan?', anim: 'huruf' });
teks({ t0: W(82, 'ditelaah') - 0.2, t1: LE(82) + 0.4, x: 0, y: 260, w: LW, cls: 'h3 ctr', html: sebaris('file-search', 'Laporan Anda <span class="emas">ditelaah</span>', EMAS, 56), anim: 'naik' });
const STATUS = [['baru', 'Baru', 'inbox'], ['diverifikasi', 'Diverifikasi', 'search'], ['ditindaklanjuti', 'Ditindaklanjuti', 'clipboard-list'], ['selesai', 'Selesai', 'badge-check']];
svgItem({
  t0: W(82, 'baru') - 0.4, t1: LE(82) + 0.4, fin: 0.4,
  isi: `<line x1="300" y1="560" x2="1620" y2="560" stroke="rgba(244,241,234,.2)" stroke-width="10"/><line class="isi" x1="300" y1="560" x2="300" y2="560" stroke="${EMAS}" stroke-width="10"/>`
    + STATUS.map(([, h, ik], i) => `<g class="st" data-i="${i}"><circle cx="${300 + i * 440}" cy="560" r="62" fill="#0b1a28" stroke="rgba(244,241,234,.35)" stroke-width="5"/>${ikonG(ik, 300 + i * 440 - 30, 530, 60, PUTIH, 2.4)}<text x="${300 + i * 440}" y="690" text-anchor="middle" font-family="Bebas" font-size="56" fill="${PUTIH}">${h}</text></g>`).join(''),
  gambar: (el, t) => {
    const tt = STATUS.map(([k]) => W(82, k));
    // garis terisi menuju tiap simpul, tiba tepat saat statusnya diucapkan
    const isi = tt.slice(1).reduce((a, ta) => a + E.inout(P(t, ta - 0.55, 0.55)), 0);
    el.querySelector('.isi').setAttribute('x2', 300 + 440 * isi);
    el.querySelectorAll('.st').forEach((g) => {
      const i = +g.dataset.i;
      const a = E.out(P(t, tt[i], 0.35));
      g.style.opacity = 0.35 + 0.65 * a;
      g.querySelector('circle').setAttribute('stroke', a > 0.5 ? EMAS : 'rgba(244,241,234,.35)');
      g.querySelector('circle').setAttribute('fill', a > 0.5 ? 'rgba(242,180,90,.22)' : '#0b1a28');
    });
  },
});
STATUS.forEach(([k]) => bunyi(W(82, k), 'ping', 0.45));
const PS = POS['p-status'], PC = POS['p-cek'];
ponsel({
  t0: L(83) - 0.3, t1: LE(84) + 0.3, x: 1250, y: 38, w: 480, miring: -12,
  layar: [
    { t: 0, src: 'p-status', gulir: [[L(83), PS.tanya_jawab.y - 200]] },
    { t: W(83, 'buka') - 0.1, src: 'p-cek', gulir: [[W(83, 'buka'), PC.tinggi - VP_ISI]] },
    { t: W(83, 'jawab') - 0.35, src: 'p-status', gulir: [[W(83, 'jawab') - 0.35, PS.balasan.y - 260]] },
  ],
  fokus: [
    { t: W(83, 'pertanyaan'), d: W(83, 'buka') - W(83, 'pertanyaan') - 0.3, ...PS.tanya_jawab },
    { t: W(83, 'masukkan'), d: W(83, 'jawab') - W(83, 'masukkan') - 0.7, ...PC.cek_form },
    { t: W(83, 'jawab'), d: 4.2, ...PS.balasan },
  ],
  ketuk: [[W(83, 'jawab') - 0.65, ...tengah(PC.tombol_lihat)]],
  zum: [[L(83), 1.0, 0.5, 0.3], [W(83, 'pertanyaan'), 1.14, 0.5, 0.3], [LE(84) + 0.3, 1.14, 0.5, 0.3]],
});
barisan([
  [W(83, 'pertanyaan'), sebaris('message-circle', 'Pertanyaan muncul di tiket Anda', EMAS, 46)],
  [W(83, 'buka'), sebaris('key-round', 'Buka tab Cek Status Laporan', EMAS, 46)],
  [W(83, 'masukkan'), sebaris('ticket', 'Masukkan nomor tiket + kode akses', EMAS, 46)],
  [W(83, 'jawab'), sebaris('send', 'Jawab — bukti tambahan bisa dilampirkan', EMAS, 46)],
], { t1: LE(83) + 0.3, x: X0, y: 220, jarak: 120, w: 1000, cls: 'h4' });
teks({ t0: L(84) - 0.1, t1: LE(84) + 0.3, x: X0, y: 380, w: 980, cls: 'h2', html: sebaris('venetian-mask', 'Tanpa pernah menyebut <span class="emas">siapa Anda</span>.', EMAS, 80), anim: 'kiri' });
teks({ t0: L(85), t1: LE(85) + 0.3, x: X0, y: 180, w: 900, cls: 'kicker', html: 'Bersabarlah', anim: 'kiri' });
barisan([
  [W(85, 'pemeriksaan'), sebaris('hourglass', 'Pemeriksaan butuh waktu', EMAS, 56)],
  [W(85, 'tidak'), sebaris('circle-help', 'Tidak setiap dugaan terbukti', EMAS, 56)],
  [W(85, 'praduga') - 0.3, sebaris('scale', 'Yang dilaporkan berhak atas <span class="emas">asas praduga tak bersalah</span>', EMAS, 56)],
], { t1: LE(85) + 0.3, x: X0, y: 270, jarak: 150, w: 1600, cls: 'h3' });
// celah ditambal
svgItem({
  t0: L(86) - 0.2, t1: LE(86) + 0.4, x: 260, y: 220, w: 760, h: 520, fin: 0.5,
  isi: `<clipPath id="pnl"><rect x="0" y="0" width="760" height="520" rx="18"/></clipPath><g clip-path="url(#pnl)">${papanKayu(760, 520, uid())}</g>`
    + `<path class="celah" d="M 120 90 L 210 170 L 260 150 L 330 250 L 400 230 L 470 330 L 560 310 L 640 430" stroke="${MERAH}" stroke-width="10" fill="none" stroke-linejoin="round" stroke-dasharray="900" stroke-dashoffset="900"/>`
    + `<g class="tambal" opacity="0"><rect x="70" y="80" width="620" height="380" rx="20" fill="#c99a45" stroke="#7a531c" stroke-width="8"/>${[[100, 110], [660, 110], [100, 430], [660, 430], [380, 110], [380, 430]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="11" fill="#7a531c"/>`).join('')}<text x="380" y="290" text-anchor="middle" font-family="Bebas" font-size="72" fill="#3b2a10">DITAMBAL</text></g>`,
  gambar: (el, t) => {
    el.querySelector('.celah').setAttribute('stroke-dashoffset', 900 * (1 - E.inout(P(t, W(86, 'celah', 1) - 0.2, 0.9))));
    const tb = E.back(P(t, W(86, 'ditutup') - 0.1, 0.5));
    const g = el.querySelector('.tambal');
    g.setAttribute('opacity', clamp(P(t, W(86, 'ditutup') - 0.1, 0.2)));
    g.setAttribute('transform', `translate(0 ${(1 - tb) * -60}) `);
  },
});
bunyi(W(86, 'ditutup'), 'tambal', 0.8);
teks({ t0: L(86), t1: LE(86) + 0.4, x: 1080, y: 230, w: 760, cls: 'h3', html: 'Belum terbukti pun <span class="emas">berguna</span>:', anim: 'kanan' });
teks({ t0: W(86, 'celah', 1), t1: LE(86) + 0.4, x: 1080, y: 320, w: 760, cls: 'h2 merah', html: 'menunjukkan celah', anim: 'kanan' });
teks({ t0: W(86, 'risiko'), t1: LE(86) + 0.4, x: 1080, y: 470, w: 700, cls: 'kertas', anim: 'jatuh', html: `<div style="padding:20px 26px;font-size:32px;font-weight:800">${ikon('clipboard-list', 38, '#2a2118', 2.4)}&nbsp; Register risiko kecurangan</div>` });

// ════════════════ s11 · PENUTUP ════════════════════════════════════════════
kartuBab('s11', 'Penutup', 'Tiga pelajaran', 'Apa yang kita bawa pulang', 'pelangi_meulaboh');
tandaBab('s11', 'Penutup · <b>Tiga pelajaran</b>', LE(92));
D(CD.s11.start + 1.2, { langit: 'fajar', dim: 0.3, leak: 0, tilt: 0, shipY: 0, harbor: 1, shipX: 900, shipS: 0.7, fog: 0, cloud: 0.3, cloudDark: 0, wind: 0.25 });
D(L(91) - 0.4, { dim: 0.62 });
D(L(93) - 0.3, { dim: 0.7 });

teks({ t0: W(87, 'apa') - 0.1, t1: LE(87) + 0.3, x: 0, y: 400, w: LW, cls: 'h1 ctr', html: 'Apa yang kita bawa pulang?', anim: 'huruf' });
const PELAJARAN = [
  [88, 'perahu_usaid', 'Kecurangan butuh<br><em>kesempatan</em>.', 'Pengawasan dan keberanian bicara menutupnya.'],
  [89, 'senja_meulaboh', 'Diam tidak pernah<br><em>netral</em>.', 'Diam adalah kesempatan terbesar bagi kecurangan.'],
  [90, 'pantai_meulaboh', 'Laporkan <em>fakta</em>,<br>bukan prasangka.', 'Dengan iktikad baik, dan dengan hati-hati.'],
];
PELAJARAN.forEach(([id, src, judul, sub], i) => {
  foto({ src, mode: 'kiri', w: 1000, t0: L(id) - 0.4, t1: LE(id) + 0.5, kb: [20, 0, 1.12, -20, 0, 1.02] });
  tirai({ t0: L(id) - 0.4, t1: LE(id) + 0.5, bg: 'linear-gradient(270deg, rgba(6,18,31,.97) 0%, rgba(6,18,31,.9) 42%, rgba(6,18,31,0) 62%)' });
  teks({ t0: L(id) - 0.1, t1: LE(id) + 0.5, x: 1060, y: 170, w: 700, cls: 'kicker', html: 'Pelajaran', anim: 'kiri' });
  teks({ t0: L(id), t1: LE(id) + 0.5, x: 1050, y: 210, w: 700, cls: 'hero emas', html: '0' + (i + 1), anim: 'huruf' });
  teks({ t0: L(id) + 0.6, t1: LE(id) + 0.5, x: 1060, y: 470, w: 800, cls: 'h2', html: judul, anim: 'naik' });
  teks({ t0: L(id) + 2.0, t1: LE(id) + 0.5, x: 1060, y: 700, w: 760, cls: 'serif-s', html: sub, anim: 'naik' });
});
capKanan(L(91), LE(92) + 0.3, 'Perbup Aceh Barat · <b>No. 6 Tahun 2025</b>');
teks({ t0: L(91), t1: W(91, 'toleransi') - 0.3, x: 470, y: 260, w: 980, cls: 'kertas', anim: 'naik', fout: 0.4, html: `<div style="padding:34px 44px 38px;text-align:center"><div class="label" style="color:#5b4a36">Peraturan Bupati Aceh Barat</div><div class="h2 kertas-t" style="margin-top:10px">Nomor 6 Tahun 2025</div><div style="font-family:Playfair;font-style:italic;font-size:40px;color:#3b2f22;margin-top:6px">tentang Pengendalian Kecurangan</div></div>` });
teks({ t0: W(91, 'toleransi') - 0.3, t1: LE(91) + 0.3, x: 0, y: 170, w: LW, cls: 'kicker ctr', html: 'Prinsipnya', anim: 'fade' });
teks({ t0: W(91, 'toleransi') - 0.1, t1: LE(91) + 0.3, x: 0, y: 240, w: LW, cls: 'hero ctr emas', html: 'Toleransi nol', anim: 'huruf' });
[['perangkat', 'Perangkat Daerah', 480], ['be-u-em-de', 'BUMD', 860], ['be-el-u-de', 'BLUD', 1120], ['pemerintahan', 'Pemerintahan Gampong', 1460]].forEach(([k, h, cx]) => {
  teks({ t0: W(91, k), t1: LE(91) + 0.3, x: cx - 260, y: 560, w: 520, cls: 'ctr', html: `<span class="cip">${h}</span>`, anim: 'zoom' });
  bunyi(W(91, k), 'tik', 0.5);
});
teks({ t0: L(92), t1: LE(92) + 0.6, x: 0, y: 300, w: LW, cls: 'serif ctr', html: 'Tapi toleransi nol hanya bermakna,', anim: 'naik' });
teks({ t0: W(92, 'bila'), t1: LE(92) + 0.6, x: 0, y: 400, w: LW, cls: 'h1 ctr emas', html: 'bila yang melihat tidak memilih diam.', anim: 'huruf' });
lonceng({ t0: W(92, 'bila') - 0.2, t1: LE(92) + 0.6, x: 960, y: 600, ukuran: 0.55, dering: [W(92, 'diam')], g: 0.7 });
svgItem({ t0: L(93), t1: LE(93) + 0.4, x: 810, y: 150, w: 300, h: 225, fin: 1.0, isi: `<image href="img/emblem.png" x="0" y="0" width="300" height="225"/>` });
teks({ t0: L(93) + 0.4, t1: LE(93) + 0.4, x: 0, y: 420, w: LW, cls: 'h3 ctr', html: 'Inspektorat Kabupaten Aceh Barat', anim: 'naik' });
teks({ t0: W(93, 'bahan'), t1: LE(93) + 0.4, x: 0, y: 520, w: LW, cls: 'serif-s ctr redup', html: 'Bahan edukasi pencegahan kecurangan', anim: 'naik' });
foto({ src: 'pelangi_meulaboh', t0: L(94) - 0.6, t1: LE(95) + 1.2, kb: [0, 20, 1.14, 0, -10, 1.02], fin: 1.4 });
tirai({ t0: L(94) - 0.4, t1: LE(95) + 1.2, bg: 'linear-gradient(0deg, rgba(3,9,16,.85) 0%, rgba(3,9,16,.25) 55%, rgba(3,9,16,0) 80%)' });
teks({ t0: L(94), t1: LE(94) + 0.3, x: 0, y: 640, w: LW, cls: 'serif ctr', html: 'Laut tidak selalu tenang.', anim: 'naik' });
teks({ t0: W(94, 'tapi'), t1: LE(94) + 0.3, x: 0, y: 730, w: LW, cls: 'serif ctr emas', html: 'Tapi kapal yang awaknya berani membunyikan lonceng,<br>selalu punya kesempatan untuk pulang.', anim: 'naik' });
lonceng({ t0: W(94, 'membunyikan') - 0.4, t1: LE(94) + 0.3, x: 960, y: 260, ukuran: 0.6, dering: [W(94, 'membunyikan') + 0.1], g: 0.6, pendar: 0.8 });
svgItem({
  t0: L(95) - 0.2, t1: LE(95) + 1.2, x: 830, y: 260, w: 260, h: 242, fin: 1.0,
  isi: `<rect x="0" y="0" width="260" height="242" rx="34" fill="#f4f1ea"/><image href="img/mrkabar.png" x="20" y="16" width="220" height="210"/>`,
});
bunyi(W(95, 'em-er') - 0.3, 'boom', 0.8);
teks({ t0: W(95, 'em-er') - 0.3, t1: LE(95) + 1.2, x: 0, y: 540, w: LW, cls: 'hero ctr', html: 'MR KABAR', anim: 'huruf' });
teks({ t0: W(95, 'risiko'), t1: LE(95) + 1.2, x: 0, y: 760, w: LW, cls: 'serif ctr emas', html: 'Risiko TerKabar, Daerah Terjaga', anim: 'naik' });

D(LE(95) + 1.0, { lh: 1, langit: 'malam', dim: 0.55, beam: 1, shipX: 1300, shipS: 0.5, harbor: 0.6 });
teks({ t0: L(96) - 0.3, t1: LE(96) + 1.0, x: 0, y: 330, w: LW, cls: 'h3 ctr emas', html: 'Copyright © 2026', anim: 'naik' });
teks({ t0: W(96, 'sistem'), t1: LE(96) + 1.0, x: 0, y: 430, w: LW, cls: 'label ctr', html: 'System Architecture &amp; Development by', anim: 'fade' });
teks({ t0: W(96, 'nurhikmat') - 0.1, t1: LE(96) + 1.0, x: 0, y: 480, w: LW, cls: 'h1 ctr', html: 'Nurhikmat Muhammad', anim: 'huruf' });
teks({ t0: W(96, 'inspektorat'), t1: LE(96) + 1.0, x: 0, y: 640, w: LW, cls: 'serif ctr', html: 'Inspektorat Aceh Barat', anim: 'naik' });
garis({ t0: W(96, 'nurhikmat') + 0.4, t1: LE(96) + 1.0, x: 760, y: 615, w: 400, tebal: 5 });

const FOTO_DIPAKAI = ['perahu_usaid', 'badai_laut', 'peta_aceh', 'perahu_aceh', 'lampulo', 'peta_sumatra_barat', 'pantai_meulaboh', 'mercusuar_breueh', 'senja_meulaboh', 'pelangi_meulaboh'];
const kreditFoto = FOTO_DIPAKAI.map((k) => KREDIT[k]).filter(Boolean).map((k) => `<p>${k.judul.replace(/\.(jpe?g|png)$/i, '')}<br><small>${k.pembuat} · ${k.lisensi} · Wikimedia Commons</small></p>`).join('');
kreditGulir({
  t0: LE(96) + 1.5, t1: TL.total_duration - 0.4,
  html: `<div class="h2" style="margin-bottom:10px">Bunyikan Lonceng</div><div class="serif-s emas">Video edukasi Lapor Dugaan Kecurangan · MR Kabar</div>
  <h5>Disusun oleh</h5><p>Inspektorat Kabupaten Aceh Barat</p>
  <h5>System Architecture &amp; Development</h5><p>Nurhikmat Muhammad, Inspektorat Aceh Barat<br><small>Copyright © 2026</small></p>
  <h5>Rujukan</h5><p>UU No. 31 Tahun 1999 jo. UU No. 20 Tahun 2001 tentang Pemberantasan Tindak Pidana Korupsi</p><p>UU No. 31 Tahun 2014 tentang Perlindungan Saksi dan Korban</p><p>Peraturan Bupati Aceh Barat No. 6 Tahun 2025 tentang Pengendalian Kecurangan</p><p>ACFE, <i>Occupational Fraud 2026: A Report to the Nations</i></p><p>Donald R. Cressey, <i>Other People’s Money</i> (1953)</p>
  <h5>Narasi</h5><p>Suara sintetis Ardi &amp; Gadis</p>
  <h5>Musik &amp; efek suara</h5><p>Komposisi dan sintesis orisinal</p>
  <h5>Foto</h5>${kreditFoto}
  <h5>Ikon</h5><p>Lucide<br><small>ISC License</small></p>
  <h5>Huruf</h5><p>Bebas Neue · Plus Jakarta Sans · Playfair Display · JetBrains Mono<br><small>SIL Open Font License</small></p>
  <h5>Tangkapan layar</h5><p>Aplikasi MR Kabar · laporan contoh rekaan, dihapus sesudah pemotretan</p>`,
});

siapDunia();
window.setVideoTime(0);
