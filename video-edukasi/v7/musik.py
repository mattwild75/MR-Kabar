"""
Musik orisinal v7 "Berlayar dengan Peta Risiko" (paper cut): lebih ringan
dan bermain daripada v6 — pizzicato, marimba, harpa, celesta, suling, dawai.

Not ditulis sebagai MIDI (../v6/midi.py) lalu dibunyikan FluidSynth dengan
soundfont MuseScore General (rekaman instrumen sungguhan).

Susunan mengikuti isyarat MUSIK dari animasi (isyarat.json, diekspor rakit.cjs):
adegan yang punya isyarat memakai isyarat itu; adegan lain memakai suasana
bawaan SUASANA_ADEGAN, dimulai sesudah aksen kartu babak.

    python musik.py   -> musik_latar.wav (panjang = timeline, -24.6 LUFS)
"""
import importlib.util
import json
import os
import subprocess

DIR = os.path.dirname(os.path.abspath(__file__))
V6 = os.path.join(DIR, "..", "v6")
spek = importlib.util.spec_from_file_location("midi", os.path.join(V6, "midi.py"))
midi = importlib.util.module_from_spec(spek)
spek.loader.exec_module(midi)
from suara import FFMPEG  # noqa: E402

ALAT = os.path.join(DIR, "..", "..", "video-tutorial", "alat")
FLUID = os.path.join(ALAT, "fluidsynth", "fluidsynth-v2.5.7-win10-x64-glib", "bin", "fluidsynth.exe")
SF2 = os.path.join(ALAT, "MuseScore_General.sf3")

BPM = 92.0
TPQ = 480
DET = 60.0 / BPM
BAR_D = DET * 4


def tik(detik: float) -> int:
    return int(round(detik / DET * TPQ))


DAWAI, PIANO, HARPA, CELESTA, PIZZ, SELO, KONTRABAS, HORN, PADUAN, TIMPANI, PAD, MARIMBA, SULING, GITAR, GLOCK = \
    48, 0, 46, 8, 45, 42, 43, 60, 52, 47, 89, 12, 73, 24, 9

AKOR = {
    "Dm": (38, [50, 53, 57, 62]), "Bb": (34, [50, 53, 58, 62]), "F": (41, [48, 53, 57, 60]),
    "C": (36, [48, 52, 55, 60]), "Gm": (43, [50, 55, 58, 62]), "A": (33, [49, 52, 57, 61]),
    "D": (38, [50, 54, 57, 62]), "G": (43, [50, 55, 59, 62]), "Bm": (35, [50, 54, 59, 62]),
    "Am": (45, [48, 52, 57, 60]), "Em": (40, [52, 55, 59, 64]), "E": (40, [52, 56, 59, 64]),
}
# Tema "peta": enam nada naik-turun seperti ombak (ketuk, panjang, nada) dalam D mayor
TEMA = [(0, 1, 74), (1, 0.5, 76), (1.5, 0.5, 78), (2, 1.5, 81), (3.5, 0.5, 78), (4, 2, 76), (6, 2, 74)]

