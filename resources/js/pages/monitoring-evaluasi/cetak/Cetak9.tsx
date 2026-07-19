import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { OpdTahunPicker } from '@/components/cee/opd-tahun-picker';
import { FileDown } from 'lucide-react';
import { MultiPenandatangan } from '@/components/cee/multi-penandatangan';
import { MultiPenandatanganEditor } from '@/components/cee/multi-penandatangan-editor';
import RtpCategoryText from '@/components/ui/rtp-category-text';

interface Row {
  kegiatan_pengendalian: string | null;
  metode_pemantauan: string | null;
  penanggung_jawab_pemantauan: string | null;
  rencana_pemantauan: string | null;
  realisasi_pemantauan: string | null;
  keterangan_pemantauan: string | null;
}

interface Signatory {
  jabatan: string;
  nama: string;
  nip: string;
}

interface DataUmum {
  id: number;
  nama_kepala_dinas?: string;
  jabatan_kepala_dinas?: string;
  nip_kepala_dinas?: string;
  tempat_pembuatan?: string;
  tanggal_pembuatan?: string;
  tanggal_pembuatan_raw?: string;
  penandatangan?: Signatory[];
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
  rows: Row[];
  pemerintahKabkota: string;
  dataUmum: DataUmum | null;
}

function clean(v?: string | null): string {
  if (!v) return '-';
  return v;
}

/**
 * Tabel Rencana & Realisasi Pemantauan atas Kegiatan Pengendalian Intern
 * yang Dibutuhkan — Lampiran 5 Form 9 Perdep PPKD No.4/2019, kolom (a)-(g).
 * Kolom (b) diproyeksi LIVE dari RTP sumber, sama pola dgn Form 8.
 */
