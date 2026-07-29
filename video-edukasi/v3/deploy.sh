#!/bin/bash
# Pasang seluruh berkas hasil v3 ke public/ SEKALIGUS.
#
# Dijadikan satu langkah karena berkasnya saling bergantung: pemutar di
# aplikasi memutar video tanpa suara dan membunyikan tiga stem audio
# berdampingan. Kalau video dan stem-nya berbeda versi (durasinya beda),
# suaranya melenceng jauh dari gambarnya. Jadi semuanya diganti bersamaan,
# bukan satu per satu.
set -e
cd "$(dirname "$0")"
PUB="../../public/video"

for f in MR_Kabar_Video_Edukasi_v3.mp4 MR_Kabar_Video_Edukasi_v3_720p.mp4 \
         stem-narration.mp3 stem-music.mp3 stem-sfx.mp3 subtitle.vtt transkrip.txt; do
  [ -f "$f" ] || { echo "BELUM ADA: $f — batal."; exit 1; }
done

# Berkas yang diputar DI DALAM aplikasi sengaja dibuang trek audionya.
# Suaranya datang dari tiga stem di bawah, jadi trek bawaan video tidak akan
# pernah terdengar — tapi kalau dibiarkan ada, menaikkan volume lewat kontrol
# peramban membunyikannya BERBARENGAN dengan stem, dan terdengar dobel.
# Menyalin stream saja (tanpa encode ulang): hitungan detik, gambar identik.
ffmpeg -v error -y -i MR_Kabar_Video_Edukasi_v3.mp4 -c:v copy -an \
       "$PUB/video-edukasi-mr-kabar.mp4"
# Yang 720p JUSTRU perlu audionya: berkas ini untuk diunduh & ditonton luring.
cp MR_Kabar_Video_Edukasi_v3_720p.mp4 "$PUB/video-edukasi-mr-kabar-720p.mp4"
cp stem-narration.mp3                 "$PUB/edu-narration.mp3"
cp stem-music.mp3                     "$PUB/edu-music.mp3"
cp stem-sfx.mp3                       "$PUB/edu-sfx.mp3"
cp subtitle.vtt                       "$PUB/edu-subtitle.vtt"
cp transkrip.txt                      "$PUB/edu-transkrip.txt"

mkdir -p "$PUB/klip"
cp klip/*.mp4 "$PUB/klip/" 2>/dev/null || true

rm -f "$PUB"/*.pending
# sisa penamaan lama (dua video) — dihapus supaya tidak ada berkas ganda
rm -f "$PUB"/edu-v2-* "$PUB"/video-edukasi-mr-kabar-v2.mp4

echo "Terpasang:"
ls -la "$PUB" "$PUB/klip" 2>/dev/null
