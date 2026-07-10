<?php

namespace App\Http\Controllers;

use App\Models\IrsPd;
use App\Models\KrsPd;
use App\Models\Opd;
use App\Services\KrsIrsPdSyncService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class IrsPdController extends Controller
{
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
        'CELAH PENGENDALIAN',
        'RENCANA TINDAK PENGENDALIAN',
        'PEMILIK / PENANGGUNGJAWAB',
        'TRIWULAN',
        'TAHUN TARGET PENYELESAIAN',
    ];

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
     * Lookup Matriks Analisis Risiko (5x5) — identik dengan
     * IrsPemdaController::SKALA_RISIKO_MATRIX (satu standar matriks untuk
     * seluruh pemda, dipakai baik level Pemda maupun level PD).
     */
    private const SKALA_RISIKO_MATRIX = [
        1 => [1 => 1, 2 => 2, 3 => 4, 4 => 6, 5 => 9],
        2 => [1 => 3, 2 => 7, 3 => 10, 4 => 12, 5 => 15],
        3 => [1 => 5, 2 => 11, 3 => 14, 4 => 16, 5 => 18],
        4 => [1 => 8, 2 => 13, 3 => 17, 4 => 19, 5 => 23],
        5 => [1 => 20, 2 => 21, 3 => 22, 4 => 24, 5 => 25],
    ];

    private const SKALA_PRIORITAS_MAP = [
        25 => 1, 24 => 2, 23 => 3, 22 => 4, 21 => 5, 20 => 6,
        19 => 7, 18 => 8, 17 => 9, 16 => 10,
        15 => 11, 14 => 12, 13 => 13, 12 => 14,
        11 => 15, 10 => 16, 9 => 17, 8 => 18, 7 => 19, 6 => 20,
        5 => 21, 4 => 22, 3 => 23, 2 => 24, 1 => 25,
    ];

    public const JENIS_RISIKO_OPTIONS = [
        '1 - Pendidikan', '2 - Kesehatan', '3 - PU dan Tata Ruang',
        '4 - Perumahan dan Kawasan Permukiman',
        '5 - Ketentraman, Ketertiban Umum, dan Perlindungan Masyarakat',
        '6 - Sosial', '7 - Tenaga Kerja',
        '8 - Pemberdayaan Perempuan dan Pelindungan Anak', '9 - Pangan',
        '10 - Pertanahan', '11 - Lingkungan Hidup',
        '12 - Administrasi kependudukan dan pencatatan sipil',
        '13 - Pemberdayaan masyarakat dan desa',
        '14 - Pengendalian penduduk dan keluarga berencana',
        '15 - Perhubungan', '16 - Komunikasi dan informatika',
        '17 - Koperasi, Usaha Kecil dan Menengah', '18 - Penanaman Modal',
        '19 - Kepemudaan dan olah raga', '20 - Statistik', '21 - Persandian',
        '22 - Kebudayaan', '23 - Perpustakaan', '24 - Kearsipan',
        '25 - Kelautan dan perikanan', '26 - Pariwisata', '27 - Pertanian',
        '28 - Kehutanan/Perkebunan', '29 - Energi dan sumber daya mineral',
        '30 - Perdagangan', '31 - Perindustrian', '32 - Transmigrasi',
        '33 - Penyusunan Kebijakan dan Koordinasi Administratif',
        '34 - Administrasi Kesekretariatan DPRD',
        '35 - Pembinaan dan Pengawasan',
        '36 - Perencanaan pembangunan, litbang',
        '37 - Keuangan dan Pendapatan',
        '38 - Kepegawaian dan Pengembangan SDM', '39 - Bencana', '40 - Politik',
        '41 - Lainnya',
    ];

    private function withCalculatedScales(array $data): array
    {
        $dampak = (int) ($data['SKALA DAMPAK'] ?? 0);
        $kemungkinan = (int) ($data['SKALA KEMUNGKINAN'] ?? 0);

        if ($dampak >= 1 && $dampak <= 5 && $kemungkinan >= 1 && $kemungkinan <= 5) {
            $skalaRisiko = self::SKALA_RISIKO_MATRIX[$dampak][$kemungkinan];
            $data['SKALA RISIKO'] = $skalaRisiko;
            $data['SKALA PRIORITAS'] = self::SKALA_PRIORITAS_MAP[$skalaRisiko];
        } else {
            $data['SKALA RISIKO'] = null;
            $data['SKALA PRIORITAS'] = null;
        }

        return $data;
    }

    /**
     * Menghitung ulang "Nomor Urut Risiko" per kelompok Sasaran Renstra,
     * sama seperti IrsPemdaController::withNomorUrut() tapi dikelompokkan
     * per Sasaran Renstra (bukan Sasaran RPJMD).
     */
    private function withNomorUrut($rows)
    {
        $prevSasaran = null;
        $counter = 0;

        foreach ($rows as $row) {
            $sasaran = trim((string) $row->{'SASARAN RENSTRA'});

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
            ->filter(fn ($v) => $v !== '' && $v !== 'Tidak Ada Data')
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
            'jenisRisikoOptions' => self::JENIS_RISIKO_OPTIONS,
            'triwulanOptions' => self::TRIWULAN_OPTIONS,
            'triwulanLabels' => self::TRIWULAN_LABELS,
            'sasaranRenstraKodes' => $this->sasaranRenstraKodes(),
            'currentUserId' => auth()->id(),
            'isAdmin' => $isAdmin,
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

        return $request->validate($rules, [], $attributes);
    }

    /**
     * Sama seperti IrsPemdaController::fillEmptyTextFields() — field teks
     * yang dikosongkan disimpan sebagai "Tidak Ada Data", bukan null/string
     * kosong, supaya kosongnya jelas "memang tidak ada" bukan kesalahan
     * sistem. "URAIAN RISIKO" tidak disentuh karena sudah required.
     * "TRIWULAN"/"TAHUN TARGET PENYELESAIAN" juga tidak disentuh — dropdown
     * & kolom integer, biarkan null kalau kosong.
     */
    private function fillEmptyTextFields(array $data): array
    {
        foreach (self::FIELDS as $field) {
            if (in_array($field, ['URAIAN RISIKO', 'TRIWULAN', 'TAHUN TARGET PENYELESAIAN'], true)) {
                continue;
            }
            if (trim((string) ($data[$field] ?? '')) === '') {
                $data[$field] = 'Tidak Ada Data';
            }
        }

        return $data;
    }

    public function store(Request $request, KrsIrsPdSyncService $sync)
    {
        $data = $this->fillEmptyTextFields($this->withCalculatedScales($this->validated($request)));
        $data['TINGKAT RISIKO'] = self::TINGKAT_RISIKO_VALUE;
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
