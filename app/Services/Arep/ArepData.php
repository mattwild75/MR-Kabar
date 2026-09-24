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

    /** @return array<string, mixed> */
    public function untukPenugasan(RppPenugasan $p): array
    {
        $p->loadMissing(['rpp.category', 'teamMembers', 'obriks', 'laporans']);
        $insp = RppSetting::inspektur();
        $tim = $p->teamMembers->values();

        $peran = fn (string $role) => $tim->firstWhere('role', $role);
        $anggota = $tim->where('role', 'at')->values();

        $mulai = $p->masa_tugas_mulai;
        $selesai = $p->masa_tugas_selesai;
        $hariKerja = $this->hariKerja($mulai, $selesai);

        $obrikNama = $p->obriks->pluck('nama')->filter()->values();
        $objek = $obrikNama->isNotEmpty() ? $obrikNama->join(', ') : ($p->uraian ?? '');

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
            ],
            'jumlah_laporan' => (int) ($p->jumlah_laporan ?? 0),
            'laporan_kepada' => 'Bupati dan Auditi',
            'pj' => $this->orang($peran('pj')),
            'wpj' => $this->orang($peran('wpj')),
            'dalnis' => $this->orang($peran('dalnis')),
            'kt' => $this->orang($peran('kt')),
            'anggota' => $anggota->map(fn ($m) => $this->orang($m))->all(),
            'tim' => $tim->map(fn (RppTeamMember $m, int $i) => $this->orang($m) + ['no' => $i + 1])->all(),
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
