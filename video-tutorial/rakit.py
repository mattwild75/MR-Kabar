"""Merakit hasil rekaman menjadi satu video tutorial utuh.

Yang dikerjakan berurutan:
  1. mengukur lama tiap bagian hasil rekaman
  2. menyusun GARIS WAKTU MUTLAK: tiap kalimat narasi ditaruh pada detik
     keberapa di video akhir
  3. membangun satu jalur narasi dari 276 berkas mp3, ditaruh tepat pada
     detiknya
  4. membuat subtitle dan daftar bab dari garis waktu yang sama
  5. menyambung video antar bagian, mencampur narasi dengan musik yang
     otomatis mengecil saat ada suara, lalu mengeluarkan mp4

Kuncinya langkah 2. Karena pengendali sudah MENAHAN tiap langkah sampai
narasinya habis saat merekam, gambar dan suara sudah sejajar sejak awal —
tidak ada satu pun yang perlu digeser tangan di sini.
"""
import io
import json
import os
import subprocess
import sys

import numpy as np

DIR = os.path.dirname(os.path.abspath(__file__))
REKAM = os.path.join(DIR, "rekam")
AUDIO = os.path.join(DIR, "audio")
KELUAR = os.path.join(DIR, "keluaran")
SR = 44100
URUTAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"]
NASKAH = "naskah.json"
AWALAN = ""          # awalan berkas rekaman, mengikuti nama naskah
NAMA = "tutorial"    # awalan berkas keluaran


def jalankan(perintah, **kw):
    return subprocess.run(perintah, check=True, capture_output=True, text=True, **kw)


def durasi(path):
    k = jalankan(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                  "-of", "default=nw=1:nk=1", path])
    return float(k.stdout.strip())


def baca_pcm(path):
    """Decode berkas audio jadi larik float mono 44,1 kHz."""
    k = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", path, "-f", "f32le", "-ac", "1",
         "-ar", str(SR), "-"],
        check=True, capture_output=True,
    )
    return np.frombuffer(k.stdout, dtype=np.float32)


def waktu_srt(d):
    j, s = divmod(d, 3600)
    m, s = divmod(s, 60)
    return f"{int(j):02d}:{int(m):02d}:{int(s):02d},{int((s % 1) * 1000):03d}"


def waktu_vtt(d):
    j, s = divmod(d, 3600)
    m, s = divmod(s, 60)
    return f"{int(j):02d}:{int(m):02d}:{s:06.3f}".replace(".", ".")


