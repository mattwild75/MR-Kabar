import { Link } from '@inertiajs/react';
import { Mail, MessageCircle, Headset } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TroubleshootDialog } from '@/components/troubleshoot-dialog';

// Kontak default bila tidak diatur lewat Application Settings.
const DEFAULT_CONTACT_EMAIL = 'Mehmet.muhammad@gmail.com';
const CONTACT_WHATSAPP = '6285277878936';

interface AppFooterProps {
  contactEmail?: string | null;
  contactEmailSecondary?: string | null;
  footerCredit?: string | null;
}

/** Link Gmail web compose (bukan mailto:) — langsung buka gmail.com draft baru, mendukung >1 penerima. */
function gmailComposeUrl(to: string[]): string {
  const params = new URLSearchParams({ view: 'cm', fs: '1', to: to.join(',') });
  return `https://mail.google.com/mail/?${params.toString()}`;
}

export function AppFooter({ contactEmail, contactEmailSecondary, footerCredit }: AppFooterProps) {
  const year = new Date().getFullYear();
  const recipients = [contactEmail || DEFAULT_CONTACT_EMAIL, contactEmailSecondary].filter(
    (v): v is string => !!v,
  );

  return (
    <footer className="flex flex-col items-center justify-between gap-3 border-t border-border/70 bg-background/95 px-4 py-3 text-sm text-muted-foreground md:flex-row md:px-6">
      <div className="flex flex-col items-center gap-1 md:items-start">
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 md:justify-start">
          <span className="font-medium text-foreground">Copyright © {year}</span>
          {footerCredit && (
            <span className="font-medium text-foreground">{footerCredit}</span>
          )}
        </div>
        <div className="flex items-baseline gap-2">
          <Link href="/dashboard" className="font-semibold text-foreground hover:underline">
            MR Kabar
          </Link>
          <span className="text-xs italic text-muted-foreground">&ldquo;Risiko TerKabar, Daerah Terjaga&rdquo;</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-1.5 font-medium hover:text-foreground"
            >
              <Headset className="h-4 w-4" />
              Contact Us
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <a
                href={`https://wa.me/${CONTACT_WHATSAPP}`}
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                WhatsApp
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a
                href={gmailComposeUrl(recipients)}
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer"
              >
                <Mail className="mr-2 h-4 w-4" />
                Email
              </a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {/* Dulu link mailto; kini form laporan in-app untuk semua user login.
            Rekapannya di menu Utilities => Troubleshoot (admin/super-admin). */}
        <TroubleshootDialog />
      </div>
    </footer>
  );
}
