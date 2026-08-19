<?php

namespace Database\Seeders;

use App\Models\KrsPemda;
use Illuminate\Database\Seeder;

/**
 * Mengisi 1a KRS Pemda LENGKAP dari tiga tabel RPJMD Kabupaten Aceh Barat
 * 2025-2029:
 *
 *   Tabel 3.3  Cascading RPJM — Visi, Misi, Tujuan, Sasaran berikut indikator,
 *              baseline, target, satuan, dan perangkat daerah pengampunya
 *   Tabel 3.5  Cascading Program Prioritas — program yang MENURUN LANGSUNG
 *              dari sebuah Sasaran; inilah yang menjadi baris prioritas
 *   Tabel 4.1  Program Perangkat Daerah — SELURUH program, campuran prioritas
 *              dan non-prioritas; yang tidak ada di 3.5 masuk sebagai
 *              non-prioritas dengan Sasaran dikosongkan
 *
 * MENGAPA DARI BERKAS DATA, BUKAN DIURAI DARI PDF
 *
 * Ketiga tabel itu di PDF RPJMD memakai sel yang membungkus ke banyak baris
 * dengan kolom saling menyisip. Penguraian otomatis atasnya kehilangan
 * sebagian besar isinya — percobaan menarik nama program dari Tabel 3.5 hanya
 * menemukan 2 dari puluhan yang ada. Karena itu isinya disimpan sebagai berkas
 * data yang dihasilkan dari basis data yang sudah dicocokkan dengan ketiga
 * tabel tersebut sepanjang audit.
 *
 * MENGAPA SEEDER INI ADA
 *
 * Sebelumnya sebagian isi 1a hanya hidup di satu basis data dan tidak
 * tereproduksi di mana pun: 98 baris "Program Penunjang Urusan Pemerintahan
 * Daerah Kabupaten/Kota" untuk 48 perangkat daerah tidak berasal dari seeder
 * mana pun. Pemasangan baru karena itu menghasilkan 1a yang tidak lengkap
 * tanpa ada tanda apa pun. Sekarang seluruh isinya berasal dari satu sumber
 * yang bisa dijalankan ulang.
 *
 * Termasuk di dalamnya tujuh baris BLUD RSUD Cut Nyak Dhien yang dulu tidak
 * ada sama sekali. Penyebabnya: ProgramNonPrioritasSeeder mengisi Tabel 4.1
 * bertahap per perangkat daerah dan batch terakhirnya berhenti di halaman 71,
 * sedangkan BLUD RSU berada di halaman 76. Ditelusuri pada naskah RPJMD, ia
 * satu-satunya nama perangkat daerah yang muncul dari halaman 70 ke atas. Ia
 * juga muncul tujuh kali di seluruh naskah dan KETUJUHNYA di Tabel 4.1, nol
 * kali di Tabel 3.5 — karena itu kedua programnya digolongkan non-prioritas.
 *
 * AMAN DIJALANKAN BERULANG
 *
 * Tiap baris dikenali dari gabungan Sasaran + Program + Indikator + perangkat
 * daerah penanggung jawab. Keempatnya, bukan salah satunya: satu program yang
 * sama dipakai puluhan perangkat daerah dengan indikator berbeda, dan satu
 * perangkat daerah bisa punya beberapa indikator untuk program yang sama.
 * Kunci yang lebih longgar akan menganggap baris yang berbeda sebagai sama dan
 * melewatkannya diam-diam — persis kekeliruan yang dulu membuat seluruh isian
 * BLUD RSUD tidak pernah masuk.
 */
class KrsPemdaRpjmdSeeder extends Seeder
{
    public function run(): void
    {
        $data = require database_path('seeders/data/krs_pemda_rpjmd.php');

        // Tanda pengenal baris yang SUDAH ADA, dibaca sekali di awal supaya
        // tidak ada kueri per baris.
        $sudahAda = KrsPemda::all()
            ->map(fn ($r) => $this->tanda(
                (string) $r->{'SASARAN RPJMD'},
                (string) $r->{'PROGRAM PRIORITAS'},
                (string) $r->{'IK PROGRAM'},
                (string) $r->{'OPD PENANGGUNGJAWAB PROGRAM'},
            ))
            ->flip()
            ->all();

        $baru = 0;
        $lewat = 0;
        foreach ($data as $baris) {
            $t = $this->tanda(
                $baris['SASARAN RPJMD'] ?? '',
                $baris['PROGRAM PRIORITAS'] ?? '',
                $baris['IK PROGRAM'] ?? '',
                $baris['OPD PENANGGUNGJAWAB PROGRAM'] ?? '',
            );
            if (isset($sudahAda[$t])) {
                $lewat++;

                continue;
            }
            KrsPemda::create($baris);
            $sudahAda[$t] = true;
            $baru++;
        }

        $this->command?->info("KRS Pemda: {$baru} baris ditambahkan, {$lewat} sudah ada (total sumber: ".count($data).').');
    }

    private function tanda(string ...$bagian): string
    {
        return implode('||', array_map(
            fn ($s) => mb_strtolower(trim(preg_replace('/\s+/', ' ', $s))),
            $bagian,
        ));
    }
}
