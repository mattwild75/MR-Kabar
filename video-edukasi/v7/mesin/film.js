// ═══════════════════════════════════════════════════════════════════════════
// FILM: pengatur adegan, kartu babak, adegan sementara (animatik), lembar tokoh.
// Adegan didaftarkan di ADEGAN[id] = (akar, info) => (t) => { ... }.
// ═══════════════════════════════════════════════════════════════════════════
window.ADEGAN = window.ADEGAN || {};
const KILAT = document.getElementById('kilat');
window.kilat = (v) => { KILAT.style.opacity = clamp(v).toFixed(2); };

// ── adegan sementara: dermaga + tokoh yang bicara + pita kalimat ─────────
function adeganSementara(akar, info) {
  const lap = [lapisan(akar, 0), lapisan(akar, 0.1), lapisan(akar, 0.3), lapisan(akar, 0.6), lapisan(akar, 1), lapisan(akar, 1.12)];
  langit(lap[0], 'Siang');
  const mt = matahari(lap[1], 1500, 200);
  kotaMeulaboh(lap[2]);
  const lt = laut(akar, { lapis: [lap[2], lap[3], lap[5]] });
  dermaga(lap[4], -300, 2300);
  const awak = ['ardi', 'gadis', 'syahbandar'].map((n, i) => boneka(n, lap[4], { x: 560 + i * 230, y: 742 }));
  const tamu = {};
  for (const n of ['mercusuar', 'patroli', 'udin']) tamu[n] = boneka(n, lap[4], { x: 1360, y: 742 });
  const bdi = siBadai(lap[1]);
  const pita = el('g', { filter: 'url(#b3)' }, lap[5]);
  kertas(kotak(220, 900, 1480, 120, 6), '#fffdf5', pita, { amp: 1 });
  const baris = [0, 1].map((k) => teks(pita, 960, 950 + k * 44, '', { ukuran: 32, tebal: 700, jangkar: 'middle' }));
  const judul = el('g', { filter: 'url(#b2)' }, lap[5]);
  kertas(kotak(60, 50, 700, 70, 4), '#1d3557', judul, { amp: 1 });
  teks(judul, 90, 98, info.judul.toUpperCase(), { bebas: true, ukuran: 40, warna: '#f2c46b', spasi: 2 });
  return (t) => {
    const tq = tStop(t), l = langkahDari(t);
    kamera(lap, { x: 0, y: 0, z: 1 });
    mt.perbarui(tq, l);
    lt.perbarui(tq, 0);
    awak.forEach((b) => gerakBoneka(b, t));
    for (const [n, b] of Object.entries(tamu)) { const ada = kalimatPada(n, tq, 0.6); tampil(b.akar, !!ada); if (ada) gerakBoneka(b, t, { x: 1360 }); }
    const kb = kalimatPada('badai', tq, 0.6);
    tampil(bdi.akar, !!kb);
    if (kb) gerakBadai(bdi, t, { x: 1500, y: 240, s: 0.7 });
    const k = kalimatSiapaPun(tq);
    const isi = k ? `${GAYA_NAMA[k.tokoh]}: ${k.display}` : '';
    const kata = isi.split(' ');
    let a = '', b2 = '';
    for (const w of kata) { if ((a + ' ' + w).length < 78 && !b2) a = (a + ' ' + w).trim(); else b2 = (b2 + ' ' + w).trim(); }
    baris[0].textContent = a; baris[1].textContent = b2;
    tampil(pita, !!k);
  };
}
const GAYA_NAMA = { ardi: 'Ardi', gadis: 'Gadis', syahbandar: 'Pak Syahbandar', mercusuar: 'Penjaga Mercusuar', patroli: 'Petugas Patroli', udin: 'Pak Udin', badai: 'Si Badai' };

