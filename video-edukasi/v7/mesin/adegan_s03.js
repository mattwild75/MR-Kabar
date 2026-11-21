// ═══════════════════════════════════════════════════════════════════════════
// BABAK 2 · Mengapa harus dikelola (ruang kantor syahbandar)
// ═══════════════════════════════════════════════════════════════════════════
window.ADEGAN.s3 = (akar, info) => {
  const L = {
    tanya: B('Tapi Pak, selama ini'), bpkp: B('Berlayar, iya.'), perdep: B('Dari situlah lahir'), formal: B('Penilaiannya sekadar'),
    waduh: B('Waduh. Kok mirip'), waktu: B('Waktunya tidak baku'), kertas: B('Kertas kerjanya tersebar'), satu: B('MR Kabar menyatukannya'),
  };
  const pk = panggungKantor(akar, { foto: 'pantai_meulaboh' });
  const { dinding, perabot, depan } = pk;
  const syah = boneka('syahbandar', perabot, { x: 560, y: 930 });
  const ardi = boneka('ardi', perabot, { x: 790, y: 930 });
  const gadis = boneka('gadis', perabot, { x: 1010, y: 930 });
  const BX = 1550, BY = 330;
  // BPKP memotret: kamera kertas + angka 11
  const kamr = el('g', { filter: 'url(#b3)' }, dinding);
  kertas(kotak(BX - 130, BY - 90, 260, 170, 18), '#334155', kamr, { amp: 0.8 });
  kertas(kotak(BX - 60, BY - 120, 90, 40, 8), '#334155', kamr, { amp: 0.5 });
  kertas(oval(BX, BY, 62, 62, 30), '#94a3b8', kamr, { amp: 0.5 });
  kertas(oval(BX, BY, 40, 40, 24), '#1e293b', kamr, { amp: 0.4 });
  kertas(oval(BX - 14, BY - 14, 10, 10, 12), '#e2e8f0', kamr, { amp: 0.2 });
  teks(kamr, BX, BY + 130, 'BPKP', { bebas: true, ukuran: 54, warna: '#1d3557', jangkar: 'middle', spasi: 4 });
  kamr._x = BX; kamr._y = BY;
  const sebelas = el('g', {}, dinding);
  const angka = hurufGuntingan(sebelas, '11', BX - 110, BY + 70, 230, { warna: '#e63946', bayang: '#1d3557' });
  const lblPersoalan = judulKertas(sebelas, BX + 70, BY + 40, 'PERSOALAN', { ukuran: 70, warna: '#fdf6e3', bayang: '#1d3557' });
  const tanda = Array.from({ length: 11 }, (_, i) => {
    const x = BX - 260 + (i % 6) * 104 + (i > 5 ? 52 : 0), y = BY - 170 + Math.floor(i / 6) * 330 + (h(i * 3.7) - 0.5) * 30;
    const g = el('g', { filter: 'url(#bt)' }, sebelas);
    kertas(oval(x, y, 24, 24, 18), '#e63946', g, { amp: 0.5 });
    teks(g, x, y + 12, '!', { bebas: true, ukuran: 36, warna: '#fdf6e3', jangkar: 'middle' });
    g._x = x; g._y = y;
    return g;
  });
  // sampul Perdep + stempel acuan
  const perdep = el('g', {}, dinding);
  const dok = el('g', { filter: 'url(#b3)' }, perdep);
  kertas(kotak(BX - 190, BY - 200, 380, 420, 6), '#fffdf7', dok, { amp: 1 });
  kertas(kotak(BX - 190, BY - 200, 380, 70), '#1d3557', dok, { amp: 0.6 });
  teks(dok, BX, BY - 152, 'BPKP · DEPUTI PPKD', { bebas: true, ukuran: 34, warna: '#f2c46b', jangkar: 'middle', spasi: 2 });
  teksBaris(dok, BX, BY - 80, 'PERATURAN DEPUTI PPKD NOMOR 4 TAHUN 2019', { bebas: true, ukuran: 46, warna: '#1d3557', jangkar: 'middle', maks: 22, jarak: 48 });
  teksBaris(dok, BX, BY + 40, 'Pedoman Pengelolaan Risiko pada Pemerintah Daerah', { ukuran: 22, tebal: 600, warna: '#475569', jangkar: 'middle', maks: 30, jarak: 28 });
  dok._x = BX; dok._y = BY;
  const stAcuan = stempel(perdep, BX, BY + 150, 'ACUAN MR KABAR', { ukuran: 46 });
  // formalitas & rencana yang dilupakan
  const formal = el('g', {}, dinding);
  const lmbNilai = dokumen(formal, BX - 290, BY - 170, 260, 330, 'PENILAIAN RISIKO', { ukuran: 30 });
  lmbNilai._x = BX - 160; lmbNilai._y = BY;
  const stFormal = stempel(formal, BX - 160, BY + 30, 'FORMALITAS', { ukuran: 40, warna: '#64748b' });
  const lmbRencana = dokumen(formal, BX + 30, BY - 170, 260, 330, 'RENCANA PENGENDALIAN', { ukuran: 26 });
  lmbRencana._x = BX + 160; lmbRencana._y = BY;
  const debu = el('g', { opacity: 0 }, formal);
  el('rect', { x: BX + 30, y: BY - 170, width: 260, height: 330, fill: '#9ca3af', opacity: 0.45 }, debu);
  for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI / 2; el('path', { d: `M${BX + 290} ${BY - 170} L${BX + 290 - Math.cos(a) * 170} ${BY - 170 + Math.sin(a) * 170}`, stroke: '#f8fafc', 'stroke-width': 2.4 }, debu); }
  for (let r = 40; r <= 160; r += 40) el('path', { d: `M${BX + 290 - r} ${BY - 170} A${r} ${r} 0 0 0 ${BX + 290} ${BY - 170 + r}`, stroke: '#f8fafc', 'stroke-width': 2.4, fill: 'none' }, debu);
  // tiga kelemahan + MANUAL
  const lemah = el('g', {}, dinding);
  const IKON = [['jam', 'WAKTU TIDAK BAKU', '#1f4ea3'], ['orang', 'PENANGGUNG JAWAB TIDAK JELAS', '#7b3fa0'], ['podium', 'PEJABAT STRATEGIS BELUM TERLIBAT', '#c2410c']];
  const ikon = IKON.map(([j, isi, w], i) => {
    const x = BX - 210 + i * 210, y = BY - 70;
    const g = el('g', {}, lemah);
    ikonKertas(g, x, y, j, w, 70);
    teksBaris(g, x, y + 120, isi, { bebas: true, ukuran: 30, warna: '#1d3557', jangkar: 'middle', maks: 14, jarak: 32 });
    const x2 = silang(g, x + 50, y - 50, 26);
    g._x = x; g._y = y; g._silang = x2;
    return g;
  });
  const stManual = stempel(lemah, BX, BY + 190, 'MASIH MANUAL', { ukuran: 46 });
  // kertas kerja beterbangan
  const tumpuk = Array.from({ length: 16 }, (_, i) => {
    const g = lembarKerja(depan, i % 3 === 0 ? 'word' : 'excel');
    g._ax = 1330 + (i % 8) * 52 + (h(i * 1.9) - 0.5) * 20; g._ay = 615 - Math.floor(i / 8) * 8; g._ar = (h(i * 2.3) - 0.5) * 30;
    g._ox = 200 + h(i * 4.1) * 1500; g._oy = 160 + h(i * 5.3) * 560;
    return g;
  });
  const LBL3 = [['MUDAH HILANG', 'hilang'], ['SULIT DIREKAP', 'direkap'], ['TANPA JEJAK', 'jejak']];
  const lbl3 = LBL3.map(([isi], i) => {
    const g = el('g', { filter: 'url(#b3)' }, depan);
    const x = 420 + i * 540, y = 180;
    kertas(kotak(x - 210, y - 46, 420, 92, 8), '#e63946', g, { amp: 1 });
    teks(g, x, y + 20, isi, { bebas: true, ukuran: 56, warna: '#fdf6e3', jangkar: 'middle', spasi: 2 });
    g._x = x; g._y = y;
    return g;
  });
  // MR Kabar menyatukan
  const satu = el('g', {}, dinding);
  const buku = bukuMRKabar(satu, BX - 160, BY + 20, 0.82);
  const tab = tablet(satu, 'aset/layar/dashboard.png', BX + 20, BY - 150, 290, 210);
  tab._x = BX + 165; tab._y = BY - 45;
  const CEK = [['SATU APLIKASI', 'aplikasi'], ['SESUAI PERDEP', 'Perdep'], ['SETIAP PERUBAHAN TERCATAT', 'tercatat'], ['SATU LAYAR PIMPINAN', 'layar']];
  const cek = CEK.map(([isi], i) => {
    const g = el('g', {}, satu);
    const x = BX + 20, y = BY + 100 + i * 46;
    ikonKertas(g, x + 18, y - 10, 'centang', '#2a9d8f', 18);
    teks(g, x + 48, y, isi, { bebas: true, ukuran: 32, warna: '#1d3557', spasi: 1 });
    g._x = x + 120; g._y = y - 10;
    return g;
  });

  // ── waktu
  const tBPKP = W(L.bpkp, 'Be-Pe-Ka-Pe'), tSebelas = W(L.bpkp, 'sebelas');
  const tAcuan = W(L.perdep, 'acuan');
  const tFormal = W(L.formal, 'formalitas'), tRencana = W(L.formal, 'Rencana'), tLupa = W(L.formal, 'dilupakan');
  const tIkon = [W(L.waktu, 'Waktunya'), W(L.waktu, 'penanggung'), W(L.waktu, 'pejabat')], tManual = W(L.waktu, 'manual');
  const tSebar = W(L.kertas, 'tersebar'), tLbl = [W(L.kertas, 'hilang'), W(L.kertas, 'direkap'), W(L.kertas, 'jejak')];
  const tSatu = W(L.satu, 'menyatukannya'), tCek = [W(L.satu, 'aplikasi'), W(L.satu, 'Perdep'), W(L.satu, 'tercatat'), W(L.satu, 'layar')];
  bunyi(tBPKP, 'klik', 0.8); bunyi(tBPKP + 0.1, 'desir', 0.4);
  bunyi(tSebelas, 'stempel', 0.7); tanda.forEach((_, i) => bunyi(tSebelas + 0.25 + i * 0.07, 'pop', 0.3));
  bunyi(L.perdep.start + 0.2, 'kertas', 0.6); bunyi(tAcuan, 'stempel', 0.7);
  bunyi(tFormal, 'stempel', 0.6); bunyi(tRencana, 'kertas', 0.5); bunyi(tLupa, 'desir', 0.4);
  tIkon.forEach((x) => { bunyi(x, 'pop', 0.5); bunyi(x + 0.45, 'tik', 0.6); }); bunyi(tManual, 'stempel', 0.7);
  bunyi(tSebar, 'kertas', 0.9); bunyi(tSebar + 0.6, 'kertas', 0.6); tLbl.forEach((x) => bunyi(x, 'pop', 0.5));
  bunyi(tSatu, 'whoosh', 0.7); bunyi(tSatu + 1.1, 'stempel', 0.5); tCek.forEach((x) => bunyi(x, 'ping', 0.4));
  suasana(info.start, { angin: 0, ombak: 0.15, camar: 0.2 });

  return (t) => {
    const tq = tStop(t), l = langkahDari(t);
    const papanK = { x: 290, y: -90, z: 1.14 }, tokohK = { x: -120, y: 40, z: 1.1 };
    const k = kunciKamera(t, [
      [info.start, { x: 0, y: 0, z: 1 }], [L.tanya.start, tokohK], [tBPKP - 0.3, papanK], [L.formal.end, papanK], [L.waduh.start, tokohK],
      [tIkon[0] - 0.3, papanK], [tManual + 0.6, papanK], [tSebar, { x: 60, y: 0, z: 1 }], [tSatu + 0.4, papanK], [info.end, papanK],
    ]);
    pk.perbarui(t, k);
    // BPKP & 11
    lenting(kamr, tq, tBPKP - 0.1, tSebelas - 0.2, l, 1);
    if (tq >= tBPKP && tq < tBPKP + 0.12) window.kilat(0.35);
    tampil(sebelas, tq >= tSebelas && tq < L.perdep.start + 0.2);
    angka.forEach((g, i) => { const u = E.back(P(tq, tSebelas + i * 0.06, 0.24)); atur(g, `translate(0 ${f1((1 - u) * -300)}) ${getar(20 + i, l, g._x, g._y)}`); });
    const uP = E.out(P(tq, tSebelas + 0.2, 0.3));
    atur(lblPersoalan, `translate(${f1((1 - uP) * 500)} 0) ${getar(23, l, BX + 200, BY)}`);
    tanda.forEach((g, i) => lenting(g, tq, tSebelas + 0.25 + i * 0.07, L.perdep.start - 0.1, l, 30 + i));
    // Perdep
    lenting(dok, tq, L.perdep.start + 0.2, L.formal.start - 0.3, l, 40);
    aturStempel(stAcuan, tq, tAcuan, -6);
    tampil(stAcuan, tq >= tAcuan && tq < L.formal.start - 0.2);
    // formalitas & dilupakan
    tampil(formal, tq >= tFormal - 0.4 && tq < L.waduh.end + 0.3);
    lenting(lmbNilai, tq, tFormal - 0.4, L.waduh.end, l, 41);
    aturStempel(stFormal, tq, tFormal, -10);
    lenting(lmbRencana, tq, tRencana - 0.1, L.waduh.end, l, 42);
    debu.setAttribute('opacity', f2(P(tq, tLupa, 0.6)));
    // tiga kelemahan
    tampil(lemah, tq >= tIkon[0] - 0.2 && tq < tSebar);
    ikon.forEach((g, i) => { lenting(g, tq, tIkon[i], tSebar - 0.3, l, 50 + i); tampil(g._silang, tq >= tIkon[i] + 0.45); });
    aturStempel(stManual, tq, tManual, -5);
    // kertas beterbangan lalu terkumpul ke buku
    tumpuk.forEach((g, i) => {
      const terbang = P(tq, tSebar + i * 0.04, 0.6), kumpul = E.in(P(tq, tSatu + i * 0.03, 0.9));
      let x = lerp(g._ax, g._ox + Math.sin(tq * 1.3 + i) * 60, E.out(terbang)), y = lerp(g._ay, g._oy + Math.cos(tq * 1.1 + i * 2) * 40, E.out(terbang));
      x = lerp(x, BX - 160, kumpul); y = lerp(y, BY + 20, kumpul);
      const r = g._ar + terbang * (Math.sin(tq * 3 + i) * 40) * (1 - kumpul);
      tampil(g, kumpul < 0.98 && tq < info.end);
      atur(g, `translate(${f1(x)} ${f1(y)}) rotate(${f1(r)}) scale(${f2(lerp(0.9, 1.25, terbang) * (1 - kumpul * 0.7))})`);
    });
    lbl3.forEach((g, i) => lenting(g, tq, tLbl[i], tSatu - 0.2, l, 60 + i));
    // MR Kabar menyatukan
    tampil(satu, tq >= tSatu + 0.5);
    lenting(buku, tq, tSatu + 0.6, info.end, l, 70);
    lenting(tab, tq, tCek[0] - 0.1, info.end, l, 71);
    cek.forEach((g, i) => lenting(g, tq, tCek[i], info.end, l, 72 + i));
    // tokoh
    const kePapan = tq > tBPKP - 0.3 && !(tq > L.waduh.start && tq < L.waduh.end);
    const lihat = kePapan ? BX : undefined;
    const tunjuk = (tq > tSebelas - 0.2 && tq < L.perdep.end) || (tq > tIkon[0] - 0.2 && tq < L.waktu.end) || (tq > tCek[0] - 0.2 && tq < L.satu.end);
    gerakBoneka(syah, t, { lihat, kanan: tunjuk ? -88 + Math.sin(tq * 3) * 4 : undefined });
    gerakBoneka(ardi, t, { lihat, kanan: tq > L.waduh.start && tq < L.waduh.end + 0.2 ? -168 : (tq > L.tanya.start && tq < L.tanya.end ? -40 : undefined), kiri: tq > L.tanya.start && tq < L.tanya.end ? 50 : undefined, miring: tq > L.waduh.start && tq < L.waduh.end ? -9 : 0, senyum: 1 });
    gerakBoneka(gadis, t, { lihat, kanan: tq > tSebar - 0.2 && tq < L.kertas.end ? -150 + Math.sin(tq * 8) * 10 : undefined, kiri: tq > tSebar - 0.2 && tq < L.kertas.end ? 140 : undefined });
  };
};
