import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { OpdTahunTriwulanPicker } from '@/components/cee/opd-tahun-triwulan-picker';
import { FileDown, Pencil, Save, CheckCircle2, CircleDashed, Circle } from 'lucide-react';
import { useState } from 'react';
import { MultiPenandatangan } from '@/components/cee/multi-penandatangan';
import { MultiPenandatanganEditor } from '@/components/cee/multi-penandatangan-editor';

interface Signatory {
  jabatan: string;
  nama: string;
  nip: string;
}

interface DataUmum {
  id: number;
  nama_kepala_daerah?: string;
  jabatan_kepala_daerah?: string;
  tempat_pembuatan?: string;
  tanggal_pembuatan?: string;
  tanggal_pembuatan_raw?: string;
  penandatangan?: Signatory[];
}

interface RekapItem {
  opd_nama: string;
  status: 'lengkap' | 'sebagian' | 'belum';
}

interface Narasi {
  latar_belakang: string;
  dasar_hukum: string;
  maksud_tujuan: string;
  ruang_lingkup: string;
  rencana_kegiatan: string;
  realisasi_kegiatan: string;
  hambatan_pelaksanaan: string;
  rekomendasi_feedback: string;
  penutup: string;
}

interface PageProps {
  tahun: number;
  triwulan: string;
  periode: string | null;
  pemerintahKabkota: string;
  dataUmum: DataUmum | null;
  rekapKepatuhan: RekapItem[];
  canEdit: boolean;
  narasi: Narasi;
}

const NARASI_FIELDS: { key: keyof Narasi; label: string }[] = [
  { key: 'latar_belakang', label: 'A. Latar Belakang' },
  { key: 'dasar_hukum', label: 'B. Dasar Hukum' },
  { key: 'maksud_tujuan', label: 'C. Maksud dan Tujuan' },
  { key: 'ruang_lingkup', label: 'D. Ruang Lingkup' },
];

function NarasiSection({
  label,
  value,
  editing,
  onChange,
}: {
  label: string;
  value: string;
  editing: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <div className="mt-3">
      {label && <p className="text-xs font-semibold">{label}</p>}
      {editing ? (
        <Textarea className="mt-1 text-xs print:hidden" rows={3} value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <p className="mt-1 text-xs whitespace-pre-line">{value}</p>
      )}
    </div>
  );
}

