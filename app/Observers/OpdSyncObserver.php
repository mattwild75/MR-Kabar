<?php

namespace App\Observers;

use App\Models\KroPd;
use App\Models\KrsPd;
use App\Models\KrsPemda;
use App\Models\Opd;
use App\Support\SafeUpsert;

/**
 * Sinkron otomatis: setiap kali baris KRS_Pemda/KRS_PD/KRO_PD disimpan,
 * nama OPD di kolomnya ditambahkan ke tabel `opd` (Settings > Keterangan
 * Pendukung > Seluruh OPD) kalau belum ada — supaya daftar OPD di sana
 * selalu mengikuti OPD yang benar-benar dipakai di data KRS, tanpa perlu
 * ditambah manual satu-satu. Tetap bisa diedit/dihapus manual di menu
 * tsb sesudahnya (sync ini hanya menambah, tidak pernah menghapus/
 * mengubah entri `opd` yang sudah ada).
 */
class OpdSyncObserver
{
    public function saved(KrsPemda|KrsPd|KroPd $model): void
    {
        $column = $model instanceof KrsPemda ? 'OPD PENANGGUNGJAWAB PROGRAM' : 'OPD PENANGGUNG JAWAB KEGIATAN';

        // Satu sel memuat BANYAK nama, dipisah baris baru — satu program
        // non-prioritas lazim diampu puluhan perangkat daerah sekaligus.
        //
        // Sebelumnya isi sel diambil apa adanya sebagai SATU nama. Selama
        // kolomnya diketik bebas dan biasanya berisi satu nama, itu tidak
        // pernah ketahuan; begitu kolomnya berganti menjadi kotak centang,
        // menyimpan satu baris berisi 49 perangkat daerah langsung menabrak
        // batas panjang `opd.nama` dan MENGGAGALKAN penyimpanan baris
        // risikonya — observer ikut satu transaksi dengan penyimpanan itu.
        foreach (preg_split('/\r?\n/', (string) $model->{$column}) as $nama) {
            $nama = trim($nama);
            if ($nama === '' || $nama === '-' || mb_strtolower($nama) === 'tidak ada data') {
                continue;
            }

            // Nilai sepanjang ini hampir pasti bukan nama perangkat daerah,
            // melainkan sesuatu yang salah masuk. Melewatinya lebih baik
            // daripada menggagalkan penyimpanan data risiko yang sudah benar.
            if (mb_strlen($nama) > 255) {
                continue;
            }

            // Kolom opd.nama unik. Dua baris risiko yang disimpan bersamaan dan
            // sama-sama menyebut OPD yang belum terdaftar akan membuat salah
            // satunya gagal — dan yang gagal bukan cuma sync ini, tapi
            // penyimpanan baris risikonya, karena observer ikut satu transaksi.
            SafeUpsert::run(fn () => Opd::firstOrCreate(['nama' => $nama]));
        }
    }
}
