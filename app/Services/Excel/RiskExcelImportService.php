<?php

namespace App\Services\Excel;

use App\Services\RiskReferenceDataService;
use App\Support\RiskExcelRegistry;
use App\Support\TextNormalizer;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

/**
 * Mengorkestrasi impor file Excel (hasil unduh Ekspor/Template yang sudah
 * diisi) kembali ke database: validasi struktur (nama sheet + header harus
 * cocok persis dgn RiskExcelRegistry), validasi per-baris (rule sama dgn
 * store()/update() controller aslinya), validasi cross-reference antar
 * modul, lalu upsert per-sheet dalam transaction (ID kosong -> insert baru
 * milik admin pengimpor, ID terisi -> update baris yg ada, pertahankan
 * user_id pemiliknya). Baris yg ada di DB tapi tidak muncul di file TIDAK
 * dihapus (upsert-only, bukan replace-all) — sesuai keputusan yg
 * dikonfirmasi user.
 */
class RiskExcelImportService
{
    private const MAX_REPORTED_ERRORS = 200;

    /** @var array<string, array<string,true>> cache set kunci modul induk per validate() — lihat parentKeySet(). */
    private array $parentKeyCache = [];

    public function __construct(private readonly RiskReferenceDataService $riskRef)
    {
    }

    public function import(UploadedFile $file, int $importingUserId): array
    {
        try {
            $spreadsheet = IOFactory::load($file->getRealPath());
        } catch (\Throwable $e) {
            return [
                'ok' => false,
                'structure_errors' => ['File tidak dapat dibaca — pastikan file .xlsx tidak rusak dan belum pernah diubah ekstensinya.'],
                'sheets' => [],
            ];
        }

        $v = $this->validate($spreadsheet);
        if (!empty($v['structureErrors'])) {
            return [
                'ok' => false,
                'structure_errors' => $v['structureErrors'],
                'sheets' => [],
            ];
        }

        return $this->write($v['parsedByModule'], $v['reportByModule'], $importingUserId);
    }

    /**
     * Fase validasi murni (struktur + per-baris + cross-reference), TANPA
     * menulis apa pun ke DB — dipakai baik oleh import() (impor langsung,
     * super-admin) maupun oleh alur persetujuan (admin: preview saat
     * upload, super-admin: validasi ulang saat approve).
     *
     * @param  array|null  $moduleSlugs  Subset modul yang divalidasi (struktur+baris) — null = semua modul registry (perilaku admin 6-modul, tidak berubah). Dipakai fitur PIC OPD utk membatasi ke krs_pemda+krs_pd+kro_pd saja.
     * @param  int|null  $scopeUserId  Kalau diisi, _ROW_ID pada modul scope='owned' HANYA dianggap valid kalau baris itu MILIK user ini (bukan sekadar ada di tabel) — menutup celah PIC OPD menimpa baris OPD lain via _ROW_ID tebakan/lama. Modul scope='global' (krs_pemda) tetap tidak difilter, krn selalu jadi referensi lintas-OPD.
     * @return array{structureErrors: string[], parsedByModule: array, reportByModule: array}
     */
    public function validate(Spreadsheet $spreadsheet, ?array $moduleSlugs = null, ?int $scopeUserId = null): array
    {
        $structureErrors = $this->validateStructure($spreadsheet, $moduleSlugs);
        if (!empty($structureErrors)) {
            return [
                'structureErrors' => $structureErrors,
                'parsedByModule' => [],
                'reportByModule' => [],
            ];
        }

        // Kumpulkan dulu semua baris tervalidasi per modul (belum ditulis),
        // supaya cross-ref antar-modul dalam satu batch bisa dicek (mis.
        // Sasaran baru di krs_pemda dipakai baris baru di irs_pemda pada
        // file yang sama) — diproses berurutan sesuai dependency chain.
        $modules = RiskExcelRegistry::modules();
        $importOrder = $moduleSlugs !== null
            ? array_values(array_intersect(RiskExcelRegistry::importOrder(), $moduleSlugs))
            : RiskExcelRegistry::importOrder();
        $parsedByModule = [];
        $reportByModule = [];

        // Cache nilai kolom modul induk (utk cross-ref) & ID valid modul
        // ini sendiri (utk cek _ROW_ID) — DIBANGUN SEKALI PER MODUL, bukan
        // per baris. Sebelumnya crossRefExists() & pengecekan _ROW_ID
        // masing-masing menjalankan query DB di dalam loop per-baris
        // (N+1: query x jumlah baris), sangat lambat utk file ratusan/
        // ribuan baris — sekarang cukup 1 query per modul, dicocokkan di
        // memori. Reset setiap kali validate() dipanggil (bukan property
        // yg dipertahankan lintas panggilan) supaya data induk yg berubah
        // di antara dua panggilan validate() terpisah (mis. upload lalu
        // approve) selalu dibaca ulang dari DB, tidak memakai cache basi.
        $this->parentKeyCache = [];

        foreach ($importOrder as $slug) {
            $module = $modules[$slug];
            $sheet = $spreadsheet->getSheetByName($module['sheet_name']);

            $existingIdsQuery = $module['model']::query();
            if ($scopeUserId !== null && $module['scope'] === 'owned') {
                $existingIdsQuery->where('user_id', $scopeUserId);
            }
            $existingIds = $existingIdsQuery->pluck('id')->flip();

            [$validRows, $errors] = $this->validateRows(
                $sheet,
                $module,
                $parsedByModule,
                $existingIds,
                fn (string $parentSlug) => $this->parentKeySet($parentSlug),
            );

            $parsedByModule[$slug] = $validRows;
            $reportByModule[$slug] = ['errors' => $errors];
        }

        return [
            'structureErrors' => [],
            'parsedByModule' => $parsedByModule,
            'reportByModule' => $reportByModule,
        ];
    }

