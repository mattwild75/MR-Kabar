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

  const flash = (props?.flash as { success?: string; error?: string; justLoggedIn?: boolean }) ?? {};
  const [showSplash, setShowSplash] = useState(!!flash.justLoggedIn);
  const setting = props?.setting as {
    nama_app: string;
    logo?: string;
    warna?: string;
    seo?: {
      title?: string;
      description?: string;
      keywords?: string;
    };
    contact_email?: string | null;
    contact_email_secondary?: string | null;
    footer_credit?: string | null;
  };

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
            <div className="min-w-0 flex-1">{children}</div>
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
      {showSplash && <LoginSplash onDone={() => setShowSplash(false)} />}
    </>
  );
}
