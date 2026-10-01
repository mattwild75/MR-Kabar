# Video Tutorial MR Kabar v2 — dari awal sampai laporan

Menggantikan tutorial v1 (folder induk, 79:35, 17 bab) **seluruhnya**: naskah,
suara, rekaman, musik, dan efek suara dibuat ulang. Berkas yang dipasang di
`public/video/` tetap bernama sama (`tutorial-mr-kabar*.mp4`,
`tutorial-{narration,music,sfx}.mp3`, `tutorial-subtitle.vtt`,
`tutorial-transkrip.txt`), daftar bab di
`resources/js/data/tutorial-video-chapters.json`.

## Yang berubah dari v1, dan kenapa

Permintaan pemilik: "sempurna, menarik, dan tidak bosan". Penyebab bosan di v1
ada tiga, dan masing-masing dijawab:

| v1 | v2 |
|---|---|
| 79 menit; 8.104 kata narasi, banyak pengulangan dan penjelasan konsep yang sudah ada di video edukasi | ±3.450 kata; dua suara **bercakap** (Ardi memandu, Gadis sebagai PIC baru yang bertanya dan mengingatkan jebakan), kalimat pendek |
| layar aplikasi polos 1920 px: teks terlalu kecil di pemutar, belasan detik sunyi saat mengetik isian panjang | aplikasi ditata 1280×720 lalu digambar 1,5× (tajam, terbaca); bagian yang aksinya melampaui narasi **dipercepat 2–6×** dengan lencana "DIPERCEPAT" |
| hanya papan judul bab | kartu bab sinematik dengan **peta rute** 13 titik yang maju per bab (dunia laut video edukasi v6, langit berganti dari fajar ke badai ke malam), catatan akhir bab dengan poin yang muncul tepat saat diucapkan, catatan berpanah di kolom yang sering keliru, kartu aturan, tanda "Tersimpan", cip bab di atas layar |
| musik satu pola, tanpa efek suara | musik orisinal yang berganti suasana per bab + aksen di tiap kartu; efek suara klik, ketikan, gulir, zoom, dan simpan, ditempatkan tepat pada milidetik peristiwa rekaman |

Yang **diperagakan** juga bertambah: Formulir 8-9 benar-benar diisi, laporan
kejadian benar-benar dicatat ke Formulir 10, risiko yang belum terdaftar dibuat
dari tombol "Input ke Register Risiko" di rekap laporan, dan penutup memuat
tiga penolong (Data Risiko gabungan, Ctrl+K, Data Terhapus).

## Susunan video

`naskah.json → urutan`: **buka** → untuk tiap bab: **kartu-N** → **rekam-N** →
**catatan-N** (bab 1, 11, dan 13 tanpa catatan) → **tutup**. Adegan buka,
kartu, catatan, dan tutup adalah animasi (`selingan/`); rekam-N adalah rekaman
aplikasi sungguhan.

## Cara kerjanya

- **Narasi dulu, gambar belakangan** (sama dengan v1). `suara.py` memangkas
  hening edge-tts dan menyimpan waktu tiap kata; pengendali menahan tiap
  langkah sampai narasinya habis.
- **`pada: [k, 'kata']`** pada aksi mana pun: aksi menunggu kata itu diucapkan
  di kalimat ke-k langkah tersebut (ejaan mesin suara, mis. `pi-ai-si`).
  Aksi hiasan (`latar: true` — catatan, kartu, papan judul) dijadwalkan tanpa
  menahan aksi berikutnya.
- **Zoom 1,5 lewat CSS, bukan deviceScaleFactor.** Perekam layar Chromium
  memotret ukuran jendela dalam DIP dan mengabaikan deviceScaleFactor maupun
  `scale` emulasi — keduanya menghasilkan 1280×720. Jadi jendela dibuat
  1920×1080 dan `<body>` diberi `zoom: 1.5`. Akibatnya (ditangani di
  `lapisan.js`): satuan vh/vw di stylesheet dibagi 1,5 lewat CSSOM; posisi
  menu melayang Radix (floating-ui menulis `translate()` dalam piksel jendela
  ke dalam body terzoom, sehingga daftar jatuh di luar layar) dibagi Z lewat
  MutationObserver; dan setiap koordinat kotak-batas/tetikus dibagi Z sebelum
  dipakai lapisan.
