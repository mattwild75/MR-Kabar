<?php

namespace App\Http\Controllers\Edukasi;

use App\Http\Controllers\Controller;
use App\Models\TesJawaban;
use App\Models\TesPeserta;
use App\Models\TesSesi;
use App\Models\TesSoal;
use App\Models\TesVideo;
use App\Services\Tes\AnalisisTesService;
use App\Services\Tes\StatusTesService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Layar tayang (proyektor) dan halaman Pantau sesi tes langsung. Hanya admin
 * dan super-admin.
 *
 * Pemandu menggerakkan sesi lewat aksi(): mulai, buka soal, tutup soal,
 * selesai. statistik() dibaca layar tayang dan halaman Pantau tiap 1,5-2
 * detik: siapa yang sudah bergabung, siapa sedang mengisi biodata, siapa
 * sedang mengerjakan dan sudah/belum menjawab soal aktif, siapa keluar
 * halaman atau terputus, sebaran jawaban, dan peringkat.
 */
class TesTayangController extends Controller
{
    public function __construct(private StatusTesService $status, private AnalisisTesService $analisis) {}

    public function tayang(Request $request, TesSesi $sesi): Response
    {
        TesKelolaController::pastikanAdmin($request);
        $sesi->load('pelatihan');
        $video = TesVideo::untuk($sesi->jenis);

        return Inertia::render('edukasi/Tayang', [
            'sesi' => $this->infoSesi($sesi) + ['token' => $sesi->token],
            'soal' => $this->daftarSoal($sesi->jenis),
            'video' => $video ? ['url' => $video['url'], 'isyarat' => $video['isyarat']] : null,
            'urlPeserta' => url('/edukasi/tes'),
        ]);
    }

    public function pantau(Request $request, TesSesi $sesi): Response
    {
        TesKelolaController::pastikanAdmin($request);
        $sesi->load('pelatihan');

        return Inertia::render('edukasi/Pantau', [
            'sesi' => $this->infoSesi($sesi),
            'soal' => $this->daftarSoal($sesi->jenis),
        ]);
    }

    public function aksi(Request $request, TesSesi $sesi): JsonResponse
    {
        TesKelolaController::pastikanAdmin($request);
        $data = $request->validate([
            'aksi' => ['required', Rule::in(['mulai', 'buka', 'tutup', 'selesai'])],
            'nomor' => ['nullable', 'integer', 'between:1,'.TesSesi::JUMLAH_SOAL],
        ]);

        $galat = null;
        switch ($data['aksi']) {
            case 'mulai':
                if ($sesi->status === 'lobi') {
                    $sesi = $this->status->ubah($sesi, ['status' => 'berjalan', 'mulai_pada' => now(), 'soal_aktif' => null, 'soal_terbuka' => false]);
                } elseif ($sesi->status !== 'berjalan') {
                    $galat = 'Buka pendaftaran sesi ini dulu di halaman Kelola.';
                }
                break;

            case 'buka':
                if ($sesi->status !== 'berjalan' || empty($data['nomor'])) {
                    $galat = 'Tekan Mulai dulu sebelum membuka soal.';
                    break;
                }
                $nomor = (int) $data['nomor'];
                // Membuka ulang soal yang sama tidak mengulang jam: waktu
                // menjawab tetap diukur dari pembukaan pertamanya.
                $ms = ((int) $sesi->soal_aktif === $nomor && $sesi->soal_dibuka_ms)
                    ? (int) $sesi->soal_dibuka_ms
                    : TesPesertaController::sekarangMs();
                $sesi = $this->status->ubah($sesi, ['soal_aktif' => $nomor, 'soal_terbuka' => true, 'soal_dibuka_ms' => $ms]);
                break;

            case 'tutup':
                if ($sesi->soal_terbuka) {
                    $sesi = $this->status->ubah($sesi, ['soal_terbuka' => false]);
                }
                break;

            default: // selesai
                if ($sesi->status === 'berjalan') {
                    $sesi = $this->status->ubah($sesi, ['status' => 'selesai', 'soal_terbuka' => false, 'selesai_pada' => now()]);
                } elseif ($sesi->status !== 'selesai') {
                    $galat = 'Sesi belum dimulai.';
                }
        }

        if ($galat) {
            return response()->json(['pesan' => $galat], 422);
        }

        return response()->json($this->hitungStatistik($sesi->refresh()));
    }

