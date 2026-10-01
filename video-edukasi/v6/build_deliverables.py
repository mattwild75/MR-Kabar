"""
Berkas pendamping dari timeline.json (sumber yang sama dengan video):

  subtitle.vtt   track subtitle yang bisa dimatikan penonton (pemutar web);
                 kalimat panjang dipecah memakai potongan dari subtitle.srt
  transkrip.txt  naskah lengkap bertimestamp per bab + kredit foto
  chapters.json  daftar bab untuk pemutar (resources/js/data/edu-video-chapters.json)
"""
import json
import os
import re

DIR = os.path.dirname(os.path.abspath(__file__))


def ts_vtt(s):
    ms = int(round(s * 1000))
    h, ms = divmod(ms, 3_600_000)
    m, ms = divmod(ms, 60_000)
    d, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{d:02d}.{ms:03d}"


def pendek(s):
    m, d = divmod(int(s), 60)
    return f"{m}:{d:02d}"


def main():
    tl = json.load(open(os.path.join(DIR, "timeline.json"), encoding="utf-8"))
    bab = json.load(open(os.path.join(DIR, "chapters_naskah.json"), encoding="utf-8"))
    kredit = json.load(open(os.path.join(DIR, "foto", "kredit.json"), encoding="utf-8"))
    total = tl["total_duration"]

    # VTT dari SRT (potongan <= 2 baris)
    srt = open(os.path.join(DIR, "subtitle.srt"), encoding="utf-8").read().strip().split("\n\n")
    with open(os.path.join(DIR, "subtitle.vtt"), "w", encoding="utf-8") as f:
        f.write("WEBVTT\n\n")
        for blok in srt:
            b = blok.split("\n")
            f.write(b[0] + "\n" + b[1].replace(",", ".") + "\n" + "\n".join(b[2:]) + "\n\n")

    # bab
    babs = []
    for b in bab:
        sc = next(s for s in tl["scenes"] if s["id"] == b["id"])
        mulai = sc["start"]
        babs.append({"id": b["id"], "judul": b["judul"], "mulai": round(mulai, 1), "selesai": round(sc["end"], 1),
                     "durasi": round(sc["end"] - mulai, 1), "sasaran": b["sasaran"]})
    with open(os.path.join(DIR, "chapters.json"), "w", encoding="utf-8") as f:
        json.dump(babs, f, ensure_ascii=False, indent=4)

    # transkrip
    per = {}
    for ln in tl["lines"]:
        per.setdefault(ln["scene"], []).append(ln)
    out = ["TRANSKRIP — VIDEO EDUKASI MR KABAR", "Berlayar dengan Peta Risiko",
           "Manajemen Risiko Pemerintah Kabupaten Aceh Barat",
           "Mengacu pada PP 60 Tahun 2008 (SPIP) dan Perdep PPKD No. 4 Tahun 2019",
           f"Durasi {int(total // 60)} menit {int(total % 60)} detik · {len(tl['lines'])} kalimat", "", "=" * 78, ""]
    for b in babs:
        out.append(f"[{pendek(b['mulai'])}]  {b['judul'].upper()}   (untuk: {b['sasaran']})")
        out.append("-" * 78)
        for ln in per.get(b["id"], []):
            out.append(f"  [{pendek(ln['start'])}] {ln['display']}")
        out.append("")
    out += ["=" * 78, "KREDIT FOTO (Wikimedia Commons)", ""]
    adegan = open(os.path.join(DIR, "scenes.js"), encoding="utf-8").read()
    pakai = {k for k in kredit if f"'{k}'" in adegan}
    for k, v in kredit.items():
        if k in pakai:
            out.append(f"  - {v['judul']} — {v['pembuat']} — {v['lisensi']} — {v['sumber']}")
    out += ["", "Huruf: Bebas Neue, Plus Jakarta Sans, Playfair Display, JetBrains Mono (SIL Open Font License).",
            "Musik: komposisi orisinal. Narasi: suara sintetis."]
    with open(os.path.join(DIR, "transkrip.txt"), "w", encoding="utf-8") as f:
        f.write("\n".join(out) + "\n")
    print(f"subtitle.vtt {len(srt)} potongan · chapters.json {len(babs)} bab · transkrip.txt")


if __name__ == "__main__":
    main()
