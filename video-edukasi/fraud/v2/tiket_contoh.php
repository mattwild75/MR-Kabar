<?php

/**
 * Laporan CONTOH untuk memotret layar "tiket" dan "Cek Status Laporan" pada
 * video edukasi kecurangan v2. Hanya untuk basis data LOKAL.
 *
 * Laporannya dikirim sungguhan lewat formulir (ambil_ponsel.cjs) supaya yang
 * terpotret adalah layar aplikasi apa adanya. Skrip ini hanya menambahkan
 * pertanyaan penindaklanjut ke tiketnya, lalu MENGHAPUS laporan contoh itu
 * sampai habis (pesan dan berkas buktinya ikut) setelah pemotretan.
 *
 *   php tiket_contoh.php cek
 *   php tiket_contoh.php tanya FRA-2026-0001
 *   php tiket_contoh.php hapus FRA-2026-0001
 */

use App\Models\LaporanKecurangan;
use App\Models\PesanLaporanKecurangan;
use App\Models\User;
use Illuminate\Contracts\Console\Kernel;

require __DIR__.'/../../../vendor/autoload.php';
$app = require_once __DIR__.'/../../../bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();

// Penanda isi laporan contoh: hanya laporan yang uraiannya diawali kalimat ini
// yang boleh disentuh skrip ini.
const PENANDA = 'Petugas loket meminta uang Rp50.000';

$aksi = $argv[1] ?? 'cek';
$nomor = $argv[2] ?? null;

$laporan = $nomor ? LaporanKecurangan::withTrashed()->where('nomor_tiket', $nomor)->first() : null;
if ($nomor && (! $laporan || ! str_starts_with((string) $laporan->uraian_kejadian, PENANDA))) {
    fwrite(STDERR, "Tiket {$nomor} tidak ada atau BUKAN laporan contoh — batal.\n");
    exit(1);
}

if ($aksi === 'tanya') {
    $apip = User::role('apip')->first();
    $laporan->update(['status' => 'diverifikasi']);
    $laporan->pesan()->create([
        'dari' => PesanLaporanKecurangan::DARI_PENINDAKLANJUT,
        'user_id' => $apip?->id,
        'isi' => 'Terima kasih atas laporannya. Apakah Anda ingat kira-kira pukul berapa kejadiannya, dan apakah papan pengumuman layanan gratis itu masih terpasang di loket?',
    ]);
    echo "ok {$laporan->nomor_tiket} -> diverifikasi + 1 pertanyaan\n";
} elseif ($aksi === 'hapus') {
    $laporan->pesan()->delete();
    $media = $laporan->getMedia(LaporanKecurangan::KOLEKSI_BUKTI);
    foreach ($media as $m) {
        $m->delete();
    }
    $laporan->forceDelete();
    $sisa = LaporanKecurangan::withTrashed()->where('nomor_tiket', $nomor)->exists() ? 'MASIH ADA' : 'terhapus';
    echo "{$nomor}: {$sisa}; media terhapus ".count($media)."\n";
} else {
    $semua = LaporanKecurangan::withTrashed()->orderBy('id')->get(['nomor_tiket', 'status', 'uraian_kejadian']);
    echo 'jumlah laporan kecurangan (termasuk terhapus): '.$semua->count()."\n";
    foreach ($semua as $l) {
        $contoh = str_starts_with((string) $l->uraian_kejadian, PENANDA) ? ' [CONTOH]' : '';
        echo "  {$l->nomor_tiket} {$l->status}{$contoh}\n";
    }
}
