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
 * Ekspor/Impor Excel KRS Pemda + KRS PD + KRO PD (Form Input > Ekspor/
 * Impor KRS) — supaya satu kali input Excel bisa langsung menyambungkan
 * ketiga tingkat hierarki (KRS Pemda -> KRS PD -> KRO PD). BERBEDA dari
 * RiskExcelController (Settings > Backup > Excel, admin/super-admin only,
 * 6 modul risiko):
 * - Submitter (ekspor/template/impor) di sini HANYA role PIC OPD — 'user'
 *   ATAU 'admin-instansi'/'admin-inspektorat' (dua role terakhir ini cuma
 *   label penamaan akun PIC lama, hak aksesnya SAMA dgn 'user' — lihat
 *   catatan di PicOpdSeeder.php & MenuSeeder.php baris ~558). Admin/
 *   super-admin punya jalur sendiri di RiskExcelController, TIDAK memakai
 *   controller ini utk keperluan mereka sendiri.
 * - Approver impor: admin ATAU super-admin (bukan super-admin-only spt
 *   RiskExcelController) — beda persyaratan yg dikonfirmasi user.
 * - Cakupan HANYA 3 modul (krs_pemda, krs_pd, kro_pd), dan KRS PEMDA TIDAK
 *   PERNAH jadi target tulis (datanya global lintas-OPD, bukan milik satu
 *   PIC — lihat KrsPemdaController::ensureCanManage()) — PIC OPD hanya
 *   boleh mengekspornya sbg referensi read-only, ikut tervalidasi
 *   strukturnya kalau ada di file, tapi tidak pernah ditulis
 *   (RiskExcelRegistry::picOpdWritableModules() hanya berisi krs_pd+kro_pd).
 * - Data KRS PD/KRO PD di ekspor/validasi impor DIBATASI ke baris milik
 *   user yg login (scopeUserId) — beda dari RiskExcelController yang
 *   selalu lintas-OPD penuh.
 *
 * Baris RiskExcelImportRequest yang dibuat di sini punya scope='pic_opd'
 * (lihat migrasi & model) — dibedakan dari scope='admin' milik
 * RiskExcelController supaya kedua controller tidak salah memproses
 * permintaan milik controller lain.
 */
class KrsPicExcelController extends Controller
{
    private const SCOPE = 'pic_opd';

    /**
     * Role yang dianggap "PIC OPD" — 'user' adalah role PIC standar utk
     * akun baru (lihat PicOpdSeeder), sementara 'admin-instansi' &
     * 'admin-inspektorat' adalah label penamaan akun PIC LAMA (Dinas
     * Sosial, Dinas Kesehatan, Inspektorat, BLUD RSUD dkk) yang dibuat
     * manual sebelum PicOpdSeeder ada — hak aksesnya identik dgn 'user',
     * BUKAN admin sungguhan (jangan tertukar dgn role 'admin').
     */
    private const PIC_OPD_ROLES = ['user', 'admin-instansi', 'admin-inspektorat'];

    /**
     * Role PIC OPD (lihat PIC_OPD_ROLES) — admin/super-admin punya jalur
     * sendiri (RiskExcelController) dan tidak boleh submit lewat sini,
     * supaya kedua fitur tidak tumpang tindih/membingungkan (satu pintu
     * per peran).
     */
    private function ensurePicOpd(): void
    {
        if (!auth()->user()?->hasAnyRole(self::PIC_OPD_ROLES)) {
            abort(403, 'Ekspor/Impor KRS ini khusus untuk PIC OPD.');
        }
    }

    /**
     * Persetujuan boleh dilakukan admin ATAU super-admin (beda dari
     * RiskExcelController yang super-admin-only) — sesuai permintaan user.
     */
    private function ensureAdminOrSuperAdmin(): void
    {
        if (!auth()->user()?->hasAnyRole(['admin', 'super-admin'])) {
            abort(403, 'Persetujuan impor KRS hanya dapat dilakukan oleh Admin/Super Admin.');
        }
    }

