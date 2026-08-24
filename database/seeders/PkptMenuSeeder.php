<?php

namespace Database\Seeders;

use App\Models\Menu;
use Illuminate\Database\Seeder;

/**
 * Menu PKPT Berbasis Risiko, seluruhnya di bawah Miscellaneous.
 *
 * SEEDER TERPISAH, bukan tambahan di MenuSeeder. Selain menepati janji tidak
 * mengubah berkas MR Kabar, ini juga menghindari jebakan yang sudah tercatat
 * di kepala MenuSeeder: menjalankan seeder itu menimpa nilai order menu
 * top-level. Seeder ini tidak menyentuh satu pun menu top-level — ia hanya
 * menempel di bawah Miscellaneous yang sudah ada.
 *
 * SELURUH menu di sini berpagar permission, berbeda dari menu risiko yang
 * fail-open. Yang dipakai pkpt-view untuk hampir semuanya, sehingga membuka
 * halaman butuh satu izin saja; larangan MENULIS ditegakkan di controller,
 * mengikuti pola yang sudah berlaku di aplikasi ini. Pengaturan PPBR
 * pengecualiannya, karena halaman itu sendiri memang milik pimpinan.
 */
class PkptMenuSeeder extends Seeder
{
    public function run(): void
    {
        $misc = Menu::firstOrCreate(
            ['title' => 'Miscellaneous', 'parent_id' => null],
            ['icon' => 'MoreHorizontal', 'route' => '#', 'order' => 7, 'permission_name' => null]
        );

        $akar = $this->grup('PKPT Berbasis Risiko', $misc->id, 'ClipboardList', 3);

        $this->daun('/pkpt', 'Ikhtisar dan Periode', $akar->id, 'LayoutDashboard', 1);

        $input = $this->grup('Form Input', $akar->id, 'PencilLine', 2);
        $this->daun('/pkpt/peta-auditan', '1_Peta Auditan', $input->id, 'Map', 1);
        $this->daun('/pkpt/evaluasi-register', '2_Evaluasi Register Risiko', $input->id, 'SearchCheck', 2);
        $this->daun('/pkpt/kematangan-mr', '3_Kematangan MR dan Bobot', $input->id, 'Gauge', 3);
        $this->daun('/pkpt/faktor-risiko', '4_Faktor Risiko', $input->id, 'SlidersHorizontal', 4);
        $this->daun('/pkpt/penugasan-wajib', '5_Penugasan Wajib', $input->id, 'Gavel', 5);

        $hitung = $this->grup('Form Perhitungan', $akar->id, 'Calculator', 3);
        $this->daun('/pkpt/total-nilai', '6_Total Nilai Risiko', $hitung->id, 'Sigma', 1);
        $this->daun('/pkpt/peringkat', '7_Peringkat dan Frekuensi', $hitung->id, 'ListOrdered', 2);

        $rencana = $this->grup('Form Rencana', $akar->id, 'CalendarRange', 4);
        $this->daun('/pkpt/jakwas', '8_Kebijakan Pengawasan', $rencana->id, 'Compass', 1);
        $this->daun('/pkpt/program-kerja', '9_Program Kerja Tahunan', $rencana->id, 'CalendarCheck', 2);

        $this->formCetak($akar->id);

        $this->daun('/pkpt/pengaturan', 'Pengaturan PPBR', $akar->id, 'Settings2', 6, 'pkpt-pengaturan');
    }

    private function formCetak(int $akarId): void
    {
        $cetak = $this->grup('Form Cetak', $akarId, 'Printer', 5);

        $strategis = $this->grup('Perencanaan Strategis', $cetak->id, 'Milestone', 1);
        $this->daun('/pkpt/cetak/f1', 'F1_Peta Auditan', $strategis->id, 'Map', 1);
        $this->daun('/pkpt/cetak/f2', 'F2_Evaluasi Register Risiko', $strategis->id, 'SearchCheck', 2);
        $this->daun('/pkpt/cetak/f3', 'F3_Kematangan MR dan Bobot', $strategis->id, 'Gauge', 3);

        $faktor = $this->grup('Faktor Risiko', $cetak->id, 'SlidersHorizontal', 2);
        $this->daun('/pkpt/cetak/f4', 'F4_Anggaran', $faktor->id, 'Wallet', 1);
        $this->daun('/pkpt/cetak/f5', 'F5_RPJMD, RPJMN, dan Sektor Unggulan', $faktor->id, 'Landmark', 2);
        $this->daun('/pkpt/cetak/f6', 'F6_Temuan dan Tindak Lanjut', $faktor->id, 'FileWarning', 3);
        $this->daun('/pkpt/cetak/f7', 'F7_Isu Terkini', $faktor->id, 'Megaphone', 4);
        $this->daun('/pkpt/cetak/f8', 'F8_Pertimbangan Lain', $faktor->id, 'History', 5);

        $prioritas = $this->grup('Prioritas dan Rencana', $cetak->id, 'Trophy', 3);
        $this->daun('/pkpt/cetak/f9', 'F9_Total Nilai Risiko', $prioritas->id, 'Sigma', 1);
        $this->daun('/pkpt/cetak/f10', 'F10_Peringkat 5 Tahun', $prioritas->id, 'ListOrdered', 2);
        $this->daun('/pkpt/cetak/f11', 'F11_Penugasan Wajib', $prioritas->id, 'Gavel', 3);
        $this->daun('/pkpt/cetak/f12', 'F12_Tidak Dimuat dalam PKPT', $prioritas->id, 'FileX', 4);
        $this->daun('/pkpt/cetak/f13', 'F13_Usulan Jakwas', $prioritas->id, 'Compass', 5);
        $this->daun('/pkpt/cetak/f14', 'F14_Program Kerja Tahunan', $prioritas->id, 'CalendarCheck', 6);
    }

    /** Menu wadah tanpa halaman sendiri. */
    private function grup(string $judul, int $indukId, string $ikon, int $urutan): Menu
    {
        return Menu::updateOrCreate(
            ['title' => $judul, 'parent_id' => $indukId],
            ['icon' => $ikon, 'route' => '#', 'order' => $urutan, 'permission_name' => 'pkpt-view']
        );
    }

    private function daun(
        string $rute,
        string $judul,
        int $indukId,
        string $ikon,
        int $urutan,
        string $izin = 'pkpt-view'
    ): Menu {
        return Menu::updateOrCreate(
            ['route' => $rute],
            [
                'title' => $judul,
                'parent_id' => $indukId,
                'icon' => $ikon,
                'order' => $urutan,
                'permission_name' => $izin,
            ]
        );
    }
}
