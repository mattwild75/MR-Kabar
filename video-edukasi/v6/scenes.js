// ═══════════════════════════════════════════════════════════════════════════
// Koreografi video edukasi MR Kabar v6. Waktu SELALU dirujuk lewat kalimat:
//   L(id)  awal kalimat, LE(id) akhir kalimat, W(id, 'kata') saat kata
//   diucapkan (kata = ejaan TTS, mis. RPJMD -> 'er-pe-je-em-de').
// Kalau durasi narasi berubah, seluruh tampilan ikut bergeser sendiri.
// ═══════════════════════════════════════════════════════════════════════════
const X0 = 150; // margin kiri tipografi

// penanda babak di pojok kiri atas (seperti cap pada film dokumenter)
function tandaBab(scene, teksBab, akhir) {
  const s = SC[scene];
  teks({ t0: s.first_line - 0.3, t1: akhir ?? s.end - 0.6, x: 80, y: 52, cls: 'cap', html: teksBab, anim: 'kiri', fin: 0.6, fout: 0.5 });
}
function capKanan(t0, t1, html) {
  const it = teks({ t0, t1, x: 0, y: 52, cls: 'cap', html, anim: 'kanan', fin: 0.6, fout: 0.5 });
  it.el.style.left = 'auto';
  it.el.style.right = '80px';
  return it;
}
/** Label melayang dengan garis penunjuk ke titik (px, py). */
function tunjuk(t0, t1, px, py, judul, sub, arah = 'atas') {
  bunyi(t0, 'pop', 0.45);
  const dy = arah === 'atas' ? -150 : 120;
  svgItem({
    t0, t1, fin: 0.6, fout: 0.5,
    isi: `<line x1="${px}" y1="${py}" x2="${px}" y2="${py + dy}" stroke="#f2b45a" stroke-width="3"/><circle cx="${px}" cy="${py}" r="9" fill="#f2b45a"/>`,
    gambar: (el, t, pin) => { const l = el.querySelector('line'); l.setAttribute('y2', py + dy * E.out(pin)); },
  });
  const y = arah === 'atas' ? py + dy - 96 : py + dy + 8;
  const x = Math.max(40, Math.min(LW - 680, px - 320));
  teks({ t0: t0 + 0.25, t1, x, y, w: 640, cls: 'h4 ctr', html: judul, anim: 'naik', fout: 0.5 });
  if (sub) teks({ t0: t0 + 0.4, t1, x, y: y + 52, w: 640, cls: 'body-s ctr', html: sub, anim: 'naik', fout: 0.5 });
}
/** Daftar bernomor yang muncul satu-satu. */
function barisan(butir, o) {
  butir.forEach(([t, html], i) => {
    bunyi(t, 'tik', 0.5);
    teks({ t0: t, t1: o.t1, x: o.x, y: o.y + i * o.jarak, w: o.w || 900, cls: o.cls || 'h4', html, anim: o.anim || 'kiri', fout: 0.4 });
  });
}

// ════════════════ s1 · PEMBUKA ═════════════════════════════════════════════
D(0, { langit: 'malam', camZ: 1.22, camY: -30, shipX: 1520, shipS: 0.3, wind: 0.22, dim: 0, coast: 1, lh: 1, beam: 0 });
D(L(1) - 0.6, { lh: 0.25 });
D(L(4) - 0.7, { lh: 1 });
D(L(2) - 1, { camZ: 1.04, camY: 0, shipX: 1330, shipS: 0.36 });
D(L(4) - 0.6, { langit: 'senja', camZ: 1.0, shipX: 820, shipS: 0.78, wind: 0.32, harbor: 0 });
D(W(5, 'tujuannya'), { harbor: 1, shipX: 720 });
D(W(5, 'angin'), { wind: 0.75, cloud: 0.55 });
D(L(6), { shipX: 860, camZ: 1.02 });
D(W(6, 'em-er') - 1.5, { langit: 'malam', beam: 1, dim: 0.25, shipX: 1240, shipS: 0.5, wind: 0.3, harbor: 0.6, ease: 'sine' });
D(L(7), { buoys: 1, dim: 0.35 });
D(LE(7), { buoys: 1, dim: 0.4 });

teks({ t0: 0.8, t1: 3.4, x: 0, y: 470, w: LW, cls: 'serif-s ctr redup', html: 'Inspektorat Kabupaten Aceh Barat mempersembahkan', anim: 'fade', fin: 1.0, fout: 0.8 });
tirai({ t0: L(1) - 0.3, t1: LE(1) + 0.6, bg: 'linear-gradient(90deg, rgba(3,9,16,.9) 0%, rgba(3,9,16,.6) 50%, rgba(3,9,16,0) 80%)' });
teks({ t0: L(1) - 0.05, t1: LE(1) + 0.6, x: X0, y: 250, w: 1300, cls: 'serif', html: 'Pernah kebayang enggak…', anim: 'naik' });
teks({ t0: W(1, 'dianggarkan'), t1: LE(1) + 0.6, x: X0, y: 360, w: 1400, cls: 'h2', html: 'Sudah dianggarkan.', anim: 'kiri' });
teks({ t0: W(1, 'direncanakan'), t1: LE(1) + 0.6, x: X0, y: 460, w: 1400, cls: 'h2', html: 'Sudah direncanakan matang.', anim: 'kiri' });
teks({ t0: W(1, 'gagal'), t1: LE(1) + 0.6, x: X0, y: 560, w: 1500, cls: 'h1 merah', html: 'Tetap gagal.', anim: 'stempel', rot: -2 });
teks({ t0: W(1, 'satu'), t1: LE(1) + 0.6, x: X0, y: 740, w: 1300, cls: 'body', html: '…karena satu hal yang sebenarnya <em>bisa diduga sejak awal</em>.', anim: 'naik' });

foto({ src: 'senja_meulaboh', t0: L(2) - 0.9, t1: LE(2) + 0.3, kb: [0, 30, 1.18, 0, -10, 1.05] });
capKanan(L(2) - 0.2, LE(2), 'Pesisir barat Aceh · <b>Meulaboh</b>');
teks({ t0: W(2, 'laut'), t1: LE(2) + 0.2, x: X0, y: 650, w: 1500, cls: 'h1', html: 'Laut tidak pernah<br>benar-benar tenang.', anim: 'huruf' });

foto({ src: 'nelayan_aceh', t0: L(3) - 0.6, t1: W(3, 'memeriksa'), kb: [-60, 0, 1.15, 40, 0, 1.06], fout: 0.9 });
foto({ src: 'tarik_pukat', t0: W(3, 'memeriksa') - 0.4, t1: LE(3) + 0.2, kb: [40, 20, 1.08, -30, 0, 1.18] });
tirai({ t0: L(3), t1: LE(3) + 0.1, kuat: 0.95 });
teks({ t0: L(3) + 0.1, t1: LE(3), x: X0, y: 250, w: 900, cls: 'serif', html: 'Yang pulang selamat <br>bukan yang paling beruntung.', anim: 'naik' });
barisan([
  [W(3, 'membaca'), '<span class="mono emas" style="font-size:30px">01</span>&nbsp; Membaca langit'],
  [W(3, 'memeriksa'), '<span class="mono emas" style="font-size:30px">02</span>&nbsp; Memeriksa perahu'],
  [W(3, 'badai'), '<span class="mono emas" style="font-size:30px">03</span>&nbsp; Siap saat badai datang'],
], { t1: LE(3) + 0.1, x: X0, y: 520, jarak: 92, cls: 'h3' });

teks({ t0: W(4, 'setiap'), t1: LE(4) + 0.3, x: 0, y: 240, w: LW, cls: 'serif ctr', html: '“Setiap program adalah sebuah <em>pelayaran</em>.”', anim: 'naik' });
teks({ t0: L(4), t1: LE(4) + 0.3, x: 0, y: 175, w: LW, cls: 'label ctr', html: 'Pemerintah daerah pun begitu', anim: 'fade' });

tunjuk(W(5, 'tujuannya'), LE(5), 1700, 590, 'Sasaran RPJMD', 'tujuan pelayaran');
teks({ t0: W(5, 'angin'), t1: LE(5), x: 520, y: 170, w: 400, cls: 'h3 ctr', html: 'Angin', anim: 'zoom' });
teks({ t0: W(5, 'arus'), t1: LE(5), x: 180, y: 820, w: 400, cls: 'h3 ctr', html: 'Arus', anim: 'zoom' });
teks({ t0: W(5, 'karang'), t1: LE(5), x: 1040, y: 860, w: 400, cls: 'h3 ctr', html: 'Karang', anim: 'zoom' });
// garis angin, panah arus, karang tersembunyi
svgItem({
  t0: W(5, 'angin'), t1: LE(5), fin: 0.6, fout: 0.6,
  isi: [0, 1, 2, 3, 4].map((i) => `<path class="a" d="M ${360 + i * 60} ${250 + i * 22} q 120 -30 240 0 t 240 0" fill="none" stroke="rgba(230,240,255,.6)" stroke-width="3" stroke-linecap="round" stroke-dasharray="80 520"/>`).join('')
    + `<path d="M 160 930 C 300 880 420 980 560 920" fill="none" stroke="#f2b45a" stroke-width="5" stroke-dasharray="14 12" opacity=".0" class="r"/>`
    + `<g class="k" opacity="0"><path d="M 1080 990 l 60 -60 l 50 30 l 70 -50 l 60 80 z" fill="#0a1a26" stroke="rgba(255,255,255,.35)" stroke-width="2"/><path d="M 1060 990 q 90 -18 260 0" stroke="rgba(255,255,255,.55)" stroke-width="4" fill="none"/></g>`,
  gambar: (el, t) => {
    el.querySelectorAll('.a').forEach((p, i) => p.setAttribute('stroke-dashoffset', -(t * 260 + i * 90)));
    el.querySelector('.r').setAttribute('opacity', P(t, W(5, 'arus'), 0.5));
    el.querySelector('.r').setAttribute('stroke-dashoffset', -t * 40);
    el.querySelector('.k').setAttribute('opacity', P(t, W(5, 'karang'), 0.5));
  },
});

teks({ t0: W(6, 'manajemen'), t1: W(6, 'em-er') - 0.4, x: 0, y: 380, w: LW, cls: 'h1 ctr', html: 'Manajemen Risiko', anim: 'huruf', fout: 0.6 });
// judul utama
bunyi(W(6, 'em-er') - 0.1, 'boom', 1);
bunyi(W(4, 'setiap'), 'lonceng', 0.55);
svgItem({
  t0: W(6, 'em-er') - 0.1, t1: L(7) - 0.4, fin: 1.0, fout: 0.8, x: 760, y: 150, w: 400, h: 372,
  isi: `<rect x="0" y="0" width="400" height="372" rx="48" fill="#f4f1ea"/><image href="img/mrkabar.png" x="30" y="24" width="340" height="316"/>`,
  gambar: (el, t, pin) => { el.style.transform = `scale(${0.8 + 0.2 * E.out5(pin)})`; },
});
teks({ t0: W(6, 'kabar') - 0.2, t1: L(7) - 0.4, x: 0, y: 560, w: LW, cls: 'hero ctr', html: 'MR KABAR', anim: 'huruf', fout: 0.8 });
teks({ t0: LE(6) + 0.3, t1: L(7) - 0.4, x: 0, y: 800, w: LW, cls: 'serif ctr emas', html: 'Risiko TerKabar, Daerah Terjaga', anim: 'naik', fout: 0.8 });

teks({ t0: W(7, 'delapan'), t1: LE(7) + 0.4, x: 0, y: 240, w: LW, cls: 'h1 ctr', html: '8 babak', anim: 'zoom' });
teks({ t0: W(7, 'tiga'), t1: LE(7) + 0.4, x: 0, y: 380, w: LW, cls: 'h2 ctr emas', html: '+ 3 pelajaran', anim: 'zoom' });
teks({ t0: L(7), t1: LE(7) + 0.4, x: 0, y: 140, w: LW, cls: 'kicker ctr', html: 'Yuk, berlayar bersama', anim: 'fade' });

