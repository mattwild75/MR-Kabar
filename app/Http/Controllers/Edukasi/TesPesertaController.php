<?php

namespace App\Http\Controllers\Edukasi;

use App\Http\Controllers\Controller;
use App\Models\Opd;
use App\Models\TesJawaban;
use App\Models\TesPeserta;
use App\Models\TesSesi;
use App\Services\Tes\AnalisisTesService;
use App\Services\Tes\StatusTesService;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Halaman peserta pre-test dan post-test (/edukasi/tes), tanpa login.
 *
 * Alur: token -> biodata -> menunggu -> tombol A-D setiap kali pemandu
 * membuka soal -> hasil sendiri sesudah sesi selesai. Ponsel peserta tidak
 * pernah menerima teks soal maupun kunci; soalnya dibaca bersama di layar
 * proyektor.
 *
 * Identitas peserta disimpan di sesi Laravel, dan cadangannya di kuki
 * perangkat (sidiknya di tes_peserta.perangkat_hash). Dengan begitu ponsel
 * yang sesinya hilang di tengah tes (dimuat ulang, sesi login aplikasi
 * berakhir) kembali ke peserta yang sama tanpa mengisi ulang.
 */
class TesPesertaController extends Controller
{
    public const KUKI_PERANGKAT = 'mrkabar_tes_perangkat';

    private const KUNCI_SESI = 'tes_peserta_id';

    /** Batas token salah per IP (satu aula berbagi satu IP, jadi longgar). */
    private const BATAS_TOKEN_SALAH = 100;

    public function __construct(private StatusTesService $status) {}

    public function halaman(Request $request): Response
    {
        $peserta = $this->pesertaAktif($request);
        $sesi = $peserta?->sesi;

        $tahap = 'token';
        if ($peserta && $sesi) {
            if ($peserta->dikeluarkan_pada) {
                $tahap = 'dikeluarkan';
            } elseif (! $peserta->biodata_pada) {
                $tahap = 'biodata';
            } elseif ($sesi->status === 'selesai') {
                $tahap = 'selesai';
            } else {
                $tahap = 'tes';
            }
        }

        // Token dari tautan berbagi (/edukasi/tes?token=...). Halaman ini TIDAK
        // memprosesnya: pendaftaran tetap lewat POST /edukasi/tes/masuk yang
        // dikirim halaman di ponsel, supaya robot pratinjau tautan (WhatsApp
        // dsb.) yang hanya membuka GET tidak membuat peserta palsu.
        $tokenAwal = $request->query('token');
        $tokenAwal = is_string($tokenAwal) && $tokenAwal !== '' ? mb_substr($tokenAwal, 0, 100) : null;

        return Inertia::render('edukasi/Tes', [
            'tokenAwal' => $tokenAwal,
            'tahap' => $tahap,
            'sesi' => $sesi ? [
                'jenis' => $sesi->jenis,
                'label' => $sesi->labelJenis(),
                'pelatihan' => $sesi->pelatihan?->nama,
                'status' => $this->status->muatan($sesi),
                'url_status' => $this->status->urlPublik($sesi),
            ] : null,
            'peserta' => $peserta && $peserta->biodata_pada ? [
                'nama' => $peserta->nama,
                'jawaban' => $peserta->jawaban()->pluck('pilihan', 'nomor'),
            ] : null,
            'opd' => $tahap === 'biodata' ? Opd::orderBy('nama')->get(['id', 'nama']) : [],
            'isianAwal' => $tahap === 'biodata' ? $this->isianAwal($request, $peserta) : null,
            'hasil' => $tahap === 'selesai' ? app(AnalisisTesService::class)->hasilPeserta($peserta) : null,
        ]);
    }

    public function masuk(Request $request): RedirectResponse
    {
        $data = $request->validate(['token' => ['required', 'string', 'max:100']]);
        $kunciGagal = 'tes-token-salah:'.$request->ip();

        if (RateLimiter::tooManyAttempts($kunciGagal, self::BATAS_TOKEN_SALAH)) {
            throw ValidationException::withMessages(['token' => 'Terlalu banyak token salah dari jaringan ini. Coba lagi beberapa menit lagi.']);
        }

        // Dicocokkan persis: huruf besar/kecil dan spasi berpengaruh.
        $sesi = TesSesi::where('token_hash', TesSesi::sidikToken($data['token']))
            ->whereIn('status', ['lobi', 'berjalan'])
            ->latest('id')
            ->first();

        if (! $sesi) {
            RateLimiter::hit($kunciGagal, 600);
            throw ValidationException::withMessages(['token' => 'Token tidak dikenal, atau tes belum dibuka oleh pemandu. Periksa lagi huruf besar/kecil dan spasinya.']);
        }

        $sidik = $this->sidikPerangkat($request);
        $peserta = TesPeserta::where('sesi_id', $sesi->id)->where('perangkat_hash', $sidik)->first()
            ?? TesPeserta::create([
                'sesi_id' => $sesi->id,
                'perangkat_hash' => $sidik,
                'terakhir_aktif' => now(),
            ]);

        $request->session()->put(self::KUNCI_SESI, $peserta->id);

        return redirect('/edukasi/tes');
    }

