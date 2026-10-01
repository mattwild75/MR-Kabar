#!/bin/bash
# Merekam bab-bab tutorial v2, satu berkas per bab, berurutan.
#
#   bash rekam.sh            bersihkan data contoh 2026, lalu rekam bab 1-13
#   bash rekam.sh 5          lanjutkan dari bab 5 (data bab sebelumnya dipertahankan)
#   bash rekam.sh 5 5        hanya bab 5
#
# Urutan WAJIB dari depan: bab belakang memakai data yang dibuat bab depan
# (risiko bab 6 dicari pelapor di bab 8, laporannya ditelaah di bab 9).
# Akun PIC_INSPEKTORAT dan mrkabarvip harus sudah dipinjam (../akun.php pasang).
set -e
cd "$(dirname "$0")"
export MSYS_NO_PATHCONV=1
PHP="${PHP:-/c/Users/Nurhikmat Muhammad/.config/herd/bin/php85/php.exe}"
DARI=${1:-1}
SAMPAI=${2:-13}
if [ "$DARI" = "1" ]; then
  echo "== membersihkan data contoh 2026 dan menandai batas"
  "$PHP" -d error_reporting=0 ../bersihkan.php hapus 2>/dev/null | tail -3
  "$PHP" -d error_reporting=0 ../bersihkan.php tandai 2>/dev/null
fi
mkdir -p rekam
for b in $(seq "$DARI" "$SAMPAI"); do
  echo; echo "===== BAB $b  ($(date +%H:%M:%S))"
  if ! node pengendali.cjs --bab "$b" > "rekam/log-$b.txt" 2>&1; then
    tail -8 "rekam/log-$b.txt"; echo "BAB $b GAGAL - perekaman dihentikan."; exit 1
  fi
  grep -E "SUNYI|terlambat|PERINGATAN|dilewati" "rekam/log-$b.txt" || true
  tail -1 "rekam/log-$b.txt"
done
echo; echo "== selesai $(date +%H:%M:%S)"
ls -la rekam/*.webm
