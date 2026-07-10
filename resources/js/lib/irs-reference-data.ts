// Data referensi statis untuk dialog lookup di halaman I_b_IRS_Pemda —
// transkrip dari UserForm VBA (Jenis Risiko, Entitas Penilai Risiko,
// Kriteria Dampak, Kriteria Kemungkinan, Level Risiko / Matriks Analisis
// Risiko). Data ini tetap/tidak diedit pengguna, jadi disimpan sebagai
// konstanta di frontend, bukan tabel database terpisah.

export const SUMBER_SEBAB_RISIKO_KATEGORI = ['Internal', 'Eksternal', 'Internal dan Eksternal'];

export const C_UC_OPTIONS = ['C', 'UC'];

export const ENTITAS_PENILAI_OPTIONS = [
  'BADAN KEPEGAWAIAN DAN PENGEMBANGAN SUMBER DAYA MANUSIA',
  'BADAN KESATUAN BANGSA DAN POLITIK',
  'BADAN PENANGGULANGAN BENCANA DAERAH',
  'BADAN PENGELOLAAN KEUANGAN DAERAH',
  'BADAN PERENCANAAN PEMBANGUNAN DAERAH',
  'BLUD RSUD CUT NYAK DHIEN',
  'DINAS KELAUTAN DAN PERIKANAN',
  'DINAS KEPENDUDUKAN DAN PENCATATAN SIPIL',
  'DINAS KESEHATAN',
  'DINAS KOMUNIKASI INFORMATIKA DAN PERSANDIAN',
  'DINAS LINGKUNGAN HIDUP',
  'DINAS PANGAN',
  'DINAS PARIWISATA PEMUDA DAN OLAHRAGA',
  'DINAS PEKERJAAN UMUM DAN PENATAAN RUANG',
  'DINAS PEMBERDAYAAN MASYARAKAT DAN GAMPONG',
  'DINAS PEMBERDAYAAN PEREMPUAN PERLINDUNGAN ANAK DAN KELUARGA BERENCANA',
  'DINAS PENANAMAN MODAL DAN PELAYANAN TERPADU SATU PINTU',
  'DINAS PENDIDIKAN DAN KEBUDAYAAN',
  'DINAS PENDIDIKAN DAYAH',
  'DINAS PERDAGANGAN PERINDUSTRIAN KOPERASI DAN USAHA KECIL DAN MENENGAH',
  'DINAS PERHUBUNGAN',
  'DINAS PERKEBUNAN DAN PETERNAKAN',
  'DINAS PERPUSTAKAAN DAN KEARSIPAN',
  'DINAS PERTANAHAN',
  'DINAS PERTANIAN TANAMAN PANGAN DAN HORTIKULTURA',
  'DINAS PERUMAHAN RAKYAT DAN KAWASAN PERMUKIMAN',
  'DINAS SOSIAL',
  'DINAS SYARIAT ISLAM',
  'DINAS TRANSMIGRASI DAN TENAGA KERJA',
  'INSPEKTORAT',
  'KECAMATAN ARONGAN LAMBALEK',
  'KECAMATAN BUBON',
  'KECAMATAN JOHAN PAHLAWAN',
  'KECAMATAN KAWAY XVI',
  'KECAMATAN MEUREUBO',
  'KECAMATAN PANTE CEUREUMEN',
  'KECAMATAN PANTON REU',
  'KECAMATAN SAMATIGA',
  'KECAMATAN SUNGAI MAS',
  'KECAMATAN WOYLA',
  'KECAMATAN WOYLA BARAT',
  'KECAMATAN WOYLA TIMUR',
  'SATUAN POLISI PAMONG PRAJA DAN WILAYATUL HISBAH',
  'SEKRETARIAT BAITUL MAL KABUPATEN',
  'SEKRETARIAT DAERAH',
  'SEKRETARIAT DPRK',
  'SEKRETARIAT MAJELIS ADAT ACEH',
  'SEKRETARIAT MAJELIS PEMUSYAWARATAN ULAMA',
  'SEKRETARIAT MAJELIS PENDIDIKAN DAERAH',
];

