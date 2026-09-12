# Panduan ERPIKA

ERPIKA (Elektronik Rencana, Pelaksanaan, dan Evaluasi Pengawasan) adalah
bagian MR Kabar untuk Inspektorat: menyusun RPP, mencetak dokumen RPP,
merekam pelaksanaan (ST, masa tugas, laporan), dan merekapnya untuk Bagian
Analisis dan Evaluasi. Untuk sementara ERPIKA hidup di menu
**Miscellaneous → ERPIKA**; kelak dipindah ke `erpika.acehbaratkab.go.id`
tanpa mengubah cara kerjanya.

## Alur singkat

1. **Pegawai** — daftar pegawai Inspektorat (nama, NIP, pangkat/golongan,
   jabatan). Jabatan **Inspektur** adalah satu-satunya penanda tangan seluruh
   dokumen RPP. Kolom *Penugasan* menunjukkan total/kuning/hijau/merah dan
   penugasan terakhir tiap orang.
2. **Perencanaan → RPP Perencanaan** — satu baris = satu RPP (nomor, tahun,
   jenis, tanggal) berisi satu atau lebih *penugasan*. Nomor RPP diusulkan
   otomatis dari nomor terakhir jenis dan tahun yang dipilih dan boleh
   disunting. Tiap penugasan memuat uraian, obrik, sifat, lokasi (dalam/luar
   Kec. Johan Pahlawan → tarif SPPD 100.000/140.000), masa tugas, dan tim
   (PJ, WPJ, Dalnis, KT, AT) dengan hari DK/LK.
3. **Cetak** — tombol *Tabel* dan *Pengantar* per baris (PDF) serta
   *Unduh Excel*; hasilnya mengikuti berkas RPP.xls dan Pengantar RPP.doc
   yang dipakai sebelumnya.
4. **ANEVA → RPP Aneva** — rekap pelaksanaan per ST: nomor ST, tanggal,
   obrik, tim, DK/LK, TMT, laporan (nomor/tanggal), status tiga warna
   (merah ST terbit, kuning nomor laporan diminta, hijau LHP terbit), dan
   capaian per jenis (mis. "Reviu 38 (80%)"). *Pratinjau* dan *Unduh PDF /
   Excel* menghasilkan rekap 17 kolom persis berkas rekap aneva.
5. **Kalender Penugasan** — siapa bertugas kapan dalam satu bulan, per
   penugasan atau per orang; orang yang jadwalnya mustahil (hari lapangan
   melebihi hari kalender) ditampilkan paling atas.
6. **Beban Kerja** — hari DK/LK, biaya SPPD, jumlah penugasan, sebaran jenis
   dan peran per pegawai per tahun; bisa dicetak.
7. **Pemeriksaan Data** — temuan keutuhan: nomor ST ganda, penugasan tanpa
   uraian, ST tanpa tanggal, masa tugas tanpa ST, status tidak selaras dengan
   laporan, jadwal mustahil, pegawai tanpa NIP, dan penugasan yang belum
   pernah disinkron dari aneva. Halaman ini **hanya menandai** — perbaikan
   tetap lewat formulir RPP/Pegawai lewat tautan di tiap temuan.
8. **Data Terhapus** — RPP dan pegawai yang dihapus bisa dipulihkan atau
   dihapus permanen.

## Aturan yang dijaga aplikasi

- Penanda tangan hanya Inspektur (dari daftar Pegawai), tidak ada pilihan.
- Data aneva 2020–2026 adalah sumber kebenaran; bila perencanaan tidak ada
  atau berbeda, penugasan mengikuti aneva.
- Biaya SPPD = hari LK × tarif lokasi; hari DK tidak dibayar.
- Draf formulir RPP tersimpan otomatis di peramban; isian yang belum
  disimpan dipulihkan saat halaman dibuka lagi.
- Setiap perubahan tercatat di log audit; tombol *Riwayat* di tabel risiko
  MR Kabar menampilkan siapa mengubah apa.
- Tabel ERPIKA berdiri sendiri (tanpa kunci asing ke tabel MR Kabar) —
  dijaga pengujian otomatis; `php artisan erpika:ekspor` mengeluarkan
  seluruh data ERPIKA ke satu berkas SQL untuk pemindahan kelak.

## Pintasan

`Ctrl+K` pencarian global (RPP, nomor ST, pegawai), `?` daftar pintasan.
