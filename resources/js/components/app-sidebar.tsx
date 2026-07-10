import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

import { usePage, Link } from '@inertiajs/react';
import AppLogo from './app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavUser } from '@/components/nav-user';
import { iconMapper } from '@/lib/iconMapper';
import type { LucideIcon } from 'lucide-react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

// Layout memicu router.reload({ only: ['menus'] }) di setiap navigasi
// (lihat app-sidebar-layout.tsx) supaya menu ikut permission terbaru —
// efek sampingnya, elemen scroll SidebarContent ikut re-render dan posisi
// scroll-nya reset ke atas. Simpan & pulihkan manual supaya posisi terakhir
// yang diklik user tetap terlihat, tidak "geser" ke atas.
const SIDEBAR_SCROLL_KEY = 'sidebar-scroll-top';

// State expand/collapse per grup menu disimpan di sessionStorage (bukan
// React state biasa) supaya tidak ikut reset ketika router.reload({ only:
// ['menus'] }) di atas memicu re-render AppSidebar setiap navigasi.
const SIDEBAR_OPEN_GROUPS_KEY = 'sidebar-open-groups';

function readOpenGroups(): Record<number, boolean> {
  try {
    return JSON.parse(sessionStorage.getItem(SIDEBAR_OPEN_GROUPS_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function writeOpenGroups(groups: Record<number, boolean>) {
  sessionStorage.setItem(SIDEBAR_OPEN_GROUPS_KEY, JSON.stringify(groups));
}

interface MenuItem {
  id: number;
  title: string;
  route: string | null;
  icon: string;
  children?: MenuItem[];
}

function matchesUrl(route: string | null, currentUrl: string): boolean {
  // Cocokkan path persis, atau sebagai sub-path (diikuti "/" atau "?")
  // — bukan sekadar prefix string, karena itu salah mengenali
  // "/krs_irs_pemda_visualisasi" sebagai aktif untuk menu dengan
  // route "/krs_irs_pemda" (prefix-nya kebetulan sama).
  return !!route && (currentUrl === route || currentUrl.startsWith(`${route}/`) || currentUrl.startsWith(`${route}?`));
}

function containsActiveRoute(menu: MenuItem, currentUrl: string): boolean {
  if (matchesUrl(menu.route, currentUrl)) return true;
  return (menu.children ?? []).some((child) => child && containsActiveRoute(child, currentUrl));
}

// Warna unik per grup menu level-0 (Dashboard, Utilities, dll) — dipilih
// deterministik dari id menu supaya stabil antar render/reload tanpa perlu
// kolom warna baru di DB. Dipakai pada ikon grup (selalu, agar sidebar
// mudah dipindai) & aksen border/teks saat grup itu aktif.
const GROUP_COLORS = [
  { icon: 'text-sky-500', activeBg: 'bg-sky-500/15', activeRing: 'ring-sky-500/30' },
  { icon: 'text-emerald-500', activeBg: 'bg-emerald-500/15', activeRing: 'ring-emerald-500/30' },
  { icon: 'text-amber-500', activeBg: 'bg-amber-500/15', activeRing: 'ring-amber-500/30' },
  { icon: 'text-violet-500', activeBg: 'bg-violet-500/15', activeRing: 'ring-violet-500/30' },
  { icon: 'text-rose-500', activeBg: 'bg-rose-500/15', activeRing: 'ring-rose-500/30' },
  { icon: 'text-cyan-500', activeBg: 'bg-cyan-500/15', activeRing: 'ring-cyan-500/30' },
  { icon: 'text-orange-500', activeBg: 'bg-orange-500/15', activeRing: 'ring-orange-500/30' },
  { icon: 'text-fuchsia-500', activeBg: 'bg-fuchsia-500/15', activeRing: 'ring-fuchsia-500/30' },
  { icon: 'text-lime-600', activeBg: 'bg-lime-500/15', activeRing: 'ring-lime-500/30' },
  { icon: 'text-indigo-500', activeBg: 'bg-indigo-500/15', activeRing: 'ring-indigo-500/30' },
];

function groupColor(menuId: number) {
  return GROUP_COLORS[menuId % GROUP_COLORS.length];
}

function RenderMenu({
  items,
  level = 0,
  groupColorOverride,
}: {
  items: MenuItem[];
  level?: number;
  /** Warna grup level-0 yg diteruskan ke anak2nya (submenu ikut warna induk). */
  groupColorOverride?: ReturnType<typeof groupColor>;
}) {
  const { url: currentUrl } = usePage();
  const [openGroups, setOpenGroups] = useState<Record<number, boolean>>(readOpenGroups);

  if (!Array.isArray(items)) return null;

  const toggleGroup = (id: number, isOpen: boolean) => {
    setOpenGroups((prev) => {
      const next = { ...prev, [id]: isOpen };
      writeOpenGroups(next);
      return next;
    });
  };

  return (
    <>
      {items.map((menu) => {
        if (!menu) return null;
        const Icon = iconMapper(menu.icon || 'Folder') as LucideIcon;
        const children = Array.isArray(menu.children) ? menu.children.filter(Boolean) : [];
        const hasChildren = children.length > 0;
        const isActive = matchesUrl(menu.route, currentUrl);
        const indentClass = level > 0 ? `pl-${4 + level * 3}` : '';

        // Grup level-0 dapat warna barunya sendiri (deterministik per id);
        // submenu di bawahnya mewarisi warna induk supaya tetap terasa satu
        // grup saat sidebar di-scan sekilas.
        const color = level === 0 ? groupColor(menu.id) : groupColorOverride ?? groupColor(menu.id);

        const activeClass = isActive
          ? `${color.activeBg} text-foreground font-semibold shadow-sm ring-1 ${color.activeRing}`
          : 'text-foreground/80 hover:bg-accent hover:text-foreground';

        if (!menu.route && !hasChildren) return null;

        if (hasChildren) {
          // Default terbuka kalau belum ada preferensi tersimpan DAN grup
          // ini sedang berisi halaman aktif — supaya saat pertama kali
          // buka aplikasi, menu yang relevan langsung kelihatan.
          const isOpen = openGroups[menu.id] ?? containsActiveRoute(menu, currentUrl);

          return (
            <SidebarMenuItem key={menu.id}>
              <Collapsible open={isOpen} onOpenChange={(open) => toggleGroup(menu.id, open)}>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    data-state={isOpen ? 'open' : 'closed'}
                    className={cn(
                      `group !h-auto w-full min-w-0 !items-start justify-between gap-2 overflow-visible rounded-md transition-colors ${indentClass}`,
                      activeClass,
                      level === 0 ? 'py-3 px-4 my-1' : 'py-2 px-3'
                    )}
                  >
                    <div className="flex min-w-0 items-start">
                      <Icon className={cn('size-4 mr-3 mt-0.5 shrink-0 opacity-90 group-hover:opacity-100', color.icon)} />
                      <span className="whitespace-normal text-clip break-words text-left overflow-visible">{menu.title}</span>
                    </div>
                    <ChevronDown className="size-4 mt-0.5 shrink-0 opacity-50 group-hover:opacity-70 transition-transform group-data-[state=open]:rotate-180" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenu className="ml-3 border-l border-border/70 pl-3">
                    <RenderMenu items={children} level={level + 1} groupColorOverride={color} />
                  </SidebarMenu>
                </CollapsibleContent>
              </Collapsible>
            </SidebarMenuItem>
          );
        }

        return (
          <SidebarMenuItem key={menu.id}>
            <SidebarMenuButton
              asChild
              className={cn(
                `group !h-auto w-full min-w-0 !items-start overflow-visible rounded-md transition-colors ${indentClass}`,
                activeClass,
                level === 0 ? 'py-3 px-4 my-1' : 'py-2 px-3'
              )}
            >
              <Link href={menu.route || '#'}>
                {/* Ikon + teks dibungkus dalam satu flex, sama seperti menu
                    bergrup di atas — supaya jarak ikon→teks (mr-3) konsisten.
                    Tanpa pembungkus ini, ikon jadi anak langsung tombol dan
                    ikut kena gap-2 bawaan SidebarMenuButton di ATAS mr-3,
                    membuat jaraknya lebih lebar dari menu lain (mis. Dashboard). */}
                <div className="flex min-w-0 items-start">
                  <Icon className={cn('size-4 mr-3 mt-0.5 shrink-0 opacity-90 group-hover:opacity-100', color.icon)} />
                  <span className="whitespace-normal break-words text-left !truncate-none">{menu.title}</span>
                </div>
                {level > 0 && (
                  <ChevronRight className="ml-auto size-4 mt-0.5 shrink-0 opacity-0 group-hover:opacity-50" />
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </>
  );
}

export function AppSidebar() {
  const { menus = [] } = usePage().props as { menus?: MenuItem[] };
  const contentRef = useRef<HTMLDivElement>(null);

  // Pulihkan posisi scroll segera setelah render (sebelum browser paint),
  // supaya reload menu di setiap navigasi tidak terlihat "geser ke atas".
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const saved = sessionStorage.getItem(SIDEBAR_SCROLL_KEY);
    if (saved) {
      el.scrollTop = Number(saved);
    }

    const handleScroll = () => {
      sessionStorage.setItem(SIDEBAR_SCROLL_KEY, String(el.scrollTop));
    };
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  });

  return (
    <Sidebar collapsible="icon" variant="inset" className="border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <SidebarHeader className="px-4 py-3 border-b">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="hover:bg-transparent">
              <Link href="/dashboard" prefetch>
                <AppLogo />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent ref={contentRef} className="px-2 py-4">
        <SidebarMenu>
          <RenderMenu items={menus} />
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="px-4 py-3 border-t">
        <NavUser  />
      </SidebarFooter>
    </Sidebar>
  );
}