function statusBadge(status: RekapItem['status']) {
  if (status === 'lengkap') {
    return (
      <Badge className="gap-1 bg-green-600 hover:bg-green-600">
        <CheckCircle2 className="h-3 w-3" />
        Lengkap
      </Badge>
    );
  }
  if (status === 'sebagian') {
    return (
      <Badge className="gap-1 bg-amber-500 hover:bg-amber-500">
        <CircleDashed className="h-3 w-3" />
        Sebagian
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="gap-1 text-muted-foreground">
      <Circle className="h-3 w-3" />
      Belum Lapor
    </Badge>
  );
}

function RekapTable({ rows }: { rows: RekapItem[] }) {
  return (
    <table className="mt-2 w-full table-fixed border-collapse border border-black text-[10px]">
      <colgroup>
        <col className="w-[8%]" />
        <col className="w-[62%]" />
        <col className="w-[30%]" />
      </colgroup>
      <thead>
        <tr className="bg-muted/40">
          <th className="border border-black p-1 font-semibold">No</th>
          <th className="border border-black p-1 font-semibold">OPD</th>
          <th className="border border-black p-1 font-semibold">Status Pelaporan</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            <td className="border border-black p-1 align-top">{i + 1}</td>
            <td className="border border-black p-1 align-top">{r.opd_nama}</td>
            <td className="border border-black p-1 align-top">
              <span className="print:hidden">{statusBadge(r.status)}</span>
              <span className="hidden print:inline">
                {r.status === 'lengkap' ? 'Lengkap' : r.status === 'sebagian' ? 'Sebagian' : 'Belum Lapor'}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function Cetak3({ tahun, triwulan, periode, pemerintahKabkota, dataUmum, rekapKepatuhan, canEdit, narasi }: PageProps) {
  const [editing, setEditing] = useState(false);
  const form = useForm({
    tahun,
    triwulan,
    ...narasi,
  });

  const submit = () => {
    form.post('/cetak/laporan/3/narasi', {
      preserveScroll: true,
      onSuccess: () => setEditing(false),
    });
  };

  const pdfHref = `/cetak/laporan/3/pdf?${new URLSearchParams({ tahun: String(tahun), triwulan })}`;

  return (
    <AppLayout>
      <Head title="13_Laporan Pemantauan Unit Kepatuhan" />
      <div className="space-y-4 p-4 print:hidden">
        <div>
          <h1 className="text-2xl font-semibold">13_Laporan Pemantauan Unit Kepatuhan</h1>
          <p className="text-sm text-muted-foreground">
            Pratinjau cetak ukuran A4 portrait — Triwulan {triwulan} Tahun {tahun}. Level Pemerintah Daerah (kompilasi lintas-OPD).
          </p>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <OpdTahunTriwulanPicker routeName="/cetak/laporan/3" tahun={tahun} triwulan={triwulan} />
          <div className="flex gap-2">
            {canEdit ? (
              <Button
                variant={editing ? 'secondary' : 'outline'}
                onClick={() => (editing ? submit() : setEditing(true))}
                disabled={form.processing}
              >
                {editing ? <Save className="mr-2 h-4 w-4" /> : <Pencil className="mr-2 h-4 w-4" />}
                {editing ? 'Simpan Narasi' : 'Edit Narasi'}
              </Button>
            ) : (
              <p className="self-center text-xs text-muted-foreground">Hanya Admin/Super Admin yang dapat mengedit laporan ini.</p>
            )}
            <Button asChild>
              <a href={pdfHref}>
                <FileDown className="mr-2 h-4 w-4" />
                Unduh PDF
              </a>
            </Button>
          </div>
        </div>
      </div>

      <div className="cee-print-sheet mx-auto max-w-[1500px] bg-white p-8 text-black print:m-0 print:max-w-none print:p-0 print:shadow-none">
        <p className="text-right text-xs italic">Form 13</p>
        <h2 className="mt-2 text-center text-sm font-bold uppercase">Laporan Triwulan {triwulan} Unit Kepatuhan — Pemantauan Pengelolaan Risiko</h2>
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
              <td className="py-0.5">Triwulan</td>
              <td className="py-0.5">: Triwulan {triwulan}</td>
            </tr>
          </tbody>
        </table>

        <h3 className="mt-4 text-xs font-bold uppercase">Pendahuluan</h3>
        {NARASI_FIELDS.map(({ key, label }) => (
          <NarasiSection key={key} label={label} value={form.data[key]} editing={editing && canEdit} onChange={(v) => form.setData(key, v)} />
        ))}

        <h3 className="mt-4 text-xs font-bold uppercase">A. Rencana dan Realisasi Kegiatan</h3>
        <NarasiSection label="Rencana Kegiatan" value={form.data.rencana_kegiatan} editing={editing && canEdit} onChange={(v) => form.setData('rencana_kegiatan', v)} />
        <NarasiSection label="Realisasi Kegiatan" value={form.data.realisasi_kegiatan} editing={editing && canEdit} onChange={(v) => form.setData('realisasi_kegiatan', v)} />

        <h3 className="mt-4 text-xs font-bold uppercase">B. Hambatan Pelaksanaan Kegiatan</h3>
        <NarasiSection label="" value={form.data.hambatan_pelaksanaan} editing={editing && canEdit} onChange={(v) => form.setData('hambatan_pelaksanaan', v)} />

        <h3 className="mt-4 text-xs font-bold uppercase">C. Monitoring terhadap Pengelolaan Risiko dan RTP oleh UPR</h3>
        <p className="mt-1 text-xs">Rekapitulasi status pelaporan seluruh OPD pada Triwulan {triwulan}:</p>
        <RekapTable rows={rekapKepatuhan} />

        <h3 className="mt-4 text-xs font-bold uppercase">D. Rekomendasi / Feedback bagi UPR</h3>
        <NarasiSection label="" value={form.data.rekomendasi_feedback} editing={editing && canEdit} onChange={(v) => form.setData('rekomendasi_feedback', v)} />

        <h3 className="mt-4 text-xs font-bold uppercase">Penutup</h3>
        <NarasiSection label="" value={form.data.penutup} editing={editing && canEdit} onChange={(v) => form.setData('penutup', v)} />

        {/* Laporan ini SELALU level Pemda (tidak terikat 1 OPD tertentu) —
            kolom "tengah" (Sekretaris/Kepala Bidang dari DataUmum.penandatangan[]
            milik OPD manapun yg baris DataUmum-nya kebetulan diambil
            forOpdAndTahun(null,...)) TIDAK relevan di sini, cukup Bupati
            selaku Kepala Daerah sendirian. */}
        <MultiPenandatangan
          penandatangan={[]}
          kepalaNama={dataUmum?.nama_kepala_daerah ?? null}
          kepalaJabatan={dataUmum?.jabatan_kepala_daerah ?? 'Kepala Daerah'}
          kepalaNip={null}
          tempatPembuatan={dataUmum?.tempat_pembuatan ?? null}
          tanggalPembuatan={dataUmum?.tanggal_pembuatan ?? null}
        />

        {canEdit && dataUmum && (
          <div className="mt-4 flex justify-center">
            <div className="w-full max-w-2xl">
              <MultiPenandatanganEditor
                key={dataUmum.id}
                dataUmumId={dataUmum.id}
                penandatangan={dataUmum.penandatangan ?? []}
                tempatPembuatan={dataUmum.tempat_pembuatan ?? ''}
                tanggalPembuatan={dataUmum.tanggal_pembuatan_raw ?? ''}
                kepalaJabatan={dataUmum.jabatan_kepala_daerah ?? 'Kepala Daerah'}
                kepalaJabatanField="jabatan_kepala_daerah"
                kepalaNama={dataUmum.nama_kepala_daerah ?? ''}
                kepalaNamaField="nama_kepala_daerah"
              />
            </div>
          </div>
        )}
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
