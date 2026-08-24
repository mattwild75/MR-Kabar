<?php

namespace Tests\Feature;

use App\Models\Opd;
use App\Models\Pkpt\PkptAreaPengawasan;
use App\Models\Pkpt\PkptBobotKematangan;
use App\Models\Pkpt\PkptEvaluasiRisiko;
use App\Models\Pkpt\PkptFaktor;
use App\Models\Pkpt\PkptFaktorRisiko;
use App\Models\Pkpt\PkptKematanganMr;
use App\Models\Pkpt\PkptPenilaian;
use App\Models\Pkpt\PkptPeriode;
use App\Models\Pkpt\PkptRencana;
use App\Models\Pkpt\PkptSektorUnggulan;
use App\Models\User;
use Database\Seeders\PkptMenuSeeder;
use Database\Seeders\PkptPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Jalur TULIS kertas kerja PKPT.
 *
 * PkptAksesTest membuktikan siapa yang boleh masuk; PkptPerhitunganTest
 * membuktikan rumusnya benar. Yang belum dibuktikan sebelum berkas ini ada
 * adalah bagian di antaranya: bahwa menekan tombol di layar benar-benar
 * menyimpan yang seharusnya.
 *
 * Sepuluh jalur di sini sebelumnya hanya "ditulis lalu dianggap jalan".
 * Halaman-halamannya terbuka rapi pada uji jelajah, tetapi halaman yang
 * terbuka hanya membuktikan jalur BACA — dan itu jenis kepercayaan yang
 * sudah pernah keliru di proyek ini.
 */
class PkptKertasKerjaTest extends TestCase
{
    use RefreshDatabase;

    private PkptPeriode $periode;

    private User $apip;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(PkptPermissionSeeder::class);
        $this->seed(PkptMenuSeeder::class);

        $this->periode = PkptPeriode::create([
            'tahun_pkpt' => 2027,
            'tahun_dasar_risiko' => 2026,
            'total_belanja_langsung' => 1_000_000_000,
        ]);

