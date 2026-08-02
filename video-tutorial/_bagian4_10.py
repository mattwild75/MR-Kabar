"""Menambahkan Bagian IV sampai X ke naskah.json. Menolak berjalan dua kali."""
import io
import json
import os

DIR = os.path.dirname(os.path.abspath(__file__))
P = os.path.join(DIR, "naskah.json")
naskah = json.load(io.open(P, encoding="utf-8"))
if any(b["nomor"] == "IV" for b in naskah["bagian"]):
    raise SystemExit("Bagian IV sudah ada — menolak berjalan dua kali.")

n = [200]


def N(suara, teks):
    n[0] += 1
    return {"id": f"n{n[0]:03d}", "suara": suara, "teks": teks}


def L(idl, narasi, aksi):
    return {"id": idl, "narasi": narasi, "aksi": aksi}


JENIS = "35 - Pembinaan dan Pengawasan"
TW4 = "Triwulan IV (Oktober/November/Desember)"

# ── Bagian IV — Risiko Strategis Pemda ──────────────────────────────────────
b4 = {"nomor": "IV", "judul": "Risiko Strategis Pemerintah Daerah", "langkah": [
    L("IV-01", [
        N("L", "Sekarang kita masuk ke inti aplikasi ini: penilaian risiko."),
        N("P", "Ada tiga tingkatan, dan urutannya di menu sudah menuntun. Risiko Strategis Pemda, Risiko Strategis Perangkat Daerah, lalu Risiko Operasional Perangkat Daerah."),
        N("L", "Tiap tingkatan punya dua formulir. Yang berhuruf a menetapkan konteksnya, yang berhuruf b mengisi risikonya."),
        N("P", "Konteks lebih dulu, selalu. Risiko tidak bisa dinilai tanpa tahu sasaran apa yang sedang diancamnya."),
    ], [
        {"t": "judul", "nomor": "4", "teks": "Risiko Strategis Pemerintah Daerah", "ms": 5200},
        {"t": "menu", "jalur": ["Form Input", "Risiko", "Risiko Strategis Pemda", "I_a_KRS_Pemda"]},
        {"t": "jeda", "ms": 1200},
    ]),
    L("IV-02", [
        N("L", "Ini Formulir 1a, Konteks Risiko Strategis Pemerintah Daerah. Isinya tujuan dan sasaran RPJMD."),
        N("P", "Perhatikan, kita hanya membacanya. Tingkat ini tidak diisi PIC perangkat daerah, melainkan Admin — karena isinya lintas perangkat daerah dan harus satu untuk seluruh kabupaten."),
        N("L", "Yang perlu Anda lakukan di sini cuma satu: membacanya sebagai acuan. Sasaran RPJMD di halaman inilah yang nanti muncul sebagai pilihan di formulir berikutnya."),
    ], [
        {"t": "gulir", "px": 400},
        {"t": "jeda", "ms": 1600},
        {"t": "gulir", "px": -400},
    ]),
    L("IV-03", [
        N("P", "Sekarang Formulir 1b, Identifikasi Risiko Strategis Pemerintah Daerah."),
        N("L", "Di sini perangkat daerah boleh mengisi — dan memang seharusnya. Risiko tingkat pemerintah daerah bukan milik satu instansi; ia dipikul bersama."),
    ], [
        {"t": "menu", "jalur": ["Form Input", "Risiko", "Risiko Strategis Pemda", "I_b_IRS_Pemda"]},
        {"t": "klik", "teks": "Tambah Data", "tunggu": 1600},
    ]),
    L("IV-04", [
        N("P", "Sasaran RPJMD diambil dari Formulir 1a tadi, lalu risikonya dirumuskan."),
        N("L", "Perhatikan bentuk kalimat risikonya. Ia menyebut sesuatu yang BISA TERJADI dan mengancam sasaran — bukan keluhan, bukan penyebab, dan bukan keadaan yang sudah pasti."),
        N("P", "Tiga rumusan yang sering dipakai dan ketiganya keliru: kurangnya anggaran, itu penyebab. SDM terbatas, itu juga penyebab. Pelayanan buruk, itu keluhan."),
        N("L", "Yang benar menyebut peristiwanya: maturitas SPIP tidak naik ke tingkat yang ditargetkan. Itu peristiwa, bisa terjadi atau tidak, dan langsung mengancam sasaran."),
    ], [
        {"t": "ketik", "sel": "[id='SASARAN RPJMD']", "teks": "Meningkatnya Transparansi Pengelolaan Anggaran", "laju": 1.6},
        {"t": "ketik", "sel": "[id='URAIAN RISIKO']", "teks": "Maturitas penyelenggaraan SPIP terintegrasi Pemerintah Kabupaten Aceh Barat tidak naik ke tingkat yang ditargetkan", "laju": 1.5},
        {"t": "pilih", "ph": "Pilih Jenis Risiko", "cari": "Pembinaan", "nilai": JENIS},
    ]),
    L("IV-05", [
        N("L", "Kolom Pemilik Risiko. Di sinilah tiga peran yang paling sering tertukar perlu dibedakan."),
        N("P", "Pemilik Risiko adalah pihak yang sasarannya terancam. Untuk risiko tingkat pemerintah daerah, itu Sekretaris Daerah — bukan Inspektorat."),
        N("L", "Penanggung Jawab Pengendalian, yang kolomnya ada di bawah nanti, adalah yang mengerjakan penanganannya. Itu bisa Inspektorat."),
        N("P", "Dan Penanggung Jawab Pengelolaan Risiko adalah yang mengurus prosesnya secara keseluruhan. Tiga peran, tiga orang atau unit yang bisa berbeda."),
        N("L", "Kalau ketiganya selalu Anda isi dengan nama yang sama, hampir pasti ada yang belum dipilah."),
    ], [
        {"t": "ketik", "sel": "[id='PEMILIK RISIKO']", "teks": "Sekretaris Daerah Kabupaten Aceh Barat", "laju": 1.6},
    ]),
    L("IV-06", [
        N("P", "Penyebab risiko dikelompokkan — internal delapan kategori, eksternal enam."),
        N("L", "Pengelompokan ini bukan hiasan. Ia memaksa penyebab dicari dari beberapa sisi, bukan berhenti di yang pertama terpikir."),
        N("P", "Kita pilih dua: Men untuk pemahaman yang belum merata, dan Method untuk penilaian mandiri yang belum berkala."),
    ], [
        {"t": "centang", "label": "Men", "teks": "Pemahaman SPIP berbasis risiko belum merata di seluruh perangkat daerah", "laju": 1.6},
        {"t": "centang", "label": "Method", "teks": "Penilaian mandiri maturitas SPIP belum berjalan berkala dan belum terjadwal", "laju": 1.6},
        {"t": "klik", "teks": "C", "tunggu": 500},
    ]),
    L("IV-07", [
        N("L", "Dampak ditulis pada sasarannya, bukan pada pekerjaan sehari-hari."),
        N("P", "Bedanya begini. Kalau dampaknya ditulis pekerjaan jadi menumpuk, itu dampak pada kesibukan. Yang diminta dampak pada apa yang mau dicapai."),
    ], [
        {"t": "ketik", "sel": "[id='URAIAN DAMPAK RISIKO']", "teks": "Nilai maturitas SPIP dan kapabilitas APIP tertahan, dan kepercayaan atas pengelolaan anggaran daerah menurun", "laju": 1.6},
        {"t": "ketik", "sel": "[id='PIHAK YANG TERKENA DAMPAK RISIKO']", "teks": "Pemerintah Kabupaten Aceh Barat, seluruh Perangkat Daerah, Bupati, dan masyarakat", "laju": 1.7},
    ]),
    L("IV-08", [
        N("P", "Aplikasi bertanya apakah risiko ini sudah punya pengendalian. Kita jawab ya."),
        N("L", "Jawaban ini menentukan bentuk formulir selanjutnya — kalau belum ada pengendalian, skala inheren dan skala sekarang tidak perlu dibedakan."),
    ], [
        {"t": "klik", "teks": "Ya", "tunggu": 900},
        {"t": "ketik", "sel": "[id='URAIAN PENGENDALIAN YANG SUDAH ADA']", "teks": "Asistensi penyelenggaraan SPIP kepada perangkat daerah dan penilaian mandiri maturitas SPIP tahunan", "laju": 1.7},
        {"t": "klik", "teks": "KE", "tunggu": 600},
        {"t": "ketik", "sel": "[id='CELAH PENGENDALIAN']", "teks": "e. Pengendalian sudah berjalan namun masih lemah, sehingga masih ada risiko lain yang timbul", "laju": 1.8},
    ]),
    L("IV-09", [
        N("L", "Sekarang penilaian skalanya, lewat matriks lima kali lima."),
        N("P", "Tiga titik diisi. Inheren — seandainya tidak ada pengendalian sama sekali. Residual atau sekarang — dengan pengendalian yang ada hari ini. Dan target — setelah rencana tindak dijalankan."),
        N("L", "Kita mulai dari inheren: dampak empat, kemungkinan lima."),
        N("P", "Lalu sekarang: dampak empat, kemungkinan empat."),
        N("L", "Selisih antara keduanya itulah nilai pengendalian yang sudah ada. Kalau tidak ada selisihnya sama sekali, pengendalian itu memang tidak bekerja — dan menilainya Efektif jadi tidak masuk akal."),
    ], [
        {"t": "klik", "teks": "Isi Nilai Risiko", "tunggu": 1500},
        {"t": "matriks", "titik": "IInheren", "d": 4, "k": 5},
        {"t": "matriks", "titik": "RResidual/Current", "d": 4, "k": 4},
        {"t": "klik", "teks": "Selesai", "tunggu": 1200},
    ]),
    L("IV-10", [
        N("P", "Rencana tindak pengendalian. Ada lima pilihan respons risiko."),
        N("L", "Avoid berarti kegiatannya dihentikan. Abate atau mitigate menurunkan risikonya. Share atau transfer mengalihkannya ke pihak lain. Accept berarti diterima apa adanya."),
        N("P", "Kita pilih Abate, karena penyebabnya masih bisa dikendalikan sendiri."),
    ], [
        {"t": "centang", "label": "Abate", "teks": "Menyusun jadwal penilaian mandiri maturitas SPIP per semester dan asistensi berbasis risiko kepada perangkat daerah yang nilainya terendah", "laju": 1.6},
        {"t": "pilih", "ph": "Pilih OPD", "cari": "INSPEK", "nilai": "INSPEKTORAT"},
        {"t": "ketik", "sel": "[id='PENANGGUNG JAWAB PENGENDALIAN']", "teks": "Inspektur Pembantu Khusus", "laju": 1.8},
        {"t": "pilih", "ph": "Pilih Triwulan", "nilai": TW4},
        {"t": "ketik", "sel": "[id='TAHUN TARGET PENYELESAIAN']", "teks": "2026", "bersihkan": True, "laju": 1.2},
    ]),
    L("IV-11", [
        N("L", "Terakhir, proyeksi setelah rencana tindak dijalankan."),
        N("P", "Kita nilai Cukup Efektif, bukan Efektif. Alasannya jujur: kenaikan maturitas SPIP tidak sepenuhnya berada dalam kendali satu instansi."),
        N("L", "Lalu skala target: dampak empat, kemungkinan tiga."),
        N("P", "Perhatikan baik-baik — dampaknya TIDAK turun. Yang turun kemungkinannya."),
        N("L", "Inilah salah kaprah yang paling sering. Rencana tindak biasanya menurunkan peluang kejadiannya, bukan akibatnya kalau kejadian itu tetap terjadi. Menurunkan keduanya sekaligus perlu alasan yang kuat."),
    ], [
        {"t": "klik", "teks": "CE", "tunggu": 600},
        {"t": "klik", "teks": "Isi Nilai Risiko", "tunggu": 1500},
        {"t": "matriks", "titik": "TTarget", "d": 4, "k": 3},
        {"t": "klik", "teks": "Selesai", "tunggu": 1200},
        {"t": "klik", "teks": "Simpan", "tunggu": 3000, "simpan": True},
        {"t": "jeda", "ms": 1600},
    ]),
]}

