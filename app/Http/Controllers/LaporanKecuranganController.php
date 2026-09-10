<?php

namespace App\Http\Controllers;

use App\Models\FraudRisiko;
use App\Models\LaporanKecurangan;
use App\Models\Opd;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

/**
 * Lapor Dugaan Kecurangan — pintu masuk publik MR Fraud, dan rekapnya.
 *
 * Dasar: Perdep BPKP Bidang Investigasi No. 1 Tahun 2019 dan Perbup Aceh Barat
 * No. 6 Tahun 2025 tentang Pengendalian Kecurangan.
 *
 * Formulirnya sendiri berada di tab kedua halaman /lapor-kejadian — satu kode
 * QR untuk dua jenis laporan. Yang ada di sini hanya penerimaannya dan rekap
 * tindak lanjutnya.
 */
class LaporanKecuranganController extends Controller
{
    /**
     * Menerima laporan dari publik.
     *
     * Dipanggil lewat akun bersama LAPOR (QR code), jadi `dilaporkan_oleh_user_id`
     * TIDAK menunjukkan identitas pelapor — ia hanya jejak akun yang dipakai
     * mengirim. Identitas pelapor yang sesungguhnya ada di kolom terpisah, dan
     * boleh kosong.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'anonim' => ['boolean'],
            'nama_pelapor' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'no_hp' => ['nullable', 'string', 'max:255'],

            'opd_id' => ['nullable', 'exists:opd,id'],
            'tahapan_proses' => ['nullable', Rule::in(FraudRisiko::TAHAPAN)],
            'dugaan_kelompok' => ['nullable', 'array'],
            'dugaan_kelompok.*' => [Rule::in(FraudRisiko::KELOMPOK_RISIKO)],

            'uraian_kejadian' => ['required', 'string'],
            'tempat' => ['nullable', 'string', 'max:255'],
            'waktu_kejadian' => ['nullable', 'date'],
            'pihak_terlibat' => ['nullable', 'string'],
            'kronologi' => ['nullable', 'string'],
            'perkiraan_kerugian' => ['nullable', 'string', 'max:255'],
            'bukti_keterangan' => ['nullable', 'string'],
        ]);

        // Laporan anonim tidak MENYIMPAN identitas, bukan sekadar tidak
        // menampilkannya. Peramban yang mengirim nama meski kotak anonim
        // dicentang — karena salah urutan, atau karena sengaja — tidak boleh
        // membuat identitas itu tersimpan diam-diam.
        if ($data['anonim'] ?? false) {
            $data['nama_pelapor'] = null;
            $data['email'] = null;
            $data['no_hp'] = null;
        }

        $data['status'] = 'baru';
        $data['dilaporkan_oleh_user_id'] = auth()->id();

        LaporanKecurangan::create($data);

        return back()->with('success', 'Laporan dugaan kecurangan terkirim.');
    }

    /** Rekap Lapor Kejadian Fraud — submenu MR Fraud. */
    public function index(Request $request)
    {
        $this->pastikanBolehMengelola();

        $status = trim((string) $request->query('status', ''));

        $laporan = LaporanKecurangan::query()
            ->with(['opd:id,nama', 'penindaklanjut:id,name', 'fraudRisiko:id,nama_risiko'])
            ->when($status !== '', fn ($q) => $q->where('status', $status))
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (LaporanKecurangan $l) => [
                'id' => $l->id,
                'anonim' => $l->anonim,
                'pelapor' => $l->pelapor,
                'email' => $l->email,
                'no_hp' => $l->no_hp,
                'opd_nama' => $l->opd?->nama,
                'tahapan_proses' => $l->tahapan_proses,
                'dugaan_kelompok' => $l->dugaan_kelompok ?? [],
                'uraian_kejadian' => $l->uraian_kejadian,
                'tempat' => $l->tempat,
                'waktu_kejadian' => $l->waktu_kejadian?->toDateString(),
                'pihak_terlibat' => $l->pihak_terlibat,
                'kronologi' => $l->kronologi,
                'perkiraan_kerugian' => $l->perkiraan_kerugian,
                'bukti_keterangan' => $l->bukti_keterangan,
                'status' => $l->status,
                'catatan_tindak_lanjut' => $l->catatan_tindak_lanjut,
                'penindaklanjut' => $l->penindaklanjut?->name,
                'risiko_terdaftar' => $l->fraudRisiko?->nama_risiko,
                'dilaporkan_pada' => $l->created_at?->toDateTimeString(),
            ]);

        return Inertia::render('fraud/RekapLapor', [
            'laporan' => $laporan,
            'statuses' => LaporanKecurangan::STATUS,
            'statusTerpilih' => $status,
            'opdList' => Opd::orderBy('nama')->get(['id', 'nama']),
        ]);
    }

    public function updateStatus(Request $request, LaporanKecurangan $laporanKecurangan)
    {
        $this->pastikanBolehMengelola();

        $data = $request->validate([
            'status' => ['required', Rule::in(LaporanKecurangan::STATUS)],
            'catatan_tindak_lanjut' => ['nullable', 'string'],
            'fraud_risiko_id' => ['nullable', 'exists:fraud_risiko,id'],
        ]);

        $data['ditindaklanjuti_oleh'] = auth()->id();
        $data['ditindaklanjuti_at'] = now();

        $laporanKecurangan->update($data);

        return back()->with('success', 'Status laporan diperbarui.');
    }

    public function destroy(LaporanKecurangan $laporanKecurangan)
    {
        $this->pastikanBolehMengelola();

        $laporanKecurangan->delete();

        return back()->with('success', 'Laporan dihapus.');
    }

    /**
     * Rekap hanya untuk pengelola, BUKAN untuk akun bersama LAPOR.
     *
     * Akun itu dipegang publik lewat QR code. Kalau ia bisa membuka rekap,
     * siapa pun yang memindai QR bisa membaca seluruh laporan kecurangan
     * beserta identitas pelapornya — persis kebalikan dari tujuan formulir ini.
     */
    private function pastikanBolehMengelola(): void
    {
        abort_unless(auth()->user()?->canViewAllOpd() ?? false, 403);
    }
}
