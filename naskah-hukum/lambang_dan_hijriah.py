"""Lambang negara dan penanggalan Hijriah dipasang menggantikan penanda kosong.

  1. Kepala peraturan memakai lambang negara Garuda Pancasila tanpa warna,
     mengikuti bentuk yang dipakai Peraturan Bupati Aceh Barat yang sudah
     ada. Berkasnya dirender dari berkas vektor resmi lalu disaring menjadi
     abu-abu, bukan disalin dari pindaian, supaya tetap tajam saat dicetak.
     Lambang tidak memakai keterangan bernomor karena bukan gambar isi.

  2. Penanggalan Hijriah diisi 16 Safar 1448 H, padanan 30 Juli 2026, sesuai
     kelaziman penaskahan peraturan di Aceh yang mencantumkan penanggalan
     Masehi dan Hijriah berdampingan.

  3. Rumusan "DENGAN RAHMAT ALLAH YANG MAHA KUASA" diberi tanda koma di
     akhir, mengikuti bentuk baku yang dipakai Peraturan Bupati Aceh Barat.
"""
from pathlib import Path

f = Path(__file__).parent / "naskah.py"
t = f.read_text(encoding="utf-8")

if "HIJRIAH" in t:
    print("sudah dijalankan, tidak diulang")
    raise SystemExit

# ── daftarkan berkas lambang ──
LAMA = "DAFTAR_GAMBAR = [(f\"rIdG{i}\", str(GBR / f\"{n}.jpeg\")) for i, n in enumerate(NAMA_GAMBAR, 1)]"
BARU = ("DAFTAR_GAMBAR = [(f\"rIdG{i}\", str(GBR / f\"{n}.jpeg\")) for i, n in enumerate(NAMA_GAMBAR, 1)]\n"
        "# Lambang negara didaftarkan terpisah dari NAMA_GAMBAR supaya tidak ikut\n"
        "# terhitung sebagai gambar isi yang berketerangan bernomor.\n"
        "DAFTAR_GAMBAR.append((\"rIdLambang\", str(GBR / \"garuda.jpeg\")))")
assert LAMA in t, "daftar gambar tidak ditemukan"
t = t.replace(LAMA, BARU, 1)

# ── penanggalan ──
LAMA = 'TANGGAL = "30 Juli 2026"'
BARU = ('TANGGAL = "30 Juli 2026"\n'
        '# Padanan Hijriah tanggal penetapan, dipakai berdampingan dengan\n'
        '# penanggalan Masehi sesuai kelaziman penaskahan peraturan di Aceh.\n'
        'HIJRIAH = "16 Safar 1448"')
assert LAMA in t
t = t.replace(LAMA, BARU, 1)

t = t.replace('A(PM([("                    ................ 1448 H", False)], kiri=4990, after=140, rata="left"))',
              'A(PM([(f"{\' \' * 20}{HIJRIAH} H", False)], kiri=4990, after=140, rata="left"))', 1)
t = t.replace('A(P("                  ................ 1448 H", rata="left", after=140))',
              'A(P(f"{\' \' * 18}{HIJRIAH} H", rata="left", after=140))', 1)
print(f"penanggalan Hijriah diisi: 16 Safar 1448 H")

# ── lambang negara ──
LAMA = 'A(P("[ LAMBANG NEGARA ]", rata="center", i=True, p=18, after=160))'
BARU = 'A(gambar("rIdLambang", str(GBR / "garuda.jpeg"), lebar_inci=1.0))'
assert LAMA in t, "penanda lambang tidak ditemukan"
t = t.replace(LAMA, BARU, 1)
print("lambang negara dipasang pada kepala peraturan")

# ── tanda koma pada rumusan ──
t = t.replace('A(P("DENGAN RAHMAT ALLAH YANG MAHA KUASA", rata="center", b=True, after=240))',
              'A(P("DENGAN RAHMAT ALLAH YANG MAHA KUASA,", rata="center", b=True, after=240))', 1)
print("rumusan DENGAN RAHMAT ALLAH YANG MAHA KUASA diberi tanda koma")

f.write_text(t, encoding="utf-8")
compile(t, str(f), "exec")
print("selesai")
