"""Menambahkan Bagian VII sampai X ke naskah.json. Menolak berjalan dua kali."""
import io
import json
import os

DIR = os.path.dirname(os.path.abspath(__file__))
P = os.path.join(DIR, "naskah.json")
naskah = json.load(io.open(P, encoding="utf-8"))
if any(b["nomor"] == "VII" for b in naskah["bagian"]):
    raise SystemExit("Bagian VII sudah ada — menolak berjalan dua kali.")

n = [400]


def N(suara, teks):
    n[0] += 1
    return {"id": f"n{n[0]:03d}", "suara": suara, "teks": teks}


def L(idl, narasi, aksi):
    return {"id": idl, "narasi": narasi, "aksi": aksi}


b7 = {"nomor": "VII", "judul": "Monitoring dan Evaluasi", "langkah": [
    L("VII-01", [
        N("L", "Sampai di sini seluruh risiko sudah dinilai dan setiap rencana tindak sudah punya penanggung jawab dan tenggatnya."),
        N("P", "Yang tersisa satu hal: membuktikan bahwa rencana itu benar-benar dijalankan. Itulah isi menu Form Monitoring dan Evaluasi."),
        N("L", "Buka Formulir 8 dan 9, Monitoring Rencana Tindak Pengendalian."),
    ], [
        {"t": "judul", "nomor": "7", "teks": "Monitoring dan Evaluasi", "ms": 5200},
        {"t": "menu", "jalur": ["Form Monitoring dan Evaluasi", "8-9_Monitoring RTP"]},
        {"t": "jeda", "ms": 1500},
    ]),
    L("VII-02", [
        N("P", "Perhatikan satu hal penting: daftar di halaman ini tidak diketik ulang."),
        N("L", "Seluruh rencana tindak yang tadi kita susun muncul sendiri di sini — dari Formulir 1b, 2b, dan 3b sekaligus."),
        N("P", "Inilah sebabnya rencana tindak tidak boleh ditulis sebagai kalimat niat yang kabur."),
        N("L", "Kalau rencana tindaknya berbunyi meningkatkan koordinasi, tidak ada satu pun hal yang bisa dilaporkan realisasinya di halaman ini. Yang bisa dilaporkan hanya yang punya wujud."),
        N("P", "Formulir 8 mencatat pengkomunikasiannya — kepada siapa rencana ini disampaikan, dan dengan cara apa. Formulir 9 mencatat pemantauannya."),
        N("L", "Keduanya punya kolom rencana dan kolom realisasi. Yang diisi di awal tahun kolom rencananya; realisasinya diisi setelah dikerjakan."),
    ], [
        {"t": "gulir", "px": 420},
        {"t": "jeda", "ms": 2400},
        {"t": "gulir", "px": 420},
        {"t": "jeda", "ms": 2400},
        {"t": "gulir", "px": -840},
    ]),
    L("VII-03", [
        N("P", "Sekarang Formulir 10, Pencatatan Kejadian Risiko."),
        N("L", "Bedanya dengan seluruh formulir sebelumnya mendasar. Semua yang tadi kita isi berbicara tentang sesuatu yang BELUM terjadi. Formulir ini mencatat yang SUDAH terjadi."),
        N("P", "Risiko yang benar-benar terjadi disebut kejadian risiko. Ia dicatat lengkap dengan tanggal, kerugian kalau ada, dan penanganan yang dilakukan."),
        N("L", "Catatan ini bukan sekadar arsip. Ia yang menjadi bukti tahun depan bahwa penilaian kemungkinan yang kita buat tahun ini masuk akal atau tidak."),
        N("P", "Kalau sebuah risiko dinilai jarang terjadi tetapi kejadiannya tercatat lima kali setahun, penilaian tahun berikutnya harus berubah — dan Formulir 10 inilah dasarnya."),
    ], [
        {"t": "menu", "jalur": ["Form Monitoring dan Evaluasi", "10_Pencatatan Kejadian Risiko"]},
        {"t": "jeda", "ms": 2000},
        {"t": "gulir", "px": 400},
        {"t": "jeda", "ms": 2000},
        {"t": "gulir", "px": -400},
    ]),
    L("VII-04", [
        N("L", "Ada satu jalur lagi yang perlu diketahui, di menu Utilities: Lapor Kejadian Risiko."),
        N("P", "Halaman itu untuk pegawai yang tidak punya akun PIC. Mereka tetap bisa melaporkan kejadian risiko lewat tautan atau kode QR, tanpa perlu masuk aplikasi."),
        N("L", "Laporan yang masuk lewat jalur itu direkap dan bisa ditarik menjadi catatan resmi di Formulir 10."),
    ], [
        {"t": "menu", "jalur": ["Utilities", "Rekap Lapor Kejadian Risiko"]},
        {"t": "jeda", "ms": 2600},
    ]),
]}

