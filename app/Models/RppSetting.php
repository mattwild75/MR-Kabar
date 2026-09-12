<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RppSetting extends Model
{
    protected $fillable = ['tarif_per_hari'];

    public static function current(): self
    {
        return static::firstOrCreate([]);
    }

    /**
     * Penanda tangan seluruh dokumen RPP hanya Inspektur — pegawai yang
     * jabatannya "Inspektur" di daftar pegawai ERPIKA, bukan pilihan.
     */
    public static function inspektur(): ?Employee
    {
        return Employee::where('jabatan', 'Inspektur')->orderBy('id')->first();
    }
}
