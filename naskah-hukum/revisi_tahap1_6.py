"""
Revisi naskah Perbup — Tahap 1 sampai 6 hasil pembandingan dengan Perwal
Cilegon Nomor 2 Tahun 2022, ditambah dua hal yang menyusul dari pekerjaan
aplikasi: keputusan B2 tentang istilah "Administrator", dan Selera Risiko
yang kini menjadi data.

Pasal baru diberi nomor sementara 901 ke atas. `nomori_ulang.py` yang
menetapkan nomor sebenarnya menurut urutan kemunculan, sekaligus menggeser
seluruh rujukan silang. Dua langkah dipisah supaya penambahan isi dan
penomoran tidak pernah bercampur — bercampurnya keduanya persis yang membuat
penomoran Pasal kacau tanpa ketahuan.

Dijalankan sekali. Menjalankannya dua kali ditolak.
"""
import io
import os

F = os.path.join(os.path.dirname(os.path.abspath(__file__)), "naskah.py")
s = io.open(F, encoding="utf-8").read()

if "pasal(901)" in s or "Budaya Sadar Risiko" in s:
    print("naskah sudah direvisi, tidak diulang")
    raise SystemExit

n = [0]


def g(lama, baru):
    global s
    assert lama in s, "jangkar tidak ketemu:\n" + lama[:150]
    assert s.count(lama) == 1, "jangkar tidak unik:\n" + lama[:150]
    s = s.replace(lama, baru, 1)
    n[0] += 1


# ══════════════════════════════════════════════════════════════════════
# TAHAP 1 — Ketentuan Umum dan dasar hukum
# ══════════════════════════════════════════════════════════════════════

# 1a. Sembilan prinsip Perpres 39/2023 Pasal 5. Naskah baru memuat tujuh;
#     kolaboratif dan perbaikan berkelanjutan belum ada.
g("""for h, t in zip("abcdefg", [
    "terpadu, yaitu menjadi bagian tidak terpisahkan dari seluruh proses penyelenggaraan "
    "pemerintahan daerah;",
    "terstruktur dan menyeluruh, yaitu dilakukan secara sistematis atas seluruh tujuan dan sasaran;",
    "sesuai kebutuhan, yaitu disesuaikan dengan karakteristik, tugas, dan fungsi masing-masing SKPK;",
    "inklusif, yaitu melibatkan pemangku kepentingan yang relevan;",
    "dinamis, yaitu ditinjau dan dimutakhirkan mengikuti perubahan keadaan;",
    "berdasarkan informasi terbaik yang tersedia; dan",
    "mempertimbangkan faktor manusia dan budaya organisasi.",
]):""",
  """for h, t in zip("abcdefghi", [
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
]):""")

# 1b. "Sisa Risiko" dipakai tiga kali pada Formulir 7 tanpa pernah
#     dirumuskan — cacat sejenis Toleransi Risiko yang sudah diperbaiki.
g('''    "Toleransi Risiko adalah batas penyimpangan dari Selera Risiko yang masih dapat diterima Pemerintah Kabupaten atau SKPK tanpa mengganggu pencapaian tujuan dan sasaran.",''',
  '''    "Toleransi Risiko adalah batas penyimpangan dari Selera Risiko yang masih dapat diterima Pemerintah Kabupaten atau SKPK tanpa mengganggu pencapaian tujuan dan sasaran.",
    "Sisa Risiko adalah Risiko yang masih tersisa setelah memperhitungkan pengendalian yang telah "
    "dilaksanakan.",''')

# 1c. Keputusan 1 Agustus 2026: naskah tidak memakai kata "Administrator"
#     supaya tidak terbaca sebagai jenjang jabatan administrator pada
#     manajemen aparatur sipil negara. Nama peran di aplikasi tidak diubah.
s = s.replace(
    '"Administrator adalah pejabat atau pegawai yang ditugaskan mengelola MR KABAR, meliputi "',
    '"Pengelola MR KABAR adalah pejabat atau pegawai yang ditugaskan mengelola MR KABAR, meliputi "')
s = s.replace("Administrator", "Pengelola MR KABAR")
n[0] += 1

# 1d. Perpres MRPN masuk Mengingat. Perka BPKP 25/2013 sengaja TIDAK
#     dicantumkan: Peraturan Kepala lembaga tidak berada dalam hierarki
#     Undang-Undang Nomor 12 Tahun 2011, dan tidak pernah diundangkan dalam
#     Berita Negara.
g('''    "Peraturan Presiden Nomor 95 Tahun 2018 tentang Sistem Pemerintahan Berbasis Elektronik ''',
  '''    "Peraturan Presiden Nomor 39 Tahun 2023 tentang Manajemen Risiko Pembangunan Nasional "
    "(Lembaran Negara Republik Indonesia Tahun 2023 Nomor 90);",
    "Peraturan Presiden Nomor 95 Tahun 2018 tentang Sistem Pemerintahan Berbasis Elektronik ''')

# ══════════════════════════════════════════════════════════════════════
# TAHAP 2 — Pengembangan Budaya Sadar Risiko (BAB III)
# ══════════════════════════════════════════════════════════════════════
# Sebelumnya budaya sadar Risiko hanya muncul sebagai tujuan pada Pasal 3,
# tanpa satu pun pasal yang mengatur caranya. BAB III dibagi menjadi dua
# Bagian; membubuhkan satu Bagian pada BAB yang belum terbagi mengharuskan
# seluruh isinya ikut terbagi.
g('A(bab("III", "PRINSIP DAN KEBIJAKAN PENGELOLAAN RISIKO"))\nA(pasal(5))',
  'A(bab("III", "PRINSIP DAN KEBIJAKAN PENGELOLAAN RISIKO"))\n'
  'A(bagian("Kesatu", "Prinsip dan Kebijakan"))\n'
  'A(pasal(5))')

g('''A(ayat(5, "Toleransi Risiko sebagaimana dimaksud pada ayat (4) menjadi dasar pengisian kolom "
          "toleransi pada kriteria kemungkinan terjadinya Risiko sebagaimana tercantum dalam "
          "Lampiran VI."))''',
  '''A(ayat(5, "Toleransi Risiko sebagaimana dimaksud pada ayat (4) menjadi dasar pengisian kolom "
          "toleransi pada kriteria kemungkinan terjadinya Risiko sebagaimana tercantum dalam "
          "Lampiran VI."))
A(ayat(6, "Selera Risiko dan Toleransi Risiko sebagaimana dimaksud pada ayat (1) sampai dengan "
          "ayat (4) direkam pada MR KABAR dan menjadi dasar penentuan Risiko Prioritas secara "
          "elektronik."))

A(bagian("Kedua", "Pengembangan Budaya Sadar Risiko"))
A(pasal(901))
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
A(pasal(902))
A(ayat(1, "Bupati dapat memberikan penghargaan kepada SKPK yang menyelenggarakan Manajemen Risiko "
          "secara baik."))
A(ayat(2, "Penilaian untuk pemberian penghargaan sebagaimana dimaksud pada ayat (1) didasarkan pada "
          "ketaatan penyampaian laporan, kelengkapan perekaman pada MR KABAR, dan tindak lanjut atas "
          "RTP yang telah disusun."))
A(ayat(3, "Ketaatan sebagaimana dimaksud pada ayat (2) terbaca dari MR KABAR dan tidak memerlukan "
          "penilaian tersendiri."))''')

io.open(F, "w", encoding="utf-8").write(s)
print(f"Tahap 1 dan 2: {n[0]} bagian disunting, 2 Pasal baru (901, 902)")
