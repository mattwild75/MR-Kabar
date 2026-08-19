import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

type Signatory = {
    jabatan: string;
    nama: string;
    nip: string;
};

interface MultiPenandatanganEditorProps {
    dataUmumId: number;
    penandatangan: Signatory[];
    tempatPembuatan: string;
    tanggalPembuatan: string;
    kepalaJabatan: string;
    kepalaJabatanField: 'jabatan_kepala_daerah' | 'jabatan_kepala_dinas';
    kepalaNama: string;
    kepalaNamaField: 'nama_kepala_daerah' | 'nama_kepala_dinas';
    /** NIP Kepala HANYA ada utk Kepala Dinas (Form 6, atau Form 7 discope 1 OPD) — Kepala Daerah/Bupati tidak punya NIP. */
    kepalaNip?: string;
}

// Bentuk form Kepala EKSPLISIT mencakup KEDUA kemungkinan nama field,
// SEMUA required string (default '' bila tidak dipakai) — sama pola &
// alasan dgn TtdFormData di ttd-editor.tsx (optional (?:) tidak memenuhi
// constraint Record<string, FormDataConvertible> milik useForm<T>() Inertia).
type KepalaFormData = {
    tempat_pembuatan: string;
    tanggal_pembuatan: string;
    jabatan_kepala_daerah: string;
    jabatan_kepala_dinas: string;
    nama_kepala_daerah: string;
    nama_kepala_dinas: string;
    nip_kepala_dinas: string;
};

