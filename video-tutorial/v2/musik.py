"""
Skor orisinal video tutorial MR Kabar v2.

Bahannya sama dengan video edukasi v6: nada ditulis sebagai MIDI (midi.py),
dibunyikan FluidSynth dengan soundfont MuseScore General (rekaman instrumen
sungguhan). Yang berbeda tugasnya. Video edukasi bertutur seperti film;
tutorial ditonton sambil bekerja, jadi musiknya harus menemani tanpa minta
didengarkan - tetapi juga tidak boleh satu pola yang berulang setengah jam,
sumber utama rasa bosan di tutorial v1.

Karena itu:
  - tiap BAB rekaman punya suasana kerja sendiri (kunci, instrumen pembawa,
    denyut), dan di dalam satu bab lapisannya berganti tiap delapan birama;
  - tiap KARTU bab diberi aksen: gulungan timpani, pukulan, dan frasa tema;
  - CATATAN akhir bab diiringi motif lonceng yang tenang;
  - PEMBUKA dan PENUTUP memakai "tema Kabar" (A-D-E-F) yang sama dengan
    video edukasi v6, supaya dua video itu terdengar satu keluarga.

Rencana segmen dibaca dari keluaran/isyarat.json (hasil rakit.py), jadi
pergantian suasana jatuh tepat di batas segmen video.

    python musik.py   -> keluaran/musik.wav
"""
import json
import os
import subprocess

import midi

DIR = os.path.dirname(os.path.abspath(__file__))
KEL = os.path.join(DIR, "keluaran")
ALAT = os.path.join(DIR, "..", "alat")
FLUID = os.path.join(ALAT, "fluidsynth", "fluidsynth-v2.5.7-win10-x64-glib", "bin", "fluidsynth.exe")
SF2 = os.path.join(ALAT, "MuseScore_General.sf3")

BPM = 84.0
TPQ = 480
DET = 60.0 / BPM
BAR_D = DET * 4


def tik(d):
    return int(round(d / DET * TPQ))


DAWAI, PIANO, GITAR, BAS, HARPA, CELESTA, PIZZ, SELO, KONTRABAS, HORN, PADUAN, TIMPANI, PAD, VIBRA, MARIMBA = \
    49, 0, 24, 32, 46, 8, 45, 42, 43, 60, 52, 47, 89, 11, 12

AKOR = {
    "C": (36, [48, 52, 55, 60]), "Am": (33, [48, 52, 57, 60]), "F": (41, [48, 53, 57, 60]), "G": (43, [50, 55, 59, 62]),
    "Dm": (38, [50, 53, 57, 62]), "Bb": (34, [50, 53, 58, 62]), "Em": (40, [52, 55, 59, 64]), "D": (38, [50, 54, 57, 62]),
    "A": (33, [49, 52, 57, 61]), "Bm": (35, [50, 54, 59, 62]), "Gm": (43, [50, 55, 58, 62]), "Eb": (39, [51, 55, 58, 63]),
    "Fmaj7": (41, [52, 53, 57, 60]), "Cmaj7": (36, [47, 52, 55, 60]), "Am7": (33, [48, 52, 55, 60]), "Dm7": (38, [48, 53, 57, 62]),
}
TEMA_MINOR = [(0, 1.5, 69), (1.5, 0.5, 74), (2, 1, 76), (3, 1, 77), (4, 3, 76), (7, 1, 74)]
TEMA_MAYOR = [(0, 1.5, 69), (1.5, 0.5, 74), (2, 1, 76), (3, 1, 78), (4, 2, 79), (6, 2, 78), (8, 4, 74)]

