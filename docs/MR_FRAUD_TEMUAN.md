# MR Fraud — Catatan Temuan

Hasil pembacaan bahan Fraud Risk Assessment di `Desktop\MR Kabar\MR Fraud`,
1 Agustus 2026. **Ini catatan temuan, bukan rancangan.** Perancangannya
diputuskan pemilik aplikasi menyusul; berkas ini ada supaya temuannya tidak
perlu diturunkan ulang dari nol saat itu tiba.

Belum ada satu baris kode pun yang ditulis untuk ini.

## Bahannya

| Berkas | Isi |
|---|---|
| `18. PERBUP N0 6 TAHUN 2025_PENGENDALIAN KECURANGAN.pdf` | 10 halaman, **pindaian tanpa lapisan teks** — hanya dapat dibaca sebagai gambar |
| `PPT FRA.pptx` | 17 slide, metode Fraud Risk Assessment |
| `Format Kertas Kerja FRA - edited.xlsx` | 7 lembar kertas kerja — yang paling penting secara teknis |
| `Register Risiko Fraud Disdik.pdf` | 5 halaman contoh terisi, juga pindaian tanpa teks |

## Dasar hukumnya sudah berlaku

**Peraturan Bupati Aceh Barat Nomor 6 Tahun 2025 tentang Pengendalian
Kecurangan.** Berbeda dengan MRPN yang masih menunggu keputusan, yang ini sudah
ditetapkan. Yang terbaca dari halaman 5 sampai 7:

- **Pasal 3 ayat (1)** — Pemerintah Kabupaten menerapkan prinsip tidak
  mentoleransi kecurangan (*Zero Tolerance to Fraud*).
- **Pasal 3 ayat (2)** — pengendalian kecurangan didesain untuk **memperkuat dan
  melengkapi sistem pengendalian intern yang ada**. Inilah sambungan hukumnya ke
  MR Kabar: FRA bukan pengganti SPIP, melainkan lapisan tambahan di atasnya.
- **Pasal 3 ayat (3)** — berlaku untuk seluruh Perangkat Daerah, **BUMD, BLUD,
  Pemerintahan Gampong**, dan lembaga lain yang menerima atau mengelola uang
  Pemerintah Kabupaten atau Gampong.
- **Pasal 5** — tiga strategi: pencegahan, deteksi, respons. Dijabarkan menjadi
  sepuluh atribut, dan huruf **(c) adalah penilaian risiko kecurangan** — persis
  yang dikerjakan kertas kerja FRA.
- **Pasal 5 ayat (6)** — pelaksanaan tiap atribut diatur lebih lanjut lewat
  **pedoman**. Ini pintu masuknya: tidak perlu Perbup baru, cukup pedoman untuk
  atribut (c).
- **Pasal 6 dan 7** — lingkungan pengendalian kecurangan: komitmen pimpinan,
  budaya anti kecurangan, kebijakan dan prosedur.

Perbup itu juga yang menjadi sumber primer koreksi rujukan **UU Nomor 11 Tahun
2024 tentang Kabupaten Aceh Barat di Aceh** pada naskah Perbup Manajemen Risiko
kita — lihat [PERBUP_CATATAN_PEMBARUAN.md](PERBUP_CATATAN_PEMBARUAN.md).

## Temuan teknis yang paling menghemat pekerjaan

**Matriksnya sama persis dengan yang sudah ada di MR Kabar.** Dicocokkan antara
lembar `PR (Pedoman)` dan tabel `risk_matrix_cells`:

| | Kertas kerja FRA | MR Kabar |
|---|---|---|
| Bentuk | 5 × 5, peringkat 1–25 | 5 × 5, peringkat 1–25 |
| Dampak 5 × Kemungkinan 1 | **20** | **20** |
| Dampak 1 × Kemungkinan 5 | **9** | **9** |

Bukan mirip — sama tabelnya. Seluruh mesin analisis MR Kabar (`RiskMatrixCell`,
pemilih matriks, peta risiko 5×5 pada Dasbor) dapat dipakai ulang tanpa diubah.

**Tetapi batas levelnya berbeda satu angka:**

| Level | Kertas kerja FRA | MR Kabar |
|---|---|---|
| Sedang | 12 – 15 | **11** – 15 |
| Rendah | 6 – **11** | 6 – 10 |

