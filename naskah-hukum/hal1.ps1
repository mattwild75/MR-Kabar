$dok = Join-Path $env:USERPROFILE 'OneDrive\Desktop\MR Kabar\Peraturan Bupati Aceh Barat - Pedoman Penerapan Manajemen Risiko (2026).docx'
$out = Join-Path $env:TEMP 'perbup_hal1.pdf'
$app = New-Object -ComObject Word.Application
$app.Visible = $false; $app.DisplayAlerts = 0
$d = $app.Documents.Open($dok, $false, $true)
$d.ExportAsFixedFormat($out, 17, $false, 0, 3, 1, 1)
$d.Close(0); $app.Quit()
"tersimpan: $out"
