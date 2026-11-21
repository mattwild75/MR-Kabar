// ═══════════════════════════════════════════════════════════════════════════
// SET & PROPERTI kertas yang dipakai ulang oleh banyak adegan.
// Setiap pembangun mengembalikan grup; yang bergerak punya .perbarui(tq, l).
// ═══════════════════════════════════════════════════════════════════════════

// ── langit berlapis ───────────────────────────────────────────────────────
function langit(induk, jenis = 'Pagi', o = {}) {
  const g = el('g', {}, induk);
  el('rect', { x: -1400, y: -900, width: 4800, height: 1800, fill: `url(#langit${jenis})` }, g);
  const pita = { Pagi: ['#7cc3e6', '#6ab6de'], Siang: ['#5fb3e3', '#4ea6db'], Sore: ['#8fb7dd', '#7aa8d4'], Senja: ['#4b5a96', '#3d4b86'], Badai: ['#262d4a', '#1d2340'] }[jenis];
  for (let k = 0; k < 2; k++) {
    kertas([[-1400, -900], [3400, -900], ...Array.from({ length: 80 }, (_, i) => [3400 - i * 61, (k ? 44 : 96) + (k ? 12 : 16) * Math.sin(i * (k ? 0.9 : 0.7) + k)])], pita[k], g, { attr: { filter: 'url(#b1)' } });
  }
  return g;
}
function matahari(induk, x, y, o = {}) {
  const g = el('g', { filter: 'url(#b1)' }, induk);
  const sinar = kertas(Array.from({ length: 48 }, (_, i) => { const a = (i / 48) * Math.PI * 2, r = i % 2 ? 118 : 150; return [x + Math.cos(a) * r, y + Math.sin(a) * r]; }), o.sinar ?? '#ffd166', g, { amp: 1, langkah: 12 });
  kertas(oval(x, y, 92), o.warna ?? '#ffb703', g);
  kertas(oval(x - 12, y - 10, 62), o.dalam ?? '#ffc94a', g);
  g.perbarui = (tq, l) => atur(sinar, `rotate(${(l * 2.5).toFixed(1)} ${x} ${y})`);
  return g;
}
function awanKertas(induk, x, y, s = 1, warna = '#fefcf3') {
  const g = el('g', { filter: 'url(#b1)' }, induk);
  for (const [dx, dy, r] of [[-60, 6, 38], [-18, -16, 50], [34, -4, 42], [74, 10, 30]]) kertas(oval(x + dx * s, y + dy * s, r * s), warna, g, { amp: 1 });
  kertas(kotak(x - 92 * s, y + 6 * s, 196 * s, 36 * s, 16 * s), warna, g, { amp: 1 });
  g._x = x; g._y = y;
  return g;
}