    public function biodata(Request $request): RedirectResponse
    {
        $peserta = $this->pesertaAktif($request);
        abort_unless($peserta && ! $peserta->dikeluarkan_pada, 403, 'Sesi tes tidak ditemukan. Masukkan token lagi.');

        $bukanAsn = $request->boolean('bukan_asn');
        $data = $request->validate([
            'nama' => ['required', 'string', 'max:150'],
            'nip' => [Rule::requiredIf(! $bukanAsn), 'nullable', 'digits:18'],
            'jabatan' => ['required', 'string', 'max:150'],
            'opd_id' => ['nullable', 'integer', 'exists:opd,id'],
            'instansi_lain' => ['nullable', 'required_without:opd_id', 'string', 'max:150'],
        ], [
            'nip.required' => 'NIP wajib diisi. Bila Anda bukan ASN, centang "Saya bukan ASN".',
            'nip.digits' => 'NIP terdiri dari 18 angka, tanpa spasi.',
            'instansi_lain.required_without' => 'Pilih SKPK, atau tuliskan instansi Anda.',
        ]);

        $nip = $bukanAsn ? null : $data['nip'];
        $isian = [
            'nama' => trim((string) preg_replace('/\s+/u', ' ', $data['nama'])),
            'nip' => $nip,
            'bukan_asn' => $bukanAsn,
            'jabatan' => trim($data['jabatan']),
            'opd_id' => $data['opd_id'] ?? null,
            'instansi_lain' => ($data['opd_id'] ?? null) ? null : trim((string) ($data['instansi_lain'] ?? '')),
            'biodata_pada' => $peserta->biodata_pada ?? now(),
            'terakhir_aktif' => now(),
        ];

        DB::transaction(function () use ($request, $peserta, $nip, $isian) {
            // NIP yang sudah terdaftar di sesi ini: peserta yang sama pindah
            // perangkat (ponsel mati, baterai habis). Jawabannya tetap.
            $lama = $nip ? TesPeserta::where('sesi_id', $peserta->sesi_id)->where('nip', $nip)->whereKeyNot($peserta->id)->first() : null;
            if ($lama) {
                abort_if($lama->dikeluarkan_pada !== null, 403, 'Peserta dengan NIP ini sudah dikeluarkan oleh pemandu.');
                $lama->fill(collect($isian)->except('biodata_pada')->all());
                $lama->perangkat_hash = $peserta->perangkat_hash;
                $lama->pindah_perangkat = (int) $lama->pindah_perangkat + 1;
                $lama->save();
                $peserta->delete();
                $request->session()->put(self::KUNCI_SESI, $lama->id);

                return;
            }
            $peserta->update($isian);
        });

        return redirect('/edukasi/tes');
    }

    public function jawab(Request $request): JsonResponse
    {
        $data = $request->validate([
            'nomor' => ['required', 'integer', 'between:1,'.TesSesi::JUMLAH_SOAL],
            'pilihan' => ['required', Rule::in(['A', 'B', 'C', 'D'])],
        ]);

        $peserta = $this->pesertaAktif($request);
        if (! $peserta || ! $peserta->sah()) {
            return response()->json(['pesan' => 'Anda belum terdaftar di tes ini. Muat ulang halaman.'], 403);
        }

        $sesi = $peserta->sesi()->first();
        $sekarang = now();
        if (! $sesi || $sesi->status !== 'berjalan' || ! $sesi->soal_terbuka || (int) $sesi->soal_aktif !== (int) $data['nomor']) {
            return response()->json(['pesan' => 'Soal ini sudah ditutup.', 'status' => $sesi ? $this->status->muatan($sesi) : null], 409);
        }

        $waktuMs = $sesi->soal_dibuka_ms ? max(0, self::sekarangMs() - (int) $sesi->soal_dibuka_ms) : 0;

        $simpan = function () use ($peserta, $sesi, $data, $waktuMs, $sekarang): TesJawaban {
            $jawaban = TesJawaban::firstOrNew(['peserta_id' => $peserta->id, 'nomor' => $data['nomor']]);
            $diganti = $jawaban->exists && $jawaban->pilihan !== $data['pilihan'];
            $jawaban->fill([
                'sesi_id' => $sesi->id,
                'pilihan' => $data['pilihan'],
                'waktu_ms' => $waktuMs,
                'dijawab_pada' => $sekarang,
                'diubah' => (int) $jawaban->diubah + ($diganti ? 1 : 0),
            ])->save();

            return $jawaban;
        };

        try {
            $jawaban = $simpan();
        } catch (UniqueConstraintViolationException) {
            // Dua ketukan nyaris bersamaan dari ponsel yang sama: yang kedua
            // mendapati baris sudah dibuat yang pertama, lalu memperbaruinya.
            $jawaban = $simpan();
        }

        $peserta->forceFill(['terakhir_aktif' => $sekarang, 'di_halaman' => true])->save();

        return response()->json(['pilihan' => $jawaban->pilihan, 'status' => $this->status->muatan($sesi)]);
    }

