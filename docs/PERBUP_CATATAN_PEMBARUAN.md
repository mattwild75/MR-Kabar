# Rancangan Perbup Manajemen Risiko — Catatan Keadaan dan Rencana Pembaruan

Catatan keadaan naskah per 30 Juli 2026, diperbarui 1 Agustus 2026.
Naskahnya bukan bagian dari repositori ini; berkasnya ada di Desktop\MR Kabar,
`Peraturan Bupati Aceh Barat - Pedoman Penerapan Manajemen Risiko (2026).docx`.

> **Keadaan per 1 Agustus 2026 — seluruh prasyarat aplikasi sudah tuntas.**
> Ketujuh tahap pembaruan di bawah ditulis ketika masing-masing masih menunggu
> sesuatu dibangun di aplikasi. Penantian itu berakhir: butir A1 sampai A12
> pada [REVISI_APLIKASI.md](REVISI_APLIKASI.md) selesai seluruhnya, begitu pula
> B1 sampai B3.
>
> **Yang tersisa bukan lagi pekerjaan aplikasi, melainkan pekerjaan naskah.**
> Batang tubuh Perbup belum diubah sama sekali — masih 55 Pasal, belum memuat
> satu pun Bagian baru yang direncanakan di bawah. Ketujuh tahap itu kini
> boleh dikerjakan kapan saja.

## Tiga naskah pendamping yang sudah jadi

Disusun 1 Agustus 2026, seluruhnya di Desktop\MR Kabar, kertas F4 Bookman Old
Style 12 pt, nomor dan tanggal sengaja dikosongkan untuk Bagian Hukum:

| Naskah | Menjawab |
|---|---|
| Keputusan Bupati tentang Struktur Pengelola Risiko Tahun 2025 dan 2026 | Tahap 5 |
| Surat Edaran Arahan dan Kebijakan Penilaian Risiko Tahun 2025 | Tahap 4 |
| Surat Edaran Arahan dan Kebijakan Penilaian Risiko Tahun 2026 | Tahap 4 |

Surat Edaran 2025 memuat sekaligus arahan lima tahunan 2025–2029, sesuai
Perdep Lampiran 3 dan 4.

**Dua dari tiga hal yang semula perlu dicocokkan sudah tuntas 1 Agustus 2026**,
dan keduanya ternyata ralat atas catatan ini sendiri:

- ~~Penyebutan "Dinas Pendidikan dan Kebudayaan" tidak ada di basis data.~~
  **Keliru.** Keduanya ada: `DINAS PENDIDIKAN DAN KEBUDAYAAN` dan `DINAS PENDIDIKAN
  DAYAH` adalah dua Perangkat Daerah yang berbeda. Naskahnya sudah benar sejak awal.
- ~~Rujukan Undang-Undang pembentukan Kabupaten Aceh Barat perlu dicocokkan.~~
  **Sudah dicocokkan, dan yang dipakai ternyata usang.** Naskah Perbup memakai UU 7
  (Drt) Tahun 1956, Keputusan Bupati memakai UU 4 Tahun 1968. Yang berlaku sekarang
  **Undang-Undang Nomor 11 Tahun 2024 tentang Kabupaten Aceh Barat di Aceh** (Lembaran
  Negara Tahun 2024 Nomor 109, Tambahan Lembaran Negara Nomor 6931), disahkan 2 Juli
  2024. Diverifikasi dari tiga sumber: JDIH BPK RI, JDIH Aceh Barat, dan **Peraturan
  Bupati Aceh Barat Nomor 6 Tahun 2025 tentang Pengendalian Kecurangan** — produk Aceh
  Barat sendiri yang sudah memakai rujukan baru itu. Kedua naskah kita sudah diperbaiki.

**Satu yang masih terbuka:** daftar 11 urusan pada Lampiran Surat Edaran belum
dicocokkan dengan dokumen resmi.

Keputusan Bupati **disunting manual** bila strukturnya berubah — atas
keputusan pemilik aplikasi, penyusunnya sengaja tidak disambungkan ke basis
data.

## Satu naskah saja — dua rancangan lain sudah dihapus