SUASANA = {
    "badai":      (["Dm", "Bb", "Gm", "A"], dict(tremolo=1, kontrabas="panjang", timpani="gulung", keras=56)),
    "senyap":     ([], dict(keras=0)),
    "dermaga":    (["D", "A", "Bm", "G"], dict(pizz="pola", marimba="ostinato", suling="tema", kontrabas="jalan", keras=50)),
    "cerita":     (["F", "C", "Dm", "Bb"], dict(harpa="arpeggio", pad=1, pizz="jarang", kontrabas="panjang", keras=44)),
    "aturan":     (["Dm", "Bb", "F", "C"], dict(pad=1, piano="ostinato", kontrabas="panjang", keras=44)),
    "kemudi":     (["F", "Bb", "C", "F"], dict(pad=1, horn="panjang", harpa="arpeggio", kontrabas="panjang", keras=48)),
    "pasang":     (["C", "G", "Am", "F"], dict(marimba="ostinato", pizz="jarang", kontrabas="panjang", keras=44)),
    "periksa":    (["Am", "F", "C", "G"], dict(pizz="pola", celesta="tema", kontrabas="panjang", keras=42)),
    "peta":       (["Dm", "F", "C", "Bb"], dict(celesta="tema", harpa="arpeggio", pad=1, kontrabas="panjang", keras=42)),
    "ombak":      (["G", "D", "Em", "C"], dict(pizz="pola", marimba="ostinato", kontrabas="jalan", keras=44)),
    "layar":      (["Bb", "F", "C", "Dm"], dict(piano="ostinato", horn="panjang", kontrabas="jalan", keras=48)),
    "lonceng":    (["Dm", "Bb", "Gm", "A"], dict(celesta="tema", pad=1, kontrabas="panjang", keras=40)),
    "perjalanan": (["D", "A", "Bm", "G"], dict(gitar="petik", harpa="arpeggio", kontrabas="panjang", keras=44)),
    "kemenangan": (["D", "G", "A", "D"], dict(pad=1, paduan=1, horn="tema", harpa="arpeggio", kontrabas="jalan", timpani="downbeat", keras=54)),
    "kredit":     (["D", "G", "Bm", "A"], dict(piano="melodi", gitar="petik", kontrabas="panjang", keras=42)),
}
SUASANA_ADEGAN = {"s2": "cerita", "s3": "aturan", "s4": "kemudi", "s5": "pasang", "s6": "periksa", "s7": "peta",
                  "s8": "ombak", "s9": "layar", "s10": "lonceng", "s11": "perjalanan", "s12": "kemenangan"}
AKOR_KARTU = {"s2": "F", "s3": "Dm", "s4": "F", "s5": "C", "s6": "Am", "s7": "Dm", "s8": "G", "s9": "Bb", "s10": "Dm", "s11": "D", "s12": "D"}