// ── bukit & siluet Meulaboh ───────────────────────────────────────────────
function kotaMeulaboh(induk, o = {}) {
  const g = el('g', {}, induk);
  const dx = o.dx ?? 0, y0 = o.y ?? 600;
  const hijau = o.hijau ?? ['#9cc98a', '#6aa760'];
  kertas(pitaGelombang(-1400 + dx, 3400 + dx, (x) => y0 - 60 + 36 * Math.sin(x * 0.0042) + 18 * Math.sin(x * 0.011 + 2), y0 + 130), hijau[0], g, { attr: { filter: 'url(#b1)' } });
  const kota = el('g', { filter: 'url(#b1)' }, g);
  [[690, 70, 46, '#e07a5f'], [750, 56, 40, '#c8553d'], [1240, 62, 44, '#e07a5f'], [1300, 74, 38, '#bc4749'], [300, 60, 42, '#c8553d'], [1700, 66, 44, '#e07a5f']].forEach(([x, w, t, atap], i) => {
    kertas(kotak(x + dx, y0 - t, w, t), i % 2 ? '#f4e9d8' : '#fff7e8', kota);
    kertas([[x + dx - 6, y0 - t], [x + dx + w / 2, y0 - t - 30], [x + dx + w + 6, y0 - t]], atap, kota);
  });
  // Masjid Agung Meulaboh: kubah keemasan, dua menara
  const mx = 1020 + dx;
  kertas(kotak(mx - 100, y0 - 80, 200, 80), '#fffaf0', kota);
  kertas([...oval(mx, y0 - 80, 62, 58, 40).filter((p) => p[1] <= y0 - 79)], '#e9b949', kota);
  kertas(kotak(mx - 12, y0 - 152, 24, 18), '#e9b949', kota);
  for (const tx of [mx - 130, mx + 130]) {
    kertas(kotak(tx - 9, y0 - 130, 18, 130), '#fffaf0', kota);
    kertas([[tx - 13, y0 - 130], [tx, y0 - 162], [tx + 13, y0 - 130]], '#e9b949', kota);
  }
  for (const x of [mx - 60, mx - 20, mx + 20, mx + 60]) kertas([[x - 9, y0 - 18], [x - 9, y0 - 40], [x, y0 - 50], [x + 9, y0 - 40], [x + 9, y0 - 18]], '#7a8fb5', kota, { amp: 0.6 });
  for (const [x, s] of [[640, 1], [1370, 0.9], [200, 1.1], [1820, 0.95]]) {
    const px = x + dx;
    kertas([[px - 4, y0], [px + 4, y0], [px + 14 * s, y0 - 130], [px + 8 * s, y0 - 130]], '#8d5b3a', kota, { amp: 0.6 });
    for (let k = 0; k < 6; k++) { const a = -Math.PI / 2 + (k - 2.5) * 0.55; kertas([[px + 11 * s, y0 - 130], [px + 11 * s + Math.cos(a - 0.2) * 70 * s, y0 - 130 + Math.sin(a - 0.2) * 40 * s + 22], [px + 11 * s + Math.cos(a) * 82 * s, y0 - 130 + Math.sin(a) * 46 * s + 26]], '#2d6a4f', kota, { amp: 0.8 }); }
  }
  kertas(pitaGelombang(-1400 + dx, 3400 + dx, (x) => y0 - 12 + 22 * Math.sin(x * 0.0065 + 1), y0 + 130), hijau[1], g, { attr: { filter: 'url(#b1)' } });
  return g;
}

// ── laut tiga lapis; kuat = 0 (tenang) .. 1 (badai) ───────────────────────
function laut(induk, o = {}) {
  const warna = o.warna ?? ['#4cc9f0', '#1597c9', '#035a8e'];
  const buih = o.buih ?? ['#dff6fb', '#a9def9'];
  const y = o.y ?? [612, 694, 958];
  const x0 = o.x0 ?? -1400, x1 = o.x1 ?? 3400;
  const belakang = el('path', { fill: warna[0], filter: 'url(#b1)' }, o.lapis?.[0] ?? induk);
  const tengah = el('path', { fill: warna[1], filter: 'url(#b2)' }, o.lapis?.[1] ?? induk);
  const buihT = el('path', { fill: buih[0], filter: 'url(#b1)' }, o.lapis?.[1] ?? induk);
  const depan = el('path', { fill: warna[2], filter: 'url(#b3)' }, o.lapis?.[2] ?? induk);
  const buihD = el('path', { fill: buih[1], filter: 'url(#b2)' }, o.lapis?.[2] ?? induk);
  const s = { belakang, tengah, depan };
  s.fTengah = (x, tq, kuat = 0) => y[1] + (9 + 40 * kuat) * Math.sin(x * 0.016 - tq * 2.2 * 1.2 * (1 + kuat)) + (4 + 18 * kuat) * Math.sin(x * 0.05 + tq * 2.2);
  s.fDepan = (x, tq, kuat = 0) => y[2] + (13 + 46 * kuat) * Math.sin(x * 0.012 + tq * 2.2 * 1.4 * (1 + kuat)) + (5 + 20 * kuat) * Math.sin(x * 0.041 - tq * 2.2);
  s.perbarui = (tq, kuat = 0) => {
    const fase = tq * 2.2 * (1 + kuat);
    belakang.setAttribute('d', gunting(pitaGelombang(x0, x1, (x) => y[0] + (7 + 22 * kuat) * Math.sin(x * 0.02 + fase), y[0] + 900, 22), 0.8, 9, 51));
    tengah.setAttribute('d', gunting(pitaGelombang(x0, x1, (x) => s.fTengah(x, tq, kuat), y[1] + 900, 22), 0.9, 9, 52));
    buihT.setAttribute('d', gunting([...pitaGelombang(x0, x1, (x) => s.fTengah(x, tq, kuat) - 5, 0, 22).slice(0, -2), ...pitaGelombang(x0, x1, (x) => s.fTengah(x, tq, kuat) + 3, 0, 22).slice(0, -2).reverse()], 0.6, 9, 53));
    depan.setAttribute('d', gunting(pitaGelombang(x0, x1, (x) => s.fDepan(x, tq, kuat), y[2] + 900, 22), 1.1, 9, 54));
    buihD.setAttribute('d', gunting([...pitaGelombang(x0, x1, (x) => s.fDepan(x, tq, kuat) - 7, 0, 22).slice(0, -2), ...pitaGelombang(x0, x1, (x) => s.fDepan(x, tq, kuat) + 4, 0, 22).slice(0, -2).reverse()], 0.7, 9, 55));
  };
  return s;
}

