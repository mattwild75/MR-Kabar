<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TroubleshootReport extends Model
{
    protected $fillable = [
        'user_id',
        'subject',
        'category',
        'description',
        'status',
    ];

    /**
     * Pilihan tetap kategori & status — dipakai untuk validasi di controller
     * dan sebagai sumber opsi dropdown di frontend, supaya konsisten.
     */
    public const CATEGORIES = ['bug', 'error', 'saran', 'lainnya'];

    public const STATUSES = ['baru', 'diproses', 'selesai'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
