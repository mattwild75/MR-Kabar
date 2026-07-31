<?php

namespace Database\Seeders;

use App\Models\IroPd;
use App\Models\IrsPd;
use App\Models\IrsPemda;
use Illuminate\Database\Seeder;

/**
 * Lengkapi kolom CELAH PENGENDALIAN Tahun 2025 dengan centang kriteria baku
 * Perdep, untuk baris yang efektivitas pengendaliannya dinilai TE atau KE.
 *
 * Kolom itu sudah terisi uraian bebas hasil pengisian Perangkat Daerah. Uraian
 * tersebut TIDAK DIUBAH DAN TIDAK DIBUANG — kriteria yang cocok hanya
 * DITAMBAHKAN di atasnya, persis bentuk yang dihasilkan form (baris "a. <teks>",
 * satu baris kosong, lalu uraian aslinya). Dengan begitu konteks asli data 2025
 * tetap utuh dan yang bertambah hanya penelusurannya ke kriteria Perdep.
 *
 * Kriteria dipilih dari KATA KUNCI pada uraian yang sudah ditulis Perangkat
 * Daerah, bukan diundi. Kalau tidak ada kata kunci yang cocok, dipakai kriteria
 * bawaan menurut kategorinya: TE ke butir a (pengendalian sudah dilakukan namun
 * belum mampu menangani Risiko), KE ke butir e (pengendalian berjalan namun
 * masih lemah) — butir yang memang paling menggambarkan masing-masing kategori.
 *
 * Idempotent: baris yang sudah memuat kriteria dilewati, jadi menjalankan ulang
 * seeder tidak menumpuk baris kriteria yang sama.
 */
class CelahPengendalianKriteria2025Seeder extends Seeder
{
    private const TAHUN = '2025';

    /**
     * Kriteria celah pengendalian menurut Perdep PPKD 4/2019 — butir a sampai d
     * dari halaman berlabel 66, butir e dari contoh celah pengendalian pada
     * halaman berlabel 67. Disalin PERSIS sama dengan
     * resources/js/lib/irs-reference-data.ts agar bacaan form dan tulisan
     * seeder tidak pernah berbeda satu huruf pun; kalau berbeda, centangnya
     * tidak akan terbaca saat baris dibuka di form.
     */
    private const KRITERIA = [
        'a' => 'Kebijakan dan prosedur pengendalian sudah dilakukan, namun belum mampu menangani risiko yang teridentifikasi',
        'b' => 'Prosedur pengendalian belum dilaksanakan',
        'c' => 'Kebijakan belum diikuti dengan prosedur baku yang jelas',
        'd' => 'Kebijakan dan prosedur yang ada tidak sesuai dengan peraturan di atasnya',
        'e' => 'Pengendalian sudah berjalan namun masih lemah, sehingga masih ada risiko lain yang timbul',
    ];

    /**
     * Kata kunci penanda tiap kriteria, diambil dari kosakata yang benar-benar
     * dipakai Perangkat Daerah pada isian 2025. Urutan penting: yang lebih
     * khusus diperiksa lebih dulu, supaya "SOP belum ada" jatuh ke butir c
     * (belum ada prosedur baku) alih-alih ke butir b.
     */
    private const PENANDA = [
        'c' => ['sop', 'prosedur baku', 'belum baku', 'belum terstandar', 'pedoman', 'juknis', 'petunjuk teknis', 'standar teknis', 'kurikulum', 'modul standar', 'instrumen'],
        'd' => ['tidak sesuai', 'belum sesuai', 'tafsir ganda', 'peraturan di atas', 'regulasi belum', 'belum ada produk hukum', 'pedoman hukum'],
        'b' => ['tidak ada', 'belum ada', 'belum dilaksanakan', 'belum berjalan', 'belum tersedia', 'belum dilakukan', 'tidak rutin', 'tidak konsisten', 'belum diterapkan'],
        'a' => ['belum mampu', 'belum optimal', 'belum maksimal', 'belum menyeluruh', 'belum sepenuhnya', 'belum merata', 'terbatas', 'rendah', 'lemah', 'kurang'],
    ];

