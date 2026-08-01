"""Keputusan Bupati Aceh Barat tentang Pembentukan Struktur Pengelola Risiko.

Mengikuti contoh pada Perdep PPKD Nomor 4 Tahun 2019 Lampiran 2 (halaman
berlabel 108 sampai 114): kepala keputusan, konsiderans Menimbang dan
Mengingat, diktum MEMUTUSKAN dengan KESATU sampai KELIMA, lalu lampiran berisi
susunan pengelola.

Berbeda dari Surat Edaran yang bersifat pemberitahuan dan arahan, Keputusan
bersifat PENETAPAN — menunjuk jabatan tertentu memangku peran tertentu. Karena
itu struktur pengelola memang harus melalui Keputusan, bukan Surat Edaran.

Susunan pada Diktum KEDUA dan tugas pada Diktum KETIGA disalin dari contoh
Perdep, disesuaikan untuk kabupaten: tidak ada Unit Pemilik Risiko Tingkat
Eselon I dan tidak ada Kepala Biro, sebab keduanya khusus provinsi. Satu hal
yang diambil dari Perdep dan belum terekam pada aplikasi: Komite Pengelolaan
Risiko DIKETUAI Bupati sendiri, dengan Kepala Bappeda sebagai koordinator.

Tata letak, huruf, dan kertasnya sama dengan Peraturan Bupati dan Surat Edaran
yang disusun lebih dulu — Bookman Old Style 12 pt di atas kertas F4.

Nomor dan tanggal sengaja dikosongkan menjadi titik-titik, diisi Bagian Hukum
saat penomoran.
"""
import io
import sys
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

import inti
from inti import P, PM, angka, blok_konsiderans, blok_label, huruf, par, tulis

GBR = Path(__file__).parent / "gambar"
TUJUAN = Path.home() / "OneDrive/Desktop/MR Kabar"
BUPATI = "TARMIZI, S.P., M.M."
DAFTAR_GAMBAR = [("rIdLambang", str(GBR / "garuda.jpeg"))]

MENGINGAT = [
    "Undang-Undang Nomor 11 Tahun 2024 tentang Kabupaten Aceh Barat di Aceh (Lembaran Negara "
    "Republik Indonesia Tahun 2024 Nomor 109, Tambahan Lembaran Negara Republik Indonesia "
    "Nomor 6931);",
    "Undang-Undang Nomor 28 Tahun 1999 tentang Penyelenggaraan Negara yang Bersih dan Bebas dari "
    "Korupsi, Kolusi, dan Nepotisme (Lembaran Negara Republik Indonesia Tahun 1999 Nomor 75, "
    "Tambahan Lembaran Negara Republik Indonesia Nomor 3851);",
    "Undang-Undang Nomor 11 Tahun 2006 tentang Pemerintahan Aceh (Lembaran Negara Republik "
    "Indonesia Tahun 2006 Nomor 62, Tambahan Lembaran Negara Republik Indonesia Nomor 4633);",
    "Undang-Undang Nomor 23 Tahun 2014 tentang Pemerintahan Daerah (Lembaran Negara Republik "
    "Indonesia Tahun 2014 Nomor 244, Tambahan Lembaran Negara Republik Indonesia Nomor 5587) "
    "sebagaimana telah beberapa kali diubah, terakhir dengan Undang-Undang Nomor 6 Tahun 2023 "
    "tentang Penetapan Peraturan Pemerintah Pengganti Undang-Undang Nomor 2 Tahun 2022 tentang "
    "Cipta Kerja menjadi Undang-Undang (Lembaran Negara Republik Indonesia Tahun 2023 Nomor 41, "
    "Tambahan Lembaran Negara Republik Indonesia Nomor 6856);",
    "Peraturan Pemerintah Nomor 60 Tahun 2008 tentang Sistem Pengendalian Intern Pemerintah "
    "(Lembaran Negara Republik Indonesia Tahun 2008 Nomor 127, Tambahan Lembaran Negara Republik "
    "Indonesia Nomor 4890);",
    "Peraturan Menteri Dalam Negeri Nomor 80 Tahun 2015 tentang Pembentukan Produk Hukum Daerah "
    "(Berita Negara Republik Indonesia Tahun 2015 Nomor 2036) sebagaimana telah diubah dengan "
    "Peraturan Menteri Dalam Negeri Nomor 120 Tahun 2018 (Berita Negara Republik Indonesia Tahun "
    "2018 Nomor 157);",
    "Peraturan Deputi Kepala Badan Pengawasan Keuangan dan Pembangunan Bidang Pengawasan "
    "Penyelenggaraan Keuangan Daerah Nomor 4 Tahun 2019 tentang Pedoman Pengelolaan Risiko pada "
    "Pemerintah Daerah;",
    "Peraturan Bupati Aceh Barat Nomor ……… Tahun ……… tentang Pedoman Penerapan Manajemen Risiko "
    "di Lingkungan Pemerintah Kabupaten Aceh Barat (Berita Daerah Kabupaten Aceh Barat Tahun "
    "……… Nomor ………).",
]


