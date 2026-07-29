import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, PlayCircle } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import EduVideoPlayer from '@/components/edu-video-player';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { useEduVideo } from '@/lib/edu-video';

interface LoginForm {
    username: string;
    password: string;
    remember: boolean;
}

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        username: '',
        password: '',
        remember: false,
    });
    const [videoOpen, setVideoOpen] = useState(false);

    const video = useEduVideo();

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout title="Masuk ke akun Anda" description="Masukkan username dan kata sandi untuk melanjutkan">
            <Head title="Masuk" />

            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-5">
                    <div className="grid gap-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                            id="username"
                            type="text"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="username"
                            value={data.username}
                            onChange={(e) => setData('username', e.target.value)}
                            placeholder="Username"
                            className="h-11"
                        />
                        <InputError message={errors.username} />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password">Kata sandi</Label>
                            {canResetPassword && (
                                <TextLink href={route('password.request')} className="ml-auto text-sm" tabIndex={5}>
                                    Lupa kata sandi?
                                </TextLink>
                            )}
                        </div>
                        <PasswordInput
                            id="password"
                            required
                            tabIndex={2}
                            autoComplete="current-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Kata sandi"
                            className="h-11"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="flex items-center space-x-3">
                        <Checkbox
                            id="remember"
                            name="remember"
                            tabIndex={3}
                            checked={data.remember}
                            onCheckedChange={(checked) => setData('remember', checked === true)}
                        />
                        {/* text-foreground: was text-aceh-black/70 dark:text-aceh-cream/70,
                            which resolved to near-invisible text in dark mode. */}
                        <Label htmlFor="remember" className="text-sm font-normal text-foreground">
                            Ingat saya
                        </Label>
                    </div>

                    <Button
                        type="submit"
                        className="mt-2 h-11 w-full bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90"
                        tabIndex={4}
                        disabled={processing}
                    >
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Masuk
                    </Button>
                </div>

            </form>

            {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}

            <div className="flex flex-wrap items-center justify-end gap-2 text-right">
                <TextLink href={route('panduan.public')} className="text-sm">
                    Apa itu MR Kabar / Manajemen Risiko?
                </TextLink>
                {video.enabled && (
                    // Sebelumnya ikon telanjang ber-`text-primary opacity-70`:
                    // di mode gelap warnanya nyaris menyatu dengan kartu login
                    // sehingga tombolnya tidak terlihat sama sekali. Sekarang
                    // dibuat pil bergaris dengan warna teks yang mengikuti tema
                    // (border + foreground), plus label teks — selain terbaca di
                    // kedua mode, keberadaannya juga jauh lebih jelas daripada
                    // ikon kecil tanpa keterangan.
                    <button
                        type="button"
                        onClick={() => setVideoOpen(true)}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-background/60 px-3 py-1 text-xs font-medium text-foreground transition-colors hover:border-primary hover:bg-primary/10 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                        title="Tonton video edukasi MR Kabar"
                        aria-label="Tonton video edukasi MR Kabar"
                    >
                        <PlayCircle className="h-4 w-4" aria-hidden="true" />
                        Tonton video
                    </button>
                )}
            </div>

            {video.enabled && (
                <Dialog open={videoOpen} onOpenChange={setVideoOpen}>
                    <DialogContent className="max-w-3xl p-0">
                        <DialogHeader className="p-4 pb-0">
                            <DialogTitle>Video Edukasi: Manajemen Risiko &amp; MR Kabar</DialogTitle>
                        </DialogHeader>
                        <div className="p-4 pt-2">
                            <EduVideoPlayer
                                src={video.src}
                                stems={video.stems}
                                gains={video.gains}
                                vtt={video.vtt}
                                subtitleEnabled={video.subtitleEnabled}
                                subtitleSize={video.subtitleSize}
                            />
                            <p className="text-muted-foreground mt-3 text-xs">
                                {video.bawaan && 'Durasi 23 menit. '}
                                Versi dengan daftar bab, penyaring per peran, dan uji pemahaman
                                tersedia di menu <span className="font-medium">Panduan</span> setelah Anda masuk.
                            </p>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </AuthLayout>
    );
}
