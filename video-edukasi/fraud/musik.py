"""Musik latar video edukasi Lapor Dugaan Kecurangan — dari REKAMAN instrumen.

Sumber bunyinya sama dengan musik video tutorial (video-tutorial/musik.py):
nada ditulis sebagai MIDI, dibunyikan FluidSynth memakai soundfont MuseScore
General berisi contoh bunyi piano, dawai, gitar nilon, bas, vibrafon, dan
selo yang direkam dari instrumen sungguhan. Yang berbeda ARANSEMENNYA: video
ini bukan tutorial yang ditonton sambil bekerja, melainkan cerita 9 menit
dengan bagian yang berbeda-beda suasananya — jadi musiknya mengikuti scene.

Peta suasana (dibaca dari timeline.json, bukan ditulis tangan):

    s1  pembuka          tenang   D mayor, piano + dawai, jarang
    s2  apa itu curang   jalan    + petikan gitar
    s3  beda dgn risiko  jalan
    s4  tujuh bentuk     serius   B minor, dawai rendah, selo, piano sparsa
    s5  tanda-tanda      waspada  B minor, gitar berdenyut, vibra motif minor
    s6  dasar hukum      terang   kembali D mayor, vibra, arpeggio
    s7  cara melapor     jalan
    s8  perlindungan     hangat   dawai + arpeggio pelan, tanpa gitar
    s9  setelah lapor    jalan
    s10 penutup          terang -> reda, akor akhir ditahan lalu memudar

Progresi diulang dari awal tiap ganti scene supaya pergantian akor jatuh
bersamaan dengan pergantian topik.

    python musik.py            -> music_bg.wav sepanjang timeline.json
"""
import json
import os
import subprocess

import midi

DIR = os.path.dirname(os.path.abspath(__file__))
ALAT = os.path.join(DIR, "..", "..", "video-tutorial", "alat")
FLUID = os.path.join(ALAT, "fluidsynth", "fluidsynth-v2.5.7-win10-x64-glib", "bin", "fluidsynth.exe")
SF2 = os.path.join(ALAT, "MuseScore_General.sf3")

BPM = 72.0
TPQ = 480
KETUK = 60.0 / BPM
BAR = KETUK * 4
TICK_BAR = TPQ * 4

# Program General MIDI — semuanya instrumen bersampel.
PIANO, DAWAI, GITAR, BAS, VIBRA, SELO = 0, 48, 24, 32, 11, 42

# (nada bas, susunan akor). Mayor: D - A/C# - Bm7 - G (hangat).
MAYOR = [
    (38, [50, 54, 57, 62]),   # D
    (33, [49, 52, 57, 61]),   # A/C#
    (35, [50, 54, 59, 62]),   # Bm7
    (31, [50, 55, 59, 62]),   # G
]
# Minor: Bm - G - Em - A (masih dalam D mayor, tapi berpusat di B minor:
# terdengar lebih serius tanpa berganti kunci, jadi kembali ke mayor mulus).
MINOR = [
    (35, [50, 54, 59, 62]),   # Bm
    (31, [50, 55, 59, 62]),   # G
    (28, [52, 55, 59, 64]),   # Em
    (33, [52, 57, 61, 64]),   # A
]

NUANSA = {
    "tenang":  dict(prog=MAYOR, piano="dua", dawai="tengah", gitar=None,    bas="panjang", vibra=None,    selo=False, arpeggio=False, keras=50),
    "jalan":   dict(prog=MAYOR, piano="dua", dawai="tengah", gitar="petik", bas="panjang", vibra=None,    selo=False, arpeggio=True,  keras=56),
    "terang":  dict(prog=MAYOR, piano="dua", dawai="tengah", gitar="petik", bas="jalan",   vibra="mayor", selo=False, arpeggio=True,  keras=62),
    "serius":  dict(prog=MINOR, piano="satu", dawai="rendah", gitar=None,   bas="jalan",   vibra=None,    selo=True,  arpeggio=False, keras=54),
    "waspada": dict(prog=MINOR, piano="dua", dawai="rendah", gitar="denyut", bas="jalan",  vibra="minor", selo=True,  arpeggio=False, keras=58),
    "hangat":  dict(prog=MAYOR, piano="satu", dawai="tengah", gitar=None,   bas="panjang", vibra="mayor", selo=False, arpeggio=True,  keras=52),
    "reda":    dict(prog=MAYOR, piano="satu", dawai="tengah", gitar=None,   bas="panjang", vibra="mayor", selo=False, arpeggio=False, keras=46),
}
SUASANA_SCENE = {
    "s1": "tenang", "s2": "jalan", "s3": "jalan", "s4": "serius", "s5": "waspada",
    "s6": "terang", "s7": "jalan", "s8": "hangat", "s9": "jalan", "s10": "terang",
}

