"""
Suara v7: edge-tts per POTONGAN kalimat, lalu dirakit menjadi satu WAV per
kalimat dengan rasa, jeda, dan tekanan kata.

Satu kalimat naskah dipotong pada markah // dan /// (antarkalimat, jedanya
diatur sendiri). Di dalam potongan, prosodi asli edge-tts dibiarkan utuh:
  /       -> jeda napas disisipkan di batas kata (titik paling senyap di
             sekitar batas WordBoundary, supaya tidak terdengar terpotong)
  *kata*  -> jeda mikro sebelum kata + kata itu dikeraskan sedikit
Rasa (naskah.RASA) menggeser tempo, nada, dan kekerasan suara dasar tokoh.
Olah suara tokoh: radio (Petugas Patroli), ruang (Penjaga Mercusuar),
badai (Si Badai).

    python suara.py            -> audio/line_NNN.wav + audio/durasi.json (semua kalimat)
    python suara.py s1         -> hanya babak s1
"""
import asyncio
import io
import json
import os
import re
import ssl
import subprocess
import sys

import certifi
import numpy as np

os.environ.setdefault("SSL_CERT_FILE", certifi.where())
ssl._create_default_https_context = ssl.create_default_context

import edge_tts  # noqa: E402
import edge_tts.communicate  # noqa: E402

# Antivirus memindai TLS dengan akar sertifikatnya sendiri; mode X.509 strict
# OpenSSL Python 3.13+ menolaknya (sama dengan v6 dan film tes).
_ctx = ssl.create_default_context(cafile=certifi.where())
_ctx.load_default_certs()
_ctx.verify_flags &= ~ssl.VERIFY_X509_STRICT
edge_tts.communicate._SSL_CTX = _ctx

import naskah as NS  # noqa: E402

DIR = os.path.dirname(os.path.abspath(__file__))
AUDIO = os.path.join(DIR, "audio")
SR = 24000
FFMPEG = ("C:/Users/Nurhikmat Muhammad/AppData/Local/Microsoft/WinGet/Packages/"
          "Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1.2-full_build/bin/ffmpeg.exe")

JEDA_ANTAR = {"//": 0.60, "///": 1.10}
JEDA_NAPAS = 0.20
JEDA_TEKAN = 0.11
GAIN_TEKAN_DB = 2.5

OLAH = {
    # band radio + sedikit distorsi
    "radio": "highpass=f=320,lowpass=f=3300,acompressor=threshold=0.2:ratio=4:attack=5:release=60,volume=1.6",
    # gema ruang menara
    "ruang": "aecho=0.85:0.55:38|61:0.22|0.12",
    # berat, bergemuruh, bergema
    "badai": "lowpass=f=5200,aecho=0.8:0.6:70|130:0.3|0.18,bass=g=5:f=110",
}


def mp3_ke_np(data: bytes) -> np.ndarray:
    p = subprocess.run([FFMPEG, "-v", "error", "-i", "pipe:0", "-f", "s16le", "-ac", "1", "-ar", str(SR), "pipe:1"],
                       input=data, capture_output=True, check=True)
    return np.frombuffer(p.stdout, dtype=np.int16).astype(np.float32) / 32768.0