// ── kapal awak (menghadap kanan); asal = tengah dasar lambung di garis air ──
function kapalAwak(induk, o = {}) {
  const g = el('g', {}, induk);
  const lambung = el('g', { filter: 'url(#b2)' }, g);
  const s = o.s ?? 1;
  const L = (pts) => pts.map(([x, y]) => [x * s, y * s]);
  // tiang & layar (di belakang kabin)
  const tiang = el('g', {}, lambung);
  kertas(L(kotak(-14, -420, 12, 380)), '#e9e2cf', tiang, { amp: 0.4 });
  const layar = el('g', {}, tiang);
  const layarUtuh = kertas(L([[-2, -404], [150, -120], [-2, -110]]), '#fffdf5', layar, { amp: 1.2 });
  const layarSobek = el('g', {}, layar);
  kertas(L([[-2, -404], [70, -270], [40, -250], [90, -200], [-2, -190]]), '#f3efe2', layarSobek, { amp: 1.4 });
  kertas(L([[30, -180], [150, -120], [-2, -110], [-2, -150], [40, -160]]), '#f3efe2', layarSobek, { amp: 1.4 });
  const bendera = el('g', {}, tiang);
  kertas(L(kotak(-2, -420, 62, 16)), '#e63946', bendera, { amp: 0.5 });
  kertas(L(kotak(-2, -404, 62, 16)), '#fefcf3', bendera, { amp: 0.5 });
  // kabin
  kertas(L(kotak(-190, -130, 150, 90)), '#f4ecd8', lambung);
  kertas(L(kotak(-200, -144, 170, 18)), '#2a9d8f', lambung);
  for (const wx of [-176, -136, -96]) kertas(L(kotak(wx, -116, 26, 24)), '#264653', lambung, { amp: 0.5 });
  const awak = el('g', {}, g);            // tokoh berdiri di geladak, di balik pagar
  const depan = el('g', { filter: 'url(#b2)' }, g);
  // lambung
  kertas(L([[-300, -46], [300, -46], [250, 26], [-262, 26]]), '#1d4f8f', depan);
  kertas(L([[-304, -54], [304, -54], [300, -44], [-298, -44]]), '#e63946', depan, { amp: 0.6 });
  kertas(L([[-286, -26], [286, -26], [280, -18], [-280, -18]]), '#f1faee', depan, { amp: 0.6 });
  if (o.nama) teks(lambung, 150 * s, -2 * s, o.nama, { bebas: true, ukuran: 30 * s, warna: '#f1faee', jangkar: 'middle', spasi: 2 });
  // pagar geladak
  for (let x = -280; x <= 280; x += 40) kertas(L(kotak(x, -82, 5, 30)), '#e9e2cf', depan, { amp: 0.2 });
  kertas(L(kotak(-290, -86, 580, 6)), '#e9e2cf', depan, { amp: 0.3 });
  g.awak = awak; g.depan = depan;
  g.lambung = lambung; g.layarUtuh = layarUtuh; g.layarSobek = layarSobek; g.bendera = bendera; g.tiang = tiang;
  g.sobek = (ya) => { tampil(layarUtuh, !ya); tampil(layarSobek, ya); };
  g.sobek(false);
  return g;
}

