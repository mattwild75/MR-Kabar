<?php

namespace App\Services\Pkpt;

use App\Models\IroPd;
use App\Models\IrsPd;
use App\Models\IrsPemda;
use App\Models\Pkpt\PkptAreaPengawasan;
use App\Models\Pkpt\PkptEvaluasiRisiko;
use App\Models\Pkpt\PkptFaktor;
use App\Models\Pkpt\PkptFaktorRisiko;
use App\Models\Pkpt\PkptKematanganMr;
use App\Models\Pkpt\PkptKonversiInheren;
use App\Models\Pkpt\PkptPenilaian;
use App\Models\Pkpt\PkptPeriode;
use App\Models\Pkpt\PkptTingkatRisiko;
use App\Models\Pkpt\PkptZonaFrekuensi;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Seluruh rumus Perencanaan Pengawasan Berbasis Risiko, di satu tempat.
 *
 * Dipisah dari controller dengan alasan yang sama seperti
 * RiskReferenceDataService: aturannya dipakai halaman hitung, tiga halaman
 * cetak, dan panel kesiapan sekaligus. Menyalinnya ke tiap pemakai persis
 * cacat yang ditemukan sebagai temuan R-16.
 *
 * Rujukan angka: Perdep PPKD BPKP Nomor 08 Tahun 2020 (Dadang Kurnia, 8 Juni
 * 2020), Tabel 4.1 sampai dengan 4.4, sebagaimana ditetapkan kembali dalam
 * BAB IV Lampiran Keputusan Inspektur Kabupaten Aceh Barat.
 *
 * DUA HAL YANG TIDAK BOLEH DIUBAH TANPA MEMBACA ULANG PERDEP:
 *
 * 1. Skala null bukan nol. Faktor yang datanya belum tersedia dikeluarkan
 *    dari pembagi, bukan dinilai terendah. Memperlakukannya sebagai 1 akan
 *    membuat Area yang datanya paling tipis tampak paling aman — kebalikan
 *    dari yang benar, dan justru Area itulah yang paling perlu diawasi.
 *
 * 2. Faktor Risiko 2 dinilai dari KOMBINASI, bukan dari cacah centang.
 *    Tabel 4.3 memberi skala 4 untuk "terkait RPJMD + sektor unggulan" dan
 *    skala 3 untuk "terkait RPJMD + mendukung RPJMN" — dua-duanya dua
 *    centang, tetapi skalanya berbeda. Menjumlahkan centang lalu memetakan
 *    cacahnya menghilangkan perbedaan itu.
 */
class PkptPerhitunganService
{
    /**
     * Model risiko per tipe. Kunci array ini juga dipakai sebagai nilai
     * kolom risiko_tipe pada pivot program_bupati_risiko yang sudah ada.
     */
    public const MODEL_RISIKO = [
        'irs_pemda' => IrsPemda::class,
        'irs_pd' => IrsPd::class,
        'iro_pd' => IroPd::class,
    ];

    // ------------------------------------------------------------------
    // Normalisasi teks untuk penjodohan Area dengan risiko
    // ------------------------------------------------------------------

    /**
     * Kunci pembanding teks yang tidak peka kapitalisasi dan label bernomor.
     *
     * Bukan kehati-hatian berlebihan: risiko pernah benar-benar hilang dari
     * tabel gabungan karena Sasaran ditulis dengan kapitalisasi berbeda.
     * Pola ini disalin dari KrsIrsSyncService supaya penjodohan di PKPT
     * berperilaku sama dengan penjodohan di modul risiko.
     */
    public function kunciCocok(?string $nilai): string
    {
        $bersih = trim((string) $nilai);
        if ($bersih === '') {
            return '';
        }

        // Buang label berkode di depan, mis. "Sasaran 1.1.1 : ".
        if (preg_match('/^(?:[A-Za-z]+\s+){1,3}\d+(?:\.\d+)*\s*:\s*(.*)$/s', $bersih, $cocok)) {
            $bersih = trim($cocok[1]);
        }

        return mb_strtolower(trim(preg_replace('/\s+/u', ' ', $bersih)));
    }

    // ------------------------------------------------------------------
    // Konversi nilai risiko inheren menjadi skala 1..5 (Tabel 7)
    // ------------------------------------------------------------------