Pernah ada tiga rancangan berjudul mirip dengan tiga pendekatan hukum berbeda.
Dua di antaranya **dihapus 1 Agustus 2026** atas keputusan pemilik naskah, supaya
tidak ada yang salah ambil berkas:

- rancangan bergaya **"Perubahan atas Perbup 16/2022"** — mengubah sebagian pasal
  tidak memadai untuk perubahan sebesar ini;
- draf awal bergaya **Perbup Boyolali Nomor 4 Tahun 2025** yang pernah tersimpan di
  `docs/` — jauh lebih ringkas dan sudah tersalip.

Yang berlaku tinggal satu: `Desktop\MR Kabar\Peraturan Bupati Aceh Barat - Pedoman
Penerapan Manajemen Risiko (2026).docx`, Perbup baru yang **mencabut** Perbup 16
Tahun 2022 — 82 halaman, 11 BAB, 55 Pasal, Lampiran I sampai XVIII.

Kalau nanti muncul rancangan lain, catat di sini mana yang berlaku sebelum
menyimpannya berdampingan.

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
utuh, bukan disunting tangan. Skripnya kini ada di
[`naskah-hukum/`](../naskah-hukum/README.md) di dalam repositori ini —
**dipindahkan ke sana pada 1 Agustus 2026**, sebelumnya tersimpan di direktori
sementara sesi kerja yang bisa hilang kapan saja tanpa peringatan. Karena naskah
Perbup masih akan direvisi beberapa kali, kehilangan penyusunnya berarti
kehilangan kemampuan membangunnya ulang.

Cukup `python naskah.py` untuk membangun seluruh Perbup dari nol. Keterangan tiap
berkas, dan yang perlu diketahui sebelum mengubahnya, ada pada README di folder itu.

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

Enam belas butir, seluruhnya dicocokkan ke sumber resmi: **UU 11/2024** (menggantikan
UU 7 (Drt) 1956 yang semula dipakai — lihat ralat di atas), UU 28/1999,
UU 11/2006, UU 11/2008 jo. UU 1/2024, UU 25/2009, UU 23/2014 jo. UU 6/2023,
UU 27/2022, PP 60/2008, PP 18/2016 jo. PP 72/2019, PP 12/2019, PP 71/2019,
Perpres 54/2018, Perpres 95/2018, Permendagri 77/2020, Perdep PPKD BPKP 4/2019, dan
Qanun Aceh Barat 3/2016 jo. Qanun 2/2020.

Sumber utama: peraturan.go.id, dan untuk Qanun beserta PP Perangkat Daerah memakai
Perbup Aceh Barat Nomor 17 Tahun 2024 sebagai sumber primer. Untuk Undang-Undang
pembentukan Kabupaten Aceh Barat, sumber primernya Perbup Aceh Barat Nomor 6 Tahun
2025 — cara tercepat mengetahui rujukan mana yang sedang dipakai Bagian Hukum adalah
membaca produk hukum Aceh Barat yang paling baru, bukan mencari di pangkalan data
nasional.

## Rencana pembaruan — hasil pembandingan dengan Perwal Cilegon 2/2022

Perwal Kota Cilegon Nomor 2 Tahun 2022 dipakai sebagai pembanding karena praktik
pengelolaan Risikonya dinilai konsisten dan menjadi salah satu perintis MRPN.
Naskah kita lebih maju di banyak hal, tetapi Cilegon lebih operasional di tujuh titik
berikut. **Prasyarat aplikasi untuk ketujuhnya sudah terpenuhi per 1 Agustus 2026**;
keterangan "Prasyarat: A…" di bawah dipertahankan sebagai jejak alasan, bukan sebagai
penghalang yang masih berlaku.

### Tahap 0 — verifikasi  *(tuntas 1 Agustus 2026)*

- ~~Nomor Lembaran Negara Perpres 39/2023 tentang MRPN.~~ **Selesai** — LN Tahun 2023
  Nomor 90, ditetapkan dan diundangkan 16 Juni 2023, diverifikasi langsung dari naskah
  Perpres-nya.
