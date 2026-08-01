"""Tiga perbaikan sekaligus pada penyusun naskah:

1. Gaya Heading 1 sampai 3 yang sungguhan, sehingga Panel Navigasi dan
   Daftar Isi otomatis Word berfungsi. Tampilannya sengaja dibuat persis
   sama dengan sebelumnya (Bookman Old Style 12, tebal, simetris) supaya
   tata letak naskah peraturan tidak berubah sedikit pun.
2. Gaya Caption beserta medan SEQ, sehingga keterangan gambar dan tabel
   bernomor otomatis dan dapat dirujuk silang lewat fitur Word.
3. Jabatan responden pada contoh Evaluasi Lingkungan Pengendalian
   diperbaiki mengikuti susunan organisasi yang sebenarnya menurut
   Peraturan Bupati Aceh Barat Nomor 17 Tahun 2024 tentang Kedudukan,
   Susunan Organisasi, Tugas, Fungsi, dan Tata Kerja Inspektorat
   Kabupaten Aceh Barat. Jabatan "Kepala Bidang" dan "Kepala Seksi" tidak
   ada pada Inspektorat -- keduanya jabatan pada Dinas atau Badan.
"""
from pathlib import Path

INTI = Path(__file__).parent / "inti.py"
NASKAH = Path(__file__).parent / "naskah.py"

# ── 1 & 2. gaya Heading dan Caption pada styles.xml ──
t = INTI.read_text(encoding="utf-8")

GAYA_BARU = """'<w:style w:type="paragraph" w:default="1" w:styleId="Normal">'
          '<w:name w:val="Normal"/><w:qFormat/></w:style>'
          + "".join(
              '<w:style w:type="paragraph" w:styleId="Heading%d">'
              '<w:name w:val="heading %d"/><w:basedOn w:val="Normal"/><w:qFormat/>'
              '<w:pPr><w:keepNext/><w:keepLines/><w:outlineLvl w:val="%d"/>'
              '<w:jc w:val="center"/></w:pPr>'
              '<w:rPr><w:rFonts w:ascii="Bookman Old Style" w:hAnsi="Bookman Old Style"/>'
              '<w:b/><w:color w:val="000000"/><w:sz w:val="24"/></w:rPr></w:style>'
              % (n, n, n - 1) for n in (1, 2, 3))
          + '<w:style w:type="paragraph" w:styleId="Caption">'
            '<w:name w:val="caption"/><w:basedOn w:val="Normal"/><w:qFormat/>'
            '<w:pPr><w:keepNext/><w:spacing w:after="200"/><w:jc w:val="center"/></w:pPr>'
            '<w:rPr><w:rFonts w:ascii="Bookman Old Style" w:hAnsi="Bookman Old Style"/>'
            '<w:i/><w:color w:val="000000"/><w:sz w:val="20"/></w:rPr></w:style>'
          + "</w:styles>")"""

LAMA = """'<w:style w:type="paragraph" w:default="1" w:styleId="Normal">'
          '<w:name w:val="Normal"/><w:qFormat/></w:style></w:styles>')"""
assert LAMA in t, "blok gaya tidak ditemukan"
t = t.replace(LAMA, GAYA_BARU)

# helper: paragraf dengan gaya bernama
t = t.replace('''def P(t="", rata="both", b=False, i=False, u=False, after=0, before=0,
      kiri=0, gantung=0, line=240, tab=None, p=24, potong=False, jaga=False):
    pr = "<w:pPr>"''',
              '''def P(t="", rata="both", b=False, i=False, u=False, after=0, before=0,
      kiri=0, gantung=0, line=240, tab=None, p=24, potong=False, jaga=False,
      gaya=None):
    pr = "<w:pPr>"
    if gaya:
        pr += f'<w:pStyle w:val="{gaya}"/>'
''')

# keterangan bernomor otomatis (medan SEQ) untuk gambar dan tabel
t = t.replace("def ttd_kanan(jabatan, nama, jarak=900):",
              '''def keterangan(jenis, teks):
    """Keterangan bergaya Caption dengan nomor otomatis lewat medan SEQ.

    Nomornya dihitung Word sendiri, sehingga menyisipkan gambar atau tabel
    baru di tengah naskah tidak membuat penomoran berikutnya salah, dan
    keterangan ini bisa dirujuk silang serta dikumpulkan menjadi daftar
    gambar atau daftar tabel lewat fitur bawaan Word.
    """
    return (f'<w:p><w:pPr><w:pStyle w:val="Caption"/></w:pPr>'
            f'<w:r><w:rPr>{FONT}<w:i/>{sz(20)}</w:rPr>'
            f'<w:t xml:space="preserve">{esc(jenis)} </w:t></w:r>'
            f'<w:fldSimple w:instr=" SEQ {esc(jenis)} \\\\* ARABIC ">'
            f'<w:r><w:rPr>{FONT}<w:i/>{sz(20)}</w:rPr><w:t>1</w:t></w:r></w:fldSimple>'
            f'<w:r><w:rPr>{FONT}<w:i/>{sz(20)}</w:rPr>'
            f'<w:t xml:space="preserve">. {esc(teks)}</w:t></w:r></w:p>')


def ttd_kanan(jabatan, nama, jarak=900):''')

