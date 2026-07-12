<?php

namespace App\Services;

use Illuminate\Http\Request;
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
     * @param  string  $url  URL lengkap halaman React yg mau dicetak (mis. url()->to('/cetak/risiko/2a?tahun=2026')).
     * @param  string  $filename  Nama file unduhan, TANPA ekstensi .pdf.
     */
    public static function downloadFromUrl(Request $request, string $url, string $filename)
    {
        $pdf = self::render($request, $url);

        return response($pdf, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="' . $filename . '.pdf"',
        ]);
    }

    private static function render(Request $request, string $url): string
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
            ->showBackground();

        // Override opsional lewat .env (BROWSERSHOT_NODE_BINARY /
        // BROWSERSHOT_NPM_BINARY) kalau Browsershot gagal auto-detect node/
        // npm di PATH — umum terjadi di Windows/Herd yg PATH proses PHP-nya
        // beda dari shell interaktif biasa.
        if ($nodeBinary = env('BROWSERSHOT_NODE_BINARY')) {
            $browsershot->setNodeBinary($nodeBinary);
        }
        if ($npmBinary = env('BROWSERSHOT_NPM_BINARY')) {
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
            if ($pair === '' || !str_contains($pair, '=')) {
                continue;
            }
            [$name, $value] = explode('=', $pair, 2);
            $cookies[trim($name)] = urldecode(trim($value));
        }

        return $cookies;
    }
}
