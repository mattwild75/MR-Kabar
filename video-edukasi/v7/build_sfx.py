"""
Efek suara & suasana latar v7, semuanya DISINTESIS (tanpa pustaka luar).

Masukan: isyarat.json dari rakit.cjs (isyarat bunyi + kunci suasana angin,
hujan, ombak, camar). Bunyi dasar dipinjam dari v6/build_sfx.py dan
video-tes/build_sfx.py; bunyi khas paper cut v7 ditambahkan di sini
(sobek, gemuruh ombak raksasa, beku, gulungan waktu mundur).

    python build_sfx.py   -> sfx_bus.wav (mono 48 kHz)
"""
import importlib.util
import json
import os
import wave

import numpy as np

DIR = os.path.dirname(os.path.abspath(__file__))


def muat(nama, path):
    spek = importlib.util.spec_from_file_location(nama, path)
    m = importlib.util.module_from_spec(spek)
    spek.loader.exec_module(m)
    return m


v6 = muat("sfx_v6", os.path.join(DIR, "..", "v6", "build_sfx.py"))
SR = v6.SR
RNG = np.random.default_rng(20261122)
saring, norm = v6.saring_fft, v6.norm


def b_sobek():
    n = int(0.42 * SR); t = np.arange(n) / SR
    x = saring(RNG.standard_normal(n), 1500, 9000) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 47 * t)))
    return norm(x * np.exp(-t / 0.16), 0.7)


def b_gemuruh():
    n = int(3.4 * SR); t = np.arange(n) / SR
    naik = np.clip(t / 2.6, 0, 1) ** 1.6 * np.exp(-np.clip(t - 2.8, 0, None) / 0.3)
    return norm((saring(RNG.standard_normal(n), 30, 420) + 0.4 * saring(RNG.standard_normal(n), 600, 4000) * naik) * naik, 0.9)


def b_beku():
    """Pita kaset berhenti: nada turun cepat + klik."""
    n = int(0.55 * SR); t = np.arange(n) / SR
    f = 420 * np.exp(-t / 0.18) + 40
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.3) * 0.6
    x[:300] += np.sin(2 * np.pi * 2400 * t[:300]) * np.exp(-t[:300] / 0.003)
    return norm(x, 0.6)


def b_gulung():
    """Lembar kertas digulung mundur: desir yang makin cepat + sobek di awal."""
    n = int(1.25 * SR); t = np.arange(n) / SR
    kepak = 0.5 + 0.5 * np.sin(2 * np.pi * (3 + 9 * t) * t)
    desir = saring(RNG.standard_normal(n), 700, 7000) * kepak * np.clip(t / 0.08, 0, 1) * np.exp(-np.clip(t - 0.9, 0, None) / 0.12)
    out = desir * 0.6
    s = b_sobek()
    out[:len(s)] += s * 0.7
    return norm(out, 0.7)


def b_kibar():
    n = int(0.6 * SR); t = np.arange(n) / SR
    am = 0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 14 * t))
    return norm(saring(RNG.standard_normal(n), 400, 5000) * am * np.sin(np.pi * t / t[-1]), 0.45)


def b_percik():
    n = int(0.7 * SR); t = np.arange(n) / SR
    out = np.zeros(n)
    for _ in range(26):
        i = RNG.integers(0, n - 2000); m = RNG.integers(300, 1600)
        tt = np.arange(m) / SR
        out[i:i + m] += saring(RNG.standard_normal(m), 2500, 9000) * np.exp(-tt / 0.02) * RNG.uniform(0.3, 1)
    return norm(out * np.exp(-t / 0.3), 0.5)


def b_klakson():
    n = int(1.6 * SR); t = np.arange(n) / SR
    x = sum(a * np.sign(np.sin(2 * np.pi * f * t)) for f, a in [(110, 1), (138.6, 0.7), (220, 0.3)])
    return norm(saring(x, 80, 1800) * np.clip(t / 0.06, 0, 1) * np.clip((t[-1] - t) / 0.25, 0, 1), 0.55)


def b_camar():
    n = int(0.75 * SR); t = np.arange(n) / SR
    f = 1650 + 700 * np.exp(-t / 0.12) - 400 * t
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.3 * np.sin(2 * np.pi * np.cumsum(2 * f) / SR)
    am = (0.5 + 0.5 * np.sin(2 * np.pi * 9 * t)) * np.sin(np.pi * t / t[-1])
    return norm(saring(x * am, 700, 6000), 0.3)


