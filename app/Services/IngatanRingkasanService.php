<?php

namespace App\Services;

use Closure;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

/**
 * Cache untuk hasil ringkasan yang mahal dihitung (dasbor, daftar RPP,
 * rekap aneva, pegawai) TANPA risiko menampilkan data basi.
 *
 * Caranya bukan menghapus cache saat data berubah — cara itu rapuh karena
 * setiap jalur tulis (formulir, impor, sinkron, restore) harus ingat
 * menghapusnya. Kuncinya justru MEMUAT sidik jari tabel yang dipakai:
 * jumlah baris + updated_at terbesar + id terbesar dari tiap tabel. Begitu
 * satu baris saja berubah, sidik jarinya berubah, kuncinya berubah, dan
 * hasil lama tidak pernah terbaca lagi. Sidik jari sendiri murah (satu
 * kueri agregat per tabel, memakai indeks primary key / updated_at).
 *
 * Batas hidup 10 menit hanya pengaman agar entri lama tidak menumpuk;
 * kebenaran datanya dijamin sidik jari, bukan waktu.
 */
class IngatanRingkasanService
{
    /**
     * @param  array<int,string>  $tabel  tabel yang menjadi sumber hasil
     * @param  array<string,mixed>  $parameter  penyaring/pengguna yang membedakan hasil
     */
    public function ingat(string $nama, array $tabel, array $parameter, Closure $hitung, int $detik = 600): mixed
    {
        if (! config('cache.ringkasan', true)) {
            return $hitung();
        }

        $kunci = 'ringkasan:'.$nama.':'.md5(json_encode($parameter).'|'.$this->sidikJari($tabel));

        return Cache::remember($kunci, $detik, $hitung);
    }

    /** Sidik jari gabungan beberapa tabel; tabel yang belum ada dianggap kosong. */
    public function sidikJari(array $tabel): string
    {
        $bagian = [];
        foreach ($tabel as $t) {
            $kolom = 'count(*)';
            $adaUpdated = $this->adaKolom($t, 'updated_at');
            $adaId = $this->adaKolom($t, 'id');
            $sel = 'count(*) as n'.($adaUpdated ? ', max(updated_at) as u' : '').($adaId ? ', max(id) as i' : '');
            try {
                $r = DB::selectOne("select {$sel} from `{$t}`");
                $bagian[] = $t.'='.($r->n ?? 0).'/'.($r->u ?? '-').'/'.($r->i ?? '-');
            } catch (\Throwable) {
                $bagian[] = $t.'=?';
            }
        }

        return implode(';', $bagian);
    }

    /** Daftar kolom per tabel diingat selama proses (skema tidak berubah di tengah permintaan). */
    private array $kolomTabel = [];

    private function adaKolom(string $tabel, string $kolom): bool
    {
        $this->kolomTabel[$tabel] ??= array_map('strtolower', DB::getSchemaBuilder()->getColumnListing($tabel));

        return in_array($kolom, $this->kolomTabel[$tabel], true);
    }
}
