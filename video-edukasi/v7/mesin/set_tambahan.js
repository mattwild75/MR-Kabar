// ═══════════════════════════════════════════════════════════════════════════
// SET TAMBAHAN: ruang kantor syahbandar, ikon kertas, lembar Excel/Word,
// buku besar MR Kabar, label coret.
// ═══════════════════════════════════════════════════════════════════════════

/** Ruang kantor syahbandar: dinding papan, jendela berfoto laut asli, meja, papan gabus. */
function panggungKantor(akar, o = {}) {
  const lp = [lapisan(akar, 0.6), lapisan(akar, 0.85), lapisan(akar, 1), lapisan(akar, 1.1)];
  const [dinding, perabot, depan] = lp;
  el('rect', { x: -900, y: -600, width: 3800, height: 1460, fill: 'url(#papanKayu)' }, dinding);
  kertas(kotak(-900, 640, 3800, 26), '#5e3a1f', dinding, { amp: 0.8 });
  // jendela dengan pemandangan laut (foto asli)
  const jendela = el('g', { filter: 'url(#b2)' }, dinding);
  kertas(kotak(o.jx ?? 60, 120, 520, 380, 6), '#6b4226', jendela, { amp: 0.8 });
  const idj = 'jendelaFoto' + fotoId++;
  const cp = el('clipPath', { id: idj }, jendela);
  el('rect', { x: (o.jx ?? 60) + 22, y: 142, width: 476, height: 336 }, cp);
  el('image', { href: 'aset/foto/' + (o.foto ?? 'pantai_meulaboh') + '.jpg', x: (o.jx ?? 60) + 22, y: 142, width: 476, height: 336, preserveAspectRatio: 'xMidYMid slice', 'clip-path': `url(#${idj})` }, jendela);
  kertas(kotak((o.jx ?? 60) + 252, 142, 16, 336), '#6b4226', jendela, { amp: 0.4 });
  kertas(kotak((o.jx ?? 60) + 22, 300, 476, 14), '#6b4226', jendela, { amp: 0.4 });
  kertas(kotak((o.jx ?? 60) - 20, 492, 560, 22, 4), '#8c5a33', jendela, { amp: 0.6 });
  // lantai
  el('rect', { x: -900, y: 780, width: 3800, height: 500, fill: '#6b4226' }, perabot);
  for (let x = -900; x < 2900; x += 160) kertas(kotak(x, 782, 4, 300), '#5e3a1f', perabot, { amp: 0.4 });
  kertas(kotak(-900, 776, 3800, 14), '#4a2c16', perabot, { amp: 0.6 });
  // papan gabus di dinding
  const papan = el('g', { filter: 'url(#b3)' }, dinding);
  kertas(kotak(o.px ?? 1230, 110, o.pw ?? 640, 440, 8), '#7a5230', papan, { amp: 1 });
  kertas(kotak((o.px ?? 1230) + 14, 124, (o.pw ?? 640) - 28, 412, 4), 'url(#gabus)', papan, { amp: 0.8 });
  // meja kerja di depan papan
  const meja = el('g', { filter: 'url(#b2)' }, perabot);
  kertas(kotak(o.mx ?? 1260, 640, 600, 30, 4), '#8c5a33', meja, { amp: 0.8 });
  kertas(kotak((o.mx ?? 1260) + 30, 668, 26, 140), '#5e3a1f', meja, { amp: 0.5 });
  kertas(kotak((o.mx ?? 1260) + 544, 668, 26, 140), '#5e3a1f', meja, { amp: 0.5 });
  return { lp, dinding, perabot, depan, papan, meja, perbarui: (t, k) => kamera(lp, k) };
}

/** Lembar kerja kecil: 'excel' (hijau, bergrid) atau 'word' (biru, bergaris). */
function lembarKerja(induk, jenis, w = 90, hgt = 116) {
  const g = el('g', { filter: 'url(#b1)' }, induk);
  kertas(kotak(-w / 2, -hgt / 2, w, hgt, 3), '#fffdf7', g, { amp: 0.6 });
  const warna = jenis === 'excel' ? '#15803d' : '#1d4ed8';
  kertas(kotak(-w / 2, -hgt / 2, w, 22), warna, g, { amp: 0.3 });
  teks(g, 0, -hgt / 2 + 17, jenis === 'excel' ? 'X' : 'W', { bebas: true, ukuran: 20, warna: '#fff', jangkar: 'middle' });
  if (jenis === 'excel') {
    for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++) kertas(kotak(-w / 2 + 8 + c * ((w - 16) / 3), -hgt / 2 + 30 + r * 16, (w - 16) / 3 - 3, 12), '#dcfce7', g, { amp: 0.1 });
  } else {
    for (let r = 0; r < 6; r++) kertas(kotak(-w / 2 + 10, -hgt / 2 + 32 + r * 13, (w - 20) * (r % 3 === 2 ? 0.6 : 1), 4), '#bfdbfe', g, { amp: 0.1 });
  }
  return g;
}

