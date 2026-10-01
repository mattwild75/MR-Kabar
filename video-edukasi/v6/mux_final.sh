#!/bin/bash
# Rakit berkas hasil v6 dari video_noaudio.mp4 + audio_final.mp3.
#   MR_Kabar_Video_Edukasi_v6.mp4       1080p, audio menyatu, subtitle tidak terbakar
#   MR_Kabar_Video_Edukasi_v6_720p.mp4  720p, subtitle TERBAKAR (unduhan luring)
set -e
cd "$(dirname "$0")"
export PATH="$PATH:/c/Users/Nurhikmat Muhammad/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1.2-full_build/bin"

echo "[1/2] 1080p..."
if [ -f video_ekor.mp4 ]; then
  # Ekor dirender ulang terpisah (START_FRAME=EKOR_DARI) sesudah kalimat hak
  # cipta ditambahkan: sambung di sini, sekali encode.
  EKOR_DARI=${EKOR_DARI:-26550}
  ffmpeg -y -v error -stats -i video_noaudio.mp4 -i video_ekor.mp4 -i audio_final.mp3 \
    -filter_complex "[0:v]trim=end_frame=${EKOR_DARI},setpts=PTS-STARTPTS[a];[1:v]setpts=PTS-STARTPTS[b];[a][b]concat=n=2:v=1:a=0[v]" \
    -map "[v]" -map 2:a -c:v libx264 -pix_fmt yuv420p -crf 27 -preset slow -movflags +faststart \
    -c:a aac -b:a 160k \
    MR_Kabar_Video_Edukasi_v6.mp4
else
  ffmpeg -y -v error -stats -i video_noaudio.mp4 -i audio_final.mp3 \
    -c:v libx264 -pix_fmt yuv420p -crf 27 -preset slow -movflags +faststart \
    -c:a aac -b:a 160k -shortest \
    MR_Kabar_Video_Edukasi_v6.mp4
fi

echo "[2/2] 720p dengan subtitle terbakar..."
# libass gagal membuka path Windows berspasi lewat argumen filter -> nama pendek relatif.
cp subtitle.srt sub.srt
ffmpeg -y -v error -stats -i MR_Kabar_Video_Edukasi_v6.mp4 \
  -vf "scale=1280:720,subtitles=sub.srt:force_style='FontName=Arial,FontSize=10,PrimaryColour=&HFFFFFF&,OutlineColour=&H000000&,BorderStyle=1,Outline=1.2,Shadow=0,MarginV=16'" \
  -c:v libx264 -pix_fmt yuv420p -crf 28 -preset slow -g 60 -movflags +faststart \
  -c:a aac -b:a 128k \
  MR_Kabar_Video_Edukasi_v6_720p.mp4
rm -f sub.srt
ls -la MR_Kabar_Video_Edukasi_v6*.mp4
