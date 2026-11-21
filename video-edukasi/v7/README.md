# Video edukasi v7 — "Berlayar dengan Peta Risiko" (animasi paper cut)

Pengganti utuh v6 (22 November 2026). Kisah awak kapal di pelabuhan Meulaboh:
badai pembuka, waktu "diulang" ke dermaga, sepuluh babak, badai kedua yang
kalah menjadi pelangi, tiga pelajaran. Durasi 16:57, 142 kalimat, 12 bab.

Keputusan pemilik yang diterapkan: Kepala Daerah dan Sekretaris Daerah hanya
tampil sebagai SIMBOL (topi nakhoda emas di atas kemudi, kompas anjungan);
Perbup manajemen risiko belum disahkan sehingga tidak disebut; alur pengisian
skala lewat tabel kriteria + Isi Nilai Risiko; suara sintetis dengan rasa,
jeda, dan tekanan kata; logo selalu `public/img/MRKabar-lengkap.png`.

Video memuat ke-20 indikator pre-test/post-test (termasuk empat indikator
kecurangan di Babak 9), petanya di `naskah.py` (INDIKATOR).

## Urutan build

```
python naskah.py            # lines.json, chapters_naskah.json (+ perkiraan durasi)
python suara.py             # audio/line_NNN.wav + .words.json (edge-tts, rasa/jeda/tekanan)
python bangun_timeline.py   # timeline.json + narasi_penuh.wav
node rakit.cjs lembar       # (opsional) uji/lembar_tokoh.png
node rakit.cjs asap         # uji galat seluruh film tiap 0,5 detik
node rakit.cjs isyarat      # isyarat.json: bunyi, suasana, musik dari koreografi
python musik.py             # musik_latar.wav (FluidSynth + MuseScore General)
python build_sfx.py         # sfx_bus.wav (semua bunyi disintesis)
python mix_audio.py         # audio_final.mp3 + stem-*.mp3
node render_video.cjs 8     # video_noaudio.mp4 (8 proses Chromium, ±50 menit)
python bangun_hasil.py      # subtitle.srt/.vtt, transkrip.txt, chapters.json
bash pasang.sh              # kemas MP4 lengkap + salin ke public/video
```

Render panjang sebaiknya dilepas dari sesi: `render_semua.sh` lewat
`Start-Process` Git Bash.

## Isi folder

- `naskah.py` — naskah (babak, tokoh, rasa, kalimat bermarkah `/ // /// *kata*`),
  preset suara TOKOH dan RASA, aturan irama `jeda_giliran`.
- `mesin/` — mesin animasi (SVG kertas, fungsi murni dari waktu t):
  `dasar.js` (utilitas, kamera, isyarat), `tokoh.js` (boneka bermulut
  A-I-U-E-O, Si Badai), `set.js` + `set_tambahan.js` (properti),
  `adegan_sNN.js` (koreografi per babak), `film.js` (pengatur adegan,
  kartu babak, kartu ingat, lembar tokoh), `template.html`.
- `aset/` — huruf & foto (disalin dari v6, tidak ikut repositori kecuali
  `foto/kredit.json`), tangkapan layar aplikasi `aset/layar/` (ambil ulang
  dengan `akun_shot.php` + `ambil_layar.cjs`, akun sementara dihapus).
- `papan_cerita.py` + `cetak_pdf.cjs` — PDF naskah & papan cerita untuk
  persetujuan pemilik; `contoh_pembuka.py` — contoh suara babak pembuka.
