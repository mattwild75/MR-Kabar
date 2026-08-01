# Penyusun Naskah Hukum Manajemen Risiko

Skrip Python yang membangun keempat naskah hukum pendamping MR Kabar sebagai
berkas `.docx` utuh — bukan menyuntingnya, melainkan menghasilkannya dari nol
setiap kali dijalankan.

**Folder ini sebelumnya berada di direktori sementara sesi kerja.** Dipindahkan
ke repositori pada 1 Agustus 2026 karena naskah Perbup masih akan direvisi
beberapa kali, dan direktori sementara bisa hilang kapan saja tanpa peringatan.

## Keluarannya

Semuanya ditulis langsung ke `Desktop\MR Kabar`, kertas F4 (216 × 330 mm),
Bookman Old Style 12 pt:

| Perintah | Menghasilkan |
|---|---|
| `python naskah.py` | Peraturan Bupati — Pedoman Penerapan Manajemen Risiko (2026), 82 halaman, 11 BAB, 55 Pasal, Lampiran I–XVIII |
| `python buat_sk.py` | Keputusan Bupati — Struktur Pengelola Risiko Tahun 2025 **dan** 2026 |
| `python buat_se.py` | Surat Edaran — Arahan dan Kebijakan Penilaian Risiko 2025 dan 2026 |

Nomor peraturan, tanggal, nomor Berita Daerah, dan penanda tangan pengundangan
**sengaja dikosongkan** — itu wewenang Bagian Hukum pada saat penetapan.

## Berkasnya

| | |
|---|---|
| `inti.py` | pembentuk OOXML: gaya, `sectPr`, tabel, gambar, penomoran |
| `naskah.py` | seluruh isi Perbup, 137 KB |
| `gambar.py`, `gambar2.py` + `render.cjs`, `render2.cjs` | 14 ilustrasi berwarna lewat Chromium |
| `*.json` | data referensi: 41 Jenis Risiko, Entitas Penilai, kriteria, contoh terisi |
| `gambar/*.jpeg` | hasil render ilustrasi, dipakai langsung oleh `naskah.py` |
| `periksa.ps1`, `periksa.py` | pemeriksaan naskah lewat Word COM |

Berkas `tambah_*.py`, `lengkapi_*.py`, dan `perbaiki_*.py` adalah penambal
sekali-jalan yang dipakai saat naskah dibangun bertahap. Seluruh hasilnya sudah
menyatu ke dalam `naskah.py`, jadi **tidak perlu dijalankan lagi** — disimpan
hanya sebagai jejak bagaimana tiap bagian sampai berbunyi seperti sekarang.

## Yang perlu diketahui sebelum mengubah

- **Nomor Pasal ditulis tangan**, bukan dihitung otomatis: ada 55 panggilan
  `pasal(N)`. Menyisipkan Pasal baru berarti menomori ulang seluruh Pasal
  sesudahnya **dan** membetulkan 17 rujukan silang berbentuk teks biasa
  ("sebagaimana dimaksud dalam Pasal N"). Satu rujukan lagi menunjuk peraturan
  lain dan tidak boleh ikut digeser.
- **Penomoran gambar dan tabel memakai medan SEQ**, jadi menyisipkan gambar atau
  tabel baru tidak merusak penomoran berikutnya.
- **Jalur data relatif ke folder ini.** `Path(__file__).parent` — sempat menunjuk
  satu tingkat di atasnya sewaktu masih di direktori sementara.
- **Periksa ulang setiap kali dibangun:** penomoran Pasal berurutan tanpa
  lompatan, tiap Lampiran dirujuk dari batang tubuh dan ditutup tepat satu tanda
  tangan, tidak ada rumusan pengertian yang tidak pernah dipakai, tidak ada tabel
  melampaui lebar teks, dan tanda baca daftar huruf mengikuti kaidah (butir tengah
  titik koma, butir kedua terakhir "; dan" atau "; atau", butir terakhir titik).

## Catatan keadaan naskah

Ada di [`../docs/PERBUP_CATATAN_PEMBARUAN.md`](../docs/PERBUP_CATATAN_PEMBARUAN.md):
dasar hukum yang sudah diverifikasi, isian yang sengaja dikosongkan, dan tujuh
tahap pembaruan yang direncanakan.
