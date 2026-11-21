// ═══════════════════════════════════════════════════════════════════════════
// TOKOH: boneka kertas berengsel (kepala, dua lengan, badan) + Si Badai.
// Ardi, Gadis, Pak Syahbandar = rancangan contoh 5 detik yang sudah dilihat
// pemilik. Penjaga Mercusuar, Petugas Patroli, Pak Udin = gaya yang sama.
// Titik asal boneka: tengah telapak kaki. Tinggi ±350 pada skala 1.
// ═══════════════════════════════════════════════════════════════════════════
const GELAP = '#2a1d17';
const GAYA = {
  ardi:       { kulit: '#d39a6a', baju: 'url(#batikBiru)', lengan: 'url(#batikBiru)', celana: '#e8dcc2', sepatu: '#1b1b1b', hidung: '#b97a50', bibir: '#7a3a2a' },
  gadis:      { kulit: '#e5ae82', baju: 'url(#batikUngu)', lengan: 'url(#batikUngu)', rok: '#2b2d42', sepatu: '#1b1b1b', hidung: '#b97a50', bibir: '#b8434e' },
  syahbandar: { kulit: '#bf8458', baju: '#f5f3ee', lengan: '#f5f3ee', celana: '#1d3557', sepatu: '#1b1b1b', hidung: '#9e6a45', bibir: '#7a3a2a', alis: '#e4dfd6' },
  mercusuar:  { kulit: '#c98a5e', baju: '#f2c230', lengan: '#f2c230', celana: '#2b3a55', sepatu: '#24443a', hidung: '#a8714a', bibir: '#a8434a', alis: '#5a5a62' },
  patroli:    { kulit: '#b5794c', baju: '#23395d', lengan: '#23395d', celana: '#1d2b44', sepatu: '#1b1b1b', hidung: '#97613a', bibir: '#7a3a2a' },
  udin:       { kulit: '#c48a5c', baju: '#8d99a6', lengan: '#8d99a6', celana: '#6b4f3a', sepatu: '#3a2a1e', hidung: '#a26c45', bibir: '#7a3a2a' },
};

function mulutBentuk(v, gm) {
  // v: {buka, lebar, bulat}; gm: senyum (+) / cemberut (-) saat mulut tertutup
  const W = 11 * v.lebar, H = 15 * v.buka;
  if (H < 1.2) {
    const s = 4 + 3 * gm;
    return { luar: `M${-W} ${-gm} Q0 ${s} ${W} ${-gm} Q0 ${s + 3 + Math.max(0, gm) * 2} ${-W} ${-gm}Z`, dalam: '' };
  }
  const k = W * (1 - 0.4 * v.bulat);
  const atas = -H * 0.35, bawah = H * 0.9;
  return {
    luar: `M${-W - 2} 0 C${-k} ${atas * 1.6 - 2} ${k} ${atas * 1.6 - 2} ${W + 2} 0 C${k} ${bawah * 1.4 + 2} ${-k} ${bawah * 1.4 + 2} ${-W - 2} 0Z`,
    dalam: `M${-W} 0 C${-k} ${atas * 1.3} ${k} ${atas * 1.3} ${W} 0 C${k} ${bawah * 1.2} ${-k} ${bawah * 1.2} ${-W} 0Z`,
  };
}
const VIS = {
  a: { buka: 1, lebar: 1, bulat: 0.1 }, i: { buka: 0.32, lebar: 1.25, bulat: 0 }, u: { buka: 0.45, lebar: 0.5, bulat: 1 },
  e: { buka: 0.6, lebar: 1.1, bulat: 0.1 }, o: { buka: 0.82, lebar: 0.66, bulat: 0.9 }, m: { buka: 0, lebar: 0.9, bulat: 0 },
  k: { buka: 0.36, lebar: 0.85, bulat: 0.3 }, diam: { buka: 0, lebar: 0.95, bulat: 0 },
};
const kelasHuruf = (c) => ('aiueo'.includes(c) ? c : 'mbp'.includes(c) ? 'm' : c === 'w' ? 'u' : 'k');