// ════════════════ s2 · APA ITU RISIKO ══════════════════════════════════════
kartuBab('s2', '01', 'Apa itu risiko', 'Kata yang paling sering disalahpahami', 'badai_laut');
tandaBab('s2', 'Babak 01 · <b>Apa itu risiko</b>');
D(CD.s2.start, { lh: 0, langit: 'badai', cloud: 0.55, wind: 0.45, dim: 0.2, shipX: 980, shipS: 0.55, beam: 0, buoys: 0, harbor: 0, camZ: 1.0, rain: 0 });
D(W(11, 'hujannya') - 0.3, { rain: 0 });
D(W(11, 'hujannya') + 0.6, { rain: 1, cloud: 1, ease: 'out' });
D(LE(11) + 0.5, { rain: 0.15 });
D(L(13), { rain: 0, cloud: 0.5, harbor: 1, langit: 'senja', dim: 0.25 });
D(L(14), { langit: 'fajar', harbor: 1, dim: 0.3 });
kilat(W(12, 'mengancam') + 0.1, W(12, 'ancaman') + 0.15);

teks({ t0: L(8), t1: LE(8) + 0.3, x: 0, y: 300, w: LW, cls: 'serif-s ctr redup', html: 'kata yang paling sering disalahpahami', anim: 'fade' });
teks({ t0: W(8, 'risiko'), t1: LE(8) + 0.3, x: 0, y: 360, w: LW, cls: 'hero ctr', html: 'RISIKO', anim: 'huruf', bunyi: 'boom', g: 0.6 });

tirai({ t0: L(9), t1: LE(10) + 0.2 });
capKanan(L(9), LE(14), 'PP 60 / 2008 · <b>SPIP</b>');
teks({ t0: L(9) + 0.2, t1: LE(10) + 0.2, x: X0, y: 220, w: 1400, cls: 'kicker', html: 'Peraturan Pemerintah No. 60 Tahun 2008', anim: 'kiri' });
teks({ t0: W(9, 'risiko'), t1: LE(10) + 0.2, x: X0, y: 290, w: 1050, cls: 'serif', html: 'Risiko adalah <em>kemungkinan</em> kejadian yang <em>mengancam</em> pencapaian <em>tujuan</em> dan sasaran instansi pemerintah.', anim: 'naik', fin: 1.2 });
barisan([
  [W(10, 'kemungkinan'), 'Kemungkinan'],
  [W(10, 'mengancam'), 'Mengancam'],
  [W(10, 'tujuan'), 'Tujuan'],
], { t1: LE(10) + 0.2, x: 1260, y: 300, jarak: 130, cls: 'h2 emas', anim: 'kanan' });

teks({ t0: L(11), t1: LE(11) + 0.2, x: X0, y: 200, w: 900, cls: 'h2 emas', html: 'Kemungkinan', anim: 'kiri' });
teks({ t0: L(11) + 0.5, t1: LE(11) + 0.2, x: X0, y: 310, w: 900, cls: 'body', html: 'artinya <b>belum terjadi</b>.', anim: 'naik' });
tunjuk(W(11, 'awan'), W(11, 'hujannya'), 1240, 330, 'Masih risiko', 'awan gelap di cakrawala', 'bawah');
teks({ t0: W(11, 'masalah') - 0.1, t1: LE(11) + 0.2, x: 1150, y: 420, cls: 'stempel', html: 'Sudah masalah', anim: 'stempel', rot: -7 });

teks({ t0: L(12), t1: LE(12) + 0.2, x: X0, y: 200, w: 900, cls: 'h2 emas', html: 'Mengancam', anim: 'kiri' });
teks({ t0: L(12) + 0.5, t1: LE(12) + 0.2, x: X0, y: 310, w: 1000, cls: 'body', html: 'fokusnya pada <b>ancaman</b> terhadap tujuan.', anim: 'naik' });
teks({ t0: W(12, 'i-es-o'), t1: LE(12) + 0.2, x: X0, y: 520, w: 700, cls: 'body-s', html: '<span class="h4" style="color:var(--putih)">ISO 31000</span><br>ancaman <b>dan</b> peluang', anim: 'naik' });
teks({ t0: W(12, 'i-es-o') + 0.5, t1: LE(12) + 0.2, x: 760, y: 520, w: 700, cls: 'body-s', html: '<span class="h4 emas">SPIP · sektor publik</span><br>fokus pada ancaman', anim: 'naik' });

teks({ t0: L(13), t1: LE(13) + 0.2, x: X0, y: 200, w: 900, cls: 'h2 emas', html: 'Tujuan', anim: 'kiri' });
teks({ t0: L(13) + 0.5, t1: LE(13) + 0.2, x: X0, y: 310, w: 1000, cls: 'body', html: 'risiko selalu terikat pada <b>satu tujuan</b>.', anim: 'naik' });
tunjuk(W(13, 'tujuan') + 0.3, LE(13) + 0.2, 1700, 590, 'Pelabuhan tujuan', '');
teks({ t0: W(13, 'tanpa'), t1: LE(13) + 0.2, x: X0, y: 760, w: 1300, cls: 'serif', html: 'Tanpa pelabuhan yang hendak dituju, tidak ada badai yang perlu diperhitungkan.', anim: 'naik' });

teks({ t0: L(14), t1: LE(14) + 0.4, x: 0, y: 200, w: LW, cls: 'kicker ctr', html: 'Manajemen risiko', anim: 'fade' });
[['mengenali', 'Mengenali'], ['menilai', 'Menilai'], ['mengendalikan', 'Mengendalikan'], ['memantau', 'Memantau']].forEach(([k, h], i) => {
  teks({ t0: W(14, k), t1: LE(14) + 0.4, x: 100 + i * 440, y: 340, w: 400, cls: 'h3 ctr', html: `<span class="mono emas" style="font-size:28px">0${i + 1}</span><br>${h}`, anim: 'naik' });
});
svgItem({
  t0: W(14, 'menilai'), t1: LE(14) + 0.4, fin: 0.1,
  isi: [0, 1, 2].map((i) => `<path d="M ${505 + i * 440} 425 l 30 0 m -14 -14 l 14 14 l -14 14" stroke="#f2b45a" stroke-width="5" fill="none" class="p${i}"/>`).join(''),
  gambar: (el, t) => {
    ['menilai', 'mengendalikan', 'memantau'].forEach((k, i) => el.querySelector('.p' + i).setAttribute('opacity', P(t, W(14, k), 0.4)));
  },
});
teks({ t0: W(14, 'sebelum'), t1: LE(14) + 0.4, x: 0, y: 640, w: LW, cls: 'serif ctr emas', html: '…sebelum sempat terjadi.', anim: 'naik' });

// ════════════════ s3 · MENGAPA ═════════════════════════════════════════════
kartuBab('s3', '02', 'Mengapa harus dikelola', 'Sebelas persoalan yang ditemukan BPKP', 'pantai_meulaboh');
tandaBab('s3', 'Babak 02 · <b>Mengapa harus dikelola</b>');
D(CD.s3.start, { langit: 'siang', cloud: 0.75, cloudDark: 0.35, wind: 0.55, shipX: 1520, shipS: 0.42, dim: 0.42, harbor: 0, rain: 0, beam: 0 });
D(L(20), { wind: 0.95, cloud: 0.9, dim: 0.35 });
D(L(21) + 1, { wind: 0.4, cloud: 0.4, cloudDark: 0.1, dim: 0.55 });

teks({ t0: L(15), t1: LE(15) + 0.3, x: 0, y: 400, w: LW, cls: 'h1 ctr', html: 'Kenapa harus repot?', anim: 'huruf' });

capKanan(W(16, 'peraturan'), LE(18) + 0.3, 'Perdep PPKD · <b>No. 4 / 2019</b>');
teks({ t0: L(16), t1: W(16, 'sebelas') - 0.2, x: 0, y: 420, w: LW, cls: 'serif ctr', html: 'BPKP memotret praktik penilaian risiko<br>di pemerintah daerah…', anim: 'naik', fout: 0.4 });
teks({ t0: W(16, 'sebelas') - 0.1, t1: LE(18) + 0.3, x: X0 - 10, y: 150, w: 400, cls: 'hero emas', html: '<span style="font-size:330px">11</span>', anim: 'zoom' });
teks({ t0: W(16, 'sebelas') + 0.2, t1: LE(18) + 0.3, x: 470, y: 230, w: 700, cls: 'h2', html: 'persoalan', anim: 'kiri' });
teks({ t0: W(16, 'sebelas') + 0.5, t1: LE(18) + 0.3, x: 470, y: 340, w: 560, cls: 'body-s', html: 'ditemukan BPKP dalam praktik penilaian risiko pemerintah daerah', anim: 'naik' });
teks({ t0: W(17, 'formalitas') - 0.1, t1: LE(18) + 0.3, x: 1120, y: 200, cls: 'stempel', html: 'Formalitas', anim: 'stempel', rot: -6 });
teks({ t0: W(17, 'rencana'), t1: LE(18) + 0.3, x: 1120, y: 390, w: 700, cls: 'h3', html: 'RTP disusun, lalu dilupakan', anim: 'naik' });
garis({ t0: W(17, 'dilupakan'), t1: LE(18) + 0.3, x: 1110, y: 425, w: 640, tebal: 6, fin: 0.4 });
barisan([
  [W(18, 'waktunya'), '<span class="merah">✕</span>&nbsp; Waktu tidak baku'],
  [W(18, 'penanggung'), '<span class="merah">✕</span>&nbsp; Penanggung jawab tidak jelas'],
  [W(18, 'pejabat'), '<span class="merah">✕</span>&nbsp; Pejabat strategis belum terlibat'],
  [W(18, 'fokusnya'), '<span class="merah">✕</span>&nbsp; Baru risiko operasional'],
  [W(18, 'sendiri-sendiri'), '<span class="merah">✕</span>&nbsp; Sendiri-sendiri per OPD'],
], { t1: LE(18) + 0.3, x: X0, y: 520, jarak: 66, cls: 'h4' });
teks({ t0: W(19, 'manual') - 0.1, t1: LE(19) + 0.4, x: 0, y: 380, w: LW, cls: 'ctr', html: '<span class="stempel" style="font-size:190px;border-width:12px">MANUAL</span>', anim: 'stempel', rot: -5 });

kertasTerbang({ t0: L(20) - 0.4, t1: LE(21), kumpul: L(21) + 0.3, tx: 860, ty: 420, n: 26 });
barisan([
  [W(20, 'mudah'), 'Mudah hilang'],
  [W(20, 'sulit'), 'Sulit direkap'],
  [W(20, 'tidak'), 'Tanpa jejak'],
], { t1: LE(20) + 0.2, x: X0, y: 760, jarak: 0, cls: 'h3', anim: 'naik' });
// geser ketiganya mendatar
ITEMS.slice(-3).forEach((it, i) => (it.el.style.left = 150 + i * 560 + 'px'));
teks({ t0: L(20), t1: LE(20) + 0.2, x: X0, y: 180, w: 1200, cls: 'serif', html: 'Dulu: puluhan berkas Excel & Word,<br>di puluhan komputer berbeda.', anim: 'naik' });

teks({ t0: L(21), t1: LE(21) + 0.4, x: 0, y: 60, w: LW, cls: 'h3 ctr', html: 'MR Kabar menyatukannya', anim: 'naik' });
laptop({ src: 'dashboard', t0: L(21) + 0.9, t1: LE(21) + 0.5, x: 400, y: 170, w: 1120, tilt: [10, 0, 2, 0], push: [0.94, 1.0] });
barisan([
  [W(21, 'satu', 1), '1 aplikasi'],
  [W(21, 'struktur'), 'Struktur sesuai Perdep'],
  [W(21, 'setiap', 1), 'Setiap perubahan tercatat'],
], { t1: LE(21) + 0.4, x: 40, y: 330, jarak: 170, w: 330, cls: 'h4', anim: 'kiri' });
barisan([
  [W(21, 'o-pe'), 'Tiap OPD kelola datanya'],
  [W(21, 'pimpinan'), 'Pimpinan: satu layar'],
], { t1: LE(21) + 0.4, x: 1550, y: 330, jarak: 170, w: 330, cls: 'h4', anim: 'kanan' });

// ════════════════ s4 · SIAPA NAKHODANYA ════════════════════════════════════
kartuBab('s4', '03', 'Siapa nakhodanya', 'Penanggung jawab, pelaksana, dan tiga lapis penjaga', 'tarik_pukat');
tandaBab('s4', 'Babak 03 · <b>Siapa nakhodanya</b>');
D(CD.s4.start, { langit: 'senja', cloud: 0.3, cloudDark: 0.2, wind: 0.32, shipX: 1450, shipS: 0.5, dim: 0.5, harbor: 0, ship2A: 0, beam: 0, buoys: 0 });
D(L(28) - 1.2, { lh: 1, moon: 0, langit: 'malam', dim: 0.05, shipX: 1260, shipS: 0.62, ship2A: 1, ship2X: 760, beam: 0, camZ: 1.0 });
D(W(30, 'mercusuar') - 0.5, { beam: 1 });
D(L(31) - 0.2, { dim: 0.6, beam: 1, lh: 0.4 });
D(LE(35), { dim: 0.6 });

