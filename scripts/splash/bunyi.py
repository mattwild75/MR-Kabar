"""
Efek suara splash sesudah login MR Kabar.

Splash bawaan (resources/js/components/login-splash.tsx) adalah koreografi
±4,7 detik: pindaian sonar, peta muncul dari pusat, tiga simpul jaringan
menyala, tiga segitiga risiko jatuh, "paket kabar" berjalan di garis, cincin
menyapu lalu menutup, lambang Aceh Barat naik, MR KABAR muncul huruf demi
huruf, tagline tersingkap, lalu kilau dan sapaan. Bunyinya disusun di sini
pada milidetik yang SAMA, lalu ditulis ke satu berkas yang diputar komponen
itu tepat saat koreografinya dimulai — tidak ada nada yang dibangkitkan di
peramban.

Ceritanya satu garis, semuanya dalam tangga nada A mayor:
  sonar mencari (E5, lalu A5) -> simpul menyala naik (C#6, E6, A6) ->
  tiga risiko jatuh berdebam turun (D3, C#3, B2: menggantung) -> cincin
  pengendalian menyapu dan MENGUNCI, akor A mengalun di bawahnya (risiko
  terkendali) -> MR KABAR mengeja dirinya dengan marimba naik -> akor
  penutup A add9 dengan lonceng kaca saat sapaan muncul.

Semua lapisan dijaga lembut: bunyi ini terdengar setiap kali orang masuk,
jadi tidak boleh melengking, menghentak, atau terasa seperti notifikasi.

Waktu di bawah DISALIN dari komponen (milidetik sejak animasi mulai). Kalau
koreografinya diubah, ubah juga di sini lalu jalankan ulang:

    python scripts/splash/bunyi.py

Keluaran:
    public/media/splash/bunyi.mp3           efek suara (stereo, 48 kHz)
    resources/js/data/splash-bunyi.json     versi berkas, durasi, kenyaringan
"""
import hashlib
import json
import os
import re
import subprocess
import tempfile
import wave

import numpy as np
from scipy import signal
from scipy.ndimage import minimum_filter1d, uniform_filter1d

AKAR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
GEO = json.load(open(os.path.join(AKAR, "resources", "js", "data", "splash-logo.json"), encoding="utf-8"))
MP3 = os.path.join(AKAR, "public", "media", "splash", "bunyi.mp3")
DATA = os.path.join(AKAR, "resources", "js", "data", "splash-bunyi.json")

SR = 48000
DURASI = 4.95
N = int(SR * DURASI)
KENYARINGAN = -20.0  # LUFS terpadu; lembut untuk bunyi yang terdengar tiap masuk
PUNCAK = -1.5  # dBFS

acak = np.random.default_rng(20261004)

# Nada tangga A mayor (Hz).
A2, B2, CIS3, D3, E3 = 110.0, 123.47, 138.59, 146.83, 164.81
A3, CIS4, E4, A4, B4 = 220.0, 277.18, 329.63, 440.0, 493.88
CIS5, E5, FIS5, A5, B5 = 554.37, 659.26, 739.99, 880.0, 987.77
CIS6, E6, A6, B6, CIS7, E7 = 1108.73, 1318.51, 1760.0, 1975.53, 2217.46, 2637.02

SIMPUL = GEO["simpul"]
SEGITIGA = GEO["segitiga"]
LAPISAN = GEO["lapisan"]
CINCIN = GEO["cincin"]


# ── perkakas ────────────────────────────────────────────────────────────────


def waktu(n):
    return np.arange(n) / SR


def naik(n, lama):
    """Serangan setengah-kosinus, supaya tiap bunyi tidak diawali klik."""
    e = np.ones(n)
    k = min(n, max(1, int(lama * SR)))
    e[:k] = 0.5 - 0.5 * np.cos(np.pi * np.arange(k) / k)
    return e


def luruh(n, tau, tunda=0.0):
    return np.exp(-np.maximum(waktu(n) - tunda, 0.0) / tau)


