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
        <AppShell variant="sidebar">
          <AppSidebar />
          <AppContent variant="sidebar" className="flex min-w-0 flex-col">
            <AppSidebarHeader breadcrumbs={breadcrumbs} />
            <div className="min-w-0 flex-1">{children}</div>
            <AppFooter
              contactEmail={setting?.contact_email}
              contactEmailSecondary={setting?.contact_email_secondary}
              footerCredit={setting?.footer_credit}
            />
          </AppContent>
        </AppShell>
      </div>

      <Toaster />
      <SessionTimeoutWarning />
      {showSplash && <LoginSplash onDone={() => setShowSplash(false)} />}
    </>
  );
}