// ── siapa bicara kapan ─────────────────────────────────────────────────────
const BARIS_TOKOH = {};
for (const l of BARIS) (BARIS_TOKOH[l.tokoh] ||= []).push(l);
/** Kalimat tokoh yang sedang/baru diucapkan pada t (sisa = detik sesudah selesai). */
function kalimatPada(nama, t, sisa = 0) {
  for (const l of BARIS_TOKOH[nama] || []) if (t >= l.start - 0.05 && t <= l.end + sisa) return l;
  return null;
}
function kalimatSiapaPun(t) {
  for (const l of BARIS) if (t >= l.start - 0.05 && t <= l.end) return l;
  return null;
}
function visemePada(l, t) {
  for (const w of l.words) {
    if (t < w.t || t > w.t + w.d + 0.03) continue;
    const huruf = w.w.toLowerCase().replace(/[^a-z]/g, '');
    if (!huruf) return VIS.k;
    const bobot = [...huruf].map((c) => ('aiueo'.includes(c) ? 1.5 : 0.9));
    const total = bobot.reduce((a, b) => a + b, 0);
    let u = clamp((t - w.t) / w.d) * total;
    for (let i = 0; i < huruf.length; i++) { if (u <= bobot[i] || i === huruf.length - 1) return VIS[kelasHuruf(huruf[i])]; u -= bobot[i]; }
  }
  return VIS.diam;
}
/** Denyut gerak tangan: naik di setiap awal kata panjang/bertekanan. */
function denyutKata(l, t) {
  let d = 0;
  for (const w of l.words) { const x = t - w.t; if (x >= 0 && x < 0.38 && w.w.length > 3) d = Math.max(d, Math.sin((x / 0.38) * Math.PI)); }
  return d;
}
// Ekspresi per rasa: alis (naik, miring dalam), senyum, mata
const EKSPRESI = {
  tenang: { naik: 0, miring: 0, senyum: 0.5, mata: 1 }, hangat: { naik: -2, miring: -3, senyum: 1, mata: 0.95 },
  serius: { naik: 2, miring: 8, senyum: 0, mata: 1 }, tegas: { naik: 3, miring: 12, senyum: -0.2, mata: 1 },
  riang: { naik: -5, miring: 0, senyum: 1.2, mata: 1.05 }, semangat: { naik: -6, miring: -2, senyum: 1.1, mata: 1.1 },
  cemas: { naik: -5, miring: -14, senyum: -0.8, mata: 1.12 }, kaget: { naik: -9, miring: -4, senyum: -0.2, mata: 1.25 },
  heran: { naik: -6, miring: -6, senyum: 0.1, mata: 1.08 }, jenaka: { naik: -4, miring: 0, senyum: 1.3, mata: 0.92 },
  bangga: { naik: -2, miring: 0, senyum: 1.2, mata: 1 }, kecewa: { naik: -2, miring: -12, senyum: -1, mata: 0.9 },
  mengejek: { naik: 4, miring: 14, senyum: 1.3, mata: 0.9 }, kesal: { naik: 4, miring: 14, senyum: -1, mata: 0.8 },
};

