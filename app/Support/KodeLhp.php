<?php

namespace App\Support;

/**
 * Daftar kode baku Database LHP (mengikuti SimHPPemda BPKP). Hanya daftar
 * GROUP yang lengkap dan pasti (dari layar SimHP); tabel kode turunan
 * (T_Kode_Temuan/Sebab/Rekomendasi) terkunci di SimHP sehingga kode rincinya
 * diisi sebagai teks 4 digit yang tetap dipertahankan apa adanya.
 */
class KodeLhp
{
    /** Group Jenis Pemeriksaan (sumber audit). */
    public const GROUP_JENIS = [
        '01' => 'Hasil Audit Inspektorat',
        '02' => 'Hasil Audit BPKP',
        '03' => 'Hasil Audit BPK',
        '05' => 'Hasil Audit Inspektorat Provinsi',
        '08' => 'Hasil Audit Itjen Kemendagri',
    ];

    /** Jenis Pemeriksaan (untuk group 01 Inspektorat). */
    public const JENIS = [
        '0101' => 'Audit Operasional',
        '0102' => 'Audit Komprehensif',
        '0103' => 'Reviu Laporan Keuangan',
        '0104' => 'Evaluasi LAKIP',
        '0199' => 'Audit Lainnya',
    ];

    /** Group Temuan. */
    public const GROUP_TEMUAN = [
        '00' => 'Belum Didefinisikan',
        '01' => 'Kejadian yang Merugikan Negara dan Masyarakat',
        '02' => 'Kewajiban Penyetoran kepada Negara',
        '03' => 'Pelanggaran terhadap Peraturan Perundang-undangan',
        '04' => 'Pelanggaran terhadap Prosedur dan Tata Kerja',
        '05' => 'Penyimpangan dari Ketentuan Pelaksanaan Anggaran',
        '06' => 'Hambatan terhadap Kelancaran Proyek',
        '07' => 'Hambatan terhadap Kelancaran Tugas Pokok',
        '08' => 'Kelemahan Administrasi (Tata Usaha/Akuntansi)',
        '09' => 'Ketidaklancaran Pelayanan kepada Masyarakat',
        '10' => 'Temuan Pemeriksaan Lainnya',
    ];

    /** Group Penyebab. */
    public const GROUP_SEBAB = [
        '00' => 'Penyebab Tidak/Belum Didefinisikan',
        '01' => 'Kelemahan Pengawasan Melekat',
        '02' => 'Kelemahan dalam Kebijakan/Kebijaksanaan',
        '03' => 'Kelemahan dalam Rencana',
        '04' => 'Kelemahan dalam Prosedur',
        '05' => 'Kelemahan dalam Pencatatan dan Pelaporan',
        '06' => 'Kelemahan dalam Pembinaan Personil',
        '07' => 'Kelemahan dalam Pengawasan Intern (Internal Review)',
        '08' => 'Kelemahan Pengawasan terhadap Rekanan',
        '09' => 'Penyebab Ekstern Hambatan Kelancaran Proyek',
        '10' => 'Penyebab Ekstern Hambatan Kelancaran Tugas Pokok Instansi',
    ];

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

    /** Semua daftar untuk dikirim ke formulir React. */
    public static function untukFormulir(): array
    {
        return [
            'group_jenis' => self::peta(self::GROUP_JENIS),
            'jenis' => self::peta(self::JENIS),
            'group_temuan' => self::peta(self::GROUP_TEMUAN),
            'group_sebab' => self::peta(self::GROUP_SEBAB),
            'bidang_unit' => self::BIDANG_UNIT,
            'inspektorat_default' => self::INSPEKTORAT_DEFAULT,
        ];
    }

    /** Label untuk kode group (dipakai halaman baca); kosong bila tak dikenal. */
    public static function label(string $jenis, ?string $kode): ?string
    {
        if ($kode === null || $kode === '') {
            return null;
        }
        $peta = match ($jenis) {
            'group_jenis' => self::GROUP_JENIS,
            'jenis' => self::JENIS,
            'group_temuan' => self::GROUP_TEMUAN,
            'group_sebab' => self::GROUP_SEBAB,
            default => [],
        };

        return $peta[$kode] ?? null;
    }

    /** @param  array<int|string, string>  $peta */
    private static function peta(array $peta): array
    {
        return collect($peta)->map(fn ($nama, $kode) => ['kode' => (string) $kode, 'nama' => $nama])->values()->all();
    }
}
