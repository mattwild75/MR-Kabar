<?php

namespace App\Http\Controllers;

use App\Models\RiskEntitasPenilai;
use App\Models\RiskImpactCriteria;
use App\Models\RiskJenis;
use App\Models\RiskLevel;
use App\Models\RiskLikelihoodCriteria;
use App\Models\RiskMatrixCell;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

/**
 * CRUD utk 7 kategori data referensi risiko (Settings > Keterangan
 * Pendukung) — dulu hardcoded di kode (irs-reference-data.ts + duplikasi
 * 3x di IrsPemda/IrsPd/IroPd Controller), sekarang tabel DB yang bisa
 * diedit Admin/Super Admin tanpa perlu deploy ulang kode.
 *
 * OPD (tabel `opd`) TIDAK dikelola di sini krn sudah lama jadi tabel
 * sendiri — cukup List/Create/Update/Delete sederhana lewat method
 * opd() di bawah, menyatu dgn 7 tab yg sama di frontend.
 *
 * Akses dibatasi lewat menu permission 'keterangan-pendukung-view' (fail
 * kalau bukan admin/super-admin — HANYA role tsb yg diberi permission ini
 * di RolePermissionSeeder, sesuai pola app-settings-view/menu-view dkk).
 */
class KeteranganPendukungController extends Controller
{
    /**
     * Lapis kedua di luar permission_name menu — semua method CRUD di
     * controller ini SEBELUMNYA tidak punya pengecekan role sama sekali,
     * murni bergantung pada middleware menu.permission (permission
     * "keterangan-pendukung-view"). Ditambahkan di sini sbg defense-in-
     * depth, konsisten dgn pola TrashController/RiskExcelController: kalau
     * permission menu suatu saat ke-assign keliru ke role lain lewat UI
     * Role Management, endpoint tulis tetap tertutup bagi non-admin.
     */
    private function ensureAdmin(): void
    {
        if (!auth()->user()?->hasAnyRole(['admin', 'super-admin'])) {
            abort(403, 'Hanya Admin/Super Admin yang dapat mengelola Keterangan Pendukung.');
        }
    }

    public function index(Request $request)
    {
        $this->ensureAdmin();

        $tab = $request->string('tab', 'kriteria_dampak')->toString();

        return Inertia::render('keterangan-pendukung/Index', [
            'tab' => $tab,
            'kriteriaDampak' => RiskImpactCriteria::orderBy('level')->get(),
            'kriteriaKemungkinan' => RiskLikelihoodCriteria::orderBy('level')->get(),
            'matrixCells' => RiskMatrixCell::orderBy('dampak')->orderBy('kemungkinan')->get(),
            'riskLevels' => RiskLevel::orderBy('urutan')->get(),
            'jenisRisiko' => RiskJenis::orderBy('urutan')->get(),
            'entitasPenilai' => RiskEntitasPenilai::orderBy('urutan')->get(),
            'opdList' => \App\Models\Opd::orderBy('nama')->get(),
        ]);
    }

    // ── Kriteria Dampak ──────────────────────────────────────────────
    public function updateImpactCriteria(Request $request, RiskImpactCriteria $criteria)
    {
        $this->ensureAdmin();

        $data = $request->validate([
            'label' => ['nullable', 'string', 'max:255'],
            'kerugian_negara' => ['nullable', 'string'],
            'penurunan_reputasi' => ['nullable', 'string'],
            'penurunan_kinerja' => ['nullable', 'string'],
            'gangguan_pelayanan' => ['nullable', 'string'],
            'tuntutan_hukum' => ['nullable', 'string'],
        ]);

        $criteria->update($data);

        return back()->with('success', 'Kriteria Dampak berhasil diperbarui.');
    }

    // ── Kriteria Kemungkinan ─────────────────────────────────────────
    public function updateLikelihoodCriteria(Request $request, RiskLikelihoodCriteria $criteria)
    {
        $this->ensureAdmin();

        $data = $request->validate([
            'nama' => ['required', 'string', 'max:255'],
            'probabilitas' => ['nullable', 'string'],
            'frekuensi' => ['nullable', 'string'],
            'toleransi' => ['nullable', 'string'],
        ]);

        $criteria->update($data);

        return back()->with('success', 'Kriteria Kemungkinan berhasil diperbarui.');
    }

