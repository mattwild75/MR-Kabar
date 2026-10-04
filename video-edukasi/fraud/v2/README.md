# Video Edukasi Lapor Dugaan Kecurangan v2 — "Bunyikan Lonceng" (±12:42)

Menggantikan versi 9 menit di folder induk (`..`) **seluruhnya**: naskah,
gaya visual, narasi, musik, dan efek suara dibuat ulang. Berkas yang dipasang
di `public/video/` tetap bernama sama (`video-edukasi-kecurangan*.mp4`,
`kecurangan-subtitle.vtt`, `kecurangan-transkrip.txt`); daftar bab pemutar
kini dari data, `resources/js/data/kecurangan-video-chapters.json`.

Diputar di /lapor-kejadian/video-kecurangan (tautan "Tonton video edukasi" di
samping judul Lapor Dugaan Kecurangan). Penontonnya masyarakat umum yang baru
memindai kode QR Lapor, kebanyakan dari ponsel.

## Konsep

Mesin animasinya mesin video edukasi utama v6 (`../../v6/engine.js`, fungsi
murni dari waktu), metaforanya melanjutkan v6: **pelayaran**. Badai = risiko
(tanpa niat); lubang yang sengaja dibor dari dalam = kecurangan (ada niat);
awak yang melihat lalu diam = bahaya terbesar; **lonceng kapal = laporan**.
Dunia laut di latar ikut bercerita: lambung dibor di pembuka, air merembes
makin deras selama babak "mengapa kita diam", lalu bocornya ditambal di babak
terakhir dan kapal pulang saat fajar.

Sengaja **kritis**, bukan sekadar petunjuk tombol: mengapa orang curang
(segitiga kecurangan Cressey), mengapa orang diam (lima alasan dan jawabannya),
cara melapor yang benar beserta empat larangannya, dan batas perlindungan yang
jujur — apa yang dijaga aplikasi, apa yang dijaga undang-undang, dan apa yang
tetap tanggung jawab pelapor (detail yang hanya diketahui pelapor bisa
menunjuk balik kepadanya; PDF tidak bisa dibersihkan).

Tambahan pada mesin (`engine.js`): komponen `ponsel()` (tangkapan layar
halaman Lapor versi ponsel dalam bingkai ponsel: gulir, ketukan jari, sorotan,
perbesaran, layar kamera pemindai QR), ikon garis Lucide (`ikon()`/`ikonG()`),
dan sampel kebocoran untuk bunyi air.

## Fakta yang dipakai (sudah diperiksa)

- **Perilaku aplikasi**, dibaca dari kodenya: QR (`/login/lapor-kejadian`)
  masuk otomatis ke akun bersama LAPOR — tanpa akun pribadi; tiga mode
  identitas; nama tidak disimpan pada mode anonim dan **dibuang server**
  sekalipun ikut terkirim; anonim penuh tanpa kontak; hanya "Apa yang
  terjadi?" yang wajib; lampiran JPG/PNG/PDF maks. 5 berkas @10 MB; foto
  dibersihkan metadatanya untuk **semua** mode, PDF tidak; bukti di
  penyimpanan tertutup; kode akses disimpan sebagai hash, tampil sekali, tak
  bisa dipulihkan; laporan hanya terbuka bagi admin/super-admin/eksekutif/apip
  (`User::canViewAllOpd`), tidak bagi akun perangkat daerah; status baru →
  diverifikasi → ditindaklanjuti → selesai; tanya-jawab dan bukti tambahan
  lewat tab Cek Status Laporan; laporan dapat ditautkan ke register risiko
  kecurangan (`fraud_risiko_id`).
- **Kejadian Risiko WAJIB nama pelapor dan diteruskan (beserta notifikasinya)
  ke akun perangkat daerah yang dipilih.** Versi lama menyarankan "kalau ragu,
  pilih salah satu" — saran itu bisa membuka identitas pelapor kepada pihak
  yang dilaporkan, dan diluruskan di babak 01.
- ACFE, *Occupational Fraud 2026: A Report to the Nations*: 2.402 kasus,
  143 negara; 43% terungkap lewat laporan (cara deteksi terbanyak, jauh di atas
  audit); lebih dari separuh laporan dari pegawai; 84% pelaku menunjukkan
  setidaknya satu tanda; gaya hidup melampaui penghasilan = tanda paling sering;
  umumnya berjalan 12 bulan sebelum terungkap.
- UU 31/1999 jo. UU 20/2001: puluhan pasal dikelompokkan (KPK) menjadi tujuh
  bentuk — sama dengan tujuh pilihan di formulir; gratifikasi wajib dilaporkan
  ke KPK paling lambat 30 hari kerja (Pasal 12B–12C).
- UU 31/2014 Pasal 10 ayat (1): pelapor tidak dapat dituntut pidana maupun
  perdata atas laporannya, kecuali tidak beriktikad baik. "Pelapor" di UU itu
  = yang melapor kepada penegak hukum, karena itu disebut untuk perkara yang
  **sampai ke penegak hukum**; LPSK dapat memberi perlindungan.
- Perbup Aceh Barat No. 6 Tahun 2025 Pasal 3: toleransi nol; berlaku untuk
  perangkat daerah, BUMD, BLUD, pemerintahan gampong (docs/MR_FRAUD_TEMUAN.md).
- Donald R. Cressey, *Other People's Money* (1953).

## Urutan membangun

    python ambil_huruf.py            -> fonts/ (SIL OFL)  [atau salin ../../v6/fonts]
    (salin ../../v6/foto/g_*.jpg + kredit.json ke foto/, ../../v6/img/*.png ke img/)
    python ambil_ikon.py             -> ikon.json (dari node_modules/lucide-react, ISC)
    python lampiran_contoh.py        -> img/foto-papan-loket.jpg
    node ambil_ponsel.cjs            -> shots/p-*.png + p-*.json (HANYA basis data lokal;
                                        laporan contoh dikirim lalu DIHAPUS otomatis oleh
                                        tiket_contoh.php — pastikan "jumlah ... 0" di akhir)
    python naskah.py                 -> lines.json, chapters_naskah.json
    python generate_audio.py         -> audio/line_NNN.mp3 + .words.json
    python build_timeline.py         -> timeline.json, subtitle.srt, narration_full.wav
    python build_animation.py        -> animation.html
    node smoke.cjs kontak 4 ; python kontak.py 4 480   (periksa frame)
    node cek_tumpang.cjs 0.5 0.6     (teks bertumpuk; sisa yang wajar: kotak huruf bersinggungan)
    node ekspor_isyarat.cjs          -> isyarat.json
    python musik.py                  -> music_bg.wav
    python build_sfx.py              -> sfx_bus.wav
    python mix_audio.py              -> audio_final.mp3 + stem-*.mp3 (stem dipasang untuk slider mix di /settingsapp)
    node render_video.cjs            -> video_noaudio.mp4 (±50 menit)
    python build_deliverables.py     -> subtitle.vtt, transkrip.txt, chapters.json
    bash mux_final.sh                -> Video_Edukasi_Kecurangan(.mp4|_720p.mp4)
    bash pasang.sh                   -> public/video/* + kecurangan-video-chapters.json

Kalau naskah berubah: ulangi dari `naskah.py`. Seluruh tampilan, musik, dan
SFX mengikuti timeline sendiri — tidak ada detik yang ditulis tangan.