// kemudi kapal
svgItem({
  t0: L(22), t1: LE(25) + 0.3, x: 1180, y: 160, w: 640, h: 640, fin: 1.0,
  isi: `<g transform="translate(320 320)"><g class="r">${Array.from({ length: 8 }, (_, i) => `<g transform="rotate(${i * 45})"><rect x="-9" y="-300" width="18" height="120" rx="8" fill="#8a5a2b"/><circle cy="-300" r="22" fill="#a86f37"/></g>`).join('')}<circle r="190" fill="none" stroke="#a86f37" stroke-width="34"/><circle r="190" fill="none" stroke="#6f4520" stroke-width="6"/><circle r="56" fill="#a86f37"/><circle r="20" fill="#f2b45a"/></g></g>`,
  gambar: (el, t) => el.querySelector('.r').setAttribute('transform', `rotate(${Math.sin(t * 0.5) * 24})`),
});
teks({ t0: W(22, 'siapa'), t1: LE(23) + 0.3, x: X0, y: 240, w: 1000, cls: 'h1', html: 'Siapa<br>nakhodanya?', anim: 'huruf' });
teks({ t0: W(23, 'bukan', 1), t1: LE(23) + 0.3, x: X0, y: 560, w: 900, cls: 'h3 redup', html: 'Operator aplikasi', anim: 'kiri' });
garis({ t0: W(23, 'bukan', 1) + 0.4, t1: LE(23) + 0.3, x: X0 - 10, y: 590, w: 520, tebal: 7 });
teks({ t0: W(23, 'bukan', 2), t1: LE(23) + 0.3, x: X0, y: 650, w: 900, cls: 'h3 redup', html: 'Hanya Inspektorat', anim: 'kiri' });
garis({ t0: W(23, 'bukan', 2) + 0.4, t1: LE(23) + 0.3, x: X0 - 10, y: 680, w: 520, tebal: 7 });

teks({ t0: L(24), t1: LE(25) + 0.3, x: X0, y: 170, w: 1000, cls: 'kicker', html: 'Penanggung Jawab Pengelolaan Risiko', anim: 'kiri' });
teks({ t0: W(24, 'kepala'), t1: LE(25) + 0.3, x: X0, y: 220, w: 1000, cls: 'h1', html: 'Kepala Daerah', anim: 'huruf' });
teks({ t0: W(24, 'tunggal'), t1: LE(25) + 0.3, x: X0, y: 375, w: 500, cls: 'cap', html: 'Tunggal', anim: 'zoom' });
teks({ t0: W(24, 'tidak'), t1: LE(25) + 0.3, x: X0 + 190, y: 375, w: 500, cls: 'cap', html: 'Tidak didelegasikan', anim: 'zoom' });
teks({ t0: L(25), t1: LE(25) + 0.3, x: X0, y: 500, w: 1000, cls: 'kicker', html: 'Koordinator Penyelenggaraan', anim: 'kiri' });
teks({ t0: W(25, 'sekretaris'), t1: LE(25) + 0.3, x: X0, y: 550, w: 1000, cls: 'h1', html: 'Sekretaris Daerah', anim: 'huruf' });
teks({ t0: W(25, 'baik'), t1: LE(25) + 0.3, x: X0, y: 705, w: 800, cls: 'body-s', html: 'untuk risiko tingkat Pemda maupun tingkat OPD', anim: 'naik' });

foto({ src: 'tarik_pukat', mode: 'kanan', w: 1080, t0: L(26) - 0.3, t1: LE(26) + 0.2, kb: [30, 0, 1.12, -20, 0, 1.02] });
tirai({ t0: L(26) - 0.3, t1: LE(26) + 0.2, bg: 'linear-gradient(90deg, rgba(3,9,16,.95) 0%, rgba(3,9,16,.8) 45%, rgba(3,9,16,0) 70%)' });
teks({ t0: L(26) + 0.1, t1: LE(26) + 0.2, x: X0, y: 160, w: 900, cls: 'kicker', html: 'Awak kapalnya', anim: 'kiri' });
teks({ t0: W(26, 'unit'), t1: LE(26) + 0.2, x: X0, y: 210, w: 900, cls: 'h2', html: 'Unit Pemilik Risiko', anim: 'huruf' });
barisan([
  [W(26, 'pemda'), '<span class="emas">UPR Tingkat Pemda</span><br><span class="body-s">Ketua: Kepala Daerah · anggota: seluruh Kepala OPD</span>'],
], { t1: LE(26) + 0.2, x: X0, y: 380, jarak: 0, w: 800, cls: 'h3' });
barisan([[W(26, 'dua'), '<span class="emas">Eselon II</span>']], { t1: LE(26) + 0.2, x: X0 + 90, y: 560, jarak: 0, cls: 'h3' });
barisan([[W(26, 'tiga'), '<span class="emas">Eselon III & IV</span>']], { t1: LE(26) + 0.2, x: X0 + 180, y: 660, jarak: 0, cls: 'h3' });
svgItem({
  t0: W(26, 'pemda'), t1: LE(26) + 0.2,
  isi: `<path d="M 160 520 v 70 h 70 v 100 h 70" stroke="#f2b45a" stroke-width="4" fill="none" stroke-dasharray="400" class="g"/>`,
  gambar: (el, t) => el.querySelector('.g').setAttribute('stroke-dashoffset', 400 * (1 - E.inout(P(t, W(26, 'dua') - 0.3, 1.6)))),
});

laptop({ src: 'struktur', t0: L(27) - 0.2, t1: LE(27) + 0.3, x: 760, y: 170, w: 1080, tilt: [8, -14, 3, -6], fokus: [{ t: L(27) + 2.2, d: 5, x: 1110, y: 880, w: 240, h: 180 }] });
teks({ t0: L(27), t1: LE(27) + 0.3, x: X0, y: 260, w: 560, cls: 'h2', html: 'Bagan digambar dari data', anim: 'naik' });
teks({ t0: W(27, 'berganti'), t1: LE(27) + 0.3, x: X0, y: 560, w: 560, cls: 'serif-s', html: 'Berganti pejabat? <em>Cukup ubah datanya.</em>', anim: 'naik' });

teks({ t0: L(28), t1: LE(30) + 0.3, x: 0, y: 120, w: LW, cls: 'h2 ctr', html: 'Three Lines of Defense', anim: 'huruf' });
teks({ t0: L(28) + 0.6, t1: LE(30) + 0.3, x: 0, y: 225, w: LW, cls: 'serif-s ctr redup', html: 'tiga lapis penjaga', anim: 'fade' });
tunjuk(W(29, 'lini', 1), LE(30) + 0.3, 1268, 740, 'Lini 1 · UPR', 'mengelola risiko sehari-hari');
tunjuk(W(29, 'lini', 2), LE(30) + 0.3, 770, 690, 'Lini 2 · Unit Kepatuhan', 'Asisten Sekda · memantau seluruh UPR');
tunjuk(W(30, 'inspektorat'), LE(30) + 0.3, 210, 470, 'Lini 3 · Inspektorat', 'evaluasi independen, di luar kapal');
foto({ src: 'mercusuar_breueh', mode: 'cetak', x: 1500, y: 300, w: 330, h: 470, rot: 4, t0: W(30, 'mercusuar'), t1: LE(30) + 0.2, ket: 'Mercusuar Pulau Breueh, Aceh', kb: [0, 0, 1.05, 0, 0, 1.0] });

teks({ t0: L(31), t1: LE(35) + 0.3, x: 0, y: 110, w: LW, cls: 'h2 ctr', html: 'Tiga peran yang sering tertukar', anim: 'huruf' });
const PERAN = [
  ['Penanggung Jawab Pengelolaan Risiko', 'Kepala Daerah', 'melekat pada jabatan · tidak pernah menjadi kolom isian'],
  ['Pemilik Risiko', 'Sebuah unit (UPR)', 'bukan seseorang · tercatat di setiap baris risiko'],
  ['Penanggung Jawab Pengendalian', 'Jabatan berwenang', 'melekat pada rencana pengendalian, bukan pada risikonya'],
];
PERAN.forEach(([lab, isi, ket], i) => {
  const t0 = L(32 + i), x = 150 + i * 560;
  teks({ t0, t1: LE(35) + 0.3, x, y: 330, w: 500, cls: 'label', html: lab, anim: 'naik' });
  teks({ t0: t0 + 0.3, t1: LE(35) + 0.3, x, y: 410, w: 500, cls: 'h3 emas', html: isi, anim: 'naik' });
  teks({ t0: t0 + 0.8, t1: LE(35) + 0.3, x, y: 500, w: 470, cls: 'body-s', html: ket, anim: 'naik' });
  if (i) garis({ t0: t0, t1: LE(35) + 0.3, x: x - 40, y: 320, w: 3, h: 330, tegak: true, warna: 'rgba(244,241,234,.25)', tebal: 330 });
});
teks({ t0: L(35), t1: LE(35) + 0.3, x: 0, y: 720, w: LW, cls: 'serif-s ctr', html: 'Ketiganya boleh jatuh pada orang yang sama.', anim: 'naik' });
teks({ t0: W(35, 'tidak') - 0.1, t1: LE(35) + 0.3, x: 0, y: 790, w: LW, cls: 'ctr', html: '<span class="stempel" style="font-size:72px">Jangan menebak</span>', anim: 'stempel', rot: -4 });

// ════════════════ s5 · KAPAN ═══════════════════════════════════════════════
kartuBab('s5', '04', 'Kapan berlayar', 'Siklus perencanaan yang berulang', 'lampulo');
tandaBab('s5', 'Babak 04 · <b>Kapan berlayar</b>');
D(CD.s5.start, { lh: 0, langit: 'senja', cloud: 0.35, dim: 0.55, ship2A: 0, beam: 0, shipX: 1600, shipS: 0.35 });
D(L(41) - 0.5, { dim: 0.65 });

teks({ t0: L(36), t1: LE(39) + 0.3, x: X0, y: 180, w: 700, cls: 'h2', html: 'Tidak sekali jalan', anim: 'huruf' });
teks({ t0: W(36, 'berulang'), t1: LE(39) + 0.3, x: X0, y: 300, w: 640, cls: 'serif-s', html: 'berulang, mengikuti kalender perencanaan', anim: 'naik' });
// cincin siklus
const CX = 1300, CY = 560;
svgItem({
  t0: L(36) + 0.4, t1: LE(39) + 0.3, fin: 0.8,
  isi: [[400, 'o'], [300, 'm'], [200, 'i']].map(([r, c]) => `<g class="${c}"><circle cx="${CX}" cy="${CY}" r="${r}" fill="none" stroke="rgba(244,241,234,.18)" stroke-width="3"/><circle cx="${CX}" cy="${CY}" r="${r}" fill="none" stroke="#f2b45a" stroke-width="6" stroke-dasharray="${2 * Math.PI * r}" class="busur"/><circle r="14" fill="#f2b45a" class="titik"/></g>`).join('')
    + [0, 1, 2, 3].map((q) => `<g class="tw" data-q="${q}"><circle cx="${CX + 200 * Math.sin(q * Math.PI / 2 + Math.PI / 4)}" cy="${CY - 200 * Math.cos(q * Math.PI / 2 + Math.PI / 4)}" r="22" fill="#e5484d"/><text x="${CX + 262 * Math.sin(q * Math.PI / 2 + Math.PI / 4)}" y="${CY - 262 * Math.cos(q * Math.PI / 2 + Math.PI / 4) + 10}" fill="#f4f1ea" font-family="Bebas" font-size="34" text-anchor="middle">TW ${['I', 'II', 'III', 'IV'][q]}</text></g>`).join(''),
  gambar: (el, t) => {
    const waktu = { o: W(37, 'er-pe-je'), m: W(37, 'renstra'), i: W(38, 'operasional') };
    const laju = { o: 0.12, m: 0.25, i: 0.6 };
    for (const c of ['o', 'm', 'i']) {
      const g = el.querySelector('.' + c);
      const p = E.inout(P(t, waktu[c], 1.4));
      g.style.opacity = P(t, waktu[c] - 0.2, 0.4);
      const r = { o: 400, m: 300, i: 200 }[c];
      g.querySelector('.busur').setAttribute('stroke-dashoffset', 2 * Math.PI * r * (1 - p));
      g.querySelector('.busur').setAttribute('transform', `rotate(-90 ${CX} ${CY})`);
      const a = -Math.PI / 2 + (t - waktu[c]) * laju[c];
      g.querySelector('.titik').setAttribute('cx', CX + r * Math.cos(a));
      g.querySelector('.titik').setAttribute('cy', CY + r * Math.sin(a));
    }
    el.querySelectorAll('.tw').forEach((g) => {
      const q = +g.dataset.q;
      const t0 = W(39, 'triwulan') + q * 0.25;
      g.style.opacity = P(t, t0, 0.3);
      g.querySelector('circle').setAttribute('r', 16 + 8 * Math.max(0, Math.sin((t - t0) * 4)) * (t > t0 ? 1 : 0));
    });
  },
});
teks({ t0: W(37, 'er-pe-je'), t1: LE(39) + 0.3, x: CX - 200, y: CY - 470, w: 400, cls: 'h4 ctr emas', html: 'RPJMD · 5 tahun', anim: 'naik' });
teks({ t0: W(37, 'renstra'), t1: LE(39) + 0.3, x: CX - 200, y: CY - 360, w: 400, cls: 'h4 ctr emas', html: 'Renstra', anim: 'naik' });
teks({ t0: W(38, 'operasional'), t1: LE(39) + 0.3, x: CX - 200, y: CY - 40, w: 400, cls: 'h4 ctr emas', html: 'Renja & RKA<br><span class="body-s">tahunan</span>', anim: 'naik' });
barisan([
  [W(37, 'risiko', 1), '<span class="emas">Strategis Pemda</span><br><span class="body-s">RPJMD lima tahunan</span>'],
  [W(37, 'risiko', 2), '<span class="emas">Strategis OPD</span><br><span class="body-s">Renstra · sinkron Renja & pagu</span>'],
  [W(38, 'risiko'), '<span class="emas">Operasional OPD</span><br><span class="body-s">Renja & RKA · sampai DPA</span>'],
], { t1: LE(39) + 0.3, x: X0, y: 430, jarak: 130, w: 640, cls: 'h4' });
teks({ t0: W(39, 'akhir'), t1: LE(39) + 0.3, x: X0, y: 840, w: 700, cls: 'body', html: 'Laporan: <b>tiap triwulan</b> + <b>akhir tahun</b>', anim: 'naik' });