    public function skalaInheren(?float $komposit): ?int
    {
        if ($komposit === null) {
            return null;
        }

        // DIBULATKAN KE BAWAH LEBIH DAHULU, dan ini bukan pilihan gaya.
        //
        // Tabel 7 menetapkan pita atas nilai BULAT: 1-5, 6-10, 11-15, 16-20,
        // 21-25. Nilai risiko komposit hasil RLD x RLK BERDESIMAL, sehingga
        // 10,38 dan 15,05 jatuh di CELAH antar pita dan tidak cocok dengan
        // satu pun. Versi pertama mengembalikan 5 untuk keadaan itu, dan
        // akibatnya terlihat begitu dijalankan pada data sungguhan: sembilan
        // dari sepuluh Area teratas berskala 5 padahal nilai kompositnya
        // 10,38 sampai 22,32. Area yang sebenarnya menengah tampak
        // segenting yang tertinggi.
        //
        // Pembulatan ke bawah dipilih karena itu yang dilakukan contoh Perdep
        // sendiri: Tabel 4.2 menghasilkan komposit 11,69 dan 10,09, lalu
        // Tabel 4.1 mencatatnya sebagai 11 dan 10.
        $bulat = (int) floor($komposit);

        $baris = PkptKonversiInheren::terurut()
            ->first(fn ($k) => $bulat >= $k->nilai_min && $bulat <= $k->nilai_max);

        if ($baris) {
            return $baris->skala;
        }

        // Sisanya hanya di luar rentang 1..25 — dijepit ke ujung terdekat,
        // bukan dikembalikan null: nilai di luar rentang berarti skala risiko
        // sumbernya tidak wajar, dan itu keadaan yang harus terlihat pada
        // peringkat, bukan hilang dari peringkat.
        return $bulat < 1 ? 1 : 5;
    }

    // ------------------------------------------------------------------
    // Skala per faktor, dihitung dari masukan mentah
    // ------------------------------------------------------------------

    /**
     * Hitung ulang seluruh kolom nilai_* dan skala_* dari masukan mentah.
     *
     * @return array<string, int|float|null> siap dipakai untuk fill()
     */
    public function skalaFaktor(PkptFaktorRisiko $f, string $kelompok, ?int $tahunPkpt): array
    {
        $hasil = [];

        // --- FR1 Anggaran -------------------------------------------------
        $hasil['skala_fr1'] = $this->skalaPersenAnggaran($f->persen_belanja_langsung);

        // --- FR2 Keterkaitan RPJMD, RPJMN, sektor unggulan ---------------
        $centang = [
            (bool) $f->terkait_rpjmd,
            (bool) $f->mendukung_rpjmn,
            (bool) $f->sektor_unggulan,
        ];
        $hasil['nilai_fr2'] = count(array_filter($centang));

        // Kelompok SKPK memakai baris alternatif Tabel 4.3 — rasio indikator
        // kinerja satuan kerja terhadap total indikator kinerja Pemerintah
        // Kabupaten. Bila rasionya belum tersedia, DIJATUHKAN ke penilaian
        // kombinasi yang sama dengan kelompok Program Prioritas.
        //
        // Tanpa cadangan itu, FR2 yang berbobot 25% akan selalu null untuk
        // seluruh Area SKPK: cacah indikator kinerja per SKPK memang belum ada
        // di basis data mana pun, dan centang RPJMD yang sudah diisi pemakai
        // justru diabaikan. Terlihat saat menulis uji jalur tulisnya, tidak
        // terlihat saat halamannya dibuka.
        //
        // Kalau centangnya pun belum ada satu pun, skalanya tetap NULL.
        // Menjatuhkannya ke 1 akan berarti "sudah dinilai, hasilnya terendah"
        // padahal belum tersentuh — dan itu bukan sekadar keliru di atas
        // kertas: tombol Salin Pagu ikut menghitung ulang seluruh faktor,
        // sehingga satu klik akan membuat panel Kesiapan Data melaporkan FR2
        // terisi 100% untuk Area yang belum dinilai sama sekali.
        //
        // Untuk kelompok Program Prioritas, tiga centang kosong justru
        // penilaian yang sah: Tabel 4.3 merumuskannya sebagai skala 1.
        $hasil['skala_fr2'] = $kelompok === 'skpk'
            ? ($this->skalaSignifikansiSatker($f->indikator_kinerja_skpk, $f->indikator_kinerja_pemda)
                ?? ($hasil['nilai_fr2'] > 0 ? $this->skalaKeterkaitan(...$centang) : null))
            : $this->skalaKeterkaitan(...$centang);

        // --- FR3 Temuan, kecurangan, kasus hukum -------------------------
        $hasil['nilai_fr3'] = count(array_filter([
            (bool) $f->temuan_internal_kurang,
            (bool) $f->temuan_eksternal_kurang,
            (bool) $f->potensi_fraud,
            (bool) $f->kasus_hukum,
        ]));
        $hasil['skala_fr3'] = $hasil['nilai_fr3'] + 1;

        // --- FR4 Isu terkini ---------------------------------------------
        $hasil['nilai_fr4'] = count(array_filter([
            (bool) $f->sorotan_masyarakat,
            (bool) $f->isu_nasional,
            (bool) $f->layanan_publik,
            (bool) $f->hajat_hidup,
        ]));
        $hasil['skala_fr4'] = $hasil['nilai_fr4'] + 1;

        // --- FR5 Pertimbangan lain ---------------------------------------
        $hasil['skala_tahun_terakhir'] = $this->skalaTahunTerakhir($f->tahun_terakhir_diawasi, $tahunPkpt);
        $hasil['skala_pengalaman'] = $this->skalaPengalaman($f->jumlah_penugasan_sejenis);
        $hasil['skala_fr5'] = $this->gabungFr5($hasil['skala_tahun_terakhir'], $hasil['skala_pengalaman']);

        return $hasil;
    }

