import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useIsViewer } from '@/hooks/use-viewer';
import { cn } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';

const sidebarNavItems: NavItem[] = [
    {
        title: 'Profile',
        url: '/settings/profile',
        icon: null,
    },
    {
        title: 'Password',
        url: '/settings/password',
        icon: null,
    },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    const currentPath = window.location.pathname;

    // Akun peninjau dipakai bergantian oleh banyak orang, jadi profil & kata
    // sandinya bukan milik satu orang untuk diubah sendiri — lihat
    // ViewerReadOnly di sisi server, yang menolaknya beneran. Di sini
    // formnya cuma tidak ditampilkan supaya tidak ada yang mengisinya lalu
    // ditolak.
    const akunBersama = useIsViewer();
    const halamanAkun = currentPath === '/settings/profile' || currentPath === '/settings/password';
    const navItems = akunBersama ? [] : sidebarNavItems;

    return (
        <div className="px-4 py-6">
            <Heading title="Profile Settings" description="Manage your profile and account settings" />

            <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12">
                <aside className="w-full max-w-xl lg:w-48">
                    <nav className="flex flex-col space-y-1 space-x-0">
                        {navItems.map((item) => (
                            <Button
                                key={item.url}
                                size="sm"
                                variant="ghost"
                                asChild
                                className={cn('w-full justify-start', {
                                    'bg-muted': currentPath === item.url,
                                })}
                            >
                                <Link href={item.url} prefetch>
                                    {item.title}
                                </Link>
                            </Button>
                        ))}
                    </nav>
                </aside>

                <Separator className="my-6 md:hidden" />

                <div className="flex-1 md:max-w-2xl">
                    <section className="max-w-xl space-y-12">
                        {akunBersama && halamanAkun ? (
                            <p className="text-muted-foreground rounded-md border border-dashed p-4 text-sm">
                                Akun peninjau dipakai bersama beberapa orang. Mengubah profil atau kata sandinya akan memutus akses semua pengguna
                                lain, jadi pengelolaannya dipegang Admin. Hubungi Admin bila datanya perlu diperbarui.
                            </p>
                        ) : (
                            children
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}
