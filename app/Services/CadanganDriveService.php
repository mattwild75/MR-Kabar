<?php

namespace App\Services;

use App\Models\CadanganDrive;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;

/**
 * Google Drive sebagai tempat cadangan basis data di luar VM.
 *
 * Memakai OAuth 2.0 milik akun Google pengguna sendiri (bukan service account):
 * Super Admin memasukkan Client ID/Secret dari Google Cloud Console, menyetujui
 * akses satu kali, dan aplikasi menyimpan refresh token terenkripsi. Cakupan
 * yang diminta hanya `drive.file` — aplikasi cuma melihat berkas yang ia buat
 * sendiri, tidak seluruh isi Drive.
 *
 * Ditulis langsung di atas HTTP client Laravel, bukan google/apiclient: yang
 * dipakai hanya lima panggilan (token, unggah, daftar, unduh, hapus) dan
 * pustaka resminya membawa ratusan kelas layanan lain yang tidak terpakai.
 *
 * Berkas yang dikirim adalah zip hasil CadanganService — terkunci AES-256
 * bila BACKUP_ARCHIVE_PASSWORD terisi — sehingga siapa pun yang membuka Drive
 * itu tetap tidak bisa membaca dump-nya tanpa sandi arsip.
 */
class CadanganDriveService
{
    private const URL_OTORISASI = 'https://accounts.google.com/o/oauth2/v2/auth';

    private const URL_TOKEN = 'https://oauth2.googleapis.com/token';

    private const URL_CABUT = 'https://oauth2.googleapis.com/revoke';

    private const URL_PROFIL = 'https://www.googleapis.com/oauth2/v3/userinfo';

    private const URL_DRIVE = 'https://www.googleapis.com/drive/v3/files';

    private const URL_UNGGAH = 'https://www.googleapis.com/upload/drive/v3/files';

    private const CAKUPAN = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email';

    private ?string $tokenAkses = null;

    public function pengaturan(): CadanganDrive
    {
        return CadanganDrive::tunggal();
    }

    /** Redirect URI yang harus didaftarkan di Google Cloud Console — persis ini. */
    public function redirectUri(): string
    {
        return route('backup.drive.callback');
    }

    // --- OAuth --------------------------------------------------------------

    public function urlOtorisasi(string $state): string
    {
        $p = $this->pengaturan();

        return self::URL_OTORISASI.'?'.http_build_query([
            'client_id' => $p->client_id,
            'redirect_uri' => $this->redirectUri(),
            'response_type' => 'code',
            'scope' => self::CAKUPAN,
            'access_type' => 'offline',
            'prompt' => 'consent',
            'include_granted_scopes' => 'true',
            'state' => $state,
        ]);
    }

    /**
     * Tukar kode persetujuan menjadi refresh token, catat akun dan folder.
     *
     * @throws \RuntimeException dengan pesan yang layak ditampilkan
     */
    public function selesaikanTautan(string $kode): CadanganDrive
    {
        $p = $this->pengaturan();

        $jawab = Http::asForm()->timeout(20)->post(self::URL_TOKEN, [
            'code' => $kode,
            'client_id' => $p->client_id,
            'client_secret' => $p->client_secret,
            'redirect_uri' => $this->redirectUri(),
            'grant_type' => 'authorization_code',
        ]);

        if (! $jawab->successful() || blank($jawab->json('refresh_token'))) {
            throw new \RuntimeException('Google tidak memberikan refresh token: '.($jawab->json('error_description') ?? $jawab->json('error') ?? 'jawaban '.$jawab->status()).'. Coba tautkan ulang; bila berulang, cabut akses aplikasi ini di myaccount.google.com/permissions lalu ulangi.');
        }

        $this->tokenAkses = $jawab->json('access_token');

        $profil = $this->klien()->get(self::URL_PROFIL);
        $email = $profil->successful() ? $profil->json('email') : null;

        $p->forceFill([
            'refresh_token' => $jawab->json('refresh_token'),
            'akun_email' => $email,
            'tautan_pada' => now(),
            'terakhir_hasil' => null,
        ])->save();

        $p->forceFill(['folder_id' => $this->pastikanFolder()])->save();

        return $p;
    }

