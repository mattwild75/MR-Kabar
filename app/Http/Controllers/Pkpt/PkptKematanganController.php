<?php

namespace App\Http\Controllers\Pkpt;

use App\Http\Controllers\Concerns\MenjagaPeriodePkpt;
use App\Http\Controllers\Controller;
use App\Models\IroPd;
use App\Models\IrsPd;
use App\Models\Opd;
use App\Models\Pkpt\PkptBobotKematangan;
use App\Models\Pkpt\PkptKematanganMr;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Formulir 3 — tingkat kematangan manajemen risiko dan pembobotan per SKPK.
 *
 * Halaman ini MEMBLOKIR sisa modul: tanpa level, tidak ada bobot, dan Total
 * Nilai Risiko tidak bisa dihitung untuk satu Area pun. Karena itu ia diberi
 * jalan pintas "adopsi skor maturitas SPIP" — Perdep PPKD 08/2020 memang
 * mengizinkan APIP mengadopsi skor maturitas SPIP sebagai langkah awal
 * penerapan, dan tanpa jalan pintas itu penerapan pertama akan tersendat di
 * 49 pengisian tangan.
 */
class PkptKematanganController extends Controller
{
    use MenjagaPeriodePkpt;

    public function index(Request $request)
    {
        $periode = $this->periodeWajib($request);
        $tahun = $periode->tahun_dasar_risiko;

        $tersimpan = PkptKematanganMr::where('periode_id', $periode->id)->get()->keyBy('opd_id');
        $punyaRegister = $this->opdPunyaRegister($tahun);

        $baris = Opd::orderBy('nama')->get(['id', 'nama'])->map(function ($opd) use ($tersimpan, $punyaRegister) {
            $k = $tersimpan->get($opd->id);

            return [
                'opd_id' => $opd->id,
                'nama' => $opd->nama,
                'punya_register' => $punyaRegister->has($opd->id),
                'jumlah_risiko' => $punyaRegister->get($opd->id, 0),
                'level_mr' => $k?->level_mr,
                'sumber_penetapan' => $k?->sumber_penetapan,
                'skor_spip' => $k?->skor_spip,
                'strategi_pengawasan' => $k?->strategi_pengawasan,
                'bobot_register' => $k?->bobot_register,
                'bobot_faktor' => $k?->bobot_faktor,
                'keterangan' => $k?->keterangan,
            ];
        });

        return Inertia::render('pkpt/KematanganMr', [
            ...$this->konteksPkpt($request, $periode),
            'baris' => $baris,
            'acuan' => PkptBobotKematangan::terurut()->values(),
        ]);
    }

    /** Cacah risiko per OPD pada tahun dasar, untuk kolom bantu di layar. */
    private function opdPunyaRegister(int $tahun)
    {
        $hitung = [];

        foreach ([IrsPd::class => 'tbl_irs_pd', IroPd::class => 'tbl_iro_pd'] as $model => $tabel) {
            $model::where('TAHUN DINILAI RISIKO', $tahun)
                ->join('users', $tabel.'.user_id', '=', 'users.id')
                ->whereNotNull('users.opd_id')
                ->selectRaw('users.opd_id, COUNT(*) as n')
                ->groupBy('users.opd_id')
                ->get()
                ->each(function ($r) use (&$hitung) {
                    $hitung[$r->opd_id] = ($hitung[$r->opd_id] ?? 0) + $r->n;
                });
        }

        return collect($hitung);
    }

