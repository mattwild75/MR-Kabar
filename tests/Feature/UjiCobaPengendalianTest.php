<?php

namespace Tests\Feature;

use App\Models\IroPd;
use App\Models\MonitoringRtp;
use App\Models\Opd;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Uji coba penerapan pengendalian pada Form 9 Pemantauan.
 *
 * Perdep PPKD 4/2019 halaman berlabel 76 merinci enam langkah membangun
 * infrastruktur pengendalian: langkah ke-4 melakukan uji coba, ke-5
 * menyempurnakan rancangan berdasarkan hasilnya, baru ke-6 menetapkan
 * penerapannya. Aplikasi sebelumnya melompat dari rencana pemantauan langsung
 * ke realisasi.
 */
class UjiCobaPengendalianTest extends TestCase
{
    use RefreshDatabase;

    private const TAHUN = 2026;

    private Opd $opd;

    private User $pic;

    private IroPd $risiko;

    protected function setUp(): void
    {
        parent::setUp();

        foreach (['admin', 'super-admin', 'user'] as $nama) {
            Role::findOrCreate($nama, 'web');
        }

        $this->opd = Opd::create(['nama' => 'Dinas Kesehatan']);
        $this->pic = User::factory()->create(['opd_id' => $this->opd->id]);
        $this->pic->assignRole('user');

        $this->risiko = IroPd::create([
            'user_id' => $this->pic->id,
            'URAIAN RISIKO' => 'Berkas peserta tidak terverifikasi',
            'TAHUN DINILAI RISIKO' => (string) self::TAHUN,
            'RENCANA TINDAK PENGENDALIAN' => 'Menyusun prosedur baku verifikasi berkas peserta',
        ]);
    }

    private function muatan(array $tambahan = []): array
    {
        return array_merge([
            'rtp_sumber_tipe' => 'iro_pd',
            'rtp_sumber_id' => $this->risiko->id,
            'opd_id' => $this->opd->id,
            'tahun' => self::TAHUN,
            'metode_pemantauan' => 'Konfirmasi berkala',
        ], $tambahan);
    }

    public function test_uji_coba_tersimpan_lengkap_dengan_hasilnya(): void
    {
        $hasil = 'Alur berjalan, tetapi formulir isian terlalu panjang sehingga kolom penerima terlewat.';

        $this->actingAs($this->pic)
            ->post('/monitoring-evaluasi/8-9', $this->muatan([
                'uji_coba_triwulan' => 'II',
                'uji_coba_tahun' => 2026,
                'uji_coba_hasil' => $hasil,
            ]))
            ->assertSessionHasNoErrors();

        $baris = MonitoringRtp::firstOrFail();
        $this->assertSame('II', $baris->uji_coba_triwulan);
        $this->assertSame(2026, (int) $baris->uji_coba_tahun);
        $this->assertSame($hasil, $baris->uji_coba_hasil);
    }

    public function test_triwulan_uji_coba_di_luar_pilihan_baku_ditolak(): void
    {
        $this->actingAs($this->pic)
            ->post('/monitoring-evaluasi/8-9', $this->muatan(['uji_coba_triwulan' => 'V']))
            ->assertSessionHasErrors('uji_coba_triwulan');
    }

    public function test_tahun_uji_coba_harus_empat_angka(): void
    {
        $this->actingAs($this->pic)
            ->post('/monitoring-evaluasi/8-9', $this->muatan(['uji_coba_tahun' => 26]))
            ->assertSessionHasErrors('uji_coba_tahun');
    }

    /**
     * Uji coba adalah keterangan tambahan di luar kolom a-g baku Lampiran 5,
     * jadi tidak boleh menjadi syarat baru — memaksakannya akan mengubah angka
     * kepatuhan seluruh OPD tanpa satu pun data berubah.
     */
    public function test_uji_coba_boleh_dikosongkan(): void
    {
        $this->actingAs($this->pic)
            ->post('/monitoring-evaluasi/8-9', $this->muatan())
            ->assertSessionHasNoErrors();

        $baris = MonitoringRtp::firstOrFail();
        $this->assertNull($baris->uji_coba_triwulan);
        $this->assertNull($baris->uji_coba_hasil);
    }

    public function test_halaman_mengirim_kembali_isian_uji_coba(): void
    {
        $this->actingAs($this->pic)->post('/monitoring-evaluasi/8-9', $this->muatan([
            'uji_coba_triwulan' => 'III',
            'uji_coba_tahun' => 2026,
            'uji_coba_hasil' => 'Diuji pada tiga kecamatan.',
        ]));

        $this->actingAs($this->pic)
            ->get('/monitoring-evaluasi/8-9?tahun='.self::TAHUN)
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->has('rows', 1)
                ->where('rows.0.uji_coba_triwulan', 'III')
                ->where('rows.0.uji_coba_tahun', 2026)
                ->where('rows.0.uji_coba_hasil', 'Diuji pada tiga kecamatan.'));
    }

    /**
     * Bukti uji coba menempel pada baris MonitoringRtp yang sama dengan bukti
     * Form 8 dan Form 9, jadi slug-nya harus terpisah supaya ketiganya tidak
     * tercampur dalam satu daftar.
     */
    public function test_bukti_uji_coba_terpisah_dari_bukti_form_8_dan_9(): void
    {
        $this->actingAs($this->pic)->post('/monitoring-evaluasi/8-9', $this->muatan());
        $baris = MonitoringRtp::firstOrFail();

        foreach (['monitoring_rtp_uji_coba', 'monitoring_rtp_pemantauan', 'monitoring_rtp_komunikasi'] as $tipe) {
            $this->actingAs($this->pic)
                ->getJson("/risk-evidence/{$tipe}/{$baris->id}")
                ->assertOk()
                ->assertJsonCount(0, 'files');
        }
    }

    /**
     * Jenis bukti baru harus tunduk pada penjaga kepemilikan yang sama dengan
     * jenis bukti lain. Jawabannya 404, bukan 403, karena kepemilikan
     * ditegakkan di dalam kueri — dengan begitu keberadaan baris milik OPD
     * lain tidak terungkap sama sekali.
     */
    public function test_bukti_uji_coba_milik_opd_lain_tidak_dapat_dibuka(): void
    {
        $this->actingAs($this->pic)->post('/monitoring-evaluasi/8-9', $this->muatan());
        $baris = MonitoringRtp::firstOrFail();

        $opdLain = Opd::create(['nama' => 'Dinas Pendidikan']);
        $picLain = User::factory()->create(['opd_id' => $opdLain->id]);
        $picLain->assignRole('user');

        $this->actingAs($picLain)
            ->getJson("/risk-evidence/monitoring_rtp_uji_coba/{$baris->id}")
            ->assertNotFound();
    }
}