def kepala(tahun):
    b = inti.gambar("rIdLambang", str(GBR / "garuda.jpeg"), lebar_inci=0.85)
    b += P("BUPATI ACEH BARAT", rata="center", b=True, after=360)
    b += P("KEPUTUSAN BUPATI ACEH BARAT", rata="center", b=True, after=0)
    b += P("NOMOR ……… TAHUN " + str(tahun), rata="center", b=True, after=360)
    b += P("TENTANG", rata="center", b=True, after=360)
    b += P("PEMBENTUKAN STRUKTUR PENGELOLA RISIKO", rata="center", b=True, after=0)
    b += P("KABUPATEN ACEH BARAT TAHUN " + str(tahun), rata="center", b=True, after=360)
    b += P("BUPATI ACEH BARAT,", rata="center", b=True, after=360)
    return b


def konsiderans(tahun):
    b = blok_konsiderans("Menimbang", [
        ("a.", "bahwa dalam rangka menyelenggarakan Sistem Pengendalian Intern Pemerintah "
               "sebagaimana diamanatkan Peraturan Pemerintah Nomor 60 Tahun 2008 tentang Sistem "
               "Pengendalian Intern Pemerintah, pengelolaan Risiko di lingkungan Pemerintah "
               "Kabupaten Aceh Barat perlu diselenggarakan secara terstruktur dan berjenjang;"),
        ("b.", "bahwa untuk menjamin setiap tahapan pengelolaan Risiko dilaksanakan oleh pejabat "
               "yang berwenang dan bertanggung jawab, perlu dibentuk struktur pengelola Risiko "
               f"Kabupaten Aceh Barat Tahun {tahun};"),
        ("c.", "bahwa berdasarkan pertimbangan sebagaimana dimaksud dalam huruf a dan huruf b, "
               "perlu menetapkan Keputusan Bupati tentang Pembentukan Struktur Pengelola Risiko "
               f"Kabupaten Aceh Barat Tahun {tahun};"),
    ])
    b += blok_konsiderans("Mengingat", [(f"{i}.", t) for i, t in enumerate(MENGINGAT, 1)])
    return b


