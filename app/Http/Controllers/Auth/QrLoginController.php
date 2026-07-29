<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Middleware\RestrictCeeSurveyRole;
use App\Http\Middleware\RestrictLaporRisikoRole;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * Dasar bersama untuk auto-login lewat QR (akun bersama CEE_Survey & LAPOR).
 *
 * Janji sebuah QR di poster itu sederhana: pindai, lalu langsung bisa mengisi.
 * Versi sebelumnya hanya memenuhinya kalau peramban sedang TIDAK punya sesi
 * apa pun — kalau sudah ada, ia membiarkan sesi itu apa adanya lalu tetap
 * mengarahkan ke form tujuan. Hasilnya bergantung pada siapa yang kebetulan
 * sedang login, dan dua di antaranya berakhir buruk (keduanya terukur, bukan
 * dugaan):
 *
 * - Peramban yang tadi dipakai memindai QR yang SATUNYA masih memegang akun
 *   bersama yang lain. Penjaga peran (RestrictCeeSurveyRole /
 *   RestrictLaporRisikoRole) menolak path tujuan lalu membuangnya ke
 *   /dashboard. Inilah keluhan "sudah scan tapi malah masuk dashboard", dan
 *   ini pula yang membuatnya terasa "kadang-kadang": tergantung apa yang
 *   dipindai sebelumnya di perangkat itu.
 * - Akun peninjau (eksekutif) berhasil membuka formnya, tapi tombol kirimnya
 *   ditolak 403 oleh ViewerReadOnly. Ini yang paling menjebak: orangnya
 *   mengisi sampai selesai, baru ditolak di akhir.
 *
 * Sekarang sesi yang sedang aktif hanya dipertahankan kalau ia benar-benar
 * bisa MEMAKAI form tujuan. Kalau tidak, sesinya dilepas dan diganti akun
 * bersama milik QR itu — sehingga pemindainya selalu mendarat di formulir
 * yang siap diisi, apa pun keadaan peramban sebelumnya.
 *
 * PIC OPD, Admin, dan Super Admin tidak terpengaruh: mereka memang bisa
 * mengisi form ini, jadi sesinya dibiarkan utuh dan mereka tetap masuk
 * sebagai dirinya sendiri (isian tercatat atas nama akun mereka, bukan akun
 * bersama).
 */
abstract class QrLoginController extends Controller
{
    /** Username akun bersama milik QR ini. */
    abstract protected function username(): string;

    /** Sandi akun bersama, dari config (bukan env() — lihat config/mrkabar.php). */
    abstract protected function sandi(): string;

    /** Path form yang dituju setelah masuk. */
    abstract protected function tujuan(): string;

    public function __invoke(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user && !$this->bisaMengisiFormTujuan($user)) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        if (!Auth::check()) {
            Auth::attempt(['username' => $this->username(), 'password' => $this->sandi()]);

            $request->session()->regenerate();
            $request->session()->put('login_at', now()->timestamp);
        }

        return redirect($this->tujuan());
    }

    /**
     * Bisakah akun ini membuka DAN mengirim form tujuan?
     *
     * Kedua penjaga peran ditanyai langsung, bukan disalin daftarnya ke sini:
     * kalau disalin, suatu saat whitelist-nya berubah di satu tempat saja dan
     * QR-nya kembali membuang orang ke dashboard tanpa ada yang menyadari.
     */
    private function bisaMengisiFormTujuan(User $user): bool
    {
        // Peninjau boleh melihat apa saja tapi tidak boleh mengirim apa pun,
        // jadi membiarkannya di form hanya menunda penolakan sampai akhir.
        if ($user->isViewerOnly()) {
            return false;
        }

        return RestrictCeeSurveyRole::bolehAkses($user, $this->tujuan())
            && RestrictLaporRisikoRole::bolehAkses($user, $this->tujuan());
    }
}
