"""
Sintesis musik latar + pustaka SFX, murni numpy (tanpa layanan musik pihak ketiga).

MUSIK v4 -- "Corporate Ambient, Formal & Modern" yang berkembang:
  100 BPM (ketuk 0.6s, bar 2.4s). Delapan layer:
    pad (warm, sine ber-detune)          -> dasar harmoni
    guitar (Karplus-Strong, fingerpick)   -> tekstur akustik tipis
    rhodes (FM 2-operator)                -> electric piano lembut
    bell (marimba/celesta-ish)            -> aksen tinggi, sparse
    bass (sine bulat)                     -> pondasi
    lead (soft synth, motif berulang)     -> identitas melodi
    perc (kick, rim, snare sikat, hi-hat, -> groove per suasana, ber-ayun,
          shaker, tepuk, tom, kerincing)      dengan isian di ujung frasa
    riser/impact                          -> penanda pergantian scene

  Struktur section dibangun OTOMATIS dari `scenes` di timeline.json, jadi
  musik berganti nuansa TEPAT saat topik berganti dan tidak akan pernah
  melenceng kalau naskah berubah panjang. Tiap scene dipetakan ke satu
  "mood" (lihat MOODS) yang menentukan progresi akor + gain tiap layer.

  Level: musik sengaja dibuat lebih tebal & lebih keras dari versi
  sebelumnya. Yang menjaga narasi tetap menang BUKAN musik yang dipelankan
  terus-menerus, melainkan sidechain ducking di tahap mixing (mix_audio.py)
  -- musik penuh di sela kalimat, otomatis turun saat ada suara.
"""
import json
import os
import sys
import wave

import numpy as np

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
SFX_DIR = os.path.join(SCRIPT_DIR, "sfx")
SR = 44100

BPM = 100.0
BEAT = 60.0 / BPM
BAR = BEAT * 4


def write_wav(path, samples, sr=SR):
    samples = np.clip(samples, -1.0, 1.0)
    with wave.open(path, "w") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sr)
        wf.writeframes((samples * 32767).astype(np.int16).tobytes())


def adsr(n, sr=SR, attack=0.05, decay=0.1, sustain=0.7, release=0.3):
    a, d, r = int(attack * sr), int(decay * sr), int(release * sr)
    s = max(n - a - d - r, 0)
    env = np.concatenate([
        np.linspace(0, 1, a, endpoint=False) if a else np.array([]),
        np.linspace(1, sustain, d, endpoint=False) if d else np.array([]),
        np.full(s, sustain),
        np.linspace(sustain, 0, r) if r else np.array([]),
    ])
    return np.pad(env, (0, max(n - len(env), 0)))[:n]


# ────────────────────────────── INSTRUMEN ──────────────────────────────
# Semua di-cache: satu bunyi yang sama dipakai ratusan kali sepanjang lagu,
# dan beberapa (Karplus) mahal utk dihitung ulang.

_CACHE = {}


def _cached(key, fn):
    if key not in _CACHE:
        _CACHE[key] = fn()
    return _CACHE[key]


def pad_chord(freqs, duration, vol=0.12):
    key = ("pad", tuple(np.round(freqs, 2)), round(duration, 3))

    def build():
        n = int(SR * duration)
        t = np.linspace(0, duration, n, endpoint=False)
        mix = np.zeros(n)
        for f in freqs:
            for det in (-0.6, 0.0, 0.6):
                mix += np.sin(2 * np.pi * (f + det) * t)
            mix += 0.25 * np.sin(2 * np.pi * f * 2 * t)
        mix /= (len(freqs) * 3.25)
        return mix * adsr(n, attack=duration * 0.35, decay=duration * 0.1,
                          sustain=0.85, release=duration * 0.35)

    return _cached(key, build) * vol


def guitar_pluck(freq, duration=1.2, vol=0.30):
    """Karplus-Strong: buffer noise satu periode, dibaca berulang sambil
    di-lowpass tiap lewat -> harmonik tinggi luruh lebih cepat, persis
    perilaku senar sungguhan."""
    key = ("gtr", round(freq, 2), round(duration, 2))

    def build():
        n = int(SR * duration)
        N = max(int(SR / freq), 2)
        buf = np.convolve(np.random.uniform(-1, 1, N), np.ones(5) / 5, mode="same")
        out = np.empty(n)
        for i in range(n):
            idx = i % N
            out[i] = buf[idx]
            buf[idx] = 0.995 * 0.5 * (buf[idx] + buf[(idx + 1) % N])
        sample = out * np.exp(-np.linspace(0, 1, n) * 2.4)
        return sample / (np.max(np.abs(sample)) or 1.0)

    return _cached(key, build) * vol


def rhodes(freq, duration=1.1, vol=0.16):
    """Electric piano ala Rhodes lewat FM 2-operator (modulator = 1x carrier,
    indeks modulasi meluruh cepat -> 'bell attack' lalu jadi bulat)."""
    key = ("rhd", round(freq, 2), round(duration, 2))

    def build():
        n = int(SR * duration)
        t = np.linspace(0, duration, n, endpoint=False)
        idx_env = np.exp(-t * 6.0) * 3.2
        car = np.sin(2 * np.pi * freq * t + idx_env * np.sin(2 * np.pi * freq * t))
        body = car * np.exp(-t * 2.2)
        return body / (np.max(np.abs(body)) or 1.0)

    return _cached(key, build) * vol