    public function index()
    {
        $user = auth()->user();
        if (!$user || !$user->hasAnyRole([...self::PIC_OPD_ROLES, 'admin', 'super-admin'])) {
            abort(403, 'Halaman ini khusus PIC OPD, Admin, dan Super Admin.');
        }

        $modules = collect(RiskExcelRegistry::modules())
            ->only(RiskExcelRegistry::picOpdModules())
            ->map(fn ($m, $slug) => [
                'slug' => $slug,
                'label' => $m['label'],
                'sheet_name' => $m['sheet_name'],
                'writable' => in_array($slug, RiskExcelRegistry::picOpdWritableModules(), true),
            ])->values();

        // Admin/super-admin melihat SEMUA permintaan pending scope pic_opd
        // (perlu ditinjau); PIC OPD tidak pernah melihat antrean PIC lain.
        $pendingRequests = $user->hasAnyRole(['admin', 'super-admin'])
            ? RiskExcelImportRequest::with('user:id,name,username')
                ->where('scope', self::SCOPE)
                ->where('status', 'pending')
                ->latest()
                ->get()
            : collect();

        // Riwayat permintaan milik user yang login sendiri (scope pic_opd
        // saja — request scope admin dari fitur lain tidak ikut di sini).
        $myRequests = RiskExcelImportRequest::with('reviewer:id,name,username')
            ->where('scope', self::SCOPE)
            ->where('user_id', $user->id)
            ->latest()
            ->take(20)
            ->get();

        return Inertia::render('krs/Excel', [
            'modules' => $modules,
            'pendingRequests' => $pendingRequests,
            'myRequests' => $myRequests,
        ]);
    }

    /**
     * Modul yang disertakan dalam ekspor/template — dari checkbox pengguna
     * (query `modules[]`), dengan 2 aturan wajib-ikut (pagar backend,
     * bukan cuma UI — query string bisa dirakit manual):
     * - krs_pd OTOMATIS ditambahkan kalau kro_pd dipilih: kolom SASARAN
     *   RENSTRA di kro_pd dirujuk ke SASARAN STRATEGIS PD milik krs_pd
     *   (lihat RiskExcelRegistry cross_ref utk modul kro_pd, parent_module
     *   = 'krs_pd') — BUKAN ke krs_pemda. Tanpa krs_pd ikut, baris kro_pd
     *   kehilangan referensi hierarkinya sendiri (cross_ref memang
     *   optional=true jadi tidak gagal keras, tapi merusak tujuan utama
     *   fitur ini: satu impor menyambungkan turunan hierarki).
     * - krs_pemda OTOMATIS ditambahkan kalau krs_pd atau kro_pd dipilih
     *   (dibutuhkan sbg referensi cross-ref lengkap krs_pd -> krs_pemda).
     * Selalu dibatasi ke picOpdModules() (tidak bisa menyelundupkan modul
     * lain lewat query string).
     */
    private function resolveModuleSlugs(Request $request): array
    {
        $requested = array_intersect(
            (array) $request->input('modules', RiskExcelRegistry::picOpdModules()),
            RiskExcelRegistry::picOpdModules(),
        );

        if (empty($requested)) {
            $requested = RiskExcelRegistry::picOpdModules();
        }

        if (in_array('kro_pd', $requested, true) && !in_array('krs_pd', $requested, true)) {
            $requested[] = 'krs_pd';
        }

        if ((in_array('krs_pd', $requested, true) || in_array('kro_pd', $requested, true))
            && !in_array('krs_pemda', $requested, true)) {
            $requested[] = 'krs_pemda';
        }

        // Kembalikan sesuai urutan dependency registry, bukan urutan input.
        return array_values(array_intersect(RiskExcelRegistry::picOpdModules(), $requested));
    }

