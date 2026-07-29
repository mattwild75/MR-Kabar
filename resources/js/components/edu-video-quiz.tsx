import { useState } from 'react';
import { Button } from '@/components/ui/button';

/**
 * Uji pemahaman singkat setelah menonton video edukasi.
 *
 * Kelimanya sengaja menyasar hal yang PALING SERING keliru di lapangan, bukan
 * hafalan istilah: siapa penanggung jawabnya, beda risiko dengan penyebab,
 * urutan tahap, cara membaca matriks, dan batas wajib RTP. Kalau satu
 * pertanyaan sering gagal di banyak orang, bagian video itulah yang perlu
 * diperbaiki — bukan orangnya.
 */
interface Soal {
    tanya: string;
    pilihan: string[];
    benar: number;
    alasan: string;
    bab: string;
}

const SOAL: Soal[] = [
    {
        tanya: 'Siapa Penanggung Jawab Pengelolaan Risiko di pemerintah kabupaten?',
        pilihan: ['Inspektorat', 'Kepala Daerah', 'Sekretaris Daerah', 'PIC di masing-masing OPD'],
        benar: 1,
        alasan:
            'Kepala Daerah — tunggal dan tidak didelegasikan. Sekretaris Daerah adalah Koordinator Penyelenggaraan, sedangkan Inspektorat berperan sebagai Lini Ketiga yang mengevaluasi secara independen.',
        bab: '3:02 — Siapa yang bertanggung jawab',
    },
    {
        tanya: '"Anggaran tidak mencukupi" — dalam kertas kerja, ini termasuk apa?',
        pilihan: ['Risiko', 'Penyebab', 'Dampak', 'Rencana Tindak Pengendalian'],
        benar: 1,
        alasan:
            'Itu penyebab. Rumusnya: karena PENYEBAB, mungkin terjadi RISIKO, sehingga menimbulkan DAMPAK. Risikonya bisa berupa "keterlambatan penyelesaian pekerjaan fisik".',
        bab: '9:15 — Menulis pernyataan risiko',
    },
    {
        tanya: 'Menurut Bab III Perdep, apa yang dikerjakan SEBELUM menilai risiko?',
        pilihan: [
            'Menyusun Rencana Tindak Pengendalian',
            'Mengidentifikasi kelemahan lingkungan pengendalian (CEE)',
            'Menetapkan konteks di KRS',
            'Mencetak Form 3a',
        ],
        benar: 1,
        alasan:
            'Tahap 1 adalah Identifikasi Kelemahan Lingkungan Pengendalian lewat CEE (Form 1a, 1b, 1c). Menilai risiko tanpa itu seperti memasang atap sebelum memeriksa pondasi.',
        bab: '6:40 — Tahap 1 (CEE)',
    },
    {
        tanya: 'Dampak 5 dan Kemungkinan 1 menghasilkan Skala Risiko berapa?',
        pilihan: ['5', '9', '20', '25'],
        benar: 2,
        alasan:
            'Dua puluh. Matriksnya BUKAN perkalian, melainkan peringkat 1–25 yang sengaja memberi bobot lebih besar pada dampak. Bandingkan: Dampak 1 × Kemungkinan 5 hanya menghasilkan 9.',
        bab: '12:35 — Matriks 5×5',
    },
    {
        tanya: 'Kategori mana yang WAJIB punya Rencana Tindak Pengendalian?',
        pilihan: [
            'Hanya Sangat Tinggi',
            'Sangat Tinggi dan Tinggi',
            'Sangat Tinggi, Tinggi, dan Moderat',
            'Semua kategori tanpa kecuali',
        ],
        benar: 2,
        alasan:
            'Sangat Tinggi, Tinggi, dan Moderat — ketiganya tidak bisa diterima. Rendah dan Sangat Rendah masih bisa diterima, cukup dipantau.',
        bab: '12:35 — Matriks 5×5',
    },
];

export default function EduVideoQuiz() {
    const [jawaban, setJawaban] = useState<(number | null)[]>(Array(SOAL.length).fill(null));
    const [dikoreksi, setDikoreksi] = useState(false);

    const terjawab = jawaban.filter((j) => j !== null).length;
    const benar = jawaban.filter((j, i) => j === SOAL[i].benar).length;

    return (
        <div className="space-y-5">
            <div>
                <h4 className="text-base font-semibold">Uji pemahaman — 5 pertanyaan</h4>
                <p className="text-muted-foreground text-sm">
                    Jawab tanpa memutar ulang videonya. Pertanyaan yang gagal menunjukkan bagian mana yang perlu
                    ditonton sekali lagi.
                </p>
            </div>

            {SOAL.map((s, i) => {
                const dipilih = jawaban[i];
                return (
                    <div key={i} className="space-y-2 rounded-md border p-4">
                        <p className="text-sm font-medium">
                            {i + 1}. {s.tanya}
                        </p>
                        <div className="grid gap-1.5">
                            {s.pilihan.map((p, k) => {
                                const iniBenar = dikoreksi && k === s.benar;
                                const iniSalah = dikoreksi && dipilih === k && k !== s.benar;
                                return (
                                    <label
                                        key={k}
                                        className={`flex cursor-pointer items-start gap-2.5 rounded px-2.5 py-1.5 text-sm transition ${
                                            iniBenar
                                                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                                                : iniSalah
                                                  ? 'bg-red-500/10 text-red-700 dark:text-red-400'
                                                  : 'hover:bg-muted'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name={`soal-${i}`}
                                            className="mt-1"
                                            checked={dipilih === k}
                                            disabled={dikoreksi}
                                            onChange={() =>
                                                setJawaban((a) => a.map((v, idx) => (idx === i ? k : v)))
                                            }
                                        />
                                        <span>{p}</span>
                                    </label>
                                );
                            })}
                        </div>
                        {dikoreksi && (
                            <p className="text-muted-foreground border-l-2 pl-3 text-xs leading-relaxed">
                                {s.alasan}{' '}
                                <span className="font-medium">Tonton ulang: {s.bab}</span>
                            </p>
                        )}
                    </div>
                );
            })}

            <div className="flex flex-wrap items-center gap-3">
                {!dikoreksi ? (
                    <>
                        <Button type="button" disabled={terjawab < SOAL.length} onClick={() => setDikoreksi(true)}>
                            Periksa jawaban
                        </Button>
                        <span className="text-muted-foreground text-sm">
                            {terjawab} dari {SOAL.length} terjawab
                        </span>
                    </>
                ) : (
                    <>
                        <span className="text-sm font-semibold">
                            Benar {benar} dari {SOAL.length}
                        </span>
                        <span className="text-muted-foreground text-sm">
                            {benar === SOAL.length
                                ? 'Lengkap — silakan mulai mengisi Data Umum.'
                                : 'Tonton ulang bagian yang ditandai di atas.'}
                        </span>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setJawaban(Array(SOAL.length).fill(null));
                                setDikoreksi(false);
                            }}
                        >
                            Ulangi
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}
