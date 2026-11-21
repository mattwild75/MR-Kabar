<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Video film pendek pre-test atau post-test beserta 20 titik berhentinya.
 *
 * Dua sumber, unggahan didahulukan:
 * - unggahan lewat halaman Kelola: penyimpanan privat
 *   (storage/app/private/tes-video), diputar hanya untuk admin dan
 *   super-admin;
 * - film BAWAAN aplikasi (BAWAAN di bawah): public/video, ikut repositori
 *   lewat Git LFS. Atas keputusan pemilik (21 Nov 2026) film tes boleh
 *   publik karena tes ini bersifat edukasi, bukan penilaian bersertifikat.
 *   Film tidak memuat kunci jawaban; pembahasan hanya tampil langsung di
 *   layar tayang.
 */
class TesVideo extends Model
{
    protected $table = 'tes_video';

    protected $fillable = ['jenis', 'berkas', 'isyarat'];

    protected $casts = ['isyarat' => 'array'];

    /**
     * Film bawaan (sumber naskah & render di folder video-tes yang tidak ikut
     * repositori). Titik berhenti = detik frame kartu soal utuh, dari
     * video-tes/<film>/isyarat.txt. Naikkan "versi" setiap kali berkasnya
     * diganti supaya peramban tidak memakai salinan lama.
     *
     * @var array<string, array{berkas: string, versi: string, isyarat: list<float>}>
     */
    public const BAWAAN = [
        'pre' => [
            'berkas' => 'video/tes-pre-sebelum-lepas-tali.mp4',
            'versi' => '2026-11-21-logo',
            'isyarat' => [107.15, 127.08, 151.45, 180.48, 213.58, 231.25, 250.72, 271.58, 307.62, 337.88,
                357.35, 376.15, 412.88, 438.28, 462.18, 487.55, 526.05, 554.92, 578.68, 598.35],
        ],
        'post' => [
            'berkas' => 'video/tes-post-pulang-membawa-peta.mp4',
            'versi' => '2026-11-21-logo',
            'isyarat' => [82.58, 101.92, 117.95, 144.92, 175.05, 194.85, 217.88, 237.42, 267.82, 292.78,
                311.22, 331.88, 368.62, 393.92, 412.02, 433.05, 464.88, 490.68, 514.38, 534.82],
        ],
    ];

    /**
     * Video yang dipakai layar tayang untuk satu jenis tes: unggahan bila ada,
     * kalau tidak film bawaan bila berkasnya benar-benar tersedia (bukan
     * penunjuk Git LFS yang belum diunduh).
     *
     * @return array{url: string, isyarat: list<float>, sumber: string, diperbarui: string|null}|null
     */
    public static function untuk(string $jenis): ?array
    {
        $video = self::where('jenis', $jenis)->first();
        if ($video?->berkas) {
            return [
                'url' => '/edukasi/kelola/video/'.$jenis.'/putar?v='.$video->updated_at?->timestamp,
                'isyarat' => array_values(array_map('floatval', $video->isyarat ?? [])),
                'sumber' => 'unggahan',
                'diperbarui' => $video->updated_at?->toIso8601String(),
            ];
        }

        $bawaan = self::BAWAAN[$jenis] ?? null;
        if ($bawaan === null) {
            return null;
        }
        $jalur = public_path($bawaan['berkas']);
        if (! is_file($jalur) || filesize($jalur) < 1_000_000) {
            return null;
        }

        return [
            'url' => '/'.$bawaan['berkas'].'?v='.$bawaan['versi'],
            'isyarat' => $bawaan['isyarat'],
            'sumber' => 'bawaan',
            'diperbarui' => null,
        ];
    }
}
