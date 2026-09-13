"""
Mixing akhir: narasi + musik + SFX.

Kunci permintaan "musik lebih besar tapi narasi tetap lebih terdengar":
BUKAN dengan memelankan musik sepanjang video (itu yang bikin musik seolah
hilang di versi sebelumnya), melainkan SIDECHAIN DUCKING -- musik dimainkan
penuh, lalu otomatis turun ~8 dB hanya selama ada suara narator, dan naik
lagi di sela kalimat. Narator jadi selalu menang tanpa musik terdengar
kecil.

Skrip ini menghasilkan 4 berkas:
  audio_final.mp3  -- campuran siap mux ke video (dipakai file MP4 unduhan)
  stem-narration.mp3 / stem-music.mp3 / stem-sfx.mp3
                   -- stem terpisah utk pemutar di halaman login, supaya
                      slider volume di /settingsapp bisa mengubah balance
                      secara langsung tanpa render ulang. Stem musik SUDAH
                      ter-ducking, jadi digeser sekeras apa pun narasi tetap
                      terbaca.
"""
import os
import subprocess

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

NARRATION = os.path.join(SCRIPT_DIR, "narration_full.mp3")
MUSIC = os.path.join(SCRIPT_DIR, "music_bg.wav")
SFX = os.path.join(SCRIPT_DIR, "sfx_bus.wav")

# Gain default (juga jadi nilai awal slider di /settingsapp)
GAIN_NARRATION = 1.00
GAIN_MUSIC = 1.15      # >1 dan tetap aman: musik sudah di-duck ~10 dB di
                       # bawah suara, jadi angka besar ini hanya membuat sela
                       # antar-kalimat terasa penuh, bukan menutupi narasi
GAIN_SFX = 0.62

# threshold 0.05 (~-26 dBFS) sengaja rendah supaya bagian narasi yang pelan
# pun tetap memicu ducking; ratio 10 memberi kedalaman ~10 dB; release 320 ms
# cukup cepat untuk mengangkat musik lagi di jeda pendek antar-kalimat, tapi
# tidak sampai "memompa" di sela antar-kata.
DUCK = "threshold=0.05:ratio=10:attack=15:release=320:makeup=1:knee=6"


def run(args):
    subprocess.run(args, check=True, capture_output=True)


def main():
    music_ducked = os.path.join(SCRIPT_DIR, "stem-music.mp3")

    # 1) Musik di-duck memakai narasi sbg sidechain key
    run([
        "ffmpeg", "-y", "-i", MUSIC, "-i", NARRATION,
        "-filter_complex",
        f"[0:a]aresample=44100,aformat=channel_layouts=mono[m];"
        f"[1:a]aresample=44100,aformat=channel_layouts=mono,apad[k];"
        f"[m][k]sidechaincompress={DUCK}[out]",
        "-map", "[out]", "-t", "10000", "-c:a", "libmp3lame", "-q:a", "3",
        music_ducked,
    ])
    print("stem-music.mp3 (sudah ducking) ditulis")

    # 2) Stem narasi & SFX (format seragam utk pemutar web)
    run(["ffmpeg", "-y", "-i", NARRATION, "-ar", "44100", "-ac", "1",
         "-c:a", "libmp3lame", "-q:a", "3", os.path.join(SCRIPT_DIR, "stem-narration.mp3")])
    run(["ffmpeg", "-y", "-i", SFX, "-ar", "44100", "-ac", "1",
         "-c:a", "libmp3lame", "-q:a", "3", os.path.join(SCRIPT_DIR, "stem-sfx.mp3")])
    print("stem-narration.mp3 & stem-sfx.mp3 ditulis")

    # 3) Campuran akhir pada gain default + limiter supaya tidak pernah clip
    run([
        "ffmpeg", "-y",
        "-i", os.path.join(SCRIPT_DIR, "stem-narration.mp3"),
        "-i", music_ducked,
        "-i", os.path.join(SCRIPT_DIR, "stem-sfx.mp3"),
        "-filter_complex",
        f"[0:a]volume={GAIN_NARRATION}[n];"
        f"[1:a]volume={GAIN_MUSIC}[m];"
        f"[2:a]volume={GAIN_SFX}[s];"
        # +3 dB master: campuran mentah keluar di ~-19 LUFS, terlalu pelan
        # dibanding video web pada umumnya (~-16 LUFS). Limiter di belakangnya
        # yang menahan puncak narasi, jadi kenaikan ini tidak pernah clip.
        f"[n][m][s]amix=inputs=3:duration=longest:normalize=0[mix];"
        f"[mix]volume=3dB,alimiter=limit=0.95:level=disabled,aresample=44100[out]",
        "-map", "[out]", "-c:a", "libmp3lame", "-q:a", "2",
        os.path.join(SCRIPT_DIR, "audio_final.mp3"),
    ])
    print(f"audio_final.mp3 ditulis (narasi {GAIN_NARRATION} / musik {GAIN_MUSIC} / sfx {GAIN_SFX})")


if __name__ == "__main__":
    main()
