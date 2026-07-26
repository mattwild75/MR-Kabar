# Rencana: MR Kabar sebagai Dasar Penyusunan PKPT Berbasis Risiko

Dokumen ini adalah **rencana**, bukan implementasi — belum ada kode yang diubah. Disusun berdasarkan pola metodologi PKPT Berbasis Risiko sesuai Keputusan Bupati Tangerang No.3/2026 (khususnya Bab IV & Tabel 4-5), dibandingkan dengan kondisi aktual MR Kabar per audit sebelumnya.

---

## 1. Kondisi Sekarang (Apa yang Sudah Ada di MR Kabar)

| Komponen | Status | Lokasi |
|---|---|---|
| Skor risiko per baris (Dampak × Kemungkinan, 1-25) | ✅ Ada | `IrsPemda`/`IrsPd`/`IroPd`, kolom `SKALA DAMPAK`/`SKALA KEMUNGKINAN`/`SKALA RISIKO` |
| Skor inheren vs residual vs target vs aktual | ✅ Ada | Sama seperti di atas + `RiskReferenceDataService::hitungSemuaSkala()` |
| Ranking OPD berdasar skor total risiko (Σ skala) | ✅ Ada (baru diperbaiki) | `DashboardController::buildRankingOpd()` — widget "Ranking Eksposur Risiko per OPD" |
| Kategori/jenis risiko (Strategis Pemda/OPD, Operasional) | ✅ Ada | `tipe` per baris di `collectRiskRows()` |
| Data Sasaran RPJMD per OPD (teks, bukan skor) | ✅ Ada | `KrsPemda.'SASARAN RPJMD'`, `KrsPd.'SASARAN RPJMD'` (rujukan) |
| Struktur Program/Kegiatan/Sub-Kegiatan | ✅ Ada | `KrsPemda`/`KrsPd`/`KroPd` |
| Riwayat multi-tahun risiko per OPD | ✅ Ada | `TAHUN DINILAI RISIKO` per baris, `buildTrenTahunan()` |
| **Field anggaran/nilai rupiah** | ❌ Tidak ada | — |
| **Skor signifikansi program terhadap RPJMD (1-5)** | ❌ Tidak ada (hanya teks rujukan, belum diskor) | — |
| **Data temuan audit & tindak lanjut** | ❌ Tidak ada (di luar domain aplikasi) | — |
| **Data isu terkini/sorotan publik** | ❌ Tidak ada | — |
| **Riwayat tahun terakhir diaudit per OPD** | ❌ Tidak ada | — |
| **Frekuensi pengawasan (output rekomendasi)** | ❌ Tidak ada | — |
| **Ekspor/cetak tabel skor PKPT gabungan** | ❌ Tidak ada | — |

**Kesimpulan posisi**: MR Kabar sudah mengcover **Risiko Bawaan/Inherent Risk** (bobot 70% pada metodologi Tangerang) dengan cukup baik. Yang sama sekali belum ada adalah **Faktor Pertimbangan Manajemen** (bobot 30%, pecah jadi 5 indikator berbobot) dan **tahap akhir penentuan Rank + Frekuensi Pengawasan** yang bisa dicetak sebagai lampiran PKPT.

---

## 2. Kesenjangan — Detail per Indikator (Tabel 4 Keputusan Bupati Tangerang)

| # | Indikator | Bobot | Ada di MR Kabar? | Sumber data yang dibutuhkan |
|---|---|---|---|---|
| 1 | % Anggaran (anggaran program vs anggaran belanja langsung APBD) | 25% | ❌ | Butuh field baru: nilai anggaran per Program/Kegiatan + total APBD |
| 2 | Program terkait sektor unggulan & RPJMD | 25% | Sebagian (teks ada, skor tidak) | Butuh: skor 1-5 keterkaitan + skor indikator kinerja OPD vs total kinerja Pemda |
| 3 | Temuan & tindak lanjut, potensi fraud, kasus hukum | 20% | ❌ | Di luar domain — butuh integrasi manual/impor dari sistem lain (atau input manual APIP) |
| 4 | Isu terkini terkait program | 15% | ❌ | Kualitatif — butuh input manual admin/APIP per periode PKPT |
| 5 | Pertimbangan lain (tahun terakhir diaudit, pengalaman APIP) | 15% | ❌ | Butuh field baru: riwayat tahun audit terakhir per OPD |

