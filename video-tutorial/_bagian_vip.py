"""Menyisipkan bagian "Membaca data dan mengambil keputusan" ke naskah tutorial.

Bagian ini dikerjakan akun VIP yang hanya-baca, dan ditaruh SEBELUM Penutup:
penonton baru melihat datanya diisi, lalu diperlihatkan bagaimana data itu
dibaca. Karena itu Penutup bergeser dari X menjadi XI, dan papan judulnya ikut
berubah — jadi Penutup harus direkam ulang, bukan sekadar dipindah urutannya.

Menolak berjalan dua kali.
"""
import io
import json
import os

DIR = os.path.dirname(os.path.abspath(__file__))
P = os.path.join(DIR, "naskah.json")
naskah = json.load(io.open(P, encoding="utf-8"))
if any(b["nomor"] == "XI" for b in naskah["bagian"]):
    raise SystemExit("bagian VIP sudah disisipkan - menolak berjalan dua kali")

n = [800]


def N(suara, teks):
    n[0] += 1
    return {"id": f"n{n[0]:03d}", "suara": suara, "teks": teks}


def L(idl, narasi, aksi):
    return {"id": idl, "narasi": narasi, "aksi": aksi}


# Dasbor dibuka langsung pada tahun 2025 lewat alamatnya. Data 2026 yang dibuat
# saat merekam sudah dihapus, dan yang sungguhan memang ada di 2025 — Dasbor
# punya penyaring tahun sendiri, terpisah dari Tahun Aktif Pemda, jadi tidak
# ada setelan global yang perlu diubah demi merekam.
DASH = "/dashboard?tahun=2025"

