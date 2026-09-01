/**
 * Menangkap layar untuk halaman Panduan.
 *
 * Ukurannya mengikuti gambar yang sudah ada di public/images/panduan:
 * 2400x1500, yaitu bingkai 1200x750 pada kerapatan 2x. Diambil sebagai
 * bingkai tampak, BUKAN halaman penuh, supaya sebangun dengan yang lama.
 */
const { chromium } = require('playwright');

const ALAMAT = 'https://mrkabar.test';
const TUJUAN = 'public/images/panduan';

const sandi = process.argv[2];
const akun = process.argv[3] || 'PIC_INSPEKTORAT';
if (!sandi) {
    console.error('sandi tidak diberikan');
    process.exit(1);
}

(async () => {
    const browser = await chromium.launch();
    const ctx = await browser.newContext({
        viewport: { width: 1200, height: 750 },
        deviceScaleFactor: 2,
        ignoreHTTPSErrors: true,
    });
    const page = await ctx.newPage();

    // Masuk. Kolomnya #username, BUKAN surel.
    await page.goto(`${ALAMAT}/login`, { waitUntil: 'networkidle' });
    // BUKAN akun admin. Peran `admin` dan `super-admin` diwajibkan memasang
    // 2FA lebih dulu (config mrkabar.dua_faktor.peran_wajib), dan selama itu
    // belum dipasang, middleware WajibDuaFaktor memantulkan SETIAP alamat ke
    // /settings/profile. Terbukti: empat tangkapan pertama seluruhnya berisi
    // halaman Profile Settings, dengan ukuran berkas yang sama persis.
    await page.fill('#username', akun);
    await page.fill('#password', sandi);
    await page.click('button[type="submit"]');
    // Ditunggu SEKADAR beranjak dari /login, bukan mendarat di /dashboard:
    // sesudah sandi diganti, aplikasi mengantar ke /settings/profile lebih
    // dulu, dan menanti /dashboard membuat skrip ini kehabisan waktu padahal
    // masuknya sudah berhasil.
    await page.waitForURL((u) => !u.pathname.startsWith('/login'), { timeout: 30000 });
    console.log(`masuk sebagai ${akun}: ${page.url()}`);

    const ambil = async (jalur, nama, sesudah) => {
        await page.goto(`${ALAMAT}${jalur}`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(1500);
        if (sesudah) await sesudah();
        // Diperiksa SEBELUM disimpan. Tanpa ini, pemantulan diam-diam
        // menghasilkan empat berkas berisi halaman yang sama, dan itu hanya
        // ketahuan kalau seseorang membukanya satu per satu.
        const mendarat = new URL(page.url()).pathname;
        if (mendarat !== jalur) {
            throw new Error(`${jalur} memantul ke ${mendarat} - tangkapan dibatalkan`);
        }
        const h1 = await page.locator('h1').first().textContent().catch(() => null);
        await page.screenshot({ path: `${TUJUAN}/${nama}.png` });
        console.log(`  ${nama}.png  <- ${jalur}  (judul: ${(h1 || '?').trim().slice(0, 50)})`);
    };

    await ambil('/data-umum', 'data-umum');
    await ambil('/cee/1a', 'cee-1a');
    await ambil('/cetak/laporan/1', 'laporan-11');

    // Peta sidebar. Diambil sebagai POTONGAN elemen sidebarnya saja, bukan
    // bingkai jendela: yang hendak ditunjukkan adalah pohon menunya utuh, dan
    // memotretnya bersama jendela penuh berarti separuh gambar terisi dasbor
    // yang tidak ada hubungannya - pada akun PIC yang tahun berjalannya belum
    // diisi, dasbor itu bahkan seluruhnya bernilai nol.
    // Tinggi bingkai DIBIARKAN 750, dan itu keputusan sadar. Sempat dinaikkan
    // ke 1500 supaya seluruh grup menu tertangkap, hasilnya gambar 478x2968 -
    // begitu tegak sehingga tidak muat pada satu halaman A4 dan JUSTRU HILANG
    // dari cetakan. Pada 750 gambarnya 478x1449, tampil setinggi sekitar 191mm
    // dan muat utuh. Kelengkapan peta menunya toh sudah dipikul MenuMapGrid di
    // bawah gambar itu, yang memang bentuk yang tepat untuk sebuah daftar.
    await page.goto(`${ALAMAT}/dashboard`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);

    // SATU grup saja yang dibentangkan, dan itu bukan penyederhanaan
    // melainkan mengikuti perilaku aplikasinya: toggleGroup() di
    // app-sidebar.tsx menyimpan SATU id terbuka per tingkat, sehingga membuka
    // grup kedua menutup yang pertama. "Seluruh menu terbentang sekaligus"
    // memang tidak pernah bisa terjadi di layar, jadi memaksakannya di gambar
    // justru menampilkan sesuatu yang tidak pernah dilihat pengguna.
    //
    // Tombolnya bertanda data-state, BUKAN aria-expanded - sidebar ini buatan
    // sendiri, bukan Collapsible shadcn. Percobaan memakai aria-expanded tidak
    // menemukan apa pun kecuali tombol akun di kaki sidebar, yang ketika
    // tertekan membuka popup "Settings / Log out" menutupi separuh menu.
    await page
        .locator('[data-sidebar="content"] [data-state="closed"]')
        .filter({ hasText: 'Form Input' })
        .first()
        .click({ timeout: 5000 })
        .catch(() => console.log('  (grup Form Input tidak dapat ditekan)'));
    await page.waitForTimeout(900);

    const sidebar = page.locator('[data-sidebar="sidebar"]').first();
    await sidebar.screenshot({ path: `${TUJUAN}/peta-sidebar.png` });
    const cacah = await page.locator('[data-sidebar="content"] a, [data-sidebar="content"] button').count();
    console.log(`  peta-sidebar.png  <- sidebar, grup Form Input terbuka (${cacah} butir menu terlihat)`);

    await browser.close();
})().catch((e) => {
    console.error('GAGAL:', e.message);
    process.exit(1);
});
