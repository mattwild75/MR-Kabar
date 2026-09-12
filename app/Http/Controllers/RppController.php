<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Rpp;
use App\Models\RppCategory;
use App\Models\RppPenugasan;
use App\Models\RppSetting;
use App\Models\RppTeamMember;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

/**
 * RPP Perencanaan — ERPIKA > Perencanaan.
 *
 * Satu baris tabel = satu dokumen RPP (nomor, bulan, tanggal) berikut
 * penugasan-penugasannya; tombol cetak Tabel dan Pengantar ada di tiap baris
 * (RppPrintController). Bentuk datanya mengikuti berkas RPP*.xls Bagian
 * Perencanaan, lihat migrasi 2026_09_12_120000.
 */
class RppController extends Controller
{
    public function index(Request $request)
    {
        $tahun = (int) $request->input('tahun', Rpp::max('year') ?: now()->year);
        $jenis = $request->input('jenis');
        $cari = trim((string) $request->input('cari', ''));

        $query = Rpp::with(['category', 'user:id,name', 'penugasan.teamMembers', 'penugasan.obriks'])
            ->where('year', $tahun)
            ->orderByRaw('COALESCE(tanggal_rpp, created_at)')
            ->orderBy('nomor_rpp');

        if (! $request->user()->canViewAllOpd()) {
            $query->where('user_id', $request->user()->id);
        }
        if ($jenis) {
            $query->where('rpp_category_id', $jenis);
        }
        if ($cari !== '') {
            $query->where(function ($q) use ($cari) {
                $q->where('nomor_rpp', 'like', "%{$cari}%")
                    ->orWhereHas('penugasan', fn ($p) => $p->where('uraian', 'like', "%{$cari}%")
                        ->orWhereHas('obriks', fn ($o) => $o->where('nama', 'like', "%{$cari}%"))
                        ->orWhereHas('teamMembers', fn ($t) => $t->where('nama', 'like', "%{$cari}%")));
            });
        }

        $rpps = $query->get()->map(function (Rpp $r) {
            $ringkas = $r->ringkasan();

            return [
                'id' => $r->id,
                'nomor_rpp' => $r->nomor_rpp,
                'year' => $r->year,
                'bulan' => $r->bulan,
                'sub_judul' => $r->subJudulTampil(),
                'tanggal_rpp' => $r->tanggal_rpp?->toDateString(),
                'tarif_per_hari' => $r->tarifBerlaku(),
                'category' => ['id' => $r->category?->id, 'name' => $r->category?->name, 'kode_nomor' => $r->category?->kode_nomor],
                'pembuat' => $r->user?->name,
                'ringkasan' => $ringkas,
                'penugasan' => $r->penugasan->map(fn (RppPenugasan $p) => [
                    'id' => $p->id,
                    'urutan' => $p->urutan,
                    'uraian' => $p->uraian,
                    'obriks' => $p->obriks->pluck('nama')->all(),
                    'sifat' => $p->sifat,
                    'jumlah_laporan' => $p->jumlah_laporan,
                    'tmt' => $p->tmtTampil(),
                    'nomor_st' => $p->nomor_st,
                    'status' => $p->status,
                    'ketua_tim' => $p->teamMembers->firstWhere('role', 'ketua_tim')?->nama,
                    'tim' => $p->teamMembers->map(fn (RppTeamMember $m) => [
                        'nama' => $m->nama, 'peran' => $m->peranTampil(), 'hari' => (int) $m->hari_kantor + (int) $m->hari_lapangan,
                    ])->all(),
                ])->all(),
            ];
        });

        return Inertia::render('rpp/Index', [
            'rpps' => $rpps,
            'categories' => RppCategory::orderBy('order')->get(['id', 'code', 'name', 'kode_nomor']),
            'tahunTersedia' => Rpp::select('year')->distinct()->orderByDesc('year')->pluck('year')->all(),
            'filters' => ['tahun' => $tahun, 'jenis' => $jenis, 'cari' => $cari],
            'inspektur' => RppSetting::inspektur()?->only(['nama', 'nip']),
        ]);
    }

    public function create()
    {
        return Inertia::render('rpp/Form', $this->propFormulir(null));
    }

    public function store(Request $request)
    {
        $data = $this->validasi($request);

        DB::transaction(function () use ($request, $data) {
            $rpp = Rpp::create([...$data['dokumen'], 'user_id' => $request->user()->id]);
            $this->simpanPenugasan($rpp, $data['penugasan']);
        });

        return redirect()->route('rpp.index', ['tahun' => $data['dokumen']['year']])->with('success', 'RPP '.$data['dokumen']['nomor_rpp'].' disimpan.');
    }

    public function edit(Request $request, Rpp $rpp)
    {
        $this->pastikanMilik($request, $rpp);

        return Inertia::render('rpp/Form', $this->propFormulir($rpp));
    }

