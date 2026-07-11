<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\HasOpdFillStatus;
use App\Models\KrsPd;
use App\Models\Opd;
use App\Models\KrsPemda;
use App\Services\KrsIrsPdSyncService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Inertia\Inertia;

class KrsPdController extends Controller
{
    use HasOpdFillStatus;

    private const FIELDS = [
        'SASARAN RPJMD',
        'TUJUAN STRATEGIS PD',
        'IK TUJUAN STRATEGIS PD',
        'BASELINE IK TUJUAN STRATEGIS PD',
        'TARGET IK TUJUAN STRATEGIS PD',
        'SATUAN IK TUJUAN STRATEGIS PD',
        'SASARAN STRATEGIS PD',
        'IK SASARAN STRATEGIS PD',
        'BASELINE IK SASARAN STRATEGIS PD',
        'TARGET IK SASARAN STRATEGIS PD',
        'SATUAN IK SASARAN STRATEGIS PD',
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
     * Sama seperti KrsPemdaController::removeLabel() — membuang
     * label VBA (mis. "Tujuan 1 : ", "Kegiatan 1.1.1.1 : ") dari data lama.
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
     * Kunci pencocokan teks Sasaran/Program antara KRS_PD dan sumber 1a
     * (tbl_krs_irs_pemda / tbl_krs_pemda): buang label kode + normalisasi
     * case-insensitive & spasi ganda. Supaya beda kecil penulisan (mis.
     * "Stunting dan" vs "Stunting Dan") tidak membuat kode Sasaran RPJMD atau
     * auto-fill IK Program gagal ketemu. Selaras dgn matchKey() di service sync.
     */
    private function matchKey(string $value): string
    {
        $clean = $this->removeLabel($value);
        $clean = preg_replace('/\s+/u', ' ', $clean);

        return mb_strtolower(trim($clean));
    }

    /**
     * Membangun hierarki SasaranRPJMD(rujukan) -> TujuanPD -> SasaranPD ->
     * ProgramPD -> KegiatanPD -> SubKegiatanPD dari tabel flat, mengikuti
     * pola dedup KrsPemdaController::buildHierarchy() (dedup per
     * nilai teks unik, bukan "berubah dari baris sebelumnya").
     *
     * Root pohon adalah SASARAN RPJMD — bukan Visi/Misi seperti KRS_Pemda —
     * karena kolom ini adalah RUJUKAN ke Sasaran yang sudah ada di
     * tbl_krs_pemda (dipilih lewat dropdown pada form, bukan
     * diketik bebas), sesuai struktur sheet II_a_KRS_PD: turunan dari
     * Renstra OPD yang disinkronkan ke Sasaran RPJMD induknya.
     *
     * PENTING: kode Tujuan/Sasaran PD/Program/Kegiatan/SubKegiatan di sini
     * memakai KODE ASLI Sasaran RPJMD (mis. "1.1.1" dari I_a_KRS_Pemda)
     * sebagai basis/prefix — BUKAN nomor urut lokal 1,2,3 — supaya satu
     * rantai penomoran utuh dari Misi sampai SubKegiatan (mis. Tujuan PD
     * jadi "1.1.1.1", bukan "1.1"), konsisten dengan kode yang tampil di
     * diagram/tabel I_a_KRS_Pemda. $sasaranRpjmdKodes dipetakan dari
     * $sasaranRpjmdOptions di index() (lookup ke tbl_krs_irs_pemda).
     */
    /**
     * Sebuah baris dianggap PROGRAM PRIORITAS bila menurun dari Sasaran RPJMD
     * (kolom "SASARAN RPJMD" terisi nyata, sesuai Tabel 3.3/3.5 RPJMD). Baris
     * NON-PRIORITAS (mis. Program Pengembangan Kurikulum, atau program level
     * Kecamatan di Tabel 4.1) tidak menurun dari Sasaran/Tujuan/Misi/Visi —
     * kolom "SASARAN RPJMD"-nya kosong / "Tidak Ada Data" — jadi tidak dipaksa
     * masuk pohon Sasaran, melainkan dikumpulkan ke grup tersendiri yang
     * sejajar dengan Sasaran (lihat buildHierarchy) dan diberi flag
     * is_prioritas=false supaya visualisasi bisa membedakannya.
     */
    private function isPrioritas($row): bool
    {
        $val = $this->removeLabel((string) $row->{'SASARAN RPJMD'});
        return $val !== '' && $val !== '-' && $val !== 'Tidak Ada Data';
    }

    private function buildHierarchy($rows, array $sasaranRpjmdKodes = []): array
    {
        $sasaranRpjmds = [];
        $sasaranRpjmdIndex = [];
        $tujuanIndex = [];
        $sasaranPdIndex = [];
        $programIndex = [];
        $kegiatanIndex = [];

        // Baris non-prioritas dipisah dari pohon Sasaran & dibangun terpisah
        // (lihat buildNonPrioritas) — supaya penomoran Sasaran tidak tercemar
        // node tanpa parent.
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
            $sasaranRpjmdVal = $this->removeLabel((string) $row->{'SASARAN RPJMD'});
            $tujuanVal = $this->removeLabel((string) $row->{'TUJUAN STRATEGIS PD'});
            $sasaranPdVal = $this->removeLabel((string) $row->{'SASARAN STRATEGIS PD'});
            $programVal = $this->removeLabel((string) $row->{'PROGRAM PD'});
            $kegiatanVal = $this->removeLabel((string) $row->{'KEGIATAN PD'});
            $subkegiatanVal = $this->removeLabel((string) $row->{'SUBKEGIATAN PD'});

            // Kode asli Sasaran RPJMD (mis. "1.1.1") — jika belum ditemukan
            // di tbl_krs_irs_pemda (data belum sinkron/Sasaran baru dibuat),
            // fallback ke teks Sasaran itu sendiri supaya tetap unik per
            // Sasaran, walau tanpa format angka.
            // Dedup Sasaran RPJMD pakai kunci ternormalisasi (matchKey), bukan
            // teks mentah — konsisten dengan penentuan kode. Kalau per teks
            // mentah, dua baris yang cuma beda kapitalisasi mendapat kode SAMA
            // tapi dianggap dua node, lalu init kedua menimpa
            // $sasaranRpjmds[kode] yang sudah terisi → node yatim & crash.
            $sasaranRpjmdMk = $this->matchKey($sasaranRpjmdVal);
            $sasaranRpjmdKode = $sasaranRpjmdKodes[$sasaranRpjmdMk] ?? $sasaranRpjmdVal;

            if (!isset($sasaranRpjmdIndex[$sasaranRpjmdMk])) {
                $sasaranRpjmdIndex[$sasaranRpjmdMk] = true;
                $sasaranRpjmds[$sasaranRpjmdKode] = [
                    'id' => $sasaranRpjmdKode,
                    'kode' => $sasaranRpjmdKode,
                    'deskripsi' => $sasaranRpjmdVal,
                    'tujuans' => [],
                    '_nextTujuanNo' => 1,
                ];
            }
            $sasaranRpjmdNo = $sasaranRpjmdKode;
            $sasaranRpjmd = &$sasaranRpjmds[$sasaranRpjmdNo];

            $tujuanKey = $sasaranRpjmdNo . '|' . $tujuanVal;
            if (!isset($tujuanIndex[$tujuanKey])) {
                $tujuanNo = $sasaranRpjmd['_nextTujuanNo']++;
                $tujuanIndex[$tujuanKey] = $tujuanNo;
                $tujuanKode = "{$sasaranRpjmdNo}.{$tujuanNo}";
                $sasaranRpjmd['tujuans'][$tujuanNo] = [
                    'id' => $tujuanKode,
                    'kode' => $tujuanKode,
                    'deskripsi' => $tujuanVal,
                    'ik_tujuan' => $this->removeLabel((string) $row->{'IK TUJUAN STRATEGIS PD'}),
                    'baseline_ik_tujuan' => $this->removeLabel((string) $row->{'BASELINE IK TUJUAN STRATEGIS PD'}),
                    'target_ik_tujuan' => $this->removeLabel((string) $row->{'TARGET IK TUJUAN STRATEGIS PD'}),
                    'satuan_ik_tujuan' => $this->removeLabel((string) $row->{'SATUAN IK TUJUAN STRATEGIS PD'}),
                    'sasarans' => [],
                    '_nextSasaranNo' => 1,
                ];
            }
            $tujuanNo = $tujuanIndex[$tujuanKey];

            $sasaranPdKey = $sasaranRpjmdNo . '|' . $tujuanNo . '|' . $sasaranPdVal;
            if (!isset($sasaranPdIndex[$sasaranPdKey])) {
                $sasaranPdNo = $sasaranRpjmd['tujuans'][$tujuanNo]['_nextSasaranNo']++;
                $sasaranPdIndex[$sasaranPdKey] = $sasaranPdNo;
                $sasaranPdKode = "{$sasaranRpjmdNo}.{$tujuanNo}.{$sasaranPdNo}";
                $sasaranRpjmd['tujuans'][$tujuanNo]['sasarans'][$sasaranPdNo] = [
                    'id' => $sasaranPdKode,
                    'kode' => $sasaranPdKode,
                    'deskripsi' => $sasaranPdVal,
                    'ik_sasaran' => $this->removeLabel((string) $row->{'IK SASARAN STRATEGIS PD'}),
                    'baseline_ik_sasaran' => $this->removeLabel((string) $row->{'BASELINE IK SASARAN STRATEGIS PD'}),
                    'target_ik_sasaran' => $this->removeLabel((string) $row->{'TARGET IK SASARAN STRATEGIS PD'}),
                    'satuan_ik_sasaran' => $this->removeLabel((string) $row->{'SATUAN IK SASARAN STRATEGIS PD'}),
                    'programs' => [],
                    '_nextProgramNo' => 1,
                ];
            }
            $sasaranPdNo = $sasaranPdIndex[$sasaranPdKey];

            $programKey = $sasaranRpjmdNo . '|' . $tujuanNo . '|' . $sasaranPdNo . '|' . $programVal;
            if (!isset($programIndex[$programKey])) {
                $programNo = $sasaranRpjmd['tujuans'][$tujuanNo]['sasarans'][$sasaranPdNo]['_nextProgramNo']++;
                $programIndex[$programKey] = $programNo;
                $programKode = "{$sasaranRpjmdNo}.{$tujuanNo}.{$sasaranPdNo}.{$programNo}";
                $sasaranRpjmd['tujuans'][$tujuanNo]['sasarans'][$sasaranPdNo]['programs'][$programNo] = [
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
                $kegiatanNo = $sasaranRpjmd['tujuans'][$tujuanNo]['sasarans'][$sasaranPdNo]['programs'][$programNo]['_nextKegiatanNo']++;
                $kegiatanIndex[$kegiatanKey] = $kegiatanNo;
                $kegiatanKode = "{$programKode}.{$kegiatanNo}";
                $sasaranRpjmd['tujuans'][$tujuanNo]['sasarans'][$sasaranPdNo]['programs'][$programNo]['kegiatans'][$kegiatanNo] = [
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
            $subkegiatanNo = count($sasaranRpjmd['tujuans'][$tujuanNo]['sasarans'][$sasaranPdNo]['programs'][$programNo]['kegiatans'][$kegiatanNo]['subkegiatans']) + 1;
            $subkegiatanKode = "{$kegiatanKode}.{$subkegiatanNo}";
            $sasaranRpjmd['tujuans'][$tujuanNo]['sasarans'][$sasaranPdNo]['programs'][$programNo]['kegiatans'][$kegiatanNo]['subkegiatans'][] = [
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
        unset($sasaranRpjmd);

        $reindex = function (array $sasaranRpjmds) {
            foreach ($sasaranRpjmds as &$sr) {
                unset($sr['_nextTujuanNo']);
                foreach ($sr['tujuans'] as &$t) {
                    unset($t['_nextSasaranNo']);
                    foreach ($t['sasarans'] as &$s) {
                        unset($s['_nextProgramNo']);
                        foreach ($s['programs'] as &$p) {
                            unset($p['_nextKegiatanNo']);
                            foreach ($p['kegiatans'] as &$k) {
                                $k['subkegiatans'] = array_values($k['subkegiatans']);
                            }
                            $p['kegiatans'] = array_values($p['kegiatans']);
                        }
                        $s['programs'] = array_values($s['programs']);
                    }
                    $t['sasarans'] = array_values($t['sasarans']);
                }
                $sr['tujuans'] = array_values($sr['tujuans']);
            }
            return array_values($sasaranRpjmds);
        };

        $tree = $reindex($sasaranRpjmds);

        // Program non-prioritas (tanpa parent Sasaran) TIDAK dibungkus payung —
        // tiap program berdiri sendiri sebagai node top-level, sejajar dengan
        // Sasaran RPJMD, sehingga di visualisasi seluruh program (prioritas &
        // non-prioritas) berada di satu level yang sama. Bedanya: prioritas
        // punya rantai ke atas (Sasaran→Tujuan→Misi→Visi), non-prioritas
        // menggantung (is_prioritas=false, tanpa parent).
        foreach ($this->buildNonPrioritasNodes($nonPrioritasRows) as $node) {
            $tree[] = $node;
        }

        return $tree;
    }

    /**
     * Mengembalikan daftar node program NON-PRIORITAS, masing-masing sebagai
     * node berdiri sendiri (tanpa Sasaran/Tujuan di atasnya) namun berstruktur
     * Program→Kegiatan→SubKegiatan yang SAMA seperti program prioritas, agar
     * bisa ditampilkan sejajar. Kode diberi awalan "NP.x". Setiap node ditandai
     * is_prioritas=false.
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
            // Kumpulkan OPD penanggung jawab unik dari seluruh SubKegiatan di
            // bawah program ini, supaya kartu program non-prioritas 2a bisa
            // menampilkan badge OPD seperti kartu program 1a (di 2a OPD memang
            // per-Kegiatan/SubKegiatan, bukan per-Program). Gabung 1 OPD/baris.
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
            // Node top-level non-prioritas: penanda is_non_prioritas dipakai
            // frontend untuk merender tanpa rantai Sasaran/Tujuan di atasnya.
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
        // edit/hapus di RiskOwnershipPolicy (baris tanpa user_id juga
        // hanya terlihat oleh admin). Hierarki/numbering (buildHierarchy)
        // dibangun HANYA dari rows yang lolos filter ini, jadi PIC melihat
        // pohon berisi rujukan miliknya sendiri saja.
        $query = KrsPd::orderBy('id');
        if (!$isAdmin) {
            $query->where('user_id', auth()->id());
        }
        $rows = $query->get();

        // Daftar Sasaran RPJMD yang sudah ada di tbl_krs_pemda,
        // dipakai sebagai pilihan combobox — Sasaran RPJMD di KRS_PD adalah
        // RUJUKAN, bukan input bebas.
        $sasaranRpjmdOptions = KrsPemda::query()
            ->pluck('SASARAN RPJMD')
            ->map(fn ($v) => $this->removeLabel((string) $v))
            ->filter(fn ($v) => $v !== '' && $v !== '-' && $v !== 'Tidak Ada Data')
            ->unique()
            ->values();

        $fieldOptions = $this->distinctFieldOptions($rows);
        $fieldOptions['SASARAN RPJMD'] = $sasaranRpjmdOptions->all();

        // Peta Program Prioritas dari 1a (KRS_Pemda) untuk AUTO-FILL di form 2a:
        // saat user memilih/mengetik "PROGRAM PD" yang cocok dengan salah satu
        // "PROGRAM PRIORITAS" di 1a, IK/Baseline/Target/Satuan Program-nya
        // otomatis terisi (tetap bisa diedit). Kunci = teks program bersih.
        $program1a = $this->program1aMap();
        // Opsi autocomplete pakai NAMA ASLI program (entry['label']), bukan
        // kunci map yang sudah di-lowercase, supaya dropdown tetap rapi.
        $fieldOptions['PROGRAM PD'] = array_values(array_unique(array_merge(
            $fieldOptions['PROGRAM PD'] ?? [],
            array_map(fn ($e) => $e['label'], $program1a),
        )));

        return Inertia::render('krs_pd/Index', [
            'sasaranRpjmds' => $this->buildHierarchy($rows, $this->sasaranRpjmdKodes()),
            'opdOptions' => Opd::orderBy('nama')->pluck('nama'),
            'opdList' => $isAdmin ? Opd::orderBy('nama')->get(['id', 'nama']) : [],
            'opdFillStatus' => $isAdmin ? $this->opdFillStatusByColumn(KrsPd::class, 'OPD PENANGGUNG JAWAB KEGIATAN') : [],
            'fieldOptions' => $fieldOptions,
            'program1aMap' => $program1a,
            'currentUserId' => auth()->id(),
            'isAdmin' => $isAdmin,
        ]);
    }

    /**
     * Peta "PROGRAM PRIORITAS" (teks bersih) -> IK/Baseline/Target/Satuan
     * Program dari 1a (tbl_krs_pemda), sumber auto-fill Program PD di
     * form 2a. Bila satu program muncul >1x, dipakai kemunculan pertama.
     */
    private function program1aMap(): array
    {
        $map = [];
        foreach (KrsPemda::all() as $row) {
            $program = $this->removeLabel((string) $row->{'PROGRAM PRIORITAS'});
            $key = $this->matchKey($program);
            if ($program === '' || $program === '-' || $program === 'Tidak Ada Data' || isset($map[$key])) {
                continue;
            }
            $map[$key] = [
                'label' => $program,
                'ik' => $this->removeLabel((string) $row->{'IK PROGRAM'}),
                'baseline' => $this->removeLabel((string) $row->{'BASELINE IK PROGRAM'}),
                'target' => $this->removeLabel((string) $row->{'TARGET IK PROGRAM'}),
                'satuan' => $this->removeLabel((string) $row->{'SATUAN IK PROGRAM'}),
            ];
        }

        return $map;
    }

    /**
     * Peta Sasaran RPJMD (teks bersih) -> kode asli-nya (mis. "1.1.1"),
     * diambil dari tbl_krs_irs_pemda yang sudah diregenerasi
     * KrsIrsSyncService dengan SASARAN_RPJMD berlabel kode lengkap (mis.
     * "Sasaran 1.1.1 : ..."). Dipakai sebagai basis penomoran turunan di
     * buildHierarchy() supaya satu rantai kode utuh dengan I_a_KRS_Pemda.
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
        // SASARAN RPJMD tidak lagi wajib: program NON-PRIORITAS (Tabel 4.1,
        // termasuk Kecamatan) memang tidak menurun dari Sasaran RPJMD, jadi
        // kolom ini boleh kosong. PROGRAM PD & OPD tetap wajib supaya node
        // program non-prioritas tetap punya label & penanggung jawab.
        $rules['SASARAN RPJMD'] = ['nullable', 'string'];
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

    public function store(Request $request, KrsIrsPdSyncService $sync)
    {
        $data = $this->fillBlanks($this->validated($request));
        $data['user_id'] = $request->user()->id;
        KrsPd::create($data);
        $sync->sync();

        return redirect()->route('krs_pd.index')->with('success', 'Data berhasil ditambahkan.');
    }

    public function update(Request $request, KrsPd $krs_pd, KrsIrsPdSyncService $sync)
    {
        $this->authorize('update', $krs_pd);

        $data = $this->fillBlanks($this->validated($request));
        $krs_pd->update($data);
        $sync->sync();

        return redirect()->route('krs_pd.index')->with('success', 'Data berhasil diperbarui.');
    }

    /**
     * Kolom yang dimiliki tiap level non-leaf (TujuanPD/SasaranPD/Program/
     * Kegiatan). SASARAN RPJMD sengaja TIDAK ada di sini: ia rujukan (root,
     * dipilih via dropdown), bukan node editable.
     */
    private const NODE_LEVEL_FIELDS = [
        'tujuan' => [
            'TUJUAN STRATEGIS PD', 'IK TUJUAN STRATEGIS PD', 'BASELINE IK TUJUAN STRATEGIS PD',
            'TARGET IK TUJUAN STRATEGIS PD', 'SATUAN IK TUJUAN STRATEGIS PD',
        ],
        'sasaran' => [
            'SASARAN STRATEGIS PD', 'IK SASARAN STRATEGIS PD', 'BASELINE IK SASARAN STRATEGIS PD',
            'TARGET IK SASARAN STRATEGIS PD', 'SATUAN IK SASARAN STRATEGIS PD',
        ],
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
     * Kolom identifikasi baris (self + seluruh ancestor) per level.
     * Varian "_np" = NON-PRIORITAS: tidak menurun dari Sasaran RPJMD, jadi
     * diidentifikasi HANYA dari Program (+Kegiatan) — konsisten dengan cara
     * buildNonPrioritasNodes() men-dedup program non-prioritas (per teks
     * Program). findNodeRows() menambahkan syarat baris HARUS non-prioritas
     * untuk level "_np" ini supaya tak keliru kena program prioritas bernama
     * sama.
     */
    private const NODE_MATCH_FIELDS = [
        'tujuan' => ['SASARAN RPJMD', 'TUJUAN STRATEGIS PD'],
        'sasaran' => ['SASARAN RPJMD', 'TUJUAN STRATEGIS PD', 'SASARAN STRATEGIS PD'],
        'program' => ['SASARAN RPJMD', 'TUJUAN STRATEGIS PD', 'SASARAN STRATEGIS PD', 'PROGRAM PD'],
        'kegiatan' => ['SASARAN RPJMD', 'TUJUAN STRATEGIS PD', 'SASARAN STRATEGIS PD', 'PROGRAM PD', 'KEGIATAN PD'],
        'program_np' => ['PROGRAM PD'],
        'kegiatan_np' => ['PROGRAM PD', 'KEGIATAN PD'],
    ];

    /** Level "_np" memakai kolom EDIT yang sama dengan level prioritasnya. */
    private const NODE_LEVEL_ALIAS = [
        'program_np' => 'program',
        'kegiatan_np' => 'kegiatan',
    ];

    /** True jika baris ini NON-PRIORITAS (tak menurun dari Sasaran RPJMD). */
    private function rowIsNonPrioritas($row): bool
    {
        $val = $this->removeLabel((string) $row->{'SASARAN RPJMD'});
        return $val === '' || $val === '-' || $val === 'Tidak Ada Data';
    }

    /**
     * Mencari SEMUA baris pembentuk sebuah node (dipakai updateNode & deleteNode).
     * Menghormati kepemilikan baris (non-admin hanya barisnya). Untuk level
     * "_np" juga mensyaratkan baris non-prioritas.
     */
    private function findNodeRows(string $level, array $match, bool $isAdmin)
    {
        $query = KrsPd::orderBy('id');
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
     * Edit satu NODE non-leaf sekaligus (lihat KrsPemdaController::
     * updateNode). Menghormati kepemilikan baris: non-admin hanya mengubah
     * baris miliknya sendiri — sama dengan filter di index() & policy update().
     */
    public function updateNode(Request $request, KrsIrsPdSyncService $sync)
    {
        $level = (string) $request->input('level');
        if (!isset(self::NODE_MATCH_FIELDS[$level])) {
            abort(422, 'Level node tidak dikenal.');
        }
        // Level "_np" (non-prioritas) memakai kolom edit yang sama dgn prioritasnya.
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
            // Pertahankan pengecekan policy per baris (baris tanpa user_id, dll).
            $this->authorize('update', $row);
            $row->update($update);
        }
        $sync->sync();

        return redirect()->route('krs_pd.index')->with('success', 'Node berhasil diperbarui.');
    }

    /**
     * Menghapus SATU node non-leaf (Tujuan/Sasaran PD/Program/Kegiatan) beserta
     * SELURUH baris/anak di bawahnya. Menghormati kepemilikan baris: non-admin
     * hanya menghapus barisnya sendiri, dan tiap baris tetap dicek policy.
     */
    public function deleteNode(Request $request, KrsIrsPdSyncService $sync)
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

        // Tandai seluruh baris dengan satu batch UUID sebelum soft-delete, agar
        // di "Data Terhapus" bisa dipulihkan sekelompok (satu operasi hapus node
        // = satu batch, walau isinya banyak baris).
        $batch = (string) Str::uuid();
        foreach ($rows as $row) {
            $this->authorize('delete', $row);
            $row->forceFill(['delete_batch' => $batch])->save();
            $row->delete();
        }
        $sync->sync();

        return redirect()->route('krs_pd.index')->with('success', 'Node beserta seluruh isinya berhasil dihapus.');
    }

    public function destroy(KrsPd $krs_pd, KrsIrsPdSyncService $sync)
    {
        $this->authorize('delete', $krs_pd);

        $krs_pd->delete();
        $sync->sync();

        return redirect()->route('krs_pd.index')->with('success', 'Data berhasil dihapus.');
    }
}
