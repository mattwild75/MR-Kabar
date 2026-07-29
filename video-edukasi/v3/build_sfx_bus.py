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
    3:  [(1.6, "thud", 1.0)],
    4:  [(0.15, "chime_up", 0.9)],
    6:  [(0.0, "pageturn", 0.7)],
    7:  [(1.2, "pop", 0.8), (2.2, "pop", 0.8), (3.2, "pop", 0.8)],
    8:  [(3.0, "error", 0.8)],
    9:  [(0.4, "swipe", 0.6)],
    10: [(0.4, "swipe", 0.6)],
    11: [(0.5, "click", 0.8), (1.6, "click", 0.8), (2.7, "click", 0.8), (3.8, "click", 0.8)],
    12: [(0.3, "stamp", 0.9)],
    13: [(0.5, "type", 0.7)],
    14: [(0.4, "type", 0.7)],
    15: [(0.4, "type", 0.7)],
    16: [(0.3, "alert", 0.8)],
    17: [(0.6, "thud", 0.9), (4.5, "whoosh_down", 0.7)],
    18: [(0.4, "success", 0.85), (6.0, "lock", 0.7)],
    19: [(0.3, "ding", 0.8)],
    21: [(0.5, "stamp", 0.9)],
    22: [(0.5, "stamp", 0.75)],
    23: [(1.2, "pop", 0.8), (4.0, "pop", 0.8), (7.0, "pop", 0.8), (9.5, "pop", 0.8)],
    24: [(0.3, "swipe", 0.7)],
    25: [(1.0, "click", 0.85), (5.0, "click", 0.85), (9.5, "click", 0.85)],
    26: [(0.5, "alert", 0.6)],
    27: [(0.3, "ding", 0.8)],
    28: [(0.4, "pop", 0.8)],
    29: [(0.4, "pop", 0.8)],
    30: [(0.4, "pop", 0.8)],
    31: [(0.5, "counter", 0.7)],
    32: [(0.6, "click", 0.7), (2.0, "click", 0.7), (3.4, "click", 0.7)],

    33: [(0.2, "impact", 0.8)],
    34: [(0.6, "pop", 0.9), (2.2, "pop", 0.9), (3.8, "pop", 0.9), (5.4, "pop", 0.9), (7.0, "pop", 0.9)],
    35: [(0.5, "type", 0.6)],
    36: [(0.4, "swipe", 0.7)],

    37: [(0.2, "stamp", 0.9)],
    38: [(0.6, "scan", 0.6)],
    39: [(0.6, "lock", 0.8)],
    40: [(1.0, "click", 0.85), (4.5, "click", 0.85), (8.5, "click", 0.85)],
    41: [(0.6, "alert", 0.8)],
    42: [(2.4, "error", 0.9)],

    43: [(0.2, "pageturn", 0.8)],
    44: [(0.4, "swipe", 0.7)],
    45: [(0.5, "lock", 0.8)],
    46: [(0.5, "lock", 0.8)],
    47: [(0.5, "lock", 0.8)],
    48: [(2.6, "chime_up", 0.7)],

    49: [(0.3, "swipe", 0.7)],
    50: [(0.3, "alert", 0.9)],
    51: [(1.4, "error", 0.9)],
    52: [(1.4, "error", 0.9)],
    53: [(0.4, "ding", 0.8)],
    54: [(3.0, "success", 0.9)],

    55: [(0.6, "type", 0.8)],
    56: [(0.5, "type", 0.8)],
    57: [(0.5, "lock", 0.8), (3.0, "lock", 0.8)],
    58: [(0.4, "click", 0.8)],
    59: [(0.5, "counter", 0.8), (4.0, "stamp", 0.7)],

    60: [(0.3, "swipe", 0.7)],
    61: [(0.4, "ding", 0.7)],
    62: [(1.0, "counter", 0.8)],
    63: [(0.5, "alert", 0.6)],

    64: [(0.3, "swipe", 0.8)],
    65: [(0.4, "alert", 0.9)],
    66: [(1.2, "pop", 0.95), (3.4, "pop", 0.95)],
    67: [(0.4, "ding", 0.85)],
    68: [(1.0, "thud", 0.85)],
    69: [(2.2, "success", 0.9)],

    70: [(0.3, "stamp", 0.9)],
    71: [(0.5, "counter", 0.7)],
    72: [(0.5, "pop", 0.9), (2.6, "pop", 0.9), (4.6, "pop", 0.9), (6.6, "pop", 0.9), (10.0, "pop", 0.9)],
    73: [(0.5, "click", 0.8), (2.4, "click", 0.8), (5.0, "lock", 0.8)],
    74: [(0.5, "click", 0.8), (3.4, "click", 0.8)],

    75: [(0.3, "ding", 0.85)],
    76: [(0.5, "pop", 0.9), (3.4, "pop", 0.9)],
    77: [(0.4, "pop", 0.9), (2.6, "pop", 0.9)],
    78: [(1.6, "click", 0.8), (2.6, "click", 0.8), (3.6, "click", 0.8), (4.6, "click", 0.8)],
    79: [(3.2, "chime_up", 0.75)],

    80: [(0.2, "pageturn", 0.8)],
    81: [(2.0, "swipe", 0.7), (4.0, "swipe", 0.7)],
    82: [(2.6, "stamp", 0.9)],
    83: [(1.2, "swipe", 0.7), (3.2, "chime_up", 0.6)],

    84: [(0.3, "scan", 0.8)],
    85: [(0.6, "scan", 0.7)],
    86: [(1.2, "click", 0.8), (4.2, "click", 0.8), (7.4, "click", 0.8)],
    87: [(1.6, "ding", 0.85)],
    88: [(3.0, "stamp", 0.8)],

    89: [(0.4, "chime_up", 0.8)],
    90: [(0.6, "counter", 0.8)],
    91: [(0.5, "counter", 0.8)],
    92: [(0.6, "thud", 0.7)],

    93: [(0.3, "pageturn", 0.7)],
    95: [(0.6, "click", 0.85)],
    96: [(0.5, "click", 0.85), (2.2, "click", 0.85), (3.8, "click", 0.85)],
    98: [(1.6, "chime_up", 1.0)],

    # ── cue untuk kalimat baru v3 ──
    101: [(0.4, "click", 0.85)],
    102: [(0.4, "click", 0.85)],
    103: [(0.4, "click", 0.85), (3.0, "lock", 0.7)],
    104: [(0.6, "type", 0.75), (2.2, "pop", 0.8), (3.7, "pop", 0.8), (5.2, "pop", 0.8)],
    105: [(0.6, "pop", 0.8), (3.0, "pop", 0.8), (5.4, "pop", 0.8), (7.4, "pop", 0.8)],
    106: [(0.4, "counter", 0.8), (2.0, "swipe", 0.7)],
    107: [(0.4, "swipe", 0.7), (0.9, "pop", 0.75), (1.5, "pop", 0.75), (2.1, "pop", 0.75),
          (2.7, "pop", 0.75), (3.3, "pop", 0.75)],
    108: [(0.7, "ding", 0.75)],
    109: [(0.7, "alert", 0.8), (2.6, "swipe", 0.6)],
    110: [(0.6, "stamp", 0.85), (1.8, "lock", 0.7)],
    111: [(0.6, "click", 0.8), (2.0, "click", 0.8), (3.4, "click", 0.8), (4.8, "success", 0.8)],
    112: [(0.6, "alert", 0.8), (4.0, "lock", 0.7)],
    113: [(0.4, "pageturn", 0.7), (0.8, "click", 0.75), (2.7, "swipe", 0.7)],
    114: [(0.7, "click", 0.75), (3.5, "click", 0.75), (5.1, "swipe", 0.7)],

    115: [(0.3, "pageturn", 0.8)],
    116: [(0.7, "pop", 0.85), (1.5, "swipe", 0.7)],
    117: [(0.6, "pop", 0.85), (1.3, "lock", 0.7)],
    118: [(0.6, "pop", 0.85), (1.4, "swipe", 0.7)],
    119: [(0.6, "pop", 0.85), (1.4, "scan", 0.6), (3.3, "ding", 0.8)],
    120: [(0.6, "pop", 0.85), (1.5, "swipe", 0.7), (3.1, "pop", 0.85)],
    121: [(0.6, "pop", 0.85), (1.5, "swipe", 0.7), (4.1, "chime_up", 0.7)],

    122: [(0.4, "impact", 0.75)],
    123: [(0.4, "click", 0.85), (0.9, "lock", 0.75)],
    124: [(0.4, "click", 0.85), (1.0, "pop", 0.8), (1.7, "pop", 0.9), (2.4, "pop", 0.8),
          (3.1, "swipe", 0.7), (5.1, "success", 0.85)],
    125: [(0.7, "lock", 0.8), (2.3, "alert", 0.8)],
    126: [(0.7, "counter", 0.8), (2.5, "alert", 0.9), (4.3, "thud", 0.8)],
    127: [(0.9, "click", 0.8), (2.7, "stamp", 0.8)],
    128: [(0.6, "pop", 0.8), (1.7, "pop", 0.8), (3.3, "pop", 0.8)],
    129: [(0.9, "ding", 0.8), (2.7, "swipe", 0.75), (4.5, "chime_up", 0.85)],

    130: [(0.5, "stamp", 0.9), (2.7, "ding", 0.7)],
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