    /** Cabut token di Google dan lupakan di sini. Kredensial OAuth dibiarkan. */
    public function putuskan(): void
    {
        $p = $this->pengaturan();

        if (filled($p->refresh_token)) {
            try {
                Http::asForm()->timeout(10)->post(self::URL_CABUT, ['token' => $p->refresh_token]);
            } catch (\Throwable) {
                // Token yang gagal dicabut di Google tetap dilupakan di sini —
                // tanpa refresh token aplikasi tidak bisa memakainya lagi.
            }
        }

        $p->forceFill([
            'refresh_token' => null,
            'akun_email' => null,
            'folder_id' => null,
            'tautan_pada' => null,
            'terakhir_hasil' => null,
        ])->save();
        $this->tokenAkses = null;
    }

    /**
     * Token akses segar dari refresh token; disimpan di memori proses saja.
     *
     * @throws \RuntimeException
     */
    private function tokenAkses(): string
    {
        if ($this->tokenAkses !== null) {
            return $this->tokenAkses;
        }

        $p = $this->pengaturan();
        if (! $p->tertaut()) {
            throw new \RuntimeException('Google Drive belum ditautkan.');
        }

        $jawab = Http::asForm()->timeout(20)->post(self::URL_TOKEN, [
            'client_id' => $p->client_id,
            'client_secret' => $p->client_secret,
            'refresh_token' => $p->refresh_token,
            'grant_type' => 'refresh_token',
        ]);

        if (! $jawab->successful() || blank($jawab->json('access_token'))) {
            throw new \RuntimeException('Google menolak refresh token ('.($jawab->json('error_description') ?? $jawab->json('error') ?? $jawab->status()).'). Tautan mungkin sudah dicabut dari sisi Google — tautkan ulang.');
        }

        return $this->tokenAkses = $jawab->json('access_token');
    }

    private function klien(int $timeout = 30): PendingRequest
    {
        return Http::withToken($this->tokenAkses())->timeout($timeout)->acceptJson();
    }

    // --- Drive ---------------------------------------------------------------

    /** Cari folder tujuan yang pernah dibuat aplikasi ini; buat bila belum ada. */
    public function pastikanFolder(): string
    {
        $p = $this->pengaturan();

        if (filled($p->folder_id)) {
            $ada = $this->klien()->get(self::URL_DRIVE.'/'.$p->folder_id, ['fields' => 'id,trashed']);
            if ($ada->successful() && ! $ada->json('trashed')) {
                return $p->folder_id;
            }
        }

        $cari = $this->klien()->get(self::URL_DRIVE, [
            'q' => "mimeType='application/vnd.google-apps.folder' and name='".addslashes($p->folder_nama)."' and trashed=false",
            'fields' => 'files(id)',
            'pageSize' => 1,
        ]);
        if ($cari->successful() && filled($cari->json('files.0.id'))) {
            return $cari->json('files.0.id');
        }

        $buat = $this->klien()->post(self::URL_DRIVE, [
            'name' => $p->folder_nama,
            'mimeType' => 'application/vnd.google-apps.folder',
        ]);
        if (! $buat->successful()) {
            throw new \RuntimeException('Gagal membuat folder di Drive: '.$this->pesanGalat($buat));
        }

        return $buat->json('id');
    }

    /**
     * Unggah satu berkas ke folder tujuan (unggahan dapat-dilanjutkan, satu
     * PUT). Mengembalikan id berkas di Drive.
     */
    public function unggah(string $jalur, ?string $nama = null): string
    {
        if (! File::exists($jalur)) {
            throw new \RuntimeException('Berkas tidak ditemukan: '.$jalur);
        }

        $folder = $this->pastikanFolder();
        $nama ??= basename($jalur);

        $mulai = $this->klien()
            ->withHeaders(['X-Upload-Content-Type' => 'application/zip', 'X-Upload-Content-Length' => (string) File::size($jalur)])
            ->post(self::URL_UNGGAH.'?uploadType=resumable', [
                'name' => $nama,
                'parents' => [$folder],
                'description' => 'Cadangan basis data MR Kabar, dibuat '.now()->format('d-m-Y H:i').' WIB',
            ]);
        if (! $mulai->successful() || blank($mulai->header('Location'))) {
            throw new \RuntimeException('Drive menolak memulai unggahan: '.$this->pesanGalat($mulai));
        }

        $kirim = Http::withToken($this->tokenAkses())
            ->timeout(600)
            ->withHeaders(['Content-Type' => 'application/zip'])
            ->withBody(File::get($jalur), 'application/zip')
            ->put($mulai->header('Location'));
        if (! $kirim->successful() || blank($kirim->json('id'))) {
            throw new \RuntimeException('Unggahan ke Drive gagal: '.$this->pesanGalat($kirim));
        }

        return $kirim->json('id');
    }

