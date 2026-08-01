import { AlertTriangle, CheckCircle2, Users } from 'lucide-react';

export interface RekapKuis {
  jumlah_pengisi: number;
  jumlah_pengisian: number;
  rata_benar: number | null;
  gagal_per_soal: number[];
  terakhir: {
    nama: string;
    opd: string | null;
    benar: number;
    total: number;
    waktu: string | null;
  }[];
}

/**
 * Judul pendek tiap soal, sepadan dengan urutan `SOAL` pada
 * `edu-video-quiz.tsx`. Ditulis di sini, bukan diambil dari komponen kuisnya,
 * supaya rekap ini tetap terbaca tanpa memuat seluruh daftar soal.
 */
const SOAL_PENDEK = [
  'Penanggung Jawab Pengelolaan Risiko',
  'Penyebab, bukan risiko',
  'Yang dikerjakan sebelum menilai risiko',
  'Matriks: Dampak 5 × Kemungkinan 1',
  'Selera Risiko dan kewajiban RTP',
];

/** Bagian video dinyatakan perlu diperbaiki bila gagal pada 3 dari 5 pengisi. */
const AMBANG = 0.6;

/**
 * Rekap kuis uji pemahaman, hanya untuk yang boleh melihat seluruh OPD.
 *
 * Yang ditonjolkan kegagalan PER SOAL, bukan nilai rata-rata. Nilai rata-rata
 * 3 dari 5 tidak memberi tahu apa pun tentang bagian video mana yang perlu
 * direkam ulang — dan itulah satu-satunya keputusan yang hendak diambil dari
 * halaman ini.
 */
export default function RekapKuisVideo({ rekap }: { rekap: RekapKuis }) {
  const kosong = rekap.jumlah_pengisian === 0;

  return (
    <div className="rounded-lg border p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Users className="text-muted-foreground h-4 w-4" />
        <p className="text-sm font-medium">Hasil uji pemahaman</p>
        <span className="text-muted-foreground text-xs">hanya terlihat oleh Admin</span>
      </div>

      {kosong ? (
        <p className="text-muted-foreground mt-2 text-sm">
          Belum ada yang mengisi. Mintalah tiga sampai lima PIC Perangkat Daerah menonton video
          sampai habis tanpa dijelaskan, lalu menjawab kelima pertanyaan tanpa memutar ulang.
        </p>
      ) : (
        <>
          <p className="text-muted-foreground mt-1 text-sm">
            {rekap.jumlah_pengisi} pengisi &middot; {rekap.jumlah_pengisian} kali pengisian
            {rekap.rata_benar !== null && <> &middot; rata-rata benar {rekap.rata_benar} dari 5</>}
          </p>

          <p className="mt-3 text-xs font-medium">Kegagalan per pertanyaan</p>
          <ul className="mt-1.5 space-y-1.5">
            {SOAL_PENDEK.map((judul, i) => {
              const gagal = rekap.gagal_per_soal[i] ?? 0;
              const rasio = rekap.jumlah_pengisian ? gagal / rekap.jumlah_pengisian : 0;
              const perluDiperbaiki = rasio >= AMBANG;
              return (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <span
                    className={`w-10 shrink-0 text-right font-medium tabular-nums ${
                      perluDiperbaiki ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'
                    }`}
                  >
                    {gagal}/{rekap.jumlah_pengisian}
                  </span>
                  <span className="bg-muted h-1.5 flex-1 overflow-hidden rounded-full">
                    <span
                      className={`block h-full rounded-full ${
                        perluDiperbaiki ? 'bg-red-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.round(rasio * 100)}%` }}
                    />
                  </span>
                  <span className="w-64 shrink-0 truncate text-xs" title={judul}>
                    {i + 1}. {judul}
                  </span>
                </li>
              );
            })}
          </ul>

          {rekap.gagal_per_soal.some(
            (g) => rekap.jumlah_pengisian && g / rekap.jumlah_pengisian >= AMBANG,
          ) ? (
            <p className="mt-3 flex items-start gap-1.5 text-xs text-red-600 dark:text-red-400">
              <AlertTriangle className="mt-px h-3.5 w-3.5 shrink-0" />
              Pertanyaan bertanda merah gagal pada tiga dari lima pengisi atau lebih. Bagian video
              yang menjelaskannya perlu diperbaiki, bukan penontonnya yang perlu diminta mengulang.
            </p>
          ) : (
            <p className="text-muted-foreground mt-3 flex items-start gap-1.5 text-xs">
              <CheckCircle2 className="mt-px h-3.5 w-3.5 shrink-0 text-emerald-600" />
              Belum ada pertanyaan yang gagal pada tiga dari lima pengisi.
            </p>
          )}

          <p className="mt-4 text-xs font-medium">Pengisian terakhir</p>
          <div className="mt-1.5 overflow-x-auto">
            <table className="w-full text-xs">
              <tbody>
                {rekap.terakhir.map((h, i) => (
                  <tr key={i} className="border-t">
                    <td className="py-1 pr-3">{h.nama}</td>
                    <td className="text-muted-foreground py-1 pr-3">{h.opd ?? '—'}</td>
                    <td className="py-1 pr-3 font-medium tabular-nums">
                      {h.benar}/{h.total}
                    </td>
                    <td className="text-muted-foreground py-1 whitespace-nowrap">{h.waktu ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
