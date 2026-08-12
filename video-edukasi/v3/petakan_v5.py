"""
Petakan id kalimat v4 -> v5 pada scenes.js.

Kenapa perlu. Pada v4 id kalimat tumbuh tambal-sulam: 1-98 warisan v2, lalu
101-169 diselipkan sesuai urutan penambalan, bukan urutan tutur. Naskah v5
ditulis ulang utuh sehingga id-nya kembali berurutan 1-157. Seluruh koreografi
di scenes.js memanggil kalimat lewat L(id, offset), jadi tanpa pemetaan ini
setiap panggilan akan menunjuk kalimat yang keliru — dan gejalanya bukan galat,
melainkan animasi yang muncul di detik yang salah sepanjang video.

Pencocokannya lewat kemiripan teks, bukan urutan, supaya kalimat yang pindah
tempat tetap ketemu. Ambangnya sengaja tinggi (0,72): lebih baik dilaporkan
sebagai tidak cocok lalu ditangani manual daripada dipetakan ke kalimat lain
yang kebetulan mirip.

Skrip ini MENOLAK berjalan dua kali.
"""
import difflib
import json
import os
import re
import sys

DIR = os.path.dirname(os.path.abspath(__file__))
AMBANG = 0.72

# Lima kalimat yang isinya memang ditulis ulang di v5, sehingga kemiripannya
# jatuh di bawah ambang walaupun tempatnya di alur tidak berubah. Dipetakan
# tangan supaya koreografi lamanya tetap terpakai; yang berubah hanya kata-
# katanya, bukan apa yang digambarkan.
#
#   v4 158 -> v5  93  batas Selera Risiko di matriks (kini menyebut "Sedang")
#   v4  69 -> v5  94  yang di dalam vs melampaui selera
#   v4  82 -> v5 116  Form Cetak (tiga belas -> empat belas dokumen)
#   v4  90 -> v5 146  Dashboard, deret seksi bagian atas
#   v4  91 -> v5 147  Dashboard, deret seksi bagian bawah
MANUAL = {158: 93, 69: 94, 82: 116, 90: 146, 91: 147}


def teks(l):
    return (l.get("display") or l["text"]).lower()


def main():
    lama = json.load(open(os.path.join(DIR, "lines-v4.json.simpan"), encoding="utf-8"))
    baru = json.load(open(os.path.join(DIR, "lines.json"), encoding="utf-8"))
    scenes = open(os.path.join(DIR, "scenes.js"), encoding="utf-8").read()

    if "/* dipetakan ke id v5 */" in scenes:
        sys.exit("scenes.js sudah dipetakan. Berhenti.")

    # Cocokkan hanya di dalam scene yang sama — dua kalimat mirip di scene
    # berbeda tidak boleh saling tertukar.
    peta, ragu = dict(MANUAL), []
    for lm in lama:
        if lm["id"] in peta:
            continue
        kandidat = [b for b in baru if b["scene"] == lm["scene"]]
        if not kandidat:
            ragu.append((lm["id"], lm["scene"], "scene hilang", teks(lm)[:70]))
            continue
        skor = [(difflib.SequenceMatcher(None, teks(lm), teks(b)).ratio(), b) for b in kandidat]
        nilai, cocok = max(skor, key=lambda p: p[0])
        if nilai < AMBANG:
            ragu.append((lm["id"], lm["scene"], f"mirip {nilai:.2f}", teks(lm)[:70]))
            continue
        peta[lm["id"]] = cocok["id"]

    # Satu id v5 tidak boleh jadi tujuan dua id v4 — itu tanda pencocokan
    # meleset dan akan menumpuk dua koreografi di kalimat yang sama.
    tujuan = {}
    for a, b in peta.items():
        tujuan.setdefault(b, []).append(a)
    bentrok = {b: a for b, a in tujuan.items() if len(a) > 1}

    dipakai = sorted({int(m) for m in re.findall(r"L\((\d+),", scenes)})
    hilang = [i for i in dipakai if i not in peta]

    print(f"cocok      : {len(peta)} dari {len(lama)} kalimat v4")
    print(f"id v5 baru : {sorted({b['id'] for b in baru} - set(peta.values()))}")
    if ragu:
        print(f"\nTIDAK COCOK ({len(ragu)}) — koreografinya perlu ditulis tangan:")
        for i, sc, sebab, t in ragu:
            print(f"  v4 id {i:3d} [{sc:>4}] {sebab:>12} : {t}")
    if bentrok:
        print(f"\nBENTROK — satu id v5 jadi tujuan beberapa id v4:")
        for b, a in bentrok.items():
            print(f"  v5 {b} <- v4 {a}")
    if hilang:
        print(f"\nDIPANGGIL scenes.js TAPI TAK TERPETAKAN: {hilang}")

    if bentrok or hilang:
        sys.exit("\nBerhenti — perbaiki dulu sebelum scenes.js ditulis.")

    # Tulis ulang dalam satu langkah lewat fungsi pengganti, bukan berantai
    # str.replace: penggantian berantai bisa mengenai hasil penggantian
    # sebelumnya (L(5..) jadi L(12..) lalu ikut tergantikan lagi).
    baru_scenes = re.sub(r"L\((\d+),", lambda m: f"L({peta[int(m.group(1))]},", scenes)
    baru_scenes = "/* dipetakan ke id v5 */\n" + baru_scenes
    open(os.path.join(DIR, "scenes.js"), "w", encoding="utf-8").write(baru_scenes)
    jumlah = len(re.findall(r"L\(\d+,", scenes))
    print(f"\nscenes.js: {jumlah} panggilan L() dipetakan ulang")


if __name__ == "__main__":
    main()
