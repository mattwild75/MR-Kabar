<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\HasMedia;

class User extends Authenticatable implements HasMedia
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasRoles, InteractsWithMedia;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'username',
        'email',
        'password',
        'opd_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function mediaFolders()
    {
        return $this->hasMany(MediaFolder::class);
    }

    /**
     * Akun bersama (non-login, sama pola dgn 'CEE_Survey') yang jadi
     * pemilik teknis file/folder "Folder Umum" — satu tempat penyimpanan
     * bersama yang bisa dilihat/diisi/dihapus SEMUA user, bukan cuma
     * super-admin seperti fitur file-per-user biasa (lihat
     * UserFileController::index() scope=shared). Dibuat malas (lazy,
     * firstOrCreate) supaya tidak perlu migrasi/seeder terpisah wajib
     * dijalankan lebih dulu — baris pertama kali diakses otomatis membuat
     * akunnya.
     */
    public static function sharedFolderOwner(): self
    {
        return static::firstOrCreate(
            ['username' => 'FOLDER_UMUM'],
            [
                'name' => 'Folder Umum',
                'email' => 'folder-umum@mrkabar.local',
                'password' => (string) str()->random(32),
            ]
        );
    }

    /** OPD milik akun PIC (nullable) — dipakai membatasi akses CEE per-OPD. */
    public function opd()
    {
        return $this->belongsTo(Opd::class);
    }

    /**
     * Data Umum (header identitas + penanda tangan) milik akun ini —
     * dipakai Form Cetak. PER-TAHUN (hasMany, bukan hasOne lagi) — satu
     * user bisa py banyak baris DataUmum, satu per Tahun Penilaian yg
     * pernah dia isi (lihat migration 2026_07_17_050000_make_data_umum_per_tahun).
     * Sebelumnya hasOne bikin nama PIC/TTD yg tercetak SELALU versi
     * terkini walau tahun yg dicetak beda — tidak ada riwayat per tahun.
     */
    public function dataUmum()
    {
        return $this->hasMany(DataUmum::class);
    }
}
