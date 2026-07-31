import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MultiPenandatangan } from '@/components/cee/multi-penandatangan';
import UnduhPdfButton from '@/components/ui/unduh-pdf-button';
import { Pencil, Save } from 'lucide-react';

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
  penandatangan?: Signatory[];
}

interface Narasi {
  latar_belakang: string;
  dasar_hukum: string;
  maksud_tujuan: string;
  ruang_lingkup: string;
  rencana_kegiatan: string;
  realisasi_kegiatan: string;
  hambatan_pelaksanaan: string;
  hasil_pembinaan: string;
  rekomendasi_feedback: string;
  penutup: string;
}

interface PageProps {
  tahun: number;
  periode: string;
  periodeOptions: Record<string, string>;
  pemerintahKabkota: string;
  dataUmum: DataUmum | null;
  canEdit: boolean;
  narasi: Narasi;
  komite: { nama: string | null; jabatan: string | null }[];
}

const PENDAHULUAN: { key: keyof Narasi; label: string }[] = [
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

/**
 * Form 14 — Laporan Pembinaan Komite Pengelolaan Risiko.
 *
 * Perdep PPKD 4/2019 halaman berlabel 148 menyebut tugas ketiga Komite:
 * "Membuat laporan semesteran dan tahunan kegiatan pembinaan pengelolaan
 * risiko yang disampaikan kepada Kepala Daerah cq Sekretaris Daerah".
 * Outline empat bagiannya ada di halaman berlabel 148 sampai 149.
 *
 * SEMESTERAN, bukan triwulanan seperti Laporan 12 dan 13.
 *
 * Seluruhnya naratif: aplikasi tidak merekam kegiatan pembinaan — sosialisasi,
 * bimbingan, supervisi, pelatihan — sebagai data, sehingga tidak ada yang bisa
 * diproyeksi live. Menampilkan angka dari data lain justru akan menyesatkan
 * pembacanya seolah itu capaian pembinaan.
 */
export default function Cetak4({
  tahun,
  periode,
  periodeOptions,
  pemerintahKabkota,
  dataUmum,
  canEdit,
  narasi,
  komite,
}: PageProps) {
  const [editing, setEditing] = useState(false);
  const form = useForm({ tahun, periode, ...narasi });

  const submit = () => {
    form.post('/cetak/laporan/4/narasi', {
      preserveScroll: true,
      onSuccess: () => setEditing(false),
    });
  };

  const pdfHref = `/cetak/laporan/4/pdf?${new URLSearchParams({ tahun: String(tahun), periode })}`;
  const periodeLabel = periodeOptions[periode] ?? periode;

  // Penanda tangan Komite diambil dari Struktur Pengelolaan Risiko tahun ini.
  // Bila belum direkam, jatuh ke Kepala Daerah seperti Laporan 13 — laporan
  // tetap dapat dicetak, hanya blok tanda tangannya yang belum spesifik.
  const ketuaKomite = komite[0] ?? null;

  return (
    <AppLayout>
      <Head title="14_Laporan Pembinaan Komite Pengelolaan Risiko" />

      <div className="space-y-4 p-4 print:hidden">
        <div>
          <h1 className="text-2xl font-semibold">14_Laporan Pembinaan Komite Pengelolaan Risiko</h1>
          <p className="text-muted-foreground text-sm">
            Pratinjau cetak A4 potret &mdash; {periodeLabel} Tahun {tahun}. Tingkat Pemerintah Daerah, disampaikan
            kepada Bupati melalui Sekretaris Daerah.
          </p>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-wrap items-end gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Tahun</Label>
              <input
                type="number"
                value={tahun}
                onChange={(e) =>
                  router.get('/cetak/laporan/4', { tahun: e.target.value, periode }, { preserveState: true })
                }
                className="border-input bg-background h-9 w-28 rounded-md border px-3 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Periode</Label>
              <Select
                value={periode}
                onValueChange={(v) => router.get('/cetak/laporan/4', { tahun, periode: v }, { preserveState: true })}
              >
                <SelectTrigger className="w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(periodeOptions).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

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
              <p className="text-muted-foreground self-center text-xs">
                Hanya Admin/Super Admin yang dapat mengedit laporan ini.
              </p>
            )}
            <UnduhPdfButton href={pdfHref} />
          </div>
        </div>

        {komite.length === 0 && canEdit && (
          <p className="rounded-md border border-amber-500/60 bg-amber-50 p-3 text-xs text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
            Susunan Komite Pengelolaan Risiko tahun {tahun} belum direkam, sehingga blok tanda tangan memakai Kepala
            Daerah. Rekam di Form Cetak &rarr; Struktur Pengelolaan Risiko dengan peran Komite Pengelolaan Risiko.
          </p>
        )}
      </div>

      <div className="cee-print-sheet mx-auto max-w-[1500px] bg-white p-8 text-black print:m-0 print:max-w-none print:p-0 print:shadow-none">
        <p className="text-right text-xs italic">Form 14</p>
        <h2 className="mt-2 text-center text-sm font-bold uppercase">
          Laporan {periodeLabel} Komite Pengelolaan Risiko
        </h2>
        <p className="text-center text-xs font-semibold uppercase">Pembinaan Pengelolaan Risiko Pemerintah Daerah</p>
        <p className="text-center text-xs">{pemerintahKabkota}</p>

        <table className="mt-4 w-full border-collapse text-xs">
          <tbody>
            <tr>
              <td className="w-44 py-0.5">Tahun Penilaian</td>
              <td className="py-0.5">: {tahun}</td>
            </tr>
            <tr>
              <td className="py-0.5">Periode Pelaporan</td>
              <td className="py-0.5">: {periodeLabel}</td>
            </tr>
            <tr>
              <td className="py-0.5">Disampaikan kepada</td>
              <td className="py-0.5">: Bupati Aceh Barat melalui Sekretaris Daerah</td>
            </tr>
          </tbody>
        </table>

        <h3 className="mt-4 text-xs font-bold uppercase">Pendahuluan</h3>
        {PENDAHULUAN.map(({ key, label }) => (
          <NarasiSection
            key={key}
            label={label}
            value={form.data[key]}
            editing={editing && canEdit}
            onChange={(v) => form.setData(key, v)}
          />
        ))}

        <h3 className="mt-4 text-xs font-bold uppercase">A. Rencana dan Realisasi Kegiatan</h3>
        <NarasiSection
          label="Rencana Kegiatan Pembinaan"
          value={form.data.rencana_kegiatan}
          editing={editing && canEdit}
          onChange={(v) => form.setData('rencana_kegiatan', v)}
        />
        <NarasiSection
          label="Realisasi Kegiatan Pembinaan"
          value={form.data.realisasi_kegiatan}
          editing={editing && canEdit}
          onChange={(v) => form.setData('realisasi_kegiatan', v)}
        />

        <h3 className="mt-4 text-xs font-bold uppercase">B. Hambatan Pelaksanaan Kegiatan</h3>
        <NarasiSection
          label=""
          value={form.data.hambatan_pelaksanaan}
          editing={editing && canEdit}
          onChange={(v) => form.setData('hambatan_pelaksanaan', v)}
        />

        <h3 className="mt-4 text-xs font-bold uppercase">
          C. Hasil Pembinaan terhadap Pengelolaan Risiko Pemerintah Daerah
        </h3>
        <NarasiSection
          label=""
          value={form.data.hasil_pembinaan}
          editing={editing && canEdit}
          onChange={(v) => form.setData('hasil_pembinaan', v)}
        />

        <h3 className="mt-4 text-xs font-bold uppercase">D. Rekomendasi / Feedback bagi UPR</h3>
        <NarasiSection
          label=""
          value={form.data.rekomendasi_feedback}
          editing={editing && canEdit}
          onChange={(v) => form.setData('rekomendasi_feedback', v)}
        />

        <h3 className="mt-4 text-xs font-bold uppercase">Penutup</h3>
        <NarasiSection
          label=""
          value={form.data.penutup}
          editing={editing && canEdit}
          onChange={(v) => form.setData('penutup', v)}
        />

        <MultiPenandatangan
          penandatangan={[]}
          kepalaNama={ketuaKomite?.nama ?? dataUmum?.nama_kepala_daerah ?? null}
          kepalaJabatan={
            ketuaKomite?.jabatan ?? dataUmum?.jabatan_kepala_daerah ?? 'Ketua Komite Pengelolaan Risiko'
          }
          kepalaNip={null}
          tempatPembuatan={dataUmum?.tempat_pembuatan ?? null}
          tanggalPembuatan={dataUmum?.tanggal_pembuatan ?? null}
        />
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
