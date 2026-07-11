<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\HasOpdFillStatus;
use App\Models\KroPd;
use App\Models\KrsPd;
use App\Models\Opd;
use App\Services\KroIroPdSyncService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Inertia\Inertia;

class KroPdController extends Controller
{
    use HasOpdFillStatus;

    private const FIELDS = [
        'SASARAN RENSTRA',
        'PROGRAM PD',
        'IK PROGRAM PD',
        'BASELINE IK PROGRAM PD',
        'TARGET IK PROGRAM PD',
        'SATUAN IK PROGRAM PD',
        'KEGIATAN PD',
        'IK KEGIATAN PD',
        'BASELINE IK KEGIATAN PD',
        'TARGET IK KEGIATAN PD',
        'SATUAN IK KEGIATAN PD',
        'SUBKEGIATAN PD',
        'IK SUBKEGIATAN PD',
        'BASELINE IK SUBKEGIATAN PD',
        'TARGET IK SUBKEGIATAN PD',
        'SATUAN IK SUBKEGIATAN PD',
        'OPD PENANGGUNG JAWAB KEGIATAN',
    ];

    /**
     * Sama seperti KrsPdController::removeLabel() — membuang label VBA
     * (mis. "Program 1.1 : ", "Kegiatan 1.1.1 : ") dari data lama.
     */
    private function removeLabel(string $value): string
    {
        $value = trim($value);
        if ($value === '') {
            return '';
        }

        if (preg_match('/^(?:[A-Za-z]+\s+){1,3}\d+(?:\.\d+)*\s*:\s*(.*)$/s', $value, $matches)) {
            return trim($matches[1]);
        }

        return $value;
    }

    /**
     * Kunci pencocokan teks Sasaran/Program antara KRO_PD dan sumber 2a
     * (tbl_krs_irs_pd / tbl_krs_pd): buang label kode + normalisasi
     * case-insensitive & spasi ganda. Supaya beda kecil penulisan tidak
     * membuat kode Sasaran Renstra atau auto-fill IK Program gagal ketemu.
     * Selaras dgn matchKey() di KrsPdController & service sync.
     */
    private function matchKey(string $value): string
    {
        $clean = $this->removeLabel($value);
        $clean = preg_replace('/\s+/u', ' ', $clean);

        return mb_strtolower(trim($clean));
    }

    /**
     * Membangun hierarki SasaranRenstra(rujukan) -> ProgramPD -> KegiatanPD
     * -> SubKegiatanPD dari tabel flat — satu level lebih sedikit dari
     * KrsPdController::buildHierarchy() karena tidak me-re-derive Tujuan
     * Strategis PD / Sasaran Strategis PD (sudah cukup dirujuk lewat
     * Sasaran Renstra, yang sendirinya adalah rujukan ke tbl_krs_pd).
     *
     * Root pohon adalah SASARAN RENSTRA — rujukan ke tbl_krs_pd (dipilih
     * lewat dropdown pada form, bukan diketik bebas), sesuai struktur
     * sheet III_a_KRO_PD: dasarnya dokumen Renja/RKA Perangkat Daerah,
     * tapi tetap berakar ke Sasaran Renstra yang sudah ada.
     *
     * PENTING: root & turunan (Program/Kegiatan/SubKegiatan) memakai basis
     * kode ASLI Sasaran Renstra (mis. "1.1.1.1", diambil dari
     * tbl_krs_pd.SASARAN STRATEGIS PD yang sudah berkode lengkap sampai
     * level Sasaran Strategis PD), bukan nomor lokal 1,2,3 — supaya
     * numbering nyambung dari Misi sampai SubKegiatan (sama pola dengan
     * KrsPdController::buildHierarchy()).
     */
    /**
     * Program PRIORITAS bila menurun dari Sasaran Renstra (kolom "SASARAN
     * RENSTRA" terisi nyata). Program NON-PRIORITAS (mis. program pendukung
     * atau program level Kecamatan dari Tabel 4.1) kolom itu kosong/"Tidak Ada
     * Data" — tidak dipaksa masuk pohon Sasaran, melainkan jadi node top-level
     * tersendiri yang sejajar (is_prioritas=false).
     */
    private function isPrioritas($row): bool
    {
        $val = $this->removeLabel((string) $row->{'SASARAN RENSTRA'});
        return $val !== '' && $val !== '-' && $val !== 'Tidak Ada Data';
    }

