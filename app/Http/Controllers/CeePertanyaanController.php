<?php

namespace App\Http\Controllers;

use App\Models\CeePertanyaan;
use App\Models\CeeUnsur;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Kelola redaksi pertanyaan kuesioner CEE (Form 1a) — HANYA admin/super-admin
 * (ditegakkan lewat ensureCanManage). PIC/akun CEE_Survey tidak bisa mengubah
 * pertanyaan, hanya menjawabnya (lihat CeeFormController).
 */
class CeePertanyaanController extends Controller
{
    private function ensureCanManage(Request $request): void
    {
        if (!$request->user()->hasAnyRole(['admin', 'super-admin'])) {
            abort(403, 'Hanya Admin/Super Admin yang dapat mengelola pertanyaan kuesioner CEE.');
        }
    }

    public function index(Request $request)
    {
        $this->ensureCanManage($request);

        return Inertia::render('cee/pertanyaan/Index', [
            'unsurs' => CeeUnsur::with(['pertanyaan' => fn ($q) => $q->orderBy('urutan')])
                ->orderBy('urutan')
                ->get(),
        ]);
    }

    public function store(Request $request)
    {
        $this->ensureCanManage($request);

        $data = $request->validate([
            'cee_unsur_id' => ['required', 'exists:cee_unsur,id'],
            'pertanyaan' => ['required', 'string'],
        ]);

        $urutan = (CeePertanyaan::where('cee_unsur_id', $data['cee_unsur_id'])->max('urutan') ?? 0) + 1;

        CeePertanyaan::create([
            'cee_unsur_id' => $data['cee_unsur_id'],
            'pertanyaan' => $data['pertanyaan'],
            'urutan' => $urutan,
            'aktif' => true,
        ]);

        return back()->with('success', 'Pertanyaan berhasil ditambahkan.');
    }

    public function update(Request $request, CeePertanyaan $pertanyaan)
    {
        $this->ensureCanManage($request);

        $data = $request->validate([
            'pertanyaan' => ['required', 'string'],
            'aktif' => ['required', 'boolean'],
        ]);

        $pertanyaan->update($data);

        return back()->with('success', 'Pertanyaan berhasil diperbarui.');
    }

    public function destroy(Request $request, CeePertanyaan $pertanyaan)
    {
        $this->ensureCanManage($request);

        // Nonaktifkan, bukan hapus permanen — jawaban historis (cee_jawaban)
        // yang sudah masuk tetap valid & tertaut ke pertanyaan ini utk laporan
        // tahun-tahun sebelumnya.
        $pertanyaan->update(['aktif' => false]);

        return back()->with('success', 'Pertanyaan dinonaktifkan.');
    }
}
