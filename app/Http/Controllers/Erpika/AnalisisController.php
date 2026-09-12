<?php

namespace App\Http\Controllers\Erpika;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\Rpp;
use App\Models\RppPenugasan;
use App\Models\RppSetting;
use App\Services\Erpika\PemeriksaanErpikaService;
use App\Services\IngatanRingkasanService;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Tiga tampilan turunan ERPIKA yang HANYA MEMBACA data RPP yang sudah ada:
 * Pemeriksaan (temuan keutuhan), Kalender Penugasan (siapa bertugas kapan,
 * tumpang tindih orang yang sama), dan Beban Kerja (hari DK/LK dan biaya
 * SPPD per pegawai per tahun). Tidak ada formulir; perubahan tetap lewat
 * RPP Perencanaan/Aneva/Pegawai.
 */
class AnalisisController extends Controller
{
    private const TABEL = ['rpps', 'rpp_penugasan', 'rpp_team_members', 'rpp_laporans', 'employees', 'rpp_settings'];

    public function __construct(private readonly IngatanRingkasanService $ingat) {}

    private function tahun(Request $request): int|string
    {
        $t = $request->input('tahun', Rpp::max('year') ?: now()->year);

        return $t === 'semua' ? 'semua' : (int) $t;
    }

    public function pemeriksaan(Request $request, PemeriksaanErpikaService $periksa)
    {
        $tahun = $this->tahun($request);

        return Inertia::render('erpika/Pemeriksaan', [
            'hasil' => $this->ingat->ingat('erpika.pemeriksaan', self::TABEL, ['tahun' => $tahun], fn () => $periksa->periksa($tahun)),
            'tahunTersedia' => $periksa->tahunTersedia(),
            'filters' => ['tahun' => $tahun],
        ]);
    }

    public function kalender(Request $request)
    {
        $bulan = max(1, min(12, (int) $request->input('bulan', now()->month)));
        $tahun = (int) $request->input('tahun', now()->year);
        $mulai = now()->setDate($tahun, $bulan, 1)->startOfDay();
        $selesai = $mulai->copy()->endOfMonth();

        $data = $this->ingat->ingat('erpika.kalender', self::TABEL, compact('bulan', 'tahun'), function () use ($mulai, $selesai) {
            $penugasan = RppPenugasan::query()
                ->with(['rpp:id,nomor_rpp,year,rpp_category_id', 'rpp.category:id,name,kode_nomor', 'teamMembers:id,rpp_penugasan_id,employee_id,nama,role,hari_lapangan', 'obriks:id,rpp_penugasan_id,nama'])
                ->whereNotNull('masa_tugas_mulai')->whereNotNull('masa_tugas_selesai')
                ->where('status', '!=', 'batal')
                ->where('masa_tugas_mulai', '<=', $selesai->toDateString())
                ->where('masa_tugas_selesai', '>=', $mulai->toDateString())
                ->orderBy('masa_tugas_mulai')
                ->get();

            $baris = $penugasan->map(fn (RppPenugasan $p) => [
                'id' => $p->id,
                'rpp_id' => $p->rpp_id,
                'nomor_rpp' => $p->rpp?->nomor_rpp,
                'jenis' => $p->rpp?->category?->name,
                'kode' => $p->rpp?->category?->kode_nomor,
                'uraian' => $p->uraian,
                'obrik' => $p->obriks->pluck('nama')->take(3)->implode('; '),
                'nomor_st' => $p->nomor_st,
                'status' => $p->status,
                'mulai' => $p->masa_tugas_mulai->toDateString(),
                'selesai' => $p->masa_tugas_selesai->toDateString(),
                'tim' => $p->teamMembers->map(fn ($m) => ['employee_id' => $m->employee_id, 'nama' => $m->nama, 'peran' => $m->peranTampil(), 'lk' => (int) $m->hari_lapangan])->values()->all(),
            ])->values()->all();

            // Per orang: daftar penugasan bulan ini + tanda tumpang tindih.
            $perOrang = [];
            foreach ($baris as $b) {
                foreach ($b['tim'] as $m) {
                    if (! $m['employee_id']) {
                        continue;
                    }
                    $perOrang[$m['employee_id']]['nama'] = $m['nama'];
                    $perOrang[$m['employee_id']]['penugasan'][] = ['id' => $b['id'], 'mulai' => $b['mulai'], 'selesai' => $b['selesai'], 'lk' => $m['lk'], 'peran' => $m['peran'], 'nomor_st' => $b['nomor_st'], 'uraian' => $b['uraian']];
                }
            }
            foreach ($perOrang as &$o) {
                usort($o['penugasan'], fn ($a, $b) => strcmp($a['mulai'], $b['mulai']));
                $o['tumpang_tindih'] = 0;
                for ($i = 0; $i < count($o['penugasan']); $i++) {
                    for ($j = $i + 1; $j < count($o['penugasan']); $j++) {
                        if ($o['penugasan'][$j]['mulai'] <= $o['penugasan'][$i]['selesai'] && $o['penugasan'][$i]['lk'] > 0 && $o['penugasan'][$j]['lk'] > 0) {
                            $o['tumpang_tindih']++;
                        }
                    }
                }
            }
            unset($o);
            uasort($perOrang, fn ($a, $b) => [$b['tumpang_tindih'], $a['nama']] <=> [$a['tumpang_tindih'], $b['nama']]);

            return ['penugasan' => $baris, 'perOrang' => array_values($perOrang)];
        });

        return Inertia::render('erpika/Kalender', [
            ...$data,
            'bulan' => $bulan,
            'tahun' => $tahun,
            'jumlahHari' => $mulai->daysInMonth,
            'tahunTersedia' => Rpp::query()->select('year')->distinct()->orderByDesc('year')->pluck('year')->all(),
        ]);
    }

