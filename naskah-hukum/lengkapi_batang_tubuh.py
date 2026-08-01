"""Melengkapi batang tubuh Perbup atas hasil pembandingan dengan Perdep PPKD
Nomor 4 Tahun 2019 dan dengan modul MR KABAR yang sungguh berjalan.

Yang ditambahkan:
  1. Empat definisi baru: Toleransi Risiko, Unit Kepatuhan, Program
     Pembangunan Bupati, dan Data Umum.
  2. BAB IV: tiga lini pertahanan dinyatakan tegas pada Pasal 8, dan
     Unit Kepatuhan sebagai lini kedua diberi Bagian tersendiri.
  3. BAB V: Bagian baru tentang keterkaitan Risiko Prioritas dengan
     Program Pembangunan Bupati, termasuk alur usulan dan persetujuan;
     serta Pasal baru tentang pelaporan Kejadian Risiko oleh pegawai
     dan masyarakat.
  4. BAB VII: Pasal baru tentang Data Umum.
  5. BAB VIII: dipecah menjadi tiga jenis laporan sesuai Perdep.

Penomoran Pasal 1 sampai dengan 45 dinaikkan menjadi 1 sampai dengan 53
beserta seluruh rujukan silangnya, mengikuti angka 122 dan angka 126
Lampiran II Undang-Undang Nomor 12 Tahun 2011 sebagaimana telah diubah
dengan Undang-Undang Nomor 13 Tahun 2022.
"""
import re
from pathlib import Path

f = Path(__file__).parent / "naskah.py"
t = f.read_text(encoding="utf-8")

if "Unit Kepatuhan" in t:
    print("batang tubuh sudah dilengkapi, tidak diulang")
    raise SystemExit

# ── 1. penomoran ulang Pasal ───────────────────────────────────────────
# batas atas tiap penggal lama -> pergeseran nomor
GESER = [(13, 0), (24, 1), (28, 3), (34, 4), (38, 5), (45, 8)]


def baru(n):
    for batas, tambah in GESER:
        if n <= batas:
            return n + tambah
    raise ValueError(f"Pasal {n} di luar jangkauan")


t = re.sub(r"A\(pasal\((\d+)\)\)", lambda m: f"A(pasal({baru(int(m.group(1)))}))", t)
t = re.sub(r"Pasal (\d+)", lambda m: f"Pasal {baru(int(m.group(1)))}", t)
print("Pasal 1-45 dinomori ulang menjadi 1-53 berikut rujukan silangnya")

# ── 2. definisi baru ───────────────────────────────────────────────────
SISIP_DEF = [
    ("    \"Selera Risiko adalah tingkat Risiko yang bersedia diterima Pemerintah Kabupaten atau SKPK dalam \"\n"
     "    \"rangka pencapaian tujuan.\",\n",
     "    \"Toleransi Risiko adalah batas penyimpangan dari Selera Risiko yang masih dapat diterima "
     "Pemerintah Kabupaten atau SKPK tanpa mengganggu pencapaian tujuan dan sasaran.\",\n"),
    ("    \"Pengelola Risiko adalah pejabat atau pegawai yang ditugaskan membantu Pemilik Risiko dalam \"\n"
     "    \"melaksanakan proses Manajemen Risiko.\",\n",
     "    \"Unit Kepatuhan adalah unit kerja yang menjalankan fungsi lini kedua dalam pengelolaan Risiko, "
     "yaitu memantau dan menelaah penerapan Manajemen Risiko oleh UPR tanpa mengambil alih tanggung "
     "jawab UPR.\",\n"),
    ("    \"Kejadian Risiko adalah peristiwa Risiko yang benar-benar terjadi dan berdampak pada pencapaian \"\n"
     "    \"tujuan dan sasaran.\",\n",
     "    \"Program Pembangunan Bupati adalah program prioritas pembangunan Daerah yang menjadi penjabaran "
     "visi dan misi Bupati sebagaimana tercantum dalam Rencana Pembangunan Jangka Menengah Daerah.\",\n"),
    ("    \"Dokumen Elektronik Manajemen Risiko adalah setiap informasi elektronik yang dibuat, diteruskan, \"\n"
     "    \"dikirimkan, diterima, atau disimpan melalui MR KABAR dalam rangka penyelenggaraan Manajemen \"\n"
     "    \"Risiko.\",\n",
     "    \"Data Umum adalah data identitas kertas kerja Manajemen Risiko pada masing-masing SKPK yang "
     "memuat nama SKPK, tahun penilaian, serta nama dan jabatan pejabat penanda tangan dokumen "
     "Manajemen Risiko.\",\n"),
]
for jangkar, tambahan in SISIP_DEF:
    assert jangkar in t, f"jangkar definisi tidak ditemukan: {jangkar[:60]}"
    t = t.replace(jangkar, jangkar + tambahan, 1)
