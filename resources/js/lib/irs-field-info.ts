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

  'PEMILIK RISIKO': `Definisi: Unit Pemilik Risiko (UPR) — unit organisasi yang bertanggung jawab melakukan pengelolaan risiko di lingkup kerjanya (Perdep Bab II.B.4), BERBEDA dari "Penanggung Jawab" yang sifatnya tunggal/strategis (selalu Kepala Daerah).

UPR berjenjang sesuai level organisasi (Perdep Lampiran 2 — Struktur Pengelolaan Risiko):
- UPR Tingkat Pemerintah Daerah => Ketua: Kepala Daerah; Koordinator: Kepala Bappeda; Anggota: seluruh Kepala OPD (termasuk Sekda)
- UPR Tingkat Eselon 1 (khusus provinsi) => Ketua: Sekretaris Daerah Provinsi; Koordinator: Kepala Biro Perencanaan Setda
- UPR Tingkat Eselon 2 => Ketua: Sekretaris Daerah (kabupaten/kota) / Kepala OPD lain
- UPR Tingkat Eselon 3/4 => Kepala Bidang, Kasubbag/Kasi

PENTING utk baris TINGKAT RISIKO="Risiko Strategis Pemda": Pemilik Risiko HARUS SELALU Bupati/Wali Kota/Gubernur (Ketua UPR Tingkat Pemda) — Kepala OPD (Inspektur, Direktur RSUD, Kepala Dinas, dst) hanya "Anggota" di jenjang ini, BUKAN Pemilik Risiko formal, meski mereka sumber/domain teknis risikonya. Jangan isi Kepala OPD di kolom ini kalau TINGKAT RISIKO-nya Strategis Pemda.

Fungsi: melaksanakan penilaian risiko, melaporkan peristiwa risiko, menyusun hasil penilaian risiko, serta monitoring pengendalian di unit kerjanya masing-masing — sifatnya operasional, bukan sekadar kebijakan.

Contoh (level Pemda): Risiko gagal mencapai target kemiskinan => Pemilik Risiko: Bupati (Ketua UPR Tingkat Pemda) — WAJIB Bupati krn TINGKAT RISIKO-nya Strategis Pemda, bukan Kepala Dinas Sosial meski risiko ini domain teknisnya di sana.
Contoh (level OPD): Risiko keterlambatan proyek fisik => Pemilik Risiko: Kepala Dinas PUPR (UPR Tingkat Eselon 2).`,

  'URAIAN PENYEBAB RISIKO': `Definisi: Faktor langsung atau kondisi yang memunculkan risiko, diklasifikasikan memakai kerangka 5M (analisis akar masalah/fishbone) — boleh pilih lebih dari 1 kategori sekaligus kalau risikonya disebabkan gabungan beberapa faktor.

Kategori 5M:
- Machine (Mesin/Peralatan/Sistem): faktor penyebab dari sisi peralatan, mesin, atau sistem/aplikasi — mis. server sering down, alat kalibrasi rusak, aplikasi belum terintegrasi.
- Men (Manusia/SDM): faktor penyebab dari sisi kompetensi, jumlah, atau perilaku SDM — mis. kurangnya jumlah petugas, SDM belum terlatih, pemahaman regulasi rendah.
- Material (Bahan/Data/Dokumen): faktor penyebab dari sisi ketersediaan/kualitas bahan, data, atau dokumen — mis. data tidak akurat, dokumen sumber tidak lengkap.
- Method (Metode/Prosedur/Kebijakan): faktor penyebab dari sisi prosedur, SOP, atau kebijakan yang belum ada/belum memadai — mis. belum ada SOP baku, mekanisme koordinasi belum terjadwal.
- Money (Anggaran/Pembiayaan): faktor penyebab dari sisi ketersediaan/kecukupan anggaran — mis. anggaran terbatas, pencairan anggaran terlambat.

Cara mengisi: centang kategori 5M yang relevan (boleh lebih dari satu), lalu tulis uraian penyebabnya di kotak masing-masing kategori.

Contoh:
Money (Anggaran penanggulangan kemiskinan terbatas)
Material (Data kemiskinan tidak akurat)`,

  'SUMBER SEBAB RISIKO': `Definisi: Asal penyebab risiko — Internal, Eksternal, atau keduanya sekaligus (kalau kedua kotak diisi, otomatis tergabung jadi "Internal dan Eksternal") — diikuti uraian singkat penyebabnya dalam tanda kurung.

Cara mengisi: centang Internal dan/atau Eksternal sesuai asal penyebabnya, lalu tulis uraian di kotak masing-masing.

Contoh:
Eksternal (Kebijakan Pusat Berubah)
Internal (SDM Kurang Memahami)
Internal dan Eksternal (Lemahnya sistem keamanan server; Adanya serangan siber dari pihak luar)`,

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

  'KATEGORI EXISTING CONTROL': `Definisi: Penilaian efektivitas pengendalian yang sudah ada (existing control) di atas — Efektif (E), Kurang Efektif (KE), atau Tidak Efektif (TE).

Fungsi: Menjadi dasar pertimbangan seberapa besar risiko residual (sisa risiko) dibanding risiko inherent (risiko awal):
- Tidak Efektif (TE): risiko residual = risiko inherent (pengendalian dianggap tidak berfungsi sama sekali).
- Kurang Efektif (KE): risiko residual turun sedikit, masih ada Celah Pengendalian yang signifikan — wajib disusun Rencana Tindak Pengendalian (RTP).
- Efektif (E): risiko residual turun signifikan ke level rendah/dapat diterima.

Cara mengisi: pilih salah satu kategori, uraian penjelasan opsional.`,

  'CELAH PENGENDALIAN': `Definisi: Kelemahan atau kekurangan dalam pengendalian yang ada saat ini.

Contoh:
Bansos belum tepat sasaran, Data kemiskinan belum terintegrasi, Koordinasi antar-OPD masih lemah

Jika ada lebih dari 1 kelemahan pengendalian yang sudah ada, maka ditulis juga sel dibawahnya, dengan contoh:
Bansos belum tepat sasaran
Data kemiskinan belum terintegrasi
Koordinasi antar-OPD masih lemah`,

  'RENCANA TINDAK PENGENDALIAN': `Definisi: Aksi tambahan yang direncanakan untuk menutup celah pengendalian risiko.

Setiap RTP diklasifikasikan ke salah satu atau kombinasi dari 5 jenis respon risiko berikut:

1. Avoid (Menghindari) — Mengurangi kemungkinan: YA (hilang total) | Mengurangi dampak: YA (hilang total)
Tidak memulai/melanjutkan kegiatan sumber risiko → kemungkinan dan dampak sama-sama dihilangkan sepenuhnya, bukan sekadar dikurangi.

2. Abate (Mengubah/Mengurangi Kemungkinan) — Mengurangi kemungkinan: YA | Mengurangi dampak: TIDAK
Fokus murni ke frekuensi/kemungkinan terjadinya risiko — istilah lain: pencegahan (prevention).

3. Mitigate (Mengubah/Mengurangi Konsekuensi) — Mengurangi kemungkinan: TIDAK | Mengurangi dampak: YA
Fokus murni ke besarnya dampak jika risiko terjadi — istilah lain: penanggulangan.

4. Share/Transfer (Membagi/Mentransfer) — Mengurangi kemungkinan: TIDAK (probabilitas tetap sama) | Mengurangi dampak: YA (dibagi ke pihak lain)
Tidak mengubah probabilitas terjadinya risiko, tapi mengurangi beban dampak yang ditanggung sendiri — dampak "dipindahkan" sebagian/seluruhnya ke pihak lain (asuransi, kontrak, kemitraan).

5. Accept/Retain (Menerima) — Mengurangi kemungkinan: TIDAK | Mengurangi dampak: TIDAK
Tidak ada pengurangan apa pun — risiko (sisa) diterima apa adanya.

Catatan pedoman: "Abate dan Mitigate terkadang disebut dalam satu istilah, yaitu mengurangi risiko (reduce)." Keduanya bisa dikombinasikan pada satu RTP jika kegiatan pengendalian yang dirancang menyasar frekuensi maupun dampak sekaligus (secara parsial) — beda dari Avoid yang menghilangkan keduanya secara total.

Ringkasan memilih:
- RTP yang murni menyasar frekuensi/kemungkinan → Abate
- RTP yang murni menyasar besarnya dampak → Mitigate
- RTP yang menghilangkan keduanya secara total (hentikan sumber risiko) → Avoid
- RTP yang memindahkan beban dampak ke pihak eksternal tanpa mengubah kemungkinan → Share/Transfer
- Tidak ada tindakan tambahan, risiko residual diterima → Accept

Boleh pilih lebih dari 1 kategori sekaligus jika satu RTP dirancang mencakup lebih dari satu jenis respon (mis. kombinasi Abate + Mitigate).

Contoh:
Abate (Integrasi database kemiskinan berbasis NIK — mengurangi kemungkinan salah sasaran); Mitigate (Kolaborasi dengan dunia usaha untuk penciptaan lapangan kerja — mengurangi dampak kemiskinan jika target belum tercapai)`,

  'UNIT/OPD PENANGGUNG JAWAB PENGENDALIAN': `Definisi: Unit/OPD yang bertugas melaksanakan Rencana Tindak Pengendalian (RTP) di atas — istilah Perdep Form 6/7: "Penanggung Jawab Pengendalian yang Dibutuhkan".

PENTING — ini BUKAN "Pemilik Risiko" (field di atas). Pemilik Risiko (UPR) adalah unit yang bertanggung jawab atas risiko secara keseluruhan; field ini levelnya lebih teknis — spesifik per satu kontrol/RTP tertentu, bisa OPD yang berbeda dari Pemilik Risiko (mis. risiko dimiliki Dinas A, tapi RTP-nya dilaksanakan Dinas B).

Contoh:
Dinas Sosial => validasi data kemiskinan, Dinas Tenaga Kerja => program pelatihan kerja, Bappeda => integrasi lintas-OPD

Jika ada lebih dari 1 OPD yang bertugas melaksanakan RTP, maka ditulis juga sel dibawahnya, dengan contoh:
Dinas Sosial
Dinas Tenaga Kerja
Bappeda`,

  'PENANGGUNG JAWAB PENGENDALIAN': `Definisi: JABATAN/pejabat spesifik yang berkompeten, berwenang, dan terkait dalam membangun pengendalian tsb — istilah Perdep Bab III: "...terdiri dari pihak-pihak yang berkompeten, berwenang, dan terkait dalam membangun pengendalian, yaitu Kepala Bidang."

PENTING — ini BUKAN nama OPD (itu field "Unit/OPD Penanggung Jawab Pengendalian" di atas), tapi JABATAN orangnya. Perdep tidak mengatur jenjang baku antara level risiko dan jabatan Penanggung Jawab Pengendalian — ditetapkan sesuai siapa yang paling kompeten & berwenang membangun kontrol untuk risiko tsb (bisa Kepala Bidang, Kasubbag, Kepala OPD, dst, tergantung konteks kontrolnya).

KHUSUS Risiko Strategis Pemda: instrumen pengendaliannya (Perkada/Keputusan Kepala Daerah/SE Kepala Daerah) hanya bisa diterbitkan Kepala Daerah, jadi Penanggung Jawab Pengendalian di sini Bupati/Wali Kota SECARA DEFAULT — sah walau Pemilik Risiko-nya juga Bupati (Ketua UPR Tingkat Pemda), karena kewenangan menerbitkan kontrol level Pemda memang tunggal di Kepala Daerah.

Pengecualian: kalau ADA pendelegasian eksplisit dari Bupati ke OPD/koordinator teknis tertentu (mis. lewat Perkada struktur pengelolaan risiko atau SK penugasan khusus), field ini BOLEH diisi jabatan yang didelegasikan tsb — bukan berarti "kalau lebih relevan secara substansi boleh diisi Kepala OPD". Kalau kontrol suatu risiko ternyata cukup ditangani lintas-OPD tanpa perlu payung hukum Bupati sama sekali, itu sinyal TINGKAT RISIKO-nya salah klasifikasi (seharusnya Risiko Strategis OPD, bukan dipaksakan tetap Strategis Pemda dgn PJP Kepala OPD).

Catatan Sekda: Sekda punya 2 peran tetap yang terpisah dari field ini — "Koordinator Penyelenggaraan Pengelolaan Risiko Pemda" (melekat di semua konteks risiko) dan "Pemilik Risiko" (Ketua UPR Tingkat Eselon 1/2, khusus risiko OPD Setda sendiri). Perdep tidak menyebut Sekda sbg Penanggung Jawab Pengendalian secara eksplisit; namun peran Koordinator Penyelenggaraan bisa jadi dasar pendelegasian PJP ke Sekda untuk risiko Strategis Pemda yang sifatnya koordinasi lintas-OPD (bukan kebijakan/keputusan definitif).

Contoh:
Bupati (risiko Strategis Pemda, default), Sekretaris Daerah selaku Koordinator Penyelenggaraan (risiko Strategis Pemda, didelegasikan krn sifatnya koordinasi teknis), Kepala Bagian Hukum Sekretariat Daerah (risiko Strategis OPD Setda sendiri)`,

  'TRIWULAN': `Definisi: Triwulan target selesainya rencana tindak pengendalian risiko, agar risiko bisa diminimalkan.

Cara mengisi: pilih salah satu dari 4 pilihan (Triwulan I s.d. IV), lengkap dengan bulan yang tercakup di dalamnya.

Diisi bersama TAHUN TARGET PENYELESAIAN di samping — mis. Triwulan II 2026 berarti target selesai antara April-Juni 2026.`,

  'TAHUN TARGET PENYELESAIAN': `Definisi: Tahun target selesainya rencana tindak pengendalian risiko, dipasangkan dengan TRIWULAN di samping.

Cara mengisi: ketik angka tahun (mis. 2026).`,

  'SKALA DAMPAK': `Pilih level Dampak (1-5) sesuai tabel Kriteria Dampak (lihat tombol referensi di samping field).`,

  'SKALA KEMUNGKINAN': `Pilih level Kemungkinan (1-5) sesuai tabel Kriteria Kemungkinan (lihat tombol referensi di samping field).`,
};