// ── kartu babak: lembar kertas biru dengan rute 10 pelampung ─────────────
const UI = el('g', { id: 'ui' });
const KARTU = el('g', {}, UI);
const kartuLembar = el('g', { filter: 'url(#b3)' }, KARTU);
kertas(kotak(-40, -40, 2000, 1160, 0), '#1d3557', kartuLembar, { amp: 2.4, langkah: 16 });
kertas(kotak(70, 70, 1780, 940, 10), '#24406a', kartuLembar, { amp: 1.6, langkah: 14 });
const kNo = teks(KARTU, 160, 300, '', { bebas: true, ukuran: 76, warna: '#f2c46b', spasi: 6 });
const kJudul = teks(KARTU, 160, 470, '', { bebas: true, ukuran: 170, warna: '#fdf6e3', spasi: 2 });
const kSasaran = el('g', {}, KARTU);
const kSasaranBg = kertas(kotak(160, 520, 420, 58, 26), '#e63946', kSasaran, { amp: 0.8 });
const kSasaranT = teks(kSasaran, 370, 560, '', { ukuran: 26, tebal: 800, warna: '#fdf6e3', jangkar: 'middle', spasi: 3 });
const RUTE = Array.from({ length: 12 }, (_, i) => [220 + i * 135, 830 + Math.sin(i * 1.3) * 34]);
el('path', { d: 'M' + RUTE.map((p) => p.join(' ')).join(' L'), stroke: '#8fb3dd', 'stroke-width': 5, 'stroke-dasharray': '4 16', 'stroke-linecap': 'round', fill: 'none' }, KARTU);
const kPelampung = RUTE.map(([x, y], i) => {
  const g = el('g', { filter: 'url(#bt)' }, KARTU);
  const akhir = i === 0 || i === 11;
  kertas(oval(x, y, akhir ? 26 : 20, akhir ? 26 : 20, 20), i === 0 ? '#2a9d8f' : i === 11 ? '#f2c46b' : '#e63946', g, { amp: 0.5 });
  teks(g, x, y + 9, i === 0 ? '' : i === 11 ? '' : String(i), { bebas: true, ukuran: 26, warna: '#fdf6e3', jangkar: 'middle' });
  return g;
});
teks(KARTU, RUTE[0][0], RUTE[0][1] + 66, 'DERMAGA', { bebas: true, ukuran: 26, warna: '#8fb3dd', jangkar: 'middle', spasi: 2 });
teks(KARTU, RUTE[11][0], RUTE[11][1] + 66, 'PELABUHAN', { bebas: true, ukuran: 26, warna: '#8fb3dd', jangkar: 'middle', spasi: 2 });
const kKapal = el('g', { filter: 'url(#b2)' }, KARTU);
kertas([[-46, -10], [50, -10], [36, 12], [-36, 12]], '#fdf6e3', kKapal, { amp: 0.5 });
kertas([[-2, -66], [34, -16], [-2, -14]], '#f2c46b', kKapal, { amp: 0.5 });
kertas(kotak(-4, -70, 4, 60), '#fdf6e3', kKapal, { amp: 0.2 });
const SASARAN = { Semua: 'UNTUK SEMUA', Pimpinan: 'UNTUK PIMPINAN', 'PIC OPD': 'UNTUK PIC OPD' };
function perbaruiKartu(t) {
  const s = TL.scenes.find((x) => x.kartu && t >= x.kartu.start && t <= x.kartu.end);
  tampil(KARTU, !!s);
  if (!s) return;
  const tq = tStop(t), l = langkahDari(t);
  const u = t - s.kartu.start, d = s.kartu.end - s.kartu.start;
  const masuk = E.out(P(u, 0, 0.45)), keluar = E.in(P(u, d - 0.42, 0.42));
  const x = (1 - masuk) * 2100 - keluar * 2100;
  atur(KARTU, `translate(${f1(x)} 0) rotate(${f2((1 - masuk) * 4 - keluar * 4)} 960 540)`);
  const [no, ...sisa] = s.judul.split(' · ');
  kNo.textContent = no.toUpperCase();
  kJudul.textContent = (sisa.join(' · ') || no).toUpperCase();
  kSasaranT.textContent = SASARAN[s.sasaran] || '';
  const n = TL.scenes.indexOf(s);                 // s2 -> 1 ... s12 -> 11
  const a = RUTE[Math.max(0, n - 1)], b = RUTE[Math.min(11, n)];
  const v = E.inout(P(u, 0.6, 1.6));
  const kx = lerp(a[0], b[0], v), ky = lerp(a[1], b[1], v) - 18 + Math.sin(tq * 5) * 3;
  atur(kKapal, `translate(${f1(kx)} ${f1(ky)}) rotate(${f2(Math.sin(tq * 4) * 4)})`);
  kPelampung.forEach((g, i) => atur(g, i === n && v > 0.95 ? `translate(0 ${f1(-Math.abs(Math.sin(tq * 6)) * 6)})` : ''));
  for (const [g, i] of [[kNo, 0], [kJudul, 1]]) atur(g, getar(500 + i, l, 960, 400, 0.8));
}

