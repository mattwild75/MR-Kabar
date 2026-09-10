<?php

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Spatie\Browsershot\Browsershot;

/**
 * PRESET BAKU cetak PDF utk SELURUH aplikasi ini (Risiko 2a/2b/2c, CEE
 * 1a/1b/1c, dan fitur Form Cetak apapun yg dibuat setelah ini) — via
 * Browsershot (Chromium headless/Puppeteer), BUKAN DomPDF. Keputusan
 * desain permanen per instruksi user: "cetak = 100% sama dgn tampilan
 * web". DomPDF adalah interpreter HTML-ke-PDF terpisah dgn dukungan CSS
 * terbatas (table-layout, nested table, page-break, flexbox semua
 * berperilaku beda dari browser sungguhan), sehingga hasil cetaknya TIDAK
 * PERNAH benar2 identik dgn tampilan React yg dilihat user di halaman
 * preview — sudah berkali-kali dipatch (table-layout: fixed vs auto,
 * rowspan vs heading baris, dst) tapi tetap ada celah krn root cause-nya
 * memang beda mesin render. Blade view `pdf-*.blade.php` terpisah (yg dulu
 * dipakai DomPDF) SUDAH DIHAPUS utk Risiko & CEE — jangan dibuat lagi.
 *
 * Browsershot mengunjungi URL halaman React YANG SAMA PERSIS (mis.
 * /cetak/risiko/2a, /cetak/cee/1a) memakai Chromium asli, lalu
 * men-screenshot hasilnya ke PDF — dijamin pixel-identik dgn apa yg user
 * lihat di browser (termasuk CSS print media query `print:hidden`,
 * `cee-print-sheet`, `@media print { @page {...} }` dll yg sudah ada di
 * halaman React), krn memang browser yg sama yg dipakai user utk
 * melihatnya sendiri.
 *
 * CARA PAKAI utk fitur cetak BARU: (1) halaman preview React WAJIB punya
 * toolbar/elemen non-cetak dibungkus class `print:hidden`, dan konten yg
 * mau dicetak diberi `@media print { @page { size: A4 portrait; margin:
 * 15mm; } }` di dalam <style> komponennya sendiri (lihat Cetak2a.tsx /
 * Cetak1a.tsx sbg contoh). (2) Di controller, method `pdf*()` CUKUP
 * memanggil `PdfPrintService::downloadFromUrl($request, url("/cetak/..."),
 * $filename)` — TIDAK PERLU membangun ulang data/props terpisah utk Blade,
 * krn tidak ada lagi Blade PDF view. Method Inertia-render (`cetak*()`)
 * dan method PDF (`pdf*()`) boleh berbagi logic query data, tapi PDF-nya
 * sendiri murni screenshot URL, bukan render ulang view lain.
 *
 * Autentikasi: halaman /cetak/* ada di belakang middleware 'auth' —
 * Browsershot (proses Node/Chromium terpisah, bukan request Laravel biasa)
 * tidak otomatis "login". Cookie session milik user yg sedang request PDF
 * DITERUSKAN (forward) ke Chromium via useCookies(), supaya Chromium
 * "melihat" halaman itu PERSIS spt user sendiri yg buka browser dlm
 * keadaan login — bukan lewat request terpisah tanpa autentikasi.
 */
