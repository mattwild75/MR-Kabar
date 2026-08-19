<?php

namespace App\Http\Controllers;

use App\Models\ArahanPenilaianRisiko;
use App\Models\CeeJawaban;
use App\Models\CeeKelemahanDokumen;
use App\Models\CeeRtp;
use App\Models\CeeSimpulan;
use App\Models\IroPd;
use App\Models\IrsPd;
use App\Models\IrsPemda;
use App\Models\KroPd;
use App\Models\KrsPd;
use App\Models\KrsPemda;
use App\Models\LaporanKejadianRisiko;
use App\Models\MonitoringRtp;
use App\Models\PencatatanKejadianRisiko;
use App\Models\ProgramBupatiRisiko;
use App\Models\StrukturPengelolaRisiko;
use App\Services\KroIroPdSyncService;
use App\Services\KrsIrsPdSyncService;
use App\Services\KrsIrsSyncService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Halaman "Data Terhapus" (soft delete) — menampilkan baris yang di-soft-delete
 * dari 6 tabel data risiko, dengan aksi Pulihkan (restore) & Hapus Permanen
 * (forceDelete, khusus admin/super-admin). Menghormati kepemilikan: PIC hanya
 * melihat/memulihkan barisnya sendiri (kecuali 1a yang lintas-OPD → admin saja).
 */
