import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import BAB_KECURANGAN from '@/data/kecurangan-video-chapters.json';
import BAB_TUTORIAL from '@/data/tutorial-video-chapters.json';
import AppLayout from '@/layouts/app-layout';
import { STEM_BAWAAN, useVersiVideo, VIDEO_BAWAAN, VTT_BAWAAN } from '@/lib/edu-video';
import { KECURANGAN_BAWAAN, KECURANGAN_STEM_BAWAAN, KECURANGAN_VTT_BAWAAN, useVersiKecurangan } from '@/lib/kecurangan-video';
import { TUTORIAL_BAWAAN, TUTORIAL_STEM_BAWAAN, TUTORIAL_VTT_BAWAAN, useVersiTutorial } from '@/lib/tutorial-video';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import React, { useRef, useState } from 'react';
import BagianVideo, { useSetelanVideo } from './bagian-video';
import PratinjauSplash from './pratinjau-splash';

const DEFAULT_WARNA = '#181818';
const DEFAULT_LOGO_BG = '#ffffff';

interface SettingApp {
    nama_app: string;
    deskripsi: string;
    warna: string;
    logo: string;
    logo_bg: string | null;
    favicon: string;
    login_splash_enabled: boolean;
    login_splash_video: string | null;
    login_splash_muted: boolean;
    login_splash_volume: number;
    seo: {
        title?: string;
        description?: string;
        keywords?: string;
    };
    contact_email: string | null;
    contact_email_secondary: string | null;
    footer_credit: string | null;
}

