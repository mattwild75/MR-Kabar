import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { toast } from 'sonner';

interface Props {
    setting: { tarif_per_hari: number };
    inspektur: { id: number; nama: string; nip: string | null; pangkat: string | null; golongan: string | null } | null;
}

type FormPengaturan = { tarif_per_hari: number; [key: string]: number };

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'ERPIKA', href: '#' },
    { title: 'Perencanaan', href: '#' },
    { title: 'Pengaturan RPP', href: '/rpp-pengaturan' },
];

/**
 * Pengaturan RPP: tarif per hari baku. Penanda tangan tidak dipilih di sini —
 * hanya Inspektur, yaitu pegawai berjabatan "Inspektur" di ERPIKA > Pegawai.
 */
export default function Pengaturan({ setting, inspektur }: Props) {
    const form = useForm<FormPengaturan>({ tarif_per_hari: setting.tarif_per_hari });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pengaturan RPP" />
            <div className="space-y-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-bold">Pengaturan RPP</h1>
                    <p className="text-muted-foreground text-sm">Nilai baku yang dipakai semua dokumen RPP.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Tarif per hari</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="max-w-xs space-y-1">
                            <Label htmlFor="tarif">Rupiah per orang per hari</Label>
                            <Input id="tarif" type="number" min={0} value={form.data.tarif_per_hari} onChange={(e) => form.setData('tarif_per_hari', Number(e.target.value))} />
                            <p className="text-muted-foreground text-xs">Dipakai bila dokumen RPP atau anggota tim tidak menetapkan tarifnya sendiri.</p>
                        </div>
                        <Button onClick={() => form.put('/rpp-pengaturan', { preserveScroll: true, onSuccess: () => toast.success('Pengaturan disimpan.') })} disabled={form.processing}>
                            Simpan
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Penanda tangan</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        {inspektur ? (
                            <>
                                <div className="font-medium">{inspektur.nama}</div>
                                <div className="text-muted-foreground">
                                    Inspektur · NIP {inspektur.nip ?? <span className="text-destructive">belum diisi</span>}
                                    {inspektur.pangkat && ` · ${inspektur.pangkat}${inspektur.golongan ? ` (${inspektur.golongan})` : ''}`}
                                </div>
                            </>
                        ) : (
                            <div className="text-destructive">Belum ada pegawai berjabatan Inspektur — cetakan RPP akan bertitik-titik.</div>
                        )}
                        <p className="text-muted-foreground text-xs">
                            Semua tabel dan surat pengantar RPP ditandatangani Inspektur; tidak ada pilihan lain. Untuk menggantinya, ubah jabatan pegawai di{' '}
                            <Link href="/erpika/pegawai" className="underline">
                                ERPIKA → Pegawai
                            </Link>
                            .
                        </p>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