def ekor(x, lama=0.03):
    """Ujung sinyal dipudarkan, supaya tidak ada yang terpotong mendadak."""
    x = np.array(x, float)
    k = min(x.shape[-1], int(lama * SR))
    x[..., -k:] *= np.linspace(1.0, 0.0, k)
    return x


def lpf(x, fc, orde=2):
    return signal.sosfilt(signal.butter(orde, fc, "low", fs=SR, output="sos"), x, axis=-1)


def hpf(x, fc, orde=2):
    return signal.sosfilt(signal.butter(orde, fc, "high", fs=SR, output="sos"), x, axis=-1)


def bpf(x, rendah, tinggi, orde=2):
    return signal.sosfilt(signal.butter(orde, [rendah, tinggi], "band", fs=SR, output="sos"), x, axis=-1)


def svf(x, fc, q=0.9, ragam="bp"):
    """Filter keadaan-variabel (TPT) dengan frekuensi potong yang berubah tiap sampel."""
    fc = np.broadcast_to(np.asarray(fc, float), x.shape)
    g = np.tan(np.pi * np.clip(fc, 20.0, SR * 0.45) / SR)
    k = 1.0 / q
    a1 = 1.0 / (1.0 + g * (g + k))
    a2 = g * a1
    a3 = g * a2
    v1s = np.empty_like(x)
    v2s = np.empty_like(x)
    ic1 = ic2 = 0.0
    for i in range(len(x)):
        v3 = x[i] - ic2
        v1 = a1[i] * ic1 + a2[i] * v3
        v2 = ic2 + a2[i] * ic1 + a3[i] * v3
        ic1 = 2.0 * v1 - ic1
        ic2 = 2.0 * v2 - ic2
        v1s[i] = v1
        v2s[i] = v2
    return k * v1s if ragam == "bp" else v2s


def merah_muda(n):
    """Desis merah muda (1/f): lebih lembut di telinga daripada desis putih."""
    f = np.fft.rfftfreq(n, 1 / SR)
    f[0] = f[1]
    x = np.fft.irfft(np.fft.rfft(acak.standard_normal(n)) / np.sqrt(f), n)
    return x / np.std(x)


def bezier(x1, y1, x2, y2):
    """cubic-bezier CSS: memetakan pecahan waktu ke kemajuan, persis easing animasinya."""

    def f(u):
        u = np.asarray(u, float)
        lo, hi = np.zeros_like(u), np.ones_like(u)
        for _ in range(42):
            m = (lo + hi) / 2
            x = 3 * (1 - m) ** 2 * m * x1 + 3 * (1 - m) * m**2 * x2 + m**3
            lo, hi = np.where(x < u, m, lo), np.where(x < u, hi, m)
        s = (lo + hi) / 2
        return 3 * (1 - s) ** 2 * s * y1 + 3 * (1 - s) * s**2 * y2 + s**3

    return f


HALUS = bezier(0.16, 1, 0.3, 1)
SAPU = bezier(0.45, 0, 0.2, 1)


def geser(x_px):
    """Posisi mendatar di logo -> letak kiri-kanan bunyi (dijaga tidak ekstrem)."""
    return float(np.clip((x_px / GEO["lebar"] - 0.5) * 1.6, -0.62, 0.62))


kering = np.zeros((2, N))
kirim = np.zeros((2, N))  # ke gema ruang


def tempel(sig, mulai, pan=0.0, kuat=1.0, gema=0.25):
    """Letakkan sinyal di bus pada detik `mulai`, dengan letak kiri-kanan daya-setara."""
    sig = np.asarray(sig, float)
    i0 = int(round(mulai * SR))
    if i0 >= N:
        return
    if sig.ndim == 1:
        p = np.clip(np.broadcast_to(np.asarray(pan, float), sig.shape), -1, 1)
        a = (p + 1) * np.pi / 4
        sig = np.vstack([sig * np.cos(a), sig * np.sin(a)]) * np.sqrt(2)
    n = min(sig.shape[1], N - i0)
    kering[:, i0 : i0 + n] += kuat * sig[:, :n]
    kirim[:, i0 : i0 + n] += kuat * gema * sig[:, :n]


# ── suara-suara ─────────────────────────────────────────────────────────────