interface Props {
    setting: SettingApp | null;
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Application Settings', href: '/settingsapp' }];

/** Tambahkan penanda versi ke ketiga jalur audio bawaan. */
const berversi = (stem: { narration: string; music: string; sfx: string }, v: string) => ({
    narration: stem.narration + v,
    music: stem.music + v,
    sfx: stem.sfx + v,
});

export default function SettingForm({ setting }: Props) {
    // Whether the logo should render on a solid background color, or stay
    // transparent (e.g. for an already-background-removed PNG). Tracked
    // separately from the color value itself, since a native color input
    // always has *some* hex value and can't represent "no background".
    const [useLogoBg, setUseLogoBg] = useState(Boolean(setting?.logo_bg));
    const [faviconFromLogo, setFaviconFromLogo] = useState(false);
    const [splashEnabled, setSplashEnabled] = useState(setting?.login_splash_enabled ?? true);
    const [splashMuted, setSplashMuted] = useState(setting?.login_splash_muted ?? true);
    const [splashVolume, setSplashVolume] = useState(setting?.login_splash_volume ?? 80);
    const [removeSplashVideo, setRemoveSplashVideo] = useState(false);

    // Ketiga video aplikasi diatur dengan cara yang sama (lihat bagian-video.tsx).
    const versiVideo = useVersiVideo();
    const versiTutorial = useVersiTutorial();
    const versiKecurangan = useVersiKecurangan();
    const edu = useSetelanVideo(setting, 'edu_video', VIDEO_BAWAAN);
    const tutorial = useSetelanVideo(setting, 'tutorial_video', TUTORIAL_BAWAAN);
    const kecurangan = useSetelanVideo(setting, 'kecurangan_video', KECURANGAN_BAWAAN);

    const { data, setData, post, processing, errors, transform } = useForm({
        nama_app: setting?.nama_app || '',
        deskripsi: setting?.deskripsi || '',
        warna: setting?.warna || '#0ea5e9',
        logo_bg: setting?.logo_bg || DEFAULT_LOGO_BG,
        seo: {
            title: setting?.seo?.title || '',
            description: setting?.seo?.description || '',
            keywords: setting?.seo?.keywords || '',
        },
        contact_email: setting?.contact_email || '',
        contact_email_secondary: setting?.contact_email_secondary || '',
        footer_credit: setting?.footer_credit || '',
        logo: null as File | null,
        favicon: null as File | null,
        login_splash_video: null as File | null,
        edu_video_path: null as File | null,
        edu_video_subtitle_path: null as File | null,
        tutorial_video_path: null as File | null,
        tutorial_video_subtitle_path: null as File | null,
        kecurangan_video_path: null as File | null,
        kecurangan_video_subtitle_path: null as File | null,
    });
    // Berkas video & subtitle dipilih di dalam BagianVideo; kolomnya disebut
    // lewat nama ({awalan}_path / {awalan}_subtitle_path).
    const aturBerkas = (kolom: string, berkas: File | null) => setData(kolom as 'edu_video_path', berkas);
    const galat = errors as Partial<Record<string, string>>;

    const logoPreview = useRef<string | null>(setting?.logo ? `/storage/${setting.logo}` : null);
    const faviconPreview = useRef<string | null>(setting?.favicon ? `/storage/${setting.favicon}` : null);
    const [splashVideoPreview, setSplashVideoPreview] = useState<string | null>(
        setting?.login_splash_video ? `/storage/${setting.login_splash_video}` : null,
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // When the toggle is off, send an empty string so the backend stores
        // "no background" rather than whatever color was last picked.
        transform((current) => ({
            ...current,
            logo_bg: useLogoBg ? current.logo_bg : '',
            favicon_from_logo: faviconFromLogo,
            login_splash_enabled: splashEnabled,
            login_splash_muted: splashMuted,
            login_splash_volume: splashVolume,
            login_splash_video_remove: removeSplashVideo,
            ...edu.kiriman(),
            ...tutorial.kiriman(),
            ...kecurangan.kiriman(),
        }));
        post('/settingsapp', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setRemoveSplashVideo(false);
                edu.setelahSimpan();
                tutorial.setelahSimpan();
                kecurangan.setelahSimpan();
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs} title="Application Settings">
            <Head title="Application Settings" />
            <div className="flex-1 p-4 md:p-6">
                <Card className="mx-auto max-w-3xl">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold tracking-tight">Application Settings</CardTitle>
                        <p className="text-muted-foreground mt-1 text-sm">Configure application identity, theme color, logo, and SEO metadata.</p>
                    </CardHeader>
                    <Separator />
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Nama App */}
                            <div className="space-y-1">
                                <Label htmlFor="nama_app">Application Name</Label>
                                <Input
                                    id="nama_app"
                                    value={data.nama_app}
                                    onChange={(e) => setData('nama_app', e.target.value)}
                                    className={errors.nama_app ? 'border-red-500' : ''}
                                />
                                {errors.nama_app && <p className="text-sm text-red-500">{errors.nama_app}</p>}
                            </div>

                            {/* Deskripsi */}
                            <div className="space-y-1">
                                <Label htmlFor="deskripsi">Description</Label>
                                <Textarea id="deskripsi" value={data.deskripsi} onChange={(e) => setData('deskripsi', e.target.value)} />
                            </div>

                            {/* Warna Tema */}
                            <div className="space-y-1">
                                <Label htmlFor="warna">Theme Color</Label>
                                <div className="flex items-center gap-4">
                                    <Input
                                        id="warna"
                                        type="color"
                                        value={data.warna}
                                        onChange={(e) => setData('warna', e.target.value)}
                                        className="h-10 w-16 p-1"
                                    />
                                    <Button type="button" variant="secondary" size="sm" onClick={() => setData('warna', DEFAULT_WARNA)}>
                                        Reset Default
                                    </Button>
                                </div>
                            </div>

                            {/* Logo Upload */}
                            <div className="space-y-1">
                                <Label htmlFor="logo">Logo (Max 2MB)</Label>
                                <Input
                                    id="logo"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0] || null;
                                        setData('logo', file);
                                        if (file) logoPreview.current = URL.createObjectURL(file);
                                    }}
                                />
                                <p className="text-muted-foreground text-xs">
                                    Boleh pakai PNG transparan (latar belakang sudah dihapus) — atur warna latar di bawah jika perlu.
                                </p>

                                {/* Logo background toggle + color picker */}
                                <div className="mt-3 flex items-center gap-3 rounded-md border p-3">
                                    <Checkbox id="use_logo_bg" checked={useLogoBg} onCheckedChange={(checked) => setUseLogoBg(checked === true)} />
                                    <Label htmlFor="use_logo_bg" className="flex-1 text-sm font-normal">
                                        Gunakan warna latar di belakang logo
                                    </Label>
                                    <Input
                                        type="color"
                                        value={data.logo_bg}
                                        onChange={(e) => setData('logo_bg', e.target.value)}
                                        disabled={!useLogoBg}
                                        className="h-9 w-14 p-1 disabled:opacity-40"
                                    />
                                </div>

                                {logoPreview.current && (
                                    <div
                                        className="mt-2 inline-flex items-center justify-center rounded p-2"
                                        style={{ backgroundColor: useLogoBg ? data.logo_bg : 'transparent' }}
                                    >
                                        <img src={logoPreview.current} alt="Preview Logo" className="h-16 rounded" />
                                    </div>
                                )}
                            </div>

                            {/* Favicon Upload */}
                            <div className="space-y-1">
                                <Label htmlFor="favicon">Favicon (Max 1MB)</Label>
                                <Input
                                    id="favicon"
                                    type="file"
                                    accept="image/*"
                                    disabled={faviconFromLogo}
                                    onChange={(e) => {
                                        const file = e.target.files?.[0] || null;
                                        setData('favicon', file);
                                        if (file) faviconPreview.current = URL.createObjectURL(file);
                                    }}
                                />

                                <div className="mt-3 flex items-center gap-3 rounded-md border p-3">
                                    <Checkbox
                                        id="favicon_from_logo"
                                        checked={faviconFromLogo}
                                        onCheckedChange={(checked) => setFaviconFromLogo(checked === true)}
                                    />
                                    <Label htmlFor="favicon_from_logo" className="flex-1 text-sm font-normal">
                                        Buat favicon otomatis dari logo (memakai warna latar logo di atas)
                                    </Label>
                                </div>
                                {faviconFromLogo && (
                                    <p className="text-muted-foreground text-xs">
                                        Favicon akan dibuat ulang dari logo saat ini, dikomposit dengan warna latar yang dipilih di atas, setiap kali
                                        pengaturan ini disimpan.
                                    </p>
                                )}

                                {faviconPreview.current && !faviconFromLogo && (
                                    <img src={faviconPreview.current} alt="Preview Favicon" className="mt-2 h-10 rounded" />
                                )}
                            </div>

                            {/* Login Splash Screen Section */}
                            <Separator />
                            <h3 className="text-lg font-semibold">Login Splash Screen</h3>
                            <p className="text-muted-foreground text-sm">
                                Tampil sesaat setelah user berhasil login (sebelum masuk ke Dashboard). Bawaannya animasi logo MR Kabar dengan efek
                                suaranya sendiri: ±4,7 detik, tajam di layar apa pun, ikut tema terang/gelap, menyapa nama user, dan bisa dilewati
                                (tombol Lewati atau Esc). Unggah video sendiri hanya kalau ingin menggantinya.
                            </p>

                            <div className="flex items-center gap-3 rounded-md border p-3">
                                <Checkbox
                                    id="splash_enabled"
                                    checked={splashEnabled}
                                    onCheckedChange={(checked) => setSplashEnabled(checked === true)}
                                />
                                <Label htmlFor="splash_enabled" className="flex-1 text-sm font-normal">
                                    Aktifkan splash screen setelah login
                                </Label>
                            </div>

                            {splashEnabled && (
                                <>
                                    <div className="space-y-1">
                                        <Label>Pratinjau</Label>
                                        <PratinjauSplash
                                            videoSrc={removeSplashVideo ? null : splashVideoPreview}
                                            muted={splashMuted}
                                            volume={splashVolume}
                                        />
                                        <p className="text-muted-foreground text-xs">
                                            Pratinjau memakai setelan di halaman ini sebelum disimpan, termasuk video yang baru dipilih, suara, dan
                                            volumenya. Sapaannya memakai nama Anda, sama seperti yang dilihat tiap user dengan namanya sendiri.
                                        </p>
                                    </div>

                                    <div className="space-y-1">
                                        <Label htmlFor="login_splash_video">Video Splash (MP4/WebM/MOV, Max 20MB)</Label>
                                        <Input
                                            id="login_splash_video"
                                            type="file"
                                            accept="video/mp4,video/webm,video/quicktime"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0] || null;
                                                setData('login_splash_video', file);
                                                if (file) {
                                                    setSplashVideoPreview(URL.createObjectURL(file));
                                                    setRemoveSplashVideo(false);
                                                }
                                            }}
                                            className={errors.login_splash_video ? 'border-red-500' : ''}
                                        />
                                        {errors.login_splash_video && <p className="text-sm text-red-500">{errors.login_splash_video}</p>}
                                        <p className="text-muted-foreground text-xs">
                                            Kosongkan kalau tidak ingin mengganti — video yang sudah ada akan tetap dipakai.
                                        </p>

                                        {splashVideoPreview && !removeSplashVideo && (
                                            <div className="pt-1">
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => {
                                                        setRemoveSplashVideo(true);
                                                        setSplashVideoPreview(null);
                                                        setData('login_splash_video', null);
                                                    }}
                                                >
                                                    Hapus Video (kembali ke animasi logo bawaan)
                                                </Button>
                                            </div>
                                        )}

                                        {removeSplashVideo && (
                                            <p className="text-sm text-amber-600">
                                                Video kustom akan dihapus saat disimpan — akan kembali memakai animasi logo bawaan.
                                            </p>
                                        )}

                                        {!splashVideoPreview && !removeSplashVideo && (
                                            <p className="text-muted-foreground text-xs italic">
                                                Belum ada video kustom — saat ini memakai animasi logo bawaan.
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-3 rounded-md border p-4">
                                        <div className="flex items-center gap-3">
                                            <Checkbox
                                                id="splash_muted"
                                                checked={splashMuted}
                                                onCheckedChange={(checked) => setSplashMuted(checked === true)}
                                            />
                                            <Label htmlFor="splash_muted" className="flex-1 text-sm font-normal">
                                                Bisukan suara splash
                                            </Label>
                                        </div>
                                        {!splashMuted && (
                                            <>
                                                <div className="flex items-center gap-4">
                                                    <span className="w-36 shrink-0 text-sm">Volume</span>
                                                    <input
                                                        type="range"
                                                        min={0}
                                                        max={100}
                                                        step={5}
                                                        value={splashVolume}
                                                        onChange={(e) => setSplashVolume(Number(e.target.value))}
                                                        className="accent-primary h-2 flex-1 cursor-pointer"
                                                        aria-label="Volume suara splash"
                                                    />
                                                    <span className="w-14 shrink-0 text-right font-mono text-sm tabular-nums">{splashVolume}%</span>
                                                </div>
                                                <p className="text-muted-foreground text-xs">
                                                    Efek suara animasi logo disusun mengikuti tiap geraknya: pindaian sonar, simpul jaringan yang
                                                    menyala, tiga risiko yang jatuh, cincin pengendalian yang mengunci, huruf MR KABAR, lalu akor
                                                    penutup saat sapaan muncul. Untuk video unggahan, yang diatur adalah suara videonya sendiri.
                                                    Chrome, Edge, dan Firefox membunyikannya karena user baru saja menekan tombol Masuk; Safari
                                                    (iPhone/Mac) bisa tetap menahan suara yang diputar otomatis.
                                                </p>
                                            </>
                                        )}
                                    </div>
                                </>
                            )}

                            <BagianVideo
                                setelan={edu}
                                judul="Video Edukasi"
                                deskripsi='Video pengenalan manajemen risiko & MR Kabar (15 menit). Bisa ditonton lewat tombol "Tonton video" di halaman login, dan versi lengkap dengan daftar bab, penyaring peran, serta uji pemahaman ada di menu Panduan.'
                                labelAktif="Tampilkan tombol video edukasi di halaman login"
                                berkas={{ src: VIDEO_BAWAAN + versiVideo, stems: berversi(STEM_BAWAAN, versiVideo), vtt: VTT_BAWAAN + versiVideo }}
                                keteranganBerkas="Kosongkan kalau tidak ingin mengganti — video bawaan yang dipakai. Berkas unggahan sendiri audionya menyatu di dalam video, sehingga setelan volume mix di bawah tidak berlaku untuknya; subtitle tetap bisa dipasang lewat kolom di bawah ini."
                                keteranganSubtitle="Kosongkan kalau tidak ingin mengganti. Berkas .srt otomatis dikonversi ke .vtt saat disimpan. Wajib diisi kalau Anda memasang video sendiri di atas — subtitle bawaan tidak dipakaikan ke video lain karena menit-detiknya milik video yang berbeda."
                                keteranganMix="Video bawaan berupa MP4 lengkap: suaranya menyatu, subtitle dan daftar babnya tertanam, sehingga bisa diputar & diunduh seperti video biasa. Selama ketiga slider 100%, suara MP4 itu yang diputar. Kalau diubah, pemutar beralih ke tiga jalur audio terpisah (narasi, musik, efek suara) — perubahan di sini langsung terdengar tanpa render ulang."
                                galat={galat}
                                aturBerkas={aturBerkas}
                            />

                            <BagianVideo
                                setelan={tutorial}
                                judul="Video Tutorial Pengisian"
                                deskripsi="Rekaman aplikasi sungguhan yang mengikuti satu perangkat daerah mengisi satu tahun penuh (±40 menit) — dari Data Umum sampai formulir cetak siap ditandatangani. Tampil di paling bawah halaman Panduan, di bawah video edukasi. Seluruh isian di dalamnya data contoh, dan itu disampaikan di dalam videonya sendiri."
                                labelAktif="Tampilkan video tutorial di halaman Panduan"
                                berkas={{
                                    src: TUTORIAL_BAWAAN + versiTutorial,
                                    stems: berversi(TUTORIAL_STEM_BAWAAN, versiTutorial),
                                    vtt: TUTORIAL_VTT_BAWAAN + versiTutorial,
                                    bab: BAB_TUTORIAL,
                                }}
                                keteranganBerkas="Kosongkan kalau tidak ingin mengganti — video bawaan yang dipakai. Berkas unggahan sendiri audionya menyatu di dalam video, sehingga setelan volume di bawah tidak berlaku untuknya; daftar bab juga disembunyikan karena menit-detiknya milik video yang berbeda."
                                keteranganSubtitle="Kosongkan kalau tidak ingin mengganti. Berkas .srt otomatis dikonversi ke .vtt saat disimpan. Wajib diisi kalau Anda memasang video sendiri di atas."
                                keteranganMix="Video tutorial berupa MP4 lengkap — suara menyatu, subtitle dan daftar bab tertanam. Selama ketiga slider 100%, suara MP4 itu yang diputar. Kalau diubah, pemutar beralih ke tiga jalur audio terpisah — narasi, musik, dan efek suara (klik, ketikan, bunyi tersimpan). Perubahan di sini langsung terdengar tanpa render ulang."
                                galat={galat}
                                aturBerkas={aturBerkas}
                            />

                            <BagianVideo
                                setelan={kecurangan}
                                judul="Video Edukasi Dugaan Kecurangan"
                                deskripsi='"Bunyikan Lonceng" (±13 menit): apa itu kecurangan, tujuh wajah korupsi, tanda-tandanya, mengapa orang memilih diam, cara melapor lewat kode QR, dan bagaimana identitas pelapor dijaga. Dibuka dari tombol "Tonton video edukasi" di formulir Lapor Dugaan Kecurangan — sering lewat ponsel, sesudah memindai QR.'
                                labelAktif='Tampilkan video ini dan tombol "Tonton video edukasi" di formulir Lapor'
                                berkas={{
                                    src: KECURANGAN_BAWAAN + versiKecurangan,
                                    stems: berversi(KECURANGAN_STEM_BAWAAN, versiKecurangan),
                                    vtt: KECURANGAN_VTT_BAWAAN + versiKecurangan,
                                    bab: BAB_KECURANGAN,
                                }}
                                keteranganBerkas="Kosongkan kalau tidak ingin mengganti — video bawaan yang dipakai. Berkas unggahan sendiri audionya menyatu di dalam video, sehingga setelan volume di bawah tidak berlaku untuknya; daftar bab dan tautan unduhan juga disembunyikan karena menit-detiknya milik video yang berbeda."
                                keteranganSubtitle="Kosongkan kalau tidak ingin mengganti. Berkas .srt otomatis dikonversi ke .vtt saat disimpan. Wajib diisi kalau Anda memasang video sendiri di atas."
                                keteranganMix="Video bawaan berupa MP4 lengkap — suara menyatu, subtitle dan daftar bab tertanam. Selama ketiga slider 100%, suara MP4 itu yang diputar, sehingga penonton lewat ponsel tidak mengunduh apa pun tambahan. Kalau diubah, pemutar beralih ke tiga jalur audio terpisah (narasi, musik, efek suara) — perubahan di sini langsung terdengar tanpa render ulang."
                                galat={galat}
                                aturBerkas={aturBerkas}
                            />

                            {/* SEO Section */}
                            <Separator />
                            <h3 className="text-lg font-semibold">SEO Settings</h3>

                            <div className="space-y-1">
                                <Label htmlFor="seo_title">SEO Title</Label>
                                <Input
                                    id="seo_title"
                                    value={data.seo.title}
                                    onChange={(e) => setData('seo', { ...data.seo, title: e.target.value })}
                                />
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="seo_description">SEO Description</Label>
                                <Textarea
                                    id="seo_description"
                                    value={data.seo.description}
                                    onChange={(e) => setData('seo', { ...data.seo, description: e.target.value })}
                                />
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="seo_keywords">SEO Keywords (separate with commas)</Label>
                                <Input
                                    id="seo_keywords"
                                    value={data.seo.keywords}
                                    onChange={(e) => setData('seo', { ...data.seo, keywords: e.target.value })}
                                />
                            </div>

                            {/* Footer Section */}
                            <Separator />
                            <h3 className="text-lg font-semibold">Footer Settings</h3>

                            <div className="space-y-1">
                                <Label htmlFor="contact_email">Contact Us Email (Utama)</Label>
                                <Input
                                    id="contact_email"
                                    type="email"
                                    value={data.contact_email}
                                    onChange={(e) => setData('contact_email', e.target.value)}
                                    className={errors.contact_email ? 'border-red-500' : ''}
                                />
                                {errors.contact_email && <p className="text-sm text-red-500">{errors.contact_email}</p>}
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="contact_email_secondary">Contact Us Email (Kedua)</Label>
                                <Input
                                    id="contact_email_secondary"
                                    type="email"
                                    value={data.contact_email_secondary}
                                    onChange={(e) => setData('contact_email_secondary', e.target.value)}
                                    className={errors.contact_email_secondary ? 'border-red-500' : ''}
                                />
                                <p className="text-muted-foreground text-xs">
                                    Alamat email kedua yang ikut ditambahkan sebagai penerima saat tombol "Contact Us → Email" ditekan.
                                </p>
                                {errors.contact_email_secondary && <p className="text-sm text-red-500">{errors.contact_email_secondary}</p>}
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end pt-4">
                                <Button type="submit" disabled={processing} className="px-6">
                                    {processing ? 'Saving...' : 'Save Settings'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
