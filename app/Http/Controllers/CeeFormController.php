<?php

namespace App\Http\Controllers;

use App\Models\CeeJawaban;
use App\Models\CeeKelemahanDokumen;
use App\Models\CeeRtp;
use App\Models\CeeSimpulan;
use App\Models\CeeUnsur;
use App\Models\DataUmum;
use App\Models\Opd;
use App\Models\PengaturanPemda;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

/**
 * Form Input CEE (Control Environment Evaluation) — Lampiran 5 Form 1a/1b/1c
 * Perdep PPKD No.4/2019. Dinilai PER-OPD (per urusan wajib/pilihan).
 *
 * 1a: kuesioner (37 pertanyaan baku, dijawab per-responden, skala 1-4).
 * 1b: kelemahan Lingkungan Pengendalian dari reviu dokumen.
 * 1c: simpulan akhir per unsur (gabungan 1a+1b), disusun Sekretaris Dinas/
 *     Badan, ditandatangani Kepala OPD (data diambil dari Data Umum pengisi).
 * 1d: RTP atas Kelemahan Lingkungan Pengendalian (RTP atas CEE) — Lampiran 5
 *     Form 6, diisi utk unsur2 yg simpulan 1c-nya "Kurang Memadai".
 *
 * Diakses lewat akun bersama CEE_Survey (role 'cee-survey', dibatasi
 * RestrictCeeSurveyRole middleware) ATAU admin/super-admin.
 */
class CeeFormController extends Controller
{
    /**
     * Sama seperti IrsPdController::TRIWULAN_OPTIONS — Target Waktu &
     * Realisasi Penyelesaian Form 1d dipisah Triwulan+Tahun, bukan teks
     * bebas, konsisten dgn pola RTP di IRS/IRO.
     */
    public const TRIWULAN_OPTIONS = ['I', 'II', 'III', 'IV'];

    public const TRIWULAN_LABELS = [
        'I' => 'Triwulan I (Januari/Februari/Maret)',
        'II' => 'Triwulan II (April/Mei/Juni)',
        'III' => 'Triwulan III (Juli/Agustus/September)',
        'IV' => 'Triwulan IV (Oktober/November/Desember)',
    ];

    /**
     * PIC biasa (role 'user', punya opd_id) hanya melihat OPD miliknya
     * sendiri di dropdown — akun bersama CEE_Survey & Admin/Super Admin
     * (opd_id null / role admin) tetap melihat semua OPD.
     */
    private function opdOptions(Request $request)
    {
        $user = $request->user();
        if ($user->opd_id && !$user->hasAnyRole(['admin', 'super-admin', 'cee-survey'])) {
            return Opd::where('id', $user->opd_id)->get(['id', 'nama']);
        }

        return Opd::orderBy('nama')->get(['id', 'nama']);
    }

    /**
     * Status pengisian CEE per OPD utk tahun terpilih — dipakai menandai
     * dropdown "OPD / Urusan yang Dinilai" (badge sudah isi / belum) supaya
     * pengguna (terutama Admin/Super Admin/CEE_Survey yg lintas OPD) tidak
     * perlu klik satu-satu tiap OPD utk tahu mana yg sudah/belum mengisi.
     * "Sudah isi" didefinisikan: sudah ada minimal 1 jawaban 1a ATAU minimal
     * 1 simpulan 1c utk OPD+tahun itu (longgar — indikator progres, bukan
     * validasi "lengkap"; kelengkapan 8/8 unsur ditandai terpisah lewat
     * jumlah_simpulan/total_unsur).
     */
    private function opdStatus(int $tahun): array
    {
        $totalUnsur = CeeUnsur::count();

        $jawabanCounts = CeeJawaban::where('tahun_penilaian', $tahun)
            ->selectRaw('opd_id, count(distinct responden_nama) as jumlah_responden')
            ->groupBy('opd_id')
            ->pluck('jumlah_responden', 'opd_id');

        $simpulanCounts = CeeSimpulan::where('tahun_penilaian', $tahun)
            ->selectRaw('opd_id, count(*) as jumlah_simpulan')
            ->groupBy('opd_id')
            ->pluck('jumlah_simpulan', 'opd_id');

        return Opd::orderBy('nama')
            ->get(['id'])
            ->mapWithKeys(function ($opd) use ($jawabanCounts, $simpulanCounts, $totalUnsur) {
                $jumlahResponden = $jawabanCounts[$opd->id] ?? 0;
                $jumlahSimpulan = $simpulanCounts[$opd->id] ?? 0;

                return [$opd->id => [
                    'jumlah_responden' => $jumlahResponden,
                    'jumlah_simpulan' => $jumlahSimpulan,
                    'total_unsur' => $totalUnsur,
                    'lengkap' => $jumlahSimpulan >= $totalUnsur,
                    'sudah_mulai' => $jumlahResponden > 0 || $jumlahSimpulan > 0,
                ]];
            })
            ->all();
    }