    /**
     * Fase tulis DB — mengasumsikan validate() SUDAH dijalankan dan lolos
     * (structureErrors kosong). Upsert per-sheet, lalu jalankan sync
     * service yang terkait modul yang mengalami tulis.
     *
     * SELURUH modul dalam batch ini dibungkus SATU transaction luar
     * (writeModule() di dalamnya tetap punya transaction sendiri, aman
     * ditumpuk lewat savepoint bawaan Laravel) — sebelumnya tiap modul
     * adalah transaction terpisah tanpa pembungkus, jadi kalau salah satu
     * modul gagal di tengah batch (mis. error DB tak terduga), modul-modul
     * sebelumnya SUDAH ter-commit permanen sementara sisanya tidak pernah
     * ditulis: hasil impor jadi setengah-jalan yang tidak konsisten & sulit
     * dipulihkan (retry berikutnya bisa menduplikasi baris baru yg
     * _ROW_ID-nya kosong di modul yg sudah sukses). Dengan transaction
     * luar, kegagalan di modul mana pun membatalkan SEMUA modul dalam
     * batch yang sama — baik semuanya berhasil, atau semuanya tidak
     * tersimpan sama sekali.
     *
     * @param  array|null  $writableModuleSlugs  Subset modul yang BENAR-BENAR ditulis — null = semua modul yang ada di $parsedByModule (perilaku admin 6-modul, tidak berubah). Dipakai fitur PIC OPD sbg pagar tambahan (defense-in-depth): krs_pemda boleh ada di $parsedByModule sbg referensi tervalidasi, tapi TIDAK PERNAH benar-benar ditulis krn tidak termasuk RiskExcelRegistry::picOpdWritableModules().
     */
    public function write(array $parsedByModule, array $reportByModule, int $importingUserId, ?array $writableModuleSlugs = null): array
    {
        $modules = RiskExcelRegistry::modules();
        $writeOrder = $writableModuleSlugs !== null
            ? array_values(array_intersect(RiskExcelRegistry::importOrder(), $writableModuleSlugs))
            : array_values(array_intersect(RiskExcelRegistry::importOrder(), array_keys($parsedByModule)));

        $syncClasses = DB::transaction(function () use ($modules, $writeOrder, $parsedByModule, $importingUserId, &$reportByModule) {
            $syncClasses = [];
            foreach ($writeOrder as $slug) {
                $module = $modules[$slug];
                $result = $this->writeModule($module, $parsedByModule[$slug] ?? [], $importingUserId);
                $reportByModule[$slug]['inserted'] = $result['inserted'];
                $reportByModule[$slug]['updated'] = $result['updated'];

                if ($result['inserted'] > 0 || $result['updated'] > 0) {
                    $syncClasses[$module['sync']] = true;
                }
            }

            return $syncClasses;
        });

        // Sync service (rebuild tabel turunan) dijalankan SETELAH transaction
        // luar selesai commit — supaya kalau sync gagal, itu tidak ikut
        // me-rollback data risiko yang sudah valid tertulis (tabel turunan
        // bisa disinkronkan ulang kapan saja, sedangkan data risiko induk
        // adalah sumber kebenaran yang tidak boleh hilang gara-gara sync
        // gagal).
        foreach (array_keys($syncClasses) as $syncClass) {
            app($syncClass)->sync();
        }

        return [
            'ok' => true,
            'structure_errors' => [],
            'sheets' => $this->buildSheetsReport($reportByModule, $writeOrder),
        ];
    }

