<?php

namespace App\Http\Controllers;

use App\Models\RiskExcelImportRequest;
use App\Models\User;
use App\Notifications\RiskExcelImportRequestReviewed;
use App\Notifications\RiskExcelImportRequestSubmitted;
use App\Services\Excel\RiskExcelExportService;
use App\Services\Excel\RiskExcelImportService;
use App\Support\RiskExcelRegistry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Reader\Exception as SpreadsheetReaderException;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

/**
 * Ekspor/Impor Excel seluruh Form Input (Settings > Backup > Excel) —
 * admin/super-admin only, satu file .xlsx multi-tab mencakup semua modul
 * terdaftar di RiskExcelRegistry. Lihat RiskExcelExportService &
 * RiskExcelImportService utk logika sesungguhnya; controller ini hanya
 * menggerbang otorisasi & menjembatani request/response.
 *
 * IMPOR (bukan ekspor/template) memakai alur persetujuan: kalau yang
 * mengimpor adalah admin biasa, file DITAHAN sebagai RiskExcelImportRequest
 * (status pending) — tidak langsung menulis ke DB — sampai super-admin
 * menyetujui (approve()) atau menolak (reject()). Kalau super-admin sendiri
 * yang mengimpor, tetap langsung diproses seperti sebelumnya (tidak pernah
 * membuat baris pending, tidak perlu menyetujui dirinya sendiri).
 */
class RiskExcelController extends Controller
{
    private function isAdmin(): bool
    {
        return auth()->user()?->hasAnyRole(['admin', 'super-admin']) ?? false;
    }

    /**
     * Lapis kedua di luar permission_name menu — menyetujui/menolak impor
     * adalah aksi tulis-massal ke seluruh data risiko lintas-OPD, jadi
     * dikunci ke role super-admin secara eksplisit di kode. Admin (bahkan
     * pengaju permintaan itu sendiri) tidak boleh menyetujui/menolak
     * permintaan apa pun. Sama pola dengan
     * AuditLogController/BackupController/RoleController/dst.
     */
    private function ensureSuperAdmin(): void
    {
        if (!auth()->user()?->hasRole('super-admin')) {
            abort(403, 'Persetujuan impor Excel hanya dapat dilakukan oleh Super Admin.');
        }
    }

    public function index()
    {
        if (!$this->isAdmin()) {
            abort(403, 'Hanya Admin/Super Admin yang dapat mengakses Ekspor/Impor Excel.');
        }

        $modules = collect(RiskExcelRegistry::modules())->map(fn ($m, $slug) => [
            'slug' => $slug,
            'label' => $m['label'],
            'sheet_name' => $m['sheet_name'],
        ])->values();

        $user = auth()->user();

        // Super-admin melihat SEMUA permintaan pending dari semua admin
        // (perlu ditinjau); admin biasa tidak pernah melihat antrean orang
        // lain — array kosong.
        $pendingRequests = $user->hasRole('super-admin')
            ? RiskExcelImportRequest::with('user:id,name,username')
                ->where('status', 'pending')
                ->latest()
                ->get()
            : collect();

        // Riwayat permintaan milik user yang login sendiri — super-admin yg
        // selalu diproses langsung tidak pernah punya baris di sini, jadi
        // otomatis kosong buat mereka tanpa perlu pengecualian khusus.
        $myRequests = RiskExcelImportRequest::with('reviewer:id,name,username')
            ->where('user_id', $user->id)
            ->latest()
            ->take(20)
            ->get();

        return Inertia::render('backup/Excel', [
            'modules' => $modules,
            'pendingRequests' => $pendingRequests,
            'myRequests' => $myRequests,
        ]);
    }

    public function export(RiskExcelExportService $service)
    {
        if (!$this->isAdmin()) {
            abort(403, 'Hanya Admin/Super Admin yang dapat mengekspor data.');
        }

        set_time_limit(300);

        $spreadsheet = $service->build(includeData: true);
        $filename = 'MR-Kabar-Data-Risiko-' . now()->format('Y-m-d_His') . '.xlsx';

        return $this->streamXlsx($spreadsheet, $filename);
    }