    /**
     * Data Umum milik OPD (PER TAHUN) — dicari dari User dgn opd_id yg
     * sesuai, BUKAN dari akun yg sedang login. Dipakai simpulan 1c supaya
     * snapshot Kepala OPD/sinkronisasi penandatangan SELALU mengacu ke
     * identitas OPD yg sedang disimpulkan, bukan identitas submitter —
     * penting krn Admin/Super Admin/akun CEE_Survey bisa mengisi 1c utk
     * OPD manapun, beda dari PIC biasa yg login sbg akun OPD-nya sendiri
     * (dulu snapshot ini keliru pakai Data Umum akun login, ditemukan saat
     * menambahkan sinkronisasi penandatangan Data Umum <-> 1c).
     */
    private function dataUmumForOpd(int $opdId, int $tahun): ?DataUmum
    {
        return DataUmum::forOpdAndTahun($opdId, $tahun);
    }

    /**
     * Sinkronisasi 2 ARAH DataUmum.penandatangan[] <-> Form 1c: dipanggil
     * tiap kali Sekretaris/Kepala OPD Form 1c disimpan (store1c/update1c),
     * meng-updateOrCreate entri di array penandatangan OPD ybs berdasarkan
     * JABATAN (case-insensitive) — kalau jabatan sudah ada di array,
     * timpa namanya (Form 1c jadi sumber kebenaran terbaru utk jabatan
     * itu); kalau belum ada, tambahkan entri baru. NIP TIDAK disentuh
     * kolom ini (Form 1c tidak py field NIP) — dibiarkan kosong utk entri
     * baru, atau tetap nilai lama kalau entri sudah ada.
     */
    private function syncPenandatangan(DataUmum $dataUmum, string $jabatan, string $nama): void
    {
        // Array PHP biasa (BUKAN Collection) — Collection menolak modifikasi
        // elemen array bersarang via index ($list[$idx]['nama'] = ...
        // melempar "Indirect modification of overloaded element" krn offset
        // access Collection mengembalikan copy, bukan reference).
        $list = $dataUmum->penandatangan ?? [];
        $jabatanKey = mb_strtolower(trim($jabatan));
        $idx = null;

        foreach ($list as $i => $p) {
            if (mb_strtolower(trim($p['jabatan'] ?? '')) === $jabatanKey) {
                $idx = $i;
                break;
            }
        }

        if ($idx !== null) {
            $list[$idx]['nama'] = $nama;
        } else {
            $list[] = ['jabatan' => $jabatan, 'nama' => $nama, 'nip' => ''];
        }

        $dataUmum->update(['penandatangan' => array_values($list)]);
    }

    /**
     * PIC biasa (punya opd_id) hanya boleh akses CEE OPD miliknya sendiri —
     * baik lihat (GET) maupun simpan (POST/PUT/DELETE). Akun bersama
     * CEE_Survey & Admin/Super Admin tidak dibatasi (lintas OPD).
     */
    private function ensureOpdAccess(Request $request, ?int $opdId): void
    {
        $user = $request->user();
        if (!$opdId || !$user->opd_id || $user->hasAnyRole(['admin', 'super-admin', 'cee-survey'])) {
            return;
        }

        if ($opdId !== $user->opd_id) {
            abort(403, 'Anda hanya dapat mengakses CEE untuk OPD Anda sendiri.');
        }
    }

    /**
     * Akun bersama CEE_Survey (role 'cee-survey') dipakai bergantian oleh
     * banyak orang lintas OPD — mengizinkannya EDIT/HAPUS data yg sudah ada
     * berisiko satu orang menimpa/menghapus milik dinas lain. Jadi role ini
     * hanya boleh MENAMBAH data baru (store1a/store1b/form1c pertama kali),
     * tidak boleh mengubah/menghapus entri yg sudah tersimpan. PIC (per-OPD),
     * Admin, dan Super Admin tetap bebas.
     */
    private function ensureCanEditOrDelete(Request $request): void
    {
        if ($request->user()->hasRole('cee-survey')) {
            abort(403, 'Akun survei CEE tidak dapat mengedit/menghapus data yang sudah tersimpan. Hubungi PIC OPD, Admin, atau Super Admin.');
        }
    }

    // ── Form 1a: Kuesioner ──────────────────────────────────────────────

    public function form1a(Request $request)
    {
        $opdId = $request->integer('opd_id') ?: $request->user()->opd_id;
        $this->ensureOpdAccess($request, $opdId);
        $tahun = $request->integer('tahun') ?: (int) PengaturanPemda::current()->tahun_penilaian;

        $unsurs = CeeUnsur::with(['pertanyaan' => fn ($q) => $q->where('aktif', true)->orderBy('urutan')])
            ->orderBy('urutan')
            ->get();

        // Rekapitulasi jawaban yang SUDAH masuk utk OPD+tahun ini — dipakai
        // menghitung modus & simpulan langsung di halaman (live recap),
        // sesuai bentuk Form 1a asli (kolom R1..Rn + Modus + Simpulan).
        $rekap = $opdId ? $this->hitungRekap1a($opdId, $tahun) : null;

        return Inertia::render('cee/form/Form1a', [
            'opdOptions' => $this->opdOptions($request),
            'opdStatus' => $this->opdStatus($tahun),
            'opdId' => $opdId,
            'tahun' => $tahun,
            'unsurs' => $unsurs,
            'rekap' => $rekap,
            'respondenList' => $opdId ? $this->respondenList1a($opdId, $tahun) : [],
            'canEditOrDelete1a' => !$request->user()->hasRole('cee-survey'),
        ]);
    }

