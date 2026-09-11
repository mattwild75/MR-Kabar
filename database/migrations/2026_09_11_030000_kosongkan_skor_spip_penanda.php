<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Mengosongkan skor maturitas SPIP yang selama ini hanya penanda.
 *
 * MASALAHNYA. Seluruh 49 Perangkat Daerah tercatat dengan skor SPIP 2,50 dan
 * Level Kematangan MR 2 — angka yang persis sama untuk semuanya, bersumber
 * "maturitas SPIP pemda". Angka itu tidak pernah berasal dari penilaian mana
 * pun; ia diisi sebagai penanda saat modul PKPT dibangun, lalu tertinggal dan
 * tampil di dasbor, di kertas kerja F3, dan di pembobotan register seolah hasil
 * penjaminan kualitas BPKP. Temuan audit Agustus 2026 yang paling mendesak.
 *
 * KENAPA DIKOSONGKAN, BUKAN DIGANTI ANGKA LAIN. Skor maturitas SPIP Kabupaten
 * Aceh Barat yang sesungguhnya tidak tersedia di sumber publik mana pun (dicari
 * 11 September 2026; yang ada hanya Aceh Barat Daya, kabupaten lain). Mengganti
 * 2,50 dengan angka lain sama saja mengarang. Kosong adalah satu-satunya nilai
 * yang jujur sampai hasil BPKP diterima.
 *
 * SISTEMNYA SUDAH SIAP MENERIMA KOSONG. `level_mr` nullable, perhitungan PKPT
 * memakai akses nullsafe, dan PkptKesiapanService melaporkan "kematangan belum
 * ditetapkan" sebagai kekurangan kesiapan — bukan galat. Begitu skor aslinya
 * ada, tombol "Adopsi Skor SPIP" di halaman Kematangan MR mengisi seluruhnya
 * sekali jalan, dengan sumbernya tercatat.
 *
 * Baris yang sumbernya `penilaian_inspektorat` atau `maturitas_spip_skpk`
 * TIDAK disentuh: itu penilaian sungguhan per satuan kerja, kalau ada.
 */
return new class extends Migration
{
    private const KETERANGAN = 'Belum ditetapkan. Skor 2,50 sebelumnya hanya penanda saat modul dibangun, bukan hasil penjaminan kualitas BPKP; dikosongkan 11 September 2026. Isi lewat "Adopsi Skor SPIP" begitu hasil resminya diterima.';

    public function up(): void
    {
        DB::table('pkpt_kematangan_mr')
            ->where('sumber_penetapan', 'maturitas_spip_pemda')
            ->where('skor_spip', 2.50)
            ->update([
                'level_mr' => null,
                'skor_spip' => null,
                'bobot_register' => null,
                'bobot_faktor' => null,
                'strategi_pengawasan' => null,
                'keterangan' => self::KETERANGAN,
            ]);
    }

    public function down(): void
    {
        // Sengaja tidak mengembalikan 2,50 — memulihkan angka karangan bukan
        // "pemulihan". Kalau perlu nilai sementara, pakai tombol Adopsi Skor
        // SPIP secara sadar.
    }
};
