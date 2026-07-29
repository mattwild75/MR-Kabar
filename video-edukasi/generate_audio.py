import asyncio
import json
import os
import sys

import edge_tts

VOICE_MAP = {
    "ardi": "id-ID-ArdiNeural",
    "gadis": "id-ID-GadisNeural",
}

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
LINES_PATH = os.path.join(SCRIPT_DIR, "lines.json")
AUDIO_DIR = os.path.join(SCRIPT_DIR, "audio")


async def generate_line(line):
    voice = VOICE_MAP[line["voice"]]
    out_path = os.path.join(AUDIO_DIR, f"line_{line['id']:02d}.mp3")
    communicate = edge_tts.Communicate(line["text"], voice, rate="+0%")
    await communicate.save(out_path)
    print(f"OK line_{line['id']:02d}.mp3 ({line['voice']})")


async def main():
    os.makedirs(AUDIO_DIR, exist_ok=True)
    with open(LINES_PATH, "r", encoding="utf-8") as f:
        lines = json.load(f)

    for line in lines:
        await generate_line(line)


if __name__ == "__main__":
    asyncio.run(main())
