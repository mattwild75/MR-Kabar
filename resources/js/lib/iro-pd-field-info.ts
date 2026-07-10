import { IRS_FIELD_INFO } from '@/lib/irs-field-info';

// Info popover untuk form Tambah/Edit III_b_IRO_PD — identik dengan
// IRS_FIELD_INFO (IRS_Pemda), dengan field pertama diganti ke terminologi
// Kegiatan PD (bukan Sasaran) dan tambahan field baru TAHAP yang tidak ada
// di level Strategis — sesuai Perdep PPKD No.4/2019 BPKP: objek risiko
// operasional adalah Kegiatan pada Renja OPD, bukan Sasaran.
export const IRO_PD_FIELD_INFO: Record<string, string> = {
  ...IRS_FIELD_INFO,
  'KEGIATAN PD': `Definisi: Kegiatan pada Renja/RKA Perangkat Daerah tahun berjalan, turunan dari Program PD — BUKAN input bebas, melainkan pilihan dari Kegiatan PD yang sudah dibuat di halaman III_a_KRO_PD.

Fungsinya dalam Risiko Operasional PD: Menjadi objek yang dilindungi => karena risiko operasional muncul ketika ada ancaman terhadap pelaksanaan/pencapaian target Kegiatan tersebut, sesuai Perdep PPKD No.4/2019 BPKP (objek risiko operasional = Renja OPD, disusun per Kegiatan).

Cara mengisi: pilih dari daftar dropdown, bukan mengetik teks baru. Jika Kegiatan yang dibutuhkan belum ada di daftar, tambahkan dulu di halaman III_a_KRO_PD.`,

  TAHAP: `Definisi: Tahapan pelaksanaan Kegiatan/Operasional di mana risiko bisa muncul (Perencanaan, Pengadaan, Pelaksanaan, Monitoring, Pelaporan).

Fungsi: Agar jelas risiko muncul di bagian mana dari alur kerja Kegiatan tersebut, sehingga Rencana Tindak Pengendalian bisa lebih tepat sasaran.

Contoh:
Tahap Perencanaan => risiko data dasar salah.
Tahap Pengadaan => risiko lelang gagal.
Tahap Pelaksanaan => risiko cuaca/hambatan teknis.
Tahap Monitoring => risiko keterlambatan pemantauan.
Tahap Pelaporan => risiko keterlambatan penyampaian laporan.`,
};
