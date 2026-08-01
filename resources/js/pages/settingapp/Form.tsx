import React, { useRef, useState } from 'react';
import { useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { type BreadcrumbItem } from '@/types';
import EduVideoPlayer from '@/components/edu-video-player';
import { VIDEO_BAWAAN, VTT_BAWAAN, STEM_BAWAAN, useVersiVideo } from '@/lib/edu-video';

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
  edu_video_enabled: boolean;
  edu_video_path: string | null;
  edu_video_subtitle_path: string | null;
  edu_video_gain_narration: number;
  edu_video_gain_music: number;
  edu_video_gain_sfx: number;
  edu_video_subtitle_enabled: boolean;
  edu_video_subtitle_size: number;
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

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Application Settings', href: '/settingsapp' },
];

export default function SettingForm({ setting }: Props) {
  // Whether the logo should render on a solid background color, or stay
  // transparent (e.g. for an already-background-removed PNG). Tracked
  // separately from the color value itself, since a native color input
  // always has *some* hex value and can't represent "no background".
  const [useLogoBg, setUseLogoBg] = useState(Boolean(setting?.logo_bg));
  const [faviconFromLogo, setFaviconFromLogo] = useState(false);
  const [splashEnabled, setSplashEnabled] = useState(setting?.login_splash_enabled ?? true);
  const [splashMuted, setSplashMuted] = useState(setting?.login_splash_muted ?? true);
  const [removeSplashVideo, setRemoveSplashVideo] = useState(false);
  const [eduVideoEnabled, setEduVideoEnabled] = useState(setting?.edu_video_enabled ?? true);
  const [removeEduVideo, setRemoveEduVideo] = useState(false);
  // Gain disimpan sbg persen (0–200) supaya kolomnya integer, bukan float.
  const [gainNarration, setGainNarration] = useState(setting?.edu_video_gain_narration ?? 100);
  const [gainMusic, setGainMusic] = useState(setting?.edu_video_gain_music ?? 100);
  const [gainSfx, setGainSfx] = useState(setting?.edu_video_gain_sfx ?? 100);
  const [subtitleEnabled, setSubtitleEnabled] = useState(setting?.edu_video_subtitle_enabled ?? true);
  const [subtitleSize, setSubtitleSize] = useState(setting?.edu_video_subtitle_size ?? 70);
  const versiVideo = useVersiVideo();
  const [hapusSubtitle, setHapusSubtitle] = useState(false);

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
  });

  const logoPreview = useRef<string | null>(setting?.logo ? `/storage/${setting.logo}` : null);
  const faviconPreview = useRef<string | null>(setting?.favicon ? `/storage/${setting.favicon}` : null);
  const [splashVideoPreview, setSplashVideoPreview] = useState<string | null>(
    setting?.login_splash_video ? `/storage/${setting.login_splash_video}` : null,
  );
  const [eduVideoPreview, setEduVideoPreview] = useState<string | null>(
    setting?.edu_video_path ? `/storage/${setting.edu_video_path}` : VIDEO_BAWAAN,
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
      login_splash_video_remove: removeSplashVideo,
      edu_video_enabled: eduVideoEnabled,
      edu_video_remove: removeEduVideo,
      edu_video_subtitle_remove: hapusSubtitle,
      edu_video_gain_narration: gainNarration,
      edu_video_gain_music: gainMusic,
      edu_video_gain_sfx: gainSfx,
      edu_video_subtitle_enabled: subtitleEnabled,
      edu_video_subtitle_size: subtitleSize,
    }));
    post('/settingsapp', {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => {
        setRemoveSplashVideo(false);
        setRemoveEduVideo(false);
        setHapusSubtitle(false);
      },
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs} title="Application Settings">
      <Head title="Application Settings" />
      <div className="flex-1 p-4 md:p-6">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold tracking-tight">Application Settings</CardTitle>
            <p className="text-muted-foreground text-sm mt-1">Configure application identity, theme color, logo, and SEO metadata.</p>
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
                <Textarea
                  id="deskripsi"
                  value={data.deskripsi}
                  onChange={(e) => setData('deskripsi', e.target.value)}
                />
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
                    className="w-16 h-10 p-1"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setData('warna', DEFAULT_WARNA)}
                  >
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
                  <Checkbox
                    id="use_logo_bg"
                    checked={useLogoBg}
                    onCheckedChange={(checked) => setUseLogoBg(checked === true)}
                  />
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
                    Favicon akan dibuat ulang dari logo saat ini, dikomposit dengan warna latar yang dipilih di atas, setiap kali pengaturan ini disimpan.
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
                Video yang tampil sesaat setelah user berhasil login (sebelum masuk ke Dashboard). Kalau tidak
                mengunggah video sendiri, aplikasi memakai video contoh bawaan.
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
                      <div className="mt-2 space-y-2">
                        <video
                          src={splashVideoPreview}
                          controls
                          muted={splashMuted}
                          className="max-h-48 rounded border"
                        />
                        <div>
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
                            Hapus Video (kembali ke video contoh bawaan)
                          </Button>
                        </div>
                      </div>
                    )}

                    {removeSplashVideo && (
                      <p className="text-sm text-amber-600">
                        Video kustom akan dihapus saat disimpan — akan kembali memakai video contoh bawaan.
                      </p>
                    )}

                    {!splashVideoPreview && !removeSplashVideo && (
                      <p className="text-muted-foreground text-xs italic">
                        Belum ada video kustom — saat ini memakai video contoh bawaan.
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 rounded-md border p-3">
                    <Checkbox
                      id="splash_muted"
                      checked={splashMuted}
                      onCheckedChange={(checked) => setSplashMuted(checked === true)}
                    />
                    <Label htmlFor="splash_muted" className="flex-1 text-sm font-normal">
                      Bisukan suara video (disarankan tetap dicentang)
                    </Label>
                  </div>
                  {!splashMuted && (
                    <p className="text-xs text-amber-600">
                      Peringatan: browser modern (Chrome/Safari) sering memblokir autoplay video BERSUARA tanpa
                      interaksi user terlebih dulu — video mungkin tidak otomatis berbunyi di beberapa perangkat
                      walau opsi ini dinyalakan.
                    </p>
                  )}
                </>
              )}

              {/* Video Edukasi Section */}
              <Separator />
              <h3 className="text-lg font-semibold">Video Edukasi</h3>
              <p className="text-muted-foreground text-sm">
                Video pengenalan manajemen risiko &amp; MR Kabar (30 menit). Bisa ditonton lewat tombol
                "Tonton video" di halaman login, dan versi lengkap dengan daftar bab, penyaring peran, serta uji
                pemahaman ada di menu Panduan.
              </p>

              <div className="flex items-center gap-3 rounded-md border p-3">
                <Checkbox
                  id="edu_video_enabled"
                  checked={eduVideoEnabled}
                  onCheckedChange={(checked) => setEduVideoEnabled(checked === true)}
                />
                <Label htmlFor="edu_video_enabled" className="flex-1 text-sm font-normal">
                  Tampilkan tombol video edukasi di halaman login
                </Label>
              </div>

              {eduVideoEnabled && (
                <div className="space-y-6">
                  {/* Berkas kustom (opsional) */}
                  <div className="space-y-1">
                    {/* 50MB, bukan 150MB: batas sesungguhnya datang dari PHP
                        (upload_max_filesize=50M, post_max_size=55M) — validasi
                        Laravel di-set sama supaya pesan galatnya jelas, bukan
                        gagal senyap di level web server. */}
                    <Label htmlFor="edu_video_path">Ganti berkas video (MP4/WebM/MOV, maks 50MB)</Label>
                    <Input
                      id="edu_video_path"
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setData('edu_video_path', file);
                        if (file) {
                          setEduVideoPreview(URL.createObjectURL(file));
                          setRemoveEduVideo(false);
                        }
                      }}
                      className={errors.edu_video_path ? 'border-red-500' : ''}
                    />
                    {errors.edu_video_path && <p className="text-sm text-red-500">{errors.edu_video_path}</p>}
                    <p className="text-muted-foreground text-xs">
                      Kosongkan kalau tidak ingin mengganti — video bawaan yang dipakai. Berkas unggahan sendiri
                      audionya menyatu di dalam video, sehingga setelan volume mix di bawah tidak berlaku
                      untuknya; subtitle tetap bisa dipasang lewat kolom di bawah ini.
                    </p>

                    {eduVideoPreview && !removeEduVideo && (
                      <div className="mt-2 space-y-2">
                        {/* Untuk video BAWAAN, pratinjaunya memakai pemutar yang
                            sama persis dengan yang dilihat pengguna — bukan
                            elemen <video> polos. Bedanya nyata: suara video
                            bawaan datang dari tiga jalur audio terpisah, jadi
                            hanya pemutar inilah yang membunyikannya, menuruti
                            tombol bisu, dan menerapkan keempat setelan di bawah.
                            Nilainya diambil dari state form, bukan dari yang
                            tersimpan — supaya bisa didengar & dilihat SEBELUM
                            disimpan. Berkas unggahan admin audionya menyatu di
                            dalam video, jadi tetap diputar apa adanya. */}
                        {eduVideoPreview === VIDEO_BAWAAN ? (
                          <div>
                            <EduVideoPlayer
                              src={VIDEO_BAWAAN + versiVideo}
                              stems={{
                                narration: STEM_BAWAAN.narration + versiVideo,
                                music: STEM_BAWAAN.music + versiVideo,
                                sfx: STEM_BAWAAN.sfx + versiVideo,
                              }}
                              vtt={VTT_BAWAAN + versiVideo}
                              gains={{ narration: gainNarration, music: gainMusic, sfx: gainSfx }}
                              subtitleEnabled={subtitleEnabled}
                              subtitleSize={subtitleSize}
                              chapterNav
                            />
                            <p className="text-muted-foreground mt-1.5 text-xs">
                              Pratinjau ini langsung mengikuti setelan di bawah — geser slider sambil video
                              berjalan untuk mendengar dan melihat hasilnya sebelum disimpan.
                            </p>
                          </div>
                        ) : (
                          <video src={eduVideoPreview} controls preload="none" className="max-h-48 rounded border" />
                        )}
                        {setting?.edu_video_path && (
                          <div>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setRemoveEduVideo(true);
                                setEduVideoPreview(null);
                                setData('edu_video_path', null);
                              }}
                            >
                              Hapus berkas kustom (kembali ke video bawaan)
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    {removeEduVideo && (
                      <p className="text-sm text-amber-600">
                        Berkas kustom akan dihapus saat disimpan — kembali memakai video bawaan.
                      </p>
                    )}
                  </div>

                  {/* Subtitle */}
                  <div className="space-y-3 rounded-md border p-4">
                    <div>
                      <Label>Subtitle</Label>
                      <p className="text-muted-foreground mt-1 text-xs">
                        Subtitle dikirim sebagai berkas terpisah, bukan dibakar ke gambar — karena itu bisa
                        dimatikan dan diubah ukurannya di sini tanpa perlu me-render ulang videonya.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="edu_video_subtitle_path">Ganti berkas subtitle (.vtt atau .srt, maks 2MB)</Label>
                      <Input
                        id="edu_video_subtitle_path"
                        type="file"
                        accept=".vtt,.srt,text/vtt"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setData('edu_video_subtitle_path', file);
                          if (file) setHapusSubtitle(false);
                        }}
                        className={errors.edu_video_subtitle_path ? 'border-red-500' : ''}
                      />
                      {errors.edu_video_subtitle_path && (
                        <p className="text-sm text-red-500">{errors.edu_video_subtitle_path}</p>
                      )}
                      <p className="text-muted-foreground text-xs">
                        Kosongkan kalau tidak ingin mengganti. Berkas .srt otomatis dikonversi ke .vtt saat
                        disimpan. Wajib diisi kalau Anda memasang video sendiri di atas — subtitle bawaan tidak
                        dipakaikan ke video lain karena menit-detiknya milik video yang berbeda.
                      </p>

                      {setting?.edu_video_subtitle_path && !hapusSubtitle && (
                        <div className="flex flex-wrap items-center gap-3 pt-1">
                          <a
                            href={`/storage/${setting.edu_video_subtitle_path}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary text-sm underline underline-offset-4 hover:no-underline"
                          >
                            Lihat berkas subtitle terpasang
                          </a>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setHapusSubtitle(true);
                              setData('edu_video_subtitle_path', null);
                            }}
                          >
                            Hapus (kembali ke subtitle bawaan)
                          </Button>
                        </div>
                      )}

                      {hapusSubtitle && (
                        <p className="text-sm text-amber-600">
                          Berkas subtitle akan dihapus saat disimpan — kembali memakai subtitle bawaan.
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <Checkbox
                        id="edu_video_subtitle_enabled"
                        checked={subtitleEnabled}
                        onCheckedChange={(checked) => setSubtitleEnabled(checked === true)}
                      />
                      <Label htmlFor="edu_video_subtitle_enabled" className="flex-1 text-sm font-normal">
                        Tampilkan subtitle saat video diputar
                      </Label>
                    </div>

                    {subtitleEnabled && (
                      <div className="flex items-center gap-4">
                        <span className="w-36 shrink-0 text-sm">Ukuran teks</span>
                        <input
                          type="range"
                          min={50}
                          max={200}
                          step={5}
                          value={subtitleSize}
                          onChange={(e) => setSubtitleSize(Number(e.target.value))}
                          className="accent-primary h-2 flex-1 cursor-pointer"
                        />
                        <span className="w-28 shrink-0 text-right font-mono text-sm tabular-nums">
                          {subtitleSize}%
                          <span className="text-muted-foreground ml-1 text-xs">
                            ~{Math.round((1080 * 0.028 * subtitleSize) / 100)}px
                          </span>
                        </span>
                      </div>
                    )}
                    {subtitleEnabled && (
                      <p className="text-muted-foreground text-xs">
                        Ukuran mengikuti besar gambar, jadi porsinya sama baik di pemutar kecil maupun layar
                        penuh. Angka px di samping slider adalah perkiraan pada layar 1080p.
                      </p>
                    )}
                  </div>

                  {/* Balance audio */}
                  <div className="space-y-3 rounded-md border p-4">
                    <div>
                      <Label>Volume mix audio</Label>
                      <p className="text-muted-foreground mt-1 text-xs">
                        Video bawaan dikirim ke pemutar sebagai tiga jalur audio terpisah (narasi, musik, efek
                        suara) — perubahan di sini langsung terdengar tanpa render ulang.
                      </p>
                    </div>
                    {[
                      { label: 'Narasi', value: gainNarration, set: setGainNarration },
                      { label: 'Musik', value: gainMusic, set: setGainMusic },
                      { label: 'Efek suara (SFX)', value: gainSfx, set: setGainSfx },
                    ].map((row) => (
                      <div key={row.label} className="flex items-center gap-4">
                        <span className="w-36 shrink-0 text-sm">{row.label}</span>
                        <input
                          type="range"
                          min={0}
                          max={200}
                          step={5}
                          value={row.value}
                          onChange={(e) => row.set(Number(e.target.value))}
                          className="accent-primary h-2 flex-1 cursor-pointer"
                        />
                        <span className="w-14 shrink-0 text-right font-mono text-sm tabular-nums">
                          {row.value}%
                        </span>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setGainNarration(100);
                        setGainMusic(100);
                        setGainSfx(100);
                      }}
                    >
                      Kembalikan ke bawaan (100% / 100% / 100%)
                    </Button>
                  </div>
                </div>
              )}

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
              <div className="pt-4 flex justify-end">
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
