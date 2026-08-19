<?php

namespace App\Http\Controllers\Concerns;

use Illuminate\Http\Request;

/**
 * SATU-SATUNYA penjaga akses lintas perangkat daerah.
 *
 * KENAPA HANYA BOLEH ADA SATU. Temuan R-10 audit 17 Agustus 2026 bukan tentang
 * satu controller yang keliru, melainkan tentang polanya: selama penjaga
 * keamanan boleh disalin, perbaikan keamanan akan tertinggal di salah satu
 * salinan dan tidak ada yang menyadarinya sampai ada yang mengaudit. Ramalan
 * itu terbukti dua kali dalam berkas yang sama:
 *
 *   - CetakCeeController menyimpan salinannya sendiri; salinan itu tertinggal
 *     saat yang asli diperbaiki, dan jadi celah KRITIS R-01.
 *   - CeeFormController dan MonitoringEvaluasiController masing-masing juga
 *     menyimpan salinannya, dan KEDUANYA masih memuat bentuk IDOR yang persis
 *     sama — sudah diperbaiki di SharesCetakContext berbulan sebelumnya.
 *
 * Karena itu SharesCetakContext pun kini memakai trait ini, bukan menyimpan
 * salinannya sendiri. Kalau ada penjaga baru dibutuhkan, tambahkan di sini.
 *
 * BENTUK IDOR-NYA, supaya tidak terulang:
 *
 *     if (! $opdId || ! $user->opd_id || $user->canViewAllOpd()) {
 *         return;                     // <- LOLOS
 *     }
 *
 * `! $user->opd_id` menyamakan "belum ditautkan ke perangkat daerah mana pun"
 * dengan "boleh melihat semuanya". Akun PIC yang belum sempat diberi opd_id
 * jadi bisa membuka data perangkat daerah mana saja cukup dengan menempelkan
 * `?opd_id=` di alamatnya. Keanggotaan lintas OPD harus ditentukan oleh PERAN
 * yang diberikan eksplisit, tidak pernah disimpulkan dari kolom yang kosong.
 */
trait MembatasiAksesOpd
{
    /**
     * Menahan akses ke data perangkat daerah yang bukan miliknya.
     *
     * @param  int|null  $opdId  perangkat daerah yang diminta
     * @param  string  $pesan  penjelasan yang pas untuk konteks pemanggil
     * @param  array<int, string>  $peranEkstra  peran yang boleh lintas OPD di
     *                                           luar `canViewAllOpd()`, mis.
     *                                           akun bersama `cee-survey`
     */
    private function tolakOpdLain(
        Request $request,
        ?int $opdId,
        string $pesan = 'Anda hanya dapat mengakses data untuk perangkat daerah Anda sendiri.',
        array $peranEkstra = [],
    ): void {
        $user = $request->user();

        // Satu-satunya jalur lolos yang sah: peran yang memang berhak lintas
        // perangkat daerah. canViewAllOpd() mencakup admin, super-admin, dan
        // peninjau eksekutif; $peranEkstra untuk akun bersama yang memang
        // dirancang dipakai bergantian lintas OPD.
        if ($user->canViewAllOpd() || ($peranEkstra && $user->hasAnyRole($peranEkstra))) {
            return;
        }

        // Dipisah dari pemeriksaan berikutnya supaya pesannya berguna. Akun
        // yang belum ditautkan tidak salah menekan apa pun — ia perlu tahu
        // bahwa yang kurang adalah penautannya, bukan haknya.
        if (! $user->opd_id) {
            abort(403, 'Akun Anda belum ditautkan ke perangkat daerah mana pun. Hubungi Admin untuk menautkannya.');
        }

        if (! $opdId || $opdId !== $user->opd_id) {
            abort(403, $pesan);
        }
    }
}
