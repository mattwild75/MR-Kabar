/**
 * Gerak manusiawi: kursor, ketikan, gulir.
 *
 * Semua yang membuat rekaman terasa dikerjakan orang, bukan mesin, ada di
 * berkas ini. Tiga hal yang paling menentukan:
 *
 *  1. Kursor tidak pernah bergerak lurus. Lintasannya kurva Bezier dengan
 *     titik kendali yang melenceng tegak lurus, dipercepat di tengah dan
 *     diperlambat di ujung, plus getaran kecil beberapa piksel.
 *  2. Untuk jarak jauh kursor SEDIKIT MELEWATI sasaran lalu dikoreksi balik —
 *     inilah yang paling membedakan tangan manusia dari animasi.
 *  3. Jeda antar huruf berubah-ubah, lebih lama sesudah tanda baca dan spasi,
 *     dan sesekali ada salah ketik yang langsung dihapus.
 *
 * Acaknya BERBIBIT TETAP supaya dua kali menjalankan menghasilkan gerak yang
 * sama persis. Kalau satu bagian harus direkam ulang, hasilnya menyambung.
 */

/** Acak berbibit (mulberry32) — deterministik, cukup baik untuk gerak. */
function pembuatAcak(bibit) {
  let a = bibit >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const tidur = (ms) => new Promise((r) => setTimeout(r, ms));

class Tangan {
  /**
   * @param {import('puppeteer').Page} page
   * @param {number} bibit bibit acak; sama = gerak sama
   */
  constructor(page, bibit = 20260802) {
    this.page = page;
    this.acak = pembuatAcak(bibit);
    this.x = 960;
    this.y = 620;
    this.fps = 60;
  }

  /** Acak dalam rentang. */
  _r(a, b) { return a + this.acak() * (b - a); }

  /** Gambar kursor mengikuti tetikus sungguhan. */
  async _taruh(x, y) {
    this.x = x; this.y = y;
    await this.page.mouse.move(x, y);
    // Saat halaman sedang di-zoom, koordinat halaman dan koordinat layar
    // tidak lagi sama. Tetikus sungguhan tetap memakai koordinat layar (yang
    // di sini), sedangkan kursor gambar harus ditaruh di tempat yang sama.
    await this.page.evaluate((a, b) => window.__kursorKe && window.__kursorKe(a, b), x, y);
  }

  /**
   * Pindahkan kursor ke (x, y) menyusuri kurva.
   * @param {boolean} lewati kalau benar, sengaja melewati sasaran lalu balik
   */
  async ke(x, y, { lewati = null } = {}) {
    const x0 = this.x, y0 = this.y;
    const jarak = Math.hypot(x - x0, y - y0);
    if (jarak < 2) return;

    // Jarak jauh dikerjakan dua tahap: melewati sedikit, lalu dikoreksi.
    const pakaiLewat = lewati === null ? jarak > 420 && this.acak() < 0.65 : lewati;
    if (pakaiLewat) {
      const l = this._r(0.03, 0.075);
      const sudut = Math.atan2(y - y0, x - x0) + this._r(-0.25, 0.25);
      await this._lengkung(x + Math.cos(sudut) * jarak * l, y + Math.sin(sudut) * jarak * l, jarak);
      await tidur(this._r(35, 90));
      await this._lengkung(x, y, Math.hypot(x - this.x, y - this.y), 0.35);
      return;
    }
    await this._lengkung(x, y, jarak);
  }

  async _lengkung(x, y, jarak, lengkungan = 1) {
    const x0 = this.x, y0 = this.y;
    // Lama gerak mengikuti jarak, mirip hukum Fitts: dekat cepat, jauh tidak
    // sebanding jauhnya.
    const ms = Math.min(1150, 190 + Math.pow(jarak, 0.78) * 5.2) * this._r(0.88, 1.14);
    const bingkai = Math.max(4, Math.round((ms / 1000) * this.fps));

    // Titik kendali dilempar tegak lurus lintasan supaya jalannya melengkung.
    const nx = -(y - y0) / (jarak || 1), ny = (x - x0) / (jarak || 1);
    const simpang = this._r(-0.16, 0.16) * jarak * lengkungan;
    const c1x = x0 + (x - x0) * 0.34 + nx * simpang;
    const c1y = y0 + (y - y0) * 0.34 + ny * simpang;
    const c2x = x0 + (x - x0) * 0.68 + nx * simpang * 0.55;
    const c2y = y0 + (y - y0) * 0.68 + ny * simpang * 0.55;

    for (let i = 1; i <= bingkai; i++) {
      const p = i / bingkai;
      // Perlambatan di kedua ujung.
      const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      const u = 1 - e;
      const bx = u * u * u * x0 + 3 * u * u * e * c1x + 3 * u * e * e * c2x + e * e * e * x;
      const by = u * u * u * y0 + 3 * u * u * e * c1y + 3 * u * e * e * c2y + e * e * e * y;
      // Getaran halus; hilang di ujung supaya klik tetap tepat sasaran.
      const g = (1 - e) * 1.5;
      await this._taruh(
        Math.round(bx + this._r(-g, g)),
        Math.round(by + this._r(-g, g)),
      );
      await tidur(1000 / this.fps);
    }
    await this._taruh(Math.round(x), Math.round(y));
  }

  /** Klik di tempat kursor sekarang, lengkap dengan riaknya. */
  async klikDiSini() {
    await tidur(this._r(70, 170));
    await this.page.evaluate((a, b) => window.__riak && window.__riak(a, b), this.x, this.y);
    await this.page.mouse.down();
    await tidur(this._r(48, 105));
    await this.page.mouse.up();
    await tidur(this._r(90, 190));
  }

  /** Pindah ke titik lalu klik. */
  async klikTitik(x, y) {
    await this.ke(x, y);
    await this.klikDiSini();
  }

  /**
   * Ketik seperti orang: jeda berubah-ubah, lebih lama di tanda baca, dan
   * sesekali salah lalu dihapus.
   * @param {number} laju pengali kecepatan; >1 lebih cepat
   */
  async ketik(teks, { laju = 1, salahKetik = true } = {}) {
    const kb = this.page.keyboard;
    const dekat = 'qwertyuiopasdfghjklzxcvbnm';
    let sejakSalah = 0;

    for (let i = 0; i < teks.length; i++) {
      const c = teks[i];

      if (salahKetik && sejakSalah > 24 && this.acak() < 0.016 && /[a-z]/i.test(c)) {
        const keliru = dekat[Math.floor(this.acak() * dekat.length)];
        await kb.type(keliru);
        await tidur(this._r(120, 260) / laju);
        await kb.press('Backspace');
        await tidur(this._r(90, 190) / laju);
        sejakSalah = 0;
      }

      await kb.type(c);
      sejakSalah++;

      let jeda = this._r(38, 112);
      if (c === ' ') jeda += this._r(10, 55);
      if (',;:'.includes(c)) jeda += this._r(90, 210);
      if ('.!?'.includes(c)) jeda += this._r(180, 380);
      // Sesekali berhenti sejenak, seperti orang memikirkan kalimat.
      if (this.acak() < 0.022) jeda += this._r(220, 620);
      await tidur(jeda / laju);
    }
  }

  async tekan(tombol, kali = 1) {
    for (let i = 0; i < kali; i++) {
      await this.page.keyboard.press(tombol);
      await tidur(this._r(60, 140));
    }
  }
}

module.exports = { Tangan, tidur, pembuatAcak };
