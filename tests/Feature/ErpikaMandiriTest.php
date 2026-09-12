<?php

namespace Tests\Feature;

use App\Console\Commands\ErpikaEkspor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Tests\TestCase;

/**
 * Penjaga pemisahan ERPIKA: tabel ERPIKA tidak boleh punya kunci asing ke
 * tabel MR Kabar (dan sebaliknya), dan setiap tabel bernama rpp_... atau employees
 * harus terdaftar di ErpikaEkspor::TABEL supaya ikut terbawa saat kelak
 * dipindah ke erpika.acehbaratkab.go.id.
 */
class ErpikaMandiriTest extends TestCase
{
    use RefreshDatabase;

    public function test_tabel_erpika_tidak_bertaut_kunci_asing_ke_tabel_mr_kabar(): void
    {
        $db = DB::getDatabaseName();
        $fk = DB::select('SELECT table_name t, referenced_table_name r FROM information_schema.key_column_usage WHERE table_schema = ? AND referenced_table_name IS NOT NULL', [$db]);
        $erpika = ErpikaEkspor::TABEL;
        $pelanggaran = [];
        foreach ($fk as $k) {
            $dariErpika = in_array($k->t, $erpika, true);
            $keErpika = in_array($k->r, $erpika, true);
            if ($dariErpika !== $keErpika) {
                $pelanggaran[] = "{$k->t} -> {$k->r}";
            }
        }
        $this->assertSame([], $pelanggaran, 'Kunci asing lintas ERPIKA/MR Kabar: '.implode(', ', $pelanggaran));
    }

    public function test_semua_tabel_erpika_terdaftar_untuk_ekspor(): void
    {
        $db = DB::getDatabaseName();
        $ada = collect(DB::select('SELECT table_name t FROM information_schema.tables WHERE table_schema = ?', [$db]))->pluck('t')
            ->filter(fn ($t) => str_starts_with($t, 'rpp_') || in_array($t, ['rpps', 'employees'], true))->values()->all();
        sort($ada);
        $daftar = ErpikaEkspor::TABEL;
        sort($daftar);
        $this->assertSame($ada, $daftar);
    }

    public function test_ekspor_menghasilkan_sql_yang_bisa_dimuat_ulang(): void
    {
        $tujuan = storage_path('framework/testing/erpika-uji.sql');
        $this->artisan('erpika:ekspor', ['--tujuan' => $tujuan])->assertSuccessful();
        $sql = File::get($tujuan);
        File::delete($tujuan);
        $this->assertStringContainsString('CREATE TABLE `rpps`', $sql);
        $this->assertStringContainsString('CREATE TABLE `rpp_penugasan`', $sql);
    }
}
