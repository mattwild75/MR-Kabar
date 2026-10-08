<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/*
 * Sebagian isi Kriteria Dampak level 1 tersimpan dgn karakter rusak
 * ("â‰¥" / "â‰¤" — UTF-8 yg pernah dibaca ulang sbg Windows-1252), padahal
 * RiskReferenceDataSeeder benar ("≥" / "≤"). Kini tabel kriteria dipakai
 * langsung utk memilih nilai risiko, jadi teksnya harus terbaca.
 */
return new class extends Migration
{
    private const GANTI = [
        "\u{00E2}\u{2030}\u{00A5}" => '≥',
        "\u{00E2}\u{2030}\u{00A4}" => '≤',
    ];

    public function up(): void
    {
        $kolom = [
            'risk_impact_criteria' => ['label', 'kerugian_negara', 'penurunan_reputasi', 'penurunan_kinerja', 'gangguan_pelayanan', 'tuntutan_hukum'],
            'risk_likelihood_criteria' => ['nama', 'probabilitas', 'frekuensi', 'toleransi'],
        ];

        foreach ($kolom as $tabel => $daftar) {
            foreach (DB::table($tabel)->get() as $baris) {
                $ubah = [];
                foreach ($daftar as $k) {
                    $nilai = $baris->{$k} ?? null;
                    if (is_string($nilai)) {
                        $baru = strtr($nilai, self::GANTI);
                        if ($baru !== $nilai) {
                            $ubah[$k] = $baru;
                        }
                    }
                }
                if ($ubah) {
                    DB::table($tabel)->where('id', $baris->id)->update($ubah);
                }
            }
        }
    }

    public function down(): void
    {
        // Perbaikan data; tidak dikembalikan ke karakter rusak.
    }
};