    public function template(RiskExcelExportService $service)
    {
        if (!$this->isAdmin()) {
            abort(403, 'Hanya Admin/Super Admin yang dapat mengunduh template.');
        }

        $spreadsheet = $service->build(includeData: false);
        $filename = 'MR-Kabar-Template-Kosong.xlsx';

        return $this->streamXlsx($spreadsheet, $filename);
    }

    public function import(Request $request, RiskExcelImportService $service)
    {
        if (!$this->isAdmin()) {
            abort(403, 'Hanya Admin/Super Admin yang dapat mengimpor data.');
        }

        $request->validate([
            'file' => ['required', 'file', 'mimes:xlsx', 'max:10240'],
        ]);

        set_time_limit(300);

        $user = $request->user();

        if ($user->hasRole('super-admin')) {
            // Super-admin: langsung diproses, tidak pernah membuat baris
            // permintaan pending — tidak ada yang perlu menyetujui dirinya.
            $result = $service->import($request->file('file'), $user->id);

            return $this->respondWithImportResult($result);
        }

        // Admin biasa: TAHAN dulu — simpan file, jalankan validasi saja
        // (tanpa tulis DB) untuk membuat preview, buat baris pending.
        $uploaded = $request->file('file');

        try {
            $spreadsheet = IOFactory::load($uploaded->getRealPath());
        } catch (SpreadsheetReaderException|\Throwable $e) {
            return redirect()->back()->with('error', 'File tidak dapat dibaca — pastikan file .xlsx tidak rusak dan belum pernah diubah ekstensinya.');
        }

        $v = $service->validate($spreadsheet);

        if (!empty($v['structureErrors'])) {
            $result = ['ok' => false, 'structure_errors' => $v['structureErrors'], 'sheets' => []];

            return $this->respondWithImportResult($result);
        }

        $preview = $service->buildPreview($v['parsedByModule'], $v['reportByModule']);

        $path = $uploaded->store('risk-excel-imports', 'local');

        $importRequest = RiskExcelImportRequest::create([
            'user_id' => $user->id,
            'file_path' => $path,
            'original_filename' => $uploaded->getClientOriginalName(),
            'status' => 'pending',
            'preview_result' => $preview,
        ]);

        Notification::send(
            User::role('super-admin')->get(),
            new RiskExcelImportRequestSubmitted($importRequest),
        );

        return redirect()->back()->with('success', 'File berhasil diupload dan menunggu persetujuan Super Admin.');
    }

