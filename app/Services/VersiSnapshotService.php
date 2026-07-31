<?php

namespace App\Services;

use Carbon\Carbon;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Facades\Schema;

/**
 * Memasangkan tiap tag versi git dengan snapshot database yang sepadan.
 *
 * Latar masalahnya: rollback kode SENDIRIAN tidak pernah aman. `git reset
 * --hard v1.0.3` memundurkan berkas PHP/TSX, tetapi database di server tetap
 * berisi skema & data hasil migrasi versi yang lebih baru — kolom yang belum
 * dikenal kode lama, atau justru kolom yang sudah dihapus tapi masih dipanggil.
 * Karena itu tiap tag di sini disertai satu berkas dump database yang diambil
 * TEPAT pada saat tag dibuat, plus catatan keadaan migrasi saat itu.
 *
 * Snapshot versi SENGAJA disimpan di folder tersendiri (`private/versi`),
 * BUKAN di folder backup harian — karena BackupController::keepOnlyLatestBackup()
 * menyisakan tepat satu berkas di folder backup harian, sehingga snapshot versi
 * pasti terhapus begitu backup berikutnya dibuat. Folder ini tidak pernah
 * dipangkas otomatis: sebuah versi baru berguna justru ketika sudah lama.
 *
 * Seluruh isi `storage/app/private` diabaikan git (lihat .gitignore di folder
 * itu), jadi snapshot ini SELALU tinggal di mesin lokal dan tidak pernah ikut
 * ter-push ke GitHub. Konsekuensinya disengaja: siapa pun yang meng-clone
 * repository ini mendapat aplikasi dengan database kosong untuk diisi sendiri,
 * bukan salinan data Pemerintah Kabupaten Aceh Barat.
 */
class VersiSnapshotService
{
    /**
     * Tabel yang dicacah jumlah barisnya saat snapshot dibuat. Bukan untuk
     * statistik, melainkan supaya operator bisa membandingkan "sebelum
     * dipulihkan" dengan "sesudah dipulihkan" dan tahu data mana yang
     * sesungguhnya berubah — angka nol di seluruh baris berarti restore gagal
     * diam-diam meski tidak ada pesan error.
     */
    private const TABEL_DICACAH = [
        'users',
        'opd',
        'tbl_krs_pemda',
        'tbl_irs_pemda',
        'tbl_krs_pd',
        'tbl_irs_pd',
        'tbl_kro_pd',
        'tbl_iro_pd',
        'cee_jawaban',
        'cee_simpulan',
        'cee_rtp',
        'monitoring_rtp',
        'laporan_kejadian_risiko',
        'program_bupati_risiko',
    ];

    /**
     * Pola nama tag yang diterima. Bukan sekadar kerapian penamaan: nama tag
     * dipakai langsung sebagai nama berkas snapshot, jadi pembatasan ini yang
     * mencegah masukan seperti "../../.env" menulis ke luar folder versi.
     */
    public const POLA_TAG = '/^v\d+\.\d+\.\d+(-[0-9A-Za-z][0-9A-Za-z.-]*)?$/';

    public function folder(): string
    {
        return storage_path('app/private/versi');
    }

    private function berkasManifes(): string
    {
        return $this->folder() . '/manifest.json';
    }

    public function tagSah(string $tag): bool
    {
        return (bool) preg_match(self::POLA_TAG, $tag);
    }

    /**
     * Seluruh isi manifes, terbaru dulu. Manifes yang rusak/tidak terbaca
     * dianggap kosong alih-alih melempar exception — halaman Backup harus
     * tetap bisa dibuka meski catatan versinya bermasalah, karena dari
     * halaman itulah operator memperbaiki keadaan.
     */
    public function manifes(): array
    {
        $berkas = $this->berkasManifes();
        if (!File::exists($berkas)) {
            return [];
        }

        $isi = json_decode(File::get($berkas), true);

        return is_array($isi) ? $isi : [];
    }

