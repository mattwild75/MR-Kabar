<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\GeneratesKodeRisiko;
use App\Http\Controllers\Concerns\HasOpdFillStatus;
use App\Models\IrsPd;
use App\Models\KrsPd;
use App\Models\Opd;
use App\Models\PengaturanPemda;
use App\Services\KrsIrsPdSyncService;
use App\Services\RiskReferenceDataService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class IrsPdController extends Controller
{
    use HasOpdFillStatus;
    use GeneratesKodeRisiko;

    public function __construct(private readonly RiskReferenceDataService $riskRef)
    {
    }

    // "NOMOR URUT RISIKO" sengaja tidak ada di FIELDS — nilainya selalu
    // dihitung ulang otomatis oleh withNomorUrut() setiap render, sama
    // seperti IrsPemdaController. "TINGKAT RISIKO" juga tidak ada di
    // FIELDS — nilainya TETAP "Risiko Strategis OPD" untuk seluruh
    // halaman ini, diisi otomatis di store()/update() — lihat
    // TINGKAT_RISIKO_VALUE.
    private const FIELDS = [
        'SASARAN RENSTRA',
        'URAIAN RISIKO',
        'TAHUN DINILAI RISIKO',
        'JENIS RISIKO',
        'ENTITAS PD YANG MENILAI',
        'PEMILIK RISIKO',
        'URAIAN PENYEBAB RISIKO',
        'SUMBER SEBAB RISIKO',
        'C / UC',
        'URAIAN DAMPAK RISIKO',
        'PIHAK YANG TERKENA DAMPAK RISIKO',
        'URAIAN PENGENDALIAN YANG SUDAH ADA',
        'KATEGORI EXISTING CONTROL',
        'CELAH PENGENDALIAN',
        'RENCANA TINDAK PENGENDALIAN',
        'UNIT/OPD PENANGGUNG JAWAB PENGENDALIAN',
        'PENANGGUNG JAWAB PENGENDALIAN',
        'TRIWULAN',
        'TAHUN TARGET PENYELESAIAN',
    ];

    /** Kategori penilaian efektivitas existing control, sesuai PP 60/2008. */
    public const KATEGORI_EXISTING_CONTROL_OPTIONS = ['E', 'KE', 'TE'];

    /**
     * Nilai tetap TINGKAT RISIKO untuk halaman ini — II_b_IRS_PD selalu
     * "Risiko Strategis OPD", tidak pernah nilai lain.
     */
    public const TINGKAT_RISIKO_VALUE = 'Risiko Strategis OPD';

    /**
     * Sama seperti IrsPemdaController::TRIWULAN_OPTIONS — pengganti
     * "TARGET WAKTU PENYELESAIAN" yang dulu teks bebas.
     */
    public const TRIWULAN_OPTIONS = ['I', 'II', 'III', 'IV'];

    public const TRIWULAN_LABELS = [
        'I' => 'Triwulan I (Januari/Februari/Maret)',
        'II' => 'Triwulan II (April/Mei/Juni)',
        'III' => 'Triwulan III (Juli/Agustus/September)',
        'IV' => 'Triwulan IV (Oktober/November/Desember)',
    ];

    /**
     * Menghitung Skala Risiko dan Skala Prioritas — sumber matriks & lookup
     * dari RiskReferenceDataService (tabel risk_matrix_cells), bukan lagi
     * array const di controller ini (dulu duplikat identik dgn
     * IrsPemdaController).
     */
    private function withCalculatedScales(array $data): array
    {
        $dampak = (int) ($data['SKALA DAMPAK'] ?? 0);
        $kemungkinan = (int) ($data['SKALA KEMUNGKINAN'] ?? 0);

        $hasil = $this->riskRef->hitungSkala($dampak ?: null, $kemungkinan ?: null);
        $data['SKALA RISIKO'] = $hasil['skala_risiko'];
        $data['SKALA PRIORITAS'] = $hasil['skala_prioritas'];

        return $data;
    }

    /**
     * Menghitung ulang "Nomor Urut Risiko" per kelompok Sasaran Renstra,
     * sama seperti IrsPemdaController::withNomorUrut() tapi dikelompokkan
     * per Sasaran Renstra (bukan Sasaran RPJMD).
     */
    private function withNomorUrut($rows)
    {
        $nomorUrutMap = $this->nomorUrutFor($rows);

        foreach ($rows as $row) {
            $row->{'NOMOR URUT RISIKO'} = $nomorUrutMap[$row->id] ?? null;
        }

        return $rows;
    }

    public function index()
    {
        $isAdmin = auth()->user()?->hasAnyRole(['admin', 'super-admin']) ?? false;

        // Baris hanya ditampilkan ke pemiliknya sendiri, kecuali admin/
        // super-admin yang melihat semua — konsisten dengan pembatasan
        // edit/hapus di RiskOwnershipPolicy.
        $query = IrsPd::orderBy('id');
        if (!$isAdmin) {
            $query->where('user_id', auth()->id());
        }
        $rows = $this->withNomorUrut($query->get());

        // Daftar Sasaran Strategis PD yang sudah ada di tbl_krs_pd, dipakai
        // sebagai pilihan combobox supaya Sasaran yang dirujuk IRS_PD
        // konsisten dengan data KRS_PD (bukan diketik ulang bebas). Ikut
        // dibatasi ke milik sendiri supaya PIC tidak bisa merujuk Sasaran
        // Renstra milik OPD lain.
        $sasaranQuery = KrsPd::query();
        if (!$isAdmin) {
            $sasaranQuery->where('user_id', auth()->id());
        }
        $sasaranOptions = $sasaranQuery
            ->pluck('SASARAN STRATEGIS PD')
            ->map(fn ($v) => trim((string) $v))
            ->filter(fn ($v) => $v !== '' && $v !== '-' && $v !== 'Tidak Ada Data')
            ->map(function ($v) {
                $pos = strrpos($v, ':');
                return $pos !== false ? trim(substr($v, $pos + 1)) : $v;
            })
            ->unique()
            ->values();

        $fieldOptions = [];
        foreach (self::FIELDS as $field) {
            $fieldOptions[$field] = $rows
                ->pluck($field)
                ->map(fn ($v) => trim((string) $v))
                ->filter(fn ($v) => $v !== '')
                ->unique()
                ->values()
                ->all();
        }
        $fieldOptions['SASARAN RENSTRA'] = $sasaranOptions->all();

        return Inertia::render('irs_pd/Index', [
            'rows' => $rows,
            'fieldOptions' => $fieldOptions,
            'opdOptions' => Opd::orderBy('nama')->pluck('nama'),
            'opdList' => $isAdmin ? Opd::orderBy('nama')->get(['id', 'nama']) : [],
            'opdFillStatus' => $isAdmin ? $this->opdFillStatusByColumn(IrsPd::class, 'ENTITAS PD YANG MENILAI') : [],
            'jenisRisikoOptions' => $this->riskRef->jenisRisikoOptions(),
            'entitasPenilaiOptions' => $this->riskRef->entitasPenilaiOptions(),
            'riskReference' => $this->riskRef->referenceDialogPayload(),
            'triwulanOptions' => self::TRIWULAN_OPTIONS,
            'triwulanLabels' => self::TRIWULAN_LABELS,
            'sasaranRenstraKodes' => $this->sasaranRenstraKodes(),
            'currentUserId' => auth()->id(),
            'currentUserOpdNama' => $isAdmin ? null : auth()->user()?->opd?->nama,
            'isAdmin' => $isAdmin,
            'tahunAktif' => PengaturanPemda::current()->tahun_penilaian,
        ]);
    }

    /**
     * Sama seperti IrsPemdaController::sasaranRpjmdKodes() — peta deskripsi
     * bersih Sasaran Strategis PD -> kode asli-nya (mis. "1.1.1.1"), dari
     * tbl_krs_irs_pd. Dipakai FRONTEND SAJA untuk label "Kode: ..." di form,
     * tidak mengubah value yang tersimpan di tbl_irs_pd.
     */
    private function sasaranRenstraKodes(): array
    {
        if (!Schema::hasTable('tbl_krs_irs_pd')) {
            return [];
        }

        $kodes = [];
        foreach (DB::table('tbl_krs_irs_pd')->distinct()->pluck('SASARAN_STRATEGIS_PD') as $labeled) {
            $labeled = (string) $labeled;
            if (preg_match('/^Sasaran\s+([\d.]+)\s*:\s*(.*)$/s', $labeled, $matches)) {
                $kodes[trim($matches[2])] = $matches[1];
            }
        }

        return $kodes;
    }

    private function validated(Request $request): array
    {
        $rules = [];
        $attributes = [];
        foreach (self::FIELDS as $field) {
            $rules[$field] = ['nullable', 'string'];
            $attributes[$field] = $field;
        }
        $rules['URAIAN RISIKO'] = ['required', 'string'];
        $rules['SKALA DAMPAK'] = ['required', 'integer', 'min:1', 'max:5'];
        $rules['SKALA KEMUNGKINAN'] = ['required', 'integer', 'min:1', 'max:5'];
        $rules['TRIWULAN'] = ['nullable', Rule::in(self::TRIWULAN_OPTIONS)];
        $rules['TAHUN TARGET PENYELESAIAN'] = ['nullable', 'integer', 'digits:4'];
        // PIC BEBAS memilih tahun baris ini (default Tahun Aktif dari
        // TahunAktifBadge, tapi boleh diganti) — supaya OPD bisa
        // melengkapi data tahun lain (mis. 2025) kapan saja tanpa
        // bergantung Admin mengubah Tahun Aktif global lebih dulu.
        $rules['TAHUN DINILAI RISIKO'] = ['nullable', 'digits:4'];

        return $request->validate($rules, [], $attributes);
    }

    /**
     * Kolom kosong dibiarkan kosong apa adanya — lihat
     * KrsPemdaController::fillBlanks() utk alasan sentinel dihapus.
     */
    private function fillEmptyTextFields(array $data): array
    {
        return $data;
    }

    public function store(Request $request, KrsIrsPdSyncService $sync)
    {
        $data = $this->fillEmptyTextFields($this->withCalculatedScales($this->validated($request)));
        $data['TINGKAT RISIKO'] = self::TINGKAT_RISIKO_VALUE;
        // Fallback ke Tahun Aktif Pemda HANYA kalau PIC tidak mengisi
        // sendiri (mis. request lama/form belum ter-update) — PIC yg
        // sengaja pilih tahun lain (mis. 2025) tetap dihormati, lihat
        // validated().
        if (empty($data['TAHUN DINILAI RISIKO'])) {
            $data['TAHUN DINILAI RISIKO'] = PengaturanPemda::current()->tahun_penilaian;
        }
        $data['user_id'] = $request->user()->id;
        IrsPd::create($data);
        $sync->sync();

        return redirect()->route('irs_pd.index')->with('success', 'Data berhasil ditambahkan.');
    }

    public function update(Request $request, IrsPd $irs_pd, KrsIrsPdSyncService $sync)
    {
        $this->authorize('update', $irs_pd);

        $data = $this->fillEmptyTextFields($this->withCalculatedScales($this->validated($request)));
        $data['TINGKAT RISIKO'] = self::TINGKAT_RISIKO_VALUE;
        $irs_pd->update($data);
        $sync->sync();

        return redirect()->route('irs_pd.index')->with('success', 'Data berhasil diperbarui.');
    }

    public function destroy(IrsPd $irs_pd, KrsIrsPdSyncService $sync)
    {
        $this->authorize('delete', $irs_pd);

        $irs_pd->delete();
        $sync->sync();

        return redirect()->route('irs_pd.index')->with('success', 'Data berhasil dihapus.');
    }
}