class PdfPrintService
{
    /**
     * Satu pencetakan PDF pada satu waktu untuk seluruh aplikasi.
     *
     * Tiap permintaan PDF menjalankan satu Chromium sendiri. Terukur: satu
     * permintaan selesai 7 detik dan menghasilkan berkas ~940 KB, tapi EMPAT
     * permintaan bersamaan membuat KEEMPATNYA gagal 500 setelah 32 detik —
     * Chromium-nya berebut CPU sampai setiap permintaan menembus batas waktu
     * eksekusi PHP dan mati di tengah render. Bukan sebagian yang gagal,
     * semuanya, termasuk yang menekan tombol duluan.
     *
     * Yang ditolak di sini permintaannya, BUKAN diantrekan menunggu giliran.
     * Mengantre sempat dicoba dan ternyata salah bentuk: permintaan yang
     * menunggu tetap memegang satu pekerja PHP, padahal Chromium butuh
     * pekerja itu untuk membuka halaman cetaknya sendiri ke server yang sama.
     * Penunggunya justru membuat render yang sedang berjalan kelaparan —
     * terukur, satu dari empat tetap gagal. Menolak cepat membebaskan
     * pekerjanya seketika, sehingga yang sedang mencetak pasti selesai.
     */
    private const KUNCI = 'cetak-pdf';

    /** Umur kunci: pelindung kalau prosesnya mati tanpa sempat melepas. */
    private const UMUR_KUNCI = 150;

    /**
     * Umur kunci untuk dokumen panjang, lebih longgar.
     *
     * Panduan memuat dua puluh bagian berikut tiga belas gambar; terukur,
     * satu pencetakannya jauh lebih lama daripada satu formulir. Batas yang
     * sama akan memutusnya di tengah render.
     */
    private const UMUR_KUNCI_DOKUMEN = 300;