export const KRITERIA_DAMPAK = [
  {
    area: 'Jumlah Kerugian Negara / Daerah',
    levels: ['< Rp 10.000.000', '> Rp10.000.000 s.d. Rp50.000.000', '> Rp50.000.000 s.d. Rp100.000.000', '> Rp100.000.000 s.d. Rp500.000.000', '> Rp 500.000.000'],
  },
  {
    area: 'Penurunan Reputasi',
    levels: [
      'Keluhan Stakeholder Secara Lisan / Tulisan ke Organisasi, ≥ 3 Kali Dalam Satu Periode',
      'Keluhan Stakeholder Secara Lisan / Tulisan ke Organisasi, > 3 Kali Dalam Satu Periode',
      'Pemberitaan Negatif di Media Massa Lokal',
      'Pemberitaan Negatif di Media Massa Nasional',
      'Pemberitaan Negatif di Media Massa Internasional',
    ],
  },
  {
    area: 'Penurunan Kinerja',
    levels: ['Pencapaian Target Kinerja ≥ 100%', 'Pencapaian Target Kinerja diatas 80% s.d 100%', 'Pencapaian Target Kinerja diatas 50% s.d 80%', 'Pencapaian Target Kinerja diatas 25% s.d 50%', 'Pencapaian Target Kinerja < 25%'],
  },
  {
    area: 'Gangguan Terhadap Pelayanan',
    levels: ['Pelayanan Tertunda ≤ 1 Hari', 'Pelayanan Tertunda diatas 1 Hari s.d 5 hari', 'Pelayanan Tertunda diatas 5 Hari s.d 15 Hari', 'Pelayanan Tertunda diatas 15 Hari s.d 30 Hari', 'Pelayanan Tertunda Lebih Dari 30 Hari'],
  },
  {
    area: 'Jumlah Tuntutan Hukum',
    levels: ['≤ 5 Kali Dalam Satu Periode', 'Diatas 5 Kali s.d 15 Kali Dalam Satu Periode', 'Diatas 15 Kali s.d 30 Kali Dalam Satu Periode', 'Diatas 30 Kali s.d 50 Kali Dalam Satu Periode', 'Diatas 50 Kali Dalam Satu Periode'],
  },
];

export const KRITERIA_KEMUNGKINAN = [
  { level: 1, nama: 'Hampir Tidak Terjadi', probabilitas: 'Terjadi Kurang dari 5% dari Kejadian Transaksi', frekuensi: 'Terjadi Sangat Jarang, Kurang Dari 2 Kali', toleransi: '1 Kejadian dalam 5 Tahun Terakhir' },
  { level: 2, nama: 'Jarang Terjadi', probabilitas: 'Terjadi Antara 5% s.d 10% dari Kejadian Transaksi', frekuensi: 'Terjadi Jarang, Kurang 2 Kali s.d 10 Kali', toleransi: '1 Kejadian dalam 4 Tahun Terakhir' },
  { level: 3, nama: 'Terjadi', probabilitas: 'Terjadi Antara 10% s.d 20% dari Kejadian Transaksi', frekuensi: 'Terjadi Cukup Sering, Kurang 10 Kali s.d 18 Kali', toleransi: '1 Kejadian dalam 3 Tahun Terakhir' },
  { level: 4, nama: 'Sering Terjadi', probabilitas: 'Terjadi Antara 20% s.d 50% dari Kejadian Transaksi', frekuensi: 'Terjadi Sering, Kurang 18 Kali s.d 26 Kali', toleransi: '1 Kejadian dalam 2 Tahun Terakhir' },
  { level: 5, nama: 'Hampir Pasti Terjadi', probabilitas: 'Terjadi Lebih Dari 50% Kejadian Transaksi', frekuensi: 'Terjadi Sangat Sering, Lebih Dari 26 Kali', toleransi: '1 Kejadian dalam 1 Tahun Terakhir' },
];

const DAMPAK_LABELS = ['Tidak Signifikan', 'Minor', 'Moderat', 'Signifikan', 'Sangat Signifikan'];
const KEMUNGKINAN_LABELS = ['Hampir Tidak Terjadi', 'Jarang Terjadi', 'Terjadi', 'Sering Terjadi', 'Hampir Pasti Terjadi'];

// [dampak-1][kemungkinan-1] => skala risiko (sama dengan matriks di backend)
const SKALA_RISIKO_MATRIX = [
  [1, 2, 4, 6, 9],
  [3, 7, 10, 12, 15],
  [5, 11, 14, 16, 18],
  [8, 13, 17, 19, 23],
  [20, 21, 22, 24, 25],
];

function warnaForSkala(skala: number): string {
  if (skala >= 20) return 'bg-red-500 text-white';
  if (skala >= 16) return 'bg-orange-400 text-white';
  if (skala >= 11) return 'bg-yellow-300';
  if (skala >= 6) return 'bg-green-400';
  return 'bg-sky-400 text-white';
}

export const MATRIKS_RISIKO = {
  dampakLabels: DAMPAK_LABELS,
  kemungkinanLabels: KEMUNGKINAN_LABELS,
  matrix: SKALA_RISIKO_MATRIX,
  warnaForSkala,
};
