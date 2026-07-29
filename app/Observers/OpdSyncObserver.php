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

        $nama = trim((string) $model->{$column});

        if ($nama === '' || $nama === '-') {
            return;
        }

        // Kolom opd.nama unik. Dua baris risiko yang disimpan bersamaan dan
        // sama-sama menyebut OPD yang belum terdaftar akan membuat salah
        // satunya gagal — dan yang gagal bukan cuma sync ini, tapi
        // penyimpanan baris risikonya, karena observer ikut satu transaksi.
        SafeUpsert::run(fn () => Opd::firstOrCreate(['nama' => $nama]));
    }
}
