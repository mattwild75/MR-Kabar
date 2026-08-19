<?php

/**
 * Memeriksa dan menghapus data 2026 hasil perekaman.
 *
 * Seluruh isian yang dibuat saat merekam adalah data contoh dan harus lenyap
 * sesudahnya. Skrip ini yang mengerjakannya, dan sengaja dibuat bisa dijalankan
 * berkali-kali: 'periksa' hanya melihat, 'hapus' benar-benar membuang.
 *
 * Yang dihapus DIBATASI: hanya milik akun perekam, dan hanya tahun 2026.
 * Data 2025 tidak pernah tersentuh. Untuk tabel konteks yang memang tidak punya
 * kolom tahun, penyaringnya waktu pembuatan baris — hanya baris yang dibuat
 * sejak perekaman dimulai.
 *
 *   php bersihkan.php periksa
 *   php bersihkan.php hapus
 */
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();

use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\DB;

const USERNAME = 'PIC_INSPEKTORAT';
const TAHUN = 2026;
const PENANDA = __DIR__.'/.mulai-rekam';

$aksi = $argv[1] ?? 'periksa';
$uid = DB::table('users')->where('username', USERNAME)->value('id');
$opd = DB::table('users')->where('id', $uid)->value('opd_id');

// Tabel konteks TIDAK mengisi created_at — nilainya kosong. Penyaring waktu
// karena itu tidak pernah cocok, dan baris hasil rekaman tidak akan pernah
// terhapus walau perintahnya dijalankan. Yang dipakai sebagai penanda adalah
// nomor baris tertinggi sebelum perekaman dimulai: apa pun yang bernomor lebih
// besar dari itu pasti dibuat saat merekam.
$TANPA_TAHUN = ['tbl_krs_pd', 'tbl_kro_pd'];

if ($aksi === 'tandai') {
    // Selain nomor baris tertinggi, waktu mulai rekam ikut dicatat — dipakai
    // menyaring laporan kejadian, yang tabelnya memang mengisi created_at.
    $batas = ['_waktu' => now()->toDateTimeString()];
    foreach ($TANPA_TAHUN as $t) {
        $batas[$t] = (int) DB::table($t)->max('id');
    }
    file_put_contents(PENANDA, json_encode($batas));
    exit('Penanda id terakhir sebelum rekam: '.json_encode($batas)."\n");
}

$batas = file_exists(PENANDA) ? json_decode(trim(file_get_contents(PENANDA)), true) : null;
$sejakRekam = $batas['_waktu'] ?? null;

// [tabel, penyaring tahun, keterangan]
$bertahun = [
    ['tbl_irs_pemda', 'TAHUN DINILAI RISIKO'],
    ['tbl_irs_pd', 'TAHUN DINILAI RISIKO'],
    ['tbl_iro_pd', 'TAHUN DINILAI RISIKO'],
];

$total = 0;
echo '== baris milik '.USERNAME.' untuk tahun '.TAHUN."\n";

foreach ($bertahun as [$tabel, $kolom]) {
    $q = DB::table($tabel)->where('user_id', $uid)->where($kolom, TAHUN);
    $n = (clone $q)->count();
    $total += $n;
    printf("  %-16s %d baris\n", $tabel, $n);
    if ($aksi === 'hapus' && $n) {
        $q->delete();
    }
}

foreach ($TANPA_TAHUN as $tabel) {
    if (! isset($batas[$tabel])) {
        echo "  ($tabel dilewati: penanda belum dibuat — jalankan 'tandai' dulu)\n";

        continue;
    }
    $q = DB::table($tabel)->where('user_id', $uid)->where('id', '>', $batas[$tabel]);
    $n = (clone $q)->count();
    $total += $n;
    printf("  %-16s %d baris (id di atas %d)\n", $tabel, $n, $batas[$tabel]);
    if ($aksi === 'hapus' && $n) {
        $q->delete();
    }
}

