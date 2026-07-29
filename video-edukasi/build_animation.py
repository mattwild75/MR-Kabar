"""
Rakit animation.html dari animation_template.html + symbols.html + timeline.json.

Peta scene DIHITUNG dari timeline.json (bukan ditulis tangan) supaya batas
scene selalu jatuh persis di batas kalimat narasi. Ini sekaligus memperbaiki
bug versi lama: s5 & s6 dulu punya rentang identik sehingga scene "5 Tahap"
tidak pernah tampil sama sekali.
"""
import json
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

# scene -> (id baris narasi pertama, id baris terakhir)
SCENE_LINES = {
    "s1": (1, 3), "s2": (4, 6), "s3": (7, 8), "s4": (9, 13), "s5": (14, 16),
    "s6": (17, 19), "s7": (20, 22), "s8": (23, 28), "s9": (29, 32),
    "s10": (33, 35), "s11": (36, 38),
}
TAIL = 0.4  # jeda antar-kalimat, dipakai sbg ekor scene terakhir


def main():
    with open(os.path.join(SCRIPT_DIR, "timeline.json"), encoding="utf-8") as f:
        timeline = json.load(f)
    lines = {l["id"]: l for l in timeline["lines"]}

    scenes = []
    for sid, (a, b) in SCENE_LINES.items():
        scenes.append({
            "id": sid,
            "start": round(lines[a]["start"], 3),
            "end": round(lines[b]["end"] + TAIL, 3),
        })

    with open(os.path.join(SCRIPT_DIR, "symbols.html"), encoding="utf-8") as f:
        symbols = f.read()
    with open(os.path.join(SCRIPT_DIR, "animation_template.html"), encoding="utf-8") as f:
        tpl = f.read()

    out = tpl.replace("<!--SYMBOLS-->", symbols)
    out = out.replace("/*SCENEMAP*/", json.dumps(scenes, indent=2))

    out_path = os.path.join(SCRIPT_DIR, "animation.html")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(out)

    n_sym = symbols.count("<symbol ")
    n_use = out.count("<use href=")
    print(f"animation.html dirakit: {n_sym} simbol unik, {n_use} objek dipakai, "
          f"{len(scenes)} scene, total {timeline['total_duration']:.1f}s")
    for s in scenes:
        print(f"  {s['id']:>3}  {s['start']:7.2f} -> {s['end']:7.2f}  ({s['end']-s['start']:5.2f}s)")


if __name__ == "__main__":
    main()
