"""Pasang keterangan bernomor otomatis (fitur Caption Word) pada setiap tabel.

Keterangan diletakkan di atas tabel sesuai kelaziman penaskahan, memakai
gaya Caption dan medan SEQ, sehingga nomornya dihitung Word sendiri dan
dapat dihimpun menjadi Daftar Tabel maupun dirujuk silang.
"""
from pathlib import Path

f = Path(__file__).parent / "naskah.py"
baris = f.read_text(encoding="utf-8").splitlines()

if any("keterangan_tabel(" in b for b in baris):
    print("keterangan tabel sudah terpasang, tidak diulang")
    raise SystemExit

# nomor baris (1-basis) pemanggilan A(tabel( -> ungkapan judul keterangan
JUDUL = {
    728: '"Kategori Risiko berdasarkan urusan pemerintahan"',
    740: '"Kriteria dampak Risiko"',
    748: '"Kriteria kemungkinan terjadinya Risiko"',
    764: '"Matriks analisis Risiko"',
    771: '"Peringkat skala Risiko"',
    778: '"Peringkat Risiko dan perlakuan yang diperlukan"',
    793: '"Unsur pembentuk Kode Risiko"',
    827: 'f"Kuesioner unsur {nama}"',
    861: '"Nama, alamat, dan ruang lingkup modul Sistem Informasi Manajemen Risiko"',
    1075: 'f"Uraian kolom Formulir {nama_f}"',
    1136: '"Contoh pengisian Formulir Identifikasi Risiko"',
    1153: '"Contoh pengisian Formulir Hasil Analisis Risiko"',
    1169: '"Contoh pengisian Formulir Rencana Tindak Pengendalian"',
    1190: '"Kode entitas penilai Risiko"',
    1223: '"Identitas responden Evaluasi Lingkungan Pengendalian"',
    1257: 'f"Rekapitulasi jawaban responden unsur {_nama}"',
    1263: '"Simpulan Evaluasi Lingkungan Pengendalian menurut unsur"',
    1348: '"Sebaran hasil Identifikasi Risiko tahun 2025"',
    1424: '"Contoh pengisian Formulir Rancangan Informasi dan Komunikasi"',
    1442: '"Contoh pengisian Formulir Rancangan dan Realisasi Pemantauan"',
    1460: '"Contoh pengisian Formulir Pencatatan Kejadian Risiko"',
    1489: '"Contoh pengisian Formulir Kelemahan Lingkungan Pengendalian (CEE 1b)"',
    1501: '"Contoh pengisian Formulir Simpulan Evaluasi Lingkungan Pengendalian (CEE 1c)"',
    1527: '"Contoh pengisian Formulir Rencana Tindak Pengendalian atas Lingkungan '
          'Pengendalian (CEE 1d)"',
}

sasaran = [i for i, b in enumerate(baris, 1) if "A(tabel(" in b]
assert set(sasaran) == set(JUDUL), (
    f"pemanggilan tabel bergeser: hanya di berkas {sorted(set(sasaran) - set(JUDUL))}, "
    f"hanya di peta {sorted(set(JUDUL) - set(sasaran))}")

for n in sorted(JUDUL, reverse=True):
    asli = baris[n - 1]
    spasi = asli[:len(asli) - len(asli.lstrip())]
    baris.insert(n - 1, f"{spasi}A(keterangan_tabel({JUDUL[n]}))")

t = "\n".join(baris) + "\n"
f.write_text(t, encoding="utf-8")
compile(t, str(f), "exec")
print(f"{len(JUDUL)} keterangan tabel terpasang")