- ~~Nomor Berita Negara Perka BPKP Nomor 25 Tahun 2013.~~ **Selesai, dengan hasil yang
  tidak terduga: nomor itu tidak ada.** JDIH BPKP memuat peraturannya — *Petunjuk
  Pelaksanaan Control Environment Evaluation*, ditetapkan 28 Juni 2013 — tetapi tanpa
  penunjukan Berita Negara, dan penelusuran di peraturan.bpk.go.id juga tidak
  menemukannya. Peraturan Kepala BPKP pada masa itu memang peraturan internal lembaga
  yang tidak diundangkan dalam Berita Negara.

  **Akibatnya untuk penaskahan:** Perka BPKP 25/2013 **tidak dicantumkan pada
  Mengingat**. Bukan semata karena nomornya tidak ada, melainkan karena Mengingat hanya
  memuat peraturan yang sederajat atau lebih tinggi, sedangkan Peraturan Kepala lembaga
  tidak berada dalam hierarki Undang-Undang Nomor 12 Tahun 2011. Kalau memang perlu
  disebut, tempatnya di batang tubuh atau lampiran sebagai rujukan teknis — sama seperti
  Perdep PPKD 4/2019 diperlakukan.

Yang tidak terverifikasi tidak dicantumkan.

### Tahap 1 — Ketentuan Umum dan dasar hukum

Dua pekerjaan. **Pertama**, tambahkan prinsip **kolaboratif** dan **perbaikan
berkelanjutan** pada Pasal 5 — Perpres 39/2023 Pasal 5 menetapkan sembilan prinsip
sedangkan naskah kita baru memuat tujuh. **Kedua**, rumusan pengertian "Sisa Risiko":
naskah memakai istilah "Residual" tiga kali pada
Formulir 7 tanpa pernah merumuskannya — cacat yang sejenis dengan Toleransi Risiko
dan SPIP yang sudah diperbaiki. Tambahkan pula Perka BPKP 25/2013 dan Perpres 39/2023
pada Mengingat bila Tahap 0 berhasil.

### Tahap 2 — Bagian baru "Pengembangan Budaya Sadar Risiko" pada BAB III  *(prasyarat A8 terpenuhi)*

Sekarang budaya sadar Risiko hanya muncul sebagai tujuan pada Pasal 3, tanpa satu
pasal pun yang mengatur caranya. Cilegon mengaturnya operasional: sosialisasi
pemahaman Risiko, internalisasi dalam pengambilan keputusan, perbaikan lingkungan
pengendalian, serta empat bentuknya termasuk penghargaan atas pengelolaan Risiko yang
baik. Perkiraan 2 Pasal. Prasyarat aplikasi A8 **sudah terpenuhi**: peringkat ketaatan
per SKPK ternyata sudah ada sejak semula sebagai widget Kepatuhan Pelaporan pada
Seksi 6 Dasbor, jadi tidak ada modul baru yang perlu dibangun untuk butir ini.

### Tahap 3 — penguatan BAB V  *(prasyarat A2, A3, A4, A9 terpenuhi)*

- Kriteria kapan pengendalian dinyatakan tidak efektif. Prasyarat A2 terpenuhi —
  aplikasi kini menuntun **lima** kriteria baku Perdep sebagai centang wajib saat
  efektivitas dinilai Tidak Efektif atau Kurang Efektif. Lima, bukan empat seperti
  dugaan semula; rumusannya ada di `resources/js/lib/irs-reference-data.ts`
  konstanta `CELAH_PENGENDALIAN_KRITERIA` dan sebaiknya dikutip persis.
- Kewajiban uji coba sebelum pengendalian diberlakukan. Prasyarat A4 terpenuhi —
  Form 9 kini merekam triwulan uji coba, tahunnya, hasilnya, dan berkas buktinya.
- Kewajiban menyelaraskan RTP lingkungan pengendalian dengan RTP Risiko agar tidak
  duplikatif. Prasyarat A3 terpenuhi — aplikasi menandai rumusan yang mirip dan
  penandanya dapat ditutup permanen bila memang berbeda.

Perkiraan 3 Pasal, disisipkan pada Bagian Rencana Tindak Pengendalian dan Bagian
Pemantauan.

