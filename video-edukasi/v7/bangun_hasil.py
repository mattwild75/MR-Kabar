"""
Berkas pendamping v7 dari timeline.json (sumber yang sama dengan video):

  subtitle.srt / subtitle.vtt  potongan <= 2 baris x 42 huruf, waktunya
                               mengikuti waktu kata hasil suara
  transkrip.txt                naskah lengkap per bab, bertimestamp, bernama
                               tokoh, + kredit foto
  chapters.json                daftar bab untuk pemutar
                               (resources/js/data/edu-video-chapters.json)

    python bangun_hasil.py
"""
import json
import os
import re

import naskah as NS

DIR = os.path.dirname(os.path.abspath(__file__))
MAKS_BARIS = 42


def ts(s, sep=","):
    ms = int(round(s * 1000))
    h, ms = divmod(ms, 3_600_000)
    m, ms = divmod(ms, 60_000)
    d, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{d:02d}{sep}{ms:03d}"


def pendek(s):
    m, d = divmod(int(s), 60)
    return f"{m}:{d:02d}"


def potong_kalimat(teks):
    """Pecah satu kalimat tampilan menjadi potongan <= 2 baris, utamakan batas tanda baca."""
    kata = teks.split()
    potong, kini = [], []
    for w in kata:
        coba = " ".join(kini + [w])
        if len(coba) > MAKS_BARIS * 2 - 4 and kini:
            potong.append(kini)
            kini = [w]
        else:
            kini.append(w)
            if re.search(r"[.!?]$", w) and len(" ".join(kini)) > MAKS_BARIS:
                potong.append(kini)
                kini = []
    if kini:
        potong.append(kini)
    return [" ".join(p) for p in potong]


def dua_baris(s):
    if len(s) <= MAKS_BARIS:
        return s
    tengah = len(s) // 2
    kiri, kanan = s.rfind(" ", 0, tengah + 6), s.find(" ", tengah - 6)
    cut = kiri if kiri != -1 and (kanan == -1 or tengah - kiri <= kanan - tengah) else kanan
    return s[:cut] + "\n" + s[cut + 1:]


def waktu_untuk(line):
    """Fungsi pecahan-huruf (0..1) -> detik, dari waktu kata TTS."""
    kata = line["words"]
    if not kata:
        return lambda u: line["start"] + u * (line["end"] - line["start"])
    pj = [max(1, len(re.sub(r"[^A-Za-z0-9]", "", w["w"]))) for w in kata]
    total = sum(pj)
    titik, acc = [(0.0, kata[0]["t"])], 0
    for w, p in zip(kata, pj):
        acc += p
        titik.append((acc / total, w["t"] + w["d"]))

    def f(u):
        for (u0, t0), (u1, t1) in zip(titik, titik[1:]):
            if u <= u1:
                return t0 + (t1 - t0) * ((u - u0) / max(1e-6, u1 - u0))
        return titik[-1][1]
    return f


def main():
    tl = json.load(open(os.path.join(DIR, "timeline.json"), encoding="utf-8"))
    kredit = json.load(open(os.path.join(DIR, "aset", "foto", "kredit.json"), encoding="utf-8"))
    total = tl["total_duration"]

    isyarat = []
    for ln in tl["lines"]:
        f = waktu_untuk(ln)
        bag = potong_kalimat(ln["display"])
        n = sum(len(b) for b in bag)
        acc = 0
        for i, b in enumerate(bag):
            a = f(acc / n)
            acc += len(b)
            z = f(acc / n) if i < len(bag) - 1 else ln["end"]
            isyarat.append([a, max(z, a + 1.0), dua_baris(b)])
    for i in range(len(isyarat) - 1):          # jangan bertumpuk
        isyarat[i][1] = min(isyarat[i][1], isyarat[i + 1][0] - 0.04)
    with open(os.path.join(DIR, "subtitle.srt"), "w", encoding="utf-8", newline="\n") as f:
        for i, (a, z, t) in enumerate(isyarat, start=1):
            f.write(f"{i}\n{ts(a)} --> {ts(z)}\n{t}\n\n")
    with open(os.path.join(DIR, "subtitle.vtt"), "w", encoding="utf-8", newline="\n") as f:
        f.write("WEBVTT\n\n")
        for i, (a, z, t) in enumerate(isyarat, start=1):
            f.write(f"{i}\n{ts(a, '.')} --> {ts(z, '.')}\n{t}\n\n")

    babs = []
    for s, judul, sasaran in NS.BAB:
        sc = next(x for x in tl["scenes"] if x["id"] == s)
        babs.append({"id": s, "judul": judul, "mulai": round(sc["start"], 1), "selesai": round(sc["end"], 1),
                     "durasi": round(sc["end"] - sc["start"], 1), "sasaran": sasaran})
    with open(os.path.join(DIR, "chapters.json"), "w", encoding="utf-8", newline="\n") as f:
        json.dump(babs, f, ensure_ascii=False, indent=4)
        f.write("\n")

    nama = {k: v["nama"] for k, v in NS.TOKOH.items()}
    per = {}
    for ln in tl["lines"]:
        per.setdefault(ln["scene"], []).append(ln)
    out = ["TRANSKRIP — VIDEO EDUKASI MR KABAR", "Berlayar dengan Peta Risiko (v7, animasi paper cut)",
           "Manajemen Risiko Pemerintah Kabupaten Aceh Barat",
           "Mengacu pada PP 60 Tahun 2008 (SPIP) dan Peraturan Deputi PPKD BPKP Nomor 4 Tahun 2019",
           f"Durasi {int(total // 60)} menit {int(total % 60)} detik · {len(tl['lines'])} kalimat", "", "=" * 78, ""]
    for b in babs:
        out.append(f"[{pendek(b['mulai'])}]  {b['judul'].upper()}   (untuk: {b['sasaran']})")
        out.append("-" * 78)
        for ln in per.get(b["id"], []):
            out.append(f"  [{pendek(ln['start'])}] {nama[ln['tokoh']]}: {ln['display']}")
        out.append("")
    out += ["=" * 78, "KREDIT FOTO (Wikimedia Commons)", ""]
    adegan = "".join(open(os.path.join(DIR, "mesin", f), encoding="utf-8").read() for f in os.listdir(os.path.join(DIR, "mesin")) if f.endswith(".js"))
    for k, v in kredit.items():
        if f"'{k}'" in adegan:
            out.append(f"  - {v['judul']} — {v['pembuat']} — {v['lisensi']} — {v.get('sumber', '')}")
    out += ["", "Huruf: Bebas Neue, Plus Jakarta Sans, JetBrains Mono (SIL Open Font License).",
            "Animasi paper cut, musik, dan efek suara: karya orisinal. Suara tokoh: suara sintetis.",
            "", "Copyright © 2026, System Architecture & Development by Nurhikmat Muhammad, Inspektorat Aceh Barat."]
    with open(os.path.join(DIR, "transkrip.txt"), "w", encoding="utf-8", newline="\n") as f:
        f.write("\n".join(out) + "\n")
    print(f"subtitle {len(isyarat)} potongan · chapters.json {len(babs)} bab · transkrip.txt")


if __name__ == "__main__":
    main()
