import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { type FraudRow, type FraudSharedProps } from './shell';

export type Tahap = 'identifikasi' | 'analisis' | 'rtp';

const KOSONG = {
    tahapan_proses: '',
    nama_risiko: '',
    skenario_risiko: '',
    uraian_penyebab: '',
    uraian_dampak: '',
    kelompok_risiko: [] as string[],
    probabilitas_inheren: '',
    dampak_inheren: '',
    pengendalian_ada: '',
    pengendalian_uraian: '',
    pengendalian_memadai: '',
    probabilitas_residual: '',
    dampak_residual: '',
    pernyataan_penyebab: '',
    rencana_mitigasi: '',
    jadwal_mitigasi: '',
    penanggung_jawab: '',
    opd_id: '' as string,
};

type Nilai = typeof KOSONG;

const dariBaris = (r: FraudRow): Nilai => ({
    tahapan_proses: r.tahapan_proses ?? '',
    nama_risiko: r.nama_risiko ?? '',
    skenario_risiko: r.skenario_risiko ?? '',
    uraian_penyebab: r.uraian_penyebab ?? '',
    uraian_dampak: r.uraian_dampak ?? '',
    kelompok_risiko: r.kelompok_risiko ?? [],
    probabilitas_inheren: r.probabilitas_inheren ? String(r.probabilitas_inheren) : '',
    dampak_inheren: r.dampak_inheren ? String(r.dampak_inheren) : '',
    pengendalian_ada: r.pengendalian_ada ?? '',
    pengendalian_uraian: r.pengendalian_uraian ?? '',
    pengendalian_memadai: r.pengendalian_memadai ?? '',
    probabilitas_residual: r.probabilitas_residual ? String(r.probabilitas_residual) : '',
    dampak_residual: r.dampak_residual ? String(r.dampak_residual) : '',
    pernyataan_penyebab: r.pernyataan_penyebab ?? '',
    rencana_mitigasi: r.rencana_mitigasi ?? '',
    jadwal_mitigasi: r.jadwal_mitigasi ?? '',
    penanggung_jawab: r.penanggung_jawab ?? '',
    opd_id: r.opd_id ? String(r.opd_id) : '',
});

const SKALA = [1, 2, 3, 4, 5];

