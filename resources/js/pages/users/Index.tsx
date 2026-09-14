import EmptyState from '@/components/empty-state';
import PageHeader from '@/components/page-header';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Plus, Search } from 'lucide-react';
import { useState } from 'react';

dayjs.extend(relativeTime);
dayjs.locale('id');

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'User Management',
        href: '/users',
    },
];

interface User {
    id: number;
    name: string;
    username: string;
    email: string;
    created_at: string;
    roles: {
        id: number;
        name: string;
    }[];
}

interface Props {
    users: {
        data: User[];
        current_page: number;
        last_page: number;
        links: { url: string | null; label: string; active: boolean }[];
    };
    q?: string;
}

/** Dua huruf saja — nama OPD panjang ("PIC BADAN ...") sebelumnya
 *  menghasilkan tujuh huruf yang meluap dari lingkarannya. */
function getInitials(name: string) {
    const kata = name
        .replace(/[^\p{L}\p{N} ]/gu, '')
        .split(' ')
        .filter(Boolean);
    if (kata.length === 0) return '?';
    if (kata.length === 1) return kata[0].slice(0, 2).toUpperCase();
    return (kata[0][0] + kata[kata.length - 1][0]).toUpperCase();
}

export default function UserIndex({ users, q = '' }: Props) {
    const { delete: destroy, processing } = useForm();
    const [cari, setCari] = useState(q);
    const jalankanCari = () => router.get('/users', cari ? { q: cari } : {}, { preserveState: true, replace: true });

    const handleDelete = (id: number) => {
        destroy(`/users/${id}`);
    };

    const handleResetPassword = (id: number) => {
        router.put(`/users/${id}/reset-password`, {}, { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Management" />
            <div className="space-y-6 p-4 md:p-6">
                <PageHeader
                    title="User Management"
                    description="Manage user data and their roles within the system."
                    actions={
                        <Button asChild size="sm">
                            <Link href="/users/create">
                                <Plus className="h-4 w-4" />
                                Add User
                            </Link>
                        </Button>
                    }
                />

                <div className="relative max-w-sm">
                    <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input
                        value={cari}
                        onChange={(e) => setCari(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && jalankanCari()}
                        placeholder="Search name, username, or email..."
                        className="pl-9"
                    />
                </div>

                <div className="bg-card overflow-x-auto rounded-md border">
                    {users.data.length === 0 ? (
                        <EmptyState
                            title={q ? 'No matching users' : 'No user data available'}
                            description={q ? `No user matches "${q}".` : 'Users you add will appear here with their roles.'}
                        />
                    ) : (
                        <table className="w-full table-fixed text-sm">
                            <thead className="bg-muted/60 text-muted-foreground text-left text-xs">
                                <tr>
                                    <th className="w-[34%] px-4 py-2.5 font-medium">User</th>
                                    <th className="w-[22%] px-4 py-2.5 font-medium">Email</th>
                                    <th className="w-[12%] px-4 py-2.5 font-medium">Roles</th>
                                    <th className="w-[13%] px-4 py-2.5 font-medium whitespace-nowrap">Registered</th>
                                    <th className="w-[19%] px-4 py-2.5 text-right font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {users.data.map((user) => (
                                    <tr key={user.id} className="hover:bg-muted/40 transition-colors">
                                        <td className="px-4 py-2.5">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-muted text-foreground flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                                                    {getInitials(user.name)}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="truncate font-medium" title={user.name}>
                                                        {user.name}
                                                    </div>
                                                    <div className="text-muted-foreground truncate text-xs" title={user.username}>
                                                        @{user.username}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="text-muted-foreground truncate px-4 py-2.5 text-xs" title={user.email ?? undefined}>
                                            {user.email ?? '—'}
                                        </td>
                                        <td className="px-4 py-2.5">
                                            <div className="flex flex-wrap gap-1">
                                                {user.roles.map((role) => (
                                                    <Badge key={role.id} variant="secondary" className="text-xs font-normal">
                                                        {role.name}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </td>
                                        <td
                                            className="text-muted-foreground px-4 py-2.5 text-xs whitespace-nowrap"
                                            title={dayjs(user.created_at).format('D MMMM YYYY')}
                                        >
                                            {dayjs(user.created_at).fromNow()}
                                        </td>
                                        <td className="px-4 py-2.5">
                                            <div className="flex justify-end gap-1.5">
                                                <Button asChild size="sm" variant="outline">
                                                    <Link href={`/users/${user.id}/edit`}>Edit</Link>
                                                </Button>

                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button size="sm" variant="secondary">
                                                            Reset
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Reset Password?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Password untuk <strong>{user.name}</strong> akan diganti dengan kata sandi acak baru.
                                                                Kata sandi baru akan ditampilkan setelah proses reset berhasil — pastikan untuk
                                                                mencatatnya.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Batal</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleResetPassword(user.id)} disabled={processing}>
                                                                Ya, Reset
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>

                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button size="sm" variant="destructive">
                                                            Delete
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Delete User?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                User <strong>{user.name}</strong> will be permanently deleted.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDelete(user.id)} disabled={processing}>
                                                                Yes, Delete
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {users.last_page > 1 && (
                    <div className="flex flex-wrap items-center justify-center gap-1">
                        {users.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url || '#'}
                                preserveScroll
                                className={`rounded-md border px-3 py-1.5 text-sm transition ${
                                    link.active
                                        ? 'bg-primary text-primary-foreground border-white/40'
                                        : link.url
                                          ? 'hover:bg-muted'
                                          : 'text-muted-foreground cursor-not-allowed opacity-50'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
