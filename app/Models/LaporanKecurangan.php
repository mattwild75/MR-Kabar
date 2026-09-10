<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * Satu laporan dugaan kecurangan dari publik — pintu masuk MR Fraud.
 *
 * Dasar: Perdep BPKP Bidang Investigasi No. 1 Tahun 2019 dan Perbup Aceh Barat
 * No. 6 Tahun 2025 tentang Pengendalian Kecurangan.
 */
class LaporanKecurangan extends Model implements HasMedia
{
    use InteractsWithMedia, SoftDeletes;

    protected $table = 'laporan_kecurangan';

    protected $guarded = ['id'];

    protected $casts = [
        'dugaan_kelompok' => 'array',
        'waktu_kejadian' => 'datetime',
        'ditindaklanjuti_at' => 'datetime',
    ];

    /**
     * Alur tindak lanjut, sama persis dengan Lapor Kejadian Risiko.
     *
     * Sengaja sama: yang membedakan kedua laporan adalah ISInya, bukan cara
     * menanganinya. Dua alur status berbeda untuk hal yang sama hanya akan
     * membuat penindaklanjut harus mengingat mana yang sedang dibuka.
     */
    public const STATUS = ['baru', 'diverifikasi', 'ditindaklanjuti', 'selesai'];

    /**
     * Tiga tingkat kerahasiaan pelapor.
     *
     * `anonim_kontak` ada karena "anonim" saja menggabungkan dua orang yang
     * berbeda kebutuhan: yang tidak mau namanya muncul di berkas, dan yang
     * tidak mau dihubungi sama sekali. Yang pertama umumnya bersedia dihubungi
     * Inspektorat; memaksanya memilih salah satu ujung membuat sebagian orang
     * memilih tidak melapor.
     */
    public const MODE_TERBUKA = 'terbuka';

    public const MODE_ANONIM_KONTAK = 'anonim_kontak';

    public const MODE_ANONIM_PENUH = 'anonim_penuh';

    public const MODE = [self::MODE_TERBUKA, self::MODE_ANONIM_KONTAK, self::MODE_ANONIM_PENUH];

    public function pesan(): HasMany
    {
        return $this->hasMany(PesanLaporanKecurangan::class)->orderBy('created_at');
    }

    /**
     * Berkas bukti yang dilampirkan pelapor.
     *
     * Pemiliknya LAPORAN, bukan akun pengunggah — dan itu penting. Unggahan
     * lewat QR dikirim memakai akun bersama LAPOR; kalau berkasnya melekat ke
     * akun itu, seluruh bukti dari semua pelapor akan berkumpul pada satu akun
     * yang kredensialnya dipegang publik, dan ikut muncul di File Manager.
     *
     * Disknya `local` (privat, tidak ter-mount ke /storage publik), sama dengan
     * bukti dukung risiko. Satu-satunya jalan mengunduhnya adalah rute
     * lapor-kecurangan.bukti, yang hanya terbuka bagi penindaklanjut.
     */
    public const KOLEKSI_BUKTI = 'bukti';

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection(self::KOLEKSI_BUKTI)
            ->useDisk(config('media-library.disk_name'));
    }

    /** Ringkasan berkas bukti untuk ditampilkan, tanpa membocorkan jalurnya. */
    public function daftarBukti(): array
    {
        return $this->getMedia(self::KOLEKSI_BUKTI)
            ->map(fn (Media $m) => [
                'id' => $m->id,
                'nama' => $m->file_name,
                'ukuran' => $m->size,
                'mime' => $m->mime_type,
            ])
            ->all();
    }

    public function opd(): BelongsTo
    {
        return $this->belongsTo(Opd::class);
    }

    public function fraudRisiko(): BelongsTo
    {
        return $this->belongsTo(FraudRisiko::class);
    }

    public function penindaklanjut(): BelongsTo
    {
        return $this->belongsTo(User::class, 'ditindaklanjuti_oleh');
    }

    /**
     * Nama pelapor untuk ditampilkan.
     *
     * Laporan anonim TIDAK menyimpan identitas sama sekali (lihat migrasinya),
     * jadi ini bukan penyembunyian di tampilan — memang tidak ada yang bisa
     * ditampilkan.
     */
    public function getPelaporAttribute(): string
    {
        return match ($this->mode_pelapor) {
            self::MODE_ANONIM_PENUH => 'Anonim',
            self::MODE_ANONIM_KONTAK => 'Anonim (bisa dihubungi)',
            default => $this->nama_pelapor ?: 'Tidak disebutkan',
        };
    }

    /** Nama pelapor tidak pernah disimpan pada kedua mode anonim. */
    public function getAnonimAttribute(): bool
    {
        return $this->mode_pelapor !== self::MODE_TERBUKA;
    }
}
