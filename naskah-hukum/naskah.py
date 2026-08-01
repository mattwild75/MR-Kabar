"""Naskah Peraturan Bupati Aceh Barat tentang Pedoman Penerapan Manajemen
Risiko di Lingkungan Pemerintah Kabupaten Aceh Barat.

Peraturan BARU yang mencabut Peraturan Bupati Aceh Barat Nomor 16 Tahun
2022. Seluruh tabel acuan pada lampiran (jenis risiko, kriteria dampak,
kriteria kemungkinan, matriks analisis risiko, peringkat risiko, dan
kuesioner evaluasi lingkungan pengendalian) ditarik langsung dari basis
data aplikasi MR KABAR, sehingga norma pada peraturan ini dan perilaku
aplikasi tidak dapat berbeda.
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from inti import (P, PM, R, bab, bagian, pasal, ayat, huruf, angka, par,  # noqa: E402
                  sectpr, paragraf_pemisah_bagian, gambar,
                  definisi, blok_konsiderans, tabel, ttd_kanan, tulis,
                  keterangan_tabel)

BASIS = Path(__file__).parent

# Huruf penanda kolom pada blok Keterangan setiap lampiran bertabel.
HURUF_KOLOM = "abcdefghijklmnopqrstuvwxyz"
REF = json.loads((BASIS / "referensi.json").read_text(encoding="utf-8"))
GBR = Path(__file__).parent / "gambar"
CONTOH = json.loads((BASIS / "contoh.json").read_text(encoding="utf-8"))
NAMA_GAMBAR = ['struktur', 'tahapan', 'penilaian', 'rtp', 'spbe', 'matriks', 'peta', 'kode', 'jenjang', 'sebab', 'respons', 'unsur', 'siklus', 'lapor']
DAFTAR_GAMBAR = [(f"rIdG{i}", str(GBR / f"{n}.jpeg")) for i, n in enumerate(NAMA_GAMBAR, 1)]
# Lambang negara didaftarkan terpisah dari NAMA_GAMBAR supaya tidak ikut
# terhitung sebagai gambar isi yang berketerangan bernomor.
DAFTAR_GAMBAR.append(("rIdLambang", str(GBR / "garuda.jpeg")))
RID = {n: f"rIdG{i}" for i, n in enumerate(NAMA_GAMBAR, 1)}
KELUARAN = Path(r"C:\Users\Nurhikmat Muhammad\OneDrive\Desktop\MR Kabar") / \
    "Peraturan Bupati Aceh Barat - Pedoman Penerapan Manajemen Risiko (2026).docx"

JUDUL = ("PEDOMAN PENERAPAN MANAJEMEN RISIKO DI LINGKUNGAN "
         "PEMERINTAH KABUPATEN ACEH BARAT")
TANGGAL = "30 Juli 2026"
# Padanan Hijriah tanggal penetapan, dipakai berdampingan dengan
# penanggalan Masehi sesuai kelaziman penaskahan peraturan di Aceh.
HIJRIAH = "16 Safar 1448"

d = []
A = d.append


# ══════════════════ KEPALA PERATURAN ══════════════════
A(gambar("rIdLambang", str(GBR / "garuda.jpeg"), lebar_inci=1.0))
A(P("BUPATI ACEH BARAT", rata="center", b=True, after=0))
A(P("PROVINSI ACEH", rata="center", b=True, after=240))
A(P("PERATURAN BUPATI ACEH BARAT", rata="center", b=True, after=0))
A(P("NOMOR          TAHUN 2026", rata="center", b=True, after=240))
A(P("TENTANG", rata="center", b=True, after=240))
A(P(JUDUL, rata="center", b=True, after=240))
A(P("DENGAN RAHMAT ALLAH YANG MAHA KUASA,", rata="center", b=True, after=240))
A(P("BUPATI ACEH BARAT,", rata="center", b=True, after=280))

A(blok_konsiderans("Menimbang", [
    ("a.", "bahwa untuk mewujudkan tata kelola pemerintahan yang baik, akuntabel, dan berorientasi "
           "pada pencapaian tujuan, penyelenggaraan pemerintahan daerah perlu didukung pengelolaan "
           "risiko yang sistematis dan berkelanjutan;"),
    ("b.", "bahwa Pasal 13 ayat (1) Peraturan Pemerintah Nomor 60 Tahun 2008 tentang Sistem "
           "Pengendalian Intern Pemerintah mewajibkan pimpinan Instansi Pemerintah melakukan "
           "penilaian risiko, sehingga diperlukan pedoman penerapan manajemen risiko di lingkungan "
           "Pemerintah Kabupaten Aceh Barat;"),
    ("c.", "bahwa penerapan manajemen risiko perlu diselenggarakan secara elektronik dan terpadu "
           "sesuai dengan kebijakan Sistem Pemerintahan Berbasis Elektronik agar hasilnya akurat, "
           "seragam, dan dapat ditelusuri;"),
    ("d.", "bahwa Peraturan Bupati Aceh Barat Nomor 16 Tahun 2022 tentang Pedoman Penerapan "
           "Manajemen Risiko di Lingkungan Pemerintah Kabupaten Aceh Barat sudah tidak sesuai "
           "dengan perkembangan kebutuhan penyelenggaraan manajemen risiko, sehingga perlu diganti;"),
    ("e.", "bahwa berdasarkan pertimbangan sebagaimana dimaksud dalam huruf a, huruf b, huruf c, dan "
           "huruf d, perlu menetapkan Peraturan Bupati tentang Pedoman Penerapan Manajemen Risiko di "
           "Lingkungan Pemerintah Kabupaten Aceh Barat;"),
]))
A(P("", after=100))

MENGINGAT = [
    "Undang-Undang Nomor 11 Tahun 2024 tentang Kabupaten Aceh Barat di Aceh (Lembaran Negara "
    "Republik Indonesia Tahun 2024 Nomor 109, Tambahan Lembaran Negara Republik Indonesia "
    "Nomor 6931);",
    "Undang-Undang Nomor 28 Tahun 1999 tentang Penyelenggaraan Negara yang Bersih dan Bebas dari "
    "Korupsi, Kolusi dan Nepotisme (Lembaran Negara Republik Indonesia Tahun 1999 Nomor 75, Tambahan "
    "Lembaran Negara Republik Indonesia Nomor 3851);",
    "Undang-Undang Nomor 11 Tahun 2006 tentang Pemerintahan Aceh (Lembaran Negara Republik Indonesia "
    "Tahun 2006 Nomor 62, Tambahan Lembaran Negara Republik Indonesia Nomor 4633);",
    "Undang-Undang Nomor 11 Tahun 2008 tentang Informasi dan Transaksi Elektronik (Lembaran Negara "
    "Republik Indonesia Tahun 2008 Nomor 58, Tambahan Lembaran Negara Republik Indonesia Nomor 4843) "
    "sebagaimana telah beberapa kali diubah, terakhir dengan Undang-Undang Nomor 1 Tahun 2024 tentang "
    "Perubahan Kedua atas Undang-Undang Nomor 11 Tahun 2008 tentang Informasi dan Transaksi "
    "Elektronik (Lembaran Negara Republik Indonesia Tahun 2024 Nomor 1, Tambahan Lembaran Negara "
    "Republik Indonesia Nomor 6905);",
    "Undang-Undang Nomor 25 Tahun 2009 tentang Pelayanan Publik (Lembaran Negara Republik Indonesia "
    "Tahun 2009 Nomor 112, Tambahan Lembaran Negara Republik Indonesia Nomor 5038);",
    "Undang-Undang Nomor 23 Tahun 2014 tentang Pemerintahan Daerah (Lembaran Negara Republik "
    "Indonesia Tahun 2014 Nomor 244, Tambahan Lembaran Negara Republik Indonesia Nomor 5587) "
    "sebagaimana telah beberapa kali diubah, terakhir dengan Undang-Undang Nomor 6 Tahun 2023 tentang "
    "Penetapan Peraturan Pemerintah Pengganti Undang-Undang Nomor 2 Tahun 2022 tentang Cipta Kerja "
    "menjadi Undang-Undang (Lembaran Negara Republik Indonesia Tahun 2023 Nomor 41, Tambahan Lembaran "
    "Negara Republik Indonesia Nomor 6856);",
    "Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi (Lembaran Negara Republik "
    "Indonesia Tahun 2022 Nomor 196, Tambahan Lembaran Negara Republik Indonesia Nomor 6820);",
    "Peraturan Pemerintah Nomor 60 Tahun 2008 tentang Sistem Pengendalian Intern Pemerintah "
    "(Lembaran Negara Republik Indonesia Tahun 2008 Nomor 127, Tambahan Lembaran Negara Republik "
    "Indonesia Nomor 4890);",
    "Peraturan Pemerintah Nomor 18 Tahun 2016 tentang Perangkat Daerah (Lembaran Negara Republik "
    "Indonesia Tahun 2016 Nomor 114, Tambahan Lembaran Negara Republik Indonesia Nomor 5887) "
    "sebagaimana telah diubah dengan Peraturan Pemerintah Nomor 72 Tahun 2019 tentang Perubahan atas "
    "Peraturan Pemerintah Nomor 18 Tahun 2016 tentang Perangkat Daerah (Lembaran Negara Republik "
    "Indonesia Tahun 2019 Nomor 187, Tambahan Lembaran Negara Republik Indonesia Nomor 6402);",
    "Peraturan Pemerintah Nomor 12 Tahun 2019 tentang Pengelolaan Keuangan Daerah (Lembaran Negara "
    "Republik Indonesia Tahun 2019 Nomor 42, Tambahan Lembaran Negara Republik Indonesia Nomor 6322);",
    "Peraturan Pemerintah Nomor 71 Tahun 2019 tentang Penyelenggaraan Sistem dan Transaksi Elektronik "
    "(Lembaran Negara Republik Indonesia Tahun 2019 Nomor 185, Tambahan Lembaran Negara Republik "
    "Indonesia Nomor 6400);",
    "Peraturan Presiden Nomor 54 Tahun 2018 tentang Strategi Nasional Pencegahan Korupsi (Lembaran "
    "Negara Republik Indonesia Tahun 2018 Nomor 108);",
    "Peraturan Presiden Nomor 39 Tahun 2023 tentang Manajemen Risiko Pembangunan Nasional "
    "(Lembaran Negara Republik Indonesia Tahun 2023 Nomor 90);",
    "Peraturan Presiden Nomor 95 Tahun 2018 tentang Sistem Pemerintahan Berbasis Elektronik "
    "(Lembaran Negara Republik Indonesia Tahun 2018 Nomor 182);",
    "Peraturan Menteri Dalam Negeri Nomor 77 Tahun 2020 tentang Pedoman Teknis Pengelolaan Keuangan "
    "Daerah (Berita Negara Republik Indonesia Tahun 2020 Nomor 1781);",
    "Peraturan Deputi Kepala Badan Pengawasan Keuangan dan Pembangunan Bidang Pengawasan "
    "Penyelenggaraan Keuangan Daerah Nomor 4 Tahun 2019 tentang Pedoman Pengelolaan Risiko pada "
    "Pemerintah Daerah;",
    "Qanun Kabupaten Aceh Barat Nomor 3 Tahun 2016 tentang Pembentukan dan Susunan Perangkat Daerah "
    "Kabupaten Aceh Barat (Lembaran Kabupaten Aceh Barat Tahun 2016 Nomor 3, Tambahan Lembaran "
    "Kabupaten Aceh Barat Nomor 180) sebagaimana telah beberapa kali diubah, terakhir dengan Qanun "
    "Kabupaten Aceh Barat Nomor 2 Tahun 2020 tentang Perubahan Kedua atas Qanun Kabupaten Aceh Barat "
    "Nomor 3 Tahun 2016 tentang Pembentukan dan Susunan Perangkat Daerah Kabupaten Aceh Barat "
    "(Lembaran Kabupaten Aceh Barat Tahun 2020 Nomor 2, Tambahan Lembaran Kabupaten Aceh Barat "
    "Nomor 224);",
]
for n, t in enumerate(MENGINGAT, 1):
    A(PM([("Mengingat" if n == 1 else "", False), ("\t", False), (":" if n == 1 else "", False),
          ("\t", False), (f"{n}.", False), ("\t", False), (t, False)],
         kiri=2977, gantung=2977, after=100, tab=[1560, 1840, 2410, 2977], line=264))

A(P("", after=200))
A(P("MEMUTUSKAN:", rata="center", b=True, after=240))
A(PM([("Menetapkan", False), ("\t", False), (":", False), ("\t", False),
      ("PERATURAN BUPATI TENTANG " + JUDUL + ".", True)],
     kiri=2410, gantung=2410, after=200, tab=[1560, 1840, 2410], line=264))


# ══════════════════ BAB I ══════════════════
A(bab("I", "KETENTUAN UMUM"))
A(pasal(1))
A(par("Dalam Peraturan Bupati ini yang dimaksud dengan:", after=100))
DEF = [
    "Daerah adalah Kabupaten Aceh Barat.",
    "Pemerintah Kabupaten adalah Pemerintah Kabupaten Aceh Barat.",
    "Bupati adalah Bupati Aceh Barat.",
    "Sekretaris Daerah adalah Sekretaris Daerah Kabupaten Aceh Barat.",
    "Inspektorat adalah Inspektorat Kabupaten Aceh Barat.",
    "Satuan Kerja Perangkat Kabupaten yang selanjutnya disingkat SKPK adalah perangkat daerah pada "
    "Pemerintah Kabupaten Aceh Barat selaku pengguna anggaran/pengguna barang.",
    "Sistem Pengendalian Intern Pemerintah yang selanjutnya disingkat SPIP adalah sistem "
    "pengendalian intern yang diselenggarakan secara menyeluruh terhadap proses perancangan dan "
    "pelaksanaan kegiatan pada Pemerintah Kabupaten.",
    "Risiko adalah kemungkinan terjadinya suatu peristiwa yang berdampak negatif terhadap pencapaian "
    "tujuan dan sasaran Pemerintah Kabupaten atau SKPK.",
    "Manajemen Risiko adalah proses yang sistematis dan berkelanjutan untuk mengidentifikasi, "
    "menganalisis, mengevaluasi, menangani, memantau, dan mengomunikasikan Risiko.",
    "Penetapan Konteks adalah proses menentukan parameter internal dan eksternal serta ruang lingkup "
    "dan kriteria Risiko yang akan dikelola.",
    "Identifikasi Risiko adalah proses menemukan, mengenali, dan menguraikan Risiko beserta penyebab "
    "dan dampaknya.",
    "Analisis Risiko adalah proses menentukan tingkat kemungkinan dan tingkat dampak Risiko untuk "
    "memperoleh Skala Risiko.",
    "Evaluasi Risiko adalah proses membandingkan hasil Analisis Risiko dengan kriteria Risiko untuk "
    "menentukan Risiko Prioritas.",
    "Risiko Prioritas adalah Risiko yang berdasarkan hasil Evaluasi Risiko ditetapkan untuk ditangani "
    "terlebih dahulu.",
    "Selera Risiko adalah tingkat Risiko yang bersedia diterima Pemerintah Kabupaten atau SKPK dalam "
    "rangka pencapaian tujuan.",
    "Toleransi Risiko adalah batas penyimpangan dari Selera Risiko yang masih dapat diterima Pemerintah Kabupaten atau SKPK tanpa mengganggu pencapaian tujuan dan sasaran.",
    "Sisa Risiko adalah Risiko yang masih tersisa setelah memperhitungkan pengendalian yang telah "
    "dilaksanakan.",
    "Rencana Tindak Pengendalian yang selanjutnya disingkat RTP adalah dokumen yang memuat rencana "
    "kegiatan pengendalian atas Risiko Prioritas beserta penanggung jawab dan waktu pelaksanaannya.",
    "Kode Risiko adalah penanda unik setiap Risiko yang menunjukkan tingkatan Risiko, tahun "
    "penilaian, urusan, entitas penilai, dan nomor urut Risiko.",
    "Skala Risiko adalah nilai yang menunjukkan besaran Risiko sebagai hasil pertemuan tingkat dampak "
    "dan tingkat kemungkinan pada matriks analisis Risiko.",
    "Peta Risiko adalah gambaran sebaran Risiko pada matriks analisis Risiko.",
    "Unit Pemilik Risiko yang selanjutnya disingkat UPR adalah satuan kerja yang bertanggung jawab "
    "melaksanakan Manajemen Risiko atas tujuan dan sasaran yang menjadi kewenangannya.",
    "Pemilik Risiko adalah pejabat yang memiliki kewenangan dan bertanggung jawab mengelola Risiko.",
    "Pengelola Risiko adalah pejabat atau pegawai yang ditugaskan membantu Pemilik Risiko dalam "
    "melaksanakan proses Manajemen Risiko.",
    "Unit Kepatuhan adalah unit kerja yang menjalankan fungsi lini kedua dalam pengelolaan Risiko, yaitu memantau dan menelaah penerapan Manajemen Risiko oleh UPR tanpa mengambil alih tanggung jawab UPR.",
    "Evaluasi Lingkungan Pengendalian atau Control Environment Evaluation yang selanjutnya disingkat "
    "CEE adalah penilaian atas kondisi lingkungan pengendalian pada SKPK melalui kuesioner terhadap "
    "unsur lingkungan pengendalian.",
    "Kejadian Risiko adalah peristiwa Risiko yang benar-benar terjadi dan berdampak pada pencapaian "
    "tujuan dan sasaran.",
    "Program Pembangunan Bupati adalah program prioritas pembangunan Daerah yang menjadi penjabaran visi dan misi Bupati sebagaimana tercantum dalam Rencana Pembangunan Jangka Menengah Daerah.",
    "Sistem Pemerintahan Berbasis Elektronik yang selanjutnya disingkat SPBE adalah penyelenggaraan "
    "pemerintahan yang memanfaatkan teknologi informasi dan komunikasi untuk memberikan layanan "
    "kepada pengguna SPBE.",
    "Sistem Informasi Manajemen Risiko Kabupaten Aceh Barat yang selanjutnya disebut MR KABAR adalah "
    "aplikasi berbasis web milik Pemerintah Kabupaten yang digunakan untuk menyelenggarakan seluruh "
    "tahapan proses Manajemen Risiko secara elektronik.",
    "Dokumen Elektronik Manajemen Risiko adalah setiap informasi elektronik yang dibuat, diteruskan, "
    "dikirimkan, diterima, atau disimpan melalui MR KABAR dalam rangka penyelenggaraan Manajemen "
    "Risiko.",
    "Data Umum adalah data identitas kertas kerja Manajemen Risiko pada masing-masing SKPK yang memuat nama SKPK, tahun penilaian, serta nama dan jabatan pejabat penanda tangan dokumen Manajemen Risiko.",
    "Pengguna adalah pejabat atau pegawai pada SKPK yang diberi Hak Akses untuk menggunakan MR KABAR "
    "sesuai dengan kewenangannya.",
    "Hak Akses adalah kewenangan yang diberikan kepada Pengguna untuk melakukan tindakan tertentu di "
    "dalam MR KABAR.",
    "Pengelola MR KABAR adalah pejabat atau pegawai yang ditugaskan mengelola MR KABAR, meliputi "
    "pengelolaan Hak Akses, data acuan, dan pemeliharaan aplikasi.",
    "Perangkat Daerah yang membidangi urusan komunikasi dan informatika adalah SKPK yang "
    "menyelenggarakan urusan pemerintahan bidang komunikasi, informatika, dan persandian pada "
    "Pemerintah Kabupaten.",
]
for i, t in enumerate(DEF, 1):
    A(definisi(i, t))


# ══════════════════ BAB II ══════════════════
A(bab("II", "MAKSUD, TUJUAN, DAN RUANG LINGKUP"))
A(pasal(2))
A(par("Peraturan Bupati ini dimaksudkan sebagai pedoman bagi Pemerintah Kabupaten dan SKPK dalam "
      "menyelenggarakan Manajemen Risiko secara seragam, terukur, dan berkelanjutan sebagai bagian "
      "tidak terpisahkan dari penyelenggaraan SPIP."))
A(pasal(3))
A(par("Peraturan Bupati ini bertujuan untuk:", after=100))
for h, t in zip("abcdef", [
    "meningkatkan keyakinan yang memadai atas tercapainya tujuan dan sasaran penyelenggaraan "
    "pemerintahan daerah;",
    "meningkatkan mutu pengambilan keputusan melalui pertimbangan Risiko;",
    "mendorong penguatan lingkungan pengendalian dan budaya sadar Risiko;",
    "menyediakan dasar penyusunan program kerja pengawasan intern berbasis Risiko;",
    "mewujudkan keterpaduan data Risiko lintas SKPK melalui penyelenggaraan secara elektronik; dan",
    "meningkatkan tingkat kematangan penyelenggaraan SPIP pada Pemerintah Kabupaten.",
]):
    A(huruf(h, t))
A(pasal(4))
A(ayat(1, "Ruang lingkup Peraturan Bupati ini meliputi:"))
for h, t in zip("abcdefg", [
    "prinsip dan kebijakan pengelolaan Risiko;",
    "struktur pengelolaan Risiko;",
    "proses Manajemen Risiko;",
    "evaluasi lingkungan pengendalian;",
    "penyelenggaraan Manajemen Risiko berbasis elektronik;",
    "pelaporan; dan",
    "pembinaan, pengawasan, dan pendanaan.",
]):
    A(huruf(h, t))
A(ayat(2, "Manajemen Risiko sebagaimana dimaksud pada ayat (1) diterapkan pada tingkat Pemerintah "
          "Kabupaten, tingkat strategis SKPK, dan tingkat operasional SKPK."))


# ══════════════════ BAB III ══════════════════
A(bab("III", "PRINSIP DAN KEBIJAKAN PENGELOLAAN RISIKO"))
A(bagian("Kesatu", "Prinsip dan Kebijakan"))
A(pasal(5))
A(par("Penyelenggaraan Manajemen Risiko dilaksanakan berdasarkan prinsip:", after=100))
for h, t in zip("abcdefghi", [
    "terpadu, yaitu menjadi bagian tidak terpisahkan dari seluruh proses penyelenggaraan "
    "pemerintahan daerah;",
    "terstruktur dan menyeluruh, yaitu dilakukan secara sistematis atas seluruh tujuan dan sasaran;",
    "sesuai kebutuhan, yaitu disesuaikan dengan karakteristik, tugas, dan fungsi masing-masing SKPK;",
    "inklusif, yaitu melibatkan pemangku kepentingan yang relevan;",
    "kolaboratif, yaitu dilaksanakan melalui kerja sama antar-SKPK dan dengan pihak lain yang "
    "terkait, terutama atas Risiko yang penanganannya melampaui kewenangan satu SKPK;",
    "dinamis, yaitu ditinjau dan dimutakhirkan mengikuti perubahan keadaan;",
    "berdasarkan informasi terbaik yang tersedia;",
    "mempertimbangkan faktor manusia dan budaya organisasi; dan",
    "perbaikan berkelanjutan, yaitu hasil pemantauan dan evaluasi dipakai untuk menyempurnakan "
    "penyelenggaraan Manajemen Risiko pada periode berikutnya.",
]):
    A(huruf(h, t))
A(pasal(6))
A(ayat(1, "Kebijakan pengelolaan Risiko Pemerintah Kabupaten meliputi Penetapan Konteks pengelolaan "
          "Risiko, struktur pengelola Risiko, kategori Risiko, kriteria dampak dan kemungkinan, "
          "matriks analisis Risiko, serta peringkat Risiko."))
A(ayat(2, "Kebijakan sebagaimana dimaksud pada ayat (1) tercantum dalam Lampiran I sampai dengan "
          "Lampiran VII yang merupakan bagian tidak terpisahkan dari Peraturan Bupati ini."))
A(pasal(7))
A(ayat(1, "Bupati menetapkan Selera Risiko pada tingkat Pemerintah Kabupaten."))
A(ayat(2, "Kepala SKPK menetapkan Selera Risiko pada tingkat SKPK dengan berpedoman pada Selera "
          "Risiko sebagaimana dimaksud pada ayat (1)."))
A(ayat(3, "Risiko dengan Skala Risiko di atas Selera Risiko ditetapkan sebagai Risiko Prioritas dan "
          "wajib disusun RTP."))
A(ayat(4, "Bersamaan dengan penetapan Selera Risiko sebagaimana dimaksud pada ayat (1) dan ayat (2), "
          "ditetapkan pula Toleransi Risiko sebagai batas penyimpangan dari Selera Risiko yang masih "
          "dapat diterima."))
A(ayat(5, "Toleransi Risiko sebagaimana dimaksud pada ayat (4) menjadi dasar pengisian kolom "
          "toleransi pada kriteria kemungkinan terjadinya Risiko sebagaimana tercantum dalam "
          "Lampiran VI."))
A(ayat(6, "Selera Risiko dan Toleransi Risiko sebagaimana dimaksud pada ayat (1) sampai dengan "
          "ayat (4) direkam pada MR KABAR dan menjadi dasar penentuan Risiko Prioritas secara "
          "elektronik."))

A(bagian("Kedua", "Pengembangan Budaya Sadar Risiko"))
A(pasal(8))
A(ayat(1, "Pemerintah Kabupaten mengembangkan budaya sadar Risiko pada seluruh SKPK."))
A(ayat(2, "Pengembangan budaya sadar Risiko sebagaimana dimaksud pada ayat (1) dilaksanakan "
          "melalui:"))
for h, t in zip("abcd", [
    "sosialisasi pemahaman Risiko kepada pejabat dan pegawai;",
    "internalisasi pertimbangan Risiko dalam setiap pengambilan keputusan;",
    "perbaikan lingkungan pengendalian berdasarkan hasil CEE; dan",
    "keteladanan pimpinan dalam menerapkan Manajemen Risiko.",
]):
    A(huruf(h, t, kiri=1021))
A(ayat(3, "Pengembangan budaya sadar Risiko sebagaimana dimaksud pada ayat (2) dikoordinasikan oleh "
          "Koordinator Penyelenggaraan Pengelolaan Risiko dan difasilitasi Inspektorat."))
A(pasal(9))
A(ayat(1, "Bupati dapat memberikan penghargaan kepada SKPK yang menyelenggarakan Manajemen Risiko "
          "secara baik."))
A(ayat(2, "Penilaian untuk pemberian penghargaan sebagaimana dimaksud pada ayat (1) didasarkan pada "
          "ketaatan penyampaian laporan, kelengkapan perekaman pada MR KABAR, dan tindak lanjut atas "
          "RTP yang telah disusun."))
A(ayat(3, "Ketaatan sebagaimana dimaksud pada ayat (2) terbaca dari MR KABAR dan tidak memerlukan "
          "penilaian tersendiri."))


# ══════════════════ BAB IV ══════════════════
A(bab("IV", "STRUKTUR PENGELOLAAN RISIKO"))
A(bagian("Kesatu", "Umum"))
A(pasal(10))
A(ayat(1, "Struktur pengelolaan Risiko pada Pemerintah Kabupaten terdiri atas:"))
for h, t in zip("abcdef", [
    "Komite Pengelolaan Risiko tingkat Pemerintah Kabupaten;",
    "Koordinator Penyelenggaraan Pengelolaan Risiko;",
    "UPR;",
    "Pengelola Risiko;",
    "Unit Kepatuhan; dan",
    "Penanggung Jawab Pengawasan.",
]):
    A(huruf(h, t, kiri=1021))
A(ayat(2, "Struktur sebagaimana dimaksud pada ayat (1) diselenggarakan dengan 3 (tiga) lini "
          "pertahanan, yang terdiri atas:"))
for h, t in zip("abc", [
    "lini pertama, dilaksanakan oleh UPR dibantu Pengelola Risiko, yang memiliki dan mengelola Risiko "
    "secara langsung;",
    "lini kedua, dilaksanakan oleh Unit Kepatuhan, yang memantau dan menelaah penerapan Manajemen "
    "Risiko oleh lini pertama; dan",
    "lini ketiga, dilaksanakan oleh Penanggung Jawab Pengawasan, yang memberikan keyakinan memadai "
    "secara independen atas efektivitas pengelolaan Risiko.",
]):
    A(huruf(h, t, kiri=1021))
A(ayat(3, "Pelaksanaan tugas pada masing-masing lini sebagaimana dimaksud pada ayat (2) tidak "
          "menghapuskan tanggung jawab UPR sebagai pemilik Risiko."))

A(bagian("Kedua", "Komite Pengelolaan Risiko"))
A(pasal(11))
A(ayat(1, "Komite Pengelolaan Risiko tingkat Pemerintah Kabupaten dipimpin oleh Bupati."))
A(ayat(2, "Susunan Komite Pengelolaan Risiko tingkat Pemerintah Kabupaten terdiri atas:"))
for h, t in zip("abc", [
    "ketua, dijabat oleh Bupati;",
    "koordinator merangkap anggota, dijabat oleh Kepala SKPK yang menyelenggarakan urusan "
    "perencanaan pembangunan daerah; dan",
    "anggota, terdiri atas Kepala SKPK yang ditunjuk.",
]):
    A(huruf(h, t, kiri=1021))
A(ayat(3, "Komite sebagaimana dimaksud pada ayat (1) bertugas:"))
for h, t in zip("abcde", [
    "menetapkan arah kebijakan pengelolaan Risiko Pemerintah Kabupaten;",
    "menetapkan Selera Risiko tingkat Pemerintah Kabupaten;",
    "memutuskan penanganan Risiko yang bersifat lintas SKPK;",
    "memantau efektivitas penyelenggaraan Manajemen Risiko secara keseluruhan; dan",
    "melakukan pembinaan penyelenggaraan Manajemen Risiko kepada SKPK.",
]):
    A(huruf(h, t, kiri=1021))
A(ayat(4, "Dalam melaksanakan tugas sebagaimana dimaksud pada ayat (3), Komite dapat membentuk tim "
          "teknis."))
A(ayat(5, "Susunan keanggotaan Komite sebagaimana dimaksud pada ayat (2) ditetapkan dengan Keputusan "
          "Bupati."))

A(bagian("Ketiga", "Koordinator Penyelenggaraan Pengelolaan Risiko"))
A(pasal(12))
A(ayat(1, "Sekretaris Daerah bertindak sebagai Koordinator Penyelenggaraan Pengelolaan Risiko."))
A(ayat(2, "Koordinator sebagaimana dimaksud pada ayat (1) bertugas:"))
for h, t in zip("abcde", [
    "mengoordinasikan penyelenggaraan Manajemen Risiko pada seluruh SKPK;",
    "memastikan proses Manajemen Risiko dilaksanakan sesuai dengan Peraturan Bupati ini;",
    "menghimpun dan menelaah laporan penerapan Manajemen Risiko dari SKPK;",
    "menyampaikan laporan penyelenggaraan Manajemen Risiko kepada Bupati; dan",
    "mendorong penggunaan MR KABAR pada seluruh SKPK.",
]):
    A(huruf(h, t, kiri=1021))

A(bagian("Keempat", "Unit Pemilik Risiko"))
A(pasal(13))
A(ayat(1, "UPR terdiri atas:"))
for h, t in zip("abc", [
    "UPR tingkat Pemerintah Kabupaten;",
    "UPR tingkat strategis SKPK; dan",
    "UPR tingkat operasional SKPK.",
]):
    A(huruf(h, t, kiri=1021))
A(ayat(2, "UPR tingkat Pemerintah Kabupaten sebagaimana dimaksud pada ayat (1) huruf a dijabat oleh "
          "Kepala SKPK yang mengampu tujuan dan sasaran Rencana Pembangunan Jangka Menengah Daerah."))
A(ayat(3, "UPR tingkat strategis SKPK sebagaimana dimaksud pada ayat (1) huruf b dijabat oleh Kepala "
          "SKPK."))
A(ayat(4, "UPR tingkat operasional SKPK sebagaimana dimaksud pada ayat (1) huruf c dijabat oleh "
          "pejabat administrator atau pejabat pengawas pada SKPK sesuai dengan tugas dan fungsinya."))
A(ayat(5, "UPR pada setiap tingkatan sebagaimana dimaksud pada ayat (1) berbentuk tim dengan susunan "
          "terdiri atas ketua, koordinator merangkap anggota, dan anggota."))
A(ayat(6, "Koordinator sebagaimana dimaksud pada ayat (5) dijabat oleh pejabat yang menangani "
          "perencanaan pada tingkatan yang bersangkutan."))
A(ayat(7, "Susunan UPR pada setiap tingkatan sebagaimana dimaksud pada ayat (5) ditetapkan dengan "
          "Keputusan Bupati untuk jangka waktu 1 (satu) tahun dan direkam pada MR KABAR."))
A(pasal(14))
A(par("UPR bertugas:", after=100))
for h, t in zip("abcdef", [
    "menetapkan konteks Risiko pada tingkatannya;",
    "melaksanakan Identifikasi Risiko, Analisis Risiko, dan Evaluasi Risiko;",
    "menyusun dan melaksanakan RTP;",
    "memantau pelaksanaan RTP dan mencatat Kejadian Risiko;",
    "merekam seluruh proses sebagaimana dimaksud dalam huruf a sampai dengan huruf d ke dalam MR "
    "KABAR; dan",
    "menyampaikan laporan penerapan Manajemen Risiko.",
]):
    A(huruf(h, t))

A(bagian("Kelima", "Pengelola Risiko"))
A(pasal(15))
A(ayat(1, "Kepala SKPK menetapkan Pengelola Risiko pada SKPK yang dipimpinnya."))
A(ayat(2, "Pengelola Risiko bertugas membantu UPR dalam melaksanakan proses Manajemen Risiko dan "
          "melakukan perekaman data pada MR KABAR."))

A(bagian("Keenam", "Unit Kepatuhan"))
A(pasal(16))
A(ayat(1, "Asisten Sekretaris Daerah yang membidangi urusan pemerintahan dan keistimewaan bertindak "
          "sebagai Unit Kepatuhan."))
A(ayat(2, "Unit Kepatuhan sebagaimana dimaksud pada ayat (1) bertugas:"))
for h, t in zip("abcde", [
    "memantau kepatuhan UPR terhadap tahapan proses Manajemen Risiko sebagaimana diatur dalam "
    "Peraturan Bupati ini;",
    "menelaah kewajaran hasil Analisis Risiko dan kelayakan RTP yang disusun UPR;",
    "memantau realisasi RTP dan perkembangan Kejadian Risiko melalui MR KABAR;",
    "menyusun laporan pemantauan sebagaimana dimaksud dalam Pasal 55; dan",
    "menyampaikan saran perbaikan kepada Koordinator Penyelenggaraan Pengelolaan Risiko.",
]):
    A(huruf(h, t, kiri=1021))
A(ayat(3, "Dalam melaksanakan tugas sebagaimana dimaksud pada ayat (2), Unit Kepatuhan tidak "
          "melaksanakan sendiri proses Manajemen Risiko yang menjadi tanggung jawab UPR."))

A(bagian("Ketujuh", "Penanggung Jawab Pengawasan"))
A(pasal(17))
A(ayat(1, "Inspektorat bertindak sebagai Penanggung Jawab Pengawasan penyelenggaraan Manajemen "
          "Risiko."))
A(ayat(2, "Inspektorat sebagaimana dimaksud pada ayat (1) bertugas:"))
for h, t in zip("abcde", [
    "melakukan pembinaan dan bimbingan teknis penerapan Manajemen Risiko;",
    "melakukan reviu atas kualitas penerapan Manajemen Risiko pada SKPK;",
    "memberikan keyakinan memadai atas efektivitas pengendalian intern;",
    "memanfaatkan hasil penilaian Risiko sebagai dasar penyusunan program kerja pengawasan tahunan "
    "berbasis Risiko; dan",
    "melakukan pembinaan substansi atas penyelenggaraan MR KABAR.",
]):
    A(huruf(h, t, kiri=1021))
A(pasal(18))
A(par("Dalam melaksanakan tugas sebagaimana dimaksud dalam Pasal 17 ayat (2), Inspektorat tidak "
      "mengambil alih tanggung jawab UPR dalam mengelola Risiko."))


# ══════════════════ BAB V ══════════════════
A(bab("V", "PROSES MANAJEMEN RISIKO"))
A(bagian("Kesatu", "Umum"))
A(pasal(19))
A(ayat(1, "Proses Manajemen Risiko dilaksanakan secara berkelanjutan setiap tahun dan meliputi "
          "tahapan:"))
for h, t in zip("abcdefg", [
    "Penetapan Konteks;",
    "Identifikasi Risiko;",
    "Analisis Risiko;",
    "Evaluasi Risiko;",
    "penyusunan dan pelaksanaan RTP;",
    "pemantauan; dan",
    "informasi dan komunikasi.",
]):
    A(huruf(h, t, kiri=1021))
A(ayat(2, "Seluruh tahapan sebagaimana dimaksud pada ayat (1) dilaksanakan melalui MR KABAR."))
A(ayat(3, "Bentuk baku formulir untuk setiap tahapan sebagaimana dimaksud pada ayat (1) beserta "
          "uraian kolomnya tercantum dalam Lampiran XII yang merupakan bagian tidak terpisahkan "
          "dari Peraturan Bupati ini."))
A(ayat(4, "Contoh pengisian formulir sebagaimana dimaksud pada ayat (3) tercantum dalam Lampiran "
          "XIII, Lampiran XV, Lampiran XVII, dan Lampiran XVIII yang merupakan bagian tidak "
          "terpisahkan dari Peraturan Bupati ini."))

A(bagian("Kedua", "Jadwal Penyelenggaraan"))
A(pasal(20))
A(ayat(1, "Bupati menetapkan arahan dan kebijakan penilaian Risiko yang memuat jadwal "
          "penyelenggaraan setiap tahapan Manajemen Risiko."))
A(ayat(2, "Arahan dan kebijakan sebagaimana dimaksud pada ayat (1) terdiri atas:"))
for h, t in zip("ab", [
    "arahan 5 (lima) tahunan, mengikuti periode Rencana Pembangunan Jangka Menengah Daerah; dan",
    "arahan 1 (satu) tahunan, mengikuti siklus penyusunan dan pelaksanaan anggaran.",
]):
    A(huruf(h, t, kiri=1021))
A(ayat(3, "Arahan dan kebijakan sebagaimana dimaksud pada ayat (2) ditetapkan dengan Surat Edaran "
          "Bupati dan paling sedikit memuat tahapan, waktu mulai dan selesai, pelaksana, serta "
          "keluaran setiap tahapan."))
A(ayat(4, "Jadwal sebagaimana dimaksud pada ayat (3) disusun selaras dengan siklus penyusunan "
          "Rencana Pembangunan Jangka Menengah Daerah, Rencana Strategis, Rencana Kerja Pemerintah "
          "Daerah, Rencana Kerja, Kebijakan Umum Anggaran dan Prioritas Plafon Anggaran Sementara, "
          "Rencana Kerja dan Anggaran, serta Dokumen Pelaksanaan Anggaran."))
A(ayat(5, "Arahan dan kebijakan sebagaimana dimaksud pada ayat (1) direkam pada MR KABAR dan "
          "menjadi dasar penandaan tahapan yang telah melampaui tenggat."))
A(ayat(6, "Jadwal tidak dituangkan dalam Lampiran Peraturan Bupati ini karena disesuaikan setiap "
          "tahun mengikuti siklus perencanaan dan penganggaran."))

A(bagian("Ketiga", "Penetapan Konteks"))
A(pasal(21))
A(ayat(1, "Penetapan Konteks dilakukan atas tujuan dan sasaran Pemerintah Kabupaten serta tujuan dan "
          "sasaran SKPK."))
A(ayat(2, "Sumber Penetapan Konteks sebagaimana dimaksud pada ayat (1) meliputi:"))
for h, t in zip("abc", [
    "Rencana Pembangunan Jangka Menengah Daerah, untuk konteks Risiko tingkat Pemerintah Kabupaten;",
    "Rencana Strategis SKPK, untuk konteks Risiko tingkat strategis SKPK; dan",
    "Rencana Kerja SKPK, untuk konteks Risiko tingkat operasional SKPK.",
]):
    A(huruf(h, t, kiri=1021))
A(pasal(22))
A(par("Penetapan Konteks paling sedikit memuat tujuan dan sasaran, indikator kinerja, pemangku "
      "kepentingan, proses bisnis, kriteria dampak dan kemungkinan, serta Selera Risiko."))

A(bagian("Keempat", "Identifikasi Risiko"))
A(pasal(23))
A(ayat(1, "Identifikasi Risiko dilakukan dengan menguraikan peristiwa Risiko, penyebab Risiko, "
          "sumber Risiko, dan dampak Risiko atas setiap tujuan dan sasaran."))
A(ayat(2, "Penyebab Risiko sebagaimana dimaksud pada ayat (1) dikategorikan ke dalam:"))
for h, tx in zip("ab", [
    "kategori penyebab internal, yang berada dalam kendali atau pengaruh SKPK, memakai kerangka "
    "7M+1E; dan",
    "kategori penyebab eksternal, yang berada di luar kendali SKPK, memakai kerangka PESTLE.",
]):
    A(huruf(h, tx, kiri=1021))
A(ayat(3, "Satu peristiwa Risiko dapat memiliki lebih dari 1 (satu) kategori penyebab, termasuk "
          "gabungan kategori internal dan eksternal."))
A(ayat(4, "Rincian kategori penyebab Risiko sebagaimana dimaksud pada ayat (2) tercantum dalam "
          "Lampiran III yang merupakan bagian tidak terpisahkan dari Peraturan Bupati ini."))
A(ayat(5, "Sumber sebab Risiko terisi otomatis oleh MR KABAR sebagai internal atau eksternal "
          "berdasarkan kategori penyebab yang dipilih."))
A(ayat(6, "Setiap Risiko yang teridentifikasi diberi Kode Risiko."))
A(pasal(24))
A(ayat(1, "Kode Risiko sebagaimana dimaksud dalam Pasal 23 ayat (6) disusun dengan susunan "
          "[TINGKATAN].[TAHUN].[URUSAN].[ENTITAS].[NOMOR URUT]."))
A(ayat(2, "Tingkatan sebagaimana dimaksud pada ayat (1) terdiri atas:"))
for h, t in zip("abc", [
    "RSP, untuk Risiko strategis Pemerintah Kabupaten;",
    "RSO, untuk Risiko strategis SKPK; dan",
    "ROO, untuk Risiko operasional SKPK.",
]):
    A(huruf(h, t, kiri=1021))
A(ayat(3, "Susunan Kode Risiko sebagaimana dimaksud pada ayat (1) tercantum dalam Lampiran VIII, "
          "kode urusan tercantum dalam Lampiran II, dan kode entitas penilai tercantum dalam "
          "Lampiran XIV, yang seluruhnya merupakan bagian tidak terpisahkan dari Peraturan Bupati "
          "ini."))
A(ayat(4, "Kode Risiko dibentuk secara otomatis oleh MR KABAR."))

A(bagian("Kelima", "Analisis Risiko"))
A(pasal(25))
A(ayat(1, "Analisis Risiko dilakukan dengan menentukan tingkat dampak dan tingkat kemungkinan "
          "terjadinya Risiko."))
A(ayat(2, "Tingkat dampak sebagaimana dimaksud pada ayat (1) ditentukan berdasarkan kriteria dampak "
          "yang meliputi kerugian keuangan negara atau daerah, penurunan reputasi, penurunan "
          "kinerja, gangguan terhadap layanan, dan tuntutan hukum."))
A(ayat(3, "Kriteria dampak sebagaimana dimaksud pada ayat (2) tercantum dalam Lampiran IV yang "
          "merupakan bagian tidak terpisahkan dari Peraturan Bupati ini."))
A(ayat(4, "Tingkat kemungkinan sebagaimana dimaksud pada ayat (1) ditentukan berdasarkan kriteria "
          "kemungkinan yang meliputi probabilitas, frekuensi, dan toleransi, sebagaimana tercantum "
          "dalam Lampiran V yang merupakan bagian tidak terpisahkan dari Peraturan Bupati ini."))
A(pasal(26))
A(ayat(1, "Skala Risiko diperoleh dari pertemuan tingkat dampak dan tingkat kemungkinan pada matriks "
          "analisis Risiko dengan ukuran 5 (lima) kali 5 (lima)."))
A(ayat(2, "Skala Risiko sebagaimana dimaksud pada ayat (1) dibaca dari tabel peringkat 1 (satu) "
          "sampai dengan 25 (dua puluh lima) dan bukan merupakan hasil perkalian kedua sumbu."))
A(ayat(3, "Matriks analisis Risiko sebagaimana dimaksud pada ayat (1) tercantum dalam Lampiran VI "
          "yang merupakan bagian tidak terpisahkan dari Peraturan Bupati ini."))
A(pasal(27))
A(ayat(1, "Berdasarkan Skala Risiko sebagaimana dimaksud dalam Pasal 26, Risiko dikelompokkan ke "
          "dalam peringkat sangat rendah, rendah, sedang, tinggi, dan sangat tinggi."))
A(ayat(2, "Pengelompokan peringkat Risiko sebagaimana dimaksud pada ayat (1) tercantum dalam "
          "Lampiran VII yang merupakan bagian tidak terpisahkan dari Peraturan Bupati ini."))
A(ayat(3, "Hasil Analisis Risiko dituangkan dalam Peta Risiko."))

A(bagian("Keenam", "Evaluasi Risiko"))
A(pasal(28))
A(ayat(1, "Evaluasi Risiko dilakukan dengan membandingkan Skala Risiko terhadap Selera Risiko untuk "
          "menentukan Risiko Prioritas."))
A(ayat(2, "Risiko Prioritas sebagaimana dimaksud pada ayat (1) dituangkan dalam daftar Risiko "
          "Prioritas."))

A(bagian("Ketujuh", "Keterkaitan Risiko Prioritas dengan Program Pembangunan Bupati"))
A(pasal(29))
A(ayat(1, "Risiko Prioritas dikaitkan dengan Program Pembangunan Bupati yang pencapaiannya "
          "berpotensi terganggu oleh Risiko tersebut."))
A(ayat(2, "Keterkaitan sebagaimana dimaksud pada ayat (1) dilakukan melalui MR KABAR."))
A(ayat(3, "Keterkaitan sebagaimana dimaksud pada ayat (1) digunakan sebagai dasar:"))
for h, t in zip("abc", [
    "penetapan urutan penanganan Risiko yang mengancam Program Pembangunan Bupati;",
    "penyajian informasi Risiko atas Program Pembangunan Bupati bagi Bupati dan Sekretaris Daerah; "
    "dan",
    "penyusunan program kerja pengawasan tahunan berbasis Risiko oleh Inspektorat.",
]):
    A(huruf(h, t, kiri=1021))
A(ayat(4, "Satu Risiko Prioritas dapat dikaitkan dengan lebih dari 1 (satu) Program Pembangunan "
          "Bupati, dan satu Program Pembangunan Bupati dapat dikaitkan dengan lebih dari 1 (satu) "
          "Risiko Prioritas."))

A(pasal(30))
A(ayat(1, "UPR mengusulkan keterkaitan atau pelepasan keterkaitan sebagaimana dimaksud dalam "
          "Pasal 29 kepada Pengelola MR KABAR melalui MR KABAR."))
A(ayat(2, "Usulan sebagaimana dimaksud pada ayat (1) hanya dapat diajukan atas Risiko yang berada "
          "dalam register Risiko SKPK yang bersangkutan."))
A(ayat(3, "Pengelola MR KABAR menyetujui atau menolak usulan sebagaimana dimaksud pada ayat (1) dengan "
          "mempertimbangkan:"))
for h, t in zip("abc", [
    "kesesuaian uraian Risiko dengan keluaran Program Pembangunan Bupati yang diusulkan;",
    "peringkat Risiko hasil Evaluasi Risiko; dan",
    "kelengkapan dan kebenaran data Risiko yang direkam.",
]):
    A(huruf(h, t, kiri=1021))
A(ayat(4, "Keterkaitan berlaku sejak usulan disetujui Pengelola MR KABAR."))
A(ayat(5, "Penolakan usulan sebagaimana dimaksud pada ayat (3) disertai alasan dan disampaikan "
          "kepada UPR pengusul melalui MR KABAR."))
A(ayat(6, "Seluruh usulan, persetujuan, dan penolakan sebagaimana dimaksud pada ayat (1) sampai "
          "dengan ayat (5) terekam dalam MR KABAR sebagai jejak audit."))

A(bagian("Kedelapan", "Rencana Tindak Pengendalian"))
A(pasal(31))
A(ayat(1, "Setiap Risiko Prioritas wajib disusun RTP."))
A(ayat(2, "Penyusunan RTP didahului dengan analisis akar penyebab Risiko."))
A(ayat(3, "RTP paling sedikit memuat kegiatan pengendalian, penanggung jawab, target waktu "
          "penyelesaian, dan indikator keberhasilan."))
A(pasal(32))
A(par("Respons Risiko dalam RTP dapat berupa menghindari Risiko, mengurangi kemungkinan terjadinya "
      "Risiko, mengurangi dampak Risiko, membagi Risiko, atau menerima Risiko."))

A(pasal(33))
A(ayat(1, "Penyusunan RTP didahului penilaian efektivitas pengendalian yang telah ada."))
A(ayat(2, "Pengendalian yang telah ada dinilai tidak efektif atau kurang efektif apabila memenuhi "
          "paling sedikit 1 (satu) keadaan berikut:"))
for h, t in zip("abcde", [
    "prosedur pengendalian belum dilaksanakan;",
    "kebijakan belum diikuti prosedur baku yang jelas;",
    "kebijakan dan prosedur yang ada tidak sesuai dengan peraturan di atasnya;",
    "kebijakan dan prosedur pengendalian sudah dilakukan, namun belum mampu menangani Risiko yang "
    "teridentifikasi; dan/atau",
    "pengendalian sudah berjalan namun masih lemah, sehingga masih ada Risiko lain yang timbul.",
]):
    A(huruf(h, t, kiri=1021))
A(ayat(3, "Keadaan sebagaimana dimaksud pada ayat (2) dicantumkan pada kolom celah pengendalian dan "
          "menjadi dasar penyusunan RTP."))

A(pasal(34))
A(ayat(1, "Rancangan pengendalian yang disusun dalam RTP diuji coba sebelum ditetapkan berlaku."))
A(ayat(2, "Uji coba sebagaimana dimaksud pada ayat (1) dilaksanakan dalam lingkup terbatas untuk "
          "mengetahui apakah pengendalian dapat dijalankan dan menekan Risiko sebagaimana "
          "diharapkan."))
A(ayat(3, "Hasil uji coba sebagaimana dimaksud pada ayat (2) digunakan untuk menyempurnakan "
          "rancangan pengendalian."))
A(ayat(4, "Triwulan pelaksanaan, tahun pelaksanaan, dan hasil uji coba beserta dokumen pendukungnya "
          "direkam pada MR KABAR."))
A(ayat(5, "Dikecualikan dari kewajiban uji coba sebagaimana dimaksud pada ayat (1) adalah "
          "pengendalian yang berupa penetapan peraturan perundang-undangan."))

A(pasal(35))
A(ayat(1, "RTP atas kelemahan lingkungan pengendalian sebagaimana dimaksud dalam Pasal 40 "
          "diselaraskan dengan RTP atas Risiko Prioritas."))
A(ayat(2, "Keselarasan sebagaimana dimaksud pada ayat (1) dimaksudkan agar satu kegiatan "
          "pengendalian tidak disusun dan dipantau dua kali pada dokumen yang berbeda."))
A(ayat(3, "Dalam hal rumusan kegiatan pengendalian pada kedua RTP sebagaimana dimaksud pada ayat "
          "(1) sama atau serupa, kegiatan tersebut dinyatakan sebagai satu kegiatan pengendalian "
          "dengan satu penanggung jawab."))

A(bagian("Kesembilan", "Pemantauan"))
A(pasal(36))
A(ayat(1, "Pemantauan dilakukan atas realisasi kegiatan pengendalian, Kejadian Risiko, dan tingkat "
          "Risiko aktual."))
A(ayat(2, "Pemantauan sebagaimana dimaksud pada ayat (1) dilaksanakan paling sedikit setiap "
          "triwulan."))
A(pasal(37))
A(ayat(1, "Kejadian Risiko yang terjadi dicatat ke dalam MR KABAR paling lambat 14 (empat belas) "
          "hari kerja sejak diketahui."))
A(ayat(2, "Pegawai dan masyarakat dapat menyampaikan laporan Kejadian Risiko melalui kanal pelaporan "
          "yang disediakan pada MR KABAR."))
A(ayat(3, "Laporan sebagaimana dimaksud pada ayat (2) ditindaklanjuti oleh UPR yang bersangkutan."))

A(pasal(38))
A(ayat(1, "Selain pencatatan Kejadian Risiko oleh UPR sebagaimana dimaksud dalam Pasal 37, pegawai "
          "dan masyarakat dapat menyampaikan laporan Kejadian Risiko melalui MR KABAR."))
A(ayat(2, "Laporan sebagaimana dimaksud pada ayat (1) paling sedikit memuat:"))
for h, t in zip("abcde", [
    "identitas dan alamat kontak pelapor;",
    "SKPK yang terkait dengan kejadian;",
    "uraian kejadian;",
    "waktu dan tempat kejadian; dan",
    "dugaan pemicu kejadian.",
]):
    A(huruf(h, t, kiri=1021))
A(ayat(3, "Laporan sebagaimana dimaksud pada ayat (1) ditelaah oleh UPR pada SKPK yang terkait untuk "
          "menentukan keterkaitannya dengan Risiko yang telah teridentifikasi."))
A(ayat(4, "Hasil telaahan sebagaimana dimaksud pada ayat (3) ditindaklanjuti dengan:"))
for h, t in zip("abc", [
    "pencatatan sebagai Kejadian Risiko atas Risiko yang telah teridentifikasi;",
    "Identifikasi Risiko baru, dalam hal kejadian belum tercakup dalam register Risiko; atau",
    "penutupan laporan disertai alasan, dalam hal kejadian tidak merupakan Risiko.",
]):
    A(huruf(h, t, kiri=1021))
A(ayat(5, "Perkembangan tindak lanjut atas setiap laporan direkam dalam MR KABAR."))
A(ayat(6, "Identitas pelapor sebagaimana dimaksud pada ayat (2) huruf a dilindungi dan hanya dapat "
          "diakses oleh Pengguna yang berwenang menindaklanjuti laporan."))

A(bagian("Kesepuluh", "Informasi dan Komunikasi"))
A(pasal(39))
A(ayat(1, "Informasi dan komunikasi Risiko dilakukan melalui rapat berkala, dialog Risiko, "
          "pelaporan berkala, dan penyajian informasi pada MR KABAR."))
A(ayat(2, "Rencana informasi dan komunikasi beserta realisasinya direkam ke dalam MR KABAR."))


# ══════════════════ BAB VI ══════════════════
A(bab("VI", "EVALUASI LINGKUNGAN PENGENDALIAN"))
A(pasal(40))
A(ayat(1, "Simpulan CEE atas setiap unsur lingkungan pengendalian disusun dengan menyandingkan "
          "hasil reviu dokumen dan hasil survei persepsi pegawai."))
A(ayat(2, "Dalam hal kedua sumber sebagaimana dimaksud pada ayat (1) menghasilkan simpulan yang "
          "bertentangan, dilakukan pendalaman atau penggunaan pertimbangan profesional."))
A(ayat(3, "Alasan penetapan simpulan sebagaimana dimaksud pada ayat (2) wajib diuraikan dan direkam "
          "pada MR KABAR."))
A(ayat(4, "Setiap unsur yang disimpulkan kurang memadai disusun RTP atas kelemahan lingkungan "
          "pengendalian."))
A(pasal(41))
A(ayat(1, "Setiap SKPK melaksanakan CEE paling sedikit 1 (satu) kali dalam 1 (satu) tahun."))
A(ayat(2, "CEE dilaksanakan melalui pengisian kuesioner atas 8 (delapan) unsur lingkungan "
          "pengendalian."))
A(ayat(3, "Kuesioner sebagaimana dimaksud pada ayat (2) tercantum dalam Lampiran IX yang merupakan "
          "bagian tidak terpisahkan dari Peraturan Bupati ini."))
A(pasal(42))
A(ayat(1, "Responden CEE paling sedikit terdiri atas pejabat pimpinan tinggi pratama, pejabat "
          "administrator, pejabat pengawas, dan pelaksana pada SKPK yang bersangkutan."))
A(ayat(2, "Simpulan atas setiap butir kuesioner ditentukan berdasarkan modus jawaban responden."))
A(ayat(3, "Unsur lingkungan pengendalian dinyatakan memadai apabila seluruh butir kuesioner pada "
          "unsur tersebut memperoleh simpulan memadai."))
A(ayat(4, "Unsur yang dinyatakan kurang memadai ditindaklanjuti dengan rencana perbaikan lingkungan "
          "pengendalian yang menjadi bagian dari RTP."))


# ══════════════════ BAB VII ══════════════════
A(bab("VII", "PENYELENGGARAAN MANAJEMEN RISIKO BERBASIS ELEKTRONIK"))
A(bagian("Kesatu", "Umum"))
A(pasal(43))
A(ayat(1, "Penyelenggaraan Manajemen Risiko dilaksanakan secara elektronik melalui MR KABAR."))
A(ayat(2, "MR KABAR merupakan bagian dari penyelenggaraan SPBE di lingkungan Pemerintah Kabupaten."))
A(ayat(3, "Dokumen Elektronik Manajemen Risiko yang dihasilkan melalui MR KABAR merupakan dokumen "
          "resmi penyelenggaraan Manajemen Risiko dan mempunyai kekuatan hukum yang sama dengan "
          "dokumen tertulis sepanjang memenuhi ketentuan peraturan perundang-undangan di bidang "
          "informasi dan transaksi elektronik."))
A(ayat(4, "Nama, alamat, dan ruang lingkup modul MR KABAR tercantum dalam Lampiran XI yang merupakan "
          "bagian tidak terpisahkan dari Peraturan Bupati ini."))

A(bagian("Kedua", "Ruang Lingkup Modul"))
A(pasal(44))
A(par("MR KABAR paling sedikit memuat modul:", after=100))
for h, t in zip("abcdefghijklm", [
    "Penetapan Konteks Risiko;",
    "Identifikasi Risiko dan pembentukan Kode Risiko;",
    "Analisis Risiko dan Evaluasi Risiko, termasuk Peta Risiko dan daftar Risiko Prioritas;",
    "penyusunan dan pemutakhiran RTP;",
    "pemantauan dan pencatatan Kejadian Risiko;",
    "CEE;",
    "keterkaitan Risiko Prioritas dengan Program Pembangunan Bupati;",
    "pelaporan Kejadian Risiko oleh pegawai dan masyarakat;",
    "perekaman Data Umum;",
    "perekaman massal melalui lembar sebar beserta persetujuannya;",
    "pemulihan data yang dihapus dan jejak audit;",
    "pelaporan dan pencetakan dokumen Manajemen Risiko; dan",
    "penyajian informasi Risiko bagi pimpinan.",
]):
    A(huruf(h, t))

A(bagian("Ketiga", "Hak Akses"))
A(pasal(45))
A(ayat(1, "Kepala SKPK mengusulkan Pengguna pada SKPK yang dipimpinnya kepada Pengelola MR KABAR."))
A(ayat(2, "Hak Akses diberikan secara berjenjang sesuai dengan kewenangan Pengguna, yang terdiri "
          "atas:"))
for h, tx in zip("abcd", [
    "Pengelola MR KABAR, berwenang mengelola Hak Akses, data acuan, dan seluruh data Manajemen Risiko "
    "pada semua SKPK;",
    "Pengelola Risiko SKPK, berwenang merekam dan mengubah data Manajemen Risiko pada SKPK yang "
    "bersangkutan saja;",
    "Pembaca, berwenang membaca dan mencetak seluruh data Manajemen Risiko tanpa dapat mengubahnya, "
    "diberikan kepada pimpinan daerah dan pejabat yang ditetapkan Bupati; dan",
    "akun berkegunaan terbatas, berwenang membuka 1 (satu) formulir tertentu saja, yaitu kuesioner "
    "CEE atau pelaporan Kejadian Risiko sebagaimana dimaksud dalam Pasal 38.",
]):
    A(huruf(h, tx, kiri=1021))
A(ayat(3, "Pengguna bertanggung jawab atas kerahasiaan dan penggunaan Hak Akses yang diberikan "
          "kepadanya."))
A(ayat(4, "Segala perbuatan yang dilakukan dengan menggunakan Hak Akses sebagaimana dimaksud pada "
          "ayat (3) menjadi tanggung jawab Pengguna yang bersangkutan."))
A(ayat(5, "Kebenaran dan kelengkapan data yang direkam ke dalam MR KABAR menjadi tanggung jawab "
          "Pemilik Risiko pada masing-masing SKPK."))

A(bagian("Keempat", "Data Umum"))
A(pasal(46))
A(ayat(1, "Setiap SKPK merekam Data Umum pada MR KABAR sebelum merekam dokumen Manajemen Risiko."))
A(ayat(2, "Data Umum sebagaimana dimaksud pada ayat (1) digunakan sebagai sumber kepala dokumen dan "
          "blok tanda tangan pada seluruh dokumen Manajemen Risiko yang dicetak melalui MR KABAR."))
A(ayat(3, "Perubahan pejabat penanda tangan direkam dalam Data Umum paling lambat 14 (empat belas) "
          "hari kerja sejak pelantikan."))
A(ayat(4, "Kebenaran Data Umum menjadi tanggung jawab Kepala SKPK yang bersangkutan."))

A(bagian("Kelima", "Perekaman Massal dan Pemulihan Data"))
A(pasal(47))
A(ayat(1, "Perekaman data Manajemen Risiko dapat dilakukan sekaligus dalam jumlah banyak melalui "
          "unggahan berkas lembar sebar dengan bentuk baku yang disediakan MR KABAR."))
A(ayat(2, "Unggahan sebagaimana dimaksud pada ayat (1) oleh Pengelola Risiko SKPK berlaku setelah "
          "disetujui Pengelola MR KABAR."))
A(ayat(3, "Pengelola MR KABAR menolak unggahan sebagaimana dimaksud pada ayat (2) dalam hal:"))
for h, tx in zip("abc", [
    "bentuk berkas tidak sesuai dengan bentuk baku;",
    "data yang diunggah bukan data SKPK yang bersangkutan; atau",
    "data yang diunggah tidak lengkap atau tidak dapat ditelusuri sumbernya.",
]):
    A(huruf(h, tx, kiri=1021))
A(ayat(4, "Penolakan sebagaimana dimaksud pada ayat (3) disertai alasan dan disampaikan kepada "
          "pengunggah melalui MR KABAR."))
A(ayat(5, "Data Manajemen Risiko dapat diunduh dalam bentuk lembar sebar oleh Pengguna sesuai "
          "dengan kewenangannya."))

A(pasal(48))
A(ayat(1, "Penghapusan data Manajemen Risiko pada MR KABAR bersifat sementara."))
A(ayat(2, "Data yang dihapus sebagaimana dimaksud pada ayat (1) tidak ditampilkan pada formulir dan "
          "laporan, tetapi tetap tersimpan dan dapat dipulihkan oleh Pengelola MR KABAR."))
A(ayat(3, "Penghapusan secara tetap hanya dapat dilakukan Pengelola MR KABAR setelah memperoleh "
          "persetujuan tertulis Kepala SKPK pemilik data."))
A(ayat(4, "Setiap perekaman, perubahan, penghapusan, dan pemulihan data terekam sebagai jejak audit "
          "yang memuat identitas Pengguna, waktu, dan bentuk perubahannya."))
A(ayat(5, "Jejak audit sebagaimana dimaksud pada ayat (4) tidak dapat diubah atau dihapus, dan "
          "menjadi bahan pengawasan bagi Penanggung Jawab Pengawasan."))

A(bagian("Keenam", "Keamanan Informasi dan Pelindungan Data Pribadi"))
A(pasal(49))
A(ayat(1, "Penyelenggaraan MR KABAR dilaksanakan dengan memperhatikan keamanan informasi dan "
          "pelindungan data pribadi sesuai dengan ketentuan peraturan perundang-undangan."))
A(ayat(2, "Keamanan informasi sebagaimana dimaksud pada ayat (1) paling sedikit meliputi:"))
for h, t in zip("abcde", [
    "pengendalian Hak Akses;",
    "perekaman jejak audit atas setiap penambahan, perubahan, dan penghapusan data;",
    "pencadangan data secara berkala;",
    "penggunaan protokol pengamanan pada jalur komunikasi data; dan",
    "pembatasan masa aktif sesi Pengguna.",
]):
    A(huruf(h, t, kiri=1021))
A(ayat(3, "Data dan informasi yang bersifat rahasia sesuai dengan ketentuan peraturan "
          "perundang-undangan hanya dapat diakses oleh Pengguna yang berwenang."))

A(bagian("Ketujuh", "Keterpaduan"))
A(pasal(50))
A(ayat(1, "Penyelenggaraan MR KABAR dilaksanakan sesuai dengan arsitektur SPBE Pemerintah Kabupaten "
          "dan memenuhi prinsip interoperabilitas."))
A(ayat(2, "MR KABAR dapat diintegrasikan dengan sistem elektronik lain di lingkungan Pemerintah "
          "Kabupaten, terutama sistem perencanaan dan penganggaran daerah."))

A(bagian("Kedelapan", "Pengelola"))
A(pasal(51))
A(ayat(1, "Inspektorat bertindak sebagai wali data dan pembina substansi MR KABAR."))
A(ayat(2, "Perangkat Daerah yang membidangi urusan komunikasi dan informatika bertindak sebagai "
          "penyedia dan pengelola infrastruktur, nama domain, serta keamanan sistem MR KABAR."))
A(ayat(3, "Pengelola MR KABAR ditetapkan dengan Keputusan Bupati atas usul Inspektur."))


# ══════════════════ BAB VIII ══════════════════
A(bab("VIII", "PELAPORAN"))
A(bagian("Kesatu", "Umum"))
A(pasal(52))
A(ayat(1, "Laporan penerapan Manajemen Risiko terdiri atas:"))
for h, tx in zip("abc", [
    "laporan pelaksanaan penilaian Risiko;",
    "laporan berkala pengelolaan Risiko; dan",
    "laporan pemantauan Unit Kepatuhan.",
]):
    A(huruf(h, tx, kiri=1021))
A(ayat(2, "Laporan sebagaimana dimaksud pada ayat (1) disusun dan disampaikan melalui MR KABAR."))
A(ayat(3, "Sistematika laporan sebagaimana dimaksud pada ayat (1) tercantum dalam Lampiran X yang "
          "merupakan bagian tidak terpisahkan dari Peraturan Bupati ini."))
A(ayat(4, "Contoh laporan sebagaimana dimaksud pada ayat (1) tercantum dalam Lampiran XVI yang "
          "merupakan bagian tidak terpisahkan dari Peraturan Bupati ini."))

A(bagian("Kedua", "Laporan Pelaksanaan Penilaian Risiko"))
A(pasal(53))
A(ayat(1, "UPR menyusun laporan pelaksanaan penilaian Risiko sebagaimana dimaksud dalam Pasal 52 "
          "ayat (1) huruf a pada setiap akhir pelaksanaan penilaian Risiko."))
A(ayat(2, "Laporan sebagaimana dimaksud pada ayat (1) paling sedikit memuat:"))
for h, tx in zip("abcde", [
    "hasil CEE;",
    "hasil Penetapan Konteks;",
    "hasil Identifikasi Risiko, Analisis Risiko, dan Evaluasi Risiko;",
    "daftar Risiko Prioritas beserta keterkaitannya dengan Program Pembangunan Bupati; dan",
    "RTP yang disusun.",
]):
    A(huruf(h, tx, kiri=1021))
A(ayat(3, "Laporan sebagaimana dimaksud pada ayat (1) disampaikan kepada Bupati melalui Sekretaris "
          "Daerah dengan tembusan kepada Unit Kepatuhan dan Inspektorat, paling lambat 14 (empat "
          "belas) hari kerja sejak penilaian Risiko dinyatakan selesai."))

A(bagian("Ketiga", "Laporan Berkala Pengelolaan Risiko"))
A(pasal(54))
A(ayat(1, "UPR menyusun laporan berkala pengelolaan Risiko sebagaimana dimaksud dalam Pasal 52 "
          "ayat (1) huruf b secara triwulanan dan tahunan."))
A(ayat(2, "Laporan sebagaimana dimaksud pada ayat (1) paling sedikit memuat:"))
for h, tx in zip("abcde", [
    "realisasi pelaksanaan RTP;",
    "realisasi rancangan informasi dan komunikasi;",
    "Kejadian Risiko yang terjadi beserta penanganannya;",
    "perkembangan Skala Risiko dibandingkan dengan Skala Risiko target; dan",
    "hambatan pelaksanaan beserta upaya pemecahannya.",
]):
    A(huruf(h, tx, kiri=1021))
A(ayat(3, "Laporan triwulanan sebagaimana dimaksud pada ayat (1) disampaikan paling lambat 10 "
          "(sepuluh) hari kerja setelah triwulan berkenaan berakhir."))

A(bagian("Keempat", "Laporan Pemantauan Unit Kepatuhan"))
A(pasal(55))
A(ayat(1, "Unit Kepatuhan menyusun laporan pemantauan sebagaimana dimaksud dalam Pasal 52 ayat (1) "
          "huruf c secara triwulanan dan tahunan."))
A(ayat(2, "Laporan sebagaimana dimaksud pada ayat (1) paling sedikit memuat:"))
for h, tx in zip("abcd", [
    "tingkat kepatuhan setiap SKPK terhadap tahapan proses Manajemen Risiko;",
    "hasil telaahan atas kewajaran Analisis Risiko dan kelayakan RTP;",
    "SKPK yang belum menyelesaikan kewajibannya beserta alasannya; dan",
    "saran perbaikan penyelenggaraan Manajemen Risiko.",
]):
    A(huruf(h, tx, kiri=1021))
A(ayat(3, "Laporan sebagaimana dimaksud pada ayat (1) disampaikan kepada Bupati melalui Sekretaris "
          "Daerah dengan tembusan kepada Inspektorat."))

A(bagian("Kelima", "Laporan Pembinaan Komite Pengelolaan Risiko"))
A(pasal(56))
A(ayat(1, "Komite Pengelolaan Risiko menyusun laporan pembinaan penyelenggaraan Manajemen Risiko."))
A(ayat(2, "Laporan sebagaimana dimaksud pada ayat (1) disusun secara semesteran dan tahunan."))
A(ayat(3, "Laporan sebagaimana dimaksud pada ayat (1) paling sedikit memuat:"))
for h, t in zip("abcde", [
    "gambaran umum penyelenggaraan Manajemen Risiko pada periode pelaporan;",
    "pembinaan yang telah dilaksanakan kepada SKPK;",
    "hambatan yang dihadapi SKPK beserta penanganannya;",
    "hasil pemantauan efektivitas penyelenggaraan Manajemen Risiko; dan",
    "rekomendasi perbaikan untuk periode berikutnya.",
]):
    A(huruf(h, t, kiri=1021))
A(ayat(4, "Laporan sebagaimana dimaksud pada ayat (1) disampaikan kepada Bupati dengan tembusan "
          "Koordinator Penyelenggaraan Pengelolaan Risiko."))

A(bagian("Keenam", "Tata Cara Penyampaian"))
A(pasal(57))
A(ayat(1, "Laporan tahunan sebagaimana dimaksud dalam Pasal 54 dan Pasal 55 disampaikan paling "
          "lambat akhir bulan Januari tahun berikutnya."))
A(ayat(2, "Penyampaian seluruh laporan sebagaimana dimaksud dalam Pasal 52 ayat (1) dilakukan "
          "melalui MR KABAR."))
A(ayat(3, "Sekretaris Daerah menyampaikan rekapitulasi laporan penyelenggaraan Manajemen Risiko "
          "kepada Bupati paling lambat akhir bulan Februari tahun berikutnya."))


# ══════════════════ BAB IX ══════════════════
A(bab("IX", "PEMBINAAN, PENGAWASAN, DAN PENDANAAN"))
A(pasal(58))
A(ayat(1, "Pembinaan penerapan Manajemen Risiko dilaksanakan oleh Inspektorat."))
A(ayat(2, "Pembinaan sebagaimana dimaksud pada ayat (1) meliputi sosialisasi, bimbingan teknis, "
          "pendampingan, dan konsultasi, termasuk penggunaan MR KABAR."))
A(pasal(59))
A(par("Pengawasan atas penerapan Manajemen Risiko dilaksanakan oleh Inspektorat melalui reviu, "
      "evaluasi, dan pemantauan tindak lanjut."))
A(pasal(60))
A(par("Pendanaan penyelenggaraan Manajemen Risiko dan MR KABAR dibebankan pada Anggaran Pendapatan "
      "dan Belanja Kabupaten Aceh Barat serta sumber lain yang sah dan tidak mengikat sesuai dengan "
      "ketentuan peraturan perundang-undangan."))


# ══════════════════ BAB X ══════════════════
A(bab("X", "KETENTUAN PERALIHAN"))
A(pasal(61))
A(ayat(1, "Dokumen Manajemen Risiko yang telah disusun sebelum Peraturan Bupati ini mulai berlaku "
          "dinyatakan tetap sah dan berlaku."))
A(ayat(2, "Dokumen sebagaimana dimaksud pada ayat (1) direkam ke dalam MR KABAR paling lambat 1 "
          "(satu) tahun sejak Peraturan Bupati ini diundangkan."))
A(ayat(3, "Dalam hal MR KABAR mengalami gangguan teknis, penyelenggaraan Manajemen Risiko dapat "
          "dilakukan secara manual dan direkam ke dalam MR KABAR paling lambat 14 (empat belas) hari "
          "kerja sejak gangguan teknis dinyatakan berakhir."))


# ══════════════════ BAB XI ══════════════════
A(bab("XI", "KETENTUAN PENUTUP"))
A(pasal(62))
A(par("Pada saat Peraturan Bupati ini mulai berlaku, Peraturan Bupati Aceh Barat Nomor 16 Tahun 2022 "
      "tentang Pedoman Penerapan Manajemen Risiko di Lingkungan Pemerintah Kabupaten Aceh Barat "
      "(Berita Daerah Kabupaten Aceh Barat Tahun 2022 Nomor 16) dicabut dan dinyatakan tidak "
      "berlaku."))
A(pasal(63))
A(par("Peraturan Bupati ini mulai berlaku pada tanggal diundangkan."))
A(P("", after=120))
A(par("Agar setiap orang mengetahuinya, memerintahkan pengundangan Peraturan Bupati ini dengan "
      "penempatannya dalam Berita Daerah Kabupaten Aceh Barat.", after=320))

A(PM([("Ditetapkan di Meulaboh", False)], kiri=4990, after=0, rata="left"))
A(PM([(f"pada tanggal {TANGGAL} M", False)], kiri=4990, after=0, rata="left"))
A(PM([(f"{' ' * 20}{HIJRIAH} H", False)], kiri=4990, after=140, rata="left"))
A(ttd_kanan("BUPATI ACEH BARAT,", "TARMIZI"))
A(P("", after=320))
A(P("Diundangkan di Meulaboh", rata="left", after=0))
A(P(f"pada tanggal {TANGGAL} M", rata="left", after=0))
A(P(f"{' ' * 18}{HIJRIAH} H", rata="left", after=140))
A(P("SEKRETARIS DAERAH", rata="left", b=True, after=0))
A(P("KABUPATEN ACEH BARAT,", rata="left", b=True, after=900))
A(P("..........................................", rata="left", b=True, after=280))
A(P("BERITA DAERAH KABUPATEN ACEH BARAT TAHUN 2026 NOMOR : ........", rata="left", after=0))


# ══════════════════ LAMPIRAN ══════════════════
def ttd_lampiran():
    """Penutup setiap lampiran: tanda tangan pejabat yang menetapkan.

    Setiap lampiran berdiri sebagai satu kesatuan yang disahkan, sehingga
    masing-masing ditutup tanda tangan, bukan hanya lampiran terakhir.
    """
    return P("", after=280) + ttd_kanan("BUPATI ACEH BARAT,", "TARMIZI")


def kepala_lampiran(nomor, judul_lampiran, potong=True):
    out = [P("LAMPIRAN " + nomor, rata="left", after=0, potong=potong, p=22),
           P("PERATURAN BUPATI ACEH BARAT", rata="left", after=0, p=22),
           P("NOMOR          TAHUN 2026", rata="left", after=0, p=22),
           P("TENTANG", rata="left", after=0, p=22),
           P(JUDUL, rata="left", after=280, p=22),
           P(judul_lampiran, rata="center", b=True, after=240, gaya="Heading1")]
    return "".join(out)


# ── LAMPIRAN I: kebijakan & konteks ──
A(kepala_lampiran("I", "KEBIJAKAN PENGELOLAAN RISIKO DAN PENETAPAN KONTEKS"))
A(P("A.  Kebijakan Umum", rata="left", b=True, after=120))
A(par("Pemerintah Kabupaten menyelenggarakan pengelolaan Risiko dengan mempertimbangkan asas biaya "
      "dan manfaat, kejelasan kriteria dan metodologi penilaian Risiko, struktur pengelola Risiko, "
      "serta perkembangan teknologi informasi. Pengelolaan Risiko dilakukan secara menyeluruh atas "
      "tujuan strategis Pemerintah Kabupaten maupun kegiatan utama SKPK, dan seluruh tahapannya "
      "direkam pada MR KABAR sehingga menghasilkan basis data Risiko yang tunggal dan mutakhir."))
A(P("B.  Penetapan Konteks Pengelolaan Risiko", rata="left", b=True, after=120))
A(P("1.  Risiko Strategis Pemerintah Kabupaten", rata="left", b=True, after=80, kiri=340))
A(par("Pengelolaan Risiko strategis Pemerintah Kabupaten bertujuan mengendalikan Risiko prioritas "
      "atas tujuan dan sasaran strategis yang tertuang dalam Rencana Pembangunan Jangka Menengah "
      "Daerah. Pengelolaannya dilakukan oleh Bupati bersama Wakil Bupati, dibantu Kepala SKPK selaku "
      "UPR tingkat Pemerintah Kabupaten, di bawah koordinasi Sekretaris Daerah."))
A(P("2.  Risiko Strategis SKPK", rata="left", b=True, after=80, kiri=340))
A(par("Pengelolaan Risiko strategis SKPK bertujuan mengendalikan Risiko prioritas atas tujuan dan "
      "sasaran strategis SKPK yang tertuang dalam Rencana Strategis SKPK, dilakukan oleh Kepala SKPK "
      "bersama jajaran manajemennya."))
A(P("3.  Risiko Operasional SKPK", rata="left", b=True, after=80, kiri=340))
A(par("Pengelolaan Risiko operasional SKPK bertujuan mengendalikan Risiko prioritas atas sasaran "
      "kegiatan utama SKPK yang tertuang dalam Rencana Kerja SKPK, dilakukan oleh pejabat "
      "administrator dan pejabat pengawas sesuai dengan tugas dan fungsinya."))
A(gambar(RID["jenjang"], str(GBR / "jenjang.jpeg"),
         "Tingkatan Risiko dan sumber Penetapan Konteks"))
A(P("C.  Struktur Analisis Risiko", rata="left", b=True, before=200, after=120))
A(par("Struktur analisis Risiko meliputi sumber Risiko yang berasal dari faktor internal maupun "
      "eksternal, dampak Risiko, serta pihak yang terkena dampak. Kategori faktor internal disusun "
      "menurut kerangka 7M+1E dan kategori faktor eksternal disusun menurut kerangka PESTLE, dengan "
      "rincian sebagaimana tercantum dalam Lampiran III."))

A(P("D.  Struktur Pengelolaan Risiko", rata="left", b=True, before=200, after=120))
A(par("Pengelolaan Risiko pada Pemerintah Kabupaten dijalankan secara berjenjang. Bupati memimpin "
      "Komite Pengelolaan Risiko tingkat Pemerintah Kabupaten, Sekretaris Daerah bertindak sebagai "
      "Koordinator Penyelenggaraan, dan Inspektorat menjalankan fungsi pengawasan sekaligus wali "
      "data aplikasi. Pelaksana teknis pada setiap tingkatan adalah Unit Pemilik Risiko yang "
      "dibantu Pengelola Risiko."))
A(gambar(RID["struktur"], str(GBR / "struktur.jpeg"),
         "Struktur pengelolaan Risiko Pemerintah Kabupaten Aceh Barat"))

A(P("E.  Tahapan Proses Manajemen Risiko", rata="left", b=True, before=200, after=120))
A(par("Proses Manajemen Risiko berjalan sebagai satu rangkaian yang berulang setiap tahun. Keluaran "
      "satu tahapan menjadi masukan tahapan berikutnya, dan seluruhnya direkam pada MR KABAR "
      "sehingga tidak ada tahapan yang terputus dokumentasinya."))
A(gambar(RID["tahapan"], str(GBR / "tahapan.jpeg"),
         "Tahapan proses Manajemen Risiko"))

A(P("F.  Langkah Kerja Penilaian Risiko Urusan Wajib dan Urusan Pilihan",
    rata="left", b=True, before=200, after=120))
A(par("Penilaian Risiko atas urusan wajib pelayanan dasar, urusan wajib bukan pelayanan dasar, "
      "urusan pilihan, maupun unsur pendukung ditempuh melalui tujuh langkah berikut. Urutan ini "
      "berlaku sama untuk ketiga tingkatan Risiko, yang membedakan hanya sumber tujuan dan "
      "sasarannya."))
A(gambar(RID["penilaian"], str(GBR / "penilaian.jpeg"),
         "Langkah kerja penilaian Risiko urusan wajib dan urusan pilihan"))

A(P("G.  Langkah Kerja Penyusunan Rencana Tindak Pengendalian",
    rata="left", b=True, before=200, after=120))
A(par("Rencana Tindak Pengendalian disusun hanya atas Risiko Prioritas. Penyusunannya tidak berhenti "
      "pada mencatat kegiatan, melainkan menelusuri akar penyebab lebih dahulu, menilai pengendalian "
      "yang sudah berjalan, baru merancang pengendalian tambahan yang benar-benar menutup celah."))
A(gambar(RID["rtp"], str(GBR / "rtp.jpeg"),
         "Langkah kerja penyusunan Rencana Tindak Pengendalian"))
A(par("Pilihan respons Risiko yang tersedia dalam menyusun Rencana Tindak Pengendalian adalah "
      "sebagai berikut."))
A(gambar(RID["respons"], str(GBR / "respons.jpeg"), "Pilihan respons Risiko"))

A(P("H.  Kedudukan Aplikasi MR KABAR", rata="left", b=True, before=200, after=120))
A(par("Aplikasi MR KABAR berkedudukan sebagai basis data Risiko tunggal Pemerintah Kabupaten. "
      "Seluruh SKPK merekam prosesnya pada aplikasi yang sama, sehingga Inspektorat dan pimpinan "
      "membaca kondisi Risiko yang mutakhir tanpa perlu menghimpun berkas satu per satu."))
A(gambar(RID["spbe"], str(GBR / "spbe.jpeg"),
         "Kedudukan aplikasi MR KABAR dalam penyelenggaraan Manajemen Risiko"))
A(ttd_lampiran())

# ── LAMPIRAN II: jenis/kategori risiko ──
A(kepala_lampiran("II", "KATEGORI RISIKO BERDASARKAN URUSAN PEMERINTAHAN"))
A(par("Kategori Risiko digunakan untuk menjamin proses Identifikasi Risiko, Analisis Risiko, dan "
      "Evaluasi Risiko dilakukan secara menyeluruh, sekaligus menjadi komponen [URUSAN] pada "
      "Kode Risiko sebagaimana dimaksud dalam Pasal 24.", after=200))
baris = [["No.", "Kode", "Kategori Risiko/Urusan Pemerintahan"]]
for i, j in enumerate(REF["jenis"], 1):
    baris.append([str(i), j["kode"], j["nama"]])
A(keterangan_tabel("Kategori Risiko berdasarkan urusan pemerintahan"))
A(tabel([700, 900, 7400], baris, p=20, rata_sel=["center", "center", "left"]))
A(ttd_lampiran())

# ── LAMPIRAN III: kriteria dampak ──
# ── LAMPIRAN III: kategori penyebab Risiko (7M+1E dan PESTLE) ──
A(kepala_lampiran("III", "KATEGORI PENYEBAB RISIKO"))
A(par("Penyebab Risiko diuraikan menurut kategori berikut agar akar penyebabnya dapat ditelusuri "
      "secara terstruktur dan agar RTP yang disusun menyasar penyebab yang tepat. Satu peristiwa "
      "Risiko dapat memiliki lebih dari satu kategori penyebab, termasuk gabungan kategori internal "
      "dan eksternal.", after=160))
A(gambar(RID["sebab"], str(GBR / "sebab.jpeg"), "Kategori penyebab Risiko"))

A(P("A.  Kategori Penyebab Internal (7M+1E)", rata="left", b=True, before=200, after=140,
    jaga=True))
A(par("Kategori internal adalah penyebab yang berada dalam kendali atau pengaruh SKPK, sehingga "
      "pada umumnya bersifat dapat dikendalikan (C).", after=140))
_INTERNAL = [
    ("Men", "Manusia atau sumber daya manusia",
     "kompetensi, jumlah, atau perilaku pegawai",
     "jumlah petugas kurang; pegawai belum mengikuti pelatihan teknis"),
    ("Machine", "Mesin, peralatan, atau sistem",
     "sarana, prasarana, peralatan, dan sistem informasi",
     "peladen sering terganggu; aplikasi belum terpadu"),
    ("Method", "Metode, prosedur, atau kebijakan",
     "prosedur, standar operasional prosedur, atau kebijakan yang belum ada atau belum memadai",
     "belum ada standar operasional prosedur baku"),
    ("Material", "Bahan, data, atau dokumen",
     "ketersediaan dan mutu bahan, data, atau dokumen pendukung",
     "data tidak mutakhir; dokumen sumber tidak lengkap"),
    ("Money", "Anggaran atau pembiayaan",
     "ketersediaan dan kecukupan anggaran",
     "anggaran terbatas; pencairan anggaran terlambat"),
    ("Management", "Tata kelola atau pengawasan",
     "kelemahan pengawasan, koordinasi antarunit, atau kepemimpinan",
     "belum ada pemantauan berkala; pengawasan berjenjang lemah"),
    ("Measurement", "Pengukuran atau indikator",
     "ketiadaan atau kekeliruan indikator dan standar pengukuran kinerja",
     "indikator kinerja tidak terukur; tidak tersedia data dasar"),
    ("Environment", "Lingkungan kerja internal",
     "kondisi fisik kantor dan fasilitas kerja, bukan cuaca atau bencana alam",
     "ruang kerja tidak memadai; fasilitas penunjang rusak"),
]
A(keterangan_tabel("Kategori penyebab internal menurut kerangka 7M+1E"))
A(tabel([440, 1420, 2000, 2850, 3040],
        [["No.", "Kategori", "Sebutan", "Cakupan", "Contoh Uraian Penyebab"]]
        + [[str(i), k, s, c, e] for i, (k, s, c, e) in enumerate(_INTERNAL, 1)],
        p=16, rata_sel=["center", "left", "left", "left", "left"]))

A(P("B.  Kategori Penyebab Eksternal (PESTLE)", rata="left", b=True, before=240, after=140,
    jaga=True))
A(par("Kategori eksternal adalah penyebab yang berada di luar kendali SKPK, sehingga pada umumnya "
      "bersifat tidak dapat dikendalikan (UC). Penyebab eksternal tetap wajib diuraikan karena "
      "menentukan pilihan respons Risiko dan bentuk pengendalian yang masih dapat dilakukan.",
      after=140))
_EKSTERNAL = [
    ("Political", "Politik atau kebijakan",
     "perubahan kebijakan pemerintah pusat atau daerah lain dan dinamika politik",
     "perubahan ketentuan dari pemerintah pusat secara mendadak"),
    ("Economic", "Ekonomi",
     "kondisi ekonomi makro maupun ekonomi daerah",
     "inflasi; penurunan pendapatan asli daerah"),
    ("Social", "Sosial",
     "dinamika sosial masyarakat",
     "penolakan masyarakat; perubahan pola perilaku warga"),
    ("Technological", "Teknologi",
     "perkembangan atau gangguan teknologi yang berasal dari luar SKPK",
     "serangan siber dari pihak luar; gangguan sistem pihak ketiga"),
    ("Legal", "Hukum",
     "perubahan peraturan perundang-undangan atau putusan hukum di luar kendali SKPK",
     "putusan pengadilan; perubahan undang-undang"),
    ("Environmental", "Lingkungan alam eksternal",
     "kondisi alam, cuaca, keadaan geografis, atau bencana alam",
     "curah hujan ekstrem; bencana alam; wilayah sulit dijangkau"),
]
A(keterangan_tabel("Kategori penyebab eksternal menurut kerangka PESTLE"))
A(tabel([440, 1580, 2000, 2850, 2880],
        [["No.", "Kategori", "Sebutan", "Cakupan", "Contoh Uraian Penyebab"]]
        + [[str(i), k, s, c, e] for i, (k, s, c, e) in enumerate(_EKSTERNAL, 1)],
        p=16, rata_sel=["center", "left", "left", "left", "left"]))

A(P("Keterangan:", rata="left", b=True, before=180, after=80))
for _hrf, _ket in zip(HURUF_KOLOM, [
    "nomor urut",
    "nama kategori penyebab sebagaimana dipakai MR KABAR",
    "sebutan kategori dalam bahasa Indonesia",
    "cakupan faktor yang termasuk kategori tersebut",
    "contoh rumusan uraian penyebab pada kategori tersebut",
]):
    A(PM([(f"Kolom {_hrf}", False), ("\t", False), (f"diisi dengan {_ket}.", False)],
         kiri=1560, gantung=1560, tab=1560, after=40, rata="left"))
A(par("Kategori Environment pada kerangka 7M+1E dan kategori Environmental pada kerangka PESTLE "
      "merupakan 2 (dua) kategori yang berbeda. Environment menunjuk pada kondisi fisik tempat "
      "kerja yang masih dapat dibenahi SKPK, sedangkan Environmental menunjuk pada keadaan alam, "
      "cuaca, dan bencana yang berada di luar kendali SKPK.", after=200))
A(ttd_lampiran())

A(kepala_lampiran("IV", "KRITERIA DAMPAK RISIKO"))
A(par("Tingkat dampak ditentukan berdasarkan kriteria berikut. Apabila satu peristiwa Risiko "
      "memenuhi lebih dari satu kriteria, digunakan tingkat dampak yang paling tinggi.", after=200))
baris = [["Tingkat", "Kerugian Keuangan\nNegara/Daerah", "Penurunan Reputasi",
          "Penurunan Kinerja", "Gangguan terhadap\nLayanan", "Tuntutan Hukum"]]
for k in REF["dampak"]:
    baris.append([f"{k['level']}\n{k['label']}", k.get("kerugian_negara") or "-",
                  k.get("penurunan_reputasi") or "-", k.get("penurunan_kinerja") or "-",
                  k.get("gangguan_pelayanan") or "-", k.get("tuntutan_hukum") or "-"])
A(keterangan_tabel("Kriteria dampak Risiko"))
A(tabel([1150, 1500, 1500, 1550, 1500, 1300], baris, p=16))
A(ttd_lampiran())

# ── LAMPIRAN IV: kriteria kemungkinan ──
A(kepala_lampiran("V", "KRITERIA KEMUNGKINAN TERJADINYA RISIKO"))
baris = [["Tingkat", "Uraian", "Probabilitas", "Frekuensi", "Toleransi"]]
for k in REF["kemungkinan"]:
    baris.append([str(k["level"]), k.get("nama") or "-", k.get("probabilitas") or "-",
                  k.get("frekuensi") or "-", k.get("toleransi") or "-"])
A(keterangan_tabel("Kriteria kemungkinan terjadinya Risiko"))
A(tabel([800, 1700, 2200, 2100, 1700], baris, p=18))
A(ttd_lampiran())

# ── LAMPIRAN V: matriks 5x5 ──
A(kepala_lampiran("VI", "MATRIKS ANALISIS RISIKO"))
A(par("Skala Risiko dibaca dari pertemuan tingkat dampak pada sumbu mendatar dan tingkat kemungkinan "
      "pada sumbu tegak. Angka pada setiap sel merupakan peringkat Risiko 1 (satu) sampai dengan 25 "
      "(dua puluh lima), bukan hasil perkalian kedua sumbu.", after=200))
peta = {(m["dampak"], m["kemungkinan"]): m["skala_risiko"] for m in REF["matriks"]}
baris = [["Kemungkinan \\ Dampak", "1\nTidak\nSignifikan", "2\nMinor", "3\nModerat",
          "4\nSignifikan", "5\nSangat\nSignifikan"]]
nama_k = {k["level"]: k["nama"] for k in REF["kemungkinan"]}
for kem in range(5, 0, -1):
    baris.append([f"{kem}\n{nama_k.get(kem, '')}"] + [str(peta.get((dmp, kem), "-")) for dmp in range(1, 6)])
A(gambar(RID["matriks"], str(GBR / "matriks.jpeg"),
         "Matriks analisis Risiko 5 x 5 beserta peringkat Risiko"))
A(P("", after=160))
A(keterangan_tabel("Matriks analisis Risiko"))
A(tabel([2200, 1420, 1420, 1420, 1420, 1420], baris, p=18,
        rata_sel=["left", "center", "center", "center", "center", "center"]))
A(P("", after=200))
baris = [["Dampak", "Kemungkinan", "Skala Risiko"]]
for m in REF["matriks"]:
    baris.append([str(m["dampak"]), str(m["kemungkinan"]), str(m["skala_risiko"])])
A(keterangan_tabel("Peringkat skala Risiko"))
A(tabel([2500, 2500, 2500], baris, p=18, rata_sel=["center", "center", "center"]))
A(ttd_lampiran())

# ── LAMPIRAN VI: peringkat risiko ──
A(kepala_lampiran("VII", "PERINGKAT RISIKO"))
baris = [["No.", "Peringkat Risiko", "Rentang Skala Risiko"]]
for i, lv in enumerate(REF["level"], 1):
    baris.append([str(i), lv["label"], f"{lv['skala_min']} sampai dengan {lv['skala_max']}"])
A(keterangan_tabel("Peringkat Risiko dan perlakuan yang diperlukan"))
A(tabel([800, 3200, 4000], baris, p=20, rata_sel=["center", "left", "center"]))
A(P("", after=200))
A(par("Risiko dengan peringkat tinggi dan sangat tinggi wajib ditetapkan sebagai Risiko Prioritas "
      "dan disusun RTP-nya, kecuali ditentukan lain berdasarkan Selera Risiko yang telah "
      "ditetapkan.", after=160))
A(par("Seluruh Risiko yang telah dinilai disebar pada matriks sehingga terbentuk peta Risiko. "
      "Gambar berikut merupakan peta Risiko Pemerintah Kabupaten Aceh Barat tahun 2025 sebagai "
      "contoh pembacaan.", after=140))
A(gambar(RID["peta"], str(GBR / "peta.jpeg"),
         "Contoh peta Risiko - sebaran 258 Risiko teridentifikasi tahun 2025"))
A(ttd_lampiran())

# ── LAMPIRAN VII: kodefikasi ──
A(kepala_lampiran("VIII", "KODEFIKASI RISIKO"))
A(par("Kode Risiko disusun dengan susunan [TINGKATAN].[TAHUN].[URUSAN].[ENTITAS].[NOMOR URUT] dan "
      "dibentuk secara otomatis oleh MR KABAR.", after=200))
A(keterangan_tabel("Unsur pembentuk Kode Risiko"))
A(tabel([2200, 6800], [
    ["Komponen", "Penjelasan"],
    ["TINGKATAN", "RSP untuk Risiko strategis Pemerintah Kabupaten; RSO untuk Risiko strategis SKPK; "
                  "ROO untuk Risiko operasional SKPK"],
    ["TAHUN", "2 (dua) digit terakhir tahun penilaian Risiko, misalnya 26 untuk tahun 2026"],
    ["URUSAN", "2 (dua) digit kode urusan pemerintahan sebagaimana tercantum dalam Lampiran II"],
    ["ENTITAS", "2 (dua) digit kode SKPK selaku entitas penilai Risiko sebagaimana tercantum "
                "dalam Lampiran XIV"],
    ["NOMOR URUT", "2 (dua) digit nomor urut Risiko dalam kombinasi tingkatan, tahun, urusan, dan "
                   "entitas yang sama"],
], p=20))
A(P("", after=200))
A(gambar(RID["kode"], str(GBR / "kode.jpeg"), "Susunan Kode Risiko"))
A(par("Contoh: Kode Risiko RSP.26.30.30.03 dibaca sebagai Risiko strategis Pemerintah Kabupaten, "
      "tahun penilaian 2026, urusan dengan kode 30, entitas penilai dengan kode 30, dan merupakan "
      "Risiko urutan ketiga pada kombinasi tersebut."))
A(ttd_lampiran())

# ── LAMPIRAN VIII: kuesioner CEE ──
A(kepala_lampiran("IX", "KUESIONER EVALUASI LINGKUNGAN PENGENDALIAN"))
A(par("Kuesioner diisi oleh responden pada masing-masing SKPK dengan memilih 1 (satu) pilihan "
      "jawaban untuk setiap butir pertanyaan, dengan ketentuan: 1 sangat tidak setuju; 2 tidak "
      "setuju; 3 setuju; dan 4 sangat setuju. Simpulan setiap butir ditentukan berdasarkan modus "
      "jawaban, dengan simpulan memadai apabila modus bernilai 3 atau 4.", after=160))
A(gambar(RID["unsur"], str(GBR / "unsur.jpeg"),
         "Delapan unsur lingkungan pengendalian yang dievaluasi"))
unsur_nama = {u["id"]: (u["kode"], u["nama"]) for u in REF["cee_map"]}
soal_per_unsur = {}
for s in REF["cee_soal"]:
    soal_per_unsur.setdefault(s["cee_unsur_id"], []).append(s["pertanyaan"])
for uid in sorted(soal_per_unsur, key=lambda x: [u["id"] for u in REF["cee_map"]].index(x)):
    kode, nama = unsur_nama.get(uid, ("", ""))
    A(P(f"{kode}.  {nama}", rata="left", b=True, before=160, after=120, jaga=True))
    baris = [["No.", "Pertanyaan/Kuesioner", "1", "2", "3", "4"]]
    for i, q in enumerate(soal_per_unsur[uid], 1):
        baris.append([str(i), q, "", "", "", ""])
    A(keterangan_tabel(f"Kuesioner unsur {nama}"))
    A(tabel([650, 6350, 500, 500, 500, 500], baris, p=18,
            rata_sel=["center", "left", "center", "center", "center", "center"]))
A(ttd_lampiran())

# ── LAMPIRAN IX: format laporan ──
A(kepala_lampiran("X", "SISTEMATIKA LAPORAN PENERAPAN MANAJEMEN RISIKO"))
A(par("Pemantauan dilaksanakan setiap triwulan dan bermuara pada laporan tahunan.", after=140))
A(gambar(RID["siklus"], str(GBR / "siklus.jpeg"), "Siklus pemantauan dan pelaporan"))
A(gambar(RID["lapor"], str(GBR / "lapor.jpeg"),
         "Alur penyampaian laporan penerapan Manajemen Risiko"))
A(par("Laporan penerapan Manajemen Risiko sebagaimana dimaksud dalam Pasal 52 ayat (1) terdiri "
      "atas 3 (tiga) jenis laporan dengan sistematika sebagai berikut, dan seluruhnya dihasilkan "
      "melalui MR KABAR.", after=200))
LAPORAN = [
    ("A", "Laporan Pelaksanaan Penilaian Risiko", [
        ("BAB I", "PENDAHULUAN",
         ["Latar Belakang", "Dasar Hukum", "Maksud dan Tujuan", "Ruang Lingkup"]),
        ("BAB II", "KONDISI LINGKUNGAN PENGENDALIAN",
         ["Kondisi Lingkungan Pengendalian Saat Ini",
          "Rencana Perbaikan Lingkungan Pengendalian"]),
        ("BAB III", "PENILAIAN RISIKO DAN RENCANA TINDAK PENGENDALIAN",
         ["Penetapan Konteks", "Hasil Identifikasi Risiko", "Hasil Analisis Risiko",
          "Daftar Risiko Prioritas",
          "Keterkaitan Risiko Prioritas dengan Program Pembangunan Bupati",
          "Pengendalian yang Sudah Dilakukan", "Pengendalian yang Masih Dibutuhkan",
          "Rencana Tindak Pengendalian"]),
        ("BAB IV", "RANCANGAN INFORMASI, KOMUNIKASI, DAN PEMANTAUAN",
         ["Rancangan Informasi dan Komunikasi", "Rancangan Pemantauan"]),
        ("BAB V", "PENUTUP", ["Simpulan", "Rekomendasi"]),
    ]),
    ("B", "Laporan Berkala Pengelolaan Risiko", [
        ("BAB I", "PENDAHULUAN",
         ["Latar Belakang", "Dasar Hukum", "Maksud dan Tujuan", "Ruang Lingkup"]),
        ("BAB II", "REALISASI RENCANA TINDAK PENGENDALIAN",
         ["Rencana Kegiatan Pengendalian", "Realisasi Kegiatan Pengendalian",
          "Hambatan Pelaksanaan dan Upaya Pemecahannya"]),
        ("BAB III", "KEJADIAN RISIKO",
         ["Kejadian Risiko yang Terjadi", "Penanganan Kejadian Risiko",
          "Laporan Kejadian Risiko dari Pegawai dan Masyarakat"]),
        ("BAB IV", "PERKEMBANGAN SKALA RISIKO",
         ["Perbandingan Skala Risiko Aktual dengan Skala Risiko Target",
          "Risiko yang Perlu Dinilai Ulang"]),
        ("BAB V", "PENUTUP", ["Simpulan", "Rekomendasi"]),
    ]),
    ("C", "Laporan Pemantauan Unit Kepatuhan", [
        ("BAB I", "PENDAHULUAN",
         ["Latar Belakang", "Dasar Hukum", "Maksud dan Tujuan", "Ruang Lingkup"]),
        ("BAB II", "TINGKAT KEPATUHAN SATUAN KERJA PERANGKAT KABUPATEN",
         ["Kepatuhan atas Tahapan Proses Manajemen Risiko",
          "Kepatuhan atas Ketepatan Waktu Pelaporan",
          "Satuan Kerja Perangkat Kabupaten yang Belum Menyelesaikan Kewajiban"]),
        ("BAB III", "HASIL TELAAHAN",
         ["Kewajaran Hasil Analisis Risiko", "Kelayakan Rencana Tindak Pengendalian",
          "Kesesuaian Keterkaitan dengan Program Pembangunan Bupati"]),
        ("BAB IV", "PENUTUP", ["Simpulan", "Saran Perbaikan"]),
    ]),
]
for kode_l, nama_l, sist in LAPORAN:
    A(P(f"{kode_l}.  {nama_l}", rata="left", b=True, before=220, after=140, jaga=True))
    for bab_n, bab_j, sub in sist:
        A(PM([(bab_n, True), ("\t", False), (bab_j, True)], kiri=1560, gantung=1560,
             tab=1560, after=80, rata="left"))
        for i, s in enumerate(sub, 1):
            A(PM([(chr(64 + i) + ".", False), ("\t", False), (s, False)],
                 kiri=2100, gantung=540, tab=2100, after=60, rata="left"))
        A(P("", after=80))
A(ttd_lampiran())

# ── LAMPIRAN X: identitas sistem ──
A(kepala_lampiran("XI", "NAMA, ALAMAT, DAN RUANG LINGKUP MODUL\nSISTEM INFORMASI MANAJEMEN RISIKO"))
A(keterangan_tabel("Nama, alamat, dan ruang lingkup modul Sistem Informasi Manajemen Risiko"))
A(tabel([2600, 6400], [
    ["Uraian", "Keterangan"],
    ["Nama Sistem", "Sistem Informasi Manajemen Risiko Kabupaten Aceh Barat (MR KABAR)"],
    ["Alamat Sistem", "https://mrkabar.acehbaratkab.go.id"],
    ["Wali Data dan Pembina Substansi", "Inspektorat Kabupaten Aceh Barat"],
    ["Pengelola Infrastruktur", "Perangkat Daerah yang membidangi urusan komunikasi, informatika, "
                                "dan persandian"],
    ["Pengguna", "Seluruh SKPK di lingkungan Pemerintah Kabupaten Aceh Barat"],
    ["Ruang Lingkup Modul", "1. Penetapan Konteks Risiko\n"
                            "2. Identifikasi Risiko dan pembentukan Kode Risiko\n"
                            "3. Analisis Risiko dan Evaluasi Risiko\n"
                            "4. Rencana Tindak Pengendalian\n"
                            "5. Pemantauan dan Pencatatan Kejadian Risiko\n"
                            "6. Evaluasi Lingkungan Pengendalian\n"
                            "7. Keterkaitan Risiko Prioritas dengan Program Pembangunan Bupati\n"
                            "8. Pelaporan Kejadian Risiko oleh Pegawai dan Masyarakat\n"
                            "9. Perekaman Data Umum\n"
                            "10. Perekaman Massal melalui Lembar Sebar beserta Persetujuannya\n"
                            "11. Pemulihan Data yang Dihapus dan Jejak Audit\n"
                            "12. Pelaporan dan Pencetakan Dokumen\n"
                            "13. Penyajian Informasi Risiko bagi Pimpinan"],
], p=20))
A(ttd_lampiran())

# ── LAMPIRAN XI: format formulir (halaman LANSKAP) ──
# Bagian potret berakhir pada paragraf ini; Lampiran XII dan seterusnya
# dicetak lanskap karena formulirnya sampai 12 kolom.
A(paragraf_pemisah_bagian(sectpr(lanskap=False, halaman_pertama_beda=True)))
A(kepala_lampiran("XII", "FORMAT FORMULIR MANAJEMEN RISIKO", potong=False))
A(par("Format formulir berikut merupakan keluaran baku MR KABAR, masing-masing disertai 1 (satu) baris contoh pengisian. Seluruh contoh dirangkai sebagai satu perkara yang sama dari hulu ke hilir sehingga dapat ditelusuri menembus seluruh formulir. Kolom bertanda (o) diisi otomatis "
      "oleh aplikasi berdasarkan data yang telah direkam pada tahapan sebelumnya.", after=200))

# Baris contoh pengisian tiap formulir. Jumlah selnya wajib sama dengan
# jumlah kolom formulir yang bersangkutan; diperiksa saat naskah dibangun.
CONTOH_FORMULIR = {
    "Formulir 1": [[
        "1",
        "Misi 2: Meningkatkan kualitas sumber daya manusia yang sehat dan berdaya saing",
        "Meningkatnya kualitas kesehatan masyarakat",
        "Meningkatnya derajat kesehatan masyarakat",
        "Angka harapan hidup (tahun)",
        "69,15",
        "Dinas Kesehatan",
    ]],
    "Formulir 2": [[
        "1",
        "Meningkatnya derajat kesehatan masyarakat",
        "Keterbatasan Anggaran Kesehatan",
        "RSP.25.02.09.01",
        "2 - Kesehatan",
        "Kepala Dinas Kesehatan",
        "Money (pagu belanja kesehatan belum memenuhi kebutuhan pelayanan dasar); "
        "Economic (penurunan pendapatan asli daerah)",
        "Internal dan Eksternal",
        "C dan UC",
        "Cakupan pelayanan kesehatan dasar tidak tercapai",
        "Masyarakat penerima layanan kesehatan dasar",
    ]],
    "Formulir 3": [[
        "1",
        "Meningkatkan mutu pelayanan kesehatan masyarakat",
        "Meningkatnya derajat kesehatan masyarakat",
        "Persentase fasilitas kesehatan terakreditasi (persen)",
        "85",
        "Bidang Pelayanan dan Sumber Daya Kesehatan",
    ]],
    "Formulir 4": [[
        "1",
        "Meningkatnya derajat kesehatan masyarakat",
        "Keterbatasan Anggaran Kesehatan",
        "RSO.25.02.09.02",
        "2 - Kesehatan",
        "Kepala Bidang Pelayanan dan Sumber Daya Kesehatan",
        "Money (alokasi anggaran pemeliharaan alat kesehatan tidak mencukupi); "
        "Management (belum ada perencanaan kebutuhan alat kesehatan berjangka)",
        "Internal",
        "C",
        "Sebagian alat kesehatan tidak berfungsi sehingga rujukan meningkat",
        "Pasien fasilitas kesehatan tingkat pertama",
    ]],
    "Formulir 5": [[
        "1",
        "Program Pemenuhan Upaya Kesehatan Perorangan dan Upaya Kesehatan Masyarakat",
        "Pengadaan Alat Kesehatan pada Fasilitas Pelayanan Kesehatan",
        "Tersedianya alat kesehatan sesuai standar",
        "Jumlah unit alat kesehatan yang diadakan (unit)",
        "24",
        "Pejabat Pelaksana Teknis Kegiatan Bidang Pelayanan dan Sumber Daya Kesehatan",
    ]],
    "Formulir 6": [[
        "1",
        "Pengadaan Alat Kesehatan pada Fasilitas Pelayanan Kesehatan",
        "Pelaksanaan pengadaan tidak sesuai jadwal",
        "ROO.25.02.09.01",
        "2 - Kesehatan",
        "Pejabat Pelaksana Teknis Kegiatan",
        "Method (belum ada jadwal pengadaan yang mengikat); "
        "Men (jumlah pejabat pengadaan bersertifikat terbatas)",
        "Internal",
        "C",
        "Alat kesehatan diterima pada akhir tahun sehingga belum termanfaatkan",
        "Puskesmas penerima alat kesehatan",
    ]],
    "Formulir 7": [[
        "1",
        "RSO.25.02.09.02",
        "Keterbatasan Anggaran Kesehatan",
        "4", "4", "16",
        "Perencanaan kebutuhan alat kesehatan disusun tahunan dan diusulkan melalui rencana kerja "
        "anggaran",
        "Kurang Memadai",
        "4", "3", "12",
        "Tinggi",
    ]],
    "Formulir 8": [[
        "1",
        "RSO.25.02.09.02",
        "Keterbatasan Anggaran Kesehatan",
        "12",
        "Tinggi",
        "1",
        "Kepala Bidang Pelayanan dan Sumber Daya Kesehatan",
    ]],
    "Formulir 9": [[
        "1",
        "RSO.25.02.09.02",
        "Keterbatasan Anggaran Kesehatan",
        "Perencanaan kebutuhan alat kesehatan belum disusun berjangka menengah sehingga usulan "
        "anggaran tidak berurut menurut prioritas",
        "Mengurangi kemungkinan",
        "Menyusun rencana kebutuhan alat kesehatan 5 (lima) tahunan beserta urutan prioritasnya, "
        "ditetapkan dengan keputusan Kepala Dinas",
        "Kepala Bidang Pelayanan dan Sumber Daya Kesehatan",
        "II",
        "2026",
        "Keputusan Kepala Dinas tentang rencana kebutuhan alat kesehatan ditetapkan",
        "6",
    ]],
    "Formulir 10": [[
        "1",
        "RSO.25.02.09.02",
        "Menyusun rencana kebutuhan alat kesehatan 5 (lima) tahunan beserta urutan prioritasnya",
        "Rapat koordinasi bidang dan surat edaran Kepala Dinas",
        "Kepala Bidang Pelayanan dan Sumber Daya Kesehatan",
        "Kepala Puskesmas dan pejabat pengadaan",
        "II",
        "2026",
        "Triwulan II 2026",
        "Terlaksana sesuai rencana",
    ]],
    "Formulir 11": [[
        "1",
        "RSO.25.02.09.02",
        "Menyusun rencana kebutuhan alat kesehatan 5 (lima) tahunan beserta urutan prioritasnya",
        "Reviu dokumen perencanaan dan uji petik ketersediaan alat pada 5 (lima) puskesmas",
        "Sekretaris Dinas Kesehatan",
        "III",
        "2026",
        "Triwulan III 2026",
        "Terlaksana, rencana kebutuhan sudah ditetapkan dan dipakai sebagai dasar usulan anggaran",
    ]],
    "Formulir 12": [[
        "1",
        "ROO.25.02.09.01",
        "Pelaksanaan pengadaan tidak sesuai jadwal",
        "14 Oktober 2026",
        "Penetapan penyedia tertunda karena dokumen persyaratan tidak lengkap",
        "Alat kesehatan diterima pada 20 Desember 2026 dan belum dapat dioperasikan",
        "Kontrak ditandatangani pada akhir triwulan IV sehingga masa pemanfaatan pada tahun "
        "berkenaan sangat singkat",
        "IV",
        "2026",
        "Terlaksana sebagian",
        "Tidak menimbulkan kerugian keuangan daerah; jadwal pengadaan tahun berikutnya dimajukan "
        "ke triwulan I",
    ]],
    "Formulir 13": [[
        "1",
        "01. Penegakan Integritas dan Nilai Etika",
        "Pimpinan telah menyusun dan menyosialisasikan aturan perilaku kepada seluruh pegawai",
        "(nama responden 1)",
        "Sekretaris",
        "3",
        "3",
        "Memadai",
    ]],
    "Formulir 14": [[
        "1",
        "02. Komitmen terhadap Kompetensi",
        "Laporan Hasil Pemeriksaan Inspektorat tahun sebelumnya",
        "Analisis kebutuhan diklat belum disusun berdasarkan peta kompetensi jabatan sehingga "
        "penugasan pelatihan belum tepat sasaran",
        "(nama pengisi)",
        "Sekretaris",
    ]],
    "Formulir 15": [[
        "1",
        "02. Komitmen terhadap Kompetensi",
        "Kurang Memadai",
        "Analisis kebutuhan diklat belum berdasarkan peta kompetensi jabatan",
        "Memadai",
        "Modus jawaban responden pada seluruh butir kuesioner sub unsur ini berada pada nilai 3",
        "Kurang Memadai",
        "Kedua sumber bertentangan. Ditarik melalui pendalaman: dokumen pendukung yang disebut "
        "responden ternyata belum disusun, sehingga persepsi pegawai tidak terkonfirmasi bukti",
    ]],
    "Formulir 16": [[
        "1",
        "02. Komitmen terhadap Kompetensi",
        "Analisis kebutuhan diklat belum berdasarkan peta kompetensi jabatan",
        "Menyusun peta kompetensi jabatan dan analisis kebutuhan diklat sebagai dasar pengusulan "
        "pengembangan kompetensi pegawai",
        "Sekretaris",
        "II",
        "2026",
        "III",
        "2026",
    ]],
    "Formulir 17": [[
        "1",
        "3",
        "Menyediakan Ambulan Gratis bagi Masyarakat",
        "Dinas Kesehatan",
        "ROO.25.02.09.01",
        "Pelaksanaan pembangunan/penyediaan tidak sesuai jadwal",
        "Tinggi",
        "Dinas Kesehatan",
        "9 Februari 2026",
        "Disetujui",
        "12 Februari 2026",
        "-",
    ]],
    "Formulir 18": [[
        "1",
        "(nama pelapor)",
        "(surel pelapor)",
        "(nomor telepon pelapor)",
        "Dinas Kesehatan",
        "Pelayanan ambulan gratis tertunda karena kendaraan sedang dalam perbaikan dan tidak "
        "tersedia kendaraan pengganti",
        "14 April 2026, pukul 21.30 WIB",
        "Puskesmas Johan Pahlawan",
        "Ketiadaan kendaraan cadangan dan belum adanya jadwal pemeliharaan berkala",
        "ROO.25.02.09.01",
        "Ditindaklanjuti",
        "Telah disusun jadwal pemeliharaan berkala dan disiapkan 1 (satu) kendaraan cadangan",
        "(nama penindak lanjut)",
        "16 April 2026",
    ]],
    "Formulir 19": [[
        "1",
        "Dinas Kesehatan Kabupaten Aceh Barat",
        "2026",
        "(nama penanda tangan)",
        "Kepala Dinas",
        "(nomor induk pegawai)",
        "Meulaboh",
        "30 Januari 2027",
    ]],
}

FORMULIR = [
    ("Formulir 1", "Penetapan Konteks Risiko Strategis Pemerintah Kabupaten", [
        ("No.", "nomor urut"),
        ("Visi/Misi", "rumusan visi dan misi sebagaimana tercantum dalam Rencana Pembangunan Jangka Menengah Daerah"),
        ("Tujuan RPJMD", "tujuan pembangunan daerah yang hendak dicapai"),
        ("Sasaran RPJMD", "sasaran pembangunan daerah yang menjadi penjabaran tujuan"),
        ("Indikator Kinerja", "indikator kinerja beserta satuannya yang mengukur ketercapaian sasaran"),
        ("Target", "target indikator kinerja pada tahun penilaian"),
        ("SKPK Penanggung Jawab", "Satuan Kerja Perangkat Kabupaten yang mengampu sasaran tersebut"),
    ]),
    ("Formulir 2", "Identifikasi Risiko Strategis Pemerintah Kabupaten", [
        ("No.", "nomor urut"),
        ("Sasaran RPJMD", "sasaran yang berpotensi terganggu pencapaiannya"),
        ("Uraian Risiko", "uraian peristiwa yang merupakan Risiko, dinyatakan sebagai peristiwa yang mungkin terjadi, bukan sebagai penyebab maupun dampak"),
        ("Kode Risiko", "kode yang dibentuk otomatis oleh aplikasi dengan susunan sebagaimana Lampiran VIII"),
        ("Jenis Risiko", "kategori Risiko berdasarkan urusan pemerintahan sebagaimana Lampiran II"),
        ("Pemilik Risiko", "pejabat yang memiliki kewenangan dan bertanggung jawab mengelola Risiko"),
        ("Uraian Sebab", "uraian penyebab timbulnya Risiko"),
        ("Sumber Sebab", "sumber penyebab, yaitu internal atau eksternal"),
        ("C/UC", "tanda C apabila penyebab dapat dikendalikan unit kerja, atau tanda UC apabila tidak dapat dikendalikan"),
        ("Uraian Dampak", "akibat yang timbul apabila Risiko benar-benar terjadi"),
        ("Pihak Terkena Dampak", "pihak atau unit yang menanggung akibat apabila Risiko terjadi"),
    ]),
    ("Formulir 3", "Penetapan Konteks Risiko Strategis SKPK", [
        ("No.", "nomor urut"),
        ("Tujuan Renstra", "tujuan sebagaimana tercantum dalam Rencana Strategis SKPK"),
        ("Sasaran Renstra", "sasaran strategis SKPK yang menjadi penjabaran tujuan"),
        ("Indikator Kinerja", "indikator kinerja beserta satuannya"),
        ("Target", "target indikator kinerja pada tahun penilaian"),
        ("Bidang/Unit Penanggung Jawab", "bidang atau unit kerja pada SKPK yang mengampu sasaran"),
    ]),
    ("Formulir 4", "Identifikasi Risiko Strategis SKPK", [
        ("No.", "nomor urut"),
        ("Sasaran Renstra", "sasaran strategis SKPK yang berpotensi terganggu pencapaiannya"),
        ("Uraian Risiko", "uraian peristiwa yang merupakan Risiko"),
        ("Kode Risiko", "kode yang dibentuk otomatis oleh aplikasi sebagaimana Lampiran VIII"),
        ("Jenis Risiko", "kategori Risiko berdasarkan urusan pemerintahan sebagaimana Lampiran II"),
        ("Pemilik Risiko", "pejabat yang bertanggung jawab mengelola Risiko"),
        ("Uraian Sebab", "uraian penyebab timbulnya Risiko"),
        ("Sumber Sebab", "sumber penyebab, yaitu internal atau eksternal"),
        ("C/UC", "tanda C apabila penyebab dapat dikendalikan, atau tanda UC apabila tidak"),
        ("Uraian Dampak", "akibat yang timbul apabila Risiko terjadi"),
        ("Pihak Terkena Dampak", "pihak atau unit yang menanggung akibatnya"),
    ]),
    ("Formulir 5", "Penetapan Konteks Risiko Operasional SKPK", [
        ("No.", "nomor urut"),
        ("Program", "program sebagaimana tercantum dalam Rencana Kerja SKPK"),
        ("Sub Kegiatan", "kegiatan dan sub kegiatan yang menjadi penjabaran program"),
        ("Keluaran", "keluaran yang dihasilkan sub kegiatan"),
        ("Indikator Keluaran", "indikator yang mengukur ketercapaian keluaran"),
        ("Target", "target indikator keluaran pada tahun penilaian"),
        ("Penanggung Jawab Kegiatan", "pejabat pelaksana teknis kegiatan yang bertanggung jawab"),
    ]),
    ("Formulir 6", "Identifikasi Risiko Operasional SKPK", [
        ("No.", "nomor urut"),
        ("Sub Kegiatan", "sub kegiatan yang berpotensi terganggu pencapaian keluarannya"),
        ("Uraian Risiko", "uraian peristiwa yang merupakan Risiko"),
        ("Kode Risiko", "kode yang dibentuk otomatis oleh aplikasi sebagaimana Lampiran VIII"),
        ("Jenis Risiko", "kategori Risiko berdasarkan urusan pemerintahan sebagaimana Lampiran II"),
        ("Pemilik Risiko", "pejabat yang bertanggung jawab mengelola Risiko"),
        ("Uraian Sebab", "uraian penyebab timbulnya Risiko"),
        ("Sumber Sebab", "sumber penyebab, yaitu internal atau eksternal"),
        ("C/UC", "tanda C apabila penyebab dapat dikendalikan, atau tanda UC apabila tidak"),
        ("Uraian Dampak", "akibat yang timbul apabila Risiko terjadi"),
        ("Pihak Terkena Dampak", "pihak atau unit yang menanggung akibatnya"),
    ]),
    ("Formulir 7", "Hasil Analisis Risiko", [
        ("No.", "nomor urut"),
        ("Kode Risiko", "kode Risiko yang dianalisis, terisi otomatis dari formulir identifikasi"),
        ("Uraian Risiko", "uraian Risiko, terisi otomatis dari formulir identifikasi"),
        ("Skala Dampak Inheren", "tingkat dampak sebelum memperhitungkan pengendalian yang ada, dinilai 1 sampai dengan 5 sesuai Lampiran IV"),
        ("Skala Kemungkinan Inheren", "tingkat kemungkinan sebelum memperhitungkan pengendalian yang ada, dinilai 1 sampai dengan 5 sesuai Lampiran V"),
        ("Skala Risiko Inheren", "Skala Risiko sebelum pengendalian, dibaca dari matriks pada Lampiran VI"),
        ("Pengendalian yang Ada", "pengendalian yang sudah berjalan atas Risiko tersebut"),
        ("Kategori Pengendalian", "penilaian kecukupan pengendalian, yaitu memadai, kurang memadai, atau tidak ada"),
        ("Skala Dampak Residual", "tingkat dampak setelah memperhitungkan pengendalian yang ada"),
        ("Skala Kemungkinan Residual", "tingkat kemungkinan setelah memperhitungkan pengendalian yang ada"),
        ("Skala Risiko Residual", "Skala Risiko setelah pengendalian, dibaca dari matriks pada Lampiran VI"),
        ("Peringkat Risiko", "peringkat sangat rendah sampai dengan sangat tinggi sesuai Lampiran VII"),
    ]),
    ("Formulir 8", "Daftar Risiko Prioritas", [
        ("No.", "nomor urut"),
        ("Kode Risiko", "kode Risiko yang ditetapkan sebagai Risiko Prioritas"),
        ("Uraian Risiko", "uraian Risiko, terisi otomatis"),
        ("Skala Risiko", "Skala Risiko residual hasil analisis"),
        ("Peringkat Risiko", "peringkat Risiko sesuai Lampiran VII"),
        ("Urutan Prioritas", "urutan penanganan, dimulai dari Skala Risiko tertinggi"),
        ("Pemilik Risiko", "pejabat yang bertanggung jawab menangani Risiko tersebut"),
    ]),
    ("Formulir 9", "Rencana Tindak Pengendalian", [
        ("No.", "nomor urut"),
        ("Kode Risiko", "kode Risiko Prioritas yang akan dikendalikan"),
        ("Uraian Risiko", "uraian Risiko, terisi otomatis"),
        ("Akar Penyebab", "penyebab paling mendasar hasil penelusuran akar masalah"),
        ("Respons Risiko", "pilihan respons: menghindari, mengurangi kemungkinan, mengurangi dampak, membagi, atau menerima Risiko"),
        ("Rencana Tindak Pengendalian", "kegiatan pengendalian yang akan dilaksanakan, dirumuskan secara konkret dan dapat diukur"),
        ("Penanggung Jawab", "pejabat atau unit kerja yang melaksanakan kegiatan pengendalian"),
        ("Triwulan Target", "triwulan target penyelesaian kegiatan pengendalian"),
        ("Tahun Target", "tahun target penyelesaian kegiatan pengendalian"),
        ("Indikator Keberhasilan", "ukuran yang menandakan kegiatan pengendalian berhasil dilaksanakan"),
        ("Skala Risiko Target", "taksiran Skala Risiko setelah kegiatan pengendalian dilaksanakan"),
    ]),
    ("Formulir 10", "Rancangan Informasi dan Komunikasi", [
        ("No.", "nomor urut"),
        ("Kode Risiko", "kode Risiko yang dikomunikasikan"),
        ("RTP", "Rencana Tindak Pengendalian yang dikomunikasikan, terisi otomatis"),
        ("Media Komunikasi", "sarana yang digunakan, misalnya rapat berkala, surat edaran, atau aplikasi"),
        ("Penyedia Informasi", "pihak yang menyampaikan informasi"),
        ("Penerima Informasi", "pihak yang menerima informasi"),
        ("Triwulan Rencana", "triwulan rencana pelaksanaan komunikasi"),
        ("Tahun Rencana", "tahun rencana pelaksanaan komunikasi"),
        ("Realisasi Waktu", "waktu pelaksanaan yang sebenarnya"),
        ("Keterangan", "penjelasan tambahan yang diperlukan"),
    ]),
    ("Formulir 11", "Rancangan dan Realisasi Pemantauan", [
        ("No.", "nomor urut"),
        ("Kode Risiko", "kode Risiko yang dipantau"),
        ("RTP", "Rencana Tindak Pengendalian yang dipantau, terisi otomatis"),
        ("Metode Pemantauan", "bentuk atau metode pemantauan yang diperlukan"),
        ("Penanggung Jawab", "pejabat atau unit kerja yang melaksanakan pemantauan"),
        ("Triwulan Rencana", "triwulan rencana pelaksanaan pemantauan"),
        ("Tahun Rencana", "tahun rencana pelaksanaan pemantauan"),
        ("Realisasi Waktu", "waktu pelaksanaan pemantauan yang sebenarnya"),
        ("Keterangan", "hasil pemantauan dan penjelasan tambahan"),
    ]),
    ("Formulir 12", "Pencatatan Kejadian Risiko dan Pelaksanaan Rencana Tindak Pengendalian", [
        ("No.", "nomor urut"),
        ("Kode Risiko", "kode Risiko yang benar-benar terjadi"),
        ("Uraian Risiko", "uraian Risiko, terisi otomatis"),
        ("Tanggal Kejadian", "tanggal peristiwa Risiko benar-benar terjadi"),
        ("Sebab Saat Kejadian", "penyebab yang teramati pada saat kejadian"),
        ("Dampak Saat Kejadian", "akibat yang benar-benar timbul"),
        ("Keterangan Kejadian", "uraian singkat kronologi kejadian"),
        ("Triwulan RTP", "triwulan rencana pelaksanaan Rencana Tindak Pengendalian"),
        ("Tahun RTP", "tahun rencana pelaksanaan Rencana Tindak Pengendalian"),
        ("Realisasi RTP", "tingkat realisasi pelaksanaan Rencana Tindak Pengendalian"),
        ("Keterangan", "penjelasan tambahan, termasuk tindak lanjut yang telah dilakukan"),
    ]),
    ("Formulir 13", "Kuesioner Evaluasi Lingkungan Pengendalian", [
        ("No.", "nomor urut"),
        ("Unsur", "unsur lingkungan pengendalian sebagaimana Lampiran IX"),
        ("Pertanyaan/Kuesioner", "butir pertanyaan sebagaimana Lampiran IX"),
        ("Nama Responden", "nama responden yang mengisi kuesioner"),
        ("Jabatan Responden", "jabatan responden pada SKPK yang bersangkutan"),
        ("Nilai", "pilihan jawaban responden, yaitu 1 untuk sangat tidak setuju, 2 untuk tidak setuju, 3 untuk setuju, atau 4 untuk sangat setuju"),
        ("Modus", "nilai yang paling sering muncul dari seluruh responden, terisi otomatis"),
        ("Simpulan", "simpulan memadai apabila modus bernilai 3 atau 4, dan kurang memadai apabila modus bernilai 1 atau 2, terisi otomatis"),
    ]),
    ("Formulir 14", "Kelemahan Lingkungan Pengendalian Berdasarkan Dokumen", [
        ("No.", "nomor urut"),
        ("Unsur", "unsur lingkungan pengendalian yang ditemukan kelemahannya"),
        ("Sumber Data", "dokumen yang menjadi dasar temuan, misalnya laporan hasil pemeriksaan atau laporan kinerja"),
        ("Uraian Kelemahan", "uraian kelemahan lingkungan pengendalian yang ditemukan"),
        ("Pengisi", "nama pejabat atau pegawai yang mengisi"),
        ("Jabatan Pengisi", "jabatan pengisi pada SKPK yang bersangkutan"),
    ]),
    ("Formulir 15", "Simpulan Evaluasi Lingkungan Pengendalian", [
        ("No.", "nomor urut"),
        ("Sub Unsur", "sub unsur pada lingkungan pengendalian"),
        ("Hasil Reviu Dokumen — Hasil",
         "simpulan penilaian awal CEE berdasarkan dokumen"),
        ("Hasil Reviu Dokumen — Uraian",
         "uraian simpulan penilaian awal CEE berdasarkan dokumen"),
        ("Hasil Survei Persepsi — Hasil", "simpulan hasil survei persepsi"),
        ("Hasil Survei Persepsi — Uraian", "uraian simpulan sesuai hasil survei persepsi"),
        ("Simpulan",
         "simpulan sesuai hasil penilaian awal dan survei persepsi; dalam hal hasil penilaian awal "
         "dan survei persepsi bertentangan, dilakukan pendalaman atau pertimbangan profesional untuk "
         "menyimpulkannya"),
        ("Penjelasan", "uraian kelemahan"),
    ]),
    ("Formulir 16", "Rencana Tindak Pengendalian atas Lingkungan Pengendalian", [
        ("No.", "nomor urut"),
        ("Unsur", "unsur lingkungan pengendalian yang disimpulkan kurang memadai"),
        ("Kondisi Kurang Memadai", "uraian kondisi yang menyebabkan unsur dinilai kurang memadai"),
        ("Rencana Tindak Pengendalian", "kegiatan perbaikan lingkungan pengendalian yang akan dilaksanakan"),
        ("Penanggung Jawab", "pejabat atau unit kerja yang melaksanakan perbaikan"),
        ("Triwulan Target", "triwulan target penyelesaian perbaikan"),
        ("Tahun Target", "tahun target penyelesaian perbaikan"),
        ("Triwulan Realisasi", "triwulan realisasi penyelesaian perbaikan"),
        ("Tahun Realisasi", "tahun realisasi penyelesaian perbaikan"),
    ]),
    ("Formulir 17", "Keterkaitan Risiko Prioritas dengan Program Pembangunan Bupati", [
        ("No.", "nomor urut"),
        ("Nomor Program", "nomor Program Pembangunan Bupati sesuai Rencana Pembangunan Jangka "
                          "Menengah Daerah"),
        ("Program Pembangunan Bupati", "rumusan Program Pembangunan Bupati"),
        ("SKPK Pengampu", "Satuan Kerja Perangkat Kabupaten yang mengampu program tersebut"),
        ("Kode Risiko", "kode Risiko Prioritas yang dikaitkan"),
        ("Uraian Risiko", "uraian Risiko Prioritas, terisi otomatis"),
        ("Peringkat Risiko", "peringkat Risiko hasil Evaluasi Risiko, terisi otomatis"),
        ("Pengusul", "UPR yang mengajukan usulan keterkaitan"),
        ("Tanggal Usulan", "tanggal usulan diajukan melalui MR KABAR"),
        ("Keputusan", "disetujui atau ditolak oleh Pengelola MR KABAR"),
        ("Tanggal Keputusan", "tanggal keputusan diambil"),
        ("Alasan", "alasan penolakan, diisi dalam hal usulan ditolak"),
    ]),
    ("Formulir 18", "Pelaporan Kejadian Risiko oleh Pegawai dan Masyarakat", [
        ("No.", "nomor urut"),
        ("Nama Pelapor", "nama lengkap pelapor"),
        ("Alamat Surat Elektronik", "alamat surat elektronik pelapor"),
        ("Nomor Telepon", "nomor telepon yang dapat dihubungi"),
        ("SKPK Terkait", "Satuan Kerja Perangkat Kabupaten yang terkait dengan kejadian"),
        ("Uraian Kejadian", "uraian peristiwa yang dilaporkan"),
        ("Waktu Kejadian", "tanggal dan waktu peristiwa terjadi"),
        ("Tempat Kejadian", "tempat peristiwa terjadi"),
        ("Dugaan Pemicu", "dugaan penyebab timbulnya peristiwa menurut pelapor"),
        ("Kaitan Risiko Terdaftar", "Kode Risiko yang terkait, diisi berdasarkan hasil telaahan UPR"),
        ("Status", "status penanganan laporan, yaitu baru, dalam telaahan, ditindaklanjuti, atau "
                   "ditutup"),
        ("Catatan Tindak Lanjut", "uraian tindak lanjut yang telah dilakukan"),
        ("Penindak Lanjut", "nama pejabat atau pegawai yang menindaklanjuti"),
        ("Tanggal Tindak Lanjut", "tanggal tindak lanjut dilakukan"),
    ]),
    ("Formulir 19", "Data Umum", [
        ("No.", "nomor urut"),
        ("Nama SKPK", "nama Satuan Kerja Perangkat Kabupaten"),
        ("Tahun Penilaian", "tahun penilaian Risiko"),
        ("Nama Penanda Tangan", "nama pejabat yang menandatangani dokumen Manajemen Risiko"),
        ("Jabatan Penanda Tangan", "jabatan pejabat sebagaimana dimaksud pada kolom sebelumnya"),
        ("Nomor Induk Pegawai", "nomor induk pegawai pejabat penanda tangan"),
        ("Tempat Penandatanganan", "tempat dokumen ditandatangani"),
        ("Tanggal Penandatanganan", "tanggal dokumen ditandatangani"),
    ]),
]

LEBAR_TOTAL = 16100
for kode_f, nama_f, kolom in FORMULIR:
    A(P(f"{kode_f}.  {nama_f}", rata="left", b=True, before=240, after=140, jaga=True))
    judul = [k for k, _ in kolom]
    n = len(judul)
    lebar = [LEBAR_TOTAL // n] * n
    lebar[0] = max(520, lebar[0] // 2)
    lebar[1] += LEBAR_TOTAL - sum(lebar)
    huruf_baris = [HURUF_KOLOM[i] for i in range(n)]
    contoh = CONTOH_FORMULIR.get(kode_f, [])
    for _baris_contoh in contoh:
        assert len(_baris_contoh) == n, (
            f"{kode_f}: baris contoh {len(_baris_contoh)} sel, kolom {n}")
    A(keterangan_tabel(f"Uraian kolom Formulir {nama_f}"))
    A(tabel(lebar, [judul, huruf_baris] + contoh,
            p=14 if n > 8 else 16, rata_sel=["center"] * n))
    A(P("Keterangan:", rata="left", b=True, before=140, after=80))
    for i, (_, ket) in enumerate(kolom):
        A(PM([(f"Kolom {HURUF_KOLOM[i]}", False), ("\t", False),
              (f"diisi dengan {ket}", False)],
             rata="left", kiri=1800, gantung=1300, tab=[1800], after=50, line=252, p=20))
A(ttd_lampiran())


# ── LAMPIRAN XII: contoh pengisian (lanskap) ──
A(kepala_lampiran("XIII", "CONTOH PENGISIAN FORMULIR MANAJEMEN RISIKO", potong=True))
A(par("Contoh berikut diambil dari Risiko yang benar-benar teridentifikasi pada tahun 2025 dan "
      "tersimpan pada aplikasi MR KABAR. Contoh ini dimaksudkan sebagai acuan cara mengisi, bukan "
      "sebagai penetapan Risiko yang mengikat.", after=200))


def _a(r, k):
    """Ambil nilai kolom apa adanya; kolom kosong ditampilkan sebagai tanda hubung."""
    v = r.get(k)
    v = "" if v is None else str(v).strip()
    return v if v else "-"


PREFIKS = {"Risiko Strategis Pemda": "RSP", "Risiko Strategis PD": "RSO",
           "Risiko Operasional PD": "ROO"}


def _kode(r):
    tk = _a(r, "TINGKAT RISIKO")
    pre = PREFIKS.get(tk, tk)
    th = _a(r, "TAHUN DINILAI RISIKO")[-2:]
    jn = str(_a(r, "JENIS RISIKO")).split(" ")[0]
    return f"{pre}.{th}.{jn}. ..."


SUMBER = [
    ("A", "Risiko Strategis Pemerintah Kabupaten", CONTOH["irs_pemda"], "SASARAN RPJMD"),
    ("B", "Risiko Strategis SKPK", CONTOH["irs_pd"], "SASARAN RENSTRA"),
    ("C", "Risiko Operasional SKPK", CONTOH["iro_pd"], "SASARAN KEGIATAN"),
]

for tanda, judul_sumber, baris_data, kolom_sasaran in SUMBER:
    if not baris_data:
        continue
    A(P(f"{tanda}.  {judul_sumber}", rata="left", b=True, before=240, after=160, jaga=True))

    # Contoh 1 - Identifikasi Risiko
    A(P("Contoh Pengisian Formulir Identifikasi Risiko", rata="left", b=True, after=120, jaga=True))
    kep = ["No.", "Sasaran", "Uraian Risiko", "Kode Risiko", "Pemilik Risiko",
           "Uraian Penyebab", "Sumber Sebab", "C/UC", "Uraian Dampak", "Pihak Terkena Dampak"]
    isi = [kep]
    for i, r in enumerate(baris_data, 1):
        sasaran = _a(r, kolom_sasaran)
        if sasaran == "-":
            for alt in ("SASARAN RPJMD", "SASARAN RENSTRA", "SASARAN KEGIATAN", "SASARAN"):
                if _a(r, alt) != "-":
                    sasaran = _a(r, alt)
                    break
        isi.append([str(i), sasaran, _a(r, "URAIAN RISIKO"), _kode(r), _a(r, "PEMILIK RISIKO"),
                    _a(r, "URAIAN PENYEBAB RISIKO"), _a(r, "SUMBER SEBAB RISIKO"), _a(r, "C / UC"),
                    _a(r, "URAIAN DAMPAK RISIKO"), _a(r, "PIHAK YANG TERKENA DAMPAK RISIKO")])
    A(keterangan_tabel("Contoh pengisian Formulir Identifikasi Risiko"))
    A(tabel([500, 1700, 2200, 1250, 1300, 2000, 1000, 550, 2000, 1300], isi, p=13,
            rata_sel=["center", "left", "left", "center", "left", "left", "left", "center",
                      "left", "left"]))

    # Contoh 2 - Analisis Risiko
    A(P("Contoh Pengisian Formulir Hasil Analisis Risiko", rata="left", b=True,
        before=200, after=120, jaga=True))
    kep = ["No.", "Kode Risiko", "Uraian Risiko", "Dampak\nInheren", "Kemungkinan\nInheren",
           "Skala\nInheren", "Pengendalian yang Sudah Ada", "Dampak", "Kemungkinan",
           "Skala\nRisiko", "Prioritas"]
    isi = [kep]
    for i, r in enumerate(baris_data, 1):
        isi.append([str(i), _kode(r), _a(r, "URAIAN RISIKO"),
                    _a(r, "SKALA DAMPAK INHEREN"), _a(r, "SKALA KEMUNGKINAN INHEREN"),
                    _a(r, "SKALA RISIKO INHEREN"), _a(r, "URAIAN PENGENDALIAN YANG SUDAH ADA"),
                    _a(r, "SKALA DAMPAK"), _a(r, "SKALA KEMUNGKINAN"), _a(r, "SKALA RISIKO"),
                    _a(r, "SKALA PRIORITAS")])
    A(keterangan_tabel("Contoh pengisian Formulir Hasil Analisis Risiko"))
    A(tabel([500, 1250, 2600, 800, 950, 800, 2800, 700, 900, 750, 750], isi, p=13,
            rata_sel=["center", "center", "left", "center", "center", "center", "left",
                      "center", "center", "center", "center"]))

    # Contoh 3 - Rencana Tindak Pengendalian
    A(P("Contoh Pengisian Formulir Rencana Tindak Pengendalian", rata="left", b=True,
        before=200, after=120, jaga=True))
    kep = ["No.", "Kode Risiko", "Uraian Risiko", "Celah Pengendalian",
           "Rencana Tindak Pengendalian", "Penanggung Jawab", "Triwulan", "Tahun",
           "Skala Risiko\nTarget"]
    isi = [kep]
    for i, r in enumerate(baris_data, 1):
        isi.append([str(i), _kode(r), _a(r, "URAIAN RISIKO"), _a(r, "CELAH PENGENDALIAN"),
                    _a(r, "RENCANA TINDAK PENGENDALIAN"), _a(r, "PENANGGUNG JAWAB PENGENDALIAN"),
                    _a(r, "TRIWULAN"), _a(r, "TAHUN TARGET PENYELESAIAN"),
                    _a(r, "SKALA RISIKO TARGET")])
    A(keterangan_tabel("Contoh pengisian Formulir Rencana Tindak Pengendalian"))
    A(tabel([500, 1250, 2500, 2300, 2900, 1900, 900, 800, 750], isi, p=13,
            rata_sel=["center", "center", "left", "left", "left", "left", "center",
                      "center", "center"]))

A(P("", after=400))
A(ttd_lampiran())

# ── LAMPIRAN XIII: kode entitas penilai ──
A(paragraf_pemisah_bagian(sectpr(lanskap=True, halaman_pertama_beda=False)))
A(kepala_lampiran("XIV", "KODE ENTITAS PENILAI RISIKO", potong=False))
A(par("Kode entitas penilai merupakan komponen keempat pada Kode Risiko sebagaimana dimaksud dalam "
      "Lampiran VIII. Kode diberikan tetap untuk setiap Satuan Kerja Perangkat Kabupaten agar Kode "
      "Risiko tidak berubah antar-tahun penilaian dan tidak berbenturan antar-SKPK.", after=200))
ENTITAS = json.loads((BASIS / "entitas.json").read_text(encoding="utf-8"))
_sep = (len(ENTITAS) + 1) // 2
_baris = [["Kode", "Satuan Kerja Perangkat Kabupaten", "Kode", "Satuan Kerja Perangkat Kabupaten"]]
for i in range(_sep):
    kiri = ENTITAS[i]
    kanan = ENTITAS[i + _sep] if i + _sep < len(ENTITAS) else None
    _baris.append([str(kiri["urutan"]).zfill(2), kiri["nama"],
                   str(kanan["urutan"]).zfill(2) if kanan else "",
                   kanan["nama"] if kanan else ""])
A(keterangan_tabel("Kode entitas penilai Risiko"))
A(tabel([700, 3500, 700, 3500], _baris, p=16,
        rata_sel=["center", "left", "center", "left"]))
A(P("", after=200))
A(par("Kode entitas penilai bersifat tetap. Dalam hal terjadi perubahan susunan perangkat daerah, "
      "kode entitas yang sudah tidak digunakan tidak dipakai ulang untuk SKPK lain, dan SKPK baru "
      "diberikan kode berikutnya oleh Pengelola MR KABAR.", after=300))
A(ttd_lampiran())


# ══════════════════ LAMPIRAN XIV: CONTOH CEE TERISI ══════════════════
A(paragraf_pemisah_bagian(sectpr(lanskap=True, halaman_pertama_beda=False)))
A(kepala_lampiran("XV", "CONTOH PENGISIAN KUESIONER EVALUASI LINGKUNGAN PENGENDALIAN",
                  potong=False))
A(par("Contoh berikut memperagakan cara membaca jawaban responden menjadi simpulan. Jawaban pada "
      "contoh ini adalah rekaan untuk keperluan peragaan, bukan hasil evaluasi yang sebenarnya. "
      "Simpulan setiap butir ditentukan dari modus jawaban seluruh responden: memadai apabila modus "
      "bernilai 3 atau 4, dan kurang memadai apabila modus bernilai 1 atau 2. Satu unsur "
      "disimpulkan memadai hanya apabila seluruh butir pada unsur tersebut memadai.", after=200))

import random as _rnd

_r = _rnd.Random(20260730)
_RESP = ["R1", "R2", "R3", "R4", "R5", "R6"]
# Jabatan mengikuti susunan organisasi Inspektorat Kabupaten Aceh Barat
# menurut Peraturan Bupati Aceh Barat Nomor 17 Tahun 2024. Jabatan
# "Kepala Bidang" dan "Kepala Seksi" tidak ada pada Inspektorat.
_JAB = ["Sekretaris",
        "Inspektur Pembantu I",
        "Inspektur Pembantu II",
        "Kepala Subbagian Analisis dan Evaluasi",
        "Kepala Subbagian Administrasi Umum dan Keuangan",
        "Auditor Ahli Muda"]

A(P("Identitas Responden", rata="left", b=True, after=120, jaga=True))
A(keterangan_tabel("Identitas responden Evaluasi Lingkungan Pengendalian"))
A(tabel([700, 2400, 3400, 2600],
        [["Kode", "Nama Responden", "Jabatan", "Unit Kerja"]]
        + [[_RESP[i], f"(nama responden {i + 1})", _JAB[i], "Inspektorat Kabupaten Aceh Barat"]
           for i in range(6)],
        p=18, rata_sel=["center", "left", "left", "left"]))
A(P("", after=200))

_unsur_nama = {u["id"]: (u["kode"], u["nama"]) for u in REF["cee_map"]}
_soal = {}
for _s in REF["cee_soal"]:
    _soal.setdefault(_s["cee_unsur_id"], []).append(_s["pertanyaan"])

# Unsur yang sengaja dibuat kurang memadai agar contoh RTP punya dasar.
_LEMAH = {3, 5}
_simpulan_unsur = []
_urut = [u["id"] for u in REF["cee_map"]]

for _idx, _uid in enumerate(_urut, 1):
    if _uid not in _soal:
        continue
    _kode_u, _nama = _unsur_nama[_uid]
    A(P(f"{_kode_u}.  {_nama}", rata="left", b=True, before=200, after=120, jaga=True))
    _baris = [["No.", "Pertanyaan/Kuesioner"] + _RESP + ["Modus", "Simpulan"]]
    _semua_memadai = True
    for _i, _q in enumerate(_soal[_uid], 1):
        if _idx in _LEMAH and _i <= 2:
            _jw = [_r.choice([1, 2, 2, 2, 3]) for _ in _RESP]
        else:
            _jw = [_r.choice([2, 3, 3, 3, 4, 4]) for _ in _RESP]
        _mod = max(set(_jw), key=lambda v: (_jw.count(v), v))
        _sim = "Memadai" if _mod >= 3 else "Kurang Memadai"
        if _mod < 3:
            _semua_memadai = False
        _baris.append([str(_i), _q] + [str(x) for x in _jw] + [str(_mod), _sim])
    A(keterangan_tabel(f"Rekapitulasi jawaban responden unsur {_nama}"))
    A(tabel([500, 5300] + [430] * 6 + [640, 1200], _baris, p=13,
            rata_sel=["center", "left"] + ["center"] * 6 + ["center", "center"]))
    _simpulan_unsur.append((_kode_u, _nama, "Memadai" if _semua_memadai else "Kurang Memadai"))

A(P("Simpulan Evaluasi Lingkungan Pengendalian", rata="left", b=True,
    before=240, after=140, jaga=True))
A(keterangan_tabel("Simpulan Evaluasi Lingkungan Pengendalian menurut unsur"))
A(tabel([700, 5600, 2000, 2800],
        [["Kode", "Unsur Lingkungan Pengendalian", "Simpulan", "Tindak Lanjut"]]
        + [[k, n, s, "Cukup dipertahankan" if s == "Memadai"
            else "Disusun Rencana Tindak Pengendalian"] for k, n, s in _simpulan_unsur],
        p=16, rata_sel=["center", "left", "center", "left"]))
A(P("Keterangan:", rata="left", b=True, before=160, after=80))
for _h, _k in [
    ("a", "kode unsur lingkungan pengendalian sebagaimana Lampiran IX"),
    ("b", "nama unsur lingkungan pengendalian"),
    ("c", "simpulan atas unsur, yaitu memadai apabila seluruh butir pada unsur tersebut memadai"),
    ("d", "tindak lanjut atas simpulan, berupa pemeliharaan kondisi atau penyusunan Rencana Tindak "
          "Pengendalian atas lingkungan pengendalian"),
]:
    A(PM([(f"Kolom {_h}", False), ("\t", False), (f"diisi dengan {_k}", False)],
         rata="left", kiri=1800, gantung=1300, tab=[1800], after=50, line=252, p=20))
A(ttd_lampiran())


# ══════════════════ LAMPIRAN XV: CONTOH LAPORAN ══════════════════
A(paragraf_pemisah_bagian(sectpr(lanskap=True, halaman_pertama_beda=False)))
A(kepala_lampiran("XVI", "CONTOH LAPORAN PENERAPAN MANAJEMEN RISIKO", potong=False))
A(par("Contoh berikut memperagakan susunan dan kedalaman uraian yang diharapkan pada laporan "
      "penerapan Manajemen Risiko. Angka yang digunakan merupakan hasil penilaian Risiko tahun 2025 "
      "pada aplikasi MR KABAR.", after=240))


def _bb(n, j):
    return (P(f"BAB {n}", rata="center", b=True, before=200, after=0, jaga=True)
            + P(j, rata="center", b=True, after=180, jaga=True))


def _sb(h, j):
    return P(f"{h}.  {j}", rata="left", b=True, before=160, after=100, jaga=True)


A(_bb("I", "PENDAHULUAN"))
A(_sb("A", "Latar Belakang"))
A(par("Peraturan Pemerintah Nomor 60 Tahun 2008 tentang Sistem Pengendalian Intern Pemerintah "
      "mewajibkan pimpinan Instansi Pemerintah melakukan penilaian Risiko. Penilaian Risiko bukan "
      "kegiatan tahunan yang berdiri sendiri, melainkan cara kerja yang melekat pada perencanaan, "
      "pelaksanaan, dan pertanggungjawaban program dan kegiatan. Laporan ini disusun sebagai "
      "pertanggungjawaban atas penerapan Manajemen Risiko pada tahun penilaian, sekaligus sebagai "
      "bahan perbaikan penyelenggaraan tahun berikutnya."))
A(_sb("B", "Dasar Hukum"))
for _h, _d in zip("abcd", [
    "Peraturan Pemerintah Nomor 60 Tahun 2008 tentang Sistem Pengendalian Intern Pemerintah;",
    "Peraturan Deputi Kepala Badan Pengawasan Keuangan dan Pembangunan Bidang Pengawasan "
    "Penyelenggaraan Keuangan Daerah Nomor 4 Tahun 2019 tentang Pedoman Pengelolaan Risiko pada "
    "Pemerintah Daerah;",
    "Peraturan Bupati Aceh Barat tentang Pedoman Penerapan Manajemen Risiko di Lingkungan "
    "Pemerintah Kabupaten Aceh Barat; dan",
    "Rencana Strategis dan Rencana Kerja Satuan Kerja Perangkat Kabupaten tahun berkenaan.",
]):
    A(huruf(_h, _d))
A(_sb("C", "Maksud dan Tujuan"))
A(par("Laporan ini dimaksudkan untuk menyampaikan hasil penerapan Manajemen Risiko selama satu "
      "tahun penilaian, dengan tujuan memberikan gambaran kondisi lingkungan pengendalian, Risiko "
      "yang dihadapi, pengendalian yang telah dan akan dilakukan, serta capaian pelaksanaannya."))
A(_sb("D", "Ruang Lingkup"))
A(par("Ruang lingkup laporan meliputi evaluasi lingkungan pengendalian, penilaian Risiko pada "
      "tingkat strategis dan operasional, penyusunan dan pelaksanaan Rencana Tindak Pengendalian, "
      "serta pemantauan dan pencatatan kejadian Risiko sepanjang tahun penilaian."))

A(_bb("II", "KONDISI LINGKUNGAN PENGENDALIAN"))
A(_sb("A", "Kondisi Lingkungan Pengendalian Saat Ini"))
A(par("Evaluasi lingkungan pengendalian dilaksanakan melalui kuesioner terhadap 8 (delapan) unsur "
      "dengan 37 (tiga puluh tujuh) butir pertanyaan yang diisi 6 (enam) responden lintas jenjang "
      "jabatan. Simpulan diambil dari modus jawaban setiap butir sebagaimana contoh pada Lampiran "
      "XIV."))
A(par("Berdasarkan hasil evaluasi, sebagian besar unsur lingkungan pengendalian dinilai memadai. "
      "Unsur yang masih dinilai kurang memadai menjadi perhatian utama karena unsur inilah yang "
      "paling menentukan apakah pengendalian pada tingkat kegiatan dapat berjalan sebagaimana "
      "dirancang."))
A(_sb("B", "Rencana Perbaikan Lingkungan Pengendalian"))
A(par("Atas unsur yang disimpulkan kurang memadai disusun rencana perbaikan yang menjadi bagian "
      "tidak terpisahkan dari Rencana Tindak Pengendalian, dengan penanggung jawab dan target waktu "
      "yang jelas, serta indikator keberhasilan yang dapat diukur pada akhir tahun penilaian."))

A(_bb("III", "PENILAIAN RISIKO DAN RENCANA TINDAK PENGENDALIAN"))
A(_sb("A", "Penetapan Konteks"))
A(par("Penetapan konteks dilakukan atas sasaran Rencana Pembangunan Jangka Menengah Daerah untuk "
      "Risiko strategis Pemerintah Kabupaten, sasaran Rencana Strategis untuk Risiko strategis "
      "Satuan Kerja Perangkat Kabupaten, dan sasaran Rencana Kerja untuk Risiko operasional."))
A(_sb("B", "Hasil Identifikasi Risiko"))
A(par("Pada tahun penilaian 2025 teridentifikasi 258 (dua ratus lima puluh delapan) Risiko, dengan "
      "sebaran sebagai berikut."))
A(keterangan_tabel("Sebaran hasil Identifikasi Risiko tahun 2025"))
A(tabel([900, 4200, 1900, 1900],
        [["No.", "Tingkatan Risiko", "Kode", "Jumlah Risiko"],
         ["1", "Risiko Strategis Pemerintah Kabupaten", "RSP", "8"],
         ["2", "Risiko Strategis Satuan Kerja Perangkat Kabupaten", "RSO", "95"],
         ["3", "Risiko Operasional Satuan Kerja Perangkat Kabupaten", "ROO", "155"],
         ["", "Jumlah", "", "258"]],
        p=18, rata_sel=["center", "left", "center", "center"]))
A(P("", after=160))
A(_sb("C", "Hasil Analisis Risiko"))
A(par("Setiap Risiko dinilai tingkat dampak dan tingkat kemungkinannya, lalu Skala Risiko dibaca "
      "dari matriks analisis Risiko. Sebaran hasil analisis pada peta Risiko dapat dilihat pada "
      "Gambar 9 Lampiran VII."))
A(_sb("D", "Daftar Risiko Prioritas"))
A(par("Dari seluruh Risiko yang dinilai, sebanyak 129 (seratus dua puluh sembilan) Risiko "
      "ditetapkan sebagai Risiko Prioritas karena Skala Risikonya melampaui Selera Risiko yang "
      "telah ditetapkan. Seluruh Risiko Prioritas tersebut telah disusun Rencana Tindak "
      "Pengendaliannya."))
A(_sb("E", "Pengendalian yang Sudah Dilakukan"))
A(par("Pengendalian yang telah berjalan diuraikan beserta penilaian kecukupannya. Pengendalian yang "
      "dinilai memadai dipertahankan, sedangkan yang dinilai kurang memadai ditelaah celah "
      "pengendaliannya."))
A(_sb("F", "Pengendalian yang Masih Dibutuhkan"))
A(par("Celah pengendalian yang teridentifikasi menjadi dasar perumusan kegiatan pengendalian "
      "tambahan, sebagaimana contoh pengisian pada Lampiran XIII."))
A(_sb("G", "Rencana Tindak Pengendalian"))
A(par("Rencana Tindak Pengendalian memuat kegiatan pengendalian, penanggung jawab, target waktu "
      "penyelesaian, indikator keberhasilan, serta taksiran Skala Risiko setelah pengendalian "
      "dilaksanakan."))

A(_bb("IV", "INFORMASI, KOMUNIKASI, DAN PEMANTAUAN"))
A(_sb("A", "Rancangan Informasi dan Komunikasi"))
A(par("Informasi Risiko dikomunikasikan melalui rapat berkala, dialog Risiko, dan penyajian pada "
      "aplikasi MR KABAR, dengan penyedia dan penerima informasi yang ditetapkan sejak awal tahun."))
A(_sb("B", "Rancangan Pemantauan"))
A(par("Pemantauan dilaksanakan setiap triwulan atas realisasi kegiatan pengendalian, kejadian "
      "Risiko yang benar-benar terjadi, dan tingkat Risiko aktual."))
A(_sb("C", "Realisasi Pemantauan dan Kejadian Risiko"))
A(par("Realisasi pemantauan beserta kejadian Risiko yang tercatat sepanjang tahun penilaian "
      "disampaikan dalam bentuk tabel sebagaimana Formulir 11 dan Formulir 12 pada Lampiran XII."))

A(_bb("V", "PENUTUP"))
A(_sb("A", "Simpulan"))
A(par("Penerapan Manajemen Risiko pada tahun penilaian telah dilaksanakan mengikuti tahapan "
      "sebagaimana diatur dalam Peraturan Bupati ini, dengan seluruh dokumen direkam pada aplikasi "
      "MR KABAR sehingga dapat ditelusuri sewaktu-waktu."))
A(_sb("B", "Rekomendasi"))
A(par("Perbaikan pada tahun berikutnya diarahkan pada penguatan unsur lingkungan pengendalian yang "
      "masih dinilai kurang memadai, ketepatan waktu perekaman data, serta pemanfaatan hasil "
      "penilaian Risiko sebagai dasar penyusunan program dan kegiatan."))
A(P("", after=400))
A(ttd_lampiran())


# ══════════ LAMPIRAN XVI: CONTOH PEMANTAUAN & CEE 1b-1d ══════════
A(paragraf_pemisah_bagian(sectpr(lanskap=True, halaman_pertama_beda=False)))
A(kepala_lampiran("XVII", "CONTOH PENGISIAN FORMULIR PEMANTAUAN DAN\n"
                         "EVALUASI LINGKUNGAN PENGENDALIAN", potong=False))
A(par("Contoh berikut melanjutkan rangkaian contoh pada Lampiran XIII dan Lampiran XV. Uraian "
      "Risiko diambil dari data tahun 2025; kolom realisasi, tanggal kejadian, dan keterangan "
      "merupakan peragaan.", after=200))

_ris = (CONTOH["iro_pd"] or CONTOH["irs_pd"] or CONTOH["irs_pemda"])[:4]
_TW = ["I", "II", "III", "IV"]

A(P("A.  Contoh Pengisian Formulir Rancangan Informasi dan Komunikasi",
    rata="left", b=True, before=200, after=140, jaga=True))
_b = [["No.", "Kode Risiko", "RTP", "Media Komunikasi", "Penyedia Informasi",
       "Penerima Informasi", "Triwulan", "Tahun", "Realisasi Waktu", "Keterangan"]]
_media = ["Rapat berkala bidang", "Surat edaran Kepala SKPK", "Aplikasi MR KABAR",
          "Rapat koordinasi lintas bidang"]
_penerima = ["Seluruh pejabat pengawas", "Pelaksana teknis kegiatan",
             "Kepala SKPK dan Inspektorat", "Seluruh pegawai pada bidang terkait"]
for _i, _r in enumerate(_ris, 1):
    _b.append([str(_i), _kode(_r), _a(_r, "RENCANA TINDAK PENGENDALIAN")[:70],
               _media[_i % 4], "Pejabat struktural terkait", _penerima[_i % 4],
               _TW[_i % 4], "2025", f"Triwulan {_TW[_i % 4]} 2025",
               "Terlaksana sesuai rencana" if _i % 3 else "Dilaksanakan lebih awal"])
A(keterangan_tabel("Contoh pengisian Formulir Rancangan Informasi dan Komunikasi"))
A(tabel([500, 1250, 2900, 1600, 1500, 1900, 750, 700, 1400, 1300], _b, p=13,
        rata_sel=["center", "center", "left", "left", "left", "left",
                  "center", "center", "center", "left"]))

A(P("B.  Contoh Pengisian Formulir Rancangan dan Realisasi Pemantauan",
    rata="left", b=True, before=220, after=140, jaga=True))
_b = [["No.", "Kode Risiko", "RTP", "Metode Pemantauan", "Penanggung Jawab",
       "Triwulan", "Tahun", "Realisasi Waktu", "Keterangan"]]
_metode = ["Reviu dokumen dan uji petik lapangan", "Pemantauan berkala melalui aplikasi",
           "Rapat pemantauan triwulanan", "Verifikasi berkas dan wawancara pelaksana"]
_ket = ["Terlaksana, pengendalian berjalan efektif",
        "Terlaksana sebagian, perlu penguatan pada triwulan berikutnya",
        "Terlaksana, tidak ditemukan penyimpangan",
        "Belum sepenuhnya terlaksana karena keterbatasan personel"]
for _i, _r in enumerate(_ris, 1):
    _b.append([str(_i), _kode(_r), _a(_r, "RENCANA TINDAK PENGENDALIAN")[:70],
               _metode[_i % 4], _a(_r, "PENANGGUNG JAWAB PENGENDALIAN"),
               _TW[_i % 4], "2025", f"Triwulan {_TW[_i % 4]} 2025", _ket[_i % 4]])
A(keterangan_tabel("Contoh pengisian Formulir Rancangan dan Realisasi Pemantauan"))
A(tabel([500, 1250, 2700, 2100, 1700, 750, 700, 1400, 2700], _b, p=13,
        rata_sel=["center", "center", "left", "left", "left", "center",
                  "center", "center", "left"]))

A(P("C.  Contoh Pengisian Formulir Pencatatan Kejadian Risiko",
    rata="left", b=True, before=220, after=140, jaga=True))
_b = [["No.", "Kode Risiko", "Uraian Risiko", "Tanggal Kejadian", "Sebab Saat Kejadian",
       "Dampak Saat Kejadian", "Keterangan Kejadian", "Triwulan RTP", "Tahun RTP",
       "Realisasi RTP", "Keterangan"]]
_tgl = ["17 Maret 2025", "8 Juni 2025", "2 September 2025", "21 Oktober 2025"]
_real = ["Terlaksana seluruhnya", "Terlaksana sebagian",
         "Terlaksana seluruhnya", "Dalam pelaksanaan"]
for _i, _r in enumerate(_ris, 1):
    _b.append([str(_i), _kode(_r), _a(_r, "URAIAN RISIKO"), _tgl[_i % 4],
               _a(_r, "URAIAN PENYEBAB RISIKO")[:70], _a(_r, "URAIAN DAMPAK RISIKO")[:70],
               "Kejadian tercatat dan telah ditindaklanjuti sesuai Rencana Tindak Pengendalian",
               _TW[_i % 4], "2025", _real[_i % 4],
               "Tidak menimbulkan kerugian keuangan daerah"])
A(keterangan_tabel("Contoh pengisian Formulir Pencatatan Kejadian Risiko"))
A(tabel([450, 1150, 2100, 1200, 2000, 2000, 2100, 800, 700, 1200, 1600], _b, p=12,
        rata_sel=["center", "center", "left", "center", "left", "left", "left",
                  "center", "center", "center", "left"]))

# ── CEE 1b sampai 1d, memakai unsur yang kurang memadai pada Lampiran XV ──
_lemah = [(_k, _n) for _k, _n, _s in _simpulan_unsur if _s == "Kurang Memadai"]
if not _lemah:
    _lemah = [(u["kode"], u["nama"]) for u in REF["cee_map"][:2]]

A(P("D.  Contoh Pengisian Formulir Kelemahan Lingkungan Pengendalian "
    "Berdasarkan Dokumen (CEE 1b)", rata="left", b=True, before=220, after=140, jaga=True))
_sumber = ["Laporan Hasil Pemeriksaan Inspektorat tahun sebelumnya",
           "Laporan Kinerja Instansi Pemerintah", "Notulen rapat evaluasi kinerja triwulanan",
           "Laporan hasil survei kepuasan masyarakat"]
_lemahan = [
    "Aturan perilaku belum dimutakhirkan dan belum disosialisasikan secara berkala kepada seluruh "
    "pegawai, sehingga pemahaman atas standar perilaku belum merata",
    "Analisis kebutuhan diklat belum disusun berdasarkan peta kompetensi jabatan, sehingga "
    "penugasan pelatihan belum tepat sasaran",
    "Pendelegasian wewenang belum seluruhnya dituangkan dalam keputusan tertulis, sehingga batas "
    "tanggung jawab antar-jenjang belum tegas",
    "Evaluasi atas pelaksanaan kebijakan pembinaan sumber daya manusia belum dilakukan secara "
    "berkala",
]
_b = [["No.", "Unsur", "Sumber Data", "Uraian Kelemahan", "Pengisi", "Jabatan Pengisi"]]
for _i in range(4):
    _u = _lemah[_i % len(_lemah)]
    _b.append([str(_i + 1), f"{_u[0]}. {_u[1]}", _sumber[_i], _lemahan[_i],
               "(nama pengisi)", "Sekretaris"])
A(keterangan_tabel("Contoh pengisian Formulir Kelemahan Lingkungan Pengendalian (CEE 1b)"))
A(tabel([500, 2600, 2600, 4600, 1700, 1600], _b, p=14,
        rata_sel=["center", "left", "left", "left", "left", "left"]))

A(P("E.  Contoh Pengisian Formulir Simpulan Evaluasi Lingkungan Pengendalian (CEE 1c)",
    rata="left", b=True, before=220, after=140, jaga=True))
_b = [["No.", "Unsur", "Simpulan", "Penjelasan", "Penyusun", "Jabatan Penyusun"]]
for _i, (_k, _n, _s) in enumerate(_simpulan_unsur, 1):
    _pj = ("Seluruh butir kuesioner pada unsur ini memperoleh modus 3 atau 4 dan tidak ditemukan "
           "kelemahan pada reviu dokumen" if _s == "Memadai"
           else "Terdapat butir kuesioner dengan modus di bawah 3 dan didukung temuan kelemahan "
                "pada reviu dokumen")
    _b.append([str(_i), f"{_k}. {_n}", _s, _pj, "(nama penyusun)", "Sekretaris"])
A(keterangan_tabel("Contoh pengisian Formulir Simpulan Evaluasi Lingkungan Pengendalian (CEE 1c)"))
A(tabel([500, 3000, 1700, 5100, 1700, 1600], _b, p=14,
        rata_sel=["center", "left", "center", "left", "left", "left"]))

A(P("F.  Contoh Pengisian Formulir Rencana Tindak Pengendalian atas Lingkungan "
    "Pengendalian (CEE 1d)", rata="left", b=True, before=220, after=140, jaga=True))
_rtp_lp = [
    ("Aturan perilaku belum dimutakhirkan dan belum disosialisasikan berkala",
     "Menyusun dan menetapkan pemutakhiran aturan perilaku, dilanjutkan sosialisasi kepada seluruh "
     "pegawai paling sedikit 2 (dua) kali dalam satu tahun"),
    ("Analisis kebutuhan diklat belum berdasarkan peta kompetensi jabatan",
     "Menyusun peta kompetensi jabatan dan analisis kebutuhan diklat sebagai dasar pengusulan "
     "pengembangan kompetensi pegawai"),
    ("Pendelegasian wewenang belum seluruhnya tertulis",
     "Menerbitkan keputusan pendelegasian wewenang yang memuat batas tanggung jawab setiap jenjang "
     "jabatan"),
    ("Evaluasi kebijakan pembinaan sumber daya manusia belum berkala",
     "Menetapkan jadwal evaluasi berkala atas pelaksanaan kebijakan pembinaan sumber daya manusia "
     "beserta penanggung jawabnya"),
]
_b = [["No.", "Unsur", "Kondisi Kurang Memadai", "Rencana Tindak Pengendalian",
       "Penanggung Jawab", "Triwulan Target", "Tahun Target", "Triwulan Realisasi",
       "Tahun Realisasi"]]
for _i, (_kond, _rtp) in enumerate(_rtp_lp, 1):
    _u = _lemah[(_i - 1) % len(_lemah)]
    _b.append([str(_i), f"{_u[0]}. {_u[1]}", _kond, _rtp, "Sekretaris",
               _TW[_i % 4], "2026", _TW[_i % 4], "2026"])
A(keterangan_tabel("Contoh pengisian Formulir Rencana Tindak Pengendalian atas Lingkungan Pengendalian (CEE 1d)"))
A(tabel([450, 2200, 2700, 3900, 1500, 900, 800, 950, 900], _b, p=13,
        rata_sel=["center", "left", "left", "left", "left", "center", "center",
                  "center", "center"]))
A(P("", after=400))
A(ttd_lampiran())


# ══════════ LAMPIRAN XVII: CONTOH FORMULIR 17, 18, DAN 19 ══════════
A(paragraf_pemisah_bagian(sectpr(lanskap=True, halaman_pertama_beda=False)))
A(kepala_lampiran("XVIII", "CONTOH PENGISIAN FORMULIR KETERKAITAN PROGRAM PEMBANGUNAN BUPATI,\n"
                          "PELAPORAN KEJADIAN RISIKO, DAN DATA UMUM", potong=False))

PROG = json.loads((BASIS / "program.json").read_text(encoding="utf-8"))


def _peringkat(skala):
    for lv in REF["level"]:
        if lv["skala_min"] <= skala <= lv["skala_max"]:
            return lv["label"]
    return ""


A(P("A.  Contoh Pengisian Formulir Keterkaitan Risiko Prioritas dengan Program Pembangunan Bupati",
    rata="left", b=True, before=200, after=140, jaga=True))
A(par("Keterkaitan berikut benar-benar terekam pada MR KABAR untuk tahun penilaian 2025. Kolom "
      "keputusan dan tanggal merupakan peragaan alur persetujuan sebagaimana dimaksud dalam "
      "Pasal 30.", after=140))
_b = [["No.", "Nomor Program", "Program Pembangunan Bupati", "SKPK Pengampu", "Kode Risiko",
       "Uraian Risiko", "Peringkat Risiko", "Pengusul", "Tanggal Usulan", "Keputusan",
       "Tanggal Keputusan", "Alasan"]]
_tgl_u = ["3 Februari 2026", "5 Februari 2026", "9 Februari 2026",
          "11 Februari 2026", "16 Februari 2026", "18 Februari 2026"]
_tgl_k = ["6 Februari 2026", "9 Februari 2026", "12 Februari 2026",
          "13 Februari 2026", "19 Februari 2026", "20 Februari 2026"]
for _i, _p in enumerate(PROG, 1):
    _tolak = _i == len(PROG)
    _b.append([str(_i), str(_p["nomor"]), _p["program"], _p["skpk"], _p["kode"], _p["uraian"],
               _peringkat(_p["skala"]), _p["skpk"], _tgl_u[(_i - 1) % 6],
               "Ditolak" if _tolak else "Disetujui", _tgl_k[(_i - 1) % 6],
               "Risiko yang sama telah dikaitkan pada program nomor 3" if _tolak else "-"])
A(keterangan_tabel("Contoh pengisian Formulir Keterkaitan Risiko Prioritas dengan Program "
                   "Pembangunan Bupati"))
A(tabel([420, 800, 2300, 1500, 1250, 2400, 1000, 1400, 1150, 900, 1150, 1730], _b, p=12,
        rata_sel=["center", "center", "left", "left", "center", "left", "center", "left",
                  "center", "center", "center", "left"]))
A(P("Keterangan:", rata="left", b=True, before=140, after=80))
for _hrf, _ket in zip(HURUF_KOLOM, [
    "nomor urut",
    "nomor Program Pembangunan Bupati sesuai Rencana Pembangunan Jangka Menengah Daerah",
    "rumusan Program Pembangunan Bupati",
    "Satuan Kerja Perangkat Kabupaten yang mengampu program tersebut",
    "kode Risiko Prioritas yang dikaitkan, terisi otomatis",
    "uraian Risiko Prioritas, terisi otomatis",
    "peringkat Risiko hasil Evaluasi Risiko, terisi otomatis",
    "UPR yang mengajukan usulan keterkaitan",
    "tanggal usulan diajukan melalui MR KABAR",
    "keputusan Pengelola MR KABAR, yaitu disetujui atau ditolak",
    "tanggal keputusan diambil",
    "alasan penolakan, diisi dalam hal usulan ditolak",
]):
    A(PM([(f"Kolom {_hrf}", False), ("\t", False), (f"diisi dengan {_ket}.", False)],
         kiri=1560, gantung=1560, tab=1560, after=40, rata="left"))

A(P("B.  Contoh Pengisian Formulir Pelaporan Kejadian Risiko oleh Pegawai dan Masyarakat",
    rata="left", b=True, before=240, after=140, jaga=True))
A(par("Identitas pelapor pada contoh berikut ditulis sebagai penanda karena merupakan data pribadi "
      "yang dilindungi sebagaimana dimaksud dalam Pasal 38 ayat (6).", after=140))
_LAP = [
    ("Dinas Kesehatan",
     "Pelayanan ambulan gratis tertunda karena kendaraan sedang dalam perbaikan dan tidak tersedia "
     "kendaraan pengganti",
     "14 April 2026, pukul 21.30 WIB", "Puskesmas Johan Pahlawan",
     "Ketiadaan kendaraan cadangan dan belum adanya jadwal pemeliharaan berkala",
     "ROO.25.02.09.01", "Ditindaklanjuti",
     "Telah disusun jadwal pemeliharaan berkala dan disiapkan 1 (satu) kendaraan cadangan"),
    ("Dinas Pekerjaan Umum dan Penataan Ruang",
     "Genangan air pada ruas jalan kabupaten setelah hujan deras selama 3 (tiga) jam",
     "2 Mei 2026, pukul 16.00 WIB", "Ruas jalan Meulaboh - Kuala Bhee",
     "Saluran drainase tersumbat sedimen dan sampah",
     "-", "Dalam telaahan",
     "Sedang ditelaah keterkaitannya dengan Risiko yang telah teridentifikasi"),
    ("Dinas Pendidikan dan Kebudayaan",
     "Penyaluran bantuan seragam sekolah terlambat sehingga tidak diterima pada awal tahun ajaran",
     "18 Juli 2026", "Sekolah dasar pada Kecamatan Kaway XVI",
     "Proses pengadaan melampaui jadwal yang direncanakan",
     "-", "Baru",
     "Belum ditelaah"),
    ("Rumah Sakit Umum Daerah Cut Nyak Dhien",
     "Antrean pendaftaran pasien memanjang karena gangguan jaringan pada sistem antrean",
     "5 Agustus 2026, pukul 08.15 WIB", "Ruang pendaftaran rawat jalan",
     "Ketiadaan prosedur pelayanan manual pada saat sistem terganggu",
     "-", "Ditutup",
     "Bukan merupakan Risiko yang berdampak pada pencapaian sasaran, telah diselesaikan pada hari "
     "yang sama"),
]
_b = [["No.", "Nama Pelapor", "Alamat Surat Elektronik", "Nomor Telepon", "SKPK Terkait",
       "Uraian Kejadian", "Waktu Kejadian", "Tempat Kejadian", "Dugaan Pemicu",
       "Kaitan Risiko Terdaftar", "Status", "Catatan Tindak Lanjut", "Penindak Lanjut",
       "Tanggal Tindak Lanjut"]]
_tgl_tl = ["16 April 2026", "4 Mei 2026", "-", "5 Agustus 2026"]
for _i, (_skpk, _kej, _wkt, _tpt, _pmc, _kode, _st, _tl) in enumerate(_LAP, 1):
    _b.append([str(_i), f"(nama pelapor {_i})", f"(surel pelapor {_i})", f"(nomor telepon {_i})",
               _skpk, _kej, _wkt, _tpt, _pmc, _kode, _st, _tl,
               "(nama penindak lanjut)" if _st != "Baru" else "-", _tgl_tl[_i - 1]])
A(keterangan_tabel("Contoh pengisian Formulir Pelaporan Kejadian Risiko oleh Pegawai dan "
                   "Masyarakat"))
A(tabel([345, 975, 975, 905, 1310, 2125, 1040, 1175, 1585, 905, 860, 1990, 1040, 905], _b,
        p=11,
        rata_sel=["center", "left", "left", "left", "left", "left", "center", "left", "left",
                  "center", "center", "left", "left", "center"]))
A(P("Keterangan:", rata="left", b=True, before=140, after=80))
for _hrf, _ket in zip(HURUF_KOLOM, [
    "nomor urut",
    "nama lengkap pelapor",
    "alamat surat elektronik pelapor",
    "nomor telepon yang dapat dihubungi",
    "Satuan Kerja Perangkat Kabupaten yang terkait dengan kejadian",
    "uraian peristiwa yang dilaporkan",
    "tanggal dan waktu peristiwa terjadi",
    "tempat peristiwa terjadi",
    "dugaan penyebab timbulnya peristiwa menurut pelapor",
    "Kode Risiko yang terkait, diisi berdasarkan hasil telaahan UPR",
    "status penanganan laporan, yaitu baru, dalam telaahan, ditindaklanjuti, atau ditutup",
    "uraian tindak lanjut yang telah dilakukan",
    "nama pejabat atau pegawai yang menindaklanjuti",
    "tanggal tindak lanjut dilakukan",
]):
    A(PM([(f"Kolom {_hrf}", False), ("\t", False), (f"diisi dengan {_ket}.", False)],
         kiri=1560, gantung=1560, tab=1560, after=40, rata="left"))

A(P("C.  Contoh Pengisian Formulir Data Umum", rata="left", b=True, before=240, after=140,
    jaga=True))
_b = [["No.", "Nama SKPK", "Tahun Penilaian", "Nama Penanda Tangan", "Jabatan Penanda Tangan",
       "Nomor Induk Pegawai", "Tempat Penandatanganan", "Tanggal Penandatanganan"]]
_DU = [
    ("Inspektorat Kabupaten Aceh Barat", "Inspektur"),
    ("Dinas Kesehatan Kabupaten Aceh Barat", "Kepala Dinas"),
    ("Dinas Pekerjaan Umum dan Penataan Ruang Kabupaten Aceh Barat", "Kepala Dinas"),
    ("Badan Perencanaan Pembangunan Daerah Kabupaten Aceh Barat", "Kepala Badan"),
]
for _i, (_nm, _jb) in enumerate(_DU, 1):
    _b.append([str(_i), _nm, "2026", f"(nama penanda tangan {_i})", _jb,
               f"(nomor induk pegawai {_i})", "Meulaboh", "30 Januari 2027"])
A(keterangan_tabel("Contoh pengisian Formulir Data Umum"))
A(tabel([500, 3600, 1100, 1900, 1500, 1800, 1700, 1900], _b, p=14,
        rata_sel=["center", "left", "center", "left", "left", "left", "left", "center"]))
A(P("Keterangan:", rata="left", b=True, before=140, after=80))
for _hrf, _ket in zip(HURUF_KOLOM, [
    "nomor urut",
    "nama Satuan Kerja Perangkat Kabupaten",
    "tahun penilaian Risiko",
    "nama pejabat yang menandatangani dokumen Manajemen Risiko",
    "jabatan pejabat sebagaimana dimaksud pada kolom d",
    "nomor induk pegawai pejabat penanda tangan",
    "tempat dokumen ditandatangani",
    "tanggal dokumen ditandatangani",
]):
    A(PM([(f"Kolom {_hrf}", False), ("\t", False), (f"diisi dengan {_ket}.", False)],
         kiri=1560, gantung=1560, tab=1560, after=40, rata="left"))
A(P("", after=400))

A(ttd_kanan("BUPATI ACEH BARAT,", "TARMIZI"))


# Bagian terakhir (Lampiran XII) lanskap.
tulis(KELUARAN, "".join(d), sect_akhir=sectpr(lanskap=True, halaman_pertama_beda=False),
      daftar_gambar=DAFTAR_GAMBAR)
print(f"selesai: {KELUARAN.name}")
print(f"ukuran : {KELUARAN.stat().st_size // 1024} KB")
