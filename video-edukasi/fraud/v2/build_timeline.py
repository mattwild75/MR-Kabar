"""
Susun timeline NYATA dari audio narasi + waktu kata, lalu tulis:

  timeline.json       start/end tiap kalimat (detik absolut), waktu tiap kata,
                      batas scene, kartu judul babak, total durasi — dibaca
                      animasi, musik, SFX, dan pembuat bab
  narration_full.wav  satu jalur narasi utuh (hening edge-tts dipangkas)
  subtitle.srt        potongan <= 2 baris, waktunya dari waktu kata

Irama (gaya dokumenter, sedikit lebih rapat dari video edukasi utama v6):
  - LEAD_IN: laut dan musik lebih dulu, baru narasi.
  - Jeda antarkalimat 0,42 dtk; setelah pertanyaan 0,75 dtk.
  - Sebelum tiap babak ada kartu judul (KARTU dtk) tanpa narasi: ruang
    untuk transisi visual + aksen musik.
  - Jeda dramatis per kalimat di JEDA_SESUDAH.
"""
import json
import os
import subprocess
import wave

import numpy as np

DIR = os.path.dirname(os.path.abspath(__file__))
SR = 48000

LEAD_IN = 4.0
GAP = 0.42
GAP_TANYA = 0.75
KARTU = 3.2          # kartu judul babak, sebelum kalimat pertama scene s2..s11
EKOR = 18.0          # sesudah kalimat terakhir: kredit bergulir

# Jeda tambahan SESUDAH kalimat tertentu (detik), di atas jeda biasa.
JEDA_SESUDAH = {
    1: 0.5,     # badai = risiko
    2: 1.2,     # lambung dibor dari dalam
    3: 0.9,     # awak yang diam
    4: 0.6,
    5: 4.4,     # judul besar BUNYIKAN LONCENG
    6: 0.4,
    8: 0.7,     # definisi
    9: 0.6,
    11: 0.7,    # badai vs lubang dibor
    12: 0.5,
    14: 0.6,    # pintu Dugaan Kecurangan
    16: 0.3,
    17: 0.3,
    18: 0.3,
    19: 1.0,    # bisikan pembenaran
    20: 1.1,    # "sudah biasa"
    22: 0.8,
    23: 0.5,    # tujuh bentuk diumumkan
    31: 0.6,    # gratifikasi 30 hari kerja
    33: 0.4,
    37: 0.4,
    38: 0.6,    # 84 persen
    40: 0.6,
    41: 0.5,
    43: 0.5, 45: 0.5, 47: 0.5, 49: 0.5, 51: 0.6,   # lima jawaban
    52: 0.7,    # diam itu mahal
    53: 0.6,
    55: 0.8,
    57: 0.7,    # contoh fakta
    58: 0.3,
    59: 0.3,
    61: 0.3,
    62: 0.3,
    63: 0.4,
    64: 0.8,
    65: 0.8,    # pindai QR
    66: 0.6,
    67: 0.8,    # tiga mode identitas
    68: 0.6,
    69: 0.6,
    70: 0.5,
    71: 0.9,    # tiket + kode akses
    72: 0.8,
    74: 0.4,
    75: 0.4,
    76: 0.5,
    77: 0.5,
    79: 0.6,
    80: 0.9,    # iktikad baik
    82: 0.4,
    83: 0.5,
    84: 0.6,
    85: 0.4,
    86: 0.8,
    88: 0.9,    # pelajaran 1
    89: 0.9,
    90: 1.1,
    91: 0.4,
    92: 1.1,    # toleransi nol
    93: 0.5,
    94: 1.6,    # kalimat penutup
    95: 1.2,    # jeda sebelum baris hak cipta
}


def decode(path: str) -> np.ndarray:
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", path, "-f", "s16le", "-ac", "1", "-ar", str(SR), "-"],
        capture_output=True, check=True,
    ).stdout
    return np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768.0


def srt_t(s: float) -> str:
    ms = int(round(s * 1000))
    h, ms = divmod(ms, 3_600_000)
    m, ms = divmod(ms, 60_000)
    d, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{d:02d},{ms:03d}"