def olah(x: np.ndarray, filt: str) -> np.ndarray:
    raw = (np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes()
    p = subprocess.run([FFMPEG, "-v", "error", "-f", "s16le", "-ar", str(SR), "-ac", "1", "-i", "pipe:0",
                        "-af", filt, "-f", "s16le", "-ac", "1", "-ar", str(SR), "pipe:1"],
                       input=raw, capture_output=True, check=True)
    return np.frombuffer(p.stdout, dtype=np.int16).astype(np.float32) / 32768.0


def tulis_wav(path: str, x: np.ndarray):
    raw = (np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes()
    subprocess.run([FFMPEG, "-v", "error", "-y", "-f", "s16le", "-ar", str(SR), "-ac", "1", "-i", "pipe:0", path],
                   input=raw, check=True)


def potong_kalimat(markah: str):
    """-> [(potongan, jeda_sesudah_detik)] dipotong di // dan ///."""
    bag = re.split(r"\s*(///|//)\s*", markah.strip())
    out = []
    for i in range(0, len(bag), 2):
        teks = bag[i].strip()
        jeda = JEDA_ANTAR.get(bag[i + 1], 0) if i + 1 < len(bag) else 0
        if teks:
            out.append((teks, jeda))
    return out


def rencana_potongan(teks: str):
    """Teks potongan bermarkah -> (teks bersih utk TTS, indeks kata yang
    didahului jeda napas, indeks kata pembuka tekanan (diberi jeda mikro),
    indeks semua kata bertekanan (dikeraskan))."""
    napas, tekan_awal, tekan, kata = set(), set(), set(), []
    berikut_napas, dalam = False, False
    for tok in teks.split():
        if tok == "/":
            berikut_napas = True
            continue
        if berikut_napas:
            napas.add(len(kata))
            berikut_napas = False
        if tok.startswith("*"):
            dalam = True
            tekan_awal.add(len(kata))
        if dalam:
            tekan.add(len(kata))
        if tok.rstrip(".,!?:;").endswith("*"):
            dalam = False
        kata.append(tok.replace("*", ""))
    return " ".join(kata), napas, tekan_awal, tekan


async def tts(teks: str, suara: str, tempo: int, nada: int, keras: int):
    com = edge_tts.Communicate(NS.ke_tts(teks), suara, rate=f"{tempo:+d}%", pitch=f"{nada:+d}Hz",
                               volume=f"{keras:+d}%", boundary="WordBoundary")
    audio = bytearray()
    batas = []
    async for ch in com.stream():
        if ch["type"] == "audio":
            audio += ch["data"]
        elif ch["type"] == "WordBoundary":
            batas.append({"t": ch["offset"] / 1e7, "d": ch["duration"] / 1e7, "w": ch["text"]})
    if len(audio) < 1000:
        raise RuntimeError("audio kosong")
    return bytes(audio), batas


VERSI = 2            # naikkan bila cara merakit suara berubah (membatalkan simpanan)
SENYAP_MAKS = 0.30   # senyap bawaan edge-tts (sesudah titik/koma) dipadatkan ke batas ini


def padatkan_senyap(x: np.ndarray):
    """edge-tts memberi jeda 0,4-0,7 dtk sesudah titik dan koma; terlalu
    lamban untuk percakapan. Senyap yang lebih panjang dari SENYAP_MAKS
    dipotong bagian tengahnya (ujung-ujungnya tetap, jadi tidak ada klik).
    Jeda yang SENGAJA ditulis di naskah disisipkan sesudah ini, tidak ikut.
    -> (audio, peta): peta[i] = indeks keluaran untuk sampel masukan i."""
    if len(x) == 0:
        return x, np.zeros(0, dtype=np.int64)
    w = int(0.02 * SR)
    c = np.concatenate([[0.0], np.cumsum(x.astype(np.float64) ** 2)])
    i = np.arange(len(x))
    e = (c[np.clip(i + w // 2, 0, len(x))] - c[np.clip(i - w // 2, 0, len(x))]) / w
    senyap = (e < 0.006 ** 2).astype(np.int8)
    d = np.diff(np.concatenate([[0], senyap, [0]]))
    simpan = np.ones(len(x), dtype=bool)
    sisa = int(SENYAP_MAKS / 2 * SR)
    for j, k in zip(np.where(d == 1)[0], np.where(d == -1)[0]):
        # hanya senyap DI DALAM potongan; ujung awal/akhir dirapikan di tempat lain
        if j > 0 and k < len(x) and (k - j) / SR > SENYAP_MAKS:
            simpan[j + sisa:k - sisa] = False
    return x[simpan], np.maximum(np.cumsum(simpan) - 1, 0)


def titik_senyap(x: np.ndarray, t: float, lebar: float = 0.035) -> int:
    """Sampel paling senyap di sekitar t (energi jendela 5 ms)."""
    a, b = max(0, int((t - lebar) * SR)), min(len(x), int((t + lebar) * SR))
    if b - a < 240:
        return int(t * SR)
    w = 120
    e = np.convolve(x[a:b] ** 2, np.ones(w) / w, mode="same")
    return a + int(np.argmin(e))


def petakan_kata(kata_naskah, batas):
    """Kata naskah (sesudah respell, bisa beda jumlah) -> indeks WordBoundary.
    edge-tts memecah 'Em-Er Kabar' dsb.; dipetakan berurutan lewat huruf."""
    def norm(s):
        return re.sub(r"[^a-z0-9]", "", s.lower())
    peta = []
    j = 0
    for k in kata_naskah:
        target = norm(NS.ke_tts(k))
        if not target:
            peta.append(min(j, len(batas) - 1))
            continue
        mulai = j
        acc = ""
        while j < len(batas) and len(acc) < len(target):
            acc += norm(batas[j]["w"])
            j += 1
        peta.append(min(mulai, len(batas) - 1))
    return peta


async def satu_kalimat(baris):
    t = NS.TOKOH[baris["tokoh"]]
    r = NS.RASA[baris["rasa"]]
    tempo, nada, keras = t["tempo"] + r["tempo"], t["nada"] + r["nada"], r["keras"]
    potong = []
    kata_keluar = []          # waktu tiap kata (ejaan TTS) di audio akhir, untuk gerak mulut
    offset = 0                # sampel keluaran sebelum potongan ini
    for teks, jeda_sesudah in potong_kalimat(baris["markah"]):
        bersih, napas, tekan_awal, tekan = rencana_potongan(teks)
        for coba in range(1, 6):
            try:
                mp3, batas = await tts(bersih, t["suara"], tempo, nada, keras)
                break
            except Exception as e:  # noqa: BLE001
                if coba == 5:
                    raise
                print(f"  ulang {coba} kalimat {baris['id']}: {e}", flush=True)
                await asyncio.sleep(2 * coba)
        x = mp3_ke_np(mp3)
        kata = bersih.split()
        peta = petakan_kata(kata, batas) if batas else []
        # sisipan jeda (napas & sebelum kata bertekanan) + penguatan kata
        sisip = {}
        for i in sorted(napas | tekan_awal):
            if i == 0 or not peta:
                continue
            b = batas[peta[i]]
            n = titik_senyap(x, b["t"])
            sisip[n] = max(sisip.get(n, 0), (JEDA_NAPAS if i in napas else 0) + (JEDA_TEKAN if i in tekan_awal else 0))
        g = 10 ** (GAIN_TEKAN_DB / 20)
        for i in tekan:
            if not peta:
                break
            b = batas[peta[i]]
            akhir = b["t"] + b["d"]
            a, z = int(b["t"] * SR), min(len(x), int((akhir + 0.04) * SR))
            if z - a > 480:
                env = np.ones(z - a)
                f = min(360, (z - a) // 4)
                env[:f] = np.linspace(0, 1, f)
                env[-f:] = np.linspace(1, 0, f)
                x[a:z] *= 1 + (g - 1) * env
        bagian, awal, keluar_n = [], 0, 0
        peta_x = np.zeros(len(x), dtype=np.int64)
        for n in [*sorted(k for k in sisip if 0 < k < len(x)), len(x)]:
            yb, pb = padatkan_senyap(x[awal:n])
            peta_x[awal:n] = keluar_n + pb
            bagian.append(yb)
            keluar_n += len(yb)
            if n < len(x):
                z = np.zeros(int(sisip[n] * SR * r["jeda"]), dtype=np.float32)
                bagian.append(z)
                keluar_n += len(z)
            awal = n
        y = np.concatenate(bagian)
        for b in batas:
            i0 = min(int(b["t"] * SR), len(x) - 1)
            i1 = min(int((b["t"] + b["d"]) * SR), len(x) - 1)
            kata_keluar.append({"t": (offset + peta_x[i0]) / SR, "d": max(0.04, (peta_x[i1] - peta_x[i0]) / SR), "w": b["w"]})
        potong.append(y)
        offset += len(y)
        if jeda_sesudah:
            z = np.zeros(int(jeda_sesudah * r["jeda"] * SR), dtype=np.float32)
            potong.append(z)
            offset += len(z)
    y = np.concatenate(potong)
    if t["olah"]:
        y = olah(y, OLAH[t["olah"]])
    # rapikan senyap di ujung (edge-tts menyisakan ±0,1 dtk)
    nz = np.where(np.abs(y) > 0.004)[0]
    if len(nz):
        s0 = max(0, nz[0] - int(0.03 * SR))
        y = y[s0: nz[-1] + int(0.08 * SR)]
        for k in kata_keluar:
            k["t"] = max(0.0, k["t"] - s0 / SR)
    for k in kata_keluar:
        k["t"], k["d"] = round(k["t"], 3), round(k["d"], 3)
    # samakan kekerasan antartokoh lewat RMS bagian bersuara (±-20 dBFS),
    # rasa "keras" tetap terasa karena diterapkan sebelum ini di edge-tts
    bersuara = y[np.abs(y) > 0.02]
    if len(bersuara):
        gain_db = 2 * 20 * np.log10(1 + keras / 100)   # rasa keras/lembut, dua kali lipat agar terasa
        y = y * (0.1 / np.sqrt(np.mean(bersuara ** 2))) * 10 ** (gain_db / 20)
    # pembatas lunak puncak
    a = np.abs(y)
    lewat = a > 0.8
    y[lewat] = np.sign(y[lewat]) * (0.8 + 0.15 * np.tanh((a[lewat] - 0.8) / 0.15))
    return y, kata_keluar


async def main(saring=None):
    os.makedirs(AUDIO, exist_ok=True)
    NS.main()
    with open(os.path.join(DIR, "lines.json"), encoding="utf-8") as f:
        lines = json.load(f)
    if saring:
        lines = [l for l in lines if l["scene"] in saring]
    dur_path = os.path.join(AUDIO, "durasi.json")
    durasi = json.load(open(dur_path, encoding="utf-8")) if os.path.exists(dur_path) else {}
    sem = asyncio.Semaphore(4)

    async def kerja(l):
        wav = os.path.join(AUDIO, f"line_{l['id']:03d}.wav")
        kata_json = os.path.join(AUDIO, f"line_{l['id']:03d}.words.json")
        kunci = json.dumps([VERSI, NS.TOKOH[l['tokoh']], NS.RASA[l['rasa']], l['markah']], ensure_ascii=False)
        if durasi.get(str(l["id"]), {}).get("kunci") == kunci and os.path.exists(wav) and os.path.exists(kata_json):
            return
        async with sem:
            y, kata = await satu_kalimat(l)
        tulis_wav(wav, y)
        with open(kata_json, "w", encoding="utf-8") as f:
            json.dump(kata, f, ensure_ascii=False)
        durasi[str(l["id"])] = {"kunci": kunci, "scene": l["scene"], "detik": round(len(y) / SR, 3)}
        print(f"OK {l['id']:03d} {l['tokoh']:<10} {l['rasa']:<9} {len(y) / SR:5.2f} dtk", flush=True)

    await asyncio.gather(*(kerja(l) for l in lines))
    with open(dur_path, "w", encoding="utf-8") as f:
        json.dump(durasi, f, ensure_ascii=False, indent=1)
    tot = sum(v["detik"] for v in durasi.values())
    print(f"{len(durasi)} kalimat, bicara {tot / 60:.1f} menit")


if __name__ == "__main__":
    asyncio.run(main(sys.argv[1:] or None))
