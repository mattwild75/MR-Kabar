# Video Edukasi MR Kabar — Versi 2 (lengkap, ±17 menit)

Versi 1 (folder induk) adalah pengenalan ringkas ±6,5 menit dan tetap
dipertahankan; keduanya bisa dipilih dari `/settingsapp`.

Versi 2 menutup materi yang belum ada di versi 1 **dan memperbaiki dua
kekeliruan isinya**:

1. **Lima tahap Perdep.** Versi 1 menyebut alur ISO 31000 (Komunikasi &
   Konsultasi → Penetapan Konteks → Penilaian Risiko → Perlakuan Risiko →
   Pemantauan & Reviu) sebagai "lima tahap Perdep". Bab III Perdep PPKD
   No.4/2019 sebenarnya menetapkan: Identifikasi Kelemahan Lingkungan
   Pengendalian → Penilaian Risiko → Kegiatan Pengendalian → Informasi &
   Komunikasi → Pemantauan. Versi 2 memakai daftar yang benar, sama dengan
   menu Panduan di dalam aplikasi.
2. **Skala Risiko bukan perkalian.** Versi 1 menyebut Skala Risiko = dampak ×
   kemungkinan. `RiskMatrixCell` sebenarnya tabel peringkat 1–25 yang
   memberi bobot lebih besar pada dampak (d5k1 = 20, d1k5 = 9). Angka
   matriks di scene s14 disalin persis dari database.

Materi yang sebelumnya tidak ada sama sekali: CEE/lingkungan pengendalian,
struktur peran (Kepala Daerah / Sekda / Bappeda / Unit Kepatuhan /
Inspektorat + Three Lines of Defense), siklus waktu RPJMD–Renstra–Renja/RKA,
cara menulis pernyataan risiko (risiko vs penyebab vs dampak), Controllable /
Uncontrollable, kriteria baku dampak & kemungkinan, kode risiko, batas
acceptable/unacceptable, siklus 4 skor (Inheren → Residual → Target →
Aktual), Lapor Kejadian via QR, dan Form 11/12/13.

## Urutan build

```bash
python generate_audio.py         # 98 baris narasi -> audio/line_XXX.mp3
python build_timeline.py         # timeline.json + subtitle.srt + narration_full.mp3
python generate_audio_assets.py  # music_bg.wav + sfx/ (20 efek)
python build_sfx_bus.py          # sfx_bus.wav (152 cue)
python mix_audio.py              # stem-*.mp3 + audio_final.mp3
python build_animation.py        # animation.html (dari template + symbols + scenes)
node   render_video.cjs          # video_noaudio.mp4  (~40 menit)
bash   mux_final.sh              # MR_Kabar_Video_Edukasi_v2.mp4
```

`node smoke.cjs 30 420 700` memotret frame pada detik tertentu — pakai ini
untuk memeriksa tata letak sebelum menjalankan render penuh.

## Yang perlu diketahui sebelum mengubah

- **Waktu tidak pernah ditulis tangan.** `timeline.json` dihitung dari durasi
  audio sungguhan; `build_animation.py` menurunkan darinya batas tiap scene
  (`SCENEMAP`) dan offset tiap kalimat (`LINEOFF`). Koreografi di `scenes.js`
  memakai `L(idKalimat, offset)`, jadi kalau naskah berubah semuanya bergeser
  sendiri. Jangan mengembalikannya ke detik absolut.
- **Pelafalan kata asing.** edge-tts meng-escape seluruh input jadi XML
  (`communicate.py` → `escape(remove_incompatible_characters(text))`),
  sehingga tag SSML `<phoneme>` mustahil dipakai. Karena itu `lines.json`
  punya dua field: `text` (respelling fonetik untuk TTS) dan `display` (ejaan
  benar untuk subtitle).
- **Musik lebih keras tanpa menutupi narasi** dicapai lewat sidechain ducking
  di `mix_audio.py`, bukan dengan memelankan musik sepanjang video. Musik
  penuh di sela kalimat, turun ~10 dB saat ada suara. Hasil ukur: narasi
  −18,8 LUFS, musik −28,9 LUFS.
- **Animasi harus fungsi murni dari `t`.** Renderer memanggil
  `window.setVideoTime(t)` per frame lalu memotret. Jangan memakai
  transition/animation CSS — apa pun yang bergantung wall-clock akan
  menghasilkan video tersendat.
- **Jangan menganimasikan `#bg`.** Men-scale/rotate satu lapisan 1920×1080
  berisi tiga radial-gradient memaksa raster ulang penuh tiap frame dan
  membuat render melar dari ~40 menit jadi ~7 jam.
- **Zona `y > 930` dikosongkan** untuk subtitle burn-in. FontSize libass
  bersifat resolution-independent (relatif PlayResY internal), jadi angka 9
  di `mux_final.sh` jangan dinaikkan saat ganti resolusi.

## Berkas hasil yang dipakai aplikasi

| Berkas | Tujuan |
|---|---|
| `MR_Kabar_Video_Edukasi_v2.mp4` | `public/video/video-edukasi-mr-kabar-v2.mp4` |
| `stem-narration.mp3` | `public/video/edu-v2-narration.mp3` |
| `stem-music.mp3` | `public/video/edu-v2-music.mp3` |
| `stem-sfx.mp3` | `public/video/edu-v2-sfx.mp3` |

Video di halaman login diputar dalam keadaan **mute**, dan ketiga stem itulah
yang dibunyikan berdampingan — itulah yang membuat slider volume narasi /
musik / SFX di `/settingsapp` berpengaruh langsung tanpa render ulang. Level
dasar tiap stem di `resources/js/components/edu-video-player.tsx` sengaja sama
dengan gain di `mix_audio.py`, supaya pemutar aplikasi terdengar identik
dengan berkas MP4 yang diunduh.
