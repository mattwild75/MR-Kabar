"""
Mixing final: narration_full.mp3 (sudah presisi timeline) + music_bg.wav
(diredam/duck volume-nya, -22dB relatif thd narasi) + SFX kontekstual
(ditempel di titik waktu tertentu dari sfx_cues.json, volume sedang -12dB
supaya terasa tapi tidak mendominasi narasi).
"""
import json
import os
import subprocess

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

SFX_FILES = {
    "alert": "sfx_alert.wav",
    "warning": "sfx_warning.wav",
    "success": "sfx_success.wav",
    "click": "sfx_click.wav",
    "pageturn": "sfx_pageturn.wav",
    "whoosh": "sfx_whoosh.wav",
}


def main():
    with open(os.path.join(SCRIPT_DIR, "sfx_cues.json"), "r", encoding="utf-8") as f:
        cues = json.load(f)

    narration = os.path.join(SCRIPT_DIR, "narration_full.mp3")
    music = os.path.join(SCRIPT_DIR, "music_bg.wav")
    out_path = os.path.join(SCRIPT_DIR, "audio_final.mp3")

    # Susun input ffmpeg: 0=narration, 1=music, 2..=tiap SFX cue
    inputs = ["-i", narration, "-i", music]
    filter_parts = []

    # Narasi tetap volume penuh (0dB)
    filter_parts.append("[0:a]volume=1.0[narr]")
    # Musik dinaikkan lagi ke ~-5dB relatif (dari 0.35/-9dB) -- user masih
    # melapor musik kurang besar setelah dua kali kenaikan sebelumnya
    # (0.08 -> 0.22 -> 0.35). Riwayat lengkap: gain awal 0.08/-22dB nyaris
    # tak terdengar; 0.22/-13dB masih kurang; root cause frekuensi (chord
    # di 87-247Hz ter-mask suara narator) sudah diperbaiki terpisah dgn
    # menaikkan chord 1 oktaf ke C4-B4 (~262-494Hz) di
    # generate_audio_assets.py -- sekarang gain dinaikkan lebih agresif
    # lagi krn perbaikan frekuensi practically belum cukup dirasakan user.
    filter_parts.append("[1:a]volume=0.55[music]")

    mix_inputs = ["[narr]", "[music]"]

    for i, cue in enumerate(cues):
        sfx_path = os.path.join(SCRIPT_DIR, SFX_FILES[cue["sfx"]])
        inputs += ["-i", sfx_path]
        idx = i + 2
        delay_ms = int(cue["at"] * 1000)
        label = f"sfx{i}"
        filter_parts.append(f"[{idx}:a]volume=0.55,adelay={delay_ms}|{delay_ms}[{label}]")
        mix_inputs.append(f"[{label}]")

    n_inputs = len(mix_inputs)
    filter_parts.append(f"{''.join(mix_inputs)}amix=inputs={n_inputs}:duration=first:dropout_transition=0[mixed]")
    filter_complex = ";".join(filter_parts)

    cmd = [
        "ffmpeg", "-y",
        *inputs,
        "-filter_complex", filter_complex,
        "-map", "[mixed]",
        "-c:a", "libmp3lame", "-q:a", "2",
        out_path,
    ]
    subprocess.run(cmd, check=True)
    print(f"Mixing selesai: {out_path}")


if __name__ == "__main__":
    main()
