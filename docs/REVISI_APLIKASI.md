# Revisi MR Kabar — Prasyarat Pengesahan Perbup

Disusun 30 Juli 2026, setelah membandingkan rancangan Peraturan Bupati Aceh Barat
tentang Pedoman Penerapan Manajemen Risiko dengan Perdep PPKD Nomor 4 Tahun 2019
dan dengan Peraturan Wali Kota Cilegon Nomor 2 Tahun 2022 (rujukan praktik yang
dinilai konsisten dan menjadi salah satu perintis MRPN).

## Mengapa aplikasi dikerjakan lebih dulu

Perbup tidak boleh mengatur sesuatu yang belum bisa dijalankan. Setiap kali Perbup
mewajibkan satu keluaran, aplikasi harus sudah punya tempat merekamnya — kalau
tidak, 49 SKPK menerima kewajiban yang tidak ada sarananya, dan pasal itu mati
sejak hari pertama.

Urutannya: bangun di aplikasi, buktikan bisa diisi, baru dinaikkan ke Perbup.
Daftar di bawah disusun mengikuti urutan itu.

---

## A. Prasyarat — pasal Perbup menunggu ini

### A1. Jadwal penyelenggaraan yang terikat siklus perencanaan

**Keadaan sekarang.** Aplikasi mengenal `tahun_penilaian` dan `TRIWULAN`, tetapi
tidak mengenal *kapan* satu tahapan seharusnya dikerjakan. Tidak ada tenggat, tidak
ada penanda terlambat, tidak ada kaitan ke siklus RPJMD, Renstra, Renja, RKA, atau
KUA-PPAS. Rancangan Perbup pun hanya menyebut ketiga dokumen itu sebagai *sumber*
Penetapan Konteks, bukan sebagai *penjadwal*.

**Yang perlu dibangun.** Tabel acuan jadwal (tahapan, dokumen perencanaan yang
menjadi pemicu, bulan mulai, bulan selesai, pelaksana, keluaran), lalu penanda
status pada setiap formulir: belum waktunya, sedang berjalan, terlambat. Penjadwal
server sudah ada (lihat [PENJADWAL_SERVER.md](PENJADWAL_SERVER.md)), jadi
pengingatnya bisa menumpang mekanisme yang sudah berjalan.

**Bobot.** Paling berat di daftar ini, dan paling berguna. Tanpa jadwal, tidak ada
cara menjawab pertanyaan "SKPK mana yang belum mengerjakan apa".

### A2. Ukuran kapan pengendalian dinyatakan tidak efektif

**Keadaan sekarang.** Kolom `KATEGORI EXISTING CONTROL` (memadai, kurang memadai,
tidak ada) dan `CELAH PENGENDALIAN` sudah ada dan sudah dipakai, tetapi aplikasi
tidak memberi ukuran apa pun. Akibatnya 49 PIC menilai dengan ukuran masing-masing,
dan angka Skala Risiko residual antar-SKPK tidak setara.

**Yang perlu dibangun.** Empat alasan baku sebagai pilihan pada kolom celah
pengendalian: kebijakan dan prosedur sudah ada tetapi belum mampu menangani Risiko;
prosedur belum atau tidak dapat dilaksanakan; kebijakan belum diikuti prosedur baku;
kebijakan dan prosedur tidak sesuai peraturan yang lebih tinggi. Boleh lebih dari
satu, dan tetap menyediakan uraian bebas.

**Bobot.** Ringan. Sudah ada pola `MultiCategoryTextarea` yang dipakai kolom Uraian
Penyebab Risiko — bentuknya bisa ditiru langsung.

### A3. Deteksi duplikasi antara RTP lingkungan pengendalian dan RTP Risiko

**Keadaan sekarang — lebih baik dari dugaan awal.** Aplikasi **sudah** menyatukan
keduanya: `monitoring_rtp.rtp_sumber_tipe` menerima `irs_pemda`, `irs_pd`, `iro_pd`,
dan `cee_rtp`, sehingga RTP atas lingkungan pengendalian dan RTP atas Risiko dipantau
dalam satu tabel. Penyatuannya bukan masalah.

**Yang kurang.** Tidak ada pemeriksaan yang menandai bila satu RTP CEE dan satu RTP
Risiko pada SKPK dan tahun yang sama sesungguhnya berbunyi sama. Duplikasi seperti
ini membuat satu pekerjaan dilaporkan dua kali.

**Yang perlu dibangun.** Pemeriksaan kemiripan teks antar-RTP dalam satu SKPK dan
tahun, disajikan sebagai peringatan yang bisa diabaikan — bukan penolakan. Pola
pencocokan `matchKey` yang sudah dipakai penggabungan hierarki bisa dipakai ulang.

### A4. Status uji coba pengendalian

**Keadaan sekarang.** Tidak ada. RTP hanya punya rencana dan realisasi.

**Yang perlu dibangun.** Satu tahap antara rencana dan berlaku: uji coba, beserta
catatan hasilnya dan penyempurnaan rancangan setelah uji coba. Cukup satu kolom
status dan satu kolom catatan pada monitoring RTP.

