<?php
// Ikon menu yang menggambarkan isinya (bukan ikon generik). Dijalankan lewat
// tinker di lokal dan produksi; MenuSeeder juga diselaraskan supaya instalasi
// baru langsung mendapat ikon yang sama. Hanya ikon yang diubah — judul,
// rute, urutan, dan izin tidak disentuh.
$peta = [
    ['Dashboard', null, 'LayoutDashboard'],
    ['Apa itu Manajemen Risiko / MR Kabar', null, 'BookOpen'],
    ['Form Input', null, 'FilePen'],
    ['Form Monitoring dan Evaluasi', null, 'Activity'],
    ['Visualisasi', null, 'ChartPie'],
    ['Miscellaneous', null, 'LayoutGrid'],
    ['Access', null, 'KeyRound'],
    ['Utilities', null, 'Wrench'],
    ['Settings', null, 'Settings2'],
    ['Permissions', 'Access', 'ShieldCheck'],
    ['Roles', 'Access', 'UserCog'],
    ['Troubleshoot', 'Utilities', 'LifeBuoy'],
    ['Rekap Lapor Kejadian Risiko', 'Utilities', 'ListChecks'],
    ['App Settings', 'Settings', 'SlidersHorizontal'],
    ['Backup', 'Settings', 'DatabaseBackup'],
    ['Keterangan Pendukung', 'Settings', 'BookMarked'],
    ['Menu Manager', 'Settings', 'ListTree'],
    ['PKPT Berbasis Risiko', 'Miscellaneous', 'CalendarRange'],
    ['Hirarki', 'Visualisasi', 'Network'],
];
$n = 0;
foreach ($peta as [$judul, $induk, $ikon]) {
    $q = App\Models\Menu::where('title', $judul);
    $q = $induk ? $q->whereIn('parent_id', App\Models\Menu::where('title', $induk)->whereNull('parent_id')->pluck('id')) : $q->whereNull('parent_id');
    $n += $q->update(['icon' => $ikon]);
}
echo "ikon diperbarui: {$n}".PHP_EOL;
