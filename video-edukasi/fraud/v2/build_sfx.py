"""
Jalur SFX video kecurangan v2 (mesin dari v6): semua bunyi DISINTESIS di sini
(tanpa pustaka luar), lalu ditempatkan menurut isyarat.json yang diekspor dari
koreografi:

  - ambience  ombak (sepanjang video), angin dan hujan — kerasnya mengikuti
              keadaan dunia (wind/rain) di animasi, disampel tiap 0,1 dtk;
  - isyarat   stempel, whoosh kartu babak, guruh tiap kilat, lonceng kapal,
              desir & ketukan layar ponsel, tik daftar, kertas, dll.; tambahan
              v2: bor yang menembus lambung, semburan & tetesan air, bisikan
              pembenaran, gembok terkunci, hapus metadata, pelat tambalan;
  - kebocoran gemericik air masuk, kerasnya mengikuti `leak` di animasi.

Hasil: sfx_bus.wav (mono 48 kHz). Mixing & ducking di mix_audio.py.

    python build_sfx.py
"""
import json
import os
import wave

import numpy as np

DIR = os.path.dirname(os.path.abspath(__file__))
SR = 48000
RNG = np.random.default_rng(20261001)


# ── penyaring sederhana ───────────────────────────────────────────────────
def saring_fft(x: np.ndarray, lo: float | None = None, hi: float | None = None, kemiringan: float = 0.0) -> np.ndarray:
    """Band-pass halus di ranah frekuensi; kemiringan <0 menebalkan frekuensi rendah."""
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    m = np.ones_like(f)
    if lo:
        m *= 1 / (1 + (lo / np.maximum(f, 1)) ** 4)
    if hi:
        m *= 1 / (1 + (f / hi) ** 4)
    if kemiringan:
        m *= (np.maximum(f, 20) / 1000) ** kemiringan
    return np.fft.irfft(X * m, len(x))


def env(n: int, serang: float, lepas: float, puncak: float | None = None) -> np.ndarray:
    t = np.arange(n) / SR
    p = puncak if puncak is not None else serang
    e = np.where(t < p, (t / max(serang, 1e-4)).clip(0, 1), np.exp(-(t - p) / max(lepas, 1e-4)))
    return e


def norm(x, puncak=0.9):
    m = np.abs(x).max() or 1
    return x / m * puncak


# ── bunyi ─────────────────────────────────────────────────────────────────
def b_tik():
    n = int(0.06 * SR); t = np.arange(n) / SR
    return norm(np.sin(2 * np.pi * 2900 * t) * np.exp(-t / 0.012) + saring_fft(RNG.standard_normal(n), 2000, 9000) * np.exp(-t / 0.004) * 0.6, 0.5)


def b_pop():
    n = int(0.12 * SR); t = np.arange(n) / SR
    f = 520 + 520 * (t / t[-1])
    return norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.04), 0.55)


def b_stempel():
    n = int(0.6 * SR); t = np.arange(n) / SR
    dum = np.sin(2 * np.pi * (85 - 30 * t) * t) * np.exp(-t / 0.12)
    tumbuk = saring_fft(RNG.standard_normal(n), 80, 1800) * np.exp(-t / 0.035)
    kertas = saring_fft(RNG.standard_normal(n), 2500, 8000) * np.exp(-t / 0.06) * 0.25
    return norm(dum * 1.0 + tumbuk * 0.7 + kertas, 0.95)


def b_boom():
    n = int(3.2 * SR); t = np.arange(n) / SR
    sub = np.sin(2 * np.pi * np.cumsum(62 - 26 * (t / t[-1])) / SR) * np.exp(-t / 0.9)
    gemuruh = saring_fft(RNG.standard_normal(n), 25, 240) * np.exp(-t / 1.1)
    serang = saring_fft(RNG.standard_normal(n), 300, 5000) * np.exp(-t / 0.05) * 0.4
    return norm(sub + gemuruh * 0.8 + serang, 0.95)


