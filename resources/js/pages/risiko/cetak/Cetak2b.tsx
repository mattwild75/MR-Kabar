import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { OpdTahunPicker } from '@/components/cee/opd-tahun-picker';
import { FileDown } from 'lucide-react';
import { TtdEditor } from '@/components/cee/ttd-editor';

interface IndikatorRow {
  ik: string;
  baseline: string | null;
  target: string | null;
  satuan: string | null;
  opd: string | null;
}

interface SasaranNode {
  nomor: string;
  sasaran: string;
  indikator_list: IndikatorRow[];
  bold: boolean;
}

interface TujuanNode {
  nomor: string;
  tujuan: string;
  indikator_list: IndikatorRow[];
  sasaran_list: SasaranNode[];
  bold: boolean;
}

interface SasaranFlat extends SasaranNode {
  tujuan_nomor: string;
  tujuan: string;
}

interface ProgramItem {
  program: string;
  indikator_list: IndikatorRow[];
}

interface Konteks {
  tujuan_list: TujuanNode[];
  sasaran_flat: SasaranFlat[];
  program_list: ProgramItem[];
}

interface DataUmum {
  id: number;
  nama_kepala_dinas?: string;
  jabatan_kepala_dinas?: string;
  nip_kepala_dinas?: string;
  nama_pic?: string;
  tempat_pembuatan?: string;
  tanggal_pembuatan?: string;
  tanggal_pembuatan_raw?: string;
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

function clean(v?: string | null): string {
  if (!v || v === 'Tidak Ada Data') return '-';
  return v;
}

// Baris "1.1  Teks panjang..." dgn nomor di kolom kiri lebar tetap dan teks
// (termasuk baris lanjutan saat wrap) rata kiri sejajar di kolom kanan —
// sama pola dgn Cetak2a.tsx.
function NumberedItem({ nomor, bold, width = 'w-10', children }: { nomor: string | number; bold?: boolean; width?: string; children: React.ReactNode }) {
  return (
    <div className={`flex ${bold ? 'font-bold' : ''}`}>
      <span className={`shrink-0 ${width}`}>{nomor}</span>
      <span className="flex-1">{children}</span>
    </div>
  );
}

function IndikatorTable({ rows }: { rows: IndikatorRow[] }) {
  if (rows.length === 0) return <span className="text-muted-foreground">-</span>;
  return (
    // table-fixed + lebar kolom persentase tetap — lebar kolom sama di
    // semua tabel indikator, tidak auto-size per tabel (lihat Cetak2a.tsx
    // utk penjelasan lengkap).
    <table className="mt-1 w-full table-fixed border-collapse border border-black text-[11px]">
      <colgroup>
        <col className="w-[40%]" />
        <col className="w-[18%]" />
        <col className="w-[18%]" />
        <col className="w-[24%]" />
      </colgroup>
      <thead>
        <tr className="text-left">
          <th className="border border-black py-1 px-2 font-semibold">Indikator</th>
          <th className="border border-black py-1 px-2 font-semibold">Baseline</th>
          <th className="border border-black py-1 px-2 font-semibold">Target</th>
          <th className="border border-black py-1 px-2 font-semibold">OPD</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className={i > 0 ? 'border-t border-dotted border-black/50' : ''}>
            <td className="border-x border-black py-1 px-2 align-top">{clean(r.ik)}</td>
            <td className="border-x border-black py-1 px-2 align-top">
              {clean(r.baseline)} {clean(r.satuan) !== '-' ? r.satuan : ''}
            </td>
            <td className="border-x border-black py-1 px-2 align-top">
              {clean(r.target)} {clean(r.satuan) !== '-' ? r.satuan : ''}
            </td>
            <td className="border-x border-black py-1 px-2 align-top">{clean(r.opd)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
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
      <Head title="2b_Konteks Risiko Strategis OPD" />
      <div className="space-y-4 p-4 print:hidden">
        <div>
          <h1 className="text-2xl font-semibold">2b_Konteks Risiko Strategis OPD</h1>
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
          <p className="text-right text-xs italic">Form 2b</p>
          <h2 className="mt-2 text-center text-sm font-bold uppercase">Penetapan Konteks Risiko Strategis OPD</h2>

          {/* 1-5: Nama Pemda, Periode, Tahun Penilaian, Urusan, OPD (info polos) */}
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

          {/* 1. Sumber Data */}
          <table className="mt-3 w-full border-collapse border border-black text-xs">
            <tbody>
              <Baris label="Sumber Data" highlight>
                {clean(sumberData)}
              </Baris>
            </tbody>
          </table>

          {/* 2. Tujuan Strategis Renstra — bernomor, nested IndikatorTable */}
          <table className="mt-3 w-full border-collapse border border-black text-xs">
            <tbody>
              <tr>
                <td className="w-56 border border-black p-1.5 align-top font-semibold">Tujuan Strategis Renstra</td>
                <td className="w-4 border border-black p-1.5 text-center align-top">:</td>
                <td className="border border-black p-1.5 align-top">
                  {konteks.tujuan_list.length === 0 ? (
                    '-'
                  ) : (
                    konteks.tujuan_list.map((t) => (
                      <NumberedItem key={t.nomor} nomor={t.nomor} bold={t.bold}>
                        {t.tujuan}
                        {t.indikator_list.length > 0 && (
                          <div className={t.bold ? '' : 'font-normal'}>
                            <IndikatorTable rows={t.indikator_list} />
                          </div>
                        )}
                      </NumberedItem>
                    ))
                  )}
                  <p className="mt-1 text-[10px] italic text-muted-foreground">
                    *Ket. yang dicetak Tebal : Tujuan yang dipilih sebagai Penetapan Konteks Risiko Strategis OPD
                  </p>
                </td>
              </tr>
            </tbody>
          </table>

          {/* 3. Sasaran Strategis Renstra — bernomor, nested IndikatorTable */}
          <table className="mt-3 w-full border-collapse border border-black text-xs">
            <tbody>
              <tr>
                <td className="w-56 border border-black p-1.5 align-top font-semibold">Sasaran Strategis Renstra</td>
                <td className="w-4 border border-black p-1.5 text-center align-top">:</td>
                <td className="border border-black p-1.5 align-top">
                  {konteks.sasaran_flat.length === 0 ? (
                    '-'
                  ) : (
                    konteks.sasaran_flat.map((s) => (
                      <NumberedItem key={s.nomor} nomor={s.nomor} bold={s.bold} width="w-14">
                        {s.sasaran}
                        {s.indikator_list.length > 0 && (
                          <div className={s.bold ? '' : 'font-normal'}>
                            <IndikatorTable rows={s.indikator_list} />
                          </div>
                        )}
                      </NumberedItem>
                    ))
                  )}
                  <p className="mt-1 text-[10px] italic text-muted-foreground">
                    *Ket. yang dicetak Tebal : IK dipilih sebagai IKU dan Sasaran yang dipilih sebagai Penetapan Konteks Risiko Strategis OPD
                  </p>
                </td>
              </tr>
            </tbody>
          </table>

          {/* 4. Program */}
          <table className="mt-3 w-full border-collapse border border-black text-xs">
            <tbody>
              <Baris label="Program">
                {konteks.program_list.length === 0 ? (
                  '-'
                ) : (
                  konteks.program_list.map((p, i) => (
                    <div key={i}>
                      {p.program}
                      {p.indikator_list.length > 0 && (
                        <div className="pl-4 font-normal">
                          <IndikatorTable rows={p.indikator_list} />
                        </div>
                      )}
                    </div>
                  ))
                )}
              </Baris>
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

          {dataUmum && (
            <div className="mt-4 flex justify-end">
              <div className="w-80">
                <TtdEditor
                  dataUmumId={dataUmum.id}
                  tempatPembuatan={dataUmum.tempat_pembuatan ?? ''}
                  tanggalPembuatan={dataUmum.tanggal_pembuatan_raw ?? ''}
                  jabatan={dataUmum.jabatan_kepala_dinas ?? ''}
                  jabatanField="jabatan_kepala_dinas"
                  nama={dataUmum.nama_kepala_dinas ?? ''}
                  namaField="nama_kepala_dinas"
                  nip={dataUmum.nip_kepala_dinas ?? ''}
                />
              </div>
            </div>
          )}
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
