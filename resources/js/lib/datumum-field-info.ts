// Teks info popover utk halaman Form Input "Data Umum" — mengikuti pola
// krs-field-info.ts. Data Umum menyimpan identitas kertas kerja & blok
// penanda tangan yang dipakai otomatis sebagai header/tanda tangan seluruh
// Form Cetak CEE dan Form Cetak Risiko 6/7.
export const DATUMUM_FIELD_INFO: Record<string, string> = {
  pemerintah_kabkota: `Definisi: Nama resmi lengkap Pemerintah Daerah (Provinsi/Kabupaten/Kota) yang sedang menilai risiko — field Pemda-wide (sama untuk seluruh OPD).

Fungsi: Dicetak di header seluruh Form Cetak (CEE 1a-1c, Risiko 2a-7) sebagai identitas "Nama Pemda" — memastikan seluruh laporan konsisten menyebut nama Pemda yang sama persis.

Cara mengisi: tulis nama resmi lengkap sesuai peraturan daerah, huruf kapital sesuai konvensi surat dinas.

Contoh: "PEMERINTAH KABUPATEN ACEH BARAT"`,

  nama_urusan: `Definisi: Nama urusan pemerintahan (wajib/pilihan) yang menaungi OPD ini, sesuai UU 23/2014 tentang Pemerintahan Daerah.

Fungsi: Dicetak sebagai identitas konteks pada header Form Cetak CEE, menunjukkan bidang urusan pemerintahan yang dinilai risikonya.

Cara mengisi: tulis nama urusan sesuai SOTK (Struktur Organisasi dan Tata Kerja) OPD ini.

Contoh: "Urusan Pemerintahan Bidang Kesehatan", "Unsur Staf Urusan Pemerintahan" (untuk Sekretariat Daerah)`,

  nama_sub_urusan: `Definisi: Nama sub-urusan/bidang spesifik di bawah Nama Urusan di atas, kalau OPD ini menangani sub-bidang tertentu.

Fungsi: Melengkapi identitas konteks pada header Form Cetak CEE, memberi rincian lebih spesifik dari Nama Urusan.

Cara mengisi: opsional — isi kalau OPD punya sub-bidang spesifik yang relevan, kosongkan kalau tidak ada.

Contoh: "Rehabilitasi dan Perlindungan Sosial", "Tata Kelola Pemerintahan"`,

  nama_dinas_opd: `Definisi: Nama resmi lengkap OPD (Organisasi Perangkat Daerah) yang identitasnya sedang diisi di halaman ini.

Fungsi: Dicetak sebagai "OPD/SKPK" pada header Form Cetak CEE & Risiko 6/7, dan dipakai sistem untuk mencocokkan Data Umum dengan OPD yang tepat.

Cara mengisi: tulis nama resmi OPD sesuai SOTK, huruf kapital.

Contoh: "DINAS SOSIAL", "INSPEKTORAT", "BLUD RSUD CUT NYAK DHIEN"`,

  periode_penilaian: `Definisi: Rentang tahun periode RPJMD/Renstra yang sedang berlaku — field Pemda-wide (sama untuk seluruh OPD, mengikuti periode RPJMD Pemda).

Fungsi: Dicetak sebagai "Periode yang Dinilai" pada header seluruh Form Cetak Risiko, menunjukkan cakupan waktu perencanaan strategis yang jadi acuan penilaian risiko.

Cara mengisi: tulis rentang tahun awal-akhir periode RPJMD/Renstra yang berlaku.

Contoh: "2025-2029"`,

  nama_kepala_daerah: `Definisi: Nama lengkap & gelar Kepala Daerah (Bupati/Wali Kota/Gubernur) yang menjabat — field Pemda-wide (sama untuk seluruh OPD).

Fungsi: Dicetak pada blok tanda tangan Form Cetak 2a (Konteks Strategis Pemda) dan Form 7 (RTP lintas-OPD, saat Admin belum memilih 1 OPD tertentu) — Kepala Daerah adalah pejabat politik terpilih sehingga TIDAK punya kolom NIP (berbeda dari Kepala OPD/ASN).

Cara mengisi: tulis nama lengkap sesuai gelar resmi, hanya Admin/Super Admin yang mengubah field ini akan memperbarui default untuk SELURUH OPD.

Contoh: "Tarmizi, S.P., M.M."`,

  jabatan_kepala_daerah: `Definisi: Sebutan jabatan resmi Kepala Daerah — field Pemda-wide (sama untuk seluruh OPD).

Fungsi: Dicetak sebagai label jabatan di atas nama Kepala Daerah pada blok tanda tangan Form Cetak 2a & 7.

Cara mengisi: tulis sesuai sebutan resmi jabatan.

Contoh: "Bupati Aceh Barat", "Wali Kota", "Gubernur"`,

  nama_kepala_dinas: `Definisi: Nama lengkap & gelar Kepala OPD (Kepala Dinas/Badan/Inspektur/Direktur RSUD, dst) yang menjabat di OPD ini — khusus OPD yang sedang diisi (bukan Pemda-wide).

Fungsi: Dicetak pada blok tanda tangan seluruh Form Cetak CEE (1a-1c) dan Form Cetak Risiko yang scope-nya per-OPD (2b, 2c, 6, dan 7 saat sudah dipilih 1 OPD) — juga otomatis jadi default kolom "Kepala OPD" pada Form 1c CEE (sinkron dua arah).

Cara mengisi: tulis nama lengkap sesuai gelar resmi.

Contoh: "Drs. Adami, M.M." (Kepala Dinas Sosial), "dr. Novita Sari, M.Kes." (Direktur RSUD)`,

  jabatan_kepala_dinas: `Definisi: Sebutan jabatan resmi Kepala OPD ini.

Fungsi: Dicetak sebagai label jabatan di atas nama Kepala OPD pada blok tanda tangan — juga dipakai otomatis mengisi kolom "Jabatan Kepala OPD" pada Form 1c CEE.

Cara mengisi: tulis sesuai sebutan resmi jabatan OPD ini.

Contoh: "Kepala Dinas Sosial", "Inspektur", "Direktur RSUD Cut Nyak Dhien", "Sekretaris Daerah" (untuk Sekretariat Daerah)`,

  nip_kepala_dinas: `Definisi: Nomor Induk Pegawai (NIP) Kepala OPD ini — Kepala OPD adalah ASN sehingga WAJIB punya NIP, berbeda dari Kepala Daerah (pejabat politik, tidak ada kolom NIP).

Fungsi: Dicetak di bawah nama Kepala OPD pada blok tanda tangan seluruh Form Cetak yang menampilkan tanda tangan Kepala OPD.

Cara mengisi: tulis NIP 18 digit sesuai SK kepegawaian, format dengan spasi per kelompok sesuai kebiasaan surat dinas.

Contoh: "19680312 199403 1 004"`,

  nama_pic: `Definisi: Nama lengkap PIC (Person In Charge) yang bertanggung jawab mengisi/menilai risiko untuk OPD ini di aplikasi MR Kabar.

Fungsi: Dicetak sebagai identitas pengisi pada beberapa Form Cetak, dan dipakai Admin/Super Admin (di Form Cetak 4/5 lintas-OPD) untuk menampilkan daftar seluruh PIC yang mengisi data per OPD.

Cara mengisi: tulis nama lengkap PIC yang sehari-hari mengoperasikan aplikasi untuk OPD ini.

Contoh: "Rahmawati, S.Sos."`,

  jabatan_pic: `Definisi: Sebutan jabatan resmi PIC Penilai Risiko di atas.

Fungsi: Melengkapi identitas PIC yang dicetak berdampingan dengan nama PIC.

Cara mengisi: tulis sesuai sebutan resmi jabatan PIC.

Contoh: "Kepala Subbagian Perencanaan"`,

  nip_pic: `Definisi: Nomor Induk Pegawai (NIP) PIC Penilai Risiko di atas.

Fungsi: Melengkapi identitas resmi PIC yang dicetak pada Form Cetak yang menampilkan data pengisi.

Cara mengisi: tulis NIP 18 digit sesuai SK kepegawaian.

Contoh: "19851004 201001 2 002"`,

  dokumen_sumber_rsp: `Definisi: Nama dokumen sumber yang menjadi dasar penilaian Risiko Strategis Pemda (RSP) — field Pemda-wide, ada nilai baku default tapi bisa ditimpa per-OPD bila perlu.

Fungsi: Dicetak sebagai baris "Sumber Data" pada header Form Cetak 3a (Identifikasi Risiko Strategis Pemda), menunjukkan dokumen perencanaan yang jadi acuan risiko strategis Pemda.

Cara mengisi: tulis nama dokumen perencanaan resmi yang relevan.

Contoh: "RPJMD"`,

  dokumen_sumber_rso: `Definisi: Nama dokumen sumber yang menjadi dasar penilaian Risiko Strategis OPD (RSO) — field Pemda-wide, ada nilai baku default tapi bisa ditimpa per-OPD bila perlu.

Fungsi: Dicetak sebagai baris "Sumber Data" pada header Form Cetak 3b (Identifikasi Risiko Strategis OPD).

Cara mengisi: tulis nama dokumen perencanaan resmi tingkat OPD yang relevan.

Contoh: "Renstra"`,

  dokumen_sumber_roo: `Definisi: Nama dokumen sumber yang menjadi dasar penilaian Risiko Operasional OPD (ROO) — field Pemda-wide, ada nilai baku default tapi bisa ditimpa per-OPD bila perlu.

Fungsi: Dicetak sebagai baris "Sumber Data" pada header Form Cetak 3c (Identifikasi Risiko Operasional OPD).

Cara mengisi: tulis nama dokumen perencanaan/penganggaran tahunan yang relevan, boleh lebih dari satu dipisah garis miring.

Contoh: "Renja/RKA/DPA"`,

  tempat_pembuatan: `Definisi: Nama tempat/kota diterbitkannya kertas kerja penilaian risiko ini — dipasangkan dengan Tanggal Pembuatan di bawah.

Fungsi: Dicetak bersama tanggal pada bagian atas blok tanda tangan (format lazim surat dinas: "Tempat, Tanggal") di seluruh Form Cetak CEE dan Form Cetak Risiko 6/7.

Cara mengisi: tulis nama kota/kabupaten tempat kertas kerja ini secara resmi diterbitkan.

Contoh: "Meulaboh"`,

  tanggal_pembuatan: `Definisi: Tanggal diterbitkannya/ditandatanganinya kertas kerja penilaian risiko ini — dipasangkan dengan Tempat Pembuatan di atas.

Fungsi: Dicetak bersama nama tempat pada bagian atas blok tanda tangan di seluruh Form Cetak CEE dan Form Cetak Risiko 6/7 — memberi tahu kapan dokumen ini sah diterbitkan.

Cara mengisi: pilih tanggal lewat kalender, sebaiknya sesuai tanggal riil dokumen ditandatangani (bukan tanggal input data).

Contoh: 13 Juli 2026`,

  penandatangan: `Definisi: Daftar penanda tangan TAMBAHAN (di luar Kepala Daerah & Kepala OPD di atas) yang tampil berjajar di kolom "tengah" blok tanda tangan Form Cetak 6 & 7 — mis. Sekretaris, beberapa Kepala Bidang. Kolom paling KANAN pada Form 6/7 SELALU Kepala OPD (dari field "Kepala Dinas SKPK/OPD" di atas), TIDAK perlu ditambahkan lagi di sini.

Fungsi: Mendukung kertas kerja yang butuh lebih dari satu tanda tangan pejabat (umum di dokumen RTP resmi Pemda) — jumlah baris bebas, boleh kosong (Form 6/7 tetap tercetak, hanya kolom Kepala OPD saja yang muncul).

Cara mengisi: klik "Tambah Penanda Tangan" untuk menambah baris, isi Jabatan-Nama-NIP tiap baris, urutan baris menentukan urutan tampil dari kiri ke kanan pada Form Cetak. Field ini juga tersinkron dua arah dengan Form 1c CEE — mengedit "Penyusun" di Form 1c otomatis menambah/memperbarui baris di sini berdasarkan kecocokan Jabatan, begitu pula sebaliknya.

Contoh: Baris 1: Jabatan "Sekretaris Dinas Sosial", Nama "Rahmawati, S.Sos.". Baris 2: Jabatan "Kepala Bidang Rehabilitasi Sosial", Nama "Yusniar, S.ST."`,
};
