<?php

namespace App\Http\Controllers\Pkpt;

use App\Http\Controllers\Concerns\MenjagaPeriodePkpt;
use App\Http\Controllers\Controller;
use App\Models\Pkpt\PkptPenilaian;
use App\Models\Pkpt\PkptPeriode;
use App\Services\Pkpt\PkptKesiapanService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

/**
 * Ikhtisar PPBR dan pengelolaan Periode PKPT.
 *
 * Halaman ini pintu masuk modul: memilih periode, melihat panel Kesiapan
 * Data, menghitung ulang, dan menetapkan periode ketika PKPT-nya sudah siap
 * dilampirkan pada Keputusan Inspektur.
 */
class PkptPeriodeController extends Controller
{
    use MenjagaPeriodePkpt;

    public function __construct(private readonly PkptKesiapanService $kesiapan) {}

    public function index(Request $request)
    {
        $periode = $this->periodeAktif($request);

        return Inertia::render('pkpt/Ikhtisar', [
            ...$this->konteksPkpt($request, $periode),
            'kesiapan' => $periode ? $this->kesiapan->untukPeriode($periode) : null,
            'ringkasan' => $periode ? $this->ringkasan($periode) : null,
            'tahunRisikoTersedia' => $this->tahunRisikoTersedia(),
        ]);
    }

    /** Sebaran hasil hitung terakhir per zona, untuk kartu di Ikhtisar. */
    private function ringkasan(PkptPeriode $periode): array
    {
        $penilaian = PkptPenilaian::where('periode_id', $periode->id)->get();

        return [
            'dinilai' => $penilaian->whereNotNull('total_nilai_risiko')->count(),
            'belum_dinilai' => $penilaian->whereNull('total_nilai_risiko')->count(),
            'per_zona' => $penilaian->whereNotNull('zona')->groupBy('zona')
                ->map->count()->all(),
            'dihitung_pada' => $penilaian->max('dihitung_pada'),
        ];
    }

    /**
     * Tahun penilaian risiko yang benar-benar ada isinya di MR Kabar.
     *
     * Dipakai pemilih "tahun dasar risiko" saat membuat periode, supaya tidak
     * ada yang membuat PKPT bertumpu pada tahun yang datanya kosong lalu
     * bingung kenapa seluruh Areanya tanpa risiko.
     */
    private function tahunRisikoTersedia(): array
    {
        return collect(['tbl_irs_pemda', 'tbl_irs_pd', 'tbl_iro_pd'])
            ->flatMap(fn ($t) => DB::table($t)->whereNull('deleted_at')
                ->distinct()->pluck('TAHUN DINILAI RISIKO'))
            ->filter()->map(fn ($t) => (int) $t)->unique()->sortDesc()->values()->all();
    }

    public function store(Request $request)
    {
        $this->pastikanIzin($request, 'pkpt-input');

        $data = $request->validate([
            'tahun_pkpt' => ['required', 'integer', 'min:2000', 'max:2100', 'unique:pkpt_periode,tahun_pkpt'],
            'tahun_dasar_risiko' => ['required', 'integer', 'min:2000', 'max:2100'],
            'total_belanja_langsung' => ['nullable', 'integer', 'min:0'],
            'catatan' => ['nullable', 'string', 'max:2000'],
        ], [], [
            'tahun_pkpt' => 'Tahun PKPT',
            'tahun_dasar_risiko' => 'Tahun dasar risiko',
        ]);

        $periode = PkptPeriode::create($data);

        return redirect()->route('pkpt.index', ['periode' => $periode->id])
            ->with('success', 'Periode PKPT '.$periode->tahun_pkpt.' dibuat.');
    }

    public function update(Request $request, PkptPeriode $periode)
    {
        $this->pastikanBolehMengisi($request, $periode);

        $periode->update($request->validate([
            'tahun_dasar_risiko' => ['required', 'integer', 'min:2000', 'max:2100'],
            'total_belanja_langsung' => ['nullable', 'integer', 'min:0'],
            'catatan' => ['nullable', 'string', 'max:2000'],
        ]));

        return back()->with('success', 'Periode PKPT diperbarui.');
    }

    /**
     * Mengunci periode.
     *
     * Sesudah ini seluruh penulisan kertas kerja periode tersebut ditolak
     * 423. Yang boleh melakukannya hanya pemegang pkpt-tetapkan, karena
     * inilah saat angka-angkanya menjadi lampiran Keputusan.
     */
    public function tetapkan(Request $request, PkptPeriode $periode)
    {
        $this->pastikanIzin($request, 'pkpt-tetapkan');
        $this->pastikanPeriodeTerbuka($periode);

        $data = $request->validate([
            'nomor_keputusan' => ['required', 'string', 'max:255'],
            'tanggal_penetapan' => ['required', 'date'],
        ]);

        $periode->update([
            ...$data,
            'status' => 'ditetapkan',
            'ditetapkan_oleh' => $request->user()->id,
        ]);

        return back()->with('success', 'Periode PKPT '.$periode->tahun_pkpt.' ditetapkan dan dikunci.');
    }

    /**
     * Membuka kembali periode yang sudah ditetapkan.
     *
     * Hanya super-admin, dan wajib beralasan. Membuka kembali berarti dokumen
     * yang sudah ditandatangani akan berubah, jadi alasannya harus tercatat
     * di Audit Log bersama siapa yang melakukannya.
     */
    public function bukaKembali(Request $request, PkptPeriode $periode)
    {
        abort_unless(
            $request->user()?->hasRole('super-admin'),
            403,
            'Hanya Super Admin yang dapat membuka kembali periode PKPT yang sudah ditetapkan.'
        );

        $data = $request->validate([
            'alasan' => ['required', 'string', 'min:10', 'max:1000'],
        ], [
            'alasan.required' => 'Alasan membuka kembali wajib diisi.',
            'alasan.min' => 'Alasan terlalu pendek; tuliskan apa yang membuat periode ini harus diubah lagi.',
        ]);

        $riwayat = trim(($periode->catatan ?? '')."\n"
            .'['.now()->format('d-m-Y H:i').'] Dibuka kembali oleh '
            .$request->user()->name.': '.$data['alasan']);

        $periode->update(['status' => 'rancangan', 'catatan' => $riwayat]);

        return back()->with('success', 'Periode PKPT '.$periode->tahun_pkpt.' dibuka kembali.');
    }
}
