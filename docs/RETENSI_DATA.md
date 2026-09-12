# Kebijakan Retensi Data

Berapa lama tiap jenis data disimpan, dan apa yang menegakkannya. Semua
otomatis lewat penjadwal (`routes/console.php`) atau cron root di VM.

| Data | Disimpan | Penegak |
|---|---|---|
| Data risiko, CEE, PKPT, MR Fraud, RPP/ERPIKA | Selamanya (soft delete ke Data Terhapus; hapus permanen hanya manual) | Aplikasi |
| Baris Data Terhapus | Sampai dipulihkan/dihapus permanen oleh admin | Manual |
| Log audit (tabel `activity_log`) | 730 hari | `activitylog:clean` harian |
| Arsip log audit (`storage/app/private/audit/*.jsonl`) | Selamanya, ikut cadangan berkas | `audit:arsip` harian 00:40 |
| Cadangan cron di VM (`/var/backups/mrkabar/*.enc`) | 14 hari | `backup-mrkabar.sh` |
| Cadangan halaman Backup (`storage/app/private/<APP_NAME>/`) | Hanya 1 terbaru | `simpanHanyaTerbaru()` |
| Cadangan Google Drive | Sesuai "simpan terakhir" di halaman Backup (bawaan 30) | `cadangan:drive` 01:30 |
| Snapshot versi (`storage/app/private/versi/`) | Selamanya | Tidak pernah dipangkas |
| Sesi masuk | 10 jam (SESSION_LIFETIME) | Laravel |
| Notifikasi lonceng | Selamanya (kecil) | — |
| Log aplikasi (`storage/logs`) | 14 hari | LOG_CHANNEL daily |
| Kunci cadangan | Rotasi tahunan | Peringatan kartu Kesehatan Server >400 hari |

Perubahan angka di atas: ubah di berkas penegaknya, lalu perbarui tabel ini.
