<?php

namespace App\Services\Arep;

use App\Models\RppPenugasan;
use App\Models\RppSetting;
use App\Models\RppTeamMember;
use Carbon\CarbonInterface;

/**
 * Menormalkan satu penugasan RPP (RppPenugasan) menjadi larik data siap pakai
 * untuk seluruh berkas AREP: paket Surat Tugas (ST/SP/Pernyataan) dan 30
 * formulir Kendali Mutu. Sumber tunggal supaya semua berkas satu penugasan
 * konsisten (nomor, tanggal, tim, objek).
 */
class ArepData
{
    /** Terbilang angka kecil (jumlah hari kerja) dalam Bahasa Indonesia. */
    private const SATUAN = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh', 'sebelas'];

    /** 1 hari produktif (HP) = 6,5 jam — baku KM 7 Inspektorat. */
    private const JAM_PER_HP = 6.5;

    /** @return array<string, mixed> */
    public function untukPenugasan(RppPenugasan $p): array
    {
        $p->loadMissing(['rpp.category', 'teamMembers', 'obriks', 'laporans']);
        $insp = RppSetting::inspektur();
        $tim = $p->teamMembers->values();

        $peran = fn (string $role) => $tim->firstWhere('role', $role);
        $anggota = $tim->where('role', 'at')->values();
        // Konvensi ST s.d. 2025 (empat peran): tanpa Pengendali Teknis
        // tersendiri, WPJ merangkap — di ST tertulis "PPJ / Pengendali Teknis".
        // Sejak 2026 (lima peran) Pengendali Teknis tercatat sebagai `dalnis`.
        $dalnisSendiri = $peran('dalnis');
        $rangkap = ! $dalnisSendiri && $peran('wpj') !== null;
        $dalnis = $dalnisSendiri ?? $peran('wpj');
        $labelPeran = function (RppTeamMember $m) use ($rangkap): string {
            if ($rangkap && $m->role === 'wpj' && ! filled($m->peran_teks)) {
                return 'PPJ / Pengendali Teknis';
            }

            return $m->peranTampil();
        };

        $mulai = $p->masa_tugas_mulai;
        $selesai = $p->masa_tugas_selesai;
        // Jumlah hari kerja di ST = jumlah hari Ketua Tim di RPP (DK + LK);
        // cocok dengan ST asli (Rev RKA 2026: 10, Tangkeh: 15). Bila KT tak
        // berhari, jatuh ke hitungan hari kerja kalender.
        $ktHari = (int) ($peran('kt')?->hari_kantor ?? 0) + (int) ($peran('kt')?->hari_lapangan ?? 0);
        $hariKerja = $ktHari > 0 ? $ktHari : $this->hariKerja($mulai, $selesai);

        $obrikNama = $p->obriks->pluck('nama')->filter()->values();
        $kk = $this->kataKerja($p->rpp?->category?->name);
        $uraian = trim((string) $p->uraian);
        // Obrik di RPP kadang berisi kalimat penugasan utuh ("Reviu pada Dinas
        // PUPR terhadap ..."), bukan sekadar nama auditi. Bila begitu, objek =
        // uraian + obrik digabung ". Dan " persis gaya ST asli; frasa = objek.
        if ($obrikNama->isNotEmpty() && $obrikNama->every(fn ($o) => $this->kalimatPenugasan($o))) {
            $bagian = collect([$uraian])->filter(fn ($u) => $u !== '' && $this->kalimatPenugasan($u))->merge($obrikNama)->unique()->values();
            $objek = $bagian->map(fn ($b) => rtrim($b, '. '))->join('. Dan ');
            $frasa = $objek;
        } elseif ($obrikNama->isNotEmpty()) {
            // Frasa "penugasan <frasa>": "<kata kerja> pada <obrik>".
            $objek = $obrikNama->join(', ');
            $frasa = $kk.' pada '.$objek;
        } else {
            // Uraian sudah memuat jenisnya — dipakai apa adanya (hindari "Reviu pada Reviu ...").
            $objek = $uraian;
            $frasa = $uraian !== '' ? $uraian : $kk.' pada '.$objek;
        }
        $auditi = $this->daftarAuditi($obrikNama->all(), $uraian);

        return [
            'penugasan_id' => $p->id,
            'rpp' => [
                'id' => $p->rpp?->id,
                'nomor_rpp' => $p->rpp?->nomor_rpp,
                'tahun' => $p->rpp?->year,
                'tanggal_rpp' => $this->tglPanjang($p->rpp?->tanggal_rpp),
            ],
            'jenis' => [
                'nama' => $p->rpp?->category?->name,
                'sebutan' => $p->rpp?->category?->sebutan ?: $p->rpp?->category?->name,
                'kode' => $p->rpp?->category?->kode_nomor,
                'kata_kerja' => $this->kataKerja($p->rpp?->category?->name),
            ],
            'nomor' => [
                'st' => $p->nomor_st,
                'sp' => $p->nomorSpTampil(),
                'kp' => $p->nomorKpTampil(),
                'rpp' => $p->rpp?->nomor_rpp,
            ],
            'tanggal' => [
                'st' => $this->tglPanjang($p->tanggal_st),
                'st_iso' => $p->tanggal_st?->toDateString(),
                'surat' => $this->tglPanjang($p->tanggal_st ?: $p->masa_tugas_mulai),
            ],
            'objek' => $objek,
            'frasa' => $frasa,
            'auditi' => $auditi,
            // Tujuan surat pengantar (SP): jabatan pimpinan tiap auditi.
            'kepada' => array_map(fn ($a) => $this->pimpinan($a), $auditi),
            'obriks' => $obrikNama->all(),
            'uraian' => $p->uraian,
            'sifat' => $p->sifat,
            'lokasi' => $p->lokasiTampil(),
            'jangka' => [
                'mulai' => $this->tglPanjang($mulai),
                'selesai' => $this->tglPanjang($selesai),
                'rentang' => $this->rentang($mulai, $selesai),
                'hari_kerja' => $hariKerja,
                'hari_kerja_terbilang' => $this->terbilang($hariKerja),
                'tmt' => $p->tmtTampil(),
                // KM 6 no. 9-10: bulan mulai (RMP) dan bulan selesai (RPL/konsep laporan).
                'bulan_mulai' => $mulai ? RppPenugasan::BULAN[$mulai->month] : '..........',
                'bulan_selesai' => $selesai ? RppPenugasan::BULAN[$selesai->month] : '..........',
                'bulan_selesai_tahun' => $selesai ? RppPenugasan::BULAN[$selesai->month].' '.$selesai->year : '..........',
            ],
            'jumlah_laporan' => (int) ($p->jumlah_laporan ?? 0),
            'laporan' => $p->laporans->map(fn ($l) => ['nomor' => (string) $l->nomor_laporan, 'tanggal' => $this->tglPanjang($l->tanggal_laporan), 'jenis' => (string) $l->jenis])->values()->all(),
            'tarif' => $p->tarifSppd(),
            'biaya_sppd' => $p->biayaSppd(),
            // Bulan (1-12) dan minggu ISO (1-52) yang dilalui masa tugas — KMA 22/23.
            'bulan_tugas' => $this->bulanTugas($mulai, $selesai),
            'minggu_tugas' => $this->mingguTugas($mulai, $selesai),
            'lhp' => $this->dataLhp((string) $p->nomor_st),
            'laporan_kepada' => 'Bupati dan Auditi',
            'pj' => $this->orang($peran('pj')),
            'wpj' => $this->orang($peran('wpj')),
            'dalnis' => $this->orang($dalnis),
            'dalnis_rangkap' => $rangkap,
            'kt' => $this->orang($peran('kt')),
            'anggota' => $anggota->map(fn ($m) => $this->orang($m))->all(),
            // Bila WPJ merangkap Pengendali Teknis, harinya dihitung sekali (di kolom WPJ).
            'anggaran_waktu' => $this->anggaranWaktu($peran('wpj'), $dalnisSendiri, $peran('kt'), $anggota, $mulai, $selesai, $rangkap),
            'tim' => $tim->map(fn (RppTeamMember $m, int $i) => ['peran' => $labelPeran($m)] + $this->orang($m) + ['no' => $i + 1])->all(),
            'inspektur' => $this->inspektur($insp),
            'dasar_hukum' => $this->dasarHukum($p->rpp?->year),
            'kop' => [
                'kabupaten' => 'PEMERINTAH KABUPATEN ACEH BARAT',
                'instansi' => 'INSPEKTORAT',
                'alamat' => 'Jalan Imam Bonjol Km. 4,5 Telp. 0655 – 7552672',
                'email' => 'e-mail : inspektoratkab.acehbarat@gmail.com',
                'kota' => 'MEULABOH',
            ],
        ];
    }

