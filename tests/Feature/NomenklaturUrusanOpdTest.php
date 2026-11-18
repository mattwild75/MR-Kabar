<?php

namespace Tests\Feature;

use App\Models\DataUmum;
use App\Models\Opd;
use App\Models\User;
use App\Support\NomenklaturUrusanOpd;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Isian bawaan "Urusan / Unsur Pemerintahan" dan "Bidang Urusan / Bidang
 * Unsur" per SKPK (Permendagri 90/2019).
 */
class NomenklaturUrusanOpdTest extends TestCase
{
    use RefreshDatabase;

    /** Seluruh 49 SKPK Kabupaten Aceh Barat, persis seperti tabel opd. */
    private const SKPK = [
        'BADAN KEPEGAWAIAN DAN PENGEMBANGAN SUMBER DAYA MANUSIA', 'BADAN KESATUAN BANGSA DAN POLITIK', 'BADAN PENANGGULANGAN BENCANA DAERAH',
        'BADAN PENGELOLAAN KEUANGAN DAERAH', 'BADAN PERENCANAAN PEMBANGUNAN DAERAH', 'BLUD RSUD CUT NYAK DHIEN', 'DINAS KELAUTAN DAN PERIKANAN',
        'DINAS KEPENDUDUKAN DAN PENCATATAN SIPIL', 'DINAS KESEHATAN', 'DINAS KOMUNIKASI INFORMATIKA DAN PERSANDIAN', 'DINAS LINGKUNGAN HIDUP',
        'DINAS PANGAN', 'DINAS PARIWISATA PEMUDA DAN OLAHRAGA', 'DINAS PEKERJAAN UMUM DAN PENATAAN RUANG', 'DINAS PEMBERDAYAAN MASYARAKAT DAN GAMPONG',
        'DINAS PEMBERDAYAAN PEREMPUAN PERLINDUNGAN ANAK DAN KELUARGA BERENCANA', 'DINAS PENANAMAN MODAL DAN PELAYANAN TERPADU SATU PINTU',
        'DINAS PENDIDIKAN DAN KEBUDAYAAN', 'DINAS PENDIDIKAN DAYAH', 'DINAS PERDAGANGAN PERINDUSTRIAN KOPERASI DAN USAHA KECIL DAN MENENGAH',
        'DINAS PERHUBUNGAN', 'DINAS PERKEBUNAN DAN PETERNAKAN', 'DINAS PERPUSTAKAAN DAN KEARSIPAN', 'DINAS PERTANAHAN',
        'DINAS PERTANIAN TANAMAN PANGAN DAN HORTIKULTURA', 'DINAS PERUMAHAN RAKYAT DAN KAWASAN PERMUKIMAN', 'DINAS SOSIAL', 'DINAS SYARIAT ISLAM',
        'DINAS TRANSMIGRASI DAN TENAGA KERJA', 'INSPEKTORAT', 'KECAMATAN ARONGAN LAMBALEK', 'KECAMATAN BUBON', 'KECAMATAN JOHAN PAHLAWAN',
        'KECAMATAN KAWAY XVI', 'KECAMATAN MEUREUBO', 'KECAMATAN PANTE CEUREUMEN', 'KECAMATAN PANTON REU', 'KECAMATAN SAMATIGA',
        'KECAMATAN SUNGAI MAS', 'KECAMATAN WOYLA', 'KECAMATAN WOYLA BARAT', 'KECAMATAN WOYLA TIMUR',
        'SATUAN POLISI PAMONG PRAJA DAN WILAYATUL HISBAH', 'SEKRETARIAT BAITUL MAL KABUPATEN', 'SEKRETARIAT DAERAH', 'SEKRETARIAT DPRK',
        'SEKRETARIAT MAJELIS ADAT ACEH', 'SEKRETARIAT MAJELIS PEMUSYAWARATAN ULAMA', 'SEKRETARIAT MAJELIS PENDIDIKAN DAERAH',
    ];

    public function test_seluruh_49_skpk_punya_isian_bawaan(): void
    {
        $this->assertCount(49, self::SKPK);
        foreach (self::SKPK as $nama) {
            $hasil = NomenklaturUrusanOpd::untuk($nama);
            $this->assertNotNull($hasil, "Tidak ada isian bawaan untuk {$nama}");
            $this->assertNotSame('', $hasil['urusan']);
            $this->assertNotSame('', $hasil['bidang']);
        }

        $this->assertSame(NomenklaturUrusanOpd::PENGAWASAN, NomenklaturUrusanOpd::untuk('INSPEKTORAT')['urusan']);
        $this->assertSame('Kecamatan', NomenklaturUrusanOpd::untuk('Kecamatan Woyla Timur')['bidang']);
        $this->assertNull(NomenklaturUrusanOpd::untuk('DINAS YANG TIDAK ADA'));
    }

    public function test_data_umum_kosong_terisi_bawaan_sesuai_skpk(): void
    {
        $opd = Opd::create(['nama' => 'DINAS KESEHATAN']);
        $pic = User::factory()->create(['opd_id' => $opd->id]);

        $this->actingAs($pic)->get('/data-umum?tahun=2026')->assertOk()->assertInertia(fn ($page) => $page
            ->where('data.nama_urusan', NomenklaturUrusanOpd::WAJIB_DASAR)
            ->where('data.nama_sub_urusan', 'Kesehatan')
            ->where('data.nama_dinas_opd', 'DINAS KESEHATAN')
            ->where('bawaanOpd', ['nama_dinas_opd', 'nama_urusan', 'nama_sub_urusan']));
    }

    public function test_isian_pic_tidak_ditimpa_bawaan(): void
    {
        $opd = Opd::create(['nama' => 'DINAS KESEHATAN']);
        $pic = User::factory()->create(['opd_id' => $opd->id]);
        DataUmum::create(['user_id' => $pic->id, 'tahun_penilaian' => '2026', 'nama_urusan' => 'Isian PIC sendiri', 'nama_sub_urusan' => 'Bidang PIC']);

        $this->actingAs($pic)->get('/data-umum?tahun=2026')->assertOk()->assertInertia(fn ($page) => $page
            ->where('data.nama_urusan', 'Isian PIC sendiri')
            ->where('data.nama_sub_urusan', 'Bidang PIC')
            ->where('bawaanOpd', ['nama_dinas_opd']));
    }

    public function test_teks_kepala_form_cetak(): void
    {
        $this->assertSame('Inspektorat Daerah (Unsur Pengawasan Urusan Pemerintahan)', NomenklaturUrusanOpd::untukCetak(null, null, 'INSPEKTORAT'));
        $this->assertSame('Bidang PIC (Isian PIC)', NomenklaturUrusanOpd::untukCetak('Isian PIC', 'Bidang PIC', 'INSPEKTORAT'));
        $this->assertNull(NomenklaturUrusanOpd::untukCetak(null, null, null));
    }
}
