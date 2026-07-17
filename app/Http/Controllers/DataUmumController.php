<?php

namespace App\Http\Controllers;

use App\Models\DataUmum;
use App\Models\Opd;
use App\Models\PengaturanPemda;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Data Umum per-PIC (per-OPD): header identitas + penanda tangan dinamis untuk
 * kebutuhan Form Cetak. PIC biasa mengelola SATU Data Umum miliknya sendiri
 * (create-or-update by user_id) — Admin/Super Admin BISA memilih OPD mana pun
 * lewat picker "OPD / Urusan yang Dinilai" (sama pola dgn CEE Form 1a/1b/1c)
 * utk override data yg sudah ada ATAU mengisi field yg blm terisi sama
 * sekali milik OPD manapun, bukan cuma milik akunnya sendiri.
 */
class DataUmumController extends Controller
{
    /** Kolom identitas (di luar penandatangan) — dipakai validasi & simpan. */
    private const FIELDS = [
        'pemerintah_kabkota',
        'nama_urusan',
        'nama_sub_urusan',
        'nama_dinas_opd',
        'periode_penilaian',
        'nama_kepala_daerah',
        'jabatan_kepala_daerah',
        'nama_kepala_dinas',
        'jabatan_kepala_dinas',
        'nip_kepala_dinas',
        'nama_pic',
        'jabatan_pic',
        'nip_pic',
        'dokumen_sumber_rsp',
        'dokumen_sumber_rso',
        'dokumen_sumber_roo',
        'tempat_pembuatan',
        'tanggal_pembuatan',
    ];

    /**
     * Field yg nilainya Pemda-wide (sama utk semua OPD) — jika kosong pada
     * baris Data Umum milik user, fallback ke PengaturanPemda (default
     * global). Hanya Admin/Super Admin yang boleh mengubah default ini
     * (lihat store()).
     */
    private const PEMDA_WIDE_FIELDS = [
        'pemerintah_kabkota',
        'periode_penilaian',
        'nama_kepala_daerah',
        'jabatan_kepala_daerah',
        'dokumen_sumber_rsp',
        'dokumen_sumber_rso',
        'dokumen_sumber_roo',
    ];

    /**
     * User target Data Umum yg dikelola halaman ini — PIC biasa SELALU
     * akunnya sendiri (tidak bisa memilih OPD lain, $opdId param diabaikan).
     * Admin/Super Admin BOLEH memilih OPD manapun lewat picker; kalau belum
     * memilih ($opdId null), tampilkan state kosong (form belum aktif) —
     * BUKAN diam2 jatuh ke akun Admin sendiri (Admin lazimnya tidak py
     * opd_id/Data Umum yg relevan utk dicetak).
     */
    private function targetUser(Request $request, ?int $opdId): ?User
    {
        $isAdmin = $request->user()->hasAnyRole(['admin', 'super-admin']);
        if (!$isAdmin) {
            return $request->user();
        }

        if (!$opdId) {
            return null;
        }

        return User::where('opd_id', $opdId)->first();
    }

    public function index(Request $request)
    {
        $default = PengaturanPemda::current();
        $tahun = $request->integer('tahun') ?: (int) $default->tahun_penilaian;
        $isAdmin = $request->user()->hasAnyRole(['admin', 'super-admin']);
        $opdId = $isAdmin ? $request->integer('opd_id') : $request->user()->opd_id;

        $targetUser = $this->targetUser($request, $opdId);
        $data = $targetUser
            ? DataUmum::firstOrNew(['user_id' => $targetUser->id, 'tahun_penilaian' => (string) $tahun])
            : new DataUmum();

        return Inertia::render('datumum/Index', [
            'isAdmin' => $isAdmin,
            // Picker OPD hanya relevan/dikirim utk Admin/Super Admin — PIC
            // biasa tidak perlu memilih apa pun (selalu OPD-nya sendiri).
            'opdOptions' => $isAdmin ? Opd::orderBy('nama')->get(['id', 'nama']) : [],
            'opdId' => $isAdmin ? $opdId : null,
            'tahunAktif' => $default->tahun_penilaian,
            'tahun' => $tahun,
            // Admin blm memilih OPD sama sekali (beda dari "OPD dipilih tapi
            // belum py user/PIC terdaftar", lihat targetUserBelumAda).
            'belumPilihOpd' => $isAdmin && !$opdId,
            'targetUserBelumAda' => $isAdmin && $opdId && !$targetUser,
            // Baris utk tahun terpilih blm pernah diisi ($data->exists false)
            // — beda dari "form kosong krn field2nya memang belum diisi",
            // dipakai frontend utk tampilkan banner "belum ada data utk
            // tahun ini" (BUKAN diam2 fallback ke data tahun lain).
            'belumAdaData' => !$data->exists,
            'data' => [
                ...collect(self::FIELDS)->mapWithKeys(function ($f) use ($data, $default) {
                    if ($f === 'tanggal_pembuatan') {
                        return [$f => optional($data->tanggal_pembuatan)->format('Y-m-d')];
                    }

                    $value = $data->{$f} ?? '';
                    if ($value === '' && in_array($f, self::PEMDA_WIDE_FIELDS, true)) {
                        $value = $default->{$f} ?? '';
                    }

                    return [$f => $value];
                })->all(),
                'penandatangan' => $data->penandatangan ?? [],
            ],
        ]);
    }