/** Buku besar bersampul biru dengan lencana logo MR Kabar. */
function bukuMRKabar(induk, x, y, s = 1) {
  const g = el('g', { filter: 'url(#b3)' }, induk);
  kertas(kotak(x - 150 * s, y - 190 * s, 300 * s, 380 * s, 10 * s), '#1d3557', g, { amp: 1 });
  kertas(kotak(x - 150 * s, y - 190 * s, 28 * s, 380 * s), '#13233f', g, { amp: 0.5 });
  for (let k = 0; k < 6; k++) kertas(kotak(x + 150 * s, y - 180 * s + k * 4, 10 * s, 360 * s - k * 8), '#fdf6e3', g, { amp: 0.2 });
  kertas(oval(x + 10 * s, y - 40 * s, 92 * s, 92 * s, 40), '#fffdf5', g, { amp: 0.8 });
  el('image', { href: 'aset/img/MRKabar-lengkap.png', x: x - 62 * s, y: y - 108 * s, width: 144 * s, height: 134 * s }, g);
  teks(g, x + 10 * s, y + 110 * s, 'MR KABAR', { bebas: true, ukuran: 56 * s, warna: '#f2c46b', jangkar: 'middle', spasi: 3 });
  g._x = x; g._y = y;
  return g;
}

/** Ikon kertas sederhana di atas cakram berwarna. */
function ikonKertas(induk, x, y, jenis, warna = '#1d3557', r = 64) {
  const g = el('g', { filter: 'url(#b2)' }, induk);
  kertas(oval(x, y, r, r, 36), warna, g, { amp: 0.8 });
  const p = '#fdf6e3';
  if (jenis === 'jam') {
    kertas(oval(x, y, r * 0.62, r * 0.62, 30), p, g, { amp: 0.5 });
    kertas(kotak(x - 3, y - r * 0.48, 6, r * 0.5), warna, g, { amp: 0.1 });
    kertas([[x, y - 3], [x + r * 0.34, y + r * 0.2], [x + r * 0.3, y + r * 0.27], [x - 2, y + 4]], warna, g, { amp: 0.1 });
  } else if (jenis === 'orang') {
    kertas(oval(x, y - r * 0.28, r * 0.24, r * 0.24, 20), p, g, { amp: 0.3 });
    kertas([[x - r * 0.45, y + r * 0.5], [x - r * 0.38, y + r * 0.08], [x + r * 0.38, y + r * 0.08], [x + r * 0.45, y + r * 0.5]], p, g, { amp: 0.3 });
  } else if (jenis === 'podium') {
    kertas(kotak(x - r * 0.42, y - r * 0.05, r * 0.84, r * 0.55, 4), p, g, { amp: 0.3 });
    kertas(kotak(x - r * 0.04, y - r * 0.56, r * 0.08, r * 0.52), p, g, { amp: 0.1 });
    kertas([[x + r * 0.04, y - r * 0.56], [x + r * 0.46, y - r * 0.42], [x + r * 0.04, y - r * 0.28]], '#e63946', g, { amp: 0.2 });
  } else if (jenis === 'centang') {
    kertas([[x - r * 0.42, y], [x - r * 0.14, y + r * 0.3], [x + r * 0.44, y - r * 0.32], [x + r * 0.32, y - r * 0.44], [x - r * 0.14, y + r * 0.06], [x - r * 0.3, y - r * 0.12]], p, g, { amp: 0.3 });
  } else if (jenis === 'awan') {
    for (const [dx, dy, rr] of [[-0.25, 0.05, 0.25], [0.05, -0.12, 0.3], [0.3, 0.06, 0.22]]) kertas(oval(x + dx * r, y + dy * r, rr * r, rr * r * 0.85, 20), p, g, { amp: 0.3 });
    kertas(kotak(x - r * 0.5, y + r * 0.05, r, r * 0.24, r * 0.1), p, g, { amp: 0.3 });
  } else if (jenis === 'pelampung') {
    const cincin = [...oval(x, y, r * 0.55, r * 0.55, 30), ...oval(x, y, r * 0.3, r * 0.3, 30).reverse()];
    kertas(cincin, p, g, { amp: 0.3 });
    for (const a of [0.3, 1.87, 3.44, 5.01]) kertas([[x + Math.cos(a) * r * 0.3, y + Math.sin(a) * r * 0.3], [x + Math.cos(a) * r * 0.56, y + Math.sin(a) * r * 0.56], [x + Math.cos(a + 0.5) * r * 0.56, y + Math.sin(a + 0.5) * r * 0.56], [x + Math.cos(a + 0.5) * r * 0.3, y + Math.sin(a + 0.5) * r * 0.3]], '#e63946', g, { amp: 0.2 });
  } else if (jenis === 'kapal') {
    kertas([[x - r * 0.5, y + r * 0.1], [x + r * 0.5, y + r * 0.1], [x + r * 0.35, y + r * 0.36], [x - r * 0.35, y + r * 0.36]], p, g, { amp: 0.3 });
    kertas([[x - r * 0.04, y - r * 0.5], [x + r * 0.36, y + r * 0.02], [x - r * 0.04, y + r * 0.04]], p, g, { amp: 0.3 });
  }
  g._x = x; g._y = y;
  return g;
}
/** Tanda silang merah (coretan kertas). */
function silang(induk, x, y, r = 40) {
  const g = el('g', { filter: 'url(#bt)' }, induk);
  for (const s of [1, -1]) kertas([[x - r, y - r * s + 8 * s], [x - r + 8, y - r * s], [x + r, y + r * s - 8 * s], [x + r - 8, y + r * s]], '#e11d48', g, { amp: 0.4 });
  g._x = x; g._y = y;
  return g;
}
/** Muncul melenting di tempat (skala), dipakai untuk banyak properti. */
function lenting(g, tq, t0, t1 = 1e9, l = 0, id = 0) {
  const u = hidup(tq, t0, t1);
  tampil(g, u > 0.001);
  if (u > 0.001) atur(g, `translate(${g._x} ${g._y}) scale(${f2(u)}) translate(${-g._x} ${-g._y}) ${getar(id, l, g._x, g._y, 0.7)}`);
  return u;
}

