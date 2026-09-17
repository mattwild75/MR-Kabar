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
    nilai: number | null;
    tanggal: string | null;
    memo: string | null;
};
type Rekomendasi = {
    id?: number;
    nilai: number | null;
    memo: string;
    tindak_lanjut: TindakLanjut[];
};
type Sebab = {
    id?: number;
    memo: string;
    rekomendasi: Rekomendasi[];
};
type Temuan = {
    id?: number;
    kode: string | null;
    nilai: number | null;
    memo: string;
    status: string | null;
    sebab: Sebab[];
};
type Anggota = {
    id?: number;
    nip: string | null;
    nama: string;
    jabatan: string | null;
};
type LhpForm = {
    nomor_lhp: string;
    tanggal_lhp: string | null;
    nomor_st: string | null;
    tanggal_st: string | null;
    tahun_anggaran: string | null;
    nama_obrik: string;
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

interface Props {
    lhp: (LhpForm & { id: number }) | null;
    statusPilihan: { value: string; label: string }[];
    jabatanPilihan: string[];
}

const kosongTindakLanjut = (): TindakLanjut => ({ nilai: null, tanggal: null, memo: '' });
const kosongRekomendasi = (): Rekomendasi => ({ nilai: null, memo: '', tindak_lanjut: [] });
const kosongSebab = (): Sebab => ({ memo: '', rekomendasi: [kosongRekomendasi()] });
const kosongTemuan = (): Temuan => ({ kode: null, nilai: null, memo: '', status: null, sebab: [kosongSebab()] });

export default function LhpFormPage({ lhp, statusPilihan, jabatanPilihan }: Props) {
    const awal: LhpForm = lhp ?? {
        nomor_lhp: '',
        tanggal_lhp: null,
        nomor_st: null,
        tanggal_st: null,
        tahun_anggaran: null,
        nama_obrik: '',
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
        { title: 'Laporan Penugasan', href: '#' },
        { title: 'Database LHP', href: BASE },
        { title: lhp ? `Sunting ${lhp.nomor_lhp}` : 'Tambah LHP', href: '#' },
    ];

    // Mutator temuan tunggal — set salinan baru agar Inertia mendeteksi perubahan.
    const ubahTemuan = (fn: (t: Temuan[]) => Temuan[]) => setData('temuan', fn(data.temuan));
    const ubahTim = (fn: (t: Anggota[]) => Anggota[]) => setData('tim', fn(data.tim));

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (lhp) put(`${BASE}/${lhp.id}`);
        else post(BASE);
    };

    const num = (v: string): number | null => (v.trim() === '' ? null : Number(v));

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
                        <Bidang label="Nomor Surat Tugas" galat={errors.nomor_st}>
                            <Input value={data.nomor_st ?? ''} onChange={(e) => setData('nomor_st', e.target.value || null)} />
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
                    <div className="grid gap-4 sm:grid-cols-3">
                        <Bidang label="Tahun Anggaran" galat={errors.tahun_anggaran}>
                            <Input
                                value={data.tahun_anggaran ?? ''}
                                onChange={(e) => setData('tahun_anggaran', e.target.value || null)}
                                placeholder="2026"
                            />
                        </Bidang>
                        <Bidang label="Nilai Anggaran" galat={errors.nilai_anggaran}>
                            <Input
                                type="number"
                                step="0.01"
                                value={data.nilai_anggaran ?? ''}
                                onChange={(e) => setData('nilai_anggaran', num(e.target.value))}
                            />
                        </Bidang>
                        <Bidang label="Anggaran Diaudit" galat={errors.anggaran_diaudit}>
                            <Input
                                type="number"
                                step="0.01"
                                value={data.anggaran_diaudit ?? ''}
                                onChange={(e) => setData('anggaran_diaudit', num(e.target.value))}
                            />
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
                            onClick={() => ubahTim((ts) => [...ts, { nip: null, nama: '', jabatan: jabatanPilihan[ts.length] ?? 'Anggota Tim' }])}
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
                                onChange={(e) => ubahTim((ts) => ts.map((x, i) => (i === mi ? { ...x, nama: e.target.value } : x)))}
                                placeholder="Nama"
                            />
                            <Input
                                value={m.nip ?? ''}
                                onChange={(e) => ubahTim((ts) => ts.map((x, i) => (i === mi ? { ...x, nip: e.target.value || null } : x)))}
                                placeholder="NIP"
                            />
                            <Select
                                value={m.jabatan ?? ''}
                                onValueChange={(v) => ubahTim((ts) => ts.map((x, i) => (i === mi ? { ...x, jabatan: v } : x)))}
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
                                onClick={() => ubahTim((ts) => ts.filter((_, i) => i !== mi))}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                            {errors[`tim.${mi}.nama` as keyof LhpForm] && (
                                <p className="text-destructive text-xs sm:col-span-4">Nama anggota wajib diisi.</p>
                            )}
                        </div>
                    ))}
                </div>

                {/* Temuan */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-semibold tracking-tight">Temuan</h2>
                        <Button type="button" size="sm" variant="outline" onClick={() => ubahTemuan((ts) => [...ts, kosongTemuan()])}>
                            <Plus className="h-4 w-4" />
                            Tambah Temuan
                        </Button>
                    </div>

                    {data.temuan.map((t, ti) => (
                        <div key={ti} className="bg-card space-y-3 rounded-md border p-4">
                            <div className="flex items-center gap-2">
                                <ClipboardList className="text-muted-foreground h-4 w-4" />
                                <span className="text-sm font-semibold">Temuan {ti + 1}</span>
                                <div className="ml-auto flex items-center gap-2">
                                    <Input
                                        value={t.kode ?? ''}
                                        onChange={(e) =>
                                            ubahTemuan((ts) => ts.map((x, i) => (i === ti ? { ...x, kode: e.target.value || null } : x)))
                                        }
                                        placeholder="Kode"
                                        className="h-8 w-24"
                                    />
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={t.nilai ?? ''}
                                        onChange={(e) => ubahTemuan((ts) => ts.map((x, i) => (i === ti ? { ...x, nilai: num(e.target.value) } : x)))}
                                        placeholder="Nilai (Rp)"
                                        className="h-8 w-36"
                                    />
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="ghost"
                                        className="text-destructive h-8 w-8"
                                        title="Hapus temuan"
                                        onClick={() => ubahTemuan((ts) => ts.filter((_, i) => i !== ti))}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <Textarea
                                value={t.memo}
                                onChange={(e) => ubahTemuan((ts) => ts.map((x, i) => (i === ti ? { ...x, memo: e.target.value } : x)))}
                                rows={3}
                                placeholder="Uraian temuan / kondisi"
                            />
                            {errors[`temuan.${ti}.memo` as keyof LhpForm] && <p className="text-destructive text-xs">Uraian temuan wajib diisi.</p>}

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
                                                onClick={() =>
                                                    ubahTemuan((ts) =>
                                                        ts.map((x, i) => (i === ti ? { ...x, sebab: x.sebab.filter((_, j) => j !== si) } : x)),
                                                    )
                                                }
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                        <Textarea
                                            value={s.memo}
                                            onChange={(e) =>
                                                ubahTemuan((ts) =>
                                                    ts.map((x, i) =>
                                                        i === ti
                                                            ? { ...x, sebab: x.sebab.map((y, j) => (j === si ? { ...y, memo: e.target.value } : y)) }
                                                            : x,
                                                    ),
                                                )
                                            }
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
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        value={r.nilai ?? ''}
                                                        onChange={(e) =>
                                                            ubahTemuan((ts) =>
                                                                ts.map((x, i) =>
                                                                    i === ti
                                                                        ? {
                                                                              ...x,
                                                                              sebab: x.sebab.map((y, j) =>
                                                                                  j === si
                                                                                      ? {
                                                                                            ...y,
                                                                                            rekomendasi: y.rekomendasi.map((z, k) =>
                                                                                                k === ri ? { ...z, nilai: num(e.target.value) } : z,
                                                                                            ),
                                                                                        }
                                                                                      : y,
                                                                              ),
                                                                          }
                                                                        : x,
                                                                ),
                                                            )
                                                        }
                                                        placeholder="Nilai (Rp)"
                                                        className="ml-auto h-7 w-32"
                                                    />
                                                    <Button
                                                        type="button"
                                                        size="icon"
                                                        variant="ghost"
                                                        className="text-destructive h-7 w-7"
                                                        title="Hapus rekomendasi"
                                                        onClick={() =>
                                                            ubahTemuan((ts) =>
                                                                ts.map((x, i) =>
                                                                    i === ti
                                                                        ? {
                                                                              ...x,
                                                                              sebab: x.sebab.map((y, j) =>
                                                                                  j === si
                                                                                      ? {
                                                                                            ...y,
                                                                                            rekomendasi: y.rekomendasi.filter((_, k) => k !== ri),
                                                                                        }
                                                                                      : y,
                                                                              ),
                                                                          }
                                                                        : x,
                                                                ),
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                                <Textarea
                                                    value={r.memo}
                                                    onChange={(e) =>
                                                        ubahTemuan((ts) =>
                                                            ts.map((x, i) =>
                                                                i === ti
                                                                    ? {
                                                                          ...x,
                                                                          sebab: x.sebab.map((y, j) =>
                                                                              j === si
                                                                                  ? {
                                                                                        ...y,
                                                                                        rekomendasi: y.rekomendasi.map((z, k) =>
                                                                                            k === ri ? { ...z, memo: e.target.value } : z,
                                                                                        ),
                                                                                    }
                                                                                  : y,
                                                                          ),
                                                                      }
                                                                    : x,
                                                            ),
                                                        )
                                                    }
                                                    rows={2}
                                                    placeholder="Rekomendasi tim pemeriksa"
                                                />

                                                {/* Tindak lanjut */}
                                                {r.tindak_lanjut.map((tl, li) => (
                                                    <div
                                                        key={li}
                                                        className="flex items-start gap-2 rounded border border-emerald-200/60 bg-emerald-50/50 p-2 dark:border-emerald-900/40 dark:bg-emerald-950/20"
                                                    >
                                                        <div className="flex-1 space-y-1.5">
                                                            <div className="flex gap-2">
                                                                <Input
                                                                    type="date"
                                                                    value={tl.tanggal ?? ''}
                                                                    onChange={(e) =>
                                                                        setTL(ubahTemuan, ti, si, ri, li, { tanggal: e.target.value || null })
                                                                    }
                                                                    className="h-7 w-40"
                                                                />
                                                                <Input
                                                                    type="number"
                                                                    step="0.01"
                                                                    value={tl.nilai ?? ''}
                                                                    onChange={(e) =>
                                                                        setTL(ubahTemuan, ti, si, ri, li, { nilai: num(e.target.value) })
                                                                    }
                                                                    placeholder="Nilai TL (Rp)"
                                                                    className="h-7 w-32"
                                                                />
                                                            </div>
                                                            <Textarea
                                                                value={tl.memo ?? ''}
                                                                onChange={(e) => setTL(ubahTemuan, ti, si, ri, li, { memo: e.target.value })}
                                                                rows={2}
                                                                placeholder="Uraian tindak lanjut"
                                                            />
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            size="icon"
                                                            variant="ghost"
                                                            className="text-destructive h-7 w-7"
                                                            title="Hapus tindak lanjut"
                                                            onClick={() =>
                                                                ubahTemuan((ts) =>
                                                                    ts.map((x, i) =>
                                                                        i === ti
                                                                            ? {
                                                                                  ...x,
                                                                                  sebab: x.sebab.map((y, j) =>
                                                                                      j === si
                                                                                          ? {
                                                                                                ...y,
                                                                                                rekomendasi: y.rekomendasi.map((z, k) =>
                                                                                                    k === ri
                                                                                                        ? {
                                                                                                              ...z,
                                                                                                              tindak_lanjut: z.tindak_lanjut.filter(
                                                                                                                  (_, m) => m !== li,
                                                                                                              ),
                                                                                                          }
                                                                                                        : z,
                                                                                                ),
                                                                                            }
                                                                                          : y,
                                                                                  ),
                                                                              }
                                                                            : x,
                                                                    ),
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                ))}
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-7 text-xs"
                                                    onClick={() =>
                                                        ubahTemuan((ts) =>
                                                            ts.map((x, i) =>
                                                                i === ti
                                                                    ? {
                                                                          ...x,
                                                                          sebab: x.sebab.map((y, j) =>
                                                                              j === si
                                                                                  ? {
                                                                                        ...y,
                                                                                        rekomendasi: y.rekomendasi.map((z, k) =>
                                                                                            k === ri
                                                                                                ? {
                                                                                                      ...z,
                                                                                                      tindak_lanjut: [
                                                                                                          ...z.tindak_lanjut,
                                                                                                          kosongTindakLanjut(),
                                                                                                      ],
                                                                                                  }
                                                                                                : z,
                                                                                        ),
                                                                                    }
                                                                                  : y,
                                                                          ),
                                                                      }
                                                                    : x,
                                                            ),
                                                        )
                                                    }
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
                                            onClick={() =>
                                                ubahTemuan((ts) =>
                                                    ts.map((x, i) =>
                                                        i === ti
                                                            ? {
                                                                  ...x,
                                                                  sebab: x.sebab.map((y, j) =>
                                                                      j === si ? { ...y, rekomendasi: [...y.rekomendasi, kosongRekomendasi()] } : y,
                                                                  ),
                                                              }
                                                            : x,
                                                    ),
                                                )
                                            }
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
                                    onClick={() =>
                                        ubahTemuan((ts) => ts.map((x, i) => (i === ti ? { ...x, sebab: [...x.sebab, kosongSebab()] } : x)))
                                    }
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

/** Perbarui satu tindak lanjut secara mendalam tanpa menulis ulang seluruh rantai. */
function setTL(ubahTemuan: (fn: (t: Temuan[]) => Temuan[]) => void, ti: number, si: number, ri: number, li: number, patch: Partial<TindakLanjut>) {
    ubahTemuan((ts) =>
        ts.map((x, i) =>
            i === ti
                ? {
                      ...x,
                      sebab: x.sebab.map((y, j) =>
                          j === si
                              ? {
                                    ...y,
                                    rekomendasi: y.rekomendasi.map((z, k) =>
                                        k === ri ? { ...z, tindak_lanjut: z.tindak_lanjut.map((w, m) => (m === li ? { ...w, ...patch } : w)) } : z,
                                    ),
                                }
                              : y,
                      ),
                  }
                : x,
        ),
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
