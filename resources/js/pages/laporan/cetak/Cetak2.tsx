import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { OpdTahunTriwulanPicker } from '@/components/cee/opd-tahun-triwulan-picker';
import { FileDown, Pencil, Save } from 'lucide-react';
import { useState } from 'react';
import { MultiPenandatangan } from '@/components/cee/multi-penandatangan';
import { MultiPenandatanganEditor } from '@/components/cee/multi-penandatangan-editor';

interface MonitoringRow {
  opd_nama: string | null;
  kegiatan_pengendalian: string | null;
  rencana_komunikasi: string | null;
  realisasi_komunikasi: string | null;
  rencana_pemantauan: string | null;
  realisasi_pemantauan: string | null;
}

interface KejadianRow {
  opd_nama: string | null;
  uraian_risiko: string | null;
  tanggal_terjadi: string | null;
  realisasi_rtp: string | null;
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

interface Narasi {
  latar_belakang: string;
  dasar_hukum: string;
  maksud_tujuan: string;
  ruang_lingkup: string;
  rencana_kegiatan: string;
  realisasi_kegiatan: string;
  hambatan_pelaksanaan: string;
  monitoring_risiko_rtp: string;
  penutup: string;
}

interface PageProps {
  opdOptions: OpdOption[];
  opd: { id: number; nama: string } | null;
  tahun: number;
  triwulan: string;
  periode: string | null;
  pemerintahKabkota: string;
  dataUmum: DataUmum | null;
  monitoringRows: MonitoringRow[];
  kejadianRows: KejadianRow[];
  canEdit: boolean;
  narasi: Narasi;
}

function clean(v?: string | null): string {
  return v && v.trim() !== '' ? v : '-';
}

const NARASI_FIELDS: { key: keyof Narasi; label: string }[] = [
  { key: 'latar_belakang', label: 'A. Latar Belakang' },
  { key: 'dasar_hukum', label: 'B. Dasar Hukum' },
  { key: 'maksud_tujuan', label: 'C. Maksud dan Tujuan' },
  { key: 'ruang_lingkup', label: 'D. Ruang Lingkup' },
];

function RencanaRealisasiTable({ rows }: { rows: MonitoringRow[] }) {
  return (
    <table className="mt-2 w-full table-fixed border-collapse border border-black text-[10px]">
      <colgroup>
        <col className="w-[3%]" />
        <col className="w-[14%]" />
        <col className="w-[23%]" />
        <col className="w-[15%]" />
        <col className="w-[15%]" />
        <col className="w-[15%]" />
        <col className="w-[15%]" />
      </colgroup>
      <thead>
        <tr className="bg-muted/40">
          <th className="border border-black p-1 font-semibold">No</th>
          <th className="border border-black p-1 font-semibold">OPD</th>
          <th className="border border-black p-1 font-semibold">Kegiatan Pengendalian</th>
          <th className="border border-black p-1 font-semibold">Rencana Komunikasi</th>
          <th className="border border-black p-1 font-semibold">Realisasi Komunikasi</th>
          <th className="border border-black p-1 font-semibold">Rencana Pemantauan</th>
          <th className="border border-black p-1 font-semibold">Realisasi Pemantauan</th>
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && (
          <tr>
            <td colSpan={7} className="border border-black p-2 text-center text-muted-foreground">
              Belum ada Rencana/Realisasi Monitoring RTP pada triwulan ini (isi lewat Form Input 8-9).
            </td>
          </tr>
        )}
        {rows.map((r, i) => (
          <tr key={i}>
            <td className="border border-black p-1 align-top">{i + 1}</td>
            <td className="border border-black p-1 align-top">{clean(r.opd_nama)}</td>
            <td className="border border-black p-1 align-top">{clean(r.kegiatan_pengendalian)}</td>
            <td className="border border-black p-1 align-top">{clean(r.rencana_komunikasi)}</td>
            <td className="border border-black p-1 align-top">{clean(r.realisasi_komunikasi)}</td>
            <td className="border border-black p-1 align-top">{clean(r.rencana_pemantauan)}</td>
            <td className="border border-black p-1 align-top">{clean(r.realisasi_pemantauan)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function KejadianTable({ rows }: { rows: KejadianRow[] }) {
  return (
    <table className="mt-2 w-full table-fixed border-collapse border border-black text-[10px]">
      <colgroup>
        <col className="w-[3%]" />
        <col className="w-[15%]" />
        <col className="w-[37%]" />
        <col className="w-[15%]" />
        <col className="w-[30%]" />
      </colgroup>
      <thead>
        <tr className="bg-muted/40">
          <th className="border border-black p-1 font-semibold">No</th>
          <th className="border border-black p-1 font-semibold">OPD</th>
          <th className="border border-black p-1 font-semibold">Uraian Risiko</th>
          <th className="border border-black p-1 font-semibold">Tanggal Terjadi</th>
          <th className="border border-black p-1 font-semibold">Realisasi Pelaksanaan RTP</th>
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && (
          <tr>
            <td colSpan={5} className="border border-black p-2 text-center text-muted-foreground">
              Tidak ada kejadian risiko yang RTP-nya direncanakan pada triwulan ini (isi lewat Form Input 10).
            </td>
          </tr>
        )}
        {rows.map((r, i) => (
          <tr key={i}>
            <td className="border border-black p-1 align-top">{i + 1}</td>
            <td className="border border-black p-1 align-top">{clean(r.opd_nama)}</td>
            <td className="border border-black p-1 align-top">{clean(r.uraian_risiko)}</td>
            <td className="border border-black p-1 align-top">{clean(r.tanggal_terjadi)}</td>
            <td className="border border-black p-1 align-top">{clean(r.realisasi_rtp)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

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
      <p className="text-xs font-semibold">{label}</p>
      {editing ? (
        <Textarea
          className="mt-1 text-xs print:hidden"
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <p className="mt-1 text-xs whitespace-pre-line">{value}</p>
      )}
    </div>
  );
}

export default function Cetak2({
  opdOptions,
  opd,
  tahun,
  triwulan,
  periode,
  pemerintahKabkota,
  dataUmum,
  monitoringRows,
  kejadianRows,
  canEdit,
  narasi,
}: PageProps) {
  const [editing, setEditing] = useState(false);
  const form = useForm({
    opd_id: opd?.id ?? '',
    tahun,
    triwulan,
    ...narasi,
  });

  const submit = () => {
    form.post('/cetak/laporan/2/narasi', {
      preserveScroll: true,
      onSuccess: () => setEditing(false),
    });
  };

  const pdfHref = `/cetak/laporan/2/pdf?${new URLSearchParams({
    opd_id: opd?.id ? String(opd.id) : '',
    tahun: String(tahun),
    triwulan,
  })}`;

  return (
    <AppLayout>
      <Head title="12_Laporan Berkala Pengelolaan Risiko" />
      <div className="space-y-4 p-4 print:hidden">
        <div>
          <h1 className="text-2xl font-semibold">12_Laporan Berkala Pengelolaan Risiko</h1>
          <p className="text-sm text-muted-foreground">Pratinjau cetak ukuran A4 portrait — Triwulan {triwulan} Tahun {tahun}.</p>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <OpdTahunTriwulanPicker
            routeName="/cetak/laporan/2"
            opdOptions={opdOptions}
            opdId={opd?.id ?? null}
            tahun={tahun}
            triwulan={triwulan}
          />
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
        <p className="text-right text-xs italic">Form 12</p>
        <h2 className="mt-2 text-center text-sm font-bold uppercase">
          Laporan Triwulan {triwulan} Pengelolaan Risiko
        </h2>
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
            <tr>
              <td className="py-0.5">OPD / SKPK</td>
              <td className="py-0.5">: {opd?.nama ?? 'Kompilasi Seluruh OPD (Pemda)'}</td>
            </tr>
          </tbody>
        </table>

        <h3 className="mt-4 text-xs font-bold uppercase">I. Pendahuluan</h3>
        {NARASI_FIELDS.map(({ key, label }) => (
          <NarasiSection
            key={key}
            label={label}
            value={form.data[key]}
            editing={editing}
            onChange={(v) => form.setData(key, v)}
          />
        ))}

        <h3 className="mt-4 text-xs font-bold uppercase">II. Rencana dan Realisasi Kegiatan Pengelolaan Risiko</h3>
        <NarasiSection
          label={`A. Rencana Kegiatan Pengelolaan Risiko Triwulan ${triwulan}`}
          value={form.data.rencana_kegiatan}
          editing={editing}
          onChange={(v) => form.setData('rencana_kegiatan', v)}
        />
        <NarasiSection
          label={`B. Realisasi Kegiatan Pengelolaan Risiko Triwulan ${triwulan}`}
          value={form.data.realisasi_kegiatan}
          editing={editing}
          onChange={(v) => form.setData('realisasi_kegiatan', v)}
        />
        <RencanaRealisasiTable rows={monitoringRows} />

        <h3 className="mt-4 text-xs font-bold uppercase">III. Hambatan Pelaksanaan Kegiatan</h3>
        <NarasiSection
          label=""
          value={form.data.hambatan_pelaksanaan}
          editing={editing}
          onChange={(v) => form.setData('hambatan_pelaksanaan', v)}
        />

        <h3 className="mt-4 text-xs font-bold uppercase">IV. Monitoring Risiko dan RTP</h3>
        <NarasiSection
          label=""
          value={form.data.monitoring_risiko_rtp}
          editing={editing}
          onChange={(v) => form.setData('monitoring_risiko_rtp', v)}
        />
        <KejadianTable rows={kejadianRows} />

        <h3 className="mt-4 text-xs font-bold uppercase">V. Penutup</h3>
        <NarasiSection
          label=""
          value={form.data.penutup}
          editing={editing}
          onChange={(v) => form.setData('penutup', v)}
        />

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
