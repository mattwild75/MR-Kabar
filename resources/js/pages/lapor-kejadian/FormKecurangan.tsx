import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from '@inertiajs/react';
import { ShieldAlert } from 'lucide-react';
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
    const { data, setData, post, processing, errors, reset } = useForm({
        anonim: false as boolean,
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
    });

    const kirim = (e: React.FormEvent) => {
        e.preventDefault();
        post('/lapor-kecurangan', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Laporan dugaan kecurangan terkirim. Terima kasih.');
                reset();
            },
            onError: () => toast.error('Gagal mengirim laporan. Periksa kembali isian Anda.'),
        });
    };

    return (
        <form onSubmit={kirim} className="mx-auto max-w-2xl space-y-4">
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
                    <label className="flex items-start gap-2 rounded-md border p-3 text-sm">
                        <Checkbox
                            checked={data.anonim}
                            onCheckedChange={(c) => {
                                const anonim = c === true;
                                // Saat anonim dipilih, identitasnya DIKOSONGKAN,
                                // bukan sekadar disembunyikan dari layar — data
                                // yang tersimpan tetap terbaca oleh siapa pun
                                // yang bisa membuka basis data.
                                setData((d) => ({
                                    ...d,
                                    anonim,
                                    nama_pelapor: anonim ? '' : d.nama_pelapor,
                                    email: anonim ? '' : d.email,
                                    no_hp: anonim ? '' : d.no_hp,
                                }));
                            }}
                        />
                        <span>
                            <span className="font-medium">Laporkan secara anonim</span>
                            <span className="text-muted-foreground block text-xs">
                                Identitas Anda tidak akan diminta maupun disimpan. Konsekuensinya, penindaklanjut tidak dapat menghubungi Anda untuk
                                meminta keterangan tambahan.
                            </span>
                        </span>
                    </label>

                    {!data.anonim && (
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="nama_pelapor">Nama Lengkap</Label>
                                <Input
                                    id="nama_pelapor"
                                    value={data.nama_pelapor}
                                    onChange={(e) => setData('nama_pelapor', e.target.value)}
                                />
                                {errors.nama_pelapor && <p className="text-destructive text-xs">{errors.nama_pelapor}</p>}
                            </div>
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
                                            setData(
                                                'dugaan_kelompok',
                                                c ? [...data.dugaan_kelompok, k] : data.dugaan_kelompok.filter((x) => x !== k),
                                            )
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
                            placeholder="Sebutkan jenis buktinya (dokumen, foto, percakapan). Jangan unggah di sini — penindaklanjut akan menghubungi Anda."
                        />
                        <p className="text-muted-foreground mt-1 text-xs">
                            Formulir ini sengaja tidak menerima unggahan berkas. Bukti kecurangan sering memuat data pribadi pihak ketiga, dan
                            penyerahannya perlu jalur yang bisa dipertanggungjawabkan.
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Button type="submit" disabled={processing || data.uraian_kejadian.trim() === ''} className="w-full">
                {processing ? 'Mengirim...' : 'Lapor Dugaan Kecurangan'}
            </Button>
        </form>
    );
}
