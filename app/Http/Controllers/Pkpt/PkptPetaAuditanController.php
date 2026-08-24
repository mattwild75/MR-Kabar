<?php

namespace App\Http\Controllers\Pkpt;

use App\Http\Controllers\Concerns\MenjagaPeriodePkpt;
use App\Http\Controllers\Controller;
use App\Models\Opd;
use App\Models\Pkpt\PkptAreaPengawasan;
use App\Services\Pkpt\PkptPetaAuditanService;
use Illuminate\Http\Request;
use Inertia\Inertia;

/** Formulir 1 — Peta Auditan. */
class PkptPetaAuditanController extends Controller
{
    use MenjagaPeriodePkpt;

    public function __construct(private readonly PkptPetaAuditanService $peta) {}

    public function index(Request $request)
    {
        $periode = $this->periodeWajib($request);

        return Inertia::render('pkpt/PetaAuditan', [
            ...$this->konteksPkpt($request, $periode),
            'area' => PkptAreaPengawasan::where('periode_id', $periode->id)
                ->with('opd:id,nama')
                ->orderBy('kelompok')->orderBy('nama')
                ->get(),
            'opd' => Opd::orderBy('nama')->get(['id', 'nama']),
        ]);
    }

    /**
     * Menarik Peta Auditan dari data yang sudah ada.
     *
     * Menambah, tidak menimpa. Suntingan tangan seperti pembagian Irban dan
     * pagu anggaran tidak boleh hilang hanya karena tombolnya ditekan lagi.
     */
    public function tarik(Request $request)
    {
        $periode = $this->periodeWajib($request);
        $this->pastikanBolehMengisi($request, $periode);

        $hasil = $this->peta->tarik($periode);

        $pesan = 'Ditambahkan '.$hasil['skpk'].' Perangkat Daerah dan '
            .$hasil['program_prioritas'].' Program Prioritas ke Peta Auditan.';
        if ($hasil['dilewati'] > 0) {
            $pesan .= ' '.$hasil['dilewati'].' baris dilewati karena sudah ada.';
        }

        return back()->with('success', $pesan);
    }

    public function store(Request $request)
    {
        $periode = $this->periodeWajib($request);
        $this->pastikanBolehMengisi($request, $periode);

        PkptAreaPengawasan::create([
            ...$this->validasi($request),
            'periode_id' => $periode->id,
        ]);

        return back()->with('success', 'Area Pengawasan ditambahkan.');
    }

    public function update(Request $request, PkptAreaPengawasan $area)
    {
        $this->pastikanBolehMengisi($request, $area->periode);

        $area->update($this->validasi($request));

        return back()->with('success', 'Area Pengawasan diperbarui.');
    }

    public function destroy(Request $request, PkptAreaPengawasan $area)
    {
        $this->pastikanBolehMengisi($request, $area->periode);

        $area->delete();

        return back()->with('success', 'Area Pengawasan dihapus.');
    }

    private function validasi(Request $request): array
    {
        return $request->validate([
            'kelompok' => ['required', 'in:program_prioritas,skpk,unit_lain'],
            'nama' => ['required', 'string', 'max:255'],
            'tujuan_sasaran' => ['nullable', 'string', 'max:2000'],
            'opd_id' => ['nullable', 'integer', 'exists:opd,id'],
            'opd_pendukung' => ['nullable', 'string', 'max:255'],
            'urusan' => ['nullable', 'string', 'max:255'],
            'pagu_anggaran' => ['nullable', 'integer', 'min:0'],
            'irban' => ['nullable', 'in:I,II,III,IV,Khusus'],
            'tahun_terakhir_diawasi' => ['nullable', 'integer', 'min:2000', 'max:2100'],
            'jenis_penugasan_terakhir' => ['nullable', 'string', 'max:255'],
            'keterangan' => ['nullable', 'string', 'max:2000'],
        ], [], [
            'kelompok' => 'Kelompok Area Pengawasan',
            'nama' => 'Nama Area Pengawasan',
            'pagu_anggaran' => 'Pagu anggaran',
        ]);
    }
}
