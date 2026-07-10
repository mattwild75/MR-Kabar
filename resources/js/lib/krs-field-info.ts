// Transkrip teks MsgBox dari VBA (I_a_KRS_Pemda) — ditampilkan sebagai info
// popover di samping label tiap field pada form Tambah/Edit Data.
export const KRS_FIELD_INFO: Record<string, string> = {
  VISI: `Definisi: Gambaran umum dan ideal tentang kondisi masa depan daerah yang ingin diwujudkan oleh Kepala Daerah dalam periode 5 tahun.

Fungsi: Menjadi arah pembangunan daerah, pedoman seluruh program/kebijakan SKPD/OPD.

Contoh: "Terwujudnya Kabupaten X yang Maju, Mandiri, dan Sejahtera Berkelanjutan".

Bila tidak ada maka kosongkan saja (dengan acuan: dokumen RPD).`,

  MISI: `Definisi: Penjabaran visi dalam bentuk langkah-langkah strategis yang lebih operasional.

Fungsi: Menjadi dasar perumusan tujuan, sasaran, dan strategi pembangunan.

Contoh:
1. Meningkatkan kualitas SDM melalui pendidikan dan kesehatan.
2. Membangun infrastruktur daerah yang merata.
3. Meningkatkan perekonomian berbasis potensi lokal.

Bila tidak ada maka kosongkan saja (dengan acuan: dokumen RPD).`,

  'TUJUAN RPJMD': `Definisi: Hasil akhir yang ingin dicapai dalam periode RPJMD (5 tahun) berdasarkan visi dan misi.

Fungsi: Menjadi pedoman capaian pembangunan yang jelas dan terukur.

Contoh:
Meningkatnya kualitas layanan pendidikan.
Meningkatnya daya saing ekonomi daerah.
Meningkatnya kualitas infrastruktur wilayah.`,

  'IK TUJUAN RPJMD': `Definisi: Ukuran keberhasilan pencapaian tujuan pembangunan daerah yang ditetapkan dalam RPJMD.

Fungsi: Menjadi "alat ukur" apakah tujuan pembangunan (yang masih bersifat umum) benar-benar tercapai.

Contoh:
Tujuan: Meningkatkan kualitas hidup masyarakat.
IK Tujuan: Angka Harapan Hidup (AHH).

Jika ada lebih dari 1 indikator, tulis satu indikator per baris (tekan Shift+Enter untuk baris baru), contoh:
Angka Harapan Hidup (AHH)
Indeks Pembangunan Manusia (IPM)

Urutan baris harus sama dengan urutan baris di Baseline/Target/Satuan IK Tujuan (baris ke-1 harus pasangan, baris ke-2 harus pasangan, dst). Jika salah satu indikator tidak punya nilai di Baseline/Target/Satuan, kosongkan barisnya saja (jangan digeser) supaya pasangannya tetap sejajar.`,

  'BASELINE IK TUJUAN RPJMD': `Definisi: Nilai awal dari indikator kinerja pada tahun pertama penyusunan RPJMD (kondisi eksisting sebelum intervensi program pembangunan).

Fungsi: Menjadi titik tolak untuk mengukur kemajuan.

Contoh:
AHH pada tahun awal RPJMD = 70 tahun => inilah baseline.

Jika ada lebih dari 1 nilai IK, tulis satu nilai per baris (Shift+Enter) sesuai urutan baris di IK Tujuan, contoh:
70
75

Baris harus sejajar dengan IK Tujuan yang bersangkutan — kosongkan barisnya (bukan menghapus barisnya) jika IK tersebut tidak punya baseline.`,

  'TARGET IK TUJUAN RPJMD': `Definisi: Nilai yang ingin dicapai pada akhir periode RPJMD (tahun ke-5).

Fungsi: Menjadi tolok ukur keberhasilan pembangunan jangka menengah.

Contoh:
Target AHH = 72 tahun pada akhir masa RPJMD. => inilah target.

Jika ada lebih dari 1 nilai IK, tulis satu nilai per baris (Shift+Enter) sesuai urutan baris di IK Tujuan, contoh:
72
70

Baris harus sejajar dengan IK Tujuan yang bersangkutan — kosongkan barisnya (bukan menghapus barisnya) jika IK tersebut tidak punya target.`,

  'SATUAN IK TUJUAN RPJMD': `Definisi: Unit ukuran yang digunakan untuk indikator, agar jelas cara mengukurnya.

Contoh:
AHH => Tahun. => inilah satuan IKnya.

Jika ada lebih dari 1 nilai satuan IK, tulis satu nilai per baris (Shift+Enter) sesuai urutan baris di IK Tujuan, contoh:
Tahun
Persen

Baris harus sejajar dengan IK Tujuan yang bersangkutan.`,

  'OPD IK TUJUAN RPJMD': `Definisi: Perangkat Daerah (OPD/SKPK/Dinas) yang bertanggung jawab atas capaian indikator Tujuan tersebut — berbeda dari OPD Penanggungjawab Program (yang melaksanakan Program, bukan mengampu indikator Tujuan).

Contoh:
IK Tujuan: Angka Harapan Hidup (AHH) => OPD: Dinas Kesehatan.

Jika ada lebih dari 1 nilai IK, tulis satu OPD per baris (Shift+Enter) sesuai urutan baris di IK Tujuan, contoh:
Dinas Kesehatan
Dinas Pendidikan dan Kebudayaan

Baris harus sejajar dengan IK Tujuan yang bersangkutan — kosongkan barisnya (bukan menghapus barisnya) jika IK tersebut tidak punya OPD.`,

  'SASARAN RPJMD': `Definisi: Hasil yang lebih spesifik, kuantitatif, dan dapat diukur dari tujuan pembangunan.

Fungsi: Menjadi indikator utama keberhasilan pembangunan.

Contoh:
Meningkatnya Angka Harapan Hidup.
Menurunnya Tingkat kemiskinan.`,

  'IK SASARAN RPJMD': `Definisi: Ukuran keberhasilan pencapaian sasaran pembangunan daerah (lebih spesifik dibanding tujuan).

Fungsi: Menjadi indikator untuk mengukur seberapa jauh sasaran pembangunan dapat diwujudkan.

Contoh:
Sasaran: Meningkatnya akses dan mutu pelayanan pendidikan.
IK Sasaran: Angka Partisipasi Murni (APM) SMP.

Jika ada lebih dari 1 indikator, tulis satu indikator per baris (tekan Shift+Enter untuk baris baru), contoh:
Angka Partisipasi Murni (APM) SMP
Angka Kematian Ibu (per 100.000 kelahiran hidup)

Urutan baris harus sama dengan urutan baris di Baseline/Target/Satuan IK Sasaran (baris ke-1 harus pasangan, baris ke-2 harus pasangan, dst). Jika salah satu indikator tidak punya nilai di Baseline/Target/Satuan, kosongkan barisnya saja (jangan digeser) supaya pasangannya tetap sejajar.`,

  'BASELINE IK SASARAN RPJMD': `Definisi: Nilai awal indikator kinerja sasaran pada tahun pertama penyusunan RPJMD.

Fungsi: Menjadi acuan kondisi awal sebelum ada intervensi pembangunan.

Contoh:
APM SMP pada tahun awal = 85% => inilah baseline.

Jika ada lebih dari 1 nilai IK, tulis satu nilai per baris (Shift+Enter) sesuai urutan baris di IK Sasaran, contoh:
85
70

Baris harus sejajar dengan IK Sasaran yang bersangkutan — kosongkan barisnya (bukan menghapus barisnya) jika IK tersebut tidak punya baseline.`,

  'TARGET IK SASARAN RPJMD': `Definisi: Nilai indikator yang ingin dicapai pada akhir periode RPJMD (tahun ke-5).

Fungsi: Menjadi tolok ukur capaian sasaran yang terukur dan realistis.

Contoh:
Target APM SMP = 95% di akhir periode RPJMD. => inilah target.

Jika ada lebih dari 1 nilai IK, tulis satu nilai per baris (Shift+Enter) sesuai urutan baris di IK Sasaran, contoh:
90
80

Baris harus sejajar dengan IK Sasaran yang bersangkutan — kosongkan barisnya (bukan menghapus barisnya) jika IK tersebut tidak punya target.`,

  'SATUAN IK SASARAN RPJMD': `Definisi: Unit ukuran indikator kinerja sasaran.

Contoh:
APM SMP => % => inilah satuan IKnya.

Jika ada lebih dari 1 nilai satuan IK, tulis satu nilai per baris (Shift+Enter) sesuai urutan baris di IK Sasaran, contoh:
Persen
Tahun

Baris harus sejajar dengan IK Sasaran yang bersangkutan.`,

  'OPD IK SASARAN RPJMD': `Definisi: Perangkat Daerah (OPD/SKPK/Dinas) yang bertanggung jawab atas capaian indikator Sasaran tersebut — berbeda dari OPD Penanggungjawab Program.

Contoh:
IK Sasaran: Angka Partisipasi Murni (APM) SMP => OPD: Dinas Pendidikan dan Kebudayaan.

Jika ada lebih dari 1 nilai IK, tulis satu OPD per baris (Shift+Enter) sesuai urutan baris di IK Sasaran, contoh:
Dinas Pendidikan dan Kebudayaan
Dinas Kesehatan

Baris harus sejajar dengan IK Sasaran yang bersangkutan — kosongkan barisnya (bukan menghapus barisnya) jika IK tersebut tidak punya OPD.`,

  'PROGRAM PRIORITAS': `Definisi: Program utama yang dipilih dari sekian banyak program, yang dianggap paling strategis untuk mewujudkan visi-misi.

Fungsi: Menjadi fokus penggunaan anggaran daerah dan dasar penyusunan RKPD tahunan.

Contoh:
Program pengentasan kemiskinan terpadu.`,

  'OUTCOME PROGRAM PRIORITAS': `Definisi: Dampak atau hasil nyata dari pelaksanaan program prioritas terhadap masyarakat/daerah.

Fungsi: Mengukur keberhasilan bukan hanya dari output (misalnya jumlah sekolah dibangun), tetapi juga dari manfaat (misalnya meningkatnya angka partisipasi sekolah).

Contoh:
Kemiskinan menurun secara signifikan.
Akses pendidikan dan kesehatan lebih merata.

Jika ada lebih dari 1 outcome, tulis satu outcome per baris (tekan Shift+Enter untuk baris baru), contoh:
Kemiskinan menurun secara signifikan
Akses pendidikan dan kesehatan lebih merata`,

  'IK PROGRAM': `Definisi: Ukuran keberhasilan pencapaian dari program prioritas Kepala Daerah dalam RPJMD.

Fungsi: Menunjukkan sejauh mana program prioritas berdampak nyata bagi masyarakat.

Contoh:
Program Prioritas: Peningkatan Akses dan Mutu Pendidikan.
IK Program Prioritas: Persentase APK (Angka Partisipasi Kasar) SMA.

Jika ada lebih dari 1 indikator, tulis satu indikator per baris (tekan Shift+Enter untuk baris baru), contoh:
Angka Partisipasi Murni (APM) SMP
Persentase APK (Angka Partisipasi Kasar) SMA

Urutan baris harus sama dengan urutan baris di Baseline/Target/Satuan IK Program (baris ke-1 harus pasangan, baris ke-2 harus pasangan, dst). Jika salah satu indikator tidak punya nilai di Baseline/Target/Satuan, kosongkan barisnya saja (jangan digeser) supaya pasangannya tetap sejajar.`,

  'BASELINE IK PROGRAM': `Definisi: Nilai awal indikator program prioritas pada tahun pertama RPJMD.

Fungsi: Menjadi acuan awal sebelum program dilaksanakan.

Contoh:
APK SMA pada tahun awal = 78% => inilah baseline.

Jika ada lebih dari 1 nilai IK, tulis satu nilai per baris (Shift+Enter) sesuai urutan baris di IK Program, contoh:
78
90

Baris harus sejajar dengan IK Program yang bersangkutan — kosongkan barisnya (bukan menghapus barisnya) jika IK tersebut tidak punya baseline.

Catatan untuk Program yang dijalankan lebih dari 1 OPD: baris di sini juga harus sejajar dengan urutan baris OPD di field OPD Penanggungjawab Program (baris ke-1 = OPD ke-1, dst).`,

  'TARGET IK PROGRAM': `Definisi: Nilai capaian indikator program prioritas yang diharapkan pada akhir periode RPJMD (tahun ke-5).

Fungsi: Tolok ukur keberhasilan pelaksanaan program prioritas.

Contoh:
Target APK SMA = 90% pada tahun akhir RPJMD. => inilah target.

Jika ada lebih dari 1 nilai IK, tulis satu nilai per baris (Shift+Enter) sesuai urutan baris di IK Program, contoh:
90
80

Baris harus sejajar dengan IK Program yang bersangkutan — kosongkan barisnya (bukan menghapus barisnya) jika IK tersebut tidak punya target.

Catatan untuk Program yang dijalankan lebih dari 1 OPD: baris di sini juga harus sejajar dengan urutan baris OPD di field OPD Penanggungjawab Program (baris ke-1 = OPD ke-1, dst).`,

  'SATUAN IK PROGRAM': `Definisi: Unit ukuran indikator yang dipakai agar jelas dan konsisten.

Contoh:
APK SMA => % => inilah satuan IKnya.

Jika ada lebih dari 1 nilai satuan IK, tulis satu nilai per baris (Shift+Enter) sesuai urutan baris di IK Program, contoh:
Persen
Tahun

Baris harus sejajar dengan IK Program yang bersangkutan.

Catatan untuk Program yang dijalankan lebih dari 1 OPD: baris di sini juga harus sejajar dengan urutan baris OPD di field OPD Penanggungjawab Program (baris ke-1 = OPD ke-1, dst).`,

  'OPD PENANGGUNGJAWAB PROGRAM': `Definisi: Perangkat Daerah (OPD/SKPK/Dinas) yang bertanggung jawab melaksanakan dan mencapai target program prioritas.

Fungsi: Memberikan kejelasan siapa yang harus memastikan program berjalan & target tercapai.

Contoh:
Program Peningkatan Akses Pendidikan => Dinas Pendidikan

Jika program dilaksanakan lebih dari 1 OPD (masing-masing dengan baseline/target/satuan sendiri), tulis satu OPD per baris (Shift+Enter untuk baris baru) — urutannya harus sejajar dengan baris Baseline/Target/Satuan IK Program, contoh:
DINAS PENDIDIKAN
DINAS PENDIDIKAN DAYAH`,
};
