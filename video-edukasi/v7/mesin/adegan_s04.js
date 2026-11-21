// ═══════════════════════════════════════════════════════════════════════════
// BABAK 3 · Siapa memegang kemudi
// A. kapal terbelah (pop-up): Kepala Daerah & Sekda sebagai SIMBOL, UPR berjenjang
// B. laut lebar: tiga lini (awak, kapal patroli, mercusuar)
// C. dermaga: tiga peran yang namanya mirip
// ═══════════════════════════════════════════════════════════════════════════
function awakKecil(induk, x, y, warna, s = 1) {
  const g = el('g', { filter: 'url(#bt)' }, induk);
  kertas([[x - 13 * s, y], [x - 10 * s, y - 34 * s], [x + 10 * s, y - 34 * s], [x + 13 * s, y]], warna, g, { amp: 0.3 });
  kertas(oval(x, y - 44 * s, 10 * s, 10 * s, 14), '#d39a6a', g, { amp: 0.2 });
  return g;
}
function labelPapan(induk, x, y, judul, sub, o = {}) {
  const g = el('g', { filter: 'url(#b2)' }, induk);
  const w = o.lebar ?? 330, hgt = sub ? 92 : 58;
  kertas(kotak(x, y, w, hgt, 6), o.warna ?? '#fffdf5', g, { amp: 0.8 });
  kertas(kotak(x, y, 12, hgt), o.aksen ?? '#e63946', g, { amp: 0.3 });
  teks(g, x + 26, y + 40, judul, { bebas: true, ukuran: o.ukuran ?? 36, warna: '#1d3557', spasi: 1 });
  if (sub) teks(g, x + 26, y + 74, sub, { ukuran: 21, tebal: 600, warna: '#475569' });
  g._x = x + w / 2; g._y = y + hgt / 2;
  return g;
}

