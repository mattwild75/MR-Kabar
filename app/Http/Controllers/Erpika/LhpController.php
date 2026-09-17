<?php

namespace App\Http\Controllers\Erpika;

use App\Http\Controllers\Controller;
use App\Models\Lhp;
use App\Models\LhpTim;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

/**
 * ERPIKA > Laporan Penugasan > Database LHP.
 *
 * Manajemen Laporan Hasil Pemeriksaan (LHP) APIP: header LHP berikut rantai
 * Temuan → Penyebab → Rekomendasi → Tindak Lanjut. Menggantikan aplikasi
 * lama SimHPPemda (BPKP) — 1.212 LHP dipindahkan apa adanya. Berdiri sendiri
 * seperti seluruh ERPIKA (tabel lhp_*, tanpa FK ke domain MR Kabar).
 *
 * status_lhp: 00 cacat · 01 belum ada tindak lanjut · 02 tindak lanjut
 * sebagian · 03 tuntas — dipakai untuk pewarnaan hijau/kuning/merah.
 */
class LhpController extends Controller
{
    public function index(Request $request)
    {
        $cari = trim((string) $request->input('cari', ''));
        $tahun = $request->input('tahun'); // tahun terbit LHP (dari tanggal_lhp)
        $status = $request->input('status'); // 00|01|02|03
        $urut = $request->input('urut', 'terbaru'); // terbaru|terlama|nilai|obrik

        $q = Lhp::query()
            ->when($cari !== '', fn ($w) => $w->where(function ($x) use ($cari) {
                $x->where('nomor_lhp', 'like', "%{$cari}%")
                    ->orWhere('nama_obrik', 'like', "%{$cari}%")
                    ->orWhere('nomor_st', 'like', "%{$cari}%")
                    ->orWhere('nama_pj', 'like', "%{$cari}%");
            }))
            ->when($tahun, fn ($w) => $w->whereYear('tanggal_lhp', $tahun))
            ->when($status, fn ($w) => $w->where('status_lhp', $status))
            ->withCount('temuan');

        $q = match ($urut) {
            'terlama' => $q->orderByRaw('tanggal_lhp is null')->orderBy('tanggal_lhp')->orderBy('id'),
            'nilai' => $q->orderByDesc('nilai_tp'),
            'obrik' => $q->orderBy('nama_obrik'),
            default => $q->orderByRaw('tanggal_lhp is null')->orderByDesc('tanggal_lhp')->orderByDesc('id'),
        };

        $lhp = $q->paginate(20)->withQueryString()->through(fn (Lhp $l) => [
            'id' => $l->id,
            'nomor_lhp' => $l->nomor_lhp,
            'tanggal_lhp' => $l->tanggal_lhp?->toDateString(),
            'nomor_st' => $l->nomor_st,
            'nama_obrik' => $l->nama_obrik,
            'tahun_anggaran' => $l->tahun_anggaran,
            'nama_pj' => $l->nama_pj,
            'jml_tp' => $l->jml_tp,
            'nilai_tp' => (float) $l->nilai_tp,
            'jml_temuan' => $l->temuan_count,
            'status_lhp' => $l->status_lhp,
        ]);

        return Inertia::render('erpika/lhp/Index', [
            'lhp' => $lhp,
            'filters' => ['cari' => $cari, 'tahun' => $tahun ? (int) $tahun : null, 'status' => $status, 'urut' => $urut],
            'tahunTersedia' => Lhp::whereNotNull('tanggal_lhp')
                ->selectRaw('year(tanggal_lhp) as t')->distinct()->orderByDesc('t')->pluck('t')->all(),
            'ringkasan' => $this->ringkasan(),
        ]);
    }

    public function show(Lhp $lhp)
    {
        $lhp->load(['tim' => fn ($q) => $q->orderBy('no'),
            'temuan' => fn ($q) => $q->orderBy('no'),
            'temuan.sebab' => fn ($q) => $q->orderBy('no'),
            'temuan.sebab.rekomendasi' => fn ($q) => $q->orderBy('no'),
            'temuan.sebab.rekomendasi.tindakLanjut' => fn ($q) => $q->orderBy('no')->orderBy('tanggal')]);

        return Inertia::render('erpika/lhp/Show', [
            'lhp' => $this->detail($lhp),
        ]);
    }

    public function create()
    {
        return Inertia::render('erpika/lhp/Form', [
            'lhp' => null,
            'statusPilihan' => $this->statusPilihan(),
            'jabatanPilihan' => LhpTim::JABATAN,
        ]);
    }