b8 = {"nomor": "VIII", "judul": "Form Cetak", "langkah": [
    L("VIII-01", [
        N("L", "Sekarang bagian yang paling menyenangkan, karena tidak ada satu pun yang perlu diketik."),
        N("P", "Menu Form Cetak menghasilkan seluruh kertas kerja penilaian risiko dalam bentuk siap ditandatangani."),
        N("L", "Dan ini yang perlu dipegang: tidak ada satu kolom pun di menu ini yang bisa diisi. Semuanya berasal dari formulir yang tadi kita kerjakan."),
        N("P", "Kalau ada yang kosong di sini, yang diperbaiki formulir asalnya — bukan halaman cetaknya."),
    ], [
        {"t": "judul", "nomor": "8", "teks": "Form Cetak", "ms": 5200},
        {"t": "menu", "jalur": ["Form Cetak", "CEE", "1c_Simpulan Survei Persepsi"]},
        {"t": "jeda", "ms": 2600},
        {"t": "gulir", "px": 500},
        {"t": "jeda", "ms": 1800},
    ]),
    L("VIII-02", [
        N("P", "Ini Formulir 2b, Konteks Risiko Strategis Perangkat Daerah."),
        N("L", "Perhatikan kepala halamannya — nama perangkat daerah, periode, tahun penilaian. Semuanya datang dari Data Umum yang kita isi paling awal tadi."),
        N("P", "Sekarang Anda melihat mengapa halaman itu dikerjakan pertama."),
    ], [
        {"t": "menu", "jalur": ["Form Cetak", "Risiko", "Penetapan Konteks Risiko", "2b_Konteks Risiko Strategis OPD"]},
        {"t": "jeda", "ms": 2600},
        {"t": "gulir", "px": 500},
        {"t": "jeda", "ms": 1600},
        {"t": "gulir", "px": -500},
    ]),
    L("VIII-03", [
        N("L", "Formulir 3b, Identifikasi Risiko Strategis Perangkat Daerah."),
        N("P", "Seluruh kolom yang tadi kita isi satu per satu kini berjajar dalam satu tabel — pernyataan risiko, penyebab, dampak, pengendalian yang ada, sampai celah pengendaliannya."),
    ], [
        {"t": "menu", "jalur": ["Form Cetak", "Risiko", "Identifikasi Risiko", "3b_Identifikasi Risiko Strategis OPD"]},
        {"t": "jeda", "ms": 2800},
        {"t": "gulir", "px": 500},
        {"t": "jeda", "ms": 1800},
    ]),
    L("VIII-04", [
        N("L", "Formulir 4, Hasil Analisis Risiko. Dan Formulir 5, Daftar Risiko Prioritas."),
        N("P", "Di Formulir 5 ada satu hal yang perlu dijelaskan, karena sering ditanyakan."),
        N("L", "Tidak semua risiko yang kita isi muncul di daftar prioritas. Yang muncul hanya yang berada di luar Selera Risiko."),
        N("P", "Selera Risiko Kabupaten Aceh Barat ditetapkan sampai dengan peringkat Sedang. Artinya risiko berperingkat Tinggi dan Sangat Tinggi wajib ditangani; Sedang, Rendah, dan Sangat Rendah cukup dipantau."),
        N("L", "Batas itu ketetapan pemerintah daerah, bukan bawaan aplikasi. Kalau suatu saat digeser, isi daftar ini berubah sendiri tanpa satu baris pun disentuh."),
    ], [
        {"t": "menu", "jalur": ["Form Cetak", "Risiko", "Hasil Analisis Risiko", "4_Hasil Analisis Risiko"]},
        {"t": "jeda", "ms": 2600},
        {"t": "menu", "jalur": ["Form Cetak", "Risiko", "Hasil Analisis Risiko", "5_Daftar Risiko Prioritas"]},
        {"t": "jeda", "ms": 3000},
        {"t": "gulir", "px": 420},
        {"t": "jeda", "ms": 2000},
    ]),
    L("VIII-05", [
        N("P", "Formulir 7, Rencana Tindak Pengendalian atas Hasil Identifikasi Risiko."),
        N("L", "Bandingkan dengan Formulir 6 yang berisi rencana tindak atas CEE. Isinya harus berbeda — yang satu memperbaiki lingkungan pengendalian, yang satu menangani risiko tertentu."),
        N("P", "Setiap formulir ini bisa diunduh sebagai PDF, lengkap dengan blok tanda tangan yang namanya kita isi di Data Umum."),
    ], [
        {"t": "menu", "jalur": ["Form Cetak", "Risiko", "RTP", "7_RTP atas Hasil Identifikasi Risiko"]},
        {"t": "jeda", "ms": 3000},
        {"t": "gulir", "px": 500},
        {"t": "jeda", "ms": 2200},
    ]),
]}