def b_radio():
    n = int(0.45 * SR); t = np.arange(n) / SR
    x = saring(RNG.standard_normal(n), 900, 3200) * np.exp(-t / 0.12)
    x[:500] += np.sin(2 * np.pi * 1800 * t[:500]) * 0.5
    return norm(x, 0.45)


BUNYI = dict(v6.BUNYI)
BUNYI.update({"sobek": b_sobek, "gemuruh": b_gemuruh, "beku": b_beku, "gulung": b_gulung, "kibar": b_kibar,
              "percik": b_percik, "klakson": b_klakson, "camar": b_camar, "radio": b_radio})
ANCANG = dict(v6.ANCANG)


def suasana_latar(total, kunci):
    """Ombak, angin, hujan menurut kunci; camar acak saat camar > 0."""
    n = int(total * SR) + SR
    t = np.arange(n) / SR
    ts = np.array([k["t"] for k in kunci])

    def kurva(nama):
        return np.interp(t, ts, [k[nama] for k in kunci]) if len(kunci) else np.zeros(n)

    angin, hujan, ombak, camar = kurva("angin"), kurva("hujan"), kurva("ombak"), kurva("camar")

    def pita(lo, hi, kem=0.0, blok=20):
        out = np.zeros(n)
        L = blok * SR; tumpang = SR // 2
        jendela = np.ones(L + tumpang)
        jendela[:tumpang] = np.linspace(0, 1, tumpang); jendela[-tumpang:] = np.linspace(1, 0, tumpang)
        for i in range(0, n, L):
            x = saring(RNG.standard_normal(L + tumpang), lo, hi, kem)
            seg = out[i:i + L + tumpang]
            seg += (x * jendela)[:len(seg)]
        return out / (np.abs(out).max() or 1)

    gelombang = 0.55 + 0.45 * (0.5 + 0.5 * np.sin(2 * np.pi * t / 8.3) * np.sin(2 * np.pi * t / 11.7 + 1.3))
    bunyi_ombak = (pita(40, 500, -0.6) * gelombang * 0.9 + pita(800, 6000) * gelombang ** 3 * 0.35) * ombak
    tiup = pita(250, 1400) * (0.6 + 0.4 * np.sin(2 * np.pi * t / 4.7)) * np.clip((angin - 0.2) / 0.7, 0, 1) ** 1.4
    rintik = pita(2500, 12000) * hujan
    out = bunyi_ombak * 0.13 + tiup * 0.12 + rintik * 0.12
    # camar: panggilan acak, kepadatan menurut kurva camar
    c = b_camar()
    k = 0.0
    while k < total - 1:
        k += RNG.uniform(3.5, 9.0)
        i = int(k * SR)
        if i < n and camar[i] > 0.05:
            m = min(len(c), n - i)
            out[i:i + m] += c[:m] * camar[i] * RNG.uniform(0.35, 0.7)
    return out


def main():
    tl = json.load(open(os.path.join(DIR, "timeline.json"), encoding="utf-8"))
    isy = json.load(open(os.path.join(DIR, "isyarat.json"), encoding="utf-8"))
    total = tl["total_duration"]
    bus = suasana_latar(total, sorted(isy["suasana"], key=lambda k: k["t"]))
    cache = {}
    for c in isy["sfx"]:
        nama = c["nama"]
        if nama not in BUNYI:
            print("bunyi tidak dikenal:", nama)
            continue
        if nama not in cache:
            cache[nama] = BUNYI[nama]()
        x = cache[nama] * c["g"]
        i = int(max(0.0, c["t"] - ANCANG.get(nama, 0.0)) * SR)
        if i >= len(bus):
            continue
        m = min(len(x), len(bus) - i)
        bus[i:i + m] += x[:m]
    bus = bus[:int(total * SR)]
    bus *= 0.9 / max(0.9, np.abs(bus).max())
    with wave.open(os.path.join(DIR, "sfx_bus.wav"), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(bus, -1, 1) * 32767).astype(np.int16).tobytes())
    print(f"sfx_bus.wav {total:.1f} dtk, {len(isy['sfx'])} isyarat")


if __name__ == "__main__":
    main()
