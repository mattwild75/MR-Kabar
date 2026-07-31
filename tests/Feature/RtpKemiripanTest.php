<?php

namespace Tests\Feature;

use App\Models\CeeRtp;
use App\Models\CeeUnsur;
use App\Models\IroPd;
use App\Models\Opd;
use App\Models\RtpKemiripanDiabaikan;
use App\Models\User;
use App\Services\RtpKemiripanService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Penyelarasan RTP agar tidak duplikatif.
 *
 * Perdep PPKD 4/2019 meminta dokumen RTP akhir diselaraskan: RTP perbaikan
 * lingkungan pengendalian (dari CEE) dan RTP perbaikan kegiatan pengendalian
 * (dari register risiko) bisa merumuskan kebutuhan pengendalian yang sama,
 * sehingga satu pekerjaan dipantau dua kali dan capaiannya terhitung ganda.
 *
 * Yang diuji: kemiripan tertangkap, tidak melintasi batas OPD dan tahun, tidak
 * pernah memblokir penyimpanan, dan dapat ditutup permanen dari kedua sisi.
 */
class RtpKemiripanTest extends TestCase
{
    use RefreshDatabase;

    private const TAHUN = 2026;

    private Opd $opd;
    private Opd $opdLain;

    protected function setUp(): void
    {
        parent::setUp();

        foreach (['admin', 'super-admin', 'user'] as $nama) {
            Role::findOrCreate($nama, 'web');
        }

        $this->opd = Opd::create(['nama' => 'Dinas Kesehatan']);
        $this->opdLain = Opd::create(['nama' => 'Dinas Pendidikan']);
    }

    private function layanan(): RtpKemiripanService
    {
        return app(RtpKemiripanService::class);
    }

    private function pengguna(Opd $opd, string $peran = 'admin'): User
    {
        $u = User::factory()->create(['opd_id' => $opd->id]);
        $u->assignRole($peran);

        return $u;
    }

    /**
     * Bentuk baris seperti keluaran rtpGabungan(), cukup kolom yang dibaca
     * pendeteksi kemiripan.
     */
    private function baris(string $tipe, int $id, string $label, ?int $opdId = null, ?int $tahun = null): array
    {
        return [
            'tipe' => $tipe,
            'id' => $id,
            'label' => $label,
            'konteks' => 'konteks ' . $id,
            'opd_id' => $opdId ?? $this->opd->id,
            'tahun' => $tahun ?? self::TAHUN,
        ];
    }

    // --- pendeteksian ----------------------------------------------------

    public function test_rtp_cee_dan_rtp_risiko_yang_serupa_saling_ditandai(): void
    {
        $hasil = $this->layanan()->tandai([
            $this->baris('cee_rtp', 1, 'Menyusun standar operasional prosedur verifikasi berkas peserta'),
            $this->baris('iro_pd', 7, 'Menyusun prosedur baku verifikasi berkas peserta jaminan kesehatan'),
        ]);

        $this->assertCount(1, $hasil[0]['kemiripan'], 'RTP CEE seharusnya menemukan padanannya');
        $this->assertCount(1, $hasil[1]['kemiripan'], 'penandaan harus dua arah');
        $this->assertSame('iro_pd', $hasil[0]['kemiripan'][0]['tipe']);
        $this->assertSame(7, $hasil[0]['kemiripan'][0]['id']);
        $this->assertGreaterThanOrEqual(60, $hasil[0]['kemiripan'][0]['skor']);
    }

    public function test_rtp_yang_pokoknya_berbeda_tidak_ditandai(): void
    {
        $hasil = $this->layanan()->tandai([
            $this->baris('cee_rtp', 1, 'Menyelenggarakan pelatihan kode etik bagi seluruh pegawai'),
            $this->baris('iro_pd', 7, 'Membangun aplikasi pendataan ibu hamil pada tiap kecamatan'),
        ]);

        $this->assertSame([], $hasil[0]['kemiripan']);
        $this->assertSame([], $hasil[1]['kemiripan']);
    }

    /**
     * Dua RTP berbeda yang sama-sama memuat kata umum tidak boleh terhitung
     * mirip hanya karena itu.
     */
    public function test_kata_umum_saja_tidak_cukup_untuk_dianggap_mirip(): void
    {
        $hasil = $this->layanan()->tandai([
            $this->baris('cee_rtp', 1, 'Melakukan sosialisasi kepada seluruh pegawai secara berkala'),
            $this->baris('iro_pd', 7, 'Melakukan pemutakhiran basis data aset secara berkala'),
        ]);

        $this->assertSame([], $hasil[0]['kemiripan']);
    }

    public function test_kemiripan_tidak_melintasi_batas_opd(): void
    {
        $sama = 'Menyusun standar operasional prosedur verifikasi berkas peserta';
        $hasil = $this->layanan()->tandai([
            $this->baris('cee_rtp', 1, $sama, $this->opd->id),
            $this->baris('iro_pd', 7, $sama, $this->opdLain->id),
        ]);

        $this->assertSame([], $hasil[0]['kemiripan'], 'dua OPD memang boleh punya rencana serupa');
        $this->assertSame([], $hasil[1]['kemiripan']);
    }