def diktum(tahun):
    b = P("MEMUTUSKAN:", rata="center", b=True, after=240, before=240)
    b += blok_label("Menetapkan", "KEPUTUSAN BUPATI ACEH BARAT TENTANG PEMBENTUKAN STRUKTUR "
                                  f"PENGELOLA RISIKO KABUPATEN ACEH BARAT TAHUN {tahun}.")
    b += P("", after=120)

    b += blok_konsiderans("KESATU", [
        ("", f"Membentuk Struktur Pengelola Risiko Kabupaten Aceh Barat Tahun {tahun}, dengan "
             "susunan sebagaimana tercantum dalam Lampiran yang merupakan bagian tidak "
             "terpisahkan dari Keputusan ini."),
    ])

    b += blok_konsiderans("KEDUA", [
        ("", "Struktur Pengelola Risiko sebagaimana dimaksud dalam Diktum KESATU terdiri atas:"),
    ])
    for h, t in [
        ("a.", "Bupati Aceh Barat sebagai penanggung jawab pengelolaan Risiko;"),
        ("b.", "Sekretaris Daerah sebagai koordinator penyelenggaraan pengelolaan Risiko "
               "Pemerintah Daerah;"),
        ("c.", "Unit Pemilik Risiko, yang terdiri atas Unit Pemilik Risiko Tingkat Pemerintah "
               "Daerah, Tingkat Eselon II, serta Tingkat Eselon III dan IV;"),
        ("d.", "Komite Pengelolaan Risiko tingkat Pemerintah Daerah;"),
        ("e.", "Asisten Sekretaris Daerah sebagai Unit Kepatuhan; dan"),
        ("f.", "Inspektur Kabupaten Aceh Barat sebagai penanggung jawab pengawasan."),
    ]:
        b += huruf(h.rstrip("."), t, kiri=3374, gantung=397)

    b += blok_konsiderans("KETIGA", [
        ("", "Susunan keanggotaan dan uraian tugas masing-masing pengelola Risiko sebagaimana "
             "dimaksud dalam Diktum KEDUA tercantum dalam Lampiran Keputusan ini."),
    ])

    b += blok_konsiderans("KEEMPAT", [
        ("", "Seluruh tahapan pengelolaan Risiko yang dilaksanakan pengelola Risiko sebagaimana "
             "dimaksud dalam Diktum KEDUA direkam pada aplikasi MR Kabar "
             "(mrkabar.acehbaratkab.go.id) sebagai kertas kerja resmi."),
    ])

    b += blok_konsiderans("KELIMA", [
        ("", "Segala biaya yang timbul sebagai akibat ditetapkannya Keputusan ini dibebankan pada "
             "Anggaran Pendapatan dan Belanja Kabupaten Aceh Barat Tahun Anggaran " + str(tahun) + "."),
    ])

    b += blok_konsiderans("KEENAM", [
        ("", "Keputusan ini mulai berlaku pada tanggal ditetapkan."),
    ])
    return b


def penutup(tahun):
    b = P("", after=360)
    b += PM([("Ditetapkan di Meulaboh", False)], kiri=4990, after=0, rata="left")
    b += PM([(f"pada tanggal ……………………… {tahun}", False)], kiri=4990, after=360, rata="left")
    b += PM([("BUPATI ACEH BARAT,", True)], kiri=4990, after=1100, rata="left")
    b += PM([(BUPATI, True)], kiri=4990, after=0, rata="left")
    return b


# ── Lampiran: susunan dan tugas ───────────────────────────────────────

