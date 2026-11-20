<?php

namespace App\Http\Controllers\Edukasi;

use App\Http\Controllers\Controller;
use App\Models\TesPelatihan;
use App\Models\TesSoal;
use App\Services\PdfPrintService;
use App\Services\Tes\AnalisisTesService;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Hasil dan analisis pre-test/post-test satu pelatihan, ekspor Excel, dan
 * cetak PDF (laporan hasil dan daftar hadir). Hanya admin dan super-admin.
 *
 * PDF memakai preset baku aplikasi: Browsershot memotret halaman React
 * /edukasi/hasil/{id}/cetak, bukan templat Blade terpisah.
 */
class TesHasilController extends Controller
{
    public function __construct(private AnalisisTesService $analisis) {}

    public function hasil(Request $request, TesPelatihan $pelatihan): Response
    {
        TesKelolaController::pastikanAdmin($request);

        return Inertia::render('edukasi/Hasil', $this->props($pelatihan));
    }

    public function cetak(Request $request, TesPelatihan $pelatihan): Response
    {
        TesKelolaController::pastikanAdmin($request);
        $jenis = $request->validate(['jenis' => ['nullable', Rule::in(['laporan', 'hadir'])]])['jenis'] ?? 'laporan';

        return Inertia::render('edukasi/CetakHasil', $this->props($pelatihan) + [
            'jenisCetak' => $jenis,
            'dicetakPada' => now()->locale('id')->translatedFormat('j F Y, H.i'),
        ]);
    }

    public function pdf(Request $request, TesPelatihan $pelatihan): \Symfony\Component\HttpFoundation\Response
    {
        TesKelolaController::pastikanAdmin($request);
        $jenis = $request->validate(['jenis' => ['nullable', Rule::in(['laporan', 'hadir'])]])['jenis'] ?? 'laporan';
        $nama = ($jenis === 'hadir' ? 'Daftar-Hadir-' : 'Hasil-Pre-Post-Test-').preg_replace('/[^A-Za-z0-9]+/', '-', $pelatihan->nama);

        return PdfPrintService::downloadFromUrl($request, url("/edukasi/hasil/{$pelatihan->id}/cetak?jenis={$jenis}"), $nama);
    }