// ═══════════════════════════════════════════════════════════════════════════
function boneka(nama, induk, o = {}) {
  const G = GAYA[nama];
  const akar = el('g', {}, induk);
  const tubuh = el('g', {}, akar);          // dibalik (hadap) di sini
  const badan = el('g', { filter: 'url(#bt)' }, tubuh);
  const lenganBelakang = el('g', { filter: 'url(#bt)' }, tubuh);
  const kepala = el('g', { filter: 'url(#bt)' }, tubuh);
  const lenganDepan = el('g', { filter: 'url(#bt)' }, tubuh);
  const K = G.kulit;

  // sepatu, kaki, rok
  const sepatuLebar = nama === 'mercusuar' ? 30 : 26;
  kertas(kotak(-32, -12, sepatuLebar, 12, 4), G.sepatu, badan, { amp: 0.5 });
  kertas(kotak(6, -12, sepatuLebar, 12, 4), G.sepatu, badan, { amp: 0.5 });
  if (nama === 'mercusuar') { // sepatu bot tinggi
    kertas(kotak(-30, -46, 24, 36, 3), G.sepatu, badan, { amp: 0.4 }); kertas(kotak(6, -46, 24, 36, 3), G.sepatu, badan, { amp: 0.4 });
  }
  if (G.rok) {
    kertas([[-34, -128], [34, -128], [46, -12], [-46, -12]], G.rok, badan);
  } else {
    kertas([[-30, -128], [-2, -128], [-5, -10], [-28, -10]], G.celana, badan);
    kertas([[2, -128], [30, -128], [28, -10], [5, -10]], G.celana, badan);
  }
  // badan / baju
  if (nama === 'mercusuar') { // jas hujan panjang sampai lutut
    kertas([[-46, -226], [-30, -238], [30, -238], [46, -226], [50, -70], [-50, -70]], G.baju, badan);
    kertas([[-4, -236], [4, -236], [4, -70], [-4, -70]], '#d9a91f', badan, { amp: 0.3 });
    for (const y of [-200, -165, -130, -95]) kertas(oval(10, y, 4, 4, 10), '#2b2b2b', badan, { amp: 0.1 });
    kertas([[-24, -238], [0, -214], [24, -238], [16, -244], [0, -228], [-16, -244]], '#d9a91f', badan, { amp: 0.3 });
  } else {
    kertas([[-44, -226], [-30, -236], [30, -236], [44, -226], [40, -122], [-40, -122]], G.baju, badan);
  }
  if (nama === 'ardi') { kertas([[-12, -236], [0, -214], [12, -236]], '#f1faee', badan, { amp: 0.4 }); kertas(kotak(-40, -128, 80, 7), '#1a3054', badan, { amp: 0.4 }); }
  if (nama === 'gadis') {
    kertas([[-18, -236], [0, -224], [18, -236], [14, -240], [0, -230], [-14, -240]], '#f2c46b', badan, { amp: 0.3 });
    el('path', { d: 'M-9 -232 L0 -178 L9 -232', stroke: '#2a4f9c', 'stroke-width': 3, fill: 'none' }, badan);
    kertas(kotak(-12, -180, 24, 22, 2), '#ffffff', badan, { amp: 0.4 }); kertas(kotak(-8, -175, 16, 4), '#2a4f9c', badan, { amp: 0.2 });
  }
  if (nama === 'syahbandar') {
    kertas([[-7, -234], [7, -234], [9, -170], [0, -158], [-9, -170]], '#1d3557', badan, { amp: 0.4 });
    for (const sx of [-1, 1]) { const g = el('g', { transform: `translate(${sx * 30} -230) rotate(${sx * 10})` }, badan); kertas(kotak(-15, -5, 30, 10), '#1d3557', g, { amp: 0.3 }); kertas(kotak(-15, -1, 30, 2), '#f2c46b', g, { amp: 0.1 }); }
  }
  if (nama === 'patroli') { // rompi jingga bergaris pantul + teropong
    kertas([[-44, -226], [-18, -236], [-12, -150], [-40, -124]], '#f28c28', badan, { amp: 0.5 });
    kertas([[44, -226], [18, -236], [12, -150], [40, -124]], '#f28c28', badan, { amp: 0.5 });
    for (const sx of [-1, 1]) kertas([[sx * 42, -176], [sx * 14, -182], [sx * 13, -172], [sx * 41, -166]], '#fffdf5', badan, { amp: 0.2 });
    el('path', { d: 'M-18 -234 Q0 -200 18 -234', stroke: '#2b2b2b', 'stroke-width': 3, fill: 'none' }, badan);
    const tr = el('g', { transform: 'translate(0 -196)' }, badan);
    kertas(kotak(-20, -8, 17, 24, 5), '#2b2b2b', tr, { amp: 0.3 }); kertas(kotak(3, -8, 17, 24, 5), '#2b2b2b', tr, { amp: 0.3 });
    kertas(kotak(-4, -2, 8, 8), '#555', tr, { amp: 0.1 });
  }
  if (nama === 'udin') { // kemeja kerja berkantong
    el('path', { d: 'M0 -234 L0 -124', stroke: '#6f7b88', 'stroke-width': 3 }, badan);
    for (const y of [-210, -180, -150]) kertas(oval(5, y, 3, 3, 8), '#e9ecef', badan, { amp: 0.1 });
    kertas(kotak(-34, -206, 24, 22, 2), '#7d8996', badan, { amp: 0.3 });
    kertas([[-16, -236], [0, -222], [16, -236], [10, -240], [0, -230], [-10, -240]], '#7d8996', badan, { amp: 0.3 });
  }
  kertas(kotak(-10, -250, 20, 20), K, badan, { amp: 0.4 });

  // ── kepala (poros leher 0,-246)
  const rambut = { ardi: GELAP, gadis: GELAP, syahbandar: '#d9d4ca', mercusuar: '#4b4b55', patroli: GELAP, udin: GELAP }[nama];
  if (nama === 'gadis' || nama === 'mercusuar') {
    kertas(oval(-40, -268, 16, 16), rambut, kepala);
    kertas([[-40, -292], [-36, -326], [0, -344], [36, -326], [40, -292], [38, -262], [-38, -262]], rambut, kepala);
  }
  kertas(oval(-33, -288, 8, 11), K, kepala, { amp: 0.5 });
  kertas(oval(33, -288, 8, 11), K, kepala, { amp: 0.5 });
  kertas(oval(0, -290, 33, 38), K, kepala);
  if (nama === 'gadis' || nama === 'mercusuar') {
    kertas([[-35, -296], [-31, -326], [0, -338], [31, -326], [35, -298], [20, -312], [-2, -320], [-22, -306]], rambut, kepala, { amp: 0.8 });
    for (const sx of [-1, 1]) kertas(oval(sx * 34, -276, 3.6, 3.6, 12), nama === 'gadis' ? '#fbf7ee' : '#e9c46a', kepala, { amp: 0.2 });
    if (nama === 'mercusuar') kertas([[8, -334], [22, -328], [16, -312], [6, -318]], '#a9adb8', kepala, { amp: 0.3 }); // uban
  }
  if (nama === 'ardi') {
    for (const sx of [-1, 1]) kertas([[sx * 30, -318], [sx * 35, -300], [sx * 33, -286], [sx * 27, -300]], GELAP, kepala, { amp: 0.4 });
    kertas([[-40, -322], [-44, -350], [44, -350], [40, -322]], '#1f3558', kepala);
    kertas(kotak(-37, -330, 74, 10), '#13233f', kepala, { amp: 0.4 });
    kertas([[-36, -322], [36, -322], [30, -312], [-30, -312]], '#101318', kepala, { amp: 0.4 });
    kertas(oval(0, -340, 6, 6, 14), '#f2c46b', kepala, { amp: 0.3 });
  }
  if (nama === 'syahbandar') {
    for (const sx of [-1, 1]) kertas([[sx * 30, -320], [sx * 36, -298], [sx * 33, -280], [sx * 27, -298]], '#d9d4ca', kepala, { amp: 0.4 });
    kertas([[-42, -322], [-46, -352], [46, -352], [42, -322]], '#fbfaf6', kepala);
    kertas(kotak(-38, -331, 76, 11), '#1d3557', kepala, { amp: 0.4 });
    kertas([[-37, -322], [37, -322], [31, -311], [-31, -311]], '#101318', kepala, { amp: 0.4 });
    kertas(kotak(-28, -318, 56, 3), '#f2c46b', kepala, { amp: 0.2 });
    kertas(oval(0, -342, 7, 7, 14), '#f2c46b', kepala, { amp: 0.3 });
  }
  if (nama === 'patroli') { // topi lapangan berpelindung
    for (const sx of [-1, 1]) kertas([[sx * 30, -318], [sx * 35, -300], [sx * 33, -288], [sx * 27, -300]], GELAP, kepala, { amp: 0.4 });
    kertas([[-36, -318], [-34, -344], [0, -352], [34, -344], [36, -318]], '#23395d', kepala);
    kertas([[-40, -320], [44, -320], [52, -312], [-36, -312]], '#16263f', kepala, { amp: 0.4 });
    kertas(oval(0, -336, 7, 6, 14), '#f2c46b', kepala, { amp: 0.3 });
  }
  if (nama === 'udin') { // kopiah hitam
    for (const sx of [-1, 1]) kertas([[sx * 30, -314], [sx * 35, -298], [sx * 33, -286], [sx * 27, -298]], GELAP, kepala, { amp: 0.4 });
    kertas([[-33, -316], [-31, -344], [31, -344], [33, -316]], '#1b1b1b', kepala);
    kertas(kotak(-33, -322, 66, 5), '#3a3a3a', kepala, { amp: 0.2 });
  }
  // alis
  const alisKiri = el('g', {}, kepala), alisKanan = el('g', {}, kepala);
  const warnaAlis = G.alis || GELAP;
  kertas([[-22, -308], [-6, -310], [-6, -306], [-22, -303]], warnaAlis, alisKiri, { amp: 0.3 });
  kertas([[6, -310], [22, -308], [22, -303], [6, -306]], warnaAlis, alisKanan, { amp: 0.3 });
  // mata (buka / kedip)
  const mataBuka = el('g', {}, kepala), mataTutup = el('g', {}, kepala);
  const pupil = [];
  for (const sx of [-1, 1]) {
    kertas(oval(sx * 13, -294, 8, 7, 18), '#ffffff', mataBuka, { amp: 0.3 });
    pupil.push(kertas(oval(sx * 13 + 2, -294, 4, 4.2, 12), '#20140f', mataBuka, { amp: 0.2 }));
    kertas([[sx * 13 - 8, -293], [sx * 13 + 8, -293], [sx * 13 + 7, -290], [sx * 13 - 7, -290]], '#3a2418', mataTutup, { amp: 0.2 });
  }
  if (nama === 'syahbandar') {
    for (const sx of [-1, 1]) el('rect', { x: sx * 13 - 12, y: -304, width: 24, height: 20, rx: 7, fill: 'rgba(255,255,255,.12)', stroke: '#2b2b2b', 'stroke-width': 3 }, kepala);
    el('path', { d: 'M-1 -296 Q0 -299 1 -296', stroke: '#2b2b2b', 'stroke-width': 3, fill: 'none' }, kepala);
  }
  kertas([[0, -290], [-5, -276], [4, -276]], G.hidung, kepala, { amp: 0.3 });
  for (const sx of [-1, 1]) kertas(oval(sx * 20, -276, 6, 5, 12), '#ef8a7a', kepala, { amp: 0.2, attr: { opacity: 0.45 } });
  const mulut = el('g', { transform: 'translate(0 -265)' }, kepala);
  const mulutLuar = el('path', { fill: G.bibir }, mulut);
  const mulutDalam = el('path', { fill: '#4a1414' }, mulut);
  if (nama === 'syahbandar') kertas([[-17, -276], [-6, -280], [0, -277], [6, -280], [17, -276], [10, -270], [0, -272], [-10, -270]], '#d9d4ca', kepala, { amp: 0.3 });
  if (nama === 'udin') kertas([[-15, -275], [-5, -279], [0, -276], [5, -279], [15, -275], [9, -270], [0, -272], [-9, -270]], '#2a1d17', kepala, { amp: 0.3 });

  // lengan: satu potongan berengsel di bahu; tangan bulat
  const lengan = (indukL, sx) => {
    const g = el('g', {}, indukL);
    kertas(kotak(-12, -6, 24, 82, 11), G.lengan, g);
    if (nama === 'syahbandar') kertas(kotak(-12, 62, 24, 6), '#1d3557', g, { amp: 0.3 });
    if (nama === 'patroli') kertas(kotak(-12, 48, 24, 6), '#fffdf5', g, { amp: 0.2 });
    kertas(oval(0, 86, 13, 14, 20), K, g, { amp: 0.5 });
    g._sx = sx;
    return g;
  };
  const kiri = lengan(lenganBelakang, -1), kanan = lengan(lenganDepan, 1);
  const pegang = {};
  if (nama === 'syahbandar') { // papan periksa di tangan kiri
    const pp = el('g', { transform: 'translate(0 90) rotate(-8)' }, kiri);
    kertas(kotak(-26, -10, 52, 66, 4), '#8b5e34', pp); kertas(kotak(-20, -2, 40, 52), '#fdfaf0', pp, { amp: 0.4 });
    kertas(kotak(-10, -16, 20, 10, 3), '#9aa0a8', pp, { amp: 0.3 });
    for (let k = 0; k < 4; k++) kertas(kotak(-14, 6 + k * 11, 28 - (k % 2) * 8, 3), '#5b6b8c', pp, { amp: 0.1 });
    pegang.papan = pp;
  }
  if (nama === 'mercusuar') { // lentera
    const ln = el('g', { transform: 'translate(0 100)' }, kiri);
    el('circle', { cx: 0, cy: 24, r: 46, fill: 'url(#cahayaLampu)' }, ln);
    el('path', { d: 'M-12 -2 Q0 -18 12 -2', stroke: '#2b2b2b', 'stroke-width': 3, fill: 'none' }, ln);
    kertas(kotak(-15, 0, 30, 8, 2), '#2b2b2b', ln, { amp: 0.2 });
    kertas(kotak(-12, 8, 24, 30, 3), '#ffe08a', ln, { amp: 0.3 });
    for (const x of [-12, 9]) kertas(kotak(x, 8, 3, 30), '#2b2b2b', ln, { amp: 0.1 });
    kertas(kotak(-15, 38, 30, 7, 2), '#2b2b2b', ln, { amp: 0.2 });
    pegang.lentera = ln;
  }
  if (nama === 'patroli') { // radio genggam
    const rd = el('g', { transform: 'translate(4 96) rotate(-10)' }, kanan);
    kertas(kotak(-9, -16, 18, 34, 4), '#1f2937', rd, { amp: 0.2 });
    kertas(kotak(4, -30, 3, 16), '#1f2937', rd, { amp: 0.1 });
    kertas(kotak(-6, -12, 12, 8, 2), '#86efac', rd, { amp: 0.1 });
    pegang.radio = rd;
  }
  if (nama === 'udin') { // map biru yang basah
    const mp = el('g', { transform: 'translate(2 96) rotate(6)' }, kiri);
    kertas(kotak(-30, -6, 60, 46, 3), '#2563eb', mp, { amp: 0.6 });
    kertas(kotak(-26, -10, 52, 6), '#f8fafc', mp, { amp: 0.3 });
    for (const [x, y] of [[-18, 44], [4, 48], [20, 42]]) kertas([[x, y], [x + 4, y + 10], [x, y + 14], [x - 4, y + 10]], '#93c5fd', mp, { amp: 0.2 });
    pegang.map = mp;
  }
  return { nama, akar, tubuh, badan, kepala, alisKiri, alisKanan, mataBuka, mataTutup, pupil, mulutLuar, mulutDalam, kiri, kanan, pegang, x: o.x ?? 0, y: o.y ?? 0, s: o.s ?? 1 };
}