def potong_subtitle(display: str, start: float, end: float, maks: int = 84) -> list[tuple[float, float, str]]:
    """Pecah kalimat panjang di tanda baca; waktu dibagi menurut jumlah huruf."""
    kata = display.split()
    potong, cur = [], []
    for w in kata:
        cur.append(w)
        teks = " ".join(cur)
        if (len(teks) >= maks * 0.55 and w[-1] in ",.;:?!") or len(teks) >= maks:
            potong.append(teks)
            cur = []
    if cur:
        if potong and len(" ".join(cur)) < 18:
            potong[-1] += " " + " ".join(cur)
        else:
            potong.append(" ".join(cur))
    total = sum(len(p) for p in potong)
    keluar, t = [], start
    for p in potong:
        d = (end - start) * len(p) / total
        keluar.append((t, t + d, p))
        t += d
    return keluar


def main():
    with open(os.path.join(DIR, "lines.json"), encoding="utf-8") as f:
        lines = json.load(f)
    with open(os.path.join(DIR, "chapters_naskah.json"), encoding="utf-8") as f:
        bab = json.load(f)

    kursor = LEAD_IN
    tl, klip = [], []
    adegan_lalu = None
    kartu = []
    for i, l in enumerate(lines):
        if l["scene"] != adegan_lalu and l["scene"] != "s1":
            kartu.append({"scene": l["scene"], "start": round(kursor, 3), "end": round(kursor + KARTU, 3)})
            kursor += KARTU
        adegan_lalu = l["scene"]

        nama = os.path.join(DIR, "audio", f"line_{l['id']:03d}")
        kata = json.load(open(nama + ".words.json", encoding="utf-8"))
        pcm = decode(nama + ".mp3")
        a = max(0.0, kata[0]["t"] - 0.06)
        b = min(len(pcm) / SR, kata[-1]["t"] + kata[-1]["d"] + 0.22)
        potongan = pcm[int(a * SR):int(b * SR)]
        start = kursor
        end = start + len(potongan) / SR
        klip.append((start, potongan))
        tl.append({
            "id": l["id"], "scene": l["scene"], "voice": l["voice"], "display": l["display"],
            "start": round(start, 3), "end": round(end, 3),
            "words": [{"t": round(start + w["t"] - a, 3), "d": round(w["d"], 3), "w": w["w"]} for w in kata],
        })
        kursor = end + (GAP_TANYA if l["display"].rstrip().endswith("?") else GAP) + JEDA_SESUDAH.get(l["id"], 0.0)

    total = round(tl[-1]["end"] + EKOR, 3)

    adegan = []
    for s in [b["id"] for b in bab]:
        ls = [x for x in tl if x["scene"] == s]
        k = next((c for c in kartu if c["scene"] == s), None)
        adegan.append({"id": s, "start": k["start"] if k else 0.0, "end": None, "first_line": ls[0]["start"]})
    for i, s in enumerate(adegan):
        s["end"] = adegan[i + 1]["start"] if i + 1 < len(adegan) else total

    buf = np.zeros(int(total * SR) + SR, dtype=np.float32)
    for start, pcm in klip:
        o = int(start * SR)
        buf[o:o + len(pcm)] += pcm
    with wave.open(os.path.join(DIR, "narration_full.wav"), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((np.clip(buf, -1, 1) * 32767).astype(np.int16).tobytes())

    with open(os.path.join(DIR, "timeline.json"), "w", encoding="utf-8") as f:
        json.dump({"total_duration": total, "lead_in": LEAD_IN, "scenes": adegan, "cards": kartu, "lines": tl},
                  f, ensure_ascii=False, indent=1)

    n = 0
    with open(os.path.join(DIR, "subtitle.srt"), "w", encoding="utf-8") as f:
        for x in tl:
            for a, b, teks in potong_subtitle(x["display"], x["start"], x["end"]):
                n += 1
                f.write(f"{n}\n{srt_t(a)} --> {srt_t(b)}\n{teks}\n\n")

    print(f"Total {total:.1f} dtk ({int(total // 60)}:{total % 60:04.1f}), {len(tl)} kalimat, {n} potongan subtitle")
    for s in adegan:
        print(f"  {s['id']:4s} {s['start']:7.1f} -> {s['end']:7.1f}")


if __name__ == "__main__":
    main()
