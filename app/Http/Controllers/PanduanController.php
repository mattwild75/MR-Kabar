<?php

namespace App\Http\Controllers;

use App\Models\KuisVideoHasil;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Halaman Panduan, berikut kuis uji pemahaman video edukasi.
 *
 * Rekap kuis hanya dikirim kepada yang boleh melihat seluruh OPD. Bagi PIC,
 * halaman ini tidak berubah: ia mengisi, melihat koreksinya sendiri, selesai.
 */
class PanduanController extends Controller
{
    /**
     * Kunci jawaban, sepadan dengan `SOAL` pada
     * `resources/js/components/edu-video-quiz.tsx` — indeks pilihan yang benar
     * untuk tiap soal, berurutan.
     *
     * Disimpan di sisi server, bukan menerima cacah benar dari peramban.
     * Bukan karena curang dikhawatirkan — kuis ini tidak menentukan apa pun
     * bagi pengisinya — melainkan karena rekapnya dipakai memutuskan bagian
     * video mana yang perlu direkam ulang. Angka yang dikirim peramban bisa
     * meleset hanya karena versi berkas JavaScript-nya belum ikut termuat
     * ulang sesudah kuisnya diperbaiki, dan kekeliruan itu tidak akan pernah
     * kelihatan.
     *
     * Kalau soalnya diubah, ubah pula di sini.
     */
    private const KUNCI = [1, 1, 1, 2, 3];

    private const JUMLAH_SOAL = 5;

    public function index(Request $request)
    {
        $bolehLihatRekap = $request->user()->canViewAllOpd();

        return Inertia::render('panduan/Index', [
            'bolehLihatRekap' => $bolehLihatRekap,
            'rekapKuis' => $bolehLihatRekap ? $this->rekap() : null,
        ]);
    }

    public function simpanKuis(Request $request)
    {
        $data = $request->validate([
            'jawaban' => ['required', 'array', 'size:'.self::JUMLAH_SOAL],
            'jawaban.*' => ['required', 'integer', 'min:0', 'max:3'],
        ]);

        $jawaban = array_values($data['jawaban']);
        $benar = count(array_filter(
            self::KUNCI,
            fn ($kunci, $i) => ($jawaban[$i] ?? null) === $kunci,
            ARRAY_FILTER_USE_BOTH
        ));

        $user = $request->user();

        KuisVideoHasil::create([
            'user_id' => $user->id,
            // Disalin, bukan dibaca lewat relasi saat menampilkan rekap: nama
            // dan OPD pengisi harus tetap terbaca sekalipun akunnya kelak
            // dihapus atau dipindah ke OPD lain.
            'nama_pengisi' => $user->name,
            'opd_nama' => $user->opd?->nama,
            'jawaban' => $jawaban,
            'benar' => $benar,
            'total' => self::JUMLAH_SOAL,
        ]);

        return back()->with('success', 'Jawaban Anda tersimpan. Terima kasih sudah mengisi.');
    }

    /**
     * Rekap yang menjawab satu pertanyaan saja: bagian video mana yang gagal
     * dipahami banyak orang. Karena itu yang dihitung kegagalan PER SOAL,
     * bukan nilai rata-rata — nilai rata-rata 3 dari 5 sama sekali tidak
     * memberi tahu soal mana yang perlu direkam ulang.
     */
    private function rekap(): array
    {
        $hasil = KuisVideoHasil::orderByDesc('created_at')->get();

        $gagalPerSoal = array_fill(0, self::JUMLAH_SOAL, 0);
        foreach ($hasil as $h) {
            foreach (self::KUNCI as $i => $kunci) {
                if (($h->jawaban[$i] ?? null) !== $kunci) {
                    $gagalPerSoal[$i]++;
                }
            }
        }

        return [
            'jumlah_pengisi' => $hasil->unique('user_id')->count(),
            'jumlah_pengisian' => $hasil->count(),
            'rata_benar' => $hasil->isEmpty() ? null : round($hasil->avg('benar'), 1),
            'gagal_per_soal' => $gagalPerSoal,
            'terakhir' => $hasil->take(20)->map(fn ($h) => [
                'nama' => $h->nama_pengisi,
                'opd' => $h->opd_nama,
                'benar' => $h->benar,
                'total' => $h->total,
                'waktu' => $h->created_at?->translatedFormat('j M Y H:i'),
            ])->values()->all(),
        ];
    }
}
