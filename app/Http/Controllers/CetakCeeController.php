<?php

namespace App\Http\Controllers;

use App\Models\CeeJawaban;
use App\Models\CeeKelemahanDokumen;
use App\Models\CeeSimpulan;
use App\Models\CeeUnsur;
use App\Models\Opd;
use App\Models\PengaturanPemda;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Form Cetak CEE — 1a (Rekapitulasi Kuesioner), 1b (CEE Berdasarkan Dokumen),
 * 1c (Simpulan Survei Persepsi), sesuai Lampiran 5 Perdep PPKD No.4/2019.
 * Cetak ukuran A4. Read-only — datanya sama dgn yg diisi lewat Form Input CEE.
 */
class CetakCeeController extends Controller
{
    /**
     * PIC biasa (role 'user', punya opd_id) hanya melihat OPD miliknya
     * sendiri di dropdown — akun bersama CEE_Survey & Admin/Super Admin
     * (opd_id null / role admin) tetap melihat semua OPD.
     */
    private function opdOptions(Request $request)
    {
        $user = $request->user();
        if ($user->opd_id && !$user->hasAnyRole(['admin', 'super-admin', 'cee-survey'])) {
            return Opd::where('id', $user->opd_id)->get(['id', 'nama']);
        }

        return Opd::orderBy('nama')->get(['id', 'nama']);
    }

    /**
     * PIC biasa (punya opd_id) hanya boleh cetak/unduh CEE OPD miliknya
     * sendiri. Akun bersama CEE_Survey & Admin/Super Admin tidak dibatasi.
     */
    private function ensureOpdAccess(Request $request, ?int $opdId): void
    {
        $user = $request->user();
        if (!$opdId || !$user->opd_id || $user->hasAnyRole(['admin', 'super-admin', 'cee-survey'])) {
            return;
        }

        if ($opdId !== $user->opd_id) {
            abort(403, 'Anda hanya dapat mengakses CEE untuk OPD Anda sendiri.');
        }
    }

    /** Nama Pemda utk judul 1b/1c — dari pengaturan Pemda-wide (dikelola Admin/Super Admin). */
    private function pemerintahKabkota(): string
    {
        return PengaturanPemda::current()->pemerintah_kabkota ?: 'Pemerintah Kabupaten Aceh Barat';
    }

    /**
     * Sama seperti CeeFormController::hitungRekap1a — dipakai jg utk cetak.
     * Setiap responden diberi SLOT (R1, R2, ...) yg KONSISTEN di semua baris
     * pertanyaan, berdasarkan urutan dia pertama kali menjawab (opd+tahun
     * yg sama) — sesuai tampilan asli Form 1a Perdep (kolom R1..Rn tetap,
     * bukan digabung jadi satu kolom seperti sebelumnya.
     */
    private function hitungRekap1a(int $opdId, int $tahun): array
    {
        $jawaban = CeeJawaban::where('opd_id', $opdId)
            ->where('tahun_penilaian', $tahun)
            ->orderBy('id')
            ->get();

        // Urutan slot responden: nama unik (case-insensitive+trim) sesuai
        // kemunculan pertama, dipakai sbg indeks kolom R1..Rn di semua baris.
        $rendenSlot = [];
        foreach ($jawaban as $j) {
            $key = mb_strtolower(trim($j->responden_nama));
            if (!array_key_exists($key, $rendenSlot)) {
                $rendenSlot[$key] = count($rendenSlot);
            }
        }
        $jumlahResponden = count($rendenSlot);

        $byPertanyaan = $jawaban->groupBy('cee_pertanyaan_id');

        $perPertanyaan = [];
        foreach ($byPertanyaan as $pertanyaanId => $rows) {
            $nilaiList = $rows->pluck('nilai')->all();
            $modus = $this->modus($nilaiList);

            $nilaiPerSlot = array_fill(0, $jumlahResponden, null);
            foreach ($rows as $r) {
                $slot = $rendenSlot[mb_strtolower(trim($r->responden_nama))];
                $nilaiPerSlot[$slot] = $r->nilai;
            }

            $perPertanyaan[$pertanyaanId] = [
                'responden' => $rows->map(fn ($r) => [
                    'nama' => $r->responden_nama,
                    'jabatan' => $r->responden_jabatan,
                    'nilai' => $r->nilai,
                ])->values(),
                'nilai_urut' => $rows->pluck('nilai')->values(),
                'nilai_per_slot' => $nilaiPerSlot,
                'modus' => $modus,
                'simpulan' => $modus !== null ? ($modus >= 3 ? 'Memadai' : 'Kurang Memadai') : null,
            ];
        }

        return [
            'per_pertanyaan' => $perPertanyaan,
            'jumlah_responden' => $jumlahResponden,
        ];
    }