    public function excel(Request $request, TesPelatihan $pelatihan): StreamedResponse
    {
        TesKelolaController::pastikanAdmin($request);
        $a = $this->analisis->lengkap($pelatihan);
        $soal = ['pre' => $this->analisis->bankSoal('pre'), 'post' => $this->analisis->bankSoal('post')];

        $buku = new Spreadsheet;
        $buku->getProperties()->setTitle('Hasil Pre-Test dan Post-Test '.$pelatihan->nama)->setCreator('MR Kabar');

        // 1. Ringkasan
        $ws = $buku->getActiveSheet();
        $ws->setTitle('Ringkasan');
        $baris = [
            ['Hasil Pre-Test dan Post-Test', $pelatihan->nama],
            ['Tanggal', $pelatihan->tanggal?->format('d-m-Y') ?? '-'],
            ['Tempat', $pelatihan->tempat ?? '-'],
            [],
            ['Ukuran', 'Pre-Test', 'Post-Test'],
        ];
        foreach (['n' => 'Jumlah peserta', 'rata' => 'Rata-rata', 'median' => 'Median', 'sd' => 'Simpangan baku', 'min' => 'Terendah', 'max' => 'Tertinggi'] as $k => $label) {
            $baris[] = [$label, $a['pre']['deskripsi'][$k], $a['post']['deskripsi'][$k]];
        }
        $t = $a['peningkatan']['uji_t'];
        $baris[] = [];
        $baris[] = ['Peserta berpasangan (ikut keduanya)', $a['peningkatan']['n']];
        $baris[] = ['Rata-rata kenaikan nilai', $a['peningkatan']['rata_kenaikan']];
        $baris[] = ['Rata-rata N-gain', $a['peningkatan']['rata_ngain']];
        $baris[] = ['N-gain tinggi / sedang / rendah', implode(' / ', $a['peningkatan']['kategori_ngain'])];
        $baris[] = ['Uji-t berpasangan: t', $t['t'] ?? '-'];
        $baris[] = ['Derajat bebas (df)', $t['df'] ?? '-'];
        $baris[] = ['Nilai-p (dua sisi)', $t ? (($t['p_kurang_dari'] ?? false) ? '< 0,0001' : $t['p']) : '-'];
        $baris[] = ['Ukuran efek (dz)', $t['d'] ?? '-'];
        $baris[] = ['Signifikan (p < 0,05)', $t === null || $t['signifikan'] === null ? '-' : ($t['signifikan'] ? 'Ya' : 'Tidak')];
        $baris[] = [];
        $baris[] = ['Bagian', 'Pre-Test (% benar)', 'Post-Test (% benar)', 'Kategori Post-Test'];
        foreach ($a['bagian'] as $b) {
            $baris[] = [$b['bagian'].'. '.$b['nama'], $b['pre'], $b['post'], $b['kategori_post'] ?? '-'];
        }
        $ws->fromArray($baris, null, 'A1');
        $this->rapikan($ws, 4);

        // 2. Peringkat dan peningkatan
        $ws = $buku->createSheet()->setTitle('Peningkatan');
        $isi = [['Peringkat', 'Nama', 'NIP', 'Jabatan', 'SKPK/Instansi', 'Pre-Test', 'Post-Test', 'Kenaikan', 'N-gain', 'Kategori N-gain', 'Mengisi pre-test', 'Mengisi post-test']];
        $preById = collect($a['pre']['peserta'])->keyBy('id');
        $postById = collect($a['post']['peserta'])->keyBy('id');
        foreach ($a['pasangan'] as $p) {
            $isi[] = [$p['peringkat'], $p['nama'], $p['nip'] ? ' '.$p['nip'] : 'Bukan ASN', $p['jabatan'], $p['instansi'], $p['pre'], $p['post'], $p['kenaikan'], $p['ngain'], $p['kategori'] ? ucfirst($p['kategori']) : '-', $this->rentang($preById->get($p['id_pre'])), $this->rentang($postById->get($p['id_post']))];
        }
        $ws->fromArray($isi, null, 'A1');
        $this->rapikan($ws, 12, true);

        // 3-4. Rincian per sesi: nilai, waktu, jawaban per nomor
        foreach (['pre' => 'Pre-Test', 'post' => 'Post-Test'] as $jenis => $judul) {
            $ws = $buku->createSheet()->setTitle($judul);
            $kepala = ['Peringkat', 'Nama', 'NIP', 'Jabatan', 'SKPK/Instansi', 'Nilai', 'Benar', 'Dijawab', 'Waktu jawaban benar (ms)', 'Total waktu (detik)', 'Keluar halaman', 'Pindah perangkat', 'Bergabung', 'Biodata diisi', 'Jawaban pertama', 'Jawaban terakhir'];
            foreach (TesSoal::BAGIAN as $no => $nama) {
                $kepala[] = 'Bagian '.$no.' benar';
            }
            for ($n = 1; $n <= 20; $n++) {
                $kepala[] = 'No '.$n.' ('.($soal[$jenis][$n]->kunci ?? '?').')';
            }
            $isi = [$kepala];
            foreach ($a[$jenis]['peserta'] as $r) {
                $baris = [$r['peringkat'], $r['nama'], $r['nip'] ? ' '.$r['nip'] : 'Bukan ASN', $r['jabatan'], $r['instansi'], $r['nilai'], $r['benar'], $r['dijawab'], $r['waktu_benar_ms'], round($r['total_waktu_ms'] / 1000, 1), $r['jumlah_keluar'], $r['pindah_perangkat'], $this->waktu($r['bergabung_pada']), $this->waktu($r['biodata_pada']), $this->waktu($r['jawaban_pertama']), $this->waktu($r['jawaban_terakhir'])];
                foreach (array_keys(TesSoal::BAGIAN) as $no) {
                    $baris[] = $r['per_bagian'][$no] ?? 0;
                }
                for ($n = 1; $n <= 20; $n++) {
                    $baris[] = isset($r['pilihan'][$n]) ? $r['pilihan'][$n].' ('.round(($r['waktu'][$n] ?? 0) / 1000, 1).' dtk, pukul '.$this->waktu($r['dijawab_pada'][$n] ?? null, 'H.i.s').')' : '-';
                }
                $isi[] = $baris;
            }
            $ws->fromArray($isi, null, 'A1');
            $this->rapikan($ws, count($kepala), true);
        }

        // 5. Analisis butir
        $ws = $buku->createSheet()->setTitle('Analisis Butir');
        $isi = [['Tes', 'Nomor', 'Bagian', 'Indikator', 'Kunci', 'Benar', 'Tingkat kesukaran', 'Kategori', 'Daya beda', 'Kategori daya beda', 'A', 'B', 'C', 'D', 'Kosong', 'Pengecoh tidak dipilih', 'Rata-rata waktu (dtk)']];
        foreach (['pre' => 'Pre', 'post' => 'Post'] as $jenis => $judul) {
            foreach ($a[$jenis]['butir'] as $b) {
                $isi[] = [$judul, $b['nomor'], $b['bagian'], $b['indikator'], $b['kunci'], $b['benar'], $b['kesukaran'], $b['kategori_kesukaran'], $b['daya_beda'], $b['kategori_daya_beda'], $b['sebaran']['A'], $b['sebaran']['B'], $b['sebaran']['C'], $b['sebaran']['D'], $b['sebaran']['kosong'], implode(', ', $b['pengecoh_tidak_dipilih']), $b['rata_waktu_detik']];
            }
        }
        $ws->fromArray($isi, null, 'A1');
        $this->rapikan($ws, 17, true);

        // 6. Per SKPK
        $ws = $buku->createSheet()->setTitle('Per SKPK');
        $isi = [['SKPK/Instansi', 'Peserta pre', 'Peserta post', 'Rata-rata pre', 'Rata-rata post', 'Rata-rata kenaikan']];
        foreach ($a['skpk'] as $s) {
            $isi[] = [$s['instansi'], $s['n_pre'], $s['n_post'], $s['rata_pre'], $s['rata_post'], $s['rata_kenaikan']];
        }
        $ws->fromArray($isi, null, 'A1');
        $this->rapikan($ws, 6, true);

        $buku->setActiveSheetIndex(0);
        $namaBerkas = 'Hasil-Pre-Post-Test-'.preg_replace('/[^A-Za-z0-9]+/', '-', $pelatihan->nama).'.xlsx';

        return response()->streamDownload(function () use ($buku) {
            (new Xlsx($buku))->save('php://output');
        }, $namaBerkas, ['Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']);
    }