def b_whoosh(panjang=1.1, puncak=0.62, lo=200, hi=4200, kuat=0.8):
    n = int(panjang * SR); t = np.arange(n) / SR
    x = RNG.standard_normal(n)
    # sapuan frekuensi: gabungkan pita rendah->tinggi dengan bobot berubah waktu
    rendah = saring_fft(x, lo, 900)
    tinggi = saring_fft(x, 900, hi)
    u = (t / t[-1])
    camp = rendah * (1 - u) + tinggi * u
    e = np.where(t < puncak, (t / puncak) ** 2.2, np.exp(-(t - puncak) / 0.16))
    return norm(camp * e, kuat)


def b_desir():
    return b_whoosh(0.7, 0.4, 500, 6000, 0.45)


def b_hisap():
    x = b_whoosh(0.9, 0.75, 300, 5000, 0.6)
    n = len(x); t = np.arange(n) / SR
    klik = np.zeros(n); i = int(0.75 * SR)
    klik[i:i + 600] = np.sin(2 * np.pi * 1800 * t[:600]) * np.exp(-t[:600] / 0.004)
    return norm(x + klik * 0.6, 0.6)


def b_guruh():
    n = int(5.5 * SR); t = np.arange(n) / SR
    retak = saring_fft(RNG.standard_normal(n), 900, 9000) * np.exp(-t / 0.06)
    acak = np.interp(t, np.linspace(0, t[-1], 40), RNG.uniform(0.3, 1.0, 40))
    gemuruh = saring_fft(RNG.standard_normal(n), 20, 260) * acak * np.exp(-t / 1.8) * np.clip(t / 0.15, 0, 1)
    return norm(retak * 0.55 + gemuruh, 0.95)


def b_kertas():
    n = int(3.2 * SR); out = np.zeros(n)
    for _ in range(70):
        i = RNG.integers(0, n - 4000); m = RNG.integers(600, 3500)
        tt = np.arange(m) / SR
        out[i:i + m] += saring_fft(RNG.standard_normal(m), 1800, 7500) * np.sin(np.pi * tt / tt[-1]) * RNG.uniform(0.2, 1)
    return norm(out * env(n, 0.3, 1.2, 1.4), 0.55)


def b_ping():
    n = int(2.0 * SR); t = np.arange(n) / SR
    x = np.sin(2 * np.pi * 1760 * t) + 0.35 * np.sin(2 * np.pi * 2640 * t) * np.exp(-t / 0.3)
    gema = np.zeros(n); d = int(0.23 * SR)
    y = x * np.exp(-t / 0.55)
    gema[d:] = y[:-d] * 0.35
    return norm(y + gema, 0.4)


def b_garis():
    n = int(1.6 * SR); t = np.arange(n) / SR
    return norm(saring_fft(RNG.standard_normal(n), 3000, 9000) * np.sin(np.pi * t / t[-1]) ** 2, 0.25)


def b_lonceng():
    n = int(4.5 * SR); t = np.arange(n) / SR
    f0 = 640
    x = sum(a * np.sin(2 * np.pi * f0 * r * t) * np.exp(-t / d) for r, a, d in [(1, 1, 1.8), (2.0, 0.55, 1.2), (2.76, 0.4, 0.9), (5.4, 0.25, 0.4), (0.5, 0.3, 2.4)])
    return norm(x * np.clip(t / 0.003, 0, 1), 0.6)


def b_klik():
    n = int(0.25 * SR); t = np.arange(n) / SR
    x = np.zeros(n)
    for o in (0, int(0.085 * SR)):
        m = 500
        x[o:o + m] += np.sin(2 * np.pi * 2200 * t[:m]) * np.exp(-t[:m] / 0.003)
    return norm(x, 0.55)


def b_bor():
    """Bor listrik menembus papan: dengung motor yang naik + gesekan kayu."""
    n = int(1.9 * SR); t = np.arange(n) / SR
    f = 150 + 70 * np.clip(t / 0.4, 0, 1) + 12 * np.sin(2 * np.pi * 7 * t)
    fasa = 2 * np.pi * np.cumsum(f) / SR
    motor = sum(np.sin(k * fasa) / k for k in range(1, 9))
    gesek = saring_fft(RNG.standard_normal(n), 900, 5200) * (0.6 + 0.4 * np.sin(2 * np.pi * 31 * t))
    e = np.clip(t / 0.06, 0, 1) * np.clip((t[-1] - t) / 0.25, 0, 1)
    return norm((motor * 0.55 + gesek * 0.5) * e, 0.7)