    /**
     * Denyut kehadiran tiap 10 detik, dan seketika saat peserta berpindah
     * aplikasi atau tab (halaman = keluar). Balasannya membawa status dari
     * basis data, dipakai ponsel untuk memeriksa apakah berkas status yang ia
     * baca sudah usang.
     */
    public function denyut(Request $request): JsonResponse
    {
        $data = $request->validate(['halaman' => ['required', Rule::in(['aktif', 'keluar'])]]);
        $peserta = $this->pesertaAktif($request);
        if (! $peserta) {
            return response()->json(['pesan' => 'Sesi tes tidak ditemukan.'], 404);
        }

        $diHalaman = $data['halaman'] === 'aktif';
        $peserta->terakhir_aktif = now();
        if ($peserta->di_halaman && ! $diHalaman && $peserta->biodata_pada) {
            $peserta->jumlah_keluar = (int) $peserta->jumlah_keluar + 1;
        }
        $peserta->di_halaman = $diHalaman;
        $peserta->save();

        return $this->balasanStatus($peserta);
    }

    /** Pembacaan status lewat aplikasi, dipakai bila berkas status ternyata usang. */
    public function status(Request $request): JsonResponse
    {
        $peserta = $this->pesertaAktif($request);
        if (! $peserta) {
            return response()->json(['pesan' => 'Sesi tes tidak ditemukan.'], 404);
        }

        return $this->balasanStatus($peserta);
    }

    private function balasanStatus(TesPeserta $peserta): JsonResponse
    {
        $sesi = $peserta->sesi()->first();
        if (! $sesi) {
            return response()->json(['pesan' => 'Sesi tes tidak ditemukan.'], 404);
        }

        return response()->json([
            'status' => $this->status->muatan($sesi),
            'dikeluarkan' => $peserta->dikeluarkan_pada !== null,
        ]);
    }

    /** "Ganti token": lepas dari sesi ini, misalnya dari pre-test ke post-test. */
    public function lupakan(Request $request): RedirectResponse
    {
        $request->session()->forget(self::KUNCI_SESI);

        return redirect('/edukasi/tes');
    }

    public static function sekarangMs(): int
    {
        return (int) floor(microtime(true) * 1000);
    }

    private function pesertaAktif(Request $request): ?TesPeserta
    {
        $id = $request->session()->get(self::KUNCI_SESI);
        $peserta = $id ? TesPeserta::with('sesi.pelatihan')->find($id) : null;

        if (! $peserta) {
            // Sesi Laravel hilang: pulihkan dari kuki perangkat, khusus sesi
            // yang masih terbuka atau baru selesai hari ini.
            $kuki = $request->cookie(self::KUKI_PERANGKAT);
            if (is_string($kuki) && $kuki !== '') {
                $peserta = TesPeserta::with('sesi.pelatihan')
                    ->where('perangkat_hash', hash('sha256', $kuki))
                    ->whereHas('sesi', fn ($q) => $q->whereIn('status', ['lobi', 'berjalan'])
                        ->orWhere(fn ($q2) => $q2->where('status', 'selesai')->where('selesai_pada', '>=', now()->subHours(12))))
                    ->latest('id')
                    ->first();
                if ($peserta) {
                    $request->session()->put(self::KUNCI_SESI, $peserta->id);
                }
            }
        }

        return $peserta;
    }

    private function sidikPerangkat(Request $request): string
    {
        $kuki = $request->cookie(self::KUKI_PERANGKAT);
        if (! is_string($kuki) || strlen($kuki) < 32) {
            $kuki = Str::random(48);
            Cookie::queue(Cookie::make(self::KUKI_PERANGKAT, $kuki, 60 * 24 * 30, '/', null, null, true, false, 'lax'));
        }

        return hash('sha256', $kuki);
    }

    /**
     * Isian awal biodata post-test dari pre-test, khusus perangkat yang sama
     * (yang dulu mengetiknya sendiri). Tidak ada pencarian lewat NIP: itu akan
     * membuka nama orang lain kepada siapa pun yang memegang token.
     *
     * @return array<string, mixed>|null
     */
    private function isianAwal(Request $request, ?TesPeserta $peserta): ?array
    {
        if (! $peserta || ! $peserta->sesi || $peserta->sesi->jenis !== 'post') {
            return null;
        }
        $pre = TesPeserta::query()
            ->where('perangkat_hash', $peserta->perangkat_hash)
            ->whereNotNull('biodata_pada')
            ->whereHas('sesi', fn ($q) => $q->where('pelatihan_id', $peserta->sesi->pelatihan_id)->where('jenis', 'pre'))
            ->first();

        return $pre ? $pre->only(['nama', 'nip', 'bukan_asn', 'jabatan', 'opd_id', 'instansi_lain']) : null;
    }
}
