import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

export default function Error403() {
  return (
    <>
      <Head title="403 - Akses Ditolak" />
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
        <h1 className="text-4xl font-bold text-red-500">403</h1>
        <p className="mt-2 text-muted-foreground">Kamu tidak punya izin untuk mengakses halaman ini.</p>
        <Link href="/dashboard">
          <Button className="mt-6">Kembali ke Dashboard</Button>
        </Link>
      </div>
    </>
  );
}