def bell(freq, duration=1.6, vol=0.10):
    """Aksen tinggi ala marimba/celesta: fundamental + parsial non-harmonik."""
    key = ("bel", round(freq, 2), round(duration, 2))

    def build():
        n = int(SR * duration)
        t = np.linspace(0, duration, n, endpoint=False)
        s = (np.sin(2 * np.pi * freq * t) * np.exp(-t * 3.0)
             + 0.45 * np.sin(2 * np.pi * freq * 2.76 * t) * np.exp(-t * 6.0)
             + 0.20 * np.sin(2 * np.pi * freq * 5.40 * t) * np.exp(-t * 9.0))
        return s / (np.max(np.abs(s)) or 1.0)

    return _cached(key, build) * vol


def soft_lead(freq, duration, vol=0.14):
    key = ("led", round(freq, 2), round(duration, 3))

    def build():
        n = int(SR * duration)
        t = np.linspace(0, duration, n, endpoint=False)
        vib = 1.0 + 0.003 * np.sin(2 * np.pi * 5.0 * t)
        tri = 2 * np.abs(2 * (t * freq - np.floor(t * freq + 0.5))) - 1
        mix = np.sin(2 * np.pi * freq * t * vib) * 0.75 + tri * 0.25
        return mix * adsr(n, attack=0.12, decay=0.15, sustain=0.6, release=duration * 0.4)

    return _cached(key, build) * vol


def bass_note(freq, duration, vol=0.22):
    key = ("bas", round(freq, 2), round(duration, 3))

    def build():
        n = int(SR * duration)
        t = np.linspace(0, duration, n, endpoint=False)
        saw = 2 * (t * freq - np.floor(0.5 + t * freq))
        mix = np.sin(2 * np.pi * freq * t) * 0.85 + saw * 0.15
        return mix * adsr(n, attack=0.02, decay=0.08, sustain=0.55, release=duration * 0.35)

    return _cached(key, build) * vol


# ───────────────────────── PERKUSI ─────────────────────────
# Tiap alat punya BEBERAPA VARIAN, bukan satu bunyi yang diulang. Satu sampel
# yang dipakai ratusan kali persis sama akan langsung terdengar sebagai mesin
# -- pemain sungguhan tidak pernah memukul dua kali dengan hasil identik.
# Varian dibuat dari seed tetap supaya hasil render tetap bisa diulang.

_PERC_N_VAR = 5


def _perc_bank(nama, seed0, builder, n=_PERC_N_VAR):
    key = ("perc", nama)
    if key not in _CACHE:
        _CACHE[key] = [builder(np.random.default_rng(seed0 + i)) for i in range(n)]
    return _CACHE[key]


def _pilih(nama, seed0, builder, var):
    bank = _perc_bank(nama, seed0, builder)
    return bank[var % len(bank)]


def shaker(vol=0.055, var=0):
    def build(rng):
        n = int(SR * 0.055)
        hp = np.diff(rng.uniform(-1, 1, n + 1))
        return hp * np.exp(-np.linspace(0, 1, n) * rng.uniform(16, 21))
    return _pilih("shk", 1001, build, var) * vol


def rim(vol=0.06, var=0):
    """Cross-stick: bunyi kayu pendek, jauh lebih sopan daripada snare penuh."""
    def build(rng):
        n = int(SR * 0.07)
        t = np.linspace(0, 0.07, n, endpoint=False)
        f = rng.uniform(360, 400)
        body = np.sin(2 * np.pi * f * t) * 0.6 + rng.uniform(-1, 1, n) * 0.25
        return body * np.exp(-t * rng.uniform(50, 60))
    return _pilih("rim", 2001, build, var) * vol


def soft_kick(vol=0.16, var=0):
    """Kick sangat bulat & pendek -- memberi denyut tanpa terasa track dance."""
    def build(rng):
        n = int(SR * 0.16)
        t = np.linspace(0, 0.16, n, endpoint=False)
        f = rng.uniform(105, 116) * np.exp(-t * 28) + 46          # pitch drop
        return np.sin(2 * np.pi * f * t) * np.exp(-t * rng.uniform(15, 17.5))
    return _pilih("kck", 3001, build, var) * vol


def hat_closed(vol=0.045, var=0):
    """Hi-hat tertutup: lebih rapat & berlogam daripada shaker."""
    def build(rng):
        n = int(SR * 0.05)
        t = np.linspace(0, 0.05, n, endpoint=False)
        s = np.diff(rng.uniform(-1, 1, n + 1)) * 0.8
        for f in (7900, 10600, 13100):
            s += np.sin(2 * np.pi * f * rng.uniform(0.96, 1.04) * t) * 0.09
        return s * np.exp(-t * rng.uniform(120, 165))
    return _pilih("hhc", 4001, build, var) * vol


