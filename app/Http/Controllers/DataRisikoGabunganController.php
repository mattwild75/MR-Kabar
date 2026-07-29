<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\AppendsProgramBupatiTag;
use App\Http\Controllers\Concerns\GeneratesKodeRisiko;
use App\Http\Controllers\Concerns\HasOpdFillStatus;
use App\Models\IroPd;
use App\Models\IrsPd;
use App\Models\IrsPemda;
use App\Models\Opd;
use App\Models\RiskLevel;
use Illuminate\Support\Collection;
use Inertia\Inertia;

/**
 * Halaman gabungan READ-ONLY (Form Input > Risiko > Data Risiko (IRS dan
 * IRO)) — menampilkan ketiga tabel Identifikasi Risiko (I_b_IRS_Pemda,
 * II_b_IRS_PD, III_b_IRO_PD) SEKALIGUS dalam satu halaman dgn pencarian
 * per-tabel, TANPA form tambah/edit/hapus (murni cara cepat melihat &
 * menemukan baris lintas ketiga tingkat, lalu klik "Lihat Data" utk pindah
 * ke halaman Form Input aslinya dan mengedit di sana). Admin/Super Admin
 * melihat SEMUA OPD, PIC biasa hanya baris miliknya sendiri (opd_id akun
 * login) — sama pola scoping dgn CetakHasilAnalisisController::
 * scopedOpdId()/buildAnalisisRisiko(), BUKAN pola $isAdmin+where('user_id')
 * polos di IrsPemdaController/IrsPdController/IroPdController, krn di sini
 * scoping-nya per-OPD (opd_id), bukan per-baris-user pembuat.
 */
class DataRisikoGabunganController extends Controller
{
    use GeneratesKodeRisiko;
    use HasOpdFillStatus;
    use AppendsProgramBupatiTag;

    /** Field `risiko_tipe` (program_bupati_risiko) per model — dipakai buildSection() utk penanda "(P{nomor})". */
    private const RISIKO_TIPE_BY_MODEL = [
        IrsPemda::class => 'irs_pemda',
        IrsPd::class => 'irs_pd',
        IroPd::class => 'iro_pd',
    ];

    /**
     * Kolom yg dibutuhkan tabel gabungan ini (kolom "Aksi" cukup butuh
     * `id` utk redirect ?highlight_id=) — dibatasi spy transfer data lebih
     * ringan drpd select() semua kolom spt Index() masing2 controller asli
     * (yg butuh semua kolom krn ada form edit inline, tidak relevan di sini).
     */
    private const KOLOM_UMUM = [
        'id', 'user_id', 'URAIAN RISIKO', 'TAHUN DINILAI RISIKO', 'JENIS RISIKO',
        'ENTITAS PD YANG MENILAI', 'PEMILIK RISIKO', 'SKALA RISIKO', 'SKALA PRIORITAS',
        'RENCANA TINDAK PENGENDALIAN', 'PENANGGUNG JAWAB PENGENDALIAN',
        'UNIT/OPD PENANGGUNG JAWAB PENGENDALIAN',
    ];

    /**
     * PIC biasa (role 'user') hanya melihat baris milik OPD-nya sendiri
     * (opd_id akun login) — Admin/Super Admin null (tidak dibatasi), sama
     * persis CetakHasilAnalisisController::scopedOpdId().
     */
    private function scopedOpdId(): ?int
    {
        $user = auth()->user();
        if (!$user || $user->canViewAllOpd()) {
            return null;
        }

        return $user->opd_id;
    }

