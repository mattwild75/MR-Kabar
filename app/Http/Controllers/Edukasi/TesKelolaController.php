<?php

namespace App\Http\Controllers\Edukasi;

use App\Http\Controllers\Controller;
use App\Models\TesPelatihan;
use App\Models\TesSesi;
use App\Models\TesSoal;
use App\Models\TesVideo;
use App\Services\Tes\StatusTesService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

/**
 * Kelola pre-test dan post-test: pelatihan (angkatan) beserta tokennya, buka
 * dan tutup pendaftaran, bank soal, dan video film pendek. Hanya admin dan
 * super-admin.
 *
 * Token diketik pemandu sendiri dan tidak pernah ditulis di kode (repositori
 * GitHub publik). Bank soal pun begitu: diimpor dari berkas JSON lewat
 * halaman ini.
 */
class TesKelolaController extends Controller
{
    public function __construct(private StatusTesService $status) {}

    public static function pastikanAdmin(Request $request): void
    {
        abort_unless($request->user()?->hasAnyRole(['admin', 'super-admin']), 403, 'Hanya Admin dan Super Admin yang dapat mengelola pre-test dan post-test.');
    }

    public function index(Request $request): Response
    {
        self::pastikanAdmin($request);

        $pelatihan = TesPelatihan::with(['sesi' => fn ($q) => $q->withCount([
            'peserta as jumlah_peserta' => fn ($p) => $p->whereNotNull('biodata_pada')->whereNull('dikeluarkan_pada'),
        ])])->orderByDesc('tanggal')->orderByDesc('id')->get();

        return Inertia::render('edukasi/Kelola', [
            'pelatihan' => $pelatihan->map(fn (TesPelatihan $p) => [
                'id' => $p->id,
                'nama' => $p->nama,
                'tanggal' => $p->tanggal?->toDateString(),
                'tempat' => $p->tempat,
                'sesi' => $p->sesi->sortBy(fn (TesSesi $s) => $s->jenis === 'pre' ? 0 : 1)->values()->map(fn (TesSesi $s) => [
                    'id' => $s->id,
                    'jenis' => $s->jenis,
                    'label' => $s->labelJenis(),
                    'status' => $s->status,
                    'token' => $s->token,
                    'tampilkan_jawaban' => $s->tampilkan_jawaban,
                    'jumlah_peserta' => (int) $s->jumlah_peserta,
                ]),
            ]),
            'soal' => [
                'pre' => TesSoal::where('jenis', 'pre')->orderBy('nomor')->get(),
                'post' => TesSoal::where('jenis', 'post')->orderBy('nomor')->get(),
            ],
            'bagian' => TesSoal::BAGIAN,
            'video' => [
                'pre' => $this->infoVideo('pre'),
                'post' => $this->infoVideo('post'),
            ],
        ]);
    }

    public function simpanPelatihan(Request $request): RedirectResponse
    {
        self::pastikanAdmin($request);
        $data = $this->validasiPelatihan($request, true);

        DB::transaction(function () use ($data, $request) {
            $pelatihan = TesPelatihan::create([
                'nama' => $data['nama'],
                'tanggal' => $data['tanggal'] ?? null,
                'tempat' => $data['tempat'] ?? null,
                'dibuat_oleh' => $request->user()->id,
            ]);
            foreach (['pre', 'post'] as $jenis) {
                $token = $data['token_'.$jenis];
                $sesi = $pelatihan->sesi()->create([
                    'jenis' => $jenis,
                    'token' => $token,
                    'token_hash' => TesSesi::sidikToken($token),
                    'kunci_publik' => bin2hex(random_bytes(20)),
                    'status' => 'draf',
                    'tampilkan_jawaban' => $jenis === 'post',
                ]);
                $this->status->tulis($sesi);
            }
        });

        return back()->with('success', 'Pelatihan dan dua sesinya (pre-test dan post-test) sudah dibuat.');
    }

    public function ubahPelatihan(Request $request, TesPelatihan $pelatihan): RedirectResponse
    {
        self::pastikanAdmin($request);
        $data = $this->validasiPelatihan($request, false);

        DB::transaction(function () use ($data, $pelatihan) {
            $pelatihan->update([
                'nama' => $data['nama'],
                'tanggal' => $data['tanggal'] ?? null,
                'tempat' => $data['tempat'] ?? null,
            ]);
            foreach ($pelatihan->sesi as $sesi) {
                $token = $data['token_'.$sesi->jenis] ?? null;
                if ($token !== null && $token !== '') {
                    $this->pastikanTokenTidakBentrok($token, $sesi);
                    $sesi->update(['token' => $token, 'token_hash' => TesSesi::sidikToken($token)]);
                }
            }
        });

        return back()->with('success', 'Pelatihan diperbarui.');
    }

