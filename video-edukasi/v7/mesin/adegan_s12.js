// ═══════════════════════════════════════════════════════════════════════════
// PENUTUP · Badai kedua & tiga pelajaran
// A. badai senja kembali, awak siap, mercusuar menyala -> Si Badai jadi pelangi
// B. dermaga senja: tiga pelajaran + langkah pertama
// C. pulang: logo resmi, slogan, hak cipta, kredit foto
// ═══════════════════════════════════════════════════════════════════════════
window.ADEGAN.s12 = (akar, info) => {
  const L = {
    kembali: B('Hahaha! Aku kembali'), siap: B('Kami sudah siap'), menyala: B('Dan mercusuar menyala'), bosan: B('Hmph. Kalian'),
    lalu: B('Lalu, apa pelajarannya'), p1: B('Pertama. Risiko bukan'), p2: B('Kedua. Pengendalian'), p3: B('Ketiga. Satu alur'),
    langkah: B('Langkah pertama hari ini'), disusun: B('Video ini disusun'), laut: B('Laut memang tidak pernah'), slogan: B('MR Kabar. // Risiko'.replace(' // ', ' ')),
    hak: B('Copyright ©'),
  };
  // ══ A. BADAI KEDUA ══════════════════════════════════════════════════════
  const gA = el('g', {}, akar);
  const la = [0, 0.15, 0.45, 0.8, 1, 1.15].map((v) => lapisan(gA, v));
  const langitBadai = langit(la[0], 'Badai');
  const langitCerah = el('g', { opacity: 0 }, la[0]); langit(langitCerah, 'Senja');
  for (const [x, y, s] of [[300, 120, 1.2], [1100, 90, 1.1], [1800, 130, 1.3]]) awanKertas(la[1], x, y, s, '#3d4460');
  const pl = pelangi(la[1], 1100, 640, 520);
  const bdi = siBadai(la[1]);
  const lt = laut(gA, { lapis: [la[2], la[3], la[5]], warna: ['#3a5f86', '#24496f', '#123456'], buih: ['#b6c8db', '#93abc4'], y: [620, 700, 990] });
  const mc = mercusuar(la[3], 1650, 640, 0.95);
  kertas([[1450, 700], [1520, 640], [1650, 620], [1800, 630], [1950, 700]], '#5b6474', la[3], { amp: 1.2, attr: { filter: 'url(#b2)' } });
  const mercuA = boneka('mercusuar', la[3], { x: 1560, y: 650, s: 0.42 });
  const kapal = kapalAwak(la[4], { s: 0.8, nama: 'ACEH BARAT' });
  const ardiA = boneka('ardi', kapal.awak, { x: 40, y: -42, s: 0.4 });
  const gadisA = boneka('gadis', kapal.awak, { x: 160, y: -42, s: 0.4 });
  const petaA = el('g', { filter: 'url(#b2)' }, kapal.awak);
  kertas(kotak(216, -150, 90, 64, 3), 'url(#kertasLama)', petaA, { amp: 0.5 });
  const patroli = kapalPatroli(la[4], { s: 0.7 });
  const hj = hujan(gA, { jumlah: 110, opasitas: 0.45 });

  // ══ B. TIGA PELAJARAN ══════════════════════════════════════════════════
  const gB = el('g', {}, akar);
  const pb = panggungDermaga(gB, { langit: 'Senja', kapalX: 2300, matahari: { warna: '#f97316', dalam: '#fb923c', sinar: '#fdba74' }, my: 420, mx: 1500 });
  const b5 = pb.lp[5];
  const syah = boneka('syahbandar', b5, { x: 380, y: 742 });
  const ardi = boneka('ardi', b5, { x: 590, y: 742 });
  const gadis = boneka('gadis', b5, { x: 800, y: 742 });
  const PEL = [['PELAJARAN 1', 'DIKENALI', 'Risiko bukan untuk ditakuti, tapi untuk dikenali.', '#e63946'],
    ['PELAJARAN 2', 'DIJALANKAN', 'Pengendalian bukan dokumen, tapi tindakan.', '#2a9d8f'],
    ['PELAJARAN 3', 'DITEPATI', 'Satu alur data membuat janji RPJMD ditepati.', '#1f4ea3']];
  el('path', { d: 'M980 120 Q1440 170 1900 120', stroke: '#7a5230', 'stroke-width': 4, fill: 'none' }, b5);
  const kartuP = PEL.map(([no, kata, isi, w], i) => {
    const g = el('g', {}, b5);
    const x = 1000 + i * 300, y = 150 + (i === 1 ? 10 : 0);
    const kk = el('g', { filter: 'url(#b3)' }, g);
    kertas(kotak(x, y, 280, 360, 8), '#fffdf5', kk, { amp: 1 });
    kertas(kotak(x, y, 280, 70, 8), w, kk, { amp: 0.6 });
    teks(kk, x + 140, y + 48, no, { bebas: true, ukuran: 40, warna: '#fdf6e3', jangkar: 'middle', spasi: 2 });
    teks(kk, x + 140, y + 150, kata, { bebas: true, ukuran: 62, warna: w, jangkar: 'middle' });
    teksBaris(kk, x + 140, y + 220, isi, { ukuran: 24, tebal: 700, warna: '#1d3557', jangkar: 'middle', maks: 19, jarak: 30 });
    el('rect', { x: x + 132, y: y - 20, width: 16, height: 36, rx: 4, fill: '#c9a46c' }, g);
    g._x = x + 140; g._y = y + 180;
    return g;
  });
  const LK = ['DATA UMUM', 'CEE', 'KRS', 'RISIKO PERTAMA', 'MENU PANDUAN'];
  const langkah = LK.map((isi, i) => { const g = el('g', { filter: 'url(#b2)' }, b5); const x = 1020 + (i % 3) * 290, y = 560 + Math.floor(i / 3) * 90; kertas(kotak(x, y, 270, 72, 36), i === 4 ? '#e9b949' : '#1d3557', g, { amp: 0.8 }); teks(g, x + 135, y + 48, (i < 4 ? (i + 1) + '. ' : '') + isi, { bebas: true, ukuran: 38, warna: i === 4 ? '#1d3557' : '#fdf6e3', jangkar: 'middle', spasi: 1 }); g._x = x + 135; g._y = y + 36; return g; });

  // ══ C. PULANG: LOGO RESMI, HAK CIPTA, KREDIT ════════════════════════════
  const gC = el('g', {}, akar);
  const lc = [0, 0.1, 0.4, 0.8, 1].map((v) => lapisan(gC, v));
  langit(lc[0], 'Senja');
  const mtC = matahari(lc[1], 960, 600, { warna: '#f97316', dalam: '#fb923c', sinar: '#fdba74' });
  const ltC = laut(gC, { lapis: [lc[2], lc[3], lc[4]], warna: ['#5b6fa8', '#43578f', '#2c3e70'], buih: ['#f6c49a', '#e8a678'], y: [640, 720, 990] });
  const kapalC = kapalAwak(lc[3], { s: 0.45, nama: 'ACEH BARAT' });
  const ui = lapisan(gC, 0);
  const logo = el('g', { filter: 'url(#b3)' }, ui);
  kertas(oval(960, 300, 190, 190, 60), '#fffdf5', logo, { amp: 1.6 });
  el('image', { href: 'aset/img/MRKabar-lengkap.png', x: 800, y: 150, width: 320, height: 298 }, logo);
  logo._x = 960; logo._y = 300;
  const pita = el('g', { filter: 'url(#b3)' }, ui);
  kertas([[480, 540], [430, 572], [480, 604], [520, 604], [520, 540]], '#9d0208', pita, { amp: 0.8 });
  kertas([[1440, 540], [1490, 572], [1440, 604], [1400, 604], [1400, 540]], '#9d0208', pita, { amp: 0.8 });
  kertas(kotak(500, 526, 920, 72, 4), '#e63946', pita, { amp: 1 });
  teks(pita, 960, 578, 'RISIKO TERKABAR, DAERAH TERJAGA', { bebas: true, ukuran: 54, warna: '#fdf6e3', jangkar: 'middle', spasi: 3 });
  pita._x = 960; pita._y = 562;
  const lembaga = el('g', {}, ui);
  teks(lembaga, 960, 680, 'Disusun Inspektorat Kabupaten Aceh Barat', { ukuran: 34, tebal: 800, warna: '#fdf6e3', jangkar: 'middle', attr: { stroke: '#1d3557', 'stroke-width': 5, 'paint-order': 'stroke' } });
  teks(lembaga, 960, 728, 'mengacu pada Peraturan Deputi PPKD BPKP Nomor 4 Tahun 2019', { ukuran: 26, tebal: 700, warna: '#fdf6e3', jangkar: 'middle', attr: { stroke: '#1d3557', 'stroke-width': 4, 'paint-order': 'stroke' } });
  const hak = el('g', { filter: 'url(#b2)' }, ui);
  kertas(kotak(260, 800, 1400, 70, 8), '#1d3557', hak, { amp: 1 });
  teks(hak, 960, 846, 'Copyright © 2026, System Architecture & Development by Nurhikmat Muhammad, Inspektorat Aceh Barat.', { ukuran: 26, tebal: 700, warna: '#fdf6e3', jangkar: 'middle' });
  hak._x = 960; hak._y = 835;
  // kredit foto (Wikimedia Commons) + bahan
  const kredit = el('g', {}, ui);
  const krLatar = el('rect', { x: 0, y: 0, width: 1920, height: 1080, fill: '#0f2236', opacity: 0.95 }, kredit);
  teks(kredit, 960, 120, 'KREDIT', { bebas: true, ukuran: 70, warna: '#f2c46b', jangkar: 'middle', spasi: 6 });
  teks(kredit, 960, 180, 'Foto asli dari Wikimedia Commons, dipakai sesuai lisensinya:', { ukuran: 26, tebal: 700, warna: '#fdf6e3', jangkar: 'middle' });
  const DIPAKAI = ['badai_laut', 'senja_meulaboh', 'masjid_meulaboh', 'pantai_meulaboh', 'nelayan_aceh', 'tarik_pukat', 'perahu_aceh', 'perahu_usaid', 'peta_aceh', 'mercusuar_breueh', 'tpi_kapal', 'tpi_suasana', 'ikan_banda_aceh', 'pelangi_meulaboh'];
  const K = window.KREDIT || {};
  DIPAKAI.forEach((k, i) => {
    const x = i < 7 ? 520 : 1400, y = 250 + (i % 7) * 70;
    const c = K[k] || {};
    teks(kredit, x, y, (c.judul || k).replace(/\.jpg$/i, ''), { ukuran: 22, tebal: 800, warna: '#fdf6e3', jangkar: 'middle' });
    teks(kredit, x, y + 28, `${c.pembuat || ''} · ${c.lisensi || ''}`, { ukuran: 19, tebal: 600, warna: '#9fb6cc', jangkar: 'middle' });
  });
  teks(kredit, 960, 790, 'Animasi paper cut, musik, dan efek suara orisinal · suara tokoh sintetis', { ukuran: 26, tebal: 700, warna: '#fdf6e3', jangkar: 'middle' });
  teks(kredit, 960, 840, 'MR Kabar · Manajemen Risiko Kabupaten Aceh Barat', { bebas: true, ukuran: 44, warna: '#f2c46b', jangkar: 'middle', spasi: 2 });

  // ── waktu
  const tA = info.start, tPelangi = L.bosan.end - 0.2, tB = L.lalu.start - 0.6, tC = L.disusun.start - 0.5;
  const tNyala = W(L.menyala, 'mercusuar'), tP = [L.p1.start, L.p2.start, L.p3.start];
  const tLK = [W(L.langkah, 'Data'), W(L.langkah, 'Ce-E-E'), W(L.langkah, 'Ka-Er-Es'), W(L.langkah, 'catat'), W(L.langkah, 'Panduan')];
  const tLogo = L.disusun.start + 0.2, tPita = W(L.slogan, 'Risiko'), tHak = L.hak.start, tKredit = L.hak.end + 0.8;
  bunyi(L.kembali.start - 0.4, 'guruh', 0.8); bunyi(L.siap.start, 'kibar', 0.5); bunyi(tNyala, 'ping', 0.6); bunyi(tNyala + 0.1, 'desir', 0.5);
  bunyi(tPelangi, 'hisap', 0.6); bunyi(tPelangi + 0.5, 'ping', 0.6);
  bunyi(tB, 'whoosh', 0.6); tP.forEach((x) => bunyi(x, 'kertas', 0.5)); tLK.forEach((x) => bunyi(x, 'pop', 0.45));
  bunyi(tC, 'whoosh', 0.6); bunyi(tLogo, 'stempel', 0.6); bunyi(tPita, 'kibar', 0.5); bunyi(tHak, 'pop', 0.4); bunyi(tKredit, 'kertas', 0.5);
  bunyi(W(L.laut, 'selalu'), 'lonceng', 0.45);
  suasana(tA, { angin: 0.8, hujan: 0.6, ombak: 0.9 });
  suasana(tPelangi, { angin: 0.8, hujan: 0.6, ombak: 0.9 });
  suasana(tPelangi + 1.0, { angin: 0.15, hujan: 0, ombak: 0.45, camar: 0.5 });
  suasana(info.end, { angin: 0.1, hujan: 0, ombak: 0.35, camar: 0.3 });
  musik(tA, 'badai');
  musik(tPelangi, 'kemenangan');
  musik(tB + 1.5, 'cerita', { lanjut: true });
  musik(tC, 'kemenangan');
  musik(tKredit - 0.5, 'kredit', { lanjut: true });

  return (t) => {
    const tq = tStop(t), l = langkahDari(t);
    const gB0 = E.inout(P(t, tB, 0.6)), gC0 = E.inout(P(t, tC, 0.6));
    tampil(gA, t < tB + 0.7); tampil(gB, t >= tB && t < tC + 0.7); tampil(gC, t >= tC);
    atur(gA, `translate(${f1(-gB0 * 1920)} 0)`); atur(gB, `translate(${f1((1 - gB0) * 1920 - gC0 * 1920)} 0)`); atur(gC, `translate(${f1((1 - gC0) * 1920)} 0)`);
    if (t < tB + 0.7) {
      const cerah = E.inout(P(t, tPelangi, 1.2));
      kamera(la, kunciKamera(t, [[tA, { x: 0, y: -20, z: 1.05 }], [L.siap.start, { x: -260, y: 40, z: 1.3 }], [tNyala - 0.2, { x: 300, y: -40, z: 1.05 }], [tPelangi, { x: 0, y: -60, z: 1.0 }], [tB, { x: 0, y: -60, z: 1.0 }]]));
      langitCerah.setAttribute('opacity', f2(cerah));
      const kuat = 0.75 * (1 - cerah) + 0.1;
      lt.perbarui(tq, kuat);
      hj.perbarui(tq, l, 1 - cerah);
      mc.perbarui(tq, l, tq >= tNyala ? 1 : 0.2);
      const uB = 1 - E.in(P(tq, tPelangi - 0.6, 1.0));
      tampil(bdi.akar, uB > 0.01);
      if (uB > 0.01) gerakBadai(bdi, t, { x: 1100, y: 230, s: 0.9 * uB + 0.05, miring: (1 - uB) * 40, lihat: -0.4 });
      pl.setAttribute('opacity', f2(cerah));
      atur(pl, `translate(1100 640) scale(${f2(0.6 + 0.4 * E.back(P(tq, tPelangi, 0.8)))}) translate(-1100 -640)`);
      const kx = 560 + Math.sin(tq * 0.5) * 30;
      atur(kapal, `translate(${f1(kx)} ${f1(lt.fTengah(kx, tq, kuat) + 24)}) rotate(${f2(Math.sin(tq * 1.8) * (2 + 5 * kuat))})`);
      atur(kapal.bendera, `skewY(${l % 2 ? 6 : -5})`);
      const px = 1060 + Math.cos(tq * 0.6) * 60;
      atur(patroli, `translate(${f1(px)} ${f1(lt.fTengah(px, tq, kuat) + 20)}) rotate(${f2(Math.sin(tq * 2) * 3)})`);
      patroli.perbarui(tq, l);
      gerakBoneka(ardiA, t, { x: 40, y: -42, s: 0.4, kanan: tq > L.siap.start && tq < L.siap.end ? -100 : -30, lihat: 400 });
      gerakBoneka(gadisA, t, { x: 160, y: -42, s: 0.4, kanan: tq > tNyala - 0.2 && tq < L.menyala.end + 0.6 ? -150 + Math.sin(tq * 12) * 10 : undefined, lihat: 900 });
      gerakBoneka(mercuA, t, { x: 1560, y: 650, s: 0.42, kiri: tq >= tNyala ? 130 : 30 });
    }
    if (t >= tB && t < tC + 0.7) {
      pb.perbarui(t, kunciKamera(t, [[tB, { x: 220, y: -40, z: 1.04 }], [tC, { x: 240, y: -40, z: 1.06 }]]));
      kartuP.forEach((g, i) => ayunLabel(g, tq, tP[i], l, i));
      kartuP.forEach((g, i) => { g._x = 1140 + i * 300; g._y = 150; });
      langkah.forEach((g, i) => lenting(g, tq, tLK[i], 1e9, l, 40 + i));
      const lihat = 1400;
      gerakBoneka(syah, t, { lihat, kanan: tq > L.p1.start && tq < L.p1.end ? -88 : undefined });
      gerakBoneka(ardi, t, { lihat, kanan: tq > L.p3.start && tq < L.p3.end ? -110 : undefined });
      gerakBoneka(gadis, t, { lihat, kanan: (tq > L.p2.start && tq < L.p2.end) || (tq > L.langkah.start && tq < L.langkah.end) ? -84 : undefined });
    }
    if (t >= tC) {
      kamera(lc, { x: 0, y: 0, z: 1 });
      mtC.perbarui(tq, l);
      ltC.perbarui(tq, 0.05);
      const kx = 300 + (tq - tC) * 22;
      atur(kapalC, `translate(${f1(kx)} ${f1(ltC.fTengah(kx, tq, 0.05) + 16)}) rotate(${f2(Math.sin(tq * 1.4) * 1.5)})`);
      lenting(logo, tq, tLogo, 1e9, l, 50);
      lenting(pita, tq, tPita, 1e9, l, 51);
      tampil(lembaga, tq >= L.disusun.start + 0.3);
      lenting(hak, tq, tHak, 1e9, l, 52);
      const uK = P(tq, tKredit, 0.6);
      tampil(kredit, uK > 0);
      kredit.setAttribute('opacity', f2(uK));
    }
  };
};
