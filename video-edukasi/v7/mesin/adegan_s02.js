// ═══════════════════════════════════════════════════════════════════════════
// BABAK 1 · Apa itu risiko (dermaga pagi, papan gabus di kanan)
// ═══════════════════════════════════════════════════════════════════════════
/** Teks berpotongan; potongan berkunci bisa disorot (merah + garis bawah). */
function teksSorot(induk, x, y, bagian, o = {}) {
  const t = el('text', { x, y, 'font-size': o.ukuran ?? 30, 'font-weight': 700, fill: o.warna ?? '#1d3557', 'text-anchor': o.jangkar ?? 'start' }, induk);
  const kunci = {};
  for (const [isi, k] of bagian) {
    const s = el('tspan', {}, t);
    s.textContent = isi;
    if (k) kunci[k] = s;
  }
  t.kunci = kunci;
  return t;
}
function sorot(tspan, nyala) {
  tspan.setAttribute('fill', nyala ? '#c1121f' : 'inherit');
  tspan.setAttribute('font-weight', nyala ? 800 : 700);
  tspan.style.textDecoration = nyala ? 'underline' : '';
}

window.ADEGAN.s2 = (akar, info) => {
  const L = {
    mulai: B('Kita mulai dari kata'), def: B('Menurut Peraturan Pemerintah Nomor 60'), inti: B('Intinya apa, Pak?'),
    tiga: B('Tiga kata.'), awan: B('Kemungkinan, artinya belum'), hehe: B('Hehe. Aku masih'), hujan: B('Kalau hujannya'),
    masalah: B('Itu bukan risiko lagi'), ancam: B('Mengancam: fokusnya'), tujuan: B('Dan tujuan. Tanpa'), jadi: B('Jadi manajemen risiko adalah'),
  };
  const pg = panggungDermaga(akar, { langit: 'Pagi', kapalX: 2150 });
  const [, l1, l2, , , l5] = pg.lp;
  // Si Badai kecil di cakrawala + pelabuhan tujuan
  const bdi = siBadai(l2);
  const hujanKecil = el('g', { opacity: 0 }, l2);
  for (let i = 0; i < 14; i++) el('path', { d: `M${1390 + i * 12} ${505 + (i % 3) * 14} l-6 26`, stroke: '#94a3b8', 'stroke-width': 3, 'stroke-linecap': 'round' }, hujanKecil);
  const lblRisiko = el('g', { filter: 'url(#b2)' }, l2);
  kertas([[1320, 330], [1560, 330], [1560, 392], [1460, 392], [1450, 420], [1432, 392], [1320, 392]], '#fffdf5', lblRisiko, { amp: 0.8 });
  teks(lblRisiko, 1440, 374, 'MASIH RISIKO', { bebas: true, ukuran: 40, warna: '#1d3557', jangkar: 'middle', spasi: 2 });
  const stMasalah = stempel(l2, 1460, 520, 'MASALAH', { ukuran: 60 });
  const tujuan = el('g', { filter: 'url(#b1)' }, l2);
  kertas([[1700, 600], [1740, 566], [2040, 566], [2080, 600]], '#8d99ae', tujuan);
  for (const [x, w, hh] of [[1760, 70, 46], [1850, 84, 66], [1960, 56, 40]]) kertas(kotak(x, 566 - hh, w, hh), '#e9e2cf', tujuan);
  kertas(kotak(1916, 360, 7, 170), '#5b6474', tujuan, { amp: 0.2 });
  const bdrTujuan = el('g', {}, tujuan);
  kertas(kotak(1923, 364, 200, 76, 3), '#2a9d8f', bdrTujuan, { amp: 0.7 });
  teks(bdrTujuan, 2023, 418, 'TUJUAN', { bebas: true, ukuran: 54, warna: '#fdf6e3', jangkar: 'middle', spasi: 2 });
  const rute = el('path', { d: 'M1180 640 C1400 600 1600 620 1800 590', stroke: '#fdf6e3', 'stroke-width': 6, 'stroke-dasharray': '3 16', 'stroke-linecap': 'round', fill: 'none', opacity: 0 }, l2);
  // papan & tokoh
  papanGabus(l5, 1300, 210, 600, 420);
  const syah = boneka('syahbandar', l5, { x: 640, y: 742 });
  const ardi = boneka('ardi', l5, { x: 870, y: 742 });
  const gadis = boneka('gadis', l5, { x: 1090, y: 742 });
  // isi papan
  const papan = el('g', {}, l5);
  const kataRisiko = hurufGuntingan(papan, 'RISIKO', 1600, 470, 170, { warna: '#e63946', bayang: '#1d3557' });
  const gul = gulungan(papan, 1250, 230, 700, 390);
  teks(gul.isi, 1600, 300, 'PP 60/2008 TENTANG SPIP', { bebas: true, ukuran: 46, warna: '#9d0208', jangkar: 'middle', spasi: 2 });
  el('rect', { x: 1300, y: 318, width: 600, height: 3, fill: 'rgba(29,53,87,.25)' }, gul.isi);
  const d1 = teksSorot(gul.isi, 1290, 380, [['Risiko adalah ', 0], ['kemungkinan', 'k'], [' kejadian', 0]], { ukuran: 34 });
  const d2 = teksSorot(gul.isi, 1290, 432, [['yang ', 0], ['mengancam', 'm'], [' pencapaian ', 0], ['tujuan', 't']], { ukuran: 34 });
  const d3 = teksSorot(gul.isi, 1290, 484, [['dan sasaran instansi pemerintah.', 0]], { ukuran: 34 });
  teks(gul.isi, 1600, 560, 'Peraturan Pemerintah Nomor 60 Tahun 2008', { ukuran: 22, tebal: 600, warna: '#6b4f3a', jangkar: 'middle', attr: { 'font-style': 'italic' } });
  const tali = taliLabel(l5, 520, 1920, 120, ['KEMUNGKINAN', 'MENGANCAM', 'TUJUAN'], { ukuran: 46, lebar: 330, tinggi: 86, warnaTeks: ['#c1121f', '#d97706', '#1f4ea3'] });
  // dua kartu: PP 60/2008 vs ISO 31000
  const banding = el('g', {}, l5);
  const kartuPP = el('g', { filter: 'url(#b2)' }, banding);
  kertas(kotak(1330, 250, 260, 330, 6), '#fffdf5', kartuPP, { amp: 1 });
  teks(kartuPP, 1460, 300, 'PP 60/2008', { bebas: true, ukuran: 44, warna: '#1d3557', jangkar: 'middle', spasi: 1 });
  kertas(oval(1460, 430, 92, 92, 40), '#fecaca', kartuPP, { amp: 1 });
  teks(kartuPP, 1460, 442, 'ANCAMAN', { bebas: true, ukuran: 40, warna: '#9d0208', jangkar: 'middle' });
  const kartuISO = el('g', { filter: 'url(#b2)' }, banding);
  kertas(kotak(1610, 250, 270, 330, 6), '#fffdf5', kartuISO, { amp: 1 });
  teks(kartuISO, 1745, 300, 'ISO 31000', { bebas: true, ukuran: 44, warna: '#1d3557', jangkar: 'middle', spasi: 1 });
  kertas(oval(1745, 440, 120, 112, 44), '#d1fae5', kartuISO, { amp: 1 });
  teks(kartuISO, 1745, 420, 'ANCAMAN', { bebas: true, ukuran: 36, warna: '#9d0208', jangkar: 'middle' });
  const peluang = teks(kartuISO, 1745, 470, '+ PELUANG', { bebas: true, ukuran: 36, warna: '#047857', jangkar: 'middle' });
  // siklus manajemen risiko
  const siklus = el('g', {}, l5);
  const pusat = [1600, 420], R = 150;
  const LANGKAH = [['KENALI', '#e63946'], ['NILAI', '#f4a261'], ['KENDALIKAN', '#2a9d8f'], ['PANTAU', '#1f4ea3']];
  const panah = [];
  for (let i = 0; i < 4; i++) {
    const a0 = -Math.PI / 2 + i * Math.PI / 2 + 0.42, a1 = a0 + Math.PI / 2 - 0.84;
    const p = el('path', { d: `M${pusat[0] + Math.cos(a0) * R} ${pusat[1] + Math.sin(a0) * R} A${R} ${R} 0 0 1 ${pusat[0] + Math.cos(a1) * R} ${pusat[1] + Math.sin(a1) * R}`, stroke: '#1d3557', 'stroke-width': 6, fill: 'none', 'stroke-dasharray': '2 12', 'stroke-linecap': 'round' }, siklus);
    panah.push(p);
  }
  const cakram = LANGKAH.map(([isi, w], i) => {
    const a = -Math.PI / 2 + i * Math.PI / 2, x = pusat[0] + Math.cos(a) * R, y = pusat[1] + Math.sin(a) * R;
    const g = el('g', { filter: 'url(#b2)' }, siklus);
    kertas(kotak(x - 98, y - 34, 196, 68, 30), w, g, { amp: 0.8 });
    teks(g, x, y + 14, isi, { bebas: true, ukuran: 40, warna: '#fdf6e3', jangkar: 'middle', spasi: 1 });
    g._x = x; g._y = y;
    return g;
  });
  const pitaSebelum = el('g', { filter: 'url(#b3)' }, l5);
  kertas(kotak(1360, 600, 480, 60, 4), '#1d3557', pitaSebelum, { amp: 1 });
  teks(pitaSebelum, 1600, 642, 'SEBELUM SEMPAT TERJADI', { bebas: true, ukuran: 42, warna: '#f2c46b', jangkar: 'middle', spasi: 2 });

  // ── waktu kunci
  const tRisiko = W(L.mulai, 'Risiko');
  const tK = [W(L.tiga, 'Kemungkinan'), W(L.tiga, 'mengancam'), W(L.tiga, 'tujuan')];
  const tCakram = [W(L.jadi, 'mengenali'), W(L.jadi, 'menilai'), W(L.jadi, 'mengendalikan'), W(L.jadi, 'memantau')];
  const tHujan = W(L.hujan, 'hujannya'), tMasalah = W(L.masalah, 'masalah');
  bunyi(tRisiko, 'stempel', 0.6);
  kataRisiko.forEach((g, i) => bunyi(tRisiko + i * 0.05, 'pop', 0.35));
  bunyi(L.def.start - 0.1, 'kertas', 0.6);
  tK.forEach((x) => bunyi(x, 'pop', 0.55));
  bunyi(L.hehe.start - 0.3, 'desir', 0.4);
  bunyi(tHujan, 'percik', 0.4);
  bunyi(tMasalah, 'stempel', 0.8);
  bunyi(W(L.ancam, 'ancaman'), 'pop', 0.5);
  bunyi(W(L.ancam, 'I-Es-O'), 'pop', 0.5);
  bunyi(W(L.ancam, 'peluang'), 'ping', 0.4);
  bunyi(W(L.tujuan, 'pelabuhan'), 'kibar', 0.5);
  tCakram.forEach((x) => bunyi(x, 'pop', 0.5));
  bunyi(W(L.jadi, 'sebelum'), 'whoosh', 0.5);
  suasana(info.start, { angin: 0.2, ombak: 0.45, camar: 0.6 });

  return (t) => {
    const tq = tStop(t), l = langkahDari(t);
    const papanK = { x: 330, y: -40, z: 1.14 };
    const k = kunciKamera(t, [
      [info.start, { x: 0, y: 0, z: 1 }], [L.mulai.start + 1.5, { x: 120, y: 0, z: 1.02 }], [L.def.start + 0.3, papanK],
      [L.inti.start, { x: 40, y: 20, z: 1.06 }], [L.tiga.start + 0.4, { x: 160, y: -90, z: 1 }], [L.awan.start + 0.6, { x: 640, y: -90, z: 1.06 }],
      [L.masalah.end, { x: 640, y: -90, z: 1.06 }], [L.ancam.start + 0.4, papanK], [L.tujuan.start + 0.4, { x: 820, y: -60, z: 1.02 }],
      [L.jadi.start + 0.3, papanK], [info.end, papanK],
    ]);
    pg.perbarui(t, k);
    // Si Badai mini & hujannya
    const uB = hidup(tq, L.awan.start + 0.6, L.tujuan.end, 0.4, 0.3);
    tampil(bdi.akar, uB > 0.001);
    if (uB > 0) gerakBadai(bdi, t, { x: 1450, y: 450, s: 0.3 * uB, kilat: false, lihat: -1 });
    hujanKecil.setAttribute('opacity', f2(P(tq, tHujan, 0.3) * (1 - P(tq, L.ancam.start, 0.3))));
    atur(hujanKecil, `translate(0 ${f1((l % 4) * 6)})`);
    const uLbl = hidup(tq, W(L.awan, 'cakrawala'), tMasalah - 0.1);
    tampil(lblRisiko, uLbl > 0.001);
    atur(lblRisiko, `translate(1440 420) scale(${f2(uLbl)}) translate(-1440 -420) ${getar(31, l, 1440, 360)}`);
    aturStempel(stMasalah, tq, tMasalah, -10);
    tampil(stMasalah, tq >= tMasalah && tq < L.ancam.start);
    const uT = P(tq, W(L.tujuan, 'pelabuhan'), 0.4);
    tujuan.setAttribute('opacity', f2(uT * (tq > W(L.tujuan, 'tidak') ? 0.45 : 1)));
    rute.setAttribute('opacity', f2(uT * (tq > W(L.tujuan, 'tidak') ? 0.2 : 0.9)));
    if (uB > 0 && tq > W(L.tujuan, 'tidak')) bdi.akar.setAttribute('opacity', '0.4'); else bdi.akar.setAttribute('opacity', '1');
    atur(bdrTujuan, `skewY(${l % 2 ? 3 : -2})`);
    // kata RISIKO
    const uR = (tq >= tRisiko ? 1 : 0) * (1 - E.in(P(tq, L.def.start - 0.2, 0.3)));
    kataRisiko.forEach((g, i) => {
      const u = E.back(P(tq, tRisiko + i * 0.05, 0.24));
      tampil(g, tq >= tRisiko + i * 0.05 && uR > 0.01);
      atur(g, `translate(0 ${f1((1 - u) * -380 + (1 - uR) * -500)}) ${getar(600 + i, l, g._x, g._y, 1.2)}`);
    });
    // gulungan definisi
    const uG = E.out(P(tq, L.def.start - 0.05, 0.8)) * (1 - E.inout(P(tq, L.tiga.start - 0.1, 0.5)));
    tampil(gul, uG > 0.001);
    gul.buka(uG);
    sorot(d1.kunci.k, tq >= W(L.def, 'kemungkinan') - 0.05);
    sorot(d2.kunci.m, tq >= W(L.def, 'mengancam') - 0.05);
    sorot(d2.kunci.t, tq >= W(L.def, 'tujuan') - 0.05);
    // tali tiga kata
    tali._item.forEach((g, i) => ayunLabel(g, tq, tK[i], l, i));
    tampil(tali, tq >= tK[0] - 0.1);
    atur(tali._item[2], (tali._item[2].getAttribute('transform') || '') + (tq > L.tujuan.start && tq < L.tujuan.end ? ` translate(0 ${f1(-Math.abs(Math.sin(tq * 6)) * 8)})` : ''));
    // PP vs ISO
    const uPP = hidup(tq, W(L.ancam, 'ancaman') - 0.1, L.ancam.end + 0.3), uISO = hidup(tq, W(L.ancam, 'I-Es-O') - 0.1, L.ancam.end + 0.3);
    tampil(banding, uPP > 0.001);
    atur(kartuPP, `translate(1460 415) scale(${f2(uPP)}) rotate(-2) translate(-1460 -415)`);
    atur(kartuISO, `translate(1745 415) scale(${f2(uISO)}) rotate(2) translate(-1745 -415)`);
    tampil(peluang, tq >= W(L.ancam, 'peluang') - 0.05);
    // siklus
    tampil(siklus, tq >= tCakram[0] - 0.3);
    cakram.forEach((g, i) => { const u = E.back(P(tq, tCakram[i], 0.28)); tampil(g, tq >= tCakram[i]); atur(g, `translate(${g._x} ${g._y}) scale(${f2(u)}) translate(${-g._x} ${-g._y}) ${getar(640 + i, l, g._x, g._y)}`); });
    panah.forEach((p, i) => tampil(p, tq >= tCakram[Math.min(3, i + 1)] - 0.1));
    const uS = E.out(P(tq, W(L.jadi, 'sebelum'), 0.3));
    tampil(pitaSebelum, tq >= W(L.jadi, 'sebelum'));
    atur(pitaSebelum, `translate(1600 630) scale(${f2(uS)} 1) translate(-1600 -630) ${getar(660, l, 1600, 630)}`);
    // tokoh
    const kePapan = (tq > L.def.start && tq < L.tiga.start) || (tq > L.ancam.start && tq < L.ancam.end) || tq > L.jadi.start;
    const keLaut = tq > L.awan.start && tq < L.tujuan.end;
    const lihat = kePapan ? 1600 : keLaut ? 2400 : undefined;
    const tunjukS = (tq > tK[0] - 0.2 && tq < L.tiga.end) || (tq > W(L.awan, 'Awan') && tq < L.awan.end) || (tq > W(L.tujuan, 'pelabuhan') && tq < L.tujuan.end);
    gerakBoneka(syah, t, { lihat, kanan: tunjukS ? -95 + Math.sin(tq * 3) * 4 : undefined });
    gerakBoneka(ardi, t, { lihat, kanan: tq > L.inti.start && tq < L.inti.end + 0.3 ? -165 : tq > tHujan - 0.3 && tq < L.hujan.end + 0.3 ? -140 : undefined, miring: tq > L.inti.start && tq < L.inti.end ? -8 : 0 });
    gerakBoneka(gadis, t, { lihat, kanan: (tq > L.def.start && tq < L.def.end) ? -70 : undefined });
  };
};
