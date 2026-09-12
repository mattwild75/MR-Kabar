import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { toast } from 'sonner';

interface Employee {
    id: number;
    nama: string;
    nip: string | null;
    pangkat: string | null;
    golongan: string | null;
}

interface Setting {
    tarif_per_hari: number;
    inspektur_employee_id: number | null;
    inspektur: Employee | null;
}

interface Props {
    setting: Setting;
    employees: Employee[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'ERPIKA', href: '#' },
    { title: 'Perencanaan', href: '#' },
    { title: 'Pengaturan RPP', href: '/rpp-pengaturan' },
];

/**
 * Pengaturan RPP: tarif per hari dan Inspektur penanda tangan.
 *
 * Tanda tangan Cetak RPP membaca nama dan NIP Inspektur dari sini; selama
 * kosong, cetakannya berbunyi "............". Daftar pegawainya sendiri ada di
 * ERPIKA → Pegawai — milik seluruh ERPIKA, bukan RPP saja.
 */
export default function Pengaturan({ setting, employees }: Props) {
    const pengaturan = useForm({
        tarif_per_hari: setting.tarif_per_hari,
        inspektur_employee_id: setting.inspektur_employee_id ? String(setting.inspektur_employee_id) : '',
    });

    const simpanPengaturan = (e: React.FormEvent) => {
        e.preventDefault();
        pengaturan.put('/rpp-pengaturan', {
            preserveScroll: true,
            onSuccess: () => toast.success('Pengaturan RPP disimpan.'),
            onError: () => toast.error('Gagal menyimpan pengaturan.'),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pengaturan RPP" />

            <div className="space-y-6 p-4">
                <div>
                    <h1 className="text-2xl font-bold">Pengaturan RPP</h1>
                    <p className="text-muted-foreground text-sm">Tarif per hari dan Inspektur penanda tangan RPP.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Pengaturan Cetak</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={simpanPengaturan} className="grid gap-4 md:grid-cols-3">
                            <div>
                                <Label htmlFor="tarif">Tarif per hari (Rp)</Label>
                                <Input
                                    id="tarif"
                                    type="number"
                                    min={0}
                                    value={pengaturan.data.tarif_per_hari}
                                    onChange={(e) => pengaturan.setData('tarif_per_hari', Number(e.target.value))}
                                />
                                {pengaturan.errors.tarif_per_hari && <p className="text-destructive text-xs">{pengaturan.errors.tarif_per_hari}</p>}
                            </div>
                            <div className="md:col-span-2">
                                <Label>Inspektur (penanda tangan RPP)</Label>
                                <Select
                                    value={pengaturan.data.inspektur_employee_id || 'kosong'}
                                    onValueChange={(v) => pengaturan.setData('inspektur_employee_id', v === 'kosong' ? '' : v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih pegawai" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="kosong">— belum ditetapkan —</SelectItem>
                                        {employees.map((e) => (
                                            <SelectItem key={e.id} value={String(e.id)}>
                                                {e.nama}
                                                {e.nip ? ` · ${e.nip}` : ' · tanpa NIP'}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {setting.inspektur && !setting.inspektur.nip && (
                                    <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
                                        Inspektur terpilih belum punya NIP — di cetakan, NIP-nya akan berbunyi "............". Lengkapi di{' '}
                                        <Link href="/erpika/pegawai" className="underline">
                                            ERPIKA → Pegawai
                                        </Link>
                                        .
                                    </p>
                                )}
                            </div>
                            <div className="md:col-span-3">
                                <Button type="submit" disabled={pengaturan.processing}>
                                    Simpan Pengaturan
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
