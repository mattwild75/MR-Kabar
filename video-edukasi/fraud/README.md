# Video Edukasi Lapor Dugaan Kecurangan (±9 menit)

Video pendamping tautan "Tonton video edukasi" di samping judul **Lapor
Dugaan Kecurangan** pada halaman Lapor (/lapor-kejadian), diputar di
/lapor-kejadian/video-kecurangan. Penontonnya masyarakat umum yang baru
memindai kode QR Lapor — karena itu isinya **hanya edukasi**: apa itu
kecurangan, tujuh bentuknya menurut UU No. 31/1999 jo. UU No. 20/2001,
tanda-tandanya, dasar hukum (Perbup Aceh Barat No. 6/2025), cara melapor,
perlindungan pelapor, dan apa yang terjadi setelah laporan terkirim. Tidak
ada tampilan kertas kerja MR Fraud.

Jalur produksinya sama dengan video edukasi utama (`../v3`), yang berbeda:

- **Naskah** ditulis di `naskah.py` (56 kalimat, 10 scene), `text` untuk TTS
  diturunkan dari ejaan benar lewat tabel `RESPELL`.
- **Musik** dari REKAMAN instrumen (`musik.py` + `midi.py`): nada ditulis
  sebagai MIDI lalu dibunyikan FluidSynth memakai soundfont MuseScore General
  (piano, dawai, gitar nilon, bas, vibrafon, selo) — cara yang sama dengan
  musik video tutorial, tetapi aransemennya mengikuti scene: D mayor yang
  tenang di pembuka, berpindah ke B minor pada bagian tujuh bentuk dan
  tanda-tanda, kembali mayor sejak dasar hukum, mereda di penutup. Panjang
  dan pergantian suasananya dibaca dari `timeline.json`, bukan ditulis
  tangan; kerasnya disamakan dengan musik video utama (-24.6 LUFS).
- **Sertifikat TLS**: `generate_audio.py` memakai penyimpanan sertifikat
  Windows tanpa mode X.509 strict, karena antivirus di laptop pembuat
  memindai TLS dengan akar sertifikatnya sendiri (lihat komentar di skrip).

Urutan membangun:

    python naskah.py            -> lines.json
    python generate_audio.py    -> audio/line_NNN.mp3 (edge-tts)
    python build_timeline.py    -> timeline.json, subtitle.srt, narration_full.mp3
    python musik.py             -> music_bg.wav
    python build_sfx_bus.py     -> sfx_bus.wav
    python mix_audio.py         -> audio_final.mp3 (+ stem-*.mp3, tidak dipasang)
    python build_animation.py   -> animation.html
    node cek_tumpang.cjs 0.3 0.04   (harus 0)
    node smoke.cjs 8 20 165 372     (periksa frame contoh)
    node render_video.cjs       -> video_noaudio.mp4 (±25 menit)
    python build_deliverables.py -> subtitle.vtt, transkrip.txt
    bash mux_final.sh           -> Video_Edukasi_Kecurangan(.mp4|_720p.mp4)
    bash pasang.sh              -> public/video/video-edukasi-kecurangan*, kecurangan-*

Berkas hasil (mp4, wav, mp3, animation.html, audio/) tidak dimasukkan ke git
kecuali yang dipasang di `public/video/` (dilacak lewat Git LFS).
