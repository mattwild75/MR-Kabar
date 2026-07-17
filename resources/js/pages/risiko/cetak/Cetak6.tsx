import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { OpdTahunPicker } from '@/components/cee/opd-tahun-picker';
import { FileDown } from 'lucide-react';
import { MultiPenandatangan } from '@/components/cee/multi-penandatangan';
import { MultiPenandatanganEditor } from '@/components/cee/multi-penandatangan-editor';
import RtpCategoryText from '@/components/ui/rtp-category-text';

interface RtpRow {
  kondisi_kurang_memadai: string;
  rencana_tindak_pengendalian: string | null;
  penanggung_jawab: string | null;
  target: string | null;
  realisasi: string | null;
}

interface UnsurGroup {
  unsur_kode: string;
  unsur_nama: string;
  rows: RtpRow[];
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
  unsurList: UnsurGroup[];
  pemerintahKabkota: string;
  dataUmum: DataUmum | null;
}

function clean(v?: string | null): string {
  if (!v || v === 'Tidak Ada Data') return '-';
  return v;
}

/**
 * Tabel RTP atas CEE, kolom (a)-(f) sesuai Lampiran 5 Form 6 Perdep PPKD
 * No.4/2019 — dikelompokkan per unsur Lingkungan Pengendalian (romawi I-VIII
 * sesuai urutan cee_unsur), sumbernya Form Input 1d (CeeRtp).
 */
function RtpCeeTable({ unsurList }: { unsurList: UnsurGroup[] }) {
  return (
    <table className="mt-3 w-full table-fixed border-collapse border border-black text-[10px]">
      <colgroup>
        <col className="w-[3%]" />
        <col className="w-[27%]" />
        <col className="w-[27%]" />
        <col className="w-[15%]" />
        <col className="w-[14%]" />
        <col className="w-[14%]" />
      </colgroup>
      <thead>
        <tr className="bg-muted/40">
          <th className="border border-black p-1 font-semibold">No</th>
          <th className="border border-black p-1 font-semibold">Kondisi Lingkungan Pengendalian yang Kurang Memadai</th>
          <th className="border border-black p-1 font-semibold">Rencana Tindak Pengendalian Lingkungan Pengendalian</th>
          <th className="border border-black p-1 font-semibold">Penanggung Jawab</th>
          <th className="border border-black p-1 font-semibold">Target Waktu Penyelesaian</th>
          <th className="border border-black p-1 font-semibold">Realisasi Penyelesaian</th>
        </tr>
        <tr className="bg-muted/20 text-[9px] italic">
          <th className="border border-black p-0.5 font-normal">(a)</th>
          <th className="border border-black p-0.5 font-normal">(b)</th>
          <th className="border border-black p-0.5 font-normal">(c)</th>
          <th className="border border-black p-0.5 font-normal">(d)</th>
          <th className="border border-black p-0.5 font-normal">(e)</th>
          <th className="border border-black p-0.5 font-normal">(f)</th>
        </tr>
      </thead>
      {unsurList.length === 0 && (
        <tbody>
          <tr>
            <td colSpan={6} className="border border-black p-2 text-center text-muted-foreground">
              Belum ada RTP CEE (isi lewat Form Input 1d_RTP CEE utk unsur yang &quot;Kurang Memadai&quot;).
            </td>
          </tr>
        </tbody>
      )}
      {unsurList.map((unsur, unsurIdx) => (
        <tbody key={unsur.unsur_kode}>
          <tr className="bg-muted/30">
            <td className="border border-black p-1 align-top font-bold"></td>
            <td className="border border-black p-1 align-top font-bold" colSpan={5}>
              {String.fromCharCode(65 + unsurIdx)}. {unsur.unsur_nama}
            </td>
          </tr>
          {unsur.rows.map((r, i) => (
            <tr key={i}>
              <td className="border border-black p-1 align-top">{i + 1}</td>
              <td className="border border-black p-1 align-top">{clean(r.kondisi_kurang_memadai)}</td>
              <td className="border border-black p-1 align-top">
                <RtpCategoryText text={clean(r.rencana_tindak_pengendalian)} />
              </td>
              <td className="border border-black p-1 align-top">{clean(r.penanggung_jawab)}</td>
              <td className="border border-black p-1 align-top">{clean(r.target)}</td>
              <td className="border border-black p-1 align-top">{clean(r.realisasi)}</td>
            </tr>
          ))}
        </tbody>
      ))}
    </table>
  );
}

export default function Cetak6({ opdOptions, opd, tahun, periode, unsurList, pemerintahKabkota, dataUmum }: PageProps) {
  return (
    <AppLayout>
      <Head title="6_RTP atas CEE" />
      <div className="space-y-4 p-4 print:hidden">
        <div>
          <h1 className="text-2xl font-semibold">6_RTP atas CEE</h1>
          <p className="text-sm text-muted-foreground">Pratinjau cetak ukuran A4 landscape.</p>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <OpdTahunPicker routeName="/cetak/risiko/6" opdOptions={opdOptions} opdId={opd?.id ?? null} tahun={tahun} />
          {opd && (
            <Button asChild>
              <a href={`/cetak/risiko/6/pdf?opd_id=${opd.id}&tahun=${tahun}`}>
                <FileDown className="mr-2 h-4 w-4" />
                Unduh PDF
              </a>
            </Button>
          )}
        </div>
      </div>

      {opd && (
        <div className="cee-print-sheet mx-auto max-w-[1500px] bg-white p-8 text-black print:m-0 print:max-w-none print:p-0 print:shadow-none">
          <p className="text-right text-xs italic">Form 6</p>
          <h2 className="mt-2 text-center text-sm font-bold uppercase">
            Penilaian atas Kegiatan Pengendalian yang Ada dan Masih Dibutuhkan / RTP atas Kelemahan Lingkungan
            Pengendalian (RTP atas CEE)
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

          <RtpCeeTable unsurList={unsurList} />

          <div className="mt-2 text-[9px] leading-tight text-muted-foreground">
            <p>Keterangan:</p>
            <p>Kolom a diisi dengan nomor urut.</p>
            <p>Kolom b diisi dengan kondisi lingkungan pengendalian yang kurang memadai.</p>
            <p>Kolom c diisi dengan perbaikan yang akan dilakukan.</p>
            <p>Kolom d diisi dengan pihak/unit penanggung jawab untuk menyelenggarakan kegiatan pengendalian.</p>
            <p>Kolom e diisi dengan target waktu penyelesaian RTP.</p>
            <p>Kolom f diisi dengan realisasi waktu penyelesaian RTP.</p>
          </div>

          {/* Multi-penandatangan: kolom tengah dari DataUmum.penandatangan[]
              (mis. Sekretaris, Kepala Bidang — diisi/disinkron via menu Data
              Umum ATAU Form 1c CEE), kolom PALING KANAN selalu Kepala OPD —
              lihat MultiPenandatangan utk detail tata letak. */}
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