# gambar() memakai keterangan bernomor otomatis
t = t.replace('    ket = P(keterangan, rata="center", i=True, p=20, after=200) if keterangan else ""',
              '    ket = keterangan_gambar(keterangan) if keterangan else ""')
t = t.replace("def gambar(rid, path, keterangan=\"\", lebar_inci=6.0):",
              "def keterangan_gambar(teks):\n"
              "    return keterangan(\"Gambar\", teks)\n"
              "\n"
              "\n"
              "def keterangan_tabel(teks):\n"
              "    return keterangan(\"Tabel\", teks)\n"
              "\n"
              "\n"
              "def gambar(rid, path, keterangan=\"\", lebar_inci=6.0):")

INTI.write_text(t, encoding="utf-8")
compile(t, str(INTI), "exec")
print("inti.py: gaya Heading 1-3, gaya Caption, dan keterangan bernomor otomatis")

# ── terapkan gaya Heading pada unsur naskah ──
t = INTI.read_text(encoding="utf-8")
t = t.replace('''def bab(nomor, judul):
    return P(f"BAB {nomor}", rata="center", b=True, before=240, after=0, jaga=True) + \\
           P(judul, rata="center", b=True, after=200, jaga=True)''',
              '''def bab(nomor, judul):
    return (P(f"BAB {nomor}", rata="center", b=True, before=240, after=0, jaga=True)
            + P(judul, rata="center", b=True, after=200, jaga=True, gaya="Heading1"))''')
t = t.replace('''def bagian(urut, judul):
    return P(f"Bagian {urut}", rata="center", b=True, before=160, after=0, jaga=True) + \\
           P(judul, rata="center", b=True, after=180, jaga=True)''',
              '''def bagian(urut, judul):
    return (P(f"Bagian {urut}", rata="center", b=True, before=160, after=0, jaga=True)
            + P(judul, rata="center", b=True, after=180, jaga=True, gaya="Heading2"))''')
t = t.replace('''def pasal(n):
    return P(f"Pasal {n}", rata="center", b=True, before=160, after=160, jaga=True)''',
              '''def pasal(n):
    return P(f"Pasal {n}", rata="center", b=True, before=160, after=160, jaga=True,
             gaya="Heading3")''')
INTI.write_text(t, encoding="utf-8")
compile(t, str(INTI), "exec")
print("inti.py: BAB -> Heading1, Bagian -> Heading2, Pasal -> Heading3")

# ── judul lampiran juga masuk struktur ──
n = NASKAH.read_text(encoding="utf-8")
n = n.replace('           P(judul_lampiran, rata="center", b=True, after=240)]',
              '           P(judul_lampiran, rata="center", b=True, after=240, gaya="Heading1")]')

# ── 3. jabatan responden sesuai SOTK Perbup 17/2024 ──
LAMA_JAB = '''_JAB = ["Sekretaris", "Kepala Bidang", "Kepala Sub Bagian", "Kepala Seksi",
        "Analis Kebijakan", "Pelaksana"]'''
BARU_JAB = '''# Jabatan mengikuti susunan organisasi Inspektorat Kabupaten Aceh Barat
# menurut Peraturan Bupati Aceh Barat Nomor 17 Tahun 2024. Jabatan
# "Kepala Bidang" dan "Kepala Seksi" tidak ada pada Inspektorat.
_JAB = ["Sekretaris",
        "Inspektur Pembantu I",
        "Inspektur Pembantu II",
        "Kepala Subbagian Analisis dan Evaluasi",
        "Kepala Subbagian Administrasi Umum dan Keuangan",
        "Auditor Ahli Muda"]'''
assert LAMA_JAB in n, "daftar jabatan tidak ditemukan"
n = n.replace(LAMA_JAB, BARU_JAB)

# penanggung jawab pada contoh RTP lingkungan pengendalian
n = n.replace('"Sekretaris SKPK"', '"Sekretaris"')
n = n.replace('("nama pengisi)", "Sekretaris"', '("nama pengisi)", "Sekretaris"')

NASKAH.write_text(n, encoding="utf-8")
compile(n, str(NASKAH), "exec")
print("naskah.py: jabatan responden diperbaiki sesuai Perbup 17/2024")
