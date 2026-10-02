#!/bin/bash
# Pasang seluruh hasil v6 ke public/ SEKALIGUS (nama berkas sama dengan versi
# sebelumnya; pemutar menempelkan filemtime sebagai ?v= sehingga peramban
# tidak memutar salinan lama).
#
# Kedua MP4 dikemas LENGKAP oleh scripts/video/kemas_mp4.py — suara menyatu,
# subtitle tertanam (bisa dinyalakan/dimatikan; pada 720p subtitle memang
# terbakar), daftar bab, metadata, sampul — sehingga bisa diputar & diunduh
# seperti video biasa. Pemutar di aplikasi memutar suara MP4 itu langsung dan
# baru memakai tiga stem bila Admin mengubah keseimbangan suara; karena itu
# video, stem, subtitle, dan daftar bab tetap harus diganti bersamaan.
set -e
cd "$(dirname "$0")"
export PATH="$PATH:/c/Users/Nurhikmat Muhammad/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1.2-full_build/bin"
PUB="../../public/video"

for f in MR_Kabar_Video_Edukasi_v6.mp4 MR_Kabar_Video_Edukasi_v6_720p.mp4 \
         stem-narration.mp3 stem-music.mp3 stem-sfx.mp3 subtitle.vtt transkrip.txt chapters.json; do
  [ -f "$f" ] || { echo "BELUM ADA: $f — batal."; exit 1; }
done

KEMAS=../../scripts/video/kemas_mp4.py
JUDUL="MR Kabar — Berlayar dengan Peta Risiko (Video Edukasi Manajemen Risiko)"
KET="Video edukasi manajemen risiko Pemerintah Kabupaten Aceh Barat: apa itu risiko, mengapa dikelola, siapa nakhodanya, lima tahap Perdep PPKD No. 4 Tahun 2019, membaca peta risiko, sampai Dashboard MR Kabar."
python "$KEMAS" --video MR_Kabar_Video_Edukasi_v6.mp4 --srt subtitle.srt --bab chapters.json --sampul 58 \
  --judul "$JUDUL" --keterangan "$KET" --keluar "$PUB/video-edukasi-mr-kabar.mp4"
python "$KEMAS" --video MR_Kabar_Video_Edukasi_v6_720p.mp4 --bab chapters.json --sampul 58 \
  --judul "$JUDUL" --keterangan "$KET (Versi 720p, subtitle menempel.)" --keluar "$PUB/video-edukasi-mr-kabar-720p.mp4"
cp stem-narration.mp3                 "$PUB/edu-narration.mp3"
cp stem-music.mp3                     "$PUB/edu-music.mp3"
cp stem-sfx.mp3                       "$PUB/edu-sfx.mp3"
cp subtitle.vtt                       "$PUB/edu-subtitle.vtt"
cp transkrip.txt                      "$PUB/edu-transkrip.txt"
cp chapters.json                      "../../resources/js/data/edu-video-chapters.json"
ls -la "$PUB"/video-edukasi-mr-kabar* "$PUB"/edu-*
