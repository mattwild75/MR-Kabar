import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ChevronDown, ChevronRight, Plus, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { riskLevelClassName, type RiskLevelBand } from '@/lib/risk-level';
import HighlightText from '@/components/ui/highlight-text';

interface ProgramLainRef {
  nomor: number;
  pivot_id: number;
}

interface RisikoRow {
  pivot_id: number;
  tipe: 'irs_pemda' | 'irs_pd' | 'iro_pd';
  id: number;
  /** Kode Risiko [PREFIX].[TAHUN].[JENIS].[ENTITAS].[NOMOR_URUT], mis. "ROO.25.02.09.02" — null kalau salah satu komponennya belum diisi di risiko sumber. */
  kode_risiko: string | null;
  uraian_risiko: string;
  /** OPD Penanggung Jawab Pengendalian risiko ini (bisa beda dari perangkat_daerah milik programnya) — dipakai kotak pencarian. */
  opd_penanggung_jawab: string | null;
  skala_risiko: number | null;
  url: string;
  /** SEMUA program (termasuk program yg sedang ditampilkan) yg mengaitkan risiko yg sama — panjang 1 kalau risiko ini cuma dipakai di satu program. */
  program_semua: ProgramLainRef[];
}

interface ProgramRow {
  id: number;
  nomor: number;
  program_pembangunan: string;
  branding: string | null;
  perangkat_daerah: string;
  misi_urutan: number;
  jumlah_risiko: number;
  jumlah_risiko_prioritas: number;
  risiko: RisikoRow[];
}

/** Visi (1 baris) & Misi (per misi_urutan 1-7) — dibaca LIVE dari tbl_krs_pemda
 *  (kolom VISI/MISI), sama pola dgn tab "100 Program Pembangunan Bupati" di
 *  Keterangan Pendukung — mengedit Visi/Misi di KRS Pemda (I_a) otomatis ikut
 *  memperbarui tampilan di halaman ini. */
interface VisiMisiPemda {
  visi: string | null;
  misi: Record<number, string | null>;
}

/** Usulan PIC yang masih menunggu keputusan Admin. */
interface UsulanRow {
  id: number;
  aksi: 'tambah' | 'lepas';
  program_id: number;
  program_nomor: number | null;
  program_nama: string | null;
  risiko_tipe: RisikoRow['tipe'];
  risiko_id: number;
  uraian_risiko: string | null;
  pengusul: string | null;
  diusulkan_pada: string | null;
}

interface PageProps {
  programs: ProgramRow[];
  riskLevels: RiskLevelBand[];
  totalRisikoTerpetakan: number;
  visiMisiPemda: VisiMisiPemda;
  /** Hanya Admin & Super Admin. Kosmetik — penjaganya di destroyRisiko(). */
  bolehHapus: boolean;
  /** Admin menerima semua usulan yang menunggu; PIC hanya miliknya sendiri. */
  usulan: UsulanRow[];
}

/** Apakah teks ini yang membuat barisnya lolos saring? */
const cocok = (teks: string | null | undefined, query: string) =>
  query !== '' && (teks ?? '').toLowerCase().includes(query);

/** Berapa baris risiko di dalam program ini yang benar-benar cocok. */
const jumlahRisikoCocok = (program: ProgramRow, query: string) =>
  program.risiko.filter((r) => cocok(r.uraian_risiko, query) || cocok(r.opd_penanggung_jawab, query)).length;

interface HasilPencarianRisiko {
  tipe: RisikoRow['tipe'];
  id: number;
  uraian_risiko: string;
  skala_risiko: number | null;
  opd: string | null;
  tahun: string | number | null;
}

const TIPE_LABEL: Record<RisikoRow['tipe'], string> = {
  irs_pemda: 'IRS Pemda',
  irs_pd: 'IRS PD',
  iro_pd: 'IRO PD',
};

const MISI_URUTAN_LIST = [1, 2, 3, 4, 5, 6, 7] as const;