    private function modus(array $values): ?int
    {
        if (empty($values)) {
            return null;
        }
        $counts = array_count_values($values);
        arsort($counts);
        $maxCount = reset($counts);
        $candidates = array_keys(array_filter($counts, fn ($c) => $c === $maxCount));

        return max($candidates);
    }

    public function cetak1a(Request $request)
    {
        $opdId = $request->integer('opd_id') ?: $request->user()->opd_id;
        $this->ensureOpdAccess($request, $opdId);
        $tahun = $request->integer('tahun') ?: (int) date('Y');
        $opd = $opdId ? Opd::find($opdId) : null;

        $unsurs = CeeUnsur::with(['pertanyaan' => fn ($q) => $q->where('aktif', true)->orderBy('urutan')])
            ->orderBy('urutan')
            ->get();

        $hasil = $opdId ? $this->hitungRekap1a($opdId, $tahun) : ['per_pertanyaan' => [], 'jumlah_responden' => 0];
        $rekap = $hasil['per_pertanyaan'];

        // Simpulan per unsur: "Memadai" hanya jika SEMUA pertanyaan unsur itu memadai.
        $simpulanUnsur = [];
        foreach ($unsurs as $unsur) {
            $simpulanList = $unsur->pertanyaan->map(fn ($p) => $rekap[$p->id]['simpulan'] ?? null)->filter();
            $simpulanUnsur[$unsur->id] = $simpulanList->isEmpty()
                ? null
                : ($simpulanList->contains('Kurang Memadai') ? 'Kurang Memadai' : 'Memadai');
        }

        return Inertia::render('cee/cetak/Cetak1a', [
            'opdOptions' => $this->opdOptions($request),
            'opd' => $opd,
            'tahun' => $tahun,
            'unsurs' => $unsurs,
            'rekap' => $rekap,
            'jumlahResponden' => $hasil['jumlah_responden'],
            'simpulanUnsur' => $simpulanUnsur,
            'pemerintahKabkota' => $this->pemerintahKabkota(),
        ]);
    }

    public function cetak1b(Request $request)
    {
        $opdId = $request->integer('opd_id') ?: $request->user()->opd_id;
        $this->ensureOpdAccess($request, $opdId);
        $tahun = $request->integer('tahun') ?: (int) date('Y');
        $opd = $opdId ? Opd::find($opdId) : null;

        return Inertia::render('cee/cetak/Cetak1b', [
            'opdOptions' => $this->opdOptions($request),
            'opd' => $opd,
            'tahun' => $tahun,
            'entries' => $opdId
                ? CeeKelemahanDokumen::with('unsur')
                    ->where('opd_id', $opdId)
                    ->where('tahun_penilaian', $tahun)
                    ->orderBy('cee_unsur_id')
                    ->get()
                : [],
            'pemerintahKabkota' => $this->pemerintahKabkota(),
        ]);
    }

    public function cetak1c(Request $request)
    {
        $opdId = $request->integer('opd_id') ?: $request->user()->opd_id;
        $this->ensureOpdAccess($request, $opdId);
        $tahun = $request->integer('tahun') ?: (int) date('Y');
        $opd = $opdId ? Opd::find($opdId) : null;

        $unsurs = CeeUnsur::with('pertanyaan')->orderBy('urutan')->get();
        $rows = [];

        if ($opdId) {
            $rekap1a = $this->hitungRekap1a($opdId, $tahun)['per_pertanyaan'];
            $kelemahan1b = CeeKelemahanDokumen::where('opd_id', $opdId)->where('tahun_penilaian', $tahun)->get();
            $simpulan = CeeSimpulan::where('opd_id', $opdId)->where('tahun_penilaian', $tahun)->get()->keyBy('cee_unsur_id');

            foreach ($unsurs as $unsur) {
                $rows[] = $this->buildRow1c($unsur, $rekap1a, $kelemahan1b, $simpulan);
            }
        }

        return Inertia::render('cee/cetak/Cetak1c', [
            'opdOptions' => $this->opdOptions($request),
            'opd' => $opd,
            'tahun' => $tahun,
            'rows' => $rows,
            'pemerintahKabkota' => $this->pemerintahKabkota(),
        ]);
    }

