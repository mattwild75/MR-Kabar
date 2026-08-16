<?php

namespace Tests\Feature;

use App\Models\CeeJawaban;
use App\Models\CeeKelemahanDokumen;
use App\Models\CeePertanyaan;
use App\Models\CeeSimpulan;
use App\Models\CeeUnsur;
use App\Models\Opd;
use App\Models\PengaturanPemda;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Form 1c ketika hasil reviu dokumen dan survei persepsi bertentangan.
 *
 * Perdep Lampiran 5 Form 1.c kolom (g): "jika hasil antara penilaian awal dan
 * survei persepsi bertentangan, maka lakukan pendalaman atau lakukan
 * professional judgement untuk menyimpulkannya". Pertimbangan semacam itu
 * tidak dapat diperiksa siapa pun kalau tidak tertulis, dan keputusannya tidak
 * ada gunanya kalau yang tercetak justru hitungan ulang mesin.
 */
class CeeSimpulanBertentanganTest extends TestCase
{
    use RefreshDatabase;

    private const TAHUN = 2026;

    private Opd $opd;

    private CeeUnsur $unsurBertentangan;

    private CeeUnsur $unsurSejalan;

    protected function setUp(): void
    {
        parent::setUp();

        foreach (['admin', 'super-admin', 'user'] as $nama) {
            Role::findOrCreate($nama, 'web');
        }

        PengaturanPemda::create(['tahun_penilaian' => self::TAHUN]);
        $this->opd = Opd::create(['nama' => 'Inspektorat']);

        // Sub unsur yang bertentangan: survei persepsi menyimpulkan Memadai
        // (modus jawaban 4), sedangkan reviu dokumen menemukan kelemahan.
        $this->unsurBertentangan = CeeUnsur::create(['kode' => 'A', 'nama' => 'Penegakan Integritas', 'urutan' => 1]);
        $p1 = CeePertanyaan::create([
            'cee_unsur_id' => $this->unsurBertentangan->id,
            'pertanyaan' => 'Apakah aturan perilaku telah ditetapkan?',
            'urutan' => 1,
            'aktif' => true,
        ]);
        $this->jawab($p1->id, 4);
        CeeKelemahanDokumen::create([
            'opd_id' => $this->opd->id,
            'tahun_penilaian' => self::TAHUN,
            'cee_unsur_id' => $this->unsurBertentangan->id,
            'sumber_data' => 'Laporan Hasil Pemeriksaan',
            'uraian_kelemahan' => 'Aturan perilaku belum ditandatangani seluruh pegawai.',
            'pengisi_nama' => 'Pengisi Uji',
            'pengisi_jabatan' => 'Auditor',
        ]);

        // Sub unsur yang sejalan: keduanya sama-sama Memadai.
        $this->unsurSejalan = CeeUnsur::create(['kode' => 'B', 'nama' => 'Komitmen terhadap Kompetensi', 'urutan' => 2]);
        $p2 = CeePertanyaan::create([
            'cee_unsur_id' => $this->unsurSejalan->id,
            'pertanyaan' => 'Apakah standar kompetensi telah disusun?',
            'urutan' => 1,
            'aktif' => true,
        ]);
        $this->jawab($p2->id, 4);
    }

    private function jawab(int $pertanyaanId, int $nilai): void
    {
        CeeJawaban::create([
            'opd_id' => $this->opd->id,
            'cee_pertanyaan_id' => $pertanyaanId,
            'tahun_penilaian' => self::TAHUN,
            'responden_nama' => 'Responden Uji',
            'responden_jabatan' => 'Auditor',
            'nilai' => $nilai,
        ]);
    }

    private function admin(): User
    {
        $u = User::factory()->create(['opd_id' => $this->opd->id]);
        $u->assignRole('admin');

        return $u;
    }

    /** Muatan store1c yang sah, dengan penjelasan dapat diatur per sub unsur. */
    private function muatan(?string $penjelasanBertentangan, string $simpulan = 'Memadai'): array
    {
        return [
            'opd_id' => $this->opd->id,
            'tahun' => self::TAHUN,
            'penyusun_nama' => 'Sekretaris Uji',
            'penyusun_jabatan' => 'Sekretaris',
            'simpulan' => [
                [
                    'cee_unsur_id' => $this->unsurBertentangan->id,
                    'simpulan' => $simpulan,
                    'penjelasan' => $penjelasanBertentangan,
                ],
                [
                    'cee_unsur_id' => $this->unsurSejalan->id,
                    'simpulan' => 'Memadai',
                    'penjelasan' => null,
                ],
            ],
        ];
    }

