<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class LaporanKejadianRisiko extends Model
{
    use SoftDeletes;

    protected $table = 'laporan_kejadian_risiko';

    protected $fillable = [
        'nama_lengkap',
        'email',
        'no_hp',
        'opd_id',
        'kejadian',
        'waktu_kejadian',
        'tempat',
        'pemicu',
        'risiko_terdaftar_tipe',
        'risiko_terdaftar_id',
        'status',
        'catatan_tindak_lanjut',
        'ditindaklanjuti_oleh',
        'ditindaklanjuti_at',
        'dilaporkan_oleh_user_id',
    ];

    protected function casts(): array
    {
        return [
            'waktu_kejadian' => 'datetime',
            'ditindaklanjuti_at' => 'datetime',
        ];
    }

    public function opd(): BelongsTo
    {
        return $this->belongsTo(Opd::class);
    }

    public function ditindaklanjutiOleh(): BelongsTo
    {
        return $this->belongsTo(User::class, 'ditindaklanjuti_oleh');
    }

    public function dilaporkanOleh(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dilaporkan_oleh_user_id');
    }

    /** Model risiko terdaftar terkait (IrsPemda/IrsPd/IroPd), lihat risiko_terdaftar_tipe. */
    public function risikoTerdaftar(): ?Model
    {
        if (!$this->risiko_terdaftar_tipe || !$this->risiko_terdaftar_id) {
            return null;
        }

        $map = [
            'irs_pemda' => IrsPemda::class,
            'irs_pd' => IrsPd::class,
            'iro_pd' => IroPd::class,
        ];

        $modelClass = $map[$this->risiko_terdaftar_tipe] ?? null;

        return $modelClass ? $modelClass::find($this->risiko_terdaftar_id) : null;
    }
}
