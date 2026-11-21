// ═══════════════════════════════════════════════════════════════════════════
// BABAK 7 · Mengukur ombak (geladak, papan gabus)
// alur skala: Existing Control -> tabel kriteria -> Isi Nilai Risiko;
// matriks 5x5 bukan perkalian; lima warna; Selera Risiko; prioritas
// ═══════════════════════════════════════════════════════════════════════════
function kartuAlur(induk, x, y, w, judul, baris, warna) {
  const g = el('g', { filter: 'url(#b2)' }, induk);
  const hgt = 58 + baris.length * 30;
  kertas(kotak(x, y, w, hgt, 8), '#fffdf5', g, { amp: 0.8 });
  kertas(kotak(x, y, w, 44, 8), warna, g, { amp: 0.5 });
  teks(g, x + w / 2, y + 32, judul, { bebas: true, ukuran: 32, warna: '#fdf6e3', jangkar: 'middle', spasi: 1 });
  baris.forEach((b, i) => teks(g, x + 18, y + 74 + i * 30, b, { ukuran: 22, tebal: 800, warna: '#1d3557' }));
  g._x = x + w / 2; g._y = y + hgt / 2;
  return g;
}

window.ADEGAN.s8 = (akar, info) => {
  const L = {
    ukur: B('Langkah ketiga: ukur'), ec: B('Di MR Kabar, isi dulu'), tabel: B('Lalu pilih level'), belum: B('Belum ada pengendalian?'), sudah: B('Sudah ada? Pilihan'),
    kali: B('Matriksnya dampak dikali'), bukan: B('Bukan perkalian'), contoh: B('Dampak lima, kemungkinan satu'), bobot: B('Matriks ini sengaja'),
    warna: B('Hasilnya lima warna'), terima: B('Lalu, sampai mana'), selera: B('Bukan aplikasi yang memutuskan'), atas: B('Di atas garis itu'),
  };
  const pg = panggungGeladak(akar, { tiangX: 40 });
  const d = pg.lp[4];
  const syah = boneka('syahbandar', d, { x: 420, y: 930 });
  const ardi = boneka('ardi', d, { x: 630, y: 930 });
  const gadis = boneka('gadis', d, { x: 840, y: 930 });
  // tiang ukur ombak di laut (lapisan laut tengah)
  const tiang = el('g', { filter: 'url(#b2)' }, d);
  kertas(pitaGelombang(1020, 1860, (x) => 560 + 26 * Math.sin(x * 0.02), 650, 20), '#60a5fa', tiang, { amp: 0.8 });
  kertas(kotak(1180, 170, 22, 470), '#fffdf5', tiang, { amp: 0.4 });
  for (let k = 1; k <= 5; k++) { kertas(kotak(1202, 620 - k * 84, 40, 8), '#e63946', tiang, { amp: 0.2 }); teks(tiang, 1256, 632 - k * 84, String(k), { bebas: true, ukuran: 44, warna: '#1d3557' }); }
  tiang._x = 1190; tiang._y = 420;
  const sumbu = el('g', {}, d);
  const sbD = labelPapan(sumbu, 1390, 330, 'DAMPAK 1-5', '', { lebar: 380, aksen: '#e63946', ukuran: 44 });
  const sbK = labelPapan(sumbu, 1390, 220, 'KEMUNGKINAN 1-5', '', { lebar: 380, aksen: '#457b9d', ukuran: 44 });
  // alur pengisian di MR Kabar
  const alur = el('g', {}, d);
  const tab = tablet(alur, 'aset/layar/existing-control-potong.png', 1010, 150, 470, 330);
  tab._x = 1245; tab._y = 315;
  const pertanyaan = labelPapan(alur, 1500, 160, 'EXISTING CONTROL?', 'sudah ada pengendalian yang berjalan?', { lebar: 370, aksen: '#1d3557', ukuran: 34 });
  const kTidak = kartuAlur(alur, 1500, 270, 370, 'TIDAK', ['pilih dari tabel kriteria', '= INHEREN = RESIDUAL'], '#64748b');
  const kYa = kartuAlur(alur, 1500, 420, 370, 'YA', ['pilih dari tabel = RESIDUAL', 'INHEREN: ISI NILAI RISIKO'], '#2a9d8f');
  const stKetik = stempel(alur, 1245, 560, 'TIDAK ADA ANGKA DIKETIK', { ukuran: 40, warna: '#c1121f' });
  // matriks
  const mx = matriksPapan(d, 1120, 200, 78);
  mx._x = 1315; mx._y = 395;
  const stKali = stempel(d, 1315, 300, 'BUKAN PERKALIAN', { ukuran: 50 });
  const keping = [[5, 1, '20'], [1, 5, '9']].map(([dd, kk, v]) => {
    const g = el('g', { filter: 'url(#b3)' }, d);
    const c = mx.ubin[`${dd},${kk}`];
    kertas(oval(c._cx, c._cy, 34, 34, 24), '#1d3557', g, { amp: 0.6 });
    teks(g, c._cx, c._cy + 13, `D${dd}·K${kk}`, { bebas: true, ukuran: 26, warna: '#fdf6e3', jangkar: 'middle' });
    g._x = c._cx; g._y = c._cy; g._c = c;
    return g;
  });
  const hasil = [['= 20', '#ef4444'], ['= 9', '#22c55e']].map(([isi, w], i) => { const g = el('g', { filter: 'url(#b2)' }, d); const x = 1590, y = 250 + i * 110; kertas(kotak(x, y, 250, 88, 8), w, g, { amp: 0.8 }); teks(g, x + 125, y + 64, (i ? 'D1 × K5 ' : 'D5 × K1 ') + isi, { bebas: true, ukuran: 46, warna: '#fdf6e3', jangkar: 'middle' }); g._x = x + 125; g._y = y + 44; return g; });
  const bobot = labelPapan(d, 1560, 480, 'BOBOT LEBIH PADA DAMPAK', 'kejadian langka berdampak besar = serius', { lebar: 320, aksen: '#e63946', ukuran: 30 });
  const WARNA = [['SANGAT TINGGI', '#ef4444'], ['TINGGI', '#fb923c'], ['SEDANG', '#fde047'], ['RENDAH', '#4ade80'], ['SANGAT RENDAH', '#38bdf8']];
  const legenda = WARNA.map(([isi, w], i) => { const g = el('g', { filter: 'url(#b1)' }, d); const y = 220 + i * 70; kertas(kotak(1590, y, 260, 56, 8), w, g, { amp: 0.6 }); teks(g, 1720, y + 38, isi, { bebas: true, ukuran: 34, warna: '#1d3557', jangkar: 'middle' }); g._x = 1720; g._y = y + 28; return g; });
  // garis Selera Risiko (tangga, batas Sedang | Tinggi)
  const s = 78, x0 = 1120, y0 = 200;
  const garis = el('path', { d: `M${x0 + 2 * s} ${y0 - 6} L${x0 + 2 * s} ${y0 + 2 * s} L${x0 + 3 * s} ${y0 + 2 * s} L${x0 + 3 * s} ${y0 + 3 * s} L${x0 + 4 * s} ${y0 + 3 * s} L${x0 + 4 * s} ${y0 + 5 * s + 6}`, stroke: '#9d0208', 'stroke-width': 11, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', filter: 'url(#bt)' }, d);
  const pjG = garis.getTotalLength(); garis.setAttribute('stroke-dasharray', `${pjG} ${pjG}`);
  const lbSelera = labelPapan(d, 1560, 180, 'SELERA RISIKO', 'Aceh Barat: sampai Sedang', { lebar: 320, aksen: '#9d0208', ukuran: 36 });
  const kPrioritas = kartuAlur(d, 1560, 330, 320, 'DI ATAS GARIS', ['Tinggi & Sangat Tinggi:', 'wajib RTP', '+ Daftar Risiko Prioritas'], '#ef4444');
  const tinggi = Object.values(mx.ubin).filter((c) => c._v >= 16);

  // ── waktu
  const tD = W(L.ukur, 'Dampak'), tK = W(L.ukur, 'kemungkinan');
  const tEC = W(L.ec, 'Eksisting'), tTabel = W(L.tabel, 'tabel'), tKetik = W(L.tabel, 'diketik');
  const tBukan = W(L.bukan, 'Bukan'), tK1 = W(L.contoh, 'Dampak'), tH1 = W(L.contoh, 'dua'), tK2 = W(L.contoh, 'Dampak', 1), tH2 = W(L.contoh, 'sembilan');
  const tBobot = W(L.bobot, 'bobot'), tW = [W(L.warna, 'merah'), W(L.warna, 'oranye'), W(L.warna, 'kuning'), W(L.warna, 'hijau'), W(L.warna, 'biru')];
  const tSelera = W(L.selera, 'Selera'), tSedang = W(L.selera, 'Sedang'), tAtas = W(L.atas, 'Tinggi');
  bunyi(tD, 'pop', 0.5); bunyi(tK, 'pop', 0.5); bunyi(L.ec.start, 'whoosh', 0.5); bunyi(tEC, 'klik', 0.6); bunyi(W(L.belum, 'Belum'), 'pop', 0.4); bunyi(W(L.sudah, 'Sudah'), 'pop', 0.4);
  bunyi(tKetik, 'stempel', 0.7); bunyi(L.kali.start, 'kertas', 0.5); bunyi(tBukan, 'stempel', 0.8);
  bunyi(tK1, 'pop', 0.6); bunyi(tH1, 'ping', 0.5); bunyi(tK2, 'pop', 0.6); bunyi(tH2, 'ping', 0.5); bunyi(tBobot, 'pop', 0.4);
  tW.forEach((x) => bunyi(x, 'tik', 0.4)); bunyi(tSelera, 'desir', 0.6); bunyi(tSedang, 'ping', 0.5); bunyi(tAtas, 'lonceng', 0.35);
  suasana(info.start, { angin: 0.35, ombak: 0.6, camar: 0.3 });

  return (t) => {
    const tq = tStop(t), l = langkahDari(t);
    const papanK = { x: 180, y: -80, z: 1.1 };
    pg.perbarui(t, kunciKamera(t, [[info.start, { x: 260, y: -40, z: 1.0 }], [L.ec.start, papanK], [L.kali.start, { x: 120, y: -20, z: 1.06 }], [L.bukan.start, papanK], [info.end, papanK]]));
    // ukur: tiang & sumbu
    lenting(tiang, tq, L.ukur.start + 0.5, L.ec.start, l, 1);
    lenting(sbD, tq, tD, L.ec.start - 0.2, l, 2); lenting(sbK, tq, tK, L.ec.start - 0.2, l, 3);
    tampil(sumbu, tq >= tD - 0.1 && tq < L.ec.start);
    // alur di aplikasi
    tampil(alur, tq >= L.ec.start - 0.1 && tq < L.kali.start);
    lenting(tab, tq, L.ec.start, L.kali.start - 0.3, l, 4);
    tab._img.setAttribute('href', tq < L.tabel.start ? 'aset/layar/existing-control-potong.png' : tq < L.sudah.start ? 'aset/layar/tabel-kriteria-potong.png' : 'aset/layar/isi-nilai-potong.png');
    lenting(pertanyaan, tq, tEC, L.kali.start - 0.3, l, 5);
    lenting(kTidak, tq, L.belum.start, L.kali.start - 0.3, l, 6); lenting(kYa, tq, L.sudah.start, L.kali.start - 0.3, l, 7);
    aturStempel(stKetik, tq, tKetik, -4);
    // matriks
    tampil(mx, tq >= L.kali.start - 0.1);
    lenting(mx, tq, L.kali.start - 0.1, 1e9, l, 8);
    aturStempel(stKali, tq, tBukan, -10); tampil(stKali, tq >= tBukan && tq < tK1);
    keping.forEach((g, i) => { const t0 = i ? tK2 : tK1; const u = E.back(P(tq, t0, 0.35)); tampil(g, tq >= t0 && tq < L.warna.start); atur(g, `translate(0 ${f1((1 - u) * -300)})`); });
    hasil.forEach((g, i) => lenting(g, tq, i ? tH2 : tH1, L.warna.start - 0.2, l, 9 + i));
    lenting(bobot, tq, tBobot, L.warna.start - 0.2, l, 11);
    legenda.forEach((g, i) => lenting(g, tq, tW[i], L.selera.start - 0.2, l, 12 + i));
    garis.setAttribute('stroke-dashoffset', f1(pjG * (1 - P(tq, tSelera, 0.9))));
    tampil(garis, tq >= tSelera);
    lenting(lbSelera, tq, tSelera, 1e9, l, 20);
    lenting(kPrioritas, tq, tAtas, 1e9, l, 21);
    const denyut = tq > tAtas ? 1 + 0.06 * Math.abs(Math.sin(tq * 5)) : 1;
    tinggi.forEach((c) => atur(c, denyut > 1 ? `translate(${c._cx} ${c._cy}) scale(${f2(denyut)}) translate(${-c._cx} ${-c._cy})` : ''));
    // tokoh
    const lihat = tq > L.ec.start ? 1320 : 1600;
    gerakBoneka(syah, t, { lihat, kanan: (tq > tBukan - 0.2 && tq < L.bukan.end) || (tq > tSelera - 0.2 && tq < L.selera.end) ? -90 + Math.sin(tq * 3) * 4 : undefined });
    gerakBoneka(ardi, t, { lihat, miring: tq > L.kali.start && tq < L.kali.end ? -7 : 0 });
    gerakBoneka(gadis, t, { lihat, kanan: (tq > L.ec.start && tq < L.tabel.end) || (tq > tK1 && tq < L.contoh.end) ? -82 : undefined });
  };
};