def b_semprot():
    """Air menyembur masuk lewat lubang: desis lebar + debam rendah."""
    n = int(2.2 * SR); t = np.arange(n) / SR
    desis = saring_fft(RNG.standard_normal(n), 500, 7000) * np.exp(-t / 0.9) * np.clip(t / 0.02, 0, 1)
    debam = np.sin(2 * np.pi * (70 - 25 * t) * t) * np.exp(-t / 0.18)
    return norm(desis * 0.8 + debam * 0.6, 0.8)


def b_tetes():
    """Tetesan air: 'plip' bernada turun dengan sedikit gaung."""
    n = int(0.45 * SR); t = np.arange(n) / SR
    f = 1500 * np.exp(-t / 0.035) + 520
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.05)
    gema = np.zeros(n); d = int(0.09 * SR)
    gema[d:] = x[:-d] * 0.3
    return norm(x + gema, 0.5)


def b_ketuk():
    """Ketukan jari di layar kaca: klik kecil yang lembut."""
    n = int(0.09 * SR); t = np.arange(n) / SR
    x = saring_fft(RNG.standard_normal(n), 1500, 7000) * np.exp(-t / 0.006) + np.sin(2 * np.pi * 180 * t) * np.exp(-t / 0.012) * 0.5
    return norm(x, 0.45)


def b_bisik():
    """Bisikan tanpa kata: desah berformant yang naik-turun seperti suku kata."""
    n = int(1.5 * SR); t = np.arange(n) / SR
    suku = np.interp(t, np.linspace(0, t[-1], 9), RNG.uniform(0.2, 1.0, 9)) * (0.5 + 0.5 * np.sin(2 * np.pi * 5.3 * t) ** 2)
    x = saring_fft(RNG.standard_normal(n), 1800, 7500) * 0.7 + saring_fft(RNG.standard_normal(n), 600, 1400) * 0.3
    return norm(x * suku * np.sin(np.pi * t / t[-1]), 0.4)


def b_kunci():
    """Gembok terkunci: dua klik logam + dering pendek."""
    n = int(0.6 * SR); t = np.arange(n) / SR
    x = np.zeros(n)
    for o, g in ((0, 1.0), (int(0.07 * SR), 0.7)):
        m = 900
        x[o:o + m] += g * saring_fft(RNG.standard_normal(m), 2000, 9000) * np.exp(-t[:m] / 0.004)
    dering = (np.sin(2 * np.pi * 2350 * t) + 0.5 * np.sin(2 * np.pi * 3710 * t)) * np.exp(-t / 0.12) * 0.25
    return norm(x + dering, 0.6)


def b_hapus():
    """Sapuan penghapus metadata: desir halus yang naik."""
    return b_whoosh(0.7, 0.45, 1500, 9000, 0.45)


def b_tambal():
    """Pelat kuningan menutup celah: dentum logam + tiga paku keling."""
    n = int(1.2 * SR); t = np.arange(n) / SR
    dentum = np.sin(2 * np.pi * 95 * t) * np.exp(-t / 0.15) + saring_fft(RNG.standard_normal(n), 120, 1500) * np.exp(-t / 0.05) * 0.6
    logam = sum(np.sin(2 * np.pi * f * t) * np.exp(-t / d) for f, d in ((610, 0.5), (1430, 0.3), (2280, 0.2))) * 0.18
    x = dentum + logam
    for k in range(3):
        o = int((0.35 + k * 0.14) * SR); m = 700
        x[o:o + m] += saring_fft(RNG.standard_normal(m), 2500, 9000) * np.exp(-t[:m] / 0.005) * 0.8
    return norm(x, 0.75)