SUSUNAN = [
    ("Penanggung Jawab Pengelolaan Risiko", "Bupati Aceh Barat",
     "Menetapkan arah kebijakan pengelolaan Risiko Pemerintah Daerah."),
    ("Koordinator Penyelenggaraan Pengelolaan Risiko", "Sekretaris Daerah Kabupaten Aceh Barat",
     "Mengoordinasikan penyelenggaraan pengelolaan Risiko di lingkungan Pemerintah Kabupaten "
     "Aceh Barat dan memastikan setiap tahapan dilaksanakan sesuai arahan Bupati."),
    ("Unit Pemilik Risiko Tingkat Pemerintah Daerah",
     "Ketua: Bupati Aceh Barat\n"
     "Koordinator merangkap anggota: Kepala Badan Perencanaan Pembangunan Daerah\n"
     "Anggota: seluruh Kepala Perangkat Daerah, Sekretaris Daerah, Sekretaris DPRK, Inspektur, "
     "dan Direktur BLUD RSUD Cut Nyak Dhien",
     "Melaksanakan penilaian Risiko strategis Pemerintah Daerah, menetapkan penanganannya, serta "
     "memantau pelaksanaan Rencana Tindak Pengendalian tingkat Pemerintah Daerah."),
    ("Unit Pemilik Risiko Tingkat Eselon II",
     "Ketua: Kepala Perangkat Daerah masing-masing\n"
     "Koordinator teknis merangkap anggota: Sekretaris Perangkat Daerah atau pejabat yang "
     "menangani perencanaan\n"
     "Anggota: seluruh Kepala Bagian, Kepala Bidang, atau Inspektur Pembantu pada Perangkat "
     "Daerah yang bersangkutan",
     "Melaksanakan penilaian Risiko strategis Perangkat Daerah, menyusun dan melaksanakan Rencana "
     "Tindak Pengendalian, serta menyampaikan laporan berkala kepada Unit Kepatuhan."),
    ("Unit Pemilik Risiko Tingkat Eselon III dan IV",
     "Ketua: Kepala Bagian atau Kepala Bidang\n"
     "Koordinator: Kepala Subbagian, Kepala Subbidang, atau Kepala Seksi yang menangani "
     "perencanaan kegiatan\n"
     "Anggota: seluruh Kepala Subbagian, Kepala Subbidang, dan Kepala Seksi pada Bagian atau "
     "Bidang yang bersangkutan",
     "Melaksanakan penilaian Risiko operasional pada bidang tugasnya, melaksanakan kegiatan "
     "pengendalian yang dibutuhkan, serta mencatat kejadian Risiko dan realisasi Rencana Tindak "
     "Pengendalian."),
    ("Komite Pengelolaan Risiko",
     "Ketua: Bupati Aceh Barat\n"
     "Koordinator merangkap anggota: Kepala Badan Perencanaan Pembangunan Daerah\n"
     "Anggota: Kepala Perangkat Daerah yang ditunjuk",
     "Menetapkan petunjuk pelaksanaan pengelolaan Risiko; menetapkan kebijakan penerapan berupa "
     "Kategori Risiko, Kriteria Risiko, Matriks Analisis Risiko, Level Risiko, dan Selera Risiko; "
     "menetapkan Daftar Risiko, Peta Risiko, dan Rencana Tindak Pengendalian tingkat Pemerintah "
     "Daerah; melakukan pembinaan berupa sosialisasi, bimbingan, supervisi, dan pelatihan; serta "
     "menyusun laporan semesteran dan tahunan kegiatan pembinaan."),
    ("Unit Kepatuhan", "Asisten Sekretaris Daerah Kabupaten Aceh Barat",
     "Memantau pelaksanaan pengelolaan Risiko pada Unit Pemilik Risiko sejak penilaian kelemahan "
     "lingkungan pengendalian sampai pelaksanaan kegiatan pengendalian; menelaah kewajaran "
     "analisis Risiko dan kelayakan Rencana Tindak Pengendalian; serta menyusun laporan triwulanan "
     "dan tahunan pemantauan."),
    ("Penanggung Jawab Pengawasan", "Inspektur Kabupaten Aceh Barat",
     "Melaksanakan pengawasan atas penyelenggaraan pengelolaan Risiko, memberikan layanan "
     "fasilitasi penerapan pengelolaan Risiko dan penyelenggaraan Sistem Pengendalian Intern "
     "Pemerintah, serta melaksanakan pengawasan berbasis Risiko."),
]


def lampiran(tahun):
    b = P("", potong=True, after=0)
    b += P("LAMPIRAN", rata="center", b=True, after=0)
    b += P("KEPUTUSAN BUPATI ACEH BARAT", rata="center", b=True, after=0)
    b += P("NOMOR ……… TAHUN " + str(tahun), rata="center", b=True, after=0)
    b += P("TENTANG PEMBENTUKAN STRUKTUR PENGELOLA RISIKO", rata="center", b=True, after=0)
    b += P("KABUPATEN ACEH BARAT TAHUN " + str(tahun), rata="center", b=True, after=360)
    b += P("SUSUNAN DAN URAIAN TUGAS PENGELOLA RISIKO", rata="center", b=True, after=240)

    isi = [["No.", "Kedudukan", "Susunan Keanggotaan", "Uraian Tugas"]]
    for i, (kedudukan, susunan, tugas) in enumerate(SUSUNAN, 1):
        isi.append([str(i), kedudukan, susunan, tugas])
    b += inti.tabel([650, 2100, 3300, 3650], isi, p=18,
                    rata_sel=["center", "left", "left", "left"])

    b += P("", after=480)
    b += PM([("BUPATI ACEH BARAT,", True)], kiri=4990, after=1100, rata="left")
    b += PM([(BUPATI, True)], kiri=4990, after=0, rata="left")
    return b


def susun(tahun):
    inti._gambar_ke[0] = 0
    b = kepala(tahun) + konsiderans(tahun) + diktum(tahun) + penutup(tahun) + lampiran(tahun)
    nama = f"Keputusan Bupati Aceh Barat - Pembentukan Struktur Pengelola Risiko Tahun {tahun}.docx"
    path = TUJUAN / nama
    tulis(path, b, daftar_gambar=DAFTAR_GAMBAR)
    print(f"  {nama}  ({path.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    TUJUAN.mkdir(parents=True, exist_ok=True)
    print("Keputusan Bupati tersusun di", TUJUAN)
    susun(2025)
    susun(2026)
