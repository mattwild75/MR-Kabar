<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

/**
 * Notifikasi in-app (ikon lonceng di kanan atas) — dipakai SELURUH user,
 * bukan cuma admin. Sumbernya alur persetujuan impor Excel (lihat
 * App\Notifications\RiskExcelImportRequestSubmitted/Reviewed), disimpan
 * lewat channel `database` bawaan Laravel (Notifiable trait di User).
 * Query selalu discope ke user yang login — tidak ada cara melihat
 * notifikasi user lain lewat controller ini.
 */
class NotificationController extends Controller
{
    /**
     * Daftar notifikasi terbaru (dipakai isi dropdown lonceng) — dibatasi
     * jumlahnya krn ini bukan halaman arsip, cukup untuk tinjauan cepat.
     */
    public function index(Request $request)
    {
        $notifications = $request->user()
            ->notifications()
            ->latest()
            ->take(30)
            ->get()
            ->map(fn ($n) => [
                'id' => $n->id,
                'data' => $n->data,
                'read_at' => $n->read_at,
                'created_at' => $n->created_at,
            ]);

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $request->user()->unreadNotifications()->count(),
        ]);
    }

    public function markRead(Request $request, string $id)
    {
        $notification = $request->user()->notifications()->whereKey($id)->first();
        $notification?->markAsRead();

        return back();
    }

    public function markAllRead(Request $request)
    {
        $request->user()->unreadNotifications()->update(['read_at' => now()]);

        return back();
    }
}