BUNYI = {"bor": b_bor, "semprot": b_semprot, "tetes": b_tetes, "ketuk": b_ketuk, "bisik": b_bisik, "kunci": b_kunci,
         "hapus": b_hapus, "tambal": b_tambal, "tik": b_tik, "pop": b_pop, "stempel": b_stempel, "boom": b_boom, "whoosh": b_whoosh, "desir": b_desir,
         "hisap": b_hisap, "guruh": b_guruh, "kertas": b_kertas, "ping": b_ping, "garis": b_garis,
         "lonceng": b_lonceng, "klik": b_klik}
# isyarat dicatat pada saat PUNCAK; geser awal bunyi yang punya ancang-ancang
ANCANG = {"whoosh": 0.62, "desir": 0.4, "hisap": 0.75, "hapus": 0.45}


def ambience(total: float, suasana: list) -> np.ndarray:
    n = int(total * SR) + SR
    t = np.arange(n) / SR
    ts = np.array([s[0] for s in suasana])
    angin = np.interp(t, ts, [s[1] for s in suasana])
    hujan = np.interp(t, ts, [s[2] for s in suasana])

    def pita(lo, hi, kem=0.0, blok=20):
        out = np.zeros(n)
        L = blok * SR; tumpang = SR // 2
        jendela = np.ones(L + tumpang)
        jendela[:tumpang] = np.linspace(0, 1, tumpang); jendela[-tumpang:] = np.linspace(1, 0, tumpang)
        for i in range(0, n, L):
            x = saring_fft(RNG.standard_normal(L + tumpang), lo, hi, kem)
            seg = out[i:i + L + tumpang]
            seg += (x * jendela)[:len(seg)]
        return out / (np.abs(out).max() or 1)

    # ombak: gemuruh rendah + desah buih yang mengalun (periode 6-11 dtk)
    gelombang = 0.55 + 0.45 * (0.5 + 0.5 * np.sin(2 * np.pi * t / 8.3) * np.sin(2 * np.pi * t / 11.7 + 1.3))
    ombak = pita(40, 500, -0.6) * gelombang * 0.9 + pita(800, 6000) * gelombang ** 3 * 0.35
    ombak *= 0.55 + 0.6 * angin
    tiup = pita(250, 1400) * (0.6 + 0.4 * np.sin(2 * np.pi * t / 4.7)) * np.clip((angin - 0.3) / 0.6, 0, 1) ** 1.5
    rintik = pita(2500, 12000) * hujan
    # air masuk lewat lambung yang bocor: gemericik berdenyut, ikut `leak`
    bocor = np.interp(t, ts, [s[5] for s in suasana]) if len(suasana[0]) > 5 else np.zeros(n)
    gemericik = pita(350, 2600) * (0.55 + 0.45 * np.abs(np.sin(2 * np.pi * t * 3.1) * np.sin(2 * np.pi * t * 1.7 + 0.6))) * bocor
    return ombak * 0.11 + tiup * 0.10 + rintik * 0.12 + gemericik * 0.05


def main():
    tl = json.load(open(os.path.join(DIR, "timeline.json"), encoding="utf-8"))
    isy = json.load(open(os.path.join(DIR, "isyarat.json"), encoding="utf-8"))
    total = tl["total_duration"]
    bus = ambience(total, isy["suasana"])
    # pudar awal & akhir
    n = len(bus)
    bus[: 3 * SR] *= np.linspace(0, 1, 3 * SR)
    bus[-5 * SR:] *= np.linspace(1, 0, 5 * SR)
    sampel = {k: f() for k, f in BUNYI.items()}
    for c in isy["sfx"]:
        x = sampel[c["nama"]] * c["g"]
        i = int(max(0, c["t"] - ANCANG.get(c["nama"], 0)) * SR)
        j = min(n, i + len(x))
        bus[i:j] += x[: j - i]
    bus = np.clip(bus, -0.98, 0.98)
    with wave.open(os.path.join(DIR, "sfx_bus.wav"), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((bus * 32767).astype(np.int16).tobytes())
    print(f"sfx_bus.wav {total:.1f} dtk, {len(isy['sfx'])} isyarat, puncak {20 * np.log10(np.abs(bus).max()):.1f} dBFS")


if __name__ == "__main__":
    main()