    /**
     * Daftar unik responden yg sudah mengisi 1a utk OPD+tahun ini — supaya
     * PIC/Admin/Super Admin bisa lihat siapa saja yg sudah mengisi & kapan
     * terakhir mengisi (transparansi "siapa isi apa").
     */
    private function respondenList1a(int $opdId, int $tahun): array
    {
        return CeeJawaban::with('submittedBy:id,name,username')
            ->where('opd_id', $opdId)
            ->where('tahun_penilaian', $tahun)
            ->get()
            ->groupBy(fn ($r) => mb_strtolower(trim($r->responden_nama)))
            ->map(function ($rows) {
                $last = $rows->sortByDesc('updated_at')->first();

                return [
                    'nama' => $last->responden_nama,
                    'jabatan' => $last->responden_jabatan,
                    'jumlah_jawaban' => $rows->count(),
                    'diisi_oleh' => $last->submittedBy?->name ?? $last->submittedBy?->username,
                    'terakhir_diisi' => optional($last->updated_at)->toDateTimeString(),
                ];
            })
            ->values()
            ->all();
    }

    /**
     * Jawaban satu responden (utk isi ulang form saat Edit) — dicari by nama
     * (case-insensitive+trim), sama seperti pencocokan update-or-create di
     * store1a.
     */
    public function jawabanResponden1a(Request $request)
    {
        $opdId = $request->integer('opd_id');
        $tahun = $request->integer('tahun');
        $nama = (string) $request->query('responden_nama', '');
        $this->ensureOpdAccess($request, $opdId);

        $rows = CeeJawaban::where('opd_id', $opdId)
            ->where('tahun_penilaian', $tahun)
            ->whereRaw('LOWER(TRIM(responden_nama)) = ?', [mb_strtolower(trim($nama))])
            ->get();

        if ($rows->isEmpty()) {
            abort(404, 'Jawaban responden tidak ditemukan.');
        }

        return response()->json([
            'responden_nama' => $rows->first()->responden_nama,
            'responden_jabatan' => $rows->first()->responden_jabatan,
            'jawaban' => $rows->pluck('nilai', 'cee_pertanyaan_id'),
        ]);
    }

    /**
     * Hapus (soft delete) SELURUH jawaban satu responden utk OPD+tahun ini —
     * dipakai saat PIC/Admin/Super Admin menghapus hasil survei yg salah
     * input/tidak valid. Akun bersama CEE_Survey TIDAK boleh (lihat
     * ensureCanEditOrDelete()).
     */
    public function destroy1a(Request $request)
    {
        $this->ensureCanEditOrDelete($request);

        $data = $request->validate([
            'opd_id' => ['required', 'exists:opd,id'],
            'tahun' => ['required', 'integer', 'min:2000', 'max:2100'],
            'responden_nama' => ['required', 'string', 'max:255'],
        ]);

        $this->ensureOpdAccess($request, (int) $data['opd_id']);

        $namaKey = mb_strtolower(trim($data['responden_nama']));
        $deleted = CeeJawaban::where('opd_id', $data['opd_id'])
            ->where('tahun_penilaian', $data['tahun'])
            ->whereRaw('LOWER(TRIM(responden_nama)) = ?', [$namaKey])
            ->delete();

        if ($deleted === 0) {
            abort(404, 'Jawaban responden tidak ditemukan.');
        }

        return back()->with('success', 'Jawaban responden berhasil dihapus.');
    }

    public function store1a(Request $request)
    {
        $data = $request->validate([
            'opd_id' => ['required', 'exists:opd,id'],
            'tahun' => ['required', 'integer', 'min:2000', 'max:2100'],
            'responden_nama' => ['required', 'string', 'max:255'],
            'responden_jabatan' => ['required', 'string', 'max:255'],
            'jawaban' => ['required', 'array'],
            'jawaban.*' => ['required', 'integer', 'min:1', 'max:4'],
        ]);

        $this->ensureOpdAccess($request, (int) $data['opd_id']);

        // Timpa (update) jawaban lama bila responden dgn NAMA SAMA mengisi
        // ulang utk OPD+tahun yg sama — mencegah data ganda dari orang yg
        // sama & modus tetap akurat. Nama dicocokkan case-insensitive +
        // trim supaya beda spasi/kapitalisasi kecil tetap dianggap sama.
        DB::transaction(function () use ($data, $request) {
            $namaKey = trim($data['responden_nama']);
            foreach ($data['jawaban'] as $pertanyaanId => $nilai) {
                $existing = CeeJawaban::where('opd_id', $data['opd_id'])
                    ->where('tahun_penilaian', $data['tahun'])
                    ->where('cee_pertanyaan_id', (int) $pertanyaanId)
                    ->whereRaw('LOWER(TRIM(responden_nama)) = ?', [mb_strtolower($namaKey)])
                    ->first();

                if ($existing) {
                    $existing->update([
                        'responden_nama' => $data['responden_nama'],
                        'responden_jabatan' => $data['responden_jabatan'],
                        'submitted_by' => $request->user()->id,
                        'nilai' => $nilai,
                    ]);
                } else {
                    CeeJawaban::create([
                        'opd_id' => $data['opd_id'],
                        'cee_pertanyaan_id' => (int) $pertanyaanId,
                        'tahun_penilaian' => $data['tahun'],
                        'responden_nama' => $data['responden_nama'],
                        'responden_jabatan' => $data['responden_jabatan'],
                        'submitted_by' => $request->user()->id,
                        'nilai' => $nilai,
                    ]);
                }
            }
        });

        return redirect()
            ->route('cee.form1a', ['opd_id' => $data['opd_id'], 'tahun' => $data['tahun']])
            ->with('success', 'Kuesioner CEE berhasil disimpan.');
    }