export default function ProgramBupatiRisikoIndex({ programs, riskLevels, totalRisikoTerpetakan, visiMisiPemda, bolehHapus, usulan }: PageProps) {
  const [search, setSearch] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [tambahUntukProgram, setTambahUntukProgram] = useState<ProgramRow | null>(null);
  // Baris risiko yg sedang disorot sementara (habis loncat dari badge
  // "juga di N program lain") — beda dari expandedIds (permanen sampai
  // diklik lagi), highlight ini otomatis hilang setelah beberapa detik.
  const [highlightPivotId, setHighlightPivotId] = useState<number | null>(null);
  const pivotRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  // Indeks target TERAKHIR yg dituju per KELOMPOK risiko yg sama (key =
  // "tipe#id" risiko asal, BUKAN pivot_id — krn tiap kemunculan risiko yg
  // sama di program berbeda py pivot_id sendiri-sendiri, tapi harus
  // berbagi satu urutan cycle yg sama) — supaya klik badge manapun dari
  // kelompok risiko yg sama BERGANTIAN ke SEMUA program yg memuatnya
  // termasuk balik ke program semula (mis. #1 -> #5 -> #9 -> #1 -> ...).
  const cycleIndexRef = useRef<Map<string, number>>(new Map());

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Endpoint yang sama dipakai dua peran: Admin melepas kaitannya langsung,
  // PIC menghasilkan usulan. Pesan suksesnya diambil dari balasan server,
  // bukan ditulis di sini, supaya tidak pernah mengaku "berhasil dihapus"
  // padahal yang terjadi adalah usulan terkirim.
  const hapusKaitan = (pivotId: number) => {
    router.delete(`/program-bupati-risiko/risiko/${pivotId}`, {
      preserveScroll: true,
      onError: () => toast.error(bolehHapus ? 'Gagal menghapus kaitan.' : 'Gagal mengirim usulan.'),
    });
  };

  const putuskanUsulan = (usulanId: number, keputusan: 'setujui' | 'tolak') => {
    router.post(`/program-bupati-risiko/usulan/${usulanId}/${keputusan}`, {}, {
      preserveScroll: true,
      onError: () => toast.error('Gagal memproses usulan.'),
    });
  };

  /**
   * Klik badge "N program yang sama" -> buka (expand) program tujuan
   * berikutnya dalam urutan cycle, scroll ke situ, dan sorot baris risiko
   * yg sama persis di sana selama beberapa detik — TIDAK membuka IRS/IRO
   * (itu cuma terjadi kalau user klik teks uraian risikonya sendiri, lewat
   * <Link> terpisah). Daftar `daftarProgramSemua` mencakup program yg
   * sedang dilihat sendiri, jadi cycle otomatis berputar penuh & balik ke
   * awal (mis. #1 -> #5 -> #9 -> #1 -> ...). Delay kecil sebelum scroll
   * krn expandedIds baru ter-render sesudahnya (elemen tujuan belum ada
   * di DOM di render yg sama saat expand di-set).
   */
  const sorotProgramLain = (risikoKey: string, daftarProgramSemua: ProgramLainRef[], programSaatIni: number) => {
    // Klik PERTAMA pada suatu kelompok risiko harus lompat ke program
    // BERIKUTNYA setelah program yg sedang dilihat, bukan index 0 mentah —
    // kalau tidak, klik pertama bisa "diam di tempat" ketika program yg
    // sedang dilihat kebetulan berada di index 0 daftar.
    const idxSebelumnya = cycleIndexRef.current.get(risikoKey) ?? daftarProgramSemua.findIndex((p) => p.nomor === programSaatIni);
    const idx = (idxSebelumnya + 1) % daftarProgramSemua.length;
    cycleIndexRef.current.set(risikoKey, idx);
    const target = daftarProgramSemua[idx];

    const programTujuan = programs.find((p) => p.nomor === target.nomor);
    if (programTujuan) {
      setExpandedIds((prev) => new Set(prev).add(programTujuan.id));
    }
    setHighlightPivotId(target.pivot_id);
    window.setTimeout(() => {
      const el = pivotRefs.current.get(target.pivot_id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (programTujuan) {
        document.getElementById(`program-card-${programTujuan.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
    window.setTimeout(() => setHighlightPivotId((cur) => (cur === target.pivot_id ? null : cur)), 3000);
  };

  const query = search.trim().toLowerCase();
  const filtered = query
    ? programs.filter(
        (p) =>
          p.program_pembangunan.toLowerCase().includes(query) ||
          (p.branding ?? '').toLowerCase().includes(query) ||
          p.perangkat_daerah.toLowerCase().includes(query) ||
          p.risiko.some(
            (r) =>
              r.uraian_risiko.toLowerCase().includes(query) ||
              (r.opd_penanggung_jawab ?? '').toLowerCase().includes(query),
          ),
      )
    : programs;

  const totalRisikoPrioritas = programs.reduce((sum, p) => sum + p.jumlah_risiko_prioritas, 0);

  // Penanda cepat "baris ini sedang diusulkan", supaya PIC tidak mengusulkan
  // hal yang sama dua kali dan Admin melihat mana yang sedang ditunggu.
  const usulanPerRisiko = new Map(usulan.map((u) => [`${u.program_id}#${u.risiko_tipe}#${u.risiko_id}`, u]));

  // Tombol "Buka/Tutup Semua" berganti label & aksi tergantung apakah
  // SEMUA program yg sedang tampil (filtered) sudah terbuka — kalau ya,
  // tombol jadi "Tutup Semua"; kalau belum semua, jadi "Buka Semua".
  const semuaTerbukaSaatIni = filtered.length > 0 && filtered.every((p) => expandedIds.has(p.id));

  // Dikelompokkan per Misi (sama pola dgn tab "100 Program Pembangunan
  // Bupati" di Keterangan Pendukung) — struktur Visi -> Misi -> Program
  // tetap terbaca jelas, bukan sekadar daftar 1-100 datar.
  const grouped = MISI_URUTAN_LIST.map((urutan) => ({
    urutan,
    nama: visiMisiPemda.misi[urutan] ?? null,
    programs: filtered.filter((p) => p.misi_urutan === urutan).sort((a, b) => a.nomor - b.nomor),
  })).filter((g) => g.programs.length > 0);

  return (
    <AppLayout>
      <Head title="Risiko 100 Program Bupati" />

      <div className="space-y-4 p-4">
        <div>
          <h1 className="text-2xl font-semibold">Risiko 100 Program Bupati</h1>
          <p className="text-sm text-muted-foreground">
            Untuk tiap Program Pembangunan Bupati (Tabel 3.7 RPJM Kabupaten Aceh Barat 2025-2029), ditampilkan risiko
            yang teridentifikasi tahun 2025 (IRS Pemda/IRS PD/IRO PD) yang secara nyata dapat mengganggu pencapaian
            program tersebut. Klik satu risiko untuk membuka baris aslinya di Form Input yang tersorot. Visi &amp;
            Misi diambil LIVE dari data KRS Pemda (I_a).
          </p>
        </div>

        <div className="flex flex-wrap gap-3 text-sm">
          <div className="rounded-md border bg-card px-3 py-2">
            <span className="text-muted-foreground">Total Program: </span>
            <span className="font-semibold text-foreground">{programs.length} / 100</span>
          </div>
          <div className="rounded-md border bg-card px-3 py-2">
            <span className="text-muted-foreground">Risiko Terkait: </span>
            <span className="font-semibold text-foreground">{totalRisikoTerpetakan} risiko</span>
          </div>
          <div className="rounded-md border bg-card px-3 py-2">
            <span className="text-muted-foreground">Total Kaitan Risiko Prioritas: </span>
            <span className="font-semibold text-destructive">{totalRisikoPrioritas}</span>
          </div>
        </div>

        <div className="rounded-md border bg-muted/30 p-3 text-sm">
          <span className="font-semibold text-foreground">Visi:</span>{' '}
          {visiMisiPemda.visi ?? <span className="italic text-muted-foreground">Belum diisi di KRS Pemda (I_a)</span>}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari program, branding, OPD, atau uraian risiko..."
              className="pl-9"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={() =>
              setExpandedIds(semuaTerbukaSaatIni ? new Set() : new Set(filtered.map((p) => p.id)))
            }
          >
            {semuaTerbukaSaatIni ? (
              <>
                <ChevronRight className="mr-1.5 h-3.5 w-3.5" />
                Tutup Semua
              </>
            ) : (
              <>
                <ChevronDown className="mr-1.5 h-3.5 w-3.5" />
                Buka Semua
              </>
            )}
          </Button>
        </div>

        {/* Kotak usulan. Untuk Admin ini daftar tinjauan; untuk PIC ini
            tanda terima — tanpa itu dia tidak punya cara tahu usulannya
            sudah masuk atau belum. */}
        {usulan.length > 0 && (
          <div className="rounded-md border border-sky-500/40 bg-sky-500/5 p-3">
            <p className="mb-2 text-sm font-semibold">
              {bolehHapus
                ? `Usulan menunggu persetujuan Anda (${usulan.length})`
                : `Usulan Anda yang menunggu persetujuan Admin (${usulan.length})`}
            </p>
            <div className="space-y-1.5">
              {usulan.map((u) => (
                <div key={u.id} className="flex flex-wrap items-center gap-2 rounded-md bg-card px-2 py-1.5 text-sm shadow-sm">
                  <Badge variant="outline" className={`shrink-0 text-[10px] ${u.aksi === 'lepas' ? 'border-red-400 text-red-700 dark:text-red-400' : 'border-emerald-400 text-emerald-700 dark:text-emerald-400'}`}>
                    {u.aksi === 'lepas' ? 'Lepas' : 'Tambah'}
                  </Badge>
                  <span className="shrink-0 text-xs text-muted-foreground">Program #{u.program_nomor}</span>
                  <span className="min-w-0 flex-1 truncate">{u.uraian_risiko ?? '(risiko tidak ditemukan)'}</span>
                  {bolehHapus && (
                    <>
                      <span className="shrink-0 text-xs text-muted-foreground">oleh {u.pengusul}</span>
                      <Button size="sm" className="h-7 shrink-0" onClick={() => putuskanUsulan(u.id, 'setujui')}>
                        Setujui
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 shrink-0" onClick={() => putuskanUsulan(u.id, 'tolak')}>
                        Tolak
                      </Button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="rounded-md border p-8 text-center text-sm text-muted-foreground">
            Tidak ada program yang cocok dengan pencarian "{search}".
          </div>
        ) : (
          <div className="space-y-4">
            {grouped.map((g) => (
              <div key={g.urutan} className="space-y-2">
                <p className="rounded-md bg-sky-500/10 px-3 py-1.5 text-sm font-semibold text-foreground ring-1 ring-sky-500/20">
                  {g.nama ?? `Misi ${g.urutan} : (belum diisi di KRS Pemda)`}
                </p>
                <div className="space-y-2">
                  {g.programs.map((program) => {
                    const expanded = expandedIds.has(program.id) || query !== '';
                    return (
                      <div key={program.id} id={`program-card-${program.id}`} className="rounded-md border bg-card">
                        <button
                          type="button"
                          onClick={() => toggleExpand(program.id)}
                          className="flex w-full items-start justify-between gap-3 p-3 text-left hover:bg-muted/50"
                        >
                          <div className="flex min-w-0 flex-1 items-start gap-2">
                            {expanded ? (
                              <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                            )}
                            <div className="min-w-0">
                              <p className="text-sm font-medium">
                                <span className="text-muted-foreground">#{program.nomor}</span>{' '}
                                <HighlightText text={program.program_pembangunan} query={search.trim()} />
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {program.branding && (
                                  <span className="italic">
                                    <HighlightText text={program.branding} query={search.trim()} /> ·{' '}
                                  </span>
                                )}
                                <HighlightText text={program.perangkat_daerah} query={search.trim()} />
                              </p>
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center gap-1.5">
                            {/* Kenapa program ini ikut tersaring padahal namanya
                                tidak mengandung kata yang dicari? Karena
                                penyaringnya juga melihat risiko di dalamnya.
                                Jumlah yang cocok ditampilkan supaya jelas
                                berapa dari sekian baris yang benar-benar
                                menyebabkannya muncul. */}
                            {query !== '' && (
                              <Badge variant="outline" className="border-yellow-500/60 text-[10px] text-yellow-700 dark:text-yellow-400">
                                {jumlahRisikoCocok(program, query)} dari {program.risiko.length} risiko cocok
                              </Badge>
                            )}
                            {program.jumlah_risiko_prioritas > 0 && (
                              <Badge className="bg-red-500 text-white hover:bg-red-500">
                                {program.jumlah_risiko_prioritas} prioritas
                              </Badge>
                            )}
                            <Badge variant="outline">{program.jumlah_risiko} risiko</Badge>
                          </div>
                        </button>

                        {expanded && (
                          <div className="ml-4 space-y-1.5 rounded-b-md border-t border-l-2 border-l-sky-500/40 bg-muted/40 px-3 py-2">
                            {program.risiko.length === 0 && (
                              <p className="py-1 text-xs text-muted-foreground italic">
                                Belum ada risiko yang dikaitkan ke program ini.
                              </p>
                            )}
                            {program.risiko.map((r) => (
                              <div
                                key={r.pivot_id}
                                ref={(el) => {
                                  if (el) {
                                    pivotRefs.current.set(r.pivot_id, el);
                                  } else {
                                    pivotRefs.current.delete(r.pivot_id);
                                  }
                                }}
                                className={`flex items-center gap-2 rounded-md bg-card px-1.5 py-1 text-sm shadow-sm transition-colors hover:bg-muted ${
                                  highlightPivotId === r.pivot_id ? 'bg-amber-200/60 ring-2 ring-amber-400 dark:bg-amber-500/20' : ''
                                }`}
                              >
                                <Link href={r.url} className="flex min-w-0 flex-1 items-center gap-2">
                                  <Badge variant="outline" className="shrink-0 text-[10px]">
                                    {TIPE_LABEL[r.tipe]}
                                  </Badge>
                                  {r.kode_risiko && (
                                    <span className="shrink-0 font-mono text-[10px] text-muted-foreground">{r.kode_risiko}</span>
                                  )}
                                  <span className="min-w-0 flex-1 truncate">
                                    <HighlightText text={r.uraian_risiko} query={search.trim()} />
                                  </span>
                                  {/* OPD Penanggung Jawab Pengendalian ikut
                                      disaring tapi TIDAK pernah ditampilkan,
                                      sehingga baris bisa lolos tanpa satu pun
                                      kata yang dicari terlihat di layar —
                                      persis yang membuat hasil pencarian
                                      membingungkan. Ditampilkan hanya ketika
                                      dialah alasannya, supaya baris lain tidak
                                      ikut ramai. */}
                                  {cocok(r.opd_penanggung_jawab, query) && !cocok(r.uraian_risiko, query) && (
                                    <span className="hidden shrink-0 text-[10px] text-muted-foreground sm:inline">
                                      PJ: <HighlightText text={r.opd_penanggung_jawab ?? ''} query={search.trim()} />
                                    </span>
                                  )}
                                  <Badge className={`shrink-0 ${riskLevelClassName(r.skala_risiko, riskLevels)}`}>
                                    {r.skala_risiko ?? '-'}
                                  </Badge>
                                </Link>
                                {r.program_semua.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => sorotProgramLain(`${r.tipe}#${r.id}`, r.program_semua, program.nomor)}
                                    title={`Lompat & sorot risiko ini di Program ${r.program_semua.map((p) => `#${p.nomor}`).join(', ')} (klik lagi utk berpindah bergantian)`}
                                  >
                                    <Badge
                                      variant="outline"
                                      className="shrink-0 cursor-pointer border-amber-400 text-[10px] text-amber-700 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-500/10"
                                    >
                                      {r.program_semua.length} program yang sama
                                    </Badge>
                                  </button>
                                )}
                                {/* Baris yang sedang menunggu keputusan Admin
                                    ditandai, supaya PIC tidak mengusulkan hal
                                    yang sama dua kali dan Admin tahu mana yang
                                    sedang ditunggu. */}
                                {usulanPerRisiko.has(`${program.id}#${r.tipe}#${r.id}`) ? (
                                  <Badge
                                    variant="outline"
                                    className="shrink-0 border-sky-400 text-[10px] text-sky-700 dark:text-sky-400"
                                  >
                                    {usulanPerRisiko.get(`${program.id}#${r.tipe}#${r.id}`)?.aksi === 'lepas'
                                      ? 'usul lepas — menunggu Admin'
                                      : 'usul tambah — menunggu Admin'}
                                  </Badge>
                                ) : (
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        title={bolehHapus ? 'Lepas kaitan risiko ini' : 'Usulkan pelepasan kaitan ini ke Admin'}
                                        className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>
                                          {bolehHapus ? 'Hapus kaitan risiko ini?' : 'Usulkan pelepasan kaitan ini?'}
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                          {bolehHapus ? (
                                            <>
                                              Kaitan ke risiko "{r.uraian_risiko}" akan dihapus dari Program #{program.nomor} —
                                              risiko aslinya di {TIPE_LABEL[r.tipe]} TIDAK ikut terhapus, dan kaitan ini bisa
                                              dipulihkan lewat menu Data Terhapus.
                                            </>
                                          ) : (
                                            <>
                                              Usulan pelepasan kaitan ke risiko "{r.uraian_risiko}" dari Program #{program.nomor}{' '}
                                              akan dikirim ke Admin. Kaitannya BELUM dilepas sampai Admin menyetujui, dan Anda
                                              akan menerima notifikasi begitu diputuskan.
                                            </>
                                          )}
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Batal</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => hapusKaitan(r.pivot_id)}
                                          className={bolehHapus ? 'bg-destructive hover:bg-destructive/90' : ''}
                                        >
                                          {bolehHapus ? 'Hapus' : 'Kirim Usulan'}
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                )}
                              </div>
                            ))}
                            <Button variant="outline" size="sm" className="mt-1" onClick={() => setTambahUntukProgram(program)}>
                              <Plus className="mr-1.5 h-3.5 w-3.5" />
                              {bolehHapus ? 'Tambah Kaitan Risiko' : 'Usulkan Kaitan Risiko'}
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <TambahKaitanDialog
        program={tambahUntukProgram}
        bolehLangsung={bolehHapus}
        onClose={() => setTambahUntukProgram(null)}
      />
    </AppLayout>
  );
}

function TambahKaitanDialog({
  program,
  bolehLangsung,
  onClose,
}: {
  program: ProgramRow | null;
  /** Admin: kaitan langsung berlaku. PIC: yang terkirim adalah usulan. */
  bolehLangsung: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const [hasil, setHasil] = useState<HasilPencarianRisiko[]>([]);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);

  const cari = async (q: string) => {
    setQuery(q);
    if (q.trim().length < 2) {
      setHasil([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(`/program-bupati-risiko/cari-risiko?q=${encodeURIComponent(q)}`);
      setHasil(await res.json());
    } finally {
      setSearching(false);
    }
  };

  const tambahkan = (r: HasilPencarianRisiko) => {
    if (!program) return;
    setSaving(true);
    router.post(
      `/program-bupati-risiko/${program.id}/risiko`,
      { risiko_tipe: r.tipe, risiko_id: r.id },
      {
        preserveScroll: true,
        // Tanpa toast di sini: pesannya datang dari server lewat flash,
        // karena endpoint yang sama berarti "ditambahkan" bagi Admin dan
        // "usulan terkirim" bagi PIC.
        onSuccess: () => {
          setQuery('');
          setHasil([]);
          onClose();
        },
        onError: () => toast.error(bolehLangsung ? 'Gagal menambahkan kaitan.' : 'Gagal mengirim usulan.'),
        onFinish: () => setSaving(false),
      },
    );
  };

  return (
    <Dialog open={program !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {bolehLangsung ? 'Tambah' : 'Usulkan'} Kaitan Risiko — Program #{program?.nomor}
          </DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground">{program?.program_pembangunan}</p>
        {!bolehLangsung && (
          <p className="rounded-md bg-sky-500/10 px-2.5 py-2 text-xs text-muted-foreground">
            Pencarian ini hanya menampilkan risiko dari register OPD Anda sendiri. Pilihan Anda dikirim
            sebagai usulan dan baru berlaku setelah disetujui Admin.
          </p>
        )}
        <div className="relative">
          <Search className="pointer-events-none absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Ketik uraian risiko, OPD, atau nama Perangkat Daerah..."
            value={query}
            onChange={(e) => cari(e.target.value)}
            disabled={saving}
            autoFocus
          />
        </div>
        {searching && <p className="text-xs text-muted-foreground">Mencari...</p>}
        <div className="max-h-72 space-y-1 overflow-y-auto">
          {hasil.map((r) => (
            <button
              key={`${r.tipe}-${r.id}`}
              type="button"
              onClick={() => tambahkan(r)}
              disabled={saving}
              className="block w-full rounded-md border px-3 py-2 text-left text-sm hover:bg-muted disabled:opacity-50"
            >
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="shrink-0 text-[10px]">
                  {TIPE_LABEL[r.tipe]}
                </Badge>
                <span className="min-w-0 flex-1 truncate font-medium">{r.uraian_risiko}</span>
                <Badge variant="outline" className="shrink-0">
                  {r.skala_risiko ?? '-'}
                </Badge>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {r.opd ?? '-'} {r.tahun ? `· Tahun ${r.tahun}` : ''}
              </p>
            </button>
          ))}
          {query.trim().length >= 2 && !searching && hasil.length === 0 && (
            <p className="py-2 text-center text-xs text-muted-foreground">Tidak ada hasil untuk "{query}".</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
