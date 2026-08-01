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

# Trek audio berkas yang diputar DI DALAM aplikasi diganti trek SENYAP.
# Suaranya datang dari tiga stem di bawah; kalau trek asli video dibiarkan,
# menaikkan volume akan membunyikannya BERBARENGAN dengan stem dan terdengar
# dobel. Tapi treknya juga tidak boleh dibuang sama sekali: tanpa trek audio,
# Chrome MEMATIKAN tombol bisu dan slider volumenya — pengguna kehilangan
# kendali suara sepenuhnya. Jadi treknya tetap ada, isinya diam.
# Gambar disalin apa adanya (tanpa encode ulang), hanya audionya yang dibuat.
ffmpeg -v error -y -i MR_Kabar_Video_Edukasi_v3.mp4 \
       -f lavfi -i anullsrc=channel_layout=stereo:sample_rate=44100 \
       -c:v copy -c:a aac -b:a 8k -shortest \
       "$PUB/video-edukasi-mr-kabar.mp4"
# Yang 720p JUSTRU perlu audionya: berkas ini untuk diunduh & ditonton luring.
cp MR_Kabar_Video_Edukasi_v3_720p.mp4 "$PUB/video-edukasi-mr-kabar-720p.mp4"
cp stem-narration.mp3                 "$PUB/edu-narration.mp3"
cp stem-music.mp3                     "$PUB/edu-music.mp3"
cp stem-sfx.mp3                       "$PUB/edu-sfx.mp3"
cp subtitle.vtt                       "$PUB/edu-subtitle.vtt"
cp transkrip.txt                      "$PUB/edu-transkrip.txt"
# Daftar bab TIDAK ikut ke public/: ia di-import langsung oleh berkas TSX,
# jadi tempatnya di resources/. Sempat terlewat pada v4 — akibatnya daftar
# bab di aplikasi masih memakai waktu video lama, dan setiap lompatan bab
# mendarat di tempat yang salah tanpa ada yang tampak rusak.
cp chapters.json                      "../../resources/js/data/edu-video-chapters.json"

# WAJIB sesudah menyalin daftar bab. Berkas itu di-import berkas TSX, jadi
# isinya ikut dikompilasi ke dalam bundel -- menyalinnya saja tidak mengubah
# apa pun yang dilihat pengguna sampai bundelnya dibangun ulang. Terlewat pada
# v4: daftar bab di aplikasi masih memakai waktu video lama padahal berkas
# JSON-nya sudah benar, dan tidak ada yang tampak rusak dari luar.
( cd ../.. && npm run build )

mkdir -p "$PUB/klip"
cp klip/*.mp4 "$PUB/klip/" 2>/dev/null || true

rm -f "$PUB"/*.pending
# sisa penamaan lama (dua video) — dihapus supaya tidak ada berkas ganda
rm -f "$PUB"/edu-v2-* "$PUB"/video-edukasi-mr-kabar-v2.mp4

echo "Terpasang:"
ls -la "$PUB" "$PUB/klip" 2>/dev/null