teks({ t0: W(40, 'surat'), t1: LE(40) + 0.3, x: 0, y: 160, w: LW, cls: 'kicker ctr', html: 'Surat Edaran Arahan & Kebijakan Penilaian Risiko', anim: 'fade' });
[['lima', '5 tahunan', 'mengikuti RPJMD', 560], ['setiap', 'Tiap tahun', 'arahan tahunan', 1060]].forEach(([k, j, s, x]) => {
  svgItem({
    t0: W(40, k), t1: LE(40) + 0.3, x, y: 260, w: 300, h: 400, fin: 0.7,
    isi: `<rect x="10" y="10" width="280" height="370" rx="10" fill="#f3ead6"/><rect x="40" y="60" width="220" height="12" fill="#c9bea6"/><rect x="40" y="90" width="180" height="10" fill="#d8cfba"/><rect x="40" y="115" width="200" height="10" fill="#d8cfba"/><rect x="40" y="140" width="160" height="10" fill="#d8cfba"/><circle cx="210" cy="300" r="46" fill="none" stroke="#e5484d" stroke-width="7"/><circle cx="210" cy="300" r="30" fill="none" stroke="#e5484d" stroke-width="3"/>`,
    gambar: (el, t, pin) => { el.style.transform = `translateY(${(1 - E.out5(pin)) * 80}px) rotate(${x < 900 ? -4 : 4}deg)`; },
  });
  teks({ t0: W(40, k) + 0.3, t1: LE(40) + 0.3, x: x - 50, y: 680, w: 400, cls: 'h3 ctr', html: j, anim: 'naik' });
  teks({ t0: W(40, k) + 0.5, t1: LE(40) + 0.3, x: x - 50, y: 750, w: 400, cls: 'body-s ctr', html: s, anim: 'naik' });
});
laptop({ src: 'dashboard', t0: L(41) - 0.2, t1: LE(41) + 0.3, x: 380, y: 150, w: 1160, tilt: [8, 0, 3, 0], push: [0.98, 1.06], fokus: [{ t: W(41, 'garis'), d: 6, x: 272, y: 156, w: 1632, h: 84 }, { t: W(41, 'merah'), d: 4, x: 1650, y: 168, w: 176, h: 36 }] });
teks({ t0: L(41), t1: LE(41) + 0.3, x: 0, y: 70, w: LW, cls: 'h3 ctr', html: 'Jadwal tampil di Dashboard', anim: 'naik' });

// ════════════════ s6 · LIMA TAHAP & CEE ════════════════════════════════════
kartuBab('s6', '05', 'Lima tahap & memeriksa kapal', 'Perdep PPKD No. 4 Tahun 2019, Bab III', 'peta_sumatra_barat');
tandaBab('s6', 'Babak 05 · <b>Lima tahap</b>');
D(CD.s6.start, { langit: 'siang', cloud: 0.3, cloudDark: 0, wind: 0.25, dim: 0.25, shipX: 960, shipS: 0.85, camZ: 1.0, ship2A: 0, beam: 0, leak: 0 });
D(L(49) - 0.4, { langit: 'badai', cloud: 0.8, wind: 0.7, leak: 0, dim: 0.15, shipX: 960, shipS: 0.95 });
D(W(49, 'lambung') - 0.6, { leak: 1, ease: 'out' });

foto({ src: 'peta_sumatra_barat', t0: L(42) - 0.4, t1: LE(43) + 0.4, kb: [0, 60, 1.12, 0, -40, 1.0], gelap: 'rgba(30,20,10,.08)' });
capKanan(L(42), LE(43) + 0.3, 'Perdep PPKD 4 / 2019 · <b>Bab III</b>');
teks({ t0: L(42) + 0.2, t1: LE(43) + 0.3, x: X0, y: 140, w: 900, cls: 'h2 kertas-t', html: 'Lima pelampung', anim: 'kiri' });
const RUTE = [[300, 900], [620, 700], [980, 640], [1300, 470], [1620, 300]];
svgItem({
  t0: L(42) + 0.8, t1: LE(43) + 0.3, fadeMasuk: false,
  isi: `<path class="jalur" d="M 120 1000 C 260 950 300 920 300 900 S 520 720 620 700 S 880 660 980 640 S 1220 520 1300 470 S 1560 330 1620 300 L 1820 180" fill="none" stroke="#7a2e1e" stroke-width="7" stroke-dasharray="18 14"/>`
    + RUTE.map(([x, y], i) => `<g class="b" data-i="${i}"><circle cx="${x}" cy="${y}" r="44" fill="#e5484d" stroke="#f3ead6" stroke-width="7"/><text x="${x}" y="${y + 18}" text-anchor="middle" font-family="Bebas" font-size="56" fill="#fff">${i + 1}</text></g>`).join(''),
  gambar: (el, t) => {
    const j = el.querySelector('.jalur');
    const p = E.inout(P(t, L(42) + 0.8, 3.2));
    j.style.clipPath = `inset(0 ${(1 - p) * 100}% 0 0)`;
    const kata = ['satu', 'dua', 'tiga', 'empat', 'lima'];
    el.querySelectorAll('.b').forEach((g) => {
      const i = +g.dataset.i;
      const tb = W(43, kata[i], i === 4 ? 1 : 1);
      const q = E.back(P(t, tb, 0.5));
      g.style.opacity = P(t, tb, 0.2);
      g.style.transformOrigin = `${RUTE[i][0]}px ${RUTE[i][1]}px`;
      g.style.transform = `scale(${0.3 + 0.7 * q})`;
    });
  },
});
['satu', 'dua', 'tiga', 'empat', 'lima'].forEach((k) => bunyi(W(43, k), 'ping', 0.6));
[['satu', 'Identifikasi Kelemahan<br>Lingkungan Pengendalian'], ['dua', 'Penilaian Risiko'], ['tiga', 'Kegiatan Pengendalian'], ['empat', 'Informasi & Komunikasi'], ['lima', 'Pemantauan']].forEach(([k, h], i) => {
  const [x, y] = RUTE[i];
  teks({ t0: W(43, k) + 0.15, t1: LE(43) + 0.3, x: x - 250, y: y + 58, w: 500, cls: 'h4 ctr kertas-t', html: h, anim: 'naik' });
});

teks({ t0: L(44), t1: LE(44) + 0.2, x: X0, y: 170, w: 900, cls: 'kicker', html: 'Pelampung 1', anim: 'kiri' });
teks({ t0: L(44) + 0.2, t1: LE(44) + 0.2, x: X0, y: 220, w: 1100, cls: 'h1', html: 'Periksa dulu kapalnya', anim: 'huruf' });
svgItem({
  t0: L(44) + 0.5, t1: LE(45), fin: 0.5,
  isi: `<g stroke="#f2b45a" stroke-width="6" fill="none"><path d="M 690 660 v -50 h 50"/><path d="M 1230 660 v -50 h -50"/><path d="M 690 900 v 50 h 50"/><path d="M 1230 900 v 50 h -50"/></g><line class="pindai" x1="700" x2="1220" y1="620" y2="620" stroke="#f2b45a" stroke-width="4" opacity=".9"/>`,
  gambar: (el, t) => {
    const y = 625 + (0.5 - 0.5 * Math.cos(t * 1.8)) * 310;
    el.querySelector('.pindai').setAttribute('y1', y);
    el.querySelector('.pindai').setAttribute('y2', y);
  },
});
teks({ t0: L(45), t1: LE(45) + 0.3, x: X0, y: 170, w: 1200, cls: 'kicker', html: 'Control Environment Evaluation', anim: 'kiri' });
teks({ t0: W(45, 'ce-e-e'), t1: LE(45) + 0.3, x: X0, y: 220, w: 1100, cls: 'hero emas', html: 'CEE', anim: 'huruf' });
teks({ t0: W(45, 'setiap'), t1: LE(45) + 0.3, x: X0, y: 440, w: 760, cls: 'body', html: 'Setiap OPD menilai lingkungan pengendaliannya <b>sendiri</b>.', anim: 'naik' });

tirai({ t0: L(46) - 0.2, t1: LE(48) + 0.2 });
teks({ t0: W(46, 'delapan'), t1: LE(46) + 0.3, x: X0, y: 140, w: 600, cls: 'hero emas', html: '8', anim: 'zoom' });
teks({ t0: W(46, 'delapan') + 0.2, t1: LE(46) + 0.3, x: X0 + 150, y: 200, w: 500, cls: 'h3', html: 'unsur', anim: 'kiri' });
teks({ t0: W(46, '37'), t1: LE(46) + 0.3, x: X0, y: 340, w: 600, cls: 'hero emas', html: '37', anim: 'zoom' });
teks({ t0: W(46, '37') + 0.2, t1: LE(46) + 0.3, x: X0 + 230, y: 400, w: 400, cls: 'h3', html: 'pertanyaan<br><span class="body-s">Form 1a</span>', anim: 'kiri' });
barisan([
  [W(46, 'form', 2), '<span class="mono emas">1b</span>&nbsp; dokumen pendukung'],
  [W(46, 'form', 3), '<span class="mono emas">1c</span>&nbsp; simpulan per unsur'],
], { t1: LE(46) + 0.3, x: X0, y: 590, jarak: 70, w: 640, cls: 'h4' });
teks({ t0: W(46, 'memadai', 1), t1: LE(46) + 0.3, x: X0, y: 760, w: 300, cls: 'cap', html: '<b>Memadai</b>', anim: 'zoom' });
teks({ t0: W(46, 'kurang'), t1: LE(46) + 0.3, x: X0 + 220, y: 760, w: 400, cls: 'cap', html: 'Kurang Memadai', anim: 'zoom' });
laptop({ src: 'cee-1a', t0: W(46, 'form', 1) - 0.4, t1: LE(46) + 0.3, x: 760, y: 170, w: 1080, tilt: [8, -16, 3, -8], gulir: [0, 260, W(46, 'form', 1) + 1, 6], fokus: [{ t: W(46, '37') + 0.2, d: 2.6, x: 272, y: 205, w: 360, h: 26 }] });

