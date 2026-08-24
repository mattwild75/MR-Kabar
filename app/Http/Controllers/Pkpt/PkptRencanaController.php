<?php

namespace App\Http\Controllers\Pkpt;

use App\Http\Controllers\Concerns\MenjagaPeriodePkpt;
use App\Http\Controllers\Controller;
use App\Models\Pkpt\PkptPenilaian;
use App\Models\Pkpt\PkptPenugasanWajib;
use App\Models\Pkpt\PkptPeriode;
use App\Models\Pkpt\PkptRencana;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Formulir 13 dan 14 — usulan Kebijakan Pengawasan dan Program Kerja
 * Pengawasan Tahunan.
 *
 * Satu tabel dua tampilan. Jakwas menampilkan kolom yang dibutuhkan usulan
 * kebijakan (objek, total nilai risiko, jenis pengawasan, kebutuhan HP);
 * Program Kerja Tahunan menampilkan seluruh kolom termasuk jadwal, rincian
 * HP per jenjang, anggaran, dan sarana prasarana.
 */
class PkptRencanaController extends Controller
{
    use MenjagaPeriodePkpt;

    /** Jenis penugasan yang dikenal, untuk pilihan di layar. */
    public const JENIS_PENGAWASAN = [
        'Audit Kinerja',
        'Audit Ketaatan',
        'Audit Pengadaan Barang/Jasa',
        'Audit Tujuan Tertentu',
        'Reviu',
        'Evaluasi',
        'Monitoring',
        'Fasilitasi Penerapan Manajemen Risiko',
        'Pendampingan',
    ];

    public function jakwas(Request $request)
    {
        return $this->halaman($request, 'pkpt/Jakwas');
    }

    public function programKerja(Request $request)
    {
        return $this->halaman($request, 'pkpt/ProgramKerja');
    }

    private function halaman(Request $request, string $komponen)
    {
        $periode = $this->periodeWajib($request);

        return Inertia::render($komponen, [
            ...$this->konteksPkpt($request, $periode),
            'rencana' => PkptRencana::where('periode_id', $periode->id)
                ->orderBy('urutan')->orderByDesc('total_nilai_risiko')->get(),
            'jenisPengawasan' => self::JENIS_PENGAWASAN,
            'belumMasuk' => $this->belumMasuk($periode),
        ]);
    }

    /**
     * Area berperingkat dan penugasan wajib yang BELUM masuk rencana.
     *
     * Ditampilkan supaya yang tertinggal terlihat. Penugasan wajib yang belum
     * masuk diberi penanda tersendiri: melewatkannya bukan sekadar kurang
     * lengkap, melainkan menyalahi Diktum KELIMA.
     */
    private function belumMasuk(PkptPeriode $periode): array
    {
        $sudah = PkptRencana::where('periode_id', $periode->id)->pluck('nama_area')
            ->map(fn ($n) => mb_strtolower(trim($n)))->all();

        $adaDi = fn ($nama) => in_array(mb_strtolower(trim($nama)), $sudah, true);

        $berisiko = PkptPenilaian::where('periode_id', $periode->id)
            ->whereNotNull('total_nilai_risiko')
            ->with('area:id,nama')
            ->orderByDesc('total_nilai_risiko')->get()
            ->reject(fn ($p) => $adaDi($p->area?->nama ?? ''))
            ->map(fn ($p) => [
                'nama_area' => $p->area?->nama,
                'total_nilai_risiko' => $p->total_nilai_risiko,
                'tingkat_risiko' => $p->tingkat_risiko,
                'zona' => $p->zona,
                'sumber' => 'risiko',
            ])->values();

        $wajib = PkptPenugasanWajib::where('periode_id', $periode->id)
            ->where('jenis', 'wajib')->get()
            ->reject(fn ($w) => $adaDi($w->nama_area))
            ->map(fn ($w) => [
                'nama_area' => $w->nama_area,
                'total_nilai_risiko' => null,
                'tingkat_risiko' => null,
                'zona' => null,
                'sumber' => 'wajib',
                'alasan' => $w->alasan,
            ])->values();

        return ['berisiko' => $berisiko, 'wajib' => $wajib];
    }

