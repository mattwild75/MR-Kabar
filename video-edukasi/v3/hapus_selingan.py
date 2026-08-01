"""
Buang selingan ringan dari naskah video, atas keputusan pemilik aplikasi.

Delapan kalimat dibuang seluruhnya, satu kalimat dipotong ekornya. Yang dibuang
hanya kalimat yang memang ditulis sebagai selingan; kalimat yang menerangkan
sesuatu tetap tinggal walaupun bernada ringan.

Koreografinya ikut dibuang. Membiarkan item scenes.js menunjuk kalimat yang
sudah tidak ada membuat build_animation.py gagal — dan itu justru pengaman:
lebih baik gagal terang-terangan daripada merender 54 ribu frame dengan objek
yang muncul di waktu yang salah.
"""
import io
import os
import re

D = os.path.dirname(os.path.abspath(__file__))

# id kalimat yang dibuang seluruhnya
BUANG = [140, 149, 155, 156, 159, 161, 167, 170]

# kalimat yang hanya dipotong ekornya
POTONG = {
    143: (
        "Ada satu jenis akun lagi yang sering terlupa: akun peninjau. Dipakai "
        "pimpinan untuk melihat seluruh Perangkat Daerah sekaligus, tanpa bisa "
        "mengubah satu huruf pun. Semua pintu terbuka, tapi tidak ada satu pun "
        "pena di dalamnya.",
        "Ada satu jenis akun lagi yang sering terlupa: akun peninjau. Dipakai "
        "pimpinan untuk melihat seluruh Perangkat Daerah sekaligus, tanpa bisa "
        "mengubah satu huruf pun.",
    ),
}


def naskah():
    import json
    p = os.path.join(D, "lines.json")
    lines = json.load(io.open(p, encoding="utf-8"))
    if not any(l["id"] in BUANG for l in lines):
        print("naskah sudah dibersihkan, tidak diulang")
        return False

    sisa = [l for l in lines if l["id"] not in BUANG]
    for l in sisa:
        if l["id"] in POTONG:
            lama, baru = POTONG[l["id"]]
            assert l["text"] == lama, f"kalimat {l['id']} sudah berbeda dari yang diharapkan"
            l["text"] = baru
            l.pop("display", None)
            mp3 = os.path.join(D, "audio", f"line_{l['id']:03d}.mp3")
            if os.path.exists(mp3):
                os.remove(mp3)      # wajib disintesis ulang

    json.dump(sisa, io.open(p, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    for i in BUANG:
        mp3 = os.path.join(D, "audio", f"line_{i:03d}.mp3")
        if os.path.exists(mp3):
            os.remove(mp3)
    print(f"lines.json: {len(lines)} -> {len(sisa)} kalimat "
          f"({len(BUANG)} dibuang, {len(POTONG)} dipotong)")
    return True


def koreografi():
    p = os.path.join(D, "scenes.js")
    s = io.open(p, encoding="utf-8").read()
    baris = s.split("\n")
    pola = re.compile(r"L\((" + "|".join(str(i) for i in BUANG) + r")\s*,")
    simpan, dibuang = [], 0
    for b in baris:
        if pola.search(b) and b.strip().startswith("{k:"):
            dibuang += 1
            continue
        simpan.append(b)
    io.open(p, "w", encoding="utf-8").write("\n".join(simpan))
    print(f"scenes.js: {dibuang} objek koreografi dibuang")

    sisa = pola.findall("\n".join(simpan))
    if sisa:
        print(f"  PERHATIAN: masih ada rujukan ke kalimat terbuang: {sorted(set(sisa))}")


if naskah():
    koreografi()
