"""Tahap kedua: Bagian dan Pasal baru pada BAB V, BAB VII, dan BAB VIII."""
from pathlib import Path

f = Path(__file__).parent / "naskah.py"
t = f.read_text(encoding="utf-8")

if "Program Pembangunan Bupati\"))" in t:
    print("tahap 2 sudah dijalankan, tidak diulang")
    raise SystemExit

# rujukan pada Bagian Unit Kepatuhan menunjuk Pasal laporan pemantauan
t = t.replace('"menyusun laporan pemantauan sebagaimana dimaksud dalam Pasal 42; dan"',
              '"menyusun laporan pemantauan sebagaimana dimaksud dalam Pasal 46; dan"', 1)

# ── BAB V: keterkaitan dengan Program Pembangunan Bupati ───────────────
PROGRAM = '''A(bagian("Keenam", "Keterkaitan Risiko Prioritas dengan Program Pembangunan Bupati"))
A(pasal(26))
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

A(pasal(27))
A(ayat(1, "UPR mengusulkan keterkaitan atau pelepasan keterkaitan sebagaimana dimaksud dalam "
          "Pasal 26 kepada Administrator melalui MR KABAR."))
A(ayat(2, "Usulan sebagaimana dimaksud pada ayat (1) hanya dapat diajukan atas Risiko yang berada "
          "dalam register Risiko SKPK yang bersangkutan."))
A(ayat(3, "Administrator menyetujui atau menolak usulan sebagaimana dimaksud pada ayat (1) dengan "
          "mempertimbangkan:"))
for h, t in zip("abc", [
    "kesesuaian uraian Risiko dengan keluaran Program Pembangunan Bupati yang diusulkan;",
    "peringkat Risiko hasil Evaluasi Risiko; dan",
    "kelengkapan dan kebenaran data Risiko yang direkam.",
]):
    A(huruf(h, t, kiri=1021))
A(ayat(4, "Keterkaitan berlaku sejak usulan disetujui Administrator."))
A(ayat(5, "Penolakan usulan sebagaimana dimaksud pada ayat (3) disertai alasan dan disampaikan "
          "kepada UPR pengusul melalui MR KABAR."))
A(ayat(6, "Seluruh usulan, persetujuan, dan penolakan sebagaimana dimaksud pada ayat (1) sampai "
          "dengan ayat (5) terekam dalam MR KABAR sebagai jejak audit."))

'''
JANGKAR = 'A(bagian("Keenam", "Rencana Tindak Pengendalian"))'
assert JANGKAR in t, "Bagian RTP tidak ditemukan"
t = t.replace(JANGKAR, PROGRAM + 'A(bagian("Ketujuh", "Rencana Tindak Pengendalian"))', 1)
t = t.replace('A(bagian("Ketujuh", "Pemantauan"))', 'A(bagian("Kedelapan", "Pemantauan"))', 1)

# ── BAB V: pelaporan Kejadian Risiko oleh pegawai dan masyarakat ───────
LAPOR = '''A(pasal(32))
A(ayat(1, "Selain pencatatan Kejadian Risiko oleh UPR sebagaimana dimaksud dalam Pasal 31, pegawai "
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

'''
JANGKAR = 'A(bagian("Kedelapan", "Informasi dan Komunikasi"))'
assert JANGKAR in t, "Bagian Informasi dan Komunikasi tidak ditemukan"
t = t.replace(JANGKAR, LAPOR + 'A(bagian("Kesembilan", "Informasi dan Komunikasi"))', 1)
print("BAB V: Bagian Program Pembangunan Bupati dan Pasal pelaporan Kejadian Risiko ditambahkan")

# ── BAB VII: Data Umum ─────────────────────────────────────────────────
DATA_UMUM = '''A(bagian("Keempat", "Data Umum"))
A(pasal(39))
A(ayat(1, "Setiap SKPK merekam Data Umum pada MR KABAR sebelum merekam dokumen Manajemen Risiko."))
A(ayat(2, "Data Umum sebagaimana dimaksud pada ayat (1) digunakan sebagai sumber kepala dokumen dan "
          "blok tanda tangan pada seluruh dokumen Manajemen Risiko yang dicetak melalui MR KABAR."))
A(ayat(3, "Perubahan pejabat penanda tangan direkam dalam Data Umum paling lambat 14 (empat belas) "
          "hari kerja sejak pelantikan."))
A(ayat(4, "Kebenaran Data Umum menjadi tanggung jawab Kepala SKPK yang bersangkutan."))

'''
JANGKAR = 'A(bagian("Keempat", "Keamanan Informasi dan Pelindungan Data Pribadi"))'
assert JANGKAR in t, "Bagian Keamanan Informasi tidak ditemukan"
t = t.replace(JANGKAR, DATA_UMUM
              + 'A(bagian("Kelima", "Keamanan Informasi dan Pelindungan Data Pribadi"))', 1)
t = t.replace('A(bagian("Kelima", "Keterpaduan"))', 'A(bagian("Keenam", "Keterpaduan"))', 1)
t = t.replace('A(bagian("Keenam", "Pengelola"))', 'A(bagian("Ketujuh", "Pengelola"))', 1)
print("BAB VII: Bagian Data Umum ditambahkan")

f.write_text(t, encoding="utf-8")
compile(t, str(f), "exec")
print("tahap 2 selesai")
