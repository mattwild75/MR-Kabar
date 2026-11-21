"""
Garis waktu NYATA film v7 dari suara per kalimat (audio/line_NNN.wav +
.words.json) -> timeline.json + narasi_penuh.wav.

Irama:
  - Pembuka: badai langsung tampil (MULA), "Tunggu." -> bunyi waktu diulang,
    dermaga pagi, kartu judul sebelum "Yuk, berlayar!".
  - Tiap babak lain diawali KARTU BABAK (tanpa suara), lalu set adegan masuk.
  - Antarkalimat: naskah.jeda_giliran (rapat saat bersahutan, longgar saat
    berganti gagasan).
  - Penutup: badai kalah menjadi pelangi, lalu logo, hak cipta, kredit foto.

Jeda khusus di bawah dirujuk lewat AWAL KALIMAT (bukan nomor) supaya tetap
benar bila naskah disunting.

    python bangun_timeline.py
"""
import json
import os
import subprocess

import numpy as np

import naskah as NS
from suara import FFMPEG

DIR = os.path.dirname(os.path.abspath(__file__))
SR = 48000
FPS = 30

MULA = 1.2            # badai sudah mengamuk sebelum Si Badai bicara
KARTU_BABAK = 3.2     # kartu babak tampil sendirian
MASUK_SET = 1.3       # set adegan masuk sesudah kartu, sebelum kalimat pertama
EKOR = 13.0           # sesudah kalimat terakhir: logo, hak cipta, kredit foto
KARTU_INGAT = 2.8     # catatan inti di akhir babak 1-10
BABAK_INGAT = {f"s{i}" for i in range(2, 12)}

# jeda tambahan SEBELUM kalimat yang diawali teks ini (detik)
SEBELUM = {
    "Kita ulang.": 1.55,                     # bunyi gulungan waktu mundur, dermaga muncul
    "Di pesisir barat Aceh": 0.6,
    "Yuk, berlayar!": 3.6,                   # kartu judul film
    "Lalu, apa pelajarannya": 2.2,           # Si Badai terurai menjadi pelangi
    "Dampak lima, kemungkinan satu": 0.5,    # keping pertama jatuh di matriks
    "Sekarang, mari ikuti satu risiko": 0.4,
    "Pertama. Risiko bukan": 0.4,
    "Video ini disusun": 0.6,
    "MR Kabar. Risiko TerKabar": 0.8,        # logo resmi muncul
}


def baca(path):
    p = subprocess.run([FFMPEG, "-v", "error", "-i", path, "-f", "s16le", "-ac", "1", "-ar", str(SR), "pipe:1"],
                       capture_output=True, check=True)
    return np.frombuffer(p.stdout, dtype=np.int16).astype(np.float32) / 32768.0


def jeda_sebelum(display):
    return sum(v for k, v in SEBELUM.items() if display.startswith(k))


def main():
    NS.main()
    with open(os.path.join(DIR, "lines.json"), encoding="utf-8") as f:
        lines = json.load(f)
    judul = {s: j for s, j, _ in NS.BAB}
    sasaran = {s: sa for s, _, sa in NS.BAB}

    kursor = 0.0
    tl, klip, adegan = [], [], []
    lalu = None
    for l in lines:
        s = l["scene"]
        if lalu is None or s != lalu["scene"]:
            if adegan:
                if lalu["scene"] in BABAK_INGAT:
                    adegan[-1]["ingat"] = {"start": round(kursor + 0.2, 3), "end": round(kursor + KARTU_INGAT, 3)}
                    kursor += KARTU_INGAT
                adegan[-1]["end"] = round(kursor, 3)
            mulai = kursor
            if s == "s1":
                kursor += MULA
                kartu = None
            else:
                kartu = {"start": round(kursor, 3), "end": round(kursor + KARTU_BABAK, 3)}
                kursor += KARTU_BABAK + MASUK_SET
            adegan.append({"id": s, "judul": judul[s], "sasaran": sasaran[s], "start": round(mulai, 3),
                           "kartu": kartu, "isi": round(kursor, 3)})
        else:
            kursor += NS.jeda_giliran(lalu, l)
        kursor += jeda_sebelum(l["display"])

        nama = os.path.join(DIR, "audio", f"line_{l['id']:03d}")
        pcm = baca(nama + ".wav")
        with open(nama + ".words.json", encoding="utf-8") as f:
            kata = json.load(f)
        start = kursor
        end = start + len(pcm) / SR
        klip.append((start, pcm))
        tl.append({
            "id": l["id"], "scene": s, "tokoh": l["tokoh"], "rasa": l["rasa"], "display": l["display"],
            "start": round(start, 3), "end": round(end, 3),
            "words": [{"t": round(start + w["t"], 3), "d": w["d"], "w": w["w"]} for w in kata],
        })
        kursor = end
        lalu = l
    adegan[-1]["end"] = round(kursor + EKOR, 3)
    total = round(kursor + EKOR, 3)

    buf = np.zeros(int(total * SR) + SR, dtype=np.float32)
    for start, p in klip:
        o = int(start * SR)
        buf[o:o + len(p)] += p
    raw = (np.clip(buf, -1, 1) * 32767).astype(np.int16).tobytes()
    subprocess.run([FFMPEG, "-v", "error", "-y", "-f", "s16le", "-ar", str(SR), "-ac", "1", "-i", "pipe:0",
                    os.path.join(DIR, "narasi_penuh.wav")], input=raw, check=True)

    with open(os.path.join(DIR, "timeline.json"), "w", encoding="utf-8") as f:
        json.dump({"fps": FPS, "total_duration": total, "mula": MULA,
                   "konstanta": {"KARTU_BABAK": KARTU_BABAK, "MASUK_SET": MASUK_SET, "EKOR": EKOR, "KARTU_INGAT": KARTU_INGAT},
                   "scenes": adegan, "lines": tl}, f, ensure_ascii=False, indent=1)
    print(f"total {total:.1f} dtk ({int(total // 60)}:{total % 60:04.1f}), {len(tl)} kalimat")
    for a in adegan:
        d = a["end"] - a["start"]
        print(f"  {a['id']:>4} {a['start']:7.1f}-{a['end']:7.1f}  {int(d // 60)}:{d % 60:04.1f}  {a['judul']}")


if __name__ == "__main__":
    main()