def hat_open(vol=0.04, var=0):
    """Hi-hat terbuka: dipakai sebagai aksen di akhir frasa, bukan tiap bar."""
    def build(rng):
        n = int(SR * 0.34)
        t = np.linspace(0, 0.34, n, endpoint=False)
        s = np.diff(rng.uniform(-1, 1, n + 1)) * 0.8
        for f in (7600, 9900, 12800):
            s += np.sin(2 * np.pi * f * rng.uniform(0.96, 1.04) * t) * 0.07
        return s * np.exp(-t * rng.uniform(11, 15))
    return _pilih("hho", 5001, build, var) * vol


def snare_brush(vol=0.075, var=0):
    """Snare disikat: berpasir, tanpa dentum -- cocok untuk nada korporat."""
    def build(rng):
        n = int(SR * 0.16)
        t = np.linspace(0, 0.16, n, endpoint=False)
        derau = np.convolve(rng.uniform(-1, 1, n), np.ones(4) / 4, mode="same")
        badan = np.sin(2 * np.pi * rng.uniform(180, 205) * t) * 0.35
        return (derau * 0.85 + badan) * np.exp(-t * rng.uniform(26, 34))
    return _pilih("snr", 6001, build, var) * vol


def clap(vol=0.06, var=0):
    """Tepuk: beberapa letupan sangat rapat -- itulah yang membuatnya terdengar
    seperti banyak tangan, bukan satu."""
    def build(rng):
        n = int(SR * 0.22)
        out = np.zeros(n)
        for k in range(4):
            off = int(SR * (0.0 if k == 0 else rng.uniform(0.008, 0.013) * k))
            sisa = n - off
            if sisa <= 0:
                break
            t = np.linspace(0, sisa / SR, sisa, endpoint=False)
            out[off:] += (np.convolve(rng.uniform(-1, 1, sisa), np.ones(3) / 3, mode="same")
                          * np.exp(-t * (60 if k < 3 else 20)) * (1.0 if k == 0 else 0.55))
        return out / (np.max(np.abs(out)) or 1.0)
    return _pilih("clp", 7001, build, var) * vol


def tom(nada=1.0, vol=0.09, var=0):
    """Tom -- hanya dipakai untuk isian (fill) di ujung frasa."""
    def build(rng):
        n = int(SR * 0.26)
        t = np.linspace(0, 0.26, n, endpoint=False)
        f = rng.uniform(150, 162) * np.exp(-t * 9) + 78
        kulit = np.sin(2 * np.pi * f * t)
        udara = rng.uniform(-1, 1, n) * 0.12 * np.exp(-t * 40)
        return (kulit + udara) * np.exp(-t * rng.uniform(9, 11))
    dasar = _pilih("tom", 8001, build, var)
    if nada == 1.0:
        return dasar * vol
    # Resample kasar untuk mengubah nada -- cukup untuk tom isian.
    idx = np.clip((np.arange(len(dasar)) / nada).astype(int), 0, len(dasar) - 1)
    return dasar[idx] * vol


def tambourine(vol=0.038, var=0):
    """Kerincing: hanya di bagian puncak, memberi kilau tanpa menambah bobot."""
    def build(rng):
        n = int(SR * 0.12)
        t = np.linspace(0, 0.12, n, endpoint=False)
        s = np.zeros(n)
        for _ in range(6):
            f = rng.uniform(5200, 9400)
            s += np.sin(2 * np.pi * f * t) * rng.uniform(0.5, 1.0)
        s += np.diff(rng.uniform(-1, 1, n + 1)) * 0.6
        return (s / (np.max(np.abs(s)) or 1.0)) * np.exp(-t * rng.uniform(28, 40))
    return _pilih("tmb", 9001, build, var) * vol


def riser(duration=1.6, vol=0.13):
    """Noise sweep naik + pitch naik, penanda pergantian bab."""
    key = ("ris", round(duration, 2))

    def build():
        n = int(SR * duration)
        t = np.linspace(0, duration, n, endpoint=False)
        prog = t / duration
        noise = np.convolve(np.random.uniform(-1, 1, n), np.ones(12) / 12, mode="same")
        sweep = np.sin(2 * np.pi * (220 + 900 * prog ** 2) * t)
        s = noise * 0.55 * prog ** 2 + sweep * 0.45 * prog ** 3
        return s / (np.max(np.abs(s)) or 1.0)

    return _cached(key, build) * vol


def impact(vol=0.20):
    """Impact lembut (bukan cinematic boom) tepat di titik pergantian."""
    def build():
        n = int(SR * 0.9)
        t = np.linspace(0, 0.9, n, endpoint=False)
        low = np.sin(2 * np.pi * (70 * np.exp(-t * 6) + 42) * t) * np.exp(-t * 4.5)
        air = np.convolve(np.random.uniform(-1, 1, n), np.ones(30) / 30, mode="same") * np.exp(-t * 9) * 0.3
        s = low + air
        return s / (np.max(np.abs(s)) or 1.0)
    return _cached(("imp",), build) * vol


