<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements HasMedia
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, HasRoles, InteractsWithMedia, Notifiable;

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
        // Ikut tersembunyi karena objek User dibagikan utuh ke setiap halaman
        // lewat Inertia shared props, dan seluruhnya terbaca lewat view-source.
        // Isinya memang sudah terenkripsi, tetapi ciphertext yang terpampang
        // di tiap halaman memberi penyerang bahan untuk dikerjakan di waktu
        // luangnya. Tidak ada satu pun layar yang membutuhkannya.
        'two_factor_secret',
        'two_factor_recovery_codes',
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
     * Boleh melihat data SELURUH OPD, bukan cuma OPD-nya sendiri.
     *
     * Dipisahkan dari pengecekan hak TULIS: peran `eksekutif` ikut di sini
     * supaya pimpinan/pemangku kepentingan bisa membaca semua data, tapi
     * tidak ikut di RiskOwnershipPolicy maupun ensureAdmin() sehingga tetap
     * tidak bisa mengubah apa pun. Penjaga sesungguhnya ada di middleware
     * ViewerReadOnly yang menolak seluruh metode penulisan.
     */
    public function canViewAllOpd(): bool
    {
        return $this->hasAnyRole(['admin', 'super-admin', 'eksekutif', 'apip']);
    }

    /**
     * Akun hanya-baca terhadap data MR Kabar.
     *
     * Dua peran, dengan alasan berbeda:
     *
     * - `eksekutif` memang tidak boleh mengubah apa pun di mana pun.
     * - `apip` perlu MEMBACA seluruh data risiko lintas-OPD karena itulah
     *   bahan perencanaan pengawasannya, tetapi tidak boleh mengubah register
     *   risiko milik SKPK. Sesuai BAB III Lampiran Keputusan Inspektur,
     *   pemutakhiran register tetap dilakukan pemilik risikonya. Hak tulis
     *   `apip` hanya berlaku di menu PKPT Berbasis Risiko, dikecualikan di
     *   middleware ViewerReadOnly.
     */
    public function isViewerOnly(): bool
    {
        return $this->hasAnyRole(['eksekutif', 'apip']);
    }

    /** Peran yang hak tulisnya terbatas pada modul PKPT saja. */
    public function isApip(): bool
    {
        return $this->hasRole('apip') && ! $this->hasAnyRole(['admin', 'super-admin']);
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