teks({ t0: L(47), t1: LE(47) + 0.3, x: X0, y: 200, w: 800, cls: 'h3', html: '<span class="emas">✓</span> Dokumen lengkap', anim: 'kiri' });
teks({ t0: W(47, 'persepsi'), t1: LE(47) + 0.3, x: X0, y: 300, w: 800, cls: 'h3', html: '<span class="merah">✕</span> Persepsi pegawai berbeda', anim: 'kiri' });
teks({ t0: W(47, 'menandainya') - 0.1, t1: LE(47) + 0.3, x: X0, y: 440, cls: 'stempel emas', html: 'Ditandai', anim: 'stempel', rot: -5 });
teks({ t0: W(47, 'alasan'), t1: LE(47) + 0.3, x: X0, y: 620, w: 900, cls: 'serif-s', html: 'alasan pendalaman <em>wajib ditulis</em>', anim: 'naik' });
teks({ t0: L(48), t1: LE(48) + 0.3, x: X0, y: 200, w: 900, cls: 'hero emas', html: 'Form 1d', anim: 'huruf' });
teks({ t0: W(48, 'rencana'), t1: LE(48) + 0.3, x: X0, y: 420, w: 900, cls: 'body', html: 'rencana perbaikan untuk setiap unsur yang <b>Kurang Memadai</b>', anim: 'naik' });
teks({ t0: W(49, 'berlayar'), t1: LE(49) + 0.5, x: 0, y: 160, w: LW, cls: 'serif ctr', html: 'Menilai risiko tanpa memeriksa lingkungan pengendalian…', anim: 'naik' });
teks({ t0: W(49, 'lambung'), t1: LE(49) + 0.5, x: 0, y: 250, w: LW, cls: 'h2 ctr merah', html: '…berlayar dengan lambung bocor.', anim: 'huruf' });

// ════════════════ s7 · MEMBACA PETA RISIKO ═════════════════════════════════
kartuBab('s7', '06', 'Membaca peta risiko', 'Konteks · identifikasi · analisis', 'peta_aceh', [0, 40, 1.1, 0, -20, 1.0]);
tandaBab('s7', 'Babak 06 · <b>Membaca peta risiko</b>');
D(CD.s7.start, { langit: 'malam', cloud: 0.1, cloudDark: 0.5, wind: 0.25, leak: 0, dim: 0.35, shipX: 1500, shipS: 0.4, beam: 0, stars: 1 });
D(L(53) - 0.3, { dim: 0.7 });

teks({ t0: L(50), t1: LE(50) + 0.3, x: X0, y: 170, w: 900, cls: 'kicker', html: 'Pelampung 2', anim: 'kiri' });
teks({ t0: L(50) + 0.2, t1: LE(50) + 0.3, x: X0, y: 220, w: 1300, cls: 'h1', html: 'Penilaian Risiko', anim: 'huruf' });
[['tetapkan', 'Konteks'], ['kenali', 'Kenali'], ['ukur', 'Ukur']].forEach(([k, h], i) => {
  teks({ t0: W(50, k), t1: LE(50) + 0.3, x: X0 + i * 470, y: 470, w: 420, cls: 'h2', html: `<span class="mono emas" style="font-size:28px">0${i + 1}</span><br>${h}`, anim: 'naik' });
});
teks({ t0: L(51), t1: LE(52) + 0.4, x: 0, y: 70, w: LW, cls: 'serif ctr', html: 'Tujuan mana yang sedang kita lindungi?', anim: 'naik' });
// rasi bintang hierarki
const RASI = [['Visi', 300, 300], ['Misi', 520, 420], ['Tujuan', 760, 360], ['Sasaran', 1000, 480], ['Program', 1250, 420], ['Kegiatan', 1500, 540]];
svgItem({
  t0: L(52), t1: LE(52) + 1.0, fin: 0.4,
  isi: RASI.slice(1).map(([, x, y], i) => `<line class="ln" data-i="${i}" x1="${RASI[i][1]}" y1="${RASI[i][2]}" x2="${x}" y2="${y}" stroke="rgba(242,180,90,.7)" stroke-width="3"/>`).join('')
    + RASI.map(([n, x, y], i) => `<g class="st" data-i="${i}"><circle cx="${x}" cy="${y}" r="34" fill="rgba(242,180,90,.18)"/><circle cx="${x}" cy="${y}" r="13" fill="#ffe2a8"/><text x="${x}" y="${y + 70}" text-anchor="middle" font-family="Bebas" font-size="44" fill="#f4f1ea">${n}</text></g>`).join(''),
  gambar: (el, t) => {
    const kata = ['visi', 'misi', 'tujuan', 'sasaran', 'sampai', 'kegiatan'];
    el.querySelectorAll('.st').forEach((g) => { const i = +g.dataset.i; const tb = W(52, kata[i]); g.style.opacity = P(t, tb, 0.3); g.querySelector('circle').setAttribute('r', 34 + 6 * Math.sin(t * 3 + i)); });
    el.querySelectorAll('.ln').forEach((l) => { const i = +l.dataset.i; const tb = W(52, kata[i + 1]); const p = E.out(P(t, tb - 0.2, 0.5)); const [, x0, y0] = RASI[i], [, x1, y1] = RASI[i + 1]; l.setAttribute('x2', lerp(x0, x1, p)); l.setAttribute('y2', lerp(y0, y1, p)); l.style.opacity = p > 0 ? 1 : 0; });
  },
});
barisan([
  [W(52, 'strategis', 1), '<span class="emas">Strategis Pemda</span> · RPJMD'],
  [W(52, 'strategis', 2), '<span class="emas">Strategis OPD</span> · Renstra'],
  [W(52, 'operasional'), '<span class="emas">Operasional OPD</span> · Renja & RKA'],
], { t1: LE(52) + 0.4, x: X0, y: 720, jarak: 0, w: 560, cls: 'h4', anim: 'naik' });
ITEMS.slice(-3).forEach((it, i) => (it.el.style.left = 150 + i * 580 + 'px'));

teks({ t0: L(53), t1: LE(53) + 0.3, x: 0, y: 330, w: LW, cls: 'kicker ctr', html: 'Langkah yang paling sering keliru', anim: 'fade' });
teks({ t0: W(53, 'menuliskan'), t1: LE(53) + 0.3, x: 0, y: 390, w: LW, cls: 'h1 ctr', html: 'Menuliskan risiko', anim: 'huruf' });
// rantai penyebab -> risiko -> dampak
const RANTAI_Y = 300;
function rantai(t1, pen, ris, dam, waktu) {
  teks({ t0: waktu[0], t1, x: 90, y: RANTAI_Y, w: 520, cls: 'h3 ctr', html: pen, anim: 'naik' });
  teks({ t0: waktu[1], t1, x: 700, y: RANTAI_Y, w: 520, cls: 'h3 ctr', html: ris, anim: 'zoom' });
  teks({ t0: waktu[2], t1, x: 1310, y: RANTAI_Y, w: 520, cls: 'h3 ctr', html: dam, anim: 'naik' });
}
teks({ t0: L(54), t1: LE(57) + 0.3, x: 90, y: RANTAI_Y, w: 520, cls: 'h3 ctr', html: 'Anggaran tidak mencukupi', anim: 'naik' });
teks({ t0: W(54, 'penyebab') - 0.1, t1: LE(57) + 0.3, x: 210, y: RANTAI_Y + 150, cls: 'stempel emas', html: 'Penyebab', anim: 'stempel', rot: -5 });
teks({ t0: L(55), t1: LE(57) + 0.3, x: 1310, y: RANTAI_Y, w: 520, cls: 'h3 ctr', html: 'Opini laporan keuangan turun', anim: 'naik' });
teks({ t0: W(55, 'dampak') - 0.1, t1: LE(57) + 0.3, x: 1420, y: RANTAI_Y + 150, cls: 'stempel', html: 'Dampak', anim: 'stempel', rot: 5 });
teks({ t0: W(56, 'risiko', 1), t1: W(57, 'keterlambatan') - 0.1, x: 700, y: RANTAI_Y - 20, w: 520, cls: 'h1 ctr', html: 'Risiko', anim: 'zoom', fout: 0.3 });
teks({ t0: W(57, 'keterlambatan'), t1: LE(57) + 0.3, x: 700, y: RANTAI_Y, w: 520, cls: 'h3 ctr', html: 'Keterlambatan penyelesaian pekerjaan fisik', anim: 'zoom' });
teks({ t0: W(57, 'keterlambatan'), t1: LE(57) + 0.3, x: 700, y: RANTAI_Y - 50, w: 520, cls: 'label ctr', html: 'Risiko', anim: 'fade' });
svgItem({
  t0: W(56, 'karena'), t1: LE(57) + 0.3, fin: 0.1,
  isi: `<path class="a1" d="M 610 345 L 690 345 m -18 -16 l 18 16 l -18 16" stroke="#f2b45a" stroke-width="6" fill="none"/><path class="a2" d="M 1225 345 L 1300 345 m -18 -16 l 18 16 l -18 16" stroke="#e5484d" stroke-width="6" fill="none"/>`
    + `<text class="k1" x="650" y="320" text-anchor="middle" font-family="Playfair" font-style="italic" font-size="30" fill="#f2b45a">karena</text><text class="k2" x="1262" y="320" text-anchor="middle" font-family="Playfair" font-style="italic" font-size="30" fill="#e5484d">sehingga</text>`,
  gambar: (el, t) => {
    const a = P(t, W(56, 'karena'), 0.4), b = P(t, W(56, 'sehingga'), 0.4);
    el.querySelector('.a1').style.opacity = a; el.querySelector('.k1').style.opacity = a;
    el.querySelector('.a2').style.opacity = b; el.querySelector('.k2').style.opacity = b;
  },
});
teks({ t0: L(57), t1: LE(57) + 0.3, x: 200, y: 700, w: 1520, cls: 'serif-s ctr', html: '“Karena <em>anggaran tidak mencukupi</em>, mungkin terjadi <b>keterlambatan penyelesaian pekerjaan fisik</b>, sehingga <span class="merah">opini laporan keuangan turun</span>.”', anim: 'naik' });

tirai({ t0: L(58) - 0.2, t1: LE(58) + 0.2, bg: 'rgba(3,9,16,.55)' });
teks({ t0: W(58, 'internal'), t1: LE(58) + 0.3, x: X0, y: 150, w: 760, cls: 'h3', html: 'Internal · <span class="emas">7M-1E</span>', anim: 'kiri' });
teks({ t0: W(58, 'internal') + 0.4, t1: LE(58) + 0.3, x: X0, y: 240, w: 760, cls: 'body', html: 'Man · Machine · Method · Material · Money · Management · Measurement · Environment', anim: 'naik' });
teks({ t0: W(58, 'eksternal'), t1: LE(58) + 0.3, x: 1000, y: 150, w: 760, cls: 'h3', html: 'Eksternal · <span class="emas">PESTLE</span>', anim: 'kanan' });
teks({ t0: W(58, 'eksternal') + 0.4, t1: LE(58) + 0.3, x: 1000, y: 240, w: 760, cls: 'body', html: 'Political · Economic · Social · Technological · Legal · Environmental', anim: 'naik' });
teks({ t0: W(58, 'kontrolebel'), t1: LE(58) + 0.3, x: X0, y: 560, w: 760, cls: 'h2 emas', html: 'Controllable', anim: 'naik' });
teks({ t0: W(58, 'kontrolebel') + 0.2, t1: LE(58) + 0.3, x: X0, y: 670, w: 760, cls: 'body-s', html: 'masih dalam kendali', anim: 'naik' });
teks({ t0: W(58, 'ankontrolebel'), t1: LE(58) + 0.3, x: 1000, y: 560, w: 760, cls: 'h2 merah', html: 'Uncontrollable', anim: 'naik' });
teks({ t0: W(58, 'ankontrolebel') + 0.2, t1: LE(58) + 0.3, x: 1000, y: 670, w: 760, cls: 'body-s', html: 'di luar kendali', anim: 'naik' });

teks({ t0: L(59), t1: LE(59) + 0.3, x: X0, y: 200, w: 1000, cls: 'kicker', html: 'Diukur pada dua sumbu', anim: 'kiri' });
teks({ t0: W(59, 'dampak'), t1: LE(59) + 0.3, x: X0, y: 260, w: 900, cls: 'h1', html: 'Dampak <span class="emas">1–5</span>', anim: 'kiri' });
teks({ t0: W(59, 'kemungkinan'), t1: LE(59) + 0.3, x: X0, y: 400, w: 1200, cls: 'h1', html: 'Kemungkinan <span class="emas">1–5</span>', anim: 'kiri' });
teks({ t0: W(59, 'kriteria'), t1: LE(59) + 0.3, x: X0, y: 580, w: 900, cls: 'body', html: 'kriteria baku dari menu <b>Keterangan Pendukung</b> — supaya angka antar-OPD bisa dibandingkan', anim: 'naik' });