class TrashController extends Controller
{
    /**
     * Definisi tiap jenis data terhapus. Untuk tiap slug:
     * - model: kelas Eloquent (pakai SoftDeletes)
     * - label: nama tampilan
     * - title_field: kolom teks utama yang ditampilkan sbagai judul baris
     * - subtitle_fields: kolom pendukung (ditampilkan kecil)
     * - owned: true bila row-level ownership (non-admin dibatasi user_id-nya)
     * - sync: service yang di-run ulang setelah restore/forceDelete (regen tabel
     *   gabungan/diagram); null bila tak ada.
     */
    private function types(): array
    {
        return [
            // CEE (Control Environment Evaluation) ditampilkan LEBIH DULU —
            // kepemilikan bukan lewat user_id (row per-orang), melainkan
            // opd_id (row per-OPD, milik bersama PIC OPD tsb) — lihat
            // 'opd_scoped' & trashedQuery().
            'cee_1a' => [
                'model' => CeeJawaban::class,
                'label' => 'CEE 1a Kuesioner',
                'title_field' => 'responden_nama',
                'subtitle_fields' => ['responden_jabatan', 'tahun_penilaian'],
                'owned' => false,
                'opd_scoped' => true,
                'sync' => null,
            ],
            'cee_1b' => [
                'model' => CeeKelemahanDokumen::class,
                'label' => 'CEE 1b Kelemahan Dokumen',
                'title_field' => 'sumber_data',
                'subtitle_fields' => ['uraian_kelemahan', 'pengisi_nama'],
                'owned' => false,
                'opd_scoped' => true,
                'sync' => null,
            ],
            'cee_1c' => [
                'model' => CeeSimpulan::class,
                'label' => 'CEE 1c Simpulan',
                'title_field' => 'penyusun_nama',
                'subtitle_fields' => ['penyusun_jabatan', 'tahun_penilaian'],
                'owned' => false,
                'opd_scoped' => true,
                'sync' => null,
            ],
            // CeeRtp (Form 1d — RTP atas kelemahan CEE) SEBELUMNYA tidak
            // terdaftar di sini sama sekali padahal punya tombol Hapus di
            // UI (CeeFormController::destroy1d()) yg memanggil ->delete()
            // — krn model pakai SoftDeletes, "hapus" itu sebenarnya
            // soft-delete, tapi tanpa entri di sini datanya TIDAK BISA
            // dipulihkan lewat aplikasi sama sekali (bug ditemukan user
            // saat menguji halaman /trash).
            'cee_1d' => [
                'model' => CeeRtp::class,
                'label' => 'CEE 1d RTP Kelemahan Pengendalian',
                'title_field' => 'kondisi_kurang_memadai',
                'subtitle_fields' => ['rencana_tindak_pengendalian', 'penanggung_jawab'],
                'owned' => false,
                'opd_scoped' => true,
                'sync' => null,
            ],
            // Ditemukan 1 Agustus 2026 dengan cara yang sama seperti CEE 1d di
            // atas: keduanya punya tombol Hapus di UI dan memakai SoftDeletes,
            // tetapi tidak pernah didaftarkan di sini sehingga datanya tidak
            // dapat dipulihkan lewat aplikasi sama sekali. Keduanya lahir pada
            // hari yang sama dengan modulnya (butir A5 dan A11) dan luput
            // didaftarkan saat itu.
            //
            // Keduanya berskala Pemerintah Daerah, bukan per-SKPK, sehingga
            // `opd_scoped` bernilai false — yang boleh memulihkannya hanya
            // pengguna yang berwenang atas seluruh SKPK.
            'arahan_penilaian' => [
                'model' => ArahanPenilaianRisiko::class,
                'label' => 'Arahan & Kebijakan Penilaian Risiko',
                'title_field' => 'nomor_se',
                'subtitle_fields' => ['jenis', 'tahun_mulai', 'tahun_selesai'],
                'owned' => false,
                'sync' => null,
            ],
            'struktur_pengelola' => [
                'model' => StrukturPengelolaRisiko::class,
                'label' => 'Struktur Pengelola Risiko',
                'title_field' => 'jabatan',
                'subtitle_fields' => ['nama', 'peran', 'tahun'],
                'owned' => false,
                'sync' => null,
            ],
            'krs_pemda' => [
                'model' => KrsPemda::class,
                'label' => 'I_a Risiko Strategis Pemda',
                'title_field' => 'PROGRAM PRIORITAS',
                'subtitle_fields' => ['SASARAN RPJMD', 'OPD PENANGGUNGJAWAB PROGRAM'],
                'owned' => false,
                'sync' => KrsIrsSyncService::class,
            ],
            'irs_pemda' => [
                'model' => IrsPemda::class,
                'label' => 'I_b IRS Pemda (Risiko)',
                'title_field' => 'URAIAN RISIKO',
                'subtitle_fields' => ['SASARAN RPJMD', 'PEMILIK RISIKO'],
                'owned' => true,
                'sync' => KrsIrsSyncService::class,
            ],
            'krs_pd' => [
                'model' => KrsPd::class,
                'label' => 'II_a Risiko Strategis PD',
                'title_field' => 'SUBKEGIATAN PD',
                'subtitle_fields' => ['PROGRAM PD', 'KEGIATAN PD', 'OPD PENANGGUNG JAWAB KEGIATAN'],
                'owned' => true,
                'sync' => KrsIrsPdSyncService::class,
            ],
            'irs_pd' => [
                'model' => IrsPd::class,
                'label' => 'II_b IRS PD (Risiko)',
                'title_field' => 'URAIAN RISIKO',
                'subtitle_fields' => ['SASARAN RENSTRA', 'PEMILIK RISIKO'],
                'owned' => true,
                'sync' => KrsIrsPdSyncService::class,
            ],
            'kro_pd' => [
                'model' => KroPd::class,
                'label' => 'III_a Risiko Operasional PD',
                'title_field' => 'SUBKEGIATAN PD',
                'subtitle_fields' => ['PROGRAM PD', 'KEGIATAN PD', 'OPD PENANGGUNG JAWAB KEGIATAN'],
                'owned' => true,
                'sync' => KroIroPdSyncService::class,
            ],
            'iro_pd' => [
                'model' => IroPd::class,
                'label' => 'III_b IRO PD (Risiko)',
                'title_field' => 'URAIAN RISIKO',
                'subtitle_fields' => ['SASARAN RENSTRA', 'PEMILIK RISIKO'],
                'owned' => true,
                'sync' => KroIroPdSyncService::class,
            ],
            // LaporanKejadianRisiko (laporan warga via QR /lapor-kejadian)
            // — DITEMPATKAN PALING AKHIR (bukan sebelum kertas kerja
            // risiko utama KRS/IRS/KRO/IRO) krn ini sumber pelengkap
            // (masukan warga), bukan kertas kerja utama sesuai Perdep
            // PPKD No.4/2019 — urutan tab wajib mengikuti urutan
            // kepentingan data, bukan urutan penambahan fitur.
            // Sama masalahnya dgn cee_1d di atas: LaporanKejadianController
            // ::destroy() sudah lama punya tombol Hapus di Rekap.tsx yg
            // memanggil ->delete() (soft-delete krn model pakai SoftDeletes),
            // tapi tanpa entri di sini laporan warga yg terhapus TIDAK BISA
            // dipulihkan. Kepemilikan opd_scoped (bukan owned/user_id) krn
            // kolomnya opd_id, sama pola dgn ensureCanManage() di
            // LaporanKejadianController (PIC OPD hanya kelola laporan
            // opd_id-nya sendiri).
            'laporan_kejadian' => [
                'model' => LaporanKejadianRisiko::class,
                'label' => 'Laporan Kejadian Risiko (Warga)',
                'title_field' => 'kejadian',
                'subtitle_fields' => ['nama_lengkap', 'status'],
                'owned' => false,
                'opd_scoped' => true,
                'sync' => null,
            ],
            // Kaitan risiko <-> Program Bupati (halaman "Miscellaneous >
            // Risiko 100 Program Bupati") — lintas-OPD (satu risiko boleh
            // terkait program apa saja, tidak terikat kepemilikan OPD
            // tertentu), jadi owned=false DAN opd_scoped tidak diisi
            // (default false) => sesuai trashedQuery(), hanya admin/
            // super-admin yg bisa lihat/pulihkan/hapus permanen di sini,
            // sama pola dgn krs_pemda (data lintas-OPD tingkat Pemda).
            'program_bupati_risiko' => [
                'model' => ProgramBupatiRisiko::class,
                'label' => 'Kaitan Risiko - 100 Program Bupati',
                'title_field' => 'ringkasan',
                'subtitle_fields' => [],
                'owned' => false,
                'sync' => null,
            ],
        ];
    }