    /** Tabel 9 baris FR1: batas atas eksklusif, 15% ke atas skala 5. */
    private function skalaPersenAnggaran(?float $persen): ?int
    {
        if ($persen === null) {
            return null;
        }

        return match (true) {
            $persen < 2 => 1,
            $persen < 5 => 2,
            $persen < 10 => 3,
            $persen < 15 => 4,
            default => 5,
        };
    }

    /**
     * Tabel 9 baris FR2 untuk kelompok Program Prioritas.
     *
     * Dinilai dari kombinasi, bukan cacah centang. Dua centang bisa berskala
     * 3 atau 4 tergantung centang yang mana — lihat catatan kepala kelas.
     */
    private function skalaKeterkaitan(bool $rpjmd, bool $rpjmn, bool $unggulan): int
    {
        return match (true) {
            $rpjmd && $rpjmn && $unggulan => 5,
            $rpjmd && $unggulan && ! $rpjmn => 4,
            $rpjmd && $rpjmn && ! $unggulan => 3,
            $rpjmd && ! $rpjmn && ! $unggulan => 2,
            ! $rpjmd && ! $rpjmn && ! $unggulan => 1,

            // Kombinasi tanpa keterkaitan RPJMD tidak diatur Tabel 4.3 Perdep.
            // Dijatuhkan ke cacah centang supaya tetap terperingkat, bukan
            // dibiarkan null yang akan mengeluarkannya dari perhitungan.
            default => min(5, count(array_filter([$rpjmd, $rpjmn, $unggulan])) + 1),
        };
    }

    /**
     * Benarkah FR2 Area ini dinilai lewat CADANGAN, bukan cara yang diminta
     * Keputusan?
     *
     * Tabel 9 menetapkan bahwa Area kelompok SKPK dinilai dari rasio indikator
     * kinerja satuan kerja terhadap total indikator kinerja Pemerintah
     * Kabupaten. Ketika rasio itu belum tersedia, penilaiannya jatuh ke
     * kombinasi centang — sah sebagai pertimbangan profesional, tetapi BAB V
     * huruf A Lampiran Keputusan mewajibkan alasannya didokumentasikan.
     *
     * Predikatnya di sini supaya hanya ada satu rumusan: controller memakainya
     * untuk menuntut catatan, halaman memakainya untuk menandai baris mana
     * yang menuntutnya.
     */
    public function fr2LewatCadangan(PkptFaktorRisiko $f, string $kelompok): bool
    {
        return $kelompok === 'skpk'
            && $this->skalaSignifikansiSatker($f->indikator_kinerja_skpk, $f->indikator_kinerja_pemda) === null;
    }

