import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Save, EyeOff, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface Pertanyaan {
  id: number;
  pertanyaan: string;
  urutan: number;
  aktif: boolean;
}

interface Unsur {
  id: number;
  kode: string;
  nama: string;
  pertanyaan: Pertanyaan[];
}

interface PageProps {
  unsurs: Unsur[];
}

function PertanyaanRow({ p }: { p: Pertanyaan }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(p.pertanyaan);
  const [saving, setSaving] = useState(false);

  const save = () => {
    setSaving(true);
    router.put(
      `/cee/pertanyaan/${p.id}`,
      { pertanyaan: text, aktif: p.aktif },
      {
        preserveScroll: true,
        onSuccess: () => {
          toast.success('Pertanyaan berhasil diperbarui.');
          setEditing(false);
        },
        onError: () => toast.error('Gagal memperbarui pertanyaan.'),
        onFinish: () => setSaving(false),
      },
    );
  };

  const toggleAktif = () => {
    router.put(
      `/cee/pertanyaan/${p.id}`,
      { pertanyaan: p.pertanyaan, aktif: !p.aktif },
      {
        preserveScroll: true,
        onSuccess: () => toast.success(p.aktif ? 'Pertanyaan dinonaktifkan.' : 'Pertanyaan diaktifkan kembali.'),
      },
    );
  };

  return (
    <div className={`flex items-start gap-3 rounded-md border p-3 ${!p.aktif ? 'opacity-50' : ''}`}>
      <div className="min-w-0 flex-1 space-y-2">
        {editing ? (
          <Textarea rows={2} value={text} onChange={(e) => setText(e.target.value)} />
        ) : (
          <p className="text-sm">{p.pertanyaan}</p>
        )}
        {!p.aktif && <Badge variant="outline">Nonaktif</Badge>}
      </div>
      <div className="flex shrink-0 gap-1">
        {editing ? (
          <Button size="sm" onClick={save} disabled={saving}>
            <Save className="mr-1.5 h-4 w-4" />
            Simpan
          </Button>
        ) : (
          <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
            Edit
          </Button>
        )}
        <Button size="icon" variant="ghost" title={p.aktif ? 'Nonaktifkan' : 'Aktifkan'} onClick={toggleAktif}>
          {p.aktif ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}

function TambahPertanyaan({ unsurId, unsurNama }: { unsurId: number; unsurNama: string }) {
  const { data, setData, post, processing, reset } = useForm<{ cee_unsur_id: number; pertanyaan: string }>({
    cee_unsur_id: unsurId,
    pertanyaan: '',
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/cee/pertanyaan', {
      preserveScroll: true,
      onSuccess: () => {
        toast.success(`Pertanyaan baru ditambahkan ke unsur ${unsurNama}.`);
        reset('pertanyaan');
      },
      onError: () => toast.error('Gagal menambahkan pertanyaan.'),
    });
  };

  return (
    <form onSubmit={submit} className="flex items-start gap-2">
      <Textarea
        rows={2}
        value={data.pertanyaan}
        onChange={(e) => setData('pertanyaan', e.target.value)}
        placeholder="Tulis pertanyaan baru..."
        className="flex-1"
      />
      <Button type="submit" disabled={processing || !data.pertanyaan.trim()}>
        <Plus className="mr-1.5 h-4 w-4" />
        Tambah
      </Button>
    </form>
  );
}

export default function CeePertanyaanIndex({ unsurs }: PageProps) {
  return (
    <AppLayout>
      <Head title="Kelola Pertanyaan CEE" />
      <div className="space-y-4 p-4">
        <div>
          <h1 className="text-2xl font-semibold">Kelola Pertanyaan Kuesioner CEE</h1>
          <p className="text-sm text-muted-foreground">
            Redaksi pertanyaan kuesioner Form 1a — hanya Admin/Super Admin yang dapat mengubahnya. Pertanyaan
            yang dinonaktifkan tidak akan muncul lagi di form isian baru, tapi jawaban historis tetap tersimpan.
          </p>
        </div>

        {unsurs.map((unsur) => (
          <Card key={unsur.id}>
            <CardHeader>
              <CardTitle className="text-base">
                {unsur.kode}. {unsur.nama}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {unsur.pertanyaan.map((p) => (
                <PertanyaanRow key={p.id} p={p} />
              ))}
              <TambahPertanyaan unsurId={unsur.id} unsurNama={unsur.nama} />
            </CardContent>
          </Card>
        ))}
      </div>
    </AppLayout>
  );
}
