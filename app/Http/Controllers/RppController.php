<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Rpp;
use App\Models\RppCategory;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class RppController extends Controller
{
    public function index(Request $request)
    {
        $query = Rpp::with(['category', 'user', 'teamMembers', 'obriks', 'laporans'])
            ->orderByDesc('year')
            ->orderBy('nomor_rpp');

        // Admin/super-admin melihat seluruh RPP; user biasa hanya melihat
        // RPP yang ia input sendiri (tim disimpan sbg nama bebas, bukan
        // relasi ke users, jadi belum bisa di-scope per-nama anggota tim).
        if (! $request->user()->canViewAllOpd()) {
            $query->where('user_id', $request->user()->id);
        }

        if ($request->filled('year')) {
            $query->where('year', $request->input('year'));
        }

        if ($request->filled('rpp_category_id')) {
            $query->where('rpp_category_id', $request->input('rpp_category_id'));
        }

        $rpps = $query->paginate(25)->withQueryString();

        return Inertia::render('rpp/Index', [
            'rpps' => $rpps,
            'categories' => RppCategory::orderBy('order')->get(),
            'filters' => $request->only(['year', 'rpp_category_id']),
        ]);
    }

    public function create()
    {
        return Inertia::render('rpp/Form', [
            'categories' => RppCategory::orderBy('order')->get(),
            'employees' => Employee::orderBy('nama')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $this->validateRpp($request);

        $rpp = Rpp::create([
            ...$validated['rpp'],
            'user_id' => $request->user()->id,
        ]);

        $this->syncChildren($rpp, $validated);

        return redirect()->route('rpp.index')->with('success', 'RPP berhasil disimpan.');
    }

    public function edit(Request $request, Rpp $rpp)
    {
        if (! $request->user()->canViewAllOpd() && $rpp->user_id !== $request->user()->id) {
            abort(403, 'Anda tidak dapat mengubah RPP milik pengguna lain.');
        }

        $rpp->load(['teamMembers', 'obriks', 'laporans']);

        return Inertia::render('rpp/Form', [
            'rpp' => $rpp,
            'categories' => RppCategory::orderBy('order')->get(),
            'employees' => Employee::orderBy('nama')->get(),
        ]);
    }

    public function update(Request $request, Rpp $rpp)
    {
        if (! $request->user()->canViewAllOpd() && $rpp->user_id !== $request->user()->id) {
            abort(403, 'Anda tidak dapat mengubah RPP milik pengguna lain.');
        }

        $validated = $this->validateRpp($request, $rpp->id);

        $rpp->update($validated['rpp']);

        $rpp->teamMembers()->delete();
        $rpp->obriks()->delete();
        $rpp->laporans()->delete();
        $this->syncChildren($rpp, $validated);

        return redirect()->route('rpp.index')->with('success', 'RPP berhasil diperbarui.');
    }

    public function destroy(Request $request, Rpp $rpp)
    {
        if (! $request->user()->canViewAllOpd() && $rpp->user_id !== $request->user()->id) {
            abort(403, 'Anda tidak dapat menghapus RPP milik pengguna lain.');
        }

        $rpp->delete();

        return redirect()->route('rpp.index')->with('success', 'RPP berhasil dihapus.');
    }

    private function validateRpp(Request $request, ?int $ignoreId = null): array
    {
        $validated = $request->validate([
            'rpp_category_id' => ['required', 'exists:rpp_categories,id'],
            'year' => ['required', 'integer', 'min:2000', 'max:2100'],
            'bulan' => ['nullable', 'integer', 'min:1', 'max:12'],
            'nomor_rpp' => ['required', 'string', 'max:255'],
            'tanggal_rpp' => ['nullable', 'date'],
            'nomor_st' => ['nullable', 'string', 'max:255'],
            'tanggal_st' => ['nullable', 'date'],
            'uraian' => ['nullable', 'string'],
            'surat_dasar_uraian' => ['nullable', 'string'],
            'masa_tugas_mulai' => ['nullable', 'date'],
            'masa_tugas_selesai' => ['nullable', 'date'],
            'capaian_output' => ['nullable', 'string', 'max:255'],
            'status' => ['required', Rule::in(['draft', 'st_terbit', 'selesai', 'lhp_terbit'])],

            'team_members' => ['nullable', 'array'],
            'team_members.*.employee_id' => ['nullable', 'exists:employees,id'],
            'team_members.*.role' => ['required', Rule::in(['koordinator', 'ppj', 'ketua_tim', 'anggota_tim'])],
            'team_members.*.nama' => ['required', 'string', 'max:255'],
            'team_members.*.nip' => ['nullable', 'string', 'max:255'],
            'team_members.*.pangkat' => ['nullable', 'string', 'max:255'],
            'team_members.*.golongan' => ['nullable', 'string', 'max:255'],
            'team_members.*.hari_kantor' => ['nullable', 'integer', 'min:0'],
            'team_members.*.hari_lapangan' => ['nullable', 'integer', 'min:0'],

            'obriks' => ['nullable', 'array'],
            'obriks.*.nama' => ['required', 'string', 'max:255'],

            'laporans' => ['nullable', 'array'],
            'laporans.*.nomor_laporan' => ['required', 'string', 'max:255'],
            'laporans.*.tanggal_laporan' => ['nullable', 'date'],
        ]);

        return [
            'rpp' => collect($validated)->only([
                'rpp_category_id', 'year', 'bulan', 'nomor_rpp', 'tanggal_rpp', 'nomor_st', 'tanggal_st',
                'uraian', 'surat_dasar_uraian', 'masa_tugas_mulai', 'masa_tugas_selesai', 'capaian_output', 'status',
            ])->all(),
            'team_members' => $validated['team_members'] ?? [],
            'obriks' => $validated['obriks'] ?? [],
            'laporans' => $validated['laporans'] ?? [],
        ];
    }

    private function syncChildren(Rpp $rpp, array $validated): void
    {
        foreach ($validated['team_members'] as $i => $member) {
            $employee = $this->resolveEmployee($member);

            $rpp->teamMembers()->create([
                'employee_id' => $employee?->id,
                'role' => $member['role'],
                'nama' => $member['nama'],
                'nip' => $member['nip'] ?? null,
                'pangkat' => $member['pangkat'] ?? null,
                'golongan' => $member['golongan'] ?? null,
                'hari_kantor' => $member['hari_kantor'] ?? null,
                'hari_lapangan' => $member['hari_lapangan'] ?? null,
                'order' => $i,
            ]);
        }

        foreach ($validated['obriks'] as $i => $obrik) {
            $rpp->obriks()->create([...$obrik, 'order' => $i]);
        }

        foreach ($validated['laporans'] as $i => $laporan) {
            $rpp->laporans()->create([...$laporan, 'order' => $i]);
        }
    }

    /**
     * Employee = single source of truth (pola DataUmum di MR Kabar): kalau
     * baris tim ditautkan ke employee_id yg sudah ada, perubahan
     * nama/nip/pangkat/golongan di form RPP ini DITULIS BALIK ke row
     * employees yg sama, supaya RPP lain yg memakai orang yg sama ikut
     * ter-update (bukan snapshot lokal yg menyimpang dari master).
     */
    private function resolveEmployee(array $member): ?Employee
    {
        $attrs = [
            'nama' => $member['nama'],
            'nip' => $member['nip'] ?? null,
            'pangkat' => $member['pangkat'] ?? null,
            'golongan' => $member['golongan'] ?? null,
        ];

        if (! empty($member['employee_id'])) {
            $employee = Employee::find($member['employee_id']);
            if ($employee) {
                $employee->update($attrs);

                return $employee;
            }
        }

        if (! empty($member['nip'])) {
            return Employee::updateOrCreate(['nip' => $member['nip']], $attrs);
        }

        return Employee::create($attrs);
    }
}
