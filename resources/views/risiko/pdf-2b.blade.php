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
    <p class="right" style="font-style: italic;">Form_II_a</p>
    <h2>Penetapan Konteks Risiko Strategis OPD</h2>

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
            <td class="label-col">Tujuan Strategis Renstra</td><td class="sep-col">:</td>
            <td>@foreach (($konteks['tujuan_list'] ?? []) as $t) <div>{{ $t }}</div> @endforeach</td>
        </tr>
        <tr>
            <td class="label-col">Penetapan Konteks Risiko Strategis OPD</td><td class="sep-col">:</td>
            <td style="font-weight:600;">@foreach (($konteks['tujuan_list'] ?? []) as $t) <div>{{ $t }}</div> @endforeach</td>
        </tr>
        <tr>
            <td class="label-col">Sasaran Strategis Renstra</td><td class="sep-col">:</td>
            <td>@foreach (($konteks['sasaran_groups'] ?? []) as $sg) <div>{{ $sg['sasaran'] }}</div> @endforeach</td>
        </tr>
    </table>

    @foreach (($konteks['sasaran_groups'] ?? []) as $sg)
        <table class="bordered">
            <tr>
                <td class="label-col">IKU Renstra OPD ({{ $sg['sasaran'] }})</td><td class="sep-col">:</td>
                <td>@foreach ($sg['ik'] as $v) <div>{{ $v }}</div> @endforeach</td>
            </tr>
            <tr>
                <td class="label-col">Target IKU Renstra OPD</td><td class="sep-col">:</td>
                <td>@foreach ($sg['target'] as $v) <div>{{ $v }}</div> @endforeach</td>
            </tr>
        </table>
    @endforeach

    <table class="bordered">
        <tr>
            <td class="label-col">Program</td><td class="sep-col">:</td>
            <td>@foreach (($konteks['program_list'] ?? []) as $p) <div>{{ $p }}</div> @endforeach</td>
        </tr>
        <tr>
            <td class="label-col">Informasi Lain</td><td class="sep-col">:</td>
            <td>-</td>
        </tr>
        <tr>
            <td class="label-col">Tujuan, Sasaran, IKU yang akan dilakukan penilaian Risiko</td><td class="sep-col">:</td>
            <td>
                <div style="font-weight:600;">@foreach (($konteks['tujuan_list'] ?? []) as $t) <div>{{ $t }}</div> @endforeach</div>
                @foreach (($konteks['sasaran_groups'] ?? []) as $sg)
                    <div style="margin-top:4px;">
                        <div style="font-weight:600;">Sasaran {{ $sg['sasaran'] }}</div>
                        <div>IKU :</div>
                        @foreach ($sg['ik'] as $v) <div>{{ $v }}</div> @endforeach
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