class Skor:
    def __init__(self):
        nama = [("dawai", DAWAI), ("piano", PIANO), ("harpa", HARPA), ("celesta", CELESTA), ("pizz", PIZZ), ("selo", SELO),
                ("kontrabas", KONTRABAS), ("horn", HORN), ("paduan", PADUAN), ("drum", 0), ("timpani", TIMPANI), ("pad", PAD),
                ("marimba", MARIMBA), ("suling", SULING), ("gitar", GITAR), ("glock", GLOCK)]
        self.t = {}
        kanal = 0
        for n, prog in nama:
            k = 9 if n == "drum" else kanal
            if n != "drum":
                kanal += 1
                if kanal == 9:
                    kanal = 10
            self.t[n] = midi.Trek(k, prog, n)

    def n(self, trek, detik, panjang, nada, keras):
        if keras > 0:
            self.t[trek].not_(tik(detik), max(1, tik(panjang)), nada, keras)

    def tema(self, trek, t, keras, batas, geser=0):
        for ketuk, pj, nada in TEMA:
            m = t + ketuk * DET
            if m + 0.15 < batas:
                self.n(trek, m, min(pj * DET * 0.95, batas - m), nada + geser, keras)

    def segmen(self, a, b, nama, pudar=True):
        prog, L = SUASANA[nama]
        k = L["keras"]
        if not prog or k <= 0:
            return
        nbar = int((b - a) / BAR_D + 0.999)
        for i in range(nbar):
            t = a + i * BAR_D
            sisa = min(BAR_D, b - t)
            if sisa <= 0.2:
                break
            bas, akor = AKOR[prog[i % len(prog)]]
            ke = k - (8 if i == 0 and pudar else 0)
            if L.get("pad"):
                self.n("dawai", t, sisa - 0.05, akor[0] - 12, ke - 16)
                self.n("dawai", t, sisa - 0.05, akor[2], ke - 18)
                self.n("pad", t, sisa - 0.05, akor[1], ke - 30)
            if L.get("tremolo"):
                for j in range(16):
                    if j * DET / 4 < sisa:
                        for x in (akor[0] - 12, akor[1] - 12):
                            self.n("dawai", t + j * DET / 4, DET / 4 * 0.9, x, ke - 14 + (6 if j % 4 == 0 else 0))
            if L.get("paduan"):
                for x in akor[:3]:
                    self.n("paduan", t, sisa - 0.05, x + 12, ke - 22)
            kb = L.get("kontrabas")
            if kb == "panjang":
                self.n("kontrabas", t, sisa - 0.05, bas, ke - 10)
            elif kb == "jalan":
                for j, d in enumerate([0, 7, 12, 7]):
                    if j * DET < sisa:
                        self.n("kontrabas", t + j * DET, DET * 0.85, bas + d, ke - 10 - (j % 2) * 6)
            pz = L.get("pizz")
            if pz == "pola":
                for j, q in enumerate([0, 2, 3, 2, 1, 2, 3, 2]):
                    if j * DET / 2 < sisa:
                        self.n("pizz", t + j * DET / 2, DET / 3, akor[q], ke - 12 + (6 if j % 4 == 0 else 0))
            elif pz == "jarang":
                for j, q in enumerate([0, 2, 1, 3]):
                    if j * DET < sisa:
                        self.n("pizz", t + j * DET, DET / 3, akor[q], ke - 14)
            if L.get("marimba") == "ostinato":
                for j, q in enumerate([0, 2, 3, 2, 0, 3, 2, 3]):
                    if j * DET / 2 < sisa:
                        self.n("marimba", t + j * DET / 2, DET / 2, akor[q] + 12, ke - 14 + (5 if j % 4 == 0 else 0))
            p = L.get("piano")
            if p == "ostinato":
                for j, q in enumerate([0, 2, 1, 3, 2, 1, 3, 2]):
                    if j * DET / 2 < sisa:
                        self.n("piano", t + j * DET / 2, DET / 2 * 0.9, akor[q] + 12, ke - 20 + (5 if j % 4 == 0 else 0))
            elif p == "melodi":
                for ketuk, pj, q in [[(0, 1, 3), (1, 1, 2), (2, 2, 1)], [(0, 2, 2), (2, 1, 3), (3, 1, 2)]][i % 2]:
                    if ketuk * DET < sisa:
                        self.n("piano", t + ketuk * DET, pj * DET * 0.95, akor[q] + 12, ke - 12)
            if L.get("harpa") == "arpeggio":
                for j, x in enumerate(akor + [x + 12 for x in akor]):
                    if j * DET / 2 < sisa:
                        self.n("harpa", t + j * DET / 2, DET * 1.5, x, ke - 18)
            if L.get("gitar") == "petik":
                for j, q in enumerate([0, 2, 3, 1, 2, 3, 2, 1]):
                    if j * DET / 2 < sisa:
                        self.n("gitar", t + j * DET / 2, DET, akor[q], ke - 12)
            h = L.get("horn")
            if h == "panjang" and i % 2 == 0:
                self.n("horn", t, min(sisa, BAR_D * 2) - 0.1, akor[2], ke - 14)
            tp = L.get("timpani")
            if tp == "downbeat":
                self.n("timpani", t, DET, bas if bas >= 36 else bas + 12, ke - 8)
            elif tp == "gulung" and i % 2 == 1:
                for j in range(10):
                    self.n("timpani", t + 2 * DET + j * DET * 0.2, DET * 0.2, 38, ke - 24 + j * 2)
            if i % 4 == 1:
                if L.get("celesta") == "tema":
                    self.tema("celesta", t, ke - 6, b, geser=-12 if prog[0] in ("Dm", "Am") else 0)
                if L.get("suling") == "tema":
                    self.tema("suling", t, ke - 4, b)
                if h == "tema":
                    self.tema("horn", t, ke - 4, b, geser=-12)
                    self.tema("paduan", t, ke - 18, b)

    def aksen(self, t, kuat=56, akor="D"):
        """Kartu babak: guntingan kertas = pizzicato naik + glockenspiel + akor pendek."""
        bas, susunan = AKOR[akor]
        for j, x in enumerate(susunan + [susunan[0] + 12]):
            self.n("pizz", t - 0.45 + j * 0.09, 0.25, x, kuat - 14)
            self.n("glock", t + j * 0.07, 0.6, x + 24, kuat - 18)
        self.n("timpani", t, 0.9, bas if bas >= 36 else bas + 12, kuat - 4)
        self.n("drum", t, 1.6, 49, kuat - 20)
        self.n("kontrabas", t, 1.6, bas, kuat - 8)
        for x in susunan:
            self.n("dawai", t, 1.6, x, kuat - 18)

    def judul(self, t):
        self.aksen(t, 66, "D")
        self.tema("horn", t + 0.3, 66, t + 6.5, geser=-12)
        self.tema("glock", t + 0.3, 50, t + 6.5, geser=12)
        for j, x in enumerate([50, 54, 57, 62, 66, 69, 74]):
            self.n("harpa", t + 0.1 + j * 0.08, 2.5, x, 50)


