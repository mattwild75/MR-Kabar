"""
Narasi per kalimat via edge-tts, BESERTA waktu tiap kata (WordBoundary).

Waktu kata dipakai koreografi: tipografi kinetik muncul tepat saat katanya
diucapkan (mis. "kemungkinan", "mengancam", "tujuan"), bukan ditebak dari
awal kalimat.

Tempo v6 sengaja lebih lambat dari v5 (+7%): gaya bertutur dokumenter butuh
ruang bernapas. Ardi sedikit direndahkan nadanya sebagai pembawa cerita.

    python generate_audio.py   -> audio/line_NNN.mp3 + audio/line_NNN.words.json
"""
import asyncio
import json
import os
import ssl

import certifi

os.environ.setdefault("SSL_CERT_FILE", certifi.where())
ssl._create_default_https_context = ssl.create_default_context

import edge_tts  # noqa: E402
import edge_tts.communicate  # noqa: E402

# Antivirus di laptop pembuat (Avast Web Shield) memindai TLS dengan akar
# sertifikatnya sendiri; OpenSSL Python 3.13+ menolaknya dalam mode X.509
# strict. Pakai penyimpanan Windows + certifi, matikan HANYA mode strict.
_ctx = ssl.create_default_context(cafile=certifi.where())
_ctx.load_default_certs()
_ctx.verify_flags &= ~ssl.VERIFY_X509_STRICT
edge_tts.communicate._SSL_CTX = _ctx

SUARA = {
    "ardi": ("id-ID-ArdiNeural", "+5%", "-2Hz"),
    "gadis": ("id-ID-GadisNeural", "+6%", "+0Hz"),
}

DIR = os.path.dirname(os.path.abspath(__file__))
AUDIO = os.path.join(DIR, "audio")


async def satu(line):
    mp3 = os.path.join(AUDIO, f"line_{line['id']:03d}.mp3")
    kata = os.path.join(AUDIO, f"line_{line['id']:03d}.words.json")
    if os.path.exists(mp3) and os.path.getsize(mp3) > 1000 and os.path.exists(kata):
        return
    suara, tempo, nada = SUARA[line["voice"]]
    for coba in range(1, 5):
        try:
            com = edge_tts.Communicate(line["text"], suara, rate=tempo, pitch=nada, boundary="WordBoundary")
            audio = bytearray()
            batas = []
            async for ch in com.stream():
                if ch["type"] == "audio":
                    audio += ch["data"]
                elif ch["type"] == "WordBoundary":
                    batas.append({"t": ch["offset"] / 1e7, "d": ch["duration"] / 1e7, "w": ch["text"]})
            if len(audio) < 1000:
                raise RuntimeError("audio kosong")
            with open(mp3, "wb") as f:
                f.write(audio)
            with open(kata, "w", encoding="utf-8") as f:
                json.dump(batas, f, ensure_ascii=False)
            print(f"OK {line['id']:03d} {line['voice']} {len(batas)} kata", flush=True)
            return
        except Exception as e:  # noqa: BLE001
            if coba == 4:
                raise
            print(f"  ulang {coba} kalimat {line['id']}: {e}", flush=True)
            await asyncio.sleep(2 * coba)


async def main():
    os.makedirs(AUDIO, exist_ok=True)
    with open(os.path.join(DIR, "lines.json"), encoding="utf-8") as f:
        lines = json.load(f)
    for l in lines:
        await satu(l)
    print(f"SELESAI {len(lines)} kalimat")


if __name__ == "__main__":
    asyncio.run(main())
