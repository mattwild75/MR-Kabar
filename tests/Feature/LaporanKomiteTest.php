<?php

namespace Tests\Feature;

use App\Models\LaporanNarasi;
use App\Models\Opd;
use App\Models\PengaturanPemda;
use App\Models\StrukturPengelolaRisiko;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Form 14 — Laporan Pembinaan Komite Pengelolaan Risiko.
 *
 * Perdep PPKD 4/2019 halaman berlabel 148 menyebut tugas ketiga Komite:
 * "Membuat laporan semesteran dan tahunan kegiatan pembinaan pengelolaan
 * risiko yang disampaikan kepada Kepala Daerah cq Sekretaris Daerah".
 *
 * Yang diuji terutama dua hal: periodenya SEMESTER, bukan triwulan seperti
 * Laporan 12 dan 13; dan laporan ini tingkat Pemerintah Daerah, sehingga boleh
 * dibaca siapa saja tetapi hanya Admin yang boleh mengubah narasinya.
 */
class LaporanKomiteTest extends TestCase
{
    use RefreshDatabase;

    private const TAHUN = 2026;

    protected function setUp(): void
    {
        parent::setUp();

        foreach (['admin', 'super-admin', 'user'] as $nama) {
            Role::findOrCreate($nama, 'web');
        }
        PengaturanPemda::create(['tahun_penilaian' => self::TAHUN]);
    }

    private function pengguna(string $peran): User
    {
        $opd = Opd::firstOrCreate(['nama' => 'Sekretariat Daerah']);
        $u = User::factory()->create(['opd_id' => $opd->id]);
        $u->assignRole($peran);

        return $u;
    }

    private function muatan(array $tambahan = []): array
    {
        return array_merge([
            'tahun' => self::TAHUN,
            'periode' => 'S1',
            'rencana_kegiatan' => 'Sosialisasi pengelolaan Risiko pada seluruh OPD.',
            'realisasi_kegiatan' => 'Sosialisasi terlaksana pada 32 dari 49 OPD.',
            'hambatan_pelaksanaan' => 'Sebagian OPD belum menunjuk PIC.',
            'hasil_pembinaan' => 'Seluruh OPD yang dibina telah menyusun register risiko.',
            'rekomendasi_feedback' => 'Percepat penunjukan PIC pada OPD yang belum.',
        ], $tambahan);
    }

    // --- periode semester -----------------------------------------------