    public function store(Request $request)
    {
        // Akun bersama CEE_Survey (role 'cee-survey') dipakai bergantian
        // lintas OPD — Data Umum (identitas & penandatangan per-OPD) hanya
        // boleh diisi/diubah oleh PIC pemilik OPD tsb, Admin, atau Super Admin.
        if ($request->user()->hasRole('cee-survey')) {
            abort(403, 'Akun survei CEE tidak dapat mengubah Data Umum. Hubungi PIC OPD, Admin, atau Super Admin.');
        }

        $isAdmin = $request->user()->hasAnyRole(['admin', 'super-admin']);
        // Tahun & opd_id HANYA dari query string (?tahun=&opd_id=), sama
        // pola dgn seluruh halaman Form Cetak/CEE — BUKAN dari body form
        // (field ini bukan bagian FIELDS/rules yg bisa dioprek user, treat
        // spt user_id: di-set programatik dari picker di halaman, bukan
        // input form biasa). opd_id HANYA berlaku utk Admin/Super Admin —
        // PIC biasa selalu menyimpan ke akunnya sendiri, tidak bisa memilih
        // OPD lain lewat query string manapun.
        $tahun = $request->integer('tahun') ?: (int) PengaturanPemda::current()->tahun_penilaian;
        $opdId = $isAdmin ? $request->integer('opd_id') : null;

        $targetUser = $this->targetUser($request, $opdId);
        if ($isAdmin && !$targetUser) {
            abort(404, $opdId
                ? 'OPD terpilih belum memiliki akun PIC terdaftar — tidak ada Data Umum yang bisa diisi/diubah.'
                : 'Pilih OPD terlebih dahulu.');
        }

        $rules = [];
        foreach (self::FIELDS as $f) {
            $rules[$f] = ['nullable', 'string', 'max:255'];
        }
        $rules['tanggal_pembuatan'] = ['nullable', 'date'];
        // Penanda tangan: array baris {jabatan, nama, nip}.
        $rules['penandatangan'] = ['nullable', 'array'];
        $rules['penandatangan.*.jabatan'] = ['nullable', 'string', 'max:255'];
        $rules['penandatangan.*.nama'] = ['nullable', 'string', 'max:255'];
        $rules['penandatangan.*.nip'] = ['nullable', 'string', 'max:100'];

        $validated = $request->validate($rules);

        // Buang baris penanda tangan yang benar-benar kosong.
        $penandatangan = collect($validated['penandatangan'] ?? [])
            ->map(fn ($p) => [
                'jabatan' => trim((string) ($p['jabatan'] ?? '')),
                'nama' => trim((string) ($p['nama'] ?? '')),
                'nip' => trim((string) ($p['nip'] ?? '')),
            ])
            ->filter(fn ($p) => $p['jabatan'] !== '' || $p['nama'] !== '' || $p['nip'] !== '')
            ->values()
            ->all();

        $payload = collect(self::FIELDS)->mapWithKeys(fn ($f) => [$f => $validated[$f] ?? null])->all();
        $payload['penandatangan'] = $penandatangan;

        DataUmum::updateOrCreate(['user_id' => $targetUser->id, 'tahun_penilaian' => (string) $tahun], $payload);

        // Field Pemda-wide (Nama Pemda, Periode, Tahun, Kepala Daerah, Sumber
        // Dokumen) hanya boleh MENGUBAH DEFAULT GLOBAL bila yg menyimpan
        // Admin/Super Admin — PIC biasa tetap bisa mengisi field ini di baris
        // miliknya sendiri (utk cetak), tapi tidak memengaruhi default OPD lain.
        if ($isAdmin) {
            $defaultPayload = collect(self::PEMDA_WIDE_FIELDS)
                ->mapWithKeys(fn ($f) => [$f => $validated[$f] ?? null])
                ->filter(fn ($v) => $v !== null && $v !== '')
                ->all();

            if (!empty($defaultPayload)) {
                $default = PengaturanPemda::current();
                $default->update($defaultPayload);
            }
        }

        return back()->with('success', 'Data Umum berhasil disimpan.');
    }

    /**
     * Update HANYA kolom penandatangan[] milik satu DataUmum — dipakai oleh
     * editor ringkas di Form Cetak 6/7 (MultiPenandatanganEditor) supaya PIC/
     * Admin bisa mengubah Sekretaris/Kepala Bidang dkk LANGSUNG dari halaman
     * cetak tanpa pindah ke menu Data Umum, dua arah dgn field lengkap di
     * sana (baris yg sama, disimpan permanen ke tabel data_umum) — sama
     * filosofi dgn CetakRisikoController::updateTtd() (kolom kepala), tapi
     * utk kolom "tengah" (array) yg tidak dicakup endpoint itu.
     */
    public function updatePenandatangan(Request $request, DataUmum $dataUmum)
    {
        $user = $request->user();
        $isAdmin = $user->hasAnyRole(['admin', 'super-admin']);
        $sameOpd = $user->opd_id && $dataUmum->user?->opd_id === $user->opd_id;

        if (!$isAdmin && $dataUmum->user_id !== $user->id && !$sameOpd) {
            abort(403, 'Anda tidak memiliki akses untuk mengubah penanda tangan ini.');
        }

        $validated = $request->validate([
            'penandatangan' => ['nullable', 'array'],
            'penandatangan.*.jabatan' => ['nullable', 'string', 'max:255'],
            'penandatangan.*.nama' => ['nullable', 'string', 'max:255'],
            'penandatangan.*.nip' => ['nullable', 'string', 'max:100'],
        ]);

        $penandatangan = collect($validated['penandatangan'] ?? [])
            ->map(fn ($p) => [
                'jabatan' => trim((string) ($p['jabatan'] ?? '')),
                'nama' => trim((string) ($p['nama'] ?? '')),
                'nip' => trim((string) ($p['nip'] ?? '')),
            ])
            ->filter(fn ($p) => $p['jabatan'] !== '' || $p['nama'] !== '' || $p['nip'] !== '')
            ->values()
            ->all();

        $dataUmum->update(['penandatangan' => $penandatangan]);

        return back()->with('success', 'Penanda tangan berhasil disimpan.');
    }
}
