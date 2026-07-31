<?php

namespace Tests\Feature;

use App\Models\RiskLevel;
use App\Models\User;
use App\Services\RiskReferenceDataService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Selera Risiko sebagai data yang dapat digeser, bukan ambang tetap di kode.
 *
 * Sebelumnya batas Risiko Prioritas dicari dengan mencocokkan label "Tinggi"
 * dan "Sangat Tinggi", dan kueri itu disalin ke empat controller cetak. Yang
 * diuji di sini terutama satu hal: menggeser seleranya benar-benar menggeser
 * penetapan Risiko Prioritas, dan menggesernya di satu tempat cukup untuk
 * seluruh aplikasi.
 */
class SeleraRisikoTest extends TestCase
{
    use RefreshDatabase;

    /** Lima level baku, sama dengan isi tabel referensi di lapangan. */
    private function buatLevelBaku(): void
    {
        $baku = [
            ['Sangat Tinggi', 20, 25, 'bg-red-500 text-white', 1, true],
            ['Tinggi', 16, 19, 'bg-orange-400 text-white', 2, true],
            ['Sedang', 11, 15, 'bg-yellow-300 text-black', 3, false],
            ['Rendah', 6, 10, 'bg-green-400 text-black', 4, false],
            ['Sangat Rendah', 1, 5, 'bg-sky-400 text-white', 5, false],
        ];

        foreach ($baku as [$label, $min, $max, $warna, $urutan, $melampaui]) {
            RiskLevel::create([
                'label' => $label,
                'skala_min' => $min,
                'skala_max' => $max,
                'warna_class' => $warna,
                'urutan' => $urutan,
                'melampaui_selera' => $melampaui,
            ]);
        }
    }

    private function admin(): User
    {
        foreach (['admin', 'super-admin', 'user'] as $nama) {
            Role::findOrCreate($nama, 'web');
        }
        $u = User::factory()->create();
        $u->assignRole('admin');

        return $u;
    }

    private function riskRef(): RiskReferenceDataService
    {
        return app(RiskReferenceDataService::class);
    }

    public function test_ambang_dibaca_dari_penanda_selera_bukan_dari_nama_level(): void
    {
        $this->buatLevelBaku();

        $this->assertSame(16, $this->riskRef()->ambangSeleraRisiko());
        $this->assertSame(['Sangat Tinggi', 'Tinggi'], $this->riskRef()->levelMelampauiSelera());
    }

    /**
     * Inti butir A12: batasnya harus bisa dipindahkan, misalnya ke antara
     * Rendah dan Sedang, tanpa mengganti nama level apa pun.
     */
    public function test_menggeser_selera_ke_bawah_menurunkan_ambang_risiko_prioritas(): void
    {
        $this->buatLevelBaku();
        $this->assertSame(16, $this->riskRef()->ambangSeleraRisiko());

        RiskLevel::where('label', 'Sedang')->update(['melampaui_selera' => true]);
        // update() massal tidak memicu event model, jadi cache dibersihkan
        // sebagaimana dilakukan jalur penyuntingan sungguhan lewat save().
        RiskLevel::where('label', 'Sedang')->first()->touch();

        $this->assertSame(11, $this->riskRef()->ambangSeleraRisiko());
        $this->assertSame(
            ['Sangat Tinggi', 'Tinggi', 'Sedang'],
            $this->riskRef()->levelMelampauiSelera()
        );
    }

    public function test_menyunting_level_lewat_halaman_menggeser_ambang_dan_membersihkan_cache(): void
    {
        $this->buatLevelBaku();
        $this->assertSame(16, $this->riskRef()->ambangSeleraRisiko());

        $sedang = RiskLevel::where('label', 'Sedang')->firstOrFail();

        $this->actingAs($this->admin())
            ->put("/keterangan-pendukung/level-risiko/{$sedang->id}", [
                'label' => 'Sedang',
                'skala_min' => 11,
                'skala_max' => 15,
                'warna_class' => 'bg-yellow-300 text-black',
                'urutan' => 3,
                'melampaui_selera' => true,
            ])
            ->assertRedirect();

        $this->assertSame(11, $this->riskRef()->ambangSeleraRisiko());
    }