    public function test_kemiripan_tidak_melintasi_batas_tahun(): void
    {
        $sama = 'Menyusun standar operasional prosedur verifikasi berkas peserta';
        $hasil = $this->layanan()->tandai([
            $this->baris('cee_rtp', 1, $sama, null, 2025),
            $this->baris('iro_pd', 7, $sama, null, 2026),
        ]);

        $this->assertSame([], $hasil[0]['kemiripan'], 'RTP tahun berbeda memang boleh berulang');
    }

    /**
     * RTP disimpan sebagai "Kategori (uraian)" oleh isian berkategori. Dua RTP
     * berbeda tidak menjadi mirip hanya karena kategorinya sama.
     */
    public function test_awalan_kategori_respon_risiko_tidak_membuat_dua_rtp_jadi_mirip(): void
    {
        $hasil = $this->layanan()->tandai([
            $this->baris('cee_rtp', 1, 'Mitigate (Menyelenggarakan pelatihan kode etik bagi pegawai)'),
            $this->baris('iro_pd', 7, 'Mitigate (Membangun aplikasi pendataan ibu hamil kecamatan)'),
        ]);

        $this->assertSame([], $hasil[0]['kemiripan']);
    }

    public function test_susunan_kalimat_berbeda_dengan_maksud_sama_tetap_tertangkap(): void
    {
        $hasil = $this->layanan()->tandai([
            $this->baris('cee_rtp', 1, 'Menyusun pedoman pengelolaan arsip kepegawaian'),
            $this->baris('irs_pd', 3, 'Pengelolaan arsip kepegawaian disusun pedomannya'),
        ]);

        $this->assertCount(1, $hasil[0]['kemiripan']);
    }

    public function test_baris_tanpa_rumusan_tidak_menimbulkan_kemiripan_palsu(): void
    {
        $hasil = $this->layanan()->tandai([
            $this->baris('cee_rtp', 1, ''),
            $this->baris('iro_pd', 7, ''),
        ]);

        $this->assertSame([], $hasil[0]['kemiripan']);
        $this->assertSame([], $hasil[1]['kemiripan']);
    }

    // --- pengabaian ------------------------------------------------------

    /**
     * Kemiripan itu dua arah. Pengabaian yang disimpan dari sisi A harus juga
     * dikenali dari sisi B, kalau tidak lencananya tetap muncul sebelah dan
     * terkesan tidak bisa dihilangkan.
     */
    public function test_pasangan_yang_sudah_diperiksa_hilang_dari_kedua_sisi(): void
    {
        $daftar = [
            $this->baris('cee_rtp', 1, 'Menyusun standar operasional prosedur verifikasi berkas peserta'),
            $this->baris('iro_pd', 7, 'Menyusun prosedur baku verifikasi berkas peserta jaminan kesehatan'),
        ];

        $this->assertCount(1, $this->layanan()->tandai($daftar)[0]['kemiripan']);

        // Sengaja disimpan dengan urutan TERBALIK dari cara pemeriksaannya.
        [$tipeA, $idA, $tipeB, $idB] = RtpKemiripanDiabaikan::bakukan('iro_pd', 7, 'cee_rtp', 1);
        RtpKemiripanDiabaikan::create([
            'tipe_a' => $tipeA, 'id_a' => $idA, 'tipe_b' => $tipeB, 'id_b' => $idB,
        ]);

        $sesudah = $this->layanan()->tandai($daftar);
        $this->assertSame([], $sesudah[0]['kemiripan']);
        $this->assertSame([], $sesudah[1]['kemiripan']);
    }

    public function test_kunci_pasangan_sama_apa_pun_urutan_penyebutannya(): void
    {
        $this->assertSame(
            RtpKemiripanDiabaikan::kunci('cee_rtp', 1, 'iro_pd', 7),
            RtpKemiripanDiabaikan::kunci('iro_pd', 7, 'cee_rtp', 1),
        );
    }

    // --- penjaga hak akses ----------------------------------------------

    /**
     * Tanpa penjaga ini, siapa pun yang bisa membuka Monitoring dapat
     * membungkam peringatan atas RTP OPD lain hanya dengan menebak id-nya.
     */
    public function test_tidak_dapat_mengabaikan_kemiripan_rtp_milik_opd_lain(): void
    {
        $unsur = CeeUnsur::create(['kode' => 'A', 'nama' => 'Penegakan Integritas', 'urutan' => 1]);
        $ceeMilikOpdLain = CeeRtp::create([
            'opd_id' => $this->opdLain->id,
            'tahun_penilaian' => self::TAHUN,
            'cee_unsur_id' => $unsur->id,
            'kondisi_kurang_memadai' => 'Aturan perilaku belum ditandatangani',
            'rencana_tindak_pengendalian' => 'Menyusun aturan perilaku',
        ]);
        $iroMilikOpdLain = IroPd::create([
            'user_id' => $this->pengguna($this->opdLain, 'user')->id,
            'URAIAN RISIKO' => 'Risiko uji',
            'TAHUN DINILAI RISIKO' => (string) self::TAHUN,
            'RENCANA TINDAK PENGENDALIAN' => 'Menyusun aturan perilaku pegawai',
        ]);

        $picOpdSendiri = $this->pengguna($this->opd, 'user');

        $this->actingAs($picOpdSendiri)
            ->post('/monitoring-evaluasi/kemiripan/abaikan', [
                'opd_id' => $this->opdLain->id,
                'tipe_a' => 'cee_rtp', 'id_a' => $ceeMilikOpdLain->id,
                'tipe_b' => 'iro_pd', 'id_b' => $iroMilikOpdLain->id,
            ])
            ->assertForbidden();

        $this->assertSame(0, RtpKemiripanDiabaikan::count());
    }

