# Kesesuaian MR Kabar dengan Perdep PPKD 4/2019

Uji ulang 1 Agustus 2026, dibandingkan langsung ke berkas Perdep dan ke satu
pemerintah daerah pembanding.

**Rujukan halaman memakai LABEL PDF**, bukan urutan fisik. Berkas Perdep
memasang label yang mengulang penomoran dari 1 pada halaman fisik ke-21, dan
pembaca PDF menampilkan label itu.

| Yang dibandingkan | Sumber |
|---|---|
| Perdep PPKD BPKP Nomor 4 Tahun 2019 | berkas PDF asli, 173 halaman |
| Peraturan Wali Kota Cilegon Nomor 2 Tahun 2022 | berkas PDF asli, 74 halaman |
| Formulir aplikasi | 14 Form Cetak yang berjalan |
| Matriks dan level | tabel `risk_matrix_cells` dan `risk_levels` |

## 1. Formulir — sepadan satu-satu

Lampiran 8 Perdep (label 150) memuat alur kertas kerja. Seluruhnya ada di
aplikasi, dengan penomoran yang sama:

| Perdep | Aplikasi |
|---|---|
| Form 1a Survey CEE, 1b CEE Dokumen, 1c Simpulan CEE | menu CEE, Form Cetak 1a/1b/1c |
| Form 2a/2b/2c Penetapan Konteks | Form Cetak 2a/2b/2c |
| Form 3a/3b/3c Identifikasi Risiko | Form Cetak 3a/3b/3c |
| Form 4 Analisis Risiko | Form Cetak 4 |
| Form 5 Risiko Prioritas | Form Cetak 5 |
| Form 6 RTP CEE | Form Cetak 6 |
| Form 7 RTP atas Risiko | Form Cetak 7 |
| Form 8 Infokom | Form Cetak 8 |
| Form 9 Rencana dan Realisasi Kegiatan Pemantauan | Form Cetak 9 |
| Form 10 Risk Event dan Pelaksanaan RTP | Form Cetak 10 |

Ditambah empat laporan Bab IV sebagai Form 11 sampai 14. **Tidak ada formulir
Perdep yang belum ada di aplikasi.**

## 2. Matriks 5×5 — berbeda dari contoh Perdep pada 8 dari 25 sel

Perdep menyajikan matriksnya sebagai **gambar berwarna tanpa angka** (Tabel
2.12, label 23), dan menyebutnya **"Contoh"**. Angka peringkat 1–25 yang dipakai
aplikasi tidak berasal dari sana melainkan dari berkas Excel bermakro MR Kabar
yang lama — dan kebetulan sama persis dengan kertas kerja Fraud Risk Assessment
BPKP yang ada di folder MR Fraud.

Perbandingan kategorinya:

```
            D1        D2        D3        D4        D5
K5  app :  Rendah    Sedang    Tinggi    S.Tinggi  S.Tinggi
    perdep: Sedang   Tinggi    S.Tinggi  S.Tinggi  S.Tinggi
K4  app :  Rendah    Sedang    Tinggi    Tinggi    S.Tinggi
    perdep: Rendah   Sedang    Tinggi    S.Tinggi  S.Tinggi
K3  app :  S.Rendah  Rendah    Sedang    Tinggi    S.Tinggi
    perdep: Rendah   Sedang    Sedang    Tinggi    S.Tinggi
K2  app :  S.Rendah  Rendah    Sedang    Sedang    S.Tinggi
    perdep: S.Rendah Rendah    Sedang    Sedang    Tinggi
K1  app :  S.Rendah  S.Rendah  S.Rendah  Rendah    S.Tinggi
    perdep: S.Rendah S.Rendah  Rendah    Rendah    Sedang
```

Delapan sel berbeda, dan **selisihnya bukan acak melainkan berpola**:

- Aplikasi **lebih longgar** pada kemungkinan tinggi berdampak kecil.
- Aplikasi **jauh lebih keras** pada kemungkinan kecil berdampak besar. Sel yang
  paling menyolok K1×D5: aplikasi menilainya **Sangat Tinggi**, contoh Perdep
  menilainya **Sedang**.

Itu memang keputusan yang disengaja — matriks aplikasi membobot dampak lebih
besar daripada kemungkinan, dan video edukasi menjelaskannya terbuka. Yang perlu
disadari: **dasarnya bukan Tabel 2.12 Perdep.** Perdep sendiri membuka ruang itu
— label 23 menyebut kriteria "dapat mengacu pada Perka BPKP Nomor 688 Tahun
2012, Perka BPKP Nomor 10 Tahun 2013, serta Perka BPKP Nomor 24 Tahun 2013".