    private function buildHierarchy($rows, array $sasaranRenstraKodes = []): array
    {
        $sasaranRenstras = [];
        $sasaranRenstraIndex = [];
        $programIndex = [];
        $kegiatanIndex = [];

        $prioritasRows = [];
        $nonPrioritasRows = [];
        foreach ($rows as $row) {
            if ($this->isPrioritas($row)) {
                $prioritasRows[] = $row;
            } else {
                $nonPrioritasRows[] = $row;
            }
        }

        foreach ($prioritasRows as $row) {
            $sasaranRenstraVal = $this->removeLabel((string) $row->{'SASARAN RENSTRA'});
            $programVal = $this->removeLabel((string) $row->{'PROGRAM PD'});
            $kegiatanVal = $this->removeLabel((string) $row->{'KEGIATAN PD'});
            $subkegiatanVal = $this->removeLabel((string) $row->{'SUBKEGIATAN PD'});

            // Pakai kunci ternormalisasi (matchKey) untuk dedup Sasaran Renstra —
            // konsisten dengan penentuan kode di bawah. Kalau di-dedup per teks
            // mentah, dua baris Sasaran yang cuma beda kapitalisasi ("...dan..."
            // vs "...Dan...") mendapat kode SAMA tapi dianggap dua node, lalu
            // init kedua menimpa $sasaranRenstras[kode] yang sudah terisi →
            // program/kegiatan yatim & "Undefined array key".
            $sasaranRenstraMk = $this->matchKey($sasaranRenstraVal);
            $sasaranRenstraKode = $sasaranRenstraKodes[$sasaranRenstraMk] ?? $sasaranRenstraVal;
            if (!isset($sasaranRenstraIndex[$sasaranRenstraMk])) {
                $sasaranRenstraIndex[$sasaranRenstraMk] = true;
                $sasaranRenstras[$sasaranRenstraKode] = [
                    'id' => $sasaranRenstraKode,
                    'kode' => $sasaranRenstraKode,
                    'deskripsi' => $sasaranRenstraVal,
                    'programs' => [],
                    '_nextProgramNo' => 1,
                ];
            }
            $sasaranRenstraNo = $sasaranRenstraKode;
            $sasaranRenstra = &$sasaranRenstras[$sasaranRenstraNo];

            $programKey = $sasaranRenstraNo . '|' . $programVal;
            if (!isset($programIndex[$programKey])) {
                $programNo = $sasaranRenstra['_nextProgramNo']++;
                $programIndex[$programKey] = $programNo;
                $programKode = "{$sasaranRenstraNo}.{$programNo}";
                $sasaranRenstra['programs'][$programNo] = [
                    'id' => $programKode,
                    'kode' => $programKode,
                    'deskripsi' => $programVal,
                    'is_prioritas' => true,
                    'ik_program' => $this->removeLabel((string) $row->{'IK PROGRAM PD'}),
                    'baseline_ik_program' => $this->removeLabel((string) $row->{'BASELINE IK PROGRAM PD'}),
                    'target_ik_program' => $this->removeLabel((string) $row->{'TARGET IK PROGRAM PD'}),
                    'satuan_ik_program' => $this->removeLabel((string) $row->{'SATUAN IK PROGRAM PD'}),
                    'kegiatans' => [],
                    '_nextKegiatanNo' => 1,
                ];
            }
            $programNo = $programIndex[$programKey];

            $kegiatanKey = $programKey . '|' . $kegiatanVal;
            if (!isset($kegiatanIndex[$kegiatanKey])) {
                $kegiatanNo = $sasaranRenstra['programs'][$programNo]['_nextKegiatanNo']++;
                $kegiatanIndex[$kegiatanKey] = $kegiatanNo;
                $kegiatanKode = "{$sasaranRenstraNo}.{$programNo}.{$kegiatanNo}";
                $sasaranRenstra['programs'][$programNo]['kegiatans'][$kegiatanNo] = [
                    'id' => $kegiatanKode,
                    'kode' => $kegiatanKode,
                    'deskripsi' => $kegiatanVal,
                    'ik_kegiatan' => $this->removeLabel((string) $row->{'IK KEGIATAN PD'}),
                    'baseline_ik_kegiatan' => $this->removeLabel((string) $row->{'BASELINE IK KEGIATAN PD'}),
                    'target_ik_kegiatan' => $this->removeLabel((string) $row->{'TARGET IK KEGIATAN PD'}),
                    'satuan_ik_kegiatan' => $this->removeLabel((string) $row->{'SATUAN IK KEGIATAN PD'}),
                    'subkegiatans' => [],
                ];
            }
            $kegiatanNo = $kegiatanIndex[$kegiatanKey];

            // SubKegiatan adalah unit terkecil hierarki (1 baris tabel = 1
            // SubKegiatan) — tidak di-dedup, membawa row id asli untuk edit/hapus.
            $subkegiatanNo = count($sasaranRenstra['programs'][$programNo]['kegiatans'][$kegiatanNo]['subkegiatans']) + 1;
            $subkegiatanKode = "{$kegiatanKode}.{$subkegiatanNo}";
            $sasaranRenstra['programs'][$programNo]['kegiatans'][$kegiatanNo]['subkegiatans'][] = [
                'id' => $row->id,
                'user_id' => $row->user_id,
                'kode' => $subkegiatanKode,
                'nama' => $subkegiatanVal,
                'ik_subkegiatan' => $this->removeLabel((string) $row->{'IK SUBKEGIATAN PD'}),
                'baseline_ik_subkegiatan' => $this->removeLabel((string) $row->{'BASELINE IK SUBKEGIATAN PD'}),
                'target_ik_subkegiatan' => $this->removeLabel((string) $row->{'TARGET IK SUBKEGIATAN PD'}),
                'satuan_ik_subkegiatan' => $this->removeLabel((string) $row->{'SATUAN IK SUBKEGIATAN PD'}),
                'opd_penanggungjawab' => trim((string) $row->{'OPD PENANGGUNG JAWAB KEGIATAN'}),
                'raw' => (object) array_combine(
                    self::FIELDS,
                    array_map(fn ($f) => $f === 'OPD PENANGGUNG JAWAB KEGIATAN'
                        ? trim((string) $row->{$f})
                        : $this->removeLabel((string) $row->{$f}), self::FIELDS)
                ),
            ];
        }
        unset($sasaranRenstra);

        $reindex = function (array $sasaranRenstras) {
            foreach ($sasaranRenstras as &$sr) {
                unset($sr['_nextProgramNo']);
                foreach ($sr['programs'] as &$p) {
                    unset($p['_nextKegiatanNo']);
                    foreach ($p['kegiatans'] as &$k) {
                        $k['subkegiatans'] = array_values($k['subkegiatans']);
                    }
                    $p['kegiatans'] = array_values($p['kegiatans']);
                }
                $sr['programs'] = array_values($sr['programs']);
            }
            return array_values($sasaranRenstras);
        };

        $tree = $reindex($sasaranRenstras);

        // Program non-prioritas (tanpa Sasaran Renstra) jadi node top-level
        // tersendiri, sejajar dengan Sasaran Renstra — sama pola KRS_PD.
        foreach ($this->buildNonPrioritasNodes($nonPrioritasRows) as $node) {
            $tree[] = $node;
        }

        return $tree;
    }