    /**
     * Deteksi sheet MANA dari picOpdModules() yang benar-benar ADA di file
     * yang diupload — ekspor PIC OPD itu sendiri fleksibel (boleh cuma
     * berisi krs_pemda+krs_pd tanpa kro_pd, dsb, sesuai checkbox yg
     * dicentang saat ekspor), jadi validasi impor HARUS ikut fleksibel
     * mendeteksi subset yang sama, bukan memaksa ketiga sheet selalu ada
     * (kalau dipaksa, file hasil ekspor parsial otomatis gagal diimpor
     * balik — bug yang ditemukan & diperbaiki saat pengujian). krs_pemda
     * WAJIB ada di antara sheet yang terdeteksi (bukan opsional) karena
     * selalu jadi referensi cross-ref dasar.
     */
    private function presentModuleSlugs(\PhpOffice\PhpSpreadsheet\Spreadsheet $spreadsheet): array
    {
        $modules = RiskExcelRegistry::modules();
        $present = [];
        foreach (RiskExcelRegistry::picOpdModules() as $slug) {
            if ($spreadsheet->getSheetByName($modules[$slug]['sheet_name'])) {
                $present[] = $slug;
            }
        }

        return $present;
    }

    public function export(Request $request, RiskExcelExportService $service)
    {
        $this->ensurePicOpd();

        $slugs = $this->resolveModuleSlugs($request);
        $spreadsheet = $service->build(includeData: true, moduleSlugs: $slugs, scopeUserId: auth()->id());
        $filename = 'MR-Kabar-KRS-' . now()->format('Y-m-d_His') . '.xlsx';

        return $this->streamXlsx($spreadsheet, $filename);
    }

    public function template(Request $request, RiskExcelExportService $service)
    {
        $this->ensurePicOpd();

        $slugs = $this->resolveModuleSlugs($request);
        $spreadsheet = $service->build(includeData: false, moduleSlugs: $slugs);
        $filename = 'MR-Kabar-Template-KRS-Kosong.xlsx';

        return $this->streamXlsx($spreadsheet, $filename);
    }

    public function import(Request $request, RiskExcelImportService $service)
    {
        $this->ensurePicOpd();

        $request->validate([
            'file' => ['required', 'file', 'mimes:xlsx', 'max:10240'],
        ]);

        set_time_limit(300);

        $user = $request->user();
        $uploaded = $request->file('file');

        try {
            $spreadsheet = IOFactory::load($uploaded->getRealPath());
        } catch (SpreadsheetReaderException|\Throwable $e) {
            return redirect()->back()->with('error', 'File tidak dapat dibaca — pastikan file .xlsx tidak rusak dan belum pernah diubah ekstensinya.');
        }

        $presentSlugs = $this->presentModuleSlugs($spreadsheet);
        if (empty($presentSlugs)) {
            return redirect()->back()
                ->with('error', 'File ditolak — tidak ada sheet KRS Pemda/KRS PD/KRO PD yang dikenali di file ini.')
                ->with('importResult', ['ok' => false, 'structure_errors' => ['Tidak ada sheet KRS yang dikenali di file ini.'], 'sheets' => []]);
        }

        $v = $service->validate($spreadsheet, $presentSlugs, $user->id);

        if (!empty($v['structureErrors'])) {
            return redirect()->back()
                ->with('error', 'File ditolak — struktur/format tidak sesuai.')
                ->with('importResult', ['ok' => false, 'structure_errors' => $v['structureErrors'], 'sheets' => []]);
        }

        $preview = $service->buildPreview($v['parsedByModule'], $v['reportByModule'], $presentSlugs);

        $path = $uploaded->store('risk-excel-imports', 'local');

        $importRequest = RiskExcelImportRequest::create([
            'user_id' => $user->id,
            'scope' => self::SCOPE,
            'file_path' => $path,
            'original_filename' => $uploaded->getClientOriginalName(),
            'status' => 'pending',
            'preview_result' => $preview,
        ]);

        Notification::send(
            User::role(['admin', 'super-admin'])->get(),
            new RiskExcelImportRequestSubmitted($importRequest),
        );

        return redirect()->back()->with('success', 'File berhasil diupload dan menunggu persetujuan Admin/Super Admin.');
    }

