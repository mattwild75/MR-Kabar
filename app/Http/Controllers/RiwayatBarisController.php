<?php

namespace App\Http\Controllers;

use App\Models\IroPd;
use App\Models\IrsPd;
use App\Models\IrsPemda;
use App\Models\Rpp;
use Illuminate\Http\Request;
use Spatie\Activitylog\Models\Activity;

/**
 * Riwayat perubahan satu baris ("siapa mengubah apa, kapan"), dibaca dari
 * activity_log yang sudah dicatat GlobalActivityLogger. Hanya membaca.
 * Pemilik baris boleh melihat riwayat barisnya sendiri; admin semua baris.
 */
class RiwayatBarisController extends Controller
{
    private const MODEL = ['irs_pemda' => IrsPemda::class, 'irs_pd' => IrsPd::class, 'iro_pd' => IroPd::class, 'rpp' => Rpp::class];

    public function __invoke(Request $request, string $jenis, int $id)
    {
        $kelas = self::MODEL[$jenis] ?? abort(404);
        $baris = $kelas::withTrashed()->find($id) ?? abort(404);
        $user = $request->user();
        if (! $user->canViewAllOpd() && (int) ($baris->user_id ?? 0) !== (int) $user->id) {
            abort(403);
        }

        $riwayat = Activity::query()->with('causer:id,name')
            ->where('subject_type', $kelas)->where('subject_id', $id)
            ->orderByDesc('created_at')->limit(100)->get()
            ->map(function (Activity $a) {
                $p = $a->properties ?? collect();
                $lama = (array) ($p['old'] ?? []);
                $baru = (array) ($p['attributes'] ?? $p['new'] ?? []);
                $perubahan = [];
                foreach ($baru as $k => $v) {
                    if (in_array($k, ['updated_at', 'created_at'], true)) {
                        continue;
                    }
                    if (! array_key_exists($k, $lama) || $lama[$k] != $v) {
                        $perubahan[] = ['kolom' => $k, 'lama' => isset($lama[$k]) ? mb_strimwidth((string) (is_array($lama[$k]) ? json_encode($lama[$k]) : $lama[$k]), 0, 200, '…') : null, 'baru' => mb_strimwidth((string) (is_array($v) ? json_encode($v) : $v), 0, 200, '…')];
                    }
                }

                return [
                    'id' => $a->id,
                    'waktu' => $a->created_at?->toDateTimeString(),
                    'oleh' => $a->causer?->name ?? 'sistem',
                    'aksi' => $a->description,
                    'perubahan' => array_slice($perubahan, 0, 40),
                ];
            });

        return response()->json(['riwayat' => $riwayat]);
    }
}
