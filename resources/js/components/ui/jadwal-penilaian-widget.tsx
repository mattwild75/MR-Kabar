import { Link } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { CalendarClock, CircleAlert, CircleCheck, CircleDashed, CircleDot } from 'lucide-react';

export interface JadwalTahapan {
  id: number;
  tahapan: string;
  dokumen_pemicu: string | null;
  tanggal_mulai: string | null;
  tanggal_selesai: string | null;
  pelaksana: string | null;
  keluaran: string | null;
  keadaan: 'belum_mulai' | 'berjalan' | 'terlambat' | 'tanpa_tenggat';
}

export interface JadwalArahan {
  id: number;
  jenis: '5_tahunan' | '1_tahunan';
  jenis_label: string;
  tahun_mulai: number;
  tahun_selesai: number;
  nomor_se: string | null;
  tanggal_se: string | null;
  catatan: string | null;
  tahapan: JadwalTahapan[];
}

const KEADAAN = {
  berjalan: {
    label: 'Sedang berjalan',
    Ikon: CircleDot,
    kelas: 'border-sky-500/60 bg-sky-50 dark:bg-sky-950/30',
    teks: 'text-sky-700 dark:text-sky-300',
  },
  terlambat: {
    label: 'Tenggat terlampaui',
    Ikon: CircleAlert,
    kelas: 'border-red-500/60 bg-red-50 dark:bg-red-950/30',
    teks: 'text-red-700 dark:text-red-300',
  },
  belum_mulai: {
    label: 'Belum waktunya',
    Ikon: CircleDashed,
    kelas: 'border-muted-foreground/30',
    teks: 'text-muted-foreground',
  },
  tanpa_tenggat: {
    label: 'Tanpa tenggat',
    Ikon: CircleCheck,
    kelas: 'border-muted-foreground/30',
    teks: 'text-muted-foreground',
  },
} as const;

const tanggal = (v: string | null) =>
  v
    ? new Date(v + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

const rentang = (mulai: string | null, selesai: string | null) => {
  const a = tanggal(mulai);
  const b = tanggal(selesai);
  if (a && b) return `${a} s.d. ${b}`;
  if (b) return `Tenggat ${b}`;
  if (a) return `Mulai ${a}`;
  return 'Tenggat belum ditetapkan';
};

/**
 * Jadwal penyelenggaraan penilaian Risiko untuk tahun berjalan.
 *
 * Isinya bukan karangan aplikasi, melainkan tahapan pada Arahan dan Kebijakan
 * Penilaian Risiko yang ditetapkan Bupati lewat Surat Edaran (Perdep PPKD
 * 4/2019 Lampiran 3 dan 4). Selama Bupati belum menetapkan arahan untuk tahun
 * itu, widget ini berkata terus terang bahwa jadwalnya belum ada — bukan
 * menampilkan tenggat yang tidak pernah diperintahkan siapa pun.
 */
export default function JadwalPenilaianWidget({
  arahan,
  tahun,
  isAdmin,
}: {
  arahan: JadwalArahan[];
  tahun: number;
  isAdmin: boolean;
}) {
  const semuaTahapan = arahan.flatMap((a) => a.tahapan);
  const terlambat = semuaTahapan.filter((t) => t.keadaan === 'terlambat').length;
  const berjalan = semuaTahapan.filter((t) => t.keadaan === 'berjalan').length;

  if (arahan.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-4">
        <div className="flex items-center gap-2">
          <CalendarClock className="text-muted-foreground h-4 w-4" />
          <p className="text-sm font-medium">Jadwal Penilaian Risiko {tahun}</p>
        </div>
        <p className="text-muted-foreground mt-1 text-sm">
          Belum ada Arahan dan Kebijakan Penilaian Risiko yang ditetapkan untuk tahun {tahun}.
          {isAdmin ? (
            <>
              {' '}
              Rekam Surat Edaran Bupati di{' '}
              <Link
                href="/keterangan-pendukung?tab=arahan_penilaian"
                className="font-medium underline underline-offset-2"
              >
                Keterangan Pendukung &rarr; Arahan &amp; Jadwal Penilaian
              </Link>
              .
            </>
          ) : (
            ' Jadwal akan tampil di sini setelah Surat Edaran Bupati direkam Admin.'
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <CalendarClock className="text-muted-foreground h-4 w-4" />
          <p className="text-sm font-medium">Jadwal Penilaian Risiko {tahun}</p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {terlambat > 0 && (
            <Badge className="bg-red-600 hover:bg-red-600">{terlambat} tahapan lewat tenggat</Badge>
          )}
          {berjalan > 0 && (
            <Badge className="bg-sky-600 hover:bg-sky-600">{berjalan} sedang berjalan</Badge>
          )}
          {isAdmin && (
            <Link
              href="/keterangan-pendukung?tab=arahan_penilaian"
              className="text-muted-foreground text-xs underline underline-offset-2"
            >
              Ubah jadwal
            </Link>
          )}
        </div>
      </div>

      <div className="mt-3 space-y-4">
        {arahan.map((a) => (
          <div key={a.id}>
            <p className="text-muted-foreground text-xs">
              {a.jenis_label}
              {a.nomor_se ? ` · Nomor ${a.nomor_se}` : ''}
              {a.tanggal_se ? ` · ${tanggal(a.tanggal_se)}` : ''}
            </p>

            {a.tahapan.length === 0 ? (
              <p className="text-muted-foreground mt-1 text-sm">Belum ada tahapan yang dirinci pada arahan ini.</p>
            ) : (
              <ul className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {a.tahapan.map((t) => {
                  const k = KEADAAN[t.keadaan];
                  const Ikon = k.Ikon;
                  return (
                    <li key={t.id} className={`rounded-md border p-2.5 ${k.kelas}`}>
                      <div className={`flex items-center gap-1.5 text-xs font-medium ${k.teks}`}>
                        <Ikon className="h-3.5 w-3.5 shrink-0" />
                        {k.label}
                      </div>
                      <p className="mt-1 text-sm font-medium">{t.tahapan}</p>
                      <p className="text-muted-foreground text-xs">{rentang(t.tanggal_mulai, t.tanggal_selesai)}</p>
                      {t.dokumen_pemicu && (
                        <p className="text-muted-foreground text-xs">Setelah {t.dokumen_pemicu} disusun</p>
                      )}
                      {t.pelaksana && <p className="text-muted-foreground text-xs">Pelaksana: {t.pelaksana}</p>}
                      {t.keluaran && <p className="text-muted-foreground text-xs">Keluaran: {t.keluaran}</p>}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
