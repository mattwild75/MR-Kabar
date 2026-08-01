"""Tahap ketiga: BAB VIII dipecah menjadi tiga jenis laporan sesuai Perdep
PPKD Nomor 4 Tahun 2019, dan daftar modul pada Pasal 37 dilengkapi.
"""
from pathlib import Path

f = Path(__file__).parent / "naskah.py"
t = f.read_text(encoding="utf-8")

if "Laporan Pemantauan Unit Kepatuhan" in t:
    print("tahap 3 sudah dijalankan, tidak diulang")
    raise SystemExit

# ── Pasal 37: modul yang belum tercantum ───────────────────────────────
MODUL_LAMA = '''    "pelaporan dan pencetakan dokumen Manajemen Risiko; dan",
    "penyajian informasi Risiko bagi pimpinan.",'''
MODUL_BARU = '''    "keterkaitan Risiko Prioritas dengan Program Pembangunan Bupati;",
    "pelaporan Kejadian Risiko oleh pegawai dan masyarakat;",
    "perekaman Data Umum;",
    "pelaporan dan pencetakan dokumen Manajemen Risiko; dan",
    "penyajian informasi Risiko bagi pimpinan.",'''
assert MODUL_LAMA in t, "daftar modul Pasal 37 tidak ditemukan"
t = t.replace(MODUL_LAMA, MODUL_BARU, 1)
# huruf pada daftar modul bertambah dari 7 menjadi 10
t = t.replace('for h, tx in zip("abcdefg", [\n    "Penetapan Konteks Risiko;"',
              'for h, tx in zip("abcdefghij", [\n    "Penetapan Konteks Risiko;"', 1)
t = t.replace('for h, t in zip("abcdefg", [\n    "Penetapan Konteks Risiko;"',
              'for h, t in zip("abcdefghij", [\n    "Penetapan Konteks Risiko;"', 1)
print("Pasal 37: 3 modul ditambahkan")

# ── BAB VIII: tiga jenis laporan ───────────────────────────────────────
LAMA_AWAL = 'A(bab("VIII", "PELAPORAN"))'
LAMA_AKHIR = '''A(ayat(3, "Sekretaris Daerah menyampaikan rekapitulasi laporan penyelenggaraan Manajemen Risiko "
          "kepada Bupati paling lambat akhir bulan Februari tahun berikutnya."))'''
i = t.index(LAMA_AWAL)
j = t.index(LAMA_AKHIR) + len(LAMA_AKHIR)

BARU = '''A(bab("VIII", "PELAPORAN"))
A(bagian("Kesatu", "Umum"))
A(pasal(43))
A(ayat(1, "Laporan penerapan Manajemen Risiko terdiri atas:"))
for h, tx in zip("abc", [
    "laporan pelaksanaan penilaian Risiko;",
    "laporan berkala pengelolaan Risiko; dan",
    "laporan pemantauan Unit Kepatuhan.",
]):
    A(huruf(h, tx, kiri=1021))
A(ayat(2, "Laporan sebagaimana dimaksud pada ayat (1) disusun dan disampaikan melalui MR KABAR."))
A(ayat(3, "Sistematika laporan sebagaimana dimaksud pada ayat (1) tercantum dalam Lampiran IX yang "
          "merupakan bagian tidak terpisahkan dari Peraturan Bupati ini."))

A(bagian("Kedua", "Laporan Pelaksanaan Penilaian Risiko"))
A(pasal(44))
A(ayat(1, "UPR menyusun laporan pelaksanaan penilaian Risiko sebagaimana dimaksud dalam Pasal 43 "
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
A(pasal(45))
A(ayat(1, "UPR menyusun laporan berkala pengelolaan Risiko sebagaimana dimaksud dalam Pasal 43 "
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
A(pasal(46))
A(ayat(1, "Unit Kepatuhan menyusun laporan pemantauan sebagaimana dimaksud dalam Pasal 43 ayat (1) "
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

A(bagian("Kelima", "Tata Cara Penyampaian"))
A(pasal(47))
A(ayat(1, "Laporan tahunan sebagaimana dimaksud dalam Pasal 45 dan Pasal 46 disampaikan paling "
          "lambat akhir bulan Januari tahun berikutnya."))
A(ayat(2, "Penyampaian seluruh laporan sebagaimana dimaksud dalam Pasal 43 ayat (1) dilakukan "
          "melalui MR KABAR."))
A(ayat(3, "Sekretaris Daerah menyampaikan rekapitulasi laporan penyelenggaraan Manajemen Risiko "
          "kepada Bupati paling lambat akhir bulan Februari tahun berikutnya."))'''

t = t[:i] + BARU + t[j:]
f.write_text(t, encoding="utf-8")
compile(t, str(f), "exec")
print("BAB VIII dipecah menjadi tiga jenis laporan")