    public function approve(RiskExcelImportRequest $importRequest, RiskExcelImportService $service)
    {
        $this->ensureAdminOrSuperAdmin();

        if ($importRequest->scope !== self::SCOPE) {
            abort(404);
        }

        set_time_limit(300);

        // Pola locking sama persis dgn RiskExcelController::approve() —
        // cegah dua klik "Setujui" hampir bersamaan memproses permintaan
        // yang sama dua kali (fix race-condition kritis dari sesi
        // sebelumnya, WAJIB direplikasi persis di sini).
        $claimed = DB::transaction(function () use ($importRequest) {
            $locked = RiskExcelImportRequest::whereKey($importRequest->id)->lockForUpdate()->first();
            if (!$locked || $locked->status !== 'pending') {
                return null;
            }
            $locked->update(['status' => 'processing']);

            return $locked;
        });

        if (!$claimed) {
            return redirect()->back()->with('error', 'Permintaan ini sudah diproses sebelumnya.');
        }

        if (!Storage::disk('local')->exists($claimed->file_path)) {
            $claimed->update(['status' => 'rejected', 'reviewed_by' => auth()->id(), 'reviewed_at' => now(), 'rejection_reason' => 'File sumber tidak ditemukan lagi di server.']);

            return redirect()->back()->with('error', 'File sumber tidak ditemukan lagi di server — permintaan otomatis ditandai gagal.');
        }

        $fullPath = Storage::disk('local')->path($claimed->file_path);

        try {
            $spreadsheet = IOFactory::load($fullPath);
        } catch (\Throwable $e) {
            $claimed->update(['status' => 'rejected', 'reviewed_by' => auth()->id(), 'reviewed_at' => now(), 'rejection_reason' => 'File sumber tidak dapat dibaca ulang (rusak).']);

            return redirect()->back()->with('error', 'File sumber tidak dapat dibaca ulang — permintaan ditolak otomatis.');
        }

        // Validasi ULANG dari file asli + scope kepemilikan PIC pengaju —
        // supaya perubahan data (mis. baris KRS PD-nya sendiri sudah
        // dihapus sejak upload) tetap tertangkap sebelum ditulis. Deteksi
        // ulang sheet yang ada (sama seperti saat upload) — file yang sama
        // dgn saat upload jadi hasilnya konsisten.
        $presentSlugs = $this->presentModuleSlugs($spreadsheet);
        if (empty($presentSlugs)) {
            $claimed->update([
                'status' => 'rejected',
                'reviewed_by' => auth()->id(),
                'reviewed_at' => now(),
                'rejection_reason' => 'Tidak ada sheet KRS yang dikenali saat divalidasi ulang.',
            ]);
            Storage::disk('local')->delete($claimed->file_path);

            return redirect()->back()->with('error', 'Tidak ada sheet KRS yang dikenali — permintaan ditolak otomatis.');
        }

        $v = $service->validate($spreadsheet, $presentSlugs, $claimed->user_id);

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

        // Ditulis atas nama PENGAJU ASLI (PIC OPD), bukan admin/super-admin
        // yang menyetujui — dan HANYA modul krs_pd+kro_pd, krs_pemda tidak
        // pernah ditulis (defense-in-depth ganda, sudah dijaga jg oleh
        // validate() yg tidak memasukkan krs_pemda sbg writable, tapi
        // writableModuleSlugs di sini adalah pagar terakhir yg eksplisit).
        // Dibatasi lagi ke $presentSlugs (sheet yg BENAR-BENAR ada di file
        // ini) — kalau file ekspor parsial tidak menyertakan kro_pd sama
        // sekali, jangan sertakan 'kro_pd' di writeOrder (kalau tidak,
        // reportByModule['kro_pd'] tidak pernah dibuat oleh validate()
        // krn tidak ada di $presentSlugs, lalu buildSheetsReport() gagal
        // akses key 'errors' yg tak pernah ada -> 500).
        $result = $service->write(
            $v['parsedByModule'],
            $v['reportByModule'],
            $claimed->user_id,
            array_values(array_intersect(RiskExcelRegistry::picOpdWritableModules(), $presentSlugs)),
        );

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
        $this->ensureAdminOrSuperAdmin();

        if ($importRequest->scope !== self::SCOPE) {
            abort(404);
        }

        $data = $request->validate([
            'rejection_reason' => ['nullable', 'string', 'max:500'],
        ]);

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
