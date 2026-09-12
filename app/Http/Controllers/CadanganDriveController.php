<?php

namespace App\Http\Controllers;

use App\Services\CadanganDriveService;
use App\Services\CadanganService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Cadangan basis data ke Google Drive — bagian dari halaman Backup.
 *
 * Alurnya: Super Admin menempel Client ID/Secret dari Google Cloud Console →
 * "Tautkan" → persetujuan Google → callback menyimpan refresh token → sejak
 * itu tombol "Cadangkan ke Drive" dan unggahan terjadwal (routes/console.php)
 * bekerja, dan tiap berkas di Drive bisa dipulihkan atau dihapus dari sini.
 *
 * Dikunci ke super-admin dengan alasan yang sama dengan BackupController:
 * berkasnya adalah dump seluruh tabel.
 */
class CadanganDriveController extends Controller
{
    public function __construct(
        private readonly CadanganDriveService $drive,
        private readonly CadanganService $cadangan,
    ) {}

    private function ensureSuperAdmin(): void
    {
        if (! auth()->user()?->hasRole('super-admin')) {
            abort(403, 'Cadangan Google Drive hanya dapat diakses oleh Super Admin.');
        }
    }

    /**
     * Keadaan tautan untuk halaman Backup. Daftar berkas Drive diambil di sini
     * juga — gagal membaca Drive (tanpa internet, token dicabut) tidak boleh
     * membuat halaman Backup ikut mati, jadi galatnya dibawa sebagai teks.
     */
    public function ringkasan(): array
    {
        $p = $this->drive->pengaturan();

        $berkas = null;
        $galat = null;
        if ($p->tertaut()) {
            try {
                $berkas = $this->drive->daftar();
            } catch (\Throwable $e) {
                $galat = $e->getMessage();
            }
        }

        return [
            'kredensialLengkap' => $p->kredensialLengkap(),
            'tertaut' => $p->tertaut(),
            'clientId' => $p->client_id,
            'akunEmail' => $p->akun_email,
            'folderNama' => $p->folder_nama,
            'tautanPada' => $p->tautan_pada?->toDateTimeString(),
            'unggahOtomatis' => $p->unggah_otomatis,
            'simpanTerakhir' => $p->simpan_terakhir,
            'terakhirUnggah' => $p->terakhir_unggah?->toDateTimeString(),
            'terakhirHasil' => $p->terakhir_hasil,
            'redirectUri' => $this->drive->redirectUri(),
            'arsipTerkunci' => $this->cadangan->arsipTerkunci(),
            'berkas' => $berkas,
            'galat' => $galat,
        ];
    }

    public function simpanKredensial(Request $request)
    {
        $this->ensureSuperAdmin();

        $data = $request->validate([
            'client_id' => ['required', 'string', 'max:255'],
            'client_secret' => ['nullable', 'string', 'max:255'],
            'folder_nama' => ['required', 'string', 'max:100'],
            'unggah_otomatis' => ['required', 'boolean'],
            'simpan_terakhir' => ['required', 'integer', 'min:1', 'max:365'],
        ]);

        $p = $this->drive->pengaturan();
        $gantiClient = $p->client_id !== $data['client_id'];

        if (blank($data['client_secret']) && (blank($p->client_secret) || $gantiClient)) {
            return redirect()->back()->withErrors(['client_secret' => 'Client Secret wajib diisi.']);
        }

        $p->forceFill([
            'client_id' => $data['client_id'],
            'client_secret' => filled($data['client_secret']) ? $data['client_secret'] : $p->client_secret,
            'folder_nama' => $data['folder_nama'],
            'unggah_otomatis' => $data['unggah_otomatis'],
            'simpan_terakhir' => $data['simpan_terakhir'],
        ]);

        // Client ID lain = aplikasi OAuth lain; refresh token lama tidak sah lagi.
        if ($gantiClient) {
            $p->forceFill(['refresh_token' => null, 'akun_email' => null, 'folder_id' => null, 'tautan_pada' => null]);
        }
        $p->save();

        return redirect()->back()->with('success', 'Pengaturan Google Drive disimpan.'.($gantiClient && $p->tautan_pada === null ? ' Tautkan ulang akun Google Anda.' : ''));
    }