def utama():
    tl = json.load(open(os.path.join(DIR, "timeline.json"), encoding="utf-8"))
    isy = json.load(open(os.path.join(DIR, "isyarat.json"), encoding="utf-8"))
    total = tl["total_duration"]
    cues = sorted(isy["musik"], key=lambda c: c["t"])
    s = Skor()
    for sc in tl["scenes"]:
        a0, b0 = sc["start"], sc["end"]
        dalam = [c for c in cues if a0 <= c["t"] < b0]
        if sc.get("kartu"):
            s.aksen(sc["kartu"]["start"] + 0.3, 56, AKOR_KARTU.get(sc["id"], "D"))
        if not dalam:
            mulai = sc["kartu"]["end"] - 0.6 if sc.get("kartu") else a0
            s.segmen(mulai, b0, SUASANA_ADEGAN.get(sc["id"], "cerita"))
            continue
        for i, c in enumerate(dalam):
            akhir = dalam[i + 1]["t"] if i + 1 < len(dalam) else b0
            if c["nama"] == "judul":
                s.judul(c["t"])
                continue
            s.segmen(c["t"], akhir, c["nama"], pudar=not c.get("lanjut"))
    bas, akor = AKOR["D"]
    s.n("kontrabas", total - 2.5, 3.0, bas, 40)
    for x in akor:
        s.n("dawai", total - 2.5, 3.0, x, 34)

    mid = os.path.join(DIR, "musik.mid")
    mentah = os.path.join(DIR, "musik_mentah.wav")
    wav = os.path.join(DIR, "musik_latar.wav")
    midi.tulis(mid, list(s.t.values()), BPM, TPQ)
    subprocess.run([FLUID, "-ni", "-F", mentah, "-r", "48000", "-g", "0.6",
                    "-o", "synth.reverb.room-size=0.7", "-o", "synth.reverb.level=0.5",
                    "-o", "synth.reverb.width=0.9", "-o", "synth.chorus.active=0", SF2, mid],
                   check=True, capture_output=True)
    subprocess.run([FFMPEG, "-y", "-v", "error", "-i", mentah,
                    "-af", f"loudnorm=I=-24.6:LRA=11:TP=-3,afade=t=out:st={total - 4:.2f}:d=4",
                    "-t", f"{total:.3f}", "-ar", "48000", "-ac", "2", wav], check=True)
    os.remove(mentah)
    print(f"musik_latar.wav {total:.1f} dtk")


if __name__ == "__main__":
    utama()