    /** @return array{nama:string, nip:string, nip_spasi:string, jabatan:string, pangkat:string, peran:string, role:string} */
    private function orang(?RppTeamMember $m): array
    {
        if (! $m) {
            return ['nama' => '', 'nip' => '', 'nip_spasi' => '', 'jabatan' => '', 'pangkat' => '', 'peran' => '', 'role' => ''];
        }
        $nip = preg_replace('/\D/', '', (string) $m->nip);

        return [
            'nama' => (string) $m->nama,
            'nip' => $nip,
            'nip_spasi' => $this->nipSpasi($nip),
            'jabatan' => (string) $m->pangkat ?: '',
            'pangkat' => (string) $m->pangkat,
            'golongan' => (string) $m->golongan,
            'peran' => $m->peranTampil(),
            'role' => (string) $m->role,
            'hari_kantor' => (int) $m->hari_kantor,
            'hari_lapangan' => (int) $m->hari_lapangan,
        ];
    }

    /** @return array{nama:string, nip_spasi:string, pangkat:string, jabatan:string} */
    private function inspektur($insp): array
    {
        $nip = preg_replace('/\D/', '', (string) ($insp?->nip ?? ''));

        return [
            'nama' => $insp?->nama ?? '............',
            'nip_spasi' => $this->nipSpasi($nip),
            'pangkat' => $insp?->pangkat ?? '',
            'jabatan' => 'Inspektur Kabupaten Aceh Barat',
        ];
    }