// ── dermaga kayu ──────────────────────────────────────────────────────────
function dermaga(induk, x0, x1, y = 742) {
  const g = el('g', { filter: 'url(#b2)' }, induk);
  for (let x = x0 + 40; x <= x1 - 20; x += 190) kertas(kotak(x, y + 26, 24, 340), '#6b4226', g, { amp: 0.8 });
  kertas([[x0, y], [x1, y], [x1, y + 30], [x0, y + 30]], 'url(#kayu)', g, { amp: 1 });
  kertas([[x0, y + 28], [x1, y + 28], [x1, y + 48], [x0, y + 48]], '#7a5230', g, { amp: 1 });
  for (let x = x0 + 20; x < x1; x += 64) kertas(kotak(x, y + 4, 3, 22), '#7a5230', g, { amp: 0.3 });
  return g;
}
// ── panggung dermaga siap pakai (babak di pelabuhan) ──────────────────────
function panggungDermaga(akar, o = {}) {
  const lp = [0, 0.1, 0.3, 0.55, 0.8, 1, 1.12].map((v) => lapisan(akar, v));
  langit(lp[0], o.langit ?? 'Pagi');
  const mt = matahari(lp[1], o.mx ?? 1520, o.my ?? 180, o.matahari);
  const awan = [[150, 170, 1], [700, 120, 0.8], [1160, 250, 0.7], [1900, 150, 1.05], [2500, 220, 0.9]].map(([x, y, s]) => awanKertas(lp[1], x, y, s, o.warnaAwan));
  const mc = mercusuar(lp[2], -560, 560, 0.62);
  kotaMeulaboh(lp[2], { y: 600 });
  const lt = laut(akar, { lapis: [lp[3], lp[4], lp[6]], y: [612, 700, 960] });
  const perahu = [[300, 0.9, '#c8553d'], [1250, 0.75, '#2a9d8f'], [2000, 0.8, '#e9b949']].map(([x, s, w]) => { const g = perahuNelayan(lp[3], s, w); g._x = x; return g; });
  const kapal = o.kapal === false ? null : kapalAwak(lp[4], { s: 0.85, nama: 'ACEH BARAT' });
  dermaga(lp[5], -900, 2900, 742);
  if (o.kantor !== false) kantorSyahbandar(lp[5], o.kantorX ?? -40, 742);
  const p = { lp, mt, lt, kapal };
  p.perbarui = (t, kamr) => {
    const tq = tStop(t), l = langkahDari(t);
    kamera(lp, kamr);
    mt.perbarui(tq, l);
    awan.forEach((g, i) => atur(g, `translate(${f1(tq * 9 * (1 + (i % 2)))} 0) ${getar(810 + i, l, g._x, g._y)}`));
    mc.perbarui(tq, l, 1);
    lt.perbarui(tq, o.kuat ?? 0);
    perahu.forEach((g, i) => { const x = g._x + Math.sin(tq * 0.3 + i) * 30; atur(g, `translate(${f1(x)} ${f1(612 + 7 * Math.sin(x * 0.02 + tq * 2.2) + 4)}) rotate(${f2(Math.sin(tq * 2 + i) * 4)})`); });
    if (kapal) { atur(kapal, `translate(${o.kapalX ?? 1980} ${f1(lt.fTengah(o.kapalX ?? 1980, tq) + 28)}) rotate(${f2(Math.sin(tq * 1.4) * 1.2)})`); atur(kapal.bendera, `skewY(${l % 2 ? 4 : -3})`); }
  };
  return p;
}

// ── kantor syahbandar ─────────────────────────────────────────────────────
function kantorSyahbandar(induk, x, y = 742) {
  const g = el('g', { filter: 'url(#b2)' }, induk);
  kertas(kotak(x, y - 300, 380, 300), '#f4ecd8', g);
  kertas([[x - 30, y - 300], [x + 190, y - 400], [x + 410, y - 300]], '#bc4749', g);
  kertas(kotak(x + 140, y - 170, 100, 170), '#7a5230', g);
  kertas(oval(x + 225, y - 85, 6, 6, 10), '#f2c46b', g, { amp: 0.2 });
  for (const wx of [x + 30, x + 270]) { kertas(kotak(wx, y - 230, 80, 70), '#264653', g, { amp: 0.5 }); kertas(kotak(wx + 38, y - 230, 4, 70), '#f4ecd8', g, { amp: 0.2 }); }
  kertas(kotak(x + 60, y - 290, 260, 46, 4), '#1d3557', g, { amp: 0.6 });
  teks(g, x + 190, y - 257, 'SYAHBANDAR', { bebas: true, ukuran: 34, warna: '#f2c46b', jangkar: 'middle', spasi: 3 });
  return g;
}