    public function update(Request $request, Rpp $rpp)
    {
        $this->pastikanMilik($request, $rpp);
        $data = $this->validasi($request, $rpp->id);

        DB::transaction(function () use ($rpp, $data) {
            $rpp->update($data['dokumen']);
            $rpp->penugasan()->delete();
            $this->simpanPenugasan($rpp, $data['penugasan']);
        });

        return redirect()->route('rpp.index', ['tahun' => $data['dokumen']['year']])->with('success', 'RPP '.$rpp->nomor_rpp.' diperbarui.');
    }

    public function destroy(Request $request, Rpp $rpp)
    {
        $this->pastikanMilik($request, $rpp);
        $rpp->delete();

        return redirect()->back()->with('success', 'RPP '.$rpp->nomor_rpp.' dipindahkan ke Data Terhapus.');
    }

    private function pastikanMilik(Request $request, Rpp $rpp): void
    {
        if (! $request->user()->canViewAllOpd() && $rpp->user_id !== $request->user()->id) {
            abort(403, 'Anda tidak dapat mengubah RPP milik pengguna lain.');
        }
    }

    private function propFormulir(?Rpp $rpp): array
    {
        $rpp?->load(['penugasan.teamMembers', 'penugasan.obriks', 'penugasan.laporans']);

        return [
            'rpp' => $rpp ? [
                ...$rpp->only(['id', 'rpp_category_id', 'year', 'bulan', 'nomor_rpp', 'judul', 'sub_judul', 'tarif_per_hari', 'surat_dasar_uraian', 'hal', 'tujuan_surat', 'dengan_penutup']),
                'tanggal_rpp' => $rpp->tanggal_rpp?->toDateString(),
                'tanggal_surat' => $rpp->tanggal_surat?->toDateString(),
                'penugasan' => $rpp->penugasan->map(fn (RppPenugasan $p) => [
                    ...$p->only(['urutan', 'uraian', 'sifat', 'jumlah_laporan', 'tmt_teks', 'nomor_sp', 'nomor_st', 'nomor_kp', 'capaian_output', 'status']),
                    'masa_tugas_mulai' => $p->masa_tugas_mulai?->toDateString(),
                    'masa_tugas_selesai' => $p->masa_tugas_selesai?->toDateString(),
                    'tanggal_st' => $p->tanggal_st?->toDateString(),
                    'obriks' => $p->obriks->pluck('nama')->all(),
                    'tim' => $p->teamMembers->map(fn (RppTeamMember $m) => $m->only(['employee_id', 'role', 'peran_teks', 'nama', 'nip', 'pangkat', 'golongan', 'hari_kantor', 'hari_lapangan', 'tarif_per_hari']))->all(),
                    'laporans' => $p->laporans->map(fn ($l) => ['nomor_laporan' => $l->nomor_laporan, 'tanggal_laporan' => $l->tanggal_laporan?->toDateString()])->all(),
                ])->all(),
            ] : null,
            'categories' => RppCategory::orderBy('order')->get(['id', 'code', 'name', 'kode_nomor', 'sebutan']),
            'employees' => Employee::orderBy('nama')->get(['id', 'nama', 'nip', 'pangkat', 'golongan', 'jabatan']),
            'tarifBaku' => (int) RppSetting::current()->tarif_per_hari,
            'inspektur' => RppSetting::inspektur()?->only(['id', 'nama', 'nip', 'pangkat', 'golongan']),
            'sifatTersedia' => RppPenugasan::whereNotNull('sifat')->distinct()->orderBy('sifat')->pluck('sifat')->all(),
            'tahunBerjalan' => now()->year,
        ];
    }

