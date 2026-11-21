// ═══════════════════════════════════════════════════════════════════════════
// BABAK 6 · Membaca peta risiko (geladak, meja peta)
// ═══════════════════════════════════════════════════════════════════════════
function kotakKata(induk, x, y, w, hgt, judul, warna) {
  const g = el('g', { filter: 'url(#b3)' }, induk);
  kertas(kotak(x, y, w, hgt, 10), '#fffdf5', g, { amp: 1 });
  kertas(kotak(x, y, w, 56, 10), warna, g, { amp: 0.8 });
  teks(g, x + w / 2, y + 42, judul, { bebas: true, ukuran: 44, warna: '#fdf6e3', jangkar: 'middle', spasi: 2 });
  g._x = x + w / 2; g._y = y + hgt / 2; g._cy = y + 56 + (hgt - 56) / 2;
  return g;
}
function pitaKata(induk, isi, o = {}) {
  const g = el('g', { filter: 'url(#b2)' }, induk);
  const w = o.lebar ?? 300;
  kertas(kotak(-w / 2, -34, w, 68, 6), o.warna ?? '#fde68a', g, { amp: 0.9 });
  teksBaris(g, 0, isi.length > 22 ? -4 : 10, isi, { ukuran: o.ukuran ?? 24, tebal: 800, warna: '#1d3557', jangkar: 'middle', maks: o.maks ?? 22, jarak: 26 });
  return g;
}