    public function run(): void
    {
        $ringkas = ['diisi' => 0, 'dilewati' => 0, 'bukan_te_ke' => 0];

        foreach ([IrsPemda::class, IrsPd::class, IroPd::class] as $model) {
            $baris = $model::where('TAHUN DINILAI RISIKO', self::TAHUN)->get();

            foreach ($baris as $r) {
                $kategori = $this->kodeKategori($r->{'KATEGORI EXISTING CONTROL'});
                if (!in_array($kategori, ['TE', 'KE'], true)) {
                    $ringkas['bukan_te_ke']++;
                    continue;
                }

                $celah = trim((string) $r->{'CELAH PENGENDALIAN'});
                if ($this->sudahBerkriteria($celah)) {
                    $ringkas['dilewati']++;
                    continue;
                }

                $terpilih = $this->pilihKriteria($celah, $kategori);
                $r->{'CELAH PENGENDALIAN'} = $this->susun($terpilih, $celah);
                $r->saveQuietly();
                $ringkas['diisi']++;
            }
        }

        $this->command?->info(
            "Celah pengendalian 2025: {$ringkas['diisi']} baris dilengkapi kriteria Perdep, "
            . "{$ringkas['dilewati']} sudah berkriteria, {$ringkas['bukan_te_ke']} bukan TE/KE sehingga dibiarkan."
        );
    }

    /** Kode kategori dari nilai berbentuk "TE (uraian)". */
    private function kodeKategori(?string $nilai): string
    {
        return strtoupper(preg_split('/[\s(]/', trim((string) $nilai))[0] ?? '');
    }

    /** Baris yang sudah diawali salah satu kriteria baku tidak diolah ulang. */
    private function sudahBerkriteria(string $celah): bool
    {
        foreach (self::KRITERIA as $kode => $teks) {
            if (str_starts_with($celah, "{$kode}. {$teks}")) {
                return true;
            }
        }

        return false;
    }

    /**
     * Pilih kriteria yang cocok dengan uraian. Boleh lebih dari satu — satu
     * uraian memang kerap menyebut beberapa celah sekaligus, misalnya
     * "SOP belum ada dan monitoring tidak rutin".
     *
     * @return array<int, string>
     */
    private function pilihKriteria(string $celah, string $kategori): array
    {
        $rendah = mb_strtolower($celah);
        $terpilih = [];

        foreach (self::PENANDA as $kode => $kataKunci) {
            foreach ($kataKunci as $kata) {
                if (str_contains($rendah, $kata)) {
                    $terpilih[] = $kode;
                    break;
                }
            }
        }

        if ($terpilih === []) {
            // Tanpa kata kunci yang cocok, dipakai butir yang paling
            // menggambarkan kategorinya sendiri.
            $terpilih[] = $kategori === 'TE' ? 'a' : 'e';
        }

        // Pengendalian yang dinilai Kurang Efektif berarti sudah berjalan
        // tetapi belum menutup seluruhnya — butir e adalah penanda khasnya,
        // jadi selalu disertakan.
        if ($kategori === 'KE' && !in_array('e', $terpilih, true)) {
            $terpilih[] = 'e';
        }

        return $terpilih;
    }

    /** Susun isi kolom: kriteria terurut a sampai e, lalu uraian aslinya. */
    private function susun(array $terpilih, string $uraian): string
    {
        $daftar = collect(self::KRITERIA)
            ->filter(fn($teks, $kode) => in_array($kode, $terpilih, true))
            ->map(fn($teks, $kode) => "{$kode}. {$teks}")
            ->implode("\n");

        return $uraian === '' ? $daftar : $daftar . "\n\n" . $uraian;
    }
}