// ── kartu ingat: catatan inti di akhir babak 1-10 ─────────────────────────
const KARTU_INGAT = {
  s2: 'Risiko = kemungkinan · mengancam · tujuan. Sudah terjadi? Itu masalah, bukan risiko.',
  s3: 'Acuan MR Kabar: Peraturan Deputi PPKD BPKP Nomor 4 Tahun 2019.',
  s4: 'Kepala Daerah = Penanggung Jawab · Sekda = Koordinator · Lini 1 UPR · Lini 2 Unit Kepatuhan · Lini 3 Inspektorat',
  s5: 'Strategis Pemda ← RPJMD · Strategis OPD ← Renstra · Operasional OPD ← Renja & RKA',
  s6: 'Lima pelampung, dimulai dari CEE. CEE menilai yang DIJALANKAN, bukan sekadar yang ada.',
  s7: 'Karena (penyebab), mungkin terjadi (risiko), sehingga (dampak).',
  s8: 'Matriks bukan perkalian: D5×K1 = 20, D1×K5 = 9. Di atas Selera Risiko: wajib RTP dan masuk Prioritas.',
  s9: 'A-A-M-S-A · Inheren → Residual → Target → Aktual',
  s10: 'Tanpa niat: Kejadian Risiko. Ada niat: Dugaan Kecurangan (boleh tanpa nama, simpan tiket & kode akses).',
  s11: 'Satu baris risiko yang ditulis benar ikut menyusun gambar besar kabupaten.',
};
const INGAT = el('g', { filter: 'url(#b3)' }, UI);
const ingatKertas = kertas(kotak(150, 812, 1620, 200, 10), '#fffdf5', INGAT, { amp: 1.4, langkah: 12 });
kertas(kotak(150, 812, 26, 200), '#e63946', INGAT, { amp: 0.5 });
teks(INGAT, 210, 870, 'KARTU INGAT', { bebas: true, ukuran: 44, warna: '#e63946', spasi: 3 });
const ingatBaris = [0, 1].map((k) => teks(INGAT, 210, 930 + k * 50, '', { ukuran: 38, tebal: 800, warna: '#1d3557' }));
const ingatPaku = paku(INGAT, 960, 820);
for (const s of TL.scenes) if (s.ingat) bunyi(s.ingat.start, 'ping', 0.45);
function perbaruiIngat(t) {
  const s = TL.scenes.find((x) => x.ingat && t >= x.ingat.start && t <= x.ingat.end + 0.3);
  tampil(INGAT, !!s);
  if (!s) return;
  const l = langkahDari(t);
  const u = E.back(P(t, s.ingat.start, 0.35)) * (1 - E.in(P(t, s.ingat.end - 0.05, 0.3)));
  atur(INGAT, `translate(960 912) scale(${f2(u)}) rotate(${f2(-1.2 + Math.sin(l * 0.9) * 0.4)}) translate(-960 -912)`);
  const isi = KARTU_INGAT[s.id] || '';
  let a = '', b = '';
  for (const w of isi.split(' ')) { if ((a + ' ' + w).length <= 70 && !b) a = (a + ' ' + w).trim(); else b = (b + ' ' + w).trim(); }
  ingatBaris[0].textContent = a; ingatBaris[1].textContent = b;
}

