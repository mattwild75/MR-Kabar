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

const DEFAULT_WARNA = '#181818';
const DEFAULT_LOGO_BG = '#ffffff';

interface SettingApp {
  nama_app: string;
  deskripsi: string;
  warna: string;
  logo: string;
  logo_bg: string | null;
  favicon: string;
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
  });

  const logoPreview = useRef<string | null>(setting?.logo ? `/storage/${setting.logo}` : null);
  const faviconPreview = useRef<string | null>(setting?.favicon ? `/storage/${setting.favicon}` : null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // When the toggle is off, send an empty string so the backend stores
    // "no background" rather than whatever color was last picked.
    transform((current) => ({
      ...current,
      logo_bg: useLogoBg ? current.logo_bg : '',
      favicon_from_logo: faviconFromLogo,
    }));
    post('/settingsapp', {
      forceFormData: true,
      preserveScroll: true,
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
