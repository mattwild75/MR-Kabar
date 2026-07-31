/**
 * Keterangan bantuan untuk Arahan dan Kebijakan Penilaian Risiko beserta
 * tahapannya — Perdep PPKD 4/2019 Lampiran 3 (5 tahunan) dan Lampiran 4
 * (1 tahunan).
 *
 * Bentuknya mengikuti berkas field-info lain: Definisi, Fungsi, Cara mengisi,
 * lalu Contoh — supaya pembaca menemukan susunan yang sama di seluruh
 * aplikasi.
 */
export const ARAHAN_FIELD_INFO: Record<string, string> = {
  jenis: `Definisi: Jenis arahan menurut Perdep PPKD 4/2019 — Lampiran 3 memuat contoh Arahan 5 Tahunan, Lampiran 4 memuat contoh Arahan 1 Tahunan.

Fungsi: Membedakan cakupan waktunya. Arahan 5 Tahunan mengikuti periode RPJMD dan menetapkan urusan serta Perangkat Daerah mana yang dinilai selama satu periode. Arahan 1 Tahunan mengikuti siklus anggaran dan memuat tanggal pelaksanaan yang konkret.

Cara mengisi: pilih 5 Tahunan untuk arahan yang terbit sekali di awal periode RPJMD; pilih 1 Tahunan untuk arahan yang terbit tiap tahun mengikuti penyusunan RKA.

Contoh: Arahan 1 Tahunan Tahun 2025 yang menetapkan penilaian Risiko Operasional dilakukan 3 sampai 14 Oktober setelah RKA Perangkat Daerah disusun.`,

  periode: `Definisi: Rentang tahun keberlakuan arahan ini.

Fungsi: Menentukan pada tahun mana jadwal ini muncul di Dasbor. Widget jadwal hanya menampilkan arahan yang mencakup tahun yang sedang dilihat.

Cara mengisi: untuk arahan 1 tahunan, isi Tahun Mulai dan Tahun Selesai dengan tahun yang sama. Untuk arahan 5 tahunan, isi sesuai periode RPJMD.

Contoh: 2025 sampai 2025 untuk arahan tahunan; 2025 sampai 2029 untuk arahan lima tahunan.`,

  surat_edaran: `Definisi: Nomor dan tanggal Surat Edaran Bupati yang menetapkan arahan ini.

Fungsi: Menjadi rujukan resmi saat jadwal ditagihkan kepada Perangkat Daerah — tanpa nomor SE, jadwal hanya rancangan yang belum mengikat siapa pun.

Cara mengisi: kosongkan selama Surat Edaran belum terbit, lalu isi setelah ditetapkan Bupati. Boleh menyimpan arahan berstatus Draf lebih dulu tanpa nomor.

Contoh: SE-700/123/2025 tanggal 15 September 2025.`,

  status: `Definisi: Keadaan arahan — Draf selama masih disusun, Berlaku setelah ditetapkan Bupati.

Fungsi: HANYA arahan berstatus Berlaku yang dibaca widget jadwal di Dasbor. Arahan Draf sengaja tidak menagih siapa pun, sebab menagih Perangkat Daerah atas sesuatu yang belum ditetapkan Bupati sama saja dengan mengarang jadwal.

Cara mengisi: biarkan Draf selama naskah masih dibahas. Ubah ke Berlaku setelah Surat Edaran ditandatangani.

Contoh: satu arahan Berlaku untuk tahun berjalan, dan satu arahan Draf untuk tahun depan yang sedang disusun.`,

  tahapan: `Definisi: Satu langkah penyelenggaraan penilaian Risiko beserta tenggatnya.

Fungsi: Menjadi sumber data jadwal pada Dasbor. Tiap tahapan ditampilkan dengan keadaannya — belum waktunya, sedang berjalan, atau tenggat terlampaui — sehingga seluruh Perangkat Daerah melihat tenggat yang sama.

Cara mengisi: tuliskan tahapan sebagaimana disebut dalam Surat Edaran, bukan istilah internal aplikasi.

Contoh: "Penilaian Risiko Operasional Perangkat Daerah", "Penilaian Lingkungan Pengendalian (CEE) Form 1a sampai 1d".`,

  dokumen_pemicu: `Definisi: Dokumen perencanaan yang menjadi pemicu dimulainya tahapan ini.

Fungsi: Perdep menyatakan tenggat penilaian Risiko relatif terhadap dokumen perencanaan, bukan terhadap tanggal kalender semata — misalnya "selambat-lambatnya dua minggu setelah RKA Perangkat Daerah disusun". Kolom ini yang merekam kaitan tersebut.

Cara mengisi: sebutkan nama dokumennya saja, tanpa nomor.

Contoh: RKA Perangkat Daerah, Renstra Perangkat Daerah, RPJMD Kabupaten Aceh Barat, Renja Perangkat Daerah.`,

  tenggat: `Definisi: Tanggal mulai dan tanggal selesai tahapan.

Fungsi: Menentukan keadaan tahapan pada widget jadwal. Hari terakhir tenggat masih terhitung berjalan, baru esoknya terhitung terlampaui — supaya tenggat yang ditetapkan Bupati tidak terpangkas sehari.

Cara mengisi: tanggal selesai tidak boleh mendahului tanggal mulai; kalau dibalik, tahapan itu akan selamanya berkeadaan terlambat sejak hari pertama. Boleh dikosongkan bila tahapan belum berjadwal — keadaannya akan tertulis "Tanpa tenggat".

Contoh: 3 Oktober 2025 sampai 14 Oktober 2025, mengikuti contoh pada Perdep.`,

  pelaksana: `Definisi: Pihak yang menjalankan tahapan ini.

Fungsi: Menjelaskan kepada siapa tenggat itu ditujukan, sehingga Perangkat Daerah tahu tahapan mana yang menjadi tanggung jawabnya.

Cara mengisi: sebutkan jabatan atau satuan kerjanya, bukan nama orang — susunan pejabat berubah, sedangkan arahan berlaku setahun penuh.

Contoh: "Seluruh Perangkat Daerah, difasilitasi Inspektorat"; "Sekretaris Daerah selaku Koordinator Penyelenggaraan".`,

  keluaran: `Definisi: Hasil yang harus ada setelah tahapan ini selesai.

Fungsi: Membuat tahapan dapat dinilai selesai atau belum berdasarkan dokumen yang benar-benar terwujud, bukan berdasarkan kesan.

Cara mengisi: sebutkan nama dokumen atau formulirnya.

Contoh: "Register Risiko Operasional Perangkat Daerah", "Dokumen RTP Form 6 dan Form 7", "Laporan Penilaian Maturitas SPIP".`,
};