// ── mercusuar (asal = dasar menara) ───────────────────────────────────────
function mercusuar(induk, x, y, s = 1) {
  const g = el('g', {}, induk);
  const sorot = el('g', { opacity: 0.5 }, g);
  kertas([[x, y - 254 * s], [x + 900 * s, y - 330 * s], [x + 900 * s, y - 170 * s]], '#fff3b0', sorot, { amp: 0.8 });
  const m = el('g', { filter: 'url(#b2)' }, g);
  kertas([[x - 135 * s, y + 50 * s], [x - 85 * s, y], [x + 5 * s, y - 12 * s], [x + 85 * s, y + 6 * s], [x + 135 * s, y + 50 * s]], '#7d8491', m);
  for (let i = 0; i < 6; i++) {
    const y0 = y - i * 34 * s, y1 = y0 - 34 * s, w0 = (34 - i * 3.2) * s, w1 = (34 - (i + 1) * 3.2) * s;
    kertas([[x - w0, y0], [x + w0, y0], [x + w1, y1], [x - w1, y1]], i % 2 ? '#f1faee' : '#e63946', m, { amp: 0.7 });
  }
  kertas(kotak(x - 23 * s, y - 228 * s, 46 * s, 20 * s), '#1d3557', m);
  const lampu = kertas(kotak(x - 17 * s, y - 260 * s, 34 * s, 32 * s, 4 * s), '#ffd166', m);
  kertas([[x - 25 * s, y - 258 * s], [x, y - 284 * s], [x + 25 * s, y - 258 * s]], '#1d3557', m);
  g.perbarui = (tq, l, nyala = 1) => {
    lampu.setAttribute('fill', nyala > 0.5 && l % 6 < 3 ? '#ffd166' : nyala > 0.5 ? '#fff3b0' : '#b9a46a');
    sorot.setAttribute('opacity', (0.5 * nyala).toFixed(2));
    atur(sorot, `rotate(${(Math.sin(tq * 1.6) * 14).toFixed(1)} ${x} ${y - 244 * s})`);
  };
  g._x = x; g._y = y;
  return g;
}
// ── kapal patroli (menghadap kanan) ───────────────────────────────────────
function kapalPatroli(induk, o = {}) {
  const g = el('g', { filter: 'url(#b2)' }, induk);
  const s = o.s ?? 1;
  const L = (pts) => pts.map(([x, y]) => [x * s, y * s]);
  kertas(L([[-170, -40], [190, -40], [150, 18], [-150, 18]]), '#f8fafc', g);
  kertas(L([[-172, -18], [178, -18], [170, -6], [-166, -6]]), '#f28c28', g, { amp: 0.5 });
  kertas(L(kotak(-90, -110, 130, 70)), '#e2e8f0', g);
  for (const wx of [-78, -40, 0]) kertas(L(kotak(wx, -96, 28, 22)), '#1e3a5f', g, { amp: 0.4 });
  kertas(L(kotak(-40, -150, 8, 40)), '#94a3b8', g, { amp: 0.2 });
  const lampu = kertas(L(kotak(-48, -164, 24, 14, 4)), '#3b82f6', g, { amp: 0.2 });
  teks(g, 60 * s, -48 * s, 'PATROLI', { bebas: true, ukuran: 26 * s, warna: '#1e3a5f', jangkar: 'middle', spasi: 2 });
  g.perbarui = (tq, l) => lampu.setAttribute('fill', l % 4 < 2 ? '#3b82f6' : '#ef4444');
  return g;
}
// ── pelampung bernomor ────────────────────────────────────────────────────
function pelampung(induk, x, y, n, o = {}) {
  const g = el('g', { filter: 'url(#b2)' }, induk);
  kertas([[x - 34, y], [x + 34, y], [x + 24, y - 90], [x - 24, y - 90]], o.warna ?? '#e63946', g);
  kertas(kotak(x - 30, y - 60, 60, 16), '#fffdf5', g, { amp: 0.4 });
  kertas([[x - 8, y - 90], [x + 8, y - 90], [x + 4, y - 130], [x - 4, y - 130]], '#334155', g, { amp: 0.3 });
  const lampu = kertas(oval(x, y - 138, 11, 11, 14), '#fde68a', g, { amp: 0.3 });
  kertas(oval(x, y - 30, 22, 22, 24), '#fffdf5', g, { amp: 0.4 });
  teks(g, x, y - 18, String(n), { bebas: true, ukuran: 34, warna: '#1d3557', jangkar: 'middle' });
  g._x = x; g._y = y; g.lampu = lampu;
  return g;
}
// ── papan gabus di atas kaki-kaki kayu ────────────────────────────────────
function papanGabus(induk, x, y, w, hgt, o = {}) {
  const g = el('g', { filter: 'url(#b3)' }, induk);
  if (o.kaki !== false) { kertas(kotak(x + 40, y + hgt - 10, 22, 120), '#6b4226', g); kertas(kotak(x + w - 62, y + hgt - 10, 22, 120), '#6b4226', g); }
  kertas(kotak(x - 14, y - 14, w + 28, hgt + 28, 8), '#7a5230', g);
  kertas(kotak(x, y, w, hgt, 4), 'url(#gabus)', g);
  return g;
}
// ── simbol jabatan ────────────────────────────────────────────────────────
/** Kepala Daerah: topi nakhoda bersulam emas di atas kemudi kapal. */
function simbolKepalaDaerah(induk, x, y, s = 1) {
  const g = el('g', {}, induk);
  const pendar = el('circle', { cx: x, cy: y - 40 * s, r: 210 * s, fill: 'url(#cahayaLampu)', opacity: 0 }, g);
  const kemudi = el('g', { filter: 'url(#b2)' }, g);
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    kertas([[x + Math.cos(a) * 20 * s, y + Math.sin(a) * 20 * s], [x + Math.cos(a) * 150 * s - Math.sin(a) * 8 * s, y + Math.sin(a) * 150 * s + Math.cos(a) * 8 * s],
      [x + Math.cos(a) * 150 * s + Math.sin(a) * 8 * s, y + Math.sin(a) * 150 * s - Math.cos(a) * 8 * s]], '#8a5a2b', kemudi, { amp: 0.4 });
    kertas(oval(x + Math.cos(a) * 156 * s, y + Math.sin(a) * 156 * s, 13 * s, 13 * s, 14), '#a0703f', kemudi, { amp: 0.4 });
  }
  const cincin = [...oval(x, y, 118 * s, 118 * s, 60), ...oval(x, y, 94 * s, 94 * s, 60).reverse()];
  kertas(cincin, '#a0703f', kemudi, { amp: 0.6 });
  kertas(oval(x, y, 30 * s, 30 * s, 24), '#c9a46c', kemudi, { amp: 0.4 });
  const topi = el('g', { filter: 'url(#b3)' }, g);
  const ty = y - 150 * s;
  kertas([[x - 96 * s, ty + 30 * s], [x - 106 * s, ty - 20 * s], [x - 70 * s, ty - 48 * s], [x + 70 * s, ty - 48 * s], [x + 106 * s, ty - 20 * s], [x + 96 * s, ty + 30 * s]], '#fbfaf6', topi);
  kertas(kotak(x - 92 * s, ty + 8 * s, 184 * s, 26 * s), '#1d3557', topi, { amp: 0.5 });
  kertas([[x - 96 * s, ty + 32 * s], [x + 96 * s, ty + 32 * s], [x + 76 * s, ty + 58 * s], [x - 76 * s, ty + 58 * s]], '#101318', topi, { amp: 0.5 });
  for (let k = -3; k <= 3; k++) kertas([[x + k * 22 * s - 10 * s, ty + 46 * s], [x + k * 22 * s, ty + 40 * s], [x + k * 22 * s + 10 * s, ty + 46 * s], [x + k * 22 * s, ty + 52 * s]], '#e9b949', topi, { amp: 0.2 });
  kertas(oval(x, ty - 14 * s, 22 * s, 22 * s, 18), '#e9b949', topi, { amp: 0.4 });
  kertas(bintang(x, ty - 14 * s, 14 * s, 6 * s), '#fff3b0', topi, { amp: 0.2 });
  g.kemudi = kemudi; g.topi = topi; g.pendar = pendar; g._x = x; g._y = y;
  g.perbarui = (tq, nyala) => { pendar.setAttribute('opacity', (0.85 * nyala).toFixed(2)); atur(kemudi, `rotate(${(Math.sin(tq * 0.7) * 6).toFixed(1)} ${x} ${y})`); };
  return g;
}
/** Sekretaris Daerah: kompas besar anjungan; jarum menyatukan arah. */
function simbolSekda(induk, x, y, s = 1) {
  const g = el('g', {}, induk);
  const pendar = el('circle', { cx: x, cy: y, r: 190 * s, fill: 'url(#cahayaLampu)', opacity: 0 }, g);
  const badan = el('g', { filter: 'url(#b3)' }, g);
  kertas(oval(x, y, 140 * s, 140 * s, 60), '#a0703f', badan, { amp: 0.7 });
  kertas(oval(x, y, 122 * s, 122 * s, 60), '#fdf6e3', badan, { amp: 0.6 });
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * Math.PI * 2, r0 = (k % 4 ? 104 : 92) * s;
    kertas([[x + Math.cos(a) * r0, y + Math.sin(a) * r0], [x + Math.cos(a) * 118 * s, y + Math.sin(a) * 118 * s], [x + Math.cos(a + 0.03) * 118 * s, y + Math.sin(a + 0.03) * 118 * s]], '#1d3557', badan, { amp: 0.1 });
  }
  for (const [hrf, a] of [['U', -Math.PI / 2], ['T', 0], ['S', Math.PI / 2], ['B', Math.PI]]) teks(badan, x + Math.cos(a) * 74 * s, y + Math.sin(a) * 74 * s + 12 * s, hrf, { bebas: true, ukuran: 36 * s, warna: '#1d3557', jangkar: 'middle' });
  const jarum = el('g', {}, g);
  kertas([[x, y - 96 * s], [x + 16 * s, y], [x, y + 8 * s], [x - 16 * s, y]], '#e63946', jarum, { amp: 0.3, attr: { filter: 'url(#bt)' } });
  kertas([[x, y + 96 * s], [x + 16 * s, y], [x, y - 8 * s], [x - 16 * s, y]], '#1d3557', jarum, { amp: 0.3, attr: { filter: 'url(#bt)' } });
  kertas(oval(x, y, 12 * s, 12 * s, 14), '#e9b949', g, { amp: 0.2 });
  g.jarum = jarum; g.pendar = pendar; g._x = x; g._y = y;
  g.perbarui = (tq, nyala, sudut) => { pendar.setAttribute('opacity', (0.85 * nyala).toFixed(2)); atur(jarum, `rotate(${f1(sudut)} ${x} ${y})`); };
  return g;
}

