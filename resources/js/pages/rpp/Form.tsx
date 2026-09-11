import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import React from 'react';

interface RppCategory {
    id: number;
    code: string;
    name: string;
}

interface Employee {
    id: number;
    nama: string;
    nip: string | null;
    pangkat: string | null;
    golongan: string | null;
}

type TeamMember = {
    employee_id: string;
    role: 'koordinator' | 'ppj' | 'ketua_tim' | 'anggota_tim';
    nama: string;
    nip: string;
    pangkat: string;
    golongan: string;
    hari_kantor: string;
    hari_lapangan: string;
};

type Obrik = {
    nama: string;
};

type Laporan = {
    nomor_laporan: string;
    tanggal_laporan: string;
};

interface RppData {
    id?: number;
    rpp_category_id?: number;
    year?: number;
    bulan?: number;
    nomor_rpp?: string;
    tanggal_rpp?: string;
    nomor_st?: string;
    tanggal_st?: string;
    uraian?: string;
    surat_dasar_uraian?: string;
    masa_tugas_mulai?: string;
    masa_tugas_selesai?: string;
    capaian_output?: string;
    status?: string;
    team_members?: {
        employee_id: number | null;
        role: string;
        nama: string;
        nip: string | null;
        pangkat: string | null;
        golongan: string | null;
        hari_kantor: number | null;
        hari_lapangan: number | null;
    }[];
    obriks?: { nama: string }[];
    laporans?: { nomor_laporan: string; tanggal_laporan: string | null }[];
}

interface Props {
    rpp?: RppData;
    categories: RppCategory[];
    employees: Employee[];
}

const bulanOptions = [
    { value: '1', label: 'Januari' },
    { value: '2', label: 'Februari' },
    { value: '3', label: 'Maret' },
    { value: '4', label: 'April' },
    { value: '5', label: 'Mei' },
    { value: '6', label: 'Juni' },
    { value: '7', label: 'Juli' },
    { value: '8', label: 'Agustus' },
    { value: '9', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Desember' },
];

const roleLabel: Record<string, string> = {
    koordinator: 'Koordinator',
    ppj: 'PPJ',
    ketua_tim: 'Ketua Tim',
    anggota_tim: 'Anggota Tim',
};

const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'st_terbit', label: 'ST Terbit' },
    { value: 'selesai', label: 'Selesai' },
    { value: 'lhp_terbit', label: 'LHP Terbit' },
];

/**
 * Bentuk isian formulir. `type`, bukan `interface`, dan dengan tanda tangan
 * indeks — Inertia v2 di MR Kabar menuntut isian useForm memenuhi
 * FormDataType, dan hanya alias tipe yang mendapat indeks implisit.
 */
type RppFormData = {
    rpp_category_id: string;
    year: number;
    bulan: string;
    nomor_rpp: string;
    tanggal_rpp: string;
    nomor_st: string;
    tanggal_st: string;
    uraian: string;
    surat_dasar_uraian: string;
    masa_tugas_mulai: string;
    masa_tugas_selesai: string;
    capaian_output: string;
    status: string;
    team_members: TeamMember[];
    obriks: Obrik[];
    laporans: Laporan[];
    [key: string]: string | number | TeamMember[] | Obrik[] | Laporan[];
};

