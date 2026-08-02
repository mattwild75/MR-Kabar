#!/bin/bash
# Mencampur narasi dengan musik, lalu menempelkannya ke gambar.
#
# Musik TIDAK dipelankan sepanjang video. Ia dibiarkan penuh di sela kalimat
# dan otomatis mengecil begitu ada narasi, lewat sidechain compression yang
# dikendalikan jalur narasi itu sendiri. Cara ini dipakai juga di video
# edukasi, dan hasilnya musik terasa hadir tanpa pernah menutupi suara.
set -e
cd "$(dirname "$0")"

KEL=keluaran
for f in "$KEL/narasi.wav" musik.wav "$KEL/gambar.mp4"; do
  [ -f "$f" ] || { echo "BELUM ADA: $f"; exit 1; }
done

echo "mencampur narasi dan musik..."
ffmpeg -v error -y -i "$KEL/narasi.wav" -i musik.wav -filter_complex "
  [0:a]loudnorm=I=-18:TP=-1.5:LRA=11,aformat=sample_fmts=fltp:channel_layouts=stereo[nar];
  [1:a]loudnorm=I=-30:TP=-3:LRA=9,aformat=sample_fmts=fltp:channel_layouts=stereo[mus];
  [nar]asplit=2[nar1][kunci];
  [mus][kunci]sidechaincompress=threshold=0.025:ratio=9:attack=25:release=420:makeup=1[musduck];
  [nar1][musduck]amix=inputs=2:duration=first:dropout_transition=0:weights='1 0.95',
    alimiter=limit=0.95,loudnorm=I=-16:TP=-1.5:LRA=11[keluar]
" -map "[keluar]" -ar 48000 -c:a aac -b:a 192k "$KEL/audio.m4a"

echo "menempelkan audio ke gambar..."
ffmpeg -v error -y -i "$KEL/gambar.mp4" -i "$KEL/audio.m4a" \
  -c:v copy -c:a copy -shortest \
  -metadata title="Tutorial Pengisian MR Kabar" \
  "$KEL/tutorial-mr-kabar.mp4"

# Berkas unduhan sengaja dimampatkan lebih kuat daripada berkas yang diputar
# di aplikasi: tujuannya ditonton luring dari flashdisk atau dibagikan lewat
# pesan, bukan dijadikan arsip mutu tinggi. Subtitle yang terbakar membuat
# teks berubah terus di kaki layar dan itu mahal bagi pemampat, sehingga
# tanpa penyesuaian ini berkas 720p justru lebih besar daripada yang 1080p.
echo "membuat berkas unduhan 720p bersubtitle terbakar..."
# Penapis subtitles memperlakukan ":" dan "\" di dalam nama berkas sebagai
# pemisah argumennya sendiri, sehingga jalur Windows selalu gagal diurai.
# Disalin sebentar ke nama polos di direktori kerja untuk menghindarinya.
cp "$KEL/subtitle.srt" ./_sub.srt
ffmpeg -v error -y -i "$KEL/tutorial-mr-kabar.mp4" \
  -vf "scale=1280:720,subtitles=_sub.srt:force_style='FontName=Segoe UI,FontSize=15,PrimaryColour=&H00FFFFFF,OutlineColour=&H90000000,BorderStyle=3,Outline=1,Shadow=0,MarginV=26'" \
  -c:v libx264 -preset medium -crf 28 -g 60 -c:a aac -b:a 112k \
  "$KEL/tutorial-mr-kabar-720p.mp4"
rm -f ./_sub.srt

echo
ls -la "$KEL"/*.mp4 "$KEL"/*.vtt "$KEL"/*.txt
ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$KEL/tutorial-mr-kabar.mp4"
