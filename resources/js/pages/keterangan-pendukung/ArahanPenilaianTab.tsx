import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import FieldInfoPopover from '@/components/ui/field-info-popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ARAHAN_FIELD_INFO } from '@/lib/arahan-penilaian-field-info';
import { router } from '@inertiajs/react';
import { Edit, Plus, Save, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export interface TahapanRow {
    id: number;
    urutan: number;
    tahapan: string;
    dokumen_pemicu: string | null;
    tanggal_mulai: string | null;
    tanggal_selesai: string | null;
    pelaksana: string | null;
    keluaran: string | null;
}

/** Arahan dan Kebijakan Penilaian Risiko yang ditetapkan Bupati lewat Surat Edaran. */
export interface ArahanRow {
    id: number;
    jenis: '5_tahunan' | '1_tahunan';
    tahun_mulai: number;
    tahun_selesai: number;
    nomor_se: string | null;
    tanggal_se: string | null;
    dasar_hukum: string | null;
    catatan: string | null;
    status: 'draf' | 'berlaku';
    tahapan: TahapanRow[];
}

const tgl = (v: string | null | undefined) => (v ? v.slice(0, 10) : '');

/**
 * Arahan dan Kebijakan Penilaian Risiko, berikut tahapan dan tenggatnya.
 *
 * Perdep PPKD 4/2019 Lampiran 3 dan 4 memuat contohnya sebagai Surat Edaran
 * Kepala Daerah: yang 5 tahunan mengikuti periode RPJMD, yang 1 tahunan
 * mengikuti siklus anggaran dan menyebut tanggal konkret. Ditetapkan terpisah
 * dari Peraturan Bupati karena Perbup adalah pedoman yang jarang berubah,
 * sedangkan arahan berubah tiap tahun — kalau digabung, tiap tahun Perbup
 * harus ikut diubah.
 *
 * Tahapan yang direkam di sini menjadi sumber data jadwal pada Dasbor, supaya
 * yang ditagihkan kepada OPD benar-benar yang ditetapkan Bupati, bukan
 * karangan aplikasi.
 */
export default function ArahanPenilaianTab({ rows, jenisLabel }: { rows: ArahanRow[]; jenisLabel: Record<string, string> }) {
    const tahunIni = new Date().getFullYear();
    const kosong: Record<string, string | number> = {
        jenis: '1_tahunan',
        tahun_mulai: tahunIni,
        tahun_selesai: tahunIni,
        nomor_se: '',
        tanggal_se: '',
        dasar_hukum: '',
        catatan: '',
        status: 'draf',
    };

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<ArahanRow | null>(null);
    const [form, setForm] = useState<Record<string, string | number>>(kosong);
    const [processing, setProcessing] = useState(false);
    const [tahapanDialog, setTahapanDialog] = useState<{ arahan: ArahanRow; tahapan: TahapanRow | null } | null>(null);
    const [tahapanForm, setTahapanForm] = useState<Record<string, string | number>>({});

    const bukaTambah = () => {
        setEditing(null);
        setForm(kosong);
        setDialogOpen(true);
    };

    const bukaEdit = (row: ArahanRow) => {
        setEditing(row);
        setForm({
            jenis: row.jenis,
            tahun_mulai: row.tahun_mulai,
            tahun_selesai: row.tahun_selesai,
            nomor_se: row.nomor_se ?? '',
            tanggal_se: tgl(row.tanggal_se),
            dasar_hukum: row.dasar_hukum ?? '',
            catatan: row.catatan ?? '',
            status: row.status,
        });
        setDialogOpen(true);
    };

    const simpan = () => {
        setProcessing(true);
        const selesai = {
            onSuccess: () => {
                toast.success('Arahan berhasil disimpan.');
                setDialogOpen(false);
            },
            onError: () => toast.error('Gagal menyimpan arahan.'),
            onFinish: () => setProcessing(false),
            preserveScroll: true,
        };

        if (editing) {
            router.put(`/keterangan-pendukung/arahan/${editing.id}`, form, selesai);
        } else {
            router.post('/keterangan-pendukung/arahan', form, selesai);
        }
    };

    const hapus = (row: ArahanRow) => {
        router.delete(`/keterangan-pendukung/arahan/${row.id}`, {
            onSuccess: () => toast.success('Arahan berhasil dihapus.'),
            onError: () => toast.error('Gagal menghapus.'),
            preserveScroll: true,
        });
    };

    const bukaTahapan = (arahan: ArahanRow, tahapan: TahapanRow | null) => {
        setTahapanDialog({ arahan, tahapan });
        setTahapanForm(
            tahapan
                ? {
                      urutan: tahapan.urutan,
                      tahapan: tahapan.tahapan,
                      dokumen_pemicu: tahapan.dokumen_pemicu ?? '',
                      tanggal_mulai: tgl(tahapan.tanggal_mulai),
                      tanggal_selesai: tgl(tahapan.tanggal_selesai),
                      pelaksana: tahapan.pelaksana ?? '',
                      keluaran: tahapan.keluaran ?? '',
                  }
                : { tahapan: '', dokumen_pemicu: '', tanggal_mulai: '', tanggal_selesai: '', pelaksana: '', keluaran: '' },
        );
    };

    const simpanTahapan = () => {
        if (!tahapanDialog) return;
        setProcessing(true);
        const selesai = {
            onSuccess: () => {
                toast.success('Tahapan berhasil disimpan.');
                setTahapanDialog(null);
            },
            onError: (errs: Record<string, string>) => toast.error(errs.tanggal_selesai ?? errs.tahapan ?? 'Gagal menyimpan tahapan.'),
            onFinish: () => setProcessing(false),
            preserveScroll: true,
        };

        if (tahapanDialog.tahapan) {
            router.put(`/keterangan-pendukung/tahapan/${tahapanDialog.tahapan.id}`, tahapanForm, selesai);
        } else {
            router.post(`/keterangan-pendukung/arahan/${tahapanDialog.arahan.id}/tahapan`, tahapanForm, selesai);
        }
    };

    const hapusTahapan = (t: TahapanRow) => {
        router.delete(`/keterangan-pendukung/tahapan/${t.id}`, {
            onSuccess: () => toast.success('Tahapan berhasil dihapus.'),
            onError: () => toast.error('Gagal menghapus tahapan.'),
            preserveScroll: true,
        });
    };

    return (
        <div className="space-y-4">
            <div className="bg-muted/40 rounded-md border p-3 text-sm">
                <p>
                    Rekam Surat Edaran Bupati tentang <strong>Arahan dan Kebijakan Penilaian Risiko</strong> beserta tahapan dan tenggatnya. Yang 5
                    tahunan mengikuti periode RPJMD; yang 1 tahunan mengikuti siklus anggaran dan memuat tanggal konkret.
                </p>
                <p className="text-muted-foreground mt-1">
                    Tahapan pada arahan berstatus <strong>Berlaku</strong> menjadi sumber jadwal yang tampil di Dasbor. Selama masih{' '}
                    <strong>Draf</strong>, arahan tidak menagih siapa pun.
                </p>
            </div>

            <div className="flex justify-end">
                <Button onClick={bukaTambah}>
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Arahan
                </Button>
            </div>

            {rows.length === 0 ? (
                <p className="text-muted-foreground text-center text-sm">Belum ada arahan yang direkam.</p>
            ) : (
                <div className="space-y-3">
                    {rows.map((row) => (
                        <div key={row.id} className="rounded-md border">
                            <div className="bg-muted/30 flex flex-wrap items-start justify-between gap-3 border-b p-3">
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="font-semibold">
                                            {row.tahun_mulai === row.tahun_selesai
                                                ? `Tahun ${row.tahun_mulai}`
                                                : `Tahun ${row.tahun_mulai} s.d. ${row.tahun_selesai}`}
                                        </span>
                                        <Badge variant="outline">{jenisLabel[row.jenis] ?? row.jenis}</Badge>
                                        {row.status === 'berlaku' ? (
                                            <Badge className="bg-emerald-600 hover:bg-emerald-600">Berlaku</Badge>
                                        ) : (
                                            <Badge variant="outline">Draf</Badge>
                                        )}
                                    </div>
                                    <p className="text-muted-foreground mt-1 text-sm">
                                        {row.nomor_se ? `Nomor ${row.nomor_se}` : 'Nomor SE belum diisi'}
                                        {row.tanggal_se ? ` · ${tgl(row.tanggal_se)}` : ''}
                                    </p>
                                    {row.catatan && <p className="mt-1 text-sm">{row.catatan}</p>}
                                </div>
                                <div className="flex shrink-0 items-center gap-1.5">
                                    <Button variant="outline" size="sm" onClick={() => bukaTahapan(row, null)}>
                                        <Plus className="mr-1.5 h-3.5 w-3.5" />
                                        Tahapan
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => bukaEdit(row)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <Trash2 className="text-destructive h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Hapus arahan ini?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Seluruh tahapan di dalamnya ikut terhapus, dan jadwal pada Dasbor tidak lagi menampilkannya.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                                <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => hapus(row)}>
                                                    Hapus
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </div>

                            {row.tahapan.length === 0 ? (
                                <p className="text-muted-foreground p-3 text-sm">
                                    Belum ada tahapan. Tanpa tahapan, arahan ini tidak memunculkan apa pun di jadwal Dasbor.
                                </p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-sm">
                                        <thead className="bg-muted/50">
                                            <tr>
                                                <th className="border px-3 py-2 text-left font-semibold">Tahapan</th>
                                                <th className="border px-3 py-2 text-left font-semibold">Dokumen Pemicu</th>
                                                <th className="border px-3 py-2 text-left font-semibold">Mulai</th>
                                                <th className="border px-3 py-2 text-left font-semibold">Selesai</th>
                                                <th className="border px-3 py-2 text-left font-semibold">Pelaksana</th>
                                                <th className="border px-3 py-2 text-left font-semibold">Keluaran</th>
                                                <th className="border px-3 py-2 text-left font-semibold">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {row.tahapan.map((t) => (
                                                <tr key={t.id}>
                                                    <td className="border px-3 py-2 align-top font-medium">{t.tahapan}</td>
                                                    <td className="border px-3 py-2 align-top">{t.dokumen_pemicu || '—'}</td>
                                                    <td className="border px-3 py-2 align-top">{tgl(t.tanggal_mulai) || '—'}</td>
                                                    <td className="border px-3 py-2 align-top">{tgl(t.tanggal_selesai) || '—'}</td>
                                                    <td className="border px-3 py-2 align-top">{t.pelaksana || '—'}</td>
                                                    <td className="border px-3 py-2 align-top">{t.keluaran || '—'}</td>
                                                    <td className="border px-3 py-2 align-top">
                                                        <div className="flex items-center gap-1">
                                                            <Button variant="ghost" size="icon" onClick={() => bukaTahapan(row, t)}>
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" onClick={() => hapusTahapan(t)}>
                                                                <Trash2 className="text-destructive h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editing ? 'Edit Arahan' : 'Tambah Arahan'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                        <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                                <Label>Jenis Arahan</Label>
                                <FieldInfoPopover text={ARAHAN_FIELD_INFO.jenis} />
                            </div>
                            <Select value={String(form.jenis)} onValueChange={(v) => setForm((f) => ({ ...f, jenis: v }))}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(jenisLabel).map(([k, v]) => (
                                        <SelectItem key={k} value={k}>
                                            {v}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                    <Label>Tahun Mulai</Label>
                                    <FieldInfoPopover text={ARAHAN_FIELD_INFO.periode} />
                                </div>
                                <Input
                                    type="number"
                                    value={String(form.tahun_mulai ?? '')}
                                    onChange={(e) => setForm((f) => ({ ...f, tahun_mulai: Number(e.target.value) }))}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label>Tahun Selesai</Label>
                                <Input
                                    type="number"
                                    value={String(form.tahun_selesai ?? '')}
                                    onChange={(e) => setForm((f) => ({ ...f, tahun_selesai: Number(e.target.value) }))}
                                />
                                <p className="text-muted-foreground text-xs">Untuk arahan 1 tahunan, isi sama dengan Tahun Mulai.</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                    <Label>Nomor Surat Edaran</Label>
                                    <FieldInfoPopover text={ARAHAN_FIELD_INFO.surat_edaran} />
                                </div>
                                <Input
                                    value={String(form.nomor_se ?? '')}
                                    onChange={(e) => setForm((f) => ({ ...f, nomor_se: e.target.value }))}
                                    placeholder="mis. SE-700/123/2026"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label>Tanggal Surat Edaran</Label>
                                <Input
                                    type="date"
                                    value={String(form.tanggal_se ?? '')}
                                    onChange={(e) => setForm((f) => ({ ...f, tanggal_se: e.target.value }))}
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label>Dasar Hukum</Label>
                            <Textarea
                                rows={2}
                                value={String(form.dasar_hukum ?? '')}
                                onChange={(e) => setForm((f) => ({ ...f, dasar_hukum: e.target.value }))}
                                placeholder="mis. Peraturan Bupati Aceh Barat Nomor ... tentang Pedoman Penerapan Manajemen Risiko"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label>Catatan</Label>
                            <Textarea
                                rows={2}
                                value={String(form.catatan ?? '')}
                                onChange={(e) => setForm((f) => ({ ...f, catatan: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                                <Label>Status</Label>
                                <FieldInfoPopover text={ARAHAN_FIELD_INFO.status} />
                            </div>
                            <Select value={String(form.status)} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draf">Draf &mdash; belum ditetapkan, tidak muncul di Dasbor</SelectItem>
                                    <SelectItem value="berlaku">Berlaku &mdash; menjadi jadwal resmi di Dasbor</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                            Batal
                        </Button>
                        <Button onClick={simpan} disabled={processing}>
                            <Save className="mr-2 h-4 w-4" />
                            Simpan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={!!tahapanDialog} onOpenChange={(o) => !o && setTahapanDialog(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{tahapanDialog?.tahapan ? 'Edit Tahapan' : 'Tambah Tahapan'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                        <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                                <Label>Tahapan</Label>
                                <FieldInfoPopover text={ARAHAN_FIELD_INFO.tahapan} />
                            </div>
                            <Input
                                value={String(tahapanForm.tahapan ?? '')}
                                onChange={(e) => setTahapanForm((f) => ({ ...f, tahapan: e.target.value }))}
                                placeholder="mis. Penilaian Risiko Operasional OPD"
                            />
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                                <Label>Dokumen Pemicu</Label>
                                <FieldInfoPopover text={ARAHAN_FIELD_INFO.dokumen_pemicu} />
                            </div>
                            <Input
                                value={String(tahapanForm.dokumen_pemicu ?? '')}
                                onChange={(e) => setTahapanForm((f) => ({ ...f, dokumen_pemicu: e.target.value }))}
                                placeholder="mis. RKA OPD"
                            />
                            <p className="text-muted-foreground text-xs">
                                Dokumen perencanaan yang memicu tahapan ini. Perdep menyatakan tenggat penilaian risiko relatif terhadap dokumen
                                tersebut, misalnya dua minggu setelah RKA OPD disusun.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                    <Label>Tanggal Mulai</Label>
                                    <FieldInfoPopover text={ARAHAN_FIELD_INFO.tenggat} />
                                </div>
                                <Input
                                    type="date"
                                    value={String(tahapanForm.tanggal_mulai ?? '')}
                                    onChange={(e) => setTahapanForm((f) => ({ ...f, tanggal_mulai: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label>Tanggal Selesai</Label>
                                <Input
                                    type="date"
                                    value={String(tahapanForm.tanggal_selesai ?? '')}
                                    onChange={(e) => setTahapanForm((f) => ({ ...f, tanggal_selesai: e.target.value }))}
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                                <Label>Pelaksana</Label>
                                <FieldInfoPopover text={ARAHAN_FIELD_INFO.pelaksana} />
                            </div>
                            <Input
                                value={String(tahapanForm.pelaksana ?? '')}
                                onChange={(e) => setTahapanForm((f) => ({ ...f, pelaksana: e.target.value }))}
                                placeholder="mis. Seluruh OPD, difasilitasi Inspektorat"
                            />
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                                <Label>Keluaran</Label>
                                <FieldInfoPopover text={ARAHAN_FIELD_INFO.keluaran} />
                            </div>
                            <Input
                                value={String(tahapanForm.keluaran ?? '')}
                                onChange={(e) => setTahapanForm((f) => ({ ...f, keluaran: e.target.value }))}
                                placeholder="mis. Dokumen Penilaian Risiko Operasional OPD"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setTahapanDialog(null)}>
                            Batal
                        </Button>
                        <Button onClick={simpanTahapan} disabled={processing}>
                            <Save className="mr-2 h-4 w-4" />
                            Simpan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
