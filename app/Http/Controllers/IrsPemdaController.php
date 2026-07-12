<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\HasOpdFillStatus;
use App\Models\IrsPemda;
use App\Models\Opd;
use App\Models\KrsPemda;
use App\Models\PengaturanPemda;
use App\Services\KrsIrsSyncService;
use App\Services\RiskReferenceDataService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class IrsPemdaController extends Controller
{
    use HasOpdFillStatus;

    public function __construct(private readonly RiskReferenceDataService $riskRef)
    {
    }

    // "NOMOR URUT RISIKO" sengaja tidak ada di FIELDS — nilainya selalu
    // dihitung ulang otomatis oleh withNomorUrut() setiap render (meniru
    // FillAllNumbers pada VBA), bukan diinput manual lewat form.
    // "TINGKAT RISIKO" juga tidak ada di FIELDS — nilainya TETAP untuk
    // seluruh halaman ini ("Risiko Strategis Pemda"), diisi otomatis di
    // store()/update(), bukan pilihan yang diketik/dipilih user. Cuma ada
    // 3 kemungkinan Tingkat Risiko di seluruh aplikasi (Risiko Strategis
    // Pemda/OPD, Risiko Operasional OPD) dan masing-masing sudah pasti
    // sesuai levelnya sendiri — lihat TINGKAT_RISIKO_VALUE.
    private const FIELDS = [
        'SASARAN RPJMD',
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

    /**
     * Kategori penilaian efektivitas existing control, sesuai PP 60/2008 —
     * dipakai frontend sbg pilihan CategorizedTextarea (sama pola dgn C/UC).
     */
    public const KATEGORI_EXISTING_CONTROL_OPTIONS = ['E', 'KE', 'TE'];

    /**
     * Nilai tetap TINGKAT RISIKO untuk halaman ini — I_b_IRS_Pemda selalu
     * "Risiko Strategis Pemda", tidak pernah nilai lain.
     */
    public const TINGKAT_RISIKO_VALUE = 'Risiko Strategis Pemda';

    /**
     * Pengganti "TARGET WAKTU PENYELESAIAN" (dulu teks bebas seperti
     * "Desember 2026"/"Triwulan III 2026" — tidak konsisten dan sempat
     * salah bertipe integer di tbl_krs_irs_pemda sehingga nilainya selalu
     * hilang saat disalin ke tabel derived). TRIWULAN sekarang dropdown
     * tetap (disimpan sebagai angka romawi "I".."IV", keterangan bulan
     * hanya label tampilan — lihat TRIWULAN_LABELS), TAHUN TARGET
     * PENYELESAIAN diisi bebas sebagai angka.
     */
    public const TRIWULAN_OPTIONS = ['I', 'II', 'III', 'IV'];

    public const TRIWULAN_LABELS = [
        'I' => 'Triwulan I (Januari/Februari/Maret)',
        'II' => 'Triwulan II (April/Mei/Juni)',
        'III' => 'Triwulan III (Juli/Agustus/September)',
        'IV' => 'Triwulan IV (Oktober/November/Desember)',
    ];

    /**
     * Menghitung Skala Risiko dan Skala Prioritas secara otomatis dari Skala
     * Dampak x Skala Kemungkinan — sumber matriks & lookup sekarang dari
     * RiskReferenceDataService (tabel risk_matrix_cells, bisa diedit
     * Admin/Super Admin), bukan lagi array const di controller ini.
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
     * Menghitung ulang "Nomor Urut Risiko" per kelompok Sasaran RPJMD, meniru
     * FillAllNumbers pada VBA: counter di-reset ke 0 setiap kelompok Sasaran
     * berganti, lalu naik 1 untuk setiap baris berisi Uraian Risiko dalam
     * kelompok yang sama. Dihitung ulang setiap kali data ditampilkan (bukan
     * disimpan statis di DB) supaya selalu konsisten walau ada baris yang
     * ditambah/diedit/dihapus — beda dari Excel yang butuh event listener
     * manual per perubahan sel, di sini cukup satu passthrough sebelum
     * render.
     */
    private function withNomorUrut($rows)
    {
        $prevSasaran = null;
        $counter = 0;

        foreach ($rows as $row) {
            $sasaran = trim((string) $row->{'SASARAN RPJMD'});

            if ($sasaran !== $prevSasaran) {
                $counter = 0;
                $prevSasaran = $sasaran;
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
        // edit/hapus di RiskOwnershipPolicy (baris tanpa user_id juga
        // hanya terlihat oleh admin).
        $query = IrsPemda::orderBy('id');
        if (!$isAdmin) {
            $query->where('user_id', auth()->id());
        }
        $rows = $this->withNomorUrut($query->get());

        // Daftar Sasaran RPJMD yang sudah ada di tbl_krs_pemda,
        // dipakai sebagai pilihan combobox supaya Sasaran yang dirujuk IRS
        // konsisten dengan data KRS_Pemda (bukan diketik ulang bebas).
        $sasaranOptions = KrsPemda::query()
            ->pluck('SASARAN RPJMD')
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
        $fieldOptions['SASARAN RPJMD'] = $sasaranOptions->all();

        return Inertia::render('irs/Index', [
            'rows' => $rows,
            'fieldOptions' => $fieldOptions,
            'opdOptions' => Opd::orderBy('nama')->pluck('nama'),
            'opdList' => $isAdmin ? Opd::orderBy('nama')->get(['id', 'nama']) : [],
            'opdFillStatus' => $isAdmin ? $this->opdFillStatusByColumn(IrsPemda::class, 'ENTITAS PD YANG MENILAI') : [],
            'jenisRisikoOptions' => $this->riskRef->jenisRisikoOptions(),
            'entitasPenilaiOptions' => $this->riskRef->entitasPenilaiOptions(),
            'riskReference' => $this->riskRef->referenceDialogPayload(),
            'triwulanOptions' => self::TRIWULAN_OPTIONS,
            'triwulanLabels' => self::TRIWULAN_LABELS,
            'sasaranRpjmdKodes' => $this->sasaranRpjmdKodes(),
            'currentUserId' => auth()->id(),
            'isAdmin' => $isAdmin,
            'currentUserOpdNama' => $isAdmin ? null : auth()->user()?->opd?->nama,
            'tahunAktif' => PengaturanPemda::current()->tahun_penilaian,
        ]);
    }

    /**
     * Peta deskripsi bersih (tanpa label) Sasaran RPJMD -> kode asli-nya
     * (mis. "1.1.1"), diambil dari tbl_krs_irs_pemda yang sudah diregenerasi
     * KrsIrsSyncService dengan SASARAN_RPJMD berlabel kode lengkap. Dipakai
     * FRONTEND SAJA untuk menampilkan "Kode: 1.1.1" read-only di atas form
     * Sasaran RPJMD — value yang tersimpan di tbl_irs_pemda tetap teks
     * bersih tanpa kode, tidak diubah oleh mapping ini.
     */
    private function sasaranRpjmdKodes(): array
    {
        if (!Schema::hasTable('tbl_krs_irs_pemda')) {
            return [];
        }

        $kodes = [];
        foreach (DB::table('tbl_krs_irs_pemda')->distinct()->pluck('SASARAN_RPJMD') as $labeled) {
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

    public function store(Request $request, KrsIrsSyncService $sync)
    {
        $data = $this->fillEmptyTextFields($this->withCalculatedScales($this->validated($request)));
        $data['TINGKAT RISIKO'] = self::TINGKAT_RISIKO_VALUE;
        // Fallback ke Tahun Aktif Pemda HANYA kalau PIC tidak mengisi
        // sendiri — lihat IrsPdController::store() untuk alasannya.
        if (empty($data['TAHUN DINILAI RISIKO'])) {
            $data['TAHUN DINILAI RISIKO'] = PengaturanPemda::current()->tahun_penilaian;
        }
        $data['user_id'] = $request->user()->id;
        IrsPemda::create($data);
        $sync->sync();

        return redirect()->route('irs_pemda.index')->with('success', 'Data berhasil ditambahkan.');
    }

    public function update(Request $request, IrsPemda $irs_pemda, KrsIrsSyncService $sync)
    {
        $this->authorize('update', $irs_pemda);

        $data = $this->fillEmptyTextFields($this->withCalculatedScales($this->validated($request)));
        $data['TINGKAT RISIKO'] = self::TINGKAT_RISIKO_VALUE;
        $irs_pemda->update($data);
        $sync->sync();

        return redirect()->route('irs_pemda.index')->with('success', 'Data berhasil diperbarui.');
    }

    public function destroy(IrsPemda $irs_pemda, KrsIrsSyncService $sync)
    {
        $this->authorize('delete', $irs_pemda);

        $irs_pemda->delete();
        $sync->sync();

        return redirect()->route('irs_pemda.index')->with('success', 'Data berhasil dihapus.');
    }
}
