// ═══════════════════════════════════════════════════════════════════════════
// BABAK 5 · Lima pelampung & memeriksa kapal (CEE)
// A. laut: lima pelampung bernomor di jalur pelayaran
// B. galangan: kapal diangkat, delapan bilah lambung = delapan unsur CEE
// ═══════════════════════════════════════════════════════════════════════════
window.ADEGAN.s6 = (akar, info) => {
  const L = {
    inti: B('Sekarang inti Perdep'), lima: B('Satu, Identifikasi'), lho: B('Lho, bukan langsung'), periksa: B('Bukan. // Periksa'.replace(' // ', ' ')),
    metode: B('Metodenya Control'), unsur: B('Delapan unsur'), dinilai: B('Yang dinilai bukan'), kode: B('Jadi kode etik'), tepat: B('Tepat.', 's6'),
    form1b: B('Form 1b menilai'), form1d: B('Unsur yang Kurang Memadai'), bocor: B('Menilai risiko tanpa'),
  };
  // ══ A. LIMA PELAMPUNG ══════════════════════════════════════════════════
  const gA = el('g', {}, akar);
  const la = [lapisan(gA, 0), lapisan(gA, 0.15), lapisan(gA, 0.45), lapisan(gA, 0.8), lapisan(gA, 1), lapisan(gA, 1.15)];
  langit(la[0], 'Siang');
  for (const [x, y, s] of [[260, 150, 0.9], [1000, 110, 0.8], [1700, 170, 1]]) awanKertas(la[1], x, y, s);
  const ltA = laut(gA, { lapis: [la[2], la[3], la[5]], y: [560, 640, 1000] });
  const rute = el('path', { d: 'M-200 760 C200 700 400 820 700 760 S1200 700 1500 760 S2000 800 2300 740', stroke: '#fdf6e3', 'stroke-width': 7, 'stroke-dasharray': '3 18', 'stroke-linecap': 'round', fill: 'none' }, la[4]);
  const TAHAP = ['IDENTIFIKASI KELEMAHAN LINGKUNGAN PENGENDALIAN', 'PENILAIAN RISIKO', 'KEGIATAN PENGENDALIAN', 'INFORMASI DAN KOMUNIKASI', 'PEMANTAUAN'];
  const WARNA5 = ['#e63946', '#f4a261', '#2a9d8f', '#457b9d', '#6a4c93'];
  const pel = TAHAP.map((nama, i) => {
    const x = 160 + i * 400, y = 790 + (i % 2) * 20;
    const p = pelampung(la[4], x, y, i + 1, { warna: WARNA5[i] });
    const lb = el('g', { filter: 'url(#b2)' }, la[4]);
    kertas(kotak(x - 175, y + 26, 350, 110, 8), '#fffdf5', lb, { amp: 0.9 });
    kertas(kotak(x - 175, y + 26, 350, 12), WARNA5[i], lb, { amp: 0.3 });
    teksBaris(lb, x, y + 80, nama, { bebas: true, ukuran: 32, warna: '#1d3557', jangkar: 'middle', maks: 20, jarak: 34 });
    lb._x = x; lb._y = y + 80;
    p._lb = lb;
    return p;
  });
  const kapalA = kapalAwak(la[4], { s: 0.62, nama: 'ACEH BARAT' });
  const ardiA = boneka('ardi', kapalA.awak, { x: 30, y: -34, s: 0.32 });
  const gadisA = boneka('gadis', kapalA.awak, { x: 120, y: -34, s: 0.32 });
  const judulA = el('g', {}, la[0]);
  const hurufA = hurufGuntingan(judulA, 'PERDEP BAB III · LIMA TAHAP', 960, 170, 92, { warna: '#fdf6e3', bayang: '#1d3557' });

  // ══ B. GALANGAN ════════════════════════════════════════════════════════
  const gB = el('g', {}, akar);
  const pg = panggungDermaga(gB, { langit: 'Siang', kapal: false, kantor: false });
  const lb5 = pg.lp[5];
  // penopang kayu + kapal di atas galangan (badan besar, delapan bilah)
  const kapalG = el('g', {}, lb5);
  for (const x of [700, 1000, 1300, 1600]) kertas([[x - 30, 742], [x + 30, 742], [x + 18, 600], [x - 18, 600]], '#6b4226', kapalG, { amp: 0.6, attr: { filter: 'url(#b2)' } });
  const lambung = el('g', { filter: 'url(#b3)' }, kapalG);
  kertas([[520, 300], [1820, 300], [1700, 610], [620, 610]], '#1d4f8f', lambung, { amp: 1.4 });
  kertas([[516, 292], [1824, 292], [1820, 306], [520, 306]], '#e63946', lambung, { amp: 0.6 });
  kertas(kotak(840, 150, 420, 150, 8), '#f4ecd8', lambung, { amp: 0.8 });
  kertas(kotak(826, 138, 448, 22, 6), '#2a9d8f', lambung, { amp: 0.6 });
  const UNSUR = ['INTEGRITAS & ETIKA', 'KOMITMEN KOMPETENSI', 'KEPEMIMPINAN KONDUSIF', 'STRUKTUR ORGANISASI', 'PENDELEGASIAN WEWENANG', 'PEMBINAAN SDM', 'PERAN APIP', 'HUBUNGAN ANTARINSTANSI'];
  const bilah = UNSUR.map((nama, i) => {
    const g = el('g', {}, kapalG);
    const kol = i % 4, bar = Math.floor(i / 4);
    const x0 = 600 + kol * 280 + bar * 30, y0 = 330 + bar * 140;
    kertas(kotak(x0, y0, 260, 118, 6), '#f8fafc', g, { amp: 0.8, attr: { filter: 'url(#b1)' } });
    teks(g, x0 + 26, y0 + 48, String.fromCharCode(65 + i), { bebas: true, ukuran: 50, warna: '#e63946' });
    teksBaris(g, x0 + 66, y0 + 44, nama, { bebas: true, ukuran: 27, warna: '#1d3557', maks: 13, jarak: 29 });
    g._x = x0 + 130; g._y = y0 + 59;
    return g;
  });
  const tambal = el('g', { filter: 'url(#b3)' }, kapalG);
  kertas(kotak(1490, 470, 230, 96, 10), '#e9b949', tambal, { amp: 1.2 });
  teks(tambal, 1605, 512, 'FORM 1D', { bebas: true, ukuran: 38, warna: '#1d3557', jangkar: 'middle' });
  teks(tambal, 1605, 548, 'rencana perbaikan', { ukuran: 22, tebal: 700, warna: '#1d3557', jangkar: 'middle' });
  tambal._x = 1605; tambal._y = 518;
  const tetes = Array.from({ length: 8 }, (_, i) => kertas([[0, 0], [6, 12], [0, 18], [-6, 12]], '#60a5fa', lb5, { amp: 0.2 }));
  const ardiB = boneka('ardi', lb5, { x: 170, y: 742, s: 0.95 });
  const gadisB = boneka('gadis', lb5, { x: 1880, y: 742, s: 0.95 });
  const syahB = boneka('syahbandar', lb5, { x: 360, y: 742, s: 0.95 });
  const ui = lapisan(gB, 0);
  const jdlCEE = el('g', {}, ui);
  judulKertas(jdlCEE, 960, 98, 'CONTROL ENVIRONMENT EVALUATION (CEE)', { ukuran: 70, jangkar: 'middle', warna: '#fdf6e3', bayang: '#1d3557' });
  const lbSendiri = labelPapan(ui, 640, 120, 'SETIAP OPD MENILAI SENDIRI', '', { lebar: 640, aksen: '#2a9d8f', ukuran: 40 });
  const papan37 = el('g', {}, ui);
  const p37 = el('g', { filter: 'url(#b3)' }, papan37);
  kertas(kotak(1400, 120, 420, 220, 10), '#fffdf5', p37, { amp: 1 });
  teks(p37, 1530, 268, '37', { bebas: true, ukuran: 150, warna: '#e63946', jangkar: 'middle' });
  teks(p37, 1700, 220, 'PERTANYAAN', { bebas: true, ukuran: 40, warna: '#1d3557', jangkar: 'middle' });
  teks(p37, 1700, 266, 'FORM 1A', { bebas: true, ukuran: 46, warna: '#2a9d8f', jangkar: 'middle' });
  teks(p37, 1700, 304, 'dijawab pegawai', { ukuran: 22, tebal: 700, warna: '#475569', jangkar: 'middle' });
  p37._x = 1610; p37._y = 230;
  const tabCEE = tablet(ui, 'aset/layar/cee-1a.png', 140, 150, 560, 380);
  tabCEE._x = 420; tabCEE._y = 340;
  // poster kode etik + skor
  const poster = el('g', {}, ui);
  const pst = el('g', { filter: 'url(#b3)' }, poster);
  kertas(kotak(720, 160, 480, 400, 6), '#fffdf7', pst, { amp: 1 });
  teks(pst, 960, 236, 'KODE ETIK', { bebas: true, ukuran: 76, warna: '#1d3557', jangkar: 'middle', spasi: 3 });
  for (let k = 0; k < 7; k++) kertas(kotak(770, 280 + k * 34, 380 * (k % 3 === 2 ? 0.6 : 1), 9), '#cbd5e1', pst, { amp: 0.1 });
  paku(pst, 960, 172);
  pst._x = 960; pst._y = 360;
  const skor = el('g', {}, ui);
  const sk4 = el('g', { filter: 'url(#b2)' }, skor);
  kertas(oval(1340, 260, 86, 86, 36), '#fde68a', sk4, { amp: 0.8 });
  sk4._x = 1340; sk4._y = 260;
  teks(sk4, 1340, 296, '4', { bebas: true, ukuran: 110, warna: '#1d3557', jangkar: 'middle' });
  const x4 = silang(skor, 1340, 260, 70);
  const sk2 = el('g', { filter: 'url(#b2)' }, skor);
  kertas(oval(1500, 400, 86, 86, 36), '#fecaca', sk2, { amp: 0.8 });
  teks(sk2, 1500, 436, '2', { bebas: true, ukuran: 110, warna: '#9d0208', jangkar: 'middle' });
  teks(sk2, 1500, 520, 'ada, belum konsisten', { ukuran: 24, tebal: 800, warna: '#9d0208', jangkar: 'middle' });
  sk2._x = 1500; sk2._y = 400;
  const stJalan = stempel(ui, 960, 640, 'DIJALANKAN?', { ukuran: 58, warna: '#1f4ea3' });
  // Form 1b / 1c + simpulan
  const forms = el('g', {}, ui);
  const f1b = dokumen(forms, 380, 170, 360, 300, 'FORM 1B · DOKUMEN', { ukuran: 32, pita: '#457b9d' }); f1b._x = 560; f1b._y = 320;
  const f1c = dokumen(forms, 800, 170, 360, 300, 'FORM 1C · SIMPULAN', { ukuran: 32, pita: '#2a9d8f' }); f1c._x = 980; f1c._y = 320;
  const stMemadai = stempel(forms, 1380, 260, 'MEMADAI', { ukuran: 52, warna: '#15803d' });
  const stKurang = stempel(forms, 1420, 400, 'KURANG MEMADAI', { ukuran: 52, warna: '#c2410c' });

  // ── waktu
  const tBab = W(L.inti, 'Bab'), tPel = [W(L.lima, 'Satu'), W(L.lima, 'Dua'), W(L.lima, 'Tiga'), W(L.lima, 'Empat'), W(L.lima, 'Lima')];
  const tB = L.metode.start - 0.4;
  const tCEE = W(L.metode, 'Kontrol'), tSendiri = W(L.metode, 'O-Pe-De');
  const tUnsur = W(L.unsur, 'Delapan'), t37 = W(L.unsur, '37'), tPeg = W(L.unsur, 'pegawainya');
  const tAda = W(L.dinilai, 'ada'), tJalan = W(L.dinilai, 'dijalankan'), tNilai = W(L.kode, 'nilai');
  const t1b = W(L.form1b, 'Form'), t1c = W(L.form1b, 'Form', 1), tMem = W(L.form1b, 'Memadai'), tKur = W(L.form1b, 'Kurang');
  const t1d = W(L.form1d, 'Form'), tBocor = W(L.bocor, 'bocor');
  hurufA.forEach((g, i) => bunyi(tBab + i * 0.025, 'pop', 0.2));
  tPel.forEach((x) => bunyi(x, 'ping', 0.5));
  bunyi(W(L.lho, 'menilai'), 'tik', 0.4);
  bunyi(tB, 'whoosh', 0.6);
  bunyi(tCEE, 'stempel', 0.5); bunyi(tSendiri, 'pop', 0.5);
  bilah.forEach((_, i) => bunyi(tUnsur + i * 0.12, 'tik', 0.4)); bunyi(t37, 'stempel', 0.6);
  bunyi(tAda, 'kertas', 0.5); bunyi(tJalan, 'stempel', 0.7); bunyi(tNilai, 'tik', 0.8); bunyi(tNilai + 0.4, 'pop', 0.5);
  bunyi(t1b, 'kertas', 0.5); bunyi(t1c, 'kertas', 0.5); bunyi(tMem, 'stempel', 0.6); bunyi(tKur, 'stempel', 0.6);
  bunyi(t1d, 'stempel', 0.5); bunyi(tBocor, 'percik', 0.6);
  suasana(info.start, { angin: 0.3, ombak: 0.6, camar: 0.4 });
  suasana(tB, { angin: 0.15, ombak: 0.4, camar: 0.5 });

  return (t) => {
    const tq = tStop(t), l = langkahDari(t);
    const geser = E.inout(P(t, tB, 0.55));
    tampil(gA, t < tB + 0.6); tampil(gB, t >= tB);
    atur(gA, `translate(${f1(-geser * 1920)} 0)`); atur(gB, `translate(${f1((1 - geser) * 1920)} 0)`);
    if (t < tB + 0.6) {
      const ki = pel[Math.max(0, tPel.filter((x) => tq >= x).length - 1)];
      const k = kunciKamera(t, [[info.start, { x: 0, y: -20, z: 1 }], [tPel[0] - 0.2, { x: 0, y: -20, z: 1 }], [L.lima.end, { x: 0, y: 0, z: 1 }],
        [L.lho.start, { x: -560, y: 80, z: 1.4 }], [L.periksa.end, { x: -560, y: 80, z: 1.4 }]]);
      kamera(la, k);
      ltA.perbarui(tq, 0.2);
      const kx = lerp(-200, 120, E.out(P(tq, info.start, 6))) + (tq > L.periksa.start ? -E.inout(P(tq, L.periksa.start, 2)) * 300 : 0);
      atur(kapalA, `translate(${f1(kx)} ${f1(ltA.fTengah(kx, tq, 0.2) + 20)}) rotate(${f2(Math.sin(tq * 1.6) * 2.5)}) scale(${tq > L.periksa.start + 0.6 ? -1 : 1} 1)`);
      atur(kapalA.bendera, `skewY(${l % 2 ? 5 : -4})`);
      gerakBoneka(ardiA, t, { x: 30, y: -34, s: 0.32 }); gerakBoneka(gadisA, t, { x: 120, y: -34, s: 0.32 });
      pel.forEach((p, i) => {
        const nyala = tq >= tPel[i] - 0.05;
        const fokus = (i === 0 && tq > L.periksa.start) || (i === 1 && tq > L.lho.start && tq < L.lho.end + 0.3);
        atur(p, `translate(0 ${f1(Math.sin(tq * 2 + i) * 5 - (fokus ? Math.abs(Math.sin(tq * 6)) * 10 : 0))})`);
        p.lampu.setAttribute('fill', nyala && l % 4 < 2 ? '#fde047' : '#fde68a');
        lenting(p._lb, tq, tPel[i], 1e9, l, 60 + i);
      });
      tampil(judulA, tq >= tBab - 0.1 && tq < tPel[0] + 0.5);
      hurufA.forEach((g, i) => { const u = E.back(P(tq, tBab + i * 0.025, 0.22)); atur(g, `translate(0 ${f1((1 - u) * -240)}) ${getar(300 + i, l, g._x, g._y)}`); });
    }
    if (t >= tB) {
      pg.perbarui(t, kunciKamera(t, [[tB, { x: 60, y: -60, z: 1.0 }], [tCEE, { x: 60, y: -60, z: 1.0 }], [tUnsur, { x: 80, y: -40, z: 1.0 }], [info.end, { x: 80, y: -40, z: 1.0 }]]));
      bilah.forEach((g, i) => { g.setAttribute('opacity', tq >= tUnsur + i * 0.12 ? 1 : 0.18); });
      atur(kapalG, `translate(0 ${f1(Math.sin(tq * 0.8) * 2)})`);
      lenting(tambal, tq, t1d, info.end, l, 70);
      tetes.forEach((p, i) => { const u = ((tq - tBocor) * 1.6 + i / 8) % 1; tampil(p, tq >= tBocor); atur(p, `translate(${f1(900 + (i % 3) * 14)} ${f1(612 + u * 120)})`); });
      tampil(jdlCEE, tq >= tCEE - 0.1 && tq < tUnsur);
      lenting(lbSendiri, tq, tSendiri, tUnsur, l, 71);
      tampil(papan37, tq >= t37 - 0.1 && tq < tAda);
      lenting(p37, tq, t37 - 0.1, tAda - 0.3, l, 72);
      lenting(tabCEE, tq, tPeg - 0.2, tAda - 0.3, l, 73);
      lenting(pst, tq, tAda - 0.1, t1b - 0.3, l, 74);
      tampil(poster, tq >= tAda - 0.1 && tq < t1b - 0.2);
      aturStempel(stJalan, tq, tJalan, -6);
      tampil(stJalan, tq >= tJalan && tq < L.kode.start + 0.4);
      tampil(skor, tq >= tNilai - 0.3 && tq < t1b - 0.2);
      lenting(sk4, tq, tNilai - 0.3, t1b - 0.3, l, 75);
      tampil(x4, tq >= tNilai);
      lenting(sk2, tq, tNilai + 0.4, t1b - 0.3, l, 76);
      tampil(forms, tq >= t1b - 0.1 && tq < L.bocor.start);
      lenting(f1b, tq, t1b, L.bocor.start, l, 77); lenting(f1c, tq, t1c, L.bocor.start, l, 78);
      aturStempel(stMemadai, tq, tMem, -8); aturStempel(stKurang, tq, tKur, 6);
      const lihat = 1100;
      gerakBoneka(syahB, t, { lihat, kanan: tq > tCEE && tq < L.dinilai.end ? -88 + Math.sin(tq * 3) * 4 : undefined });
      gerakBoneka(ardiB, t, { lihat, kanan: tq > L.kode.start && tq < L.kode.end ? -95 : undefined });
      gerakBoneka(gadisB, t, { lihat: 900, kanan: tq > L.unsur.start && tq < L.form1d.end ? -70 : undefined });
    }
  };
};
