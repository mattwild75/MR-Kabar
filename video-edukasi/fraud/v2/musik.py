"""
Skor orisinal video edukasi Lapor Dugaan Kecurangan v2 — "Bunyikan Lonceng".

Mesin skornya sama dengan video edukasi utama v6 (lihat ../../v6/musik.py):
nada ditulis sebagai MIDI (midi.py) lalu dibunyikan FluidSynth memakai
soundfont MuseScore General. Yang berbeda hanya pemetaan suasana per babak:

  pembuka misteri (lambung dibor) -> cerita (definisi) -> tegang (segitiga
  kecurangan) -> dorong (tujuh wajah korupsi) -> analitis (membaca rembesan)
  -> misteri (mengapa kita diam) -> mengalir (melapor dengan benar) ->
  petualang (praktik di ponsel) -> agung (perlindungan) -> bangkit (setelah
  lonceng berbunyi) -> fajar & kredit (penutup).

"Tema Kabar" dinyatakan horn + paduan suara tepat saat judul BUNYIKAN
LONCENG muncul, dan dinyanyikan dalam D mayor di penutup.

    python musik.py   -> music_bg.wav (panjang = timeline, -24.6 LUFS)
"""
import json
import os
import subprocess

import midi

DIR = os.path.dirname(os.path.abspath(__file__))
ALAT = os.path.join(DIR, "..", "..", "..", "video-tutorial", "alat")
FLUID = os.path.join(ALAT, "fluidsynth", "fluidsynth-v2.5.7-win10-x64-glib", "bin", "fluidsynth.exe")
SF2 = os.path.join(ALAT, "MuseScore_General.sf3")

BPM = 76.0
TPQ = 480
DET = 60.0 / BPM            # detik per ketuk
BAR_D = DET * 4             # detik per birama


def tik(detik: float) -> int:
    return int(round(detik / DET * TPQ))


# Program General MIDI
DAWAI, DAWAI_LAMBAT, PIANO, HARPA, CELESTA, PIZZ, SELO, KONTRABAS, HORN, PADUAN, TIMPANI, PAD = 48, 49, 0, 46, 8, 45, 42, 43, 60, 52, 47, 89

AKOR = {  # (bas, susunan)
    "Dm": (38, [50, 53, 57, 62]), "Bb": (34, [50, 53, 58, 62]), "F": (41, [48, 53, 57, 60]),
    "C": (36, [48, 52, 55, 60]), "Gm": (43, [50, 55, 58, 62]), "A": (33, [49, 52, 57, 61]),
    "D": (38, [50, 54, 57, 62]), "G": (43, [50, 55, 59, 62]), "Bm": (35, [50, 54, 59, 62]),
    "Am": (45, [48, 52, 57, 60]), "Em": (40, [52, 55, 59, 64]), "Asus": (33, [50, 52, 57, 62]),
}

# Tema Kabar: (ketuk mulai, panjang ketuk, nada) — dua birama.
TEMA_MINOR = [(0, 1.5, 69), (1.5, 0.5, 74), (2, 1, 76), (3, 1, 77), (4, 3, 76), (7, 1, 74)]
TEMA_MAYOR = [(0, 1.5, 69), (1.5, 0.5, 74), (2, 1, 76), (3, 1, 78), (4, 2, 79), (6, 2, 78), (8, 4, 74)]

