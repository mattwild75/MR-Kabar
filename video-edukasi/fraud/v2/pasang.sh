#!/bin/bash
# Pasang seluruh berkas hasil v2 ke public/video SEKALIGUS (video 1080p,
# unduhan 720p, subtitle .vtt, transkrip) + daftar bab pemutar. Nama berkas di
# public/ tetap sama dengan versi sebelumnya; halaman pemutar menempelkan
# filemtime sebagai ?v= supaya peramban tidak memutar salinan lama.
set -e
cd "$(dirname "$0")"
PUB="../../../public/video"
for f in Video_Edukasi_Kecurangan.mp4 Video_Edukasi_Kecurangan_720p.mp4 subtitle.vtt transkrip.txt chapters.json; do
  [ -f "$f" ] || { echo "BELUM ADA: $f - batal."; exit 1; }
done
cp Video_Edukasi_Kecurangan.mp4      "$PUB/video-edukasi-kecurangan.mp4"
cp Video_Edukasi_Kecurangan_720p.mp4 "$PUB/video-edukasi-kecurangan-720p.mp4"
cp subtitle.vtt                      "$PUB/kecurangan-subtitle.vtt"
cp transkrip.txt                     "$PUB/kecurangan-transkrip.txt"
cp chapters.json                     "../../../resources/js/data/kecurangan-video-chapters.json"
ls -la "$PUB"/video-edukasi-kecurangan* "$PUB"/kecurangan-*
