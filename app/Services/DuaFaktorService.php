<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Str;
use PragmaRX\Google2FA\Google2FA;

/**
 * Autentikasi dua faktor berbasis TOTP — kode enam angka yang berubah tiap
 * 30 detik.
 *
 * Kenapa TOTP dan bukan SMS: tidak ada yang dikirim ke ponsel. Tak ada pulsa,
 * tak ada jaringan, tak ada nomor yang bisa dibajak lewat penggantian kartu.
 * Ponsel dalam mode pesawat pun tetap menghasilkan kode yang benar, karena
 * satu-satunya bahan yang dibutuhkan adalah kunci rahasia dan jam.
 *
 * KUNCI DAN KODE PEMULIHAN DIENKRIPSI di basis data. Kalau dumpnya bocor,
 * yang terbaca cuma teks acak — dan tanpa APP_KEY ia tidak berarti apa-apa.
 * Ini bukan kehati-hatian berlebihan: snapshot database disalin ke OneDrive
 * tiap hari, jadi ia berpindah ke tempat yang tidak sepenuhnya kita kuasai.
 */
class DuaFaktorService
{
    /**
     * Berapa banyak kode pemulihan dibuat.
     *
     * Sepuluh, bukan lebih sedikit. Kode ini dicetak lalu disimpan berbulan-
     * bulan; sebagian akan hilang, sebagian terpakai tanpa dicatat. Terlalu
     * sedikit berarti pemiliknya kehabisan justru saat paling butuh.
     */
    private const JUMLAH_KODE_PEMULIHAN = 10;

    /**
     * Toleransi pergeseran jam, dihitung dalam satuan 30 detik.
     *
     * 1 berarti kode dari satu periode sebelum dan sesudah ikut diterima —
     * total jendela 90 detik. Jam ponsel yang meleset setengah menit itu
     * lumrah, dan menolaknya hanya akan membuat orang mengira 2FA-nya rusak.
     * Lebih besar dari ini mulai memperlebar peluang tebakan tanpa alasan.
     */
    private const TOLERANSI_JENDELA = 1;

    public function __construct(private Google2FA $google2fa) {}

    /** Kunci rahasia baru, belum disimpan ke mana pun. */
    public function buatKunci(): string
    {
        return $this->google2fa->generateSecretKey();
    }

    /**
     * Alamat otpauth:// untuk dijadikan kode QR.
     *
     * Nama penerbit dipakai aplikasi pengotentikasi sebagai judul entri di
     * ponsel. Dibuat jelas supaya pemiliknya tahu kode mana milik aplikasi
     * ini kalau ia memegang beberapa akun.
     */
    public function urlOtp(User $user, string $kunci): string
    {
        return $this->google2fa->getQRCodeUrl(
            config('app.name', 'MR Kabar'),
            $user->username ?: $user->email,
            $kunci,
        );
    }

    public function kodeBenar(string $kunci, string $kode): bool
    {
        // Spasi kerap ikut tersalin dari aplikasi pengotentikasi yang
        // menampilkan kodenya berkelompok tiga angka.
        $kode = preg_replace('/\s+/', '', $kode);

        return $this->google2fa->verifyKey($kunci, $kode, self::TOLERANSI_JENDELA);
    }

    /** Sepuluh kode pemulihan sekali pakai, belum disimpan. */
    public function buatKodePemulihan(): array
    {
        return collect(range(1, self::JUMLAH_KODE_PEMULIHAN))
            ->map(fn () => Str::upper(Str::random(5).'-'.Str::random(5)))
            ->all();
    }

    /**
     * Menyalakan 2FA sesudah pemiliknya membuktikan pemasangannya berhasil.
     *
     * Kode pemulihan dikembalikan dari sini dan HANYA di sini — sesudah
     * tersimpan ia dienkripsi, dan tidak ada jalan menampilkannya lagi selain
     * membuat yang baru. Itu disengaja: kode yang bisa dilihat ulang kapan
     * saja lewat layar tidak lebih aman daripada sandi.
     *
     * @return array<int, string> kode pemulihan, untuk ditampilkan sekali
     */
    public function nyalakan(User $user, string $kunci): array
    {
        $kodePemulihan = $this->buatKodePemulihan();

        $user->forceFill([
            'two_factor_secret' => Crypt::encryptString($kunci),
            'two_factor_recovery_codes' => Crypt::encryptString(json_encode($kodePemulihan)),
            'two_factor_confirmed_at' => now(),
        ])->save();

        return $kodePemulihan;
    }

    public function matikan(User $user): void
    {
        $user->forceFill([
            'two_factor_secret' => null,
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at' => null,
        ])->save();
    }

    public function kunciTersimpan(User $user): ?string
    {
        return $user->two_factor_secret
            ? Crypt::decryptString($user->two_factor_secret)
            : null;
    }

    /** @return array<int, string> */
    public function kodePemulihanTersimpan(User $user): array
    {
        if (! $user->two_factor_recovery_codes) {
            return [];
        }

        return json_decode(Crypt::decryptString($user->two_factor_recovery_codes), true) ?: [];
    }

    /**
     * Memakai satu kode pemulihan, lalu MENGHANGUSKANNYA.
     *
     * Penghangusannya bukan tambahan yang manis — itu yang membedakan kode
     * pemulihan dari sandi kedua. Kode yang tetap sah sesudah dipakai berarti
     * secarik kertas yang terlihat orang lain memberi akses selamanya.
     */
    public function pakaiKodePemulihan(User $user, string $kode): bool
    {
        $kode = Str::upper(trim($kode));
        $tersimpan = $this->kodePemulihanTersimpan($user);

        $indeks = array_search($kode, $tersimpan, true);
        if ($indeks === false) {
            return false;
        }

        unset($tersimpan[$indeks]);
        $user->forceFill([
            'two_factor_recovery_codes' => Crypt::encryptString(json_encode(array_values($tersimpan))),
        ])->save();

        return true;
    }

    /** Sudah menyala DAN sudah dibuktikan dengan satu kode yang benar. */
    public function aktif(User $user): bool
    {
        return $user->two_factor_secret !== null && $user->two_factor_confirmed_at !== null;
    }

    /**
     * Peran yang WAJIB memakai 2FA.
     *
     * Dibaca dari config, bukan ditulis di sini, supaya penambahan peran
     * berhak-tinggi kelak tidak perlu menyunting kode.
     */
    public function wajibBagi(User $user): bool
    {
        return $user->hasAnyRole(config('mrkabar.dua_faktor.peran_wajib', []));
    }
}