    public function update(Request $request, Opd $opd)
    {
        $periode = $this->periodeWajib($request);
        $this->pastikanBolehMengisi($request, $periode);

        $data = $request->validate([
            'level_mr' => ['nullable', 'integer', 'min:0', 'max:5'],
            'sumber_penetapan' => ['nullable', 'in:maturitas_spip_skpk,maturitas_spip_pemda,penilaian_inspektorat'],
            'skor_spip' => ['nullable', 'numeric', 'min:0', 'max:5'],
            'keterangan' => ['nullable', 'string', 'max:2000'],
        ], [], ['level_mr' => 'Level kematangan MR']);

        PkptKematanganMr::updateOrCreate(
            ['periode_id' => $periode->id, 'opd_id' => $opd->id],
            [...$data, ...$this->turunanDariLevel($data['level_mr'] ?? null)]
        );

        return back()->with('success', 'Tingkat kematangan '.$opd->nama.' disimpan.');
    }

    /**
     * Menetapkan level untuk SELURUH SKPK sekaligus dari satu skor maturitas
     * SPIP tingkat kabupaten.
     *
     * Ini jalan pintas yang jujur, bukan tebakan: Perdep menyebut APIP boleh
     * memakai skor maturitas SPIP Pemerintah Daerah apabila satuan kerjanya
     * belum punya skor tersendiri. Yang tersimpan mencatat sumbernya, jadi
     * terbaca di kertas kerja bahwa levelnya diadopsi, bukan dinilai satu per
     * satu.
     */
    public function adopsiSpip(Request $request)
    {
        $periode = $this->periodeWajib($request);
        $this->pastikanBolehMengisi($request, $periode);

        $data = $request->validate([
            'skor_spip' => ['required', 'numeric', 'min:0', 'max:5'],
            'timpa' => ['nullable', 'boolean'],
        ], [], ['skor_spip' => 'Skor maturitas SPIP']);

        $level = $this->levelDariSkorSpip((float) $data['skor_spip']);
        $turunan = $this->turunanDariLevel($level);
        $timpa = (bool) ($data['timpa'] ?? false);
        $diisi = 0;

        foreach (Opd::pluck('id') as $opdId) {
            $ada = PkptKematanganMr::where('periode_id', $periode->id)->where('opd_id', $opdId)->first();

            if ($ada && ! $timpa && $ada->level_mr !== null) {
                continue;
            }

            PkptKematanganMr::updateOrCreate(
                ['periode_id' => $periode->id, 'opd_id' => $opdId],
                [
                    'level_mr' => $level,
                    'sumber_penetapan' => 'maturitas_spip_pemda',
                    'skor_spip' => $data['skor_spip'],
                    ...$turunan,
                ]
            );
            $diisi++;
        }

        return back()->with('success',
            'Skor maturitas SPIP '.$data['skor_spip'].' diadopsi menjadi Level '.$level
            .' untuk '.$diisi.' Perangkat Daerah.');
    }

    /**
     * Tabel 4 Lampiran Keputusan: skor maturitas SPIP ke level kematangan MR.
     * Batas bawah inklusif, batas atas eksklusif, kecuali skor 5 tepat.
     */
    private function levelDariSkorSpip(float $skor): int
    {
        return match (true) {
            $skor >= 5 => 5,
            $skor >= 4 => 4,
            $skor >= 3 => 3,
            $skor >= 2 => 2,
            $skor >= 1 => 1,
            default => 0,
        };
    }

    /**
     * Bobot dan strategi DISALIN dari tabel acuan saat level ditetapkan.
     *
     * Bukan dibaca ulang saat menghitung: kertas kerja ini melekat pada
     * Keputusan yang ditandatangani, dan mengubah bobot acuan tahun depan
     * tidak boleh mengubah dokumen yang sudah ditetapkan.
     */
    private function turunanDariLevel(?int $level): array
    {
        if ($level === null) {
            return ['bobot_register' => null, 'bobot_faktor' => null, 'strategi_pengawasan' => null];
        }

        $acuan = PkptBobotKematangan::terurut()->get($level);

        return [
            'bobot_register' => $acuan?->bobot_register,
            'bobot_faktor' => $acuan?->bobot_faktor,
            'strategi_pengawasan' => $acuan
                ? $acuan->strategi_assurance.' Konsultasi: '.$acuan->strategi_consulting
                : null,
        ];
    }
}
