"""
Jalur efek suara tutorial v2 -> keluaran/sfx.wav (mono 48 kHz).

Dua sumber isyarat, keduanya dari keluaran/isyarat.json (rakit.py):

  - REKAMAN: peristiwa yang dicatat pengendali saat merekam - setiap klik
    tetikus, setiap ketukan tombol, gulir, zoom, munculnya catatan, dan
    simpan yang berhasil - lengkap dengan milidetiknya. Inilah yang membuat
    layar aplikasi terasa "hidup": klik terdengar saat kursor menekan, ketikan
    terdengar sepanjang huruf muncul. Kerasnya sengaja kecil; ia latar, bukan
    tontonan.
  - SELINGAN: isyarat yang diekspor koreografi animasi (whoosh kartu bab,
    boom judul, tik poin catatan, guruh kilat) beserta suasana laut
    (ombak, angin, hujan) - hanya di dalam segmen animasi.

Bunyi selingan memakai pustaka sintesis video edukasi v6 (build_sfx.py)
supaya terdengar sekeluarga; bunyi antarmuka disintesis di sini.

    python sfx.py
"""
import importlib.util
import json
import os
import wave

import numpy as np

DIR = os.path.dirname(os.path.abspath(__file__))
KEL = os.path.join(DIR, "keluaran")
V6 = os.path.join(DIR, "..", "..", "video-edukasi", "v6")
spec = importlib.util.spec_from_file_location("sfx_v6", os.path.join(V6, "build_sfx.py"))
v6 = importlib.util.module_from_spec(spec)
spec.loader.exec_module(v6)
SR = v6.SR
RNG = np.random.default_rng(20261002)
saring, norm = v6.saring_fft, v6.norm


def klik_tetikus():
    n = int(0.11 * SR)
    t = np.arange(n) / SR
    x = np.zeros(n)
    for o, a in ((0, 1.0), (int(0.065 * SR), 0.55)):
        m = int(0.02 * SR)
        z = saring(RNG.standard_normal(m), 1400, 7000) * np.exp(-t[:m] / 0.0028)
        z += np.sin(2 * np.pi * 190 * t[:m]) * np.exp(-t[:m] / 0.006) * 0.5
        x[o:o + m] += z * a
    return norm(x, 0.42)


def ketukan(i):
    """Delapan variasi ketukan papan ketik (tinggi dan warna sedikit beda)."""
    r = np.random.default_rng(900 + i)
    n = int(0.05 * SR)
    t = np.arange(n) / SR
    z = saring(r.standard_normal(n), 700 + r.uniform(-150, 250), 4800 + r.uniform(-800, 800)) * np.exp(-t / (0.0045 + r.uniform(0, 0.002)))
    z += np.sin(2 * np.pi * (150 + r.uniform(-30, 40)) * t) * np.exp(-t / 0.008) * 0.35
    return norm(z, 0.2 + r.uniform(-0.03, 0.03))


def spasi():
    n = int(0.08 * SR)
    t = np.arange(n) / SR
    z = saring(RNG.standard_normal(n), 300, 2600) * np.exp(-t / 0.009)
    z += np.sin(2 * np.pi * 110 * t) * np.exp(-t / 0.014) * 0.5
    return norm(z, 0.24)


def desir(panjang=0.36, puncak=0.13, lo=500, hi=3200):
    n = int(panjang * SR)
    t = np.arange(n) / SR
    return norm(saring(RNG.standard_normal(n), lo, hi) * np.sin(np.pi * t / t[-1]) ** 2, puncak)


def berhasil():
    n = int(1.1 * SR)
    t = np.arange(n) / SR
    x = np.zeros(n)
    for o, f in ((0.0, 1318.5), (0.11, 1760.0)):
        i = int(o * SR)
        u = t[: n - i]
        x[i:] += (np.sin(2 * np.pi * f * u) + 0.3 * np.sin(2 * np.pi * f * 2 * u)) * np.exp(-u / 0.32) * np.clip(u / 0.004, 0, 1)
    return norm(x, 0.3)


def main():
    isy = json.load(open(os.path.join(KEL, "isyarat.json"), encoding="utf-8"))
    total = isy["total"]
    n = int(total * SR) + SR
    bus = np.zeros(n)

    # Suasana laut hanya di dalam segmen animasi, dengan tepi melandai.
    if isy["suasana"]:
        amb = v6.ambience(total, isy["suasana"])[:n]
        topeng = np.zeros(n)
        tepi = int(0.35 * SR)
        for s in isy["segmen"]:
            if s["a"].startswith("rekam-"):
                continue
            i, j = int(s["mulai"] * SR), int((s["mulai"] + s["durasi"]) * SR)
            topeng[i:j] = 1.0
            topeng[i:i + tepi] *= np.linspace(0, 1, min(tepi, j - i))
            topeng[max(i, j - tepi):j] *= np.linspace(1, 0, j - max(i, j - tepi))
        bus[: len(amb)] += amb * topeng[: len(amb)] * 0.9

    sel = {k: f() for k, f in v6.BUNYI.items()}
    ui = {
        "klik": klik_tetikus(),
        "spasi": spasi(),
        "enter": spasi() * 1.3,
        "gulir": desir(),
        "halaman": desir(0.5, 0.1, 400, 2400),
        "zoom": v6.b_whoosh(0.7, 0.3, 300, 3800, 0.6),
        "zoomKeluar": v6.b_whoosh(0.6, 0.24, 300, 3200, 0.6)[::-1].copy(),
        "catat": sel["pop"] * 0.75,
        "kartu": sel["pop"] * 0.6,
        "judul": desir(0.55, 0.16, 300, 2600),
        "sukses": berhasil(),
        "ping": sel["ping"] * 0.55,
        "sorot": sel["tik"] * 0.22,
    }
    ketuk = [ketukan(i) for i in range(8)]
    hitung = {}
    for k, c in enumerate(isy["isyarat"]):
        nama = c["nama"]
        if c.get("selingan"):
            x = sel[nama] * c.get("g", 1)
            mulai = c["t"] - v6.ANCANG.get(nama, 0)
        elif nama == "ketuk":
            x = ketuk[k % 8]
            mulai = c["t"]
        elif nama in ui:
            x = ui[nama]
            mulai = c["t"] - (0.25 if nama in ("zoom", "zoomKeluar") else 0)
        else:
            continue
        hitung[nama] = hitung.get(nama, 0) + 1
        i = int(max(0, mulai) * SR)
        j = min(n, i + len(x))
        bus[i:j] += x[: j - i]

    bus = np.clip(bus, -0.98, 0.98)
    with wave.open(os.path.join(KEL, "sfx.wav"), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((bus * 32767).astype(np.int16).tobytes())
    print(f"sfx.wav {total:.1f} dtk; " + ", ".join(f"{k} {v}" for k, v in sorted(hitung.items(), key=lambda x: -x[1])))


if __name__ == "__main__":
    main()
