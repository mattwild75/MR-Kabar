<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Tabel PKPT Berbasis Risiko — menurunkan Perdep PPKD BPKP Nomor 08 Tahun 2020
 * sebagaimana ditetapkan dalam rancangan Keputusan Inspektur Kabupaten Aceh
 * Barat tentang Pedoman Perencanaan Pengawasan Berbasis Risiko.
 *
 * SELURUHNYA TABEL BARU. Tidak ada satu pun ALTER atas tabel MR Kabar yang
 * sudah ada — pagu anggaran, kematangan manajemen risiko, riwayat pengawasan,
 * dan sektor unggulan semuanya ditampung di sini, bukan ditempelkan ke tabel
 * tbl_krs_pemda, tbl_krs_pd, tbl_kro_pd, atau tabel risiko mana pun. Modul
 * PKPT hanya MEMBACA tabel risiko.
 *
 * Penamaan kolom memakai snake_case standar (gaya #3 pada
 * docs/KONVENSI_PENAMAAN_KOLOM.md) — ini tabel infrastruktur baru, bukan
 * tiruan sheet Excel/VBA, jadi tidak ada alasan memakai gaya "SPASI DAN
 * KAPITAL".
 *
 * KUNCI ASING EKSPLISIT, BUKAN POLIMORFIK. program_bupati_risiko memakai
 * risiko_tipe/risiko_id dan itu sebabnya barisnya tidak bisa dijaga kunci
 * asing — persoalan yang sudah terdata pada temuan R-08. Di sini dipakai tiga
 * kolom nullable dengan CHECK "tepat satu terisi", supaya cascadeOnDelete
 * bekerja dan risiko yang dihapus permanen tidak meninggalkan evaluasi yatim.
 */
