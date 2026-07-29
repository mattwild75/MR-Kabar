"""
Potong video 720p jadi klip per-tahap.

Rentangnya diambil dari chapters.json, bukan diketik tangan, jadi kalau
naskahnya berubah panjang, batas klipnya ikut bergeser sendiri.

Dipotong dengan `-c copy` (tanpa encode ulang) — itulah sebabnya berkas 720p
dibuat dengan keyframe rapat (-g 60), supaya titik potongnya tidak meleset
lebih dari dua detik.
"""
import json
import os
import subprocess

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
SUMBER = os.path.join(SCRIPT_DIR, "MR_Kabar_Video_Edukasi_v3_720p.mp4")
KLIP_DIR = os.path.join(SCRIPT_DIR, "klip")


def main():
    with open(os.path.join(SCRIPT_DIR, "chapters.json"), encoding="utf-8") as f:
        chapters = json.load(f)

    # satu klip per TAHAP: gabungkan bab-bab yang judulnya diawali "Tahap N"
    tahap = {}
    for c in chapters:
        if not c["judul"].startswith("Tahap "):
            continue
        n = c["judul"].split()[1]
        t = tahap.setdefault(n, {"mulai": c["mulai"], "selesai": c["selesai"], "judul": []})
        t["mulai"] = min(t["mulai"], c["mulai"])
        t["selesai"] = max(t["selesai"], c["selesai"])

    os.makedirs(KLIP_DIR, exist_ok=True)
    for n, t in sorted(tahap.items()):
        out = os.path.join(KLIP_DIR, f"tahap-{n}.mp4")
        subprocess.run(
            ["ffmpeg", "-y", "-v", "error", "-ss", str(t["mulai"]), "-i", SUMBER,
             "-t", str(round(t["selesai"] - t["mulai"], 1)), "-c", "copy", out],
            check=True,
        )
        print(f"  klip/tahap-{n}.mp4  {t['mulai']:.0f}s -> {t['selesai']:.0f}s "
              f"({t['selesai'] - t['mulai']:.0f} detik)")


if __name__ == "__main__":
    main()