    /**
     * Ambil & proyeksikan satu tabel (IrsPemda/IrsPd/IroPd) ke array baris
     * seragam siap-tampil, termasuk "No" (nomor urut, dihitung dari SELURUH
     * data dulu sebelum discope $opdId — sama alasan dgn
     * CetakHasilAnalisisController::buildAnalisisRisiko(), supaya nomor
     * urut yg tampil ke PIC tetap konsisten dgn Form Input aslinya, bukan
     * angka lain krn basis penghitungan beda) dan kolom pengelompokan
     * ($groupField: "SASARAN RPJMD"/"SASARAN RENSTRA"/"KEGIATAN PD").
     */
    private function buildSection(string $modelClass, string $groupField, ?int $opdId): Collection
    {
        $rows = $modelClass::whereHas('user')
            ->select([...self::KOLOM_UMUM, $groupField])
            ->with(['user:id,opd_id', 'user.opd:id,nama'])
            ->orderBy('id')
            ->get()
            ->filter(fn ($r) => trim((string) $r->{'URAIAN RISIKO'}) !== '');

        $nomorUrut = $this->nomorUrutFor($rows);

        // Penanda "(P{nomor})" utk risiko yg dikaitkan ke salah satu 100
        // Program Pembangunan Bupati — lihat AppendsProgramBupatiTag, murni
        // penanda internal tanpa penjelasan apapun di frontend.
        $programBupatiMap = $this->programBupatiNomorMap(self::RISIKO_TIPE_BY_MODEL[$modelClass]);

        return $rows
            ->filter(fn ($r) => !$opdId || $r->user?->opd_id === $opdId)
            ->map(fn ($r) => [
                'id' => $r->id,
                'no' => $nomorUrut[$r->id] ?? null,
                'kelompok' => $r->{$groupField},
                'uraian_risiko' => $this->withProgramBupatiTag($r->{'URAIAN RISIKO'}, $r->id, $programBupatiMap),
                'tahun' => $r->{'TAHUN DINILAI RISIKO'},
                'jenis_risiko' => $r->{'JENIS RISIKO'},
                'entitas_penilai' => $r->{'ENTITAS PD YANG MENILAI'},
                'pemilik_risiko' => $r->{'PEMILIK RISIKO'},
                'skala_risiko' => $r->{'SKALA RISIKO'},
                'skala_prioritas' => $r->{'SKALA PRIORITAS'},
                'rtp' => $r->{'RENCANA TINDAK PENGENDALIAN'},
                'penanggung_jawab_pengendalian' => $r->{'PENANGGUNG JAWAB PENGENDALIAN'},
                'unit_opd_penanggung_jawab' => $r->{'UNIT/OPD PENANGGUNG JAWAB PENGENDALIAN'},
                'opd_nama' => $r->user?->opd?->nama,
            ])
            ->sortBy(fn ($r) => [$r['opd_nama'] ?? '', $r['kelompok'] ?? '', $r['no'] ?? ''])
            ->values();
    }

    public function index()
    {
        $isAdmin = auth()->user()?->canViewAllOpd() ?? false;
        $opdId = $this->scopedOpdId();

        return Inertia::render('risiko/DataRisikoGabungan', [
            'irsPemda' => $this->buildSection(IrsPemda::class, 'SASARAN RPJMD', $opdId),
            'irsPd' => $this->buildSection(IrsPd::class, 'SASARAN RENSTRA', $opdId),
            'iroPd' => $this->buildSection(IroPd::class, 'KEGIATAN PD', $opdId),
            'isScopedToOwnOpd' => $opdId !== null,
            'riskLevels' => RiskLevel::orderBy('urutan')->get(['label', 'skala_min', 'skala_max', 'warna_class']),
            // Panel "Lihat status pengisian seluruh OPD" — sama pola dgn
            // Index() masing2 controller asli (IrsPemdaController dkk),
            // hanya terlihat utk Admin/Super Admin, satu panel per tabel
            // (basisnya kolom "ENTITAS PD YANG MENILAI" tabel ybs, BUKAN
            // opd_id akun PIC yg login — lihat komentar HasOpdFillStatus).
            'opdList' => $isAdmin ? Opd::orderBy('nama')->get(['id', 'nama']) : [],
            'opdFillStatus' => $isAdmin ? [
                'irsPemda' => $this->opdFillStatusByColumn(IrsPemda::class, 'ENTITAS PD YANG MENILAI'),
                'irsPd' => $this->opdFillStatusByColumn(IrsPd::class, 'ENTITAS PD YANG MENILAI'),
                'iroPd' => $this->opdFillStatusByColumn(IroPd::class, 'ENTITAS PD YANG MENILAI'),
            ] : [],
        ]);
    }
}
