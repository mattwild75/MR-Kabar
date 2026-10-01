// ═══════════════════════════════════════════════════════════════════════════
// Mesin animasi video edukasi MR Kabar v6 — "Berlayar dengan Peta Risiko".
//
// Seluruh tampilan adalah FUNGSI MURNI dari waktu t: window.setVideoTime(t)
// menggambar frame pada detik t tanpa bergantung frame sebelumnya. Karena itu
// hasil render deterministik dan selalu sinkron dengan timeline.json.
//
// Tiga lapis:
//   dunia  (canvas)  langit, laut, pesisir, mercusuar, kapal, hujan, petir
//   foto   (DOM)     foto berlisensi terbuka dengan gerak kamera Ken Burns
//   ui     (DOM)     tipografi, diagram, tangkapan layar aplikasi
// ═══════════════════════════════════════════════════════════════════════════
const LW = 1920, LH = 1080;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const E = {
  lin: (t) => t,
  out: (t) => 1 - Math.pow(1 - t, 3),
  out5: (t) => 1 - Math.pow(1 - t, 5),
  inout: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  sine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
  back: (t) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  expo: (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
};
const P = (t, a, d) => clamp((t - a) / Math.max(d, 1e-6));
// Acak deterministik.
const hash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// ── waktu dari timeline ────────────────────────────────────────────────
const LN = {};
TL.lines.forEach((l) => (LN[l.id] = l));
const SC = {};
TL.scenes.forEach((s) => (SC[s.id] = s));
const CD = {};
TL.cards.forEach((c) => (CD[c.scene] = c));
const L = (id, o = 0) => LN[id].start + o;
const LE = (id, o = 0) => LN[id].end + o;
window.__peringatan = [];
/** Waktu kata ke-n (awalan, tanpa beda huruf besar) di kalimat id. Kata = teks TTS. */
function W(id, kata, n = 1, o = 0) {
  const k = kata.toLowerCase();
  let c = 0;
  for (const w of LN[id].words) {
    const x = w.w.toLowerCase().replace(/[^a-z0-9\-]/g, '');
    if (x.startsWith(k) && ++c === n) return w.t + o;
  }
  window.__peringatan.push(`W(${id}, "${kata}", ${n}) tidak ditemukan`);
  return LN[id].start + o;
}

// ═══════════════════════════════════════════════════════════════════════════
// DUNIA (canvas)
// ═══════════════════════════════════════════════════════════════════════════
const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const rgb = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;

const LANGIT = {
  malam: { sky0: '#030a14', sky1: '#081a2c', sky2: '#16324a', sea1: '#0b2133', sea0: '#040d16', stars: 1, moon: 1, sunA: 0, sunY: 140, cloud: 0.25, cloudDark: 0.7, glow: '#5d86a8' },
  badai: { sky0: '#05080c', sky1: '#10171e', sky2: '#26313b', sea1: '#121e27', sea0: '#060b10', stars: 0, moon: 0, sunA: 0, sunY: 160, cloud: 1, cloudDark: 1, glow: '#4a5866' },
  senja: { sky0: '#0f1b33', sky1: '#4a3157', sky2: '#e9875a', sea1: '#2a2d48', sea0: '#0b1324', stars: 0.25, moon: 0, sunA: 1, sunY: 26, cloud: 0.45, cloudDark: 0.25, glow: '#ffb070' },
  fajar: { sky0: '#162a4c', sky1: '#6d6f96', sky2: '#f7b56a', sea1: '#2c4566', sea0: '#0e2036', stars: 0.05, moon: 0, sunA: 1, sunY: -40, cloud: 0.35, cloudDark: 0.1, glow: '#ffd08a' },
  siang: { sky0: '#1d5f8f', sky1: '#5ea8d2', sky2: '#cfe6ee', sea1: '#2e7898', sea0: '#0f3d58', stars: 0, moon: 0, sunA: 0.5, sunY: -360, cloud: 0.4, cloudDark: 0, glow: '#ffffff' },
  biru: { sky0: '#04101d', sky1: '#0a2236', sky2: '#123a55', sea1: '#0c2a40', sea0: '#050f1a', stars: 0.6, moon: 0.4, sunA: 0, sunY: 140, cloud: 0.15, cloudDark: 0.6, glow: '#4f7ea3' },
};
const WARNA_KEY = ['sky0', 'sky1', 'sky2', 'sea1', 'sea0', 'glow'];
const BAWAAN_DUNIA = {
  hz: 610, wind: 0.35, rain: 0, fog: 0, coast: 1, lh: 0, beam: 0, harbor: 0,
  shipX: 1300, shipY: 0, shipS: 0.55, shipA: 1, ship2A: 0, ship2X: 760, buoys: 0, leak: 0, sail: 1,
  camX: 0, camY: 0, camZ: 1, dim: 0, tilt: 0,
};
const KD = []; // keyframe dunia
/** Kunci dunia pada waktu t. `langit` = nama preset; sisanya angka. */
function D(t, o = {}) {
  const k = { t, ease: o.ease || 'inout' };
  if (o.langit) Object.assign(k, LANGIT[o.langit]);
  for (const [a, b] of Object.entries(o)) if (a !== 'langit' && a !== 'ease') k[a] = b;
  KD.push(k);
}
function siapkanDunia() {
  KD.sort((a, b) => a.t - b.t);
  let prev = Object.assign({}, LANGIT.malam, BAWAAN_DUNIA);
  for (const k of KD) {
    for (const [a, b] of Object.entries(prev)) if (!(a in k)) k[a] = b;
    for (const c of WARNA_KEY) if (typeof k[c] === 'string') k[c] = hex(k[c]);
    prev = k;
  }
}
function keadaanDunia(t) {
  if (t <= KD[0].t) return KD[0];
  for (let i = 1; i < KD.length; i++) {
    if (t <= KD[i].t) {
      const a = KD[i - 1], b = KD[i];
      const f = (E[b.ease] || E.inout)(P(t, a.t, b.t - a.t));
      const s = {};
      for (const key in b) {
        if (key === 'ease' || key === 't') continue;
        const va = a[key], vb = b[key];
        if (Array.isArray(vb)) s[key] = vb.map((v, j) => lerp(va[j], v, f));
        else if (typeof vb === 'number') s[key] = lerp(va, vb, f);
        else s[key] = vb;
      }
      return s;
    }
  }
  return KD[KD.length - 1];
}
const PETIR = []; // waktu kilat
const SFX = []; // isyarat bunyi {t, nama, g} — diekspor ke build_sfx.py
window.SFX = SFX;
const bunyi = (t, nama, g = 1) => SFX.push({ t: +t.toFixed(3), nama, g });
const kilat = (...ts) => { PETIR.push(...ts); ts.forEach((t) => bunyi(t, 'guruh', 1)); };
/** Sampel suasana dunia untuk lapisan ambience (ombak, angin, hujan). */
window.sampelSuasana = (dt) => {
  const hasil = [];
  for (let t = 0; t <= TL.total_duration; t += dt) {
    const s = keadaanDunia(t);
    hasil.push([+t.toFixed(2), +s.wind.toFixed(3), +s.rain.toFixed(3), +s.cloud.toFixed(3), +s.dim.toFixed(3)]);
  }
  return hasil;
};

const kanvas = document.getElementById('dunia');
const ctx = kanvas.getContext('2d');

// awan: sprite lembut dibuat sekali
const AWAN = [];
for (let i = 0; i < 5; i++) {
  const c = document.createElement('canvas');
  c.width = 700; c.height = 260;
  const g = c.getContext('2d');
  for (let j = 0; j < 14; j++) {
    const x = 120 + hash(i * 31 + j) * 460, y = 90 + hash(i * 17 + j * 3) * 90, r = 60 + hash(i * 7 + j * 11) * 90;
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, 'rgba(255,255,255,0.55)');
    gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr;
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  }
  AWAN.push(c);
}