    public function hapusPelatihan(Request $request, TesPelatihan $pelatihan): RedirectResponse
    {
        self::pastikanAdmin($request);

        $adaPeserta = $pelatihan->sesi()->whereHas('peserta', fn ($q) => $q->whereNotNull('biodata_pada'))->exists();
        if ($adaPeserta) {
            return back()->with('error', 'Pelatihan ini sudah punya peserta dan hasil. Hasilnya tidak dihapus; kosongkan dulu lewat "Atur ulang" bila memang ingin menghapus.');
        }

        foreach ($pelatihan->sesi as $sesi) {
            $this->status->hapus($sesi);
        }
        $pelatihan->delete();

        return back()->with('success', 'Pelatihan dihapus.');
    }

    public function aturSesi(Request $request, TesSesi $sesi): RedirectResponse
    {
        self::pastikanAdmin($request);
        $aksi = $request->validate(['aksi' => ['required', Rule::in(['buka', 'tutup', 'ulang', 'jawaban'])]])['aksi'];

        switch ($aksi) {
            case 'buka':
                if ($sesi->status !== 'draf') {
                    return back()->with('error', 'Pendaftaran hanya bisa dibuka dari sesi yang belum berjalan.');
                }
                $bentrok = TesSesi::where('token_hash', $sesi->token_hash)->whereKeyNot($sesi->id)->whereIn('status', ['lobi', 'berjalan'])->exists();
                if ($bentrok) {
                    return back()->with('error', 'Ada sesi lain dengan token yang sama yang sedang dibuka. Tutup sesi itu dulu, atau ganti tokennya.');
                }
                $this->status->ubah($sesi, ['status' => 'lobi']);

                return back()->with('success', $sesi->labelJenis().' dibuka: peserta sudah bisa bergabung dengan token.');

            case 'tutup':
                if ($sesi->status !== 'lobi') {
                    return back()->with('error', 'Hanya pendaftaran yang belum dimulai yang bisa ditutup. Tes yang sedang berjalan diakhiri dari layar tayang.');
                }
                $this->status->ubah($sesi, ['status' => 'draf']);

                return back()->with('success', 'Pendaftaran '.$sesi->labelJenis().' ditutup.');

            case 'jawaban':
                $this->status->ubah($sesi, ['tampilkan_jawaban' => ! $sesi->tampilkan_jawaban]);

                return back()->with('success', 'Setelan pembukaan jawaban di layar tayang diperbarui.');

            default: // ulang
                DB::transaction(function () use ($sesi) {
                    $sesi->jawaban()->delete();
                    $sesi->peserta()->delete();
                });
                $this->status->ubah($sesi, [
                    'status' => 'draf', 'soal_aktif' => null, 'soal_terbuka' => false, 'soal_dibuka_ms' => null,
                    'mulai_pada' => null, 'selesai_pada' => null,
                ]);

                return back()->with('success', $sesi->labelJenis().' dikosongkan: seluruh peserta dan jawabannya dihapus.');
        }
    }

    public function imporSoal(Request $request): RedirectResponse
    {
        self::pastikanAdmin($request);
        $request->validate(['berkas' => ['required', 'file', 'max:2048']]);

        $isi = json_decode((string) file_get_contents($request->file('berkas')->getRealPath()), true);
        if (! is_array($isi)) {
            throw ValidationException::withMessages(['berkas' => 'Berkas bukan JSON yang sah.']);
        }

        $jumlah = 0;
        DB::transaction(function () use ($isi, &$jumlah) {
            foreach (['pre', 'post'] as $jenis) {
                foreach ((array) ($isi[$jenis] ?? []) as $i => $butir) {
                    $baris = $this->normalkanSoal((array) $butir, $jenis, $i);
                    TesSoal::updateOrCreate(['jenis' => $jenis, 'nomor' => $baris['nomor']], $baris);
                    $jumlah++;
                }
            }
        });

        if ($jumlah === 0) {
            throw ValidationException::withMessages(['berkas' => 'Tidak ada soal di berkas. Bentuknya: {"pre": [...], "post": [...]}.']);
        }

        return back()->with('success', $jumlah.' butir soal diimpor.');
    }