    /**
     * Satu baris tabel Form 1c, sesuai Lampiran 5 Perdep: Hasil Reviu Dokumen
     * (Hasil + Uraian) DAN Hasil Survei Persepsi (Hasil + Uraian) sbg 2 grup
     * kolom terpisah — bukan digabung jadi 1 kolom seperti sebelumnya.
     * Uraian Survei diturunkan dari pertanyaan 1a yg "Kurang Memadai" pada
     * unsur ini (tidak ada field bebas terpisah utk itu di skema).
     */
    private function buildRow1c($unsur, array $rekap1a, $kelemahan1b, $simpulan): array
    {
        $simpulanList = $unsur->pertanyaan->map(fn ($p) => $rekap1a[$p->id]['simpulan'] ?? null)->filter();
        $hasilSurvei = $simpulanList->isEmpty()
            ? null
            : ($simpulanList->contains('Kurang Memadai') ? 'Kurang Memadai' : 'Memadai');

        $uraianSurvei = $unsur->pertanyaan
            ->filter(fn ($p) => ($rekap1a[$p->id]['simpulan'] ?? null) === 'Kurang Memadai')
            ->map(fn ($p) => $p->pertanyaan)
            ->implode('; ');

        $kelemahanUnsur = $kelemahan1b->where('cee_unsur_id', $unsur->id)->values();
        $hasilDokumen = $kelemahanUnsur->isEmpty() ? 'Memadai' : 'Kurang Memadai';

        return [
            'unsur' => $unsur,
            'hasil_dokumen' => $hasilDokumen,
            'uraian_dokumen' => $kelemahanUnsur->pluck('uraian_kelemahan')->implode('; '),
            'hasil_survei' => $hasilSurvei,
            'uraian_survei' => $uraianSurvei,
            'simpulan' => $simpulan->get($unsur->id),
        ];
    }

    public function pdf1a(Request $request)
    {
        $opdId = $request->integer('opd_id') ?: null;
        $this->ensureOpdAccess($request, $opdId);
        $tahun = $request->integer('tahun') ?: (int) date('Y');
        $opd = $opdId ? Opd::findOrFail($opdId) : abort(404);

        $unsurs = CeeUnsur::with(['pertanyaan' => fn ($q) => $q->where('aktif', true)->orderBy('urutan')])
            ->orderBy('urutan')
            ->get();

        $hasil = $this->hitungRekap1a($opdId, $tahun);
        $rekap = $hasil['per_pertanyaan'];
        $jumlahResponden = $hasil['jumlah_responden'];

        $simpulanUnsur = [];
        foreach ($unsurs as $unsur) {
            $simpulanList = $unsur->pertanyaan->map(fn ($p) => $rekap[$p->id]['simpulan'] ?? null)->filter();
            $simpulanUnsur[$unsur->id] = $simpulanList->isEmpty()
                ? null
                : ($simpulanList->contains('Kurang Memadai') ? 'Kurang Memadai' : 'Memadai');
        }

        $pemerintahKabkota = $this->pemerintahKabkota();

        $pdf = Pdf::loadView('cee.pdf-1a', compact('opd', 'tahun', 'unsurs', 'rekap', 'simpulanUnsur', 'jumlahResponden', 'pemerintahKabkota'))
            ->setPaper('a4', 'portrait');

        return $pdf->download("CEE-1a-{$opd->nama}-{$tahun}.pdf");
    }

    public function pdf1b(Request $request)
    {
        $opdId = $request->integer('opd_id') ?: null;
        $this->ensureOpdAccess($request, $opdId);
        $tahun = $request->integer('tahun') ?: (int) date('Y');
        $opd = $opdId ? Opd::findOrFail($opdId) : abort(404);

        $entries = CeeKelemahanDokumen::with('unsur')
            ->where('opd_id', $opdId)
            ->where('tahun_penilaian', $tahun)
            ->orderBy('cee_unsur_id')
            ->get();

        $pemerintahKabkota = $this->pemerintahKabkota();

        $pdf = Pdf::loadView('cee.pdf-1b', compact('opd', 'tahun', 'entries', 'pemerintahKabkota'))
            ->setPaper('a4', 'portrait');

        return $pdf->download("CEE-1b-{$opd->nama}-{$tahun}.pdf");
    }

    public function pdf1c(Request $request)
    {
        $opdId = $request->integer('opd_id') ?: null;
        $this->ensureOpdAccess($request, $opdId);
        $tahun = $request->integer('tahun') ?: (int) date('Y');
        $opd = $opdId ? Opd::findOrFail($opdId) : abort(404);

        $unsurs = CeeUnsur::with('pertanyaan')->orderBy('urutan')->get();
        $rows = [];

        $rekap1a = $this->hitungRekap1a($opdId, $tahun)['per_pertanyaan'];
        $kelemahan1b = CeeKelemahanDokumen::where('opd_id', $opdId)->where('tahun_penilaian', $tahun)->get();
        $simpulan = CeeSimpulan::where('opd_id', $opdId)->where('tahun_penilaian', $tahun)->get()->keyBy('cee_unsur_id');

        foreach ($unsurs as $unsur) {
            $rows[] = $this->buildRow1c($unsur, $rekap1a, $kelemahan1b, $simpulan);
        }

        $pemerintahKabkota = $this->pemerintahKabkota();

        $pdf = Pdf::loadView('cee.pdf-1c', compact('opd', 'tahun', 'rows', 'pemerintahKabkota'))
            ->setPaper('a4', 'portrait');

        return $pdf->download("CEE-1c-{$opd->nama}-{$tahun}.pdf");
    }
}
