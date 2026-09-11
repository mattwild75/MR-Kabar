import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useForm, usePage } from '@inertiajs/react';
import { Copy, Paperclip, ShieldAlert, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

interface OpdOption {
    id: number;
    nama: string;
}

interface Props {
    opdList: OpdOption[];
    tahapanOptions: string[];
    kelompokOptions: string[];
}

/**
 * Tiga tingkat kerahasiaan pelapor.
 *
 * "Anonim" saja menggabungkan dua orang yang berbeda kebutuhan: yang tidak mau
 * namanya muncul di berkas, dan yang tidak mau dihubungi sama sekali. Yang
 * pertama umumnya bersedia dihubungi Inspektorat — memaksanya memilih salah
 * satu ujung membuat sebagian orang memilih tidak melapor.
 */
const MODE = [
    {
        kunci: 'terbuka' as const,
        judul: 'Terbuka',
        ringkas: 'Nama dan kontak Anda tersimpan. Penindaklanjut dapat menghubungi Anda langsung.',
    },
    {
        kunci: 'anonim_kontak' as const,
        judul: 'Anonim, tetapi bisa dihubungi',
        ringkas: 'Nama Anda tidak disimpan. Kontak Anda tersimpan dan hanya terbaca penindaklanjut.',
    },
    {
        kunci: 'anonim_penuh' as const,
        judul: 'Anonim penuh',
        ringkas: 'Nama maupun kontak tidak disimpan sama sekali. Hubungan hanya lewat nomor tiket.',
    },
];

/**
 * Isi tab "Dugaan Kecurangan" pada halaman Lapor.
 *
 * Dasar: Perdep BPKP Bidang Investigasi No. 1 Tahun 2019 dan Perbup Aceh Barat
 * No. 6 Tahun 2025 tentang Pengendalian Kecurangan.
 *
 * Urutan pertanyaannya mengikuti unsur yang dituntut pedoman — apa, di mana,
 * kapan, siapa, bagaimana — bukan urutan kolom di basis data. Yang wajib hanya
 * uraian kejadiannya; sisanya boleh kosong, sebab pelapor yang menyaksikan
 * sesuatu belum tentu tahu seluruhnya, dan formulir yang menuntut kelengkapan
 * membuat orang mengurungkan laporan.
 */
export default function FormKecurangan({ opdList, tahapanOptions, kelompokOptions }: Props) {
    // Nomor tiket + kode akses hasil pengiriman barusan. Lewat flash, bukan
    // prop tetap: kode aksesnya hanya boleh muncul SEKALI, sebab yang tersimpan
    // di server cuma hashnya dan tidak ada cara memulihkannya.
    const tiketBaru = (usePage().props as unknown as { flash?: { tiketBaru?: { nomor_tiket: string; kode_akses: string } } }).flash?.tiketBaru;

    const { data, setData, post, processing, errors, reset } = useForm({
        mode_pelapor: 'terbuka' as 'terbuka' | 'anonim_kontak' | 'anonim_penuh',
        nama_pelapor: '',
        email: '',
        no_hp: '',
        opd_id: '',
        tahapan_proses: '',
        dugaan_kelompok: [] as string[],
        uraian_kejadian: '',
        tempat: '',
        waktu_kejadian: '',
        pihak_terlibat: '',
        kronologi: '',
        perkiraan_kerugian: '',
        bukti_keterangan: '',
        bukti: [] as File[],
    });

    const berkasRef = useRef<HTMLInputElement>(null);
    const [seret, setSeret] = useState(false);

    const kirim = (e: React.FormEvent) => {
        e.preventDefault();
        post('/lapor-kecurangan', {
            // Wajib: tanpa ini Inertia mengirim JSON dan berkasnya hilang
            // diam-diam — formulirnya tetap tersimpan, hanya tanpa bukti.
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Laporan dugaan kecurangan terkirim. Terima kasih.');
                reset();
                if (berkasRef.current) berkasRef.current.value = '';
            },
            onError: () => toast.error('Gagal mengirim laporan. Periksa kembali isian Anda.'),
        });
    };

    return (
        <form onSubmit={kirim} className="mx-auto max-w-2xl space-y-4">
            {tiketBaru && (
                <div className="rounded-md border-2 border-emerald-500/60 bg-emerald-50 p-4 dark:bg-emerald-950/30">
                    <p className="font-semibold text-emerald-900 dark:text-emerald-200">Laporan terkirim. Simpan dua baris ini sekarang.</p>
                    <dl className="mt-3 space-y-2">
                        <div>
                            <dt className="text-xs text-emerald-800 dark:text-emerald-300">Nomor Tiket</dt>
                            <dd className="font-mono text-lg font-bold tracking-wider">{tiketBaru.nomor_tiket}</dd>
                        </div>
                        <div>
                            <dt className="text-xs text-emerald-800 dark:text-emerald-300">Kode Akses</dt>
                            <dd className="font-mono text-lg font-bold tracking-widest">{tiketBaru.kode_akses}</dd>
                        </div>
                    </dl>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() => {
                            navigator.clipboard
                                ?.writeText(`${tiketBaru.nomor_tiket} / ${tiketBaru.kode_akses}`)
                                .then(() => toast.success('Tersalin.'))
                                .catch(() => toast.error('Gagal menyalin. Catat manual.'));
                        }}
                    >
                        <Copy className="mr-2 h-4 w-4" />
                        Salin
                    </Button>
                    <p className="mt-3 text-xs text-emerald-900 dark:text-emerald-300">
                        Kode akses <strong>tidak bisa dipulihkan</strong> kalau hilang — memulihkannya menuntut identitas Anda, dan itu persis yang
                        sedang dijaga. Pakai keduanya di tab <strong>Cek Status Laporan</strong> untuk melihat perkembangan dan menjawab pertanyaan
                        penindaklanjut.
                    </p>
                </div>
            )}

            <div className="flex items-start gap-2">
                <ShieldAlert className="text-destructive mt-0.5 h-6 w-6 shrink-0" />
                <div>
                    <h2 className="text-xl font-semibold">Lapor Dugaan Kecurangan</h2>
                    <p className="text-muted-foreground text-sm">
                        Laporkan dugaan kecurangan — penyuapan, gratifikasi, mark up, benturan kepentingan, dan sejenisnya — pada penyelenggaraan
                        urusan pemerintahan daerah.
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Identitas Pelapor</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        {MODE.map((m) => {
                            const aktif = data.mode_pelapor === m.kunci;
                            return (
                                <label
                                    key={m.kunci}
                                    className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 text-sm ${
                                        aktif ? 'border-primary bg-primary/5' : ''
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="mode_pelapor"
                                        className="mt-1"
                                        checked={aktif}
                                        onChange={() =>
                                            // Identitas dikosongkan saat berpindah ke mode
                                            // anonim. Server juga membersihkannya sendiri —
                                            // ini hanya supaya yang terlihat di layar jujur
                                            // dengan apa yang akan tersimpan.
                                            setData((d) => ({
                                                ...d,
                                                mode_pelapor: m.kunci,
                                                nama_pelapor: m.kunci === 'terbuka' ? d.nama_pelapor : '',
                                                email: m.kunci === 'anonim_penuh' ? '' : d.email,
                                                no_hp: m.kunci === 'anonim_penuh' ? '' : d.no_hp,
                                            }))
                                        }
                                    />
                                    <span>
                                        <span className="font-medium">{m.judul}</span>
                                        <span className="text-muted-foreground block text-xs">{m.ringkas}</span>
                                    </span>
                                </label>
                            );
                        })}
                    </div>

                    {data.mode_pelapor === 'anonim_penuh' && (
                        <p className="rounded-md border border-amber-500/50 bg-amber-50 p-3 text-xs text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
                            Tidak ada seorang pun yang dapat menghubungi Anda untuk meminta keterangan tambahan. Karena itu, lengkapi keterangan di
                            bawah sedetail yang Anda ketahui — kelengkapan sekarang menentukan bisa atau tidaknya laporan ini ditelaah. Anda tetap
                            dapat kembali membaca perkembangannya dan menjawab pertanyaan lewat nomor tiket yang muncul setelah mengirim.
                        </p>
                    )}

                    {data.mode_pelapor !== 'anonim_penuh' && (
                        <div className="space-y-4">
                            {data.mode_pelapor === 'terbuka' && (
                                <div>
                                    <Label htmlFor="nama_pelapor">Nama Lengkap</Label>
                                    <Input id="nama_pelapor" value={data.nama_pelapor} onChange={(e) => setData('nama_pelapor', e.target.value)} />
                                    {errors.nama_pelapor && <p className="text-destructive text-xs">{errors.nama_pelapor}</p>}
                                </div>
                            )}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <Label htmlFor="email_fraud">Email</Label>
                                    <Input id="email_fraud" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                                    {errors.email && <p className="text-destructive text-xs">{errors.email}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="no_hp_fraud">Nomor HP</Label>
                                    <Input id="no_hp_fraud" value={data.no_hp} onChange={(e) => setData('no_hp', e.target.value)} />
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Kejadian yang Dilaporkan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="uraian_kejadian">Apa yang terjadi? *</Label>
                        <Textarea
                            id="uraian_kejadian"
                            rows={4}
                            value={data.uraian_kejadian}
                            onChange={(e) => setData('uraian_kejadian', e.target.value)}
                            placeholder="Jelaskan singkat dugaan kecurangan yang Anda ketahui."
                        />
                        {errors.uraian_kejadian && <p className="text-destructive text-xs">{errors.uraian_kejadian}</p>}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <Label htmlFor="tempat_fraud">Di mana?</Label>
                            <Input
                                id="tempat_fraud"
                                value={data.tempat}
                                onChange={(e) => setData('tempat', e.target.value)}
                                placeholder="Unit kerja, lokasi kegiatan, atau tempat lainnya"
                            />
                        </div>
                        <div>
                            <Label>Kapan?</Label>
                            <DatePicker
                                value={data.waktu_kejadian}
                                onChange={(v: string) => setData('waktu_kejadian', v)}
                                placeholder="Pilih tanggal kejadian"
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="pihak_terlibat">Siapa yang diduga terlibat?</Label>
                        <Textarea
                            id="pihak_terlibat"
                            rows={2}
                            value={data.pihak_terlibat}
                            onChange={(e) => setData('pihak_terlibat', e.target.value)}
                            placeholder="Jabatan atau peran lebih menolong daripada nama saja."
                        />
                    </div>

                    <div>
                        <Label htmlFor="kronologi">Bagaimana kejadiannya?</Label>
                        <Textarea
                            id="kronologi"
                            rows={4}
                            value={data.kronologi}
                            onChange={(e) => setData('kronologi', e.target.value)}
                            placeholder="Urutan kejadian dari awal sampai Anda mengetahuinya."
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Keterangan Tambahan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <Label>Perangkat Daerah terkait</Label>
                            <Select value={data.opd_id} onValueChange={(v) => setData('opd_id', v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih bila diketahui" />
                                </SelectTrigger>
                                <SelectContent>
                                    {opdList.map((o) => (
                                        <SelectItem key={o.id} value={String(o.id)}>
                                            {o.nama}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Tahapan proses</Label>
                            <Select value={data.tahapan_proses} onValueChange={(v) => setData('tahapan_proses', v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih bila diketahui" />
                                </SelectTrigger>
                                <SelectContent>
                                    {tahapanOptions.map((t) => (
                                        <SelectItem key={t} value={t}>
                                            {t}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div>
                        <Label>Dugaan bentuk kecurangan</Label>
                        <p className="text-muted-foreground mb-2 text-xs">
                            Tujuh delik menurut UU No. 31/1999 jo. UU No. 20/2001. Pilih yang paling mendekati — penilaian akhirnya tetap oleh
                            penindaklanjut, bukan oleh pelapor.
                        </p>
                        <div className="grid gap-2 sm:grid-cols-2">
                            {kelompokOptions.map((k) => (
                                <label key={k} className="flex items-start gap-2 text-sm">
                                    <Checkbox
                                        checked={data.dugaan_kelompok.includes(k)}
                                        onCheckedChange={(c) =>
                                            setData('dugaan_kelompok', c ? [...data.dugaan_kelompok, k] : data.dugaan_kelompok.filter((x) => x !== k))
                                        }
                                    />
                                    <span>{k}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="perkiraan_kerugian">Perkiraan kerugian</Label>
                        <Input
                            id="perkiraan_kerugian"
                            value={data.perkiraan_kerugian}
                            onChange={(e) => setData('perkiraan_kerugian', e.target.value)}
                            placeholder="Boleh perkiraan kasar, mis. sekitar Rp50 juta"
                        />
                    </div>

                    <div>
                        <Label htmlFor="bukti_keterangan">Bukti yang Anda miliki</Label>
                        <Textarea
                            id="bukti_keterangan"
                            rows={3}
                            value={data.bukti_keterangan}
                            onChange={(e) => setData('bukti_keterangan', e.target.value)}
                            placeholder="Sebutkan jenis buktinya (dokumen, foto, percakapan) dan apa yang ditunjukkannya."
                        />
                    </div>

                    <div>
                        <Label>Lampirkan berkas bukti</Label>
                        <div
                            onDragOver={(e) => {
                                e.preventDefault();
                                setSeret(true);
                            }}
                            onDragLeave={() => setSeret(false)}
                            onDrop={(e) => {
                                e.preventDefault();
                                setSeret(false);
                                const jatuh = Array.from(e.dataTransfer.files ?? []);
                                setData('bukti', [...data.bukti, ...jatuh].slice(0, 5));
                            }}
                            className={`mt-1 rounded-md border-2 border-dashed p-4 text-center text-sm transition ${
                                seret ? 'border-primary bg-primary/5' : 'hover:bg-muted/40'
                            }`}
                        >
                            <Paperclip className="text-muted-foreground mx-auto mb-2 h-5 w-5" />
                            <button type="button" className="text-primary underline" onClick={() => berkasRef.current?.click()}>
                                Pilih berkas
                            </button>{' '}
                            atau seret ke sini
                            <p className="text-muted-foreground mt-1 text-xs">
                                JPG, PNG, atau PDF · maksimal 10 MB per berkas · paling banyak 5 berkas
                            </p>
                            <input
                                ref={berkasRef}
                                type="file"
                                multiple
                                accept="image/jpeg,image/png,image/jpg,application/pdf"
                                className="hidden"
                                onChange={(e) => setData('bukti', Array.from(e.target.files ?? []).slice(0, 5))}
                            />
                        </div>

                        {data.bukti.length > 0 && (
                            <ul className="mt-2 space-y-1">
                                {data.bukti.map((f, i) => (
                                    <li key={`${f.name}-${i}`} className="flex items-center justify-between rounded border px-2 py-1 text-sm">
                                        <span className="truncate">
                                            {f.name} <span className="text-muted-foreground">({Math.round(f.size / 1024)} KB)</span>
                                        </span>
                                        <button
                                            type="button"
                                            aria-label="Buang berkas"
                                            onClick={() =>
                                                setData(
                                                    'bukti',
                                                    data.bukti.filter((_, j) => j !== i),
                                                )
                                            }
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {errors.bukti && <p className="text-destructive mt-1 text-xs">{errors.bukti}</p>}

                        <p className="text-muted-foreground mt-2 text-xs">
                            Berkas disimpan di penyimpanan tertutup dan hanya dapat dibuka penindaklanjut — tidak dapat diakses lewat tautan umum, dan
                            tidak muncul di File Manager siapa pun.
                        </p>

                        {data.mode_pelapor !== 'terbuka' && (
                            <p className="mt-2 rounded-md border border-amber-500/50 bg-amber-50 p-3 text-xs text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
                                Anda melapor tanpa nama. <strong>Foto (JPG/PNG) dibersihkan otomatis</strong> dari data tersembunyi — lokasi
                                pengambilan, jenis ponsel, waktu — sebelum disimpan. <strong>PDF tidak bisa dibersihkan</strong> dan sering memuat
                                nama penyusunnya; bila itu mengkhawatirkan, kirim tangkapan layarnya sebagai gambar.
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Button type="submit" disabled={processing || data.uraian_kejadian.trim() === ''} className="w-full">
                {processing ? 'Mengirim...' : 'Lapor Dugaan Kecurangan'}
            </Button>
        </form>
    );
}
