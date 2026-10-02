"""
Berkas lampiran rekaan untuk diunggah ambil_ponsel.cjs saat memotret formulir
(foto "papan pengumuman" polos, tanpa EXIF). Isinya tidak pernah terlihat di
video — yang terpotret hanya nama berkas dan ukurannya di daftar lampiran.

    python lampiran_contoh.py   -> img/foto-papan-loket.jpg
"""
import os

import numpy as np
from PIL import Image, ImageDraw

DIR = os.path.dirname(os.path.abspath(__file__))


def main():
    rng = np.random.default_rng(7)
    h, w = 1200, 1600
    y = np.linspace(0, 1, h)[:, None]
    x = np.linspace(0, 1, w)[None, :]
    a = np.stack([180 + 40 * y + 0 * x, 170 + 30 * x + 0 * y, 150 + 20 * y * x], -1) + rng.normal(0, 9, (h, w, 3))
    im = Image.fromarray(np.clip(a, 0, 255).astype("uint8"))
    d = ImageDraw.Draw(im)
    d.rectangle([420, 260, 1180, 820], fill=(245, 243, 236), outline=(40, 40, 40), width=8)
    d.text((470, 300), "PENGUMUMAN", fill=(20, 20, 20))
    os.makedirs(os.path.join(DIR, "img"), exist_ok=True)
    keluar = os.path.join(DIR, "img", "foto-papan-loket.jpg")
    im.save(keluar, quality=88)
    print(keluar, os.path.getsize(keluar))


if __name__ == "__main__":
    main()
