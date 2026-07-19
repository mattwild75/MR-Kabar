import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

import { usePage, Link } from '@inertiajs/react';
import AppLogo from './app-logo';
import { NavUser } from '@/components/nav-user';
import { iconMapper, preloadIconMap, onIconMapReady } from '@/lib/iconMapper';

// Mulai fetch chunk icon-list.ts (3500+ icon Lucide) begitu app-sidebar.tsx
// diimpor — DILUAR komponen supaya panggilan sekali per load halaman, bukan
// per-mount. Sebelumnya icon-list.ts di-import statis di sini sehingga ikut
// terbundel ke chunk app-layout yg dimuat SEMUA halaman (~1MB); dipindah
// jadi import() dinamis via iconMapper.ts supaya app-layout lebih kecil,
// TANPA mengubah ikon yg akhirnya ditampilkan — preload dimulai sedini
// mungkin (module scope) supaya biasanya sudah siap sebelum render pertama
// sidebar selesai.
preloadIconMap();
import type { LucideIcon } from 'lucide-react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

// Layout memicu router.reload({ only: ['menus'] }) di setiap navigasi
// (lihat app-sidebar-layout.tsx) supaya menu ikut permission terbaru —
// efek sampingnya, elemen scroll SidebarContent ikut re-render dan posisi
// scroll-nya reset ke atas. Simpan & pulihkan manual supaya posisi terakhir
// yang diklik user tetap terlihat, tidak "geser" ke atas.
const SIDEBAR_SCROLL_KEY = 'sidebar-scroll-top';

// Accordion tunggal: hanya SATU menu per level sibling yang boleh terbuka
// sekaligus (activeMenu = id menu itu, atau null kalau semua tertutup).
// Disimpan di sessionStorage per LEVEL (bukan React state biasa) supaya
// tidak ikut reset ketika router.reload({ only: ['menus'] }) di atas
// memicu re-render AppSidebar setiap navigasi. Key sessionStorage dibubuhi
// nomor level supaya submenu level-1 di bawah grup A tidak saling
// menutup dgn submenu level-1 di bawah grup B (tiap RenderMenu instance
// = satu level sibling = satu slot activeMenu sendiri, diidentifikasi
// oleh gabungan level + id induk terdekat yg lagi dirender).
// v2: dinaikkan dari 'sidebar-active-menu' krn skema lama pernah menyimpan
// scopeKey submenu sbg "open" yg tidak pernah dibersihkan sebelum fix
// unmount-saat-closed diterapkan — data lama itu bikin submenu (mis. CEE)
// tampak otomatis terbuka lagi meski baru saja diklik pertama kali.
const SIDEBAR_ACTIVE_MENU_KEY = 'sidebar-active-menu-v2';