export function FormRisiko({
    tahap,
    baris,
    terbuka,
    tutup,
    shared,
    pengendalianAdaOptions = ['Ada', 'Belum Ada'],
    pengendalianMemadaiOptions = ['Memadai', 'Belum Memadai'],
}: {
    tahap: Tahap;
    baris: FraudRow | null;
    terbuka: boolean;
    tutup: () => void;
    shared: FraudSharedProps;
    pengendalianAdaOptions?: string[];
    pengendalianMemadaiOptions?: string[];
}) {
    const [nilai, setNilai] = useState<Nilai>(KOSONG);
    const [menyimpan, setMenyimpan] = useState(false);

    useEffect(() => {
        setNilai(baris ? dariBaris(baris) : KOSONG);
    }, [baris, terbuka]);

    const ubah = (kunci: keyof Nilai, v: unknown) => setNilai((n) => ({ ...n, [kunci]: v }));

    const simpan = () => {
        setMenyimpan(true);

        // Kolom kosong dikirim sebagai null, bukan string kosong: aturan
        // validasinya `nullable` + `integer`/`Rule::in`, dan string kosong
        // gagal keduanya.
        const muatan: Record<string, string | string[] | number | null> = { tahun_penilaian: shared.tahun };
        (Object.keys(nilai) as (keyof Nilai)[]).forEach((k) => {
            const v = nilai[k];
            muatan[k] = Array.isArray(v) ? v : v === '' ? null : v;
        });

        const selesai = {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(baris ? 'Risiko diperbarui.' : 'Risiko ditambahkan.');
                tutup();
            },
            onError: (e: Record<string, string>) => toast.error(Object.values(e)[0] ?? 'Gagal menyimpan.'),
            onFinish: () => setMenyimpan(false),
        };

        if (baris) {
            router.put(`/fraud/${baris.id}`, muatan, selesai);
        } else {
            router.post('/fraud', muatan, selesai);
        }
    };

    const judul =
        tahap === 'identifikasi'
            ? baris
                ? 'Ubah Identifikasi Risiko'
                : 'Tambah Risiko Kecurangan'
            : tahap === 'analisis'
              ? 'Analisis Risiko'
              : 'Rencana Tindak Pengendalian';

    return (
        <Dialog open={terbuka} onOpenChange={(o) => !o && tutup()}>
            <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{judul}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {tahap !== 'identifikasi' && baris && (
                        <div className="bg-muted rounded-md p-3 text-sm">
                            <span className="text-muted-foreground">Risiko: </span>
                            <span className="font-medium">{baris.nama_risiko}</span>
                        </div>
                    )}

                    {tahap === 'identifikasi' && (
                        <>
                            {shared.isAdmin && (
                                <div>
                                    <Label>Perangkat Daerah</Label>
                                    <Select value={nilai.opd_id} onValueChange={(v) => ubah('opd_id', v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih Perangkat Daerah" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {shared.opdList.map((o) => (
                                                <SelectItem key={o.id} value={String(o.id)}>
                                                    {o.nama}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <div>
                                <Label>Tahapan Proses</Label>
                                <Select value={nilai.tahapan_proses} onValueChange={(v) => ubah('tahapan_proses', v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih tahapan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {shared.tahapanOptions.map((t) => (
                                            <SelectItem key={t} value={t}>
                                                {t}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Nama Risiko *</Label>
                                <Textarea rows={2} value={nilai.nama_risiko} onChange={(e) => ubah('nama_risiko', e.target.value)} />
                            </div>

                            <div>
                                <Label>Skenario Risiko</Label>
                                <Textarea
                                    rows={3}
                                    value={nilai.skenario_risiko}
                                    onChange={(e) => ubah('skenario_risiko', e.target.value)}
                                    placeholder="Bagaimana kecurangan itu terjadi: siapa, lewat apa, pada tahap mana."
                                />
                            </div>

                            <div>
                                <Label>Uraian Penyebab</Label>
                                <Textarea rows={3} value={nilai.uraian_penyebab} onChange={(e) => ubah('uraian_penyebab', e.target.value)} />
                            </div>

                            <div>
                                <Label>Uraian Dampak</Label>
                                <Textarea rows={3} value={nilai.uraian_dampak} onChange={(e) => ubah('uraian_dampak', e.target.value)} />
                            </div>

                            <div>
                                <Label>Kelompok Risiko</Label>
                                <p className="text-muted-foreground mb-2 text-xs">
                                    Tujuh delik tindak pidana korupsi menurut UU No. 31/1999 jo. UU No. 20/2001. Boleh lebih dari satu.
                                </p>
                                <div className="grid gap-2 sm:grid-cols-2">
                                    {shared.kelompokOptions.map((k) => (
                                        <label key={k} className="flex items-start gap-2 text-sm">
                                            <Checkbox
                                                checked={nilai.kelompok_risiko.includes(k)}
                                                onCheckedChange={(c) =>
                                                    ubah(
                                                        'kelompok_risiko',
                                                        c ? [...nilai.kelompok_risiko, k] : nilai.kelompok_risiko.filter((x) => x !== k),
                                                    )
                                                }
                                            />
                                            <span>{k}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {tahap === 'analisis' && (
                        <>
                            <fieldset className="rounded-md border p-3">
                                <legend className="px-1 text-sm font-medium">Risiko Melekat (inheren)</legend>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <SkalaPilih
                                        label="Skor Probabilitas"
                                        nilai={nilai.probabilitas_inheren}
                                        ubah={(v) => ubah('probabilitas_inheren', v)}
                                    />
                                    <SkalaPilih label="Skor Dampak" nilai={nilai.dampak_inheren} ubah={(v) => ubah('dampak_inheren', v)} />
                                </div>
                            </fieldset>

                            <fieldset className="rounded-md border p-3">
                                <legend className="px-1 text-sm font-medium">Pengendalian Terpasang</legend>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div>
                                        <Label>Ada / Belum Ada</Label>
                                        <Select value={nilai.pengendalian_ada} onValueChange={(v) => ubah('pengendalian_ada', v)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {pengendalianAdaOptions.map((o) => (
                                                    <SelectItem key={o} value={o}>
                                                        {o}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Memadai / Belum Memadai</Label>
                                        <Select value={nilai.pengendalian_memadai} onValueChange={(v) => ubah('pengendalian_memadai', v)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {pengendalianMemadaiOptions.map((o) => (
                                                    <SelectItem key={o} value={o}>
                                                        {o}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <Label>Uraian Pengendalian</Label>
                                    <Textarea
                                        rows={3}
                                        value={nilai.pengendalian_uraian}
                                        onChange={(e) => ubah('pengendalian_uraian', e.target.value)}
                                    />
                                </div>
                            </fieldset>

                            <fieldset className="rounded-md border p-3">
                                <legend className="px-1 text-sm font-medium">Risiko Residu (setelah pengendalian)</legend>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <SkalaPilih
                                        label="Skor Probabilitas"
                                        nilai={nilai.probabilitas_residual}
                                        ubah={(v) => ubah('probabilitas_residual', v)}
                                    />
                                    <SkalaPilih label="Skor Dampak" nilai={nilai.dampak_residual} ubah={(v) => ubah('dampak_residual', v)} />
                                </div>
                            </fieldset>

                            <p className="text-muted-foreground text-xs">
                                Besaran dan level risiko tidak diisi di sini — keduanya turunan dari matriks 5×5 resmi, dan dihitung sendiri begitu
                                kedua skor terisi.
                            </p>
                        </>
                    )}

                    {tahap === 'rtp' && (
                        <>
                            <div>
                                <Label>Pernyataan Penyebab</Label>
                                <Textarea rows={3} value={nilai.pernyataan_penyebab} onChange={(e) => ubah('pernyataan_penyebab', e.target.value)} />
                            </div>
                            <div>
                                <Label>Rencana Pengendalian / Mitigasi Risiko</Label>
                                <Textarea rows={4} value={nilai.rencana_mitigasi} onChange={(e) => ubah('rencana_mitigasi', e.target.value)} />
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div>
                                    <Label>Jadwal Pelaksanaan Mitigasi</Label>
                                    <Input
                                        value={nilai.jadwal_mitigasi}
                                        onChange={(e) => ubah('jadwal_mitigasi', e.target.value)}
                                        placeholder="mis. Triwulan II s.d. Triwulan IV 2026"
                                    />
                                </div>
                                <div>
                                    <Label>Penanggung Jawab</Label>
                                    <Input value={nilai.penanggung_jawab} onChange={(e) => ubah('penanggung_jawab', e.target.value)} />
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={tutup}>
                        Batal
                    </Button>
                    <Button onClick={simpan} disabled={menyimpan || nilai.nama_risiko.trim() === ''}>
                        {menyimpan ? 'Menyimpan…' : 'Simpan'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function SkalaPilih({ label, nilai, ubah }: { label: string; nilai: string; ubah: (v: string) => void }) {
    return (
        <div>
            <Label>{label}</Label>
            <Select value={nilai} onValueChange={ubah}>
                <SelectTrigger>
                    <SelectValue placeholder="1 - 5" />
                </SelectTrigger>
                <SelectContent>
                    {SKALA.map((s) => (
                        <SelectItem key={s} value={String(s)}>
                            {s}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
