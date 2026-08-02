"""Menyusun naskah video Lapor Kejadian Risiko.

Dua sisi, dua kasus:
  sisi pelapor  - warga atau pegawai yang tidak punya akun, masuk lewat QR
  sisi PIC      - menelaah, menautkan risikonya, mencatat ke Formulir 10

  kasus pertama - kejadian dari risiko yang SUDAH terdaftar
  kasus kedua   - kejadian yang risikonya BELUM terdaftar sama sekali,
                  sehingga PIC harus membuat risikonya dulu lengkap dengan RTP

Kasus kedua itu bukan karangan: Formulir 10 memang menolak dicatat tanpa
risiko terdaftar, dan pembatasan itu tertulis di LaporanKejadianController.
"""
import io
import json
import os

DIR = os.path.dirname(os.path.abspath(__file__))
P = os.path.join(DIR, "naskah-lapor.json")

n = [0]


def N(suara, teks):
    n[0] += 1
    return {"id": f"L{n[0]:03d}", "suara": suara, "teks": teks}


def L(idl, narasi, aksi):
    return {"id": idl, "narasi": narasi, "aksi": aksi}


JENIS = "35 - Pembinaan dan Pengawasan"
TW4 = "Triwulan IV (Oktober/November/Desember)"
CELAH_C = "c.Kebijakan belum diikuti dengan prosedur baku"

