"""Tambahkan Lampiran XIII: kode entitas penilai Risiko (49 SKPK).

Kode entitas adalah komponen keempat pada Kode Risiko (Lampiran VII).
Daftarnya diambil dari tabel acuan aplikasi supaya kode pada peraturan dan
kode yang dibentuk aplikasi tidak pernah berbeda.
"""
import json
from pathlib import Path

f = Path(__file__).parent / "naskah.py"
t = f.read_text(encoding="utf-8")

TAMBAHAN = '''
# ── LAMPIRAN XIII: kode entitas penilai ──
A(paragraf_pemisah_bagian(sectpr(lanskap=True, halaman_pertama_beda=False)))
A(kepala_lampiran("XIII", "KODE ENTITAS PENILAI RISIKO", potong=False))
A(par("Kode entitas penilai merupakan komponen keempat pada Kode Risiko sebagaimana dimaksud dalam "
      "Lampiran VII. Kode diberikan tetap untuk setiap Satuan Kerja Perangkat Kabupaten agar Kode "
      "Risiko tidak berubah antar-tahun penilaian dan tidak berbenturan antar-SKPK.", after=200))
ENTITAS = json.loads((BASIS / "entitas.json").read_text(encoding="utf-8"))
_sep = (len(ENTITAS) + 1) // 2
_baris = [["Kode", "Satuan Kerja Perangkat Kabupaten", "Kode", "Satuan Kerja Perangkat Kabupaten"]]
for i in range(_sep):
    kiri = ENTITAS[i]
    kanan = ENTITAS[i + _sep] if i + _sep < len(ENTITAS) else None
    _baris.append([str(kiri["urutan"]).zfill(2), kiri["nama"],
                   str(kanan["urutan"]).zfill(2) if kanan else "",
                   kanan["nama"] if kanan else ""])
A(tabel([700, 3500, 700, 3500], _baris, p=16,
        rata_sel=["center", "left", "center", "left"]))
A(P("", after=200))
A(par("Kode entitas penilai bersifat tetap. Dalam hal terjadi perubahan susunan perangkat daerah, "
      "kode entitas yang sudah tidak digunakan tidak dipakai ulang untuk SKPK lain, dan SKPK baru "
      "diberikan kode berikutnya oleh Administrator.", after=300))

'''

t = t.replace('A(P("", after=400))\nA(ttd_kanan("BUPATI ACEH BARAT,", "TARMIZI"))',
              'A(P("", after=400))\n' + TAMBAHAN + 'A(ttd_kanan("BUPATI ACEH BARAT,", "TARMIZI"))')

f.write_text(t, encoding="utf-8")
compile(t, str(f), "exec")
print("naskah.py: Lampiran XIII kode entitas penilai ditambahkan")
