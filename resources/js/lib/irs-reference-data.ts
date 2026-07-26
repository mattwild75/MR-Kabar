// Kategori teks statis (BUKAN bagian dari 7 kategori data referensi yg
// dikelola Admin di Settings > Keterangan Pendukung — itu semua sudah
// pindah ke tabel DB, dibaca lewat RiskReferenceDataService, lihat
// riskReference prop di irs/Index.tsx dkk). Konstanta di bawah ini murni
// pilihan kategori tetap (5M, C/UC, dsb) yg memang tidak pernah diedit
// Admin, jadi wajar tetap sbg konstanta frontend.
//
// CATATAN: file ini SEBELUMNYA juga berisi ENTITAS_PENILAI_OPTIONS,
// KRITERIA_DAMPAK, KRITERIA_KEMUNGKINAN, dan MATRIKS_RISIKO — hardcode
// duplikat dari RiskEntitasPenilai/RiskImpactCriteria/
// RiskLikelihoodCriteria/RiskMatrixCell yg SUDAH tidak dipakai di mana pun
// (dikonfirmasi via grep, hanya definisi ini sendiri) — DIHAPUS krn jadi
// jebakan: kalau ada yg mengimpornya lagi di masa depan (nama exportnya
// masuk akal utk dipakai), bug "silently ignores Admin customization" yg
// sama persis dgn yg ditemukan di Cetak4.tsx bakal terulang. Sumber
// kebenaran utk keempatnya SEKARANG WAJIB lewat RiskReferenceDataService
// (backend) — jangan tambahkan lagi versi hardcode di sini.

// 7M + 1E (INTERNAL) — kerangka klasifikasi penyebab risiko internal
// (pengembangan dari 5M fishbone/Ishikawa klasik: Machine, Men, Material,
// Method, Money) dengan tambahan Management (kelemahan tata kelola/
// pengawasan) dan Measurement (kesalahan pengukuran/indikator), plus
// Environment (faktor lingkungan INTERNAL — kondisi fisik kantor/fasilitas
// kerja, BUKAN faktor lingkungan eksternal seperti bencana alam/cuaca yang
// sekarang masuk kategori "Environmental" PESTLE di bawah).
export const PENYEBAB_INTERNAL_KATEGORI = ['Men', 'Machine', 'Method', 'Material', 'Money', 'Management', 'Measurement', 'Environment'];

// PESTLE (EKSTERNAL) — kerangka klasifikasi penyebab risiko eksternal
// standar (Political, Economic, Social, Technological, Legal,
// Environmental), melengkapi 7M+1E internal supaya "Uraian Penyebab
// Risiko" bisa merepresentasikan sumber sebab dari luar organisasi secara
// terstruktur, bukan sekadar teks bebas seperti sebelumnya.
export const PENYEBAB_EKSTERNAL_KATEGORI = ['Political', 'Economic', 'Social', 'Technological', 'Legal', 'Environmental'];

// Gabungan Internal+Eksternal — dipakai MultiCategoryTextarea di form
// Uraian Penyebab Risiko (14 kategori total, ditampilkan berkelompok
// lewat groupLabels, lihat multi-category-textarea.tsx). Nama konstanta
// PENYEBAB_5M_KATEGORI DIPERTAHANKAN (bukan diganti/dihapus) krn dipakai
// luas sbg identifier di banyak file (irs/irs_pd/iro_pd/lapor-kejadian/
// Form10) — lihat penggunaannya, bukan namanya, utk daftar kategori aktual
// yg sekarang 14 item (7M+1E internal + PESTLE eksternal).
export const PENYEBAB_5M_KATEGORI = [...PENYEBAB_INTERNAL_KATEGORI, ...PENYEBAB_EKSTERNAL_KATEGORI];

// Header pemisah grup "INTERNAL"/"EKSTERNAL" utk MultiCategoryTextarea
// (prop groupLabels) — key = kategori PERTAMA di tiap grup (Men, Political),
// dipakai sekali di sini supaya kelima form (irs/irs_pd/iro_pd/
// lapor-kejadian/Form10) yg memakai PENYEBAB_5M_KATEGORI konsisten,
// tidak perlu didefinisikan ulang di tiap file.
export const PENYEBAB_GROUP_LABELS: Record<string, string> = {
  [PENYEBAB_INTERNAL_KATEGORI[0]]: 'Internal',
  [PENYEBAB_EKSTERNAL_KATEGORI[0]]: 'Eksternal',
};

