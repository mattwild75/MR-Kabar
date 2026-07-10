<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
    @page { margin: 15mm; }
    body { font-family: 'DejaVu Sans', sans-serif; font-size: 9px; color: #000; }
    .right { text-align: right; }
    .center { text-align: center; }
    h2 { font-size: 11px; text-align: center; text-transform: uppercase; margin: 2px 0; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th, td { border: 1px solid #000; padding: 3px 4px; vertical-align: top; }
    th { background: #eee; }
    .no-col { width: 18px; text-align: center; }
    .unsur-col { width: 100px; }
    .hasil-col { width: 55px; text-align: center; }
    .simpulan-col { width: 65px; text-align: center; font-weight: 600; }
    .small { font-size: 8px; color: #444; }
    .info-table td { border: none; padding: 1px 0; }
    .letter-row th { background: #f5f5f5; font-weight: normal; text-align: center; }
</style>
</head>
<body>
    <p class="right">Form 1c</p>
    <h2>Simpulan Survei Persepsi atas Lingkungan Pengendalian Intern</h2>
    <h2>{{ $pemerintahKabkota }}</h2>

    <table class="info-table">
        <tr><td style="width:140px;">Nama Pemda / OPD</td><td>: {{ $opd->nama }}</td></tr>
        <tr><td>Tahun Penilaian</td><td>: {{ $tahun }}</td></tr>
    </table>

    <table>
        <thead>
            <tr>
                <th class="no-col" rowspan="2">No.</th>
                <th class="unsur-col" rowspan="2">Sub Unsur</th>
                <th colspan="2">Hasil Reviu Dokumen</th>
                <th colspan="2">Hasil Survei Persepsi</th>
                <th class="simpulan-col" rowspan="2">Simpulan</th>
                <th rowspan="2">Penjelasan</th>
            </tr>
            <tr>
                <th class="hasil-col">Hasil</th>
                <th>Uraian</th>
                <th class="hasil-col">Hasil</th>
                <th>Uraian</th>
            </tr>
            <tr class="letter-row">
                <th>a</th>
                <th>b</th>
                <th>c</th>
                <th>d</th>
                <th>e</th>
                <th>f</th>
                <th>g</th>
                <th>h</th>
            </tr>
        </thead>
        <tbody>
        @foreach ($rows as $idx => $row)
            @php
                $simpulanAkhir = $row['simpulan']
                    ? (($row['hasil_dokumen'] === 'Kurang Memadai' || $row['hasil_survei'] === 'Kurang Memadai') ? 'Kurang Memadai' : 'Memadai')
                    : '-';
            @endphp
            <tr>
                <td class="no-col">{{ $idx + 1 }}</td>
                <td>{{ $row['unsur']->kode }}. {{ $row['unsur']->nama }}</td>
                <td class="hasil-col">{{ $row['hasil_dokumen'] }}</td>
                <td>{{ $row['uraian_dokumen'] ?: '-' }}</td>
                <td class="hasil-col">{{ $row['hasil_survei'] ?? '-' }}</td>
                <td>{{ $row['uraian_survei'] ?: '-' }}</td>
                <td class="simpulan-col">{{ $simpulanAkhir }}</td>
                <td>{{ $row['simpulan']->penjelasan ?? '-' }}</td>
            </tr>
        @endforeach
        </tbody>
    </table>

    <div class="small" style="margin-top:10px;">
        <p><strong>Keterangan:</strong></p>
        <p>Kolom a diisi dengan nomor urut</p>
        <p>Kolom b diisi dengan sub unsur pada lingkungan pengendalian</p>
        <p>Kolom c diisi dengan simpulan penilaian awal CEE berdasarkan dokumen</p>
        <p>Kolom d diisi dengan uraian simpulan penilaian awal CEE berdasarkan dokumen</p>
        <p>Kolom e diisi dengan simpulan hasil survei persepsi</p>
        <p>Kolom f diisi dengan uraian simpulan sesuai hasil survei persepsi</p>
        <p>
            Kolom g diisi dengan simpulan sesuai hasil penilaian awal dan survei persepsi, jika hasil antara
            penilaian awal dan survei persepsi bertentangan, maka lakukan pendalaman atau lakukan professional
            judgement untuk menyimpulkannya
        </p>
        <p>Kolom h diisi dengan uraian kelemahan</p>
    </div>
</body>
</html>