    /**
     * Daftar node program NON-PRIORITAS (tanpa Sasaran Renstra di atasnya),
     * masing-masing berdiri sendiri berstruktur Program→Kegiatan→SubKegiatan,
     * kode berawalan "NP.x", ditandai is_prioritas=false & is_non_prioritas.
     */
    private function buildNonPrioritasNodes($rows): array
    {
        $programs = [];
        $programIndex = [];
        $kegiatanIndex = [];
        $nextProgramNo = 1;

        foreach ($rows as $row) {
            $programVal = $this->removeLabel((string) $row->{'PROGRAM PD'});
            $kegiatanVal = $this->removeLabel((string) $row->{'KEGIATAN PD'});
            $subkegiatanVal = $this->removeLabel((string) $row->{'SUBKEGIATAN PD'});

            if (!isset($programIndex[$programVal])) {
                $programNo = $nextProgramNo++;
                $programIndex[$programVal] = $programNo;
                $programKode = "NP.{$programNo}";
                $programs[$programNo] = [
                    'id' => $programKode,
                    'kode' => $programKode,
                    'deskripsi' => $programVal,
                    'is_prioritas' => false,
                    'ik_program' => $this->removeLabel((string) $row->{'IK PROGRAM PD'}),
                    'baseline_ik_program' => $this->removeLabel((string) $row->{'BASELINE IK PROGRAM PD'}),
                    'target_ik_program' => $this->removeLabel((string) $row->{'TARGET IK PROGRAM PD'}),
                    'satuan_ik_program' => $this->removeLabel((string) $row->{'SATUAN IK PROGRAM PD'}),
                    'kegiatans' => [],
                    '_nextKegiatanNo' => 1,
                ];
            }
            $programNo = $programIndex[$programVal];
            $programKode = $programs[$programNo]['kode'];

            $kegiatanKey = $programNo . '|' . $kegiatanVal;
            if (!isset($kegiatanIndex[$kegiatanKey])) {
                $kegiatanNo = $programs[$programNo]['_nextKegiatanNo']++;
                $kegiatanIndex[$kegiatanKey] = $kegiatanNo;
                $kegiatanKode = "{$programKode}.{$kegiatanNo}";
                $programs[$programNo]['kegiatans'][$kegiatanNo] = [
                    'id' => $kegiatanKode,
                    'kode' => $kegiatanKode,
                    'deskripsi' => $kegiatanVal,
                    'ik_kegiatan' => $this->removeLabel((string) $row->{'IK KEGIATAN PD'}),
                    'baseline_ik_kegiatan' => $this->removeLabel((string) $row->{'BASELINE IK KEGIATAN PD'}),
                    'target_ik_kegiatan' => $this->removeLabel((string) $row->{'TARGET IK KEGIATAN PD'}),
                    'satuan_ik_kegiatan' => $this->removeLabel((string) $row->{'SATUAN IK KEGIATAN PD'}),
                    'subkegiatans' => [],
                ];
            }
            $kegiatanNo = $kegiatanIndex[$kegiatanKey];
            $kegiatanKode = $programs[$programNo]['kegiatans'][$kegiatanNo]['kode'];

            $subNo = \count($programs[$programNo]['kegiatans'][$kegiatanNo]['subkegiatans']) + 1;
            $programs[$programNo]['kegiatans'][$kegiatanNo]['subkegiatans'][] = [
                'id' => $row->id,
                'user_id' => $row->user_id,
                'kode' => "{$kegiatanKode}.{$subNo}",
                'nama' => $subkegiatanVal,
                'ik_subkegiatan' => $this->removeLabel((string) $row->{'IK SUBKEGIATAN PD'}),
                'baseline_ik_subkegiatan' => $this->removeLabel((string) $row->{'BASELINE IK SUBKEGIATAN PD'}),
                'target_ik_subkegiatan' => $this->removeLabel((string) $row->{'TARGET IK SUBKEGIATAN PD'}),
                'satuan_ik_subkegiatan' => $this->removeLabel((string) $row->{'SATUAN IK SUBKEGIATAN PD'}),
                'opd_penanggungjawab' => trim((string) $row->{'OPD PENANGGUNG JAWAB KEGIATAN'}),
                'raw' => (object) array_combine(
                    self::FIELDS,
                    array_map(fn ($f) => $f === 'OPD PENANGGUNG JAWAB KEGIATAN'
                        ? trim((string) $row->{$f})
                        : $this->removeLabel((string) $row->{$f}), self::FIELDS)
                ),
            ];
        }

        $nodes = [];
        foreach ($programs as $p) {
            unset($p['_nextKegiatanNo']);
            // OPD penanggung jawab unik dari seluruh SubKegiatan di bawah program
            // ini → ditampilkan sbg badge di kartu program non-prioritas 3a
            // (OPD di 3a per-Kegiatan/SubKegiatan, bukan per-Program).
            $opds = [];
            foreach ($p['kegiatans'] as &$k) {
                $k['subkegiatans'] = array_values($k['subkegiatans']);
                foreach ($k['subkegiatans'] as $sk) {
                    foreach (preg_split('/\r\n|\r|\n/', (string) $sk['opd_penanggungjawab']) as $o) {
                        $o = trim($o);
                        if ($o !== '' && !in_array($o, $opds, true)) {
                            $opds[] = $o;
                        }
                    }
                }
            }
            unset($k);
            $p['kegiatans'] = array_values($p['kegiatans']);
            $p['opd_penanggungjawab'] = implode("\n", $opds);
            $p['is_non_prioritas'] = true;
            $nodes[] = $p;
        }

        return $nodes;
    }

