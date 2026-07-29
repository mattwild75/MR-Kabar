"""
Hitung timeline NYATA video dari durasi audio narasi sungguhan (bukan
estimasi manual di lines.json) -- setiap baris disambung berurutan dgn jeda
0.4 detik antar-kalimat (jeda natural bicara), lalu tulis:
1. timeline.json -- start/end detik tiap baris, dipakai skrip animasi & subtitle
2. narration_full.mp3 -- satu file gabungan seluruh narasi berurutan
3. subtitle.srt -- regenerasi presisi dari timeline nyata
"""
import json
import os
import subprocess

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
LINES_PATH = os.path.join(SCRIPT_DIR, "lines.json")
AUDIO_DIR = os.path.join(SCRIPT_DIR, "audio")
GAP_SECONDS = 0.4

FFPROBE = "ffprobe"


def get_duration(path):
    result = subprocess.run(
        [FFPROBE, "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
        capture_output=True, text=True, check=True,
    )
    return float(result.stdout.strip())


def format_srt_time(seconds):
    ms = int(round(seconds * 1000))
    h = ms // 3600000
    ms %= 3600000
    m = ms // 60000
    ms %= 60000
    s = ms // 1000
    ms %= 1000
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def main():
    with open(LINES_PATH, "r", encoding="utf-8") as f:
        lines = json.load(f)

    timeline = []
    cursor = 0.0
    for line in lines:
        audio_path = os.path.join(AUDIO_DIR, f"line_{line['id']:02d}.mp3")
        duration = get_duration(audio_path)
        entry = {
            "id": line["id"],
            "voice": line["voice"],
            "text": line["text"],
            "display": line.get("display", line["text"]),
            "start": round(cursor, 3),
            "end": round(cursor + duration, 3),
            "duration": round(duration, 3),
            "audio_file": f"line_{line['id']:02d}.mp3",
        }
        timeline.append(entry)
        cursor += duration + GAP_SECONDS

    total_duration = cursor - GAP_SECONDS

    timeline_path = os.path.join(SCRIPT_DIR, "timeline.json")
    with open(timeline_path, "w", encoding="utf-8") as f:
        json.dump({"total_duration": round(total_duration, 3), "lines": timeline}, f, indent=2, ensure_ascii=False)
    print(f"timeline.json ditulis -- total durasi narasi: {total_duration:.1f} detik ({total_duration/60:.2f} menit)")

    # Tulis subtitle .srt presisi
    srt_path = os.path.join(SCRIPT_DIR, "subtitle.srt")
    with open(srt_path, "w", encoding="utf-8") as f:
        for i, entry in enumerate(timeline, start=1):
            f.write(f"{i}\n")
            f.write(f"{format_srt_time(entry['start'])} --> {format_srt_time(entry['end'])}\n")
            f.write(f"{entry['display']}\n\n")
    print(f"subtitle.srt ditulis ulang ({len(timeline)} baris, presisi dari durasi audio asli)")

    # Gabung semua audio jadi satu track narasi utuh (dgn silence gap di antaranya)
    concat_list_path = os.path.join(SCRIPT_DIR, "_concat_list.txt")
    silence_path = os.path.join(SCRIPT_DIR, "_silence_gap.mp3")
    subprocess.run(
        ["ffmpeg", "-y", "-f", "lavfi", "-i", f"anullsrc=r=24000:cl=mono", "-t", str(GAP_SECONDS), "-q:a", "9", silence_path],
        check=True, capture_output=True,
    )
    with open(concat_list_path, "w", encoding="utf-8") as f:
        for i, entry in enumerate(timeline):
            audio_full_path = os.path.join(AUDIO_DIR, entry["audio_file"]).replace("\\", "/")
            f.write(f"file '{audio_full_path}'\n")
            if i < len(timeline) - 1:
                f.write(f"file '{silence_path.replace(chr(92), '/')}'\n")

    narration_out = os.path.join(SCRIPT_DIR, "narration_full.mp3")
    subprocess.run(
        ["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", concat_list_path, "-c:a", "libmp3lame", "-q:a", "2", narration_out],
        check=True, capture_output=True,
    )
    print(f"narration_full.mp3 ditulis -- {narration_out}")

    os.remove(concat_list_path)
    os.remove(silence_path)


if __name__ == "__main__":
    main()
