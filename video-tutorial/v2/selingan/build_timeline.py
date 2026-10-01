"""
Garis waktu ADEGAN ANIMASI (selingan) tutorial v2 -> timeline.json + narasi.wav

Seluruh selingan dirender sebagai SATU animasi panjang (mesin video edukasi
v6), adegan demi adegan berurutan, lalu dipotong per adegan oleh rakit.py dan
diselipkan di antara rekaman bab. Satu animasi, bukan puluhan berkas kecil,
karena dunia laut, huruf, dan butiran filmnya harus identik di semua kartu.

Panjang tiap adegan mengikuti narasinya sendiri:
  buka        AWAL_BUKA dtk laut + judul lebih dulu, lalu lima kalimat
  kartu-N     PRA_KARTU dtk (whoosh, peta rute bergerak) + satu kalimat + PASCA_KARTU
  catatan-N   PRA_CATATAN + satu kalimat (poin muncul per kata) + PASCA_CATATAN
  tutup       kalimat penutup, hak cipta, lalu EKOR dtk kredit bergulir

Bentuk timeline.json sama dengan v6 (scenes/cards/lines/words), sehingga
engine.js v6 bisa dipakai apa adanya.

    python build_timeline.py
"""
import json
import os
import subprocess
import wave

import numpy as np

DIR = os.path.dirname(os.path.abspath(__file__))
V2 = os.path.dirname(DIR)
SR = 48000

AWAL_BUKA = 3.6
PRA_KARTU, PASCA_KARTU = 1.0, 1.15
PRA_CATATAN, PASCA_CATATAN = 0.7, 1.6
EKOR = 19.0
JEDA_SESUDAH = {"s001": 0.9, "s003": 0.3, "s004": 0.3, "s029": 0.3, "s031": 0.5, "s032": 1.4}


def decode(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-f", "s16le", "-ac", "1", "-ar", str(SR), "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768.0


def main():
    naskah = json.load(open(os.path.join(V2, "naskah.json"), encoding="utf-8"))
    sel = json.load(open(os.path.join(V2, "selingan.json"), encoding="utf-8"))
    waktu = json.load(open(os.path.join(V2, "audio", "waktu.json"), encoding="utf-8"))
    per_adegan = {}
    for s in sel:
        per_adegan.setdefault(s["adegan"], []).append(s)

    kursor = 0.0
    adegan, lines, klip = [], [], []
    for a in naskah["urutan"]:
        if a.startswith("rekam-"):
            continue
        mulai = kursor
        jenis = a.split("-")[0]
        kursor += {"buka": AWAL_BUKA, "kartu": PRA_KARTU, "catatan": PRA_CATATAN, "tutup": 0.9}[jenis]
        pertama = None
        for s in per_adegan[a]:
            w = waktu[s["id"]]
            pcm = decode(os.path.join(V2, "audio", f"{s['id']}.mp3"))[int(w["a"] * SR):int(w["b"] * SR)]
            st = kursor
            klip.append((st, pcm))
            pertama = pertama if pertama is not None else st
            lines.append({"id": s["id"], "scene": a, "voice": s["voice"], "display": s["display"],
                          "start": round(st, 3), "end": round(st + w["dur"], 3),
                          "words": [{"t": round(st + k["t"], 3), "d": k["d"], "w": k["w"]} for k in w["kata"]],
                          **({"poin": s["poin"], "pemicu": s["pemicu"]} if "poin" in s else {})})
            kursor = st + w["dur"] + w["jeda"] + JEDA_SESUDAH.get(s["id"], 0.0)
        kursor -= waktu[per_adegan[a][-1]["id"]]["jeda"]
        kursor += {"buka": 1.2, "kartu": PASCA_KARTU, "catatan": PASCA_CATATAN, "tutup": EKOR}[jenis]
        adegan.append({"id": a, "start": round(mulai, 3), "end": round(kursor, 3), "first_line": pertama})

    total = round(kursor, 3)
    buf = np.zeros(int(total * SR) + SR, dtype=np.float32)
    for st, pcm in klip:
        o = int(st * SR)
        buf[o:o + len(pcm)] += pcm
    with wave.open(os.path.join(DIR, "narasi.wav"), "wb") as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(SR)
        f.writeframes((np.clip(buf, -1, 1) * 32767).astype(np.int16).tobytes())

    json.dump({"total_duration": total, "lead_in": 0, "scenes": adegan, "cards": [], "lines": lines,
               "kartu": naskah["kartu"]},
              open(os.path.join(DIR, "timeline.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"selingan {total:.1f} dtk, {len(adegan)} adegan, {len(lines)} kalimat")
    for s in adegan:
        print(f"  {s['id']:12} {s['start']:7.2f} -> {s['end']:7.2f}  ({s['end'] - s['start']:.1f})")


if __name__ == "__main__":
    main()
