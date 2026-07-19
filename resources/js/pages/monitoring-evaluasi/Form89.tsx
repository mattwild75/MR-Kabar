import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OpdTahunPicker } from '@/components/cee/opd-tahun-picker';
import FieldInfoPopover from '@/components/ui/field-info-popover';
import RiskEvidenceUploader from '@/components/ui/risk-evidence-uploader';
import { MONITORING_RTP_FIELD_INFO } from '@/lib/monitoring-rtp-field-info';
import { Pencil } from 'lucide-react';
import { toast } from 'sonner';

interface OpdOption {
  id: number;
  nama: string;
}

interface RtpRow {
  rtp_sumber_tipe: 'irs_pemda' | 'irs_pd' | 'iro_pd' | 'cee_rtp';
  rtp_sumber_id: number;
  label: string;
  konteks: string;
  monitoring_id: number | null;
  media_komunikasi: string | null;
  penyedia_informasi: string | null;
  penerima_informasi: string | null;
  triwulan_rencana_komunikasi: string | null;
  tahun_rencana_komunikasi: number | null;
  realisasi_waktu_komunikasi: string | null;
  keterangan_komunikasi: string | null;
  metode_pemantauan: string | null;
  penanggung_jawab_pemantauan: string | null;
  triwulan_rencana_pemantauan: string | null;
  tahun_rencana_pemantauan: number | null;
  realisasi_waktu_pemantauan: string | null;
  keterangan_pemantauan: string | null;
}

interface PageProps {
  opdOptions: OpdOption[];
  opdId: number | null;
  tahun: number;
  triwulanOptions: string[];
  triwulanLabels: Record<string, string>;
  rows: RtpRow[];
}

const TIPE_LABEL: Record<RtpRow['rtp_sumber_tipe'], string> = {
  irs_pemda: 'RTP Risiko (Strategis Pemda)',
  irs_pd: 'RTP Risiko (Strategis OPD)',
  iro_pd: 'RTP Risiko (Operasional OPD)',
  cee_rtp: 'RTP CEE',
};

