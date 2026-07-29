#!/bin/bash
# Rakit seluruh berkas hasil dari video_noaudio.mp4 + audio_final.mp3.
#
# Menghasilkan TIGA hal, masing-masing untuk keperluan berbeda:
#
#  1. MR_Kabar_Video_Edukasi_v3.mp4      1080p, TANPA subtitle terbakar
#     Dipakai pemutar di aplikasi. Subtitle dikirim terpisah sebagai
#     subtitle.vtt, jadi penonton bisa MEMATIKANNYA — di versi sebelumnya
#     subtitle terbakar permanen dan tidak bisa diapa-apakan.
#
#  2. ..._720p.mp4                        720p, subtitle TERBAKAR
#     Berkas unduhan untuk sosialisasi luring & koneksi lambat. Subtitle
#     dibakar karena berkas ini akan berpindah-pindah lewat pesan/flashdisk
#     tanpa membawa berkas .vtt-nya. Keyframe dipadatkan (-g 60) supaya bisa
#     dipotong per-tahap tanpa encode ulang.
#
#  3. klip/tahap-*.mp4                    potongan per tahap, dari berkas 720p
#     Untuk OPD yang cuma perlu menonton satu tahap saat sedang mengerjakannya.
#
# CRF 26/28: isinya grafik vektor datar yang sangat mudah dikompres; pada
# perbandingan frame berdampingan tidak ada artefak yang terlihat.
set -e
cd "$(dirname "$0")"
export PATH="$PATH:/c/Users/Nurhikmat Muhammad/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1.2-full_build/bin"

echo "[1/3] 1080p tanpa subtitle terbakar..."
ffmpeg -y -v error -stats -i video_noaudio.mp4 -i audio_final.mp3 \
  -c:v libx264 -pix_fmt yuv420p -crf 26 -preset slow \
  -c:a aac -b:a 192k -shortest \
  MR_Kabar_Video_Edukasi_v3.mp4

echo "[2/3] 720p dengan subtitle terbakar..."
# libass gagal membuka path Windows berspasi lewat argumen filter -> salin ke
# nama pendek relatif dulu. FontSize 9 sudah resolution-independent (libass
# menskalakan relatif thd PlayResY internalnya, bukan tinggi video).
cp subtitle.srt sub.srt
ffmpeg -y -v error -stats -i MR_Kabar_Video_Edukasi_v3.mp4 \
  -vf "scale=1280:720,subtitles=sub.srt:force_style='FontName=Arial,FontSize=9,PrimaryColour=&HFFFFFF&,OutlineColour=&H000000&,BorderStyle=1,Outline=1.1,Shadow=0,MarginV=14'" \
  -c:v libx264 -pix_fmt yuv420p -crf 28 -preset slow -g 60 \
  -c:a aac -b:a 128k \
  MR_Kabar_Video_Edukasi_v3_720p.mp4
rm -f sub.srt

echo "[3/3] potongan per tahap..."
mkdir -p klip
python make_klip.py

echo
ls -la MR_Kabar_Video_Edukasi_v3*.mp4 klip/
echo "Selesai."
