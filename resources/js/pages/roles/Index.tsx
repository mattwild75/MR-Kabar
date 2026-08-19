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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Role Management',
        href: '/roles',
    },
];

interface Permission {
    id: number;
    name: string;
    group: string;
}

interface Role {
    id: number;
    name: string;
    permissions: Permission[];
}

interface Props {
    roles: Role[];
    groupedPermissions: Record<string, Permission[]>;
}

export default function RoleIndex({ roles }: Props) {
    const { delete: destroy, processing } = useForm();

    const handleDelete = (id: number) => {
        destroy(`/roles/${id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Role Management" />
            <div className="flex-1 space-y-6 p-4 md:p-6">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Role Management</h1>
                        <p className="text-muted-foreground">Manage roles and permissions for the system</p>
                    </div>
                    <Link href="/roles/create">
                        <Button className="w-full md:w-auto" size="sm">
                            + Add Role
                        </Button>
                    </Link>
                </div>

                <div className="space-y-4">
                    {roles.length === 0 && (
                        <Card>
                            <CardContent className="text-muted-foreground py-6 text-center">No role data available.</CardContent>
                        </Card>
                    )}

                    {roles.map((role) => (
                        <Card key={role.id} className="border shadow-sm">
                            <CardHeader className="bg-muted/40 space-y-2 border-b md:flex-row md:items-center md:justify-between md:space-y-0">
                                <div className="space-y-1">
                                    <CardTitle className="flex items-center gap-2 text-base font-semibold">
                                        <ShieldCheck className="text-primary h-4 w-4" />
                                        {role.name}
                                    </CardTitle>
                                    <div className="text-muted-foreground text-sm">
                                        {role.permissions.length} permission
                                        {role.permissions.length > 1 ? 's' : ''}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Link href={`/roles/${role.id}/edit`}>
                                        <Button size="sm" variant="outline">
                                            Edit
                                        </Button>
                                    </Link>

                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button size="sm" variant="destructive">
                                                Delete
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Role <strong>{role.name}</strong> will be permanently deleted.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(role.id)} disabled={processing}>
                                                    Yes, Delete
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </CardHeader>

                            {role.permissions.length > 0 && (
                                <CardContent className="pt-4">
                                    <p className="text-muted-foreground mb-2 text-sm font-medium">Permissions:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {role.permissions.map((permission) => (
                                            <Badge key={permission.id} variant="outline" className="border-muted text-xs font-normal">
                                                {permission.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