function readActiveMenus(): Record<string, number | null> {
  try {
    return JSON.parse(sessionStorage.getItem(SIDEBAR_ACTIVE_MENU_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function writeActiveMenus(map: Record<string, number | null>) {
  sessionStorage.setItem(SIDEBAR_ACTIVE_MENU_KEY, JSON.stringify(map));
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
  { icon: 'text-sky-500', activeBg: 'bg-sky-500/15', activeRing: 'ring-sky-500/30', border: 'border-sky-500/60' },
  { icon: 'text-emerald-500', activeBg: 'bg-emerald-500/15', activeRing: 'ring-emerald-500/30', border: 'border-emerald-500/60' },
  { icon: 'text-amber-500', activeBg: 'bg-amber-500/15', activeRing: 'ring-amber-500/30', border: 'border-amber-500/60' },
  { icon: 'text-violet-500', activeBg: 'bg-violet-500/15', activeRing: 'ring-violet-500/30', border: 'border-violet-500/60' },
  { icon: 'text-rose-500', activeBg: 'bg-rose-500/15', activeRing: 'ring-rose-500/30', border: 'border-rose-500/60' },
  { icon: 'text-cyan-500', activeBg: 'bg-cyan-500/15', activeRing: 'ring-cyan-500/30', border: 'border-cyan-500/60' },
  { icon: 'text-orange-500', activeBg: 'bg-orange-500/15', activeRing: 'ring-orange-500/30', border: 'border-orange-500/60' },
  { icon: 'text-fuchsia-500', activeBg: 'bg-fuchsia-500/15', activeRing: 'ring-fuchsia-500/30', border: 'border-fuchsia-500/60' },
  { icon: 'text-lime-600', activeBg: 'bg-lime-500/15', activeRing: 'ring-lime-500/30', border: 'border-lime-500/60' },
  { icon: 'text-indigo-500', activeBg: 'bg-indigo-500/15', activeRing: 'ring-indigo-500/30', border: 'border-indigo-500/60' },
];

function groupColor(menuId: number) {
  return GROUP_COLORS[menuId % GROUP_COLORS.length];
}

/**
 * Flyout cascading murni React (TANPA Radix Popover) — dipakai grup menu
 * level-0 saat sidebar collapsed. Radix Popover (dicoba sebelumnya)
 * menampilkan konten dgn benar tapi klik di dalamnya tidak terdaftar
 * (kemungkinan konflik focus-trap/dismissable-layer internal yg sulit
 * didiagnosis tanpa akses browser langsung) — jadi diganti implementasi
 * manual yg predictable: posisi dihitung dari getBoundingClientRect()
 * trigger, di-render via createPortal ke document.body (fixed positioned,
 * lolos dari overflow/stacking-context sidebar), ditutup otomatis saat
 * pointerdown di luar (listener document, sama pola dgn menu Start
 * Windows lama: klik menu -> submenu muncul di samping -> klik item ->
 * langsung navigasi & menu tertutup).
 */
function SidebarFlyout({
  getAnchor,
  open,
  onClose,
  children,
}: {
  getAnchor: () => HTMLElement | null;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const flyoutRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (!open) {
      setPos(null);
      return;
    }
    let rafId = 0;
    const updatePos = () => {
      const rect = getAnchor()?.getBoundingClientRect();
      if (rect) {
        setPos({ top: rect.top, left: rect.right + 8 });
      } else {
        // Anchor belum ter-mount saat effect pertama jalan (race antara
        // ref-callback & effect ordering) — coba sekali lagi di frame
        // berikutnya sebelum menyerah, supaya flyout tetap muncul di posisi
        // yang benar dan bukan hilang diam-diam.
        rafId = requestAnimationFrame(updatePos);
      }
    };
    updatePos();
    window.addEventListener('scroll', updatePos, true);
    window.addEventListener('resize', updatePos);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', updatePos, true);
      window.removeEventListener('resize', updatePos);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (flyoutRef.current?.contains(target)) return;
      if (getAnchor()?.contains(target)) return;
      onClose();
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, onClose]);

  if (!open || !pos) return null;

  return createPortal(
    <div
      ref={flyoutRef}
      style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 50 }}
      className="w-64 rounded-md border bg-popover text-popover-foreground shadow-md"
    >
      {children}
    </div>,
    document.body,
  );
}

function RenderMenu({
  items,
  level = 0,
  groupColorOverride,
  scopeKey = 'root',
}: {
  items: MenuItem[];
  level?: number;
  /** Warna grup level-0 yg diteruskan ke anak2nya (submenu ikut warna induk). */
  groupColorOverride?: ReturnType<typeof groupColor>;
  /** Kunci unik utk slot accordion level ini — tiap grup induk membuka
   * scope activeMenu-nya sendiri (satu terbuka per level SIBLING, bukan
   * satu terbuka utk SELURUH sidebar) sesuai id induk terdekat + level. */
  scopeKey?: string;
}) {
  const { url: currentUrl } = usePage();
  const { state: sidebarState } = useSidebar();
  const [activeMenus, setActiveMenus] = useState<Record<string, number | null>>(readActiveMenus);
  const activeMenuId = activeMenus[scopeKey] ?? null;
  // Flyout cascading (bukan accordion inline) HANYA utk grup menu level-0
  // saat sidebar collapsed (mode ikon) — accordion inline yg mendorong
  // lebar konten ke samping tidak masuk akal di kolom sempit ikon-only
  // (lihat pola sidebar myut.ut.ac.id / menu Start Windows lama: klik grup
  // saat collapsed -> submenu muncul melayang di samping, bukan mendorong
  // layout). Level > 0 (submenu di dalam flyout) tetap accordion inline
  // biasa krn ruang flyout-nya sendiri sudah cukup lebar.
  const usesFlyout = level === 0 && sidebarState === 'collapsed';
  // ID menu yg flyout-nya SEDANG terbuka — satu instance RenderMenu
  // me-render BANYAK item sibling via .map(), jadi state ini WAJIB
  // menyimpan id (bukan boolean tunggal), kalau tidak semua item level-0
  // akan berbagi 1 status buka/tutup yg sama (bug: klik grup A ikut
  // membuka/menutup grup B krn keduanya baca boolean yg sama).
  const [openFlyoutId, setOpenFlyoutId] = useState<number | null>(null);
  const anchorRefs = useRef<Map<number, HTMLElement>>(new Map());

  // Layout memicu router.reload({ only: ['menus'] }) tiap navigasi, mengganti
  // referensi array `items` — reset flyout yang sedang terbuka supaya tidak
  // tersisa menunjuk anchor lama yang sudah ter-unmount (dead anchor).
  useEffect(() => {
    setOpenFlyoutId(null);
  }, [items]);

  if (!Array.isArray(items)) return null;

  // Klik menu yg belum aktif -> buka menu itu (otomatis menutup sibling
  // lain krn cuma ada 1 slot activeMenu per scope). Klik menu yg sudah
  // aktif -> tutup (toggle ke null). Setiap kali menu di-toggle, SEMUA
  // scopeKey turunannya (submenu, sub-submenu, dst — level berapa pun di
  // bawahnya) ikut dihapus dari state tersimpan. Tanpa ini, scopeKey anak
  // yg pernah dibuka sebelumnya (mis. "Form Input:CEE" atau
  // "Form Input:CEE:1a") tetap tersimpan "open" di sessionStorage dan akan
  // langsung muncul terbuka lagi begitu induknya (Form Input) dibuka
  // ulang — padahal seharusnya hanya SATU tingkat di bawah induk yg
  // ditampilkan, sisanya tertutup sampai diklik manual satu per satu.
  const toggleGroup = (id: number) => {
    setActiveMenus((prev) => {
      const currentlyOpen = (prev[scopeKey] ?? null) === id;
      const next: Record<string, number | null> = { ...prev, [scopeKey]: currentlyOpen ? null : id };

      // Hapus SEMUA scopeKey turunan menu ini — termasuk scopeKey milik
      // menu itu SENDIRI sbg induk (mis. "root:FormInputId"), BUKAN cuma
      // turunan-dari-turunannya. Sebelumnya hanya prefix
      // "scopeKey:id:" yg dibersihkan (turunan level+2 ke bawah), padahal
      // scopeKey level+1 milik menu ini sendiri ("scopeKey:id" TANPA titik
      // dua akhir) tidak ikut kehapus — itulah kenapa submenu yg PERNAH
      // dibuka sebelumnya (mis. CEE dgn scopeKey "root:FormInputId") tetap
      // "ingat" statusnya & langsung tampak terbuka lagi begitu Form Input
      // dibuka ulang, padahal seharusnya SEMUA level di bawah induk yg baru
      // dibuka wajib mulai dari keadaan tertutup.
      const descendantPrefix = `${scopeKey}:${id}`;
      for (const key of Object.keys(next)) {
        if (key === descendantPrefix || key.startsWith(`${descendantPrefix}:`)) {
          delete next[key];
        }
      }

      writeActiveMenus(next);
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
        // Menu leaf (tanpa anak) hanya aktif kalau PATH-nya PERSIS sama
        // (query string diabaikan) — bukan sub-path — supaya menu tetangga
        // yang route-nya kebetulan jadi prefix (mis. "/backup" vs
        // "/backup/excel") tidak ikut tersorot. Aturan sub-path
        // (matchesUrl) tetap dipakai utk menu yang PUNYA anak (grup),
        // karena grup memang harus tetap tersorot saat salah satu anaknya
        // aktif.
        const currentPath = currentUrl.split('?')[0];
        const isActive = hasChildren ? matchesUrl(menu.route, currentUrl) : currentPath === menu.route;

        // Grup level-0 dapat warna barunya sendiri (deterministik per id);
        // submenu di bawahnya mewarisi warna induk supaya tetap terasa satu
        // grup saat sidebar di-scan sekilas.
        const color = level === 0 ? groupColor(menu.id) : groupColorOverride ?? groupColor(menu.id);

        const activeClass = isActive
          ? `${color.activeBg} text-foreground font-semibold shadow-sm ring-1 ${color.activeRing}`
          : 'text-foreground/80 hover:bg-accent hover:text-foreground';

        // Aksen border kiri permanen per grup level-0 — pembeda visual
        // cepat antar grup menu (Dashboard/Access/Settings/dst) tanpa perlu
        // hover/klik, terlihat sekilas saat sidebar di-scan.
        const accentBorderClass = level === 0 ? `border-l-2 ${color.border}` : '';

        if (!menu.route && !hasChildren) return null;

        if (hasChildren) {
          // Default terbuka kalau belum ada preferensi tersimpan DAN grup
          // ini sedang berisi halaman aktif — HANYA di level-0 (grup
          // paling atas), supaya saat pertama kali buka aplikasi, grup
          // yang relevan langsung kelihatan tanpa perlu diklik. Level di
          // bawahnya (submenu) TIDAK ikut auto-open berantai — harus
          // diklik manual, sesuai logika accordion murni (satu per satu).
          const isOpen = activeMenuId != null ? activeMenuId === menu.id : level === 0 && containsActiveRoute(menu, currentUrl);

          const isFlyoutOpen = openFlyoutId === menu.id;

          const triggerButton = (
            <SidebarMenuButton
              ref={usesFlyout ? (el) => { if (el) anchorRefs.current.set(menu.id, el); else anchorRefs.current.delete(menu.id); } : undefined}
              type="button"
              onClick={usesFlyout ? () => setOpenFlyoutId((v) => (v === menu.id ? null : menu.id)) : () => toggleGroup(menu.id)}
              data-state={isOpen ? 'open' : 'closed'}
              className={cn(
                'group !h-auto w-full min-w-0 !items-start justify-between gap-2 overflow-visible rounded-md transition-colors',
                activeClass,
                accentBorderClass,
                level === 0 ? 'py-3 px-4 my-1' : 'py-2 px-3',
                // Sidebar collapsible="icon" (lihat AppSidebar di bawah):
                // saat collapsed, batalkan padding kiri/kanan & accent
                // border (yg dihitung utk lebar penuh) supaya ikon
                // benar2 center di kolom sempit ikon-only, bukan geser
                // krn sisa padding/border dari mode expanded.
                'group-data-[collapsible=icon]:!justify-center group-data-[collapsible=icon]:!p-2 group-data-[collapsible=icon]:!border-l-0 group-data-[collapsible=icon]:!my-0.5'
              )}
            >
              <div className="flex min-w-0 items-start group-data-[collapsible=icon]:min-w-0">
                <Icon className={cn('size-4 mr-3 mt-0.5 shrink-0 opacity-90 group-hover:opacity-100 group-data-[collapsible=icon]:mr-0 group-data-[collapsible=icon]:mt-0', color.icon)} />
                <span className="whitespace-normal text-clip break-words text-left overflow-visible group-data-[collapsible=icon]:hidden">{menu.title}</span>
              </div>
              <ChevronDown
                className={cn(
                  'size-4 mt-0.5 shrink-0 opacity-50 group-hover:opacity-70 transition-transform duration-[250ms] ease-in-out group-data-[collapsible=icon]:hidden',
                  isOpen && 'rotate-180'
                )}
              />
            </SidebarMenuButton>
          );

          // Sidebar collapsed: klik grup -> flyout cascading muncul di
          // samping sidebar (pola myut.ut.ac.id / menu Start Windows lama),
          // BUKAN accordion inline yg mendorong lebar kolom ikon-only.
          // Klik item di dalamnya langsung navigasi (Link biasa) & flyout
          // tertutup otomatis krn Inertia me-navigate ke halaman baru;
          // klik di luar flyout jg menutup (lihat SidebarFlyout).
          if (usesFlyout) {
            return (
              <SidebarMenuItem key={menu.id}>
                {triggerButton}
                <SidebarFlyout getAnchor={() => anchorRefs.current.get(menu.id) ?? null} open={isFlyoutOpen} onClose={() => setOpenFlyoutId(null)}>
                  <div className={cn('border-b px-3 py-2 text-xs font-semibold tracking-wide uppercase', color.icon)}>{menu.title}</div>
                  <div className="max-h-[70vh] overflow-y-auto p-1.5">
                    <SidebarMenu>
                      <RenderMenu items={children} level={level + 1} groupColorOverride={color} scopeKey={`${scopeKey}:${menu.id}`} />
                    </SidebarMenu>
                  </div>
                </SidebarFlyout>
              </SidebarMenuItem>
            );
          }

          return (
            <SidebarMenuItem key={menu.id}>
              {triggerButton}
              {/* Accordion smooth open/close via grid-template-rows 0fr<->1fr
                  (bukan height:auto/max-height fixed) — transisi tetap mulus
                  utk konten dgn tinggi bervariasi (jumlah submenu berbeda2
                  per grup), tanpa perlu ukur tinggi manual pakai JS. */}
              <div
                className="grid overflow-hidden transition-[grid-template-rows] duration-[250ms] ease-in-out"
                style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
              >
                <div className="min-h-0">
                  {/* Kartu pembungkus submenu — kontras thd background
                      sidebar di KEDUA arah tema: light mode dibuat lebih
                      GELAP (bg-black/5) krn --popover putih polos nyaris
                      sama dgn --sidebar-background yg juga hampir putih
                      (tidak kelihatan bedanya); dark mode dibuat lebih
                      TERANG (dark:bg-white/10) drpd background sidebar yg
                      gelap. Pakai overlay black/white tembus pandang
                      (bukan warna solid custom) supaya otomatis ikut
                      berbagai tema warna sidebar tanpa perlu var CSS baru. */}
                  <div className="my-1 ml-1.5 rounded-md border border-border/70 bg-black/5 dark:bg-white/10 p-1.5 shadow-sm">
                    {/* RenderMenu turunan HANYA di-mount saat isOpen — kalau
                        selalu dimount (cuma disembunyikan via CSS), state
                        activeMenus miliknya sendiri (React state terpisah
                        per instance) akan tetap "ingat" submenu yg pernah
                        dibuka sebelumnya, sehingga saat induknya dibuka
                        ulang, anak-cucu ikut terbuka lagi tanpa diklik.
                        Unmount+remount memaksa submenu selalu mulai dari
                        keadaan tertutup (satu tingkat saja) tiap kali induk
                        dibuka, sesuai logika accordion murni. */}
                    {isOpen && (
                      <SidebarMenu>
                        <RenderMenu items={children} level={level + 1} groupColorOverride={color} scopeKey={`${scopeKey}:${menu.id}`} />
                      </SidebarMenu>
                    )}
                  </div>
                </div>
              </div>
            </SidebarMenuItem>
          );
        }

        return (
          <SidebarMenuItem key={menu.id}>
            <SidebarMenuButton
              asChild
              className={cn(
                'group !h-auto w-full min-w-0 !items-start overflow-visible rounded-md transition-colors',
                activeClass,
                accentBorderClass,
                level === 0 ? 'py-3 px-4 my-1' : 'py-2 px-3',
                // Sama seperti tombol grup di atas — center-kan ikon saat
                // sidebar collapsed, jangan warisi padding/border mode expanded.
                'group-data-[collapsible=icon]:!justify-center group-data-[collapsible=icon]:!p-2 group-data-[collapsible=icon]:!border-l-0 group-data-[collapsible=icon]:!my-0.5'
              )}
            >
              <Link href={menu.route || '#'}>
                {/* Ikon + teks dibungkus dalam satu flex, sama seperti menu
                    bergrup di atas — supaya jarak ikon→teks (mr-3) konsisten.
                    Tanpa pembungkus ini, ikon jadi anak langsung tombol dan
                    ikut kena gap-2 bawaan SidebarMenuButton di ATAS mr-3,
                    membuat jaraknya lebih lebar dari menu lain (mis. Dashboard). */}
                <div className="flex min-w-0 items-start group-data-[collapsible=icon]:min-w-0">
                  <Icon className={cn('size-4 mr-3 mt-0.5 shrink-0 opacity-90 group-hover:opacity-100 group-data-[collapsible=icon]:mr-0 group-data-[collapsible=icon]:mt-0', color.icon)} />
                  <span className="whitespace-normal break-words text-left !truncate-none group-data-[collapsible=icon]:hidden">{menu.title}</span>
                </div>
                {level > 0 && (
                  <ChevronRight className="ml-auto size-4 mt-0.5 shrink-0 opacity-40 group-hover:opacity-70 group-data-[collapsible=icon]:hidden" />
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
  // Paksa satu re-render setelah peta ikon (dimuat async, lihat
  // preloadIconMap() di atas) siap, supaya ikon menu yg sempat fallback ke
  // LayoutGrid pada render pertama langsung terganti ikon aslinya — hanya
  // relevan pada kunjungan pertama sebelum chunk ke-cache browser.
  const [, forceRerenderAfterIconsReady] = useState(0);
  useEffect(() => onIconMapReady(() => forceRerenderAfterIconsReady((n) => n + 1)), []);

  // Pulihkan posisi scroll HANYA SEKALI saat mount (dependency array kosong)
  // — sebelumnya effect ini tidak punya dependency array sama sekali,
  // jadi berjalan ulang di SETIAP render (termasuk saat props `menus`
  // berubah akibat navigasi Inertia biasa), memaksa scrollTop kembali ke
  // posisi tersimpan setiap kali dan bisa "melawan" scroll manual
  // pengguna yang sedang berlangsung. Listener scroll (menyimpan posisi
  // terkini ke sessionStorage) tetap aktif selama komponen ter-mount,
  // tidak perlu di-reset ulang tiap render.
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
  }, []);

  return (
    <Sidebar collapsible="icon" variant="inset" className="border-r border-sidebar-border bg-sidebar/95 backdrop-blur supports-[backdrop-filter]:bg-sidebar/60">
      {/* border-sidebar-border (bukan border-b polos yg jatuh ke token
          --border global) — supaya garis pemisah header/menu ikut warna
          sidebar sendiri & tetap kontras di dark mode, bukan warna netral
          yg didesain utk konteks halaman biasa. */}
      {/* group-data-[collapsible=icon]:px-2 — px-4 bawaan (16px kiri+kanan)
          ditambah lebar logo 32px melebihi lebar sidebar collapsed (3rem/
          48px), membuat logo terlihat terpotong/terdesak oleh overflow
          container saat sidebar di-collapse ke mode ikon. */}
      <SidebarHeader className="px-4 py-3 border-b border-sidebar-border group-data-[collapsible=icon]:px-2">

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
      <SidebarFooter className="px-4 py-3 border-t border-sidebar-border">
        <NavUser  />
      </SidebarFooter>
    </Sidebar>
  );
}
