import React from 'react';
import { useForm, Link, Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { type BreadcrumbItem } from '@/types';
import IconPicker from '@/components/ui/icon-picker';
import ComboboxPermission from '@/components/ui/combobox-permission';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

const NO_PARENT_VALUE = 'none';

interface MenuFormProps {
  menu?: {
    id: number;
    title: string;
    route: string;
    icon: string;
    parent_id: number | null;
    permission_name: string | null;
  };
  parentMenus: { id: number; title: string }[];
  permissions: string[];
}

export default function MenuForm({ menu, parentMenus, permissions }: MenuFormProps) {
  const isEdit = !!menu;

  const { data, setData, post, put, processing, errors, reset } = useForm({
    title: menu?.title || '',
    route: menu?.route || '',
    icon: menu?.icon || '',
    parent_id: menu?.parent_id ?? null,
    permission_name: menu?.permission_name || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    isEdit ? put(`/menus/${menu?.id}`) : post('/menus', { onSuccess: () => reset() });
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Menu Management', href: '/menus' },
    { title: isEdit ? 'Edit Menu' : 'Add Menu', href: '#' },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={isEdit ? 'Edit Menu' : 'Add Menu'} />
      <div className="flex-1 p-4 md:p-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="pb-3">
            <CardTitle className="text-2xl font-bold tracking-tight">
              {isEdit ? 'Edit Menu' : 'Add New Menu'}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {isEdit ? 'Update menu details' : 'Create a new menu for the system'}
            </p>
          </CardHeader>

          <Separator />

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Menu Title *</Label>
                  <Input
                    id="title"
                    value={data.title}
                    onChange={(e) => setData('title', e.target.value)}
                    placeholder="Example: Dashboard"
                    className={errors.title ? 'border-red-500' : ''}
                  />
                  {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="route">Route</Label>
                  <Input
                    id="route"
                    value={data.route}
                    onChange={(e) => setData('route', e.target.value)}
                    placeholder="Example: /dashboard"
                    className={errors.route ? 'border-red-500' : ''}
                  />
                  {errors.route && <p className="text-sm text-red-500">{errors.route}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="icon">Icon (Lucide)</Label>
                  <IconPicker value={data.icon} onChange={(val) => setData('icon', val)} />
                  {errors.icon && <p className="text-sm text-red-500">{errors.icon}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parent_id">Parent Menu</Label>
                  <Select
                    value={data.parent_id === null ? NO_PARENT_VALUE : String(data.parent_id)}
                    onValueChange={(val) =>
                      setData('parent_id', val === NO_PARENT_VALUE ? null : Number(val))
                    }
                  >
                    <SelectTrigger id="parent_id">
                      <SelectValue placeholder="— None —" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_PARENT_VALUE}>— None —</SelectItem>
                      {parentMenus.map((m) => (
                        <SelectItem key={m.id} value={String(m.id)}>
                          {m.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="permission_name">Permission</Label>
                  <ComboboxPermission
                    value={data.permission_name || ''}
                    onChange={(val) => setData('permission_name', val)}
                    options={permissions}
                  />
                  {errors.permission_name && (
                    <p className="text-sm text-red-500">{errors.permission_name}</p>
                  )}
                </div>
              </div>

              <Separator />

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <Link href="/menus" className="w-full sm:w-auto">
                  <Button type="button" variant="secondary" className="w-full">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={processing} className="w-full sm:w-auto">
                  {processing ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">↻</span>
                      {isEdit ? 'Saving...' : 'Creating...'}
                    </span>
                  ) : isEdit ? (
                    'Save Changes'
                  ) : (
                    'Create Menu'
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
