<?php

namespace App\Http\Controllers;

use App\Models\DataUmum;
use App\Models\PengaturanPemda;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Data Umum per-PIC (per-OPD): header identitas + penanda tangan dinamis untuk
 * kebutuhan Form Cetak. Tiap user mengelola SATU Data Umum miliknya sendiri
 * (create-or-update by user_id).
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

    public function index(Request $request)
    {
        $data = DataUmum::firstOrNew(['user_id' => $request->user()->id]);
        $default = PengaturanPemda::current();
        $isAdmin = $request->user()->hasAnyRole(['admin', 'super-admin']);

        return Inertia::render('datumum/Index', [
            'isAdmin' => $isAdmin,
            'tahunAktif' => $default->tahun_penilaian,
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

        DataUmum::updateOrCreate(['user_id' => $request->user()->id], $payload);

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
}