    public function test_form_menandai_sub_unsur_yang_kedua_sumbernya_bertentangan(): void
    {
        $this->actingAs($this->admin())
            ->get('/cee/1c?opd_id='.$this->opd->id.'&tahun='.self::TAHUN)
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->has('ringkasan', 2)
                ->where('ringkasan.0.simpulan_1a', 'Memadai')
                ->where('ringkasan.0.bertentangan', true)
                ->where('ringkasan.1.simpulan_1a', 'Memadai')
                ->where('ringkasan.1.bertentangan', false));
    }

    /**
     * Keadaan yang paling perlu dipertanggungjawabkan: reviu dokumen menemukan
     * kelemahan, tetapi penyusun tetap menyimpulkan Memadai. Sebelum perubahan
     * ini kotak Penjelasan justru DIMATIKAN persis pada keadaan itu.
     */
    public function test_penjelasan_wajib_ketika_kedua_sumber_bertentangan(): void
    {
        $this->actingAs($this->admin())
            ->post('/cee/1c', $this->muatan(null))
            ->assertSessionHasErrors('simpulan.0.penjelasan');

        $this->assertSame(0, CeeSimpulan::count(), 'tidak boleh ada yang tersimpan saat validasi gagal');
    }

    public function test_penjelasan_hanya_berisi_spasi_juga_ditolak(): void
    {
        $this->actingAs($this->admin())
            ->post('/cee/1c', $this->muatan("   \n  "))
            ->assertSessionHasErrors('simpulan.0.penjelasan');
    }

    public function test_penjelasan_tidak_diwajibkan_ketika_kedua_sumber_sejalan(): void
    {
        $this->actingAs($this->admin())
            ->post('/cee/1c', $this->muatan('Sudah dikonfirmasi lewat wawancara dengan Sekretaris.'))
            ->assertSessionHasNoErrors();

        $sejalan = CeeSimpulan::where('cee_unsur_id', $this->unsurSejalan->id)->firstOrFail();
        $this->assertNull($sejalan->penjelasan);
    }

    public function test_penjelasan_tersimpan_meski_simpulannya_memadai(): void
    {
        $alasan = 'Kelemahan sudah ditindaklanjuti sebelum tahun penilaian berakhir, dikonfirmasi lewat wawancara.';

        $this->actingAs($this->admin())
            ->post('/cee/1c', $this->muatan($alasan, 'Memadai'))
            ->assertSessionHasNoErrors();

        $tersimpan = CeeSimpulan::where('cee_unsur_id', $this->unsurBertentangan->id)->firstOrFail();
        $this->assertSame('Memadai', $tersimpan->simpulan);
        // Sebelumnya penjelasan dibuang begitu simpulannya Memadai, sehingga
        // dasar professional judgement-nya hilang.
        $this->assertSame($alasan, $tersimpan->penjelasan);
    }

    /**
     * Kolom g Form Cetak harus memuat KEPUTUSAN penyusun. Dulu kolom itu
     * dihitung ulang dari kedua sumber, sehingga hasil professional judgement
     * tercetak berbeda dari yang tersimpan dan yang tampil di layar.
     */
    public function test_form_cetak_memuat_keputusan_penyusun_bukan_hitungan_ulang(): void
    {
        $admin = $this->admin();
        $this->actingAs($admin)->post('/cee/1c', $this->muatan('Sudah ditindaklanjuti.', 'Memadai'));

        $this->actingAs($admin)
            ->get('/cetak/cee/1c?opd_id='.$this->opd->id.'&tahun='.self::TAHUN)
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->has('rows', 2)
                ->where('rows.0.hasil_dokumen', 'Kurang Memadai')
                ->where('rows.0.hasil_survei', 'Memadai')
                ->where('rows.0.bertentangan', true)
                // Inilah yang dulu tercetak "Kurang Memadai".
                ->where('rows.0.simpulan.simpulan', 'Memadai')
                ->where('rows.1.bertentangan', false));
    }

    public function test_pertentangan_dihitung_ulang_di_server_bukan_dipercaya_dari_peramban(): void
    {
        $admin = $this->admin();

        // Halaman dibuka saat belum ada kelemahan sama sekali, lalu kelemahan
        // baru masuk sebelum Simpan ditekan. Kiriman tanpa penjelasan tetap
        // harus ditolak, karena pertentangannya dihitung dari data terkini.
        CeeKelemahanDokumen::create([
            'opd_id' => $this->opd->id,
            'tahun_penilaian' => self::TAHUN,
            'cee_unsur_id' => $this->unsurSejalan->id,
            'sumber_data' => 'Hasil Reviu',
            'uraian_kelemahan' => 'Standar kompetensi belum ditetapkan.',
            'pengisi_nama' => 'Pengisi Uji',
            'pengisi_jabatan' => 'Auditor',
        ]);

        $this->actingAs($admin)
            ->post('/cee/1c', $this->muatan('Sudah ditindaklanjuti.'))
            ->assertSessionHasErrors('simpulan.1.penjelasan');
    }
}
