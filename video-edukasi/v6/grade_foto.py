"""
Warnai ulang foto supaya senada dengan dunia ilustrasi video (sekali saja,
bukan filter CSS per frame — lebih cepat dirender dan hasilnya pasti sama).

  - foto lapangan: sedikit pudar, bayangan kebiruan laut, sorotan hangat
    (split-tone), kontras sedikit naik, vinyet lembut;
  - peta & litografi lama: warna kertas dipertahankan, hanya diseimbangkan.

    python grade_foto.py   -> foto/g_<nama>.jpg (lebar maks 2400)
"""
import os

import numpy as np
from PIL import Image, ImageEnhance

DIR = os.path.dirname(os.path.abspath(__file__))
F = os.path.join(DIR, "foto")

# nama -> (gaya, potong (kiri, atas, kanan, bawah) dalam pecahan atau None)
DAFTAR = {
    "senja_meulaboh": ("lapangan", None),
    "pelangi_meulaboh": ("lapangan", None),
    "pantai_meulaboh": ("lapangan", None),
    "masjid_meulaboh": ("lapangan", None),
    "jembatan_meulaboh": ("lapangan", None),
    "nelayan_aceh": ("lapangan", None),
    "nelayan_laweueng": ("lapangan", None),
    "tarik_pukat": ("lapangan", None),
    "perahu_aceh": ("lapangan", None),
    "perahu_usaid": ("lapangan", None),
    "badai_laut": ("malam", (0.0, 0.0, 1.0, 0.70)),   # buang pendar oranye di pojok bawah
    "lampulo": ("lapangan", None),
    "ikan_banda_aceh": ("lapangan", None),
    "tpi_kapal": ("lapangan", None),
    "mercusuar_breueh": ("kertas", (0.08, 0.06, 0.92, 0.80)),
    "peta_aceh": ("kertas", None),
    "peta_sumatra_barat": ("kertas", (0.30, 0.05, 0.98, 0.95)),
}


def split_tone(a: np.ndarray, bayang=(0.06, 0.16, 0.22), terang=(1.0, 0.80, 0.55), kuat=0.16) -> np.ndarray:
    lum = (0.299 * a[..., 0] + 0.587 * a[..., 1] + 0.114 * a[..., 2])[..., None]
    b = np.array(bayang)[None, None, :]
    t = np.array(terang)[None, None, :]
    warna = b * (1 - lum) + t * lum
    return a * (1 - kuat) + (a * 0.55 + warna * 0.45) * kuat * 2 * (0.5 + 0.5 * lum) + a * 0 * kuat


def vinyet(a: np.ndarray, kuat=0.42) -> np.ndarray:
    h, w = a.shape[:2]
    y, x = np.ogrid[-1:1:complex(h), -1:1:complex(w)]
    r = np.sqrt((x * 0.85) ** 2 + y ** 2)
    m = 1 - kuat * np.clip((r - 0.45) / 0.85, 0, 1) ** 1.6
    return a * m[..., None]


def proses(nama: str, gaya: str, potong):
    src = next(os.path.join(F, f) for f in os.listdir(F) if os.path.splitext(f)[0] == nama)
    im = Image.open(src).convert("RGB")
    if potong:
        W, H = im.size
        im = im.crop((int(potong[0] * W), int(potong[1] * H), int(potong[2] * W), int(potong[3] * H)))
    if im.width > 2400:
        im = im.resize((2400, round(im.height * 2400 / im.width)), Image.LANCZOS)
    if gaya == "kertas":
        im = ImageEnhance.Color(im).enhance(0.75)
        im = ImageEnhance.Contrast(im).enhance(1.12)
        a = np.asarray(im).astype(np.float32) / 255
        a = a * np.array([1.02, 0.97, 0.88])[None, None, :]
        a = vinyet(a, 0.35)
    else:
        im = ImageEnhance.Color(im).enhance(0.82 if gaya == "lapangan" else 0.9)
        im = ImageEnhance.Contrast(im).enhance(1.10)
        a = np.asarray(im).astype(np.float32) / 255
        a = split_tone(a)
        if gaya == "malam":
            a = a * np.array([0.88, 0.95, 1.08])[None, None, :]
        a = vinyet(a)
    out = Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8))
    out.save(os.path.join(F, f"g_{nama}.jpg"), quality=90)
    print(f"g_{nama}.jpg {out.size}")


if __name__ == "__main__":
    for n, (g, p) in DAFTAR.items():
        proses(n, g, p)