Catatan penting: indikator #3 dan #4 secara struktural **tidak bisa** diturunkan dari data manajemen risiko murni — itu domain sistem pengawasan (LHP, tindak lanjut temuan), yang **di luar cakupan MR Kabar** sebagai aplikasi manajemen risiko. Untuk kedua indikator ini, opsi realistis hanya:
- (a) Input manual per periode PKPT oleh admin/APIP (field skor 1-5 langsung, tanpa sumber data pendukung), atau
- (b) Integrasi ke sistem lain (di luar scope, butuh keputusan terpisah).

---

## 3. Input yang Perlu Ditambahkan

### 3.1. Field Anggaran (Indikator #1)

**Di mana**: level Program/Kegiatan (`KrsPemda`, `KrsPd`, `KroPd`) — BUKAN di level risiko (`IrsPemda`/`IrsPd`/`IroPd`), sesuai keputusan sebelumnya (satu Kegiatan bisa punya banyak risiko, anggaran melekat ke Kegiatan bukan ke tiap risiko).

**Field baru** (3 tabel, gaya penamaan mengikuti konvensi "SPASI DAN KAPITAL" existing sesuai docs/KONVENSI_PENAMAAN_KOLOM.md):
- `'ANGGARAN PROGRAM'` (decimal/bigint, rupiah) — di `KrsPemda`, `KrsPd`
- `'ANGGARAN KEGIATAN'` — di `KroPd` (basis Renja OPD per Kegiatan, sesuai catatan Perdep bahwa risiko operasional melekat ke Kegiatan)

**Tambahan**: satu angka referensi **"Total Anggaran Belanja Langsung APBD"** per tahun — disimpan di `PengaturanPemda` (tabel setting yang sudah ada, tambah kolom `anggaran_belanja_langsung`), karena ini angka tunggal per tahun (bukan per OPD), dipakai sebagai pembagi (`%Anggaran = anggaran_program / anggaran_belanja_langsung × 100%`).

**Siapa yang mengisi**: PIC OPD saat mengisi form KRS/KRO (field baru di Form Input), ATAU admin/Bappeda mengisi belakangan lewat halaman terpisah kalau datanya berasal dari dokumen RKA/DPA yang biasanya sudah difinalisasi terpisah dari proses assessment risiko.

### 3.2. Skor Signifikansi RPJMD (Indikator #2)

**Field baru**: `'SKOR SIGNIFIKANSI RPJMD'` (integer 1-5) di level Program (`KrsPemda`/`KrsPd`) — **bisa dihitung otomatis** dari kriteria Tabel 4 kolom "Program termasuk sektor unggulan daerah & mendukung RPJMD":
- Cek apakah field `'SASARAN RPJMD'` terisi/tidak kosong → kontribusi ke skor
- Bandingkan terhadap daftar "Sektor Unggulan Daerah" (perlu master data baru, lihat 3.3)
- Rasio "Indikator Kinerja OPD terhadap Total Indikator Kinerja Pemda" — bisa dihitung dari jumlah baris IK per OPD dibanding total IK seluruh OPD (data yang sudah ada)

Ini **satu-satunya indikator dari 5 yang punya potensi dihitung semi-otomatis** dari data existing + satu master data tambahan kecil.

**Master data baru dibutuhkan**: tabel `sektor_unggulan_daerah` (simple: `id`, `nama`, `tahun`) — diisi admin sesuai RPJMD/RKPD yang berlaku, dipakai untuk mencocokkan `PROGRAM PRIORITAS`/`PROGRAM PD` mana yang termasuk sektor unggulan.

### 3.3. Riwayat Audit & Frekuensi Pengawasan (Indikator #5 + Output)

