// ═══════════════════════════════════════════════════════════════════════════
// BABAK 4 · Kapan berlayar (kantor syahbandar, kalender pasang surut)
// ═══════════════════════════════════════════════════════════════════════════
/** Garis yang bisa "digambar" sedikit demi sedikit (u = 0..1). */
function garisTumbuh(induk, d, o = {}) {
  const p = el('path', { d, stroke: o.warna ?? '#1d3557', 'stroke-width': o.tebal ?? 7, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, induk);
  const pj = p.getTotalLength();
  p.setAttribute('stroke-dasharray', `${pj} ${pj}`);
  p.tumbuh = (u) => p.setAttribute('stroke-dashoffset', f1(pj * (1 - clamp(u))));
  p.tumbuh(0);
  return p;
}
const gelombangD = (x0, x1, y, amp, n, step = 8) => {
  let d = `M${x0} ${y}`;
  for (let x = x0 + step; x <= x1; x += step) d += ` L${x} ${f1(y - amp * Math.sin(((x - x0) / (x1 - x0)) * Math.PI * n))}`;
  return d;
};

window.ADEGAN.s5 = (akar, info) => {
  const L = {
    kapan: B('Kapan kita berlayar'), ulang: B('Berulang, mengikuti'), strat: B('Risiko Strategis Pemda mengikuti'), ops: B('Risiko Operasional OPD mengikuti'),
    lapor: B('Laporannya disusun setiap'), arah: B('Arahnya ditetapkan'), dash: B('Di Dashboard, jadwalnya'), merah: B('Jangan sampai merah'),
  };
  const pk = panggungKantor(akar, { foto: 'tarik_pukat' });
  const { dinding, perabot, depan } = pk;
  const syah = boneka('syahbandar', perabot, { x: 560, y: 930 });
  const ardi = boneka('ardi', perabot, { x: 790, y: 930 });
  const gadis = boneka('gadis', perabot, { x: 1010, y: 930 });
  // kalender pasang surut di papan dinding (1244..1856 x 124..536)
  const kal = el('g', {}, dinding);
  const kk = el('g', { filter: 'url(#b2)' }, kal);
  kertas(kotak(1256, 134, 588, 392, 6), '#fffdf7', kk, { amp: 1 });
  kk._x = 1550; kk._y = 330;
  teks(kk, 1550, 176, 'KALENDER PASANG SURUT', { bebas: true, ukuran: 38, warna: '#1d3557', jangkar: 'middle', spasi: 2 });
  for (let k = 1; k <= 5; k++) { el('rect', { x: 1430 + (k - 1) * 82, y: 190, width: 1.5, height: 300, fill: 'rgba(29,53,87,.18)' }, kk); teks(kk, 1471 + (k - 1) * 82, 512, 'TH ' + k, { bebas: true, ukuran: 22, warna: '#64748b', jangkar: 'middle' }); }
  const BARIS3 = [['STRATEGIS PEMDA', 'RPJMD · 5 TAHUN', '#e63946', 1, 34], ['STRATEGIS OPD', 'RENSTRA', '#f4a261', 1, 30], ['OPERASIONAL OPD', 'RENJA & RKA · TAHUNAN', '#2a9d8f', 5, 18]];
  const gel = BARIS3.map(([nama, ket, w, n, amp], i) => {
    const y = 250 + i * 88;
    teks(kk, 1268, y + 6, nama, { bebas: true, ukuran: 21, warna: w });
    const p = garisTumbuh(kal, gelombangD(1430, 1840, y, amp, n * 2), { warna: w, tebal: 7 });
    const lb = el('g', { filter: 'url(#bt)' }, kal);
    kertas(kotak(1560, y - 70 + (i === 2 ? 28 : 0), 270, 34, 6), w, lb, { amp: 0.5 });
    teks(lb, 1695, y - 45 + (i === 2 ? 28 : 0), ket, { bebas: true, ukuran: 24, warna: '#fdf6e3', jangkar: 'middle', spasi: 1 });
    lb._x = 1695; lb._y = y - 53;
    return { p, lb, y };
  });
  const kapalMini = ikonKertas(kal, 0, 0, 'kapal', '#1d3557', 22);
  const riak = Array.from({ length: 20 }, (_, i) => { const g = el('g', {}, kal); const x = 1440 + i * 20.5; kertas(oval(x, 478, 6, 6, 10), i % 4 === 3 ? '#e9b949' : '#93c5fd', g, { amp: 0.2 }); g._x = x; g._y = 478; return g; });
  const lblTriwulan = el('g', {}, kal);
  teks(lblTriwulan, 1268, 484, 'LAPORAN', { bebas: true, ukuran: 21, warna: '#1f4ea3' });
  const akhirTh = [1, 2, 3, 4, 5].map((k) => { const g = el('g', {}, kal); kertas(bintang(1430 + k * 82 - 4, 458, 12, 5), '#e9b949', g, { amp: 0.2 }); g._x = 1426 + k * 82; g._y = 458; return g; });
  const rkaDpa = el('g', {}, kal);
  el('path', { d: 'M1436 380 L1436 392 L1508 392 L1508 380', stroke: '#2a9d8f', 'stroke-width': 3, fill: 'none' }, rkaDpa);
  teks(rkaDpa, 1472, 418, 'RKA → DPA', { bebas: true, ukuran: 20, warna: '#2a9d8f', jangkar: 'middle' });
  // amplop surat edaran berstempel simbol Kepala Daerah
  const se = el('g', {}, depan);
  const amp = el('g', { filter: 'url(#b3)' }, se);
  kertas(kotak(1180, 300, 640, 380, 10), '#fdf6e3', amp, { amp: 1.2 });
  kertas([[1180, 300], [1500, 500], [1820, 300]], '#efe3c2', amp, { amp: 1 });
  teksBaris(amp, 1500, 580, 'SURAT EDARAN ARAHAN DAN KEBIJAKAN PENILAIAN RISIKO', { bebas: true, ukuran: 40, warna: '#1d3557', jangkar: 'middle', maks: 30, jarak: 42 });
  simbolKepalaDaerah(amp, 1500, 440, 0.2);
  const tab5 = labelPapan(se, 1200, 690, '5 TAHUNAN', '', { lebar: 260, aksen: '#e63946' });
  const tab1 = labelPapan(se, 1540, 690, 'TAHUNAN', '', { lebar: 260, aksen: '#2a9d8f' });
  se._x = 1500; se._y = 490; amp._x = 1500; amp._y = 490;
  // tablet dashboard
  const tab = tablet(depan, 'aset/layar/dashboard-jadwal.png', 1190, 220, 640, 430);
  tab._x = 1510; tab._y = 435;
  const titikMerah = el('g', {}, depan);
  kertas(oval(1690, 470, 22, 22, 18), '#ef4444', titikMerah, { amp: 0.4, attr: { filter: 'url(#bt)' } });
  const lbTelat = labelPapan(titikMerah, 1560, 500, 'TENGGAT TERLEWAT', '', { lebar: 300, aksen: '#ef4444', ukuran: 30 });
  titikMerah._x = 1690; titikMerah._y = 470;

  const tPemda = W(L.strat, 'Er-Pe-Je-Em-De'), tRenstra = W(L.strat, 'Renstra'), tOps = W(L.ops, 'Renja'), tRka = W(L.ops, 'penyusunan');
  const tTri = W(L.lapor, 'triwulan'), tAkhir = W(L.lapor, 'akhir'), tSE = W(L.arah, 'Surat'), tLima = W(L.arah, 'lima'), tTahunan = WA(L.arah, 'tahunan', 1) - 0.4;
  const tDash = W(L.dash, 'Desbor'), tMerah = W(L.dash, 'merah');
  bunyi(L.ulang.start + 0.3, 'kertas', 0.5); [tPemda, tRenstra, tOps].forEach((x) => bunyi(x, 'desir', 0.5));
  riak.forEach((_, i) => { if (i % 4 === 0) bunyi(tTri + i * 0.04, 'tik', 0.35); }); bunyi(tAkhir, 'ping', 0.5);
  bunyi(tSE, 'kertas', 0.7); bunyi(tLima, 'pop', 0.5); bunyi(tTahunan, 'pop', 0.5);
  bunyi(tDash, 'whoosh', 0.5); bunyi(tMerah, 'ping', 0.6);
  suasana(info.start, { angin: 0, ombak: 0.15, camar: 0.25 });

  return (t) => {
    const tq = tStop(t), l = langkahDari(t);
    const papanK = { x: 290, y: -90, z: 1.3 }, tokohK = { x: -150, y: 40, z: 1.08 };
    pk.perbarui(t, kunciKamera(t, [[info.start, { x: 0, y: 0, z: 1 }], [L.kapan.start, tokohK], [L.ulang.start + 0.6, papanK], [L.lapor.end, papanK],
      [tSE - 0.3, { x: 290, y: -40, z: 1.08 }], [L.dash.end, { x: 290, y: -40, z: 1.08 }], [L.merah.start, tokohK], [info.end, tokohK]]));
    tampil(kal, tq >= L.ulang.start + 0.2 && tq < tSE + 0.3);
    lenting(kk, tq, L.ulang.start + 0.2, 1e9, l, 1);
    const mulaiBaris = [tPemda, tRenstra, tOps];
    gel.forEach((g, i) => { g.p.tumbuh(P(tq, mulaiBaris[i], 1.3)); lenting(g.lb, tq, mulaiBaris[i] + 0.6, 1e9, l, 2 + i); });
    const uk = P(tq, tOps + 0.3, 4.5);
    tampil(kapalMini, tq >= tOps + 0.3);
    const xk = 1430 + uk * 410;
    atur(kapalMini, `translate(${f1(xk)} ${f1(gel[2].y - 18 * Math.sin(((xk - 1430) / 410) * Math.PI * 10) - 22)})`);
    tampil(rkaDpa, tq >= tRka);
    riak.forEach((g, i) => lenting(g, tq, tTri + i * 0.04, 1e9, l, 10 + i));
    tampil(lblTriwulan, tq >= tTri);
    akhirTh.forEach((g, i) => lenting(g, tq, tAkhir + i * 0.08, 1e9, l, 40 + i));
    // surat edaran
    tampil(se, tq >= tSE - 0.1 && tq < tDash);
    lenting(amp, tq, tSE - 0.1, tDash - 0.3, l, 50);
    lenting(tab5, tq, tLima, tDash - 0.3, l, 51); lenting(tab1, tq, tTahunan, tDash - 0.3, l, 52);
    // dashboard
    lenting(tab, tq, tDash, info.end, l, 53);
    tampil(titikMerah, tq >= tMerah);
    if (tq >= tMerah) atur(titikMerah, (l % 6 < 3 ? '' : 'translate(0 -3)'));
    // tokoh
    const lihat = tq > L.ulang.start && tq < L.merah.start ? 1550 : undefined;
    gerakBoneka(syah, t, { lihat, kanan: (tq > tPemda - 0.2 && tq < L.ops.end) || (tq > tSE && tq < L.arah.end) ? -88 + Math.sin(tq * 3) * 4 : undefined });
    const tutup = tq > L.merah.start - 0.1 && tq < L.merah.end + 0.5;
    gerakBoneka(ardi, t, { lihat, kanan: tutup ? -172 : (tq > L.kapan.start && tq < L.kapan.end ? -50 : undefined), kiri: tutup ? 172 : undefined, miring: tutup ? 6 : 0 });
    gerakBoneka(gadis, t, { lihat, kanan: tq > tDash - 0.2 && tq < L.dash.end ? -84 : undefined });
  };
};
