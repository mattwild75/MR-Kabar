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

**Bobotnya naik.** Semula butir ini hanya meniru praktik Cilegon. Setelah naskah
Perpres 39/2023 dibaca langsung, ternyata "strategi pembangunan Budaya Risiko" adalah
salah satu dari tiga muatan wajib Kebijakan MRPN organisasi menurut Pasal 10 — dan
rancangan Perbup kita sudah memuat dua muatan lainnya. Ini bukan pelengkap, melainkan
unsur yang hilang. Lihat [ROADMAP_MRPN.md](ROADMAP_MRPN.md).

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

### A10. Dokumen Kebijakan Pengelolaan Risiko

**Keadaan sekarang.** Tidak ada. Aplikasi menyimpan hasil penilaian Risiko, tetapi
tidak menyimpan dokumen kebijakan yang menjadi payungnya.

**Perintah Perdep.** Lampiran 1 Perdep memuat contoh utuh Kebijakan Pengelolaan Risiko
yang ditetapkan dengan Peraturan Kepala Daerah — memuat asas, ruang lingkup, struktur,
kriteria penilaian, sampai jadwal penyelenggaraan. Rancangan Perbup kita sesungguhnya
sudah menjadi dokumen itu; yang belum ada adalah tempatnya di aplikasi sebagai rujukan
yang dapat dibuka Pengguna.

**Yang perlu dibangun.** Modul dokumen kebijakan: unggah atau rekam naskah kebijakan
yang berlaku beserta tahun berlakunya, lalu tautkan dari setiap formulir sebagai dasar
pengisian.

**Rujukan Perdep.** PDF halaman 121 sampai dengan 134.

### A11. Arahan dan Kebijakan Penilaian Risiko 5 Tahunan dan 1 Tahunan

**Keadaan sekarang.** Tidak ada. Penilaian Risiko di aplikasi dimulai kapan saja tanpa
pemicu resmi.

**Perintah Perdep.** Lampiran 3 dan Lampiran 4 Perdep memuat contoh Surat Edaran Kepala
Daerah berisi arahan penilaian Risiko — 5 tahunan mengikuti periode RPJMD, dan 1 tahunan
mengikuti siklus anggaran. Isinya menetapkan SKPK dan urusan mana yang dinilai tahun itu,
siapa pelaksananya, dan **tanggal mulai serta selesai tiap tahapan**. Contoh 1 tahunan
menyebut tanggal konkret, misalnya penilaian Risiko operasional SKPK dilakukan 3 sampai
14 Oktober setelah RKA disusun.

**Yang perlu dibangun.** Modul arahan penilaian per tahun: SKPK dan urusan yang ditunjuk,
tahapan beserta tenggatnya. Ini **sumber data bagi butir A1** — jadwal tidak perlu
dikarang, melainkan direkam dari arahan yang ditetapkan Bupati tiap tahun.

**Rujukan Perdep.** PDF halaman 137 sampai dengan 141.

### A12. Selera Risiko sebagai data

**Keadaan sekarang.** Tidak ada field-nya. Kata "selera risiko" hanya muncul pada materi
video panduan. Penetapan Risiko Prioritas di aplikasi memakai ambang tetap.

**Perintah Perdep.** Penetapan area yang menjadi Risiko Prioritas **dipengaruhi selera
Risiko atau preferensi manajemen pemerintah daerah**. Perdep juga menyebut sisa Risiko
harus dibawa ke tingkat yang berada dalam selera Risiko manajemen.

**Yang perlu dibangun.** Selera Risiko sebagai data acuan per tahun penilaian —
sekurangnya ambang Skala Risiko yang masih dapat diterima — lalu dipakai sebagai dasar
penandaan Risiko Prioritas, menggantikan ambang tetap.

**Rujukan Perdep.** PDF halaman 42 dan 43.

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

1. **A2**, **A4**, dan **A12** — ringan, langsung memperbaiki mutu data yang sedang
   diisi.
2. **A3** — ringan, mencegah pekerjaan ganda sebelum data pemantauan membesar.
3. **A9** — penyajian dua sumber pada CEE 1c. Dikerjakan sebelum B1 supaya SKPK
   percontohan langsung mengisi bentuk yang benar, bukan mengisi ulang nanti.
4. **B1** — pengisian percontohan CEE dan Monitoring RTP. Wajib sebelum Perbup
   ditetapkan.
5. **A11** lalu **A1** — arahan penilaian per tahun menjadi sumber data jadwal,
   sehingga dikerjakan lebih dulu. Berat, tetapi menjadi tulang punggung
   pengawasan dan menjadi prasyarat Lampiran jadwal pada Perbup.
6. **A8** — dasbor kepatuhan, menumpang data jadwal dari A1.
7. **A5**, **A6**, dan **A10** — struktur pengelola, laporan Komite, dan dokumen
   kebijakan.
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

---

## F. Rujukan halaman Perdep

Nomor yang dipakai adalah **nomor halaman berkas PDF** — yang diketik pada kotak
halaman pembaca PDF. Nomor cetak pada naskahnya tidak dipakai karena setiap lampiran
memulai penomorannya sendiri dari 1, sehingga menyesatkan.

Berkas: `Perdep PPKD No 04 2019 ttg Pedoman Pengelolaan Risiko Pada Pemerintah Daerah
(060520)  (1).pdf`, 173 halaman, di Desktop\MR Kabar.

| Butir | Pokok | PDF halaman |
|---|---|---|
| A1 | Jadwal, tabel waktu dan tahapan berikut pelaksananya | 122&ndash;134, tabel utama 124 |
| A2 | Kriteria pengendalian dinyatakan tidak efektif | 86 |
| A3 | Menyelaraskan RTP agar tidak duplikatif | 94 |
| A4 | Uji coba penerapan pengendalian, langkah 4 dari 6 | 96 |
| A5 | Contoh Keputusan Kepala Daerah tentang struktur | 135&ndash;136 |
| A6 | Tugas Komite membuat laporan triwulanan dan tahunan | 115 |
| A7 | Maturitas SPIP | 124 |
| A8 | Budaya Risiko, dan Unit Kepatuhan selaku lini kedua | 32&ndash;33, 44&ndash;51 |
| A9 | Form 1.c, simpulan dari reviu dokumen dan survei persepsi | 145 |
| A10 | Contoh Kebijakan Pengelolaan Risiko | 121&ndash;134 |
| A11 | Arahan dan Kebijakan Penilaian Risiko 5 Tahunan dan 1 Tahunan | 137&ndash;141 |
| A12 | Selera Risiko sebagai dasar penetapan Risiko Prioritas | 42&ndash;43 |

Catatan: 14 halaman pada berkas itu berupa pindaian tanpa lapisan teks, sehingga tidak
dapat dicari dengan penelusuran kata. Halaman tersebut adalah 1, 26, 57, 100, 101, 104,
106, 109, 150, 158, 163, dan 171 sampai dengan 173.
