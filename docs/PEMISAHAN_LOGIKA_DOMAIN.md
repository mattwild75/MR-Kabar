# Pemisahan Logika Domain dari Controller (temuan audit R-16)

Diukur 11 September 2026. Dokumen ini bukan rencana muluk — ia daftar urutan
kerja yang bisa dicicil satu controller per rilis, masing-masing dengan tes
yang sudah ada sebagai jaring pengaman.

## Keadaan sekarang

| Ukuran | Nilai |
| --- | --- |
| Jumlah controller | 80 |
| Total baris controller | 21.390 |
| Layanan (`app/Services`) yang sudah ada | 13 |

Dua belas controller terberat menampung **hampir separuh** seluruh baris:

| Controller | Baris | Yang sebenarnya ada di dalamnya |
| --- | ---: | --- |
| CetakRisikoController | 1.174 | perakitan data cetak 10 form — kandidat `CetakRisikoService` |
| ~~DashboardController~~ | ~~1.082~~ → 103 | **SELESAI 12 Sep 2026** — 16 pembangun widget kini di `DasborService` (1.006 baris) |
| BackupController | 1.066 | git, snapshot, pemulihan — sebagian sudah di `VersiSnapshotService` |
| CeeFormController | 949 | penilaian 8 unsur, simpulan — kandidat `CeeSimpulanService` |
| KrsPemdaController | 818 | hierarki + impor Excel (3 controller KRS/KRO nyaris identik) |
| MonitoringEvaluasiController | 809 | skor target/aktual, efektivitas |
| KrsPdController | 787 | duplikat pola KrsPemda |
| KroPdController | 772 | duplikat pola KrsPemda |
| Pkpt/CetakPkptController | 644 | sebagian sudah di `PkptPerhitunganService` |
| CetakLaporanController | 609 | narasi Form 11–13 |
| ProgramBupatiRisikoController | 594 | pengaitan risiko ↔ program |
| KaeresRoController | 482 | — |

## Yang sudah benar, dan menjadi contoh

Modul yang dibangun sesudah audit **tidak** mengulangi polanya:

- **MR Fraud**: besaran/level risiko ada di model (`FraudRisiko::besaran()`),
  bukan di controller; pembersih metadata foto adalah layanan
  (`PembersihMetadataGambar`); penurunan `opd_id` adalah trait bersama
  (`MemetakanPemilikKeOpd`) yang dipakai tiga layanan sinkronisasi.
- **Penjaga akses OPD** sudah tunggal (`MembatasiAksesOpd`) — temuan R-10.
- **PKPT**: perhitungan di `PkptPerhitunganService`, kesiapan di
  `PkptKesiapanService`.

Pola yang dipakai: controller menerima permintaan, memvalidasi, memanggil
satu layanan, dan mengembalikan tampilan. Aturan bisnis hidup di layanan atau
model, dan diuji di sana.

## Urutan yang disarankan, dan alasannya

Bukan dari yang terbesar, tapi dari yang **paling sering berubah dan paling
banyak duplikatnya** — di situ pemisahan langsung mengurangi pekerjaan:

1. **KrsPemda / KrsPd / KroPd** (2.377 baris, tiga salinan satu pola).
   Satu `HierarkiRisikoService` menggantikan tiga — perbaikan hierarki
   berikutnya cukup di satu tempat. Tes jaring pengaman: `PeriksaHierarkiTest`,
   tes impor Excel.
2. ~~**DashboardController**~~ — **selesai 12 September 2026.** 16 `build*()`
   pindah ke `DasborService`; controller tinggal 103 baris (`scopedOpdId` dan
   perangkaian). Diverifikasi: 325 tes lulus, dan JSON prop Inertia
   `/dashboard` untuk tiga kombinasi tahun/OPD identik byte-per-byte
   sebelum/sesudah. Irisan berikutnya: `CetakLaporanController::
   buildProgresTahapan` dan `ProgramBupatiRisikoController::collectRiskRows`
   masih menyalin logika yang sama — buat keduanya memanggil layanan ini.
3. **CetakRisikoController** — perakitan data cetak; hasilnya harus identik
   byte-per-byte dengan sekarang (uji dengan membandingkan JSON prop Inertia
   sebelum/sesudah).
4. **CeeFormController** — aturan simpulan "Memadai/Kurang Memadai" tersebar
   di controller DAN seeder; satukan ke `CeeSimpulanService`. Tes:
   `CeeSimpulanBertentanganTest`.

Sisanya menyusul dengan pola yang sama. Satu controller per rilis, tes lulus
sebelum dan sesudah, tidak ada perubahan perilaku yang disengaja di rilis
yang sama dengan pemisahannya.

## Cara mengukur kemajuannya

```bash
find app/Http/Controllers -name "*.php" -exec cat {} + | wc -l   # turun tiap rilis
ls app/Services | wc -l                                          # naik
```

Angka awal: **21.390** baris controller, **13** layanan.

| Tanggal | Baris controller | Layanan | Catatan |
| --- | ---: | ---: | --- |
| 11 Sep 2026 | 21.390 | 13 | awal |
| 12 Sep 2026 | 20.948 | 14 | DashboardController → DasborService (−979); sementara itu masuk modul RPP/ERPIKA (+~1.100) |
