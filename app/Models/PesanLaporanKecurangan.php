<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Satu pesan pada utas tanya-jawab sebuah laporan dugaan kecurangan.
 *
 * Utas inilah yang membuat laporan anonim tetap bisa ditelaah: penindaklanjut
 * menuliskan pertanyaannya di sini, dan pelapor menjawabnya lewat nomor tiket
 * miliknya — tanpa pernah menyebut siapa dirinya.
 */
class PesanLaporanKecurangan extends Model
{
    protected $table = 'pesan_laporan_kecurangan';

    protected $guarded = ['id'];

    public const DARI_PELAPOR = 'pelapor';

    public const DARI_PENINDAKLANJUT = 'penindaklanjut';

    public function laporan(): BelongsTo
    {
        return $this->belongsTo(LaporanKecurangan::class, 'laporan_kecurangan_id');
    }

    public function penulis(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
