# Konvensi Penamaan Kolom

Skema database aplikasi ini memakai TIGA gaya penamaan kolom berbeda tergantung asal-usul tabelnya. Tidak konsisten secara historis (warisan migrasi dari sheet Excel/VBA asli), tapi konvensinya PREDIKTIF per kelompok tabel — dicatat di sini supaya tidak perlu ditelusuri ulang tiap kali.

## 1. "SPASI DAN KAPITAL" — tabel risiko utama (sumber input form)

Tabel: `tbl_irs_pemda`, `tbl_irs_pd`, `tbl_iro_pd`, `tbl_krs_pemda`, `tbl_krs_pd`, `tbl_kro_pd`.

Nama kolom persis meniru header kolom di sheet Excel/VBA asli, termasuk spasi dan huruf kapital penuh — contoh: `'URAIAN RISIKO'`, `'SKALA DAMPAK'`, `'TAHUN DINILAI RISIKO'`, `'C / UC'`. Wajib diakses dengan tanda kutip di query (`->where('TAHUN DINILAI RISIKO', ...)`) dan sebagai string literal di PHP/TS (`$row->{'URAIAN RISIKO'}`), TIDAK bisa jadi nama properti biasa.

## 2. `SNAKE_CASE_KAPITAL` dengan underscore — tabel derivatif/diagram

Tabel: `tbl_krs_irs_pemda`, `tbl_krs_irs_pd`, `tbl_kro_iro_pd` (dibangun ulang penuh oleh `KrsIrsSyncService`/`KrsIrsPdSyncService`/`KroIroPdSyncService` lewat TRUNCATE + rebuild dari tabel gaya #1).

Sama kapitalnya dengan gaya #1, tapi spasi diganti underscore — contoh: `TAHUN_DINILAI_RISIKO`, `JENIS_RISIKO`, `SASARAN_RPJMD`. Perhatikan tipe datanya TIDAK seragam antar tabel meski nama kolomnya identik — mis. `TAHUN_DINILAI_RISIKO` adalah `int` di `tbl_krs_irs_pemda` tapi `text` di `tbl_krs_irs_pd`/`tbl_kro_iro_pd` (index pada kolom `text` ini WAJIB pakai key-length eksplisit, lihat migrasi `add_missing_indexes_to_derived_and_cee_tables`).

## 3. `snake_case` standar Laravel — tabel infrastruktur/pendukung

Semua tabel lain (users, opd, cee_*, monitoring_rtp, pencatatan_kejadian_risiko, risk_reference_*, dll) memakai `snake_case` biasa sesuai konvensi Eloquent default.

## Kenapa tidak dimigrasi jadi seragam?

Gaya #1 & #2 sengaja DIPERTAHANKAN sesuai riwayat sheet Excel/VBA asli (memudahkan audit lintas-sistem terhadap dokumen sumber dan pemetaan Lampiran Perdep PPKD No.4/2019), bukan oversight — jangan "diperbaiki" jadi snake_case tanpa keputusan eksplisit, karena akan memutus kecocokan nama kolom dengan referensi dokumen aslinya.
