import AutocompleteSelect from '@/components/ui/autocomplete-select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowDown, ArrowUp, Copy, Plus, Trash2, Users } from 'lucide-react';
import { useMemo } from 'react';
import { toast } from 'sonner';

interface Kategori {
    id: number;
    code: string;
    name: string;
    kode_nomor: string | null;
    sebutan: string | null;
}

interface Pegawai {
    id: number;
    nama: string;
    nip: string | null;
    pangkat: string | null;
    golongan: string | null;
    jabatan: string | null;
}

type Peran = 'pj' | 'wpj' | 'dalnis' | 'kt' | 'at';

type Anggota = {
    employee_id: number | null;
    role: Peran;
    peran_teks: string;
    nama: string;
    nip: string;
    pangkat: string;
    golongan: string;
    hari_kantor: number | '';
    hari_lapangan: number | '';
    tarif_per_hari: number | '';
};

type Laporan = { nomor_laporan: string; tanggal_laporan: string };

type Penugasan = {
    uraian: string;
    obriks_teks: string;
    sifat: string;
    jumlah_laporan: number | '';
    masa_tugas_mulai: string;
    masa_tugas_selesai: string;
    tmt_teks: string;
    nomor_sp: string;
    nomor_st: string;
    tanggal_st: string;
    nomor_kp: string;
    capaian_output: string;
    status: 'draft' | 'st_terbit' | 'selesai' | 'lhp_terbit';
    tim: Anggota[];
    laporans: Laporan[];
};

type FormRpp = {
    rpp_category_id: string;
    year: number;
    bulan: string;
    nomor_rpp: string;
    judul: string;
    sub_judul: string;
    tanggal_rpp: string;
    tarif_per_hari: number | '';
    tanggal_surat: string;
    surat_dasar_uraian: string;
    hal: string;
    tujuan_surat: string;
    dengan_penutup: boolean;
    penugasan: Penugasan[];
    [key: string]: string | number | boolean | Penugasan[];
};

interface RppMasuk {
    id: number;
    rpp_category_id: number;
    year: number;
    bulan: number | null;
    nomor_rpp: string;
    judul: string | null;
    sub_judul: string | null;
    tanggal_rpp: string | null;
    tarif_per_hari: number | null;
    tanggal_surat: string | null;
    surat_dasar_uraian: string | null;
    hal: string | null;
    tujuan_surat: string | null;
    dengan_penutup: boolean;
    penugasan: {
        uraian: string | null;
        sifat: string | null;
        jumlah_laporan: number | null;
        masa_tugas_mulai: string | null;
        masa_tugas_selesai: string | null;
        tmt_teks: string | null;
        nomor_sp: string | null;
        nomor_st: string | null;
        tanggal_st: string | null;
        nomor_kp: string | null;
        capaian_output: string | null;
        status: Penugasan['status'];
        obriks: string[];
        tim: {
            employee_id: number | null;
            role: Peran;
            peran_teks: string | null;
            nama: string;
            nip: string | null;
            pangkat: string | null;
            golongan: string | null;
            hari_kantor: number | null;
            hari_lapangan: number | null;
            tarif_per_hari: number | null;
        }[];
        laporans: Laporan[];
    }[];
}

interface Props {
    rpp: RppMasuk | null;
    categories: Kategori[];
    employees: Pegawai[];
    tarifBaku: number;
    inspektur: { id: number; nama: string; nip: string | null; pangkat: string | null; golongan: string | null } | null;
    sifatTersedia: string[];
    tahunBerjalan: number;
}

const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

const PERAN: Record<Peran, string> = {
    pj: 'Penanggung Jawab (PJ)',
    wpj: 'Wakil Penanggung Jawab (WPJ)',
    dalnis: 'Pengendali Teknis (Dalnis)',
    kt: 'Ketua Tim (KT)',
    at: 'Anggota Tim (AT)',
};

const STATUS: Record<Penugasan['status'], string> = { draft: 'Draft', st_terbit: 'ST terbit', selesai: 'Selesai', lhp_terbit: 'LHP terbit' };

const rupiah = (n: number) => 'Rp ' + n.toLocaleString('id-ID');

