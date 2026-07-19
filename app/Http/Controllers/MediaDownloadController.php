<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * Satu-satunya jalur RESMI utk mengunduh/melihat file media (File Manager
 * "Utilities > File Manager" & Bukti Dukung Risiko IRS/IRO/Form 8-9) —
 * dibuat SETELAH audit keamanan menemukan file tersimpan di disk 'public'
 * bisa diakses SIAPA PUN (termasuk anonim) lewat URL /storage/{id}/{nama}
 * yang bisa ditebak/diurutkan, karena Spatie MediaLibrary men-generate URL
 * langsung ke file fisik di disk publik — otorisasi di RiskEvidenceController
 * & UserFileController HANYA melindungi endpoint listing/hapus (API JSON),
 * TIDAK melindungi byte file itu sendiri begitu URL-nya diketahui.
 *
 * Perbaikan: MEDIA_DISK dipindah ke 'local' (private, TIDAK ter-mount ke
 * /storage), dan SATU-SATUNYA cara membaca isi file adalah lewat route ini
 * (`GET /media/{media}/download`), yang mereplikasi PERSIS aturan
 * kepemilikan yang sudah ada di kedua controller sumber sebelum men-stream
 * filenya lewat Laravel (bukan diserve langsung oleh web server).
 */
class MediaDownloadController extends Controller
{
    public function __invoke(Request $request, Media $media)
    {
        $this->ensureCanAccess($request, $media);

        return response()->file($media->getPath(), [
            'Content-Type' => $media->mime_type,
            'Content-Disposition' => 'inline; filename="' . $media->file_name . '"',
            // Cegah MIME sniffing browser — file di-serve inline, jangan
            // biarkan browser menebak tipe lain (mis. eksekusi HTML/JS).
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }

    /**
     * Mereplikasi aturan otorisasi dari 2 sumber:
     * - RiskEvidenceController: pemilik media (User) = pemilik risiko/RTP,
     *   custom_properties.source_model/source_id menautkan ke baris terkait
     *   — tapi kepemilikan FILE itu sendiri (siapa boleh lihat) cukup
     *   "media ini milik user mana", sama seperti aturan File Manager biasa.
     * - UserFileController: Folder Umum (shared) longgar (siapa saja login
     *   boleh lihat file APPROVED, uploader boleh lihat file pending
     *   miliknya sendiri), folder pribadi hanya pemilik + admin/super-admin
     *   (dgn larangan admin biasa mengintip milik super-admin).
     */
    private function ensureCanAccess(Request $request, Media $media): void
    {
        $requester = $request->user();
        $owner = $media->model instanceof User ? $media->model : null;

        if (!$owner) {
            // Media tidak bermodel User (mis. milik model lain di masa
            // depan) — default tolak, tidak ada aturan kepemilikan yg jelas.
            abort(403, 'Anda tidak memiliki izin untuk mengakses file ini.');
        }

        $isAdminOrSuperAdmin = $requester->hasAnyRole(['admin', 'super-admin']);
        $isSharedFolderFile = $owner->id === User::sharedFolderOwner()->id;

        if ($isSharedFolderFile) {
            $approvalStatus = $media->getCustomProperty('approval_status', 'approved');
            $uploaderId = (int) $media->getCustomProperty('uploader_id', 0);

            if ($approvalStatus === 'approved' || $isAdminOrSuperAdmin || $uploaderId === $requester->id) {
                return;
            }

            abort(403, 'File ini belum disetujui.');
        }

        if ($owner->id === $requester->id) {
            return;
        }

        if ($isAdminOrSuperAdmin) {
            // Admin (bukan super-admin) tidak boleh melihat file milik
            // super-admin — sama persis aturan UserFileController::destroy().
            if (!$requester->hasRole('super-admin') && $owner->hasRole('super-admin')) {
                abort(403, 'Admin tidak dapat mengakses file milik Super Admin.');
            }

            return;
        }

        abort(403, 'Anda tidak memiliki izin untuk mengakses file ini.');
    }
}
