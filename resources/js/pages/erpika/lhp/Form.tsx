import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, ClipboardList, Lightbulb, Plus, Save, Trash2, Users } from 'lucide-react';

const BASE = '/erpika/laporan-penugasan/database-lhp';

type TindakLanjut = {
    id?: number;
    kode_group: string | null;
    kode: string | null;
    nilai: number | null;
    tanggal: string | null;
    memo: string | null;
};
type Rekomendasi = { id?: number; kode_group: string | null; kode: string | null; nilai: number | null; memo: string; tindak_lanjut: TindakLanjut[] };
type Sebab = { id?: number; kode_group: string | null; kode: string | null; memo: string; rekomendasi: Rekomendasi[] };
type Temuan = {
    id?: number;
    kode_group: string | null;
    kode: string | null;
    nilai: number | null;
    ba_kesepakatan: string | null;
    kerugian_pada: string | null;
    memo: string;
    status: string | null;
    sebab: Sebab[];
};
type Anggota = { id?: number; nip: string | null; nama: string; jabatan: string | null };
type LhpForm = {
    nomor_lhp: string;
    tanggal_lhp: string | null;
    nomor_st: string | null;
    tanggal_st: string | null;
    tahun_pkpt: string | null;
    tahun_anggaran: string | null;
    nama_obrik: string;
    inspektorat: string | null;
    bidang_unit: string | null;
    kode_group_jenis_periksa: string | null;
    kode_jenis_periksa: string | null;
    nilai_anggaran: number | null;
    realisasi_anggaran: number | null;
    anggaran_diaudit: number | null;
    status_lhp: string;
    nip_pj: string | null;
    nama_pj: string | null;
    tim: Anggota[];
    temuan: Temuan[];
    [key: string]: string | number | null | Temuan[] | Anggota[];
};

type Opsi = { kode: string; kode_group?: string | null; nama: string };
interface KodeRef {
    group_jenis: Opsi[];
    jenis: Opsi[];
    group_temuan: Opsi[];
    temuan: Opsi[];
    group_sebab: Opsi[];
    sebab: Opsi[];
    group_rekomendasi: Opsi[];
    rekomendasi: Opsi[];
    group_tl: Opsi[];
    tl: Opsi[];
    bidang_unit: string[];
    inspektorat_default: string;
}

interface Props {
    lhp: (LhpForm & { id: number }) | null;
    statusPilihan: { value: string; label: string }[];
    jabatanPilihan: string[];
    kodeRef: KodeRef;
}

const kosongTL = (): TindakLanjut => ({ kode_group: null, kode: null, nilai: null, tanggal: null, memo: '' });
const kosongRekom = (): Rekomendasi => ({ kode_group: null, kode: null, nilai: null, memo: '', tindak_lanjut: [] });
const kosongSebab = (): Sebab => ({ kode_group: null, kode: null, memo: '', rekomendasi: [kosongRekom()] });
const kosongTemuan = (): Temuan => ({
    kode_group: null,
    kode: null,
    nilai: null,
    ba_kesepakatan: null,
    kerugian_pada: null,
    memo: '',
    status: null,
    sebab: [kosongSebab()],
});

