<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Autentikasi dua faktor untuk pemegang akses tertinggi.
 *
 * Sampai sekarang satu-satunya penghalang masuk adalah sandi. Akun
 * `memet` memegang seluruh data kabupaten dan cuma satu-satunya, sementara
 * surelnya sempat terbuka di halaman publik (temuan T-01 audit). Sandi yang
 * bocor berarti seluruh data ikut.
 *
 * TIGA kolom, dan ketiganya perlu:
 *
 *  - two_factor_secret        kunci rahasia TOTP, dienkripsi
 *  - two_factor_confirmed_at  penanda pemasangan SUDAH dibuktikan dengan satu
 *                             kode yang benar. Tanpa kolom ini, akun yang
 *                             memindai QR lalu menutup halaman akan terkunci:
 *                             server menganggap 2FA aktif, pengguna belum
 *                             pernah menyimpannya di ponsel.
 *  - two_factor_recovery_codes  kode pemulihan sekali pakai, dienkripsi.
 *                             INI YANG PALING MUDAH DIABAIKAN dan paling
 *                             penting: kalau ponsel Super Admin hilang, tidak
 *                             ada admin di atasnya yang bisa membukakan.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->text('two_factor_secret')->nullable()->after('password');
            $table->text('two_factor_recovery_codes')->nullable()->after('two_factor_secret');
            $table->timestamp('two_factor_confirmed_at')->nullable()->after('two_factor_recovery_codes');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['two_factor_secret', 'two_factor_recovery_codes', 'two_factor_confirmed_at']);
        });
    }
};
