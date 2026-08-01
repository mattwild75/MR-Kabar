import { Link } from '@inertiajs/react';
import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  CircleDashed,
  CircleDot,
} from 'lucide-react';

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

/**
 * `penanda` mewarnai bulatan pada sumbu, `garis` mewarnai ruas sumbu yang
 * ditempatinya. Keduanya sengaja dipisah dari `kelas` kartu supaya keadaan
 * tahapan tetap terbaca dari sumbunya saja, tanpa perlu membaca kartunya.
 */
const KEADAAN = {
  berjalan: {
    label: 'Sedang berjalan',
    Ikon: CircleDot,
    kelas: 'border-sky-500/60 bg-sky-50 dark:bg-sky-950/30',
    teks: 'text-sky-700 dark:text-sky-300',
    penanda: 'border-sky-500 bg-sky-500 text-white',
    garis: 'bg-sky-500/50',
  },
  terlambat: {
    label: 'Tenggat terlampaui',
    Ikon: CircleAlert,
    kelas: 'border-red-500/60 bg-red-50 dark:bg-red-950/30',
    teks: 'text-red-700 dark:text-red-300',
    penanda: 'border-red-500 bg-red-500 text-white',
    garis: 'bg-red-500/50',
  },
  belum_mulai: {
    label: 'Belum waktunya',
    Ikon: CircleDashed,
    kelas: 'border-muted-foreground/30',
    teks: 'text-muted-foreground',
    penanda: 'border-muted-foreground/40 bg-background text-muted-foreground',
    garis: 'bg-border',
  },
  tanpa_tenggat: {
    label: 'Tanpa tenggat',
    Ikon: CircleCheck,
    kelas: 'border-muted-foreground/30',
    teks: 'text-muted-foreground',
    penanda: 'border-muted-foreground/40 bg-background text-muted-foreground',
    garis: 'bg-border',
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

/** Kartu satu tahapan, berikut panah kecil yang menunjuk ke sumbu waktu. */
function KartuTahapan({ tahapan, diAtas }: { tahapan: JadwalTahapan; diAtas: boolean }) {
  const k = KEADAAN[tahapan.keadaan];
  const Ikon = k.Ikon;
  return (
    <div className={`relative mx-2 rounded-md border p-2.5 ${k.kelas}`}>
      {/*
        Panah dibuat dari kotak yang diputar 45 derajat, dengan dua sisi
        bersebelahan saja yang bergaris. Sisi yang menghadap sumbu dibiarkan
        polos supaya garis kartunya terlihat menyambung ke panah, bukan
        terpotong garis melintang.
      */}
      <span
        aria-hidden
        className={`absolute left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border ${k.kelas} ${
          diAtas ? '-bottom-[7px] border-t-0 border-l-0' : '-top-[7px] border-r-0 border-b-0'
        }`}
      />
      <div className={`flex items-center gap-1.5 text-xs font-medium ${k.teks}`}>
        <Ikon className="h-3.5 w-3.5 shrink-0" />
        {k.label}
      </div>
      <p className="mt-1 text-sm leading-snug font-medium">{tahapan.tahapan}</p>
      <p className="text-muted-foreground text-xs">
        {rentang(tahapan.tanggal_mulai, tahapan.tanggal_selesai)}
      </p>
      {tahapan.dokumen_pemicu && (
        <p className="text-muted-foreground text-xs">Setelah {tahapan.dokumen_pemicu} disusun</p>
      )}
      {tahapan.pelaksana && (
        <p className="text-muted-foreground text-xs">Pelaksana: {tahapan.pelaksana}</p>
      )}
      {tahapan.keluaran && (
        <p className="text-muted-foreground text-xs">Keluaran: {tahapan.keluaran}</p>
      )}
    </div>
  );
}

/**
 * Garis waktu mendatar: satu sumbu menerus, penanda bulat di atasnya, dan
 * kartu berselang-seling di atas dan di bawah sumbu.
 *
 * Susunannya kisi tiga baris `1fr auto 1fr` yang mengalir menyamping, sehingga
 * kedua baris kartu selalu setinggi kartu tertinggi dan barisan penandanya
 * tetap sejajar — berapa pun panjang uraian tiap tahapan. Ruas sumbu digambar
 * di dalam sel penanda tanpa sela antar kolom, jadi sumbunya tidak pernah
 * terputus di antara dua tahapan.
 */
function GarisWaktu({ tahapan }: { tahapan: JadwalTahapan[] }) {
  const jalur = useRef<HTMLDivElement>(null);
  const [bisaKiri, setBisaKiri] = useState(false);
  const [bisaKanan, setBisaKanan] = useState(false);

  const hitung = useCallback(() => {
    const el = jalur.current;
    if (!el) return;
    setBisaKiri(el.scrollLeft > 4);
    setBisaKanan(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    hitung();
    const el = jalur.current;
    if (!el) return;
    const pengamat = new ResizeObserver(hitung);
    pengamat.observe(el);
    return () => pengamat.disconnect();
  }, [hitung, tahapan.length]);

  const geser = (arah: -1 | 1) =>
    jalur.current?.scrollBy({ left: arah * jalur.current.clientWidth * 0.8, behavior: 'smooth' });

  const Tombol = ({ arah }: { arah: -1 | 1 }) => {
    const aktif = arah === -1 ? bisaKiri : bisaKanan;
    const Ikon = arah === -1 ? ChevronLeft : ChevronRight;
    return (
      <button
        type="button"
        onClick={() => geser(arah)}
        disabled={!aktif}
        aria-label={arah === -1 ? 'Geser jadwal ke tahapan sebelumnya' : 'Geser jadwal ke tahapan berikutnya'}
        className={`bg-background/90 absolute top-1/2 z-10 hidden h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border shadow-sm transition sm:flex ${
          arah === -1 ? 'left-0' : 'right-0'
        } ${aktif ? 'hover:bg-accent' : 'pointer-events-none opacity-0'}`}
      >
        <Ikon className="h-4 w-4" />
      </button>
    );
  };

  return (
    <div className="relative">
      <Tombol arah={-1} />
      <Tombol arah={1} />
      <div
        ref={jalur}
        onScroll={hitung}
        className="scrollbar-thin overflow-x-auto overflow-y-hidden pb-1"
      >
        {/*
          Ketiga barisnya `auto`, bukan `1fr auto 1fr`. Dengan `1fr` kedua baris
          kartu dipaksa sama tinggi, sehingga widget selalu setinggi dua kali
          kartu terpanjang walaupun baris bawahnya pendek.
        */}
        <div className="grid auto-cols-[17rem] grid-flow-col grid-rows-[auto_auto_auto]">
          {tahapan.map((t, i) => {
            const k = KEADAAN[t.keadaan];
            const Ikon = k.Ikon;
            const diAtas = i % 2 === 0;
            return (
              <Fragment key={t.id}>
                <div className="flex items-end">{diAtas && <KartuTahapan tahapan={t} diAtas />}</div>
                {/* Sengaja lebih pendek daripada penandanya: bulatan 24 piksel
                    dibiarkan meluber ke luar baris supaya jarak kartu ke sumbu
                    tinggal 12 piksel, cukup dekat untuk disambung panah. */}
                <div className="relative flex h-6 items-center justify-center">
                  <span aria-hidden className={`absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 ${k.garis}`} />
                  <span
                    className={`relative flex h-6 w-6 items-center justify-center rounded-full border-2 ${k.penanda}`}
                  >
                    <Ikon className="h-3.5 w-3.5" />
                  </span>
                </div>
                <div className="flex items-start">
                  {!diAtas && <KartuTahapan tahapan={t} diAtas={false} />}
                </div>
              </Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}

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
              <GarisWaktu tahapan={a.tahapan} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
