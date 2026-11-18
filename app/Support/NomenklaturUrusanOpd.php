<?php

namespace App\Support;

/**
 * Isian bawaan "Urusan / Unsur Pemerintahan" dan "Bidang Urusan / Bidang
 * Unsur" pada Data Umum untuk 49 SKPK Kabupaten Aceh Barat.
 *
 * Susunannya mengikuti klasifikasi Permendagri 90/2019 (dimutakhirkan
 * Kepmendagri tentang nomenklatur perencanaan), yang juga dipakai SIPD:
 *
 *   1  Urusan Pemerintahan Wajib yang Berkaitan dengan Pelayanan Dasar
 *   2  Urusan Pemerintahan Wajib yang Tidak Berkaitan dengan Pelayanan Dasar
 *   3  Urusan Pemerintahan Pilihan
 *   4  Unsur Pendukung Urusan Pemerintahan       (Sekretariat Daerah, Sekretariat DPRK)
 *   5  Unsur Penunjang Urusan Pemerintahan       (perencanaan, keuangan, kepegawaian, ...)
 *   6  Unsur Pengawasan Urusan Pemerintahan      (Inspektorat Daerah)
 *   7  Unsur Kewilayahan                         (Kecamatan)
 *   8  Unsur Pemerintahan Umum                   (Kesatuan Bangsa dan Politik)
 *
 * SKPK kekhususan Aceh (UU 11/2006: Syariat Islam, Pendidikan Dayah,
 * Baitul Mal, MAA, MPU, MPD) diberi "Urusan Keistimewaan dan Kekhususan
 * Aceh"; penggolongan resminya sebaiknya dicocokkan dengan DPA SKPK itu.
 *
 * Kedudukannya BAWAAN, bukan ketetapan: hanya mengisi kolom yang masih
 * kosong, dan PIC tetap bisa mengubahnya. SKPK yang memegang beberapa
 * bidang menuliskannya berurutan, dipisah titik koma, dengan urusan utama
 * sebagai Urusan / Unsur.
 */
class NomenklaturUrusanOpd
{
    public const WAJIB_DASAR = 'Urusan Pemerintahan Wajib yang Berkaitan dengan Pelayanan Dasar';

    public const WAJIB_NON_DASAR = 'Urusan Pemerintahan Wajib yang Tidak Berkaitan dengan Pelayanan Dasar';

    public const PILIHAN = 'Urusan Pemerintahan Pilihan';

    public const PENDUKUNG = 'Unsur Pendukung Urusan Pemerintahan';

    public const PENUNJANG = 'Unsur Penunjang Urusan Pemerintahan';

    public const PENGAWASAN = 'Unsur Pengawasan Urusan Pemerintahan';

    public const KEWILAYAHAN = 'Unsur Kewilayahan';

    public const PEMERINTAHAN_UMUM = 'Unsur Pemerintahan Umum';

    public const KEKHUSUSAN_ACEH = 'Urusan Keistimewaan dan Kekhususan Aceh';