    private function nipSpasi(string $nip): string
    {
        return strlen($nip) === 18
            ? substr($nip, 0, 8).' '.substr($nip, 8, 6).' '.substr($nip, 14, 1).' '.substr($nip, 15)
            : ($nip ?: '............');
    }

    /** @return list<string> */
    private function dasarHukum(?int $tahun): array
    {
        $tahun = $tahun ?: (int) now()->year;

        return [
            'Peraturan Pemerintah Nomor 60 Tahun 2008 tentang Sistem Pengendalian Intern Pemerintah;',
            'Qanun Kabupaten Aceh Barat Nomor 2 Tahun 2020 tentang Perubahan Kedua Atas Qanun Kabupaten Aceh Barat Nomor 3 Tahun 2016 tentang Pembentukan dan Susunan Perangkat Daerah Kabupaten Aceh Barat;',
            'Peraturan Bupati Aceh Barat Nomor 17 Tahun 2024 tentang Kedudukan, Susunan Organisasi, Tugas, Fungsi dan Tata Kerja Inspektorat Kabupaten Aceh Barat;',
            'Piagam Audit Intern Inspektorat Kabupaten Aceh Barat;',
            'Program Kerja Pengawasan Tahunan (PKPT) Inspektorat Kabupaten Aceh Barat Tahun '.$tahun.'.',
        ];
    }

    /** Kata kerja penugasan menurut jenis: "Reviu", "Audit", "Evaluasi", "Monitoring". */
    private function kataKerja(?string $jenis): string
    {
        $j = mb_strtolower((string) $jenis);

        return match (true) {
            str_contains($j, 'reviu') => 'Reviu',
            str_contains($j, 'monitor') => 'Monitoring',
            str_contains($j, 'evaluasi') => 'Evaluasi',
            str_contains($j, 'opname') => 'Opname Kas',
            default => 'Audit',
        };
    }