SUASANA = {
    #            progresi                       lapisan
    "misteri":  (["Dm", "Bb", "Gm", "A"],        dict(pad=1, kontrabas="panjang", piano="ostinato_jarang", keras=46)),
    "tegang":   (["Dm", "Dm", "Bb", "A"],        dict(pad=1, selo="denyut", kontrabas="panjang", piano="nada_tinggi", timpani="detak", keras=52)),
    "dorong":   (["Dm", "Bb", "F", "C"],         dict(pad=1, selo="denyut", kontrabas="jalan", piano="ostinato", keras=54)),
    "agung":    (["F", "Bb", "Dm", "C"],         dict(pad=1, horn="panjang", kontrabas="panjang", harpa="arpeggio", timpani="downbeat", keras=54)),
    "mengalir": (["F", "C", "Dm", "Bb"],         dict(pad=1, harpa="arpeggio", celesta="tema", kontrabas="panjang", keras=48)),
    "petualang": (["Dm", "F", "C", "Bb"],        dict(pad=1, piano="ostinato", horn="tema", kontrabas="jalan", keras=52)),
    "analitis": (["Am", "F", "C", "G"],          dict(pad=1, pizz="pola", celesta="tema", kontrabas="panjang", keras=46)),
    "bangkit":  (["Bb", "F", "C", "Dm"],         dict(pad=1, piano="ostinato", harpa="arpeggio", horn="panjang", kontrabas="jalan", timpani="downbeat", keras=56)),
    "cerita":   (["Dm", "Bb", "F", "C"],         dict(pad=1, piano="melodi", kontrabas="panjang", keras=48)),
    "fajar":    (["D", "A", "Bm", "G"],          dict(pad=1, paduan=1, horn="tema_mayor", harpa="arpeggio", kontrabas="panjang", piano="ostinato", keras=56)),
    "kredit":   (["D", "G", "Bm", "A"],          dict(pad=1, piano="melodi_mayor", kontrabas="panjang", keras=44)),
}
SUASANA_SCENE = {"s1": "misteri", "s2": "cerita", "s3": "tegang", "s4": "dorong", "s5": "analitis",
                 "s6": "misteri", "s7": "mengalir", "s8": "petualang", "s9": "agung", "s10": "bangkit", "s11": "fajar"}


