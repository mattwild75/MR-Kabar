// ═══════════════════════════════════════════════════════════════════════════
// BABAK 9 · Buku harian kapal & lonceng (dermaga sore)
// ═══════════════════════════════════════════════════════════════════════════
function kodeQR(induk, x, y, ukuran) {
  const g = el('g', {}, induk);
  const n = 21, s = ukuran / n, r = acak(2026);
  el('rect', { x: x - 10, y: y - 10, width: ukuran + 20, height: ukuran + 20, fill: '#fff' }, g);
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const sudut = (i < 7 && j < 7) || (i > 13 && j < 7) || (i < 7 && j > 13);
    let isi = r() < 0.48;
    if (sudut) { const a = i > 13 ? i - 14 : i, b = j > 13 ? j - 14 : j; isi = a === 0 || a === 6 || b === 0 || b === 6 || (a >= 2 && a <= 4 && b >= 2 && b <= 4); }
    if (isi) el('rect', { x: x + i * s, y: y + j * s, width: s + 0.4, height: s + 0.4, fill: '#111827' }, g);
  }
  return g;
}

window.ADEGAN.s10 = (akar, info) => {
  const L = {
    folder: B('Pelampung keempat'), form8: B('Form 8 mencatat'), cetak: B('Form Cetak MR Kabar'), harian: B('Pelampung kelima'),
    udin: B('Pak! Atap gudang'), qr: B('Tidak perlu akun'), sampai: B('Laporannya langsung sampai'), sengaja: B('Kalau ada yang sengaja'),
    niat: B('Itu lain soal'), pintu: B('Untuk itu ada pintu'), tiket: B('Layar menampilkan nomor tiket'), segitiga: B('Menurut segitiga'), grat: B('Hadiah karena jabatan'),
  };
  const pg = panggungDermaga(akar, { langit: 'Sore', kapalX: 2250, matahari: { warna: '#f59e0b', dalam: '#fbbf24' } });
  const d = pg.lp[5];
  papanGabus(d, 1250, 140, 640, 510);
  const syah = boneka('syahbandar', d, { x: 560, y: 742 });
  const ardi = boneka('ardi', d, { x: 770, y: 742 });
  const gadis = boneka('gadis', d, { x: 980, y: 742 });
  const udin = boneka('udin', d, { x: 330, y: 742 });
  const mercu = boneka('mercusuar', d, { x: 1170, y: 742 });
  // poster QR di dinding kantor
  const posterQR = el('g', { filter: 'url(#b2)' }, d);
  kertas(kotak(20, 450, 190, 250, 6), '#fffdf5', posterQR, { amp: 0.8 });
  kertas(kotak(20, 450, 190, 48, 6), '#e63946', posterQR, { amp: 0.4 });
  teks(posterQR, 115, 486, 'LAPOR', { bebas: true, ukuran: 38, warna: '#fdf6e3', jangkar: 'middle', spasi: 3 });
  kodeQR(posterQR, 50, 512, 130);
  teks(posterQR, 115, 684, 'MR KABAR', { bebas: true, ukuran: 26, warna: '#1d3557', jangkar: 'middle' });
  const tetesAtap = Array.from({ length: 7 }, () => kertas([[0, 0], [5, 10], [0, 15], [-5, 10]], '#60a5fa', d, { amp: 0.2 }));
  // isi papan (x 1264..1876, y 154..636)
  const P0 = el('g', {}, d);
  const map = el('g', { filter: 'url(#b3)' }, P0);
  kertas([[1300, 260], [1420, 260], [1440, 236], [1560, 236], [1560, 560], [1300, 560]], '#f2c46b', map, { amp: 1 });
  for (let k = 0; k < 4; k++) kertas(kotak(1320 + k * 8, 290 - k * 6, 200, 250), '#fffdf7', map, { amp: 0.6 });
  map._x = 1430; map._y = 400;
  const keluarKertas = Array.from({ length: 5 }, (_, i) => { const g = lembarKerja(P0, 'word', 70, 90); g._i = i; return g; });
  const f8 = kartuAlur(P0, 1280, 170, 580, 'FORM 8 · PENGOMUNIKASIAN', [], '#2a9d8f');
  const T8 = ['MEDIA APA?', 'DARI SIAPA?', 'KEPADA SIAPA?', 'KAPAN?'];
  const tanya8 = T8.map((isi, i) => { const g = el('g', { filter: 'url(#b1)' }, P0); const x = 1290 + (i % 2) * 290, y = 260 + Math.floor(i / 2) * 110; kertas(kotak(x, y, 270, 90, 10), '#fffdf5', g, { amp: 0.7 }); teks(g, x + 135, y + 58, isi, { bebas: true, ukuran: 40, warna: '#1d3557', jangkar: 'middle' }); g._x = x + 135; g._y = y + 45; return g; });
  const tabCetak = tablet(P0, 'aset/layar/form-cetak.png', 1280, 170, 330, 240);
  tabCetak._x = 1445; tabCetak._y = 290;
  const dok14 = Array.from({ length: 14 }, (_, i) => { const g = el('g', { filter: 'url(#b1)' }, P0); kertas(kotak(-28, -36, 56, 72, 3), '#fffdf7', g, { amp: 0.4 }); kertas(kotak(-28, -36, 56, 10), ['#1d3557', '#2a9d8f', '#e63946'][i % 3], g, { amp: 0.2 }); teks(g, 0, 12, String(i + 1), { bebas: true, ukuran: 26, warna: '#1d3557', jangkar: 'middle' }); return g; });
  const lb14 = labelPapan(P0, 1300, 520, '14 DOKUMEN RESMI + BAGAN', 'siap tanda tangan', { lebar: 560, aksen: '#e63946', ukuran: 40 });
  // buku harian kapal: Form 9 | Form 10
  const buku = el('g', { filter: 'url(#b3)' }, P0);
  kertas(kotak(1280, 180, 580, 420, 10), '#7a5230', buku, { amp: 1 });
  kertas(kotak(1296, 194, 270, 392, 6), 'url(#garisBuku)', buku, { amp: 0.6 });
  kertas(kotak(1574, 194, 270, 392, 6), 'url(#garisBuku)', buku, { amp: 0.6 });
  teks(buku, 1431, 250, 'FORM 9', { bebas: true, ukuran: 54, warna: '#2a9d8f', jangkar: 'middle' });
  teksBaris(buku, 1431, 300, 'pemantauan & realisasi', { ukuran: 24, tebal: 800, warna: '#1d3557', jangkar: 'middle', maks: 14, jarak: 28 });
  const skAkt = labelPapan(buku, 1316, 410, 'SKALA AKTUAL', '', { lebar: 230, aksen: '#4ade80', ukuran: 32 });
  teks(buku, 1709, 250, 'FORM 10', { bebas: true, ukuran: 54, warna: '#e63946', jangkar: 'middle' });
  teksBaris(buku, 1709, 300, 'kejadian risiko', { ukuran: 24, tebal: 800, warna: '#1d3557', jangkar: 'middle', maks: 14, jarak: 28 });
  const stSudah = stempel(buku, 1709, 450, 'SUDAH TERJADI', { ukuran: 38 });
  buku._x = 1570; buku._y = 390;
  // lapor lewat QR: ponsel + langkah + kiriman
  const ponsel = el('g', { filter: 'url(#b3)' }, d);
  kertas(kotak(-60, -110, 120, 220, 18), '#1e293b', ponsel, { amp: 0.6 });
  const idp = 'ponselLayar';
  const cpp = el('clipPath', { id: idp }, ponsel);
  el('rect', { x: -50, y: -96, width: 100, height: 192, rx: 8 }, cpp);
  el('image', { href: 'aset/layar/lapor-ponsel.png', x: -50, y: -96, width: 100, height: 192, preserveAspectRatio: 'xMidYMin slice', 'clip-path': `url(#${idp})` }, ponsel);
  const langkahQR = ['NAMA LENGKAP', 'PERANGKAT DAERAH', 'CERITAKAN KEJADIAN'].map((isi, i) => labelPapan(P0, 1290, 190 + i * 100, (i + 1) + '. ' + isi, '', { lebar: 560, aksen: '#e63946', ukuran: 44 }));
  const tujuanQR = [['ADMIN', 1400], ['PERANGKAT DAERAH', 1700]].map(([isi, x]) => { const g = el('g', {}, P0); ikonKertas(g, x, 540, 'centang', '#2a9d8f', 40); teks(g, x, 610, isi, { bebas: true, ukuran: 32, warna: '#1d3557', jangkar: 'middle' }); g._x = x; g._y = 560; return g; });
  const amplop = [0, 1].map(() => { const g = el('g', { filter: 'url(#bt)' }, d); kertas(kotak(-30, -20, 60, 40, 3), '#fdf6e3', g, { amp: 0.4 }); kertas([[-30, -20], [0, 4], [30, -20]], '#e9d8b0', g, { amp: 0.3 }); return g; });
  // dua pintu
  const pintu = el('g', {}, P0);
  const PT = [['KEJADIAN RISIKO', 'tanpa niat', '#2a9d8f', 1300], ['DUGAAN KECURANGAN', 'ada niat', '#9d0208', 1590]];
  const daun = PT.map(([j, s, w, x]) => {
    const g = el('g', { filter: 'url(#b2)' }, pintu);
    kertas(kotak(x, 190, 270, 400, 8), '#5e3a1f', g, { amp: 0.8 });
    const dp = el('g', {}, g);
    kertas(kotak(x + 14, 204, 242, 372, 6), w, dp, { amp: 0.8 });
    teksBaris(dp, x + 135, 300, j, { bebas: true, ukuran: 44, warna: '#fdf6e3', jangkar: 'middle', maks: 10, jarak: 44 });
    teks(dp, x + 135, 420, s, { ukuran: 28, tebal: 800, warna: '#fdf6e3', jangkar: 'middle' });
    kertas(oval(x + 226, 400, 10, 10, 12), '#f2c46b', dp, { amp: 0.2 });
    g._x = x + 135; g._y = 390; g._dp = dp; g._px = x + 14;
    return g;
  });
  const contohKR = ['petir · server', 'atap bocor'].map((isi, i) => labelPapan(pintu, 1300, 600 + i * 0, isi, '', { lebar: 0 }));
  contohKR.forEach((g) => tampil(g, false));
  const ikonKR = el('g', {}, pintu);
  kertas([[1380, 470], [1360, 520], [1374, 518], [1356, 560], [1396, 506], [1382, 508], [1398, 470]], '#f2c46b', ikonKR, { amp: 0.4 });
  kertas(kotak(1420, 480, 70, 80, 4), '#cbd5e1', ikonKR, { amp: 0.3 });
  for (let k = 0; k < 3; k++) kertas(kotak(1430, 492 + k * 22, 50, 10), '#475569', ikonKR, { amp: 0.1 });
  const tanpaNama = labelPapan(pintu, 1580, 600, 'BOLEH TANPA NAMA', '', { lebar: 300, aksen: '#1d3557', ukuran: 34 });
  // tiket & kode akses
  const tiket = el('g', {}, P0);
  const tk = el('g', { filter: 'url(#b3)' }, tiket);
  kertas(kotak(1290, 200, 570, 260, 14), '#fde68a', tk, { amp: 1 });
  for (let k = 0; k < 9; k++) kertas(oval(1290, 220 + k * 28, 8, 8, 10), '#d6a46c', tk, { amp: 0.1 });
  teks(tk, 1575, 262, 'NOMOR TIKET', { bebas: true, ukuran: 46, warna: '#1d3557', jangkar: 'middle', spasi: 2 });
  teks(tk, 1575, 318, 'KCR-XXXX-XXXX', { mono: true, ukuran: 40, tebal: 700, warna: '#9d0208', jangkar: 'middle' });
  teks(tk, 1575, 380, 'KODE AKSES', { bebas: true, ukuran: 46, warna: '#1d3557', jangkar: 'middle', spasi: 2 });
  teks(tk, 1575, 432, '•  •  •  •  •  •  •  •', { ukuran: 40, tebal: 800, warna: '#9d0208', jangkar: 'middle' });
  tk._x = 1575; tk._y = 330;
  const stSekali = stempel(tiket, 1575, 540, 'HANYA MUNCUL SEKALI', { ukuran: 44 });
  // segitiga kecurangan
  const segi = el('g', {}, P0);
  const A = [1570, 200], Bk = [1310, 600], Ck = [1830, 600];
  const sisi = [[A, Bk, 'TEKANAN'], [Bk, Ck, 'KESEMPATAN'], [Ck, A, 'RASIONALISASI']].map(([p, q, isi], i) => {
    const g = el('g', { filter: 'url(#b2)' }, segi);
    const nx = -(q[1] - p[1]), ny = q[0] - p[0], n = Math.hypot(nx, ny);
    const o = [nx / n * 34, ny / n * 34];
    kertas([[p[0], p[1]], [q[0], q[1]], [q[0] + o[0], q[1] + o[1]], [p[0] + o[0], p[1] + o[1]]], ['#f4a261', '#e63946', '#457b9d'][i], g, { amp: 0.6 });
    const mx = (p[0] + q[0]) / 2 + o[0] * (i === 1 ? 2.4 : -1.6), my = (p[1] + q[1]) / 2 + o[1] * (i === 1 ? 2.4 : -1.6);
    teks(g, mx, my + 12, isi, { bebas: true, ukuran: 40, warna: '#1d3557', jangkar: 'middle', attr: { stroke: '#fdf6e3', 'stroke-width': 6, 'paint-order': 'stroke' } });
    g._x = mx; g._y = my;
    return g;
  });
  const gembok = el('g', { filter: 'url(#b3)' }, segi);
  kertas(kotak(1530, 560, 80, 66, 8), '#1d3557', gembok, { amp: 0.5 });
  el('path', { d: 'M1546 560 L1546 538 Q1570 510 1594 538 L1594 560', stroke: '#1d3557', 'stroke-width': 10, fill: 'none' }, gembok);
  gembok._x = 1570; gembok._y = 590;
  const lbTutup = labelPapan(segi, 1380, 420, 'BISA DITUTUP ORGANISASI', '', { lebar: 380, aksen: '#e63946', ukuran: 32 });
  // gratifikasi
  const grat = el('g', {}, P0);
  const ampG = el('g', { filter: 'url(#b3)' }, grat);
  kertas(kotak(1300, 200, 300, 190, 8), '#fdf6e3', ampG, { amp: 1 });
  kertas([[1300, 200], [1450, 310], [1600, 200]], '#efe3c2', ampG, { amp: 0.8 });
  teks(ampG, 1450, 372, '"uang kopi"', { ukuran: 34, tebal: 800, warna: '#9d0208', jangkar: 'middle', attr: { 'font-style': 'italic' } });
  ampG._x = 1450; ampG._y = 295;
  const xAmp = silang(grat, 1450, 295, 80);
  const lbGrat = labelPapan(grat, 1620, 200, 'GRATIFIKASI', 'hadiah karena jabatan', { lebar: 250, aksen: '#9d0208', ukuran: 38 });
  const st30 = stempel(grat, 1580, 520, 'LAPOR KPK · 30 HARI KERJA', { ukuran: 40, warna: '#1f4ea3' });
  // kartu kecil: video Bunyikan Lonceng
  const vidLonceng = el('g', { filter: 'url(#b2)' }, d);
  kertas(kotak(1530, 40, 370, 76, 8), '#1d3557', vidLonceng, { amp: 0.8 });
  teks(vidLonceng, 1715, 72, 'SELENGKAPNYA: VIDEO', { bebas: true, ukuran: 26, warna: '#f2c46b', jangkar: 'middle', spasi: 2 });
  teks(vidLonceng, 1715, 104, 'BUNYIKAN LONCENG', { bebas: true, ukuran: 36, warna: '#fdf6e3', jangkar: 'middle', spasi: 2 });
  vidLonceng._x = 1715; vidLonceng._y = 78;

  // ── waktu
  const tFolder = W(L.folder, 'folder'), t8 = W(L.form8, 'Form'), tT8 = [W(L.form8, 'media'), W(L.form8, 'dari'), W(L.form8, 'kepada'), W(L.form8, 'kapan')];
  const tCetak = W(L.cetak, 'Form'), t14 = W(L.cetak, 'empat'), tBuku = W(L.harian, 'buku'), tAkt = W(L.harian, 'Aktual'), tF10 = W(L.harian, 'sudah');
  const tUdin = L.udin.start - 1.2, tQR = W(L.qr, 'Kiu-Ar'), tLk = [W(L.qr, 'nama'), W(L.qr, 'Perangkat'), W(L.qr, 'ceritakan')];
  const tKirim = W(L.sampai, 'admin'), tKirim2 = W(L.sampai, 'Perangkat');
  const tNiat = W(L.niat, 'tanpa'), tPetir = W(L.niat, 'petir'), tCurang = W(L.niat, 'Kecurangan');
  const tPintu = W(L.pintu, 'Dugaan'), tTanpa = W(L.pintu, 'tanpa'), tTiket = W(L.tiket, 'tiket'), tSekali = W(L.tiket, 'sekali');
  const tSeg = [W(L.segitiga, 'tekanan'), W(L.segitiga, 'kesempatan'), W(L.segitiga, 'rasionalisasi')], tTutup = W(L.segitiga, 'kesempatan', 1);
  const tAmp = W(L.grat, 'Hadiah'), tGrat = W(L.grat, 'gratifikasi'), t30 = W(L.grat, 'tiga');
  bunyi(tFolder, 'kertas', 0.6); bunyi(t8, 'lonceng', 0.5); tT8.forEach((x) => bunyi(x, 'pop', 0.4));
  bunyi(tCetak, 'whoosh', 0.5); dok14.forEach((_, i) => bunyi(t14 + i * 0.06, 'tik', 0.25)); bunyi(tBuku, 'kertas', 0.6); bunyi(tAkt, 'pop', 0.4); bunyi(tF10, 'stempel', 0.6);
  bunyi(tUdin, 'percik', 0.4); bunyi(tQR, 'klik', 0.6); tLk.forEach((x) => bunyi(x, 'pop', 0.45)); bunyi(tKirim, 'whoosh', 0.5); bunyi(tKirim2, 'whoosh', 0.5);
  bunyi(tNiat, 'pop', 0.4); bunyi(tPetir, 'guruh', 0.3); bunyi(tCurang, 'pop', 0.5); bunyi(tPintu, 'desir', 0.5); bunyi(tTanpa, 'pop', 0.4);
  bunyi(tTiket, 'kertas', 0.5); bunyi(tSekali, 'stempel', 0.7); tSeg.forEach((x) => bunyi(x, 'pop', 0.45)); bunyi(tTutup, 'klik', 0.7);
  bunyi(tAmp, 'kertas', 0.5); bunyi(tGrat + 0.4, 'tik', 0.7); bunyi(t30, 'stempel', 0.7); bunyi(L.tiket.start, 'pop', 0.3);
  suasana(info.start, { angin: 0.2, ombak: 0.45, camar: 0.5 });

  const jendela = (t0, t1) => (tq) => tq >= t0 && tq < t1;
  return (t) => {
    const tq = tStop(t), l = langkahDari(t);
    const papanK = { x: 330, y: -60, z: 1.12 };
    pg.perbarui(t, kunciKamera(t, [[info.start, { x: 200, y: -30, z: 1.02 }], [tFolder - 0.4, papanK], [L.udin.start - 1.4, { x: 0, y: 0, z: 1.0 }], [L.sampai.end, { x: 0, y: 0, z: 1.0 }],
      [L.niat.start, papanK], [info.end, papanK]]));
    // folder & kertas keluar
    tampil(map, tq >= L.folder.start + 0.3 && tq < t8 - 0.2);
    lenting(map, tq, L.folder.start + 0.3, t8 - 0.3, l, 1);
    keluarKertas.forEach((g, i) => { const u = E.out(P(tq, tFolder + i * 0.1, 0.8)); tampil(g, tq >= tFolder && tq < t8 - 0.2); atur(g, `translate(${f1(1430 + u * (i - 2) * 90)} ${f1(380 - u * 160 - i * 6)}) rotate(${f1((i - 2) * 14 * u)})`); });
    // Form 8
    tampil(f8, tq >= t8 - 0.1 && tq < tCetak - 0.2); lenting(f8, tq, t8 - 0.1, tCetak - 0.3, l, 2);
    tanya8.forEach((g, i) => lenting(g, tq, tT8[i], tCetak - 0.3, l, 3 + i));
    // Form Cetak 14 dokumen
    lenting(tabCetak, tq, tCetak, tBuku - 0.3, l, 8);
    dok14.forEach((g, i) => { const u = E.back(P(tq, t14 + i * 0.06, 0.35)); tampil(g, tq >= t14 + i * 0.06 && tq < tBuku - 0.2); const x = 1650 + (i % 5) * 46, y = 200 + Math.floor(i / 5) * 92; atur(g, `translate(${f1(lerp(1445, x, u))} ${f1(lerp(290, y + 40, u))}) rotate(${f1((i % 3 - 1) * 6)}) scale(${f2(0.5 + 0.5 * u)})`); });
    lenting(lb14, tq, t14 + 0.6, tBuku - 0.3, l, 9);
    // buku harian
    tampil(buku, tq >= tBuku - 0.1 && tq < L.udin.start - 1.3);
    lenting(buku, tq, tBuku - 0.1, L.udin.start - 1.4, l, 10);
    lenting(skAkt, tq, tAkt, 1e9, l, 11);
    aturStempel(stSudah, tq, tF10, -8);
    // Pak Udin datang dengan map basah; poster QR; ponsel
    const jalan = E.inout(P(tq, tUdin, 1.4));
    const ux = lerp(-260, 330, jalan);
    tampil(udin.akar, tq >= tUdin - 0.1);
    const pindai = tq > tQR - 0.2 && tq < L.sampai.end;
    gerakBoneka(udin, t, { x: ux, lompat: jalan > 0 && jalan < 1 ? 1 : 0, kanan: pindai ? -120 : undefined, lihat: 600 });
    tetesAtap.forEach((p, i) => { const u = ((tq - tUdin) * 1.4 + i / 7) % 1; tampil(p, tq >= tUdin && tq < L.sengaja.start); atur(p, `translate(${f1(60 + i * 45)} ${f1(450 + u * 260)})`); });
    tampil(posterQR, tq >= tUdin - 0.5);
    tampil(ponsel, pindai);
    if (pindai) atur(ponsel, `translate(${f1(ux + 110)} 440) rotate(-8) scale(0.9)`);
    langkahQR.forEach((g, i) => lenting(g, tq, tLk[i], L.sengaja.start - 0.2, l, 12 + i));
    tujuanQR.forEach((g, i) => lenting(g, tq, i ? tKirim2 : tKirim, L.sengaja.start - 0.2, l, 15 + i));
    amplop.forEach((g, i) => { const t0 = i ? tKirim2 : tKirim; const u = E.inout(P(tq, t0 - 0.5, 0.6)); tampil(g, u > 0 && u < 1); atur(g, `translate(${f1(lerp(ux + 110, i ? 1700 : 1400, u))} ${f1(lerp(440, 540, u) - Math.sin(u * Math.PI) * 140)})`); });
    // dua pintu
    tampil(pintu, tq >= tNiat - 0.2 && tq < L.tiket.start);
    daun.forEach((g, i) => { lenting(g, tq, i ? tCurang : tNiat, L.tiket.start - 0.2, l, 20 + i); });
    const sorotPintu = tq > tPintu && tq < L.pintu.end + 0.4 ? 1 + 0.04 * Math.abs(Math.sin(tq * 6)) : 1;
    atur(daun[1]._dp, `translate(${daun[1]._x} 390) scale(${f2(sorotPintu)}) translate(${-daun[1]._x} -390)`);
    lenting(ikonKR, tq, tPetir, L.tiket.start - 0.2, l, 22);
    ikonKR._x = 1420; ikonKR._y = 515;
    lenting(tanpaNama, tq, tTanpa, L.tiket.start - 0.2, l, 23);
    // tiket
    tampil(tiket, tq >= tTiket - 0.2 && tq < L.segitiga.start);
    lenting(tk, tq, tTiket - 0.2, L.segitiga.start - 0.2, l, 24);
    aturStempel(stSekali, tq, tSekali, -6);
    // segitiga & mercusuar
    tampil(segi, tq >= tSeg[0] - 0.4 && tq < L.grat.start);
    sisi.forEach((g, i) => lenting(g, tq, tSeg[i], L.grat.start - 0.2, l, 25 + i));
    lenting(gembok, tq, tTutup, L.grat.start - 0.2, l, 28);
    lenting(lbTutup, tq, tTutup + 0.3, L.grat.start - 0.2, l, 29);
    if (tq >= tTutup) sisi[1].setAttribute('opacity', l % 6 < 3 ? 1 : 0.75);
    const mj = E.out(P(tq, L.segitiga.start - 1.0, 1.0)) * (1 - E.in(P(tq, L.grat.start + 0.3, 0.8)));
    tampil(mercu.akar, mj > 0.01);
    gerakBoneka(mercu, t, { x: lerp(2050, 1170, mj), kiri: 110, lihat: 1500 });
    // gratifikasi
    tampil(grat, tq >= tAmp - 0.1);
    lenting(ampG, tq, tAmp, 1e9, l, 30); tampil(xAmp, tq >= tGrat + 0.4);
    lenting(lbGrat, tq, tGrat, 1e9, l, 31); aturStempel(st30, tq, t30, -5);
    lenting(vidLonceng, tq, L.tiket.start, 1e9, l, 32);
    // tokoh
    const lihat = tq > tFolder ? 1560 : undefined;
    gerakBoneka(syah, t, { lihat: tq > L.udin.start - 1 && tq < L.sampai.start ? 330 : lihat, kanan: (tq > tQR - 0.4 && tq < L.qr.end) ? -60 : (tq > tNiat && tq < L.pintu.end ? -88 + Math.sin(tq * 3) * 4 : undefined) });
    gerakBoneka(ardi, t, { lihat: tq > L.udin.start - 1 && tq < L.sampai.start ? 330 : lihat, kanan: tq > L.sengaja.start && tq < L.sengaja.end ? -120 : undefined });
    gerakBoneka(gadis, t, { lihat: tq > L.udin.start - 1 && tq < L.sampai.start ? 330 : lihat, kanan: (tq > tTiket - 0.2 && tq < L.tiket.end) || (tq > tAmp && tq < L.grat.end) ? -84 : undefined });
  };
};
