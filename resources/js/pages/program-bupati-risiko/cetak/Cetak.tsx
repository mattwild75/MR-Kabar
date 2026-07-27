import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { MultiPenandatangan } from '@/components/cee/multi-penandatangan';
import { FileDown } from 'lucide-react';

interface ProgramLainRef {
  nomor: number;
  pivot_id: number;
}

interface RisikoRow {
  pivot_id: number;
  tipe: 'irs_pemda' | 'irs_pd' | 'iro_pd';
  id: number;
  kode_risiko: string | null;
  uraian_risiko: string;
  skala_risiko: number | null;
  url: string;
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

interface VisiMisiPemda {
  visi: string | null;
  misi: Record<number, string | null>;
}

interface DataUmum {
  id: number;
  nama_kepala_daerah?: string;
  jabatan_kepala_daerah?: string;
  tempat_pembuatan?: string;
  tanggal_pembuatan?: string;
}

interface PageProps {
  tahun: number;
  periode: string | null;
  pemerintahKabkota: string;
  dataUmum: DataUmum | null;
  programs: ProgramRow[];
  totalRisikoTerpetakan: number;
  visiMisiPemda: VisiMisiPemda;
}

const TIPE_LABEL: Record<RisikoRow['tipe'], string> = {
  irs_pemda: 'IRS Pemda',
  irs_pd: 'IRS PD',
  iro_pd: 'ROO PD',
};

const MISI_URUTAN_LIST = [1, 2, 3, 4, 5, 6, 7] as const;

/** Label skala risiko dicetak sbg ANGKA + teks (bukan cuma warna badge) — supaya tetap terbaca di cetak hitam-putih/fotokopi, sama alasan dgn TahapanBar di Cetak2/Cetak3. */
function skalaLabel(skala: number | null): string {
  if (skala === null) return '-';
  if (skala >= 16) return `${skala} (Sangat Tinggi)`;
  if (skala >= 11) return `${skala} (Tinggi)`;
  if (skala >= 6) return `${skala} (Sedang)`;
  return `${skala} (Rendah)`;
}

function MisiSection({ urutan, nama, programs }: { urutan: number; nama: string | null; programs: ProgramRow[] }) {
  if (programs.length === 0) return null;

  return (
    <div className="mt-4">
      {/* Header Misi TIDAK diberi break-inside-avoid pada seluruh section —
          Misi bisa berisi puluhan baris program yg pasti melebihi 1 halaman
          A4, memaksa seluruh section pindah halaman akan menyisakan area
          kosong besar di halaman sebelumnya. Konten harus mengalir alami
          lintas halaman; hanya BARIS INDIVIDUAL (per program, lihat
          className tr di bawah) yg dijaga agar tidak terpotong di tengah. */}
      <p className="bg-black px-2 py-1 text-[10px] font-bold text-white uppercase break-after-avoid">
        Misi {urutan}
        {nama ? ` : ${nama.replace(/^Misi\s+\d+\s*:\s*/i, '')}` : ' : (belum diisi di KRS Pemda)'}
      </p>
      <table className="mt-1 w-full table-fixed border-collapse border border-black text-[9px]">
        <colgroup>
          <col className="w-[4%]" />
          <col className="w-[24%]" />
          <col className="w-[16%]" />
          <col className="w-[56%]" />
        </colgroup>
        <thead>
          <tr className="bg-muted/40">
            <th className="border border-black p-1 font-semibold">No</th>
            <th className="border border-black p-1 font-semibold">Program Pembangunan</th>
            <th className="border border-black p-1 font-semibold">Perangkat Daerah</th>
            <th className="border border-black p-1 font-semibold">Risiko Teridentifikasi (Kode — Uraian — Skala)</th>
          </tr>
        </thead>
        <tbody>
          {programs.map((p) => (
            <tr key={p.id} className="break-inside-avoid">
              <td className="border border-black p-1 align-top">{p.nomor}</td>
              <td className="border border-black p-1 align-top">
                {p.program_pembangunan}
                {p.branding && <span className="italic"> ({p.branding})</span>}
              </td>
              <td className="border border-black p-1 align-top">{p.perangkat_daerah}</td>
              <td className="border border-black p-1 align-top">
                {p.risiko.length === 0 ? (
                  <span className="text-muted-foreground italic">Belum ada risiko yang dikaitkan.</span>
                ) : (
                  <ul className="space-y-0.5">
                    {p.risiko.map((r) => (
                      <li key={r.pivot_id}>
                        <span className="font-semibold">[{TIPE_LABEL[r.tipe]}{r.kode_risiko ? ` ${r.kode_risiko}` : ''}]</span>{' '}
                        {r.uraian_risiko} — <span className="font-semibold">Skala {skalaLabel(r.skala_risiko)}</span>
                        {r.program_semua.length > 1 && (
                          <span className="text-muted-foreground">
                            {' '}
                            (juga di Program {r.program_semua.map((s) => `#${s.nomor}`).join(', ')})
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function CetakProgramBupatiRisiko({ tahun, periode, pemerintahKabkota, dataUmum, programs, totalRisikoTerpetakan, visiMisiPemda }: PageProps) {
  const pdfHref = `/program-bupati-risiko/cetak/pdf?${new URLSearchParams({ tahun: String(tahun) })}`;

  const grouped = MISI_URUTAN_LIST.map((urutan) => ({
    urutan,
    nama: visiMisiPemda.misi[urutan] ?? null,
    programs: programs.filter((p) => p.misi_urutan === urutan).sort((a, b) => a.nomor - b.nomor),
  })).filter((g) => g.programs.length > 0);

  const totalPrioritas = programs.reduce((sum, p) => sum + p.jumlah_risiko_prioritas, 0);

  return (
    <AppLayout>
      <Head title="Risiko 100 Program Bupati - Cetak" />
      <div className="space-y-4 p-4 print:hidden">
        <div>
          <h1 className="text-2xl font-semibold">Risiko 100 Program Bupati — Cetak</h1>
          <p className="text-sm text-muted-foreground">
            Pratinjau cetak ukuran A4 portrait — Tahun {tahun}. Level Pemerintah Daerah, dikelompokkan per Misi RPJMD.
          </p>
        </div>
        <div className="flex justify-end">
          <Button asChild>
            <a href={pdfHref}>
              <FileDown className="mr-2 h-4 w-4" />
              Unduh PDF
            </a>
          </Button>
        </div>
      </div>

      <div className="cee-print-sheet mx-auto max-w-[1500px] bg-white p-8 text-black print:m-0 print:max-w-none print:p-0 print:shadow-none">
        <h2 className="mt-2 text-center text-sm font-bold uppercase">Peta Risiko 100 Program Pembangunan Bupati</h2>
        <p className="text-center text-xs">{pemerintahKabkota}</p>

        <table className="mt-4 w-full border-collapse text-xs">
          <tbody>
            <tr>
              <td className="w-44 py-0.5">Periode yang Dinilai</td>
              <td className="py-0.5">: {periode ?? '-'}</td>
            </tr>
            <tr>
              <td className="py-0.5">Tahun Penilaian</td>
              <td className="py-0.5">: {tahun}</td>
            </tr>
            <tr>
              <td className="py-0.5">Total Program</td>
              <td className="py-0.5">: {programs.length} / 100</td>
            </tr>
            <tr>
              <td className="py-0.5">Total Risiko Terpetakan</td>
              <td className="py-0.5">: {totalRisikoTerpetakan} risiko ({totalPrioritas} kaitan risiko prioritas)</td>
            </tr>
          </tbody>
        </table>

        {visiMisiPemda.visi && (
          <div className="mt-3 border border-black p-2 text-xs">
            <span className="font-semibold">Visi:</span> {visiMisiPemda.visi}
          </div>
        )}

        {grouped.map((g) => (
          <MisiSection key={g.urutan} urutan={g.urutan} nama={g.nama} programs={g.programs} />
        ))}

        <MultiPenandatangan
          penandatangan={[]}
          kepalaNama={dataUmum?.nama_kepala_daerah ?? null}
          kepalaJabatan={dataUmum?.jabatan_kepala_daerah ?? 'Kepala Daerah'}
          kepalaNip={null}
          tempatPembuatan={dataUmum?.tempat_pembuatan ?? null}
          tanggalPembuatan={dataUmum?.tanggal_pembuatan ?? null}
        />
      </div>

      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 15mm; }
          body { background: white; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>
    </AppLayout>
  );
}