    /** Tabel 9 baris FR2 alternatif untuk kelompok SKPK: rasio indikator kinerja. */
    private function skalaSignifikansiSatker(?int $indikatorSatker, ?int $indikatorPemda): ?int
    {
        if ($indikatorSatker === null || ! $indikatorPemda) {
            return null;
        }

        $persen = $indikatorSatker / $indikatorPemda * 100;

        return match (true) {
            $persen <= 2 => 1,
            $persen <= 5 => 2,
            $persen <= 10 => 3,
            $persen <= 15 => 4,
            default => 5,
        };
    }

    /**
     * Selisih tahun berjalan dengan tahun terakhir diawasi, dijepit ke 1..5.
     *
     * Null tetap null. "Belum pernah diawasi" memang terdengar seperti skala
     * 5, tetapi kolom kosong pada tahap ini lebih sering berarti riwayatnya
     * belum dihimpun daripada berarti belum pernah diawasi — dan menebak
     * 5 akan menaikkan peringkat seluruh Area hanya karena arsipnya belum
     * dimasukkan.
     */
    private function skalaTahunTerakhir(?int $tahunTerakhir, ?int $tahunPkpt): ?int
    {
        if ($tahunTerakhir === null || $tahunPkpt === null) {
            return null;
        }

        return max(1, min(5, $tahunPkpt - $tahunTerakhir));
    }

    /** 0 kali penugasan sejenis berskala 1, lebih dari 3 kali berskala 5. */
    private function skalaPengalaman(?int $jumlah): ?int
    {
        if ($jumlah === null) {
            return null;
        }

        return max(1, min(5, $jumlah + 1));
    }

    /**
     * Gabungan FR5 menurut rincian bobotnya sendiri: 10% tahun terakhir
     * diawasi dan 5% pengalaman sumber daya manusia, dari 15% milik FR5.
     * Kalau salah satunya null, yang tersisa dipakai penuh.
     */
    private function gabungFr5(?int $skalaTahun, ?int $skalaPengalaman): ?float
    {
        $bagian = array_filter([
            10 => $skalaTahun,
            5 => $skalaPengalaman,
        ], fn ($v) => $v !== null);

        if ($bagian === []) {
            return null;
        }

        $bobot = array_sum(array_keys($bagian));
        $jumlah = 0.0;
        foreach ($bagian as $b => $skala) {
            $jumlah += $skala * $b;
        }

        return round($jumlah / $bobot, 2);
    }

    // ------------------------------------------------------------------
    // Gabungan Faktor Pertimbangan Manajemen (Tabel 8)
    // ------------------------------------------------------------------

    /**
     * Gabungkan skala kelima faktor menurut bobotnya.
     *
     * Faktor berskala null dikeluarkan dari pembagi. Yang dikembalikan juga
     * memuat berapa persen bobot yang benar-benar terpakai, supaya kertas
     * kerja bisa menyatakan seberapa jauh angkanya sudah mencerminkan metode.
     *
     * @param  array<string, int|float|null>  $skala  berkunci FR1..FR5
     * @return array{skala: float|null, bobot_terpakai: int}
     */
    public function gabungkanFaktor(array $skala): array
    {
        $faktor = PkptFaktor::terurut();
        $bobotTerpakai = 0;
        $jumlah = 0.0;

        foreach ($faktor as $kode => $f) {
            $nilai = $skala[$kode] ?? null;
            if ($nilai === null) {
                continue;
            }
            $bobotTerpakai += $f->bobot_persen;
            $jumlah += $nilai * $f->bobot_persen;
        }

        return [
            'skala' => $bobotTerpakai > 0 ? round($jumlah / $bobotTerpakai, 2) : null,
            'bobot_terpakai' => $bobotTerpakai,
        ];
    }

    // ------------------------------------------------------------------
    // Risiko milik sebuah Area Pengawasan
    // ------------------------------------------------------------------

