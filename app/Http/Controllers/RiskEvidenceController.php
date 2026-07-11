<?php

namespace App\Http\Controllers;

use App\Models\IroPd;
use App\Models\IrsPd;
use App\Models\IrsPemda;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * Bukti dukung (SS/JPG/PNG/PDF) utk field "URAIAN PENGENDALIAN YANG SUDAH
 * ADA" di IRS Pemda/IRS PD/IRO PD — opsional, disarankan jika uraian
 * terisi. File disimpan lewat media milik USER (collection 'files', SAMA
 * PERSIS dgn Utilities > File Manager — bukan collection terpisah) supaya
 * otomatis muncul & terkelola di sana juga, ditandai custom_properties
 * (source_model + source_id) utk menautkannya ke baris risiko terkait.
 * Hard delete (bukan soft delete) — file bukti bukan data risiko inti.
 */
class RiskEvidenceController extends Controller
{
    /** Tipe row yg didukung — slug di URL => [Model class, kolom cek kepemilikan]. */
    private const MODELS = [
        'irs_pemda' => IrsPemda::class,
        'irs_pd' => IrsPd::class,
        'iro_pd' => IroPd::class,
    ];

    private function resolveModel(string $type): string
    {
        if (!isset(self::MODELS[$type])) {
            abort(404, 'Jenis data tidak dikenal.');
        }

        return self::MODELS[$type];
    }

    /** Tegakkan kepemilikan baris (non-admin hanya boleh row miliknya sendiri). */
    private function findRowOrFail(Request $request, string $type, int $id): Model
    {
        $modelClass = $this->resolveModel($type);
        $isAdmin = $request->user()->hasAnyRole(['admin', 'super-admin']);

        $query = $modelClass::query()->whereKey($id);
        if (!$isAdmin) {
            $query->where('user_id', $request->user()->id);
        }

        return $query->firstOrFail();
    }

    public function index(Request $request, string $type, int $id)
    {
        $row = $this->findRowOrFail($request, $type, $id);
        $modelClass = $this->resolveModel($type);

        $files = $request->user()
            ->media()
            ->where('collection_name', 'files')
            ->whereRaw("JSON_UNQUOTE(JSON_EXTRACT(custom_properties, '$.source_model')) = ?", [$modelClass])
            ->whereRaw("JSON_UNQUOTE(JSON_EXTRACT(custom_properties, '$.source_id')) = ?", [(string) $row->getKey()])
            ->get()
            ->map(fn ($media) => [
                'id' => $media->id,
                'name' => $media->name,
                'size' => $media->humanReadableSize,
                'mime_type' => $media->mime_type,
                'url' => $media->getFullUrl(),
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
        $modelClass = $this->resolveModel($type);
        $user = $request->user();

        foreach ($request->file('files') as $file) {
            $user->addMedia($file)
                ->withCustomProperties([
                    'source_model' => $modelClass,
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
        $modelClass = $this->resolveModel($type);

        $media = $request->user()->media()->where('id', $mediaId)->firstOrFail();

        $props = $media->custom_properties;
        if (($props['source_model'] ?? null) !== $modelClass || (int) ($props['source_id'] ?? 0) !== $row->getKey()) {
            abort(404, 'File tidak ditemukan.');
        }

        $media->delete();

        return back()->with('success', 'Bukti dukung berhasil dihapus.');
    }
}
