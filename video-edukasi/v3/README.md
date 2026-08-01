# Video Edukasi MR Kabar — v4 (video tunggal, ±30 menit)

> **Folder ini bernama `v3` tetapi isinya sudah v4.** Nama folder dan nama
> berkas keluaran (`MR_Kabar_Video_Edukasi_v3.mp4`) sengaja tidak diganti:
> `deploy.sh`, `mux_final.sh`, dan `remux_audio.sh` merujuknya sebagai teks
> tetap, dan berkas yang dipasang di `public/video/` toh bernama
> `video-edukasi-mr-kabar.mp4` tanpa nomor versi. Mengganti namanya hanya
> memindahkan tempat kekeliruan bisa terjadi.

## Yang berubah pada v4 (1 Agustus 2026)

Ditinjau ulang setelah seluruh butir A revisi aplikasi selesai. Hasil
peninjauan: **satu bagian video menjadi salah**, delapan bagian lain tidak
salah tetapi tidak lagi lengkap.

Yang salah, dan sudah direkam ulang: menit 13:15 versi lama menyebut Sangat
Tinggi, Tinggi, dan Moderat "ketiganya tidak bisa diterima". Itu benar ketika
ambangnya masih tertanam di dalam kode. Sesudah Selera Risiko menjadi data
yang ditetapkan Pemda sendiri, kalimat itu bertentangan dengan aplikasi.

Dua segmen baru: **s24 Tiga peran yang sering tertukar** (Penanggung Jawab
Pengelolaan Risiko ≠ Pemilik Risiko ≠ Penanggung Jawab Pengendalian) dan
**s25 Uji coba pengendalian** (langkah ke-4 dari enam langkah Perdep).

Sepuluh sisipan pada segmen yang sudah ada: Arahan & jadwal penilaian, lima
kriteria celah pengendalian, pertentangan dua sumber simpulan CEE, Form 14
sebagai laporan wajib keempat, RTP yang tidak boleh duplikatif, struktur
pengelola sebagai data, akun peninjau, dan panel jadwal pada Dashboard.

Ditambah beberapa selingan ringan supaya segmen padat tidak terasa
menjemukan, serta delapan efek masuk dan lima gerak diam baru di
`animation_template.html` (`swing`, `stamp`, `spinin`, `unfold`, `bounce`,
`diag`, `wipe`; `breathe`, `drift`, `wobble`, `tick`, `shake`).

Naskah: 128 → 159 kalimat. Scene: 23 → 25. Bab: 20 → 22. Durasi 23:37 → 30:00.

Skrip penambalnya disimpan agar jejak perubahannya terbaca: `revisi_v4.py`
(naskah), `koreografi_v4.py` dan `koreografi_v4b.py` (koreografi),
`koreografi_v4c.py` dan `koreografi_v4d.py` (perbaikan tata letak sesudah
`cek_tumpang.cjs` melaporkan 39 pasangan beririsan). Semuanya menolak berjalan
dua kali. Dua alat bantu baru: `_kotak.cjs` mencetak kotak-batas tiap item pada
detik tertentu, `_sambung.py` menyambung literal yang terpotong baris baru.

## Latar belakang v3

Versi ini **menggantikan** v1 dan v2 sepenuhnya. Keduanya sudah dihapus dari
`public/video/` dan pemilih "Video 1 / Video 2" di `/settingsapp` ikut dibuang.
Sumbernya pun **dihapus dari repositori pada 1 Agustus 2026** — menyimpan tiga
generasi berdampingan hanya mengundang orang membangun ulang dari naskah yang
salah. Riwayat git tetap menyimpannya bila suatu saat perlu ditengok.

Alasannya, v1 memuat dua kekeliruan mendasar yang tidak boleh dibiarkan bisa
dipilih:

1. menyebut alur **ISO 31000** (Komunikasi & Konsultasi → Penetapan Konteks →
   Penilaian Risiko → Perlakuan Risiko → Pemantauan & Reviu) sebagai "lima
   tahap Perdep";
2. menyatakan **Skala Risiko = dampak × kemungkinan**.

