import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import React from 'react';

interface Permission {
    id: number;
    name: string;
    group: string;
}

interface Role {
    id?: number;
    name: string;
    permissions?: Permission[];
}

interface Props {
    role?: Role;
    groupedPermissions: Record<string, Permission[]>;
}

export default function RoleForm({ role, groupedPermissions }: Props) {
    const isEdit = !!role;

    const { data, setData, post, put, processing, errors } = useForm({
        name: role?.name || '',
        permissions: role?.permissions?.map((p) => p.name) || [],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit) {
            put(`/roles/${role?.id}`);
        } else {
            post('/roles');
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Role Management', href: '/roles' },
        { title: isEdit ? 'Edit Role' : 'Create Role', href: '#' },
    ];

    const togglePermission = (perm: string) => {
        setData('permissions', data.permissions.includes(perm) ? data.permissions.filter((p) => p !== perm) : [...data.permissions, perm]);
    };

    const toggleGroup = (_group: string, perms: Permission[]) => {
        const allChecked = perms.every((perm) => data.permissions.includes(perm.name));
        if (allChecked) {
            setData(
                'permissions',
                data.permissions.filter((p) => !perms.map((perm) => perm.name).includes(p)),
            );
        } else {
            const newPermissions = [...data.permissions];
            perms.forEach((perm) => {
                if (!newPermissions.includes(perm.name)) {
                    newPermissions.push(perm.name);
                }
            });
            setData('permissions', newPermissions);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEdit ? 'Edit Role' : 'Create Role'} />
            <div className="flex-1 p-4 md:p-6">
                <Card className="mx-auto max-w-4xl">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-2xl font-bold tracking-tight">{isEdit ? 'Edit Role' : 'Create New Role'}</CardTitle>
                        <p className="text-muted-foreground text-sm">
                            {isEdit ? 'Update role details and permissions' : 'Create a new role and set permissions'}
                        </p>
                    </CardHeader>

                    <Separator />

                    <CardContent className="pt-5">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="name" className="mb-2 block">
                                        Role Name
                                    </Label>
                                    <Input
                                        id="name"
                                        placeholder="Enter role name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className={errors.name ? 'border-red-500' : ''}
                                    />
                                    {errors.name && <p className="mt-2 text-sm text-red-500">{errors.name}</p>}
                                </div>

                                <Separator />

                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-lg font-semibold">Permissions</h2>
                                        <p className="text-muted-foreground text-sm">Select permissions to grant to this role</p>
                                    </div>

                                    <div className="space-y-4">
                                        {Object.entries(groupedPermissions).map(([group, perms]) => {
                                            const allChecked = perms.every((perm) => data.permissions.includes(perm.name));

                                            return (
                                                <div key={group} className="bg-muted/20 rounded-lg border p-4">
                                                    <div className="mb-3 flex items-center gap-3">
                                                        <Checkbox
                                                            id={`group-${group}`}
                                                            checked={allChecked}
                                                            onCheckedChange={() => toggleGroup(group, perms)}
                                                        />
                                                        <label
                                                            htmlFor={`group-${group}`}
                                                            className="text-muted-foreground cursor-pointer text-sm font-medium tracking-wider uppercase"
                                                        >
                                                            {group}
                                                        </label>
                                                    </div>
                                                    <div className="grid grid-cols-1 gap-3 pl-7 sm:grid-cols-2 md:grid-cols-3">
                                                        {perms.map((perm) => (
                                                            <div key={perm.id} className="flex items-center gap-3">
                                                                <Checkbox
                                                                    id={`perm-${perm.id}`}
                                                                    checked={data.permissions.includes(perm.name)}
                                                                    onCheckedChange={() => togglePermission(perm.name)}
                                                                />
                                                                <label htmlFor={`perm-${perm.id}`} className="cursor-pointer text-sm">
                                                                    {perm.name}
                                                                </label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div className="flex flex-col-reverse justify-end gap-3 pt-2 sm:flex-row">
                                <Link href="/roles" className="w-full sm:w-auto">
                                    <Button type="button" variant="secondary" className="w-full">
                                        Cancel
                                    </Button>
                                </Link>
                                <Button type="submit" disabled={processing} className="w-full sm:w-auto">
                                    {processing ? (
                                        <span className="flex items-center gap-2">
                                            <span className="animate-spin">↻</span>
                                            Saving...
                                        </span>
                                    ) : isEdit ? (
                                        'Save Changes'
                                    ) : (
                                        'Create Role'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
