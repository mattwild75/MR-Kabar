import { Head, Link } from '@inertiajs/react';

export default function Welcome() {
  return (
    <>
      <Head title="Masuk" />
      <div className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-lg">
          <h1 className="text-2xl font-semibold tracking-tight">Selamat datang</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Aplikasi ini telah disesuaikan untuk langsung menuju halaman masuk.
          </p>
          <Link
            href={route('login')}
            className="mt-8 inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-3 font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            Masuk ke akun
          </Link>
        </div>
      </div>
    </>
  );
}
