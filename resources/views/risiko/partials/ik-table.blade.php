{{--
    Partial tabel Indikator|Baseline|Target|OPD, dipakai berkali-kali di
    pdf-2a.blade.php (Tujuan/Sasaran/Program) — hindari duplikasi markup.
    Variabel yg diharapkan: $rows (array indikator_list), $clean (closure).
--}}
@if (count($rows))
    <table class="ik-table">
        <tr>
            <th>Indikator</th>
            <th>Baseline</th>
            <th>Target</th>
            <th>OPD</th>
        </tr>
        @foreach ($rows as $row)
            <tr>
                <td>{{ $clean($row['ik']) }}</td>
                <td>{{ $clean($row['baseline']) }} {{ $clean($row['satuan']) !== '-' ? $row['satuan'] : '' }}</td>
                <td>{{ $clean($row['target']) }} {{ $clean($row['satuan']) !== '-' ? $row['satuan'] : '' }}</td>
                <td>{{ $clean($row['opd']) }}</td>
            </tr>
        @endforeach
    </table>
@endif
