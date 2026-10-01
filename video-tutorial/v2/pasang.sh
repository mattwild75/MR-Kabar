#!/bin/bash
# Memasang seluruh hasil tutorial v2 ke aplikasi SEKALIGUS.
#
# Nama berkas di public/video sama dengan versi sebelumnya; pemutar
# menempelkan filemtime sebagai ?v= sehingga peramban tidak memutar salinan
# lama. Video, tiga stem, subtitle, dan daftar bab saling bergantung (detik
# yang sama), jadi harus diganti bersamaan.
set -e
cd "$(dirname "$0")"
K=keluaran
PUB=../../public/video
DATA=../../resources/js/data
for f in $K/tutorial-mr-kabar.mp4 $K/tutorial-mr-kabar-720p.mp4 $K/stem-narration.mp3 $K/stem-music.mp3 \
         $K/stem-sfx.mp3 $K/subtitle.vtt $K/transkrip.txt $K/bab.json; do
  [ -f "$f" ] || { echo "BELUM ADA: $f - batal."; exit 1; }
done
cp $K/tutorial-mr-kabar.mp4      $PUB/tutorial-mr-kabar.mp4
cp $K/tutorial-mr-kabar-720p.mp4 $PUB/tutorial-mr-kabar-720p.mp4
cp $K/stem-narration.mp3         $PUB/tutorial-narration.mp3
cp $K/stem-music.mp3             $PUB/tutorial-music.mp3
cp $K/stem-sfx.mp3               $PUB/tutorial-sfx.mp3
cp $K/subtitle.vtt               $PUB/tutorial-subtitle.vtt
cp $K/transkrip.txt              $PUB/tutorial-transkrip.txt
# Daftar bab di-import berkas TSX, jadi tempatnya di resources/ dan baru
# berlaku sesudah bundel dibangun ulang. npm di Windows adalah npm.cmd dan
# tidak ada di PATH Bash.
cp $K/bab.json                   $DATA/tutorial-video-chapters.json
cmd //c "cd /d ..\\.. && npm run build"
ls -la $PUB/tutorial-*