Bab III Perdep PPKD No.4/2019 sebenarnya menetapkan: Identifikasi Kelemahan
Lingkungan Pengendalian → Penilaian Risiko → Kegiatan Pengendalian →
Informasi & Komunikasi → Pemantauan. Dan `RiskMatrixCell` adalah tabel
peringkat 1–25 yang sengaja membobot dampak lebih besar (d5k1 = 20, d1k5 = 9),
bukan hasil perkalian. Keduanya sudah benar di v3, dan label yang menyesatkan
di aplikasi (Dashboard, bagian Existing Control, Panduan) ikut diperbaiki.

## Isi v3 dibanding v2

Ditambahkan: delapan unsur lingkungan pengendalian (disebut satu per satu),
kriteria Skala Dampak dari lima sisi, tiga jenis akun aplikasi, Penanggung
Jawab Pengendalian, cara memilih tingkat Existing Control, apa yang terjadi
setelah risiko benar-benar terjadi, alur & tenggat pelaporan Bab IV, tujuh
fitur pendukung (Excel, Tahun Aktif, Data Terhapus, Log Aktivitas, Data Risiko
Gabungan, Program Bupati, Keterangan Pendukung), **satu contoh risiko yang
ditelusuri utuh** dari Kegiatan → IRO → analisis → RTP → Form 9 → Dashboard,
**11 tangkapan layar aplikasi sungguhan**, ringkasan tiap tahap, dasar hukum
permanen di layar, dan layar penutup keresmian.

## Urutan build

```bash
python generate_audio.py         # 128 baris narasi -> audio/line_XXX.mp3
python build_timeline.py         # timeline.json + subtitle.srt + narration_full.mp3
python generate_audio_assets.py  # music_bg.wav + sfx/ (20 efek)
python build_sfx_bus.py          # sfx_bus.wav (232 cue)
python mix_audio.py              # stem-*.mp3 + audio_final.mp3
python build_deliverables.py     # chapters.json + subtitle.vtt + transkrip.txt
python build_animation.py        # animation.html
node   cek_tumpang.cjs 0.3 0.04  # WAJIB: harus melaporkan 0 tumpang tindih
node   render_video.cjs          # video_noaudio.mp4  (~50 menit)
bash   mux_final.sh              # 1080p + 720p + klip per tahap
bash   deploy.sh                 # pasang semuanya ke public/video/
```

Kalau yang berubah **hanya audio** (musik/narasi/SFX) dan gambarnya tidak
disentuh, lewati render dan mux penuh:

```bash
python generate_audio_assets.py --musik-saja   # music_bg.wav saja, SFX tak diubah
python mix_audio.py
bash   remux_audio.sh            # tukar trek audio, video disalin apa adanya
bash   deploy.sh
```

Bedanya nyata: `mux_final.sh` meng-encode ulang 1080p dan 720p dari nol
(puluhan menit) padahal gambarnya akan sama persis; `remux_audio.sh` menyalin
video apa adanya sehingga selesai dalam ~1 menit tanpa penurunan mutu.

`node smoke.cjs 30 420 700` memotret frame pada detik tertentu — untuk
memeriksa tata letak sebelum render penuh.

## Yang perlu diketahui sebelum mengubah

- **Jalankan `cek_tumpang.cjs` sebelum render.** Satu salah setel waktu keluar
  (`out`) langsung membuat dua kotak teks saling menimpa, dan itu baru
  ketahuan setelah 50 menit render terbuang. Skrip ini menyusuri seluruh
  durasi, mengambil kotak-batas tiap item yang terlihat, dan melaporkan
  pasangan yang beririsan. Ambang yang dipakai: `0.3 0.04`.
- **Waktu tidak pernah ditulis tangan.** `timeline.json` dihitung dari durasi
  audio sungguhan; `build_animation.py` menurunkan batas scene dan offset tiap
  kalimat darinya. Koreografi di `scenes.js` memakai `L(idKalimat, offset)`,
  jadi kalau naskah berubah semuanya bergeser sendiri.
- **Pelafalan kata asing.** edge-tts meng-escape seluruh input jadi XML,
  sehingga tag SSML `<phoneme>` mustahil dipakai. Karena itu `lines.json` punya
  dua field: `text` (respelling fonetik untuk TTS) dan `display` (ejaan benar
  untuk subtitle & transkrip).
