<?php

use App\Models\Employee;

// Sinkronkan tabel employees (ERPIKA > Pegawai) dengan daftar pegawai
// terkini dari absen apel Inspektorat. Masukan: berkas JSON hasil pembacaan
// absen (lihat komentar di bawah), berisi [bagian, nama, nip, pangkat+gol, jabatan].
//
//   php artisan tinker --execute="\$ABSEN='/tmp/absen.json'; \$TERAPKAN=false; require 'database/skrip/sinkron-pegawai-absen.php';"
//
// Aturan pencocokan: NIP (angka saja) lebih dulu; bila tidak ada, nama yang
// dinormalkan (huruf kecil, tanpa gelar/tanda baca). Pegawai yang tidak ada di
// absen TIDAK dihapus (masih dirujuk penugasan lama) — hanya ditandai
// aktif = false. $TERAPKAN=false hanya menampilkan rencana perubahan.
$daftar = json_decode(file_get_contents($ABSEN), true);
$terapkan = $TERAPKAN ?? false;

$norm = function (string $nama): string {
    $n = mb_strtolower($nama);
    $n = preg_replace('/,.*$/', '', $n);          // buang gelar setelah koma
    $n = preg_replace('/\b(drs|dr|ir|h|hj|t|tgk)\.?\s+/u', '', $n);
    $n = preg_replace('/[^a-z0-9 ]/u', '', $n);

    return trim(preg_replace('/\s+/', ' ', $n));
};
$digit = fn (?string $s) => preg_replace('/\D/', '', (string) $s);

$semua = Employee::withTrashed()->get();
$byNip = $semua->filter(fn ($e) => $digit($e->nip) !== '')->keyBy(fn ($e) => $digit($e->nip));
$byNama = $semua->keyBy(fn ($e) => $norm($e->nama));

$dipakai = [];
$laporan = ['ubah' => 0, 'baru' => 0, 'sama' => 0, 'nonaktif' => 0];
foreach ($daftar as [$bagian, $nama, $nip, $pangkatGol, $jabatan]) {
    preg_match('/^(.*?)\s*\(([^)]+)\)\s*$/', $pangkatGol, $m);
    $pangkat = $m ? trim($m[1]) : trim($pangkatGol);
    $gol = $m ? trim($m[2]) : null;
    $nipD = $digit($nip);
    $e = $nipD !== '' ? $byNip->get($nipD) : null;
    $cara = 'nip';
    if (! $e) {
        $e = $byNama->get($norm($nama));
        $cara = 'nama';
    }
    $unit = ucwords(mb_strtolower($bagian));
    $unit = preg_replace_callback('/\b(Iii|Ii|Iv)\b/', fn ($m) => strtoupper($m[1]), $unit);
    // PPPK tidak punya pangkat/golongan; kolom pangkat di absen berisi "PPPK PW".
    if ($gol === null && str_starts_with($pangkat, 'PPPK')) {
        $pangkat = trim($pangkat);
    }
    $baru = ['nama' => $nama, 'nip' => $nipD ?: null, 'pangkat' => $pangkat, 'golongan' => $gol, 'jabatan' => $jabatan, 'unit_kerja' => $unit, 'aktif' => true];
    if ($e) {
        $dipakai[$e->id] = true;
        $beda = [];
        foreach ($baru as $k => $v) {
            $lama = $e->{$k};
            if ($k === 'nip') {
                $lama = $digit($lama) ?: null;
            }
            if ((string) $lama !== (string) $v && ! ($k === 'aktif' && (bool) $lama === (bool) $v)) {
                $beda[$k] = [$lama, $v];
            }
        }
        if ($beda) {
            $laporan['ubah']++;
            echo "UBAH #{$e->id} ({$cara}) {$e->nama}: ".json_encode($beda, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES).PHP_EOL;
            if ($terapkan) {
                if ($e->trashed()) {
                    $e->restore();
                }
                $e->fill($baru)->save();
            }
        } else {
            $laporan['sama']++;
        }
    } else {
        $laporan['baru']++;
        echo "BARU {$nama} | {$nipD} | {$pangkat} {$gol} | {$jabatan} | {$unit}".PHP_EOL;
        if ($terapkan) {
            $n = Employee::create($baru);
            $dipakai[$n->id] = true;
        }
    }
}
foreach ($semua as $e) {
    if (! isset($dipakai[$e->id]) && $e->aktif && ! $e->trashed()) {
        $laporan['nonaktif']++;
        echo "NONAKTIF #{$e->id} {$e->nama} ({$e->nip})".PHP_EOL;
        if ($terapkan) {
            $e->aktif = false;
            $e->save();
        }
    }
}
echo json_encode($laporan).($terapkan ? ' DITERAPKAN' : ' (rencana saja)').PHP_EOL;