return new class extends Migration
{
    public function up(): void
    {
        $this->tabelAcuan();
        $this->tabelPeriode();
        $this->tabelKertasKerja();
        $this->tabelHasil();
        $this->isiTabelAcuan();
    }

    // ------------------------------------------------------------------
    // Tabel acuan — angka yang ditetapkan Keputusan Inspektur
    // ------------------------------------------------------------------

    private function tabelAcuan(): void
    {
        // Tabel 3, 5, dan 6 Lampiran Keputusan. level_mr 0 berarti satuan
        // kerja belum menerapkan manajemen risiko dan belum punya register —
        // dipakai 0 dan bukan NULL supaya bisa diberi indeks unik.
        Schema::create('pkpt_bobot_kematangan', function (Blueprint $t) {
            $t->id();
            $t->unsignedTinyInteger('level_mr')->unique();
            $t->string('sebutan', 40);
            $t->text('karakteristik');
            $t->text('strategi_assurance');
            $t->text('strategi_consulting');
            $t->unsignedTinyInteger('bobot_register');
            $t->unsignedTinyInteger('bobot_faktor');
            $t->timestamps();
        });

        // Tabel 7 — konversi nilai risiko komposit 1..25 menjadi skala 1..5.
        Schema::create('pkpt_konversi_inheren', function (Blueprint $t) {
            $t->id();
            $t->unsignedTinyInteger('skala')->unique();
            $t->unsignedTinyInteger('nilai_min');
            $t->unsignedTinyInteger('nilai_max');
            $t->timestamps();
        });

        // Tabel 8 dan 9 — lima faktor pertimbangan manajemen, bobotnya, dan
        // uraian kriteria skala 1..5 masing-masing.
        Schema::create('pkpt_faktor', function (Blueprint $t) {
            $t->id();
            $t->string('kode', 5)->unique();
            $t->string('nama');
            $t->unsignedTinyInteger('bobot_persen');
            $t->enum('tipe_penilaian', ['persentase', 'centang', 'pertimbangan']);
            $t->json('kriteria');
            $t->unsignedTinyInteger('urutan');
            $t->timestamps();
        });

        // Tabel 10 — zona frekuensi pengawasan. TIGA pita.
        Schema::create('pkpt_zona_frekuensi', function (Blueprint $t) {
            $t->id();
            $t->string('zona', 20)->unique();
            $t->decimal('batas_bawah', 4, 2);
            $t->decimal('batas_atas', 4, 2);
            $t->string('frekuensi', 60);
            $t->string('warna', 40);
            $t->unsignedTinyInteger('urutan');
            $t->timestamps();
        });

        // Tingkat risiko — LIMA pita, sumbu yang BERBEDA dari zona frekuensi.
        //
        // Keduanya sempat disatukan dan itu keliru. Contoh Tabel 4.4 Perdep
        // PPKD 08/2020 memperlihatkan Total Risiko 4,0 bertingkat "Sangat
        // Tinggi" sekaligus berzona merah, sedangkan 3,9 bertingkat "Tinggi"
        // dan juga berzona merah. Zona menentukan seberapa sering diawasi
        // (3 pita), tingkat risiko menamai besarannya (5 pita).
        //
        // Batas bawah bersifat inklusif dan pita tertinggi yang batas
        // bawahnya masih terlampaui yang dipakai. Perdep menulis rentangnya
        // bertumpang tindih di ujung ("3-4 tinggi, 4-5 sangat tinggi"), dan
        // contohnya sendiri menempatkan 4,0 pada pita yang lebih tinggi.
        Schema::create('pkpt_tingkat_risiko', function (Blueprint $t) {
            $t->id();
            $t->string('nama', 40)->unique();
            $t->decimal('batas_bawah', 4, 2);
            $t->decimal('batas_atas', 4, 2);
            $t->string('warna', 40);
            $t->unsignedTinyInteger('urutan');
            $t->timestamps();
        });
    }

    // ------------------------------------------------------------------
    // Periode — dua sumbu waktu
    // ------------------------------------------------------------------

    private function tabelPeriode(): void
    {
        // PKPT tahun X+1 disusun dari data risiko tahun X, jadi tahun PKPT dan
        // tahun dasar risikonya memang dua kolom berbeda. Memaksakan satu
        // sumbu seperti PengaturanPemda.tahun_penilaian akan membuat PKPT
        // tahun depan menimpa kertas kerja tahun ini.
        Schema::create('pkpt_periode', function (Blueprint $t) {
            $t->id();
            $t->unsignedSmallInteger('tahun_pkpt')->unique();
            $t->unsignedSmallInteger('tahun_dasar_risiko');
            $t->enum('status', ['rancangan', 'ditetapkan', 'arsip'])->default('rancangan');
            $t->unsignedBigInteger('total_belanja_langsung')->nullable();
            $t->string('nomor_keputusan')->nullable();
            $t->date('tanggal_penetapan')->nullable();
            $t->foreignId('ditetapkan_oleh')->nullable()->constrained('users')->nullOnDelete();
            $t->text('catatan')->nullable();
            $t->timestamps();
            $t->softDeletes();
            $t->index('status');
        });

        Schema::create('pkpt_sektor_unggulan', function (Blueprint $t) {
            $t->id();
            $t->foreignId('periode_id')->constrained('pkpt_periode')->cascadeOnDelete();
            $t->string('nama');
            $t->timestamps();
            $t->unique(['periode_id', 'nama']);
        });
    }

    // ------------------------------------------------------------------
    // Kertas kerja — yang diisi orang
    // ------------------------------------------------------------------

    private function tabelKertasKerja(): void
    {
        // Formulir 1 — Peta Auditan.
        Schema::create('pkpt_area_pengawasan', function (Blueprint $t) {
            $t->id();
            $t->foreignId('periode_id')->constrained('pkpt_periode')->cascadeOnDelete();
            $t->enum('kelompok', ['program_prioritas', 'skpk', 'unit_lain']);
            $t->string('nama');
            $t->text('tujuan_sasaran')->nullable();
            $t->foreignId('opd_id')->nullable()->constrained('opd')->nullOnDelete();
            $t->string('opd_pendukung')->nullable();
            $t->string('urusan')->nullable();
            $t->unsignedBigInteger('pagu_anggaran')->nullable();
            $t->enum('irban', ['I', 'II', 'III', 'IV', 'Khusus'])->nullable();
            $t->unsignedSmallInteger('tahun_terakhir_diawasi')->nullable();
            $t->string('jenis_penugasan_terakhir')->nullable();
            $t->text('keterangan')->nullable();

            // Asal-usul baris, kalau ditarik otomatis. Dua kolom terpisah,
            // bukan satu kolom polimorfik — lihat catatan kepala berkas.
            $t->foreignId('krs_pemda_id')->nullable()->constrained('tbl_krs_pemda')->nullOnDelete();
            $t->foreignId('program_bupati_id')->nullable()
                ->constrained('program_pembangunan_bupati')->nullOnDelete();

            $t->timestamps();
            $t->softDeletes();
            $t->index(['periode_id', 'kelompok']);
        });

        // Formulir 2 — hasil evaluasi register risiko oleh Inspektorat.
        //
        // Yang disimpan di sini HANYA penilaian Inspekturat. Baris risiko milik
        // SKPK tidak pernah disentuh: sesuai BAB III Lampiran Keputusan,
        // pemutakhiran Register Risiko dilakukan SKPK selaku pemilik risiko.
        Schema::create('pkpt_evaluasi_risiko', function (Blueprint $t) {
            $t->id();
            $t->foreignId('periode_id')->constrained('pkpt_periode')->cascadeOnDelete();
            $t->foreignId('irs_pemda_id')->nullable()->constrained('tbl_irs_pemda')->cascadeOnDelete();
            $t->foreignId('irs_pd_id')->nullable()->constrained('tbl_irs_pd')->cascadeOnDelete();
            $t->foreignId('iro_pd_id')->nullable()->constrained('tbl_iro_pd')->cascadeOnDelete();
            $t->unsignedTinyInteger('skala_dampak_evaluasi')->nullable();
            $t->unsignedTinyInteger('skala_kemungkinan_evaluasi')->nullable();
            $t->unsignedTinyInteger('nilai_risiko_evaluasi')->nullable();
            $t->enum('simpulan', ['andal', 'perlu_perbaikan'])->default('andal');
            $t->text('catatan')->nullable();
            $t->foreignId('dinilai_oleh')->nullable()->constrained('users')->nullOnDelete();
            $t->timestamps();
            $t->softDeletes();
            $t->unique(['periode_id', 'irs_pemda_id']);
            $t->unique(['periode_id', 'irs_pd_id']);
            $t->unique(['periode_id', 'iro_pd_id']);
        });

        // Tepat satu dari tiga kolom risiko harus terisi. Tanpa ini, baris
        // evaluasi bisa menggantung tanpa menunjuk risiko mana pun, atau
        // menunjuk dua sekaligus.
        DB::statement('ALTER TABLE pkpt_evaluasi_risiko ADD CONSTRAINT chk_pkpt_evaluasi_satu_risiko CHECK ('
            .'(irs_pemda_id IS NOT NULL) + (irs_pd_id IS NOT NULL) + (iro_pd_id IS NOT NULL) = 1)');

        // Formulir 3 — tingkat kematangan MR dan pembobotan per SKPK.
        //
        // bobot_register dan bobot_faktor DISALIN ke sini, bukan dibaca ulang
        // dari pkpt_bobot_kematangan saat menghitung. Alasannya: kertas kerja
        // ini melekat pada Keputusan yang ditandatangani; kalau bobot acuan
        // diubah tahun depan, dokumen yang sudah ditetapkan tidak boleh ikut
        // berubah diam-diam.
        Schema::create('pkpt_kematangan_mr', function (Blueprint $t) {
            $t->id();
            $t->foreignId('periode_id')->constrained('pkpt_periode')->cascadeOnDelete();
            $t->foreignId('opd_id')->constrained('opd')->cascadeOnDelete();
            $t->unsignedTinyInteger('level_mr')->nullable();
            $t->enum('sumber_penetapan', [
                'maturitas_spip_skpk',
                'maturitas_spip_pemda',
                'penilaian_inspektorat',
            ])->nullable();
            $t->decimal('skor_spip', 3, 2)->nullable();
            $t->text('strategi_pengawasan')->nullable();
            $t->unsignedTinyInteger('bobot_register')->nullable();
            $t->unsignedTinyInteger('bobot_faktor')->nullable();
            $t->text('keterangan')->nullable();
            $t->timestamps();
            $t->softDeletes();
            $t->unique(['periode_id', 'opd_id']);
        });

        // Formulir 4 sampai dengan 8 — lima faktor, satu baris per Area.
        //
        // Kelimanya satu baris per Area Pengawasan dengan kolom berbeda.
        // Menyimpannya di lima tabel berarti lima join hanya untuk menghitung
        // satu angka di Formulir 9, dan lima peluang baris hilang.
        //
        // Seluruh kolom skala_* NULLABLE dan itu disengaja: null berarti
        // "datanya belum ada", berbeda dari 1 yang berarti "sudah dinilai,
        // hasilnya terendah". Perbedaan itu yang dipakai panel Kesiapan Data
        // dan yang mencegah OPD berdata paling tipis tampak paling aman.
        Schema::create('pkpt_faktor_risiko', function (Blueprint $t) {
            $t->id();
            $t->foreignId('periode_id')->constrained('pkpt_periode')->cascadeOnDelete();
            $t->foreignId('area_id')->constrained('pkpt_area_pengawasan')->cascadeOnDelete();

            $t->unsignedBigInteger('pagu_anggaran')->nullable();
            $t->decimal('persen_belanja_langsung', 6, 3)->nullable();
            $t->unsignedTinyInteger('skala_fr1')->nullable();

            $t->boolean('terkait_rpjmd')->default(false);
            $t->boolean('mendukung_rpjmn')->default(false);
            $t->boolean('sektor_unggulan')->default(false);
            $t->unsignedSmallInteger('indikator_kinerja_skpk')->nullable();
            $t->unsignedSmallInteger('indikator_kinerja_pemda')->nullable();
            $t->unsignedTinyInteger('nilai_fr2')->nullable();
            $t->unsignedTinyInteger('skala_fr2')->nullable();

            $t->boolean('temuan_internal_kurang')->default(false);
            $t->boolean('temuan_eksternal_kurang')->default(false);
            $t->boolean('potensi_fraud')->default(false);
            $t->boolean('kasus_hukum')->default(false);
            $t->unsignedTinyInteger('nilai_fr3')->nullable();
            $t->unsignedTinyInteger('skala_fr3')->nullable();

            $t->boolean('sorotan_masyarakat')->default(false);
            $t->boolean('isu_nasional')->default(false);
            $t->boolean('layanan_publik')->default(false);
            $t->boolean('hajat_hidup')->default(false);
            $t->unsignedTinyInteger('nilai_fr4')->nullable();
            $t->unsignedTinyInteger('skala_fr4')->nullable();
            $t->text('sumber_isu')->nullable();

            $t->unsignedSmallInteger('tahun_terakhir_diawasi')->nullable();
            $t->unsignedTinyInteger('skala_tahun_terakhir')->nullable();
            $t->unsignedSmallInteger('jumlah_penugasan_sejenis')->nullable();
            $t->unsignedTinyInteger('skala_pengalaman')->nullable();
            $t->decimal('skala_fr5', 3, 2)->nullable();

            $t->text('catatan_profesional')->nullable();
            $t->timestamps();
            $t->softDeletes();
            $t->unique(['periode_id', 'area_id']);
        });

        // Formulir 11 dan 12 — penugasan yang wajib dimuat dan area yang tidak
        // dimuat. Satu tabel karena bentuknya identik dan bedanya hanya alasan.
        //
        // nama_area ada di samping area_id: penugasan wajib seperti "Reviu
        // LKPD" adalah amanat peraturan, bukan Area Pengawasan hasil
        // pemeringkatan, jadi tidak selalu punya baris di Peta Auditan.
        Schema::create('pkpt_penugasan_wajib', function (Blueprint $t) {
            $t->id();
            $t->foreignId('periode_id')->constrained('pkpt_periode')->cascadeOnDelete();
            $t->enum('jenis', ['wajib', 'tidak_dimuat']);
            $t->foreignId('area_id')->nullable()
                ->constrained('pkpt_area_pengawasan')->nullOnDelete();
            $t->string('nama_area');
            $t->string('alasan');
            $t->text('dasar_hukum')->nullable();
            $t->text('keterangan')->nullable();
            $t->timestamps();
            $t->softDeletes();
            $t->index(['periode_id', 'jenis']);
        });

        // Formulir 13 dan 14 — usulan Jakwas dan PKPT. Satu tabel: Jakwas
        // adalah PKPT tanpa kolom jadwal dan sumber daya, bukan daftar yang
        // berbeda. Memisahkannya berarti dua daftar yang harus disinkronkan
        // tangan.
        Schema::create('pkpt_rencana', function (Blueprint $t) {
            $t->id();
            $t->foreignId('periode_id')->constrained('pkpt_periode')->cascadeOnDelete();
            $t->foreignId('area_id')->nullable()
                ->constrained('pkpt_area_pengawasan')->nullOnDelete();
            $t->string('nama_area');
            $t->string('jenis_pengawasan')->nullable();
            $t->text('tujuan_sasaran')->nullable();
            $t->string('ruang_lingkup')->nullable();
            $t->string('rmp', 40)->nullable();
            $t->string('rpl', 40)->nullable();
            $t->unsignedSmallInteger('hp_pj')->nullable();
            $t->unsignedSmallInteger('hp_wpj')->nullable();
            $t->unsignedSmallInteger('hp_kt')->nullable();
            $t->unsignedSmallInteger('hp_at')->nullable();
            $t->unsignedSmallInteger('hp_jumlah')->nullable();
            $t->unsignedBigInteger('anggaran')->nullable();
            $t->string('jumlah_laporan', 40)->nullable();
            $t->string('sarana_prasarana')->nullable();
            $t->string('tingkat_risiko', 40)->nullable();
            $t->decimal('total_nilai_risiko', 4, 2)->nullable();
            $t->enum('sumber', ['risiko', 'wajib', 'permintaan'])->default('risiko');
            $t->unsignedSmallInteger('urutan')->default(0);
            $t->text('keterangan')->nullable();
            $t->timestamps();
            $t->softDeletes();
            $t->index(['periode_id', 'urutan']);
        });
    }

    // ------------------------------------------------------------------
    // Hasil perhitungan
    // ------------------------------------------------------------------

    private function tabelHasil(): void
    {
        // Formulir 9 dan 10. Hasil DISIMPAN, bukan dihitung ulang tiap kali
        // halaman dibuka — supaya angka pada lampiran Keputusan yang sudah
        // ditandatangani tidak berubah ketika bobot acuan disunting.
        Schema::create('pkpt_penilaian', function (Blueprint $t) {
            $t->id();
            $t->foreignId('periode_id')->constrained('pkpt_periode')->cascadeOnDelete();
            $t->foreignId('area_id')->constrained('pkpt_area_pengawasan')->cascadeOnDelete();

            $t->unsignedTinyInteger('level_mr')->nullable();
            $t->unsignedSmallInteger('jumlah_risiko')->default(0);
            $t->decimal('rld', 5, 2)->nullable();
            $t->decimal('rlk', 5, 2)->nullable();
            $t->decimal('nilai_komposit', 6, 2)->nullable();
            $t->unsignedTinyInteger('skala_inheren')->nullable();
            $t->unsignedTinyInteger('bobot_register')->nullable();

            $t->decimal('skala_fpm', 4, 2)->nullable();
            $t->unsignedTinyInteger('bobot_faktor')->nullable();

            // Berapa persen bobot faktor yang benar-benar terpakai. Faktor
            // yang datanya belum ada dikeluarkan dari pembagi, bukan dianggap
            // nol, dan porsinya dicatat di sini supaya terbaca di kertas kerja.
            $t->unsignedTinyInteger('bobot_faktor_terpakai')->default(0);

            $t->decimal('total_nilai_risiko', 4, 2)->nullable();
            $t->string('tingkat_risiko', 40)->nullable();
            $t->string('zona', 20)->nullable();
            $t->string('frekuensi', 60)->nullable();
            $t->json('rencana_tahun')->nullable();
            $t->text('keterangan')->nullable();
            $t->timestamp('dihitung_pada')->nullable();
            $t->timestamps();
            $t->unique(['periode_id', 'area_id']);
            $t->index(['periode_id', 'total_nilai_risiko']);
        });
    }

    // ------------------------------------------------------------------
    // Isi awal tabel acuan — angka Lampiran Keputusan
    // ------------------------------------------------------------------

    private function isiTabelAcuan(): void
    {
        $now = now();

        DB::table('pkpt_bobot_kematangan')->insert([
            [
                'level_mr' => 0,
                'sebutan' => 'Belum menerapkan MR',
                'karakteristik' => 'Belum menerapkan manajemen risiko dan belum memiliki Register Risiko.',
                'strategi_assurance' => 'Audit berbasis pengendalian (control based audit).',
                'strategi_consulting' => 'Fasilitasi penyusunan Register Risiko.',
                'bobot_register' => 0, 'bobot_faktor' => 100,
                'created_at' => $now, 'updated_at' => $now,
            ],
            [
                'level_mr' => 1,
                'sebutan' => 'Risk Naive',
                'karakteristik' => 'Belum memiliki pendekatan formal dalam menerapkan manajemen risiko.',
                'strategi_assurance' => 'Audit berbasis pengendalian (control based audit) dan audit berbasis proses (process based audit).',
                'strategi_consulting' => 'Fasilitasi penerapan manajemen risiko sesuai kebijakan manajemen risiko Pemerintah Kabupaten.',
                'bobot_register' => 40, 'bobot_faktor' => 60,
                'created_at' => $now, 'updated_at' => $now,
            ],
            [
                'level_mr' => 2,
                'sebutan' => 'Risk Aware',
                'karakteristik' => 'Pendekatan manajemen risiko masih terkotak-kotak pada masing-masing unit.',
                'strategi_assurance' => 'Audit berbasis pengendalian (control based audit) dan audit berbasis proses (process based audit).',
                'strategi_consulting' => 'Fasilitasi penerapan manajemen risiko sesuai kebijakan manajemen risiko Pemerintah Kabupaten.',
                'bobot_register' => 40, 'bobot_faktor' => 60,
                'created_at' => $now, 'updated_at' => $now,
            ],
            [
                'level_mr' => 3,
                'sebutan' => 'Risk Defined',
                'karakteristik' => 'Telah memiliki strategi dan kebijakan manajemen risiko yang dikomunikasikan dan diimplementasikan, serta telah menetapkan selera risiko.',
                'strategi_assurance' => 'Audit berbasis pengendalian, audit berbasis proses, dan audit berbasis risiko (risk-based audit).',
                'strategi_consulting' => 'Fasilitasi dalam rangka internalisasi manajemen risiko ke dalam proses bisnis.',
                'bobot_register' => 70, 'bobot_faktor' => 30,
                'created_at' => $now, 'updated_at' => $now,
            ],
            [
                'level_mr' => 4,
                'sebutan' => 'Risk Managed',
                'karakteristik' => 'Telah menggunakan pendekatan menyeluruh dalam mengembangkan manajemen risiko dan mengomunikasikan penerapannya.',
                'strategi_assurance' => 'Audit berbasis pengendalian, audit berbasis proses, audit berbasis risiko, dan audit atas efektivitas manajemen risiko secara keseluruhan.',
                'strategi_consulting' => 'Fasilitasi dilakukan sesuai dengan kebutuhan.',
                'bobot_register' => 90, 'bobot_faktor' => 10,
                'created_at' => $now, 'updated_at' => $now,
            ],
            [
                'level_mr' => 5,
                'sebutan' => 'Risk Enabled',
                'karakteristik' => 'Manajemen risiko dan pengendalian intern telah sepenuhnya menyatu pada kegiatan operasional organisasi.',
                'strategi_assurance' => 'Audit berbasis pengendalian, audit berbasis proses, audit berbasis risiko, dan audit atas efektivitas manajemen risiko secara keseluruhan.',
                'strategi_consulting' => 'Fasilitasi dilakukan sesuai dengan kebutuhan.',
                'bobot_register' => 90, 'bobot_faktor' => 10,
                'created_at' => $now, 'updated_at' => $now,
            ],
        ]);

        DB::table('pkpt_konversi_inheren')->insert([
            ['skala' => 1, 'nilai_min' => 1, 'nilai_max' => 5, 'created_at' => $now, 'updated_at' => $now],
            ['skala' => 2, 'nilai_min' => 6, 'nilai_max' => 10, 'created_at' => $now, 'updated_at' => $now],
            ['skala' => 3, 'nilai_min' => 11, 'nilai_max' => 15, 'created_at' => $now, 'updated_at' => $now],
            ['skala' => 4, 'nilai_min' => 16, 'nilai_max' => 20, 'created_at' => $now, 'updated_at' => $now],
            ['skala' => 5, 'nilai_min' => 21, 'nilai_max' => 25, 'created_at' => $now, 'updated_at' => $now],
        ]);

        DB::table('pkpt_faktor')->insert([
            [
                'kode' => 'FR1', 'nama' => 'Anggaran', 'bobot_persen' => 25,
                'tipe_penilaian' => 'persentase', 'urutan' => 1,
                'kriteria' => json_encode([
                    1 => 'Perbandingan anggaran program terhadap anggaran belanja langsung APBK kurang dari 2%',
                    2 => 'Kurang dari 5%',
                    3 => 'Kurang dari 10%',
                    4 => 'Kurang dari 15%',
                    5 => '15% atau lebih',
                ]),
                'created_at' => $now, 'updated_at' => $now,
            ],
            [
                'kode' => 'FR2',
                'nama' => 'Keterkaitan dengan RPJMD, RPJMN, dan sektor unggulan daerah',
                'bobot_persen' => 25, 'tipe_penilaian' => 'centang', 'urutan' => 2,
                'kriteria' => json_encode([
                    1 => 'Tidak terkait langsung dengan tujuan/sasaran RPJMD, tidak mendukung RPJMN, bukan sektor unggulan',
                    2 => 'Terkait langsung dengan tujuan/sasaran RPJMD',
                    3 => 'Terkait langsung dan mendukung RPJMN',
                    4 => 'Terkait langsung dan termasuk sektor unggulan daerah',
                    5 => 'Terkait langsung, mendukung RPJMN, dan termasuk sektor unggulan daerah',
                ]),
                'created_at' => $now, 'updated_at' => $now,
            ],
            [
                'kode' => 'FR3',
                'nama' => 'Temuan dan tindak lanjut, potensi kecurangan, kasus hukum',
                'bobot_persen' => 20, 'tipe_penilaian' => 'centang', 'urutan' => 3,
                'kriteria' => json_encode([
                    1 => 'Tidak ada kondisi terpenuhi',
                    2 => '1 kondisi terpenuhi',
                    3 => '2 kondisi terpenuhi',
                    4 => '3 kondisi terpenuhi',
                    5 => 'Seluruh kondisi terpenuhi',
                ]),
                'created_at' => $now, 'updated_at' => $now,
            ],
            [
                'kode' => 'FR4', 'nama' => 'Isu terkini terkait program',
                'bobot_persen' => 15, 'tipe_penilaian' => 'centang', 'urutan' => 4,
                'kriteria' => json_encode([
                    1 => 'Tidak ada kondisi terpenuhi',
                    2 => '1 kondisi terpenuhi',
                    3 => '2 kondisi terpenuhi',
                    4 => '3 kondisi terpenuhi',
                    5 => 'Seluruh kondisi terpenuhi',
                ]),
                'created_at' => $now, 'updated_at' => $now,
            ],
            [
                'kode' => 'FR5',
                'nama' => 'Pertimbangan lain: tahun terakhir diawasi dan pengalaman SDM',
                'bobot_persen' => 15, 'tipe_penilaian' => 'pertimbangan', 'urutan' => 5,
                'kriteria' => json_encode([
                    1 => 'Tahun terakhir diawasi adalah tahun lalu; SDM belum pernah melakukan penugasan sejenis',
                    2 => 'Tahun terakhir diawasi 2 tahun lalu; SDM sudah 1 kali melakukan penugasan sejenis',
                    3 => 'Tahun terakhir diawasi 3 tahun lalu; SDM sudah 2 kali melakukan penugasan sejenis',
                    4 => 'Tahun terakhir diawasi 4 tahun lalu; SDM sudah 3 kali melakukan penugasan sejenis',
                    5 => 'Tahun terakhir diawasi 5 tahun lalu; SDM lebih dari 3 kali melakukan penugasan sejenis',
                ]),
                'created_at' => $now, 'updated_at' => $now,
            ],
        ]);

        DB::table('pkpt_zona_frekuensi')->insert([
            [
                'zona' => 'Merah', 'batas_bawah' => 3.00, 'batas_atas' => 5.00,
                'frekuensi' => 'Setiap tahun',
                'warna' => 'bg-red-500 text-black', 'urutan' => 1,
                'created_at' => $now, 'updated_at' => $now,
            ],
            [
                'zona' => 'Kuning', 'batas_bawah' => 2.00, 'batas_atas' => 3.00,
                'frekuensi' => 'Setiap 2 sampai dengan 3 tahun',
                'warna' => 'bg-yellow-400 text-black', 'urutan' => 2,
                'created_at' => $now, 'updated_at' => $now,
            ],
            [
                'zona' => 'Hijau', 'batas_bawah' => 0.00, 'batas_atas' => 2.00,
                'frekuensi' => 'Setiap 4 sampai dengan 5 tahun',
                'warna' => 'bg-green-600 text-white', 'urutan' => 3,
                'created_at' => $now, 'updated_at' => $now,
            ],
        ]);

        DB::table('pkpt_tingkat_risiko')->insert([
            ['nama' => 'Sangat Tinggi', 'batas_bawah' => 4.00, 'batas_atas' => 5.00,
                'warna' => 'bg-red-500 text-black', 'urutan' => 1,
                'created_at' => $now, 'updated_at' => $now],
            ['nama' => 'Tinggi', 'batas_bawah' => 3.00, 'batas_atas' => 4.00,
                'warna' => 'bg-orange-400 text-black', 'urutan' => 2,
                'created_at' => $now, 'updated_at' => $now],
            ['nama' => 'Sedang', 'batas_bawah' => 2.00, 'batas_atas' => 3.00,
                'warna' => 'bg-yellow-400 text-black', 'urutan' => 3,
                'created_at' => $now, 'updated_at' => $now],
            ['nama' => 'Rendah', 'batas_bawah' => 1.00, 'batas_atas' => 2.00,
                'warna' => 'bg-sky-400 text-black', 'urutan' => 4,
                'created_at' => $now, 'updated_at' => $now],
            ['nama' => 'Sangat Rendah', 'batas_bawah' => 0.00, 'batas_atas' => 1.00,
                'warna' => 'bg-green-600 text-white', 'urutan' => 5,
                'created_at' => $now, 'updated_at' => $now],
        ]);
    }

    public function down(): void
    {
        foreach ([
            'pkpt_penilaian',
            'pkpt_rencana',
            'pkpt_penugasan_wajib',
            'pkpt_faktor_risiko',
            'pkpt_kematangan_mr',
            'pkpt_evaluasi_risiko',
            'pkpt_area_pengawasan',
            'pkpt_sektor_unggulan',
            'pkpt_periode',
            'pkpt_tingkat_risiko',
            'pkpt_zona_frekuensi',
            'pkpt_faktor',
            'pkpt_konversi_inheren',
            'pkpt_bobot_kematangan',
        ] as $tabel) {
            Schema::dropIfExists($tabel);
        }
    }
};
