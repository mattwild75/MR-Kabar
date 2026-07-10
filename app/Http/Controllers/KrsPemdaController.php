<?php

namespace App\Http\Controllers;

use App\Models\Opd;
use App\Models\KrsPemda;
use App\Services\KrsIrsSyncService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class KrsPemdaController extends Controller
{
    private const FIELDS = [
        'VISI',
        'MISI',
        'TUJUAN RPJMD',
        'IK TUJUAN RPJMD',
        'BASELINE IK TUJUAN RPJMD',
        'TARGET IK TUJUAN RPJMD',
        'SATUAN IK TUJUAN RPJMD',
        'OPD IK TUJUAN RPJMD',
        'SASARAN RPJMD',
        'IK SASARAN RPJMD',
        'BASELINE IK SASARAN RPJMD',
        'TARGET IK SASARAN RPJMD',
        'SATUAN IK SASARAN RPJMD',
        'OPD IK SASARAN RPJMD',
        'PROGRAM PRIORITAS',
        'OUTCOME PROGRAM PRIORITAS',
        'IK PROGRAM',
        'BASELINE IK PROGRAM',
        'TARGET IK PROGRAM',
        'SATUAN IK PROGRAM',
        'OPD IK PROGRAM',
        'OPD PENANGGUNGJAWAB PROGRAM',
    ];

    /**
     * Membuang label lama (mis. "Misi 1 : ", "IK Tujuan 2.3 : ") dari data yang
     * sudah diproses FormatHierarchy versi VBA sebelumnya, supaya kode hierarki
     * bisa dihitung ulang dan ditampilkan tanpa duplikasi label.
     *
     * Hanya memotong jika awal string benar-benar berpola label VBA (satu atau
     * dua kata diikuti nomor "X" atau "X.X.X..." lalu ":"), bukan sekadar
     * "ambil teks setelah ':' terakhir" — pendekatan lama itu merusak konten
     * asli yang kebetulan mengandung tanda titik dua di dalamnya (mis. teks
     * Misi/Sasaran yang memang punya ":" sebagai bagian dari kalimat), karena
     * bagian sebelum ":" tersebut akan hilang permanen.
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
     * Membangun hierarki Visi -> Misi -> Tujuan -> Sasaran -> Program dari
     * tabel flat. Baris sumber tidak terurut per Misi (baris Misi 1/2/3/...
     * berselang-seling karena mengikuti urutan Sasaran, bukan Misi), jadi
     * setiap level di-dedup berdasarkan NILAI TEKS-nya sendiri (bukan
     * "berubah dari baris sebelumnya") agar teks yang sama selalu menjadi
     * satu node walau muncul di baris yang tidak berurutan. Nomor kode
     * (mis. "2.1.3") mengikuti
     * urutan kemunculan pertama tiap nilai unik. Program tidak di-dedup:
     * setiap baris tabel = satu Program, membawa row id asli untuk keperluan
     * edit/hapus.
     */
    /**
     * PROGRAM PRIORITAS bila menurun dari Sasaran RPJMD (kolom "SASARAN RPJMD"
     * terisi nyata, sesuai Tabel 3.5 RPJMD). Bila kosong/"Tidak Ada Data" →
     * NON-PRIORITAS: program berdiri sendiri sebagai node top-level (sejajar
     * Visi), tanpa rantai Visi→Misi→Tujuan→Sasaran di atasnya.
     */
    private function isPrioritas($row): bool
    {
        $val = $this->removeLabel((string) $row->{'SASARAN RPJMD'});
        return $val !== '' && $val !== 'Tidak Ada Data';
    }

    private function buildHierarchy($rows): array
    {
        $visis = [];
        $visiIndex = [];
        $misiIndex = [];
        $tujuanIndex = [];
        $sasaranIndex = [];

        $nextVisiNo = 1;
        $nextMisiNo = 1;

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
            $visiVal = $this->removeLabel((string) $row->VISI);
            $misiVal = $this->removeLabel((string) $row->MISI);
            $tujuanVal = $this->removeLabel((string) $row->{'TUJUAN RPJMD'});
            $sasaranVal = $this->removeLabel((string) $row->{'SASARAN RPJMD'});
            $programVal = $this->removeLabel((string) $row->{'PROGRAM PRIORITAS'});

            if (!isset($visiIndex[$visiVal])) {
                $visiNo = $nextVisiNo++;
                $visiIndex[$visiVal] = $visiNo;
                $visis[$visiNo] = [
                    'id' => $visiNo,
                    'deskripsi' => $visiVal,
                    'misis' => [],
                ];
            }
            $visiNo = $visiIndex[$visiVal];
            $misis = &$visis[$visiNo]['misis'];

            // Di-scope per Visi (kunci "$visiNo|$misiVal"), bukan global —
            // supaya dua Misi dari Visi berbeda yang kebetulan bertuliskan
            // sama (mis. sama-sama kosong / "Tidak Ada Data") tidak keliru
            // digabung jadi satu node yang menaungi Tujuan/Sasaran/Program
            // dari kedua Visi sekaligus.
            $misiKey = $visiNo . '|' . $misiVal;
            if (!isset($misiIndex[$misiKey])) {
                $misiNo = $nextMisiNo++;
                $misiIndex[$misiKey] = $misiNo;
                $misis[$misiNo] = [
                    'id' => $misiNo,
                    'kode' => (string) $misiNo,
                    'deskripsi' => $misiVal,
                    'tujuans' => [],
                    '_nextTujuanNo' => 1,
                ];
            }
            $misiNo = $misiIndex[$misiKey];

            $tujuanKey = $misiNo . '|' . $tujuanVal;
            if (!isset($tujuanIndex[$tujuanKey])) {
                $tujuanNo = $misis[$misiNo]['_nextTujuanNo']++;
                $tujuanIndex[$tujuanKey] = $tujuanNo;
                $tujuanKode = "{$misiNo}.{$tujuanNo}";
                $misis[$misiNo]['tujuans'][$tujuanNo] = [
                    'id' => $tujuanKode,
                    'kode' => $tujuanKode,
                    'deskripsi' => $tujuanVal,
                    'ik_tujuan' => $this->removeLabel((string) $row->{'IK TUJUAN RPJMD'}),
                    'baseline_ik_tujuan' => $this->removeLabel((string) $row->{'BASELINE IK TUJUAN RPJMD'}),
                    'target_ik_tujuan' => $this->removeLabel((string) $row->{'TARGET IK TUJUAN RPJMD'}),
                    'satuan_ik_tujuan' => $this->removeLabel((string) $row->{'SATUAN IK TUJUAN RPJMD'}),
                    'opd_ik_tujuan' => $this->removeLabel((string) $row->{'OPD IK TUJUAN RPJMD'}),
                    'sasarans' => [],
                    '_nextSasaranNo' => 1,
                ];
            }
            $tujuanNo = $tujuanIndex[$tujuanKey];

            $sasaranKey = $misiNo . '|' . $tujuanNo . '|' . $sasaranVal;
            if (!isset($sasaranIndex[$sasaranKey])) {
                $sasaranNo = $misis[$misiNo]['tujuans'][$tujuanNo]['_nextSasaranNo']++;
                $sasaranIndex[$sasaranKey] = $sasaranNo;
                $sasaranKode = "{$misiNo}.{$tujuanNo}.{$sasaranNo}";
                $misis[$misiNo]['tujuans'][$tujuanNo]['sasarans'][$sasaranNo] = [
                    'id' => $sasaranKode,
                    'kode' => $sasaranKode,
                    'deskripsi' => $sasaranVal,
                    'ik_sasaran' => $this->removeLabel((string) $row->{'IK SASARAN RPJMD'}),
                    'baseline_ik_sasaran' => $this->removeLabel((string) $row->{'BASELINE IK SASARAN RPJMD'}),
                    'target_ik_sasaran' => $this->removeLabel((string) $row->{'TARGET IK SASARAN RPJMD'}),
                    'satuan_ik_sasaran' => $this->removeLabel((string) $row->{'SATUAN IK SASARAN RPJMD'}),
                    'opd_ik_sasaran' => $this->removeLabel((string) $row->{'OPD IK SASARAN RPJMD'}),
                    'programs' => [],
                ];
            }
            $sasaranNo = $sasaranIndex[$sasaranKey];

            $programNo = count($misis[$misiNo]['tujuans'][$tujuanNo]['sasarans'][$sasaranNo]['programs']) + 1;
            $programKode = "{$misiNo}.{$tujuanNo}.{$sasaranNo}.{$programNo}";
            $misis[$misiNo]['tujuans'][$tujuanNo]['sasarans'][$sasaranNo]['programs'][] = [
                'id' => $row->id,
                'kode' => $programKode,
                'nama' => $programVal,
                'is_prioritas' => true,
                'outcome' => $this->removeLabel((string) $row->{'OUTCOME PROGRAM PRIORITAS'}),
                'ik_program' => $this->removeLabel((string) $row->{'IK PROGRAM'}),
                'baseline_ik_program' => $this->removeLabel((string) $row->{'BASELINE IK PROGRAM'}),
                'target_ik_program' => $this->removeLabel((string) $row->{'TARGET IK PROGRAM'}),
                'satuan_ik_program' => $this->removeLabel((string) $row->{'SATUAN IK PROGRAM'}),
                'opd_penanggungjawab' => trim((string) $row->{'OPD PENANGGUNGJAWAB PROGRAM'}),
                'raw' => (object) [
                    'VISI' => $this->removeLabel((string) $row->VISI),
                    'MISI' => $misiVal,
                    'TUJUAN RPJMD' => $tujuanVal,
                    'IK TUJUAN RPJMD' => $this->removeLabel((string) $row->{'IK TUJUAN RPJMD'}),
                    'BASELINE IK TUJUAN RPJMD' => $this->removeLabel((string) $row->{'BASELINE IK TUJUAN RPJMD'}),
                    'TARGET IK TUJUAN RPJMD' => $this->removeLabel((string) $row->{'TARGET IK TUJUAN RPJMD'}),
                    'SATUAN IK TUJUAN RPJMD' => $this->removeLabel((string) $row->{'SATUAN IK TUJUAN RPJMD'}),
                    'SASARAN RPJMD' => $sasaranVal,
                    'IK SASARAN RPJMD' => $this->removeLabel((string) $row->{'IK SASARAN RPJMD'}),
                    'BASELINE IK SASARAN RPJMD' => $this->removeLabel((string) $row->{'BASELINE IK SASARAN RPJMD'}),
                    'TARGET IK SASARAN RPJMD' => $this->removeLabel((string) $row->{'TARGET IK SASARAN RPJMD'}),
                    'SATUAN IK SASARAN RPJMD' => $this->removeLabel((string) $row->{'SATUAN IK SASARAN RPJMD'}),
                    'PROGRAM PRIORITAS' => $programVal,
                    'OUTCOME PROGRAM PRIORITAS' => $this->removeLabel((string) $row->{'OUTCOME PROGRAM PRIORITAS'}),
                    'IK PROGRAM' => $this->removeLabel((string) $row->{'IK PROGRAM'}),
                    'BASELINE IK PROGRAM' => $this->removeLabel((string) $row->{'BASELINE IK PROGRAM'}),
                    'TARGET IK PROGRAM' => $this->removeLabel((string) $row->{'TARGET IK PROGRAM'}),
                    'SATUAN IK PROGRAM' => $this->removeLabel((string) $row->{'SATUAN IK PROGRAM'}),
                    'OPD PENANGGUNGJAWAB PROGRAM' => trim((string) $row->{'OPD PENANGGUNGJAWAB PROGRAM'}),
                ],
            ];
        }
        unset($misis);

        $reindexMisis = function (array $misis) {
            foreach ($misis as &$m) {
                unset($m['_nextTujuanNo']);
                foreach ($m['tujuans'] as &$t) {
                    unset($t['_nextSasaranNo']);
                    foreach ($t['sasarans'] as &$s) {
                        $s['programs'] = array_values($s['programs']);
                    }
                    $t['sasarans'] = array_values($t['sasarans']);
                }
                $m['tujuans'] = array_values($m['tujuans']);
            }
            return array_values($misis);
        };

        foreach ($visis as &$visi) {
            $visi['misis'] = $reindexMisis($visi['misis']);
        }
        unset($visi);

        $tree = array_values($visis);

        // Program non-prioritas (tanpa Sasaran RPJMD) jadi node top-level
        // tersendiri, sejajar dengan Visi — semua program tampil 1 level.
        foreach ($this->buildNonPrioritasNodes($nonPrioritasRows) as $node) {
            $tree[] = $node;
        }

        return $tree;
    }

    /**
     * Daftar node PROGRAM non-prioritas (tanpa rantai Visi/Misi/Tujuan/Sasaran
     * di atasnya). Di 1a, Program adalah leaf, jadi tiap program non-prioritas
     * langsung menjadi node top-level dengan kode "NP.x", is_prioritas=false &
     * is_non_prioritas=true. Membawa OPD penanggung jawab (termasuk Kecamatan
     * dari Tabel 4.1).
     */
    private function buildNonPrioritasNodes($rows): array
    {
        $nodes = [];
        $programIndex = [];
        $nextNo = 1;

        foreach ($rows as $row) {
            $programVal = $this->removeLabel((string) $row->{'PROGRAM PRIORITAS'});

            // Dedup per teks program: satu program non-prioritas = satu node,
            // walau muncul di beberapa baris. Kalau sama, pakai baris pertama.
            if (isset($programIndex[$programVal])) {
                continue;
            }
            $no = $nextNo++;
            $programIndex[$programVal] = $no;

            $nodes[] = [
                'id' => $row->id,
                'kode' => "NP.{$no}",
                'nama' => $programVal,
                'is_prioritas' => false,
                'is_non_prioritas' => true,
                'outcome' => $this->removeLabel((string) $row->{'OUTCOME PROGRAM PRIORITAS'}),
                'ik_program' => $this->removeLabel((string) $row->{'IK PROGRAM'}),
                'baseline_ik_program' => $this->removeLabel((string) $row->{'BASELINE IK PROGRAM'}),
                'target_ik_program' => $this->removeLabel((string) $row->{'TARGET IK PROGRAM'}),
                'satuan_ik_program' => $this->removeLabel((string) $row->{'SATUAN IK PROGRAM'}),
                'opd_penanggungjawab' => trim((string) $row->{'OPD PENANGGUNGJAWAB PROGRAM'}),
                'raw' => (object) array_combine(
                    self::FIELDS,
                    array_map(fn ($f) => in_array($f, ['OPD PENANGGUNGJAWAB PROGRAM', 'OPD IK TUJUAN RPJMD', 'OPD IK SASARAN RPJMD', 'OPD IK PROGRAM'], true)
                        ? trim((string) $row->{$f})
                        : $this->removeLabel((string) $row->{$f}), self::FIELDS)
                ),
            ];
        }

        return $nodes;
    }

    public function index()
    {
        $rows = KrsPemda::orderBy('id')->get();

        return Inertia::render('krs/Index', [
            'visis' => $this->buildHierarchy($rows),
            'opdOptions' => Opd::orderBy('nama')->pluck('nama'),
            'fieldOptions' => $this->distinctFieldOptions($rows),
            'isAdmin' => auth()->user()?->hasAnyRole(['admin', 'super-admin']) ?? false,
        ]);
    }

    /**
     * Nilai unik per kolom, dipakai sebagai daftar saran autocomplete pada
     * form tambah/edit — supaya pengguna bisa memilih teks yang sudah ada
     * alih-alih mengetik ulang variasi yang berbeda.
     */
    private function distinctFieldOptions($rows): array
    {
        $options = [];
        foreach (self::FIELDS as $field) {
            $options[$field] = $rows
                ->pluck($field)
                ->map(fn ($v) => $this->removeLabel((string) $v))
                ->filter(fn ($v) => $v !== '' && $v !== 'Tidak Ada Data')
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
        // Program adalah unit terkecil hierarki (1 baris tabel = 1 Program),
        // jadi wajib diisi agar tidak muncul node kosong tanpa label di tree.
        $rules['PROGRAM PRIORITAS'] = ['required', 'string'];
        $rules['OPD PENANGGUNGJAWAB PROGRAM'] = ['required', 'string'];
        $attributes['OPD PENANGGUNGJAWAB PROGRAM'] = 'OPD Penanggung Jawab Program';

        return $request->validate($rules, [], $attributes);
    }

    /**
     * Mengisi kolom kosong dengan "Tidak Ada Data", meniru FillBlanks pada
     * VBA: hanya kolom yang berada di antara kolom pertama dan kolom terakhir
     * yang terisi (mengikuti urutan FIELDS, setara kolom B..T di Excel) yang
     * diisi — kolom sebelum data pertama tetap dibiarkan kosong.
     */
    private function fillBlanks(array $data): array
    {
        $firstFilled = null;
        $lastFilled = null;
        foreach (self::FIELDS as $index => $field) {
            if (trim((string) ($data[$field] ?? '')) !== '') {
                $firstFilled ??= $index;
                $lastFilled = $index;
            }
        }

        if ($firstFilled === null) {
            return $data;
        }

        foreach (self::FIELDS as $index => $field) {
            if ($index < $firstFilled) {
                continue;
            }
            if (trim((string) ($data[$field] ?? '')) === '') {
                $data[$field] = 'Tidak Ada Data';
            }
        }

        return $data;
    }

    /**
     * KRS_Pemda (I_a) lintas-OPD/RPJMD — bukan milik satu PIC, jadi
     * dibatasi per-ROLE (admin/super-admin saja), bukan row-level seperti
     * IRS_Pemda/KRS_PD/IRS_PD/KRO_PD/IRO_PD (lihat RiskOwnershipPolicy).
     */
    private function ensureCanManage(Request $request): void
    {
        if (!$request->user()->hasAnyRole(['admin', 'super-admin'])) {
            abort(403, 'Hanya Admin/Super Admin yang dapat mengelola data Risiko Strategis Pemda.');
        }
    }

    public function store(Request $request, KrsIrsSyncService $sync)
    {
        $this->ensureCanManage($request);

        $data = $this->fillBlanks($this->validated($request));
        KrsPemda::create($data);
        $sync->sync();

        return redirect()->route('krs_pemda.index')->with('success', 'Data berhasil ditambahkan.');
    }

    public function update(Request $request, KrsPemda $krs_pemda, KrsIrsSyncService $sync)
    {
        $this->ensureCanManage($request);

        $data = $this->fillBlanks($this->validated($request));
        $krs_pemda->update($data);
        $sync->sync();

        return redirect()->route('krs_pemda.index')->with('success', 'Data berhasil diperbarui.');
    }

    /**
     * Kolom yang "dimiliki" tiap level non-leaf. Meng-edit sebuah node hanya
     * mengubah kolom-kolom ini di SELURUH baris yang membentuk node tsb —
     * kolom level lain (parent & anak) tidak disentuh.
     */
    private const NODE_LEVEL_FIELDS = [
        'visi' => ['VISI'],
        'misi' => ['MISI'],
        'tujuan' => [
            'TUJUAN RPJMD', 'IK TUJUAN RPJMD', 'BASELINE IK TUJUAN RPJMD',
            'TARGET IK TUJUAN RPJMD', 'SATUAN IK TUJUAN RPJMD', 'OPD IK TUJUAN RPJMD',
        ],
        'sasaran' => [
            'SASARAN RPJMD', 'IK SASARAN RPJMD', 'BASELINE IK SASARAN RPJMD',
            'TARGET IK SASARAN RPJMD', 'SATUAN IK SASARAN RPJMD', 'OPD IK SASARAN RPJMD',
        ],
    ];

    /**
     * Kolom rantai-atas yang dipakai untuk MENGIDENTIFIKASI baris milik sebuah
     * node (dicocokkan dengan nilai LAMA yang dikirim dari tree). Sengaja
     * memakai teks node itu sendiri + seluruh ancestornya agar tidak keliru
     * mengubah node lain yang kebetulan bertuliskan sama di cabang berbeda.
     */
    private const NODE_MATCH_FIELDS = [
        'visi' => ['VISI'],
        'misi' => ['VISI', 'MISI'],
        'tujuan' => ['VISI', 'MISI', 'TUJUAN RPJMD'],
        'sasaran' => ['VISI', 'MISI', 'TUJUAN RPJMD', 'SASARAN RPJMD'],
    ];

    /**
     * Meng-edit SATU node non-leaf (Visi/Misi/Tujuan/Sasaran) secara utuh:
     * karena tabel ini flat (1 baris = 1 program, kolom level atas DIULANG di
     * tiap baris di bawahnya), meng-update hanya satu baris akan memecah node
     * jadi dua di tree. Method ini mencari SEMUA baris yang membentuk node
     * (cocok pada teks node + seluruh ancestornya) lalu meng-update kolom milik
     * level itu di semua baris tersebut sekaligus.
     */
    public function updateNode(Request $request, KrsIrsSyncService $sync)
    {
        $this->ensureCanManage($request);

        $level = (string) $request->input('level');
        if (!isset(self::NODE_LEVEL_FIELDS[$level])) {
            abort(422, 'Level node tidak dikenal.');
        }

        $match = (array) $request->input('match', []);   // nilai LAMA per kolom identifikasi
        $values = (array) $request->input('values', []); // nilai BARU per kolom level

        // Nilai level baru wajib ada (kolom utama level tidak boleh kosong,
        // mis. teks Sasaran) supaya node tidak jadi tak berlabel.
        $primaryField = self::NODE_LEVEL_FIELDS[$level][0];
        if (trim((string) ($values[$primaryField] ?? '')) === '') {
            return back()->withErrors([$primaryField => "{$primaryField} tidak boleh kosong."]);
        }

        // Cari baris yang cocok: bandingkan nilai TER-NORMALISASI (removeLabel)
        // dengan nilai lama yang dikirim tree — tree memang mengirim teks yang
        // sudah bersih label, jadi harus disamakan di kedua sisi.
        $matchFields = self::NODE_MATCH_FIELDS[$level];
        $rows = KrsPemda::orderBy('id')->get()->filter(function ($row) use ($matchFields, $match) {
            foreach ($matchFields as $f) {
                if ($this->removeLabel((string) $row->{$f}) !== $this->removeLabel((string) ($match[$f] ?? ''))) {
                    return false;
                }
            }
            return true;
        });

        if ($rows->isEmpty()) {
            return back()->withErrors(['node' => 'Node tidak ditemukan (mungkin sudah berubah). Muat ulang halaman.']);
        }

        // Hanya kolom milik level ini yang di-update — di semua baris node.
        $update = [];
        foreach (self::NODE_LEVEL_FIELDS[$level] as $f) {
            $update[$f] = trim((string) ($values[$f] ?? ''));
        }

        foreach ($rows as $row) {
            $row->update($update);
        }
        $sync->sync();

        return redirect()->route('krs_pemda.index')->with('success', 'Node berhasil diperbarui.');
    }

    /**
     * Menghapus SATU node non-leaf (Visi/Misi/Tujuan/Sasaran) beserta SELURUH
     * baris/anak di bawahnya — kebalikan updateNode. Karena tabel flat, satu
     * node non-leaf tersusun dari banyak baris; semua baris yang cocok pada
     * teks node + ancestornya dihapus sekaligus.
     */
    public function deleteNode(Request $request, KrsIrsSyncService $sync)
    {
        $this->ensureCanManage($request);

        $level = (string) $request->input('level');
        if (!isset(self::NODE_MATCH_FIELDS[$level])) {
            abort(422, 'Level node tidak dikenal.');
        }

        $match = (array) $request->input('match', []);
        $matchFields = self::NODE_MATCH_FIELDS[$level];
        $rows = KrsPemda::orderBy('id')->get()->filter(function ($row) use ($matchFields, $match) {
            foreach ($matchFields as $f) {
                if ($this->removeLabel((string) $row->{$f}) !== $this->removeLabel((string) ($match[$f] ?? ''))) {
                    return false;
                }
            }
            return true;
        });

        if ($rows->isEmpty()) {
            return back()->withErrors(['node' => 'Node tidak ditemukan (mungkin sudah berubah). Muat ulang halaman.']);
        }

        // Satu batch UUID untuk seluruh baris → bisa dipulihkan sekelompok.
        $batch = (string) Str::uuid();
        foreach ($rows as $row) {
            $row->forceFill(['delete_batch' => $batch])->save();
            $row->delete();
        }
        $sync->sync();

        return redirect()->route('krs_pemda.index')->with('success', 'Node beserta seluruh isinya berhasil dihapus.');
    }

    public function destroy(Request $request, KrsPemda $krs_pemda, KrsIrsSyncService $sync)
    {
        $this->ensureCanManage($request);

        $krs_pemda->delete();
        $sync->sync();

        return redirect()->route('krs_pemda.index')->with('success', 'Data berhasil dihapus.');
    }
}