    /**
     * Kumpulkan skala dampak dan kemungkinan seluruh risiko sebuah Area.
     *
     * Skala yang dipakai: hasil evaluasi Inspektorat kalau ada barisnya di
     * pkpt_evaluasi_risiko, kalau tidak skala inheren apa adanya dari
     * MR Kabar. Modul PKPT tidak pernah menulis ke tabel risiko.
     *
     * @return Collection<int, array{dampak: int, kemungkinan: int}>
     */
    public function risikoUntukArea(PkptAreaPengawasan $area, PkptPeriode $periode): Collection
    {
        $tahun = $periode->tahun_dasar_risiko;
        $hasil = collect();

        foreach ($this->barisRisikoArea($area, $tahun) as $tipe => $baris) {
            $timpa = $this->evaluasiTerpasang($periode, $tipe);

            foreach ($baris as $r) {
                $ev = $timpa->get($r->id);
                $dampak = $ev?->skala_dampak_evaluasi ?? $this->angka($r->{'SKALA DAMPAK INHEREN'});
                $kemungkinan = $ev?->skala_kemungkinan_evaluasi ?? $this->angka($r->{'SKALA KEMUNGKINAN INHEREN'});

                if ($dampak === null || $kemungkinan === null) {
                    continue;
                }

                $hasil->push(['dampak' => $dampak, 'kemungkinan' => $kemungkinan]);
            }
        }

        return $hasil;
    }

    /**
     * Baris risiko mentah milik sebuah Area, per tipe.
     *
     * @return array<string, Collection>
     */
    private function barisRisikoArea(PkptAreaPengawasan $area, int $tahun): array
    {
        // Kelompok SKPK: seluruh risiko strategis dan operasional Perangkat
        // Daerah itu. Risiko strategis Pemerintah Kabupaten tidak ikut —
        // pemiliknya Bupati, bukan SKPK, dan ia menempel pada Area kelompok
        // Program Prioritas lewat Sasaran RPJMD.
        if ($area->kelompok === 'skpk') {
            if (! $area->opd_id) {
                return [];
            }

            return [
                'irs_pd' => IrsPd::whereHas('user', fn ($q) => $q->where('opd_id', $area->opd_id))
                    ->where('TAHUN DINILAI RISIKO', $tahun)->get(),
                'iro_pd' => IroPd::whereHas('user', fn ($q) => $q->where('opd_id', $area->opd_id))
                    ->where('TAHUN DINILAI RISIKO', $tahun)->get(),
            ];
        }

        if ($area->kelompok === 'program_prioritas') {
            // Ditarik dari Program Pembangunan Bupati: lewat pivot yang sudah
            // ada, tanpa penjodohan teks sama sekali.
            if ($area->program_bupati_id) {
                return $this->risikoDariPivotProgramBupati($area->program_bupati_id, $tahun);
            }

            // Ditarik dari baris KRS Pemda: dijodohkan lewat Sasaran RPJMD,
            // tidak peka kapitalisasi.
            if ($area->krsPemda) {
                $kunci = $this->kunciCocok($area->krsPemda->{'SASARAN RPJMD'});
                if ($kunci === '') {
                    return [];
                }

                return [
                    'irs_pemda' => IrsPemda::where('TAHUN DINILAI RISIKO', $tahun)->get()
                        ->filter(fn ($r) => $this->kunciCocok($r->{'SASARAN RPJMD'}) === $kunci)
                        ->values(),
                ];
            }
        }

        // Kelompok unit_lain, atau Area yang tidak menunjuk sumber apa pun:
        // risikonya ditetapkan tangan, bukan dijodohkan.
        return [];
    }

    /** @return array<string, Collection> */
    private function risikoDariPivotProgramBupati(int $programId, int $tahun): array
    {
        $pivot = DB::table('program_bupati_risiko')
            ->where('program_pembangunan_bupati_id', $programId)
            ->whereNull('deleted_at')
            ->get()
            ->groupBy('risiko_tipe');

        $hasil = [];
        foreach (self::MODEL_RISIKO as $tipe => $model) {
            $id = ($pivot[$tipe] ?? collect())->pluck('risiko_id')->all();
            if ($id === []) {
                continue;
            }
            $hasil[$tipe] = $model::whereIn('id', $id)
                ->where('TAHUN DINILAI RISIKO', $tahun)->get();
        }

        return $hasil;
    }