// Alias ejaan lama utk data yg SUDAH tersimpan sebelum kategori ini resmi
// dipakai di form (mis. banyak OPD menulis "Man" alih-alih "Men" — typo
// yg terlanjur konsisten dipakai di puluhan baris data 2025). HANYA
// dipakai utk membaca/mengenali data lama (badge tabel, Form Cetak,
// migrasi) — form input BARU tetap cuma menampilkan kategori resmi di
// PENYEBAB_INTERNAL_KATEGORI/PENYEBAB_EKSTERNAL_KATEGORI, bukan alias-nya.
export const PENYEBAB_KATEGORI_ALIASES: Record<string, string> = {
  Man: 'Men',
};

// Suffix "- Int"/"- Eks" yg ditempel ke label kategori saat disimpan (mis.
// "Method - Int (uraian)", "Legal - Eks (uraian)") — supaya asal Internal/
// Eksternal tiap penyebab eksplisit tertulis di data itu sendiri (bukan cuma
// tersirat dari posisi grup di form), dan field "SUMBER SEBAB RISIKO" bisa
// dihitung otomatis dari sini alih-alih diisi checkbox terpisah. Dipakai
// MultiCategoryTextarea via prop `categorySuffix`.
export function penyebabKategoriSuffix(kategori: string): string {
  return PENYEBAB_INTERNAL_KATEGORI.includes(kategori) ? '- Int' : '- Eks';
}

// Hitung "SUMBER SEBAB RISIKO" (Internal / Eksternal / Internal dan
// Eksternal) dari isi "URAIAN PENYEBAB RISIKO" — dipakai form irs/irs_pd/
// iro_pd supaya field itu tidak lagi diisi manual, cukup tersirat dari
// kategori 7M+1E/PESTLE apa saja yg dicentang.
export function computeSumberSebabRisiko(uraianPenyebabRisiko: string): string {
  const text = uraianPenyebabRisiko ?? '';
  const hasInternal = PENYEBAB_INTERNAL_KATEGORI.some((k) => text.includes(`${k} - Int (`) || text.includes(`${k} - Int;`) || text.endsWith(`${k} - Int`));
  const hasEksternal = PENYEBAB_EKSTERNAL_KATEGORI.some((k) => text.includes(`${k} - Eks (`) || text.includes(`${k} - Eks;`) || text.endsWith(`${k} - Eks`));
  if (hasInternal && hasEksternal) return 'Internal dan Eksternal';
  if (hasInternal) return 'Internal';
  if (hasEksternal) return 'Eksternal';
  return '';
}

export const C_UC_OPTIONS = ['C', 'UC'];

// Kategori efektivitas kontrol 4-tingkat (urut dari terburuk ke terbaik):
// TE = Tidak Efektif, KE = Kurang Efektif, CE = Cukup Efektif, E = Efektif.
// Dipakai di 2 tempat berbeda — KATEGORI EXISTING CONTROL & KATEGORI
// PROYEKSI RTP di tabel risiko (dasar skala Residual & Target), dan
// kategori_existing_control_aktual di monitoring_rtp/Form 9 (hasil
// monitoring -> skala Aktual, DIPINDAH dari tabel risiko krn levelnya
// per-RTP, bukan per-risiko — lihat MonitoringEvaluasiController).
export const KATEGORI_EFEKTIVITAS_OPTIONS = ['TE', 'KE', 'CE', 'E'];

// Faktor reduksi Skala Kemungkinan per kategori efektivitas — dikalikan ke
// Skala Kemungkinan INHEREN (basis "tanpa kontrol"), dibulatkan
// Math.round(), clamp 1-5. DUPLIKAT SADAR dgn FAKTOR_REDUKSI_KONTROL di
// RiskReferenceDataService.php (backend = sumber kebenaran saat submit;
// nilai di sini hanya utk preview real-time di form) — kalau backend
// berubah, file ini WAJIB ikut diubah.
export const FAKTOR_REDUKSI_KONTROL: Record<string, number> = {
  TE: 1.0,
  KE: 0.8,
  CE: 0.6,
  E: 0.4,
};

/** K terkendali = round(K_inheren x faktor kategori), clamp 1-5 — mirror hitungKemungkinanTerkendali() backend. */
export function hitungKemungkinanTerkendali(kemungkinanInheren: number | null, kategori: string | null): number | null {
  return terapkanFaktorReduksi(kemungkinanInheren, kategori);
}

/** D terkendali = round(D_inheren x faktor kategori), clamp 1-5 — mirror hitungDampakTerkendali() backend, dipakai RTP Mitigate/Share-Transfer. */
export function hitungDampakTerkendali(dampakInheren: number | null, kategori: string | null): number | null {
  return terapkanFaktorReduksi(dampakInheren, kategori);
}

function terapkanFaktorReduksi(nilaiInheren: number | null, kategori: string | null): number | null {
  if (!nilaiInheren || nilaiInheren < 1 || nilaiInheren > 5) return null;
  const faktor = (kategori && FAKTOR_REDUKSI_KONTROL[kategori]) || 1.0;
  return Math.max(1, Math.min(5, Math.round(nilaiInheren * faktor)));
}