# ────────────────────────────── HARMONI ──────────────────────────────

CHORDS = {
    "Cmaj7": [261.63, 329.63, 392.00, 493.88],
    "Am7":   [220.00, 261.63, 329.63, 392.00],
    "Fmaj7": [174.61, 220.00, 261.63, 329.63],
    "G6":    [196.00, 246.94, 293.66, 329.63],
    "Em7":   [164.81, 196.00, 246.94, 293.66],
    "Dm7":   [146.83, 174.61, 220.00, 261.63],
    "G7":    [196.00, 246.94, 293.66, 349.23],
    "Fm7":   [174.61, 207.65, 261.63, 311.13],
    "Bb6":   [233.08, 293.66, 349.23, 392.00],
    "Csus2": [261.63, 293.66, 392.00, 523.25],
}
BASS_ROOT = {"Cmaj7": 130.81, "Am7": 110.00, "Fmaj7": 87.31, "G6": 98.00, "Em7": 82.41,
             "Dm7": 73.42, "G7": 98.00, "Fm7": 87.31, "Bb6": 116.54, "Csus2": 130.81}

PROG = {
    "warm":   ["Cmaj7", "Am7", "Fmaj7", "G6"],
    "move":   ["Fmaj7", "G6", "Em7", "Am7"],
    "lift":   ["Dm7", "G7", "Cmaj7", "Am7"],
    "shadow": ["Am7", "Fm7", "Cmaj7", "G6"],
    "open":   ["Csus2", "G6", "Am7", "Fmaj7"],
    "drive":  ["Am7", "G6", "Fmaj7", "Bb6"],
}

# mood -> (progresi, gain tiap layer)
MOODS = {
    "intro":  ("open",   dict(pad=1.00, gtr=0.00, rhd=0.00, bel=0.00, bass=0.00, lead=0.00, perc=0.00)),
    "calm":   ("warm",   dict(pad=1.00, gtr=0.60, rhd=0.35, bel=0.25, bass=0.35, lead=0.00, perc=0.22)),
    "steady": ("move",   dict(pad=0.95, gtr=0.75, rhd=0.55, bel=0.30, bass=0.55, lead=0.18, perc=0.45)),
    "build":  ("drive",  dict(pad=0.90, gtr=0.85, rhd=0.65, bel=0.40, bass=0.70, lead=0.30, perc=0.65)),
    "peak":   ("lift",   dict(pad=0.90, gtr=0.90, rhd=0.80, bel=0.55, bass=0.80, lead=0.45, perc=0.85)),
    "shadow": ("shadow", dict(pad=1.00, gtr=0.55, rhd=0.45, bel=0.20, bass=0.60, lead=0.12, perc=0.38)),
    "outro":  ("warm",   dict(pad=1.00, gtr=0.50, rhd=0.40, bel=0.35, bass=0.25, lead=0.20, perc=0.00)),
}

# Nuansa per-scene. Disusun mengikuti dramaturgi naskah: pembuka tenang ->
# masalah (shadow) -> solusi (build) -> uraian tahap (steady/calm bergantian
# supaya tidak monoton) -> puncak matriks & dashboard (peak) -> penutup.
SCENE_MOOD = {
    "s1": "intro",  "s2": "calm",   "s3": "shadow", "s4": "build",  "s5": "steady",
    "s6": "steady", "s7": "calm",   "s8": "peak",   "s9": "build",  "s10": "steady",
    "s11": "shadow", "s12": "steady", "s13": "calm", "s14": "peak", "s15": "build",
    "s16": "steady", "s17": "calm", "s18": "build",
    # urutan tayang v3: ... s18 -> s21 (fitur) -> s22, s23 (contoh nyata)
    # -> s19 (dashboard) -> s20 (penutup)
    "s21": "calm", "s22": "steady", "s23": "build",
    "s19": "peak", "s20": "outro",
}

XFADE = 2.6
LAYERS = ("pad", "gtr", "rhd", "bel", "bass", "lead", "perc")

# Motif melodi 8 nada (derajat akor) yang berulang -> lagu punya identitas,
# bukan sekadar bantalan harmoni acak.
MOTIF = [0, 2, 1, 3, 2, 0, 1, 2]


