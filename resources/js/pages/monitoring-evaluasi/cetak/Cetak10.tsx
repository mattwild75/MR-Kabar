import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { OpdTahunPicker } from '@/components/cee/opd-tahun-picker';
import { FileDown } from 'lucide-react';
import { MultiPenandatangan } from '@/components/cee/multi-penandatangan';
import { MultiPenandatanganEditor } from '@/components/cee/multi-penandatangan-editor';
import PenyebabCategoryText from '@/components/ui/penyebab-category-text';

interface Row {
  uraian_risiko: string | null;
  tanggal_terjadi: string | null;
  sebab_saat_kejadian: string | null;
  dampak_saat_kejadian: string | null;
  keterangan_kejadian: string | null;
  rencana_rtp: string | null;
  realisasi_rtp: string | null;
  keterangan_rtp: string | null;
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
  if (!v) return 'Tidak Terjadi';
  return v;
}

/**
 * Tabel Pencatatan Kejadian Risiko (Risk Event) dan Pelaksanaan RTP —
 * Lampiran 5 Form 10 Perdep PPKD No.4/2019, kolom (a)-(k) — di sini
 * disederhanakan jadi 8 kolom tampilan krn "Kejadian Risiko" (kolom d-f
 * Perdep asli: Tanggal Terjadi/Sebab/Dampak) digabung 1 grup header, sama
 * pola dgn contoh resmi Perdep. Kolom (b) diproyeksi LIVE dari risiko
 * sumber (IRS Pemda/IRS PD/IRO PD).
 */
function Form10Table({ rows }: { rows: Row[] }) {
  return (
    <table className="mt-3 w-full table-fixed border-collapse border border-black text-[10px]">
      <colgroup>
        <col className="w-[3%]" />
        <col className="w-[20%]" />
        <col className="w-[9%]" />
        <col className="w-[13%]" />
        <col className="w-[13%]" />
        <col className="w-[10%]" />
        <col className="w-[9%]" />
        <col className="w-[9%]" />
        <col className="w-[14%]" />
      </colgroup>
      <thead>
        <tr className="bg-muted/40">
          <th rowSpan={2} className="border border-black p-1 align-middle font-semibold">
            No
            <div className="text-[9px] font-normal italic">(a)</div>
          </th>
          <th rowSpan={2} className="border border-black p-1 align-middle font-semibold">
            &quot;Risiko&quot; yang Teridentifikasi
            <div className="text-[9px] font-normal italic">(b)</div>
          </th>
          <th colSpan={3} className="border border-black p-1 text-center font-semibold">
            Kejadian Risiko
          </th>
          <th rowSpan={2} className="border border-black p-1 align-middle font-semibold">
            Keterangan
            <div className="text-[9px] font-normal italic">(f)</div>
          </th>
          <th rowSpan={2} className="border border-black p-1 align-middle font-semibold">
            Rencana Pelaksanaan RTP
            <div className="text-[9px] font-normal italic">(g)</div>
          </th>
          <th rowSpan={2} className="border border-black p-1 align-middle font-semibold">
            Realisasi Pelaksanaan RTP
            <div className="text-[9px] font-normal italic">(h)</div>
          </th>
          <th rowSpan={2} className="border border-black p-1 align-middle font-semibold">
            Keterangan
            <div className="text-[9px] font-normal italic">(i)</div>
          </th>
        </tr>
        <tr className="bg-muted/40">
          <th className="border border-black p-1 align-middle font-semibold">
            Tanggal Terjadi
            <div className="text-[9px] font-normal italic">(c)</div>
          </th>
          <th className="border border-black p-1 align-middle font-semibold">
            Sebab
            <div className="text-[9px] font-normal italic">(d)</div>
          </th>
          <th className="border border-black p-1 align-middle font-semibold">
            Dampak
            <div className="text-[9px] font-normal italic">(e)</div>
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && (
          <tr>
            <td colSpan={9} className="border border-black p-2 text-center text-muted-foreground">
              Belum ada risiko yang dicatat kejadiannya (isi lewat Form Input 10).
            </td>
          </tr>
        )}
        {rows.map((r, i) => (
          <tr key={i}>
            <td className="border border-black p-1 align-top">{i + 1}</td>
            <td className="border border-black p-1 align-top">{r.uraian_risiko ?? '-'}</td>
            <td className="border border-black p-1 align-top">{r.tanggal_terjadi ?? 'Tidak Terjadi'}</td>
            <td className="border border-black p-1 align-top">
              <PenyebabCategoryText text={clean(r.sebab_saat_kejadian)} />
            </td>
            <td className="border border-black p-1 align-top">{clean(r.dampak_saat_kejadian)}</td>
            <td className="border border-black p-1 align-top">{clean(r.keterangan_kejadian)}</td>
            <td className="border border-black p-1 align-top">{r.rencana_rtp ?? '-'}</td>
            <td className="border border-black p-1 align-top">{r.realisasi_rtp ?? '-'}</td>
            <td className="border border-black p-1 align-top">{r.keterangan_rtp ?? '-'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function Cetak10({ opdOptions, opd, tahun, periode, rows, pemerintahKabkota, dataUmum }: PageProps) {
  return (
    <AppLayout>
      <Head title="10_Pencatatan Kejadian Risiko" />
      <div className="space-y-4 p-4 print:hidden">
        <div>
          <h1 className="text-2xl font-semibold">10_Pencatatan Kejadian Risiko &amp; Pelaksanaan RTP</h1>
          <p className="text-sm text-muted-foreground">Pratinjau cetak ukuran A4 landscape.</p>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <OpdTahunPicker routeName="/cetak/monitoring-evaluasi/10" opdOptions={opdOptions} opdId={opd?.id ?? null} tahun={tahun} />
          {opd && (
            <Button asChild>
              <a href={`/cetak/monitoring-evaluasi/10/pdf?opd_id=${opd.id}&tahun=${tahun}`}>
                <FileDown className="mr-2 h-4 w-4" />
                Unduh PDF
              </a>
            </Button>
          )}
        </div>
      </div>

      {opd && (
        <div className="cee-print-sheet mx-auto max-w-[1500px] bg-white p-8 text-black print:m-0 print:max-w-none print:p-0 print:shadow-none">
          <p className="text-right text-xs italic">Form 10</p>
          <h2 className="mt-2 text-center text-sm font-bold uppercase">
            Pencatatan Kejadian Risiko (Risk Event) dan Pelaksanaan RTP
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

          <Form10Table rows={rows} />

          <div className="mt-2 text-[9px] leading-tight text-muted-foreground">
            <p>Keterangan:</p>
            <p>Kolom a diisi dengan nomor urut.</p>
            <p>Kolom b diisi dengan risiko yang teridentifikasi (dari Form Input IRS/IRO).</p>
            <p>Kolom c diisi dengan tanggal terjadinya risiko pada tahun berjalan — &quot;Tidak Terjadi&quot; bila risiko belum terjadi.</p>
            <p>Kolom d diisi dengan penyebab peristiwa risiko saat terjadi pada tahun berjalan, dikategorikan 7M+1E (Men/Machine/Method/Material/Money/Management/Measurement/Environment).</p>
            <p>Kolom e diisi dengan dampak peristiwa risiko saat terjadi pada tahun berjalan.</p>
            <p>Kolom f diisi dengan keterangan tambahan seputar kejadian risiko.</p>
            <p>Kolom g diisi dengan rencana waktu pelaksanaan RTP.</p>
            <p>Kolom h diisi dengan realisasi waktu pelaksanaan RTP.</p>
            <p>Kolom i diisi dengan keterangan tambahan seputar realisasi RTP.</p>
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
