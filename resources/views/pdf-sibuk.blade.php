{{--
    Ditampilkan saat tombol Unduh PDF ditekan sementara ada pencetakan lain
    yang sedang berjalan. Sengaja halaman polos tanpa aset Vite: yang sedang
    terjadi justru server sedang sibuk, jadi tidak pantas menambah muatan.
--}}
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Pencetakan PDF sedang sibuk</title>
    <style>
        :root { color-scheme: light dark; }
        body {
            margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center;
            font-family: ui-sans-serif, system-ui, "Segoe UI", sans-serif; background: #f8fafc; color: #0f172a;
        }
        .kotak { max-width: 30rem; padding: 2rem; text-align: center; }
        h1 { margin: 0 0 .75rem; font-size: 1.125rem; }
        p { margin: 0 0 1.5rem; line-height: 1.6; color: #475569; }
        a {
            display: inline-block; padding: .5rem 1rem; border-radius: .375rem;
            background: #0f172a; color: #f8fafc; text-decoration: none; font-size: .875rem;
        }
        @media (prefers-color-scheme: dark) {
            body { background: #0f172a; color: #f1f5f9; }
            p { color: #94a3b8; }
            a { background: #f1f5f9; color: #0f172a; }
        }
    </style>
</head>
<body>
    <div class="kotak">
        <h1>Sedang ada pencetakan PDF lain</h1>
        <p>
            Aplikasi mencetak satu berkas pada satu waktu supaya hasilnya tidak gagal di tengah jalan.
            Pencetakan biasanya selesai dalam beberapa detik — silakan kembali lalu tekan Unduh PDF sekali lagi.
        </p>
        <a href="javascript:history.back()">Kembali ke halaman cetak</a>
    </div>
</body>
</html>
