"""
Nomori ulang seluruh Pasal menurut urutan kemunculannya, lalu geser setiap
rujukan silang mengikutinya.

Dipisahkan dari skrip penambahan isi dengan sengaja. Menyisipkan Pasal dan
menomori ulang dalam satu langkah membuat nomor yang dirujuk berubah di
tengah jalan — dan karena rujukan silang di sini berupa teks biasa
("sebagaimana dimaksud dalam Pasal 27"), kekeliruannya tidak menimbulkan
galat apa pun. Naskah tetap tercetak rapi, hanya menunjuk Pasal yang salah.

Satu rujukan sengaja TIDAK digeser: "Pasal 13 ayat (1) Peraturan Pemerintah
Nomor 60 Tahun 2008" pada Menimbang menunjuk peraturan lain, bukan Pasal di
dalam naskah ini.
"""
import io
import os
import re

D = os.path.dirname(os.path.abspath(__file__))
F = os.path.join(D, "naskah.py")
s = io.open(F, encoding="utf-8").read()

# ── 1. Peta nomor lama -> baru, menurut urutan kemunculan ────────────
lama = [int(m) for m in re.findall(r"A\(pasal\((\d+)\)\)", s)]
assert len(lama) == len(set(lama)), "ada nomor Pasal kembar sebelum dinomori ulang"
peta = {n: i for i, n in enumerate(lama, 1)}

bergeser = {a: b for a, b in peta.items() if a != b}
print(f"Pasal: {len(lama)} buah")
print(f"  nomor sementara -> tetap : "
      + ", ".join(f"{a}->{b}" for a, b in sorted(peta.items()) if a >= 900))
print(f"  bergeser                 : {len(bergeser)} Pasal")

# ── 2. Panggilan pasal() ─────────────────────────────────────────────
s = re.sub(r"A\(pasal\((\d+)\)\)", lambda m: f"A(pasal({peta[int(m.group(1))]}))", s)

# ── 3. Rujukan silang berupa teks ────────────────────────────────────
# Dilewati bila sesudahnya menyebut nama peraturan lain.
LUAR = re.compile(r"^\s*(ayat \(\d+\)\s*)?(Peraturan|Undang-Undang|Perpres|Perdep)")
diganti = [0]


def geser(m):
    nomor = int(m.group(1))
    ekor = s[m.end():m.end() + 60]
    if LUAR.match(ekor):
        return m.group(0)                      # menunjuk peraturan lain
    if nomor not in peta:
        return m.group(0)
    diganti[0] += 1
    return f"Pasal {peta[nomor]}"


s = re.sub(r"Pasal (\d+)", geser, s)
print(f"  rujukan silang digeser   : {diganti[0]}")

io.open(F, "w", encoding="utf-8").write(s)

# ── 4. Periksa hasilnya ──────────────────────────────────────────────
akhir = [int(m) for m in re.findall(r"A\(pasal\((\d+)\)\)", s)]
assert akhir == list(range(1, len(akhir) + 1)), "penomoran Pasal tidak berurutan"
tersisa = [int(m) for m in re.findall(r"Pasal (\d+)", s) if int(m) > len(akhir)]
luar_sah = {13}                                 # PP 60/2008 Pasal 13
assert set(tersisa) <= luar_sah, f"masih ada rujukan ke Pasal yang tidak ada: {sorted(set(tersisa))}"
print(f"  hasil: Pasal 1 sampai {len(akhir)}, berurutan tanpa lompatan")
