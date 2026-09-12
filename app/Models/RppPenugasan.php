<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Satu baris bernomor pada tabel RPP: obrik, sifat audit, jumlah laporan, TMT,
 * dan timnya. Surat Perintah/Surat Tugas/Kartu Penugasan (SP/ST/KP) diterbitkan
 * per penugasan, bukan per dokumen.
 */
class RppPenugasan extends Model
{
    protected $table = 'rpp_penugasan';

    public const BULAN = [
        1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
        5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
        9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember',
    ];

    public const STATUS = ['draft', 'st_terbit', 'selesai', 'lhp_terbit'];

    protected $fillable = [
        'rpp_id', 'urutan', 'uraian', 'sifat', 'jumlah_laporan',
        'masa_tugas_mulai', 'masa_tugas_selesai', 'tmt_teks',
        'nomor_sp', 'nomor_st', 'tanggal_st', 'nomor_kp', 'capaian_output', 'status',
    ];

    protected $casts = [
        'masa_tugas_mulai' => 'date',
        'masa_tugas_selesai' => 'date',
        'tanggal_st' => 'date',
    ];

    public function rpp(): BelongsTo
    {
        return $this->belongsTo(Rpp::class);
    }

    public function teamMembers(): HasMany
    {
        return $this->hasMany(RppTeamMember::class)->orderBy('order');
    }

    public function obriks(): HasMany
    {
        return $this->hasMany(RppObrik::class)->orderBy('order');
    }

    public function laporans(): HasMany
    {
        return $this->hasMany(RppLaporan::class)->orderBy('order');
    }

    /**
     * Teks TMT persis gaya berkas asli: "TMT 12 Maret - 9 April 2025",
     * "TMT 10 - 19 Februari 2025" bila bulannya sama.
     */
    public function tmtTampil(): ?string
    {
        if (filled($this->tmt_teks)) {
            return $this->tmt_teks;
        }
        $m = $this->masa_tugas_mulai;
        $s = $this->masa_tugas_selesai;
        if (! $m) {
            return null;
        }
        if (! $s) {
            return 'TMT '.$m->day.' '.self::BULAN[$m->month].' '.$m->year;
        }
        if ($m->month === $s->month && $m->year === $s->year) {
            return 'TMT '.$m->day.' - '.$s->day.' '.self::BULAN[$s->month].' '.$s->year;
        }
        if ($m->year === $s->year) {
            return 'TMT '.$m->day.' '.self::BULAN[$m->month].' - '.$s->day.' '.self::BULAN[$s->month].' '.$s->year;
        }

        return 'TMT '.$m->day.' '.self::BULAN[$m->month].' '.$m->year.' - '.$s->day.' '.self::BULAN[$s->month].' '.$s->year;
    }
}
