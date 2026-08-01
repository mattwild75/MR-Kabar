"""
Revisi naskah Perbup — Tahap 3 sampai 6.

Tahap 3  penguatan BAB V: ukuran kapan pengendalian dinyatakan tidak efektif,
         kewajiban uji coba sebelum pengendalian diberlakukan, dan kewajiban
         menyelaraskan RTP lingkungan pengendalian dengan RTP Risiko.
Tahap 4  Bagian baru "Jadwal Penyelenggaraan" pada BAB V.
Tahap 5  susunan Komite dan UPR, supaya dapat langsung dijadikan dasar
         Keputusan Bupati.
Tahap 6  laporan pembinaan Komite sebagai jenis laporan keempat.

Pasal baru bernomor sementara 903 ke atas.

Satu keputusan penaskahan yang perlu dicatat: jadwal rinci penyelenggaraan
TIDAK dituangkan sebagai Lampiran. Jadwalnya berubah tiap tahun mengikuti
siklus perencanaan dan penganggaran, sedangkan Lampiran Perbup hanya dapat
diubah dengan mengubah Perbup. Perdep sendiri menempatkannya pada Surat
Edaran pimpinan, dan kedua Surat Edaran itu sudah disusun. Yang diatur di
sini kewajiban dan kerangkanya; isinya menyusul lewat Surat Edaran.
"""
import io
import os

F = os.path.join(os.path.dirname(os.path.abspath(__file__)), "naskah.py")
s = io.open(F, encoding="utf-8").read()

if "pasal(903)" in s:
    print("Tahap 3-6 sudah diterapkan, tidak diulang")
    raise SystemExit

n = [0]


def g(lama, baru):
    global s
    assert lama in s, "jangkar tidak ketemu:\n" + lama[:150]
    assert s.count(lama) == 1, "jangkar tidak unik:\n" + lama[:150]
    s = s.replace(lama, baru, 1)
    n[0] += 1


# ══════════════════════════════════════════════════════════════════════
# TAHAP 5 — susunan Komite dan UPR
# ══════════════════════════════════════════════════════════════════════
g('''A(ayat(2, "Komite sebagaimana dimaksud pada ayat (1) bertugas:"))
for h, t in zip("abcd", [
    "menetapkan arah kebijakan pengelolaan Risiko Pemerintah Kabupaten;",
    "menetapkan Selera Risiko tingkat Pemerintah Kabupaten;",
    "memutuskan penanganan Risiko yang bersifat lintas SKPK; dan",
    "memantau efektivitas penyelenggaraan Manajemen Risiko secara keseluruhan.",
]):
    A(huruf(h, t, kiri=1021))''',
  '''A(ayat(2, "Susunan Komite Pengelolaan Risiko tingkat Pemerintah Kabupaten terdiri atas:"))
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
          "Bupati."))''')

g('''A(ayat(4, "UPR tingkat operasional SKPK sebagaimana dimaksud pada ayat (1) huruf c dijabat oleh "
          "pejabat administrator atau pejabat pengawas pada SKPK sesuai dengan tugas dan fungsinya."))''',
  '''A(ayat(4, "UPR tingkat operasional SKPK sebagaimana dimaksud pada ayat (1) huruf c dijabat oleh "
          "pejabat administrator atau pejabat pengawas pada SKPK sesuai dengan tugas dan fungsinya."))
A(ayat(5, "UPR pada setiap tingkatan sebagaimana dimaksud pada ayat (1) berbentuk tim dengan susunan "
          "terdiri atas ketua, koordinator merangkap anggota, dan anggota."))
A(ayat(6, "Koordinator sebagaimana dimaksud pada ayat (5) dijabat oleh pejabat yang menangani "
          "perencanaan pada tingkatan yang bersangkutan."))
A(ayat(7, "Susunan UPR pada setiap tingkatan sebagaimana dimaksud pada ayat (5) ditetapkan dengan "
          "Keputusan Bupati untuk jangka waktu 1 (satu) tahun dan direkam pada MR KABAR."))''')

# ══════════════════════════════════════════════════════════════════════
# TAHAP 4 — Jadwal Penyelenggaraan
# ══════════════════════════════════════════════════════════════════════
g('''A(bagian("Kedua", "Penetapan Konteks"))''',
  '''A(bagian("Kedua", "Jadwal Penyelenggaraan"))
A(pasal(903))
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

A(bagian("Ketiga", "Penetapan Konteks"))''')

