<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
    @page { margin: 15mm; }
    body { font-family: 'DejaVu Sans', sans-serif; font-size: 9px; color: #000; }
    .right { text-align: right; }
    h2 { font-size: 11px; text-align: center; text-transform: uppercase; margin: 2px 0; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    td { padding: 3px 4px; vertical-align: top; }
    .bordered td { border: 1px solid #000; }
    .label-col { width: 160px; font-weight: 600; }
    .sep-col { width: 12px; text-align: center; }
    .highlight { background: #fff9c4; font-weight: 600; text-transform: uppercase; }
    .info-table td { padding: 1px 0; }
    .ttd { margin-top: 24px; width: 100%; }
    .ttd td { text-align: center; vertical-align: top; padding-top: 50px; }
</style>
</head>
<body>
@php
    // "Tidak Ada Data" adalah literal placeholder lama dari data mentah
    // krs_pd/kro_pd (kini digantikan null) — tampilkan sbg "-" spy tidak
    // membingungkan, konsisten dgn pdf-2a.blade.php.
    $clean = fn ($v) => (!$v || $v === 'Tidak Ada Data') ? '-' : $v;
@endphp
    <p class="right" style="font-style: italic;">Form_III_a</p>
    <h2>Penetapan Konteks Risiko Operasional OPD</h2>

    <table class="info-table">
        <tr><td style="width:150px;">Nama Pemda</td><td>: {{ $pemerintahKabkota }}</td></tr>
        <tr><td>Periode yang Dinilai</td><td>: {{ $periode ?? '-' }}</td></tr>
        <tr><td>Tahun Penilaian</td><td>: {{ $tahun }}</td></tr>
        <tr><td>Urusan Pemerintahan</td><td>: {{ $urusanPemerintahan ?? '-' }}</td></tr>
        <tr><td>OPD yang Dinilai</td><td>: {{ $opd->nama }}</td></tr>
    </table>

    <table class="bordered">
        <tr>
            <td class="label-col">Sumber Data</td><td class="sep-col">:</td>
            <td class="highlight">{{ $clean($sumberData) }}</td>
        </tr>
        <tr>
            <td class="label-col">Sasaran Strategis</td><td class="sep-col">:</td>
            <td>@foreach (($konteks['sasaran_list'] ?? []) as $s) <div>{{ $s }}</div> @endforeach</td>
        </tr>
    </table>

    <table class="bordered">
        <tr>
            <td class="label-col">Program dan Kegiatan Utama</td><td class="sep-col">:</td>
            <td>@foreach (($konteks['program_list'] ?? []) as $p) <div>{{ $p }}</div> @endforeach</td>
        </tr>
        <tr>
            <td class="label-col">Kegiatan (Output/Keluaran) / Hasil Kegiatan</td><td class="sep-col">:</td>
            <td>@foreach (($konteks['kegiatan_groups'] ?? []) as $kg) <div>{{ $kg['kegiatan'] }}</div> @endforeach</td>
        </tr>
    </table>

    @foreach (($konteks['kegiatan_groups'] ?? []) as $kg)
        <table class="bordered">
            <tr>
                <td class="label-col">IK Kegiatan ({{ $kg['kegiatan'] }})</td><td class="sep-col">:</td>
                <td>@foreach ($kg['ik'] as $v) <div>{{ $v }}</div> @endforeach</td>
            </tr>
            <tr>
                <td class="label-col">Target IK Kegiatan</td><td class="sep-col">:</td>
                <td>@foreach ($kg['target'] as $v) <div>{{ $v }}</div> @endforeach</td>
            </tr>
        </table>
    @endforeach

    <table class="bordered">
        <tr>
            <td class="label-col">Informasi Lain</td><td class="sep-col">:</td>
            <td>-</td>
        </tr>
        <tr>
            <td class="label-col">Program, Kegiatan dan IKU yang akan dilakukan penilaian Risiko</td><td class="sep-col">:</td>
            <td>
                <div style="font-weight:600;">@foreach (($konteks['program_list'] ?? []) as $p) <div>{{ $p }}</div> @endforeach</div>
                @foreach (($konteks['kegiatan_groups'] ?? []) as $kg)
                    <div style="margin-top:4px;">
                        <div style="font-weight:600;">Kegiatan {{ $kg['kegiatan'] }}</div>
                        <div>IK :</div>
                        @foreach ($kg['ik'] as $v) <div>{{ $v }}</div> @endforeach
                    </div>
                @endforeach
            </td>
        </tr>
    </table>

    @if ($dataUmum && !empty($dataUmum->nama_pic))
        <p style="margin-top:6px; font-style: italic;">PIC : {{ $dataUmum->nama_pic }}</p>
    @endif

    <table class="ttd">
        <tr>
            <td style="width:60%;"></td>
            <td>
                {{ $dataUmum->tempat_pembuatan ?? '' }}@if(!empty($dataUmum->tempat_pembuatan)), @endif{{ optional($dataUmum->tanggal_pembuatan ?? null)->format('d F Y') }}
                <br><br>
                <strong style="text-transform:uppercase;">{{ $dataUmum->jabatan_kepala_dinas ?? ('Kepala ' . $opd->nama) }}</strong>
                <br><br><br><br><br><br>
                <strong><u>{{ $dataUmum->nama_kepala_dinas ?? '' }}</u></strong>
                <br>NIP. {{ $dataUmum->nip_kepala_dinas ?? '' }}
            </td>
        </tr>
    </table>
</body>
</html>
