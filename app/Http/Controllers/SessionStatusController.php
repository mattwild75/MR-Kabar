<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

/**
 * Sisa waktu sesi menurut SERVER.
 *
 * Halaman tidak boleh menghitung sendiri dari saat ia dibuka: jendela bisa
 * ditinggalkan berjam-jam, komputer bisa tertidur, dan jam di komputer
 * pengguna bisa saja meleset. Yang menentukan hanya satu — selisih antara
 * waktu server sekarang dan `login_at`.
 */
class SessionStatusController extends Controller
{
    private function batasDetik(): int
    {
        return (int) config('session.max_lifetime') * 60;
    }

    /**
     * Sisa detik sampai sesi berakhir, berikut ambang peringatannya.
     *
     * Ambangnya ikut dikirim supaya halaman tidak perlu menyimpan salinan
     * angkanya sendiri — satu-satunya sumbernya tetap config.
     */
    public function show(Request $request)
    {
        $loginAt = $request->session()->get('login_at', now()->timestamp);
        $sisa = $this->batasDetik() - (now()->timestamp - $loginAt);

        return response()->json([
            'secondsRemaining' => max(0, $sisa),
            'warningSeconds' => (int) config('session.warning_seconds'),
            'maxSeconds' => $this->batasDetik(),
        ]);
    }

    /**
     * Dipanggil saat pengguna menekan "Lanjutkan" pada peringatan.
     *
     * Menyetel ulang `login_at` ke sekarang, memberi satu periode penuh lagi
     * tanpa perlu mengetik sandi.
     */
    public function extend(Request $request)
    {
        $request->session()->put('login_at', now()->timestamp);

        return response()->json([
            'secondsRemaining' => $this->batasDetik(),
            'warningSeconds' => (int) config('session.warning_seconds'),
            'maxSeconds' => $this->batasDetik(),
        ]);
    }
}
