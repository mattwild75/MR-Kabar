import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileDown } from 'lucide-react';

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
  program: string[];
  bold: boolean;
}

interface TujuanNode {
  nomor: string;
  tujuan: string;
  indikator_list: IndikatorRow[];
  sasaran_list: SasaranNode[];
  bold: boolean;
}

interface MisiNode {
  nomor: number;
  misi: string;
  tujuan_list: TujuanNode[];
  bold: boolean;
}

interface SasaranFlat extends SasaranNode {
  tujuan_nomor: string;
  tujuan: string;
}

interface ProgramItem {
  program: string;
  indikator_list: IndikatorRow[];
  bold: boolean;
}

interface OpdUrusan {
  opd: string;
  urusan: string;
}

interface PicEntry {
  opd: string;
  nama: string;
}

interface Konteks {
  visi: string | null;
  misi_list: MisiNode[];
  sasaran_flat: SasaranFlat[];
  opd_terkait: string[];
  program_list: ProgramItem[];
  dinas_terkait: string[];
  urusan_list: OpdUrusan[];
  pic_list: PicEntry[];
}

interface DataUmum {
  nama_kepala_daerah?: string;
  jabatan_kepala_daerah?: string;
  tempat_pembuatan?: string;
  tanggal_pembuatan?: string;
}

interface PageProps {
  tahun: number;
  periode: string | null;
  konteks: Konteks | null;
  pemerintahKabkota: string;
  sumberData: string;
  dataUmum: DataUmum | null;
}

// Baris label:value ala Form_I_a Excel — label kolom kiri tebal, ":" tengah, isi kanan.
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
// pola numbering standar, bukan nomor+teks jadi satu blok inline yg bikin
// baris kedua ikut menjorok ke bawah nomor.
function NumberedItem({ nomor, bold, width = 'w-10', children }: { nomor: string | number; bold?: boolean; width?: string; children: React.ReactNode }) {
  return (
    <div className={`flex ${bold ? 'font-bold' : ''}`}>
      <span className={`shrink-0 ${width}`}>{nomor}</span>
      <span className="flex-1">{children}</span>
    </div>
  );
}

