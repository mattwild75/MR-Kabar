#!/bin/bash
# video_noaudio.mp4 (1920x1080@30) + audio_final.mp3 + subtitle burn-in
# -> MR_Kabar_Video_Edukasi_v2.mp4
#
# CRF 26 (bukan 20): isinya grafik vektor datar yang sangat mudah dikompres.
# CRF 20 menghasilkan 215 MB — terlalu berat untuk berkas yang diputar dari
# halaman login. Pada CRF 26 ukurannya turun ke ~45 MB dan pada perbandingan
# frame berdampingan tidak ada artefak yang terlihat (sudah diuji sampai
# CRF 28 pun masih bersih).
#
# FontSize 9: libass menskalakan teks relatif thd PlayResY internalnya yang
# TETAP, tidak mengikuti tinggi video -- jadi angka ini sudah
# resolution-independent, sama besarnya di 720p maupun 1080p. (Pernah keliru
# dinaikkan ke 13 saat pindah ke 1080p, hasilnya subtitle 3 baris raksasa yang
# menutupi matriks.) Zona y>930 di animasi memang dikosongkan untuk ini.
set -e
cd "$(dirname "$0")"
export PATH="$PATH:/c/Users/Nurhikmat Muhammad/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1.2-full_build/bin"

# libass gagal membuka path Windows berspasi lewat argumen filter -> salin ke
# nama pendek relatif dulu.
cp subtitle.srt sub.srt

ffmpeg -y -i video_noaudio.mp4 -i audio_final.mp3 \
  -vf "subtitles=sub.srt:force_style='FontName=Arial,FontSize=9,PrimaryColour=&HFFFFFF&,OutlineColour=&H000000&,BorderStyle=1,Outline=1.1,Shadow=0,MarginV=14'" \
  -c:v libx264 -pix_fmt yuv420p -crf 26 -preset slow \
  -c:a aac -b:a 192k -shortest \
  MR_Kabar_Video_Edukasi_v2.mp4

rm -f sub.srt
echo "Selesai: MR_Kabar_Video_Edukasi_v2.mp4"
