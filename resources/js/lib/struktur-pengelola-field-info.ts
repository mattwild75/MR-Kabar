/**
 * Keterangan bantuan untuk Struktur Pengelolaan Risiko — Perdep PPKD 4/2019
 * Lampiran 2 (contoh Keputusan Kepala Daerah tentang struktur pengelolaan
 * Risiko) dan Lampiran 3 yang menyebut susunannya.
 */
export const STRUKTUR_FIELD_INFO: Record<string, string> = {
  peran: `Definisi: Kedudukan dalam struktur pengelolaan Risiko menurut Perdep PPKD 4/2019.

Fungsi: Menentukan tugas dan hubungan pelaporannya. Peran ini juga dibaca aplikasi — blok tanda tangan Laporan 14 mengambil pejabat berperan Komite Pengelolaan Risiko dari tahun berjalan.

Cara mengisi: pilih peran baku yang tersedia. Perdep menyebut susunannya sebagai Unit Pemilik Risiko berjenjang, Koordinator Penyelenggaraan, Komite Pengelolaan Risiko, Unit Kepatuhan, dan Penanggung Jawab Pengawasan.

Contoh: Koordinator Penyelenggaraan Pengelolaan Risiko untuk Sekretaris Daerah; Penanggung Jawab Pengawasan untuk Inspektur.`,

  kedudukan: `Definisi: Kedudukan seseorang DI DALAM satu peran — Ketua, Koordinator merangkap anggota, atau Anggota.

Fungsi: Perdep PPKD 4/2019 Lampiran 2 menyebut Unit Pemilik Risiko dan Komite Pengelolaan Risiko sebagai TIM, bukan jabatan tunggal. Contohnya Unit Pemilik Risiko Tingkat Pemerintah Daerah: Bupati sebagai ketua, Kepala Bappeda sebagai koordinator merangkap anggota, dan seluruh Kepala Perangkat Daerah sebagai anggota. Kedudukan inilah yang membuat bagan struktur menampilkan tim lengkap, bukan satu kotak untuk seluruh tingkatan.

Cara mengisi: pilih "Tanpa kedudukan" untuk peran yang memang dipangku satu orang — Koordinator Penyelenggaraan, Unit Kepatuhan, dan Penanggung Jawab Pengawasan. Untuk Unit Pemilik Risiko dan Komite, tambahkan satu baris untuk tiap kedudukan.

Catatan yang mudah terlewat: Komite Pengelolaan Risiko DIKETUAI Bupati sendiri, bukan pejabat lain — dan Kepala Bappeda memegang kedudukan koordinator di dua tempat sekaligus, yaitu pada Unit Pemilik Risiko Tingkat Pemerintah Daerah dan pada Komite.`,

  jabatan: `Definisi: Jabatan yang memangku peran ini.

Fungsi: Menjadi isi kolom Pejabat pada naskah cetak, dan bertahan meski pejabatnya berganti.

Cara mengisi: tuliskan nama jabatan sesuai struktur organisasi yang berlaku, bukan singkatan internal.

Contoh: "Sekretaris Daerah Kabupaten Aceh Barat", "Inspektur Kabupaten Aceh Barat", "Asisten Sekretaris Daerah Kabupaten Aceh Barat".`,

  nama: `Definisi: Nama pejabat yang sedang memangku jabatan tersebut pada tahun ini.

Fungsi: Melengkapi naskah cetak dan blok tanda tangan.

Cara mengisi: KOSONGKAN bila jabatannya sedang lowong atau pejabatnya belum diketahui — naskah tetap dapat dicetak dengan jabatannya saja. Jangan diisi nama perkiraan.

Contoh: nama lengkap beserta gelar sebagaimana tertulis pada Keputusan pengangkatannya.`,

  opd: `Definisi: Perangkat Daerah tempat peran ini melekat.

Fungsi: Membedakan peran tingkat Pemerintah Daerah dari peran yang melekat pada satu Perangkat Daerah tertentu.

Cara mengisi: pilih "Tingkat Pemerintah Daerah" untuk Bupati, Sekretaris Daerah, Komite, Unit Kepatuhan, dan Inspektur. Pilih Perangkat Daerah tertentu hanya bila peran itu memang khusus di sana.

Contoh: Unit Pemilik Risiko Tingkat Eselon II pada Dinas Kesehatan.`,

  tugas: `Definisi: Uraian tugas peran ini dalam pengelolaan Risiko.

Fungsi: Menjadi dasar penagihan tanggung jawab. Tanpa uraian tugas, struktur hanya berupa daftar nama yang tidak mengikat apa pun.

Cara mengisi: salin dari Peraturan Bupati atau Keputusan Bupati yang menetapkan struktur ini. Tulis satu tugas per baris agar terbaca rapi saat dicetak.

Contoh untuk Komite Pengelolaan Risiko menurut Perdep: merumuskan kebijakan dan arahan; melakukan pembinaan berupa sosialisasi, bimbingan, supervisi, dan pelatihan; membuat laporan semesteran dan tahunan kegiatan pembinaan kepada Bupati melalui Sekretaris Daerah; serta menjadi fasilitator yang memandu proses penilaian Risiko.`,

  tahun: `Definisi: Tahun keberlakuan susunan ini.

Fungsi: Susunan disimpan per tahun karena berubah mengikuti mutasi jabatan. Naskah cetak tahun lalu tetap memuat pejabat yang benar pada saat itu.

Cara mengisi: pilih tahun pada pemilih di atas. Untuk tahun baru, gunakan tombol "Salin dari Tahun Sebelumnya" lalu perbarui nama yang berpindah — mengetik ulang seluruh peran berikut tugasnya hanya mengundang salah ketik.`,
};
