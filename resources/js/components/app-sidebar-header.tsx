import { useState } from 'react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import AppearanceDropdown from '@/components/appearance-dropdown';
import NotificationBell from '@/components/notification-bell';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
  const [lang, setLang] = useState('id');

  return (
    <header className="relative flex h-16 shrink-0 items-center justify-between overflow-hidden border-b border-border/70 bg-background/95 px-4 shadow-sm backdrop-blur transition-[width,height] ease-linear md:px-6 group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      {/* strip gradient tipis warna identitas Aceh di tepi bawah
          topbar, senada dengan sentuhan sidebar — wrapper relative/overflow
          LOKAL pada elemen header ini (bukan ancestor manapun yang fixed),
          aman thd masalah containing-block. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-primary via-primary/40 to-transparent" aria-hidden="true" />

      {/* Left: Sidebar + Breadcrumb */}
      <div className="relative flex items-center gap-2">
        <SidebarTrigger className="-ml-1 text-foreground" />
        <Breadcrumbs breadcrumbs={breadcrumbs} />
      </div>

      {/* Right: Language + Theme */}
      <div className="relative flex items-center gap-3">
        <Select value={lang} onValueChange={setLang}>
          <SelectTrigger className="w-[120px] bg-background">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="id">🇮🇩 Bahasa</SelectItem>
            <SelectItem value="en">🇺🇸 English</SelectItem>
          </SelectContent>
        </Select>

        <NotificationBell />
        <AppearanceDropdown />
      </div>
    </header>
  );
}