# Suasana: progresi + lapisan. `pembawa` = instrumen pola utama.
SUASANA = {
    "terang":   (["C", "Am", "F", "G"], dict(pembawa="piano", bas="jalan", denyut="pengocok", pad=1, keras=50)),
    "rapi":     (["F", "Dm7", "Bb", "C"], dict(pembawa="harpa", bas="panjang", denyut="pengocok", pad=1, lonceng=1, keras=48)),
    "teliti":   (["Am", "F", "C", "G"], dict(pembawa="pizz", bas="panjang", denyut="tongkat", pad=1, keras=46)),
    "mantap":   (["G", "Em", "C", "D"], dict(pembawa="gitar", bas="jalan", denyut="pengocok", pad=1, keras=50)),
    "mengalir": (["Fmaj7", "C", "Dm7", "Bb"], dict(pembawa="marimba", bas="panjang", denyut="tongkat", pad=1, keras=46)),
    "waspada":  (["Dm", "Bb", "Gm", "A"], dict(pembawa="selo", bas="panjang", denyut="timpani", pad=1, keras=48)),
    "lega":     (["D", "A", "Bm", "G"], dict(pembawa="gitar", bas="jalan", denyut="pengocok", pad=1, keras=50)),
    "malam":    (["Am7", "Fmaj7", "C", "G"], dict(pembawa="vibra", bas="panjang", denyut=None, pad=1, lonceng=1, keras=44)),
    "misteri":  (["Dm", "Bb", "Gm", "A"], dict(pembawa="piano_jarang", bas="panjang", denyut=None, pad=1, keras=44)),
    "fajar":    (["D", "A", "Bm", "G"], dict(pembawa="harpa", bas="panjang", denyut=None, pad=1, paduan=1, keras=52)),
    "kredit":   (["D", "G", "Bm", "A"], dict(pembawa="piano_melodi", bas="panjang", denyut=None, pad=1, keras=44)),
    "catatan":  (["F", "C", "Dm", "Bb"], dict(pembawa=None, bas="panjang", denyut=None, pad=1, lonceng=1, keras=40)),
}
SUASANA_BAB = {"1": "terang", "2": "rapi", "3": "teliti", "4": "mantap", "5": "mengalir", "6": "teliti",
               "7": "rapi", "8": "waspada", "9": "lega", "10": "terang", "11": "mantap", "12": "malam", "13": "lega"}
AKOR_KARTU = {"1": "C", "2": "F", "3": "Am", "4": "G", "5": "F", "6": "Am", "7": "F", "8": "Dm", "9": "D",
              "10": "C", "11": "G", "12": "Am", "13": "D"}