    /**
     * Modus & simpulan per pertanyaan + simpulan per unsur, sesuai keterangan
     * Form 1a: "Memadai" jika modus 3/4, "Kurang Memadai" jika modus 1/2;
     * simpulan unsur "Memadai" hanya jika SEMUA pertanyaannya memadai.
     */
    private function hitungRekap1a(int $opdId, int $tahun): array
    {
        $jawaban = CeeJawaban::where('opd_id', $opdId)
            ->where('tahun_penilaian', $tahun)
            ->get()
            ->groupBy('cee_pertanyaan_id');

        $perPertanyaan = [];
        foreach ($jawaban as $pertanyaanId => $rows) {
            $nilaiList = $rows->pluck('nilai')->all();
            $modus = $this->modus($nilaiList);
            $perPertanyaan[$pertanyaanId] = [
                'responden' => $rows->map(fn ($r) => [
                    'nama' => $r->responden_nama,
                    'jabatan' => $r->responden_jabatan,
                    'nilai' => $r->nilai,
                ])->values(),
                'modus' => $modus,
                'simpulan' => $modus !== null ? ($modus >= 3 ? 'Memadai' : 'Kurang Memadai') : null,
            ];
        }

        return ['per_pertanyaan' => $perPertanyaan];
    }

    /** Modus (nilai paling sering muncul); jika seri, ambil yang tertinggi (paling optimis ke arah "Setuju"). */
    private function modus(array $values): ?int
    {
        if (empty($values)) {
            return null;
        }
        $counts = array_count_values($values);
        arsort($counts);
        $maxCount = reset($counts);
        $candidates = array_keys(array_filter($counts, fn ($c) => $c === $maxCount));

        return max($candidates);
    }

    // ── Form 1b: Kelemahan Berdasarkan Dokumen ──────────────────────────

    public function form1b(Request $request)
    {
        $opdId = $request->integer('opd_id') ?: $request->user()->opd_id;
        $this->ensureOpdAccess($request, $opdId);
        $tahun = $request->integer('tahun') ?: (int) PengaturanPemda::current()->tahun_penilaian;

        return Inertia::render('cee/form/Form1b', [
            'opdOptions' => $this->opdOptions($request),
            'opdStatus' => $this->opdStatus($tahun),
            'opdId' => $opdId,
            'tahun' => $tahun,
            'unsurOptions' => CeeUnsur::orderBy('urutan')->get(['id', 'kode', 'nama']),
            'entries' => $opdId
                ? CeeKelemahanDokumen::with(['unsur', 'submittedBy:id,name,username'])
                    ->where('opd_id', $opdId)
                    ->where('tahun_penilaian', $tahun)
                    ->orderBy('id')
                    ->get()
                : [],
        ]);
    }

    public function store1b(Request $request)
    {
        $data = $request->validate([
            'opd_id' => ['required', 'exists:opd,id'],
            'tahun' => ['required', 'integer', 'min:2000', 'max:2100'],
            'cee_unsur_id' => ['required', 'exists:cee_unsur,id'],
            'sumber_data' => ['required', 'string', 'max:255'],
            'uraian_kelemahan' => ['required', 'string'],
            'pengisi_nama' => ['required', 'string', 'max:255'],
            'pengisi_jabatan' => ['required', 'string', 'max:255'],
        ]);

        $this->ensureOpdAccess($request, (int) $data['opd_id']);

        CeeKelemahanDokumen::create([
            'opd_id' => $data['opd_id'],
            'tahun_penilaian' => $data['tahun'],
            'cee_unsur_id' => $data['cee_unsur_id'],
            'sumber_data' => $data['sumber_data'],
            'uraian_kelemahan' => $data['uraian_kelemahan'],
            'pengisi_nama' => $data['pengisi_nama'],
            'pengisi_jabatan' => $data['pengisi_jabatan'],
            'submitted_by' => $request->user()->id,
        ]);

        return redirect()
            ->route('cee.form1b', ['opd_id' => $data['opd_id'], 'tahun' => $data['tahun']])
            ->with('success', 'Kelemahan berhasil ditambahkan.');
    }

