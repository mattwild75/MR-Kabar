"""
Rakit selingan/animation.html = template + engine video edukasi v6 +
timeline.json + scenes.js tutorial.

Mesin, huruf, foto, dan logo diambil dari ../../../video-edukasi/v6 apa
adanya (bukan disalin) lewat <base href>, sehingga kartu bab tutorial dan
video edukasi berbagi satu wajah. Folder v6 harus lengkap: jalankan dulu
ambil_huruf.py, foto/ambil_foto.py, dan grade_foto.py di sana.

    python build_animation.py
"""
import json
import os
import pathlib

DIR = os.path.dirname(os.path.abspath(__file__))
V6 = os.path.normpath(os.path.join(DIR, "..", "..", "..", "video-edukasi", "v6"))


def baca(p):
    return open(p, encoding="utf-8").read()


def main():
    tl = json.loads(baca(os.path.join(DIR, "timeline.json")))
    kredit = json.loads(baca(os.path.join(V6, "foto", "kredit.json")))
    base = pathlib.Path(V6).as_uri() + "/"
    html = (baca(os.path.join(V6, "template.html"))
            .replace("<head>", f'<head>\n<base href="{base}">', 1)
            .replace("MR Kabar — Berlayar dengan Peta Risiko", "MR Kabar — Tutorial (selingan)")
            .replace("__TIMELINE__", json.dumps(tl, ensure_ascii=False))
            .replace("__KREDIT__", json.dumps(kredit, ensure_ascii=False))
            .replace("__ENGINE__", baca(os.path.join(V6, "engine.js")))
            .replace("__SCENES__", baca(os.path.join(DIR, "scenes.js"))))
    open(os.path.join(DIR, "animation.html"), "w", encoding="utf-8").write(html)
    print(f"animation.html {len(html) // 1024} KB, {tl['total_duration']:.1f} dtk")


if __name__ == "__main__":
    main()
