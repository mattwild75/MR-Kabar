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
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import relativeTime from 'dayjs/plugin/relativeTime';

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
}

function getInitials(name: string) {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase();
}

export default function UserIndex({ users }: Props) {
    const { delete: destroy, processing } = useForm();

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
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
                        <p className="text-muted-foreground">Manage user data and their roles within the system.</p>
                    </div>
                    <Link href="/users/create">
                        <Button className="w-full md:w-auto" size="sm">
                            + Add User
                        </Button>
                    </Link>
                </div>

                <div className="bg-background space-y-2 divide-y rounded-md border">
                    {users.data.length === 0 ? (
                        <div className="text-muted-foreground py-8 text-center">No user data available.</div>
                    ) : (
                        users.data.map((user) => (
                            <div
                                key={user.id}
                                className="hover:bg-muted/50 flex flex-col justify-between gap-4 px-4 py-5 transition md:flex-row md:items-center"
                            >
                                {/* Avatar dan Informasi */}
                                <div className="flex flex-1 items-start gap-4">
                                    <div className="bg-muted text-primary flex h-12 w-12 items-center justify-center rounded-full text-lg font-semibold">
                                        {getInitials(user.name)}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-base font-medium">{user.name}</div>
                                        <div className="text-muted-foreground text-sm">@{user.username}</div>
                                        {user.email && <div className="text-muted-foreground text-xs">{user.email}</div>}
                                        <div className="text-muted-foreground text-xs italic">Registered {dayjs(user.created_at).fromNow()}</div>
                                        {user.roles.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-1">
                                                {user.roles.map((role) => (
                                                    <Badge key={role.id} variant="secondary" className="text-xs font-normal">
                                                        {role.name}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Aksi */}
                                <div className="flex flex-wrap gap-2 md:justify-end">
                                    <Link href={`/users/${user.id}/edit`}>
                                        <Button size="sm" variant="outline">
                                            Edit
                                        </Button>
                                    </Link>

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
                                                    Password untuk <strong>{user.name}</strong> akan diganti dengan kata sandi acak baru. Kata sandi
                                                    baru akan ditampilkan setelah proses reset berhasil — pastikan untuk mencatatnya.
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
                            </div>
                        ))
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
