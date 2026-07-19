import { Head, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { DatePicker } from '@/components/ui/date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OpdTahunPicker } from '@/components/cee/opd-tahun-picker';
import FieldInfoPopover from '@/components/ui/field-info-popover';
import MultiCategoryTextarea from '@/components/ui/multi-category-textarea';
import { PENYEBAB_5M_KATEGORI } from '@/lib/irs-reference-data';
import { PENCATATAN_KEJADIAN_FIELD_INFO } from '@/lib/pencatatan-kejadian-field-info';
import { Pencil } from 'lucide-react';
import { toast } from 'sonner';

interface OpdOption {
  id: number;
  nama: string;
}

interface RisikoRow {
  risiko_tipe: 'irs_pemda' | 'irs_pd' | 'iro_pd';
  risiko_id: number;
  label: string;
  konteks: string;
  pencatatan_id: number | null;
  laporan_kejadian_id: number | null;
  tanggal_terjadi: string | null;
  sebab_saat_kejadian: string | null;
  dampak_saat_kejadian: string | null;
  keterangan_kejadian: string | null;
  triwulan_rencana_rtp: string | null;
  tahun_rencana_rtp: number | null;
  realisasi_pelaksanaan_rtp: string | null;
  keterangan_rtp: string | null;
}

interface Prefill {
  risiko_tipe: string;
  risiko_id: number;
  tanggal_terjadi: string | null;
  sebab: string | null;
  dampak: string | null;
  laporan_kejadian_id: number | null;
}

interface PageProps {
  opdOptions: OpdOption[];
  opdId: number | null;
  tahun: number;
  triwulanOptions: string[];
  triwulanLabels: Record<string, string>;
  rows: RisikoRow[];
  prefill: Prefill | null;
}

const TIPE_LABEL: Record<RisikoRow['risiko_tipe'], string> = {
  irs_pemda: 'Risiko Strategis Pemda',
  irs_pd: 'Risiko Strategis OPD',
  iro_pd: 'Risiko Operasional OPD',
};

function RisikoRowCard({
  row,
  triwulanOptions,
  triwulanLabels,
  opdId,
  tahun,
  prefillMatch,
  cardRef,
}: {
  row: RisikoRow;
  triwulanOptions: string[];
  triwulanLabels: Record<string, string>;
  opdId: number;
  tahun: number;
  prefillMatch: Prefill | null;
  cardRef?: React.RefObject<HTMLDivElement | null>;
}) {
  const isFilled = row.pencatatan_id !== null;
  const [editing, setEditing] = useState(!!prefillMatch);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    // Prefill dari laporan warga (tombol "Catat ke Form 10") HANYA mengisi
    // field yg masih kosong di baris existing — tidak menimpa data yg
    // sudah pernah diisi petugas sebelumnya.
    tanggal_terjadi: row.tanggal_terjadi ?? prefillMatch?.tanggal_terjadi ?? '',
    sebab_saat_kejadian: row.sebab_saat_kejadian ?? prefillMatch?.sebab ?? '',
    dampak_saat_kejadian: row.dampak_saat_kejadian ?? prefillMatch?.dampak ?? '',
    keterangan_kejadian: row.keterangan_kejadian ?? '',
    triwulan_rencana_rtp: row.triwulan_rencana_rtp ?? '',
    tahun_rencana_rtp: row.tahun_rencana_rtp ? String(row.tahun_rencana_rtp) : '',
    realisasi_pelaksanaan_rtp: row.realisasi_pelaksanaan_rtp ?? '',
    keterangan_rtp: row.keterangan_rtp ?? '',
  });

  const setField = (key: keyof typeof form, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const save = () => {
    setSaving(true);
    router.post(
      '/monitoring-evaluasi/10',
      {
        risiko_tipe: row.risiko_tipe,
        risiko_id: row.risiko_id,
        opd_id: opdId,
        tahun,
        laporan_kejadian_id: prefillMatch?.laporan_kejadian_id ?? row.laporan_kejadian_id ?? null,
        ...form,
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          toast.success('Pencatatan Kejadian Risiko berhasil disimpan.');
          setEditing(false);
        },
        onError: () => toast.error('Gagal menyimpan.'),
        onFinish: () => setSaving(false),
      },
    );
  };

  return (
    <Card ref={cardRef} className={prefillMatch ? 'ring-2 ring-primary' : undefined}>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant="outline">{TIPE_LABEL[row.risiko_tipe]}</Badge>
              {row.laporan_kejadian_id && (
                <Badge variant="outline" className="border-blue-300 text-blue-700">
                  Dari Laporan Warga #{row.laporan_kejadian_id}
                </Badge>
              )}
            </div>
            <p className="text-sm font-medium">{row.label}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {isFilled ? (
              <Badge className="bg-green-600 hover:bg-green-600">Sudah dicatat</Badge>
            ) : (
              <Badge variant="outline" className="text-muted-foreground">
                Belum dicatat
              </Badge>
            )}
            <Button type="button" variant="outline" size="sm" onClick={() => setEditing((v) => !v)}>
              <Pencil className="mr-1.5 h-3.5 w-3.5" />
              {editing ? 'Tutup' : isFilled ? 'Edit' : 'Catat'}
            </Button>
          </div>
        </div>

        {editing && (
          <div className="grid gap-4 border-t pt-3 sm:grid-cols-2">
            <div className="space-y-3">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Kejadian Risiko</p>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Label>Tanggal Terjadi</Label>
                  <FieldInfoPopover text={PENCATATAN_KEJADIAN_FIELD_INFO.tanggal_terjadi} />
                </div>
                <DatePicker value={form.tanggal_terjadi} onChange={(v) => setField('tanggal_terjadi', v)} placeholder="Belum terjadi" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Label>Sebab (saat kejadian)</Label>
                  <FieldInfoPopover text={PENCATATAN_KEJADIAN_FIELD_INFO.sebab_saat_kejadian} />
                </div>
                <MultiCategoryTextarea
                  value={form.sebab_saat_kejadian}
                  onChange={(val) => setField('sebab_saat_kejadian', val)}
                  categories={PENYEBAB_5M_KATEGORI}
                  uraianPlaceholder="Uraian sebab..."
                  rows={2}
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Label>Dampak (saat kejadian)</Label>
                  <FieldInfoPopover text={PENCATATAN_KEJADIAN_FIELD_INFO.dampak_saat_kejadian} />
                </div>
                <Textarea rows={2} value={form.dampak_saat_kejadian} onChange={(e) => setField('dampak_saat_kejadian', e.target.value)} placeholder="Tidak Terjadi" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Label>Keterangan</Label>
                  <FieldInfoPopover text={PENCATATAN_KEJADIAN_FIELD_INFO.keterangan_kejadian} />
                </div>
                <Textarea rows={2} value={form.keterangan_kejadian} onChange={(e) => setField('keterangan_kejadian', e.target.value)} />
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Pelaksanaan RTP</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Label>Rencana — Triwulan</Label>
                    <FieldInfoPopover text={PENCATATAN_KEJADIAN_FIELD_INFO.rencana_pelaksanaan_rtp} />
                  </div>
                  <Select value={form.triwulan_rencana_rtp || undefined} onValueChange={(v) => setField('triwulan_rencana_rtp', v)}>
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
                  <Input type="number" value={form.tahun_rencana_rtp} onChange={(e) => setField('tahun_rencana_rtp', e.target.value)} placeholder="mis. 2026" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Label>Realisasi Pelaksanaan RTP</Label>
                  <FieldInfoPopover text={PENCATATAN_KEJADIAN_FIELD_INFO.realisasi_pelaksanaan_rtp} />
                </div>
                <Input value={form.realisasi_pelaksanaan_rtp} onChange={(e) => setField('realisasi_pelaksanaan_rtp', e.target.value)} placeholder="mis. Oktober 2026" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Label>Keterangan</Label>
                  <FieldInfoPopover text={PENCATATAN_KEJADIAN_FIELD_INFO.keterangan_rtp} />
                </div>
                <Textarea rows={2} value={form.keterangan_rtp} onChange={(e) => setField('keterangan_rtp', e.target.value)} placeholder="mis. Telah dilaksanakan, efektifitas RTP belum dapat diukur" />
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

export default function Form10({ opdOptions, opdId, tahun, triwulanOptions, triwulanLabels, rows, prefill }: PageProps) {
  const prefillCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefill && prefillCardRef.current) {
      prefillCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefill?.risiko_tipe, prefill?.risiko_id]);

  return (
    <AppLayout>
      <Head title="10 Pencatatan Kejadian Risiko" />
      <div className="space-y-4 p-4">
        <div>
          <h1 className="text-2xl font-semibold">10 — Pencatatan Kejadian Risiko &amp; Pelaksanaan RTP</h1>
          <p className="text-sm text-muted-foreground">
            Pencatatan Kejadian Risiko (Risk Event) dan Pelaksanaan RTP — sesuai Lampiran 5 Perdep PPKD No.4/2019.
            Satu baris di bawah mewakili satu risiko yang sudah teridentifikasi di Form Input IRS/IRO — catat di
            sini bila risiko tersebut benar-benar terjadi pada tahun berjalan, beserta realisasi RTP-nya.
          </p>
        </div>

        <OpdTahunPicker routeName="/monitoring-evaluasi/10" opdOptions={opdOptions} opdId={opdId} tahun={tahun} />

        {!opdId ? (
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">Pilih OPD terlebih dahulu.</CardContent>
          </Card>
        ) : rows.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              Belum ada risiko teridentifikasi untuk OPD &amp; tahun ini — isi dulu Uraian Risiko di Form Input
              IRS/IRO.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {rows.map((row) => {
              const isPrefillMatch = !!prefill && prefill.risiko_tipe === row.risiko_tipe && prefill.risiko_id === row.risiko_id;
              return (
                <RisikoRowCard
                  key={`${row.risiko_tipe}-${row.risiko_id}`}
                  row={row}
                  triwulanOptions={triwulanOptions}
                  triwulanLabels={triwulanLabels}
                  opdId={opdId}
                  tahun={tahun}
                  prefillMatch={isPrefillMatch ? prefill : null}
                  cardRef={isPrefillMatch ? prefillCardRef : undefined}
                />
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