    // ── Matriks Analisis Risiko (per-sel: skala + warna) ────────────
    public function updateMatrixCell(Request $request, RiskMatrixCell $cell)
    {
        $this->ensureAdmin();

        $data = $request->validate([
            'skala_risiko' => ['required', 'integer', 'min:1', 'max:25'],
            'warna_class' => ['required', 'string', 'max:100'],
        ]);

        $cell->update($data);

        return back()->with('success', 'Sel matriks berhasil diperbarui.');
    }

    // ── Tabel Level Risiko ───────────────────────────────────────────
    public function updateRiskLevel(Request $request, RiskLevel $level)
    {
        $this->ensureAdmin();

        $data = $request->validate([
            'label' => ['required', 'string', 'max:100'],
            'skala_min' => ['required', 'integer', 'min:1', 'max:25'],
            'skala_max' => ['required', 'integer', 'min:1', 'max:25', 'gte:skala_min'],
            'warna_class' => ['required', 'string', 'max:100'],
            'urutan' => ['nullable', 'integer'],
        ]);

        $level->update($data);

        return back()->with('success', 'Level Risiko berhasil diperbarui.');
    }

    // ── Jenis Risiko ─────────────────────────────────────────────────
    public function storeJenisRisiko(Request $request)
    {
        $this->ensureAdmin();

        $data = $request->validate([
            'kode' => ['required', 'string', 'max:10'],
            'nama' => ['required', 'string', 'max:255'],
            'urutan' => ['nullable', 'integer'],
        ]);

        RiskJenis::create($data);

        return back()->with('success', 'Jenis Risiko berhasil ditambahkan.');
    }

    public function updateJenisRisiko(Request $request, RiskJenis $jenis)
    {
        $this->ensureAdmin();

        $data = $request->validate([
            'kode' => ['required', 'string', 'max:10'],
            'nama' => ['required', 'string', 'max:255'],
            'urutan' => ['nullable', 'integer'],
        ]);

        $jenis->update($data);

        return back()->with('success', 'Jenis Risiko berhasil diperbarui.');
    }

    public function destroyJenisRisiko(RiskJenis $jenis)
    {
        $this->ensureAdmin();

        $jenis->delete();

        return back()->with('success', 'Jenis Risiko berhasil dihapus.');
    }

    // ── Entitas Penilai Risiko ───────────────────────────────────────
    public function storeEntitasPenilai(Request $request)
    {
        $this->ensureAdmin();

        $data = $request->validate([
            'nama' => ['required', 'string', 'max:255', Rule::unique('risk_entitas_penilai', 'nama')],
            'urutan' => ['nullable', 'integer', Rule::unique('risk_entitas_penilai', 'urutan')],
        ]);

        RiskEntitasPenilai::create($data);

        return back()->with('success', 'Entitas Penilai Risiko berhasil ditambahkan.');
    }

    public function updateEntitasPenilai(Request $request, RiskEntitasPenilai $entitas)
    {
        $this->ensureAdmin();

        $data = $request->validate([
            'nama' => ['required', 'string', 'max:255', Rule::unique('risk_entitas_penilai', 'nama')->ignore($entitas->id)],
            'urutan' => ['nullable', 'integer', Rule::unique('risk_entitas_penilai', 'urutan')->ignore($entitas->id)],
        ]);

        $entitas->update($data);

        return back()->with('success', 'Entitas Penilai Risiko berhasil diperbarui.');
    }

    public function destroyEntitasPenilai(RiskEntitasPenilai $entitas)
    {
        $this->ensureAdmin();

        $entitas->delete();

        return back()->with('success', 'Entitas Penilai Risiko berhasil dihapus.');
    }

    // ── Tabel OPD (tabel `opd`, sudah ada sejak awal — cuma dilengkapi CRUD) ──
    public function storeOpd(Request $request)
    {
        $this->ensureAdmin();

        $data = $request->validate([
            'nama' => ['required', 'string', 'max:255', Rule::unique('opd', 'nama')],
        ]);

        \App\Models\Opd::create($data);

        return back()->with('success', 'OPD berhasil ditambahkan.');
    }

    public function updateOpd(Request $request, \App\Models\Opd $opd)
    {
        $this->ensureAdmin();

        $data = $request->validate([
            'nama' => ['required', 'string', 'max:255', Rule::unique('opd', 'nama')->ignore($opd->id)],
        ]);

        $opd->update($data);

        return back()->with('success', 'OPD berhasil diperbarui.');
    }

    public function destroyOpd(\App\Models\Opd $opd)
    {
        $this->ensureAdmin();

        $opd->delete();

        return back()->with('success', 'OPD berhasil dihapus.');
    }
}