    /**
     * Anggaran waktu KM 6 (no. 8) & KM 7 dari RPP. Dasar mutlak: jumlah hari
     * tiap orang per jabatan = hari kantor (DK) + hari lapangan (LK) di RPP.
     * Pembagian tahap juga dari RPP: Pelaksanaan (II) = LK; Persiapan (I) +
     * Penyelesaian (III) = DK (dibagi). Jam = HP × 6,5 (rumus berkas KM).
     * Kolom AT mengikuti berkas KM Rev RKA: HP ditulis PER ORANG, Jam = jumlah
     * jam seluruh anggota. Jumlah HP = WPJ+Dalnis+KT+AT(per orang); Jumlah Jam
     * = jumlah seluruh kolom Jam.
     *
     * @param  \Illuminate\Support\Collection<int, RppTeamMember>  $anggota
     * @return array<string, mixed>
     */
    private function anggaranWaktu(?RppTeamMember $wpj, ?RppTeamMember $dalnis, ?RppTeamMember $kt, $anggota, ?CarbonInterface $mulai = null, ?CarbonInterface $selesai = null, bool $rangkap = false): array
    {
        $fase = function (?RppTeamMember $m): array {
            $dk = (int) ($m?->hari_kantor ?? 0);
            $lk = (int) ($m?->hari_lapangan ?? 0);
            $i = intdiv($dk, 2);

            return ['I' => $i, 'II' => $lk, 'III' => $dk - $i];
        };
        $sel = fn (int|float|null $hp, int|float|null $jam) => ['hp' => $hp, 'jam' => $jam];
        $atF = $anggota->map($fase)->values();
        $n = $atF->count();

        $judul = ['I' => 'PERSIAPAN AUDIT', 'II' => 'PELAKSANAAN AUDIT', 'III' => 'PENYELESAIAN AUDIT'];
        $baris = [];
        $tot = ['wpj' => [0, 0], 'dalnis' => [0, 0], 'kt' => [0, 0], 'at' => [0, 0], 'jumlah' => [0, 0]];
        foreach ($judul as $rom => $j) {
            $kol = [];
            foreach (['wpj' => $wpj, 'dalnis' => $dalnis, 'kt' => $kt] as $k => $m) {
                $hp = $m ? $fase($m)[$rom] : null;
                $kol[$k] = $sel($hp, $hp === null ? null : $this->jam($hp));
            }
            if ($n > 0) {
                $hps = $atF->pluck($rom);
                // HP per orang (semua anggota lazimnya sama); bila berbeda, rata-rata.
                $perOrang = $hps->unique()->count() === 1 ? (int) $hps->first() : round($hps->avg(), 1);
                $kol['at'] = $sel($perOrang, $this->bulat($hps->sum() * self::JAM_PER_HP));
            } else {
                $kol['at'] = $sel(null, null);
            }
            $jmlHp = collect($kol)->sum(fn ($c) => $c['hp'] ?? 0);
            $jmlJam = collect($kol)->sum(fn ($c) => $c['jam'] ?? 0);
            $kol['jumlah'] = $sel($this->bulat($jmlHp), $this->bulat($jmlJam));
            foreach ($kol as $k => $c) {
                $tot[$k][0] += $c['hp'] ?? 0;
                $tot[$k][1] += $c['jam'] ?? 0;
            }
            $baris[] = ['rom' => $rom, 'judul' => $j] + $kol;
        }
        $ada = ['wpj' => $wpj !== null, 'dalnis' => $dalnis !== null, 'kt' => $kt !== null, 'at' => $n > 0, 'jumlah' => true];
        $total = [];
        foreach ($tot as $k => [$hp, $jam]) {
            $total[$k] = $ada[$k] ? $sel($this->bulat($hp), $this->bulat($jam)) : $sel(null, null);
        }

        // Anggaran waktu per orang (KM 6 no. 8): HP = DK + LK di RPP.
        $orang = [];
        $tambah = function (string $label, ?RppTeamMember $m) use (&$orang) {
            if (! $m) {
                return;
            }
            $hp = (int) $m->hari_kantor + (int) $m->hari_lapangan;
            $orang[] = ['label' => $label, 'nama' => (string) $m->nama, 'hp' => $hp, 'jam' => $this->jam($hp)];
        };
        $tambah($rangkap ? 'PPJ/Dalnis' : 'WPJ', $wpj);
        $tambah('Dalnis', $dalnis);
        $tambah('Ketua Tim', $kt);
        foreach ($anggota as $i => $a) {
            $tambah($i === 0 ? 'Anggota Tim' : '', $a);
        }

        return [
            'jam_per_hp' => self::JAM_PER_HP,
            'jumlah_anggota' => $n,
            'baris' => $baris,
            'total' => $total,
            'orang' => $orang,
            'tahap' => $this->tanggalTahap($mulai, $selesai),
        ];
    }