    public function index()
    {
        $isAdmin = auth()->user()?->hasAnyRole(['admin', 'super-admin']) ?? false;

        // Baris hanya ditampilkan ke pemiliknya sendiri, kecuali admin/
        // super-admin yang melihat semua — konsisten dengan pembatasan
        // edit/hapus di RiskOwnershipPolicy.
        $query = KroPd::orderBy('id');
        if (!$isAdmin) {
            $query->where('user_id', auth()->id());
        }
        $rows = $query->get();

        // Daftar Sasaran Renstra yang sudah ada di tbl_krs_pd, dipakai
        // sebagai pilihan combobox — Sasaran Renstra di KRO_PD adalah
        // RUJUKAN, bukan input bebas. Ikut dibatasi ke milik sendiri
        // supaya PIC tidak bisa merujuk Sasaran Renstra milik OPD lain.
        $sasaranRenstraQuery = KrsPd::query();
        if (!$isAdmin) {
            $sasaranRenstraQuery->where('user_id', auth()->id());
        }
        $sasaranRenstraOptions = $sasaranRenstraQuery
            ->pluck('SASARAN STRATEGIS PD')
            ->map(fn ($v) => $this->removeLabel((string) $v))
            ->filter(fn ($v) => $v !== '' && $v !== '-' && $v !== 'Tidak Ada Data')
            ->unique()
            ->values();

        $fieldOptions = $this->distinctFieldOptions($rows);
        $fieldOptions['SASARAN RENSTRA'] = $sasaranRenstraOptions->all();

        // Auto-fill Program di form 3a: parent KRO_PD adalah KRS_PD (Level II),
        // jadi PROGRAM PD dicocokkan ke PROGRAM PD di 2a untuk menarik IK/
        // Baseline/Target/Satuan Program (tetap bisa diedit).
        $program2a = $this->program2aMap($isAdmin);
        // Opsi autocomplete pakai NAMA ASLI program (entry['label']), bukan
        // kunci map yang sudah di-lowercase, supaya dropdown tetap rapi.
        $fieldOptions['PROGRAM PD'] = array_values(array_unique(array_merge(
            $fieldOptions['PROGRAM PD'] ?? [],
            array_map(fn ($e) => $e['label'], $program2a),
        )));

        return Inertia::render('kro_pd/Index', [
            'sasaranRenstras' => $this->buildHierarchy($rows, $this->sasaranRenstraKodes()),
            'opdOptions' => Opd::orderBy('nama')->pluck('nama'),
            'opdList' => $isAdmin ? Opd::orderBy('nama')->get(['id', 'nama']) : [],
            'opdFillStatus' => $isAdmin ? $this->opdFillStatusByColumn(KroPd::class, 'OPD PENANGGUNG JAWAB KEGIATAN') : [],
            'fieldOptions' => $fieldOptions,
            'program1aMap' => $program2a,
            'currentUserId' => auth()->id(),
            'isAdmin' => $isAdmin,
        ]);
    }

