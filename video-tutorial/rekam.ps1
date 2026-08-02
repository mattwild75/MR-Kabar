# Merekam bagian video tutorial, satu berkas per bagian.
#
#   powershell -File rekam.ps1                          bersihkan lalu rekam semua
#   powershell -File rekam.ps1 -Mulai V                 lanjutkan dari bagian V
#   powershell -File rekam.ps1 -Naskah naskah-lapor.json -Bagian I,II,III,IV,V,VI
#
# Dipisah per bagian dengan sengaja: kalau satu bagian meleset, yang diulang
# hanya bagian itu, bukan sejam rekaman. Urutannya tetap harus dari depan,
# karena bagian belakang menampilkan data yang dibuat bagian depan.
#
# Berkas ini sengaja ditulis TANPA huruf non-ASCII. PowerShell 5.1 membaca
# berkas skrip sebagai ANSI, dan tanda baca seperti em dash membuat seluruh
# berkas gagal diurai. "2>&1" pada program native juga dihindari: ia membungkus
# keluaran biasa sebagai galat dan menghentikan skrip walau programnya berhasil.
param([string]$Mulai = '', [string]$Naskah = '', [string]$Bagian = '')

Set-Location $PSScriptRoot
# Daftar bagian disebut EKSPLISIT lewat -Bagian. Membacanya dari berkas naskah
# lewat ConvertFrom-Json sempat dicoba dan hasilnya menyatu jadi satu untai,
# sehingga seluruh nama bagian dikirim sebagai satu argumen.
if ($Bagian -ne '') {
    $bagian = $Bagian -split ','
} else {
    $bagian = @('I','II','III','IV','V','VI','VII','VIII','IX','X','XI')
}

if ($Mulai -eq '') {
    Write-Output "== membersihkan tahun 2026 dan menandai batas"
    php bersihkan.php hapus | Select-Object -Last 2
    php bersihkan.php tandai
} else {
    $i = [array]::IndexOf($bagian, $Mulai)
    if ($i -lt 0) { Write-Output "bagian tidak dikenal: $Mulai"; exit 1 }
    $bagian = $bagian[$i..($bagian.Length - 1)]
    Write-Output "== melanjutkan dari bagian $Mulai (data yang sudah ada dipertahankan)"
}

$mulaiWaktu = Get-Date
foreach ($b in $bagian) {
    $lewat = ((Get-Date) - $mulaiWaktu).ToString('hh\:mm\:ss')
    Write-Output ""
    Write-Output "===== BAGIAN $b   (sudah berjalan $lewat)"
    if ($Naskah -ne '') {
        node pengendali.cjs --naskah $Naskah --bagian $b
    } else {
        node pengendali.cjs --bagian $b
    }
    if ($LASTEXITCODE -ne 0) {
        Write-Output "BAGIAN $b GAGAL - perekaman dihentikan."
        exit 1
    }
}

$lewat = ((Get-Date) - $mulaiWaktu).ToString('hh\:mm\:ss')
Write-Output ""
Write-Output "== selesai dalam $lewat"
Get-ChildItem rekam -Filter *.webm | ForEach-Object {
    $mb = [math]::Round($_.Length / 1MB, 1)
    Write-Output ($_.Name.PadRight(20) + " " + $mb + " MB")
}
