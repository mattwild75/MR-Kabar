# Menyalin snapshot database ke OneDrive.
#
# Kenapa perlu. Folder storage/app/private/versi/ berisi snapshot database
# yang dipasangkan dengan tiap tag versi, plus cadangan sebelum operasi
# berisiko. Folder itu SENGAJA di-gitignore - isinya data sungguhan milik
# Pemda dan tidak boleh naik ke GitHub, yang repositorinya publik.
#
# Akibatnya: snapshot itu HANYA ada di komputer ini. Tag git-nya selamat di
# GitHub, tetapi databasenya tidak. Kalau mesin ini rusak atau hilang,
# seluruh snapshot ikut hilang dan tag-tag itu jadi penunjuk ke sesuatu yang
# tidak bisa dipulihkan lagi.
#
# Skrip ini menyalinnya ke OneDrive, yang tersinkron ke awan.
#
# PERINGATAN SEBELUM MEMULIHKAN SALAH SATU BERKAS INI.
# Cadangan yang dibuat dengan "mysqldump --databases" memuat baris
# "USE `mrkabar`;" di dalamnya. Akibatnya perintah seperti
#
#     mysql -u root database_uji < cadangan.sql
#
# TIDAK memulihkan ke database_uji. Nama di baris perintah diabaikan, dan
# isinya ditulis ke database ASLI - menimpa seluruh perubahan sejak cadangan
# itu dibuat. Ini terjadi sungguhan saat audit PASS 5B pada 17 Agustus 2026.
#
# Sebelum memulihkan ke tempat lain, buang dulu baris CREATE DATABASE dan USE:
#
#     (Get-Content cadangan.sql -Raw) -replace '(?m)^CREATE DATABASE .*$','' `
#        -replace '(?m)^USE `mrkabar`;$','' | Set-Content aman.sql -Encoding UTF8
#
#   powershell -File scripts\salin-cadangan.ps1
#   powershell -File scripts\salin-cadangan.ps1 -Diam     (tanpa keluaran, utk penjadwal)
#
# Berkas ditulis TANPA huruf non-ASCII: PowerShell 5.1 membaca berkas skrip
# sebagai ANSI, dan tanda baca seperti em dash membuat seluruh berkas gagal
# diurai.
param([switch]$Diam)

$ErrorActionPreference = 'Stop'

$asal = Join-Path $PSScriptRoot '..\storage\app\private\versi'
$asal = (Resolve-Path $asal -ErrorAction SilentlyContinue)
if (-not $asal) {
    Write-Output "Folder versi tidak ada - belum pernah ada snapshot. Berhenti."
    exit 0
}

if (-not $env:OneDrive) {
    Write-Output "OneDrive tidak terpasang di komputer ini. Berhenti."
    exit 1
}
$tujuan = Join-Path $env:OneDrive 'MR Kabar\cadangan-database'
New-Item -ItemType Directory -Force -Path $tujuan | Out-Null

# /MIR menyamakan isi tujuan dengan asal, termasuk MENGHAPUS berkas di tujuan
# yang sudah tidak ada di asal. Itu SENGAJA tidak dipakai: cadangan yang
# sengaja dibuang dari mesin ini justru sering yang paling ingin diselamatkan.
# /XO melewati berkas yang di tujuan sudah lebih baru.
robocopy $asal $tujuan /E /XO /R:2 /W:2 /NFL /NDL /NP /NJH /NJS | Out-Null
$kode = $LASTEXITCODE

# Robocopy: 0-7 sukses (0 = tidak ada yang perlu disalin), >=8 gagal.
if ($kode -ge 8) {
    Write-Output "GAGAL menyalin (kode robocopy $kode)"
    exit 1
}

$berkas = Get-ChildItem $tujuan -File
$mb = [math]::Round(($berkas | Measure-Object Length -Sum).Sum / 1MB, 1)

if (-not $Diam) {
    Write-Output "Tersalin ke: $tujuan"
    Write-Output ("Berkas     : {0}, total {1} MB" -f $berkas.Count, $mb)
    Write-Output ""
    Write-Output "CATATAN: OneDrive menyinkronkannya ke awan, tetapi itu BUKAN"
    Write-Output "arsip jangka panjang - berkas yang terhapus di sini ikut"
    Write-Output "terhapus di awan. Untuk arsip sungguhan, salin sesekali ke"
    Write-Output "media terpisah yang tidak tersambung."
}

# Catat ke berkas log supaya penyalinan terjadwal bisa ditengok belakangan.
$baris = "{0}  {1} berkas  {2} MB  kode={3}" -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $berkas.Count, $mb, $kode
Add-Content -Path (Join-Path $tujuan '_riwayat-salin.log') -Value $baris -Encoding UTF8
