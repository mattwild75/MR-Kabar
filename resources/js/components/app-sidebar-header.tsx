import AppearanceDropdown from '@/components/appearance-dropdown';
import { Breadcrumbs } from '@/components/breadcrumbs';
import NotificationBell from '@/components/notification-bell';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { useState } from 'react';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    const [lang, setLang] = useState('id');

    return (
        <header className="border-border/70 bg-background/95 relative flex h-16 shrink-0 items-center justify-between overflow-hidden border-b px-4 shadow-sm backdrop-blur transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-6">
            {/* strip gradient tipis warna identitas Aceh di tepi bawah
          topbar, senada dengan sentuhan sidebar — wrapper relative/overflow
          LOKAL pada elemen header ini (bukan ancestor manapun yang fixed),
          aman thd masalah containing-block. */}
            <div
                className="from-primary via-primary/40 pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r to-transparent"
                aria-hidden="true"
            />

            {/* Left: Sidebar + Breadcrumb */}
            <div className="relative flex items-center gap-2">
                <SidebarTrigger className="text-foreground -ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            {/* Right: Language + Theme */}
            <div className="relative flex items-center gap-3">
                <Select value={lang} onValueChange={setLang}>
                    <SelectTrigger className="bg-background w-[120px]">
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
