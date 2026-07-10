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
    .unsur-row td { font-weight: bold; background: #fff9c4; }
    .lemah { background: #ffcc80; }
    .no-col { width: 20px; text-align: center; }
    .r-col { width: 20px; text-align: center; }
    .modus-col { width: 30px; text-align: center; font-weight: 600; }
    .simpulan-col { width: 90px; text-align: center; font-weight: 600; }
    .ket { margin-top: 10px; font-size: 8px; line-height: 1.4; }
    .letter-row th { background: #f5f5f5; font-weight: normal; text-align: center; }
</style>
</head>
<body>
    <p class="right">Form 1a</p>
    <h2>Rekapitulasi Hasil Kuesioner Penilaian Lingkungan Pengendalian Intern</h2>
    <h2>Control Environment Evaluation (CEE)</h2>
    <p class="center" style="font-weight:600; text-transform: uppercase; margin-top: 8px;">{{ $pemerintahKabkota }}</p>
    <p class="center" style="text-transform: uppercase; color: #444; font-size: 8px;">{{ $opd->nama }}</p>
    <p style="margin-top: 6px;">Tahun Penilaian : {{ $tahun }}</p>

    @php($kolomResponden = max($jumlahResponden, 1))

    <table>
        <thead>
            <tr>
                <th class="no-col" rowspan="2">No.</th>
                <th rowspan="2">Pertanyaan / Kuesioner</th>
                <th colspan="{{ $kolomResponden }}">Jawaban Responden (R)</th>
                <th class="modus-col" rowspan="2">Modus</th>
                <th class="simpulan-col" rowspan="2">Simpulan Kuesioner CEE</th>
            </tr>
            <tr>
                @for ($i = 1; $i <= $kolomResponden; $i++)
                    <th class="r-col">R{{ $i }}</th>
                @endfor
            </tr>
            <tr class="letter-row">
                <th>a</th>
                <th>b</th>
                <th colspan="{{ $kolomResponden + 1 }}">c</th>
                <th>d</th>
            </tr>
        </thead>
        <tbody>
        @foreach ($unsurs as $unsur)
            <tr class="unsur-row">
                <td colspan="{{ 2 + $kolomResponden }}">{{ $unsur->kode }}. {{ strtoupper($unsur->nama) }}</td>
                <td class="simpulan-col" colspan="2">{{ $simpulanUnsur[$unsur->id] ?? '-' }}</td>
            </tr>
            @foreach ($unsur->pertanyaan as $idx => $p)
                @php($r = $rekap[$p->id] ?? null)
                @php($slots = $r['nilai_per_slot'] ?? [])
                <tr>
                    <td class="no-col">{{ $idx + 1 }}</td>
                    <td>{{ $p->pertanyaan }}</td>
                    @for ($i = 0; $i < $kolomResponden; $i++)
                        @php($nilai = $slots[$i] ?? null)
                        <td class="r-col @if($nilai === 1 || $nilai === 2) lemah @endif">{{ $nilai ?? '' }}</td>
                    @endfor
                    <td class="modus-col">{{ $r['modus'] ?? '' }}</td>
                    <td class="simpulan-col @if(($r['simpulan'] ?? null) === 'Kurang Memadai') lemah @endif">{{ $r['simpulan'] ?? '-' }}</td>
                </tr>
            @endforeach
        @endforeach
        </tbody>
    </table>

    <div class="ket">
        <p><strong>Keterangan:</strong></p>
        <p><strong>Ket Jawaban:</strong></p>
        <p>1 : Tidak Setuju/Belum ada/ belum dibangun</p>
        <p>2 : Kurang Setuju/Telah dibangun/diterapkan, akan tetapi belum konsisten</p>
        <p>3 : Setuju/Sudah dibangun atau diterapkan dengan baik, tapi masih bisa ditingkatkan</p>
        <p>4 : Sangat Setuju/Sudah dibangun atau diterapkan dengan baik dan dapat ditularkan ke organisasi lain</p>
        <p>Kolom a diisi dengan nomor urut</p>
        <p>Kolom b diisi dengan pertanyaan/kuesioner</p>
        <p>Kolom c diisi dengan jawaban responden</p>
        <p>Kolom d diisi dengan simpulan kuesioner CEE</p>
        <p>
            Simpulan tiap pertanyaan: "Memadai" apabila modus jawaban responden adalah 3 atau 4, dan "Kurang
            Memadai" apabila modus jawaban responden adalah 1 atau 2. Simpulan sub unsur: "Memadai" apabila
            seluruh simpulan tiap pertanyaan pada sub unsur tersebut "Memadai", dan "Kurang Memadai" apabila
            terdapat simpulan pertanyaan pada sub unsur tersebut yang "Kurang Memadai".
        </p>
    </div>
</body>
</html>