b9 = {"nomor": "IX", "judul": "Laporan", "langkah": [
    L("IX-01", [
        N("L", "Empat laporan menutup seluruh rangkaian ini, dan yang membedakannya bukan isinya melainkan siapa yang menyusunnya."),
        N("P", "Laporan 11, Pelaksanaan Penilaian Risiko. Disusun perangkat daerah, sesudah penilaian risiko selesai."),
        N("L", "Laporan 12, Laporan Berkala Pengelolaan Risiko. Juga disusun perangkat daerah, tetapi berkala sepanjang tahun."),
    ], [
        {"t": "judul", "nomor": "9", "teks": "Laporan", "ms": 5200},
        {"t": "menu", "jalur": ["Form Cetak", "Laporan", "11_Laporan Pelaksanaan Penilaian Risiko"]},
        {"t": "jeda", "ms": 3000},
        {"t": "gulir", "px": 450},
        {"t": "jeda", "ms": 1800},
    ]),
    L("IX-02", [
        N("P", "Laporan 13, Pemantauan oleh Unit Kepatuhan."),
        N("L", "Dan Laporan 14, Pembinaan oleh Komite Pengelolaan Risiko."),
        N("P", "Dua yang terakhir ini paling sering terlewat, dan alasannya sederhana: penyusunnya bukan perangkat daerah, melainkan unit kepatuhan dan komite di tingkat pemerintah daerah."),
        N("L", "Kalau di perangkat daerah Anda keduanya belum pernah ada, itu bukan berarti tidak wajib. Itu berarti strukturnya yang belum berjalan."),
    ], [
        {"t": "menu", "jalur": ["Form Cetak", "Laporan", "13_Laporan Pemantauan Unit Kepatuhan"]},
        {"t": "jeda", "ms": 2600},
        {"t": "menu", "jalur": ["Form Cetak", "Laporan", "14_Laporan Pembinaan Komite Pengelolaan Risiko"]},
        {"t": "jeda", "ms": 3000},
    ]),
]}

