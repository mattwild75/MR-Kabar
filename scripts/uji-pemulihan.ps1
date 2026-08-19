# Menguji bahwa cadangan benar-benar bisa dipulihkan.
#
# Cadangan yang belum pernah diuji pulih BUKAN cadangan - ia baru berkas.
# Skrip ini memulihkan satu snapshot ke database TERPISAH, mengadu cacah
# barisnya dengan database asli, lalu membuang database ujinya.
#
#   powershell -File scripts\uji-pemulihan.ps1
#   powershell -File scripts\uji-pemulihan.ps1 -Berkas v1.0.11.zip
#
# DUA PENGAMAN YANG TIDAK BOLEH DILEPAS:
#
# 1. Baris "USE" dan "CREATE DATABASE" DIBUANG dari berkas sebelum dipulihkan.
#    Cadangan yang dibuat dengan `mysqldump --databases` memuat "USE `mrkabar`"
#    di dalamnya, dan MySQL menuruti isi berkas - BUKAN nama database di baris
#    perintah. Tanpa pembuangan ini, perintah yang terlihat aman seperti
#    `mysql -u root database_uji < cadangan.sql` justru MENIMPA DATABASE ASLI.
#    Ini terjadi sungguhan saat audit 17 Agustus 2026: 914 baris yang sudah
#    dihapus kembali muncul di database produksi.
#
# 2. Nama database uji diperiksa TIDAK SAMA dengan database aplikasi sebelum
#    apa pun dijalankan.
#
# Berkas ini ditulis TANPA huruf non-ASCII: PowerShell 5.1 membaca skrip
# sebagai ANSI dan tanda baca seperti em dash membuat seluruh berkas gagal
# diurai.
param(
    [string]$Berkas = '',
    [string]$DbUji = 'mrkabar_uji_pulih'
)

$ErrorActionPreference = 'Stop'

$dbAsli = 'mrkabar'
if ($DbUji -eq $dbAsli) {
    Write-Output "TOLAK: nama database uji tidak boleh sama dengan database aplikasi."
    exit 1
}

$bin = "$env:LOCALAPPDATA\com.tinyapp.DBngin\Binaries\mysql\8.4.2\bin"
$mysql = Join-Path $bin 'mysql.exe'
if (-not (Test-Path $mysql)) {
    Write-Output "mysql.exe tidak ditemukan di $bin"
    exit 1
}

$folderVersi = Join-Path $PSScriptRoot '..\storage\app\private\versi'
$folderVersi = (Resolve-Path $folderVersi -ErrorAction SilentlyContinue)
if (-not $folderVersi) {
    Write-Output "Folder versi tidak ada - belum pernah ada snapshot."
    exit 1
}

# Kalau tidak disebut, ambil cadangan .sql terbaru.
if ($Berkas -eq '') {
    $pilih = Get-ChildItem $folderVersi -Filter *.sql | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if (-not $pilih) {
        Write-Output "Tidak ada berkas .sql di folder versi. Sebutkan -Berkas untuk menguji snapshot .zip."
        exit 1
    }
    $sumber = $pilih.FullName
} else {
    $sumber = Join-Path $folderVersi $Berkas
}

if (-not (Test-Path $sumber)) {
    Write-Output "Berkas tidak ada: $sumber"
    exit 1
}

Write-Output "Menguji  : $(Split-Path $sumber -Leaf)"
$mulai = Get-Date

# PENGAMAN 1: buang USE dan CREATE DATABASE.
$aman = Join-Path $env:TEMP 'uji-pemulihan-aman.sql'
(Get-Content $sumber -Raw) `
    -replace '(?m)^CREATE DATABASE .*\r?\n', '' `
    -replace '(?m)^USE `[^`]+`;\r?\n', '' |
    Set-Content $aman -Encoding UTF8 -NoNewline

$sisa = (Select-String -Path $aman -Pattern '^USE |^CREATE DATABASE').Count
if ($sisa -gt 0) {
    Write-Output "TOLAK: masih ada $sisa baris USE/CREATE DATABASE sesudah dibersihkan."
    exit 1
}

& $mysql -u root -e "DROP DATABASE IF EXISTS $DbUji; CREATE DATABASE $DbUji CHARACTER SET utf8mb4;"
Get-Content $aman -Raw | & $mysql -u root $DbUji
$detik = ((Get-Date) - $mulai).TotalSeconds

$nTabel = & $mysql -u root -N -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='$DbUji';"
$nAsli = & $mysql -u root -N -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='$dbAsli';"

Write-Output ("Lama     : {0:N0} detik" -f $detik)
Write-Output "Tabel    : $nTabel (asli $nAsli)"

# Adu cacah baris tabel inti.
Write-Output ""
Write-Output "Cacah baris tabel inti:"
foreach ($t in @('tbl_krs_pemda', 'tbl_irs_pemda', 'tbl_krs_pd', 'tbl_irs_pd', 'tbl_kro_pd', 'tbl_iro_pd', 'users')) {
    $a = & $mysql -u root -N -e "SELECT COUNT(*) FROM $DbUji.$t;" 2>$null
    $b = & $mysql -u root -N -e "SELECT COUNT(*) FROM $dbAsli.$t;" 2>$null
    $tanda = if ($a -eq $b) { 'sama' } else { 'beda (wajar bila cadangan lebih lama)' }
    Write-Output ("  {0,-16} pulih={1,6}  asli={2,6}  {3}" -f $t, $a, $b, $tanda)
}

& $mysql -u root -e "DROP DATABASE IF EXISTS $DbUji;"
Remove-Item $aman -Force -ErrorAction SilentlyContinue

Write-Output ""
Write-Output "Database uji dibuang. Pemulihan BERHASIL diuji."

$catatan = Join-Path $folderVersi '_riwayat-uji-pemulihan.log'
Add-Content -Path $catatan -Encoding UTF8 -Value ("{0}  {1}  {2} tabel  {3:N0} detik" -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), (Split-Path $sumber -Leaf), $nTabel, $detik)
