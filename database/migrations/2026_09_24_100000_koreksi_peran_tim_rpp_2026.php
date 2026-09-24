<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Koreksi peran tim RPP tahun 2026 yang bergeser saat impor dari ERPIKA lama.
 *
 * Berkas RPP Bagian Perencanaan tahun 2026 memakai LIMA peran (Penanggung
 * Jawab, Wakil Penanggung Jawab, Pengendali Teknis, Ketua Tim, Anggota Tim),
 * sedangkan importer lama memetakan berdasarkan urutan baris untuk format
 * EMPAT peran (PJ, PPJ, Ketua Tim, Anggota). Akibatnya Pengendali Teknis
 * tersimpan sebagai `kt` dan Ketua Tim yang sebenarnya tergeser menjadi `at`
 * pertama. Diverifikasi terhadap berkas sumber (RPP Reviu/Evaluasi/Ketaatan/
 * Dana Desa/Pengawasan Pemda 2026): 37 dari 37 penugasan yang tercocokkan
 * mengikuti pola ini, dan seluruh 106 blok tim sumber 2026 punya Pengendali
 * Teknis tersendiri. Tahun 2025 ke bawah (format empat peran) tidak disentuh.
 *
 * Tiap perubahan dicatat di `rpp_koreksi_peran` sehingga down() memulihkan
 * peran lama persis.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rpp_koreksi_peran', function (Blueprint $t) {
            $t->id();
            $t->unsignedBigInteger('rpp_team_member_id')->index();
            $t->unsignedBigInteger('rpp_penugasan_id')->index();
            $t->string('role_lama', 20);
            $t->string('role_baru', 20);
            $t->string('alasan', 190);
            $t->timestamps();
        });

        $catat = function (object $m, string $baru, string $alasan): void {
            DB::table('rpp_koreksi_peran')->insert([
                'rpp_team_member_id' => $m->id,
                'rpp_penugasan_id' => $m->rpp_penugasan_id,
                'role_lama' => $m->role,
                'role_baru' => $baru,
                'alasan' => $alasan,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            DB::table('rpp_team_members')->where('id', $m->id)->update(['role' => $baru]);
        };

        $penugasan = DB::table('rpp_penugasan as p')
            ->join('rpps as r', 'r.id', '=', 'p.rpp_id')
            ->where('r.year', 2026)
            ->pluck('p.id');

        foreach ($penugasan as $pid) {
            $tim = DB::table('rpp_team_members')->where('rpp_penugasan_id', $pid)->orderBy('order')->orderBy('id')->get();
            // Sudah punya Pengendali Teknis (diisi lewat formulir) — biarkan.
            if ($tim->contains('role', 'dalnis')) {
                continue;
            }
            $kt = $tim->firstWhere('role', 'kt');
            $at = $tim->firstWhere('role', 'at');
            if (! $kt || ! $at) {
                continue;
            }
            $catat($kt, 'dalnis', 'Impor 2026: Pengendali Teknis tersimpan sebagai Ketua Tim');
            $catat($at, 'kt', 'Impor 2026: Ketua Tim tersimpan sebagai Anggota Tim');
        }

        // Berkas sumber mencantumkan DUA Ketua Tim pada ST-04/EV-INS/2026.
        $p = DB::table('rpp_penugasan')->where('nomor_st', 'ST-04/EV-INS/2026')->value('id');
        if ($p) {
            $m = DB::table('rpp_team_members')->where('rpp_penugasan_id', $p)->where('role', 'at')->where('nama', 'like', 'Cut Tara%')->first();
            if ($m) {
                $catat($m, 'kt', 'Berkas sumber: Ketua Tim kedua');
            }
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('rpp_koreksi_peran')) {
            foreach (DB::table('rpp_koreksi_peran')->orderByDesc('id')->get() as $k) {
                DB::table('rpp_team_members')->where('id', $k->rpp_team_member_id)->update(['role' => $k->role_lama]);
            }
        }
        Schema::dropIfExists('rpp_koreksi_peran');
    }
};
