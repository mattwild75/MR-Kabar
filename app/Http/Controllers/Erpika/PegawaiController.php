<?php

namespace App\Http\Controllers\Erpika;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\RppPenugasan;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

/**
 * Daftar pegawai Inspektorat — ERPIKA > Pegawai.
 *
 * Sumber tunggal anggota tim RPP dan modul ERPIKA yang menyusul. Data yang
 * dipindahkan dari proyek ERPIKA tidak membawa NIP, pangkat, maupun golongan
 * satu pun; di sinilah tempat melengkapinya.
 *
 * Sengaja di bawah menu ERPIKA (namespace dan prefix /erpika), bukan di
 * Access/Utilities MR Kabar: pegawai Inspektorat bukan urusan PIC 49 OPD, dan
 * batas modulnya harus tetap terlihat saat ERPIKA tumbuh.
 *
 * Hanya akun lintas OPD (admin/super-admin).
 */
class PegawaiController extends Controller
{
    public function index(Request $request)
    {
        $this->pastikanAdmin($request);

        return Inertia::render('erpika/Pegawai', [
            'employees' => Employee::withCount('teamMemberships')->orderByDesc('aktif')->orderBy('nama')->get()
                ->map(fn (Employee $e) => [...$e->toArray(), 'penugasan' => $this->ringkasanPenugasan($e)]),
        ]);
    }

    public function store(Request $request)
    {
        $this->pastikanAdmin($request);

        Employee::create($this->validasiPegawai($request));

        return back()->with('success', 'Pegawai ditambahkan.');
    }

    public function update(Request $request, Employee $employee)
    {
        $this->pastikanAdmin($request);

        $data = $this->validasiPegawai($request, $employee);
        $employee->update($data);

        // Baris tim RPP menyimpan SALINAN nama/NIP/pangkat/golongan (supaya
        // cetakan lama tidak berubah kalau pegawainya kelak diganti). Tapi
        // perbaikan data pegawai — nama yang salah eja, NIP yang baru diisi —
        // memang dimaksudkan berlaku ke semua penugasannya; kalau tidak, 74
        // pegawai tanpa NIP tetap tanpa NIP di setiap cetakan.
        $employee->teamMemberships()->update([
            'nama' => $data['nama'],
            'nip' => $data['nip'] ?? null,
            'pangkat' => $data['pangkat'] ?? null,
            'golongan' => $data['golongan'] ?? null,
        ]);

        return back()->with('success', 'Pegawai diperbarui, berikut '.$employee->teamMemberships()->count().' baris tim yang memakainya.');
    }

    /**
     * Pegawai yang masih tercantum di tim RPP mana pun TIDAK bisa dihapus.
     * Menghapusnya membuat baris anggota tim kehilangan pegawainya diam-diam
     * — yang tersisa hanya salinan teks namanya.
     */
    public function destroy(Request $request, Employee $employee)
    {
        $this->pastikanAdmin($request);

        $dipakai = $employee->teamMemberships()->count();

        if ($dipakai > 0) {
            return back()->with('error', "Tidak bisa dihapus: masih tercantum pada {$dipakai} tim RPP. Ubah namanya, jangan dihapus.");
        }

        $employee->delete();

        return back()->with('success', 'Pegawai dihapus.');
    }

    private function validasiPegawai(Request $request, ?Employee $kecuali = null): array
    {
        return $request->validate([
            'nama' => ['required', 'string', 'max:255'],
            'nip' => ['nullable', 'string', 'max:30', 'unique:employees,nip'.($kecuali ? ','.$kecuali->id : '')],
            'pangkat' => ['nullable', 'string', 'max:100'],
            'golongan' => ['nullable', 'string', 'max:20'],
            'unit_kerja' => ['nullable', 'string', 'max:100'],
            'aktif' => ['nullable', 'boolean'],
            // "Inspektur" hanya boleh satu: dialah penanda tangan seluruh RPP.
            'jabatan' => ['nullable', 'string', 'max:100', Rule::when($request->input('jabatan') === 'Inspektur', ['unique:employees,jabatan'.($kecuali ? ','.$kecuali->id : '')])],
        ], ['jabatan.unique' => 'Sudah ada pegawai berjabatan Inspektur; ubah dulu jabatannya.']);
    }

    private function pastikanAdmin(Request $request): void
    {
        abort_unless($request->user()->canViewAllOpd(), 403, 'Daftar pegawai hanya untuk admin.');
    }

    /**
     * Rekam jejak penugasan seorang pegawai dari seluruh RPP: jumlah
     * penugasan, yang sedang minta nomor laporan (kuning), yang selesai
     * terbit laporan (hijau), dan penugasan terakhirnya (RPP, ST, obrik,
     * objek) — dari tabel yang sama dengan RPP Perencanaan/Aneva.
     */
    /** Info ringkas satu pegawai (dipakai tombol info di formulir RPP). */
    public function ringkasan(Request $request, Employee $employee)
    {
        return response()->json([
            ...$employee->only(['id', 'nama', 'nip', 'pangkat', 'golongan', 'jabatan', 'unit_kerja', 'aktif']),
            'penugasan' => $this->ringkasanPenugasan($employee),
        ]);
    }

    private function ringkasanPenugasan(Employee $e): array
    {
        $daftar = RppPenugasan::whereHas('teamMembers', fn ($q) => $q->where('employee_id', $e->id))
            ->with(['rpp:id,nomor_rpp,year,tanggal_rpp,rpp_category_id', 'rpp.category:id,name', 'obriks:id,rpp_penugasan_id,nama,order'])
            ->get();
        $terakhir = $daftar->sortByDesc(fn ($p) => ($p->tanggal_st?->toDateString() ?? $p->rpp->tanggal_rpp?->toDateString() ?? $p->rpp->year.'-00-00').'|'.$p->id)->first();

        return [
            'total' => $daftar->count(),
            'kuning' => $daftar->where('status', 'nomor_diminta')->count(),
            'hijau' => $daftar->where('status', 'lhp_terbit')->count(),
            'merah' => $daftar->whereNotIn('status', ['nomor_diminta', 'lhp_terbit', 'batal'])->count(),
            // pembagian per jenis penugasan (Reviu, Khusus, ...) berikut warnanya
            'per_jenis' => $daftar->groupBy(fn ($p) => $p->rpp->category?->name ?? 'Lain-lain')
                ->map(fn ($k, $nama) => [
                    'jenis' => $nama,
                    'total' => $k->count(),
                    'hijau' => $k->where('status', 'lhp_terbit')->count(),
                    'kuning' => $k->where('status', 'nomor_diminta')->count(),
                    'merah' => $k->whereNotIn('status', ['nomor_diminta', 'lhp_terbit', 'batal'])->count(),
                ])->sortByDesc('total')->values()->all(),
            'per_tahun' => $daftar->groupBy(fn ($p) => $p->rpp->year)->map(fn ($k) => $k->count())->sortKeysDesc()->all(),
            'terakhir' => $terakhir ? [
                'rpp' => $terakhir->rpp->nomor_rpp,
                'st' => $terakhir->nomor_st,
                'tanggal' => ($terakhir->tanggal_st ?? $terakhir->rpp->tanggal_rpp)?->toDateString(),
                'tmt' => $terakhir->tmtTampil(),
                'obrik' => $terakhir->uraian,
                'objek' => $terakhir->obriks->pluck('nama')->all(),
                'status' => $terakhir->status,
            ] : null,
        ];
    }
}
