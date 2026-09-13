<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class LaporanKejadianRisiko extends Model implements HasMedia
{
    use InteractsWithMedia, SoftDeletes;

    /**
     * Berkas bukti kejadian (foto, tangkapan layar, PDF) — opsional, sama
     * aturannya dengan bukti laporan kecurangan: disimpan di disk tertutup,
     * hanya terbuka lewat rute unduh yang memeriksa hak penindaklanjut.
     */
    public const KOLEKSI_BUKTI = 'bukti';

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection(self::KOLEKSI_BUKTI)->useDisk(config('media-library.disk_name'));
    }

    /** Ringkasan berkas bukti untuk ditampilkan, tanpa membocorkan jalurnya. */
    public function daftarBukti(): array
    {
        return $this->getMedia(self::KOLEKSI_BUKTI)
            ->map(fn (Media $m) => ['id' => $m->id, 'nama' => $m->file_name, 'ukuran' => $m->size, 'mime' => $m->mime_type])
            ->all();
    }

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

    /**
     * Model risiko terdaftar terkait (IrsPemda/IrsPd/IroPd), lihat
     * risiko_terdaftar_tipe. Query 1x per pemanggilan — JANGAN dipanggil di
     * dalam loop/map atas banyak baris (N+1), lihat batch-lookup via
     * whereIn()->keyBy('id') per tipe di
     * LaporanKejadianController::index() sbg pola yg benar utk daftar.
     */
    public function risikoTerdaftar(): ?Model
    {
        if (! $this->risiko_terdaftar_tipe || ! $this->risiko_terdaftar_id) {
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
