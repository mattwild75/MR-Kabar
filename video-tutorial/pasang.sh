#!/bin/bash
# Memasang seluruh hasil ke aplikasi SEKALIGUS.
#
# Dijadikan satu langkah karena berkasnya saling bergantung: daftar bab
# menyimpan detik keberapa tiap bagian dimulai, dan angka itu hanya benar untuk
# berkas video yang dibuat bersamaan. Memasang salah satunya saja membuat
# setiap lompatan bab mendarat di tempat yang salah tanpa ada yang tampak
# rusak — kekeliruan yang persis sama pernah terjadi pada video edukasi.
set -e
cd "$(dirname "$0")"

KEL=keluaran
PUB=../public/video
DATA=../resources/js/data

for f in "$KEL/tutorial-mr-kabar.mp4" "$KEL/tutorial-mr-kabar-720p.mp4" \
         "$KEL/stem-narasi.mp3" "$KEL/stem-musik.mp3" "$KEL/stem-sfx.mp3" \
         "$KEL/subtitle.vtt" "$KEL/transkrip.txt" "$KEL/bab.json"; do
  [ -f "$f" ] || { echo "BELUM ADA: $f - batal."; exit 1; }
done

mkdir -p "$PUB"
cp "$KEL/tutorial-mr-kabar.mp4"      "$PUB/tutorial-mr-kabar.mp4"
cp "$KEL/tutorial-mr-kabar-720p.mp4" "$PUB/tutorial-mr-kabar-720p.mp4"
# Tiga jalur audio yang dibunyikan pemutar di aplikasi. Videonya sendiri
# senyap; inilah yang membuat slider volume di /settingsapp berpengaruh
# langsung tanpa render ulang.
cp "$KEL/stem-narasi.mp3"            "$PUB/tutorial-narration.mp3"
cp "$KEL/stem-musik.mp3"             "$PUB/tutorial-music.mp3"
cp "$KEL/stem-sfx.mp3"               "$PUB/tutorial-sfx.mp3"
cp "$KEL/subtitle.vtt"               "$PUB/tutorial-subtitle.vtt"
cp "$KEL/transkrip.txt"              "$PUB/tutorial-transkrip.txt"

# Daftar bab TIDAK ikut ke public/: ia di-import berkas TSX, jadi tempatnya di
# resources/ dan isinya ikut dikompilasi ke dalam bundel.
cp "$KEL/bab.json"                   "$DATA/tutorial-video-chapters.json"

# WAJIB sesudah menyalin daftar bab. Menyalinnya saja tidak mengubah apa pun
# yang dilihat pengguna sampai bundelnya dibangun ulang.
( cd .. && npm run build )

echo
echo "Terpasang:"
ls -la "$PUB"/tutorial-* "$DATA/tutorial-video-chapters.json"
