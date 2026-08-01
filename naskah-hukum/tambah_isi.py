"""Sisipkan ilustrasi berwarna dan lampiran contoh pengisian ke naskah."""
from pathlib import Path

f = Path(__file__).parent / "naskah.py"
t = f.read_text(encoding="utf-8")

# 1. import tambahan
t = t.replace("                  sectpr, paragraf_pemisah_bagian,",
              "                  sectpr, paragraf_pemisah_bagian, gambar,")

# 2. daftar gambar + pemuatan contoh
t = t.replace('KELUARAN = Path(r"C:\\Users\\Nurhikmat Muhammad\\OneDrive\\Desktop\\MR Kabar") / \\',
              'GBR = Path(__file__).parent / "gambar"\n'
              'CONTOH = json.loads((BASIS / "contoh.json").read_text(encoding="utf-8"))\n'
              'DAFTAR_GAMBAR = [(f"rIdG{i}", str(GBR / f"{n}.jpeg")) for i, n in enumerate(\n'
              '    ["struktur", "tahapan", "penilaian", "rtp", "spbe", "matriks"], 1)]\n'
              'RID = {n: f"rIdG{i}" for i, n in enumerate(\n'
              '    ["struktur", "tahapan", "penilaian", "rtp", "spbe", "matriks"], 1)}\n'
              'KELUARAN = Path(r"C:\\Users\\Nurhikmat Muhammad\\OneDrive\\Desktop\\MR Kabar") / \\')

# 3. Lampiran I diperluas dengan lima ilustrasi
lama = '''A(P("C.  Struktur Analisis Risiko", rata="left", b=True, after=120))'''
baru = '''A(P("C.  Struktur Analisis Risiko", rata="left", b=True, after=120))'''
t = t.replace(lama, baru)

sisip = '''
A(P("D.  Struktur Pengelolaan Risiko", rata="left", b=True, before=200, after=120))
A(par("Pengelolaan Risiko pada Pemerintah Kabupaten dijalankan secara berjenjang. Bupati memimpin "
      "Komite Pengelolaan Risiko tingkat Pemerintah Kabupaten, Sekretaris Daerah bertindak sebagai "
      "Koordinator Penyelenggaraan, dan Inspektorat menjalankan fungsi pengawasan sekaligus wali "
      "data aplikasi. Pelaksana teknis pada setiap tingkatan adalah Unit Pemilik Risiko yang "
      "dibantu Pengelola Risiko."))
A(gambar(RID["struktur"], str(GBR / "struktur.jpeg"),
         "Gambar 1. Struktur pengelolaan Risiko Pemerintah Kabupaten Aceh Barat"))

A(P("E.  Tahapan Proses Manajemen Risiko", rata="left", b=True, before=200, after=120))
A(par("Proses Manajemen Risiko berjalan sebagai satu rangkaian yang berulang setiap tahun. Keluaran "
      "satu tahapan menjadi masukan tahapan berikutnya, dan seluruhnya direkam pada MR KABAR "
      "sehingga tidak ada tahapan yang terputus dokumentasinya."))
A(gambar(RID["tahapan"], str(GBR / "tahapan.jpeg"),
         "Gambar 2. Tahapan proses Manajemen Risiko"))

A(P("F.  Langkah Kerja Penilaian Risiko Urusan Wajib dan Urusan Pilihan",
    rata="left", b=True, before=200, after=120))
A(par("Penilaian Risiko atas urusan wajib pelayanan dasar, urusan wajib bukan pelayanan dasar, "
      "urusan pilihan, maupun unsur pendukung ditempuh melalui tujuh langkah berikut. Urutan ini "
      "berlaku sama untuk ketiga tingkatan Risiko, yang membedakan hanya sumber tujuan dan "
      "sasarannya."))
A(gambar(RID["penilaian"], str(GBR / "penilaian.jpeg"),
         "Gambar 3. Langkah kerja penilaian Risiko urusan wajib dan urusan pilihan"))

A(P("G.  Langkah Kerja Penyusunan Rencana Tindak Pengendalian",
    rata="left", b=True, before=200, after=120))
A(par("Rencana Tindak Pengendalian disusun hanya atas Risiko Prioritas. Penyusunannya tidak berhenti "
      "pada mencatat kegiatan, melainkan menelusuri akar penyebab lebih dahulu, menilai pengendalian "
      "yang sudah berjalan, baru merancang pengendalian tambahan yang benar-benar menutup celah."))
A(gambar(RID["rtp"], str(GBR / "rtp.jpeg"),
         "Gambar 4. Langkah kerja penyusunan Rencana Tindak Pengendalian"))

A(P("H.  Kedudukan Aplikasi MR KABAR", rata="left", b=True, before=200, after=120))
A(par("Aplikasi MR KABAR berkedudukan sebagai basis data Risiko tunggal Pemerintah Kabupaten. "
      "Seluruh SKPK merekam prosesnya pada aplikasi yang sama, sehingga Inspektorat dan pimpinan "
      "membaca kondisi Risiko yang mutakhir tanpa perlu menghimpun berkas satu per satu."))
A(gambar(RID["spbe"], str(GBR / "spbe.jpeg"),
         "Gambar 5. Kedudukan aplikasi MR KABAR dalam penyelenggaraan Manajemen Risiko"))

# ── LAMPIRAN II'''
t = t.replace("\n# ── LAMPIRAN II", sisip, 1)

# 4. Ilustrasi matriks pada Lampiran V
t = t.replace('''A(tabel([2200, 1420, 1420, 1420, 1420, 1420], baris, p=18,
        rata_sel=["left", "center", "center", "center", "center", "center"]))''',
              '''A(gambar(RID["matriks"], str(GBR / "matriks.jpeg"),
         "Gambar 6. Matriks analisis Risiko 5 x 5 beserta peringkat Risiko"))
A(P("", after=160))
A(tabel([2200, 1420, 1420, 1420, 1420, 1420], baris, p=18,
        rata_sel=["left", "center", "center", "center", "center", "center"]))''')

# 5. tulis() membawa daftar gambar
t = t.replace('tulis(KELUARAN, "".join(d), sect_akhir=sectpr(lanskap=True, halaman_pertama_beda=False))',
              'tulis(KELUARAN, "".join(d), sect_akhir=sectpr(lanskap=True, halaman_pertama_beda=False),\n'
              '      daftar_gambar=DAFTAR_GAMBAR)')

f.write_text(t, encoding="utf-8")
compile(t, str(f), "exec")
print("naskah.py: 6 ilustrasi berwarna disisipkan")
