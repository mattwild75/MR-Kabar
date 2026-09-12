#!/bin/bash
# Cadangan harian MR Kabar di dalam VM — dipanggil cron root pukul 01:00 WIB.
# Terpasang di /usr/local/bin/backup-mrkabar.sh; salinan ini ada di repo
# supaya isinya terlacak (docs/server/).
#
# Dua berkas per hari, keduanya TERKUNCI AES-256 (openssl, PBKDF2 200.000
# iterasi) dengan kunci di $KUNCI — nilai yang sama dengan
# BACKUP_ARCHIVE_PASSWORD di .env aplikasi, supaya satu kunci membuka semua
# cadangan (zip dari halaman Backup maupun berkas cron ini):
#   db-YYYYMMDD-HHMM.sql.gz.enc     dump seluruh tabel (termasuk hash sandi)
#   berkas-YYYYMMDD-HHMM.tar.gz.enc storage/app (unggahan, bukti, logo)
#
# Membuka:
#   openssl enc -d -aes-256-cbc -pbkdf2 -iter 200000 -pass file:/etc/mrkabar/kunci-cadangan \
#     -in db-20260912-0100.sql.gz.enc | gunzip > db.sql
#   openssl enc -d -aes-256-cbc -pbkdf2 -iter 200000 -pass file:/etc/mrkabar/kunci-cadangan \
#     -in berkas-20260912-0100.tar.gz.enc | tar xzf - -C /var/www/mrkabar
# Di luar VM, ganti "file:..." dengan "pass:<isi kunci>".
set -euo pipefail
TGL=$(date +%Y%m%d-%H%M)
TUJUAN=/var/backups/mrkabar
KUNCI=/etc/mrkabar/kunci-cadangan
ENC="openssl enc -aes-256-cbc -pbkdf2 -iter 200000 -salt -pass file:$KUNCI"

[ -s "$KUNCI" ] || { echo "kunci cadangan $KUNCI tidak ada — berhenti, tidak mencadangkan tanpa kunci"; exit 1; }
umask 077

mysqldump --defaults-extra-file=/etc/mrkabar/mysql-cadangan.cnf --no-tablespaces mrkabar \
  | gzip | $ENC -out "$TUJUAN/db-$TGL.sql.gz.enc"

tar czf - -C /var/www/mrkabar storage/app | $ENC -out "$TUJUAN/berkas-$TGL.tar.gz.enc"

# Uji buka: cadangan yang tidak bisa dibuka sama dengan tidak ada.
$ENC -d -in "$TUJUAN/db-$TGL.sql.gz.enc" | gunzip -t

find "$TUJUAN" -name '*.enc' -mtime +14 -delete
find "$TUJUAN" -name '*.gz' -mtime +14 -delete
echo "$TGL selesai: $(du -h "$TUJUAN/db-$TGL.sql.gz.enc" | cut -f1) db, $(du -h "$TUJUAN/berkas-$TGL.tar.gz.enc" | cut -f1) berkas"