    public function ubahSoal(Request $request, TesSoal $soal): RedirectResponse
    {
        self::pastikanAdmin($request);
        $data = $request->validate([
            'bagian' => ['required', 'integer', Rule::in(array_keys(TesSoal::BAGIAN))],
            'indikator' => ['required', 'string', 'max:200'],
            'pertanyaan' => ['required', 'string', 'max:2000'],
            'pilihan_a' => ['required', 'string', 'max:500'],
            'pilihan_b' => ['required', 'string', 'max:500'],
            'pilihan_c' => ['required', 'string', 'max:500'],
            'pilihan_d' => ['required', 'string', 'max:500'],
            'kunci' => ['required', Rule::in(TesSoal::PILIHAN)],
            'pembahasan' => ['nullable', 'string', 'max:2000'],
        ]);
        $soal->update($data);

        return back()->with('success', 'Soal '.strtoupper($soal->jenis).' nomor '.$soal->nomor.' disimpan.');
    }

    public function eksporSoal(Request $request): \Symfony\Component\HttpFoundation\Response
    {
        self::pastikanAdmin($request);

        $isi = [];
        foreach (['pre', 'post'] as $jenis) {
            $isi[$jenis] = TesSoal::where('jenis', $jenis)->orderBy('nomor')->get()->map(fn (TesSoal $s) => [
                'nomor' => $s->nomor,
                'bagian' => $s->bagian,
                'indikator' => $s->indikator,
                'pertanyaan' => $s->pertanyaan,
                'pilihan' => $s->pilihan(),
                'kunci' => $s->kunci,
                'pembahasan' => $s->pembahasan,
            ])->values();
        }

        return response(json_encode($isi, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), 200, [
            'Content-Type' => 'application/json; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="bank-soal-pre-post-test.json"',
        ]);
    }

    public function simpanVideo(Request $request, string $jenis): RedirectResponse
    {
        self::pastikanAdmin($request);
        abort_unless(in_array($jenis, ['pre', 'post'], true), 404);

        $data = $request->validate([
            'berkas' => ['nullable', 'file', 'mimetypes:video/mp4', 'max:409600'],
            'isyarat' => ['required', 'string', 'max:2000'],
        ]);
        $isyarat = $this->uraikanIsyarat($data['isyarat']);

        $video = TesVideo::firstOrNew(['jenis' => $jenis]);
        if ($request->hasFile('berkas')) {
            $video->berkas = $request->file('berkas')->storeAs('tes-video', $jenis.'.mp4', 'local');
        }
        if (! $video->berkas) {
            throw ValidationException::withMessages(['berkas' => 'Unggah berkas video MP4-nya.']);
        }
        $video->isyarat = $isyarat;
        $video->save();

        return back()->with('success', 'Video '.($jenis === 'pre' ? 'pre-test' : 'post-test').' dan 20 titik berhentinya disimpan.');
    }

    public function hapusVideo(Request $request, string $jenis): RedirectResponse
    {
        self::pastikanAdmin($request);
        $video = TesVideo::where('jenis', $jenis)->first();
        if ($video?->berkas) {
            Storage::disk('local')->delete($video->berkas);
        }
        $video?->delete();

        return back()->with('success', TesVideo::untuk($jenis) ? 'Video unggahan dihapus; layar tayang kembali memakai film bawaan aplikasi.' : 'Video dihapus; layar tayang kembali memakai kartu soal.');
    }

    public function putarVideo(Request $request, string $jenis): BinaryFileResponse
    {
        self::pastikanAdmin($request);
        $video = TesVideo::where('jenis', $jenis)->first();
        abort_unless($video?->berkas && Storage::disk('local')->exists($video->berkas), 404);

        return response()->file(Storage::disk('local')->path($video->berkas), [
            'Content-Type' => 'video/mp4',
            'Cache-Control' => 'private, max-age=3600',
        ]);
    }

    /** @return array<string, mixed>|null */
    private function infoVideo(string $jenis): ?array
    {
        $video = TesVideo::untuk($jenis);

        return $video ? ['isyarat' => $video['isyarat'], 'diperbarui' => $video['diperbarui'], 'sumber' => $video['sumber']] : null;
    }

    /** @return array<string, mixed> */
    private function validasiPelatihan(Request $request, bool $baru): array
    {
        $wajib = $baru ? 'required' : 'nullable';

        return $request->validate([
            'nama' => ['required', 'string', 'max:150'],
            'tanggal' => ['nullable', 'date'],
            'tempat' => ['nullable', 'string', 'max:150'],
            'token_pre' => [$wajib, 'string', 'max:100'],
            'token_post' => [$wajib, 'string', 'max:100', 'different:token_pre'],
        ], [
            'token_post.different' => 'Token post-test harus berbeda dari token pre-test.',
        ]);
    }