# ── Bagian V — Risiko Strategis PD ──────────────────────────────────────────
b5 = {"nomor": "V", "judul": "Risiko Strategis Perangkat Daerah", "langkah": [
    L("V-01", [
        N("L", "Tingkat kedua: Risiko Strategis Perangkat Daerah. Konteksnya lebih dulu, Formulir 2a."),
        N("P", "Halaman ini menurunkan sasaran RPJMD sampai ke subkegiatan, mengikuti Renstra perangkat daerah."),
        N("L", "Enam tingkat: sasaran RPJMD, tujuan strategis, sasaran strategis, program, kegiatan, subkegiatan. Masing-masing punya indikator, baseline, target, dan satuan."),
    ], [
        {"t": "judul", "nomor": "5", "teks": "Risiko Strategis Perangkat Daerah", "ms": 5200},
        {"t": "menu", "jalur": ["Form Input", "Risiko", "Risiko Strategis PD", "II_a_KRS_PD"]},
        {"t": "klik", "teks": "Tambah Data", "tunggu": 1600},
        {"t": "pilih", "ph": "Pilih Sasaran RPJMD", "nilai": "Meningkatnya Tranparansi Pengelolaan Anggaran"},
    ]),
    L("V-02", [
        N("P", "Tujuan strategis dan indikatornya."),
        N("L", "Satu hal yang perlu diperhatikan tentang baseline. Baseline tahun dua ribu dua puluh enam BUKAN baseline tahun sebelumnya — ia realisasi tahun dua ribu dua puluh lima."),
        N("P", "Menyalin baseline lama adalah kekeliruan yang paling sering lolos, karena tidak ada satu pun yang menolaknya. Aplikasi menerima angka apa saja."),
    ], [
        {"t": "ketik", "sel": "[id='TUJUAN STRATEGIS PD']", "teks": "Terwujudnya Pengawasan Internal yang Efektif untuk Mendorong Transparansi dan Akuntabilitas Pengelolaan Keuangan Daerah", "laju": 2.0},
        {"t": "ketik", "sel": "[id='IK TUJUAN STRATEGIS PD']", "teks": "Skor Maturitas SPIP dan Level Kapabilitas APIP", "laju": 1.8},
        {"t": "ketik", "sel": "[id='BASELINE IK TUJUAN STRATEGIS PD']", "teks": "Level 3", "laju": 1.4},
        {"t": "ketik", "sel": "[id='TARGET IK TUJUAN STRATEGIS PD']", "teks": "Level 3+", "laju": 1.4},
        {"t": "ketik", "sel": "[id='SATUAN IK TUJUAN STRATEGIS PD']", "teks": "Level", "laju": 1.4},
    ]),
    L("V-03", [
        N("L", "Sasaran strategis, program, kegiatan, dan subkegiatan diisi dengan cara yang sama."),
        N("P", "Sumbernya Renstra dan DPA — jangan dikarang. Kalau rumusannya berbeda dari dokumen resmi, formulir cetaknya nanti tidak cocok dengan dokumen perencanaan, dan itu jadi temuan."),
    ], [
        {"t": "ketik", "sel": "[id='SASARAN STRATEGIS PD']", "teks": "Meningkatnya Transparansi Pengelolaan Anggaran", "laju": 2.2},
        {"t": "ketik", "sel": "[id='IK SASARAN STRATEGIS PD']", "teks": "Persentase Tindak Lanjut Rekomendasi Hasil Pengawasan", "laju": 2.2},
        {"t": "ketik", "sel": "[id='BASELINE IK SASARAN STRATEGIS PD']", "teks": "72%", "laju": 1.4},
        {"t": "ketik", "sel": "[id='TARGET IK SASARAN STRATEGIS PD']", "teks": "90%", "laju": 1.4},
        {"t": "ketik", "sel": "[id='SATUAN IK SASARAN STRATEGIS PD']", "teks": "Persen", "laju": 1.6},
        {"t": "ketik", "sel": "[id='PROGRAM PD']", "teks": "Program Penyelenggaraan Pengawasan", "laju": 2.2},
        {"t": "ketik", "sel": "[id='IK PROGRAM PD']", "teks": "Persentase OPD dengan Tingkat Kepatuhan Pengawasan Baik", "laju": 2.4},
        {"t": "ketik", "sel": "[id='BASELINE IK PROGRAM PD']", "teks": "68%", "laju": 1.4},
        {"t": "ketik", "sel": "[id='TARGET IK PROGRAM PD']", "teks": "90%", "laju": 1.4},
        {"t": "ketik", "sel": "[id='SATUAN IK PROGRAM PD']", "teks": "Persen", "laju": 1.6},
    ]),
    L("V-04", [
        N("L", "Kegiatan dan subkegiatan menutup hierarkinya."),
        N("P", "Perhatikan bahwa halaman konteks ini tidak punya kolom tahun. Memang begitu — yang berganti tiap tahun adalah risikonya, bukan hierarki Renstra-nya."),
    ], [
        {"t": "ketik", "sel": "[id='KEGIATAN PD']", "teks": "Penyelenggaraan Pengawasan Internal", "laju": 2.2},
        {"t": "ketik", "sel": "[id='IK KEGIATAN PD']", "teks": "Jumlah Laporan Hasil Pengawasan yang Diselesaikan Sesuai PKPT", "laju": 2.4},
        {"t": "ketik", "sel": "[id='BASELINE IK KEGIATAN PD']", "teks": "42 LHP", "laju": 1.5},
        {"t": "ketik", "sel": "[id='TARGET IK KEGIATAN PD']", "teks": "55 LHP", "laju": 1.5},
        {"t": "ketik", "sel": "[id='SATUAN IK KEGIATAN PD']", "teks": "LHP", "laju": 1.4},
        {"t": "ketik", "sel": "[id='SUBKEGIATAN PD']", "teks": "Pelaksanaan Pengawasan Internal secara Berkala", "laju": 2.4},
        {"t": "ketik", "sel": "[id='IK SUBKEGIATAN PD']", "teks": "Jumlah OPD yang Diaudit Sesuai PKPT", "laju": 2.4},
        {"t": "ketik", "sel": "[id='BASELINE IK SUBKEGIATAN PD']", "teks": "31 OPD", "laju": 1.5},
        {"t": "ketik", "sel": "[id='TARGET IK SUBKEGIATAN PD']", "teks": "49 OPD", "laju": 1.5},
        {"t": "ketik", "sel": "[id='SATUAN IK SUBKEGIATAN PD']", "teks": "OPD", "laju": 1.4},
        {"t": "ketik", "sel": "[id='OPD PENANGGUNG JAWAB KEGIATAN']", "teks": "INSPEKTORAT", "laju": 1.8},
        {"t": "klik", "teks": "Simpan", "tunggu": 3000, "simpan": True},
    ]),
    L("V-05", [
        N("L", "Sekarang bagian terpenting dari seluruh video ini: Formulir 2b, Identifikasi Risiko Strategis Perangkat Daerah."),
        N("P", "Kita akan mengisi satu risiko pelan-pelan, dari kolom pertama sampai skala target, dan menjelaskan alasan setiap kolomnya."),
        N("L", "Risiko yang kita pakai nyata: rendahnya kepatuhan perangkat daerah menindaklanjuti rekomendasi hasil pengawasan."),
        N("P", "Ingat kelemahan yang tadi kita catat di CEE tentang pemantauan tindak lanjut? Inilah kelanjutannya. Kelemahan lingkungan pengendalian yang dibiarkan muncul lagi sebagai penyebab risiko."),
    ], [
        {"t": "menu", "jalur": ["Form Input", "Risiko", "Risiko Strategis PD", "II_b_IRS_PD"]},
        {"t": "klik", "teks": "Tambah Data", "tunggu": 1600},
        {"t": "ketik", "sel": "[id='SASARAN RENSTRA']", "teks": "Meningkatnya Transparansi Pengelolaan Anggaran", "laju": 1.8},
        {"t": "ketik", "sel": "[id='URAIAN RISIKO']", "teks": "Rendahnya kepatuhan perangkat daerah dalam menindaklanjuti rekomendasi hasil pengawasan", "laju": 1.4},
        {"t": "pilih", "ph": "Pilih Jenis Risiko", "cari": "Pembinaan", "nilai": JENIS},
        {"t": "ketik", "sel": "[id='PEMILIK RISIKO']", "teks": "Inspektur Kabupaten Aceh Barat", "laju": 1.7},
    ]),
    L("V-06", [
        N("L", "Penyebabnya dua, dan keduanya internal."),
        N("P", "Men, untuk komitmen pimpinan perangkat daerah yang belum merata. Method, untuk pemantauan yang belum terjadwal dan tidak adanya konsekuensi atas keterlambatan."),
        N("L", "Satu ukuran untuk menguji apakah penyebab sudah cukup dalam: bisakah ia dikendalikan? Kalau penyebabnya sesuatu yang di luar kuasa Anda sepenuhnya, rencana tindaknya tidak akan pernah menyentuhnya."),
        N("P", "Karena kedua penyebab ini masih bisa dikendalikan, kita tandai C — controllable."),
    ], [
        {"t": "centang", "label": "Men", "teks": "Komitmen pimpinan perangkat daerah dalam menindaklanjuti rekomendasi belum merata", "laju": 1.5},
        {"t": "centang", "label": "Method", "teks": "Pemantauan tindak lanjut belum terjadwal, dan belum ada konsekuensi atas keterlambatan penyelesaiannya", "laju": 1.5},
        {"t": "klik", "teks": "C", "tunggu": 700},
    ]),
    L("V-07", [
        N("L", "Dampak dan pihak yang terkena."),
        N("P", "Daftar pihak yang terkena dampak ini bukan formalitas. Ia yang nanti membantu menimbang skala dampaknya — makin luas dan makin penting pihak yang terkena, makin besar skalanya."),
    ], [
        {"t": "ketik", "sel": "[id='URAIAN DAMPAK RISIKO']", "teks": "Transparansi dan akuntabilitas pengelolaan anggaran tidak meningkat, serta nilai MCP dan maturitas SPIP tertahan", "laju": 1.6},
        {"t": "ketik", "sel": "[id='PIHAK YANG TERKENA DAMPAK RISIKO']", "teks": "Inspektorat, Perangkat Daerah, Bupati, dan masyarakat", "laju": 1.7},
    ]),
    L("V-08", [
        N("L", "Pengendalian yang sudah ada ditulis apa adanya."),
        N("P", "Godaan terbesar di kolom ini adalah melebih-lebihkan. Jangan. Kalau pengendalian yang ada ditulis lebih baik daripada kenyataannya, seluruh analisis di bawahnya ikut meleset."),
        N("L", "Kategorinya kita nilai KE, Kurang Efektif. Sudah ada pemantauan, tetapi tidak semua perangkat daerah menindaklanjuti tepat waktu."),
        N("P", "Perhatikan: sudah ada prosedurnya tidak otomatis berarti Efektif. Yang dinilai hasilnya, bukan keberadaannya."),
    ], [
        {"t": "klik", "teks": "Ya", "tunggu": 900},
        {"t": "ketik", "sel": "[id='URAIAN PENGENDALIAN YANG SUDAH ADA']", "teks": "Pemantauan tindak lanjut hasil pengawasan secara periodik dan penyampaian laporan hasil pengawasan kepada perangkat daerah", "laju": 1.7},
        {"t": "klik", "teks": "KE", "tunggu": 700},
        {"t": "ketik", "sel": "[id='CELAH PENGENDALIAN']", "teks": "e. Pengendalian sudah berjalan namun masih lemah, sehingga masih ada risiko lain yang timbul", "laju": 1.8},
    ]),
    L("V-09", [
        N("L", "Matriks lima kali lima. Kita mulai dari inheren."),
        N("P", "Bayangkan tidak ada satu pun pengendalian. Tidak ada pemantauan, tidak ada laporan yang dikirim. Dalam keadaan itu, dampaknya empat dan kemungkinannya lima — hampir pasti terjadi."),
        N("L", "Lalu keadaan sekarang, dengan pemantauan yang sudah ada: dampak tiga, kemungkinan empat."),
        N("P", "Angka di dalam sel bukan hasil perkalian. Ia peringkat satu sampai dua puluh lima yang sengaja membobot dampak lebih besar daripada kemungkinan."),
        N("L", "Karena itu risiko berdampak sangat besar tetapi jarang terjadi tetap dinilai tinggi di aplikasi ini. Itu keputusan yang disengaja."),
    ], [
        {"t": "klik", "teks": "Isi Nilai Risiko", "tunggu": 1600},
        {"t": "matriks", "titik": "IInheren", "d": 4, "k": 5},
        {"t": "jeda", "ms": 900},
        {"t": "matriks", "titik": "RResidual/Current", "d": 3, "k": 4},
        {"t": "jeda", "ms": 1400},
    ]),
    L("V-10", [
        N("L", "Sekarang titik ketiga: target."),
        N("P", "Dampak tetap tiga, kemungkinan turun jadi tiga."),
        N("L", "Sekali lagi, karena ini yang paling sering keliru — rencana tindak kita menurunkan peluang perangkat daerah terlambat menindaklanjuti. Ia tidak mengubah seberapa buruk akibatnya kalau keterlambatan itu tetap terjadi."),
        N("P", "Ketiga titik kini terlihat berjajar di matriks. Itulah gambaran seluruh perjalanan risiko ini: dari seandainya tidak ditangani, ke keadaan sekarang, sampai ke yang dituju."),
    ], [
        {"t": "matriks", "titik": "TTarget", "d": 3, "k": 3},
        {"t": "jeda", "ms": 2000},
        {"t": "klik", "teks": "Selesai", "tunggu": 1400},
    ]),
    L("V-11", [
        N("L", "Rencana tindak pengendaliannya."),
        N("P", "Abate, karena penyebabnya bisa dikendalikan. Isinya tiga hal yang konkret: menyusun pemantauan terjadwal, mengeksposnya kepada Bupati, dan memasukkan tindak lanjut ke dalam penilaian kinerja perangkat daerah."),
        N("L", "Ketiganya bisa dilaporkan sudah dikerjakan atau belum. Itu syaratnya. Rencana tindak yang berbunyi meningkatkan koordinasi tidak akan pernah bisa dilaporkan realisasinya."),
        N("P", "Dan perhatikan Penanggung Jawab Pengendaliannya: Inspektur Pembantu Wilayah — bukan Inspektur. Inspektur tadi Pemilik Risikonya. Dua kolom, dua peran."),
    ], [
        {"t": "centang", "label": "Abate", "teks": "Menyusun mekanisme pemantauan tindak lanjut terjadwal per triwulan, ekspose hasilnya kepada Bupati, serta memasukkan penyelesaian tindak lanjut sebagai unsur penilaian kinerja perangkat daerah", "laju": 1.5},
        {"t": "pilih", "ph": "Pilih OPD", "cari": "INSPEK", "nilai": "INSPEKTORAT"},
        {"t": "ketik", "sel": "[id='PENANGGUNG JAWAB PENGENDALIAN']", "teks": "Inspektur Pembantu Wilayah I sampai IV", "laju": 1.7},
        {"t": "pilih", "ph": "Pilih Triwulan", "nilai": TW4},
        {"t": "ketik", "sel": "[id='TAHUN TARGET PENYELESAIAN']", "teks": "2026", "bersihkan": True, "laju": 1.2},
        {"t": "klik", "teks": "CE", "tunggu": 700},
        {"t": "klik", "teks": "Simpan", "tunggu": 3200, "simpan": True},
    ]),
    L("V-12", [
        N("P", "Barisnya muncul di daftar, lengkap dengan warna peringkatnya."),
        N("L", "Sekarang satu risiko lagi, kali ini lebih cepat. Setelah polanya dipahami, pengisian berikutnya memang jauh lebih ringan."),
        N("P", "Risiko kedua: belum optimalnya pemanfaatan teknologi informasi dalam pengawasan. Penyebabnya campuran — internal dan eksternal sekaligus."),
        N("L", "Perhatikan bahwa penyebab eksternal tetap boleh dicatat, tetapi ia biasanya membawa tanda UC: tidak terkendali. Dan itu mengubah bentuk rencana tindaknya."),
    ], [
        {"t": "jeda", "ms": 1400},
        {"t": "klik", "teks": "Tambah Data", "tunggu": 1600},
        {"t": "ketik", "sel": "[id='SASARAN RENSTRA']", "teks": "Meningkatnya Transparansi Pengelolaan Anggaran", "laju": 2.6},
        {"t": "ketik", "sel": "[id='URAIAN RISIKO']", "teks": "Belum optimalnya pemanfaatan teknologi informasi dalam pengawasan dan pelaporan keuangan", "laju": 2.2},
        {"t": "pilih", "ph": "Pilih Jenis Risiko", "cari": "Pembinaan", "nilai": JENIS},
        {"t": "ketik", "sel": "[id='PEMILIK RISIKO']", "teks": "Inspektur Kabupaten Aceh Barat", "laju": 2.4},
        {"t": "centang", "label": "Machine", "teks": "Sistem pengawasan masih manual dan belum terintegrasi dengan SIPD", "laju": 2.4},
        {"t": "centang", "label": "Technological", "teks": "Integrasi aplikasi pengawasan dengan SIPD dan SPBE belum optimal", "laju": 2.4},
        {"t": "klik", "teks": "C", "tunggu": 500},
        {"t": "ketik", "sel": "[id='URAIAN DAMPAK RISIKO']", "teks": "Informasi pengelolaan anggaran tidak tersedia secara cepat dan sulit diakses", "laju": 2.4},
        {"t": "ketik", "sel": "[id='PIHAK YANG TERKENA DAMPAK RISIKO']", "teks": "Inspektorat, Perangkat Daerah, dan masyarakat", "laju": 2.4},
    ]),
    L("V-13", [
        N("L", "Untuk risiko ini pengendaliannya belum ada sama sekali, jadi kita jawab tidak."),
        N("P", "Perhatikan formulirnya berubah. Kalau belum ada pengendalian, membedakan skala inheren dan skala sekarang tidak ada gunanya — keduanya sama."),
        N("L", "Kategorinya otomatis Tidak Efektif, dan itu memang jujur: tidak ada yang bisa dinilai efektivitasnya."),
    ], [
        {"t": "klik", "teks": "Tidak", "tunggu": 1200},
        {"t": "jeda", "ms": 1200},
    ]),
    L("V-14", [
        N("P", "Skalanya kita isi, lalu rencana tindaknya, lalu simpan."),
        N("L", "Dua risiko strategis perangkat daerah sudah tercatat. Dalam keadaan sebenarnya, jumlahnya bisa lima sampai sepuluh — sebanyak yang benar-benar mengancam sasaran, tidak perlu dipaksa banyak."),
    ], [
        {"t": "klik", "teks": "Isi Nilai Risiko", "tunggu": 1600},
        {"t": "matriks", "titik": "IInheren", "d": 5, "k": 4},
        {"t": "matriks", "titik": "TTarget", "d": 4, "k": 2},
        {"t": "klik", "teks": "Selesai", "tunggu": 1200},
        {"t": "centang", "label": "Abate", "teks": "Mengembangkan sistem informasi pengawasan yang terintegrasi dengan SIPD dan mendigitalkan pelaporan hasil pengawasan", "laju": 2.0},
        {"t": "pilih", "ph": "Pilih OPD", "cari": "INSPEK", "nilai": "INSPEKTORAT"},
        {"t": "ketik", "sel": "[id='PENANGGUNG JAWAB PENGENDALIAN']", "teks": "Sekretariat Inspektorat", "laju": 2.2},
        {"t": "pilih", "ph": "Pilih Triwulan", "nilai": TW4},
        {"t": "ketik", "sel": "[id='TAHUN TARGET PENYELESAIAN']", "teks": "2026", "bersihkan": True, "laju": 1.2},
        {"t": "klik", "teks": "CE", "tunggu": 600},
        {"t": "klik", "teks": "Simpan", "tunggu": 3200, "simpan": True},
        {"t": "jeda", "ms": 1600},
    ]),
]}

