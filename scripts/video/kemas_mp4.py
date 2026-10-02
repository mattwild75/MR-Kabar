"""
Kemas video MR Kabar menjadi MP4 LENGKAP yang bisa diputar seperti biasa di
pemutar mana pun (VLC, Media Player Windows, QuickTime, pemutar ponsel):

  - suara menyatu (campuran akhir yang sama dengan stem di aplikasi);
  - subtitle bahasa Indonesia TERTANAM sebagai trek tersendiri (mov_text),
    tertanda bawaan, sehingga bisa dinyalakan/dimatikan penonton;
  - daftar bab TERTANAM (atom Nero + trek bab QuickTime) dari JSON bab yang
    sama dengan pemutar di aplikasi — "pilihan bagian" di pemutar biasa;
  - metadata (judul, penyusun, tahun, keterangan, hak cipta, bahasa) dan
    gambar sampul dari satu frame judul;
  - indeks di depan berkas (faststart) supaya bisa langsung diputar sambil
    diunduh.

Trek video (dan audio AAC) DISALIN apa adanya, tidak dikodekan ulang: hasilnya
identik gambar & suaranya dengan sumbernya, hanya bertambah trek & metadata.

    python scripts/video/kemas_mp4.py --video V.mp4 [--audio A.m4a] [--srt S.srt]
        --bab bab.json --sampul 39.5 --judul "..." --keterangan "..." --keluar OUT.mp4

`--audio` boleh dilewati kalau berkas video sudah membawa audio campuran
akhir. Tanpa `--srt` (mis. berkas 720p yang subtitlenya sudah terbakar), yang
ditambahkan hanya bab, metadata, dan sampul.
"""
import argparse
import json
import os
import shutil
import subprocess
import sys
import tempfile

FFMPEG_DIR = ("C:/Users/Nurhikmat Muhammad/AppData/Local/Microsoft/WinGet/Packages/"
              "Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1.2-full_build/bin")
FFMPEG = shutil.which("ffmpeg") or os.path.join(FFMPEG_DIR, "ffmpeg.exe")
FFPROBE = shutil.which("ffprobe") or os.path.join(FFMPEG_DIR, "ffprobe.exe")

PENYUSUN = "Inspektorat Kabupaten Aceh Barat"
HAK_CIPTA = "Copyright © 2026, System Architecture & Development by Nurhikmat Muhammad, Inspektorat Aceh Barat"


def jalankan(args):
    hasil = subprocess.run(args, capture_output=True, text=True, encoding="utf-8", errors="replace")
    if hasil.returncode != 0:
        sys.stderr.write(hasil.stderr[-3000:])
        raise SystemExit(f"gagal: {' '.join(args[:6])} ...")
    return hasil.stdout


def periksa(berkas):
    return json.loads(jalankan([FFPROBE, "-v", "error", "-print_format", "json", "-show_format",
                                "-show_streams", "-show_chapters", berkas]))


def esc(nilai: str) -> str:
    # Karakter khusus berkas FFMETADATA: = ; # \ dan baris baru.
    for k in ("\\", "=", ";", "#"):
        nilai = nilai.replace(k, "\\" + k)
    return nilai.replace("\n", "\\\n")


def tulis_metadata(jalur, judul, keterangan, bab, durasi):
    baris = [";FFMETADATA1", f"title={esc(judul)}", f"artist={esc(PENYUSUN)}", f"album_artist={esc(PENYUSUN)}",
             "album=MR Kabar", "date=2026", "genre=Edukasi", f"comment={esc(keterangan)}",
             f"description={esc(keterangan)}", f"copyright={esc(HAK_CIPTA)}", "language=ind", ""]
    for i, b in enumerate(bab):
        mulai = int(round(b["mulai"] * 1000))
        akhir = int(round((bab[i + 1]["mulai"] if i + 1 < len(bab) else durasi) * 1000))
        if akhir <= mulai:
            continue
        baris += ["[CHAPTER]", "TIMEBASE=1/1000", f"START={mulai}", f"END={akhir}", f"title={esc(b['judul'])}", ""]
    with open(jalur, "w", encoding="utf-8", newline="\n") as f:
        f.write("\n".join(baris))