    /** @var array<string, array{0:string, 1:string}> nama OPD (huruf besar) => [urusan/unsur, bidang] */
    private const PETA = [
        'BADAN KEPEGAWAIAN DAN PENGEMBANGAN SUMBER DAYA MANUSIA' => [self::PENUNJANG, 'Kepegawaian; Pendidikan dan Pelatihan'],
        'BADAN KESATUAN BANGSA DAN POLITIK' => [self::PEMERINTAHAN_UMUM, 'Kesatuan Bangsa dan Politik'],
        'BADAN PENANGGULANGAN BENCANA DAERAH' => [self::WAJIB_DASAR, 'Ketenteraman dan Ketertiban Umum serta Pelindungan Masyarakat (Sub Urusan Bencana)'],
        'BADAN PENGELOLAAN KEUANGAN DAERAH' => [self::PENUNJANG, 'Keuangan'],
        'BADAN PERENCANAAN PEMBANGUNAN DAERAH' => [self::PENUNJANG, 'Perencanaan; Penelitian dan Pengembangan'],
        'BLUD RSUD CUT NYAK DHIEN' => [self::WAJIB_DASAR, 'Kesehatan'],
        'DINAS KELAUTAN DAN PERIKANAN' => [self::PILIHAN, 'Kelautan dan Perikanan'],
        'DINAS KEPENDUDUKAN DAN PENCATATAN SIPIL' => [self::WAJIB_NON_DASAR, 'Administrasi Kependudukan dan Pencatatan Sipil'],
        'DINAS KESEHATAN' => [self::WAJIB_DASAR, 'Kesehatan'],
        'DINAS KOMUNIKASI INFORMATIKA DAN PERSANDIAN' => [self::WAJIB_NON_DASAR, 'Komunikasi dan Informatika; Statistik; Persandian'],
        'DINAS LINGKUNGAN HIDUP' => [self::WAJIB_NON_DASAR, 'Lingkungan Hidup'],
        'DINAS PANGAN' => [self::WAJIB_NON_DASAR, 'Pangan'],
        'DINAS PARIWISATA PEMUDA DAN OLAHRAGA' => [self::PILIHAN, 'Pariwisata; Kepemudaan dan Olahraga'],
        'DINAS PEKERJAAN UMUM DAN PENATAAN RUANG' => [self::WAJIB_DASAR, 'Pekerjaan Umum dan Penataan Ruang'],
        'DINAS PEMBERDAYAAN MASYARAKAT DAN GAMPONG' => [self::WAJIB_NON_DASAR, 'Pemberdayaan Masyarakat dan Desa'],
        'DINAS PEMBERDAYAAN PEREMPUAN PERLINDUNGAN ANAK DAN KELUARGA BERENCANA' => [self::WAJIB_NON_DASAR, 'Pemberdayaan Perempuan dan Pelindungan Anak; Pengendalian Penduduk dan Keluarga Berencana'],
        'DINAS PENANAMAN MODAL DAN PELAYANAN TERPADU SATU PINTU' => [self::WAJIB_NON_DASAR, 'Penanaman Modal'],
        'DINAS PENDIDIKAN DAN KEBUDAYAAN' => [self::WAJIB_DASAR, 'Pendidikan; Kebudayaan'],
        'DINAS PENDIDIKAN DAYAH' => [self::KEKHUSUSAN_ACEH, 'Pendidikan Dayah'],
        'DINAS PERDAGANGAN PERINDUSTRIAN KOPERASI DAN USAHA KECIL DAN MENENGAH' => [self::PILIHAN, 'Perdagangan; Perindustrian; Koperasi, Usaha Kecil, dan Menengah'],
        'DINAS PERHUBUNGAN' => [self::WAJIB_NON_DASAR, 'Perhubungan'],
        'DINAS PERKEBUNAN DAN PETERNAKAN' => [self::PILIHAN, 'Pertanian (Perkebunan dan Peternakan)'],
        'DINAS PERPUSTAKAAN DAN KEARSIPAN' => [self::WAJIB_NON_DASAR, 'Perpustakaan; Kearsipan'],
        'DINAS PERTANAHAN' => [self::WAJIB_NON_DASAR, 'Pertanahan'],
        'DINAS PERTANIAN TANAMAN PANGAN DAN HORTIKULTURA' => [self::PILIHAN, 'Pertanian (Tanaman Pangan dan Hortikultura)'],
        'DINAS PERUMAHAN RAKYAT DAN KAWASAN PERMUKIMAN' => [self::WAJIB_DASAR, 'Perumahan dan Kawasan Permukiman'],
        'DINAS SOSIAL' => [self::WAJIB_DASAR, 'Sosial'],
        'DINAS SYARIAT ISLAM' => [self::KEKHUSUSAN_ACEH, 'Syariat Islam'],
        'DINAS TRANSMIGRASI DAN TENAGA KERJA' => [self::WAJIB_NON_DASAR, 'Tenaga Kerja; Transmigrasi'],
        'INSPEKTORAT' => [self::PENGAWASAN, 'Inspektorat Daerah'],
        'SATUAN POLISI PAMONG PRAJA DAN WILAYATUL HISBAH' => [self::WAJIB_DASAR, 'Ketenteraman dan Ketertiban Umum serta Pelindungan Masyarakat; Wilayatul Hisbah'],
        'SEKRETARIAT BAITUL MAL KABUPATEN' => [self::KEKHUSUSAN_ACEH, 'Baitul Mal'],
        'SEKRETARIAT DAERAH' => [self::PENDUKUNG, 'Sekretariat Daerah'],
        'SEKRETARIAT DPRK' => [self::PENDUKUNG, 'Sekretariat DPRK'],
        'SEKRETARIAT MAJELIS ADAT ACEH' => [self::KEKHUSUSAN_ACEH, 'Majelis Adat Aceh'],
        'SEKRETARIAT MAJELIS PEMUSYAWARATAN ULAMA' => [self::KEKHUSUSAN_ACEH, 'Majelis Permusyawaratan Ulama'],
        'SEKRETARIAT MAJELIS PENDIDIKAN DAERAH' => [self::KEKHUSUSAN_ACEH, 'Majelis Pendidikan Daerah'],
    ];

    /**
     * @return array{urusan:string, bidang:string}|null null bila nama SKPK tidak dikenal
     */
    public static function untuk(?string $namaOpd): ?array
    {
        $kunci = mb_strtoupper(trim(preg_replace('/\s+/', ' ', (string) $namaOpd)));
        if ($kunci === '') {
            return null;
        }
        if (str_starts_with($kunci, 'KECAMATAN ')) {
            return ['urusan' => self::KEWILAYAHAN, 'bidang' => 'Kecamatan'];
        }
        $isi = self::PETA[$kunci] ?? null;

        return $isi ? ['urusan' => $isi[0], 'bidang' => $isi[1]] : null;
    }

    /**
     * Teks satu baris untuk kepala Form Cetak: "Bidang (Urusan/Unsur)".
     * Isian Data Umum didahulukan; bawaan dipakai hanya untuk bagian yang kosong.
     */
    public static function untukCetak(?string $urusan, ?string $bidang, ?string $namaOpd): ?string
    {
        $bawaan = self::untuk($namaOpd);
        $urusan = filled($urusan) ? trim($urusan) : ($bawaan['urusan'] ?? null);
        $bidang = filled($bidang) ? trim($bidang) : ($bawaan['bidang'] ?? null);

        if ($urusan && $bidang) {
            return "{$bidang} ({$urusan})";
        }

        return $urusan ?: $bidang;
    }
}
