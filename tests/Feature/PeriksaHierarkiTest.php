<?php

namespace Tests\Feature;

use App\Console\Commands\PeriksaHierarki;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/**
 * Penjaga temuan R-09 — pendeteksi simpul hierarki yang pecah.
 *
 * Hierarki disimpan sebagai teks berulang di tiap baris, bukan tautan
 * induk-anak. Mengubah teks satu simpul pada sebagian baris memecahnya jadi
 * dua di pohon, tanpa galat apa pun. Perintah `hierarki:periksa` menjadikan
 * pecahnya terlihat.
 *
 * Yang diuji bukan sekadar "perintahnya jalan", melainkan dua sifat yang
 * menentukan berguna atau tidaknya:
 *
 *   1. Menangkap yang memang pecah.
 *   2. TIDAK menuduh yang wajar. Dua kegiatan bernama mirip di bawah dua
 *      program berbeda adalah dua simpul yang sah — pendeteksi yang berteriak
 *      untuk itu akan berhenti dipercaya, dan pendeteksi yang tidak dipercaya
 *      sama tak bergunanya dengan yang tidak ada.
 */
class PeriksaHierarkiTest extends TestCase
{
    use RefreshDatabase;

    private function baris(array $isi): void
    {
        DB::table('tbl_krs_pemda')->insert($isi + ['created_at' => now(), 'updated_at' => now()]);
    }

    public function test_hierarki_utuh_dinyatakan_lulus(): void
    {
        $this->baris(['VISI' => 'Visi A', 'MISI' => 'Misi 1 : Satu']);
        $this->baris(['VISI' => 'Visi A', 'MISI' => 'Misi 1 : Satu']);

        $this->artisan('hierarki:periksa', ['--tabel' => 'tbl_krs_pemda'])->assertSuccessful();
    }

    /** Satu simpul ditulis dua cara di bawah induk yang sama = pecah. */
    public function test_simpul_yang_pecah_terdeteksi(): void
    {
        $this->baris(['VISI' => 'Visi A', 'MISI' => 'Misi 1 : Satu']);
        $this->baris(['VISI' => 'Visi A', 'MISI' => 'Satu']);

        $this->artisan('hierarki:periksa', ['--tabel' => 'tbl_krs_pemda'])
            ->expectsOutputToContain('PECAH')
            ->assertFailed();
    }

    /**
     * Nama mirip di bawah induk BERBEDA bukan pecah.
     *
     * Ini bukan kasus karangan: pada data sungguhan, "Perencanaan,
     * Penganggaran, dan Evaluasi Kinerja Perangkat Daerah" muncul di bawah
     * "Program Pengelolaan Keuangan Daerah" sekaligus "Program Penunjang
     * Urusan Pemerintahan Daerah" — dua kegiatan yang sah.
     */
    public function test_nama_mirip_di_bawah_induk_berbeda_tidak_dituduh_pecah(): void
    {
        $this->baris(['VISI' => 'Visi A', 'MISI' => 'Misi 1 : Satu']);
        $this->baris(['VISI' => 'Visi B', 'MISI' => 'Satu']);

        $this->artisan('hierarki:periksa', ['--tabel' => 'tbl_krs_pemda'])->assertSuccessful();
    }

    /**
     * Induk kosong dilaporkan sebagai KETERANGAN, bukan kegagalan.
     *
     * Sebagian di antaranya wajar — program penunjang memang tidak bertaut ke
     * sasaran mana pun. Menjadikannya kegagalan akan membuat perintah ini
     * selalu merah pada data yang sehat.
     */
    public function test_induk_kosong_tidak_menjatuhkan_vonis(): void
    {
        $this->baris(['VISI' => null, 'MISI' => 'Misi 1 : Satu']);

        $this->artisan('hierarki:periksa', ['--tabel' => 'tbl_krs_pemda'])
            ->expectsOutputToContain('induknya kosong')
            ->assertSuccessful();
    }

    /** Awalan penomoran dibuang saat membandingkan — itu yang membuat pecahnya terlihat. */
    public function test_awalan_penomoran_diabaikan_saat_membandingkan(): void
    {
        $this->assertSame(
            PeriksaHierarki::kunci('Misi 6 : Mengembangkan dan Melestarikan Budaya Aceh'),
            PeriksaHierarki::kunci('Mengembangkan dan Melestarikan Budaya Aceh'),
        );

        $this->assertSame(
            PeriksaHierarki::kunci('2.1 Pengelolaan Persampahan'),
            PeriksaHierarki::kunci('1.1 Pengelolaan Persampahan'),
        );

        // Dan tidak menyamakan dua hal yang memang berbeda.
        $this->assertNotSame(
            PeriksaHierarki::kunci('Pengelolaan Persampahan'),
            PeriksaHierarki::kunci('Pengelolaan Air Limbah'),
        );
    }
}