def kemas(video, keluar, bab_json, judul, keterangan, sampul_detik, audio=None, srt=None):
    info = periksa(video)
    durasi = float(info["format"]["duration"])
    v_stream = next(s for s in info["streams"] if s["codec_type"] == "video")
    with open(bab_json, encoding="utf-8") as f:
        bab = json.load(f)
    if not bab:
        raise SystemExit("daftar bab kosong")

    tmp = tempfile.mkdtemp(prefix="kemas_")
    try:
        meta = os.path.join(tmp, "meta.txt")
        tulis_metadata(meta, judul, keterangan, bab, durasi)
        sampul = os.path.join(tmp, "sampul.jpg")
        jalankan([FFMPEG, "-y", "-v", "error", "-ss", str(sampul_detik), "-i", video, "-frames:v", "1",
                  "-vf", "scale=1280:-2:flags=lanczos", "-q:v", "3", sampul])

        args = [FFMPEG, "-y", "-v", "error", "-i", video]
        if audio:
            args += ["-i", audio]
        if srt:
            args += ["-sub_charenc", "UTF-8", "-i", srt]
        args += ["-i", meta, "-i", sampul]
        n = 1 + (1 if audio else 0) + (1 if srt else 0)
        i_meta, i_sampul = n, n + 1

        sumber_audio = periksa(audio) if audio else info
        a_stream = next((s for s in sumber_audio["streams"] if s["codec_type"] == "audio"), None)
        if a_stream is None:
            raise SystemExit("tidak ada trek audio pada sumber")
        args += ["-map", f"0:{v_stream['index']}", "-map", f"{1 if audio else 0}:{a_stream['index']}"]
        if srt:
            args += ["-map", f"{1 + (1 if audio else 0)}:0"]
        args += ["-map", f"{i_sampul}:0", "-map_metadata", str(i_meta), "-map_chapters", str(i_meta)]
        args += ["-c:v:0", "copy"]
        args += ["-c:a", "copy"] if a_stream["codec_name"] == "aac" else ["-c:a", "aac", "-b:a", "160k"]
        args += ["-metadata:s:a:0", "language=ind", "-metadata:s:a:0", "title=Indonesia",
                 "-metadata:s:a:0", "handler_name=Suara"]
        if srt:
            args += ["-c:s", "mov_text", "-metadata:s:s:0", "language=ind", "-metadata:s:s:0", "title=Indonesia",
                     "-metadata:s:s:0", "handler_name=Subtitle Indonesia", "-disposition:s:0", "default"]
        args += ["-c:v:1", "copy", "-disposition:v:1", "attached_pic",
                 "-metadata:s:v:0", "language=ind", "-metadata:s:v:0", "handler_name=Video",
                 "-t", f"{durasi:.3f}", "-movflags", "+faststart", keluar]
        jalankan(args)
    finally:
        shutil.rmtree(tmp, ignore_errors=True)

    # Pemeriksaan hasil: semua trek & bab benar-benar ada.
    hasil = periksa(keluar)
    jenis = [(s["codec_type"], s["codec_name"], s.get("disposition", {}).get("attached_pic", 0)) for s in hasil["streams"]]
    ada = lambda t, c=None: any(j[0] == t and (c is None or j[1] == c) for j in jenis)  # noqa: E731
    assert ada("video", v_stream["codec_name"]), jenis
    assert ada("audio", "aac"), jenis
    assert any(j[2] for j in jenis), f"sampul tidak tertanam: {jenis}"
    if srt:
        assert ada("subtitle", "mov_text"), jenis
    assert len(hasil["chapters"]) == len(bab), f"bab {len(hasil['chapters'])} != {len(bab)}"
    print(f"{keluar}: {float(hasil['format']['duration']):.1f} dtk, {os.path.getsize(keluar) / 1e6:.1f} MB, "
          f"{len(hasil['chapters'])} bab, trek: {', '.join(f'{a}/{b}' for a, b, _ in jenis)}")


def main():
    p = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    p.add_argument("--video", required=True)
    p.add_argument("--audio")
    p.add_argument("--srt")
    p.add_argument("--bab", required=True)
    p.add_argument("--sampul", type=float, default=10.0, help="detik frame yang dijadikan gambar sampul")
    p.add_argument("--judul", required=True)
    p.add_argument("--keterangan", default="")
    p.add_argument("--keluar", required=True)
    a = p.parse_args()
    kemas(a.video, a.keluar, a.bab, a.judul, a.keterangan, a.sampul, audio=a.audio, srt=a.srt)


if __name__ == "__main__":
    main()