    /**
     * Tanggal tahap KM 7 seperti berkas KM: Persiapan = hari pertama; Pelaksanaan
     * = hari kerja berikutnya s.d. hari kerja sebelum hari terakhir; Penyelesaian
     * = hari terakhir masa tugas.
     *
     * @return array{persiapan:string, pelaksanaan:string, penyelesaian:string}
     */
    private function tanggalTahap(?CarbonInterface $a, ?CarbonInterface $b): array
    {
        if (! $a || ! $b) {
            return ['persiapan' => '..........', 'pelaksanaan' => '..........', 'penyelesaian' => '..........'];
        }
        $awal = $a->copy()->addDay();
        while ($awal->isWeekend()) {
            $awal->addDay();
        }
        $akhir = $b->copy()->subDay();
        while ($akhir->isWeekend()) {
            $akhir->subDay();
        }

        return [
            'persiapan' => $this->tglPanjang($a),
            'pelaksanaan' => $awal->lte($akhir) ? 'Tgl. '.$this->rentang($awal, $akhir) : '..........',
            'penyelesaian' => 'Tgl. '.$this->tglPanjang($b),
        ];
    }

    /** 13.0 → 13, 6.5 tetap 6.5. */
    private function bulat(int|float $x): int|float
    {
        $x = round($x, 2);

        return fmod($x, 1.0) === 0.0 ? (int) $x : $x;
    }



    /** @return list<int> */
    private function bulanTugas(?CarbonInterface $a, ?CarbonInterface $b): array
    {
        if (! $a) {
            return [];
        }
        $b ??= $a;
        $hasil = [];
        for ($c = $a->copy()->startOfMonth(); $c->lte($b); $c->addMonth()) {
            if ($c->year === $a->year) {
                $hasil[] = $c->month;
            }
        }

        return $hasil;
    }

    /** @return list<int> */
    private function mingguTugas(?CarbonInterface $a, ?CarbonInterface $b): array
    {
        if (! $a) {
            return [];
        }
        $b ??= $a;
        $hasil = [];
        for ($c = $a->copy(); $c->lte($b); $c->addDay()) {
            if (! $c->isWeekend()) {
                $hasil[min(52, $c->isoWeek())] = true;
            }
        }

        return array_keys($hasil);
    }

    /**
     * Temuan dari ERPIKA > Database LHP untuk ST ini (dicocokkan lewat nomor
     * ST; tanpa FK). Dipakai KMA 18-21. Kosong bila LHP belum diinput.
     *
     * @return list<array<string, mixed>>
     */
    private function dataLhp(string $nomorSt): array
    {
        if ($nomorSt === '' || ! \Illuminate\Support\Facades\Schema::hasTable('lhp')) {
            return [];
        }

        return \App\Models\Lhp::where('nomor_st', $nomorSt)
            ->with('temuan.sebab.rekomendasi.tindakLanjut')->orderBy('tanggal_lhp')->get()
            ->map(fn ($l) => [
                'nomor' => (string) $l->nomor_lhp,
                'tanggal' => $this->tglPanjang($l->tanggal_lhp),
                'status' => \App\Models\Lhp::STATUS[$l->status_lhp] ?? '',
                'temuan' => $l->temuan->map(function ($t) {
                    $rek = $t->sebab->flatMap->rekomendasi;
                    $tl = $rek->flatMap->tindakLanjut;

                    return [
                        'kondisi' => trim((string) $t->memo),
                        'sebab' => $t->sebab->pluck('memo')->filter()->join("\n"),
                        'rekomendasi' => $rek->pluck('memo')->filter()->join("\n"),
                        'tindak_lanjut' => $tl->pluck('memo')->filter()->join("\n"),
                        'nilai' => (float) $t->nilai,
                        'nilai_tl' => (float) $tl->sum('nilai'),
                        'tuntas' => $tl->isNotEmpty(),
                    ];
                })->all(),
            ])->all();
    }

    /** Kalimat penugasan utuh (bukan nama auditi): diawali kata kerja pengawasan. */
    private function kalimatPenugasan(string $t): bool
    {
        return (bool) preg_match('/^\s*(reviu|audit|evaluasi|monitoring|pemantauan|opname|pemeriksaan|verifikasi)\b/i', $t);
    }

