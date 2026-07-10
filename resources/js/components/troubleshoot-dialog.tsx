import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Wrench } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

const CATEGORY_LABELS: Record<string, string> = {
  bug: 'Bug',
  error: 'Error',
  saran: 'Saran',
  lainnya: 'Lainnya',
};

// Tombol "Troubleshoot" di footer membuka form ini. Terbuka untuk semua user
// yang sudah login; laporan masuk ke rekapan yang hanya dilihat admin/super-
// admin (menu Utilities => Troubleshoot).
export function TroubleshootDialog() {
  const [open, setOpen] = useState(false);
  const { data, setData, post, processing, errors, reset } = useForm({
    subject: '',
    category: 'bug',
    description: '',
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('troubleshoot.store'), {
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Laporan troubleshoot berhasil dikirim. Terima kasih.');
        reset();
        setOpen(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-1.5 font-medium hover:text-foreground"
        >
          <Wrench className="h-4 w-4" />
          Troubleshoot
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>Laporkan Kendala</DialogTitle>
            <DialogDescription>
              Sampaikan bug, error, atau saran. Laporan Anda akan ditinjau oleh admin.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="ts-subject" className="mb-2 block">Subjek</Label>
              <Input
                id="ts-subject"
                placeholder="Ringkasan singkat masalah"
                value={data.subject}
                onChange={(e) => setData('subject', e.target.value)}
                className={errors.subject ? 'border-red-500' : ''}
              />
              {errors.subject && <p className="mt-1 text-sm text-red-500">{errors.subject}</p>}
            </div>

            <div>
              <Label htmlFor="ts-category" className="mb-2 block">Kategori</Label>
              <Select value={data.category} onValueChange={(v) => setData('category', v)}>
                <SelectTrigger id="ts-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
            </div>

            <div>
              <Label htmlFor="ts-description" className="mb-2 block">Deskripsi</Label>
              <Textarea
                id="ts-description"
                rows={5}
                placeholder="Jelaskan masalah, langkah untuk memunculkannya, dan apa yang Anda harapkan."
                value={data.description}
                onChange={(e) => setData('description', e.target.value)}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={processing}>
              {processing ? 'Mengirim...' : 'Kirim Laporan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
