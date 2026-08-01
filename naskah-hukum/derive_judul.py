"""Turunkan judul keterangan tabel dari tajuk terdekat di atasnya."""
import re
from pathlib import Path

b = Path(__file__).parent / "naskah.py"
baris = b.read_text(encoding="utf-8").splitlines()

TAJUK = re.compile(r'A\(P\("([^"]{6,})"')
LAMP = re.compile(r'kepala_lampiran\("([IVX]+)",\s*"([^"]+)"')

for i, ln in enumerate(baris):
    if "A(tabel(" not in ln:
        continue
    judul, lamp = None, None
    for j in range(i - 1, max(0, i - 60), -1):
        s = baris[j]
        if judul is None:
            m = TAJUK.search(s)
            if m and ("b=True" in s or "b=True" in baris[j + 1] if j + 1 < len(baris) else False):
                judul = m.group(1)
        m2 = LAMP.search(s)
        if m2:
            lamp = f"Lampiran {m2.group(1)}"
            break
    print(f"{i + 1:>5}  [{lamp or '-'}]  {judul or '(TIDAK ADA TAJUK)'}")
