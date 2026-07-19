import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileDown } from 'lucide-react';

interface RisikoRow {
  konteks: string | null;
  uraian_risiko: string;
  kode_risiko: string | null;
  pemilik_risiko: string | null;
  sebab: string | null;
  sumber: string | null;
  c_uc: string | null;
  dampak: string | null;
  pihak_terkena: string | null;
  /** Hanya terisi untuk Form 3c (Identifikasi Risiko Operasional OPD). */
  tahap?: string | null;
}

/** Baris header "Misi :" (nomor "1", "2", ..) — hanya muncul kalau RPJMD py >1 Misi. */
interface MisiRow {
  type: 'misi';
  nomor: string;
  label: string;
}

interface IndikatorRow {
  ik: string;
  baseline: string | null;
  target: string | null;
  satuan: string | null;
  opd: string | null;
}

/** Baris header "Tujuan Strategis :" (nomor mengikuti Form 2a, mis. "1.1") — membawa IK Tujuan (kolom IK terpisah), tanpa tabel risiko. */
interface TujuanRow {
  type: 'tujuan';
  nomor: string;
  label: string;
  indikator_list: IndikatorRow[];
}

/** Baris "Sasaran Strategis :" (nomor mengikuti Form 2a, mis. "1.1.2") — membawa Indikator + tabel risiko. */
interface SasaranRow {
  type: 'sasaran';
  nomor: string;
  label: string;
  indikator_list: IndikatorRow[];
  risiko_list: RisikoRow[];
}

/** Baris header "Sasaran Renja :" (nomor mengikuti Form 2c, mis. "1") — khusus Form 3c, tanpa data risiko. */
interface SasaranRenstraRow {
  type: 'sasaran_renstra';
  nomor: string;
  label: string;
}

/** Baris header "Program :" (nomor mengikuti Form 2c, mis. "1.1") — khusus Form 3c, membawa IK Program (kolom IK terpisah), tanpa tabel risiko. */
interface ProgramRow {
  type: 'program';
  nomor: string;
  label: string;
  indikator_list: IndikatorRow[];
}

/** Baris "Kegiatan :" (nomor mengikuti Form 2c, mis. "1.1.1") — khusus Form 3c, membawa Indikator + tabel risiko. */
interface KegiatanRow {
  type: 'kegiatan';
  nomor: string;
  label: string;
  indikator_list: IndikatorRow[];
  risiko_list: RisikoRow[];
}

type IdentifikasiEntry = MisiRow | TujuanRow | SasaranRow | SasaranRenstraRow | ProgramRow | KegiatanRow;

interface PageProps {
  tahun: number;
  periode: string | null;
  identifikasi: IdentifikasiEntry[];
  visi: string | null;
  pemerintahKabkota: string;
  sumberData: string | null;
  /** true kalau PIC biasa (bukan Admin/Super Admin) — baris Risiko Strategis Pemda sudah difilter server-side hanya yg diisi OPD-nya sendiri. */
  isScopedToOwnOpd: boolean;
}

export function clean(v?: string | null): string {
  if (!v || v === 'Tidak Ada Data') return '-';
  return v;
}