// Editor gabungan utk blok MultiPenandatangan (Form Cetak 6 & 7): kolom
// "tengah" (penandatangan[] — Sekretaris/Kepala Bidang dkk, dinamis
// tambah/hapus) DISIMPAN via endpoint khusus (PATCH data-umum/{id}/
// penandatangan), sedangkan kolom Kepala OPD/Daerah (paling kanan) + tempat/
// tanggal pembuatan DISIMPAN via endpoint updateTtd yg sudah ada (dipakai
// bersama Form 2a/2b/2c) — dua permintaan terpisah krn keduanya menyasar
// field yg berbeda di baris DataUmum yg SAMA, disatukan di 1 tombol Simpan
// supaya dari sisi user terasa 1 form saja. Dua arah PENUH dgn menu Data
// Umum: mengedit di sini menyimpan PERMANEN ke DataUmum, sehingga menu Data
// Umum & Form 1c CEE (yg sinkron dgn baris "Sekretaris" yg sama) ikut
// terupdate, dan sebaliknya.
export function MultiPenandatanganEditor({
    dataUmumId,
    penandatangan,
    tempatPembuatan,
    tanggalPembuatan,
    kepalaJabatan,
    kepalaJabatanField,
    kepalaNama,
    kepalaNamaField,
    kepalaNip,
}: MultiPenandatanganEditorProps) {
    const [editing, setEditing] = useState(false);

    const kepalaForm = useForm<KepalaFormData>({
        tempat_pembuatan: tempatPembuatan,
        tanggal_pembuatan: tanggalPembuatan,
        jabatan_kepala_daerah: '',
        jabatan_kepala_dinas: '',
        nama_kepala_daerah: '',
        nama_kepala_dinas: '',
        nip_kepala_dinas: '',
        [kepalaJabatanField]: kepalaJabatan,
        [kepalaNamaField]: kepalaNama,
        ...(kepalaNip !== undefined ? { nip_kepala_dinas: kepalaNip } : {}),
    });

    const tengahForm = useForm<{ penandatangan: Signatory[] }>({
        penandatangan: penandatangan.length ? penandatangan : [],
    });

    const signatories = tengahForm.data.penandatangan;

    const addSignatory = () => {
        tengahForm.setData('penandatangan', [...signatories, { jabatan: '', nama: '', nip: '' }]);
    };

    const removeSignatory = (index: number) => {
        tengahForm.setData(
            'penandatangan',
            signatories.filter((_, i) => i !== index),
        );
    };

    const updateSignatory = (index: number, key: keyof Signatory, value: string) => {
        tengahForm.setData(
            'penandatangan',
            signatories.map((s, i) => (i === index ? { ...s, [key]: value } : s)),
        );
    };

    const processing = kepalaForm.processing || tengahForm.processing;

    const simpan = () => {
        kepalaForm.patch(`/cetak/risiko/ttd/${dataUmumId}`, {
            preserveScroll: true,
            onSuccess: () => {
                tengahForm.patch(`/data-umum/${dataUmumId}/penandatangan`, {
                    preserveScroll: true,
                    onSuccess: () => setEditing(false),
                });
            },
        });
    };

    if (!editing) {
        return (
            <div className="bg-background text-foreground print:hidden">
                <Button type="button" variant="outline" size="sm" onClick={() => setEditing(true)}>
                    <Pencil className="mr-2 size-3.5" />
                    Edit Penanda Tangan
                </Button>
            </div>
        );
    }

    return (
        <div className="bg-background text-foreground mt-2 space-y-4 rounded-md border p-4 print:hidden">
            <div className="space-y-2">
                <p className="text-sm font-medium">Kepala (kolom paling kanan)</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                        <Label>Tempat</Label>
                        <Input value={kepalaForm.data.tempat_pembuatan} onChange={(e) => kepalaForm.setData('tempat_pembuatan', e.target.value)} />
                    </div>
                    <div className="space-y-1">
                        <Label>Tanggal</Label>
                        <Input
                            type="date"
                            value={kepalaForm.data.tanggal_pembuatan}
                            onChange={(e) => kepalaForm.setData('tanggal_pembuatan', e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label>Jabatan</Label>
                        <Input value={kepalaForm.data[kepalaJabatanField]} onChange={(e) => kepalaForm.setData(kepalaJabatanField, e.target.value)} />
                    </div>
                    <div className="space-y-1">
                        <Label>Nama</Label>
                        <Input value={kepalaForm.data[kepalaNamaField]} onChange={(e) => kepalaForm.setData(kepalaNamaField, e.target.value)} />
                    </div>
                    {kepalaNip !== undefined && (
                        <div className="space-y-1">
                            <Label>NIP</Label>
                            <Input
                                value={kepalaForm.data.nip_kepala_dinas}
                                onChange={(e) => kepalaForm.setData('nip_kepala_dinas', e.target.value)}
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-2 border-t pt-3">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Kolom tengah (opsional, mis. Sekretaris/Kepala Bidang)</p>
                    <Button type="button" variant="outline" size="sm" onClick={addSignatory}>
                        <Plus className="mr-1.5 h-4 w-4" />
                        Tambah
                    </Button>
                </div>
                {signatories.length === 0 && (
                    <p className="text-muted-foreground text-sm">Belum ada. Klik &quot;Tambah&quot; untuk menambah kolom.</p>
                )}
                {signatories.map((s, i) => (
                    <div key={i} className="grid grid-cols-1 gap-2 rounded-md border p-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
                        <div className="space-y-1">
                            <Label className="text-xs">Jabatan</Label>
                            <Input value={s.jabatan} onChange={(e) => updateSignatory(i, 'jabatan', e.target.value)} placeholder="mis. Sekretaris" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Nama</Label>
                            <Input value={s.nama} onChange={(e) => updateSignatory(i, 'nama', e.target.value)} placeholder="Nama lengkap & gelar" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">NIP</Label>
                            <Input value={s.nip} onChange={(e) => updateSignatory(i, 'nip', e.target.value)} placeholder="NIP" />
                        </div>
                        <div className="flex items-end">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground hover:text-destructive"
                                title="Hapus"
                                onClick={() => removeSignatory(i)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex gap-2">
                <Button type="button" size="sm" disabled={processing} onClick={simpan}>
                    Simpan
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => setEditing(false)}>
                    Batal
                </Button>
            </div>
        </div>
    );
}
