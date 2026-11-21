// ═══════════════════════════════════════════════════════════════════════════
// BABAK 8 · Mengatur layar (geladak): A-A-M-S-A sebagai bendera isyarat,
// Penanggung Jawab Pengendalian, empat titik skor, efektivitas, uji coba
// ═══════════════════════════════════════════════════════════════════════════
window.ADEGAN.s9 = (akar, info) => {
  const L = {
    layar: B('Pelampung ketiga, Kegiatan'), lima: B('Lima pilihan respons'), aamsa: B('Avoid, hindari'), luar: B('Kalau risikonya di luar'),
    dua: B('Yang Uncontrollable praktis'), pjp: B('Setiap rencana wajib punya'), skor: B('Lalu empat titik skor'), empat: B('Inheren, sebelum ada'),
    efek: B('Efektivitasnya dinilai'), uji: B('Sebelum ditetapkan, rancangan'),
  };
  const pg = panggungGeladak(akar, { tiangX: 40 });
  const d = pg.lp[4];
  const syah = boneka('syahbandar', d, { x: 420, y: 930 });
  const ardi = boneka('ardi', d, { x: 630, y: 930 });
  const gadis = boneka('gadis', d, { x: 840, y: 930 });
  // tali bendera isyarat dari puncak tiang ke geladak
  const RESP = [['A', 'AVOID', 'hindari kegiatan berisikonya', '#e63946'], ['A', 'ABATE', 'tekan KEMUNGKINANNYA', '#f4a261'], ['M', 'MITIGATE', 'kurangi DAMPAKNYA', '#e9c46a'],
    ['S', 'SHARE', 'bagi: asuransi / kemitraan', '#2a9d8f'], ['A', 'ACCEPT', 'terima sisanya, pilihan terakhir', '#457b9d']];
  el('path', { d: 'M66 -260 L900 640', stroke: '#7a5230', 'stroke-width': 4 }, d);
  const bendera = RESP.map(([h1, , , w], i) => {
    const u = (i + 1) / 6, x = lerp(66, 900, u), y = lerp(-260, 640, u);
    const g = el('g', { filter: 'url(#b2)' }, d);
    kertas([[x, y], [x + 70, y + 76], [x - 6, y + 92]], w, g, { amp: 0.6 });
    teks(g, x + 22, y + 66, h1, { bebas: true, ukuran: 40, warna: '#fdf6e3', jangkar: 'middle' });
    g._x = x; g._y = y;
    return g;
  });
  const baris = RESP.map(([, nama, isi, w], i) => {
    const g = el('g', { filter: 'url(#b2)' }, d);
    const y = 160 + i * 96;
    kertas(kotak(1020, y, 840, 80, 8), '#fffdf5', g, { amp: 0.8 });
    kertas(oval(1066, y + 40, 30, 30, 24), w, g, { amp: 0.4 });
    teks(g, 1066, y + 54, nama[0], { bebas: true, ukuran: 40, warna: '#fdf6e3', jangkar: 'middle' });
    teks(g, 1116, y + 54, nama, { bebas: true, ukuran: 46, warna: '#1d3557', spasi: 2 });
    teks(g, 1360, y + 52, isi, { ukuran: 26, tebal: 800, warna: '#475569' });
    g._x = 1440; g._y = y + 40;
    return g;
  });
  const bdiK = siBadai(pg.lp[1]);
  const tagU = labelPapan(pg.lp[1], 520, 300, 'UNCONTROLLABLE', 'di luar kendali', { lebar: 330, aksen: '#64748b' });
  const besarAAMSA = el('g', {}, d);
  const hurufAAMSA = hurufGuntingan(besarAAMSA, 'A A M S A', 1440, 460, 230, { warna: '#e63946', bayang: '#1d3557', spasi: 30 });
  // Penanggung Jawab Pengendalian
  const pjp = el('g', {}, d);
  const kartuPJP = kartuAlur(pjp, 1040, 160, 800, 'PENANGGUNG JAWAB PENGENDALIAN', ['jabatan yang BENAR-BENAR BERWENANG membangun kontrolnya'], '#e63946');
  const dokPKD = dokumen(pjp, 1060, 320, 270, 300, 'PERATURAN KEPALA DAERAH', { ukuran: 26, pita: '#e9b949' });
  dokPKD._x = 1195; dokPKD._y = 470;
  const ke = [['PEJABAT SETINGKAT SEKSI', '#94a3b8', false], ['KEPALA DAERAH', '#e9b949', true]].map(([isi, w, ok], i) => {
    const g = el('g', {}, pjp);
    const y = 360 + i * 140;
    el('path', { d: `M1340 470 L1460 ${y + 40}`, stroke: '#1d3557', 'stroke-width': 5, 'stroke-dasharray': '4 10', 'stroke-linecap': 'round' }, g);
    labelPapan(g, 1470, y, isi, '', { lebar: 380, aksen: w, ukuran: 34 });
    if (ok) ikonKertas(g, 1820, y + 30, 'centang', '#16a34a', 30); else silang(g, 1820, y + 30, 26);
    g._x = 1660; g._y = y + 30;
    return g;
  });
  // empat titik skor (tiang pasang)
  const skor = el('g', {}, d);
  kertas(kotak(1100, 170, 30, 470), '#fffdf5', skor, { amp: 0.4, attr: { filter: 'url(#b2)' } });
  const SK = [['INHEREN', 'sebelum ada pengendalian', '#ef4444', 220], ['RESIDUAL', 'sekarang, sesudah pengendalian berjalan', '#fb923c', 330], ['TARGET', 'yang ingin dicapai RTP', '#fde047', 450], ['AKTUAL', 'hasil nyata di lapangan', '#4ade80', 540]];
  const penanda = SK.map(([nama, isi, w, y]) => { const g = el('g', { filter: 'url(#b2)' }, skor); kertas([[1130, y], [1170, y - 26], [1500, y - 26], [1500, y + 26], [1170, y + 26]], w, g, { amp: 0.6 }); teks(g, 1186, y + 12, nama, { bebas: true, ukuran: 40, warna: '#1d3557', spasi: 1 }); teks(g, 1520, y + 10, isi, { ukuran: 22, tebal: 800, warna: '#1d3557' }); g._x = 1320; g._y = y; return g; });
  const air = el('rect', { x: 1060, y: 220, width: 110, height: 420, fill: '#60a5fa', opacity: 0.55 }, skor);
  // efektivitas: busur empat tingkat + jarum
  const efek = el('g', {}, d);
  const cx = 1440, cy = 560, R = 300;
  efek._x = cx; efek._y = cy - 150;
  const TK = [['TIDAK EFEKTIF', '#ef4444'], ['KURANG EFEKTIF', '#fb923c'], ['CUKUP EFEKTIF', '#fde047'], ['EFEKTIF', '#4ade80']];
  TK.forEach(([isi, w], i) => {
    const a0 = Math.PI + (i / 4) * Math.PI, a1 = Math.PI + ((i + 1) / 4) * Math.PI;
    const luar = Array.from({ length: 12 }, (_, k) => { const a = lerp(a0, a1, k / 11); return [cx + Math.cos(a) * R, cy + Math.sin(a) * R]; });
    const dalam = Array.from({ length: 12 }, (_, k) => { const a = lerp(a1, a0, k / 11); return [cx + Math.cos(a) * (R - 90), cy + Math.sin(a) * (R - 90)]; });
    kertas([...luar, ...dalam], w, efek, { amp: 0.6, attr: { filter: 'url(#b2)' } });
    const am = (a0 + a1) / 2;
    teksBaris(efek, cx + Math.cos(am) * (R - 45), cy + Math.sin(am) * (R - 45) + 4, isi, { bebas: true, ukuran: 24, warna: '#1d3557', jangkar: 'middle', maks: 7, jarak: 24 });
  });
  const jarum = el('g', { filter: 'url(#bt)' }, efek);
  kertas([[cx - 10, cy], [cx, cy - R + 70], [cx + 10, cy]], '#1d3557', jarum, { amp: 0.3 });
  kertas(oval(cx, cy, 18, 18, 16), '#1d3557', efek, { amp: 0.3 });
  const celah = labelPapan(efek, 1240, 600, 'KALAU KURANG: DI MANA CELAHNYA?', '', { lebar: 420, aksen: '#e63946', ukuran: 30 });
  // uji coba di teluk
  const uji = el('g', {}, d);
  const fotoTeluk = fotoCetak(uji, 'perahu_usaid', 1040, 170, 420, 320, { ket: 'mencoba layar di teluk' });
  fotoTeluk._x = 1250; fotoTeluk._y = 330;
  const kUji = kartuAlur(uji, 1490, 200, 370, 'UJI COBA', ['dalam lingkup kecil', 'sebelum ditetapkan'], '#2a9d8f');
  const kForm9 = labelPapan(uji, 1490, 400, 'HASIL → FORM 9', '', { lebar: 370, aksen: '#1d3557', ukuran: 42 });

  // ── waktu
  const tRTP = W(L.layar, 'Er-Te-Pe'), tB = [W(L.aamsa, 'Evoid'), W(L.aamsa, 'Ebeit'), W(L.aamsa, 'Mitigeit'), W(L.aamsa, 'Syer'), W(L.aamsa, 'Eksept')];
  const tHuruf = W(L.lima, 'A');
  const tUnc = W(L.dua, 'Ankontrolebel'), tPJP = W(L.pjp, 'Penanggung'), tPKD = W(L.pjp, 'peraturan'), tSeksi = W(L.pjp, 'seksi');
  const tSK = [W(L.empat, 'Inheren'), W(L.empat, 'Residual'), W(L.empat, 'Target'), W(L.empat, 'Aktual')];
  const tEf = W(L.efek, 'empat'), tCelah = W(L.efek, 'celahnya'), tUji = W(L.uji, 'diuji'), tTeluk = W(L.uji, 'teluk'), tF9 = W(L.uji, 'Form');
  bunyi(tRTP, 'kibar', 0.5); tB.forEach((x) => { bunyi(x, 'kibar', 0.5); bunyi(x + 0.1, 'pop', 0.35); });
  bunyi(tUnc, 'desir', 0.5); bunyi(tPJP, 'pop', 0.5); bunyi(tPKD, 'kertas', 0.5); bunyi(tSeksi, 'tik', 0.7);
  tSK.forEach((x) => bunyi(x, 'pop', 0.45)); bunyi(tEf, 'desir', 0.4); bunyi(tCelah, 'ping', 0.4);
  bunyi(tUji, 'kertas', 0.5); bunyi(tTeluk, 'percik', 0.4); bunyi(tF9, 'stempel', 0.5);
  suasana(info.start, { angin: 0.45, ombak: 0.6, camar: 0.3 });

  return (t) => {
    const tq = tStop(t), l = langkahDari(t);
    const papanK = { x: 180, y: -80, z: 1.1 };
    pg.perbarui(t, kunciKamera(t, [[info.start, { x: 0, y: -120, z: 1.0 }], [tB[0] - 0.4, papanK], [L.luar.start, { x: 300, y: -100, z: 1.0 }], [L.pjp.start, papanK], [info.end, papanK]]));
    // bendera & baris AAMSA
    bendera.forEach((g, i) => { lenting(g, tq, i === 0 ? Math.min(tB[0], tHuruf) : tB[i], 1e9, l, i); atur(g, (g.getAttribute('transform') || '') + ` skewY(${(l + i) % 2 ? 6 : -4})`); });
    const dua = tq >= tUnc - 0.2 && tq < L.pjp.start;
    tampil(d, true);
    baris.forEach((g, i) => { lenting(g, tq, tB[i], L.pjp.start - 0.2, l, 10 + i); g.setAttribute('opacity', dua && i < 3 ? 0.3 : 1); });
    const uB = hidup(tq, L.luar.start, L.dua.end, 0.4, 0.3);
    tampil(bdiK.akar, uB > 0.001);
    if (uB > 0) gerakBadai(bdiK, t, { x: 690, y: 190, s: 0.4 * uB, kilat: false, lihat: 1 });
    tampil(besarAAMSA, tq >= tHuruf - 0.1 && tq < tB[0] - 0.1);
    hurufAAMSA.forEach((g, i) => { const u = E.back(P(tq, tHuruf + i * 0.32, 0.24)); tampil(g, tq >= tHuruf + i * 0.32); atur(g, `translate(0 ${f1((1 - u) * -300)}) ${getar(400 + i, l, g._x, g._y)}`); });
    lenting(tagU, tq, tUnc, L.pjp.start - 0.2, l, 20);
    // PJP
    tampil(pjp, tq >= tPJP - 0.1 && tq < L.skor.start);
    lenting(kartuPJP, tq, tPJP, L.skor.start - 0.2, l, 21);
    lenting(dokPKD, tq, tPKD, L.skor.start - 0.2, l, 22);
    ke.forEach((g, i) => lenting(g, tq, tSeksi - 0.2 + i * 0.5, L.skor.start - 0.2, l, 23 + i));
    // empat skor
    tampil(skor, tq >= L.skor.start && tq < L.efek.start);
    penanda.forEach((g, i) => lenting(g, tq, tSK[i], L.efek.start - 0.2, l, 25 + i));
    const level = [640, 220, 330, 450, 540];
    const n = tSK.filter((x) => tq >= x).length;
    const ya = kunci1(tq, [[L.skor.start, 640], ...tSK.map((x, i) => [x + 0.6, level[i + 1]])]);
    air.setAttribute('y', f1(ya)); air.setAttribute('height', f1(640 - ya));
    tampil(air, n > 0);
    // efektivitas
    tampil(efek, tq >= tEf - 0.2 && tq < L.uji.start);
    lenting(efek, tq, tEf - 0.2, L.uji.start - 0.2, l, 30);
    atur(jarum, `rotate(${f1(-90 + kunci1(tq, [[tEf, -80], [tEf + 1.2, 60], [tEf + 2, -10], [tCelah, -10], [tCelah + 0.8, -45]]))} ${cx} ${cy})`);
    lenting(celah, tq, tCelah, L.uji.start, l, 31);
    // uji coba
    tampil(uji, tq >= tUji - 0.2);
    lenting(fotoTeluk, tq, tUji, 1e9, l, 32); lenting(kUji, tq, tUji + 0.3, 1e9, l, 33); lenting(kForm9, tq, tF9, 1e9, l, 34);
    // tokoh
    const lihat = 1380;
    gerakBoneka(syah, t, { lihat, kanan: (tq > tB[0] - 0.2 && tq < L.aamsa.end) || (tq > tSK[0] && tq < L.empat.end) ? -90 + Math.sin(tq * 3) * 4 : undefined });
    gerakBoneka(ardi, t, { lihat, kanan: tq > L.luar.start && tq < L.luar.end ? -130 : undefined });
    gerakBoneka(gadis, t, { lihat, kanan: tq > L.lima.start && tq < L.lima.end ? -140 + Math.sin(tq * 10) * 10 : undefined });
  };
};
