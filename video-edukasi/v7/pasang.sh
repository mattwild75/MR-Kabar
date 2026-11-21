#!/bin/bash
# Pasang seluruh hasil v7 ke public/ SEKALIGUS, menggantikan v6 dengan nama
# berkas yang sama (pemutar menempelkan filemtime sebagai ?v= sehingga peramban
# tidak memutar salinan lama).
#
# Kedua MP4 dikemas LENGKAP oleh scripts/video/kemas_mp4.py — suara menyatu,
# subtitle tertanam (pada 720p subtitle terbakar), daftar bab, metadata,
# sampul. Video, stem, subtitle, transkrip, dan daftar bab diganti bersamaan.
set -e
cd "$(dirname "$0")"
export PATH="$PATH:/c/Users/Nurhikmat Muhammad/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1.2-full_build/bin"
PUB="../../public/video"

for f in video_noaudio.mp4 audio_final.mp3 stem-narration.mp3 stem-music.mp3 stem-sfx.mp3 \
         subtitle.srt subtitle.vtt transkrip.txt chapters.json; do
  [ -f "$f" ] || { echo "BELUM ADA: $f — batal."; exit 1; }
done

echo "[1/4] 1080p (frame render berasal dari JPEG rentang penuh -> rentang TV)..."
ffmpeg -y -v error -stats -i video_noaudio.mp4 -i audio_final.mp3 -map 0:v -map 1:a \
  -vf "scale=in_range=pc:out_range=tv,format=yuv420p" -color_range tv \
  -c:v libx264 -crf 27 -preset slow -g 60 -movflags +faststart \
  -c:a aac -b:a 160k -ac 2 -shortest MR_Kabar_Video_Edukasi_v7.mp4

echo "[2/4] 720p dengan subtitle terbakar..."
# libass gagal membuka path Windows berspasi lewat argumen filter -> nama pendek relatif.
cp subtitle.srt sub.srt
ffmpeg -y -v error -stats -i MR_Kabar_Video_Edukasi_v7.mp4 \
  -vf "scale=1280:720,subtitles=sub.srt:force_style='FontName=Arial,FontSize=10,PrimaryColour=&HFFFFFF&,OutlineColour=&H000000&,BorderStyle=1,Outline=1.2,Shadow=0,MarginV=16'" \
  -c:v libx264 -pix_fmt yuv420p -crf 28 -preset slow -g 60 -movflags +faststart \
  -c:a aac -b:a 128k MR_Kabar_Video_Edukasi_v7_720p.mp4
rm -f sub.srt

echo "[3/4] kemas MP4 lengkap..."
KEMAS=../../scripts/video/kemas_mp4.py
JUDUL="MR Kabar — Berlayar dengan Peta Risiko (Video Edukasi Manajemen Risiko)"
KET="Video edukasi manajemen risiko Pemerintah Kabupaten Aceh Barat dalam animasi paper cut: apa itu risiko, mengapa dikelola, siapa memegang kemudi, lima tahap Perdep PPKD No. 4 Tahun 2019, membaca peta risiko, mengukur ombak dengan matriks 5x5 dan Selera Risiko, mengatur layar lewat RTP, buku harian kapal, sampai Dashboard MR Kabar."
python "$KEMAS" --video MR_Kabar_Video_Edukasi_v7.mp4 --srt subtitle.srt --bab chapters.json --sampul 67.8 \
  --judul "$JUDUL" --keterangan "$KET" --keluar "$PUB/video-edukasi-mr-kabar.mp4"
python "$KEMAS" --video MR_Kabar_Video_Edukasi_v7_720p.mp4 --bab chapters.json --sampul 67.8 \
  --judul "$JUDUL" --keterangan "$KET (Versi 720p, subtitle menempel.)" --keluar "$PUB/video-edukasi-mr-kabar-720p.mp4"

echo "[4/4] stem, subtitle, transkrip, daftar bab..."
cp stem-narration.mp3 "$PUB/edu-narration.mp3"
cp stem-music.mp3     "$PUB/edu-music.mp3"
cp stem-sfx.mp3       "$PUB/edu-sfx.mp3"
cp subtitle.vtt       "$PUB/edu-subtitle.vtt"
cp transkrip.txt      "$PUB/edu-transkrip.txt"
cp chapters.json      "../../resources/js/data/edu-video-chapters.json"
ls -la "$PUB"/video-edukasi-mr-kabar* "$PUB"/edu-*
