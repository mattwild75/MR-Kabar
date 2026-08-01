import { Link } from '@inertiajs/react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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

/**
 * Rentang tanggal versi pendek untuk garis waktu: tahun pada tanggal mulai
 * dibuang bila keduanya jatuh di tahun yang sama, sebab menuliskannya dua kali
 * hanya memakan lebar kolom tanpa menambah keterangan apa pun.
 */
const rentangSingkat = (mulai: string | null, selesai: string | null) => {
  if (!mulai || !selesai) return rentang(mulai, selesai);
  const [a, b] = [new Date(mulai + 'T00:00:00'), new Date(selesai + 'T00:00:00')];
  const hariBulan = (d: Date) =>
    d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  return a.getFullYear() === b.getFullYear()
    ? `${hariBulan(a)} – ${hariBulan(b)} ${b.getFullYear()}`
    : `${tanggal(mulai)} – ${tanggal(selesai)}`;
};

/**
 * Rincian satu tahapan. Sengaja tidak ditampilkan di garis waktu: pelaksana
 * dan keluaran kerap berupa satu kalimat penuh, dan menaruh keduanya di sana
 * membuat sebelas tahapan setinggi separuh layar padahal yang dicari orang
 * saat melirik Dasbor cuma "apa, kapan, dan sudah lewat atau belum".
 */
