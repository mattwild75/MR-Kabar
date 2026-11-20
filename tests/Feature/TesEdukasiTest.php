<?php

namespace Tests\Feature;

use App\Models\Opd;
use App\Models\SettingApp;
use App\Models\TesJawaban;
use App\Models\TesPelatihan;
use App\Models\TesPeserta;
use App\Models\TesSesi;
use App\Models\TesSoal;
use App\Models\User;
use App\Services\Tes\AnalisisTesService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Testing\TestResponse;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Pre-test dan post-test langsung: token persis, biodata, buka/tutup soal oleh
 * pemandu, jawaban hanya diterima selama soal dibuka, pindah perangkat lewat
 * NIP, peserta dikeluarkan, nilai dan pasangan pre-post, hak akses, dan tidak
 * bocornya soal ke ponsel peserta.
 */
class TesEdukasiTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private Opd $opd;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
        SettingApp::clearCached();
        Role::findOrCreate('admin', 'web');
        Role::findOrCreate('user', 'web');
        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');
        $this->opd = Opd::create(['nama' => 'INSPEKTORAT']);
    }

    /** Bank soal rekaan: kunci pre selalu A, post selalu B. */
    private function imporBankSoal(): void
    {
        $butir = fn (string $kunci) => collect(range(1, 20))->map(fn ($n) => [
            'nomor' => $n,
            'bagian' => intdiv($n - 1, 4) + 1,
            'indikator' => 'Indikator '.$n,
            'pertanyaan' => 'Pertanyaan rahasia nomor '.$n,
            'pilihan' => ['A' => 'satu', 'B' => 'dua', 'C' => 'tiga', 'D' => 'empat'],
            'kunci' => $kunci,
            'pembahasan' => 'Pembahasan '.$n,
        ])->all();
        $berkas = UploadedFile::fake()->createWithContent('bank.json', json_encode(['pre' => $butir('A'), 'post' => $butir('B')]));

        $this->actingAs($this->admin)->post('/edukasi/kelola/soal/impor', ['berkas' => $berkas])->assertSessionHasNoErrors();
    }

    private function buatPelatihan(): TesPelatihan
    {
        $this->actingAs($this->admin)->post('/edukasi/kelola/pelatihan', [
            'nama' => 'Bimtek Uji',
            'tanggal' => '2026-12-01',
            'token_pre' => 'Uji Pre 1',
            'token_post' => 'uji-post',
        ])->assertSessionHasNoErrors();

        return TesPelatihan::with('sesi')->firstOrFail();
    }

    private function sesi(TesPelatihan $p, string $jenis): TesSesi
    {
        return $p->sesi()->where('jenis', $jenis)->firstOrFail();
    }

    /** Peserta bergabung lewat token lalu mengisi biodata; mengembalikan barisnya. */
    private function pesertaMasuk(string $token, string $nip, string $nama = 'Peserta'): TesPeserta
    {
        auth()->guard('web')->logout();
        $this->flushSession();
        $this->post('/edukasi/tes/masuk', ['token' => $token])->assertSessionHasNoErrors()->assertRedirect('/edukasi/tes');
        $peserta = TesPeserta::latest('id')->firstOrFail();
        $this->withSession(['tes_peserta_id' => $peserta->id])->post('/edukasi/tes/biodata', [
            'nama' => $nama,
            'nip' => $nip,
            'jabatan' => 'Auditor',
            'opd_id' => $this->opd->id,
        ])->assertSessionHasNoErrors();

        return TesPeserta::findOrFail(session('tes_peserta_id'));
    }

    private function aksi(TesSesi $sesi, string $aksi, ?int $nomor = null): void
    {
        $this->actingAs($this->admin)->postJson("/edukasi/tayang/{$sesi->id}/aksi", ['aksi' => $aksi, 'nomor' => $nomor])->assertOk();
        auth()->guard('web')->logout();
    }

    private function jawab(TesPeserta $p, int $nomor, string $pilihan): TestResponse
    {
        return $this->withSession(['tes_peserta_id' => $p->id])->postJson('/edukasi/tes/jawab', ['nomor' => $nomor, 'pilihan' => $pilihan]);
    }

    public function test_pelatihan_membuat_dua_sesi_dan_berkas_status_tanpa_isi_rahasia(): void
    {
        $this->imporBankSoal();
        $p = $this->buatPelatihan();

        $this->assertCount(2, $p->sesi);
        $pre = $this->sesi($p, 'pre');
        $this->assertSame('draf', $pre->status);
        $this->assertSame('Uji Pre 1', $pre->token);
        $this->assertNotSame('Uji Pre 1', $pre->getRawOriginal('token'), 'Token harus tersimpan terenkripsi.');

        $berkas = Storage::disk('public')->get('tes/'.$pre->kunci_publik.'.json');
        $this->assertJson($berkas);
        $this->assertStringNotContainsString('Pertanyaan rahasia', $berkas);
        $this->assertStringNotContainsString('Uji Pre 1', $berkas);
    }

    public function test_token_dicocokkan_persis_dan_hanya_saat_pendaftaran_dibuka(): void
    {
        $p = $this->buatPelatihan();
        auth()->guard('web')->logout();

        $this->post('/edukasi/tes/masuk', ['token' => 'Uji Pre 1'])->assertSessionHasErrors('token');

        $this->actingAs($this->admin)->post('/edukasi/kelola/sesi/'.$this->sesi($p, 'pre')->id.'/atur', ['aksi' => 'buka']);
        auth()->guard('web')->logout();

        $this->post('/edukasi/tes/masuk', ['token' => 'uji pre 1'])->assertSessionHasErrors('token');
        $this->post('/edukasi/tes/masuk', ['token' => 'UjiPre1'])->assertSessionHasErrors('token');
        $this->post('/edukasi/tes/masuk', ['token' => 'Uji Pre 1'])->assertSessionHasNoErrors();
        $this->assertSame(1, TesPeserta::count());
    }

    /**
     * Tautan berbagi membawa token. Membukanya (GET, seperti robot pratinjau
     * tautan WhatsApp) tidak boleh mendaftarkan peserta; halamannya hanya
     * meneruskan token ke ponsel yang lalu mengirim POST sendiri.
     */
    public function test_tautan_berbagi_tidak_mendaftarkan_peserta_lewat_get(): void
    {
        $p = $this->buatPelatihan();
        $this->actingAs($this->admin)->post('/edukasi/kelola/sesi/'.$this->sesi($p, 'pre')->id.'/atur', ['aksi' => 'buka']);
        auth()->guard('web')->logout();

        $this->get('/edukasi/tes?token='.urlencode('Uji Pre 1'))->assertOk()->assertInertia(fn ($page) => $page
            ->where('tokenAwal', 'Uji Pre 1')
            ->where('tahap', 'token'));
        $this->assertSame(0, TesPeserta::count());

        $this->post('/edukasi/tes/masuk', ['token' => 'Uji Pre 1'])->assertSessionHasNoErrors();
        $this->assertSame(1, TesPeserta::count());
    }

    public function test_nip_wajib_18_angka_kecuali_bukan_asn(): void
    {
        $p = $this->buatPelatihan();
        $this->actingAs($this->admin)->post('/edukasi/kelola/sesi/'.$this->sesi($p, 'pre')->id.'/atur', ['aksi' => 'buka']);
        auth()->guard('web')->logout();
        $this->post('/edukasi/tes/masuk', ['token' => 'Uji Pre 1']);
        $peserta = TesPeserta::firstOrFail();

        $this->withSession(['tes_peserta_id' => $peserta->id])
            ->post('/edukasi/tes/biodata', ['nama' => 'A', 'nip' => '12345', 'jabatan' => 'Staf', 'opd_id' => $this->opd->id])
            ->assertSessionHasErrors('nip');

        $this->withSession(['tes_peserta_id' => $peserta->id])
            ->post('/edukasi/tes/biodata', ['nama' => 'Tokoh Masyarakat', 'bukan_asn' => true, 'jabatan' => 'Keuchik', 'instansi_lain' => 'Gampong Ujong Baroh'])
            ->assertSessionHasNoErrors();

        $peserta->refresh();
        $this->assertTrue($peserta->bukan_asn);
        $this->assertNull($peserta->nip);
        $this->assertNotNull($peserta->biodata_pada);
    }

    public function test_jawaban_hanya_diterima_untuk_soal_yang_sedang_dibuka(): void
    {
        $this->imporBankSoal();
        $p = $this->buatPelatihan();
        $pre = $this->sesi($p, 'pre');
        $this->actingAs($this->admin)->post("/edukasi/kelola/sesi/{$pre->id}/atur", ['aksi' => 'buka']);
        $peserta = $this->pesertaMasuk('Uji Pre 1', '198001012005011001');

        $this->jawab($peserta, 1, 'A')->assertStatus(409);

        $this->aksi($pre, 'mulai');
        $this->aksi($pre, 'buka', 1);
        $this->jawab($peserta, 2, 'A')->assertStatus(409);
        $this->jawab($peserta, 1, 'C')->assertOk();
        $this->jawab($peserta, 1, 'A')->assertOk()->assertJsonPath('pilihan', 'A');

        $jawaban = TesJawaban::firstOrFail();
        $this->assertSame('A', $jawaban->pilihan);
        $this->assertSame(1, (int) $jawaban->diubah);

        $this->aksi($pre, 'tutup');
        $this->jawab($peserta, 1, 'B')->assertStatus(409);
        $this->assertSame('A', $jawaban->fresh()->pilihan);
    }

    public function test_nip_yang_sama_dari_perangkat_lain_melanjutkan_peserta_yang_sama(): void
    {
        $this->imporBankSoal();
        $p = $this->buatPelatihan();
        $pre = $this->sesi($p, 'pre');
        $this->actingAs($this->admin)->post("/edukasi/kelola/sesi/{$pre->id}/atur", ['aksi' => 'buka']);
        $pertama = $this->pesertaMasuk('Uji Pre 1', '198001012005011001', 'Rahmat');
        $this->aksi($pre, 'mulai');
        $this->aksi($pre, 'buka', 1);
        $this->jawab($pertama, 1, 'A')->assertOk();

        $kedua = $this->pesertaMasuk('Uji Pre 1', '198001012005011001', 'Rahmat');

        $this->assertSame($pertama->id, $kedua->id);
        $this->assertSame(1, (int) $kedua->pindah_perangkat);
        $this->assertSame(1, TesPeserta::where('sesi_id', $pre->id)->count());
        $this->assertSame(1, TesJawaban::where('peserta_id', $pertama->id)->count());
    }

    public function test_peserta_yang_dikeluarkan_tidak_bisa_menjawab_dan_tidak_dinilai(): void
    {
        $this->imporBankSoal();
        $p = $this->buatPelatihan();
        $pre = $this->sesi($p, 'pre');
        $this->actingAs($this->admin)->post("/edukasi/kelola/sesi/{$pre->id}/atur", ['aksi' => 'buka']);
        $peserta = $this->pesertaMasuk('Uji Pre 1', '198001012005011001');
        $this->aksi($pre, 'mulai');
        $this->aksi($pre, 'buka', 1);

        $this->actingAs($this->admin)->postJson("/edukasi/tayang/{$pre->id}/peserta/{$peserta->id}/keluarkan")->assertOk();
        auth()->guard('web')->logout();

        $this->jawab($peserta, 1, 'A')->assertStatus(403);
        $this->assertSame([], app(AnalisisTesService::class)->nilaiSesi($pre->fresh()));
    }

    public function test_nilai_peringkat_dan_pasangan_pre_post(): void
    {
        $this->imporBankSoal();
        $p = $this->buatPelatihan();
        $pre = $this->sesi($p, 'pre');
        $post = $this->sesi($p, 'post');
        foreach ([$pre, $post] as $s) {
            $this->actingAs($this->admin)->post("/edukasi/kelola/sesi/{$s->id}/atur", ['aksi' => 'buka']);
        }

        $aPre = $this->pesertaMasuk('Uji Pre 1', '198001012005011001', 'Ani');
        $bPre = $this->pesertaMasuk('Uji Pre 1', '198002022005012002', 'Budi');
        $this->aksi($pre, 'mulai');
        for ($n = 1; $n <= 4; $n++) {
            $this->aksi($pre, 'buka', $n);
            $this->jawab($aPre, $n, $n <= 2 ? 'A' : 'D')->assertOk();   // Ani: 2 benar
            $this->jawab($bPre, $n, 'A')->assertOk();                    // Budi: 4 benar
            $this->aksi($pre, 'tutup');
        }
        $this->aksi($pre, 'selesai');

        $aPost = $this->pesertaMasuk('uji-post', '198001012005011001', 'Ani');
        $bPost = $this->pesertaMasuk('uji-post', '198002022005012002', 'Budi');
        $this->aksi($post, 'mulai');
        for ($n = 1; $n <= 10; $n++) {
            $this->aksi($post, 'buka', $n);
            $this->jawab($aPost, $n, 'B')->assertOk();                   // Ani: 10 benar
            $this->jawab($bPost, $n, $n <= 6 ? 'B' : 'C')->assertOk();   // Budi: 6 benar
            $this->aksi($post, 'tutup');
        }
        $this->aksi($post, 'selesai');

        $analisis = app(AnalisisTesService::class)->lengkap($p->fresh());

        // Tanggal dan jam mengisi tercatat untuk admin: jawaban pertama,
        // terakhir, dan jam tiap nomor.
        $budiPre = $analisis['pre']['peserta'][0];
        $this->assertNotNull($budiPre['bergabung_pada']);
        $this->assertNotNull($budiPre['biodata_pada']);
        $this->assertNotNull($budiPre['jawaban_pertama']);
        $this->assertNotNull($budiPre['jawaban_terakhir']);
        $this->assertCount(4, $budiPre['dijawab_pada']);

        $this->assertSame('Budi', $analisis['pre']['peserta'][0]['nama']);
        $this->assertEquals(20.0, $analisis['pre']['peserta'][0]['nilai']);
        $this->assertSame('Ani', $analisis['post']['peserta'][0]['nama']);
        $this->assertEquals(50.0, $analisis['post']['peserta'][0]['nilai']);
        $this->assertCount(2, $analisis['pasangan']);

        $ani = collect($analisis['pasangan'])->firstWhere('nama', 'Ani');
        $this->assertEquals(10.0, $ani['pre']);
        $this->assertEquals(40.0, $ani['kenaikan']);
        $this->assertEqualsWithDelta(40 / 90, $ani['ngain'], 0.001);
        $this->assertSame(2, $analisis['peningkatan']['n']);

        // Hasil di ponsel peserta sendiri, termasuk nilai pre-test-nya.
        $this->withSession(['tes_peserta_id' => $aPost->id])->get('/edukasi/tes')->assertOk()->assertInertia(fn ($page) => $page
            ->where('tahap', 'selesai')
            ->where('hasil.peringkat', 1)
            ->where('hasil.nilai_pre', 10));
    }

    /**
     * Nilai sama: yang menang adalah milidetik jawaban BENAR tersedikit
     * (keputusan pemilik aplikasi). Jawaban salah yang lama tidak
     * merugikan, dan melewatkan soal tidak menguntungkan.
     */
    public function test_nilai_sama_diurutkan_menurut_milidetik_jawaban_benar(): void
    {
        $this->imporBankSoal();
        $pre = $this->sesi($this->buatPelatihan(), 'pre');
        $buat = fn (string $nama, string $nip) => TesPeserta::create([
            'sesi_id' => $pre->id, 'perangkat_hash' => hash('sha256', $nip), 'nama' => $nama, 'nip' => $nip,
            'jabatan' => 'Staf', 'opd_id' => $this->opd->id, 'biodata_pada' => now(),
        ]);
        $jawab = fn (TesPeserta $x, int $nomor, string $pilihan, int $ms) => TesJawaban::create([
            'sesi_id' => $pre->id, 'peserta_id' => $x->id, 'nomor' => $nomor, 'pilihan' => $pilihan, 'waktu_ms' => $ms, 'dijawab_pada' => now(),
        ]);

        $lambat = $buat('Lambat', '198001012005011001');
        $cepat = $buat('Cepat', '198001012005011002');
        $lewat = $buat('Melewatkan', '198001012005011003');
        // Ketiganya dua benar (nilai sama 10). Kunci pre = A.
        $jawab($lambat, 1, 'A', 5001);
        $jawab($lambat, 2, 'A', 5000);   // jawaban benar 10.001 ms
        $jawab($cepat, 1, 'A', 4999);
        $jawab($cepat, 2, 'A', 5000);    // jawaban benar 9.999 ms
        $jawab($cepat, 3, 'B', 20000);   // salah dan lama: tidak dihitung
        $jawab($lewat, 1, 'A', 5000);
        $jawab($lewat, 2, 'A', 5000);    // jawaban benar 10.000 ms, soal 3 dilewati

        $nilai = app(AnalisisTesService::class)->nilaiSesi($pre);

        $this->assertSame(['Cepat', 'Melewatkan', 'Lambat'], array_column($nilai, 'nama'));
        $this->assertSame([10.0, 10.0, 10.0], array_map('floatval', array_column($nilai, 'nilai')));
        $this->assertSame([9999, 10000, 10001], array_column($nilai, 'waktu_benar_ms'));
    }

    public function test_ponsel_peserta_tidak_menerima_soal_kunci_maupun_daftar_rute(): void
    {
        $this->imporBankSoal();
        $p = $this->buatPelatihan();
        $pre = $this->sesi($p, 'pre');
        $this->actingAs($this->admin)->post("/edukasi/kelola/sesi/{$pre->id}/atur", ['aksi' => 'buka']);
        $peserta = $this->pesertaMasuk('Uji Pre 1', '198001012005011001');
        $this->aksi($pre, 'mulai');
        $this->aksi($pre, 'buka', 1);

        $isi = $this->withSession(['tes_peserta_id' => $peserta->id])->get('/edukasi/tes')->assertOk()->getContent();

        $this->assertStringNotContainsString('Pertanyaan rahasia', $isi);
        $this->assertStringNotContainsString('Pembahasan', $isi);
        $this->assertStringNotContainsString('kunci', $isi);
        $this->assertSame(0, preg_match_all('/"[a-z0-9._-]+":\{"uri":/', $isi));
    }

    public function test_denyut_mencatat_keluar_halaman(): void
    {
        $p = $this->buatPelatihan();
        $pre = $this->sesi($p, 'pre');
        $this->actingAs($this->admin)->post("/edukasi/kelola/sesi/{$pre->id}/atur", ['aksi' => 'buka']);
        $peserta = $this->pesertaMasuk('Uji Pre 1', '198001012005011001');

        $this->withSession(['tes_peserta_id' => $peserta->id])->postJson('/edukasi/tes/denyut', ['halaman' => 'keluar'])->assertOk()->assertJsonPath('status.status', 'lobi');
        $this->withSession(['tes_peserta_id' => $peserta->id])->postJson('/edukasi/tes/denyut', ['halaman' => 'aktif'])->assertOk();
        $this->withSession(['tes_peserta_id' => $peserta->id])->postJson('/edukasi/tes/denyut', ['halaman' => 'keluar'])->assertOk();

        $peserta->refresh();
        $this->assertSame(2, (int) $peserta->jumlah_keluar);
        $this->assertFalse($peserta->di_halaman);
    }

    public function test_akun_peninjau_di_ponsel_peserta_tetap_bisa_menjawab(): void
    {
        $this->imporBankSoal();
        $p = $this->buatPelatihan();
        $pre = $this->sesi($p, 'pre');
        $this->actingAs($this->admin)->post("/edukasi/kelola/sesi/{$pre->id}/atur", ['aksi' => 'buka']);
        $peserta = $this->pesertaMasuk('Uji Pre 1', '198001012005011001');
        $this->aksi($pre, 'mulai');
        $this->aksi($pre, 'buka', 1);

        Role::findOrCreate('eksekutif', 'web');
        $peninjau = User::factory()->create();
        $peninjau->assignRole('eksekutif');

        $this->actingAs($peninjau)->withSession(['tes_peserta_id' => $peserta->id])
            ->postJson('/edukasi/tes/jawab', ['nomor' => 1, 'pilihan' => 'A'])->assertOk();
    }

    public function test_halaman_pemandu_hanya_untuk_admin(): void
    {
        $p = $this->buatPelatihan();
        $pre = $this->sesi($p, 'pre');
        $pic = User::factory()->create();
        $pic->assignRole('user');

        foreach (['/edukasi/kelola', "/edukasi/tayang/{$pre->id}", "/edukasi/pantau/{$pre->id}", "/edukasi/tayang/{$pre->id}/statistik", "/edukasi/hasil/{$p->id}", "/edukasi/hasil/{$p->id}/excel"] as $url) {
            $this->actingAs($pic)->get($url)->assertForbidden();
        }
        $this->actingAs($pic)->postJson("/edukasi/tayang/{$pre->id}/aksi", ['aksi' => 'mulai'])->assertForbidden();

        $this->actingAs($this->admin)->get('/edukasi/kelola')->assertOk();
        $this->actingAs($this->admin)->get("/edukasi/hasil/{$p->id}")->assertOk();
        $this->actingAs($this->admin)->get("/edukasi/hasil/{$p->id}/excel")->assertOk();
    }

    public function test_impor_bank_soal_menolak_kunci_yang_tidak_sah(): void
    {
        $berkas = UploadedFile::fake()->createWithContent('bank.json', json_encode(['pre' => [[
            'nomor' => 1, 'bagian' => 1, 'indikator' => 'x', 'pertanyaan' => 'y',
            'pilihan' => ['A' => 'a', 'B' => 'b', 'C' => 'c', 'D' => 'd'], 'kunci' => 'E',
        ]]]));

        $this->actingAs($this->admin)->post('/edukasi/kelola/soal/impor', ['berkas' => $berkas])->assertSessionHasErrors('berkas');
        $this->assertSame(0, TesSoal::count());
    }

    public function test_nilai_p_uji_t_sesuai_tabel(): void
    {
        $this->assertEqualsWithDelta(0.0734, AnalisisTesService::pDuaSisi(2.0, 10), 0.0001);
        $this->assertEqualsWithDelta(0.05, AnalisisTesService::pDuaSisi(2.228, 10), 0.0001);
        $this->assertEqualsWithDelta(0.00103, AnalisisTesService::pDuaSisi(3.5, 47), 0.00001);

        $uji = AnalisisTesService::ujiTBerpasangan([10, 20, 30, 40, 50]);
        $this->assertSame(4, $uji['df']);
        // rata-rata 30, simpangan baku sqrt(250) = 15,81; t = 30 / (15,81 / sqrt(5)) = 4,243
        $this->assertEqualsWithDelta(4.243, $uji['t'], 0.001);
        $this->assertTrue($uji['signifikan']);
    }
}
