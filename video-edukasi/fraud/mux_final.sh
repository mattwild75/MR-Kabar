#!/bin/bash
# Rakit berkas hasil dari video_noaudio.mp4 + audio_final.mp3.
#
#  1. Video_Edukasi_Kecurangan.mp4       1080p, subtitle TIDAK terbakar
#     (dipakai pemutar di /lapor-kejadian/video-kecurangan; subtitle-nya
#     dikirim terpisah sebagai .vtt supaya bisa dimatikan penonton).
#     Audio ikut di dalam berkas: halaman ini dibuka dari ponsel lewat QR,
#     tidak memakai tiga stem terpisah seperti video edukasi utama.
#  2. Video_Edukasi_Kecurangan_720p.mp4  720p, subtitle TERBAKAR — berkas
#     unduhan untuk sosialisasi luring / dibagikan lewat pesan.
set -e
cd "$(dirname "$0")"
export PATH="$PATH:/c/Users/Nurhikmat Muhammad/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1.2-full_build/bin"

echo "[1/2] 1080p tanpa subtitle terbakar..."
ffmpeg -y -v error -stats -i video_noaudio.mp4 -i audio_final.mp3 \
  -c:v libx264 -pix_fmt yuv420p -crf 26 -preset slow -movflags +faststart \
  -c:a aac -b:a 160k -shortest \
  Video_Edukasi_Kecurangan.mp4

echo "[2/2] 720p dengan subtitle terbakar..."
# libass gagal membuka path Windows berspasi lewat argumen filter -> salin ke
# nama pendek relatif dulu.
cp subtitle.srt sub.srt
ffmpeg -y -v error -stats -i Video_Edukasi_Kecurangan.mp4 \
  -vf "scale=1280:720,subtitles=sub.srt:force_style='FontName=Arial,FontSize=9,PrimaryColour=&HFFFFFF&,OutlineColour=&H000000&,BorderStyle=1,Outline=1.1,Shadow=0,MarginV=14'" \
  -c:v libx264 -pix_fmt yuv420p -crf 28 -preset slow -g 60 -movflags +faststart \
  -c:a aac -b:a 128k \
  Video_Edukasi_Kecurangan_720p.mp4
rm -f sub.srt

ls -la Video_Edukasi_Kecurangan*.mp4
echo "Selesai."