export default function LhpFormPage({ lhp, statusPilihan, jabatanPilihan, kodeRef }: Props) {
    const awal: LhpForm = lhp ?? {
        nomor_lhp: '',
        tanggal_lhp: null,
        nomor_st: null,
        tanggal_st: null,
        tahun_pkpt: null,
        tahun_anggaran: null,
        nama_obrik: '',
        inspektorat: kodeRef.inspektorat_default,
        bidang_unit: null,
        kode_group_jenis_periksa: '01',
        kode_jenis_periksa: null,
        nilai_anggaran: null,
        realisasi_anggaran: null,
        anggaran_diaudit: null,
        status_lhp: '01',
        nip_pj: null,
        nama_pj: null,
        tim: [],
        temuan: [kosongTemuan()],
    };

    const { data, setData, post, put, processing, errors } = useForm<LhpForm>(awal);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'ERPIKA', href: '#' },
        { title: 'ANEVA', href: '#' },
        { title: 'Database LHP', href: BASE },
        { title: lhp ? `Sunting ${lhp.nomor_lhp}` : 'Tambah LHP', href: '#' },
    ];

    // ---- Penyunting berjenjang (salinan baru tiap ubah agar Inertia sadar) ----
    const setTim = (fn: (t: Anggota[]) => Anggota[]) => setData('tim', fn(data.tim));
    const setTemuan = (fn: (t: Temuan[]) => Temuan[]) => setData('temuan', fn(data.temuan));
    const patchTemuan = (ti: number, p: Partial<Temuan>) => setTemuan((ts) => ts.map((t, i) => (i === ti ? { ...t, ...p } : t)));
    const patchSebab = (ti: number, si: number, p: Partial<Sebab>) =>
        setTemuan((ts) => ts.map((t, i) => (i === ti ? { ...t, sebab: t.sebab.map((s, j) => (j === si ? { ...s, ...p } : s)) } : t)));
    const patchRekom = (ti: number, si: number, ri: number, p: Partial<Rekomendasi>) =>
        setTemuan((ts) =>
            ts.map((t, i) =>
                i === ti
                    ? {
                          ...t,
                          sebab: t.sebab.map((s, j) =>
                              j === si ? { ...s, rekomendasi: s.rekomendasi.map((r, k) => (k === ri ? { ...r, ...p } : r)) } : s,
                          ),
                      }
                    : t,
            ),
        );
    const patchTL = (ti: number, si: number, ri: number, li: number, p: Partial<TindakLanjut>) =>
        setTemuan((ts) =>
            ts.map((t, i) =>
                i === ti
                    ? {
                          ...t,
                          sebab: t.sebab.map((s, j) =>
                              j === si
                                  ? {
                                        ...s,
                                        rekomendasi: s.rekomendasi.map((r, k) =>
                                            k === ri ? { ...r, tindak_lanjut: r.tindak_lanjut.map((w, m) => (m === li ? { ...w, ...p } : w)) } : r,
                                        ),
                                    }
                                  : s,
                          ),
                      }
                    : t,
            ),
        );
    const ubahSebabList = (ti: number, fn: (s: Sebab[]) => Sebab[]) =>
        setTemuan((ts) => ts.map((t, i) => (i === ti ? { ...t, sebab: fn(t.sebab) } : t)));
    const ubahRekomList = (ti: number, si: number, fn: (r: Rekomendasi[]) => Rekomendasi[]) =>
        setTemuan((ts) =>
            ts.map((t, i) => (i === ti ? { ...t, sebab: t.sebab.map((s, j) => (j === si ? { ...s, rekomendasi: fn(s.rekomendasi) } : s)) } : t)),
        );
    const ubahTLList = (ti: number, si: number, ri: number, fn: (w: TindakLanjut[]) => TindakLanjut[]) =>
        ubahRekomList(ti, si, (rs) => rs.map((r, k) => (k === ri ? { ...r, tindak_lanjut: fn(r.tindak_lanjut) } : r)));

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (lhp) put(`${BASE}/${lhp.id}`);
        else post(BASE);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={lhp ? `Sunting LHP ${lhp.nomor_lhp}` : 'Tambah LHP'} />
            <form onSubmit={submit} className="mx-auto max-w-4xl space-y-6 p-4 md:p-6">
                <PageHeader
                    title={lhp ? 'Sunting LHP' : 'Tambah LHP'}
                    description="Isi identitas LHP lalu rangkai Temuan → Penyebab → Rekomendasi → Tindak Lanjut."
                    actions={
                        <>
                            <Button asChild size="sm" variant="outline" type="button">
                                <Link href={lhp ? `${BASE}/${lhp.id}` : BASE}>
                                    <ArrowLeft className="h-4 w-4" />
                                    Batal
                                </Link>
                            </Button>
                            <Button size="sm" type="submit" disabled={processing}>
                                <Save className="h-4 w-4" />
                                Simpan
                            </Button>
                        </>
                    }
                />

                {/* Identitas */}
                <div className="bg-card space-y-4 rounded-md border p-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Bidang label="Nomor LHP" wajib galat={errors.nomor_lhp}>
                            <Input value={data.nomor_lhp} onChange={(e) => setData('nomor_lhp', e.target.value)} placeholder="mis. 700/12/LHP/2026" />
                        </Bidang>
                        <Bidang label="Tanggal LHP" galat={errors.tanggal_lhp}>
                            <Input type="date" value={data.tanggal_lhp ?? ''} onChange={(e) => setData('tanggal_lhp', e.target.value || null)} />
                        </Bidang>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3">
                        <Bidang label="Nomor Surat Tugas" galat={errors.nomor_st}>
                            <Input value={data.nomor_st ?? ''} onChange={(e) => setData('nomor_st', e.target.value || null)} />
                        </Bidang>
                        <Bidang label="Tahun PKPT" galat={errors.tahun_pkpt}>
                            <Input value={data.tahun_pkpt ?? ''} onChange={(e) => setData('tahun_pkpt', e.target.value || null)} placeholder="2026" />
                        </Bidang>
                        <Bidang label="Tanggal Surat Tugas" galat={errors.tanggal_st}>
                            <Input type="date" value={data.tanggal_st ?? ''} onChange={(e) => setData('tanggal_st', e.target.value || null)} />
                        </Bidang>
                    </div>
                    <Bidang label="Objek Pemeriksaan (Obrik)" wajib galat={errors.nama_obrik}>
                        <Textarea
                            value={data.nama_obrik}
                            onChange={(e) => setData('nama_obrik', e.target.value)}
                            rows={2}
                            placeholder="Nama satuan kerja / kegiatan yang diperiksa"
                        />
                    </Bidang>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Bidang label="Inspektorat" galat={errors.inspektorat}>
                            <Input value={data.inspektorat ?? ''} onChange={(e) => setData('inspektorat', e.target.value || null)} />
                        </Bidang>
                        <Bidang label="Bidang/Unit Pengawasan" galat={errors.bidang_unit}>
                            <PilihTeks
                                opsi={kodeRef.bidang_unit}
                                value={data.bidang_unit}
                                onChange={(v) => setData('bidang_unit', v)}
                                placeholder="Pilih Irban / unit"
                            />
                        </Bidang>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Bidang label="Lingkup Audit (Sumber)">
                            <PilihKode
                                opsi={kodeRef.group_jenis}
                                value={data.kode_group_jenis_periksa}
                                onChange={(v) => setData('kode_group_jenis_periksa', v)}
                                placeholder="Pilih lingkup"
                            />
                        </Bidang>
                        <Bidang label="Jenis Audit">
                            <PilihKode
                                opsi={kodeRef.jenis.filter((o) => !data.kode_group_jenis_periksa || o.kode_group === data.kode_group_jenis_periksa)}
                                value={data.kode_jenis_periksa}
                                onChange={(v) => setData('kode_jenis_periksa', v)}
                                placeholder="Pilih jenis"
                            />
                        </Bidang>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3">
                        <Bidang label="Tahun Anggaran" galat={errors.tahun_anggaran}>
                            <Input
                                value={data.tahun_anggaran ?? ''}
                                onChange={(e) => setData('tahun_anggaran', e.target.value || null)}
                                placeholder="2026"
                            />
                        </Bidang>
                        <Bidang label="Nilai Anggaran" galat={errors.nilai_anggaran}>
                            <Rupiah value={data.nilai_anggaran} onChange={(n) => setData('nilai_anggaran', n)} />
                        </Bidang>
                        <Bidang label="Anggaran Diaudit" galat={errors.anggaran_diaudit}>
                            <Rupiah value={data.anggaran_diaudit} onChange={(n) => setData('anggaran_diaudit', n)} />
                        </Bidang>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3">
                        <Bidang label="Status Tindak Lanjut" galat={errors.status_lhp}>
                            <Select value={data.status_lhp} onValueChange={(v) => setData('status_lhp', v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {statusPilihan.map((s) => (
                                        <SelectItem key={s.value} value={s.value}>
                                            {s.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Bidang>
                        <Bidang label="Nama Penanggung Jawab" galat={errors.nama_pj}>
                            <Input value={data.nama_pj ?? ''} onChange={(e) => setData('nama_pj', e.target.value || null)} />
                        </Bidang>
                        <Bidang label="NIP Penanggung Jawab" galat={errors.nip_pj}>
                            <Input value={data.nip_pj ?? ''} onChange={(e) => setData('nip_pj', e.target.value || null)} />
                        </Bidang>
                    </div>
                </div>

                {/* Tim pemeriksa */}
                <div className="bg-card space-y-3 rounded-md border p-4">
                    <div className="flex items-center justify-between">
                        <h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight">
                            <Users className="text-muted-foreground h-4 w-4" />
                            Tim Pemeriksa
                        </h2>
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setTim((ts) => [...ts, { nip: null, nama: '', jabatan: jabatanPilihan[ts.length] ?? 'Anggota Tim' }])}
                        >
                            <Plus className="h-4 w-4" />
                            Tambah Anggota
                        </Button>
                    </div>
                    {data.tim.length === 0 && (
                        <p className="text-muted-foreground text-xs">Belum ada anggota tim. Tambahkan nama beserta jabatannya.</p>
                    )}
                    {data.tim.map((m, mi) => (
                        <div key={mi} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_180px_200px_auto]">
                            <Input
                                value={m.nama}
                                onChange={(e) => setTim((ts) => ts.map((x, i) => (i === mi ? { ...x, nama: e.target.value } : x)))}
                                placeholder="Nama"
                            />
                            <Input
                                value={m.nip ?? ''}
                                onChange={(e) => setTim((ts) => ts.map((x, i) => (i === mi ? { ...x, nip: e.target.value || null } : x)))}
                                placeholder="NIP"
                            />
                            <Select
                                value={m.jabatan ?? ''}
                                onValueChange={(v) => setTim((ts) => ts.map((x, i) => (i === mi ? { ...x, jabatan: v } : x)))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Jabatan" />
                                </SelectTrigger>
                                <SelectContent>
                                    {jabatanPilihan.map((j) => (
                                        <SelectItem key={j} value={j}>
                                            {j}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="text-destructive h-9 w-9"
                                title="Hapus anggota"
                                onClick={() => setTim((ts) => ts.filter((_, i) => i !== mi))}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>

                {/* Temuan */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-semibold tracking-tight">Temuan</h2>
                        <Button type="button" size="sm" variant="outline" onClick={() => setTemuan((ts) => [...ts, kosongTemuan()])}>
                            <Plus className="h-4 w-4" />
                            Tambah Temuan
                        </Button>
                    </div>

                    {data.temuan.map((t, ti) => (
                        <div key={ti} className="bg-card space-y-3 rounded-md border p-4">
                            <div className="flex flex-wrap items-center gap-2">
                                <ClipboardList className="text-muted-foreground h-4 w-4" />
                                <span className="text-sm font-semibold">Temuan {ti + 1}</span>
                                <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    className="text-destructive ml-auto h-8 w-8"
                                    title="Hapus temuan"
                                    onClick={() => setTemuan((ts) => ts.filter((_, i) => i !== ti))}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="grid gap-2 sm:grid-cols-2">
                                <Bidang label="Kode Temuan (Group)">
                                    <PilihKode
                                        opsi={kodeRef.group_temuan}
                                        value={t.kode_group}
                                        onChange={(v) => patchTemuan(ti, { kode_group: v, kode: null })}
                                        placeholder="Pilih group temuan"
                                    />
                                </Bidang>
                                <Bidang label="Kode Temuan (Rincian)">
                                    <PilihKode
                                        opsi={kodeRef.temuan.filter((o) => !t.kode_group || o.kode_group === t.kode_group)}
                                        value={t.kode}
                                        onChange={(v) => patchTemuan(ti, { kode: v })}
                                        placeholder="Pilih rincian"
                                    />
                                </Bidang>
                            </div>
                            <Textarea
                                value={t.memo}
                                onChange={(e) => patchTemuan(ti, { memo: e.target.value })}
                                rows={3}
                                placeholder="Uraian temuan / kondisi"
                            />
                            <div className="grid gap-3 sm:grid-cols-3">
                                <Bidang label="Nilai Temuan">
                                    <Rupiah value={t.nilai} onChange={(n) => patchTemuan(ti, { nilai: n })} />
                                </Bidang>
                                <Radio
                                    label="BA Kesepakatan Obrik"
                                    value={t.ba_kesepakatan}
                                    onChange={(v) => patchTemuan(ti, { ba_kesepakatan: v })}
                                    opsi={[
                                        ['tidak', 'Tidak Ada'],
                                        ['ada', 'Ada'],
                                    ]}
                                />
                                <Radio
                                    label="Kerugian pada"
                                    value={t.kerugian_pada}
                                    onChange={(v) => patchTemuan(ti, { kerugian_pada: v })}
                                    opsi={[
                                        ['negara', 'Negara'],
                                        ['daerah', 'Daerah'],
                                    ]}
                                />
                            </div>

                            {/* Penyebab */}
                            <div className="border-muted-foreground/20 space-y-3 border-l-2 pl-3">
                                {t.sebab.map((s, si) => (
                                    <div key={si} className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                                                Penyebab {si + 1}
                                            </span>
                                            <Button
                                                type="button"
                                                size="icon"
                                                variant="ghost"
                                                className="text-destructive ml-auto h-7 w-7"
                                                title="Hapus penyebab"
                                                onClick={() => ubahSebabList(ti, (ss) => ss.filter((_, j) => j !== si))}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                        <div className="grid gap-2 sm:grid-cols-2">
                                            <Bidang label="Kode Sebab (Group)">
                                                <PilihKode
                                                    opsi={kodeRef.group_sebab}
                                                    value={s.kode_group}
                                                    onChange={(v) => patchSebab(ti, si, { kode_group: v, kode: null })}
                                                    placeholder="Pilih group sebab"
                                                />
                                            </Bidang>
                                            <Bidang label="Kode Sebab (Rincian)">
                                                <PilihKode
                                                    opsi={kodeRef.sebab.filter((o) => !s.kode_group || o.kode_group === s.kode_group)}
                                                    value={s.kode}
                                                    onChange={(v) => patchSebab(ti, si, { kode: v })}
                                                    placeholder="Pilih rincian"
                                                />
                                            </Bidang>
                                        </div>
                                        <Textarea
                                            value={s.memo}
                                            onChange={(e) => patchSebab(ti, si, { memo: e.target.value })}
                                            rows={2}
                                            placeholder="Sebab terjadinya temuan"
                                        />

                                        {/* Rekomendasi */}
                                        {s.rekomendasi.map((r, ri) => (
                                            <div
                                                key={ri}
                                                className="space-y-2 rounded-md border border-amber-200/60 bg-amber-50/60 p-3 dark:border-amber-900/40 dark:bg-amber-950/20"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Lightbulb className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                                                    <span className="text-xs font-medium tracking-wide text-amber-800 uppercase dark:text-amber-300">
                                                        Rekomendasi {ri + 1}
                                                    </span>
                                                    <Button
                                                        type="button"
                                                        size="icon"
                                                        variant="ghost"
                                                        className="text-destructive ml-auto h-7 w-7"
                                                        title="Hapus rekomendasi"
                                                        onClick={() => ubahRekomList(ti, si, (rs) => rs.filter((_, k) => k !== ri))}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                                <div className="grid gap-2 sm:grid-cols-2">
                                                    <Bidang label="Kode Rekomendasi (Group)">
                                                        <PilihKode
                                                            opsi={kodeRef.group_rekomendasi}
                                                            value={r.kode_group}
                                                            onChange={(v) => patchRekom(ti, si, ri, { kode_group: v, kode: null })}
                                                            placeholder="Pilih group"
                                                        />
                                                    </Bidang>
                                                    <Bidang label="Kode Rekomendasi (Rincian)">
                                                        <PilihKode
                                                            opsi={kodeRef.rekomendasi.filter((o) => !r.kode_group || o.kode_group === r.kode_group)}
                                                            value={r.kode}
                                                            onChange={(v) => patchRekom(ti, si, ri, { kode: v })}
                                                            placeholder="Pilih rincian"
                                                        />
                                                    </Bidang>
                                                </div>
                                                <Textarea
                                                    value={r.memo}
                                                    onChange={(e) => patchRekom(ti, si, ri, { memo: e.target.value })}
                                                    rows={2}
                                                    placeholder="Rekomendasi tim pemeriksa"
                                                />
                                                <Bidang label="Nilai Rekomendasi">
                                                    <Rupiah
                                                        value={r.nilai}
                                                        onChange={(n) => patchRekom(ti, si, ri, { nilai: n })}
                                                        className="sm:max-w-xs"
                                                    />
                                                </Bidang>

                                                {/* Tindak lanjut */}
                                                {r.tindak_lanjut.map((tl, li) => (
                                                    <div
                                                        key={li}
                                                        className="space-y-2 rounded border border-emerald-200/60 bg-emerald-50/50 p-2 dark:border-emerald-900/40 dark:bg-emerald-950/20"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-medium tracking-wide text-emerald-800 uppercase dark:text-emerald-300">
                                                                Tindak Lanjut {li + 1}
                                                            </span>
                                                            <Button
                                                                type="button"
                                                                size="icon"
                                                                variant="ghost"
                                                                className="text-destructive ml-auto h-7 w-7"
                                                                title="Hapus tindak lanjut"
                                                                onClick={() => ubahTLList(ti, si, ri, (ws) => ws.filter((_, m) => m !== li))}
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </div>
                                                        <div className="grid gap-2 sm:grid-cols-2">
                                                            <Bidang label="Tgl Tindak Lanjut">
                                                                <Input
                                                                    type="date"
                                                                    value={tl.tanggal ?? ''}
                                                                    onChange={(e) => patchTL(ti, si, ri, li, { tanggal: e.target.value || null })}
                                                                />
                                                            </Bidang>
                                                            <Bidang label="Nilai Tindak Lanjut">
                                                                <Rupiah value={tl.nilai} onChange={(n) => patchTL(ti, si, ri, li, { nilai: n })} />
                                                            </Bidang>
                                                            <Bidang label="Kode TL (Group)">
                                                                <PilihKode
                                                                    opsi={kodeRef.group_tl}
                                                                    value={tl.kode_group}
                                                                    onChange={(v) => patchTL(ti, si, ri, li, { kode_group: v, kode: null })}
                                                                    placeholder="Pilih group"
                                                                />
                                                            </Bidang>
                                                            <Bidang label="Kode TL (Rincian)">
                                                                <PilihKode
                                                                    opsi={kodeRef.tl.filter((o) => !tl.kode_group || o.kode_group === tl.kode_group)}
                                                                    value={tl.kode}
                                                                    onChange={(v) => patchTL(ti, si, ri, li, { kode: v })}
                                                                    placeholder="Pilih rincian"
                                                                />
                                                            </Bidang>
                                                        </div>
                                                        <Textarea
                                                            value={tl.memo ?? ''}
                                                            onChange={(e) => patchTL(ti, si, ri, li, { memo: e.target.value })}
                                                            rows={2}
                                                            placeholder="Uraian tindak lanjut"
                                                        />
                                                    </div>
                                                ))}
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-7 text-xs"
                                                    onClick={() => ubahTLList(ti, si, ri, (ws) => [...ws, kosongTL()])}
                                                >
                                                    <Plus className="h-3.5 w-3.5" />
                                                    Tindak lanjut
                                                </Button>
                                            </div>
                                        ))}
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="ghost"
                                            className="h-7 text-xs"
                                            onClick={() => ubahRekomList(ti, si, (rs) => [...rs, kosongRekom()])}
                                        >
                                            <Plus className="h-3.5 w-3.5" />
                                            Rekomendasi
                                        </Button>
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 text-xs"
                                    onClick={() => ubahSebabList(ti, (ss) => [...ss, kosongSebab()])}
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    Penyebab
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end">
                    <Button type="submit" disabled={processing}>
                        <Save className="h-4 w-4" />
                        Simpan LHP
                    </Button>
                </div>
            </form>
        </AppLayout>
    );
}

/** Input rupiah: tampil dengan pemisah ribuan (id-ID), simpan sebagai angka. */
function Rupiah({ value, onChange, className }: { value: number | null; onChange: (n: number | null) => void; className?: string }) {
    const tampil = value === null || value === undefined ? '' : new Intl.NumberFormat('id-ID').format(value);
    return (
        <Input
            inputMode="numeric"
            value={tampil}
            className={className}
            onChange={(e) => {
                const digit = e.target.value.replace(/[^\d]/g, '');
                onChange(digit === '' ? null : Number(digit));
            }}
            placeholder="0"
        />
    );
}

/** Dropdown kode: menampilkan "kode — nama", menyimpan kode. */
function PilihKode({
    opsi,
    value,
    onChange,
    placeholder,
}: {
    opsi: Opsi[];
    value: string | null;
    onChange: (v: string | null) => void;
    placeholder?: string;
}) {
    return (
        <Select value={value ?? '__'} onValueChange={(v) => onChange(v === '__' ? null : v)}>
            <SelectTrigger>
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
                <SelectItem value="__">— kosong —</SelectItem>
                {opsi.map((o) => (
                    <SelectItem key={o.kode} value={o.kode}>
                        <span className="font-mono">{o.kode}</span> — {o.nama}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

function PilihTeks({
    opsi,
    value,
    onChange,
    placeholder,
}: {
    opsi: string[];
    value: string | null;
    onChange: (v: string) => void;
    placeholder?: string;
}) {
    return (
        <Select value={value ?? ''} onValueChange={onChange}>
            <SelectTrigger>
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                {opsi.map((o) => (
                    <SelectItem key={o} value={o}>
                        {o}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

function Radio({ label, value, onChange, opsi }: { label: string; value: string | null; onChange: (v: string) => void; opsi: [string, string][] }) {
    return (
        <div className="space-y-1.5">
            <Label className="text-xs">{label}</Label>
            <div className="flex gap-2">
                {opsi.map(([v, teks]) => (
                    <button
                        key={v}
                        type="button"
                        onClick={() => onChange(v)}
                        className={`rounded-md border px-3 py-1.5 text-sm transition ${value === v ? 'border-primary bg-primary/10 font-medium' : 'hover:bg-muted'}`}
                    >
                        {teks}
                    </button>
                ))}
            </div>
        </div>
    );
}

function Bidang({ label, wajib, galat, children }: { label: string; wajib?: boolean; galat?: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1.5">
            <Label className="text-xs">
                {label} {wajib && <span className="text-destructive">*</span>}
            </Label>
            {children}
            {galat && <p className="text-destructive text-xs">{galat}</p>}
        </div>
    );
}