    private function pastikanTokenTidakBentrok(string $token, TesSesi $sesi): void
    {
        $bentrok = TesSesi::where('token_hash', TesSesi::sidikToken($token))
            ->whereKeyNot($sesi->id)
            ->whereIn('status', ['lobi', 'berjalan'])
            ->exists();
        if ($bentrok) {
            throw ValidationException::withMessages(['token_'.$sesi->jenis => 'Token ini sedang dipakai sesi lain yang terbuka.']);
        }
    }

    /**
     * @param  array<string, mixed>  $butir
     * @return array<string, mixed>
     */
    private function normalkanSoal(array $butir, string $jenis, int $urutan): array
    {
        $pilihan = (array) ($butir['pilihan'] ?? []);
        $baris = [
            'jenis' => $jenis,
            'nomor' => (int) ($butir['nomor'] ?? $urutan + 1),
            'bagian' => (int) ($butir['bagian'] ?? 0),
            'indikator' => trim((string) ($butir['indikator'] ?? '')),
            'pertanyaan' => trim((string) ($butir['pertanyaan'] ?? '')),
            'pilihan_a' => trim((string) ($pilihan['A'] ?? $butir['pilihan_a'] ?? '')),
            'pilihan_b' => trim((string) ($pilihan['B'] ?? $butir['pilihan_b'] ?? '')),
            'pilihan_c' => trim((string) ($pilihan['C'] ?? $butir['pilihan_c'] ?? '')),
            'pilihan_d' => trim((string) ($pilihan['D'] ?? $butir['pilihan_d'] ?? '')),
            'kunci' => strtoupper(trim((string) ($butir['kunci'] ?? ''))),
            'pembahasan' => isset($butir['pembahasan']) ? trim((string) $butir['pembahasan']) : null,
        ];

        $label = strtoupper($jenis).' nomor '.$baris['nomor'];
        $salah = match (true) {
            $baris['nomor'] < 1 || $baris['nomor'] > TesSesi::JUMLAH_SOAL => 'nomor harus 1 sampai '.TesSesi::JUMLAH_SOAL,
            ! array_key_exists($baris['bagian'], TesSoal::BAGIAN) => 'bagian harus 1 sampai 5',
            $baris['indikator'] === '' || $baris['pertanyaan'] === '' => 'indikator dan pertanyaan wajib diisi',
            in_array('', [$baris['pilihan_a'], $baris['pilihan_b'], $baris['pilihan_c'], $baris['pilihan_d']], true) => 'keempat pilihan A-D wajib diisi',
            ! in_array($baris['kunci'], TesSoal::PILIHAN, true) => 'kunci harus A, B, C, atau D',
            default => null,
        };
        if ($salah) {
            throw ValidationException::withMessages(['berkas' => $label.': '.$salah.'.']);
        }

        return $baris;
    }

    /**
     * "0:42, 1:15, 2:03 ..." atau detik biasa, dipisah koma, spasi, atau baris
     * baru. Harus tepat 20 titik dan terus naik.
     *
     * @return list<float>
     */
    private function uraikanIsyarat(string $teks): array
    {
        $titik = [];
        foreach (preg_split('/[\s,;]+/', trim($teks)) ?: [] as $bagian) {
            if ($bagian === '') {
                continue;
            }
            if (! preg_match('/^(?:(\d+):)?(?:(\d+):)?(\d+(?:\.\d+)?)$/', $bagian, $m)) {
                throw ValidationException::withMessages(['isyarat' => '"'.$bagian.'" bukan waktu yang sah. Tulis mm:ss atau detik.']);
            }
            $angka = array_values(array_filter([$m[1], $m[2]], fn ($x) => $x !== ''));
            $detik = (float) $m[3];
            if (count($angka) === 2) {
                $detik += (int) $angka[0] * 3600 + (int) $angka[1] * 60;
            } elseif (count($angka) === 1) {
                $detik += (int) $angka[0] * 60;
            }
            $titik[] = round($detik, 2);
        }

        if (count($titik) !== TesSesi::JUMLAH_SOAL) {
            throw ValidationException::withMessages(['isyarat' => 'Harus tepat '.TesSesi::JUMLAH_SOAL.' titik berhenti; yang tertulis '.count($titik).'.']);
        }
        for ($i = 1; $i < count($titik); $i++) {
            if ($titik[$i] <= $titik[$i - 1]) {
                throw ValidationException::withMessages(['isyarat' => 'Titik berhenti harus terus naik (soal '.($i + 1).' sebelum soal '.$i.').']);
            }
        }

        return $titik;
    }
}
