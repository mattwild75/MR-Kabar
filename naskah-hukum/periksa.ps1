$dok = Join-Path $env:USERPROFILE 'OneDrive\Desktop\MR Kabar\Peraturan Bupati Aceh Barat - Pedoman Penerapan Manajemen Risiko (2026).docx'
$app = New-Object -ComObject Word.Application
$app.Visible = $false
$app.DisplayAlerts = 0
$d = $app.Documents.Open($dok)

$s = $d.StoryRanges
foreach ($r in $s) {
    $r.Fields.Update() | Out-Null
    $n = $r
    while ($null -ne $n) { $n.Fields.Update() | Out-Null; $n = $n.NextStoryRange }
}
$d.Repaginate()

"halaman : $($d.ComputeStatistics(2))"
"kata    : $($d.ComputeStatistics(0))"
"tabel   : $($d.Tables.Count)"
"gambar  : $($d.InlineShapes.Count)"

$gaya = @{}
$tajuk = New-Object System.Collections.ArrayList
$caption = New-Object System.Collections.ArrayList
foreach ($p in $d.Paragraphs) {
    $nm = $p.Style.NameLocal
    if ($gaya.ContainsKey($nm)) { $gaya[$nm]++ } else { $gaya[$nm] = 1 }
    $lv = [int]$p.OutlineLevel
    $tx = $p.Range.Text.Trim()
    if ($lv -le 3 -and $tx.Length -gt 0) { [void]$tajuk.Add("$lv|$tx") }
    if ($nm -match 'Caption|Keterangan') { [void]$caption.Add($tx) }
}

""
"jumlah paragraf per gaya:"
$gaya.GetEnumerator() | Sort-Object Value -Descending | ForEach-Object {
    "  {0,5}  {1}" -f $_.Value, $_.Key
}

""
"butir Panel Navigasi: $($tajuk.Count)"
$tajuk | Select-Object -First 14 | ForEach-Object {
    $a = $_.Split('|', 2); "  {0}[{1}] {2}" -f ('  ' * ([int]$a[0] - 1)), $a[0], $a[1]
}
"  ..."
$tajuk | Select-Object -Last 6 | ForEach-Object {
    $a = $_.Split('|', 2); "  {0}[{1}] {2}" -f ('  ' * ([int]$a[0] - 1)), $a[0], $a[1]
}

""
"keterangan bernomor: $($caption.Count)"
$caption | Select-Object -First 5 | ForEach-Object { "   $_" }
"   ..."
$caption | Select-Object -Last 3 | ForEach-Object { "   $_" }

$d.Save()
$d.Close(0)
$app.Quit()
