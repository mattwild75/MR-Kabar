import { useState } from 'react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import AppearanceDropdown from '@/components/appearance-dropdown';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
  const [lang, setLang] = useState('id');

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border/70 bg-background/95 px-4 shadow-sm backdrop-blur transition-[width,height] ease-linear md:px-6 group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      {/* Left: Sidebar + Breadcrumb */}
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1 text-foreground" />
        <Breadcrumbs breadcrumbs={breadcrumbs} />
      </div>

      {/* Right: Language + Theme */}
      <div className="flex items-center gap-3">
        <Select value={lang} onValueChange={setLang}>
          <SelectTrigger className="w-[120px] bg-background">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="id">🇮🇩 Bahasa</SelectItem>
            <SelectItem value="en">🇺🇸 English</SelectItem>
          </SelectContent>
        </Select>

        <AppearanceDropdown />
      </div>
    </header>
  );
}
