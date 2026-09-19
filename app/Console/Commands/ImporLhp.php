<?php

namespace App\Console\Commands;

use App\Models\Lhp;
use App\Support\KodeLhp;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * Impor Database LHP dari berkas JSON hasil ekstraksi SimHPPemda (BPKP).
 * Struktur JSON: array LHP, tiap LHP memuat temuan[] -> sebab[] ->
 * rekomendasi[] -> tindak_lanjut[]. Idempoten pada nomor_lhp: bila
 * --ganti, LHP dengan nomor sama dihapus dulu (berikut detailnya) lalu
 * dibuat ulang; tanpa --ganti, LHP yang sudah ada dilewati.
 *
 *   php artisan lhp:impor /path/lhp.json --ganti
 */
class ImporLhp extends Command
{
    protected $signature = 'lhp:impor {berkas} {--ganti : ganti LHP yang nomornya sudah ada}';

    protected $description = 'Impor Database LHP dari berkas JSON (ekstraksi SimHPPemda)';

    public function handle(): int
    {
        $path = $this->argument('berkas');
        if (! is_file($path)) {
            $this->error("Berkas tidak ada: {$path}");

            return self::FAILURE;
        }
        $data = json_decode(file_get_contents($path), true);
        if (! is_array($data)) {
            $this->error('JSON tidak valid.');

            return self::FAILURE;
        }

        $hcol = ['nomor_lhp', 'tanggal_lhp', 'nomor_st', 'tanggal_st', 'tahun_anggaran', 'nama_obrik',
            'kode_unit_pemeriksa', 'kode_departemen', 'kode_group_jenis_obrik', 'kode_jenis_obrik',
            'kode_group_jenis_periksa', 'kode_jenis_periksa', 'tahun_pkpt', 'tanggal_entry', 'kode_jenis_anggaran',
            'nilai_anggaran', 'realisasi_anggaran', 'anggaran_diaudit', 'jml_tp', 'nilai_tp', 'jml_tpb',
            'nilai_tpb', 'jml_potensi', 'nilai_potensi', 'status_lhp', 'nip_pj', 'nama_pj'];

        $bar = $this->output->createProgressBar(count($data));
        $buat = $lewat = 0;
        foreach ($data as $h) {
            $nomor = trim((string) ($h['nomor_lhp'] ?? ''));
            if ($nomor === '') {
                continue;
            }
            $ada = Lhp::where('nomor_lhp', $nomor)->first();
            if ($ada) {
                if (! $this->option('ganti')) {
                    $lewat++;
                    $bar->advance();

                    continue;
                }
                $ada->forceDelete();
            }
            DB::transaction(function () use ($h, $hcol) {
                $atribut = collect($hcol)->mapWithKeys(fn ($k) => [$k => $this->nilai($h[$k] ?? null, $k)])->all();
                $atribut['inspektorat'] = KodeLhp::INSPEKTORAT_DEFAULT;
                // Bidang/Unit Pengawasan (dari Kode_Wasnal SimHP), sudah dipetakan
                // ke label di lhp.json — mis. "Inspektur Pembantu Wilayah II".
                $atribut['bidang_unit'] = $this->nilai($h['bidang_unit'] ?? null, 'bidang_unit');
                $lhp = Lhp::create($atribut);
                foreach ($h['temuan'] ?? [] as $t) {
                    $tem = $lhp->temuan()->create($this->baris($t, ['no', 'kode_group', 'kode', 'nilai', 'memo', 'status']));
                    foreach ($t['sebab'] ?? [] as $s) {
                        $seb = $tem->sebab()->create($this->baris($s, ['no', 'kode_group', 'kode', 'memo']));
                        foreach ($s['rekomendasi'] ?? [] as $r) {
                            $rek = $seb->rekomendasi()->create($this->baris($r, ['no', 'kode_group', 'kode', 'nilai', 'memo']));
                            foreach ($r['tindak_lanjut'] ?? [] as $tl) {
                                $rek->tindakLanjut()->create($this->baris($tl, ['no', 'kode_group', 'kode', 'nilai', 'tanggal', 'tanggal_laporan', 'memo', 'kode_status']));
                            }
                        }
                    }
                }
                foreach ($h['tim'] ?? [] as $i => $m) {
                    $lhp->tim()->create([
                        'no' => $m['no'] ?? $i + 1,
                        'nip' => $this->nilai($m['nip'] ?? null, 'nip'),
                        'nama' => $this->teks((string) ($m['nama'] ?? '')) ?: '(tanpa nama)',
                        'jabatan' => $this->nilai($m['jabatan'] ?? null, 'jabatan'),
                    ]);
                }
            });
            $buat++;
            $bar->advance();
        }
        $bar->finish();
        $this->newLine(2);
        $this->info("Selesai. Dibuat: {$buat} LHP. Dilewati (sudah ada): {$lewat}.");
        $this->line('Total sekarang: '.Lhp::count().' LHP, '.DB::table('lhp_temuan')->count().' temuan, '
            .DB::table('lhp_rekomendasi')->count().' rekomendasi, '.DB::table('lhp_tindak_lanjut')->count().' tindak lanjut.');

        return self::SUCCESS;
    }

    /** @param  array<string,mixed>  $src */
    private function baris(array $src, array $keys): array
    {
        return collect($keys)->mapWithKeys(fn ($k) => [$k => $this->nilai($src[$k] ?? null, $k)])->all();
    }

    private function nilai(mixed $v, string $kolom): mixed
    {
        if (is_string($v) && trim($v) === '') {
            return null;
        }
        // Tanggal SimHP kadang '0000-00-00' atau di luar rentang wajar.
        if (str_starts_with($kolom, 'tanggal') && is_string($v) && ! preg_match('/^(19|20)\d\d-\d\d-\d\d/', $v)) {
            return null;
        }
        if (is_string($v)) {
            return $this->teks($v);
        }

        return $v;
    }

    /**
     * Rapikan teks dari ekspor ASCII SimHP: urai escape \xHH (mis. \x0D\x0A =
     * CRLF, \x09 = tab) menjadi karakter aslinya, satukan CRLF jadi LF, dan
     * buang spasi berlebih di tepi tiap baris. Tanpa ini teks tampil dengan
     * "\x0D\x0A" mentah (lihat obrik/memo yang lama).
     */
    private function teks(string $s): string
    {
        $s = preg_replace_callback('/\\\\x([0-9A-Fa-f]{2})/', fn ($m) => chr(hexdec($m[1])), $s);
        $s = str_replace(["\r\n", "\r"], "\n", $s);
        $s = preg_replace("/[ \t]+\n/", "\n", $s);

        return trim($s);
    }
}
