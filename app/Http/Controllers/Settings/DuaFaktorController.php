<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Services\DuaFaktorService;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

/**
 * Memasang dan mencabut autentikasi dua faktor, dari halaman Pengaturan Profil.
 *
 * Alurnya sengaja tiga langkah, bukan satu:
 *
 *   siapkan  -> kunci dibuat, kode QR ditampilkan, TETAPI BELUM disimpan
 *   nyalakan -> pemilik mengetik satu kode; baru di sini kuncinya disimpan
 *   matikan  -> minta sandi lebih dulu
 *
 * Langkah kedua yang menentukan. Kalau kunci langsung disimpan saat QR
 * ditampilkan, orang yang menutup halaman sebelum memindainya akan terkunci
 * dari akunnya sendiri: server menganggap 2FA aktif, ponselnya tidak pernah
 * menyimpan apa pun. Kunci baru hidup sesudah terbukti tersalin.
 */
class DuaFaktorController extends Controller
{
    public function __construct(private DuaFaktorService $duaFaktor) {}

    /**
     * Membuat kunci baru dan menampilkannya sebagai kode QR.
     *
     * Kuncinya dititipkan di sesi, bukan di basis data — lihat alasannya di
     * keterangan kelas. Ikut dikirim dalam bentuk teks supaya tetap bisa
     * dipasang di ponsel yang kameranya rusak atau di aplikasi pengotentikasi
     * yang tidak bisa memindai.
     */
    public function siapkan(Request $request)
    {
        $user = $request->user();
        $kunci = $this->duaFaktor->buatKunci();

        $request->session()->put('dua_faktor_kunci_sementara', $kunci);

        $penulis = new Writer(new ImageRenderer(new RendererStyle(240, 1), new SvgImageBackEnd));
        $svg = $penulis->writeString($this->duaFaktor->urlOtp($user, $kunci));

        return back()->with('duaFaktorSiap', [
            'kunci' => $kunci,
            'qr' => 'data:image/svg+xml;base64,'.base64_encode($svg),
        ]);
    }

    /** Membuktikan pemasangan berhasil, lalu menyalakan 2FA. */
    public function nyalakan(Request $request)
    {
        $request->validate(['kode' => ['required', 'string']]);

        $kunci = $request->session()->get('dua_faktor_kunci_sementara');
        if (! $kunci) {
            return back()->withErrors([
                'kode' => 'Sesi pemasangan sudah kedaluwarsa. Mulai lagi dari tombol Aktifkan.',
            ]);
        }

        if (! $this->duaFaktor->kodeBenar($kunci, $request->string('kode'))) {
            return back()->withErrors([
                'kode' => 'Kode tidak cocok. Periksa lagi angka yang tampil di aplikasi pengotentikasi Anda.',
            ]);
        }

        $kodePemulihan = $this->duaFaktor->nyalakan($request->user(), $kunci);
        $request->session()->forget('dua_faktor_kunci_sementara');

        // Sesi ini dianggap SUDAH melewati tahap kedua.
        //
        // Bukan kelonggaran: satu kode yang benar baru saja diketik di baris
        // atas, dan itu persis pembuktian yang diminta layar tantangan. Tanpa
        // penanda ini, penjaga langsung memantulkan pemiliknya ke layar
        // tantangan pada permintaan berikutnya — yaitu permintaan yang
        // seharusnya menampilkan kode pemulihannya. Akibatnya 2FA menyala
        // dengan kode pemulihan yang tidak pernah dilihat siapa pun, dan
        // ponsel yang hilang berarti akun yang hilang. Terlihat saat uji
        // ujung-ke-ujung di peramban; tidak terlihat dari uji per-permintaan.
        $request->session()->put('dua_faktor_lulus', true);

        // Ditampilkan SEKALI di sini. Sesudah ini kodenya tersimpan terenkripsi
        // dan tidak ada jalan menampilkannya lagi selain membuat yang baru.
        return back()->with('duaFaktorKodePemulihan', $kodePemulihan);
    }

    /**
     * Mencabut 2FA — minta sandi lebih dulu.
     *
     * Tanpa itu, laptop yang ditinggalkan terbuka sebentar cukup untuk
     * mematikan seluruh lapisan kedua tanpa jejak apa pun.
     */
    public function matikan(Request $request)
    {
        $request->validate(['password' => ['required', 'string']]);

        // Peran yang mewajibkan 2FA tidak boleh mencabutnya. Tombolnya memang
        // tidak ditampilkan, tetapi menahannya di layar saja tidak cukup:
        // permintaan POST bisa dikirim tanpa melewati layar mana pun.
        if ($this->duaFaktor->wajibBagi($request->user())) {
            return back()->withErrors([
                'password' => 'Peran akun Anda mewajibkan autentikasi dua faktor, jadi lapisan ini tidak dapat dimatikan sendiri.',
            ]);
        }

        if (! Hash::check($request->string('password'), $request->user()->password)) {
            return back()->withErrors(['password' => 'Kata sandi salah.']);
        }

        $this->duaFaktor->matikan($request->user());

        return back()->with('success', 'Autentikasi dua faktor dimatikan.');
    }

    /** Membuat ulang kode pemulihan, mis. sesudah lembar cetaknya hilang. */
    public function kodePemulihanBaru(Request $request)
    {
        $user = $request->user();

        if (! $this->duaFaktor->aktif($user)) {
            return back()->withErrors(['kode' => 'Autentikasi dua faktor belum aktif.']);
        }

        $kunci = $this->duaFaktor->kunciTersimpan($user);
        $kodePemulihan = $this->duaFaktor->nyalakan($user, $kunci);

        return back()->with('duaFaktorKodePemulihan', $kodePemulihan);
    }
}
