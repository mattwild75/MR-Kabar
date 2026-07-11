import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { OpdTahunPicker } from '@/components/cee/opd-tahun-picker';
import { FileDown } from 'lucide-react';

interface SasaranGroup {
  sasaran: string;
  tujuan: string | null;
  ik: string[];
  target: string[];
}

interface Konteks {
  tujuan_list: string[];
  sasaran_groups: SasaranGroup[];
  program_list: string[];
}

interface DataUmum {
  nama_kepala_dinas?: string;
  jabatan_kepala_dinas?: string;
  nip_kepala_dinas?: string;
  nama_pic?: string;
  tempat_pembuatan?: string;
  tanggal_pembuatan?: string;
}

interface OpdOption {
  id: number;
  nama: string;
}

interface PageProps {
  opdOptions: OpdOption[];
  opd: { id: number; nama: string } | null;
  tahun: number;
  periode: string | null;
  konteks: Konteks | null;
  pemerintahKabkota: string;
  sumberData: string | null;
  urusanPemerintahan: string | null;
  dataUmum: DataUmum | null;
}

function Baris({ label, children, highlight }: { label: string; children: React.ReactNode; highlight?: boolean }) {
  return (
    <tr>
      <td className="w-56 border border-black p-1.5 align-top font-semibold">{label}</td>
      <td className="w-4 border border-black p-1.5 text-center align-top">:</td>
      <td className={`border border-black p-1.5 align-top ${highlight ? 'bg-yellow-100 font-semibold uppercase' : ''}`}>
        {children}
      </td>
    </tr>
  );
}

function List({ values }: { values: string[] }) {
  if (values.length === 0) return <>-</>;
  return (
    <>
      {values.map((v, i) => (
        <div key={i}>{v}</div>
      ))}
    </>
  );
}

// "Tidak Ada Data" adalah literal placeholder lama dari data mentah
// krs_pd/kro_pd (kini digantikan null) — tampilkan sbg "-", konsisten
// dgn Cetak2a.tsx.
function clean(v?: string | null): string {
  if (!v || v === 'Tidak Ada Data') return '-';
  return v;
}

export default function Cetak2b({
  opdOptions,
  opd,
  tahun,
  periode,
  konteks,
  pemerintahKabkota,
  sumberData,
  urusanPemerintahan,
  dataUmum,
}: PageProps) {
  return (
    <AppLayout>
      <Head title="Form 2a — Penetapan Konteks Risiko Strategis OPD" />
      <div className="space-y-4 p-4 print:hidden">
        <div>
          <h1 className="text-2xl font-semibold">Form 2a — Penetapan Konteks Risiko Strategis OPD</h1>
          <p className="text-sm text-muted-foreground">Pratinjau cetak ukuran A4.</p>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <OpdTahunPicker routeName="/cetak/risiko/2b" opdOptions={opdOptions} opdId={opd?.id ?? null} tahun={tahun} />
          {opd && (
            <Button asChild>
              <a href={`/cetak/risiko/2b/pdf?opd_id=${opd.id}&tahun=${tahun}`}>
                <FileDown className="mr-2 h-4 w-4" />
                Unduh PDF
              </a>
            </Button>
          )}
        </div>
      </div>

      {opd && !konteks && (
        <div className="p-4 print:hidden text-sm text-muted-foreground">
          Belum ada data Penetapan Konteks Risiko Strategis untuk OPD ini (isi lewat Form Input Risiko Strategis PD terlebih dahulu).
        </div>
      )}

      {opd && konteks && (
        <div className="cee-print-sheet mx-auto max-w-4xl bg-white p-8 text-black print:m-0 print:max-w-none print:p-0 print:shadow-none">
          <p className="text-right text-xs italic">Form_II_a</p>
          <h2 className="mt-2 text-center text-sm font-bold uppercase">Penetapan Konteks Risiko Strategis OPD</h2>

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
              <tr>
                <td className="py-0.5">Urusan Pemerintahan</td>
                <td className="py-0.5">: {urusanPemerintahan ?? '-'}</td>
              </tr>
              <tr>
                <td className="py-0.5">OPD yang Dinilai</td>
                <td className="py-0.5">: {opd.nama}</td>
              </tr>
            </tbody>
          </table>

          <table className="mt-3 w-full border-collapse border border-black text-xs">
            <tbody>
              <Baris label="Sumber Data" highlight>
                {clean(sumberData)}
              </Baris>
              <Baris label="Tujuan Strategis Renstra">
                <List values={konteks.tujuan_list} />
              </Baris>
              <Baris label="Penetapan Konteks Risiko Strategis OPD">
                <span className="font-semibold">
                  <List values={konteks.tujuan_list} />
                </span>
              </Baris>
              <Baris label="Sasaran Strategis Renstra">
                <List values={konteks.sasaran_groups.map((s) => s.sasaran)} />
              </Baris>
            </tbody>
          </table>

          {konteks.sasaran_groups.map((sg, i) => (
            <table key={i} className="mt-3 w-full border-collapse border border-black text-xs">
              <tbody>
                <tr>
                  <td className="w-56 border border-black p-1.5 align-top font-semibold">IKU Renstra OPD</td>
                  <td className="w-4 border border-black p-1.5 text-center align-top">:</td>
                  <td className="border border-black p-1.5 align-top">
                    <List values={sg.ik} />
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-1.5 align-top font-semibold">Target IKU Renstra OPD</td>
                  <td className="border border-black p-1.5 text-center align-top">:</td>
                  <td className="border border-black p-1.5 align-top">
                    <List values={sg.target} />
                  </td>
                </tr>
              </tbody>
            </table>
          ))}

          <table className="mt-3 w-full border-collapse border border-black text-xs">
            <tbody>
              <Baris label="Program">
                <List values={konteks.program_list} />
              </Baris>
              <Baris label="Informasi Lain">-</Baris>
              <tr>
                <td className="w-56 border border-black p-1.5 align-top font-semibold">
                  Tujuan, Sasaran, IKU yang akan dilakukan penilaian Risiko
                </td>
                <td className="w-4 border border-black p-1.5 text-center align-top">:</td>
                <td className="border border-black p-1.5 align-top">
                  <div className="font-semibold">
                    <List values={konteks.tujuan_list} />
                  </div>
                  {konteks.sasaran_groups.map((sg, i) => (
                    <div key={i} className="mt-1">
                      <div className="font-semibold">Sasaran {sg.sasaran}</div>
                      <div>IKU :</div>
                      <List values={sg.ik} />
                    </div>
                  ))}
                </td>
              </tr>
            </tbody>
          </table>

          {dataUmum?.nama_pic && <p className="mt-2 text-xs italic">PIC : {dataUmum.nama_pic}</p>}

          <div className="mt-8 flex justify-end text-xs">
            <div className="w-64 text-center">
              <p>
                {dataUmum?.tempat_pembuatan ?? ''}
                {dataUmum?.tempat_pembuatan && ', '}
                {dataUmum?.tanggal_pembuatan ?? ''}
              </p>
              <p className="mt-2 font-semibold uppercase">{dataUmum?.jabatan_kepala_dinas ?? `Kepala ${opd.nama}`}</p>
              <div className="mt-16">
                <p className="font-semibold underline">{dataUmum?.nama_kepala_dinas ?? ''}</p>
                <p>NIP. {dataUmum?.nip_kepala_dinas ?? ''}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 15mm; }
          body { background: white; }
        }
      `}</style>
    </AppLayout>
  );
}