    /**
     * Peta PROGRAM PD (teks bersih) -> IK/Baseline/Target/Satuan Program dari
     * 2a (tbl_krs_pd), sumber auto-fill Program di form 3a. Dibatasi ke milik
     * sendiri untuk non-admin (konsisten dengan opsi Sasaran Renstra).
     */
    private function program2aMap(bool $isAdmin): array
    {
        $query = KrsPd::query();
        if (!$isAdmin) {
            $query->where('user_id', auth()->id());
        }

        $map = [];
        foreach ($query->get() as $row) {
            $program = $this->removeLabel((string) $row->{'PROGRAM PD'});
            $key = $this->matchKey($program);
            if ($program === '' || $program === '-' || $program === 'Tidak Ada Data' || isset($map[$key])) {
                continue;
            }
            $map[$key] = [
                'label' => $program,
                'ik' => $this->removeLabel((string) $row->{'IK PROGRAM PD'}),
                'baseline' => $this->removeLabel((string) $row->{'BASELINE IK PROGRAM PD'}),
                'target' => $this->removeLabel((string) $row->{'TARGET IK PROGRAM PD'}),
                'satuan' => $this->removeLabel((string) $row->{'SATUAN IK PROGRAM PD'}),
            ];
        }

        return $map;
    }

    /**
     * Peta deskripsi bersih (tanpa label) Sasaran Strategis PD -> kode
     * ASLI-nya (mis. "1.1.1.1"). tbl_krs_pd sendiri menyimpan SASARAN
     * STRATEGIS PD sebagai teks polos (tanpa label kode) — kode lengkap
     * baru ada di tbl_krs_irs_pd (hasil regenerasi KrsIrsPdSyncService),
     * jadi lookup dilakukan ke situ, bukan ke tbl_krs_pd. Dipakai sebagai
     * basis numbering root SASARAN RENSTRA di buildHierarchy(), sama pola
     * dengan KrsPdController::sasaranRpjmdKodes().
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
                $kodes[$this->matchKey($matches[2])] = $matches[1];
            }
        }

        return $kodes;
    }

    private function distinctFieldOptions($rows): array
    {
        $options = [];
        foreach (self::FIELDS as $field) {
            $options[$field] = $rows
                ->pluck($field)
                ->map(fn ($v) => $this->removeLabel((string) $v))
                ->filter(fn ($v) => $v !== '' && $v !== '-' && $v !== 'Tidak Ada Data')
                ->unique()
                ->values()
                ->all();
        }

        return $options;
    }

    private function validated(Request $request): array
    {
        $rules = [];
        $attributes = [];
        foreach (self::FIELDS as $field) {
            $rules[$field] = ['nullable', 'string'];
            $attributes[$field] = $field;
        }
        // SASARAN RENSTRA tidak lagi wajib: program NON-PRIORITAS (Tabel 4.1,
        // termasuk Kecamatan) tidak menurun dari Sasaran Renstra. PROGRAM PD &
        // OPD tetap wajib agar node program non-prioritas punya label & PIC.
        $rules['SASARAN RENSTRA'] = ['nullable', 'string'];
        $rules['PROGRAM PD'] = ['required', 'string'];
        $rules['SUBKEGIATAN PD'] = ['required', 'string'];
        $rules['OPD PENANGGUNG JAWAB KEGIATAN'] = ['required', 'string'];
        $attributes['OPD PENANGGUNG JAWAB KEGIATAN'] = 'OPD Penanggung Jawab Kegiatan';

        return $request->validate($rules, [], $attributes);
    }

    /**
     * Kolom kosong dibiarkan kosong apa adanya — lihat
     * KrsPemdaController::fillBlanks() utk alasan sentinel dihapus.
     */
    private function fillBlanks(array $data): array
    {
        return $data;
    }