    /** @return array<string, mixed> */
    private function props(TesPelatihan $pelatihan): array
    {
        $pelatihan->load('sesi');
        $soal = [];
        foreach (['pre', 'post'] as $jenis) {
            $soal[$jenis] = $this->analisis->bankSoal($jenis)->values()->map(fn (TesSoal $s) => [
                'nomor' => $s->nomor,
                'bagian' => $s->bagian,
                'indikator' => $s->indikator,
                'pertanyaan' => $s->pertanyaan,
                'pilihan' => $s->pilihan(),
                'kunci' => $s->kunci,
            ]);
        }

        return [
            'pelatihan' => [
                'id' => $pelatihan->id,
                'nama' => $pelatihan->nama,
                'tanggal' => $pelatihan->tanggal?->toDateString(),
                'tempat' => $pelatihan->tempat,
                'sesi' => $pelatihan->sesi->map(fn ($s) => ['id' => $s->id, 'jenis' => $s->jenis, 'status' => $s->status, 'mulai_pada' => $s->mulai_pada?->toIso8601String(), 'selesai_pada' => $s->selesai_pada?->toIso8601String()])->values(),
            ],
            'analisis' => $this->analisis->lengkap($pelatihan),
            'soal' => $soal,
            'bagian' => TesSoal::BAGIAN,
        ];
    }

    /** Tanggal dan jam dalam zona waktu aplikasi (WIB), mis. 21-11-2026 17.44.10. */
    private function waktu(?string $iso, string $format = 'd-m-Y H.i.s'): string
    {
        return $iso ? Carbon::parse($iso)->timezone(config('app.timezone'))->format($format) : '-';
    }

    /** Rentang mengisi satu sesi: jawaban pertama sampai terakhir (atau saat biodata diisi). */
    private function rentang(?array $r): string
    {
        if (! $r) {
            return '-';
        }
        $mulai = $r['jawaban_pertama'] ?? $r['biodata_pada'];
        $akhir = $r['jawaban_terakhir'];

        return $akhir && $akhir !== $mulai ? $this->waktu($mulai).' - '.$this->waktu($akhir, 'H.i.s') : $this->waktu($mulai);
    }

    private function rapikan(Worksheet $ws, int $kolom, bool $kepalaDiBarisPertama = false): void
    {
        for ($i = 1; $i <= $kolom; $i++) {
            $ws->getColumnDimensionByColumn($i)->setAutoSize(true);
        }
        if ($kepalaDiBarisPertama) {
            $akhir = Coordinate::stringFromColumnIndex($kolom);
            $ws->getStyle("A1:{$akhir}1")->getFont()->setBold(true);
            $ws->getStyle("A1:{$akhir}1")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('DCE6F1');
            $ws->freezePane('C2');
        } else {
            $ws->getStyle('A1')->getFont()->setBold(true)->setSize(13);
        }
    }
}
