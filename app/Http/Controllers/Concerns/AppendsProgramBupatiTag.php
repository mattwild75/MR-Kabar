<?php

namespace App\Http\Controllers\Concerns;

use App\Models\ProgramBupatiRisiko;

/**
 * Menambahkan penanda "(P{nomor})" di akhir teks URAIAN RISIKO utk baris yg
 * dikaitkan ke salah satu 100 Program Pembangunan Bupati (lihat
 * ProgramBupatiRisikoController) — TANPA penjelasan apapun di frontend,
 * murni penanda internal (keputusan eksplisit user: "tidak usah dijelaskan
 * apapun secara frontend, cukup saya yg tau"). Hanya dipakai di 3 Form
 * Input (IRS Pemda/IRS PD/IRO PD) dan Data Risiko Gabungan — TIDAK di Form
 * Cetak/Dashboard/halaman lain manapun.
 */
trait AppendsProgramBupatiTag
{
    /**
     * Peta "risiko_id -> nomor program" (nomor program PERTAMA kalau
     * risiko itu dikaitkan ke >1 program — cukup 1 penanda, bukan daftar)
     * utk satu tipe risiko (irs_pemda/irs_pd/iro_pd), dihitung SEKALI per
     * request lewat 1 query (bukan per baris/N+1).
     */
    private function programBupatiNomorMap(string $risikoTipe): array
    {
        return ProgramBupatiRisiko::where('risiko_tipe', $risikoTipe)
            ->with('program:id,nomor')
            ->get()
            ->reduce(function (array $map, ProgramBupatiRisiko $pivot) {
                $map[$pivot->risiko_id] ??= $pivot->program?->nomor;

                return $map;
            }, []);
    }

    /** Tambahkan "(P{nomor})" ke akhir $uraian kalau $risikoId ada di $nomorMap — dipanggil per baris saat render. */
    private function withProgramBupatiTag(?string $uraian, int $risikoId, array $nomorMap): ?string
    {
        $nomor = $nomorMap[$risikoId] ?? null;

        return $nomor ? "{$uraian} (P{$nomor})" : $uraian;
    }
}