    /**
     * Menyalin peringkat dan penugasan wajib menjadi baris rencana.
     *
     * Penugasan wajib disalin SELURUHNYA berapa pun nilai risikonya; Area
     * berisiko disalin sebanyak batas yang diminta. Yang sudah ada tidak
     * digandakan.
     */
    public function tarikDariPeringkat(Request $request)
    {
        $periode = $this->periodeWajib($request);
        $this->pastikanIzin($request, 'pkpt-rencana');
        $this->pastikanPeriodeTerbuka($periode);

        $batas = (int) $request->validate([
            'batas' => ['required', 'integer', 'min:1', 'max:500'],
        ])['batas'];

        $belum = $this->belumMasuk($periode);
        $urutan = (int) PkptRencana::where('periode_id', $periode->id)->max('urutan');
        $ditambah = 0;

        foreach ($belum['wajib'] as $w) {
            PkptRencana::create([
                'periode_id' => $periode->id,
                'nama_area' => $w['nama_area'],
                'sumber' => 'wajib',
                'keterangan' => $w['alasan'] ?? null,
                'urutan' => ++$urutan,
            ]);
            $ditambah++;
        }

        foreach ($belum['berisiko']->take($batas) as $p) {
            PkptRencana::create([
                'periode_id' => $periode->id,
                'nama_area' => $p['nama_area'],
                'total_nilai_risiko' => $p['total_nilai_risiko'],
                'tingkat_risiko' => $p['tingkat_risiko'],
                'sumber' => 'risiko',
                'urutan' => ++$urutan,
            ]);
            $ditambah++;
        }

        return back()->with('success', $ditambah.' baris rencana ditambahkan, '
            .count($belum['wajib']).' di antaranya penugasan wajib.');
    }

    public function store(Request $request)
    {
        $periode = $this->periodeWajib($request);
        $this->pastikanIzin($request, 'pkpt-rencana');
        $this->pastikanPeriodeTerbuka($periode);

        PkptRencana::create([
            ...$this->validasi($request),
            'periode_id' => $periode->id,
            'urutan' => (int) PkptRencana::where('periode_id', $periode->id)->max('urutan') + 1,
        ]);

        return back()->with('success', 'Baris rencana ditambahkan.');
    }

    public function update(Request $request, PkptRencana $rencana)
    {
        $this->pastikanIzin($request, 'pkpt-rencana');
        $this->pastikanPeriodeTerbuka($rencana->periode);

        $data = $this->validasi($request);
        $data['hp_jumlah'] = array_sum(array_map(
            fn ($k) => (int) ($data[$k] ?? 0),
            ['hp_pj', 'hp_wpj', 'hp_kt', 'hp_at']
        )) ?: null;

        $rencana->update($data);

        return back()->with('success', 'Baris rencana diperbarui.');
    }

    public function destroy(Request $request, PkptRencana $rencana)
    {
        $this->pastikanIzin($request, 'pkpt-rencana');
        $this->pastikanPeriodeTerbuka($rencana->periode);

        $rencana->delete();

        return back()->with('success', 'Baris rencana dihapus.');
    }

    private function validasi(Request $request): array
    {
        return $request->validate([
            'area_id' => ['nullable', 'integer', 'exists:pkpt_area_pengawasan,id'],
            'nama_area' => ['required', 'string', 'max:255'],
            'jenis_pengawasan' => ['nullable', 'string', 'max:255'],
            'tujuan_sasaran' => ['nullable', 'string', 'max:2000'],
            'ruang_lingkup' => ['nullable', 'string', 'max:255'],
            'rmp' => ['nullable', 'string', 'max:40'],
            'rpl' => ['nullable', 'string', 'max:40'],
            'hp_pj' => ['nullable', 'integer', 'min:0', 'max:999'],
            'hp_wpj' => ['nullable', 'integer', 'min:0', 'max:999'],
            'hp_kt' => ['nullable', 'integer', 'min:0', 'max:999'],
            'hp_at' => ['nullable', 'integer', 'min:0', 'max:999'],
            'anggaran' => ['nullable', 'integer', 'min:0'],
            'jumlah_laporan' => ['nullable', 'string', 'max:40'],
            'sarana_prasarana' => ['nullable', 'string', 'max:255'],
            'tingkat_risiko' => ['nullable', 'string', 'max:40'],
            'total_nilai_risiko' => ['nullable', 'numeric', 'min:0', 'max:5'],
            'sumber' => ['required', 'in:risiko,wajib,permintaan'],
            'keterangan' => ['nullable', 'string', 'max:1000'],
        ], [], ['nama_area' => 'Nama Area Pengawasan']);
    }
}