# ───────────────────────── GROOVE PERKUSI ─────────────────────────
# Pola ditulis pada kisi 1/16 (16 langkah per bar, langkah 0 = ketukan 1,
# 4 = ketukan 2, 8 = ketukan 3, 12 = ketukan 4). Angka kedua = kekuatan
# pukulan 0-1.
#
# Yang membuatnya terdengar dimainkan orang, bukan diketik:
#   - tiap suasana punya pola sendiri, jadi perkusi ikut bercerita
#   - langkah ganjil (offbeat) dimundurkan sedikit -> ayunan/swing
#   - kekuatan & waktu tiap pukulan digoyang sedikit secara acak
#   - tiap 4 bar ditutup isian, dan bar terakhir sebelum ganti bagian
#     memakai isian yang lebih besar sebagai jembatan
GROOVES = {
    "calm": {
        "kick":  [(0, 1.00)],
        "rim":   [(8, 0.70)],
        "shk":   [(s, 0.85 if s % 4 == 0 else 0.45) for s in range(0, 16, 2)],
    },
    # Mulai steady ke atas, denyut 1/8 dipegang hi-hat SAJA. Menumpuk shaker,
    # hi-hat, dan kerincing sekaligus membuat pita 2-6 kHz penuh -- pita yang
    # sama dengan suara narator, jadi hasilnya terdengar ramai sekaligus
    # menggerus kejelasan kalimat.
    "steady": {
        "kick":  [(0, 1.00), (10, 0.70)],
        "rim":   [(4, 0.85), (12, 0.90)],
        "hhc":   [(s, 0.9 if s % 4 == 0 else 0.5) for s in range(0, 16, 2)],
    },
    "build": {
        "kick":  [(0, 1.00), (6, 0.65), (10, 0.80)],
        "snr":   [(4, 0.90), (12, 0.95), (7, 0.25), (15, 0.30)],
        "hhc":   [(s, 0.85 if s % 4 == 0 else 0.45) for s in range(0, 16, 2)],
        # Shaker hanya di seperempat terakhir tiap ketuk -> menambah dorongan
        # maju tanpa menutup celah.
        "shk":   [(s, 0.32) for s in (3, 7, 11, 15)],
        "hho":   [(14, 0.60)],
    },
    "peak": {
        "kick":  [(0, 1.00), (6, 0.70), (10, 0.85), (14, 0.45)],
        "snr":   [(4, 0.95), (12, 1.00), (7, 0.28)],
        "clp":   [(4, 0.75), (12, 0.80)],
        "hhc":   [(s, 0.9 if s % 4 == 0 else 0.5) for s in range(0, 16, 2)],
        # Kerincing per ketuk saja, bukan per 1/8 -- memberi kilau di puncak
        # tanpa ikut memadati pita tinggi.
        "tmb":   [(s, 0.5) for s in (0, 4, 8, 12)],
        "hho":   [(15, 0.65)],
    },
    # Bagian gelap: nyaris tanpa logam, hanya denyut rendah -- ketegangan
    # datang dari ruang kosong, bukan dari kepadatan.
    "shadow": {
        "kick":  [(0, 0.85), (8, 0.60)],
        "tom":   [(12, 0.55)],
        "shk":   [(s, 0.28) for s in range(0, 16, 4)],
    },
}

# Isian akhir frasa: (langkah, alat, kekuatan, nada-tom).
FILL_KECIL = [(12, "tom", 0.55, 1.20), (14, "tom", 0.60, 1.00)]
FILL_BESAR = [
    (10, "tom", 0.55, 1.30), (11, "tom", 0.50, 1.30),
    (12, "tom", 0.70, 1.10), (13, "tom", 0.62, 1.10),
    (14, "tom", 0.85, 0.90), (15, "snr", 0.75, 1.00),
]

_ALAT = {
    "kick": lambda v, var, _n: soft_kick(0.16 * v, var),
    "rim":  lambda v, var, _n: rim(0.060 * v, var),
    "shk":  lambda v, var, _n: shaker(0.055 * v, var),
    "hhc":  lambda v, var, _n: hat_closed(0.045 * v, var),
    "hho":  lambda v, var, _n: hat_open(0.040 * v, var),
    "snr":  lambda v, var, _n: snare_brush(0.075 * v, var),
    "clp":  lambda v, var, _n: clap(0.060 * v, var),
    "tmb":  lambda v, var, _n: tambourine(0.038 * v, var),
    "tom":  lambda v, var, n: tom(n, 0.090 * v, var),
}

# Seberapa jauh offbeat dimundurkan, sebagai bagian dari satu langkah 1/16.
SWING = 0.16


def mood_at(sections, t):
    mood = sections[0]["mood"]
    for sec in sections:
        if t >= sec["start"]:
            mood = sec["mood"]
        else:
            break
    return mood


def perc_bar(track, t0, mood, bar, rng, put, total, jembatan=False):
    """Tulis satu bar perkusi sesuai suasananya."""
    pola = GROOVES.get(mood)
    if not pola:
        return
    langkah = BEAT / 4

    def tulis(s, alat, vel, nada=1.0):
        # Ayunan: hanya langkah ganjil yang dimundurkan.
        geser = SWING * langkah if s % 2 else 0.0
        # Goyangan waktu -- kick paling rapat, logam paling longgar.
        jitter = {"kick": 0.004, "snr": 0.006, "clp": 0.006}.get(alat, 0.011)
        tn = t0 + s * langkah + geser + rng.normal(0, jitter)
        if tn >= total or tn < 0:
            return
        v = max(0.05, vel * rng.normal(1.0, 0.085))
        put(track, _ALAT[alat](v, rng.integers(0, _PERC_N_VAR), nada), int(tn * SR))

    isian = FILL_BESAR if jembatan else (FILL_KECIL if bar % 4 == 3 else None)

    for alat, hits in pola.items():
        for s, vel in hits:
            # Langkah yang ditempati isian dikosongkan supaya tidak bertabrakan.
            if isian and s >= isian[0][0] and alat not in ("hhc", "shk", "tmb"):
                continue
            tulis(s, alat, vel)

    if isian:
        for s, alat, vel, nada in isian:
            tulis(s, alat, vel, nada)


