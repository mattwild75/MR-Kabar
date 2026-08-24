<?php

use App\Http\Controllers\Pkpt\CetakPkptController;
use App\Http\Controllers\Pkpt\PkptEvaluasiRisikoController;
use App\Http\Controllers\Pkpt\PkptFaktorRisikoController;
use App\Http\Controllers\Pkpt\PkptKematanganController;
use App\Http\Controllers\Pkpt\PkptPengaturanController;
use App\Http\Controllers\Pkpt\PkptPenilaianController;
use App\Http\Controllers\Pkpt\PkptPenugasanWajibController;
use App\Http\Controllers\Pkpt\PkptPeriodeController;
use App\Http\Controllers\Pkpt\PkptPetaAuditanController;
use App\Http\Controllers\Pkpt\PkptRencanaController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| PKPT Berbasis Risiko
|--------------------------------------------------------------------------
|
| Berkas rute TERPISAH, dipanggil satu baris dari web.php. Modul PKPT
| dirancang tidak mengubah berkas MR Kabar mana pun; ini salah satu tempat
| janji itu ditepati, dan sekaligus membuat seluruh rutenya terbaca dalam
| satu layar.
|
| SELURUHNYA berada di bawah satu awalan /pkpt, termasuk Form Cetak.
| Konsekuensinya menyenangkan: CheckMenuPermission mencocokkan menus.route
| sebagai PREFIX path, jadi menu "/pkpt" berizin pkpt-view otomatis memagari
| setiap rute /pkpt/* yang tidak punya menunya sendiri — termasuk rute POST
| seperti /pkpt/hitung yang memang tidak muncul di sidebar.
|
| Izin MENULIS (pkpt-input, pkpt-hitung, pkpt-rencana, pkpt-tetapkan,
| pkpt-pengaturan) ditegakkan di controller lewat MenjagaPeriodePkpt, bukan
| lewat permission menu — mengikuti pola yang sudah berlaku di aplikasi ini,
| dan supaya membuka halaman tidak menuntut izin mengubahnya.
*/