function Form9Table({ rows }: { rows: Row[] }) {
  return (
    <table className="mt-3 w-full table-fixed border-collapse border border-black text-[10px]">
      <colgroup>
        <col className="w-[3%]" />
        <col className="w-[24%]" />
        <col className="w-[16%]" />
        <col className="w-[16%]" />
        <col className="w-[13%]" />
        <col className="w-[13%]" />
        <col className="w-[15%]" />
      </colgroup>
      <thead>
        <tr className="bg-muted/40">
          <th className="border border-black p-1 align-middle font-semibold">
            No
            <div className="text-[9px] font-normal italic">(a)</div>
          </th>
          <th className="border border-black p-1 align-middle font-semibold">
            Kegiatan Pengendalian yang Dibutuhkan
            <div className="text-[9px] font-normal italic">(b)</div>
          </th>
          <th className="border border-black p-1 align-middle font-semibold">
            Bentuk/Metode Pemantauan yang Diperlukan
            <div className="text-[9px] font-normal italic">(c)</div>
          </th>
          <th className="border border-black p-1 align-middle font-semibold">
            Penanggung Jawab Pemantauan
            <div className="text-[9px] font-normal italic">(d)</div>
          </th>
          <th className="border border-black p-1 align-middle font-semibold">
            Rencana Waktu Pelaksanaan Pemantauan
            <div className="text-[9px] font-normal italic">(e)</div>
          </th>
          <th className="border border-black p-1 align-middle font-semibold">
            Realisasi Waktu Pelaksanaan
            <div className="text-[9px] font-normal italic">(f)</div>
          </th>
          <th className="border border-black p-1 align-middle font-semibold">
            Keterangan
            <div className="text-[9px] font-normal italic">(g)</div>
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && (
          <tr>
            <td colSpan={7} className="border border-black p-2 text-center text-muted-foreground">
              Belum ada RTP yang dilengkapi kolom Monitoring Pemantauan (isi lewat Form Input 8-9).
            </td>
          </tr>
        )}
        {rows.map((r, i) => (
          <tr key={i}>
            <td className="border border-black p-1 align-top">{i + 1}</td>
            <td className="border border-black p-1 align-top">
              <RtpCategoryText text={clean(r.kegiatan_pengendalian)} />
            </td>
            <td className="border border-black p-1 align-top">{clean(r.metode_pemantauan)}</td>
            <td className="border border-black p-1 align-top">{clean(r.penanggung_jawab_pemantauan)}</td>
            <td className="border border-black p-1 align-top">{clean(r.rencana_pemantauan)}</td>
            <td className="border border-black p-1 align-top">{clean(r.realisasi_pemantauan)}</td>
            <td className="border border-black p-1 align-top">{clean(r.keterangan_pemantauan)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function Cetak9({ opdOptions, opd, tahun, periode, rows, pemerintahKabkota, dataUmum }: PageProps) {
  return (
    <AppLayout>
      <Head title="9_Rencana & Realisasi Pemantauan" />
      <div className="space-y-4 p-4 print:hidden">
        <div>
          <h1 className="text-2xl font-semibold">9_Rencana &amp; Realisasi Pemantauan</h1>
          <p className="text-sm text-muted-foreground">Pratinjau cetak ukuran A4 landscape.</p>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <OpdTahunPicker routeName="/cetak/monitoring-evaluasi/9" opdOptions={opdOptions} opdId={opd?.id ?? null} tahun={tahun} />
          {opd && (
            <Button asChild>
              <a href={`/cetak/monitoring-evaluasi/9/pdf?opd_id=${opd.id}&tahun=${tahun}`}>
                <FileDown className="mr-2 h-4 w-4" />
                Unduh PDF
              </a>
            </Button>
          )}
        </div>
      </div>

      {opd && (
        <div className="cee-print-sheet mx-auto max-w-[1500px] bg-white p-8 text-black print:m-0 print:max-w-none print:p-0 print:shadow-none">
          <p className="text-right text-xs italic">Form 9</p>
          <h2 className="mt-2 text-center text-sm font-bold uppercase">
            Rencana dan Realisasi Pemantauan atas Kegiatan Pengendalian Intern yang Dibutuhkan
          </h2>

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
                <td className="py-0.5">OPD / SKPK</td>
                <td className="py-0.5">: {opd.nama}</td>
              </tr>
            </tbody>
          </table>

          <Form9Table rows={rows} />

          <div className="mt-2 text-[9px] leading-tight text-muted-foreground">
            <p>Keterangan:</p>
            <p>Kolom a diisi dengan nomor urut.</p>
            <p>Kolom b diisi dengan Kegiatan Pengendalian yang Dibutuhkan (RTP yang sudah disusun di Form Input Risiko/CEE).</p>
            <p>Kolom c diisi dengan Bentuk/Metode Pemantauan yang Diperlukan.</p>
            <p>Kolom d diisi dengan Penanggung Jawab Pemantauan.</p>
            <p>Kolom e diisi dengan Rencana Waktu Pelaksanaan Pemantauan.</p>
            <p>Kolom f diisi dengan Realisasi Waktu Pelaksanaan.</p>
            <p>Kolom g diisi dengan Keterangan tambahan (hasil pemantauan, pendokumentasian, pendistribusian, dsb).</p>
          </div>

          <MultiPenandatangan
            penandatangan={dataUmum?.penandatangan ?? []}
            kepalaNama={dataUmum?.nama_kepala_dinas ?? null}
            kepalaJabatan={dataUmum?.jabatan_kepala_dinas ?? `Kepala ${opd.nama}`}
            kepalaNip={dataUmum?.nip_kepala_dinas ?? null}
            tempatPembuatan={dataUmum?.tempat_pembuatan ?? null}
            tanggalPembuatan={dataUmum?.tanggal_pembuatan ?? null}
          />

          {dataUmum && (
            <div className="mt-4 flex justify-center">
              <div className="w-full max-w-2xl">
                <MultiPenandatanganEditor
                  key={dataUmum.id}
                  dataUmumId={dataUmum.id}
                  penandatangan={dataUmum.penandatangan ?? []}
                  tempatPembuatan={dataUmum.tempat_pembuatan ?? ''}
                  tanggalPembuatan={dataUmum.tanggal_pembuatan_raw ?? ''}
                  kepalaJabatan={dataUmum.jabatan_kepala_dinas ?? `Kepala ${opd.nama}`}
                  kepalaJabatanField="jabatan_kepala_dinas"
                  kepalaNama={dataUmum.nama_kepala_dinas ?? ''}
                  kepalaNamaField="nama_kepala_dinas"
                  kepalaNip={dataUmum.nip_kepala_dinas ?? ''}
                />
              </div>
            </div>
          )}
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