// ── hujan, kilat besar, pelangi ───────────────────────────────────────────
function hujan(induk, o = {}) {
  const g = el('g', { opacity: o.opasitas ?? 0.55 }, induk);
  const garis = Array.from({ length: o.jumlah ?? 140 }, (_, i) => el('path', { stroke: '#cbd5e1', 'stroke-width': 2.2, 'stroke-linecap': 'round' }, g));
  g.perbarui = (tq, l, kuat = 1) => {
    tampil(g, kuat > 0.02);
    garis.forEach((p, i) => {
      const x = (h(i * 3.1) * 2600 - 300 + l * 37 * (1 + h(i)) ) % 2600 - 300, y = (h(i * 7.7) * 1300 + l * 91 * (0.8 + h(i * 2))) % 1300 - 120;
      p.setAttribute('d', `M${f1(x)} ${f1(y)} l${f1(-14 * kuat)} ${f1(46 * kuat)}`);
    });
  };
  return g;
}
function kilatBesar(induk, x, y, s = 1) {
  return kertas([[x, y], [x - 60 * s, y + 210 * s], [x - 8 * s, y + 200 * s], [x - 70 * s, y + 420 * s], [x + 60 * s, y + 170 * s], [x + 6 * s, y + 182 * s], [x + 50 * s, y]], '#f2c46b', induk, { amp: 1.2, attr: { filter: 'url(#b2)' } });
}
function pelangi(induk, x, y, r) {
  const g = el('g', { filter: 'url(#b2)' }, induk);
  const warna = ['#e63946', '#f4a261', '#e9c46a', '#2a9d8f', '#457b9d', '#6a4c93'];
  warna.forEach((w, i) => {
    const r0 = r - i * 26, r1 = r0 - 26;
    const luar = Array.from({ length: 41 }, (_, k) => { const a = Math.PI + (k / 40) * Math.PI; return [x + Math.cos(a) * r0, y + Math.sin(a) * r0]; });
    const dalam = Array.from({ length: 41 }, (_, k) => { const a = 2 * Math.PI - (k / 40) * Math.PI; return [x + Math.cos(a) * r1, y + Math.sin(a) * r1]; });
    kertas([...luar, ...dalam], w, g, { amp: 0.9, langkah: 14 });
  });
  return g;
}
// ── gulungan kertas (definisi, peta) ──────────────────────────────────────
function gulungan(induk, x, y, w, hgt) {
  const g = el('g', {}, induk);
  const id = 'gl' + fotoId++;
  const cp = el('clipPath', { id }, g);
  const potong = el('rect', { x, y, width: w, height: 0 }, cp);
  const isi = el('g', { 'clip-path': `url(#${id})` }, g);
  kertas(kotak(x, y, w, hgt, 4), 'url(#kertasLama)', isi, { amp: 1.1, attr: { filter: 'url(#b2)' } });
  const atas = el('g', { filter: 'url(#b2)' }, g), bawah = el('g', { filter: 'url(#b2)' }, g);
  kertas(kotak(x - 16, y - 20, w + 32, 30, 14), 'url(#gulung)', atas, { amp: 0.6 });
  kertas(kotak(x - 16, -12, w + 32, 30, 14), 'url(#gulung)', bawah, { amp: 0.6 });
  g.isi = isi;
  g.buka = (u) => { potong.setAttribute('height', f1(hgt * u)); atur(bawah, `translate(0 ${f1(y + hgt * u)})`); };
  g.buka(0);
  return g;
}
// ── dokumen kertas berjudul ───────────────────────────────────────────────
function dokumen(induk, x, y, w, hgt, judul, o = {}) {
  const g = el('g', { filter: 'url(#b2)' }, induk);
  kertas(kotak(x, y, w, hgt, 3), o.warna ?? '#fffdf7', g, { amp: 0.9 });
  if (o.pita) kertas(kotak(x, y, w, 14), o.pita, g, { amp: 0.4 });
  teks(g, x + w / 2, y + 44, judul, { bebas: true, ukuran: o.ukuran ?? 34, warna: o.warnaJudul ?? '#1d3557', jangkar: 'middle', spasi: 1 });
  const n = o.baris ?? Math.floor((hgt - 80) / 22);
  for (let k = 0; k < n; k++) kertas(kotak(x + 22, y + 70 + k * 22, (w - 44) * (k % 3 === 2 ? 0.62 : 1), 5), '#c7cfdb', g, { amp: 0.1 });
  g._cx = x + w / 2; g._cy = y + hgt / 2;
  return g;
}
// ── matriks 5x5 Perdep (bukan perkalian) ──────────────────────────────────
const MATRIKS = { 1: [1, 2, 4, 6, 9], 2: [3, 7, 10, 12, 15], 3: [5, 11, 14, 16, 18], 4: [8, 13, 17, 19, 23], 5: [20, 21, 22, 24, 25] };
const WARNA_LEVEL = (v) => (v >= 20 ? '#ef4444' : v >= 16 ? '#fb923c' : v >= 11 ? '#fde047' : v >= 6 ? '#4ade80' : '#38bdf8');
/** Matriks: sumbu X = Dampak 1..5, sumbu Y = Kemungkinan 1..5 (5 di atas). */
function matriksPapan(induk, x, y, sel = 88, o = {}) {
  const g = el('g', {}, induk);
  kertas(kotak(x - 70, y - 70, sel * 5 + 110, sel * 5 + 150, 8), '#fffdf7', g, { amp: 0.9, attr: { filter: 'url(#b2)' } });
  const ubin = {};
  for (let d = 1; d <= 5; d++) for (let k = 1; k <= 5; k++) {
    const v = MATRIKS[d][k - 1];
    const cx = x + (d - 1) * sel, cy = y + (5 - k) * sel;
    const c = el('g', {}, g);
    kertas(kotak(cx + 3, cy + 3, sel - 6, sel - 6, 6), WARNA_LEVEL(v), c, { amp: 0.6 });
    teks(c, cx + sel / 2, cy + sel / 2 + 14, String(v), { bebas: true, ukuran: 40, warna: '#1d3557', jangkar: 'middle' });
    c._cx = cx + sel / 2; c._cy = cy + sel / 2; c._v = v;
    ubin[`${d},${k}`] = c;
  }
  for (let d = 1; d <= 5; d++) teks(g, x + (d - 0.5) * sel, y + 5 * sel + 34, String(d), { bebas: true, ukuran: 30, warna: '#475569', jangkar: 'middle' });
  for (let k = 1; k <= 5; k++) teks(g, x - 26, y + (5 - k + 0.5) * sel + 11, String(k), { bebas: true, ukuran: 30, warna: '#475569', jangkar: 'middle' });
  teks(g, x + 2.5 * sel, y + 5 * sel + 66, 'DAMPAK', { bebas: true, ukuran: 30, warna: '#1d3557', jangkar: 'middle', spasi: 3 });
  teks(g, x - 50, y + 2.5 * sel, 'KEMUNGKINAN', { bebas: true, ukuran: 30, warna: '#1d3557', jangkar: 'middle', spasi: 3, attr: { transform: `rotate(-90 ${x - 50} ${y + 2.5 * sel})` } });
  g.ubin = ubin; g._sel = sel; g._x = x; g._y = y;
  return g;
}
