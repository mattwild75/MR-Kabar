#!/bin/bash
# Deploy MR Kabar dari GitHub — dipanggil tombol "Deploy dari GitHub" di
# halaman Backup (BackupController::deploy) lewat `sudo -n`, dan boleh juga
# dijalankan manual oleh root. Terpasang di /usr/local/bin/deploy-mrkabar.sh
# (milik root, 755); salinan ini ada di repo supaya terlacak.
#
# Aturan sudoers yang mengizinkannya (/etc/sudoers.d/mrkabar-deploy):
#   www-data ALL=(root) NOPASSWD: /usr/local/bin/deploy-mrkabar.sh
#   www-data ALL=(root) NOPASSWD: /usr/bin/git -C /var/www/mrkabar fetch --quiet origin main
# Baris kedua dipakai pemeriksaan sebelum deploy (PemeriksaanGitService):
# www-data membandingkan kode server dengan GitHub, dan fetch butuh menulis
# .git milik root. Argumennya persis, tidak bisa dipakai untuk perintah lain.
# Selain itu git harus mengenal repo milik root saat dijalankan www-data:
#   git config --system --add safe.directory /var/www/mrkabar
#
# Pengaman: tombol Deploy menolak berjalan bila kode di server berbeda dari
# GitHub (berkas berubah, commit lokal, riwayat bercabang) — skrip ini
# sendiri tetap berhenti pada galat pertama bila dipanggil manual.
#
# Langkah: pull --ff-only origin main -> composer install (bila composer.lock
# berubah) -> migrate --force -> npm install (bila package-lock berubah) ->
# npm run build -> optimize -> chown -> reload php-fpm. Berhenti pada galat
# pertama; cadangan basis data dibuat oleh aplikasi SEBELUM skrip ini
# dipanggil. Tidak menerima argumen apa pun.
set -euo pipefail
export HOME=/root
APP=/var/www/mrkabar
LOG=/var/log/deploy-mrkabar.log
cd "$APP"

echo "== deploy $(date '+%Y-%m-%d %H:%M:%S %Z') oleh ${SUDO_USER:-root} ==" | tee -a "$LOG"
SEBELUM=$(git rev-parse --short HEAD)
git fetch --tags origin main 2>&1 | tail -1 | tee -a "$LOG" || true
git pull --ff-only origin main 2>&1 | tail -2 | tee -a "$LOG"
SESUDAH=$(git rev-parse --short HEAD)
echo "kode: $SEBELUM -> $SESUDAH" | tee -a "$LOG"

if [ "$SEBELUM" != "$SESUDAH" ] && git diff --name-only "$SEBELUM" "$SESUDAH" | grep -q '^composer.lock$'; then
  echo "composer.lock berubah: composer install" | tee -a "$LOG"
  composer install --no-dev --optimize-autoloader --no-interaction 2>&1 | tail -2 | tee -a "$LOG"
fi

php artisan migrate --force 2>&1 | grep -E 'DONE|Nothing to migrate|FAIL|Error' | tee -a "$LOG" || true

if [ "$SEBELUM" != "$SESUDAH" ] && git diff --name-only "$SEBELUM" "$SESUDAH" | grep -q '^package-lock.json$'; then
  echo "package-lock.json berubah: npm install" | tee -a "$LOG"
  npm install --no-audit --no-fund 2>&1 | tail -1 | tee -a "$LOG"
fi
npm run build 2>&1 | grep -E 'built in|error' | tee -a "$LOG"

php artisan optimize 2>&1 | tail -1 | tee -a "$LOG"
chown -R www-data:www-data bootstrap/cache public/build storage
systemctl reload php8.4-fpm
echo "selesai: $(git log --oneline -1)" | tee -a "$LOG"
