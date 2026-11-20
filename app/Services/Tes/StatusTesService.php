<?php

namespace App\Services\Tes;

use App\Models\TesSesi;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

/**
 * Satu-satunya pintu untuk mengubah keadaan sesi tes langsung.
 *
 * Setiap perubahan (buka pendaftaran, mulai, buka/tutup soal, selesai)
 * menaikkan `versi` di basis data lalu menulis ulang berkas kecil
 * storage/app/public/tes/{kunci_publik}.json. Ponsel peserta membaca berkas
 * itu tiap 1,5 detik langsung dari server web, tanpa PHP dan tanpa basis
 * data, sehingga ratusan peserta serentak hampir tidak membebani server.
 *
 * Kalau suatu saat server web menyajikan salinan lama dari cache, denyut
 * peserta (yang melewati aplikasi) membawa versi terbaru dari basis data;
 * ponsel yang melihat selisih versi beralih membaca /edukasi/tes/status.
 * Isi berkas tidak memuat soal, kunci, maupun data peserta.
 */
class StatusTesService
{
    /** @return array<string, mixed> */
    public function muatan(TesSesi $sesi): array
    {
        return [
            'v' => (int) $sesi->versi,
            'status' => $sesi->status,
            'soal' => $sesi->soal_aktif,
            'terbuka' => (bool) $sesi->soal_terbuka,
            'total' => TesSesi::JUMLAH_SOAL,
        ];
    }

    /**
     * Ubah keadaan sesi secara atomik (baris dikunci selama perubahan), lalu
     * tulis berkas statusnya.
     *
     * @param  array<string, mixed>  $perubahan
     */
    public function ubah(TesSesi $sesi, array $perubahan): TesSesi
    {
        $hasil = DB::transaction(function () use ($sesi, $perubahan) {
            /** @var TesSesi $terkunci */
            $terkunci = TesSesi::whereKey($sesi->id)->lockForUpdate()->firstOrFail();
            $terkunci->fill($perubahan);
            $terkunci->versi = (int) $terkunci->versi + 1;
            $terkunci->save();

            return $terkunci;
        });

        $this->tulis($hasil);

        return $hasil;
    }

    public function tulis(TesSesi $sesi): void
    {
        $disk = Storage::disk('public');
        $disk->makeDirectory('tes');
        $tujuan = $disk->path($this->jalur($sesi));
        $sementara = $tujuan.'.'.bin2hex(random_bytes(4)).'.tmp';

        file_put_contents($sementara, json_encode($this->muatan($sesi)), LOCK_EX);
        // rename() di sistem berkas yang sama bersifat atomik: pembaca tidak
        // pernah mendapat berkas setengah tertulis. Di Windows (lingkungan
        // lokal) rename tidak menimpa berkas yang ada, jadi dihapus dulu.
        if (PHP_OS_FAMILY === 'Windows' && is_file($tujuan)) {
            @unlink($tujuan);
        }
        rename($sementara, $tujuan);
    }

    public function hapus(TesSesi $sesi): void
    {
        Storage::disk('public')->delete($this->jalur($sesi));
    }

    public function urlPublik(TesSesi $sesi): string
    {
        return '/storage/'.$this->jalur($sesi);
    }

    private function jalur(TesSesi $sesi): string
    {
        return 'tes/'.$sesi->kunci_publik.'.json';
    }
}