window.ADEGAN.s4 = (akar, info) => {
  const L = {
    tanya: B('Pak, siapa nakhoda'), operator: B('Operator aplikasinya'), bukan: B('Bukan. Dan bukan hanya'), kd: B('Penanggung Jawab Pengelolaan Risiko adalah'),
    sekda: B('Sekretaris Daerah menjadi'), upr: B('Awaknya adalah Unit'), tiga: B('Agar kapal tetap'), lini1: B('Lini pertama, kami'),
    lini2: B('Lini kedua, kapal patroli'), lini3: B('Lini ketiga, Inspektorat'), mirip: B('Ada tiga peran'), pj: B('Penanggung Jawab Pengelolaan Risiko: Kepala'),
    pemilik: B('Pemilik Risiko: sebuah unit'), pjp: B('Penanggung Jawab Pengendalian: jabatan'), boleh: B('Ketiganya boleh jatuh'),
  };
  // ══ A. KAPAL TERBELAH ══════════════════════════════════════════════════
  const gA = el('g', {}, akar);
  const la = [lapisan(gA, 0), lapisan(gA, 0.3), lapisan(gA, 1)];
  langit(la[0], 'Siang');
  const ltA = laut(gA, { lapis: [la[1], la[1], la[2]], y: [700, 760, 930] });
  const kapalA = el('g', {}, la[2]);
  const lambung = el('g', { filter: 'url(#b3)' }, kapalA);
  kertas([[600, 380], [1850, 380], [1790, 880], [660, 880]], '#1d4f8f', lambung, { amp: 1.4 });
  kertas([[624, 396], [1826, 396], [1772, 864], [678, 864]], '#f4ecd8', lambung, { amp: 1 });
  const LANTAI = [500, 620, 740];
  for (const y of LANTAI) kertas(kotak(640, y, 1170, 14), '#a0703f', lambung, { amp: 0.6 });
  kertas([[596, 372], [1856, 372], [1852, 386], [600, 386]], '#e63946', lambung, { amp: 0.6 });
  const anjungan = el('g', { filter: 'url(#b3)' }, kapalA);
  kertas(kotak(880, 150, 560, 232, 8), '#f8fafc', anjungan, { amp: 1 });
  kertas(kotak(866, 140, 588, 26, 6), '#2a9d8f', anjungan, { amp: 0.6 });
  teks(anjungan, 1160, 202, 'ANJUNGAN', { bebas: true, ukuran: 34, warna: '#1d3557', jangkar: 'middle', spasi: 4 });
  kertas(kotak(1152, 40, 12, 110), '#e9e2cf', anjungan, { amp: 0.3 });
  const bdrA = el('g', {}, anjungan);
  kertas(kotak(1164, 42, 70, 20), '#e63946', bdrA, { amp: 0.4 }); kertas(kotak(1164, 62, 70, 20), '#fefcf3', bdrA, { amp: 0.4 });
  const kd = simbolKepalaDaerah(anjungan, 1020, 316, 0.36);
  const sk = simbolSekda(anjungan, 1310, 290, 0.5);
  // awak per geladak
  const geladak = [[396, 500, 'UPR TINGKAT PEMDA', 'diketuai Kepala Daerah · anggota seluruh Kepala OPD', 9, '#e63946'],
    [514, 620, 'UPR ESELON 2', 'Kepala OPD', 7, '#f4a261'], [634, 740, 'UPR ESELON 3', 'Kepala Bidang / Kepala Bagian', 8, '#2a9d8f'], [754, 864, 'UPR ESELON 4', 'Kasubbag / Kasi', 9, '#457b9d']]
    .map(([y0, y1, judul, sub, n, w], i) => {
      const g = el('g', {}, kapalA);
      for (let k = 0; k < n; k++) awakKecil(g, 1180 + k * 62 - i * 6, y1 - 4, w, 0.95);
      const lb = labelPapan(g, 680, y0 + 10, judul, sub, { lebar: 450, aksen: w, ukuran: 32 });
      g._lb = lb; g._x = 1240; g._y = (y0 + y1) / 2;
      return g;
    });
  const syahA = boneka('syahbandar', la[2], { x: 300, y: 930, s: 0.92 });
  const ardiA = boneka('ardi', la[2], { x: 140, y: 960, s: 0.86 });
  const gadisA = boneka('gadis', la[2], { x: 460, y: 960, s: 0.86 });
  dermaga(la[2], -200, 560, 930);
  // label simbol & tebakan salah
  const lbKD = labelPapan(la[2], 560, 400, 'KEPALA DAERAH', 'Penanggung Jawab · tunggal, tidak didelegasikan', { lebar: 520, aksen: '#e9b949' });
  const lbSK = labelPapan(la[2], 1240, 400, 'SEKRETARIS DAERAH', 'Koordinator Penyelenggaraan', { lebar: 430, aksen: '#1d3557' });
  const salah = el('g', {}, la[2]);
  const lbOp = labelPapan(salah, 880, 470, 'OPERATOR APLIKASI', '', { lebar: 380, aksen: '#94a3b8' });
  const lbIns = labelPapan(salah, 1300, 470, 'HANYA INSPEKTORAT', '', { lebar: 400, aksen: '#94a3b8' });
  const x1 = silang(salah, 1070, 500, 34), x2 = silang(salah, 1500, 500, 34);
  const panahArah = el('g', { filter: 'url(#b2)' }, la[2]);
  kertas([[1460, 250], [1640, 250], [1640, 218], [1720, 270], [1640, 322], [1640, 290], [1460, 290]], '#e9b949', panahArah, { amp: 0.8 });
  panahArah._x = 1590; panahArah._y = 270;
  const panahSama = [0, 1, 2, 3].map((i) => { const g = el('g', { filter: 'url(#bt)' }, kapalA); kertas([[1650, 560 + i * 120], [1730, 560 + i * 120], [1730, 545 + i * 120], [1770, 568 + i * 120], [1730, 591 + i * 120], [1730, 576 + i * 120], [1650, 576 + i * 120]], '#1d3557', g, { amp: 0.4 }); g._x = 1710; g._y = 568 + i * 120; return g; });

  // ══ B. TIGA LINI DI LAUT ══════════════════════════════════════════════
  const gB = el('g', {}, akar);
  const lb = [lapisan(gB, 0), lapisan(gB, 0.15), lapisan(gB, 0.4), lapisan(gB, 0.75), lapisan(gB, 1), lapisan(gB, 1.15)];
  langit(lb[0], 'Siang');
  for (const [x, y, s] of [[300, 160, 0.9], [1100, 120, 0.8], [1800, 190, 1]]) awanKertas(lb[1], x, y, s);
  const ltB = laut(gB, { lapis: [lb[2], lb[3], lb[5]], y: [600, 690, 990] });
  const tanjung = el('g', { filter: 'url(#b2)' }, lb[3]);
  kertas([[1450, 740], [1520, 640], [1640, 610], [1800, 600], [1980, 640], [2200, 740]], '#7d8491', tanjung, { amp: 1.4 });
  const mcB = mercusuar(lb[3], 1740, 610, 1.0);
  const mercuB = boneka('mercusuar', lb[3], { x: 1590, y: 650, s: 0.5 });
  const kapalB = kapalAwak(lb[4], { s: 0.7, nama: 'ACEH BARAT' });
  const ardiB = boneka('ardi', kapalB.awak, { x: 40, y: -38, s: 0.36 });
  const gadisB = boneka('gadis', kapalB.awak, { x: 150, y: -38, s: 0.36 });
  const patroli = kapalPatroli(lb[4], { s: 0.8 });
  const petugas = boneka('patroli', patroli, { x: 110, y: -34, s: 0.38 });
  const syahB = boneka('syahbandar', lb[5], { x: 120, y: 1040, s: 0.62 });
  const judul3 = el('g', {}, lb[0]);
  const huruf3 = hurufGuntingan(judul3, 'THREE LINES OF DEFENSE', 960, 140, 96, { warna: '#fdf6e3', bayang: '#1d3557' });
  const benderaLini = [['LINI 1 · UPR', '#e63946'], ['LINI 2 · UNIT KEPATUHAN', '#f28c28'], ['LINI 3 · INSPEKTORAT', '#2a9d8f']].map(([isi, w]) => {
    const g = el('g', { filter: 'url(#b3)' }, lb[4]);
    kertas(kotak(-190, -40, 380, 80, 8), w, g, { amp: 0.9 });
    teks(g, 0, 15, isi, { bebas: true, ukuran: 44, warna: '#fdf6e3', jangkar: 'middle', spasi: 2 });
    return g;
  });
  const independen = stempel(lb[4], 1700, 320, 'INDEPENDEN', { ukuran: 50, warna: '#2a9d8f' });

  // ══ C. TIGA PERAN YANG MIRIP ══════════════════════════════════════════
  const gC = el('g', {}, akar);
  const pc = panggungDermaga(gC, { langit: 'Siang', kapalX: 2200 });
  const l5 = pc.lp[5];
  papanGabus(l5, 1090, 120, 800, 560);
  const syahC = boneka('syahbandar', l5, { x: 460, y: 742 });
  const ardiC = boneka('ardi', l5, { x: 680, y: 742 });
  const gadisC = boneka('gadis', l5, { x: 900, y: 742 });
  const PERAN = [
    ['PENANGGUNG JAWAB PENGELOLAAN RISIKO', ['Kepala Daerah', 'melekat pada jabatan', 'bukan kolom isian'], '#e9b949'],
    ['PEMILIK RISIKO', ['sebuah unit, bukan perorangan', 'tercatat di setiap baris risiko'], '#2a9d8f'],
    ['PENANGGUNG JAWAB PENGENDALIAN', ['jabatan yang BERWENANG', 'melekat pada rencana pengendalian'], '#e63946'],
  ];
  const kartuPeran = PERAN.map(([judul, isi, w], i) => {
    const g = el('g', {}, l5);
    const x = 1110, y = 150 + i * 176;
    const kk = el('g', { filter: 'url(#b2)' }, g);
    kertas(kotak(x, y, 760, 160, 8), '#fffdf5', kk, { amp: 1 });
    kertas(kotak(x, y, 16, 160), w, kk, { amp: 0.4 });
    teks(kk, x + 34, y + 46, judul, { bebas: true, ukuran: 38, warna: '#1d3557', spasi: 1 });
    const butir = isi.map((s, j) => { const b = el('g', {}, g); ikonKertas(b, x + 52, y + 80 + j * 30, 'centang', w, 12); teks(b, x + 74, y + 89 + j * 30, s, { ukuran: 24, tebal: 700, warna: '#334155' }); return b; });
    g._x = x + 380; g._y = y + 80; g._kk = kk; g._butir = butir;
    return g;
  });
  paku(l5, 1490, 140);
  const satuOrang = el('g', {}, l5);
  ikonKertas(satuOrang, 1490, 360, 'orang', '#1d3557', 90);
  satuOrang._x = 1490; satuOrang._y = 360;
  const tebak = el('g', {}, l5);
  const tbk = el('g', { filter: 'url(#b3)' }, tebak);
  kertas(kotak(1380, 470, 220, 150, 12), '#fffdf5', tbk, { amp: 1 });
  teks(tbk, 1490, 580, '?', { bebas: true, ukuran: 130, warna: '#94a3b8', jangkar: 'middle' });
  teks(tbk, 1490, 660, 'MENEBAK', { bebas: true, ukuran: 40, warna: '#1d3557', jangkar: 'middle', spasi: 2 });
  const xTebak = silang(tebak, 1490, 545, 80);
  tebak._x = 1490; tebak._y = 545;

  // ── waktu
  const tPerlihat = { A: info.start, B: L.tiga.start - 0.2, C: L.mirip.start - 0.2 };
  const tOp = W(L.operator, 'Operator'), tBukan = W(L.bukan, 'Bukan'), tIns = W(L.bukan, 'Inspektorat');
  const tKD = W(L.kd, 'Kepala'), tArah = W(L.kd, 'Beliaulah'), tSK = W(L.sekda, 'Sekretaris'), tKompas = W(L.sekda, 'kompas');
  const tDek = [W(L.upr, 'Pemda'), W(L.upr, 'Dua'), W(L.upr, 'Tiga'), W(L.upr, 'Empat')];
  const tTri = W(L.tiga, 'Tri'), tL = [L.lini1.start, L.lini2.start, L.lini3.start], tIndep = W(L.lini3, 'independen');
  const tPeran = [L.pj.start, L.pemilik.start, L.pjp.start];
  const tButir = [[W(L.pj, 'Kepala'), W(L.pj, 'melekat'), W(L.pj, 'tidak')], [W(L.pemilik, 'sebuah'), W(L.pemilik, 'tercatat')], [W(L.pjp, 'jabatan'), W(L.pjp, 'Melekat')]];
  const tSatu = W(L.boleh, 'orang'), tTebak = W(L.boleh, 'menebak');
  bunyi(tOp, 'pop', 0.5); bunyi(tBukan, 'tik', 0.8); bunyi(tIns, 'pop', 0.5); bunyi(tIns + 0.3, 'tik', 0.8);
  bunyi(tKD, 'ping', 0.6); bunyi(tArah, 'whoosh', 0.5); bunyi(tSK, 'ping', 0.6); bunyi(tKompas, 'desir', 0.5);
  tDek.forEach((x) => bunyi(x, 'pop', 0.5));
  bunyi(tPerlihat.B, 'whoosh', 0.6); huruf3.forEach((g, i) => bunyi(tTri + i * 0.03, 'pop', 0.25));
  tL.forEach((x, i) => bunyi(x + 0.1, i === 1 ? 'radio' : 'kibar', 0.6));
  bunyi(tIndep, 'stempel', 0.7);
  bunyi(tPerlihat.C, 'whoosh', 0.6);
  tPeran.forEach((x) => bunyi(x, 'kertas', 0.5)); tButir.flat().forEach((x) => bunyi(x, 'tik', 0.4));
  bunyi(tSatu, 'pop', 0.5); bunyi(tTebak, 'tik', 0.8);
  suasana(info.start, { angin: 0.25, ombak: 0.5, camar: 0.4 });

  return (t) => {
    const tq = tStop(t), l = langkahDari(t);
    // pergantian panggung: yang baru meluncur dari kanan
    const geserB = E.inout(P(t, tPerlihat.B, 0.55)), geserC = E.inout(P(t, tPerlihat.C, 0.55));
    tampil(gA, t < tPerlihat.B + 0.6); tampil(gB, t >= tPerlihat.B && t < tPerlihat.C + 0.6); tampil(gC, t >= tPerlihat.C);
    atur(gA, `translate(${f1(-geserB * 1920)} 0)`);
    atur(gB, `translate(${f1((1 - geserB) * 1920 - geserC * 1920)} 0)`);
    atur(gC, `translate(${f1((1 - geserC) * 1920)} 0)`);
    if (t < tPerlihat.B + 0.6) {
      const k = kunciKamera(t, [[info.start, { x: -60, y: 60, z: 1.0 }], [L.kd.start - 0.4, { x: 170, y: -240, z: 1.42 }], [L.sekda.end - 0.3, { x: 170, y: -240, z: 1.42 }], [L.upr.start + 0.4, { x: 160, y: 0, z: 1.02 }], [L.upr.end, { x: 160, y: 0, z: 1.02 }]]);
      kamera(la, k);
      ltA.perbarui(tq, 0.1);
      atur(kapalA, `translate(0 ${f1(Math.sin(tq * 1.2) * 5)}) rotate(${f2(Math.sin(tq * 0.9) * 0.6)} 1200 600)`);
      atur(bdrA, `skewY(${l % 2 ? 4 : -3})`);
      const nyalaKD = P(tq, tKD - 0.1, 0.3) * (1 - P(tq, L.sekda.end, 0.4) * 0.6);
      kd.perbarui(tq, nyalaKD);
      const sudut = tq < tKompas ? Math.sin(tq * 2.3) * 70 : lerp(Math.sin(tKompas * 2.3) * 70, 0, E.out(P(tq, tKompas, 0.8)));
      sk.perbarui(tq, P(tq, tSK - 0.1, 0.3) * (1 - P(tq, L.upr.start, 0.4) * 0.6), sudut);
      lenting(lbKD, tq, tKD, L.sekda.start - 0.2, l, 1);
      lenting(lbSK, tq, tSK, L.upr.start - 0.2, l, 2);
      tampil(salah, tq >= tOp - 0.1 && tq < L.kd.start);
      lenting(lbOp, tq, tOp, L.kd.start - 0.3, l, 3); lenting(lbIns, tq, tIns, L.kd.start - 0.3, l, 4);
      tampil(x1, tq >= tBukan); tampil(x2, tq >= tIns + 0.3);
      lenting(panahArah, tq, tArah, L.sekda.start, l, 5);
      panahSama.forEach((g, i) => lenting(g, tq, tKompas + 0.3 + i * 0.12, L.upr.start + 0.5, l, 6 + i));
      geladak.forEach((g, i) => { g.setAttribute('opacity', tq >= tDek[i] ? 1 : 0.25); lenting(g._lb, tq, tDek[i], L.tiga.start, l, 10 + i); });
      const lihatA = tq > L.kd.start ? 1200 : undefined;
      gerakBoneka(syahA, t, { x: 300, y: 930, s: 0.92, lihat: lihatA, kanan: (tq > tKD - 0.2 && tq < L.upr.end) ? -92 + Math.sin(tq * 3) * 5 : undefined });
      gerakBoneka(ardiA, t, { x: 140, y: 960, s: 0.86, lihat: lihatA, kanan: tq > tOp - 0.1 && tq < L.operator.end ? -120 : undefined });
      gerakBoneka(gadisA, t, { x: 460, y: 960, s: 0.86, lihat: lihatA, miring: tq > L.tanya.start && tq < L.tanya.end ? 8 : 0 });
    }
    if (t >= tPerlihat.B && t < tPerlihat.C + 0.6) {
      const kB = kunciKamera(t, [[tPerlihat.B, { x: 0, y: 0, z: 1 }], [tL[0] - 0.2, { x: 0, y: 0, z: 1 }], [tL[0] + 0.3, { x: -330, y: 30, z: 1.3 }],
        [tL[1] - 0.2, { x: -330, y: 30, z: 1.3 }], [tL[1] + 0.4, { x: 220, y: 60, z: 1.32 }], [tL[2] - 0.2, { x: 220, y: 60, z: 1.32 }], [tL[2] + 0.5, { x: 600, y: -40, z: 1.22 }], [L.lini3.end, { x: 600, y: -40, z: 1.22 }]]);
      kamera(lb, kB);
      ltB.perbarui(tq, 0.15);
      mcB.perbarui(tq, l, 1);
      const kx = 560 + Math.sin(tq * 0.4) * 30;
      atur(kapalB, `translate(${f1(kx)} ${f1(ltB.fTengah(kx, tq, 0.15) + 22)}) rotate(${f2(Math.sin(tq * 1.6) * 2)})`);
      atur(kapalB.bendera, `skewY(${l % 2 ? 5 : -4})`);
      const px = 1120 + Math.cos(tq * 0.5) * 120;
      atur(patroli, `translate(${f1(px)} ${f1(ltB.fTengah(px, tq, 0.15) + 18)}) rotate(${f2(Math.sin(tq * 2) * 2.5)})`);
      patroli.perbarui(tq, l);
      gerakBoneka(ardiB, t, { x: 40, y: -38, s: 0.36, kanan: tq > tL[0] && tq < L.lini1.end ? -150 + Math.sin(tq * 12) * 12 : undefined });
      gerakBoneka(gadisB, t, { x: 150, y: -38, s: 0.36 });
      gerakBoneka(petugas, t, { x: 110, y: -34, s: 0.38, kanan: tq > tL[1] && tq < L.lini2.end ? -112 : -20 });
      gerakBoneka(mercuB, t, { x: 1590, y: 650, s: 0.5, kiri: tq > tL[2] && tq < L.lini3.end ? 120 : 20 });
      gerakBoneka(syahB, t, { x: 120, y: 1040, s: 0.62, lihat: 900 });
      tampil(judul3, tq >= tTri - 0.1 && tq < tL[0] + 0.4);
      huruf3.forEach((g, i) => { const u = E.back(P(tq, tTri + i * 0.03, 0.22)); atur(g, `translate(0 ${f1((1 - u) * -260)}) ${getar(200 + i, l, g._x, g._y)}`); });
      const posBendera = [[kx + 60, 330], [px + 20, 420], [1740, 250]];
      benderaLini.forEach((g, i) => {
        const u = hidup(tq, tL[i] + 0.1, tPerlihat.C);
        tampil(g, u > 0.001);
        atur(g, `translate(${f1(posBendera[i][0])} ${f1(posBendera[i][1] + Math.sin(tq * 2 + i) * 6)}) scale(${f2(u)}) rotate(${f2(Math.sin(tq * 1.5 + i) * 2)})`);
      });
      aturStempel(independen, tq, tIndep, -8);
      tampil(independen, tq >= tIndep && tq < tPerlihat.C + 0.6);
    }
    if (t >= tPerlihat.C) {
      pc.perbarui(t, kunciKamera(t, [[tPerlihat.C, { x: 280, y: -60, z: 1.06 }], [info.end, { x: 300, y: -60, z: 1.08 }]]));
      kartuPeran.forEach((g, i) => {
        const u = E.back(P(tq, tPeran[i] - 0.1, 0.3));
        tampil(g, tq >= tPeran[i] - 0.1 && tq < tSatu - 0.1);
        atur(g, `translate(${g._x} ${g._y}) scale(${f2(u)}) rotate(${f2((i - 1) * 0.8)}) translate(${-g._x} ${-g._y})`);
        g._kk.setAttribute('opacity', tq > tPeran[i] + 0.2 && i < 2 && tq > tPeran[i + 1] ? 0.55 : 1);
        g._butir.forEach((b, j) => tampil(b, tq >= tButir[i][j] - 0.05));
      });
      lenting(satuOrang, tq, tSatu - 0.1, info.end, l, 30);
      lenting(tebak, tq, tTebak - 0.4, info.end, l, 31);
      tampil(xTebak, tq >= tTebak);
      const lihatC = 1490;
      gerakBoneka(syahC, t, { lihat: lihatC, kanan: tq > tPeran[0] && tq < L.pjp.end ? -86 + Math.sin(tq * 3) * 4 : undefined });
      gerakBoneka(ardiC, t, { lihat: lihatC });
      gerakBoneka(gadisC, t, { lihat: lihatC, kanan: tq > tTebak - 0.3 && tq < L.boleh.end ? -110 : undefined });
    }
  };
};