    public function tautkan(Request $request)
    {
        $this->ensureSuperAdmin();

        if (! $this->drive->pengaturan()->kredensialLengkap()) {
            return redirect()->route('backup.index')->with('error', 'Isi Client ID dan Client Secret dulu.');
        }

        $state = Str::random(40);
        $request->session()->put('drive_oauth_state', $state);

        return redirect()->away($this->drive->urlOtorisasi($state));
    }

    public function callback(Request $request)
    {
        $this->ensureSuperAdmin();

        $stateSesi = $request->session()->pull('drive_oauth_state');
        if (blank($stateSesi) || ! hash_equals($stateSesi, (string) $request->query('state'))) {
            return redirect()->route('backup.index')->with('error', 'Permintaan tautan tidak dikenali (state tidak cocok). Ulangi dari tombol Tautkan.');
        }

        if ($request->filled('error')) {
            return redirect()->route('backup.index')->with('error', 'Google menolak: '.$request->query('error'));
        }

        try {
            $p = $this->drive->selesaikanTautan((string) $request->query('code'));
        } catch (\Throwable $e) {
            Log::warning('Tautan Google Drive gagal', ['pesan' => $e->getMessage()]);

            return redirect()->route('backup.index')->with('error', $e->getMessage());
        }

        return redirect()->route('backup.index')->with('success', 'Google Drive tertaut ke '.($p->akun_email ?? 'akun Google').'. Folder "'.$p->folder_nama.'" siap.');
    }

    public function putus()
    {
        $this->ensureSuperAdmin();
        $this->drive->putuskan();

        return redirect()->back()->with('success', 'Tautan Google Drive diputus. Berkas yang sudah ada di Drive tidak dihapus.');
    }

    /** Buat cadangan sekarang dan kirim ke Drive. */
    public function unggah()
    {
        $this->ensureSuperAdmin();

        return $this->cadangan->denganKunci(function () {
            try {
                $hasil = $this->drive->cadangkanKeDrive($this->cadangan);
            } catch (\Throwable $e) {
                return redirect()->back()->with('error', 'Cadangan ke Drive gagal: '.$e->getMessage());
            }

            return redirect()->back()->with('success', 'Cadangan '.$hasil['nama'].' terkirim ke Google Drive.');
        });
    }

    /** Timpa database dengan cadangan yang ada di Drive. */
    public function pulihkan(Request $request, string $idBerkas)
    {
        $this->ensureSuperAdmin();

        $request->validate(['konfirmasi' => ['required', 'in:TIMPA']]);

        if (! preg_match('/^[A-Za-z0-9_-]{10,}$/', $idBerkas)) {
            abort(404);
        }

        $sementara = storage_path('app/private/drive-'.uniqid().'.zip');

        try {
            $this->drive->unduh($idBerkas, $sementara);
            $sql = $this->cadangan->sqlDariZip($sementara);
        } catch (\Throwable $e) {
            File::delete($sementara);

            return redirect()->back()->with('error', $e->getMessage());
        }
        File::delete($sementara);

        return $this->cadangan->denganKunci(function () use ($sql, $idBerkas) {
            $hasil = $this->cadangan->timpaDatabaseDariSql($sql, 'cadangan Google Drive '.$idBerkas);

            return redirect()->back()->with($hasil['sukses'] ? 'success' : 'error', $hasil['pesan']);
        });
    }

    public function hapus(string $idBerkas)
    {
        $this->ensureSuperAdmin();

        try {
            $this->drive->hapus($idBerkas);
        } catch (\Throwable $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }

        return redirect()->back()->with('success', 'Berkas dihapus dari Google Drive.');
    }
}
