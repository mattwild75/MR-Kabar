"""Buang kata "diisi" yang berulang.

Templat keterangan sudah menuliskan "Kolom x diisi dengan ...", sehingga
keterangan kolom tidak boleh diawali kata "diisi" lagi.
"""
from pathlib import Path

f = Path(__file__).parent / "naskah.py"
t = f.read_text(encoding="utf-8")

GANTI = [
    ('"diisi C apabila penyebab dapat dikendalikan unit kerja, atau UC apabila tidak dapat dikendalikan"',
     '"tanda C apabila penyebab dapat dikendalikan unit kerja, atau tanda UC apabila tidak dapat dikendalikan"'),
    ('"diisi C apabila penyebab dapat dikendalikan, atau UC apabila tidak"',
     '"tanda C apabila penyebab dapat dikendalikan, atau tanda UC apabila tidak"'),
    ('"sumber penyebab, diisi internal atau eksternal"',
     '"sumber penyebab, yaitu internal atau eksternal"'),
    ('"penilaian kecukupan pengendalian, diisi memadai, kurang memadai, atau tidak ada"',
     '"penilaian kecukupan pengendalian, yaitu memadai, kurang memadai, atau tidak ada"'),
    ('"pilihan jawaban responden, diisi 1 sangat tidak setuju, 2 tidak setuju, 3 setuju, atau 4 sangat setuju"',
     '"pilihan jawaban responden, yaitu 1 untuk sangat tidak setuju, 2 untuk tidak setuju, 3 untuk setuju, atau 4 untuk sangat setuju"'),
    ('"diisi memadai apabila modus bernilai 3 atau 4, dan kurang memadai apabila modus bernilai 1 atau 2, terisi otomatis"',
     '"simpulan memadai apabila modus bernilai 3 atau 4, dan kurang memadai apabila modus bernilai 1 atau 2, terisi otomatis"'),
    ('"keputusan akhir atas unsur tersebut, diisi memadai atau kurang memadai"',
     '"keputusan akhir atas unsur tersebut, yaitu memadai atau kurang memadai"'),
]

n = 0
for a, b in GANTI:
    if a in t:
        t = t.replace(a, b)
        n += 1

f.write_text(t, encoding="utf-8")
compile(t, str(f), "exec")
print(f"{n} keterangan kolom dirapikan")