    /**
     * Bentuk ImportResult yang sama seperti write(), tapi inserted/updated
     * dihitung dari jumlah baris valid (dibedakan lewat _ROW_ID kosong vs
     * terisi) TANPA menulis ke DB — dipakai sebagai preview saat admin/PIC
     * OPD upload file (menunggu persetujuan).
     *
     * @param  array|null  $moduleSlugs  Subset modul yang direkap — null = semua modul di $reportByModule (perilaku admin, tidak berubah). WAJIB diisi sama dgn yang dipakai validate() kalau itu dipanggil dgn $moduleSlugs terbatas, supaya tidak mencoba mengakses entry modul yang memang tidak ada di $reportByModule.
     */
    public function buildPreview(array $parsedByModule, array $reportByModule, ?array $moduleSlugs = null): array
    {
        $order = $moduleSlugs !== null
            ? array_values(array_intersect(RiskExcelRegistry::importOrder(), $moduleSlugs))
            : RiskExcelRegistry::importOrder();

        foreach ($order as $slug) {
            $rows = $parsedByModule[$slug] ?? [];
            $inserted = 0;
            $updated = 0;
            foreach ($rows as $row) {
                if (($row['_ROW_ID'] ?? '') !== '') {
                    $updated++;
                } else {
                    $inserted++;
                }
            }
            $reportByModule[$slug]['inserted'] = $inserted;
            $reportByModule[$slug]['updated'] = $updated;
        }

        return [
            'ok' => true,
            'structure_errors' => [],
            'sheets' => $this->buildSheetsReport($reportByModule, $moduleSlugs),
        ];
    }

    private function buildSheetsReport(array $reportByModule, ?array $moduleSlugs = null): array
    {
        $modules = RiskExcelRegistry::modules();
        $order = $moduleSlugs !== null
            ? array_values(array_intersect(RiskExcelRegistry::importOrder(), $moduleSlugs))
            : RiskExcelRegistry::importOrder();

        $sheetsReport = [];
        foreach ($order as $slug) {
            if (!isset($reportByModule[$slug])) {
                continue;
            }
            $module = $modules[$slug];
            $r = $reportByModule[$slug];
            $errors = $r['errors'];
            $totalErrors = count($errors);
            $sheetsReport[] = [
                'slug' => $slug,
                'label' => $module['label'],
                'sheet_name' => $module['sheet_name'],
                'inserted' => $r['inserted'] ?? 0,
                'updated' => $r['updated'] ?? 0,
                'error_count' => $totalErrors,
                'errors' => array_slice($errors, 0, self::MAX_REPORTED_ERRORS),
                'errors_truncated' => $totalErrors > self::MAX_REPORTED_ERRORS,
            ];
        }

        return $sheetsReport;
    }

