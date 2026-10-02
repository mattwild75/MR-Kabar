"""Gabungkan frame smoke/f_*.jpg menjadi lembar kontak (diberi label detik)."""
import glob
import os
import sys

from PIL import Image, ImageDraw, ImageFont

DIR = os.path.dirname(os.path.abspath(__file__))
kolom = int(sys.argv[1]) if len(sys.argv) > 1 else 3
lebar = int(sys.argv[2]) if len(sys.argv) > 2 else 640
pola = sys.argv[3] if len(sys.argv) > 3 else "f_*.jpg"
fs = sorted(glob.glob(os.path.join(DIR, "smoke", pola)))
tinggi = lebar * 9 // 16
baris = (len(fs) + kolom - 1) // kolom
im = Image.new("RGB", (kolom * lebar, baris * tinggi), "black")
fon = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 22)
for i, f in enumerate(fs):
    x = Image.open(f).resize((lebar, tinggi))
    d = ImageDraw.Draw(x)
    lab = os.path.basename(f)[2:-4].lstrip("0") or "0"
    d.rectangle([0, 0, 90, 30], fill="black")
    d.text((6, 3), lab, fill="yellow", font=fon)
    im.paste(x, ((i % kolom) * lebar, (i // kolom) * tinggi))
keluar = os.path.join(DIR, "smoke", "_kontak.jpg")
im.save(keluar, quality=85)
print(keluar, len(fs))
