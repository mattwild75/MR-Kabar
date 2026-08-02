<?php

namespace App\Http\Controllers\Concerns;

use App\Models\DataUmum;
use App\Models\Opd;
use App\Models\PengaturanPemda;
use Illuminate\Http\Request;

/**
 * Penyaring Periode/Tahun Penilaian untuk halaman konteks dan risiko.
 *
 * Dua satuan waktu dipakai di aplikasi ini, dan keduanya sengaja berbeda:
 *
 *   PERIODE PENILAIAN  (mis. 2025-2029) untuk KRS Pemda dan KRS PD, karena
 *                      keduanya menurunkan RPJMD dan Renstra yang memang
 *                      berlaku lima tahunan;
 *   TAHUN PENILAIAN    (mis. 2026) untuk KRO PD dan seluruh formulir risiko,
 *                      karena keduanya menempel pada kegiatan yang anggarannya
 *                      ditetapkan tahunan lewat Renja dan DPA.
 *
 * Keduanya mengikuti Data Umum. Kalau PIC menuliskan periodenya 2029-2033,
 * maka itulah periode yang dipakai — aplikasi tidak memaksakan angkanya
 * sendiri.
 *
 * Nilai khusus `semua` menampilkan seluruh baris tanpa disaring; dipakai kalau
 * seseorang perlu melihat lintas periode sekaligus.
 */
trait MenyaringPeriodePenilaian
{
    public const SEMUA = 'semua';

    /**
     * Periode yang dipilih di halaman. Null berarti "semua periode".
     * Kalau tidak disebut, dipakai periode milik pengguna sendiri dari Data
     * Umum — bukan periode acak, dan bukan pula selalu "semua".
     */
    protected function periodeTerpilih(Request $request): ?string
    {
        $diminta = trim((string) $request->query('periode', ''));
        if ($diminta === self::SEMUA) {
            return null;
        }
        if ($diminta !== '') {
            return $diminta;
        }

        return $this->periodeBawaan($request);
    }

    /** Periode Penilaian milik pengguna sendiri, dari Data Umum terbarunya. */
    protected function periodeBawaan(Request $request): ?string
    {
        $periode = DataUmum::where('user_id', $request->user()?->id)
            ->whereNotNull('periode_penilaian')->where('periode_penilaian', '<>', '')
            ->orderByDesc('tahun_penilaian')->value('periode_penilaian');

        if ($periode) {
            return $periode;
        }

        // Belum pernah mengisi Data Umum: dipakai periode yang paling banyak
        // dipakai OPD lain, supaya halamannya tidak tampak kosong tanpa sebab.
        return DataUmum::whereNotNull('periode_penilaian')->where('periode_penilaian', '<>', '')
            ->selectRaw('periode_penilaian, count(*) as n')
            ->groupBy('periode_penilaian')->orderByDesc('n')
            ->value('periode_penilaian');
    }

    /** Tahun yang dipilih di halaman. Null berarti "semua tahun". */
    protected function tahunTerpilih(Request $request): ?int
    {
        $diminta = trim((string) $request->query('tahun', ''));
        if ($diminta === self::SEMUA) {
            return null;
        }
        if ($diminta !== '' && ctype_digit($diminta)) {
            return (int) $diminta;
        }

        return (int) PengaturanPemda::current()->tahun_penilaian;
    }

    /**
     * Seluruh periode yang benar-benar ada pada sebuah tabel, digabung dengan
     * yang tercatat di Data Umum. Data Umum ikut disertakan supaya periode
     * yang baru ditetapkan tetap bisa dipilih walau barisnya belum ada satu
     * pun — kalau tidak, PIC tidak akan pernah bisa mulai mengisi periode baru.
     */
    protected function periodeOptions(string $tabelModel): array
    {
        $dariTabel = $tabelModel::query()->withoutGlobalScopes()
            ->distinct()->pluck('PERIODE PENILAIAN');
        $dariDataUmum = DataUmum::distinct()->pluck('periode_penilaian');

        return $dariTabel->concat($dariDataUmum)
            ->filter(fn ($v) => is_string($v) && trim($v) !== '')
            ->unique()->sortDesc()->values()->all();
    }

