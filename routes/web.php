<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\BackupController;
use App\Http\Controllers\RiskExcelController;
use App\Http\Controllers\KrsPicExcelController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\UserFileController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\SettingAppController;
use App\Http\Controllers\KeteranganPendukungController;
use App\Http\Controllers\MediaFolderController;
use App\Http\Controllers\KaeresController;
use App\Http\Controllers\KrsPemdaController;
use App\Http\Controllers\IrsPemdaController;
use App\Http\Controllers\KaeresPdController;
use App\Http\Controllers\KrsPdController;
use App\Http\Controllers\IrsPdController;
use App\Http\Controllers\KaeresRoController;
use App\Http\Controllers\KroPdController;
use App\Http\Controllers\IroPdController;
use App\Http\Controllers\RiskEvidenceController;
use App\Http\Controllers\SessionStatusController;
use App\Http\Controllers\TroubleshootReportController;
use App\Http\Controllers\TrashController;
use App\Http\Controllers\DataUmumController;
use App\Http\Controllers\CeeFormController;
use App\Http\Controllers\CeePertanyaanController;
use App\Http\Controllers\CetakCeeController;
use App\Http\Controllers\NotificationController;

Route::get('/', function () {
    if (Auth::check()) {
        return redirect()->route('dashboard');
    }

    return redirect()->route('login');
})->name('home');