def build_sections(scenes):
    out = []
    for sc in scenes:
        mood = SCENE_MOOD.get(sc["id"], "steady")
        prog_name, gains = MOODS[mood]
        out.append({"start": sc["start"], "prog": PROG[prog_name], "gains": gains, "mood": mood})
    return out


def gain_envelope(sections, layer, total, sr=SR):
    """Kurva gain: datar per-section, di-ramp linier XFADE detik di tiap batas.

    Ramp dibuat eksplisit per-batas (O(n)). Menghaluskan seluruh array dgn
    np.convolve kernel 2.6 detik (115k sample) atas ~40 juta sample butuh
    ~10^12 operasi -- itu yg dulu membuat generate musik seolah menggantung.
    """
    n = int(total * sr)
    env = np.zeros(n)
    for i, sec in enumerate(sections):
        end = sections[i + 1]["start"] if i + 1 < len(sections) else total
        a, b = max(int(sec["start"] * sr), 0), min(int(end * sr), n)
        if a >= n:
            break
        env[a:b] = sec["gains"][layer]
    half = int((XFADE / 2) * sr)
    for sec in sections[1:]:
        boundary = int(sec["start"] * sr)
        a, b = max(boundary - half, 0), min(boundary + half, n)
        if b - a >= 2:
            env[a:b] = np.linspace(env[a], env[b - 1], b - a)
    return env


def prog_at(sections, t):
    prog = sections[0]["prog"]
    for sec in sections:
        if t >= sec["start"]:
            prog = sec["prog"]
        else:
            break
    return prog