// ─── Pewarnaan kategori dalam kurung, mis. "(Method) Uraian..." ────────────
// Warna diberikan lewat inline style (bg hex + text hex), BUKAN class
// Tailwind — inline style SELALU menang di cascade CSS apa pun urutan
// stylesheet-nya, dan yang paling penting: Chromium/Browsershot mencetak
// inline background-color dgn print-color-adjust:exact secara andal,
// sedangkan class utility Tailwind (bg-sky-100 dkk) pernah terbukti hilang
// di hasil PDF walau tampil normal di pratinjau web (root cause pastinya
// tidak jelas — kemungkinan urutan cascade saat Puppeteer mengambil
// snapshot — tapi inline style terbukti konsisten tercetak di kedua mode).
// 7M+1E — pengembangan dari 5M klasik, lihat PENYEBAB_5M_KATEGORI di
// irs-reference-data.ts untuk daftar kategori aktif di form isian.
export const KATEGORI_5M_WARNA: Record<string, { bg: string; text: string }> = {
  man: { bg: '#e0f2fe', text: '#075985' },
  men: { bg: '#e0f2fe', text: '#075985' },
  money: { bg: '#d1fae5', text: '#065f46' },
  method: { bg: '#fef3c7', text: '#92400e' },
  machine: { bg: '#ede9fe', text: '#5b21b6' },
  material: { bg: '#ffe4e6', text: '#9f1239' },
  management: { bg: '#ccfbf1', text: '#115e59' },
  measurement: { bg: '#fae8ff', text: '#86198f' },
  environment: { bg: '#d1fae5', text: '#065f46' },
};

export const KATEGORI_SUMBER_WARNA: Record<string, { bg: string; text: string }> = {
  internal: { bg: '#dbeafe', text: '#1e40af' },
  eksternal: { bg: '#ffedd5', text: '#9a3412' },
  'internal dan eksternal': { bg: '#ede9fe', text: '#6b21a8' },
};

export const KATEGORI_CUC_WARNA: Record<string, { bg: string; text: string }> = {
  c: { bg: '#d1fae5', text: '#065f46' },
  uc: { bg: '#fee2e2', text: '#991b1b' },
};

/**
 * Pisahkan "Kategori (sisa teks...)" jadi badge kategori berwarna + teks
 * biasa — field Sebab/Sumber/C-UC tersimpan format INI (kategori di DEPAN
 * tanpa kurung, uraian yg dibungkus kurung SETELAHNYA — bukan sebaliknya),
 * mis. "Method (Belum ada single source...)". Kalau field py LEBIH dari 1
 * kategori sekaligus (mis. sebab dari 2 unsur 5M: "Men (...); Machine
 * (...)"), tiap blok "Kategori (uraian)" DIPISAH ";" dan dipecah jadi
 * baris tersendiri (bukan digabung 1 paragraf) supaya SEMUA kategori dapat
 * badge warnanya masing2, bukan cuma kategori pertama — split ini case-
 * insensitive thd huruf awal kategori berikutnya. Sumber Sebab beda pola:
 * 1 kategori gabungan ("Internal dan Eksternal") diikuti 2 blok kurung
 * sekaligus TANPA pemisah ";" (mis. "Internal dan Eksternal (Internal:
 * ...) (Eksternal: ...)") — pola ini TETAP 1 baris, tidak dipecah, krn ";"
 * tidak ada di antara blok kurungnya. Kalau field cuma berisi kategori
 * BARE tanpa kurung sama sekali (mis. C/UC tersimpan polos "UC" tanpa
 * uraian tambahan), tetap dicocokkan ke warnaMap apa adanya agar badge
 * warna tetap muncul.
 */
