<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Kamus Risiko Kecurangan — daftar risiko baku yang boleh dipungut PIC.
 *
 * Dua sumber: 165 butir Referensi MCP KPK 2025 (13 area, dari Format Kertas
 * Kerja FRA) dan kamus risiko per tahapan pada pedoman.
 *
 * Gunanya bukan sekadar mempercepat pengetikan: tanpa kamus, 49 OPD merumuskan
 * sendiri risiko yang sebenarnya sama, dan register gabungannya tidak bisa
 * dihitung lintas OPD.
 */
class FraudKamusRisiko extends Model
{
    protected $table = 'fraud_kamus_risiko';

    protected $guarded = ['id'];
}
