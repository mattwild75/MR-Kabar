import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileDown } from 'lucide-react';
import { KategoriText, KATEGORI_5M_WARNA } from './Cetak3a';

interface PrioritasRow {
  opd: string | null;
  uraian_risiko: string;
  kode_risiko: string | null;
  skala_risiko: number | null;
  pemilik_risiko: string | null;
  sebab: string | null;
  dampak: string | null;
}

interface RiskLevelRow {
  label: string;
  skala_min: number;
  skala_max: number;
  warna_class: string;
}

interface PageProps {
  tahun: number;
  periode: string | null;
  sections: {
    strategis_pemda: PrioritasRow[];
    strategis_opd: PrioritasRow[];
    operasional_opd: PrioritasRow[];
  };
  pemerintahKabkota: string;
  riskLevels: RiskLevelRow[];
  /** true kalau PIC biasa (bukan Admin/Super Admin) — data sudah difilter server-side hanya OPD-nya sendiri. */
  isScopedToOwnOpd: boolean;
}

function clean(v?: string | null): string {
  if (!v || v === 'Tidak Ada Data') return '-';
  return v;
}

function skalaBadgeClass(skala: number | null, riskLevels: RiskLevelRow[]): string {
  if (skala === null) return 'bg-muted text-muted-foreground';
  const level = riskLevels.find((l) => skala >= l.skala_min && skala <= l.skala_max);
  return level?.warna_class ?? 'bg-muted text-muted-foreground';
}

/**
 * Tabel Daftar Risiko Prioritas sesuai Lampiran 5 Form 5 Perdep PPKD
 * No.4/2019 — hanya menampilkan risiko dgn kriteria "Tinggi" & "Sangat
 * Tinggi" (sudah difilter backend, lihat
 * CetakHasilAnalisisController::filterPrioritas()), dikelompokkan 3
 * section romawi sama seperti Form 4. Kolom Penyebab memakai badge warna
 * kategori 5M yg SAMA dgn Form 3a/3b/3c (KategoriText + KATEGORI_5M_WARNA,
 * lihat Cetak3a.tsx) — field `sebab` tersimpan format identik ("Kategori
 * (uraian...)") di ketiga tingkat risiko (IrsPemda/IrsPd/IroPd), jadi wajar
 * konsisten diberi badge yg sama, bukan teks polos.
 * Kolom "OPD" (di luar kolom baku Perdep, kolom baku aslinya cuma a-g) TETAP
 * diberi label huruf urut (b) — bukan dikosongkan — sehingga penomoran huruf
 * tabel ini jadi (a)-(h), BUKAN (a)-(g) spt Perdep asli.
 */
function PrioritasTable({ sections, riskLevels }: { sections: PageProps['sections']; riskLevels: RiskLevelRow[] }) {
  const sectionDefs: { key: keyof PageProps['sections']; label: string }[] = [
    { key: 'strategis_pemda', label: 'Risiko Strategis' },
    { key: 'strategis_opd', label: 'Risiko Strategis OPD' },
    { key: 'operasional_opd', label: 'Risiko Operasional OPD' },
  ];

  return (
    <table className="mt-3 w-full table-fixed border-collapse border border-black text-[10px]">
      <colgroup>
        <col className="w-[3%]" />
        <col className="w-[7%]" />
        <col className="w-[24%]" />
        <col className="w-[11%]" />
        <col className="w-[6%]" />
        <col className="w-[12%]" />
        <col className="w-[19%]" />
        <col className="w-[18%]" />
      </colgroup>
      <thead>
        <tr className="bg-muted/40">
          <th className="border border-black p-1 align-middle font-semibold">
            No
            <div className="text-[9px] font-normal italic">(a)</div>
          </th>
          <th className="border border-black p-1 align-middle font-semibold">
            OPD
            <div className="text-[9px] font-normal italic">(b)</div>
          </th>
          <th className="border border-black p-1 align-middle font-semibold">
            Risiko Prioritas
            <div className="text-[9px] font-normal italic">(c)</div>
          </th>
          <th className="border border-black p-1 align-middle font-semibold">
            Kode Risiko
            <div className="text-[9px] font-normal italic">(d)</div>
          </th>
          <th className="border border-black p-1 align-middle font-semibold">
            Skala Risiko
            <div className="text-[9px] font-normal italic">(e)</div>
          </th>
          <th className="border border-black p-1 align-middle font-semibold">
            Pemilik Risiko
            <div className="text-[9px] font-normal italic">(f)</div>
          </th>
          <th className="border border-black p-1 align-middle font-semibold">
            Penyebab
            <div className="text-[9px] font-normal italic">(g)</div>
          </th>
          <th className="border border-black p-1 align-middle font-semibold">
            Dampak
            <div className="text-[9px] font-normal italic">(h)</div>
          </th>
        </tr>
      </thead>
      {sectionDefs.every((s) => sections[s.key].length === 0) && (
        <tbody>
          <tr>
            <td colSpan={8} className="border border-black p-2 text-center text-muted-foreground">
              Tidak ada risiko dengan kriteria Tinggi/Sangat Tinggi.
            </td>
          </tr>
        </tbody>
      )}
      {sectionDefs.map((section, sectionIdx) => {
        const rows = sections[section.key];
        if (rows.length === 0) return null;

        return (
          <tbody key={section.key}>
            <tr className="bg-muted/30">
              <td className="border border-black p-1 align-top font-bold">{['I', 'II', 'III'][sectionIdx]}</td>
              <td className="border border-black p-1 align-top font-bold" colSpan={7}>
                {section.label}
              </td>
            </tr>
            {rows.map((r, i) => (
              <tr key={`${section.key}-${i}`}>
                <td className="border border-black p-1 align-top">{i + 1}</td>
                <td className="border border-black p-1 align-top">{clean(r.opd)}</td>
                <td className="border border-black p-1 align-top">{clean(r.uraian_risiko)}</td>
                <td className="border border-black p-1 align-top">{clean(r.kode_risiko)}</td>
                <td className="border border-black p-1 text-center align-top">
                  <span className={`inline-block w-full rounded px-1 py-0.5 text-center font-semibold ${skalaBadgeClass(r.skala_risiko, riskLevels)}`}>
                    {r.skala_risiko ?? '-'}
                  </span>
                </td>
                <td className="border border-black p-1 align-top">{clean(r.pemilik_risiko)}</td>
                <td className="border border-black p-1 align-top">
                  <KategoriText value={r.sebab} warnaMap={KATEGORI_5M_WARNA} />
                </td>
                <td className="border border-black p-1 align-top">{clean(r.dampak)}</td>
              </tr>
            ))}
          </tbody>
        );
      })}
    </table>
  );
}

