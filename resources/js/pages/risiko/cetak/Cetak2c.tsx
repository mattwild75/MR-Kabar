import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { OpdTahunPicker } from '@/components/cee/opd-tahun-picker';
import { FileDown } from 'lucide-react';

interface KegiatanGroup {
  kegiatan: string;
  program: string | null;
  ik: string[];
  target: string[];
}

interface Konteks {
  sasaran_list: string[];
  program_list: string[];
  kegiatan_groups: KegiatanGroup[];
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

export default function Cetak2c({
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
      <Head title="Form 3a — Penetapan Konteks Risiko Operasional OPD" />
      <div className="space-y-4 p-4 print:hidden">
        <div>
          <h1 className="text-2xl font-semibold">Form 3a — Penetapan Konteks Risiko Operasional OPD</h1>
          <p className="text-sm text-muted-foreground">Pratinjau cetak ukuran A4.</p>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <OpdTahunPicker routeName="/cetak/risiko/2c" opdOptions={opdOptions} opdId={opd?.id ?? null} tahun={tahun} />
          {opd && (
            <Button asChild>
              <a href={`/cetak/risiko/2c/pdf?opd_id=${opd.id}&tahun=${tahun}`}>
                <FileDown className="mr-2 h-4 w-4" />
                Unduh PDF
              </a>
            </Button>
          )}
        </div>
      </div>

      {opd && !konteks && (
        <div className="p-4 print:hidden text-sm text-muted-foreground">
          Belum ada data Penetapan Konteks Risiko Operasional untuk OPD ini (isi lewat Form Input Risiko Operasional PD terlebih dahulu).
        </div>
      )}

      {opd && konteks && (
        <div className="cee-print-sheet mx-auto max-w-4xl bg-white p-8 text-black print:m-0 print:max-w-none print:p-0 print:shadow-none">
          <p className="text-right text-xs italic">Form_III_a</p>
          <h2 className="mt-2 text-center text-sm font-bold uppercase">Penetapan Konteks Risiko Operasional OPD</h2>

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
              <Baris label="Tujuan Strategis">
                <List values={[]} />
              </Baris>
              <Baris label="Sasaran Strategis">
                <List values={konteks.sasaran_list} />
              </Baris>
            </tbody>
          </table>

          <table className="mt-3 w-full border-collapse border border-black text-xs">
            <tbody>
              <Baris label="Program dan Kegiatan Utama">
                <List values={konteks.program_list} />
              </Baris>
              <Baris label="Kegiatan (Output/Keluaran) / Hasil Kegiatan">
                <List values={konteks.kegiatan_groups.map((k) => k.kegiatan)} />
              </Baris>
            </tbody>
          </table>

          {konteks.kegiatan_groups.map((kg, i) => (
            <table key={i} className="mt-3 w-full border-collapse border border-black text-xs">
              <tbody>
                <tr>
                  <td className="w-56 border border-black p-1.5 align-top font-semibold">IK Kegiatan</td>
                  <td className="w-4 border border-black p-1.5 text-center align-top">:</td>
                  <td className="border border-black p-1.5 align-top">
                    <div className="mb-1 font-medium">{kg.kegiatan}</div>
                    <List values={kg.ik} />
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-1.5 align-top font-semibold">Target IK Kegiatan</td>
                  <td className="border border-black p-1.5 text-center align-top">:</td>
                  <td className="border border-black p-1.5 align-top">
                    <List values={kg.target} />
                  </td>
                </tr>
              </tbody>
            </table>
          ))}

          <table className="mt-3 w-full border-collapse border border-black text-xs">
            <tbody>
              <Baris label="Informasi Lain">-</Baris>
              <tr>
                <td className="w-56 border border-black p-1.5 align-top font-semibold">
                  Program, Kegiatan dan IKU yang akan dilakukan penilaian Risiko
                </td>
                <td className="w-4 border border-black p-1.5 text-center align-top">:</td>
                <td className="border border-black p-1.5 align-top">
                  <div className="font-semibold">
                    <List values={konteks.program_list} />
                  </div>
                  {konteks.kegiatan_groups.map((kg, i) => (
                    <div key={i} className="mt-1">
                      <div className="font-semibold">Kegiatan {kg.kegiatan}</div>
                      <div>IK :</div>
                      <List values={kg.ik} />
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
