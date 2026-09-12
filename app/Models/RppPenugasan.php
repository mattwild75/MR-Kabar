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

    /**
     * Warna pada rekap Analisis dan Evaluasi: st_terbit = merah (baru ST /
     * sedang bertugas), nomor_diminta = kuning (sudah minta nomor laporan),
     * lhp_terbit = hijau (laporan terbit, masuk aneva).
     */
    public const STATUS = ['draft', 'st_terbit', 'nomor_diminta', 'selesai', 'lhp_terbit', 'batal'];

    protected $fillable = [
        'rpp_id', 'urutan', 'uraian', 'sifat', 'lokasi', 'jumlah_laporan',
        'masa_tugas_mulai', 'masa_tugas_selesai', 'tmt_teks',
        'nomor_sp', 'nomor_st', 'tanggal_st', 'nomor_kp', 'capaian_output', 'status', 'keterangan', 'sinkron_aneva_pada',
    ];

    protected $casts = [
        'masa_tugas_mulai' => 'date',
        'masa_tugas_selesai' => 'date',
        'tanggal_st' => 'date',
        'sinkron_aneva_pada' => 'datetime',
    ];

    /**
     * Kecamatan di Aceh Barat selain Johan Pahlawan (ibu kota Meulaboh). Nama
     * salah satunya di teks penugasan = perjalanan luar kota.
     */
    public const KECAMATAN_LUAR = [
        'samatiga', 'bubon', 'arongan lambalek', 'woyla', 'woyla barat', 'woyla timur',
        'kaway xvi', 'meureubo', 'pante ceureumen', 'panton reu', 'sungai mas',
    ];

    /**
     * Tebak lokasi dari teks obrik/objek: menyebut gampong/desa/kecamatan lain,
     * puskesmas, atau sekolah di luar Meulaboh = luar; selebihnya (SKPK di
     * Meulaboh) = dalam. Dipakai bila kolom `lokasi` belum ditetapkan.
     */
    public static function tebakLokasi(string $teks): string
    {
        $t = mb_strtolower($teks);
        foreach (self::KECAMATAN_LUAR as $k) {
            if (str_contains($t, $k)) {
                return 'luar';
            }
        }
        if (preg_match('/\b(gampong|desa|mukim|keuchik|kecamatan|kec\.|camat|puskesmas|pustu)\b/u', $t)) {
            return str_contains($t, 'johan pahlawan') && ! preg_match('/\b(gampong|desa|mukim)\b/u', $t) ? 'dalam' : 'luar';
        }
        if (preg_match('/\b(sdn?|smpn?|sman?|smkn?|sekolah|mts|min|man)\b/u', $t) && ! str_contains($t, 'meulaboh') && ! str_contains($t, 'johan pahlawan')) {
            return 'luar';
        }

        return 'dalam';
    }

    /** Lokasi efektif: kolom lokasi, atau tebakan dari uraian + objek. */
    public function lokasiTampil(): string
    {
        return $this->lokasi ?: self::tebakLokasi(($this->uraian ?? '').' '.$this->obriks->pluck('nama')->join(' '));
    }

    /** Tarif SPPD per hari LK untuk penugasan ini (pengaturan dalam/luar kota). */
    public function tarifSppd(): int
    {
        $s = RppSetting::current();

        return (int) ($this->lokasiTampil() === 'luar' ? $s->tarif_luar_kota : $s->tarif_per_hari);
    }

    /** Biaya SPPD penugasan: hanya hari LK x tarif (DK tidak dibayar). */
    public function biayaSppd(): int
    {
        $tarif = $this->tarifSppd();

        return (int) $this->teamMembers->sum(fn ($m) => (int) $m->hari_lapangan * (int) ($m->tarif_per_hari ?: $tarif));
    }

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