// ── lembar tokoh (persetujuan rupa) ───────────────────────────────────────
function lembarTokoh() {
  const g = el('g', {});
  el('rect', { x: 0, y: 0, width: 1920, height: 1080, fill: '#f3ecdc' }, g);
  teks(g, 60, 92, 'LEMBAR TOKOH', { bebas: true, ukuran: 74, warna: '#1d3557', spasi: 3 });
  teks(g, 60, 132, 'Berlayar dengan Peta Risiko · video edukasi MR Kabar v7 · gaya paper cut', { ukuran: 24, tebal: 600, warna: '#5b6474' });
  const logo = el('image', { href: 'aset/img/MRKabar-lengkap.png', x: 1700, y: 26, width: 160, height: 149 }, g);
  const daftar = [['ardi', 'Ardi', 'awak muda · PIC'], ['gadis', 'Gadis', 'awak muda · teliti'], ['syahbandar', 'Pak Syahbandar', 'pembimbing'],
    ['mercusuar', 'Penjaga Mercusuar', 'Inspektorat · lini 3'], ['patroli', 'Petugas Patroli', 'Unit Kepatuhan · lini 2'], ['udin', 'Pak Udin', 'pelapor lewat QR']];
  const bon = daftar.map(([n, nama, peran], i) => {
    const x = 150 + i * 215;
    kertas(kotak(x - 98, 610, 196, 92, 6), '#fffdf5', g, { amp: 0.8, attr: { filter: 'url(#b2)' } });
    teks(g, x, 648, nama, { ukuran: 22, tebal: 800, jangkar: 'middle' });
    teks(g, x, 678, peran, { ukuran: 17, tebal: 600, warna: '#5b6474', jangkar: 'middle' });
    const b = boneka(n, g, { x, y: 596, s: 1.12 });
    return b;
  });
  const badai = siBadai(g);
  // rupa mulut A-I-U-E-O-M (Gadis)
  kertas(kotak(60, 740, 820, 300, 8), '#fffdf5', g, { amp: 0.9, attr: { filter: 'url(#b2)' } });
  teks(g, 90, 784, 'GERAK MULUT MENGIKUTI SUKU KATA', { bebas: true, ukuran: 34, warna: '#1d3557', spasi: 2 });
  el('clipPath', { id: 'potongVis' }, g).appendChild(Object.assign(document.createElementNS(NS, 'rect'), {}));
  g.lastChild.lastChild.setAttribute('x', 62); g.lastChild.lastChild.setAttribute('y', 742);
  g.lastChild.lastChild.setAttribute('width', 816); g.lastChild.lastChild.setAttribute('height', 296);
  const visG = el('g', { 'clip-path': 'url(#potongVis)' }, g);
  const vis = ['a', 'i', 'u', 'e', 'o', 'm'].map((v, i) => {
    const b = boneka('gadis', visG, { x: 140 + i * 128, y: 1150, s: 0.95 });
    return [b, v];
  });
  ['a', 'i', 'u', 'e', 'o', 'm'].forEach((v, i) => {
    const x = 140 + i * 128;
    kertas(kotak(x - 24, 978, 48, 48, 8), '#1d3557', g, { amp: 0.6, attr: { filter: 'url(#bt)' } });
    teks(g, x, 1015, v.toUpperCase(), { bebas: true, ukuran: 38, warna: '#f2c46b', jangkar: 'middle' });
  });
  // simbol jabatan
  kertas(kotak(920, 740, 940, 300, 8), '#fffdf5', g, { amp: 0.9, attr: { filter: 'url(#b2)' } });
  teks(g, 950, 784, 'SIMBOL JABATAN (TANPA WAJAH, TANPA SUARA)', { bebas: true, ukuran: 34, warna: '#1d3557', spasi: 2 });
  const kd = simbolKepalaDaerah(g, 1110, 930, 0.48);
  teks(g, 1110, 1024, 'Kepala Daerah', { ukuran: 21, tebal: 800, jangkar: 'middle' });
  const sk = simbolSekda(g, 1400, 912, 0.62);
  teks(g, 1400, 1024, 'Sekretaris Daerah', { ukuran: 21, tebal: 800, jangkar: 'middle' });
  const mc = mercusuar(g, 1610, 960, 0.6);
  mc.firstChild.style.display = 'none';
  teks(g, 1610, 1024, 'Inspektorat', { ukuran: 21, tebal: 800, jangkar: 'middle' });
  const kp = kapalPatroli(g, { s: 0.42 });
  atur(kp, 'translate(1760 880)');
  teks(g, 1760, 930, 'Unit Kepatuhan', { ukuran: 17, tebal: 700, jangkar: 'middle', warna: '#5b6474' });
  return () => {
    const t = 3.3;
    bon.forEach((b, i) => gerakBoneka(b, t, { lihat: b.x + (i < 3 ? 200 : -200), senyum: 1, kiri: i === 3 ? 30 : 12, kanan: i === 4 ? -26 : -12, simak: false, gestur: false }));
    gerakBadai(badai, 0.4, { x: 1560, y: 360, s: 0.62 });
    vis.forEach(([b, v]) => {
      gerakBoneka(b, t, { simak: false, gestur: false });
      const m = mulutBentuk(VIS[v], 0); b.mulutLuar.setAttribute('d', m.luar); b.mulutDalam.setAttribute('d', m.dalam);
      tampil(b.mataTutup, false); tampil(b.mataBuka, true);
    });
    kd.perbarui(0, 0.6); sk.perbarui(0, 0.6, 18); mc.perbarui(1, 2, 1); kp.perbarui(0, 0);
  };
}

