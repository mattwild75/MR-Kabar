<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Menu;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class MenuSeeder extends Seeder
{
    public function run(): void
    {
        // MENU: Dashboard
        Menu::updateOrCreate(
            ['title' => 'Dashboard', 'parent_id' => null],
            [
                'icon' => 'Home',
                'route' => '/dashboard',
                'order' => 1,
                'permission_name' => 'dashboard-view',
            ]
        );

        // MENU: Panduan — halaman dokumentasi statis (5W1H manajemen risiko
        // Pemda + cara pakai MR Kabar). Fail-open (permission_name null)
        // supaya SEMUA pengguna termasuk akun CEE_Survey bisa akses (lihat
        // whitelist di RestrictCeeSurveyRole middleware).
        Menu::updateOrCreate(
            ['title' => 'Apa itu Manajemen Risiko / MR Kabar', 'parent_id' => null],
            [
                'icon' => 'Book',
                'route' => '/panduan',
                'order' => 2,
                'permission_name' => null,
            ]
        );

        // GROUP: Access
        $access = Menu::updateOrCreate(
            ['title' => 'Access', 'parent_id' => null],
            [
                'icon' => 'Contact',
                'route' => '#',
                'order' => 3,
                'permission_name' => 'access-view',
            ]
        );

        Menu::updateOrCreate(
            ['title' => 'Permissions', 'parent_id' => $access->id],
            [
                'icon' => 'AlertOctagon',
                'route' => '/permissions',
                'order' => 2,
                'permission_name' => 'permission-view',
            ]
        );

        Menu::updateOrCreate(
            ['title' => 'Users', 'parent_id' => $access->id],
            [
                'icon' => 'Users',
                'route' => '/users',
                'order' => 3,
                'permission_name' => 'users-view',
            ]
        );

        Menu::updateOrCreate(
            ['title' => 'Roles', 'parent_id' => $access->id],
            [
                'icon' => 'AlertTriangle',
                'route' => '/roles',
                'order' => 4,
                'permission_name' => 'roles-view',
            ]
        );

        // GROUP: Settings
        $settings = Menu::updateOrCreate(
            ['title' => 'Settings', 'parent_id' => null],
            [
                'icon' => 'Settings',
                'route' => '#',
                'order' => 4,
                'permission_name' => 'settings-view',
            ]
        );

        Menu::updateOrCreate(
            ['title' => 'Menu Manager', 'parent_id' => $settings->id],
            [
                'icon' => 'Menu',
                'route' => '/menus',
                'order' => 1,
                'permission_name' => 'menu-view',
            ]
        );

        Menu::updateOrCreate(
            ['title' => 'App Settings', 'parent_id' => $settings->id],
            [
                'icon' => 'AtSign',
                'route' => '/settingsapp',
                'order' => 2,
                'permission_name' => 'app-settings-view',
            ]
        );

        // GROUP: Backup — dua turunan: "Backup DB dan GitHub" (halaman lama
        // di /backup) dan "Ekspor/Impor Excel". Grup ini sendiri tidak
        // punya halaman (route "#") DAN sengaja TANPA permission_name
        // (fail-open) — visibilitasnya murni ditentukan oleh sub-menu di
        // dalamnya (ShareMenus middleware otomatis sembunyikan grup kalau
        // semua anaknya tersembunyi). Kalau grup ini dipasangi permission
        // sendiri (mis. "backup-view"), admin yang TIDAK punya "backup-view"
        // (dikunci ke super-admin) akan kehilangan akses ke SELURUH grup
        // termasuk "Ekspor/Impor Excel" yang mestinya tetap boleh diakses
        // admin lewat permission "backup-excel-view" terpisah — bug yang
        // pernah terjadi, jangan diulangi.
        $backup = Menu::updateOrCreate(
            ['title' => 'Backup', 'parent_id' => $settings->id],
            [
                'icon' => 'Inbox',
                'route' => '#',
                'order' => 3,
                'permission_name' => null,
            ]
        );

        Menu::updateOrCreate(
            ['title' => 'Backup DB dan GitHub', 'parent_id' => $backup->id],
            [
                'icon' => 'DatabaseBackup',
                'route' => '/backup',
                'order' => 1,
                'permission_name' => 'backup-view',
            ]
        );

        // Sub-menu Backup > Ekspor/Impor Excel — dipisah dari permission
        // backup-view (yang cuma baca daftar backup DB) karena fitur ini
        // adalah kemampuan TULIS MASSAL (bulk write) ke seluruh data risiko
        // lintas-OPD, jadi harus bisa diberikan/dicabut terpisah.
        Menu::updateOrCreate(
            ['title' => 'Ekspor/Impor Excel', 'parent_id' => $backup->id],
            [
                'icon' => 'FileSpreadsheet',
                'route' => '/backup/excel',
                'order' => 2,
                'permission_name' => 'backup-excel-view',
            ]
        );

        Menu::updateOrCreate(
            ['title' => 'Keterangan Pendukung', 'parent_id' => $settings->id],
            [
                'icon' => 'Database',
                'route' => '/keterangan-pendukung',
                'order' => 4,
                'permission_name' => 'keterangan-pendukung-view',
            ]
        );

        // GROUP: Utilities
        $utilities = Menu::updateOrCreate(
            ['title' => 'Utilities', 'parent_id' => null],
            [
                'icon' => 'CreditCard',
                'route' => '#',
                'order' => 5,
                'permission_name' => 'utilities-view',
            ]
        );

        Menu::updateOrCreate(
            ['title' => 'Audit Logs', 'parent_id' => $utilities->id],
            [
                'icon' => 'Activity',
                'route' => '/audit-logs',
                'order' => 2,
                'permission_name' => 'log-view',
            ]
        );

        Menu::updateOrCreate(
            ['title' => 'File Manager', 'parent_id' => $utilities->id],
            [
                'icon' => 'Folder',
                'route' => '/files',
                'order' => 3,
                'permission_name' => 'filemanager-view',
            ]
        );

        // Folder Umum tidak lagi jadi menu terpisah — sudah digabung sebagai
        // node tree di dalam File Manager sendiri (lihat
        // UserFileController::index() & files/Index.tsx), jadi semua user
        // bisa masuk lewat satu menu "File Manager" saja.

        // Rekapan laporan troubleshoot — hanya admin/super-admin. Permission
        // 'troubleshoot-view' di-assign ke admin di RolePermissionSeeder;
        // super-admin lolos lewat Gate::before di AuthServiceProvider.
        Menu::updateOrCreate(
            ['title' => 'Troubleshoot', 'parent_id' => $utilities->id],
            [
                'icon' => 'Wrench',
                'route' => '/troubleshoot',
                'order' => 4,
                'permission_name' => 'troubleshoot-view',
            ]
        );

        // Data Terhapus (sampah soft-delete). permission_name kosong (fail-open)
        // agar PIC juga bisa membuka & memulihkan data MILIKNYA sendiri — apa
        // yang tampil & boleh dikelola sudah dibatasi di TrashController per
        // kepemilikan (hapus permanen tetap admin-only di controller).
        Menu::updateOrCreate(
            ['title' => 'Data Terhapus', 'parent_id' => $utilities->id],
            [
                'icon' => 'Trash2',
                'route' => '/trash',
                'order' => 5,
                'permission_name' => '',
            ]
        );

        // Form Lapor Kejadian Risiko — terbuka utk semua user login (termasuk
        // akun bersama LAPOR, lihat RestrictLaporRisikoRole). Dipisah dari
        // menu Rekap di atas (path beda) krn CheckMenuPermission cocok
        // per-prefix, sama alasan Troubleshoot form vs Troubleshoot rekap.
        Menu::updateOrCreate(
            ['title' => 'Lapor Kejadian Risiko', 'parent_id' => $utilities->id],
            [
                'icon' => 'Siren',
                'route' => '/lapor-kejadian',
                'order' => 6,
                'permission_name' => null,
            ]
        );

        // Rekap Lapor Kejadian Risiko. permission_name kosong (fail-open) —
        // visibilitas SEBENARNYA (admin/super-admin lihat semua, PIC OPD
        // hanya milik OPD-nya) ditegakkan di LaporanKejadianController::index()
        // (query filter + AccessDeniedHttpException utk user tanpa opd_id
        // yg bukan admin/super-admin), sama pola dgn Data Terhapus di atas.
        Menu::updateOrCreate(
            ['title' => 'Rekap Lapor Kejadian Risiko', 'parent_id' => $utilities->id],
            [
                'icon' => 'AlertTriangle',
                'route' => '/lapor-kejadian/rekap',
                'order' => 7,
                'permission_name' => '',
            ]
        );

        // GROUP: Form Input — wadah untuk seluruh menu input data risiko
        // (Risiko Strategis Pemda/PD & Risiko Operasional PD beserta
        // turunannya). Ketiga grup risiko kini menjadi SUB-grup di bawah sini,
        // bukan lagi grup top-level tersendiri.
        $formInput = Menu::updateOrCreate(
            ['title' => 'Form Input', 'parent_id' => null],
            [
                'icon' => 'FilePlus',
                'route' => '#',
                'order' => 6,
                'permission_name' => null,
            ]
        );

        // GROUP: Form Monitoring dan Evaluasi — wadah menu BARU di antara
        // Form Input & Form Cetak, Lampiran 5 Form 8/9/10 Perdep PPKD
        // No.4/2019 (Tahap 4 & 5 Bab III: Informasi & Komunikasi, dan
        // Pemantauan). permission_name null (fail-open) — akses dibatasi
        // per-OPD via MonitoringEvaluasiController::ensureOpdAccess(), sama
        // pola dgn Form Cetak Risiko.
        $formMonev = Menu::updateOrCreate(
            ['title' => 'Form Monitoring dan Evaluasi', 'parent_id' => null],
            [
                'icon' => 'Radar',
                'route' => '#',
                'order' => 7,
                'permission_name' => null,
            ]
        );

        Menu::updateOrCreate(
            ['route' => '/monitoring-evaluasi/8-9'],
            [
                'title' => '8-9_Monitoring RTP',
                'parent_id' => $formMonev->id,
                'icon' => 'MessageSquare',
                'order' => 1,
                'permission_name' => null,
            ]
        );

        Menu::updateOrCreate(
            ['route' => '/monitoring-evaluasi/10'],
            [
                'title' => '10_Pencatatan Kejadian Risiko',
                'parent_id' => $formMonev->id,
                'icon' => 'CalendarClock',
                'order' => 2,
                'permission_name' => null,
            ]
        );

        // GROUP: Form Cetak — wadah untuk menu cetak/laporan.
        $formCetak = Menu::updateOrCreate(
            ['title' => 'Form Cetak', 'parent_id' => null],
            [
                'icon' => 'Printer',
                'route' => '#',
                'order' => 8,
                'permission_name' => null,
            ]
        );

        // Sub-grup: Form Cetak -> CEE -> 1a/1b/1c. Judul menu ringkas
        // ("1a_Rekapitulasi Kuesioner..."); judul LENGKAP sesuai redaksi
        // Perdep ditampilkan di halaman cetaknya masing-masing.
        $formCetakCee = Menu::updateOrCreate(
            ['title' => 'CEE', 'parent_id' => $formCetak->id],
            [
                'icon' => 'ClipboardCheck',
                'route' => '#',
                'order' => 1,
                'permission_name' => null,
            ]
        );

        Menu::updateOrCreate(
            ['route' => '/cetak/cee/1a'],
            [
                'title' => '1a_Rekapitulasi Kuesioner',
                'parent_id' => $formCetakCee->id,
                'icon' => 'ListChecks',
                'order' => 1,
                'permission_name' => null,
            ]
        );

        Menu::updateOrCreate(
            ['route' => '/cetak/cee/1b'],
            [
                'title' => '1b_CEE Berdasarkan Dokumen',
                'parent_id' => $formCetakCee->id,
                'icon' => 'FileSearch',
                'order' => 2,
                'permission_name' => null,
            ]
        );

        Menu::updateOrCreate(
            ['route' => '/cetak/cee/1c'],
            [
                'title' => '1c_Simpulan Survei Persepsi',
                'parent_id' => $formCetakCee->id,
                'icon' => 'FileCheck',
                'order' => 3,
                'permission_name' => null,
            ]
        );

        // Sub-grup: Form Cetak -> Risiko -> Penetapan Konteks Risiko ->
        // 2a/2b/2c (Strategis Pemda / Strategis OPD / Operasional OPD),
        // sesuai Form_I_a/I_b, Form_II_a/I_b, Form_III_a/I_b Perdep PPKD
        // No.4/2019. "Risiko" adalah wadah level-1 supaya form cetak risiko
        // LAIN (mis. Identifikasi Risiko/Form 3 dst di kemudian hari) bisa
        // ditambahkan sejajar dengan "Penetapan Konteks Risiko", bukan
        // bercampur langsung sebagai anak "Risiko".
        $formCetakRisiko = Menu::updateOrCreate(
            ['title' => 'Risiko', 'parent_id' => $formCetak->id],
            [
                'icon' => 'ShieldAlert',
                'route' => '#',
                'order' => 2,
                'permission_name' => null,
            ]
        );

        $formCetakKonteksRisiko = Menu::updateOrCreate(
            ['title' => 'Penetapan Konteks Risiko', 'parent_id' => $formCetakRisiko->id],
            [
                'icon' => 'Target',
                'route' => '#',
                'order' => 1,
                'permission_name' => null,
            ]
        );

        Menu::updateOrCreate(
            ['route' => '/cetak/risiko/2a'],
            [
                'title' => '2a_Konteks Risiko Strategis Pemda',
                'parent_id' => $formCetakKonteksRisiko->id,
                'icon' => 'Landmark',
                'order' => 1,
                'permission_name' => null,
            ]
        );

        Menu::updateOrCreate(
            ['route' => '/cetak/risiko/2b'],
            [
                'title' => '2b_Konteks Risiko Strategis OPD',
                'parent_id' => $formCetakKonteksRisiko->id,
                'icon' => 'Building2',
                'order' => 2,
                'permission_name' => null,
            ]
        );

        Menu::updateOrCreate(
            ['route' => '/cetak/risiko/2c'],
            [
                'title' => '2c_Konteks Risiko Operasional OPD',
                'parent_id' => $formCetakKonteksRisiko->id,
                'icon' => 'Workflow',
                'order' => 3,
                'permission_name' => null,
            ]
        );

        // Sub-grup: Form Cetak -> Risiko -> Identifikasi Risiko ->
        // 3a/3b/3c (Strategis Pemda / Strategis OPD / Operasional OPD),
        // sesuai Lampiran 5 Form 3a/3b/3c Perdep PPKD No.4/2019 — sejajar
        // dgn "Penetapan Konteks Risiko" di bawah grup "Risiko" yg sama.
        $formCetakIdentifikasiRisiko = Menu::updateOrCreate(
            ['title' => 'Identifikasi Risiko', 'parent_id' => $formCetakRisiko->id],
            [
                'icon' => 'SearchCheck',
                'route' => '#',
                'order' => 2,
                'permission_name' => null,
            ]
        );

        Menu::updateOrCreate(
            ['route' => '/cetak/risiko/3a'],
            [
                'title' => '3a_Identifikasi Risiko Strategis Pemda',
                'parent_id' => $formCetakIdentifikasiRisiko->id,
                'icon' => 'Landmark',
                'order' => 1,
                'permission_name' => null,
            ]
        );

        Menu::updateOrCreate(
            ['route' => '/cetak/risiko/3b'],
            [
                'title' => '3b_Identifikasi Risiko Strategis OPD',
                'parent_id' => $formCetakIdentifikasiRisiko->id,
                'icon' => 'Building2',
                'order' => 2,
                'permission_name' => null,
            ]
        );

        Menu::updateOrCreate(
            ['route' => '/cetak/risiko/3c'],
            [
                'title' => '3c_Identifikasi Risiko Operasional OPD',
                'parent_id' => $formCetakIdentifikasiRisiko->id,
                'icon' => 'Workflow',
                'order' => 3,
                'permission_name' => null,
            ]
        );

        // Sub-grup: Form Cetak -> Risiko -> Hasil Analisis Risiko -> 4/5,
        // sesuai Lampiran 5 Form 4 & Form 5 Perdep PPKD No.4/2019 — sejajar
        // dgn "Penetapan Konteks Risiko" & "Identifikasi Risiko" di bawah
        // grup "Risiko" yg sama. BEDA dari 2a/2b/2c & 3a/3b/3c: Form 4/5
        // menggabungkan SELURUH tingkat risiko (Pemda + semua OPD) dalam
        // satu form, jadi hanya 2 menu (bukan a/b/c per tingkat) — lihat
        // CetakHasilAnalisisController.
        $formCetakHasilAnalisis = Menu::updateOrCreate(
            ['title' => 'Hasil Analisis Risiko', 'parent_id' => $formCetakRisiko->id],
            [
                'icon' => 'ChartNoAxesCombined',
                'route' => '#',
                'order' => 3,
                'permission_name' => null,
            ]
        );

        Menu::updateOrCreate(
            ['route' => '/cetak/risiko/4'],
            [
                'title' => '4_Hasil Analisis Risiko',
                'parent_id' => $formCetakHasilAnalisis->id,
                'icon' => 'ChartColumn',
                'order' => 1,
                'permission_name' => null,
            ]
        );

        Menu::updateOrCreate(
            ['route' => '/cetak/risiko/5'],
            [
                'title' => '5_Daftar Risiko Prioritas',
                'parent_id' => $formCetakHasilAnalisis->id,
                'icon' => 'ListOrdered',
                'order' => 2,
                'permission_name' => null,
            ]
        );

        // Sub-grup: Form Cetak -> Risiko -> RTP -> 6/7, sesuai Lampiran 5
        // Form 6 & Form 7 Perdep PPKD No.4/2019 — sejajar dgn "Hasil Analisis
        // Risiko". Form 6 (RTP atas CEE) PER-OPD (wajib opd_id, spt Form
        // 2/3); Form 7 (RTP atas Hasil Identifikasi Risiko) lintas-OPD (spt
        // Form 4/5) — lihat CetakRtpController.
        $formCetakRtp = Menu::updateOrCreate(
            ['title' => 'RTP', 'parent_id' => $formCetakRisiko->id],
            [
                'icon' => 'ShieldCheck',
                'route' => '#',
                'order' => 4,
                'permission_name' => null,
            ]
        );

        Menu::updateOrCreate(
            ['route' => '/cetak/risiko/6'],
            [
                'title' => '6_RTP atas CEE',
                'parent_id' => $formCetakRtp->id,
                'icon' => 'ClipboardCheck',
                'order' => 1,
                'permission_name' => null,
            ]
        );

        Menu::updateOrCreate(
            ['route' => '/cetak/risiko/7'],
            [
                'title' => '7_RTP atas Hasil Identifikasi Risiko',
                'parent_id' => $formCetakRtp->id,
                'icon' => 'ClipboardList',
                'order' => 2,
                'permission_name' => null,
            ]
        );

        // Sub-grup: Form Cetak -> Risiko -> Monitoring & Evaluasi -> 8/9/10,
        // sejajar dgn "RTP" — Lampiran 5 Form 8/9/10 Perdep PPKD No.4/2019,
        // PER-OPD (lihat CetakMonitoringEvaluasiController).
        $formCetakMonev = Menu::updateOrCreate(
            ['title' => 'Monitoring & Evaluasi', 'parent_id' => $formCetakRisiko->id],
            [
                'icon' => 'Radar',
                'route' => '#',
                'order' => 5,
                'permission_name' => null,
            ]
        );

        Menu::updateOrCreate(
            ['route' => '/cetak/monitoring-evaluasi/8'],
            [
                'title' => '8_Rencana & Realisasi Pengkomunikasian',
                'parent_id' => $formCetakMonev->id,
                'icon' => 'MessageSquare',
                'order' => 1,
                'permission_name' => null,
            ]
        );

        Menu::updateOrCreate(
            ['route' => '/cetak/monitoring-evaluasi/9'],
            [
                'title' => '9_Rencana & Realisasi Pemantauan',
                'parent_id' => $formCetakMonev->id,
                'icon' => 'Eye',
                'order' => 2,
                'permission_name' => null,
            ]
        );

        Menu::updateOrCreate(
            ['route' => '/cetak/monitoring-evaluasi/10'],
            [
                'title' => '10_Pencatatan Kejadian Risiko',
                'parent_id' => $formCetakMonev->id,
                'icon' => 'CalendarClock',
                'order' => 3,
                'permission_name' => null,
            ]
        );

        // Sub-grup: Form Cetak -> Risiko -> Laporan -> 11/12/13, sejajar dgn
        // "Monitoring & Evaluasi" — Bab IV Pelaporan & Lampiran 7 Perdep PPKD
        // No.4/2019 (lihat CetakLaporanController). Laporan 13 (Pemantauan
        // Unit Kepatuhan) SELALU level Pemda, boleh dilihat semua user tapi
        // hanya Admin/Super Admin yg boleh mengedit narasinya (dibatasi di
        // controller, bukan lewat permission_name menu).
        $formCetakLaporan = Menu::updateOrCreate(
            ['title' => 'Laporan', 'parent_id' => $formCetakRisiko->id],
            [
                'icon' => 'FileBarChart',
                'route' => '#',
                'order' => 6,
                'permission_name' => null,
            ]
        );

        Menu::updateOrCreate(
            ['route' => '/cetak/laporan/1'],
            [
                'title' => '11_Laporan Pelaksanaan Penilaian Risiko',
                'parent_id' => $formCetakLaporan->id,
                'icon' => 'ClipboardCheck',
                'order' => 1,
                'permission_name' => null,
            ]
        );

        Menu::updateOrCreate(
            ['route' => '/cetak/laporan/2'],
            [
                'title' => '12_Laporan Berkala Pengelolaan Risiko',
                'parent_id' => $formCetakLaporan->id,
                'icon' => 'CalendarRange',
                'order' => 2,
                'permission_name' => null,
            ]
        );

        Menu::updateOrCreate(
            ['route' => '/cetak/laporan/3'],
            [
                'title' => '13_Laporan Pemantauan Unit Kepatuhan',
                'parent_id' => $formCetakLaporan->id,
                'icon' => 'ShieldCheck',
                'order' => 3,
                'permission_name' => null,
            ]
        );

        // Data Umum — item pertama di Form Input (sebelum Risiko Strategis
        // Pemda). Berisi header identitas + penanda tangan per-PIC untuk Form
        // Cetak. permission_name null (fail-open); isi dibatasi per-user di
        // controller.
        Menu::updateOrCreate(
            ['route' => '/data-umum'],
            [
                'title' => 'Data Umum',
                'parent_id' => $formInput->id,
                'icon' => 'ClipboardList',
                'order' => 0,
                'permission_name' => null,
            ]
        );

        // GROUP: CEE (Control Environment Evaluation) — sub-grup Form Input,
        // setelah Data Umum & SEBELUM Risiko Strategis Pemda. Form 1a/1b/1c
        // sesuai Lampiran 5 Perdep PPKD No.4/2019. permission_name null
        // (fail-open) — akses akun CEE_Survey dibatasi middleware terpisah
        // (RestrictCeeSurveyRole), bukan lewat permission menu.
        $formInputCee = Menu::updateOrCreate(
            ['title' => 'CEE', 'parent_id' => $formInput->id],
            [
                'icon' => 'ClipboardCheck',
                'route' => '#',
                'order' => 1,
                'permission_name' => null,
            ]
        );

        Menu::updateOrCreate(
            ['route' => '/cee/1a'],
            [
                'title' => '1a_Kuesioner CEE',
                'parent_id' => $formInputCee->id,
                'icon' => 'ListChecks',
                'order' => 1,
                'permission_name' => null,
            ]
        );

        Menu::updateOrCreate(
            ['route' => '/cee/1b'],
            [
                'title' => '1b_CEE Berdasarkan Dokumen',
                'parent_id' => $formInputCee->id,
                'icon' => 'FileSearch',
                'order' => 2,
                'permission_name' => null,
            ]
        );

        Menu::updateOrCreate(
            ['route' => '/cee/1c'],
            [
                'title' => '1c_Simpulan Survei Persepsi',
                'parent_id' => $formInputCee->id,
                'icon' => 'FileCheck',
                'order' => 3,
                'permission_name' => null,
            ]
        );

        // 1d_RTP CEE — Lampiran 5 Form 6 Perdep PPKD No.4/2019 (RTP atas
        // Kelemahan Lingkungan Pengendalian), submenu terakhir grup CEE.
        Menu::updateOrCreate(
            ['route' => '/cee/1d'],
            [
                'title' => '1d_RTP CEE',
                'parent_id' => $formInputCee->id,
                'icon' => 'ClipboardEdit',
                'order' => 4,
                'permission_name' => null,
            ]
        );

        // Kelola pertanyaan kuesioner — admin/super-admin saja (ditegakkan di
        // controller). permission_name tetap null (fail-open di menu level);
        // proteksi sebenarnya di CeePertanyaanController::ensureCanManage.
        Menu::updateOrCreate(
            ['route' => '/cee/pertanyaan'],
            [
                'title' => 'Kelola Pertanyaan CEE',
                'parent_id' => $formInputCee->id,
                'icon' => 'Settings2',
                'order' => 4,
                'permission_name' => null,
            ]
        );

        // GROUP: Risiko — induk bersama utk 3 tingkatan risiko (Strategis
        // Pemda/PD, Operasional PD), supaya sidebar Form Input tidak penuh
        // 3 grup sejajar. Ikon Shield merepresentasikan manajemen risiko.
        $risikoGroup = Menu::updateOrCreate(
            ['title' => 'Risiko', 'parent_id' => $formInput->id],
            [
                'icon' => 'Shield',
                'route' => '#',
                'order' => 2,
                'permission_name' => null,
            ]
        );

        // Ekspor/Impor KRS (Excel) — fitur PIC OPD, terpisah dari
        // Ekspor/Impor Excel admin (Settings > Backup > Excel). Diletakkan
        // sejajar dgn grup Risiko (bukan di dalam salah satu levelnya) krn
        // mencakup KETIGA tingkat hierarki sekaligus (KRS Pemda -> KRS PD ->
        // KRO PD) dalam satu file. permission_name null (fail-open, sama
        // pola menu Form Input lain) — pembatasan submit ke role 'user' &
        // approve ke admin/super-admin dilakukan di
        // KrsPicExcelController::ensurePicOpd()/ensureAdminOrSuperAdmin(),
        // bukan di layer permission menu.
        Menu::updateOrCreate(
            ['route' => '/krs-excel'],
            [
                'title' => 'Ekspor/Impor KRS (Excel)',
                'parent_id' => $formInput->id,
                'icon' => 'FileSpreadsheet',
                'order' => 3,
                'permission_name' => null,
            ]
        );

        // GROUP: Risiko Strategis Pemda (Level I) — sub-grup di bawah Risiko.
        // Ikon Flag (penanda strategis tertinggi/seluruh Pemda).
        $risikoStrategisPemda = Menu::updateOrCreate(
            ['title' => 'Risiko Strategis Pemda'],
            [
                'parent_id' => $risikoGroup->id,
                'icon' => 'Flag',
                'route' => '',
                'order' => 1,
                'permission_name' => null,
            ]
        );

        Menu::updateOrCreate(
            ['route' => '/krs_pemda'],
            [
                'title' => 'I_a_KRS_Pemda',
                'parent_id' => $risikoStrategisPemda->id,
                'icon' => 'List',
                'order' => 1,
                'permission_name' => null,
            ]
        );

        Menu::updateOrCreate(
            ['route' => '/irs_pemda'],
            [
                'title' => 'I_b_IRS_Pemda',
                'parent_id' => $risikoStrategisPemda->id,
                'icon' => 'AlertTriangle',
                'order' => 2,
                'permission_name' => null,
            ]
        );

        // GROUP: Risiko Strategis PD (Level II) — sub-grup di bawah Risiko.
        // Ikon Briefcase (institusi/organisasi Perangkat Daerah).
        $risikoStrategisPd = Menu::updateOrCreate(
            ['title' => 'Risiko Strategis PD'],
            [
                'parent_id' => $risikoGroup->id,
                'icon' => 'Briefcase',
                'route' => '',
                'order' => 2,
                'permission_name' => null,
            ]
        );

        Menu::updateOrCreate(
            ['route' => '/krs_pd'],
            [
                'title' => 'II_a_KRS_PD',
                'parent_id' => $risikoStrategisPd->id,
                'icon' => 'List',
                'order' => 1,
                'permission_name' => null,
            ]
        );

        Menu::updateOrCreate(
            ['route' => '/irs_pd'],
            [
                'title' => 'II_b_IRS_PD',
                'parent_id' => $risikoStrategisPd->id,
                'icon' => 'AlertTriangle',
                'order' => 2,
                'permission_name' => null,
            ]
        );

        // GROUP: Risiko Operasional PD (Level III) — sub-grup di bawah
        // Risiko, dasarnya Renja/RKA Perangkat Daerah. Ikon Layers (level
        // operasional di bawah level strategis Pemda/PD di atasnya).
        $risikoOperasionalPd = Menu::updateOrCreate(
            ['title' => 'Risiko Operasional PD'],
            [
                'parent_id' => $risikoGroup->id,
                'icon' => 'Layers',
                'route' => '',
                'order' => 3,
                'permission_name' => null,
            ]
        );

        Menu::updateOrCreate(
            ['route' => '/kro_pd'],
            [
                'title' => 'III_a_KRO_PD',
                'parent_id' => $risikoOperasionalPd->id,
                'icon' => 'List',
                'order' => 1,
                'permission_name' => null,
            ]
        );

        Menu::updateOrCreate(
            ['route' => '/iro_pd'],
            [
                'title' => 'III_b_IRO_PD',
                'parent_id' => $risikoOperasionalPd->id,
                'icon' => 'AlertTriangle',
                'order' => 2,
                'permission_name' => null,
            ]
        );

        // GROUP: Visualisasi — menu top-level TERPISAH dari Form Cetak,
        // wadah untuk halaman diagram/pohon hirarki risiko (dipindahkan
        // dari masing-masing grup Risiko Strategis Pemda/PD/Operasional PD
        // di Form Input — sifatnya laporan visual, bukan input data, jadi
        // lebih pas berdiri sendiri daripada menumpuk di Form Input/Cetak).
        $visualisasi = Menu::updateOrCreate(
            ['title' => 'Visualisasi', 'parent_id' => null],
            [
                'icon' => 'Network',
                'route' => '#',
                'order' => 9,
                'permission_name' => null,
            ]
        );

        $visualisasiHirarki = Menu::updateOrCreate(
            ['title' => 'Hirarki', 'parent_id' => $visualisasi->id],
            [
                'icon' => 'GitBranch',
                'route' => '#',
                'order' => 1,
                'permission_name' => null,
            ]
        );

        Menu::updateOrCreate(
            ['route' => '/krs_irs_pemda_visualisasi'],
            [
                'title' => 'KRS_IRS_Pemda Visualisasi',
                'parent_id' => $visualisasiHirarki->id,
                'icon' => 'BarChart',
                'order' => 1,
                'permission_name' => null,
            ]
        );

        Menu::updateOrCreate(
            ['route' => '/krs_irs_pd_visualisasi'],
            [
                'title' => 'KRS_IRS_PD Visualisasi',
                'parent_id' => $visualisasiHirarki->id,
                'icon' => 'BarChart',
                'order' => 2,
                'permission_name' => null,
            ]
        );

        Menu::updateOrCreate(
            ['route' => '/kro_iro_pd_visualisasi'],
            [
                'title' => 'KRO_IRO_PD Visualisasi',
                'parent_id' => $visualisasiHirarki->id,
                'icon' => 'BarChart',
                'order' => 3,
                'permission_name' => null,
            ]
        );

        $permissions = Menu::pluck('permission_name')->unique()->filter();

        foreach ($permissions as $permName) {
            Permission::firstOrCreate(['name' => $permName]);
        }

        $role = Role::firstOrCreate(['name' => 'user']);
        $role->givePermissionTo('dashboard-view');

        // File Manager dibuka untuk semua pengguna terautentikasi — setiap
        // user (termasuk PIC/admin-instansi) sudah otomatis punya folder
        // root sendiri (lihat UserFolderObserver) dan MediaFolderController
        // sudah men-scope query ke user_id masing-masing, jadi aman dibuka
        // luas tanpa membocorkan file antar user.
        foreach (['user', 'admin-instansi', 'admin-inspektorat'] as $roleName) {
            Role::firstOrCreate(['name' => $roleName])->givePermissionTo('filemanager-view');
        }
    }
}