    /**
     * Pastikan setiap sheet registry ada dgn nama persis, dan header row
     * tiap sheet cocok PERSIS (urutan & teks) dgn yang diharapkan registry
     * — pelanggaran apa pun di sini menolak SELURUH file sebelum satu baris
     * pun divalidasi/ditulis, sesuai batasan "format tidak boleh diubah".
     */
    private function validateStructure(Spreadsheet $spreadsheet, ?array $moduleSlugs = null): array
    {
        $errors = [];

        $modules = RiskExcelRegistry::modules();
        if ($moduleSlugs !== null) {
            $modules = array_intersect_key($modules, array_flip($moduleSlugs));
        }

        foreach ($modules as $module) {
            $sheet = $spreadsheet->getSheetByName($module['sheet_name']);
            if (!$sheet) {
                $errors[] = "Sheet \"{$module['sheet_name']}\" tidak ditemukan di file yang diupload.";
                continue;
            }

            $expectedHeader = RiskExcelRegistry::headerFor($module);
            $actualHeader = [];
            foreach ($expectedHeader as $col => $label) {
                $actualHeader[] = trim((string) $sheet->getCell([$col + 1, 1])->getValue());
            }

            foreach ($expectedHeader as $col => $expectedLabel) {
                $actualLabel = $actualHeader[$col] ?? '';
                if ($actualLabel !== $expectedLabel) {
                    $colLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($col + 1);
                    $errors[] = "Sheet \"{$module['sheet_name']}\" kolom {$colLetter}: header diharapkan \"{$expectedLabel}\", ditemukan \"{$actualLabel}\".";
                }
            }
        }

        return $errors;
    }

    /**
     * @param  \Illuminate\Support\Collection  $existingIds  ID valid modul ini sendiri (utk cek _ROW_ID), key=id.
     * @param  \Closure  $parentKeySetResolver  fn(string $parentSlug): array<string,true> — kunci matchKey() ternormalisasi dari modul induk.
     * @return array{0: array, 1: array} [baris valid (siap ditulis), daftar error per-baris]
     */
    private function validateRows(Worksheet $sheet, array $module, array $parsedByModule, $existingIds, \Closure $parentKeySetResolver): array
    {
        $header = RiskExcelRegistry::headerFor($module);
        $highestRow = $sheet->getHighestRow();

        $validRows = [];
        $errors = [];

        for ($excelRow = 2; $excelRow <= $highestRow; $excelRow++) {
            $data = [];
            foreach ($header as $col => $label) {
                $data[$label] = trim((string) $sheet->getCell([$col + 1, $excelRow])->getValue());
            }

            // Baris kosong total (tidak ada isian sama sekali) dilewati diam-diam,
            // bukan dianggap error — wajar ada baris kosong sisa template.
            $nonRowIdValues = array_filter(
                array_diff_key($data, ['_ROW_ID' => true]),
                fn ($v) => $v !== '',
            );
            if (empty($nonRowIdValues)) {
                continue;
            }

            $rowErrors = $this->validateSingleRow($data, $module, $parsedByModule, $existingIds, $parentKeySetResolver);

            if (!empty($rowErrors)) {
                foreach ($rowErrors as $msg) {
                    $errors[] = [
                        'row' => $excelRow,
                        'message' => $msg,
                    ];
                }
                continue;
            }

            $validRows[] = $data;
        }

        return [$validRows, $errors];
    }