function DialogTahapan({
  tahapan,
  onOpenChange,
}: {
  tahapan: JadwalTahapan | null;
  onOpenChange: (terbuka: boolean) => void;
}) {
  const k = tahapan ? KEADAAN[tahapan.keadaan] : null;
  const Ikon = k?.Ikon;
  return (
    <Dialog open={tahapan !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {tahapan && k && Ikon && (
          <>
            <DialogHeader>
              <div className={`flex items-center gap-1.5 text-xs font-medium ${k.teks}`}>
                <Ikon className="h-3.5 w-3.5 shrink-0" />
                {k.label}
              </div>
              <DialogTitle className="text-left text-base leading-snug">
                {tahapan.tahapan}
              </DialogTitle>
              <DialogDescription className="text-left">
                {rentang(tahapan.tanggal_mulai, tahapan.tanggal_selesai)}
              </DialogDescription>
            </DialogHeader>
            <dl className="grid gap-3 text-sm">
              {tahapan.dokumen_pemicu && (
                <div>
                  <dt className="text-muted-foreground text-xs">Dikerjakan setelah</dt>
                  <dd>{tahapan.dokumen_pemicu} disusun</dd>
                </div>
              )}
              {tahapan.pelaksana && (
                <div>
                  <dt className="text-muted-foreground text-xs">Pelaksana</dt>
                  <dd>{tahapan.pelaksana}</dd>
                </div>
              )}
              {tahapan.keluaran && (
                <div>
                  <dt className="text-muted-foreground text-xs">Keluaran</dt>
                  <dd>{tahapan.keluaran}</dd>
                </div>
              )}
            </dl>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

const NAMA_BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

const kePersen = (n: number) => `${Math.min(100, Math.max(0, n)).toFixed(3)}%`;
const waktu = (v: string, akhirHari = false) =>
  new Date(`${v.slice(0, 10)}T${akhirHari ? '23:59:59' : '00:00:00'}`).getTime();

/**
 * Garis waktu berskala tanggal sungguhan: letak tiap batang dihitung dari
 * porsinya terhadap seluruh periode arahan, bukan dari urutannya. Tahapan
 * yang berlangsung dua bulan karena itu tampak dua kali lebih panjang
 * daripada yang dua minggu — hal yang tidak terbaca sama sekali pada
 * susunan kartu berjajar.
 *
 * Dua bentuk, sesuai jenis arahannya:
 *
 * - **1 tahunan** — sumbunya dua belas bulan, dengan garis merah tegak di
 *   tanggal hari ini.
 * - **5 tahunan** — sumbunya tahun, ditambah bilah kemajuan yang terisi
 *   sampai hari ini. Periode RPJMD terlalu panjang untuk dinilai dari
 *   tanggal saja; yang dicari pembaca justru "sudah sejauh mana".
 *
 * Tiap tahapan menempati barisnya sendiri. Menumpuk beberapa tahapan dalam
 * satu baris memang lebih ringkas, tetapi label dan batangnya lalu saling
 * menimpa begitu ada dua tahapan yang waktunya beririsan — dan pada jadwal
 * penilaian Risiko, beririsan itu justru lazim.
 */
function GarisWaktu({ arahan }: { arahan: JadwalArahan }) {
  const [dipilih, pilih] = useState<JadwalTahapan | null>(null);

  const berTahun = arahan.tahun_selesai > arahan.tahun_mulai;
  const awal = new Date(arahan.tahun_mulai, 0, 1).getTime();
  const akhir = new Date(arahan.tahun_selesai, 11, 31, 23, 59, 59).getTime();
  const bentang = Math.max(1, akhir - awal);
  const posisi = (ms: number) => ((ms - awal) / bentang) * 100;

  const kiniPersen = posisi(Date.now());
  const kiniTerlihat = kiniPersen >= 0 && kiniPersen <= 100;

  const tanda = berTahun
    ? Array.from({ length: arahan.tahun_selesai - arahan.tahun_mulai + 1 }, (_, i) => {
        const th = arahan.tahun_mulai + i;
        return { kunci: `t${th}`, label: String(th), kiri: posisi(new Date(th, 0, 1).getTime()) };
      })
    : NAMA_BULAN.map((b, i) => ({
        kunci: `b${i}`,
        label: b,
        kiri: posisi(new Date(arahan.tahun_mulai, i, 1).getTime()),
      }));

  const tahunBerjalan = Math.min(
    arahan.tahun_selesai - arahan.tahun_mulai + 1,
    Math.max(1, new Date().getFullYear() - arahan.tahun_mulai + 1),
  );

  return (
    <div className="mt-2">
      {/* Sumbu: nama bulan atau tahun, diletakkan pada porsinya sendiri */}
      <div className="relative h-4 text-[10px] text-muted-foreground">
        {tanda.map((s) => (
          <span key={s.kunci} className="absolute top-0" style={{ left: kePersen(s.kiri) }}>
            {s.label}
          </span>
        ))}
      </div>

      {berTahun ? (
        <>
          <div className="bg-muted relative h-2.5 overflow-hidden rounded-full">
            <div
              className="h-full rounded-full bg-sky-500"
              style={{ width: kePersen(kiniPersen) }}
              aria-hidden
            />
          </div>
          <p className="text-muted-foreground mt-1 text-[11px]">
            Tahun ke-{tahunBerjalan} dari {arahan.tahun_selesai - arahan.tahun_mulai + 1} &middot;{' '}
            {Math.round(kiniPersen)}% periode berjalan
          </p>
        </>
      ) : (
        <div className="relative h-1.5">
          <div className="bg-border absolute inset-x-0 top-1/2 h-px -translate-y-1/2" />
          {tanda.map((s) => (
            <span
              key={s.kunci}
              className="bg-border absolute top-0 h-1.5 w-px"
              style={{ left: kePersen(s.kiri) }}
              aria-hidden
            />
          ))}
        </div>
      )}

      {/* Satu baris untuk satu tahapan */}
      <div className="relative mt-2 space-y-1">
        {kiniTerlihat && (
          /* Sengaja tanpa z-index, dan ditulis paling awal, supaya batang dan
             label tahapan menimpanya. Sebagai garis rambut ia tetap terlihat
             pada ruang kosong, tetapi tidak lagi memotong tulisan. */
          <span
            className="absolute inset-y-0 w-px bg-red-500/70"
            style={{ left: kePersen(kiniPersen) }}
            aria-hidden
          />
        )}

        {arahan.tahapan.map((t) => {
          const k = KEADAAN[t.keadaan];
          const mulai = t.tanggal_mulai ? waktu(t.tanggal_mulai) : awal;
          const selesai = t.tanggal_selesai ? waktu(t.tanggal_selesai, true) : mulai;
          const kiri = Math.max(0, posisi(mulai));
          // Batang yang sangat pendek tetap diberi lebar minimum, kalau tidak
          // tahapan dua minggu di dalam periode lima tahun menjadi tak terlihat.
          const lebar = Math.max(posisi(selesai) - kiri, berTahun ? 0.8 : 1.4);
          const diDalam = lebar >= 24;
          const keKiri = !diDalam && kiri + lebar > 62;
          const keterangan = `${t.tahapan} · ${rentangSingkat(t.tanggal_mulai, t.tanggal_selesai)}`;

          return (
            <button
              key={t.id}
              type="button"
              onClick={() => pilih(t)}
              title={keterangan}
              aria-label={`Lihat rincian tahapan ${t.tahapan}`}
              className="group relative block h-6 w-full text-left focus-visible:outline-none"
            >
              <span
                className={`absolute inset-y-0 rounded-sm border transition group-hover:brightness-125 group-focus-visible:ring-2 ${k.kelas}`}
                style={{ left: kePersen(kiri), width: kePersen(lebar) }}
              />
              <span
                className={`absolute inset-y-0 flex items-center text-[11px] leading-none whitespace-nowrap ${
                  diDalam ? 'overflow-hidden px-1.5' : ''
                }`}
                style={
                  diDalam
                    ? { left: kePersen(kiri), width: kePersen(lebar) }
                    : keKiri
                      ? { right: `calc(${kePersen(100 - kiri)} + 6px)` }
                      : { left: `calc(${kePersen(kiri + lebar)} + 6px)` }
                }
              >
                <span className={`truncate font-medium ${diDalam ? k.teks : ''}`}>{t.tahapan}</span>
                {!diDalam && (
                  <span className="text-muted-foreground ml-1.5">
                    {rentangSingkat(t.tanggal_mulai, t.tanggal_selesai)}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      <DialogTahapan tahapan={dipilih} onOpenChange={(t) => !t && pilih(null)} />
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
              <GarisWaktu arahan={a} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
