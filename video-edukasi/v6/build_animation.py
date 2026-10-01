"""
Rakit animation.html = template.html + timeline.json + kredit foto
+ engine.js + scenes.js. Berkas aset (fonts/, foto/, shots/, img/) dirujuk
relatif, jadi animation.html harus tetap di folder ini.

    python build_animation.py
"""
import json
import os

DIR = os.path.dirname(os.path.abspath(__file__))


def baca(n):
    with open(os.path.join(DIR, n), encoding="utf-8") as f:
        return f.read()


def main():
    tl = json.loads(baca("timeline.json"))
    # kata-kata cukup start + teks; durasi tidak dipakai animasi
    kredit = json.loads(baca(os.path.join("foto", "kredit.json")))
    html = (baca("template.html")
            .replace("__TIMELINE__", json.dumps(tl, ensure_ascii=False))
            .replace("__KREDIT__", json.dumps(kredit, ensure_ascii=False))
            .replace("__ENGINE__", baca("engine.js"))
            .replace("__SCENES__", baca("scenes.js")))
    with open(os.path.join(DIR, "animation.html"), "w", encoding="utf-8") as f:
        f.write(html)
    print(f"animation.html {len(html) // 1024} KB, total {tl['total_duration']:.1f} dtk")


if __name__ == "__main__":
    main()