- **Catatan berpanah dan cincin sorot mengikuti sasarannya** tiap bingkai.
  Rekaman pertama menaruhnya sekali di posisi awal, dan 8 dari 20 catatan
  tertinggal menunjuk tempat kosong begitu halaman atau dialog bergulir.
- **window.open diarahkan ke tab yang sama** di peramban perekam, karena
  "Catat ke Form 10" dan "Input ke Register Risiko" membuka tab baru yang tidak
  ikut terekam.
- **Percepatan** (`rakit.py`): untuk tiap langkah, bagian dari 0,45 dtk sesudah
  narasinya habis sampai langkah berakhir, kalau lebih dari 2,5 dtk, diputar
  2–6× lebih cepat. Narasi tidak pernah jatuh di dalamnya; ketukan papan ketik
  di bagian itu dijarangkan sebanding.

## Urutan membangun

    python naskah.py                     -> naskah.json, selingan.json
    python suara.py                      -> audio/*.mp3, *.kata.json, waktu.json
    cd selingan
      python build_timeline.py           -> timeline.json, narasi.wav
      python build_animation.py          -> animation.html (mesin v6 lewat <base href>)
      node smoke.cjs 10 60 ...           -> smoke/ (periksa bingkai)
      node render.cjs                    -> selingan.mp4 (±30 mnt)
      node ekspor_isyarat.cjs            -> isyarat.json
    cd ..
    php ../akun.php pasang PIC_INSPEKTORAT
    php ../akun.php pasang mrkabarvip
    node pengendali.cjs --bab 5 --cepat --potret   (uji tanpa merekam/menunggu)
    bash rekam.sh                        -> rekam/bab-N.webm, waktu-N.json, peristiwa-N.json
    python rakit.py                      -> keluaran/gambar.mp4, narasi.wav, isyarat.json,
                                            subtitle.srt/.vtt, bab.json, transkrip.txt
    python musik.py                      -> keluaran/musik.wav
    python sfx.py                        -> keluaran/sfx.wav
    bash campur.sh                       -> tutorial-mr-kabar.mp4 (+720p), stem-*.mp3
    bash pasang.sh                       -> public/video/*, chapters json, npm run build
    php ../bersihkan.php hapus           -> WAJIB: buang seluruh data contoh 2026
    php ../akun.php pulihkan             -> WAJIB: kembalikan sandi asli

`rekam.sh` membersihkan dan menandai data lebih dulu kalau mulai dari bab 1.
Urutan bab wajib dari depan: bab 8 mencari risiko yang dibuat bab 6, bab 9
menelaah laporan dari bab 8.

## Jebakan yang sudah ditemui

- Breadcrumb halaman Lapor bertulisan "Lapor", sama dengan tombol kirimnya;
  klik teks "Lapor" mendarat di breadcrumb dan laporannya tidak pernah
  terkirim. Tombol kirim dituju lewat `button[type="submit"]`.
- Daftar OPD Radix diletakkan tepat di atas pemicunya; kursor yang diam di
  sana menyorot butir lain begitu ketik-cari menggulir daftar. Kursor
  dikeluarkan dari daftar sebelum mengetik.
- Header punya kotak pilihan "Bahasa" (juga combobox): penyaring OPD di Dasbor
  dituju lewat teks pemicunya, bukan `button[role=combobox]` pertama.
- Kotak pilihan Radix tidak punya placeholder `<input>`; pakai `pemicu` (teks)
  atau `kolomLabel` (label di atasnya — pencarinya mengenali
  `button[role=combobox]`).
- Teks RTP CEE dan RTP risiko yang mirip memunculkan peringatan "Mirip dengan
  1 RTP lain" di Formulir 8-9 — persis kekeliruan yang diingatkan narasi.
- Satu kalimat yang disisipkan menggeser id semua kalimat sesudahnya;
  `suara.py` memakai ulang berkas suara menurut ISI teksnya, jadi hanya kalimat
  yang benar-benar baru yang disuarakan.
- Rekaman webm Puppeteer tidak menulis durasi; `rakit.py` menghitungnya dari
  jumlah paket (30 bingkai/detik tetap).