const anggotaKosong = (role: Peran = 'at'): Anggota => ({
    employee_id: null,
    role,
    peran_teks: '',
    nama: '',
    nip: '',
    pangkat: '',
    golongan: '',
    hari_kantor: 2,
    hari_lapangan: '',
    tarif_per_hari: '',
});

/**
 * Formulir satu dokumen RPP berikut penugasan-penugasannya — bentuknya
 * mengikuti berkas RPP*.xls: kepala dokumen, lalu tiap penugasan dengan
 * obrik, sifat, jumlah laporan, TMT, dan tim ber-DK/LK. Surat pengantarnya
 * diisi di kartu tersendiri; yang tidak diisi jatuh ke kalimat baku jenisnya.
 */
export default function RppForm({ rpp, categories, employees, tarifBaku, inspektur, sifatTersedia, tahunBerjalan }: Props) {
    const timBaku = (): Anggota[] => [
        inspektur
            ? {
                  ...anggotaKosong('pj'),
                  employee_id: inspektur.id,
                  nama: inspektur.nama,
                  nip: inspektur.nip ?? '',
                  pangkat: inspektur.pangkat ?? '',
                  golongan: inspektur.golongan ?? '',
                  hari_kantor: 1,
                  hari_lapangan: 1,
              }
            : anggotaKosong('pj'),
        { ...anggotaKosong('wpj'), hari_kantor: 1 },
        { ...anggotaKosong('dalnis'), hari_kantor: 1 },
        anggotaKosong('kt'),
        anggotaKosong('at'),
        anggotaKosong('at'),
    ];

    const penugasanKosong = (): Penugasan => ({
        uraian: '',
        obriks_teks: '',
        sifat: '',
        jumlah_laporan: 1,
        masa_tugas_mulai: '',
        masa_tugas_selesai: '',
        tmt_teks: '',
        nomor_sp: '',
        nomor_st: '',
        tanggal_st: '',
        nomor_kp: '',
        capaian_output: '',
        status: 'draft',
        tim: timBaku(),
        laporans: [],
    });

    const form = useForm<FormRpp>({
        rpp_category_id: rpp ? String(rpp.rpp_category_id) : '',
        year: rpp?.year ?? tahunBerjalan,
        bulan: rpp?.bulan ? String(rpp.bulan) : String(new Date().getMonth() + 1),
        nomor_rpp: rpp?.nomor_rpp ?? '',
        judul: rpp?.judul ?? '',
        sub_judul: rpp?.sub_judul ?? '',
        tanggal_rpp: rpp?.tanggal_rpp ?? '',
        tarif_per_hari: rpp?.tarif_per_hari ?? tarifBaku,
        tanggal_surat: rpp?.tanggal_surat ?? '',
        surat_dasar_uraian: rpp?.surat_dasar_uraian ?? '',
        hal: rpp?.hal ?? '',
        tujuan_surat: rpp?.tujuan_surat ?? '',
        dengan_penutup: rpp?.dengan_penutup ?? true,
        penugasan: rpp
            ? rpp.penugasan.map((p) => ({
                  uraian: p.uraian ?? '',
                  obriks_teks: p.obriks.join('\n'),
                  sifat: p.sifat ?? '',
                  jumlah_laporan: p.jumlah_laporan ?? '',
                  masa_tugas_mulai: p.masa_tugas_mulai ?? '',
                  masa_tugas_selesai: p.masa_tugas_selesai ?? '',
                  tmt_teks: p.tmt_teks ?? '',
                  nomor_sp: p.nomor_sp ?? '',
                  nomor_st: p.nomor_st ?? '',
                  tanggal_st: p.tanggal_st ?? '',
                  nomor_kp: p.nomor_kp ?? '',
                  capaian_output: p.capaian_output ?? '',
                  status: p.status,
                  tim: p.tim.map((m) => ({
                      employee_id: m.employee_id,
                      role: m.role,
                      peran_teks: m.peran_teks ?? '',
                      nama: m.nama,
                      nip: m.nip ?? '',
                      pangkat: m.pangkat ?? '',
                      golongan: m.golongan ?? '',
                      hari_kantor: m.hari_kantor ?? '',
                      hari_lapangan: m.hari_lapangan ?? '',
                      tarif_per_hari: m.tarif_per_hari ?? '',
                  })),
                  laporans: p.laporans,
              }))
            : [penugasanKosong()],
    });

    const { data, setData, errors, processing } = form;
    const kategori = categories.find((c) => String(c.id) === data.rpp_category_id);
    const namaPegawai = useMemo(() => employees.map((e) => e.nama), [employees]);

    // --- penolong ubah bersarang ------------------------------------------
    const ubahPenugasan = (i: number, ubah: Partial<Penugasan>) => {
        const daftar = [...data.penugasan];
        daftar[i] = { ...daftar[i], ...ubah };
        setData('penugasan', daftar);
    };
    const ubahAnggota = (i: number, j: number, ubah: Partial<Anggota>) => {
        const tim = [...data.penugasan[i].tim];
        tim[j] = { ...tim[j], ...ubah };
        ubahPenugasan(i, { tim });
    };
    const pilihPegawai = (i: number, j: number, nama: string) => {
        const e = employees.find((x) => x.nama === nama);
        ubahAnggota(
            i,
            j,
            e
                ? { employee_id: e.id, nama: e.nama, nip: e.nip ?? '', pangkat: e.pangkat ?? '', golongan: e.golongan ?? '' }
                : { employee_id: null, nama },
        );
    };
    const geserAnggota = (i: number, j: number, arah: -1 | 1) => {
        const tim = [...data.penugasan[i].tim];
        const k = j + arah;
        if (k < 0 || k >= tim.length) return;
        [tim[j], tim[k]] = [tim[k], tim[j]];
        ubahPenugasan(i, { tim });
    };

    const tarifDok = Number(data.tarif_per_hari || tarifBaku);
    const hitung = (p: Penugasan) =>
        p.tim.reduce(
            (a, m) => {
                const h = Number(m.hari_kantor || 0) + Number(m.hari_lapangan || 0);
                return { hari: a.hari + h, biaya: a.biaya + h * Number(m.tarif_per_hari || tarifDok) };
            },
            { hari: 0, biaya: 0 },
        );
    const totalDok = data.penugasan.reduce(
        (a, p) => {
            const h = hitung(p);
            return { hari: a.hari + h.hari, biaya: a.biaya + h.biaya };
        },
        { hari: 0, biaya: 0 },
    );

    const contohNomor = `700/01/RPP-${kategori?.kode_nomor ?? 'XX'}/INS/${data.year}`;
    const halBaku = `Penyampaian Rencana Penugasan ${kategori?.sebutan ?? kategori?.name ?? '…'} Tahun ${data.year}`;

    const simpan = () => {
        // obrik: satu baris satu objek; nomor urut di depan dibuang
        form.transform((d) => ({
            ...d,
            rpp_category_id: Number(d.rpp_category_id),
            bulan: d.bulan ? Number(d.bulan) : null,
            tarif_per_hari: d.tarif_per_hari === '' ? null : Number(d.tarif_per_hari),
            penugasan: d.penugasan.map((p) => ({
                ...p,
                obriks: p.obriks_teks
                    .split('\n')
                    .map((s) => s.replace(/^\s*\d+[.)]\s*/, '').trim())
                    .filter(Boolean),
                jumlah_laporan: p.jumlah_laporan === '' ? null : Number(p.jumlah_laporan),
                tim: p.tim.map((m) => ({
                    ...m,
                    hari_kantor: m.hari_kantor === '' ? null : Number(m.hari_kantor),
                    hari_lapangan: m.hari_lapangan === '' ? null : Number(m.hari_lapangan),
                    tarif_per_hari: m.tarif_per_hari === '' ? null : Number(m.tarif_per_hari),
                })),
            })),
        }));
        const opsi = {
            preserveScroll: true,
            onError: (e: Record<string, string>) => toast.error(Object.values(e)[0] ?? 'Periksa isian yang ditandai.'),
        };
        if (rpp) form.put(`/rpp/${rpp.id}`, opsi);
        else form.post('/rpp', opsi);
    };

    const galat = (kunci: string) => (errors as Record<string, string>)[kunci];

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'ERPIKA', href: '#' },
        { title: 'RPP Perencanaan', href: '/rpp' },
        { title: rpp ? 'Ubah RPP' : 'Tambah RPP', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={rpp ? `Ubah RPP ${rpp.nomor_rpp}` : 'Tambah RPP'} />
            <div className="space-y-5 p-4 pb-28 md:p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{rpp ? `Ubah RPP ${rpp.nomor_rpp}` : 'Tambah RPP'}</h1>
                    <p className="text-muted-foreground text-sm">
                        Satu dokumen RPP bisa memuat beberapa penugasan; tiap penugasan punya tim dan hari pemeriksaannya sendiri.
                    </p>
                </div>

                {/* ---- Dokumen ---- */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Dokumen RPP</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-4">
                        <div className="space-y-1 md:col-span-2">
                            <Label>Jenis penugasan</Label>
                            <Select value={data.rpp_category_id} onValueChange={(v) => setData('rpp_category_id', v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih jenis" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((c) => (
                                        <SelectItem key={c.id} value={String(c.id)}>
                                            {c.name}
                                            {c.kode_nomor ? ` (RPP-${c.kode_nomor})` : ''}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {galat('rpp_category_id') && <p className="text-destructive text-xs">{galat('rpp_category_id')}</p>}
                        </div>
                        <div className="space-y-1">
                            <Label>Tahun</Label>
                            <Input type="number" value={data.year} onChange={(e) => setData('year', Number(e.target.value))} />
                        </div>
                        <div className="space-y-1">
                            <Label>Bulan</Label>
                            <Select value={data.bulan} onValueChange={(v) => setData('bulan', v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Bulan" />
                                </SelectTrigger>
                                <SelectContent>
                                    {BULAN.map((b, i) => (
                                        <SelectItem key={i} value={String(i + 1)}>
                                            {b}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1 md:col-span-2">
                            <Label>Nomor RPP</Label>
                            <Input
                                value={data.nomor_rpp}
                                onChange={(e) => setData('nomor_rpp', e.target.value)}
                                placeholder={contohNomor}
                                className="font-mono"
                            />
                            {galat('nomor_rpp') ? (
                                <p className="text-destructive text-xs">{galat('nomor_rpp')}</p>
                            ) : (
                                <p className="text-muted-foreground text-xs">Pola: {contohNomor}</p>
                            )}
                        </div>
                        <div className="space-y-1">
                            <Label>Tanggal RPP</Label>
                            <DatePicker value={data.tanggal_rpp} onChange={(v) => setData('tanggal_rpp', v)} />
                        </div>
                        <div className="space-y-1">
                            <Label>Tarif per hari (Rp)</Label>
                            <Input
                                type="number"
                                min={0}
                                value={data.tarif_per_hari}
                                onChange={(e) => setData('tarif_per_hari', e.target.value === '' ? '' : Number(e.target.value))}
                            />
                            <p className="text-muted-foreground text-xs">Baku {rupiah(tarifBaku)}; bisa diganti per anggota.</p>
                        </div>
                        <div className="space-y-1 md:col-span-2">
                            <Label>Judul di kepala tabel</Label>
                            <Input value={data.judul} onChange={(e) => setData('judul', e.target.value)} placeholder="RENCANA PENUGASAN PENGAWASAN" />
                            <p className="text-muted-foreground text-xs">
                                Kosongkan untuk judul baku. Contoh varian: RENCANA PENUGASAN PENGAWASAN- KINERJA SKPK.
                            </p>
                        </div>
                        <div className="space-y-1 md:col-span-2">
                            <Label>Baris kedua kepala tabel</Label>
                            <Input
                                value={data.sub_judul}
                                onChange={(e) => setData('sub_judul', e.target.value)}
                                placeholder={`BULAN ${(BULAN[Number(data.bulan) - 1] ?? '').toUpperCase()} ${data.year}`}
                            />
                            <p className="text-muted-foreground text-xs">
                                Kosongkan untuk “BULAN … TAHUN”. Contoh varian: EVALUASI LAKIP TAHUN 2025.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* ---- Penugasan ---- */}
                {data.penugasan.map((p, i) => {
                    const h = hitung(p);
                    return (
                        <Card key={i}>
                            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
                                <CardTitle className="text-base">
                                    Penugasan {i + 1}
                                    <span className="text-muted-foreground ml-2 text-xs font-normal">
                                        {h.hari} hari · {rupiah(h.biaya)}
                                    </span>
                                </CardTitle>
                                <div className="flex gap-1">
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="ghost"
                                        title="Salin penugasan ini"
                                        onClick={() =>
                                            setData('penugasan', [
                                                ...data.penugasan.slice(0, i + 1),
                                                JSON.parse(JSON.stringify(p)),
                                                ...data.penugasan.slice(i + 1),
                                            ])
                                        }
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="ghost"
                                        disabled={data.penugasan.length === 1}
                                        title="Hapus penugasan"
                                        onClick={() =>
                                            setData(
                                                'penugasan',
                                                data.penugasan.filter((_, k) => k !== i),
                                            )
                                        }
                                    >
                                        <Trash2 className="text-destructive h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-3">
                                    <div className="space-y-1 md:col-span-2">
                                        <Label>Obrik / uraian penugasan</Label>
                                        <Textarea
                                            rows={2}
                                            value={p.uraian}
                                            onChange={(e) => ubahPenugasan(i, { uraian: e.target.value })}
                                            placeholder="mis. Audit Kinerja atas Program Ketahanan Pangan TA 2024"
                                        />
                                        {galat(`penugasan.${i}.uraian`) && (
                                            <p className="text-destructive text-xs">{galat(`penugasan.${i}.uraian`)}</p>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Sifat audit</Label>
                                        <Input
                                            list={`sifat-${i}`}
                                            value={p.sifat}
                                            onChange={(e) => ubahPenugasan(i, { sifat: e.target.value })}
                                            placeholder="Kinerja / Kepatuhan / Reviu"
                                        />
                                        <datalist id={`sifat-${i}`}>
                                            {sifatTersedia.map((s) => (
                                                <option key={s} value={s} />
                                            ))}
                                        </datalist>
                                    </div>
                                    <div className="space-y-1 md:col-span-2">
                                        <Label>Daftar objek (satu per baris, opsional)</Label>
                                        <Textarea
                                            rows={3}
                                            value={p.obriks_teks}
                                            onChange={(e) => ubahPenugasan(i, { obriks_teks: e.target.value })}
                                            placeholder={'1. Dinas Pendidikan dan Kebudayaan\n2. Dinas Sosial'}
                                        />
                                        <p className="text-muted-foreground text-xs">
                                            Dicetak bernomor di bawah uraian, seperti daftar OPD pada evaluasi LAKIP.
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <Label>Jumlah laporan</Label>
                                            <Input
                                                type="number"
                                                min={0}
                                                value={p.jumlah_laporan}
                                                onChange={(e) =>
                                                    ubahPenugasan(i, { jumlah_laporan: e.target.value === '' ? '' : Number(e.target.value) })
                                                }
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label>Status</Label>
                                            <Select value={p.status} onValueChange={(v) => ubahPenugasan(i, { status: v as Penugasan['status'] })}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.entries(STATUS).map(([k, v]) => (
                                                        <SelectItem key={k} value={k}>
                                                            {v}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-1">
                                            <Label>TMT mulai</Label>
                                            <DatePicker value={p.masa_tugas_mulai} onChange={(v) => ubahPenugasan(i, { masa_tugas_mulai: v })} />
                                        </div>
                                        <div className="space-y-1">
                                            <Label>TMT selesai</Label>
                                            <DatePicker value={p.masa_tugas_selesai} onChange={(v) => ubahPenugasan(i, { masa_tugas_selesai: v })} />
                                            {galat(`penugasan.${i}.masa_tugas_selesai`) && (
                                                <p className="text-destructive text-xs">Selesai harus sesudah mulai.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Tim */}
                                <div className="space-y-2">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <Label className="flex items-center gap-1">
                                            <Users className="h-4 w-4" /> Tim pemeriksa
                                        </Label>
                                        <div className="flex gap-1">
                                            <Button type="button" size="sm" variant="outline" onClick={() => ubahPenugasan(i, { tim: timBaku() })}>
                                                Susunan baku
                                            </Button>
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                onClick={() => ubahPenugasan(i, { tim: [...p.tim, anggotaKosong()] })}
                                            >
                                                <Plus className="mr-1 h-3.5 w-3.5" /> Anggota
                                            </Button>
                                        </div>
                                    </div>
                                    {galat(`penugasan.${i}.tim`) && <p className="text-destructive text-xs">{galat(`penugasan.${i}.tim`)}</p>}
                                    <div className="overflow-x-auto rounded border">
                                        <table className="w-full text-xs">
                                            <thead className="bg-muted/60 text-muted-foreground">
                                                <tr>
                                                    <th className="px-2 py-1.5 text-left">#</th>
                                                    <th className="min-w-[220px] px-2 py-1.5 text-left">Nama</th>
                                                    <th className="min-w-[150px] px-2 py-1.5 text-left">NIP</th>
                                                    <th className="min-w-[140px] px-2 py-1.5 text-left">Pangkat</th>
                                                    <th className="w-20 px-2 py-1.5 text-left">Gol.</th>
                                                    <th className="min-w-[170px] px-2 py-1.5 text-left">Peran</th>
                                                    <th className="w-16 px-2 py-1.5 text-center">DK</th>
                                                    <th className="w-16 px-2 py-1.5 text-center">LK</th>
                                                    <th className="w-24 px-2 py-1.5 text-center">Tarif</th>
                                                    <th className="w-24 px-2 py-1.5"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {p.tim.map((m, j) => (
                                                    <tr key={j} className="align-top">
                                                        <td className="px-2 py-1.5 tabular-nums">{j + 1}</td>
                                                        <td className="px-2 py-1.5">
                                                            <AutocompleteSelect
                                                                value={m.nama}
                                                                onChange={(v) => pilihPegawai(i, j, v)}
                                                                options={namaPegawai}
                                                                placeholder="Ketik nama pegawai…"
                                                            />
                                                            {galat(`penugasan.${i}.tim.${j}.nama`) && (
                                                                <p className="text-destructive">{galat(`penugasan.${i}.tim.${j}.nama`)}</p>
                                                            )}
                                                        </td>
                                                        <td className="px-2 py-1.5">
                                                            <Input
                                                                className="h-8 font-mono text-xs"
                                                                value={m.nip}
                                                                onChange={(e) => ubahAnggota(i, j, { nip: e.target.value })}
                                                            />
                                                        </td>
                                                        <td className="px-2 py-1.5">
                                                            <Input
                                                                className="h-8 text-xs"
                                                                value={m.pangkat}
                                                                onChange={(e) => ubahAnggota(i, j, { pangkat: e.target.value })}
                                                            />
                                                        </td>
                                                        <td className="px-2 py-1.5">
                                                            <Input
                                                                className="h-8 text-xs"
                                                                value={m.golongan}
                                                                onChange={(e) => ubahAnggota(i, j, { golongan: e.target.value })}
                                                                placeholder="IV/a"
                                                            />
                                                        </td>
                                                        <td className="px-2 py-1.5">
                                                            <Select value={m.role} onValueChange={(v) => ubahAnggota(i, j, { role: v as Peran })}>
                                                                <SelectTrigger className="h-8 text-xs">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {Object.entries(PERAN).map(([k, v]) => (
                                                                        <SelectItem key={k} value={k}>
                                                                            {v}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            <Input
                                                                className="mt-1 h-7 text-xs"
                                                                value={m.peran_teks}
                                                                onChange={(e) => ubahAnggota(i, j, { peran_teks: e.target.value })}
                                                                placeholder="teks lain di cetakan (opsional)"
                                                            />
                                                        </td>
                                                        <td className="px-2 py-1.5">
                                                            <Input
                                                                type="number"
                                                                min={0}
                                                                className="h-8 text-center text-xs"
                                                                value={m.hari_kantor}
                                                                onChange={(e) =>
                                                                    ubahAnggota(i, j, {
                                                                        hari_kantor: e.target.value === '' ? '' : Number(e.target.value),
                                                                    })
                                                                }
                                                            />
                                                        </td>
                                                        <td className="px-2 py-1.5">
                                                            <Input
                                                                type="number"
                                                                min={0}
                                                                className="h-8 text-center text-xs"
                                                                value={m.hari_lapangan}
                                                                onChange={(e) =>
                                                                    ubahAnggota(i, j, {
                                                                        hari_lapangan: e.target.value === '' ? '' : Number(e.target.value),
                                                                    })
                                                                }
                                                            />
                                                        </td>
                                                        <td className="px-2 py-1.5">
                                                            <Input
                                                                type="number"
                                                                min={0}
                                                                className="h-8 text-xs"
                                                                value={m.tarif_per_hari}
                                                                placeholder={String(tarifDok)}
                                                                onChange={(e) =>
                                                                    ubahAnggota(i, j, {
                                                                        tarif_per_hari: e.target.value === '' ? '' : Number(e.target.value),
                                                                    })
                                                                }
                                                            />
                                                        </td>
                                                        <td className="px-1 py-1.5">
                                                            <div className="flex">
                                                                <Button
                                                                    type="button"
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className="h-7 w-7"
                                                                    onClick={() => geserAnggota(i, j, -1)}
                                                                >
                                                                    <ArrowUp className="h-3.5 w-3.5" />
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className="h-7 w-7"
                                                                    onClick={() => geserAnggota(i, j, 1)}
                                                                >
                                                                    <ArrowDown className="h-3.5 w-3.5" />
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className="h-7 w-7"
                                                                    onClick={() => ubahPenugasan(i, { tim: p.tim.filter((_, k) => k !== j) })}
                                                                >
                                                                    <Trash2 className="text-destructive h-3.5 w-3.5" />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <p className="text-muted-foreground text-xs">
                                        Pilih nama dari daftar pegawai supaya NIP/pangkat/golongan terisi sendiri; nama di luar daftar tetap boleh
                                        diketik.
                                    </p>
                                </div>

                                {/* Naskah dinas & laporan */}
                                <details className="rounded border p-3">
                                    <summary className="cursor-pointer text-sm font-medium">
                                        Naskah dinas & laporan (SP, ST, KP, LHP) — opsional
                                    </summary>
                                    <div className="mt-3 grid gap-3 md:grid-cols-4">
                                        <div className="space-y-1">
                                            <Label>Nomor SP</Label>
                                            <Input
                                                value={p.nomor_sp}
                                                onChange={(e) => ubahPenugasan(i, { nomor_sp: e.target.value })}
                                                className="font-mono text-xs"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label>Nomor ST</Label>
                                            <Input
                                                value={p.nomor_st}
                                                onChange={(e) => ubahPenugasan(i, { nomor_st: e.target.value })}
                                                className="font-mono text-xs"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label>Tanggal ST</Label>
                                            <DatePicker value={p.tanggal_st} onChange={(v) => ubahPenugasan(i, { tanggal_st: v })} />
                                        </div>
                                        <div className="space-y-1">
                                            <Label>Nomor KP</Label>
                                            <Input
                                                value={p.nomor_kp}
                                                onChange={(e) => ubahPenugasan(i, { nomor_kp: e.target.value })}
                                                className="font-mono text-xs"
                                            />
                                        </div>
                                        <div className="space-y-1 md:col-span-2">
                                            <Label>Capaian output</Label>
                                            <Input value={p.capaian_output} onChange={(e) => ubahPenugasan(i, { capaian_output: e.target.value })} />
                                        </div>
                                        <div className="space-y-1 md:col-span-2">
                                            <Label>Teks TMT khusus (opsional)</Label>
                                            <Input
                                                value={p.tmt_teks}
                                                onChange={(e) => ubahPenugasan(i, { tmt_teks: e.target.value })}
                                                placeholder="mis. TMT 12 Maret - 9 April 2025"
                                            />
                                        </div>
                                        <div className="space-y-2 md:col-span-4">
                                            <div className="flex items-center justify-between">
                                                <Label>Laporan (LHP) terbit</Label>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        ubahPenugasan(i, { laporans: [...p.laporans, { nomor_laporan: '', tanggal_laporan: '' }] })
                                                    }
                                                >
                                                    <Plus className="mr-1 h-3.5 w-3.5" /> Laporan
                                                </Button>
                                            </div>
                                            {p.laporans.map((l, k) => (
                                                <div key={k} className="flex flex-wrap items-center gap-2">
                                                    <Input
                                                        className="flex-1 font-mono text-xs"
                                                        placeholder="Nomor laporan"
                                                        value={l.nomor_laporan}
                                                        onChange={(e) =>
                                                            ubahPenugasan(i, {
                                                                laporans: p.laporans.map((x, y) =>
                                                                    y === k ? { ...x, nomor_laporan: e.target.value } : x,
                                                                ),
                                                            })
                                                        }
                                                    />
                                                    <DatePicker
                                                        value={l.tanggal_laporan}
                                                        onChange={(v) =>
                                                            ubahPenugasan(i, {
                                                                laporans: p.laporans.map((x, y) => (y === k ? { ...x, tanggal_laporan: v } : x)),
                                                            })
                                                        }
                                                    />
                                                    <Button
                                                        type="button"
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={() => ubahPenugasan(i, { laporans: p.laporans.filter((_, y) => y !== k) })}
                                                    >
                                                        <Trash2 className="text-destructive h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </details>
                            </CardContent>
                        </Card>
                    );
                })}
                <Button type="button" variant="outline" onClick={() => setData('penugasan', [...data.penugasan, penugasanKosong()])}>
                    <Plus className="mr-2 h-4 w-4" /> Tambah penugasan
                </Button>

                {/* ---- Surat pengantar ---- */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Surat pengantar</CardTitle>
                        <p className="text-muted-foreground text-sm">
                            Ditujukan kepada Ketua Tim; kalimat pembuka (dasar penugasan) diketik di sini, sisanya kalimat baku.
                        </p>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-1">
                            <Label>Tanggal surat</Label>
                            <DatePicker
                                value={data.tanggal_surat}
                                onChange={(v) => setData('tanggal_surat', v)}
                                placeholder="sama dengan tanggal RPP"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label>Hal</Label>
                            <Input value={data.hal} onChange={(e) => setData('hal', e.target.value)} placeholder={halBaku} />
                        </div>
                        <div className="space-y-1">
                            <Label>Yang terhormat</Label>
                            <Input
                                value={data.tujuan_surat}
                                onChange={(e) => setData('tujuan_surat', e.target.value)}
                                placeholder={`Ketua Tim ${kategori?.sebutan ?? '…'}`}
                            />
                        </div>
                        <div className="space-y-1 md:col-span-3">
                            <Label>Paragraf 1 — dasar penugasan</Label>
                            <Textarea
                                rows={3}
                                value={data.surat_dasar_uraian}
                                onChange={(e) => setData('surat_dasar_uraian', e.target.value)}
                                placeholder={`Berdasarkan Program Kerja Pengawasan Tahunan Inspektorat Kabupaten Aceh Barat Tahun ${data.year} …`}
                            />
                        </div>
                        <label className="flex items-center gap-2 text-sm md:col-span-3">
                            <Checkbox checked={data.dengan_penutup} onCheckedChange={(v) => setData('dengan_penutup', v === true)} />
                            Sertakan paragraf penutup “Demikian untuk dilaksanakan sebagaimana mestinya, terima kasih.”
                        </label>
                    </CardContent>
                </Card>
            </div>

            {/* Kaki lengket: total + simpan */}
            <div className="bg-background/95 fixed right-0 bottom-0 left-0 z-20 border-t backdrop-blur md:left-[var(--sidebar-width,0px)]">
                <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6">
                    <div className="text-sm">
                        <Badge variant="secondary" className="mr-2">
                            {data.penugasan.length} penugasan
                        </Badge>
                        {totalDok.hari} orang-hari · <span className="font-medium">{rupiah(totalDok.biaya)}</span>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/rpp">
                            <Button type="button" variant="outline">
                                Batal
                            </Button>
                        </Link>
                        <Button type="button" onClick={simpan} disabled={processing}>
                            {processing ? 'Menyimpan…' : rpp ? 'Simpan perubahan' : 'Simpan RPP'}
                        </Button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
