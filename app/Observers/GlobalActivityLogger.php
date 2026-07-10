<?php

namespace App\Observers;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class GlobalActivityLogger
{
    /**
     * Field yang tidak boleh pernah ikut tercatat di audit log walau ada di
     * $fillable/$attributes model — mis. password (walau sudah di-hash,
     * hash tetap tidak seharusnya bocor ke log yang bisa dilihat admin lain)
     * dan token sesi yang bersifat rahasia per perangkat.
     */
    private const SENSITIVE_FIELDS = [
        'password',
        'remember_token',
    ];

    public function created(Model $model)
    {
        $this->logActivity('created', $model, $this->redact($model->getAttributes()));
    }

    public function updated(Model $model)
    {
        $changes = $this->redact($model->getChanges());
        $original = $this->redact(array_intersect_key($model->getOriginal(), $changes));

        $this->logActivity('updated', $model, [
            'old' => $original,
            'attributes' => $changes,
        ]);
    }

    public function deleted(Model $model)
    {
        $this->logActivity('deleted', $model, $this->redact($model->getAttributes()));
    }

    /**
     * Ganti nilai field sensitif dengan placeholder, bukan hapus key-nya —
     * supaya tetap terlihat di log bahwa field itu berubah/ada, tanpa
     * membocorkan nilai aslinya (mis. hash password).
     */
    protected function redact(array $attributes): array
    {
        foreach (self::SENSITIVE_FIELDS as $field) {
            if (array_key_exists($field, $attributes)) {
                $attributes[$field] = '••••••••';
            }
        }

        return $attributes;
    }

    protected function logActivity(string $action, Model $model, array $properties = [])
    {
        // Hindari log untuk tabel activity_log itu sendiri
        if ($model->getTable() === 'activity_log') return;

        activity('global')
            ->causedBy(Auth::user())
            ->performedOn($model)
            ->withProperties($properties)
            ->log("{$action} " . class_basename($model));
    }
}
