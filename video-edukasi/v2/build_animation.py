"""
Rakit animation.html dari animation_template.html + symbols.html + scenes.js
+ timeline.json.

Semua angka waktu DIHITUNG dari timeline.json (durasi audio sungguhan), tidak
ada satu pun yang ditulis tangan:
  SCENEMAP -> batas tiap scene
  LINEOFF  -> offset tiap kalimat relatif thd awal scene-nya, dipakai helper
              L(id, off) di scenes.js
Jadi kalau naskah/TTS berubah, koreografi ikut bergeser sendiri.
"""
import json
import os
import re

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))


def main():
    with open(os.path.join(SCRIPT_DIR, "timeline.json"), encoding="utf-8") as f:
        timeline = json.load(f)

    scene_start = {sc["id"]: sc["start"] for sc in timeline["scenes"]}
    line_off = {
        ln["id"]: round(ln["start"] - scene_start[ln["scene"]], 3)
        for ln in timeline["lines"]
    }
    scene_map = [{"id": sc["id"], "start": sc["start"], "end": sc["end"]}
                 for sc in timeline["scenes"]]

    with open(os.path.join(SCRIPT_DIR, "symbols.html"), encoding="utf-8") as f:
        symbols = f.read()
    with open(os.path.join(SCRIPT_DIR, "scenes.js"), encoding="utf-8") as f:
        scenes = f.read()
    with open(os.path.join(SCRIPT_DIR, "animation_template.html"), encoding="utf-8") as f:
        html = f.read()

    html = html.replace("<!--SYMBOLS-->", symbols)
    html = html.replace("/*SCENEMAP*/", json.dumps(scene_map))
    html = html.replace("/*LINEOFF*/", json.dumps(line_off))
    html = html.replace("/*TOTAL*/", str(timeline["total_duration"]))
    html = html.replace("/*SCENES*/", scenes)

    out_path = os.path.join(SCRIPT_DIR, "animation.html")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(html)

    n_sym = symbols.count("<symbol ")
    # objek = tiap entri item di scenes.js, + 25 sel matriks + isi tiap orbit
    n_items = len(re.findall(r"\{k:'", scenes))
    n_matrix = scenes.count("k:'matrix'") * 25
    # hanya orbit yang menulis items:['a','b',...] dalam satu baris; daftar
    # item scene diawali newline+`{k:` sehingga tidak ikut tertangkap
    n_orbit = sum(len(m.split(",")) for m in re.findall(r"items:\[('[^\]]+')\]", scenes))
    total_obj = n_items - scenes.count("k:'matrix'") - scenes.count("k:'orbit'") + n_matrix + n_orbit

    used = set(re.findall(r"sym:'([a-z0-9-]+)'", scenes)) | set(re.findall(r"'([a-z0-9-]+)'", ""))
    defined = set(re.findall(r'<symbol id="i-([a-z0-9-]+)"', symbols))
    missing = sorted(used - defined)

    print(f"animation.html dirakit")
    print(f"  simbol tersedia : {n_sym}")
    print(f"  objek animasi   : {total_obj}  ({n_items} item spec, {n_matrix} sel matriks, {n_orbit} objek orbit)")
    print(f"  scene           : {len(scene_map)}, total {timeline['total_duration']:.1f}s "
          f"({timeline['total_duration']/60:.2f} menit)")
    if missing:
        print(f"  !! SIMBOL TIDAK ADA: {missing}")
    else:
        print(f"  semua simbol yang dirujuk tersedia")


if __name__ == "__main__":
    main()