def sonar(f):
    n = int(2.0 * SR)
    t = waktu(n)
    fr = f * (1 - 0.006 * (1 - np.exp(-t / 0.25)))  # nada sedikit melorot, khas gema sonar
    ph = 2 * np.pi * np.cumsum(fr) / SR
    s = np.sin(ph) + 0.05 * np.sin(2 * ph) + 0.02 * np.sin(3 * ph)
    return ekor(s * naik(n, 0.004) * luruh(n, 0.33))


def kristal(f, lama=1.0, tau=0.22, indeks=1.0):
    """Butir kaca: serangan cerah sekejap (FM) yang cepat menjadi nada murni."""
    n = int(lama * SR)
    t = waktu(n)
    i = indeks * np.exp(-t / 0.025)
    s = np.sin(2 * np.pi * f * t + i * np.sin(2 * np.pi * f * 3 * t))
    s += 0.1 * np.sin(2 * np.pi * f * 2.756 * t) * np.exp(-t / 0.04)
    return ekor(lpf(s, 5000) * naik(n, 0.0015) * luruh(n, tau))


def lonceng(f, lama=2.2, tau=0.9):
    """Lonceng kaca untuk akor penutup: parsial tak-harmonis (rasio 3,5) yang meluruh."""
    n = int(lama * SR)
    t = waktu(n)
    i = 1.6 * np.exp(-t / 0.1)
    s = np.sin(2 * np.pi * f * t + i * np.sin(2 * np.pi * f * 3.5 * t))
    s += 0.25 * np.sin(2 * np.pi * f * 2.0 * t) * np.exp(-t / 0.35)
    return ekor(lpf(s, 4500) * naik(n, 0.002) * luruh(n, tau), 0.2)


def marimba(f, lama=0.7):
    n = int(lama * SR)
    t = waktu(n)
    s = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.2)
    s += 0.22 * np.sin(2 * np.pi * f * 3.932 * t) * np.exp(-t / 0.05)
    s += 0.05 * np.sin(2 * np.pi * f * 9.538 * t) * np.exp(-t / 0.015)
    palu = lpf(acak.standard_normal(n), 3000) * np.exp(-t / 0.004) * 0.08
    return ekor(lpf(s + palu, 5000) * naik(n, 0.0015))


def debam(f, lama=0.8):
    """Debam lembut pemukul berlapis kain: nada turun cepat + ketukan tipis."""
    n = int(lama * SR)
    t = waktu(n)
    fr = f * (1 + 1.1 * np.exp(-t / 0.02))
    ph = 2 * np.pi * np.cumsum(fr) / SR
    tubuh = np.sin(ph) * np.exp(-t / 0.16) + 0.45 * np.sin(2 * ph) * np.exp(-t / 0.07) + 0.18 * np.sin(3 * ph) * np.exp(-t / 0.04)
    ketuk = bpf(acak.standard_normal(n), 900, 3500) * np.exp(-t / 0.005) * 0.35
    return ekor(lpf(tubuh + ketuk, 3000) * naik(n, 0.0012))


def kilap(lama=0.09, rendah=5000, tinggi=9000):
    n = int(lama * SR)
    return ekor(bpf(acak.standard_normal(n), rendah, tinggi) * luruh(n, lama / 4) * naik(n, 0.003))


