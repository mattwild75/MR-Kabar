import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type BreadcrumbItem } from '@/types';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
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
            <p className="text-muted-foreground">
              Manage roles and permissions for the system
            </p>
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
              <CardContent className="py-6 text-center text-muted-foreground">
                No role data available.
              </CardContent>
            </Card>
          )}

          {roles.map((role) => (
            <Card key={role.id} className="border shadow-sm">
              <CardHeader className="bg-muted/40 border-b md:flex-row md:items-center md:justify-between md:space-y-0 space-y-2">
                <div className="space-y-1">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    {role.name}
                  </CardTitle>
                  <div className="text-sm text-muted-foreground">
                    {role.permissions.length} permission
                    {role.permissions.length > 1 ? 's' : ''}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/roles/${role.id}/edit`}>
                    <Button size="sm" variant="outline">Edit</Button>
                  </Link>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="destructive">Delete</Button>
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
                        <AlertDialogAction
                          onClick={() => handleDelete(role.id)}
                          disabled={processing}
                        >
                          Yes, Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardHeader>

              {role.permissions.length > 0 && (
                <CardContent className="pt-4">
                  <p className="mb-2 text-sm font-medium text-muted-foreground">
                    Permissions:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {role.permissions.map((permission) => (
                      <Badge
                        key={permission.id}
                        variant="outline"
                        className="font-normal text-xs border-muted"
                      >
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
