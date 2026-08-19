<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\DuaFaktorService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

/**
 * Layar kedua saat masuk: enam angka dari aplikasi pengotentikasi.
 *
 * Pengguna SUDAH terotentikasi lewat sandi saat sampai di sini — Laravel
 * memerlukan itu untuk mengenali siapa yang harus dimintai kode. Yang
 * menahannya adalah penanda sesi `dua_faktor_lulus`: selama penanda itu
 * belum ada, middleware WajibDuaFaktor memantulkan setiap permintaan kembali
 * ke layar ini. Jadi "sudah masuk" di tahap ini tidak memberi akses apa pun.
 *
 * Percobaan dibatasi 5 kali. Kode TOTP cuma enam angka dan berlaku 90 detik;
 * tanpa pembatas, menebaknya secara berurutan bukan hal yang mustahil.
 */
class DuaFaktorTantanganController extends Controller
{
    public function __construct(private DuaFaktorService $duaFaktor) {}

    public function tampil(Request $request)
    {
        if ($salah = $this->tolakBilaTakBerlaku($request)) {
            return $salah;
        }

        return Inertia::render('auth/dua-faktor', [
            'sisaKodePemulihan' => count($this->duaFaktor->kodePemulihanTersimpan($request->user())),
        ]);
    }

    public function kirim(Request $request)
    {
        if ($salah = $this->tolakBilaTakBerlaku($request)) {
            return $salah;
        }

        $request->validate([
            'kode' => ['required', 'string'],
            'pakai_pemulihan' => ['nullable', 'boolean'],
        ]);

        $user = $request->user();
        $kunciBatas = 'dua-faktor:'.$user->id.'|'.$request->ip();

        if (RateLimiter::tooManyAttempts($kunciBatas, 5)) {
            throw ValidationException::withMessages([
                'kode' => 'Terlalu banyak percobaan. Coba lagi dalam '
                    .RateLimiter::availableIn($kunciBatas).' detik.',
            ]);
        }

        $lulus = $request->boolean('pakai_pemulihan')
            ? $this->duaFaktor->pakaiKodePemulihan($user, $request->string('kode'))
            : $this->duaFaktor->kodeBenar(
                $this->duaFaktor->kunciTersimpan($user),
                $request->string('kode'),
            );

        if (! $lulus) {
            RateLimiter::hit($kunciBatas, 300);

            throw ValidationException::withMessages([
                'kode' => $request->boolean('pakai_pemulihan')
                    ? 'Kode pemulihan tidak dikenali, atau sudah pernah dipakai.'
                    : 'Kode tidak cocok. Kode berganti tiap 30 detik — coba yang sedang tampil sekarang.',
            ]);
        }

        RateLimiter::clear($kunciBatas);

        // ID sesi diputar ulang supaya sesi yang sudah dipegang sebelum
        // lulusnya tahap kedua tidak bisa dipakai lagi.
        $request->session()->regenerate();
        $request->session()->put('dua_faktor_lulus', true);

        // Waktu login dihitung ulang dari sini, bukan dari saat sandi
        // dimasukkan — kalau tidak, waktu yang dihabiskan mencari ponsel ikut
        // memotong jatah empat jam sesi.
        $request->session()->put('login_at', now()->timestamp);

        return redirect()->intended(route('dashboard'));
    }

    /**
     * Menutup jalur ini bagi yang memang tidak punya tahap kedua.
     *
     * Rutenya terbuka bagi siapa pun yang sudah masuk — middleware
     * WajibDuaFaktor melewatkannya tanpa syarat supaya pemantulannya tidak
     * berputar. Tanpa penjaga ini, akun tanpa 2FA yang mengetik alamatnya
     * sendiri akan sampai ke kirim() dan menemukan kunci yang tidak ada.
     */
    private function tolakBilaTakBerlaku(Request $request)
    {
        if ($this->duaFaktor->aktif($request->user())) {
            return null;
        }

        return redirect()->route('dashboard');
    }

    /**
     * Keluar dari layar tantangan.
     *
     * Perlu ada tombolnya: tanpa itu, orang yang ponselnya tidak ada di
     * tangan terjebak di halaman yang tidak bisa ia lewati dan tidak bisa ia
     * tinggalkan.
     */
    public function batal(Request $request)
    {
        auth()->guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}
