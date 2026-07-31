<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Bagian narasi (Form 11/12/13) — lihat komentar migrasi
 * create_laporan_narasi_table utk penjelasan lengkap skema & kolom.
 */
class LaporanNarasi extends Model
{
    /**
     * Nilai kolom `triwulan` untuk Laporan 14 (Komite Pengelolaan Risiko).
     *
     * Perdep halaman berlabel 148 mewajibkan laporan Komite disusun
     * SEMESTERAN dan tahunan — bukan triwulanan seperti Laporan 12 dan 13.
     * Kolom periodenya dipakai bersama karena indeks unik (jenis_laporan,
     * opd_id, tahun_penilaian, triwulan) sudah menjadikannya penanda periode
     * apa pun bentuknya; nama kolomnya saja yang terlanjur menyebut triwulan.
     * Nilai di bawah ini yang membedakannya, dan sengaja tidak berupa angka
     * romawi supaya tidak pernah tertukar dengan triwulan.
     */
    public const PERIODE_KOMITE = ['S1', 'S2', 'TAHUNAN'];

    public const PERIODE_KOMITE_LABEL = [
        'S1' => 'Semester I (Januari sampai Juni)',
        'S2' => 'Semester II (Juli sampai Desember)',
        'TAHUNAN' => 'Tahunan',
    ];

    use SoftDeletes;

    protected $table = 'laporan_narasi';

    protected $fillable = [
        'jenis_laporan',
        'opd_id',
        'tahun_penilaian',
        'triwulan',
        'latar_belakang',
        'dasar_hukum',
        'maksud_tujuan',
        'ruang_lingkup',
        'penutup',
        'kondisi_lingkungan_pengendalian',
        'rencana_perbaikan_lingkungan',
        'rancangan_informasi_komunikasi',
        'rancangan_pemantauan',
        'rencana_kegiatan',
        'realisasi_kegiatan',
        'hambatan_pelaksanaan',
        'monitoring_risiko_rtp',
        'hasil_pembinaan',
        'rekomendasi_feedback',
        'submitted_by',
    ];

    public function opd(): BelongsTo
    {
        return $this->belongsTo(Opd::class);
    }

    public function submittedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }

    public static function forKey(string $jenis, ?int $opdId, int $tahun, ?string $triwulan): ?self
    {
        return static::where('jenis_laporan', $jenis)
            ->where('opd_id', $opdId)
            ->where('tahun_penilaian', $tahun)
            ->where('triwulan', $triwulan)
            ->first();
    }
}