class Skor:
    def __init__(self):
        self.t = {
            "dawai": midi.Trek(0, DAWAI_LAMBAT, "dawai"), "piano": midi.Trek(1, PIANO, "piano"),
            "harpa": midi.Trek(2, HARPA, "harpa"), "celesta": midi.Trek(3, CELESTA, "celesta"),
            "pizz": midi.Trek(4, PIZZ, "pizz"), "selo": midi.Trek(5, SELO, "selo"),
            "kontrabas": midi.Trek(6, KONTRABAS, "kontrabas"), "horn": midi.Trek(7, HORN, "horn"),
            "paduan": midi.Trek(8, PADUAN, "paduan"), "drum": midi.Trek(9, 0, "perkusi"),
            "timpani": midi.Trek(10, TIMPANI, "timpani"), "pad": midi.Trek(11, PAD, "pad"),
        }

    def n(self, trek, detik, panjang_detik, nada, keras):
        self.t[trek].not_(tik(detik), max(1, tik(panjang_detik)), nada, keras)

    def segmen(self, a: float, b: float, nama: str, pudar_awal: bool = True):
        prog, L = SUASANA[nama]
        k = L["keras"]
        nbar = int((b - a) / BAR_D + 0.999)
        for i in range(nbar):
            t = a + i * BAR_D
            sisa = min(BAR_D, b - t)
            if sisa <= 0.2:
                break
            bas, akor = AKOR[prog[i % len(prog)]]
            ke = k - (8 if (i == 0 and pudar_awal) else 0)
            # alas dawai + pad
            if L.get("pad"):
                self.n("dawai", t, sisa - 0.05, akor[0] - 12, ke - 14)
                for x in akor[1:3]:
                    self.n("dawai", t, sisa - 0.05, x, ke - 16)
                self.n("pad", t, sisa - 0.05, akor[2], ke - 30)
            if L.get("paduan"):
                for x in akor[:3]:
                    self.n("paduan", t, sisa - 0.05, x + 12, ke - 22)
            # bas
            if L.get("kontrabas") == "panjang":
                self.n("kontrabas", t, sisa - 0.05, bas, ke - 8)
            elif L.get("kontrabas") == "jalan":
                for j, d in enumerate([0, 7, 12, 7]):
                    if j * DET < sisa:
                        self.n("kontrabas", t + j * DET, DET * 0.9, bas + d, ke - 8 - (j % 2) * 6)
            # selo denyut (delapanan)
            if L.get("selo") == "denyut":
                for j in range(8):
                    if j * DET / 2 < sisa:
                        self.n("selo", t + j * DET / 2, DET / 2 * 0.8, bas + 12 + (7 if j in (3, 7) else 0), ke - 16 + (4 if j % 2 == 0 else 0))
            # piano
            p = L.get("piano")
            if p == "ostinato":
                pola = [0, 2, 1, 3, 2, 1, 3, 2]
                for j, q in enumerate(pola):
                    if j * DET / 2 < sisa:
                        self.n("piano", t + j * DET / 2, DET / 2 * 0.9, akor[q] + 12, ke - 20 + (5 if j % 4 == 0 else 0))
            elif p == "ostinato_jarang":
                for j, q in enumerate([0, 2, 3, 2]):
                    if j * DET < sisa:
                        self.n("piano", t + j * DET, DET * 0.95, akor[q] + 12, ke - 20)
            elif p == "nada_tinggi":
                self.n("piano", t, DET * 2, akor[3] + 12, ke - 18)
                if 2 * DET < sisa:
                    self.n("piano", t + 2 * DET, DET * 2, akor[2] + 12, ke - 24)
            elif p in ("melodi", "melodi_mayor"):
                frasa = [[(0, 1, 3), (1, 1, 2), (2, 2, 1)], [(0, 2, 2), (2, 1, 3), (3, 1, 2)]][i % 2]
                for ketuk, pj, q in frasa:
                    if ketuk * DET < sisa:
                        self.n("piano", t + ketuk * DET, pj * DET * 0.95, akor[q] + 12, ke - 12)
                self.n("piano", t, sisa, akor[0], ke - 22)
            # harpa arpeggio naik (dua oktaf)
            if L.get("harpa") == "arpeggio":
                nada = akor + [x + 12 for x in akor]
                for j, x in enumerate(nada):
                    if j * DET / 2 < sisa:
                        self.n("harpa", t + j * DET / 2, DET * 1.5, x, ke - 18)
            # pizzicato pola
            if L.get("pizz") == "pola":
                for j, q in enumerate([0, 2, 3, 2, 1, 2, 3, 2]):
                    if j * DET / 2 < sisa:
                        self.n("pizz", t + j * DET / 2, DET / 3, akor[q], ke - 12 + (6 if j % 4 == 0 else 0))
            # horn
            h = L.get("horn")
            if h == "panjang" and i % 2 == 0:
                self.n("horn", t, min(sisa, BAR_D * 2) - 0.1, akor[2], ke - 14)
            # timpani
            tp = L.get("timpani")
            if tp == "downbeat":
                self.n("timpani", t, DET, bas if bas >= 36 else bas + 12, ke - 6)
            elif tp == "detak" and i % 2 == 1:
                self.n("timpani", t + 3 * DET, DET * 0.5, 38, ke - 18)
                self.n("timpani", t + 3.5 * DET, DET * 0.5, 38, ke - 14)
            # tema: tiap 4 birama, mulai birama ke-2
            if i % 4 == 1:
                if L.get("celesta") == "tema":
                    self.tema("celesta", t, TEMA_MINOR if nama != "mengalir" else [(a_, b_, c_ - 5) for a_, b_, c_ in TEMA_MINOR], ke - 8, b)
                if h == "tema":
                    self.tema("horn", t, [(a_, b_, c_ - 12) for a_, b_, c_ in TEMA_MINOR], ke - 6, b)
                if h == "tema_mayor":
                    self.tema("horn", t, [(a_, b_, c_ - 12) for a_, b_, c_ in TEMA_MAYOR], ke - 4, b)
                    self.tema("paduan", t, TEMA_MAYOR, ke - 16, b)

    def tema(self, trek, t, tema, keras, batas):
        for ketuk, pj, nada in tema:
            mulai = t + ketuk * DET
            if mulai + 0.2 < batas:
                self.n(trek, mulai, min(pj * DET * 0.97, batas - mulai), nada, keras)

    def aksen(self, t: float, kuat: int = 60, gulung: float = 1.6, akor: str = "Dm"):
        """Gulungan timpani menuju pukulan di detik t + simbal + akor dawai pendek."""
        n = int(gulung / 0.07)
        for j in range(n):
            u = j / max(1, n - 1)
            self.n("timpani", t - gulung + j * 0.07, 0.08, 38, int(18 + (kuat - 18) * u * 0.8))
        self.n("timpani", t, 1.2, 38, kuat + 8)
        self.n("drum", t, 2.5, 49, kuat - 10)        # simbal crash
        self.n("drum", t, 0.4, 35, kuat)             # bas drum akustik
        bas, susunan = AKOR[akor]
        self.n("kontrabas", t, 2.2, bas, kuat - 6)
        for x in susunan:
            self.n("dawai", t, 2.4, x, kuat - 14)

    def judul(self, t: float):
        """Pernyataan tema oleh horn + paduan suara pada judul MR KABAR."""
        self.aksen(t, 72, 2.2, "Dm")
        self.tema("horn", t + 0.4, [(a, b, c - 12) for a, b, c in TEMA_MINOR], 70, t + 9)
        self.tema("paduan", t + 0.4, TEMA_MINOR, 50, t + 9)
        for j, x in enumerate([50, 53, 57, 62, 65, 69]):
            self.n("harpa", t + 0.1 + j * 0.09, 2.5, x, 52)


