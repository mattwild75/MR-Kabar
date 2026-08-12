#!/bin/bash
# Memasang seluruh hasil satu video ke aplikasi SEKALIGUS.
#
#   bash pasang.sh            video tutorial pengisian
#   bash pasang.sh lapor      video lapor kejadian risiko
#   bash pasang.sh semua      keduanya, lalu bangun bundel sekali saja
#
# Dijadikan satu langkah karena berkasnya saling bergantung: daftar bab
# menyimpan detik keberapa tiap bagian dimulai, dan angka itu hanya benar untuk
# berkas video yang dibuat bersamaan. Memasang salah satunya saja membuat
# setiap lompatan bab mendarat di tempat yang salah tanpa ada yang tampak
# rusak - kekeliruan yang persis sama pernah terjadi pada video edukasi.
set -e
cd "$(dirname "$0")"

KEL=keluaran
PUB=../public/video
DATA=../resources/js/data

pasang_satu() {
  local NAMA="$1"
  for f in "$KEL/$NAMA-mr-kabar.mp4" "$KEL/$NAMA-mr-kabar-720p.mp4" \
           "$KEL/$NAMA-stem-narasi.mp3" "$KEL/$NAMA-stem-musik.mp3" "$KEL/$NAMA-stem-sfx.mp3" \
           "$KEL/$NAMA-subtitle.vtt" "$KEL/$NAMA-transkrip.txt" "$KEL/$NAMA-bab.json"; do
    [ -f "$f" ] || { echo "BELUM ADA: $f - batal."; exit 1; }
  done

  mkdir -p "$PUB"
  cp "$KEL/$NAMA-mr-kabar.mp4"      "$PUB/$NAMA-mr-kabar.mp4"
  cp "$KEL/$NAMA-mr-kabar-720p.mp4" "$PUB/$NAMA-mr-kabar-720p.mp4"
  # Tiga jalur audio yang dibunyikan pemutar di aplikasi. Videonya sendiri
  # senyap; inilah yang membuat slider volume di /settingsapp berpengaruh
  # langsung tanpa render ulang.
  cp "$KEL/$NAMA-stem-narasi.mp3"   "$PUB/$NAMA-narration.mp3"
  cp "$KEL/$NAMA-stem-musik.mp3"    "$PUB/$NAMA-music.mp3"
  cp "$KEL/$NAMA-stem-sfx.mp3"      "$PUB/$NAMA-sfx.mp3"
  cp "$KEL/$NAMA-subtitle.vtt"      "$PUB/$NAMA-subtitle.vtt"
  cp "$KEL/$NAMA-transkrip.txt"     "$PUB/$NAMA-transkrip.txt"

  # Daftar bab TIDAK ikut ke public/: ia di-import berkas TSX, jadi tempatnya
  # di resources/ dan isinya ikut dikompilasi ke dalam bundel.
  cp "$KEL/$NAMA-bab.json"          "$DATA/$NAMA-video-chapters.json"
  echo "  $NAMA terpasang"
}

case "${1:-tutorial}" in
  # Video Lapor sudah TIDAK ADA lagi sebagai video tersendiri sejak 13 Agustus
  # 2026 - isinya jadi bab VIII-XIII di dalam video tutorial yang sama.
  semua) pasang_satu tutorial ;;
  *)     pasang_satu "${1:-tutorial}" ;;
esac

# WAJIB sesudah menyalin daftar bab. Menyalinnya saja tidak mengubah apa pun
# yang dilihat pengguna sampai bundelnya dibangun ulang.
# npm di Windows adalah npm.cmd dan TIDAK ada di PATH shell Bash; dipanggil
# langsung ia gagal "command not found" dan set -e menghentikan skrip SESUDAH
# berkas tersalin tetapi SEBELUM bundel dibangun - daftar bab di aplikasi lalu
# tetap memakai waktu video lama tanpa ada yang tampak rusak.
cmd //c "cd /d .. && npm run build"

echo
echo "Terpasang:"
ls -la "$PUB"/tutorial-* "$PUB"/lapor-* 2>/dev/null
