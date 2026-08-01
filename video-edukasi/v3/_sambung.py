"""Sambung literal string yang tidak sengaja terpotong baris baru.

Penyebabnya sepele: pada skrip penambal, "\\n" di dalam string Python biasa
menjadi baris baru sungguhan, padahal yang dibutuhkan JavaScript adalah dua
karakter garis-miring dan n. Berkas ini menyatukannya kembali.
"""
import io

P = "scenes.js"
src = io.open(P, encoding="utf-8").read().split("\n")


def ganjil(baris):
    """True bila jumlah kutip tunggal yang tidak di-escape ganjil."""
    n = 0
    i = 0
    while i < len(baris):
        c = baris[i]
        if c == "\\":
            i += 2
            continue
        if c == "'":
            n += 1
        i += 1
    return n % 2 == 1


out = []
i = 0
disambung = 0
while i < len(src):
    baris = src[i]
    while ganjil(baris) and i + 1 < len(src):
        i += 1
        baris = baris + "\\n" + src[i].lstrip()
        disambung += 1
    out.append(baris)
    i += 1

io.open(P, "w", encoding="utf-8").write("\n".join(out))
print("baris disambung:", disambung)
