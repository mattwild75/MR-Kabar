"""Menyesuaikan dokumen proyek sesudah video tutorial terpasang.

Angka durasi dan ukuran berkas diambil dari hasil yang benar-benar jadi,
bukan diketik tangan — supaya dokumennya tidak pernah menyebut angka yang
sudah tidak berlaku. Menolak berjalan sebelum videonya ada.
"""
import io
import json
import os
import subprocess

DIR = os.path.dirname(os.path.abspath(__file__))
AKAR = os.path.dirname(DIR)
PUB = os.path.join(AKAR, "public", "video")
VID = os.path.join(PUB, "tutorial-mr-kabar.mp4")

if not os.path.exists(VID):
    raise SystemExit("video belum terpasang di public/video - jalankan pasang.sh dulu")

d = float(subprocess.run(
    ["ffprobe", "-v", "error", "-show_entries", "format=duration",
     "-of", "default=nw=1:nk=1", VID],
    capture_output=True, text=True, check=True).stdout.strip())
menit, detik = int(d // 60), int(d % 60)
DURASI = f"{menit} menit {detik} detik"

total_mb = sum(
    os.path.getsize(os.path.join(PUB, f)) for f in os.listdir(PUB)
    if os.path.isfile(os.path.join(PUB, f))
) / 1024 / 1024
bab = json.load(io.open(os.path.join(DIR, "keluaran", "bab.json"), encoding="utf-8"))

print(f"durasi video tutorial : {DURASI}")
print(f"isi public/video      : {total_mb:.0f} MB")
print(f"jumlah bab            : {len(bab)}")

n = [0]


def sunting(nama, pasangan):
    p = os.path.join(AKAR, "docs", nama)
    s = io.open(p, encoding="utf-8").read()
    for lama, baru in pasangan:
        if lama not in s:
            print(f"  ! {nama}: jangkar tidak ketemu, dilewati")
            continue
        s = s.replace(lama, baru, 1)
        n[0] += 1
    io.open(p, "w", encoding="utf-8").write(s)
    print(f"  {nama} disunting")


sunting("CHECKLIST_GO_LIVE.md", [
    ("`public/video` berisi **266 MB** video & audio edukasi yang dilacak lewat Git\nLFS (10 berkas).",
     f"`public/video` berisi **{total_mb:.0f} MB** video & audio — edukasi dan tutorial\npengisian — yang dilacak lewat Git LFS."),
])

sunting("VERSI_DAN_SNAPSHOT.md", [
    ("""| v1.0.9 | selingan dibuang dari video sehingga durasinya 28 menit 45 detik, empat isian Perbup untuk Bagian Hukum dicetak merah, versi aplikasi tampil di kaki halaman masuk, dan seluruh rujukan menit ikut disesuaikan |""",
     f"""| v1.0.9 | selingan dibuang dari video sehingga durasinya 28 menit 45 detik, empat isian Perbup untuk Bagian Hukum dicetak merah, versi aplikasi tampil di kaki halaman masuk, dan seluruh rujukan menit ikut disesuaikan |
| v1.0.10 | video tutorial pengisian {DURASI} di kaki halaman Panduan: rekaman aplikasi sungguhan dari Data Umum sampai laporan, narasi dua suara, musik dari instrumen tersampel, dan dua model terhapus-lunak yang sebelumnya tidak pernah bisa dipulihkan |"""),
])

print(f"\n{n[0]} bagian dokumen disesuaikan")
