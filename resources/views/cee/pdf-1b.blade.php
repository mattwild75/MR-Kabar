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
    .no-col { width: 20px; text-align: center; }
    .sumber-col { width: 130px; }
    .klas-col { width: 150px; }
    .ket { margin-top: 10px; font-size: 8px; line-height: 1.4; }
    .info-table td { border: none; padding: 1px 0; }
    .letter-row th { background: #f5f5f5; font-weight: normal; text-align: center; }
</style>
</head>
<body>
    <p class="right">Form 1b</p>
    <h2>CEE Berdasarkan Dokumen</h2>
    <h2>Kondisi Kerentanan Lingkungan Pengendalian Intern di {{ $pemerintahKabkota }}</h2>

    <table class="info-table">
        <tr><td style="width:140px;">Nama Pemda / OPD</td><td>: {{ $opd->nama }}</td></tr>
        <tr><td>Tahun Penilaian</td><td>: {{ $tahun }}</td></tr>
    </table>

    <table>
        <thead>
            <tr>
                <th class="no-col">No.</th>
                <th class="sumber-col">Sumber Data</th>
                <th>Uraian Kelemahan</th>
                <th class="klas-col">Klasifikasi</th>
            </tr>
            <tr class="letter-row">
                <th>a</th>
                <th>b</th>
                <th>c</th>
                <th>d</th>
            </tr>
        </thead>
        <tbody>
        @php
            // Kelompokkan baris ber-Sumber Data sama (case-insensitive+trim) —
            // No. & Sumber Data digabung 1 sel (rowspan) sesuai contoh Perdep.
            $groups = [];
            foreach ($entries as $entry) {
                $key = mb_strtolower(trim($entry->sumber_data));
                if (!isset($groups[$key])) {
                    $groups[$key] = ['sumber_data' => $entry->sumber_data, 'items' => []];
                }
                $groups[$key]['items'][] = $entry;
            }
            $groups = array_values($groups);
        @endphp
        @forelse ($groups as $gIdx => $group)
            @foreach ($group['items'] as $i => $entry)
                <tr>
                    @if ($i === 0)
                        <td class="no-col" rowspan="{{ count($group['items']) }}">{{ $gIdx + 1 }}</td>
                        <td class="sumber-col" rowspan="{{ count($group['items']) }}">{{ $group['sumber_data'] }}</td>
                    @endif
                    <td>{{ $entry->uraian_kelemahan }}</td>
                    <td>{{ $entry->unsur->kode }}. {{ $entry->unsur->nama }}</td>
                </tr>
            @endforeach
        @empty
            <tr>
                <td colspan="4" class="center">Tidak ada data kelemahan.</td>
            </tr>
        @endforelse
        </tbody>
    </table>

    <div class="ket">
        <p>*) Klasifikasi permasalahan menggunakan sub unsur Lingkungan Pengendalian dalam PP 60 Tahun 2008.</p>
        <p><strong>Keterangan:</strong></p>
        <p>Kolom a diisi dengan nomor urut</p>
        <p>Kolom b diisi dengan sumber data</p>
        <p>Kolom c diisi dengan uraian kelemahan berdasarkan data yang ada</p>
        <p>Kolom d diisi dengan klasifikasi kelemahan sesuai sub unsur pada lingkungan pengendalian</p>
    </div>
</body>
</html>
