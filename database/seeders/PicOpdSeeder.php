<?php

namespace Database\Seeders;

use App\Models\Opd;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;

/**
 * Membuat SATU akun PIC per OPD — role 'user' (row-level ownership via
 * user_id, pola yang sama dgn KrsPd/IrsPd/KroPd/IroPd/CEE dkk). Username:
 * PIC_<NamaOpdDisingkat>, password acak (ditampilkan sekali di konsol saat
 * seeding) — SEBELUMNYA seragam '1234' utk semua ~40+ akun PIC, yang berarti
 * siapa pun yang tahu satu username PIC bisa login ke SEMUA akun PIC OPD
 * lain (kredensial lemah + dipakai berulang = celah keamanan nyata, bukan
 * cuma teoretis, karena sudah pernah benar-benar dijalankan). Akun PIC yang
 * SUDAH ADA di database dgn password lama '1234' TIDAK otomatis diganti di
 * sini (seeder ini idempotent, tidak menyentuh akun yg sudah ada) — kalau
 * ada akun lama yang masih memakai '1234', reset manual lewat menu User
 * Management atau minta developer jalankan reset massal terpisah.
 *
 * BEBERAPA OPD SUDAH PUNYA akun PIC lama (dibuat manual sebelumnya, role
 * 'admin-instansi' — cuma label penamaan, hak aksesnya SAMA dgn role 'user',
 * lihat MenuSeeder) dan SUDAH ADA DATA RISIKO NYATA menempel (mis.
 * PIC_DinasKesehatan, PIC_DinasSosial, PIC_Inspektorat, PIC_RSUDCutNyakDhien).
 * OPD-OPD itu di-SKIP total lewat daftar eksplisit di bawah — bukan heuristik
 * kata kunci (pernah salah & bikin akun duplikat _2, lihat riwayat perbaikan).
 *
 * Idempotent: SATU-SATUNYA sumber kebenaran "sudah dibuat" adalah exact
 * username hasil buildUsername() (TANPA suffix _N) — jika sudah ada,
 * dilewati. Ini deterministik, tidak fuzzy, aman dijalankan berkali-kali.
 */
class PicOpdSeeder extends Seeder
{
    /**
     * OPD (nama PERSIS sesuai tabel `opd`) yang SUDAH punya akun PIC lama —
     * jangan buatkan akun baru untuk OPD ini sama sekali. Username akun lama
     * dipetakan manual di sini supaya opd_id-nya tetap bisa di-backfill.
     */
    private const SUDAH_PUNYA_AKUN = [
        'DINAS KESEHATAN' => 'PIC_DinasKesehatan',
        'DINAS SOSIAL' => 'PIC_DinasSosial',
        'INSPEKTORAT' => 'PIC_Inspektorat',
        'BLUD RSUD CUT NYAK DHIEN' => 'PIC_RSUDCutNyakDhien',
    ];

    public function run(): void
    {
        $role = Role::firstOrCreate(['name' => 'user']);
        $dibuat = 0;
        $dilewati = 0;
        $createdCredentials = [];

        foreach (Opd::orderBy('nama')->get() as $opd) {
            if (array_key_exists($opd->nama, self::SUDAH_PUNYA_AKUN)) {
                // Backfill opd_id akun lama (dibuat sebelum kolom ini ada).
                User::where('username', self::SUDAH_PUNYA_AKUN[$opd->nama])
                    ->whereNull('opd_id')
                    ->update(['opd_id' => $opd->id]);
                $dilewati++;
                continue;
            }

            $username = $this->buildUsername($opd->nama);
            $existing = User::where('username', $username)->first();

            // Idempotent: kalau username dasar ini SUDAH ada (dari run
            // sebelumnya), jangan buat lagi — tapi tetap backfill opd_id
            // bila kosong (mis. dibuat sebelum kolom ini ada).
            if ($existing) {
                if ($existing->opd_id === null) {
                    $existing->update(['opd_id' => $opd->id]);
                }
                $dilewati++;
                continue;
            }

            // Password ACAK per akun (bukan lagi '1234' seragam) — User
            // model men-cast 'password' => 'hashed', jadi nilai polos cukup
            // (auto di-hash saat disimpan), TIDAK perlu Hash::make().
            $tempPassword = Str::password(12);

            $user = User::create([
                'username' => $username,
                'name' => 'PIC ' . $opd->nama,
                'email' => Str::slug($username, '.') . '@mrkabar.local',
                'password' => $tempPassword,
                'opd_id' => $opd->id,
            ]);
            $user->assignRole($role);
            $createdCredentials[] = "{$username}: {$tempPassword}";
            $dibuat++;
        }

        if (!empty($createdCredentials)) {
            $this->command?->warn('Password sementara akun PIC baru (catat sekarang, tidak ditampilkan lagi):');
            foreach ($createdCredentials as $line) {
                $this->command?->warn("  {$line}");
            }
        }

        $this->command?->info("Akun PIC: {$dibuat} dibuat baru, {$dilewati} dilewati (sudah ada).");
    }

    /**
     * PIC_<NamaOpd> — nama OPD dibersihkan jadi format username yang ringkas
     * & valid (huruf, angka, underscore). TIDAK menangani tabrakan/suffix di
     * sini — deteksi "sudah ada" dilakukan oleh pemanggil sebelum create().
     */
    private function buildUsername(string $namaOpd): string
    {
        $clean = preg_replace('/\s+/', '_', trim($namaOpd));
        $clean = preg_replace('/[^A-Za-z0-9_]/', '', $clean);
        $username = 'PIC_' . $clean;

        // Batasi panjang supaya tidak berlebihan (nama OPD ada yg sangat
        // panjang, mis. "DINAS PEMBERDAYAAN PEREMPUAN PERLINDUNGAN ANAK DAN
        // KELUARGA BERENCANA") — potong tanpa memutus di tengah underscore.
        if (mb_strlen($username) > 60) {
            $username = mb_substr($username, 0, 60);
            $username = preg_replace('/_[^_]*$/', '', $username);
        }

        return $username;
    }
}
