"""Melengkapi BAB VII dengan hal-hal yang sudah berjalan di MR KABAR tetapi
belum berdasar dalam Perbup:

  - jenis Hak Akses, yang di aplikasi sudah terbagi menjadi Administrator,
    Pengelola Risiko SKPK, Pembaca, dan akun berkegunaan terbatas untuk
    pengisian kuesioner serta pelaporan Kejadian Risiko;
  - perekaman massal melalui berkas lembar sebar beserta persetujuan
    Administrator, yang sudah dijalankan lewat antrean permintaan impor;
  - penghapusan data yang bersifat sementara beserta pemulihannya; dan
  - jejak audit atas seluruh perubahan data.

Pasal 40 dan 41 disisipkan sehingga Pasal 40 sampai dengan 53 yang lama
bergeser menjadi 42 sampai dengan 55, berikut rujukan silangnya.
"""
import re
from pathlib import Path

f = Path(__file__).parent / "naskah.py"
t = f.read_text(encoding="utf-8")

if "Perekaman Massal" in t:
    print("BAB VII sudah dilengkapi, tidak diulang")
    raise SystemExit


def baru(n):
    return n + 2 if n >= 40 else n


t = re.sub(r"A\(pasal\((\d+)\)\)", lambda m: f"A(pasal({baru(int(m.group(1)))}))", t)
t = re.sub(r"Pasal (\d+)", lambda m: f"Pasal {baru(int(m.group(1)))}", t)
print("Pasal 40-53 digeser menjadi 42-55 berikut rujukan silangnya")

# ── Pasal 38: jenis Hak Akses ──
LAMA = 'A(ayat(2, "Hak Akses diberikan secara berjenjang sesuai dengan kewenangan Pengguna."))'
BARU = '''A(ayat(2, "Hak Akses diberikan secara berjenjang sesuai dengan kewenangan Pengguna, yang terdiri "
          "atas:"))
for h, tx in zip("abcd", [
    "Administrator, berwenang mengelola Hak Akses, data acuan, dan seluruh data Manajemen Risiko "
    "pada semua SKPK;",
    "Pengelola Risiko SKPK, berwenang merekam dan mengubah data Manajemen Risiko pada SKPK yang "
    "bersangkutan saja;",
    "Pembaca, berwenang membaca dan mencetak seluruh data Manajemen Risiko tanpa dapat mengubahnya, "
    "diberikan kepada pimpinan daerah dan pejabat yang ditetapkan Bupati; dan",
    "akun berkegunaan terbatas, berwenang membuka 1 (satu) formulir tertentu saja, yaitu kuesioner "
    "CEE atau pelaporan Kejadian Risiko sebagaimana dimaksud dalam Pasal 32.",
]):
    A(huruf(h, tx, kiri=1021))'''
assert LAMA in t, "Pasal 38 ayat (2) tidak ditemukan"
t = t.replace(LAMA, BARU, 1)
print("Pasal 38: jenis Hak Akses dirinci")

# ── Bagian baru: perekaman massal dan pemulihan data ──
TAMBAHAN = '''A(bagian("Kelima", "Perekaman Massal dan Pemulihan Data"))
A(pasal(40))
A(ayat(1, "Perekaman data Manajemen Risiko dapat dilakukan sekaligus dalam jumlah banyak melalui "
          "unggahan berkas lembar sebar dengan bentuk baku yang disediakan MR KABAR."))
A(ayat(2, "Unggahan sebagaimana dimaksud pada ayat (1) oleh Pengelola Risiko SKPK berlaku setelah "
          "disetujui Administrator."))
A(ayat(3, "Administrator menolak unggahan sebagaimana dimaksud pada ayat (2) dalam hal:"))
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

A(pasal(41))
A(ayat(1, "Penghapusan data Manajemen Risiko pada MR KABAR bersifat sementara."))
A(ayat(2, "Data yang dihapus sebagaimana dimaksud pada ayat (1) tidak ditampilkan pada formulir dan "
          "laporan, tetapi tetap tersimpan dan dapat dipulihkan oleh Administrator."))
A(ayat(3, "Penghapusan secara tetap hanya dapat dilakukan Administrator setelah memperoleh "
          "persetujuan tertulis Kepala SKPK pemilik data."))
A(ayat(4, "Setiap perekaman, perubahan, penghapusan, dan pemulihan data terekam sebagai jejak audit "
          "yang memuat identitas Pengguna, waktu, dan bentuk perubahannya."))
A(ayat(5, "Jejak audit sebagaimana dimaksud pada ayat (4) tidak dapat diubah atau dihapus, dan "
          "menjadi bahan pengawasan bagi Penanggung Jawab Pengawasan."))

'''
JANGKAR = 'A(bagian("Kelima", "Keamanan Informasi dan Pelindungan Data Pribadi"))'
assert JANGKAR in t, "Bagian Keamanan Informasi tidak ditemukan"
t = t.replace(JANGKAR, TAMBAHAN
              + 'A(bagian("Keenam", "Keamanan Informasi dan Pelindungan Data Pribadi"))', 1)
t = t.replace('A(bagian("Keenam", "Keterpaduan"))', 'A(bagian("Ketujuh", "Keterpaduan"))', 1)
t = t.replace('A(bagian("Ketujuh", "Pengelola"))', 'A(bagian("Kedelapan", "Pengelola"))', 1)
print("BAB VII: Bagian Perekaman Massal dan Pemulihan Data ditambahkan")

# ── daftar modul Lampiran XI dan Pasal 37 menyebut modul baru ──
t = t.replace('    "perekaman Data Umum;",',
              '    "perekaman Data Umum;",\n'
              '    "perekaman massal melalui lembar sebar beserta persetujuannya;",\n'
              '    "pemulihan data yang dihapus dan jejak audit;",', 1)
t = t.replace('for h, t in zip("abcdefghijk", [\n    "Penetapan Konteks Risiko;"',
              'for h, t in zip("abcdefghijklm", [\n    "Penetapan Konteks Risiko;"', 1)

t = t.replace('''                            "9. Perekaman Data Umum\\n"
                            "10. Pelaporan dan Pencetakan Dokumen\\n"
                            "11. Penyajian Informasi Risiko bagi Pimpinan"],''',
              '''                            "9. Perekaman Data Umum\\n"
                            "10. Perekaman Massal melalui Lembar Sebar beserta Persetujuannya\\n"
                            "11. Pemulihan Data yang Dihapus dan Jejak Audit\\n"
                            "12. Pelaporan dan Pencetakan Dokumen\\n"
                            "13. Penyajian Informasi Risiko bagi Pimpinan"],''', 1)
print("Pasal 37 dan Lampiran XI: modul dilengkapi")

f.write_text(t, encoding="utf-8")
compile(t, str(f), "exec")
print("selesai")