Skor **11** jatuh ke kelas yang berbeda. Kecil, tetapi kalau dibiarkan, satu
risiko yang sama berlevel "Sedang" di satu berkas dan "Rendah" di berkas lain.
Perlu diputuskan mana yang dipakai; karena `risk_levels` sudah berupa data yang
dapat disunting Admin, memperbaikinya hanya soal mengubah satu angka.

## Yang berbeda secara mendasar

**Jangkarnya** — dan inilah alasan utama ia harus menjadi modul tersendiri, bukan
tambahan pada IRS/IRO:

- MR Kabar menautkan setiap risiko ke hierarki perencanaan: Visi → Misi → Tujuan
  → Sasaran → Program → Kegiatan.
- FRA menautkan setiap risiko ke **Tahapan Proses**: Perencanaan, Pengadaan
  Barang/Jasa, Pelaksanaan, Pertanggungjawaban.

Memaksa FRA masuk ke IRO berarti memaksa risiko kecurangan menggantung pada satu
Kegiatan tertentu, padahal "mark up HPS" adalah risiko **prosesnya**, bukan risiko
satu kegiatan.

**Kriteria dampaknya.** MR Kabar memakai rupiah absolut (< Rp 10 juta sampai >
Rp 500 juta). FRA memakai **persentase anggaran non-belanja-pegawai pada unit
pemilik risiko** (≤ 0,01% sampai > 1%). Dua tangga berbeda, keduanya sah di
tempatnya.

**Ada dimensi yang tidak dikenal MR Kabar** — kolom **Kelompok Risiko**:
perbuatan curang, kerugian keuangan negara/daerah, benturan kepentingan.

**Entitasnya lebih luas.** Tabel `opd` hanya memuat 49 SKPK; Perbup 6/2025
mencakup BUMD, BLUD, dan Gampong.

## Padanan lembar kerja

| Lembar FRA | Padanan di MR Kabar | Perlu dibangun? |
|---|---|---|
| `IR` Identifikasi Risiko | IRS/IRO | baru, polanya sama |
| `AR` Analisis Risiko | analisis inheren → residual | baru, mesin skoring dipakai ulang |
| `RTP` | Rencana Tindak Pengendalian | baru, strukturnya nyaris identik |
| `RR` Register Risiko | tabel gabungan | turunan, bukan masukan |
| `PR Dinas` Peta Risiko | peta risiko 5×5 Dasbor | **pakai ulang apa adanya** |
| `PR (Pedoman)` | matriks + `risk_levels` | **sudah ada** |
| `Referensi MCP 2025` | mirip Jenis Risiko / Keterangan Pendukung | tabel referensi baru, 14 area MCP KPK |

Yang dapat dipakai ulang tanpa dibangun ulang: autentikasi, peran, 49 akun PIC,
Tahun Aktif, soft-delete berikut menu Data Terhapus, log aktivitas, Form Cetak
lewat Browsershot, unggah bukti, ekspor/impor Excel, dan seluruh mesin matriks.

## Empat keputusan yang menunggu

1. **Satu aplikasi atau dua.** Menu tersendiri di dalam MR Kabar masuk akal
   karena Perbup 6/2025 sendiri menyebut pengendalian kecurangan "melengkapi
   sistem pengendalian intern yang ada". Tetapi bila pemiliknya berbeda,
   pemisahan aplikasi bisa lebih bersih.
2. **Siapa pemiliknya.** Perbup menyebut **satuan tugas pengendalian
   kecurangan** — struktur yang berbeda dari UPR. Selama satgasnya belum
   dibentuk, modulnya akan kosong.
3. **Skor 11 masuk Sedang atau Rendah.**
4. **Apakah BUMD, BLUD, dan Gampong ikut.** Bila ya, daftar entitas melampaui 49
   SKPK dan itu mengubah bentuk manajemen akun.

## Kalau nanti dikerjakan, mulai dari sini

Lembar **`Referensi MCP 2025`** — 14 area rawan menurut KPK: pemberian hibah,
bansos, PBJ, pemilihan penyedia, pelayanan Dukcapil, perizinan, perencanaan
pembangunan, penyusunan dan implementasi anggaran, manajemen ASN, dan
seterusnya. Ini satu-satunya bagian yang berguna **bahkan sebelum satgasnya
terbentuk**, sebab langsung dapat dibaca pimpinan sebagai daftar area rawan.