### A5. Struktur pengelolaan Risiko sebagai data, bukan hanya teks

**Keadaan sekarang.** Aplikasi hanya menyimpan penanda tangan lewat Data Umum.
Komite Pengelolaan Risiko, Koordinator, UPR tiga tingkatan, Unit Kepatuhan, dan
Penanggung Jawab Pengawasan hanya hidup sebagai kalimat di Perbup — tidak ada
tempat mencatat siapa orangnya.

**Yang perlu dibangun.** Modul susunan pengelola Risiko: peran, tingkatan, jabatan,
nama, dan SKPK, dengan susunan ketua, koordinator teknis, dan anggota. Keluarannya
bisa langsung dijadikan lampiran Keputusan Bupati, sehingga penetapan strukturnya
tidak perlu diketik ulang.

**Kaitan Perbup.** Pasal tentang Komite dan UPR baru bisa memuat susunan
ketua/koordinator/anggota kalau aplikasinya punya tempatnya.

### A6. Laporan Komite Pengelolaan Risiko sebagai jenis laporan keempat

**Keadaan sekarang.** Ada tiga laporan: pelaksanaan penilaian Risiko, berkala
pengelolaan Risiko, dan pemantauan Unit Kepatuhan (Form Cetak 11, 12, 13). Komite
diberi tugas memantau efektivitas tetapi tidak diberi kewajiban melaporkan, dan
tidak ada formulirnya.

**Yang perlu dibangun.** Jenis laporan keempat pada `laporan_narasi`
(`jenis_laporan`) berikut Form Cetak-nya: rencana dan realisasi kegiatan pembinaan,
hambatan, hasil pembinaan kepada UPR, serta rekomendasi.

### A7. Penilaian tingkat kematangan penyelenggaraan SPIP

**Keadaan sekarang.** Tidak ada. Kata "kematangan" hanya muncul sebagai tujuan di
rancangan Perbup Pasal 3.

**Yang perlu dibangun.** Perlu diputuskan lebih dulu apakah penilaian kematangan
memang akan dikerjakan di dalam MR Kabar atau tetap di luar aplikasi. Kalau di
dalam, bentuknya kuesioner berjenjang dengan bukti pendukung — bobotnya setara
seluruh modul CEE, jadi jangan dianggap pekerjaan kecil.

### A8. Budaya sadar Risiko yang terukur

**Keadaan sekarang.** Ada menu Panduan berisi video edukasi. Itu satu-satunya sarana
pembudayaan, dan tidak terukur.

**Yang perlu dibangun.** Dasbor kepatuhan per SKPK: tahapan mana yang sudah diisi,
mana yang terlambat, dan peringkat ketaatan. Ini sekaligus alat kerja Unit Kepatuhan
(lini kedua) yang sekarang tidak punya halaman sendiri, dan sekaligus dasar
pemberian penghargaan atas pengelolaan Risiko yang baik.

### A9. CEE 1c tidak merekam dua sumber simpulannya

**Keadaan sekarang.** `cee_simpulan` hanya menyimpan `simpulan` dan `penjelasan`.
Formulir CEE 1c melompat langsung ke simpulan tanpa merekam dari mana simpulan itu
datang. Cilegon menyandingkan dua sumber lebih dulu — hasil reviu dokumen (hasil dan
uraian) dan hasil survei persepsi (hasil dan uraian) — lalu baru menyimpulkan, dengan
aturan bila keduanya bertentangan dilakukan pendalaman atau professional judgement.

**Mengapa penting.** Keduanya memang bisa berbeda. Pada contoh Cilegon, tiga unsur
justru bertentangan: reviu dokumen menyimpulkan kurang memadai sedangkan survei
persepsi menyimpulkan memadai. Tanpa merekam keduanya, Inspektorat selaku lini ketiga
tidak dapat memverifikasi simpulan SKPK — tidak terlihat simpulan itu bersumber dari
mana, dan tidak terlihat apakah ada pertentangan yang dijembatani.

**Yang perlu dibangun.** Kedua bahannya sudah ada di basis data: hasil survei persepsi
dapat dihitung dari `cee_jawaban` (memadai bila modus 3 atau 4), hasil reviu dokumen
dapat diturunkan dari ada atau tidaknya baris `cee_kelemahan_dokumen` pada unsur yang
sama. Jadi yang dibangun hanya penyajian bersanding pada CEE 1c, satu kolom dasar
pertimbangan yang wajib diisi bila kedua sumber bertentangan, dan penyesuaian Form
Cetak 1c.

**Bobot.** Sedang-ringan. Tidak ada perhitungan baru, hanya penyajian dan satu kolom.

**Kaitan Perbup.** Formulir 15 pada Lampiran XII sekarang hanya memuat Unsur,
Simpulan, Penjelasan, Penyusun, dan Jabatan Penyusun. Dua kolom sumber perlu
ditambahkan bersamaan dengan perubahan aplikasinya.

---

## B. Revisi atas yang sudah ada