# Motif melodi (ketuk mulai, panjang ketuk, nada) — jarang, satu tiap 4 bar.
MOTIF = {
    "mayor": [
        [(0, 2, 69), (2, 2, 71), (4, 4, 74)],
        [(0, 3, 66), (3, 1, 69), (4, 4, 71)],
        [(0, 2, 74), (2, 2, 71), (4, 4, 69)],
        [(0, 4, 67), (4, 4, 66)],
    ],
    "minor": [
        [(0, 2, 71), (2, 2, 69), (4, 4, 66)],
        [(0, 3, 74), (3, 1, 71), (4, 4, 69)],
        [(0, 2, 67), (2, 2, 66), (4, 4, 62)],
        [(0, 4, 69), (4, 4, 71)],
    ],
}


def suasana_per_bar(timeline: dict, bar_total: int) -> list[tuple[str, int]]:
    """Untuk tiap bar: (nama suasana, urutan bar sejak suasana itu mulai)."""
    scenes = timeline["scenes"]
    hasil = []
    sekarang, sejak = None, 0
    for b in range(bar_total):
        t = b * BAR + BAR * 0.5
        nama = "reda"
        for sc in scenes:
            if sc["start"] <= t < sc["end"]:
                nama = SUASANA_SCENE.get(sc["id"], "jalan")
                break
        # Dua bar terakhir penutup mereda, sebelum akor akhir ditahan.
        if t >= timeline["total_duration"] - BAR * 2.5:
            nama = "reda"
        if nama != sekarang:
            sekarang, sejak = nama, 0
        else:
            sejak += 1
        hasil.append((nama, sejak))
    return hasil