vip = {"nomor": "X", "judul": "Membaca data dan mengambil keputusan", "akun": "mrkabarvip", "langkah": [
    L("X-01", [
        N("L", "Sampai di sini kita selalu memakai kacamata orang yang mengisi. Sekarang kacamatanya diganti."),
        N("P", "Bagian ini untuk pimpinan dan pemangku kepentingan — orang yang tidak mengisi apa pun, tetapi harus mengambil keputusan dari apa yang sudah diisi."),
        N("L", "Akun yang dipakai berbeda. Namanya akun peninjau, dan ia hanya bisa membaca. Seluruh perintah penulisan ditolak aplikasi, jadi pimpinan bisa menjelajah sebebas-bebasnya tanpa khawatir mengubah sesuatu."),
        N("P", "Perhatikan juga penyaring tahun di Dasbor. Ia terpisah dari Tahun Aktif — Anda bisa membaca tahun mana pun tanpa mengganggu perangkat daerah yang sedang mengisi tahun berjalan."),
    ], [
        {"t": "judul", "nomor": "10", "teks": "Membaca data dan mengambil keputusan", "ms": 5400},
        {"t": "buka", "url": DASH},
        {"t": "jeda", "ms": 2200},
    ]),

    L("X-02", [
        N("L", "Tiga angka teratas sebaiknya dibaca bersama-sama, jangan satu per satu."),
        N("P", "Total Risiko Teridentifikasi menunjukkan seberapa luas penilaiannya. Risiko Prioritas menunjukkan berapa yang berada di luar Selera Risiko. RTP Selesai Disusun menunjukkan berapa yang sudah punya rencana penanganan."),
        N("L", "Pertanyaan pimpinan bukan berapa angkanya, melainkan bagaimana ketiganya berhubungan."),
        N("P", "Kalau Risiko Prioritas banyak tetapi RTP yang tersusun sedikit, itu bukan soal pengisian yang belum rampung. Itu berarti ada risiko yang sudah diakui berbahaya tetapi belum ada yang menanganinya."),
        N("L", "Sebaliknya, kalau Total Risiko sangat sedikit untuk perangkat daerah sebesar itu, yang patut ditanyakan justru kejujuran penilaiannya — bukan disyukuri."),
    ], [
        {"t": "jeda", "ms": 2600},
        {"t": "gulir", "px": 260},
        {"t": "jeda", "ms": 2600},
    ]),

    L("X-03", [
        N("P", "Peta Risiko menempatkan seluruh risiko pada matriks lima kali lima."),
        N("L", "Yang dilihat pimpinan di sini bukan titik satu per satu, melainkan ke mana massanya condong."),
        N("P", "Menumpuk di kanan atas berarti banyak risiko berdampak besar dan sering terjadi. Itu tampak buruk, tetapi belum tentu berarti daerahnya buruk — bisa juga berarti penilaiannya jujur, dan itu justru awal yang sehat."),
        N("L", "Yang benar-benar mengkhawatirkan kebalikannya: seluruh titik menumpuk di kiri bawah. Tidak ada organisasi yang risikonya serendah itu. Sebaran seperti itu hampir selalu tanda penilaian yang menahan diri."),
        N("P", "Garis putus-putus bertangga pada matriks adalah batas Selera Risiko. Segala yang berada di luarnya wajib punya rencana tindak."),
    ], [
        {"t": "gulir", "px": 420},
        {"t": "jeda", "ms": 3200},
        {"t": "zoom", "teks": "Peta Risiko (Matriks Analisis Risiko 5×5)", "skala": 1.3, "ms": 800},
        {"t": "jeda", "ms": 3000},
        {"t": "zoomKeluar", "ms": 650},
    ]),

    L("X-04", [
        N("L", "Berikutnya Ranking Eksposur Risiko per perangkat daerah."),
        N("P", "Widget ini paling sering disalahpahami. Ia bukan daftar perangkat daerah terburuk."),
        N("L", "Perangkat daerah yang berada di atas biasanya justru yang paling teliti menilai dirinya, atau yang memang mengurus urusan berisiko tinggi — pekerjaan konstruksi, pelayanan kesehatan, penyaluran bantuan."),
        N("P", "Cara membacanya: ini daftar tempat perhatian pimpinan paling berdampak, bukan daftar yang perlu ditegur."),
        N("L", "Kalau daftar ini dipakai untuk menegur, akibatnya bisa ditebak — tahun berikutnya semua perangkat daerah akan menilai dirinya rendah, dan seluruh sistem ini kehilangan gunanya."),
    ], [
        {"t": "gulir", "px": 460},
        {"t": "jeda", "ms": 3400},
    ]),

    L("X-05", [
        N("P", "Siklus empat skor risiko — Inheren, Residual, Target, dan Aktual."),
        N("L", "Inilah widget yang paling jujur di seluruh Dasbor, dan yang paling layak dibawa ke rapat."),
        N("P", "Inheren adalah keadaan seandainya tidak ada pengendalian. Residual keadaan sekarang. Target yang dituju setelah rencana tindak dijalankan. Aktual adalah kenyataannya di ujung tahun."),
        N("L", "Pertanyaan yang menentukan cuma satu: apakah Aktual bergerak mendekati Target?"),
        N("P", "Kalau tidak bergerak, rencana tindaknya tidak bekerja. Bisa karena rencananya keliru, bisa karena tidak dijalankan, bisa karena penyebabnya ternyata bukan yang diduga."),
        N("L", "Ketiganya keputusan yang berbeda, dan tidak satu pun bisa diambil tanpa melihat widget ini."),
    ], [
        {"t": "gulir", "px": 440},
        {"t": "jeda", "ms": 3600},
    ]),

    L("X-06", [
        N("L", "Kepatuhan Pelaporan menunjukkan berapa perangkat daerah yang sudah mengisi Formulir 8, 9, dan 10."),
        N("P", "Ini kelihatan seperti urusan administrasi, dan justru karena itu sering diabaikan pimpinan."),
        N("L", "Padahal tanpa Formulir 8, 9, dan 10, seluruh angka yang tadi kita baca tidak bisa diverifikasi. Kita hanya tahu apa yang direncanakan, tidak tahu apa yang dikerjakan."),
        N("P", "Angka kepatuhan yang rendah berarti Dasbor ini sedang menampilkan rencana, bukan kenyataan. Itu perlu diketahui sebelum keputusan apa pun diambil darinya."),
    ], [
        {"t": "gulir", "px": 440},
        {"t": "jeda", "ms": 3000},
    ]),

    L("X-07", [
        N("P", "Log Kejadian Risiko Terealisasi mencatat risiko yang benar-benar terjadi."),
        N("L", "Bandingkan dengan penilaian kemungkinan yang ada di atas. Kalau sebuah risiko dinilai jarang terjadi tetapi kejadiannya tercatat berkali-kali dalam setahun, penilaian tahun depan harus berubah."),
        N("P", "Di sinilah manajemen risiko berhenti menjadi dokumen dan mulai menjadi alat. Log ini yang mengoreksi penilaian, bukan sebaliknya."),
        N("L", "Dua tren lima tahun di bawahnya menjawab pertanyaan yang berbeda lagi: apakah keadaannya membaik dari tahun ke tahun, atau kita hanya sibuk mengisi formulir yang sama berulang-ulang."),
    ], [
        {"t": "gulir", "px": 460},
        {"t": "jeda", "ms": 3200},
        {"t": "gulir", "px": 460},
        {"t": "jeda", "ms": 3000},
    ]),

    L("X-08", [
        N("L", "Untuk keperluan rapat, seluruh isi Dasbor ini ada versi cetaknya."),
        N("P", "Daftar Risiko Prioritas pada Formulir 5, hasil analisis pada Formulir 4, dan laporan Bab Empat pada Formulir 11 sampai 14 — semuanya bisa diunduh sebagai PDF dan dibawa ke rapat tanpa perlu membuka aplikasi."),
        N("L", "Akun peninjau bisa membuka dan mengunduh semuanya."),
    ], [
        {"t": "menu", "jalur": ["Form Cetak", "Risiko", "Hasil Analisis Risiko", "5_Daftar Risiko Prioritas"]},
        {"t": "jeda", "ms": 3000},
        {"t": "gulir", "px": 420},
        {"t": "jeda", "ms": 2400},
    ]),

    L("X-09", [
        N("P", "Terakhir, satu hal yang membuat akun ini aman diberikan kepada siapa pun yang perlu membaca."),
        N("L", "Akun peninjau tidak bisa mengubah apa pun. Bukan karena tombolnya disembunyikan, melainkan karena aplikasi menolak seluruh perintah penulisan di sisi server."),
        N("P", "Jadi pimpinan bisa membuka formulir mana pun, menelusuri sampai ke baris paling dalam, dan tidak ada satu pun kemungkinan data perangkat daerah berubah karenanya."),
        N("L", "Perhatikan formulir ini: barisnya bisa dibaca lengkap, tetapi tidak ada tombol tambah maupun ubah."),
    ], [
        {"t": "menu", "jalur": ["Form Input", "Risiko", "Data Risiko (IRS dan IRO)"]},
        {"t": "jeda", "ms": 3200},
        {"t": "gulir", "px": 400},
        {"t": "jeda", "ms": 2600},
    ]),
]}

# Penutup bergeser ke XI; papan judulnya ikut berubah, jadi ia direkam ulang.
penutup = next(b for b in naskah["bagian"] if b["nomor"] == "X" and b["judul"] == "Penutup")
penutup["nomor"] = "XI"
for aksi in penutup["langkah"][0]["aksi"]:
    if aksi.get("t") == "judul" and aksi.get("nomor") == "10":
        aksi["nomor"] = "11"

# Kalimat penutup ikut menyebut bagian baru itu.
penutup["langkah"][-1]["narasi"].insert(2, N(
    "P",
    "Dan kalau Anda pimpinan yang menonton video ini, bagian sebelum ini yang paling berguna: "
    "cara membaca datanya dan pertanyaan apa yang layak diajukan dari sana.",
))

i = naskah["bagian"].index(penutup)
naskah["bagian"].insert(i, vip)

io.open(P, "w", encoding="utf-8").write(json.dumps(naskah, indent=1, ensure_ascii=False))
print(f"Bagian X (VIP) disisipkan, Penutup menjadi XI - {n[0] - 800} kalimat narasi baru")