window.ADEGAN.s7 = (akar, info) => {
  const L = {
    langkah: B('Pelampung kedua'), konteks: B('Konteks itu apa'), jawab: B('Jawaban atas satu'), tiga: B('Strategis Pemda bersumber'),
    pohon: B('Semuanya tertaut'), keliru: B('Lalu langkah yang paling'), gampang: B('Gampang! Risikonya'), penyebab: B('Itu bukan risiko. // Itu'.replace(' // ', ' ')),
    opini: B('Kalau opini laporan'), dampak: B('Itu juga bukan, Ardi'), antara: B('Risiko adalah kejadian di antara'), contoh: B('Karena anggaran tidak'),
    paham: B('Ooh. Sekarang'), klas: B('Penyebabnya diklasifikasikan'),
  };
  const pg = panggungGeladak(akar, { tiangX: 60 });
  const d = pg.lp[4];
  // meja peta dengan peta Aceh asli
  const meja = el('g', { filter: 'url(#b3)' }, d);
  kertas(kotak(1060, 730, 760, 34, 6), '#8c5a33', meja, { amp: 0.8 });
  kertas(kotak(1090, 762, 26, 140), '#5e3a1f', meja, { amp: 0.4 }); kertas(kotak(1764, 762, 26, 140), '#5e3a1f', meja, { amp: 0.4 });
  const peta = fotoCetak(meja, 'peta_aceh', 1140, 632, 300, 110, { tepi: 6, selotip: false });
  atur(peta, 'skewX(-18)');
  const syah = boneka('syahbandar', d, { x: 420, y: 930 });
  const ardi = boneka('ardi', d, { x: 630, y: 930 });
  const gadis = boneka('gadis', d, { x: 840, y: 930 });
  const ui = el('g', {}, d);
  // tiga langkah
  const LG = [['TETAPKAN KONTEKS', '#2a9d8f'], ['KENALI RISIKO', '#e63946'], ['UKUR', '#f4a261']];
  const langkah = LG.map(([isi, w], i) => { const g = el('g', { filter: 'url(#b2)' }, ui); const x = 1080 + i * 260; kertas(kotak(x - 120, 170, 240, 80, 8), w, g, { amp: 0.8 }); teksBaris(g, x, 204, isi, { bebas: true, ukuran: 34, warna: '#fdf6e3', jangkar: 'middle', maks: 10, jarak: 34 }); g._x = x; g._y = 210; return g; });
  // tiga ketinggian (bertingkat)
  const TK = [['STRATEGIS PEMDA', 'RPJMD', '#e63946', 420], ['STRATEGIS OPD', 'RENSTRA', '#f4a261', 560], ['OPERASIONAL OPD', 'RENJA & RKA', '#2a9d8f', 700]];
  const tingkat = TK.map(([nama, sumber, w, lebar], i) => {
    const g = el('g', { filter: 'url(#b2)' }, ui);
    const y = 290 + i * 100, x = 1340 - lebar / 2;
    kertas(kotak(x, y, lebar, 86, 8), w, g, { amp: 1 });
    teks(g, 1340, y + 40, nama, { bebas: true, ukuran: 40, warna: '#fdf6e3', jangkar: 'middle', spasi: 1 });
    teks(g, 1340, y + 74, '← ' + sumber, { ukuran: 24, tebal: 800, warna: '#fdf6e3', jangkar: 'middle' });
    g._x = 1340; g._y = y + 43;
    return g;
  });
  // pohon tujuan
  const PH = ['VISI', 'MISI', 'TUJUAN', 'SASARAN', 'KEGIATAN'];
  const pohon = el('g', {}, ui);
  const tali = el('path', { d: 'M1340 200 L1340 640', stroke: '#7a5230', 'stroke-width': 8, 'stroke-dasharray': '18 10' }, pohon);
  const simpul = PH.map((isi, i) => { const g = el('g', { filter: 'url(#b2)' }, pohon); const y = 220 + i * 100; kertas(kotak(1200, y - 36, 280, 72, 36), ['#1d3557', '#2a4f9c', '#2a9d8f', '#e9b949', '#e63946'][i], g, { amp: 0.8 }); teks(g, 1340, y + 14, isi, { bebas: true, ukuran: 42, warna: '#fdf6e3', jangkar: 'middle', spasi: 2 }); g._x = 1340; g._y = y; return g; });
  // penyebab - risiko - dampak
  const tiga = el('g', {}, ui);
  const kPeny = kotakKata(tiga, 1010, 230, 270, 320, 'PENYEBAB', '#f4a261');
  const kRis = kotakKata(tiga, 1305, 230, 270, 320, 'RISIKO', '#e63946');
  const kDam = kotakKata(tiga, 1600, 230, 270, 320, 'DAMPAK', '#457b9d');
  const panah = [0, 1].map((i) => { const g = el('g', { filter: 'url(#bt)' }, tiga); const x = 1270 + i * 295; kertas([[x, 370], [x + 22, 370], [x + 22, 356], [x + 36, 385], [x + 22, 414], [x + 22, 400], [x, 400]], '#1d3557', g, { amp: 0.3 }); return g; });
  const kataKarena = ['KARENA', 'MUNGKIN TERJADI', 'SEHINGGA'].map((isi, i) => { const g = el('g', {}, tiga); teks(g, [1145, 1440, 1735][i], 212, isi, { bebas: true, ukuran: 36, warna: '#fdf6e3', jangkar: 'middle', spasi: 2, attr: { stroke: '#1d3557', 'stroke-width': 6, 'paint-order': 'stroke' } }); return g; });
  const pAnggaran = pitaKata(tiga, 'anggaran tidak mencukupi', { lebar: 250, maks: 14 });
  const pOpini = pitaKata(tiga, 'opini laporan keuangan turun', { lebar: 250, maks: 14 });
  const pTerlambat = pitaKata(tiga, 'keterlambatan penyelesaian pekerjaan fisik', { lebar: 250, maks: 14, warna: '#fecaca' });
  const xRis = silang(tiga, 1440, 330, 70);
  // dua jaring
  const jaring = el('g', {}, ui);
  const JR = [['7M-1E', 'INTERNAL', 1160, '#2a9d8f'], ['PESTLE', 'EKSTERNAL', 1560, '#457b9d']];
  const net = JR.map(([j, s, x, w]) => {
    const g = el('g', { filter: 'url(#b2)' }, jaring);
    kertas(oval(x, 380, 170, 150, 40), w, g, { amp: 1.2 });
    for (let k = -4; k <= 4; k++) { el('path', { d: `M${x + k * 34} 250 L${x + k * 34} 510`, stroke: '#fdf6e3', 'stroke-width': 2, opacity: 0.5 }, g); el('path', { d: `M${x - 160} ${380 + k * 30} L${x + 160} ${380 + k * 30}`, stroke: '#fdf6e3', 'stroke-width': 2, opacity: 0.5 }, g); }
    teks(g, x, 380, j, { bebas: true, ukuran: 70, warna: '#fdf6e3', jangkar: 'middle', attr: { stroke: '#1d3557', 'stroke-width': 5, 'paint-order': 'stroke' } });
    teks(g, x, 440, s, { bebas: true, ukuran: 40, warna: '#fdf6e3', jangkar: 'middle', spasi: 3, attr: { stroke: '#1d3557', 'stroke-width': 4, 'paint-order': 'stroke' } });
    g._x = x; g._y = 380;
    return g;
  });
  const tagC = labelPapan(jaring, 1030, 560, 'CONTROLLABLE', 'masih dalam kendali', { lebar: 300, aksen: '#16a34a' });
  const tagU = labelPapan(jaring, 1420, 560, 'UNCONTROLLABLE', 'di luar kendali', { lebar: 320, aksen: '#64748b' });

  // ── waktu
  const tL = [W(L.langkah, 'konteks'), W(L.langkah, 'kenali'), W(L.langkah, 'ukur')];
  const tTK = [W(L.tiga, 'Er-Pe-Je-Em-De'), W(L.tiga, 'Renstra'), W(L.tiga, 'Renja')];
  const tPH = [W(L.pohon, 'Visi'), W(L.pohon, 'Misi'), W(L.pohon, 'Tujuan'), W(L.pohon, 'Sasaran'), W(L.pohon, 'Kegiatan')];
  const tAngg = W(L.gampang, 'anggaran'), tPeny = W(L.penyebab, 'penyebab'), tOpini = W(L.opini, 'opini'), tDamp = W(L.dampak, 'dampak');
  const tKar = [W(L.antara, 'Karena'), W(L.antara, 'mungkin'), W(L.antara, 'sehingga')], tTerl = W(L.contoh, 'keterlambatan');
  const tJar = [W(L.klas, 'internal'), W(L.klas, 'eksternal')], tTag = [W(L.klas, 'Kontrolebel'), W(L.klas, 'Ankontrolebel')];
  tL.forEach((x) => bunyi(x, 'pop', 0.5)); tTK.forEach((x) => bunyi(x, 'kertas', 0.4)); tPH.forEach((x) => bunyi(x, 'pop', 0.4));
  bunyi(tAngg, 'kertas', 0.5); bunyi(tPeny - 0.3, 'tik', 0.7); bunyi(tPeny, 'whoosh', 0.5); bunyi(tOpini, 'kertas', 0.5); bunyi(tDamp, 'whoosh', 0.5);
  tKar.forEach((x) => bunyi(x, 'pop', 0.4)); bunyi(tTerl, 'kertas', 0.5); bunyi(L.paham.start, 'ping', 0.5);
  tJar.forEach((x) => bunyi(x, 'desir', 0.5)); tTag.forEach((x) => bunyi(x, 'pop', 0.5));
  suasana(info.start, { angin: 0.35, ombak: 0.6, camar: 0.3 });

  const pos = (g, x, y, u, r = 0) => { tampil(g, u > 0.001); atur(g, `translate(${f1(x)} ${f1(y)}) scale(${f2(u)}) rotate(${f2(r)})`); };
  return (t) => {
    const tq = tStop(t), l = langkahDari(t);
    const papanK = { x: 180, y: -80, z: 1.1 };
    pg.perbarui(t, kunciKamera(t, [[info.start, { x: 120, y: 0, z: 1 }], [tL[0] - 0.4, papanK], [L.konteks.start, { x: 60, y: 30, z: 1.12 }], [L.jawab.start + 0.5, papanK],
      [L.gampang.start, { x: 160, y: -50, z: 1.04 }], [L.klas.start, papanK], [info.end, papanK]]));
    langkah.forEach((g, i) => lenting(g, tq, tL[i], L.jawab.start, l, i));
    tingkat.forEach((g, i) => lenting(g, tq, i === 0 ? Math.min(tTK[0], W(L.jawab, 'tiga')) : tTK[i], L.pohon.start - 0.2, l, 5 + i));
    tampil(pohon, tq >= tPH[0] - 0.3 && tq < L.keliru.start + 0.6);
    tali.setAttribute('stroke-dashoffset', f1(-tq * 30));
    simpul.forEach((g, i) => lenting(g, tq, tPH[i], L.keliru.start + 0.4, l, 10 + i));
    // penyebab / risiko / dampak
    tampil(tiga, tq >= L.keliru.start + 0.3 && tq < L.klas.start);
    lenting(kPeny, tq, L.keliru.start + 0.3, 1e9, l, 20); lenting(kRis, tq, L.keliru.start + 0.4, 1e9, l, 21); lenting(kDam, tq, L.keliru.start + 0.5, 1e9, l, 22);
    panah.forEach((g, i) => tampil(g, tq >= tKar[i + 1] - 0.1));
    kataKarena.forEach((g, i) => tampil(g, tq >= tKar[i]));
    const uA = E.back(P(tq, tAngg, 0.3)), mA = E.inout(P(tq, tPeny, 0.6));
    pos(pAnggaran, lerp(kRis._x, kPeny._x, mA), lerp(kRis._cy, kPeny._cy, mA) - 20 * Math.sin(mA * Math.PI) * 3, uA, Math.sin(mA * Math.PI) * -10);
    const uO = E.back(P(tq, tOpini, 0.3)), mO = E.inout(P(tq, tDamp, 0.6));
    pos(pOpini, lerp(kRis._x, kDam._x, mO), lerp(kRis._cy + 90, kDam._cy, mO) - 60 * Math.sin(mO * Math.PI), uO, Math.sin(mO * Math.PI) * 10);
    pos(pTerlambat, kRis._x, kRis._cy, E.back(P(tq, tTerl, 0.3)));
    tampil(xRis, (tq > tPeny - 0.3 && tq < tPeny + 0.3) || (tq > tDamp - 0.3 && tq < tDamp + 0.3));
    // dua jaring + label kendali
    tampil(jaring, tq >= tJar[0] - 0.2);
    net.forEach((g, i) => lenting(g, tq, tJar[i], 1e9, l, 30 + i));
    lenting(tagC, tq, tTag[0], 1e9, l, 32); lenting(tagU, tq, tTag[1], 1e9, l, 33);
    // tokoh
    const lihat = tq > tL[0] ? 1340 : undefined;
    gerakBoneka(syah, t, { lihat, kanan: tq > L.penyebab.start && tq < L.penyebab.end ? -96 : (tq > tTK[0] && tq < L.tiga.end ? -88 : undefined) });
    gerakBoneka(ardi, t, { lihat, kanan: tq > tAngg - 0.2 && tq < L.gampang.end ? -120 : undefined, lompat: tq > L.paham.start && tq < L.paham.end ? 1 : 0 });
    gerakBoneka(gadis, t, { lihat, miring: tq > L.konteks.start && tq < L.konteks.end ? 8 : 0, kanan: tq > tPH[0] && tq < L.pohon.end ? -80 : undefined });
  };
};
