<?php

use App\Models\Opd;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /** Kolom pada 1a yang memuat nama perangkat daerah. */
    private const KOLOM = [
        'OPD IK TUJUAN RPJMD',
        'OPD IK SASARAN RPJMD',
        'OPD IK PROGRAM',
        'OPD PENANGGUNGJAWAB PROGRAM',
    ];

    /**
     * Menyeragamkan ejaan nama perangkat daerah pada 1a KRS Pemda dengan
     * daftar resmi di Keterangan Pendukung.
     *
     * Isinya sudah benar sejak awal — pemeriksaan menemukan NOL nama yang tidak
     * dikenal, jadi tidak ada yang perlu ditebak atau diputuskan. Yang berbeda
     * hanya ejaannya: "Dinas Sosial" berdampingan dengan "DINAS TRANSMIGRASI
     * DAN TENAGA KERJA" di kolom yang sama, karena isinya berasal dari beberapa
     * gelombang pengisian dengan gaya penulisan berbeda.
     *
     * Ketidakseragaman itu bukan sekadar soal rapi. Penyaring perangkat daerah
     * pada 1a mencocokkan teks, pengelompokan menghitung nama sebagai kunci,
     * dan kotak centang pemilih perangkat daerah harus bisa menandai nama yang
     * sudah tersimpan — ketiganya menuntut ejaan yang sama persis.
     *
     * Dua tabel serumpun, tbl_krs_pd dan tbl_kro_pd, TIDAK disentuh: keduanya
     * sudah memakai ejaan resmi seluruhnya (0 dari 31 nama berbeda).
     *
     * Nilai asli tiap baris dicatat supaya bisa dibatalkan.
     */
    public function up(): void
    {
        if (! DB::getSchemaBuilder()->hasTable('tbl_krs_pemda_opd_asli')) {
            DB::statement('CREATE TABLE tbl_krs_pemda_opd_asli (
                baris_id BIGINT UNSIGNED NOT NULL,
                kolom VARCHAR(64) NOT NULL,
                nilai_asli TEXT NULL,
                diubah_pada TIMESTAMP NULL,
                PRIMARY KEY (baris_id, kolom)
            )');
        }

        // Peta ejaan: bentuk baku huruf besar -> ejaan resmi.
        $peta = [];
        foreach (Opd::pluck('nama') as $nama) {
            $peta[$this->baku($nama)] = $nama;
        }

        $diubah = 0;
        foreach (DB::table('tbl_krs_pemda')->get(array_merge(['id'], self::KOLOM)) as $baris) {
            foreach (self::KOLOM as $kolom) {
                $asli = (string) ($baris->$kolom ?? '');
                if (trim($asli) === '') {
                    continue;
                }

                // Satu sel bisa memuat beberapa nama, dipisah baris baru.
                // Pemisahnya dipertahankan apa adanya supaya urutan dan
                // pasangannya dengan kolom indikator tidak bergeser.
                $baru = implode("\n", array_map(function ($n) use ($peta) {
                    $bersih = trim($n);

                    return $peta[$this->baku($bersih)] ?? $n;
                }, preg_split('/\r?\n/', $asli)));

                if ($baru === $asli) {
                    continue;
                }

                DB::table('tbl_krs_pemda_opd_asli')->updateOrInsert(
                    ['baris_id' => $baris->id, 'kolom' => $kolom],
                    ['nilai_asli' => $asli, 'diubah_pada' => now()],
                );
                DB::table('tbl_krs_pemda')->where('id', $baris->id)->update([$kolom => $baru]);
                $diubah++;
            }
        }

        echo "  ejaan nama perangkat daerah diseragamkan pada {$diubah} sel\n";
    }

    public function down(): void
    {
        if (! DB::getSchemaBuilder()->hasTable('tbl_krs_pemda_opd_asli')) {
            return;
        }
        foreach (DB::table('tbl_krs_pemda_opd_asli')->get() as $b) {
            DB::table('tbl_krs_pemda')->where('id', $b->baris_id)->update([$b->kolom => $b->nilai_asli]);
        }
        DB::statement('DROP TABLE tbl_krs_pemda_opd_asli');
    }

    /** Bentuk pembanding: huruf besar, spasi tunggal, tanpa spasi tepi. */
    private function baku(string $s): string
    {
        return mb_strtoupper(trim(preg_replace('/\s+/', ' ', $s)));
    }
};
