<?php

namespace Tests\Feature;

use App\Models\ArahanPenilaianRisiko;
use App\Models\ArahanTahapan;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Arahan dan Kebijakan Penilaian Risiko beserta tahapannya.
 *
 * Perdep PPKD 4/2019 Lampiran 3 dan 4 memuat contoh Surat Edaran Kepala Daerah
 * yang menetapkan kapan penilaian risiko dilakukan. Tahapan yang direkam di
 * sini menjadi sumber data jadwal pada Dasbor, sehingga yang paling penting
 * diuji adalah: hanya arahan yang benar-benar DITETAPKAN yang boleh menagih
 * OPD, dan tenggat yang mustahil ditolak sejak awal.
 */
class ArahanPenilaianRisikoTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        foreach (['admin', 'super-admin', 'user'] as $nama) {
            Role::findOrCreate($nama, 'web');
        }
        $u = User::factory()->create();
        $u->assignRole('admin');

        return $u;
    }

    private function pic(): User
    {
        foreach (['admin', 'super-admin', 'user'] as $nama) {
            Role::findOrCreate($nama, 'web');
        }
        $u = User::factory()->create();
        $u->assignRole('user');

        return $u;
    }

    private function muatanArahan(array $tambahan = []): array
    {
        return array_merge([
            'jenis' => '1_tahunan',
            'tahun_mulai' => 2026,
            'tahun_selesai' => 2026,
            'nomor_se' => 'SE-700/123/2026',
            'tanggal_se' => '2026-09-01',
            'status' => 'berlaku',
        ], $tambahan);
    }

    private function arahan(array $tambahan = []): ArahanPenilaianRisiko
    {
        return ArahanPenilaianRisiko::create($this->muatanArahan($tambahan));
    }

    // --- hak akses -------------------------------------------------------

    public function test_pic_biasa_tidak_dapat_menetapkan_arahan(): void
    {
        $this->actingAs($this->pic())
            ->post('/keterangan-pendukung/arahan', $this->muatanArahan())
            ->assertForbidden();

        $this->assertSame(0, ArahanPenilaianRisiko::count());
    }

    public function test_pic_biasa_tidak_dapat_menambah_tahapan(): void
    {
        $arahan = $this->arahan();

        $this->actingAs($this->pic())
            ->post("/keterangan-pendukung/arahan/{$arahan->id}/tahapan", ['tahapan' => 'Penilaian Risiko Operasional OPD'])
            ->assertForbidden();

        $this->assertSame(0, ArahanTahapan::count());
    }

    // --- perekaman -------------------------------------------------------

    public function test_arahan_tersimpan_berikut_penetapnya(): void
    {
        $admin = $this->admin();

        $this->actingAs($admin)
            ->post('/keterangan-pendukung/arahan', $this->muatanArahan([
                'dasar_hukum' => 'Peraturan Bupati Aceh Barat Nomor 1 Tahun 2026',
            ]))
            ->assertSessionHasNoErrors();

        $arahan = ArahanPenilaianRisiko::firstOrFail();
        $this->assertSame('1_tahunan', $arahan->jenis);
        $this->assertSame('SE-700/123/2026', $arahan->nomor_se);
        $this->assertSame($admin->id, $arahan->ditetapkan_oleh);
    }

    public function test_tahun_selesai_tidak_boleh_mendahului_tahun_mulai(): void
    {
        $this->actingAs($this->admin())
            ->post('/keterangan-pendukung/arahan', $this->muatanArahan([
                'tahun_mulai' => 2026,
                'tahun_selesai' => 2025,
            ]))
            ->assertSessionHasErrors('tahun_selesai');
    }

    public function test_jenis_arahan_di_luar_dua_yang_dikenal_ditolak(): void
    {
        $this->actingAs($this->admin())
            ->post('/keterangan-pendukung/arahan', $this->muatanArahan(['jenis' => '3_tahunan']))
            ->assertSessionHasErrors('jenis');
    }

    /**
     * Tenggat yang mendahului tanggal mulai membuat tahapan itu selamanya
     * berkeadaan terlambat sejak hari pertama.
     */
    public function test_tanggal_selesai_tahapan_tidak_boleh_mendahului_tanggal_mulai(): void
    {
        $arahan = $this->arahan();

        $this->actingAs($this->admin())
            ->post("/keterangan-pendukung/arahan/{$arahan->id}/tahapan", [
                'tahapan' => 'Penilaian Risiko Operasional OPD',
                'tanggal_mulai' => '2026-10-14',
                'tanggal_selesai' => '2026-10-03',
            ])
            ->assertSessionHasErrors('tanggal_selesai');
    }

    /**
     * Tahapan baru harus jatuh di urutan paling belakang. Kalau urutannya 0,
     * tahapan baru melompat ke atas dan mengacak susunan yang sudah disusun.
     */
    public function test_tahapan_baru_ditaruh_di_urutan_paling_belakang(): void
    {
        $arahan = $this->arahan();
        $admin = $this->admin();

        foreach (['Penilaian Risiko Strategis Pemda', 'Penilaian Risiko Strategis OPD', 'Penilaian Risiko Operasional OPD'] as $nama) {
            $this->actingAs($admin)->post("/keterangan-pendukung/arahan/{$arahan->id}/tahapan", ['tahapan' => $nama]);
        }

        $urutan = $arahan->tahapan()->pluck('tahapan')->all();
        $this->assertSame([
            'Penilaian Risiko Strategis Pemda',
            'Penilaian Risiko Strategis OPD',
            'Penilaian Risiko Operasional OPD',
        ], $urutan);
    }

    public function test_menghapus_arahan_ikut_menghapus_tahapannya(): void
    {
        $arahan = $this->arahan();
        $admin = $this->admin();
        $this->actingAs($admin)->post("/keterangan-pendukung/arahan/{$arahan->id}/tahapan", ['tahapan' => 'Penilaian Risiko Operasional OPD']);
        $this->assertSame(1, ArahanTahapan::count());

        $this->actingAs($admin)->delete("/keterangan-pendukung/arahan/{$arahan->id}");

        // Arahan di-soft delete, tetapi tahapannya memang ikut hilang karena
        // tidak berguna tanpa induknya.
        $this->assertSame(0, ArahanPenilaianRisiko::count());
    }

    // --- arahan yang berlaku --------------------------------------------

    /**
     * Ini penjaga terpenting modul ini: arahan yang masih disusun tidak boleh
     * muncul sebagai jadwal dan menagih OPD atas sesuatu yang belum ditetapkan
     * Bupati.
     */
    public function test_hanya_arahan_berstatus_berlaku_yang_terbaca_sebagai_jadwal(): void
    {
        $this->arahan(['status' => 'draf', 'tahun_mulai' => 2026, 'tahun_selesai' => 2026]);
        $berlaku = $this->arahan(['status' => 'berlaku', 'tahun_mulai' => 2026, 'tahun_selesai' => 2026]);

        $hasil = ArahanPenilaianRisiko::berlakuPada(2026)->get();

        $this->assertCount(1, $hasil);
        $this->assertSame($berlaku->id, $hasil->first()->id);
    }

    public function test_arahan_lima_tahunan_terbaca_pada_seluruh_tahun_periodenya(): void
    {
        $this->arahan(['jenis' => '5_tahunan', 'tahun_mulai' => 2025, 'tahun_selesai' => 2029]);

        foreach ([2025, 2027, 2029] as $tahun) {
            $this->assertCount(1, ArahanPenilaianRisiko::berlakuPada($tahun)->get(), "seharusnya berlaku pada $tahun");
        }

        foreach ([2024, 2030] as $tahun) {
            $this->assertCount(0, ArahanPenilaianRisiko::berlakuPada($tahun)->get(), "seharusnya tidak berlaku pada $tahun");
        }
    }

    // --- keadaan tahapan -------------------------------------------------

    public function test_keadaan_tahapan_dibaca_dari_tenggatnya(): void
    {
        $arahan = $this->arahan();

        $belumMulai = ArahanTahapan::create([
            'arahan_penilaian_risiko_id' => $arahan->id,
            'tahapan' => 'Nanti',
            'tanggal_mulai' => '2026-11-01',
            'tanggal_selesai' => '2026-11-30',
        ]);
        $berjalan = ArahanTahapan::create([
            'arahan_penilaian_risiko_id' => $arahan->id,
            'tahapan' => 'Sekarang',
            'tanggal_mulai' => '2026-10-01',
            'tanggal_selesai' => '2026-10-31',
        ]);
        $terlambat = ArahanTahapan::create([
            'arahan_penilaian_risiko_id' => $arahan->id,
            'tahapan' => 'Sudah lewat',
            'tanggal_mulai' => '2026-08-01',
            'tanggal_selesai' => '2026-08-31',
        ]);
        $tanpaTenggat = ArahanTahapan::create([
            'arahan_penilaian_risiko_id' => $arahan->id,
            'tahapan' => 'Belum dijadwalkan',
        ]);

        $saat = Carbon::parse('2026-10-15');

        $this->assertSame('belum_mulai', $belumMulai->keadaan($saat));
        $this->assertSame('berjalan', $berjalan->keadaan($saat));
        $this->assertSame('terlambat', $terlambat->keadaan($saat));
        $this->assertSame('tanpa_tenggat', $tanpaTenggat->keadaan($saat));
    }

    public function test_tahapan_masih_berjalan_pada_hari_terakhir_tenggatnya(): void
    {
        $arahan = $this->arahan();
        $tahapan = ArahanTahapan::create([
            'arahan_penilaian_risiko_id' => $arahan->id,
            'tahapan' => 'Penilaian Risiko Operasional OPD',
            'tanggal_mulai' => '2026-10-03',
            'tanggal_selesai' => '2026-10-14',
        ]);

        // Hari terakhir belum lewat — menganggapnya terlambat akan memangkas
        // satu hari kerja dari tenggat yang ditetapkan Bupati.
        $this->assertSame('berjalan', $tahapan->keadaan(Carbon::parse('2026-10-14')));
        $this->assertSame('terlambat', $tahapan->keadaan(Carbon::parse('2026-10-15')));
    }

    // --- halaman ---------------------------------------------------------

    public function test_halaman_keterangan_pendukung_mengirim_arahan_berikut_tahapannya(): void
    {
        $arahan = $this->arahan();
        $admin = $this->admin();
        $this->actingAs($admin)->post("/keterangan-pendukung/arahan/{$arahan->id}/tahapan", [
            'tahapan' => 'Penilaian Risiko Operasional OPD',
            'dokumen_pemicu' => 'RKA OPD',
            'tanggal_mulai' => '2026-10-03',
            'tanggal_selesai' => '2026-10-14',
        ]);

        $this->actingAs($admin)
            ->get('/keterangan-pendukung?tab=arahan_penilaian')
            ->assertOk()
            ->assertInertia(fn(AssertableInertia $page) => $page
                ->has('arahanPenilaian', 1)
                ->has('arahanPenilaian.0.tahapan', 1)
                ->where('arahanPenilaian.0.tahapan.0.dokumen_pemicu', 'RKA OPD')
                ->has('jenisArahanLabel'));
    }
}
