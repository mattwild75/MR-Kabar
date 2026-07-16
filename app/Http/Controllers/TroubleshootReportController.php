<?php

namespace App\Http\Controllers;

use App\Models\TroubleshootReport;
use App\Models\User;
use App\Notifications\TroubleshootReportStatusChanged;
use App\Notifications\TroubleshootReportSubmitted;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class TroubleshootReportController extends Controller
{
    /**
     * Rekapan laporan — hanya admin/super-admin. Lapis kedua di luar
     * permission_name menu (mengikuti pola AuditLogController): data laporan
     * bisa memuat keluhan/temuan sensitif, jadi dikunci ke role secara
     * eksplisit di kode, tidak hanya bergantung assignment permission.
     */
    public function index(Request $request)
    {
        $this->ensureCanView($request);

        $query = TroubleshootReport::with('user')->latest();

        if ($status = $request->string('status')->toString()) {
            $query->where('status', $status);
        }

        if ($category = $request->string('category')->toString()) {
            $query->where('category', $category);
        }

        if ($search = $request->string('search')->toString()) {
            $query->where(function ($q) use ($search) {
                $q->where('subject', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $reports = $query->paginate(15)->withQueryString();

        // Format created_at jadi string siap-tampil (paginator tetap membawa
        // meta links/current_page/last_page/total untuk pagination di frontend).
        $reports->getCollection()->transform(function (TroubleshootReport $r) {
            return [
                'id' => $r->id,
                'subject' => $r->subject,
                'category' => $r->category,
                'description' => $r->description,
                'status' => $r->status,
                'created_at' => $r->created_at->locale('id')->translatedFormat('d F Y H:i'),
                'user' => $r->user ? ['id' => $r->user->id, 'name' => $r->user->name] : null,
            ];
        });

        return Inertia::render('troubleshoot/Index', [
            'reports' => $reports,
            'filters' => $request->only(['status', 'category', 'search']),
            'options' => [
                'categories' => TroubleshootReport::CATEGORIES,
                'statuses' => TroubleshootReport::STATUSES,
            ],
        ]);
    }

    /**
     * Kirim laporan — semua user yang sudah login boleh (form di footer).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'subject'     => ['required', 'string', 'max:255'],
            'category'    => ['required', Rule::in(TroubleshootReport::CATEGORIES)],
            'description' => ['required', 'string', 'max:5000'],
        ]);

        $report = TroubleshootReport::create([
            'user_id'     => $request->user()->id,
            'subject'     => $validated['subject'],
            'category'    => $validated['category'],
            'description' => $validated['description'],
            'status'      => 'baru',
        ]);

        Notification::send(
            User::role(['admin', 'super-admin'])->get(),
            new TroubleshootReportSubmitted($report),
        );

        return back()->with('success', 'Laporan troubleshoot berhasil dikirim. Terima kasih.');
    }

    /**
     * Ubah status laporan — admin/super-admin saja (dari halaman rekapan).
     * Pelapor dinotifikasi balik saat statusnya berubah (mis. "diproses"
     * atau "selesai") — TIDAK ada notifikasi serupa di destroy() karena
     * laporan yg dihapus tidak perlu dikabarkan balik ke pelapor.
     */
    public function updateStatus(Request $request, TroubleshootReport $troubleshoot)
    {
        $this->ensureCanView($request);

        $validated = $request->validate([
            'status' => ['required', Rule::in(TroubleshootReport::STATUSES)],
        ]);

        $troubleshoot->update(['status' => $validated['status']]);

        if ($troubleshoot->user) {
            $troubleshoot->user->notify(new TroubleshootReportStatusChanged($troubleshoot));
        }

        return back()->with('success', 'Status laporan diperbarui.');
    }

    public function destroy(Request $request, TroubleshootReport $troubleshoot)
    {
        $this->ensureCanView($request);

        $troubleshoot->delete();

        return back()->with('success', 'Laporan dihapus.');
    }

    private function ensureCanView(Request $request): void
    {
        if (!$request->user()?->hasAnyRole(['admin', 'super-admin'])) {
            throw new AccessDeniedHttpException('Rekapan troubleshoot hanya dapat diakses oleh Admin/Super Admin.');
        }
    }
}