Route::middleware(['auth', 'menu.permission'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Halaman panduan/dokumentasi statis (5W1H manajemen risiko Pemda +
    // cara pakai MR Kabar) — tidak ada data dinamis dari DB, cukup render
    // komponen React langsung. Fail-open (permission_name null di menu)
    // krn ditujukan utk SEMUA pengguna termasuk akun CEE_Survey.
    Route::get('panduan', function () {
        return Inertia::render('panduan/Index');
    })->name('panduan');

    // Dipoll oleh SessionTimeoutWarning (frontend) untuk auto-logout 8 jam
    // sejak login — lihat ForceLogoutAfterMaxDuration middleware.
    Route::get('session-status', [SessionStatusController::class, 'show'])->name('session.status');
    Route::post('session-extend', [SessionStatusController::class, 'extend'])->name('session.extend');

    // ->except(['show']) — controller resource ini tidak punya method show(),
    // jadi rute {resource}/{id} tidak didaftarkan agar tidak menghasilkan
    // route mati yang melempar error saat diakses.
    Route::resource('roles', RoleController::class)->except(['show']);
    Route::resource('menus', MenuController::class)->except(['show']);
    Route::post('menus/reorder', [MenuController::class, 'reorder'])->name('menus.reorder');
    Route::resource('permissions', PermissionController::class)->except(['show']);
    Route::resource('users', UserController::class)->except(['show']);
    Route::put('/users/{user}/reset-password', [UserController::class, 'resetPassword'])->name('users.reset-password');
    Route::get('/settingsapp', [SettingAppController::class, 'edit'])->name('setting.edit');
    Route::post('/settingsapp', [SettingAppController::class, 'update'])->name('setting.update');

    // Settings > Keterangan Pendukung — CRUD 7 kategori data referensi
    // risiko (Kriteria Dampak/Kemungkinan, Matriks, Level Risiko, Jenis
    // Risiko, Entitas Penilai, OPD) yang dulu hardcoded di kode.
    Route::get('/keterangan-pendukung', [KeteranganPendukungController::class, 'index'])->name('keterangan-pendukung.index');
    Route::put('/keterangan-pendukung/kriteria-dampak/{criteria}', [KeteranganPendukungController::class, 'updateImpactCriteria'])->name('keterangan-pendukung.kriteria-dampak.update');
    Route::put('/keterangan-pendukung/kriteria-kemungkinan/{criteria}', [KeteranganPendukungController::class, 'updateLikelihoodCriteria'])->name('keterangan-pendukung.kriteria-kemungkinan.update');
    Route::put('/keterangan-pendukung/matriks/{cell}', [KeteranganPendukungController::class, 'updateMatrixCell'])->name('keterangan-pendukung.matriks.update');
    Route::put('/keterangan-pendukung/level-risiko/{level}', [KeteranganPendukungController::class, 'updateRiskLevel'])->name('keterangan-pendukung.level-risiko.update');
    Route::post('/keterangan-pendukung/jenis-risiko', [KeteranganPendukungController::class, 'storeJenisRisiko'])->name('keterangan-pendukung.jenis-risiko.store');
    Route::put('/keterangan-pendukung/jenis-risiko/{jenis}', [KeteranganPendukungController::class, 'updateJenisRisiko'])->name('keterangan-pendukung.jenis-risiko.update');
    Route::delete('/keterangan-pendukung/jenis-risiko/{jenis}', [KeteranganPendukungController::class, 'destroyJenisRisiko'])->name('keterangan-pendukung.jenis-risiko.destroy');
    Route::post('/keterangan-pendukung/entitas-penilai', [KeteranganPendukungController::class, 'storeEntitasPenilai'])->name('keterangan-pendukung.entitas-penilai.store');
    Route::put('/keterangan-pendukung/entitas-penilai/{entitas}', [KeteranganPendukungController::class, 'updateEntitasPenilai'])->name('keterangan-pendukung.entitas-penilai.update');
    Route::delete('/keterangan-pendukung/entitas-penilai/{entitas}', [KeteranganPendukungController::class, 'destroyEntitasPenilai'])->name('keterangan-pendukung.entitas-penilai.destroy');
    Route::post('/keterangan-pendukung/opd', [KeteranganPendukungController::class, 'storeOpd'])->name('keterangan-pendukung.opd.store');
    Route::put('/keterangan-pendukung/opd/{opd}', [KeteranganPendukungController::class, 'updateOpd'])->name('keterangan-pendukung.opd.update');
    Route::delete('/keterangan-pendukung/opd/{opd}', [KeteranganPendukungController::class, 'destroyOpd'])->name('keterangan-pendukung.opd.destroy');

    Route::get('/audit-logs', [AuditLogController::class, 'index'])->name('audit-logs.index');

    // Data Terhapus (soft delete) — daftar + pulihkan + hapus permanen.
    Route::get('/trash', [TrashController::class, 'index'])->name('trash.index');
    Route::put('/trash/{type}/{id}/restore', [TrashController::class, 'restore'])->name('trash.restore');
    // Pulihkan sekelompok (semua baris satu operasi hapus-node).
    Route::put('/trash/{type}/batch/{batch}/restore', [TrashController::class, 'restoreBatch'])->name('trash.restore-batch');
    Route::delete('/trash/{type}/{id}', [TrashController::class, 'forceDelete'])->name('trash.force-delete');

    // Troubleshoot. Halaman rekapan (/troubleshoot) punya menu ber-permission
    // 'troubleshoot-view' → dicek CheckMenuPermission (admin/super-admin).
    // Form kirim laporan dipisah ke path lain (/troubleshoot-report) yang TIDAK
    // match prefix menu /troubleshoot — sebab CheckMenuPermission mencocokkan
    // per-PATH tanpa peduli method, jadi kalau store memakai POST /troubleshoot
    // ia akan ikut terkena cek 'troubleshoot-view' dan memblokir user biasa
    // yang seharusnya boleh melapor. update-status & destroy sengaja tetap di
    // bawah /troubleshoot (memang khusus admin) + dikunci lagi di controller.
    Route::get('/troubleshoot', [TroubleshootReportController::class, 'index'])->name('troubleshoot.index');
    Route::post('/troubleshoot-report', [TroubleshootReportController::class, 'store'])->name('troubleshoot.store');
    Route::put('/troubleshoot/{troubleshoot}/status', [TroubleshootReportController::class, 'updateStatus'])->name('troubleshoot.update-status');
    Route::delete('/troubleshoot/{troubleshoot}', [TroubleshootReportController::class, 'destroy'])->name('troubleshoot.destroy');
    Route::get('/backup', [BackupController::class, 'index'])->name('backup.index');
    Route::post('/backup/run', [BackupController::class, 'run'])->name('backup.run');
    Route::get('/backup/download/{file}', [BackupController::class, 'download'])->name('backup.download');
    Route::delete('/backup/delete/{file}', [BackupController::class, 'delete'])->name('backup.delete');
    Route::post('/backup/git-push', [BackupController::class, 'gitPush'])->name('backup.git-push');
    Route::get('/backup/excel', [RiskExcelController::class, 'index'])->name('backup.excel.index');
    Route::get('/backup/excel/export', [RiskExcelController::class, 'export'])->name('backup.excel.export');
    Route::get('/backup/excel/template', [RiskExcelController::class, 'template'])->name('backup.excel.template');
    Route::post('/backup/excel/import', [RiskExcelController::class, 'import'])->name('backup.excel.import');
    Route::post('/backup/excel/import-requests/{importRequest}/approve', [RiskExcelController::class, 'approve'])->name('backup.excel.import-requests.approve');
    Route::post('/backup/excel/import-requests/{importRequest}/reject', [RiskExcelController::class, 'reject'])->name('backup.excel.import-requests.reject');

    // Ekspor/Impor KRS Pemda + KRS PD + KRO PD (PIC OPD) — lihat
    // KrsPicExcelController utk pembeda lengkap dgn /backup/excel di atas.
    Route::get('/krs-excel', [KrsPicExcelController::class, 'index'])->name('krs-excel.index');
    Route::get('/krs-excel/export', [KrsPicExcelController::class, 'export'])->name('krs-excel.export');
    Route::get('/krs-excel/template', [KrsPicExcelController::class, 'template'])->name('krs-excel.template');
    Route::post('/krs-excel/import', [KrsPicExcelController::class, 'import'])->name('krs-excel.import');
    Route::post('/krs-excel/import-requests/{importRequest}/approve', [KrsPicExcelController::class, 'approve'])->name('krs-excel.import-requests.approve');
    Route::post('/krs-excel/import-requests/{importRequest}/reject', [KrsPicExcelController::class, 'reject'])->name('krs-excel.import-requests.reject');

    // Notifikasi in-app (lonceng kanan atas) — dipakai seluruh user, lihat
    // NotificationController.
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markRead'])->name('notifications.read');
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllRead'])->name('notifications.read-all');
    Route::get('/files', [UserFileController::class, 'index'])->name('files.index');
    Route::post('/files', [UserFileController::class, 'store'])->name('files.store');
    Route::delete('/files/{id}', [UserFileController::class, 'destroy'])->name('files.destroy');
    // MediaFolderController hanya mengimplementasikan index/store/destroy.
    Route::resource('media', MediaFolderController::class)->only(['index', 'store', 'destroy']);
    // Data Umum per-PIC (header identitas + penanda tangan) untuk Form Cetak.
    Route::get('data-umum', [DataUmumController::class, 'index'])->name('data-umum.index');
    Route::post('data-umum', [DataUmumController::class, 'store'])->name('data-umum.store');

    // CEE (Control Environment Evaluation) — Lampiran 5 Form 1a/1b/1c Perdep
    // PPKD No.4/2019. Form Input dipakai akun bersama CEE_Survey (role
    // 'cee-survey', dibatasi RestrictCeeSurveyRole) atau admin/super-admin.
    Route::get('cee/1a', [CeeFormController::class, 'form1a'])->name('cee.form1a');
    Route::post('cee/1a', [CeeFormController::class, 'store1a'])->name('cee.form1a.store');
    Route::get('cee/1a/responden', [CeeFormController::class, 'jawabanResponden1a'])->name('cee.form1a.responden');
    Route::delete('cee/1a', [CeeFormController::class, 'destroy1a'])->name('cee.form1a.destroy');
    Route::get('cee/1b', [CeeFormController::class, 'form1b'])->name('cee.form1b');
    Route::post('cee/1b', [CeeFormController::class, 'store1b'])->name('cee.form1b.store');
    Route::put('cee/1b/{kelemahan}', [CeeFormController::class, 'update1b'])->name('cee.form1b.update');
    Route::delete('cee/1b/{kelemahan}', [CeeFormController::class, 'destroy1b'])->name('cee.form1b.destroy');
    Route::get('cee/1c', [CeeFormController::class, 'form1c'])->name('cee.form1c');
    Route::post('cee/1c', [CeeFormController::class, 'store1c'])->name('cee.form1c.store');
    Route::delete('cee/1c/{simpulan}', [CeeFormController::class, 'destroy1c'])->name('cee.form1c.destroy');

    // Kelola redaksi pertanyaan kuesioner CEE — admin/super-admin saja.
    Route::get('cee/pertanyaan', [CeePertanyaanController::class, 'index'])->name('cee.pertanyaan.index');
    Route::post('cee/pertanyaan', [CeePertanyaanController::class, 'store'])->name('cee.pertanyaan.store');
    Route::put('cee/pertanyaan/{pertanyaan}', [CeePertanyaanController::class, 'update'])->name('cee.pertanyaan.update');
    Route::delete('cee/pertanyaan/{pertanyaan}', [CeePertanyaanController::class, 'destroy'])->name('cee.pertanyaan.destroy');

    // Form Cetak CEE 1a/1b/1c (A4, read-only).
    Route::get('cetak/cee/1a', [CetakCeeController::class, 'cetak1a'])->name('cetak.cee.1a');
    Route::get('cetak/cee/1b', [CetakCeeController::class, 'cetak1b'])->name('cetak.cee.1b');
    Route::get('cetak/cee/1c', [CetakCeeController::class, 'cetak1c'])->name('cetak.cee.1c');
    Route::get('cetak/cee/1a/pdf', [CetakCeeController::class, 'pdf1a'])->name('cetak.cee.1a.pdf');
    Route::get('cetak/cee/1b/pdf', [CetakCeeController::class, 'pdf1b'])->name('cetak.cee.1b.pdf');
    Route::get('cetak/cee/1c/pdf', [CetakCeeController::class, 'pdf1c'])->name('cetak.cee.1c.pdf');

    Route::get('krs_irs_pemda', [KaeresController::class, 'index'])->name('krs_irs_pemda.index');
    Route::get('krs_irs_pemda_visualisasi', [KaeresController::class, 'visualization'])->name('krs_irs_pemda.visualization');
    Route::get('krs_irs_pemda_visualisasi/embed', [KaeresController::class, 'visualizationEmbed'])->name('krs_irs_pemda.visualization.embed');
    Route::get('krs_pemda', [KrsPemdaController::class, 'index'])->name('krs_pemda.index');
    Route::post('krs_pemda', [KrsPemdaController::class, 'store'])->name('krs_pemda.store');
    Route::put('krs_pemda/{krs_pemda}', [KrsPemdaController::class, 'update'])->name('krs_pemda.update');
    // Edit satu NODE non-leaf (Visi/Misi/Tujuan/Sasaran) sekaligus: meng-update
    // SELURUH baris flat yang membentuk node itu, bukan satu baris — supaya node
    // tidak pecah jadi dua saat teksnya diubah.
    Route::put('krs_pemda_node/update', [KrsPemdaController::class, 'updateNode'])->name('krs_pemda.update_node');
    // Hapus satu NODE non-leaf beserta SELURUH baris/anak di bawahnya.
    Route::delete('krs_pemda_node/delete', [KrsPemdaController::class, 'deleteNode'])->name('krs_pemda.delete_node');
    Route::delete('krs_pemda/{krs_pemda}', [KrsPemdaController::class, 'destroy'])->name('krs_pemda.destroy');
    Route::get('irs_pemda', [IrsPemdaController::class, 'index'])->name('irs_pemda.index');
    Route::post('irs_pemda', [IrsPemdaController::class, 'store'])->name('irs_pemda.store');
    Route::put('irs_pemda/{irs_pemda}', [IrsPemdaController::class, 'update'])->name('irs_pemda.update');
    Route::delete('irs_pemda/{irs_pemda}', [IrsPemdaController::class, 'destroy'])->name('irs_pemda.destroy');

    // Risiko Strategis PD (Perangkat Daerah) — analog Risiko Strategis
    // Pemda, dasarnya Renstra OPD (bukan RPJMD), dengan hierarki lebih
    // dalam (Kegiatan, SubKegiatan) di bawah Program.
    Route::get('krs_irs_pd', [KaeresPdController::class, 'index'])->name('krs_irs_pd.index');
    Route::get('krs_irs_pd_visualisasi', [KaeresPdController::class, 'visualization'])->name('krs_irs_pd.visualization');
    Route::get('krs_irs_pd_visualisasi/embed', [KaeresPdController::class, 'visualizationEmbed'])->name('krs_irs_pd.visualization.embed');
    Route::get('krs_pd', [KrsPdController::class, 'index'])->name('krs_pd.index');
    Route::post('krs_pd', [KrsPdController::class, 'store'])->name('krs_pd.store');
    Route::put('krs_pd/{krs_pd}', [KrsPdController::class, 'update'])->name('krs_pd.update');
    Route::put('krs_pd_node/update', [KrsPdController::class, 'updateNode'])->name('krs_pd.update_node');
    Route::delete('krs_pd_node/delete', [KrsPdController::class, 'deleteNode'])->name('krs_pd.delete_node');
    Route::delete('krs_pd/{krs_pd}', [KrsPdController::class, 'destroy'])->name('krs_pd.destroy');
    Route::get('irs_pd', [IrsPdController::class, 'index'])->name('irs_pd.index');
    Route::post('irs_pd', [IrsPdController::class, 'store'])->name('irs_pd.store');
    Route::put('irs_pd/{irs_pd}', [IrsPdController::class, 'update'])->name('irs_pd.update');
    Route::delete('irs_pd/{irs_pd}', [IrsPdController::class, 'destroy'])->name('irs_pd.destroy');

    // Risiko Operasional PD (Level III) — analog Risiko Strategis PD, dasarnya
    // Renja/RKA Perangkat Daerah (bukan Renstra), dengan hierarki KRO_PD tetap
    // berakar ke Sasaran Renstra (dari KRS_PD). IRO_PD merujuk ke Kegiatan PD
    // (bukan Sasaran/SubKegiatan) sesuai Perdep PPKD No.4/2019 BPKP.
    Route::get('kro_iro_pd', [KaeresRoController::class, 'index'])->name('kro_iro_pd.index');
    Route::get('kro_iro_pd_visualisasi', [KaeresRoController::class, 'visualization'])->name('kro_iro_pd.visualization');
    Route::get('kro_iro_pd_visualisasi/embed', [KaeresRoController::class, 'visualizationEmbed'])->name('kro_iro_pd.visualization.embed');
    Route::get('kro_pd', [KroPdController::class, 'index'])->name('kro_pd.index');
    Route::post('kro_pd', [KroPdController::class, 'store'])->name('kro_pd.store');
    Route::put('kro_pd/{kro_pd}', [KroPdController::class, 'update'])->name('kro_pd.update');
    Route::put('kro_pd_node/update', [KroPdController::class, 'updateNode'])->name('kro_pd.update_node');
    Route::delete('kro_pd_node/delete', [KroPdController::class, 'deleteNode'])->name('kro_pd.delete_node');
    Route::delete('kro_pd/{kro_pd}', [KroPdController::class, 'destroy'])->name('kro_pd.destroy');
    Route::post('kro_pd/import-from-krs-pd', [KroPdController::class, 'importFromKrsPd'])->name('kro_pd.import_from_krs_pd');
    Route::get('iro_pd', [IroPdController::class, 'index'])->name('iro_pd.index');
    Route::post('iro_pd', [IroPdController::class, 'store'])->name('iro_pd.store');
    Route::put('iro_pd/{iro_pd}', [IroPdController::class, 'update'])->name('iro_pd.update');
    Route::delete('iro_pd/{iro_pd}', [IroPdController::class, 'destroy'])->name('iro_pd.destroy');

    // Bukti dukung existing control (IRS Pemda/IRS PD/IRO PD) — file
    // tersimpan lewat media User yg sama dgn Utilities > File Manager.
    Route::get('risk-evidence/{type}/{id}', [RiskEvidenceController::class, 'index'])->name('risk-evidence.index');
    Route::post('risk-evidence/{type}/{id}', [RiskEvidenceController::class, 'store'])->name('risk-evidence.store');
    Route::delete('risk-evidence/{type}/{id}/{mediaId}', [RiskEvidenceController::class, 'destroy'])->name('risk-evidence.destroy');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
