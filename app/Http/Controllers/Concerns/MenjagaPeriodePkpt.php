<?php

namespace App\Http\Controllers\Concerns;

use App\Models\Pkpt\PkptPeriode;
use Illuminate\Http\Request;

/**
 * Satu tempat untuk memilih periode PKPT yang sedang dikerjakan dan menolak
 * tulis ke periode yang sudah ditetapkan.
 *
 * KENAPA PENGUNCIAN ITU PENTING. Kertas kerja PKPT melekat pada Keputusan
 * Inspektur yang ditandatangani dan dilampirkan. Tanpa penguncian, angka pada
 * lampiran dan angka di layar akan berbeda suatu hari, dan tidak akan ada
 * yang tahu kapan mulai berbeda. Karena itu penolakannya di tingkat
 * controller, bukan cuma tombol yang disembunyikan di layar.
 *
 * Kode 423 Locked, bukan 403: yang bermasalah bukan siapa yang meminta,
 * melainkan keadaan sumber dayanya.
 */
trait MenjagaPeriodePkpt
{
    /**
     * Periode yang sedang dikerjakan.
     *
     * Diambil dari query ?periode=, dengan cadangan periode rancangan
     * terbaru, lalu periode mana pun yang terbaru. Pola yang sama dengan
     * ?tahun= pada Form Cetak yang sudah ada.
     */
    protected function periodeAktif(Request $request): ?PkptPeriode
    {
        $id = $request->integer('periode');

        if ($id) {
            $pilih = PkptPeriode::find($id);
            if ($pilih) {
                return $pilih;
            }
        }

        return PkptPeriode::where('status', 'rancangan')->orderByDesc('tahun_pkpt')->first()
            ?? PkptPeriode::orderByDesc('tahun_pkpt')->first();
    }

    /** Periode aktif, atau 404 kalau belum ada satu pun periode dibuat. */
    protected function periodeWajib(Request $request): PkptPeriode
    {
        $periode = $this->periodeAktif($request);

        abort_if($periode === null, 404, 'Belum ada Periode PKPT. Buat lebih dahulu di menu Ikhtisar dan Periode.');

        return $periode;
    }

    protected function pastikanIzin(Request $request, string $izin): void
    {
        abort_unless(
            $request->user()?->can($izin),
            403,
            'Anda tidak memiliki izin '.$izin.' untuk tindakan ini.'
        );
    }

    /** Gerbang baku untuk setiap penulisan kertas kerja. */
    protected function pastikanBolehMengisi(Request $request, PkptPeriode $periode): void
    {
        $this->pastikanIzin($request, 'pkpt-input');
        $this->pastikanPeriodeTerbuka($periode);
    }

    protected function pastikanPeriodeTerbuka(PkptPeriode $periode): void
    {
        abort_if(
            $periode->terkunci(),
            423,
            'Periode PKPT '.$periode->tahun_pkpt.' berstatus '.$periode->status
                .' dan tidak dapat diubah. Buka kembali lewat menu Ikhtisar dan Periode bila memang perlu.'
        );
    }

    /**
     * Props yang dibagikan ke SETIAP halaman PKPT: periode aktif, daftar
     * periode untuk pemilihnya, dan hak yang dipunyai pemakai.
     *
     * Hak ikut dikirim supaya layar bisa menonaktifkan kontrol yang memang
     * akan ditolak controller — bukan sebagai pengaman (pengamannya di
     * controller), melainkan supaya pemakai tidak menekan tombol yang sudah
     * pasti gagal.
     */
    protected function konteksPkpt(Request $request, ?PkptPeriode $periode): array
    {
        $user = $request->user();

        return [
            'periode' => $periode?->only([
                'id', 'tahun_pkpt', 'tahun_dasar_risiko', 'status',
                'total_belanja_langsung', 'nomor_keputusan', 'tanggal_penetapan',
            ]),
            'terkunci' => (bool) $periode?->terkunci(),
            'daftarPeriode' => PkptPeriode::orderByDesc('tahun_pkpt')
                ->get(['id', 'tahun_pkpt', 'tahun_dasar_risiko', 'status']),
            'hak' => [
                'input' => (bool) $user?->can('pkpt-input'),
                'hitung' => (bool) $user?->can('pkpt-hitung'),
                'rencana' => (bool) $user?->can('pkpt-rencana'),
                'tetapkan' => (bool) $user?->can('pkpt-tetapkan'),
                'pengaturan' => (bool) $user?->can('pkpt-pengaturan'),
            ],
        ];
    }
}