function RtpRowCard({
  row,
  triwulanOptions,
  triwulanLabels,
  opdId,
  tahun,
}: {
  row: RtpRow;
  triwulanOptions: string[];
  triwulanLabels: Record<string, string>;
  opdId: number;
  tahun: number;
}) {
  const isFilled = row.monitoring_id !== null;
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    media_komunikasi: row.media_komunikasi ?? '',
    penyedia_informasi: row.penyedia_informasi ?? '',
    penerima_informasi: row.penerima_informasi ?? '',
    triwulan_rencana_komunikasi: row.triwulan_rencana_komunikasi ?? '',
    tahun_rencana_komunikasi: row.tahun_rencana_komunikasi ? String(row.tahun_rencana_komunikasi) : '',
    realisasi_waktu_komunikasi: row.realisasi_waktu_komunikasi ?? '',
    keterangan_komunikasi: row.keterangan_komunikasi ?? '',
    metode_pemantauan: row.metode_pemantauan ?? '',
    penanggung_jawab_pemantauan: row.penanggung_jawab_pemantauan ?? '',
    triwulan_rencana_pemantauan: row.triwulan_rencana_pemantauan ?? '',
    tahun_rencana_pemantauan: row.tahun_rencana_pemantauan ? String(row.tahun_rencana_pemantauan) : '',
    realisasi_waktu_pemantauan: row.realisasi_waktu_pemantauan ?? '',
    keterangan_pemantauan: row.keterangan_pemantauan ?? '',
  });

  const setField = (key: keyof typeof form, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const save = () => {
    setSaving(true);
    router.post(
      '/monitoring-evaluasi/8-9',
      {
        rtp_sumber_tipe: row.rtp_sumber_tipe,
        rtp_sumber_id: row.rtp_sumber_id,
        opd_id: opdId,
        tahun,
        ...form,
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          toast.success('Monitoring RTP berhasil disimpan.');
          setEditing(false);
        },
        onError: () => toast.error('Gagal menyimpan.'),
        onFinish: () => setSaving(false),
      },
    );
  };

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-1">
            <Badge variant="outline">{TIPE_LABEL[row.rtp_sumber_tipe]}</Badge>
            <p className="text-sm font-medium">{row.label}</p>
            <p className="text-xs text-muted-foreground">{row.konteks}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {isFilled ? (
              <Badge className="bg-green-600 hover:bg-green-600">Sudah diisi</Badge>
            ) : (
              <Badge variant="outline" className="text-muted-foreground">
                Belum diisi
              </Badge>
            )}
            <Button type="button" variant="outline" size="sm" onClick={() => setEditing((v) => !v)}>
              <Pencil className="mr-1.5 h-3.5 w-3.5" />
              {editing ? 'Tutup' : isFilled ? 'Edit' : 'Isi'}
            </Button>
          </div>
        </div>

        {editing && (
          <div className="grid gap-4 border-t pt-3 sm:grid-cols-2">
            <div className="space-y-3">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Form 8 — Pengkomunikasian
              </p>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Label>Media/Bentuk Sarana Pengkomunikasian</Label>
                  <FieldInfoPopover text={MONITORING_RTP_FIELD_INFO.media_komunikasi} />
                </div>
                <Input value={form.media_komunikasi} onChange={(e) => setField('media_komunikasi', e.target.value)} placeholder="mis. Rapat" />
              </div>
              {form.media_komunikasi.trim() !== '' && (
                <RiskEvidenceUploader type="monitoring_rtp_komunikasi" rowId={row.monitoring_id} />
              )}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Label>Penyedia Informasi</Label>
                  <FieldInfoPopover text={MONITORING_RTP_FIELD_INFO.penyedia_informasi} />
                </div>
                <Input value={form.penyedia_informasi} onChange={(e) => setField('penyedia_informasi', e.target.value)} placeholder="mis. Sekda/Bappeda" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Label>Penerima Informasi</Label>
                  <FieldInfoPopover text={MONITORING_RTP_FIELD_INFO.penerima_informasi} />
                </div>
                <Input value={form.penerima_informasi} onChange={(e) => setField('penerima_informasi', e.target.value)} placeholder="mis. Dinas Kesehatan" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Label>Rencana — Triwulan</Label>
                    <FieldInfoPopover text={MONITORING_RTP_FIELD_INFO.rencana_waktu_komunikasi} />
                  </div>
                  <Select value={form.triwulan_rencana_komunikasi || undefined} onValueChange={(v) => setField('triwulan_rencana_komunikasi', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Triwulan" />
                    </SelectTrigger>
                    <SelectContent>
                      {triwulanOptions.map((k) => (
                        <SelectItem key={k} value={k}>
                          {triwulanLabels[k] ?? k}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Rencana — Tahun</Label>
                  <Input type="number" value={form.tahun_rencana_komunikasi} onChange={(e) => setField('tahun_rencana_komunikasi', e.target.value)} placeholder="mis. 2026" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Label>Realisasi Waktu Pelaksanaan</Label>
                  <FieldInfoPopover text={MONITORING_RTP_FIELD_INFO.realisasi_waktu_komunikasi} />
                </div>
                <Input value={form.realisasi_waktu_komunikasi} onChange={(e) => setField('realisasi_waktu_komunikasi', e.target.value)} placeholder="mis. Februari 2026" />
              </div>
              <div className="space-y-1">
                <Label>Keterangan</Label>
                <Textarea rows={2} value={form.keterangan_komunikasi} onChange={(e) => setField('keterangan_komunikasi', e.target.value)} />
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Form 9 — Pemantauan
              </p>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Label>Bentuk/Metode Pemantauan</Label>
                  <FieldInfoPopover text={MONITORING_RTP_FIELD_INFO.metode_pemantauan} />
                </div>
                <Input value={form.metode_pemantauan} onChange={(e) => setField('metode_pemantauan', e.target.value)} placeholder="mis. Konfirmasi/pemantauan berkelanjutan" />
              </div>
              {form.metode_pemantauan.trim() !== '' && (
                <RiskEvidenceUploader type="monitoring_rtp_pemantauan" rowId={row.monitoring_id} />
              )}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Label>Penanggung Jawab Pemantauan</Label>
                  <FieldInfoPopover text={MONITORING_RTP_FIELD_INFO.penanggung_jawab_pemantauan} />
                </div>
                <Input value={form.penanggung_jawab_pemantauan} onChange={(e) => setField('penanggung_jawab_pemantauan', e.target.value)} placeholder="mis. Kepala Dinas Kesehatan" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Label>Rencana — Triwulan</Label>
                    <FieldInfoPopover text={MONITORING_RTP_FIELD_INFO.rencana_waktu_pemantauan} />
                  </div>
                  <Select value={form.triwulan_rencana_pemantauan || undefined} onValueChange={(v) => setField('triwulan_rencana_pemantauan', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Triwulan" />
                    </SelectTrigger>
                    <SelectContent>
                      {triwulanOptions.map((k) => (
                        <SelectItem key={k} value={k}>
                          {triwulanLabels[k] ?? k}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Rencana — Tahun</Label>
                  <Input type="number" value={form.tahun_rencana_pemantauan} onChange={(e) => setField('tahun_rencana_pemantauan', e.target.value)} placeholder="mis. 2026" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Label>Realisasi Waktu Pelaksanaan</Label>
                  <FieldInfoPopover text={MONITORING_RTP_FIELD_INFO.realisasi_waktu_pemantauan} />
                </div>
                <Input value={form.realisasi_waktu_pemantauan} onChange={(e) => setField('realisasi_waktu_pemantauan', e.target.value)} placeholder="mis. Juni 2026" />
              </div>
              <div className="space-y-1">
                <Label>Keterangan</Label>
                <Textarea rows={2} value={form.keterangan_pemantauan} onChange={(e) => setField('keterangan_pemantauan', e.target.value)} />
              </div>
            </div>

            <div className="flex justify-end gap-2 sm:col-span-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setEditing(false)}>
                Batal
              </Button>
              <Button type="button" size="sm" onClick={save} disabled={saving}>
                Simpan
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Form89({ opdOptions, opdId, tahun, triwulanOptions, triwulanLabels, rows }: PageProps) {
  return (
    <AppLayout>
      <Head title="8-9 Monitoring RTP" />
      <div className="space-y-4 p-4">
        <div>
          <h1 className="text-2xl font-semibold">8-9 — Monitoring RTP (Komunikasi &amp; Pemantauan)</h1>
          <p className="text-sm text-muted-foreground">
            Rencana &amp; Realisasi Pengkomunikasian (Form 8) dan Pemantauan (Form 9) atas Kegiatan Pengendalian —
            sesuai Lampiran 5 Perdep PPKD No.4/2019. Satu baris di bawah mewakili satu RTP yang sudah diisi di
            Form Input Risiko (IRS/IRO) atau RTP CEE (1d) — lengkapi kolom komunikasi &amp; pemantauannya di sini.
          </p>
        </div>

        <OpdTahunPicker routeName="/monitoring-evaluasi/8-9" opdOptions={opdOptions} opdId={opdId} tahun={tahun} />

        {!opdId ? (
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">Pilih OPD terlebih dahulu.</CardContent>
          </Card>
        ) : rows.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              Belum ada RTP untuk OPD &amp; tahun ini — isi dulu Rencana Tindak Pengendalian di Form Input IRS/IRO
              atau RTP CEE (1d).
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {rows.map((row) => (
              <RtpRowCard
                key={`${row.rtp_sumber_tipe}-${row.rtp_sumber_id}`}
                row={row}
                triwulanOptions={triwulanOptions}
                triwulanLabels={triwulanLabels}
                opdId={opdId}
                tahun={tahun}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