    public function store(Request $request, KroIroPdSyncService $sync)
    {
        $data = $this->fillBlanks($this->validated($request));
        $data['user_id'] = $request->user()->id;
        KroPd::create($data);
        $sync->sync();

        return redirect()->route('kro_pd.index')->with('success', 'Data berhasil ditambahkan.');
    }

    public function update(Request $request, KroPd $kro_pd, KroIroPdSyncService $sync)
    {
        $this->authorize('update', $kro_pd);

        $data = $this->fillBlanks($this->validated($request));
        $kro_pd->update($data);
        $sync->sync();

        return redirect()->route('kro_pd.index')->with('success', 'Data berhasil diperbarui.');
    }

    /**
     * Kolom milik tiap level non-leaf (Program/Kegiatan). SASARAN RENSTRA
     * adalah rujukan (root), bukan node editable.
     */
    private const NODE_LEVEL_FIELDS = [
        'program' => [
            'PROGRAM PD', 'IK PROGRAM PD', 'BASELINE IK PROGRAM PD',
            'TARGET IK PROGRAM PD', 'SATUAN IK PROGRAM PD',
        ],
        'kegiatan' => [
            'KEGIATAN PD', 'IK KEGIATAN PD', 'BASELINE IK KEGIATAN PD',
            'TARGET IK KEGIATAN PD', 'SATUAN IK KEGIATAN PD',
        ],
    ];

    /**
     * Kolom identifikasi baris (self + ancestor) per level. Varian "_np" =
     * NON-PRIORITAS (tak menurun dari Sasaran Renstra) — diidentifikasi hanya
     * dari Program (+Kegiatan); findNodeRows() menambah syarat baris non-prioritas.
     */
    private const NODE_MATCH_FIELDS = [
        'program' => ['SASARAN RENSTRA', 'PROGRAM PD'],
        'kegiatan' => ['SASARAN RENSTRA', 'PROGRAM PD', 'KEGIATAN PD'],
        'program_np' => ['PROGRAM PD'],
        'kegiatan_np' => ['PROGRAM PD', 'KEGIATAN PD'],
    ];

    /** Level "_np" memakai kolom edit yang sama dengan level prioritasnya. */
    private const NODE_LEVEL_ALIAS = [
        'program_np' => 'program',
        'kegiatan_np' => 'kegiatan',
    ];

    /** True jika baris NON-PRIORITAS (tak menurun dari Sasaran Renstra). */
    private function rowIsNonPrioritas($row): bool
    {
        $val = $this->removeLabel((string) $row->{'SASARAN RENSTRA'});
        return $val === '' || $val === '-' || $val === 'Tidak Ada Data';
    }

