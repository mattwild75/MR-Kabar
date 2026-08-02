<?php

use App\Http\Controllers\IroPdController;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Merapikan kolom TAHAP pada III_b_IRO_PD ke delapan tahap baku aplikasi.
     *
     * Kolom ini disediakan sebagai pilihan tertutup, tetapi data yang terlanjur
     * masuk berisi 35 nilai berbeda dari 155 baris — 24 di antaranya dipakai
     * sekali saja. Termasuk salah ketik ("pelaksanaan admiistrasi umum"),
     * kalimat penuh ("Pengajuan SPM gaji & penerbitan SP2D internal BPKD"),
     * dan gabungan beberapa tahap sekaligus. Akibatnya pengelompokan menurut
     * tahap tidak bermakna dan Form Cetak 3c menampilkan istilah yang tidak
     * seragam antar perangkat daerah.
     *
     * Aturan pemetaannya sengaja konservatif:
     *
     *   - Nilai yang sudah baku dibiarkan apa adanya.
     *   - Nilai berawalan "Tahap " dipangkas awalannya.
     *   - Nilai yang jelas satu tahap dipetakan ke tahap itu, termasuk yang
     *     salah ketik.
     *   - Nilai yang menyebut BEBERAPA tahap diambil yang PALING AWAL dalam
     *     siklus, karena di situlah risikonya mulai terbentuk.
     *   - Nilai yang benar-benar tidak bisa dipastikan TIDAK dikarang. Ia
     *     dipetakan ke Pelaksanaan — tahap paling umum — dan teks aslinya
     *     disimpan di belakangnya dalam kurung, supaya tidak ada keterangan
     *     yang hilang dan penilainya bisa membetulkan sendiri.
     *
     * Nilai asli seluruh baris yang diubah dicatat ke tabel sementara
     * `tbl_iro_pd_tahap_asli`, supaya perapian ini bisa ditinjau atau dibatalkan.
     */
    public function up(): void
    {
        if (! DB::getSchemaBuilder()->hasTable('tbl_iro_pd_tahap_asli')) {
            DB::statement('CREATE TABLE tbl_iro_pd_tahap_asli (
                iro_pd_id BIGINT UNSIGNED NOT NULL PRIMARY KEY,
                tahap_asli TEXT NULL,
                dirapikan_pada TIMESTAMP NULL
            )');
        }

        $baku = IroPdController::TAHAP_OPTIONS;
        $bakuLower = array_map('mb_strtolower', $baku);

        // Kata kunci -> tahap baku. Diurutkan dari yang paling khas ke yang
        // paling umum, karena kalimat panjang sering memuat beberapa kata
        // kunci sekaligus dan yang pertama cocok harus yang paling menentukan.
        $petunjuk = [
            'penatausahaan' => 'Penatausahaan',
            'pengadaan' => 'Pengadaan',
            'penganggaran' => 'Penganggaran',
            'rka' => 'Penganggaran',
            'anggaran' => 'Penganggaran',
            'perencanaan' => 'Perencanaan',
            'rencana' => 'Perencanaan',
            'penyusunan' => 'Perencanaan',
            'pengumpulan data' => 'Perencanaan',
            'kebutuhan' => 'Perencanaan',
            'pengawasan' => 'Pengawasan',
            'pemeriksaan' => 'Pengawasan',
            'audit' => 'Pengawasan',
            'monitoring' => 'Pemantauan dan Evaluasi',
            'pemantauan' => 'Pemantauan dan Evaluasi',
            'evaluasi' => 'Pemantauan dan Evaluasi',
            'pelaporan' => 'Pertanggungjawaban / Pelaporan',
            'pertanggungjawaban' => 'Pertanggungjawaban / Pelaporan',
            'spm' => 'Penatausahaan',
            'sp2d' => 'Penatausahaan',
            'penyaluran' => 'Pelaksanaan',
            'pemungutan' => 'Pelaksanaan',
            'operasional' => 'Pelaksanaan',
            'pemeliharaan' => 'Pelaksanaan',
            'pelaksanaan' => 'Pelaksanaan',
            'pengendalian' => 'Pelaksanaan',
        ];

        // Urutan siklus, dipakai memilih tahap paling awal saat sebuah nilai
        // menyebut beberapa tahap sekaligus.
        $urutan = array_flip($baku);

        foreach (DB::table('tbl_iro_pd')->select('id', 'TAHAP')->get() as $baris) {
            $asli = (string) ($baris->TAHAP ?? '');
            if (trim($asli) === '') {
                continue;
            }

            $bersih = trim(preg_replace('/\s+/', ' ', $asli));
            $tanpaAwalan = preg_replace('/^tahap\s+/i', '', $bersih);

            // Sudah baku - tidak disentuh.
            if (in_array(mb_strtolower($tanpaAwalan), $bakuLower, true)) {
                $hasil = $baku[array_search(mb_strtolower($tanpaAwalan), $bakuLower, true)];
                if ($hasil === $bersih) {
                    continue;
                }
            } else {
                $rendah = mb_strtolower($bersih);
                $cocok = [];
                foreach ($petunjuk as $kata => $tahap) {
                    if (str_contains($rendah, $kata)) {
                        $cocok[] = $tahap;
                    }
                }
                if ($cocok) {
                    // Beberapa tahap disebut sekaligus: diambil yang paling
                    // awal dalam siklus, karena di situ risikonya terbentuk.
                    usort($cocok, fn ($a, $b) => $urutan[$a] <=> $urutan[$b]);
                    $hasil = $cocok[0];
                } else {
                    // Tidak bisa dipastikan - tidak dikarang, teks aslinya
                    // ikut disimpan supaya penilainya bisa membetulkan.
                    $hasil = 'Pelaksanaan (' . $bersih . ')';
                }
            }

            DB::table('tbl_iro_pd_tahap_asli')->updateOrInsert(
                ['iro_pd_id' => $baris->id],
                ['tahap_asli' => $asli, 'dirapikan_pada' => now()],
            );
            DB::table('tbl_iro_pd')->where('id', $baris->id)->update(['TAHAP' => $hasil]);
        }
    }

    public function down(): void
    {
        if (! DB::getSchemaBuilder()->hasTable('tbl_iro_pd_tahap_asli')) {
            return;
        }
        foreach (DB::table('tbl_iro_pd_tahap_asli')->get() as $b) {
            DB::table('tbl_iro_pd')->where('id', $b->iro_pd_id)->update(['TAHAP' => $b->tahap_asli]);
        }
        DB::statement('DROP TABLE tbl_iro_pd_tahap_asli');
    }
};