    private function isAdmin(): bool
    {
        return auth()->user()?->canViewAllOpd() ?? false;
    }

    /**
     * Query baris terhapus untuk sebuah tipe, dengan pembatasan kepemilikan:
     * - tipe lintas-OPD (owned=false, opd_scoped=false, mis. 1a KRS Pemda):
     *   hanya admin/super-admin.
     * - tipe owned: non-admin hanya barisnya sendiri (user_id).
     * - tipe opd_scoped (CEE): non-admin hanya baris OPD miliknya (opd_id),
     *   akun bersama CEE_Survey (tanpa opd_id) tidak melihat baris manapun
     *   di sini — restore/hapus data CEE lintas-OPD tetap tugas Admin.
     */
    private function trashedQuery(array $type)
    {
        /** @var class-string<Model> $model */
        $model = $type['model'];
        $query = $model::onlyTrashed()->orderByDesc('deleted_at');

        if (! $this->isAdmin()) {
            if (! empty($type['opd_scoped'])) {
                $opdId = auth()->user()?->opd_id;
                $query->where('opd_id', $opdId ?? 0);
            } elseif (! $type['owned']) {
                // Data lintas-OPD hanya boleh dilihat admin.
                $query->whereRaw('1 = 0');
            } else {
                $query->where('user_id', auth()->id());
            }
        }

        return $query;
    }

    public function index(Request $request)
    {
        $types = $this->types();
        $active = (string) $request->query('type', array_key_first($types));
        if (! isset($types[$active])) {
            $active = array_key_first($types);
        }

        // Jumlah item terhapus per tipe (untuk badge di tab).
        $counts = [];
        foreach ($types as $slug => $type) {
            $counts[$slug] = $this->trashedQuery($type)->count();
        }

        $type = $types[$active];
        $rows = $this->trashedQuery($type)->limit(500)->get()->map(function (Model $row) use ($type) {
            return [
                'id' => $row->getKey(),
                // batch: bila diisi, baris ini bagian dari satu hapus-NODE (banyak
                // baris) → di UI dikelompokkan & bisa "Pulihkan sekelompok".
                'batch' => $row->delete_batch ?: null,
                'title' => (string) ($row->{$type['title_field']} ?? '—'),
                'subtitles' => collect($type['subtitle_fields'])
                    ->map(fn ($f) => trim((string) ($row->{$f} ?? '')))
                    ->filter(fn ($v) => $v !== '')
                    ->values()
                    ->all(),
                'deleted_at' => optional($row->deleted_at)->toDateTimeString(),
            ];
        });

        return Inertia::render('trash/Index', [
            'tabs' => collect($types)->map(fn ($t, $slug) => [
                'slug' => $slug,
                'label' => $t['label'],
                'count' => $counts[$slug],
            ])->values(),
            'activeType' => $active,
            'rows' => $rows,
            'isAdmin' => $this->isAdmin(),
        ]);
    }

