"""
Susun SATU track SFX sepanjang video dari pustaka sfx/*.wav.

Kenapa di-bounce jadi satu track di sini, bukan ditumpuk sebagai puluhan
input `adelay`+`amix` di ffmpeg: jumlah cue-nya ratusan, dan menjadikannya
satu stem membuat (a) filtergraph ffmpeg tetap sederhana, (b) SFX bisa
dikirim ke pemutar web sebagai stem terpisah sehingga volumenya bisa diatur
langsung dari /settingsapp tanpa render ulang.

Penempatan cue relatif terhadap AWAL KALIMAT (bukan detik absolut), jadi
kalau durasi narasi berubah, seluruh SFX ikut bergeser sendiri.
"""
import json
import os
import wave

import numpy as np

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
SFX_DIR = os.path.join(SCRIPT_DIR, "sfx")
SR = 44100

# id_kalimat -> [(offset_detik_dari_awal_kalimat, nama_sfx, gain), ...]
CUES = {
    # s1 pembuka
    1:  [(0.3, "alert", 0.55), (3.4, "pop", 0.8), (6.8, "pop", 0.8)],
    2:  [(0.5, "chime_up", 0.9)],
    3:  [(0.4, "ding", 0.8), (3.7, "pop", 0.7), (6.3, "stamp", 0.8)],
    4:  [(2.5, "click", 0.8), (4.3, "click", 0.8), (6.1, "click", 0.8), (7.9, "click", 0.8), (9.1, "success", 0.7)],
    # s2 apa itu kecurangan
    5:  [(0.3, "pageturn", 0.7), (1.7, "swipe", 0.6)],
    6:  [(1.1, "pop", 0.8), (2.0, "pop", 0.8), (2.9, "pop", 0.8)],
    7:  [(0.4, "thud", 0.6), (3.3, "type", 0.6)],
    8:  [(0.4, "stamp", 0.7), (3.7, "type", 0.6)],
    9:  [(0.4, "counter", 0.7), (3.1, "type", 0.6)],
    10: [(0.5, "click", 0.8), (1.0, "click", 0.8), (1.5, "click", 0.8), (2.5, "impact", 0.85),
         (7.3, "pop", 0.75), (9.0, "pop", 0.75), (10.7, "pop", 0.75)],
    # s3 beda dengan kejadian risiko
    11: [(0.7, "swipe", 0.7), (1.5, "swipe", 0.7), (3.3, "ding", 0.7)],
    12: [(0.7, "type", 0.5), (2.5, "pop", 0.7), (5.1, "pop", 0.7), (7.3, "pop", 0.7)],
    13: [(0.9, "type", 0.5), (2.5, "alert", 0.7)],
    14: [(1.7, "click", 0.8), (5.7, "click", 0.8), (11.1, "chime_up", 0.7)],
    # s4 tujuh bentuk
    15: [(0.4, "stamp", 0.9), (8.1, "counter", 0.8)],
    16: [(0.6, "click", 0.85), (3.6, "pop", 0.7), (6.6, "pop", 0.7), (9.6, "pop", 0.7)],
    17: [(0.6, "click", 0.85), (3.3, "pop", 0.7), (5.9, "pop", 0.7), (8.3, "pop", 0.7)],
    18: [(0.6, "click", 0.85), (4.1, "pop", 0.7), (9.1, "pop", 0.7)],
    19: [(0.6, "click", 0.85), (2.9, "pop", 0.7), (6.5, "pop", 0.7)],
    20: [(0.6, "click", 0.85), (3.6, "pop", 0.7), (7.6, "pop", 0.7)],
    21: [(0.6, "click", 0.85), (3.1, "pop", 0.7), (6.6, "pop", 0.7)],
    22: [(0.6, "click", 0.85), (3.1, "pop", 0.7), (7.1, "pop", 0.7), (10.6, "pop", 0.7)],
    23: [(0.4, "success", 0.8), (5.6, "swipe", 0.6), (8.1, "swipe", 0.6)],
    # s5 tanda-tanda
    24: [(0.4, "scan", 0.7)],
    25: [(0.7, "alert", 0.55)],
    26: [(0.7, "alert", 0.55)],
    27: [(0.7, "alert", 0.55)],
    28: [(0.7, "alert", 0.55)],
    29: [(0.7, "alert", 0.55)],
    30: [(0.6, "pop", 0.7), (3.7, "chime_up", 0.8)],
    # s6 dasar hukum & pintu lapor
    31: [(0.4, "stamp", 0.9)],
    32: [(0.7, "type", 0.5), (3.7, "click", 0.8), (4.7, "click", 0.8), (5.7, "click", 0.8)],
    33: [(0.4, "scan", 0.8), (2.5, "pop", 0.7), (3.9, "pop", 0.7), (6.1, "ding", 0.8)],
    34: [(1.1, "whoosh", 0.6), (1.4, "success", 0.7)],
    # s7 cara melapor
    35: [(0.4, "click", 0.85), (1.7, "scan", 0.7), (4.7, "pageturn", 0.7)],
    36: [(0.4, "click", 0.85), (0.9, "pop", 0.8)],
    37: [(0.4, "click", 0.85), (3.1, "pop", 0.7), (4.9, "pop", 0.7), (6.7, "lock", 0.7)],
    38: [(0.4, "click", 0.85), (4.9, "type", 0.6), (6.7, "type", 0.6), (8.1, "type", 0.6), (9.7, "type", 0.6), (11.7, "type", 0.6)],
    39: [(0.9, "swipe", 0.6), (3.9, "swipe", 0.6)],
    40: [(0.4, "click", 0.85), (3.5, "pop", 0.65), (5.1, "pop", 0.65), (6.9, "pop", 0.65), (8.7, "pop", 0.65)],
    41: [(0.4, "click", 0.85), (2.3, "pop", 0.7), (3.3, "pop", 0.7), (4.3, "pop", 0.7), (6.3, "ding", 0.7)],
    42: [(0.4, "click", 0.85), (0.9, "impact", 0.8), (4.7, "pop", 0.75), (5.9, "lock", 0.75), (8.3, "success", 0.8)],
    # s8 perlindungan pelapor
    43: [(0.4, "riser", 0.5)],
    44: [(0.4, "lock", 0.85), (3.3, "pop", 0.7), (4.1, "pop", 0.7), (4.9, "pop", 0.7)],
    45: [(0.4, "scan", 0.8), (2.7, "error", 0.5), (3.5, "error", 0.5), (4.3, "error", 0.5), (5.3, "success", 0.7)],
    46: [(0.4, "lock", 0.8), (10.3, "alert", 0.7)],
    47: [(0.4, "success", 0.8)],
    48: [(0.4, "error", 0.85)],
    # s9 setelah lapor
    49: [(0.7, "pop", 0.75), (2.5, "pop", 0.75), (5.7, "pop", 0.75)],
    50: [(1.6, "ding", 0.7), (5.6, "type", 0.6)],
    51: [(1.3, "click", 0.8), (2.1, "click", 0.8), (2.9, "click", 0.8), (3.7, "success", 0.8)],
    52: [(1.9, "stamp", 0.8), (5.1, "lock", 0.7)],
    # s10 penutup
    53: [(2.5, "thud", 0.7), (3.9, "thud", 0.7)],
    54: [(3.5, "chime_up", 0.8)],
    55: [(0.5, "click", 0.8), (1.5, "click", 0.8), (2.5, "click", 0.8)],
    56: [(0.4, "chime_up", 1.0), (4.1, "impact", 0.6)],
}