# Bagian sesudahnya bergeser satu tingkat
for lama, baru in [
    ('A(bagian("Ketiga", "Identifikasi Risiko"))', 'A(bagian("Keempat", "Identifikasi Risiko"))'),
    ('A(bagian("Keempat", "Analisis Risiko"))', 'A(bagian("Kelima", "Analisis Risiko"))'),
    ('A(bagian("Kelima", "Evaluasi Risiko"))', 'A(bagian("Keenam", "Evaluasi Risiko"))'),
    ('A(bagian("Keenam", "Keterkaitan Risiko Prioritas dengan Program Pembangunan Bupati"))',
     'A(bagian("Ketujuh", "Keterkaitan Risiko Prioritas dengan Program Pembangunan Bupati"))'),
    ('A(bagian("Ketujuh", "Rencana Tindak Pengendalian"))',
     'A(bagian("Kedelapan", "Rencana Tindak Pengendalian"))'),
    ('A(bagian("Kedelapan", "Pemantauan"))', 'A(bagian("Kesembilan", "Pemantauan"))'),
    ('A(bagian("Kesembilan", "Informasi dan Komunikasi"))',
     'A(bagian("Kesepuluh", "Informasi dan Komunikasi"))'),
]:
    g(lama, baru)

# ══════════════════════════════════════════════════════════════════════
# TAHAP 3 — penguatan BAB V pada Bagian Rencana Tindak Pengendalian
# ══════════════════════════════════════════════════════════════════════
g('''A(pasal(29))
A(par("Respons Risiko dalam RTP dapat berupa menghindari Risiko, mengurangi kemungkinan terjadinya "
      "Risiko, mengurangi dampak Risiko, membagi Risiko, atau menerima Risiko."))''',
  '''A(pasal(29))
A(par("Respons Risiko dalam RTP dapat berupa menghindari Risiko, mengurangi kemungkinan terjadinya "
      "Risiko, mengurangi dampak Risiko, membagi Risiko, atau menerima Risiko."))

A(pasal(904))
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

A(pasal(905))
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

A(pasal(906))
A(ayat(1, "RTP atas kelemahan lingkungan pengendalian sebagaimana dimaksud dalam Pasal 907 "
          "diselaraskan dengan RTP atas Risiko Prioritas."))
A(ayat(2, "Keselarasan sebagaimana dimaksud pada ayat (1) dimaksudkan agar satu kegiatan "
          "pengendalian tidak disusun dan dipantau dua kali pada dokumen yang berbeda."))
A(ayat(3, "Dalam hal rumusan kegiatan pengendalian pada kedua RTP sebagaimana dimaksud pada ayat "
          "(1) sama atau serupa, kegiatan tersebut dinyatakan sebagai satu kegiatan pengendalian "
          "dengan satu penanggung jawab."))''')

# ══════════════════════════════════════════════════════════════════════
# BAB VI — penanda untuk rujukan RTP atas kelemahan lingkungan pengendalian
# ══════════════════════════════════════════════════════════════════════
g('''A(bab("VI", "EVALUASI LINGKUNGAN PENGENDALIAN"))
A(pasal(34))''',
  '''A(bab("VI", "EVALUASI LINGKUNGAN PENGENDALIAN"))
A(pasal(907))
A(ayat(1, "Simpulan CEE atas setiap unsur lingkungan pengendalian disusun dengan menyandingkan "
          "hasil reviu dokumen dan hasil survei persepsi pegawai."))
A(ayat(2, "Dalam hal kedua sumber sebagaimana dimaksud pada ayat (1) menghasilkan simpulan yang "
          "bertentangan, dilakukan pendalaman atau penggunaan pertimbangan profesional."))
A(ayat(3, "Alasan penetapan simpulan sebagaimana dimaksud pada ayat (2) wajib diuraikan dan direkam "
          "pada MR KABAR."))
A(ayat(4, "Setiap unsur yang disimpulkan kurang memadai disusun RTP atas kelemahan lingkungan "
          "pengendalian."))
A(pasal(34))''')

# ══════════════════════════════════════════════════════════════════════
# TAHAP 6 — laporan pembinaan Komite sebagai jenis laporan keempat
# ══════════════════════════════════════════════════════════════════════
g('A(bagian("Kelima", "Tata Cara Penyampaian"))',
  '''A(bagian("Kelima", "Laporan Pembinaan Komite Pengelolaan Risiko"))
A(pasal(908))
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

A(bagian("Keenam", "Tata Cara Penyampaian"))''')

io.open(F, "w", encoding="utf-8").write(s)
print(f"Tahap 3-6: {n[0]} bagian disunting, 6 Pasal baru (903-908)")
