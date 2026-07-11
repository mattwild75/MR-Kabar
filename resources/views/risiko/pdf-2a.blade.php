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
    td { padding: 3px 4px; vertical-align: top; }
    .bordered td { border: 1px solid #000; }
    .label-col { width: 160px; font-weight: 600; }
    .sep-col { width: 12px; text-align: center; }
    .info-table td { padding: 1px 0; }
    .bold { font-weight: 600; }
    .indent { padding-left: 12px; }
    .note { font-size: 7px; font-style: italic; color: #555; margin-top: 3px; }
    .ttd { margin-top: 24px; width: 100%; }
    .ttd td { text-align: center; vertical-align: top; padding-top: 50px; }
    .pic-list { margin-top: 6px; font-style: italic; }
    .pic-list p { margin: 1px 0; }
    /* Baris "1.1  Teks..." dgn nomor rata kiri di kolom sendiri & teks
       (termasuk baris lanjutan saat wrap) sejajar di kolom kanan — dipakai
       display:table-row/cell (bukan flex, DomPDF dukungan flexbox terbatas). */
    .numbered { display: table; width: 100%; border-collapse: collapse; margin: 0; }
    .numbered-row { display: table-row; }
    .numbered-nomor { display: table-cell; white-space: nowrap; padding-right: 4px; vertical-align: top; }
    .numbered-text { display: table-cell; width: 100%; vertical-align: top; }
    /* Tabel Indikator|Baseline|Target|OPD — satu baris per indikator,
       kolom sejajar (bukan teks inline yg dulu menggabung semua baseline/
       target jadi satu string panjang tak terpisah). */
    .ik-table { width: 100%; border-collapse: collapse; margin: 3px 0 0; font-size: 8px; }
    .ik-table th { text-align: left; border-bottom: 1px solid #999; padding: 1px 4px 1px 0; font-weight: 600; }
    .ik-table td { border-bottom: 1px solid #ddd; padding: 1px 4px 1px 0; vertical-align: top; }
    .ik-table tr:last-child td { border-bottom: none; }
</style>
</head>
<body>
@php
    // "Tidak Ada Data" adalah literal placeholder dari data mentah krs_pemda
    // (bukan nilai kosong) — tampilkan sbg "-" spy tidak membingungkan saat
    // baseline/target-nya justru terisi (lihat komponen React kembarannya,
    // fungsi clean(), utk penjelasan yg sama).
    $clean = fn ($v) => (!$v || $v === 'Tidak Ada Data') ? '-' : $v;
@endphp
    <p class="right" style="font-style: italic;">Form_I_a</p>
    <h2>Penetapan Konteks Risiko Strategis Pemerintah Daerah</h2>

    {{-- 1-4: Nama Pemda, Tahun Penilaian, Periode, Sumber Data --}}
    <table class="info-table">
        <tr><td style="width:150px;">Nama Pemda</td><td>: {{ $pemerintahKabkota }}</td></tr>
        <tr><td>Tahun Penilaian</td><td>: {{ $tahun }}</td></tr>
        <tr><td>Periode yang Dinilai</td><td>: {{ $periode ?? '-' }}</td></tr>
        <tr><td>Sumber Data</td><td>: {{ $sumberData }}</td></tr>
    </table>

    {{-- 1. Visi --}}
    <table class="bordered">
        <tr><td class="label-col">Visi</td><td class="sep-col">:</td><td>{{ $konteks['visi'] ?? '-' }}</td></tr>
    </table>

    {{-- 2. Misi --}}
    <table class="bordered">
        <tr>
            <td class="label-col">Misi Strategis RPJMD/RPD</td><td class="sep-col">:</td>
            <td>
                @foreach (($konteks['misi_list'] ?? []) as $m)
                    <div class="numbered {{ $m['bold'] ? 'bold' : '' }}">
                        <div class="numbered-row">
                            <div class="numbered-nomor" style="width:70px;">Misi {{ $m['nomor'] }} :</div>
                            <div class="numbered-text">{{ preg_replace('/^Misi\s*\d+\s*:\s*/i', '', $m['misi']) }}</div>
                        </div>
                    </div>
                @endforeach
                <p class="note">*Ket. yang dicetak Tebal : Misi yang dipilih sebagai Penetapan Konteks Risiko Strategis Pemda</p>
            </td>
        </tr>
    </table>

    {{-- 3. Tujuan Strategis RPJMD --}}
    <table class="bordered">
        <tr>
            <td class="label-col">Tujuan Strategis RPJMD/RPD</td><td class="sep-col">:</td>
            <td>
                @foreach (($konteks['misi_list'] ?? []) as $m)
                    @foreach ($m['tujuan_list'] as $t)
                        <div class="numbered {{ $t['bold'] ? 'bold' : '' }}">
                            <div class="numbered-row">
                                <div class="numbered-nomor" style="width:24px;">{{ $t['nomor'] }}</div>
                                <div class="numbered-text">
                                    {{ $t['tujuan'] }}
                                    <div style="font-weight:normal;">
                                        @include('risiko.partials.ik-table', ['rows' => $t['indikator_list'], 'clean' => $clean])
                                    </div>
                                </div>
                            </div>
                        </div>
                    @endforeach
                @endforeach
                <p class="note">*Ket. yang dicetak Tebal : Tujuan yang dipilih sebagai Penetapan Konteks Risiko Strategis Pemda</p>
            </td>
        </tr>
    </table>

    {{-- 4. Sasaran RPJMD --}}
    <table class="bordered">
        <tr>
            <td class="label-col">Sasaran RPJMD/RPD</td><td class="sep-col">:</td>
            <td>
                @foreach (($konteks['sasaran_flat'] ?? []) as $s)
                    <div class="numbered {{ $s['bold'] ? 'bold' : '' }}">
                        <div class="numbered-row">
                            <div class="numbered-nomor" style="width:32px;">{{ $s['nomor'] }}</div>
                            <div class="numbered-text">
                                {{ $s['sasaran'] }}
                                <div style="{{ $s['bold'] ? '' : 'font-weight:normal;' }}">
                                    @include('risiko.partials.ik-table', ['rows' => $s['indikator_list'], 'clean' => $clean])
                                </div>
                            </div>
                        </div>
                    </div>
                @endforeach
                <p class="note">*Ket. yang dicetak Tebal : IKU Sasaran RPJMD yang dipilih sebagai Penetapan Konteks Risiko Strategis Pemda</p>
            </td>
        </tr>
    </table>

    {{-- 5. Prioritas Pembangunan dan Program Unggulan --}}
    <table class="bordered">
        <tr>
            <td class="label-col">Prioritas Pembangunan dan Program Unggulan</td><td class="sep-col">:</td>
            <td>
                @foreach (($konteks['program_list'] ?? []) as $p)
                    <div class="{{ $p['bold'] ? 'bold' : '' }}">
                        {{ $p['program'] }}
                        <div class="indent" style="font-weight:normal;">
                            @include('risiko.partials.ik-table', ['rows' => $p['indikator_list'], 'clean' => $clean])
                        </div>
                    </div>
                @endforeach
            </td>
        </tr>
    </table>

    {{-- 6. Urusan Pemerintahan Daerah — per OPD --}}
    <table class="bordered">
        <tr>
            <td class="label-col">Urusan Pemerintahan Daerah</td><td class="sep-col">:</td>
            <td>
                @forelse (($konteks['urusan_list'] ?? []) as $u)
                    <div class="bold">{{ $u['opd'] }} : {{ $u['urusan'] }}</div>
                @empty
                    -
                @endforelse
            </td>
        </tr>
    </table>

    {{-- 7. Nama Dinas Terkait --}}
    <table class="bordered">
        <tr>
            <td class="label-col">Nama Dinas Terkait</td><td class="sep-col">:</td>
            <td>
                @forelse (($konteks['dinas_terkait'] ?? []) as $d)
                    <div>{{ $d }}</div>
                @empty
                    -
                @endforelse
            </td>
        </tr>
    </table>

    {{-- 8. Tujuan, Sasaran, IKU dan Program yang akan dilakukan penilaian risiko --}}
    <table class="bordered">
        <tr>
            <td class="label-col">Tujuan, Sasaran, IKU dan Program yang akan dilakukan Penilaian Risiko</td><td class="sep-col">:</td>
            <td>
                @php $anyBold = false; @endphp
                @foreach (($konteks['misi_list'] ?? []) as $m)
                    @continue(!$m['bold'])
                    @php $anyBold = true; @endphp
                    <div style="margin-top:4px;">
                        <div class="numbered bold">
                            <div class="numbered-row">
                                <div class="numbered-nomor" style="width:70px;">Misi {{ $m['nomor'] }} :</div>
                                <div class="numbered-text">{{ preg_replace('/^Misi\s*\d+\s*:\s*/i', '', $m['misi']) }}</div>
                            </div>
                        </div>
                        @foreach ($m['tujuan_list'] as $t)
                            @continue(!$t['bold'])
                            <div class="indent">
                                <div class="numbered bold">
                                    <div class="numbered-row">
                                        <div class="numbered-nomor" style="width:78px;">Tujuan {{ $t['nomor'] }} :</div>
                                        <div class="numbered-text">{{ $t['tujuan'] }}</div>
                                    </div>
                                </div>
                                @foreach ($t['sasaran_list'] as $s)
                                    @continue(!$s['bold'])
                                    <div class="indent">
                                        <div class="numbered bold">
                                            <div class="numbered-row">
                                                <div class="numbered-nomor" style="width:86px;">Sasaran {{ $s['nomor'] }} :</div>
                                                <div class="numbered-text">{{ $s['sasaran'] }}</div>
                                            </div>
                                        </div>
                                        <div class="indent">
                                            <div>IKU :</div>
                                            @include('risiko.partials.ik-table', ['rows' => $s['indikator_list'], 'clean' => $clean])
                                        </div>
                                    </div>
                                @endforeach
                            </div>
                        @endforeach
                    </div>
                @endforeach
                @php $boldProgram = collect($konteks['program_list'] ?? [])->where('bold', true); @endphp
                @if ($boldProgram->count())
                    <div style="margin-top:4px;">
                        <div class="bold">Program :</div>
                        @foreach ($boldProgram as $p)
                            <div class="indent">{{ $p['program'] }}</div>
                        @endforeach
                    </div>
                @endif
                @if (!$anyBold)
                    <span style="font-style:italic; color:#555;">Belum ada risiko strategis teregister.</span>
                @endif
            </td>
        </tr>
    </table>

    {{-- PIC per-OPD yg mengisi Risiko Strategis Pemda — bisa banyak baris --}}
    @if (count($konteks['pic_list'] ?? []))
        <div class="pic-list">
            @foreach ($konteks['pic_list'] as $p)
                <p>PIC_{{ $p['opd'] }} : {{ $p['nama'] }}</p>
            @endforeach
        </div>
    @endif

    <table class="ttd">
        <tr>
            <td style="width:60%;"></td>
            <td>
                {{ $dataUmum->tempat_pembuatan ?? '' }}@if(!empty($dataUmum->tempat_pembuatan)), @endif{{ optional($dataUmum->tanggal_pembuatan ?? null)->format('d F Y') }}
                <br><br>
                <strong style="text-transform:uppercase;">{{ $dataUmum->jabatan_kepala_daerah ?? 'Bupati' }}</strong>
                <br><br><br><br><br><br>
                <strong><u>{{ $dataUmum->nama_kepala_daerah ?? '' }}</u></strong>
            </td>
        </tr>
    </table>
</body>
</html>