/**
 * Gerakkan boneka pada waktu t. o: {x, y, s, hadap, kiri, kanan (sudut lengan,
 * menimpa gerak otomatis), lihat (x layar yang dilihat), miring, angguk,
 * lompat (0..1 tinggi lompatan), rasa (memaksa ekspresi)}.
 */
function gerakBoneka(b, t, o = {}) {
  const l = langkahDari(t), tq = tStop(t);
  const id = b.nama.length * 7 + b.nama.charCodeAt(0);
  const x = o.x ?? b.x, y = o.y ?? b.y, s = o.s ?? b.s, hadap = o.hadap ?? 1;
  const bicara = kalimatPada(b.nama, tq);
  const baru = kalimatPada(b.nama, tq, 0.8);
  const rasa = o.rasa ?? (baru ? baru.rasa : 'tenang');
  const ek = EKSPRESI[rasa] || EKSPRESI.tenang;
  const napas = Math.sin(tq * 3 + id) * 1.5;
  const bob = o.lompat ? -Math.abs(Math.sin(tq * 9)) * 10 * o.lompat : 0;
  atur(b.akar, `translate(${f1(x)} ${f1(y + bob)}) scale(${(s * hadap).toFixed(3)} ${s.toFixed(3)}) ${getar(id * 10, l, 0, -150, 0.8)}`);
  atur(b.badan, `translate(0 ${f2(napas * 0.4)})`);
  // kepala: miring & angguk (poros leher); lebih hidup saat bicara
  let miring = Math.sin(tq * 1.7 + id) * 2.5 + (o.miring ?? 0), angguk = o.angguk ?? 0;
  if (bicara) {
    miring += Math.sin(tq * 4.3 + id) * 3;
    angguk += denyutKata(bicara, tq) * 4;
  } else {
    // menyimak: sesekali mengangguk ke arah pembicara
    const lain = kalimatSiapaPun(tq);
    if (lain && lain.tokoh !== b.nama && o.simak !== false) angguk += Math.max(0, Math.sin(tq * 2.1 + id)) * 2.5;
  }
  atur(b.kepala, `translate(0 ${f2(napas * 0.4 + angguk * 0.25)}) rotate(${f2(miring + angguk)} 0 -246)`);
  // mata: kedip + arah pandang + ukuran (rasa)
  const kedip = ((l + id * 5) % 41) < 2 && rasa !== 'kaget';
  tampil(b.mataBuka, !kedip); tampil(b.mataTutup, kedip);
  let lihat = 0;
  if (o.lihat !== undefined) lihat = clamp((o.lihat - x) / 300, -1, 1) * hadap;
  else { const lain = kalimatSiapaPun(tq); if (lain && lain.tokoh !== b.nama && POSISI[lain.tokoh] !== undefined) lihat = clamp((POSISI[lain.tokoh] - x) / 300, -1, 1) * hadap; }
  const sm = ek.mata;
  b.mataBuka.setAttribute('transform', `translate(0 -294) scale(1 ${sm.toFixed(2)}) translate(0 294)`);
  b.pupil.forEach((p) => atur(p, `translate(${f2(lihat * 3.2)} 0)`));
  // alis menurut rasa
  const naik = (bicara || baru ? ek.naik : 0) + (bicara && (l % 9) < 2 ? -2 : 0);
  const mir = bicara || baru ? ek.miring : 0;
  atur(b.alisKiri, `translate(0 ${naik}) rotate(${-mir} -14 -307)`);
  atur(b.alisKanan, `translate(0 ${naik}) rotate(${mir} 14 -307)`);
  // mulut: pengganti per langkah (replacement animation)
  const m = mulutBentuk(bicara ? visemePada(bicara, tq) : VIS.diam, bicara ? 0 : (baru ? ek.senyum : (o.senyum ?? 0.6)));
  b.mulutLuar.setAttribute('d', m.luar); b.mulutDalam.setAttribute('d', m.dalam);
  // lengan
  let ki = 10, ka = -10;
  if (bicara && o.gestur !== false) {
    const u = clamp((tq - bicara.start) / 0.3) * clamp((bicara.end - tq) / 0.3);
    ka = lerp(-10, -62, E.out(u)) - denyutKata(bicara, tq) * 22 * u;
    ki = lerp(10, 22, u);
  }
  if (o.kiri !== undefined) ki = o.kiri;
  if (o.kanan !== undefined) ka = o.kanan;
  atur(b.kiri, `translate(-42 -224) rotate(${f2(ki)})`);
  atur(b.kanan, `translate(42 -224) rotate(${f2(ka)})`);
  POSISI[b.nama] = x;
}
const POSISI = {};

