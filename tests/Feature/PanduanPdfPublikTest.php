<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

/**
 * Panduan versi PDF, yang sengaja terbuka tanpa login.
 *
 * Yang dijaga di sini BUKAN isi berkasnya — memeriksa isi berarti menyalakan
 * Chromium sungguhan di dalam rangkaian uji, dan satu pencetakan memakan lima
 * detik berikut satu proses peramban penuh. Yang dijaga adalah dua keputusan
 * yang gampang terbalik tanpa disadari saat rute lain ditambahkan di
 * sekitarnya:
 *
 *  1. rutenya TETAP di luar 'auth' — kalau ia terseret masuk ke dalam grup
 *     berautentikasi, tombol Unduh PDF di halaman publik akan menjawab
 *     pengalihan ke /login, dan pengunjung tamu tidak akan pernah tahu
 *     kenapa unduhannya gagal;
 *  2. rutenya TETAP dibatasi lajunya — tiap permintaan menjalankan satu
 *     Chromium tersendiri, jadi pintu tanpa pembatas di alamat publik adalah
 *     undangan.
 */
class PanduanPdfPublikTest extends TestCase
{
    use RefreshDatabase;

    private function middlewareRutePdf(): array
    {
        $rute = Route::getRoutes()->getByName('panduan.public.pdf');
        $this->assertNotNull($rute, 'Rute panduan.public.pdf tidak terdaftar.');

        return $rute->gatherMiddleware();
    }

    public function test_rute_pdf_tidak_berada_di_balik_autentikasi(): void
    {
        $middleware = $this->middlewareRutePdf();

        $this->assertNotContains('auth', $middleware,
            'Panduan PDF harus tetap dapat diunduh tanpa login — itu seluruh gunanya.');
        $this->assertNotContains('menu.permission', $middleware);
    }

    public function test_rute_pdf_dibatasi_lajunya(): void
    {
        $adaPembatas = collect($this->middlewareRutePdf())
            ->contains(fn ($m) => is_string($m) && str_starts_with($m, 'throttle:'));

        $this->assertTrue($adaPembatas,
            'Rute pencetakan publik wajib berpembatas laju: tiap permintaan menyalakan satu Chromium.');
    }

    /**
     * Keterangan asal-usul pada versi cetak harus benar-benar terkirim.
     *
     * Sebuah PDF berpindah tangan lepas dari halaman asalnya. Tanpa kedua
     * keterangan ini, tidak ada cara membedakan cetakan hari ini dari cetakan
     * tahun lalu — dan panduan yang usang lebih menyesatkan daripada tidak ada
     * panduan sama sekali.
     */
    public function test_halaman_publik_mengirim_keterangan_asal_cetakan(): void
    {
        $isi = $this->get('/panduan-publik')->assertOk()->getContent();

        $this->assertStringContainsString('dicetakPada', $isi);
        $this->assertStringContainsString('sumberUrl', $isi);
    }
}