### B1. Modul CEE dan Monitoring RTP masih kosong

`cee_jawaban`, `cee_kelemahan_dokumen`, `cee_simpulan`, `cee_rtp`, dan
`monitoring_rtp` semuanya nol baris. Artinya dua modul yang diwajibkan Perbup belum
pernah dipakai sungguhan. Ini bukan kerusakan kode, tetapi risiko go-live: pasal yang
mewajibkannya akan berlaku atas modul yang belum pernah diuji dengan data nyata.

Tindakan: satu SKPK percontohan mengisi CEE 1a sampai 1d dan Monitoring RTP sampai
tuntas sebelum Perbup ditetapkan.

### B2. Istilah "Administrator" berbenturan

Aplikasi memakai "Administrator" untuk pengelola sistem, sementara "pejabat
administrator" adalah jenjang jabatan ASN yang juga dipakai rancangan Perbup pada
UPR tingkat operasional. Konteks membedakannya, tetapi kalau Bagian Hukum menghendaki
nol ambiguitas, peran aplikasi perlu diganti nama — misalnya menjadi Pengelola
Sistem. Perubahan nama peran merembet ke seeder, menu, dan seluruh pemeriksaan izin,
jadi keputusannya diambil sekali dan jangan diubah lagi setelah go-live.

### B3. Panel tinjauan usulan Program Bupati belum diperiksa di peramban

Alur usulan-persetujuan sudah lulus 12 pengujian otomatis, tetapi tampilan panel
tinjauan Admin dan penanda status pada baris PIC belum pernah dilihat langsung di
peramban. Perlu satu kali penelusuran manual.

---

## C. Sudah selesai — jangan dikerjakan ulang

Supaya tidak ada yang membangun ulang hal yang sudah ada:

- **Kerangka penyebab 7M+1E dan PESTLE** — 14 kategori, sudah lengkap dengan
  penjelasan tiap kategori. Cilegon masih memakai 5M.
- **Empat keadaan Skala Risiko** — inheren, residual, target, dan aktual, semuanya
  sudah punya kolom. Ini lebih rinci daripada rujukan mana pun yang dibandingkan.
- **Kriteria dampak lima dimensi** — kerugian keuangan, reputasi, kinerja, gangguan
  layanan, tuntutan hukum. Cilegon empat.
- **Kodefikasi Risiko** — tersusun dari tabel acuan yang bisa dikelola Admin, bukan
  daftar tetap.
- **Penyatuan RTP CEE dan RTP Risiko pada pemantauan** — sudah, lihat A3.
- **Persetujuan impor massal, penghapusan sementara, pemulihan, dan jejak audit** —
  sudah berjalan.
- **Keterkaitan Risiko dengan 100 Program Pembangunan Bupati** berikut alur
  usulan-persetujuannya — sudah, dan sudah teruji.

---

## D. Urutan pengerjaan yang disarankan

1. **A2** dan **A4** — ringan, langsung memperbaiki mutu data yang sedang diisi.
2. **A3** — ringan, mencegah pekerjaan ganda sebelum data pemantauan membesar.
3. **A9** — penyajian dua sumber pada CEE 1c. Dikerjakan sebelum B1 supaya SKPK
   percontohan langsung mengisi bentuk yang benar, bukan mengisi ulang nanti.
4. **B1** — pengisian percontohan CEE dan Monitoring RTP. Wajib sebelum Perbup
   ditetapkan.
5. **A1** — jadwal penyelenggaraan. Berat, tetapi menjadi tulang punggung
   pengawasan dan menjadi prasyarat Lampiran jadwal pada Perbup.
6. **A8** — dasbor kepatuhan, menumpang data jadwal dari A1.
7. **A5** dan **A6** — struktur pengelola dan laporan Komite.
8. **B2** — keputusan penamaan peran, dikerjakan sekali sebelum go-live.
9. **A7** — kematangan SPIP, hanya setelah diputuskan memang di dalam aplikasi.

Perbup dapat ditetapkan setelah nomor 1 sampai 4 tuntas. Nomor 5 sampai 9 bisa
menyusul dan diatur pada perubahan Perbup berikutnya.

---

## E. Sengaja tidak dikerjakan

- **Tingkat pelaporan Unit Kerja di dalam SKPK.** Cilegon bertingkat tiga (Unit
  Kerja, Perangkat Daerah, Pemerintah Daerah). MR Kabar berbasis satu akun per SKPK,
  jadi dua tingkat sudah sepadan. Menambah tingkat membuat Perbup tidak lagi
  menggambarkan aplikasinya.
- **Pembagian Unit Kepatuhan ke tiga Asisten menurut rumpun urusan.** Bergantung
  pada SOTK Sekretariat Daerah Aceh Barat yang belum diverifikasi. Keputusan
  kebijakan, bukan pekerjaan teknis.

Berkas terkait: [PERBUP_CATATAN_PEMBARUAN.md](PERBUP_CATATAN_PEMBARUAN.md) dan
[ROADMAP_MRPN.md](ROADMAP_MRPN.md).