    public function bebanKerja(Request $request)
    {
        $tahun = $this->tahun($request);

        $data = $this->ingat->ingat('erpika.beban', self::TABEL, ['tahun' => $tahun], function () use ($tahun) {
            $s = RppSetting::current();
            $tarif = ['dalam' => (int) $s->tarif_per_hari, 'luar' => (int) $s->tarif_luar_kota];
            $penugasan = RppPenugasan::query()
                ->with(['rpp:id,year,rpp_category_id', 'rpp.category:id,name', 'teamMembers'])
                ->whereHas('rpp', fn ($q) => $tahun === 'semua' ? $q : $q->where('year', $tahun))
                ->where('status', '!=', 'batal')
                ->get();

            $per = [];
            foreach ($penugasan as $p) {
                $tarifSppd = $p->tarifSppd();
                foreach ($p->teamMembers as $m) {
                    $k = $m->employee_id ?: 'n-'.mb_strtolower($m->nama);
                    $per[$k] ??= ['employee_id' => $m->employee_id, 'nama' => $m->nama, 'penugasan' => 0, 'dk' => 0, 'lk' => 0, 'biaya' => 0, 'jenis' => [], 'peran' => []];
                    $per[$k]['penugasan']++;
                    $per[$k]['dk'] += (int) $m->hari_kantor;
                    $per[$k]['lk'] += (int) $m->hari_lapangan;
                    $per[$k]['biaya'] += (int) $m->hari_lapangan * (int) ($m->tarif_per_hari ?: $tarifSppd);
                    $jenis = $p->rpp?->category?->name ?? '-';
                    $per[$k]['jenis'][$jenis] = ($per[$k]['jenis'][$jenis] ?? 0) + 1;
                    $peran = $m->peranTampil();
                    $per[$k]['peran'][$peran] = ($per[$k]['peran'][$peran] ?? 0) + 1;
                }
            }
            $baris = array_values($per);
            usort($baris, fn ($a, $b) => [$b['lk'] + $b['dk'], $a['nama']] <=> [$a['lk'] + $a['dk'], $b['nama']]);
            $aktif = Employee::query()->where('aktif', true)->count();

            return [
                'baris' => $baris,
                'total' => [
                    'pegawai' => count($baris),
                    'pegawai_aktif' => $aktif,
                    'penugasan' => $penugasan->count(),
                    'dk' => array_sum(array_column($baris, 'dk')),
                    'lk' => array_sum(array_column($baris, 'lk')),
                    'biaya' => array_sum(array_column($baris, 'biaya')),
                ],
                'tarif' => $tarif,
            ];
        });

        return Inertia::render('erpika/BebanKerja', [
            ...$data,
            'tahunTersedia' => Rpp::query()->select('year')->distinct()->orderByDesc('year')->pluck('year')->all(),
            'filters' => ['tahun' => $tahun],
        ]);
    }
}
