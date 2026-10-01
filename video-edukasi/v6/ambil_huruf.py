"""Unduh huruf (SIL Open Font License) dari repositori google/fonts ke fonts/.

    python ambil_huruf.py
"""
import os
import subprocess

DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fonts")
HURUF = {
    "BebasNeue-Regular.ttf": "ofl/bebasneue/BebasNeue-Regular.ttf",
    "PlusJakartaSans[wght].ttf": "ofl/plusjakartasans/PlusJakartaSans%5Bwght%5D.ttf",
    "PlayfairDisplay-Italic[wght].ttf": "ofl/playfairdisplay/PlayfairDisplay-Italic%5Bwght%5D.ttf",
    "JetBrainsMono[wght].ttf": "ofl/jetbrainsmono/JetBrainsMono%5Bwght%5D.ttf",
}
os.makedirs(DIR, exist_ok=True)
for nama, jalur in HURUF.items():
    subprocess.run(["curl", "-sSLk", "--max-time", "120", "-o", os.path.join(DIR, nama),
                    "https://github.com/google/fonts/raw/main/" + jalur], check=True)
    print("OK", nama)