    public function update1b(Request $request, CeeKelemahanDokumen $kelemahan)
    {
        $this->ensureCanEditOrDelete($request);
        $this->ensureOpdAccess($request, $kelemahan->opd_id);

        $data = $request->validate([
            'cee_unsur_id' => ['required', 'exists:cee_unsur,id'],
            'sumber_data' => ['required', 'string', 'max:255'],
            'uraian_kelemahan' => ['required', 'string'],
        ]);

        $kelemahan->update($data);

        return back()->with('success', 'Entri berhasil diperbarui.');
    }

    public function destroy1b(Request $request, CeeKelemahanDokumen $kelemahan)
    {
        // PIC per-OPD & admin/super-admin boleh menghapus entri; akun
        // bersama CEE_Survey TIDAK (lihat ensureCanEditOrDelete()).
        $this->ensureCanEditOrDelete($request);
        $this->ensureOpdAccess($request, $kelemahan->opd_id);

        $kelemahan->delete();

        return back()->with('success', 'Entri berhasil dihapus.');
    }

    // ── Form 1c: Simpulan Survei Persepsi ────────────────────────────────

    /**
     * Cari entri di DataUmum.penandatangan[] milik OPD ybs yg jabatannya
     * MENGANDUNG kata kunci tertentu (case-insensitive) — dipakai
     * form1c() mencari kandidat default "Sekretaris"/Kepala OPD dari
     * penandatangan Data Umum saat simpulan 1c OPD ini belum pernah
     * diisi sama sekali (baris cee_simpulan kosong), bagian dari
     * sinkronisasi 2 arah DataUmum <-> Form 1c.
     */
    private function cariPenandatangan(?DataUmum $dataUmum, string $keyword): ?array
    {
        if (!$dataUmum) {
            return null;
        }

        $match = collect($dataUmum->penandatangan ?? [])
            ->first(fn ($p) => str_contains(mb_strtolower($p['jabatan'] ?? ''), mb_strtolower($keyword)));

        return $match ? ['nama' => $match['nama'] ?? '', 'jabatan' => $match['jabatan'] ?? ''] : null;
    }

    public function form1c(Request $request)
    {
        $opdId = $request->integer('opd_id') ?: $request->user()->opd_id;
        $this->ensureOpdAccess($request, $opdId);
        $tahun = $request->integer('tahun') ?: (int) PengaturanPemda::current()->tahun_penilaian;

        $unsurs = CeeUnsur::orderBy('urutan')->get();

        $ringkasan = null;
        $simpulanTersimpan = [];
        $defaultPenyusun = null;
        $defaultKepalaOpd = null;
        if ($opdId) {
            $rekap1a = $this->hitungRekap1a($opdId, $tahun)['per_pertanyaan'];
            $kelemahan1b = CeeKelemahanDokumen::where('opd_id', $opdId)->where('tahun_penilaian', $tahun)->get();

            // Ringkasan per unsur: simpulan 1a (semua pertanyaan memadai?) +
            // daftar kelemahan 1b yg diklasifikasikan ke unsur itu — bahan
            // bagi Sekretaris menyusun simpulan akhir.
            $ringkasan = $unsurs->map(function ($unsur) use ($rekap1a, $kelemahan1b) {
                $pertanyaanIds = $unsur->pertanyaan()->pluck('id');
                $simpulanList = $pertanyaanIds
                    ->map(fn ($pid) => $rekap1a[$pid]['simpulan'] ?? null)
                    ->filter();
                $adaKurangMemadai = $simpulanList->contains('Kurang Memadai');
                $simpulan1a = $simpulanList->isEmpty() ? null : ($adaKurangMemadai ? 'Kurang Memadai' : 'Memadai');

                return [
                    'unsur_id' => $unsur->id,
                    'kode' => $unsur->kode,
                    'nama' => $unsur->nama,
                    'simpulan_1a' => $simpulan1a,
                    'kelemahan_1b' => $kelemahan1b->where('cee_unsur_id', $unsur->id)->values(),
                ];
            });

            $simpulanTersimpan = CeeSimpulan::with('submittedBy:id,name,username')
                ->where('opd_id', $opdId)
                ->where('tahun_penilaian', $tahun)
                ->get()
                ->keyBy('cee_unsur_id');

            // Sinkronisasi 2 ARAH DataUmum <-> Form 1c: kalau OPD ini BELUM
            // pernah py simpulan 1c sama sekali (blm ada baris cee_simpulan
            // tersimpan), cari kandidat default Sekretaris/Kepala OPD dari
            // DataUmum.penandatangan[] milik OPD ybs supaya PIC tidak perlu
            // mengetik ulang nama yg sudah pernah diisi di menu Data Umum.
            if ($simpulanTersimpan->isEmpty()) {
                $dataUmumOpd = $this->dataUmumForOpd($opdId, $tahun);
                $defaultPenyusun = $this->cariPenandatangan($dataUmumOpd, 'sekretaris');
                $defaultKepalaOpd = [
                    'nama' => $dataUmumOpd->nama_kepala_dinas ?? '',
                    'jabatan' => $dataUmumOpd->jabatan_kepala_dinas ?? '',
                ];
            }
        }

        return Inertia::render('cee/form/Form1c', [
            'opdOptions' => $this->opdOptions($request),
            'opdStatus' => $this->opdStatus($tahun),
            'opdId' => $opdId,
            'tahun' => $tahun,
            'unsurs' => $unsurs,
            'ringkasan' => $ringkasan,
            'simpulanTersimpan' => $simpulanTersimpan,
            'defaultPenyusun' => $defaultPenyusun,
            'defaultKepalaOpd' => $defaultKepalaOpd,
        ]);
    }