print("4 definisi baru disisipkan pada Pasal 1")

# ── 3. BAB IV: tiga lini dan Unit Kepatuhan ────────────────────────────
PASAL8_LAMA = '''A(par("Struktur pengelolaan Risiko pada Pemerintah Kabupaten terdiri atas:", after=100))
for h, t in zip("abcde", [
    "Komite Pengelolaan Risiko tingkat Pemerintah Kabupaten;",
    "Koordinator Penyelenggaraan Pengelolaan Risiko;",
    "UPR;",
    "Pengelola Risiko; dan",
    "Penanggung Jawab Pengawasan.",
]):
    A(huruf(h, t))'''
PASAL8_BARU = '''A(ayat(1, "Struktur pengelolaan Risiko pada Pemerintah Kabupaten terdiri atas:"))
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
          "menghapuskan tanggung jawab UPR sebagai pemilik Risiko."))'''
assert PASAL8_LAMA in t, "Pasal 8 tidak ditemukan"
t = t.replace(PASAL8_LAMA, PASAL8_BARU, 1)

BAGIAN_UNIT_KEPATUHAN = '''A(bagian("Keenam", "Unit Kepatuhan"))
A(pasal(14))
A(ayat(1, "Asisten Sekretaris Daerah yang membidangi urusan pemerintahan dan keistimewaan bertindak "
          "sebagai Unit Kepatuhan."))
A(ayat(2, "Unit Kepatuhan sebagaimana dimaksud pada ayat (1) bertugas:"))
for h, t in zip("abcde", [
    "memantau kepatuhan UPR terhadap tahapan proses Manajemen Risiko sebagaimana diatur dalam "
    "Peraturan Bupati ini;",
    "menelaah kewajaran hasil Analisis Risiko dan kelayakan RTP yang disusun UPR;",
    "memantau realisasi RTP dan perkembangan Kejadian Risiko melalui MR KABAR;",
    "menyusun laporan pemantauan sebagaimana dimaksud dalam Pasal 42; dan",
    "menyampaikan saran perbaikan kepada Koordinator Penyelenggaraan Pengelolaan Risiko.",
]):
    A(huruf(h, t, kiri=1021))
A(ayat(3, "Dalam melaksanakan tugas sebagaimana dimaksud pada ayat (2), Unit Kepatuhan tidak "
          "melaksanakan sendiri proses Manajemen Risiko yang menjadi tanggung jawab UPR."))

'''
JANGKAR = 'A(bagian("Keenam", "Penanggung Jawab Pengawasan"))'
assert JANGKAR in t
t = t.replace(JANGKAR, BAGIAN_UNIT_KEPATUHAN
              + 'A(bagian("Ketujuh", "Penanggung Jawab Pengawasan"))', 1)
print("BAB IV: tiga lini pertahanan dan Bagian Unit Kepatuhan ditambahkan")

f.write_text(t, encoding="utf-8")
compile(t, str(f), "exec")
print("tahap 1 selesai")