# ── Bagian VI — Risiko Operasional PD ───────────────────────────────────────
b6 = {"nomor": "VI", "judul": "Risiko Operasional Perangkat Daerah", "langkah": [
    L("VI-01", [
        N("L", "Tingkat ketiga: Risiko Operasional Perangkat Daerah. Konteksnya dulu, Formulir 3a."),
        N("P", "Bedanya dengan Formulir 2a bisa diringkas satu kalimat. Konteks strategis berhenti di sasaran; konteks operasional turun sampai kegiatan yang ada anggarannya di DPA."),
        N("L", "Karena itulah sumber dokumennya juga berbeda — Renja dan DPA, bukan Renstra."),
    ], [
        {"t": "judul", "nomor": "6", "teks": "Risiko Operasional Perangkat Daerah", "ms": 5200},
        {"t": "menu", "jalur": ["Form Input", "Risiko", "Risiko Operasional PD", "III_a_KRO_PD"]},
        {"t": "klik", "teks": "Tambah Data", "tunggu": 1600},
        {"t": "pilih", "ph": "Pilih Sasaran Renstra", "nilai": "Meningkatnya Transparansi Pengelolaan Anggaran"},
    ]),
    L("VI-02", [
        N("P", "Kegiatan pertama: Penyelenggaraan Pengawasan Internal."),
        N("L", "Indikator dan targetnya diambil apa adanya dari DPA tahun berjalan."),
    ], [
        {"t": "ketik", "sel": "[id='PROGRAM PD']", "teks": "Program Penyelenggaraan Pengawasan", "laju": 2.2},
        {"t": "ketik", "sel": "[id='IK PROGRAM PD']", "teks": "Persentase OPD dengan Tingkat Kepatuhan Pengawasan Baik", "laju": 2.4},
        {"t": "ketik", "sel": "[id='BASELINE IK PROGRAM PD']", "teks": "68%", "laju": 1.4},
        {"t": "ketik", "sel": "[id='TARGET IK PROGRAM PD']", "teks": "90%", "laju": 1.4},
        {"t": "ketik", "sel": "[id='SATUAN IK PROGRAM PD']", "teks": "Persen", "laju": 1.6},
        {"t": "ketik", "sel": "[id='KEGIATAN PD']", "teks": "Penyelenggaraan Pengawasan Internal", "laju": 2.2},
        {"t": "ketik", "sel": "[id='IK KEGIATAN PD']", "teks": "Jumlah Laporan Hasil Pengawasan yang Diselesaikan Sesuai PKPT", "laju": 2.4},
        {"t": "ketik", "sel": "[id='BASELINE IK KEGIATAN PD']", "teks": "42 LHP", "laju": 1.5},
        {"t": "ketik", "sel": "[id='TARGET IK KEGIATAN PD']", "teks": "55 LHP", "laju": 1.5},
        {"t": "ketik", "sel": "[id='SATUAN IK KEGIATAN PD']", "teks": "LHP", "laju": 1.4},
        {"t": "ketik", "sel": "[id='SUBKEGIATAN PD']", "teks": "Pelaksanaan Pengawasan Internal secara Berkala", "laju": 2.4},
        {"t": "ketik", "sel": "[id='IK SUBKEGIATAN PD']", "teks": "Jumlah OPD yang Diaudit Sesuai PKPT", "laju": 2.4},
        {"t": "ketik", "sel": "[id='BASELINE IK SUBKEGIATAN PD']", "teks": "31 OPD", "laju": 1.5},
        {"t": "ketik", "sel": "[id='TARGET IK SUBKEGIATAN PD']", "teks": "49 OPD", "laju": 1.5},
        {"t": "ketik", "sel": "[id='SATUAN IK SUBKEGIATAN PD']", "teks": "OPD", "laju": 1.4},
        {"t": "ketik", "sel": "[id='OPD PENANGGUNG JAWAB KEGIATAN']", "teks": "INSPEKTORAT", "laju": 1.8},
        {"t": "klik", "teks": "Simpan", "tunggu": 3000, "simpan": True},
    ]),
    L("VI-03", [
        N("L", "Sekarang Formulir 3b, Identifikasi Risiko Operasional."),
        N("P", "Ada satu kolom di sini yang tidak ada di dua tingkat sebelumnya: Tahap."),
        N("L", "Alasannya masuk akal. Risiko operasional melekat pada langkah kegiatan, jadi perlu diketahui langkah mana — perencanaan, pelaksanaan, pengawasan, atau pelaporan."),
        N("P", "Risiko pertama: pelaksanaan pengawasan internal tidak sesuai dengan PKPT. Tahapnya pengawasan."),
    ], [
        {"t": "menu", "jalur": ["Form Input", "Risiko", "Risiko Operasional PD", "III_b_IRO_PD"]},
        {"t": "klik", "teks": "Tambah Data", "tunggu": 1600},
        {"t": "pilih", "ph": "Pilih Kegiatan PD", "nilai": "Penyelenggaraan Pengawasan Internal"},
        {"t": "ketik", "sel": "[id='URAIAN RISIKO']", "teks": "Pelaksanaan pengawasan internal tidak sesuai dengan Program Kerja Pengawasan Tahunan", "laju": 1.6},
        {"t": "pilih", "ph": "Pilih Jenis Risiko", "cari": "Pembinaan", "nilai": JENIS},
        {"t": "pilih", "ph": "Pilih Tahap", "nilai": "Tahap Pengawasan / Monitoring"},
        {"t": "ketik", "sel": "[id='PEMILIK RISIKO']", "teks": "Inspektur Pembantu Wilayah I sampai IV", "laju": 1.8},
    ]),
    L("VI-04", [
        N("L", "Sekarang pembeda yang paling berguna sekaligus paling sering diisi asal: C dan UC."),
        N("P", "Penyebab risiko ini jumlah auditor yang terbatas dan jadwal penugasan yang padat."),
        N("L", "Bisakah Inspektorat menambah auditor sendiri? Tidak. Penambahan pegawai bukan keputusan Inspektorat."),
        N("P", "Karena itu kita tandai UC — tidak terkendali. Dan konsekuensinya langsung terasa pada rencana tindaknya."),
        N("L", "Rencana tindak untuk penyebab yang tidak terkendali bukan menambah auditor, melainkan menyusun prioritas berbasis risiko dengan auditor yang ada. Menulis rencana tindak yang tidak berada dalam kuasa Anda hanya memindahkan masalah ke laporan."),
    ], [
        {"t": "centang", "label": "Men", "teks": "Jumlah auditor dan pejabat pengawas terbatas dibandingkan jumlah objek pengawasan", "laju": 1.5},
        {"t": "centang", "label": "Method", "teks": "Jadwal penugasan padat dan sering berbenturan dengan permintaan pengawasan di luar rencana", "laju": 1.5},
        {"t": "klik", "teks": "UC", "tunggu": 900},
        {"t": "ketik", "sel": "[id='URAIAN DAMPAK RISIKO']", "teks": "Ada perangkat daerah yang tidak terawasi pada tahun berjalan sehingga peluang penyimpangan meningkat", "laju": 1.6},
        {"t": "ketik", "sel": "[id='PIHAK YANG TERKENA DAMPAK RISIKO']", "teks": "Perangkat Daerah dan Pemerintah Kabupaten Aceh Barat", "laju": 1.8},
    ]),
    L("VI-05", [
        N("P", "Pengendalian yang sudah ada, skalanya, dan rencana tindaknya."),
        N("L", "Skala inheren dampak lima kemungkinan lima — peringkat tertinggi. Sekarang dampak lima kemungkinan empat."),
        N("P", "Dampaknya tidak turun sedikit pun oleh pengendalian yang ada, dan itu memang jujur: PKPT tahunan mengurangi peluang kegiatan terlewat, tetapi tidak mengurangi akibatnya kalau satu perangkat daerah benar-benar tidak terawasi."),
    ], [
        {"t": "klik", "teks": "Ya", "tunggu": 900},
        {"t": "ketik", "sel": "[id='URAIAN PENGENDALIAN YANG SUDAH ADA']", "teks": "Program Kerja Pengawasan Tahunan dan surat tugas penugasan auditor", "laju": 1.7},
        {"t": "klik", "teks": "KE", "tunggu": 700},
        {"t": "ketik", "sel": "[id='CELAH PENGENDALIAN']", "teks": "a. Kebijakan dan prosedur pengendalian sudah dilakukan, namun belum mampu menangani risiko yang teridentifikasi", "laju": 1.8},
        {"t": "klik", "teks": "Isi Nilai Risiko", "tunggu": 1600},
        {"t": "matriks", "titik": "IInheren", "d": 5, "k": 5},
        {"t": "matriks", "titik": "RResidual/Current", "d": 5, "k": 4},
        {"t": "matriks", "titik": "TTarget", "d": 5, "k": 3},
        {"t": "klik", "teks": "Selesai", "tunggu": 1400},
        {"t": "centang", "label": "Abate", "teks": "Menyusun Program Kerja Pengawasan Tahunan berbasis risiko dan menetapkan prioritas objek pengawasan sesuai ketersediaan auditor", "laju": 1.6},
        {"t": "pilih", "ph": "Pilih OPD", "cari": "INSPEK", "nilai": "INSPEKTORAT"},
        {"t": "ketik", "sel": "[id='PENANGGUNG JAWAB PENGENDALIAN']", "teks": "Inspektur Pembantu Wilayah I sampai IV", "laju": 1.8},
        {"t": "pilih", "ph": "Pilih Triwulan", "nilai": TW4},
        {"t": "ketik", "sel": "[id='TAHUN TARGET PENYELESAIAN']", "teks": "2026", "bersihkan": True, "laju": 1.2},
        {"t": "klik", "teks": "CE", "tunggu": 600},
        {"t": "klik", "teks": "Simpan", "tunggu": 3200, "simpan": True},
    ]),
    L("VI-06", [
        N("L", "Satu risiko operasional lagi, lebih cepat: dokumentasi hasil pengawasan tidak lengkap. Tahapnya pelaporan."),
        N("P", "Perhatikan bahwa risiko ini tampak kecil, tetapi akibatnya tidak. Rekomendasi yang tidak terdokumentasi rapi tidak bisa ditindaklanjuti — dan itu langsung menyambung ke risiko strategis yang tadi kita isi."),
    ], [
        {"t": "jeda", "ms": 1200},
        {"t": "klik", "teks": "Tambah Data", "tunggu": 1600},
        {"t": "pilih", "ph": "Pilih Kegiatan PD", "nilai": "Penyelenggaraan Pengawasan Internal"},
        {"t": "ketik", "sel": "[id='URAIAN RISIKO']", "teks": "Dokumentasi hasil pengawasan tidak lengkap", "laju": 2.2},
        {"t": "pilih", "ph": "Pilih Jenis Risiko", "cari": "Pembinaan", "nilai": JENIS},
        {"t": "pilih", "ph": "Pilih Tahap", "nilai": "Tahap Pelaporan"},
        {"t": "ketik", "sel": "[id='PEMILIK RISIKO']", "teks": "Inspektur Pembantu Wilayah I sampai IV", "laju": 2.4},
        {"t": "centang", "label": "Method", "teks": "Administrasi kertas kerja audit belum tertib dan kepatuhan terhadap prosedur baku masih rendah", "laju": 2.2},
        {"t": "klik", "teks": "C", "tunggu": 500},
        {"t": "ketik", "sel": "[id='URAIAN DAMPAK RISIKO']", "teks": "Rekomendasi sulit ditindaklanjuti karena dasar buktinya tidak lengkap", "laju": 2.4},
        {"t": "ketik", "sel": "[id='PIHAK YANG TERKENA DAMPAK RISIKO']", "teks": "Perangkat Daerah dan Inspektorat", "laju": 2.4},
        {"t": "klik", "teks": "Ya", "tunggu": 900},
        {"t": "ketik", "sel": "[id='URAIAN PENGENDALIAN YANG SUDAH ADA']", "teks": "Prosedur baku administrasi audit dan reviu berjenjang atas kertas kerja", "laju": 2.2},
        {"t": "klik", "teks": "KE", "tunggu": 600},
        {"t": "ketik", "sel": "[id='CELAH PENGENDALIAN']", "teks": "c. Kebijakan belum diikuti dengan prosedur baku yang jelas", "laju": 2.2},
        {"t": "klik", "teks": "Isi Nilai Risiko", "tunggu": 1600},
        {"t": "matriks", "titik": "IInheren", "d": 5, "k": 4},
        {"t": "matriks", "titik": "RResidual/Current", "d": 4, "k": 3},
        {"t": "matriks", "titik": "TTarget", "d": 4, "k": 2},
        {"t": "klik", "teks": "Selesai", "tunggu": 1400},
        {"t": "centang", "label": "Abate", "teks": "Memperkuat reviu berjenjang atas berkas hasil audit sebelum laporan diterbitkan", "laju": 2.0},
        {"t": "pilih", "ph": "Pilih OPD", "cari": "INSPEK", "nilai": "INSPEKTORAT"},
        {"t": "ketik", "sel": "[id='PENANGGUNG JAWAB PENGENDALIAN']", "teks": "Inspektur Pembantu Wilayah I sampai IV", "laju": 2.2},
        {"t": "pilih", "ph": "Pilih Triwulan", "nilai": TW4},
        {"t": "ketik", "sel": "[id='TAHUN TARGET PENYELESAIAN']", "teks": "2026", "bersihkan": True, "laju": 1.2},
        {"t": "klik", "teks": "CE", "tunggu": 600},
        {"t": "klik", "teks": "Simpan", "tunggu": 3200, "simpan": True},
        {"t": "jeda", "ms": 1600},
    ]),
]}

naskah["bagian"] += [b4, b5, b6]
io.open(P, "w", encoding="utf-8").write(json.dumps(naskah, indent=1, ensure_ascii=False))
print(f"Bagian IV, V, VI ditambahkan — {n[0] - 200} kalimat narasi")