export default function Cetak5({ tahun, periode, sections, pemerintahKabkota, riskLevels, isScopedToOwnOpd }: PageProps) {
  const navigate = (nextTahun: number) => {
    router.get('/cetak/risiko/5', { tahun: nextTahun }, { preserveState: true, preserveScroll: true, replace: true });
  };

  return (
    <AppLayout>
      <Head title="5_Daftar Risiko Prioritas" />
      <div className="space-y-4 p-4 print:hidden">
        <div>
          <h1 className="text-2xl font-semibold">5_Daftar Risiko Prioritas</h1>
          <p className="text-sm text-muted-foreground">
            {isScopedToOwnOpd
              ? 'Pratinjau cetak ukuran A4 landscape — hanya risiko OPD Anda dengan kriteria Tinggi & Sangat Tinggi.'
              : 'Pratinjau cetak ukuran A4 landscape — hanya risiko dengan kriteria Tinggi & Sangat Tinggi, lintas Pemda dan seluruh OPD.'}
          </p>
          {isScopedToOwnOpd && (
            <p className="mt-1 text-xs text-muted-foreground">
              Data lintas-OPD (termasuk Risiko Strategis Pemda) hanya bisa dilihat Admin/Super Admin.
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="w-32 space-y-1">
            <Label>Tahun Penilaian</Label>
            <Input type="number" value={tahun} onChange={(e) => navigate(Number(e.target.value) || tahun)} />
          </div>
          <Button asChild>
            <a href={`/cetak/risiko/5/pdf?tahun=${tahun}`}>
              <FileDown className="mr-2 h-4 w-4" />
              Unduh PDF
            </a>
          </Button>
        </div>
      </div>

      <div className="cee-print-sheet mx-auto max-w-[1500px] bg-white p-8 text-black print:m-0 print:max-w-none print:p-0 print:shadow-none">
        <p className="text-right text-xs italic">Form 5</p>
        <h2 className="mt-2 text-center text-sm font-bold uppercase">Kertas Kerja Daftar Risiko Prioritas</h2>

        <table className="mt-4 w-full border-collapse text-xs">
          <tbody>
            <tr>
              <td className="w-44 py-0.5">Nama Pemda</td>
              <td className="py-0.5">: {pemerintahKabkota}</td>
            </tr>
            <tr>
              <td className="py-0.5">Periode yang Dinilai</td>
              <td className="py-0.5">: {periode ?? '-'}</td>
            </tr>
            <tr>
              <td className="py-0.5">Tahun Penilaian</td>
              <td className="py-0.5">: {tahun}</td>
            </tr>
          </tbody>
        </table>

        <PrioritasTable sections={sections} riskLevels={riskLevels} />

        <div className="keterangan-form5 mt-2 text-[9px] leading-tight text-muted-foreground">
          <p>Keterangan:</p>
          <p>Kolom a diisi dengan nomor urut.</p>
          <p>Kolom b diisi dengan nama Perangkat Daerah pemilik risiko — di luar kolom baku Perdep, ditambahkan krn Form ini menggabungkan seluruh OPD sekaligus.</p>
          <p>Kolom c diisi dengan risiko prioritas.</p>
          <p>Kolom d diisi dengan kode risiko.</p>
          <p>Kolom e diisi dengan skala risiko (sesuai Lampiran 7).</p>
          <p>Kolom f diisi dengan pemilik risiko sesuai Lampiran 6a dan 6b.</p>
          <p>Kolom g diisi dengan penyebab sesuai Lampiran 6a dan 6b.</p>
          <p>Kolom h diisi dengan dampak sesuai dengan Lampiran 6a dan 6b.</p>
          <p>Risiko prioritas = risiko dengan kriteria &quot;Tinggi&quot; dan &quot;Sangat Tinggi&quot; sesuai Perdep PPKD No.4/2019 Bab III.C, batas skala mengikuti pengaturan Level Risiko (Settings &gt; Keterangan Pendukung).</p>
        </div>
      </div>

      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 10mm; }
          body { background: white; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
        .keterangan-form5 {
          break-inside: avoid;
          page-break-inside: avoid;
        }
      `}</style>
    </AppLayout>
  );
}