export function KategoriText({ value, warnaMap }: { value?: string | null; warnaMap: Record<string, { bg: string; text: string }> }) {
  const text = clean(value);
  if (text === '-') return <>-</>;

  // Pisah per-baris HANYA di titik "); " yg diikuti kategori baru — bukan
  // asal split ";" krn uraian dalam kurung sendiri bisa memuat ";" juga
  // (mis. daftar item dipisah titik-koma). Huruf besar/kecil pada kategori
  // berikutnya SAMA-SAMA dianggap awal blok baru (case-insensitive) — data
  // entry tidak selalu konsisten mengkapitalisasi kategori ke-2/3.
  const blocks = text.split(/(?<=\));\s*(?=[A-Za-z])/);

  return (
    <div className="flex flex-col gap-1">
      {blocks.map((block, i) => {
        const match = block.match(/^([^(]+?)\s*(\(.*)$/s);
        // Blok tanpa kurung sama sekali (mis. field C/UC tersimpan bare
        // "UC" tanpa uraian tambahan) — tetap coba cocokkan ke warnaMap
        // apa adanya, supaya badge warna tetap muncul walau tanpa detail.
        if (!match) {
          const bareKategori = block.trim();
          const bareWarna = warnaMap[bareKategori.toLowerCase()];
          if (!bareWarna) return <div key={i}>{block}</div>;

          return (
            <div key={i}>
              <span
                className="inline-block rounded px-1 py-0.5 text-[9px] font-semibold whitespace-nowrap"
                style={{
                  backgroundColor: bareWarna.bg,
                  color: bareWarna.text,
                  WebkitPrintColorAdjust: 'exact',
                  printColorAdjust: 'exact',
                } as React.CSSProperties}
              >
                {bareKategori}
              </span>
            </div>
          );
        }

        const [, kategori, sisa] = match;
        const warna = warnaMap[kategori.trim().toLowerCase()] ?? { bg: '#f1f5f9', text: '#475569' };

        return (
          <div key={i}>
            <span
              className="mr-1 inline-block rounded px-1 py-0.5 text-[9px] font-semibold whitespace-nowrap"
              style={{
                backgroundColor: warna.bg,
                color: warna.text,
                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact',
              } as React.CSSProperties}
            >
              {kategori.trim()}
            </span>
            {sisa}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Sub-tabel Indikator|Baseline|Target di DALAM sel kolom "c" (Indikator
 * Kinerja) — bukan memecah kolom fisik tabel utama, krn Perdep menetapkan
 * "c" sbg SATU kolom (Kolom c: indikator kinerja tujuan strategis). Sama
 * pola dgn IndikatorTable di Cetak2a.tsx, tapi TANPA kolom OPD (tidak
 * relevan di konteks Identifikasi Risiko) dan TANPA header tabel eksplisit
 * (kolom "c" sendiri sudah berlabel "Indikator Kinerja" di header utama).
 */
function IndikatorMiniTable({ rows }: { rows: IndikatorRow[] }) {
  if (rows.length === 0) return <span className="text-muted-foreground">-</span>;
  return (
    <div className="flex flex-col gap-1 text-[10px] leading-snug">
      {rows.map((r, i) => {
        const satuan = clean(r.satuan);
        const baseline = clean(r.baseline);
        const target = clean(r.target);
        const satuanSuffix = satuan !== '-' ? ` ${satuan}` : '';
        return (
          <div key={i} className={i > 0 ? 'border-t border-dotted border-black/40 pt-1' : ''}>
            <div className="font-medium">- {clean(r.ik)}</div>
            <div className="pl-2" style={{ color: '#334155' }}>
              Baseline: {baseline}
              {satuanSuffix} &rarr; Target: {target}
              {satuanSuffix}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Tabel Identifikasi Risiko sesuai kolom a-k Lampiran 5 Form 3a/3b Perdep
 * PPKD No.4/2019, dgn struktur bertingkat Tujuan (header, nomor "1", "2"..)
 * -> Sasaran (nomor "1.a", "1.b".., membawa Indikator Kinerja + tabel
 * risiko) — dipakai bersama Cetak3a/3b/3c. Form 3c (Operasional) memakai
 * hierarki Sasaran Renstra > Program > Kegiatan dan kolom c bermakna
 * "Tahapan Kegiatan" (bukan Indikator Kinerja, sesuai Perdep), lihat
 * prop kolomCLabel/kolomCMode.
 */
export function IdentifikasiRisikoTable({
  entries,
  kolomBLabel = 'Tujuan / Sasaran Strategis',
  kolomCLabel = 'Indikator Kinerja',
  kolomCMode = 'indikator',
  showIkColumn = false,
  ikColumnLabel = 'IK Tujuan',
}: {
  entries: IdentifikasiEntry[];
  kolomBLabel?: string;
  kolomCLabel?: string;
  /** 'indikator' (default, Form 3a/3b): 1 sel per-Kegiatan/Sasaran (rowSpan). 'tahap' (Form 3c): 1 sel per-baris risiko, krn tahapan bisa beda tiap risiko dalam Kegiatan yg sama. */
  kolomCMode?: 'indikator' | 'tahap';
  /** Label kolom IK tambahan (showIkColumn) — beda per form krn levelnya beda: "IK Tujuan" (3a/3b) vs "IK Program" (3c), supaya tidak terlihat identik dgn kolom c ("IK Sasaran"/"IK Kegiatan"). */
  ikColumnLabel?: string;
  /**
   * Sisipkan 1 kolom "Indikator Kinerja" TAMBAHAN di antara kolom b &
   * kolom c — dipakai semua Form 3a/3b/3c krn tiap level header (Tujuan
   * Strategis di 3a/3b, Program di 3c) py IK sendiri yg beda dari IK milik
   * level anaknya (Sasaran/Kegiatan) yg tetap tampil di kolom c/indikator
   * biasa. Kolom ini TIDAK diberi label huruf (a-k) krn di luar kolom baku
   * Lampiran 5, sama pola dgn baris Visi tanpa nomor di info header.
   */
  showIkColumn?: boolean;
}) {
  const totalKolom = showIkColumn ? 12 : 11;
  const bodyColSpan = totalKolom - 1;

  return (
    <table className="mt-3 w-full table-fixed border-collapse border border-black text-[10px]">
      <colgroup>
        <col className="w-[2.5%]" />
        <col className={showIkColumn ? 'w-[10%]' : 'w-[11%]'} />
        {showIkColumn && <col className="w-[11%]" />}
        <col className={showIkColumn ? 'w-[9%]' : 'w-[13%]'} />
        <col className="w-[10%]" />
        <col className="w-[8%]" />
        <col className="w-[5.5%]" />
        <col className="w-[11.5%]" />
        <col className="w-[9.5%]" />
        <col className="w-[8.5%]" />
        <col className={showIkColumn ? 'w-[9%]' : 'w-[10.5%]'} />
        <col className="w-[9.5%]" />
      </colgroup>
      <thead>
        <tr className="bg-muted/40">
          <th rowSpan={2} className="border border-black p-1 align-middle font-semibold">No</th>
          <th rowSpan={2} className="border border-black p-1 align-middle font-semibold">{kolomBLabel}</th>
          {showIkColumn && (
            <th rowSpan={2} className="border border-black p-1 align-middle font-semibold">{ikColumnLabel}</th>
          )}
          <th rowSpan={2} className="border border-black p-1 align-middle font-semibold">{kolomCLabel}</th>
          <th colSpan={3} className="border border-black p-1 text-center font-semibold">Risiko</th>
          <th colSpan={2} className="border border-black p-1 text-center font-semibold">Sebab</th>
          <th rowSpan={2} className="border border-black p-1 align-middle font-semibold">C / UC</th>
          <th colSpan={2} className="border border-black p-1 text-center font-semibold">Dampak</th>
        </tr>
        <tr className="bg-muted/40">
          <th className="border border-black p-1 font-semibold">Uraian</th>
          <th className="border border-black p-1 font-semibold">Kode Risiko</th>
          <th className="border border-black p-1 font-semibold">Pemilik</th>
          <th className="border border-black p-1 font-semibold">Uraian</th>
          <th className="border border-black p-1 font-semibold">Sumber</th>
          <th className="border border-black p-1 font-semibold">Uraian</th>
          <th className="border border-black p-1 font-semibold">Pihak yang Terkena</th>
        </tr>
        {/* Baris label huruf tepat di bawah header, merujuk ke "Keterangan"
            di bawah tabel — sesuai format asli Lampiran 5 Perdep PPKD
            No.4/2019 (lihat Form CEE utk pola serupa). Form 3c (showIkColumn)
            py 1 kolom ekstra (IK Program) shg semua huruf bergeser 1 —
            (a)-(l) alih2 (a)-(k) — TIDAK sama dgn 3a/3b krn kolom IK Tujuan
            di 3a/3b sudah digabung ke kolom b (bukan kolom terpisah). */}
        <tr className="bg-muted/20 text-[9px] italic">
          <th className="border border-black p-0.5 font-normal">(a)</th>
          <th className="border border-black p-0.5 font-normal">(b)</th>
          {showIkColumn && <th className="border border-black p-0.5 font-normal">(c)</th>}
          <th className="border border-black p-0.5 font-normal">({showIkColumn ? 'd' : 'c'})</th>
          <th className="border border-black p-0.5 font-normal">({showIkColumn ? 'e' : 'd'})</th>
          <th className="border border-black p-0.5 font-normal">({showIkColumn ? 'f' : 'e'})</th>
          <th className="border border-black p-0.5 font-normal">({showIkColumn ? 'g' : 'f'})</th>
          <th className="border border-black p-0.5 font-normal">({showIkColumn ? 'h' : 'g'})</th>
          <th className="border border-black p-0.5 font-normal">({showIkColumn ? 'i' : 'h'})</th>
          <th className="border border-black p-0.5 font-normal">({showIkColumn ? 'j' : 'i'})</th>
          <th className="border border-black p-0.5 font-normal">({showIkColumn ? 'k' : 'j'})</th>
          <th className="border border-black p-0.5 font-normal">({showIkColumn ? 'l' : 'k'})</th>
        </tr>
      </thead>
      <tbody>
        {entries.length === 0 && (
          <tr>
            <td colSpan={totalKolom} className="border border-black p-2 text-center text-muted-foreground">
              Belum ada risiko teridentifikasi.
            </td>
          </tr>
        )}
        {entries.map((entry, entryIdx) => {
          if (entry.type === 'misi') {
            // Teks MISI di database SUDAH mengandung prefix sendiri (mis.
            // "Misi 1 : Mewujudkan ..."), beda dari TUJUAN/SASARAN RPJMD yg
            // polos tanpa prefix — kalau ditambah "Misi :" lagi di sini jadi
            // dobel ("Misi : Misi 1 : ..."), makanya label DITAMPILKAN APA
            // ADANYA tanpa prefix tambahan.
            return (
              <tr key={`misi-${entryIdx}`} className="bg-muted/30">
                <td className="border border-black p-1 align-top font-bold">{entry.nomor}</td>
                <td className="border border-black p-1 align-top font-bold" colSpan={bodyColSpan}>
                  {entry.label}
                </td>
              </tr>
            );
          }

          if (entry.type === 'tujuan') {
            return (
              <tr key={`tujuan-${entryIdx}`} className="bg-muted/20">
                <td className="border border-black p-1 align-top font-semibold">{entry.nomor}</td>
                {showIkColumn ? (
                  <>
                    <td className="border border-black p-1 align-top font-semibold">
                      Tujuan Strategis {entry.nomor} : {entry.label}
                    </td>
                    <td className="border border-black p-1 align-top" colSpan={bodyColSpan - 1}>
                      <IndikatorMiniTable rows={entry.indikator_list} />
                    </td>
                  </>
                ) : (
                  <td className="border border-black p-1 align-top font-semibold" colSpan={bodyColSpan}>
                    <div>Tujuan Strategis {entry.nomor} : {entry.label}</div>
                    {entry.indikator_list.length > 0 && (
                      <div className="mt-1 font-normal">
                        <IndikatorMiniTable rows={entry.indikator_list} />
                      </div>
                    )}
                  </td>
                )}
              </tr>
            );
          }

          if (entry.type === 'sasaran_renstra') {
            return (
              <tr key={`sasaran-renstra-${entryIdx}`} className="bg-muted/30">
                <td className="border border-black p-1 align-top font-bold">{entry.nomor}</td>
                <td className="border border-black p-1 align-top font-bold" colSpan={bodyColSpan}>
                  Sasaran Renja {entry.nomor} : {entry.label}
                </td>
              </tr>
            );
          }

          if (entry.type === 'program') {
            return (
              <tr key={`program-${entryIdx}`} className="bg-muted/20">
                <td className="border border-black p-1 align-top font-semibold">{entry.nomor}</td>
                <td className="border border-black p-1 align-top font-semibold" colSpan={showIkColumn ? undefined : bodyColSpan}>
                  Program {entry.nomor} : {entry.label}
                </td>
                {showIkColumn && (
                  <td className="border border-black p-1 align-top" colSpan={bodyColSpan - 1}>
                    <IndikatorMiniTable rows={entry.indikator_list} />
                  </td>
                )}
              </tr>
            );
          }

          const labelPrefix = entry.type === 'kegiatan' ? 'Kegiatan' : 'Sasaran Strategis';

          return entry.risiko_list.map((r, i) => {
            return (
              <tr key={`${entry.type}-${entryIdx}-${i}`}>
                <td className="border border-black p-1 align-top">{i === 0 ? entry.nomor : ''}</td>
                {i === 0 ? (
                  <td className="border border-black p-1 align-top" rowSpan={entry.risiko_list.length}>
                    {labelPrefix} {entry.nomor} : {entry.label}
                  </td>
                ) : null}
                {showIkColumn && i === 0 ? (
                  <td className="border border-black p-1 align-top" rowSpan={entry.risiko_list.length}>
                    <IndikatorMiniTable rows={entry.indikator_list} />
                  </td>
                ) : null}
                {kolomCMode === 'tahap' ? (
                  <td className="border border-black p-1 align-top">{clean(r.tahap)}</td>
                ) : i === 0 ? (
                  <td className="border border-black p-1 align-top" rowSpan={entry.risiko_list.length}>
                    <IndikatorMiniTable rows={entry.indikator_list} />
                  </td>
                ) : null}
                <td className="border border-black p-1 align-top">{clean(r.uraian_risiko)}</td>
                <td className="border border-black p-1 align-top">{clean(r.kode_risiko)}</td>
                <td className="border border-black p-1 align-top">{clean(r.pemilik_risiko)}</td>
                <td className="border border-black p-1 align-top">
                  <KategoriText value={r.sebab} warnaMap={KATEGORI_5M_WARNA} />
                </td>
                <td className="border border-black p-1 align-top">
                  <KategoriText value={r.sumber} warnaMap={KATEGORI_SUMBER_WARNA} />
                </td>
                <td className="border border-black p-1 align-top">
                  <KategoriText value={r.c_uc} warnaMap={KATEGORI_CUC_WARNA} />
                </td>
                <td className="border border-black p-1 align-top">{clean(r.dampak)}</td>
                <td className="border border-black p-1 align-top">{clean(r.pihak_terkena)}</td>
              </tr>
            );
          });
        })}
      </tbody>
    </table>
  );
}

export default function Cetak3a({ tahun, periode, identifikasi, visi, pemerintahKabkota, sumberData, isScopedToOwnOpd }: PageProps) {
  const navigate = (nextTahun: number) => {
    router.get('/cetak/risiko/3a', { tahun: nextTahun }, { preserveState: true, preserveScroll: true, replace: true });
  };

  return (
    <AppLayout>
      <Head title="3a_Identifikasi Risiko Strategis Pemda" />
      <div className="space-y-4 p-4 print:hidden">
        <div>
          <h1 className="text-2xl font-semibold">3a_Identifikasi Risiko Strategis Pemda</h1>
          <p className="text-sm text-muted-foreground">
            {isScopedToOwnOpd
              ? 'Pratinjau cetak ukuran A4 landscape — menampilkan Risiko Strategis Pemda yang diisi OPD Anda saja.'
              : 'Pratinjau cetak ukuran A4 landscape — menggabungkan Risiko Strategis Pemda seluruh OPD.'}
          </p>
          {isScopedToOwnOpd && (
            <p className="mt-1 text-xs text-muted-foreground">Data lintas-OPD hanya bisa dilihat Admin/Super Admin.</p>
          )}
        </div>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="w-32 space-y-1">
            <Label>Tahun Penilaian</Label>
            <Input type="number" value={tahun} onChange={(e) => navigate(Number(e.target.value) || tahun)} />
          </div>
          <Button asChild>
            <a href={`/cetak/risiko/3a/pdf?tahun=${tahun}`}>
              <FileDown className="mr-2 h-4 w-4" />
              Unduh PDF
            </a>
          </Button>
        </div>
      </div>

      <div className="cee-print-sheet mx-auto max-w-[1500px] bg-white p-8 text-black print:m-0 print:max-w-none print:p-0 print:shadow-none">
        <p className="text-right text-xs italic">Form 3a</p>
        <h2 className="mt-2 text-center text-sm font-bold uppercase">Kertas Kerja Identifikasi Risiko Strategis Pemerintah Daerah</h2>

        <table className="mt-4 w-full border-collapse text-xs">
          <tbody>
            <tr>
              <td className="w-44 py-0.5">Nama Pemda</td>
              <td className="py-0.5">: {pemerintahKabkota}</td>
            </tr>
            <tr>
              <td className="py-0.5 align-top">Visi</td>
              <td className="py-0.5">: {clean(visi)}</td>
            </tr>
            <tr>
              <td className="py-0.5">Periode yang Dinilai</td>
              <td className="py-0.5">: {periode ?? '-'}</td>
            </tr>
            <tr>
              <td className="py-0.5">Tahun Penilaian</td>
              <td className="py-0.5">: {tahun}</td>
            </tr>
            <tr>
              <td className="py-0.5">Sumber Data</td>
              <td className="py-0.5">: {clean(sumberData)}</td>
            </tr>
          </tbody>
        </table>

        <IdentifikasiRisikoTable entries={identifikasi} />

        <div className="mt-2 text-[9px] leading-tight text-muted-foreground">
          <p>Keterangan:</p>
          <p>Kolom a diisi dengan nomor urut.</p>
          <p>Kolom b diisi dengan tujuan strategis urusan wajib sebagaimana tercantum dalam RPJMD/Renstra.</p>
          <p>Kolom c diisi dengan indikator kinerja tujuan strategis.</p>
          <p>Kolom d diisi dengan uraian peristiwa yang merupakan risiko.</p>
          <p>Kolom e diisi dengan Kode risiko.</p>
          <p>Kolom f diisi dengan Pemilik risiko, pihak/unit yang bertanggung jawab/berkepentingan untuk mengelola risiko.</p>
          <p>Kolom g diisi dengan penyebab timbulnya risiko. Untuk mempermudah identifikasi sebab risiko, sebab risiko bisa dikategorikan ke dalam: Men, Machine, Method, Material, Money, Management, Measurement, dan Environment (7M+1E).</p>
          <p>Kolom h diisi dengan sumber risiko (Eksternal/Internal).</p>
          <p>Kolom i diisi dengan C, jika unit kerja mampu untuk mengendalikan penyebab risiko, atau UC jika unit kerja tidak mampu mengendalikan risiko.</p>
          <p>Kolom j diisi dengan uraian akibat yang ditimbulkan jika risiko benar-benar terjadi. Untuk mempermudah identifikasi dampak risiko, dampak risiko bisa dikategorikan ke dalam: Keuangan, Kinerja, Reputasi dan Hukum.</p>
          <p>Kolom k diisi dengan pihak/unit yang menderita/terkena dampak jika risiko benar-benar terjadi.</p>
          <p>Indikator kinerja tujuan strategis ditampilkan di kolom b (bersama label Tujuan Strategis), sedangkan kolom c khusus indikator kinerja sasaran strategis.</p>
        </div>
      </div>

      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 10mm; }
          body { background: white; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>
    </AppLayout>
  );
}