def susun(timeline: dict) -> tuple[list[midi.Trek], float]:
    total = timeline["total_duration"]
    # Bar terakhir dipakai akor penutup; sisanya dipotong & dipudarkan ffmpeg.
    bar_total = int(total / BAR)
    piano = midi.Trek(0, PIANO, "piano")
    dawai = midi.Trek(1, DAWAI, "dawai")
    gitar = midi.Trek(2, GITAR, "gitar")
    bas = midi.Trek(3, BAS, "bas")
    vibra = midi.Trek(4, VIBRA, "vibra")
    selo = midi.Trek(5, SELO, "selo")

    peta = suasana_per_bar(timeline, bar_total)
    for b, (nama, sejak) in enumerate(peta):
        t = b * TICK_BAR
        n = NUANSA[nama]
        nada_bas, akor = n["prog"][sejak % 4]
        keras = n["keras"]
        # Bar pertama suasana baru sedikit lebih lembut: pergantian terasa
        # sebagai tarikan napas, bukan lompatan.
        if sejak == 0:
            keras -= 6

        # ── bas ──
        if n["bas"] == "panjang":
            bas.not_(t, TICK_BAR - 30, nada_bas, keras - 4)
            bas.not_(t + TPQ * 2, TPQ - 30, nada_bas + 7, keras - 16)
        else:  # berjalan: akar - kuint - akar - oktaf turun
            bas.not_(t, TPQ - 30, nada_bas, keras - 2)
            bas.not_(t + TPQ, TPQ - 30, nada_bas + 7, keras - 14)
            bas.not_(t + TPQ * 2, TPQ - 30, nada_bas, keras - 6)
            bas.not_(t + TPQ * 3, TPQ - 30, nada_bas + 7 if sejak % 2 else nada_bas + 12, keras - 16)

        # ── dawai: alas hangat; versi rendah untuk bagian serius ──
        if n["dawai"] == "tengah":
            dawai.akor(t, TICK_BAR - 20, [x - 12 for x in akor[:3]], keras - 20)
        else:
            dawai.akor(t, TICK_BAR - 20, [akor[0] - 24, akor[2] - 24, akor[1] - 12], keras - 16)

        # ── piano ──
        if n["piano"] == "dua":
            piano.akor(t, TPQ * 2 - 40, akor, keras - 6)
            piano.akor(t + TPQ * 2, TPQ * 2 - 40, akor[:3], keras - 14)
        else:  # satu: akor di ketukan 1, satu nada tinggi di ketukan 4
            piano.akor(t, TPQ * 3 - 40, akor, keras - 8)
            piano.not_(t + TPQ * 3, TPQ - 40, akor[-1] + 12, keras - 22)

        # ── gitar ──
        if n["gitar"] == "petik":
            pola = [0, 1, 2, 3, 2, 1]
            for i, p in enumerate(pola):
                gitar.not_(t + i * (TICK_BAR // len(pola)), TPQ // 2,
                           akor[p % len(akor)], keras - 24 + (i % 2) * 5)
        elif n["gitar"] == "denyut":
            # Delapan not pendek pada akar akor: denyut yang menahan
            # ketegangan tanpa menambah harmoni.
            for i in range(8):
                gitar.not_(t + i * (TPQ // 2), TPQ // 4,
                           akor[0] + (12 if i in (3, 7) else 0), keras - 26 + (4 if i % 2 == 0 else 0))

        # ── arpeggio piano di bar ganjil ──
        if n["arpeggio"] and sejak % 2 == 1:
            for i in range(8):
                piano.not_(t + i * (TPQ // 2), TPQ // 2 - 20,
                           akor[i % len(akor)] + (12 if i >= 4 else 0), keras - 30)

        # ── selo: garis penyeimbang di bagian minor ──
        if n["selo"]:
            selo.not_(t, TPQ * 3 - 30, nada_bas + 12, keras - 18)
            selo.not_(t + TPQ * 3, TPQ - 30, akor[1] - 12, keras - 24)

        # ── vibra: motif sekali tiap 4 bar ──
        if n["vibra"] and sejak % 4 == 2:
            for ketuk, panjang, nada in MOTIF[n["vibra"]][(sejak // 4) % 4]:
                vibra.not_(t + ketuk * TPQ, panjang * TPQ - 40, nada, keras - 26)

    # Akor penutup: D mayor ditahan di bar terakhir, lalu ffmpeg memudarkannya.
    t = bar_total * TICK_BAR
    nada_bas, akor = MAYOR[0]
    bas.not_(t, TICK_BAR * 2, nada_bas, 46)
    dawai.akor(t, TICK_BAR * 2, [x - 12 for x in akor[:3]], 34)
    piano.akor(t, TICK_BAR * 2, akor + [akor[0] + 12], 44)
    vibra.not_(t + TPQ, TICK_BAR, 74, 30)

    return [piano, dawai, gitar, bas, vibra, selo], total


def utama() -> None:
    timeline = json.load(open(os.path.join(DIR, "timeline.json"), encoding="utf-8"))
    if not os.path.exists(SF2):
        raise SystemExit(f"soundfont tidak ada: {SF2}")

    trek, total = susun(timeline)
    mid = os.path.join(DIR, "musik.mid")
    mentah = os.path.join(DIR, "musik_mentah.wav")
    wav = os.path.join(DIR, "music_bg.wav")
    midi.tulis(mid, trek, BPM, TPQ)
    print(f"musik.mid: {total / 60:.1f} menit, {len(trek)} instrumen bersampel")

    subprocess.run(
        [FLUID, "-ni", "-F", mentah, "-r", "44100", "-g", "0.7",
         "-o", "synth.reverb.room-size=0.75", "-o", "synth.reverb.level=0.55",
         "-o", "synth.chorus.active=0", SF2, mid],
        check=True, capture_output=True,
    )
    # Panjang dipaskan ke timeline (mix memakai duration=longest), kerasnya
    # disamakan dengan musik video edukasi utama (-24.6 LUFS) supaya angka
    # gain & ducking di mix_audio.py berlaku sama, dan 4 detik terakhir
    # dipudarkan supaya akor penutup tidak terpotong kasar.
    subprocess.run(
        ["ffmpeg", "-y", "-v", "error", "-i", mentah,
         "-af", f"loudnorm=I=-24.6:LRA=9:TP=-3,afade=t=in:st=0:d=1.5,afade=t=out:st={total - 4:.2f}:d=4",
         "-t", f"{total:.3f}", "-ar", "44100", "-ac", "2", wav],
        check=True,
    )
    os.remove(mentah)
    print(f"music_bg.wav: {os.path.getsize(wav) / 1024 / 1024:.1f} MB, {total:.1f} detik")


if __name__ == "__main__":
    utama()
