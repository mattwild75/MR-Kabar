<?php

namespace App\Services\Concerns;

use Illuminate\Support\Facades\DB;

/**
 * Menurunkan `opd_id` dari pemilik sebuah baris — temuan audit R-08.
 *
 * Tabel gabungan (tbl_krs_irs_pd, tbl_kro_iro_pd, tbl_krs_irs_pemda) dulu
 * hanya menyimpan nama OPD sebagai teks, disalin dari kolom yang diisi bebas.
 * Kunci asing tidak bisa dipasang ke nama, dan nama itu ejaannya
 * berbeda-beda antar pengisi.
 *
 * Yang bisa dipercaya adalah AKUN pemilik baris sumbernya: tiap baris KRS/IRS
 * punya `user_id`, dan tiap akun tertaut ke tepat satu OPD. Karena tabel
 * gabungan selalu dibangun ulang penuh dari baris sumber, `opd_id` yang
 * diturunkan lewat sini tidak pernah bisa yatim — ia diisi ulang dari
 * kebenaran setiap kali.
 *
 * Kolom teks nama OPD tetap ada untuk ditampilkan; `opd_id` yang dipakai untuk
 * menyaring dan menyambung.
 */
trait MemetakanPemilikKeOpd
{
    /** @var array<int, int|null>|null user_id => opd_id, dimuat sekali per sinkronisasi */
    private ?array $petaPemilikOpd = null;

    private function opdIdDariPemilik(int|string|null $userId): ?int
    {
        if ($userId === null || $userId === '') {
            return null;
        }

        if ($this->petaPemilikOpd === null) {
            $this->petaPemilikOpd = DB::table('users')
                ->pluck('opd_id', 'id')
                ->map(fn ($v) => $v === null ? null : (int) $v)
                ->all();
        }

        return $this->petaPemilikOpd[(int) $userId] ?? null;
    }

    /** @var array<string, int>|null nama (huruf kecil, dirapikan) => opd_id */
    private ?array $petaNamaOpd = null;

    /**
     * Cadangan TERAKHIR: mencocokkan nama OPD ke daftar resmi.
     *
     * Dipakai hanya ketika pemilik barisnya tidak punya OPD — yakni baris yang
     * diisi Super Admin atas nama OPD lain, yang OPD-nya memang hanya ada di
     * teks. Pencocokannya persis (setelah dirapikan dan disamakan
     * kapitalnya), bukan "mirip": nama yang meleset satu huruf lebih baik
     * tidak tertaut daripada tertaut ke OPD yang salah. `rujukan:periksa`
     * tiap Senin yang memastikan nama-nama itu tetap bersih.
     */
    private function opdIdDariNama(?string $nama): ?int
    {
        $kunci = mb_strtolower(trim(preg_replace('/\s+/u', ' ', (string) $nama) ?? ''));

        if ($kunci === '') {
            return null;
        }

        if ($this->petaNamaOpd === null) {
            $this->petaNamaOpd = DB::table('opd')->pluck('id', 'nama')
                ->mapWithKeys(fn ($id, $n) => [mb_strtolower(trim(preg_replace('/\s+/u', ' ', $n) ?? '')) => (int) $id])
                ->all();
        }

        return $this->petaNamaOpd[$kunci] ?? null;
    }
}
