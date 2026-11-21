"""
Contoh suara babak pembuka v7 (untuk disetujui pemilik sebelum seluruh suara
dibuat): kalimat s1 dari audio/line_NNN.wav dirakit dengan irama percakapan,
suasana badai -> "Tunggu." -> bunyi waktu diulang -> dermaga pagi.
Belum ada musik; fokusnya suara tokoh.

    python suara.py s1 && python contoh_pembuka.py "<keluaran.mp3>"
"""
import importlib.util
import json
import os
import subprocess
import sys

import numpy as np

DIR = os.path.dirname(os.path.abspath(__file__))
V6 = os.path.join(DIR, "..", "v6")
spek = importlib.util.spec_from_file_location("sfx_v6", os.path.join(V6, "build_sfx.py"))
sfx6 = importlib.util.module_from_spec(spek)
spek.loader.exec_module(sfx6)

import naskah as NS  # noqa: E402
from suara import FFMPEG  # noqa: E402

SR = 48000
RNG = np.random.default_rng(20261121)


def baca_wav(path):
    p = subprocess.run([FFMPEG, "-v", "error", "-i", path, "-f", "s16le", "-ac", "1", "-ar", str(SR), "pipe:1"],
                       capture_output=True, check=True)
    return np.frombuffer(p.stdout, dtype=np.int16).astype(np.float32) / 32768.0


def b_rewind():
    """Bunyi gulungan kertas ditarik mundur: desir naik-turun cepat + sobek."""
    n = int(1.15 * SR); t = np.arange(n) / SR
    x = RNG.standard_normal(n)
    f = 0.5 + 0.5 * np.sin(2 * np.pi * (3 + 9 * t) * t)          # kepakan makin cepat
    desir = sfx6.saring_fft(x, 700, 7000) * f * np.clip(t / 0.08, 0, 1) * np.exp(-np.clip(t - 0.8, 0, None) / 0.12)
    sobek_n = int(0.28 * SR); tt = np.arange(sobek_n) / SR
    sobek = sfx6.saring_fft(RNG.standard_normal(sobek_n), 1800, 9000) * (0.55 + 0.45 * np.sign(np.sin(2 * np.pi * 55 * tt)))
    sobek *= np.exp(-tt / 0.1)
    out = desir * 0.55
    out[:sobek_n] += sobek * 0.8
    return sfx6.norm(out, 0.6)


def b_camar():
    n = int(0.75 * SR); t = np.arange(n) / SR
    f = 1650 + 700 * np.exp(-t / 0.12) - 400 * t
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.3 * np.sin(2 * np.pi * np.cumsum(2 * f) / SR)
    am = (0.5 + 0.5 * np.sin(2 * np.pi * 9 * t)) * np.sin(np.pi * t / t[-1])
    return sfx6.norm(sfx6.saring_fft(x * am, 700, 6000), 0.3)


def tempel(bus, x, t, gain=1.0):
    i = int(t * SR)
    if i >= len(bus):
        return
    m = min(len(x), len(bus) - i)
    bus[i:i + m] += x[:m] * gain


def main(keluar):
    with open(os.path.join(DIR, "lines.json"), encoding="utf-8") as f:
        lines = [l for l in json.load(f) if l["scene"] == "s1"]
    suara = {l["id"]: baca_wav(os.path.join(DIR, "audio", f"line_{l['id']:03d}.wav")) for l in lines}

    # susun waktu mulai tiap kalimat
    t = 1.2
    mulai = {}
    tunggu_akhir = None
    for k, l in enumerate(lines):
        if k:
            t += NS.jeda_giliran(lines[k - 1], l)
        if l["display"] == "Kita ulang. Dari dermaga.":
            t += 1.55                    # bunyi waktu diulang + dermaga muncul
        if l["display"].startswith("Di pesisir barat Aceh"):
            t += 0.6                     # jeda adegan
        if l["display"].startswith("Yuk, berlayar"):
            t += 1.8                     # kartu judul jatuh
        mulai[l["id"]] = t
        t += len(suara[l["id"]]) / SR
        if l["display"] == "Tunggu.":
            tunggu_akhir = t
    total = t + 2.0
    n = int(total * SR)
    vokal = np.zeros(n, dtype=np.float32)
    for i, x in suara.items():
        tempel(vokal, x, mulai[i])

    # suasana: badai sampai "Tunggu." lalu senyap, dermaga pagi sesudahnya
    id_tunggu = next(l["id"] for l in lines if l["display"] == "Tunggu.")
    t_tunggu = mulai[id_tunggu]
    suasana = [(0, 0.95, 0.8), (t_tunggu, 0.95, 0.8), (t_tunggu + 0.12, 0.0, 0.0),
               (tunggu_akhir + 1.3, 0.0, 0.0), (tunggu_akhir + 2.2, 0.25, 0.0), (total, 0.25, 0.0)]
    sfx6.SR = SR
    amb = sfx6.ambience(total, suasana)[:n].astype(np.float32)
    # matikan seluruh suasana sejenak saat waktu membeku
    t_arr = np.arange(n) / SR
    beku = np.clip(1 - (t_arr - t_tunggu) / 0.12, 0, 1)
    pulih = np.clip((t_arr - (tunggu_akhir + 1.2)) / 1.0, 0, 1)
    amb *= np.where(t_arr < t_tunggu, 1.0, np.maximum(beku, pulih))
    efek = np.zeros(n, dtype=np.float32)
    tempel(efek, sfx6.b_guruh(), 0.15, 0.55)
    tempel(efek, sfx6.b_guruh(), mulai[lines[2]["id"]] - 0.4, 0.35)
    tempel(efek, b_rewind(), tunggu_akhir + 0.15, 0.9)
    for dt in (0.9, 2.6, 7.8, 15.5):
        tempel(efek, b_camar(), tunggu_akhir + 1.6 + dt, 0.55)
    id_yuk = next(l["id"] for l in lines if l["display"].startswith("Yuk, berlayar"))
    tempel(efek, sfx6.b_kertas(), mulai[id_yuk] - 1.75, 0.5)
    tempel(efek, sfx6.b_stempel(), mulai[id_yuk] - 0.45, 0.5)

    # merunduk: suasana turun 6 dB di bawah suara
    w = int(0.25 * SR)
    c = np.concatenate([[0.0], np.cumsum((np.abs(vokal) > 0.01).astype(np.float64))])
    i = np.arange(n)
    selubung = (c[np.clip(i + w // 2, 0, n)] - c[np.clip(i - w // 2, 0, n)]) / w   # rerata bergerak 0,25 dtk
    duck = 1 - 0.5 * np.clip(selubung * 3, 0, 1)
    campur = vokal + amb * duck * 1.0 + efek * 0.8
    campur *= 0.9 / (np.abs(campur).max() or 1)
    raw = (campur * 32767).astype(np.int16).tobytes()
    subprocess.run([FFMPEG, "-v", "error", "-y", "-f", "s16le", "-ar", str(SR), "-ac", "1", "-i", "pipe:0",
                    "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", str(SR), "-ac", "2", "-b:a", "192k",
                    "-metadata", "title=Contoh suara v7 - Pembuka (Berlayar dengan Peta Risiko)",
                    "-metadata", "artist=Inspektorat Kabupaten Aceh Barat", keluar], input=raw, check=True)
    print(f"{keluar}  {total:.1f} dtk")
    for l in lines:
        print(f"  {mulai[l['id']]:6.2f}  {NS.TOKOH[l['tokoh']]['nama']:<15} {l['rasa']:<9} {l['display']}")


if __name__ == "__main__":
    main(sys.argv[1])
