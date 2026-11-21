// ═══════════════════════════════════════════════════════════════════════════
// BABAK 10 · Satu risiko, satu perjalanan
// A. lokasi pembangunan tempat pendaratan ikan (foto asli TPI)
// B. papan: skala 17 -> target 13 -> aktual 14, Share, empat laporan, Dashboard
// ═══════════════════════════════════════════════════════════════════════════
window.ADEGAN.s11 = (akar, info) => {
  const L = {
    ikuti: B('Sekarang, mari ikuti'), dkp: B('Dinas Kelautan dan Perikanan'), risiko: B('Risikonya: karena lokasi'), eks: B('Penyebabnya eksternal'),
    skala: B('Dampak empat, kemungkinan tiga'), share: B('Karena Uncontrollable, responsnya'), target: B('Skala Target tiga belas'), yah: B('Yah, meleset'),
    selisih: B('Selisih satu itu'), laporan: B('Semuanya bermuara'), anjungan: B('Dan satu baris risiko'), peta: B('Peta risiko dengan garis'),
  };
  // ══ A. LOKASI PEMBANGUNAN ══════════════════════════════════════════════
  const gA = el('g', {}, akar);
  const pa = panggungDermaga(gA, { langit: 'Sore', kantor: false, kapalX: 2300, matahari: { warna: '#f59e0b', dalam: '#fbbf24' } });
  const a5 = pa.lp[5];
  const lahan = el('g', { filter: 'url(#b2)' }, a5);
  kertas([[960, 742], [1000, 690], [1920, 680], [1960, 742]], '#d9b77e', lahan, { amp: 1.4 });
  for (const x of [1080, 1260, 1440, 1620]) kertas(kotak(x, 470, 18, 230), '#8d99ae', lahan, { amp: 0.4 });
  kertas(kotak(1070, 460, 580, 20), '#8d99ae', lahan, { amp: 0.4 });
  kertas([[1070, 460], [1360, 360], [1650, 460], [1620, 460], [1360, 380], [1100, 460]], '#a0aec0', lahan, { amp: 0.6 });
  const pagar = el('g', {}, a5);
  for (const x of [1700, 1780, 1860]) kertas(kotak(x, 600, 10, 100), '#6b4226', pagar, { amp: 0.3 });
  el('path', { d: 'M1700 620 L1870 620 M1700 660 L1870 660', stroke: '#e63946', 'stroke-width': 5, 'stroke-dasharray': '14 8' }, pagar);
  const tanda = labelPapan(pagar, 1640, 520, 'BELUM DIBEBASKAN', '', { lebar: 300, aksen: '#e63946', ukuran: 34 });
  const papanProyek = el('g', { filter: 'url(#b3)' }, a5);
  kertas(kotak(740, 470, 380, 170, 6), '#1d4f8f', papanProyek, { amp: 0.8 });
  kertas(kotak(780, 640, 14, 100), '#6b4226', papanProyek, { amp: 0.3 }); kertas(kotak(1070, 640, 14, 100), '#6b4226', papanProyek, { amp: 0.3 });
  teksBaris(papanProyek, 930, 512, 'DINAS KELAUTAN DAN PERIKANAN', { bebas: true, ukuran: 30, warna: '#f2c46b', jangkar: 'middle', maks: 20, jarak: 30 });
  teksBaris(papanProyek, 930, 580, 'Pembangunan Tempat Pendaratan Ikan', { ukuran: 22, tebal: 800, warna: '#fdf6e3', jangkar: 'middle', maks: 22, jarak: 26 });
  papanProyek._x = 930; papanProyek._y = 555;
  const galeri = el('g', {}, a5);
  el('path', { d: 'M640 86 Q1290 136 1940 86', stroke: '#7a5230', 'stroke-width': 4, fill: 'none' }, galeri);
  const foto3 = [['tpi_kapal', 'Kapal di tempat pelelangan'], ['tpi_suasana', 'Suasana pendaratan ikan'], ['ikan_banda_aceh', 'Hasil tangkapan']].map(([src, ket], i) => {
    const x = 700 + i * 380, w = 340, hgt = 236;
    const f = fotoCetak(galeri, src, x, 110 + (i === 1 ? 12 : 0), w, hgt, { ket, ukuranKet: 17, selotip: false });
    el('rect', { x: x + w / 2 - 8, y: 96 + (i === 1 ? 12 : 0), width: 16, height: 34, rx: 4, fill: '#c9a46c' }, f);
    f._x = x + w / 2; f._y = 228;
    return f;
  });
  const syahA = boneka('syahbandar', a5, { x: 300, y: 742, s: 0.95 });
  const ardiA = boneka('ardi', a5, { x: 470, y: 742, s: 0.95 });
  const gadisA = boneka('gadis', a5, { x: 630, y: 742, s: 0.95 });
  const pitaA = [['karena lokasi belum tuntas dibebaskan', '#fde68a'], ['keterlambatan pekerjaan fisik', '#fecaca'], ['target produksi perikanan tidak tercapai', '#bfdbfe']]
    .map(([isi, w], i) => { const luar = el('g', {}, a5); const g = pitaKata(luar, isi, { lebar: 380, maks: 24, warna: w }); atur(g, `translate(${900 + i * 400} 450)`); luar._x = 900 + i * 400; luar._y = 450; return luar; });
  const kataA = ['PENYEBAB', 'RISIKO', 'DAMPAK'].map((isi, i) => { const g = el('g', {}, a5); teks(g, 900 + i * 400, 404, isi, { bebas: true, ukuran: 40, warna: '#fdf6e3', jangkar: 'middle', spasi: 2, attr: { stroke: '#1d3557', 'stroke-width': 6, 'paint-order': 'stroke' } }); return g; });
  const tagEks = labelPapan(a5, 760, 560, 'EKSTERNAL · LEGAL', 'kategori PESTLE', { lebar: 330, aksen: '#457b9d' });
  const tagUnc = labelPapan(a5, 1120, 560, 'UNCONTROLLABLE', 'bukan kewenangan dinas', { lebar: 330, aksen: '#64748b' });

  // ══ B. PAPAN PERJALANAN ════════════════════════════════════════════════
  const gB = el('g', {}, akar);
  const pb = panggungDermaga(gB, { langit: 'Sore', kantorX: -360, kapalX: 2300, matahari: { warna: '#f59e0b', dalam: '#fbbf24' } });
  const b5 = pb.lp[5];
  papanGabus(b5, 1000, 130, 880, 530);
  const syah = boneka('syahbandar', b5, { x: 330, y: 742 });
  const ardi = boneka('ardi', b5, { x: 540, y: 742 });
  const gadis = boneka('gadis', b5, { x: 750, y: 742 });
  const mx = matriksPapan(b5, 1110, 190, 72);
  mx._x = 1290; mx._y = 370;
  const titik = {
    '17': mx.ubin['4,3'], '13': mx.ubin['4,2'], '14': mx.ubin['3,3'],
  };
  const keping = [['17', 'RESIDUAL', '#c2410c'], ['13', 'TARGET', '#1d3557'], ['14', 'AKTUAL', '#15803d']].map(([v, isi, w]) => {
    const g = el('g', { filter: 'url(#b3)' }, b5);
    const c = titik[v];
    kertas(oval(c._cx, c._cy, 30, 30, 22), w, g, { amp: 0.5 });
    teks(g, c._cx, c._cy + 12, v, { bebas: true, ukuran: 34, warna: '#fdf6e3', jangkar: 'middle' });
    const lb = labelPapan(g, 1560, 0, `${isi} = ${v}`, '', { lebar: 290, aksen: w, ukuran: 38 });
    g._c = c; g._lb = lb; g._x = c._cx; g._y = c._cy;
    return g;
  });
  const stMelampaui = stempel(b5, 1700, 260, 'MELAMPAUI SELERA', { ukuran: 40 });
  const garisSel = el('path', { d: `M${1110 + 2 * 72} 184 L${1110 + 2 * 72} ${190 + 2 * 72} L${1110 + 3 * 72} ${190 + 2 * 72} L${1110 + 3 * 72} ${190 + 3 * 72} L${1110 + 4 * 72} ${190 + 3 * 72} L${1110 + 4 * 72} ${190 + 5 * 72 + 6}`, stroke: '#9d0208', 'stroke-width': 9, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, b5);
  const kShare = kartuAlur(b5, 1500, 160, 360, 'RESPONS: SHARE', ['koordinasi resmi dengan', 'panitia pengadaan tanah'], '#2a9d8f');
  const dokPKS = dokumen(b5, 1500, 340, 200, 230, 'PERJANJIAN KERJA SAMA', { ukuran: 22, pita: '#2a9d8f' }); dokPKS._x = 1600; dokPKS._y = 455;
  const pjpSD = labelPapan(b5, 1590, 590, 'PJP: SEKRETARIS DINAS', '', { lebar: 290, aksen: '#e63946', ukuran: 30 });
  const triwulan = ['TW I', 'TW II', 'TW III', 'TW IV'].map((isi, i) => { const g = el('g', {}, b5); kertas(kotak(1540 + i * 82, 520, 74, 40, 8), '#fffdf5', g, { amp: 0.4, attr: { filter: 'url(#b1)' } }); teks(g, 1577 + i * 82, 548, isi, { bebas: true, ukuran: 24, warna: '#1d3557', jangkar: 'middle' }); g._x = 1577 + i * 82; g._y = 540; return g; });
  const stHampir = stempel(b5, 1700, 560, 'RENCANANYA HAMPIR TEPAT', { ukuran: 34, warna: '#15803d' });
  const kotakPos = el('g', {}, b5);
  const kp = el('g', { filter: 'url(#b3)' }, kotakPos);
  kertas(kotak(1300, 400, 360, 240, 14), '#e63946', kp, { amp: 1 });
  kertas(kotak(1340, 430, 280, 26, 8), '#7f1d1d', kp, { amp: 0.4 });
  teks(kp, 1480, 560, 'LAPORAN WAJIB', { bebas: true, ukuran: 48, warna: '#fdf6e3', jangkar: 'middle', spasi: 2 });
  kp._x = 1480; kp._y = 520;
  const FORM = [['FORM 11', 'pelaksanaan penilaian risiko'], ['FORM 12', 'laporan berkala UPR'], ['FORM 13', 'pemantauan Unit Kepatuhan'], ['FORM 14', 'pembinaan Komite']];
  const map4 = FORM.map(([n, isi], i) => { const g = el('g', { filter: 'url(#b2)' }, kotakPos); kertas(kotak(-110, -60, 220, 120, 6), ['#2a9d8f', '#457b9d', '#e9b949', '#6a4c93'][i], g, { amp: 0.8 }); teks(g, 0, -12, n, { bebas: true, ukuran: 44, warna: '#fdf6e3', jangkar: 'middle' }); teksBaris(g, 0, 24, isi, { ukuran: 18, tebal: 800, warna: '#fdf6e3', jangkar: 'middle', maks: 18, jarak: 20 }); return g; });
  const layarBesar = tablet(b5, 'aset/layar/dashboard-peta.png', 1010, 140, 860, 520);
  layarBesar._x = 1440; layarBesar._y = 400;
  const LAYAR4 = [['aset/layar/dashboard-peta.png', 'PETA RISIKO + GARIS SELERA'], ['aset/layar/dashboard-prioritas.png', 'DAFTAR RISIKO PRIORITAS'], ['aset/layar/dashboard-ranking.png', 'RANKING EKSPOSUR ANTAR OPD'], ['aset/layar/dashboard-kepatuhan.png', 'KEPATUHAN PELAPORAN']];
  const capLayar = labelPapan(b5, 1180, 600, '', '', { lebar: 520, aksen: '#1d3557', ukuran: 34 });
  const capTeks = capLayar.querySelector('text');

  // ── waktu
  const tB = L.skala.start - 0.4;
  const tDKP = W(L.dkp, 'Dinas'), tFoto = W(L.dkp, 'pendaratan'), tP = [W(L.risiko, 'karena'), W(L.risiko, 'mungkin'), W(L.risiko, 'sehingga')], tBebas = W(L.risiko, 'dibebaskan');
  const tEks = W(L.eks, 'eksternal'), tUnc = W(L.eks, 'Ankontrolebel');
  const t17 = W(L.skala, 'tujuh'), tSel = W(L.skala, 'Melampaui');
  const tShare = W(L.share, 'Syer'), tPKS = W(L.share, 'perjanjian'), tPJP = W(L.share, 'Sekretaris');
  const t13 = W(L.target, 'tiga'), tTW = W(L.target, 'triwulan'), t14 = W(L.target, 'empat'), tHampir = W(L.selisih, 'hampir');
  const tF = [W(L.laporan, 'Form'), W(L.laporan, 'Form', 1), W(L.laporan, 'Form', 2), W(L.laporan, 'Form', 3)];
  const tLayar = [W(L.anjungan, 'Desbor'), W(L.peta, 'Daftar'), W(L.peta, 'ranking'), W(L.peta, 'kepatuhan')];
  bunyi(L.ikuti.start, 'whoosh', 0.5); bunyi(tDKP, 'pop', 0.5); foto3.forEach((_, i) => bunyi(tFoto + i * 0.2, 'kertas', 0.4));
  tP.forEach((x) => bunyi(x, 'pop', 0.45)); bunyi(tBebas, 'tik', 0.6); bunyi(tEks, 'pop', 0.45); bunyi(tUnc, 'pop', 0.45);
  bunyi(tB, 'whoosh', 0.6); bunyi(t17, 'pop', 0.6); bunyi(tSel, 'stempel', 0.7); bunyi(tShare, 'pop', 0.5); bunyi(tPKS, 'kertas', 0.5); bunyi(tPJP, 'pop', 0.4);
  bunyi(t13, 'desir', 0.5); triwulan.forEach((_, i) => bunyi(tTW + i * 0.15, 'tik', 0.35)); bunyi(t14, 'pop', 0.6); bunyi(tHampir, 'stempel', 0.6);
  tF.forEach((x) => bunyi(x + 0.3, 'kertas', 0.45)); tLayar.forEach((x) => bunyi(x, 'klik', 0.5));
  suasana(info.start, { angin: 0.2, ombak: 0.45, camar: 0.6 });

  return (t) => {
    const tq = tStop(t), l = langkahDari(t);
    const geser = E.inout(P(t, tB, 0.55));
    tampil(gA, t < tB + 0.6); tampil(gB, t >= tB);
    atur(gA, `translate(${f1(-geser * 1920)} 0)`); atur(gB, `translate(${f1((1 - geser) * 1920)} 0)`);
    if (t < tB + 0.6) {
      pa.perbarui(t, kunciKamera(t, [[info.start, { x: 200, y: -60, z: 1.0 }], [tFoto, { x: 300, y: -100, z: 1.02 }], [tB, { x: 300, y: -60, z: 1.02 }]]));
      lenting(papanProyek, tq, tDKP, 1e9, l, 1);
      foto3.forEach((f, i) => { lenting(f, tq, tFoto + i * 0.2, 1e9, l, 2 + i); });
      tampil(galeri, tq >= tFoto - 0.1);
      pitaA.forEach((g, i) => lenting(g, tq, tP[i], 1e9, l, 6 + i));
      kataA.forEach((g, i) => tampil(g, tq >= tP[i]));
      lenting(tanda, tq, tBebas, 1e9, l, 9);
      lenting(tagEks, tq, tEks, 1e9, l, 10); lenting(tagUnc, tq, tUnc, 1e9, l, 11);
      gerakBoneka(syahA, t, { x: 300, y: 742, s: 0.95, lihat: 1200, kanan: tq > L.dkp.start && tq < L.risiko.end ? -86 : undefined });
      gerakBoneka(ardiA, t, { x: 470, y: 742, s: 0.95, lihat: 1200 });
      gerakBoneka(gadisA, t, { x: 630, y: 742, s: 0.95, lihat: 1200 });
    }
    if (t >= tB) {
      pb.perbarui(t, kunciKamera(t, [[tB, { x: 180, y: -50, z: 1.06 }], [info.end, { x: 200, y: -50, z: 1.08 }]]));
      const fMatriks = tq < tF[0] - 0.4;
      tampil(mx, fMatriks); tampil(garisSel, fMatriks && tq >= t17);
      keping.forEach((g, i) => {
        const t0 = [t17, t13, t14][i];
        const u = E.back(P(tq, t0, 0.35));
        tampil(g, tq >= t0 && fMatriks);
        atur(g, `translate(0 ${f1((1 - u) * -260)})`);
        atur(g._lb, `translate(0 ${200 + i * 100})`);
        tampil(g._lb, tq >= t0 + 0.2 && tq >= t13 - 0.1);
      });
      aturStempel(stMelampaui, tq, tSel, -8); tampil(stMelampaui, tq >= tSel && tq < tShare - 0.2);
      tampil(kShare, tq >= tShare - 0.1 && tq < t13 - 0.2); lenting(kShare, tq, tShare - 0.1, t13 - 0.3, l, 20);
      lenting(dokPKS, tq, tPKS, t13 - 0.3, l, 21); lenting(pjpSD, tq, tPJP, t13 - 0.3, l, 22);
      triwulan.forEach((g, i) => lenting(g, tq, tTW + i * 0.15, tF[0] - 0.4, l, 23 + i));
      aturStempel(stHampir, tq, tHampir, -6); tampil(stHampir, tq >= tHampir && tq < tF[0] - 0.4);
      // empat laporan masuk kotak
      tampil(kotakPos, tq >= tF[0] - 0.3 && tq < tLayar[0] - 0.2);
      lenting(kp, tq, tF[0] - 0.3, tLayar[0] - 0.3, l, 27);
      map4.forEach((g, i) => { const u = E.inout(P(tq, tF[i] + 0.2, 0.7)); tampil(g, tq >= tF[i]); atur(g, `translate(${f1(lerp(1180 + i * 200, 1400 + i * 55, u))} ${f1(lerp(250, 370 - i * 12, u) - Math.sin(u * Math.PI) * 80)}) scale(${f2(1 - u * 0.45)}) rotate(${f1((i - 1.5) * 6)})`); });
      // layar Dashboard
      const iL = Math.max(0, tLayar.filter((x) => tq >= x).length - 1);
      lenting(layarBesar, tq, tLayar[0], 1e9, l, 28);
      layarBesar._img.setAttribute('href', LAYAR4[iL][0]);
      tampil(capLayar, tq >= tLayar[0] + 0.3);
      capTeks.textContent = LAYAR4[iL][1];
      const lihat = 1420;
      gerakBoneka(syah, t, { lihat, kanan: (tq > tShare && tq < L.share.end) || (tq > tF[0] && tq < L.laporan.end) ? -88 + Math.sin(tq * 3) * 4 : undefined });
      gerakBoneka(ardi, t, { lihat, rasa: tq > L.yah.start && tq < L.yah.end + 0.6 ? 'kecewa' : undefined, kanan: tq > L.skala.start && tq < L.skala.end ? -110 : undefined });
      gerakBoneka(gadis, t, { lihat, kanan: (tq > t13 && tq < L.target.end) || (tq > tLayar[0] && tq < L.anjungan.end) ? -84 : undefined });
    }
  };
};