    /** Evaluasi Inspektorat untuk satu tipe risiko, berkunci id risikonya. */
    private function evaluasiTerpasang(PkptPeriode $periode, string $tipe): Collection
    {
        static $simpan = [];
        $kunci = $periode->id.'|'.$tipe;

        if (! isset($simpan[$kunci])) {
            $kolom = PkptEvaluasiRisiko::KOLOM[$tipe] ?? null;
            $simpan[$kunci] = $kolom
                ? PkptEvaluasiRisiko::where('periode_id', $periode->id)
                    ->whereNotNull($kolom)->get()->keyBy($kolom)
                : collect();
        }

        return $simpan[$kunci];
    }

    private function angka(mixed $nilai): ?int
    {
        if ($nilai === null || $nilai === '') {
            return null;
        }

        $n = (int) $nilai;

        return $n > 0 ? $n : null;
    }

    // ------------------------------------------------------------------
    // Hitung satu periode penuh
    // ------------------------------------------------------------------

    /**
     * Tulis ulang seluruh pkpt_penilaian untuk sebuah periode.
     *
     * @return array{area: int, dinilai: int, tanpa_risiko: int, tanpa_faktor: int}
     */
    public function hitungPeriode(PkptPeriode $periode): array
    {
        $area = PkptAreaPengawasan::where('periode_id', $periode->id)
            ->with(['krsPemda', 'faktorRisiko'])->get();

        $kematangan = PkptKematanganMr::where('periode_id', $periode->id)
            ->get()->keyBy('opd_id');

        $ringkas = ['area' => $area->count(), 'dinilai' => 0, 'tanpa_risiko' => 0, 'tanpa_faktor' => 0];
        $sekarang = now();

        foreach ($area as $a) {
            $baris = $this->barisPenilaian($a, $periode, $kematangan, $sekarang);

            if ($baris['skala_inheren'] === null) {
                $ringkas['tanpa_risiko']++;
            }
            if ($baris['skala_fpm'] === null) {
                $ringkas['tanpa_faktor']++;
            }
            if ($baris['total_nilai_risiko'] !== null) {
                $ringkas['dinilai']++;
            }

            PkptPenilaian::updateOrCreate(
                ['periode_id' => $periode->id, 'area_id' => $a->id],
                $baris
            );
        }

        // Area yang sudah dihapus tidak boleh menyisakan hasil hitung.
        PkptPenilaian::where('periode_id', $periode->id)
            ->whereNotIn('area_id', $area->pluck('id'))->delete();

        return $ringkas;
    }

    /** @param  Collection<int, PkptKematanganMr>  $kematangan */
    private function barisPenilaian(
        PkptAreaPengawasan $a,
        PkptPeriode $periode,
        Collection $kematangan,
        $sekarang
    ): array {
        $risiko = $this->risikoUntukArea($a, $periode);

        $rld = $risiko->isNotEmpty() ? round($risiko->avg('dampak'), 2) : null;
        $rlk = $risiko->isNotEmpty() ? round($risiko->avg('kemungkinan'), 2) : null;
        $komposit = ($rld !== null && $rlk !== null) ? round($rld * $rlk, 2) : null;
        $skalaInheren = $this->skalaInheren($komposit);

        // Area kelompok Program Prioritas sering tidak menunjuk satu SKPK pun,
        // sehingga tidak punya baris kematangan sendiri. Tanpa cadangan, Area
        // seperti itu tidak akan pernah memperoleh Total Nilai Risiko sekalipun
        // risikonya terjodoh — terukur 98 Area pada penarikan pertama.
        //
        // Cadangannya adalah level yang paling lazim dipakai pada periode itu,
        // yang dalam praktik berarti level hasil adopsi skor maturitas SPIP
        // tingkat kabupaten. Perdep memang mengizinkan pemakaian skor Pemda
        // ketika satuan kerjanya belum punya skor tersendiri.
        $km = $a->opd_id ? $kematangan->get($a->opd_id) : null;
        $km ??= $this->kematanganLazim($kematangan);

        $levelMr = $km?->level_mr;
        $bobotRegister = $km?->bobot_register;
        $bobotFaktor = $km?->bobot_faktor;

        $gabung = $this->gabungkanFaktor(
            $a->faktorRisiko?->skala() ?? ['FR1' => null, 'FR2' => null, 'FR3' => null, 'FR4' => null, 'FR5' => null]
        );

        [$total, $keterangan] = $this->totalNilaiRisiko(
            $skalaInheren, $bobotRegister, $gabung['skala'], $bobotFaktor, $gabung['bobot_terpakai']
        );

        $zona = PkptZonaFrekuensi::untukNilai($total);
        $tingkat = PkptTingkatRisiko::untukNilai($total);

        return [
            'level_mr' => $levelMr,
            'jumlah_risiko' => $risiko->count(),
            'rld' => $rld,
            'rlk' => $rlk,
            'nilai_komposit' => $komposit,
            'skala_inheren' => $skalaInheren,
            'bobot_register' => $bobotRegister,
            'skala_fpm' => $gabung['skala'],
            'bobot_faktor' => $bobotFaktor,
            'bobot_faktor_terpakai' => $gabung['bobot_terpakai'],
            'total_nilai_risiko' => $total,
            'tingkat_risiko' => $tingkat?->nama,
            'zona' => $zona?->zona,
            'frekuensi' => $zona?->frekuensi,
            'keterangan' => $keterangan,
            'dihitung_pada' => $sekarang,
        ];
    }

