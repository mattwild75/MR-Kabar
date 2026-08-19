<?php

namespace App\Jobs;

use App\Services\KroIroPdSyncService;
use App\Services\KrsIrsPdSyncService;
use App\Services\KrsIrsSyncService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

/**
 * Regenerasi (TRUNCATE+rebuild) SATU tabel turunan (tbl_krs_irs_pemda/
 * tbl_krs_irs_pd/tbl_kro_iro_pd) di ANTRIAN BELAKANG LAYAR, bukan sinkron
 * di request path — sebelumnya KrsIrsSyncService::sync() dkk dipanggil
 * LANGSUNG di store()/update()/destroy() setiap controller Form Input
 * (IrsPemda/IrsPd/IroPd/KrsPemda/KrsPd/KroPd) dan TrashController (restore/
 * forceDelete), membuat SETIAP simpan 1 baris memicu baca+truncate+insert
 * ULANG SELURUH tabel turunan (bisa ratusan-ribuan baris lintas 30 OPD)
 * SEBELUM response balik ke user — audit performa menemukan ini sbg
 * bottleneck O(total_baris) per simpan, bukan O(1), dan berisiko request
 * kedua gagal total (LockTimeoutException tak tertangani) saat 2 PIC
 * menyimpan hampir bersamaan menjelang deadline pelaporan.
 *
 * Job ini TIDAK mengubah data yg disimpan, urutan proses hitung skala,
 * atau isi Form Cetak — HANYA memindahkan proses rebuild tabel turunan
 * (dipakai diagram hierarki Visualisasi & tabel gabungan /krs_irs_pemda
 * dkk) supaya berjalan di belakang layar (worker `php artisan queue:work`,
 * WAJIB berjalan permanen di server, konfirmasi user 2026-07-26). Beberapa
 * detik jeda sebelum diagram/tabel gabungan ter-update adalah trade-off
 * yg disengaja & disetujui, dibanding user menunggu proses ini selesai
 * sebelum halaman Form Input kembali.
 *
 * $serviceClass dibatasi ke 3 kelas sync yg memang ada (bukan string bebas
 * dari input user) — property ini di-serialize ke tabel `jobs` sbg bagian
 * job, tidak pernah berasal dari request langsung.
 */
class RebuildHierarchyDiagramJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public function __construct(private readonly string $serviceClass) {}

    public function handle(): void
    {
        match ($this->serviceClass) {
            KrsIrsSyncService::class => app(KrsIrsSyncService::class)->syncNow(),
            KrsIrsPdSyncService::class => app(KrsIrsPdSyncService::class)->syncNow(),
            KroIroPdSyncService::class => app(KroIroPdSyncService::class)->syncNow(),
            default => null,
        };
    }
}
