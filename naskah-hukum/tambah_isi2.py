"""Sisipkan delapan ilustrasi berwarna tahap kedua ke naskah."""
from pathlib import Path

f = Path(__file__).parent / "naskah.py"
t = f.read_text(encoding="utf-8")

NAMA = ["struktur", "tahapan", "penilaian", "rtp", "spbe", "matriks",
        "peta", "kode", "jenjang", "sebab", "respons", "unsur", "siklus", "lapor"]
t = t.replace(
    'DAFTAR_GAMBAR = [(f"rIdG{i}", str(GBR / f"{n}.jpeg")) for i, n in enumerate(\n'
    '    ["struktur", "tahapan", "penilaian", "rtp", "spbe", "matriks"], 1)]\n'
    'RID = {n: f"rIdG{i}" for i, n in enumerate(\n'
    '    ["struktur", "tahapan", "penilaian", "rtp", "spbe", "matriks"], 1)}',
    f'NAMA_GAMBAR = {NAMA!r}\n'
    'DAFTAR_GAMBAR = [(f"rIdG{i}", str(GBR / f"{n}.jpeg")) for i, n in enumerate(NAMA_GAMBAR, 1)]\n'
    'RID = {n: f"rIdG{i}" for i, n in enumerate(NAMA_GAMBAR, 1)}')

# jenjang -> setelah tiga sub-bagian Penetapan Konteks pada Lampiran I
t = t.replace(
    'A(P("C.  Struktur Analisis Risiko", rata="left", b=True, after=120))',
    'A(gambar(RID["jenjang"], str(GBR / "jenjang.jpeg"),\n'
    '         "Gambar 1. Tingkatan Risiko dan sumber Penetapan Konteks"))\n'
    'A(P("C.  Struktur Analisis Risiko", rata="left", b=True, before=200, after=120))', 1)

# sebab -> penutup bagian C Lampiran I
t = t.replace(
    '''      "keamanan. Faktor internal antara lain keterbatasan anggaran, kompetensi "
      "sumber daya manusia, keterbatasan sarana dan prasarana, serta kebijakan "
      "dan prosedur yang belum memadai."))''',
    '''      "keamanan. Faktor internal antara lain keterbatasan anggaran, kompetensi "
      "sumber daya manusia, keterbatasan sarana dan prasarana, serta kebijakan "
      "dan prosedur yang belum memadai."))
A(gambar(RID["sebab"], str(GBR / "sebab.jpeg"),
         "Gambar 2. Kategori penyebab Risiko"))''')

# respons -> setelah langkah kerja RTP
t = t.replace(
    '''A(gambar(RID["rtp"], str(GBR / "rtp.jpeg"),
         "Gambar 4. Langkah kerja penyusunan Rencana Tindak Pengendalian"))''',
    '''A(gambar(RID["rtp"], str(GBR / "rtp.jpeg"),
         "Gambar 6. Langkah kerja penyusunan Rencana Tindak Pengendalian"))
A(par("Pilihan respons Risiko yang tersedia dalam menyusun Rencana Tindak Pengendalian adalah "
      "sebagai berikut."))
A(gambar(RID["respons"], str(GBR / "respons.jpeg"), "Gambar 7. Pilihan respons Risiko"))''')

# siklus + lapor -> Lampiran IX (sistematika laporan)
t = t.replace(
    '''A(par("Laporan penerapan Manajemen Risiko disusun dengan sistematika sebagai berikut dan dihasilkan "
      "melalui MR KABAR.", after=200))''',
    '''A(par("Pemantauan dilaksanakan setiap triwulan dan bermuara pada laporan tahunan.", after=140))
A(gambar(RID["siklus"], str(GBR / "siklus.jpeg"), "Gambar 11. Siklus pemantauan dan pelaporan"))
A(gambar(RID["lapor"], str(GBR / "lapor.jpeg"),
         "Gambar 12. Alur penyampaian laporan penerapan Manajemen Risiko"))
A(par("Laporan penerapan Manajemen Risiko disusun dengan sistematika sebagai berikut dan dihasilkan "
      "melalui MR KABAR.", after=200))''')

# peta -> Lampiran VI (peringkat risiko)
t = t.replace(
    '''A(par("Risiko dengan peringkat tinggi dan sangat tinggi wajib ditetapkan sebagai Risiko Prioritas "
      "dan disusun RTP-nya, kecuali ditentukan lain berdasarkan Selera Risiko yang telah ditetapkan."))''',
    '''A(par("Risiko dengan peringkat tinggi dan sangat tinggi wajib ditetapkan sebagai Risiko Prioritas "
      "dan disusun RTP-nya, kecuali ditentukan lain berdasarkan Selera Risiko yang telah "
      "ditetapkan.", after=160))
A(par("Seluruh Risiko yang telah dinilai disebar pada matriks sehingga terbentuk peta Risiko. "
      "Gambar berikut merupakan peta Risiko Pemerintah Kabupaten Aceh Barat tahun 2025 sebagai "
      "contoh pembacaan.", after=140))
A(gambar(RID["peta"], str(GBR / "peta.jpeg"),
         "Gambar 9. Contoh peta Risiko - sebaran 258 Risiko teridentifikasi tahun 2025"))''')

# kode -> Lampiran VII
t = t.replace(
    '''A(par("Contoh: Kode Risiko RSP.26.30.30.03 dibaca sebagai Risiko strategis Pemerintah Kabupaten, "''',
    '''A(gambar(RID["kode"], str(GBR / "kode.jpeg"), "Gambar 10. Susunan Kode Risiko"))
A(par("Contoh: Kode Risiko RSP.26.30.30.03 dibaca sebagai Risiko strategis Pemerintah Kabupaten, "''')

# unsur -> Lampiran VIII
t = t.replace(
    '''      "jawaban, dengan simpulan memadai apabila modus bernilai 3 atau 4.", after=200))''',
    '''      "jawaban, dengan simpulan memadai apabila modus bernilai 3 atau 4.", after=160))
A(gambar(RID["unsur"], str(GBR / "unsur.jpeg"),
         "Gambar 11. Delapan unsur lingkungan pengendalian yang dievaluasi"))''')

f.write_text(t, encoding="utf-8")
compile(t, str(f), "exec")
print("naskah.py: 8 ilustrasi tahap kedua disisipkan (total 14)")
