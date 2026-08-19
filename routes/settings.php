<?php

use App\Http\Controllers\Settings\DuaFaktorController;
use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {
    Route::redirect('settings', 'settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('password.edit');
    Route::put('settings/password', [PasswordController::class, 'update'])->name('password.update');

    Route::get('settings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('appearance');

    // Autentikasi dua faktor. Ketiganya sengaja berada di dalam grup 'auth'
    // saja dan TIDAK di balik menu.permission: ini pengaturan akun sendiri,
    // bukan menu yang izinnya diatur admin. Kalau ditaruh di balik izin menu,
    // akun yang wajib memasang 2FA bisa saja tidak punya izin membukanya, dan
    // ia terkunci tanpa jalan keluar.
    Route::post('settings/dua-faktor/siapkan', [DuaFaktorController::class, 'siapkan'])->name('dua-faktor.siapkan');
    Route::post('settings/dua-faktor/nyalakan', [DuaFaktorController::class, 'nyalakan'])->name('dua-faktor.nyalakan');
    Route::delete('settings/dua-faktor', [DuaFaktorController::class, 'matikan'])->name('dua-faktor.matikan');
    Route::post('settings/dua-faktor/kode-pemulihan', [DuaFaktorController::class, 'kodePemulihanBaru'])->name('dua-faktor.kode-pemulihan');
});
