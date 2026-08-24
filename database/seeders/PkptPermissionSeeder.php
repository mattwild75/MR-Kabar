<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

/**
 * Permission dan peran untuk PKPT Berbasis Risiko.
 *
 * SEEDER TERPISAH, bukan tambahan di RolePermissionSeeder. Modul PKPT
 * dirancang supaya tidak mengubah satu berkas pun milik MR Kabar; ini salah
 * satu tempat janji itu ditepati.
 *
 * KENAPA BERPAGAR PERMISSION, PADAHAL MENU RISIKO TIDAK. Seluruh menu Form
 * Input/Monitoring/Cetak MR Kabar sengaja fail-open (permission_name kosong)
 * karena setiap PIC OPD memang harus bisa membukanya. PKPT kebalikannya:
 * isinya penilaian Inspektorat atas OPD lain, termasuk kolom potensi
 * kecurangan dan kasus hukum. Ini satu-satunya kelompok menu data di aplikasi
 * ini yang default-deny, dan itu disengaja.
 */
class PkptPermissionSeeder extends Seeder
{
    public const GRUP = 'PKPT Berbasis Risiko';

    /** Yang boleh dilakukan peran apip: mengisi dan menghitung, tidak menetapkan. */
    public const IZIN_APIP = [
        'pkpt-view',
        'pkpt-input',
        'pkpt-hitung',
        'pkpt-rencana',
    ];

    /**
     * Menetapkan periode dan mengubah bobot hanya untuk admin dan
     * super-admin: keduanya menyangkut angka yang tercantum dalam Keputusan
     * Inspektur, bukan pekerjaan harian.
     */
    public const IZIN_PIMPINAN = [
        'pkpt-tetapkan',
        'pkpt-pengaturan',
    ];

    public function run(): void
    {
        $semua = [...self::IZIN_APIP, ...self::IZIN_PIMPINAN];

        foreach ($semua as $nama) {
            Permission::firstOrCreate(['name' => $nama, 'group' => self::GRUP]);
        }

        // Peran apip — pegawai Inspektorat yang mengerjakan PKPT.
        $apip = Role::firstOrCreate(['name' => 'apip']);
        foreach (self::IZIN_APIP as $nama) {
            $izin = Permission::where('name', $nama)->first();
            if ($izin && ! $apip->hasPermissionTo($izin)) {
                $apip->givePermissionTo($izin);
            }
        }

        // Admin memperoleh seluruhnya. super-admin tidak perlu assignment
        // eksplisit: Gate::before di AuthServiceProvider membuatnya lolos
        // semua pengecekan.
        $admin = Role::firstOrCreate(['name' => 'admin']);
        foreach ($semua as $nama) {
            $izin = Permission::where('name', $nama)->first();
            if ($izin && ! $admin->hasPermissionTo($izin)) {
                $admin->givePermissionTo($izin);
            }
        }

        // Peran apip juga memperoleh SELURUH permission yang dipunyai admin,
        // supaya cakupan bacanya di MR Kabar sama luas dengan akun peninjau —
        // Dasbor, Form Input, Monitoring, Cetak, Visualisasi, Keterangan
        // Pendukung, File Manager, dan Users.
        //
        // Itu memang yang dibutuhkan: bahan perencanaan pengawasan adalah
        // seluruh data risiko lintas-OPD, dan APIP yang hanya bisa membuka
        // menu PKPT akan menyusun peringkat tanpa pernah melihat register yang
        // diperingkatnya.
        //
        // Yang menahan hak tulisnya BUKAN permission melainkan middleware
        // ViewerReadOnly, yang menolak seluruh POST/PUT/PATCH/DELETE di luar
        // rute pkpt.*. Daftar admin sendiri sudah tidak memuat permission
        // khusus super-admin, jadi Permissions, Roles, Menu Manager, Backup,
        // dan Audit Logs tetap tertutup.
        // Dibaca ulang dari basis data, bukan dari relasi yang mungkin sudah
        // termuat sebelum baris-baris di atas ditambahkan.
        foreach ($admin->permissions()->get() as $izin) {
            if (in_array($izin->name, self::IZIN_PIMPINAN, true)) {
                continue;
            }
            if (! $apip->hasPermissionTo($izin)) {
                $apip->givePermissionTo($izin);
            }
        }

        // Menetapkan periode dan mengubah bobot dicabut PALING AKHIR, sesudah
        // pencerminan — kalau dicabut lebih dahulu, pencerminan dari admin
        // akan mengembalikannya dan pemisahan perannya hilang tanpa suara.
        foreach (self::IZIN_PIMPINAN as $nama) {
            $izin = Permission::where('name', $nama)->first();
            if ($izin && $apip->hasPermissionTo($izin)) {
                $apip->revokePermissionTo($izin);
            }
        }

        // Peninjau mengikuti pola yang sudah berlaku di RolePermissionSeeder:
        // melihat sebanyak yang bisa dilihat admin, sedangkan larangan
        // menulisnya datang dari middleware ViewerReadOnly, bukan dari
        // permission.
        $eksekutif = Role::where('name', 'eksekutif')->first();
        if ($eksekutif) {
            foreach ($semua as $nama) {
                $izin = Permission::where('name', $nama)->first();
                if ($izin && ! $eksekutif->hasPermissionTo($izin)) {
                    $eksekutif->givePermissionTo($izin);
                }
            }
        }
    }
}
