# Video Edukasi MR Kabar — v6 "Berlayar dengan Peta Risiko" (±15 menit)

Menggantikan v5 (folder `../v3`, 30:44) **seluruhnya**: naskah, gaya visual,
narasi, musik, dan efek suara dibuat ulang dari nol. Berkas yang dipasang di
`public/video/` tetap bernama sama (`video-edukasi-mr-kabar*.mp4`, `edu-*.mp3`,
`edu-subtitle.vtt`, `edu-transkrip.txt`), daftar bab di
`resources/js/data/edu-video-chapters.json`.

## Konsep

Gaya sinematik ilustratif, terinspirasi video "Kilas Balik Pancasila"
milik pemilik aplikasi: dibuka dengan pertanyaan, bertutur seperti
dokumenter, ditutup dengan "Pelajaran 01–03".

Metafora tunggal sepanjang video — **pelayaran di laut pantai barat Aceh**:
program pemerintah = kapal, sasaran RPJMD = pelabuhan tujuan, risiko = angin,
arus, dan karang, lima tahap Perdep = lima pelampung, Inspektorat = mercusuar
(lini ketiga), Dashboard = anjungan kapal.

- **Dunia ilustrasi** digambar di canvas (`engine.js`): langit malam/badai/
  senja/fajar, bintang, bulan, awan, ombak berlapis, siluet kota pesisir
  dengan kubah masjid, mercusuar bersorot berputar, perahu motor khas Aceh,
  pelampung berkedip, hujan, petir, kebocoran lambung.
- **15 foto berlisensi terbuka** dari Wikimedia Commons (Meulaboh, nelayan
  Aceh, mercusuar Pulau Breueh, peta lama Aceh & pantai barat Sumatra, dll.)
  diwarnai seragam lewat `grade_foto.py`; kreditnya di akhir video dan di
  transkrip.
- **Tangkapan layar aplikasi** (data penilaian 2025) dalam bingkai laptop
  dengan gerak kamera, sorotan, dan kursor.
- **Tipografi kinetik** yang muncul tepat saat katanya diucapkan — waktu tiap
  kata diambil dari edge-tts (WordBoundary), dirujuk koreografi lewat
  `W(idKalimat, 'kata')`.

## Fakta yang dipertahankan dari v5 (sudah diverifikasi)

37 pertanyaan Form 1a, delapan unsur CEE, D5×K1 = 20, D1×K5 = 9, contoh
D4×K3 = 17 (Tinggi) → target 13 (Sedang) → aktual 14, Selera Risiko sampai
dengan Sedang, empat belas dokumen resmi + bagan, Form 14 tersedia, lima tahap
Bab III Perdep (bukan alur ISO 31000), matriks bukan perkalian. Nilai matriks
dan warna level di `engine.js` (MATRIKS, LEVEL) disalin dari
`risk_matrix_cells` dan `risk_levels`.

## Urutan membangun

    python ambil_huruf.py            -> fonts/ (SIL OFL)
    python foto/ambil_foto.py        -> foto/*.jpg + foto/kredit.json
    python grade_foto.py             -> foto/g_*.jpg
    php akun_shot.php buat           -> akun sementara (2FA) untuk memotret
    node ambil_shots.cjs <u> <p> <k> -> shots/*.png
    php akun_shot.php hapus          -> WAJIB: hapus akun sementara
    python naskah.py                 -> lines.json, chapters_naskah.json
    python generate_audio.py         -> audio/line_NNN.mp3 + .words.json
    python build_timeline.py         -> timeline.json, subtitle.srt, narration_full.wav
    python build_animation.py        -> animation.html
    node smoke.cjs kontak 6          -> smoke/ (periksa frame) ; python kontak.py 4 480
    node ekspor_isyarat.cjs          -> isyarat.json (isyarat bunyi + suasana dunia)
    python musik.py                  -> music_bg.wav (skor orisinal, FluidSynth)
    python build_sfx.py              -> sfx_bus.wav (semua bunyi disintesis)
    python mix_audio.py              -> audio_final.mp3 + stem-*.mp3
    node render_video.cjs            -> video_noaudio.mp4 (±60 menit)
    python build_deliverables.py     -> subtitle.vtt, transkrip.txt, chapters.json
    bash mux_final.sh                -> MR_Kabar_Video_Edukasi_v6(.mp4|_720p.mp4)
    bash pasang.sh                   -> public/video/* + edu-video-chapters.json
                                        (kedua MP4 dikemas LENGKAP oleh scripts/video/kemas_mp4.py:
                                        suara menyatu, subtitle tertanam, bab, metadata, sampul)

Kalau naskah berubah: ulangi dari `naskah.py`. Semua tampilan, musik, dan SFX
mengikuti timeline sendiri — tidak ada detik yang ditulis tangan.

Ingat memperbarui menit-detik `bab` di `resources/js/components/edu-video-quiz.tsx`.
