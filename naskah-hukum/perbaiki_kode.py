"""Jangan susun ulang Kode Risiko dari kolom label.

Komponen entitas penilai dan nomor urut tidak tersimpan pada kolom yang
diekspor, sehingga menyusunnya sendiri menghasilkan kode yang tidak pernah
ada pada aplikasi.
"""
from pathlib import Path

f = Path(__file__).parent / "naskah.py"
t = f.read_text(encoding="utf-8")

LAMA = '''def _kode(r):
    tk = _a(r, "TINGKAT RISIKO")
    th = _a(r, "TAHUN DINILAI RISIKO")[-2:]
    jn = str(_a(r, "JENIS RISIKO")).split(" ")[0]
    en = _a(r, "ENTITAS PD YANG MENILAI")
    no = _a(r, "NOMOR URUT RISIKO")
    return f"{tk}.{th}.{jn}.{en}.{no}"'''

BARU = '''PREFIKS = {"Risiko Strategis Pemda": "RSP", "Risiko Strategis PD": "RSO",
           "Risiko Operasional PD": "ROO"}


def _kode(r):
    tk = _a(r, "TINGKAT RISIKO")
    pre = PREFIKS.get(tk, tk)
    th = _a(r, "TAHUN DINILAI RISIKO")[-2:]
    jn = str(_a(r, "JENIS RISIKO")).split(" ")[0]
    return f"{pre}.{th}.{jn}. ..."'''

if LAMA in t:
    t = t.replace(LAMA, BARU)
    f.write_text(t, encoding="utf-8")
    compile(t, str(f), "exec")
    print("kode risiko contoh diperbaiki")
else:
    print("sudah dalam bentuk yang benar")