matriks({
  t0: L(60), t1: LE(66) + 0.3, x: 1010, y: 160, ukuran: 116,
  sorot: [
    { t: W(61, 'dampak', 1), dur: W(61, 'dampak', 2) - W(61, 'dampak', 1), d: 5, k: 1 },
    { t: W(61, 'dampak', 2), dur: 3.4, d: 1, k: 5 },
    { t: W(63, 'sangat', 1), dur: 0.9, lvl: (v) => v >= 20 },
    { t: W(63, 'tinggi', 2), dur: 0.9, lvl: (v) => v >= 16 && v < 20 },
    { t: W(63, 'sedang'), dur: 0.9, lvl: (v) => v >= 11 && v < 16 },
    { t: W(63, 'rendah', 1), dur: 0.9, lvl: (v) => v >= 6 && v < 11 },
    { t: W(63, 'sangat', 2), dur: 1.3, lvl: (v) => v < 6 },
    { t: L(66) + 0.3, dur: LE(66) - L(66) + 0.3, lvl: (v) => v >= 16 },
  ],
  selera: W(65, 'selera'),
});
teks({ t0: L(60), t1: LE(60) + 0.3, x: X0, y: 200, w: 800, cls: 'kicker', html: 'Matriks Analisis Risiko 5 × 5', anim: 'kiri' });
teks({ t0: W(60, 'perkalian') - 0.1, t1: LE(61) + 0.3, x: X0, y: 300, cls: 'stempel', html: 'Bukan perkalian', anim: 'stempel', rot: -5 });
teks({ t0: W(61, 'dua') - 0.2, t1: LE(62) + 0.3, x: X0, y: 500, w: 800, cls: 'h2', html: 'D5 × K1 = <span class="merah">20</span>', anim: 'kiri' });
teks({ t0: W(61, 'sembilan') - 0.2, t1: LE(62) + 0.3, x: X0, y: 610, w: 800, cls: 'h2', html: 'D1 × K5 = <span style="color:var(--r)">9</span>', anim: 'kiri' });
teks({ t0: W(62, 'bobot'), t1: LE(62) + 0.3, x: X0, y: 740, w: 780, cls: 'serif-s', html: 'Dampak diberi bobot lebih: kejadian langka yang berdampak besar tetap <em>serius</em>.', anim: 'naik' });
[['sangat', 1, 'Sangat Tinggi', '20–25', 'var(--st)'], ['tinggi', 2, 'Tinggi', '16–19', 'var(--t)'], ['sedang', 1, 'Sedang', '11–15', 'var(--s)'], ['rendah', 1, 'Rendah', '6–10', 'var(--r)'], ['sangat', 2, 'Sangat Rendah', '1–5', 'var(--sr)']].forEach(([k, n, nama, rentang, w], i) => {
  teks({ t0: W(63, k, n), t1: LE(63) + 0.4, x: X0, y: 220 + i * 92, w: 760, cls: 'h3', html: `<span style="display:inline-block;width:40px;height:40px;border-radius:8px;background:${w};vertical-align:-4px;margin-right:18px"></span>${nama} <span class="body-s">${rentang}</span>`, anim: 'kiri' });
});
teks({ t0: L(64), t1: LE(64) + 0.3, x: X0, y: 360, w: 760, cls: 'serif', html: 'Sampai mana yang masih boleh diterima?', anim: 'naik' });
teks({ t0: L(65), t1: LE(66) + 0.3, x: X0, y: 200, w: 760, cls: 'kicker', html: 'Ditetapkan Pemerintah Daerah', anim: 'kiri' });
teks({ t0: W(65, 'selera'), t1: LE(66) + 0.3, x: X0, y: 250, w: 760, cls: 'h1', html: 'Selera Risiko', anim: 'huruf' });
teks({ t0: W(65, 'sedang'), t1: LE(66) + 0.3, x: X0, y: 400, w: 780, cls: 'h3', html: 'diterima sampai dengan <span style="color:var(--s)">Sedang</span>', anim: 'naik' });
teks({ t0: W(66, 'wajib') - 0.1, t1: LE(66) + 0.3, x: X0, y: 600, cls: 'stempel', html: 'Wajib RTP', anim: 'stempel', rot: -5 });
teks({ t0: W(66, 'daftar'), t1: LE(66) + 0.3, x: X0, y: 780, w: 760, cls: 'body', html: '+ masuk <b>Daftar Risiko Prioritas</b>', anim: 'naik' });

// ════════════════ s8 · MENGENDALIKAN & MEMANTAU ════════════════════════════
kartuBab('s8', '07', 'Mengendalikan & memantau', 'Pelampung tiga, empat, dan lima', 'perahu_aceh');
tandaBab('s8', 'Babak 07 · <b>Mengendalikan & memantau</b>');
D(CD.s8.start, { langit: 'fajar', cloud: 0.3, cloudDark: 0, wind: 0.35, dim: 0.3, shipX: 980, shipS: 0.8, beam: 0, harbor: 0.6 });
D(L(68) - 0.3, { dim: 0.6 });
D(L(76) - 0.3, { langit: 'senja', dim: 0.35, shipX: 1200, shipS: 0.6, beam: 1 });
D(L(77) - 0.2, { dim: 0.6 });
D(L(78) - 0.3, { dim: 0.45 });
D(L(79) - 0.2, { dim: 0.65 });

teks({ t0: L(67), t1: LE(67) + 0.3, x: X0, y: 170, w: 900, cls: 'kicker', html: 'Pelampung 3', anim: 'kiri' });
teks({ t0: L(67) + 0.2, t1: LE(67) + 0.3, x: X0, y: 220, w: 1500, cls: 'h1', html: 'Kegiatan Pengendalian', anim: 'huruf' });
teks({ t0: W(67, 'mengatur'), t1: LE(67) + 0.3, x: X0, y: 400, w: 1200, cls: 'serif', html: 'Saatnya mengatur layar: <em>Rencana Tindak Pengendalian</em>', anim: 'naik' });

const AAMSA = [['A', 'Avoid', 'hindari kegiatan berisikonya', 'evoid'], ['A', 'Abate', 'tekan kemungkinannya', 'ebeit'], ['M', 'Mitigate', 'kurangi dampaknya', 'mitigeit'], ['S', 'Share', 'bagi lewat asuransi / kemitraan', 'syer'], ['A', 'Accept', 'terima sisanya — pilihan terakhir', 'eksept']];
teks({ t0: W(68, 'mudah'), t1: L(69) - 0.1, x: 0, y: 330, w: LW, cls: 'hero ctr emas', html: 'A · A · M · S · A', anim: 'huruf', fout: 0.3 });
AAMSA.forEach(([h, en, id, k], i) => {
  const x = 120 + i * 340;
  const t0 = i === 0 ? L(69) : W(69, k);
  const redup = i < 3;
  const kol = [
    teks({ t0: L(69) - 0.1, t1: LE(70) + 0.3, x, y: 170, w: 320, cls: 'hero ctr emas', html: h, anim: 'fade', fin: 0.3 }),
    teks({ t0, t1: LE(70) + 0.3, x, y: 400, w: 320, cls: 'h3 ctr', html: en, anim: 'naik' }),
    teks({ t0: t0 + 0.2, t1: LE(70) + 0.3, x: x + 10, y: 480, w: 300, cls: 'body-s ctr', html: id, anim: 'naik' }),
  ];
  if (redup) kol.forEach((it) => { const r = it.render; it.render = (t, a, b) => { r(t, a, b); it.el.style.opacity = +it.el.style.opacity * (1 - 0.8 * E.out(P(t, W(70, 'ankontrolebel'), 0.6))); }; });
});
teks({ t0: W(70, 'ankontrolebel'), t1: LE(70) + 0.3, x: 0, y: 700, w: LW, cls: 'h3 ctr', html: '<span class="merah">Uncontrollable</span> → hanya <span class="emas">Share</span> atau <span class="emas">Accept</span>', anim: 'naik' });

teks({ t0: L(71), t1: LE(71) + 0.3, x: X0, y: 200, w: 1300, cls: 'kicker', html: 'Penanggung Jawab Pengendalian', anim: 'kiri' });
teks({ t0: W(71, 'jabatan'), t1: LE(71) + 0.3, x: X0, y: 250, w: 1500, cls: 'h1', html: 'Jabatan yang berwenang', anim: 'huruf' });
teks({ t0: W(71, 'peraturan'), t1: LE(71) + 0.3, x: X0, y: 480, w: 800, cls: 'h3', html: 'Kontrol: Peraturan Bupati', anim: 'kiri' });
teks({ t0: W(71, 'seksi') - 0.2, t1: LE(71) + 0.3, x: 980, y: 480, w: 800, cls: 'h3 redup', html: '<span class="merah">✕</span> pejabat setingkat seksi', anim: 'kanan' });

teks({ t0: L(72), t1: LE(73) + 0.3, x: 0, y: 110, w: LW, cls: 'h1 ctr', html: '4 titik skor', anim: 'huruf' });
const BAR = [['Inheren', 'sebelum pengendalian', 17, 'inheren'], ['Residual', 'setelah pengendalian berjalan', 15, 'residual'], ['Target', 'yang ingin dicapai RTP', 12, 'target'], ['Aktual', 'hasil nyata di lapangan', 13, 'aktual']];
svgItem({
  t0: L(73) - 0.2, t1: LE(73) + 0.3, fin: 0.3,
  isi: `<line x1="300" y1="760" x2="1620" y2="760" stroke="rgba(244,241,234,.4)" stroke-width="3"/>` + BAR.map(([n, , v], i) => `<g class="br" data-i="${i}"><rect x="${360 + i * 320}" width="200" rx="10" fill="${['#ef4444', '#fb923c', '#fde047', '#4ade80'][i]}"/><text x="${460 + i * 320}" y="830" text-anchor="middle" font-family="Bebas" font-size="56" fill="#f4f1ea">${n}</text></g>`).join(''),
  gambar: (el, t) => el.querySelectorAll('.br').forEach((g) => {
    const i = +g.dataset.i;
    const p = E.out5(P(t, W(73, BAR[i][3]), 0.9));
    const h = BAR[i][2] * 22 * p;
    const r = g.querySelector('rect');
    r.setAttribute('y', 760 - h); r.setAttribute('height', h);
    g.style.opacity = P(t, W(73, BAR[i][3]), 0.2);
  }),
});
BAR.forEach(([, k, , w], i) => teks({ t0: W(73, w) + 0.3, t1: LE(73) + 0.3, x: 300 + i * 320, y: 870, w: 320, cls: 'body-s ctr', html: k, anim: 'naik' }));

teks({ t0: L(74), t1: LE(74) + 0.3, x: 0, y: 160, w: LW, cls: 'kicker ctr', html: 'Efektivitas pengendalian', anim: 'fade' });
[['tidak', 'Tidak Efektif', '#ef4444'], ['kurang', 'Kurang Efektif', '#fb923c'], ['cukup', 'Cukup Efektif', '#fde047'], ['dan', 'Efektif', '#4ade80']].forEach(([k, n, c], i) => {
  const t0 = W(74, k);
  garis({ t0, t1: LE(74) + 0.3, x: 180 + i * 400, y: 340, w: 380, tebal: 18, warna: c });
  teks({ t0: t0 + 0.1, t1: LE(74) + 0.3, x: 180 + i * 400, y: 380, w: 380, cls: 'h3 ctr', html: n, anim: 'naik' });
});
teks({ t0: W(74, 'celahnya'), t1: LE(74) + 0.3, x: 0, y: 560, w: LW, cls: 'serif ctr', html: 'Masih kurang? <em>Di mana celahnya?</em>', anim: 'naik' });
teks({ t0: W(74, 'lima'), t1: LE(74) + 0.3, x: 0, y: 670, w: LW, cls: 'h3 ctr emas', html: '5 kriteria baku Perdep', anim: 'zoom' });

teks({ t0: L(75), t1: LE(75) + 0.3, x: 0, y: 160, w: LW, cls: 'kicker ctr', html: 'Sebelum ditetapkan', anim: 'fade' });
[['Rancang', 0], ['Uji coba', 1], ['Perbaiki', 2], ['Tetapkan', 3]].forEach(([n, i]) => {
  teks({ t0: L(75) + 0.3 + i * 0.5, t1: LE(75) + 0.3, x: 120 + i * 430, y: 340, w: 400, cls: 'h2 ctr' + (i === 1 ? ' emas' : ''), html: n, anim: 'naik' });
});
teks({ t0: W(75, 'lingkup'), t1: LE(75) + 0.3, x: 550, y: 470, w: 400, cls: 'body-s ctr', html: 'dalam lingkup kecil', anim: 'naik' });
teks({ t0: W(75, 'form'), t1: LE(75) + 0.3, x: 0, y: 640, w: LW, cls: 'ctr', html: '<span class="cap" style="font-size:30px">Hasil uji coba dicatat di <b>Form 9</b></span>', anim: 'zoom' });