    public function store1c(Request $request)
    {
        $data = $request->validate([
            'opd_id' => ['required', 'exists:opd,id'],
            'tahun' => ['required', 'integer', 'min:2000', 'max:2100'],
            'penyusun_nama' => ['required', 'string', 'max:255'],
            'penyusun_jabatan' => ['required', 'string', 'max:255'],
            'simpulan' => ['required', 'array'],
            'simpulan.*.cee_unsur_id' => ['required', 'exists:cee_unsur,id'],
            // Kolom (g) Lampiran 5 Form 1c — keputusan FINAL Sekretaris
            // Dinas/Badan (Memadai/Kurang Memadai), TERPISAH dari kolom (h)
            // 'penjelasan' (uraian teks). WAJIB diisi — sebelumnya TIDAK ADA
            // field ini sama sekali (cuma teks bebas), sehingga Form 1d (RTP
            // CEE) terpaksa memakai hasil mentah kuesioner 1a sbg pengganti,
            // bukan keputusan final manusia spt seharusnya sesuai Perdep.
            'simpulan.*.simpulan' => ['required', Rule::in(['Memadai', 'Kurang Memadai'])],
            'simpulan.*.penjelasan' => ['nullable', 'string'],
            // Kepala OPD (kolom kanan blok TTD) — biasanya ikut snapshot
            // otomatis dari Data Umum OPD ybs, TAPI PIC boleh menimpanya
            // manual di Form 1c (mis. Kepala OPD sedang Plt/berbeda dari
            // Data Umum) — kalau diisi, akan DITULIS BALIK ke
            // DataUmum.penandatangan[] OPD ybs (sinkronisasi 2 arah).
            'kepala_opd_nama' => ['nullable', 'string', 'max:255'],
            'kepala_opd_jabatan' => ['nullable', 'string', 'max:255'],
        ]);

        $this->ensureOpdAccess($request, (int) $data['opd_id']);

        // Kepala OPD (penandatangan/UPR) di-snapshot dari Data Umum milik
        // OPD YG SEDANG DISIMPULKAN ($data['opd_id']) — BUKAN akun yg login
        // (bug lama: Admin/Super Admin/akun CEE_Survey bisa mengisi 1c utk
        // OPD manapun, shg Data Umum akun login belum tentu = Data Umum OPD
        // ybs). DataUmum per-tahun — WAJIB discope $data['tahun'] (tahun CEE
        // yg sedang diisi), BUKAN baris "manapun" milik user, supaya
        // snapshot Kepala OPD yg tersimpan permanen di CeeSimpulan sesuai
        // tahun penilaian CEE ybs, bukan versi DataUmum terkini/tahun lain
        // yg kebetulan ada.
        $dataUmum = $this->dataUmumForOpd((int) $data['opd_id'], (int) $data['tahun']);

        // Akun bersama CEE_Survey hanya boleh mengisi simpulan yg BELUM ada
        // (opd+tahun+unsur ini pertama kali diisi) — tidak boleh menimpa
        // simpulan yg sudah tersimpan (bisa punya OPD lain / sudah disahkan).
        if ($request->user()->hasRole('cee-survey')) {
            $existingUnsurIds = CeeSimpulan::where('opd_id', $data['opd_id'])
                ->where('tahun_penilaian', $data['tahun'])
                ->whereIn('cee_unsur_id', collect($data['simpulan'])->pluck('cee_unsur_id'))
                ->pluck('cee_unsur_id');

            if ($existingUnsurIds->isNotEmpty()) {
                abort(403, 'Akun survei CEE tidak dapat mengedit simpulan yang sudah tersimpan. Hubungi PIC OPD, Admin, atau Super Admin.');
            }
        }

        // Kepala OPD: PIC boleh menimpa manual via field kepala_opd_nama/
        // jabatan di request — kalau tidak diisi, fallback ke snapshot Data
        // Umum OPD ybs (perilaku lama, tetap dipertahankan).
        $kepalaOpdNama = $data['kepala_opd_nama'] ?? $dataUmum->nama_kepala_dinas ?? null;
        $kepalaOpdJabatan = $data['kepala_opd_jabatan'] ?? $dataUmum->jabatan_kepala_dinas ?? null;

        DB::transaction(function () use ($data, $request, $kepalaOpdNama, $kepalaOpdJabatan) {
            foreach ($data['simpulan'] as $row) {
                CeeSimpulan::updateOrCreate(
                    [
                        'opd_id' => $data['opd_id'],
                        'tahun_penilaian' => $data['tahun'],
                        'cee_unsur_id' => $row['cee_unsur_id'],
                    ],
                    [
                        'simpulan' => $row['simpulan'],
                        'penjelasan' => $row['penjelasan'] ?? null,
                        'penyusun_nama' => $data['penyusun_nama'],
                        'penyusun_jabatan' => $data['penyusun_jabatan'],
                        'submitted_by' => $request->user()->id,
                        'kepala_opd_nama' => $kepalaOpdNama,
                        'kepala_opd_jabatan' => $kepalaOpdJabatan,
                    ]
                );
            }
        });

        // Sinkronisasi 2 ARAH ke DataUmum.penandatangan[] milik OPD ybs —
        // Sekretaris & Kepala OPD yg baru disimpan di 1c ini otomatis
        // ter-update/tertambah jg di Data Umum, supaya Form 6/7 (yg baca
        // penandatangan dari Data Umum) selalu konsisten dgn 1c tanpa PIC
        // perlu mengisi dua tempat terpisah.
        if ($dataUmum) {
            $this->syncPenandatangan($dataUmum, $data['penyusun_jabatan'], $data['penyusun_nama']);
            if ($kepalaOpdNama && $kepalaOpdJabatan) {
                $this->syncPenandatangan($dataUmum->fresh(), $kepalaOpdJabatan, $kepalaOpdNama);
            }
        }

        return redirect()
            ->route('cee.form1c', ['opd_id' => $data['opd_id'], 'tahun' => $data['tahun']])
            ->with('success', 'Simpulan CEE berhasil disimpan.');
    }

