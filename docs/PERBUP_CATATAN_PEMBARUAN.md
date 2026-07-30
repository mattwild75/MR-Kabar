# Rancangan Perbup Manajemen Risiko — Catatan Keadaan dan Rencana Pembaruan

Catatan keadaan naskah per 30 Juli 2026, beserta yang masih harus dikerjakan.
Naskahnya bukan bagian dari repositori ini; berkasnya ada di Desktop\MR Kabar,
`Peraturan Bupati Aceh Barat - Pedoman Penerapan Manajemen Risiko (2026).docx`.

## Keadaan naskah sekarang

| | |
|---|---|
| Halaman | 82 |
| Kata | 18.444 |
| Batang tubuh | 11 BAB, 55 Pasal |
| Lampiran | I sampai dengan XVIII |
| Tabel | 67, semuanya berketerangan bernomor otomatis |
| Gambar | 14 ilustrasi berwarna, ditambah lambang negara |
| Kertas | F4 atau folio, 216 x 330 mm, marjin kiri 25 mm kanan 19 mm atas dan bawah 22 mm |
| Huruf | Bookman Old Style 12 pt, spasi tunggal |

Struktur Heading 1 sampai 3 aktif sehingga Panel Navigasi dan Daftar Isi otomatis
Word berfungsi. Penomoran gambar dan tabel memakai medan SEQ, jadi menyisipkan
gambar atau tabel baru tidak merusak penomoran berikutnya.

## Penyusun naskah

Naskah dibangun oleh sekumpulan skrip Python yang menghasilkan berkas .docx secara
utuh, bukan disunting tangan. Skripnya **tidak berada di repositori ini** dan
tersimpan di direktori sementara sesi kerja. Bila naskah perlu dibangun ulang dari
nol, skrip itu harus disalin lebih dulu ke tempat permanen; bila hanya perlu
disunting, berkas .docx berdiri sendiri.

Berkas inti: `inti.py` (pembentuk OOXML, gaya, sectPr, tabel, gambar),
`naskah.py` (seluruh isi), `gambar.py` dan `gambar2.py` beserta `render.cjs` dan
`render2.cjs` (ilustrasi lewat Chromium), serta `periksa.ps1` (pemeriksaan lewat
Word COM).

## Empat isian yang tersisa

Semuanya wewenang Bagian Hukum pada saat penetapan, sengaja dibiarkan kosong:

1. Nomor Perbup pada kepala naskah dan pada setiap kepala lampiran.
2. Nama dan sebutan jabatan penanda tangan pengundangan. Per 13 Juni 2026 jabatan
   Sekretaris Daerah masih dijalankan Pelaksana Tugas, sehingga sebutan jabatannya
   belum pasti.
3. Nomor Berita Daerah.
4. Penunjuk sambungan halaman di kanan bawah setiap halaman. Isinya harus berupa kata
   pembuka halaman berikutnya, sehingga hanya dapat diketik setelah tata letak final.
   Perbup Aceh Barat Nomor 17 Tahun 2024 memakainya di seluruh halaman.

## Dasar hukum yang sudah terverifikasi

Enam belas butir, seluruhnya dicocokkan ke sumber resmi: UU 7 (Drt) 1956, UU 28/1999,
UU 11/2006, UU 11/2008 jo. UU 1/2024, UU 25/2009, UU 23/2014 jo. UU 6/2023,
UU 27/2022, PP 60/2008, PP 18/2016 jo. PP 72/2019, PP 12/2019, PP 71/2019,
Perpres 54/2018, Perpres 95/2018, Permendagri 77/2020, Perdep PPKD BPKP 4/2019, dan
Qanun Aceh Barat 3/2016 jo. Qanun 2/2020.

Sumber utama: peraturan.go.id, dan untuk Qanun beserta PP Perangkat Daerah memakai
Perbup Aceh Barat Nomor 17 Tahun 2024 sebagai sumber primer.

## Rencana pembaruan — hasil pembandingan dengan Perwal Cilegon 2/2022

Perwal Kota Cilegon Nomor 2 Tahun 2022 dipakai sebagai pembanding karena praktik
pengelolaan Risikonya dinilai konsisten dan menjadi salah satu perintis MRPN.
Naskah kita lebih maju di banyak hal, tetapi Cilegon lebih operasional di tujuh titik
berikut. **Seluruh tahap di bawah ditunda sampai prasyarat aplikasinya selesai** —
lihat [REVISI_APLIKASI.md](REVISI_APLIKASI.md).

### Tahap 0 — verifikasi

- Nomor Lembaran Negara Perpres 39/2023 tentang MRPN. Perpres-nya sudah dipastikan
  ada, ditetapkan 16 Juni 2023, tetapi nomor Lembaran Negaranya belum terverifikasi.
- Nomor Berita Negara Perka BPKP Nomor 25 Tahun 2013 tentang Petunjuk Pelaksanaan
  Control Environment Evaluation. Cilegon merujuknya di lampiran; kita punya modul CEE
  utuh tetapi belum mencantumkannya.

Yang tidak terverifikasi tidak dicantumkan.

### Tahap 1 — Ketentuan Umum dan dasar hukum