$q = DB::table('data_umum')->where('user_id', $uid)->where('tahun_penilaian', TAHUN);
$n = (clone $q)->count();
$total += $n;
printf("  %-16s %d baris\n", 'data_umum', $n);
if ($aksi === 'hapus' && $n) {
    $q->delete();
}

// Seluruh tabel CEE bersekat OPD dan tahun, jadi aman disaring keduanya.
foreach (['cee_jawaban', 'cee_kelemahan_dokumen', 'cee_simpulan', 'cee_rtp'] as $tabel) {
    $q = DB::table($tabel)->where('opd_id', $opd)->where('tahun_penilaian', TAHUN);
    $n = (clone $q)->count();
    $total += $n;
    printf("  %-16s %d baris\n", $tabel, $n);
    if ($aksi === 'hapus' && $n) {
        $q->delete();
    }
}

// Laporan kejadian yang dibuat saat merekam video Lapor, berikut catatan
// Formulir 10 yang menunjuk kepadanya. Disaring dari WAKTU pembuatannya:
// laporan sungguhan milik warga tidak boleh ikut terhapus, dan laporan lama
// memang dibuat jauh sebelum penanda ini dipasang.
if ($sejakRekam) {
    $q = DB::table('laporan_kejadian_risiko')->where('created_at', '>=', $sejakRekam);
    $n = (clone $q)->count();
    $total += $n;
    printf("  %-16s %d baris (dibuat sejak %s)\n", 'laporan_kejadian', $n, $sejakRekam);
    if ($aksi === 'hapus' && $n) {
        $ids = (clone $q)->pluck('id');
        DB::table('pencatatan_kejadian_risiko')->whereIn('laporan_kejadian_id', $ids)->delete();
        $q->delete();
    }
} else {
    echo "  (laporan_kejadian dilewati: penanda waktu belum dibuat)\n";
}

echo "\ntotal: $total baris";
echo $aksi === 'hapus' ? " — SUDAH DIHAPUS\n" : " (belum dihapus; jalankan 'hapus' untuk membuang)\n";

// Catatan log aktivitas milik baris-baris di atas.
//
// Ini SENGAJA dibatasi pada rentang waktu perekaman saja, bukan "semua catatan
// yang subjeknya sudah tidak ada". Perbedaannya penting: catatan tentang baris
// yang dihapus lewat pemakaian biasa memang HARUS tetap tinggal — "si anu
// menghapus risiko X" justru baru berguna sesudah X hilang, dan itulah gunanya
// jejak audit. Yang dibuang di sini hanya jejak data contoh yang sebenarnya
// tidak pernah ada.
//
// Tanpa langkah ini, widget "Aktivitas Terbaru" di Dasbor memperlihatkan
// pembuatan baris yang tidak bisa dibuka siapa pun, dan halaman Log Aktivitas
// memuat tautan yang menuju ke ketiadaan.
if ($sejakRekam) {
    $qLog = DB::table('activity_log')
        ->where('created_at', '>=', $sejakRekam)
        ->whereIn('causer_id', DB::table('users')
            ->whereIn('username', ['PIC_INSPEKTORAT', 'mrkabarvip', 'LAPOR', 'CEE_Survey'])
            ->pluck('id'));
    $nLog = (clone $qLog)->count();
    printf('catatan log aktivitas hasil perekaman: %d', $nLog);
    if ($aksi === 'hapus' && $nLog) {
        $qLog->delete();
        echo ' — SUDAH DIHAPUS';
    }
    echo "\n";
}

// Pengaman: pastikan 2025 tidak ikut tergores.
$masih2025 = DB::table('tbl_irs_pd')->where('user_id', $uid)->where('TAHUN DINILAI RISIKO', 2025)->count()
    + DB::table('tbl_iro_pd')->where('user_id', $uid)->where('TAHUN DINILAI RISIKO', 2025)->count();
echo "pemeriksaan: data 2025 milik akun ini masih $masih2025 baris (seharusnya 11)\n";
