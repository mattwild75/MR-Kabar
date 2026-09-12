<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

/**
 * Halaman status publik yang sangat sederhana: aplikasi hidup, basis data
 * terjangkau, penjadwal berdetak, dan versi yang berjalan. Tidak memuat
 * data apa pun tentang isi aplikasi. Dipakai pemantau luar (mis. UptimeRobot)
 * dan pengelola saat ada laporan "situs lambat/mati".
 */
class StatusController extends Controller
{
    public function __invoke()
    {
        $db = true;
        try {
            DB::selectOne('select 1');
        } catch (\Throwable) {
            $db = false;
        }
        $detak = Cache::get('penjadwal_detak_terakhir');
        $penjadwal = $detak ? (now()->timestamp - $detak) <= 600 : false;
        $versi = Cache::get('versi-aplikasi');
        $sehat = $db && $penjadwal;

        return response()->json([
            'aplikasi' => 'MR Kabar',
            'status' => $sehat ? 'sehat' : 'gangguan',
            'basis_data' => $db ? 'terhubung' : 'terputus',
            'penjadwal' => $penjadwal ? 'berjalan' : 'berhenti',
            'versi' => $versi,
            'waktu_server' => now()->toIso8601String(),
        ], $sehat ? 200 : 503)->header('Cache-Control', 'no-store');
    }
}
