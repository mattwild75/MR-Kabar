import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { OpdTahunPicker } from '@/components/cee/opd-tahun-picker';
import { FileDown } from 'lucide-react';
import { IdentifikasiRisikoTable } from './Cetak3a';

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
  tahap: string | null;
}

interface SasaranRenstraRow {
  type: 'sasaran_renstra';
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

interface ProgramRow {
  type: 'program';
  nomor: string;
  label: string;
  indikator_list: IndikatorRow[];
}

interface KegiatanRow {
  type: 'kegiatan';
  nomor: string;
  label: string;
  indikator_list: IndikatorRow[];
  risiko_list: RisikoRow[];
}

type IdentifikasiEntry = SasaranRenstraRow | ProgramRow | KegiatanRow;

interface OpdOption {
  id: number;
  nama: string;
}

interface PageProps {
  opdOptions: OpdOption[];
  opd: { id: number; nama: string } | null;
  tahun: number;
  periode: string | null;
  identifikasi: IdentifikasiEntry[] | null;
  pemerintahKabkota: string;
  sumberData: string | null;
  urusanPemerintahan: string | null;
}

function clean(v?: string | null): string {
  if (!v || v === 'Tidak Ada Data') return '-';
  return v;
}

export default function Cetak3c({ opdOptions, opd, tahun, periode, identifikasi, pemerintahKabkota, sumberData, urusanPemerintahan }: PageProps) {
  return (
    <AppLayout>
      <Head title="3c_Identifikasi Risiko Operasional OPD" />
      <div className="space-y-4 p-4 print:hidden">
        <div>
          <h1 className="text-2xl font-semibold">3c_Identifikasi Risiko Operasional OPD</h1>
          <p className="text-sm text-muted-foreground">Pratinjau cetak ukuran A4 landscape.</p>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <OpdTahunPicker routeName="/cetak/risiko/3c" opdOptions={opdOptions} opdId={opd?.id ?? null} tahun={tahun} />
          {opd && (
            <Button asChild>
              <a href={`/cetak/risiko/3c/pdf?opd_id=${opd.id}&tahun=${tahun}`}>
                <FileDown className="mr-2 h-4 w-4" />
                Unduh PDF
              </a>
            </Button>
          )}
        </div>
      </div>

      {opd && !identifikasi && (
        <div className="p-4 print:hidden text-sm text-muted-foreground">
          Belum ada data Identifikasi Risiko Operasional untuk OPD ini (isi lewat Form Input Risiko Operasional PD terlebih dahulu).
        </div>
      )}

      {opd && identifikasi && (
        <div className="cee-print-sheet mx-auto max-w-[1500px] bg-white p-8 text-black print:m-0 print:max-w-none print:p-0 print:shadow-none">
          <p className="text-right text-xs italic">Form 3c</p>
          <h2 className="mt-2 text-center text-sm font-bold uppercase">Kertas Kerja Identifikasi Risiko Operasional OPD</h2>

          <table className="mt-4 w-full border-collapse text-xs">
            <tbody>
              <tr>
                <td className="w-44 py-0.5">Nama Pemda</td>
                <td className="py-0.5">: {pemerintahKabkota}</td>
              </tr>
              <tr>
                <td className="py-0.5">Nama OPD</td>
                <td className="py-0.5">: {opd.nama}</td>
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
                <td className="py-0.5">Urusan Pemerintahan</td>
                <td className="py-0.5">: {clean(urusanPemerintahan)}</td>
              </tr>
              <tr>
                <td className="py-0.5">Sumber Data</td>
                <td className="py-0.5">: {clean(sumberData)}</td>
              </tr>
            </tbody>
          </table>

          <IdentifikasiRisikoTable
            entries={identifikasi}
            kolomBLabel="Program / Kegiatan"
            kolomCLabel="Tahapan Kegiatan"
            kolomCMode="tahap"
            showIkColumn
            ikColumnLabel="IK Program"
          />

          <div className="mt-2 text-[9px] leading-tight text-muted-foreground">
            <p>Keterangan:</p>
            <p>Kolom a diisi dengan nomor urut.</p>
            <p>Kolom b diisi dengan program dan kegiatan sebagaimana tercantum dalam RKA SKPD.</p>
            <p>Kolom c diisi dengan indikator kinerja program.</p>
            <p>Kolom d diisi dengan tahapan kegiatan.</p>
            <p>Kolom e diisi dengan uraian peristiwa yang merupakan risiko.</p>
            <p>Kolom f diisi dengan Kode risiko.</p>
            <p>Kolom g diisi dengan Pemilik risiko, pihak/unit yang bertanggung jawab/berkepentingan untuk mengelola risiko.</p>
            <p>Kolom h diisi dengan penyebab timbulnya risiko. Untuk mempermudah identifikasi sebab risiko, sebab risiko bisa dikategorikan ke dalam: Men, Machine, Method, Material, Money, Management, Measurement, dan Environment (7M+1E).</p>
            <p>Kolom i diisi dengan sumber risiko (Eksternal/Internal).</p>
            <p>Kolom j diisi dengan C, jika unit kerja mampu untuk mengendalikan penyebab risiko, atau UC jika unit kerja tidak mampu mengendalikan penyebab risiko.</p>
            <p>Kolom k diisi dengan uraian akibat yang ditimbulkan jika risiko benar-benar terjadi. Untuk mempermudah identifikasi dampak risiko, dampak risiko bisa dikategorikan ke dalam: Keuangan, Kinerja, Reputasi dan Hukum.</p>
            <p>Kolom l diisi dengan pihak/unit yang menderita/terkena dampak jika risiko benar-benar terjadi.</p>
          </div>
        </div>
      )}

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
