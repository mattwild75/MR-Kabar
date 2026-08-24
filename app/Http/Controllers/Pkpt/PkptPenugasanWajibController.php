<?php

namespace App\Http\Controllers\Pkpt;

use App\Http\Controllers\Concerns\MenjagaPeriodePkpt;
use App\Http\Controllers\Controller;
use App\Models\Pkpt\PkptAreaPengawasan;
use App\Models\Pkpt\PkptPenugasanWajib;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Formulir 11 dan 12 — penugasan yang wajib dimuat dalam PKPT tanpa
 * memperhatikan nilai risiko, dan Area yang justru tidak dimuat.
 *
 * Diktum KELIMA Keputusan Inspektur: penugasan amanat peraturan
 * perundang-undangan, permintaan pemangku kepentingan, dan pengaduan
 * masyarakat WAJIB masuk PKPT berapa pun nilai risikonya. Daftar ini yang
 * menjaga aturan itu tidak terlupakan saat peringkat risiko sudah tersusun
 * rapi dan tampak seperti jawaban akhir.
 */
class PkptPenugasanWajibController extends Controller
{
    use MenjagaPeriodePkpt;

    /** Contoh penugasan amanat peraturan, ditawarkan sebagai isian cepat. */
    public const USULAN_BAKU = [
        ['nama_area' => 'Reviu Rencana Kerja Pemerintah Daerah', 'dasar_hukum' => 'Peraturan Menteri Dalam Negeri Nomor 10 Tahun 2018'],
        ['nama_area' => 'Reviu Rencana Kerja dan Anggaran', 'dasar_hukum' => 'Peraturan Menteri Dalam Negeri Nomor 10 Tahun 2018'],
        ['nama_area' => 'Reviu Laporan Keuangan Pemerintah Daerah', 'dasar_hukum' => 'Peraturan Menteri Dalam Negeri Nomor 4 Tahun 2017'],
        ['nama_area' => 'Reviu Pengadaan Barang/Jasa', 'dasar_hukum' => 'Peraturan Pemerintah Nomor 60 Tahun 2008'],
        ['nama_area' => 'Reviu Dana Alokasi Khusus', 'dasar_hukum' => 'Peraturan Menteri Keuangan tentang Pengelolaan Transfer ke Daerah'],
        ['nama_area' => 'Monitoring Tindak Lanjut Hasil Pemeriksaan', 'dasar_hukum' => 'Kebijakan Pengawasan Kementerian Dalam Negeri'],
        ['nama_area' => 'Evaluasi Sistem Akuntabilitas Kinerja Instansi Pemerintah', 'dasar_hukum' => 'Peraturan Menteri PANRB Nomor 12 Tahun 2015'],
        ['nama_area' => 'Evaluasi Perencanaan dan Penganggaran Responsif Gender', 'dasar_hukum' => 'Peraturan Menteri Dalam Negeri Nomor 15 Tahun 2008'],
    ];

    public function index(Request $request)
    {
        $periode = $this->periodeWajib($request);

        return Inertia::render('pkpt/PenugasanWajib', [
            ...$this->konteksPkpt($request, $periode),
            'baris' => PkptPenugasanWajib::where('periode_id', $periode->id)
                ->orderBy('jenis')->orderBy('nama_area')->get(),
            'area' => PkptAreaPengawasan::where('periode_id', $periode->id)
                ->orderBy('nama')->get(['id', 'nama']),
            'usulanBaku' => self::USULAN_BAKU,
        ]);
    }

    public function store(Request $request)
    {
        $periode = $this->periodeWajib($request);
        $this->pastikanBolehMengisi($request, $periode);

        PkptPenugasanWajib::create([
            ...$this->validasi($request),
            'periode_id' => $periode->id,
        ]);

        return back()->with('success', 'Baris ditambahkan.');
    }

    public function update(Request $request, PkptPenugasanWajib $penugasan)
    {
        $this->pastikanBolehMengisi($request, $penugasan->periode);

        $penugasan->update($this->validasi($request));

        return back()->with('success', 'Baris diperbarui.');
    }

    public function destroy(Request $request, PkptPenugasanWajib $penugasan)
    {
        $this->pastikanBolehMengisi($request, $penugasan->periode);

        $penugasan->delete();

        return back()->with('success', 'Baris dihapus.');
    }

    private function validasi(Request $request): array
    {
        return $request->validate([
            'jenis' => ['required', 'in:wajib,tidak_dimuat'],
            'area_id' => ['nullable', 'integer', 'exists:pkpt_area_pengawasan,id'],
            'nama_area' => ['required', 'string', 'max:255'],
            'alasan' => ['required', 'string', 'max:255'],
            'dasar_hukum' => ['nullable', 'string', 'max:1000'],
            'keterangan' => ['nullable', 'string', 'max:1000'],
        ], [], [
            'nama_area' => 'Nama Area Pengawasan',
            'alasan' => 'Alasan',
        ]);
    }
}
