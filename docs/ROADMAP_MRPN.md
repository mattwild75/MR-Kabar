# Roadmap MR Kabar menuju MRPN

Disusun 30 Juli 2026. Berkas ini menjelaskan apa itu MRPN, sejauh mana MR Kabar sudah
searah dengannya, dan apa yang perlu dibangun bila Aceh Barat hendak ikut.

## Apa itu MRPN

Manajemen Risiko Pembangunan Nasional diatur dengan **Peraturan Presiden Nomor 39
Tahun 2023**, ditetapkan 16 Juni 2023. Nomor Lembaran Negaranya belum diverifikasi
dan wajib dicocokkan ke sumber resmi sebelum dikutip pada bagian Mengingat peraturan
apa pun.

Yang perlu diketahui:

- **MRPN adalah kegiatan terkoordinasi** untuk mengarahkan dan mengendalikan Entitas
  MRPN sehubungan dengan adanya risiko pembangunan nasional.
- **Entitas MRPN** mencakup kementerian, lembaga, pemerintah daerah, pemerintah desa,
  badan usaha, dan badan lainnya. Pemerintah Kabupaten Aceh Barat termasuk di
  dalamnya.
- **MRPN Lintas Sektor** mengelola program, kegiatan, proyek, atau jenis risiko
  tertentu yang melibatkan 2 (dua) atau lebih Entitas MRPN. Strukturnya terdiri atas
  Unit Pemilik Risiko Lintas Sektor dan Pengawas Intern Lintas Sektor.
- **Pengampunya dua lembaga.** Kementerian PPN/Bappenas pada sisi perencanaan, BPKP
  pada sisi pengawasan. Keduanya menyusun Pedoman MRPN Lintas Sektoral.
- **Ada Komite MRPN** di tingkat nasional.
- Penerapannya sedang didorong ke 543 pemerintah daerah melalui proyek percontohan.

Yang **belum** diverifikasi dan tidak boleh diasumsikan: rincian tahapan proses,
bentuk register yang diwajibkan, mekanisme pelaporan daerah ke tingkat nasional, dan
apakah ada penilaian tingkat kematangan MRPN tersendiri. Sebelum roadmap ini
dijalankan, teks Perpres 39/2023 beserta Pedoman MRPN Lintas Sektoral harus dibaca
langsung.

## Bedanya dengan yang sudah kita kerjakan

MR Kabar dibangun di atas Perdep PPKD BPKP Nomor 4 Tahun 2019, yang mengatur
pengelolaan Risiko **di dalam satu pemerintah daerah**: Risiko strategis Pemda,
strategis SKPK, dan operasional SKPK. Seluruhnya berhenti di batas organisasi.

MRPN menambahkan lapisan yang belum kita punya: **risiko yang pemiliknya lebih dari
satu entitas**. Contoh yang mudah dibayangkan di Aceh Barat — pengendalian stunting
melibatkan Dinas Kesehatan, Dinas Pangan, Dinas Pemberdayaan Masyarakat, dan
pemerintah gampong sekaligus. Dalam kerangka Perdep, masing-masing mencatat risikonya
sendiri dan tidak ada yang memiliki risiko gabungannya. Dalam kerangka MRPN, risiko
itu punya satu pemilik lintas sektor.

## Apa yang sudah searah

Tiga hal yang sudah kita punya justru menjadi pijakan yang baik:

1. **Keterkaitan Risiko dengan 100 Program Pembangunan Bupati.** Ini adalah cikal
   bakal cara berpikir MRPN — risiko dilihat dari sisi program pembangunan, bukan dari
   sisi kotak organisasi. Sekarang 100 program dengan 307 kaitan Risiko, berikut alur
   usulan dan persetujuan. Satu program sudah bisa dikaitkan dengan risiko dari
   beberapa SKPK sekaligus, dan itu persis bentuk mentah risiko lintas sektor.
2. **Register terpusat.** Seluruh 49 SKPK merekam pada satu basis data, bukan pada
   berkas masing-masing. Penggabungan lintas SKPK tidak memerlukan pengumpulan
   berkas.
3. **Kodefikasi Risiko yang memuat kode entitas penilai.** Setiap Risiko sudah
   membawa identitas pemiliknya, sehingga risiko lintas entitas dapat dilacak asalnya.

## Yang belum ada