        $this->apip = User::factory()->create();
        $this->apip->assignRole('apip');
        $this->actingAs($this->apip);
    }

    // ------------------------------------------------------------------
    // Formulir 1 — Peta Auditan
    // ------------------------------------------------------------------

    public function test_tarik_peta_auditan_membuat_satu_area_per_perangkat_daerah(): void
    {
        Opd::create(['nama' => 'DINAS KESEHATAN']);
        Opd::create(['nama' => 'DINAS SOSIAL']);

        $this->post('/pkpt/peta-auditan/tarik', ['periode' => $this->periode->id])
            ->assertSessionHasNoErrors();

        $this->assertSame(2, PkptAreaPengawasan::where('kelompok', 'skpk')->count());
    }

    /**
     * Penarikan kedua tidak menggandakan dan tidak menghapus suntingan tangan.
     *
     * Pagu anggaran dan pembagian Irban diisi orang; kalau tombol Tarik
     * menimpanya, pekerjaan sehari hilang oleh satu klik.
     */
    public function test_tarik_ulang_tidak_menggandakan_dan_tidak_menimpa_suntingan(): void
    {
        Opd::create(['nama' => 'DINAS KESEHATAN']);

        $this->post('/pkpt/peta-auditan/tarik', ['periode' => $this->periode->id]);

        $area = PkptAreaPengawasan::first();
        $area->update(['pagu_anggaran' => 5_000_000, 'irban' => 'II']);

        $this->post('/pkpt/peta-auditan/tarik', ['periode' => $this->periode->id]);

        $this->assertSame(1, PkptAreaPengawasan::count(), 'Penarikan kedua tidak boleh menggandakan');
        $this->assertSame(5_000_000, $area->fresh()->pagu_anggaran);
        $this->assertSame('II', $area->fresh()->irban);
    }

    // ------------------------------------------------------------------
    // Formulir 3 — Kematangan MR
    // ------------------------------------------------------------------

    public function test_adopsi_skor_spip_menetapkan_level_dan_bobot_seluruh_perangkat_daerah(): void
    {
        Opd::create(['nama' => 'DINAS A']);
        Opd::create(['nama' => 'DINAS B']);

        $this->post('/pkpt/kematangan-mr/adopsi-spip', [
            'periode' => $this->periode->id,
            'skor_spip' => 2.5,
        ])->assertSessionHasNoErrors();

        $this->assertSame(2, PkptKematanganMr::count());

        $k = PkptKematanganMr::first();
        $this->assertSame(2, $k->level_mr, 'Skor 2,5 jatuh di Level 2');
        $this->assertSame(40, $k->bobot_register, 'Level 2 berbobot 40 banding 60');
        $this->assertSame(60, $k->bobot_faktor);
        $this->assertSame('maturitas_spip_pemda', $k->sumber_penetapan);
    }

    /** Tanpa penanda timpa, level yang sudah ditetapkan tangan dipertahankan. */
    public function test_adopsi_spip_tidak_menimpa_level_yang_sudah_ditetapkan(): void
    {
        $opd = Opd::create(['nama' => 'DINAS A']);

        $this->put("/pkpt/kematangan-mr/{$opd->id}", [
            'periode' => $this->periode->id,
            'level_mr' => 4,
            'sumber_penetapan' => 'penilaian_inspektorat',
        ])->assertSessionHasNoErrors();

        $this->post('/pkpt/kematangan-mr/adopsi-spip', [
            'periode' => $this->periode->id,
            'skor_spip' => 1.0,
        ]);

        $k = PkptKematanganMr::where('opd_id', $opd->id)->first();
        $this->assertSame(4, $k->level_mr);
        $this->assertSame(90, $k->bobot_register, 'Level 4 berbobot 90 banding 10');

        // Dengan penanda timpa, barulah berubah.
        $this->post('/pkpt/kematangan-mr/adopsi-spip', [
            'periode' => $this->periode->id,
            'skor_spip' => 1.0,
            'timpa' => true,
        ]);
        $this->assertSame(1, PkptKematanganMr::where('opd_id', $opd->id)->first()->level_mr);
    }

    // ------------------------------------------------------------------
    // Formulir 4 sampai 8 — Faktor Risiko
    // ------------------------------------------------------------------

    /**
     * Skala TIDAK diketik pemakai; ia dihitung dari masukan mentah.
     *
     * Kalau skala bisa diketik langsung, kriteria yang sudah ditetapkan
     * Keputusan Inspektur bisa dilangkahi tanpa meninggalkan jejak.
     */
    public function test_menyimpan_faktor_risiko_menghitung_sendiri_skalanya(): void
    {
        $area = $this->areaSkpk();

        $this->put("/pkpt/faktor-risiko/{$area->id}", [
            'periode' => $this->periode->id,
            'pagu_anggaran' => 120_000_000,   // 12% dari 1 miliar
            'terkait_rpjmd' => true,
            'mendukung_rpjmn' => false,
            'sektor_unggulan' => true,
            'temuan_internal_kurang' => true,
            'potensi_fraud' => true,
            'sorotan_masyarakat' => true,
            'layanan_publik' => true,
            'hajat_hidup' => true,
            'tahun_terakhir_diawasi' => 2024,
            'jumlah_penugasan_sejenis' => 2,
            'catatan_profesional' => 'Rasio indikator kinerja belum tersedia; dinilai dari keterkaitan RPJMD.',
        ])->assertSessionHasNoErrors();

        $f = PkptFaktorRisiko::where('area_id', $area->id)->firstOrFail();

        $this->assertSame(12.0, $f->persen_belanja_langsung, 'Persentase dihitung, bukan diketik');
        $this->assertSame(4, $f->skala_fr1, '12% masuk pita kurang dari 15%');

        // Area kelompok SKPK memakai baris alternatif Tabel 4.3, yaitu rasio
        // indikator kinerja. Rasio itu belum diisi, jadi penilaiannya jatuh ke
        // kombinasi centang: terkait RPJMD + sektor unggulan, tanpa RPJMN,
        // berskala 4. Tanpa cadangan ini FR2 yang berbobot 25% akan selalu
        // null untuk seluruh Area SKPK.
        $this->assertSame(4, $f->skala_fr2);

        $this->assertSame(2, $f->nilai_fr3);
        $this->assertSame(3, $f->skala_fr3, 'Dua kondisi terpenuhi berskala 3');
        $this->assertSame(3, $f->nilai_fr4);
        $this->assertSame(4, $f->skala_fr4);
        $this->assertSame(3, $f->skala_tahun_terakhir, '2027 dikurangi 2024');
        $this->assertSame(3, $f->skala_pengalaman);
        $this->assertSame(3.0, $f->skala_fr5);

        // Pagu ikut tersalin ke Peta Auditan supaya Formulir 1 tetap utuh.
        $this->assertSame(120_000_000, $area->fresh()->pagu_anggaran);
    }

    public function test_salin_pagu_dari_peta_auditan_mengisi_seluruh_baris_faktor(): void
    {
        $area = $this->areaSkpk();
        $area->update(['pagu_anggaran' => 200_000_000]);

        $this->post('/pkpt/faktor-risiko/tarik-pagu', ['periode' => $this->periode->id])
            ->assertSessionHasNoErrors();

        $f = PkptFaktorRisiko::where('area_id', $area->id)->firstOrFail();
        $this->assertSame(200_000_000, $f->pagu_anggaran);
        $this->assertSame(20.0, $f->persen_belanja_langsung);
        $this->assertSame(5, $f->skala_fr1, '20% berada di 15% atau lebih');
    }

    /** Tanpa pembagi, persentase tidak dapat dihitung dan permintaannya ditolak. */
    public function test_salin_pagu_ditolak_bila_belanja_langsung_belum_diisi(): void
    {
        $this->periode->update(['total_belanja_langsung' => null]);
        $this->areaSkpk();

        $this->post('/pkpt/faktor-risiko/tarik-pagu', ['periode' => $this->periode->id])
            ->assertStatus(422);
    }

    /**
     * Skala yang ditetapkan tanpa data pendukung WAJIB beralasan.
     *
     * BAB V huruf A Lampiran Keputusan. Satu-satunya keadaan itu di aplikasi
     * ini adalah FR2 Area kelompok SKPK yang rasio indikator kinerjanya belum
     * ada, sehingga dinilai dari kombinasi centang.
     *
     * Ditegakkan di controller, bukan sekadar diingatkan di layar: kertas
     * kerja yang skalanya tidak bisa dipertanggungjawabkan baru ketahuan
     * ketika Inspektur sudah menandatangani lampirannya.
     */
    public function test_fr2_lewat_cadangan_menuntut_catatan_profesional(): void
    {
        $area = $this->areaSkpk();

        $this->put("/pkpt/faktor-risiko/{$area->id}", [
            'periode' => $this->periode->id,
            'terkait_rpjmd' => true,
        ])->assertSessionHasErrors('catatan_profesional');

        $this->assertSame(0, PkptFaktorRisiko::count(), 'Tidak boleh tersimpan sebagian');

        $this->put("/pkpt/faktor-risiko/{$area->id}", [
            'periode' => $this->periode->id,
            'terkait_rpjmd' => true,
            'catatan_profesional' => 'Rasio indikator kinerja belum dihimpun Bappeda.',
        ])->assertSessionHasNoErrors();

        $this->assertSame(2, PkptFaktorRisiko::first()->skala_fr2);
    }

    /**
     * Rasio indikator kinerja yang terisi membuat catatan tidak lagi dituntut
     * — karena penilaiannya kembali memakai cara yang diminta Tabel 9.
     */
    public function test_rasio_indikator_kinerja_terisi_tidak_menuntut_catatan(): void
    {
        $area = $this->areaSkpk();

        $this->put("/pkpt/faktor-risiko/{$area->id}", [
            'periode' => $this->periode->id,
            'terkait_rpjmd' => true,
            'indikator_kinerja_skpk' => 12,
            'indikator_kinerja_pemda' => 100,
        ])->assertSessionHasNoErrors();

        $this->assertSame(4, PkptFaktorRisiko::first()->skala_fr2, '12% dari total berada di pita 15% atau kurang');
    }

    /**
     * Area SKPK yang belum dinilai sama sekali berskala NULL, bukan 1.
     *
     * Tombol Salin Pagu ikut menghitung ulang seluruh faktor. Kalau cadangan
     * centang berlaku juga saat tak satu pun tercentang, satu klik akan
     * membuat panel Kesiapan Data melaporkan FR2 terisi penuh untuk Area yang
     * belum tersentuh — dan PKPT ditandatangani dengan bobot 25% yang isinya
     * kosong.
     */
    public function test_salin_pagu_tidak_mengarang_skala_fr2(): void
    {
        $area = $this->areaSkpk();
        $area->update(['pagu_anggaran' => 50_000_000]);

        $this->post('/pkpt/faktor-risiko/tarik-pagu', ['periode' => $this->periode->id])
            ->assertSessionHasNoErrors();

        $f = PkptFaktorRisiko::firstOrFail();
        $this->assertSame(3, $f->skala_fr1, 'FR1 memang terisi dari pagunya');
        $this->assertNull($f->skala_fr2, 'FR2 belum dinilai, jadi tetap null');
    }

    // ------------------------------------------------------------------
    // Formulir 2 — Evaluasi Register Risiko
    // ------------------------------------------------------------------

    public function test_menyimpan_evaluasi_register_menghitung_nilai_risikonya(): void
    {
        $risikoId = $this->risikoIrsPd(4, 3);

        $this->put("/pkpt/evaluasi-register/irs_pd/{$risikoId}", [
            'periode' => $this->periode->id,
            'skala_dampak_evaluasi' => 4,
            'skala_kemungkinan_evaluasi' => 4,
            'simpulan' => 'perlu_perbaikan',
            'catatan' => 'Skala kemungkinan dinaikkan berdasarkan data tiga tahun terakhir.',
        ])->assertSessionHasNoErrors();

        $ev = PkptEvaluasiRisiko::firstOrFail();
        $this->assertSame(16, $ev->nilai_risiko_evaluasi, 'Nilai = dampak x kemungkinan');
        $this->assertSame($this->apip->id, $ev->dinilai_oleh);
        $this->assertSame($risikoId, $ev->irs_pd_id);

        // Baris risiko milik SKPK TIDAK boleh ikut berubah.
        $asli = DB::table('tbl_irs_pd')->where('id', $risikoId)->first();
        $this->assertSame('3', (string) $asli->{'SKALA KEMUNGKINAN INHEREN'},
            'Modul PKPT tidak pernah menulis ke tabel risiko');
    }

    /** Simpulan "perlu perbaikan" tanpa alasan tidak berguna bagi pemilik risiko. */
    public function test_simpulan_perlu_perbaikan_wajib_disertai_catatan(): void
    {
        $risikoId = $this->risikoIrsPd(4, 3);

        $this->put("/pkpt/evaluasi-register/irs_pd/{$risikoId}", [
            'periode' => $this->periode->id,
            'skala_dampak_evaluasi' => 4,
            'skala_kemungkinan_evaluasi' => 4,
            'simpulan' => 'perlu_perbaikan',
        ])->assertSessionHasErrors('catatan');

        $this->assertSame(0, PkptEvaluasiRisiko::count());
    }

    public function test_terima_massal_hanya_menyentuh_yang_belum_dievaluasi(): void
    {
        $a = $this->risikoIrsPd(4, 3);
        $b = $this->risikoIrsPd(2, 2);

        $this->put("/pkpt/evaluasi-register/irs_pd/{$a}", [
            'periode' => $this->periode->id,
            'skala_dampak_evaluasi' => 5,
            'skala_kemungkinan_evaluasi' => 5,
            'simpulan' => 'andal',
        ]);

        $this->post('/pkpt/evaluasi-register/terima', [
            'periode' => $this->periode->id,
            'catatan' => 'Register disusun dengan pendampingan Inspektorat, jedanya dekat.',
        ])->assertSessionHasNoErrors();

        $this->assertSame(2, PkptEvaluasiRisiko::count());
        $this->assertSame(25, PkptEvaluasiRisiko::where('irs_pd_id', $a)->first()->nilai_risiko_evaluasi,
            'Yang sudah dinilai tidak boleh ditimpa');
        $this->assertSame(4, PkptEvaluasiRisiko::where('irs_pd_id', $b)->first()->nilai_risiko_evaluasi);
    }

    // ------------------------------------------------------------------
    // Formulir 9 dan 10 — hitung dan pemeringkatan
    // ------------------------------------------------------------------

    public function test_hitung_menulis_penilaian_lengkap_dengan_zona_dan_frekuensi(): void
    {
        $area = $this->areaSkpk();
        $this->risikoIrsPd(5, 5, $area->opd_id);

        $this->post('/pkpt/kematangan-mr/adopsi-spip', [
            'periode' => $this->periode->id, 'skor_spip' => 3.0,
        ]);

        $this->post('/pkpt/hitung', ['periode' => $this->periode->id])
            ->assertSessionHasNoErrors();

        $p = PkptPenilaian::where('area_id', $area->id)->firstOrFail();
        $this->assertSame(1, $p->jumlah_risiko);
        $this->assertSame(25.0, $p->nilai_komposit);
        $this->assertSame(5, $p->skala_inheren);
        $this->assertSame(70, $p->bobot_register, 'Level 3 berbobot 70 banding 30');
        $this->assertSame(5.0, $p->total_nilai_risiko, 'Tanpa faktor, dinilai seluruhnya dari register');
        $this->assertSame('Sangat Tinggi', $p->tingkat_risiko);
        $this->assertSame('Merah', $p->zona);
        $this->assertSame('Setiap tahun', $p->frekuensi);
        $this->assertNotNull($p->keterangan, 'Alasan penilaian sebagian harus tercatat');
    }

    public function test_centang_rencana_tahun_tersimpan_pada_penilaian(): void
    {
        $p = $this->penilaianTerhitung();

        $this->put("/pkpt/peringkat/{$p->id}/tahun", [
            'periode' => $this->periode->id,
            'rencana_tahun' => [2027, 2029],
        ])->assertSessionHasNoErrors();

        $this->assertSame([2027, 2029], $p->fresh()->rencana_tahun);
    }

    // ------------------------------------------------------------------
    // Formulir 13 dan 14 — Jakwas dan PKPT
    // ------------------------------------------------------------------

    /**
     * Penugasan wajib disalin SELURUHNYA, berapa pun nilai risikonya.
     *
     * Diktum KELIMA Keputusan Inspektur. Batas jumlah hanya berlaku bagi Area
     * yang masuk karena peringkat risikonya.
     */
    public function test_tarik_dari_peringkat_menyalin_seluruh_penugasan_wajib(): void
    {
        $this->penilaianTerhitung();

        $this->post('/pkpt/penugasan-wajib', [
            'periode' => $this->periode->id,
            'jenis' => 'wajib',
            'nama_area' => 'Reviu Laporan Keuangan Pemerintah Daerah',
            'alasan' => 'Amanat peraturan perundang-undangan',
        ])->assertSessionHasNoErrors();

        $this->post('/pkpt/rencana/tarik-peringkat', [
            'periode' => $this->periode->id,
            'batas' => 1,
        ])->assertSessionHasNoErrors();

        $this->assertSame(1, PkptRencana::where('sumber', 'wajib')->count());
        $this->assertSame(1, PkptRencana::where('sumber', 'risiko')->count());

        // Ditarik dua kali tidak menggandakan.
        $this->post('/pkpt/rencana/tarik-peringkat', ['periode' => $this->periode->id, 'batas' => 5]);
        $this->assertSame(2, PkptRencana::count());
    }

    public function test_baris_rencana_dapat_ditambah_diubah_dan_dihapus(): void
    {
        $this->post('/pkpt/rencana', [
            'periode' => $this->periode->id,
            'nama_area' => 'Audit Kinerja Dinas Kesehatan',
            'sumber' => 'risiko',
        ])->assertSessionHasNoErrors();

        $r = PkptRencana::firstOrFail();

        $this->put("/pkpt/rencana/{$r->id}", [
            'nama_area' => 'Audit Kinerja Dinas Kesehatan',
            'jenis_pengawasan' => 'Audit Kinerja',
            'sumber' => 'risiko',
            'hp_pj' => 2, 'hp_wpj' => 5, 'hp_kt' => 10, 'hp_at' => 10,
        ])->assertSessionHasNoErrors();

        $this->assertSame(27, $r->fresh()->hp_jumlah, 'Jumlah HP dijumlahkan sendiri');

        $this->delete("/pkpt/rencana/{$r->id}")->assertSessionHasNoErrors();
        $this->assertSame(0, PkptRencana::count());
    }

    // ------------------------------------------------------------------
    // Pengaturan PPBR
    // ------------------------------------------------------------------

    /**
     * Jumlah bobot kelima faktor WAJIB tepat 100.
     *
     * Di luar itu skala gabungannya keluar dari rentang 1 sampai 5, dan
     * seluruh peringkat berhenti sebanding dengan tabel mana pun di Keputusan.
     */
    public function test_bobot_faktor_yang_jumlahnya_bukan_seratus_ditolak(): void
    {
        $admin = User::factory()->create();
        Role::firstOrCreate(['name' => 'admin']);
        $admin->assignRole('admin');

        $bobot = fn (array $angka) => collect(['FR1', 'FR2', 'FR3', 'FR4', 'FR5'])
            ->map(fn ($k, $i) => ['kode' => $k, 'bobot_persen' => $angka[$i]])->all();

        $this->actingAs($admin)
            ->post('/pkpt/pengaturan/bobot-faktor', ['faktor' => $bobot([30, 25, 20, 15, 15])])
            ->assertSessionHasErrors('faktor');

        $this->assertSame(25, PkptFaktor::terurut()->get('FR1')->bobot_persen, 'Tidak boleh tersimpan sebagian');

        $this->actingAs($admin)
            ->post('/pkpt/pengaturan/bobot-faktor', ['faktor' => $bobot([30, 20, 20, 15, 15])])
            ->assertSessionHasNoErrors();

        PkptFaktor::terurut();
        $this->assertSame(30, PkptFaktor::where('kode', 'FR1')->first()->bobot_persen);
    }

    /**
     * Komposisi bobot per tingkat kematangan dapat diubah, dan sisanya
     * dihitung sendiri supaya kedua angkanya selalu berjumlah 100.
     */
    public function test_bobot_kematangan_tersimpan_dan_sisanya_dihitung_sendiri(): void
    {
        $admin = User::factory()->create();
        Role::firstOrCreate(['name' => 'admin']);
        $admin->assignRole('admin');

        $this->actingAs($admin)->post('/pkpt/pengaturan/bobot-kematangan', [
            'bobot' => [
                ['level_mr' => 2, 'bobot_register' => 50],
                ['level_mr' => 3, 'bobot_register' => 80],
            ],
        ])->assertSessionHasNoErrors();

        $l2 = PkptBobotKematangan::where('level_mr', 2)->first();
        $this->assertSame(50, $l2->bobot_register);
        $this->assertSame(50, $l2->bobot_faktor, 'Sisanya dihitung, tidak diketik terpisah');

        $l3 = PkptBobotKematangan::where('level_mr', 3)->first();
        $this->assertSame(80, $l3->bobot_register);
        $this->assertSame(20, $l3->bobot_faktor);

        // Level yang tidak dikirim tidak ikut berubah.
        $this->assertSame(90, PkptBobotKematangan::where('level_mr', 4)->first()->bobot_register);
    }

    /**
     * Mengubah bobot acuan TIDAK mengubah periode yang sudah dihitung.
     *
     * Kertas kerja melekat pada Keputusan yang ditandatangani; bobot yang
     * berlaku saat itu tersimpan pada pkpt_kematangan_mr dan hasilnya pada
     * pkpt_penilaian, bukan dibaca ulang dari tabel acuan.
     */
    public function test_mengubah_bobot_acuan_tidak_menyentuh_periode_yang_sudah_dihitung(): void
    {
        $p = $this->penilaianTerhitung();
        $this->assertSame(70, $p->bobot_register);

        $admin = User::factory()->create();
        Role::firstOrCreate(['name' => 'admin']);
        $admin->assignRole('admin');

        $this->actingAs($admin)->post('/pkpt/pengaturan/bobot-kematangan', [
            'bobot' => [['level_mr' => 3, 'bobot_register' => 10]],
        ])->assertSessionHasNoErrors();

        $this->assertSame(70, $p->fresh()->bobot_register, 'Hasil hitung yang tersimpan tidak ikut berubah');
        $this->assertSame(70, PkptKematanganMr::first()->bobot_register, 'Bobot pada kertas kerja juga tidak');
    }

    public function test_sektor_unggulan_dapat_ditambah_dan_dihapus(): void
    {
        $admin = User::factory()->create();
        Role::firstOrCreate(['name' => 'admin']);
        $admin->assignRole('admin');

        $this->actingAs($admin)
            ->post('/pkpt/pengaturan/sektor-unggulan', [
                'periode' => $this->periode->id,
                'nama' => 'Kelautan dan Perikanan',
            ])->assertSessionHasNoErrors();

        $s = PkptSektorUnggulan::firstOrFail();
        $this->assertSame('Kelautan dan Perikanan', $s->nama);

        // Nama yang sama tidak digandakan.
        $this->actingAs($admin)->post('/pkpt/pengaturan/sektor-unggulan', [
            'periode' => $this->periode->id, 'nama' => 'Kelautan dan Perikanan',
        ]);
        $this->assertSame(1, PkptSektorUnggulan::count());

        $this->actingAs($admin)->delete("/pkpt/pengaturan/sektor-unggulan/{$s->id}")
            ->assertSessionHasNoErrors();
        $this->assertSame(0, PkptSektorUnggulan::count());
    }

    // ------------------------------------------------------------------
    // Pembantu
    // ------------------------------------------------------------------

    private function areaSkpk(string $nama = 'DINAS KESEHATAN'): PkptAreaPengawasan
    {
        $opd = Opd::firstOrCreate(['nama' => $nama]);

        return PkptAreaPengawasan::create([
            'periode_id' => $this->periode->id,
            'kelompok' => 'skpk',
            'nama' => $nama,
            'opd_id' => $opd->id,
        ]);
    }

    /** Satu baris risiko strategis PD milik sebuah Perangkat Daerah. */
    private function risikoIrsPd(int $dampak, int $kemungkinan, ?int $opdId = null): int
    {
        $opdId ??= Opd::firstOrCreate(['nama' => 'DINAS KESEHATAN'])->id;
        $pemilik = User::factory()->create(['opd_id' => $opdId]);

        return DB::table('tbl_irs_pd')->insertGetId([
            'user_id' => $pemilik->id,
            'URAIAN RISIKO' => 'Risiko uji',
            'TAHUN DINILAI RISIKO' => $this->periode->tahun_dasar_risiko,
            'SKALA DAMPAK INHEREN' => $dampak,
            'SKALA KEMUNGKINAN INHEREN' => $kemungkinan,
            'SKALA RISIKO INHEREN' => $dampak * $kemungkinan,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    private function penilaianTerhitung(): PkptPenilaian
    {
        $area = $this->areaSkpk();
        $this->risikoIrsPd(5, 5, $area->opd_id);
        $this->post('/pkpt/kematangan-mr/adopsi-spip', [
            'periode' => $this->periode->id, 'skor_spip' => 3.0,
        ]);
        $this->post('/pkpt/hitung', ['periode' => $this->periode->id]);

        return PkptPenilaian::where('area_id', $area->id)->firstOrFail();
    }
}
