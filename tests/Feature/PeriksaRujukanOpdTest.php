<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/**
 * Penjaga temuan R-08 — pendeteksi rujukan OPD yang meleset.
 *
 * Tabel risiko menyimpan NAMA OPD sebagai teks, bukan `opd_id`, sehingga basis
 * data tidak bisa menolak nama yang salah. Perintah `rujukan:periksa` yang
 * mengambil alih penolakan itu.
 *
 * Dua sifat yang menentukan berguna atau tidaknya, dan keduanya diuji di sini:
 *
 *   1. Menangkap nama yang memang tidak ada di daftar OPD resmi.
 *   2. TIDAK menuduh yang wajar. Ini yang hampir salah: sebagian kolom memuat
 *      DAFTAR OPD — beberapa baris berawalan "> " dalam satu sel — bukan satu
 *      nama. Versi pertama perintah ini membaca seluruh daftar sebagai satu
 *      nama dan melaporkan 250 baris "yatim" yang sebenarnya utuh. Pendeteksi
 *      yang berteriak sesering itu akan berhenti dipercaya, dan pendeteksi yang
 *      tidak dipercaya sama tak bergunanya dengan yang tidak ada.
 */
class PeriksaRujukanOpdTest extends TestCase
{
    use RefreshDatabase;

    private function opd(string ...$nama): void
    {
        foreach ($nama as $satu) {
            DB::table('opd')->insert(['nama' => $satu, 'created_at' => now(), 'updated_at' => now()]);
        }
    }

    private function irsPemda(array $isi): void
    {
        // Tanpa created_at/updated_at: tabel ini memang tidak punya timestamps.
        DB::table('tbl_krs_irs_pemda')->insert($isi);
    }

    public function test_nama_yang_ada_di_daftar_dinyatakan_utuh(): void
    {
        $this->opd('DINAS KESEHATAN');
        $this->irsPemda(['OPD_PENANGGUNGJAWAB_PROGRAM' => 'DINAS KESEHATAN']);

        $this->artisan('rujukan:periksa')->assertSuccessful();
    }

    public function test_nama_yang_tidak_ada_di_daftar_tertangkap(): void
    {
        $this->opd('DINAS KESEHATAN');
        $this->irsPemda(['OPD_PENANGGUNGJAWAB_PROGRAM' => 'DINAS KESEHATAN KABUPATEN']);

        $this->artisan('rujukan:periksa')->assertFailed();
    }

    /**
     * Sel berisi DAFTAR, bukan satu nama. Inilah yang salah dibaca pada versi
     * pertama, dan alasan utama tes ini ada.
     */
    public function test_sel_berisi_daftar_diperiksa_per_butir(): void
    {
        $this->opd('DINAS KESEHATAN', 'INSPEKTORAT');
        $this->irsPemda([
            'OPD_IK_SASARAN_RPJMD' => "> DINAS KESEHATAN\n> INSPEKTORAT",
        ]);

        $this->artisan('rujukan:periksa')->assertSuccessful();
    }

    public function test_satu_butir_salah_di_tengah_daftar_tetap_tertangkap(): void
    {
        $this->opd('DINAS KESEHATAN', 'INSPEKTORAT');
        $this->irsPemda([
            'OPD_IK_SASARAN_RPJMD' => "> DINAS KESEHATAN\n> DINAS YANG TIDAK ADA\n> INSPEKTORAT",
        ]);

        $this->artisan('rujukan:periksa')->assertFailed();
    }

    /** "Tidak Ada Data" adalah penanda kosong, bukan nama OPD yang hilang. */
    public function test_penanda_tidak_ada_data_bukan_yatim(): void
    {
        $this->opd('DINAS KESEHATAN');
        $this->irsPemda(['OPD_IK_TUJUAN_RPJMD' => '> Tidak Ada Data']);

        $this->artisan('rujukan:periksa')->assertSuccessful();
    }

    /**
     * Beda kapitalisasi bukan nama yatim, tetapi tetap dilaporkan: penggabungan
     * data di aplikasi mengabaikan kapitalisasi justru karena ini, dan kunci
     * asing kelak menuntut nilainya sama persis.
     */
    public function test_beda_kapitalisasi_dilaporkan_tanpa_disebut_yatim(): void
    {
        $this->opd('DINAS KESEHATAN');
        $this->irsPemda(['OPD_PENANGGUNGJAWAB_PROGRAM' => 'Dinas Kesehatan']);

        $this->artisan('rujukan:periksa')
            ->expectsOutputToContain('kapitalisasi')
            ->assertFailed();
    }

    public function test_daftar_opd_kosong_dilaporkan_bukan_dianggap_bersih(): void
    {
        $this->irsPemda(['OPD_PENANGGUNGJAWAB_PROGRAM' => 'DINAS KESEHATAN']);

        $this->artisan('rujukan:periksa')->assertFailed();
    }
}
