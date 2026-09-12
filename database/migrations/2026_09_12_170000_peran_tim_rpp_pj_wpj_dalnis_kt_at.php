<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Peran dalam tim penugasan mengikuti susunan baku APIP (arahan 12 September
 * 2026): Penanggung Jawab (PJ), Wakil Penanggung Jawab (WPJ), Pengendali
 * Teknis (Dalnis), Ketua Tim (KT), Anggota Tim (AT).
 *
 * Pemetaan data lama: penanggung_jawab/koordinator -> pj; ppj -> wpj (di
 * berkas asli "PPJ/Pengendali Teknis" dijabat Inspektur Pembantu selaku wakil
 * penanggung jawab; label cetak lamanya tersimpan di peran_teks sehingga
 * cetakan lama tidak berubah); ketua_tim -> kt; anggota_tim -> at.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE rpp_team_members MODIFY role VARCHAR(20) NOT NULL');
        DB::table('rpp_team_members')->whereIn('role', ['penanggung_jawab', 'koordinator'])->update(['role' => 'pj']);
        DB::table('rpp_team_members')->where('role', 'ppj')->whereNull('peran_teks')->update(['role' => 'wpj', 'peran_teks' => 'PPJ/Pengendali Teknis']);
        DB::table('rpp_team_members')->where('role', 'ppj')->update(['role' => 'wpj']);
        DB::table('rpp_team_members')->where('role', 'ketua_tim')->update(['role' => 'kt']);
        DB::table('rpp_team_members')->where('role', 'anggota_tim')->update(['role' => 'at']);
        DB::statement("ALTER TABLE rpp_team_members MODIFY role ENUM('pj','wpj','dalnis','kt','at') NOT NULL");
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE rpp_team_members MODIFY role VARCHAR(20) NOT NULL');
        DB::table('rpp_team_members')->where('role', 'pj')->update(['role' => 'penanggung_jawab']);
        DB::table('rpp_team_members')->whereIn('role', ['wpj', 'dalnis'])->update(['role' => 'ppj']);
        DB::table('rpp_team_members')->where('role', 'kt')->update(['role' => 'ketua_tim']);
        DB::table('rpp_team_members')->where('role', 'at')->update(['role' => 'anggota_tim']);
        DB::statement("ALTER TABLE rpp_team_members MODIFY role ENUM('penanggung_jawab','koordinator','ppj','ketua_tim','anggota_tim') NOT NULL");
    }
};
