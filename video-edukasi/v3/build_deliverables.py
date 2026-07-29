"""
Turunkan berkas pendamping video dari timeline.json:

  chapters.json  — daftar bab + detiknya, dipakai daftar isi yang bisa diklik
                   di bawah pemutar (video 23 menit tanpa penanda bab menyiksa)
  subtitle.vtt   — subtitle sebagai TRACK terpisah, supaya bisa dimatikan;
                   berbeda dari .srt yang dibakar permanen ke berkas unduhan
  transkrip.txt  — naskah lengkap bertimestamp, bisa dibaca/dicari/dicetak
                   tanpa memutar videonya

Semua bersumber dari timeline.json yang sama dengan video, jadi tidak mungkin
melenceng dari apa yang sebenarnya diucapkan.
"""
import json
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

# scene -> (judul bab, ditampilkan sbg bab tersendiri?)
# Beberapa scene digabung jadi satu bab supaya daftar isinya tidak terlalu
# panjang; hanya scene PERTAMA tiap bab yang jadi penanda lompatan.
BAB = [
    ("s1",  "Pembuka"),
    ("s2",  "Apa itu risiko"),
    ("s3",  "Mengapa diperlukan"),
    ("s5",  "Siapa yang bertanggung jawab"),
    ("s7",  "Kapan dikerjakan"),
    ("s8",  "Lima tahap Perdep"),
    ("s9",  "Tahap 1 — Lingkungan Pengendalian (CEE)"),
    ("s10", "Tahap 2 — Penilaian Risiko: konteks"),
    ("s11", "Tahap 2 — Menulis pernyataan risiko"),
    ("s12", "Tahap 2 — Klasifikasi penyebab & kode risiko"),
    ("s13", "Tahap 2 — Kriteria dampak & kemungkinan"),
    ("s14", "Tahap 2 — Matriks 5×5 & prioritas"),
    ("s15", "Tahap 3 — Kegiatan Pengendalian (RTP)"),
    ("s16", "Tahap 3 — Empat titik skor"),
    ("s17", "Tahap 4 — Informasi & Komunikasi"),
    ("s18", "Tahap 5 — Pemantauan & pelaporan"),
    ("s21", "Fitur pendukung"),
    ("s22", "Contoh nyata: satu risiko dari awal"),
    ("s19", "Dashboard"),
    ("s20", "Penutup & langkah pertama Anda"),
]

# Siapa paling perlu menonton bagian mana
SASARAN = {
    "s5": "Pimpinan", "s7": "Pimpinan", "s8": "Semua",
    "s9": "PIC OPD", "s10": "PIC OPD", "s11": "PIC OPD", "s12": "PIC OPD",
    "s13": "PIC OPD", "s14": "PIC OPD", "s15": "PIC OPD", "s16": "PIC OPD",
    "s17": "Semua", "s18": "PIC OPD", "s21": "Admin", "s22": "Semua",
    "s19": "Pimpinan", "s20": "Semua",
}


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
    scenes = {s["id"]: s for s in tl["scenes"]}
    total = tl["total_duration"]

    # ── chapters.json ──
    chapters = []
    for i, (sid, judul) in enumerate(BAB):
        if sid not in scenes:
            raise KeyError(f"scene {sid} tidak ada di timeline")
        start = scenes[sid]["start"]
        end = scenes[BAB[i + 1][0]]["start"] if i + 1 < len(BAB) else total
        chapters.append({
            "id": sid,
            "judul": judul,
            "mulai": round(start, 1),
            "selesai": round(end, 1),
            "durasi": round(end - start, 1),
            "sasaran": SASARAN.get(sid, "Semua"),
        })
    with open(os.path.join(SCRIPT_DIR, "chapters.json"), "w", encoding="utf-8") as f:
        json.dump(chapters, f, indent=1, ensure_ascii=False)
    print(f"chapters.json : {len(chapters)} bab")

    # ── subtitle.vtt ──
    with open(os.path.join(SCRIPT_DIR, "subtitle.vtt"), "w", encoding="utf-8") as f:
        f.write("WEBVTT\n\n")
        for i, ln in enumerate(tl["lines"], start=1):
            f.write(f"{i}\n{ts_vtt(ln['start'])} --> {ts_vtt(ln['end'])}\n{ln['display']}\n\n")
    print(f"subtitle.vtt  : {len(tl['lines'])} baris")

    # ── transkrip.txt ──
    by_scene = {}
    for ln in tl["lines"]:
        by_scene.setdefault(ln["scene"], []).append(ln)
    out = ["TRANSKRIP — VIDEO EDUKASI MR KABAR",
           "Manajemen Risiko Pemerintah Kabupaten Aceh Barat",
           "Mengacu pada Perdep PPKD No. 4 Tahun 2019 dan PP 60 Tahun 2008 (SPIP)",
           f"Durasi {int(total // 60)} menit {int(total % 60)} detik · {len(tl['lines'])} kalimat",
           "", "=" * 78, ""]
    for ch in chapters:
        out.append(f"[{ts_short(ch['mulai'])}]  {ch['judul'].upper()}   (untuk: {ch['sasaran']})")
        out.append("-" * 78)
        # satu bab bisa mencakup beberapa scene berurutan
        i = [b[0] for b in BAB].index(ch["id"])
        sid_list = []
        semua = list(scenes.keys())
        mulai_idx = semua.index(ch["id"])
        akhir_idx = semua.index(BAB[i + 1][0]) if i + 1 < len(BAB) else len(semua)
        sid_list = semua[mulai_idx:akhir_idx]
        for sid in sid_list:
            for ln in by_scene.get(sid, []):
                out.append(f"  [{ts_short(ln['start'])}] {ln['display']}")
        out.append("")
    with open(os.path.join(SCRIPT_DIR, "transkrip.txt"), "w", encoding="utf-8") as f:
        f.write("\n".join(out))
    print(f"transkrip.txt : {len(out)} baris")


if __name__ == "__main__":
    main()
