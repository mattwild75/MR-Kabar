"""
Mixing akhir v6: narasi + musik + SFX.

Sama prinsipnya dengan video edukasi sebelumnya (lihat ../fraud/mix_audio.py):
musik dimainkan penuh lalu otomatis TURUN selama narator bicara (sidechain
ducking), naik lagi di sela kalimat dan di kartu babak. Gain dasar sengaja
SAMA dengan BASE di resources/js/components/edu-video-player.tsx (narasi 1.0,
musik 1.15, SFX 0.62), supaya pemutar di aplikasi — yang memutar ketiga
stem berdampingan — terdengar identik dengan berkas MP4 unduhan.

Keluaran:
  audio_final.mp3                     campuran untuk MP4
  stem-narration.mp3 / stem-music.mp3 / stem-sfx.mp3   untuk pemutar web
"""
import os
import subprocess

DIR = os.path.dirname(os.path.abspath(__file__))
NARASI = os.path.join(DIR, "narration_full.wav")
MUSIK = os.path.join(DIR, "music_bg.wav")
SFX = os.path.join(DIR, "sfx_bus.wav")

G_NARASI, G_MUSIK, G_SFX = 1.00, 1.15, 0.62
DUCK = "threshold=0.05:ratio=10:attack=15:release=320:makeup=1:knee=6"


def run(a):
    subprocess.run(a, check=True, capture_output=True)


def main():
    musik_duck = os.path.join(DIR, "stem-music.mp3")
    run(["ffmpeg", "-y", "-i", MUSIK, "-i", NARASI, "-filter_complex",
         "[0:a]aresample=44100[m];[1:a]aresample=44100,aformat=channel_layouts=mono,apad[k];"
         f"[m][k]sidechaincompress={DUCK}[out]",
         "-map", "[out]", "-t", "10000", "-ac", "2", "-c:a", "libmp3lame", "-q:a", "3", musik_duck])
    # Narasi: kerasnya disamakan dengan stem narasi video sebelumnya (~-18 LUFS)
    run(["ffmpeg", "-y", "-i", NARASI, "-af", "loudnorm=I=-18:LRA=7:TP=-2", "-ar", "44100", "-ac", "1",
         "-c:a", "libmp3lame", "-q:a", "3", os.path.join(DIR, "stem-narration.mp3")])
    run(["ffmpeg", "-y", "-i", SFX, "-ar", "44100", "-ac", "1", "-c:a", "libmp3lame", "-q:a", "3",
         os.path.join(DIR, "stem-sfx.mp3")])
    run(["ffmpeg", "-y", "-i", os.path.join(DIR, "stem-narration.mp3"), "-i", musik_duck,
         "-i", os.path.join(DIR, "stem-sfx.mp3"), "-filter_complex",
         f"[0:a]volume={G_NARASI}[n];[1:a]volume={G_MUSIK}[m];[2:a]volume={G_SFX}[s];"
         "[n][m][s]amix=inputs=3:duration=longest:normalize=0[mix];"
         "[mix]volume=3dB,alimiter=limit=0.95:level=disabled,aresample=44100[out]",
         "-map", "[out]", "-c:a", "libmp3lame", "-q:a", "2", os.path.join(DIR, "audio_final.mp3")])
    print("audio_final.mp3 + stem-*.mp3 ditulis")


if __name__ == "__main__":
    main()