/**
 * Arah reduksi (K, D, atau keduanya) berdasarkan kategori RESPON RISIKO
 * pada RENCANA TINDAK PENGENDALIAN — mirror arahReduksiRtp() backend
 * (RiskReferenceDataService.php). 5 kategori COSO ERM (A-A-M-S-A): Avoid
 * menekan KEDUA sumbu (kegiatan sumber risiko dihentikan — lihat
 * irs-field-info.ts "Avoid ... hilang total" utk keduanya); Abate menekan
 * Kemungkinan saja (preventif); Mitigate/Share-Transfer menekan Dampak saja
 * (mitigatif/pengalihan); Accept/tidak dikenali TIDAK menekan sumbu manapun
 * (risiko residual diterima apa adanya, bukan fallback ke penekanan
 * Kemungkinan seperti versi sebelumnya).
 */
export function arahReduksiRtp(rencanaTindakPengendalian: string | null | undefined): { kemungkinan: boolean; dampak: boolean } {
  // Case-insensitive, sama seperti backend (mb_strtolower + str_contains) —
  // sebelumnya pencocokan di sini case-sensitive (hanya "Avoid" persis huruf
  // besar-kecilnya), sehingga preview real-time Skala Target di form bisa
  // beda dari nilai yang benar-benar dihitung & tersimpan backend saat teks
  // RTP ditulis dengan kapitalisasi berbeda (mis. "avoid" huruf kecil).
  const nilai = (rencanaTindakPengendalian ?? '').trim().toLowerCase();
  const avoid = nilai !== '' && nilai.includes('avoid');
  const keK = avoid || (nilai !== '' && nilai.includes('abate'));
  const keD = avoid || (nilai !== '' && (nilai.includes('mitigate') || nilai.includes('share/transfer')));

  return { kemungkinan: keK, dampak: keD };
}

/** Ambil kode kategori (TE/KE/CE/E) dari nilai tersimpan CategorizedTextarea "KODE (uraian)" atau bare "KODE". */
export function ekstrakKategoriKontrol(value: string | null | undefined): string | null {
  const v = (value ?? '').trim();
  if (!v) return null;
  for (const kategori of KATEGORI_EFEKTIVITAS_OPTIONS) {
    if (v === kategori || v.startsWith(`${kategori} (`)) return kategori;
  }
  return null;
}

// 5 jenis respon risiko (risk response) sesuai kerangka umum manajemen
// risiko (COSO/ISO 31000, diadopsi Perdep PPKD) — dipakai mengklasifikasi
// Rencana Tindak Pengendalian (RTP): Avoid (menghindari), Abate (mengurangi
// kemungkinan), Mitigate (mengurangi dampak), Share/Transfer (membagi
// beban dampak ke pihak lain), Accept (menerima apa adanya). Boleh pilih
// lebih dari 1 kategori sekaligus (mis. RTP yang dirancang gabungan Abate +
// Mitigate) karena satu RTP bisa menyasar frekuensi & dampak sekaligus
// secara parsial (beda dari Avoid yang menghilangkan keduanya secara total).
export const RESPON_RISIKO_KATEGORI = ['Avoid', 'Abate', 'Mitigate', 'Share/Transfer', 'Accept'];

// Kategori penilaian efektivitas existing control — DIPERLUAS dari 3
// (E/KE/TE) ke 4 tingkat (tambah CE=Cukup Efektif) mengikuti tabel faktor
// reduksi di atas; alias ke KATEGORI_EFEKTIVITAS_OPTIONS supaya kedua nama
// tetap valid di semua pemakai lama. Data lama berlabel "KE" TIDAK
// dimigrasi otomatis (tetap KE = faktor 0.8) — petugas review manual bila
// yang dimaksud sebenarnya CE (0.6).
export const KATEGORI_EXISTING_CONTROL_OPTIONS = KATEGORI_EFEKTIVITAS_OPTIONS;

// ENTITAS_PENILAI_OPTIONS, KRITERIA_DAMPAK, KRITERIA_KEMUNGKINAN, dan
// MATRIKS_RISIKO (hardcode) SUDAH DIHAPUS dari file ini — sumber kebenaran
// sekarang tabel DB RiskEntitasPenilai/RiskImpactCriteria/
// RiskLikelihoodCriteria/RiskMatrixCell, dibaca lewat
// RiskReferenceDataService (backend) dan dikirim sbg prop `riskReference`
// dari controller ke halaman React yg butuh (lihat irs/Index.tsx,
// irs_pd/Index.tsx, iro_pd/Index.tsx). JANGAN tambahkan lagi versi
// hardcode di sini — kalau butuh salah satu data itu di halaman baru,
// minta controller mengirim `riskReference`/`riskLevels` sbg prop, bukan
// impor dari file ini.
