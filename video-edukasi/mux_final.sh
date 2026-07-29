#!/bin/bash
# Mux video_noaudio.mp4 (1920x1080@30) + audio_final.mp3 + subtitle.srt
# (burn-in) jadi deliverable akhir.
#
# Catatan FontSize: libass menskalakan teks relatif thd PlayResY internalnya
# (tetap, tidak mengikuti tinggi video), sehingga nilai FontSize sudah
# resolution-independent -- angka yg sama memberi ukuran RELATIF sama di
# 720p maupun 1080p. Sempat keliru dinaikkan 9->13 saat pindah ke 1080p dan
# hasilnya subtitle 3 baris raksasa yg menimpa matriks; dikembalikan ke 9
# setelah diuji pada frame sampel.
set -e
cd "$(dirname "$0")"
export PATH="$PATH:/c/Users/Nurhikmat Muhammad/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1.2-full_build/bin"

cp subtitle.srt sub.srt

ffmpeg -y -i video_noaudio.mp4 -i audio_final.mp3 \
  -vf "subtitles=sub.srt:force_style='FontName=Arial,FontSize=9,PrimaryColour=&HFFFFFF&,OutlineColour=&H000000&,BorderStyle=1,Outline=1.1,Shadow=0,MarginV=14'" \
  -c:v libx264 -pix_fmt yuv420p -crf 20 -preset medium \
  -c:a aac -b:a 192k -shortest \
  MR_Kabar_Video_Edukasi.mp4

rm -f sub.srt
echo "Selesai: MR_Kabar_Video_Edukasi.mp4"