def utama():
    os.makedirs(KELUAR, exist_ok=True)
    # Bisa dibatasi ke sebagian bagian, untuk menguji seluruh pipa perakitan
    # tanpa menunggu kesepuluh bagian selesai direkam.
    global URUTAN, NASKAH, AWALAN, NAMA
    if "--naskah" in sys.argv:
        NASKAH = sys.argv[sys.argv.index("--naskah") + 1]
        AWALAN = NASKAH.replace("naskah-", "").replace(".json", "") + "-"
        NAMA = AWALAN.rstrip("-")
        # Bagiannya diambil dari naskah itu sendiri, bukan dari daftar tetap.
        URUTAN = [b["nomor"] for b in json.load(
            io.open(os.path.join(DIR, NASKAH), encoding="utf-8"))["bagian"]]
    if "--bagian" in sys.argv:
        URUTAN = sys.argv[sys.argv.index("--bagian") + 1].split(",")
    print(f"naskah: {NASKAH}  bagian: {', '.join(URUTAN)}")
    naskah = json.load(io.open(os.path.join(DIR, NASKAH), encoding="utf-8"))
    lama_narasi = json.load(io.open(os.path.join(AUDIO, "waktu.json"), encoding="utf-8"))

    # Kalimat narasi per langkah, menurut urutan naskah.
    per_langkah = {}
    judul_bagian = {}
    for b in naskah["bagian"]:
        judul_bagian[b["nomor"]] = b["judul"]
        for l in b["langkah"]:
            per_langkah[l["id"]] = l.get("narasi", [])

    # ── 1: tiap bagian di-encode LEBIH DULU, satu per satu ───────────────────
    #
    # Berkas rekaman ber-laju bingkai tidak tetap; begitu di-encode menjadi 30
    # bingkai per detik, durasinya bisa bergeser sepersekian detik. Kalau
    # narasi ditempatkan memakai durasi berkas rekaman sedangkan videonya
    # memakai durasi hasil encode, selisih kecil itu MENUMPUK sepanjang sepuluh
    # bagian dan di ujung video suaranya melenceng beberapa detik dari
    # gambarnya. Karena itu yang diukur hasil encode-nya, bukan rekamannya.
    print("meng-encode tiap bagian (butuh waktu)...")
    for nomor in URUTAN:
        vid = os.path.join(REKAM, f"{AWALAN}bagian-{nomor}.webm")
        if not os.path.exists(vid):
            raise SystemExit(f"belum ada rekaman bagian {nomor}: {vid}")
        mp4 = os.path.join(KELUAR, f"{NAMA}-bagian-{nomor}.mp4")
        # Hasil encode dipakai ulang, KECUALI kalau rekamannya lebih baru.
        # Tanpa syarat kedua, satu bagian yang direkam ulang akan diam-diam
        # dirakit dari hasil encode lama, dan tidak ada tanda apa pun bahwa
        # perbaikannya tidak masuk.
        segar = os.path.exists(mp4) and os.path.getmtime(mp4) >= os.path.getmtime(vid)
        if not segar:
            jalankan(["ffmpeg", "-v", "error", "-y", "-i", vid,
                      "-r", "30", "-c:v", "libx264", "-preset", "medium",
                      "-crf", "23", "-pix_fmt", "yuv420p", "-an", mp4])
        print(f"  bagian {nomor:<4} {durasi(mp4) / 60:5.1f} menit"
              f"  {os.path.getsize(mp4) / 1024 / 1024:6.1f} MB")

    # ── 2: garis waktu mutlak ────────────────────────────────────────────────
    potongan, garis, bab = [], [], []
    geser = 0.0
    for nomor in URUTAN:
        vid = os.path.join(KELUAR, f"{NAMA}-bagian-{nomor}.mp4")
        wkt = os.path.join(REKAM, f"{AWALAN}waktu-{nomor}.json")
        d = durasi(vid)
        potongan.append(vid)
        bab.append({
            "id": f"bagian-{nomor.lower()}",
            "judul": f"{nomor}. {judul_bagian[nomor]}",
            "mulai": round(geser, 2),
            "selesai": round(geser + d, 2),
            "durasi": round(d, 2),
            # Sasaran penonton per bab, dipakai penyaring di dalam pemutar.
            # Bab pembuka dan penutup untuk semua orang; bab pembacaan data
            # untuk pimpinan; sisanya untuk yang mengisi. Dihitung dari posisi,
            # bukan dari nomor tetap - nomor bagian bergeser saat ada yang
            # disisipkan, dan pernah membuat penandanya menempel di bab yang
            # salah.
            "sasaran": ("Semua" if nomor in (URUTAN[0], URUTAN[-1])
                        else "Pimpinan" if 'keputusan' in judul_bagian[nomor].lower()
                        else "PIC OPD"),
        })

        for langkah in json.load(io.open(wkt, encoding="utf-8")):
            t = geser + langkah["mulai"]
            for n in per_langkah.get(langkah["id"], []):
                panjang = lama_narasi.get(n["id"], 0)
                if panjang <= 0:
                    continue
                garis.append({"id": n["id"], "mulai": t, "selesai": t + panjang,
                              "teks": n["teks"], "suara": n["suara"]})
                t += panjang
        geser += d

    total = geser
    print(f"{len(potongan)} bagian, total {int(total // 60)}m {int(total % 60):02d}d")
    print(f"{len(garis)} kalimat narasi ditempatkan")

    # ── 3: jalur narasi ──────────────────────────────────────────────────────
    jalur = np.zeros(int(total * SR) + SR, dtype=np.float32)
    for g in garis:
        pcm = baca_pcm(os.path.join(AUDIO, f"{g['id']}.mp3"))
        i = int(g["mulai"] * SR)
        j = min(i + len(pcm), len(jalur))
        jalur[i:j] += pcm[: j - i]
    np.clip(jalur, -1.0, 1.0, out=jalur)
    narasi_wav = os.path.join(KELUAR, f"{NAMA}-narasi.wav")
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1",
         "-i", "-", "-c:a", "pcm_s16le", narasi_wav],
        input=jalur.tobytes(), check=True,
    )
    print(f"narasi.wav: {os.path.getsize(narasi_wav) / 1024 / 1024:.1f} MB")

    # ── 4: subtitle dan daftar bab ───────────────────────────────────────────
    with io.open(os.path.join(KELUAR, f"{NAMA}-subtitle.srt"), "w", encoding="utf-8") as f:
        for i, g in enumerate(garis, 1):
            f.write(f"{i}\n{waktu_srt(g['mulai'])} --> {waktu_srt(g['selesai'])}\n{g['teks']}\n\n")
    with io.open(os.path.join(KELUAR, f"{NAMA}-subtitle.vtt"), "w", encoding="utf-8") as f:
        f.write("WEBVTT\n\n")
        for g in garis:
            f.write(f"{waktu_vtt(g['mulai'])} --> {waktu_vtt(g['selesai'])}\n{g['teks']}\n\n")
    io.open(os.path.join(KELUAR, f"{NAMA}-bab.json"), "w", encoding="utf-8").write(
        json.dumps(bab, indent=1, ensure_ascii=False))

    with io.open(os.path.join(KELUAR, f"{NAMA}-transkrip.txt"), "w", encoding="utf-8") as f:
        f.write("Transkrip Video Tutorial Pengisian MR Kabar\n")
        f.write("Seluruh isian dalam video ini adalah DATA CONTOH.\n\n")
        nomor_bab = 0
        for g in garis:
            while nomor_bab < len(bab) and bab[nomor_bab]["mulai"] <= g["mulai"]:
                b = bab[nomor_bab]
                f.write(f"\n== Bagian {b['judul']}\n\n")
                nomor_bab += 1
            m, s = divmod(int(g["mulai"]), 60)
            f.write(f"[{m:02d}:{s:02d}] {g['teks']}\n")

    print("subtitle, daftar bab, dan transkrip ditulis")

    # ── 5: video ─────────────────────────────────────────────────────────────
    daftar = os.path.join(KELUAR, f"{NAMA}-potongan.txt")
    with io.open(daftar, "w", encoding="utf-8") as f:
        for p in potongan:
            f.write(f"file '{p.replace(chr(92), '/')}'\n")

    # Disambung tanpa encode ulang. Semua potongan sudah punya parameter yang
    # sama, dan menyalin apa adanya memastikan durasi gabungannya persis sama
    # dengan jumlah durasi yang tadi dipakai menyusun garis waktu.
    gabung = os.path.join(KELUAR, f"{NAMA}-gambar.mp4")
    print("menyambung potongan...")
    jalankan(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0",
              "-i", daftar, "-c", "copy", gabung])
    d_gabung = durasi(gabung)
    print(f"gambar.mp4: {os.path.getsize(gabung) / 1024 / 1024:.1f} MB, "
          f"{int(d_gabung // 60)}m {int(d_gabung % 60):02d}d")
    selisih = abs(d_gabung - total)
    if selisih > 1.0:
        print(f"PERINGATAN: durasi gabungan meleset {selisih:.2f} detik dari "
              f"garis waktu narasi — suara akan bergeser di ujung video.")
    print(f"\nlangkah berikutnya: python musik.py {int(total) + 5}  lalu  bash campur.sh")


if __name__ == "__main__":
    utama()