def generate_music(total, sections, out_path):
    n_total = int(total * SR)
    tracks = {k: np.zeros(n_total) for k in LAYERS}
    extra = np.zeros(n_total)      # riser + impact (di luar sistem gain layer)
    # Seed tetap: goyangan waktu & kekuatan pukulan harus acak bagi telinga,
    # tapi hasil render tetap sama setiap kali dijalankan.
    perc_rng = np.random.default_rng(20260729)

    def put(track, sound, start_sample):
        if start_sample >= len(track) or start_sample < 0:
            return
        end = min(start_sample + len(sound), len(track))
        track[start_sample:end] += sound[: end - start_sample]

    n_bars = int(np.ceil(total / BAR)) + 1
    for bar in range(n_bars):
        t0 = bar * BAR
        if t0 >= total:
            break
        prog = prog_at(sections, t0)
        name = prog[bar % len(prog)]
        ch = CHORDS[name]
        s0 = int(t0 * SR)

        put(tracks["pad"], pad_chord(ch, BAR * 1.15), s0)

        for b in (0, 2):
            put(tracks["bass"], bass_note(BASS_ROOT[name], BEAT * 1.7), int((t0 + b * BEAT) * SR))

        # Gitar fingerpicking 8th-note satu oktaf di atas akor
        for j, idx in enumerate([0, 2, 1, 3, 0, 2, 3, 1]):
            tn = t0 + j * (BEAT / 2)
            if tn >= total:
                break
            put(tracks["gtr"], guitar_pluck(ch[idx] * 2.0, 1.2, vol=0.30 if j % 2 == 0 else 0.20),
                int(tn * SR))

        # Rhodes: comping di off-beat (ketuk 2& dan 4&) -> terasa "modern kantor"
        for b in (1.5, 3.5):
            put(tracks["rhd"], rhodes(ch[1], 1.1, vol=0.15), int((t0 + b * BEAT) * SR))
            put(tracks["rhd"], rhodes(ch[3], 1.1, vol=0.11), int((t0 + b * BEAT) * SR))

        # Bell: sparse, tiap 2 bar, mengikuti motif -> aksen berkilau
        if bar % 2 == 0:
            put(tracks["bel"], bell(ch[MOTIF[bar % len(MOTIF)] % 4] * 4.0, 1.6, vol=0.09),
                int((t0 + BEAT * 2) * SR))

        # Lead: motif berulang, satu nada panjang tiap 2 bar
        if bar % 2 == 0:
            put(tracks["lead"], soft_lead(ch[MOTIF[(bar // 2) % len(MOTIF)] % 4] * 2.0, BAR * 1.5),
                int((t0 + BEAT) * SR))

        # Bar terakhir sebelum bagian berikutnya dipakai sebagai jembatan:
        # isian yang lebih besar, supaya perkusi terdengar MENGANTAR pergantian
        # -- bukan tiba-tiba berhenti lalu tiba-tiba ada lagi.
        jembatan = any(t0 < sec["start"] <= t0 + BAR for sec in sections[1:])
        perc_bar(tracks["perc"], t0, mood_at(sections, t0), bar, perc_rng, put,
                 total, jembatan=jembatan)

    # Riser + impact di tiap pergantian scene (kecuali scene pertama)
    for sec in sections[1:]:
        put(extra, riser(1.6, vol=0.12), int((sec["start"] - 1.6) * SR))
        put(extra, impact(vol=0.17), int(sec["start"] * SR))

    full = extra.copy()
    for layer in LAYERS:
        full += tracks[layer] * gain_envelope(sections, layer, total)

    peak = np.max(np.abs(full))
    if peak > 0.95:
        full *= 0.95 / peak

    fi, fo = int(2.5 * SR), int(4.0 * SR)
    full[:fi] *= np.linspace(0, 1, fi)
    full[-fo:] *= np.linspace(1, 0, fo)

    write_wav(out_path, full)
    print(f"music_bg.wav: {total:.1f}s, {BPM:.0f} BPM, {len(sections)} section, "
          f"{len(LAYERS)} layer")


# ────────────────────────────── PUSTAKA SFX ──────────────────────────────

def _tone(freq, dur, kind="sine", vol=0.3):
    n = int(SR * dur)
    t = np.linspace(0, dur, n, endpoint=False)
    if kind == "triangle":
        s = 2 * np.abs(2 * (t * freq - np.floor(t * freq + 0.5))) - 1
    elif kind == "square":
        s = np.sign(np.sin(2 * np.pi * freq * t))
    else:
        s = np.sin(2 * np.pi * freq * t)
    return s * vol


def sfx_whoosh():
    n = int(SR * 0.55)
    t = np.linspace(0, 0.55, n, endpoint=False)
    noise = np.convolve(np.random.uniform(-1, 1, n), np.ones(55) / 55, mode="same")
    return noise * np.sin(np.pi * t / 0.55) ** 1.5 * 0.42


def sfx_whoosh_down():
    n = int(SR * 0.45)
    t = np.linspace(0, 0.45, n, endpoint=False)
    noise = np.convolve(np.random.uniform(-1, 1, n), np.ones(80) / 80, mode="same")
    return noise * np.exp(-t * 6) * 0.40


def sfx_pop():
    n = int(SR * 0.09)
    t = np.linspace(0, 0.09, n, endpoint=False)
    f = 900 * np.exp(-t * 40) + 320
    return np.sin(2 * np.pi * f * t) * np.exp(-t * 38) * 0.34


def sfx_click():
    n = int(SR * 0.05)
    t = np.linspace(0, 0.05, n, endpoint=False)
    return np.sin(2 * np.pi * 1400 * t) * adsr(n, attack=0.001, decay=0.008,
                                               sustain=0.35, release=0.03) * 0.30


def sfx_type():
    """Rentetan ketikan pendek utk efek teks muncul huruf demi huruf."""
    parts = []
    for _ in range(7):
        n = int(SR * 0.028)
        t = np.linspace(0, 0.028, n, endpoint=False)
        body = (np.random.uniform(-1, 1, n) * 0.6 + np.sin(2 * np.pi * 2000 * t) * 0.4)
        parts.append(body * np.exp(-t * 120) * 0.26)
        parts.append(np.zeros(int(SR * np.random.uniform(0.03, 0.055))))
    return np.concatenate(parts)


def sfx_chime_up():
    parts = []
    for f in (523.25, 659.25, 783.99, 1046.50):
        s = bell(f, 0.9, vol=0.30)
        parts.append(s[: int(SR * 0.13)])
    tail = bell(1046.50, 1.2, vol=0.26)
    return np.concatenate(parts + [tail])


def sfx_chime_down():
    parts = []
    for f in (783.99, 659.25, 523.25):
        parts.append(bell(f, 0.7, vol=0.26)[: int(SR * 0.14)])
    return np.concatenate(parts + [bell(392.00, 1.0, vol=0.22)])


def sfx_ding():
    return bell(1318.51, 1.3, vol=0.30)


def sfx_success():
    parts = []
    for f in (523.25, 659.25, 783.99):
        s = _tone(f, 0.14, vol=0.30)
        parts.append(s * adsr(len(s), attack=0.005, decay=0.02, sustain=0.7, release=0.1))
        parts.append(np.zeros(int(0.015 * SR)))
    return np.concatenate(parts)


def sfx_alert():
    a = _tone(587.33, 0.12, "triangle", 0.36)
    b = _tone(698.46, 0.20, "triangle", 0.42)
    return np.concatenate([
        a * adsr(len(a), attack=0.01, decay=0.02, sustain=0.6, release=0.08),
        np.zeros(int(0.02 * SR)),
        b * adsr(len(b), attack=0.01, decay=0.03, sustain=0.6, release=0.15),
    ])


def sfx_error():
    """Dua nada turun -- penanda 'ini yang SALAH'."""
    a = _tone(392.00, 0.16, "triangle", 0.34)
    b = _tone(311.13, 0.28, "triangle", 0.38)
    return np.concatenate([
        a * adsr(len(a), attack=0.005, decay=0.03, sustain=0.6, release=0.1),
        np.zeros(int(0.03 * SR)),
        b * adsr(len(b), attack=0.005, decay=0.04, sustain=0.5, release=0.2),
    ])


def sfx_thud():
    n = int(SR * 0.28)
    t = np.linspace(0, 0.28, n, endpoint=False)
    s = np.sin(2 * np.pi * 80 * t) * 0.55 + np.random.uniform(-1, 1, n) * 0.1
    return s * adsr(n, attack=0.004, decay=0.05, sustain=0.3, release=0.18)


def sfx_stamp():
    """Cap/stempel: impact kertas + sedikit klik kayu."""
    n = int(SR * 0.22)
    t = np.linspace(0, 0.22, n, endpoint=False)
    wood = np.sin(2 * np.pi * 190 * t) * np.exp(-t * 30) * 0.5
    paper = np.convolve(np.random.uniform(-1, 1, n), np.ones(8) / 8, mode="same") * np.exp(-t * 45) * 0.45
    return (wood + paper) * 0.9


def sfx_pageturn():
    n = int(SR * 0.36)
    t = np.linspace(0, 0.36, n, endpoint=False)
    noise = np.convolve(np.random.uniform(-1, 1, n), np.ones(25) / 25, mode="same")
    sweep = np.sin(2 * np.pi * (300 + 900 * t / 0.36) * t) * 0.15
    return (noise * 0.5 + sweep) * adsr(n, attack=0.05, decay=0.05, sustain=0.6, release=0.2) * 0.34


def sfx_swipe():
    n = int(SR * 0.3)
    t = np.linspace(0, 0.3, n, endpoint=False)
    noise = np.convolve(np.random.uniform(-1, 1, n), np.ones(18) / 18, mode="same")
    return noise * np.sin(np.pi * t / 0.3) * 0.30


def sfx_riser():
    return riser(1.8, vol=0.34)


def sfx_impact():
    return impact(vol=0.40)


def sfx_counter():
    """Tik-tik cepat utk angka yang berhitung naik."""
    parts = []
    for i in range(12):
        n = int(SR * 0.02)
        t = np.linspace(0, 0.02, n, endpoint=False)
        parts.append(np.sin(2 * np.pi * (1500 + i * 60) * t) * np.exp(-t * 160) * 0.20)
        parts.append(np.zeros(int(SR * 0.045)))
    return np.concatenate(parts)


def sfx_scan():
    """Sapuan radar/scanner utk momen pemantauan."""
    n = int(SR * 0.9)
    t = np.linspace(0, 0.9, n, endpoint=False)
    s = np.sin(2 * np.pi * (600 + 300 * np.sin(2 * np.pi * 1.6 * t)) * t)
    return s * np.exp(-t * 2.2) * 0.22


def sfx_lock():
    """Klik mengunci -- utk momen 'tertaut'/'terkunci ke konteks'."""
    n = int(SR * 0.16)
    t = np.linspace(0, 0.16, n, endpoint=False)
    a = np.sin(2 * np.pi * 320 * t) * np.exp(-t * 45) * 0.4
    b = np.zeros(n)
    off = int(SR * 0.06)
    b[off:] = (np.sin(2 * np.pi * 520 * t[: n - off]) * np.exp(-t[: n - off] * 55) * 0.45)
    return a + b


SFX_LIB = {
    "whoosh": sfx_whoosh, "whoosh_down": sfx_whoosh_down, "pop": sfx_pop,
    "click": sfx_click, "type": sfx_type, "chime_up": sfx_chime_up,
    "chime_down": sfx_chime_down, "ding": sfx_ding, "success": sfx_success,
    "alert": sfx_alert, "error": sfx_error, "thud": sfx_thud, "stamp": sfx_stamp,
    "pageturn": sfx_pageturn, "swipe": sfx_swipe, "riser": sfx_riser,
    "impact": sfx_impact, "counter": sfx_counter, "scan": sfx_scan, "lock": sfx_lock,
}


def main():
    # --musik-saja: bangun ulang music_bg.wav TANPA menyentuh pustaka SFX.
    # SFX dibangkitkan dari derau acak tanpa seed, jadi menjalankan ulang
    # seluruh skrip hanya untuk mengubah musik akan ikut mengubah ke-20 efek
    # suara -- dan itu memaksa build_sfx_bus.py dijalankan ulang juga.
    musik_saja = "--musik-saja" in sys.argv

    with open(os.path.join(SCRIPT_DIR, "timeline.json"), "r", encoding="utf-8") as f:
        timeline = json.load(f)
    total = timeline["total_duration"]

    sections = build_sections(timeline["scenes"])
    generate_music(total, sections, os.path.join(SCRIPT_DIR, "music_bg.wav"))

    if musik_saja:
        print("sfx/: dilewati (--musik-saja)")
        return

    os.makedirs(SFX_DIR, exist_ok=True)
    for name, fn in SFX_LIB.items():
        write_wav(os.path.join(SFX_DIR, f"{name}.wav"), fn())
    print(f"sfx/: {len(SFX_LIB)} efek suara ditulis")


if __name__ == "__main__":
    main()
