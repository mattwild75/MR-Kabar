// ═══════════════════════════════════════════════════════════════════════════
// PEMBUKA · Badai yang datang terlalu cepat
// Badai malam -> "Tunggu." membekukan gambar -> lembar badai tergulung ke atas
// -> dermaga pagi Meulaboh -> peta dibuka -> kartu judul -> "Yuk, berlayar!"
// ═══════════════════════════════════════════════════════════════════════════
window.ADEGAN = window.ADEGAN || {};

function perahuNelayan(induk, s = 1, warna = '#c8553d') {
  const g = el('g', { filter: 'url(#b1)' }, induk);
  kertas([[-70 * s, -14 * s], [74 * s, -14 * s], [52 * s, 10 * s], [-54 * s, 10 * s]], warna, g, { amp: 0.6 });
  kertas(kotak(-70 * s, -18 * s, 144 * s, 6 * s), '#fefcf3', g, { amp: 0.3 });
  kertas([[-4 * s, -110 * s], [44 * s, -24 * s], [-4 * s, -22 * s]], '#fefcf3', g, { amp: 0.6 });
  kertas(kotak(-7 * s, -112 * s, 4 * s, 96 * s), '#6b4226', g, { amp: 0.2 });
  for (const x of [-40, -22]) { kertas(oval(x * s, -34 * s, 7 * s, 7 * s, 12), '#3a2418', g, { amp: 0.2 }); kertas(kotak((x - 7) * s, -27 * s, 14 * s, 12 * s, 3 * s), '#2b4a6b', g, { amp: 0.2 }); }
  return g;
}