naskah = {
    "judul": "Tutorial Lapor Kejadian Risiko",
    "keterangan": "Naskah video kedua: alur laporan kejadian risiko dari sisi pelapor sampai masuk rencana tindak pengendalian.",
    "suara": {"L": "id-ID-ArdiNeural", "P": "id-ID-GadisNeural"},
    "bagian": [

        # ── I ────────────────────────────────────────────────────────────────
        {"nomor": "I", "judul": "Sebelum mulai", "akun": "LAPOR", "dariLogin": True, "langkah": [
            L("I-01", [
                N("L", "Video ini tentang satu hal yang sering terlewat: apa yang terjadi setelah risiko benar-benar terjadi."),
                N("P", "Semua formulir yang lain berbicara tentang sesuatu yang belum terjadi. Yang ini tentang yang sudah."),
                N("L", "Dan ia punya dua sisi. Sisi pelapor — siapa pun yang melihat kejadiannya, termasuk pegawai yang tidak punya akun aplikasi. Lalu sisi PIC, yang menelaah laporan itu dan menindaklanjutinya."),
            ], [
                {"t": "judul", "nomor": "1", "teks": "Sebelum mulai", "ms": 5000},
                {"t": "jeda", "ms": 700},
            ]),
            L("I-02", [
                N("P", "Kita akan menempuh dua kasus, karena aplikasinya memang memperlakukannya berbeda."),
                N("L", "Kasus pertama: kejadian yang risikonya sudah terdaftar di kertas kerja. Ini yang paling sering, dan paling cepat diselesaikan."),
                N("P", "Kasus kedua: kejadian yang risikonya belum pernah terdaftar sama sekali. Ini yang paling penting dipahami, karena penanganannya berbeda dan tidak bisa dilompati."),
                N("L", "Seperti video tutorial sebelumnya, seluruh isian di sini data contoh. Untuk laporan yang sesungguhnya, isinya kembali kepada kejadian yang benar-benar Anda lihat."),
            ], [
                {"t": "judul", "teks": "Seluruh isian dalam video ini adalah DATA CONTOH", "ms": 8000},
                {"t": "jeda", "ms": 800},
            ]),
            L("I-03", [
                N("P", "Kita mulai dari sisi pelapor, dan perhatikan bagaimana ia masuk."),
                N("L", "Pelapor tidak mengetik nama pengguna dan kata sandi. Ia memindai kode QR yang ditempel di kantor atau dibagikan lewat pesan, dan kode itu langsung membawanya ke formulir lapor."),
                N("P", "Ini disengaja. Orang yang baru melihat kejadian tidak boleh dihalangi urusan akun."),
            ], [
                {"t": "buka", "url": "/login/lapor-kejadian"},
                {"t": "jeda", "ms": 2600},
            ]),
            L("I-04", [
                N("L", "Perhatikan menu di sebelah kiri. Isinya cuma tiga."),
                N("P", "Akun ini akun bersama yang dipakai banyak orang, jadi jangkauannya sengaja dibuat sesempit mungkin. Ia tidak bisa membuka data risiko perangkat daerah mana pun, tidak bisa mengubah apa pun, dan tidak bisa melihat laporan orang lain."),
                N("L", "Yang bisa dilakukannya hanya satu: melapor."),
            ], [
                {"t": "sorot", "teks": "Lapor Kejadian Risiko", "ms": 2600},
                {"t": "jeda", "ms": 1200},
            ]),
        ]},

        # ── II ───────────────────────────────────────────────────────────────
        {"nomor": "II", "judul": "Pelapor: kejadian dari risiko yang sudah terdaftar", "akun": "LAPOR", "langkah": [
            L("II-01", [
                N("P", "Di bagian atas formulir ada dua mode pelaporan, dan pilihan inilah yang menentukan seluruh sisanya."),
                N("L", "Cek Risiko yang Sudah Terjadi dipakai kalau pelapor tahu kejadian ini berasal dari risiko yang memang sudah terdaftar. Lapor Kejadian Baru dipakai kalau tidak."),
                N("P", "Kalau pelapor ragu, pilih saja Lapor Kejadian Baru. Menautkannya nanti adalah pekerjaan PIC, bukan pekerjaan pelapor."),
                N("L", "Untuk kasus pertama ini kita pilih yang kiri."),
            ], [
                {"t": "buka", "url": "/lapor-kejadian"},
                {"t": "jeda", "ms": 1400},
                {"t": "klik", "teks": "Cek Risiko yang Sudah Terjadi", "tunggu": 1400},
            ]),
            L("II-02", [
                N("L", "Muncul kolom pencarian risiko terdaftar. Ia menelusuri ketiga tingkatan sekaligus — risiko strategis pemerintah daerah, strategis perangkat daerah, dan operasional."),
                N("P", "Kita cari risiko tentang pengawasan yang tidak sesuai program kerja pengawasan tahunan."),
                N("L", "Begitu risikonya dipilih, laporan ini otomatis tertaut ke sana. Itu menghemat satu langkah telaah PIC nanti."),
            ], [
                {"t": "ketik", "ph": "Ketik uraian risiko", "teks": "pengawasan internal tidak sesuai", "laju": 1.4},
                {"t": "jeda", "ms": 1800},
            ]),
            L("II-03", [
                N("P", "Sekarang identitas pelapor dan isi kejadiannya."),
                N("L", "Nama wajib. Surel dan nomor telepon boleh dikosongkan — banyak pelapor tidak ingin dihubungi, dan aplikasi tidak memaksanya."),
                N("P", "Perangkat daerah terkait juga boleh dikosongkan. Pelapor awam belum tentu tahu perangkat daerah mana yang mengurusnya, dan Admin bisa melengkapinya belakangan."),
            ], [
                {"t": "ketik", "kolomLabel": "Nama Lengkap", "teks": "Rahmat Hidayat", "laju": 1.3},
                {"t": "ketik", "kolomLabel": "Email", "teks": "rahmat.hidayat@contoh.go.id", "laju": 1.8},
                {"t": "pilih", "pemicu": "Tidak ada OPD", "nilai": "INSPEKTORAT", "cari": "INSPEK"},
            ]),
            L("II-04", [
                N("L", "Kolom Kejadian adalah inti laporan ini, dan ada satu hal yang membedakannya dari pernyataan risiko."),
                N("P", "Pernyataan risiko ditulis sebagai sesuatu yang bisa terjadi. Kejadian ditulis sebagai sesuatu yang sudah terjadi — dengan waktu, tempat, dan angka kalau ada."),
                N("L", "Makin jelas kejadiannya ditulis, makin sedikit PIC harus menebak."),
            ], [
                {"t": "ketik", "ph": "Jelaskan kejadian risiko", "teks": "Dua penugasan pengawasan pada Triwulan III tidak dapat dilaksanakan sesuai jadwal Program Kerja Pengawasan Tahunan karena auditor yang ditugaskan sedang menangani pemeriksaan khusus.", "laju": 1.5},
                {"t": "ketik", "kolomLabel": "Tempat", "teks": "Kantor Inspektorat Kabupaten Aceh Barat", "laju": 1.8},
            ]),
            L("II-05", [
                N("P", "Waktu kejadian diisi lewat pemilih tanggal dan jam."),
                N("L", "Kalau kejadiannya berlangsung berhari-hari, isikan saat pertama kali diketahui — itu yang berguna untuk menelusuri kembali."),
            ], [
                {"t": "klik", "teks": "Pilih tanggal", "tunggu": 1200},
                {"t": "klik", "teks": "15", "tunggu": 900},
                {"t": "jeda", "ms": 800},
            ]),
            L("II-06", [
                N("L", "Terakhir, Pemicu. Bentuknya sama persis dengan kolom penyebab risiko yang dipakai PIC — internal delapan kategori, eksternal enam."),
                N("P", "Pelapor tidak wajib mengisinya, dan tidak perlu merasa harus tahu penggolongannya. Tetapi kalau ia tahu apa yang memicu, mengisinya sangat membantu — karena inilah bahan yang dipakai PIC menilai apakah risikonya perlu dinilai ulang."),
                N("L", "Kita tandai Men dan Method."),
            ], [
                {"t": "centang", "label": "Men", "teks": "Auditor yang dijadwalkan sedang ditugaskan pada pemeriksaan khusus", "laju": 1.6},
                {"t": "centang", "label": "Method", "teks": "Penjadwalan ulang penugasan belum diatur ketika ada permintaan pemeriksaan di luar rencana", "laju": 1.6},
            ]),
            L("II-07", [
                N("P", "Kirim laporannya."),
                N("L", "Begitu terkirim, PIC perangkat daerah terkait langsung menerima pemberitahuan. Pelapor tidak perlu menelepon siapa pun."),
                N("P", "Dan pekerjaan pelapor selesai sampai di sini. Sisanya bukan urusannya."),
            ], [
                {"t": "klik", "teks": "Lapor", "tunggu": 3000, "simpan": True},
                {"t": "jeda", "ms": 1800},
            ]),
        ]},

        # ── III ──────────────────────────────────────────────────────────────
        {"nomor": "III", "judul": "PIC menelaah laporan pertama", "akun": "PIC_INSPEKTORAT", "langkah": [
            L("III-01", [
                N("L", "Sekarang kita berpindah ke sisi PIC, dengan akun yang berbeda."),
                N("P", "Laporan yang masuk berkumpul di menu Utilities, Rekap Lapor Kejadian Risiko."),
                N("L", "Perhatikan statusnya: baru. Ada empat status yang berjalan berurutan — baru, diverifikasi, ditindaklanjuti, dan selesai."),
            ], [
                {"t": "judul", "nomor": "3", "teks": "PIC menelaah laporan", "ms": 5000},
                {"t": "menu", "jalur": ["Utilities", "Rekap Lapor Kejadian Risiko"]},
                {"t": "jeda", "ms": 2600},
            ]),
            L("III-02", [
                N("P", "Langkah pertama PIC bukan langsung menindaklanjuti, melainkan memverifikasi."),
                N("L", "Yang diperiksa tiga hal: benarkah kejadiannya, benarkah ini urusan perangkat daerah kita, dan benarkah risikonya yang tertaut itu."),
                N("P", "Laporan ini sudah tertaut ke risiko terdaftar karena pelapornya memilihnya sendiri. PIC tinggal memastikan tautannya memang tepat."),
                N("L", "Kalau ternyata keliru, tautannya bisa diganti dari sini juga."),
            ], [
                {"t": "gulir", "px": 320},
                {"t": "jeda", "ms": 3000},
            ]),
            L("III-03", [
                N("L", "Karena risikonya sudah terdaftar dan tautannya benar, tombol Catat ke Formulir 10 tersedia."),
                N("P", "Inilah yang mengubah laporan menjadi catatan resmi. Sebelum dicatat, ia baru laporan; sesudah dicatat, ia menjadi kejadian risiko yang masuk ke kertas kerja dan ikut terbaca di Dasbor."),
                N("L", "Perhatikan satu hal penting: tombol ini hanya muncul kalau laporannya sudah tertaut ke risiko terdaftar. Alasannya akan sangat jelas di kasus kedua nanti."),
            ], [
                {"t": "jeda", "ms": 3200},
            ]),
            L("III-04", [
                N("P", "Sesudah dicatat, statusnya dinaikkan menjadi ditindaklanjuti, lalu selesai setelah penanganannya rampung."),
                N("L", "Catatan tindak lanjut sebaiknya diisi. Ia yang menjelaskan kepada penilai berikutnya apa yang benar-benar dikerjakan, bukan sekadar bahwa laporannya sudah ditutup."),
            ], [
                {"t": "jeda", "ms": 2600},
            ]),
        ]},

        # ── IV ───────────────────────────────────────────────────────────────
        {"nomor": "IV", "judul": "Pelapor: kejadian yang risikonya belum terdaftar", "akun": "LAPOR", "langkah": [
            L("IV-01", [
                N("L", "Sekarang kasus kedua, dan inilah yang paling perlu dipahami."),
                N("P", "Kali ini kejadiannya tidak berasal dari risiko mana pun yang terdaftar. Sesuatu terjadi yang memang belum pernah terpikirkan saat penilaian risiko disusun."),
                N("L", "Itu bukan kegagalan. Justru begitulah manajemen risiko bekerja — daftar risiko tidak pernah lengkap, dan kejadian nyata yang melengkapinya."),
            ], [
                {"t": "judul", "nomor": "4", "teks": "Kejadian yang risikonya belum terdaftar", "ms": 5400},
                {"t": "buka", "url": "/lapor-kejadian"},
                {"t": "jeda", "ms": 1400},
                {"t": "klik", "teks": "Lapor Kejadian Baru", "tunggu": 1400},
            ]),
            L("IV-02", [
                N("P", "Perhatikan, kolom pencarian risiko tidak muncul. Memang tidak ada yang bisa dicari."),
                N("L", "Kejadiannya: surat tugas pemeriksaan terbit setelah kegiatan dimulai."),
                N("P", "Ini tidak ada di daftar risiko mana pun. Ia bukan soal jumlah auditor, bukan soal tindak lanjut, bukan soal sistem informasi."),
            ], [
                {"t": "ketik", "kolomLabel": "Nama Lengkap", "teks": "Rahmat Hidayat", "laju": 1.6},
                {"t": "pilih", "pemicu": "Tidak ada OPD", "nilai": "INSPEKTORAT", "cari": "INSPEK"},
                {"t": "ketik", "ph": "Jelaskan kejadian risiko", "teks": "Surat tugas untuk satu penugasan pemeriksaan terbit tiga hari setelah kegiatan pemeriksaan dimulai, sehingga sebagian kegiatan berjalan tanpa dasar administratif yang lengkap.", "laju": 1.5},
                {"t": "ketik", "kolomLabel": "Tempat", "teks": "Kantor Inspektorat Kabupaten Aceh Barat", "laju": 2.0},
            ]),
            L("IV-03", [
                N("L", "Pemicunya kita tandai Method, karena persoalannya ada pada urutan prosedur — bukan pada orangnya."),
                N("P", "Lalu dikirim. Sampai di sini pekerjaan pelapor sama saja dengan kasus pertama."),
            ], [
                {"t": "centang", "label": "Method", "teks": "Penerbitan surat tugas belum diatur harus selesai sebelum kegiatan dimulai", "laju": 1.6},
                {"t": "klik", "teks": "Lapor", "tunggu": 3000, "simpan": True},
                {"t": "jeda", "ms": 1600},
            ]),
        ]},

        # ── V ────────────────────────────────────────────────────────────────
        {"nomor": "V", "judul": "PIC membuat risiko yang belum terdaftar", "akun": "PIC_INSPEKTORAT", "langkah": [
            L("V-01", [
                N("L", "Kembali ke sisi PIC. Laporan kedua sudah masuk."),
                N("P", "Perhatikan bedanya dengan yang pertama: tombol Catat ke Formulir 10 tidak ada."),
                N("L", "Ini bukan kekurangan aplikasi, melainkan pembatasan yang disengaja. Formulir 10 mencatat kejadian dari sebuah risiko, jadi ia selalu butuh risiko yang sudah terdaftar. Tanpa itu, kejadiannya akan menggantung tanpa induk."),
                N("P", "Artinya PIC harus mengerjakan satu hal dulu: mendaftarkan risikonya."),
            ], [
                {"t": "judul", "nomor": "5", "teks": "PIC membuat risikonya lebih dulu", "ms": 5400},
                {"t": "menu", "jalur": ["Utilities", "Rekap Lapor Kejadian Risiko"]},
                {"t": "jeda", "ms": 3200},
            ]),
            L("V-02", [
                N("L", "Kita buka Formulir 3b, Identifikasi Risiko Operasional Perangkat Daerah."),
                N("P", "Dalam keadaan sebenarnya ini dibuka di tab baru, supaya rekap laporannya tidak perlu ditinggalkan."),
                N("L", "Kejadiannya ada di tahap perencanaan penugasan, jadi tahapnya Perencanaan — bukan Pelaksanaan, walaupun akibatnya terasa saat pelaksanaan."),
            ], [
                {"t": "menu", "jalur": ["Form Input", "Risiko", "Risiko Operasional PD", "III_b_IRO_PD"]},
                {"t": "klik", "teks": "Tambah Data", "tunggu": 1600},
                {"t": "pilih", "ph": "Pilih Kegiatan PD", "nilai": "Penyelenggaraan Pengawasan Internal"},
            ]),
            L("V-03", [
                N("P", "Sekarang perhatikan cara merumuskan risikonya, karena ini yang paling sering keliru."),
                N("L", "Yang kita punya adalah kejadian: surat tugas terbit terlambat. Tetapi yang dicatat di sini bukan kejadiannya, melainkan risikonya."),
                N("P", "Kejadian adalah satu peristiwa yang sudah lewat. Risiko adalah kemungkinan peristiwa itu terjadi lagi."),
                N("L", "Jadi rumusannya bukan surat tugas terbit tiga hari terlambat, melainkan penerbitan surat tugas terlambat sehingga penugasan dimulai tanpa dasar administratif yang lengkap."),
            ], [
                {"t": "ketik", "sel": "[id='URAIAN RISIKO']", "teks": "Penerbitan surat tugas terlambat sehingga penugasan pengawasan dimulai tanpa dasar administratif yang lengkap", "laju": 1.4},
                {"t": "pilih", "ph": "Pilih Jenis Risiko", "cari": "Pembinaan", "nilai": JENIS},
                {"t": "pilih", "ph": "Pilih Tahap", "nilai": "Perencanaan"},
                {"t": "ketik", "sel": "[id='PEMILIK RISIKO']", "teks": "Sekretaris Inspektorat", "laju": 1.7},
            ]),
            L("V-04", [
                N("L", "Penyebabnya kita ambil langsung dari pemicu yang ditulis pelapor. Itu gunanya kolom pemicu tadi."),
                N("P", "Method, karena urutan prosedurnya yang belum diatur. Terkendali, karena penerbitan surat tugas sepenuhnya di dalam kuasa Inspektorat sendiri."),
            ], [
                {"t": "centang", "label": "Method", "teks": "Belum ada ketentuan bahwa surat tugas harus terbit sebelum kegiatan pemeriksaan dimulai", "laju": 1.5},
                {"t": "klik", "teks": "C", "tunggu": 700},
                {"t": "ketik", "sel": "[id='URAIAN DAMPAK RISIKO']", "teks": "Sebagian kegiatan pemeriksaan berjalan tanpa dasar administratif yang lengkap sehingga hasilnya berpotensi dipersoalkan", "laju": 1.5},
                {"t": "ketik", "sel": "[id='PIHAK YANG TERKENA DAMPAK RISIKO']", "teks": "Inspektorat dan Perangkat Daerah yang diperiksa", "laju": 1.8},
            ]),
            L("V-05", [
                N("P", "Pengendalian yang sudah ada, dan di sinilah kejujuran diuji."),
                N("L", "Prosedur penugasannya memang ada, tetapi belum mengatur urutan waktunya. Jadi kategorinya Kurang Efektif, dan celahnya kriteria c — kebijakan sudah ada tetapi belum diikuti prosedur baku yang jelas."),
                N("P", "Satu hal yang perlu disadari: skala kemungkinan risiko ini tidak boleh dinilai rendah. Kita tahu ia sudah terjadi sekali, dan itu bukan dugaan melainkan catatan."),
                N("L", "Inilah sumbangan terbesar laporan kejadian terhadap penilaian risiko — ia mengoreksi tebakan dengan kenyataan."),
            ], [
                {"t": "klik", "teks": "Ya", "tunggu": 900},
                {"t": "ketik", "sel": "[id='URAIAN PENGENDALIAN YANG SUDAH ADA']", "teks": "Prosedur penugasan pengawasan dan penerbitan surat tugas oleh Sekretariat", "laju": 1.7},
                {"t": "klik", "teks": "KE", "tunggu": 700},
                {"t": "centang", "label": CELAH_C, "tunggu": 600},
            ]),
            L("V-06", [
                N("L", "Skalanya kita isi lewat matriks."),
                N("P", "Inheren dampak tiga kemungkinan empat. Sekarang dampak tiga kemungkinan tiga — pengendalian yang ada sedikit menurunkan peluangnya, tetapi tidak menghilangkannya."),
                N("L", "Target dampak tiga kemungkinan dua, setelah rencana tindaknya dijalankan."),
            ], [
                {"t": "klik", "teks": "Isi Nilai Risiko", "tunggu": 1600},
                {"t": "matriks", "titik": "IInheren", "d": 3, "k": 4},
                {"t": "matriks", "titik": "RResidual/Current", "d": 3, "k": 3},
                {"t": "matriks", "titik": "TTarget", "d": 3, "k": 2},
                {"t": "jeda", "ms": 1600},
                {"t": "klik", "teks": "Selesai", "tunggu": 1400},
            ]),
            L("V-07", [
                N("P", "Rencana tindak pengendaliannya, dan inilah tujuan seluruh perjalanan ini."),
                N("L", "Laporan seorang pegawai tentang satu surat tugas yang terlambat, berakhir menjadi rencana perbaikan yang punya penanggung jawab dan tenggat."),
                N("P", "Isinya konkret: menetapkan bahwa surat tugas terbit paling lambat satu hari sebelum kegiatan dimulai, dan memasukkannya ke dalam prosedur baku penugasan."),
                N("L", "Lalu disimpan."),
            ], [
                {"t": "centang", "label": "Abate", "teks": "Menetapkan dalam prosedur baku bahwa surat tugas pemeriksaan terbit paling lambat satu hari sebelum kegiatan dimulai, dan menjadikannya syarat pembukaan penugasan", "laju": 1.5},
                {"t": "pilih", "ph": "Pilih OPD", "cari": "INSPEK", "nilai": "INSPEKTORAT"},
                {"t": "ketik", "sel": "[id='PENANGGUNG JAWAB PENGENDALIAN']", "teks": "Sekretaris Inspektorat", "laju": 1.8},
                {"t": "pilih", "ph": "Pilih Triwulan", "nilai": TW4},
                {"t": "ketik", "sel": "[id='TAHUN TARGET PENYELESAIAN']", "teks": "2026", "bersihkan": True, "laju": 1.2},
                {"t": "klik", "teks": "CE", "tunggu": 600},
                {"t": "klik", "teks": "Simpan", "tunggu": 3200, "simpan": True},
                {"t": "jeda", "ms": 1600},
            ]),
            L("V-08", [
                N("L", "Sekarang kembali ke rekap laporan, dan tautkan laporannya ke risiko yang baru saja dibuat."),
                N("P", "Begitu tertaut, tombol Catat ke Formulir 10 muncul — sama seperti kasus pertama tadi."),
                N("L", "Perhatikan urutannya, karena tidak bisa dibalik: risikonya dulu, baru kejadiannya dicatat. Bukan sebaliknya."),
            ], [
                {"t": "menu", "jalur": ["Utilities", "Rekap Lapor Kejadian Risiko"]},
                {"t": "jeda", "ms": 3400},
            ]),
        ]},

        # ── VI ───────────────────────────────────────────────────────────────
        {"nomor": "VI", "judul": "Sesudahnya", "akun": "PIC_INSPEKTORAT", "langkah": [
            L("VI-01", [
                N("P", "Mari lihat ke mana semuanya bermuara."),
                N("L", "Formulir 10 sekarang memuat kedua kejadian tadi, lengkap dengan risikonya masing-masing."),
            ], [
                {"t": "judul", "nomor": "6", "teks": "Sesudahnya", "ms": 5000},
                {"t": "menu", "jalur": ["Form Monitoring dan Evaluasi", "10_Pencatatan Kejadian Risiko"]},
                {"t": "jeda", "ms": 3000},
                {"t": "gulir", "px": 380},
                {"t": "jeda", "ms": 2200},
            ]),
            L("VI-02", [
                N("L", "Dan rencana tindak yang tadi kita susun sudah menunggu di Formulir 8 dan 9, siap dilaporkan realisasinya."),
                N("P", "Perjalanannya utuh: seorang pegawai melihat sesuatu, melapor lewat kode QR tanpa punya akun, PIC menelaahnya, risikonya didaftarkan, rencana perbaikannya disusun, dan sekarang pelaksanaannya dipantau."),
                N("L", "Itu manajemen risiko yang bekerja — bukan dokumen yang disusun sekali setahun lalu disimpan."),
            ], [
                {"t": "menu", "jalur": ["Form Monitoring dan Evaluasi", "8-9_Monitoring RTP"]},
                {"t": "jeda", "ms": 3200},
                {"t": "gulir", "px": 400},
                {"t": "jeda", "ms": 2400},
            ]),
            L("VI-03", [
                N("P", "Dua hal untuk diingat dari video ini."),
                N("L", "Pertama, pelapor tidak perlu tahu apa pun tentang manajemen risiko. Ia cukup menceritakan apa yang dilihatnya. Sisanya pekerjaan PIC."),
                N("P", "Kedua, kejadian yang risikonya belum terdaftar bukan masalah — ia justru cara daftar risiko diperbaiki. Yang jadi masalah kalau laporan seperti itu dibiarkan menggantung tanpa pernah didaftarkan."),
                N("L", "Dan sekali lagi, seluruh isian dalam video ini data contoh. Untuk laporan yang sesungguhnya, isinya kembali kepada kejadian yang benar-benar terjadi di tempat Anda."),
            ], [
                {"t": "judul", "teks": "Seluruh isian dalam video ini adalah DATA CONTOH", "ms": 8000},
                {"t": "jeda", "ms": 2600},
            ]),
        ]},
    ],
}

io.open(P, "w", encoding="utf-8").write(json.dumps(naskah, indent=1, ensure_ascii=False))
jml = sum(len(b["langkah"]) for b in naskah["bagian"])
print(f"naskah-lapor.json: {len(naskah['bagian'])} bagian, {jml} langkah, {n[0]} kalimat narasi")
