<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('risk_excel_import_requests', function (Blueprint $table) {
            // 'admin' = alur lama (6 modul, submitter admin/super-admin,
            // approver super-admin-only). 'pic_opd' = alur baru (3 modul
            // KRS Pemda/KRS PD/KRO PD, submitter PIC OPD role 'user',
            // approver admin ATAU super-admin). Dipakai membedakan baris
            // request mana yang boleh diproses controller mana — bukan
            // di-infer dari role submitter krn role bisa berubah setelah
            // request dibuat, sedangkan makna request itu sendiri tidak.
            $table->string('scope')->default('admin')->after('user_id');
        });
    }

    public function down(): void
    {
        Schema::table('risk_excel_import_requests', function (Blueprint $table) {
            $table->dropColumn('scope');
        });
    }
};
