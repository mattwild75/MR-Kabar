<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Spatie\Activitylog\Models\Activity;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        // Lapis kedua di luar permission_name menu — audit log dianggap data
        // sensitif (bisa memuat jejak seluruh aktivitas semua pengguna), jadi
        // dikunci ke role super-admin secara eksplisit di kode, tidak hanya
        // bergantung pada assignment permission yang bisa berubah lewat UI
        // Permission Management.
        if (!Auth::user()?->hasRole('super-admin')) {
            throw new AccessDeniedHttpException('Audit log hanya dapat diakses oleh Super Admin.');
        }

        $query = Activity::with('causer')->orderByDesc('created_at');

        if ($subjectType = $request->string('subject_type')->toString()) {
            $query->where('subject_type', $subjectType);
        }

        if ($causerId = $request->string('causer_id')->toString()) {
            $query->where('causer_id', $causerId);
        }

        if ($event = $request->string('event')->toString()) {
            $query->where('description', 'like', "{$event}%");
        }

        if ($dateFrom = $request->string('date_from')->toString()) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }

        if ($dateTo = $request->string('date_to')->toString()) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        if ($search = $request->string('search')->toString()) {
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                    ->orWhere('properties', 'like', "%{$search}%");
            });
        }

        $logs = $query->paginate(20)->withQueryString();

        return Inertia::render('auditlogs/Index', [
            'logs' => $logs,
            'filters' => $request->only(['subject_type', 'causer_id', 'event', 'date_from', 'date_to', 'search']),
            'filterOptions' => [
                'subjectTypes' => $this->distinctSubjectTypes(),
                'events' => ['created', 'updated', 'deleted'],
                'users' => User::orderBy('name')->get(['id', 'name']),
            ],
        ]);
    }

    private function distinctSubjectTypes(): array
    {
        return Activity::query()
            ->whereNotNull('subject_type')
            ->distinct()
            ->orderBy('subject_type')
            ->pluck('subject_type')
            ->map(fn ($type) => [
                'value' => $type,
                'label' => class_basename($type),
            ])
            ->values()
            ->all();
    }
}
