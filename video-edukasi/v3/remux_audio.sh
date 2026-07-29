#!/bin/bash
# Ganti HANYA trek audio pada berkas video yang sudah jadi.
#
# Dipakai kalau yang berubah cuma musik/narasi/SFX, sementara gambarnya tidak
# disentuh sama sekali. Menjalankan mux_final.sh akan meng-encode ulang video
# 1080p dan 720p dari nol -- puluhan menit, padahal hasil gambarnya akan sama
# persis. Di sini videonya disalin apa adanya (-c:v copy), jadi hitungan detik
# dan mutunya tidak turun sedikit pun karena tidak ada encode ulang.
#
# Subtitle terbakar pada berkas 720p ikut terbawa apa adanya, karena subtitle
# itu sudah menyatu ke dalam gambar.
#
# Kalau yang berubah adalah GAMBARNYA, jangan pakai skrip ini -- pakai
# render_video.cjs lalu mux_final.sh.
set -e
cd "$(dirname "$0")"
export PATH="$PATH:/c/Users/Nurhikmat Muhammad/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1.2-full_build/bin"

for f in MR_Kabar_Video_Edukasi_v3.mp4 MR_Kabar_Video_Edukasi_v3_720p.mp4 audio_final.mp3; do
  [ -f "$f" ] || { echo "BELUM ADA: $f — batal."; exit 1; }
done

echo "[1/3] tukar audio 1080p..."
ffmpeg -y -v error -i MR_Kabar_Video_Edukasi_v3.mp4 -i audio_final.mp3 \
  -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -shortest \
  _tmp_1080.mp4
mv -f _tmp_1080.mp4 MR_Kabar_Video_Edukasi_v3.mp4

echo "[2/3] tukar audio 720p..."
ffmpeg -y -v error -i MR_Kabar_Video_Edukasi_v3_720p.mp4 -i audio_final.mp3 \
  -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 128k -shortest \
  _tmp_720.mp4
mv -f _tmp_720.mp4 MR_Kabar_Video_Edukasi_v3_720p.mp4

echo "[3/3] potong ulang klip per tahap..."
mkdir -p klip
python make_klip.py

echo
ls -la MR_Kabar_Video_Edukasi_v3*.mp4 klip/
echo "Selesai."
