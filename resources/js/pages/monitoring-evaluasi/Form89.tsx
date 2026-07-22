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
import CategorizedTextarea from '@/components/ui/categorized-textarea';
import { MONITORING_RTP_FIELD_INFO } from '@/lib/monitoring-rtp-field-info';
import {
  KATEGORI_EFEKTIVITAS_OPTIONS,
  hitungKemungkinanTerkendali,
  hitungDampakTerkendali,
  ekstrakKategoriKontrol,
  arahReduksiRtp,
} from '@/lib/irs-reference-data';
import { Pencil, Grid3x3 } from 'lucide-react';
import { toast } from 'sonner';
import RiskMatrixPickerDialog from '@/components/ui/risk-matrix-picker-dialog';

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
  skala_dampak: number | null;
  skala_kemungkinan: number | null;
  skala_dampak_inheren: number | null;
  skala_kemungkinan_inheren: number | null;
  skala_dampak_target: number | null;
  skala_kemungkinan_target: number | null;
  kategori_existing_control_aktual: string | null;
  skala_dampak_aktual: number | null;
  skala_kemungkinan_aktual: number | null;
  skala_risiko_aktual: number | null;
}

interface RiskMatrixData {
  dampakLabels: string[];
  kemungkinanLabels: string[];
  cells: { dampak: number; kemungkinan: number; skala_risiko: number | null; warna_class: string }[];
}

interface PageProps {
  opdOptions: OpdOption[];
  opdId: number | null;
  tahun: number;
  triwulanOptions: string[];
  triwulanLabels: Record<string, string>;
  rows: RtpRow[];
  riskReference: { matriksRisiko: RiskMatrixData };
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
  riskReference,
}: {
  row: RtpRow;
  triwulanOptions: string[];
  triwulanLabels: Record<string, string>;
  opdId: number;
  tahun: number;
  riskReference: { matriksRisiko: RiskMatrixData };
}) {
  const isFilled = row.monitoring_id !== null;
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [matrixPickerOpen, setMatrixPickerOpen] = useState(false);
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
    kategori_existing_control_aktual: row.kategori_existing_control_aktual ?? '',
    skala_dampak_aktual: row.skala_dampak_aktual != null ? String(row.skala_dampak_aktual) : '',
    skala_kemungkinan_aktual: row.skala_kemungkinan_aktual != null ? String(row.skala_kemungkinan_aktual) : '',
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

            {row.rtp_sumber_tipe !== 'cee_rtp' && (
              <div className="space-y-3 rounded-md border border-dashed border-emerald-400/60 p-3 sm:col-span-2 dark:border-emerald-700/60">
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-semibold tracking-wide text-emerald-700 uppercase dark:text-emerald-400">
                      Hasil Re-assessment Risiko (Skala Aktual)
                    </p>
                    <FieldInfoPopover text={MONITORING_RTP_FIELD_INFO.kategori_existing_control_aktual} />
                  </div>
                  {row.skala_kemungkinan_inheren && (
                    <Button type="button" variant="outline" size="sm" onClick={() => setMatrixPickerOpen(true)}>
                      <Grid3x3 className="mr-1.5 h-3.5 w-3.5" />
                      Isi Nilai Risiko Aktual
                    </Button>
                  )}
                </div>
                {!row.skala_kemungkinan_inheren ? (
                  <p className="rounded-md border border-amber-300 bg-amber-50 p-2 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
                    Skala Kemungkinan Inheren risiko ini belum diisi di Form Input — lengkapi dulu di sana supaya
                    Skala Aktual bisa dihitung otomatis.
                  </p>
                ) : (
                  <>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Kategori Efektivitas Aktual (hasil monitoring)</Label>
                      <CategorizedTextarea
                        value={form.kategori_existing_control_aktual}
                        onChange={(val) => setField('kategori_existing_control_aktual', val)}
                        categories={KATEGORI_EFEKTIVITAS_OPTIONS}
                        uraianPlaceholder="Uraian hasil pemantauan efektivitas (opsional)..."
                      />
                      {(() => {
                        const kat = ekstrakKategoriKontrol(form.kategori_existing_control_aktual);
                        const arah = arahReduksiRtp(row.label);
                        const previewK = arah.kemungkinan ? hitungKemungkinanTerkendali(row.skala_kemungkinan_inheren, kat) : null;
                        const previewD = arah.dampak ? hitungDampakTerkendali(row.skala_dampak_inheren, kat) : null;
                        if (!previewK && !previewD) return null;
                        return (
                          <p className="text-xs text-emerald-700 dark:text-emerald-400">
                            {previewK && (
                              <>
                                Perkiraan Skala Kemungkinan Aktual: <strong>{previewK}</strong> (dari K inheren{' '}
                                {row.skala_kemungkinan_inheren} × faktor kategori)
                              </>
                            )}
                            {previewK && previewD && <br />}
                            {previewD && (
                              <>
                                Perkiraan Skala Dampak Aktual: <strong>{previewD}</strong> (dari D inheren{' '}
                                {row.skala_dampak_inheren} × faktor kategori — RTP menyasar Dampak/Mitigate)
                              </>
                            )}
                          </p>
                        );
                      })()}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Skala Dampak Aktual</Label>
                        <Input
                          type="number"
                          min={1}
                          max={5}
                          value={form.skala_dampak_aktual}
                          onChange={(e) => setField('skala_dampak_aktual', e.target.value)}
                          placeholder={row.skala_dampak != null ? `Default ${row.skala_dampak}` : 'Pilih 1-5'}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Skala Kemungkinan Aktual</Label>
                        <Input
                          type="number"
                          min={1}
                          max={5}
                          value={form.skala_kemungkinan_aktual}
                          onChange={(e) => setField('skala_kemungkinan_aktual', e.target.value)}
                          placeholder="Auto/pilih 1-5"
                        />
                      </div>
                    </div>
                    {row.skala_risiko_aktual !== null && (
                      <p className="text-xs text-muted-foreground">
                        Skala Risiko Aktual tersimpan: <strong>{row.skala_risiko_aktual}</strong> (dihitung ulang otomatis
                        saat disimpan)
                      </p>
                    )}

                    <RiskMatrixPickerDialog
                      open={matrixPickerOpen}
                      onOpenChange={setMatrixPickerOpen}
                      matriks={riskReference.matriksRisiko}
                      titikDitampilkan={['inheren', 'residual', 'target', 'aktual']}
                      titikBisaDiubah={['aktual']}
                      nilai={{
                        inheren: { dampak: row.skala_dampak_inheren, kemungkinan: row.skala_kemungkinan_inheren },
                        residual: { dampak: row.skala_dampak, kemungkinan: row.skala_kemungkinan },
                        target: { dampak: row.skala_dampak_target, kemungkinan: row.skala_kemungkinan_target },
                        aktual: {
                          dampak: Number(form.skala_dampak_aktual) || null,
                          kemungkinan: Number(form.skala_kemungkinan_aktual) || null,
                        },
                      }}
                      onPilih={(_titik, dampak, kemungkinan) => {
                        setField('skala_dampak_aktual', String(dampak));
                        setField('skala_kemungkinan_aktual', String(kemungkinan));
                      }}
                    />
                  </>
                )}
              </div>
            )}

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

export default function Form89({ opdOptions, opdId, tahun, triwulanOptions, triwulanLabels, rows, riskReference }: PageProps) {
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
                riskReference={riskReference}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