def utama():
    tl = json.load(open(os.path.join(DIR, "timeline.json"), encoding="utf-8"))
    total = tl["total_duration"]
    s = Skor()
    adegan = tl["scenes"]
    ln = {l["id"]: l for l in tl["lines"]}
    for sc in adegan:
        mulai = sc["start"] + (0.0 if sc["id"] == "s1" else 1.2)   # kartu: aksen dulu, suasana menyusul
        akhir = sc["end"]
        if sc["id"] == "s11":
            akhir_narasi = ln[95]["end"]   # "MR Kabar. Risiko TerKabar, Daerah Terjaga."
            s.segmen(mulai, akhir_narasi + 1.0, "fajar")
            s.segmen(akhir_narasi + 1.0, total - 2.0, "kredit")
        else:
            s.segmen(mulai, akhir, SUASANA_SCENE[sc["id"]], pudar_awal=sc["id"] != "s1")
    # aksen tiap kartu babak
    akor_babak = {"s2": "Dm", "s3": "Dm", "s4": "Dm", "s5": "Am", "s6": "Dm", "s7": "F", "s8": "Dm", "s9": "F",
                  "s10": "Bb", "s11": "D"}
    for c in tl["cards"]:
        s.aksen(c["start"] + 0.25, 58, 1.4, akor_babak[c["scene"]])
    # judul BUNYIKAN LONCENG muncul 0,35 dtk sesudah kalimat 5 selesai
    s.judul(ln[5]["end"] + 0.35)
    # akor akhir
    bas, akor = AKOR["D"]
    s.n("kontrabas", total - 2.0, 3.0, bas, 40)
    for x in akor:
        s.n("dawai", total - 2.0, 3.0, x, 34)

    mid = os.path.join(DIR, "musik.mid")
    mentah = os.path.join(DIR, "musik_mentah.wav")
    wav = os.path.join(DIR, "music_bg.wav")
    midi.tulis(mid, list(s.t.values()), BPM, TPQ)
    subprocess.run([FLUID, "-ni", "-F", mentah, "-r", "48000", "-g", "0.6",
                    "-o", "synth.reverb.room-size=0.86", "-o", "synth.reverb.level=0.62",
                    "-o", "synth.reverb.width=0.9", "-o", "synth.chorus.active=0", SF2, mid],
                   check=True, capture_output=True)
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", mentah,
                    "-af", f"loudnorm=I=-24.6:LRA=11:TP=-3,afade=t=in:st=0:d=2.5,afade=t=out:st={total - 4:.2f}:d=4",
                    "-t", f"{total:.3f}", "-ar", "48000", "-ac", "2", wav], check=True)
    os.remove(mentah)
    print(f"music_bg.wav {total:.1f} dtk, {os.path.getsize(wav) / 1e6:.1f} MB")


if __name__ == "__main__":
    utama()