    /**
     * Nama auditi dari obrik (bila obrik nama instansi) atau dari kalimat
     * penugasan: potongan sesudah "pada" sampai "terhadap/atas/Tahun/TA".
     *
     * @param  list<string>  $obrik
     * @return list<string>
     */
    private function daftarAuditi(array $obrik, string $uraian): array
    {
        $ambil = function (string $t): ?string {
            if (preg_match('/\bpada\s+(.+?)(?:\s+terhadap\b|\s+atas\b|\s+tahun\b|\s+TA\b|\s+T\.A\b|[,.;]|$)/iu', $t, $m)) {
                return trim($m[1]);
            }

            return null;
        };
        $hasil = [];
        foreach ($obrik as $o) {
            $hasil[] = $this->kalimatPenugasan($o) ? ($ambil($o) ?? $o) : $o;
        }
        if ($uraian !== '' && ($hasil === [] || $this->kalimatPenugasan($uraian))) {
            if ($a = $ambil($uraian)) {
                array_unshift($hasil, $a);
            }
        }

        return array_values(array_unique(array_filter(array_map('trim', $hasil))));
    }

    /** Jabatan pimpinan auditi untuk alamat surat, mengikuti SP asli Inspektorat. */
    private function pimpinan(string $a): string
    {
        $t = mb_strtolower($a);

        return match (true) {
            str_contains($t, 'setdakab') || str_contains($t, 'sekretariat daerah') => 'Sekretaris Daerah Kabupaten Aceh Barat',
            str_contains($t, 'sekretariat dprk') || str_contains($t, 'setwan') => 'Sekretaris DPRK Aceh Barat',
            (bool) preg_match('/^(gampong|desa)\b/u', $t) => 'Keuchik '.$a,
            (bool) preg_match('/^(sekretariat )?kecamatan\b/u', $t) => 'Camat '.trim((string) preg_replace('/^(sekretariat\s+)?kecamatan\s+/iu', '', $a)),
            (bool) preg_match('/^(dpmg|dpmptsp|diskominsa|disdik|disdikbud|dinkes|dishub|disperindag|disnaker|dispora|disbudpar|bpkd|bpkad|bpbd|bappeda|bkpsdm|bpbd|satpol|dlh|dpupr|dpkp|dp3akb)\b/u', $t) => 'Kepala '.$a,
            (bool) preg_match('/^(dinas|badan|kantor|puskesmas|rsud|rumah sakit|inspektorat|satuan|sekolah|sd|smp|sma|smk|min|mts|man|uptd|upt)\b/u', $t) => 'Kepala '.$a,
            default => 'Pimpinan '.$a,
        };
    }

    /** Jam dari HP: bilangan bulat dikembalikan int (13), sisanya float (6.5). */
    private function jam(int $hp): int|float
    {
        $j = $hp * self::JAM_PER_HP;

        return fmod($j, 1.0) === 0.0 ? (int) $j : $j;
    }

    private function hariKerja(?CarbonInterface $a, ?CarbonInterface $b): int
    {
        if (! $a || ! $b) {
            return 0;
        }
        $n = 0;
        $c = $a->copy();
        while ($c->lte($b)) {
            if (! $c->isWeekend()) {
                $n++;
            }
            $c->addDay();
        }

        return $n;
    }

    private function terbilang(int $n): string
    {
        if ($n <= 11) {
            return self::SATUAN[$n] ?? (string) $n;
        }
        if ($n < 20) {
            return self::SATUAN[$n - 10].' belas';
        }
        if ($n < 100) {
            $puluh = intdiv($n, 10);
            $sisa = $n % 10;

            return trim(self::SATUAN[$puluh].' puluh '.self::SATUAN[$sisa]);
        }

        return (string) $n;
    }

    private function tglPanjang(?CarbonInterface $t): string
    {
        return $t ? $t->day.' '.RppPenugasan::BULAN[$t->month].' '.$t->year : '.....................';
    }

    private function rentang(?CarbonInterface $a, ?CarbonInterface $b): string
    {
        if (! $a) {
            return '.....................';
        }
        if (! $b) {
            return $this->tglPanjang($a);
        }
        if ($a->month === $b->month && $a->year === $b->year) {
            return $a->day.' s.d. '.$b->day.' '.RppPenugasan::BULAN[$b->month].' '.$b->year;
        }
        if ($a->year === $b->year) {
            return $a->day.' '.RppPenugasan::BULAN[$a->month].' s.d. '.$b->day.' '.RppPenugasan::BULAN[$b->month].' '.$b->year;
        }

        return $this->tglPanjang($a).' s.d. '.$this->tglPanjang($b);
    }
}
