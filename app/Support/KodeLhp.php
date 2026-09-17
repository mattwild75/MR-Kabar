<?php

namespace App\Support;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

/**
 * Akses kode baku Database LHP (klasifikasi standar BPKP) dari tabel
 * lhp_ref_kode — dipindah lengkap dari T_Kode_* SimHPPemda. Menyediakan
 * daftar berjenjang untuk dropdown (group → kode rinci) dan pencarian label
 * kode. Bidang/Unit dan Inspektorat bukan dari SimHP, jadi tetap di sini.
 */
class KodeLhp
{
    /** Bidang/Unit Pengawasan (SOTK Inspektorat Aceh Barat, Perbup 17/2024). */
    public const BIDANG_UNIT = [
        'Inspektorat Kabupaten Aceh Barat',
        'Inspektur Pembantu Wilayah I',
        'Inspektur Pembantu Wilayah II',
        'Inspektur Pembantu Wilayah III',
        'Inspektur Pembantu Wilayah IV',
        'Inspektur Pembantu Khusus',
    ];

    public const INSPEKTORAT_DEFAULT = 'Inspektorat Aceh Barat';

    /**
     * Seluruh kode dikelompokkan per jenis, di-cache. Bentuk:
     * ['temuan' => [['kode','kode_group','nama'], ...], ...].
     *
     * @return array<string, array<int, array{kode:string, kode_group:?string, nama:string}>>
     */
    public static function semua(): array
    {
        return Cache::rememberForever('lhp_ref_kode', function () {
            $out = [];
            foreach (DB::table('lhp_ref_kode')->orderBy('jenis')->orderBy('kode')->get() as $r) {
                $out[$r->jenis][] = ['kode' => $r->kode, 'kode_group' => $r->kode_group, 'nama' => $r->nama];
            }

            return $out;
        });
    }

    /** Daftar untuk formulir React (semua jenis + Bidang/Unit + default). */
    public static function untukFormulir(): array
    {
        return array_merge(self::semua(), [
            'bidang_unit' => self::BIDANG_UNIT,
            'inspektorat_default' => self::INSPEKTORAT_DEFAULT,
        ]);
    }

    /** Label satu kode pada jenis tertentu; null bila tak dikenal/kosong. */
    public static function label(string $jenis, ?string $kode): ?string
    {
        if ($kode === null || $kode === '') {
            return null;
        }
        $peta = self::petaLabel();

        return $peta[$jenis][$kode] ?? null;
    }

    /** @return array<string, array<string, string>> */
    private static function petaLabel(): array
    {
        return Cache::rememberForever('lhp_ref_kode_label', function () {
            $out = [];
            foreach (self::semua() as $jenis => $baris) {
                foreach ($baris as $b) {
                    $out[$jenis][$b['kode']] = $b['nama'];
                }
            }

            return $out;
        });
    }
}