class Skor:
    def __init__(self):
        nama = [("dawai", DAWAI), ("piano", PIANO), ("gitar", GITAR), ("bas", BAS), ("harpa", HARPA), ("celesta", CELESTA),
                ("pizz", PIZZ), ("selo", SELO), ("kontrabas", KONTRABAS), ("drum", 0), ("horn", HORN), ("paduan", PADUAN),
                ("timpani", TIMPANI), ("pad", PAD), ("vibra", VIBRA), ("marimba", MARIMBA)]
        self.t = {}
        kanal = 0
        for n, prog in nama:
            k = 9 if n == "drum" else kanal
            if n != "drum":
                kanal += 1
                if kanal == 9:
                    kanal = 10
            self.t[n] = midi.Trek(k, prog, n)

    def n(self, trek, d, pj, nada, keras):
        self.t[trek].not_(tik(d), max(1, tik(pj)), nada, keras)

    def segmen(self, a, b, nama, masuk=True):
        prog, Lp = SUASANA[nama]
        k = Lp["keras"]
        nbar = int((b - a) / BAR_D + 0.999)
        for i in range(nbar):
            t = a + i * BAR_D
            sisa = min(BAR_D, b - t)
            if sisa <= 0.25:
                break
            bas, akor = AKOR[prog[i % len(prog)]]
            bagian = (i // 8) % 4            # lapisan berganti tiap 8 birama
            ke = k - (10 if (i == 0 and masuk) else 0)
            if i == nbar - 1:
                ke -= 6
            # alas
            if Lp.get("pad"):
                self.n("pad", t, sisa - 0.05, akor[1], ke - 26)
                self.n("pad", t, sisa - 0.05, akor[2], ke - 28)
                if bagian != 1:
                    self.n("dawai", t, sisa - 0.05, akor[0], ke - 22)
                    self.n("dawai", t, sisa - 0.05, akor[2], ke - 24)
            if Lp.get("paduan"):
                for x in akor[:3]:
                    self.n("paduan", t, sisa - 0.05, x + 12, ke - 22)
            # bas
            if Lp.get("bas") == "jalan" and bagian != 0:
                for j, d in enumerate([0, 7, 12, 7]):
                    if j * DET < sisa:
                        self.n("bas", t + j * DET, DET * 0.85, bas + 12 + d - 12, ke - 6 - (j % 2) * 6)
            else:
                self.n("kontrabas" if Lp.get("bas") == "panjang" else "bas", t, sisa - 0.05, bas, ke - 10)
            # denyut
            dn = Lp.get("denyut")
            if dn == "pengocok" and bagian in (1, 2, 3):
                for j in range(8):
                    if j * DET / 2 < sisa:
                        self.n("drum", t + j * DET / 2, DET / 3, 70, ke - 22 + (8 if j % 2 == 0 else 0))
                if 3 * DET < sisa:
                    self.n("drum", t + 3 * DET, DET / 2, 37, ke - 18)
            elif dn == "tongkat" and bagian in (1, 3):
                for j in (1, 3):
                    if j * DET < sisa:
                        self.n("drum", t + j * DET, DET / 2, 37, ke - 18)
            elif dn == "timpani" and i % 2 == 1 and 3 * DET < sisa:
                self.n("timpani", t + 3 * DET, DET * 0.5, 38, ke - 16)
                self.n("timpani", t + 3.5 * DET, DET * 0.5, 38, ke - 12)
            # pembawa pola
            p = Lp.get("pembawa")
            if bagian == 2 and p not in ("piano_melodi", "piano_jarang", "selo"):
                p = "piano"                      # variasi: piano mengambil alih sebentar
            if p == "piano":
                for j, q in enumerate([0, 2, 1, 3, 2, 1, 3, 2]):
                    if j * DET / 2 < sisa:
                        self.n("piano", t + j * DET / 2, DET / 2 * 0.9, akor[q] + 12, ke - 16 + (5 if j % 4 == 0 else 0))
            elif p == "piano_jarang":
                for j, q in enumerate([0, 2, 3, 2]):
                    if j * DET < sisa:
                        self.n("piano", t + j * DET, DET * 0.95, akor[q] + 12, ke - 16)
            elif p == "piano_melodi":
                frasa = [[(0, 1, 3), (1, 1, 2), (2, 2, 1)], [(0, 2, 2), (2, 1, 3), (3, 1, 2)]][i % 2]
                for kt, pj, q in frasa:
                    if kt * DET < sisa:
                        self.n("piano", t + kt * DET, pj * DET * 0.95, akor[q] + 12, ke - 8)
                self.n("piano", t, sisa, akor[0], ke - 20)
            elif p == "harpa":
                nada = akor + [x + 12 for x in akor]
                for j, x in enumerate(nada):
                    if j * DET / 2 < sisa:
                        self.n("harpa", t + j * DET / 2, DET * 1.5, x, ke - 14)
            elif p == "pizz":
                for j, q in enumerate([0, 2, 3, 2, 1, 2, 3, 2]):
                    if j * DET / 2 < sisa:
                        self.n("pizz", t + j * DET / 2, DET / 3, akor[q], ke - 8 + (6 if j % 4 == 0 else 0))
            elif p == "gitar":
                for j, q in enumerate([0, 1, 2, 3, 2, 1, 2, 3]):
                    if j * DET / 2 < sisa:
                        self.n("gitar", t + j * DET / 2, DET * 0.9, akor[q], ke - 10 + (6 if j % 4 == 0 else 0))
            elif p == "marimba":
                for j, q in enumerate([0, 2, 3, 2, 0, 3, 2, 1]):
                    if j * DET / 2 < sisa:
                        self.n("marimba", t + j * DET / 2, DET / 2, akor[q] + 12, ke - 12 + (6 if j % 4 == 0 else 0))
            elif p == "vibra":
                for j, q in enumerate([0, 2, 3, 1]):
                    if j * DET < sisa:
                        self.n("vibra", t + j * DET, DET * 1.8, akor[q] + 12, ke - 10)
            elif p == "selo":
                for j in range(8):
                    if j * DET / 2 < sisa:
                        self.n("selo", t + j * DET / 2, DET / 2 * 0.8, bas + 12 + (7 if j in (3, 7) else 0), ke - 14 + (4 if j % 2 == 0 else 0))
            # lonceng: motif tema tiap 8 birama
            if Lp.get("lonceng") and i % 8 == 3:
                self.tema("celesta", t, TEMA_MINOR if akor[0] % 12 in (2, 9) else [(x, y, z - 2) for x, y, z in TEMA_MINOR], ke - 2, b)

    def tema(self, trek, t, tema, keras, batas):
        for kt, pj, nada in tema:
            m = t + kt * DET
            if m + 0.2 < batas:
                self.n(trek, m, min(pj * DET * 0.97, batas - m), nada, keras)

    def aksen(self, t, kuat=58, gulung=1.0, akor="Dm", tema=True):
        n = int(gulung / 0.07)
        for j in range(n):
            u = j / max(1, n - 1)
            self.n("timpani", t - gulung + j * 0.07, 0.08, 38, int(16 + (kuat - 16) * u * 0.8))
        self.n("timpani", t, 1.2, 38, kuat + 6)
        self.n("drum", t, 2.2, 49, kuat - 14)
        self.n("drum", t, 0.4, 35, kuat - 4)
        bas, susunan = AKOR[akor]
        self.n("kontrabas", t, 2.6, bas, kuat - 6)
        for x in susunan:
            self.n("dawai", t, 2.8, x, kuat - 12)
        if tema:
            self.tema("horn", t + 0.35, [(a, b, c - 12) for a, b, c in TEMA_MINOR[:4]], kuat - 4, t + 4.2)


def utama():
    isy = json.load(open(os.path.join(KEL, "isyarat.json"), encoding="utf-8"))
    tl = json.load(open(os.path.join(DIR, "selingan", "timeline.json"), encoding="utf-8"))
    total = isy["total"]
    sc = {s["id"]: s for s in tl["scenes"]}
    s = Skor()
    for seg in isy["segmen"]:
        a, m, d = seg["a"], seg["mulai"], seg["durasi"]
        akhir = m + d
        if a == "buka":
            # misteri sampai judul, lalu judul (tema horn + paduan), lalu fajar
            ln = [l for l in tl["lines"] if l["scene"] == "buka"]
            t_judul = next(w["t"] for w in ln[1]["words"] if w["w"].lower().startswith("dalam")) - sc["buka"]["start"] + m
            s.segmen(m, t_judul - 0.2, "misteri", masuk=True)
            s.aksen(t_judul - 0.2, 70, 1.8, "Dm", tema=False)
            s.tema("horn", t_judul + 0.2, [(x, y, z - 12) for x, y, z in TEMA_MINOR], 68, t_judul + 8)
            s.tema("paduan", t_judul + 0.2, TEMA_MINOR, 48, t_judul + 8)
            s.segmen(t_judul + 0.2, akhir, "fajar", masuk=False)
        elif a.startswith("kartu-"):
            n = a.split("-")[1]
            s.aksen(m + 0.5, 56, 0.9, AKOR_KARTU[n])
            s.segmen(m + 0.5, akhir, "catatan" if n != "8" else "waspada", masuk=True)
        elif a.startswith("rekam-"):
            n = a.split("-")[1]
            s.segmen(m, akhir, SUASANA_BAB[n], masuk=True)
        elif a.startswith("catatan-"):
            s.segmen(m, akhir, "catatan", masuk=True)
            s.tema("celesta", m + 0.6, [(x, y, z + 0) for x, y, z in TEMA_MAYOR[:5]], 46, akhir)
        elif a == "tutup":
            ln = [l for l in tl["lines"] if l["scene"] == "tutup"]
            t_hak = ln[-1]["end"] - sc["tutup"]["start"] + m
            s.segmen(m, t_hak + 1.0, "fajar", masuk=True)
            s.tema("horn", m + 2.0, [(x, y, z - 12) for x, y, z in TEMA_MAYOR], 60, t_hak)
            s.segmen(t_hak + 1.0, akhir - 1.5, "kredit", masuk=False)
            bas, akor = AKOR["D"]
            s.n("kontrabas", akhir - 2.4, 3.0, bas, 40)
            for x in akor:
                s.n("dawai", akhir - 2.4, 3.0, x, 34)

    mid = os.path.join(KEL, "musik.mid")
    mentah = os.path.join(KEL, "musik_mentah.wav")
    wav = os.path.join(KEL, "musik.wav")
    midi.tulis(mid, list(s.t.values()), BPM, TPQ)
    subprocess.run([FLUID, "-ni", "-F", mentah, "-r", "48000", "-g", "0.6",
                    "-o", "synth.reverb.room-size=0.8", "-o", "synth.reverb.level=0.55",
                    "-o", "synth.reverb.width=0.9", "-o", "synth.chorus.active=0", SF2, mid],
                   check=True, capture_output=True)
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", mentah,
                    "-af", f"loudnorm=I=-24.6:LRA=11:TP=-3,afade=t=in:st=0:d=2.0,afade=t=out:st={total - 4:.2f}:d=4",
                    "-t", f"{total:.3f}", "-ar", "48000", "-ac", "2", wav], check=True)
    os.remove(mentah)
    print(f"musik.wav {total:.1f} dtk, {os.path.getsize(wav) / 1e6:.0f} MB")


if __name__ == "__main__":
    utama()
