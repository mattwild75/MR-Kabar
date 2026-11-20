<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Peserta satu sesi. Baris dibuat begitu token benar (biodata_pada masih
 * kosong), supaya pemandu sudah melihat "sedang mengisi biodata" di halaman
 * Pantau sebelum peserta menekan Mulai.
 *
 * NIP, jabatan, dan SKPK hanya terlihat oleh admin dan super-admin. Layar
 * proyektor hanya menampilkan nama.
 */
class TesPeserta extends Model
{
    /** Tanpa sinyal selama ini (detik), peserta dianggap terputus. */
    public const BATAS_TERPUTUS = 25;

    protected $table = 'tes_peserta';

    protected $fillable = [
        'sesi_id', 'perangkat_hash', 'nama', 'nip', 'bukan_asn', 'jabatan', 'opd_id', 'instansi_lain',
        'biodata_pada', 'terakhir_aktif', 'di_halaman', 'jumlah_keluar', 'pindah_perangkat', 'dikeluarkan_pada',
    ];

    protected $hidden = ['perangkat_hash'];

    protected $casts = [
        'bukan_asn' => 'boolean',
        'di_halaman' => 'boolean',
        'biodata_pada' => 'datetime',
        'terakhir_aktif' => 'datetime',
        'dikeluarkan_pada' => 'datetime',
    ];

    /** @return BelongsTo<TesSesi, $this> */
    public function sesi(): BelongsTo
    {
        return $this->belongsTo(TesSesi::class, 'sesi_id');
    }

    /** @return BelongsTo<Opd, $this> */
    public function opd(): BelongsTo
    {
        return $this->belongsTo(Opd::class, 'opd_id');
    }

    /** @return HasMany<TesJawaban, $this> */
    public function jawaban(): HasMany
    {
        return $this->hasMany(TesJawaban::class, 'peserta_id');
    }

    /** Sudah mengisi biodata dan tidak dikeluarkan pemandu: dihitung dalam nilai dan peringkat. */
    public function sah(): bool
    {
        return $this->biodata_pada !== null && $this->dikeluarkan_pada === null;
    }

    public function namaInstansi(): string
    {
        return $this->opd?->nama ?? ($this->instansi_lain ?: '-');
    }
}
