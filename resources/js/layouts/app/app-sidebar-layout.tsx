import { useEffect, useState } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import { AppContent } from '@/components/app-content';
import { AppFooter } from '@/components/app-footer';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { LoginSplash } from '@/components/login-splash';
import { SessionTimeoutWarning } from '@/components/session-timeout-warning';
import { type BreadcrumbItem } from '@/types';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { Eye } from 'lucide-react';
import { useIsViewer } from '@/hooks/use-viewer';

interface Props {
  children: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  title?: string;
}

export default function AppSidebarLayout({
  children,
  breadcrumbs = [],
  title = 'Dashboard',
}: Props) {
  const { props } = usePage();
  const isViewer = useIsViewer();

  const flash = (props?.flash as { success?: string; error?: string; justLoggedIn?: boolean }) ?? {};
  const setting = props?.setting as {
    nama_app: string;
    logo?: string;
    warna?: string;
    login_splash_enabled?: boolean;
    login_splash_video?: string | null;
    login_splash_muted?: boolean;
    seo?: {
      title?: string;
      description?: string;
      keywords?: string;
    };
    contact_email?: string | null;
    contact_email_secondary?: string | null;
    footer_credit?: string | null;
  };
  // login_splash_enabled default true kalau field-nya belum ada (mis. cache
  // Inertia lama sebelum kolom ini ditambahkan) — jangan tiba-tiba
  // menghilangkan splash yg sebelumnya SELALU tampil hanya krn field baru
  // ini undefined, HANYA matikan kalau admin EKSPLISIT set false.
  const [showSplash, setShowSplash] = useState(!!flash.justLoggedIn && setting?.login_splash_enabled !== false);

  useEffect(() => {
    if (flash.success) toast.success(flash.success);
    if (flash.error) toast.error(flash.error);
  }, [flash]);

  const primaryColor = setting?.warna || '#0ea5e9';
  const primaryForeground = '#ffffff';

  useEffect(() => {
    const unsubscribe = router.on('navigate', () => {
      router.reload({ only: ['menus'] });
    });

    return () => unsubscribe();
  }, []);

  return (
    <>
      <Head>
        <title>{title ?? setting?.seo?.title ?? setting?.nama_app ?? 'Dashboard'}</title>
        {setting?.seo?.description && (
          <meta name="description" content={setting.seo.description} />
        )}
        {setting?.seo?.keywords && (
          <meta name="keywords" content={setting.seo.keywords} />
        )}
        <style>
          {`
            :root {
              --primary: ${primaryColor};
              --color-primary: ${primaryColor};
              --primary-foreground: ${primaryForeground};
              --color-primary-foreground: ${primaryForeground};
            }
            .dark {
              --primary: ${primaryColor};
              --color-primary: ${primaryColor};
              --primary-foreground: ${primaryForeground};
              --color-primary-foreground: ${primaryForeground};
            }
          `}
        </style>
      </Head>

      <div
        style={{
          ['--primary' as any]: primaryColor,
          ['--primary-foreground' as any]: primaryForeground,
          ['--color-primary' as any]: primaryColor,
          ['--color-primary-foreground' as any]: primaryForeground,
        }}
      >
        {/* print:hidden pada Sidebar/Header/Footer + print:w-full pada
            AppContent — TANPA ini, sidebar & navbar ikut ter-screenshot
            Browsershot (PdfPrintService) krn keduanya bukan bagian dari
            halaman Cetak2a/2b/2c.tsx sendiri (yg sudah py print:hidden utk
            toolbar internalnya), melainkan wrapper AppLayout yg dipakai
            SEMUA halaman. Sebelumnya "berhasil" scroll manual/Ctrl+P
            krn browser biasa menampilkan print preview scrollable (user
            bisa uncheck "print backgrounds"/atur margin manual), tapi
            Browsershot screenshot APA ADANYA yg dirender saat emulateMedia
            ('print') aktif — sidebar/navbar yg tidak diberi print:hidden
            ikut tercetak persis spt terlihat di layar biasa. */}
        <AppShell variant="sidebar">
          <div className="print:hidden">
            <AppSidebar />
          </div>
          <AppContent variant="sidebar" className="flex min-w-0 flex-col print:w-full print:max-w-none">
            <div className="print:hidden">
              <AppSidebarHeader breadcrumbs={breadcrumbs} />
            </div>
            {isViewer && (
              // Ditampilkan permanen supaya pengguna eksekutif tahu sejak awal
              // kenapa tombol-tombol aksi tidak ada — bukan mengira aplikasinya
              // rusak. Larangan sesungguhnya ada di sisi server.
              <div className="mx-4 mt-3 flex items-center gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-400 print:hidden">
                <Eye className="size-4 shrink-0" />
                <span>
                  <span className="font-medium">Mode Peninjau</span> — akun ini dapat melihat seluruh data,
                  tetapi tidak dapat menambah, mengubah, atau menghapus apa pun.
                </span>
              </div>
            )}
            {/* max-w dibatasi HANYA di layar sangat lebar (ultrawide
                2560px+) — di bawah itu (termasuk desktop 1920px biasa)
                nilainya lebih besar dari lebar viewport jadi tidak
                berpengaruh sama sekali, TIDAK mengurangi ruang tabel lebar
                (Data Risiko Gabungan dkk) di resolusi umum. Tanpa batas
                ini, kartu-kartu Dashboard/halaman lain melebar penuh
                mengikuti viewport ultrawide dan terlihat "lengang"/tidak
                proporsional (ditemukan lewat audit responsif desktop —
                screenshot 2560px & 3440px). mx-auto menjaga konten tetap
                di tengah, bukan menempel ke kiri, saat max-w ini aktif.
                print:max-w-none supaya Form Cetak tetap tidak terpengaruh. */}
            <div className="min-w-0 max-w-[1800px] flex-1 print:max-w-none xl:mx-auto xl:w-full">{children}</div>
            <div className="print:hidden">
              <AppFooter
                contactEmail={setting?.contact_email}
                contactEmailSecondary={setting?.contact_email_secondary}
                footerCredit={setting?.footer_credit}
              />
            </div>
          </AppContent>
        </AppShell>
      </div>

      <Toaster />
      <SessionTimeoutWarning />
      {showSplash && (
        <LoginSplash
          onDone={() => setShowSplash(false)}
          videoPath={setting?.login_splash_video}
          muted={setting?.login_splash_muted ?? true}
        />
      )}
    </>
  );
}