    /** Mencari SEMUA baris pembentuk sebuah node (hormati kepemilikan + _np). */
    private function findNodeRows(string $level, array $match, bool $isAdmin)
    {
        $query = KroPd::orderBy('id');
        if (!$isAdmin) {
            $query->where('user_id', auth()->id());
        }

        $matchFields = self::NODE_MATCH_FIELDS[$level];
        $isNp = str_ends_with($level, '_np');

        return $query->get()->filter(function ($row) use ($matchFields, $match, $isNp) {
            if ($isNp && !$this->rowIsNonPrioritas($row)) {
                return false;
            }
            foreach ($matchFields as $f) {
                if ($this->removeLabel((string) $row->{$f}) !== $this->removeLabel((string) ($match[$f] ?? ''))) {
                    return false;
                }
            }
            return true;
        });
    }

    /**
     * Edit satu NODE non-leaf (Program/Kegiatan) sekaligus — meng-update semua
     * baris pembentuk node agar tidak pecah. Menghormati kepemilikan baris.
     */
    public function updateNode(Request $request, KroIroPdSyncService $sync)
    {
        $level = (string) $request->input('level');
        if (!isset(self::NODE_MATCH_FIELDS[$level])) {
            abort(422, 'Level node tidak dikenal.');
        }
        $fieldsLevel = self::NODE_LEVEL_ALIAS[$level] ?? $level;

        $match = (array) $request->input('match', []);
        $values = (array) $request->input('values', []);

        $primaryField = self::NODE_LEVEL_FIELDS[$fieldsLevel][0];
        if (trim((string) ($values[$primaryField] ?? '')) === '') {
            return back()->withErrors([$primaryField => "{$primaryField} tidak boleh kosong."]);
        }

        $isAdmin = auth()->user()?->hasAnyRole(['admin', 'super-admin']) ?? false;
        $rows = $this->findNodeRows($level, $match, $isAdmin);

        if ($rows->isEmpty()) {
            return back()->withErrors(['node' => 'Node tidak ditemukan (mungkin sudah berubah). Muat ulang halaman.']);
        }

        $update = [];
        foreach (self::NODE_LEVEL_FIELDS[$fieldsLevel] as $f) {
            $update[$f] = trim((string) ($values[$f] ?? ''));
        }

        foreach ($rows as $row) {
            $this->authorize('update', $row);
            $row->update($update);
        }
        $sync->sync();

        return redirect()->route('kro_pd.index')->with('success', 'Node berhasil diperbarui.');
    }

    /**
     * Menghapus SATU node non-leaf (Program/Kegiatan) beserta SELURUH baris/anak
     * di bawahnya. Menghormati kepemilikan baris.
     */
    public function deleteNode(Request $request, KroIroPdSyncService $sync)
    {
        $level = (string) $request->input('level');
        if (!isset(self::NODE_MATCH_FIELDS[$level])) {
            abort(422, 'Level node tidak dikenal.');
        }

        $match = (array) $request->input('match', []);

        $isAdmin = auth()->user()?->hasAnyRole(['admin', 'super-admin']) ?? false;
        $rows = $this->findNodeRows($level, $match, $isAdmin);

        if ($rows->isEmpty()) {
            return back()->withErrors(['node' => 'Node tidak ditemukan (mungkin sudah berubah). Muat ulang halaman.']);
        }

        // Satu batch UUID untuk seluruh baris → bisa dipulihkan sekelompok.
        $batch = (string) Str::uuid();
        foreach ($rows as $row) {
            $this->authorize('delete', $row);
            $row->forceFill(['delete_batch' => $batch])->save();
            $row->delete();
        }
        $sync->sync();

        return redirect()->route('kro_pd.index')->with('success', 'Node beserta seluruh isinya berhasil dihapus.');
    }

    public function destroy(KroPd $kro_pd, KroIroPdSyncService $sync)
    {
        $this->authorize('delete', $kro_pd);

        $kro_pd->delete();
        $sync->sync();

        return redirect()->route('kro_pd.index')->with('success', 'Data berhasil dihapus.');
    }

