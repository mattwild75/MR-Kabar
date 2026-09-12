<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Tautan Google Drive tempat cadangan basis data dikirim — satu baris.
 *
 * `client_secret` dan `refresh_token` dienkripsi dengan APP_KEY; siapa pun yang
 * hanya memegang dump basis data tidak bisa memakai keduanya.
 */
class CadanganDrive extends Model
{
    protected $table = 'cadangan_drive';

    protected $fillable = [
        'client_id',
        'client_secret',
        'refresh_token',
        'akun_email',
        'folder_id',
        'folder_nama',
        'tautan_pada',
        'unggah_otomatis',
        'simpan_terakhir',
        'terakhir_unggah',
        'terakhir_hasil',
    ];

    protected $hidden = ['client_secret', 'refresh_token'];

    protected function casts(): array
    {
        return [
            'client_secret' => 'encrypted',
            'refresh_token' => 'encrypted',
            'tautan_pada' => 'datetime',
            'terakhir_unggah' => 'datetime',
            'unggah_otomatis' => 'boolean',
            'simpan_terakhir' => 'integer',
        ];
    }

    public static function tunggal(): self
    {
        return static::query()->firstOrCreate([]);
    }

    /** Kredensial OAuth sudah diisi — syarat sebelum tombol "Tautkan" berarti. */
    public function kredensialLengkap(): bool
    {
        return filled($this->client_id) && filled($this->client_secret);
    }

    /** Sudah melewati persetujuan Google dan memegang refresh token. */
    public function tertaut(): bool
    {
        return $this->kredensialLengkap() && filled($this->refresh_token);
    }
}
