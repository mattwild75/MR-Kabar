<?php

namespace App\Http\Controllers;

use App\Models\FraudRisiko;
use App\Models\LaporanKecurangan;
use App\Models\Opd;
use App\Models\PesanLaporanKecurangan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Symfony\Component\HttpFoundation\StreamedResponse;

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
     * Aturan berkas bukti, sama dengan bukti dukung risiko: gambar dan PDF
     * saja, 10 MB per berkas.
     *
     * Dibatasi lima berkas karena formulir ini terbuka untuk publik lewat akun
     * bersama — tanpa batas, satu kiriman bisa mengisi cakram server.
     */
    private const ATURAN_BUKTI = [
        'bukti' => ['nullable', 'array', 'max:5'],
        'bukti.*' => ['file', 'max:10240', 'mimes:jpg,jpeg,png,pdf'],
    ];

    /** Melampirkan berkas bukti ke laporan (bukan ke akun pengunggah). */
    private function lampirkanBukti(Request $request, LaporanKecurangan $laporan): void
    {
        foreach ((array) $request->file('bukti', []) as $berkas) {
            $laporan->addMedia($berkas)->toMediaCollection(LaporanKecurangan::KOLEKSI_BUKTI);
        }
    }

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
            'mode_pelapor' => ['required', Rule::in(LaporanKecurangan::MODE)],
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
        ] + self::ATURAN_BUKTI);

        // Berkas tidak masuk kolom tabel; ia dilampirkan setelah barisnya ada.
        unset($data['bukti']);

        // Nama TIDAK PERNAH disimpan pada kedua mode anonim, dan pembersihan
        // ini dilakukan di server — bukan dengan mengandalkan peramban
        // mengosongkannya. Kiriman yang tetap menyertakan nama, entah karena
        // salah urutan atau disengaja, tidak boleh membuatnya tersimpan.
        if ($data['mode_pelapor'] !== LaporanKecurangan::MODE_TERBUKA) {
            $data['nama_pelapor'] = null;
        }

        // Pada anonim penuh, kanal kontaknya pun tidak disimpan. Yang tersisa
        // hanya tiket.
        if ($data['mode_pelapor'] === LaporanKecurangan::MODE_ANONIM_PENUH) {
            $data['email'] = null;
            $data['no_hp'] = null;
        }

        // Kode akses hanya muncul di layar SEKALI, dan yang tersimpan hashnya.
        // Kalau tersimpan apa adanya, siapa pun yang bisa membaca basis data
        // bisa membuka utas pelapor mana pun dan menyamar sebagai dirinya.
        $kode = strtoupper(Str::random(8));

        $data['nomor_tiket'] = $this->nomorTiketBaru();
        $data['kode_akses_hash'] = Hash::make($kode);
        $data['status'] = 'baru';
        $data['dilaporkan_oleh_user_id'] = auth()->id();

        $laporan = LaporanKecurangan::create($data);

        $this->lampirkanBukti($request, $laporan);

        // Dititipkan ke sesi sekali jalan: pelapor harus menyalinnya sekarang,
        // karena tidak ada cara memulihkannya nanti.
        return back()->with('tiketBaru', [
            'nomor_tiket' => $data['nomor_tiket'],
            'kode_akses' => $kode,
        ]);
    }

    /**
     * Nomor tiket berurut per tahun, mis. FRA-2026-0007.
     *
     * Sengaja berurut dan mudah dibacakan lewat telepon, bukan acak panjang:
     * kerahasiaannya dijaga kode akses, bukan oleh nomor tiketnya. Nomor yang
     * sulit dieja justru membuat pelapor salah menyalin.
     */
    private function nomorTiketBaru(): string
    {
        $tahun = now()->year;

        $urut = LaporanKecurangan::withTrashed()
            ->where('nomor_tiket', 'like', "FRA-{$tahun}-%")
            ->count() + 1;

        return sprintf('FRA-%d-%04d', $tahun, $urut);
    }

    /**
     * Halaman publik "Cek Status Laporan".
     *
     * Inilah yang membuat laporan anonim tidak putus: pelapor kembali dengan
     * nomor tiket dan kode aksesnya, membaca perkembangan, dan MENJAWAB
     * pertanyaan penindaklanjut — tanpa pernah menyebut siapa dirinya.
     */
    public function cekStatus(Request $request)
    {
        $data = $request->validate([
            'nomor_tiket' => ['required', 'string'],
            'kode_akses' => ['required', 'string'],
        ]);

        $laporan = LaporanKecurangan::with('pesan')
            ->where('nomor_tiket', trim($data['nomor_tiket']))
            ->first();

        // Satu pesan galat untuk dua sebab berbeda (tiketnya tidak ada, atau
        // kodenya salah) — supaya tidak bisa dipakai menebak tiket mana yang
        // benar-benar ada.
        if (! $laporan || ! Hash::check($data['kode_akses'], (string) $laporan->kode_akses_hash)) {
            return back()->withErrors(['nomor_tiket' => 'Nomor tiket atau kode akses tidak cocok.']);
        }

        return back()->with('hasilTiket', [
            'nomor_tiket' => $laporan->nomor_tiket,
            'status' => $laporan->status,
            'uraian_kejadian' => $laporan->uraian_kejadian,
            'dilaporkan_pada' => $laporan->created_at?->toDateTimeString(),
            'catatan_tindak_lanjut' => $laporan->catatan_tindak_lanjut,
            'bukti' => $laporan->daftarBukti(),
            'pesan' => $laporan->pesan->map(fn (PesanLaporanKecurangan $p) => [
                'dari' => $p->dari,
                'isi' => $p->isi,
                'pada' => $p->created_at?->toDateTimeString(),
            ])->all(),
        ]);
    }

    /** Balasan pelapor pada utas, dibuka dengan tiket + kode akses. */
    public function balasTiket(Request $request)
    {
        $data = $request->validate([
            'nomor_tiket' => ['required', 'string'],
            'kode_akses' => ['required', 'string'],
            'isi' => ['required', 'string'],
        ] + self::ATURAN_BUKTI);

        $laporan = LaporanKecurangan::where('nomor_tiket', trim($data['nomor_tiket']))->first();

        if (! $laporan || ! Hash::check($data['kode_akses'], (string) $laporan->kode_akses_hash)) {
            return back()->withErrors(['nomor_tiket' => 'Nomor tiket atau kode akses tidak cocok.']);
        }

        // user_id sengaja TIDAK diisi. Akun yang sedang dipakai adalah akun
        // bersama LAPOR, dan mencatatnya di sini hanya menautkan pesan pelapor
        // ke sebuah akun tanpa menambah keterangan yang berguna.
        $laporan->pesan()->create([
            'dari' => PesanLaporanKecurangan::DARI_PELAPOR,
            'isi' => $data['isi'],
        ]);

        // Penindaklanjut sering baru meminta bukti SESUDAH membaca laporannya.
        // Tanpa ini, pelapor anonim tidak punya cara menyerahkannya sama sekali.
        $this->lampirkanBukti($request, $laporan);

        return back()->with('success', 'Jawaban Anda terkirim.');
    }

    /** Pertanyaan penindaklanjut pada utas. */
    public function tanya(Request $request, LaporanKecurangan $laporanKecurangan)
    {
        $this->pastikanBolehMengelola();

        $data = $request->validate(['isi' => ['required', 'string']]);

        $laporanKecurangan->pesan()->create([
            'dari' => PesanLaporanKecurangan::DARI_PENINDAKLANJUT,
            'user_id' => auth()->id(),
            'isi' => $data['isi'],
        ]);

        return back()->with('success', 'Pertanyaan terkirim ke utas laporan.');
    }

    /**
     * Mengunduh satu berkas bukti.
     *
     * HANYA penindaklanjut. Berkasnya diunggah lewat akun bersama LAPOR yang
     * kredensialnya dipegang publik — kalau akun itu bisa mengunduh, siapa pun
     * yang memindai QR bisa membaca bukti milik pelapor lain.
     *
     * Berkas dialirkan dari disk privat, bukan ditautkan langsung: disk `local`
     * memang tidak ter-mount ke /storage publik, dan itu yang membuat tautan
     * tebakan tidak berguna.
     */
    public function unduhBukti(LaporanKecurangan $laporanKecurangan, Media $media): StreamedResponse
    {
        $this->pastikanBolehMengelola();

        // Media harus benar-benar milik laporan ini. Tanpa pemeriksaan ini,
        // nomor media dari laporan lain bisa dipasangkan ke laporan mana pun.
        abort_unless(
            $media->model_type === LaporanKecurangan::class && (int) $media->model_id === $laporanKecurangan->id,
            404
        );

        return $media->toResponse(request());
    }

    /** Rekap Lapor Kejadian Fraud — submenu MR Fraud. */
    public function index(Request $request)
    {
        $this->pastikanBolehMengelola();

        $status = trim((string) $request->query('status', ''));

        $laporan = LaporanKecurangan::query()
            ->with(['opd:id,nama', 'penindaklanjut:id,name', 'fraudRisiko:id,nama_risiko', 'pesan'])
            ->when($status !== '', fn ($q) => $q->where('status', $status))
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (LaporanKecurangan $l) => [
                'id' => $l->id,
                'nomor_tiket' => $l->nomor_tiket,
                'mode_pelapor' => $l->mode_pelapor,
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
                'bukti' => $l->daftarBukti(),
                'status' => $l->status,
                'catatan_tindak_lanjut' => $l->catatan_tindak_lanjut,
                'penindaklanjut' => $l->penindaklanjut?->name,
                'risiko_terdaftar' => $l->fraudRisiko?->nama_risiko,
                'dilaporkan_pada' => $l->created_at?->toDateTimeString(),
                'pesan' => $l->pesan->map(fn (PesanLaporanKecurangan $p) => [
                    'dari' => $p->dari,
                    'isi' => $p->isi,
                    'pada' => $p->created_at?->toDateTimeString(),
                ])->all(),
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
