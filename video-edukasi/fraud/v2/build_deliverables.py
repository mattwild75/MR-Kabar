"""
Berkas pendamping dari timeline.json (sumber yang sama dengan video):

  subtitle.vtt   track subtitle yang bisa dimatikan penonton (pemutar web);
                 kalimat panjang dipecah memakai potongan dari subtitle.srt
  transkrip.txt  naskah lengkap bertimestamp per bab + rujukan + kredit foto
  chapters.json  daftar bab untuk pemutar di /lapor-kejadian/video-kecurangan
                 (dipasang sebagai resources/js/data/kecurangan-video-chapters.json)
"""
import json
import os

DIR = os.path.dirname(os.path.abspath(__file__))


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
    with open(os.path.join(DIR, "subtitle.vtt"), "w", encoding="utf-8", newline="\n") as f:
        f.write("WEBVTT\n\n")
        for blok in srt:
            b = blok.split("\n")
            f.write(b[0] + "\n" + b[1].replace(",", ".") + "\n" + "\n".join(b[2:]) + "\n\n")

    # bab: Pembuka & Penutup tanpa nomor, babak di antaranya bernomor 1..9
    babs = []
    for i, b in enumerate(bab):
        sc = next(s for s in tl["scenes"] if s["id"] == b["id"])
        judul = b["judul"] if b["id"] in ("s1", "s11") else f"{i}. {b['judul']}"
        babs.append({"id": b["id"], "judul": judul, "mulai": round(sc["start"], 1), "selesai": round(sc["end"], 1),
                     "durasi": round(sc["end"] - sc["start"], 1), "sasaran": b["sasaran"]})
    with open(os.path.join(DIR, "chapters.json"), "w", encoding="utf-8", newline="\n") as f:
        json.dump(babs, f, ensure_ascii=False, indent=4)
        f.write("\n")

    # transkrip
    per = {}
    for ln in tl["lines"]:
        per.setdefault(ln["scene"], []).append(ln)
    out = ["TRANSKRIP — VIDEO EDUKASI LAPOR DUGAAN KECURANGAN", "Bunyikan Lonceng",
           "MR Kabar · Inspektorat Kabupaten Aceh Barat",
           f"Durasi {int(total // 60)} menit {int(total % 60)} detik · {len(tl['lines'])} kalimat", "", "=" * 78, ""]
    for b in babs:
        out.append(f"[{pendek(b['mulai'])}]  {b['judul'].upper()}")
        out.append("-" * 78)
        for ln in per.get(b["id"], []):
            out.append(f"  [{pendek(ln['start'])}] {ln['display']}")
        out.append("")
    out += ["=" * 78, "RUJUKAN", "",
            "  - UU No. 31 Tahun 1999 jo. UU No. 20 Tahun 2001 tentang Pemberantasan Tindak Pidana Korupsi",
            "    (pengelompokan tujuh bentuk korupsi; gratifikasi Pasal 12B-12C)",
            "  - UU No. 31 Tahun 2014 tentang Perlindungan Saksi dan Korban, Pasal 10 ayat (1)",
            "  - Peraturan Bupati Aceh Barat No. 6 Tahun 2025 tentang Pengendalian Kecurangan, Pasal 3",
            "  - ACFE, Occupational Fraud 2026: A Report to the Nations",
            "  - Donald R. Cressey, Other People's Money (1953)",
            "", "=" * 78, "KREDIT FOTO (Wikimedia Commons)", ""]
    adegan = open(os.path.join(DIR, "scenes.js"), encoding="utf-8").read()
    pakai = {k for k in kredit if f"'{k}'" in adegan}
    for k, v in kredit.items():
        if k in pakai:
            out.append(f"  - {v['judul']} — {v['pembuat']} — {v['lisensi']} — {v['sumber']}")
    out += ["", "Ikon: Lucide (ISC License).",
            "Huruf: Bebas Neue, Plus Jakarta Sans, Playfair Display, JetBrains Mono (SIL Open Font License).",
            "Musik dan efek suara: komposisi dan sintesis orisinal. Narasi: suara sintetis.",
            "Tangkapan layar: aplikasi MR Kabar; laporan contoh rekaan, dihapus sesudah pemotretan."]
    with open(os.path.join(DIR, "transkrip.txt"), "w", encoding="utf-8", newline="\n") as f:
        f.write("\n".join(out) + "\n")
    print(f"subtitle.vtt {len(srt)} potongan · chapters.json {len(babs)} bab · transkrip.txt")


if __name__ == "__main__":
    main()
