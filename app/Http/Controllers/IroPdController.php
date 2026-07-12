<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\HasOpdFillStatus;
use App\Models\IroPd;
use App\Models\KroPd;
use App\Models\Opd;
use App\Models\PengaturanPemda;
use App\Services\KroIroPdSyncService;
use App\Services\RiskReferenceDataService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class IroPdController extends Controller
{
    use HasOpdFillStatus;

    public function __construct(private readonly RiskReferenceDataService $riskRef)
    {
    }

    // "NOMOR URUT RISIKO" sengaja tidak ada di FIELDS — nilainya selalu
    // dihitung ulang otomatis oleh withNomorUrut() setiap render, sama
    // seperti IrsPdController. "TINGKAT RISIKO" juga tidak ada di FIELDS
    // — nilainya TETAP "Risiko Operasional OPD" untuk seluruh halaman
    // ini, diisi otomatis di store()/update() — lihat TINGKAT_RISIKO_VALUE.
    private const FIELDS = [
        'KEGIATAN PD',
        'URAIAN RISIKO',
        'TAHUN DINILAI RISIKO',
        'JENIS RISIKO',
        'ENTITAS PD YANG MENILAI',
        'TAHAP',
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
     * Nilai tetap TINGKAT RISIKO untuk halaman ini — III_b_IRO_PD selalu
     * "Risiko Operasional OPD", tidak pernah nilai lain.
     */
    public const TINGKAT_RISIKO_VALUE = 'Risiko Operasional OPD';

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
     * Tahapan pelaksanaan Kegiatan tempat risiko bisa muncul — sesuai
     * definisi VBA asli sheet III_b_IRO_PD: Perencanaan (mis. risiko data
     * dasar salah), Pengadaan (mis. lelang gagal), Pelaksanaan (mis.
     * hambatan teknis/cuaca), Monitoring, Pelaporan (mis. keterlambatan
     * penyampaian laporan).
     */
    public const TAHAP_OPTIONS = [
        'Perencanaan',
        'Pengadaan',
        'Pelaksanaan',
        'Monitoring',
        'Pelaporan',
    ];

    /**
     * Menghitung Skala Risiko dan Skala Prioritas — sumber matriks & lookup
     * dari RiskReferenceDataService (tabel risk_matrix_cells), bukan lagi
     * array const di controller ini (dulu duplikat identik dgn
     * IrsPemdaController/IrsPdController).
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
     * Menghitung ulang "Nomor Urut Risiko" per kelompok Kegiatan PD — sama
     * seperti IrsPdController::withNomorUrut() tapi dikelompokkan per
     * Kegiatan (bukan Sasaran), karena basis risiko operasional (sesuai
     * Perdep PPKD No.4/2019) adalah Kegiatan pada Renja OPD.
     */
    private function withNomorUrut($rows)
    {
        $prevKegiatan = null;
        $counter = 0;

        foreach ($rows as $row) {
            $kegiatan = trim((string) $row->{'KEGIATAN PD'});

            if ($kegiatan !== $prevKegiatan) {
                $counter = 0;
                $prevKegiatan = $kegiatan;
            }

            if (trim((string) $row->{'URAIAN RISIKO'}) !== '') {
                $counter++;
                $row->{'NOMOR URUT RISIKO'} = str_pad((string) $counter, 2, '0', STR_PAD_LEFT);
            } else {
                $row->{'NOMOR URUT RISIKO'} = null;
            }
        }

        return $rows;
    }

    public function index()
    {
        $isAdmin = auth()->user()?->hasAnyRole(['admin', 'super-admin']) ?? false;

        // Baris hanya ditampilkan ke pemiliknya sendiri, kecuali admin/
        // super-admin yang melihat semua — konsisten dengan pembatasan
        // edit/hapus di RiskOwnershipPolicy.
        $query = IroPd::orderBy('id');
        if (!$isAdmin) {
            $query->where('user_id', auth()->id());
        }
        $rows = $this->withNomorUrut($query->get());

        // Daftar Kegiatan PD yang sudah ada di tbl_kro_pd, dipakai sebagai
        // pilihan combobox supaya Kegiatan yang dirujuk IRO_PD konsisten
        // dengan data KRO_PD (bukan diketik ulang bebas). Ikut dibatasi ke
        // milik sendiri supaya PIC tidak bisa merujuk Kegiatan milik OPD
        // lain.
        $kegiatanQuery = KroPd::query();
        if (!$isAdmin) {
            $kegiatanQuery->where('user_id', auth()->id());
        }
        $kegiatanOptions = $kegiatanQuery
            ->pluck('KEGIATAN PD')
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
        $fieldOptions['KEGIATAN PD'] = $kegiatanOptions->all();
        $fieldOptions['TAHAP'] = self::TAHAP_OPTIONS;

        return Inertia::render('iro_pd/Index', [
            'rows' => $rows,
            'fieldOptions' => $fieldOptions,
            'opdOptions' => Opd::orderBy('nama')->pluck('nama'),
            'opdList' => $isAdmin ? Opd::orderBy('nama')->get(['id', 'nama']) : [],
            'opdFillStatus' => $isAdmin ? $this->opdFillStatusByColumn(IroPd::class, 'ENTITAS PD YANG MENILAI') : [],
            'jenisRisikoOptions' => $this->riskRef->jenisRisikoOptions(),
            'entitasPenilaiOptions' => $this->riskRef->entitasPenilaiOptions(),
            'riskReference' => $this->riskRef->referenceDialogPayload(),
            'tahapOptions' => self::TAHAP_OPTIONS,
            'triwulanOptions' => self::TRIWULAN_OPTIONS,
            'triwulanLabels' => self::TRIWULAN_LABELS,
            'kegiatanKodes' => $this->kegiatanKodes(),
            'currentUserId' => auth()->id(),
            'currentUserOpdNama' => $isAdmin ? null : auth()->user()?->opd?->nama,
            'isAdmin' => $isAdmin,
            'tahunAktif' => PengaturanPemda::current()->tahun_penilaian,
        ]);
    }

    /**
     * Sama seperti IrsPdController::sasaranRenstraKodes() — peta deskripsi
     * bersih Kegiatan PD -> kode asli-nya (mis. "1.1.1.1.1.1.1"), dari
     * tbl_kro_iro_pd. Dipakai FRONTEND SAJA untuk label "Kode: ..." di
     * form, tidak mengubah value yang tersimpan di tbl_iro_pd.
     */
    private function kegiatanKodes(): array
    {
        if (!Schema::hasTable('tbl_kro_iro_pd')) {
            return [];
        }

        $kodes = [];
        foreach (DB::table('tbl_kro_iro_pd')->distinct()->pluck('KEGIATAN_PD') as $labeled) {
            $labeled = (string) $labeled;
            if (preg_match('/^Kegiatan\s+([\d.]+)\s*:\s*(.*)$/s', $labeled, $matches)) {
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
        // PIC BEBAS memilih tahun baris ini — lihat IrsPdController::validated().
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

    public function store(Request $request, KroIroPdSyncService $sync)
    {
        $data = $this->fillEmptyTextFields($this->withCalculatedScales($this->validated($request)));
        $data['TINGKAT RISIKO'] = self::TINGKAT_RISIKO_VALUE;
        // Fallback ke Tahun Aktif Pemda HANYA kalau PIC tidak mengisi
        // sendiri — lihat IrsPdController::store() untuk alasannya.
        if (empty($data['TAHUN DINILAI RISIKO'])) {
            $data['TAHUN DINILAI RISIKO'] = PengaturanPemda::current()->tahun_penilaian;
        }
        $data['user_id'] = $request->user()->id;
        IroPd::create($data);
        $sync->sync();

        return redirect()->route('iro_pd.index')->with('success', 'Data berhasil ditambahkan.');
    }

    public function update(Request $request, IroPd $iro_pd, KroIroPdSyncService $sync)
    {
        $this->authorize('update', $iro_pd);

        $data = $this->fillEmptyTextFields($this->withCalculatedScales($this->validated($request)));
        $data['TINGKAT RISIKO'] = self::TINGKAT_RISIKO_VALUE;
        $iro_pd->update($data);
        $sync->sync();

        return redirect()->route('iro_pd.index')->with('success', 'Data berhasil diperbarui.');
    }

    public function destroy(IroPd $iro_pd, KroIroPdSyncService $sync)
    {
        $this->authorize('delete', $iro_pd);

        $iro_pd->delete();
        $sync->sync();

        return redirect()->route('iro_pd.index')->with('success', 'Data berhasil dihapus.');
    }
}
