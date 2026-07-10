<?php

namespace App\Http\Controllers;

use App\Models\IrsPemda;
use App\Models\Opd;
use App\Models\KrsPemda;
use App\Services\KrsIrsSyncService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class IrsPemdaController extends Controller
{
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
        'CELAH PENGENDALIAN',
        'RENCANA TINDAK PENGENDALIAN',
        'PEMILIK / PENANGGUNGJAWAB',
        'TRIWULAN',
        'TAHUN TARGET PENYELESAIAN',
    ];

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
     * Lookup Matriks Analisis Risiko (5x5) — [dampak][kemungkinan] => skala
     * risiko (1-25), mengikuti tabel "Matriks Analisis Risiko (5x5)" pada
     * Ket_2 versi Excel (baris = Level Kemungkinan, kolom = Dampak). Skala
     * Risiko BUKAN hasil perkalian murni Dampak x Kemungkinan, melainkan
     * ranking tetap sesuai tabel.
     */
    private const SKALA_RISIKO_MATRIX = [
        1 => [1 => 1, 2 => 2, 3 => 4, 4 => 6, 5 => 9],
        2 => [1 => 3, 2 => 7, 3 => 10, 4 => 12, 5 => 15],
        3 => [1 => 5, 2 => 11, 3 => 14, 4 => 16, 5 => 18],
        4 => [1 => 8, 2 => 13, 3 => 17, 4 => 19, 5 => 23],
        5 => [1 => 20, 2 => 21, 3 => 22, 4 => 24, 5 => 25],
    ];

    /**
     * Skala Risiko (1-25) => Skala Prioritas (1-25, 1 = paling prioritas /
     * paling berisiko). Sesuai kolom "Prioritas Risiko" pada tabel Level
     * Risiko: semakin tinggi skala risiko, semakin kecil angka prioritas.
     */
    private const SKALA_PRIORITAS_MAP = [
        25 => 1, 24 => 2, 23 => 3, 22 => 4, 21 => 5, 20 => 6,
        19 => 7, 18 => 8, 17 => 9, 16 => 10,
        15 => 11, 14 => 12, 13 => 13, 12 => 14,
        11 => 15, 10 => 16, 9 => 17, 8 => 18, 7 => 19, 6 => 20,
        5 => 21, 4 => 22, 3 => 23, 2 => 24, 1 => 25,
    ];

    /**
     * 41 kode Jenis Risiko, sesuai popup "Jenis Risiko" pada VBA — dipakai
     * sebagai daftar pilihan combobox di form, bukan tabel referensi
     * terpisah di database (datanya tetap/tidak berubah oleh pengguna).
     */
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

    /**
     * Menghitung Skala Risiko dan Skala Prioritas secara otomatis dari Skala
     * Dampak x Skala Kemungkinan, meniru rumus INDEX/MATCH pada Excel yang
     * mencari ke tabel Ket_2 — di sini cukup lookup array tetap.
     */
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
        $fieldOptions['SASARAN RPJMD'] = $sasaranOptions->all();

        return Inertia::render('irs/Index', [
            'rows' => $rows,
            'fieldOptions' => $fieldOptions,
            'opdOptions' => Opd::orderBy('nama')->pluck('nama'),
            'jenisRisikoOptions' => self::JENIS_RISIKO_OPTIONS,
            'triwulanOptions' => self::TRIWULAN_OPTIONS,
            'triwulanLabels' => self::TRIWULAN_LABELS,
            'sasaranRpjmdKodes' => $this->sasaranRpjmdKodes(),
            'currentUserId' => auth()->id(),
            'isAdmin' => $isAdmin,
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

        return $request->validate($rules, [], $attributes);
    }

    /**
     * Field teks yang dikosongkan (bukan tidak diisi sama sekali oleh user,
     * tapi memang belum ada nilainya) disimpan sebagai "Tidak Ada Data",
     * bukan null/string kosong — supaya kosongnya jelas terlihat sebagai
     * "memang tidak ada", bukan seolah-olah data belum sempat diinput
     * karena kesalahan sistem. "URAIAN RISIKO" tidak disentuh karena sudah
     * required (tidak pernah kosong lolos validasi). "TRIWULAN"/"TAHUN
     * TARGET PENYELESAIAN" juga tidak disentuh — dropdown & kolom integer,
     * "Tidak Ada Data" bukan nilai valid untuk keduanya, biarkan null.
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

    public function store(Request $request, KrsIrsSyncService $sync)
    {
        $data = $this->fillEmptyTextFields($this->withCalculatedScales($this->validated($request)));
        $data['TINGKAT RISIKO'] = self::TINGKAT_RISIKO_VALUE;
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
