<?php

namespace App\Http\Controllers;

use App\Models\IroPd;
use App\Models\IrsPd;
use App\Models\IrsPemda;
use App\Models\LaporanKejadianRisiko;
use App\Models\Opd;
use App\Models\PencatatanKejadianRisiko;
use App\Models\User;
use App\Notifications\LaporanKejadianRisikoStatusChanged;
use App\Notifications\LaporanKejadianRisikoSubmitted;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class LaporanKejadianController extends Controller
{
    /** Map tipe risiko terdaftar -> model, dipakai form pencarian & risikoTerdaftar(). */
    private const RISIKO_MODELS = [
        'irs_pemda' => IrsPemda::class,
        'irs_pd' => IrsPd::class,
        'iro_pd' => IroPd::class,
    ];

    /** Form lapor kejadian risiko — bisa diakses siapa pun yang login (termasuk akun bersama LAPOR). */
    public function create(Request $request)
    {
        return Inertia::render('lapor-kejadian/Form', [
            'opdList' => Opd::orderBy('nama')->get(['id', 'nama']),
        ]);
    }

    /**
     * Cari risiko terdaftar (IRS Pemda/PD, IRO PD) untuk mode "cek risiko
     * yang sudah terjadi" — dipakai combobox pencarian di form lapor.
     */
    public function searchRisiko(Request $request)
    {
        $query = $request->string('q')->toString();

        if (mb_strlen($query) < 2) {
            return response()->json([]);
        }

        $results = [];

        // Kata kunci dicocokkan ke Uraian Risiko, nama OPD (baik lewat
        // relasi user->opd — OPD PIC yg mengisi baris, paling andal — MAUPUN
        // kolom teks "UNIT/OPD PENANGGUNG JAWAB PENGENDALIAN" yg bisa
        // berbeda dari OPD pengisi, lihat catatan CetakHasilAnalisisController),
        // Pemilik Risiko, dan Penanggung Jawab Pengendalian — supaya
        // mengetik nama OPD/jabatan langsung memunculkan seluruh risiko yg
        // relevan tanpa perlu tahu kata kunci uraian risikonya persis.
        foreach (self::RISIKO_MODELS as $tipe => $modelClass) {
            $rows = $modelClass::where(function ($q) use ($query) {
                $q->where('URAIAN RISIKO', 'like', "%{$query}%")
                    ->orWhere('UNIT/OPD PENANGGUNG JAWAB PENGENDALIAN', 'like', "%{$query}%")
                    ->orWhere('PEMILIK RISIKO', 'like', "%{$query}%")
                    ->orWhere('PENANGGUNG JAWAB PENGENDALIAN', 'like', "%{$query}%")
                    ->orWhereHas('user.opd', fn ($uq) => $uq->where('nama', 'like', "%{$query}%"));
            })
                ->limit(10)
                ->get();

            foreach ($rows as $row) {
                $opdColumn = $tipe === 'iro_pd' ? 'KEGIATAN PD' : ($tipe === 'irs_pd' ? 'SASARAN RENSTRA' : 'SASARAN RPJMD');

                $results[] = [
                    'tipe' => $tipe,
                    'id' => $row->id,
                    'uraian_risiko' => $row->{'URAIAN RISIKO'},
                    'konteks' => $row->{$opdColumn},
                    'opd' => $row->{'UNIT/OPD PENANGGUNG JAWAB PENGENDALIAN'} ?? null,
                    'pemicu' => $row->{'URAIAN PENYEBAB RISIKO'} ?? null,
                ];
            }
        }

        return response()->json(array_slice($results, 0, 20));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_lengkap' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'no_hp' => ['nullable', 'string', 'max:30'],
            'opd_id' => ['nullable', 'exists:opd,id'],
            'kejadian' => ['required', 'string', 'max:5000'],
            'waktu_kejadian' => ['required', 'date'],
            'tempat' => ['nullable', 'string', 'max:255'],
            'pemicu' => ['nullable', 'string', 'max:2000'],
            'risiko_terdaftar_tipe' => ['nullable', Rule::in(array_keys(self::RISIKO_MODELS))],
            'risiko_terdaftar_id' => ['nullable', 'integer'],
        ]);

        $laporan = LaporanKejadianRisiko::create([
            ...$validated,
            'status' => 'baru',
            // Akun bersama LAPOR tidak merepresentasikan pelapor sesungguhnya
            // (identitas asli ada di field nama_lengkap/email/no_hp) — jadi
            // TIDAK dicatat sebagai dilaporkan_oleh_user_id, supaya notifikasi
            // status-changed tidak salah kirim balik ke akun bersama itu.
            'dilaporkan_oleh_user_id' => $request->user()->hasRole('lapor-risiko') ? null : $request->user()->id,
        ]);

        $penerima = User::role(['admin', 'super-admin'])->get();

        if ($laporan->opd_id) {
            $penerima = $penerima->merge(
                User::where('opd_id', $laporan->opd_id)->get()
            )->unique('id');
        }

        Notification::send($penerima, new LaporanKejadianRisikoSubmitted($laporan));

        return back()->with('success', 'Laporan kejadian risiko berhasil dikirim. Terima kasih.');
    }

    /**
     * Rekapan laporan — admin/super-admin lihat semua; PIC OPD hanya lihat
     * laporan yang opd_id-nya cocok dengan opd_id akun mereka sendiri.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $isAdminOrSuperAdmin = $user->hasAnyRole(['admin', 'super-admin']);

        if (!$isAdminOrSuperAdmin && !$user->opd_id) {
            throw new AccessDeniedHttpException('Rekapan laporan kejadian risiko hanya dapat diakses oleh Admin/Super Admin atau PIC OPD terkait.');
        }

        $query = LaporanKejadianRisiko::with(['opd', 'ditindaklanjutiOleh'])->latest();

        if (!$isAdminOrSuperAdmin) {
            $query->where('opd_id', $user->opd_id);
        }

        if ($status = $request->string('status')->toString()) {
            $query->where('status', $status);
        }

        if ($opdId = $request->input('opd_id')) {
            $query->where('opd_id', $opdId);
        }

        if ($search = $request->string('search')->toString()) {
            $query->where(function ($q) use ($search) {
                $q->where('nama_lengkap', 'like', "%{$search}%")
                    ->orWhere('kejadian', 'like', "%{$search}%")
                    ->orWhere('tempat', 'like', "%{$search}%");
            });
        }

        $laporan = $query->paginate(15)->withQueryString();

        // Batch-lookup risiko terdaftar per tipe (1 query per tipe yg
        // muncul di halaman ini, BUKAN 1 query per baris via
        // $l->risikoTerdaftar()) — halaman ini terpaginasi (maks 15
        // baris), tapi tetap sia-sia melakukan sampai 15 query terpisah
        // padahal cukup maks 3 (satu per tipe: irs_pemda/irs_pd/iro_pd).
        $idsByTipe = $laporan->getCollection()
            ->filter(fn (LaporanKejadianRisiko $l) => $l->risiko_terdaftar_tipe && $l->risiko_terdaftar_id)
            ->groupBy('risiko_terdaftar_tipe')
            ->map(fn ($rows) => $rows->pluck('risiko_terdaftar_id')->unique()->values());

        $risikoByTipe = $idsByTipe->map(function ($ids, $tipe) {
            $modelClass = self::RISIKO_MODELS[$tipe] ?? null;

            return $modelClass ? $modelClass::whereIn('id', $ids)->get()->keyBy('id') : collect();
        });

        // Batch-lookup jg utk "sudah dicatat ke Form 10?" — 1 query utk
        // SELURUH laporan di halaman ini (bukan N+1 exists() per baris),
        // dipakai frontend utk ganti label tombol "Catat ke Form 10" vs
        // "Lihat di Form 10" (lihat jembatan Lapor Risiko <-> Form 10).
        $laporanIdsSudahDicatat = PencatatanKejadianRisiko::whereIn('laporan_kejadian_id', $laporan->getCollection()->pluck('id'))
            ->pluck('laporan_kejadian_id')
            ->unique();

        $laporan->getCollection()->transform(function (LaporanKejadianRisiko $l) use ($risikoByTipe, $laporanIdsSudahDicatat) {
            $risikoTerdaftar = $risikoByTipe->get($l->risiko_terdaftar_tipe)?->get($l->risiko_terdaftar_id);

            return [
                'id' => $l->id,
                'nama_lengkap' => $l->nama_lengkap,
                'email' => $l->email,
                'no_hp' => $l->no_hp,
                'opd' => $l->opd ? ['id' => $l->opd->id, 'nama' => $l->opd->nama] : null,
                'kejadian' => $l->kejadian,
                'waktu_kejadian' => $l->waktu_kejadian->locale('id')->translatedFormat('d F Y H:i'),
                // Format Y-m-d mentah (BUKAN format lokal yg sudah dipakai
                // di atas) — dipakai query-param prefill tombol "Catat ke
                // Form 10" ke field tanggal_terjadi (DatePicker Form10.tsx
                // butuh Y-m-d, sama pola dgn tanggal_pembuatan_raw DataUmum).
                'waktu_kejadian_raw' => $l->waktu_kejadian->format('Y-m-d'),
                'tempat' => $l->tempat,
                'pemicu' => $l->pemicu,
                'risiko_terdaftar_tipe' => $l->risiko_terdaftar_tipe,
                'risiko_terdaftar_id' => $l->risiko_terdaftar_id,
                // Uraian risiko asli dari IRS/IRO terkait (bukan cuma
                // tipe+id) — null kalau risiko itu sudah dihapus/tidak ada
                // (mis. soft-deleted) meski laporan tetap menyimpan
                // referensinya, supaya frontend bisa fallback ke teks generik.
                'risiko_terdaftar_uraian' => $risikoTerdaftar?->{'URAIAN RISIKO'},
                // Tahun penilaian baris risiko terdaftar (BUKAN tahun
                // laporan warga dibuat) — dipakai tombol "Catat ke Form 10"
                // supaya buka Form10 di TAHUN yg sama dgn baris risikonya,
                // bukan tahun aktif Pengaturan Pemda (constraint Form 10:
                // 1 risiko cuma py 1 baris per tahun, jadi harus tahun yg
                // sama persis dgn tempat risiko itu didaftarkan).
                'risiko_terdaftar_tahun' => $risikoTerdaftar?->{'TAHUN DINILAI RISIKO'} ? (int) $risikoTerdaftar->{'TAHUN DINILAI RISIKO'} : null,
                'status' => $l->status,
                'catatan_tindak_lanjut' => $l->catatan_tindak_lanjut,
                'ditindaklanjuti_oleh' => $l->ditindaklanjutiOleh?->name,
                'created_at' => $l->created_at->locale('id')->translatedFormat('d F Y H:i'),
                'sudah_dicatat_form10' => $laporanIdsSudahDicatat->contains($l->id),
            ];
        });

        return Inertia::render('lapor-kejadian/Rekap', [
            'laporan' => $laporan,
            'filters' => $request->only(['status', 'opd_id', 'search']),
            'opdList' => $isAdminOrSuperAdmin ? Opd::orderBy('nama')->get(['id', 'nama']) : [],
            'statuses' => ['baru', 'diverifikasi', 'ditindaklanjuti', 'selesai'],
            'isAdminOrSuperAdmin' => $isAdminOrSuperAdmin,
        ]);
    }

    /** Ubah status tindak lanjut — admin/super-admin, atau PIC OPD terkait saja. */
    public function updateStatus(Request $request, LaporanKejadianRisiko $laporanKejadian)
    {
        $this->ensureCanManage($request, $laporanKejadian);

        $validated = $request->validate([
            'status' => ['required', Rule::in(['baru', 'diverifikasi', 'ditindaklanjuti', 'selesai'])],
            'catatan_tindak_lanjut' => ['nullable', 'string', 'max:2000'],
        ]);

        $laporanKejadian->update([
            ...$validated,
            'ditindaklanjuti_oleh' => $request->user()->id,
            'ditindaklanjuti_at' => now(),
        ]);

        if ($laporanKejadian->dilaporkan_oleh_user_id) {
            $laporanKejadian->dilaporkanOleh?->notify(new LaporanKejadianRisikoStatusChanged($laporanKejadian));
        }

        return back()->with('success', 'Status laporan diperbarui.');
    }

    /**
     * Tautkan (atau lepas tautan) laporan ke risiko terdaftar — admin/super-
     * admin saja. Dipakai skenario "risiko belum terdaftar saat pelapor
     * mengisi form publik": admin daftarkan dulu risikonya via tombol
     * "Input ke Register Risiko" (buka form IRS/IRO terpisah di tab baru),
     * lalu balik ke sini utk menautkan baris yang baru dibuat itu — begitu
     * tertaut, tombol "Catat ke Form 10" di Rekap.tsx otomatis muncul
     * (constraint Form 10 SELALU butuh risiko yg sudah terdaftar, tidak
     * bisa langsung dari laporan warga tanpa risiko_id yg valid).
     */
    public function updateRisikoTerdaftar(Request $request, LaporanKejadianRisiko $laporanKejadian)
    {
        if (!$request->user()->hasAnyRole(['admin', 'super-admin'])) {
            throw new AccessDeniedHttpException('Hanya Admin/Super Admin yang dapat menautkan laporan ke risiko terdaftar.');
        }

        $validated = $request->validate([
            'risiko_terdaftar_tipe' => ['nullable', Rule::in(array_keys(self::RISIKO_MODELS))],
            'risiko_terdaftar_id' => ['nullable', 'integer'],
        ]);

        $laporanKejadian->update($validated);

        return back()->with('success', 'Risiko terdaftar terkait laporan diperbarui.');
    }

    /**
     * Set/ubah OPD terkait — admin/super-admin saja. OPD di form lapor
     * bersifat opsional (pelapor awam belum tentu tahu OPD mana yang
     * relevan), jadi admin/super-admin bisa melengkapi/mengoreksinya
     * belakangan dari sini. Setiap kali di-set ke OPD baru, PIC OPD
     * tersebut otomatis dinotifikasi supaya bisa langsung menindaklanjuti
     * (sama seperti alur notifikasi saat laporan pertama kali masuk).
     */
    public function updateOpd(Request $request, LaporanKejadianRisiko $laporanKejadian)
    {
        if (!$request->user()->hasAnyRole(['admin', 'super-admin'])) {
            throw new AccessDeniedHttpException('Hanya Admin/Super Admin yang dapat mengubah OPD terkait laporan.');
        }

        $validated = $request->validate([
            'opd_id' => ['nullable', 'exists:opd,id'],
        ]);

        // Cast eksplisit ke int|null sebelum dibandingkan — $validated['opd_id']
        // dari request selalu string (mis. "5") sedangkan atribut Eloquent
        // sudah ter-cast int oleh kolom unsignedBigInteger, sehingga `!==`
        // tanpa cast SELALU true (5 !== "5") dan memicu notifikasi berulang
        // ke PIC OPD setiap kali disimpan walau OPD tidak benar-benar berubah.
        $opdIdBaru = $validated['opd_id'] !== null ? (int) $validated['opd_id'] : null;
        $opdBerubah = $laporanKejadian->opd_id !== $opdIdBaru;

        $laporanKejadian->update(['opd_id' => $opdIdBaru]);

        if ($opdBerubah && $laporanKejadian->opd_id) {
            $picOpd = User::where('opd_id', $laporanKejadian->opd_id)->get();
            Notification::send($picOpd, new LaporanKejadianRisikoSubmitted($laporanKejadian));
        }

        return back()->with('success', 'OPD terkait laporan diperbarui.');
    }

    public function destroy(Request $request, LaporanKejadianRisiko $laporanKejadian)
    {
        $this->ensureCanManage($request, $laporanKejadian);

        $laporanKejadian->delete();

        return back()->with('success', 'Laporan dihapus.');
    }

    private function ensureCanManage(Request $request, LaporanKejadianRisiko $laporan): void
    {
        $user = $request->user();

        if ($user->hasAnyRole(['admin', 'super-admin'])) {
            return;
        }

        if ($user->opd_id && $user->opd_id === $laporan->opd_id) {
            return;
        }

        throw new AccessDeniedHttpException('Anda tidak memiliki izin untuk mengelola laporan ini.');
    }
}
