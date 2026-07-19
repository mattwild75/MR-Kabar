import React from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Save, ArrowLeft } from 'lucide-react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { BreadcrumbItem } from '@/types';

interface PermissionFormProps {
  permission?: {
    id: number;
    name: string;
    group: string | null;
  };
  groups?: string[];
}

export default function PermissionForm({ permission, groups = [] }: PermissionFormProps) {
  const isEdit = !!permission;

  const { data, setData, processing, errors } = useForm({
    name: permission?.name || '',
    group: permission?.group || '',
    newGroup: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name: data.name,
      group: data.newGroup.trim() !== '' ? data.newGroup.trim() : data.group,
    };

    if (isEdit) {
      router.put(`/permissions/${permission?.id}`, payload);
    } else {
      router.post('/permissions', payload);
    }
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Permission Management', href: '/permissions' },
    { title: isEdit ? 'Edit Permission' : 'Add Permission', href: '#' },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={isEdit ? 'Edit Permission' : 'Add Permission'} />

      <div className="flex-1 p-4 md:p-6 max-w-xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              {isEdit ? 'Edit Permission' : 'Add Permission'}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {isEdit ? 'Edit permission details' : 'Create a new permission'}
            </p>
          </CardHeader>

          <Separator />

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Permission Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Permission Name</Label>
                <Input
                  id="name"
                  placeholder="example: manage-users"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>

              {/* Select Group */}
              <div className="space-y-2">
                <Label htmlFor="group">Select Group</Label>
                <Select value={data.group || ''} onValueChange={(val) => setData('group', val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select group..." />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.map((group) => (
                      <SelectItem key={group} value={group}>
                        {group}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.group && <p className="text-sm text-red-500">{errors.group}</p>}
              </div>

              {/* New Group */}
              <div className="space-y-2">
                <Label htmlFor="newGroup">Or type a new group</Label>
                <Input
                  id="newGroup"
                  placeholder="example: Tender / Article / User"
                  value={data.newGroup}
                  onChange={(e) => setData('newGroup', e.target.value)}
                />
              </div>

              <Separator />

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <Link href="/permissions">
                  <Button type="button" variant="secondary">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                </Link>
                <Button type="submit" disabled={processing} >
                  <Save className="mr-2 h-4 w-4" />
                  {processing
                    ? isEdit
                      ? 'Saving...'
                      : 'Adding...'
                    : isEdit
                    ? 'Save Changes'
                    : 'Add'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
