#!/bin/bash
# Mencampur audio dan menyusun berkas akhir video tutorial v2.
#
# Prinsipnya sama dengan video edukasi v6 (lihat ../../video-edukasi/v6/mix_audio.py):
#   - musik dimainkan penuh lalu otomatis TURUN selama narator bicara
#     (sidechain ducking), naik lagi di sela kalimat dan di kartu bab;
#   - tiga stem (narasi, musik, efek suara) untuk pemutar di aplikasi, yang
#     membunyikannya berdampingan dengan gain dasar 1.0 / 1.15 / 0.62 (BASE di
#     resources/js/components/edu-video-player.tsx) - campuran untuk berkas
#     unduhan memakai gain yang SAMA, supaya keduanya terdengar identik;
#   - berkas yang diputar di aplikasi trek audionya senyap (suara dari stem),
#     berkas 720p untuk diunduh audionya menyatu dan subtitlenya terbakar.
set -e
cd "$(dirname "$0")"
export PATH="$PATH:/c/Users/Nurhikmat Muhammad/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1.2-full_build/bin"
K=keluaran
for f in $K/gambar.mp4 $K/narasi.wav $K/musik.wav $K/sfx.wav $K/subtitle.srt; do
  [ -f "$f" ] || { echo "BELUM ADA: $f"; exit 1; }
done
DUCK="threshold=0.05:ratio=10:attack=15:release=320:makeup=1:knee=6"

echo "[1/5] stem narasi"
ffmpeg -y -v error -i $K/narasi.wav -af "loudnorm=I=-18:LRA=7:TP=-2" -ar 44100 -ac 1 -c:a libmp3lame -q:a 3 $K/stem-narration.mp3
echo "[2/5] stem musik (diredam saat narasi)"
ffmpeg -y -v error -i $K/musik.wav -i $K/narasi.wav -filter_complex \
  "[0:a]aresample=44100[m];[1:a]aresample=44100,aformat=channel_layouts=mono,apad[k];[m][k]sidechaincompress=$DUCK[out]" \
  -map "[out]" -t 100000 -ac 2 -c:a libmp3lame -q:a 3 $K/stem-music.mp3
echo "[3/5] stem efek suara"
ffmpeg -y -v error -i $K/sfx.wav -ar 44100 -ac 1 -c:a libmp3lame -q:a 3 $K/stem-sfx.mp3
echo "[4/5] campuran + berkas aplikasi"
ffmpeg -y -v error -i $K/stem-narration.mp3 -i $K/stem-music.mp3 -i $K/stem-sfx.mp3 -filter_complex \
  "[0:a]volume=1.0[n];[1:a]volume=1.15[m];[2:a]volume=0.62[s];[n][m][s]amix=inputs=3:duration=longest:normalize=0[mix];[mix]volume=3dB,alimiter=limit=0.95:level=disabled,aresample=44100[out]" \
  -map "[out]" -c:a aac -b:a 160k $K/audio_final.m4a
# Trek SENYAP tetap ada: tanpa trek audio, Chrome mematikan tombol bisu dan
# slider volume pemutarnya.
ffmpeg -y -v error -i $K/gambar.mp4 -f lavfi -i anullsrc=channel_layout=stereo:sample_rate=44100 \
  -map 0:v -map 1:a -c:v copy -c:a aac -b:a 8k -shortest -movflags +faststart \
  -metadata title="MR Kabar - Video Tutorial" $K/tutorial-mr-kabar.mp4
echo "[5/5] berkas unduhan 720p bersubtitle"
# libass gagal membuka path Windows berspasi lewat argumen filter -> nama pendek relatif.
cp $K/subtitle.srt _sub.srt
ffmpeg -y -v error -stats -i $K/gambar.mp4 -i $K/audio_final.m4a -map 0:v -map 1:a \
  -vf "scale=1280:720:flags=lanczos,subtitles=_sub.srt:force_style='FontName=Arial,FontSize=15,PrimaryColour=&H00FFFFFF,OutlineColour=&H90000000,BorderStyle=3,Outline=1,Shadow=0,MarginV=24'" \
  -c:v libx264 -pix_fmt yuv420p -crf 28 -preset slow -g 60 -c:a copy -movflags +faststart -shortest \
  $K/tutorial-mr-kabar-720p.mp4
rm -f _sub.srt
ls -la $K/tutorial-mr-kabar*.mp4 $K/stem-*.mp3
ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 $K/tutorial-mr-kabar.mp4