| | Kebutuhan MRPN | Keadaan MR Kabar |
|---|---|---|
| 1 | Risiko dengan pemilik lintas entitas | Setiap Risiko wajib bertuan pada satu SKPK lewat `user_id`; tidak ada bentuk kepemilikan bersama |
| 2 | Unit Pemilik Risiko Lintas Sektor | Tidak ada peran maupun modulnya |
| 3 | Pengawas Intern Lintas Sektor | Inspektorat sudah menjadi lini ketiga, tetapi hanya untuk lingkup Kabupaten |
| 4 | Register risiko lintas sektor yang berdiri sendiri | Belum ada; yang ada register per tingkatan organisasi |
| 5 | Keikutsertaan pemerintah gampong | Tidak ada; aplikasi berhenti di 49 SKPK |
| 6 | Pelaporan ke tingkat nasional | Belum ada bentuk keluaran untuk itu |
| 7 | Kaitan ke sasaran RPJMN, bukan hanya RPJMD | Penetapan Konteks hanya mengenal RPJMD, Renstra, dan Renja |

## Tahapan yang disarankan

Roadmap ini **tidak** untuk dikerjakan sekarang. Prioritasnya tetap menuntaskan
prasyarat Perbup lebih dulu — lihat [REVISI_APLIKASI.md](REVISI_APLIKASI.md).

### Tahap 1 — membaca dan memutuskan

Baca Perpres 39/2023 dan Pedoman MRPN Lintas Sektoral secara utuh. Putuskan apakah
Aceh Barat memang akan ikut MRPN atau cukup bertahan pada kerangka Perdep. Ini
keputusan Bupati, bukan keputusan teknis. Tanpa tahap ini, tahap berikutnya membangun
sesuatu yang belum tentu dipakai.

### Tahap 2 — memanfaatkan yang sudah ada

Dua hal yang bisa dikerjakan tanpa menunggu keputusan besar, karena berguna bagi
pengelolaan Risiko Kabupaten sekalipun MRPN tidak diikuti:

- **Menandai risiko yang menyentuh lebih dari satu SKPK.** Data untuk itu sudah ada:
  satu Program Pembangunan Bupati yang dikaitkan dengan risiko dari beberapa SKPK
  adalah petunjuk paling kuat adanya risiko lintas sektor. Cukup satu tampilan yang
  menyajikannya, belum perlu struktur baru.
- **Dasbor pimpinan berbasis program, bukan berbasis SKPK.** Menyajikan setiap program
  pembangunan beserta seluruh risiko yang mengancamnya lintas SKPK. Ini yang paling
  cepat berguna bagi Bupati dan sekaligus bahasa yang dipakai MRPN.

### Tahap 3 — kepemilikan bersama

Baru di sini struktur data berubah: satu Risiko dapat memiliki lebih dari satu SKPK
pemilik, dengan satu di antaranya sebagai pengampu utama. Perubahan ini menyentuh
pemeriksaan izin, register, seluruh Form Cetak, dan kodefikasi Risiko. Jangan
dikerjakan sebelum Tahap 1 memutuskan.

### Tahap 4 — peran lintas sektor

Unit Pemilik Risiko Lintas Sektor dan Pengawas Intern Lintas Sektor sebagai peran
tersendiri, dengan kewenangan membaca risiko beberapa SKPK sekaligus. Menumpang modul
struktur pengelola Risiko (butir A5 pada REVISI_APLIKASI.md), jadi modul itu sebaiknya
dirancang sejak awal agar bisa memuat peran lintas sektor.

### Tahap 5 — pemerintah gampong

Lingkup terbesar dan paling berat: Entitas MRPN mencakup pemerintah desa. Aceh Barat
punya ratusan gampong. Ini bukan penambahan fitur, melainkan penambahan kelas pengguna
baru dengan kebutuhan pelatihan dan pendampingan tersendiri. Jangan dijanjikan sebelum
empat tahap sebelumnya berjalan.

### Tahap 6 — pelaporan ke tingkat nasional

Bentuk keluarannya belum diketahui dan bergantung pada Pedoman MRPN Lintas Sektoral.
Ditunda sampai pedomannya dibaca.

## Catatan kejujuran

Kota Cilegon disebut sebagai salah satu perintis awal MRPN. Perlu dicatat bahwa
Perwal Cilegon Nomor 2 Tahun 2022 sendiri **tidak menyebut MRPN sama sekali**, dan
memang tidak mungkin menyebutnya karena Perpres 39/2023 baru terbit satu setengah
tahun kemudian. Kaitan Cilegon dengan MRPN datang dari praktik dan penunjukan sebagai
percontohan, bukan dari Perwal itu.

Artinya: menjadi rujukan MRPN tidak dicapai dengan menuliskan kata MRPN di dalam
peraturan, melainkan dengan konsistensi mengisi dan memakai datanya. Prioritas kita
sekarang — menuntaskan pengisian CEE dan Monitoring RTP yang masih kosong — justru
lebih dekat ke arah itu daripada menambah pasal.