    /** Ambil model terhapus + tegakkan izin lihat/kelola, atau 404/403. */
    private function findTrashed(string $slug, int $id): array
    {
        $types = $this->types();
        if (! isset($types[$slug])) {
            abort(404, 'Jenis data tidak dikenal.');
        }
        $type = $types[$slug];

        $row = $this->trashedQuery($type)->whereKey($id)->first();
        if (! $row) {
            abort(404, 'Data terhapus tidak ditemukan atau bukan milik Anda.');
        }

        return [$type, $row];
    }

    private function runSync(?string $syncClass): void
    {
        if ($syncClass) {
            app($syncClass)->sync();
        }
    }

    public function restore(Request $request, string $type, int $id)
    {
        [$typeDef, $row] = $this->findTrashed($type, $id);
        $row->restore();
        $this->runSync($typeDef['sync']);

        return back()->with('success', 'Data berhasil dipulihkan.');
    }

    /**
     * Pulihkan SEKELOMPOK: seluruh baris terhapus dengan delete_batch yang sama
     * (hasil satu operasi hapus-node). Tetap dibatasi kepemilikan lewat
     * trashedQuery() sehingga PIC hanya memulihkan barisnya sendiri.
     */
    public function restoreBatch(Request $request, string $type, string $batch)
    {
        $types = $this->types();
        if (! isset($types[$type])) {
            abort(404, 'Jenis data tidak dikenal.');
        }
        $typeDef = $types[$type];

        $rows = $this->trashedQuery($typeDef)->where('delete_batch', $batch)->get();
        if ($rows->isEmpty()) {
            abort(404, 'Kelompok data terhapus tidak ditemukan atau bukan milik Anda.');
        }

        foreach ($rows as $row) {
            $row->restore();
        }
        $this->runSync($typeDef['sync']);

        return back()->with('success', $rows->count().' data berhasil dipulihkan.');
    }

    public function forceDelete(Request $request, string $type, int $id)
    {
        // Hapus permanen hanya untuk admin/super-admin.
        if (! $this->isAdmin()) {
            abort(403, 'Hanya Admin/Super Admin yang dapat menghapus permanen.');
        }

        [$typeDef, $row] = $this->findTrashed($type, $id);
        $rowId = (int) $row->getKey();
        $row->forceDelete();
        $this->cleanupOrphanMonitoring($type, $rowId);
        $this->runSync($typeDef['sync']);

        return back()->with('success', 'Data dihapus permanen.');
    }

    /**
     * Setelah baris risiko DIHAPUS PERMANEN, bersihkan baris Monitoring &
     * Evaluasi (Form 8/9/10) yg menautkannya scr polimorfik — jika tidak,
     * MonitoringRtp/PencatatanKejadianRisiko jadi yatim (menunjuk id risiko
     * yg sudah tidak ada). Slug tipe di TrashController (irs_pemda/irs_pd/
     * iro_pd) sama persis dgn rtp_sumber_tipe/risiko_tipe yg disimpan
     * MonitoringEvaluasiController.
     */
    private function cleanupOrphanMonitoring(string $slug, int $rowId): void
    {
        if (! in_array($slug, ['irs_pemda', 'irs_pd', 'iro_pd'], true)) {
            return;
        }

        // Parent sudah hilang permanen → orphan jg dihapus permanen
        // (withTrashed + forceDelete), termasuk yg mungkin sudah soft-deleted.
        MonitoringRtp::withTrashed()
            ->where('rtp_sumber_tipe', $slug)
            ->where('rtp_sumber_id', $rowId)
            ->forceDelete();

        PencatatanKejadianRisiko::withTrashed()
            ->where('risiko_tipe', $slug)
            ->where('risiko_id', $rowId)
            ->forceDelete();
    }
}