    public function statistik(Request $request, TesSesi $sesi): JsonResponse
    {
        TesKelolaController::pastikanAdmin($request);

        return response()->json($this->hitungStatistik($sesi));
    }

    public function keluarkan(Request $request, TesSesi $sesi, TesPeserta $peserta): JsonResponse
    {
        TesKelolaController::pastikanAdmin($request);
        abort_unless($peserta->sesi_id === $sesi->id, 404);

        $peserta->update(['dikeluarkan_pada' => $peserta->dikeluarkan_pada ? null : now()]);

        return response()->json($this->hitungStatistik($sesi));
    }

    /** @return array<string, mixed> */
    private function hitungStatistik(TesSesi $sesi): array
    {
        $nilai = collect($this->analisis->nilaiSesi($sesi))->keyBy('id');
        $peserta = $sesi->peserta()->with('opd:id,nama')->orderBy('id')->get();
        $nomor = $sesi->soal_aktif;
        $jawabanAktif = $nomor
            ? TesJawaban::where('sesi_id', $sesi->id)->where('nomor', $nomor)->get()->keyBy('peserta_id')
            : collect();
        $kunci = $nomor ? TesSoal::where('jenis', $sesi->jenis)->where('nomor', $nomor)->value('kunci') : null;
        $batasTerputus = now()->subSeconds(TesPeserta::BATAS_TERPUTUS);

        $daftar = [];
        $ringkas = ['bergabung' => 0, 'mengisi_biodata' => 0, 'aktif' => 0, 'terputus' => 0, 'keluar_halaman' => 0, 'dikeluarkan' => 0, 'sudah_menjawab' => 0];
        foreach ($peserta as $p) {
            $jawab = $jawabanAktif->get($p->id);
            [$kode, $label] = $this->statusPeserta($sesi, $p, $jawab !== null, $batasTerputus);
            $baris = $nilai->get($p->id);

            if ($kode === 'dikeluarkan') {
                $ringkas['dikeluarkan']++;
            } elseif ($kode === 'mengisi_biodata') {
                $ringkas['mengisi_biodata']++;
            } else {
                $ringkas['bergabung']++;
                if ($kode === 'terputus') {
                    $ringkas['terputus']++;
                } elseif ($kode === 'keluar_halaman') {
                    $ringkas['keluar_halaman']++;
                } else {
                    $ringkas['aktif']++;
                }
                if ($jawab) {
                    $ringkas['sudah_menjawab']++;
                }
            }

            $daftar[] = [
                'id' => $p->id,
                'nama' => $p->nama,
                'nip' => $p->nip,
                'bukan_asn' => (bool) $p->bukan_asn,
                'jabatan' => $p->jabatan,
                'instansi' => $p->biodata_pada ? $p->namaInstansi() : null,
                'status' => $kode,
                'label' => $label,
                'sudah_menjawab' => $jawab !== null,
                'pilihan' => $jawab?->pilihan,
                'benar' => $baris['benar'] ?? 0,
                'dijawab' => $baris['dijawab'] ?? 0,
                'nilai' => $baris['nilai'] ?? null,
                'detik_lalu' => $p->terakhir_aktif ? (int) $p->terakhir_aktif->diffInSeconds(now(), true) : null,
                'jumlah_keluar' => (int) $p->jumlah_keluar,
                'pindah_perangkat' => (int) $p->pindah_perangkat,
                'bergabung_pada' => $p->created_at?->toIso8601String(),
                'biodata_pada' => $p->biodata_pada?->toIso8601String(),
                'jawaban_terakhir' => $baris['jawaban_terakhir'] ?? null,
            ];
        }

        $sebaran = ['A' => 0, 'B' => 0, 'C' => 0, 'D' => 0];
        foreach ($jawabanAktif as $pesertaId => $j) {
            if (isset($nilai[$pesertaId])) {
                $sebaran[$j->pilihan]++;
            }
        }
        $menjawab = array_sum($sebaran);

        $ringkasSoal = null;
        if ($nomor !== null) {
            $ringkasSoal = [
                'nomor' => $nomor,
                'menjawab' => $menjawab,
                'sebaran' => $sebaran,
                'kunci' => $kunci,
                'persen_benar' => $menjawab > 0 && is_string($kunci) && isset($sebaran[$kunci]) ? round($sebaran[$kunci] / $menjawab * 100) : null,
            ];
        }

        return [
            'status' => $this->status->muatan($sesi),
            'sesi' => ['tampilkan_jawaban' => (bool) $sesi->tampilkan_jawaban, 'soal_dibuka_ms' => $sesi->soal_dibuka_ms],
            'jam_server_ms' => TesPesertaController::sekarangMs(),
            'ringkas' => $ringkas,
            'peserta' => $daftar,
            'soal_aktif' => $ringkasSoal,
            'peringkat' => $nilai->values()->map(fn ($r) => [
                'id' => $r['id'],
                'peringkat' => $r['peringkat'],
                'nama' => $r['nama'],
                'instansi' => $r['instansi'],
                'nilai' => $r['nilai'],
                'benar' => $r['benar'],
                'total_detik' => round($r['total_waktu_ms'] / 1000, 1),
                'waktu_benar_ms' => $r['waktu_benar_ms'],
            ]),
        ];
    }