    /**
     * Checkbox yang dilepas tidak dikirim peramban sama sekali. Kalau
     * ketiadaannya tidak dibaca sebagai false, selera tidak akan pernah bisa
     * dinaikkan kembali setelah sekali diturunkan.
     */
    public function test_melepas_centang_benar_benar_tersimpan_meski_field_tidak_terkirim(): void
    {
        $this->buatLevelBaku();
        $tinggi = RiskLevel::where('label', 'Tinggi')->firstOrFail();
        $this->assertTrue($tinggi->melampaui_selera);

        $this->actingAs($this->admin())
            ->put("/keterangan-pendukung/level-risiko/{$tinggi->id}", [
                'label' => 'Tinggi',
                'skala_min' => 16,
                'skala_max' => 19,
                'warna_class' => 'bg-orange-400 text-white',
                'urutan' => 2,
                // 'melampaui_selera' sengaja TIDAK dikirim.
            ])
            ->assertRedirect();

        $this->assertFalse($tinggi->fresh()->melampaui_selera);
        $this->assertSame(20, $this->riskRef()->ambangSeleraRisiko());
    }

    public function test_tanpa_satu_pun_level_bertanda_ambang_kembali_ke_nilai_aman(): void
    {
        $this->buatLevelBaku();
        RiskLevel::query()->update(['melampaui_selera' => false]);
        RiskLevel::first()->touch();

        // 16 dipilih sebagai fallback supaya perilakunya sama dengan sebelum
        // fitur ini ada, bukan menganggap seluruh risiko jadi prioritas.
        $this->assertSame(16, $this->riskRef()->ambangSeleraRisiko());
        $this->assertSame([], $this->riskRef()->levelMelampauiSelera());
    }

    public function test_halaman_keterangan_pendukung_mengirim_keadaan_selera(): void
    {
        $this->buatLevelBaku();

        $this->actingAs($this->admin())
            ->get('/keterangan-pendukung?tab=level_risiko')
            ->assertOk()
            ->assertInertia(fn(AssertableInertia $page) => $page
                ->where('seleraRisiko.ambang', 16)
                ->where('seleraRisiko.batas_diterima', 'Sedang')
                ->where('seleraRisiko.label_melampaui', ['Sangat Tinggi', 'Tinggi'])
                ->has('riskLevels', 5)
                ->where('riskLevels.0.melampaui_selera', true)
                ->where('riskLevels.2.melampaui_selera', false));
    }

    /**
     * Batas yang ditampilkan pada matriks harus sama dengan yang dipakai
     * server, dan ikut bergeser bersamanya — kalau tidak, garis putus-putus
     * akan menggambarkan batas yang bukan batas sebenarnya.
     */
    public function test_batas_yang_ditampilkan_ikut_bergeser_bersama_ambangnya(): void
    {
        $this->buatLevelBaku();
        $admin = $this->admin();

        $sedang = RiskLevel::where('label', 'Sedang')->firstOrFail();
        $this->actingAs($admin)->put("/keterangan-pendukung/level-risiko/{$sedang->id}", [
            'label' => 'Sedang',
            'skala_min' => 11,
            'skala_max' => 15,
            'warna_class' => 'bg-yellow-300 text-black',
            'urutan' => 3,
            'melampaui_selera' => true,
        ]);

        $this->actingAs($admin)
            ->get('/keterangan-pendukung?tab=matriks')
            ->assertOk()
            ->assertInertia(fn(AssertableInertia $page) => $page
                ->where('seleraRisiko.ambang', $this->riskRef()->ambangSeleraRisiko())
                ->where('seleraRisiko.batas_diterima', 'Rendah'));
    }
}