// Tabel Indikator | Baseline | Target | OPD — satu baris per indikator,
// masing2 kolom sejajar (menggantikan teks inline yg dulu menggabung semua
// baseline/target jadi satu string panjang tak terpisah per indikator).
function IndikatorTable({ rows }: { rows: IndikatorRow[] }) {
  if (rows.length === 0) return <span className="text-muted-foreground">-</span>;
  return (
    <table className="mt-1 w-full border-collapse text-[11px]">
      <thead>
        <tr className="border-b border-black/30 text-left">
          <th className="py-0.5 pr-2 font-semibold">Indikator</th>
          <th className="py-0.5 pr-2 font-semibold">Baseline</th>
          <th className="py-0.5 pr-2 font-semibold">Target</th>
          <th className="py-0.5 font-semibold">OPD</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-b border-black/10 last:border-b-0">
            <td className="py-0.5 pr-2 align-top">{clean(r.ik)}</td>
            <td className="py-0.5 pr-2 align-top">
              {clean(r.baseline)} {clean(r.satuan) !== '-' ? r.satuan : ''}
            </td>
            <td className="py-0.5 pr-2 align-top">
              {clean(r.target)} {clean(r.satuan) !== '-' ? r.satuan : ''}
            </td>
            <td className="py-0.5 align-top">{clean(r.opd)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function Cetak2a({ tahun, periode, konteks, pemerintahKabkota, sumberData, dataUmum }: PageProps) {
  const navigate = (nextTahun: number) => {
    router.get('/cetak/risiko/2a', { tahun: nextTahun }, { preserveState: true, preserveScroll: true, replace: true });
  };

  const boldSasaran = konteks?.sasaran_flat.filter((s) => s.bold) ?? [];
  const boldProgram = konteks?.program_list.filter((p) => p.bold) ?? [];

  return (
    <AppLayout>
      <Head title="Form 1a — Penetapan Konteks Risiko Strategis Pemerintah Daerah" />
      <div className="space-y-4 p-4 print:hidden">
        <div>
          <h1 className="text-2xl font-semibold">Form 1a — Penetapan Konteks Risiko Strategis Pemerintah Daerah</h1>
          <p className="text-sm text-muted-foreground">Pratinjau cetak ukuran A4.</p>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="w-32 space-y-1">
            <Label>Tahun Penilaian</Label>
            <Input type="number" value={tahun} onChange={(e) => navigate(Number(e.target.value) || tahun)} />
          </div>
          <Button asChild>
            <a href={`/cetak/risiko/2a/pdf?tahun=${tahun}`}>
              <FileDown className="mr-2 h-4 w-4" />
              Unduh PDF
            </a>
          </Button>
        </div>
      </div>

      {!konteks ? (
        <div className="p-4 print:hidden text-sm text-muted-foreground">
          Belum ada data Penetapan Konteks Risiko Strategis Pemda (isi lewat Form Input Risiko Strategis Pemda terlebih dahulu).
        </div>
      ) : (
        <div className="cee-print-sheet mx-auto max-w-4xl bg-white p-8 text-black print:m-0 print:max-w-none print:p-0 print:shadow-none">
          <p className="text-right text-xs italic">Form_I_a</p>
          <h2 className="mt-2 text-center text-sm font-bold uppercase">Penetapan Konteks Risiko Strategis Pemerintah Daerah</h2>

          {/* 1-4: Nama Pemda, Tahun Penilaian, Periode, Sumber Data (info polos) */}
          <table className="mt-4 w-full border-collapse text-xs">
            <tbody>
              <tr>
                <td className="w-44 py-0.5">Nama Pemda</td>
                <td className="py-0.5">: {pemerintahKabkota}</td>
              </tr>
              <tr>
                <td className="py-0.5">Tahun Penilaian</td>
                <td className="py-0.5">: {tahun}</td>
              </tr>
              <tr>
                <td className="py-0.5">Periode yang Dinilai</td>
                <td className="py-0.5">: {periode ?? '-'}</td>
              </tr>
              <tr>
                <td className="py-0.5">Sumber Data</td>
                <td className="py-0.5">: {sumberData}</td>
              </tr>
            </tbody>
          </table>

          {/* 1. Visi */}
          <table className="mt-3 w-full border-collapse border border-black text-xs">
            <tbody>
              <Baris label="Visi">{konteks.visi ?? '-'}</Baris>
            </tbody>
          </table>

          {/* 2. Misi — nested table Misi > Tujuan > Sasaran, bold = dipilih sbg Penetapan Konteks */}
          <table className="mt-3 w-full border-collapse border border-black text-xs">
            <tbody>
              <tr>
                <td className="w-56 border border-black p-1.5 align-top font-semibold">Misi Strategis RPJMD/RPD</td>
                <td className="w-4 border border-black p-1.5 text-center align-top">:</td>
                <td className="border border-black p-1.5 align-top">
                  {konteks.misi_list.map((m) => (
                    <NumberedItem key={m.nomor} nomor={`Misi ${m.nomor} :`} bold={m.bold} width="w-16">
                      {m.misi.replace(/^Misi\s*\d+\s*:\s*/i, '')}
                    </NumberedItem>
                  ))}
                  <p className="mt-1 text-[10px] italic text-muted-foreground">
                    *Ket. yang dicetak Tebal : Misi yang dipilih sebagai Penetapan Konteks Risiko Strategis Pemda
                  </p>
                </td>
              </tr>
            </tbody>
          </table>

          {/* 3. Tujuan Strategis RPJMD — semua tujuan berlabel nomor, bold = dipilih */}
          <table className="mt-3 w-full border-collapse border border-black text-xs">
            <tbody>
              <tr>
                <td className="w-56 border border-black p-1.5 align-top font-semibold">Tujuan Strategis RPJMD/RPD</td>
                <td className="w-4 border border-black p-1.5 text-center align-top">:</td>
                <td className="border border-black p-1.5 align-top">
                  {konteks.misi_list.map((m) =>
                    m.tujuan_list.map((t) => (
                      <NumberedItem key={t.nomor} nomor={t.nomor} bold={t.bold}>
                        {t.tujuan}
                        {t.indikator_list.length > 0 && (
                          <div className="font-normal">
                            <IndikatorTable rows={t.indikator_list} />
                          </div>
                        )}
                      </NumberedItem>
                    )),
                  )}
                  <p className="mt-1 text-[10px] italic text-muted-foreground">
                    *Ket. yang dicetak Tebal : Tujuan yang dipilih sebagai Penetapan Konteks Risiko Strategis Pemda
                  </p>
                </td>
              </tr>
            </tbody>
          </table>

          {/* 4. Sasaran RPJMD — semua sasaran berlabel nomor, bold = dipilih (+ IKU ikut bold) */}
          <table className="mt-3 w-full border-collapse border border-black text-xs">
            <tbody>
              <tr>
                <td className="w-56 border border-black p-1.5 align-top font-semibold">Sasaran RPJMD/RPD</td>
                <td className="w-4 border border-black p-1.5 text-center align-top">:</td>
                <td className="border border-black p-1.5 align-top">
                  {konteks.sasaran_flat.map((s) => (
                    <NumberedItem key={s.nomor} nomor={s.nomor} bold={s.bold} width="w-14">
                      {s.sasaran}
                      {s.indikator_list.length > 0 && (
                        <div className={s.bold ? '' : 'font-normal'}>
                          <IndikatorTable rows={s.indikator_list} />
                        </div>
                      )}
                    </NumberedItem>
                  ))}
                  <p className="mt-1 text-[10px] italic text-muted-foreground">
                    *Ket. yang dicetak Tebal : IKU Sasaran RPJMD yang dipilih sebagai Penetapan Konteks Risiko Strategis Pemda
                  </p>
                </td>
              </tr>
            </tbody>
          </table>

          {/* 5. Prioritas Pembangunan dan Program Unggulan — bold = di rantai hierarki Sasaran terpilih */}
          <table className="mt-3 w-full border-collapse border border-black text-xs">
            <tbody>
              <Baris label="Prioritas Pembangunan dan Program Unggulan">
                {konteks.program_list.map((p, i) => (
                  <div key={i} className={p.bold ? 'font-bold' : ''}>
                    {p.program}
                    {p.indikator_list.length > 0 && (
                      <div className="pl-4 font-normal">
                        <IndikatorTable rows={p.indikator_list} />
                      </div>
                    )}
                  </div>
                ))}
              </Baris>
            </tbody>
          </table>

          {/* 6. Urusan Pemerintahan Daerah — per OPD terkait, sesuai isian Data Umum masing2 */}
          <table className="mt-3 w-full border-collapse border border-black text-xs">
            <tbody>
              <Baris label="Urusan Pemerintahan Daerah">
                {konteks.urusan_list.length === 0 ? (
                  '-'
                ) : (
                  konteks.urusan_list.map((u, i) => (
                    <div key={i} className="font-bold">
                      {u.opd} : {u.urusan}
                    </div>
                  ))
                )}
              </Baris>
            </tbody>
          </table>

          {/* 7. Nama Dinas Terkait — OPD yg teregister risiko strategisnya */}
          <table className="mt-3 w-full border-collapse border border-black text-xs">
            <tbody>
              <Baris label="Nama Dinas Terkait">
                {konteks.dinas_terkait.length === 0 ? '-' : konteks.dinas_terkait.map((d, i) => <div key={i}>{d}</div>)}
              </Baris>
            </tbody>
          </table>

          {/* 8. Tujuan, Sasaran, IKU dan Program yang akan dilakukan penilaian risiko — gabungan yg dibold */}
          <table className="mt-3 w-full border-collapse border border-black text-xs">
            <tbody>
              <tr>
                <td className="w-56 border border-black p-1.5 align-top font-semibold">
                  Tujuan, Sasaran, IKU dan Program yang akan dilakukan Penilaian Risiko
                </td>
                <td className="w-4 border border-black p-1.5 text-center align-top">:</td>
                <td className="border border-black p-1.5 align-top space-y-2">
                  {konteks.misi_list
                    .filter((m) => m.bold)
                    .map((m) => (
                      <div key={m.nomor}>
                        <NumberedItem nomor={`Misi ${m.nomor} :`} bold width="w-16">
                          {m.misi.replace(/^Misi\s*\d+\s*:\s*/i, '')}
                        </NumberedItem>
                        {m.tujuan_list
                          .filter((t) => t.bold)
                          .map((t) => (
                            <div key={t.nomor} className="pl-4">
                              <NumberedItem nomor={`Tujuan ${t.nomor} :`} bold width="w-20">
                                {t.tujuan}
                              </NumberedItem>
                              {t.sasaran_list
                                .filter((s) => s.bold)
                                .map((s) => (
                                  <div key={s.nomor} className="pl-4">
                                    <NumberedItem nomor={`Sasaran ${s.nomor} :`} bold width="w-24">
                                      {s.sasaran}
                                    </NumberedItem>
                                    {s.indikator_list.length > 0 && (
                                      <div className="pl-4">
                                        <div>IKU :</div>
                                        <IndikatorTable rows={s.indikator_list} />
                                      </div>
                                    )}
                                  </div>
                                ))}
                            </div>
                          ))}
                      </div>
                    ))}
                  {boldProgram.length > 0 && (
                    <div>
                      <div className="font-bold">Program :</div>
                      {boldProgram.map((p, i) => (
                        <div key={i} className="pl-4">
                          {p.program}
                        </div>
                      ))}
                    </div>
                  )}
                  {boldSasaran.length === 0 && <span className="italic text-muted-foreground">Belum ada risiko strategis teregister.</span>}
                </td>
              </tr>
            </tbody>
          </table>

          {/* PIC per-OPD yg mengisi Risiko Strategis Pemda — bisa banyak baris */}
          {konteks.pic_list.length > 0 && (
            <div className="mt-2 text-xs italic">
              {konteks.pic_list.map((p, i) => (
                <p key={i}>
                  PIC_{p.opd} : {p.nama}
                </p>
              ))}
            </div>
          )}

          <div className="mt-8 flex justify-end text-xs">
            <div className="w-64 text-center">
              <p>
                {dataUmum?.tempat_pembuatan ?? ''}
                {dataUmum?.tempat_pembuatan && ', '}
                {dataUmum?.tanggal_pembuatan ?? ''}
              </p>
              <p className="mt-2 font-semibold uppercase">{dataUmum?.jabatan_kepala_daerah ?? 'Bupati'}</p>
              <div className="mt-16">
                <p className="font-semibold underline">{dataUmum?.nama_kepala_daerah ?? ''}</p>
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
