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
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Permission } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Edit, Plus, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

interface Props {
    permissions: {
        data: Permission[];
        current_page: number;
        last_page: number;
        links: { url: string | null; label: string; active: boolean }[];
    };
    groups: string[];
    filters: {
        group?: string;
        search?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Permission Management',
        href: '/permissions',
    },
];

export default function PermissionIndex({ permissions, groups, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    const handleDelete = (id: number) => {
        router.delete(`/permissions/${id}`, {
            onSuccess: () => toast.success('Permission deleted successfully'),
            onError: () => toast.error('Failed to delete permission'),
        });
    };

    const handleGroupChange = (value: string) => {
        const actualValue = value === '__ALL__' ? '' : value;
        router.get('/permissions', { ...filters, group: actualValue }, { preserveScroll: true });
    };

    const handleSearchKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            router.get('/permissions', { ...filters, search }, { preserveScroll: true });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Permission Management" />
            <div className="flex-1 p-4 md:p-6">
                <Card>
                    <CardHeader className="flex flex-col gap-4 pb-3 md:flex-row md:items-center md:justify-between">
                        <div>
                            <CardTitle className="text-2xl font-bold">Permissions</CardTitle>
                            <p className="text-muted-foreground text-sm">Manage system access permissions</p>
                        </div>
                        <Link href="/permissions/create">
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Permission
                            </Button>
                        </Link>
                    </CardHeader>

                    <Separator />

                    <CardContent className="space-y-6 pt-6">
                        {/* Filter */}
                        <div className="flex flex-col gap-4 md:flex-row md:items-center">
                            <Input
                                type="text"
                                placeholder="Search permissions... (press Enter)"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={handleSearchKey}
                            />
                            <Select value={filters.group || '__ALL__'} onValueChange={handleGroupChange}>
                                <SelectTrigger className="md:w-64">
                                    <SelectValue placeholder="All Groups" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="__ALL__">All Groups</SelectItem>
                                    {groups.map((group) => (
                                        <SelectItem key={group} value={group}>
                                            {group}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* List */}
                        <div className="space-y-3">
                            {permissions.data.length === 0 ? (
                                <p className="text-muted-foreground text-center">No data available.</p>
                            ) : (
                                permissions.data.map((permission) => (
                                    <div
                                        key={permission.id}
                                        className="bg-muted/50 hover:bg-muted/70 flex items-center justify-between rounded-md border px-4 py-3 transition"
                                    >
                                        <div className="text-foreground text-sm font-medium">{permission.name}</div>
                                        <div className="flex items-center gap-2">
                                            <Link href={`/permissions/${permission.id}/edit`}>
                                                <Button variant="ghost" size="icon">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-red-600">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Delete this permission?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Permission <strong>{permission.name}</strong> will be permanently deleted.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            className="bg-destructive hover:bg-destructive/90"
                                                            onClick={() => handleDelete(permission.id)}
                                                        >
                                                            Delete
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Pagination */}
                        {permissions.links.length > 1 && (
                            <div className="flex flex-wrap justify-center gap-2 pt-6">
                                {permissions.links.map((link, i) => (
                                    <Button
                                        key={i}
                                        disabled={!link.url}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => router.visit(link.url || '', { preserveScroll: true })}
                                    >
                                        <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                    </Button>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
