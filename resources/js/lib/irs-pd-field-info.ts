import { IRS_FIELD_INFO } from '@/lib/irs-field-info';

// Info popover untuk form Tambah/Edit II_b_IRS_PD — identik dengan
// IRS_FIELD_INFO (IRS_Pemda), hanya field pertama diganti ke terminologi
// Sasaran Renstra PD (bukan Sasaran RPJMD Pemda).
export const IRS_PD_FIELD_INFO: Record<string, string> = {
  ...IRS_FIELD_INFO,
  'SASARAN RENSTRA': `Definisi: Sasaran Renstra adalah hasil spesifik yang ingin dicapai Perangkat Daerah dalam periode Renstra (5 tahun), turunan dari Sasaran RPJMD Pemda.

Fungsinya dalam Risiko Strategis PD: Menjadi objek yang dilindungi => karena risiko muncul ketika ada ancaman terhadap tercapainya Sasaran Strategis PD.

Setiap Sasaran Strategis PD harus dianalisis apakah ada potensi hambatan, ancaman, atau ketidakpastian yang bisa menggagalkan pencapaiannya.`,
};