    public function edit(Lhp $lhp)
    {
        $lhp->load(['tim' => fn ($q) => $q->orderBy('no'),
            'temuan' => fn ($q) => $q->orderBy('no'),
            'temuan.sebab' => fn ($q) => $q->orderBy('no'),
            'temuan.sebab.rekomendasi' => fn ($q) => $q->orderBy('no'),
            'temuan.sebab.rekomendasi.tindakLanjut' => fn ($q) => $q->orderBy('no')]);

        return Inertia::render('erpika/lhp/Form', [
            'lhp' => $this->detail($lhp),
            'statusPilihan' => $this->statusPilihan(),
            'jabatanPilihan' => LhpTim::JABATAN,
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validasi($request, null);
        $lhp = DB::transaction(fn () => $this->simpan(new Lhp, $data));

        return redirect()->route('erpika.lhp.show', $lhp)->with('success', "LHP {$lhp->nomor_lhp} disimpan.");
    }

    public function update(Request $request, Lhp $lhp)
    {
        $data = $this->validasi($request, $lhp->id);
        DB::transaction(fn () => $this->simpan($lhp, $data));

        return redirect()->route('erpika.lhp.show', $lhp)->with('success', "LHP {$lhp->nomor_lhp} diperbarui.");
    }

    public function destroy(Lhp $lhp)
    {
        $nomor = $lhp->nomor_lhp;
        $lhp->delete(); // soft delete; detail ikut lewat cascade saat forceDelete

        return redirect()->route('erpika.lhp.index')->with('success', "LHP {$nomor} dipindahkan ke data terhapus.");
    }

    /** @return array<string,mixed> */
    private function validasi(Request $request, ?int $abaikanId): array
    {
        return $request->validate([
            'nomor_lhp' => ['required', 'string', 'max:120', Rule::unique('lhp', 'nomor_lhp')->ignore($abaikanId)->whereNull('deleted_at')],
            'tanggal_lhp' => ['nullable', 'date'],
            'nomor_st' => ['nullable', 'string', 'max:60'],
            'tanggal_st' => ['nullable', 'date'],
            'tahun_anggaran' => ['nullable', 'string', 'max:12'],
            'nama_obrik' => ['required', 'string', 'max:950'],
            'nilai_anggaran' => ['nullable', 'numeric', 'min:0'],
            'realisasi_anggaran' => ['nullable', 'numeric', 'min:0'],
            'anggaran_diaudit' => ['nullable', 'numeric', 'min:0'],
            'status_lhp' => ['required', Rule::in(array_keys(Lhp::STATUS))],
            'nip_pj' => ['nullable', 'string', 'max:30'],
            'nama_pj' => ['nullable', 'string', 'max:100'],
            'tim' => ['nullable', 'array'],
            // nama boleh kosong di payload — baris kosong dibuang di simpan().
            'tim.*.nama' => ['nullable', 'string', 'max:120'],
            'tim.*.nip' => ['nullable', 'string', 'max:30'],
            'tim.*.jabatan' => ['nullable', 'string', 'max:200'],
            'temuan' => ['nullable', 'array'],
            'temuan.*.kode' => ['nullable', 'string', 'max:6'],
            'temuan.*.nilai' => ['nullable', 'numeric'],
            'temuan.*.memo' => ['required', 'string'],
            'temuan.*.sebab' => ['nullable', 'array'],
            'temuan.*.sebab.*.memo' => ['required', 'string'],
            'temuan.*.sebab.*.rekomendasi' => ['nullable', 'array'],
            'temuan.*.sebab.*.rekomendasi.*.nilai' => ['nullable', 'numeric'],
            'temuan.*.sebab.*.rekomendasi.*.memo' => ['required', 'string'],
            'temuan.*.sebab.*.rekomendasi.*.tindak_lanjut' => ['nullable', 'array'],
            'temuan.*.sebab.*.rekomendasi.*.tindak_lanjut.*.nilai' => ['nullable', 'numeric'],
            'temuan.*.sebab.*.rekomendasi.*.tindak_lanjut.*.tanggal' => ['nullable', 'date'],
            'temuan.*.sebab.*.rekomendasi.*.tindak_lanjut.*.memo' => ['nullable', 'string'],
        ]);
    }

    /** @param  array<string,mixed>  $data */
    private function simpan(Lhp $lhp, array $data): Lhp
    {
        $lhp->fill(collect($data)->except('temuan')->all());
        // Ringkasan TP dihitung dari temuan agar konsisten dengan isian.
        $temuan = $data['temuan'] ?? [];
        $lhp->jml_tp = count($temuan);
        $lhp->nilai_tp = collect($temuan)->sum(fn ($t) => (float) ($t['nilai'] ?? 0));
        $lhp->save();

        // Susunan tim: ganti seluruhnya.
        $lhp->tim()->delete();
        foreach ($data['tim'] ?? [] as $it => $m) {
            if (blank($m['nama'] ?? null)) {
                continue;
            }
            $lhp->tim()->create(['no' => $it + 1, 'nip' => $m['nip'] ?? null, 'nama' => $m['nama'], 'jabatan' => $m['jabatan'] ?? null]);
        }

        // Ganti seluruh rantai detail (paling sederhana dan konsisten).
        // Hapus temuan lama; FK cascadeOnDelete membuang sebab/rekomendasi/TL di bawahnya.
        $lhp->temuan()->get()->each->delete();
        foreach ($temuan as $it => $t) {
            $tem = $lhp->temuan()->create(['no' => $it + 1, 'kode' => $t['kode'] ?? null, 'nilai' => $t['nilai'] ?? null, 'memo' => $t['memo'], 'status' => $t['status'] ?? null]);
            foreach ($t['sebab'] ?? [] as $is => $s) {
                $seb = $tem->sebab()->create(['no' => $is + 1, 'memo' => $s['memo']]);
                foreach ($s['rekomendasi'] ?? [] as $ir => $r) {
                    $rek = $seb->rekomendasi()->create(['no' => $ir + 1, 'nilai' => $r['nilai'] ?? null, 'memo' => $r['memo']]);
                    foreach ($r['tindak_lanjut'] ?? [] as $itl => $tl) {
                        if (blank($tl['memo'] ?? null) && blank($tl['tanggal'] ?? null) && blank($tl['nilai'] ?? null)) {
                            continue;
                        }
                        $rek->tindakLanjut()->create(['no' => $itl + 1, 'nilai' => $tl['nilai'] ?? null, 'tanggal' => $tl['tanggal'] ?? null, 'memo' => $tl['memo'] ?? null]);
                    }
                }
            }
        }

        return $lhp;
    }

    /** @return array<string,mixed> */
    private function detail(Lhp $lhp): array
    {
        return [
            'id' => $lhp->id,
            'nomor_lhp' => $lhp->nomor_lhp,
            'tanggal_lhp' => $lhp->tanggal_lhp?->toDateString(),
            'nomor_st' => $lhp->nomor_st,
            'tanggal_st' => $lhp->tanggal_st?->toDateString(),
            'tahun_anggaran' => $lhp->tahun_anggaran,
            'nama_obrik' => $lhp->nama_obrik,
            'nilai_anggaran' => $lhp->nilai_anggaran !== null ? (float) $lhp->nilai_anggaran : null,
            'realisasi_anggaran' => $lhp->realisasi_anggaran !== null ? (float) $lhp->realisasi_anggaran : null,
            'anggaran_diaudit' => $lhp->anggaran_diaudit !== null ? (float) $lhp->anggaran_diaudit : null,
            'jml_tp' => $lhp->jml_tp,
            'nilai_tp' => $lhp->nilai_tp !== null ? (float) $lhp->nilai_tp : null,
            'status_lhp' => $lhp->status_lhp,
            'nip_pj' => $lhp->nip_pj,
            'nama_pj' => $lhp->nama_pj,
            'tim' => $lhp->tim->map(fn ($m) => [
                'id' => $m->id,
                'no' => $m->no,
                'nip' => $m->nip,
                'nama' => $m->nama,
                'jabatan' => $m->jabatan,
            ])->values()->all(),
            'temuan' => $lhp->temuan->map(fn ($t) => [
                'id' => $t->id,
                'no' => $t->no,
                'kode' => $t->kode,
                'nilai' => $t->nilai !== null ? (float) $t->nilai : null,
                'memo' => $t->memo,
                'status' => $t->status,
                'sebab' => $t->sebab->map(fn ($s) => [
                    'id' => $s->id,
                    'no' => $s->no,
                    'memo' => $s->memo,
                    'rekomendasi' => $s->rekomendasi->map(fn ($r) => [
                        'id' => $r->id,
                        'no' => $r->no,
                        'nilai' => $r->nilai !== null ? (float) $r->nilai : null,
                        'memo' => $r->memo,
                        'tindak_lanjut' => $r->tindakLanjut->map(fn ($tl) => [
                            'id' => $tl->id,
                            'no' => $tl->no,
                            'nilai' => $tl->nilai !== null ? (float) $tl->nilai : null,
                            'tanggal' => $tl->tanggal?->toDateString(),
                            'memo' => $tl->memo,
                        ])->values()->all(),
                    ])->values()->all(),
                ])->values()->all(),
            ])->values()->all(),
        ];
    }

    /** @return array<int,array{value:string,label:string}> */
    private function statusPilihan(): array
    {
        return collect(Lhp::STATUS)->map(fn ($label, $value) => ['value' => (string) $value, 'label' => $label])->values()->all();
    }

    /** @return array<string,mixed> */
    private function ringkasan(): array
    {
        $perStatus = Lhp::select('status_lhp', DB::raw('count(*) as jml'))->groupBy('status_lhp')->pluck('jml', 'status_lhp');

        return [
            'total' => Lhp::count(),
            'tuntas' => (int) ($perStatus['03'] ?? 0),
            'sebagian' => (int) ($perStatus['02'] ?? 0),
            'belum' => (int) ($perStatus['01'] ?? 0),
            'cacat' => (int) ($perStatus['00'] ?? 0),
            'total_temuan' => DB::table('lhp_temuan')->count(),
            'nilai_tp' => (float) Lhp::sum('nilai_tp'),
        ];
    }
}