Rumusan pengertian "Sisa Risiko". Naskah memakai istilah "Residual" tiga kali pada
Formulir 7 tanpa pernah merumuskannya — cacat yang sejenis dengan Toleransi Risiko
dan SPIP yang sudah diperbaiki. Tambahkan pula Perka BPKP 25/2013 dan Perpres 39/2023
pada Mengingat bila Tahap 0 berhasil.

### Tahap 2 — Bagian baru "Pengembangan Budaya Sadar Risiko" pada BAB III

Sekarang budaya sadar Risiko hanya muncul sebagai tujuan pada Pasal 3, tanpa satu
pasal pun yang mengatur caranya. Cilegon mengaturnya operasional: sosialisasi
pemahaman Risiko, internalisasi dalam pengambilan keputusan, perbaikan lingkungan
pengendalian, serta empat bentuknya termasuk penghargaan atas pengelolaan Risiko yang
baik. Perkiraan 2 Pasal. Prasyarat aplikasi: A8.

### Tahap 3 — penguatan BAB V

- Kriteria kapan pengendalian dinyatakan tidak efektif, empat butir. Prasyarat: A2.
- Kewajiban uji coba sebelum pengendalian diberlakukan. Prasyarat: A4.
- Kewajiban menyelaraskan RTP lingkungan pengendalian dengan RTP Risiko agar tidak
  duplikatif. Prasyarat: A3.

Perkiraan 3 Pasal, disisipkan pada Bagian Rencana Tindak Pengendalian dan Bagian
Pemantauan.

### Tahap 4 — Bagian baru "Jadwal Penyelenggaraan" dan Lampiran jadwal

Ini gap paling substantif. Naskah menyebut RPJMD, Renstra, dan Renja sebagai sumber
Penetapan Konteks tetapi tidak pernah menyebut kapan tahapannya dikerjakan. Cilegon
punya tabel yang memetakan tahapan Manajemen Risiko ke siklus penyusunan RPJMD,
Renstra, RKPD dan Renja, RKA, KUA-PPAS, DPA, pelaksanaan APBD, pelaporan Januari
sampai Februari, dan reviu APIP Februari sampai Maret.

Bentuknya: satu Bagian pada BAB V ditambah satu Lampiran berisi tabel jadwal (waktu,
tahapan perencanaan, tahapan Manajemen Risiko, pelaksana, keluaran) dan satu
ilustrasi berwarna. Prasyarat: A1.

### Tahap 5 — susunan Komite dan UPR

Naskah menyebut siapa yang menjabat tetapi tidak susunan internalnya, sehingga belum
bisa langsung dijadikan dasar Keputusan Bupati. Tambahkan susunan ketua, koordinator
teknis, dan anggota untuk Komite dan tiga tingkatan UPR, serta kewenangan membentuk
tim teknis. Prasyarat: A5.

### Tahap 6 — laporan Komite sebagai jenis laporan keempat

Sekarang tiga jenis laporan. Komite diberi tugas memantau efektivitas tetapi tanpa
kewajiban melaporkan. Tambahkan jenis keempat berikut sistematikanya pada Lampiran
sistematika laporan. Prasyarat: A6.

### Tahap 7 — bangun ulang dan verifikasi

Penomoran Pasal akan bergeser, perkiraan 55 menjadi sekitar 65, berikut seluruh
rujukan silang dan penomoran Lampiran. Pemeriksaan yang wajib diulang setiap kali
naskah dibangun:

- Penomoran Pasal berurutan tanpa lompatan, dan seluruh rujukan silang menunjuk Pasal
  yang benar.
- Setiap Lampiran dirujuk dari batang tubuh dan ditutup tepat satu tanda tangan.
- Tidak ada rumusan pengertian yang tidak pernah dipakai.
- Tidak ada tabel yang melampaui lebar teks bagiannya.
- Tanda baca daftar huruf: butir tengah titik koma, butir kedua terakhir "; dan" atau
  "; atau", butir terakhir titik.
- Pasal berayat tunggal tidak diberi nomor ayat.

Perkiraan hasil akhir: sekitar 92 halaman.

## Yang sengaja tidak diadopsi dari Cilegon

- **Pembagian Unit Kepatuhan ke tiga Asisten menurut rumpun urusan.** Bergantung pada
  SOTK Sekretariat Daerah Aceh Barat yang belum diverifikasi.
- **Tingkat pelaporan Unit Kerja di dalam SKPK.** MR Kabar berbasis satu akun per
  SKPK, sehingga dua tingkat sudah sepadan.

## Pertanyaan substansi yang belum diputuskan

Bukan soal penaskahan, memerlukan keputusan Bupati dan Bagian Hukum:

1. Apakah tenggat pelaporan yang dipakai naskah — 14 hari kerja setelah penilaian
   selesai, akhir Januari untuk laporan tahunan, akhir Februari untuk rekapitulasi —
   realistis bagi 49 SKPK.
2. Apakah pembagian tugas Komite dan Unit Kepatuhan cocok dengan kebiasaan kerja di
   Aceh Barat.
3. Apakah istilah "Administrator" perlu diganti nama agar tidak berbenturan dengan
   jenjang jabatan administrator ASN.