function ombakY(x, t, lapis, s) {
  const a = (2 + lapis * 2.6) * (0.5 + s.wind);
  return a * Math.sin(x * (0.006 + lapis * 0.0007) + t * (0.9 + lapis * 0.08) + lapis * 1.7)
    + a * 0.55 * Math.sin(x * (0.0135 - lapis * 0.0004) - t * (1.3 + lapis * 0.05) + lapis)
    + a * 0.25 * Math.sin(x * 0.031 + t * 2.1 + lapis * 2.3);
}

function gambarKapal(g, x, y, s, sudut, malam, alfa, t, warnaLambung) {
  g.save();
  g.globalAlpha = alfa;
  g.translate(x, y);
  g.rotate(sudut);
  g.scale(s, s);
  // bayangan air
  g.fillStyle = 'rgba(0,0,0,0.25)';
  g.beginPath(); g.ellipse(0, 8, 190, 14, 0, 0, Math.PI * 2); g.fill();
  // lambung (perahu motor khas pesisir Aceh, berwarna)
  g.beginPath();
  g.moveTo(-200, -38); g.quadraticCurveTo(-170, 4, -120, 12); g.lineTo(140, 12);
  g.quadraticCurveTo(190, 6, 222, -52); g.lineTo(-200, -38); g.closePath();
  g.fillStyle = warnaLambung || '#1d4f8f'; g.fill();
  g.fillStyle = '#c8262c';
  g.beginPath(); g.moveTo(-196, -36); g.lineTo(218, -48); g.lineTo(212, -40); g.lineTo(-190, -27); g.closePath(); g.fill();
  g.fillStyle = '#f2efe6';
  g.beginPath(); g.moveTo(-190, -27); g.lineTo(212, -40); g.lineTo(206, -33); g.lineTo(-183, -19); g.closePath(); g.fill();
  g.fillStyle = '#2f8a57';
  g.fillRect(-150, -6, 270, 6);
  // rumah kemudi
  g.fillStyle = '#e9e2cf'; g.fillRect(-70, -104, 110, 64);
  g.fillStyle = '#1e7a4f'; g.fillRect(-80, -114, 130, 14);
  g.fillStyle = malam ? 'rgba(255,214,140,0.95)' : 'rgba(40,70,90,0.85)';
  g.fillRect(-56, -92, 24, 22); g.fillRect(-24, -92, 24, 22); g.fillRect(8, -92, 22, 22);
  // tiang & bendera
  g.strokeStyle = '#d8d2c2'; g.lineWidth = 6;
  g.beginPath(); g.moveTo(70, -42); g.lineTo(70, -250); g.stroke();
  g.lineWidth = 2.5; g.strokeStyle = 'rgba(220,214,200,0.8)';
  g.beginPath(); g.moveTo(70, -248); g.lineTo(-190, -40); g.moveTo(70, -248); g.lineTo(215, -52); g.stroke();
  const kib = Math.sin(t * 6) * 6;
  g.fillStyle = '#d7262e';
  g.beginPath(); g.moveTo(72, -250); g.quadraticCurveTo(102, -252 + kib, 128, -246); g.lineTo(128, -232); g.quadraticCurveTo(102, -238 + kib, 72, -236); g.closePath(); g.fill();
  g.fillStyle = '#f5f5f0';
  g.beginPath(); g.moveTo(72, -236); g.quadraticCurveTo(102, -238 + kib, 128, -232); g.lineTo(128, -218); g.quadraticCurveTo(102, -224 + kib, 72, -222); g.closePath(); g.fill();
  if (malam) {
    // lampu tiang
    const gr = g.createRadialGradient(70, -256, 0, 70, -256, 40);
    gr.addColorStop(0, 'rgba(255,240,200,0.95)'); gr.addColorStop(1, 'rgba(255,240,200,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(70, -256, 40, 0, Math.PI * 2); g.fill();
  }
  g.restore();
}

function gambarMercusuar(g, x, y, s, malam, nyala, sudutSorot, sorot) {
  g.save();
  g.translate(x, y);
  g.scale(s, s);
  // tanjung karang
  g.fillStyle = malam ? '#0a141d' : '#24323b';
  g.beginPath(); g.moveTo(-260, 40); g.quadraticCurveTo(-170, -40, -60, -46); g.quadraticCurveTo(40, -52, 90, -20); g.quadraticCurveTo(170, 10, 260, 40); g.closePath(); g.fill();
  // menara (ramping, belang merah-putih)
  const tinggi = 250;
  for (let i = 0; i < 6; i++) {
    const y0 = -46 - (i * tinggi) / 6, y1 = -46 - ((i + 1) * tinggi) / 6;
    const w0 = 34 - i * 3, w1 = 34 - (i + 1) * 3;
    g.fillStyle = i % 2 === 0 ? (malam ? '#b9b3a6' : '#efe9dc') : '#b8282d';
    g.beginPath(); g.moveTo(-w0, y0); g.lineTo(w0, y0); g.lineTo(w1, y1); g.lineTo(-w1, y1); g.closePath(); g.fill();
  }
  const yl = -46 - tinggi;
  g.fillStyle = '#20262c'; g.fillRect(-26, yl - 4, 52, 8);
  g.fillStyle = nyala > 0 ? `rgba(255,236,170,${0.5 + 0.5 * nyala})` : '#3a4148';
  g.fillRect(-16, yl - 38, 32, 34);
  g.fillStyle = '#20262c';
  g.beginPath(); g.moveTo(-22, yl - 38); g.lineTo(0, yl - 64); g.lineTo(22, yl - 38); g.closePath(); g.fill();
  if (nyala > 0) {
    const gr = g.createRadialGradient(0, yl - 22, 0, 0, yl - 22, 120);
    gr.addColorStop(0, `rgba(255,236,170,${0.9 * nyala})`); gr.addColorStop(1, 'rgba(255,236,170,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(0, yl - 22, 120, 0, Math.PI * 2); g.fill();
  }
  g.restore();
  if (sorot > 0) {
    // sorot cahaya berputar — kerucut panjang
    const lx = x, ly = y + (-46 - tinggi - 22) * s;
    const panjang = 2600;
    const lebar = 0.09;
    const arah = Math.cos(sudutSorot); // -1..1 kiri-kanan
    const sudut = Math.PI * (arah > 0 ? 0 : 1) + Math.sin(sudutSorot) * 0.18;
    g.save();
    g.globalCompositeOperation = 'lighter';
    const kuat = sorot * (0.25 + 0.75 * Math.abs(arah));
    const gr = g.createRadialGradient(lx, ly, 0, lx, ly, panjang);
    gr.addColorStop(0, `rgba(255,236,170,${0.55 * kuat})`);
    gr.addColorStop(0.35, `rgba(255,236,170,${0.16 * kuat})`);
    gr.addColorStop(1, 'rgba(255,236,170,0)');
    g.fillStyle = gr;
    g.beginPath(); g.moveTo(lx, ly);
    g.lineTo(lx + Math.cos(sudut - lebar) * panjang, ly + Math.sin(sudut - lebar) * panjang * 0.25);
    g.lineTo(lx + Math.cos(sudut + lebar) * panjang, ly + Math.sin(sudut + lebar) * panjang * 0.25);
    g.closePath(); g.fill();
    g.restore();
  }
}

function gambarPesisir(g, hz, s, camX) {
  // perbukitan & kota pesisir di cakrawala kanan (siluet, termasuk kubah masjid)
  const off = camX * 0.15;
  g.fillStyle = rgb(s.sky2.map((v, i) => lerp(v, s.sea0[i], 0.55)), 0.95 * s.coast);
  g.beginPath();
  g.moveTo(980 + off, hz);
  for (let x = 980; x <= 1960; x += 20) {
    const h = 26 + 40 * Math.sin(x * 0.004) + 22 * Math.sin(x * 0.011 + 1) ;
    g.lineTo(x + off, hz - Math.max(0, h) * E.sine(clamp((x - 980) / 420)));
  }
  g.lineTo(1960 + off, hz); g.closePath(); g.fill();
  // kota: kotak-kotak rendah + kubah
  g.fillStyle = rgb(s.sky2.map((v, i) => lerp(v, s.sea0[i], 0.72)), s.coast);
  const kota = [[1380, 18, 30], [1412, 26, 22], [1436, 14, 34], [1474, 30, 26], [1504, 20, 40], [1548, 24, 28], [1580, 16, 36]];
  for (const [x, h, w] of kota) g.fillRect(x + off, hz - h, w, h);
  // masjid: kubah besar + empat menara kecil (penghormatan pada siluet Meulaboh)
  const mx = 1470 + off;
  g.beginPath(); g.ellipse(mx, hz - 34, 26, 26, 0, Math.PI, 0); g.fill();
  g.fillRect(mx - 30, hz - 34, 60, 34);
  for (const dx of [-46, 46]) { g.beginPath(); g.ellipse(mx + dx, hz - 22, 13, 13, 0, Math.PI, 0); g.fill(); g.fillRect(mx + dx - 14, hz - 22, 28, 22); }
  for (const dx of [-64, 64]) { g.fillRect(mx + dx - 3, hz - 70, 6, 70); g.beginPath(); g.ellipse(mx + dx, hz - 70, 5, 8, 0, Math.PI, 0); g.fill(); }
  // lampu kota pada malam hari
  if (s.stars > 0.3) {
    for (let i = 0; i < 26; i++) {
      const x = 1360 + hash(i) * 260 + off, y = hz - 4 - hash(i + 40) * 22;
      g.fillStyle = `rgba(255,214,150,${0.35 + 0.4 * hash(i + 9) * s.coast})`;
      g.fillRect(x, y, 2.4, 2.4);
    }
  }
}

function renderDunia(t) {
  const s = keadaanDunia(t);
  const g = ctx;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalAlpha = 1;
  g.globalCompositeOperation = 'source-over';
  // kamera: zoom di sekitar titik pusat (960, hz)
  const z = s.camZ;
  g.translate(960 + s.camX * 0, s.hz);
  g.scale(z, z);
  g.translate(-960, -s.hz + s.camY);
  const hz = s.hz;

  // langit
  const gl = g.createLinearGradient(0, -400, 0, hz);
  gl.addColorStop(0, rgb(s.sky0));
  gl.addColorStop(0.55, rgb(s.sky1));
  gl.addColorStop(1, rgb(s.sky2));
  g.fillStyle = gl;
  g.fillRect(-600, -600, LW + 1200, hz + 600);

  // bintang
  if (s.stars > 0.01) {
    for (let i = 0; i < 260; i++) {
      const x = hash(i) * (LW + 400) - 200 - s.camX * 0.05, y = -200 + Math.pow(hash(i + 500), 1.4) * (hz + 150);
      const tw = 0.55 + 0.45 * Math.sin(t * (0.6 + hash(i + 77) * 2.2) + i);
      const r = 0.6 + hash(i + 900) * 1.6;
      g.fillStyle = `rgba(235,240,255,${s.stars * tw * (1 - 0.8 * s.cloud) * (0.35 + 0.65 * hash(i + 3))})`;
      g.fillRect(x, y, r, r);
    }
  }
  // bulan
  if (s.moon > 0.01) {
    const mx = 1430 - s.camX * 0.05, my = 180;
    const gr = g.createRadialGradient(mx, my, 0, mx, my, 260);
    gr.addColorStop(0, `rgba(220,232,255,${0.35 * s.moon})`); gr.addColorStop(1, 'rgba(220,232,255,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(mx, my, 260, 0, Math.PI * 2); g.fill();
    g.fillStyle = `rgba(240,244,255,${0.95 * s.moon})`;
    g.beginPath(); g.arc(mx, my, 46, 0, Math.PI * 2); g.fill();
    g.fillStyle = `rgba(200,210,230,${0.25 * s.moon})`;
    g.beginPath(); g.arc(mx - 12, my - 8, 10, 0, Math.PI * 2); g.arc(mx + 14, my + 12, 7, 0, Math.PI * 2); g.fill();
  }
  // matahari
  if (s.sunA > 0.01) {
    const sx = 960 - s.camX * 0.05, sy = hz + s.sunY;
    const gr = g.createRadialGradient(sx, sy, 0, sx, sy, 700);
    gr.addColorStop(0, rgb(s.glow, 0.75 * s.sunA)); gr.addColorStop(0.25, rgb(s.glow, 0.25 * s.sunA)); gr.addColorStop(1, rgb(s.glow, 0));
    g.fillStyle = gr; g.fillRect(-600, -600, LW + 1200, hz + 600);
    g.fillStyle = `rgba(255,236,200,${0.95 * s.sunA})`;
    g.beginPath(); g.arc(sx, sy, 58, 0, Math.PI * 2); g.fill();
  }
  // awan
  if (s.cloud > 0.01) {
    for (let i = 0; i < 16; i++) {
      const sp = AWAN[i % AWAN.length];
      const lebar = 520 + hash(i + 3) * 700;
      const x = ((hash(i) * (LW + 1400) + t * (6 + hash(i + 8) * 14) * (0.4 + s.wind)) % (LW + 1400)) - 700 - s.camX * 0.08;
      const y = -120 + hash(i + 21) * (hz - 120);
      const a = s.cloud * (0.25 + 0.5 * hash(i + 5));
      g.globalAlpha = a;
      g.filter = 'none';
      g.drawImage(sp, x, y, lebar, lebar * 0.37);
      if (s.cloudDark > 0.01) {
        g.globalCompositeOperation = 'source-atop';
      }
      g.globalCompositeOperation = 'source-over';
    }
    g.globalAlpha = 1;
    if (s.cloudDark > 0.01) {
      // gelapkan langit atas sesuai kepekatan awan badai
      const gd = g.createLinearGradient(0, -400, 0, hz);
      gd.addColorStop(0, `rgba(4,7,10,${0.65 * s.cloudDark * s.cloud})`);
      gd.addColorStop(1, `rgba(4,7,10,${0.15 * s.cloudDark * s.cloud})`);
      g.fillStyle = gd; g.fillRect(-600, -600, LW + 1200, hz + 600);
    }
  }

  // pesisir & mercusuar di cakrawala
  if (s.coast > 0.01) gambarPesisir(g, hz, s, s.camX);
  if (s.lh > 0.01) {
    g.globalAlpha = s.lh;
    gambarMercusuar(g, 210 - s.camX * 0.2, hz + 18, 0.62, s.stars > 0.3 || s.cloud > 0.7, s.beam > 0 ? 1 : 0.6 * (s.stars > 0.3 ? 1 : 0), t * 0.9, s.beam);
    g.globalAlpha = 1;
  }

  // laut
  const gs = g.createLinearGradient(0, hz, 0, LH + 300);
  gs.addColorStop(0, rgb(s.sea1)); gs.addColorStop(1, rgb(s.sea0));
  g.fillStyle = gs; g.fillRect(-600, hz, LW + 1200, LH + 800);
  // pantulan cahaya bulan/matahari
  const terang = Math.max(s.moon * 0.7, s.sunA);
  if (terang > 0.02) {
    const cx = s.sunA > s.moon ? 960 - s.camX * 0.05 : 1430 - s.camX * 0.05;
    for (let i = 0; i < 70; i++) {
      const yy = hz + 4 + Math.pow(i / 70, 1.6) * (LH - hz + 200);
      const w = 30 + (i / 70) * 260 * (0.6 + 0.4 * Math.sin(t * 1.7 + i));
      const x = cx + Math.sin(t * 1.3 + i * 1.7) * (8 + i * 1.6);
      g.fillStyle = rgb(s.sunA > s.moon ? s.glow : [220, 230, 255], terang * 0.35 * (0.4 + 0.6 * Math.abs(Math.sin(t * 2.3 + i * 2.1))));
      g.fillRect(x - w / 2, yy, w, 2 + i / 25);
    }
  }
  // tujuan: lampu pelabuhan di cakrawala
  if (s.harbor > 0.01) {
    const hx = 1700 - s.camX * 0.1, hy = hz - 8;
    const nadi = 0.7 + 0.3 * Math.sin(t * 3);
    const gr = g.createRadialGradient(hx, hy, 0, hx, hy, 90);
    gr.addColorStop(0, `rgba(255,214,138,${0.9 * s.harbor * nadi})`); gr.addColorStop(1, 'rgba(255,214,138,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(hx, hy, 90, 0, Math.PI * 2); g.fill();
    g.fillStyle = `rgba(255,240,210,${s.harbor})`; g.beginPath(); g.arc(hx, hy, 5, 0, Math.PI * 2); g.fill();
  }

  // lapisan ombak (jauh -> dekat)
  const N = 8;
  for (let i = 0; i < N; i++) {
    const f = i / (N - 1);
    const y0 = hz + 6 + Math.pow(f, 1.7) * (LH - hz + 120);
    const warna = s.sea1.map((v, j) => lerp(v, s.sea0[j], f * 0.85));
    g.fillStyle = rgb(warna.map((v) => v * (1.06 - 0.06 * f)));
    g.beginPath();
    g.moveTo(-600, LH + 600);
    for (let x = -600; x <= LW + 600; x += 14) g.lineTo(x, y0 + ombakY(x + s.camX * (0.2 + f), t, i, s));
    g.lineTo(LW + 600, LH + 600); g.closePath(); g.fill();
    // buih/sorot pada puncak ombak
    g.strokeStyle = rgb(s.glow, (0.06 + 0.12 * f) * (0.4 + s.wind));
    g.lineWidth = 1 + f * 2;
    g.beginPath();
    for (let x = -600; x <= LW + 600; x += 14) {
      const y = y0 + ombakY(x + s.camX * (0.2 + f), t, i, s);
      x === -600 ? g.moveTo(x, y) : g.lineTo(x, y);
    }
    g.stroke();
    // kapal kedua (lini 2) pada lapisan 3
    if (i === 3 && s.ship2A > 0.01) {
      const x = s.ship2X, y = y0 + ombakY(x + s.camX * (0.2 + f), t, i, s);
      const sl = (ombakY(x + 10 + s.camX * (0.2 + f), t, i, s) - ombakY(x - 10 + s.camX * (0.2 + f), t, i, s)) / 20;
      gambarKapal(g, x, y + 4, 0.32, Math.atan(sl) * 0.8, s.stars > 0.3, s.ship2A, t, '#7a3b8f');
    }
    // pelampung pada lapisan 4
    if (i === 4 && s.buoys > 0.01) {
      for (let b = 0; b < 5; b++) {
        const x = 220 + b * 330, y = y0 + ombakY(x + s.camX * (0.2 + f), t, i, s) - 6;
        g.globalAlpha = s.buoys;
        g.fillStyle = b % 2 ? '#2f9a5a' : '#c8262c';
        g.beginPath(); g.moveTo(x - 16, y); g.lineTo(x + 16, y); g.lineTo(x + 8, y - 44); g.lineTo(x - 8, y - 44); g.closePath(); g.fill();
        g.fillStyle = '#e8e2d4'; g.fillRect(x - 11, y - 26, 22, 7);
        const kedip = 0.5 + 0.5 * Math.sin(t * 4 + b);
        const gr = g.createRadialGradient(x, y - 52, 0, x, y - 52, 30);
        gr.addColorStop(0, `rgba(255,236,170,${0.95 * kedip})`); gr.addColorStop(1, 'rgba(255,236,170,0)');
        g.fillStyle = gr; g.beginPath(); g.arc(x, y - 52, 30, 0, Math.PI * 2); g.fill();
        g.globalAlpha = 1;
      }
    }
    // kapal utama pada lapisan 5
    if (i === 5 && s.shipA > 0.01) {
      const x = s.shipX, xx = x + s.camX * (0.2 + f);
      const y = y0 + ombakY(xx, t, i, s) + s.shipY;
      const sl = (ombakY(xx + 14, t, i, s) - ombakY(xx - 14, t, i, s)) / 28;
      gambarKapal(g, x, y + 6, s.shipS, Math.atan(sl) * 0.85 + s.tilt, s.stars > 0.3 || s.cloud > 0.7, s.shipA, t);
      if (s.leak > 0.01) {
        // air menyembur dari lambung yang bocor
        for (let k = 0; k < 40; k++) {
          const u = ((t * 1.6 + hash(k) ) % 1);
          const px = x - 60 * s.shipS + u * 90 * s.shipS * (hash(k + 3) - 0.3);
          const py = y - 10 * s.shipS - Math.sin(u * Math.PI) * 120 * s.shipS;
          g.fillStyle = `rgba(190,225,245,${s.leak * (1 - u) * 0.9})`;
          g.beginPath(); g.arc(px, py, 3 + 4 * hash(k + 9), 0, Math.PI * 2); g.fill();
        }
      }
    }
  }

  // kabut tipis di cakrawala
  const kab = 0.18 + s.fog * 0.6;
  const gk = g.createLinearGradient(0, hz - 140, 0, hz + 160);
  gk.addColorStop(0, rgb(s.sky2, 0)); gk.addColorStop(0.5, rgb(s.sky2, kab * 0.55)); gk.addColorStop(1, rgb(s.sky2, 0));
  g.fillStyle = gk; g.fillRect(-600, hz - 140, LW + 1200, 300);

  g.setTransform(1, 0, 0, 1, 0, 0);
  // hujan (ruang layar)
  if (s.rain > 0.01) {
    g.strokeStyle = `rgba(200,215,230,${0.35 * s.rain})`;
    g.lineWidth = 1.4;
    g.beginPath();
    const n = Math.floor(520 * s.rain);
    for (let i = 0; i < n; i++) {
      const sp = 1400 + hash(i + 7) * 900;
      const x = (hash(i) * (LW + 400) + t * 260) % (LW + 400) - 200;
      const y = (hash(i + 99) * (LH + 200) + t * sp) % (LH + 200) - 100;
      g.moveTo(x, y); g.lineTo(x - 10, y + 34);
    }
    g.stroke();
  }
  // petir
  for (const tk of PETIR) {
    const u = t - tk;
    if (u < 0 || u > 0.9) continue;
    const kuat = u < 0.08 ? u / 0.08 : Math.max(0, 1 - (u - 0.08) / 0.8) * (0.6 + 0.4 * Math.sin(u * 60));
    g.fillStyle = `rgba(210,225,255,${0.38 * kuat})`;
    g.fillRect(0, 0, LW, LH);
    g.strokeStyle = `rgba(240,246,255,${0.95 * kuat})`;
    g.lineWidth = 3;
    g.beginPath();
    let x = 520 + hash(tk) * 900, y = 0;
    g.moveTo(x, y);
    while (y < s.hz - 40) { x += (hash(x + y + tk) - 0.5) * 70; y += 30 + hash(y + tk) * 50; g.lineTo(x, y); }
    g.stroke();
  }
  // peredupan menyeluruh (untuk menonjolkan tipografi)
  if (s.dim > 0.01) { g.fillStyle = `rgba(3,9,16,${s.dim})`; g.fillRect(0, 0, LW, LH); }
}

// ═══════════════════════════════════════════════════════════════════════════
// KOMPONEN DOM
// ═══════════════════════════════════════════════════════════════════════════
const UI = document.getElementById('ui');
const FOTO = document.getElementById('foto');
const ITEMS = [];

function buat(tag, cls, induk, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html !== undefined) e.innerHTML = html;
  (induk || UI).appendChild(e);
  return e;
}
function daftar(it) {
  it.fin = it.fin ?? 0.7;
  it.fout = it.fout ?? 0.5;
  ITEMS.push(it);
  return it;
}
function posisi(el, o) {
  el.style.left = (o.x ?? 0) + 'px';
  el.style.top = (o.y ?? 0) + 'px';
  if (o.w) el.style.width = o.w + 'px';
  if (o.h) el.style.height = o.h + 'px';
  if (o.z) el.style.zIndex = o.z;
}

/**
 * Teks. anim: fade | naik | huruf | topeng | stempel | zoom | kiri | kanan | ketik | jatuh
 * keluar: fade (bawaan) | naik | geser
 */
function teks(o) {
  const el = buat('div', 'it ' + (o.cls || 'body') + (o.align === 'center' ? ' ctr' : o.align === 'right' ? ' kanan' : ''), o.induk, '');
  posisi(el, o);
  const anim = o.anim || 'naik';
  let huruf = [];
  if (anim === 'huruf' || anim === 'ketik') {
    const isi = o.html;
    // pecah per huruf, pertahankan tag <em>/<br>
    const tmp = document.createElement('div'); tmp.innerHTML = isi;
    const jalan = (node, induk) => {
      for (const n of [...node.childNodes]) {
        if (n.nodeType === 3) {
          // per kata (nowrap) supaya pindah baris tidak memotong kata
          const bagian = n.textContent.split(/(\s+)/);
          for (const kata of bagian) {
            if (!kata) continue;
            if (/^\s+$/.test(kata)) { induk.appendChild(document.createTextNode(' ')); continue; }
            const w = document.createElement('span');
            w.style.display = 'inline-block';
            w.style.whiteSpace = 'nowrap';
            for (const ch of kata) {
              const sp = document.createElement('span');
              sp.textContent = ch;
              sp.style.display = 'inline-block';
              w.appendChild(sp); huruf.push(sp);
            }
            induk.appendChild(w);
          }
        } else if (n.nodeName === 'BR') induk.appendChild(document.createElement('br'));
        else { const c = n.cloneNode(false); induk.appendChild(c); jalan(n, c); }
      }
    };
    jalan(tmp, el);
  } else el.innerHTML = o.html;
  const it = daftar({ ...o, el, fin: o.fin ?? (anim === 'huruf' ? 1.1 : anim === 'ketik' ? Math.max(0.6, o.html.length * 0.035) : anim === 'stempel' ? 0.35 : 0.75) });
  if (anim === 'stempel') {
    bunyi(o.t0 + 0.2, 'stempel', 0.9);
    // elemen lebar rata kiri: membesar dari sisi kiri, bukan dari tengah
    if (o.w && !(o.cls || '').includes('ctr') && o.align !== 'center') el.style.transformOrigin = '12% 50%';
  }
  if (o.bunyi) bunyi(o.t0, o.bunyi, o.g ?? 0.6);
  it.render = (t, pin, pout) => {
    const a = 1 - E.out(pout);
    let tr = '', op = 1, flt = '';
    if (anim === 'fade') op = E.out(pin);
    else if (anim === 'naik') { const p = E.out5(pin); op = p; tr = `translateY(${(1 - p) * 46}px)`; flt = p < 1 ? `blur(${(1 - p) * 8}px)` : ''; }
    else if (anim === 'zoom') { const p = E.out5(pin); op = p; tr = `scale(${0.86 + 0.14 * p})`; }
    else if (anim === 'kiri') { const p = E.out5(pin); op = p; tr = `translateX(${(1 - p) * -120}px)`; }
    else if (anim === 'kanan') { const p = E.out5(pin); op = p; tr = `translateX(${(1 - p) * 120}px)`; }
    else if (anim === 'jatuh') { const p = E.back(pin); op = clamp(pin * 3); tr = `translateY(${(1 - p) * -160}px)`; }
    else if (anim === 'stempel') { const p = E.back(pin); op = clamp(pin * 2.5); tr = `scale(${1.9 - 0.9 * p}) rotate(${o.rot ?? -6}deg)`; }
    else if (anim === 'topeng') { const p = E.inout(pin); el.style.clipPath = `inset(-20% ${(1 - p) * 100}% -20% 0)`; }
    else if (anim === 'huruf') {
      const n = huruf.length;
      huruf.forEach((h, i) => {
        const p = E.out5(P(pin, (i / Math.max(n, 1)) * 0.6, 0.4));
        h.style.opacity = p;
        h.style.transform = `translateY(${(1 - p) * 60}px)`;
      });
    } else if (anim === 'ketik') {
      const n = Math.floor(pin * huruf.length + 0.0001);
      huruf.forEach((h, i) => (h.style.opacity = i < n ? 1 : 0));
    }
    if (o.gerak) tr += ` translate(${(t - o.t0) * (o.gerak[0] || 0)}px, ${(t - o.t0) * (o.gerak[1] || 0)}px)`;
    if (o.keluar === 'naik' && pout > 0) tr += ` translateY(${-40 * E.out(pout)}px)`;
    el.style.opacity = op * a;
    el.style.transform = tr;
    el.style.filter = flt;
  };
  return it;
}

/** Garis/blok dekoratif (garis merah di bawah judul, pemisah). */
function garis(o) {
  const el = buat('div', 'it ' + (o.cls || 'garisbawah'), o.induk);
  posisi(el, o);
  if (o.warna) el.style.background = o.warna;
  if (o.tebal) el.style.height = o.tebal + 'px';
  const it = daftar({ ...o, el, fin: o.fin ?? 0.6 });
  it.render = (t, pin, pout) => {
    el.style.opacity = 1 - E.out(pout);
    el.style.transform = o.tegak ? `scaleY(${E.inout(pin)})` : `scaleX(${E.inout(pin)})`;
    if (o.tegak) el.style.transformOrigin = '50% 0';
  };
  return it;
}

/** Latar gelap bergradasi agar teks terbaca di atas foto/dunia. */
function tirai(o) {
  const el = buat('div', 'it', o.induk || UI);
  posisi(el, { x: 0, y: 0, w: LW, h: LH, ...o });
  el.style.background = o.bg || 'linear-gradient(90deg, rgba(3,9,16,.85) 0%, rgba(3,9,16,.55) 45%, rgba(3,9,16,0) 75%)';
  const it = daftar({ ...o, el, fin: o.fin ?? 0.8, fout: o.fout ?? 0.8 });
  it.render = (t, pin, pout) => { el.style.opacity = E.inout(pin) * (1 - E.inout(pout)) * (o.kuat ?? 1); };
  return it;
}

/**
 * Foto penuh layar/sebagian dengan Ken Burns.
 * kb: [x0, y0, s0, x1, y1, s1] — geser (px) & skala, dari t0 sampai t1+fout.
 * mode: penuh | kiri | kanan | cetak (bingkai kertas)
 */
function foto(o) {
  const mode = o.mode || 'penuh';
  const induk = mode === 'cetak' ? UI : FOTO;
  const el = buat('div', 'it foto' + (mode === 'cetak' ? ' print' : ''), induk);
  let ruang = el;
  if (mode === 'cetak') {
    ruang = buat('div', 'ruang', el);
    if (o.ket) buat('div', 'ket', el, o.ket);
  }
  const img = buat('img', '', ruang);
  img.src = 'foto/g_' + o.src + '.jpg';
  const geom = mode === 'penuh' ? { x: 0, y: 0, w: LW, h: LH }
    : mode === 'kiri' ? { x: 0, y: 0, w: o.w || 1060, h: LH }
    : mode === 'kanan' ? { x: LW - (o.w || 1060), y: 0, w: o.w || 1060, h: LH }
    : { x: o.x, y: o.y, w: o.w, h: o.h };
  posisi(el, geom);
  if (mode === 'kiri') el.style.webkitMaskImage = el.style.maskImage = 'linear-gradient(90deg, #000 70%, transparent 100%)';
  if (mode === 'kanan') el.style.webkitMaskImage = el.style.maskImage = 'linear-gradient(270deg, #000 70%, transparent 100%)';
  const gelap = buat('div', 'gelap', ruang);
  gelap.style.background = o.gelap === undefined ? 'transparent' : typeof o.gelap === 'string' ? o.gelap : `rgba(3,9,16,${o.gelap})`;
  const kb = o.kb || [0, 0, 1.08, 0, 0, 1.0];
  const it = daftar({ ...o, el, fin: o.fin ?? 1.1, fout: o.fout ?? 1.0 });
  let siap = false;
  it.render = (t, pin, pout) => {
    if (!siap && img.naturalWidth) {
      // isi bidang (cover)
      const bw = mode === 'cetak' ? o.w - 44 : geom.w, bh = mode === 'cetak' ? o.h - 92 : geom.h;
      const sk = Math.max(bw / img.naturalWidth, bh / img.naturalHeight);
      img.style.width = img.naturalWidth * sk + 'px';
      img.style.height = img.naturalHeight * sk + 'px';
      siap = true;
    }
    const u = E.sine(P(t, o.t0, o.t1 + it.fout - o.t0));
    const x = lerp(kb[0], kb[3], u), y = lerp(kb[1], kb[4], u), sk = lerp(kb[2], kb[5], u);
    img.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${sk})`;
    const op = E.inout(pin) * (1 - E.inout(pout));
    el.style.opacity = op;
    if (mode === 'cetak') {
      const p = E.out5(pin);
      el.style.transform = `translateY(${(1 - p) * 80}px) rotate(${(o.rot ?? -3) * (0.6 + 0.4 * p)}deg)`;
    }
  };
  return it;
}

/** Cap pojok kanan atas (rujukan/bagian), seperti cap tahun di film dokumenter. */
function cap(o) {
  return teks({ x: o.x ?? (LW - 80), y: o.y ?? 56, cls: 'cap', html: o.html, anim: 'kanan', ...o, w: undefined, align: 'right', geserKanan: true });
}

/** Tangkapan layar aplikasi di dalam bingkai laptop dengan gerak kamera. */
function laptop(o) {
  bunyi(o.t0, 'desir', 0.45);
  if (o.kursor) bunyi(o.kursor[o.kursor.length - 1][0] - 0.55, 'klik', 0.8);
  const w = o.w || 1180, h = Math.round(w * 9 / 16) + 36;
  const el = buat('div', 'it laptop', UI);
  posisi(el, { x: o.x ?? (LW - w) / 2, y: o.y ?? 150, w, h });
  const badan = buat('div', 'badan', el);
  const layar = buat('div', 'layar', badan);
  const kaca = buat('div', 'kaca', layar);
  const img = buat('img', '', kaca);
  img.src = 'shots/' + o.src + '.png';
  buat('div', 'alas', badan);
  const fokus = (o.fokus || []).map((f) => ({ ...f, el: buat('div', 'fokus', kaca) }));
  const kursor = o.kursor ? buat('div', 'kursor', kaca, '<svg viewBox="0 0 24 24" width="34" height="34"><path d="M3 2l7 19 2.8-8.2L21 10z" fill="#fff" stroke="#111" stroke-width="1.6"/></svg>') : null;
  const it = daftar({ ...o, el, fin: o.fin ?? 1.0, fout: o.fout ?? 0.7 });
  const lebarKaca = w - 36;
  it.render = (t, pin, pout) => {
    const p = E.out5(pin), q = E.inout(pout);
    const u = E.sine(P(t, o.t0, o.t1 - o.t0));
    const tilt = o.tilt || [14, -18, 4, -6];
    const rx = lerp(tilt[0], tilt[2], u), ry = lerp(tilt[1], tilt[3], u);
    const s = lerp((o.push || [0.96, 1.04])[0], (o.push || [0.96, 1.04])[1], u);
    badan.style.transform = `translateY(${(1 - p) * 140}px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${s})`;
    el.style.opacity = clamp(pin * 1.6) * (1 - q);
    // gulir isi tangkapan layar
    const sk = lebarKaca / 1920;
    const gul = o.gulir ? lerp(o.gulir[0], o.gulir[1], E.inout(P(t, o.gulir[2] ?? o.t0, o.gulir[3] ?? (o.t1 - o.t0)))) : 0;
    img.style.transform = `translateY(${-gul * sk}px)`;
    for (const f of fokus) {
      const a = E.out(P(t, f.t, 0.5)) * (1 - E.out(P(t, f.t + (f.d || 3), 0.5)));
      f.el.style.display = a > 0.001 ? 'block' : 'none';
      f.el.style.opacity = a;
      f.el.style.left = f.x * sk + 'px';
      f.el.style.top = (f.y - gul) * sk + 'px';
      f.el.style.width = f.w * sk + 'px';
      f.el.style.height = f.h * sk + 'px';
    }
    if (kursor) {
      // kursor bergerak di antara titik-titik [t, x, y]
      const tt = o.kursor;
      let x = tt[0][1], y = tt[0][2];
      for (let i = 1; i < tt.length; i++) {
        if (t >= tt[i - 1][0]) {
          const f = E.inout(P(t, tt[i - 1][0], tt[i][0] - tt[i - 1][0]));
          x = lerp(tt[i - 1][1], tt[i][1], f); y = lerp(tt[i - 1][2], tt[i][2], f);
        }
      }
      kursor.style.left = x * sk + 'px';
      kursor.style.top = (y - gul) * sk + 'px';
      kursor.style.opacity = t > tt[0][0] - 0.3 ? 1 : 0;
    }
  };
  return it;
}

// Matriks Analisis Risiko — persis risk_matrix_cells (dampak d, kemungkinan k).
const MATRIKS = { 1: [1, 2, 4, 6, 9], 2: [3, 7, 10, 12, 15], 3: [5, 11, 14, 16, 18], 4: [8, 13, 17, 19, 23], 5: [20, 21, 22, 24, 25] };
const LEVEL = (v) => (v >= 20 ? ['Sangat Tinggi', 'var(--st)'] : v >= 16 ? ['Tinggi', 'var(--t)'] : v >= 11 ? ['Sedang', 'var(--s)'] : v >= 6 ? ['Rendah', 'var(--r)'] : ['Sangat Rendah', 'var(--sr)']);

/**
 * Matriks 5x5: kolom = dampak 1..5 (kiri->kanan), baris = kemungkinan 5..1
 * (atas->bawah) — sama dengan tampilan di Keterangan Pendukung.
 * sorot: [{t, d, k, dur}], selera: waktu garis selera digambar,
 * penanda: [{t, d, k}] posisi bulatan penanda risiko.
 */
function matriks(o) {
  for (let i = 0; i < 9; i++) bunyi(o.t0 + i * 0.12, 'tik', 0.35);
  if (o.selera !== undefined) bunyi(o.selera, 'garis', 0.5);
  (o.penanda || []).forEach((p, i) => bunyi(p.t + (i ? 0.2 : 0), 'ping', 0.5));
  const ukuran = o.ukuran || 112, jarak = 10;
  const el = buat('div', 'it mtx', UI);
  posisi(el, { x: o.x, y: o.y, w: 5 * (ukuran + jarak) + 120, h: 5 * (ukuran + jarak) + 110 });
  const sel = {};
  for (let d = 1; d <= 5; d++) for (let k = 1; k <= 5; k++) {
    const v = MATRIKS[d][k - 1];
    const c = buat('div', 'sel', el, String(v));
    c.style.left = 90 + (d - 1) * (ukuran + jarak) + 'px';
    c.style.top = (5 - k) * (ukuran + jarak) + 'px';
    c.style.width = c.style.height = ukuran + 'px';
    c.style.background = LEVEL(v)[1];
    c.style.fontSize = Math.round(ukuran * 0.46) + 'px';
    sel[`${d}-${k}`] = c;
  }
  for (let i = 1; i <= 5; i++) {
    const a = buat('div', 'angka', el, String(i));
    a.style.left = 90 + (i - 1) * (ukuran + jarak) + ukuran / 2 - 20 + 'px';
    a.style.top = 5 * (ukuran + jarak) + 6 + 'px';
    const b = buat('div', 'angka', el, String(i));
    b.style.left = '34px';
    b.style.top = (5 - i) * (ukuran + jarak) + ukuran / 2 - 22 + 'px';
  }
  const sx = buat('div', 'sumbu', el, 'Dampak →');
  sx.style.left = 90 + 'px'; sx.style.top = 5 * (ukuran + jarak) + 50 + 'px';
  const sy = buat('div', 'sumbu', el, 'Kemungkinan →');
  sy.style.left = '-128px'; sy.style.top = 2.5 * (ukuran + jarak) - 14 + 'px'; sy.style.transform = 'rotate(-90deg)';
  // garis selera: SVG mengikuti batas antara Sedang dan Tinggi
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('width', 5 * (ukuran + jarak) + 120); svg.setAttribute('height', 5 * (ukuran + jarak) + 20);
  svg.style.position = 'absolute'; svg.style.left = '0'; svg.style.top = '0'; svg.style.overflow = 'visible';
  el.appendChild(svg);
  const path = document.createElementNS(svgNS, 'path');
  // tepi atas/kiri sel yang melampaui selera (>= 16)
  const X = (d) => 90 + (d - 1) * (ukuran + jarak) - jarak / 2, Y = (k) => (5 - k) * (ukuran + jarak) - jarak / 2;
  let dpath = '';
  // telusuri: untuk tiap kolom d, kemungkinan minimum yang >=16
  const minK = {};
  for (let d = 1; d <= 5; d++) { minK[d] = 6; for (let k = 1; k <= 5; k++) if (MATRIKS[d][k - 1] >= 16) { minK[d] = k; break; } }
  let mulai = false;
  for (let d = 1; d <= 5; d++) {
    const k = minK[d];
    if (k > 5) continue;
    const yb = Y(k - 1) ; // garis di bawah sel k (= atas sel k-1)
    if (!mulai) { dpath += `M ${X(d)} ${Y(5)} L ${X(d)} ${yb}`; mulai = true; }
    else dpath += ` L ${X(d)} ${yb}`;
    dpath += ` L ${X(d + 1)} ${yb}`;
    const kNext = d < 5 ? minK[d + 1] : k;
    if (d < 5 && kNext !== k) dpath += ` L ${X(d + 1)} ${Y(kNext - 1)}`;
  }
  path.setAttribute('d', dpath);
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', '#ffffff');
  path.setAttribute('stroke-width', '7');
  path.setAttribute('stroke-dasharray', '22 14');
  path.style.filter = 'drop-shadow(0 0 10px rgba(0,0,0,.8))';
  svg.appendChild(path);
  const panjang = 3000;
  const penanda = buat('div', '', el);
  penanda.style.cssText = `position:absolute;width:${ukuran * 0.62}px;height:${ukuran * 0.62}px;border-radius:50%;border:6px solid #fff;box-shadow:0 0 0 6px rgba(0,0,0,.35),0 0 30px rgba(255,255,255,.7);display:none`;
  const it = daftar({ ...o, el, fin: o.fin ?? 1.6, fout: o.fout ?? 0.6 });
  it.render = (t, pin, pout) => {
    el.style.opacity = 1 - E.out(pout);
    for (let d = 1; d <= 5; d++) for (let k = 1; k <= 5; k++) {
      const c = sel[`${d}-${k}`];
      const urut = ((d - 1) + (5 - k)) / 8;
      const p = E.back(P(pin, urut * 0.55, 0.45));
      c.style.opacity = clamp(P(pin, urut * 0.55, 0.2));
      let s = 0.4 + 0.6 * p, glow = '', redup = 0;
      for (const so of o.sorot || []) {
        const aktif = so.sel ? so.sel.some(([a, b]) => a === d && b === k) : so.lvl ? so.lvl(MATRIKS[d][k - 1]) : so.d === d && so.k === k;
        const a = E.out(P(t, so.t, 0.4)) * (1 - E.out(P(t, so.t + (so.dur || 3), 0.5)));
        if (aktif) { s += 0.12 * a; glow = a > 0.02 ? `0 0 0 ${6 * a}px #fff, 0 0 ${50 * a}px rgba(255,255,255,.8)` : glow; }
        else if (so.redup !== false) redup = Math.max(redup, a * 0.65);
      }
      c.style.transform = `scale(${s})`;
      c.style.boxShadow = glow || 'inset 0 -6px 0 rgba(0,0,0,.12)';
      c.style.filter = redup > 0.01 ? `brightness(${1 - redup * 0.7}) saturate(${1 - redup * 0.6})` : '';
      c.style.zIndex = glow ? 2 : 1;
    }
    if (o.selera !== undefined) {
      const p = E.inout(P(t, o.selera, 1.6));
      path.style.strokeDasharray = `22 14`;
      path.style.opacity = p > 0 ? 1 : 0;
      path.setAttribute('stroke-dashoffset', `${-t * 30}`);
      svg.style.clipPath = `inset(0 ${(1 - p) * 100}% 0 0)`;
    } else path.style.opacity = 0;
    const pd = o.penanda || [];
    if (pd.length && t >= pd[0].t) {
      penanda.style.display = 'block';
      let pos = pd[0];
      let d = pos.d, k = pos.k;
      for (let i = 1; i < pd.length; i++) if (t >= pd[i].t) {
        const f = E.inout(P(t, pd[i].t, 0.9));
        d = lerp(pd[i - 1].d, pd[i].d, f); k = lerp(pd[i - 1].k, pd[i].k, f);
      }
      penanda.style.left = 90 + (d - 1) * (ukuran + jarak) + ukuran * 0.19 + 'px';
      penanda.style.top = (5 - k) * (ukuran + jarak) + ukuran * 0.19 + 'px';
      penanda.style.opacity = E.out(P(t, pd[0].t, 0.4));
      penanda.style.zIndex = 5;
    } else penanda.style.display = 'none';
  };
  return it;
}

/** Elemen SVG bebas (rute, cincin, rasi bintang, kemudi, ikon) dengan fungsi render sendiri. */
function svgItem(o) {
  const svgNS = 'http://www.w3.org/2000/svg';
  const el = document.createElementNS(svgNS, 'svg');
  el.setAttribute('class', 'it');
  el.setAttribute('width', o.w || LW); el.setAttribute('height', o.h || LH);
  el.setAttribute('viewBox', `0 0 ${o.w || LW} ${o.h || LH}`);
  el.style.left = (o.x || 0) + 'px'; el.style.top = (o.y || 0) + 'px';
  el.style.overflow = 'visible';
  el.innerHTML = o.isi || '';
  (o.induk || UI).appendChild(el);
  const it = daftar({ ...o, el });
  it.render = (t, pin, pout, lok) => {
    el.style.opacity = (o.fadeMasuk === false ? 1 : E.out(pin)) * (1 - E.out(pout));
    o.gambar && o.gambar(el, t, pin, pout, lok);
  };
  return it;
}

/** Kartu judul babak — otomatis dari timeline.cards. */
const JUDUL_BABAK = {};
function kartuBab(scene, no, judul, sub, fotoSrc, kb) {
  const c = CD[scene];
  bunyi(c.start - 0.35, 'whoosh', 0.8);
  const t0 = c.start, t1 = c.end - 0.2;
  if (fotoSrc) foto({ src: fotoSrc, t0, t1: t1 + 0.4, fin: 0.7, fout: 1.0, gelap: 0.62, kb: kb || [40, 0, 1.12, -40, 0, 1.04] });
  tirai({ t0, t1: t1 + 0.4, fin: 0.5, fout: 0.9, bg: 'linear-gradient(90deg, rgba(3,9,16,.92) 0%, rgba(3,9,16,.6) 60%, rgba(3,9,16,.3) 100%)' });
  teks({ t0: t0 + 0.1, t1, x: 150, y: 210, w: 900, cls: 'kicker', html: no === 'Penutup' ? 'Penutup' : `Babak ${no}`, anim: 'kiri', fout: 0.5 });
  teks({ t0: t0 + 0.15, t1, x: 1180, y: 160, w: 650, cls: 'h1 kanan', html: no === 'Penutup' ? '' : `<span style="color:transparent;-webkit-text-stroke:3px rgba(242,180,90,.75);font-size:360px">${no}</span>`, anim: 'zoom', fout: 0.5 });
  teks({ t0: t0 + 0.3, t1, x: 146, y: 560, w: 1500, cls: 'h1', html: judul, anim: 'huruf', fout: 0.5 });
  garis({ t0: t0 + 0.7, t1, x: 152, y: 730, w: 420, tebal: 6, fout: 0.5 });
  teks({ t0: t0 + 0.9, t1, x: 152, y: 760, w: 1300, cls: 'serif-s redup', html: sub, anim: 'naik', fout: 0.5 });
  JUDUL_BABAK[scene] = judul;
}

// ── butir penuh layar: kertas beterbangan ──────────────────────────────────
function kertasTerbang(o) {
  bunyi(o.t0 + 0.2, 'kertas', 0.8);
  if (o.kumpul !== undefined) bunyi(o.kumpul + 0.6, 'hisap', 0.6);
  const wadah = buat('div', 'it', UI);
  posisi(wadah, { x: 0, y: 0, w: LW, h: LH });
  wadah.style.zIndex = 1;
  const lembar = [];
  for (let i = 0; i < (o.n || 22); i++) {
    const e = buat('div', 'lembar' + (i % 4 === 3 ? ' word' : ''), wadah);
    lembar.push({ e, i });
  }
  const it = daftar({ ...o, el: wadah, fin: 0.6, fout: 0.6 });
  it.render = (t, pin, pout) => {
    for (const { e, i } of lembar) {
      const u = t - o.t0;
      // tersebar ditiup angin
      const bx = hash(i) * (LW + 300) - 150, by = hash(i + 50) * (LH - 200) - 60;
      let x = bx + Math.sin(u * (0.5 + hash(i + 3)) + i) * 90 + u * (30 + hash(i + 8) * 50);
      let y = by + Math.cos(u * (0.7 + hash(i + 5)) + i) * 60;
      let r = Math.sin(u * (0.8 + hash(i + 11)) + i) * 40 + hash(i + 13) * 60 - 30;
      let s = 0.55 + hash(i + 17) * 0.5;
      if (o.kumpul !== undefined && t > o.kumpul) {
        // berkumpul ke satu titik (aplikasi)
        const f = E.inout(P(t, o.kumpul + hash(i + 21) * 0.5, 1.2));
        x = lerp(x, o.tx ?? 840, f); y = lerp(y, o.ty ?? 380, f); r = lerp(r, 0, f); s = lerp(s, 0.15, f);
        e.style.opacity = (1 - f) * E.out(pin);
      } else e.style.opacity = E.out(pin) * (1 - E.out(pout));
      e.style.left = x + 'px'; e.style.top = y + 'px';
      e.style.transform = `rotate(${r}deg) scale(${s})`;
    }
  };
  return it;
}

// ── kredit bergulir ─────────────────────────────────────────────────────
function kreditGulir(o) {
  const el = buat('div', 'it kredit', UI, o.html);
  el.style.top = '0px';
  const it = daftar({ ...o, el, fin: 0.8, fout: 0.8 });
  it.render = (t, pin, pout) => {
    const tinggi = el.offsetHeight || 2400;
    const u = P(t, o.t0, o.t1 - o.t0);
    el.style.transform = `translateY(${lerp(LH + 20, -tinggi + 260, u)}px)`;
    el.style.opacity = E.out(pin) * (1 - E.out(pout));
  };
  return it;
}

// ── butiran film ─────────────────────────────────────────────────────────
const GR = document.getElementById('grain');
const grx = GR.getContext('2d');
const POLA = [];
for (let n = 0; n < 6; n++) {
  const d = grx.createImageData(960, 540);
  for (let i = 0; i < d.data.length; i += 4) { const v = hash(i * 0.37 + n * 911) * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
  POLA.push(d);
}

// ═══════════════════════════════════════════════════════════════════════════
window.setVideoTime = function (t) {
  renderDunia(t);
  for (const it of ITEMS) {
    const tampak = t >= it.t0 - 1e-4 && t <= it.t1 + it.fout;
    if (!tampak) { if (it.tampil) { it.el.style.display = 'none'; it.tampil = false; } continue; }
    if (!it.tampil) { it.el.style.display = 'block'; it.tampil = true; }
    it.render(t, P(t, it.t0, it.fin), P(t, it.t1, it.fout), t - it.t0);
  }
  grx.putImageData(POLA[Math.floor(t * 24) % POLA.length], 0, 0);
};
window.siapDunia = () => { siapkanDunia(); };
