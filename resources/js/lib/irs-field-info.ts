// Transkrip teks MsgBox dari VBA (I_a_IRS_Pemda / I_b_IRS_Pemda) — ditampilkan
// sebagai info popover di samping label tiap field pada form Tambah/Edit Data.
export const IRS_FIELD_INFO: Record<string, string> = {
  'SASARAN RPJMD': `Definisi: Sasaran RPJMD adalah hasil spesifik yang ingin dicapai pemerintah kabupaten dalam periode 5 tahun.

Fungsinya dalam Risiko Strategis: Menjadi objek yang dilindungi => karena risiko muncul ketika ada ancaman terhadap tercapainya sasaran.

Setiap sasaran harus dianalisis apakah ada potensi hambatan, ancaman, atau ketidakpastian yang bisa menggagalkan pencapaiannya.`,

  'URAIAN RISIKO': `Definisi: Penjelasan mengenai peristiwa atau kondisi yang berpotensi menghambat tercapainya sasaran RPJMD.

Fungsinya dalam Risiko Strategis: Menjelaskan apa risikonya, bagaimana risikonya terjadi, dan dampaknya terhadap sasaran.
Menjadi dasar untuk menyusun langkah mitigasi/pengendalian risiko.

Contoh:
Perlambatan ekonomi nasional yang menyebabkan bertambahnya pengangguran

Jika ada lebih dari 1 uraian risiko, maka ditulis juga sel dibawahnya, dengan contoh:
Perlambatan ekonomi nasional yang menyebabkan bertambahnya pengangguran
Rendahnya keterampilan tenaga kerja lokal sehingga sulit bersaing`,

  'TAHUN DINILAI RISIKO': `Isi Dengan Tahun Identifikasi Risiko (cukup 2 digit tahun terakhir)`,

  'JENIS RISIKO': `Pilih Jenis Risiko dari daftar 41 kode urusan pemerintahan (lihat tombol daftar di samping field).`,

  'ENTITAS PD YANG MENILAI': `Pilih Entitas Perangkat Daerah yang menilai risiko dari daftar instansi (lihat tombol daftar di samping field).`,

  'NOMOR URUT RISIKO': `Isi Dengan Nomor Urut Penilaian Risiko (otomatis)`,

  'PEMILIK RISIKO': `Definisi: Pihak/lembaga yang secara formal memiliki kewenangan dan tanggung jawab utama terhadap risiko.

Level Kabupaten: biasanya Bupati/Wakil Bupati atau perangkat daerah utama (Bappeda, Inspektorat) sebagai penanggung jawab koordinasi risiko.

Fungsi: memastikan risiko dikelola sampai tuntas.

Contoh:
Risiko gagal mencapai target kemiskinan => Pemilik Risiko: Pemerintah Kabupaten (di bawah Bupati).`,

  'URAIAN PENYEBAB RISIKO': `Definisi: Faktor langsung atau kondisi yang memunculkan risiko.

Fungsi: menjelaskan akar masalah.

Contoh:
Anggaran penanggulangan kemiskinan terbatas, Data kemiskinan tidak akurat.

Jika ada lebih dari 1 penyebab risiko, maka ditulis juga sel dibawahnya, dengan contoh:
Anggaran penanggulangan kemiskinan terbatas
Data kemiskinan tidak akurat`,

  'SUMBER SEBAB RISIKO': `Definisi: Kategori asal penyebab risiko (Internal, Eksternal, atau Internal dan Eksternal), diikuti uraian singkat penyebabnya dalam tanda kurung.

Contoh:
Eksternal (Kebijakan Pusat Berubah)
Internal (SDM Kurang Memahami)
Eksternal dan Internal (Adanya serangan siber dari pihak luar (eksternal) yang berhasil membobol data perusahaan karena lemahnya sistem keamanan server (internal), sehingga menurunkan kepercayaan konsumen)`,

  'C / UC': `Definisi: Klasifikasi apakah risiko dapat dikendalikan (Controllable/C) atau tidak dapat dikendalikan (Uncontrollable/UC) oleh Perangkat Daerah, diikuti uraian singkat alasannya dalam tanda kurung.

Cara mengisi: pilih C atau UC lewat tombol, lalu tulis alasannya di kotak uraian.

Contoh:
C (Keterlambatan verifikasi data PMKS dapat diatasi dengan menambah petugas verifikator dan menetapkan SLA internal, sepenuhnya berada dalam kendali Dinas Sosial)
UC (Krisis ekonomi global dan kenaikan harga bahan pokok berada di luar kendali Pemerintah Daerah, hanya bisa diantisipasi dampaknya melalui program bantuan sosial)`,

  'URAIAN DAMPAK RISIKO': `Definisi: Deskripsi konsekuensi/efek bila risiko terjadi.

Contoh:
Target penurunan kemiskinan tidak tercapai, menurunkan kepercayaan publik, menambah beban APBD.

Jika ada lebih dari 1 dampak risiko, maka ditulis juga sel dibawahnya, dengan contoh:
Target penurunan kemiskinan tidak tercapai
Menurunkan kepercayaan publik
Menambah beban APBD`,

  'PIHAK YANG TERKENA DAMPAK RISIKO': `Definisi: Stakeholder yang akan terdampak langsung atau tidak langsung jika risiko terjadi.

Contoh:
Masyarakat miskin => tidak mendapat manfaat program, Dunia usaha => daya beli masyarakat turun, Pemerintah Daerah => reputasi menurun

Jika ada lebih dari 1 pihak yang terkena dampak risiko, maka ditulis juga sel dibawahnya, dengan contoh:
Masyarakat
Dunia usaha
Pemerintah Daerah`,

  'URAIAN PENGENDALIAN YANG SUDAH ADA': `Definisi: Langkah-langkah mitigasi yang sudah dijalankan sebelum identifikasi risiko dilakukan.

Contoh:
Program bansos, pelatihan keterampilan kerja, pemberdayaan UMKM.

Jika ada lebih dari 1 mitigasi yang sudah dijalankan sebelum identifikasi risiko dilakukan, maka ditulis juga sel dibawahnya, dengan contoh:
Program bansos
Pelatihan keterampilan kerja
Pemberdayaan UMKM`,

  'CELAH PENGENDALIAN': `Definisi: Kelemahan atau kekurangan dalam pengendalian yang ada saat ini.

Contoh:
Bansos belum tepat sasaran, Data kemiskinan belum terintegrasi, Koordinasi antar-OPD masih lemah

Jika ada lebih dari 1 kelemahan pengendalian yang sudah ada, maka ditulis juga sel dibawahnya, dengan contoh:
Bansos belum tepat sasaran
Data kemiskinan belum terintegrasi
Koordinasi antar-OPD masih lemah`,

  'RENCANA TINDAK PENGENDALIAN': `Definisi: Aksi tambahan yang direncanakan untuk menutup celah pengendalian risiko.

Contoh:
Integrasi database kemiskinan berbasis NIK, Peningkatan kapasitas aparat desa dalam validasi data, Kolaborasi dengan dunia usaha untuk penciptaan lapangan kerja

Jika ada lebih dari 1 RTP / Aksi Tambahan penutup celah pengendalian risiko, maka ditulis juga sel dibawahnya, dengan contoh:
Integrasi database kemiskinan berbasis NIK
Peningkatan kapasitas aparat desa dalam validasi data
Kolaborasi dengan dunia usaha untuk penciptaan lapangan kerja`,

  'PEMILIK / PENANGGUNGJAWAB': `Definisi: Pihak yang bertugas melaksanakan rencana tindak pengendalian (bisa berbeda dengan Pemilik Risiko).

Contoh:
Dinas Sosial => validasi data kemiskinan, Dinas Tenaga Kerja => program pelatihan kerja, Bappeda => integrasi lintas-OPD

Jika ada lebih dari 1 Pihak yang bertugas melaksanakan RTP, maka ditulis juga sel dibawahnya, dengan contoh:
Dinas Sosial
Dinas Tenaga Kerja
Bappeda`,

  'TRIWULAN': `Definisi: Triwulan target selesainya rencana tindak pengendalian risiko, agar risiko bisa diminimalkan.

Cara mengisi: pilih salah satu dari 4 pilihan (Triwulan I s.d. IV), lengkap dengan bulan yang tercakup di dalamnya.

Diisi bersama TAHUN TARGET PENYELESAIAN di samping — mis. Triwulan II 2026 berarti target selesai antara April-Juni 2026.`,

  'TAHUN TARGET PENYELESAIAN': `Definisi: Tahun target selesainya rencana tindak pengendalian risiko, dipasangkan dengan TRIWULAN di samping.

Cara mengisi: ketik angka tahun (mis. 2026).`,

  'SKALA DAMPAK': `Pilih level Dampak (1-5) sesuai tabel Kriteria Dampak (lihat tombol referensi di samping field).`,

  'SKALA KEMUNGKINAN': `Pilih level Kemungkinan (1-5) sesuai tabel Kriteria Kemungkinan (lihat tombol referensi di samping field).`,
};
