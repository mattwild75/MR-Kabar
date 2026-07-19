<?php

namespace App\Http\Controllers;

use App\Models\IroPd;
use App\Models\IrsPd;
use App\Models\IrsPemda;
use App\Models\MonitoringRtp;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

/**
 * Bukti dukung (SS/JPG/PNG/PDF) utk field "URAIAN PENGENDALIAN YANG SUDAH
 * ADA" di IRS Pemda/IRS PD/IRO PD, dan utk field Form 8/9 Monitoring RTP
 * ("Media/Bentuk Sarana Pengkomunikasian" & "Bentuk/Metode Pemantauan") —
 * opsional, disarankan jika field terkait terisi. File disimpan lewat
 * media milik USER (collection 'files', SAMA PERSIS dgn Utilities > File
 * Manager — bukan collection terpisah) supaya otomatis muncul & terkelola
 * di sana juga, ditandai custom_properties (source_model + source_id) utk
 * menautkannya ke baris terkait. Hard delete (bukan soft delete) — file
 * bukti bukan data risiko inti.
 */
class RiskEvidenceController extends Controller
{
    /**
     * Tipe row yg didukung — slug di URL => Model class. Form 8
     * ("Media/Bentuk Sarana Pengkomunikasian") & Form 9 ("Bentuk/Metode
     * Pemantauan") BERBAGI satu baris MonitoringRtp yg sama (monitoring_id
     * sama) — dipecah jadi 2 slug berbeda (bukan 'monitoring_rtp' tunggal)
     * supaya bukti dukung Form 8 & Form 9 tidak tercampur dlm satu daftar,
     * walau keduanya menunjuk row MonitoringRtp yg identik. resolveModel()
     * tetap mengembalikan MonitoringRtp::class utk KEDUANYA (dipakai
     * findRowOrFail() mengambil row yg benar), tapi custom_properties
     * 'source_model' yg disimpan/dicari memakai SLUG (bukan FQCN mentah)
     * supaya kedua sub-tipe otomatis terpisah.
     */
    private const MODELS = [
        'irs_pemda' => IrsPemda::class,
        'irs_pd' => IrsPd::class,
        'iro_pd' => IroPd::class,
        'monitoring_rtp_komunikasi' => MonitoringRtp::class,
        'monitoring_rtp_pemantauan' => MonitoringRtp::class,
    ];

    /** MonitoringRtp py kepemilikan lewat opd_id (bukan user_id spt IRS/IRO) — sama pola ensureOpdAccess() di MonitoringEvaluasiController. */
    private const OWNERSHIP_VIA_OPD = [MonitoringRtp::class];

    private function resolveModel(string $type): string
    {
        if (!isset(self::MODELS[$type])) {
            abort(404, 'Jenis data tidak dikenal.');
        }

        return self::MODELS[$type];
    }

    /** Tag pembeda utk custom_properties.source_model — slug URL utk model yg dipakai >1 sub-tipe (MonitoringRtp), FQCN model spt biasa utk yg lain. */
    private function sourceTag(string $type): string
    {
        return str_starts_with($type, 'monitoring_rtp_') ? $type : $this->resolveModel($type);
    }

    /** Tegakkan kepemilikan baris (non-admin hanya boleh row milik OPD-nya/miliknya sendiri, tergantung jenis model). */
    private function findRowOrFail(Request $request, string $type, int $id): Model
    {
        $modelClass = $this->resolveModel($type);
        $isAdmin = $request->user()->hasAnyRole(['admin', 'super-admin']);

        $query = $modelClass::query()->whereKey($id);
        if (!$isAdmin) {
            if (in_array($modelClass, self::OWNERSHIP_VIA_OPD, true)) {
                $query->where('opd_id', $request->user()->opd_id);
            } else {
                $query->where('user_id', $request->user()->id);
            }
        }

        return $query->firstOrFail();
    }

    public function index(Request $request, string $type, int $id)
    {
        $row = $this->findRowOrFail($request, $type, $id);
        $sourceTag = $this->sourceTag($type);

        $files = $request->user()
            ->media()
            ->where('collection_name', 'files')
            ->whereRaw("JSON_UNQUOTE(JSON_EXTRACT(custom_properties, '$.source_model')) = ?", [$sourceTag])
            ->whereRaw("JSON_UNQUOTE(JSON_EXTRACT(custom_properties, '$.source_id')) = ?", [(string) $row->getKey()])
            ->get()
            ->map(fn ($media) => [
                'id' => $media->id,
                'name' => $media->name,
                'size' => $media->humanReadableSize,
                'mime_type' => $media->mime_type,
                // BUKAN $media->getFullUrl() — file disimpan di disk privat
                // (MEDIA_DISK=local), satu-satunya jalur baca adalah route
                // gated ini (lihat MediaDownloadController).
                'url' => route('media.download', $media),
                'created_at' => $media->created_at->diffForHumans(),
            ]);

        return response()->json(['files' => $files]);
    }

    public function store(Request $request, string $type, int $id)
    {
        $request->validate([
            'files' => 'required|array',
            'files.*' => 'file|max:10240|mimes:jpg,jpeg,png,pdf',
        ]);

        $row = $this->findRowOrFail($request, $type, $id);
        $sourceTag = $this->sourceTag($type);
        $user = $request->user();

        foreach ($request->file('files') as $file) {
            $user->addMedia($file)
                ->withCustomProperties([
                    'source_model' => $sourceTag,
                    'source_id' => $row->getKey(),
                ])
                ->toMediaCollection('files');
        }

        return back()->with('success', 'Bukti dukung berhasil diunggah.');
    }

    /** Hard delete — file bukti bukan data risiko inti, tidak perlu bisa dipulihkan. */
    public function destroy(Request $request, string $type, int $id, int $mediaId)
    {
        $row = $this->findRowOrFail($request, $type, $id);
        $sourceTag = $this->sourceTag($type);

        $media = $request->user()->media()->where('id', $mediaId)->firstOrFail();

        $props = $media->custom_properties;
        if (($props['source_model'] ?? null) !== $sourceTag || (int) ($props['source_id'] ?? 0) !== $row->getKey()) {
            abort(404, 'File tidak ditemukan.');
        }

        $media->delete();

        return back()->with('success', 'Bukti dukung berhasil dihapus.');
    }
}
