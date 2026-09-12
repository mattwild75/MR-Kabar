<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\IroPd;
use App\Models\IrsPd;
use App\Models\IrsPemda;
use App\Models\Menu;
use App\Models\Opd;
use App\Models\Rpp;
use App\Models\RppPenugasan;
use App\Models\User;
use Illuminate\Http\Request;

/**
 * Pencarian global (Ctrl+K): menu, risiko IRS/IRO, OPD, RPP/penugasan,
 * pegawai ERPIKA, dan pengguna. Hasil DISEKAT persis seperti halaman
 * asalnya — PIC hanya menemukan baris miliknya sendiri, data lintas OPD dan
 * pengguna hanya untuk admin — dan tiap hasil menaut ke halaman yang sudah
 * ada (baris risiko disorot lewat ?highlight_id=). Maksimal 8 per kelompok
 * supaya tetap ringan; ketik lebih spesifik untuk mempersempit.
 */
class PencarianController extends Controller
{
    private const BATAS = 8;

    public function __invoke(Request $request)
    {
        $q = trim((string) $request->input('q', ''));
        if (mb_strlen($q) < 2) {
            return response()->json(['kelompok' => []]);
        }
        $user = $request->user();
        $admin = $user->canViewAllOpd();
        $like = '%'.str_replace(['%', '_'], ['\%', '\_'], $q).'%';
        $kelompok = [];

        // Menu: nama menu yang boleh dilihat pengguna (izin diperiksa
        // ShareMenus di sisi klien; di sini cukup menu yang punya route).
        $menu = Menu::query()->whereNotNull('route')->where('route', '!=', '#')
            ->where('title', 'like', $like)->orderBy('title')->limit(self::BATAS)->get(['title', 'route', 'icon']);
        if ($menu->isNotEmpty()) {
            $kelompok[] = ['judul' => 'Menu', 'butir' => $menu->map(fn ($m) => ['judul' => $m->title, 'sub' => $m->route, 'url' => $m->route, 'ikon' => $m->icon])->all()];
        }

        // Risiko: tiga register, disekat pemilik untuk non-admin.
        $risiko = [];
        foreach ([[IrsPemda::class, 'Risiko Strategis Pemda', '/irs_pemda'], [IrsPd::class, 'Risiko Strategis PD', '/irs_pd'], [IroPd::class, 'Risiko Operasional PD', '/iro_pd']] as [$model, $label, $jalur]) {
            $baris = $model::query()
                ->when(! $admin, fn ($b) => $b->where('user_id', $user->id))
                ->where(fn ($b) => $b->where('URAIAN RISIKO', 'like', $like)->orWhere('NOMOR URUT RISIKO', 'like', $like))
                ->orderByDesc('id')->limit(self::BATAS)->get(['id', 'URAIAN RISIKO', 'NOMOR URUT RISIKO', 'TAHUN DINILAI RISIKO', 'TINGKAT RISIKO']);
            foreach ($baris as $r) {
                $risiko[] = [
                    'judul' => mb_strimwidth((string) $r->{'URAIAN RISIKO'}, 0, 110, '…'),
                    'sub' => $label.' · '.$r->{'NOMOR URUT RISIKO'}.' · TA '.$r->{'TAHUN DINILAI RISIKO'}.($r->{'TINGKAT RISIKO'} ? ' · '.$r->{'TINGKAT RISIKO'} : ''),
                    'url' => $jalur.'?highlight_id='.$r->id.'&tahun='.$r->{'TAHUN DINILAI RISIKO'},
                    'ikon' => 'ShieldAlert',
                ];
            }
        }
        if ($risiko !== []) {
            $kelompok[] = ['judul' => 'Risiko', 'butir' => array_slice($risiko, 0, self::BATAS * 2)];
        }

        if ($admin) {
            $opd = Opd::query()->where('nama', 'like', $like)->orderBy('nama')->limit(self::BATAS)->get(['id', 'nama']);
            if ($opd->isNotEmpty()) {
                $kelompok[] = ['judul' => 'Perangkat Daerah', 'butir' => $opd->map(fn ($o) => ['judul' => $o->nama, 'sub' => 'Dasbor OPD', 'url' => '/dashboard?opd_id='.$o->id, 'ikon' => 'Building2'])->all()];
            }

            $rpp = Rpp::query()->with('category:id,name')
                ->where(fn ($b) => $b->where('nomor_rpp', 'like', $like)->orWhere('judul', 'like', $like))
                ->orderByDesc('year')->limit(self::BATAS)->get(['id', 'nomor_rpp', 'year', 'rpp_category_id', 'judul']);
            $penugasan = RppPenugasan::query()->with('rpp:id,nomor_rpp,year')
                ->where(fn ($b) => $b->where('uraian', 'like', $like)->orWhere('nomor_st', 'like', $like)->orWhereHas('obriks', fn ($o) => $o->where('nama', 'like', $like)))
                ->orderByDesc('id')->limit(self::BATAS)->get(['id', 'rpp_id', 'uraian', 'nomor_st', 'status']);
            $butir = [
                ...$rpp->map(fn ($r) => ['judul' => $r->nomor_rpp, 'sub' => 'RPP '.$r->year.' · '.($r->category?->name ?? ''), 'url' => '/rpp/'.$r->id.'/edit', 'ikon' => 'ClipboardList'])->all(),
                ...$penugasan->map(fn ($p) => ['judul' => $p->uraian ?: ($p->nomor_st ?? 'Penugasan'), 'sub' => ($p->nomor_st ?? '-').' · RPP '.($p->rpp?->nomor_rpp ?? '').' · '.$p->status, 'url' => '/rpp/'.$p->rpp_id.'/edit', 'ikon' => 'FileText'])->all(),
            ];
            if ($butir !== []) {
                $kelompok[] = ['judul' => 'ERPIKA RPP', 'butir' => array_slice($butir, 0, self::BATAS * 2)];
            }

            $pegawai = Employee::query()->where(fn ($b) => $b->where('nama', 'like', $like)->orWhere('nip', 'like', $like))
                ->orderBy('nama')->limit(self::BATAS)->get(['id', 'nama', 'nip', 'jabatan']);
            if ($pegawai->isNotEmpty()) {
                $kelompok[] = ['judul' => 'Pegawai ERPIKA', 'butir' => $pegawai->map(fn ($e) => ['judul' => $e->nama, 'sub' => trim(($e->nip ?? '').' · '.($e->jabatan ?? ''), ' ·'), 'url' => '/erpika/pegawai?cari='.urlencode($e->nama), 'ikon' => 'User'])->all()];
            }

            $pengguna = User::query()->where(fn ($b) => $b->where('name', 'like', $like)->orWhere('username', 'like', $like)->orWhere('email', 'like', $like))
                ->orderBy('name')->limit(self::BATAS)->get(['id', 'name', 'username', 'email']);
            if ($pengguna->isNotEmpty()) {
                $kelompok[] = ['judul' => 'Pengguna', 'butir' => $pengguna->map(fn ($u) => ['judul' => $u->name, 'sub' => $u->username.' · '.$u->email, 'url' => '/users?cari='.urlencode($u->username), 'ikon' => 'UserCog'])->all()];
            }
        }

        return response()->json(['kelompok' => $kelompok]);
    }
}