    /**
     * Edit simpulan SATU unsur (bukan seluruh unsur sekaligus spt
     * store1c()) — dipakai mode "Edit" per-kartu di Form1c.tsx, sama pola
     * dgn Form 1b (EntryRow toggle Edit/Simpan/Batal) supaya PIC tidak
     * tidak sengaja mengubah unsur lain saat cuma mau revisi 1 unsur.
     * TIDAK mengubah penyusun_nama/kepala_opd_* (field itu shared utk
     * seluruh unsur OPD+tahun ybs, cuma diubah lewat store1c() batch) —
     * edit di sini murni simpulan+penjelasan unsur ybs saja.
     */
    public function update1c(Request $request, CeeSimpulan $simpulan)
    {
        $this->ensureCanEditOrDelete($request);
        $this->ensureOpdAccess($request, $simpulan->opd_id);

        $data = $request->validate([
            'simpulan' => ['required', Rule::in(['Memadai', 'Kurang Memadai'])],
            'penjelasan' => ['nullable', 'string'],
        ]);

        $simpulan->update($data);

        return back()->with('success', 'Simpulan berhasil diperbarui.');
    }

    public function destroy1c(Request $request, CeeSimpulan $simpulan)
    {
        // PIC per-OPD & admin/super-admin boleh menghapus simpulan; akun
        // bersama CEE_Survey TIDAK (lihat ensureCanEditOrDelete()).
        $this->ensureCanEditOrDelete($request);
        $this->ensureOpdAccess($request, $simpulan->opd_id);

        $simpulan->delete();

        return back()->with('success', 'Simpulan berhasil dihapus.');
    }

    // ── Form 1d: RTP atas Kelemahan Lingkungan Pengendalian (RTP atas CEE) ──

    /**
     * Unsur2 dgn SIMPULAN FINAL 1c "Kurang Memadai" utk OPD+tahun ini —
     * dibaca LANGSUNG dari kolom cee_simpulan.simpulan (kolom (g) Lampiran 5
     * Form 1c, keputusan akhir Sekretaris Dinas/Badan), BUKAN lagi hasil
     * mentah kuesioner 1a. Sebelumnya method ini salah memakai hitungRekap1a()
     * krn cee_simpulan belum py kolom status eksplisit (ditemukan lewat
     * pertanyaan user: kenapa label "Simpulan (1c)" di Form 1d padahal Form
     * 1c sendiri tidak py toggle penilaian) — sudah diperbaiki dgn menambah
     * kolom cee_simpulan.simpulan (migration 2026_07_17_120000).
     *
     * Unsur yg BELUM py baris cee_simpulan sama sekali (Sekretaris belum
     * menyimpulkan 1c-nya) dianggap belum diketahui statusnya
     * ('kurang_memadai' => false) — TIDAK memaksa unsur itu tampil merah di
     * Form 1d hanya krn asumsi/tebakan.
     */
    private function unsurKurangMemadai(int $opdId, int $tahun): array
    {
        $unsurs = CeeUnsur::orderBy('urutan')->get();
        $simpulanTersimpan = CeeSimpulan::where('opd_id', $opdId)
            ->where('tahun_penilaian', $tahun)
            ->get()
            ->keyBy('cee_unsur_id');

        return $unsurs->map(function ($unsur) use ($simpulanTersimpan) {
            $simpulan = $simpulanTersimpan->get($unsur->id);

            return [
                'unsur_id' => $unsur->id,
                'kode' => $unsur->kode,
                'nama' => $unsur->nama,
                'kurang_memadai' => $simpulan?->simpulan === 'Kurang Memadai',
                // Penjelasan simpulan 1c milik unsur ybs — dipakai Form 1d
                // utk auto-isi "Kondisi Lingkungan Pengendalian yang Kurang
                // Memadai" saat unsur ini dipilih, supaya tidak perlu ditulis
                // ulang manual (uraian sudah ada dari keputusan Sekretaris
                // di 1c).
                'penjelasan_1c' => $simpulan?->simpulan === 'Kurang Memadai' ? $simpulan->penjelasan : null,
            ];
        })->values()->all();
    }

