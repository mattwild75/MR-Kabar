<?php

namespace App\Http\Controllers;

use App\Models\Opd;
use App\Models\PengaturanPemda;
use App\Models\StrukturPengelolaRisiko;
use App\Services\PdfPrintService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

/**
 * Struktur pengelolaan Risiko — halaman cetak sekaligus tempat menyuntingnya.
 *
 * Perdep PPKD 4/2019 Lampiran 2 memuat contoh Keputusan Kepala Daerah tentang
 * struktur ini. Yang direkam di sini bukan sekadar naskah cetak: susunannya
 * tersimpan sebagai data supaya dapat dirujuk aplikasi — siapa Unit Kepatuhan,
 * siapa Koordinator, siapa anggota UPR tiap OPD.
 *
 * Cetak PDF memakai preset baku aplikasi ini: memotret halaman React yang sama
 * lewat PdfPrintService, BUKAN Blade/DomPDF terpisah — supaya yang tercetak
 * persis yang terlihat di layar.
 */
class CetakStrukturPengelolaController extends Controller
{
    /**
     * Menyunting susunan hanya untuk Admin dan Super Admin. Halamannya sendiri
     * boleh dibuka siapa saja yang berhak melihat Form Cetak, sebab justru
     * gunanya supaya seluruh Pengguna tahu kepada siapa mereka melapor.
     */
    private function ensureAdmin(): void
    {
        if (!auth()->user()?->canViewAllOpd()) {
            abort(403, 'Hanya Admin/Super Admin yang dapat mengubah struktur pengelolaan Risiko.');
        }
    }

    private function tahunAktif(Request $request): int
    {
        return $request->integer('tahun') ?: (int) PengaturanPemda::current()->tahun_penilaian;
    }

    public function index(Request $request)
    {
        $tahun = $this->tahunAktif($request);

        $baris = StrukturPengelolaRisiko::with('opd:id,nama')
            ->where('tahun', $tahun)
            ->orderBy('urutan')
            ->orderBy('id')
            ->get()
            ->map(fn($r) => [
                'id' => $r->id,
                'peran' => $r->peran,
                'peran_label' => $r->peranLabel(),
                'kedudukan' => $r->kedudukan,
                'kedudukan_label' => $r->kedudukanLabel(),
                'nama' => $r->nama,
                'jabatan' => $r->jabatan,
                'opd_id' => $r->opd_id,
                'opd_nama' => $r->opd?->nama,
                'urutan' => $r->urutan,
                'tugas' => $r->tugas,
            ]);

        return Inertia::render('risiko/cetak/StrukturPengelola', [
            'tahun' => $tahun,
            // Tahun yang sudah punya susunan, supaya operator bisa berpindah
            // tanpa menebak. Tahun aktif selalu ikut walau masih kosong.
            'tahunOptions' => StrukturPengelolaRisiko::distinct()
                ->orderByDesc('tahun')
                ->pluck('tahun')
                ->push($tahun)
                ->unique()
                ->sortDesc()
                ->values()
                ->all(),
            'rows' => $baris,
            'peranOptions' => StrukturPengelolaRisiko::PERAN_LABEL,
            'kedudukanOptions' => StrukturPengelolaRisiko::KEDUDUKAN_LABEL,
            'opdOptions' => Opd::orderBy('nama')->get(['id', 'nama']),
            'canEdit' => (bool) $request->user()?->canViewAllOpd(),
            'pemerintahKabkota' => PengaturanPemda::current()->pemerintah_kabkota
                ?: 'Pemerintah Kabupaten Aceh Barat',
        ]);
    }

    private function aturan(): array
    {
        return [
            'tahun' => ['required', 'integer', 'digits:4', 'min:2000', 'max:2100'],
            'peran' => ['required', 'string', 'max:60'],
            'kedudukan' => ['nullable', Rule::in(array_keys(StrukturPengelolaRisiko::KEDUDUKAN_LABEL))],
            'nama' => ['nullable', 'string', 'max:255'],
            'jabatan' => ['nullable', 'string', 'max:255'],
            'opd_id' => ['nullable', 'integer', 'exists:opd,id'],
            'urutan' => ['nullable', 'integer', 'min:0', 'max:999'],
            'tugas' => ['nullable', 'string'],
        ];
    }

    public function store(Request $request)
    {
        $this->ensureAdmin();
        $data = $request->validate($this->aturan());

        // Urutan yang tidak diisi ditaruh paling belakang pada tahun itu,
        // bukan di 0 — kalau di 0, baris baru melompat ke puncak struktur.
        $data['urutan'] = $data['urutan']
            ?? ((int) StrukturPengelolaRisiko::where('tahun', $data['tahun'])->max('urutan') + 1);

        StrukturPengelolaRisiko::create($data);

        return back()->with('success', 'Susunan berhasil ditambahkan.');
    }

    public function update(Request $request, StrukturPengelolaRisiko $struktur)
    {
        $this->ensureAdmin();
        $data = $request->validate($this->aturan());
        $data['urutan'] = $data['urutan'] ?? $struktur->urutan;

        $struktur->update($data);

        return back()->with('success', 'Susunan berhasil diperbarui.');
    }

    public function destroy(StrukturPengelolaRisiko $struktur)
    {
        $this->ensureAdmin();
        $struktur->delete();

        return back()->with('success', 'Susunan berhasil dihapus.');
    }

    /**
     * Salin seluruh susunan tahun sebelumnya ke tahun yang dituju.
     *
     * Susunan berubah karena mutasi jabatan, bukan karena strukturnya
     * dirombak tiap tahun — mengetik ulang tujuh peran berikut tugasnya hanya
     * untuk mengganti beberapa nama adalah pekerjaan sia-sia yang justru
     * mengundang salah ketik.
     */
    public function salinDariTahunLalu(Request $request)
    {
        $this->ensureAdmin();
        $data = $request->validate([
            'tahun_sumber' => ['required', 'integer', 'digits:4'],
            'tahun_tujuan' => ['required', 'integer', 'digits:4', 'different:tahun_sumber'],
        ]);

        if (StrukturPengelolaRisiko::where('tahun', $data['tahun_tujuan'])->exists()) {
            return back()->with('error', 'Tahun tujuan sudah punya susunan. Kosongkan dulu bila memang ingin menyalin ulang.');
        }

        $sumber = StrukturPengelolaRisiko::where('tahun', $data['tahun_sumber'])->orderBy('urutan')->get();
        if ($sumber->isEmpty()) {
            return back()->with('error', 'Tahun sumber belum punya susunan yang bisa disalin.');
        }

        foreach ($sumber as $r) {
            StrukturPengelolaRisiko::create([
                'tahun' => $data['tahun_tujuan'],
                'peran' => $r->peran,
                'kedudukan' => $r->kedudukan,
                'nama' => $r->nama,
                'jabatan' => $r->jabatan,
                'opd_id' => $r->opd_id,
                'urutan' => $r->urutan,
                'tugas' => $r->tugas,
            ]);
        }

        return back()->with(
            'success',
            $sumber->count() . ' baris disalin dari tahun ' . $data['tahun_sumber']
            . '. Periksa kembali namanya, sebab jabatan bisa berpindah.'
        );
    }

    public function pdf(Request $request)
    {
        $tahun = $this->tahunAktif($request);
        $url = url("/cetak/struktur-pengelolaan-risiko?tahun={$tahun}");

        return PdfPrintService::downloadFromUrl($request, $url, "Struktur-Pengelolaan-Risiko-{$tahun}");
    }
}
