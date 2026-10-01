#!/bin/bash
# Pasang seluruh hasil v6 ke public/ SEKALIGUS (nama berkas sama dengan versi
# sebelumnya; pemutar menempelkan filemtime sebagai ?v= sehingga peramban
# tidak memutar salinan lama).
#
# Pemutar di aplikasi memutar video TANPA suara dan membunyikan tiga stem
# (narasi, musik, SFX) berdampingan — jadi video, stem, subtitle, dan daftar
# bab harus diganti bersamaan, kalau tidak suaranya melenceng dari gambar.
set -e
cd "$(dirname "$0")"
export PATH="$PATH:/c/Users/Nurhikmat Muhammad/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1.2-full_build/bin"
PUB="../../public/video"

for f in MR_Kabar_Video_Edukasi_v6.mp4 MR_Kabar_Video_Edukasi_v6_720p.mp4 \
         stem-narration.mp3 stem-music.mp3 stem-sfx.mp3 subtitle.vtt transkrip.txt chapters.json; do
  [ -f "$f" ] || { echo "BELUM ADA: $f — batal."; exit 1; }
done

# Trek audio berkas yang diputar di aplikasi diganti trek SENYAP (suara dari
# stem). Trek tetap ada supaya tombol bisu & volume peramban tetap aktif.
ffmpeg -v error -y -i MR_Kabar_Video_Edukasi_v6.mp4 \
       -f lavfi -i anullsrc=channel_layout=stereo:sample_rate=44100 \
       -map 0:v -map 1:a -c:v copy -c:a aac -b:a 8k -shortest \
       "$PUB/video-edukasi-mr-kabar.mp4"
cp MR_Kabar_Video_Edukasi_v6_720p.mp4 "$PUB/video-edukasi-mr-kabar-720p.mp4"
cp stem-narration.mp3                 "$PUB/edu-narration.mp3"
cp stem-music.mp3                     "$PUB/edu-music.mp3"
cp stem-sfx.mp3                       "$PUB/edu-sfx.mp3"
cp subtitle.vtt                       "$PUB/edu-subtitle.vtt"
cp transkrip.txt                      "$PUB/edu-transkrip.txt"
cp chapters.json                      "../../resources/js/data/edu-video-chapters.json"
ls -la "$PUB"/video-edukasi-mr-kabar* "$PUB"/edu-*
