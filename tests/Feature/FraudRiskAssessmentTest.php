<?php

namespace Tests\Feature;

use App\Models\FraudKamusRisiko;
use App\Models\FraudRisiko;
use App\Models\Opd;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * MR Fraud — Penilaian Risiko Kecurangan (FRA).
 *
 * Dasar: Perdep BPKP Bidang Investigasi No. 1 Tahun 2019 dan Perbup Aceh Barat
 * No. 6 Tahun 2025.
 *
 * Yang diuji di sini bukan "halamannya terbuka", melainkan sifat-sifat yang
 * kalau rusak tidak menimbulkan galat apa pun:
 *
 *   1. Besaran risiko diambil dari matriks resmi, BUKAN dari perkalian.
 *   2. Kelompok risiko hanya menerima tujuh delik UU Tipikor.
 *   3. PIC tidak bisa melihat atau menyentuh baris Perangkat Daerah lain.
 */
class FraudRiskAssessmentTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Matriks 5x5 dan level risiko WAJIB ada sebelum besaran bisa dihitung.
     *
     * Keduanya acuan bersama seluruh aplikasi, bukan milik MR Fraud. Tanpa
     * di-seed, besaran risiko diam-diam menjadi null — tidak melempar galat,
     * hanya berhenti muncul di layar. Tes pertama fitur ini gagal justru
     * karena itu, dan bacaannya benar: MR Fraud memang bergantung padanya.
     */
    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(\Database\Seeders\RiskReferenceDataSeeder::class);
    }

    private function opd(string $nama = 'DINAS KESEHATAN'): Opd
    {
        return Opd::create(['nama' => $nama]);
    }

    private function pic(Opd $opd): User
    {
        return User::factory()->create(['opd_id' => $opd->id]);
    }

    private function risiko(User $pemilik, array $ubah = []): FraudRisiko
    {
        return FraudRisiko::create(array_merge([
            'user_id' => $pemilik->id,
            'opd_id' => $pemilik->opd_id,
            'tahun_penilaian' => 2026,
            'nama_risiko' => 'Mark up HPS',
            'tahapan_proses' => 'Pengadaan Barang dan Jasa',
        ], $ubah));
    }

    public function test_keenam_halaman_terbuka(): void
    {
        $this->actingAs($this->pic($this->opd()));

        foreach ([
            '/fraud/identifikasi',
            '/fraud/analisis',
            '/fraud/rtp',
            '/fraud/register',
            '/fraud/peta-risiko',
            '/fraud/kamus',
        ] as $jalur) {
            $this->get($jalur)->assertOk();
        }
    }

    public function test_tamu_diarahkan_ke_halaman_masuk(): void
    {
        $this->get('/fraud/identifikasi')->assertRedirect('/login');
    }

    /**
     * Inti perhitungan FRA. Matriks 5x5 BUKAN tabel perkalian: probabilitas 2
     * dampak 4 bernilai 13, bukan 8. Angka ini dicocokkan dengan lembar AR
     * pada Format Kertas Kerja FRA.
     */
    public function test_besaran_risiko_mengikuti_matriks_bukan_perkalian(): void
    {
        $pic = $this->pic($this->opd());

        $r = $this->risiko($pic, [
            'probabilitas_inheren' => 2,
            'dampak_inheren' => 4,
            'probabilitas_residual' => 3,
            'dampak_residual' => 5,
        ]);

        $this->assertSame(13, $r->besaran_inheren, 'probabilitas 2 x dampak 4 harus 13 menurut matriks resmi');
        $this->assertSame(22, $r->besaran_residual, 'probabilitas 3 x dampak 5 harus 22 menurut matriks resmi');
        $this->assertNotNull($r->level_inheren);
        $this->assertNotNull($r->level_residual);
    }

    public function test_besaran_kosong_selama_salah_satu_skor_belum_diisi(): void
    {
        $r = $this->risiko($this->pic($this->opd()), ['probabilitas_inheren' => 3]);

        $this->assertNull($r->besaran_inheren);
        $this->assertNull($r->level_inheren);
    }

    public function test_pic_menambah_risiko_atas_nama_opd_akunnya(): void
    {
        $opd = $this->opd();
        $pic = $this->pic($opd);

        $this->actingAs($pic)->post('/fraud', [
            'tahun_penilaian' => 2026,
            'nama_risiko' => 'Penyuapan untuk mempengaruhi hasil seleksi',
            'tahapan_proses' => 'Pelaksanaan',
            'kelompok_risiko' => ['Suap-Menyuap'],
        ])->assertRedirect();

        $this->assertDatabaseHas('fraud_risiko', [
            'opd_id' => $opd->id,
            'user_id' => $pic->id,
            'nama_risiko' => 'Penyuapan untuk mempengaruhi hasil seleksi',
        ]);
    }

    /**
     * OPD diambil dari akun, bukan dari kiriman peramban — kalau tidak, PIC
     * bisa menuliskan baris atas nama Perangkat Daerah lain.
     */
    public function test_pic_tidak_bisa_menulis_atas_nama_opd_lain(): void
    {
        $opdSendiri = $this->opd('DINAS KESEHATAN');
        $opdLain = $this->opd('INSPEKTORAT');
        $pic = $this->pic($opdSendiri);

        $this->actingAs($pic)->post('/fraud', [
            'tahun_penilaian' => 2026,
            'nama_risiko' => 'Risiko titipan',
            'opd_id' => $opdLain->id,
        ]);

        $this->assertDatabaseMissing('fraud_risiko', ['opd_id' => $opdLain->id]);
        $this->assertDatabaseHas('fraud_risiko', ['opd_id' => $opdSendiri->id]);
    }

    public function test_pic_tidak_melihat_baris_opd_lain(): void
    {
        $picA = $this->pic($this->opd('DINAS KESEHATAN'));
        $picB = $this->pic($this->opd('INSPEKTORAT'));

        $this->risiko($picB, ['nama_risiko' => 'Risiko milik OPD lain']);

        $this->actingAs($picA)
            ->get('/fraud/identifikasi?tahun=2026')
            ->assertOk()
            ->assertDontSee('Risiko milik OPD lain');
    }

    public function test_pic_tidak_bisa_mengubah_baris_orang_lain(): void
    {
        $picA = $this->pic($this->opd('DINAS KESEHATAN'));
        $picB = $this->pic($this->opd('INSPEKTORAT'));

        $milikB = $this->risiko($picB);

        $this->actingAs($picA)->put("/fraud/{$milikB->id}", [
            'tahun_penilaian' => 2026,
            'nama_risiko' => 'Diubah diam-diam',
        ])->assertForbidden();

        $this->assertDatabaseHas('fraud_risiko', ['id' => $milikB->id, 'nama_risiko' => 'Mark up HPS']);
    }

    /**
     * Kelompok risiko sengaja pilihan baku. Di kertas kerja asli kolom ini
     * teks bebas, dan hasilnya sudah tidak konsisten sehingga tak bisa
     * dihitung — kerapuhan yang sama jenisnya dengan temuan audit R-08.
     */
    public function test_kelompok_risiko_di_luar_tujuh_delik_ditolak(): void
    {
        $this->actingAs($this->pic($this->opd()))->post('/fraud', [
            'tahun_penilaian' => 2026,
            'nama_risiko' => 'Risiko apa saja',
            'kelompok_risiko' => ['Perbuatan curang'], // huruf kecil: bukan nilai baku
        ])->assertSessionHasErrors('kelompok_risiko.0');

        $this->assertDatabaseCount('fraud_risiko', 0);
    }

    public function test_skor_di_luar_satu_sampai_lima_ditolak(): void
    {
        $this->actingAs($this->pic($this->opd()))->post('/fraud', [
            'tahun_penilaian' => 2026,
            'nama_risiko' => 'Risiko apa saja',
            'probabilitas_inheren' => 6,
        ])->assertSessionHasErrors('probabilitas_inheren');
    }

    public function test_menghapus_risiko_memakai_soft_delete(): void
    {
        $pic = $this->pic($this->opd());
        $r = $this->risiko($pic);

        $this->actingAs($pic)->delete("/fraud/{$r->id}")->assertRedirect();

        $this->assertSoftDeleted('fraud_risiko', ['id' => $r->id]);
    }

    public function test_kamus_risiko_bisa_disaring_per_area(): void
    {
        FraudKamusRisiko::create([
            'sumber' => 'MCP KPK 2025', 'area' => 'PEMBERIAN HIBAH', 'nomor' => 1,
            'uraian' => 'Kegiatan Hibah tidak didasari oleh kebutuhan penerima hibah',
        ]);
        FraudKamusRisiko::create([
            'sumber' => 'MCP KPK 2025', 'area' => 'MANAJEMEN ASN', 'nomor' => 1,
            'uraian' => 'Terjadinya gratifikasi dalam proses pengelolaan ASN',
        ]);

        $this->actingAs($this->pic($this->opd()))
            ->get('/fraud/kamus?area=MANAJEMEN+ASN')
            ->assertOk()
            ->assertSee('gratifikasi dalam proses pengelolaan ASN')
            ->assertDontSee('kebutuhan penerima hibah');
    }
}
