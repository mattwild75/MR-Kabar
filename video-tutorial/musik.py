"""Musik latar dari REKAMAN INSTRUMEN, bukan sintesis.

Bedanya dengan musik video edukasi terletak di sumber bunyinya. Di sana setiap
nada dibangkitkan numpy — sinus, FM, Karplus-Strong — sehingga warnanya memang
warna osilator. Di sini nada-nadanya ditulis sebagai MIDI, lalu dibunyikan
FluidSynth memakai soundfont MuseScore General: pustaka berisi CONTOH BUNYI
yang direkam dari piano, gitar, dawai, dan bas yang benar-benar dimainkan
orang, satu contoh per nada.

Yang perlu jujur disebut: ini rekaman instrumen sungguhan yang DIMAINKAN ULANG,
bukan sesi rekaman musisi. Frasa dan dinamikanya tetap ditulis di berkas ini.

Susunannya sengaja tenang dan tidak menuntut perhatian — video ini ditonton
sambil mengisi aplikasi, jadi musiknya melatari, bukan menemani. Perubahan
nuansa mengikuti bagian video, supaya pergantian topik terdengar.

    python musik.py 3600        buat musik selama 3600 detik
    python musik.py --dari-waktu   panjangnya mengikuti rekam/waktu-*.json
"""
import glob
import io
import json
import os
import subprocess
import sys

import midi

DIR = os.path.dirname(os.path.abspath(__file__))
FLUID = os.path.join(DIR, "alat", "fluidsynth",
                     "fluidsynth-v2.5.7-win10-x64-glib", "bin", "fluidsynth.exe")
SF2 = os.path.join(DIR, "alat", "MuseScore_General.sf3")

BPM = 72.0
TPQ = 480
KETUK = 60.0 / BPM            # 0.8333 detik
BAR = KETUK * 4               # 3.3333 detik
TICK_BAR = TPQ * 4

# Program General MIDI. Semuanya instrumen bersampel, bukan synth pad.
PIANO, DAWAI, GITAR, BAS, VIBRA = 0, 48, 24, 32, 11

# Progresi empat bar dalam D mayor — hangat, tidak sendu, tidak megah.
# Tiap entri: (nada bas, susunan akor).
PROGRESI = [
    (38, [50, 54, 57, 62]),   # D
    (33, [49, 52, 57, 61]),   # A/C#
    (35, [50, 54, 59, 62]),   # Bm7
    (31, [50, 55, 59, 62]),   # G
]

# Nuansa per bagian video. Yang berubah kerapatan dan siapa yang membawa
# melodi, bukan nada dasarnya — supaya pergantiannya terasa sebagai satu lagu
# yang berkembang, bukan sebagai lagu yang berganti.
NUANSA = {
    "tenang": dict(piano=1, dawai=1, gitar=0, vibra=0, arpeggio=0, keras=52),
    "jalan": dict(piano=1, dawai=1, gitar=1, vibra=0, arpeggio=1, keras=58),
    "terang": dict(piano=1, dawai=1, gitar=1, vibra=1, arpeggio=1, keras=64),
    "reda": dict(piano=1, dawai=1, gitar=0, vibra=1, arpeggio=0, keras=48),
}
URUTAN = ["tenang", "jalan", "jalan", "terang", "jalan", "terang",
          "jalan", "terang", "jalan", "reda"]

# Motif melodi sederhana, ditaruh jarang. Angka = derajat pada tangga nada D.
MOTIF = [
    [(0, 2, 69), (2, 2, 71), (4, 4, 74)],
    [(0, 3, 66), (3, 1, 69), (4, 4, 71)],
    [(0, 2, 74), (2, 2, 71), (4, 4, 69)],
    [(0, 4, 67), (4, 4, 66)],
]