    /**
     * Kematangan yang paling lazim pada satu periode.
     *
     * Dipakai sebagai cadangan bagi Area Pengawasan yang tidak menunjuk satu
     * Perangkat Daerah pun. Dihitung sekali per pemanggilan hitungPeriode.
     *
     * @param  Collection<int, PkptKematanganMr>  $kematangan
     */
    private function kematanganLazim(Collection $kematangan): ?PkptKematanganMr
    {
        return $kematangan->whereNotNull('bobot_register')
            ->groupBy('level_mr')
            ->sortByDesc(fn ($g) => $g->count())
            ->first()?->first();
    }

    /**
     * Rumus Tabel 6: (skala inheren x bobot register) + (skala FPM x bobot faktor).
     *
     * Yang perlu diperhatikan adalah keadaan setengah lengkap, dan itu justru
     * yang paling sering terjadi pada siklus pertama:
     *
     * - Belum ada penetapan kematangan MR sama sekali. Bobotnya tidak ada,
     *   jadi tidak ada yang bisa dihitung. Dikembalikan null, bukan ditebak.
     * - Ada bobot, tetapi Areanya tidak punya satu pun risiko terjodoh.
     *   Bobot register dialihkan seluruhnya ke faktor, sesuai perlakuan
     *   Perdep atas satuan kerja yang belum punya Register Risiko.
     * - Ada risiko, tetapi belum satu faktor pun terisi. Kebalikannya:
     *   bobot faktor dialihkan ke register.
     *
     * @return array{0: float|null, 1: string|null}
     */
    private function totalNilaiRisiko(
        ?int $skalaInheren,
        ?int $bobotRegister,
        ?float $skalaFpm,
        ?int $bobotFaktor,
        int $bobotTerpakai
    ): array {
        if ($bobotRegister === null || $bobotFaktor === null) {
            return [null, 'Tingkat kematangan manajemen risiko belum ditetapkan.'];
        }

        if ($skalaInheren === null && $skalaFpm === null) {
            return [null, 'Belum ada Register Risiko terjodoh maupun Faktor Pertimbangan Manajemen terisi.'];
        }

        $catatan = [];

        if ($skalaInheren === null) {
            $total = $skalaFpm;
            $catatan[] = 'Tidak ada Register Risiko terjodoh; dinilai seluruhnya dari Faktor Pertimbangan Manajemen.';
        } elseif ($skalaFpm === null) {
            $total = (float) $skalaInheren;
            $catatan[] = 'Belum ada Faktor Pertimbangan Manajemen terisi; dinilai seluruhnya dari Register Risiko.';
        } else {
            $total = ($skalaInheren * $bobotRegister + $skalaFpm * $bobotFaktor) / 100;
        }

        if ($skalaFpm !== null && $bobotTerpakai < 100) {
            $catatan[] = 'Faktor Pertimbangan Manajemen baru terisi '.$bobotTerpakai.'% dari bobotnya.';
        }

        return [round($total, 2), $catatan === [] ? null : implode(' ', $catatan)];
    }
}
