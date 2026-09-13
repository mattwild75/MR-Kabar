"""
Hitung timeline NYATA dari durasi audio narasi sungguhan (bukan estimasi),
lalu tulis:
  1. timeline.json  -- start/end tiap baris + batas tiap scene (dipakai
                       animasi DAN generator musik, supaya keduanya tidak
                       pernah bisa melenceng dari narasi)
  2. subtitle.srt   -- presisi, memakai field `display` (ejaan benar), bukan
                       `text` (respelling fonetik utk TTS)
  3. narration_full.mp3 -- satu track narasi utuh

Jeda antar-kalimat dibedakan: jeda BIASA di dalam satu scene, dan jeda lebih
panjang saat berganti scene (memberi ruang napas + waktu transisi visual).
"""
import json
import os
import subprocess

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
LINES_PATH = os.path.join(SCRIPT_DIR, "lines.json")
AUDIO_DIR = os.path.join(SCRIPT_DIR, "audio")

GAP_SAME_SCENE = 0.34
GAP_NEW_SCENE = 0.90
LEAD_IN = 1.2      # detik hening di awal video sebelum kalimat pertama
TAIL = 3.0         # detik hening di akhir


def get_duration(path):
    result = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "csv=p=0", path],
        capture_output=True, text=True, check=True,
    )
    return float(result.stdout.strip())


def format_srt_time(seconds):
    ms = int(round(seconds * 1000))
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def main():
    with open(LINES_PATH, "r", encoding="utf-8") as f:
        lines = json.load(f)

    timeline = []
    gaps = []          # jeda SESUDAH baris ke-i (utk menyusun narasi gabungan)
    cursor = LEAD_IN
    prev_scene = None
    for i, line in enumerate(lines):
        audio_path = os.path.join(AUDIO_DIR, f"line_{line['id']:03d}.mp3")
        duration = get_duration(audio_path)
        timeline.append({
            "id": line["id"],
            "scene": line["scene"],
            "voice": line["voice"],
            "text": line["text"],
            "display": line.get("display", line["text"]),
            "start": round(cursor, 3),
            "end": round(cursor + duration, 3),
            "duration": round(duration, 3),
            "audio_file": f"line_{line['id']:03d}.mp3",
        })
        cursor += duration
        if i < len(lines) - 1:
            gap = GAP_NEW_SCENE if lines[i + 1]["scene"] != line["scene"] else GAP_SAME_SCENE
            gaps.append(gap)
            cursor += gap
        prev_scene = line["scene"]

    narration_end = cursor
    total_duration = narration_end + TAIL

    # Batas scene: dari awal jeda sebelum baris pertamanya s/d akhir baris
    # terakhirnya. Dihitung, TIDAK ditulis tangan -- inilah yang dulu bikin
    # dua scene bertumpuk penuh di v1.
    scenes = []
    for entry in timeline:
        if not scenes or scenes[-1]["id"] != entry["scene"]:
            scenes.append({"id": entry["scene"], "start": entry["start"], "end": entry["end"],
                           "lines": [entry["id"]]})
        else:
            scenes[-1]["end"] = entry["end"]
            scenes[-1]["lines"].append(entry["id"])
    for i, sc in enumerate(scenes):
        sc["start"] = round(0.0 if i == 0 else (scenes[i - 1]["end"] + GAP_NEW_SCENE * 0.45), 3)
        sc["end"] = round(sc["end"] + (TAIL if i == len(scenes) - 1 else GAP_NEW_SCENE * 0.55), 3)
        sc["duration"] = round(sc["end"] - sc["start"], 3)

    out = {
        "total_duration": round(total_duration, 3),
        "narration_end": round(narration_end, 3),
        "lead_in": LEAD_IN,
        "scenes": scenes,
        "lines": timeline,
    }
    with open(os.path.join(SCRIPT_DIR, "timeline.json"), "w", encoding="utf-8") as f:
        json.dump(out, f, indent=2, ensure_ascii=False)
    print(f"timeline.json: {total_duration:.1f} detik ({total_duration/60:.2f} menit), "
          f"{len(timeline)} baris, {len(scenes)} scene")

    with open(os.path.join(SCRIPT_DIR, "subtitle.srt"), "w", encoding="utf-8") as f:
        for i, entry in enumerate(timeline, start=1):
            f.write(f"{i}\n{format_srt_time(entry['start'])} --> {format_srt_time(entry['end'])}\n"
                    f"{entry['display']}\n\n")
    print(f"subtitle.srt: {len(timeline)} baris")

    # Gabung narasi: lead-in + tiap baris + silence sesuai gap-nya masing2
    def silence(seconds, path):
        subprocess.run(["ffmpeg", "-y", "-f", "lavfi", "-i", "anullsrc=r=24000:cl=mono",
                        "-t", f"{seconds:.3f}", "-q:a", "9", path],
                       check=True, capture_output=True)

    sil_paths = {}
    for seconds in {LEAD_IN, GAP_SAME_SCENE, GAP_NEW_SCENE, TAIL}:
        p = os.path.join(SCRIPT_DIR, f"_sil_{seconds:.2f}.mp3".replace(".", "_", 1))
        silence(seconds, p)
        sil_paths[seconds] = p

    concat_path = os.path.join(SCRIPT_DIR, "_concat.txt")
    with open(concat_path, "w", encoding="utf-8") as f:
        f.write(f"file '{sil_paths[LEAD_IN].replace(os.sep, '/')}'\n")
        for i, entry in enumerate(timeline):
            f.write(f"file '{os.path.join(AUDIO_DIR, entry['audio_file']).replace(os.sep, '/')}'\n")
            if i < len(gaps):
                f.write(f"file '{sil_paths[gaps[i]].replace(os.sep, '/')}'\n")
        f.write(f"file '{sil_paths[TAIL].replace(os.sep, '/')}'\n")

    subprocess.run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", concat_path,
                    "-c:a", "libmp3lame", "-q:a", "2",
                    os.path.join(SCRIPT_DIR, "narration_full.mp3")],
                   check=True, capture_output=True)
    print("narration_full.mp3 ditulis")

    os.remove(concat_path)
    for p in sil_paths.values():
        os.remove(p)


if __name__ == "__main__":
    main()