teks({ t0: L(76), t1: LE(76) + 0.3, x: X0, y: 170, w: 900, cls: 'kicker', html: 'Pelampung 4', anim: 'kiri' });
teks({ t0: L(76) + 0.2, t1: LE(76) + 0.3, x: X0, y: 220, w: 1500, cls: 'h1', html: 'Informasi & Komunikasi', anim: 'huruf' });
teks({ t0: W(76, 'hasilnya'), t1: LE(76) + 0.3, x: X0, y: 400, w: 1100, cls: 'serif', html: 'Hasilnya tidak boleh berhenti di dalam folder.', anim: 'naik' });
teks({ t0: W(77, 'empat') - 0.1, t1: LE(77) + 0.3, x: X0, y: 160, w: 500, cls: 'hero emas', html: '<span style="font-size:300px">14</span>', anim: 'zoom' });
teks({ t0: W(77, 'dokumen'), t1: LE(77) + 0.3, x: X0, y: 450, w: 520, cls: 'h3', html: 'dokumen resmi<br>siap tanda tangan', anim: 'kiri' });
teks({ t0: W(77, 'bagan'), t1: LE(77) + 0.3, x: X0, y: 630, w: 500, cls: 'body', html: '+ bagan struktur pengelolaan risiko', anim: 'naik' });
laptop({ src: 'cetak-laporan', t0: L(77) - 0.1, t1: LE(77) + 0.3, x: 720, y: 180, w: 1120, tilt: [8, -14, 3, -6] });

teks({ t0: L(78), t1: LE(78) + 0.3, x: X0, y: 170, w: 900, cls: 'kicker', html: 'Pelampung 5', anim: 'kiri' });
teks({ t0: L(78) + 0.2, t1: LE(78) + 0.3, x: X0, y: 220, w: 1500, cls: 'h1', html: 'Pemantauan', anim: 'huruf' });
teks({ t0: W(78, 'memastikan'), t1: LE(78) + 0.3, x: X0, y: 400, w: 1100, cls: 'serif', html: 'Memastikan rencana <em>benar-benar dijalankan</em>.', anim: 'naik' });
barisan([
  [W(79, 'form', 1), '<span class="emas">Form 8</span><br><span class="body-s">rencana pemantauan</span>'],
  [W(79, 'form', 2), '<span class="emas">Form 9</span><br><span class="body-s">realisasi + Skala Aktual</span>'],
  [W(79, 'form', 3), '<span class="emas">Form 10</span><br><span class="body-s">kejadian risiko yang terjadi</span>'],
], { t1: LE(79) + 0.3, x: X0, y: 200, jarak: 170, w: 520, cls: 'h2' });
laptop({ src: 'monev-89', t0: L(79) + 0.2, t1: LE(79) + 0.3, x: 720, y: 180, w: 1120, tilt: [8, -14, 3, -6] });
laptop({ src: 'lapor', t0: L(80) - 0.2, t1: LE(80) + 0.3, x: 720, y: 180, w: 1120, tilt: [8, -14, 3, -6] });
svgItem({
  t0: W(80, 'memindai') - 0.3, t1: LE(80) + 0.3, x: X0, y: 260, w: 340, h: 340, fin: 0.6,
  isi: `<rect width="340" height="340" rx="22" fill="#f4f1ea"/>` + (() => { let s = ''; for (let r = 0; r < 21; r++) for (let c = 0; c < 21; c++) { const finder = (r < 7 && c < 7) || (r < 7 && c > 13) || (r > 13 && c < 7); const on = finder ? (r % 6 === 0 || c % 6 === 0 || (r % 6 >= 2 && r % 6 <= 4 && c % 6 >= 2 && c % 6 <= 4) || (c > 13 && ((c - 14) % 6 === 0 || (r % 6 >= 2 && r % 6 <= 4 && (c - 14) >= 2 && (c - 14) <= 4))) || (r > 13 && ((r - 14) % 6 === 0))) : hash(r * 31 + c * 7) > 0.52; if (on) s += `<rect x="${20 + c * 14.3}" y="${20 + r * 14.3}" width="14.3" height="14.3" fill="#0b1520"/>`; } return s; })(),
  gambar: (el, t, pin) => { el.style.transform = `scale(${0.8 + 0.2 * E.back(pin)})`; },
});
teks({ t0: W(80, 'memindai'), t1: LE(80) + 0.3, x: X0, y: 640, w: 560, cls: 'h3', html: 'Pindai QR<br><span class="body-s">tanpa perlu akun sendiri</span>', anim: 'naik' });
const LAP = [['11', 'Pelaksanaan penilaian risiko'], ['12', 'Laporan berkala UPR'], ['13', 'Pemantauan Unit Kepatuhan'], ['14', 'Pembinaan Komite Pengelolaan Risiko']];
teks({ t0: L(81), t1: LE(81) + 0.4, x: 0, y: 120, w: LW, cls: 'h2 ctr', html: 'Empat laporan wajib', anim: 'huruf' });
LAP.forEach(([n, j], i) => {
  const t0 = W(81, 'form', i + 1);
  svgItem({
    t0, t1: LE(81) + 0.4, x: 170 + i * 410, y: 290, w: 340, h: 440, fin: 0.7,
    isi: `<rect x="6" y="6" width="328" height="428" rx="10" fill="#f3ead6"/><text x="30" y="110" font-family="Bebas" font-size="96" fill="#2a2118">FORM ${n}</text><rect x="30" y="150" width="260" height="10" fill="#c9bea6"/><rect x="30" y="178" width="220" height="10" fill="#d8cfba"/><rect x="30" y="206" width="240" height="10" fill="#d8cfba"/><rect x="30" y="234" width="180" height="10" fill="#d8cfba"/>`,
    gambar: (el, t, pin) => { el.style.transform = `translateY(${(1 - E.out5(pin)) * 120}px) rotate(${(i - 1.5) * 2.5}deg)`; },
  });
  teks({ t0: t0 + 0.2, t1: LE(81) + 0.4, x: 185 + i * 410, y: 560, w: 310, cls: 'body kertas-t', html: j, anim: 'naik' });
});

// ════════════════ s9 · SATU RISIKO ═════════════════════════════════════════
kartuBab('s9', '08', 'Satu risiko, satu perjalanan', 'Dari satu kegiatan sampai ke Dashboard', 'ikan_banda_aceh');
tandaBab('s9', 'Babak 08 · <b>Satu risiko, satu perjalanan</b>');
D(CD.s9.start, { langit: 'senja', dim: 0.5, beam: 0, harbor: 0.5, shipX: 1400, shipS: 0.5 });
D(L(90) - 0.4, { langit: 'malam', dim: 0.15, shipX: 960, shipS: 0.95, camZ: 1.12, stars: 1 });
D(L(91) - 0.2, { dim: 0.7, camZ: 1.0 });

foto({ src: 'tpi_kapal', t0: L(82) - 0.3, t1: LE(85) + 0.3, kb: [0, 0, 1.12, -30, 10, 1.0], gelap: 0.35 });
teks({ t0: L(82), t1: LE(82) + 0.3, x: 0, y: 380, w: LW, cls: 'h1 ctr', html: 'Ikuti satu risiko', anim: 'huruf' });
teks({ t0: W(82, 'awal'), t1: LE(82) + 0.3, x: 0, y: 540, w: LW, cls: 'serif ctr', html: 'dari awal sampai akhir', anim: 'naik' });
tirai({ t0: L(83) - 0.2, t1: LE(85) + 0.3, bg: 'linear-gradient(0deg, rgba(3,9,16,.92) 0%, rgba(3,9,16,.6) 45%, rgba(3,9,16,.2) 80%)' });
teks({ t0: L(83), t1: LE(83) + 0.3, x: X0, y: 650, w: 1300, cls: 'kicker', html: 'Dinas Kelautan dan Perikanan', anim: 'kiri' });
teks({ t0: L(83) + 0.3, t1: LE(83) + 0.3, x: X0, y: 700, w: 1500, cls: 'h2', html: 'Membangun tempat pendaratan ikan', anim: 'naik' });
teks({ t0: L(83), t1: LE(85) + 0.3, x: 0, y: 1010, w: LW - 60, cls: 'label kanan', html: 'foto ilustrasi', anim: 'fade' });
rantai(LE(84) + 0.3, 'Lokasi belum tuntas dibebaskan', 'Keterlambatan pekerjaan fisik', 'Target produksi perikanan tidak tercapai', [W(84, 'lokasi'), W(84, 'keterlambatan'), W(84, 'target')]);
ITEMS.slice(-3).forEach((it) => (it.el.style.top = '560px'));
[['karena', 360, 'Penyebab', 'emas'], ['mungkin', 960, 'Risiko', ''], ['sehingga', 1570, 'Dampak', 'merah']].forEach(([k, x, n, c]) => teks({ t0: W(84, k), t1: LE(84) + 0.3, x: x - 200, y: 500, w: 400, cls: 'label ctr ' + c, html: n, anim: 'fade' }));
teks({ t0: W(85, 'eksternal'), t1: LE(85) + 0.3, x: X0, y: 640, w: 700, cls: 'h2', html: 'Eksternal · <span class="emas">Legal</span>', anim: 'kiri' });
teks({ t0: W(85, 'ankontrolebel'), t1: LE(85) + 0.3, x: 900, y: 640, w: 900, cls: 'h2 merah', html: 'Uncontrollable', anim: 'kanan' });
teks({ t0: W(85, 'pembebasan'), t1: LE(85) + 0.3, x: 900, y: 760, w: 900, cls: 'body-s', html: 'pembebasan lahan bukan kewenangan dinas', anim: 'naik' });

matriks({
  t0: L(86) - 0.1, t1: LE(88) + 0.3, x: 1080, y: 190, ukuran: 100,
  sorot: [{ t: W(86, 'tujuh'), dur: 3.5, d: 4, k: 3 }],
  selera: L(86) + 0.4,
  penanda: [{ t: W(86, 'tujuh'), d: 4, k: 3 }, { t: W(88, 'tiga'), d: 4, k: 2 }, { t: W(88, 'empat'), d: 3, k: 3 }],
});
teks({ t0: W(86, 'dampak'), t1: LE(86) + 0.3, x: X0, y: 220, w: 800, cls: 'h2', html: 'Dampak <span class="emas">4</span> · Kemungkinan <span class="emas">3</span>', anim: 'kiri' });
teks({ t0: W(86, 'tujuh') - 0.1, t1: LE(86) + 0.3, x: X0, y: 330, w: 800, cls: 'hero', html: '<span style="color:var(--t)">17</span>', anim: 'zoom' });
teks({ t0: W(86, 'tinggi') - 0.1, t1: LE(86) + 0.3, x: X0 + 300, y: 380, cls: 'stempel', html: '<span style="color:var(--t)">Tinggi</span>', anim: 'stempel', rot: -5 });
teks({ t0: W(86, 'melampaui'), t1: LE(86) + 0.3, x: X0, y: 600, w: 760, cls: 'serif-s', html: 'melampaui Selera Risiko → wajib RTP', anim: 'naik' });
teks({ t0: L(87), t1: LE(87) + 0.3, x: X0, y: 200, w: 800, cls: 'kicker', html: 'Respons', anim: 'kiri' });
teks({ t0: W(87, 'syer'), t1: LE(87) + 0.3, x: X0, y: 250, w: 800, cls: 'hero emas', html: 'Share', anim: 'huruf' });
teks({ t0: W(87, 'koordinasi'), t1: LE(87) + 0.3, x: X0, y: 480, w: 800, cls: 'body', html: 'koordinasi resmi dengan panitia pengadaan tanah, dituangkan dalam <b>perjanjian kerja sama</b>', anim: 'naik' });
teks({ t0: W(87, 'penanggung'), t1: LE(87) + 0.3, x: X0, y: 680, w: 800, cls: 'cap', html: 'PJ Pengendalian: <b>Sekretaris Dinas</b>', anim: 'zoom' });
[['Inheren', '17', 'var(--t)', W(88, 'skala') - 0.3], ['Target', '13', 'var(--s)', W(88, 'tiga')], ['Aktual', '14', 'var(--s)', W(88, 'empat')]].forEach(([n, v, c, t0], i) => {
  teks({ t0, t1: LE(89) + 0.3, x: X0 + i * 290, y: 260, w: 260, cls: 'label', html: n, anim: 'naik' });
  teks({ t0: t0 + 0.1, t1: LE(89) + 0.3, x: X0 + i * 290, y: 300, w: 260, cls: 'hero', html: `<span style="color:${c};font-size:190px">${v}</span>`, anim: 'zoom' });
});
teks({ t0: W(88, 'sedang'), t1: LE(88) + 0.3, x: X0, y: 520, w: 800, cls: 'body', html: 'target turun ke <span style="color:var(--s)"><b>Sedang</b></span> — di dalam selera', anim: 'naik' });
teks({ t0: L(89), t1: LE(89) + 0.3, x: X0, y: 560, w: 1600, cls: 'serif', html: 'Selisih satu angka bukan kegagalan.<br><em>Itulah informasi yang dicari: rencananya hampir tepat.</em>', anim: 'naik' });