    public function test_halaman_memakai_periode_semester_bukan_triwulan(): void
    {
        $this->actingAs($this->pengguna('admin'))
            ->get('/cetak/laporan/4?tahun='.self::TAHUN.'&periode=S2')
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('periode', 'S2')
                ->where('periodeOptions.S1', 'Semester I (Januari sampai Juni)')
                ->where('periodeOptions.S2', 'Semester II (Juli sampai Desember)')
                ->where('periodeOptions.TAHUNAN', 'Tahunan'));
    }

    /**
     * Periode yang tidak dikenal — termasuk angka triwulan yang tersasar ke
     * sini — dikembalikan ke Semester I, bukan diteruskan apa adanya dan
     * menghasilkan laporan berperiode ngawur.
     */
    public function test_periode_yang_tidak_dikenal_jatuh_ke_semester_satu(): void
    {
        $this->actingAs($this->pengguna('admin'))
            ->get('/cetak/laporan/4?tahun='.self::TAHUN.'&periode=III')
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page->where('periode', 'S1'));
    }

    /**
     * Templat bawaan memakai kolom periode yang sama dengan Laporan 12 dan 13.
     * Tanpa pembedaan, narasinya akan berbunyi "Triwulan S1 Tahun 2026".
     */
    public function test_narasi_bawaan_menyebut_semester_bukan_triwulan(): void
    {
        $this->actingAs($this->pengguna('admin'))
            ->get('/cetak/laporan/4?tahun='.self::TAHUN.'&periode=S1')
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('narasi.ruang_lingkup', fn ($v) => str_contains($v, 'Semester I Tahun 2026')
                    && ! str_contains($v, 'Triwulan')));
    }

    public function test_periode_tahunan_disebut_tanpa_kata_semester(): void
    {
        $this->actingAs($this->pengguna('admin'))
            ->get('/cetak/laporan/4?tahun='.self::TAHUN.'&periode=TAHUNAN')
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('narasi.penutup', fn ($v) => str_contains($v, 'Tahun 2026')
                    && ! str_contains($v, 'Semester')
                    && ! str_contains($v, 'Triwulan')));
    }

    // --- perekaman narasi ------------------------------------------------

    public function test_narasi_tersimpan_pada_periode_yang_benar(): void
    {
        $this->actingAs($this->pengguna('admin'))
            ->post('/cetak/laporan/4/narasi', $this->muatan())
            ->assertRedirect();

        $narasi = LaporanNarasi::where('jenis_laporan', 'pembinaan_komite')->firstOrFail();
        $this->assertSame('S1', $narasi->triwulan);
        $this->assertNull($narasi->opd_id, 'laporan Komite selalu tingkat Pemda');
        $this->assertSame('Seluruh OPD yang dibina telah menyusun register risiko.', $narasi->hasil_pembinaan);
    }

    /**
     * Bagian C laporan Komite adalah HASIL PEMBINAAN, berbeda maksudnya dari
     * hasil pemantauan pada Laporan 12 dan 13. Menumpang kolom yang sama akan
     * membuat keduanya saling menimpa.
     */
    public function test_hasil_pembinaan_tidak_menimpa_kolom_monitoring_laporan_lain(): void
    {
        $admin = $this->pengguna('admin');
        $this->actingAs($admin)->post('/cetak/laporan/4/narasi', $this->muatan());

        $narasi = LaporanNarasi::where('jenis_laporan', 'pembinaan_komite')->firstOrFail();
        $this->assertNull($narasi->monitoring_risiko_rtp);
        $this->assertNotNull($narasi->hasil_pembinaan);
    }

    public function test_dua_semester_tersimpan_terpisah(): void
    {
        $admin = $this->pengguna('admin');
        $this->actingAs($admin)->post('/cetak/laporan/4/narasi', $this->muatan(['periode' => 'S1']));
        $this->actingAs($admin)->post('/cetak/laporan/4/narasi', $this->muatan([
            'periode' => 'S2',
            'hasil_pembinaan' => 'Pembinaan lanjutan pada 17 OPD sisanya.',
        ]));

        $this->assertSame(2, LaporanNarasi::where('jenis_laporan', 'pembinaan_komite')->count());
        $this->assertSame(
            'Pembinaan lanjutan pada 17 OPD sisanya.',
            LaporanNarasi::where('jenis_laporan', 'pembinaan_komite')->where('triwulan', 'S2')->value('hasil_pembinaan'),
        );
    }

    // --- hak akses -------------------------------------------------------

    public function test_pic_biasa_boleh_membaca_laporannya(): void
    {
        $this->actingAs($this->pengguna('user'))
            ->get('/cetak/laporan/4?tahun='.self::TAHUN)
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page->where('canEdit', false));
    }

    public function test_pic_biasa_tidak_dapat_mengubah_narasinya(): void
    {
        $this->actingAs($this->pengguna('user'))
            ->post('/cetak/laporan/4/narasi', $this->muatan())
            ->assertForbidden();

        $this->assertSame(0, LaporanNarasi::where('jenis_laporan', 'pembinaan_komite')->count());
    }

    // --- penanda tangan dari struktur A5 ---------------------------------

    /**
     * Inilah gunanya struktur pengelola disimpan sebagai data: blok tanda
     * tangan diisi dari susunan Komite tahun berjalan, bukan diketik ulang.
     */
    public function test_penanda_tangan_diambil_dari_susunan_komite(): void
    {
        StrukturPengelolaRisiko::create([
            'tahun' => self::TAHUN,
            'peran' => 'komite',
            'nama' => 'Nama Ketua Komite',
            'jabatan' => 'Ketua Komite Pengelolaan Risiko',
            'urutan' => 1,
        ]);

        $this->actingAs($this->pengguna('admin'))
            ->get('/cetak/laporan/4?tahun='.self::TAHUN)
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->has('komite', 1)
                ->where('komite.0.nama', 'Nama Ketua Komite')
                ->where('komite.0.jabatan', 'Ketua Komite Pengelolaan Risiko'));
    }

    public function test_halaman_tetap_terbuka_ketika_komite_belum_direkam(): void
    {
        $this->actingAs($this->pengguna('admin'))
            ->get('/cetak/laporan/4?tahun='.self::TAHUN)
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page->has('komite', 0));
    }

    public function test_susunan_komite_tahun_lain_tidak_terbawa(): void
    {
        StrukturPengelolaRisiko::create([
            'tahun' => 2025,
            'peran' => 'komite',
            'nama' => 'Ketua Komite Lama',
            'jabatan' => 'Ketua Komite Pengelolaan Risiko',
        ]);

        $this->actingAs($this->pengguna('admin'))
            ->get('/cetak/laporan/4?tahun='.self::TAHUN)
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page->has('komite', 0));
    }
}