    /**
     * Ambil Data — import massal dari tbl_krs_pd (II_a_KRS_PD), karena
     * struktur Program/Kegiatan/SubKegiatan di KRO_PD identik dengan yang
     * sudah diisi di KRS_PD (cuma dasar dokumennya beda: Renja/RKA vs
     * Renstra). Field yang di-copy: SASARAN STRATEGIS PD -> SASARAN
     * RENSTRA, lalu semua field Program/Kegiatan/SubKegiatan/OPD apa
     * adanya (nama kolom sama persis di kedua tabel).
     *
     * Hanya baris KRS_PD yang BELUM punya padanan di KRO_PD yang diimpor
     * — padanan dicek berdasarkan kombinasi (Sasaran Renstra, Program,
     * Kegiatan, SubKegiatan) sudah ada atau belum, supaya klik ulang tidak
     * menduplikasi data yang sudah diimpor/diedit sebelumnya.
     */
    public function importFromKrsPd(Request $request, KroIroPdSyncService $sync)
    {
        $isAdmin = $request->user()->hasAnyRole(['admin', 'super-admin']);

        // Sumber (KrsPd) dan cek duplikat (KroPd existing) dibatasi ke milik
        // user yang menjalankan import sendiri, kecuali admin — supaya PIC
        // OPD lain tidak ikut ter-import, dan kombinasi yang sama milik OPD
        // lain tidak dianggap "sudah ada" hanya karena kebetulan sama teks.
        $krsPdQuery = KrsPd::orderBy('id');
        $kroPdQuery = KroPd::query();
        if (!$isAdmin) {
            $krsPdQuery->where('user_id', $request->user()->id);
            $kroPdQuery->where('user_id', $request->user()->id);
        }

        $existingKeys = $kroPdQuery->get()->map(function ($row) {
            return implode('||', [
                $this->removeLabel((string) $row->{'SASARAN RENSTRA'}),
                $this->removeLabel((string) $row->{'PROGRAM PD'}),
                $this->removeLabel((string) $row->{'KEGIATAN PD'}),
                $this->removeLabel((string) $row->{'SUBKEGIATAN PD'}),
            ]);
        })->flip();

        $imported = 0;
        foreach ($krsPdQuery->get() as $krsPd) {
            $sasaranRenstra = $this->removeLabel((string) $krsPd->{'SASARAN STRATEGIS PD'});
            $program = $this->removeLabel((string) $krsPd->{'PROGRAM PD'});
            $kegiatan = $this->removeLabel((string) $krsPd->{'KEGIATAN PD'});
            $subkegiatan = $this->removeLabel((string) $krsPd->{'SUBKEGIATAN PD'});
            $key = implode('||', [$sasaranRenstra, $program, $kegiatan, $subkegiatan]);

            if ($existingKeys->has($key)) {
                continue;
            }

            KroPd::create([
                'SASARAN RENSTRA' => $krsPd->{'SASARAN STRATEGIS PD'},
                'PROGRAM PD' => $krsPd->{'PROGRAM PD'},
                'IK PROGRAM PD' => $krsPd->{'IK PROGRAM PD'},
                'BASELINE IK PROGRAM PD' => $krsPd->{'BASELINE IK PROGRAM PD'},
                'TARGET IK PROGRAM PD' => $krsPd->{'TARGET IK PROGRAM PD'},
                'SATUAN IK PROGRAM PD' => $krsPd->{'SATUAN IK PROGRAM PD'},
                'KEGIATAN PD' => $krsPd->{'KEGIATAN PD'},
                'IK KEGIATAN PD' => $krsPd->{'IK KEGIATAN PD'},
                'BASELINE IK KEGIATAN PD' => $krsPd->{'BASELINE IK KEGIATAN PD'},
                'TARGET IK KEGIATAN PD' => $krsPd->{'TARGET IK KEGIATAN PD'},
                'SATUAN IK KEGIATAN PD' => $krsPd->{'SATUAN IK KEGIATAN PD'},
                'SUBKEGIATAN PD' => $krsPd->{'SUBKEGIATAN PD'},
                'IK SUBKEGIATAN PD' => $krsPd->{'IK SUBKEGIATAN PD'},
                'BASELINE IK SUBKEGIATAN PD' => $krsPd->{'BASELINE IK SUBKEGIATAN PD'},
                'TARGET IK SUBKEGIATAN PD' => $krsPd->{'TARGET IK SUBKEGIATAN PD'},
                'SATUAN IK SUBKEGIATAN PD' => $krsPd->{'SATUAN IK SUBKEGIATAN PD'},
                'OPD PENANGGUNG JAWAB KEGIATAN' => $krsPd->{'OPD PENANGGUNG JAWAB KEGIATAN'},
                'user_id' => $request->user()->id,
            ]);
            $existingKeys->put($key, true);
            $imported++;
        }

        $sync->sync();

        $message = $imported > 0
            ? "{$imported} baris berhasil diambil dari KRS_PD."
            : 'Tidak ada data baru — semua baris KRS_PD sudah ada di KRO_PD.';

        return redirect()->route('kro_pd.index')->with('success', $message);
    }
}