// ═══════════════════════════════════════════════════════════════════════════
// SI BADAI: awan kertas berwajah, lambang risiko
// ═══════════════════════════════════════════════════════════════════════════
function siBadai(induk) {
  const akar = el('g', {}, induk);
  const awan = el('g', { filter: 'url(#b3)' }, akar);
  const gumpal = [[-150, 10, 92, '#4a5066'], [-60, -40, 110, '#5c6378'], [50, -50, 118, '#5c6378'], [150, 0, 96, '#4a5066'],
    [-100, 50, 90, '#3d4256'], [20, 50, 104, '#3d4256'], [120, 54, 80, '#3d4256']];
  for (const [x, y, r, w] of gumpal) kertas(oval(x, y, r, r * 0.82, 40), w, awan, { amp: 2, langkah: 14 });
  for (const [x, y, r] of [[-70, -70, 46], [40, -86, 52], [-160, -6, 38]]) kertas(oval(x, y, r, r * 0.6, 30), '#737b94', awan, { amp: 1.5, langkah: 12 });
  // wajah
  const wajah = el('g', {}, akar);
  const alisKiri = el('g', {}, wajah), alisKanan = el('g', {}, wajah);
  kertas([[-110, -54], [-30, -28], [-34, -14], [-114, -40]], '#1b1e2b', alisKiri, { amp: 0.8 });
  kertas([[110, -54], [30, -28], [34, -14], [114, -40]], '#1b1e2b', alisKanan, { amp: 0.8 });
  const mataBuka = el('g', {}, wajah);
  const pupil = [];
  for (const sx of [-1, 1]) {
    kertas(oval(sx * 66, 0, 26, 22, 24), '#f8fafc', mataBuka, { amp: 0.6 });
    pupil.push(kertas(oval(sx * 66 + 4, 4, 11, 12, 16), '#11131c', mataBuka, { amp: 0.3 }));
  }
  const mulut = el('g', { transform: 'translate(0 70) scale(3.2)' }, wajah);
  const mulutLuar = el('path', { fill: '#2a1a2e' }, mulut);
  const mulutDalam = el('path', { fill: '#7f1d1d' }, mulut);
  // kilat kecil di bawah awan
  const kilat = [-90, 40, 140].map((x, i) => kertas([[x, 90], [x - 26, 160], [x - 4, 156], [x - 30, 230], [x + 22, 140], [x - 2, 146], [x + 16, 90]], '#f2c46b', akar, { amp: 0.8, attr: { filter: 'url(#b2)' } }));
  return { nama: 'badai', akar, awan, wajah, alisKiri, alisKanan, mataBuka, pupil, mulutLuar, mulutDalam, kilat };
}
function gerakBadai(b, t, o = {}) {
  const l = langkahDari(t), tq = tStop(t);
  const bicara = kalimatPada('badai', tq);
  const baru = kalimatPada('badai', tq, 0.8);
  const rasa = baru ? baru.rasa : 'mengejek';
  const tawa = bicara && /haha|hehe/i.test(bicara.display) && tq < bicara.words[Math.min(1, bicara.words.length - 1)].t ? 1 : 0;
  const s = (o.s ?? 1) * (1 + Math.sin(tq * 6) * 0.015 + tawa * Math.abs(Math.sin(tq * 18)) * 0.05);
  atur(b.akar, `translate(${f1(o.x ?? 0)} ${f1((o.y ?? 0) + Math.sin(tq * 1.6) * 8)}) scale(${s.toFixed(3)}) rotate(${f2(Math.sin(tq * 1.1) * 2 + (o.miring ?? 0))}) ${getar(991, l, 0, 0, 1.4)}`);
  const marah = rasa === 'kesal' ? 1 : rasa === 'jenaka' ? -0.5 : 0.6;
  atur(b.alisKiri, `rotate(${f2(-8 * marah)} -70 -40) translate(0 ${f1(-4 * (1 - marah))})`);
  atur(b.alisKanan, `rotate(${f2(8 * marah)} 70 -40) translate(0 ${f1(-4 * (1 - marah))})`);
  const lihat = o.lihat ?? 0;
  b.pupil.forEach((p) => atur(p, `translate(${f1(lihat * 8)} 0)`));
  const m = mulutBentuk(bicara ? (tawa ? VIS.a : visemePada(bicara, tq)) : VIS.diam, rasa === 'kesal' ? -1 : 1.2);
  b.mulutLuar.setAttribute('d', m.luar); b.mulutDalam.setAttribute('d', m.dalam);
  b.kilat.forEach((k, i) => tampil(k, o.kilat !== false && (l + i * 3) % 7 === 0));
}