    public function test_rtp_yang_bukan_milik_opd_yang_disebut_ditolak(): void
    {
        $unsur = CeeUnsur::create(['kode' => 'A', 'nama' => 'Penegakan Integritas', 'urutan' => 1]);
        $ceeMilikOpdLain = CeeRtp::create([
            'opd_id' => $this->opdLain->id,
            'tahun_penilaian' => self::TAHUN,
            'cee_unsur_id' => $unsur->id,
            'kondisi_kurang_memadai' => 'Aturan perilaku belum ditandatangani',
            'rencana_tindak_pengendalian' => 'Menyusun aturan perilaku',
        ]);
        $iroMilikOpdIni = IroPd::create([
            'user_id' => $this->pengguna($this->opd, 'user')->id,
            'URAIAN RISIKO' => 'Risiko uji',
            'TAHUN DINILAI RISIKO' => (string) self::TAHUN,
            'RENCANA TINDAK PENGENDALIAN' => 'Menyusun aturan perilaku pegawai',
        ]);

        // Admin boleh lintas-OPD, tetapi pasangannya tetap harus satu OPD.
        $this->actingAs($this->pengguna($this->opd))
            ->post('/monitoring-evaluasi/kemiripan/abaikan', [
                'opd_id' => $this->opd->id,
                'tipe_a' => 'cee_rtp', 'id_a' => $ceeMilikOpdLain->id,
                'tipe_b' => 'iro_pd', 'id_b' => $iroMilikOpdIni->id,
            ])
            ->assertForbidden();

        $this->assertSame(0, RtpKemiripanDiabaikan::count());
    }

    public function test_pasangan_yang_merujuk_rtp_yang_sama_ditolak(): void
    {
        $iro = IroPd::create([
            'user_id' => $this->pengguna($this->opd, 'user')->id,
            'URAIAN RISIKO' => 'Risiko uji',
            'TAHUN DINILAI RISIKO' => (string) self::TAHUN,
            'RENCANA TINDAK PENGENDALIAN' => 'Menyusun aturan perilaku pegawai',
        ]);

        $this->actingAs($this->pengguna($this->opd))
            ->post('/monitoring-evaluasi/kemiripan/abaikan', [
                'opd_id' => $this->opd->id,
                'tipe_a' => 'iro_pd', 'id_a' => $iro->id,
                'tipe_b' => 'iro_pd', 'id_b' => $iro->id,
            ])
            ->assertRedirect();

        $this->assertSame(0, RtpKemiripanDiabaikan::count());
    }

    // --- halaman ---------------------------------------------------------

    public function test_halaman_monitoring_mengirim_kemiripan_dan_tetap_menampilkan_kedua_rtp(): void
    {
        $pic = $this->pengguna($this->opd, 'user');
        $unsur = CeeUnsur::create(['kode' => 'A', 'nama' => 'Penegakan Integritas', 'urutan' => 1]);
        CeeRtp::create([
            'opd_id' => $this->opd->id,
            'tahun_penilaian' => self::TAHUN,
            'cee_unsur_id' => $unsur->id,
            'kondisi_kurang_memadai' => 'Belum ada prosedur baku',
            'rencana_tindak_pengendalian' => 'Menyusun standar operasional prosedur verifikasi berkas peserta',
        ]);
        IroPd::create([
            'user_id' => $pic->id,
            'URAIAN RISIKO' => 'Berkas peserta tidak terverifikasi',
            'TAHUN DINILAI RISIKO' => (string) self::TAHUN,
            'RENCANA TINDAK PENGENDALIAN' => 'Menyusun prosedur baku verifikasi berkas peserta jaminan kesehatan',
        ]);

        $this->actingAs($pic)
            ->get('/monitoring-evaluasi/8-9?tahun=' . self::TAHUN)
            ->assertOk()
            ->assertInertia(fn(AssertableInertia $page) => $page
                // Keduanya TETAP muncul — kemiripan hanya menandai, tidak
                // pernah menyembunyikan atau memblokir.
                ->has('rows', 2)
                ->has('rows.0.kemiripan', 1)
                ->has('rows.1.kemiripan', 1));
    }
}