window.ADEGAN.s1 = (akar, info) => {
  const L = {
    ejek: B('Hahaha! Berangkat'), aduh: B('Aduh! Layarnya'), peta: B('Peta apa?'), ombak: B('Ombak besar datang!'),
    tunggu: B('Tunggu.'), ulang: B('Kita ulang.'), pesisir: B('Di pesisir barat Aceh'), makanya: B('Makanya kita harus'),
    pulang: B('Yang pulang selamat'), program: B('Seperti program pemerintah'), tepat: B('Tepat. Tujuannya'),
    cara: B('Cara membacanya'), yuk: B('Yuk, berlayar!'),
  };
  const tBeku = L.tunggu.start - 0.06;
  const tGulung = L.tunggu.end + 0.12, dGulung = 1.15;
  const tJudul = L.cara.end + 0.3, tJudulPergi = L.yuk.start + 0.35;

  // ════ PANGGUNG DERMAGA PAGI (di bawah) ════════════════════════════════
  const dG = el('g', {}, akar);
  const lp = [0, 0.1, 0.3, 0.55, 0.8, 1, 1.12].map((v) => lapisan(dG, v));
  langit(lp[0], 'Pagi');
  const mt = matahari(lp[1], 1500, 190);
  const awan = [[150, 170, 1], [700, 120, 0.8], [1160, 250, 0.7], [1900, 150, 1.05], [2500, 220, 0.9]].map(([x, y, s]) => awanKertas(lp[1], x, y, s));
  const mc = mercusuar(lp[2], -560, 560, 0.62);
  kotaMeulaboh(lp[2], { y: 600 });
  // pelabuhan tujuan di ujung kanan, berbendera RPJMD
  const tujuan = el('g', { filter: 'url(#b1)' }, lp[2]);
  kertas([[1680, 600], [1720, 560], [2080, 560], [2120, 600]], '#8d99ae', tujuan);
  for (const [x, w, hh] of [[1750, 70, 50], [1840, 90, 70], [1960, 60, 44]]) kertas(kotak(x, 560 - hh, w, hh), '#e9e2cf', tujuan);
  kertas(kotak(1906, 330, 7, 190), '#5b6474', tujuan, { amp: 0.2 });
  const benderaTujuan = el('g', {}, tujuan);
  kertas(kotak(1913, 334, 190, 80, 3), '#e63946', benderaTujuan, { amp: 0.7 });
  teks(benderaTujuan, 2008, 390, 'RPJMD', { bebas: true, ukuran: 58, warna: '#fdf6e3', jangkar: 'middle', spasi: 2 });
  const lt = laut(dG, { lapis: [lp[3], lp[4], lp[6]], y: [612, 700, 960] });
  const perahu = [[300, 0.9, '#c8553d'], [1250, 0.75, '#2a9d8f'], [2000, 0.8, '#e9b949']].map(([x, s, w]) => { const g = perahuNelayan(lp[3], s, w); g._x = x; g._s = s; return g; });
  // karang tersembunyi & arus & angin (Tepat. ... angin, arus, dan karang)
  const karang = el('g', { opacity: 0 }, lp[3]);
  kertas([[1640, 668], [1680, 626], [1710, 648], [1750, 604], [1790, 640], [1840, 616], [1880, 668]], '#3b3f4a', karang, { amp: 1.4 });
  const arus = [0, 1, 2].map((i) => { const g = el('g', { opacity: 0 }, lp[3]); el('path', { d: `M${1160 + i * 170} ${636 + (i % 2) * 22} q60 -22 120 0 t120 0`, stroke: '#e0f2fe', 'stroke-width': 7, fill: 'none', 'stroke-linecap': 'round' }, g); kertas([[1408 + i * 170, 624 + (i % 2) * 22], [1432 + i * 170, 636 + (i % 2) * 22], [1406 + i * 170, 648 + (i % 2) * 22]], '#e0f2fe', g, { amp: 0.3 }); return g; });
  const angin = [0, 1, 2].map((i) => el('path', { d: `M${1300 + i * 220} ${260 + i * 70} q50 -40 100 0 t100 0 q30 20 10 40`, stroke: '#fffdf5', 'stroke-width': 8, fill: 'none', 'stroke-linecap': 'round', opacity: 0, filter: 'url(#b1)' }, lp[1]));
  const kapalD = kapalAwak(lp[4], { s: 0.85, nama: 'ACEH BARAT' });
  dermaga(lp[5], -900, 2400, 742);
  kantorSyahbandar(lp[5], -40, 742);
  const papan = papanGabus(lp[5], 450, 360, 360, 250);
  const foto1 = fotoCetak(lp[5], 'pantai_meulaboh', 462, 372, 200, 150, { ket: 'Pantai Meulaboh', ukuranKet: 15 });
  const foto2 = fotoCetak(lp[5], 'nelayan_aceh', 600, 430, 196, 150, { ket: 'Nelayan Aceh', ukuranKet: 15 });
  const tali = taliLabel(lp[5], 700, 1660, 170, ['BACA LANGIT', 'PERIKSA KAPAL', 'SIAP SAAT BADAI'], { ukuran: 44, lebar: 280, tinggi: 86 });
  const syah = boneka('syahbandar', lp[5], { x: 930, y: 742 });
  const ardi = boneka('ardi', lp[5], { x: 1150, y: 742 });
  const gadis = boneka('gadis', lp[5], { x: 1350, y: 742 });
  // gelembung pikiran Gadis: PROGRAM = PELAYARAN
  const pikir = el('g', { filter: 'url(#b2)' }, lp[5]);
  for (const [x, y, r] of [[1300, 352, 10], [1282, 322, 15]]) kertas(oval(x, y, r, r, 16), '#fffdf5', pikir, { amp: 0.4 });
  kertas(kotak(1130, 190, 380, 118, 40), '#fffdf5', pikir, { amp: 1 });
  teks(pikir, 1320, 240, 'PROGRAM', { bebas: true, ukuran: 46, warna: '#1d3557', jangkar: 'middle', spasi: 2 });
  teks(pikir, 1320, 288, '= PELAYARAN', { bebas: true, ukuran: 40, warna: '#e63946', jangkar: 'middle', spasi: 2 });
  // lapisan layar (melekat): peta dibuka, kartu judul
  const ui = lapisan(dG, 0);
  const peta = gulungan(ui, 520, 170, 880, 600);
  fotoCetak(peta.isi, 'peta_aceh', 548, 198, 824, 544, { tepi: 0, selotip: false, posisi: 'xMidYMid slice' }).setAttribute('opacity', 0.55);
  el('path', { d: 'M640 640 C760 560 820 420 980 400 S1200 300 1290 240', stroke: '#c1121f', 'stroke-width': 7, 'stroke-dasharray': '2 16', 'stroke-linecap': 'round', fill: 'none' }, peta.isi);
  for (const [x, y] of [[640, 640], [820, 470], [1000, 398], [1180, 300], [1290, 240]]) kertas(oval(x, y, 14, 14, 16), '#e63946', peta.isi, { amp: 0.4 });
  const lencana = el('g', { filter: 'url(#b3)' }, peta.isi);
  kertas(oval(960, 560, 118, 118, 50), '#fffdf5', lencana, { amp: 1 });
  el('image', { href: 'aset/img/MRKabar-lengkap.png', x: 860, y: 466, width: 200, height: 186 }, lencana);
  const judulPeta = judulKertas(peta.isi, 960, 296, 'PETA RISIKO', { ukuran: 90, jangkar: 'middle', warna: '#fdf6e3', bayang: '#1d3557' });
  // kartu judul
  const judul = el('g', {}, ui);
  const tirai = el('rect', { x: 0, y: 0, width: 1920, height: 1080, fill: '#0f2236', opacity: 0 }, judul);
  const hurufJudul = [
    ...hurufGuntingan(judul, 'BERLAYAR DENGAN', 960, 480, 160, { warna: '#fdf6e3', bayang: '#1d3557', geser: 7 }),
    ...hurufGuntingan(judul, 'PETA RISIKO', 960, 676, 210, { warna: '#f2c46b', bayang: '#1d3557', geser: 8 }),
  ];
  const logoJ = el('g', { filter: 'url(#b3)' }, judul);
  kertas(oval(960, 214, 120, 120, 50), '#fffdf5', logoJ, { amp: 1.2 });
  el('image', { href: 'aset/img/MRKabar-lengkap.png', x: 860, y: 121, width: 200, height: 186 }, logoJ);
  const pitaJ = el('g', { filter: 'url(#b3)' }, judul);
  kertas([[520, 750], [470, 780], [520, 812], [560, 812], [560, 750]], '#9d0208', pitaJ, { amp: 0.8 });
  kertas([[1400, 750], [1450, 780], [1400, 812], [1360, 812], [1360, 750]], '#9d0208', pitaJ, { amp: 0.8 });
  kertas(kotak(540, 738, 840, 66, 4), '#e63946', pitaJ, { amp: 1 });
  teks(pitaJ, 960, 783, 'VIDEO EDUKASI MANAJEMEN RISIKO', { bebas: true, ukuran: 46, warna: '#fdf6e3', jangkar: 'middle', spasi: 3 });

  // ════ PANGGUNG BADAI MALAM (di atas, tergulung pergi) ════════════════
  const cpId = 'potongBadai';
  const cp = el('clipPath', { id: cpId }, akar);
  const potong = el('rect', { x: -10, y: -10, width: 1940, height: 1100 }, cp);
  const bG = el('g', { 'clip-path': `url(#${cpId})` }, akar);
  const lb = [0, 0.15, 0.5, 0.8, 1, 1.15].map((v) => lapisan(bG, v));
  langit(lb[0], 'Badai');
  for (const [x, y, s] of [[200, 120, 1.3], [900, 90, 1.1], [1700, 130, 1.4], [2300, 100, 1.2]]) awanKertas(lb[1], x, y, s, '#343b57');
  const kilatBesar1 = kilatBesar(lb[1], 520, 140, 1.1), kilatBesar2 = kilatBesar(lb[1], 1720, 120, 1.25);
  const bdi = siBadai(lb[1]);
  const ltB = laut(bG, { lapis: [lb[2], lb[3], lb[5]], warna: ['#2d4f73', '#1d3a5c', '#0e2742'], buih: ['#9fb6cc', '#7f9ab5'], y: [640, 730, 975] });
  const raksasa = el('g', { filter: 'url(#b3)' }, lb[3]);
  kertas([[-420, 420], [-380, 60], [-260, -180], [-60, -300], [160, -320], [320, -250], [380, -120], [300, -60], [200, -120], [120, -80], [160, 40], [260, 200], [380, 420]], '#1d3a5c', raksasa, { amp: 2.4, langkah: 16 });
  kertas([[-60, -300], [160, -320], [320, -250], [380, -120], [300, -60], [200, -120], [250, -190], [140, -250], [-20, -258]], '#cfe3f1', raksasa, { amp: 2, langkah: 12 });
  const kapalB = kapalAwak(lb[4], { s: 0.9, nama: 'ACEH BARAT' });
  const ardiB = boneka('ardi', kapalB.awak, { x: 34, y: -52, s: 0.42 });
  const gadisB = boneka('gadis', kapalB.awak, { x: 176, y: -52, s: 0.42 });
  const hj = hujan(bG, { jumlah: 170, opasitas: 0.5 });
  // tangan Pak Syahbandar: "Tunggu." (berwarna, di luar lembar badai)
  const tangan = el('g', { filter: 'url(#b3)' }, akar);
  kertas(kotak(120, 40, 560, 130, 32), '#f5f3ee', tangan, { amp: 1 });
  kertas(kotak(120, 40, 44, 130), '#1d3557', tangan, { amp: 0.6 });
  kertas(kotak(126, 40, 10, 130), '#f2c46b', tangan, { amp: 0.3 });
  kertas(kotak(-6, 30, 150, 150, 50), '#bf8458', tangan, { amp: 1 });
  kertas(oval(40, -40, 96, 112, 44), '#bf8458', tangan, { amp: 1 });
  for (const [x, p] of [[-46, 150], [-8, 172], [32, 166], [70, 140]]) kertas(kotak(x - 17, -40 - p, 34, p + 10, 17), '#bf8458', tangan, { amp: 0.8 });
  const jempol = el('g', { transform: 'rotate(-38 -40 10)' }, tangan);
  kertas(kotak(-130, -6, 120, 40, 20), '#bf8458', jempol, { amp: 0.8 });
  for (const x of [-46, -8, 32, 70]) el('path', { d: 'M' + (x - 9) + ' -10 Q' + x + ' -16 ' + (x + 9) + ' -10', stroke: '#9e6a45', 'stroke-width': 3, fill: 'none' }, tangan);
  // gulungan lembar badai: silinder kertas yang naik
  const silinder = el('g', { filter: 'url(#b3)' }, akar);
  kertas(kotak(-20, -34, 1960, 68, 30), 'url(#gulung)', silinder, { amp: 1 });

  // ════ ISYARAT BUNYI, SUASANA, MUSIK ═══════════════════════════════════
  const tKilat = [0.35, W(L.ejek, 'laut'), L.aduh.start + 0.05, W(L.ombak, 'datang'), L.peta.end - 0.2];
  tKilat.forEach((x, i) => bunyi(x + 0.18, 'guruh', i === 0 ? 0.9 : 0.7));
  const tSobek = W(L.aduh, 'layar') - 0.35;
  bunyi(tSobek, 'sobek', 0.9);
  bunyi(W(L.ombak, 'ombak') - 0.2, 'gemuruh', 0.85);
  bunyi(tBeku, 'beku', 0.8);
  bunyi(tGulung, 'gulung', 1.0);
  bunyi(L.tunggu.start - 0.12, 'desir', 0.5);
  suasana(0, { angin: 0.95, hujan: 0.85, ombak: 1 });
  suasana(tBeku, { angin: 0.95, hujan: 0.85, ombak: 1 });
  suasana(tBeku + 0.1, { angin: 0, hujan: 0, ombak: 0 });
  suasana(tGulung + 1.0, { angin: 0, hujan: 0, ombak: 0 });
  suasana(tGulung + 1.8, { angin: 0.2, hujan: 0, ombak: 0.45, camar: 0.7 });
  musik(0, 'badai');
  musik(tBeku, 'senyap');
  musik(tGulung + 0.8, 'dermaga');
  musik(tJudul, 'judul');
  musik(L.yuk.start, 'dermaga', { lanjut: true });
  const tLabel = [W(L.pulang, 'membaca'), W(L.pulang, 'memeriksa'), W(L.pulang, 'berbuat')];
  tLabel.forEach((x) => bunyi(x, 'pop', 0.55));
  bunyi(L.program.start + 0.2, 'pop', 0.5);
  bunyi(W(L.tepat, 'tertulis') - 0.1, 'kibar', 0.5);
  bunyi(W(L.tepat, 'angin'), 'desir', 0.5);
  bunyi(W(L.tepat, 'arus'), 'percik', 0.5);
  bunyi(W(L.tepat, 'karang'), 'boom', 0.35);
  bunyi(L.cara.start + 0.1, 'kertas', 0.7);
  bunyi(W(L.cara, 'em') - 0.05, 'stempel', 0.7);
  hurufJudul.forEach((g, i) => bunyi(tJudul + 0.35 + i * 0.06, 'pop', 0.4));
  bunyi(tJudul + 0.15, 'whoosh', 0.6);
  bunyi(tJudul + 1.5, 'stempel', 0.6);
  bunyi(tJudulPergi, 'whoosh', 0.6);
  bunyi(W(L.yuk, 'pelajaran'), 'klakson', 0.7);
  for (const x of [2.4, 9.5, 17.0, 26.0]) bunyi(tGulung + 1.6 + x, 'camar', 0.5);

  return (t) => {
    // ── badai (beku sejak "Tunggu.")
    const tb = Math.min(t, tBeku);
    const tqb = tStop(tb), lbk = langkahDari(tb);
    const gul = P(t, tGulung, dGulung);
    tampil(bG, gul < 1);
    if (gul < 1) {
      const goyang = t < tBeku ? (h(lbk * 3.3) - 0.5) * 12 : 0;
      const kb = kunciKamera(tb, [[0, { x: 0, y: 0, z: 1 }], [L.ombak.start, { x: 50, y: -20, z: 1.07 }], [tBeku, { x: 110, y: -40, z: 1.14 }]]);
      kamera(lb, { x: kb.x + goyang, y: kb.y + goyang * 0.4, z: kb.z });
      ltB.perbarui(tqb, 0.85);
      const kx = 900 + Math.sin(tqb * 0.6) * 50;
      atur(kapalB, `translate(${f1(kx)} ${f1(ltB.fTengah(kx, tqb, 0.85) + 34)}) rotate(${f2(Math.sin(tqb * 2.3) * 9 + Math.cos(tqb * 1.3) * 3)})`);
      kapalB.sobek(tb >= tSobek);
      atur(kapalB.bendera, `skewY(${lbk % 2 ? 9 : -7})`);
      gerakBoneka(ardiB, tb, { x: 34, y: -52, s: 0.42, kiri: 150 + Math.sin(tqb * 9) * 6, kanan: kalimatPada('ardi', tqb) ? -110 : -40, lihat: 300, simak: false });
      gerakBoneka(gadisB, tb, { x: 176, y: -52, s: 0.42, kiri: 40, kanan: kalimatPada('gadis', tqb) ? -150 : -60, lihat: 0, simak: false });
      gerakBadai(bdi, tb, { x: 1280, y: 220, s: 1.05, lihat: -0.6 });
      const uRaks = E.out(P(tqb, W(L.ombak, 'ombak') - 0.2, L.tunggu.start - W(L.ombak, 'ombak')));
      tampil(raksasa, uRaks > 0);
      atur(raksasa, `translate(${f1(lerp(2300, 1500, uRaks))} ${f1(lerp(1050, 520, uRaks))}) scale(${f2(lerp(0.6, 1.15, uRaks))}) rotate(${f2(Math.sin(tqb * 3) * 2)})`);
      hj.perbarui(tqb, lbk, 1);
      let kil = 0;
      for (const x of tKilat) if (tb >= x && tb < x + 0.17) kil = 1;
      tampil(kilatBesar1, kil && lbk % 2 === 0); tampil(kilatBesar2, kil && lbk % 2 === 1);
      if (t < tBeku) window.kilat(kil * 0.3);
      bG.setAttribute('filter', t >= tBeku ? 'url(#abu)' : '');
      const sisa = 1 - E.inout(gul);
      potong.setAttribute('height', f1(1100 * sisa));
    }
    // tangan "Tunggu."
    const uT = E.back(P(t, L.tunggu.start - 0.12, 0.3)) * (1 - E.in(P(t, tGulung + 0.25, 0.35)));
    tampil(tangan, uT > 0.001);
    atur(tangan, `translate(${f1(lerp(2300, 1480, uT))} 560) rotate(${f2(-6 + Math.sin(t * 2) * 1.5)})`);
    // silinder gulungan
    tampil(silinder, gul > 0 && gul < 1);
    atur(silinder, `translate(0 ${f1(1100 * (1 - E.inout(gul)) - 10)})`);

    // ── dermaga pagi
    tampil(dG, t >= tGulung);
    if (t < tGulung) return;
    const tq = tStop(t), l = langkahDari(t);
    const k = kunciKamera(t, [
      [tGulung, { x: 0, y: 0, z: 1 }], [L.pesisir.start, { x: -420, y: -10, z: 1.06 }], [W(L.pesisir, 'laut') + 0.2, { x: 120, y: 0, z: 1 }],
      [L.makanya.start, { x: 140, y: 30, z: 1.1 }], [L.pulang.start + 0.2, { x: 160, y: -30, z: 1.0 }], [L.program.start, { x: 220, y: 0, z: 1.1 }],
      [W(L.tepat, 'dermaga'), { x: 640, y: -10, z: 0.98 }], [L.cara.start, { x: 200, y: 0, z: 1 }], [L.yuk.end, { x: 260, y: 0, z: 1 }],
    ]);
    kamera(lp, k);
    mt.perbarui(tq, l);
    awan.forEach((g, i) => atur(g, `translate(${f1(tq * 9 * (1 + (i % 2)))} 0) ${getar(810 + i, l, g._x, g._y)}`));
    mc.perbarui(tq, l, 1);
    lt.perbarui(tq, 0);
    perahu.forEach((g, i) => { const x = g._x + Math.sin(tq * 0.3 + i) * 30; atur(g, `translate(${f1(x)} ${f1(612 + 7 * Math.sin(x * 0.02 + tq * 2.2) + 4)}) rotate(${f2(Math.sin(tq * 2 + i) * 4)})`); });
    atur(kapalD, `translate(1700 ${f1(lt.fTengah(1700, tq) + 28)}) rotate(${f2(Math.sin(tq * 1.4) * 1.2)})`);
    atur(kapalD.bendera, `skewY(${l % 2 ? 4 : -3})`);
    atur(benderaTujuan, `skewY(${l % 2 ? 3 : -2})`);
    // foto ditempel saat "nelayan"
    const tF = W(L.pesisir, 'nelayan');
    [foto1, foto2].forEach((f, i) => { const u = E.back(P(tq, tF + i * 0.25, 0.3)); tampil(f, tq >= tF + i * 0.25); atur(f, `translate(${f._cx} ${f._cy}) rotate(${(i ? 4 : -3) + (1 - u) * 20}) scale(${f2(u)}) translate(${-f._cx} ${-f._cy})`); });
    // tiga label di tali
    tali._item.forEach((g, i) => ayunLabel(g, tq, tLabel[i], l, i));
    tampil(tali, tq >= tLabel[0] - 0.1 && tq < L.program.start + 0.1);
    // gelembung pikiran Gadis
    const uP = hidup(tq, L.program.start + 0.15, L.program.end + 0.4);
    tampil(pikir, uP > 0.001);
    atur(pikir, `translate(1290 340) scale(${f2(uP)}) translate(-1290 -340) ${getar(77, l, 1320, 250)}`);
    // angin, arus, karang
    const uA = P(tq, W(L.tepat, 'angin'), 0.4) * (1 - P(tq, L.cara.start, 0.4));
    angin.forEach((p, i) => { p.setAttribute('opacity', f2(uA * 0.9)); atur(p, `translate(${f1(((tq * 120 + i * 90) % 260) - 130)} 0)`); });
    const uR = P(tq, W(L.tepat, 'arus'), 0.4) * (1 - P(tq, L.cara.start, 0.4));
    arus.forEach((g, i) => { g.setAttribute('opacity', f2(uR)); atur(g, `translate(${f1(((tq * 60 + i * 40) % 120) - 60)} 0)`); });
    karang.setAttribute('opacity', f2(0.75 * P(tq, W(L.tepat, 'karang'), 0.5) * (1 - P(tq, L.cara.start, 0.4))));
    // tokoh: Ardi & Gadis datang dari kiri
    const jalanA = E.inout(P(tq, tGulung + 0.5, 2.6)), jalanG = E.inout(P(tq, tGulung + 1.0, 2.6));
    const pergi = E.inout(P(tq, W(L.yuk, 'pelajaran'), 2.2));
    const xA = lerp(-420, 1150, jalanA) + pergi * 520, xG = lerp(-600, 1350, jalanG) + pergi * 470;
    const ulangTunjuk = P(tq, W(L.ulang, 'dermaga') - 0.15, 0.25) * (1 - P(tq, L.ulang.end + 0.4, 0.3));
    gerakBoneka(syah, t, { kanan: ulangTunjuk > 0 ? lerp(-10, -118, E.out(ulangTunjuk)) : undefined, lihat: L.yuk.start < tq ? 1600 : undefined });
    const tunjukA = P(tq, L.makanya.start, 0.25) * (1 - P(tq, L.makanya.end + 0.3, 0.3));
    gerakBoneka(ardi, t, { x: xA, lompat: (jalanA > 0 && jalanA < 1) || (pergi > 0 && pergi < 1) ? 1 : tunjukA > 0 ? 0.6 : 0, kanan: tunjukA > 0 ? lerp(-10, -100, E.out(tunjukA)) : (tq > L.yuk.start - 0.1 && tq < W(L.yuk, 'pelajaran') ? -150 + Math.sin(tq * 14) * 14 : undefined) });
    gerakBoneka(gadis, t, { x: xG, lompat: (jalanG > 0 && jalanG < 1) || (pergi > 0 && pergi < 1) ? 1 : 0, kanan: tq > L.yuk.start - 0.1 && tq < W(L.yuk, 'pelajaran') ? -150 + Math.sin(tq * 14 + 1) * 14 : undefined, miring: tq > L.program.start && tq < L.program.end ? 9 : 0 });
    // peta dibuka (Cara membacanya ...)
    const uPeta = E.out(P(tq, L.cara.start + 0.05, 0.9)) * (1 - E.in(P(tq, tJudul - 0.05, 0.45)));
    tampil(peta, uPeta > 0.001);
    peta.buka(uPeta);
    atur(peta, `translate(0 ${f1(E.in(P(tq, tJudul - 0.05, 0.45)) * -900)}) ${getar(88, l, 960, 470, 0.6)}`);
    const uLenc = E.back(P(tq, W(L.cara, 'em') - 0.05, 0.3));
    atur(lencana, `translate(960 560) scale(${f2(uLenc)}) rotate(${f2(-6 + Math.sin(l * 1.3) * 1.5)}) translate(-960 -560)`);
    // kartu judul
    const ujd = P(t, tJudul, 0.3), pergiJ = E.in(P(t, tJudulPergi, 0.45));
    tampil(judul, t >= tJudul && pergiJ < 1);
    tirai.setAttribute('opacity', f2(0.62 * ujd * (1 - pergiJ)));
    hurufJudul.forEach((g, i) => {
      const t0 = tJudul + 0.35 + i * 0.06, u = E.back(P(tq, t0, 0.24));
      tampil(g, tq >= t0);
      atur(g, `translate(0 ${f1((1 - u) * -420 - pergiJ * 900)}) ${getar(700 + i, l, g._x, g._y, 1.4)}`);
    });
    const uL = E.back(P(tq, tJudul + 0.15, 0.35));
    atur(logoJ, `translate(960 214) scale(${f2(uL)}) rotate(${f2(Math.sin(l * 1.7) * 2)}) translate(-960 ${-214 - pergiJ * 900})`);
    const uPt = E.out(P(tq, tJudul + 1.5, 0.34));
    tampil(pitaJ, tq >= tJudul + 1.5);
    atur(pitaJ, `translate(960 775) scale(${f2(uPt)} ${f2(0.6 + 0.4 * uPt)}) translate(-960 ${-775 + pergiJ * 700}) ${getar(880, l, 960, 775, 0.6)}`);
  };
};
