import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { OpdTahunPicker } from '@/components/cee/opd-tahun-picker';
import { FileDown, Pencil, Save } from 'lucide-react';
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

interface RingkasanEntry {
  jumlah: number;
  prioritas: number;
}

interface RingkasanRisiko {
  strategis_pemda: RingkasanEntry;
  strategis_opd: RingkasanEntry;
  operasional_opd: RingkasanEntry;
}

interface Narasi {
  latar_belakang: string;
  dasar_hukum: string;
  maksud_tujuan: string;
  ruang_lingkup: string;
  kondisi_lingkungan_pengendalian: string;
  rencana_perbaikan_lingkungan: string;
  rancangan_informasi_komunikasi: string;
  rancangan_pemantauan: string;
  penutup: string;
}

interface PageProps {
  opdOptions: OpdOption[];
  opd: { id: number; nama: string } | null;
  tahun: number;
  periode: string | null;
  pemerintahKabkota: string;
  dataUmum: DataUmum | null;
  ringkasanRisiko: RingkasanRisiko;
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

function RingkasanTable({ ringkasan }: { ringkasan: RingkasanRisiko }) {
  const rows: { label: string; entry: RingkasanEntry }[] = [
    { label: 'Risiko Strategis Pemerintah Daerah', entry: ringkasan.strategis_pemda },
    { label: 'Risiko Strategis (Entitas) OPD', entry: ringkasan.strategis_opd },
    { label: 'Risiko Operasional OPD', entry: ringkasan.operasional_opd },
  ];

  return (
    <table className="mt-2 w-full table-fixed border-collapse border border-black text-[10px]">
      <colgroup>
        <col className="w-[8%]" />
        <col className="w-[52%]" />
        <col className="w-[20%]" />
        <col className="w-[20%]" />
      </colgroup>
      <thead>
        <tr className="bg-muted/40">
          <th className="border border-black p-1 font-semibold">No</th>
          <th className="border border-black p-1 font-semibold">Tingkat Risiko</th>
          <th className="border border-black p-1 font-semibold">Jumlah Risiko Teridentifikasi</th>
          <th className="border border-black p-1 font-semibold">Jumlah Risiko Prioritas</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            <td className="border border-black p-1 align-top">{i + 1}</td>
            <td className="border border-black p-1 align-top">{r.label}</td>
            <td className="border border-black p-1 text-center align-top">{r.entry.jumlah}</td>
            <td className="border border-black p-1 text-center align-top">{r.entry.prioritas}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function Cetak1({
  opdOptions,
  opd,
  tahun,
  periode,
  pemerintahKabkota,
  dataUmum,
  ringkasanRisiko,
  canEdit,
  narasi,
}: PageProps) {
  const [editing, setEditing] = useState(false);
  const form = useForm({
    opd_id: opd?.id ?? '',
    tahun,
    ...narasi,
  });

  const submit = () => {
    form.post('/cetak/laporan/1/narasi', {
      preserveScroll: true,
      onSuccess: () => setEditing(false),
    });
  };

  const pdfHref = `/cetak/laporan/1/pdf?${new URLSearchParams({
    opd_id: opd?.id ? String(opd.id) : '',
    tahun: String(tahun),
  })}`;

  return (
    <AppLayout>
      <Head title="11_Laporan Pelaksanaan Penilaian Risiko" />
      <div className="space-y-4 p-4 print:hidden">
        <div>
          <h1 className="text-2xl font-semibold">11_Laporan Pelaksanaan Penilaian Risiko</h1>
          <p className="text-sm text-muted-foreground">Pratinjau cetak ukuran A4 portrait — Tahun {tahun}.</p>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <OpdTahunPicker routeName="/cetak/laporan/1" opdOptions={opdOptions} opdId={opd?.id ?? null} tahun={tahun} />
          <div className="flex gap-2">
            {canEdit && (
              <Button
                variant={editing ? 'secondary' : 'outline'}
                onClick={() => (editing ? submit() : setEditing(true))}
                disabled={form.processing}
              >
                {editing ? <Save className="mr-2 h-4 w-4" /> : <Pencil className="mr-2 h-4 w-4" />}
                {editing ? 'Simpan Narasi' : 'Edit Narasi'}
              </Button>
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
        <p className="text-right text-xs italic">Form 11</p>
        <h2 className="mt-2 text-center text-sm font-bold uppercase">Laporan Pelaksanaan Penilaian Risiko</h2>
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
              <td className="py-0.5">OPD / SKPK</td>
              <td className="py-0.5">: {opd?.nama ?? 'Kompilasi Seluruh OPD (Pemda)'}</td>
            </tr>
          </tbody>
        </table>

        <h3 className="mt-4 text-xs font-bold uppercase">I. Pendahuluan</h3>
        {NARASI_FIELDS.map(({ key, label }) => (
          <NarasiSection key={key} label={label} value={form.data[key]} editing={editing} onChange={(v) => form.setData(key, v)} />
        ))}

        <h3 className="mt-4 text-xs font-bold uppercase">II. Perbaikan Lingkungan Pengendalian yang Diharapkan</h3>
        <NarasiSection
          label="A. Kondisi Lingkungan Pengendalian Saat Ini"
          value={form.data.kondisi_lingkungan_pengendalian}
          editing={editing}
          onChange={(v) => form.setData('kondisi_lingkungan_pengendalian', v)}
        />
        <NarasiSection
          label="B. Rencana Perbaikan Lingkungan Pengendalian"
          value={form.data.rencana_perbaikan_lingkungan}
          editing={editing}
          onChange={(v) => form.setData('rencana_perbaikan_lingkungan', v)}
        />

        <h3 className="mt-4 text-xs font-bold uppercase">III. Penilaian Risiko dan Rencana Tindak Pengendalian</h3>
        <p className="mt-1 text-xs">Ringkasan hasil identifikasi dan analisis risiko (rincian lengkap lihat Form Cetak 3a/3b/3c dan Form 4/5):</p>
        <RingkasanTable ringkasan={ringkasanRisiko} />

        <h3 className="mt-4 text-xs font-bold uppercase">IV. Rancangan Informasi dan Komunikasi</h3>
        <NarasiSection label="" value={form.data.rancangan_informasi_komunikasi} editing={editing} onChange={(v) => form.setData('rancangan_informasi_komunikasi', v)} />

        <h3 className="mt-4 text-xs font-bold uppercase">V. Rancangan Pemantauan</h3>
        <NarasiSection label="" value={form.data.rancangan_pemantauan} editing={editing} onChange={(v) => form.setData('rancangan_pemantauan', v)} />

        <h3 className="mt-4 text-xs font-bold uppercase">VI. Penutup</h3>
        <NarasiSection label="" value={form.data.penutup} editing={editing} onChange={(v) => form.setData('penutup', v)} />

        {opd && (
          <>
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
          </>
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