    public function form1d(Request $request)
    {
        $opdId = $request->integer('opd_id') ?: $request->user()->opd_id;
        $this->ensureOpdAccess($request, $opdId);
        $tahun = $request->integer('tahun') ?: (int) PengaturanPemda::current()->tahun_penilaian;

        $unsurKurangMemadai = $opdId ? $this->unsurKurangMemadai($opdId, $tahun) : [];

        return Inertia::render('cee/form/Form1d', [
            'opdOptions' => $this->opdOptions($request),
            'opdStatus' => $this->opdStatus($tahun),
            'opdId' => $opdId,
            'tahun' => $tahun,
            // Dropdown "Tambah RTP" HANYA boleh pilih unsur yg simpulan
            // 1c-nya "Kurang Memadai" — RTP CEE memang cuma relevan utk
            // kelemahan yg SUDAH diputuskan Sekretaris, bukan semua 8 unsur
            // (unsur "Memadai" tidak perlu RTP sama sekali).
            'unsurOptions' => collect($unsurKurangMemadai)
                ->filter(fn ($u) => $u['kurang_memadai'])
                ->map(fn ($u) => ['id' => $u['unsur_id'], 'kode' => $u['kode'], 'nama' => $u['nama'], 'penjelasan_1c' => $u['penjelasan_1c']])
                ->values()
                ->all(),
            'unsurKurangMemadai' => $unsurKurangMemadai,
            'triwulanOptions' => self::TRIWULAN_OPTIONS,
            'triwulanLabels' => self::TRIWULAN_LABELS,
            'entries' => $opdId
                ? CeeRtp::with(['unsur', 'submittedBy:id,name,username'])
                    ->where('opd_id', $opdId)
                    ->where('tahun_penilaian', $tahun)
                    ->orderBy('cee_unsur_id')
                    ->orderBy('id')
                    ->get()
                : [],
            'canEditOrDelete1d' => !$request->user()->hasRole('cee-survey'),
        ]);
    }

    private function rtpValidationRules(): array
    {
        return [
            'opd_id' => ['required', 'exists:opd,id'],
            'tahun' => ['required', 'integer', 'min:2000', 'max:2100'],
            'cee_unsur_id' => ['required', 'exists:cee_unsur,id'],
            'kondisi_kurang_memadai' => ['required', 'string'],
            'rencana_tindak_pengendalian' => ['nullable', 'string'],
            'penanggung_jawab' => ['nullable', 'string', 'max:255'],
            'triwulan_target' => ['nullable', Rule::in(self::TRIWULAN_OPTIONS)],
            'tahun_target_penyelesaian' => ['nullable', 'integer', 'digits:4'],
            'triwulan_realisasi' => ['nullable', Rule::in(self::TRIWULAN_OPTIONS)],
            'tahun_realisasi_penyelesaian' => ['nullable', 'integer', 'digits:4'],
        ];
    }

    public function store1d(Request $request)
    {
        $data = $request->validate($this->rtpValidationRules());

        $this->ensureOpdAccess($request, (int) $data['opd_id']);

        CeeRtp::create([
            'opd_id' => $data['opd_id'],
            'tahun_penilaian' => $data['tahun'],
            'cee_unsur_id' => $data['cee_unsur_id'],
            'kondisi_kurang_memadai' => $data['kondisi_kurang_memadai'],
            'rencana_tindak_pengendalian' => $data['rencana_tindak_pengendalian'] ?? null,
            'penanggung_jawab' => $data['penanggung_jawab'] ?? null,
            'triwulan_target' => $data['triwulan_target'] ?? null,
            'tahun_target_penyelesaian' => $data['tahun_target_penyelesaian'] ?? null,
            'triwulan_realisasi' => $data['triwulan_realisasi'] ?? null,
            'tahun_realisasi_penyelesaian' => $data['tahun_realisasi_penyelesaian'] ?? null,
            'submitted_by' => $request->user()->id,
        ]);

        return redirect()
            ->route('cee.form1d', ['opd_id' => $data['opd_id'], 'tahun' => $data['tahun']])
            ->with('success', 'RTP CEE berhasil ditambahkan.');
    }

    public function update1d(Request $request, CeeRtp $rtp)
    {
        $this->ensureCanEditOrDelete($request);
        $this->ensureOpdAccess($request, $rtp->opd_id);

        $rules = $this->rtpValidationRules();
        unset($rules['opd_id'], $rules['tahun']);

        $data = $request->validate($rules);

        $rtp->update($data);

        return back()->with('success', 'RTP CEE berhasil diperbarui.');
    }

    public function destroy1d(Request $request, CeeRtp $rtp)
    {
        // PIC per-OPD & admin/super-admin boleh menghapus entri; akun
        // bersama CEE_Survey TIDAK (lihat ensureCanEditOrDelete()).
        $this->ensureCanEditOrDelete($request);
        $this->ensureOpdAccess($request, $rtp->opd_id);

        $rtp->delete();

        return back()->with('success', 'RTP CEE berhasil dihapus.');
    }
}
