<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Satu DOKUMEN Rencana Penugasan Pengawasan — bernomor, bertanggal, memuat
 * beberapa penugasan (RppPenugasan). Mengikuti berkas RPP*.xls Bagian
 * Perencanaan: judul + "BULAN X TAHUN" + Nomor di kepala, tabel penugasan,
 * dan tanda tangan Inspektur di kaki. Surat pengantarnya (Pengantar RPP*.doc)
 * juga satu per dokumen.
 */
class Rpp extends Model
{
    use SoftDeletes;

    public const JUDUL_BAKU = 'RENCANA PENUGASAN PENGAWASAN';

    protected $fillable = [
        'rpp_category_id',
        'user_id',
        'year',
        'bulan',
        'nomor_rpp',
        'judul',
        'sub_judul',
        'tanggal_rpp',
        'tarif_per_hari',
        'tanggal_surat',
        'surat_dasar_uraian',
        'hal',
        'tujuan_surat',
        'dengan_penutup',
    ];

    protected $casts = [
        'tanggal_rpp' => 'date',
        'tanggal_surat' => 'date',
        'dengan_penutup' => 'boolean',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(RppCategory::class, 'rpp_category_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function penugasan(): HasMany
    {
        return $this->hasMany(RppPenugasan::class)->orderBy('urutan');
    }

    public function teamMembers(): HasManyThrough
    {
        return $this->hasManyThrough(RppTeamMember::class, RppPenugasan::class);
    }

    /**
     * Tarif dokumen lama (berkas 2025 mencantumkan 100.000/140.000 per dokumen).
     * Sejak 12 September 2026 tarif ditentukan per penugasan lewat lokasinya
     * (RppPenugasan::tarifSppd); kolom ini tinggal jejak.
     */
    public function tarifBerlaku(): int
    {
        return (int) ($this->tarif_per_hari ?: RppSetting::current()->tarif_per_hari);
    }

    /** Sub judul di kepala tabel: "BULAN MARET 2025" atau teks khusus. */
    public function subJudulTampil(): string
    {
        if (filled($this->sub_judul)) {
            return strtoupper($this->sub_judul);
        }
        $nomorBulan = $this->bulan ?: $this->tanggal_rpp?->month;
        $bulan = $nomorBulan ? strtoupper(RppPenugasan::BULAN[$nomorBulan] ?? '') : '';

        return trim('BULAN '.$bulan.' '.$this->year);
    }

    public function judulTampil(): string
    {
        return strtoupper($this->judul ?: self::JUDUL_BAKU);
    }

    /** Perihal surat pengantar; jatuh ke sebutan kategori bila tidak diisi. */
    public function halTampil(): string
    {
        return $this->hal ?: 'Penyampaian Rencana Penugasan '.($this->category?->sebutan ?? $this->category?->name).' Tahun '.$this->year;
    }

    public function tujuanSuratTampil(): string
    {
        return $this->tujuan_surat ?: ($this->category?->tujuan_surat ?: 'Ketua Tim '.($this->category?->sebutan ?? $this->category?->name));
    }

    /** Ringkasan angka untuk tabel daftar: hari, biaya, jumlah tim, laporan. */
    public function ringkasan(): array
    {
        $hari = 0;
        $hariLk = 0;
        $biaya = 0;
        $tim = 0;
        $laporan = 0;
        foreach ($this->penugasan as $p) {
            $laporan += (int) ($p->jumlah_laporan ?? 0);
            // biaya = SPPD: hanya hari Luar Kantor, tarif menurut lokasi penugasan
            $biaya += $p->biayaSppd();
            foreach ($p->teamMembers as $m) {
                $tim++;
                $hari += (int) $m->hari_kantor + (int) $m->hari_lapangan;
                $hariLk += (int) $m->hari_lapangan;
            }
        }

        return ['hari' => $hari, 'hari_lk' => $hariLk, 'biaya' => $biaya, 'tim' => $tim, 'laporan' => $laporan, 'penugasan' => $this->penugasan->count()];
    }
}
