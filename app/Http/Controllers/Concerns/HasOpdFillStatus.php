<?php

namespace App\Http\Controllers\Concerns;

use App\Models\Opd;

/**
 * Ringkasan jumlah baris terisi per OPD utk halaman IRS Pemda/IRS PD/IRO PD
 * (punya kolom "ENTITAS PD YANG MENILAI") dan KRS PD/KRO PD (dikelompokkan
 * lewat "OPD PENANGGUNGJAWAB PROGRAM"/hierarki, ditangani terpisah lewat
 * opdFillStatusByColumn()). Basisnya SENGAJA bukan opd_id akun PIC yang
 * login/menyimpan baris — tapi OPD yang secara resmi tercatat menilai
 * risiko itu (sesuai Perdep PPKD No.4/2019, OPD penilai = OPD yang mengisi),
 * supaya kalau PIC keliru pilih/lupa isi field ini, statusnya juga
 * mencerminkan ketidaksesuaian itu, bukan disamarkan oleh akun login.
 * Dipakai Admin/Super Admin (yang melihat data semua OPD) utk tahu OPD mana
 * yang sudah/belum mengisi tanpa perlu memfilter satu-satu. Halaman KRS
 * Pemda SENGAJA tidak memakai ini — datanya bukan milik per-OPD/PIC (diisi
 * terpusat oleh admin sebagai satu himpunan RPJMD Pemda).
 */
trait HasOpdFillStatus
{
    /**
     * @param  class-string  $model  Model Eloquent dengan kolom teks OPD.
     * @param  string  $column  Nama kolom berisi nama OPD (mis. "ENTITAS PD YANG MENILAI").
     */
    private function opdFillStatusByColumn(string $model, string $column): array
    {
        $counts = $model::query()
            ->selectRaw("`{$column}` as opd_nama, count(*) as jumlah")
            ->groupBy($column)
            ->pluck('jumlah', 'opd_nama');

        if ($counts->isEmpty()) {
            return [];
        }

        // Cocokkan case-insensitive supaya variasi kapitalisasi teks isian
        // (mis. "Dinas Sosial" vs "DINAS SOSIAL") tetap terhitung ke OPD
        // yang sama — sama seperti masalah casefold yang pernah ditemukan
        // pada join Sasaran/Kegiatan lain di aplikasi ini.
        $opdIdByNama = Opd::query()->pluck('id', 'nama')
            ->mapWithKeys(fn ($id, $nama) => [mb_strtolower(trim($nama)) => $id]);

        $result = [];
        foreach ($counts as $namaOpd => $jumlah) {
            $key = mb_strtolower(trim((string) $namaOpd));
            $opdId = $opdIdByNama[$key] ?? null;
            if ($opdId === null) {
                continue;
            }
            $result[$opdId] = [
                'jumlah_baris' => ($result[$opdId]['jumlah_baris'] ?? 0) + $jumlah,
                'sudah_mulai' => true,
            ];
        }

        return $result;
    }
}
