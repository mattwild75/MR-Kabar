"""
Turunkan berkas pendamping video dari timeline.json:

  subtitle.vtt   -- subtitle sebagai TRACK terpisah, supaya bisa dimatikan
                    penonton; berbeda dari .srt yang dibakar ke berkas 720p
  transkrip.txt  -- naskah lengkap bertimestamp per bab

Keduanya bersumber dari timeline.json yang sama dengan video, jadi tidak
mungkin melenceng dari yang sebenarnya diucapkan. Tidak ada chapters.json:
halaman pemutarnya (lapor-kejadian/VideoKecurangan.tsx) menulis daftar isi
sendiri karena hanya delapan bab dan tidak dinavigasi per bab.
"""
import json
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

BAB = [
    ("s1", "Pembuka"),
    ("s2", "Apa itu kecurangan"),
    ("s3", "Beda dengan kejadian risiko"),
    ("s4", "Tujuh bentuk kecurangan (UU No. 31/1999 jo. UU No. 20/2001)"),
    ("s5", "Tanda yang patut diwaspadai"),
    ("s6", "Dasar hukum dan pintu lapor"),
    ("s7", "Cara melapor"),
    ("s8", "Amankah saya? Perlindungan pelapor"),
    ("s9", "Setelah laporan terkirim"),
    ("s10", "Penutup"),
]


def ts_vtt(sec):
    ms = int(round(sec * 1000))
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d}.{ms:03d}"


def ts_short(sec):
    m, s = divmod(int(sec), 60)
    return f"{m}:{s:02d}"


def main():
    with open(os.path.join(SCRIPT_DIR, "timeline.json"), encoding="utf-8") as f:
        tl = json.load(f)
    total = tl["total_duration"]

    with open(os.path.join(SCRIPT_DIR, "subtitle.vtt"), "w", encoding="utf-8") as f:
        f.write("WEBVTT\n\n")
        for i, ln in enumerate(tl["lines"], start=1):
            f.write(f"{i}\n{ts_vtt(ln['start'])} --> {ts_vtt(ln['end'])}\n{ln['display']}\n\n")
    print(f"subtitle.vtt  : {len(tl['lines'])} baris")

    by_scene = {}
    for ln in tl["lines"]:
        by_scene.setdefault(ln["scene"], []).append(ln)
    out = ["TRANSKRIP - VIDEO EDUKASI LAPOR DUGAAN KECURANGAN",
           "MR Kabar - Inspektorat Kabupaten Aceh Barat",
           "Mengacu pada UU No. 31/1999 jo. UU No. 20/2001 dan Perbup Aceh Barat No. 6/2025",
           f"Durasi {int(total // 60)} menit {int(total % 60)} detik - {len(tl['lines'])} kalimat",
           "", "=" * 78, ""]
    for sid, judul in BAB:
        baris = by_scene.get(sid, [])
        if not baris:
            continue
        out.append(f"[{ts_short(baris[0]['start'])}]  {judul.upper()}")
        out.append("-" * 78)
        for ln in baris:
            out.append(f"  [{ts_short(ln['start'])}] {ln['display']}")
        out.append("")
    with open(os.path.join(SCRIPT_DIR, "transkrip.txt"), "w", encoding="utf-8") as f:
        f.write("\n".join(out))
    print(f"transkrip.txt : {len(out)} baris")


if __name__ == "__main__":
    main()