/** Geladak kapal di laut lepas: lantai kayu di depan, pagar, tiang layar, laut & langit di belakang. */
function panggungGeladak(akar, o = {}) {
  const lp = [0, 0.1, 0.35, 0.7, 1, 1.1].map((v) => lapisan(akar, v));
  langit(lp[0], o.langit ?? 'Siang');
  const mt = matahari(lp[1], o.mx ?? 1600, o.my ?? 170);
  const awan = [[200, 150, 0.9], [800, 110, 0.8], [1350, 200, 0.7], [2100, 140, 1]].map(([x, y, s]) => awanKertas(lp[1], x, y, s));
  const lt = laut(akar, { lapis: [lp[2], lp[3], lp[3]], y: [560, 620, 700] });
  const pulau = el('g', { filter: 'url(#b1)' }, lp[2]);
  kertas([[-200, 566], [60, 520], [300, 540], [520, 566]], '#6aa760', pulau, { amp: 1 });
  kertas([[1900, 566], [2100, 530], [2350, 548], [2500, 566]], '#6aa760', pulau, { amp: 1 });
  const geladak = el('g', {}, lp[4]);
  kertas([[-900, 690], [2900, 690], [2900, 712], [-900, 712]], '#e9e2cf', geladak, { amp: 0.6, attr: { filter: 'url(#b2)' } });
  for (let x = -880; x < 2900; x += 70) kertas(kotak(x, 712, 10, 92), '#e9e2cf', geladak, { amp: 0.3 });
  el('rect', { x: -900, y: 800, width: 3800, height: 500, fill: 'url(#papanKayu)' }, geladak);
  kertas([[-900, 796], [2900, 796], [2900, 812], [-900, 812]], '#5e3a1f', geladak, { amp: 0.8 });
  if (o.papan !== false) papanGabus(lp[4], 990, 130, 900, 540);
  const tiang = el('g', { filter: 'url(#b2)' }, lp[4]);
  kertas(kotak(o.tiangX ?? 120, -300, 26, 1110), '#d9cba8', tiang, { amp: 0.6 });
  const layar = kertas([[(o.tiangX ?? 120) + 26, -260], [(o.tiangX ?? 120) + 420, 520], [(o.tiangX ?? 120) + 26, 560]], '#fffdf5', tiang, { amp: 1.4 });
  const p = { lp, geladak, tiang, layar };
  p.perbarui = (t, k) => {
    const tq = tStop(t), l = langkahDari(t);
    const goyang = Math.sin(tq * 0.9) * 0.8;
    kamera(lp, { x: k.x, y: k.y + Math.sin(tq * 1.1) * 4, z: k.z });
    for (const g of [lp[4], lp[5]]) g.setAttribute('transform', g.getAttribute('transform') + ` rotate(${f2(goyang)} 960 900)`);
    mt.perbarui(tq, l);
    awan.forEach((g, i) => atur(g, `translate(${f1(-tq * 14 * (1 + (i % 2)))} 0) ${getar(820 + i, l, g._x, g._y)}`));
    lt.perbarui(tq, o.kuat ?? 0.1);
    atur(layar, `skewX(${f2(Math.sin(tq * 1.3) * 2)})`);
  };
  return p;
}
