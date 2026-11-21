"""
Campuran akhir v7: narasi + musik (merunduk di bawah suara) + efek & suasana.

Gain dasar SAMA dengan pemutar di aplikasi (edu-video-player: narasi 1.0,
musik 1.15, SFX 0.62) supaya stem yang diputar berdampingan terdengar sama
dengan MP4 unduhan.

    python mix_audio.py [mulai akhir]   -> audio_final.mp3 + stem-*.mp3
"""
import os
import subprocess
import sys

from suara import FFMPEG

DIR = os.path.dirname(os.path.abspath(__file__))
NARASI = os.path.join(DIR, "narasi_penuh.wav")
MUSIK = os.path.join(DIR, "musik_latar.wav")
SFX = os.path.join(DIR, "sfx_bus.wav")
G_NARASI, G_MUSIK, G_SFX = 1.00, 1.15, 0.62
DUCK = "threshold=0.05:ratio=10:attack=15:release=320:makeup=1:knee=6"


def run(a):
    subprocess.run([FFMPEG, "-y", "-v", "error", *a], check=True)


def main(potong=None):
    p = lambda n: os.path.join(DIR, n)  # noqa: E731
    run(["-i", MUSIK, "-i", NARASI, "-filter_complex",
         "[0:a]aresample=44100[m];[1:a]aresample=44100,aformat=channel_layouts=mono,apad[k];"
         f"[m][k]sidechaincompress={DUCK}[out]",
         "-map", "[out]", "-t", "10000", "-ac", "2", "-c:a", "libmp3lame", "-q:a", "3", p("stem-music.mp3")])
    run(["-i", NARASI, "-af", "loudnorm=I=-18:LRA=7:TP=-2", "-ar", "44100", "-ac", "1",
         "-c:a", "libmp3lame", "-q:a", "3", p("stem-narration.mp3")])
    run(["-i", SFX, "-ar", "44100", "-ac", "1", "-c:a", "libmp3lame", "-q:a", "3", p("stem-sfx.mp3")])
    akhir = ["-ss", str(potong[0]), "-to", str(potong[1])] if potong else []
    run(["-i", p("stem-narration.mp3"), "-i", p("stem-music.mp3"), "-i", p("stem-sfx.mp3"), "-filter_complex",
         f"[0:a]volume={G_NARASI}[n];[1:a]volume={G_MUSIK}[m];[2:a]volume={G_SFX}[s];"
         "[n][m][s]amix=inputs=3:duration=longest:normalize=0[mix];"
         "[mix]volume=3dB,alimiter=limit=0.95:level=disabled,aresample=44100,aformat=channel_layouts=stereo[out]",
         "-map", "[out]", *akhir, "-c:a", "libmp3lame", "-q:a", "2", p("audio_final.mp3")])
    print("audio_final.mp3 + stem-*.mp3 ditulis")


if __name__ == "__main__":
    main((float(sys.argv[1]), float(sys.argv[2])) if len(sys.argv) > 2 else None)
