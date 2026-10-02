#!/bin/bash
# Rakit berkas hasil v2 dari video_noaudio.mp4 + audio_final.mp3, lalu kemas
# menjadi MP4 LENGKAP (scripts/video/kemas_mp4.py): suara menyatu, subtitle
# tertanam yang bisa dinyalakan/dimatikan, daftar bab, metadata, sampul.
#
#  1. Video_Edukasi_Kecurangan.mp4       1080p, subtitle TERTANAM (bisa
#     dimatikan). Dipakai pemutar di /lapor-kejadian/video-kecurangan — yang
#     menggambar subtitle sendiri dari .vtt — dan bisa langsung diunduh.
#  2. Video_Edukasi_Kecurangan_720p.mp4  720p, subtitle TERBAKAR (selalu
#     tampil, untuk dibagikan lewat pesan / diputar di layar mana pun) + bab,
#     metadata, sampul.
set -e
cd "$(dirname "$0")"
export PATH="$PATH:/c/Users/Nurhikmat Muhammad/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1.2-full_build/bin"
KEMAS=../../../scripts/video/kemas_mp4.py
JUDUL="MR Kabar — Bunyikan Lonceng (Video Edukasi Lapor Dugaan Kecurangan)"
KET="Video edukasi Lapor Dugaan Kecurangan: apa itu kecurangan dan mengapa terjadi, tujuh wajah korupsi, tanda-tandanya, mengapa orang diam, cara melapor yang benar lewat kode QR MR Kabar, perlindungan pelapor, dan apa yang terjadi setelah laporan terkirim."
SAMPUL=40

for f in video_noaudio.mp4 audio_final.mp3 subtitle.srt chapters.json; do
  [ -f "$f" ] || { echo "BELUM ADA: $f - jalankan build_deliverables.py / render dulu."; exit 1; }
done

echo "[1/3] 1080p dasar (H.264 + AAC)..."
ffmpeg -y -v error -stats -i video_noaudio.mp4 -i audio_final.mp3 \
  -c:v libx264 -pix_fmt yuv420p -crf 26 -preset slow \
  -c:a aac -b:a 160k -shortest \
  _dasar-1080.mp4

echo "[2/3] 720p dasar dengan subtitle terbakar..."
# libass gagal membuka path Windows berspasi lewat argumen filter -> salin ke
# nama pendek relatif dulu.
cp subtitle.srt sub.srt
ffmpeg -y -v error -stats -i _dasar-1080.mp4 \
  -vf "scale=1280:720,subtitles=sub.srt:force_style='FontName=Arial,FontSize=10,PrimaryColour=&HFFFFFF&,OutlineColour=&H000000&,BorderStyle=1,Outline=1.2,Shadow=0,MarginV=16'" \
  -c:v libx264 -pix_fmt yuv420p -crf 28 -preset slow -g 60 \
  -c:a aac -b:a 128k \
  _dasar-720.mp4
rm -f sub.srt

echo "[3/3] kemas: subtitle tertanam, bab, metadata, sampul..."
python "$KEMAS" --video _dasar-1080.mp4 --srt subtitle.srt --bab chapters.json --sampul $SAMPUL \
  --judul "$JUDUL" --keterangan "$KET" --keluar Video_Edukasi_Kecurangan.mp4
python "$KEMAS" --video _dasar-720.mp4 --bab chapters.json --sampul $SAMPUL \
  --judul "$JUDUL" --keterangan "$KET (Versi 720p, subtitle menempel.)" --keluar Video_Edukasi_Kecurangan_720p.mp4
rm -f _dasar-1080.mp4 _dasar-720.mp4

ls -la Video_Edukasi_Kecurangan*.mp4
echo "Selesai."