- **Musik lebih keras tanpa menutupi narasi** dicapai lewat sidechain ducking
  di `mix_audio.py`, bukan dengan memelankan musik sepanjang video. Terukur:
  narasi −18,9 LUFS, musik −29,2 LUFS, mix akhir −16,3 LUFS.
- **Animasi harus fungsi murni dari `t`.** Renderer memanggil
  `window.setVideoTime(t)` per frame lalu memotret. Jangan memakai
  transition/animation CSS.
- **Jangan menganimasikan `#bg`.** Men-scale/rotate lapisan 1920×1080 berisi
  tiga radial-gradient memaksa raster ulang penuh tiap frame dan membuat render
  melar dari ~50 menit jadi ~7 jam.
- **Satu `card` setinggi 250–290 piksel, bukan ~150.** Diukur pada v4 lewat
  `_kotak.cjs`, yang mencetak kotak-batas tiap item pada detik tertentu.
  Menaruh dua baris kartu berjarak 150 piksel dijamin bertumpuk. Kalau
  `cek_tumpang.cjs` mengeluh, pakai `_kotak.cjs` untuk melihat angkanya
  daripada menebak.
- **Efek masuk yang MEMBESAR dulu menutupi tetangganya.** `stamp` berangkat
  dari skala 2,3 dan `zoom` dari 1,7; sesaat keduanya jauh lebih besar
  daripada ukuran akhirnya. Pakai hanya di tempat yang sekelilingnya lapang;
  di baris yang rapat pakai `pop` atau `rise`. Hal yang sama berlaku untuk
  `rise` pada item besar: ia berangkat 120 piksel lebih rendah, jadi sempat
  melintasi apa pun yang ada di bawahnya.
- **Lupa memberi `out` adalah kesalahan tersering.** Kalimat berikutnya
  memasang isi baru, tetapi isi lama tidak pernah diperintahkan pergi. Pada
  v4 inilah penyebab 30 dari 39 tumpang tindih yang pertama kali dilaporkan.
- **Kalau menambal lewat skrip Python, tulis `\\n` bukan `\n`.** Di dalam
  string Python biasa, `\n` berubah jadi baris baru sungguhan sehingga
  literal JavaScript-nya terpotong dan seluruh `animation.html` gagal
  dimuat — gejalanya cuma `window.setVideoTime is not a function`, yang
  sama sekali tidak menunjuk ke penyebabnya. `_sambung.py` menyatukan
  kembali baris yang sudah terlanjur terpotong.
- **Tangkapan layar** di `shots/` diambil ulang lewat skrip dengan akun
  sementara yang langsung dihapus. Keduanya (`shots/`, `img/`) di-gitignore
  karena bisa diambil ulang dan totalnya belasan MB.

## Berkas hasil & tujuannya

| Berkas | Dipasang ke | Untuk |
|---|---|---|
| `MR_Kabar_Video_Edukasi_v3.mp4` | `public/video/video-edukasi-mr-kabar.mp4` | Pemutar di aplikasi — **tanpa** subtitle terbakar |
| `MR_Kabar_Video_Edukasi_v3_720p.mp4` | `public/video/video-edukasi-mr-kabar-720p.mp4` | Unduhan luring — subtitle **terbakar**, keyframe rapat |
| `klip/tahap-*.mp4` | `public/video/klip/` | Potongan per tahap Perdep |
| `stem-narration/music/sfx.mp3` | `public/video/edu-*.mp3` | Tiga jalur audio terpisah |
| `subtitle.vtt` | `public/video/edu-subtitle.vtt` | Subtitle yang bisa dimatikan & diatur ukurannya |
| `transkrip.txt` | `public/video/edu-transkrip.txt` | Naskah bertimestamp untuk dibaca/dicetak |
| `chapters.json` | `resources/js/data/edu-video-chapters.json` | 20 bab + sasaran penonton per bab |

Video di aplikasi diputar **mute**, dan ketiga stem itulah yang dibunyikan
berdampingan — itulah yang membuat slider volume dan setelan subtitle di
`/settingsapp` berpengaruh langsung tanpa render ulang. Level dasar tiap stem
di `resources/js/components/edu-video-player.tsx` sengaja sama dengan gain di
`mix_audio.py`, supaya pemutar aplikasi terdengar identik dengan berkas MP4
yang diunduh.