**Field baru**: tabel kecil baru `riwayat_pengawasan_opd`:
- `opd_id`
- `tahun_terakhir_diaudit` (integer, nullable)
- `pengalaman_apip` (integer 1-5, skor manual — "SDM APIP sudah berapa kali melakukan penugasan sejenis")
- `tahun_penilaian` (untuk histori per periode PKPT)

**Siapa yang mengisi**: Admin/Inspektorat (bukan PIC OPD) — data ini murni domain Inspektorat, diisi manual tiap kali menyusun PKPT tahun berjalan.

### 3.4. Temuan & Fraud, Isu Terkini (Indikator #3, #4)

**Field baru minimal** (input manual per OPD per tahun PKPT, TANPA sumber data pendukung otomatis):
- `skor_temuan_tindak_lanjut` (1-5, manual)
- `skor_isu_terkini` (1-5, manual)
- Bisa digabung ke tabel `riwayat_pengawasan_opd` yang sama di atas.

Opsional (di luar scope awal): field teks `catatan_temuan`/`catatan_isu` untuk dokumentasi kualitatif alasan skor, supaya keputusan skor tidak "kotak hitam".

---

## 4. Alur Proses (Bagaimana Prosesnya)

```
┌─────────────────────────────────────────────────────────────┐
│  TAHAP 1: Data risiko (SUDAH ADA, tidak berubah)              │
│  PIC OPD isi Form 1-7 (IRS/IRO/KRS/KRO) → skor risiko per baris │
└───────────────────────────┬───────────────────────────────────┘
                             │
┌────────────────────────────▼───────────────────────────────────┐
│  TAHAP 2: Hitung Skor Inheren per Area Pengawasan (per OPD)      │
│  = rata2/total skala risiko OPD tsb, DIKALI bobot 70%            │
│  (sudah ada dasar formulanya di buildRankingOpd(), tinggal        │
│  disesuaikan jadi skala 1-5 spt Tabel 4, bukan skala 1-25 mentah) │
└────────────────────────────┬─────────────────────────────────────┘
                             │
┌────────────────────────────▼─────────────────────────────────────┐
│  TAHAP 3: Input Faktor Manajemen (bobot 30%, 5 indikator)          │
│  3a. %Anggaran         → OTOMATIS dari field anggaran baru (3.1)   │
│  3b. Signifikansi RPJMD → SEMI-OTOMATIS dari data existing (3.2)   │
│  3c. Temuan/Fraud       → MANUAL admin/Inspektorat (3.4)           │
│  3d. Isu Terkini        → MANUAL admin/Inspektorat (3.4)           │
│  3e. Pertimbangan lain  → MANUAL admin/Inspektorat (3.3)           │
└────────────────────────────┬───────────────────────────────────────┘
                             │
┌────────────────────────────▼───────────────────────────────────────┐
│  TAHAP 4: Gabungkan jadi Skor Total per OPD                          │
│  Skor = (Skor_Inheren × 70%) + (Σ Skor_Faktor_Manajemen_berbobot ×30%) │
│  → hasil skala 1-5, dipetakan ke label (Rendah/Sedang/Tinggi/dst)    │
└────────────────────────────┬───────────────────────────────────────┘
                             │
┌────────────────────────────▼───────────────────────────────────────┐
│  TAHAP 5: Ranking + Frekuensi Pengawasan                             │
│  Urutkan seluruh OPD (Rank), petakan skor → rekomendasi frekuensi    │
│  (mis. skor 21-25 → "1 tahun sekali", 1-5 → "2 s.d 3 tahun sekali")  │
│  sesuai contoh Tabel 5 kolom (21)                                    │
└────────────────────────────┬───────────────────────────────────────┘
                             │
┌────────────────────────────▼───────────────────────────────────────┐
│  TAHAP 6: Output — Tabel Prioritas Auditable Unit (cetak/ekspor)     │
│  Format serupa Tabel 5 Lampiran II Keputusan Bupati:                 │
│  No | Area Pengawasan | Level MR | Bobot Risiko Inheren | Anggaran   │
│  | Signifikansi RPJMD | Temuan/TL | Isu Terkini | Pertimb. Lain      │
│  | Nilai Faktor Risiko | Ket. | Rank | Frekuensi Pengawasan          │
└───────────────────────────────────────────────────────────────────┘
```

