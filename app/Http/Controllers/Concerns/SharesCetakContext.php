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
    use MembatasiAksesOpd;

    private function pengaturan(): PengaturanPemda
    {
        return PengaturanPemda::current();
    }

    private function dataUmumForInertia(?DataUmum $dataUmum): ?array
    {
        if (! $dataUmum) {
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
     * Penjaga akses OPD untuk Form Cetak.
     *
     * Isinya sengaja TIDAK ada di sini lagi — pemeriksaannya satu, di
     * MembatasiAksesOpd, dipakai bersama seluruh controller yang membatasi
     * akses per perangkat daerah. Yang tersisa di sini cuma pesannya, karena
     * itulah satu-satunya yang memang berbeda antar-Form Cetak.
     */
    private function ensureOpdAccessWith(
        Request $request,
        ?int $opdId,
        string $pesan = 'Anda hanya dapat mengakses Form Cetak untuk OPD Anda sendiri.',
        array $peranEkstra = [],
    ): void {
        $this->tolakOpdLain($request, $opdId, $pesan, $peranEkstra);
    }
}
