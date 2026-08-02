/**
 * Pengintip ISI FORMULIR — lebih dalam daripada intip.cjs.
 *
 * intip.cjs hanya mencetak elemen yang sedang terlihat. Formulir risiko jauh
 * lebih panjang daripada layar dan sebagian bagiannya baru muncul setelah
 * digulir atau dibuka, jadi di sini saringan "sedang terlihat" DILEPAS dan
 * yang dicetak adalah garis besar dialog menurut urutan DOM: judul bagian,
 * label, dan tiap kendali berikut cara menyentuhnya.
 *
 *   node intip_form.cjs /irs_pd
 */
const puppeteer = require('puppeteer');

const ASAL = process.env.MRKABAR_URL || 'https://mrkabar.test';
const kredensial = require('./sandi.cjs');
// Akun bisa diganti lewat AKUN_PEREKAM, mis. saat memetakan halaman yang
// hanya terlihat oleh akun pelapor atau akun hanya-baca.
const AKUN = kredensial(process.env.AKUN_PEREKAM || 'PIC_INSPEKTORAT');

const GARIS_BESAR = () => {
  // Dialog terakhir yang terbuka — kalau ada dialog di atas dialog (pemilih
  // skala di atas formulir risiko), yang dipetakan yang paling atas.
  const semua = [...document.querySelectorAll('[role="dialog"]')];
  const dlg = semua[semua.length - 1] || document.body;
  const keluar = [];
  const jalan = (el, dalam) => {
    for (const anak of el.children) {
      const tag = anak.tagName.toLowerCase();
      const teksLangsung = [...anak.childNodes]
        .filter((n) => n.nodeType === 3)
        .map((n) => n.textContent.trim())
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();

      if (/^h[1-6]$/.test(tag) || anak.getAttribute('role') === 'heading') {
        keluar.push({ jenis: 'judul', dalam, teks: anak.textContent.trim().slice(0, 90) });
      } else if (tag === 'label' && teksLangsung) {
        keluar.push({ jenis: 'label', dalam, teks: teksLangsung.slice(0, 90) });
      } else if (['input', 'textarea', 'select'].includes(tag)) {
        keluar.push({
          jenis: 'kendali',
          dalam,
          tag,
          tipe: anak.type || '',
          id: anak.id || '',
          nama: anak.name || '',
          ph: anak.placeholder || '',
          aria: anak.getAttribute('aria-label') || '',
          nilai: (anak.value || '').slice(0, 40),
          tampak: anak.offsetParent !== null,
        });
      } else if (tag === 'button' || anak.getAttribute('role') === 'combobox') {
        const t = anak.textContent.trim().replace(/\s+/g, ' ');
        if (t) {
          keluar.push({
            jenis: 'tombol', dalam, teks: t.slice(0, 60),
            peran: anak.getAttribute('role') || '', id: anak.id || '',
          });
        }
      } else if (teksLangsung && teksLangsung.length > 2) {
        keluar.push({ jenis: 'teks', dalam, teks: teksLangsung.slice(0, 90) });
      }
      if (anak.children.length) jalan(anak, dalam + 1);
    }
  };
  jalan(dlg, 0);
  return keluar;
};

(async () => {
  const url = process.argv[2];
  if (!url) { console.log('pakai: node intip_form.cjs /irs_pd'); process.exit(1); }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--ignore-certificate-errors'],
    defaultViewport: { width: 1920, height: 1400 },
  });
  const page = await browser.newPage();

  await page.goto(`${ASAL}/login`, { waitUntil: 'networkidle2' });
  await page.waitForSelector('#username');
  await page.type('#username', AKUN.user, { delay: 8 });
  await page.type('#password', AKUN.sandi, { delay: 8 });
  await page.click('button[type="submit"]');
  await new Promise((r) => setTimeout(r, 2800));

  await page.goto(ASAL + url, { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1200));

  // process.env tidak ada DI DALAM halaman — nilainya harus dikirim sebagai
  // argumen, bukan dibaca di sana.
  const polaBuka = process.env.TOMBOL_BUKA || 'tambah';
  const dibuka = await page.evaluate((pola) => {
    const b = [...document.querySelectorAll('button,a')]
      .find((e) => new RegExp(pola, 'i').test(e.textContent || ''));
    if (b) { b.click(); return b.textContent.trim(); }
    return null;
  }, polaBuka);
  if (!dibuka) { console.log('tidak ada tombol tambah di', url); await browser.close(); return; }
  await new Promise((r) => setTimeout(r, 1600));

  // Argumen ketiga dan seterusnya: tombol yang ditekan berurutan sesudah
  // formulir terbuka, supaya bagian yang baru muncul belakangan ikut terpetakan
  // (mis. "Ya" lalu "Isi Nilai Risiko" yang membuka dialog skala).
  for (const teksTombol of process.argv.slice(3)) {
    const kena = await page.evaluate((t) => {
      // Cocok PERSIS lebih dulu. Pernah keliru: mencari "Ya" dengan pencocokan
      // sebagian justru mengenai tombol "Entitas PD yang Menilai" karena kata
      // "yang" mengandung "ya".
      const semua = [...document.querySelectorAll('[role="dialog"] button')]
        .filter((e) => e.offsetParent !== null);
      const bersih = (e) => e.textContent.trim().replace(/\s+/g, ' ');
      const b = semua.find((e) => bersih(e).toLowerCase() === t.toLowerCase())
        || semua.find((e) => bersih(e).toLowerCase().startsWith(t.toLowerCase()));
      if (b) { b.click(); return bersih(b); }
      return null;
    }, teksTombol);
    console.log(`>>> klik "${teksTombol}" -> ${kena ?? 'TIDAK KETEMU'}`);
    await new Promise((r) => setTimeout(r, 1400));
  }

  console.log(`### ${url} — sesudah klik "${dibuka}"\n`);
  for (const b of await page.evaluate(GARIS_BESAR)) {
    const sp = '  '.repeat(Math.min(b.dalam, 8));
    if (b.jenis === 'judul') console.log(`${sp}## ${b.teks}`);
    else if (b.jenis === 'label') console.log(`${sp}LABEL  ${b.teks}`);
    else if (b.jenis === 'teks') console.log(`${sp}       ${b.teks}`);
    else if (b.jenis === 'tombol') console.log(`${sp}[TOMBOL${b.peran ? ':' + b.peran : ''}] ${b.teks}${b.id ? '  #' + b.id : ''}`);
    else {
      console.log(`${sp}<${b.tag}${b.tipe ? ' ' + b.tipe : ''}>`
        + (b.id ? `  id="${b.id}"` : '')
        + (b.nama ? `  name="${b.nama}"` : '')
        + (b.ph ? `  ph="${b.ph}"` : '')
        + (b.aria ? `  aria="${b.aria}"` : '')
        + (b.nilai ? `  nilai="${b.nilai}"` : '')
        + (b.tampak ? '' : '  [tersembunyi]'));
    }
  }

  await browser.close();
})();