**Penanggung jawab tiap tahap**:
- Tahap 1-2: PIC OPD + sistem (otomatis, sudah berjalan)
- Tahap 3a-3b: sistem (otomatis/semi-otomatis dari data existing + field baru)
- Tahap 3c-3e: Admin/Inspektorat (input manual, sekali per periode penyusunan PKPT — biasanya tahunan)
- Tahap 4-6: sistem (otomatis, begitu semua input Tahap 3 lengkap)

---

## 5. Struktur Data yang Dibutuhkan (Ringkasan Migrasi)

| Tabel | Perubahan | Jenis |
|---|---|---|
| `tbl_krs_pemda`, `tbl_krs_pd` | + kolom `'ANGGARAN PROGRAM'` | Alter table |
| `tbl_kro_pd` | + kolom `'ANGGARAN KEGIATAN'` | Alter table |
| `settingapp` (PengaturanPemda) | + kolom `anggaran_belanja_langsung` | Alter table |
| `sektor_unggulan_daerah` (baru) | `id`, `nama`, `tahun`, timestamps | Tabel baru |
| `riwayat_pengawasan_opd` (baru) | `id`, `opd_id`, `tahun_penilaian`, `tahun_terakhir_diaudit`, `pengalaman_apip`, `skor_temuan_tindak_lanjut`, `skor_isu_terkini`, `catatan_temuan` (nullable), `catatan_isu` (nullable), timestamps | Tabel baru |

Semua tabel baru mengikuti konvensi `snake_case` standar (gaya #3 di docs/KONVENSI_PENAMAAN_KOLOM.md, karena ini murni tabel infrastruktur pendukung baru — bukan tiruan Excel/VBA asli).

---

## 6. Output Akhir

1. **Halaman/widget baru**: "Prioritas Pengawasan Berbasis Risiko" (nama sementara) — tabel seluruh OPD terurut Rank, menampilkan breakdown skor per indikator (mirip Tabel 5), dengan kolom Frekuensi Pengawasan rekomendasi.
2. **Form Cetak baru**: ekspor tabel di atas ke PDF/Excel, formatnya menyerupai Lampiran II Tabel 5 Keputusan Bupati — supaya bisa langsung dilampirkan sebagai draf/bahan penyusunan PKPT resmi Inspektorat.
3. **Halaman input baru** (admin/Inspektorat only): form untuk mengisi 5 indikator manual per OPD per periode PKPT (Tahap 3c-3e), dan skor sektor unggulan (3.3).

**Yang TIDAK dihasilkan otomatis** (perlu proses manual/keputusan Inspektorat tetap berlaku): dokumen final PKPT itu sendiri (Bab I-VI penuh sesuai Keputusan Bupati, termasuk penetapan Irban/wilayah pengawasan, jenis kegiatan pengawasan/audit/reviu/evaluasi, jumlah hari kerja, personil, dsb) — MR Kabar hanya menghasilkan **dasar penentuan prioritas objek pengawasan** (Bab IV dokumen contoh), bukan keseluruhan dokumen PKPT.

---

## 7. Urutan Pengerjaan yang Disarankan (jika nanti dieksekusi)

1. Field anggaran (3.1) — paling konkret, langsung berdampak ke 25% bobot terbesar.
2. Skor Signifikansi RPJMD (3.2) — semi-otomatis, memanfaatkan data yang sudah ada.
3. Tabel `riwayat_pengawasan_opd` + form input manual Admin (3.3, 3.4).
4. Formula gabungan Tahap 4-5 (backend service baru, mirip pola `RiskReferenceDataService`).
5. Widget tampilan (Tahap 6, bagian 1 di atas).
6. Form Cetak (Tahap 6, bagian 2) — paling akhir, karena formatnya baru stabil setelah widget teruji.
