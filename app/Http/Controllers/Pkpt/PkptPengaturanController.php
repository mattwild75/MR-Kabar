<?php

namespace App\Http\Controllers\Pkpt;

use App\Http\Controllers\Concerns\MenjagaPeriodePkpt;
use App\Http\Controllers\Controller;
use App\Models\Pkpt\PkptBobotKematangan;
use App\Models\Pkpt\PkptFaktor;
use App\Models\Pkpt\PkptKonversiInheren;
use App\Models\Pkpt\PkptSektorUnggulan;
use App\Models\Pkpt\PkptTingkatRisiko;
use App\Models\Pkpt\PkptZonaFrekuensi;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Pengaturan PPBR — tabel acuan yang ditetapkan Keputusan Inspektur.
 *
 * KENAPA BISA DISUNTING SAMA SEKALI: karena Keputusan Inspektur yang
 * menetapkan angkanya, dan Keputusan bisa diubah. Yang tidak boleh adalah
 * perubahan itu merambat mundur ke periode yang sudah ditetapkan — dicegah
 * dengan menyimpan bobot pada pkpt_kematangan_mr dan hasil pada
 * pkpt_penilaian, bukan menghitung ulang dari tabel acuan setiap kali.
 *
 * Halaman ini milik pimpinan: menu-nya sendiri berpagar pkpt-pengaturan,
 * berbeda dari halaman PKPT lain yang cukup pkpt-view.
 */
class PkptPengaturanController extends Controller
{
    use MenjagaPeriodePkpt;

    public function index(Request $request)
    {
        $periode = $this->periodeAktif($request);

        return Inertia::render('pkpt/Pengaturan', [
            ...$this->konteksPkpt($request, $periode),
            'bobotKematangan' => PkptBobotKematangan::terurut()->values(),
            'konversiInheren' => PkptKonversiInheren::terurut()->values(),
            'faktor' => PkptFaktor::terurut()->values(),
            'zona' => PkptZonaFrekuensi::terurut()->values(),
            'tingkat' => PkptTingkatRisiko::terurut()->values(),
            'sektorUnggulan' => $periode
                ? PkptSektorUnggulan::where('periode_id', $periode->id)->orderBy('nama')->get()
                : collect(),
        ]);
    }

    /**
     * Menyimpan bobot faktor.
     *
     * Jumlah kelima bobot WAJIB tepat 100. Kalau tidak, skala gabungannya
     * tidak lagi berada pada rentang 1 sampai 5 dan seluruh peringkat menjadi
     * tidak sebanding dengan tabel mana pun di Keputusan.
     */
    public function simpanBobotFaktor(Request $request)
    {
        $this->pastikanIzin($request, 'pkpt-pengaturan');

        $data = $request->validate([
            'faktor' => ['required', 'array', 'size:5'],
            'faktor.*.kode' => ['required', 'string', 'exists:pkpt_faktor,kode'],
            'faktor.*.bobot_persen' => ['required', 'integer', 'min:0', 'max:100'],
        ]);

        $jumlah = array_sum(array_column($data['faktor'], 'bobot_persen'));
        if ($jumlah !== 100) {
            return back()->withErrors([
                'faktor' => 'Jumlah bobot kelima faktor harus tepat 100%, sekarang '.$jumlah.'%. '
                    .'Di luar itu, skala gabungannya keluar dari rentang 1 sampai 5.',
            ]);
        }

        foreach ($data['faktor'] as $f) {
            PkptFaktor::where('kode', $f['kode'])->first()?->update(['bobot_persen' => $f['bobot_persen']]);
        }

        return back()->with('success', 'Bobot Faktor Pertimbangan Manajemen disimpan.');
    }

    /** Bobot Register Risiko lawan Faktor per level kematangan (Tabel 6). */
    public function simpanBobotKematangan(Request $request)
    {
        $this->pastikanIzin($request, 'pkpt-pengaturan');

        $data = $request->validate([
            'bobot' => ['required', 'array'],
            'bobot.*.level_mr' => ['required', 'integer', 'min:0', 'max:5'],
            'bobot.*.bobot_register' => ['required', 'integer', 'min:0', 'max:100'],
        ]);

        foreach ($data['bobot'] as $b) {
            PkptBobotKematangan::where('level_mr', $b['level_mr'])->first()?->update([
                'bobot_register' => $b['bobot_register'],
                'bobot_faktor' => 100 - $b['bobot_register'],
            ]);
        }

        return back()->with('success', 'Komposisi bobot per tingkat kematangan disimpan. '
            .'Periode yang sudah ditetapkan tidak terpengaruh.');
    }

    public function tambahSektorUnggulan(Request $request)
    {
        $periode = $this->periodeWajib($request);
        $this->pastikanIzin($request, 'pkpt-pengaturan');

        $nama = $request->validate([
            'nama' => ['required', 'string', 'max:255'],
        ])['nama'];

        PkptSektorUnggulan::firstOrCreate(['periode_id' => $periode->id, 'nama' => trim($nama)]);

        return back()->with('success', 'Sektor unggulan ditambahkan.');
    }

    public function hapusSektorUnggulan(Request $request, PkptSektorUnggulan $sektor)
    {
        $this->pastikanIzin($request, 'pkpt-pengaturan');

        $sektor->delete();

        return back()->with('success', 'Sektor unggulan dihapus.');
    }
}