# SFX otomatis di tiap pergantian scene (selain scene pertama)
SCENE_WHOOSH_LEAD = 0.30
SCENE_WHOOSH_GAIN = 0.75


def read_wav(path):
    with wave.open(path, "r") as wf:
        frames = wf.readframes(wf.getnframes())
    return np.frombuffer(frames, dtype=np.int16).astype(np.float64) / 32767.0


def main():
    with open(os.path.join(SCRIPT_DIR, "timeline.json"), "r", encoding="utf-8") as f:
        timeline = json.load(f)

    total = timeline["total_duration"]
    bus = np.zeros(int(total * SR))
    lib = {name[:-4]: read_wav(os.path.join(SFX_DIR, name))
           for name in os.listdir(SFX_DIR) if name.endswith(".wav")}

    placed = 0

    def place(t, name, gain):
        nonlocal placed
        if name not in lib:
            raise KeyError(f"SFX '{name}' tidak ada di sfx/")
        s0 = int(t * SR)
        if s0 < 0 or s0 >= len(bus):
            return
        snd = lib[name] * gain
        end = min(s0 + len(snd), len(bus))
        bus[s0:end] += snd[: end - s0]
        placed += 1

    for sc in timeline["scenes"][1:]:
        place(sc["start"] - SCENE_WHOOSH_LEAD, "whoosh", SCENE_WHOOSH_GAIN)

    by_id = {ln["id"]: ln for ln in timeline["lines"]}
    for line_id, cues in CUES.items():
        line = by_id.get(line_id)
        if line is None:
            continue
        for offset, name, gain in cues:
            # jangan biarkan cue melompat keluar kalimatnya sendiri
            if offset > line["duration"] + 0.6:
                continue
            place(line["start"] + offset, name, gain)

    peak = np.max(np.abs(bus))
    if peak > 0.95:
        bus *= 0.95 / peak

    out = os.path.join(SCRIPT_DIR, "sfx_bus.wav")
    with wave.open(out, "w") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(SR)
        wf.writeframes((np.clip(bus, -1, 1) * 32767).astype(np.int16).tobytes())
    print(f"sfx_bus.wav: {placed} cue ditempatkan, {total:.1f}s, puncak {peak:.2f}")


if __name__ == "__main__":
    main()
