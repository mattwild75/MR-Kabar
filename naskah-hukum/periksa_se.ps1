# Buka kedua Surat Edaran dengan Word sungguhan, laporkan jumlah halaman,
# ukuran kertas, huruf, dan cuplikan isinya — supaya bentuk naskah dibuktikan
# dari berkas hasil, bukan dari niat penyusunnya.
$ErrorActionPreference = 'Stop'
Get-Process WINWORD -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

$folder = Join-Path $env:USERPROFILE 'OneDrive\Desktop\MR Kabar'
Get-ChildItem $folder -Filter '~$*' -Force -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue

$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0

foreach ($tahun in 2025, 2026) {
    $path = Join-Path $folder "Surat Edaran Bupati Aceh Barat - Arahan dan Kebijakan Penilaian Risiko Tahun $tahun.docx"
    Write-Output "===== SE $tahun ====="
    if (-not (Test-Path $path)) { Write-Output '  BERKAS TIDAK ADA'; continue }

    $doc = $word.Documents.Open($path, $false, $true)
    $doc.Repaginate()

    $halaman = $doc.ComputeStatistics(2)   # wdStatisticPages
    $kata = $doc.ComputeStatistics(0)      # wdStatisticWords
    $ps = $doc.PageSetup
    $lebarMm = [math]::Round($ps.PageWidth * 25.4 / 72, 1)
    $tinggiMm = [math]::Round($ps.PageHeight * 25.4 / 72, 1)

    Write-Output "  halaman     : $halaman"
    Write-Output "  kata        : $kata"
    Write-Output "  kertas      : $lebarMm x $tinggiMm mm"
    Write-Output "  huruf       : $($doc.Content.Font.Name) $($doc.Content.Font.Size) pt"
    Write-Output "  tabel       : $($doc.Tables.Count)"
    Write-Output "  gambar      : $($doc.InlineShapes.Count)"

    $teks = $doc.Content.Text
    foreach ($k in @('SURAT EDARAN', 'ARAHAN DAN KEBIJAKAN PENILAIAN RISIKO', 'A. Umum',
                     'B. Maksud dan Tujuan', 'C. Ruang Lingkup', 'D. Dasar',
                     'E. Arahan dan Kebijakan', 'F. Jadwal Penyelenggaraan',
                     'G. Pelaporan', 'H. Lain-lain', 'BUPATI ACEH BARAT',
                     'TARMIZI', 'LAMPIRAN', '3 s.d. 14 Oktober')) {
        $ada = if ($teks -like "*$k*") { 'ada   ' } else { 'HILANG' }
        Write-Output "    $ada  $k"
    }
    $doc.Close($false)
}
$word.Quit()
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null
