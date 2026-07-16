<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SessionStatusController extends Controller
{
    private const MAX_SESSION_SECONDS = 4 * 60 * 60;

    /**
     * Dipoll berkala oleh frontend (SessionTimeoutWarning) untuk tahu kapan
     * harus menampilkan dialog peringatan sesi akan berakhir — mengembalikan
     * berapa detik lagi sampai batas 4 jam sejak login tercapai.
     */
    public function show(Request $request)
    {
        $loginAt = $request->session()->get('login_at', now()->timestamp);
        $secondsRemaining = self::MAX_SESSION_SECONDS - (now()->timestamp - $loginAt);

        return response()->json([
            'secondsRemaining' => max(0, $secondsRemaining),
        ]);
    }

    /**
     * Dipanggil saat user klik "Lanjutkan" pada dialog peringatan — reset
     * login_at ke sekarang, memberi 4 jam penuh lagi sebelum peringatan
     * berikutnya, tanpa perlu login ulang dengan password.
     */
    public function extend(Request $request)
    {
        $request->session()->put('login_at', now()->timestamp);

        return response()->json(['secondsRemaining' => self::MAX_SESSION_SECONDS]);
    }
}