    /** @return array{0: string, 1: string} */
    private function statusPeserta(TesSesi $sesi, TesPeserta $p, bool $sudahJawab, \DateTimeInterface $batasTerputus): array
    {
        if ($p->dikeluarkan_pada) {
            return ['dikeluarkan', 'Dikeluarkan pemandu'];
        }
        if (! $p->biodata_pada) {
            return ['mengisi_biodata', 'Mengisi biodata'];
        }
        if ($sesi->status === 'selesai') {
            return ['selesai', 'Selesai'];
        }
        if (! $p->terakhir_aktif || $p->terakhir_aktif < $batasTerputus) {
            return ['terputus', 'Terputus'];
        }
        if (! $p->di_halaman) {
            return ['keluar_halaman', 'Keluar dari halaman tes'];
        }
        if ($sesi->status !== 'berjalan' || ! $sesi->soal_aktif) {
            return ['lobi', 'Menunggu di lobi'];
        }
        if ($sudahJawab) {
            return ['sudah_menjawab', 'Soal '.$sesi->soal_aktif.': sudah menjawab'];
        }

        return $sesi->soal_terbuka
            ? ['mengerjakan', 'Soal '.$sesi->soal_aktif.': sedang mengerjakan']
            : ['tidak_menjawab', 'Soal '.$sesi->soal_aktif.': tidak menjawab'];
    }

    /** @return array<string, mixed> */
    private function infoSesi(TesSesi $sesi): array
    {
        return [
            'id' => $sesi->id,
            'jenis' => $sesi->jenis,
            'label' => $sesi->labelJenis(),
            'pelatihan' => $sesi->pelatihan?->nama,
            'pelatihan_id' => $sesi->pelatihan_id,
            'tampilkan_jawaban' => (bool) $sesi->tampilkan_jawaban,
            'status' => $this->status->muatan($sesi),
        ];
    }

    /** @return list<array<string, mixed>> */
    private function daftarSoal(string $jenis): array
    {
        return TesSoal::where('jenis', $jenis)->orderBy('nomor')->get()->map(fn (TesSoal $s) => [
            'nomor' => $s->nomor,
            'bagian' => $s->bagian,
            'nama_bagian' => TesSoal::namaBagian($s->bagian),
            'indikator' => $s->indikator,
            'pertanyaan' => $s->pertanyaan,
            'pilihan' => $s->pilihan(),
            'kunci' => $s->kunci,
            'pembahasan' => $s->pembahasan,
        ])->values()->all();
    }
}
