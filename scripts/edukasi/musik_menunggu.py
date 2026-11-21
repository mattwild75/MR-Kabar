"""
Musik tunggu layar tayang pre-test/post-test: diputar berulang (loop) selama
soal dibuka dan peserta sedang menjawab, lalu memudar saat soal ditutup.

Komposisi orisinal, D mayor, 84 ketuk per menit, delapan birama: petikan
pizzicato, arpeggio harpa, alas dawai lembut, dan detak hi-hat tipis seperti
jam yang berjalan. Memakai mesin skor video edukasi v6
(video-edukasi/v6/musik.py + midi.py) dan FluidSynth + soundfont MuseScore
General di video-tutorial/alat/ (tidak ikut repositori).

Supaya sambungannya mulus, skor dirender tiga putaran lalu diambil putaran
tengahnya: gema dari putaran sebelumnya ikut terbawa di awal berkas.

    python scripts/edukasi/musik_menunggu.py   -> public/media/tes/menunggu.wav

Sengaja WAV (mono 32 kHz, tanpa jeda penyandi seperti MP3/AAC): layar tayang
memutarnya lewat Web Audio dengan loop sampel-akurat, jadi sambungan tiap
putaran tidak terdengar.
"""
import importlib.util
import os
import subprocess
import sys
import wave

import numpy as np

AKAR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
V6 = os.path.join(AKAR, "video-edukasi", "v6")
sys.path.insert(0, V6)
spek = importlib.util.spec_from_file_location("musik_v6", os.path.join(V6, "musik.py"))
m6 = importlib.util.module_from_spec(spek)
spek.loader.exec_module(m6)
import midi  # noqa: E402  (dari folder v6)

m6.BPM = 84.0
m6.DET = 60.0 / m6.BPM
m6.BAR_D = m6.DET * 4
m6.SUASANA["menunggu"] = (["D", "Bm", "G", "A", "D", "Bm", "Em", "A"],
                          dict(pad=1, pizz="pola", harpa="arpeggio", piano="ostinato_jarang", kontrabas="panjang", keras=42))

BIRAMA = 8
PUTARAN = BIRAMA * m6.BAR_D


def main():
    s = m6.Skor()
    for k in range(3):
        a = k * PUTARAN
        s.segmen(a, a + PUTARAN, "menunggu", pudar_awal=False)
        for j in range(BIRAMA * 8):
            # detak jam: hi-hat tertutup tiap seperdelapan, ketuk berat sedikit lebih keras
            s.n("drum", a + j * m6.DET / 2, 0.08, 42, 24 + (8 if j % 2 == 0 else 0))
    keluar_dir = os.path.join(AKAR, "public", "media", "tes")
    os.makedirs(keluar_dir, exist_ok=True)
    sementara = os.path.join(keluar_dir, "_menunggu")
    midi.tulis(sementara + ".mid", list(s.t.values()), m6.BPM, m6.TPQ)
    subprocess.run([m6.FLUID, "-ni", "-F", sementara + ".wav", "-r", "48000", "-g", "0.6",
                    "-o", "synth.reverb.room-size=0.7", "-o", "synth.reverb.level=0.45",
                    "-o", "synth.chorus.active=0", m6.SF2, sementara + ".mid"], check=True, capture_output=True)
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", sementara + ".wav",
                    "-af", f"atrim=start={PUTARAN:.4f}:end={2 * PUTARAN:.4f},asetpts=PTS-STARTPTS",
                    "-ar", "32000", "-ac", "1", "-c:a", "pcm_s16le", sementara + "_potong.wav"], check=True)
    # Penguat TETAP (bukan loudnorm dinamis) supaya ujung dan pangkal putaran sama keras.
    with wave.open(sementara + "_potong.wav", "rb") as w:
        x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    x *= 0.06 / max(1e-6, float(np.sqrt(np.mean(x ** 2))))
    x = np.clip(x, -0.89, 0.89)
    with wave.open(os.path.join(keluar_dir, "menunggu.wav"), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(32000)
        w.writeframes((x * 32767).astype(np.int16).tobytes())
    os.remove(sementara + "_potong.wav")
    os.remove(sementara + ".mid")
    os.remove(sementara + ".wav")
    print(f"public/media/tes/menunggu.wav {PUTARAN:.2f} dtk per putaran")


if __name__ == "__main__":
    main()
