<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * Mengakhiri sesi sekian menit SEJAK LOGIN — satu-satunya penghitung yang
 * menentukan di aplikasi ini.
 *
 * Hitungannya mutlak, bukan bergeser: dipakai bekerja terus-menerus atau
 * ditinggalkan sama sekali, hasilnya sama. Jendela tertutup, komputer
 * tertidur, atau jaringan putus juga tidak menundanya, karena yang disimpan
 * hanyalah SAAT LOGIN dan sisanya dihitung ulang dari waktu server pada
 * permintaan berikutnya.
 *
 * Batasnya dibaca dari `config('session.max_lifetime')`. Sebelumnya angkanya
 * ditulis terpisah di sini, di SessionStatusController, dan di komponen
 * peringatan — tiga salinan yang harus dijaga tetap sama tanpa ada yang
 * memaksanya. Mengubah satu saja tidak memunculkan galat apa pun; akibatnya
 * cuma peringatan yang muncul pada waktu yang keliru.
 */
class ForceLogoutAfterMaxDuration
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! Auth::check()) {
            return $next($request);
        }

        $batas = (int) config('session.max_lifetime') * 60;
        $loginAt = $request->session()->get('login_at');

        // Sesi yang sudah berjalan sebelum penanda ini ada tidak punya
        // `login_at`. Ia dianggap baru dimulai sekarang, bukan langsung
        // dikeluarkan — memutus pekerjaan orang hanya karena versi baru
        // dipasang jelas bukan yang dimaksud.
        if ($loginAt === null) {
            $request->session()->put('login_at', now()->timestamp);

            return $next($request);
        }

        if (now()->timestamp - $loginAt < $batas) {
            return $next($request);
        }

        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login')
            ->with('status', 'Sesi Anda telah berakhir setelah '.$this->lamanya($batas).'. Silakan masuk kembali.');
    }

    /**
     * Lama sesi dalam kata, mengikuti berapa pun batas yang dipasang.
     *
     * Bukan sekadar pembagian ke jam: batas 90 menit akan terbaca "2 jam" dan
     * batas uji beberapa menit terbaca "0 jam" kalau dibulatkan begitu saja.
     */
    private function lamanya(int $detik): string
    {
        $menit = intdiv($detik, 60);
        $jam = intdiv($menit, 60);
        $sisaMenit = $menit % 60;

        if ($jam === 0) {
            return "{$menit} menit";
        }

        return $sisaMenit === 0 ? "{$jam} jam" : "{$jam} jam {$sisaMenit} menit";
    }
}