Route::middleware(['auth', 'menu.permission'])->group(function () {
    // Ikhtisar dan periode
    Route::get('pkpt', [PkptPeriodeController::class, 'index'])->name('pkpt.index');
    Route::post('pkpt/periode', [PkptPeriodeController::class, 'store'])->name('pkpt.periode.store');
    Route::put('pkpt/periode/{periode}', [PkptPeriodeController::class, 'update'])->name('pkpt.periode.update');
    Route::post('pkpt/periode/{periode}/tetapkan', [PkptPeriodeController::class, 'tetapkan'])->name('pkpt.periode.tetapkan');
    Route::post('pkpt/periode/{periode}/buka', [PkptPeriodeController::class, 'bukaKembali'])->name('pkpt.periode.buka');

    // Formulir 1 — Peta Auditan
    Route::get('pkpt/peta-auditan', [PkptPetaAuditanController::class, 'index'])->name('pkpt.peta-auditan.index');
    Route::post('pkpt/peta-auditan', [PkptPetaAuditanController::class, 'store'])->name('pkpt.peta-auditan.store');
    Route::post('pkpt/peta-auditan/tarik', [PkptPetaAuditanController::class, 'tarik'])->name('pkpt.peta-auditan.tarik');
    Route::put('pkpt/peta-auditan/{area}', [PkptPetaAuditanController::class, 'update'])->name('pkpt.peta-auditan.update');
    Route::delete('pkpt/peta-auditan/{area}', [PkptPetaAuditanController::class, 'destroy'])->name('pkpt.peta-auditan.destroy');

    // Formulir 2 — Evaluasi Register Risiko
    Route::get('pkpt/evaluasi-register', [PkptEvaluasiRisikoController::class, 'index'])->name('pkpt.evaluasi-register.index');
    Route::post('pkpt/evaluasi-register/terima', [PkptEvaluasiRisikoController::class, 'terimaSemua'])->name('pkpt.evaluasi-register.terima');
    Route::put('pkpt/evaluasi-register/{tipe}/{id}', [PkptEvaluasiRisikoController::class, 'update'])->name('pkpt.evaluasi-register.update');

    // Formulir 3 — Kematangan MR dan pembobotan
    Route::get('pkpt/kematangan-mr', [PkptKematanganController::class, 'index'])->name('pkpt.kematangan-mr.index');
    Route::post('pkpt/kematangan-mr/adopsi-spip', [PkptKematanganController::class, 'adopsiSpip'])->name('pkpt.kematangan-mr.adopsi');
    Route::put('pkpt/kematangan-mr/{opd}', [PkptKematanganController::class, 'update'])->name('pkpt.kematangan-mr.update');

    // Formulir 4 sampai 8 — Faktor Risiko
    Route::get('pkpt/faktor-risiko', [PkptFaktorRisikoController::class, 'index'])->name('pkpt.faktor-risiko.index');
    Route::post('pkpt/faktor-risiko/tarik-pagu', [PkptFaktorRisikoController::class, 'tarikPagu'])->name('pkpt.faktor-risiko.tarik-pagu');
    Route::put('pkpt/faktor-risiko/{area}', [PkptFaktorRisikoController::class, 'update'])->name('pkpt.faktor-risiko.update');

    // Formulir 11 dan 12 — Penugasan wajib dan pengecualian
    Route::get('pkpt/penugasan-wajib', [PkptPenugasanWajibController::class, 'index'])->name('pkpt.penugasan-wajib.index');
    Route::post('pkpt/penugasan-wajib', [PkptPenugasanWajibController::class, 'store'])->name('pkpt.penugasan-wajib.store');
    Route::put('pkpt/penugasan-wajib/{penugasan}', [PkptPenugasanWajibController::class, 'update'])->name('pkpt.penugasan-wajib.update');
    Route::delete('pkpt/penugasan-wajib/{penugasan}', [PkptPenugasanWajibController::class, 'destroy'])->name('pkpt.penugasan-wajib.destroy');

    // Formulir 9 dan 10 — perhitungan dan pemeringkatan
    Route::post('pkpt/hitung', [PkptPenilaianController::class, 'hitung'])->name('pkpt.hitung');
    Route::get('pkpt/total-nilai', [PkptPenilaianController::class, 'totalNilai'])->name('pkpt.total-nilai');
    Route::get('pkpt/peringkat', [PkptPenilaianController::class, 'peringkat'])->name('pkpt.peringkat');
    Route::put('pkpt/peringkat/{penilaian}/tahun', [PkptPenilaianController::class, 'simpanRencanaTahun'])->name('pkpt.peringkat.tahun');

    // Formulir 13 dan 14 — Jakwas dan PKPT
    Route::get('pkpt/jakwas', [PkptRencanaController::class, 'jakwas'])->name('pkpt.jakwas');
    Route::get('pkpt/program-kerja', [PkptRencanaController::class, 'programKerja'])->name('pkpt.program-kerja');
    Route::post('pkpt/rencana', [PkptRencanaController::class, 'store'])->name('pkpt.rencana.store');
    Route::post('pkpt/rencana/tarik-peringkat', [PkptRencanaController::class, 'tarikDariPeringkat'])->name('pkpt.rencana.tarik');
    Route::put('pkpt/rencana/{rencana}', [PkptRencanaController::class, 'update'])->name('pkpt.rencana.update');
    Route::delete('pkpt/rencana/{rencana}', [PkptRencanaController::class, 'destroy'])->name('pkpt.rencana.destroy');

    // Pengaturan PPBR — menunya sendiri berizin pkpt-pengaturan
    Route::get('pkpt/pengaturan', [PkptPengaturanController::class, 'index'])->name('pkpt.pengaturan.index');
    Route::post('pkpt/pengaturan/bobot-faktor', [PkptPengaturanController::class, 'simpanBobotFaktor'])->name('pkpt.pengaturan.bobot-faktor');
    Route::post('pkpt/pengaturan/bobot-kematangan', [PkptPengaturanController::class, 'simpanBobotKematangan'])->name('pkpt.pengaturan.bobot-kematangan');
    Route::post('pkpt/pengaturan/sektor-unggulan', [PkptPengaturanController::class, 'tambahSektorUnggulan'])->name('pkpt.pengaturan.sektor.store');
    Route::delete('pkpt/pengaturan/sektor-unggulan/{sektor}', [PkptPengaturanController::class, 'hapusSektorUnggulan'])->name('pkpt.pengaturan.sektor.destroy');

    // Form Cetak — satu rute untuk empat belas formulir. Susunan kolomnya
    // data, bukan empat belas berkas React yang isinya nyaris sama.
    Route::get('pkpt/cetak/{formulir}', [CetakPkptController::class, 'cetak'])
        ->where('formulir', 'f([1-9]|1[0-4])')->name('pkpt.cetak');
    Route::get('pkpt/cetak/{formulir}/pdf', [CetakPkptController::class, 'pdf'])
        ->where('formulir', 'f([1-9]|1[0-4])')->name('pkpt.cetak.pdf');
});
