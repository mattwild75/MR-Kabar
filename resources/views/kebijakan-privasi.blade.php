<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Kebijakan Privasi - MR KABAR</title>
    <style>
        :root { --teks: #1f2933; --redup: #52606d; --garis: #d9e2ec; --latar: #f7f9fb; --aksen: #0b5394; }
        @media (prefers-color-scheme: dark) {
            :root { --teks: #e4e7eb; --redup: #9aa5b1; --garis: #323f4b; --latar: #111827; --aksen: #7fb3e6; }
        }
        body { margin: 0; background: var(--latar); color: var(--teks); font: 16px/1.65 system-ui, -apple-system, "Segoe UI", sans-serif; }
        main { max-width: 46rem; margin: 0 auto; padding: 2.5rem 1rem 4rem; }
        h1 { font-size: 1.6rem; margin: 0 0 .25rem; }
        h2 { font-size: 1.1rem; margin: 2rem 0 .5rem; }
        p, li { color: var(--teks); }
        .meta { color: var(--redup); font-size: .9rem; margin-bottom: 2rem; }
        ul { padding-left: 1.25rem; }
        a { color: var(--aksen); }
        footer { margin-top: 3rem; padding-top: 1rem; border-top: 1px solid var(--garis); color: var(--redup); font-size: .9rem; }
    </style>
</head>
<body>
<main>
    <h1>Kebijakan Privasi MR KABAR</h1>
    <p class="meta">Aplikasi Manajemen Risiko Kabupaten Aceh Barat &middot; Inspektorat Kabupaten Aceh Barat &middot; berlaku sejak 13 November 2026</p>

    <p>MR KABAR adalah aplikasi internal Pemerintah Kabupaten Aceh Barat untuk mengelola penilaian risiko perangkat daerah. Halaman ini menjelaskan data apa yang diolah aplikasi dan bagaimana akses ke akun Google digunakan.</p>

    <h2>Data yang diolah</h2>
    <ul>
        <li>Akun pengguna (nama, nama pengguna, surel, peran) yang dibuat oleh admin Inspektorat untuk pegawai perangkat daerah.</li>
        <li>Data penilaian risiko, pengendalian, dan pemantauan yang diisi perangkat daerah.</li>
        <li>Laporan kejadian risiko dan dugaan kecurangan yang dikirim lewat formulir Lapor; pelapor dapat memilih untuk tidak menyebutkan identitas.</li>
        <li>Catatan aktivitas (log audit) untuk keperluan pengawasan dan keamanan.</li>
    </ul>

    <h2>Penggunaan akses Google Drive</h2>
    <p>MR KABAR dapat ditautkan ke satu akun Google milik instansi untuk menyimpan salinan cadangan basis data di luar server. Akses yang diminta hanya cakupan <code>drive.file</code>, yaitu berkas yang dibuat oleh MR KABAR sendiri. Aplikasi tidak membaca, mengubah, atau menghapus berkas lain di Google Drive.</p>
    <ul>
        <li>Berkas cadangan dikunci dengan enkripsi AES-256 sebelum dikirim.</li>
        <li>Data dari akun Google tidak dibagikan, dijual, atau dipakai untuk tujuan lain, dan tidak dipakai untuk melatih model kecerdasan buatan.</li>
        <li>Token akses disimpan terenkripsi di server dan dapat dicabut kapan saja oleh admin aplikasi atau oleh pemilik akun melalui <a href="https://myaccount.google.com/permissions">myaccount.google.com/permissions</a>.</li>
    </ul>

    <h2>Penyimpanan dan keamanan</h2>
    <p>Data disimpan di server Pemerintah Kabupaten Aceh Barat. Akses dibatasi menurut peran, dan akun berhak tinggi dilindungi autentikasi dua faktor. Cadangan dibuat setiap hari dan disimpan dalam keadaan terenkripsi.</p>

    <h2>Kontak</h2>
    <p>Pertanyaan tentang kebijakan ini dapat disampaikan ke Inspektorat Kabupaten Aceh Barat, Jalan Imam Bonjol Km 4,5 Meulaboh, surel <a href="mailto:inspektoratkab.acehbarat@gmail.com">inspektoratkab.acehbarat@gmail.com</a>.</p>

    <footer><a href="{{ url('/') }}">Kembali ke MR KABAR</a></footer>
</main>
</body>
</html>