## 3. Selera Risiko — di sinilah aplikasi menyimpang, dan itu perlu diputuskan

Perdep menyebut batas penerimaan pada dua tempat, dan keduanya **tidak sama**:

**Label 23, Bab II** — sesudah Tabel 2.12:

> "…kategori sangat tinggi (merah) dan tinggi (*orange*) merupakan area yang
> memiliki sisa risiko yang membutuhkan penanganan dengan prioritas yang sangat
> tinggi (*unacceptable risk*). Selanjutnya, untuk **kategori moderat (kuning)
> menjadi prioritas berikutnya (*unacceptable risk*)**, sedangkan kategori rendah
> (biru) dan sangat rendah (hijau) merupakan risiko yang dapat ditoleransi dan
> diterima (*acceptable risk*)."

**Label 64, Bab III** — pada contoh terapan:

> "Dalam pedoman ini, risiko dengan kriteria 'sangat tinggi' dan 'tinggi' akan
> diprioritaskan untuk ditangani."

Perwal Cilegon 2/2022 halaman 37 menyalin kalimat kedua apa adanya.

Keduanya dapat didamaikan: **Moderat tetap tidak dapat diterima** dan wajib
ditangani, hanya prioritasnya di bawah Tinggi dan Sangat Tinggi.

**Setelan aplikasi sekarang berbeda dari itu.** `risk_levels.melampaui_selera`
hanya bernilai benar pada Tinggi dan Sangat Tinggi, sehingga **Sedang
diperlakukan sebagai dapat diterima** dan tidak wajib punya RTP.

Perdep membolehkan penyimpangan itu — kalimat pada label 23 sendiri berbunyi
"Penetapan area atau bidang yang menjadi risiko prioritas … **dipengaruhi oleh
selera risiko atau preferensi manajemen pemerintah daerah**", dan tabelnya
berjudul "Contoh". Tetapi penyimpangan yang dibolehkan tetap harus **disengaja
dan tercatat**, bukan terjadi begitu saja.

### Yang perlu diputuskan

Satu pilihan, dan pilihan itu milik Bupati selaku penetap Selera Risiko:

1. **Ikuti bawaan Perdep** — tandai Sedang sebagai melampaui selera, sehingga
   Sangat Tinggi, Tinggi, dan Sedang wajib punya RTP. Cukup satu centang pada
   Keterangan Pendukung; tidak ada kode yang perlu diubah.
2. **Pertahankan setelan sekarang** — Sedang dapat diterima. Sah, tetapi
   sebaiknya dituangkan sebagai keputusan Selera Risiko yang tertulis, bukan
   dibiarkan sebagai setelan bawaan aplikasi.

## 4. Ralat atas kesimpulan saya sendiri

Pada 1 Agustus 2026 pagi saya menyatakan kalimat video menit 13:15 — "Sangat
Tinggi, Tinggi, dan Moderat, ketiganya tidak bisa diterima" — **salah**.

**Pernyataan itu terlalu jauh.** Diukur dengan Perdep, kalimat itu justru sesuai:
label 23 memang menempatkan Moderat sebagai *unacceptable risk*. Yang benar
adalah kalimat itu **tidak lagi sesuai dengan setelan aplikasi**, bukan tidak
sesuai dengan Perdep.

Perbaikan video dan kuisnya sendiri tetap tepat, bahkan lebih tepat daripada
kalimat lama: keduanya kini menjelaskan bahwa batasnya **ditetapkan Pemerintah
Daerah sendiri** — dan itulah rumusan yang paling dekat dengan bunyi Perdep.
Yang keliru hanya cara saya menyebut kalimat lamanya.

## 5. Yang tidak diuji pada putaran ini

- Kriteria dampak lima dimensi dan kriteria kemungkinan belum dibandingkan
  angka per angka dengan Perka BPKP 688/2012, 10/2013, dan 24/2013 yang dirujuk
  Perdep. Ketiganya belum ada berkasnya.
- Kuesioner CEE 37 pertanyaan belum dicocokkan butir per butir dengan Lampiran
  Perdep.
- Empat belas halaman Perdep berupa pindaian tanpa lapisan teks (label 1, 6, 37,
  80, 81, 84, 86, 89, 130, 138, 143, 151–153) sehingga tidak dapat ditelusuri
  dengan pencarian kata; yang relevan dibaca sebagai gambar.
