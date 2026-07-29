"""
Generate narasi per-baris via edge-tts (Microsoft Edge Neural TTS).

Catatan penting soal pelafalan: edge-tts MENG-ESCAPE seluruh input jadi XML
(lihat communicate.py -> escape(remove_incompatible_characters(text))), jadi
tag SSML <phoneme> MUSTAHIL dipakai. Satu-satunya jalan mengatur pelafalan
kata asing adalah respelling fonetik pada field "text", sementara field
"display" menyimpan ejaan benar untuk subtitle.
"""
import asyncio
import json
import os
import ssl

import certifi

# edge-tts pakai aiohttp; di Windows bundle CA-nya perlu ditunjuk eksplisit
os.environ.setdefault("SSL_CERT_FILE", certifi.where())
ssl._create_default_https_context = ssl.create_default_context

import edge_tts  # noqa: E402  (harus setelah SSL_CERT_FILE di-set)

VOICE_MAP = {
    "ardi": "id-ID-ArdiNeural",
    "gadis": "id-ID-GadisNeural",
}

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
LINES_PATH = os.path.join(SCRIPT_DIR, "lines.json")
AUDIO_DIR = os.path.join(SCRIPT_DIR, "audio")

MAX_RETRY = 4


async def generate_line(line):
    voice = VOICE_MAP[line["voice"]]
    out_path = os.path.join(AUDIO_DIR, f"line_{line['id']:03d}.mp3")
    for attempt in range(1, MAX_RETRY + 1):
        try:
            # +7%: terdengar lebih energik (permintaan "fun, energik") dan
            # memangkas ~1.5 menit durasi total tanpa mengorbankan kejelasan.
            communicate = edge_tts.Communicate(line["text"], voice, rate="+7%")
            await communicate.save(out_path)
            if os.path.getsize(out_path) > 1000:
                print(f"OK line_{line['id']:03d}.mp3 ({line['voice']})", flush=True)
                return
            raise RuntimeError("file kosong")
        except Exception as exc:  # noqa: BLE001
            if attempt == MAX_RETRY:
                raise
            print(f"  retry {attempt} line {line['id']}: {exc}", flush=True)
            await asyncio.sleep(2 * attempt)


async def main():
    os.makedirs(AUDIO_DIR, exist_ok=True)
    with open(LINES_PATH, "r", encoding="utf-8") as f:
        lines = json.load(f)

    for line in lines:
        await generate_line(line)
    print(f"SELESAI: {len(lines)} baris narasi", flush=True)


if __name__ == "__main__":
    asyncio.run(main())
