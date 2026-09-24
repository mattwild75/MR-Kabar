<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Terapkan daftar koreksi peran tim RPP (hasil pencocokan dengan berkas RPP
 * sumber Bagian Perencanaan dan aturan urutan baris). Berkas JSON berisi
 * [{member_id, st, nama, lama, baru, alasan}, ...] — TIDAK disimpan di git
 * karena memuat nama pegawai; diunggah ke server seperti impor LHP.
 *
 * Tiap baris diperiksa lebih dulu: nama dan peran lama harus cocok dengan
 * isi basis data; bila id berbeda (lingkungan lain), dicari lewat nomor ST +
 * nama. Setiap perubahan dicatat di `rpp_koreksi_peran` sehingga bisa dibalik
 * dengan `--balik`.
 */
class RppKoreksiPeran extends Command
{
    protected $signature = 'rpp:koreksi-peran {berkas? : Berkas JSON daftar koreksi} {--uji : Tampilkan saja, tanpa mengubah data} {--balik= : Kembalikan koreksi yang alasannya diawali teks ini}';

    protected $description = 'Koreksi peran tim RPP dari daftar hasil pencocokan dengan berkas RPP sumber';

    public function handle(): int
    {
        if ($awalan = $this->option('balik')) {
            return $this->balik($awalan);
        }
        $berkas = (string) $this->argument('berkas');
        if (! is_file($berkas)) {
            $this->error('Berkas tidak ditemukan: '.$berkas);

            return self::FAILURE;
        }
        $daftar = json_decode((string) file_get_contents($berkas), true);
        if (! is_array($daftar)) {
            $this->error('Isi berkas bukan JSON daftar koreksi.');

            return self::FAILURE;
        }

        $uji = (bool) $this->option('uji');
        $n = ['diterapkan' => 0, 'sudah' => 0, 'tak_cocok' => 0];
        DB::transaction(function () use ($daftar, $uji, &$n) {
            foreach ($daftar as $k) {
                $m = DB::table('rpp_team_members')->where('id', $k['member_id'])->first();
                if (! $m || ! $this->namaSama($m->nama, $k['nama'])) {
                    $m = DB::table('rpp_team_members as t')
                        ->join('rpp_penugasan as p', 'p.id', '=', 't.rpp_penugasan_id')
                        ->where('p.nomor_st', $k['st'])
                        ->where('t.nama', $k['nama'])
                        ->select('t.*')->first();
                }
                if (! $m) {
                    $n['tak_cocok']++;

                    continue;
                }
                if ($m->role === $k['baru']) {
                    $n['sudah']++;

                    continue;
                }
                if ($m->role !== $k['lama']) {
                    $n['tak_cocok']++;
                    $this->warn("Lewati {$k['st']} {$k['nama']}: peran sekarang {$m->role}, daftar menyebut {$k['lama']}.");

                    continue;
                }
                $n['diterapkan']++;
                if ($uji) {
                    continue;
                }
                DB::table('rpp_koreksi_peran')->insert([
                    'rpp_team_member_id' => $m->id,
                    'rpp_penugasan_id' => $m->rpp_penugasan_id,
                    'role_lama' => $m->role,
                    'role_baru' => $k['baru'],
                    'alasan' => mb_substr($k['alasan'], 0, 190),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                DB::table('rpp_team_members')->where('id', $m->id)->update(['role' => $k['baru']]);
            }
        });

        // Sebelum 2026 (format empat peran) PPJ merangkap Pengendali Teknis:
        // label cetak RPP mengikuti berkas aslinya, sama seperti migrasi
        // 2026_09_12_170000 untuk peran `ppj` lama.
        $label = 0;
        if (! $uji) {
            $label = DB::table('rpp_team_members as t')
                ->join('rpp_koreksi_peran as k', 'k.rpp_team_member_id', '=', 't.id')
                ->join('rpp_penugasan as p', 'p.id', '=', 't.rpp_penugasan_id')
                ->join('rpps as r', 'r.id', '=', 'p.rpp_id')
                ->where('k.role_baru', 'wpj')->where('t.role', 'wpj')->where('r.year', '<', 2026)
                ->where(fn ($q) => $q->whereNull('t.peran_teks')->orWhere('t.peran_teks', ''))
                ->update(['t.peran_teks' => 'PPJ/Pengendali Teknis']);
        }

        $this->info(($uji ? '[UJI] ' : '')."Diterapkan: {$n['diterapkan']}, sudah benar: {$n['sudah']}, tak cocok/dilewati: {$n['tak_cocok']}, label PPJ: {$label}.");

        return self::SUCCESS;
    }

    private function balik(string $awalan): int
    {
        if (! Schema::hasTable('rpp_koreksi_peran')) {
            return self::SUCCESS;
        }
        $baris = DB::table('rpp_koreksi_peran')->where('alasan', 'like', $awalan.'%')->orderByDesc('id')->get();
        DB::transaction(function () use ($baris) {
            foreach ($baris as $k) {
                DB::table('rpp_team_members')->where('id', $k->rpp_team_member_id)->update(['role' => $k->role_lama]);
                if ($k->role_baru === 'wpj') {
                    DB::table('rpp_team_members')->where('id', $k->rpp_team_member_id)->where('peran_teks', 'PPJ/Pengendali Teknis')->update(['peran_teks' => null]);
                }
                DB::table('rpp_koreksi_peran')->where('id', $k->id)->delete();
            }
        });
        $this->info('Dikembalikan: '.$baris->count());

        return self::SUCCESS;
    }

    private function namaSama(string $a, string $b): bool
    {
        return mb_strtolower(trim($a)) === mb_strtolower(trim($b));
    }
}