Ditambah perubahan **Formulir 15 pada Lampiran XII**: sekarang hanya memuat Unsur,
Simpulan, Penjelasan, Penyusun, dan Jabatan Penyusun. Perlu ditambah kolom hasil
reviu dokumen dan hasil survei persepsi beserta uraiannya, serta ketentuan bahwa
bila kedua sumber bertentangan dilakukan pendalaman. Prasyarat A9 terpenuhi —
dan di sini ada **ralat atas catatan ini sendiri**: penyandingan dua sumber itu
SUDAH ADA sejak semula, baik di form maupun di Form Cetak delapan kolom. Yang
kurang justru perintah pada kolom (g) ketika keduanya bertentangan. Sambil
membangunnya ditemukan dua cacat lama: kotak Penjelasan dimatikan justru ketika
simpulannya "Memadai", dan kolom (g) Form Cetak menghitung ulang alih-alih
mencetak keputusan penyusun. Keduanya sudah diperbaiki.

### Tahap 4 — Bagian baru "Jadwal Penyelenggaraan" dan Lampiran jadwal

Ini gap paling substantif. Naskah menyebut RPJMD, Renstra, dan Renja sebagai sumber
Penetapan Konteks tetapi tidak pernah menyebut kapan tahapannya dikerjakan. Cilegon
punya tabel yang memetakan tahapan Manajemen Risiko ke siklus penyusunan RPJMD,
Renstra, RKPD dan Renja, RKA, KUA-PPAS, DPA, pelaksanaan APBD, pelaporan Januari
sampai Februari, dan reviu APIP Februari sampai Maret.

Bentuknya: satu Bagian pada BAB V ditambah satu Lampiran berisi tabel jadwal (waktu,
tahapan perencanaan, tahapan Manajemen Risiko, pelaksana, keluaran) dan satu
ilustrasi berwarna. Prasyarat A1 terpenuhi — jadwalnya kini berupa data
(Arahan dan Kebijakan Penilaian Risiko berikut tahapannya) dan tampil sebagai
garis waktu di Dasbor lengkap dengan penanda tenggat terlampaui. Kedua Surat
Edaran yang menjadi sumbernya juga sudah disusun, jadi tabel Lampiran jadwal
dapat disalin langsung dari sana alih-alih dikarang ulang.

### Tahap 5 — susunan Komite dan UPR

Naskah menyebut siapa yang menjabat tetapi tidak susunan internalnya, sehingga belum
bisa langsung dijadikan dasar Keputusan Bupati. Tambahkan susunan ketua, koordinator
teknis, dan anggota untuk Komite dan tiga tingkatan UPR, serta kewenangan membentuk
tim teknis. Prasyarat A5 terpenuhi — struktur pengelola Risiko kini berupa data per
tahun dengan kedudukan ketua, koordinator merangkap anggota, dan anggota, berikut
bagan yang digambar sendiri mengikuti Gambar 2.6 Perdep. Keputusan Bupati untuk
2025 dan 2026 sudah disusun dari susunan itu.

### Tahap 6 — laporan Komite sebagai jenis laporan keempat  *(prasyarat A6 terpenuhi)*

Sekarang tiga jenis laporan. Komite diberi tugas memantau efektivitas tetapi tanpa
kewajiban melaporkan. Tambahkan jenis keempat berikut sistematikanya pada Lampiran
sistematika laporan.

**Ralat atas catatan ini sendiri:** periodenya **semesteran dan tahunan**, bukan
triwulanan seperti yang semula diduga. Aplikasi merekamnya sebagai S1, S2, dan
TAHUNAN pada Form 14. Naskah Perbup harus mengikuti periode itu, bukan menyamakannya
dengan laporan berkala UPR yang memang triwulanan.

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
3. ~~Apakah istilah "Administrator" perlu diganti nama agar tidak berbenturan dengan
   jenjang jabatan administrator ASN.~~ **Sudah diputuskan 1 Agustus 2026:** nama
   peran di aplikasi **tidak diganti**. Super Admin tetap pemilik aplikasi, Admin
   adalah pengelola data selain pemilik. Yang perlu dijaga hanya satu: **naskah
   Perbup jangan memakai kata "Administrator"**, supaya tidak terbaca sebagai jenjang
   jabatan administrator ASN.