export default function RppForm({ rpp, categories, employees }: Props) {
    const isEdit = !!rpp;
    const currentYear = new Date().getFullYear();

    const { data, setData, post, put, processing, errors } = useForm<RppFormData>({
        rpp_category_id: rpp?.rpp_category_id ? String(rpp.rpp_category_id) : '',
        year: rpp?.year ?? currentYear,
        bulan: rpp?.bulan ? String(rpp.bulan) : '',
        nomor_rpp: rpp?.nomor_rpp || '',
        tanggal_rpp: rpp?.tanggal_rpp || '',
        nomor_st: rpp?.nomor_st || '',
        tanggal_st: rpp?.tanggal_st || '',
        uraian: rpp?.uraian || '',
        surat_dasar_uraian: rpp?.surat_dasar_uraian || '',
        masa_tugas_mulai: rpp?.masa_tugas_mulai || '',
        masa_tugas_selesai: rpp?.masa_tugas_selesai || '',
        capaian_output: rpp?.capaian_output || '',
        status: rpp?.status || 'draft',
        team_members: (rpp?.team_members || []).map((m) => ({
            employee_id: m.employee_id?.toString() ?? '',
            role: m.role as TeamMember['role'],
            nama: m.nama,
            nip: m.nip ?? '',
            pangkat: m.pangkat ?? '',
            golongan: m.golongan ?? '',
            hari_kantor: m.hari_kantor?.toString() ?? '',
            hari_lapangan: m.hari_lapangan?.toString() ?? '',
        })) as TeamMember[],
        obriks: (rpp?.obriks || []).map((o) => ({ nama: o.nama })) as Obrik[],
        laporans: (rpp?.laporans || []).map((l) => ({
            nomor_laporan: l.nomor_laporan,
            tanggal_laporan: l.tanggal_laporan || '',
        })) as Laporan[],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit) {
            put(`/rpp/${rpp?.id}`);
        } else {
            post('/rpp');
        }
    };

    const addTeamMember = () => {
        setData('team_members', [
            ...data.team_members,
            {
                employee_id: '',
                role: 'anggota_tim',
                nama: '',
                nip: '',
                pangkat: '',
                golongan: '',
                hari_kantor: '',
                hari_lapangan: '',
            },
        ]);
    };
    const updateTeamMember = (i: number, field: keyof TeamMember, value: string) => {
        const rows = [...data.team_members];
        rows[i] = { ...rows[i], [field]: value };
        setData('team_members', rows);
    };
    const selectEmployee = (i: number, employeeId: string) => {
        const employee = employees.find((e) => String(e.id) === employeeId);
        const rows = [...data.team_members];
        rows[i] = {
            ...rows[i],
            employee_id: employeeId,
            nama: employee?.nama ?? rows[i].nama,
            nip: employee?.nip ?? '',
            pangkat: employee?.pangkat ?? '',
            golongan: employee?.golongan ?? '',
        };
        setData('team_members', rows);
    };
    const removeTeamMember = (i: number) => {
        setData(
            'team_members',
            data.team_members.filter((_, idx) => idx !== i),
        );
    };

    const addObrik = () => setData('obriks', [...data.obriks, { nama: '' }]);
    const updateObrik = (i: number, value: string) => {
        const rows = [...data.obriks];
        rows[i] = { nama: value };
        setData('obriks', rows);
    };
    const removeObrik = (i: number) =>
        setData(
            'obriks',
            data.obriks.filter((_, idx) => idx !== i),
        );

    const addLaporan = () => setData('laporans', [...data.laporans, { nomor_laporan: '', tanggal_laporan: '' }]);
    const updateLaporan = (i: number, field: keyof Laporan, value: string) => {
        const rows = [...data.laporans];
        rows[i] = { ...rows[i], [field]: value };
        setData('laporans', rows);
    };
    const removeLaporan = (i: number) =>
        setData(
            'laporans',
            data.laporans.filter((_, idx) => idx !== i),
        );

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Perencanaan', href: '#' },
        { title: 'Input RPP', href: '/rpp' },
        { title: isEdit ? 'Edit RPP' : 'Tambah RPP', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEdit ? 'Edit RPP' : 'Tambah RPP'} />
            <div className="flex-1 p-4 md:p-6">
                <Card className="mx-auto max-w-4xl">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-2xl font-bold tracking-tight">{isEdit ? 'Edit RPP' : 'Tambah RPP'}</CardTitle>
                        <p className="text-muted-foreground text-sm">Rencana Program Pengawasan &amp; realisasi penugasan.</p>
                    </CardHeader>

                    <Separator />

                    <CardContent className="pt-5">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Data Pokok */}
                            <div className="space-y-4">
                                <h3 className="font-medium">Data Pokok</h3>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <Label className="mb-2 block">Sifat Audit</Label>
                                        <Select value={data.rpp_category_id} onValueChange={(v) => setData('rpp_category_id', v)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih sifat audit" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((cat) => (
                                                    <SelectItem key={cat.id} value={String(cat.id)}>
                                                        {cat.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.rpp_category_id && <p className="mt-2 text-sm text-red-500">{errors.rpp_category_id}</p>}
                                    </div>

                                    <div>
                                        <Label className="mb-2 block">Tahun</Label>
                                        <Input
                                            type="number"
                                            value={data.year}
                                            onChange={(e) => setData('year', Number(e.target.value))}
                                            className={errors.year ? 'border-red-500' : ''}
                                        />
                                        {errors.year && <p className="mt-2 text-sm text-red-500">{errors.year}</p>}
                                    </div>

                                    <div>
                                        <Label className="mb-2 block">Bulan (Opsional)</Label>
                                        <Select value={data.bulan} onValueChange={(v) => setData('bulan', v)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih bulan" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {bulanOptions.map((b) => (
                                                    <SelectItem key={b.value} value={b.value}>
                                                        {b.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label className="mb-2 block">Nomor RPP</Label>
                                        <Input
                                            placeholder="700/01/RPP-Rev/INS/2024"
                                            value={data.nomor_rpp}
                                            onChange={(e) => setData('nomor_rpp', e.target.value)}
                                            className={errors.nomor_rpp ? 'border-red-500' : ''}
                                        />
                                        {errors.nomor_rpp && <p className="mt-2 text-sm text-red-500">{errors.nomor_rpp}</p>}
                                    </div>

                                    <div>
                                        <Label className="mb-2 block">Tanggal RPP</Label>
                                        <Input type="date" value={data.tanggal_rpp} onChange={(e) => setData('tanggal_rpp', e.target.value)} />
                                    </div>

                                    <div>
                                        <Label className="mb-2 block">Nomor ST (Opsional)</Label>
                                        <Input
                                            placeholder="ST-01/Rev-INS/2024"
                                            value={data.nomor_st}
                                            onChange={(e) => setData('nomor_st', e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <Label className="mb-2 block">Tanggal ST</Label>
                                        <Input type="date" value={data.tanggal_st} onChange={(e) => setData('tanggal_st', e.target.value)} />
                                    </div>

                                    <div>
                                        <Label className="mb-2 block">Masa Tugas Mulai</Label>
                                        <Input
                                            type="date"
                                            value={data.masa_tugas_mulai}
                                            onChange={(e) => setData('masa_tugas_mulai', e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <Label className="mb-2 block">Masa Tugas Selesai</Label>
                                        <Input
                                            type="date"
                                            value={data.masa_tugas_selesai}
                                            onChange={(e) => setData('masa_tugas_selesai', e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <Label className="mb-2 block">Status</Label>
                                        <Select value={data.status} onValueChange={(v) => setData('status', v)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {statusOptions.map((s) => (
                                                    <SelectItem key={s.value} value={s.value}>
                                                        {s.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label className="mb-2 block">Capaian Output (Opsional)</Label>
                                        <Input value={data.capaian_output} onChange={(e) => setData('capaian_output', e.target.value)} />
                                    </div>
                                </div>

                                <div>
                                    <Label className="mb-2 block">Uraian</Label>
                                    <Textarea rows={3} value={data.uraian} onChange={(e) => setData('uraian', e.target.value)} />
                                </div>

                                <div>
                                    <Label className="mb-2 block">Dasar Surat Pengantar (Opsional)</Label>
                                    <Textarea
                                        rows={3}
                                        placeholder="Mis. Surat Kepala Dinas ... Nomor: ... Tanggal ... Perihal ... (kosongkan utk pakai rujukan PKPT default)"
                                        value={data.surat_dasar_uraian}
                                        onChange={(e) => setData('surat_dasar_uraian', e.target.value)}
                                    />
                                    <p className="text-muted-foreground mt-1 text-xs">
                                        Dipakai sebagai paragraf pembuka dokumen Cetak &gt; Surat Pengantar.
                                    </p>
                                </div>
                            </div>

                            <Separator />

                            {/* Obrik */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-medium">Objek Pemeriksaan (Obrik)</h3>
                                    <Button type="button" size="sm" variant="outline" onClick={addObrik}>
                                        + Tambah Obrik
                                    </Button>
                                </div>
                                {data.obriks.length === 0 && <p className="text-muted-foreground text-sm">Belum ada obrik ditambahkan.</p>}
                                {data.obriks.map((obrik, i) => (
                                    <div key={i} className="flex gap-2">
                                        <Input placeholder="Nama obrik / OPD" value={obrik.nama} onChange={(e) => updateObrik(i, e.target.value)} />
                                        <Button type="button" size="sm" variant="ghost" onClick={() => removeObrik(i)}>
                                            Hapus
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            <Separator />

                            {/* Tim */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-medium">Tim Penugasan</h3>
                                    <Button type="button" size="sm" variant="outline" onClick={addTeamMember}>
                                        + Tambah Anggota
                                    </Button>
                                </div>
                                {data.team_members.length === 0 && (
                                    <p className="text-muted-foreground text-sm">Belum ada anggota tim ditambahkan.</p>
                                )}
                                {data.team_members.map((member, i) => (
                                    <div key={i} className="space-y-2 rounded-md border p-3">
                                        <div className="grid grid-cols-1 items-center gap-2 md:grid-cols-[140px_1fr_100px_100px_auto]">
                                            <Select value={member.role} onValueChange={(v) => updateTeamMember(i, 'role', v)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.entries(roleLabel).map(([value, label]) => (
                                                        <SelectItem key={value} value={value}>
                                                            {label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Select value={member.employee_id} onValueChange={(v) => selectEmployee(i, v)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih pegawai (opsional)" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {employees.map((emp) => (
                                                        <SelectItem key={emp.id} value={String(emp.id)}>
                                                            {emp.nama}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Input
                                                type="number"
                                                placeholder="Hari DK"
                                                value={member.hari_kantor}
                                                onChange={(e) => updateTeamMember(i, 'hari_kantor', e.target.value)}
                                            />
                                            <Input
                                                type="number"
                                                placeholder="Hari LK"
                                                value={member.hari_lapangan}
                                                onChange={(e) => updateTeamMember(i, 'hari_lapangan', e.target.value)}
                                            />
                                            <Button type="button" size="sm" variant="ghost" onClick={() => removeTeamMember(i)}>
                                                Hapus
                                            </Button>
                                        </div>
                                        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                                            <Input
                                                placeholder="Nama"
                                                value={member.nama}
                                                onChange={(e) => updateTeamMember(i, 'nama', e.target.value)}
                                            />
                                            <Input
                                                placeholder="NIP"
                                                value={member.nip}
                                                onChange={(e) => updateTeamMember(i, 'nip', e.target.value)}
                                            />
                                            <div className="flex gap-2">
                                                <Input
                                                    placeholder="Pangkat"
                                                    value={member.pangkat}
                                                    onChange={(e) => updateTeamMember(i, 'pangkat', e.target.value)}
                                                />
                                                <Input
                                                    placeholder="Gol. (mis. IV/b)"
                                                    value={member.golongan}
                                                    onChange={(e) => updateTeamMember(i, 'golongan', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <p className="text-muted-foreground text-xs">
                                            Mengubah nama/NIP/pangkat/golongan di sini akan memperbarui data pegawai ini di seluruh RPP lain yang
                                            memakainya (data pegawai bersama).
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <Separator />

                            {/* Laporan */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-medium">Laporan (LHP)</h3>
                                    <Button type="button" size="sm" variant="outline" onClick={addLaporan}>
                                        + Tambah Laporan
                                    </Button>
                                </div>
                                {data.laporans.length === 0 && <p className="text-muted-foreground text-sm">Belum ada laporan ditambahkan.</p>}
                                {data.laporans.map((laporan, i) => (
                                    <div key={i} className="grid grid-cols-1 items-center gap-2 md:grid-cols-[1fr_180px_auto]">
                                        <Input
                                            placeholder="Nomor laporan"
                                            value={laporan.nomor_laporan}
                                            onChange={(e) => updateLaporan(i, 'nomor_laporan', e.target.value)}
                                        />
                                        <Input
                                            type="date"
                                            value={laporan.tanggal_laporan}
                                            onChange={(e) => updateLaporan(i, 'tanggal_laporan', e.target.value)}
                                        />
                                        <Button type="button" size="sm" variant="ghost" onClick={() => removeLaporan(i)}>
                                            Hapus
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            <Separator />

                            <div className="flex flex-col-reverse justify-end gap-3 pt-2 sm:flex-row">
                                <Link href="/rpp" className="w-full sm:w-auto">
                                    <Button type="button" variant="secondary" className="w-full">
                                        Kembali
                                    </Button>
                                </Link>
                                <Button type="submit" disabled={processing} className="w-full sm:w-auto">
                                    {processing ? <span className="animate-pulse">Menyimpan...</span> : isEdit ? 'Simpan Perubahan' : 'Simpan RPP'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