// ═══════════════════════════════════════════════════════════════════════════
if (window.MODE === 'lembar') {
  const f = lembarTokoh();
  window.setVideoTime = () => f();
  tampil(KARTU, false);
  tampil(INGAT, false);
} else {
  const AKAR = el('g', { id: 'adegan' });
  SVG.insertBefore(AKAR, UI);
  const DAFTAR = TL.scenes.map((s) => {
    const g = el('g', { id: 'a_' + s.id }, AKAR);
    const f = (window.ADEGAN[s.id] || adeganSementara)(g, s);
    tampil(g, false);
    return { s, g, f };
  });
  window.setVideoTime = function (t) {
    let i = DAFTAR.findIndex((d) => t >= d.s.start && t < d.s.end);
    if (i < 0) i = DAFTAR.length - 1;
    let aktif = DAFTAR[i];
    if (aktif.s.kartu && t < aktif.s.kartu.start + 0.45 && i > 0) aktif = DAFTAR[i - 1];
    for (const d of DAFTAR) tampil(d.g, d === aktif);
    window.kilat(0);
    aktif.f(t);
    perbaruiKartu(t);
    perbaruiIngat(t);
  };
}

// ── butir kertas (tekstur serat, sekali saja) ─────────────────────────────
(() => {
  const c = document.getElementById('butir'), g = c.getContext('2d');
  const d = g.createImageData(960, 540), r = acak(4242);
  for (let i = 0; i < d.data.length; i += 4) {
    const v = 225 + r() * 30 - (r() < 0.02 ? 40 : 0);
    d.data[i] = v; d.data[i + 1] = v - 3; d.data[i + 2] = v - 10; d.data[i + 3] = 255;
  }
  g.putImageData(d, 0, 0);
  g.globalAlpha = 0.08; g.strokeStyle = '#7a5a3a';
  for (let k = 0; k < 900; k++) { const x = r() * 960, y = r() * 540, a = r() * Math.PI; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * 10, y + Math.sin(a) * 10); g.stroke(); }
})();
window.setVideoTime(0);