    public function approve(RiskExcelImportRequest $importRequest, RiskExcelImportService $service)
    {
        $this->ensureSuperAdmin();

        set_time_limit(300);

        // Kunci baris (SELECT ... FOR UPDATE) di dalam transaction pendek
        // supaya dua klik "Setujui" yang hampir bersamaan (double-klik, atau
        // dua super-admin berbeda) tidak bisa sama-sama lolos pengecekan
        // status "pending" dan memproses permintaan yang sama dua kali —
        // permintaan kedua akan menunggu giliran lock lalu melihat status
        // sudah bukan "pending" lagi setelah lock pertama selesai.
        $claimed = DB::transaction(function () use ($importRequest) {
            $locked = RiskExcelImportRequest::whereKey($importRequest->id)->lockForUpdate()->first();
            if (!$locked || $locked->status !== 'pending') {
                return null;
            }
            // Tandai segera sbg "processing" di dalam lock yg sama supaya
            // request lain yg lolos giliran lock berikutnya langsung lihat
            // status bukan "pending" lagi — tulis DB sesungguhnya (write())
            // tetap terjadi SETELAH transaction pendek ini selesai (butuh
            // waktu lama utk file besar, tidak boleh menahan lock lama).
            $locked->update(['status' => 'processing']);

            return $locked;
        });

        if (!$claimed) {
            return redirect()->back()->with('error', 'Permintaan ini sudah diproses sebelumnya.');
        }

        $fullPath = Storage::disk('local')->path($claimed->file_path);
        if (!Storage::disk('local')->exists($claimed->file_path)) {
            $claimed->update(['status' => 'rejected', 'reviewed_by' => auth()->id(), 'reviewed_at' => now(), 'rejection_reason' => 'File sumber tidak ditemukan lagi di server.']);

            return redirect()->back()->with('error', 'File sumber tidak ditemukan lagi di server — permintaan otomatis ditandai gagal.');
        }

        try {
            $spreadsheet = IOFactory::load($fullPath);
        } catch (\Throwable $e) {
            $claimed->update(['status' => 'rejected', 'reviewed_by' => auth()->id(), 'reviewed_at' => now(), 'rejection_reason' => 'File sumber tidak dapat dibaca ulang (rusak).']);

            return redirect()->back()->with('error', 'File sumber tidak dapat dibaca ulang — permintaan ditolak otomatis.');
        }

        // Validasi ULANG dari file asli (bukan pakai preview lama) — supaya
        // perubahan data induk antara waktu upload & approve (mis. Sasaran
        // yang dirujuk sudah dihapus) tetap tertangkap sebelum ditulis.
        $v = $service->validate($spreadsheet);

        if (!empty($v['structureErrors'])) {
            $claimed->update([
                'status' => 'rejected',
                'reviewed_by' => auth()->id(),
                'reviewed_at' => now(),
                'rejection_reason' => 'Struktur file tidak lagi valid saat divalidasi ulang.',
            ]);
            Storage::disk('local')->delete($claimed->file_path);

            return redirect()->back()->with('error', 'Struktur file tidak lagi valid — permintaan ditolak otomatis.');
        }

        // Ditulis atas nama PENGAJU ASLI (bukan super-admin yang menyetujui)
        // — baris baru tetap dimiliki admin yang mengajukan.
        $result = $service->write($v['parsedByModule'], $v['reportByModule'], $claimed->user_id);

        $claimed->update([
            'status' => 'approved',
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
            'final_result' => $result,
        ]);

        Storage::disk('local')->delete($claimed->file_path);

        $claimed->load(['reviewer:id,name,username', 'user']);
        $claimed->user?->notify(new RiskExcelImportRequestReviewed($claimed));

        $totalInserted = array_sum(array_column($result['sheets'], 'inserted'));
        $totalUpdated = array_sum(array_column($result['sheets'], 'updated'));

        return redirect()->back()->with('success', "Permintaan disetujui: {$totalInserted} baris ditambah, {$totalUpdated} baris diperbarui.");
    }

    public function reject(Request $request, RiskExcelImportRequest $importRequest)
    {
        $this->ensureSuperAdmin();

        $data = $request->validate([
            'rejection_reason' => ['nullable', 'string', 'max:500'],
        ]);

        // Sama pola lock spt approve() — cegah reject dobel/reject setelah
        // approve balapan dari klik ganda atau dua super-admin bersamaan.
        $claimed = DB::transaction(function () use ($importRequest) {
            $locked = RiskExcelImportRequest::whereKey($importRequest->id)->lockForUpdate()->first();
            if (!$locked || $locked->status !== 'pending') {
                return null;
            }

            return $locked;
        });

        if (!$claimed) {
            return redirect()->back()->with('error', 'Permintaan ini sudah diproses sebelumnya.');
        }

        $claimed->update([
            'status' => 'rejected',
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
            'rejection_reason' => $data['rejection_reason'] ?? null,
        ]);

        Storage::disk('local')->delete($claimed->file_path);

        $claimed->load(['reviewer:id,name,username', 'user']);
        $claimed->user?->notify(new RiskExcelImportRequestReviewed($claimed));

        return redirect()->back()->with('success', 'Permintaan impor ditolak.');
    }

    private function respondWithImportResult(array $result)
    {
        if (!$result['ok']) {
            return redirect()->back()->with('error', 'File ditolak — struktur/format tidak sesuai.')->with('importResult', $result);
        }

        $totalInserted = array_sum(array_column($result['sheets'], 'inserted'));
        $totalUpdated = array_sum(array_column($result['sheets'], 'updated'));
        $totalErrors = array_sum(array_column($result['sheets'], 'error_count'));

        $message = "Impor selesai: {$totalInserted} baris ditambah, {$totalUpdated} baris diperbarui";
        $message .= $totalErrors > 0 ? ", {$totalErrors} baris dilewati (error)." : '.';

        return redirect()->back()
            ->with('success', $message)
            ->with('importResult', $result);
    }

    private function streamXlsx($spreadsheet, string $filename)
    {
        return response()->streamDownload(function () use ($spreadsheet) {
            $writer = new Xlsx($spreadsheet);
            $writer->save('php://output');
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }
}