    private function tulisManifes(array $isi): void
    {
        File::ensureDirectoryExists($this->folder());
        File::put(
            $this->berkasManifes(),
            json_encode($isi, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
        );
    }

    public function catatan(string $tag): ?array
    {
        foreach ($this->manifes() as $baris) {
            if (($baris['tag'] ?? null) === $tag) {
                return $baris;
            }
        }

        return null;
    }

    /**
     * Apakah snapshot untuk satu tag benar-benar ada dan utuh. Manifes saja
     * tidak cukup dijadikan pegangan — berkas zip-nya bisa terhapus manual
     * dari Explorer tanpa manifesnya ikut diperbarui.
     */
    public function snapshotAda(string $tag): bool
    {
        $catatan = $this->catatan($tag);

        return $catatan !== null && File::exists($this->berkasSnapshot($tag));
    }

    public function berkasSnapshot(string $tag): string
    {
        return $this->folder() . '/' . $tag . '.zip';
    }

    /**
     * Cacah baris tabel inti pada keadaan database sekarang. Tabel yang belum
     * ada (karena versi ini memang belum punya migrasinya) dilewati, bukan
     * dianggap nol — supaya "tabel belum ada" tidak tersamar jadi "tabel kosong".
     */
    public function cacahTabel(): array
    {
        $hasil = [];
        foreach (self::TABEL_DICACAH as $tabel) {
            if (Schema::hasTable($tabel)) {
                $hasil[$tabel] = DB::table($tabel)->count();
            }
        }

        return $hasil;
    }

    public function keadaanMigrasi(): array
    {
        if (!Schema::hasTable('migrations')) {
            return ['terakhir' => null, 'jumlah' => 0];
        }

        return [
            'terakhir' => DB::table('migrations')->orderByDesc('id')->value('migration'),
            'jumlah' => DB::table('migrations')->count(),
        ];
    }

    public function commitSekarang(): ?string
    {
        $hasil = Process::timeout(15)->run(['git', '-C', base_path(), 'rev-parse', 'HEAD']);

        return $hasil->successful() ? trim($hasil->output()) : null;
    }

    /**
     * Ambil dump database sekarang lalu simpan sebagai snapshot milik $tag.
     *
     * Dump-nya dibuat dengan `backup:run --only-db` yang sama dengan tombol
     * backup biasa — bukan mekanisme tersendiri — supaya berkasnya berformat
     * identik dan bisa dipulihkan lewat jalur impor yang sudah teruji. Berkas
     * hasilnya DISALIN (bukan dipindahkan) ke folder versi, sehingga backup
     * harian tetap punya berkas terbarunya seperti biasa.
     *
     * @throws \RuntimeException bila dump tidak terbentuk
     */
    public function rekam(string $tag, string $folderBackupHarian, ?string $catatan = null): array
    {
        if (!$this->tagSah($tag)) {
            throw new \InvalidArgumentException('Nama tag tidak memenuhi pola versi yang diizinkan.');
        }

        Artisan::call('backup:run', ['--only-db' => true]);

        $terbaru = collect(File::exists($folderBackupHarian) ? File::files($folderBackupHarian) : [])
            ->filter(fn($berkas) => $berkas->getExtension() === 'zip')
            ->sortByDesc(fn($berkas) => $berkas->getMTime())
            ->first();

        if (!$terbaru) {
            throw new \RuntimeException('Dump database tidak terbentuk — snapshot versi tidak dapat dibuat.');
        }

        File::ensureDirectoryExists($this->folder());
        $tujuan = $this->berkasSnapshot($tag);
        File::copy($terbaru->getPathname(), $tujuan);

        $migrasi = $this->keadaanMigrasi();
        $baris = [
            'tag' => $tag,
            'commit' => $this->commitSekarang(),
            'dibuat' => Carbon::now()->toDateTimeString(),
            'berkas' => basename($tujuan),
            'ukuran' => File::size($tujuan),
            'sidik_jari' => hash_file('sha256', $tujuan),
            'migrasi_terakhir' => $migrasi['terakhir'],
            'jumlah_migrasi' => $migrasi['jumlah'],
            'cacah_tabel' => $this->cacahTabel(),
            'catatan' => $catatan,
        ];

        $manifes = array_values(array_filter(
            $this->manifes(),
            fn($lama) => ($lama['tag'] ?? null) !== $tag
        ));
        array_unshift($manifes, $baris);
        $this->tulisManifes($manifes);

        return $baris;
    }

    /**
     * Buang satu versi dari manifes berikut berkas snapshot-nya.
     */
    public function hapus(string $tag): void
    {
        if (!$this->tagSah($tag)) {
            return;
        }

        File::delete($this->berkasSnapshot($tag));
        $this->tulisManifes(array_values(array_filter(
            $this->manifes(),
            fn($baris) => ($baris['tag'] ?? null) !== $tag
        )));
    }

    /**
     * Apakah berkas snapshot masih sama dengan saat direkam. Dipanggil sebelum
     * memulihkan: memulihkan zip yang rusak akan menimpa database yang masih
     * baik dengan dump separuh jadi, dan itu tidak bisa dibatalkan.
     */
    public function snapshotUtuh(string $tag): bool
    {
        $catatan = $this->catatan($tag);
        $berkas = $this->berkasSnapshot($tag);

        if ($catatan === null || !File::exists($berkas)) {
            return false;
        }

        if (empty($catatan['sidik_jari'])) {
            return true;
        }

        return hash_equals($catatan['sidik_jari'], hash_file('sha256', $berkas));
    }

    /**
     * Bandingkan keadaan migrasi database sekarang dengan yang tercatat pada
     * satu tag. Dipakai memberi peringatan setelah rollback kode: kalau
     * jumlahnya berbeda, kode versi lama sedang berjalan di atas skema yang
     * bukan miliknya.
     */
    public function selisihMigrasi(string $tag): ?array
    {
        $catatan = $this->catatan($tag);
        if ($catatan === null) {
            return null;
        }

        $sekarang = $this->keadaanMigrasi();
        $tercatat = (int) ($catatan['jumlah_migrasi'] ?? 0);

        return [
            'sepadan' => $sekarang['jumlah'] === $tercatat,
            'sekarang' => $sekarang['jumlah'],
            'tag' => $tercatat,
            'selisih' => $sekarang['jumlah'] - $tercatat,
        ];
    }
}
