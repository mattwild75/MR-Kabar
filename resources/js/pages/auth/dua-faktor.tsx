import { Head, router, useForm } from '@inertiajs/react';
import { KeyRound, LoaderCircle, ShieldCheck } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

interface DuaFaktorProps {
    sisaKodePemulihan: number;
}

/**
 * Layar kedua saat masuk.
 *
 * Sandi sudah benar sampai di sini; yang ditunggu tinggal enam angka dari
 * aplikasi pengotentikasi di ponsel. Dua hal yang membuat halaman ini tidak
 * menjebak pemakainya: jalur kode pemulihan bagi yang ponselnya tidak di
 * tangan, dan tombol keluar bagi yang tidak memegang keduanya.
 */
export default function DuaFaktor({ sisaKodePemulihan }: DuaFaktorProps) {
    const [pakaiPemulihan, setPakaiPemulihan] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        kode: '',
        pakai_pemulihan: false as boolean,
    });

    const gantiJalur = () => {
        const berikutnya = !pakaiPemulihan;
        setPakaiPemulihan(berikutnya);
        setData({ kode: '', pakai_pemulihan: berikutnya });
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('dua-faktor.kirim'), {
            onError: () => reset('kode'),
        });
    };

    return (
        <AuthLayout
            title={pakaiPemulihan ? 'Masuk dengan kode pemulihan' : 'Verifikasi dua langkah'}
            description={
                pakaiPemulihan
                    ? 'Ketik salah satu kode pemulihan yang Anda simpan saat memasang autentikasi dua faktor.'
                    : 'Buka aplikasi pengotentikasi di ponsel Anda, lalu ketik enam angka yang sedang tampil.'
            }
        >
            <Head title="Verifikasi dua langkah" />

            <form onSubmit={submit} className="flex flex-col gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="kode">{pakaiPemulihan ? 'Kode pemulihan' : 'Kode enam angka'}</Label>

                    <Input
                        id="kode"
                        name="kode"
                        value={data.kode}
                        onChange={(e) => setData('kode', e.target.value)}
                        autoFocus
                        autoComplete="one-time-code"
                        // inputMode numerik hanya untuk kode TOTP; kode pemulihan
                        // memuat huruf, dan papan ketik angka akan menyulitkan.
                        inputMode={pakaiPemulihan ? 'text' : 'numeric'}
                        placeholder={pakaiPemulihan ? 'XXXXX-XXXXX' : '123456'}
                        className={pakaiPemulihan ? 'tracking-widest uppercase' : 'text-center text-lg tracking-[0.5em]'}
                        required
                    />

                    <InputError message={errors.kode} />
                </div>

                <Button type="submit" className="w-full" disabled={processing}>
                    {processing ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                    Lanjutkan
                </Button>

                <div className="text-muted-foreground flex flex-col gap-2 text-center text-sm">
                    <button
                        type="button"
                        onClick={gantiJalur}
                        className="hover:text-foreground inline-flex items-center justify-center gap-1.5 underline underline-offset-4"
                    >
                        <KeyRound className="h-3.5 w-3.5" />
                        {pakaiPemulihan ? 'Kembali memakai aplikasi pengotentikasi' : 'Ponsel tidak di tangan? Pakai kode pemulihan'}
                    </button>

                    {pakaiPemulihan && (
                        <p className="text-xs">
                            {sisaKodePemulihan > 0
                                ? `Sisa ${sisaKodePemulihan} kode pemulihan. Tiap kode hanya berlaku sekali.`
                                : 'Kode pemulihan Anda sudah habis terpakai. Hubungi pengelola server untuk membuka akun ini.'}
                        </p>
                    )}

                    <button
                        type="button"
                        onClick={() => router.post(route('dua-faktor.batal'))}
                        className="hover:text-foreground underline underline-offset-4"
                    >
                        Keluar dan masuk dengan akun lain
                    </button>
                </div>
            </form>
        </AuthLayout>
    );
}
