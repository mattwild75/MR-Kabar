import { router, useForm, usePage } from '@inertiajs/react';
import { Check, Copy, LoaderCircle, Printer, ShieldAlert, ShieldCheck, ShieldOff } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';

export interface KeadaanDuaFaktor {
    aktif: boolean;
    wajib: boolean;
    sisaKodePemulihan: number;
}

interface FlashDuaFaktor {
    duaFaktorSiap?: { kunci: string; qr: string };
    duaFaktorKodePemulihan?: string[];
}

/**
 * Bagian Autentikasi Dua Faktor di halaman Pengaturan Profil.
 *
 * Alurnya sengaja tiga layar berurutan dan bukan satu tombol:
 *
 *   Aktifkan  -> kode QR muncul, kunci BELUM disimpan di server
 *   Sahkan    -> satu kode diketik; barulah kuncinya berlaku
 *   Simpan    -> sepuluh kode pemulihan ditampilkan, sekali seumur hidupnya
 *
 * Layar ketiga bukan formalitas. Kode pemulihan adalah satu-satunya jalan
 * masuk kalau ponselnya hilang, dan sesudah halaman ini ditutup tidak ada
 * cara menampilkannya lagi — hanya membuat yang baru, yang menghanguskan
 * yang lama.
 */
export default function DuaFaktorSection({ keadaan }: { keadaan: KeadaanDuaFaktor }) {
    const flash = (usePage().props.flash ?? {}) as FlashDuaFaktor;
    const [tersalin, setTersalin] = useState(false);

    const pemasangan = useForm({ kode: '' });
    const pencabutan = useForm({ password: '' });

    const mulai = () => router.post(route('dua-faktor.siapkan'), {}, { preserveScroll: true });

    const sahkan: FormEventHandler = (e) => {
        e.preventDefault();
        pemasangan.post(route('dua-faktor.nyalakan'), {
            preserveScroll: true,
            onSuccess: () => pemasangan.reset('kode'),
        });
    };

    const cabut: FormEventHandler = (e) => {
        e.preventDefault();
        pencabutan.delete(route('dua-faktor.matikan'), {
            preserveScroll: true,
            onSuccess: () => pencabutan.reset('password'),
        });
    };

    const salinKodePemulihan = async () => {
        const daftar = flash.duaFaktorKodePemulihan ?? [];
        await navigator.clipboard.writeText(daftar.join('\n'));
        setTersalin(true);
        window.setTimeout(() => setTersalin(false), 2000);
    };

    return (
        <div className="space-y-6">
            <HeadingSmall
                title="Autentikasi Dua Faktor"
                description="Lapisan kedua saat masuk: enam angka dari aplikasi pengotentikasi di ponsel Anda, selain kata sandi."
            />

            <div className="flex items-center gap-2">
                {keadaan.aktif ? (
                    <Badge className="gap-1 bg-emerald-600 hover:bg-emerald-600">
                        <ShieldCheck className="h-3.5 w-3.5" /> Aktif
                    </Badge>
                ) : (
                    <Badge variant="secondary" className="gap-1">
                        <ShieldOff className="h-3.5 w-3.5" /> Belum aktif
                    </Badge>
                )}
                {keadaan.wajib && <Badge variant="outline">Wajib untuk peran Anda</Badge>}
            </div>

            {/* Sepuluh kode pemulihan — hanya tampil sekali, tepat sesudah
                pemasangan atau pembuatan ulang. */}
            {flash.duaFaktorKodePemulihan && (
                <div className="rounded-lg border border-amber-400 bg-amber-50 p-4 dark:border-amber-600 dark:bg-amber-950/40">
                    <div className="flex items-start gap-2">
                        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                        <div className="space-y-1">
                            <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">Simpan kode pemulihan ini sekarang</p>
                            <p className="text-xs text-amber-800 dark:text-amber-300">
                                Inilah satu-satunya jalan masuk kalau ponsel Anda hilang. Kode ini <strong>tidak dapat ditampilkan lagi</strong>{' '}
                                sesudah halaman ini ditutup. Cetak atau catat, lalu simpan terpisah dari ponsel Anda.
                            </p>
                        </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 rounded-md bg-white p-3 font-mono text-sm dark:bg-neutral-900">
                        {flash.duaFaktorKodePemulihan.map((kode) => (
                            <span key={kode}>{kode}</span>
                        ))}
                    </div>

                    <div className="mt-3 flex gap-2">
                        <Button type="button" size="sm" variant="outline" onClick={salinKodePemulihan}>
                            {tersalin ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            {tersalin ? 'Tersalin' : 'Salin'}
                        </Button>
                        <Button type="button" size="sm" variant="outline" onClick={() => window.print()}>
                            <Printer className="h-4 w-4" /> Cetak
                        </Button>
                    </div>
                </div>
            )}

            {/* Langkah 2: kode QR sudah dibuat, menunggu dibuktikan. */}
            {!keadaan.aktif && flash.duaFaktorSiap && (
                <form onSubmit={sahkan} className="space-y-4 rounded-lg border p-4">
                    <ol className="text-muted-foreground list-decimal space-y-1 pl-5 text-sm">
                        <li>Pasang Google Authenticator (atau aplikasi pengotentikasi lain) di ponsel Anda.</li>
                        <li>Pindai kode QR di bawah ini dengan aplikasi tersebut.</li>
                        <li>Ketik enam angka yang muncul, lalu tekan Sahkan.</li>
                    </ol>

                    <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                        <img src={flash.duaFaktorSiap.qr} alt="Kode QR autentikasi dua faktor" className="h-40 w-40 rounded-md bg-white p-2" />

                        <div className="space-y-1">
                            <p className="text-muted-foreground text-xs">Kamera bermasalah? Ketik kunci ini di aplikasi pengotentikasi:</p>
                            <code className="bg-muted inline-block rounded px-2 py-1 font-mono text-sm break-all">{flash.duaFaktorSiap.kunci}</code>
                        </div>
                    </div>

                    <div className="grid max-w-xs gap-2">
                        <Label htmlFor="kode-2fa">Kode enam angka</Label>
                        <Input
                            id="kode-2fa"
                            value={pemasangan.data.kode}
                            onChange={(e) => pemasangan.setData('kode', e.target.value)}
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            placeholder="123456"
                            required
                        />
                        <InputError message={pemasangan.errors.kode} />
                    </div>

                    <Button type="submit" disabled={pemasangan.processing}>
                        {pemasangan.processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Sahkan dan aktifkan
                    </Button>
                </form>
            )}

            {/* Langkah 1: belum aktif dan belum ada QR yang menunggu. */}
            {!keadaan.aktif && !flash.duaFaktorSiap && (
                <div className="space-y-3">
                    {keadaan.wajib && (
                        <p className="rounded-md border border-amber-400 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-600 dark:bg-amber-950/40 dark:text-amber-200">
                            Akun Anda memegang akses lintas perangkat daerah, jadi autentikasi dua faktor wajib dipasang sebelum menu lain dapat
                            dibuka.
                        </p>
                    )}
                    <Button type="button" onClick={mulai}>
                        <ShieldCheck className="h-4 w-4" /> Aktifkan
                    </Button>
                </div>
            )}

            {/* Sudah aktif: kelola kode pemulihan, dan cabut kalau perannya membolehkan. */}
            {keadaan.aktif && (
                <div className="space-y-6">
                    <div className="space-y-2">
                        <p className="text-muted-foreground text-sm">
                            Sisa kode pemulihan: <strong>{keadaan.sisaKodePemulihan}</strong> dari 10.
                            {keadaan.sisaKodePemulihan <= 2 && ' Sudah menipis — sebaiknya buat yang baru.'}
                        </p>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => router.post(route('dua-faktor.kode-pemulihan'), {}, { preserveScroll: true })}
                        >
                            Buat kode pemulihan baru
                        </Button>
                        <p className="text-muted-foreground text-xs">Membuat yang baru akan menghanguskan seluruh kode pemulihan yang lama.</p>
                    </div>

                    {keadaan.wajib ? (
                        <p className="text-muted-foreground border-t pt-4 text-sm">
                            Autentikasi dua faktor tidak dapat dimatikan untuk peran Anda. Kalau ponsel Anda hilang dan kode pemulihannya ikut hilang,
                            pengelola server dapat membukanya lewat perintah <code className="bg-muted rounded px-1">duafaktor:matikan</code> di mesin
                            server.
                        </p>
                    ) : (
                        <form onSubmit={cabut} className="space-y-3 border-t pt-4">
                            <p className="text-muted-foreground text-sm">Untuk mematikan, masukkan kata sandi akun Anda.</p>
                            <div className="grid max-w-xs gap-2">
                                <Label htmlFor="sandi-2fa">Kata sandi</Label>
                                <PasswordInput
                                    id="sandi-2fa"
                                    value={pencabutan.data.password}
                                    onChange={(e) => pencabutan.setData('password', e.target.value)}
                                    autoComplete="current-password"
                                    required
                                />
                                <InputError message={pencabutan.errors.password} />
                            </div>
                            <Button type="submit" variant="destructive" disabled={pencabutan.processing}>
                                {pencabutan.processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                Matikan autentikasi dua faktor
                            </Button>
                        </form>
                    )}
                </div>
            )}
        </div>
    );
}