def susun(total_detik: float) -> tuple[list[midi.Trek], float]:
    bar_total = int(total_detik / BAR) + 2
    piano = midi.Trek(0, PIANO, "piano")
    dawai = midi.Trek(1, DAWAI, "dawai")
    gitar = midi.Trek(2, GITAR, "gitar")
    bas = midi.Trek(3, BAS, "bas")
    vibra = midi.Trek(4, VIBRA, "vibra")

    # Panjang tiap nuansa dibagi rata sepanjang video.
    per_nuansa = max(8, bar_total // len(URUTAN))

    for b in range(bar_total):
        t = b * TICK_BAR
        n = NUANSA[URUTAN[min(b // per_nuansa, len(URUTAN) - 1)]]
        nada_bas, akor = PROGRESI[b % 4]
        keras = n["keras"]

        # Bas: satu nada panjang per bar, ditebalkan di ketukan tiga.
        if n["piano"]:
            bas.not_(t, TICK_BAR - 30, nada_bas, keras - 4)
            bas.not_(t + TPQ * 2, TPQ - 30, nada_bas + 7, keras - 16)

        # Dawai menahan akornya; inilah lapisan yang membuat bunyinya hangat.
        if n["dawai"]:
            dawai.akor(t, TICK_BAR - 20, [x - 12 for x in akor[:3]], keras - 20)

        # Piano memainkan akor pada ketukan 1 dan 3.
        if n["piano"]:
            piano.akor(t, TPQ * 2 - 40, akor, keras - 6)
            piano.akor(t + TPQ * 2, TPQ * 2 - 40, akor[:3], keras - 14)

        # Gitar memetik naik-turun, memberi gerak tanpa menambah kerapatan.
        if n["gitar"]:
            pola = [0, 1, 2, 3, 2, 1]
            for i, p in enumerate(pola):
                gitar.not_(t + i * (TPQ * 4 // len(pola)),
                           TPQ // 2, akor[p % len(akor)], keras - 24 + (i % 2) * 5)

        # Arpeggio piano di bar genap saja, supaya tidak terus-menerus ramai.
        if n["arpeggio"] and b % 2 == 1:
            for i in range(8):
                piano.not_(t + i * (TPQ // 2), TPQ // 2 - 20,
                           akor[i % len(akor)] + (12 if i >= 4 else 0), keras - 30)

        # Vibra membawa motif, sekali tiap empat bar.
        if n["vibra"] and b % 4 == 2:
            for ketuk, panjang, nada in MOTIF[(b // 4) % len(MOTIF)]:
                vibra.not_(t + ketuk * TPQ, panjang * TPQ - 40, nada, keras - 26)

    return [piano, dawai, gitar, bas, vibra], bar_total * BAR


def utama() -> None:
    if "--dari-waktu" in sys.argv:
        total = 0.0
        for p in sorted(glob.glob(os.path.join(DIR, "rekam", "waktu-*.json"))):
            d = json.load(io.open(p, encoding="utf-8"))
            if d:
                total += max(x["selesai"] for x in d)
        if total <= 0:
            raise SystemExit("belum ada rekam/waktu-*.json — sebutkan durasinya langsung")
    else:
        total = float(sys.argv[1]) if len(sys.argv) > 1 else 600.0

    if not os.path.exists(SF2):
        raise SystemExit(f"soundfont tidak ada: {SF2}")

    trek, panjang = susun(total)
    mid = os.path.join(DIR, "musik.mid")
    wav = os.path.join(DIR, "musik.wav")
    midi.tulis(mid, trek, BPM, TPQ)
    print(f"musik.mid: {panjang / 60:.1f} menit, {len(trek)} instrumen bersampel")

    subprocess.run(
        [FLUID, "-ni", "-F", wav, "-r", "44100", "-g", "0.7",
         "-o", "synth.reverb.room-size=0.75", "-o", "synth.reverb.level=0.55",
         "-o", "synth.chorus.active=0", SF2, mid],
        check=True, capture_output=True,
    )
    ukuran = os.path.getsize(wav) / 1024 / 1024
    print(f"musik.wav: {ukuran:.1f} MB")


if __name__ == "__main__":
    utama()