    /**
     * @param  string  $url  URL lengkap halaman React yg mau dicetak (mis. url()->to('/cetak/risiko/2a?tahun=2026')).
     * @param  string  $filename  Nama file unduhan, TANPA ekstensi .pdf.
     */
    public static function downloadFromUrl(Request $request, string $url, string $filename)
    {
        // Batas bawaan PHP 30 detik terlalu mepet: render normal 7 detik, tapi
        // halaman yang isinya banyak bisa jauh lebih lama.
        set_time_limit(self::UMUR_KUNCI);

        $kunci = Cache::lock(self::KUNCI, self::UMUR_KUNCI);

        if (! $kunci->get()) {
            // Balasan dirakit sendiri, bukan abort(503, $pesan): halaman galat
            // bawaan Laravel hanya menampilkan "Service Unavailable" dan
            // membuang pesannya begitu APP_DEBUG mati — persis di lingkungan
            // yang membacanya. Tombol kembali disertakan karena tombol Unduh
            // PDF berupa tautan biasa, jadi pengguna benar-benar berpindah
            // halaman dan kehilangan pilihan OPD/tahun yang sudah diaturnya.
            abort(response(view('pdf-sibuk'), 503, ['Retry-After' => 15]));
        }

        try {
            $pdf = self::render($request, $url);
        } finally {
            $kunci->release();
        }

        return response($pdf, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="'.$filename.'.pdf"',
        ]);
    }

    /**
     * Varian untuk DOKUMEN PANJANG yang dibaca sebagai bacaan, bukan formulir.
     *
     * Bedanya dengan downloadFromUrl() ada pada siapa yang menentukan ukuran
     * dan tepi kertas. Pada Form Cetak, halaman React-nya sendiri yang
     * memegang `@page`, karena tiap formulir punya tuntutan tata letaknya
     * sendiri dan hasil cetaknya wajib sama persis dengan yang dilihat di
     * layar.
     *
     * Dokumen panjang menuntut satu hal yang tidak dapat diberikan CSS:
     * NOMOR HALAMAN. Chromium tidak mendukung kotak tepi `@page`
     * (`@bottom-center { content: counter(page) }` diabaikan diam-diam), jadi
     * satu-satunya jalan adalah kaki halaman bawaan Puppeteer — dan itu hanya
     * bekerja bila tepi kertas ditentukan DARI SINI, bukan dari CSS halaman.
     *
     * Akibatnya halaman yang dicetak lewat jalur ini TIDAK BOLEH
     * mendefinisikan `@page` sendiri: yang ditentukan di sini akan
     * menimpanya, sehingga aturan yang tertulis di CSS halaman cuma
     * menyesatkan siapa pun yang membacanya kelak.
     *
     * @param  string  $judulKaki  Teks kiri pada kaki halaman, sebagai penanda asal berkas.
     */
    public static function downloadDokumen(Request $request, string $url, string $filename, string $judulKaki)
    {
        set_time_limit(self::UMUR_KUNCI_DOKUMEN);

        $kunci = Cache::lock(self::KUNCI, self::UMUR_KUNCI_DOKUMEN);

        if (! $kunci->get()) {
            abort(response(view('pdf-sibuk'), 503, ['Retry-After' => 30]));
        }

        try {
            $pdf = self::render($request, $url, function (Browsershot $b) use ($judulKaki) {
                $b->format('A4')
                    // Tepi bawah dilebihkan supaya kaki halaman punya ruang
                    // sendiri dan tidak menindih baris terakhir.
                    ->margins(15, 15, 20, 15)
                    ->showBrowserHeaderAndFooter()
                    ->hideHeader()
                    ->footerHtml(self::kakiHalaman($judulKaki))
                    ->timeout(self::UMUR_KUNCI_DOKUMEN - 30);
            });
        } finally {
            $kunci->release();
        }

        return response($pdf, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="'.$filename.'.pdf"',
        ]);
    }

    /**
     * Kaki halaman bawaan Puppeteer.
     *
     * Gayanya WAJIB ditulis sebaris di dalam atribut style: potongan ini
     * dirender Chromium di dokumen terpisah yang tidak memuat CSS halaman
     * sama sekali, jadi kelas Tailwind apa pun di sini tidak berarti apa-apa.
     * Ukuran hurufnya pun harus disebut eksplisit — bawaannya sangat kecil.
     *
     * Kelas `pageNumber` dan `totalPages` dikenali Chromium sendiri dan
     * diisinya saat mencetak; keduanya bukan kelas milik aplikasi ini.
     */
    private static function kakiHalaman(string $judul): string
    {
        $judul = e($judul);

        return <<<HTML
        <div style="width:100%;font-size:8px;color:#6b7280;padding:0 15mm;display:flex;justify-content:space-between;font-family:sans-serif;">
            <span>{$judul}</span>
            <span>Halaman <span class="pageNumber"></span> dari <span class="totalPages"></span></span>
        </div>
        HTML;
    }

    /**
     * @param  ?callable  $penyesuai  Kesempatan mengubah setelan sebelum dicetak, dipakai downloadDokumen().
     */
    private static function render(Request $request, string $url, ?callable $penyesuai = null): string
    {
        // PENTING: pakai cookie MENTAH dari header HTTP (belum didekripsi),
        // BUKAN $request->cookies->all() — Laravel mendekripsi nilai cookie
        // (mis. cookie sesi "mr_kabar_session") lewat middleware
        // EncryptCookies sebelum controller menerimanya, jadi
        // $request->cookies sudah berisi PLAINTEXT session id, bukan nilai
        // cookie asli yg dikirim browser. Kalau plaintext itu diteruskan
        // balik sbg cookie baru ke Chromium, response berikutnya dari
        // Laravel akan GAGAL didekripsi (nilai yg diharapkan adalah
        // ciphertext ter-enkripsi APP_KEY) — Chromium akan dianggap "belum
        // login" & di-redirect ke /login walau cookie session-nya "ada".
        // Mem-parse ulang header Cookie mentah memastikan nilai yg
        // diteruskan ke Chromium PERSIS sama dgn yg browser user kirim.
        $cookies = self::parseRawCookieHeader($request->headers->get('Cookie', ''));

        $browsershot = Browsershot::url($url)
            ->useCookies($cookies, parse_url($url, PHP_URL_HOST))
            ->waitUntilNetworkIdle()
            // emulateMedia('print') memaksa Chromium menerapkan CSS
            // @media print (mis. print:hidden pada toolbar preview) — TANPA
            // ini, Chromium akan screenshot tampilan LAYAR biasa (toolbar
            // "Unduh PDF" dkk ikut ter-screenshot), bukan tampilan cetak.
            ->emulateMedia('print')
            // TIDAK ada format('A4')/margins() eksplisit di sini — halaman
            // React (Cetak2a/2b/2c.tsx) SUDAH mendefinisikan sendiri
            // `@media print { @page { size: A4 portrait; margin: 15mm; } }`
            // di dalam <style> komponennya. Kalau di-set dobel di sini,
            // Puppeteer's printBackground/format bisa override/bentrok
            // dgn @page milik halaman — showPrintBackground() TETAP dipakai
            // supaya warna latar (highlight kuning Sumber Data, dll) ikut
            // tercetak, bukan cuma teks hitam-putih (default Chrome print).
            ->showBackground()
            // WAJIB di server Linux, dan bukan sekadar kehati-hatian: tanpa
            // ini Chromium menolak jalan sama sekali dengan
            // "FATAL: No usable sandbox!", dan seluruh Form Cetak menjawab
            // 500. Terbukti di server produksi 10 September 2026.
            //
            // Sebabnya bukan setelan kernel yang keliru — diperiksa di sana,
            // `kernel.unprivileged_userns_clone` sudah 1. Sebabnya paket
            // `chrome-headless-shell` yang dipakai Puppeteer TIDAK membawa
            // biner pendamping `chrome-sandbox` ber-SUID, sehingga Chromium
            // tidak punya sandbox untuk dipakai sama sekali.
            //
            // RISIKONYA TERBATAS, dan itu yang membuatnya dapat diterima:
            // Browsershot di aplikasi ini HANYA membuka alamat milik aplikasi
            // sendiri (mis. /cetak/risiko/2a, /panduan-publik) — tidak pernah
            // merender HTML kiriman pengguna. Sandbox Chromium melindungi dari
            // halaman jahat pihak ketiga, dan di sini tidak ada pihak ketiga.
            //
            // Di Windows/Herd bendera ini tidak berpengaruh apa-apa, jadi aman
            // dipasang di satu tempat untuk kedua lingkungan.
            ->noSandbox()
            // Dibatasi di bawah umur kunci: kalau Chromium tersangkut, yang
            // mati harus prosesnya, bukan giliran orang berikutnya.
            ->timeout(self::UMUR_KUNCI - 30);

        if ($penyesuai) {
            $penyesuai($browsershot);
        }

        // Override opsional lewat .env (BROWSERSHOT_NODE_BINARY /
        // BROWSERSHOT_NPM_BINARY) kalau Browsershot gagal auto-detect node/
        // npm di PATH — umum terjadi di Windows/Herd yg PATH proses PHP-nya
        // beda dari shell interaktif biasa.
        if ($nodeBinary = config('mrkabar.browsershot.node_binary')) {
            $browsershot->setNodeBinary($nodeBinary);
        }
        if ($npmBinary = config('mrkabar.browsershot.npm_binary')) {
            $browsershot->setNpmBinary($npmBinary);
        }

        return $browsershot->pdf();
    }

    /**
     * Parse header "Cookie: a=1; b=2" mentah jadi ['a' => '1', 'b' => '2'] —
     * TANPA melalui parsing/decrypt Symfony/Laravel, supaya nilai cookie
     * (khususnya cookie sesi terenkripsi) tetap PERSIS byte-for-byte spt
     * yg dikirim browser, siap diteruskan apa adanya ke Chromium.
     */
    private static function parseRawCookieHeader(string $header): array
    {
        $cookies = [];
        foreach (explode(';', $header) as $pair) {
            $pair = trim($pair);
            if ($pair === '' || ! str_contains($pair, '=')) {
                continue;
            }
            [$name, $value] = explode('=', $pair, 2);
            $cookies[trim($name)] = urldecode(trim($value));
        }

        return $cookies;
    }
}