teks({ t0: W(90, 'anjungan'), t1: LE(90) + 0.3, x: 0, y: 150, w: LW, cls: 'serif ctr', html: 'Dari satu baris… ke anjungan kapal.', anim: 'naik' });
teks({ t0: W(90, 'desbor'), t1: LE(90) + 0.3, x: 0, y: 260, w: LW, cls: 'h1 ctr', html: 'Dashboard MR Kabar', anim: 'huruf' });
laptop({ src: 'dashboard-peta', t0: L(91) - 0.2, t1: W(91, 'siklus') - 0.2, x: 360, y: 130, w: 1200, tilt: [6, 0, 2, 0], push: [0.98, 1.05], fout: 0.4 });
laptop({ src: 'dashboard-siklus', t0: W(91, 'siklus') - 0.1, t1: W(91, 'ranking') - 0.2, x: 360, y: 130, w: 1200, tilt: [4, 0, 2, 0], push: [1.0, 1.04], fin: 0.5, fout: 0.4 });
laptop({ src: 'dashboard-ranking', t0: W(91, 'ranking') - 0.1, t1: LE(91) + 0.5, x: 360, y: 130, w: 1200, tilt: [4, 0, 2, 0], push: [1.0, 1.05], fin: 0.5, kursor: [[W(91, 'ranking') + 0.3, 1500, 700], [W(91, 'diklik') - 0.4, 420, 175], [W(91, 'diklik') + 0.6, 420, 175]], fokus: [{ t: W(91, 'ranking') + 0.2, d: 2.6, x: 272, y: 92, w: 808, h: 520 }, { t: W(91, 'kepatuhan'), d: 3, x: 272, y: 638, w: 808, h: 440 }] });
[['peta', 'Peta risiko + garis selera'], ['daftar', 'Daftar Risiko Prioritas'], ['siklus', 'Siklus empat skor'], ['ranking', 'Ranking eksposur antar-OPD'], ['kepatuhan', 'Kepatuhan pelaporan']].forEach(([k, h], i) => {
  teks({ t0: W(91, k), t1: LE(91) + 0.4, x: 60 + i * 370, y: 930, w: 360, cls: 'h4 ctr', html: h, anim: 'naik' });
});

// ════════════════ s10 · PENUTUP ════════════════════════════════════════════
kartuBab('s10', 'Penutup', 'Tiga pelajaran', 'Apa yang kita bawa pulang', 'pelangi_meulaboh');
tandaBab('s10', 'Penutup · <b>Tiga pelajaran</b>', LE(100));
D(CD.s10.start, { lh: 0, langit: 'fajar', dim: 0.3, cloud: 0.3, wind: 0.25, shipX: 900, shipS: 0.7, harbor: 1, beam: 0, camZ: 1.0 });
D(L(96) - 0.4, { dim: 0.5 });
D(L(98) - 0.4, { dim: 0.7 });

teks({ t0: W(92, 'apa'), t1: LE(92) + 0.3, x: 0, y: 380, w: LW, cls: 'h1 ctr', html: 'Apa pelajarannya?', anim: 'huruf' });
const PELAJARAN = [
  [93, 'nelayan_laweueng', 'Risiko bukan untuk ditakuti,<br>tapi untuk <em>dikenali</em>.', 'Yang paling berbahaya adalah risiko yang tidak pernah ditulis.'],
  [94, 'tarik_pukat', 'Pengendalian bukan dokumen,<br>tapi <em>tindakan</em>.', 'Dirancang · diuji · dipantau · diperbaiki.'],
  [95, 'jembatan_meulaboh', 'Satu alur data,<br>janji RPJMD <em>ditepati</em>.', 'Dari Visi kabupaten sampai satu baris risiko.'],
];
PELAJARAN.forEach(([id, src, judul, sub], i) => {
  foto({ src, mode: 'kiri', w: 1000, t0: L(id) - 0.4, t1: LE(id) + 0.5, kb: [20, 0, 1.12, -20, 0, 1.02] });
  tirai({ t0: L(id) - 0.4, t1: LE(id) + 0.5, bg: 'linear-gradient(270deg, rgba(6,18,31,.97) 0%, rgba(6,18,31,.9) 42%, rgba(6,18,31,0) 62%)' });
  teks({ t0: L(id) - 0.1, t1: LE(id) + 0.5, x: 1060, y: 170, w: 700, cls: 'kicker', html: 'Pelajaran', anim: 'kiri' });
  teks({ t0: L(id), t1: LE(id) + 0.5, x: 1050, y: 210, w: 700, cls: 'hero emas', html: '0' + (i + 1), anim: 'huruf' });
  teks({ t0: L(id) + 0.6, t1: LE(id) + 0.5, x: 1060, y: 470, w: 780, cls: 'h3', html: judul, anim: 'naik' });
  teks({ t0: L(id) + 2.2, t1: LE(id) + 0.5, x: 1060, y: 650, w: 760, cls: 'serif-s', html: sub, anim: 'naik' });
});

teks({ t0: L(96), t1: LE(97) + 0.4, x: X0, y: 170, w: 900, cls: 'kicker', html: 'Langkah pertama Anda', anim: 'kiri' });
barisan([
  [W(96, 'data'), '<span class="mono emas" style="font-size:34px">1</span>&nbsp; Lengkapi Data Umum'],
  [W(97, 'ce-e-e'), '<span class="mono emas" style="font-size:34px">2</span>&nbsp; Isi CEE'],
  [W(97, 'ka-er-es'), '<span class="mono emas" style="font-size:34px">3</span>&nbsp; Susun konteks di KRS'],
  [W(97, 'catat'), '<span class="mono emas" style="font-size:34px">4</span>&nbsp; Catat risiko pertama'],
], { t1: LE(97) + 0.4, x: X0, y: 260, jarak: 120, w: 1200, cls: 'h2' });
teks({ t0: W(97, 'panduan'), t1: LE(97) + 0.4, x: X0, y: 790, w: 1300, cls: 'serif-s', html: 'Panduan lengkap setiap langkah: menu <em>Panduan</em>.', anim: 'naik' });

svgItem({
  t0: L(98), t1: LE(98) + 0.4, x: 810, y: 150, w: 300, h: 225, fin: 1.0,
  isi: `<image href="img/emblem.png" x="0" y="0" width="300" height="225"/>`,
});
teks({ t0: L(98) + 0.4, t1: LE(98) + 0.4, x: 0, y: 420, w: LW, cls: 'h3 ctr', html: 'Inspektorat Kabupaten Aceh Barat', anim: 'naik' });
teks({ t0: W(98, 'mengacu'), t1: LE(98) + 0.4, x: 0, y: 520, w: LW, cls: 'serif-s ctr redup', html: 'Bahan sosialisasi manajemen risiko · mengacu Perdep PPKD No. 4 Tahun 2019', anim: 'naik' });

foto({ src: 'pelangi_meulaboh', t0: L(99) - 0.6, t1: LE(100) + 1.2, kb: [0, 20, 1.14, 0, -10, 1.02], fin: 1.4 });
tirai({ t0: L(99) - 0.4, t1: LE(100) + 1.2, bg: 'linear-gradient(0deg, rgba(3,9,16,.85) 0%, rgba(3,9,16,.25) 55%, rgba(3,9,16,0) 80%)' });
teks({ t0: L(99), t1: LE(99) + 0.3, x: 0, y: 640, w: LW, cls: 'serif ctr', html: 'Laut memang tidak pernah benar-benar tenang.', anim: 'naik' });
teks({ t0: W(99, 'tapi'), t1: LE(99) + 0.3, x: 0, y: 730, w: LW, cls: 'serif ctr emas', html: 'Tapi kapal yang membaca petanya, selalu pulang.', anim: 'naik' });
svgItem({
  t0: L(100) - 0.2, t1: LE(100) + 1.2, x: 830, y: 260, w: 260, h: 242, fin: 1.0,
  isi: `<rect x="0" y="0" width="260" height="242" rx="34" fill="#f4f1ea"/><image href="img/mrkabar.png" x="20" y="16" width="220" height="210"/>`,
});
bunyi(W(100, 'kabar') - 0.3, 'boom', 0.8);
teks({ t0: W(100, 'kabar') - 0.3, t1: LE(100) + 1.2, x: 0, y: 540, w: LW, cls: 'hero ctr', html: 'MR KABAR', anim: 'huruf' });
teks({ t0: W(100, 'risiko'), t1: LE(100) + 1.2, x: 0, y: 760, w: LW, cls: 'serif ctr emas', html: 'Risiko TerKabar, Daerah Terjaga', anim: 'naik' });

// kredit bergulir
D(LE(100) + 1.0, { lh: 1, langit: 'malam', dim: 0.55, beam: 1, shipX: 1300, shipS: 0.5, harbor: 0.6 });
const FOTO_DIPAKAI = ['senja_meulaboh', 'nelayan_aceh', 'tarik_pukat', 'badai_laut', 'pantai_meulaboh', 'lampulo', 'mercusuar_breueh', 'peta_sumatra_barat', 'peta_aceh', 'perahu_aceh', 'ikan_banda_aceh', 'tpi_kapal', 'nelayan_laweueng', 'jembatan_meulaboh', 'pelangi_meulaboh'];
const kreditFoto = FOTO_DIPAKAI.map((k) => KREDIT[k]).filter(Boolean).map((k) => `<p>${k.judul.replace(/\.(jpe?g|png)$/i, '')}<br><small>${k.pembuat} · ${k.lisensi} · Wikimedia Commons</small></p>`).join('');
// hak cipta (dibacakan pada kalimat 101)
teks({ t0: L(101) - 0.3, t1: LE(101) + 1.0, x: 0, y: 330, w: LW, cls: 'h3 ctr emas', html: 'Copyright © 2026', anim: 'naik' });
teks({ t0: W(101, 'sistem'), t1: LE(101) + 1.0, x: 0, y: 430, w: LW, cls: 'label ctr', html: 'System Architecture &amp; Development by', anim: 'fade' });
teks({ t0: W(101, 'nurhikmat') - 0.1, t1: LE(101) + 1.0, x: 0, y: 480, w: LW, cls: 'h1 ctr', html: 'Nurhikmat Muhammad', anim: 'huruf' });
teks({ t0: W(101, 'inspektorat'), t1: LE(101) + 1.0, x: 0, y: 640, w: LW, cls: 'serif ctr', html: 'Inspektorat Aceh Barat', anim: 'naik' });
garis({ t0: W(101, 'nurhikmat') + 0.4, t1: LE(101) + 1.0, x: 760, y: 615, w: 400, tebal: 5 });

kreditGulir({
  t0: LE(101) + 1.5, t1: TL.total_duration - 0.4,
  html: `<div class="h2" style="margin-bottom:10px">MR Kabar</div><div class="serif-s emas">Berlayar dengan Peta Risiko</div>
  <h5>Disusun oleh</h5><p>Inspektorat Kabupaten Aceh Barat</p>
  <h5>System Architecture &amp; Development</h5><p>Nurhikmat Muhammad, Inspektorat Aceh Barat<br><small>Copyright © 2026</small></p>
  <h5>Rujukan</h5><p>PP No. 60 Tahun 2008 tentang SPIP</p><p>Perdep PPKD BPKP No. 4 Tahun 2019</p>
  <h5>Narasi</h5><p>Suara sintetis Ardi & Gadis</p>
  <h5>Musik</h5><p>Komposisi orisinal</p>
  <h5>Foto</h5>${kreditFoto}
  <h5>Huruf</h5><p>Bebas Neue · Plus Jakarta Sans · Playfair Display · JetBrains Mono<br><small>SIL Open Font License</small></p>
  <h5>Tangkapan layar</h5><p>Aplikasi MR Kabar · data penilaian 2025</p>`,
});

siapDunia();
window.setVideoTime(0);