def hamparan(nada, lama, fc_awal, fc_akhir, waktu_fc, serang, sisa=0.55, tau=1.2):
    """Bunyi hamparan hangat: gigi gergaji aditif (tanpa aliasing) di balik filter yang terbuka pelan."""
    n = int(lama * SR)
    t = waktu(n)
    fc = fc_awal + (fc_akhir - fc_awal) * np.clip(t / waktu_fc, 0, 1)
    keluaran = np.zeros(n)
    for f in nada:
        for geser_sen in (-6, 0, 6):
            fd = f * 2 ** (geser_sen / 1200)
            fase = acak.uniform(0, 2 * np.pi)
            for h in range(1, int(5000 // fd) + 1):
                bobot = (1 / h) / np.sqrt(1 + (h * fd / fc) ** 4)
                keluaran += bobot * np.sin(2 * np.pi * fd * h * t + fase * h)
    keluaran /= np.max(np.abs(keluaran)) + 1e-9
    selubung = naik(n, serang) * (sisa + (1 - sisa) * np.exp(-np.maximum(t - serang, 0) / tau))
    return ekor(keluaran * selubung, 0.1)


# ── koreografi (milidetik dari login-splash.tsx) ───────────────────────────


def susun():
    # Lapisan udara: dengung A yang hampir tak terdengar, perekat seluruh bunyi.
    n = int(4.9 * SR)
    t = waktu(n)
    dengung = np.sin(2 * np.pi * A2 * t) + 0.6 * np.sin(2 * np.pi * E3 * t + 0.3) + 0.35 * np.sin(2 * np.pi * 220.4 * t)
    dengung *= 0.8 + 0.2 * np.sin(2 * np.pi * 0.7 * t)
    selubung = np.interp(t, [0, 0.9, 1.4, 4.1, 4.9], [0, 0.8, 1.0, 1.0, 0.0])
    udara = np.vstack([lpf(merah_muda(n), 900), lpf(merah_muda(n), 900)]) * 0.5
    tempel((udara + 0.6 * dengung) * selubung, 0.0, kuat=0.016, gema=0.3)

    # 100 & 420 ms — dua pindaian sonar dari pusat peta, gemanya memantul kiri-kanan.
    for t0, f in ((0.100, E5), (0.420, A5)):
        s = sonar(f)
        tempel(s, t0, 0.0, kuat=0.17, gema=0.5)
        tempel(lpf(s, 2500), t0 + 0.19, -0.45, kuat=0.05, gema=0.6)
        tempel(lpf(s, 1800), t0 + 0.38, 0.45, kuat=0.022, gema=0.7)

    # 220 ms, 1150 ms — peta merekah dari pusat (easing HALUS): desis yang membuka.
    n = int(1.45 * SR)
    t = waktu(n)
    p = HALUS(np.clip(t / 1.15, 0, 1))
    selubung = (1 - np.exp(-t / 0.06)) * np.exp(-np.maximum(t - 0.35, 0) / 0.45)
    rekah = np.vstack([svf(merah_muda(n), 250 + 1700 * p, 0.8, "lp"), svf(merah_muda(n), 260 + 1650 * p, 0.8, "lp")])
    tempel(ekor(rekah * selubung), 0.220, kuat=0.05, gema=0.3)
    n = int(1.0 * SR)
    t = waktu(n)
    hum = np.sin(2 * np.pi * np.cumsum(110 * (1 - 0.08 * t)) / SR)
    tempel(ekor(hum * naik(n, 0.08) * luruh(n, 0.35, 0.08)), 0.220, 0.0, kuat=0.05, gema=0.2)

    # 760 + i*120 ms — tiga simpul jaringan menyala (C#6, E6, A6), riak kuningnya berkilap.
    for i, f in enumerate((CIS6, E6, A6)):
        t0 = 0.760 + i * 0.120
        tempel(kristal(f), t0, geser(SIMPUL[i]["x"]), kuat=0.16, gema=0.4)
        tempel(kilap(), t0 + 0.09, geser(SIMPUL[i]["x"]), kuat=0.012, gema=0.3)

    # 1060 + n*140 ms — segitiga risiko jatuh (urutan 0, 2, 1), mendarat pada 55%
    # dari 780 ms, memantul pada 78%. Nadanya turun dan menggantung: D3, C#3, B2.
    for n_, j in enumerate((0, 2, 1)):
        t0 = 1.060 + n_ * 0.140
        pan = geser(SEGITIGA[j]["cx"])
        m = int(0.43 * SR)
        tt = waktu(m)
        jatuh = svf(acak.standard_normal(m), 2600 - 1900 * (tt / 0.43) ** 1.5, 1.2, "bp")
        tempel(ekor(jatuh * (tt / 0.43) ** 2, 0.01), t0, pan, kuat=0.035, gema=0.15)
        f = (D3, CIS3, B2)[n_]
        tempel(debam(f), t0 + 0.429, pan, kuat=0.26, gema=0.18)
        tempel(debam(f * 2, 0.4), t0 + 0.608, pan, kuat=0.035, gema=0.2)

    # Paket kabar: [dari, ke, mulai]; berangkat dengan kedip tipis, laju 0,85 px/ms.
    def ujung(i):
        return SIMPUL[i]["x"] if i < 3 else SEGITIGA[i - 3]["cx"]

    for dari, ke, t0 in ((3, 0, 1.380), (5, 1, 1.480), (4, 2, 1.580), (0, 1, 1.950), (2, 5, 2.060), (1, 3, 2.180)):
        j = next(x for x in GEO["jalur"] if {x["dari"], x["ke"]} == {dari, ke})
        pts = np.array(j["titik"], float)
        lama = np.sum(np.hypot(*np.diff(pts, axis=0).T)) / 0.85 / 1000
        m = int(0.05 * SR)
        tt = waktu(m)
        kedip = np.sin(2 * np.pi * np.cumsum(2300 + 800 * tt / 0.05) / SR) * naik(m, 0.002) * luruh(m, 0.012)
        tempel(ekor(kedip, 0.005), t0, geser(ujung(dari)), kuat=0.028, gema=0.35)
        if ke < 3:
            tiba = kristal((CIS6, E6, A6)[ke], 0.5, 0.08, 0.6)
            tempel(tiba, t0 + lama, geser(ujung(ke)), kuat=0.02, gema=0.4)

    # 1430 ms, 960 ms — cincin pengendalian menyapu searah jarum jam (easing SAPU).
    # Tiga komet beruntun (tunda 45 ms, terang 1; 0,7; 0,4) -> tiga desir terpisah.
    # Kerasnya mengikuti laju sapuan, letaknya mengikuti posisi komet di cincin,
    # dan meredup di dua celah cincin tempat komet padam.
    mulai, lama = 1.430, 0.960
    b0 = CINCIN["busur"][0]["mulai"]
    terlihat = [(b0, CINCIN["busur"][0]["akhir"] + 360), (CINCIN["busur"][1]["mulai"] + 360, CINCIN["busur"][1]["akhir"] + 360)]
    for i, terang in enumerate((1.0, 0.7, 0.4)):
        n = int((lama + 0.4) * SR)
        t = waktu(n)
        u = np.clip(t / lama, 0, 1)
        p = SAPU(u)
        sudut = b0 + 360 * p
        laju = np.gradient(p)
        laju /= laju.max()
        tampak = np.full(n, 0.28)
        for a, b in terlihat:
            tampak = np.maximum(tampak, np.clip(np.minimum(sudut - a, b - sudut) / 8 + 0.5, 0, 1))
        sesudah = np.where(t > lama, np.exp(-(t - lama) / 0.07), 1.0)
        kuat = (0.15 + 0.85 * laju) * tampak * sesudah
        desir = svf(merah_muda(n), 500 + 2200 * laju, 1.4, "bp")
        nada = (np.sin(2 * np.pi * A5 * t) + 0.5 * np.sin(2 * np.pi * E6 * t)) * 0.08
        pan = 0.65 * np.cos(np.radians(sudut))
        tempel(ekor((desir + nada) * kuat), mulai + i * 0.045, pan, kuat=0.17 * terang, gema=0.25)

    # 2140 ms — cincin hampir menutup, denyut cahaya biru: akor A mengalun di bawah
    # (A2 E3 A3 C#4) dan bertahan sampai akhir. Debam risiko yang menggantung selesai di sini.
    tempel(hamparan((A2, E3, A3, CIS4), 2.9, 700, 1000, 0.6, 0.30, sisa=0.55, tau=1.2), 2.140, 0.0, kuat=0.09, gema=0.35)
    # 2390 ms — cincin terkunci: ketuk kayu kecil.
    n = int(0.35 * SR)
    t = waktu(n)
    kunci = (np.sin(2 * np.pi * A3 * t) + 0.5 * np.sin(2 * np.pi * A4 * t)) * np.exp(-t / 0.06)
    kunci += bpf(acak.standard_normal(n), 2000, 5000) * np.exp(-t / 0.003) * 0.4
    tempel(ekor(kunci * naik(n, 0.001)), 2.390, 0.0, kuat=0.09, gema=0.3)

    # 2040 ms — lambang Aceh Barat naik; 2560 ms kilau melintasinya dari kiri ke kanan.
    xl, wl = LAPISAN["lambang"]["x"], LAPISAN["lambang"]["w"]
    n = int(0.66 * SR)
    t = waktu(n)
    angkat = svf(merah_muda(n), 350 + 1050 * np.clip(t / 0.53, 0, 1), 1.1, "bp")
    selubung = np.where(t < 0.53, (t / 0.53) ** 2, np.exp(-(t - 0.53) / 0.05))
    tempel(ekor(angkat * selubung), 2.040, geser(xl + wl / 2), kuat=0.03, gema=0.3)
    for k, (t0, f) in enumerate(((2.64, E6), (2.78, A6), (2.93, B6), (3.07, CIS7), (3.22, E7))):
        tempel(kristal(f, 0.6, 0.08, 0.5), t0, geser(xl + wl * (0.15 + 0.7 * k / 4)), kuat=0.02, gema=0.5)

    # 2200 ms (M, R) dan 2380 ms (K A B A R) — huruf demi huruf: marimba mengeja
    # naik A4 C#5 | E5 F#5 A5 B5 C#6, berbunyi saat tiap huruf tiba (±110 ms).
    for k, (t0, f) in enumerate(zip((2.200, 2.275, 2.380, 2.442, 2.504, 2.566, 2.628), (A4, CIS5, E5, FIS5, A5, B5, CIS6))):
        h = LAPISAN[f"huruf-{k + 1}"]
        tempel(marimba(f), t0 + 0.11, geser(h["x"] + h["w"] / 2), kuat=0.13, gema=0.3)

    # 2860 ms, 800 ms — tagline tersingkap dari kiri: hembus tipis kiri ke kanan.
    n = int(0.8 * SR)
    t = waktu(n)
    hembus = bpf(merah_muda(n), 2500, 7000) * np.sin(np.pi * t / 0.8) ** 1.5
    tempel(ekor(hembus), 2.860, np.linspace(-0.55, 0.55, n), kuat=0.025, gema=0.3)

    # 3150 ms — kilau menyapu logo, sapaan muncul: akor penutup A add9.
    tempel(hamparan((E4, A4, B4, CIS5), 1.9, 1200, 2600, 0.3, 0.05, sisa=0.5, tau=1.0), 3.150, 0.0, kuat=0.11, gema=0.4)
    for k, (f, pan) in enumerate(((E5, -0.3), (A5, -0.1), (B5, 0.1), (E6, 0.3))):
        tempel(lonceng(f), 3.150 + k * 0.040, pan, kuat=0.15, gema=0.45)
    n = int(1.6 * SR)
    t = waktu(n)
    tempel(ekor(np.sin(2 * np.pi * A2 * t) * naik(n, 0.12) * luruh(n, 0.9, 0.12)), 3.150, 0.0, kuat=0.06, gema=0.1)
    n = int(1.1 * SR)
    t = waktu(n)
    kilau = bpf(merah_muda(n), 5000, 10000) * np.sin(np.pi * t / 1.1) ** 2
    tempel(ekor(kilau), 3.150, np.linspace(-0.7, 0.7, n), kuat=0.015, gema=0.4)

    # 4100 ms — logo pergi (membesar & memudar): desir turun yang singkat.
    n = int(0.45 * SR)
    t = waktu(n)
    pergi = svf(merah_muda(n), 2500 - 2100 * (t / 0.45), 0.9, "lp") * naik(n, 0.06) * luruh(n, 0.12, 0.06)
    tempel(ekor(pergi), 4.100, 0.0, kuat=0.03, gema=0.3)


def ruang(rt60=1.6, lama=2.4, pra=0.018):
    """Gema ruang sintetis: ekor rendah meluruh pelan, ekor tinggi meluruh cepat."""
    n = int(lama * SR)
    t = waktu(n)
    rendah = lpf(acak.standard_normal((2, n)), 2500)
    tinggi = hpf(acak.standard_normal((2, n)), 2500)
    ir = rendah * np.exp(-6.91 * t / rt60) + 0.6 * tinggi * np.exp(-6.91 * t / (rt60 * 0.45))
    ir *= naik(n, 0.012)
    ir = np.concatenate([np.zeros((2, int(pra * SR))), ir], axis=1)
    return ir / np.sqrt(np.sum(ir**2) / 2)


def ukur(wav):
    """Kenyaringan terpadu (LUFS) dan puncak sejati (dBTP) menurut ffmpeg ebur128."""
    hasil = subprocess.run(
        ["ffmpeg", "-hide_banner", "-nostats", "-i", wav, "-af", "ebur128=peak=true", "-f", "null", "-"],
        capture_output=True,
        text=True,
    ).stderr
    lufs = float(re.findall(r"I:\s+(-?[\d.]+) LUFS", hasil)[-1])
    tp = float(re.findall(r"Peak:\s+(-?[\d.]+) dBFS", hasil)[-1])
    return lufs, tp


def tulis_wav(path, x):
    data = (np.clip(x, -1, 1) * 32767).astype("<i2").T.copy()
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())


def batasi(x, plafon_db):
    """Pembatas puncak dengan pandang-depan 6 ms, supaya tidak ada yang pecah."""
    plafon = 10 ** (plafon_db / 20)
    puncak = np.max(np.abs(x), axis=0)
    g = np.minimum(1.0, plafon / np.maximum(puncak, 1e-9))
    w = int(0.006 * SR)
    g = uniform_filter1d(minimum_filter1d(g, w * 2 + 1), w)
    return x * g


def main():
    susun()
    ir = ruang()
    basah = np.vstack([signal.fftconvolve(kirim[c], ir[c])[:N] for c in (0, 1)])
    campur = hpf(kering + 0.7 * basah, 40)

    # Pudar keluar mengikuti kepergian logo (4100 ms + 560 ms), selesai 4,9 detik.
    pudar = np.ones(N)
    i1, i2 = int(4.10 * SR), int(4.90 * SR)
    pudar[i1:i2] = 0.5 + 0.5 * np.cos(np.pi * np.arange(i2 - i1) / (i2 - i1))
    pudar[i2:] = 0.0
    campur *= pudar

    # Kenyaringan disetel dua langkah: ukur, sesuaikan, batasi puncaknya.
    campur /= np.max(np.abs(campur))
    with tempfile.TemporaryDirectory() as tmp:
        wav = os.path.join(tmp, "bunyi.wav")
        for _ in range(3):
            tulis_wav(wav, batasi(campur, PUNCAK))
            lufs, _tp = ukur(wav)
            campur *= 10 ** ((KENYARINGAN - lufs) / 20)
        campur = batasi(campur, PUNCAK)
        tulis_wav(wav, campur)
        lufs, tp = ukur(wav)
        subprocess.run(
            ["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-i", wav, "-c:a", "libmp3lame", "-b:a", "192k", "-ar", str(SR), MP3],
            check=True,
        )

    versi = hashlib.sha1(open(MP3, "rb").read()).hexdigest()[:10]
    with open(DATA, "w", encoding="utf-8", newline="\n") as f:
        json.dump({"versi": versi, "durasi": round(DURASI, 2), "lufs": lufs, "puncak": tp}, f, indent=4)
        f.write("\n")
    print(f"{os.path.relpath(MP3, AKAR)}  {os.path.getsize(MP3) / 1024:.0f} KB  {lufs:.1f} LUFS  puncak {tp:.1f} dBFS  versi {versi}")

    # Kerasnya per 100 ms — untuk memeriksa tiap peristiwa terdengar di tempatnya.
    for i in range(0, N, SR // 10):
        r = np.sqrt(np.mean(campur[:, i : i + SR // 10] ** 2)) + 1e-9
        print(f"{i / SR:4.1f}s {20 * np.log10(r):6.1f} dB  " + "#" * max(0, int((20 * np.log10(r) + 50) / 1.5)))


if __name__ == "__main__":
    main()