    /** Seluruh tahun yang benar-benar ada pada sebuah kolom tahun. */
    protected function tahunOptions(string $tabelModel, string $kolom): array
    {
        $tahun = $tabelModel::query()->withoutGlobalScopes()
            ->distinct()->pluck($kolom)
            ->filter(fn ($v) => $v !== null && $v !== '')
            ->map(fn ($v) => (int) $v);

        // Tahun aktif selalu ikut, supaya tahun yang baru dibuka tetap bisa
        // dipilih sebelum ada satu baris pun di dalamnya.
        return $tahun->push((int) PengaturanPemda::current()->tahun_penilaian)
            ->unique()->sortDesc()->values()->all();
    }

    /**
     * Terapkan saringan periode; dilewati kalau "semua periode".
     *
     * Tipe $query sengaja tidak dipatok Builder: pemanggilnya kadang
     * mengoper hasil Model::orderBy() yang oleh sebagian penganalisis statis
     * dikira instance model, bukan builder. Perilakunya sama saja.
     */
    protected function saringPeriode($query, ?string $periode)
    {
        return $periode === null ? $query : $query->where('PERIODE PENILAIAN', $periode);
    }

    /** Terapkan saringan tahun; dilewati kalau "semua tahun". */
    protected function saringTahun($query, ?int $tahun, string $kolom)
    {
        return $tahun === null ? $query : $query->where($kolom, $tahun);
    }

    /**
     * Perangkat daerah yang dipilih di halaman. Null berarti "semua OPD".
     *
     * Bawaannya sengaja "semua", berbeda dari periode dan tahun: pengguna yang
     * melihat penyaring ini memang sedang mengawasi lintas perangkat daerah,
     * jadi menyempitkannya sendiri sejak awal akan menyembunyikan data tanpa
     * diminta. Pengguna yang tidak berhak melihat lintas OPD tidak pernah
     * menerima penyaring ini, dan barisnya tetap disekat kepemilikan seperti
     * sebelumnya.
     */
    protected function opdTerpilih(Request $request): ?int
    {
        if (! ($request->user()?->canViewAllOpd() ?? false)) {
            return null;
        }
        $diminta = trim((string) $request->query('opd_id', ''));

        return ($diminta === '' || $diminta === self::SEMUA || ! ctype_digit($diminta))
            ? null
            : (int) $diminta;
    }

    /** Pilihan perangkat daerah; kosong untuk pengguna yang tidak berhak lintas OPD. */
    protected function opdOptions(Request $request): array
    {
        if (! ($request->user()?->canViewAllOpd() ?? false)) {
            return [];
        }

        return Opd::orderBy('nama')->get(['id', 'nama'])->all();
    }

    /**
     * Saring baris menurut perangkat daerah PEMILIKNYA.
     *
     * Dipakai I_b sampai III_b, yang tiap barisnya punya user_id — dan
     * perangkat daerahnya diambil dari akun itu, bukan dari kolom teks mana
     * pun di dalam barisnya. Kolom seperti "ENTITAS PD YANG MENILAI" diisi
     * bebas dan ejaannya berbeda-beda antar pengisi, sehingga tidak bisa
     * dijadikan dasar penyaringan yang bisa dipercaya.
     */
    protected function saringOpdPemilik($query, ?int $opdId)
    {
        return $opdId === null
            ? $query
            : $query->whereHas('user', fn ($q) => $q->where('opd_id', $opdId));
    }

    /**
     * Saring baris menurut nama perangkat daerah yang tertulis di dalamnya.
     *
     * Hanya untuk I_a KRS Pemda, yang TIDAK punya user_id: ia satu kertas
     * kerja tingkat Pemda yang sama bagi semua, diturunkan dari RPJMD. Yang
     * bisa dipakai membedakan cuma kolom-kolom berisi nama perangkat daerah
     * penanggung jawab indikator dan program — dan satu baris bisa menyebut
     * beberapa nama sekaligus, dipisah baris baru.
     *
     * Karena itu pencocokannya memakai LIKE, bukan kesamaan persis. Ejaannya
     * pun tidak seragam ("Dinas Kesehatan" dan "DINAS TRANSMIGRASI DAN TENAGA
     * KERJA" berdampingan di kolom yang sama), tetapi collation tabelnya
     * mengabaikan perbedaan huruf besar-kecil sehingga keduanya tetap kena.
     */
    protected function saringOpdLewatNama($query, ?int $opdId, array $kolom)
    {
        if ($opdId === null) {
            return $query;
        }
        $nama = Opd::whereKey($opdId)->value('nama');
        if (! $nama) {
            return $query;
        }

        return $query->where(function ($q) use ($kolom, $nama) {
            foreach ($kolom as $k) {
                $q->orWhere($k, 'like', '%' . $nama . '%');
            }
        });
    }
}