b10 = {"nomor": "X", "judul": "Penutup", "langkah": [
    L("X-01", [
        N("L", "Kita kembali ke Dasbor, tempat kita mulai tadi."),
        N("P", "Bandingkan dengan keadaannya di awal video. Yang tadi kosong sekarang terisi — jumlah risiko, sebarannya menurut peringkat, dan kemajuan pengisian."),
        N("L", "Dan ingat: tidak satu pun angka ini diketik. Semuanya lahir dari formulir yang kita kerjakan satu per satu."),
    ], [
        {"t": "judul", "nomor": "10", "teks": "Penutup", "ms": 5200},
        {"t": "menu", "jalur": ["Dashboard"]},
        {"t": "jeda", "ms": 2600},
        {"t": "gulir", "px": 480},
        {"t": "jeda", "ms": 2400},
        {"t": "gulir", "px": 480},
        {"t": "jeda", "ms": 2200},
        {"t": "gulir", "px": -960},
    ]),
    L("X-02", [
        N("P", "Menu Visualisasi menampilkan hubungan antar tingkatan sebagai bagan."),
        N("L", "Di sinilah paling mudah terlihat kalau ada yang terputus — misalnya risiko yang sasarannya tidak ada di konteks, atau sebaliknya sasaran yang belum punya risiko sama sekali."),
    ], [
        {"t": "menu", "jalur": ["Visualisasi", "Hirarki", "KRS_IRS_PD Visualisasi"]},
        {"t": "jeda", "ms": 3200},
        {"t": "gulir", "px": 450},
        {"t": "jeda", "ms": 2200},
    ]),
    L("X-03", [
        N("L", "Menu Data Risiko gabungan menyatukan ketiga tingkatan dalam satu tabel."),
        N("P", "Berguna kalau Anda hanya ingat sebagian kalimat risikonya tetapi lupa ia ada di tingkat yang mana. Cari di sini, lalu klik Lihat Data — aplikasi melompat ke formulir asalnya dan menyorot barisnya."),
    ], [
        {"t": "menu", "jalur": ["Form Input", "Risiko", "Data Risiko (IRS dan IRO)"]},
        {"t": "jeda", "ms": 2600},
        {"t": "gulir", "px": 420},
        {"t": "jeda", "ms": 2200},
    ]),
    L("X-04", [
        N("P", "Terakhir, satu hal yang menenangkan: menghapus di aplikasi ini tidak berarti hilang."),
        N("L", "Setiap baris yang dihapus masuk ke menu Data Terhapus, dan bisa dipulihkan. Jadi jangan takut mencoba."),
    ], [
        {"t": "menu", "jalur": ["Utilities", "Data Terhapus"]},
        {"t": "jeda", "ms": 3000},
    ]),
    L("X-05", [
        N("L", "Sampai di sini seluruh rangkaiannya. Dari Data Umum, CEE, konteks, identifikasi, analisis, rencana tindak, monitoring, sampai laporan tercetak."),
        N("P", "Kalau ada satu hal saja yang perlu diingat dari video ini, ingatlah yang ini: urutan menu di sidebar adalah urutan kerjanya. Kerjakan dari atas ke bawah, dan tidak akan ada yang terlewat."),
        N("L", "Dan sekali lagi — seluruh isian dalam video ini data contoh. Untuk pengisian yang sesungguhnya, penilaiannya kembali kepada pertimbangan penilai risiko di perangkat daerah Anda masing-masing."),
        N("P", "Kalau ada yang tidak jelas, halaman Panduan tempat video ini berada memuat penjelasan lengkapnya. Selamat bekerja."),
    ], [
        {"t": "judul", "teks": "Seluruh isian dalam video ini adalah DATA CONTOH", "ms": 9000},
        {"t": "menu", "jalur": ["Apa itu Manajemen Risiko / MR Kabar"]},
        {"t": "jeda", "ms": 4000},
    ]),
]}

naskah["bagian"] += [b7, b8, b9, b10]
io.open(P, "w", encoding="utf-8").write(json.dumps(naskah, indent=1, ensure_ascii=False))
print(f"Bagian VII, VIII, IX, X ditambahkan — {n[0] - 400} kalimat narasi")