    /**
     * Daftar cadangan di folder tujuan, terbaru dulu.
     *
     * @return array<int, array{id: string, nama: string, ukuran: int, dibuat: string}>
     */
    public function daftar(): array
    {
        $folder = $this->pastikanFolder();

        $jawab = $this->klien(15)->get(self::URL_DRIVE, [
            'q' => "'".$folder."' in parents and trashed=false",
            'fields' => 'files(id,name,size,createdTime)',
            'orderBy' => 'createdTime desc',
            'pageSize' => 100,
        ]);
        if (! $jawab->successful()) {
            throw new \RuntimeException('Gagal membaca daftar berkas di Drive: '.$this->pesanGalat($jawab));
        }

        return collect($jawab->json('files', []))
            ->map(fn (array $f) => [
                'id' => $f['id'],
                'nama' => $f['name'],
                'ukuran' => (int) ($f['size'] ?? 0),
                'dibuat' => $f['createdTime'],
            ])
            ->values()
            ->all();
    }

    /** Unduh satu berkas Drive ke jalur lokal. */
    public function unduh(string $idBerkas, string $tujuan): void
    {
        $jawab = Http::withToken($this->tokenAkses())
            ->timeout(600)
            ->sink($tujuan)
            ->get(self::URL_DRIVE.'/'.$idBerkas, ['alt' => 'media']);

        if (! $jawab->successful()) {
            File::delete($tujuan);

            throw new \RuntimeException('Gagal mengunduh dari Drive: '.$this->pesanGalat($jawab));
        }
    }

    public function hapus(string $idBerkas): void
    {
        $jawab = $this->klien()->delete(self::URL_DRIVE.'/'.$idBerkas);
        if (! $jawab->successful() && $jawab->status() !== 404) {
            throw new \RuntimeException('Gagal menghapus berkas di Drive: '.$this->pesanGalat($jawab));
        }
    }

    /**
     * Sisakan N berkas terbaru di folder tujuan. Mengembalikan jumlah yang
     * dihapus.
     */
    public function pangkas(int $simpan): int
    {
        $lebih = array_slice($this->daftar(), max(1, $simpan));
        foreach ($lebih as $berkas) {
            $this->hapus($berkas['id']);
        }

        return count($lebih);
    }

    /**
     * Buat cadangan basis data sekarang dan kirim ke Drive; catat hasilnya di
     * baris pengaturan supaya halaman Backup memperlihatkannya.
     *
     * @return array{id: string, nama: string}
     */
    public function cadangkanKeDrive(CadanganService $cadangan): array
    {
        $p = $this->pengaturan();

        try {
            $jalur = $cadangan->buatCadanganDb();
            $nama = 'mrkabar-db-'.now()->format('Ymd-Hi').'.zip';
            $id = $this->unggah($jalur, $nama);
            $dipangkas = $this->pangkas($p->simpan_terakhir);

            $p->forceFill([
                'terakhir_unggah' => now(),
                'terakhir_hasil' => 'Berhasil: '.$nama.' ('.round(File::size($jalur) / 1024).' KB)'.($dipangkas > 0 ? ", {$dipangkas} berkas lama dihapus" : ''),
            ])->save();

            return ['id' => $id, 'nama' => $nama];
        } catch (\Throwable $e) {
            $p->forceFill(['terakhir_hasil' => 'Gagal '.now()->format('d-m-Y H:i').': '.mb_substr($e->getMessage(), 0, 400)])->save();

            throw $e;
        }
    }

    private function pesanGalat(Response $jawab): string
    {
        return $jawab->json('error.message') ?? $jawab->json('error_description') ?? ('HTTP '.$jawab->status());
    }
}
