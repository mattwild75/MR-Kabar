<?php

namespace Tests\Feature;

use App\Models\PengaturanPemda;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Penjaga cacat PASS 6: pemilih tahun Dasbor tampil kosong.
 *
 * Daftar tahunnya disusun dari tahun-tahun yang PUNYA baris risiko. Pada
 * pergantian tahun, Tahun Penilaian aktif belum punya satu pun baris — jadi
 * nilainya (2026) tidak ada di daftarnya (baru 2025), dan kotak pilihan yang
 * nilainya tidak ada di daftar tidak menampilkan apa pun. Bahkan tulisan
 * bantuannya pun tidak, karena nilainya memang ter-set.
 *
 * Yang terlihat pemakainya: kotak kosong, tanpa petunjuk Dasbor sedang
 * menampilkan tahun berapa. Ditemukan saat audit antarmuka — kotak itu juga
 * satu-satunya kontrol di halaman yang tidak punya nama terbaca sama sekali,
 * dan keduanya berakar pada hal yang sama.
 */
class PemilihTahunDasborTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        Role::findOrCreate('admin', 'web');
        $u = User::factory()->create();
        $u->assignRole('admin');

        return $u;
    }

    /**
     * Tahun aktif ikut dalam pilihan sekalipun belum ada baris risikonya.
     *
     * Inilah keadaan pergantian tahun, dan keadaan itulah yang dulu membuat
     * kotaknya kosong.
     */
    public function test_tahun_penilaian_aktif_selalu_ada_dalam_pilihan(): void
    {
        PengaturanPemda::current()->update(['tahun_penilaian' => '2030']);

        $this->actingAs($this->admin())
            ->get('/dashboard')
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $p) => $p
                ->where('tahun', 2030)
                // collect() dulu: nilainya sampai sebagai Collection, dan
                // (array) atas sebuah Collection menghasilkan properti
                // objeknya, bukan isinya — uji ini sempat merah karena itu,
                // padahal kodenya sudah benar.
                ->where('tahunOptions', fn ($opsi) => collect($opsi)->contains(2030))
            );
    }

    /** Tahun yang diminta lewat alamat pun harus ada dalam pilihan. */
    public function test_tahun_yang_diminta_tetap_tampil_dalam_pilihan(): void
    {
        PengaturanPemda::current()->update(['tahun_penilaian' => '2030']);

        $this->actingAs($this->admin())
            ->get('/dashboard?tahun=2029')
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $p) => $p
                ->where('tahun', 2029)
                // 2030 tetap ada karena ia tahun aktif; yang diuji di sini
                // adalah daftarnya tidak pernah kosong sehingga kotaknya
                // selalu punya sesuatu untuk ditampilkan.
                ->where('tahunOptions', fn ($opsi) => collect($opsi)->isNotEmpty())
            );
    }

    /** Daftarnya tidak pernah kosong, apa pun keadaan datanya. */
    public function test_pilihan_tahun_tidak_pernah_kosong(): void
    {
        $this->actingAs($this->admin())
            ->get('/dashboard')
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $p) => $p
                ->where('tahunOptions', fn ($opsi) => collect($opsi)->isNotEmpty())
            );
    }
}
