<?php

namespace App\Http\Controllers\Concerns;

use App\Models\DataUmum;
use App\Models\PengaturanPemda;
use Illuminate\Http\Request;

/**
 * Konteks bersama seluruh Form Cetak (Browsershot): pengaturan Pemda,
 * serialisasi DataUmum utk Inertia (tanggal ganda display+raw), dan
 * penegakan akses per-OPD. Sebelumnya 3 metode ini di-duplikasi byte-identik
 * di CetakRisiko/CetakHasilAnalisis/CetakRtp/CetakLaporan/
 * CetakMonitoringEvaluasiController — satu-satunya beda nyata pada
 * ensureOpdAccess() cuma pesan abort (& varian cee-survey), jadi
 * diparameterkan.
 */
trait SharesCetakContext
{
    private function pengaturan(): PengaturanPemda
    {
        return PengaturanPemda::current();
    }

    private function dataUmumForInertia(?DataUmum $dataUmum): ?array
    {
        if (!$dataUmum) {
            return null;
        }

        $array = $dataUmum->toArray();
        // tanggal_pembuatan_raw (Y-m-d, utk <input type="date"> di form edit
        // TTD) dipisah dari tanggal_pembuatan (teks Indonesia, utk DISPLAY di
        // blok tanda tangan) — keduanya dibutuhkan sekaligus di halaman yg
        // sama, tidak bisa dipakai bergantian.
        $array['tanggal_pembuatan_raw'] = $dataUmum->tanggal_pembuatan?->format('Y-m-d');
        $array['tanggal_pembuatan'] = $dataUmum->tanggal_pembuatan?->locale('id')->translatedFormat('d F Y');

        return $array;
    }

    /**
     * PIC biasa (punya opd_id) hanya boleh akses Form Cetak OPD-nya sendiri.
     * $pesan menyesuaikan konteks tiap controller; $peranEkstra utk kasus
     * yg mengizinkan peran tambahan lolos (mis. 'cee-survey' pada CetakCee).
     * Tiap controller memanggil ini dari wrapper ensureOpdAccess()-nya
     * sendiri (menyisipkan pesan yg pas) supaya call site lama tak berubah.
     */
    private function ensureOpdAccessWith(
        Request $request,
        ?int $opdId,
        string $pesan = 'Anda hanya dapat mengakses Form Cetak untuk OPD Anda sendiri.',
        array $peranEkstra = [],
    ): void {
        $user = $request->user();

        // Admin/super-admin (& peran ekstra eksplisit yg diizinkan controller
        // pemanggil) selalu boleh lintas-OPD — satu-satunya jalur "lolos" yg
        // sah. TIDAK boleh menyamakan "user tanpa opd_id" dgn "boleh lintas-
        // OPD": PIC non-admin yg belum sempat di-assign opd_id (mis. akun
        // baru dari self-registration publik) HARUS ditolak, bukan diloloskan
        // — sebelumnya baris ini jadi celah IDOR lintas-OPD.
        if ($user->hasAnyRole(array_merge(['admin', 'super-admin'], $peranEkstra))) {
            return;
        }

        if (!$opdId || !$user->opd_id || $opdId !== $user->opd_id) {
            abort(403, $pesan);
        }
    }
}
