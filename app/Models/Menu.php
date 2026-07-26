<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Menu extends Model
{
    protected $fillable = [
        'title',
        'icon',
        'route',
        'parent_id',
        'order',
        'permission_name',
    ];

    /**
     * Relasi menu anak (nested menu)
     */
    public function children(): HasMany
    {
        return $this->hasMany(Menu::class, 'parent_id')
            ->with('children')
            ->orderBy('order');
    }

    /**
     * Relasi menu induk (jika nested)
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Menu::class, 'parent_id');
    }

    /**
     * Scope: hanya menu root (tanpa parent)
     */
    public function scopeRoot($query)
    {
        return $query->whereNull('parent_id');
    }
}
