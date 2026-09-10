<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Satu baris Penilaian Risiko Kecurangan (FRA) — MR Fraud.
 *
 * Dasar: Perdep BPKP Bidang Investigasi No. 1 Tahun 2019 tentang Pedoman
 * Penilaian Risiko Kecurangan, dan Perbup Aceh Barat No. 6 Tahun 2025.
 *
 * Satu baris memuat ketiga lembar kertas kerja sekaligus (IR -> AR -> RTP);
 * lihat alasannya di migrasi buat_tabel_penilaian_risiko_kecurangan.
 */
class FraudRisiko extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'fraud_risiko';

    protected $guarded = ['id'];

    protected $casts = [
        'kelompok_risiko' => 'array',
        'tahun_penilaian' => 'integer',
        'probabilitas_inheren' => 'integer',
        'dampak_inheren' => 'integer',
        'probabilitas_residual' => 'integer',
        'dampak_residual' => 'integer',
    ];

    protected $appends = [
        'besaran_inheren', 'level_inheren', 'warna_inheren',
        'besaran_residual', 'level_residual', 'warna_residual',
    ];

    /**
     * Tahapan proses yang dinilai.
     *
     * Empat tahapan ini yang dipakai kertas kerja FRA dan kamus risiko pada
     * pedoman. "Pengadaan Barang dan Jasa" berdiri sendiri, bukan bagian
     * Pelaksanaan, karena kamus risikonya memang terpisah.
     */
    public const TAHAPAN = [
        'Perencanaan',
        'Pengadaan Barang dan Jasa',
        'Pelaksanaan',
        'Pertanggungjawaban/Pelaporan',
    ];

    /**
     * Kelompok risiko = tujuh delik tindak pidana korupsi menurut UU No. 31
     * Tahun 1999 jo. UU No. 20 Tahun 2001.
     *
     * Sengaja pilihan baku, bukan teks bebas. Di kertas kerja asli kolom ini
     * diisi bebas dan hasilnya sudah tidak konsisten pada data contoh:
     * "Perbuatan curang", "perbuatan curang", dan "Perbuatan curang, kerugian
     * keuangan daerah" dalam satu sel — sehingga tidak bisa dihitung maupun
     * disaring. Kerapuhan yang sama jenisnya dengan temuan audit R-08.
     */
    public const KELOMPOK_RISIKO = [
        'Kerugian Keuangan Negara/Daerah',
        'Suap-Menyuap',
        'Penggelapan dalam Jabatan',
        'Pemerasan',
        'Perbuatan Curang',
        'Benturan Kepentingan dalam Pengadaan',
        'Gratifikasi',
    ];

    public const PENGENDALIAN_ADA = ['Ada', 'Belum Ada'];

    public const PENGENDALIAN_MEMADAI = ['Memadai', 'Belum Memadai'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function opd(): BelongsTo
    {
        return $this->belongsTo(Opd::class);
    }

    public function getBesaranInherenAttribute(): ?int
    {
        return $this->besaran($this->probabilitas_inheren, $this->dampak_inheren);
    }

    public function getBesaranResidualAttribute(): ?int
    {
        return $this->besaran($this->probabilitas_residual, $this->dampak_residual);
    }

    public function getLevelInherenAttribute(): ?string
    {
        return $this->level($this->besaran_inheren)?->label;
    }

    public function getLevelResidualAttribute(): ?string
    {
        return $this->level($this->besaran_residual)?->label;
    }

    public function getWarnaInherenAttribute(): ?string
    {
        return $this->level($this->besaran_inheren)?->warna_class;
    }

    public function getWarnaResidualAttribute(): ?string
    {
        return $this->level($this->besaran_residual)?->warna_class;
    }

    /**
     * Besaran risiko dari matriks 5x5.
     *
     * Diambil dari `risk_matrix_cells` — tabel yang sama dengan yang dipakai
     * seluruh aplikasi, dan yang isinya terbukti PERSIS SAMA dengan matriks di
     * kertas kerja FRA. Matriksnya BUKAN tabel perkalian: probabilitas 2 x
     * dampak 4 menghasilkan 13, bukan 8. Jangan pernah menghitungnya sendiri.
     */
    private function besaran(?int $probabilitas, ?int $dampak): ?int
    {
        if (! $probabilitas || ! $dampak) {
            return null;
        }

        return RiskMatrixCell::query()
            ->where('kemungkinan', $probabilitas)
            ->where('dampak', $dampak)
            ->value('skala_risiko');
    }

    /**
     * Level risiko dari besaran, lewat `risk_levels`.
     *
     * KEPUTUSAN: IKUT SKORING MR KABAR. Kertas kerja FRA menulis Sedang 12-15
     * dan Rendah 6-11, sedangkan `risk_levels` aplikasi memakai Sedang 11-15
     * dan Rendah 6-10 — jadi besaran 11 dibaca berbeda oleh keduanya. Selisih
     * ini diangkat 10 September 2026 dan diputuskan mengikuti skoring MR
     * Kabar, supaya satu angka tidak pernah punya dua jawaban di dua menu
     * aplikasi yang sama.
     *
     * Akibatnya konkret dan sengaja: besaran 11 di MR Fraud berbunyi "Sedang",
     * berbeda satu tingkat dari kertas kerja Excel. Kalau kelak diputuskan
     * sebaliknya, yang diubah ISI `risk_levels` lewat Keterangan Pendukung —
     * bukan kode ini, dan bukan dengan menambahkan tabel level kedua khusus
     * MR Fraud.
     */
    private function level(?int $besaran): ?RiskLevel
    {
        if ($besaran === null) {
            return null;
        }

        return RiskLevel::query()
            ->where('skala_min', '<=', $besaran)
            ->where('skala_max', '>=', $besaran)
            ->first();
    }
}