    private function validateSingleRow(array $data, array $module, array $parsedByModule, $existingIds, \Closure $parentKeySetResolver): array
    {
        $errors = [];

        $rules = [];
        foreach ($module['fields'] as $field) {
            $rules[$field] = in_array($field, $module['required_fields'], true) ? ['required', 'string'] : ['nullable', 'string'];
        }
        foreach ($module['input_only_fields'] as $field) {
            $rules[$field] = ['required', 'integer', 'min:1', 'max:5'];
        }
        foreach ($module['enum_fields'] as $field => $options) {
            $rules[$field] = ['nullable', 'in:' . implode(',', $options)];
        }

        $payload = [];
        foreach ($module['fields'] as $field) {
            $payload[$field] = $data[$field] ?? '';
        }
        foreach ($module['input_only_fields'] as $field) {
            $payload[$field] = $data[$field] !== '' ? (int) $data[$field] : null;
        }
        foreach ($module['enum_fields'] as $field => $options) {
            $payload[$field] = $data[$field] !== '' ? $data[$field] : null;
        }

        $attributes = [];
        foreach (array_keys($rules) as $field) {
            $attributes[$field] = $field;
        }

        $validator = Validator::make($payload, $rules, [], $attributes);
        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $msg) {
                $errors[] = $msg;
            }
        }

        // _ROW_ID: kalau terisi, harus merujuk baris model yang sama & masih
        // ada (belum soft-deleted) — dicek dari cache ID (1 query per
        // modul, dibangun di validate()), bukan query per baris.
        $rowId = $data['_ROW_ID'] ?? '';
        if ($rowId !== '') {
            if (!ctype_digit($rowId) || !isset($existingIds[(int) $rowId])) {
                $errors[] = "_ROW_ID \"{$rowId}\" tidak merujuk baris data yang masih ada (mungkin sudah dihapus setelah file diekspor).";
            }
        }

        // Validasi cross-reference lunak ke modul induk.
        if ($module['cross_ref'] && empty($errors)) {
            $crossRef = $module['cross_ref'];
            $value = trim((string) ($data[$crossRef['field']] ?? ''));
            $isOptional = $crossRef['optional'] ?? false;

            if ($value !== '') {
                $key = TextNormalizer::matchKey($value);
                $parentKeys = $parentKeySetResolver($crossRef['parent_module']);
                $found = isset($parentKeys[$key]) || $this->matchesParsedParent($crossRef['parent_module'], $crossRef['parent_field'], $key, $parsedByModule);

                if (!$found) {
                    $errors[] = "\"{$crossRef['field']}\" (\"{$value}\") tidak ditemukan di modul induk (\"{$crossRef['parent_module']}\").";
                }
            } elseif (!$isOptional) {
                $errors[] = "\"{$crossRef['field']}\" wajib diisi (merujuk data di modul induk).";
            }
        }

        return $errors;
    }

    /**
     * Set kunci matchKey() ternormalisasi dari SELURUH baris modul induk
     * yang SUDAH ADA di DB — dibangun sekali per modul induk (di-cache oleh
     * pemanggil di validate()) lewat SATU query pluck(), bukan query
     * per-baris seperti sebelumnya (N+1: query x jumlah baris yang
     * divalidasi). Dipanggil lewat closure supaya cache-nya lazy (hanya
     * dibangun kalau benar-benar ada modul yg merujuknya).
     */
    private function parentKeySet(string $parentModuleSlug): array
    {
        if (isset($this->parentKeyCache[$parentModuleSlug])) {
            return $this->parentKeyCache[$parentModuleSlug];
        }

        $parentModule = RiskExcelRegistry::find($parentModuleSlug);
        $crossRef = null;
        // parent_field disimpan di konfigurasi cross_ref si ANAK, bukan di
        // modul induk itu sendiri — cari field yg dipakai module manapun
        // yg merujuk modul induk ini dari registry (semua entry cross_ref
        // ke modul yg sama selalu memakai parent_field yg sama di app ini).
        foreach (RiskExcelRegistry::modules() as $m) {
            if ($m['cross_ref'] && $m['cross_ref']['parent_module'] === $parentModuleSlug) {
                $crossRef = $m['cross_ref'];
                break;
            }
        }
        $parentField = $crossRef['parent_field'] ?? null;

        $keys = [];
        if ($parentField) {
            foreach ($parentModule['model']::query()->pluck($parentField) as $v) {
                $keys[TextNormalizer::matchKey((string) $v)] = true;
            }
        }

        $this->parentKeyCache[$parentModuleSlug] = $keys;

        return $keys;
    }

    /**
     * Cocokkan ke baris modul induk yang sudah divalidasi lolos di batch
     * impor yang sama (mis. Sasaran RPJMD baru yang baru diimpor di
     * krs_pemda pada file yang sama harus bisa dirujuk baris irs_pemda di
     * bawahnya) — parsedByModule selalu kecil (baris dalam satu file yang
     * sama), jadi loop di memori ini tidak perlu di-cache/query DB.
     */
    private function matchesParsedParent(string $parentModuleSlug, string $parentField, string $key, array $parsedByModule): bool
    {
        foreach ($parsedByModule[$parentModuleSlug] ?? [] as $row) {
            $v = $row[$parentField] ?? '';
            if (TextNormalizer::matchKey((string) $v) === $key) {
                return true;
            }
        }

        return false;
    }

    /**
     * @return array{inserted: int, updated: int}
     */
    private function writeModule(array $module, array $rows, int $importingUserId): array
    {
        if (empty($rows)) {
            return ['inserted' => 0, 'updated' => 0];
        }

        $inserted = 0;
        $updated = 0;

        DB::transaction(function () use ($module, $rows, $importingUserId, &$inserted, &$updated) {
            foreach ($rows as $data) {
                $attributes = $this->buildAttributes($module, $data);

                $rowId = $data['_ROW_ID'] ?? '';
                if ($rowId !== '') {
                    $existing = $module['model']::query()->find((int) $rowId);
                    if ($existing) {
                        // Pertahankan user_id pemilik asli — tidak disentuh di sini.
                        $existing->fill($attributes);
                        $existing->save();
                        $updated++;
                        continue;
                    }
                }

                if ($module['scope'] === 'owned') {
                    $attributes['user_id'] = $importingUserId;
                }
                $module['model']::create($attributes);
                $inserted++;
            }
        });

        return ['inserted' => $inserted, 'updated' => $updated];
    }

    /**
     * Field teks kosong diisi sentinel "Tidak Ada Data" (meniru
     * fillEmptyTextFields()/fillBlanks() di controller aslinya), KECUALI
     * field yang memang bukan sentinel-eligible: TRIWULAN & TAHUN TARGET
     * PENYELESAIAN (dropdown/integer, kosong = null), dan field apa pun
     * yang ada di enum_fields modul ini.
     */
    private function buildAttributes(array $module, array $data): array
    {
        $sentinelExempt = array_merge(
            ['TRIWULAN', 'TAHUN TARGET PENYELESAIAN'],
            array_keys($module['enum_fields']),
        );

        $attributes = [];

        foreach ($module['fields'] as $field) {
            $value = trim((string) ($data[$field] ?? ''));

            if ($field === 'TAHUN TARGET PENYELESAIAN') {
                $attributes[$field] = $value === '' ? null : (int) $value;
                continue;
            }

            if ($value === '' && in_array($field, $sentinelExempt, true)) {
                $attributes[$field] = null;
                continue;
            }

            $attributes[$field] = $value === '' ? 'Tidak Ada Data' : $value;
        }

        foreach ($module['input_only_fields'] as $field) {
            $value = trim((string) ($data[$field] ?? ''));
            $attributes[$field] = $value === '' ? null : (int) $value;
        }

        foreach ($module['constant_fields'] as $field => $value) {
            $attributes[$field] = $value;
        }

        if (!empty($module['computed_fields'])) {
            $dampak = $attributes['SKALA DAMPAK'] ?? null;
            $kemungkinan = $attributes['SKALA KEMUNGKINAN'] ?? null;
            $hasil = $this->riskRef->hitungSkala($dampak, $kemungkinan);
            $attributes['SKALA RISIKO'] = $hasil['skala_risiko'];
            $attributes['SKALA PRIORITAS'] = $hasil['skala_prioritas'];
        }

        return $attributes;
    }
}
