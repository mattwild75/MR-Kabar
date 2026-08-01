"""Empat perbaikan hasil pemeriksaan ulang naskah.

  1. Pasal 21 ayat (3) menunjuk Lampiran VIII untuk kode urusan DAN kode
     entitas penilai. Keliru: Lampiran VIII hanya menerangkan susunan Kode
     Risiko, kode urusan ada pada Lampiran II, dan kode entitas penilai ada
     pada Lampiran XIV.
  2. Baris ENTITAS pada tabel Lampiran VIII tidak menunjuk ke mana pun,
     padahal daftar kodenya ada pada Lampiran XIV.
  3. Toleransi Risiko dirumuskan pada Pasal 1 tetapi tidak pernah dipakai
     dalam batang tubuh. Menurut angka 107 Lampiran II Undang-Undang Nomor 12
     Tahun 2011, rumusan pengertian hanya dimuat apabila istilahnya memang
     dipakai. Istilah ini dioperasionalkan pada Pasal 7, sekaligus menjadi
     dasar kolom Toleransi pada Lampiran VI.
  4. Lampiran XII sampai dengan XVIII tidak pernah dinyatakan sebagai bagian
     tidak terpisahkan dalam satu pasal pun, padahal Lampiran XII memuat
     bentuk baku seluruh formulir. Dinyatakan pada Pasal 17 dan Pasal 45.
"""
from pathlib import Path

f = Path(__file__).parent / "naskah.py"
t = f.read_text(encoding="utf-8")

if "Lampiran XVIII yang merupakan" in t:
    print("perbaikan rujukan sudah dijalankan, tidak diulang")
    raise SystemExit

# ── 1. Pasal 21 ayat (3) ──
LAMA = '''A(ayat(3, "Kode urusan dan kode entitas penilai tercantum dalam Lampiran VIII yang merupakan bagian "
          "tidak terpisahkan dari Peraturan Bupati ini."))'''
BARU = '''A(ayat(3, "Susunan Kode Risiko sebagaimana dimaksud pada ayat (1) tercantum dalam Lampiran VIII, "
          "kode urusan tercantum dalam Lampiran II, dan kode entitas penilai tercantum dalam "
          "Lampiran XIV, yang seluruhnya merupakan bagian tidak terpisahkan dari Peraturan Bupati "
          "ini."))'''
assert LAMA in t, "Pasal 21 ayat (3) tidak ditemukan"
t = t.replace(LAMA, BARU, 1)
print("Pasal 21 ayat (3): rujukan kode urusan dan kode entitas dibetulkan")

# ── 2. baris ENTITAS pada Lampiran VIII ──
LAMA = '''    ["ENTITAS", "2 (dua) digit kode SKPK selaku entitas penilai Risiko"],'''
BARU = '''    ["ENTITAS", "2 (dua) digit kode SKPK selaku entitas penilai Risiko sebagaimana tercantum "
                "dalam Lampiran XIV"],'''
assert LAMA in t, "baris ENTITAS tidak ditemukan"
t = t.replace(LAMA, BARU, 1)
print("Lampiran VIII: baris ENTITAS menunjuk Lampiran XIV")

# ── 3. Toleransi Risiko dioperasionalkan ──
LAMA = '''A(ayat(3, "Risiko dengan Skala Risiko di atas Selera Risiko ditetapkan sebagai Risiko Prioritas dan "'''
CARI = t.index(LAMA)
AKHIR = t.index("))", t.index('"', CARI + len(LAMA))) + 2
SISIP = '''
A(ayat(4, "Bersamaan dengan penetapan Selera Risiko sebagaimana dimaksud pada ayat (1) dan ayat (2), "
          "ditetapkan pula Toleransi Risiko sebagai batas penyimpangan dari Selera Risiko yang masih "
          "dapat diterima."))
A(ayat(5, "Toleransi Risiko sebagaimana dimaksud pada ayat (4) menjadi dasar pengisian kolom "
          "toleransi pada kriteria kemungkinan terjadinya Risiko sebagaimana tercantum dalam "
          "Lampiran VI."))'''
t = t[:AKHIR] + SISIP + t[AKHIR:]
print("Pasal 7: Toleransi Risiko dioperasionalkan")

# ── 4. Lampiran XII dan seterusnya dinyatakan ──
LAMA = 'A(ayat(2, "Seluruh tahapan sebagaimana dimaksud pada ayat (1) dilaksanakan melalui MR KABAR."))'
BARU = '''A(ayat(2, "Seluruh tahapan sebagaimana dimaksud pada ayat (1) dilaksanakan melalui MR KABAR."))
A(ayat(3, "Bentuk baku formulir untuk setiap tahapan sebagaimana dimaksud pada ayat (1) beserta "
          "uraian kolomnya tercantum dalam Lampiran XII yang merupakan bagian tidak terpisahkan "
          "dari Peraturan Bupati ini."))
A(ayat(4, "Contoh pengisian formulir sebagaimana dimaksud pada ayat (3) tercantum dalam Lampiran "
          "XIII, Lampiran XV, Lampiran XVII, dan Lampiran XVIII yang merupakan bagian tidak "
          "terpisahkan dari Peraturan Bupati ini."))'''
assert LAMA in t, "Pasal 17 ayat (2) tidak ditemukan"
t = t.replace(LAMA, BARU, 1)

LAMA = '''A(ayat(3, "Sistematika laporan sebagaimana dimaksud pada ayat (1) tercantum dalam Lampiran X yang "
          "merupakan bagian tidak terpisahkan dari Peraturan Bupati ini."))'''
BARU = '''A(ayat(3, "Sistematika laporan sebagaimana dimaksud pada ayat (1) tercantum dalam Lampiran X yang "
          "merupakan bagian tidak terpisahkan dari Peraturan Bupati ini."))
A(ayat(4, "Contoh laporan sebagaimana dimaksud pada ayat (1) tercantum dalam Lampiran XVI yang "
          "merupakan bagian tidak terpisahkan dari Peraturan Bupati ini."))'''
assert LAMA in t, "Pasal 45 ayat (3) tidak ditemukan"
t = t.replace(LAMA, BARU, 1)
print("Pasal 17 dan Pasal 45: Lampiran XII sampai dengan XVIII dinyatakan")

f.write_text(t, encoding="utf-8")
compile(t, str(f), "exec")
print("selesai")