    private function validasi(Request $request, ?int $abaikanId = null): array
    {
        $v = $request->validate([
            'rpp_category_id' => ['required', 'exists:rpp_categories,id'],
            'year' => ['required', 'integer', 'min:2000', 'max:2100'],
            'bulan' => ['nullable', 'integer', 'min:1', 'max:12'],
            'nomor_rpp' => ['required', 'string', 'max:255', Rule::unique('rpps', 'nomor_rpp')->where('year', $request->input('year'))->ignore($abaikanId)],
            'judul' => ['nullable', 'string', 'max:255'],
            'sub_judul' => ['nullable', 'string', 'max:255'],
            'tanggal_rpp' => ['nullable', 'date'],
            'tarif_per_hari' => ['nullable', 'integer', 'min:0'],
            'tanggal_surat' => ['nullable', 'date'],
            'surat_dasar_uraian' => ['nullable', 'string'],
            'hal' => ['nullable', 'string', 'max:255'],
            'tujuan_surat' => ['nullable', 'string', 'max:255'],
            'dengan_penutup' => ['required', 'boolean'],

            'penugasan' => ['required', 'array', 'min:1'],
            'penugasan.*.uraian' => ['required', 'string'],
            'penugasan.*.sifat' => ['nullable', 'string', 'max:100'],
            'penugasan.*.jumlah_laporan' => ['nullable', 'integer', 'min:0'],
            'penugasan.*.masa_tugas_mulai' => ['nullable', 'date'],
            'penugasan.*.masa_tugas_selesai' => ['nullable', 'date', 'after_or_equal:penugasan.*.masa_tugas_mulai'],
            'penugasan.*.tmt_teks' => ['nullable', 'string', 'max:255'],
            'penugasan.*.nomor_sp' => ['nullable', 'string', 'max:255'],
            'penugasan.*.nomor_st' => ['nullable', 'string', 'max:255'],
            'penugasan.*.tanggal_st' => ['nullable', 'date'],
            'penugasan.*.nomor_kp' => ['nullable', 'string', 'max:255'],
            'penugasan.*.capaian_output' => ['nullable', 'string', 'max:255'],
            'penugasan.*.status' => ['required', Rule::in(RppPenugasan::STATUS)],
            'penugasan.*.obriks' => ['nullable', 'array'],
            'penugasan.*.obriks.*' => ['nullable', 'string', 'max:255'],
            'penugasan.*.tim' => ['required', 'array', 'min:1'],
            'penugasan.*.tim.*.employee_id' => ['nullable', 'exists:employees,id'],
            'penugasan.*.tim.*.role' => ['required', Rule::in(array_keys(RppTeamMember::PERAN))],
            'penugasan.*.tim.*.peran_teks' => ['nullable', 'string', 'max:100'],
            'penugasan.*.tim.*.nama' => ['required', 'string', 'max:255'],
            'penugasan.*.tim.*.nip' => ['nullable', 'string', 'max:50'],
            'penugasan.*.tim.*.pangkat' => ['nullable', 'string', 'max:100'],
            'penugasan.*.tim.*.golongan' => ['nullable', 'string', 'max:20'],
            'penugasan.*.tim.*.hari_kantor' => ['nullable', 'integer', 'min:0'],
            'penugasan.*.tim.*.hari_lapangan' => ['nullable', 'integer', 'min:0'],
            'penugasan.*.tim.*.tarif_per_hari' => ['nullable', 'integer', 'min:0'],
            'penugasan.*.laporans' => ['nullable', 'array'],
            'penugasan.*.laporans.*.nomor_laporan' => ['required', 'string', 'max:255'],
            'penugasan.*.laporans.*.tanggal_laporan' => ['nullable', 'date'],
        ], [
            'penugasan.required' => 'Isi sedikitnya satu penugasan.',
            'penugasan.*.uraian.required' => 'Uraian obrik penugasan wajib diisi.',
            'penugasan.*.tim.required' => 'Tiap penugasan harus punya tim.',
            'nomor_rpp.unique' => 'Nomor RPP ini sudah dipakai pada tahun yang sama.',
        ]);

        return [
            'dokumen' => collect($v)->except('penugasan')->all(),
            'penugasan' => $v['penugasan'],
        ];
    }

    private function simpanPenugasan(Rpp $rpp, array $daftar): void
    {
        foreach (array_values($daftar) as $i => $p) {
            $penugasan = $rpp->penugasan()->create([
                ...collect($p)->except(['obriks', 'tim', 'laporans'])->all(),
                'urutan' => $i + 1,
            ]);

            foreach (array_values(array_filter($p['obriks'] ?? [], fn ($o) => filled($o))) as $j => $nama) {
                $penugasan->obriks()->create(['nama' => $nama, 'order' => $j]);
            }

            foreach (array_values($p['tim']) as $j => $m) {
                $penugasan->teamMembers()->create([
                    ...collect($m)->only(['role', 'peran_teks', 'nama', 'nip', 'pangkat', 'golongan', 'hari_kantor', 'hari_lapangan', 'tarif_per_hari'])->all(),
                    'employee_id' => $this->pegawaiUntuk($m)->id,
                    'order' => $j,
                ]);
            }

            foreach (array_values($p['laporans'] ?? []) as $j => $l) {
                $penugasan->laporans()->create([...$l, 'order' => $j]);
            }
        }
    }

    /**
     * Anggota tim selalu terikat ke daftar pegawai (sumber tunggal ERPIKA):
     * nama yang diketik di luar daftar didaftarkan sebagai pegawai baru, dicari
     * dulu lewat NIP lalu nama supaya tidak menggandakan orang yang sama.
     */
    private function pegawaiUntuk(array $m): Employee
    {
        if (! empty($m['employee_id'])) {
            return Employee::findOrFail($m['employee_id']);
        }
        if (! empty($m['nip']) && ($ada = Employee::where('nip', $m['nip'])->first())) {
            return $ada;
        }
        if ($ada = Employee::whereRaw('LOWER(nama) = ?', [mb_strtolower(trim($m['nama']))])->first()) {
            return $ada;
        }

        return Employee::create([
            'nama' => trim($m['nama']),
            'nip' => $m['nip'] ?? null,
            'pangkat' => $m['pangkat'] ?? null,
            'golongan' => $m['golongan'] ?? null,
        ]);
    }
}
