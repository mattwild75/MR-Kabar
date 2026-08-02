#!/bin/bash
# Menyusun seluruh audio satu video, lalu menempelkannya ke gambar.
#
#   bash campur.sh            video tutorial pengisian
#   bash campur.sh lapor      video lapor kejadian risiko
#
# Musik TIDAK dipelankan sepanjang video. Ia dibiarkan penuh di sela kalimat
# dan otomatis mengecil begitu ada narasi, lewat sidechain compression yang
# dikendalikan jalur narasi itu sendiri. Cara ini dipakai juga di video
# edukasi, dan hasilnya musik terasa hadir tanpa pernah menutupi suara.
#
# Keluarannya SENGAJA dua rupa:
#   - berkas yang diputar DI DALAM aplikasi: trek audionya senyap, suaranya
#     datang dari jalur terpisah di bawah, sehingga slider volume di
#     /settingsapp berpengaruh langsung tanpa render ulang;
#   - berkas yang DIUNDUH: audionya menyatu, karena ditonton luring tanpa
#     pemutar yang bisa membunyikan jalur terpisah.
set -e
cd "$(dirname "$0")"

NAMA="${1:-tutorial}"
KEL=keluaran
MUSIK="musik-$NAMA.wav"
[ -f "$MUSIK" ] || MUSIK=musik.wav

for f in "$KEL/$NAMA-narasi.wav" "$MUSIK" "$KEL/$NAMA-gambar.mp4"; do
  [ -f "$f" ] || { echo "BELUM ADA: $f"; exit 1; }
done
echo "video: $NAMA   musik: $MUSIK"

echo "mencampur narasi dan musik..."
ffmpeg -v error -y -i "$KEL/$NAMA-narasi.wav" -i "$MUSIK" -filter_complex "
  [0:a]loudnorm=I=-18:TP=-1.5:LRA=11,aformat=sample_fmts=fltp:channel_layouts=stereo[nar];
  [1:a]loudnorm=I=-30:TP=-3:LRA=9,aformat=sample_fmts=fltp:channel_layouts=stereo[mus];
  [nar]asplit=2[nar1][kunci];
  [mus][kunci]sidechaincompress=threshold=0.025:ratio=9:attack=25:release=420:makeup=1[musduck];
  [nar1][musduck]amix=inputs=2:duration=first:dropout_transition=0:weights='1 0.95',
    alimiter=limit=0.95,loudnorm=I=-16:TP=-1.5:LRA=11[keluar]
" -map "[keluar]" -ar 48000 -c:a aac -b:a 192k "$KEL/$NAMA-audio.m4a"

echo "membuat jalur audio terpisah untuk pemutar di aplikasi..."
# Levelnya sengaja sama dengan yang dipakai saat mencampur di atas, supaya
# pemutar di aplikasi terdengar identik dengan berkas yang diunduh selama
# slidernya masih di 100 persen.
#
# Kedua video hanya punya DUA lapisan audio: narasi dan musik. Tidak ada efek
# suara. Jalur ketiga tetap dibuat tetapi senyap, karena pemutar mengharapkan
# tiga jalur; slider untuk yang ketiga memang tidak ditampilkan di pengaturan.
ffmpeg -v error -y -i "$KEL/$NAMA-narasi.wav" \
  -af "loudnorm=I=-18:TP=-1.5:LRA=11" -ac 1 -c:a libmp3lame -b:a 96k "$KEL/$NAMA-stem-narasi.mp3"
ffmpeg -v error -y -i "$MUSIK" \
  -af "loudnorm=I=-30:TP=-3:LRA=9" -ac 2 -c:a libmp3lame -b:a 128k "$KEL/$NAMA-stem-musik.mp3"
ffmpeg -v error -y -f lavfi -i anullsrc=channel_layout=mono:sample_rate=44100 \
  -t 2 -c:a libmp3lame -b:a 32k "$KEL/$NAMA-stem-sfx.mp3"

echo "menempelkan audio ke gambar..."
# Trek audio berkas dalam aplikasi dibuat SENYAP. Ia tidak boleh dibuang sama
# sekali: tanpa trek audio, Chrome mematikan tombol bisu dan slider volumenya,
# dan penonton kehilangan kendali suara sepenuhnya.
ffmpeg -v error -y -i "$KEL/$NAMA-gambar.mp4" \
  -f lavfi -i anullsrc=channel_layout=stereo:sample_rate=44100 \
  -c:v copy -c:a aac -b:a 8k -shortest \
  -metadata title="MR Kabar - $NAMA" \
  "$KEL/$NAMA-mr-kabar.mp4"

ffmpeg -v error -y -i "$KEL/$NAMA-gambar.mp4" -i "$KEL/$NAMA-audio.m4a" \
  -c:v copy -c:a copy -shortest "$KEL/$NAMA-dengan-audio.mp4"

# Berkas unduhan sengaja dimampatkan lebih kuat daripada berkas yang diputar
# di aplikasi: tujuannya ditonton luring dari flashdisk atau dibagikan lewat
# pesan, bukan dijadikan arsip mutu tinggi. Subtitle yang terbakar membuat
# teks berubah terus di kaki layar dan itu mahal bagi pemampat, sehingga
# tanpa penyesuaian ini berkas 720p justru lebih besar daripada yang 1080p.
echo "membuat berkas unduhan 720p bersubtitle terbakar..."
# Penapis subtitles memperlakukan ":" dan "\" di dalam nama berkas sebagai
# pemisah argumennya sendiri, sehingga jalur Windows selalu gagal diurai.
# Disalin sebentar ke nama polos di direktori kerja untuk menghindarinya.
cp "$KEL/$NAMA-subtitle.srt" ./_sub.srt
ffmpeg -v error -y -i "$KEL/$NAMA-dengan-audio.mp4" \
  -vf "scale=1280:720,subtitles=_sub.srt:force_style='FontName=Segoe UI,FontSize=15,PrimaryColour=&H00FFFFFF,OutlineColour=&H90000000,BorderStyle=3,Outline=1,Shadow=0,MarginV=26'" \
  -c:v libx264 -preset medium -crf 28 -g 60 -c:a aac -b:a 112k \
  "$KEL/$NAMA-mr-kabar-720p.mp4"
rm -f ./_sub.srt

echo
ls -la "$KEL"/"$NAMA"-*.mp4 "$KEL"/"$NAMA"-stem-*.mp3
ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$KEL/$NAMA-mr-kabar.mp4"
